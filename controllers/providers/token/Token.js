const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const random = global.SixCRM.routes.include('lib', 'random.js');
const hashutilities = global.SixCRM.routes.include('lib', 'hash-utilities.js');
const httputilities = global.SixCRM.routes.include('lib', 'providers/http-provider.js');

module.exports = class Token {
  constructor(){}

  setToken({entity}){

    du.debug('Get Token');

    return Promise.resolve({
      token: hashutilities.toSHA1(random.createRandomString(20)),
      provider: 'tokenex'
    });

  }

  getToken({token, provider}){

    du.debug('Get Token');

    return '4111111111111111';
    
  }

}
