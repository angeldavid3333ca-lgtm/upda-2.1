<?php
// Configuración de base de datos SQLite
// Esta base de datos es embebida y se almacena como archivo local

// Definir ruta de la BD
$db_path = __DIR__ . '/asistencia.db';

try {
    // Conectar a SQLite (se crea automáticamente si no existe)
    $pdo = new PDO("sqlite:$db_path");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Habilitar claves foráneas en SQLite
    $pdo->exec("PRAGMA foreign_keys = ON");
    
} catch (PDOException $e) {
    die("Error de conexión a la base de datos: " . $e->getMessage());
}
?>
