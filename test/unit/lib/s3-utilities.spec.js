const chai = require('chai');
const expect = chai.expect;

function getValidBucketObjects() {
    return {
        Contents: [{Key: 'a_key'}]
    }
}

describe('lib/s3-utilities', () => {

    let test_mode;

    before(() => {
        test_mode = process.env.TEST_MODE;
        process.env.TEST_MODE = 'false';
    });

    beforeEach(() => {
        // cleanup
        delete require.cache[require.resolve(global.SixCRM.routes.path('lib', 's3-utilities.js'))];
    });

    after(() => {
        process.env.TEST_MODE = test_mode;
    });

    describe('assureDelete', () => {

        it('non-existing bucket', () => {

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            s3utilities.bucket_list = ['a_bucket', 'a_bucket2'];

            return s3utilities.assureDelete('non-existing_bucket').then((deleted) => {
                return expect(deleted).to.be.false;
            });

        });

        it('existing bucket', () => {

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            s3utilities.bucket_list = ['a_bucket', 'a_bucket2'];

            s3utilities.s3 = {
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

            return s3utilities.assureDelete('a_bucket').then((deleted) => {
                return expect(deleted).to.be.true;
            });

        });

        it('throws error when bucket with specified name wasn\'t deleted', () => {

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            s3utilities.bucket_list = ['a_bucket', 'a_bucket2'];

            s3utilities.s3 = {
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

            return s3utilities.assureDelete('a_bucket').catch((error) => {
                return expect(error.message).to.equal('[500] Internal Server Error');
            });

        });

    });

    describe('objectExists', () => {

        it('handles wrong parameters', () => {

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            try {
                s3utilities.objectExists({});
                expect.failure();
            } catch (error) {
                expect(error.message).to.equal('[500] This operation requires a "Bucket" parameter.');
            }

            try {
                s3utilities.objectExists({
                    Bucket: 'a_bucket'
                });
                expect.failure();
            } catch (error) {
                expect(error.message).to.equal('[500] This operation requires a "Key" parameter.');
            }

        });

        it('returns true when does exist', () => {

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            s3utilities.s3.headObject = (parameters, func) => { func(null, {}) };

            s3utilities.objectExists({
                Bucket: 'a_bucket',
                Key: 'a_key'
            }).then((exists) => {
                return expect(exists).to.be.true;
            });
        });

        it('returns false when doesn\'t exist', () => {

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            s3utilities.s3.headObject = (parameters, func) => { func(new Error('S3 Error'), null) };

            s3utilities.objectExists({
                Bucket: 'a_bucket',
                Key: 'a_key'
            }).then((exists) => {
                return expect(exists).to.be.false;
            });
        });

    });

    describe('deleteBucketObjects', () => {

        it('successfully deletes bucket objects', () => {

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            s3utilities.s3 = {
                listObjectsV2: (params, callback) => {
                    callback(null, getValidBucketObjects());
                },
                deleteObjects: (params, callback) => {
                    callback(null, 'success');
                }
            };

            return s3utilities.deleteBucketObjects('a_bucket').then((result) => {
                return expect(result).to.be.true;
            });
        });

    });

    describe('listObjects', () => {

        it('returns object list', () => {

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            s3utilities.s3 = {
                listObjectsV2: (params, callback) => {
                    callback(null, {
                        Contents: ['a_content', 'a_content2']
                    });
                }
            };

            return s3utilities.listObjects('a_bucket', 'a_token', {EncodingType: 'a_type'}).then((result) => {
                return expect(result).to.deep.equal([ 'a_content', 'a_content2' ]);
            });
        });

        it('throws error from s3 list Objects V2', () => {

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            s3utilities.s3 = {
                listObjectsV2: (params, callback) => {
                    callback('fail', null);
                }
            };

            return s3utilities.listObjects('a_bucket').catch((error) => {
                expect(error.message).to.equal('[500] fail');
            });
        });

    });

    describe('batchDeleteObjects', () => {

        it('throws error when bucket objects are not an array', () => {

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            return s3utilities.batchDeleteObjects('a_bucket', 'not_an_array').catch((error) => {
                expect(error.message).to.equal('[500] Delete Objects assumes that the bucket objects argument is an array.');
            });
        });

        it('throws error when bucket objects is malformed', () => {

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            return s3utilities.batchDeleteObjects('a_bucket', ['missing_key']).catch((error) => {
                expect(error.message).to.equal('[500] Malformed bucket object.');
            });
        });

        it('returns true when objects batch has been deleted', () => {

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            s3utilities.s3 = {
                deleteObjects: (params, callback) => {
                    callback(null, 'success');
                }
            };

            return s3utilities.batchDeleteObjects('a_bucket', [{Key: 'a_key'}]).then((result) => {
                return expect(result).to.be.true;
            });
        });

        it('returns false when bucket objects array is empty', () => {

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            return s3utilities.batchDeleteObjects('a_bucket', []).then((result) => {
                return expect(result).to.be.false;
            });
        });

    });

    describe('deleteBucket', () => {

        it('successfully deletes bucket', () => {

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            s3utilities.s3 = {
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

            return s3utilities.deleteBucket('a_bucket').then((result) => {
                return expect(result).to.equal('success');
            });
        });

    });

    describe('deleteObjects', () => {

        it('returns error when bucket objects are not an array', () => {

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            return s3utilities.deleteObjects('a_bucket', 'not_an_array').catch((error) => {
                expect(error.message).to.equal('[500] S3Utilities.deleteObjects assumes bucket_objects to be an array');
            });
        });

        it('returns error when bucket objects array is too large', () => {

            let bucket_objects = [];

            bucket_objects.length = 1001; //exceeds bucket_objects maximum delete batch size

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            return s3utilities.deleteObjects('a_bucket', bucket_objects).catch((error) => {
                expect(error.message).to.equal('[500] S3Utilities.deleteObjects bucket_objects array is too large');
            });
        });

        it('successfully removes objects', () => {

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            s3utilities.s3 = {
                deleteObjects: (params, callback) => {
                    callback(null, 'success');
                }
            };

            return s3utilities.deleteObjects('remove_bucket', ['any_bucket', 'remove_bucket']).then((result) => {
                return expect(result).to.equal('success');
            });
        });

        it('throws error when objects have not been removed', () => {

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            s3utilities.s3 = {
                deleteObjects: (params, callback) => {
                    callback(new Error('fail'), null);
                }
            };

            return s3utilities.deleteObjects('remove_bucket', ['any_bucket', 'any_bucket2']).catch((error) => {
                expect(error.message).to.equal('[500] fail');
            });
        });

    });

    describe('assureBucket', () => {

        it('returns true if bucket is found', () => {

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            s3utilities.bucket_list = ['a_bucket', 'a_bucket2'];

            return s3utilities.assureBucket('a_bucket').then((result) => {
                return expect(result).to.be.true;
            });
        });

        it('returns true when bucket is not in preexisting list and is successfully created', () => {

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            s3utilities.bucket_list = ['a_bucket', 'a_bucket2'];

            s3utilities.s3 = {
                createBucket: (params, callback) => {
                    callback(null, {Bucket: 'new_bucket'});
                }
            };

            return s3utilities.assureBucket('new_bucket').then((result) => {
                return expect(result).to.be.true;
            });
        });

        it('returns error when bucket is not in preexisting list but it\'s creation was unsuccessful', () => {

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            s3utilities.bucket_list = ['a_bucket', 'a_bucket2'];

            s3utilities.s3 = {
                createBucket: (params, callback) => {
                    callback('fail', null);
                }
            };
            return s3utilities.assureBucket('new_bucket').catch((error) => {
                expect(error).to.equal('fail');
            });
        });

    });

    describe('headBucket', () => {

        it('returns forbidden error', () => {

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            s3utilities.s3 = {
                headBucket: (params, callback) => {
                    callback({code: 'Forbidden'}, null);
                }
            };

            return s3utilities.headBucket('a_bucket').then((result) => {
                return expect(result).to.equal(null);
            });
        });

        it('returns not found error', () => {

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            s3utilities.s3 = {
                headBucket: (params, callback) => {
                    callback({code: 'NotFound'}, null);
                }
            };

            return s3utilities.headBucket('a_bucket').then((result) => {
                return expect(result).to.equal(null);
            });
        });

        it('returns S3 error', () => {

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            s3utilities.s3 = {
                headBucket: (params, callback) => {
                    callback('S3 error', null);
                }
            };

            return s3utilities.headBucket('a_bucket').catch((error) => {
                expect(error).to.equal('S3 error');
            });
        });

        it('successfully resolves head bucket', () => {

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            s3utilities.s3 = {
                headBucket: (params, callback) => {
                    callback(null, 'success');
                }
            };

            return s3utilities.headBucket('a_bucket').then((result) => {
                return expect(result).to.equal('success');
            });
        });
    });

    describe('putObject', () => {

        it('returns error when "Bucket" parameter is missing', () => {

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            return s3utilities.putObject('a_bucket').catch((error) => {
                expect(error).to.equal('This operation requires a "Bucket" parameter.');
            });
        });

        it('returns error when "Key" parameter is missing', () => {

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            return s3utilities.putObject({
                Bucket:'a_bucket'
            }).catch((error) => {
                expect(error).to.equal('This operation requires a "Key" parameter.');
            });
        });

        it('returns error when "Body" parameter is missing', () => {

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            return s3utilities.putObject({
                Bucket:'a_bucket',
                Key: 'a_key'
            }).catch((error) => {
                expect(error).to.equal('This operation requires a "Body" parameter.');
            });
        });

        it('returns S3 error when object is not updated', () => {

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            s3utilities.s3 = {
                putObject: (params, callback) => {
                    callback('S3 error', null);
                }
            };

            return s3utilities.putObject({
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

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            s3utilities.s3 = {
                putObject: (params, callback) => {
                    callback(null, parameters);
                }
            };

            return s3utilities.putObject(parameters).then((result) => {
                return expect(result).to.equal(parameters);
            });
        });

    });

    describe('createBucket', () => {

        it('successfully creates bucket', () => {

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            s3utilities.s3 = {
                createBucket: (params, callback) => {
                    callback(null, {Bucket: 'a_bucket'});
                }
            };

            return s3utilities.createBucket('a_bucket').then((result) => {
                return expect(result).to.deep.equal({Bucket: 'a_bucket'});
            });
        });

        it('returns error when bucket hasn\'t been created', () => {

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            s3utilities.s3 = {
                createBucket: (params, callback) => {
                    callback('fail', null);
                }
            };

            return s3utilities.createBucket('a_bucket').catch((error) => {
                expect(error).to.equal('fail');
            });
        });

    });

    describe('getBucketList', () => {

        it('returns bucket list when bucket list exists', () => {

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            s3utilities.bucket_list = ['a_bucket', 'a_bucket2'];

            return s3utilities.getBucketList().then((result) => {
                return expect(result).to.equal(s3utilities.bucket_list);
            });
        });

        it('retrieves and processes bucket list from s3', () => {

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            delete s3utilities.bucket_list;

            s3utilities.s3 = {
                listBuckets: (callback) => {
                    callback(null, {Buckets:[{Name:'a_bucket'}, {Name:'a_bucket2'}]});
                }
            };

            return s3utilities.getBucketList().then((result) => {
                return expect(result).to.deep.equal([ 'a_bucket', 'a_bucket2' ]);
            });
        });

        it('retrieves and processes bucket list from s3 without using cache', () => {

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            delete s3utilities.bucket_list;

            s3utilities.s3 = {
                listBuckets: (callback) => {
                    callback(null, {Buckets:[{Name:'a_bucket'}, {Name:'a_bucket2'}]});
                }
            };

            return s3utilities.getBucketList(false).then((result) => {
                return expect(result).to.deep.equal([ 'a_bucket', 'a_bucket2' ]);
            });
        });

    });

    describe('listBuckets', () => {

        it('returns bucket list', () => {

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            s3utilities.s3 = {
                listBuckets: (callback) => {
                    callback(null, ['a_bucket', 'a_bucket2']);
                }
            };

            return s3utilities.listBuckets().then((result) => {
                return expect(result).to.deep.equal(['a_bucket', 'a_bucket2']);
            });
        });

        it('throws error when bucket list is not retrieved', () => {

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            s3utilities.s3 = {
                listBuckets: (callback) => {
                    callback(new Error('fail'), null);
                }
            };

            return s3utilities.listBuckets().catch((error) => {
                expect(error.message).to.equal('[500] fail');
            });
        });

    });

    describe('bucketExists', () => {

        it('returns true if bucket exists', () => {

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            s3utilities.bucket_list = ['a_bucket', 'a_bucket2'];

            return s3utilities.bucketExists('a_bucket').then((result) => {
                return expect(result).to.be.true;
            });
        });

        it('returns false if bucket does not exist', () => {

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            s3utilities.bucket_list = ['a_bucket', 'a_bucket2'];

            return s3utilities.bucketExists('a_bucket3').then((result) => {
                return expect(result).to.be.false;
            });
        });

    });

    describe('getObject', () => {

        it('retrieves object', () => {

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            s3utilities.s3 = {
                getObject: (params, callback) => {
                    callback(null, 'sample object data');
                }
            };

            return s3utilities.getObject('a_bucket', 'a_key').then((result) => {
                return expect(result).to.equal('sample object data');
            });
        });

        it('returns error when object data is not retrieved', () => {

            const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

            s3utilities.s3 = {
                getObject: (params, callback) => {
                    callback(new Error('fail'), null);
                }
            };

            return s3utilities.getObject('a_bucket', 'a_key').catch((error) => {
                expect(error.message).to.equal('[500] fail');
            });
        });

		});

    describe('putBucketLifecycleConfiguration', () => {

			xit('sets lifecycle settings on a bucket', () => {

					const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

					s3utilities.s3 = {
						putBucketLifecycleConfiguration: (params, callback) => {
									callback(null, 'sample lifecycle data');
							}
					};

					return s3utilities.putBucketLifecycleConfiguration('a bucket').then((result) => {
							return expect(result).to.equal('sample lifecycle data');
					});
			});

			xit('returns error when object data is not retrieved', () => {

					const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

					s3utilities.s3 = {
						putBucketLifecycleConfiguration: (params, callback) => {
									callback(new Error('fail'), null);
							}
					};

					return s3utilities.putBucketLifecycleConfiguration('a_bucket').catch((error) => {
							expect(error.message).to.equal(false);
					});
			});

	});



});
