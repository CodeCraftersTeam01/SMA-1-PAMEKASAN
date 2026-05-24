<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class PermissionMiddleware
{
    public function handle(Request $request, Closure $next, $resource, $action = 'view')
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (!$user->hasPermission($resource, $action)) {
            return response()->json([
                'message' => 'Forbidden. Anda tidak memiliki izin untuk melakukan aksi ini.'
            ], 403);
        }

        return $next($request);
    }
}
