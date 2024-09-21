import express from 'express'
import { type Redis } from 'ioredis'
import { type MedusaContainer } from 'medusa-core-utils'
import request from 'supertest'

import RateLimitService from '../../services/rate-limit'
import defaultRateLimit from '../middlewares/default-rate-limit'

const mockRedisClient = {
	incr: jest.fn(),
	expire: jest.fn(),
	get: jest.fn(),
	del: jest.fn(),
	ttl: jest.fn(),
} as unknown as jest.Mocked<Redis>

const mockContainer = {
	resolve: jest
		.fn()
		.mockReturnValue(
			new RateLimitService(
				{ redisClient: mockRedisClient },
				{ limit: 5, window: 60 },
			),
		),
}

const app = express()
app.use((req, res, next) => {
	req.scope = mockContainer as unknown as jest.Mocked<MedusaContainer>
	next()
})
app.use(defaultRateLimit)
app.get('/test', (req, res) => {
	res.status(200).send('OK')
})

describe('Rate Limit Middleware', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should allow requests under the limit', async () => {
		mockRedisClient.incr.mockResolvedValueOnce(1)
		mockRedisClient.expire.mockResolvedValueOnce(1)

		const response = await request(app).get('/test')

		expect(response.status).toBe(200)
		expect(response.text).toBe('OK')
	})

	it('should block requests over the limit', async () => {
		mockRedisClient.incr.mockResolvedValueOnce(6)
		mockRedisClient.ttl.mockResolvedValueOnce(60)

		const response = await request(app).get('/test')

		expect(response.status).toBe(429)
		expect(response.body).toEqual({
			error: 'Too many requests, please try again later.',
		})
	})

	it('should return the correct headers', async () => {
		mockRedisClient.incr.mockResolvedValueOnce(1)
		mockRedisClient.expire.mockResolvedValueOnce(60)
		mockRedisClient.get.mockResolvedValueOnce('1')

		const response = await request(app).get('/test')

		expect(response.headers['x-ratelimit-limit']).toBe('5')
		expect(response.headers['x-ratelimit-remaining']).toBe('4')
	})
})
