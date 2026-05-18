<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Contracts\Auth\Factory as Auth;

class Authenticate
{
    /**
     * The authentication guard factory instance.
     *
     * @var \Illuminate\Contracts\Auth\Factory
     */
    protected $auth;

    /**
     * Create a new middleware instance.
     *
     * @param  \Illuminate\Contracts\Auth\Factory  $auth
     * @return void
     */
    public function __construct(Auth $auth)
    {
        $this->auth = $auth;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string|null  $guard
     * @return mixed
     */
    public function handle($request, Closure $next, $guard = null)
    {
        // If a specific guard is provided, check that guard
        if ($guard) {
            if ($this->auth->guard($guard)->guest()) {
                return response('Unauthorized.', 401);
            }
            return $next($request);
        }

        // If no guard is specified, try 'api' first, then 'students'
        if (!$this->auth->guard('api')->guest()) {
            $this->auth->shouldUse('api');
            return $next($request);
        }

        if (!$this->auth->guard('students')->guest()) {
            $this->auth->shouldUse('students');
            return $next($request);
        }

        return response('Unauthorized.', 401);
    }
}
