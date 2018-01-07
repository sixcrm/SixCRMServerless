'use strict'
require('../SixCRM.js');

const _ = require('underscore');

const du = global.SixCRM.routes.include('lib','debug-utilities.js');

const TransactionGenerator = global.SixCRM.routes.include('helpers','transaction/generator/Generator.js');
let transactionGenerator = new TransactionGenerator();

let environment = 'development';

let parameters = {
  endpoint: 'https://'+environment+'-api.sixcrm.com/',
  account: 'eefdeca6-41bc-4af9-a561-159acb449b5e',
  access_key: '8SUJAY9BR17LN2QUJAMLQ6NDXZ8RTCQ7SS42RTAE',
  secret_key: 'fb809cd5cb5342222c9bcd95ba7e5510ecb033e5',
  campaign: '5c593d31-5001-4faf-8ea2-e8c1a1f85f04',
  product_schedule: '77c72379-de6f-449d-96b6-ac888852729f'
};

return transactionGenerator.issue(parameters).then(result => {
  du.output('Transaction Issued');
});
