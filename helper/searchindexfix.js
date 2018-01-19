'use strict';
require('../SixCRM.js');

const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');

const ReIndexingHelperController = global.SixCRM.routes.include('helpers', 'indexing/ReIndexing.js');
let reIndexingHelperController = new ReIndexingHelperController();

let configuration = {
    fix: false
};

let cli_parameters = {
    'fix': /^--fix=.*$/
};

objectutilities.map(cli_parameters, key => {

    let regex = cli_parameters[key];

    arrayutilities.find(process.argv, (argument) => {
        if(stringutilities.isMatch(argument, regex)){
            configuration[key] = argument.split('=')[1];
            return true;
        }
        return false;
    });

});

return reIndexingHelperController.execute(configuration.fix === 'true').then(() => process.exit());