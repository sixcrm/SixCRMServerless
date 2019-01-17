import { Context } from "aws-lambda";

export default class LambdaContext {

	lambdaContext: Context;

	constructor(lambdaContext: Context) {

		this.lambdaContext = lambdaContext;

	}

	async dispose() {
		// override, or dispose of anything this ends up owning
	}

}
