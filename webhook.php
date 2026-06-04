<?php
$secret = 'vuna2026';
$payload = file_get_contents('php://input');
$sig = 'sha256=' . hash_hmac('sha256', $payload, $secret);

if (!hash_equals($sig, $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '')) {
    http_response_code(403);
    exit('Forbidden');
}

$output = shell_exec('git -C ' . escapeshellarg(__DIR__) . ' pull origin main 2>&1');
echo $output;