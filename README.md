# 🏥 Clínica Médica Nicolás Abreu — Sistema de Historial Clínico Digital

Sistema de expedientes clínicos digitales desarrollado con **React.js + FastAPI + MongoDB**, containerizado con Docker.

---

## 🧱 Arquitectura

```
frontend  (React.js)       → http://localhost:3000
backend   (FastAPI/Python) → http://localhost:8000
mongodb   (MongoDB 7.0)    → localhost:27017
```

---

## ▶ Ejecución rápida

### Requisitos
- Docker Desktop instalado y corriendo
- Docker Compose v2+

### 1. Levantar todos los contenedores

```bash
docker-compose up --build
```

Esperar hasta ver en la terminal:
```
frontend  | Compiled successfully!
backend   | Application startup complete.
```

### 2. Cargar datos de prueba (seed)

En otra terminal:
```bash
docker exec -it backend python seed.py
```

Esto inserta **5 pacientes** con consultas, análisis y alertas médicas reales.

### 3. Acceder a la aplicación

| Servicio       | URL                          |
|----------------|------------------------------|
| Frontend       | http://localhost:3000        |
| API (Swagger)  | http://localhost:8000/docs   |

---

## 🔐 Credenciales de prueba

| Usuario | Contraseña |
|---------|------------|
| admin   | admin123   |
| medico  | medico123  |

---

## 📦 Funcionalidades

### Panel principal (Dashboard)
- Estadísticas: total pacientes, consultas, pacientes con alergias
- Alertas médicas activas del sistema

### Pacientes
- Listado con búsqueda por nombre o cédula
- Registro de nuevos pacientes con alergias y antecedentes
- Eliminación de pacientes

### Historial clínico (por paciente)
- Alertas de alergias visibles al abrir el expediente
- Historial de consultas médicas
- Resultados de análisis clínicos
- Registro de nuevas consultas y análisis

### Reportes
- Consultas por médico (aggregation pipeline)
- Pacientes con alertas activas
- Búsqueda de pacientes por alergia específica
- Consultas filtradas por rango de fechas

---

## 🍃 MongoDB — Queries del negocio

Conectarse al shell de MongoDB:
```bash
docker exec -it mongodb mongosh clinica
```

```js
// 1. Historial completo de un paciente
db.pacientes.find({ cedula: "40212345678" })

// 2. Pacientes con alergia a Penicilina
db.pacientes.find({ alergias: "Penicilina" }, { nombre: 1, alergias: 1 })

// 3. Consultas en un rango de fechas
db.pacientes.aggregate([
  { $unwind: "$consultas" },
  { $match: { "consultas.fecha": { $gte: "2026-06-01", $lte: "2026-06-30" } } },
  { $project: { nombre: 1, "consultas.fecha": 1, "consultas.doctor": 1, "consultas.diagnostico": 1 } }
])

// 4. Consultas por médico
db.pacientes.aggregate([
  { $unwind: "$consultas" },
  { $group: { _id: "$consultas.doctor", total_consultas: { $sum: 1 } } }
])

// 5. Análisis de un paciente
db.pacientes.find({ cedula: "40212345678" }, { nombre: 1, analisis_clinicos: 1 })

// 6. Pacientes con alertas médicas
db.pacientes.find(
  { alertas_medicas: { $exists: true, $ne: [] } },
  { nombre: 1, alertas_medicas: 1 }
)
```

---

## 🛑 Detener la aplicación

```bash
docker-compose down
```

Para eliminar también los datos de MongoDB:
```bash
docker-compose down -v
```

---

## 📁 Estructura del proyecto

```
clinica-nicolas-abreu/
├── backend/
│   ├── main.py          # FastAPI — endpoints REST
│   ├── seed.py          # Carga datos de prueba
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.js       # Aplicación React completa
│   │   └── index.js
│   ├── public/index.html
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 🛠 Tecnologías

| Capa       | Tecnología            |
|------------|-----------------------|
| Frontend   | React.js 18, Axios    |
| Backend    | Python, FastAPI, PyMongo |
| Base de datos | MongoDB 7.0        |
| Contenedores | Docker, Docker Compose |

---

**Proyecto Final — MBD-106 NoSQL Databases | UAPA — Grupo 3**
