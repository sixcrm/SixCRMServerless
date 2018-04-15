const chai = require('chai');
const expect = chai.expect;
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js')

describe('lib/array-utilities', () => {

	it('forEach', () => {
		let subject = [{foo: 1}, {foo: 2}, {foo: 3}];
		let expected = [{foo: 2}, {foo: 3}, {foo: 4}];

		arrayutilities.forEach(subject, x => x.foo++)
		expect(subject).to.deep.equal(expected);
	});

	it('throws error when second argument is not a function', () => {
		let subject = [{foo: 1}, {foo: 2}, {foo: 3}];
		let unexpected_params = ['unexpected_element', '123', '-123', '', 123, 11.22, -123, {}, []];

		unexpected_params.forEach(param => {
			try{
				arrayutilities.forEach(subject, param)
			}catch(error) {
				expect(error.message).to.equal('[500] ArrayUtilities.forEach iterator is not a function.');
			}
		});
	});

	it('flatten', () => {
		expect(arrayutilities.flatten(['a', ['b','c']])).to.deep.equal(['a','b','c']);
		expect(arrayutilities.flatten(['a', ['b','c',['d','e']]])).to.deep.equal(['a','b','c','d','e']);
	});

	it('throws error when flatten recursion depth exceeded', () => {

		let multidimensional_array = [[[[[[[[[[[[[[[[[[[[[1, 2, 3]]]]]]]]]]]]]]]]]]]]]; //depth over 20 for any array

		try {
			arrayutilities.flatten(multidimensional_array)
		}catch (error) {
			expect(error.message).to.equal('[500] Array Utilities flatten recursion depth exceeded.');
		}
	});

	it('isArray', () => {
		expect(arrayutilities.isArray([])).to.be.true;
		expect(arrayutilities.isArray(['1', '2'])).to.be.true;
		expect(arrayutilities.isArray([1, 2])).to.be.true;
		expect(arrayutilities.isArray([{}, {}])).to.be.true;
		expect(arrayutilities.isArray([[], []])).to.be.true;

		expect(arrayutilities.isArray('')).to.be.false;
		expect(arrayutilities.isArray({})).to.be.false;
		expect(arrayutilities.isArray(1)).to.be.false;
		expect(arrayutilities.isArray()).to.be.false;

		try {
			arrayutilities.isArray('', true);
			expect.fail();
		} catch (error) {
			expect(error.message).to.equal('[500] ArrayUtilities.isArray thing argument is not an array.');
		}

	});

	it('assureEntries', () => {
		expect(arrayutilities.assureEntries([1, 2, 3], 'number')).to.be.true;
		expect(arrayutilities.assureEntries([1, 2, '3'], 'number')).to.be.false;
		expect(arrayutilities.assureEntries([], 'number')).to.be.true;

		expect(arrayutilities.assureEntries(['1', '2', '3'], 'string')).to.be.true;
		expect(arrayutilities.assureEntries(['1', '2', 3], 'string')).to.be.false;
		expect(arrayutilities.assureEntries([], 'string')).to.be.true;

		expect(arrayutilities.assureEntries([{}, {}, {}], 'object')).to.be.true;
		expect(arrayutilities.assureEntries([{}, {}, '{}'], 'object')).to.be.false;
		expect(arrayutilities.assureEntries([], 'object')).to.be.true;

		expect(arrayutilities.assureEntries([[], [], []], 'array')).to.be.true;
		expect(arrayutilities.assureEntries([[], [], '[]'], 'array')).to.be.false;
		expect(arrayutilities.assureEntries([], 'array')).to.be.true;

		expect(arrayutilities.assureEntries([new Error(), new Error(), new Error()], 'error')).to.be.true;
		expect(arrayutilities.assureEntries([new Error(), new Error(), ''], 'error')).to.be.false;
		expect(arrayutilities.assureEntries([], 'error')).to.be.true;

		try {
			arrayutilities.assureEntries([], 'unsupported-type');
			expect.fail();
		} catch (error) {
			expect(error.message).to.equal('[500] ArrayUtilities.assureEntities type has unknown value.');
		}

	});

	it('every', () => {
		try {
			arrayutilities.every('', () => {});
			expect.fail();
		} catch (error) {
			expect(error.message).to.equal('[500] ArrayUtilities.every array argument is not a array.');
		}

		try {
			arrayutilities.every([], 'not-a-function');
			expect.fail();
		} catch (error) {
			expect(error.message).to.equal('[500] ArrayUtilities.every function argument is not a function.');
		}

		//returns true when array is empty
		expect(arrayutilities.every([], () => {})).to.equal(true);

		expect(arrayutilities.every([1, 2, 3, 5, 9], (value) => {
			return value < 10
		})).to.equal(true);

		expect(arrayutilities.every([1, 2, 3, 5, 20], (value) => {
			return value < 10
		})).to.equal(false);

	});

	it('map', () => {
		try {
			arrayutilities.map('', () => {});
			expect.fail();
		} catch (error) {
			expect(error.message).to.equal('[500] ArrayUtilities.map array argument is not a array.');
		}

		try {
			arrayutilities.map([], 'not-a-function');
			expect.fail();
		} catch (error) {
			expect(error.message).to.equal('[500] ArrayUtilities.map function argument is not a function.');
		}

		arrayutilities.map([1], (value) => {
			expect(value).to.equal(1);
		});

	});

	it('compress', () => {
		expect(arrayutilities.compress([1, 2])).to.equal(`'1','2'`);
		expect(arrayutilities.compress([1, 2], '|')).to.equal(`'1'|'2'`);
		expect(arrayutilities.compress([1, 2], '|' ,'"')).to.equal(`"1"|"2"`);
	});

	it('removeElement', () => {
		expect(arrayutilities.removeElement([1, 2, 3], 1)).to.deep.equal([2, 3]);
		expect(arrayutilities.removeElement([1, 2, 3], 2)).to.deep.equal([1, 3]);
		expect(arrayutilities.removeElement([1, 2, 3], 3)).to.deep.equal([1, 2]);
		expect(arrayutilities.removeElement([1, 2, 3], 4)).to.deep.equal([1, 2, 3]);
	});

	it('validateArray', () => {
		expect(arrayutilities.validateArray([])).to.be.true;

		try {
			arrayutilities.validateArray('a string');
			expect.fail();
		} catch (error) {
			expect(error.message).to.equal('[500] Compress only accepts array arguments');
		}
	});

	it('merge', () => {
		expect(arrayutilities.merge([1, 2], [3, 4])).to.deep.equal([1, 2, 3, 4]);
		expect(arrayutilities.merge([1, 2], [])).to.deep.equal([1, 2]);
		expect(arrayutilities.merge([], [3, 4])).to.deep.equal([3, 4]);
		expect(arrayutilities.merge([1, 2], 3)).to.deep.equal([1, 2, 3]);

		try {
			arrayutilities.merge(null, [3, 4]);
			expect.fail();
		} catch (error) {
			expect(error.message).to.equal('[500] ArrayUtilities.merge array argument 1 is not a array.');
		}

	});

	it('filter', () => {
		try {
			arrayutilities.filter('', () => {});
			expect.fail();
		} catch (error) {
			expect(error.message).to.equal('[500] ArrayUtilities.filter array argument is not a array.');
		}

		try {
			arrayutilities.filter([], 'not-a-function');
			expect.fail();
		} catch (error) {
			expect(error.message).to.equal('[500] ArrayUtilities.filter filter function is not a function.');
		}

		expect(arrayutilities.filter([1, 2, 3, 4, 5], value => value < 3)).to.deep.equal([1, 2]);
	});

	it('find', () => {
		try {
			arrayutilities.find('', () => {});
			expect.fail();
		} catch (error) {
			expect(error.message).to.equal('[500] ArrayUtilities.find array argument is not a array.');
		}

		try {
			arrayutilities.find([], 'not-a-function');
			expect.fail();
		} catch (error) {
			expect(error.message).to.equal('[500] ArrayUtilities.find find function is not a function.');
		}

		expect(arrayutilities.find([1, 2, 3, 4, 5], value => value < 3)).to.equal(1);
	});

	it('serial', () => {
		return arrayutilities.serial([
			() => Promise.resolve(1),
			() => Promise.resolve(2)
		]).then((resolved) => {
			return expect(resolved).not.to.be.undefined;
		})
	});

	it('reduce', () => {
		try {
			arrayutilities.reduce('', () => {});
			expect.fail();
		} catch (error) {
			expect(error.message).to.equal('[500] ArrayUtilities.reduce array argument is not a array.');
		}

		try {
			arrayutilities.reduce([], 'not-a-function');
			expect.fail();
		} catch (error) {
			expect(error.message).to.equal('[500] ArrayUtilities.reduce reduce function is not a function.');
		}

		expect(arrayutilities.reduce([1, 2, 3], (accumulator, value) => accumulator + value)).to.equal(6);
		expect(arrayutilities.reduce([1, 2, 3], (accumulator, value) => accumulator + value, 100)).to.equal(106);
	});

	it('unique', () => {
		expect(arrayutilities.unique([1, 2, 3, 4, 5])).to.deep.equal([1, 2, 3, 4, 5]);
		expect(arrayutilities.unique([1, 2, 2, 3, 3])).to.deep.equal([1, 2, 3]);
	});

	it('chunk', () => {
		try {
			arrayutilities.chunk([], -1);
			expect.fail();
		} catch (error) {
			expect(error.message).to.equal('[500] ArrayUtilities.chunk assumes a non-zero, non-negative integer size argument');
		}

		try {
			arrayutilities.chunk([], 3.14);
			expect.fail();
		} catch (error) {
			expect(error.message).to.equal('[500] ArrayUtilities.chunk assumes a non-zero, non-negative integer size argument');
		}

		expect(arrayutilities.chunk([1, 2, 3], 1)).to.deep.equal([[1], [2], [3]]);
		expect(arrayutilities.chunk([1, 2, 3], 2)).to.deep.equal([[1, 2], [3]]);
		expect(arrayutilities.chunk([1, 2, 3], 3)).to.deep.equal([[1, 2, 3]]);
	});

	it('last', () => {
		try {
			arrayutilities.last('non-array');
			expect.fail();
		} catch (error) {
			expect(error.message).to.equal('[500] ArrayUtilities.last array argument is not a array.');
		}

		expect(arrayutilities.last([1, 2, 3])).to.equal(3);
	});

	it('sort', () => {
		try {
			arrayutilities.sort([1, 2], 'not a function');
			expect.fail();
		} catch (error) {
			expect(error.message).to.equal('[500] ArrayUtilities.sort sort_function argument is not a function.');
		}

		expect(arrayutilities.sort([2, 3, 1])).to.deep.equal([1, 2, 3]);
	});

	it('throws error when first argument is not an array', () => {

		let params = ['any_string', '123', 'any_string123', 123, 123.123, -123, -123.123, {}, () => {}, true];

		params.forEach((param) => {
			try {
				arrayutilities.group(param, () => {});
			} catch (error) {
				expect(error.message).to.equal('[500] ArrayUtilities.isArray thing argument is not an array.');
			}
		})
	});

	it('throws error when second argument is not a function', () => {

		let params = ['any_string', '123', 'any_string123', 123, 123.123, -123, -123.123, {}, [], true];

		params.forEach((param) => {
			try {
				arrayutilities.group([], param);
			} catch (error) {
				expect(error.message).to.equal('[500] ArrayUtilities.group differentiator_acquisition_function is not a function.');
			}
		})
	});

	it('successfully groups with random data', () => {

		let params =  [];

		let count1 = randomutilities.randomInt(2, 10);
		let count2 = randomutilities.randomInt(2, 10);
		let count3 = randomutilities.randomInt(2, 10);

		let param1 = randomutilities.createRandomString(20);
		let param2 = randomutilities.createRandomString(20);
		let param3 = randomutilities.createRandomString(20);

		for(let i = 0; i < count1; i++) {
			params.push({data: param1});
		}

		for(let i = 0; i < count2; i++) {
			params.push({data: param2});
		}

		for(let i = 0; i < count3; i++) {
			params.push({data: param3});
		}

		let result = arrayutilities.group(params, (param) => {return param.data});

		expect(params.length).to.equal(count1 + count2 + count3);
		expect(result[param1].length).to.equal(count1);
		expect(result[param2].length).to.equal(count2);
		expect(result[param3].length).to.equal(count3);
	});

	it('successfully groups', () => {

		let params =  [
			{ data: 'test1' },
			{ data: 'test2' },
			{ data: 'test1' },
			{ data: 'test3' },
			{ data: 'test2' },
			{ data: 'test2' },
			{ data: 'test1' },
			{ data: 'test2' },
			{ data: 'test3' },
			{ data: 'test1' },
			{ data: 'test2' },
			{ data: 'test3' },
			{ data: 'test3' },
			{ data: 'test3' },
			{ data: 'test2' },
		];

		let result = arrayutilities.group(params, (param) => {return param.data});

		expect(result).to.deep.equal({
			test1: [
				{ data: 'test1' },
				{ data: 'test1' },
				{ data: 'test1' },
				{ data: 'test1' }
			],
			test2: [
				{ data: 'test2' },
				{ data: 'test2' },
				{ data: 'test2' },
				{ data: 'test2' },
				{ data: 'test2' },
				{ data: 'test2' }
			],
			test3: [
				{ data: 'test3' },
				{ data: 'test3' },
				{ data: 'test3' },
				{ data: 'test3' },
				{ data: 'test3' }
			]}
		);
	});
});
