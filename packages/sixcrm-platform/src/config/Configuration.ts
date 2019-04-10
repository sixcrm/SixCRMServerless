import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import * as yaml from 'js-yaml';
import * as _ from 'lodash';

const readFileAsync = util.promisify(fs.readFile);

interface IStage {
	name: string;
	aws_account_id?: string;
	branch_name?: string;
	local?: boolean;
}

export default class Configuration {

	private static _siteConfig;
	private static _stages: IStage[];

	static async get<T>(objectPath: string): Promise<T> {

		await this._loadConfig();

		return _.get(this._siteConfig, objectPath);

	}

	private static async _loadConfig(): Promise<void> {

		const configPath = path.join(process.cwd(), '../sixcrm/config');

		if (this._stages === undefined) {

			const filename = path.join(configPath, 'stages.yml');
			const stageContents = await readFileAsync(filename, 'utf-8');
			const stageData = yaml.safeLoad(stageContents);

			this._stages = [];
			_.forOwn(stageData, (value, key) => {

				this._stages.push({
					name: key,
					...value
				});

			});

		}

		if (this._siteConfig === undefined) {

			const stage = this._resolveStage();
			const filename = path.join(configPath, stage + '.yml');
			const configContents = await readFileAsync(filename, 'utf-8');
			this._siteConfig = yaml.safeLoad(configContents);

		}

	}

	private static _resolveStage(): string {

		if (process.env.stage !== undefined) {

			return process.env.stage;

		}

		if (process.env.CIRCLE_BRANCH !== undefined) {

			const stage = _.find(this._stages, s => s.branch_name === process.env.CIRCLE_BRANCH);
			if (stage !== undefined) {

				return stage.name;

			}

		}

		if (process.env.AWS_ACCOUNT !== undefined) {

			const stage = _.find(this._stages, s => s.aws_account_id === process.env.AWS_ACCOUNT);
			if (stage !== undefined) {

				return stage.name;

			}

		}

		if (process.env.CIRCLECI !== undefined) {

			return 'circle';

		}

		return 'offline';

	}

}
