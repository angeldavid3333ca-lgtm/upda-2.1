<?php
session_start();

// Usar la configuración centralizada de SQLite
require_once 'db_config.php';

$mensaje = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $codigo = $_POST['codigo']; // Código del estudiante

    // Buscar estudiante por código
    $stmt = $pdo->prepare("SELECT id, nombre_completo FROM estudiantes WHERE codigo = ?");
    $stmt->execute([$codigo]);
    $estudiante = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($estudiante) {
        // Login exitoso
        $_SESSION['rol'] = 'estudiante';
        $_SESSION['usuario_id'] = $estudiante['id'];
        $_SESSION['nombre'] = $estudiante['nombre_completo'];

        header("Location: Estudiante_dashboard.php");
        exit;
    } else {
        $mensaje = "⚠️ Código incorrecto.";
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Login Alumno</title>
<link rel="stylesheet" href="loginalumno.css">
</head>
<body>
<div class="login-box">
    <h2>Acceso Alumno</h2>

    <?php if($mensaje): ?>
        <p class="error"><?= htmlspecialchars($mensaje) ?></p>
    <?php endif; ?>

    <form method="POST">
        <label>Código del estudiante</label>
        <input type="text" name="codigo" required placeholder="Ingrese su código">

        <button type="submit">Ingresar</button>
    </form>
</div>
</body>
</html>
