const _ = require('lodash');
const path = require('path');
const BBPromise = require('bluebird');
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const fileutilities = require('@6crm/sixcrmcore/lib/util/file-utilities').default;
const auroraContext = require('@6crm/sixcrmcore/lib/util/analytics/aurora-context').default;

const DeploymentsBase = global.SixCRM.routes.path('deployment', 'aurora/deployments');

module.exports = class AuroraSchemaDeployment {


	async deploy(options = {}) {

		return auroraContext.withConnection(async connection => {

			const deployments = this._getDeployments(connection);

			return BBPromise.each(deployments, deployment => this._doDeployment(deployment, connection, options));

		});

	}

	async _getDeployments(connection) {

		await this._executeQuery(connection, `CREATE SCHEMA IF NOT EXISTS releases`);
		await this._executeQuery(connection, `CREATE TABLE IF NOT EXISTS releases.m_release (
			deployment VARCHAR(255) NOT NULL,
			id INT NOT NULL,
			created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (deployment, id)
		)`);

		return fileutilities.getDirectories(DeploymentsBase);

	}

	async _doDeployment(deployment, connection, options) {

		du.info('Deploying ' + deployment);

		let currentRevision;

		try {

			const currentRevisionRaw = await this._executeQuery(connection,
				`SELECT id FROM releases.m_release WHERE deployment='${deployment}' ORDER BY id DESC LIMIT 1`);

			currentRevision = Number(currentRevisionRaw.rows.length ? currentRevisionRaw.rows[0].id : 0);
			du.debug('AuroraSchemaDeployment._doDeployment(): current revision', currentRevision);

		} catch (ex) {

			du.error('Could not resolve the current deployment version for ' + deployment, ex);
			throw ex;

		}

		const fromRevision = options.fromRevision || currentRevision || 0;

		const migrations = await this._getNewMigrations(deployment, fromRevision);

		return BBPromise.each(migrations, migration => this._deployMigration(migration, deployment, connection));

	}

	/*
		We want all revisions from the current version from the database up until the configured version
		in the configuration, and then run them sequentially
	*/
	async _getNewMigrations(deployment, fromRevision) {

		const results = await fileutilities.getDirectories(path.join(DeploymentsBase, deployment));

		const migrations = results.map((r) => {
			return {
				version: Number(r),
				path: path.join(DeploymentsBase, deployment, r)
			};
		});

		return _.sortBy(_.filter(migrations, (f) => f.version > fromRevision), 'version');

	}

	async _deployMigration(migration, deployment, connection) {

		du.info('Deploying migration ' + migration.path);

		const body = await fileutilities.getFileContents(path.join(migration.path, 'manifest.json'));
		const manifests = JSON.parse(body);

		await BBPromise.each(manifests, async (m) => {

			const query = await fileutilities.getFileContents(path.join(migration.path, m.script));
			await this._executeQuery(connection, query);

		});

		await this._executeQuery(connection,
			`INSERT INTO releases.m_release (deployment, id) VALUES($1, $2)`,
			[deployment, migration.version]);

	}

	async _executeQuery(connection, query, args) {

		du.debug('AuroraSchemaDeployment._executeQuery()', query);

		if (!query) {

			return;

		}

		if (args && args.length) {

			return connection.queryWithArgs(query, args);

		} else {

			return connection.query(query);

		}

	}

}
