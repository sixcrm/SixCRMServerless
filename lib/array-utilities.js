'use strict';
const _ = require('underscore');

class ArrayUtilities {

    static compress(precompression_array, delimiter, quote_style){

        if(!_.isArray(precompression_array)){
            throw new Error('Compress accepts array arguments');
        }

        if(_.isUndefined(delimiter)){
            delimiter = ',';
        }

        if(_.isUndefined(quote_style)){
            quote_style = '\'';
        }

        return quote_style+precompression_array.join(quote_style+delimiter,quote_style)+quote_style;

    }

}

module.exports = ArrayUtilities;
