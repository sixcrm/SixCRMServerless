const HttpProvider = global.SixCRM.routes.include('controllers', 'providers/http-provider.js');
const httpprovider = new HttpProvider();
const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;
const signatureutilities = require('@6crm/sixcrmcore/util/signature').default;
const config = global.SixCRM.routes.include('test', 'live-transactions/config/'+process.env.stage+'.yml');

function authenticate(campaign_id) {
	return httpprovider.postJSON({
		url: `${config.endpoint}token/acquire/${config.account}`,
		headers: {
			Authorization: createAuthSignature()
		},
		body: {
			campaign: campaign_id
		}
	})
		.then(response => response.body.response);
}

function createAuthSignature(){

	let request_time = timestamp.createTimestampMilliseconds();
	let secret_key = config.secret_key;
	let access_key = config.access_key;
	let signature = signatureutilities.createSignature(secret_key, request_time);

	return access_key+':'+request_time+':'+signature;

}

module.exports = {
	authenticate
};
