
const uuidV4 = require('uuid/v4');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

const IntegrationTest = global.SixCRM.routes.include('test', 'integration/classes/IntegrationTest');

module.exports = class CampaignTest extends IntegrationTest {

	constructor(){

		super();

	}

	executeTrackerBlockTest(){

		du.info('Execute Tracker Block Test');

		let campaign_id = uuidV4();
		let tracker_id = uuidV4();

		du.info('Campaign ID: '+campaign_id);
		du.info('Tracker ID: '+tracker_id);

		return this.createCampaign(campaign_id)
			.then(() => this.createTracker(tracker_id, campaign_id))
			.then(() => this.deleteCampaign(campaign_id, 403))
			.then(response => {
				return response;
			})
			.then(() => this.deleteTracker(tracker_id))
			.then(() => this.deleteCampaign(campaign_id));

	}

	createCampaign(campaign_id){

		du.info('Create Campaign');

		let campaign_create_query = `mutation { createcampaign ( campaign: { id: "`+campaign_id+`", name: "Testing Campaign", allow_on_order_form: true, allow_prepaid: false, show_prepaid: false, productschedules:[], emailtemplates:[], affiliate_allow:[], affiliate_deny:[] } ) { id  } }`;

		return this.executeQuery(campaign_create_query);

	}

	createTracker(tracker_id, campaign_id){

		du.info('Create Tracker');

		let tracker_create_query = `mutation { createtracker ( tracker: { id: "`+tracker_id+`", event_type:["main"], affiliates: [], campaigns: ["`+campaign_id+`"] type: "postback", name:"Testing Tracker 3", body:"http://sofun.com"}) { id } }`;

		return this.executeQuery(tracker_create_query);

	}

	deleteTracker(id, code){

		du.info('Delete Tracker');

		let tracker_delete_query = 'mutation { deletetracker (id: "'+id+'") { id } }';

		return this.executeQuery(tracker_delete_query, code);

	}

	deleteCampaign(id, code){

		du.info('Delete Campaign');

		let campaign_delete_query = 'mutation { deletecampaign (id: "'+id+'") { id } }';

		return this.executeQuery(campaign_delete_query, code);

	}

}
