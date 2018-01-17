let chai = require('chai');
let expect = chai.expect;

describe('controllers/Role.js', () => {

    describe('getPermissions', () => {

        it('returns role permission', () => {

            let role = {
                permissions: 'a_permission'
            };

            let roleController = global.SixCRM.routes.include('controllers','entities/Role.js');

            expect(roleController.getPermissions(role)).to.equal('a_permission');
        });

        it('returns null when role permission is not defined', () => {

            let role = {};

            let roleController = global.SixCRM.routes.include('controllers','entities/Role.js');

            expect(roleController.getPermissions(role)).to.equal(null);
        });
    });
});