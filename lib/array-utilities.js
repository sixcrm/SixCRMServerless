'use strict';
const _ = require('underscore');
const eu = global.SixCRM.routes.include('lib','error-utilities.js');

class ArrayUtilities {

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

    static find(array, filter_function){

        if(!_.isArray(array)){
            eu.throwError('validation','ArrayUtilities.filter array argument is not a array.');
        }

        if(!_.isFunction(filter_function)){
            eu.throwError('validation','ArrayUtilities.filter filter function is not a function.');
        }

        return array.find(filter_function);

    }

    static serial(array){

      //Note:  Returns a promise, executes the array of promise-based functions serially
      return this.reduce(array, (current, next) => {
        if(_.isUndefined(current)){
          return next;
        }
        return current.then(next);
      }, Promise.resolve());

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
