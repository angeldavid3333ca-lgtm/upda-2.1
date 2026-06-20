<?php
// Script de inicialización de la base de datos SQLite
// Ejecutar una sola vez para crear las tablas

require_once 'db_config.php';

try {
    // Crear tabla usuarios
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre_completo TEXT NOT NULL,
            email TEXT UNIQUE,
            contrasena TEXT NOT NULL,
            rol TEXT NOT NULL CHECK(rol IN ('admin', 'docente', 'padre')),
            activo BOOLEAN DEFAULT 1,
            fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ");

    // Crear tabla estudiantes
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS estudiantes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            codigo TEXT UNIQUE NOT NULL,
            nombre_completo TEXT NOT NULL,
            fecha_nacimiento DATE,
            genero TEXT CHECK(genero IN ('M', 'F', 'O')),
            activo BOOLEAN DEFAULT 1,
            fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ");

    // Crear tabla grupos
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS grupos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT UNIQUE NOT NULL,
            descripcion TEXT,
            grado INTEGER,
            activo BOOLEAN DEFAULT 1,
            fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ");

    // Crear tabla asignaturas
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS asignaturas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT UNIQUE NOT NULL,
            codigo TEXT UNIQUE,
            descripcion TEXT,
            activo BOOLEAN DEFAULT 1,
            fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ");

    // Crear tabla matriculas
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS matriculas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            estudiante_id INTEGER NOT NULL,
            grupo_id INTEGER NOT NULL,
            fecha_matricula DATE NOT NULL,
            activo BOOLEAN DEFAULT 1,
            FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
            FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE,
            UNIQUE(estudiante_id, grupo_id)
        )
    ");

    // Crear tabla asistencia
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS asistencia (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fecha DATE NOT NULL,
            grupo_id INTEGER NOT NULL,
            asignatura_id INTEGER NOT NULL,
            docente_id INTEGER NOT NULL,
            estudiante_id INTEGER NOT NULL,
            estado TEXT NOT NULL CHECK(estado IN ('presente', 'ausente', 'tardanza', 'licencia')),
            observaciones TEXT,
            fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE,
            FOREIGN KEY (asignatura_id) REFERENCES asignaturas(id) ON DELETE CASCADE,
            FOREIGN KEY (docente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
            UNIQUE(fecha, grupo_id, asignatura_id, estudiante_id)
        )
    ");

    // Crear tabla docente_asignacion
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS docente_asignacion (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            grupo_id INTEGER NOT NULL,
            asignatura_id INTEGER NOT NULL,
            fecha_asignacion DATE DEFAULT CURRENT_DATE,
            activo BOOLEAN DEFAULT 1,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE,
            FOREIGN KEY (asignatura_id) REFERENCES asignaturas(id) ON DELETE CASCADE,
            UNIQUE(usuario_id, grupo_id, asignatura_id)
        )
    ");

    // Crear tabla padre_estudiante
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS padre_estudiante (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            padre_id INTEGER NOT NULL,
            estudiante_id INTEGER NOT NULL,
            relacion TEXT,
            activo BOOLEAN DEFAULT 1,
            FOREIGN KEY (padre_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
            UNIQUE(padre_id, estudiante_id)
        )
    ");

    // Insertar datos de ejemplo
    
    // Usuarios
    $pdo->exec("
        INSERT OR IGNORE INTO usuarios (nombre_completo, email, contrasena, rol) VALUES
        ('Admin Sistema', 'admin@school.com', 'admin123', 'admin'),
        ('Juan Docente', 'juan@school.com', 'docente123', 'docente'),
        ('María Docente', 'maria@school.com', 'docente123', 'docente'),
        ('Carlos Padre', 'carlos@parent.com', 'padre123', 'padre'),
        ('Ana Madre', 'ana@parent.com', 'padre123', 'padre')
    ");

    // Grupos
    $pdo->exec("
        INSERT OR IGNORE INTO grupos (nombre, grado) VALUES
        ('6A', 6),
        ('6B', 6),
        ('7A', 7),
        ('7B', 7),
        ('8A', 8)
    ");

    // Asignaturas
    $pdo->exec("
        INSERT OR IGNORE INTO asignaturas (nombre, codigo) VALUES
        ('Matemáticas', 'MAT'),
        ('Lenguaje', 'LEN'),
        ('Ciencias Naturales', 'CNA'),
        ('Historia', 'HIS'),
        ('Educación Física', 'EF'),
        ('Inglés', 'ING')
    ");

    // Estudiantes
    $pdo->exec("
        INSERT OR IGNORE INTO estudiantes (codigo, nombre_completo, fecha_nacimiento, genero) VALUES
        ('EST001', 'Carlos García López', '2010-03-15', 'M'),
        ('EST002', 'Ana Martínez Rodríguez', '2010-05-22', 'F'),
        ('EST003', 'Pedro Fernández Silva', '2010-07-10', 'M'),
        ('EST004', 'María López Díaz', '2010-09-18', 'F'),
        ('EST005', 'Juan Ramírez Cruz', '2010-11-25', 'M'),
        ('EST006', 'Sandra Torres Gómez', '2011-01-08', 'F'),
        ('EST007', 'Roberto Sánchez Ruiz', '2011-02-14', 'M'),
        ('EST008', 'Catalina Morales Vega', '2011-04-20', 'F')
    ");

    // Matrículas
    $pdo->exec("
        INSERT OR IGNORE INTO matriculas (estudiante_id, grupo_id, fecha_matricula) VALUES
        (1, 1, '2024-01-10'),
        (2, 1, '2024-01-10'),
        (3, 1, '2024-01-10'),
        (4, 2, '2024-01-10'),
        (5, 2, '2024-01-10'),
        (6, 3, '2024-01-10'),
        (7, 3, '2024-01-10'),
        (8, 3, '2024-01-10')
    ");

    // Asignaciones de docentes
    $pdo->exec("
        INSERT OR IGNORE INTO docente_asignacion (usuario_id, grupo_id, asignatura_id) VALUES
        (2, 1, 1),
        (2, 1, 2),
        (3, 2, 1),
        (3, 2, 3),
        (2, 3, 2),
        (3, 3, 4)
    ");

    // Relaciones padre-estudiante
    $pdo->exec("
        INSERT OR IGNORE INTO padre_estudiante (padre_id, estudiante_id, relacion) VALUES
        (4, 1, 'Padre'),
        (4, 2, 'Padre'),
        (5, 3, 'Madre')
    ");

    echo "✅ Base de datos inicializada correctamente.<br>";
    echo "📁 Archivo de BD: " . $db_path . "<br>";
    echo "👥 Usuarios de ejemplo creados (consultar datos_ejemplo.txt)";

} catch (PDOException $e) {
    echo "❌ Error al inicializar la BD: " . $e->getMessage();
}
?>
