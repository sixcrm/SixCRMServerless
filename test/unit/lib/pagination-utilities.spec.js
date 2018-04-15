const chai = require('chai');
const expect = chai.expect;
const paginationutilities = global.SixCRM.routes.include('lib', 'pagination-utilities.js');

describe('lib/pagination-utilities', () => {

	describe('mergePagination', () => {

		it('returns objects merged into an array', () => {

			let parameter = {
				test1: 'sample data'
			};

			let pagination = {
				test2: 'test'
			};

			expect(paginationutilities.mergePagination(parameter, pagination)).to.deep.equal({'test1':'sample data', 'test2':'test'});
		});

		it('returns pagination when parameter value is not an object', () => {

			let parameters = 'sample data';

			let pagination = {
				test2: 'test'
			};

			expect(paginationutilities.mergePagination(parameters, pagination)).to.deep.equal({'test2':'test'});
		});

		it('returns empty array when arguments aren\'t objects', () => {

			let parameters = 'sample data';

			let pagination = 'test';

			expect(paginationutilities.mergePagination(parameters, pagination)).to.deep.equal([]);
		});
	});

	describe('createSQLPaginationInput', () => {

		it('returns default pagination values when arguments are not set', () => {

			expect(paginationutilities.createSQLPaginationInput()).to.deep.equal({
				//default pagination values
				order: 'desc',
				offset: 0,
				limit: 50
			});
		});

		it('returns default pagination with new pagination values for every matching key', () => {

			let pagination = {order: 'sample data'};

			expect(paginationutilities.createSQLPaginationInput(pagination)).to.deep.equal({
				//default pagination values overridden with new pagination
				order: 'sample data',
				offset: 0,
				limit: 50
			});
		});

		it('returns default pagination when new pagination doesn\'t have a matching key', () => {

			let pagination = {test: 'sample data'};

			expect(paginationutilities.createSQLPaginationInput(pagination)).to.deep.equal({
				//default pagination values
				order: 'desc',
				offset: 0,
				limit: 50
			});
		});
	});

	describe('createSQLPaginationObject', () => {

		it('returns SQL pagination object', () => {
			//parameter with any values
			let parameter = {
				order: 'an_order',
				limit: '1',
				offset: '1',
				count: '1'
			};

			expect(paginationutilities.createSQLPaginationObject(parameter)).to.deep.equal({
				order: 'an_order',
				limit: 1,
				offset: 1,
				count: 1
			});
		});
	});
});