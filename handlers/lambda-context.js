module.exports = class LambdaContext {

	constructor(lambdaContext) {

		this.lambdaContext = lambdaContext;

	}

	async dispose() {
		// override, or dispose of anything this ends up owning
	}

}
