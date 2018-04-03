const chai = require('chai');
const expect = chai.expect;

describe('lib/providers/firehose-provider', () => {

    describe('createStream', () => {

        it('creates stream', () => {

            const FirehoseProvider = global.SixCRM.routes.include('lib', 'providers/firehose-provider.js');
            const firehoseprovider = new FirehoseProvider();

            firehoseprovider.kinesis = {
                createDeliveryStream: function(params, callback) {
                    callback(null, 'success')
                }
            };

            return firehoseprovider.createStream().then((result) => {
                expect(result).to.equal('success');
            });
        });

        it('throws error from kinesis createDeliveryStream', () => {

            const FirehoseProvider = global.SixCRM.routes.include('lib', 'providers/firehose-provider.js');
            const firehoseprovider = new FirehoseProvider();

            firehoseprovider.kinesis = {
                createDeliveryStream: function(params, callback) {
                    callback('fail', null)
                }
            };

            return firehoseprovider.createStream().catch((error) => {
                expect(error).to.equal('fail');
            });
        });
    });

    describe('deleteStream', () => {

        it('deletes stream', () => {

            const FirehoseProvider = global.SixCRM.routes.include('lib', 'providers/firehose-provider.js');
            const firehoseprovider = new FirehoseProvider();

            firehoseprovider.firehose = {
                deleteDeliveryStream: function(params, callback) {
                    callback(null, 'success')
                }
            };

            return firehoseprovider.deleteStream().then((result) => {
                expect(result).to.equal('success');
            });
        });

        it('throws error from kinesis deleteDeliveryStream', () => {

            const FirehoseProvider = global.SixCRM.routes.include('lib', 'providers/firehose-provider.js');
            const firehoseprovider = new FirehoseProvider();

            firehoseprovider.firehose = {
                deleteDeliveryStream: function(params, callback) {
                    callback('fail', null)
                }
            };

            return firehoseprovider.deleteStream().catch((error) => {
                expect(error).to.equal('fail');
            });
        });
    });

    describe('streamExists', () => {

        it('returns false when delivery stream description is not set', () => {

            const FirehoseProvider = global.SixCRM.routes.include('lib', 'providers/firehose-provider.js');
            const firehoseprovider = new FirehoseProvider();

            firehoseprovider.firehose = {
                describeDeliveryStream: function(params, callback) {
                    callback(null, 'data_without_delivery_stream_desc')
                }
            };

            return firehoseprovider.streamExists().then((result) => {
                expect(result).to.be.false;
            });
        });

        it('returns true when delivery stream description is available', () => {

            const FirehoseProvider = global.SixCRM.routes.include('lib', 'providers/firehose-provider.js');
            const firehoseprovider = new FirehoseProvider();

            firehoseprovider.firehose = {
                describeDeliveryStream: function(params, callback) {
                    callback(null, {DeliveryStreamDescription: 'a_description'})
                }
            };

            return firehoseprovider.streamExists().then((result) => {
                expect(result).to.be.true;
            });
        });

        it('returns false when error is thrown from firehose describeDeliveryStream', () => {

            const FirehoseProvider = global.SixCRM.routes.include('lib', 'providers/firehose-provider.js');
            const firehoseprovider = new FirehoseProvider();

            firehoseprovider.firehose = {
                describeDeliveryStream: function(params, callback) {
                    callback('fail', null)
                }
            };

            return firehoseprovider.streamExists().then((result) => {
                expect(result).to.be.false;
            });
        });
    });

    describe('waitForStream', () => {

        it('returns false when error is thrown from kinesis describeDeliveryStream', () => {

            const FirehoseProvider = global.SixCRM.routes.include('lib', 'providers/firehose-provider.js');
            const firehoseprovider = new FirehoseProvider();

            firehoseprovider.kinesis = {
                describeDeliveryStream: function(params, callback) {
                    callback('fail', null)
                }
            };

            return firehoseprovider.waitForStream('a_state').then((result) => {
                expect(result).to.be.false;
            });
        });

        it('returns true when delivery stream status corresponds to specified state', () => {

            const FirehoseProvider = global.SixCRM.routes.include('lib', 'providers/firehose-provider.js');
            const firehoseprovider = new FirehoseProvider();

            firehoseprovider.kinesis = {
                describeDeliveryStream: function(params, callback) {
                    callback(null, {DeliveryStreamDescription: {DeliveryStreamStatus: 'a_state'}})
                }
            };

            return firehoseprovider.waitForStream('a_state').then((result) => {
                expect(result).to.be.true;
            });
        });
    });
});