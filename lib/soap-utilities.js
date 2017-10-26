'use strict';
const _ = require('underscore');
const soap = require('soap');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');

module.exports = class SOAPUtilities {

    constructor({wsdl}) {

        stringutilities.isString(wsdl, true);

        this.wsdl = wsdl;
        this.client_instance = null;
    }

    getClient() {

        du.debug('Get SOAP client');

        if (this.client_instance !== null) {

            du.debug('Using existing client.');

            return Promise.resolve(this.client_instance);

        }

        return soap.createClientAsync(this.wsdl).then((client) => {

            du.debug('Create SOAP client');

            this.client_instance = client;

            return client;

        }).catch((error) => {
            eu.throwError('server', error);
        });
    }

    executeMethod({name, parameters}) {

        du.debug('Execute method', name, parameters);

        stringutilities.isString(name, true);

        let method_name = name + 'Async';

        return this.getClient().then(client => client[method_name](parameters));
    }

};
