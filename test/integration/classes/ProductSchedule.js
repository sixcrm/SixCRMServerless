'use strict'
const uuidV4 = require('uuid/v4');

const du = global.SixCRM.routes.include('lib','debug-utilities.js');

const IntegrationTest = global.SixCRM.routes.include('test', 'integration/classes/IntegrationTest');

module.exports = class ProductScheduleTest extends IntegrationTest {

  constructor(){

    super();

  }

  executeCampaignBlockTest(){

    du.output('Execute Campaign Block Test');

    let productschedule_id = uuidV4();
    let campaign_id = uuidV4();

    du.info('Product Schedule ID: '+productschedule_id);
    du.info('Campaign ID: '+campaign_id);

    return this.createProductSchedule(productschedule_id)
    .then(() => this.createCampaign(campaign_id, productschedule_id))
    .then(() => this.deleteProductSchedule(productschedule_id, 403))
    .then(response => {
      return response;
    })
    .then(() => this.deleteCampaign(campaign_id))
    .then(() => this.deleteProductSchedule(productschedule_id));

  }

  executeRebillBlockTest(){

    du.output('Execute Rebill Block Test');

    let productschedule_id = uuidV4();
    let rebill_id = uuidV4();

    du.info('Product Schedule ID: '+productschedule_id);
    du.info('Rebill ID: '+rebill_id);

    return this.createProductSchedule(productschedule_id)
    .then(() => this.createRebill(rebill_id, productschedule_id))
    .then(() => this.deleteProductSchedule(productschedule_id, 403))
    .then(response => {
      return response;
    })
    .then(() => this.deleteRebill(rebill_id))
    .then(() => this.deleteProductSchedule(productschedule_id));

  }

  createProductSchedule(productschedule_id){

    du.output('Create Product Schedule');

    let productschedule_create_query = `mutation { createproductschedule ( productschedule: { id: "`+productschedule_id+`", name:"Testing Name", loadbalancer:"927b4f7c-b0e9-4ddb-a05c-ba81d2d663d3", schedule: [ {product:"668ad918-0d09-4116-a6fe-0e7a9eda36f8",start:0,end:30,price:49.00,period:30}]}) { id } }`;

    return this.executeQuery(productschedule_create_query);

  }

  createCampaign(campaign_id, productschedule_id){

    du.output('Create Campaign');

    let campaign_create_query = `mutation { createcampaign ( campaign: { id: "`+campaign_id+`", name: "Testing Campaign", allow_prepaid: false, show_prepaid: false, productschedules:["`+productschedule_id+`"], emailtemplates:["b44ce483-861c-4843-a7d6-b4c649d6bdde","8108d6a3-2d10-4013-9e8e-df71e2dc578b"], affiliate_allow:["*"], affiliate_deny:["ad58ea78-504f-4a7e-ad45-128b6e76dc57"] } ) { id } }`;

    return this.executeQuery(campaign_create_query);

  }

  createRebill(rebill_id, productschedule_id){

    du.output('Create Rebill');

    let rebill_create_query = `mutation { createrebill ( rebill: { id: "`+rebill_id+`", bill_at:"2017-04-10T19:26:58.026Z", parentsession: "668ad918-0d09-4116-a6fe-0e8a9eda36f7", amount:"30000.00", product_schedules:["`+productschedule_id+`"] } ) { id } }`;

    return this.executeQuery(rebill_create_query);

  }

  deleteProductSchedule(id, code){

    du.output('Delete Product Schedule');

    let delete_query = `mutation { deleteproductschedule (id: "`+id+`") { id } }`;

    return this.executeQuery(delete_query, code);

  }

  deleteCampaign(id, code){

    du.output('Delete Campaign');

    let delete_query = `mutation { deletecampaign (id: "`+id+`" ) { id } }`;

    return this.executeQuery(delete_query, code);

  }

  deleteRebill(id, code){

    du.output('Delete Rebill');

    let delete_query = `mutation { deleterebill (id: "`+id+`" ) { id } }`;

    return this.executeQuery(delete_query, code);

  }

}
