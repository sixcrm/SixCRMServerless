

let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
const uuidV4 = require('uuid/v4');

const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;

function getValidMessages(){
	return [
		{
			Body:JSON.stringify({id: uuidV4()}),
			spoofed: true
		},
		{
			Body:JSON.stringify({id: uuidV4()}),
			spoofed: true
		}
	];
}

xdescribe('workers/forwardMessage/pickRebillsToBillController', () => {

	describe('constructor', () => {

		it('successfully constructs', () => {

			const PickRebillsToBillController = global.SixCRM.routes.include('workers', 'forwardMessage/pickRebillsToBill.js');
			let pickRebillsToBillController = new PickRebillsToBillController();

			expect(objectutilities.getClassName(pickRebillsToBillController)).to.equal('PickRebillsToBillController');

		});

	});

	describe('invokeAdditionalLambdas', () => {

		it('returns the messages object', () => {

			let messages = getValidMessages();

			const PickRebillsToBillController = global.SixCRM.routes.include('workers', 'forwardMessage/pickRebillsToBill.js');
			let pickRebillsToBillController = new PickRebillsToBillController();

			pickRebillsToBillController.parameters.set('messages', messages);

			return pickRebillsToBillController.invokeAdditionalLambdas().then(() => {
				let result = pickRebillsToBillController.parameters.get('messages');

				expect(result).to.deep.equal(messages);
			});

		});

	});

	describe('invokeAdditionalLambdas', () => {

		it('returns the messages object', () => {

			let messages = getValidMessages();

			const PickRebillsToBillController = global.SixCRM.routes.include('workers', 'forwardMessage/pickRebillsToBill.js');
			let pickRebillsToBillController = new PickRebillsToBillController();

			pickRebillsToBillController.parameters.set('messages', messages);

			return pickRebillsToBillController.validateMessages(messages).then(() => {
				let result = pickRebillsToBillController.parameters.get('messages');

				expect(result).to.deep.equal(messages);
			});

		});

	});

});
