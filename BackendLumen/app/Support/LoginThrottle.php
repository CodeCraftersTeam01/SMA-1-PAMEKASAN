<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;

/**
 * Progressive login lockout.
 *
 * Rules:
 *  - Allow up to MAX_ATTEMPTS (5) failed attempts.
 *  - On the 5th failure the account/IP is locked.
 *  - Lockout duration grows each time the limit is hit again:
 *      1st lockout = 1 minute, 2nd = 2 minutes, 3rd = 3 minutes, ...
 *  - A successful login resets everything.
 */
class LoginThrottle
{
    const MAX_ATTEMPTS = 5;

    /** Base lockout window in seconds (1 minute). */
    const BASE_LOCK_SECONDS = 60;

    /** How long counters live while idle (so old failures eventually expire). */
    const COUNTER_TTL = 86400; // 24h

    protected string $attemptsKey;
    protected string $lockoutsKey;
    protected string $lockUntilKey;

    public function __construct(string $identifier)
    {
        $id = sha1(strtolower($identifier));
        $this->attemptsKey  = "login:attempts:{$id}";
        $this->lockoutsKey  = "login:lockouts:{$id}";
        $this->lockUntilKey = "login:lockuntil:{$id}";
    }

    /**
     * Seconds remaining until the lock is lifted, or 0 if not locked.
     */
    public function secondsUntilUnlock(): int
    {
        $lockUntil = (int) Cache::get($this->lockUntilKey, 0);
        $remaining = $lockUntil - time();

        return $remaining > 0 ? $remaining : 0;
    }

    public function isLocked(): bool
    {
        return $this->secondsUntilUnlock() > 0;
    }

    /**
     * Record a failed attempt. When attempts reach the cap, escalate the lock.
     *
     * @return int Seconds locked (0 if not yet locked).
     */
    public function recordFailure(): int
    {
        $attempts = (int) Cache::get($this->attemptsKey, 0) + 1;
        Cache::put($this->attemptsKey, $attempts, self::COUNTER_TTL);

        if ($attempts >= self::MAX_ATTEMPTS) {
            // Escalate the lockout multiplier each time the cap is hit.
            $lockouts = (int) Cache::get($this->lockoutsKey, 0) + 1;
            Cache::put($this->lockoutsKey, $lockouts, self::COUNTER_TTL);

            $lockSeconds = $lockouts * self::BASE_LOCK_SECONDS;
            Cache::put($this->lockUntilKey, time() + $lockSeconds, $lockSeconds);

            // Reset the per-window attempt counter so the next window starts fresh.
            Cache::forget($this->attemptsKey);

            return $lockSeconds;
        }

        return 0;
    }

    /**
     * Attempts remaining before the next lockout.
     */
    public function attemptsLeft(): int
    {
        $attempts = (int) Cache::get($this->attemptsKey, 0);

        return max(0, self::MAX_ATTEMPTS - $attempts);
    }

    /**
     * Clear all counters — call on successful login.
     */
    public function clear(): void
    {
        Cache::forget($this->attemptsKey);
        Cache::forget($this->lockoutsKey);
        Cache::forget($this->lockUntilKey);
    }
}
