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

        // Fail closed: only account types that implement permission checks
        // (i.e. admin/staff User model) may pass. Student accounts or any
        // model without hasPermission() are denied access to admin resources.
        if (!method_exists($user, 'hasPermission') || !$user->hasPermission($resource, $action)) {
            return response()->json([
                'message' => 'Forbidden. Anda tidak memiliki izin untuk melakukan aksi ini.'
            ], 403);
        }

        return $next($request);
    }
}
