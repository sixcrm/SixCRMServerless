const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const ContextHelperController = global.SixCRM.routes.include('helpers', 'context/Context.js');
//const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

const SNSEventController = global.SixCRM.routes.include('controllers', 'workers/components/SNSEvent.js');

class AnalyticsEventBroker extends SNSEventController {

	constructor() {

		super();

		this.parameter_definition = {};

		//This needs to get refactored, roorganized or renamed.
		this.parameter_validation = {
			'rdsobject': global.SixCRM.routes.path('model', 'analytics/events.json')
		};

		//Need to add state machine events.
		//Need to add out-of-flow events (Refund, Void, Chargeback)
		this.compliant_event_types = ['click', 'lead', 'order', 'upsell[0-9]*', 'downsell[0-9]*', 'confirm', 'rebill'];

		this.event_record_handler = 'pushToRDSQueue';

		this.sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

		this.contextHelperController = new ContextHelperController();

		this.augmentParameters();

	}

	pushToRDSQueue() {

		du.debug('Push To RDSQueue');

		return Promise.resolve()
			.then(() => this.isComplaintEventType())
			.then(() => this.assembleRDSQueueObject())
			.then(() => this.pushObjectToRDSQueue())
			.catch(error => {
				du.error(error);
				return true;
			});

	}

	assembleRDSQueueObject() {

		du.debug('Assemble RDS Queue Object');

		let context = this.parameters.get('message').context;

		let rds_object = this.contextHelperController.discoverObjectsFromContext(
			[
				'campaign',
				'session',
				'products',
				'product_schedules',
				'affiliates',
				'datetime'
			],
			context
		);

		rds_object = this.transformRDSObject(rds_object);

		this.parameters.set('rdsobject', rds_object);

		return true;

	}

	transformRDSObject(rds_object) {

		du.debug('Transform RDS Object');

		let return_object = {
			type: this.parameters.get('message').event_type
		};

		return_object = this.contextHelperController.transcribeAccount(rds_object, return_object);
		return_object = this.contextHelperController.transcribeDatetime(rds_object, return_object);
		return_object = this.contextHelperController.transcribeCampaignFields(rds_object, return_object);
		return_object = this.contextHelperController.transcribeSessionFields(rds_object, return_object);
		return_object = this.contextHelperController.transcribeAffiliates(rds_object, return_object);

		if (_.has(rds_object, 'product_schedules')) {
			return_object.product_schedules = this.contextHelperController.discoverIDs(rds_object.product_schedules, 'productschedule');
		}

		if (_.has(rds_object, 'products')) {
			return_object.products = this.contextHelperController.discoverIDs(rds_object.products, 'product');
		}

		//Technical Debt:  Isn't this redundant, please see above.
		/*
		if(_.has(rds_object, 'affiliates')){
		  return_object = this.affiliateHelperController.transcribeAffiliates(rds_object.affiliates, return_object);
		}
		*/

		return return_object;

	}

	pushObjectToRDSQueue() {

		du.debug('Push Object To RDS Queue');

		let rds_object = this.parameters.get('rdsobject');

		return this.sqsutilities.sendMessage({
			message_body: JSON.stringify(rds_object),
			queue: 'rds_transaction_batch'
		}).then(() => {
			return true;
		});

	}

}

module.exports = new AnalyticsEventBroker();