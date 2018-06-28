const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;

module.exports = class TokenEx {

	constructor(){

		this.request_paths = {
			'getToken': 'TokenServices.svc/REST/Detokenize',
			'setToken': 'TokenServices.svc/REST/Tokenize',
			'deleteToken':'TokenServices.svc/REST/DeleteToken'
		};

		this._setConfiguration();

	}

	getToken(token){

		du.debug('Get Token');

		let post_body = {
			"APIKey":this.api_key,
			"TokenExID":this.id,
			"Token":token
		};

		let argument_object = {
			url: this._createFullRequestURL('getToken'),
			body: post_body
		};


		return this._performRequest(argument_object).then((result) => this._parseResponse('getToken', result));

	}

	setToken(data){

		du.debug('Set Token');

		let post_body = {
			"APIKey":this.api_key,
			"TokenExID":this.id,
			"Data":data,
			"TokenScheme":22
		};

		let argument_object = {
			url: this._createFullRequestURL('setToken'),
			body: post_body
		};

		return this._performRequest(argument_object).then((result) => this._parseResponse('setToken', result));

	}

	deleteToken(token){

		du.debug('Delete Token');

		let post_body = {
			"APIKey":this.api_key,
			"TokenExID":this.id,
			"Token":token
		};

		let argument_object = {
			url: this._createFullRequestURL('deleteToken'),
			body: post_body
		};

		return this._performRequest(argument_object).then((result) => this._parseResponse('deleteToken', result));

	}

	_parseResponse(request_name, result){

		du.debug('Parse Response');

		if(!_.has(result.body, 'Success') || result.body.Success !== true){
			if(request_name == 'deleteToken' && _.has(result.body, 'Error') && _.includes(result.body.Error, 'Token does not exist')){
				du.warning('Token does not exist');
			}else{
				throw eu.getError('server','Tokenization request failed (TokenEx.com): "'+request_name+'".  ('+result.body.Error+')');
			}
		}

		return {
			setToken:(result) => {
				if(_.has(result.body, 'Token')){
					return { token: result.body.Token };
				}
				throw eu.getError('server', 'Tokenization Response missing "Token" field (TokenEx.com).');
			},
			getToken:(result) => {
				if(_.has(result.body, 'Value')){
					return { value: result.body.Value };
				}
				throw eu.getError('server', 'Tokenization Response missing "Value" field (TokenEx.com).');
			},
			deleteToken:() => {
				return true;
			}
		}[request_name](result);

	}

	_performRequest(argumentation_object){

		du.debug('Perform Request');

		if(!_.has(this, 'httputilities')){
			const HTTPUtilities = global.SixCRM.routes.include('controllers', 'providers/http-provider.js');
			this.httputilities = new HTTPUtilities();
		}

		return this.httputilities.postJSON(argumentation_object);

	}

	_createFullRequestURL(request_name){

		du.debug('Create Full Request URL');

		if(!_.has(this.request_paths, request_name)){
			throw eu.getError('server', 'Unknown token request: '+request_name);
		}

		return this.base+'/'+this.request_paths[request_name];

	}

	_setConfiguration(){

		du.debug('Set Configuration');

		const tokenex_configuration = global.SixCRM.configuration.site_config.tokenization.tokenex;
		objectutilities.map(tokenex_configuration, (key) => {
			this[key] = tokenex_configuration[key];
		});

	}

}
