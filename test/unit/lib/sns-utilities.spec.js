const chai = require('chai');
const expect = chai.expect;
const mockery = require('mockery');

describe('lib/sns-utilities', () => {

    describe('sendSMS', () => {

        it('successfully send SMS', () => {

            let text = 'sample text';

            let phone_number = 123456789;

            const snsutilities = global.SixCRM.routes.include('lib', 'sns-utilities.js');

            snsutilities.sns = {
                publish: (params, callback) => {
                    callback(null, 'success');
                }
            };

            return snsutilities.sendSMS(text, phone_number).then((result) => {
                expect(result).to.equal('success');
            });
        });

        it('returns error when SMS sending was unsuccessful', () => {

            let text = 'sample text';

            let phone_number = 123456789;

            const snsutilities = global.SixCRM.routes.include('lib', 'sns-utilities.js');

            snsutilities.sns = {
                publish: (params, callback) => {
                    callback(new Error('fail'), null);
                }
            };

            return snsutilities.sendSMS(text, phone_number).catch((error) => {
                expect(error.message).to.equal('fail');
            });
        });
    });
});