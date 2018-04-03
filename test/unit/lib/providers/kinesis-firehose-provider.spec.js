const chai = require('chai');
const expect = chai.expect;
const mockery = require('mockery');

describe('lib/providers/kinesis-firehose-provider', () => {
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

            const KinesisFirehoseProvider = global.SixCRM.routes.include('lib', 'providers/kinesis-firehose-provider.js');
            const kinesisFirehoseProvider = new KinesisFirehoseProvider();

            expect(kinesisFirehoseProvider.sanitizeRecord(['record1', undefined, 'record3']))
                .to.deep.equal(['record1', '', 'record3']);
        });
    });

    describe('createStream', () => {

        it('creates a stream', () => {

            const KinesisFirehoseProvider = global.SixCRM.routes.include('lib', 'providers/kinesis-firehose-provider.js');
            const kinesisFirehoseProvider = new KinesisFirehoseProvider();

            kinesisFirehoseProvider.firehose = {
                createDeliveryStream: (params, callback) => {
                    callback(null, 'success');
                }
            };

            return kinesisFirehoseProvider.createStream('a_stream_data').then((result) => {
                expect(result).to.equal('success');
            });
        });

        it('returns error when stream is not created successfully', () => {

            const KinesisFirehoseProvider = global.SixCRM.routes.include('lib', 'providers/kinesis-firehose-provider.js');
            const kinesisFirehoseProvider = new KinesisFirehoseProvider();

            kinesisFirehoseProvider.firehose = {
                createDeliveryStream: (params, callback) => {
                    callback('fail', null);
                }
            };

            return kinesisFirehoseProvider.createStream('a_stream_data').catch((error) => {
                expect(error).to.equal('fail');
            });
        });
    });

    describe('deleteStream', () => {

        it('deletes a stream', () => {

            const KinesisFirehoseProvider = global.SixCRM.routes.include('lib', 'providers/kinesis-firehose-provider.js');
            const kinesisFirehoseProvider = new KinesisFirehoseProvider();

            kinesisFirehoseProvider.firehose = {
                deleteDeliveryStream: (params, callback) => {
                    callback(null, 'success');
                }
            };

            return kinesisFirehoseProvider.deleteStream('a_stream_data').then((result) => {
                expect(result).to.equal('success');
            });
        });

        it('returns error when stream is not deleted successfully', () => {

            const KinesisFirehoseProvider = global.SixCRM.routes.include('lib', 'providers/kinesis-firehose-provider.js');
            const kinesisFirehoseProvider = new KinesisFirehoseProvider();

            kinesisFirehoseProvider.firehose = {
                deleteDeliveryStream: (params, callback) => {
                    callback('fail', null);
                }
            };

            return kinesisFirehoseProvider.deleteStream('a_stream_data').catch((error) => {
                expect(error).to.equal('fail');
            });
        });
    });

    describe('describeStream', () => {

        it('successfully describes a stream', () => {

            const KinesisFirehoseProvider = global.SixCRM.routes.include('lib', 'providers/kinesis-firehose-provider.js');
            const kinesisFirehoseProvider = new KinesisFirehoseProvider();

            kinesisFirehoseProvider.firehose = {
                describeDeliveryStream: (params, callback) => {
                    callback(null, 'success');
                }
            };

            return kinesisFirehoseProvider.describeStream('a_stream_data').then((result) => {
                expect(result).to.equal('success');
            });
        });
    });

    describe('validateStreamRecord', () => {

        it('fails due to missing object', () => {

            const KinesisFirehoseProvider = global.SixCRM.routes.include('lib', 'providers/kinesis-firehose-provider.js');
            const kinesisFirehoseProvider = new KinesisFirehoseProvider();

            try{
              kinesisFirehoseProvider.validateStreamRecord('activity');
            }catch(error){
              expect(error.message).to.equal('[500] Validation object must be defined.')
            }

        });

        it('returns validation error', () => {

            const KinesisFirehoseProvider = global.SixCRM.routes.include('lib', 'providers/kinesis-firehose-provider.js');
            const kinesisFirehoseProvider = new KinesisFirehoseProvider();

            //valid stream model, invalid object
            try {
              kinesisFirehoseProvider.validateStreamRecord('activity', {an_object: 'an_object_data'})
            } catch (error) {
              expect(error.message).to.have.string('[500] One or more validation errors occurred:');
            }
        });
    });

    describe('getKinesisFirehoseName', () => {

        it('retrieves stream configuration', () => {

            const KinesisFirehoseProvider = global.SixCRM.routes.include('lib', 'providers/kinesis-firehose-provider.js');
            const kinesisFirehoseProvider = new KinesisFirehoseProvider();

            kinesisFirehoseProvider.configured_streams = {a_stream: 'a_stream_name'};

            expect(kinesisFirehoseProvider.getKinesisFirehoseName('a_stream'))
                .to.equal('a_stream_name');
        });

        it('throws error when stream name is not set', () => {

            const KinesisFirehoseProvider = global.SixCRM.routes.include('lib', 'providers/kinesis-firehose-provider.js');
            const kinesisFirehoseProvider = new KinesisFirehoseProvider();

            kinesisFirehoseProvider.configured_streams = {};

            try {
                kinesisFirehoseProvider.getKinesisFirehoseName('any_stream')
            } catch (error) {
                expect(error.message).to.equal('[500] Unset stream name: any_stream');
            }
        });
    });

    describe('streamExists', () => {

        it('returns true if stream exists', () => {

            const KinesisFirehoseProvider = global.SixCRM.routes.include('lib', 'providers/kinesis-firehose-provider.js');
            const kinesisFirehoseProvider = new KinesisFirehoseProvider();

            kinesisFirehoseProvider.firehose = {
                describeDeliveryStream: (params, callback) => {
                    callback(null, 'success');
                }
            };

            return kinesisFirehoseProvider.streamExists('a_stream_data').then((result) => {
                expect(result).to.be.true;
            });
        });

        it('returns false if stream doesn\'t exists', () => {

            const KinesisFirehoseProvider = global.SixCRM.routes.include('lib', 'providers/kinesis-firehose-provider.js');
            const kinesisFirehoseProvider = new KinesisFirehoseProvider();

            kinesisFirehoseProvider.firehose = {
                describeDeliveryStream: (params, callback) => {
                    callback('fail', null);
                }
            };

            return kinesisFirehoseProvider.streamExists('a_stream_data').then((result) => {
                expect(result).to.be.false;
            });
        });
    });

    describe('waitForStream', () => {

        it('throws unexpected response error from AWS', () => {

            let data = 'invalid data';

            const KinesisFirehoseProvider = global.SixCRM.routes.include('lib', 'providers/kinesis-firehose-provider.js');
            const kinesisFirehoseProvider = new KinesisFirehoseProvider();

            kinesisFirehoseProvider.firehose = {
                describeDeliveryStream: (params, callback) => {
                    callback(null, data);
                }
            };

            return kinesisFirehoseProvider.waitForStream('a_stream_name').catch((error) => {
                expect(error.message).to.equal('[500] Unexpected response structure from AWS');
            });
        });

        it('returns true when delivery stream status is equal to specified state', () => {

            let data = {DeliveryStreamDescription: {DeliveryStreamStatus: 'a_state'}};

            const KinesisFirehoseProvider = global.SixCRM.routes.include('lib', 'providers/kinesis-firehose-provider.js');
            const kinesisFirehoseProvider = new KinesisFirehoseProvider();

            kinesisFirehoseProvider.firehose = {
                describeDeliveryStream: (params, callback) => {
                    callback(null, data);
                }
            };

            return kinesisFirehoseProvider.waitForStream('a_stream_name', 'a_state').then((result) => {
                expect(result).to.be.true;
            });
        });

        it('throws error if max attempt count is exceeded', () => {

            let data = {DeliveryStreamDescription: {DeliveryStreamStatus: 'some_other_state'}};

            const KinesisFirehoseProvider = global.SixCRM.routes.include('lib', 'providers/kinesis-firehose-provider.js');
            const kinesisFirehoseProvider = new KinesisFirehoseProvider();

            kinesisFirehoseProvider.firehose = {
                describeDeliveryStream: (params, callback) => {
                    callback(null, data);
                }
            };

            //max attempt count is 200, it will increase until it reaches that number and throw error afterwards
            return kinesisFirehoseProvider.waitForStream('a_stream_name', 'a_state', 199).catch((error) => {
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

            const KinesisFirehoseProvider = global.SixCRM.routes.include('lib', 'providers/kinesis-firehose-provider.js');
            const kinesisFirehoseProvider = new KinesisFirehoseProvider();

            kinesisFirehoseProvider.configured_streams = {a_stream: 'a_stream_name'};

            kinesisFirehoseProvider.firehose = {
                putRecord: (params, callback) => {
                    callback(null, 'success');
                }
            };

            return kinesisFirehoseProvider.putRecord('a_stream', ['a_record1', 'a_record2']).then((result) => {
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

            const KinesisFirehoseProvider = global.SixCRM.routes.include('lib', 'providers/kinesis-firehose-provider.js');
            const kinesisFirehoseProvider = new KinesisFirehoseProvider();

            kinesisFirehoseProvider.configured_streams = {a_stream: 'a_stream_name'};

            kinesisFirehoseProvider.firehose = {
                putRecord: (params, callback) => {
                    callback(null, 'success');
                }
            };

            return kinesisFirehoseProvider.putRecord('a_stream', ['a_record1', 'a_record2']).then((result) => {
                expect(result).to.equal('Kinesis streams disabled.');
            });
        });
    });
});
