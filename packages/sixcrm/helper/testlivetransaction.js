require('@6crm/sixcrmcore');

const config = global.SixCRM.routes.include('test', 'integration/config/development.yml');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const signatureutilities = require('@6crm/sixcrmcore/util/signature').default;
const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;
const HttpProvider = require('@6crm/sixcrmcore/providers/http-provider').default;

const httpprovider = new HttpProvider();

if (!process.argv[2]) {
	du.warning('Creditcard JSON must be provided as commandline argument')
	process.exit();
}

const creditcard = JSON.parse(process.argv[2]);
const campaign = "1b3c5526-c9ff-4122-8c29-6fa4c310831a";
const customer = { email: "live@test.test" };
const products = [{
	quantity: 1,
	product: "cc2984b1-5fa3-4e7d-8bda-a5b67fcbd15f"
}];

acquireToken(campaign)
	.then(token => checkout(token, {
		campaign,
		customer,
		products,
		creditcard
	}))
	.then(response => {
		du.info(response);
		return du.info('Complete');
	})
	.catch(error => du.warning(error));

function createSignature(){
	const request_time = timestamp.createTimestampMilliseconds();
	const secret_key = config.access_keys.super_user.secret_key;
	const access_key = config.access_keys.super_user.access_key;
	const signature = signatureutilities.createSignature(secret_key, request_time);
	return `${access_key}:${request_time}:${signature}`;
}

function acquireToken(campaign_id){
	return httpprovider.postJSON({
		url: `${config.endpoint}token/acquire/${config.account}`,
		body: {
			campaign: campaign_id
		},
		headers: {
			Authorization: createSignature()
		}
	})
		.then(result => {
			if (result.response.statusCode !== 200) {
				const error = new Error('Token Acquisition Failed');
				error.details = result.body;
				throw error;
			}

			return result.body.response;
		});
}

function checkout(token, body) {
	return httpprovider.postJSON({
		url: `${config.endpoint}checkout/${config.account}`,
		body,
		headers:{
			Authorization: token
		}
	})
		.then(result => {
			if (result.response.statusCode !== 200) {
				const error = new Error('Checkout Failed');
				error.details = result.body;
				throw error;
			}

			return result.body
		});
}
