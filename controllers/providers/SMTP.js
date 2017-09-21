'use strict'
const _ = require('underscore');

const smtputilities = global.SixCRM.routes.include('lib', 'smtp-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib','array-utilities.js');

module.exports = class SMTPProvider {

    constructor(smtp_provider){

        this.required_options = ['hostname', 'username', 'password'];
        this.optional_options = ['port'];

        this.setOptions(smtp_provider);

        this.setConnection();

    }

    setOptions(smtp_provider){

        du.debug('Set Options');

        this.required_options.forEach((required_option) => {

            if(!_.has(smtp_provider, required_option)){

                eu.throwError('server','SMTP Object requires "'+required_option+'" option.');

            }else{

                this[required_option] = smtp_provider[required_option];

            }

        });

        this.optional_options.forEach((optional_option) => {

            if(_.has(smtp_provider, optional_option)){

                this[optional_option] = smtp_provider[optional_option];

            }

        });

    }

    getOptions(){

        du.debug('Get Options');

        let options = arrayutilities.merge(this.required_options, this.optional_options);

        let options_object = {};

        options.forEach((option) => {

            if(_.has(this, option)){
                options_object[option] = this[option];
            }

        });

        this.validateOptions(options_object);

        return options_object;

    }

    validateOptions(options_object){

        du.debug('Validate Options');

        mvu.validateModel(options_object, global.SixCRM.routes.path('model', 'general/smtp_options.json'));

    }

    setConnection(){

        du.debug('Set Connection');

        let options = this.getOptions();

        this.connection = new smtputilities(options);

    }

    send(send_object){

        du.debug('Send');

        return this.connection.send(send_object).then((send_result) => {

          return Promise.resolve(send_result);

        }).catch(error => {

          return Promise.reject(error);

        });

    }

}
