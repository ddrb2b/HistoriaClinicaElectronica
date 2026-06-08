"""
<<<<<<< HEAD
seed.py — Carga 100 pacientes de prueba en MongoDB
Ejecutar con: docker exec -it backend python seed.py
"""
from pymongo import MongoClient
import os, random
from datetime import date, timedelta
=======
seed.py — Carga datos de prueba en MongoDB
Ejecutar con: docker exec -it backend python seed.py
"""
from pymongo import MongoClient
import os
>>>>>>> 960fdbd05eccac84e1b71e81ff9593831f8122fa

MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongodb:27017/")
client = MongoClient(MONGO_URL)
db = client["clinica"]

db.pacientes.drop()

<<<<<<< HEAD
# ── Datos base ────────────────────────────────────────────────────────────────
NOMBRES_F = ["María", "Ana", "Carmen", "Rosa", "Laura", "Patricia", "Sofía",
             "Isabel", "Lucía", "Elena", "Valentina", "Gabriela", "Andrea",
             "Natalia", "Claudia", "Diana", "Fernanda", "Paola", "Mónica",
             "Cristina", "Alicia", "Beatriz", "Miriam", "Cecilia", "Yolanda"]

NOMBRES_M = ["José", "Carlos", "Juan", "Luis", "Miguel", "Pedro", "Rafael",
             "Manuel", "Antonio", "Roberto", "Fernando", "Eduardo", "Héctor",
             "Ramón", "Alejandro", "David", "Daniel", "Jorge", "Mario",
             "Francisco", "Ángel", "Víctor", "Pablo", "Ricardo", "Sergio"]

APELLIDOS = ["García", "Martínez", "López", "Rodríguez", "Hernández", "Pérez",
             "Sánchez", "Ramírez", "Torres", "Flores", "Rivera", "Gómez",
             "Díaz", "Reyes", "Cruz", "Morales", "Ortiz", "Gutiérrez",
             "Núñez", "Medina", "Castillo", "Jiménez", "Vargas", "Fernández",
             "Abreu", "Pimentel", "Noboa", "Marte", "Cabral", "Almonte",
             "Taveras", "Concepción", "Espinal", "Feliz", "Peguero", "Rosario"]

CIUDADES = ["Santiago", "Santo Domingo", "La Vega", "San Francisco de Macorís",
            "Puerto Plata", "Moca", "Bonao", "San Pedro de Macorís",
            "La Romana", "Higüey", "Barahona", "Azua"]

ALERGIAS_POOL = ["Penicilina", "Ibuprofeno", "Aspirina", "Sulfonamidas",
                 "Tetraciclina", "Codeína", "Látex", "Polen", "Mariscos", "Nueces"]

ANTECEDENTES_POOL = ["Hipertensión", "Diabetes tipo 2", "Asma", "Cardiopatía isquémica",
                     "Hipotiroidismo", "Obesidad", "Artritis reumatoide", "Epilepsia",
                     "Depresión", "Ansiedad", "Gastritis crónica", "Anemia",
                     "Insuficiencia renal leve", "Migraña crónica", "EPOC"]

DOCTORES = ["Dr. José Pérez", "Dra. Ana Martínez", "Dr. Miguel Torres",
            "Dra. Carmen Vargas", "Dr. Luis Abreu", "Dra. Patricia Medina"]

DIAGNOSTICOS = [
    ("Gripe", "Acetaminofén 500mg", "Tomar cada 8 horas por 5 días"),
    ("Faringitis bacteriana", "Amoxicilina 500mg", "Cada 8 horas por 7 días"),
    ("Hipertensión arterial", "Losartán 50mg", "Una pastilla diaria en ayunas"),
    ("Diabetes tipo 2", "Metformina 850mg", "Tomar dos veces al día con las comidas"),
    ("Gastritis", "Omeprazol 20mg", "30 minutos antes del desayuno"),
    ("Infección urinaria", "Ciprofloxacina 500mg", "Cada 12 horas por 7 días"),
    ("Bronquitis aguda", "Azitromicina 500mg", "Una vez al día por 5 días"),
    ("Migraña", "Sumatriptán 50mg", "Al inicio del dolor, máx 2 dosis al día"),
    ("Conjuntivitis bacteriana", "Tobramicina colirio", "2 gotas cada 4 horas"),
    ("Lumbalgia", "Naproxeno 500mg + fisioterapia", "Cada 12 horas con comida"),
    ("Anemia ferropénica", "Sulfato ferroso 325mg", "Una pastilla diaria"),
    ("Hipotiroidismo", "Levotiroxina 50mcg", "En ayunas, 30 min antes del desayuno"),
    ("Control cardiovascular", "Atorvastatina 40mg + Enalapril 10mg", "Tomar diariamente"),
    ("Dermatitis atópica", "Hidrocortisona crema 1%", "Aplicar 2 veces al día"),
    ("Crisis asmática leve", "Salbutamol inhalador", "2 puffs cada 4-6 horas en crisis"),
    ("Otitis media", "Amoxicilina-Clavulánico 875mg", "Cada 12 horas por 10 días"),
    ("Sinusitis aguda", "Amoxicilina 875mg", "Cada 12 horas por 10 días"),
    ("Reflujo gastroesofágico", "Esomeprazol 40mg", "Una vez al día antes de dormir"),
    ("Artritis", "Ibuprofeno 400mg + reposo", "Cada 8 horas con comida"),
    ("Control prenatal", "Ácido fólico 5mg + hierro", "Diariamente"),
]

ANALISIS_POOL = [
    ("Hemograma completo", "Normal"),
    ("Glucosa en ayunas", "92 mg/dL - Normal"),
    ("Glucosa en ayunas", "118 mg/dL - Prediabetes"),
    ("Hemoglobina glicosilada (HbA1c)", "6.8% - Diabetes controlada"),
    ("Perfil lipídico", "Colesterol 185 mg/dL - Normal"),
    ("Perfil lipídico", "Colesterol 240 mg/dL - Elevado"),
    ("Creatinina sérica", "0.9 mg/dL - Normal"),
    ("Urinálisis", "Sin hallazgos patológicos"),
    ("Urinálisis", "Leucocituria - Infección urinaria"),
    ("TSH", "2.1 mUI/L - Normal"),
    ("TSH", "8.5 mUI/L - Hipotiroidismo"),
    ("Radiografía de tórax", "Sin infiltrados - Normal"),
    ("Electrocardiograma (ECG)", "Ritmo sinusal normal"),
    ("Troponina", "Negativo"),
    ("Cultivo de garganta", "Streptococcus positivo"),
    ("Espirometría", "FEV1 82% - Dentro de límites normales"),
    ("Ferritina sérica", "8 ng/mL - Anemia ferropénica"),
    ("Proteína C reactiva (PCR)", "2.1 mg/L - Normal"),
    ("Proteína C reactiva (PCR)", "45 mg/L - Elevada, proceso inflamatorio"),
    ("Bilirrubina total", "0.8 mg/dL - Normal"),
]

# ── Utilidades ────────────────────────────────────────────────────────────────
def rand_date(start_year=1950, end_year=2005):
    start = date(start_year, 1, 1)
    end = date(end_year, 12, 31)
    return (start + timedelta(days=random.randint(0, (end - start).days))).isoformat()

def rand_consult_dates(n):
    base = date(2026, 6, 7)
    return sorted(
        [(base - timedelta(days=random.randint(0, 540))).isoformat() for _ in range(n)],
        reverse=True
    )

def make_cedula(i):
    return f"{40200000000 + (i * 137 + 31) % 99999999:011d}"

def telefono():
    return f"{random.choice(['809','829','849'])}{random.randint(1000000,9999999)}"

# ── Generar 100 pacientes ─────────────────────────────────────────────────────
random.seed(42)
pacientes = []
used_cedulas = set()

for i in range(100):
    genero = "F" if i % 2 == 0 else "M"
    nombre = random.choice(NOMBRES_F if genero == "F" else NOMBRES_M)
    nombre_completo = f"{nombre} {random.choice(APELLIDOS)} {random.choice(APELLIDOS)}"

    c = make_cedula(i)
    while c in used_cedulas:
        c = f"{int(c) + 1:011d}"
    used_cedulas.add(c)

    alergias = random.sample(ALERGIAS_POOL, random.choices([0,1,2], weights=[55,35,10])[0])
    antecedentes = random.sample(ANTECEDENTES_POOL, random.choices([0,1,2,3], weights=[40,35,18,7])[0])

    fechas_c = rand_consult_dates(random.randint(1, 5))
    consultas = []
    for fc in fechas_c:
        diag, trat, receta = random.choice(DIAGNOSTICOS)
        consultas.append({
            "fecha": fc,
            "doctor": random.choice(DOCTORES),
            "diagnostico": diag,
            "tratamiento": trat,
            "receta": receta,
        })

    analisis = []
    for _ in range(random.randint(0, 3)):
        tipo, resultado = random.choice(ANALISIS_POOL)
        fecha_a = (date(2026, 6, 7) - timedelta(days=random.randint(0, 360))).isoformat()
        analisis.append({"tipo": tipo, "fecha": fecha_a, "resultado": resultado})

    alertas = [f"Paciente alérgico a {a}" for a in alergias]
    for ant in antecedentes:
        if ant == "Cardiopatía isquémica":
            alertas.append(f"Antecedente de {ant} — precaución con AINEs")
        elif ant == "Asma":
            alertas.append("Antecedente de asma — evitar betabloqueadores")
        elif ant == "Diabetes tipo 2":
            alertas.append("Paciente diabético — monitorear glucosa")

    pacientes.append({
        "_id": f"PAC{i+1:03d}",
        "cedula": c,
        "nombre": nombre_completo,
        "fecha_nacimiento": rand_date(),
        "telefono": telefono(),
        "direccion": f"{random.choice(CIUDADES)}, República Dominicana",
        "alergias": alergias,
        "antecedentes_medicos": antecedentes,
        "consultas": consultas,
        "analisis_clinicos": analisis,
        "alertas_medicas": alertas,
    })

result = db.pacientes.insert_many(pacientes)
print(f"✅ {len(result.inserted_ids)} pacientes insertados correctamente.")

total_consultas = sum(len(p["consultas"]) for p in pacientes)
con_alergias    = sum(1 for p in pacientes if p["alergias"])
con_antecedentes = sum(1 for p in pacientes if p["antecedentes_medicos"])
print(f"   Consultas totales  : {total_consultas}")
print(f"   Con alergias       : {con_alergias}")
print(f"   Con antecedentes   : {con_antecedentes}")
print(f"   Sin alergias       : {100 - con_alergias}")
=======
pacientes = [
    {
        "_id": "PAC001",
        "cedula": "40212345678",
        "nombre": "María López",
        "fecha_nacimiento": "1995-04-12",
        "telefono": "8095551234",
        "direccion": "Santiago, República Dominicana",
        "alergias": ["Penicilina", "Ibuprofeno"],
        "antecedentes_medicos": ["Hipertensión"],
        "consultas": [
            {
                "fecha": "2026-06-01",
                "doctor": "Dr. José Pérez",
                "diagnostico": "Gripe",
                "tratamiento": "Acetaminofén",
                "receta": "Tomar cada 8 horas por 5 días"
            },
            {
                "fecha": "2026-05-10",
                "doctor": "Dra. Ana Martínez",
                "diagnostico": "Control de hipertensión",
                "tratamiento": "Losartán 50mg",
                "receta": "Una pastilla diaria en ayunas"
            }
        ],
        "analisis_clinicos": [
            {"tipo": "Hemograma", "fecha": "2026-05-28", "resultado": "Normal"},
            {"tipo": "Glucosa", "fecha": "2026-05-28", "resultado": "95 mg/dL - Normal"}
        ],
        "alertas_medicas": ["Paciente alérgico a Penicilina", "Paciente alérgico a Ibuprofeno"]
    },
    {
        "_id": "PAC002",
        "cedula": "00112987654",
        "nombre": "Carlos Ramírez",
        "fecha_nacimiento": "1980-11-30",
        "telefono": "8091234567",
        "direccion": "Santiago, República Dominicana",
        "alergias": [],
        "antecedentes_medicos": ["Diabetes tipo 2", "Obesidad"],
        "consultas": [
            {
                "fecha": "2026-06-03",
                "doctor": "Dr. José Pérez",
                "diagnostico": "Control diabetes",
                "tratamiento": "Metformina 850mg",
                "receta": "Tomar dos veces al día con las comidas"
            }
        ],
        "analisis_clinicos": [
            {"tipo": "Hemoglobina glicosilada (HbA1c)", "fecha": "2026-06-01", "resultado": "7.2% - Aceptable"},
            {"tipo": "Perfil lipídico", "fecha": "2026-06-01", "resultado": "Colesterol 210 mg/dL - Elevado"}
        ],
        "alertas_medicas": ["Paciente diabético — monitorear glucosa"]
    },
    {
        "_id": "PAC003",
        "cedula": "22334455667",
        "nombre": "Laura Fernández",
        "fecha_nacimiento": "2002-07-15",
        "telefono": "8097778899",
        "direccion": "La Vega, República Dominicana",
        "alergias": ["Aspirina"],
        "antecedentes_medicos": [],
        "consultas": [
            {
                "fecha": "2026-06-05",
                "doctor": "Dra. Ana Martínez",
                "diagnostico": "Faringitis bacteriana",
                "tratamiento": "Amoxicilina 500mg",
                "receta": "Cada 8 horas por 7 días"
            }
        ],
        "analisis_clinicos": [
            {"tipo": "Cultivo de garganta", "fecha": "2026-06-04", "resultado": "Streptococcus positivo"}
        ],
        "alertas_medicas": ["Paciente alérgico a Aspirina"]
    },
    {
        "_id": "PAC004",
        "cedula": "99887766554",
        "nombre": "Roberto Sánchez",
        "fecha_nacimiento": "1960-02-20",
        "telefono": "8096543210",
        "direccion": "Santiago, República Dominicana",
        "alergias": ["Penicilina", "Sulfonamidas"],
        "antecedentes_medicos": ["Cardiopatía isquémica", "Hipertensión"],
        "consultas": [
            {
                "fecha": "2026-05-20",
                "doctor": "Dr. José Pérez",
                "diagnostico": "Revisión cardiovascular",
                "tratamiento": "Atorvastatina 40mg + Enalapril 10mg",
                "receta": "Tomar diariamente, consulta en 3 meses"
            },
            {
                "fecha": "2026-04-10",
                "doctor": "Dr. Miguel Torres",
                "diagnostico": "Dolor torácico atípico",
                "tratamiento": "ECG — descartado infarto",
                "receta": "Reposo, evitar esfuerzos"
            }
        ],
        "analisis_clinicos": [
            {"tipo": "ECG", "fecha": "2026-05-19", "resultado": "Ritmo sinusal normal"},
            {"tipo": "Troponina", "fecha": "2026-04-10", "resultado": "Negativo"}
        ],
        "alertas_medicas": [
            "Paciente alérgico a Penicilina",
            "Paciente alérgico a Sulfonamidas",
            "Antecedente de cardiopatía isquémica — precaución con AINEs"
        ]
    },
    {
        "_id": "PAC005",
        "cedula": "11223344556",
        "nombre": "Patricia Díaz",
        "fecha_nacimiento": "1990-09-08",
        "telefono": "8094567890",
        "direccion": "Moca, Espaillat",
        "alergias": [],
        "antecedentes_medicos": ["Asma leve"],
        "consultas": [
            {
                "fecha": "2026-06-06",
                "doctor": "Dra. Ana Martínez",
                "diagnostico": "Crisis asmática leve",
                "tratamiento": "Salbutamol inhalador",
                "receta": "2 puffs cada 4-6 horas durante crisis"
            }
        ],
        "analisis_clinicos": [
            {"tipo": "Espirometría", "fecha": "2026-06-05", "resultado": "FEV1 78% — Obstrucción leve"}
        ],
        "alertas_medicas": ["Antecedente de asma — evitar betabloqueadores"]
    }
]

result = db.pacientes.insert_many(pacientes)
print(f"✅ {len(result.inserted_ids)} pacientes insertados correctamente.")
print("Pacientes disponibles:")
for p in db.pacientes.find({}, {"nombre": 1, "cedula": 1, "_id": 0}):
    print(f"  - {p['nombre']} (Cédula: {p['cedula']})")
>>>>>>> 960fdbd05eccac84e1b71e81ff9593831f8122fa
