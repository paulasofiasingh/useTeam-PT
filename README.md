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
- **@dnd-kit** - Drag & Drop moderno
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
- Cuenta de Gmail (para exportación por email)

### Verificar Docker

```bash
# Verificar que Docker esté instalado
docker --version
docker-compose --version

# Si no tienes Docker, instalarlo desde:
# https://docs.docker.com/get-docker/
```

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone <tu-fork-url>
cd useTeam-PT
```

### 2. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp env.example .env


**Variables importantes a configurar:**
```env
# Email Configuration (para N8N export)
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password-de-gmail

# N8N Configuration
N8N_WEBHOOK_URL=http://localhost:5678/webhook/kanban-export
```

### 3. Levantar Servicios con Docker

```bash
# Levantar MongoDB, N8N y MongoDB Express
docker-compose up -d

# Verificar que los servicios estén corriendo
docker-compose ps

# Ver logs si hay problemas
docker-compose logs
```

#### Servicios Docker incluidos:

- **MongoDB** (puerto 27017): Base de datos principal
- **N8N** (puerto 5678): Automatización de workflows
- **MongoDB Express** (puerto 8081): Interfaz web para MongoDB

#### Comandos Docker útiles:

```bash
# Ver estado de los contenedores
docker-compose ps

# Ver logs de un servicio específico
docker-compose logs mongodb
docker-compose logs n8n

# Reiniciar un servicio
docker-compose restart n8n

# Parar todos los servicios
docker-compose down

# Parar y eliminar volúmenes (¡CUIDADO! Borra datos)
docker-compose down -v
```

### 4. Instalar Dependencias

```bash
# Instalar dependencias del proyecto

# Del backend
cd backend && npm install && cd ..

# Del frontend
cd frontend && npm install && cd ..
```

## 🏃‍♂️ Ejecución

### Desarrollo (Recomendado)

```bash
# Ejecutar frontend y backend simultáneamente
npm run dev
```

Este comando ejecuta:
- **Backend** en http://localhost:3000
- **Frontend** en http://localhost:3001

### Ejecución Manual (Alternativa)

```bash
# Terminal 1: Backend
cd backend
npm run start:dev

# Terminal 2: Frontend
cd frontend
set PORT=3001
npm start
```

## 🌐 URLs de Acceso

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000/api
- **N8N Interface**: http://localhost:5678
- **MongoDB Express**: http://localhost:8081

### Credenciales por Defecto

- **N8N**: admin / admin123
- **MongoDB Express**: admin / admin123
- **MongoDB**: admin / password123

## 📁 Estructura del Proyecto

```
useTeam-PT/
├── README.md
├── env.example
├── docker-compose.yml        # Configuración Docker
├── mongo-init.js            # Script de inicialización MongoDB
├── package.json              # Script principal
├── frontend/                 # Aplicación React
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # Servicios API
│   │   └── types/           # Tipos TypeScript
│   └── public/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── boards/          # Módulo de tableros
│   │   ├── columns/         # Módulo de columnas
│   │   ├── cards/           # Módulo de tarjetas
│   │   ├── export/          # Módulo de exportación
│   │   └── websocket/       # Gateway WebSocket
│   └── test/
└── n8n/                     # Flujos de N8N
    └── workflow.json        # Workflow de exportación
