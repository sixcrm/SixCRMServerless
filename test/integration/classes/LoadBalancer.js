'use strict'
const uuidV4 = require('uuid/v4');

const du = global.SixCRM.routes.include('lib','debug-utilities.js');

const IntegrationTest = global.SixCRM.routes.include('test', 'integration/classes/IntegrationTest');

module.exports = class LoadBalancerTest extends IntegrationTest {

  constructor(){

    super();

  }

  executeProductScheduleBlockTest(){

    du.output('Execute Product Schedule Block Test');

    let loadbalancer_id = uuidV4();
    let productschedule_id = uuidV4();

    du.info('Load Balancer ID: '+loadbalancer_id);
    du.info('Product Schedule ID: '+productschedule_id);

    return this.createLoadBalancer(loadbalancer_id)
    .then(() => this.createProductSchedule(productschedule_id, loadbalancer_id))
    .then(() => this.deleteLoadBalancer(loadbalancer_id, 403))
    .then(response => {
      return response;
    })
    .then(() => this.deleteProductSchedule(productschedule_id))
    .then(() => this.deleteLoadBalancer(loadbalancer_id));

  }

  createLoadBalancer(loadbalancer_id){

    du.output('Create Load Balancer');

    let loadbalancer_create_query = `mutation { createloadbalancer ( loadbalancer: {id: "`+loadbalancer_id+`", name: "Simple load balancer", merchantproviders: [{id:"6c40761d-8919-4ad6-884d-6a46a776cfb9", distribution:1.0 } ] } ) { id } }`;

    return this.executeQuery(loadbalancer_create_query);

  }

  createProductSchedule(productschedule_id, loadbalancer_id){

    du.output('Create Product Schedule');

    let emailtemplate_create_query = `mutation { createproductschedule ( productschedule: { id: "`+productschedule_id+`", name:"Testing Name", loadbalancer:"`+loadbalancer_id+`", schedule: [{ product:"668ad918-0d09-4116-a6fe-0e7a9eda36f8", start:0, end:30, price:49.00, period:30 }]}) { id } }`;

    return this.executeQuery(emailtemplate_create_query);

  }

  deleteLoadBalancer(id, code){

    du.output('Delete Load Balancer');

    let delete_query = `mutation { deleteloadbalancer (id: "`+id+`") { id } }`;

    return this.executeQuery(delete_query, code);

  }

  deleteProductSchedule(id, code){

    du.output('Delete Product Schedule');

    let delete_query = `mutation { deleteproductschedule (id: "`+id+`" ) { id } }`;

    return this.executeQuery(delete_query, code);

  }

}
