'use strict';

let chai = require('chai');
let expect = chai.expect;

const mockery = require('mockery');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const hashutilities = global.SixCRM.routes.include('lib', 'hash-utilities.js');
const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const random = global.SixCRM.routes.include('lib','random.js');

describe('controllers/helpers/resources/accountimages/AccountImages.js', () => {

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

  describe('constructor', () => {

    it('successfully constructs', () => {

      const AccountImagesHelperController = global.SixCRM.routes.include('helpers', 'resources/accountimages/AccountImages.js');
      let accountImagesHelperController = new AccountImagesHelperController();

      expect(objectutilities.getClassName(accountImagesHelperController)).to.equal('AccountImages');

    });

  });

  describe('getAccountImageUploadPrefix', () => {

    let global_account;

    before(() => {
      global_account = global.account;
    });

    after(() => {
      global.account = global_account;
    });

    it('returns a good prefix', () => {

      global.account = 'abc123';

      const AccountImagesHelperController = global.SixCRM.routes.include('helpers', 'resources/accountimages/AccountImages.js');
      let accountImagesHelperController = new AccountImagesHelperController();

      expect(accountImagesHelperController.getAccountImageUploadPrefix()).to.equal('abc123/user/images');

    });

  });

  describe('createImageFilename', () => {

    it('successfully creates a image filename', () => {

      const AccountImagesHelperController = global.SixCRM.routes.include('helpers', 'resources/accountimages/AccountImages.js');
      let accountImagesHelperController = new AccountImagesHelperController();

      return fileutilities.getFileContents('test/resources/kermit.jpg', null).then(image_data => {

        let base64_data = hashutilities.toSHA1(image_data);

        expect(accountImagesHelperController.createImageFilename(base64_data, image_data)).to.equal('1224fadd85a33345d841ed6a61e6c8731e494cfb.jpg');

      });

    });

  });

  describe('uploadImageToS3', () => {

    let global_account;

    before(() => {
      global_account = global.account;
    });

    after(() => {
      global.account = global_account;
    });

    it('successfully uploads image to S3', () => {

      process.env.TEST_MODE = false;
      global.account = 'unittest';

      mockery.registerMock(global.SixCRM.routes.path('lib', 's3-utilities.js'), {
        putObject: () => {
          return Promise.resolve({ETag:random.createRandomString(20)});
        }
      });

      const AccountImagesHelperController = global.SixCRM.routes.include('helpers', 'resources/accountimages/AccountImages.js');
      let accountImagesHelperController = new AccountImagesHelperController();

      return fileutilities.getFileContents('test/resources/kermit.jpg', null).then(image_data => {

        let base64_image_data = new Buffer(image_data).toString('base64');

        accountImagesHelperController.parameters.set('base64imagedata', base64_image_data);

        return accountImagesHelperController.uploadImageToS3().then(result => {

          expect(result).to.have.property('path');
          expect(result).to.have.property('filename');

        });

      });

    });

  });

  describe('upload', () => {

    let global_account;
    let process_env;

    before(() => {
      global_account = global.account;
      process_env = process.env;
    });

    after(() => {
      global.account = global_account;
      process.env = process_env;
    });

    it('successfully uploads a image to s3', () => {

      process.env.TEST_MODE = false;
      global.account = 'unittest';

      mockery.registerMock(global.SixCRM.routes.path('lib', 's3-utilities.js'), {
        putObject: () => {
          return Promise.resolve({ETag:random.createRandomString(20)});
        }
      });

      const AccountImagesHelperController = global.SixCRM.routes.include('helpers', 'resources/accountimages/AccountImages.js');
      let accountImagesHelperController = new AccountImagesHelperController();

      return fileutilities.getFileContents('test/resources/kermit.jpg', null).then(image_data => {

        let base64_image_data = new Buffer(image_data).toString('base64');

        return accountImagesHelperController.upload({data: base64_image_data}).then(result => {

          expect(result).to.have.property('path');
          expect(result).to.have.property('filename');

        });

      });

    });

  });

});
