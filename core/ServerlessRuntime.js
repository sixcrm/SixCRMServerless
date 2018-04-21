module.exports = class ServerlessRuntime {

	static getContext() {
		return ServerlessRuntime._context;
	}
	static setContext(context) {
		ServerlessRuntime._context = context;
	}
	static clearContext() {
		ServerlessRuntime._context = null;
	}

}
