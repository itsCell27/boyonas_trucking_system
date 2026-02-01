<?php
/**
 * Add security headers to all responses
 * Include this at the top of cors.php
 */

// Prevent clickjacking
header("X-Frame-Options: DENY");

// Prevent MIME type sniffing
header("X-Content-Type-Options: nosniff");

// Enable XSS protection
header("X-XSS-Protection: 1; mode=block");

// Referrer policy
header("Referrer-Policy: strict-origin-when-cross-origin");

// Content Security Policy
header("Content-Security-Policy: default-src 'self'");

// Remove PHP version info
header_remove("X-Powered-By");
?>
