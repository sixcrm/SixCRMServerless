const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const util = require('util');

module.exports = class FileUtilities {

	static writeFile(path, contents) {

		fs.writeFileSync(path, contents)

	}

	static getFilenameFromPath(filepath) {

		return path.basename(filepath);

	}

	static async getDirectories(directory_path) {

		const readdir = util.promisify(fs.readdir);
		const all = await readdir(directory_path);

		return all.filter(file => {

			return fs.lstatSync(directory_path + '/' + file).isDirectory()

		});

	}

	static async getDirectoryFiles(directory_path) {

		const readdir = util.promisify(fs.readdir);
		const all = await readdir(directory_path);

		return all.filter(file => {

			return fs.lstatSync(directory_path + '/' + file).isFile()

		});

	}

	static getFileContents(filepath, encoding) {

		return new Promise((resolve) => {

			if (_.isUndefined(encoding)) {
				encoding = 'utf-8';
			}

			return fs.readFile(filepath, encoding, (error, data) => {

				if (error) {
					throw eu.getError('server', error);
				}

				return resolve(data);

			});

		});

	}

	static getFileContentsSync(filepath, encoding) {

		if (_.isUndefined(encoding)) {
			encoding = 'utf-8';
		}

		return fs.readFileSync(filepath, encoding);

	}

	static getDirectoryFilesSync(directory_path) {

		return fs.readdirSync(directory_path);

	}

	static getDirectoryList(directory_path) {

		return fs.readdirSync(directory_path).filter(f => fs.statSync(directory_path + "/" + f).isDirectory());

	}

	static fileExists(filepath) {

		return fs.existsSync(filepath);

	}

}
