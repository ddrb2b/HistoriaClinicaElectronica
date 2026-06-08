# Historia Clínica Electrónica — Clínica Médica Nicolás Abreu

Sistema de expedientes clínicos digitales desarrollado con **React.js + FastAPI + MongoDB**, containerizado con Docker.

---

## Arquitectura

```
frontend  (React.js 18)    → http://localhost:3000
backend   (FastAPI/Python) → http://localhost:8000
mongodb   (MongoDB 7.0)    → localhost:27017
```

---

## Requisitos

- Docker Desktop instalado y en ejecución
- Docker Compose v2+

---

## Ejecución rápida

### 1. Levantar todos los servicios

```bash
docker-compose up --build
```

Esperar hasta ver en la terminal:
```
frontend  | Compiled successfully!
backend   | Application startup complete.
```

### 2. Cargar datos de prueba

En otra terminal:
```bash
docker exec -it backend python seed.py
```

Inserta **100 pacientes** con consultas, análisis y alertas médicas.

### 3. Acceder a la aplicación

| Servicio      | URL                        |
|---------------|----------------------------|
| Frontend      | http://localhost:3000      |
| API (Swagger) | http://localhost:8000/docs |

---

## Credenciales de prueba

| Usuario | Contraseña |
|---------|------------|
| admin   | admin123   |
| medico  | medico123  |

---

## Funcionalidades

### Dashboard
- Estadísticas generales: total de pacientes, consultas y pacientes con alergias
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
- Consultas por médico
- Pacientes con alertas activas
- Búsqueda de pacientes por alergia específica
- Consultas filtradas por rango de fechas
- Consultas por médico en rango de fechas

---

## API — Endpoints principales

| Método | Ruta                                      | Descripción                        |
|--------|-------------------------------------------|------------------------------------|
| POST   | `/login`                                  | Autenticación                      |
| GET    | `/pacientes`                              | Listar todos los pacientes         |
| POST   | `/pacientes`                              | Registrar nuevo paciente           |
| GET    | `/pacientes/{cedula}`                     | Obtener expediente de un paciente  |
| DELETE | `/pacientes/{cedula}`                     | Eliminar paciente                  |
| POST   | `/pacientes/{cedula}/consultas`           | Agregar consulta                   |
| POST   | `/pacientes/{cedula}/analisis`            | Agregar análisis clínico           |
| GET    | `/reportes/estadisticas`                  | Estadísticas del dashboard         |
| GET    | `/reportes/alertas`                       | Pacientes con alertas activas      |
| GET    | `/reportes/alergias/{medicamento}`        | Pacientes por alergia              |
| GET    | `/reportes/consultas-por-medico`          | Consultas agrupadas por médico     |
| GET    | `/reportes/consultas-rango`               | Consultas por rango de fechas      |
| GET    | `/reportes/consultas-por-medico-rango`    | Consultas por médico y rango       |

Documentación interactiva completa en: `http://localhost:8000/docs`

---

## MongoDB — Consultas de ejemplo

Conectarse al shell:
```bash
docker exec -it mongodb mongosh clinica
```

```js
// Historial completo de un paciente
db.pacientes.find({ cedula: "40212345678" })

// Pacientes con alergia a Penicilina
db.pacientes.find({ alergias: "Penicilina" }, { nombre: 1, alergias: 1 })

// Consultas en un rango de fechas
db.pacientes.aggregate([
  { $unwind: "$consultas" },
  { $match: { "consultas.fecha": { $gte: "2026-06-01", $lte: "2026-06-30" } } },
  { $project: { nombre: 1, "consultas.fecha": 1, "consultas.doctor": 1, "consultas.diagnostico": 1 } }
])

// Consultas agrupadas por médico
db.pacientes.aggregate([
  { $unwind: "$consultas" },
  { $group: { _id: "$consultas.doctor", total_consultas: { $sum: 1 } } }
])

// Pacientes con alertas médicas activas
db.pacientes.find(
  { alertas_medicas: { $exists: true, $ne: [] } },
  { nombre: 1, alertas_medicas: 1 }
)
```

---

## Detener la aplicación

```bash
docker-compose down
```

Para eliminar también los datos de MongoDB:
```bash
docker-compose down -v
```

---

## Estructura del proyecto

```
HistoriaClinica/
├── backend/
│   ├── main.py          # FastAPI — endpoints REST
│   ├── seed.py          # Carga datos de prueba
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.js       # Aplicación React
│   │   └── index.js
│   ├── public/index.html
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## Tecnologías

| Capa           | Tecnología                  |
|----------------|-----------------------------|
| Frontend       | React.js 18, Axios          |
| Backend        | Python, FastAPI, PyMongo    |
| Base de datos  | MongoDB 7.0                 |
| Contenedores   | Docker, Docker Compose      |

---

**Proyecto Final — MBD-106 Bases de Datos NoSQL | UAPA — Grupo 3**
