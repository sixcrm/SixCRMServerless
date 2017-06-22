'use strict';

const _ = require('underscore');
const du = global.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.routes.include('lib', 'array-utilities.js');

module.exports = class ObjectUtilities {

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

    static recurseByDepth(object, match_function){

        du.debug('Recurse By Depth');

        let all_results = this.recurseAll(object, match_function);

        let result = null;

        if(_.isObject(all_results)){

            all_results.forEach((all_result) => {

                if(_.isNull(result)){

                    if(_.has(all_result, 'depth') && _.has(all_result, 'match')){
                        result = all_result;
                    }else{
                        throw new Error('Undefined result object:', all_result);
                    }

                }else{

                    if(_.has(all_result, 'depth') && _.has(all_result, 'match')){
                        if(all_result.depth < result.depth){
                            result = all_result;
                        }
                    }else{
                        throw new Error('Undefined result object:', all_result);
                    }

                }

            });

            if(!_.isNull(result) && _.has(result, 'match')){

                result = result.match;

            }

        }

        return result;

    }

    static recurseAll(object, match_function, depth){

        du.debug('Recurse All');

        if(_.isUndefined(depth)){
            depth = 1;
        }

        if(!_.isObject(object)){
            return null;
        }

        if(!_.isFunction(match_function)){
            throw new Error('Match function must be a function.');
        }

        let results = [];

        for(var key in object){

            let value = (_.has(object, key))?object[key]:key;

            if(match_function(key, value)){

                results.push({depth: depth, match: value});

            }

            var sub_results = this.recurseAll(value, match_function, (depth+1));

            if(_.isArray(sub_results) && sub_results.length > 0){

                results = arrayutilities.merge(results, sub_results);

            }

        }

        return results;

    }

    static recurse(object, match_function){

        du.output('Recurse', object);

        let response = null;


        if(!_.isObject(object)){ return response; }

        for(var key in object){

            let value = (_.has(object, key))?object[key]:key;

            if(match_function(key, value)){

                return value;

            }

            response = this.recurse(value, match_function);

            if(!_.isNull(response)){ return response; }

        }

        return response;

    }

    //Note:  Works but deprecated...
    //Note:  Doesn't do exactly what I intended...

    static orderedRecursion(object, match_function){

        du.output('Ordered Recursion');

        let children = [];

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
