'use strict'
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = class CustomerHelperController {

  constructor(){

    this.parameter_definition = {
      customerSessionBySecondaryIdentifier:{
        required: {
          customer: 'customer',
          secondaryidentifier: 'secondary_identifier'
        },
        optional:{}
      }
    };

    this.parameter_validation = {
      'customer':global.SixCRM.routes.path('model', 'definitions/email.json'),
      'secondaryidentifier':global.SixCRM.routes.path('model', 'helpers/entities/customer/secondaryidentifier.json')
    };

    const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

    this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definition});

  }

  customerSessionBySecondaryIdentifier({customer, secondary_identifier}){

    du.debug('Customer Session By Secondary Identifier');

    return Promise.resolve()
    .then(() =>  this.parameters.setParameters({argumentation: arguments[0], action:'customerSessionBySecondaryIdentifier'}))
    .then(() => {

      let secondary_identifier_functions = {
        'session.id':() => {
          const SessionHelperController = global.SixCRM.routes.include('helpers','entities/session/Session.js');
          let sessionHelperController = new SessionHelperController();

          return sessionHelperController.getSessionByCustomerAndID({customer: customer, id: secondary_identifier.value});
        },
        'session.alias':() => {
          const SessionHelperController = global.SixCRM.routes.include('helpers','entities/session/Session.js');
          let sessionHelperController = new SessionHelperController();

          return sessionHelperController.getSessionByCustomerAndAlias({customer: customer, alias: secondary_identifier.value});
        },
        'transaction.alias':() => this.sessionController.getSessionByCustomentAndTransactionAlias({customer: customer, transaction_alias: secondary_identifier.value}),
        'creditcard.number':() => this.sessionController.getSessionByCustomerAndCreditCardNumber({customer: customer, lastfour: secondary_identifier.value})
      }

      return secondary_identifier_functions[secondary_identifier.type]().then(result => {
        return result;
      });

    });

  }

}
