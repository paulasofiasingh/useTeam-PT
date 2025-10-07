# 🎯 Tablero Kanban Colaborativo en Tiempo Real

Una aplicación tipo Trello que permite la gestión de tareas mediante un tablero Kanban con soporte para colaboración en tiempo real, incluyendo exportación automatizada de backlog vía email.

## 🚀 Características

- ✅ **Tablero Kanban Interactivo**: Columnas personalizables con drag & drop fluido
- ✅ **Colaboración en Tiempo Real**: Sincronización instantánea entre múltiples usuarios
- ✅ **Exportación Automatizada**: Generación y envío de reportes CSV vía email usando N8N
- ✅ **Interfaz Moderna**: UI/UX optimizada con React.js
- ✅ **Backend Robusto**: API REST con WebSockets usando NestJS

## 🛠️ Tecnologías

### Frontend
- **React.js** - Interfaz de usuario
- **React Beautiful DnD** - Drag & Drop
- **Socket.io Client** - Comunicación en tiempo real

### Backend
- **NestJS** - Framework de Node.js
- **MongoDB** - Base de datos
- **Socket.io** - WebSockets para tiempo real
- **Mongoose** - ODM para MongoDB

### Automatización
- **N8N** - Flujos de trabajo automatizados
- **Webhooks** - Comunicación entre sistemas
- **CSV Generation** - Exportación de datos

## 📋 Prerrequisitos

- Node.js (v18 o superior)
- Docker y Docker Compose
- Git

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone <tu-fork-url>
cd useTeam-PT
```

### 2. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar variables según tu configuración
nano .env
```

### 3. Levantar Servicios con Docker

```bash
# Levantar MongoDB y N8N
docker-compose up -d

# Verificar que los servicios estén corriendo
docker-compose ps
```

### 4. Instalar Dependencias del Backend

```bash
cd backend
npm install
```

### 5. Instalar Dependencias del Frontend

```bash
cd ../frontend
npm install
```

## 🏃‍♂️ Ejecución

### Desarrollo

```bash
# Terminal 1: Backend
cd backend
npm run start:dev

# Terminal 2: Frontend
cd frontend
$ $env:PORT=3001
npm start
```

### Producción

```bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
npm run serve
```

## 🌐 URLs de Acceso

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000/api
- **N8N Interface**: http://localhost:5678 (admin/admin123)
- **MongoDB Express**: http://localhost:8081 (admin/admin123)

## 📁 Estructura del Proyecto

```
useTeam-PT/
├── README.md
├── .env.example
├── docker-compose.yml
├── mongo-init.js
├── frontend/                 # Aplicación React
│   ├── package.json
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # Servicios API
│   │   └── utils/          # Utilidades
│   └── public/
├── backend/                 # API NestJS
│   ├── package.json
│   ├── src/
│   │   ├── boards/         # Módulo de tableros
│   │   ├── columns/        # Módulo de columnas
│   │   ├── cards/          # Módulo de tarjetas
│   │   ├── export/         # Módulo de exportación
│   │   └── websocket/      # Gateway WebSocket
│   └── test/
└── n8n/                    # Flujos de N8N
    ├── workflow.json       # Workflow de exportación
    └── setup-instructions.md
```

## 🔧 Configuración de N8N

### 1. Acceder a N8N
- URL: http://localhost:5678
- Usuario: `admin`
- Contraseña: `admin123`

### 2. Importar Workflow
1. Ir a "Workflows" en el menú lateral
2. Hacer clic en "Import from File"
3. Seleccionar `n8n/workflow.json`
4. Activar el workflow

### 3. Configurar Email
1. Editar el nodo "Send Email"
2. Configurar credenciales SMTP
3. Establecer email destino

## 📤 Funcionalidad de Exportación

### Flujo de Exportación
1. Usuario hace clic en "Exportar Backlog" en el frontend
2. Frontend envía solicitud a `/api/export/backlog`
3. Backend dispara webhook a N8N
4. N8N extrae datos del tablero Kanban
5. N8N genera archivo CSV
6. N8N envía email con archivo adjunto
7. Usuario recibe notificación del estado

### Estructura del CSV
```csv
ID,Título,Descripción,Columna,Fecha de Creación
1,Tarea de ejemplo,Descripción de la tarea,En Progreso,2024-01-15T10:30:00Z
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test
npm run test:e2e

# Frontend tests
cd frontend
npm test
```

## 📝 API Endpoints

### Tableros
- `GET /api/boards` - Obtener todos los tableros
- `POST /api/boards` - Crear nuevo tablero
- `GET /api/boards/:id` - Obtener tablero por ID
- `PUT /api/boards/:id` - Actualizar tablero
- `DELETE /api/boards/:id` - Eliminar tablero

### Columnas
- `POST /api/boards/:boardId/columns` - Crear columna
- `PUT /api/columns/:id` - Actualizar columna
- `DELETE /api/columns/:id` - Eliminar columna

### Tarjetas
- `POST /api/columns/:columnId/cards` - Crear tarjeta
- `PUT /api/cards/:id` - Actualizar tarjeta
- `DELETE /api/cards/:id` - Eliminar tarjeta
- `PUT /api/cards/:id/move` - Mover tarjeta

### Exportación
- `POST /api/export/backlog` - Exportar backlog del tablero

## 🔒 Variables de Entorno

Ver `.env.example` para la lista completa de variables de entorno requeridas.

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Colaboradores

- rodriguezibrahin3@gmail.com
- jonnahuel78@gmail.com
- administracion@useteam.io

## 🆘 Soporte

Si tienes problemas o preguntas, por favor abre un issue en el repositorio.

---

**Desarrollado con ❤️ para useTeam**
