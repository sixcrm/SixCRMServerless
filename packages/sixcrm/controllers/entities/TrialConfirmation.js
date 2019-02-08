const _ = require('lodash');

const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;
const random = require('@6crm/sixcrmcore/lib/util/random').default;

const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

module.exports = class TrialConfirmationController extends entityController {

	constructor(){
		super('trialconfirmation');

		this.search_fields = ['code'];
	}

	async create({session, customer}){
		const entity = {
			code: this.generateCode(),
			customer: customer,
			session: session
		};

		return super.create({entity: entity});
	}

	async getByCode({code}) {
		return this.getBySecondaryIndex({field: 'code', index_value: code, index_name: 'code-index'});
	}

	async markDelivered({entity}) {
		if(!_.has(entity, 'delivered_at')){
			entity.delivered = timestamp.getISO8601();
		}

		return super.update({entity: entity, ignore_updated_at: true});
	}

	async markConfirmed({entity}) {
		if(!_.has(entity, 'confirmed_at')) {
			entity.confirmed_at = timestamp.getISO8601();
		}

		return super.update({entity: entity, ignore_updated_at: true});
	}

	generateCode() {
		return random.createRandomString(6);
	}
}
