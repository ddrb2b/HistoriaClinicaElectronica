"""
seed.py — Carga datos de prueba en MongoDB
Ejecutar con: docker exec -it backend python seed.py
"""
from pymongo import MongoClient
import os

MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongodb:27017/")
client = MongoClient(MONGO_URL)
db = client["clinica"]

db.pacientes.drop()

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
