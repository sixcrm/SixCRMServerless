const chai = require('chai');
const expect = chai.expect;
const AWSTestUtils = require('./aws-test-utils');

function getValidBucketObjects() {
	return {
		Contents: [{Key: 'a_key'}]
	}
}

describe('controllers/providers/s3-provider', () => {

	let test_mode;

	before(() => {
		test_mode = process.env.TEST_MODE;
		process.env.TEST_MODE = 'false';
	});

	beforeEach(() => {
		// cleanup
		delete require.cache[require.resolve(global.SixCRM.routes.path('controllers', 'providers/s3-provider.js'))];
	});

	after(() => {
		process.env.TEST_MODE = test_mode;
	});

	describe('assureDelete', () => {

		it('non-existing bucket', () => {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			s3provider.bucket_list = ['a_bucket', 'a_bucket2'];

			return s3provider.assureDelete('non-existing_bucket').then((deleted) => {
				return expect(deleted).to.be.false;
			});

		});

		it('existing bucket', () => {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			s3provider.bucket_list = ['a_bucket', 'a_bucket2'];

			s3provider.s3 = {
				listObjectsV2: (params, callback) => {
					callback(null, getValidBucketObjects());
				},
				deleteObjects: (params, callback) => {
					callback(null, 'success');
				},
				deleteBucket: (params, callback) => {
					callback(null, 'success');
				}
			};

			return s3provider.assureDelete('a_bucket').then((deleted) => {
				return expect(deleted).to.be.true;
			});

		});

		it('throws error when bucket with specified name wasn\'t deleted', () => {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			s3provider.bucket_list = ['a_bucket', 'a_bucket2'];

			s3provider.s3 = {
				listObjectsV2: (params, callback) => {
					callback(null, getValidBucketObjects());
				},
				deleteObjects: (params, callback) => {
					callback(null, 'success');
				},
				deleteBucket: (params, callback) => {
					callback('S3 Error', null);
				}
			};

			return s3provider.assureDelete('a_bucket').catch((error) => {
				return expect(error.message).to.equal('[500] Internal Server Error');
			});

		});

	});

	describe('objectExists', () => {

		it('handles wrong parameters', () => {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			try {
				s3provider.objectExists({});
				expect.failure();
			} catch (error) {
				expect(error.message).to.equal('[500] This operation requires a "Bucket" parameter.');
			}

			try {
				s3provider.objectExists({
					Bucket: 'a_bucket'
				});
				expect.failure();
			} catch (error) {
				expect(error.message).to.equal('[500] This operation requires a "Key" parameter.');
			}

		});

		it('returns true when does exist', () => {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			s3provider.s3.headObject = (parameters, func) => { func(null, {}) };

			s3provider.objectExists({
				Bucket: 'a_bucket',
				Key: 'a_key'
			}).then((exists) => {
				return expect(exists).to.be.true;
			});
		});

		it('returns false when doesn\'t exist', () => {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			s3provider.s3.headObject = (parameters, func) => { func(new Error('S3 Error'), null) };

			s3provider.objectExists({
				Bucket: 'a_bucket',
				Key: 'a_key'
			}).then((exists) => {
				return expect(exists).to.be.false;
			});
		});

	});

	describe('deleteBucketObjects', () => {

		it('successfully deletes bucket objects', () => {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			s3provider.s3 = {
				listObjectsV2: (params, callback) => {
					callback(null, getValidBucketObjects());
				},
				deleteObjects: (params, callback) => {
					callback(null, 'success');
				}
			};

			return s3provider.deleteBucketObjects('a_bucket').then((result) => {
				return expect(result).to.be.true;
			});
		});

	});

	describe('listObjects', () => {

		it('returns object list', () => {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			s3provider.s3 = {
				listObjectsV2: (params, callback) => {
					callback(null, {
						Contents: ['a_content', 'a_content2']
					});
				}
			};

			return s3provider.listObjects('a_bucket', 'a_token', {EncodingType: 'a_type'}).then((result) => {
				return expect(result).to.deep.equal([ 'a_content', 'a_content2' ]);
			});
		});

		it('throws error from s3 list Objects V2', () => {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			s3provider.s3 = {
				listObjectsV2: (params, callback) => {
					callback('fail', null);
				}
			};

			return s3provider.listObjects('a_bucket').catch((error) => {
				expect(error.message).to.equal('[500] fail');
			});
		});

	});

	describe('batchDeleteObjects', () => {

		it('throws error when bucket objects are not an array', () => {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			return s3provider.batchDeleteObjects('a_bucket', 'not_an_array').catch((error) => {
				expect(error.message).to.equal('[500] Delete Objects assumes that the bucket objects argument is an array.');
			});
		});

		it('throws error when bucket objects is malformed', () => {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			return s3provider.batchDeleteObjects('a_bucket', ['missing_key']).catch((error) => {
				expect(error.message).to.equal('[500] Malformed bucket object.');
			});
		});

		it('returns true when objects batch has been deleted', () => {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			s3provider.s3 = {
				deleteObjects: (params, callback) => {
					callback(null, 'success');
				}
			};

			return s3provider.batchDeleteObjects('a_bucket', [{Key: 'a_key'}]).then((result) => {
				return expect(result).to.be.true;
			});
		});

		it('returns false when bucket objects array is empty', () => {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			return s3provider.batchDeleteObjects('a_bucket', []).then((result) => {
				return expect(result).to.be.false;
			});
		});

	});

	describe('deleteBucket', () => {

		it('successfully deletes bucket', () => {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			s3provider.s3 = {
				listObjectsV2: (params, callback) => {
					callback(null, getValidBucketObjects());
				},
				deleteObjects: (params, callback) => {
					callback(null, 'success');
				},
				deleteBucket: (params, callback) => {
					callback(null, 'success');
				}
			};

			return s3provider.deleteBucket('a_bucket').then((result) => {
				return expect(result).to.equal('success');
			});
		});

	});

	describe('deleteObjects', () => {

		it('returns error when bucket objects are not an array', () => {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			return s3provider.deleteObjects('a_bucket', 'not_an_array').catch((error) => {
				expect(error.message).to.equal('[500] S3Provider.deleteObjects assumes bucket_objects to be an array');
			});
		});

		it('returns error when bucket objects array is too large', () => {

			let bucket_objects = [];

			bucket_objects.length = 1001; //exceeds bucket_objects maximum delete batch size

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			return s3provider.deleteObjects('a_bucket', bucket_objects).catch((error) => {
				expect(error.message).to.equal('[500] S3Provider.deleteObjects bucket_objects array is too large');
			});
		});

		it('successfully removes objects', () => {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			s3provider.s3 = {
				deleteObjects: (params, callback) => {
					callback(null, 'success');
				}
			};

			return s3provider.deleteObjects('remove_bucket', ['any_bucket', 'remove_bucket']).then((result) => {
				return expect(result).to.equal('success');
			});
		});

		it('throws error when objects have not been removed', () => {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			s3provider.s3 = {
				deleteObjects: (params, callback) => {
					callback(new Error('fail'), null);
				}
			};

			return s3provider.deleteObjects('remove_bucket', ['any_bucket', 'any_bucket2']).catch((error) => {
				expect(error.message).to.equal('[500] fail');
			});
		});

	});

	describe('assureBucket', () => {

		it('returns true if bucket is found', () => {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			s3provider.bucket_list = ['a_bucket', 'a_bucket2'];

			return s3provider.assureBucket({Bucket: 'a_bucket'}).then((result) => {
				return expect(result).to.be.true;
			});
		});

		it('returns true when bucket is not in preexisting list and is successfully created', () => {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			s3provider.bucket_list = ['a_bucket', 'a_bucket2'];

			s3provider.s3 = {
				createBucket: (params, callback) => {
					callback(null, {Bucket: 'new_bucket'});
				}
			};

			return s3provider.assureBucket({Bucket: 'new_bucket'}).then((result) => {
				return expect(result).to.be.true;
			});
		});

		it('returns error when bucket is not in preexisting list but it\'s creation was unsuccessful', () => {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			s3provider.bucket_list = ['a_bucket', 'a_bucket2'];

			s3provider.s3 = {
				createBucket: (params, callback) => {
					callback('fail', null);
				}
			};
			return s3provider.assureBucket({Bucket: 'new_bucket'}).catch((error) => {
				expect(error).to.equal('fail');
			});
		});

	});

	describe('headBucket', () => {

		it('returns forbidden error', () => {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			s3provider.s3 = {
				headBucket: (params, callback) => {
					callback({code: 'Forbidden'}, null);
				}
			};

			return s3provider.headBucket('a_bucket').then((result) => {
				return expect(result).to.equal(null);
			});
		});

		it('returns not found error', () => {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			s3provider.s3 = {
				headBucket: (params, callback) => {
					callback({code: 'NotFound'}, null);
				}
			};

			return s3provider.headBucket('a_bucket').then((result) => {
				return expect(result).to.equal(null);
			});
		});

		it('returns S3 error', () => {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			s3provider.s3 = {
				headBucket: (params, callback) => {
					callback('S3 error', null);
				}
			};

			return s3provider.headBucket('a_bucket').catch((error) => {
				expect(error).to.equal('S3 error');
			});
		});

		it('successfully resolves head bucket', () => {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			s3provider.s3 = {
				headBucket: (params, callback) => {
					callback(null, 'success');
				}
			};

			return s3provider.headBucket('a_bucket').then((result) => {
				return expect(result).to.equal('success');
			});
		});
	});

	describe('putObject', () => {

		it('returns error when "Bucket" parameter is missing', () => {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			return s3provider.putObject('a_bucket').catch((error) => {
				expect(error).to.equal('This operation requires a "Bucket" parameter.');
			});
		});

		it('returns error when "Key" parameter is missing', () => {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			return s3provider.putObject({
				Bucket:'a_bucket'
			}).catch((error) => {
				expect(error).to.equal('This operation requires a "Key" parameter.');
			});
		});

		it('returns error when "Body" parameter is missing', () => {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			return s3provider.putObject({
				Bucket:'a_bucket',
				Key: 'a_key'
			}).catch((error) => {
				expect(error).to.equal('This operation requires a "Body" parameter.');
			});
		});

		it('returns S3 error when object is not updated', () => {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			s3provider.s3 = {
				putObject: (params, callback) => {
					callback('S3 error', null);
				}
			};

			return s3provider.putObject({
				Bucket:'a_bucket',
				Key: 'a_key',
				Body: 'a_body'
			}).catch((error) => {
				expect(error).to.equal('S3 error');
			});
		});

		it('updates object', () => {

			let parameters = {
				Bucket:'a_bucket',
				Key: 'a_key',
				Body: 'a_body'
			};

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			s3provider.s3 = {
				putObject: (params, callback) => {
					callback(null, parameters);
				}
			};

			return s3provider.putObject(parameters).then((result) => {
				return expect(result).to.equal(parameters);
			});
		});

	});

	describe('createBucket', () => {

		it('successfully creates bucket', () => {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			s3provider.s3 = {
				createBucket: (params, callback) => {
					callback(null, {Bucket: 'a_bucket'});
				}
			};

			return s3provider.createBucket('a_bucket').then((result) => {
				return expect(result).to.deep.equal({Bucket: 'a_bucket'});
			});
		});

		it('returns error when bucket hasn\'t been created', () => {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			s3provider.s3 = {
				createBucket: (params, callback) => {
					callback('fail', null);
				}
			};

			return s3provider.createBucket('a_bucket').catch((error) => {
				expect(error).to.equal('fail');
			});
		});

	});

	describe('getBucketList', () => {

		it('returns bucket list when bucket list exists', () => {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			s3provider.bucket_list = ['a_bucket', 'a_bucket2'];

			return s3provider.getBucketList().then((result) => {
				return expect(result).to.equal(s3provider.bucket_list);
			});
		});

		it('retrieves and processes bucket list from s3', () => {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			delete s3provider.bucket_list;

			s3provider.s3 = {
				listBuckets: (callback) => {
					callback(null, {Buckets:[{Name:'a_bucket'}, {Name:'a_bucket2'}]});
				}
			};

			return s3provider.getBucketList().then((result) => {
				return expect(result).to.deep.equal([ 'a_bucket', 'a_bucket2' ]);
			});
		});

		it('retrieves and processes bucket list from s3 without using cache', () => {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			delete s3provider.bucket_list;

			s3provider.s3 = {
				listBuckets: (callback) => {
					callback(null, {Buckets:[{Name:'a_bucket'}, {Name:'a_bucket2'}]});
				}
			};

			return s3provider.getBucketList(false).then((result) => {
				return expect(result).to.deep.equal([ 'a_bucket', 'a_bucket2' ]);
			});
		});

	});

	describe('listBuckets', () => {

		it('returns bucket list', () => {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			s3provider.s3 = {
				listBuckets: (callback) => {
					callback(null, ['a_bucket', 'a_bucket2']);
				}
			};

			return s3provider.listBuckets().then((result) => {
				return expect(result).to.deep.equal(['a_bucket', 'a_bucket2']);
			});
		});

		it('throws error when bucket list is not retrieved', () => {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			s3provider.s3 = {
				listBuckets: (callback) => {
					callback(new Error('fail'), null);
				}
			};

			return s3provider.listBuckets().catch((error) => {
				expect(error.message).to.equal('[500] fail');
			});
		});

	});

	describe('bucketExists', () => {

		it('returns true if bucket exists', () => {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			s3provider.bucket_list = ['a_bucket', 'a_bucket2'];

			return s3provider.bucketExists('a_bucket').then((result) => {
				return expect(result).to.be.true;
			});
		});

		it('returns false if bucket does not exist', () => {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			s3provider.bucket_list = ['a_bucket', 'a_bucket2'];

			return s3provider.bucketExists('a_bucket3').then((result) => {
				return expect(result).to.be.false;
			});
		});

	});

	describe('getObject', () => {

		it('retrieves object', () => {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			s3provider.s3 = {
				getObject: AWSTestUtils.AWSPromise('sample object data')
			};

			return s3provider.getObject('a_bucket', 'a_key').then((result) => {
				return expect(result).to.equal('sample object data');
			});
		});

		it('returns error when object data is not retrieved', () => {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			s3provider.s3 = {
				getObject: AWSTestUtils.AWSError('fail')
			};

			return s3provider.getObject('a_bucket', 'a_key').catch((error) => {
				expect(error.message).to.equal('fail');
			});
		});

	});

	describe('putBucketLifecycleConfiguration', () => {

		it('sets lifecycle settings on a bucket', () => {

			let a_bucket = 'a_bucket';

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			s3provider.s3 = {
				putBucketLifecycleConfiguration: (params, callback) => {
					expect(params).to.have.property('Bucket');
					expect(params.Bucket).to.equal(a_bucket);
					expect(params).to.have.property('LifecycleConfiguration');
					callback(null, 'sample lifecycle data');
				}
			};

			return s3provider.putBucketLifecycleConfiguration(a_bucket).then((result) => {
				return expect(result).to.equal('sample lifecycle data');
			});
		});

		it('returns error when object data is not retrieved', () => {

			let a_bucket = 'a_bucket';

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			s3provider.s3 = {
				putBucketLifecycleConfiguration: (params, callback) => {
					expect(params).to.have.property('Bucket');
					expect(params.Bucket).to.equal(a_bucket);
					expect(params).to.have.property('LifecycleConfiguration');
					callback(new Error('fail'), null);
				}
			};

			return s3provider.putBucketLifecycleConfiguration(a_bucket).catch((error) => {
				expect(error).to.equal(false);
			});
		});

	});

	describe('putBucketReplication', () => {

		it('successfully puts bucket replication', () => {

			let parameters = {
				source: 'a_source',
				destination: 'a_dest',
				role: 'a_role'
			};

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			s3provider.s3 = {
				putBucketReplication: (params, callback) => {
					expect(params).to.have.property('Bucket');
					expect(params).to.have.property('ReplicationConfiguration');
					expect(params.Bucket).to.equal(parameters.source);
					expect(params.ReplicationConfiguration.Role).to.equal(parameters.role);
					expect(params.ReplicationConfiguration.Rules[0].Destination.Bucket).to.contain(parameters.destination);
					callback(null, 'sample bucket replication data');
				}
			};

			return s3provider.putBucketReplication(parameters).then((result) => {
				return expect(result).to.equal('sample bucket replication data');
			});
		});

		it('returns false when bucket replication update was unsuccessful', () => {

			let parameters = {
				source: 'a_source',
				destination: 'a_dest',
				role: 'a_role'
			};

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			s3provider.s3 = {
				putBucketReplication: (params, callback) => {
					expect(params).to.have.property('Bucket');
					expect(params).to.have.property('ReplicationConfiguration');
					expect(params.Bucket).to.equal(parameters.source);
					expect(params.ReplicationConfiguration.Role).to.equal(parameters.role);
					expect(params.ReplicationConfiguration.Rules[0].Destination.Bucket).to.contain(parameters.destination);
					callback(new Error('fail'), null);
				}
			};

			return s3provider.putBucketReplication(parameters).catch((error) => {
				expect(error).to.equal(false);
			});
		});
	});

	describe('putBucketVersioning', () => {

		it('successfully puts bucket versioning', () => {

			let a_bucket = 'a_bucket';

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			s3provider.s3 = {
				putBucketVersioning: (params, callback) => {
					expect(params).to.have.property('Bucket');
					expect(params).to.have.property('VersioningConfiguration');
					expect(params.Bucket).to.equal(a_bucket);
					callback(null, 'sample bucket versioning data');
				}
			};

			return s3provider.putBucketVersioning(a_bucket).then((result) => {
				return expect(result).to.equal('sample bucket versioning data');
			});
		});

		it('returns false when bucket versioning was unsuccessful', () => {

			let a_bucket = 'a_bucket';

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			const s3provider = new S3Provider();

			s3provider.s3 = {
				putBucketVersioning: (params, callback) => {
					expect(params).to.have.property('Bucket');
					expect(params).to.have.property('VersioningConfiguration');
					expect(params.Bucket).to.equal(a_bucket);
					callback(new Error('fail'), null);
				}
			};

			return s3provider.putBucketVersioning(a_bucket).catch((error) => {
				expect(error).to.equal(false);
			});
		});
	});

});
