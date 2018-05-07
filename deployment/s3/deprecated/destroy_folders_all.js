/* eslint-disable no-console */

require('../../SixCRM.js');


const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const S3Deployment = global.SixCRM.routes.include('deployment', 'utilities/s3-deployment.js');

let environment = process.argv[2] || 'development';

du.info('Creating S3 Bucket');

let s3Deployment = new S3Deployment(environment);

/* Epic */
let bucket_list = Object.keys(s3Deployment.getConfig().buckets);

bucket_list.map(bucket => {
	let bucket_parameters = {
		Bucket: s3Deployment.getConfig().buckets[bucket].bucket,
		Key: '',
		Body: s3Deployment.getConfig().buckets[bucket].bucket
	}

	Object.keys(s3Deployment.getConfig().buckets[bucket]).forEach((key) => {
		if (key !== 'bucket')
			Object.keys(s3Deployment.getConfig().buckets[bucket][key]).forEach((folder) => {
				bucket_parameters.Key = s3Deployment.getConfig().buckets[bucket][key][folder];
				return s3Deployment.folderExists(bucket_parameters).then(exists => {
					if (exists) {
						du.warning('Folder exists, deleting files and folder');
						return s3Deployment.listObjects(bucket_parameters).then(files => {
							return files.filter(folder => folder.Key.match(bucket_parameters.Key)).reverse().forEach((file) => {
								let folder_parameters = {
									Bucket: bucket_parameters.Bucket,
									Key: file.Key
								};

								return s3Deployment.deleteFolderAndWait(folder_parameters).then(response => {
									return du.info(response);
								});
							});
						});

					} else {
						du.warning('Folder does not exists, Aborting.');
						console.log('Folder does not exists, Aborting.');
						return false;
					}
				}).then(() => {
					return du.info('Complete')
				});
			})
	});
});
