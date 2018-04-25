let _context;

module.exports = class ServerlessRuntime {

	static getContext() {
		return _context;
	}
	static setContext(context) {
		_context = context;
	}
	static async clearContext() {
		if (_context) {
			await _context.dispose();
		}
		_context = null;
	}

}
