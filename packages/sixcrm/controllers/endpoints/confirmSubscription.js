const LambdaResponse = require('../providers/lambda-response');
const TrialConfirmationController = require('../entities/TrialConfirmation');
const SessionController = require('../entities/Session');
const StateMachineHelperController = require('../helpers/statemachine/StateMachine');

const trialConfirmationController = new TrialConfirmationController();
const sessionController = new SessionController();

module.exports = class ConfirmSubscriptionController {
	async execute(event, context, lambdaCallback) {
		this.lambdaCallback = lambdaCallback;
		const code = event.pathParameters.code;
		sessionController.disableACLs();

		const confirmation = await trialConfirmationController.getByCode({code});
		if (!confirmation) {
			return this.respond('Subscription trial code not found.', 404);
		}

		if (!confirmation.delivered_at) {
			return this.respond('This subscription has not been delivered yet.');
		}

		if (confirmation.confirmed_at) {
			return this.respond('Subscription has already been confirmed, no action needed.');
		}

		await trialConfirmationController.markConfirmed({confirmation});

		const session = await sessionController.get({id: confirmation.session});

		if (!session) {
			return this.respond('Subscription not found.', 404);
		}

		await this.startCreateRebillExecution(session);

		return this.respond('Subscription confirmed.');
	}

	async startCreateRebillExecution(session) {
		const parameters = {
			stateMachineName: 'Createrebill',
			input:{
				guid: session.id
			},
			account: session.account
		};

		return new StateMachineHelperController().startExecution({parameters});
	}

	async respond(message, code = 200) {
		sessionController.enableACLs();
		const response = new LambdaResponse();
		response.setGlobalHeaders({
			'Content-Type': 'text/html',
		});
		const body = `<html><head></head><body>${message}</body></html>`;
		response.issueResponse(code, body, this.lambdaCallback);
	}
}
