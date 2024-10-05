import {
	type MedusaRequest,
	type MedusaResponse,
	type MedusaNextFunction,
} from '@medusajs/framework'
import {
	type ICacheService,
	type MedusaContainer,
} from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'
import express from 'express'
import request from 'supertest'
import { defaultRateLimit } from '../src/api/middlewares/default-rate-limit'

// Mock the cache service
const mockCacheService: jest.Mocked<ICacheService> = {
	get: jest.fn(),
	set: jest.fn(),
	invalidate: jest.fn(),
}

const mockScope = {
	resolve: jest.fn().mockImplementation((module) => {
		if (module === Modules.CACHE) {
			return mockCacheService
		}
		return {}
	}),
}

const app = express()
app.use((req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
	req.scope = mockScope as unknown as MedusaContainer
	next()
})

app.use(defaultRateLimit({ limit: 2, window: 60 }))

app.get('/', (req, res) => {
	res.send('Hello World')
})

describe('defaultRateLimit Middleware', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should allow requests under the limit', async () => {
		mockCacheService.get.mockResolvedValueOnce(0)

		const response = await request(app).get('/')
		expect(response.status).toBe(200)
		expect(response.text).toBe('Hello World')
	})

	it('should block requests over the limit', async () => {
		mockCacheService.get.mockResolvedValueOnce(2)

		const response = await request(app).get('/')
		expect(response.status).toBe(429)
		expect(response.text).toBe('Too many requests, please try again later.')
	})

	it('should include rate limit headers when includeHeaders is true', async () => {
		app.use(defaultRateLimit({ limit: 2, window: 60, includeHeaders: true }))
		mockCacheService.get.mockResolvedValueOnce(0)

		const response = await request(app).get('/')
		expect(response.headers['x-ratelimit-limit']).toBe('2')
		expect(response.headers['x-ratelimit-remaining']).toBe('1')
	})

	it('should not include rate limit headers when includeHeaders is false', async () => {
		const testApp = express()
		testApp.use(
			(req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
				req.scope = mockScope as unknown as MedusaContainer
				next()
			},
		)
		testApp.use(
			defaultRateLimit({ limit: 2, window: 60, includeHeaders: false }),
		)
		testApp.get('/', (req, res) => {
			res.send('Hello World')
		})

		mockCacheService.get.mockResolvedValueOnce(0)

		const response = await request(testApp).get('/')
		expect(response.headers['x-ratelimit-limit']).toBeUndefined()
		expect(response.headers['x-ratelimit-remaining']).toBeUndefined()
	})
})
