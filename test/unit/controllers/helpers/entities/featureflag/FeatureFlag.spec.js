const mockery = require('mockery');
const chai = require('chai');
const expect = chai.expect;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

describe('/helpers/entities/featureflag/FeatureFlag.js', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	afterEach(() => {
		mockery.resetCache();
    mockery.deregisterAll();
	});

  describe('constructor', () => {

    it('successfully constructs', () => {

      const FeatureFlagHelperController = global.SixCRM.routes.include('helpers', 'entities/featureflag/FeatureFlag.js');
      let featureFlagHelperController = new FeatureFlagHelperController();

      expect(objectutilities.getClassName(featureFlagHelperController)).to.equal('FeatureFlagHelperController');

    });

  });

  describe('getFeatureFlags', async () => {

    it('successfully retrieves feature flags document (default)', async () => {

      let feature_flag = MockEntities.getValidFeatureFlag();
      feature_flag.environment = 'default';
      feature_flag.account = 'default';

      mockery.registerMock(global.SixCRM.routes.path('entities', 'FeatureFlag.js'), class {
        constructor(){}
        get({id, range_key}){
          expect(id).to.be.a('string');
          expect(range_key).to.be.a('string');
          return Promise.resolve(feature_flag);
        }
      });

      const FeatureFlagHelperController = global.SixCRM.routes.include('helpers', 'entities/featureflag/FeatureFlag.js');
      let featureFlagHelperController = new FeatureFlagHelperController();

      let document = await featureFlagHelperController.getFeatureFlag({environment: 'default'});

      expect(document).to.have.property('environment');
      expect(document).to.have.property('account');
      expect(document.environment).to.equal('default');
      expect(document.account).to.equal('default');

    });

    it('successfully retrieves feature flags document (environment-specific)', async () => {

      let feature_flag = MockEntities.getValidFeatureFlag();
      feature_flag.environment = 'production';
      feature_flag.account = 'default';

      mockery.registerMock(global.SixCRM.routes.path('entities', 'FeatureFlag.js'), class {
        constructor(){}
        get({id, range_key}){
          expect(id).to.be.a('string');
          expect(range_key).to.be.a('string');
          return Promise.resolve(feature_flag);
        }
      });

      const FeatureFlagHelperController = global.SixCRM.routes.include('helpers', 'entities/featureflag/FeatureFlag.js');
      let featureFlagHelperController = new FeatureFlagHelperController();

      let document = await featureFlagHelperController.getFeatureFlag({environment: 'production'});

      expect(document).to.have.property('environment');
      expect(document).to.have.property('account');
      expect(document.environment).to.equal('production');
      expect(document.account).to.equal('default');

    });

    it('successfully retrieves feature flags document (environment-specific, account-specific)', async () => {

      let feature_flag = MockEntities.getValidFeatureFlag();
      feature_flag.environment = 'development';
      feature_flag.account = 'd3fa3bf3-7824-49f4-8261-87674482bf1c';

      mockery.registerMock(global.SixCRM.routes.path('entities', 'FeatureFlag.js'), class {
        constructor(){}
        get({id, range_key}){
          expect(id).to.be.a('string');
          expect(range_key).to.be.a('string');
          return Promise.resolve(feature_flag);
        }
      });

      const FeatureFlagHelperController = global.SixCRM.routes.include('helpers', 'entities/featureflag/FeatureFlag.js');
      let featureFlagHelperController = new FeatureFlagHelperController();

      let document = await featureFlagHelperController.getFeatureFlag({environment: 'development', account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c'});

      expect(document).to.have.property('environment');
      expect(document).to.have.property('account');
      expect(document.environment).to.equal('development');
      expect(document.account).to.equal('d3fa3bf3-7824-49f4-8261-87674482bf1c');

    });

    it('successfully retrieves feature flags default document when account is not found (environment-specific, account-specific)', async () => {

      let feature_flag = MockEntities.getValidFeatureFlag();
      feature_flag.environment = 'development';
      feature_flag.account = 'default';

      mockery.registerMock(global.SixCRM.routes.path('entities', 'FeatureFlag.js'), class {
        constructor(){}
        get({id, range_key}){
          expect(id).to.be.a('string');
          expect(range_key).to.be.a('string');
          if(range_key != 'default'){
            return Promise.resolve(null)
          }
          return Promise.resolve(feature_flag);
        }
      });

      const FeatureFlagHelperController = global.SixCRM.routes.include('helpers', 'entities/featureflag/FeatureFlag.js');
      let featureFlagHelperController = new FeatureFlagHelperController();

      let document = await featureFlagHelperController.getFeatureFlag({environment: 'development', account: '212341e0-f553-4a29-a74f-35fa06eb3d42'});

      expect(document).to.have.property('environment');
      expect(document).to.have.property('account');
      expect(document.environment).to.equal('development');
      expect(document.account).to.equal('default');

    });

    it('successfully retrieves feature flags default document when account is not found and environment is not found (environment-specific, account-specific)', async () => {

      let feature_flag = MockEntities.getValidFeatureFlag();
      feature_flag.environment = 'default';
      feature_flag.account = 'default';

      mockery.registerMock(global.SixCRM.routes.path('entities', 'FeatureFlag.js'), class {
        constructor(){}
        get({id, range_key}){
          expect(id).to.be.a('string');
          expect(range_key).to.be.a('string');
          if(range_key !== 'default' || id !== 'default'){
            return Promise.resolve(null)
          }
          return Promise.resolve(feature_flag);
        }
      });

      const FeatureFlagHelperController = global.SixCRM.routes.include('helpers', 'entities/featureflag/FeatureFlag.js');
      let featureFlagHelperController = new FeatureFlagHelperController();

      let document = await featureFlagHelperController.getFeatureFlag({environment: 'someenv', account: '212341e0-f553-4a29-a74f-35fa06eb3d42'});

      expect(document).to.have.property('environment');
      expect(document).to.have.property('account');
      expect(document.environment).to.equal('default');
      expect(document.account).to.equal('default');

    });

  });

});
