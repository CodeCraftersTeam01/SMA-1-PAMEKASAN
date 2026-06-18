<?php

namespace App\Http\Middleware;

use Closure;

class CorsMiddleware
{
    public function handle($request, Closure $next)
    {
        // Allowlist of origins permitted to send credentialed requests.
        // Configure via CORS_ALLOWED_ORIGINS in .env (comma-separated).
        $allowedOrigins = array_filter(array_map('trim', explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:5173,http://localhost:5174'))));
        $origin = $request->header('Origin');
        $allowOrigin = ($origin && in_array($origin, $allowedOrigins, true)) ? $origin : ($allowedOrigins[0] ?? 'http://localhost:5174');

        $headers = [
            'Access-Control-Allow-Origin'      => $allowOrigin,
            'Vary'                             => 'Origin',
            'Access-Control-Allow-Methods'     => 'POST, GET, OPTIONS, PUT, DELETE',
            'Access-Control-Allow-Credentials' => 'true',
            'Access-Control-Allow-Headers'     => 'Content-Type, Authorization, X-Requested-With, Accept, Origin, x-api-key'
        ];

        if ($request->isMethod('OPTIONS')) {
            return response('', 200, $headers);
        }

        $response = $next($request);
        
        foreach ($headers as $key => $value) {
            if (method_exists($response, 'header')) {
                $response->header($key, $value);
            } else if (isset($response->headers)) {
                $response->headers->set($key, $value);
            }
        }

        return $response;
    }
}
