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

# ─── Índices ────────────────────────────────────────────────────────────────
@app.on_event("startup")
def create_indexes():
<<<<<<< HEAD
    db.pacientes.create_index([("cedula", ASCENDING)], unique=True)
    db.pacientes.create_index([("nombre", ASCENDING)])
    db.pacientes.create_index([("alergias", ASCENDING)])
=======
    db.pacientes.create_index("cedula", unique=True)
    db.pacientes.create_index([("nombre", ASCENDING)])
    db.pacientes.create_index("alergias")
>>>>>>> 960fdbd05eccac84e1b71e81ff9593831f8122fa
    db.pacientes.create_index([("consultas.fecha", DESCENDING)])

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
                      "consultas.diagnostico": 1, "_id": 0}}
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
