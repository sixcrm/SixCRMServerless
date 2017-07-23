'use strict'
const _ =  require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

class ParserUtilities {

    constructor(){

        this.find_token_regular_expression = /\\*({{[^{}}]*}})/g;

    }

    parse(content, data){

        du.debug('Parse');

        let token;

        let token_values = {};

        do {

            token = this.getToken(content);

            if (token) {

                if(!_.has(token_values, token)){

                    token_values[token] = this.getTokenValue(token, data);

                }

            }

        } while (token);

        let parsed_content = this.replaceTokensWithValues(content, token_values);

        return parsed_content;

    }

    getToken(content){

        du.debug('Get Token');

        let m = this.find_token_regular_expression.exec(content);

        if(!_.isNull(m) && !_.isUndefined(m[1])){

            return m[1];

        }

        return null;

    }

    getTokenValue(token, data){

        du.debug('Get Token Value');

        let token_array = token.replace('{{','').replace('}}','').split('.');

        let data_subset = data;

        if(_.isArray(token_array) && token_array.length > 0){

            token_array.forEach((subtoken) => {

                if(_.isObject(data_subset)){

                    data_subset = objectutilities.recurse(data_subset, (key) => {
                        if(key == subtoken){
                            return true;
                        }
                        return false;
                    });

                }

            });

        }

        return data_subset;

    }

    replaceTokensWithValues(content, values_object){

        du.debug('Replace Tokens With Values');


        for(var k in values_object){

            content = content.replace(new RegExp(k, 'g'), values_object[k]);

        }

        return content;

    }

}

module.exports = new ParserUtilities();
