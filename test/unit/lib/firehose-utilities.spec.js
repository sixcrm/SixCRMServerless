const chai = require('chai');
const expect = chai.expect;

describe('lib/firehose-utilities', () => {

    describe('createStream', () => {

        it('creates stream', () => {

            const firehoseutilities = global.SixCRM.routes.include('lib', 'firehose-utilities.js');

            firehoseutilities.kinesis = {
                createDeliveryStream: function(params, callback) {
                    callback(null, 'success')
                }
            };

            return firehoseutilities.createStream().then((result) => {
                expect(result).to.equal('success');
            });
        });

        it('throws error from kinesis createDeliveryStream', () => {

            const firehoseutilities = global.SixCRM.routes.include('lib', 'firehose-utilities.js');

            firehoseutilities.kinesis = {
                createDeliveryStream: function(params, callback) {
                    callback('fail', null)
                }
            };

            return firehoseutilities.createStream().catch((error) => {
                expect(error).to.equal('fail');
            });
        });
    });

    describe('deleteStream', () => {

        it('deletes stream', () => {

            const firehoseutilities = global.SixCRM.routes.include('lib', 'firehose-utilities.js');

            firehoseutilities.firehose = {
                deleteDeliveryStream: function(params, callback) {
                    callback(null, 'success')
                }
            };

            return firehoseutilities.deleteStream().then((result) => {
                expect(result).to.equal('success');
            });
        });

        it('throws error from kinesis deleteDeliveryStream', () => {

            const firehoseutilities = global.SixCRM.routes.include('lib', 'firehose-utilities.js');

            firehoseutilities.firehose = {
                deleteDeliveryStream: function(params, callback) {
                    callback('fail', null)
                }
            };

            return firehoseutilities.deleteStream().catch((error) => {
                expect(error).to.equal('fail');
            });
        });
    });

    describe('streamExists', () => {

        it('returns false when delivery stream description is not set', () => {

            const firehoseutilities = global.SixCRM.routes.include('lib', 'firehose-utilities.js');

            firehoseutilities.firehose = {
                describeDeliveryStream: function(params, callback) {
                    callback(null, 'data_without_delivery_stream_desc')
                }
            };

            return firehoseutilities.streamExists().then((result) => {
                expect(result).to.be.false;
            });
        });

        it('returns true when delivery stream description is available', () => {

            const firehoseutilities = global.SixCRM.routes.include('lib', 'firehose-utilities.js');

            firehoseutilities.firehose = {
                describeDeliveryStream: function(params, callback) {
                    callback(null, {DeliveryStreamDescription: 'a_description'})
                }
            };

            return firehoseutilities.streamExists().then((result) => {
                expect(result).to.be.true;
            });
        });

        it('returns false when error is thrown from firehose describeDeliveryStream', () => {

            const firehoseutilities = global.SixCRM.routes.include('lib', 'firehose-utilities.js');

            firehoseutilities.firehose = {
                describeDeliveryStream: function(params, callback) {
                    callback('fail', null)
                }
            };

            return firehoseutilities.streamExists().then((result) => {
                expect(result).to.be.false;
            });
        });
    });

    describe('waitForStream', () => {

        it('returns false when error is thrown from kinesis describeDeliveryStream', () => {

            const firehoseutilities = global.SixCRM.routes.include('lib', 'firehose-utilities.js');

            firehoseutilities.kinesis = {
                describeDeliveryStream: function(params, callback) {
                    callback('fail', null)
                }
            };

            return firehoseutilities.waitForStream('a_state').then((result) => {
                expect(result).to.be.false;
            });
        });

        it('returns true when delivery stream status corresponds to specified state', () => {

            const firehoseutilities = global.SixCRM.routes.include('lib', 'firehose-utilities.js');

            firehoseutilities.kinesis = {
                describeDeliveryStream: function(params, callback) {
                    callback(null, {DeliveryStreamDescription: {DeliveryStreamStatus: 'a_state'}})
                }
            };

            return firehoseutilities.waitForStream('a_state').then((result) => {
                expect(result).to.be.true;
            });
        });
    });
});