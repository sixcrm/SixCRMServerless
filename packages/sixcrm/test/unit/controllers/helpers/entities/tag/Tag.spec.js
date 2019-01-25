const _ = require('lodash');
const mockery = require('mockery');
let chai = require('chai');
const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;
const random = require('@6crm/sixcrmcore/lib/util/random').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;
const stringutilities = require('@6crm/sixcrmcore/lib/util/string-utilities').default;

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

describe('/helpers/entities/tag/Tag.js', async () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	beforeEach(() => {});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	after(() => {
		mockery.disable();
	});

	describe('constructor', () => {

		it('successfully calls the constructor', () => {
			const TagHelperController = global.SixCRM.routes.include('helpers', 'entities/tag/Tag.js');
			let tagHelperController = new TagHelperController();

			expect(objectutilities.getClassName(tagHelperController)).to.equal('TagHelper');

		});

	});

  describe('putTag', async () => {

    it('creates a new tag', async () => {

      let creditcard = MockEntities.getValidCreditCard();
      let existing_tag = MockEntities.getValidTag();
      let tag_key = 'testkey';
      existing_tag.entity = creditcard.id;
      existing_tag.key = tag_key;
      existing_tag.value = 'existing value';

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Tag.js'), class {
        constructor(){}
        listByEntityAndKey({id, key}){
          expect(id).to.be.defined;
          expect(key).to.be.a('string');
          return Promise.resolve(null);
        }
        create({entity}){
          expect(entity).to.be.a('object');
          return Promise.resolve(entity);
        }
        getID(entity){
          if(_.has(entity, 'id')){
            return entity.id;
          }
          return entity;
        }
      });

      const TagHelperController = global.SixCRM.routes.include('helpers', 'entities/tag/Tag.js');
			let tagHelperController = new TagHelperController();

      let new_value = random.createRandomString(10);

      let result = await tagHelperController.putTag({entity: creditcard, key: tag_key, value:new_value});
      expect(result).to.have.property('value');
      expect(result.value).to.equal(new_value);

    });

    it('updates a existing tag', async () => {

      let creditcard = MockEntities.getValidCreditCard();
      let existing_tag = MockEntities.getValidTag();
      let tag_key = 'testkey';
      existing_tag.entity = creditcard.id;
      existing_tag.key = tag_key;
      existing_tag.value = 'existing value';

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Tag.js'), class {
        constructor(){}
        listByEntityAndKey({id, key}){
          expect(id).to.be.a('object');
          expect(id.id).to.equal(creditcard.id);
          expect(key).to.be.a('string');
          return Promise.resolve(existing_tag);
        }
        update({entity}){
          expect(entity).to.be.a('object');
          //expect(entity.value).to.not.equal(existing_tag.value);
          return Promise.resolve(entity);
        }
        getID(entity){
          if(_.has(entity, 'id')){
            return entity.id;
          }
          return entity;
        }
      });

      const TagHelperController = global.SixCRM.routes.include('helpers', 'entities/tag/Tag.js');
			let tagHelperController = new TagHelperController();

      let new_value = random.createRandomString(10);

      let result = await tagHelperController.putTag({entity: creditcard, key: tag_key, value: new_value});
      expect(result).to.have.property('value');
      expect(result.value).to.equal(new_value);

    });

  });

  it('no modification to existing tag', async () => {

    let creditcard = MockEntities.getValidCreditCard();
    let existing_tag = MockEntities.getValidTag();
    let tag_key = 'testkey';
    existing_tag.entity = creditcard.id;
    existing_tag.key = tag_key;
    existing_tag.value = 'existing value';

    mockery.registerMock(global.SixCRM.routes.path('entities', 'Tag.js'), class {
      constructor(){}
      listByEntityAndKey({id, key}){
        expect(id).to.be.a('object');
        expect(id.id).to.equal(creditcard.id);
        expect(key).to.be.a('string');
        return Promise.resolve(existing_tag);
      }
      update({entity}){
        expect(entity).to.be.a('object');
        //expect(entity.value).to.not.equal(existing_tag.value);
        return Promise.resolve(entity);
      }
      getID(entity){
        if(_.has(entity, 'id')){
          return entity.id;
        }
        return entity;
      }
    });

    const TagHelperController = global.SixCRM.routes.include('helpers', 'entities/tag/Tag.js');
    let tagHelperController = new TagHelperController();

    let new_value = existing_tag.value;

    let result = await tagHelperController.putTag({entity: creditcard, key: tag_key, value: new_value});
    expect(result).to.deep.equal(existing_tag);

  });

  describe('getTagPrototype', () => {
    it('returns prototype', () => {

      let creditcard = MockEntities.getValidCreditCard();
      let key = random.createRandomString(10);
      let value = random.createRandomString(10);

      const TagHelperController = global.SixCRM.routes.include('helpers', 'entities/tag/Tag.js');
      let tagHelperController = new TagHelperController();

      let result = tagHelperController.getTagPrototype({entity: creditcard.id, key: key, value: value});
      expect(result).to.have.property('entity');
      expect(result).to.have.property('key');
      expect(result).to.have.property('value');
      expect(result.entity).to.equal(creditcard.id);
      expect(result.key).to.equal(key);
      expect(result.value).to.equal(value);

    });
  });

});
