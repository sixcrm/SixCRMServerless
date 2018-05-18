const chai = require('chai');
const expect = chai.expect;
const mockery = require('mockery');

describe('lib/file-utilities', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	afterEach(() => {
		mockery.resetCache();
	});

	after(() => {
		mockery.deregisterAll();
	});

	describe('getFileContentsSync', () => {

		it('reads file', () => {

			mockery.registerMock('fs', {
				readFileSync: () => {
					return 'success';
				}
			});

			const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');

			expect(fileutilities.getFileContentsSync('a_path')).to.equal('success');
		});
	});

	describe('getDirectoryFilesSync', () => {

		it('reads directory', () => {

			mockery.registerMock('fs', {
				readdirSync: () => {
					return 'success';
				}
			});

			const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');

			expect(fileutilities.getDirectoryFilesSync('a_path')).to.equal('success');
		});
	});

	describe('getFilenameFromPath', () => {

		it('retrieve filename from path', () => {

			const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');

			expect(fileutilities.getFilenameFromPath('a_path')).to.equal('a_path');
		});
	});

	describe('getDirectoryFiles', () => {

		xit('retrieve directory files', () => {

			mockery.registerMock('fs', {
				readdir: (directory_path, callback) => {
					callback(null, ['success']);
				}
			});

			const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');

			return fileutilities.getDirectoryFiles('a_path').then((result) => {
				expect(result).to.equal(['success']);
			});
		});

		xit('throws error from fs readdir', () => {

			mockery.registerMock('fs', {
				readdir: (directory_path, callback) => {
					callback(new Error('fail'), null);
				}
			});

			const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');

			return fileutilities.getDirectoryFiles('a_path').catch((error) => {
				expect(error.message).to.equal('[500] fail');
			});
		});
	});

	describe('getFileContents', () => {

		it('retrieves file contents', () => {

			mockery.registerMock('fs', {
				readFile: (filepath, encoding, callback) => {
					callback(null, 'success');
				}
			});

			const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');

			return fileutilities.getFileContents('a_path').then((result) => {
				expect(result).to.equal('success');
			});
		});

		it('throws error from fs readFile', () => {

			mockery.registerMock('fs', {
				readFile: (filepath, encoding, callback) => {
					callback('fail', null);
				}
			});

			const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');

			return fileutilities.getFileContents('a_path').catch((error) => {
				expect(error.message).to.equal('[500] fail');
			});
		});
	});
});
