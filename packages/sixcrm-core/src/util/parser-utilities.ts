import * as _ from 'lodash';
import du from './debug-utilities';
import objectutilities from './object-utilities';
import arrayutilities from './array-utilities';

export default class ParserUtilities {

	static parse(content, data, parse_explicit = false) {

		du.debug('Parse');

		let token;

		const token_values = {};

		do {

			token = this.getToken(content);

			if (token) {

				if (!_.has(token_values, token)) {

					let discovered_token_value = this.getTokenValue(token, data, parse_explicit);

					if (_.isNull(discovered_token_value) && parse_explicit !== true) {
						discovered_token_value = this.getTokenValue(token, data, true);
					}

					token_values[token] = discovered_token_value;

					content = this.replaceTokensWithValues(content, token_values);

				}

			}

		} while (token);

		return content;

	}

	static getTokens(content) {

		du.debug('Get Tokens');

		const regex = /\{\{([^{}]*)\}\}/g;

		let tokens: string[] = [];

		// Technical Debt:  Use stringutilities.matchAll()
		let m: RegExpExecArray | null = null;

		// eslint-disable-next-line no-cond-assign
		while (m = regex.exec(content)) {
			tokens.push(m[0]);
		}

		tokens = arrayutilities.unique(tokens);

		return arrayutilities.map(tokens, (token) => {
			return token.substring(2, (token.length - 2));
		});

	}

	static getToken(content) {

		du.debug('Get Token');

		const find_token_regular_expression = /\\*({{[^{}}]*}})/g;

		const m = find_token_regular_expression.exec(content);

		if (!_.isNull(m) && !_.isUndefined(m[1])) {

			return m[1];

		}

		return null;

	}

	static getTokenValue(token, data, parse_explicit = false) {

		du.debug('Get Token Value');

		let data_subset = data;

		if (!parse_explicit) {

			const token_array = token.replace('{{', '').replace('}}', '').split('.');

			if (_.isArray(token_array) && token_array.length > 0) {

				token_array.forEach((subtoken) => {

					if (_.isObject(data_subset)) {

						data_subset = objectutilities.recurse(data_subset, (key) => {
							return (key === subtoken);
						});

					}

				});

			}

		} else {

			token = token.replace('{{', '').replace('}}', '');

			data_subset = (_.has(data, token)) ? data[token] : null;

		}

		return data_subset;

	}

	static replaceTokensWithValues(content, values_object) {

		du.debug('Replace Tokens With Values');

		objectutilities.map(values_object, (key) => {
			if (_.has(values_object, key)) {
				content = content.replace(new RegExp(key, 'g'), values_object[key]);
			}
		});

		return content;

	}
}
