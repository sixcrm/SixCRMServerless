const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const random = global.SixCRM.routes.include('lib', 'random.js');
const hashutilities = global.SixCRM.routes.include('lib', 'hash-utilities.js');

module.exports = class Token {

  constructor(){

    const TokenExController = global.SixCRM.routes.include('vendors', 'tokenizationproviders/TokenEx/tokenex.js');
    this.tokenExController = new TokenExController();

  }

  setToken({entity}){

    du.debug('Get Token');

    du.info(entity);
    return Promise.resolve({
      token: hashutilities.toSHA1(random.createRandomString(20)),
      provider: 'tokenex'
    });

  }

  getToken({token, provider}){

    du.debug('Get Token');

    du.info(token, provider);

    return '4111111111111111';

  }

  deleteToken({token, provider}){

    du.debug('Delete Token');

    du.info(token, provider);

    return Promise.resolve(true);

  }

}
