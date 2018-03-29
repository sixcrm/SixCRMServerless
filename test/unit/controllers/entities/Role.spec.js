let chai = require('chai');
let expect = chai.expect;
const RoleController = global.SixCRM.routes.include('controllers', 'entities/Role.js');

describe('controllers/Role.js', () => {

    describe('getPermissions', () => {

        it('returns role permission', () => {

            let role = {
                permissions: 'a_permission'
            };

            const roleController = new RoleController();

            expect(roleController.getPermissions(role)).to.equal('a_permission');
        });

        it('returns null when role permission is not defined', () => {

            let role = {};

            const roleController = new RoleController();

            expect(roleController.getPermissions(role)).to.equal(null);
        });
    });
});