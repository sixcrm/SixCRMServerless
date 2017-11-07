const chai = require('chai');
const expect = chai.expect;
const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

describe('lib/sqs-utilities', () => {

    describe('getQueueARN', () => {

        xit('successfully returns queue name', () => {
            expect(sqsutilities.getQueueARN({QueueName: 'sampleQueueName'})).to.equal('sampleQueueName');
        });

        it('returns error when queue name does not exist', () => {
            try{
                sqsutilities.getQueueARN({test: 'sample data'});
            }catch(error){
                expect(error.message).to.equal('[500] Missing QueueName property');
            }
        });

        it('returns error when argumentation for gueueARN is not a string', () => {
            try{
                sqsutilities.getQueueARN({QueueName: 1});
            }catch(error){
                expect(error.message).to.equal('[500] Improper argumentation for getQueueARN');
            }
        });
    });

    describe('getQueueParameters', () => {

        it('returns error when queue name is undefined', () => {
            try{
                sqsutilities.getQueueParameters();
            }catch(error){
                expect(error.message).to.equal('[500] Unable to determine queue name.');
            }
        });
    });

    describe('ensureString', () => {

        it('returns string', () => {
            expect(sqsutilities.ensureString(123)).to.equal('123');
        });
    });
});