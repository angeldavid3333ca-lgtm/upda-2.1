# 🎯 Guía de Migración a SQLite - Sistema de Asistencia

## ✅ Cambios Realizados

### 1. **Base de Datos Embebida**
- ✨ Migrado de MySQL a **SQLite**
- 📁 Archivo de BD: `asistencia.db` (embebido en el proyecto)
- 🚀 No requiere servidor externo

### 2. **Archivos Creados**

#### `db_config.php`
- Configuración centralizada de conexión SQLite
- Importar en todos los archivos PHP con: `require_once 'db_config.php';`

#### `db_init.php`
- Script de inicialización de la base de datos
- Crea todas las tablas automáticamente
- Inserta datos de ejemplo

#### `setup_db.html`
- Interfaz web para inicializar la BD
- Accesible en: `http://localhost/setup_db.html`

#### `logout.php`
- Manejo de cierre de sesión
- Redirige al portal principal

### 3. **Archivos PHP Actualizados**

Se han actualizado los siguientes archivos para usar SQLite:

- ✅ `loginalumno.php`
- ✅ `Crud_estudiante.php`
- ✅ `Estudiante_dashboard.php`
- ✅ `ConsultaHijo.php`
- ✅ `Asignar_Docente.php`
- ✅ `tomar_asistencia.php` (adaptado para SQLite)
- ✅ `Gestion_matriculas.php`
- ✅ `Admin_usuarios_aulas.php`
- ✅ `Admin_pantallaprincipal.php`
- ✅ `Reporte.php`
- ✅ `matriculas.php`

### 4. **Cambios Técnicos Importantes**

#### Reemplazo de conexión MySQL:
```php
// ❌ ANTES (MySQL)
$pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);

// ✅ AHORA (SQLite)
require_once 'db_config.php';
// La conexión ya está lista en $pdo
```

#### Manejo de duplicados:
```php
// ❌ ANTES (MySQL)
ON DUPLICATE KEY UPDATE estado=?, observaciones=?

// ✅ AHORA (SQLite)
INSERT OR REPLACE INTO tabla (campos) VALUES (?, ?)
```

## 🚀 Primeros Pasos

### 1. Inicializar la Base de Datos

**Opción A: Acceso Web**
1. Abre tu servidor local (ej: http://localhost/proyasist/setup_db.html)
2. Haz clic en "Inicializar Base de Datos"
3. Las tablas y datos de ejemplo se crearán automáticamente

**Opción B: Desde Terminal**
```bash
php db_init.php
```

### 2. Verificar la BD
- La base de datos se crea en: `asistencia.db`
- Puedes visualizarla con herramientas como SQLite Browser

## 👥 Datos de Ejemplo

### Usuarios:
- **Admin**: admin@school.com / admin123
- **Docentes**: juan@school.com / docente123, maria@school.com / docente123
- **Padres**: carlos@parent.com / padre123, ana@parent.com / padre123

### Estudiantes:
- EST001: Carlos García López
- EST002: Ana Martínez Rodríguez
- EST003: Pedro Fernández Silva
- EST004: María López Díaz
- EST005: Juan Ramírez Cruz
- EST006: Sandra Torres Gómez
- EST007: Roberto Sánchez Ruiz
- EST008: Catalina Morales Vega

## 📊 Estructura de Tablas

```
├── usuarios (admin, docentes, padres)
├── estudiantes (lista de alumnos)
├── grupos (aulas)
├── asignaturas (materias)
├── matriculas (relación estudiante-grupo)
├── asistencia (registro de asistencia)
├── docente_asignacion (docente-grupo-asignatura)
└── padre_estudiante (relación padre-hijo)
```

## 🔧 Mantenimiento

### Respaldar la Base de Datos
```bash
cp asistencia.db asistencia_backup.db
```

### Restaurar la Base de Datos
```bash
cp asistencia_backup.db asistencia.db
```

### Reinicializar (borrar todo)
```bash
rm asistencia.db
php db_init.php
```

## ⚠️ Notas Importantes

1. **SQLite vs MySQL**: SQLite es perfecto para desarrollo local. Si necesitas producción, considera migrar a MySQL.

2. **Concurrencia**: SQLite tiene limitaciones con múltiples escrituras simultáneas. Para producción, usa MySQL.

3. **Compatibilidad**: Todos los archivos PHP ya han sido adaptados para SQLite.

4. **Claves Foráneas**: Las claves foráneas están habilitadas en SQLite mediante `PRAGMA foreign_keys = ON`.

## 📝 Tareas Completadas

- ✅ Crear `db_config.php` (configuración centralizada)
- ✅ Crear `db_init.php` (inicializador de BD)
- ✅ Actualizar todos los archivos PHP
- ✅ Crear interfaz web de setup
- ✅ Crear archivo logout.php
- ✅ Generar datos de ejemplo
- ✅ Documentación completa

## 🆘 Solución de Problemas

### Error: "No such table"
→ Ejecuta `php db_init.php` o visita `setup_db.html`

### Error: "Database is locked"
→ Cierra otros programas que accedan a la BD

### Error: "SQLSTATE[HY000]"
→ Verifica que el archivo `asistencia.db` sea escribible

## 📞 Soporte

Si tienes dudas, consulta:
1. `datos_ejemplo.txt` - Información de usuarios y datos
2. `db_config.php` - Configuración de conexión
3. `db_init.php` - Definición de tablas

---

**Sistema de Asistencia - Versión SQLite** ✨
