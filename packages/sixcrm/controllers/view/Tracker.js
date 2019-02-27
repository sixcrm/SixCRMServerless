
const _ = require('lodash');

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;

const TrackerController = global.SixCRM.routes.include('controllers', 'entities/Tracker.js');
const trackerController = new TrackerController();
const LambdaResponse = global.SixCRM.routes.include('controllers', 'providers/lambda-response.js');

module.exports = class TrackerViewController{

	constructor(){

	}

	view(argumentation_object){
		du.info(argumentation_object);

		if(!_.has(argumentation_object, 'pathParameters')){ return Promise.reject(eu.getError('bad_request','Argumentation object missing pathParameters.')); }

		if(!_.has(argumentation_object.pathParameters, 'tracker')){ return Promise.reject(eu.getError('bad_request','Invalid Argumentation')); }

		let tracker = argumentation_object.pathParameters.tracker;

		trackerController.disableACLs();
		return trackerController.get({id: tracker}).then((tracker) => {
			trackerController.enableACLs();

			if(trackerController.validate(tracker)){

				if(tracker.type == 'html'){

					let lr = new LambdaResponse();

					lr.setGlobalHeaders({"Content-Type":"text/html;charset=UTF-8"});

					return Promise.resolve(tracker.body);

				}

			}

			return Promise.reject(eu.getError('not_found','Tracker not found.'));

		});

	}

}

