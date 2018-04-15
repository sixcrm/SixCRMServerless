let chai = require('chai');
let expect = chai.expect;

describe('helpers/translation/Translation.js', () => {
	describe('getTranslationFile', () => {
		it('retrieves the English translation file', () => {
			const TranslationHelperController = global.SixCRM.routes.include('helpers','translation/Translation.js');
			let translationHelperController = new TranslationHelperController();
			expect(translationHelperController.getTranslationFile('English')).to.have.property('notifications');
		});

		it('retrieves the English translation file from local', () => {
			const TranslationHelperController = global.SixCRM.routes.include('helpers','translation/Translation.js');
			let translationHelperController = new TranslationHelperController();
			expect(translationHelperController.getTranslationFile('en')).to.have.property('notifications');
		});

		it('returns null when the file is not found', () => {
			const TranslationHelperController = global.SixCRM.routes.include('helpers','translation/Translation.js');
			let translationHelperController = new TranslationHelperController();
			expect(translationHelperController.getTranslationFile('ascasc')).to.equal(null);
		});
	});

	describe('getTranslationFile', () => {
		it('retrieves the object at subpath', () => {
			const TranslationHelperController = global.SixCRM.routes.include('helpers','translation/Translation.js');
			let translationHelperController = new TranslationHelperController();
			let translation_object = translationHelperController.getTranslationObject('English','notifications.transaction_approved');
			expect(typeof translation_object).to.not.equal(null);
		});

		it('retrieves the object at path with locale', () => {
			const TranslationHelperController = global.SixCRM.routes.include('helpers','translation/Translation.js');
			let translationHelperController = new TranslationHelperController();
			let translation_object = translationHelperController.getTranslationObject('en','notifications.transaction_approved');
			expect(typeof translation_object).to.not.equal(null);
		});

		it('retrieves the object at path', () => {
			const TranslationHelperController = global.SixCRM.routes.include('helpers','translation/Translation.js');
			let translationHelperController = new TranslationHelperController();
			let translation_object = translationHelperController.getTranslationObject('English','notifications');
			expect(typeof translation_object).to.equal('object');
		});

		it('throws an error (bad file)', () => {
			const TranslationHelperController = global.SixCRM.routes.include('helpers','translation/Translation.js');
			let translationHelperController = new TranslationHelperController();
			try{
				translationHelperController.getTranslationObject('asdasd','notifications', true);
			}catch(error){
				expect(error.message).to.equal('[500] No translation at path "notifications" in asdasd translation file.');
			}
		});

		it('throws an error (bad path)', () => {
			const TranslationHelperController = global.SixCRM.routes.include('helpers','translation/Translation.js');
			let translationHelperController = new TranslationHelperController();
			try{
				translationHelperController.getTranslationObject('English','satan.blog', true);
			}catch(error){
				expect(error.message).to.equal('[500] No translation at path "satan.blog" in English translation file.');
			}
		});

		it('returns null (bad file)', () => {
			const TranslationHelperController = global.SixCRM.routes.include('helpers','translation/Translation.js');
			let translationHelperController = new TranslationHelperController();
			let return_object = translationHelperController.getTranslationObject('asdasd','notifications');
			expect(return_object).to.equal(null);
		});

		it('returns null (bad path)', () => {
			const TranslationHelperController = global.SixCRM.routes.include('helpers','translation/Translation.js');
			let translationHelperController = new TranslationHelperController();
			let return_object = translationHelperController.getTranslationObject('English','satan.blog');
			expect(return_object).to.equal(null);
		});

	});
});
