const chai = require('chai');
const expect = chai.expect;
const random = global.SixCRM.routes.include('lib','random.js');
const _ = require('underscore');

describe('lib/sqs-utilities', () => {

    let copy_stage = process.env.stage;

    beforeEach(() => {
        // cleanup
        delete require.cache[require.resolve(global.SixCRM.routes.path('lib', 'sqs-utilities.js'))];
    });

   after(() => {
       process.env.stage = copy_stage;
    });


    describe('getQueueARN', () => {

        it('successfully returns queue arn', () => {

          global.SixCRM.configuration.handleStage('development');
          global.SixCRM.configuration.setConfigurationFiles();

          const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

          let argumentation = {QueueName: 'sampleQueueName'};

          let queue_arn = sqsutilities.getQueueARN(argumentation);

          expect(queue_arn).to.match(/^arn:aws:sqs:us-[a-zA-Z]+-[0-9]:[0-9]+:sampleQueueName$/);

        });

        it('returns error when queue name does not exist', () => {

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            try{
                sqsutilities.getQueueARN({test: 'sample data'});
            }catch(error){
                expect(error.message).to.equal('[500] Missing QueueName property');
            }
        });

        it('returns error when argumentation for queueARN is not a string', () => {

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            try{
                sqsutilities.getQueueARN(1);
            }catch(error){
                expect(error.message).to.equal('[500] Improper argumentation for getQueueARN');
            }
        });

        it('returns queue arn template with appointed queue name for localhost', () => {

            let argumentation = {QueueName: 'sampleQueueName'};

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            global.SixCRM.configuration.handleStage('local');
            global.SixCRM.configuration.setConfigurationFiles();

            let queue_arn = sqsutilities.getQueueARN(argumentation);

            expect(queue_arn).to.equal(argumentation.QueueName);
        });
    });

    describe('getQueueURL', () => {

        it('returns queue url template with appointed queue name', () => {

            global.SixCRM.configuration.handleStage('development');
            global.SixCRM.configuration.setConfigurationFiles();

            let input = 'example';

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            expect(sqsutilities.getQueueURL(input)).to.match(/https:\/\/sqs.us-[a-zA-Z]+-[0-9].amazonaws.com\/[0-9]+\/example/);
        });

        it('returns url template with queue name from appointed input', () => {

            global.SixCRM.configuration.handleStage('development');
            global.SixCRM.configuration.setConfigurationFiles();

            let input = {queue:'example'};

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            expect(sqsutilities.getQueueURL(input)).to.match(/https:\/\/sqs.us-[a-zA-Z]+-[0-9].amazonaws.com\/[0-9]+\/example/);
        });

        it('returns localhost endpoint with appointed queue name', () => {

            global.SixCRM.configuration.handleStage('local');
            global.SixCRM.configuration.setConfigurationFiles();

            let endpoint = global.SixCRM.configuration.site_config.sqs.endpoint;
            let input = 'example';
            const queue = '/queue/';

            let expected_result = endpoint+queue+input;

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');
            let queue_url = sqsutilities.getQueueURL(input);

            expect(queue_url).to.equal(expected_result);

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

          global.SixCRM.configuration.handleStage('development');
          global.SixCRM.configuration.setConfigurationFiles();

            let queue_name = 'test';

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            let queue_parameters = sqsutilities.getQueueParameters(queue_name);

            expect(queue_parameters.account).to.match(/[0-9]/);
            expect(queue_parameters.queue_name).to.equal(queue_name);
            expect(queue_parameters.region).to.match(/us-[a-zA-Z]+-[0-9]/);
        });
    });

    describe('ensureString', () => {

        it('returns string', () => {

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            expect(sqsutilities.ensureString(123)).to.equal('123');
        });

        it('returns unchanged value when value is string', () => {

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            expect(sqsutilities.ensureString('any_string_value')).to.equal('any_string_value');
        });
    });

    describe('receiveMessagesRecursive', () => {

      it('returns 200 messages', () => {

        let ten_messages = [];

        for(var i =0; i < 10; i++){
          ten_messages.push({
            Id: 'someid',
            ReceiptHandle:'SomeReceiptHandle'
          });
        }

        const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

        sqsutilities.sqs = {
          receiveMessage: function(params, callback) {
            callback(null, {Messages: ten_messages})
          }
        };

        return sqsutilities.receiveMessagesRecursive({queue: 'testqueue'}).then(messages => {
          expect(messages.length).to.equal(200);
        });

      });

      let max = random.randomInt(0, 200);

      it('returns random maximum number of messages ('+max+')', () => {

        let ten_messages = [];

        for(var i =0; i < 10; i++){
          ten_messages.push({
            Id: 'someid',
            ReceiptHandle:'SomeReceiptHandle'
          });
        }

        const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');


        sqsutilities.batch_read_limit = max;
        sqsutilities.sqs = {
          receiveMessage: function(params, callback) {
            if(_.has(params, 'MaxNumberOfMessages')){
              let return_messages = ten_messages.slice(0, parseInt(params.MaxNumberOfMessages));

              callback(null, {Messages: return_messages})
            }
            callback(null, {Messages: ten_messages})
          }
        };

        return sqsutilities.receiveMessagesRecursive({queue: 'testqueue'}).then(messages => {
          expect(messages.length).to.equal(max);
        });

      });

    });

    describe('receiveMessages', () => {

        it('returns received message', () => {

            global.SixCRM.configuration.handleStage('development');
            global.SixCRM.configuration.setConfigurationFiles();

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

            global.SixCRM.configuration.handleStage('development');
            global.SixCRM.configuration.setConfigurationFiles();

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

            global.SixCRM.configuration.handleStage('development');
            global.SixCRM.configuration.setConfigurationFiles();

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

            global.SixCRM.configuration.handleStage('development');
            global.SixCRM.configuration.setConfigurationFiles();

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

    describe('deleteMessages', () => {

        it('successfully deletes messages', () => {

            global.SixCRM.configuration.handleStage('development');
            global.SixCRM.configuration.setConfigurationFiles();

            let input = {
                queue: 'example',
                messages: [{
                    ReceiptHandle: 'sample message',
                    MessageId: 1
                }]
            };

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            sqsutilities.sqs = {
                deleteMessageBatch: (params, callback) => {
                    callback(null, 'success');
                }
            };

            return sqsutilities.deleteMessages(input).then((result) => {
                expect(result).to.equal('success');
            });
        });

        it('returns response from deleted message batch', () => {

            global.SixCRM.configuration.handleStage('development');
            global.SixCRM.configuration.setConfigurationFiles();

            let input = {
                queue: 'example',
                messages: [{
                    ReceiptHandle: 'sample message',
                    MessageId: 1
                }]
            };

            let data = {Failed: ['failed message']};

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            sqsutilities.sqs = {
                deleteMessageBatch: (params, callback) => {
                    callback(null, data);
                }
            };

            return sqsutilities.deleteMessages(input).then((result) => {
                expect(result).to.equal(data);
            });
        });

        it('returns error when messages haven\'t been removed', () => {

            global.SixCRM.configuration.handleStage('development');
            global.SixCRM.configuration.setConfigurationFiles();

            let fail = new Error('fail');

            let input = {
                queue: 'example',
                messages: [{
                    ReceiptHandle: 'sample message',
                    MessageId: 1
                }]
            };

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            sqsutilities.sqs = {
                deleteMessageBatch: (params, callback) => {
                    callback(fail, null);
                }
            };

            return sqsutilities.deleteMessages(input).catch((error) => {
                expect(error).to.equal(fail);
            });
        });

        it('returns false when there aren\'t any messages to delete', () => {

            global.SixCRM.configuration.handleStage('development');
            global.SixCRM.configuration.setConfigurationFiles();

            let input = {queue: 'example'};

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            return sqsutilities.deleteMessages(input).then((result) => {
                expect(result).to.equal(false);
            });
        });
    });

    describe('listQueues', () => {

        it('rejects when listing queues fails', () => {

            let params = 'test';

            let fail = {message: 'fail'};

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            sqsutilities.sqs = {
                listQueues: (params, callback) => {
                    callback(fail, null);
                }
            };

            return sqsutilities.listQueues(params).catch((error) => {
                expect(error.message).to.equal('[500] ' + fail.message);
            });
        });

        it('returns queue list', () => {

            let params = 'test';

            let data = 'success';

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            sqsutilities.sqs = {
                listQueues: (params, callback) => {
                    callback(null, data);
                }
            };

            return sqsutilities.listQueues(params).then((result) => {
                expect(result).to.equal(data);
            });
        });
    });

    describe('createQueue', () => {

        it('returns false if queue alredy exists', () => {

            let params = {QueueName: 'test'};

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            sqsutilities.existing_queues = ['test', 'test2'];

            return sqsutilities.createQueue(params).then((result) => {
                expect(result).to.equal(false);
            });
        });

        it('returns response from AWS create queue', () => {

            let params = {QueueName: 'test'};

            let data = 'success';

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            sqsutilities.existing_queues = ['test2'];

            sqsutilities.sqs = {
                createQueue: (params, callback) => {
                    callback(null, data);
                }
            };

            return sqsutilities.createQueue(params).then((result) => {
                expect(result).to.equal(data);
            });
        });
    });

    describe('setQueueAttibutes', () => {

        it('returns response from AWS setQueueAttributes', () => {

            let data = 'success';

            let params = 'test';

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            sqsutilities.sqs = {
                setQueueAttributes: (params, callback) => {
                    callback(null, data);
                }
            };

            return sqsutilities.setQueueAttibutes(params).then((result) => {
                expect(result).to.equal(data);
            });
        });
    });

    describe('deleteQueue', () => {

        it('returns false if AWS reports error stating the queue does not exist', () => {

            let shortname = 'test';

            let data = {QueueUrls: []};

            //let fail = {code: 'AWS.SimpleQueueService.NonExistentQueue'};

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            sqsutilities.sqs = {
                listQueues: (params, callback) => {
                    callback(null, data);
                }
            };

            return sqsutilities.deleteQueue(shortname).then((result) => {
                expect(result).to.equal(false);
            });
        });

        it('returns false if queue already does not exist', () => {

            let shortname = 'test';

            let data = {QueueUrls: ['test', 'test2']};

            let fail = {code: 'AWS.SimpleQueueService.NonExistentQueue'};

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            sqsutilities.sqs = {
                listQueues: (params, callback) => {
                    callback(null, data);
                },
                deleteQueue: (params, callback) => {
                    callback(fail, null);
                }
            };

            return sqsutilities.deleteQueue(shortname).then((result) => {
                expect(result).to.equal(false);
            });
        });

        it('rejects with AWS response when error was unrecognized', () => {

            let shortname = 'test';

            let data = {QueueUrls: ['test', 'test2']};

            let fail = {code: 'AWS.SimpleQueueService.SomeOtherError'};

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            sqsutilities.sqs = {
                listQueues: (params, callback) => {
                    callback(null, data);
                },
                deleteQueue: (params, callback) => {
                    callback(fail, null);
                }
            };

            return sqsutilities.deleteQueue(shortname).catch((error) => {
                expect(error.message).to.equal('[500] Failed to delete queue: test');
            });
        });

        it('returns response from AWS deleteQueue when deletion was successful', () => {

            let response = 'success';

            let shortname = 'test';

            let data = {QueueUrls: ['test', 'test2']};

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            sqsutilities.sqs = {
                listQueues: (params, callback) => {
                    callback(null, data);
                },
                deleteQueue: (params, callback) => {
                    callback(null, response);
                }
            };

            return sqsutilities.deleteQueue(shortname).then((result) => {
                expect(result).to.equal('success');
            });
        });
    });

    describe('purgeQueue', () => {

        it('returns response from AWS purgeQueue', () => {

            let params = 'test';

            let data ='queue purged';

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            sqsutilities.existing_queues = ['test', 'test2'];

            sqsutilities.sqs = {
                purgeQueue: (params, callback) => {
                    callback(null, data);
                }
            };

            return sqsutilities.purgeQueue(params).then((result) => {
                expect(result).to.equal(data);
            });
        });

        it('returns false when appointed value is object with non-existing queue name', () => {

            let params = {QueueName: 'a_name'};

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            sqsutilities.existing_queues = ['test2'];

            return sqsutilities.purgeQueue(params).then((result) => {
                expect(result).to.equal(false);
            });
        });

        it('returns false when queue doesn\'t exist', () => {

            let params = 'test';

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            sqsutilities.existing_queues = ['test2'];

            return sqsutilities.purgeQueue(params).then((result) => {
                expect(result).to.equal(false);
            });
        });

        it('returns error when queue name is not defined in parameters', () => {

            let params = {test: 'test'};

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            sqsutilities.existing_queues = ['test', 'test2'];

            return sqsutilities.purgeQueue(params).catch((error) => {
                expect(error.message).to.equal('[500] Purge Queue parameters objects assumed to have QueueName property');
            });
        });
    });

    describe('queueExists', () => {

        it('returns false when there aren\'t preexisting queues', () => {

            let shortname = 'sample name';

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            delete sqsutilities.existing_queues;

            sqsutilities.sqs = {
                listQueues: (params, callback) => {
                    callback(null, 'no list');
                }
            };

            return sqsutilities.queueExists(shortname).then((result) => {
                expect(result).to.equal(false);
            });
        });

        it('returns error when unexpected response is received from AWS ListQueues', () => {

            let shortname = 'test';

            let data = {QueueUrls: 'queue'};

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            delete sqsutilities.existing_queues;

            sqsutilities.sqs = {
                listQueues: (params, callback) => {
                    callback(null, data);
                }
            };

            return sqsutilities.queueExists(shortname).catch((error) => {
                expect(error.message).to.equal('[500] Unexpected response format from AWS ListQueues.');
            });
        });

        it('returns true when queue exist in retrieved list', () => {

            let short_name = 'test';

            let data = {QueueUrls: ['test', 'test2']};

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            sqsutilities.sqs = {
                listQueues: (params, callback) => {
                    callback(null, data);
                }
            };

            return sqsutilities.queueExists(short_name).then((result) => {
                expect(result).to.equal(true);
            });
        });

        it('returns true when queue is contained inside preexisting list', () => {

            let shortname = 'test';

            const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

            sqsutilities.existing_queues = ['test', 'test2'];

            return sqsutilities.queueExists(shortname).then((result) => {
                expect(result).to.equal(true);
            });
        });
    });
});
