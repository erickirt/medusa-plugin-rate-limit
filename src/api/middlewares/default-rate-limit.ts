import { type MedusaRequest, type MedusaResponse } from '@medusajs/medusa'
import type { NextFunction } from 'express'
import type RateLimitService from '../../services/rate-limit'

/**
 * A simple rate limiter middleware based on the RateLimitService
 * @param limit {number} - Number of requests allowed per window
 * @param window  {number} - Number of seconds to wait before allowing requests again
 * @returns
 */
export default async function defaultRateLimit(
	req: MedusaRequest,
	res: MedusaResponse,
	next: NextFunction,
) {
	try {
		const rateLimitService = req.scope.resolve<RateLimitService>('rateLimitService')

		const key = req.ip
		const rateLimitKey = `rate_limit:${key}`
		const allowed = await rateLimitService.limit(rateLimitKey)

		if (!allowed) {
			const retryAfter = await rateLimitService.ttl(rateLimitKey)
			res.set('Retry-After', String(retryAfter))
			res
				.status(429)
				.json({ error: 'Too many requests, please try again later.' })
			return
		}

		const remaining = await rateLimitService.getRemainingAttempts(rateLimitKey)

		res.set('X-RateLimit-Limit', String(rateLimitService.getOptions().limit))
		res.set('X-RateLimit-Remaining', String(remaining))

		next()
	} catch (error) {
		next(error)
	}
}