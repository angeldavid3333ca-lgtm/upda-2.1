<?php
session_start();

// // Validar rol docente
// if (!isset($_SESSION['rol']) || $_SESSION['rol'] !== 'docente') {
//     header("Location: login.php");
//     exit;
// }

// Usar la configuración centralizada de SQLite
require_once 'db_config.php';

$docente_id = $_SESSION['usuario_id'];

// Consultar asignaciones del docente
$asignaciones = $pdo->prepare("
    SELECT da.id, g.id AS grupo_id, g.nombre AS grupo, a.id AS asignatura_id, a.nombre AS asignatura
    FROM docente_asignacion da
    INNER JOIN grupos g ON da.grupo_id = g.id
    INNER JOIN asignaturas a ON da.asignatura_id = a.id
    WHERE da.usuario_id = ?
");
$asignaciones->execute([$docente_id]);
$asignaciones = $asignaciones->fetchAll(PDO::FETCH_ASSOC);

// Variables
$estudiantes = [];
$grupo_id = $_GET['grupo_id'] ?? null;
$asignatura_id = $_GET['asignatura_id'] ?? null;
$fecha = $_GET['fecha'] ?? date('Y-m-d');

// Si selecciona grupo y asignatura, cargar estudiantes
if ($grupo_id && $asignatura_id) {
    $stmt = $pdo->prepare("
        SELECT e.id, e.nombre_completo
        FROM matriculas m
        INNER JOIN estudiantes e ON m.estudiante_id = e.id
        WHERE m.grupo_id = ?
    ");
    $stmt->execute([$grupo_id]);
    $estudiantes = $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Guardar asistencia (adaptado para SQLite)
$mensaje = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['asistencia'])) {
    try {
        foreach ($_POST['asistencia'] as $estudiante_id => $estado) {
            $observaciones = $_POST['observaciones'][$estudiante_id] ?? null;

            // Para SQLite, usamos INSERT OR REPLACE
            $stmt = $pdo->prepare("
                INSERT OR REPLACE INTO asistencia (fecha, grupo_id, asignatura_id, docente_id, estudiante_id, estado, observaciones)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([$fecha, $grupo_id, $asignatura_id, $docente_id, $estudiante_id, $estado, $observaciones]);
        }
        $mensaje = "✅ Asistencia guardada correctamente.";
    } catch (PDOException $e) {
        $mensaje = "❌ Error al guardar asistencia: " . $e->getMessage();
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Tomar Asistencia</title>
    <link rel="stylesheet" href="tomar_asistencia.css">
</head>
<body>
<div class="container">
    <h1>Tomar Asistencia</h1>


    <?php if (!empty($mensaje)): ?>
        <p class="success"><?= htmlspecialchars($mensaje) ?></p>
    <?php endif; ?>

    <form method="GET">
        <label>Fecha:</label>
        <input type="date" name="fecha" value="<?= htmlspecialchars($fecha) ?>">
        <label>Grupo/Asignatura:</label>
        <select name="grupo_id" required>
            <option value="">Seleccione Grupo</option>
            <?php foreach ($asignaciones as $as): ?>
                <option value="<?= $as['grupo_id'] ?>" <?= $grupo_id==$as['grupo_id']?'selected':'' ?>>
                    <?= htmlspecialchars($as['grupo']) ?>
                </option>
            <?php endforeach; ?>
        </select>
        <select name="asignatura_id" required>
            <option value="">Seleccione Asignatura</option>
            <?php foreach ($asignaciones as $as): ?>
                <option value="<?= $as['asignatura_id'] ?>" <?= $asignatura_id==$as['asignatura_id']?'selected':'' ?>>
                    <?= htmlspecialchars($as['asignatura']) ?>
                </option>
            <?php endforeach; ?>
        </select>
        <button type="submit">Cargar Estudiantes</button>
    </form>

    <?php if ($estudiantes): ?>
        <form method="POST">
            <table>
                <tr><th>Estudiante</th><th>Estado</th><th>Observaciones</th></tr>
                <?php foreach ($estudiantes as $e): ?>
                    <tr>
                        <td><?= htmlspecialchars($e['nombre_completo']) ?></td>
                        <td>
                            <select name="asistencia[<?= $e['id'] ?>]" required>
                                <option value="presente">Presente</option>
                                <option value="ausente">Ausente</option>
                                <option value="justificado">Justificado</option>
                                <option value="tarde">Tarde</option>
                            </select>
                        </td>
                        <td><input type="text" name="observaciones[<?= $e['id'] ?>]" placeholder="Observación"></td>
                    </tr>
                <?php endforeach; ?>
            </table>
            <button type="submit">Guardar Asistencia</button>
        </form>
    <?php endif; ?>
</div>
</body>
</html>