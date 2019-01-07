

const ThreePLResponse = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/ThreePL/Response.js');

module.exports = class HashtagResponse extends ThreePLResponse {

	constructor(){

		super(arguments[0]);

	}

}
