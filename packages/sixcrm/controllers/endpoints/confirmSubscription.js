const LambdaResponse = require('../providers/lambda-response');
const TrialConfirmationController = require('../entities/TrialConfirmation');
const SessionController = require('../entities/Session');
const StateMachineHelperController = require('../helpers/statemachine/StateMachine');

const trialConfirmationController = new TrialConfirmationController();
const sessionController = new SessionController();

module.exports = class ConfirmSubscriptionController {
	async execute(event, context, lambdaCallback) {
		this.lambdaCallback = lambdaCallback;
		const {code} = event;
		const confirmation = await trialConfirmationController.getByCode({code});

		if (!confirmation) {
			return this.respond('Subscription trial code not found.', 404);
		}

		await trialConfirmationController.markConfirmed({confirmation});

		const session = await sessionController.updateProperties({
			id: confirmation.session,
			properties: {
				started_at: confirmation.confirmed_at
			}
		});

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
		const response = new LambdaResponse();
		response.setGlobalResponseHeaders({
			'Content-Type': 'text/html',
		});
		const body = `<html><head></head><body>${message}</body></html>`;
		response.issueResponse(code, body, this.lambdaCallback);
	}
}
