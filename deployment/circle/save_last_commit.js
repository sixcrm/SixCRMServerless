
require('../../SixCRM.js');
const exec = require('child_process').execSync;
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
const s3provider = new S3Provider();

let last_commit = exec(`git rev-parse --verify HEAD`).toString().replace(/\r?\n|\r/g,'');
let bucket_name = 'sixcrm-' + global.SixCRM.configuration.stage + '-resources';

s3provider.assureBucket({Bucket: bucket_name})
	.then(() => {

		let parameters = {
			Bucket: bucket_name,
			Key: 'last_commit.txt',
			Body: last_commit
		};

		return s3provider.putObject(parameters);

	})
	.then(() => {
		du.info('Successfully uploaded last commit (' + last_commit + ') to S3');
		return process.exit();
	})
	.catch((error) => {
		du.error(error);
		process.exit();
	});
