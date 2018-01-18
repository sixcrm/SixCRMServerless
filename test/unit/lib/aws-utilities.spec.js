const chai = require('chai');
const expect = chai.expect;

const AWSUtilities = global.SixCRM.routes.include('lib', 'aws-utilities.js');

describe('lib/aws-utilities', () => {

    describe('AWSCallback', () => {

        it('successfully returns data when there is no server error', () => {

            let fail = false;

            let data = 'test';

            const awsutilities = new AWSUtilities();

            expect(awsutilities.AWSCallback(fail, data)).to.equal(data);
        });

        it('returns server error when callback was unsuccessful', () => {

            let fail = 'fail';

            const awsutilities = new AWSUtilities();

            try{
                awsutilities.AWSCallback(fail);
            }catch(error){
                expect(error.message).to.equal('[500] ' + fail);
            }
        });
    });

    describe('tolerantCallback', () => {

        it('successfully returns data when there is no server error', () => {

            let fail = false;

            let data = 'test';

            const awsutilities = new AWSUtilities();

            return awsutilities.tolerantCallback(fail, data).then((result) => {
                expect(result).to.equal(data);
            })
        });

        it('returns error when callback was unsuccessful', () => {

            let fatal = false;

            let data = 'test';

            let fail = new Error('fail');

            const awsutilities = new AWSUtilities();

            return awsutilities.tolerantCallback(fail, data, fatal).catch((error) => {
                expect(error.message).to.equal('fail');
            });
        });

        it('returns server error when callback was unsuccessful', () => {

            let data = 'test';

            let fail = 'fail';

            const awsutilities = new AWSUtilities();

            try{
                awsutilities.tolerantCallback(fail, data);
            }catch(error){
                expect(error.message).to.equal('[500] ' + fail);
            }
        });
    });

    describe('hasCredentials', () => {

      let _process_env = null;

      before(() => {
        _process_env = process.env;
      });

      after(() => {
        process.env = _process_env;
      });

      beforeEach(() => {
        process.env.AWS_ACCOUNT = '123';
        process.env.AWS_REGION = '123';
        process.env.AWS_ACCESS_KEY_ID = '123';
        process.env.AWS_SECRET_ACCESS_KEY = '123';
      });

      afterEach(() => {
        delete process.env.AWS_ACCOUNT;
        delete process.env.AWS_REGION;
        delete process.env.AWS_ACCESS_KEY_ID;
        delete process.env.AWS_SECRET_ACCESS_KEY;
      });

      it('returns true when all credentials are present', () => {

        const awsutilities = new AWSUtilities();

        let result = awsutilities.hasCredentials();

        expect(result).to.equal(true);

      });

      it('returns a error when some credentials are not present', () => {

        delete process.env.AWS_ACCOUNT;

        const awsutilities = new AWSUtilities();

        try{
          let result = awsutilities.hasCredentials();
        }catch(error){
          expect(error.message).to.equal('[500] Missing Credentials in process.env');
        }

      });

      it('returns a error when all credentials are not present', () => {

        delete process.env.AWS_ACCOUNT;
        delete process.env.AWS_REGION;
        delete process.env.AWS_ACCESS_KEY_ID;
        delete process.env.AWS_SECRET_ACCESS_KEY;

        const awsutilities = new AWSUtilities();

        try{
          let result = awsutilities.hasCredentials();
        }catch(error){
          expect(error.message).to.equal('[500] Missing Credentials in process.env');
        }

      });

      it('returns false when some credentials are not present and fatal is false', () => {

        delete process.env.AWS_SECRET_ACCESS_KEY;

        const awsutilities = new AWSUtilities();

        let result = awsutilities.hasCredentials(false);

        expect(result).to.equal(false);

      });

    });

});
