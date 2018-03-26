const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const ContextHelperController = global.SixCRM.routes.include('helpers', 'context/Context.js');
//const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
// const fs = require('fs');
// const uuid = require('uuid');

const SNSEventController = global.SixCRM.routes.include('controllers', 'workers/components/SNSEvent.js');

module.exports = class AnalyticsEventBroker extends SNSEventController {

	constructor() {

		super();

		this.parameter_definition = {};

		//This needs to get refactored, roorganized or renamed.
		this.parameter_validation = {
			'rdsobject': global.SixCRM.routes.path('model', 'analytics/events.json')
		};

		//Need to add state machine events.
		//Need to add out-of-flow events (Refund, Void, Chargeback)
		this.compliant_event_types = ['click', 'lead', 'order', 'upsell[0-9]*', 'downsell[0-9]*', 'confirm', 'rebill', 'transaction'];

		this.event_record_handler = 'pushToRDSQueue';

		this.sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

		this.contextHelperController = new ContextHelperController();

		this.augmentParameters();

	}

	pushToRDSQueue() {

		du.debug('Push To RDSQueue');

		return Promise.resolve()
			.then(() => this.isCompliantEventType())
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
				'datetime',
				'eventMeta', // this probably needs to be by event type
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

		console.log(return_object);

		if (rds_object.account) {

			return_object = this.contextHelperController.transcribeAccount(rds_object, return_object);

		}

		return_object = this.contextHelperController.transcribeDatetime(rds_object, return_object);

		if (rds_object.account) {

			return_object = this.contextHelperController.transcribeCampaignFields(rds_object, return_object);

		}

		return_object = this.contextHelperController.transcribeSessionFields(rds_object, return_object);
		return_object = this.contextHelperController.transcribeAffiliates(rds_object, return_object);

		if (_.has(rds_object, 'product_schedules')) {
			return_object.product_schedules = this.contextHelperController.discoverIDs(rds_object.product_schedules, 'productschedule');
		}

		if (_.has(rds_object, 'products')) {
			return_object.products = this.contextHelperController.discoverIDs(rds_object.products, 'product');
		}

		if (_.has(rds_object, 'eventMeta')) { // this probably needs to be by event type
			return_object.eventMeta = rds_object.eventMeta;
		}

		return return_object;

	}

	pushObjectToRDSQueue() {

		du.debug('Push Object To RDS Queue');

		const rdsObject = this.parameters.get('rdsobject');

		// fs.writeFileSync(rdsObject.type + '-' + uuid.v4() + '.json', JSON.stringify(rdsObject), 'utf8');

		return this.sqsutilities.sendMessage({
			message_body: JSON.stringify(rdsObject),
			queue: 'rds_transaction_batch'
		}).then(() => {
			return true;
		});

	}

}