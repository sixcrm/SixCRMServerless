

const ThreePLController = global.SixCRM.routes.include('controllers', 'vendors/fulfillmentproviders/ThreePL/handler.js');

module.exports = class HashtagController extends ThreePLController {

	constructor(){

		super(arguments[0]);

		this.ThreePLID = 773;
		this.ThreePLFacilityID = 2;

		this.parameter_validation = {};
		this.parameter_definition = {};

		this.augmentParameters();

	}

}
