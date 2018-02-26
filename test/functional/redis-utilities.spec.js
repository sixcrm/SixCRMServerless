'use strict'

const expect = require('chai').expect;
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');

describe('Test redis utils functionality', () => {

  it('successfully connects / disconnects to the Redis server', () => {

    let redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

    return redisutilities.connect().then(() => {
      expect(redisutilities).to.have.property("redis_client").to.have.property('connected').equal(true);
      return redisutilities.quit().then(() => {
        expect(redisutilities).to.have.property("redis_client").to.have.property('connected').equal(true);
        return timestamp.delay(1)().then(() => {
          expect(redisutilities).to.have.property("redis_client").to.have.property('connected').equal(false);
          return true;
        })
      })
    });
  });

  it('set/get plain string values', () => {

    let redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

    let test_value = 'abcdef';

    return redisutilities.set('test1', test_value)
      .then((result) => {
        expect(result).to.equal('OK');
        return true;
      })
      .then(() => redisutilities.get('test1'))
      .then((result) => {
        expect(result).to.equal(test_value);
        return true;
      })

  });

  it('set/get object values', () => {

    let redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

    let test_value = {'abc': 150, 'def': {'nested_value': 123}};

    return redisutilities.set('test2', test_value)
      .then((result) => {
        expect(result).to.equal('OK');
        return true;
      })
      .then(() => redisutilities.get('test2'))
      .then((result) => {
        expect(result).to.deep.equal(test_value);
        return true;
      })

  });

  // Uses light white-box testing to determine connection reusage
  it('set/get object values reusing the connection', () => {

    let redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

    redisutilities.quiting_timer_timeout_ms = 1000;
    let initial_redis_client_promisified = redisutilities.redis_client_promisified;

    let test_value = {'abc': 150, 'def': {'nested_value': 123}};

    return redisutilities.set('test3', test_value)
      .then((result) => {
        expect(result).to.equal('OK');
        return true;
      })
      .then(timestamp.delay(200))
      .then(() => redisutilities.get('test3'))
      .then((result) => {
        expect(result).to.deep.equal(test_value);
        expect(initial_redis_client_promisified).to.equal(redisutilities.redis_client_promisified);
        return true;
      })

  });

  // Uses light white-box testing to determine connection reusage
  it('set/get object values shutting down the connection', () => {

    let redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

    redisutilities.quiting_timer_timeout_ms = 100;
    let initial_redis_client_promisified = redisutilities.redis_client_promisified;

    let test_value = {'abc': 150, 'def': {'nested_value': 123}};

    return redisutilities.set('test4', test_value)
      .then((result) => {
        expect(result).to.equal('OK');
        return true;
      })
      .then(timestamp.delay(200))
      .then(() => redisutilities.get('test4'))
      .then((result) => {
        expect(result).to.deep.equal(test_value);
        expect(initial_redis_client_promisified).to.not.equal(redisutilities.redis_client_promisified);
        return true;
      })

  });

  it('flushing db', () => {

    let redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');

    let test_value = 'abcdef';

    return redisutilities.set('test5', test_value)
      .then((result) => {
        expect(result).to.equal('OK');
        return true;
      })
      .then(() => redisutilities.flushAll())
      .then(() => redisutilities.get('test5'))
      .then((result) => {
        expect(result).to.equal(null);
        return true;
      })

  });

  // TODO: think how to cover reconnection strategy
});