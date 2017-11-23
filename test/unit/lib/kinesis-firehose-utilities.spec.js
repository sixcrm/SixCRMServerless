const chai = require('chai');
const expect = chai.expect;
const mockery = require('mockery');

describe('lib/kinesis-firehose-utilities', () => {
    before(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        });
    });

    afterEach(() => {
        mockery.resetCache();
    });

    after(() => {
        mockery.deregisterAll();
    });

    describe('sanitizeRecord', () => {

        it('sanitizes undefined records', () => {

            const kinesisFirehoseUtilities = global.SixCRM.routes.include('lib', 'kinesis-firehose-utilities.js');

            expect(kinesisFirehoseUtilities.sanitizeRecord(['record1', undefined, 'record3']))
                .to.deep.equal(['record1', '', 'record3']);
        });
    });

    describe('createStream', () => {

        it('creates a stream', () => {

            const kinesisFirehoseUtilities = global.SixCRM.routes.include('lib', 'kinesis-firehose-utilities.js');

            kinesisFirehoseUtilities.firehose = {
                createDeliveryStream: (params, callback) => {
                    callback(null, 'success');
                }
            };

            return kinesisFirehoseUtilities.createStream('a_stream_data').then((result) => {
                expect(result).to.equal('success');
            });
        });

        it('returns error when stream is not created successfully', () => {

            const kinesisFirehoseUtilities = global.SixCRM.routes.include('lib', 'kinesis-firehose-utilities.js');

            kinesisFirehoseUtilities.firehose = {
                createDeliveryStream: (params, callback) => {
                    callback('fail', null);
                }
            };

            return kinesisFirehoseUtilities.createStream('a_stream_data').catch((error) => {
                expect(error).to.equal('fail');
            });
        });
    });

    describe('deleteStream', () => {

        it('deletes a stream', () => {

            const kinesisFirehoseUtilities = global.SixCRM.routes.include('lib', 'kinesis-firehose-utilities.js');

            kinesisFirehoseUtilities.firehose = {
                deleteDeliveryStream: (params, callback) => {
                    callback(null, 'success');
                }
            };

            return kinesisFirehoseUtilities.deleteStream('a_stream_data').then((result) => {
                expect(result).to.equal('success');
            });
        });

        it('returns error when stream is not deleted successfully', () => {

            const kinesisFirehoseUtilities = global.SixCRM.routes.include('lib', 'kinesis-firehose-utilities.js');

            kinesisFirehoseUtilities.firehose = {
                deleteDeliveryStream: (params, callback) => {
                    callback('fail', null);
                }
            };

            return kinesisFirehoseUtilities.deleteStream('a_stream_data').catch((error) => {
                expect(error).to.equal('fail');
            });
        });
    });

    describe('describeStream', () => {

        it('successfully describes a stream', () => {

            const kinesisFirehoseUtilities = global.SixCRM.routes.include('lib', 'kinesis-firehose-utilities.js');

            kinesisFirehoseUtilities.firehose = {
                describeDeliveryStream: (params, callback) => {
                    callback(null, 'success');
                }
            };

            return kinesisFirehoseUtilities.describeStream('a_stream_data').then((result) => {
                expect(result).to.equal('success');
            });
        });
    });

    describe('validateStreamRecord', () => {

        it('fails due to missing object', () => {

            const kinesisFirehoseUtilities = global.SixCRM.routes.include('lib', 'kinesis-firehose-utilities.js');

            try{
              kinesisFirehoseUtilities.validateStreamRecord('activity');
            }catch(error){
              expect(error.message).to.equal('[500] Validation object must be defined.')
            }

        });

        it('returns validation error', () => {

            const kinesisFirehoseUtilities = global.SixCRM.routes.include('lib', 'kinesis-firehose-utilities.js');

            //valid stream model, invalid object
            try {
              kinesisFirehoseUtilities.validateStreamRecord('activity', {an_object: 'an_object_data'})
            } catch (error) {
              expect(error.message).to.have.string('[500] One or more validation errors occurred:');
            }
        });
    });

    describe('getKinesisFirehoseName', () => {

        it('retrieves stream configuration', () => {

            const kinesisFirehoseUtilities = global.SixCRM.routes.include('lib', 'kinesis-firehose-utilities.js');

            kinesisFirehoseUtilities.configured_streams = {a_stream: 'a_stream_name'};

            expect(kinesisFirehoseUtilities.getKinesisFirehoseName('a_stream'))
                .to.equal('a_stream_name');
        });

        it('throws error when stream name is not set', () => {

            const kinesisFirehoseUtilities = global.SixCRM.routes.include('lib', 'kinesis-firehose-utilities.js');

            kinesisFirehoseUtilities.configured_streams = {};

            try {
                kinesisFirehoseUtilities.getKinesisFirehoseName('any_stream')
            } catch (error) {
                expect(error.message).to.equal('[500] Unset stream name: any_stream');
            }
        });
    });

    describe('streamExists', () => {

        it('returns true if stream exists', () => {

            const kinesisFirehoseUtilities = global.SixCRM.routes.include('lib', 'kinesis-firehose-utilities.js');

            kinesisFirehoseUtilities.firehose = {
                describeDeliveryStream: (params, callback) => {
                    callback(null, 'success');
                }
            };

            return kinesisFirehoseUtilities.streamExists('a_stream_data').then((result) => {
                expect(result).to.be.true;
            });
        });

        it('returns false if stream doesn\'t exists', () => {

            const kinesisFirehoseUtilities = global.SixCRM.routes.include('lib', 'kinesis-firehose-utilities.js');

            kinesisFirehoseUtilities.firehose = {
                describeDeliveryStream: (params, callback) => {
                    callback('fail', null);
                }
            };

            return kinesisFirehoseUtilities.streamExists('a_stream_data').then((result) => {
                expect(result).to.be.false;
            });
        });
    });

    describe('waitForStream', () => {

        it('throws unexpected response error from AWS', () => {

            let data = 'invalid data';

            const kinesisFirehoseUtilities = global.SixCRM.routes.include('lib', 'kinesis-firehose-utilities.js');

            kinesisFirehoseUtilities.firehose = {
                describeDeliveryStream: (params, callback) => {
                    callback(null, data);
                }
            };

            return kinesisFirehoseUtilities.waitForStream('a_stream_name').catch((error) => {
                expect(error.message).to.equal('[500] Unexpected response structure from AWS');
            });
        });

        it('returns true when delivery stream status is equal to specified state', () => {

            let data = {DeliveryStreamDescription: {DeliveryStreamStatus: 'a_state'}};

            const kinesisFirehoseUtilities = global.SixCRM.routes.include('lib', 'kinesis-firehose-utilities.js');

            kinesisFirehoseUtilities.firehose = {
                describeDeliveryStream: (params, callback) => {
                    callback(null, data);
                }
            };

            return kinesisFirehoseUtilities.waitForStream('a_stream_name', 'a_state').then((result) => {
                expect(result).to.be.true;
            });
        });

        it('throws error if max attempt count is exceeded', () => {

            let data = {DeliveryStreamDescription: {DeliveryStreamStatus: 'some_other_state'}};

            const kinesisFirehoseUtilities = global.SixCRM.routes.include('lib', 'kinesis-firehose-utilities.js');

            kinesisFirehoseUtilities.firehose = {
                describeDeliveryStream: (params, callback) => {
                    callback(null, data);
                }
            };

            //max attempt count is 200, it will increase until it reaches that number and throw error afterwards
            return kinesisFirehoseUtilities.waitForStream('a_stream_name', 'a_state', 199).catch((error) => {
                expect(error.message).to.equal('[500] waitForStream attempt_count_max exceeded.');
            });
        });
    });

    describe('putRecord', () => {

        afterEach(() => {
            process.env.stage = 'local';
        });

        it('sends record to kinesis', () => {

            process.env.stage = 'development';

            mockery.registerMock(global.SixCRM.routes.path('lib', 'model-validator-utilities.js'), {
                validateModel: () => {
                    return true;
                }
            });

            const kinesisFirehoseUtilities = global.SixCRM.routes.include('lib', 'kinesis-firehose-utilities.js');

            kinesisFirehoseUtilities.configured_streams = {a_stream: 'a_stream_name'};

            kinesisFirehoseUtilities.firehose = {
                putRecord: (params, callback) => {
                    callback(null, 'success');
                }
            };

            return kinesisFirehoseUtilities.putRecord('a_stream', ['a_record1', 'a_record2']).then((result) => {
                expect(result).to.equal('success');
            });
        });

        it('disallows contacting kinesis when running locally', () => {

            process.env.stage = 'local';

            mockery.registerMock(global.SixCRM.routes.path('lib', 'model-validator-utilities.js'), {
                validateModel: () => {
                    return true;
                }
            });

            const kinesisFirehoseUtilities = global.SixCRM.routes.include('lib', 'kinesis-firehose-utilities.js');

            kinesisFirehoseUtilities.configured_streams = {a_stream: 'a_stream_name'};

            kinesisFirehoseUtilities.firehose = {
                putRecord: (params, callback) => {
                    callback(null, 'success');
                }
            };

            return kinesisFirehoseUtilities.putRecord('a_stream', ['a_record1', 'a_record2']).then((result) => {
                expect(result).to.equal('Kinesis streams disabled.');
            });
        });
    });
});
