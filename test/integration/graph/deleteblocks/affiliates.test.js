'use strict'
const chai = require('chai');

chai.use(require('chai-json-schema'));
const assert = require('chai').assert
const uuidV4 = require('uuid/v4');

const tu = global.SixCRM.routes.include('lib','test-utilities.js');
const du = global.SixCRM.routes.include('lib','debug-utilities.js');

const IntegrationTest = global.SixCRM.routes.include('test', 'integration/IntegrationTest');

class AffiliateDeleteBlockTest extends IntegrationTest {

  constructor(){

    super();

    this.endpoint = global.integration_test_config.endpoint;
    this.account = global.test_accounts[1];
    this.user = global.test_users[0];
    this.test_jwt = tu.createTestAuth0JWT(this.user.email, global.SixCRM.configuration.site_config.jwt.site.secret_key);

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
    .then(response => {
      du.highlight(response.body);
      return response;
    })
    .then(() => this.deleteTracker(tracker_id))
    .then(() => this.deleteAffiliate(affiliate_id))
    .then((response) => {
      du.highlight(response.body);
      return response;
    });

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

}

describe('Affiliate Delete Block Test', () => {

  it('Should not allow the delete', () => {

    let affiliateDeleteBlockTest = new AffiliateDeleteBlockTest();

    return affiliateDeleteBlockTest.executeTrackerBlockTest().then(results => {
      du.highlight(results);
    });

  });

});
