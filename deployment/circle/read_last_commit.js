
require('@6crm/sixcrmcore');
const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
const s3provider = new S3Provider();

let bucket_name = 'sixcrm-' + global.SixCRM.configuration.stage + '-resources';

s3provider.getObject(bucket_name, 'last_commit.txt')
	.then((data) => {
		let last_commit = data.Body.toString();

		process.stdout.write(last_commit);
		return process.exit();
	})
	.catch(() => {
		process.exit();
	});
