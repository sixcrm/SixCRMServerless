'use strict'
const uuidV4 = require('uuid/v4');

const du = global.SixCRM.routes.include('lib','debug-utilities.js');

const IntegrationTest = global.SixCRM.routes.include('test', 'integration/classes/IntegrationTest');

module.exports = class AffiliateTest extends IntegrationTest {

  constructor(){

    super();

  }

  executeCampaignBlockTest(){

    du.output('Execute Campaign Block Test');

    let affiliate_id = uuidV4();
    let campaign_id = uuidV4();

    du.info('Affiliate ID: '+affiliate_id);
    du.info('Campaign ID: '+campaign_id);

    return this.createAffiliate(affiliate_id)
    .then(() => this.createCampaign(campaign_id, affiliate_id))
    .then(() => this.deleteAffiliate(affiliate_id, 403))
    .then(() => this.deleteCampaign(campaign_id))
    .then(() => this.deleteAffiliate(affiliate_id));

  }


  executeSessionBlockTest(){

    du.output('Execute Tracker Block Test');

    let affiliate_id = uuidV4();
    let session_id = uuidV4();

    du.info('Affiliate ID: '+affiliate_id);
    du.info('Session ID: '+session_id);

    return this.createAffiliate(affiliate_id)
    .then(() => this.createSession(session_id, affiliate_id))
    .then(() => this.deleteAffiliate(affiliate_id, 403))
    .then(response => {
      return response;
    })
    .then(() => this.deleteSession(session_id))
    .then(() => this.deleteAffiliate(affiliate_id));

  }


  executeTrackerBlockTest(){

    du.output('Execute Tracker Block Test');

    let affiliate_id = uuidV4();
    let tracker_id = uuidV4();

    du.info('Affiliate ID: '+affiliate_id);
    du.info('Tracker ID: '+tracker_id);

    return this.createAffiliate(affiliate_id)
    .then(() => this.createTracker(tracker_id, affiliate_id))
    .then(() => this.deleteAffiliate(affiliate_id, 403))
    .then(() => this.deleteTracker(tracker_id))
    .then(() => this.deleteAffiliate(affiliate_id));

  }

  createAffiliate(affiliate_id){

    du.output('Create Affiliate');

    let affiliate_create_query = 'mutation { createaffiliate (affiliate: { id: "'+affiliate_id+'", name:"what", affiliate_id: "test" }) { id, affiliate_id, created_at, updated_at } }';

    return this.executeQuery(affiliate_create_query);

  }

  createTracker(tracker_id, affiliate_id){

    du.output('Create Tracker');

    let tracker_create_query = 'mutation { createtracker (tracker: { id: "'+tracker_id+'", event_type:["main"], affiliates: ["'+affiliate_id+'"], type: \"postback\", name:\"Testing Tracker 3\", body:\"http://sofun.com\"}) { id, affiliates{ id, name, affiliate_id, created_at, updated_at }, type, name, body, created_at, updated_at } }';

    return this.executeQuery(tracker_create_query);

  }

  createCampaign(campaign_id, affiliate_id){

    du.output('Create Campaign');

    let campaign_create_query = `mutation { createcampaign ( campaign: { id: "`+campaign_id+`", name: "Testing Campaign", allow_prepaid: false, show_prepaid: false, productschedules:[], emailtemplates:[], affiliate_allow:[], affiliate_deny:["`+affiliate_id+`"] } ) { id  } }`;

    return this.executeQuery(campaign_create_query);

  }

  createSession(session_id, affiliate_id){

    du.output('Create Session');

    let session_create_query = `mutation { createsession ( session: { id: "`+session_id+`", customer: "24f7c851-29d4-4af9-87c5-0298fa74c689", affiliate: "`+affiliate_id+`", campaign:"70a6689a-5814-438b-b9fd-dd484d0812f9", product_schedules:["12529a17-ac32-4e46-b05b-83862843055d"], completed: false } ) { id } }`;

    return this.executeQuery(session_create_query);

  }

  deleteAffiliate(id, code){

    du.output('Delete Affiliate');

    let affiliate_delete_query = 'mutation { deleteaffiliate (id: "'+id+'") { id } }';

    return this.executeQuery(affiliate_delete_query, code);

  }

  deleteTracker(id, code){

    du.output('Delete Tracker');

    let tracker_delete_query = 'mutation { deletetracker (id: "'+id+'") { id } }';

    return this.executeQuery(tracker_delete_query, code);

  }

  deleteCampaign(id, code){

    du.output('Delete Campaign');

    let campaign_delete_query = 'mutation { deletecampaign (id: "'+id+'") { id } }';

    return this.executeQuery(campaign_delete_query, code);

  }

  deleteSession(id, code){

    du.output('Delete Session');

    let session_delete_query = 'mutation { deletesession (id: "'+id+'") { id } }';

    return this.executeQuery(session_delete_query, code);

  }

}
