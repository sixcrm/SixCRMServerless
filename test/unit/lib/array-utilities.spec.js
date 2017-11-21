const chai = require('chai');
const expect = chai.expect;
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

describe('lib/array-utilities', () => {

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

        arrayutilities.every([1], (value) => {
            expect(value).to.equal(1);
        });

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

});
