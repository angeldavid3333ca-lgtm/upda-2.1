<?php
// Script de verificación de la instalación de SQLite

echo "========================================\n";
echo "🔍 VERIFICACIÓN DE INSTALACIÓN SQLite\n";
echo "========================================\n\n";

// 1. Verificar PHP
echo "✓ Versión PHP: " . phpversion() . "\n";

// 2. Verificar extensión SQLite
$extensiones = get_loaded_extensions();
if (in_array('pdo_sqlite', $extensiones)) {
    echo "✓ Extensión PDO SQLite: ✅ Disponible\n";
} else {
    echo "✗ Extensión PDO SQLite: ❌ NO DISPONIBLE\n";
    die("\n⚠️ Por favor, habilita la extensión pdo_sqlite en php.ini\n");
}

// 3. Verificar si db_config.php existe
if (file_exists('db_config.php')) {
    echo "✓ db_config.php: ✅ Encontrado\n";
} else {
    echo "✗ db_config.php: ❌ NO ENCONTRADO\n";
    die("\n⚠️ Falta el archivo db_config.php\n");
}

// 4. Verificar si db_init.php existe
if (file_exists('db_init.php')) {
    echo "✓ db_init.php: ✅ Encontrado\n";
} else {
    echo "✗ db_init.php: ❌ NO ENCONTRADO\n";
    die("\n⚠️ Falta el archivo db_init.php\n");
}

// 5. Intentar conectar a SQLite
try {
    require_once 'db_config.php';
    
    // Verificar si la BD existe
    if (file_exists('asistencia.db')) {
        echo "✓ Base de datos: ✅ asistencia.db encontrada\n";
        
        // Contar tablas
        $result = $pdo->query("SELECT name FROM sqlite_master WHERE type='table'");
        $tables = $result->fetchAll();
        echo "  └─ Tablas: " . count($tables) . " tablas encontradas\n";
        
        // Listar tablas
        foreach ($tables as $table) {
            echo "     • " . $table['name'] . "\n";
        }
    } else {
        echo "⚠️ Base de datos: ⚠️ asistencia.db NO ENCONTRADA (aún no inicializada)\n";
    }
    
    echo "\n✓ Conexión a SQLite: ✅ EXITOSA\n";
    
} catch (PDOException $e) {
    echo "\n✗ Conexión a SQLite: ❌ ERROR\n";
    echo "   Detalles: " . $e->getMessage() . "\n";
    die();
}

echo "\n========================================\n";
echo "✅ VERIFICACIÓN COMPLETADA\n";
echo "========================================\n\n";

echo "📝 PRÓXIMOS PASOS:\n\n";
echo "1. Si la BD no existe, ejecuta:\n";
echo "   → php db_init.php\n";
echo "   O accede a: setup_db.html\n\n";

echo "2. Luego accede al portal en:\n";
echo "   → http://localhost/proyasist/index.html\n\n";

echo "3. Usa las credenciales de ejemplo:\n";
echo "   → Ver: datos_ejemplo.txt\n\n";

echo "✨ ¡Sistema listo para usar!\n";
?>
