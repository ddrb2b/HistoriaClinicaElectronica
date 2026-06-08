"""
seed.py — Carga 100 pacientes de prueba en MongoDB
Ejecutar con: docker exec -it backend python seed.py
"""
from pymongo import MongoClient
import os, random
from datetime import date, timedelta

MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongodb:27017/")
client = MongoClient(MONGO_URL)
db = client["clinica"]

db.pacientes.drop()

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

# (motivo, diagnostico, tratamiento, receta)
CONSULTAS_POOL = [
    ("Fiebre y malestar general", "Gripe", "Acetaminofén 500mg", "Tomar cada 8 horas por 5 días"),
    ("Dolor de garganta", "Faringitis bacteriana", "Amoxicilina 500mg", "Cada 8 horas por 7 días"),
    ("Control de presión arterial", "Hipertensión arterial", "Losartán 50mg", "Una pastilla diaria en ayunas"),
    ("Control de glucosa", "Diabetes tipo 2", "Metformina 850mg", "Tomar dos veces al día con las comidas"),
    ("Dolor epigástrico", "Gastritis", "Omeprazol 20mg", "30 minutos antes del desayuno"),
    ("Ardor al orinar", "Infección urinaria", "Ciprofloxacina 500mg", "Cada 12 horas por 7 días"),
    ("Tos con expectoración", "Bronquitis aguda", "Azitromicina 500mg", "Una vez al día por 5 días"),
    ("Dolor de cabeza intenso", "Migraña", "Sumatriptán 50mg", "Al inicio del dolor, máx 2 dosis al día"),
    ("Ojo rojo con secreción", "Conjuntivitis bacteriana", "Tobramicina colirio", "2 gotas cada 4 horas"),
    ("Dolor lumbar", "Lumbalgia", "Naproxeno 500mg + fisioterapia", "Cada 12 horas con comida"),
    ("Cansancio y palidez", "Anemia ferropénica", "Sulfato ferroso 325mg", "Una pastilla diaria"),
    ("Chequeo de tiroides", "Hipotiroidismo", "Levotiroxina 50mcg", "En ayunas, 30 min antes del desayuno"),
    ("Control cardiovascular", "Control cardiovascular", "Atorvastatina 40mg + Enalapril 10mg", "Tomar diariamente"),
    ("Picazón en la piel", "Dermatitis atópica", "Hidrocortisona crema 1%", "Aplicar 2 veces al día"),
    ("Dificultad para respirar", "Crisis asmática leve", "Salbutamol inhalador", "2 puffs cada 4-6 horas en crisis"),
    ("Dolor de oído", "Otitis media", "Amoxicilina-Clavulánico 875mg", "Cada 12 horas por 10 días"),
    ("Congestión nasal y presión facial", "Sinusitis aguda", "Amoxicilina 875mg", "Cada 12 horas por 10 días"),
    ("Acidez y regurgitación", "Reflujo gastroesofágico", "Esomeprazol 40mg", "Una vez al día antes de dormir"),
    ("Dolor articular", "Artritis", "Ibuprofeno 400mg + reposo", "Cada 8 horas con comida"),
    ("Control prenatal", "Control prenatal", "Ácido fólico 5mg + hierro", "Diariamente"),
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
        motivo, diag, trat, receta = random.choice(CONSULTAS_POOL)
        consultas.append({
            "fecha": fc,
            "doctor": random.choice(DOCTORES),
            "motivo": motivo,
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