```

## 🔧 Configuración de N8N

### 1. Acceder a N8N

- **URL**: http://localhost:5678
- **Usuario**: `admin`
- **Contraseña**: `admin123`

### 2. Importar Workflow

1. **Ir a "Workflows"** en el menú lateral
2. **Hacer clic en "Import from File"**
3. **Seleccionar** `n8n/workflow.json` del proyecto
4. **Activar el workflow** (toggle en la esquina superior derecha)

### 3. Configurar Credenciales SMTP

1. **Ir a "Credentials"** en el menú lateral
2. **Hacer clic en "Add Credential"**
3. **Buscar "SMTP"** y seleccionarlo
4. **Configurar con tus datos de Gmail:**

```
Name: Gmail SMTP
Host: smtp.gmail.com
Port: 587
User: tu-email@gmail.com
Password: tu-app-password-de-gmail
SSL/TLS: desactivado
```

**⚠️ Importante**: Usar **App Password** de Gmail, no tu contraseña normal.

### 4. Configurar App Password de Gmail

1. **Ir a tu cuenta de Google** → **Seguridad**
2. **Activar "Verificación en 2 pasos"** (si no está activada)
3. **Ir a "Contraseñas de aplicaciones"**
4. **Generar nueva contraseña** para "N8N"
5. **Usar esa contraseña** en N8N (formato: xxxx xxxx xxxx xxxx)

### 5. Asignar Credenciales al Workflow

1. **Abrir el workflow importado**
2. **Hacer clic en el nodo "Send Email"**
3. **En "Credential to connect with"** seleccionar "Gmail SMTP"
4. **Guardar el workflow**

## 📤 Funcionalidad de Exportación

### Flujo de Exportación

1. **Usuario hace clic** en "Exportar Backlog" en el frontend
2. **Frontend envía solicitud** a `/api/export/backlog`
3. **Backend dispara webhook** a N8N
4. **N8N extrae datos** del tablero Kanban
5. **N8N genera archivo CSV** con propiedades binarias
6. **N8N envía email** con archivo adjunto
7. **Usuario recibe** notificación del estado

### Estructura del CSV

```csv
ID,Título,Descripción,Columna,Fecha de Creación,Fecha de Actualización,Prioridad,Asignado
68e5ed1e4b71311cb6b0d0ce,Tarea de ejemplo,Descripción de la tarea,En Progreso,2024-01-15T10:30:00Z,2024-01-15T10:30:00Z,medium,Sin Asignar
```

### Probar la Exportación

1. **Crear algunas tarjetas** en el tablero Kanban
2. **Hacer clic en "Exportar Backlog"**
3. **Ingresar email de destino**
4. **Verificar que llegue el email** con el archivo CSV adjunto

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

**Body del request:**
```json
{
  "boardId": "string",
  "emailTo": "string",
  "boardName": "string (opcional)",
  "includeArchived": "boolean (opcional)"
}
```

## 🔒 Variables de Entorno

Ver `env.example` para la lista completa de variables de entorno requeridas.

### Variables Importantes

```env
# Database
MONGODB_URI=mongodb://admin:password123@localhost:27017/kanban-board?authSource=admin

# Backend
PORT=3000
NODE_ENV=development

# N8N
N8N_WEBHOOK_URL=http://localhost:5678/webhook/kanban-export

# Frontend
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_WS_URL=ws://localhost:3000

# Email (para N8N)
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password
```

## 🚨 Solución de Problemas

### Docker no funciona
1. **Verificar que Docker esté corriendo**: `docker --version`
2. **Verificar que Docker Compose esté instalado**: `docker-compose --version`
3. **Reiniciar Docker Desktop** (en Windows/Mac)
4. **Verificar puertos disponibles**: Los puertos 27017, 5678, 8081 deben estar libres

### Contenedores no inician
```bash
# Ver logs detallados
docker-compose logs

# Reiniciar todos los servicios
docker-compose down
docker-compose up -d

# Si persiste, limpiar volúmenes (¡CUIDADO! Borra datos)
docker-compose down -v
docker-compose up -d
```

### MongoDB no conecta
1. **Verificar que el contenedor esté corriendo**: `docker-compose ps`
2. **Verificar logs de MongoDB**: `docker-compose logs mongodb`
3. **Verificar credenciales** en `.env`
4. **Reiniciar MongoDB**: `docker-compose restart mongodb`

### N8N no funciona
1. **Verificar que el contenedor esté corriendo**: `docker-compose ps`
2. **Verificar logs de N8N**: `docker-compose logs n8n`
3. **Acceder a http://localhost:5678**
4. **Reiniciar N8N**: `docker-compose restart n8n`

### N8N no envía emails
1. **Verificar credenciales SMTP** en N8N
2. **Usar App Password** de Gmail (no contraseña normal)
3. **Verificar que el workflow esté activo**
4. **Revisar logs** en N8N → Executions

### Frontend no carga
1. **Verificar que el backend esté corriendo** en puerto 3000
2. **Verificar variables de entorno** en `.env`
3. **Limpiar cache**: `cd frontend && npm start -- --reset-cache`

### Puerto ocupado
```bash
# Verificar qué proceso usa el puerto
netstat -ano | findstr :3000
netstat -ano | findstr :5678

# En Windows, matar proceso por PID
taskkill /PID <PID> /F

# En Linux/Mac
lsof -ti:3000 | xargs kill -9
```