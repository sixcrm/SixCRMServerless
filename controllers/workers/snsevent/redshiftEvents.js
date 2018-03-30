'use strict'
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const SNSEventController = global.SixCRM.routes.include('controllers', 'workers/components/SNSEvent.js');

module.exports = class RedshiftEventsController extends SNSEventController {

	constructor() {

		super();

		this.parameter_definition = {};

		this.parameter_validation = {
			'redshiftobject': global.SixCRM.routes.path('model', 'analytics/events.json')
		};

		this.compliant_event_types = ['click', 'lead', 'order', 'upsell[0-9]*', 'downsell[0-9]*', 'confirm'];

		this.event_record_handler = 'pushToRedshift';

		const ContextHelperController = global.SixCRM.routes.include('helpers', 'context/Context.js');

		this.contextHelperController = new ContextHelperController();

		this.augmentParameters();

	}

	pushToRedshift() {

		du.debug('Push To Redshift');

		return Promise.resolve()
			.then(() => this.isCompliantEventType())
			.then(() => this.assembleRedshiftObject())
			.then(() => this.pushObjectToRedshift())
			.catch(error => {
				du.error(error);
				return true;
			});

	}

	assembleRedshiftObject() {

		du.debug('Assemble Redshift Object');

		let redshift_object = this.contextHelperController.discoverObjectsFromContext([
			'campaign',
			'session',
			'products',
			'product_schedules',
			'affiliates',
			'datetime'
		]);

		redshift_object = this.transformRedshiftObject(redshift_object);

		this.parameters.set('redshiftobject', redshift_object);

		return true;

	}

	transformRedshiftObject(redshift_object) {

		du.debug('Transform Redshift Object');

		let return_object = {
			type: this.parameters.get('message').event_type
		};

		return_object = this.contextHelperController.transcribeAccount(redshift_object, return_object);
		return_object = this.contextHelperController.transcribeDatetime(redshift_object, return_object);
		return_object = this.contextHelperController.transcribeCampaignFields(redshift_object, return_object);
		return_object = this.contextHelperController.transcribeSessionFields(redshift_object, return_object);
		return_object = this.contextHelperController.transcribeAffiliates(redshift_object, return_object);

		if (_.has(redshift_object, 'product_schedules')) {
			return_object.product_schedules = this.contextHelperController.flatten(redshift_object.product_schedules, 'productschedule');
		}

		if (_.has(redshift_object, 'products')) {
			return_object.products = this.contextHelperController.flatten(redshift_object.products, 'product');
		}

		if (_.has(redshift_object, 'affiliates')) {
			return_object = this.contextHelperController.transcribeAffiliates(redshift_object.affiliates, return_object);
		}

		return return_object;

	}

	pushObjectToRedshift() {

		du.debug('Push Object To Redshift');

		/*
		let redshift_object = this.parameters.get('redshiftobject');

		if(!_.has(this, 'kinesisfirehoseutilities')){
		  this.kinesisfirehoseutilities = global.SixCRM.routes.include('lib', 'kinesis-firehose-utilities.js');
		}

		//Technical debt:  There are several kinesis pipelines for seperate tables...
		return this.kinesisfirehoseutilities.putRecord('events', redshift_object).then((result) => {
		  return result;
		});
		*/

		return true;

	}

}
