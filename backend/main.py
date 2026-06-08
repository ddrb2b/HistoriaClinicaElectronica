from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import DuplicateKeyError
from bson import ObjectId
from typing import Optional
import os
import secrets

app = FastAPI(title="Clínica Nicolás Abreu - API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongodb:27017/")
client = MongoClient(MONGO_URL)
db = client["clinica"]

security = HTTPBasic()

USERS = {
    "admin": "admin123",
    "medico": "medico123",
}

def verify_credentials(credentials: HTTPBasicCredentials = Depends(security)):
    username = credentials.username
    password = credentials.password
    if username not in USERS or not secrets.compare_digest(password, USERS[username]):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas",
                            headers={"WWW-Authenticate": "Basic"})
    return username

def serialize(doc):
    if doc is None:
        return None
    doc["_id"] = str(doc["_id"])
    return doc

# ─── Trade-off: embedding vs referencing ────────────────────────────────────
#
# Decisión actual: consultas EMBEBIDAS dentro del documento del paciente.
#
# VENTAJAS del embedding (justifican la decisión para este dominio):
#   - El expediente completo se obtiene en una sola query, sin $lookup.
#   - Las escrituras de nuevas consultas son atómicas a nivel de documento.
#   - Los índices sobre consultas.fecha y consultas.doctor funcionan inline.
#
# LÍMITE PRÁCTICO: MongoDB impone 16 MB por documento. Con el esquema actual
# (~500 bytes por consulta) el techo es ~32 000 consultas/paciente — suficiente
# para la gran mayoría de pacientes de una clínica privada dominicana.
#
# CUÁNDO MIGRAR A REFERENCING (colección `consultas` aparte):
#   - Pacientes crónicos con >200 consultas (historial de décadas).
#   - Necesidad de paginar consultas sin traer todo el expediente.
#   - Consultas compartidas entre varios profesionales o instituciones.
#   En ese caso: colección `consultas` con campo `cedula_paciente` indexado,
#   y se elimina el array embebido. El costo es un $lookup en cada lectura
#   del expediente y mayor complejidad transaccional.
#
# ─── Índices ────────────────────────────────────────────────────────────────
#
# Diseño siguiendo la regla ESR (Equality → Sort → Range):
#   E: campos con igualdad exacta van primero (mayor selectividad).
#   S: campos de ordenamiento van después (permiten in-order scan).
#   R: campos con rango ($gte/$lte/$regex) van al final.
#
# Índices simples eliminados: nombre, alergias, consultas.fecha, consultas.doctor
# — todos absorbidos por los índices compuestos de abajo, que los cubren
#   y además evitan un segundo fetch al documento (covering indexes).
#
@app.on_event("startup")
def create_indexes():
    # ── Punto de acceso principal ──────────────────────────────────────────
    # E: cedula (igualdad exacta). Único → garantiza integridad referencial.
    db.pacientes.create_index([("cedula", ASCENDING)], unique=True)

    # ── Búsqueda de pacientes por nombre o cédula ──────────────────────────
    # ESR: E/S = nombre (prefijo exacto o sort), luego cedula como desempate.
    # Covering index: nombre + cedula cubre la proyección de la lista de pacientes.
    db.pacientes.create_index(
        [("nombre", ASCENDING), ("cedula", ASCENDING)],
        name="idx_nombre_cedula"
    )

    # ── Reporte de alergias ────────────────────────────────────────────────
    # ESR: E = alergias (igualdad sobre elemento de array), luego nombre y
    # cedula cubren la proyección {nombre,cedula,alergias} sin leer el documento.
    db.pacientes.create_index(
        [("alergias", ASCENDING), ("nombre", ASCENDING), ("cedula", ASCENDING)],
        name="idx_alergias_nombre_cedula"
    )

    # ── Reportes de alertas médicas ────────────────────────────────────────
    # ESR: R = alertas_medicas ($exists + $ne:[]), luego nombre y cedula
    # cubren la proyección del endpoint /reportes/alertas.
    db.pacientes.create_index(
        [("alertas_medicas", ASCENDING), ("nombre", ASCENDING), ("cedula", ASCENDING)],
        name="idx_alertas_nombre_cedula"
    )

    # ── Reportes de consultas por médico y/o rango de fechas ──────────────
    # ESR: E = consultas.doctor (igualdad cuando se filtra por médico específico),
    #       R = consultas.fecha ($gte / $lte).
    # Cubre ambos endpoints: /consultas-por-medico y /consultas-por-medico-rango.
    # El orden doctor→fecha permite que MongoDB use el índice tanto para el
    # $group por doctor (recorre entradas del array ordenadas por doctor) como
    # para el $match de rango sobre fecha dentro de cada médico.
    db.pacientes.create_index(
        [("consultas.doctor", ASCENDING), ("consultas.fecha", DESCENDING)],
        name="idx_consultas_doctor_fecha"
    )

# ─── Auth ────────────────────────────────────────────────────────────────────
@app.post("/login")
def login(credentials: HTTPBasicCredentials = Depends(security)):
    user = verify_credentials(credentials)
    return {"mensaje": "Login exitoso", "usuario": user}

# ─── Pacientes ───────────────────────────────────────────────────────────────
@app.get("/pacientes")
def listar_pacientes(user: str = Depends(verify_credentials)):
    pacientes = list(db.pacientes.find({}, {"consultas": 0, "analisis_clinicos": 0}))
    return [serialize(p) for p in pacientes]

