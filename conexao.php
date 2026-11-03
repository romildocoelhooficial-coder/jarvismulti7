<?php
/**
 * ========================================================
 * MARK LVI (56) - ARQUIVO DE CONEXÃO MYSQL (PHP)
 * Banco: emribeir_jarvismulti
 * Usuário: emribeir_romildo
 * ========================================================
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Responder requisições OPTIONS pré-voo
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$db_host = getenv('DB_HOST') ?: 'localhost';
$db_port = getenv('DB_PORT') ?: '3306';
$db_name = getenv('DB_NAME') ?: 'emribeir_jarvismulti';
$db_user = getenv('DB_USER') ?: 'emribeir_romildo';
$db_pass = getenv('DB_PASSWORD') ?: 'Romildo2009@';

$pdo = null;
$conexao_status = 'offline';
$mensagem = '';

try {
    $dsn = "mysql:host={$db_host};port={$db_port};dbname={$db_name};charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
        PDO::ATTR_TIMEOUT            => 5,
    ];
    $pdo = new PDO($dsn, $db_user, $db_pass, $options);
    $conexao_status = 'online';
    $mensagem = 'Conexão com o banco emribeir_jarvismulti realizada com sucesso!';
} catch (PDOException $e) {
    $conexao_status = 'fallback_local';
    $mensagem = 'Não foi possível conectar ao MySQL (' . $e->getMessage() . '). Modo offline de contingência ativo.';
}

// Roteamento simples quando conexao.php é chamado diretamente via navegador/API
$action = $_GET['action'] ?? 'status';

if ($action === 'status') {
    echo json_encode([
        'status' => $conexao_status === 'online' ? 'sucesso' : 'aviso',
        'conexao' => $conexao_status,
        'banco' => $db_name,
        'usuario' => $db_user,
        'host' => "{$db_host}:{$db_port}",
        'mensagem' => $mensagem,
        'versao_sistema' => 'MARK LVI (56) PWA',
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit();
}

if ($action === 'usuarios' && $pdo) {
    try {
        $stmt = $pdo->query('SELECT id, nome, email, papel, status, criado_em FROM usuarios ORDER BY id DESC');
        $usuarios = $stmt->fetchAll();
        echo json_encode(['status' => 'sucesso', 'usuarios' => $usuarios], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'erro', 'mensagem' => $e->getMessage()]);
    }
    exit();
}

if ($action === 'vozes' && $pdo) {
    try {
        $stmt = $pdo->query('SELECT * FROM vozes_sistema ORDER BY padrao DESC, id ASC');
        $vozes = $stmt->fetchAll();
        echo json_encode(['status' => 'sucesso', 'vozes' => $vozes], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'erro', 'mensagem' => $e->getMessage()]);
    }
    exit();
}
