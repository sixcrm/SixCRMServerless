const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;
let EntityController = require('../../../controllers/Entity');

describe('controllers/Entity.js', () => {
    let entityController;

    before(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        });
    });

    afterEach(() => {
        mockery.resetCache();
    });

    after(() => {
        mockery.deregisterAll();
    });

    describe('can', () => {
        before(() => {
            entityController = new EntityController('table_name', 'descriptive_name');
        });

        it('fails when user is not defined', () => {
            // given
            let anAction = 'create';
            global.user = null;

            // when
            return entityController.can(anAction).catch((error) => {
                // then
                expect(error.message).to.equal('Missing request parameters');
            });
        });
    });

    describe('create', () => {
        it('fails when user is not defined', () => {
            // when
            return entityController.create({}).catch((error) => {
                // then
                expect(error.message).to.equal('Missing request parameters');
            });
        });
    });

    describe('update', () => {
        it('fails when user is not defined', () => {
            // when
            return entityController.update({}).catch((error) => {
                // then
                expect(error.message).to.equal('Missing request parameters');
            });
        });
    });

    describe('delete', () => {
        it('fails when user is not defined', () => {
            // when
            return entityController.delete({}).catch((error) => {
                // then
                expect(error.message).to.equal('Missing request parameters');
            });
        });
    });

    describe('get', () => {
        it('fails when user is not defined', () => {
            // when
            return entityController.get(1).catch((error) => {
                // then
                expect(error.message).to.equal('Missing request parameters');
            });
        });
    });
});
