import * as chai from 'chai';
const expect = chai.expect;
import * as _ from 'lodash';
import objectutilities from '../../../src/util/object-utilities';
import arrayutilities from '../../../src/util/array-utilities';

describe('lib/object-utilities', () => {

	describe('recursiveMerge', () => {

		it('successfully merges objects', () => {

			const authority_object = {
				abc: '123',
				somearray: ['this', 'is', {}, 123, 'a array'],
				testobject: {
					mykey: 'my value'
				},
				differenttypes: {
					objecttype: 'this should be present'
				}
			};

			const secondary_object = {
				abc: '456',
				test: 'this is a test',
				testobject: {
					mykey: 'someothervalue',
					hasakey: 'someother value'
				},
				differenttypes: 123,
				nulltype: null
			};

			const expected_merged_object = {
				abc: '123',
				test: 'this is a test',
				somearray: ['this', 'is', {}, 123, 'a array'],
				testobject: {
					mykey: 'my value',
					hasakey: 'someother value'
				},
				differenttypes: {
					objecttype: 'this should be present'
				},
				nulltype: null
			};

			const merged_object = objectutilities.recursiveMerge(authority_object, secondary_object);

			expect(merged_object).to.deep.equal(expected_merged_object);

		});

	});

	describe('has', () => {

		it('should return false when it\'s not an object', () => {
			expect(objectutilities.has([], 'test')).to.equal(false);
		});

		it('should return false when object is missing specified property', () => {
			expect(objectutilities.has({}, 'test', false)).to.equal(false);
		});

		it('should return true when object has properties', () => {
			expect(objectutilities.has({test: {test2: 'hello'}}, 'test')).to.equal(true);
		});

		it('should fail when object is missing specified property and fatal is set to true', () => {
			try {
				objectutilities.has({}, 'test', true);
				expect.fail();
			} catch (error) {
				expect(error.message).to.equal('[500] Object missing property "test".');
			}
		});

		it('should fail due to non string properties and fatal is set to true', () => {
			try {
				// properties object with any value that is not a string
				objectutilities.has({}, [1], true);
				expect.fail();
			} catch (error) {
				expect(error.message).to.equal('[500] Unrecognized properties object: 1');
			}
		});

		it('returns false when object has non string properties', () => {
			// properties object with any value that is not a string
			expect(objectutilities.has({}, [1], false)).to.equal(false);
		});

		it('should return true when object has properties that are strings', () => {
			expect(objectutilities.has({test: {test2: 'hello'}}, ['test'])).to.equal(true);
		});

		it('should fail due to object missing property with fatal set to true', () => {
			try {
				objectutilities.has({}, ['test'], true);
				expect.fail();
			} catch (error) {
				expect(error.message).to.equal('[500] Object missing property "test".');
			}
		});

		it('should fail due to object missing property', () => {
			expect(objectutilities.has({}, ['test'], false)).to.equal(false);
		});

	});

	describe('hasRecursive', () => {

		it('should fail with empty key argumentation', () => {

			try {
				objectutilities.hasRecursive({}, []);
				expect.fail();
			} catch (error) {
				expect(error.message).to.equal('[500] key array must be of length 1 or greater.');
			}

		});

		it('should fail with fatal argumentation', () => {

			try {
				objectutilities.hasRecursive({}, ['test'], true);
				expect.fail();
			} catch (error) {
				expect(error.message).to.equal('[500] Expected object to have key "test"');
			}

		});

		it('should return false', () => {

			expect(objectutilities.hasRecursive({}, ['test'])).to.equal(false);

		});

		it('should fail due to invalid argumentation (object)', () => {

			try {

				objectutilities.hasRecursive({test: 'hello'}, {} as string, true);
				expect.fail();

			} catch (error) {

				expect(error.message).to.equal('[500] Key must be a array or a string.');

			}

		});

		it('should fail due to invalid argumentation (object in array)', () => {

			try {

				objectutilities.hasRecursive({test: 'hello'}, [{} as string], true);
				expect.fail();

			} catch (error) {

				expect(error.message).to.equal('[500] Non-string key observed.');

			}

		});

		it('should return true for array argument (one dimensional)', () => {

			expect(objectutilities.hasRecursive({test: 'hello'}, ['test'])).to.equal(true);

		});

		it('should return true for string argument (one dimensional)', () => {

			expect(objectutilities.hasRecursive({test: 'hello'}, 'test')).to.equal(true);

		});

		it('should return true for string argument (one dimensional) with arbitrary property types', () => {

			expect(objectutilities.hasRecursive({test: {test2: 'hello'}}, 'test')).to.equal(true);
			expect(objectutilities.hasRecursive({test: 'hello'}, 'test')).to.equal(true);
			expect(objectutilities.hasRecursive({test: null}, 'test')).to.equal(true);
			expect(objectutilities.hasRecursive({test: false}, 'test')).to.equal(true);
			expect(objectutilities.hasRecursive({test: true}, 'test')).to.equal(true);
			expect(objectutilities.hasRecursive({test: {}}, 'test')).to.equal(true);
			expect(objectutilities.hasRecursive({test: ['hello']}, 'test')).to.equal(true);
			expect(objectutilities.hasRecursive({test: () => 'hello'}, 'test')).to.equal(true);

		});

		it('should return true for array argument (one dimensional) with arbitrary property types', () => {

			expect(objectutilities.hasRecursive({test: {test2: 'hello'}}, ['test'])).to.equal(true);
			expect(objectutilities.hasRecursive({test: 'hello'}, ['test'])).to.equal(true);
			expect(objectutilities.hasRecursive({test: null}, ['test'])).to.equal(true);
			expect(objectutilities.hasRecursive({test: false}, ['test'])).to.equal(true);
			expect(objectutilities.hasRecursive({test: true}, ['test'])).to.equal(true);
			expect(objectutilities.hasRecursive({test: {}}, ['test'])).to.equal(true);
			expect(objectutilities.hasRecursive({test: ['hello']}, ['test'])).to.equal(true);
			expect(objectutilities.hasRecursive({test: () => 'hello'}, ['test'])).to.equal(true);

		});

		it('should return true for array argument (two dimensional)', () => {

			expect(objectutilities.hasRecursive({test: {test2: 'hello'}}, ['test', 'test2'])).to.equal(true);

		});

		it('should return true for string argument (two dimensional)', () => {

			expect(objectutilities.hasRecursive({test: {test2: 'hello'}}, 'test.test2')).to.equal(true);

		});

		it('should return true for string argument (two dimensional) with arbitrary property types', () => {

			expect(objectutilities.hasRecursive({test: {test2: {test3: 'hello'}}}, 'test.test2')).to.equal(true);
			expect(objectutilities.hasRecursive({test: {test2: 'hello'}}, 'test.test2')).to.equal(true);
			expect(objectutilities.hasRecursive({test: {test2: null}}, 'test.test2')).to.equal(true);
			expect(objectutilities.hasRecursive({test: {test2: false}}, 'test.test2')).to.equal(true);
			expect(objectutilities.hasRecursive({test: {test2: true}}, 'test.test2')).to.equal(true);
			expect(objectutilities.hasRecursive({test: {test2: {}}}, 'test.test2')).to.equal(true);
			expect(objectutilities.hasRecursive({test: {test2: ['hello']}}, 'test.test2')).to.equal(true);
			expect(objectutilities.hasRecursive({test: {test2: () => 'hello'}}, 'test.test2')).to.equal(true);

		});

		it('should return true for array argument (two dimensional) with arbitrary property types', () => {

			expect(objectutilities.hasRecursive({test: {test2: {test3: 'hello'}}}, ['test', 'test2'])).to.equal(true);
			expect(objectutilities.hasRecursive({test: {test2: 'hello'}}, ['test', 'test2'])).to.equal(true);
			expect(objectutilities.hasRecursive({test: {test2: null}}, ['test', 'test2'])).to.equal(true);
			expect(objectutilities.hasRecursive({test: {test2: false}}, ['test', 'test2'])).to.equal(true);
			expect(objectutilities.hasRecursive({test: {test2: true}}, ['test', 'test2'])).to.equal(true);
			expect(objectutilities.hasRecursive({test: {test2: {}}}, ['test', 'test2'])).to.equal(true);
			expect(objectutilities.hasRecursive({test: {test2: ['hello']}}, ['test', 'test2'])).to.equal(true);
			expect(objectutilities.hasRecursive({test: {test2: () => 'hello'}}, ['test', 'test2'])).to.equal(true);

		});

		it('should return true for array argument (three dimensional)', () => {

			expect(objectutilities.hasRecursive({test: {test2: {test3: 'hello'}}}, ['test', 'test2', 'test3'])).to.equal(true);

		});

		it('should return true for string argument (two dimensional)', () => {

			expect(objectutilities.hasRecursive({test: {test2: {test3: 'hello'}}}, 'test.test2.test3')).to.equal(true);

		});

		it('should return false for array argument (three dimensional)', () => {

			expect(objectutilities.hasRecursive({test: {test2: {test4: 'hello'}}}, ['test', 'test2', 'test3'])).to.equal(false);

		});

		it('should return false for string argument (two dimensional)', () => {

			expect(objectutilities.hasRecursive({test: {test2: {test4: 'hello'}}}, 'test.test2.test3')).to.equal(false);

		});

		it('should return true for array argument (three dimensional with array index notation)', () => {

			expect(objectutilities.hasRecursive({test: [{another_key: {yet_another_key: '1'}}]}, 'test.0.another_key.yet_another_key', true)).to.equal(true);

		});

	});

	describe('setRecursive', () => {

		it('should fail with empty key argumentation', () => {

			try {
				objectutilities.setRecursive({}, [], undefined);
				expect.fail();
			} catch (error) {
				expect(error.message).to.equal('[500] key array must be of length 1 or greater.');
			}

		});

		it('should fail with fatal argumentation', () => {

			try {
				objectutilities.setRecursive({}, ['test'], 'hello', true);
				expect.fail();
			} catch (error) {
				expect(error.message).to.equal('[500] Expected object to have key "test"');
			}

		});

		it('should return empty object', () => {

			expect(objectutilities.setRecursive({}, ['test'], 'hello')).to.deep.equal({});

		});

		it('should fail due to invalid argumentation (object)', () => {

			try {

				objectutilities.setRecursive({test: 'hello'}, {} as string, true);
				expect.fail();

			} catch (error) {

				expect(error.message).to.equal('[500] Key must be a array or a string.');

			}

		});

		it('should fail due to invalid argumentation (object in array)', () => {

			try {

				objectutilities.setRecursive({test: 'hello'}, [{} as string], true);
				expect.fail();

			} catch (error) {

				expect(error.message).to.equal('[500] Non-string key observed.');

			}

		});

		it('should return object with key and value for array argument (one dimensional)', () => {

			expect(objectutilities.setRecursive({test: 'hello'}, ['test'], 'changed')).to.deep.equal({test: 'changed'});

		});

		it('should return object with key and value for string argument (one dimensional)', () => {

			expect(objectutilities.setRecursive({test: 'hello'}, 'test', 'changed')).to.deep.equal({test: 'changed'});

		});

		it('should return object with key and value for string argument (one dimensional) with arbitrary property types', () => {

			expect(objectutilities.setRecursive({test: {test2: 'hello'}}, 'test', 'changed')).deep.equal({test: 'changed'});
			expect(objectutilities.setRecursive({test: 'hello'}, 'test', 'changed')).deep.equal({test: 'changed'});
			expect(objectutilities.setRecursive({test: null}, 'test', 'hello')).deep.equal({test: 'hello'});
			expect(objectutilities.setRecursive({test: false}, 'test', 'hello')).deep.equal({test: 'hello'});
			expect(objectutilities.setRecursive({test: true}, 'test', 'hello')).deep.equal({test: 'hello'});
			expect(objectutilities.setRecursive({test: {}}, 'test', 'hello')).deep.equal({test: 'hello'});
			expect(objectutilities.setRecursive({test: ['hello']}, 'test', 'changed')).deep.equal({test: 'changed'});

			const changed = objectutilities.setRecursive({test: () => 'hello'}, 'test', () => 'hello');

			expect(changed.test()).to.equal('hello');

		});

		it('should return object with key and value for array argument (one dimensional) with arbitrary property types', () => {

			expect(objectutilities.setRecursive({test: {test2: 'hello'}}, ['test'], 'changed')).to.deep.equal({test: 'changed'});
			expect(objectutilities.setRecursive({test: 'hello'}, ['test'], 'changed')).to.deep.equal({test: 'changed'});
			expect(objectutilities.setRecursive({test: null}, ['test'], 'hello')).to.deep.equal({test: 'hello'});
			expect(objectutilities.setRecursive({test: false}, ['test'], 'hello')).to.deep.equal({test: 'hello'});
			expect(objectutilities.setRecursive({test: true}, ['test'], 'hello')).to.deep.equal({test: 'hello'});
			expect(objectutilities.setRecursive({test: {}}, ['test'], 'hello')).to.deep.equal({test: 'hello'});
			expect(objectutilities.setRecursive({test: ['hello']}, ['test'], 'changed')).to.deep.equal({test: 'changed'});

			const changed = objectutilities.setRecursive({test: () => 'hello'}, ['test'], () => 'hello');

			expect(changed.test()).to.equal('hello');
		});

		it('should return object with keys and value for array argument (two dimensional)', () => {

			expect(objectutilities.setRecursive({test: {test2: 'hello'}}, ['test', 'test2'], 'changed')).to.deep.equal({test: {test2: 'changed'}});

		});

		it('should return object with keys and value for string argument (two dimensional)', () => {

			expect(objectutilities.setRecursive({test: {test2: 'hello'}}, 'test.test2', 'changed')).to.deep.equal({test: {test2: 'changed'}});

		});

		it('should return object with key and value for string argument (two dimensional) with arbitrary property types', () => {

			expect(objectutilities.setRecursive({test: {test2: {test3: 'hello'}}}, 'test.test2', 'changed')).to.deep.equal({test: {test2: 'changed'}});
			expect(objectutilities.setRecursive({test: {test2: 'hello'}}, 'test.test2', 'changed')).to.deep.equal({test: {test2: 'changed'}});
			expect(objectutilities.setRecursive({test: {test2: null}}, 'test.test2', 'hello')).to.deep.equal({test: {test2: 'hello'}});
			expect(objectutilities.setRecursive({test: {test2: false}}, 'test.test2', 'hello')).to.deep.equal({test: {test2: 'hello'}});
			expect(objectutilities.setRecursive({test: {test2: true}}, 'test.test2', 'hello')).to.deep.equal({test: {test2: 'hello'}});
			expect(objectutilities.setRecursive({test: {test2: {}}}, 'test.test2', 'hello')).to.deep.equal({test: {test2: 'hello'}});
			expect(objectutilities.setRecursive({test: {test2: ['hello']}}, 'test.test2', ['changed'])).to.deep.equal({test: {test2: ['changed']}});

			const changed = objectutilities.setRecursive({test: {test2: () => 'hello'}}, 'test.test2', () => 'hello');

			expect(changed.test.test2()).to.equal('hello');
		});

		it('should return return object with keys and value for array argument (two dimensional) with arbitrary property types', () => {

			expect(objectutilities.setRecursive({test: {test2: {test3: 'hello'}}}, ['test', 'test2'], 'changed')).to.deep.equal({test: {test2: 'changed'}});
			expect(objectutilities.setRecursive({test: {test2: 'hello'}}, ['test', 'test2'], 'changed')).to.deep.equal({test: {test2: 'changed'}});
			expect(objectutilities.setRecursive({test: {test2: null}}, ['test', 'test2'], 'hello')).to.deep.equal({test: {test2: 'hello'}});
			expect(objectutilities.setRecursive({test: {test2: false}}, ['test', 'test2'], 'hello')).to.deep.equal({test: {test2: 'hello'}});
			expect(objectutilities.setRecursive({test: {test2: true}}, ['test', 'test2'], 'hello')).to.deep.equal({test: {test2: 'hello'}});
			expect(objectutilities.setRecursive({test: {test2: {}}}, ['test', 'test2'], {})).to.deep.equal({test: {test2: {}}});
			expect(objectutilities.setRecursive({test: {test2: ['hello']}}, ['test', 'test2'], ['changed'])).to.deep.equal({test: {test2: ['changed']}});

			const changed = objectutilities.setRecursive({test: {test2: () => 'hello'}}, ['test.test2'], () => 'hello');

			expect(changed.test.test2()).to.equal('hello');

		});

		it('should return return object with keys and value for array argument (three dimensional)', () => {

			expect(objectutilities.setRecursive({test: {test2: {test3: 'hello'}}}, ['test', 'test2', 'test3'], 'changed')).to.deep.equal({test: {test2: {test3: 'changed'}}});

		});

		it('should return object with keys and value for string argument (two dimensional)', () => {

			expect(objectutilities.setRecursive({test: {test2: {test3: 'hello'}}}, 'test.test2.test3', 'changed')).to.deep.equal({test: {test2: {test3: 'changed'}}});

		});

		it('should return object with keys and value for array argument (three dimensional)', () => {

			expect(objectutilities.setRecursive({test: {test2: {test4: 'hello'}}}, ['test', 'test2', 'test3'], 'changed')).to.deep.equal({test: {test2: {test4: 'hello'}}});

		});

		it('should return object with keys and value for string argument (two dimensional)', () => {

			expect(objectutilities.setRecursive({test: {test2: {test4: 'hello'}}}, 'test.test2.test3', 'changed')).to.deep.equal({test: {test2: {test4: 'hello'}}});

		});

		it('should return object with keys and value for array argument (three dimensional with array index notation)', () => {

			expect(objectutilities.setRecursive({test: [{another_key: {yet_another_key: '1'}}]}, 'test.0.another_key.yet_another_key', '2', true))
				.to.deep.equal({test: [{another_key: {yet_another_key: '2'}}]});

		});

	});

	describe('getRecursive', () => {

		it('should fail with empty key argumentation', () => {

			try {
				objectutilities.getRecursive({}, []);
				expect.fail();
			} catch (error) {
				expect(error.message).to.equal('[500] key array must be of length 1 or greater.');
			}

		});

		it('should fail with fatal argumentation', () => {

			try {
				objectutilities.getRecursive({}, ['test'], true);
				expect.fail();
			} catch (error) {
				expect(error.message).to.equal('[500] Expected object to have key "test"');
			}

		});

		it('should return undefined', () => {

			expect(objectutilities.getRecursive({}, ['test'])).to.equal(undefined);

		});

		it('should fail due to invalid argumentation (object)', () => {

			try {

				objectutilities.getRecursive({test: 'hello'}, {} as string, true);
				expect.fail();

			} catch (error) {

				expect(error.message).to.equal('[500] Key must be a array or a string.');

			}

		});

		it('should fail due to invalid argumentation (object in array)', () => {

			try {

				objectutilities.getRecursive({test: 'hello'}, [{} as string], true);
				expect.fail();

			} catch (error) {

				expect(error.message).to.equal('[500] Non-string key observed.');

			}

		});

		it('should return value for array argument (one dimensional)', () => {

			expect(objectutilities.getRecursive({test: 'hello'}, ['test'])).to.equal('hello');

		});

		it('should return value for string argument (one dimensional)', () => {

			expect(objectutilities.getRecursive({test: 'hello'}, 'test')).to.equal('hello');

		});

		it('should return value for string argument (one dimensional) with arbitrary property types', () => {

			expect(objectutilities.getRecursive({test: {test2: 'hello'}}, 'test')).to.deep.equal({test2: 'hello'});
			expect(objectutilities.getRecursive({test: 'hello'}, 'test')).to.equal('hello');
			expect(objectutilities.getRecursive({test: null}, 'test')).to.equal(null);
			expect(objectutilities.getRecursive({test: false}, 'test')).to.equal(false);
			expect(objectutilities.getRecursive({test: true}, 'test')).to.equal(true);
			expect(objectutilities.getRecursive({test: {}}, 'test')).to.deep.equal({});
			expect(objectutilities.getRecursive({test: ['hello']}, 'test')).to.deep.equal(['hello']);
			const cb = () => 'hello';

			expect(objectutilities.getRecursive({test: cb}, 'test')).to.equal(cb);

		});

		it('should return value for array argument (one dimensional) with arbitrary property types', () => {

			expect(objectutilities.getRecursive({test: {test2: 'hello'}}, ['test'])).to.deep.equal({test2: 'hello'});
			expect(objectutilities.getRecursive({test: 'hello'}, ['test'])).to.equal('hello');
			expect(objectutilities.getRecursive({test: null}, ['test'])).to.equal(null);
			expect(objectutilities.getRecursive({test: false}, ['test'])).to.equal(false);
			expect(objectutilities.getRecursive({test: true}, ['test'])).to.equal(true);
			expect(objectutilities.getRecursive({test: {}}, ['test'])).to.deep.equal({});
			expect(objectutilities.getRecursive({test: ['hello']}, ['test'])).to.deep.equal(['hello']);
			const cb = () => 'hello';

			expect(objectutilities.getRecursive({test: cb}, ['test'])).to.equal(cb);

		});

		it('should return value for array argument (two dimensional)', () => {

			expect(objectutilities.getRecursive({test: {test2: 'hello'}}, ['test', 'test2'])).to.equal('hello');

		});

		it('should return value for string argument (two dimensional)', () => {

			expect(objectutilities.getRecursive({test: {test2: 'hello'}}, 'test.test2')).to.equal('hello');

		});

		it('should return value for string argument (two dimensional) with arbitrary property types', () => {

			expect(objectutilities.getRecursive({test: {test2: {test3: 'hello'}}}, 'test.test2')).to.deep.equal({test3: 'hello'});
			expect(objectutilities.getRecursive({test: {test2: 'hello'}}, 'test.test2')).to.equal('hello');
			expect(objectutilities.getRecursive({test: {test2: null}}, 'test.test2')).to.equal(null);
			expect(objectutilities.getRecursive({test: {test2: false}}, 'test.test2')).to.equal(false);
			expect(objectutilities.getRecursive({test: {test2: true}}, 'test.test2')).to.equal(true);
			expect(objectutilities.getRecursive({test: {test2: {}}}, 'test.test2')).to.deep.equal({});
			expect(objectutilities.getRecursive({test: {test2: ['hello']}}, 'test.test2')).to.deep.equal(['hello']);
			const cb = () => 'hello';

			expect(objectutilities.getRecursive({test: {test2: cb}}, 'test.test2')).to.equal(cb);

		});

		it('should return value for array argument (two dimensional) with arbitrary property types', () => {

			expect(objectutilities.getRecursive({test: {test2: {test3: 'hello'}}}, ['test', 'test2'])).to.deep.equal({test3: 'hello'});
			expect(objectutilities.getRecursive({test: {test2: 'hello'}}, ['test', 'test2'])).to.equal('hello');
			expect(objectutilities.getRecursive({test: {test2: null}}, ['test', 'test2'])).to.equal(null);
			expect(objectutilities.getRecursive({test: {test2: false}}, ['test', 'test2'])).to.equal(false);
			expect(objectutilities.getRecursive({test: {test2: true}}, ['test', 'test2'])).to.equal(true);
			expect(objectutilities.getRecursive({test: {test2: {}}}, ['test', 'test2'])).to.deep.equal({});
			expect(objectutilities.getRecursive({test: {test2: ['hello']}}, ['test', 'test2'])).to.deep.equal(['hello']);
			const cb = () => 'hello';

			expect(objectutilities.getRecursive({test: {test2: cb}}, ['test', 'test2'])).to.equal(cb);

		});

		it('should return value for array argument (three dimensional)', () => {

			expect(objectutilities.getRecursive({test: {test2: {test3: 'hello'}}}, ['test', 'test2', 'test3'])).to.equal('hello');

		});

		it('should return value for string argument (two dimensional)', () => {

			expect(objectutilities.getRecursive({test: {test2: {test3: 'hello'}}}, 'test.test2.test3')).to.equal('hello');

		});

		it('should return undefined for array argument (three dimensional)', () => {

			expect(objectutilities.getRecursive({test: {test2: {test4: 'hello'}}}, ['test', 'test2', 'test3'])).to.deep.equal(undefined);

		});

		it('should return undefined for string argument (two dimensional)', () => {

			expect(objectutilities.getRecursive({test: {test2: {test4: 'hello'}}}, 'test.test2.test3')).to.deep.equal(undefined);

		});

		it('should return value for array argument (three dimensional with array index notation)', () => {

			expect(objectutilities.getRecursive({test: [{another_key: {yet_another_key: '1'}}]}, 'test.0.another_key.yet_another_key', true)).to.equal('1');

		});

	});

	describe('getClassName', () => {

		it('returns class name', () => {
			expect(objectutilities.getClassName({constructor: {name: 'test'}})).to.equal('test');
		});

		it('returns null when class name is', () => {
			expect(objectutilities.getClassName({constructor: {}})).to.equal(null);
		});
	});

	describe('nonEmpty', () => {

		it('returns false if parameter is not an object', () => {
			expect(objectutilities.nonEmpty('test')).to.be.false;
		});

		it('throws error if fatal is true', () => {
			try {
				objectutilities.nonEmpty({}, true);
			} catch (error) {
				expect(error.message).to.equal('[500] Object is empty.');
			}
		});
	});

	describe('recurseByDepth', () => {

		it('returns result if sent function was successful', () => {
			// send any function
			expect(objectutilities.recurseByDepth(
				{a_key: 'a_value'},
				() => true
			)).to.equal('a_value');
		});

		it('throws error when second argument is not a function', () => {
			try {
				objectutilities.recurseByDepth({}, 'not_a_function');
			} catch (error) {
				expect(error.message).to.equal('[500] Match function must be a function.');
			}
		});

		it('returns null when first argument is not an object', () => {

			const unexpected_params = ['unexpected_element', '123', '-123', '', 123, 11.22, -123, true];

			unexpected_params.forEach((param) => {
				expect(objectutilities.recurseByDepth(param, undefined)).to.equal(null);
			});

		});

		it('successfully returns matched value', () => {

			const params = {
				a: 'v1',
				b: 'v2',
				c: {
					a: 'v3'
				}
			};

			const match_func = (key, value) => value === 'v3';

			expect(objectutilities.recurseByDepth(params, match_func)).to.equal('v3');

		});

		it('successfully returns matched value for more than one matched value (lower depth level goes first)', () => {

			const params = {
				a: 'v1',
				b: 'v2',
				c: {
					a: 'v2'
				}
			};

			const match_func = (key, value) => value === 'v2';

			expect(objectutilities.recurseByDepth(params, match_func)).to.equal('v2');

		});

		it('successfully returns matched value for more than one matched value (lower depth level goes second)', () => {

			const params = {
				a: 'a',
				b: {
					a: {
						a: {
							a: 'v2'
						}
					}
				},
				c: 'v3',
				d: 'v2'
			};

			const match_func = (key, value) => value === 'v2';

			expect(objectutilities.recurseByDepth(params, match_func)).to.equal('v2');

		});

		it('returns value when match was a success', () => {

			const params = {
				a: 'v1',
				b: 'v2',
				c: {
					a: {
						a: {
							a: {
								a: 'v3',
								b: 'v4',
								c: 'v5',
								d: 'v6'
							}
						}
					}
				}
			};

			const match_func = (key) => key === 'd';

			expect(objectutilities.recurseByDepth(params, match_func)).to.equal('v6');
		});

		it('returns null when value does not exist', () => {

			const params = {
				a: 'v1',
				b: 'v2',
				c: {
					a: 'v3'
				}
			};

			const match_func = (key, value) => value === 'v4';

			expect(objectutilities.recurseByDepth(params, match_func)).to.deep.equal(null);
		});
	});

	describe('recurseAll', () => {

		it('throws error when second argument is not a function', () => {
			try {
				objectutilities.recurseAll({}, 'not_a_function' as any);
			} catch (error) {
				expect(error.message).to.equal('[500] Match function must be a function.');
			}
		});

		it('returns null when first argument is not an object', () => {

			const unexpected_params = ['unexpected_element', '123', '-123', '', 123, 11.22, -123, true];

			unexpected_params.forEach((param) => {
				expect(objectutilities.recurseAll(param as any, 'not_a_function' as any)).to.equal(null);
			});

		});

		it('successfully returns depth level and matched value', () => {

			const params = {
				a: 'v1',
				b: 'v2',
				c: {
					a: 'v3'
				}
			};

			const match_func = (key, value) => value === 'v3';

			expect(objectutilities.recurseAll(params, match_func)).to.deep.equal([ { depth: 2, match: 'v3' } ] );

		});

		it('successfully returns depth level and matched value for more than one matched value (lower depth level goes first)', () => {

			const params = {
				a: 'v1',
				b: 'v2',
				c: {
					a: 'v2'
				}
			};

			const match_func = (key, value) => value === 'v2';

			expect(objectutilities.recurseAll(params, match_func)).to.deep.equal(
				[ { depth: 1, match: 'v2' }, { depth: 2, match: 'v2' } ]
			);

		});

		it('successfully returns depth level and matched value for more than one matched value (lower depth level goes second)', () => {

			const params = {
				a: 'v1',
				b: {
					a: {
						a: {
							a: 'v2'
						}
					}
				},
				c: 'v2',
				d: 'v3'
			};

			const match_func = (key, value) => value === 'v2';

			expect(objectutilities.recurseAll(params, match_func)).to.deep.equal(
				[ { depth: 4, match: 'v2' }, { depth: 1, match: 'v2' } ]
			);

		});

		it('returns depth level and matched value when match was a success', () => {

			const params = {
				a: 'v1',
				b: 'v2',
				c: {
					a: {
						a: {
							a: {
								a: 'v3',
								b: 'v4',
								c: 'v5',
								d: 'v6'
							}
						}
					}
				}
			};

			const match_func = (key) => key === 'd';

			expect(objectutilities.recurseAll(params, match_func, 0)).to.deep.equal([ { depth: 4, match: 'v6' } ]);
			expect(objectutilities.recurseAll(params, match_func, 3)).to.deep.equal([ { depth: 7, match: 'v6' } ]);
		});

		it('returns an empty array when value does not exist', () => {

			const params = {
				a: 'v1',
				b: 'v2',
				c: {
					a: 'v3'
				}
			};

			const match_func = (key, value) => value === 'v4';

			expect(objectutilities.recurseAll(params, match_func)).to.deep.equal([]);
		});
	});

	describe('recurse', () => {

		it('throws error when second argument is not a function', () => {
			const params = {
				a: 'v1',
				b: 'v2',
				c: {
					a: 'v3'
				}
			};

			try {
				objectutilities.recurse(params, 'not_a_function');
			} catch (error) {
				expect(error.message).to.equal('[500] Match function must be a function.');
			}
		});

		it('returns null when first argument is not an object', () => {
			const unexpected_params = ['unexpected_element', '123', '-123', '', 123, 11.22, -123, true];

			unexpected_params.forEach((param) => {
				expect(objectutilities.recurse(param as any, undefined)).to.equal(null);
			});
		});

		it('returns value when it exists in specified object', () => {
			const params = {
				a: 'v1',
				b: 'v2',
				c: {
					a: 'v3'
				}
			};

			const match_func = (key, value) => value === 'v3';

			expect(objectutilities.recurse(params, match_func)).to.equal('v3');
		});

		it('finds value by key name', () => {
			const params = {
				a: 'v1',
				b: 'v2',
				c: {
					a: 'v3'
				}
			};

			const match_func = (key) => key === 'c';

			expect(objectutilities.recurse(params, match_func)).to.deep.equal({ a: 'v3' });
		});

		it('returns first matched value', () => {
			const params = {
				a: 'v1',
				b: 'v2',
				c: {
					a: 'v3'
				}
			};

			const match_func = (key) => key === 'a';

			expect(objectutilities.recurse(params, match_func)).to.equal('v1');
		});

		it('finds a function', () => {
			const params = {
				a: 'v1',
				b: 'v2',
				c: () => 'found'
			};

			const match_func = (key, value) => _.isFunction(value);

			expect(objectutilities.recurse(params, match_func)()).to.equal('found');
		});

		it('returns null when value does not exist', () => {
			const params = {
				a: 'v1',
				b: 'v2',
				c: {
					a: 'v3'
				}
			};

			const match_func = (key, value) => value === 'v4';

			expect(objectutilities.recurse(params, match_func)).to.equal(null);
		});

		it('returns null when key does not exist', () => {
			const params = {
				a: 'v1',
				b: 'v2',
				c: {
					a: 'v3'
				}
			};

			const match_func = (key) => key === 'd';

			expect(objectutilities.recurse(params, match_func)).to.equal(null);
		});

	});

	describe('orderedRecursion', () => {

		it('returns value from object', () => {
			// send any function
			expect(objectutilities.orderedRecursion(
				{a_key: 'a_value'},
				() => true
			)).to.equal('a_value');
		});

		it('returns null when there is no recursion result', () => {
			// send any function
			expect(objectutilities.orderedRecursion(
				{a_key: ['a_value']},
				() => false
			)).to.equal(null);
		});
	});

	describe('getObjectType', () => {

		it('returns array', () => {
			expect(objectutilities.getObjectType(['an_array'])).to.equal('array');
		});

		it('returns string', () => {
			expect(objectutilities.getObjectType('a_string')).to.equal('string');
		});

		it('returns number', () => {
			expect(objectutilities.getObjectType(1)).to.equal('number');
		});

		it('returns boolean', () => {
			expect(objectutilities.getObjectType(true)).to.equal('boolean');
		});

		it('returns object', () => {
			expect(objectutilities.getObjectType({a_key: 'a_value'})).to.equal('object');
		});

		it('returns null', () => {
			expect(objectutilities.getObjectType(null)).to.equal(null);
		});
	});

	describe('isObject', () => {

		it('should return true for valid objects',  () => {

			const valid_objects = [{}, {hello: 'world'}];

			arrayutilities.map(valid_objects, (valid_object) => {
				expect(objectutilities.isObject(valid_object)).to.equal(true);
			});

		});

		it('should return false for invalid objects', () => {

			const invalid_objects = [123, 'abc', null, undefined, JSON.stringify({}), JSON.stringify({hello: 'world'})];

			arrayutilities.map(invalid_objects, (invalid_object) => {
				expect(objectutilities.isObject(invalid_object)).to.equal(false);
			});

		});

		it('should return true for valid objects when fatal is true',  () => {

			const valid_objects = [{}, {hello: 'world'}];

			arrayutilities.map(valid_objects, (valid_object) => {
				expect(objectutilities.isObject(valid_object, true)).to.equal(true);
			});

		});

		it('should throw an error for invalid objects when fatal is true',  () => {

			const invalid_objects = [123, 'abc', null, undefined, JSON.stringify({}), JSON.stringify({hello: 'world'})];

			arrayutilities.map(invalid_objects, (invalid_object) => {

				try {
					objectutilities.isObject(invalid_object, true);
				} catch (error) {
					expect(error.message).to.equal('[500] Thing is not an object.');
				}

			});

		});

	});

});
