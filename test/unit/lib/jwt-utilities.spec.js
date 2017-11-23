const chai = require('chai');
const expect = chai.expect;
const mockery = require('mockery');

describe('lib/jwt-utilities', () => {

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

        it('throws error when JWT type is not valid', () => {

            const jwtutilities = global.SixCRM.routes.include('lib', 'jwt-utilities.js');

            jwtutilities.jwt_type = 'unrecognized_type'; //invalid jwt type

            try{
                jwtutilities.getSigningKey()
            }catch(error){
                expect(error.message).to.equal('[500] Unrecognized JWT Type.');
            }
        });
    });

    describe('setJWTType', () => {

        it('throws error when jwt type is invalid', () => {

            const jwtutilities = global.SixCRM.routes.include('lib', 'jwt-utilities.js');

            jwtutilities.jwt_type = 'unrecognized_type'; //invalid jwt type

            try{
                jwtutilities.setJWTType('unrecognized_type')
            }catch(error){
                expect(error.message).to.equal('[500] Unrecognized JWT Type.');
            }
        });
    });

    describe('signJWT', () => {

        it('returns response from jwt sign', () => {

            mockery.registerMock('jsonwebtoken', {
                sign: () => {
                    return 'a_jwt';
                }
            });

            const jwtutilities = global.SixCRM.routes.include('lib', 'jwt-utilities.js');

            jwtutilities.jwt_type = 'site'; //valid value

            //secret key with example value
            jwtutilities.jwt_parameters = {site_jwt_secret_key: 'a_key'};

            expect(jwtutilities.signJWT('a_body')).to.equal('a_jwt');
        });
    });

    describe('getUserAlias', () => {

        it('returns user alias', () => {

            const jwtutilities = global.SixCRM.routes.include('lib', 'jwt-utilities.js');

            expect(jwtutilities.getUserAlias({user_alias: 'an_alias'})).to.equal('an_alias');
        });

        it('returns user alias based on user id', () => {

            mockery.registerMock(global.SixCRM.routes.path('lib', 'munge-utilities.js'), {
                munge: () => {
                    return 'a_munge_string'
                }
            });

            const jwtutilities = global.SixCRM.routes.include('lib', 'jwt-utilities.js');

            expect(jwtutilities.getUserAlias({id: 'an_id'})).to.equal('a_munge_string');
        });

        it('returns user alias based on user email', () => {

            mockery.registerMock(global.SixCRM.routes.path('lib', 'munge-utilities.js'), {
                munge: () => {
                    return 'a_munge_string'
                }
            });

            const jwtutilities = global.SixCRM.routes.include('lib', 'jwt-utilities.js');

            expect(jwtutilities.getUserAlias({email: 'an_email'})).to.equal('a_munge_string');
        });

        it('returns null when user alias, id and email are not defined', () => {

            const jwtutilities = global.SixCRM.routes.include('lib', 'jwt-utilities.js');

            expect(jwtutilities.getUserAlias()).to.equal(null);
        });
    });
});