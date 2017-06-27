'use strict';
const _ = require('underscore');

class ArrayUtilities {

    static compress(precompression_array, delimiter, quote_style){

        this.validateArray(precompression_array);

        if(_.isUndefined(delimiter)){
            delimiter = ',';
        }

        if(_.isUndefined(quote_style)){
            quote_style = '\'';
        }

        return quote_style+precompression_array.join(quote_style+delimiter,quote_style)+quote_style;

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
            throw new Error('Compress only accepts array arguments');
        }
        return true;
    }

    static merge(array1, array2){

        return array1.concat(array2);

    }

    static filter(array, filter_function){

        if(!_.isArray(array)){
            throw new Error('ArrayUtilities.filter array argument is not a array.');
        }

        if(!_.isFunction(filter_function)){
            throw new Error('ArrayUtilities.filter filter function is not a function.');
        }

        let return_array = array.filter(filter_function);

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

}

module.exports = ArrayUtilities;
