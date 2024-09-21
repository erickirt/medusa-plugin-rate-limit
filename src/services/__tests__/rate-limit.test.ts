import { type PluginOptions } from '../../types/options'
import { type Redis } from 'ioredis'

import RateLimitService from '../rate-limit'

const mockRedisClient = {
	incr: jest.fn(),
	expire: jest.fn(),
	get: jest.fn(),
	del: jest.fn(),
	ttl: jest.fn(),
} as unknown as jest.Mocked<Redis>

const defaultOptions: PluginOptions = {
	limit: 5,
	window: 60,
}

describe('RateLimitService', () => {
	let rateLimitService: RateLimitService

	beforeEach(() => {
		rateLimitService = new RateLimitService(
			{ redisClient: mockRedisClient },
			defaultOptions,
		)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('should increment the key and set expiry if it is the first request', async () => {
		mockRedisClient.incr.mockResolvedValueOnce(1)
		mockRedisClient.expire.mockResolvedValueOnce(1)

		const result = await rateLimitService.limit('test-key')

		expect(mockRedisClient.incr).toHaveBeenCalledWith('test-key')
		expect(mockRedisClient.expire).toHaveBeenCalledWith('test-key', 60)
		expect(result).toBe(true)
	})

	it('should return false if the limit is exceeded', async () => {
		mockRedisClient.incr.mockResolvedValueOnce(6)

		const result = await rateLimitService.limit('test-key')

		expect(mockRedisClient.incr).toHaveBeenCalledWith('test-key')
		expect(result).toBe(false)
	})

	it('should return the number of remaining attempts', async () => {
		mockRedisClient.get.mockResolvedValueOnce('3')

		const remainingAttempts =
			await rateLimitService.getRemainingAttempts('test-key')

		expect(mockRedisClient.get).toHaveBeenCalledWith('test-key')
		expect(remainingAttempts).toBe(2)
	})

	it('should reset the limit for the given key', async () => {
		await rateLimitService.resetLimit('test-key')

		expect(mockRedisClient.del).toHaveBeenCalledWith('test-key')
	})

	it('should return the time to live for the given key', async () => {
		mockRedisClient.ttl.mockResolvedValueOnce(30)

		const ttl = await rateLimitService.ttl('test-key')

		expect(mockRedisClient.ttl).toHaveBeenCalledWith('test-key')
		expect(ttl).toBe(30)
	})

	it('should return the default options', () => {
		const options = rateLimitService.getOptions()

		expect(options).toEqual(defaultOptions)
	})
})
