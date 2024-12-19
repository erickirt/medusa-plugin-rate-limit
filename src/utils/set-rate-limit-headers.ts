import { type MedusaResponse } from '@medusajs/framework/http'

export function setRateLimitHeaders(
	res: MedusaResponse,
	limit: number,
	remaining: number,
) {
	res.setHeader('X-RateLimit-Limit', String(limit))
	res.setHeader('X-RateLimit-Remaining', String(remaining))
}
