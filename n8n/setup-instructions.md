# 🚀 Configuración de N8N para Exportación de Backlog

Esta guía te ayudará a configurar N8N para la funcionalidad de exportación automática del tablero Kanban.

## 📋 Prerrequisitos

- Docker y Docker Compose instalados
- Servicios de MongoDB y N8N ejecutándose
- Credenciales de email configuradas

## 🔧 Configuración Paso a Paso

### 1. Acceder a N8N

1. Abre tu navegador y ve a: http://localhost:5678
2. Inicia sesión con las credenciales:
   - **Usuario**: `admin`
   - **Contraseña**: `admin123`

### 2. Importar el Workflow

1. En el panel lateral, haz clic en **"Workflows"**
2. Haz clic en el botón **"Import from File"**
3. Selecciona el archivo `n8n/workflow.json` de este proyecto
4. El workflow se importará automáticamente

### 3. Configurar Credenciales de Email

#### Opción A: Gmail (Recomendado)

1. En el workflow importado, haz clic en el nodo **"Send Email"**
2. Haz clic en **"Create New Credential"**
3. Selecciona **"Gmail"**
4. Configura:
   - **Email**: tu-email@gmail.com
   - **Password**: tu-contraseña-de-aplicación (no tu contraseña normal)
   - **Name**: Gmail Credentials

#### Opción B: SMTP Genérico

1. En el nodo **"Send Email"**, haz clic en **"Create New Credential"**
2. Selecciona **"SMTP"**
3. Configura:
   - **Host**: smtp.gmail.com (o tu servidor SMTP)
   - **Port**: 587
   - **Username**: tu-email@gmail.com
   - **Password**: tu-contraseña-de-aplicación
   - **Secure**: true

### 4. Configurar Variables del Workflow

1. Haz clic en el nodo **"Set Variables"**
2. Configura las siguientes variables:

```json
{
  "emailTo": "destino@ejemplo.com",
  "emailSubject": "Exportación de Backlog - Tablero Kanban",
  "emailFrom": "noreply@kanban-app.com",
  "boardName": "Mi Tablero Kanban"
}
```

### 5. Activar el Workflow

1. En la esquina superior derecha, haz clic en el interruptor **"Active"**
2. El workflow ahora está activo y escuchando webhooks

### 6. Probar la Configuración

1. Ve al frontend de tu aplicación Kanban
2. Haz clic en el botón **"Exportar Backlog"**
3. Verifica que recibas el email con el archivo CSV adjunto

## 🔗 Configuración del Webhook

El webhook está configurado para recibir datos en:
```
POST http://localhost:5678/webhook/kanban-export
```

### Estructura de Datos Esperada

```json
{
  "boardId": "64a1b2c3d4e5f6789abcdef0",
  "boardName": "Mi Tablero",
  "emailTo": "usuario@ejemplo.com",
  "includeArchived": false
}
```

## 📧 Configuración de Gmail

Para usar Gmail como servicio de email:

### 1. Habilitar Autenticación de 2 Factores
1. Ve a tu cuenta de Google
2. Seguridad → Verificación en 2 pasos
3. Activa la verificación en 2 pasos

### 2. Generar Contraseña de Aplicación
1. Ve a Seguridad → Contraseñas de aplicaciones
2. Selecciona "Correo" y "Otro (nombre personalizado)"
3. Escribe "N8N Kanban Export"
4. Copia la contraseña generada (16 caracteres)

### 3. Usar la Contraseña en N8N
- Usa tu email normal como username
- Usa la contraseña de 16 caracteres como password

## 🐛 Solución de Problemas

### Error: "Authentication failed"
- Verifica que la contraseña de aplicación sea correcta
- Asegúrate de que la autenticación de 2 factores esté activada

### Error: "Webhook not receiving data"
- Verifica que el workflow esté activo
- Comprueba que la URL del webhook sea correcta
- Revisa los logs de N8N en la consola

### Error: "CSV file not generated"
- Verifica que los datos del tablero estén llegando correctamente
- Revisa la estructura de datos en el nodo "Extract Data"

### Error: "Email not sent"
- Verifica las credenciales de email
- Comprueba que el puerto SMTP sea correcto (587 para Gmail)
- Asegúrate de que "Secure" esté marcado como true

## 📊 Monitoreo

### Ver Logs de N8N
```bash
docker-compose logs -f n8n
```

### Ver Ejecuciones del Workflow
1. En N8N, ve a **"Executions"**
2. Aquí puedes ver el historial de todas las ejecuciones
3. Haz clic en cualquier ejecución para ver los detalles

### Verificar Estado de los Servicios
```bash
docker-compose ps
```

## 🔄 Actualización del Workflow

Si necesitas modificar el workflow:

1. Exporta el workflow actual desde N8N
2. Modifica el archivo `workflow.json`
3. Importa la nueva versión
4. Reconfigura las credenciales si es necesario

## 📞 Soporte

Si tienes problemas con la configuración:

1. Revisa los logs de Docker: `docker-compose logs n8n`
2. Verifica la configuración de red en `docker-compose.yml`
3. Asegúrate de que todos los servicios estén ejecutándose
4. Consulta la documentación oficial de N8N: https://docs.n8n.io

---

**¡Listo! Tu sistema de exportación automática está configurado y funcionando.**
