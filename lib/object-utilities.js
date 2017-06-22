'use strict';
const _ = require('underscore');
const du = global.routes.include('lib', 'debug-utilities.js');

module.exports = class ObjectUtilities {

    static discover(key, object){

        du.debug('Discover');

        if(_.isObject(object)){

            if(_.has(object, key)){
                return object[key];
            }

            for(var k in object){
                return this.discover(k, object[k]);
            }

        }

        return null;

    }

    static getObjectType(object){

        du.debug('Get Object Type');

        if(_.isArray(object)){
            return 'array';
        }

        if(_.isString(object)){
            return 'string';
        }

        if(_.isNumber(object)){
            return 'number';
        }

        if(_.isBoolean(object)){
            return 'boolean';
        }

        if(_.isObject(object)){
            return 'object';
        }

        return null;

    }

    recursion(object, match_function){

        let response = null;

        for(var key in object){

            if(match_function(object[key])){

                return object[key];

            }

            response = this.recursion(object[key], match_function);

            if(!_.isNull(response)){

                return response;

            }

        }

        return null;

    }

    static orderedRecursion(object, match_function){

        du.highlight(object);

        let children = [];

        let response = null;

        for(var key in object){

            if(match_function(object[key])){

                return object[key];

            }

            if(_.isArray(object[key]) || _.isObject(object[key])){

                children.push(object[key]);

            }

        }

        let recursion_result = null;

        for(var c_key in children){

            recursion_result = this.orderedRecursion(children[c_key], match_function);

            if(!_.isNull(recursion_result)){

                return recursion_result;

            }

        }

        return null;

    }

}
