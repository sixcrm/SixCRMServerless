let chai = require('chai');
let expect = chai.expect;
let EntityController = require('../../../controllers/Entity');

describe('controllers/Entity.js', () => {
    let entityController;

    before(() => {
        entityController = new EntityController('table_name', 'descriptive_name');
    });

    describe('can', () => {
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
});
