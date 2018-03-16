'use strict'
const _ =  require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
//const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');

class ParserUtilities {

    constructor(){

        this.find_token_regular_expression = /\\*({{[^{}}]*}})/g;

    }

    parse(content, data, parse_explicit){

        du.debug('Parse');

        let token;

        let token_values = {};

        do {

            token = this.getToken(content);

            if (token) {

                if(!_.has(token_values, token)){

                    token_values[token] = this.getTokenValue(token, data, parse_explicit);

                }

            }

        } while (token);

        let parsed_content = this.replaceTokensWithValues(content, token_values);

        return parsed_content;

    }

    getTokens(content){

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

    getToken(content){

        du.debug('Get Token');

        let m = this.find_token_regular_expression.exec(content);

        if(!_.isNull(m) && !_.isUndefined(m[1])){

            return m[1];

        }

        return null;

    }

    getTokenValue(token, data, parse_explicit){

        du.debug('Get Token Value');

        parse_explicit = (_.isUndefined(parse_explicit) || _.isNull(parse_explicit))?false:parse_explicit;

        let data_subset = data;

        if(!parse_explicit){

          let token_array = token.replace('{{','').replace('}}','').split('.');

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

        }else{

          token = token.replace('{{','').replace('}}','');

          data_subset = (_.has(data, token))?data[token]:null;

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
