import * as chai from 'chai';
const expect = chai.expect;
import * as mockery from 'mockery';

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

			const fileutilities = require('../../../src/util/file-utilities').default;

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

			const fileutilities = require('../../../src/util/file-utilities').default;

			expect(fileutilities.getDirectoryFilesSync('a_path')).to.equal('success');
		});
	});

	describe('getFilenameFromPath', () => {

		it('retrieve filename from path', () => {

			const fileutilities = require('../../../src/util/file-utilities').default;

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

			const fileutilities = require('../../../src/util/file-utilities').default;

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

			const fileutilities = require('../../../src/util/file-utilities').default;

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

			const fileutilities = require('../../../src/util/file-utilities').default;

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

			const fileutilities = require('../../../src/util/file-utilities').default;

			return fileutilities.getFileContents('a_path').catch((error) => {
				expect(error.message).to.equal('[500] fail');
			});
		});
	});
});
