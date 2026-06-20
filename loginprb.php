<?php
session_start();

// Usar la configuración centralizada de SQLite
require_once 'db_config.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email']);
    $contrasena = trim($_POST['contrasena']);

    if (!empty($email) && !empty($contrasena)) {
        // Consulta el usuario por email
        $stmt = $pdo->prepare("SELECT id, email, contrasena, rol FROM usuarios WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // Compara texto plano (solo para pruebas)
        if ($user && $contrasena === $user['contrasena']) {
            $_SESSION['usuario_id'] = $user['id'];
            $_SESSION['rol'] = $user['rol'];

            // Redirección según rol
            switch ($user['rol']) {
                case 'admin':
                    header("Location: Admin_pantallaprincipal.php");
                    break;
                case 'docente':
                    header("Location: Reporte.php");
                    break;
                case 'padre':
                    header("Location: ConsultaHijo.php");
                    break;
                default:
                    header("Location: index.php");
            }
            exit;
        } else {
            $error = "Usuario o contraseña incorrectos.";
        }
    } else {
        $error = "Por favor, completa todos los campos.";
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Login - Sistema Asistencia</title>
    <link rel="stylesheet" href="loginprb.css">
</head>
<body>
<div class="login-container">
    <h2>Iniciar Sesión</h2>
    <?php if ($error): ?>
        <p class="error"><?php echo htmlspecialchars($error); ?></p>
    <?php endif; ?>
    <form method="POST" action="">
        <input type="email" name="email" placeholder="Correo electrónico" required>
        <input type="password" name="contrasena" placeholder="Contraseña" required>
        <button type="submit">Ingresar</button>
    </form>
</div>
</body>
</html>
