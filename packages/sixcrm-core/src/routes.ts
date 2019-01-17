import 'require-yaml';

import * as path from 'path';
import * as _ from 'lodash';
import * as fs from 'fs';

export default class Routes {

	routes: any;
	root: string;

	constructor(root_path?: string) {

		this.setRootPath(root_path);

		this.loadRoutes('/config/routes.yml');

	}

	setRootPath(root_path?: string) {

		if (root_path === undefined) {
			root_path = process.cwd();
		}

		this.root = path.resolve(root_path);

	}

	include(feature: string, sub_path: string) {

		return require(this.path(feature, sub_path));

	}

	path(feature: string, sub_path: string) {

		if (_.has(this.routes, feature)) {

			if (_.isUndefined(sub_path)) {

				// console.log(this.root+this.routes[feature]);
				return this.root + this.routes[feature];

			}

			// console.log(this.root+this.routes[feature]+sub_path);
			return this.root + this.routes[feature] + sub_path;

		} else {

			throw new Error('Undefined route: ' + feature);

		}

	}

	files(feature: string, subpath: string) {

		const directory_path = this.path(feature, subpath);

		const files = fs.readdirSync(directory_path);

		return files;

	}

	loadRoutes(routes_path: string) {

		this.routes = require(this.root + routes_path);

	}

}
