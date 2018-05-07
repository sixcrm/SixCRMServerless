
require('../../SixCRM.js');


const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const S3Deployment = global.SixCRM.routes.include('deployment', 'utilities/s3-deployment.js');

let environment = process.argv[2] || 'development';

du.info('Creating S3 Bucket');

let s3Deployment = new S3Deployment(environment);

/* Epic */
let bucket_list = Object.keys(s3Deployment.getConfig().buckets);

bucket_list.map(bucket => {
	let bucket_parameters = {Bucket: s3Deployment.getConfig().buckets[bucket].bucket,Key:'',Body: s3Deployment.getConfig().buckets[bucket].bucket}

	Object.keys(s3Deployment.getConfig().buckets[bucket]).forEach((key) => {
		if (key=='bucket')
			return s3Deployment.bucketExists(bucket_parameters).then(exists => {
				if (exists) {
					du.warning('Bucket exists, destroying');
					return s3Deployment.deleteBucketAndWait(bucket_parameters).then(response => {
						return du.info(response);
					});
				} else {
					return du.info('Bucket does not exist, Aborting.');
				}
			}).then(() => { return du.info('Complete')} )
	});
});
