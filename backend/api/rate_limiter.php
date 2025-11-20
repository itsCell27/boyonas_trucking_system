<?php
/**
 * Simple rate limiter to prevent brute force attacks
 * Usage: require_once 'rate_limiter.php'; rateLimit('login', 5, 300);
 */

function rateLimit($action, $maxAttempts = 5, $timeWindow = 300) {
    $ip = $_SERVER['REMOTE_ADDR'];
    $key = "rate_limit_{$action}_{$ip}";
    
    // Store in a simple file-based system (for production, use Redis or Memcached)
    $rateLimitFile = sys_get_temp_dir() . "/rate_limit_" . md5($key) . ".json";
    
    $data = [];
    if (file_exists($rateLimitFile)) {
        $data = json_decode(file_get_contents($rateLimitFile), true);
    }
    
    $now = time();
    
    // Clean old attempts outside the time window
    $data['attempts'] = array_filter($data['attempts'] ?? [], function($timestamp) use ($now, $timeWindow) {
        return ($now - $timestamp) < $timeWindow;
    });
    
    // Check if limit exceeded
    if (count($data['attempts']) >= $maxAttempts) {
        $oldestAttempt = min($data['attempts']);
        $waitTime = $timeWindow - ($now - $oldestAttempt);
        
        http_response_code(429);
        echo json_encode([
            'error' => 'Too many attempts. Please try again later.',
            'retry_after' => $waitTime
        ]);
        exit;
    }
    
    // Add current attempt
    $data['attempts'][] = $now;
    file_put_contents($rateLimitFile, json_encode($data));
}

/**
 * Clear rate limit for successful actions (e.g., after successful login)
 */
function clearRateLimit($action) {
    $ip = $_SERVER['REMOTE_ADDR'];
    $key = "rate_limit_{$action}_{$ip}";
    $rateLimitFile = sys_get_temp_dir() . "/rate_limit_" . md5($key) . ".json";
    
    if (file_exists($rateLimitFile)) {
        unlink($rateLimitFile);
    }
}
?>