const chai = require('chai');
const expect = chai.expect;

const region = global.SixCRM.configuration.site_config.aws.region;
const account = global.SixCRM.configuration.site_config.aws.account;
const localhost_endpoint = 'http://localhost:9324';

describe('lib/sqs-utilities', () => {

    describe('getQueueARN', () => {

        it('successfully returns queue name', () => {

            process.env.stage = 'local';

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            expect(sqsutilities.getQueueARN({QueueName: 'sampleQueueName'})).to.equal('sampleQueueName');
        });

        it('returns error when queue name does not exist', () => {

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            try{
                sqsutilities.getQueueARN({test: 'sample data'});
            }catch(error){
                expect(error.message).to.equal('[500] Missing QueueName property');
            }
        });

        it('returns error when argumentation for gueueARN is not a string', () => {

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            try{
                sqsutilities.getQueueARN({QueueName: 1});
            }catch(error){
                expect(error.message).to.equal('[500] Improper argumentation for getQueueARN');
            }
        });

        it('returns queue arn template with appointed queue name', () => {

            let queue_name = 'sampleQueueName';

            process.env.stage = 'test';

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            expect(sqsutilities.getQueueARN({QueueName: queue_name})).to.equal(
                //queue arn template
                'arn:aws:sqs:' +
                region + ':' +
                account + ':' +
                queue_name);
        });
    });

    describe('getQueueURL', () => {

        it('returns queue url template with appointed queue name', () => {

            process.env.stage = 'test';

            let input = 'example';

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            expect(sqsutilities.getQueueURL(input)).to.equal(
                //queue url template
                'https://sqs.' +
                region +
                '.amazonaws.com/' +
                account +
                '/' + input);
        });

        it('returns url template with queue name from appointed input', () => {

            process.env.stage = 'test';

            let input = {queue:'example'};

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            expect(sqsutilities.getQueueURL(input)).to.equal(
                //queue url template
                'https://sqs.' +
                region +
                '.amazonaws.com/' +
                account +
                '/' + input.queue);
        });

        it('returns localhost endpoint with appointed queue name', () => {

            process.env.stage = 'local';

            let input = 'example';

            const queue = '/queue/';

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            expect(sqsutilities.getQueueURL(input)).to.equal(localhost_endpoint + queue + input);
        });
    });

    describe('getQueueParameters', () => {

        it('returns error when queue name is undefined', () => {

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            try{
                sqsutilities.getQueueParameters();
            }catch(error){
                expect(error.message).to.equal('[500] Unable to determine queue name.');
            }
        });

        it('returns queue parameters with appointed queue name', () => {

            let queue_name = 'test';

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            expect(sqsutilities.getQueueParameters(queue_name)).to.deep.equal({
                "account": account,
                "queue_name": queue_name,
                "region": region
            });
        });
    });

    describe('ensureString', () => {

        it('returns string', () => {

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            expect(sqsutilities.ensureString(123)).to.equal('123');
        });
    });

    describe('receiveMessages', () => {

        it('returns received message', () => {

            process.env.stage = 'test';

            let params = {
                queue:'example',
                limit: 5
            };

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            sqsutilities.sqs = {
                receiveMessage: function(params, callback) {
                    callback(null, {Messages: 'sample message'})
                }
            };

            return sqsutilities.receiveMessages(params).then((result) => {
                expect(result).to.equal('sample message');
            });
        });

        it('returns error when message wasn\'t received', () => {

            process.env.stage = 'test';

            let params = {
                queue:'example',
                limit: 5
            };

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            sqsutilities.sqs = {
                receiveMessage: function(params, callback) {
                    callback(new Error('fail'), null)
                }
            };

            return sqsutilities.receiveMessages(params).catch((error) => {
                expect(error.message).to.equal('fail');
            });
        });
    });

    describe('deleteMessage', () => {

        it('successfully deletes message', () => {

            process.env.stage = 'test';

            let input = {queue:'example'};

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            sqsutilities.sqs = {
                deleteMessage: function(params, callback) {
                    callback(null, 'success');
                }
            };

            return sqsutilities.deleteMessage(input).then((result) => {
                expect(result).to.equal('success');
            });
        });
    });

    describe('sendMessage', () => {

        it('successfully sends message', () => {

            process.env.stage = 'test';

            let input = {queue:'example'};

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            sqsutilities.sqs = {
                sendMessage: function(params, callback) {
                    callback(null, 'success');
                }
            };

            return sqsutilities.sendMessage(input).then((result) => {
                expect(result).to.equal('success');
            });
        });
    });

});