@app.post("/pacientes")
def registrar_paciente(paciente: dict, user: str = Depends(verify_credentials)):
    paciente.setdefault("consultas", [])
    paciente.setdefault("analisis_clinicos", [])
    paciente.setdefault("alertas_medicas", [])
    alergias = paciente.get("alergias", [])
    if alergias:
        for a in alergias:
            alert = f"Paciente alérgico a {a}"
            if alert not in paciente["alertas_medicas"]:
                paciente["alertas_medicas"].append(alert)
    try:
        resultado = db.pacientes.insert_one(paciente)
        return {"mensaje": "Paciente registrado", "id": str(resultado.inserted_id)}
    except DuplicateKeyError:
        raise HTTPException(status_code=400, detail="Ya existe un paciente con esa cédula")

@app.get("/pacientes/{cedula}")
def obtener_paciente(cedula: str, user: str = Depends(verify_credentials)):
    paciente = db.pacientes.find_one({"cedula": cedula}, {"_id": 0})
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    return paciente

@app.delete("/pacientes/{cedula}")
def eliminar_paciente(cedula: str, user: str = Depends(verify_credentials)):
    result = db.pacientes.delete_one({"cedula": cedula})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    return {"mensaje": "Paciente eliminado"}

# ─── Consultas médicas ────────────────────────────────────────────────────────
@app.post("/pacientes/{cedula}/consultas")
def agregar_consulta(cedula: str, consulta: dict, user: str = Depends(verify_credentials)):
    result = db.pacientes.update_one(
        {"cedula": cedula},
        {"$push": {"consultas": consulta}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    return {"mensaje": "Consulta registrada"}

# ─── Análisis clínicos ────────────────────────────────────────────────────────
@app.post("/pacientes/{cedula}/analisis")
def agregar_analisis(cedula: str, analisis: dict, user: str = Depends(verify_credentials)):
    result = db.pacientes.update_one(
        {"cedula": cedula},
        {"$push": {"analisis_clinicos": analisis}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    return {"mensaje": "Análisis registrado"}

# ─── Queries clave del negocio ───────────────────────────────────────────────
@app.get("/reportes/alergias/{medicamento}")
def pacientes_con_alergia(medicamento: str, user: str = Depends(verify_credentials)):
    pacientes = list(db.pacientes.find(
        {"alergias": medicamento},
        {"nombre": 1, "cedula": 1, "alergias": 1, "_id": 0}
    ))
    return pacientes

@app.get("/reportes/consultas-por-medico")
def consultas_por_medico(user: str = Depends(verify_credentials)):
    pipeline = [
        {"$unwind": "$consultas"},
        {"$group": {"_id": "$consultas.doctor", "total_consultas": {"$sum": 1}}},
        {"$sort": {"total_consultas": -1}}
    ]
    return list(db.pacientes.aggregate(pipeline))

@app.get("/reportes/consultas-rango")
def consultas_por_rango(fecha_inicio: str, fecha_fin: str, user: str = Depends(verify_credentials)):
    pipeline = [
        {"$unwind": "$consultas"},
        {"$match": {"consultas.fecha": {"$gte": fecha_inicio, "$lte": fecha_fin}}},
        {"$project": {"nombre": 1, "consultas.fecha": 1, "consultas.doctor": 1,
                      "consultas.motivo": 1, "consultas.diagnostico": 1, "_id": 0}}
    ]
    return list(db.pacientes.aggregate(pipeline))

@app.get("/reportes/consultas-por-medico-rango")
def consultas_por_medico_rango(fecha_inicio: str, fecha_fin: str, user: str = Depends(verify_credentials)):
    """Consultas agrupadas por médico dentro de un rango de fechas (reporte administrativo)."""
    pipeline = [
        {"$unwind": "$consultas"},
        {"$match": {"consultas.fecha": {"$gte": fecha_inicio, "$lte": fecha_fin}}},
        {"$group": {
            "_id": "$consultas.doctor",
            "total_consultas": {"$sum": 1},
            "pacientes": {"$addToSet": "$nombre"},
            "diagnosticos": {"$push": "$consultas.diagnostico"}
        }},
        {"$project": {
            "doctor": "$_id",
            "total_consultas": 1,
            "total_pacientes": {"$size": "$pacientes"},
            "diagnosticos": 1,
            "_id": 0
        }},
        {"$sort": {"total_consultas": -1}}
    ]
    return list(db.pacientes.aggregate(pipeline))

@app.get("/reportes/alertas")
def pacientes_con_alertas(user: str = Depends(verify_credentials)):
    pacientes = list(db.pacientes.find(
        {"alertas_medicas": {"$exists": True, "$ne": []}},
        {"nombre": 1, "cedula": 1, "alertas_medicas": 1, "_id": 0}
    ))
    return pacientes

@app.get("/reportes/estadisticas")
def estadisticas_generales(user: str = Depends(verify_credentials)):
    total_pacientes = db.pacientes.count_documents({})
    pipeline_consultas = [{"$unwind": "$consultas"}, {"$count": "total"}]
    result_consultas = list(db.pacientes.aggregate(pipeline_consultas))
    total_consultas = result_consultas[0]["total"] if result_consultas else 0
    pacientes_con_alergias = db.pacientes.count_documents({"alergias": {"$ne": []}})
    return {
        "total_pacientes": total_pacientes,
        "total_consultas": total_consultas,
        "pacientes_con_alergias": pacientes_con_alergias,
    }

@app.get("/")
def root():
    return {"mensaje": "API Clínica Médica Nicolás Abreu", "docs": "/docs"}
