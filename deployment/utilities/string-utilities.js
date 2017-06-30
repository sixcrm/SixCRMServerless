'use strict';

class StringUtilities {

    constructor() {
    }

    capitalize(input) {
        return input.charAt(0).toUpperCase() + input.slice(1);
    }

    toPascalCase(input) {
        let result = this.capitalize(input);

        while (result.indexOf('_') > -1) {
            let underscore = result.indexOf('_');

            result = result.slice(0, underscore) + result[underscore + 1].toUpperCase() + result.slice(underscore + 2);
        }

        return result;
    }
}

module.exports = new StringUtilities();