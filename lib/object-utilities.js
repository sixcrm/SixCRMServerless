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

  //note:  finish
    static discoverAll(object, key, maximum_recursion_depth){

    //find all instances of the named variable in the object
    //return the level of discovery with the object

    }

  //note: finish
    static orderedDiscovery(object, key, maximum_recursion_depth){

        let all = this.discoverAll(object, key);

    //for 0 ... maximum_recursion_depth
    //return first match

    }

}
