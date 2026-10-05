<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function respond(int $status, string $message): never {
    http_response_code($status);
    echo json_encode(['message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, 'Método não permitido.');
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$host = $_SERVER['HTTP_HOST'] ?? '';
if ($origin === '' || parse_url($origin, PHP_URL_HOST) !== preg_replace('/:\d+$/', '', $host)) {
    respond(403, 'Origem da solicitação não permitida.');
}

$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (stripos($contentType, 'application/json') !== 0) {
    respond(415, 'Formato de solicitação inválido.');
}

$raw = file_get_contents('php://input');
if ($raw === false || strlen($raw) > 12000) {
    respond(413, 'Solicitação muito grande.');
}

$payload = json_decode($raw, true);
if (!is_array($payload) || !is_string($payload['form'] ?? null) || !is_array($payload['fields'] ?? null)) {
    respond(400, 'Dados da solicitação inválidos.');
}

$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'life-mail-' . hash('sha256', $ip) . '.json';
$now = time();
$recent = is_file($rateFile) ? json_decode((string) file_get_contents($rateFile), true) : [];
$recent = is_array($recent) ? array_values(array_filter($recent, fn($timestamp) => is_int($timestamp) && $timestamp > $now - 3600)) : [];
if (count($recent) >= 5) {
    respond(429, 'Limite de envios atingido. Tente novamente mais tarde.');
}

$definitions = [
    'privacy' => [
        'recipient' => 'encarregado@life.eng.br',
        'subject' => 'Solicitação LGPD Life',
        'required' => ['Solicitação', 'Nome completo', 'E-mail para retorno', 'Relação com a Life', 'Descrição', 'Declaração de titularidade'],
        'allowed' => ['Solicitação', 'Nome completo', 'E-mail para retorno', 'Relação com a Life', 'Descrição', 'Declaração de titularidade', 'website'],
    ],
    'transparency' => [
        'recipient' => 'contato@life.eng.br',
        'subject' => 'Transparência Life',
        'required' => ['Tipo', 'Assunto', 'Mensagem', 'Ciência sobre o tratamento de dados'],
        'allowed' => ['Tipo', 'Nome', 'E-mail para retorno', 'Empresa ou instituição', 'Assunto', 'Mensagem', 'Ciência sobre o tratamento de dados', 'website'],
    ],
];

$definition = $definitions[$payload['form']] ?? null;
if ($definition === null) {
    respond(400, 'Tipo de formulário inválido.');
}

$fields = [];
foreach ($payload['fields'] as $key => $value) {
    if (!is_string($key) || !is_string($value) || !in_array($key, $definition['allowed'], true)) continue;
    $clean = trim(preg_replace('/[\r\n]+/', ' ', $value));
    if (strlen($clean) > 5000) respond(422, 'Um dos campos excede o limite permitido.');
    $fields[$key] = $clean;
}

if (($fields['website'] ?? '') !== '') respond(200, 'Solicitação enviada com sucesso.');
unset($fields['website']);
foreach ($definition['required'] as $required) {
    if (($fields[$required] ?? '') === '') respond(422, 'Preencha os campos obrigatórios.');
}
if (isset($fields['E-mail para retorno']) && !filter_var($fields['E-mail para retorno'], FILTER_VALIDATE_EMAIL)) {
    respond(422, 'Informe um e-mail válido.');
}

$subjectDetail = $fields['Assunto'] ?? $fields['Solicitação'] ?? $fields['Tipo'];
$subject = $definition['subject'] . ' - ' . $subjectDetail;
$body = "Mensagem recebida pelo site da Life Engenharia\n\n";
foreach ($fields as $key => $value) $body .= $key . ': ' . $value . "\n\n";
$headers = [
    'From: Site Life Engenharia <no-reply@life.eng.br>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
];
if (isset($fields['E-mail para retorno'])) $headers[] = 'Reply-To: ' . $fields['E-mail para retorno'];

if (!mail($definition['recipient'], $subject, $body, implode("\r\n", $headers))) {
    respond(503, 'Não foi possível enviar agora. Tente novamente mais tarde.');
}
$recent[] = $now;
@file_put_contents($rateFile, json_encode($recent), LOCK_EX);
respond(200, 'Solicitação enviada com sucesso.');
