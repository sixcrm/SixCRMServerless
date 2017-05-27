'use strict'
const _ =  require('underscore');

const du = global.routes.include('lib', 'debug-utilities.js');

class ParserUtilities {

    constructor(){

        this.find_token_regular_expression = /\s*({{.*}})/g;

        this.replace_token_regular_expression = /\\?\{\{([^{}]+)\}\}/g;

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

        return this.replaceTokensWithValues(content, token_values);

    }

    getToken(content){

        du.debug('Get Token');

        return this.find_token_regular_expression.exec(content);

    }

    getTokenValue(token, data){

        du.debug('Get Token Value');

        let token_array = token.split('.');

        let data_subset = data;

        token_array.forEach((subtoken) => {

            if(_.isObject(data_subset)){

                data_subset = this.findProperty(subtoken, data_subset);

            }

        });

        return data_subset;

    }

    replaceTokensWithValues(content, values_object){

        du.debug('Replace Tokens With Values');

        return String(content).replace(this.replace_token_regular_expression, (match, key) => {

            if(_.has(values_object, key)){

                return values_object[key];

            }

            return match;

        });

    }

    findProperty(key, object){

        du.debug('Find Property');

        if(_.isObject(object)){

            if(_.has(object, key)){
                return object[key];
            }

            for(var k in object){
                return this.findProperty(k, object[k]);
            }

        }

        return null;

    }

}

module.exports = new ParserUtilities();
