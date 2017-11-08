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
});