# Sistema de Asistencia Escolar - Guía Rápida

## ⚡ Inicio Rápido

### 1️⃣ Verificar Instalación
```bash
php verificar_instalacion.php
```

### 2️⃣ Inicializar Base de Datos

**Opción A: Web**
```
http://localhost/proyasist/setup_db.html
```

**Opción B: Terminal**
```bash
php db_init.php
```

### 3️⃣ Acceder al Sistema
```
http://localhost/proyasist/index.html
```

## 👥 Usuarios Disponibles

### Alumno
- Código: EST001
- Acceso: Login de Alumno

### Docente
- Email: juan@school.com
- Contraseña: docente123

### Padre
- Email: carlos@parent.com
- Contraseña: padre123

### Admin
- Email: admin@school.com
- Contraseña: admin123

## 🎯 Características

✅ Base de datos SQLite embebida  
✅ No requiere servidor externo  
✅ Datos de ejemplo preinstalados  
✅ CRUD completo de estudiantes  
✅ Gestión de asistencia  
✅ Panel de reportes  
✅ Relaciones padre-estudiante  

## 📁 Archivos Principales

```
asistencia.db          ← Base de datos (se crea automáticamente)
db_config.php          ← Configuración de conexión SQLite
db_init.php            ← Script de inicialización
setup_db.html          ← Interfaz web de setup
verificar_instalacion.php ← Verificación del sistema
index.html             ← Portal principal
```

## 🔒 Seguridad

⚠️ **IMPORTANTE**: 
- Las contraseñas en los datos de ejemplo son SOLO para desarrollo
- En producción, implementa encriptación de contraseñas
- Usa claves foráneas para garantizar integridad referencial

## 📚 Documentación Completa

Consulta: `MIGRACION_SQLITE.md`

---

**Sistema versión SQLite - Listo para usar ✨**
