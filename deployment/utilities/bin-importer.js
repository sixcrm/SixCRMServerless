const fs = require('fs');
const stream = require('stream');
const csv = require('csv');
const checksum = require('checksum');
const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
const DynamoDBProvider = global.SixCRM.routes.include('controllers', 'providers/dynamodb-provider.js');
const DMSProvider = global.SixCRM.routes.include('controllers', 'providers/dms-provider.js');

const stage = global.SixCRM.configuration.stage;
const s3_bucket = `sixcrm-${stage}-dms`;
const s3_key = 'analytics/bins/LOAD001.csv';
const csvFilename = global.SixCRM.routes.path('deployment', 'dms/data/bins.csv');

module.exports = class binImporter {
	constructor() {
		this.s3 = new S3Provider();
		this.dynamodb = new DynamoDBProvider();
		this.dms = new DMSProvider();
	}

	import() {
		return this.prepareS3()
			.then(() => this.startDMSTask())
			.then(() => this.waitForDmsTaskCompletion())
			.then(() => this.teardown())
			.then(() => 'Complete', error => {
				if (error.code === 'NoChanges') {
					return 'No Changes';
				}
				throw error;
			});
	}

	prepareS3() {
		// Temporary workaround -- have this compare to a stored checksum or something
		const error = new Error('No Changes');
		error.code = "NoChanges";
		return Promise.reject(error);

		// return this.getChecksum()
		// 	.then(checksum => {
		// 		return this.s3.headObject({
		// 			Bucket: s3_bucket,
		// 			Key: s3_key
		// 		})
		// 			.catch(error => {
		// 				if (error.code === 'NotFound') {
		// 					return;
		// 				}

		// 				throw error;
		// 			})
		// 			.then(response => {
		// 				if (response && response.Metadata.checksum === checksum) {
		// 					const error = new Error('No Changes');
		// 					error.code = "NoChanges";
		// 					throw error;
		// 				}

		// 				return this.upload(checksum);
		// 			});
		// 	});
	}

	startDMSTask() {
		return this.dms.describeReplicationTasks({
			Filters: [{
				Name: 'replication-task-id',
				Values: ['import-bins']
			}]
		})
			.then(response => {
				const {ReplicationTaskArn} = response.ReplicationTasks[0];

				return this.dms.startReplicationTask({
					ReplicationTaskArn,
					StartReplicationTaskType: 'reload-target'
				});
			});
	}

	waitForDmsTaskCompletion() {
		const checkStatus = (resolve, reject) => {
			return this.getTaskStatus()
				.then(status => {
					if (['stopped'].includes(status)) {
						resolve();
					}

					if (!['starting', 'running'].includes(status)) {
						reject(new Error('import-bins DMS Task Failed'));
					}
					return;
				});
		}

		let interval;

		return new Promise((resolve, reject) => {
			checkStatus(resolve, reject);
			interval = setInterval(() => {
				checkStatus(resolve, reject);
			}, 10000);
		})
			.then(() => {
				return clearInterval(interval)
			},
			error => {
				clearInterval(interval);
				throw error;
			});
	}

	teardown() {
		const binsConfiguration = global.SixCRM.routes.include('deployment', 'dynamodb/configuration/tables/bins.json');
		return this.dynamodb.updateTable({
			TableName: 'bins',
			ProvisionedThroughput: binsConfiguration.Table.ProvisionedThroughput
		});
	}

	getChecksum() {
		return new Promise((resolve, reject) => {
			checksum.file(csvFilename, (err, sum) => {
				if (err) {
					reject(err);
				}
				resolve(sum);
			})
		});
	}

	upload(checksum) {
		const passthrough = new stream.PassThrough();

		fs.createReadStream(csvFilename)
			.pipe(csv.parse({quote: false}))
			.pipe(csv.stringify())
			.pipe(passthrough);

		return this.s3.upload({
			Bucket: s3_bucket,
			Key: s3_key,
			Body: passthrough,
			Metadata: {checksum}
		});
	}

	getTaskStatus() {
		return this.dms.describeReplicationTasks({
			Filters: [{
				Name: 'replication-task-id',
				Values: ['import-bins']
			}]
		})
			.then(response => response.ReplicationTasks[0].Status);
	}
}
