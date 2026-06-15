<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

/**
 * Generic IP-based rate limiter to mitigate DDoS / flooding.
 *
 * Usage:
 *   - As global middleware (uses defaults: 120 req / 60s per IP)
 *   - As route middleware: 'throttle:30,60' => 30 requests per 60 seconds
 */
class ThrottleRequests
{
    /**
     * @param  int  $maxAttempts   Max requests allowed within the window
     * @param  int  $decaySeconds  Window length in seconds
     */
    public function handle(Request $request, Closure $next, $maxAttempts = 120, $decaySeconds = 60)
    {
        $maxAttempts  = (int) $maxAttempts;
        $decaySeconds = (int) $decaySeconds;

        // Key per client IP + route path so different endpoints have separate buckets.
        $key = 'rl:' . sha1($request->ip() . '|' . $request->method() . '|' . $request->path());

        $attempts = (int) Cache::get($key, 0);

        if ($attempts >= $maxAttempts) {
            $retryAfter = $decaySeconds;

            return response()->json([
                'message'     => 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
                'retry_after' => $retryAfter,
            ], 429)->withHeaders([
                'Retry-After'           => $retryAfter,
                'X-RateLimit-Limit'     => $maxAttempts,
                'X-RateLimit-Remaining' => 0,
            ]);
        }

        // First hit in the window sets the TTL; subsequent hits only increment.
        if ($attempts === 0) {
            Cache::put($key, 1, $decaySeconds);
            $attempts = 1;
        } else {
            $attempts = (int) Cache::increment($key);
        }

        $response = $next($request);

        if (method_exists($response, 'withHeaders')) {
            $response->withHeaders([
                'X-RateLimit-Limit'     => $maxAttempts,
                'X-RateLimit-Remaining' => max(0, $maxAttempts - $attempts),
            ]);
        } elseif (isset($response->headers)) {
            $response->headers->set('X-RateLimit-Limit', $maxAttempts);
            $response->headers->set('X-RateLimit-Remaining', max(0, $maxAttempts - $attempts));
        }

        return $response;
    }
}
