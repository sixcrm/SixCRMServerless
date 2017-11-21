const chai = require('chai');
const expect = chai.expect;

describe('lib/jwt-utilities', () => {

    describe('createJWTContents', () => {

        it('throws error when JWT type is unexpected', () => {

            const jwtutilities = global.SixCRM.routes.include('lib', 'jwt-utilities.js');

            jwtutilities.jwt_type = 'invalid_type';

            try{
                jwtutilities.createJWTContents({user: 'a_user'})
            }catch(error){
                expect(error.message).to.equal('[500] Unrecognized JWT Type.');
            }
        });
    });

    describe('getUserEmail', () => {

        it('throws error when user email is undefined', () => {

            const jwtutilities = global.SixCRM.routes.include('lib', 'jwt-utilities.js');

            try{
                jwtutilities.getUserEmail({user: 'a_user'})
            }catch(error){
                expect(error.message).to.equal('[500] Unable to get user email.');
            }
        });
    });

    describe('getJWTType', () => {

        it('throws error when user email is undefined', () => {

            const jwtutilities = global.SixCRM.routes.include('lib', 'jwt-utilities.js');

            delete jwtutilities.jwt_type;

            try{
                jwtutilities.getJWTType()
            }catch(error){
                expect(error.message).to.equal('[500] Unset jwt_type property.');
            }
        });
    });

    describe('validateInput', () => {

        it('throws error when validation function is not a function', () => {

            const jwtutilities = global.SixCRM.routes.include('lib', 'jwt-utilities.js');

            try{
                jwtutilities.validateInput({}, 'not_a_function')
            }catch(error){
                expect(error.message).to.equal('[500] Validation function is not a function.');
            }
        });

        it('throws error when object is undefined', () => {

            const jwtutilities = global.SixCRM.routes.include('lib', 'jwt-utilities.js');

            try{
                jwtutilities.validateInput(null, function () {})
            }catch(error){
                expect(error.message).to.equal('[500] Undefined object input.');
            }
        });
    });

    describe('getSigningKey', () => {

        it('throws error when transaction JWT secret key is not defined', () => {

            const jwtutilities = global.SixCRM.routes.include('lib', 'jwt-utilities.js');

            jwtutilities.jwt_type = 'transaction';
            jwtutilities.jwt_parameters = {};

            try{
                jwtutilities.getSigningKey()
            }catch(error){
                expect(error.message).to.equal('[500] Transaction JWT secret key is not defined.');
            }
        });

        it('throws error when site JST secret key is not defined', () => {

            const jwtutilities = global.SixCRM.routes.include('lib', 'jwt-utilities.js');

            jwtutilities.jwt_type = 'site';
            jwtutilities.jwt_parameters = {};

            try{
                jwtutilities.getSigningKey()
            }catch(error){
                expect(error.message).to.equal('[500] Site JST secret key is not defined.');
            }
        });
    });

    describe('getUserAlias', () => {

        it('returns user alias', () => {

            const jwtutilities = global.SixCRM.routes.include('lib', 'jwt-utilities.js');

            expect(jwtutilities.getUserAlias({user_alias: 'an_alias'})).to.equal('an_alias');
        });

        it('returns null when user alias, id and email are not defined', () => {

            const jwtutilities = global.SixCRM.routes.include('lib', 'jwt-utilities.js');

            expect(jwtutilities.getUserAlias()).to.equal(null);
        });
    });
});