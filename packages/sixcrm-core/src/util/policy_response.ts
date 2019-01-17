export default class PolicyResponse {

	static generatePolicy(principalId, effect, resource, user) {

		const authResponse: any = {};

		authResponse.principalId = principalId;

		if (effect && resource) {
			const policyDocument: any = {};

			policyDocument.Version = '2012-10-17'; // default version
			policyDocument.Statement = [];
			const statementOne: any = {};

			statementOne.Action = 'execute-api:Invoke'; // default action
			statementOne.Effect = effect;
			statementOne.Resource = resource;
			policyDocument.Statement[0] = statementOne;
			authResponse.policyDocument = policyDocument;
		}

		// Can optionally return a context object of your choosing.
		authResponse.context = {};
		authResponse.context[principalId] = user;
		// authResponse.context.numberKey = 123;
		// authResponse.context.booleanKey = true;
		return authResponse;

	}

}
