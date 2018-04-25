let _context;

module.exports = class ServerlessRuntime {

	static getContext() {
		return _context;
	}
	static setContext(context) {
		_context = context;
	}
	static clearContext() {
		_context = null;
	}

}
