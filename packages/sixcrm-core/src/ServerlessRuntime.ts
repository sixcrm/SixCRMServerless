import LambdaContext from './lambda-context';

export default class ServerlessRuntime {

	static _context: LambdaContext | null;

	static getContext() {
		return this._context;
	}
	static setContext(context: LambdaContext) {
		this._context = context;
	}
	static async clearContext() {
		if (this._context) {
			await this._context.dispose();
		}
		this._context = null;
	}

}
