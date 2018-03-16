'use strict';

const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

module.exports = class ObjectUtilities {

  static removeIfExists(object, field, fatal){

    fatal = (_.isUndefined(fatal))?false:fatal;

    if(!this.isObject(object, fatal)){
      return object;
    }

    if(this.hasRecursive(object, field, fatal)){

      if(_.isString(field)){
        field = field.split('.');
      }

      return this.deepDelete(object, field);

    }

    return object;

  }

  static deepDelete(object, path_array){

    let path = path_array.shift();

    if(path_array.length == 0){
      delete object[path];
      return object
    }

    object[path] = this.deepDelete(object[path], path_array);
    return object;

  }

  static getProperties(object, fatal){

    fatal = (_.isUndefined(fatal))?false:fatal;

    if(!this.isObject(object, fatal)){
      return false;
    }

    return Object.getOwnPropertyNames(object);

  }

  static getAllMethods(object, fatal){

    fatal = (_.isUndefined(fatal))?false:fatal;

    if(!this.isObject(object, fatal)){
      return false;
    }

    let properties = this.getProperties(object);

    return arrayutilities.filter(properties, (property) => {
      return typeof object[property] == 'function';
    });

  }

  static nonEmpty(object, fatal){

    fatal = (_.isUndefined(fatal))?false:fatal;

    if(!this.isObject(object, fatal)){
      return false;
    }

    if(arrayutilities.nonEmpty(Object.keys(object))){
      return true;
    }

    if(fatal){
      eu.throwError('server', 'Object is empty.');
    }

    return false;

  }

  //Technical Debt:  Test Me!
  static has(object, properties, fatal){

    du.deep('Has');

    fatal = (_.isUndefined(fatal))?false:fatal;

    if(!this.isObject(object, fatal)){
      return false;
    }

    if(_.isString(properties)){

      if(_.has(object, properties)){ return true; }

      if(fatal){
        eu.throwError('server', 'Object missing property "'+properties+'".');
      }

      return false;

    }

    if(arrayutilities.nonEmpty(properties, fatal)){

      return arrayutilities.every(properties, property => {

        if(!_.isString(property)){
          if(fatal){
            eu.throwError('server', 'Unrecognized properties object: '+property);
          }
          return false;
        }

        if(_.has(object, property)){ return true; }

        if(fatal){
          eu.throwError('server', 'Object missing property "'+property+'".');
        }

        return false;

      });

    }

    eu.throwError('server', 'Unrecognized properties object: '+properties);

  }

  //Technical Debt:  Test Me!
  static transcribe(mapping_object, source_object, return_object, fatal){

    du.deep('Transcribe');

    this.isObject(mapping_object, true);

    this.isObject(source_object, true);

    if(_.isUndefined(return_object) || _.isNull(return_object)){
      return_object = {};
    }

    if(_.isUndefined(fatal) || _.isNull(fatal)){
      fatal = false;
    }

    this.map(mapping_object, (key) => {

      let map_key = mapping_object[key];

      if(!this.hasRecursive(source_object, map_key)){

        if(fatal){
          eu.throwError('server', 'Missing source object field: "'+map_key+'".');
        }

      }else{

        return_object[key] = this.getKey(source_object, map_key, true);

      }

    });

    return return_object;

  }

  //Technical Debt:  Test Me!
  static map(object, map_function){

    du.deep('Map');

    this.isObject(object, true);

    if(!_.isFunction(map_function)){
      eu.throwError('server', 'map_function is not a function.');
    }

    let keys = this.getKeys(object);

    let output = [];

    arrayutilities.map(keys, (key) => {
      output.push(map_function(key));
    });

    return output;

  }

  static getKey(object, key, fatal){

    du.deep('Get Key');

    if(_.isUndefined(fatal)){
      fatal = false;
    }

    if(this.hasRecursive(object, key, fatal)){

      if(!_.isArray(key)){
        key = key.split('.');
      }

      arrayutilities.map(key, (a_key) => {
        object = object[a_key];
      });

      return object;

    }

  }

  //Ljubomir:  Please add tests for this.
  //Technical Debt:  Test Me!
  static hasRecursive(object, key, fatal){

    du.deep('Has Recursive');

    if(_.isUndefined(fatal)){
      fatal = false;
    }

    if(!arrayutilities.isArray(key)){
      if(_.isString(key)){
        key = key.split('.');
      }else{
        eu.throwError('server', 'Key must be a array or a string.');
      }
    }

    if(key.length < 1){
      eu.throwError('server', 'key array must be of length 1 or greater.');
    }

    let specific_key = key[0];

    if(!_.isString(specific_key)){
      eu.throwError('server', 'Non-string key observed.');
    }

    if(_.has(object, specific_key)){

      if(key.length > 1){

        return this.hasRecursive(object[specific_key], key.slice(1, (key.length)), fatal);

      }else{

        return true;

      }

    }

    if(fatal){

      eu.throwError('server','Expected object to have key "'+arrayutilities.compress(key,'.','')+'"');

    }

    return false;

  }

  //Ljubomir:  Please add tests for this.
  //Technical Debt:  Test Me!
  static getRecursive(object, key, fatal){

    du.deep('Get Recursive');

    if(_.isUndefined(fatal)){
      fatal = false;
    }

    if(!arrayutilities.isArray(key)){
      if(_.isString(key)){
        key = key.split('.');
      }else{
        eu.throwError('server', 'Key must be a array or a string.');
      }
    }

    if(key.length < 1){
      eu.throwError('server', 'key array must be of length 1 or greater.');
    }

    let specific_key = key[0];

    if(!_.isString(specific_key)){
      eu.throwError('server', 'Non-string key observed.');
    }

    if(_.has(object, specific_key)){

      if(key.length > 1){

        return this.getRecursive(object[specific_key], key.slice(1, (key.length)), fatal);

      }else{

        return object[specific_key];

      }

    }

    if(fatal){

      eu.throwError('server','Expected object to have key "'+arrayutilities.compress(key,'.','')+'"');

    }

    return undefined;

  }

  //Ljubomir:  Please add tests for this.
  //Technical Debt:  Test Me!
  static setRecursive(object, key, value, fatal){

    du.deep('Set Recursive');

    if(_.isUndefined(fatal)){
      fatal = false;
    }

    if(!arrayutilities.isArray(key)){
      if(_.isString(key)){
        key = key.split('.');
      }else{
        eu.throwError('server', 'Key must be a array or a string.');
      }
    }

    if(key.length < 1){
      eu.throwError('server', 'key array must be of length 1 or greater.');
    }

    let specific_key = key[0];

    if(!_.isString(specific_key)){
      eu.throwError('server', 'Non-string key observed.');
    }

    if(_.has(object, specific_key)){

      if(key.length > 1){

        this.setRecursive(object[specific_key], key.slice(1, (key.length)), value, fatal);

      }else{

        object[specific_key] = value;

      }

    }

    if(fatal){

      eu.throwError('server','Expected object to have key "'+arrayutilities.compress(key,'.','')+'"');

    }

    return object;

  }

  static getParentClassName(object){

    du.deep('Get Parent Class Name');

    this.isObject(object, true);

    if(!_.isUndefined(object, 'constructor') && _.has(object.constructor, 'name')){

      let parent = Object.getPrototypeOf(object.constructor);

      if(_.has(parent, 'name')){

        return parent.name;

      }

    }

    return null;

  }

  static getClassName(object){

    du.deep('Get Class Name');

    this.isObject(object, true);

    if(_.has(object.constructor, 'name')){

      return object.constructor.name;
    }

    return null;

  }

  static clone(object){

    du.deep('Clone');

    this.isObject(object, true);

    return JSON.parse(JSON.stringify(object));

  }

  static additiveFilter(keys, object){

    du.deep('Additive Filter');

    arrayutilities.isArray(keys, true);

    this.isObject(object, true);

    let return_object = {};

    keys.map(key => {

      if(_.has(object, key)){

        return_object[key] = object[key];

      }

    });

    return return_object;

  }

  static subtractiveFilter(keys, object){

    du.deep('Subtractive Filter');

    arrayutilities.isArray(keys, true);

    this.isObject(object, true);

    let return_object = this.clone(object);

    keys.map(key => {

      if(_.has(return_object, key)){

        delete return_object[key];

      }

    });

    return return_object;

  }

  static merge(){

    du.deep('Merge');

    let return_object = {};

    let argumentation = this.getValues(arguments);

    arrayutilities.map(argumentation, (argument) => {

      this.isObject(argument, true);

      return_object = Object.assign(return_object, argument);

    });

    return return_object;

  }

  static isObject(thing, fatal){

    du.deep('Is Object');

    fatal = _.isUndefined(fatal)?false:fatal;

    if(_.isObject(thing)){

      return true;

    }

    if(fatal == true){

      eu.throwError('server', 'Thing is not an object.');

    }

    return false;

  }

  static getKeys(object){

    du.deep('Get Keys');

    this.isObject(object, true);

    return Object.keys(object);

  }

  static getValues(object){

    du.deep('Get Values');

    this.isObject(object, true);

    return Object.keys(object).map(key => object[key]);

  }

  static getObjectType(object){

      du.deep('Get Object Type');

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

  //Ljubomir:  Please add tests for this.
  static recurseByDepth(object, match_function){

      du.deep('Recurse By Depth');

      let all_results = this.recurseAll(object, match_function);

      let result = null;

      if(_.isObject(all_results)){

          all_results.forEach((all_result) => {

              if(_.isNull(result)){

                  if(_.has(all_result, 'depth') && _.has(all_result, 'match')){
                      result = all_result;
                  }else{
                      eu.throwError('validation','Undefined result object:', all_result);
                  }

              }else{

                  if(_.has(all_result, 'depth') && _.has(all_result, 'match')){
                      if(all_result.depth < result.depth){
                          result = all_result;
                      }
                  }else{
                      eu.throwError('validation','Undefined result object:', all_result);
                  }

              }

          });

          if(!_.isNull(result) && _.has(result, 'match')){

              result = result.match;

          }

      }

      return result;

  }

  //Ljubomir:  Please add tests for this.
  static recurseAll(object, match_function, depth){

      du.deep('Recurse All');

      if(_.isUndefined(depth)){
          depth = 1;
      }

      if(!_.isObject(object)){
          return null;
      }

      if(!_.isFunction(match_function)){
          eu.throwError('validation','Match function must be a function.');
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

  //Ljubomir:  Please add tests for this.
  static recurse(object, match_function){

      du.deep('Recurse');

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

      du.deep('Ordered Recursion');

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
