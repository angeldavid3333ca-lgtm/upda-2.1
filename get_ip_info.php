<?php
/**
 * Script para obtener información de conexión
 * Uso: http://localhost:8000/get_ip_info.php
 */

echo "<!DOCTYPE html>
<html lang='es'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Información de Conexión</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0;
            padding: 20px;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            max-width: 600px;
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
        }
        .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin: 15px 0;
            border-left: 4px solid #667eea;
        }
        .info-label {
            font-weight: bold;
            color: #667eea;
            font-size: 14px;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .info-value {
            font-size: 18px;
            color: #333;
            font-family: 'Courier New', monospace;
            word-break: break-all;
        }
        .success {
            background: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
            border-left: 4px solid #28a745;
        }
        .instructions {
            background: #fff3cd;
            color: #856404;
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
            border-left: 4px solid #ffc107;
        }
        code {
            background: #f4f4f4;
            padding: 5px 10px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
        }
        .copy-btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 10px;
            font-size: 14px;
        }
        .copy-btn:hover {
            background: #764ba2;
        }
    </style>
</head>
<body>
    <div class='container'>
        <h1>📱 Información de Conexión</h1>
        
        <div class='success'>
            ✅ El servidor está funcionando correctamente
        </div>";

// Obtener información del servidor
$server_ip = $_SERVER['SERVER_ADDR'] ?? 'No disponible';
$server_port = $_SERVER['SERVER_PORT'] ?? 8000;
$client_ip = $_SERVER['REMOTE_ADDR'] ?? 'No disponible';

// Obtener IPs locales
$local_ips = [];
$output = shell_exec('hostname -I 2>/dev/null') ?: shell_exec('ipconfig 2>/dev/null');
if ($output) {
    preg_match_all('/(\d+\.\d+\.\d+\.\d+)/', $output, $matches);
    $local_ips = array_unique($matches[1]);
}

// Obtener la IP más probable (no localhost)
$probable_ip = null;
foreach ($local_ips as $ip) {
    if (strpos($ip, '127.') === false && strpos($ip, '::1') === false) {
        $probable_ip = $ip;
        break;
    }
}

echo "<div class='info-box'>
    <div class='info-label'>🌐 IP de tu Computadora (para acceso desde teléfono)</div>
    <div class='info-value'>";

if ($probable_ip) {
    echo $probable_ip;
} else {
    echo 'Ejecuta en terminal: <code>hostname -I</code> o <code>ifconfig</code>';
}

echo "</div>
</div>";

echo "<div class='info-box'>
    <div class='info-label'>🔗 Puerto</div>
    <div class='info-value'>" . $server_port . "</div>
</div>";

if ($probable_ip) {
    $url = "http://{$probable_ip}:{$server_port}/index.html";
    echo "<div class='info-box'>
        <div class='info-label'>📲 URL para tu teléfono (en la misma WiFi)</div>
        <div class='info-value'>{$url}</div>
        <button class='copy-btn' onclick=\"copyToClipboard('{$url}')\">📋 Copiar</button>
    </div>";
}

echo "<div class='instructions'>
    <strong>📋 Instrucciones:</strong><br>
    1. Asegúrate que tu teléfono está conectado a la MISMA WiFi<br>
    2. Abre el navegador del teléfono<br>
    3. Copia y pega la URL anterior<br>
    4. ¡Listo! Podrás acceder al sistema
</div>";

echo "<div class='info-box'>
    <div class='info-label'>ℹ️ Información Técnica</div>
    <div class='info-value'>
        <strong>PHP:</strong> " . phpversion() . "<br>
        <strong>Servidor:</strong> PHP Development Server<br>
        <strong>Sistema Operativo:</strong> " . php_uname() . "<br>
    </div>
</div>";

echo "</div>

<script>
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        alert('✅ Copiado al portapapeles: ' + text);
    }, function(err) {
        alert('Error al copiar: ' + err);
    });
}
</script>
</body>
</html>";
?>
