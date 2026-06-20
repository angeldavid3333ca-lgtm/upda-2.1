<?php
session_start();

// // Validar rol admin
// if (!isset($_SESSION['rol']) || $_SESSION['rol'] !== 'admin') {
//     header("Location: login.php");
//     exit;
// }

// Usar la configuración centralizada de SQLite
require_once 'db_config.php';

// Inicializar variables para evitar errores
$mensaje = '';
$error = '';
$editar = null;

// --- CREAR ESTUDIANTE ---
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['accion'] === 'crear') {
    $codigo = $_POST['codigo'];
    $nombre = $_POST['nombre_completo'];
    $fecha_nacimiento = $_POST['fecha_nacimiento'];
    $genero = $_POST['genero'];

    try {
        $stmt = $pdo->prepare("INSERT INTO estudiantes (codigo, nombre_completo, fecha_nacimiento, genero) VALUES (?, ?, ?, ?)");
        $stmt->execute([$codigo, $nombre, $fecha_nacimiento, $genero]);
        $mensaje = "✅ Estudiante agregado correctamente.";
    } catch (PDOException $e) {
        $error = "⚠️ Error: El código ya existe o hubo un problema.";
    }
}

// --- EDITAR ESTUDIANTE ---
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['accion'] === 'editar') {
    $id = $_POST['id'];
    $codigo = $_POST['codigo'];
    $nombre = $_POST['nombre_completo'];
    $fecha_nacimiento = $_POST['fecha_nacimiento'];
    $genero = $_POST['genero'];

    $stmt = $pdo->prepare("UPDATE estudiantes SET codigo=?, nombre_completo=?, fecha_nacimiento=?, genero=? WHERE id=?");
    $stmt->execute([$codigo, $nombre, $fecha_nacimiento, $genero, $id]);
    $mensaje = "✅ Estudiante actualizado correctamente.";
}

// --- ELIMINAR ESTUDIANTE ---
if (isset($_GET['eliminar'])) {
    $stmt = $pdo->prepare("DELETE FROM estudiantes WHERE id=?");
    $stmt->execute([$_GET['eliminar']]);
    $mensaje = "🗑️ Estudiante eliminado correctamente.";
}

// --- CARGAR PARA EDITAR ---
if (isset($_GET['editar'])) {
    $stmt = $pdo->prepare("SELECT * FROM estudiantes WHERE id=?");
    $stmt->execute([$_GET['editar']]);
    $editar = $stmt->fetch(PDO::FETCH_ASSOC);
}

// Consultar todos los estudiantes
$estudiantes = $pdo->query("SELECT * FROM estudiantes ORDER BY nombre_completo")->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Gestión de Estudiantes</title>
    <link rel="stylesheet" href="Crud_estudiante.css">
</head>
<body>
<div>
    <h1>Gestión de Estudiantes</h1>
    <a href="logout.php">Cerrar Sesión</a>

    <?php if (!empty($mensaje)): ?>
        <p style="color:green;"><?= htmlspecialchars($mensaje) ?></p>
    <?php endif; ?>

    <?php if (!empty($error)): ?>
        <p style="color:red;"><?= htmlspecialchars($error) ?></p>
    <?php endif; ?>

    <form method="POST">
        <input type="hidden" name="accion" value="<?= $editar ? 'editar' : 'crear' ?>">
        <?php if ($editar): ?>
            <input type="hidden" name="id" value="<?= $editar['id'] ?>">
        <?php endif; ?>

        <label>Código:</label>
        <input type="text" name="codigo" placeholder="Código" value="<?= htmlspecialchars($editar['codigo'] ?? '') ?>" required><br>

        <label>Nombre completo:</label>
        <input type="text" name="nombre_completo" placeholder="Nombre completo" value="<?= htmlspecialchars($editar['nombre_completo'] ?? '') ?>" required><br>

        <label>Fecha de nacimiento:</label>
        <input type="date" name="fecha_nacimiento" value="<?= htmlspecialchars($editar['fecha_nacimiento'] ?? '') ?>"><br>

        <label>Género:</label>
        <select name="genero" required>
            <option value="">Seleccione</option>
            <option value="M" <?= isset($editar) && $editar['genero'] == 'M' ? 'selected' : '' ?>>Masculino</option>
            <option value="F" <?= isset($editar) && $editar['genero'] == 'F' ? 'selected' : '' ?>>Femenino</option>
            <option value="O" <?= isset($editar) && $editar['genero'] == 'O' ? 'selected' : '' ?>>Otro</option>
        </select><br>

        <button type="submit"><?= $editar ? 'Actualizar' : 'Agregar' ?></button>

        <?php if ($editar): ?>
            <a href="Crud_estudiante.php">Cancelar</a>
        <?php endif; ?>
    </form>

    <h2>Lista de Estudiantes</h2>
    <table border="1" cellspacing="0" cellpadding="6">
        <tr>
            <th>ID</th>
            <th>Código</th>
            <th>Nombre</th>
            <th>Fecha Nacimiento</th>
            <th>Género</th>
            <th>Acciones</th>
        </tr>
        <?php foreach ($estudiantes as $e): ?>
            <tr>
                <td><?= $e['id'] ?></td>
                <td><?= htmlspecialchars($e['codigo']) ?></td>
                <td><?= htmlspecialchars($e['nombre_completo']) ?></td>
                <td><?= $e['fecha_nacimiento'] ?></td>
                <td><?= $e['genero'] ?></td>
                <td>
                    <a href="?editar=<?= $e['id'] ?>">Editar</a> |
                    <a href="?eliminar=<?= $e['id'] ?>" onclick="return confirm('¿Eliminar estudiante?')">Eliminar</a>
                </td>
            </tr>
        <?php endforeach; ?>
    </table>
</div>
</body>
</html>
