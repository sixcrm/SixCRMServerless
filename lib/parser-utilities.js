
const _ =  require('lodash');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
//const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');

module.exports = class ParserUtilities {

	static parse(content, data, parse_explicit){

		du.debug('Parse');

		let token;

		let token_values = {};

		do {

			token = this.getToken(content);

			if (token) {

				if(!_.has(token_values, token)){

					let discovered_token_value = this.getTokenValue(token, data, parse_explicit);

					if(_.isNull(discovered_token_value) && parse_explicit !== true){
						discovered_token_value = this.getTokenValue(token, data, true);
					}

					token_values[token] = discovered_token_value;

					content = this.replaceTokensWithValues(content, token_values);

				}

			}

		} while (token);

		return content;

	}

	static getTokens(content){

		du.debug('Get Tokens');

		let regex = /\{\{([^{}]*)\}\}/g;

		let tokens = [];

		//Technical Debt:  Use stringutilities.matchAll()
		let m = null;

		// eslint-disable-next-line no-cond-assign
		while(m = regex.exec(content)) {
			tokens.push(m[0]);
		}

		tokens = arrayutilities.unique(tokens);

		return arrayutilities.map(tokens, token => {
			return token.substring(2, (token.length - 2));
		});

	}

	static getToken(content){

		du.debug('Get Token');

		const find_token_regular_expression = /\\*({{[^{}}]*}})/g;

		let m = find_token_regular_expression.exec(content);

		if(!_.isNull(m) && !_.isUndefined(m[1])){

			return m[1];

		}

		return null;

	}

	static getTokenValue(token, data, parse_explicit){

		du.debug('Get Token Value');

		parse_explicit = (_.isUndefined(parse_explicit) || _.isNull(parse_explicit))?false:parse_explicit;

		let data_subset = data;

		if(!parse_explicit){

			let token_array = token.replace('{{','').replace('}}','').split('.');

			if(_.isArray(token_array) && token_array.length > 0){

				token_array.forEach((subtoken) => {

					if(_.isObject(data_subset)){

						data_subset = objectutilities.recurse(data_subset, (key) => {
							return (key == subtoken);
						});

					}

				});

			}

		}else{

			token = token.replace('{{','').replace('}}','');

			data_subset = (_.has(data, token))?data[token]:null;

		}

		return data_subset;

	}

	static replaceTokensWithValues(content, values_object){

		du.debug('Replace Tokens With Values');

		objectutilities.map(values_object, key => {
			if(_.has(values_object, key)){
				content = content.replace(new RegExp(key, 'g'), values_object[key]);
			}
		})

		return content;

	}
}
