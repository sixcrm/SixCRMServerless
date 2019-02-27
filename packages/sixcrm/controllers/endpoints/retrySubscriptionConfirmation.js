require('module-alias/register');
const LambdaResponse = require('../providers/lambda-response');
const TrialConfirmationController = require('@root/controllers/entities/TrialConfirmation.js');
const TrialConfirmationHelperController = require('@lib/controllers/helpers/entities/trialconfirmation/TrialConfirmation.js').default;

const trialConfirmationController = new TrialConfirmationController();
const trialConfirmationHelperController = new TrialConfirmationHelperController();

module.exports = class RetrySubscriptionConfirmationController {
	async execute(event, context, lambdaCallback) {
		this.lambdaCallback = lambdaCallback;

		trialConfirmationController.disableACLs();

		const trials = await trialConfirmationController.getAllUnconfirmed();
		if (!trials || !trials.length) {
			return this.respond('No trials to confirm.');
		}

		for (const trial in trials) {
			await trialConfirmationHelperController.retryNotification(trial.session);
		}

		return this.respond(`Resent SMS to ${trials.length} trials.`)
	}

	respond(message, code = 200, callback = this.lambdaCallback) {
		trialConfirmationController.enableACLs();
		new LambdaResponse().issueResponse(code, message, callback);
	}
};
