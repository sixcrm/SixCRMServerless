'use strict';
const _ = require('underscore');
const eu = global.SixCRM.routes.include('lib','error-utilities.js');

class ArrayUtilities {

  //Technical Debt:  Needs testing.
  static group(object_array, differentiator_acquisition_function){

    this.isArray(object_array, true);

    if(!_.isFunction(differentiator_acquisition_function)){
      eu.throwError('server', 'ArrayUtilities.group differentiator_acquisition_function is not a function.')
    }

    const return_object = {};

    this.map(object_array, object_array_element => {

      let differentiator = differentiator_acquisition_function(object_array_element);

      if(!_.isNull(differentiator)){

        if (!_.has(return_object, differentiator)) {
          return_object[differentiator] = [object_array_element];
        }else{
          return_object[differentiator].push(object_array_element);
        }

      }

    });

    return return_object;

  }

  static flatten(multidimensional_array, depth){

    depth = (_.isUndefined(depth))?0:depth;

    if(depth > 20){
      eu.throwError('server', 'Array Utilties flatten recursion depth exceeded.');
    }

    let return_object = [];

    if(this.isArray(multidimensional_array)){

      this.map(multidimensional_array, multidimensional_array_element => {

        let flattened_array = this.flatten(multidimensional_array_element, (depth + 1));

        this.map(flattened_array, flattened_array_element => {

          return_object.push(flattened_array_element);

        });

      });

    }else{

      return_object.push(multidimensional_array);

    }

    return return_object;

  }

    static nonEmpty(thing, fatal){

      if(_.isUndefined(fatal)){

        fatal = false;

      }

      if(this.isArray(thing, fatal)){

        if(thing.length > 0){

          return true;

        }

      }

      if(fatal == true){

        eu.throwError('server', 'Array is empty.');

      }

      return false;

    }

    static isArray(thing, fatal){

      if(!_.isArray(thing)){

        if(!_.isUndefined(fatal) && fatal ==true){

          eu.throwError('server','ArrayUtilities.isArray thing argument is not an array.');

        }

        return false;

      }

      return true;

    }

    static assureEntries(a_array, type){

      let validation_functions = {
        number:(array_value) => {
          return _.isNumber(array_value);
        },
        string:(array_value) => {
          return _.isString(array_value);
        },
        object:(array_value) => {
          return _.isObject(array_value);
        },
        array:(array_value) => {
          return _.isArray(array_value);
        },
        error:(array_value) => {
          return _.isError(array_value);
        }
      };

      if(!_.has(validation_functions, type)){

        eu.throwError('server', 'ArrayUtilities.assureEntities type has unknown value.');

      }

      return this.every(a_array, validation_functions[type]);

    }

    static sort(sort_array, sort_function){

      if(_.isUndefined(sort_function)){
        sort_function = (a,b) => { return a - b; }
      }

      this.nonEmpty(sort_array, true);

      if(!_.isFunction(sort_function)){
          eu.throwError('server','ArrayUtilities.sort sort_function argument is not a function.');
      }

      if(sort_array.length < 2){
        return sort_array;
      }

      return sort_array.sort(sort_function);

    }

    static every(array, a_function){

        if(!_.isArray(array)){
            eu.throwError('validation','ArrayUtilities.every array argument is not a array.');
        }

        if(!_.isFunction(a_function)){
            eu.throwError('validation','ArrayUtilities.every function argument is not a function.');
        }

        let return_array = array.every(a_function);

        return return_array;

    }

    static map(array, a_function){

        if(!_.isArray(array)){
          eu.throwError('validation','ArrayUtilities.map array argument is not a array.');
        }

        if(!_.isFunction(a_function)){
          eu.throwError('validation','ArrayUtilities.map function argument is not a function.');
        }

        let return_array = array.map(a_function);

        return return_array;

    }

    static compress(precompression_array, delimiter, quote_style){

        this.validateArray(precompression_array);

        if(_.isUndefined(delimiter)){
            delimiter = ',';
        }

        if(_.isUndefined(quote_style)){
            quote_style = '\'';
        }

        return quote_style+precompression_array.join(quote_style+delimiter+quote_style)+quote_style;

    }

    static removeElement(array_object, element){

        this.validateArray(array_object);

        if(!_.contains(array_object, element)){
            return array_object;
        }

        let index = array_object.indexOf(element);

        if (index > -1) {
            array_object.splice(index, 1);
        }

        return array_object;

    }

    static validateArray(thing){
        if(!_.isArray(thing)){
            eu.throwError('validation','Compress only accepts array arguments');
        }
        return true;
    }

    static merge(array1, array2){

        if(!_.isArray(array1)){
            eu.throwError('validation','ArrayUtilities.merge array argument 1 is not a array.');
        }

        return array1.concat(array2);

    }

    static filter(array, filter_function){

        if(!_.isArray(array)){
            eu.throwError('validation','ArrayUtilities.filter array argument is not a array.');
        }

        if(!_.isFunction(filter_function)){
            eu.throwError('validation','ArrayUtilities.filter filter function is not a function.');
        }

        let return_array = array.filter(filter_function);

        return return_array;

    }

    static find(array, find_function){

        if(!_.isArray(array)){
            eu.throwError('validation','ArrayUtilities.find array argument is not a array.');
        }

        if(!_.isFunction(find_function)){
            eu.throwError('validation','ArrayUtilities.find find function is not a function.');
        }

        return array.find(find_function);

    }

    static serialPromises(array_of_promises){

      return this.reduce(
        array_of_promises,
        (promiseChain, currentTask) => {
          return promiseChain.then(chainResults =>
              currentTask.then(currentResult =>
                  [ ...chainResults, currentResult ]
              )
          );
        },
        Promise.resolve([])
      ).then(results => {
        return results;
      });

    }


    static serial(array, reduction_function, initial_value){

      initial_value = (_.isUndefined(initial_value))?Promise.resolve():initial_value;

      if(_.isUndefined(reduction_function) || !_.isFunction(reduction_function)){

        reduction_function = (current, next) => {
          if(_.isUndefined(current)){
            return next;
          }
          return current.then(next);
        };

      }

      return this.reduce(array, reduction_function, initial_value);

    }

    static reduce(array, reduce_function, initial_value){

      if(!_.isArray(array)){
          eu.throwError('validation','ArrayUtilities.reduce array argument is not a array.');
      }

      if(!_.isFunction(reduce_function)){
          eu.throwError('validation','ArrayUtilities.reduce reduce function is not a function.');
      }

      if(_.isUndefined(initial_value)){
        initial_value = 0;
      }

      return array.reduce(reduce_function, initial_value);

    }

    static unique(array) {

        var a = array.concat();

        for(var i=0; i<a.length; ++i) {
            for(var j=i+1; j<a.length; ++j) {
                if(a[i] === a[j]){
                    a.splice(j--, 1);
                }
            }
        }

        return a;

    }

    static chunk(array, size){

      this.validateArray(array);

      if(!isNatural(size)) {
        eu.throwError('server','ArrayUtilities.chunk assumes a non-zero, non-negative integer size argument');
      }

      return array.map((e,i) => {
        if (i % size === 0){
          return array.slice(i, (i+size));
        }else{
          return null;
        }
      }).filter((e) => { return e; });

      function isNatural(number) {
        return (number > 0) && (Math.floor(number) === number);
      }

    }

    static last(array){

      if(!_.isArray(array)){
          eu.throwError('validation','ArrayUtilities.last array argument is not a array.');
      }

      return array[array.length - 1];
    }

}

module.exports = ArrayUtilities;
