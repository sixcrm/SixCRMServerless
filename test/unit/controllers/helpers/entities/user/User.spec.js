

describe('controllers/helpers/entities/user/User.js', () => {

  /*
  xdescribe('appendAlias', () => {

      it('returns user itself when user alias exists', () => {
          let user = getValidUser();

          const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
          const userController = new UserController();

          expect(userController.appendAlias(user)).to.deep.equal(user);
      });

      it('successfully appends alias', () => {
          let user = getValidUser();

          delete user.alias;
          user.id = 'first.last@example.com'; //any email type id

          mockery.registerMock(global.SixCRM.routes.path('lib', 'random.js'), {
              createRandomString: () => {
                  return 'a_random_string';
              }
          });

          const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
          const userController = new UserController();

          let result = userController.appendAlias(user);

          expect(result.alias).to.equal('628243ee9c74e8b56e9026e3c26a7f53e5283037');
      });
  });
  */

});
