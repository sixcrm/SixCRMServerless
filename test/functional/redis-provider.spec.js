const expect = require('chai').expect;
const RedisProvider = global.SixCRM.routes.include('controllers', 'providers/redis-provider.js');

describe('Test redis providers functionality', () => {

	it('successfully connects / disconnects to the Redis server', () => {

		const redisprovider = new RedisProvider();
		expect(redisprovider.connect().then(() => redisprovider.dispose())).to.be.fulfilled;

	});

	it('set/get plain string values', () => {

		const redisprovider = new RedisProvider();

		let test_value = 'abcdef';

		return redisprovider.set('test1', test_value)
			.then((result) => {
				expect(result).to.equal('OK');
				return true;
			})
			.then(() => redisprovider.get('test1'))
			.then((result) => {
				expect(result).to.equal(test_value);
				return true;
			})

	});

	it('set/get object values', () => {

		const redisprovider = new RedisProvider();

		let test_value = {'abc': 150, 'def': {'nested_value': 123}};

		return redisprovider.set('test2', test_value)
			.then((result) => {
				expect(result).to.equal('OK');
				return true;
			})
			.then(() => redisprovider.get('test2'))
			.then((result) => {
				expect(result).to.deep.equal(test_value);
				return true;
			})

	});

	it('flushing db', () => {

		const redisprovider = new RedisProvider();

		let test_value = 'abcdef';

		return redisprovider.set('test5', test_value)
			.then((result) => {
				expect(result).to.equal('OK');
				return true;
			})
			.then(() => redisprovider.flushAll())
			.then(() => redisprovider.get('test5'))
			.then((result) => {
				expect(result).to.equal(null);
				return true;
			})

	});

	// TODO: think how to cover reconnection strategy
});
