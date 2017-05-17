let IndexingUtilities = require('../../../lib/indexing-utilities');
let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');

xdescribe('lib/indexing-utilities', () => {

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
                entity_type: 'customer' // indexable type
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
                entity_type: 'customer'
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
                id: '668ad918-0d09-4116-a6fe-0e8a9eda36f7',
                entity_type: 'customer'
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
                id: '668ad918-0d09-4116-a6fe-0e8a9eda36f7',
                entity_type: 'customer'
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

    describe('assureSuggesterFields', () => {
        it('does nothing when object does not have "fields" property', () => {
            // given
            let document = {};

            // when
            IndexingUtilities.assureSuggesterFields(document);

            // then
            expect(document.fields).to.equal(undefined);
        });

        it('preserves original suggestion field', () => {
            // given
            let document = {
                fields: {
                    name: 'Bob',
                    suggestion_field_1: 'foo'
                }
            };

            // when
            IndexingUtilities.assureSuggesterFields(document);

            // then
            expect(document.fields.suggestion_field_1).to.equal('foo');
        });

        it('uses name if exists', () => {
            // given
            let document = {
                fields: {
                    name: 'Alice'
                }
            };

            // when
            IndexingUtilities.assureSuggesterFields(document);

            // then
            expect(document.fields.suggestion_field_1).to.equal('Alice');
        });

        it('it calculates name based on first name', () => {
            // given
            let document = {
                fields: {
                    firstname: 'Gilford'
                }
            };

            // when
            IndexingUtilities.assureSuggesterFields(document);

            // then
            expect(document.fields.suggestion_field_1).to.equal('Gilford');
        });

        it('it calculates name based on last name', () => {
            // given
            let document = {
                fields: {
                    lastname: 'Twatson'
                }
            };

            // when
            IndexingUtilities.assureSuggesterFields(document);

            // then
            expect(document.fields.suggestion_field_1).to.equal('Twatson');
        });

        it('it calculates name based on first and last name', () => {
            // given
            let document = {
                fields: {
                    firstname: 'Gilford',
                    lastname: 'Twatson'
                }
            };

            // when
            IndexingUtilities.assureSuggesterFields(document);

            // then
            expect(document.fields.suggestion_field_1).to.equal('Gilford Twatson');
        });

        it('it calculates name based on tracking number', () => {
            // given
            let document = {
                fields: {
                    trackingnumber: '123'
                }
            };

            // when
            IndexingUtilities.assureSuggesterFields(document);

            // then
            expect(document.fields.suggestion_field_1).to.equal('123');
        });

        it('it calculates name based on alias', () => {
            // given
            let document = {
                fields: {
                    alias: 'alias'
                }
            };

            // when
            IndexingUtilities.assureSuggesterFields(document);

            // then
            expect(document.fields.suggestion_field_1).to.equal('alias');
        });
    });

    describe('createIndexingDocument', () => {
        it('returns empty document for entities with no index_action', () => {
            // given
            let array = [
                {
                    Body: JSON.stringify({
                        id: 1,
                        foo: 'bar',
                    })
                }
            ];
            // when
            let response = IndexingUtilities.createIndexingDocument(array);

            // then
            expect(response).to.equal('[]');
        });

        it('returns empty document for entities with no id', () => {
            // given
            let array = [
                {
                    Body: JSON.stringify({
                        foo: 'bar',
                        index_action: 'add'
                    })
                }
            ];
            // when
            let response = IndexingUtilities.createIndexingDocument(array);

            // then
            expect(response).to.equal('[]');
        });

        it('succeeds for strings', () => {
            // given
            let array = [
                {
                    Body: JSON.stringify({
                        id: 1,
                        foo: 'bar',
                        index_action: 'add',
                        name: 'Alice'
                    })
                }
            ];
            // when
            let response = IndexingUtilities.createIndexingDocument(array);

            // then
            expect(response)
                .to.equal('[{"id":1,"fields":{"foo":"bar","name":"Alice","suggestion_field_1":"Alice"},"type":"add"}]');
        });

        it('succeeds for objects', () => {
            // given
            let array = [
                {
                    Body: JSON.stringify({
                        id: 1,
                        foo: {
                            obj: 'val'
                        },
                        index_action: 'add',
                        name: 'Alice'
                    })
                }
            ];
            // when
            let response = IndexingUtilities.createIndexingDocument(array);

            // then
            expect(response)
                .to.equal('[{"id":1,"fields":{"foo":"{\\"obj\\":\\"val\\"}","name":"Alice","suggestion_field_1":"Alice"},"type":"add"}]');
        });

        it('succeeds for multiple entities', () => {
            // given
            let array = [
                {
                    Body: JSON.stringify({
                        id: 1,
                        foo: 'bar',
                        index_action: 'add',
                        firstname: 'Gilford',
                        lastname: 'Twatson'
                    })
                },
                {
                    Body: JSON.stringify({
                        id: 2,
                        foo: 'baz',
                        index_action: 'delete',
                        name: 'Bob'
                    })
                }
            ];
            // when
            let response = IndexingUtilities.createIndexingDocument(array);

            // then
            expect(response)
                .to.equal('[' +
                '{"id":1,"fields":{"foo":"bar","firstname":"Gilford","lastname":"Twatson","suggestion_field_1":"Gilford Twatson"},"type":"add"},' +
                '{"id":2,"fields":{"foo":"baz","name":"Bob","suggestion_field_1":"Bob"},"type":"delete"}' +
                ']');
        });
    });

});
