let IndexingUtilities = require('../../../lib/indexing-utilities');
let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');

describe('lib/indexing-utilities', () => {

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

    describe('createAbridgedEntity', () => {
        it('should create abridged entity', () => {
            // given
            let entity = {
                index_action: 'index_action',
                entity_type: 'entity_type',
                id: 'id',
                active: 'active',
                email: 'email',
                firstname: 'firstname',
                lastname: 'lastname',
                name: 'name',
                phone: 'phone',
                sku: 'sku',
                tracking_number: 'tracking_number',
                address: 'address',
                amount: 'amount',
                alias: 'alias',
                first_six: 'first_six',
                last_four: 'last_four',
                account: 'account',
                non_indexed: 'property',
                another_non_indexed: 'property'
            };
            let expectedAbridgedEntity = Object.assign({}, entity);
            delete expectedAbridgedEntity.non_indexed;
            delete expectedAbridgedEntity.another_non_indexed;

            // then
            expect(IndexingUtilities.createAbridgedEntity(entity)).to.deep.equal(expectedAbridgedEntity);
        });
    });

    describe('parseMessage', () => {
        it('should parse a message with body', () => {
            // given
            let aMessage = {
                Id: 'id',
                Body: JSON.stringify({foo: 'bar'})
            };

            // then
            expect(IndexingUtilities.parseMessage(aMessage)).to.deep.equal(JSON.parse(aMessage.Body));
        });

        it('should throw an error when message has no body', () => {
            // given
            let aMessage = {
                Id: 'id'
            };

            // then
            try {
                IndexingUtilities.parseMessage(aMessage);
            } catch (error) {
                expect(error.message).to.equal('Unable to acquire message body.');
            }

        });
    });

    describe('pushToIndexingBucket', () => {
        it('should throw an error when environment variables are not set', () => {
            // given
            let entity = {};
            delete process.env.search_indexing_queue_url;

            // then
            return IndexingUtilities.pushToIndexingBucket(entity).catch((error) => {
                expect(error.message).to.equal('Missing search_indexing_queue_url definition in the process.env object.');
            });
        });

        it('should throw an error when entity does not have "index_action"', () => {
            // given
            let entity = {};
            process.env.search_indexing_queue_url = 'url';

            // then
            return IndexingUtilities.pushToIndexingBucket(entity).catch((error) => {
                expect(error.message).to.equal('Indexable entities must have a "index_action" which is either "add" or "delete".');
            });
        });

        it('should throw an error when entity has wrong value for "index_action"', () => {
            // given
            let entity = {
                index_action: 'fail'
            };
            process.env.search_indexing_queue_url = 'url';

            // then
            return IndexingUtilities.pushToIndexingBucket(entity).catch((error) => {
                expect(error.message).to.equal('Indexable entities must have a "index_action" which is either "add" or "delete".');
            });
        });

        it('should throw an error when entity does not have "entity_type"', () => {
            // given
            let entity = {
                index_action: 'add'
            };
            process.env.search_indexing_queue_url = 'url';

            // then
            return IndexingUtilities.pushToIndexingBucket(entity).catch((error) => {
                expect(error.message).to.equal('Indexable entities must have a "Entity Type".');
            });
        });

        it('should resolve to false for non-indexable entities', () => {
            // given
            let entity = {
                index_action: 'add',
                entity_type: 'potato'
            };
            process.env.search_indexing_queue_url = 'url';

            // then
            return IndexingUtilities.pushToIndexingBucket(entity).then((response) => {
                expect(response).to.equal(false);
            });
        });

        it('should resolve to true for indexable entities', () => {
            // given
            let entity = {
                index_action: 'add',
                entity_type: 'user' // indexable type
            };
            process.env.search_indexing_queue_url = 'url';

            mockery.registerMock('./sqs-utilities.js', {
                sendMessage: (parameters, callback) => {
                    callback(null, {});
                }
            });
            let IndexingUtilities = require('../../../lib/indexing-utilities');

            // then
            return IndexingUtilities.pushToIndexingBucket(entity).then((response) => {
                expect(response).to.equal(true);
            });
        });

        it('should throw an error when writing to queue fails', () => {
            // given
            let entity = {
                index_action: 'add',
                entity_type: 'user' // indexable type
            };
            process.env.search_indexing_queue_url = 'url';

            mockery.registerMock('./sqs-utilities.js', {
                sendMessage: (parameters, callback) => {
                    callback(new Error('Sending message failed.'), null);
                }
            });
            let IndexingUtilities = require('../../../lib/indexing-utilities');

            // then
            return IndexingUtilities.pushToIndexingBucket(entity).catch((error) => {
                expect(error.message).to.equal('Sending message failed.');
            });
        });
    });

    describe('removeFromSearchIndex', () => {
        it('should resolve to true', () => {
            // given
            let entity = {
                entity_type: 'user'
            };
            process.env.search_indexing_queue_url = 'url';

            mockery.registerMock('./sqs-utilities.js', {
                sendMessage: (parameters, callback) => {
                    callback(null, {});
                }
            });
            let IndexingUtilities = require('../../../lib/indexing-utilities');

            // then
            return IndexingUtilities.removeFromSearchIndex(entity).then((response) => {
                expect(response).to.be.true;
                expect(entity.index_action).to.equal('delete');
            });
        });
    });

    describe('addToSearchIndex', () => {
        it('should resolve to true', () => {
            // given
            let entity = {
                entity_type: 'user'
            };
            process.env.search_indexing_queue_url = 'url';

            mockery.registerMock('./sqs-utilities.js', {
                sendMessage: (parameters, callback) => {
                    callback(null, {});
                }
            });
            let IndexingUtilities = require('../../../lib/indexing-utilities');

            // then
            return IndexingUtilities.addToSearchIndex(entity).then((response) => {
                expect(response).to.be.true;
                expect(entity.index_action).to.equal('add');
            });
        });
    });

});
