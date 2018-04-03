'use strict'

const expect = require('chai').expect;
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');

describe('Test redis providers functionality', () => {

  it('successfully connects / disconnects to the Redis server', () => {

    let RedisProvider = global.SixCRM.routes.include('lib', 'providers/redis-provider.js');
    const redisprovider = new RedisProvider();

    return redisprovider.connect().then(() => {
      expect(redisprovider).to.have.property("redis_client").to.have.property('connected').equal(true);
      return redisprovider.quit().then(() => {
        expect(redisprovider).to.have.property("redis_client").to.have.property('connected').equal(true);
        return timestamp.delay(1)().then(() => {
          expect(redisprovider).to.have.property("redis_client").to.have.property('connected').equal(false);
          return true;
        })
      })
    });
  });

  it('set/get plain string values', () => {

    let RedisProvider = global.SixCRM.routes.include('lib', 'providers/redis-provider.js');
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

    let RedisProvider = global.SixCRM.routes.include('lib', 'providers/redis-provider.js');
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

  // Uses light white-box testing to determine connection reusage
  it('set/get object values reusing the connection', () => {

    let RedisProvider = global.SixCRM.routes.include('lib', 'providers/redis-provider.js');
    const redisprovider = new RedisProvider();

    redisprovider.quiting_timer_timeout_ms = 1000;
    let initial_redis_client_promisified = redisprovider.redis_client_promisified;

    let test_value = {'abc': 150, 'def': {'nested_value': 123}};

    return redisprovider.set('test3', test_value)
      .then((result) => {
        expect(result).to.equal('OK');
        return true;
      })
      .then(timestamp.delay(200))
      .then(() => redisprovider.get('test3'))
      .then((result) => {
        expect(result).to.deep.equal(test_value);
        expect(initial_redis_client_promisified).to.equal(redisprovider.redis_client_promisified);
        return true;
      })

  });

  // Uses light white-box testing to determine connection reusage
  it('set/get object values shutting down the connection', () => {

    let RedisProvider = global.SixCRM.routes.include('lib', 'providers/redis-provider.js');
    const redisprovider = new RedisProvider();

    redisprovider.quiting_timer_timeout_ms = 100;
    let initial_redis_client_promisified = redisprovider.redis_client_promisified;

    let test_value = {'abc': 150, 'def': {'nested_value': 123}};

    return redisprovider.set('test4', test_value)
      .then((result) => {
        expect(result).to.equal('OK');
        return true;
      })
      .then(timestamp.delay(200))
      .then(() => redisprovider.get('test4'))
      .then((result) => {
        expect(result).to.deep.equal(test_value);
        expect(initial_redis_client_promisified).to.not.equal(redisprovider.redis_client_promisified);
        return true;
      })

  });

  it('flushing db', () => {

    let RedisProvider = global.SixCRM.routes.include('lib', 'providers/redis-provider.js');
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