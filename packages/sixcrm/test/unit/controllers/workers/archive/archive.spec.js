
const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;
const MockEntities = global.SixCRM.routes.include('test','mock-entities.js');

function getValidMessage(){

	return MockEntities.getValidMessage();

}

function getValidProducts(){

	return MockEntities.getValidProducts();

}

function getValidProductsForArchive(){

	return [{
		product: MockEntities.getValidProduct()
	},
	{
		product: MockEntities.getValidProduct()
	}];

}

function getValidRebill(){

	return MockEntities.getValidRebill();

}

function getValidTransactions(){

	return MockEntities.getValidTransactions();

}

describe('controllers/workers/archive', function () {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	beforeEach(() => {
		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {});
	});

	afterEach(() => {
		mockery.resetCache();
	});

	after(() => {
		mockery.deregisterAll();
		mockery.disable();
	});

	describe('confirmSecondAttempt', () => {

		it('determines second attempt', () => {

			let rebill = getValidRebill();

			const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
			let archiveController = new ArchiveController();

			archiveController.parameters.set('rebill', rebill);

			return archiveController.confirmSecondAttempt().then(result => {
				expect(result).to.equal(true);
				expect(archiveController.parameters.store['responsecode']).to.equal('noaction');
			});

		});

		it('determines second attempt', () => {

			let rebill = getValidRebill();

			rebill.second_attempt = true;

			const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
			let archiveController = new ArchiveController();

			archiveController.parameters.set('rebill', rebill);

			return archiveController.confirmSecondAttempt().then(result => {
				expect(result).to.equal(true);
				expect(archiveController.parameters.store['responsecode']).to.equal('success');
			});

		});

	});

	describe('getRebillTransactions', () => {

		it('acquires rebill transactions', () => {

			let transactions = getValidTransactions();
			let rebill = getValidRebill();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), class {
				listTransactions() {
					return Promise.resolve({ transactions: transactions });
				}
			});

			const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
			let archiveController = new ArchiveController();

			archiveController.parameters.set('rebill', rebill);

			return archiveController.getRebillTransactions().then(result => {
				expect(result).to.equal(true);
				expect(archiveController.parameters.store['transactions']).to.deep.equal(transactions);
			});

		});

	});

	describe('getTransactionProducts', () => {

		it('acquires transaction products', () => {

			let transactions = getValidTransactions();
			let products = getValidProductsForArchive();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Transaction.js'), class {
				getProducts() {
					return Promise.resolve(products);
				}
			});

			const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
			let archiveController = new ArchiveController();

			archiveController.parameters.set('transactions', transactions);

			return archiveController.getTransactionProducts().then(result => {
				expect(result).to.equal(true);
				expect(archiveController.parameters.store['products'][0]).to.deep.equal(products[0].product);
			});

		});

	});

	describe('getTransactionProducts', () => {

		it('acquires transaction products', () => {

			let archive_filter = 'all';

			process.env.archivefilter = archive_filter;
			const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
			let archiveController = new ArchiveController();
			let result = archiveController.setArchiveFilter();

			expect(result).to.equal(true);
			expect(archiveController.parameters.store['archivefilter']).to.equal(archive_filter);

		});

	});

	describe('areProductsNoShip', () => {

		it('Are products no ship (false)', () => {

			let products = getValidProducts();

			products.forEach(product => {
				product.ship = true;
			});

			const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
			let archiveController = new ArchiveController();

			archiveController.parameters.set('products', products);

			let result = archiveController.areProductsNoShip();

			expect(result).to.equal(false);

		});

		it('Are products no ship (true)', () => {

			let products = getValidProducts();

			products.forEach(product => {
				product.ship = false;
			});

			const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
			let archiveController = new ArchiveController();

			archiveController.parameters.set('products', products);

			let result = archiveController.areProductsNoShip();

			expect(result).to.equal(true);

		});

	});

	describe('confirmNoShip', () => {

		it('some ship', () => {

			let rebill = getValidRebill();
			let products = getValidProductsForArchive();
			let transactions = getValidTransactions();

			products[0].product.ship = true;
			products[1].product.ship = false;

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Transaction.js'), class {
				getProducts() {
					return Promise.resolve(products);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), class {
				listTransactions() {
					return Promise.resolve({ transactions: transactions });
				}
			});

			const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
			let archiveController = new ArchiveController();

			archiveController.parameters.set('rebill', rebill);

			return archiveController.confirmNoShip().then(result => {
				expect(result).to.equal(true);
				expect(archiveController.parameters.store['responsecode']).to.equal('noaction');
			});

		});

		it('all no ship', () => {

			let rebill = getValidRebill();
			let products = getValidProductsForArchive();
			let transactions = getValidTransactions();

			products.forEach(products => {
				products.product.ship = false;
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Transaction.js'), class {
				getProducts() {
					return Promise.resolve(products);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), class {
				listTransactions() {
					return Promise.resolve({ transactions: transactions });
				}
			});

			const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
			let archiveController = new ArchiveController();

			archiveController.parameters.set('rebill', rebill);

			return archiveController.confirmNoShip().then(result => {
				expect(result).to.equal(true);
				expect(archiveController.parameters.store['responsecode']).to.equal('success');
			});

		});

	});

	describe('archive', () => {

		it('Successfully runs archive (all)', () => {

			let archivefilter = 'all';

			const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
			let archiveController = new ArchiveController();

			archiveController.parameters.set('archivefilter', archivefilter);

			return archiveController.archive().then(result => {
				expect(result).to.equal(true);
				expect(archiveController.parameters.store['responsecode']).to.equal('success');
			});
		});

		it('Successfully runs archive (noship, success)', () => {

			let archivefilter = 'noship';

			let rebill = getValidRebill();
			let products = getValidProductsForArchive();
			let transactions = getValidTransactions();

			products.forEach(products => {
				products.product.ship = false;
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Transaction.js'), class {
				getProducts() {
					return Promise.resolve(products);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), class {
				listTransactions() {
					return Promise.resolve({ transactions: transactions });
				}
			});

			const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
			let archiveController = new ArchiveController();

			archiveController.parameters.set('archivefilter', archivefilter);
			archiveController.parameters.set('rebill', rebill);

			return archiveController.archive().then(result => {
				expect(result).to.equal(true);
				expect(archiveController.parameters.store['responsecode']).to.equal('success');
			});
		});

		it('Successfully runs archive (noship, noaction)', () => {

			let archivefilter = 'noship';

			let rebill = getValidRebill();
			let products = getValidProductsForArchive();
			let transactions = getValidTransactions();

			products.forEach(products => {
				products.product.ship = true;
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Transaction.js'), class {
				getProducts() {
					return Promise.resolve(products);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), class {
				listTransactions() {
					return Promise.resolve({ transactions: transactions });
				}
			});

			const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
			let archiveController = new ArchiveController();

			archiveController.parameters.set('archivefilter', archivefilter);
			archiveController.parameters.set('rebill', rebill);

			return archiveController.archive().then(result => {
				expect(result).to.equal(true);
				expect(archiveController.parameters.store['responsecode']).to.equal('noaction');
			});
		});

		it('Successfully runs archive (twoattempts, noaction)', () => {

			let archivefilter = 'twoattempts';
			let rebill = getValidRebill();

			const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
			let archiveController = new ArchiveController();

			archiveController.parameters.set('archivefilter', archivefilter);
			archiveController.parameters.set('rebill', rebill);

			return archiveController.archive().then(result => {
				expect(result).to.equal(true);
				expect(archiveController.parameters.store['responsecode']).to.equal('noaction');
			});
		});

		it('Successfully runs archive (twoattempts, success)', () => {

			let archivefilter = 'twoattempts';
			let rebill = getValidRebill();

			rebill.second_attempt = true;

			const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
			let archiveController = new ArchiveController();

			archiveController.parameters.set('archivefilter', archivefilter);
			archiveController.parameters.set('rebill', rebill);

			return archiveController.archive().then(result => {
				expect(result).to.equal(true);
				expect(archiveController.parameters.store['responsecode']).to.equal('success');
			});
		});

	});

	describe('respond', () => {

		it('Successfully responds (success)', () => {

			const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
			let archiveController = new ArchiveController();

			archiveController.parameters.set('responsecode', 'success');

			let result = archiveController.respond();

			expect(objectutilities.getClassName(result)).to.equal('WorkerResponse');
			expect(result.getCode()).to.equal('success');

		});

		it('Successfully responds (success)', () => {

			const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
			let archiveController = new ArchiveController();

			archiveController.parameters.set('responsecode', 'noaction');

			let result = archiveController.respond();

			expect(objectutilities.getClassName(result)).to.equal('WorkerResponse');
			expect(result.getCode()).to.equal('noaction');

		});

		it('Successfully responds (success)', () => {

			const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
			let archiveController = new ArchiveController();

			archiveController.parameters.set('responsecode', 'error');

			let result = archiveController.respond();

			expect(objectutilities.getClassName(result)).to.equal('WorkerResponse');
			expect(result.getCode()).to.equal('error');

		});

	});

	describe('execute', () => {

		it('Successfully executes (noship, noaction)', () => {

			let archive_filter = 'noship';

			process.env.archivefilter = archive_filter;

			let message = getValidMessage();
			let rebill = getValidRebill();
			let products = getValidProductsForArchive();
			let transactions = getValidTransactions();

			products.forEach(products => {
				products.product.ship = true;
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Transaction.js'), class {
				getProducts() {
					return Promise.resolve(products);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), class {
				listTransactions() {
					return Promise.resolve({ transactions: transactions });
				}
				get() {
					return Promise.resolve(rebill);
				}
			});

			const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
			let archiveController = new ArchiveController();

			return archiveController.execute(message).then(result => {
				expect(objectutilities.getClassName(result)).to.equal('WorkerResponse');
				expect(archiveController.parameters.store['archivefilter']).to.equal(archive_filter);
				expect(result.getCode()).to.equal('noaction');
			});
		});

		it('Successfully executes (noship, success)', () => {

			let archive_filter = 'noship';

			process.env.archivefilter = archive_filter

			let message = getValidMessage();
			let rebill = getValidRebill();
			let products = getValidProductsForArchive();

			products.forEach(products => {
				products.product.ship = false;
			});

			let transactions = getValidTransactions();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Transaction.js'), class {
				getProducts() {
					return Promise.resolve(products);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), class {
				listTransactions() {
					return Promise.resolve({ transactions: transactions });
				}
				get() {
					return Promise.resolve(rebill);
				}
			});

			const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
			let archiveController = new ArchiveController();

			return archiveController.execute(message).then(result => {
				expect(objectutilities.getClassName(result)).to.equal('WorkerResponse');
				expect(archiveController.parameters.store['archivefilter']).to.equal(archive_filter);
				expect(result.getCode()).to.equal('success');
			});
		});

		it('Successfully executes (all, success)', () => {

			let archive_filter = 'all';

			process.env.archivefilter = archive_filter;

			let message = getValidMessage();
			let rebill = getValidRebill();
			let products = getValidProductsForArchive();
			let transactions = getValidTransactions();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Transaction.js'), class {
				getProducts() {
					return Promise.resolve(products);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), class {
				listTransactions() {
					return Promise.resolve({ transactions: transactions });
				}
				get() {
					return Promise.resolve(rebill);
				}
			});

			const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
			let archiveController = new ArchiveController();

			return archiveController.execute(message).then(result => {
				expect(objectutilities.getClassName(result)).to.equal('WorkerResponse');
				expect(archiveController.parameters.store['archivefilter']).to.equal(archive_filter);
				expect(result.getCode()).to.equal('success');
			});

		});

		it('Successfully executes (twoattempts, success)', () => {

			let archive_filter = 'twoattempts';

			process.env.archivefilter = archive_filter;

			let message = getValidMessage();
			let rebill = getValidRebill();

			rebill.second_attempt = true;
			let products = getValidProductsForArchive();
			let transactions = getValidTransactions();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Transaction.js'), class {
				getProducts() {
					return Promise.resolve(products);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), class {
				listTransactions() {
					return Promise.resolve({ transactions: transactions });
				}
				get() {
					return Promise.resolve(rebill);
				}
			});

			const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
			let archiveController = new ArchiveController();

			return archiveController.execute(message).then(result => {
				expect(objectutilities.getClassName(result)).to.equal('WorkerResponse');
				expect(archiveController.parameters.store['archivefilter']).to.equal(archive_filter);
				expect(result.getCode()).to.equal('success');
			});

		});

		it('Successfully executes (twoattempts, noaction)', () => {

			let archive_filter = 'twoattempts';

			process.env.archivefilter = archive_filter;

			let message = getValidMessage();
			let rebill = getValidRebill();
			let products = getValidProductsForArchive();
			let transactions = getValidTransactions();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Transaction.js'), class {
				getProducts() {
					return Promise.resolve(products);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), class {
				listTransactions() {
					return Promise.resolve({ transactions: transactions });
				}
				get() {
					return Promise.resolve(rebill);
				}
			});

			const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
			let archiveController = new ArchiveController();

			return archiveController.execute(message).then(result => {
				expect(objectutilities.getClassName(result)).to.equal('WorkerResponse');
				expect(archiveController.parameters.store['archivefilter']).to.equal(archive_filter);
				expect(result.getCode()).to.equal('noaction');
			});

		});

		it('Successfully executes (null, success)', () => {

			delete process.env.archivefilter;

			let message = getValidMessage();
			let rebill = getValidRebill();
			let products = getValidProductsForArchive();
			let transactions = getValidTransactions();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Transaction.js'), class {
				getProducts() {
					return Promise.resolve(products);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), class {
				listTransactions() {
					return Promise.resolve({ transactions: transactions });
				}
				get() {
					return Promise.resolve(rebill);
				}
			});

			const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');
			let archiveController = new ArchiveController();

			return archiveController.execute(message).then(result => {
				expect(objectutilities.getClassName(result)).to.equal('WorkerResponse');
				expect(archiveController.parameters.store['archivefilter']).to.not.be.defined;
				expect(result.getCode()).to.equal('success');
			});

		});

	});

});
