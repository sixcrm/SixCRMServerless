const expect = require('chai').expect;
const RedisProvider = global.SixCRM.routes.include('controllers', 'providers/redis-provider.js');

describe('Test redis providers functionality', () => {

	it('successfully connects / disconnects to the Redis server', () => {

		const redisprovider = new RedisProvider();
		expect(redisprovider.connect().then(() => redisprovider.dispose())).to.be.fulfilled;

	});

	it('set/get plain string values', async () => {

		const redisprovider = new RedisProvider();
		await redisprovider.withConnection(async () => {

			let test_value = 'abcdef';

			await redisprovider.set('test1', test_value);
			let result = await redisprovider.get('test1');
			expect(result).to.equal(test_value);

		});

	});

	it('set/get object values', async () => {

		const redisprovider = new RedisProvider();
		await redisprovider.withConnection(async () => {

			let test_value = {'abc': 150, 'def': {'nested_value': 123}};

			await redisprovider.set('test2', test_value);
			let result = await redisprovider.get('test2');
			expect(result).to.deep.equal(test_value);

		});

	});

	it('flushing db', async () => {

		const redisprovider = new RedisProvider();
		await redisprovider.withConnection(async () => {

			let test_value = 'abcdef';

			await redisprovider.set('test5', test_value);
			await redisprovider.flushAll();
			let result = await redisprovider.get('test5');
			expect(result).to.equal(null);

		});

	});

	// TODO: think how to cover reconnection strategy
});
