

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const randomutilities = require('@6crm/sixcrmcore/util/random').default;
const signatureutilities = require('@6crm/sixcrmcore/util/signature').default;
const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;
const HttpProvider = global.SixCRM.routes.include('controllers', 'providers/http-provider.js');
const httpprovider = new HttpProvider();

const Parameters  = global.SixCRM.routes.include('providers', 'Parameters.js');

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

module.exports = class TransactionGeneratorHelperController {

	constructor(){

		this.parameter_defintion = {
			issue: {
				required:{
					endpoint: 'endpoint',
					account: 'account',
					accesskey: 'access_key',
					secretkey: 'secret_key',
					campaign: 'campaign',
					productschedule: 'product_schedule'
				},
				optional:{}
			}
		};

		this.parameter_validation = {
			'signature': global.SixCRM.routes.path('model', 'definitions/signature.json'),
			'jwt': global.SixCRM.routes.path('model', 'definitions/jwt.json'),
			'session': global.SixCRM.routes.path('model', 'definitions/uuidv4.json'),
			'endpoint': global.SixCRM.routes.path('model','definitions/url.json'),
			'accesskey': global.SixCRM.routes.path('model','definitions/accesskey.json'),
			'secretkey': global.SixCRM.routes.path('model','definitions/sha1.json'),
			'campaign': global.SixCRM.routes.path('model','definitions/uuidv4.json'),
			'productschedule': global.SixCRM.routes.path('model','definitions/uuidv4.json')
		};

		this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_defintion});

	}

	issue(){

		du.debug('Issue');

		return Promise.resolve()
			.then(() => this.parameters.setParameters({argumentation: arguments[0], action: 'issue'}))
			.then(() => this.createRequestProperties())
			.then(() => this.acquireToken())
			.then(() => this.createLead())
			.then(() => this.createOrder())
			.then(() => this.confirmOrder())
			.then(() => {
				du.info('Transaction Complete');
				return true;
			}).catch(result => {
				du.error(result.body);
				du.info('Transaction Failed');
				return false;
			});

	}

	createRequestProperties(){

		du.debug('Create Request Properties');

		let customer = MockEntities.getValidTransactionCustomer();
		let fullname = customer.firstname+' '+customer.lastname;
		let creditcard = MockEntities.getValidTransactionCreditCard(fullname, customer.address, randomutilities.selectRandomFromArray(['VISA', 'Amex', 'Mastercard']));

		let signature = this.createTransactionSignature();

		this.parameters.set('customer', customer);
		this.parameters.set('creditcard', creditcard);
		this.parameters.set('signature', signature);

		return true;

	}

	createTransactionSignature(){

		du.debug('Create Transaction Signature');

		let access_key = this.parameters.get('accesskey');
		let secret_key = this.parameters.get('secretkey');
		let now = timestamp.now();

		let signature = signatureutilities.createSignature(secret_key, now);

		return access_key+':'+now+':'+signature;

	}

	acquireToken(){

		du.debug('Acquire Token');

		let post_body = {
			campaign: this.parameters.get('campaign')
		};

		let parameters = {
			headers: {Authorization: this.parameters.get('signature')},
			body: post_body,
			endpoint: this.parameters.get('endpoint')+'token/acquire/'+this.parameters.get('account')
		};

		du.info(parameters);

		return httpprovider.postJSON(parameters).then(result => {

			du.debug('Acquire Token Response: ', result.body);

			if(result.body.success !== true){
				return Promise.reject(result);
			}

			this.parameters.set('jwt', result.body.response);

			return true;

		});

	}

	createLead(){

		du.debug('Create Lead');

		let post_body = {
			campaign: this.parameters.get('campaign'),
			customer: this.parameters.get('customer')
		};

		let parameters = {
			headers: {Authorization: this.parameters.get('jwt')},
			body: post_body,
			endpoint: this.parameters.get('endpoint')+'lead/create/'+this.parameters.get('account')
		};

		du.info(parameters);

		return httpprovider.postJSON(parameters).then(result => {

			du.debug('Create Lead Response: ', result.body);

			if(result.body.success !== true){
				return Promise.reject(result);
			}

			this.parameters.set('session', result.body.response.id);

			return true;

		});

	}

	createOrder(){

		du.debug('Create Order');

		let post_body = {
			session: this.parameters.get('session'),
			product_schedules: [this.parameters.get('productschedule')],
			creditcard: this.parameters.get('creditcard'),
			transaction_subtype: 'main'
		};

		let parameters = {
			headers: {Authorization: this.parameters.get('jwt')},
			body: post_body,
			endpoint: this.parameters.get('endpoint')+'order/create/'+this.parameters.get('account')
		};

		du.info(parameters);

		return httpprovider.postJSON(parameters).then(result => {

			du.debug('Create Order Response: ', result.body);

			if(result.body.success !== true){
				return Promise.reject(result);
			}

			return true;

		});

	}

	confirmOrder(){

		du.debug('Confirm Order');

		let parameters = {
			headers: {Authorization: this.parameters.get('jwt')},
			endpoint: this.parameters.get('endpoint')+'order/confirm/'+this.parameters.get('account'),
			querystring:{
				session:this.parameters.get('session')
			}
		};

		du.info(parameters);

		return httpprovider.getJSON(parameters).then(result => {

			du.debug('Confirm Order Response: ', result.body);

			if(result.body.success !== true){
				return Promise.reject(result);
			}

			return true;

		});

	}

}
