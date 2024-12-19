import {
	type MedusaNextFunction,
	type MedusaRequest,
	type MedusaResponse,
} from '@medusajs/framework/http'
import { type ICacheService } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'

import { type PluginOptions } from '../../constants'
import { getDefaultOptions } from '../../utils/get-default-options'
import { getIp } from '../../utils/get-ip'
import { setRateLimitHeaders } from '../../utils/set-rate-limit-headers'

export function defaultRateLimit(options: Partial<PluginOptions> = {}) {
	return async function (
		req: MedusaRequest,
		res: MedusaResponse,
		next: MedusaNextFunction,
	) {
		const { limit, window, includeHeaders } = {
			...getDefaultOptions(),
			...options,
		}

		const cacheModule = req.scope.resolve<ICacheService>(Modules.CACHE)

		const ip = getIp(req)
		const key = `rate-limit:${ip}`
		const currentCount = (await cacheModule.get<number>(key)) || 0

		if (currentCount >= limit) {
			if (includeHeaders) {
				setRateLimitHeaders(res, limit, 0)
			}
			res.status(429).send('Too many requests, please try again later.')
			return
		}

		await cacheModule.set(key, currentCount + 1, window)

		if (includeHeaders) {
			setRateLimitHeaders(res, limit, limit - (currentCount + 1))
		}

		next()
	}
}