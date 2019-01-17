import * as _ from 'lodash';
import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';
import eu from './error-utilities';

export default class FileUtilities {

	static writeFile(filepath: string, contents: any) {

		fs.writeFileSync(filepath, contents);

	}

	static getFilenameFromPath(filepath: string) {

		return path.basename(filepath);

	}

	static async getDirectories(directory_path: string) {

		const readdir = util.promisify(fs.readdir);
		const all = await readdir(directory_path);

		return all.filter((file) => {

			return fs.lstatSync(directory_path + '/' + file).isDirectory();

		});

	}

	static async getDirectoryFiles(directory_path: string) {

		const readdir = util.promisify(fs.readdir);
		const all = await readdir(directory_path);

		return all.filter((file) => {

			return fs.lstatSync(directory_path + '/' + file).isFile();

		});

	}

	static getFileContents(filepath: string, encoding: string): Promise<string> {

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

	static getFileContentsSync(filepath: string, encoding: string = 'utf-8') {

		return fs.readFileSync(filepath, encoding);

	}

	static getDirectoryFilesSync(directory_path: string) {

		return fs.readdirSync(directory_path);

	}

	static getDirectoryList(directory_path: string) {

		return fs.readdirSync(directory_path).filter((f) => fs.statSync(directory_path + "/" + f).isDirectory());

	}

	static fileExists(filepath: string) {

		return fs.existsSync(filepath);

	}

}
