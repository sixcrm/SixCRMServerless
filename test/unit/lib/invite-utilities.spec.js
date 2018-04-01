'use strict';

//const mockery = require('mockery');
//const chai = require('chai');
//const expect = chai.expect;

//const inviteutilities = global.SixCRM.routes.include('lib', 'invite-utilities.js');
/*
xdescribe('lib/invite-utilities', () => {

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

    describe('buildInviteLink', () => {

        let stage;

        beforeEach(() => {
            stage = global.SixCRM.configuration.stage;
        });

        afterEach(() => {
            global.SixCRM.configuration.stage = stage;
        });


        it('builds link for development', () => {

            global.SixCRM.configuration.stage = 'development';

            expect(inviteutilities.buildInviteLink('parameters', 'token'))
                .to.equal('https://development-admin.sixcrm.com/acceptinvite?t=token&p=parameters');

        });

        it('builds link for staging', () => {

            global.SixCRM.configuration.stage = 'staging';

            expect(inviteutilities.buildInviteLink('parameters', 'token'))
                .to.equal('https://staging-admin.sixcrm.com/acceptinvite?t=token&p=parameters');

        });

        it('builds link for production', () => {

            global.SixCRM.configuration.stage = 'production';

            expect(inviteutilities.buildInviteLink('parameters', 'token'))
                .to.equal('https://admin.sixcrm.com/acceptinvite?t=token&p=parameters');

        });

    });

    describe('encodedParametersToObject', () => {

        it('instantiates an object from encoded parameters', () => {

            let encoded_parameters = getEncodedParameters();

            expect(inviteutilities.encodedParametersToObject(encoded_parameters))
                .to.deep.equal({
                email: 'alice@example.com',
                acl: 'acl',
                invitor: 'bob@example.com',
                account: '*',
                role: 'role',
                timestamp: '1487768599196'
            });

        });

    });

    describe('buildPreEncryptedString', () => {

        it('serializes an object into colon-separated string', () => {

            expect(inviteutilities.buildPreEncryptedString(getInviteObject(), 1487768599196))
                .to.deep.equal('alice@example.com:acl:bob@example.com:*:role:1487768599196');

        });

    });

    describe('decodeAndValidate', () => {

        it('rejects when token does not match', () => {

            return inviteutilities.decodeAndValidate('invalid_token', 'parameters').catch((error) => {
                expect(error.message).to.equal('[500] Invalid invite.');
            });

        });

    });

    describe('encodeParameters', () => {

        it('encodes', () => {

            expect(inviteutilities.encodeParameters(getParameters()))
                .to.deep.equal('YWxpY2VAZXhhbXBsZS5jb206YWNsOmJvYkBleGFtcGxlLmNvbToqOnJvbGU6MTQ4Nzc2ODU5OTE5Ng==');

        });

    });

    describe('invite', () => {

        it('invites', () => {

            mockery.registerMock(global.SixCRM.routes.path('helpers', 'email/SystemMailer.js'), class {
                sendEmail() {
                    return Promise.resolve({});
                }
            });

            const inviteutilities = global.SixCRM.routes.include('lib', 'invite-utilities.js');

            return inviteutilities.invite(getInviteObject()).then((response) => {
                expect(response).to.contain('https://');
            });

        });

        it('throws error when sending mail fails', () => {

            mockery.registerMock(global.SixCRM.routes.path('helpers', 'email/SystemMailer.js'), class {
                sendEmail() {
                    return Promise.reject(new Error('Sending failed.'));
                }
            });

            const inviteutilities = global.SixCRM.routes.include('lib', 'invite-utilities.js');

            return inviteutilities.invite(getInviteObject()).catch((error) => {
                expect(error.message).to.equal('Sending failed.');
            });

        });

    });

});

function getInviteObject() {
    return {
        email: 'alice@example.com',
        acl: 'acl',
        invitor: 'bob@example.com',
        account: '*',
        role: 'role'
    }
}

function getEncodedParameters() {
    // alice@example.com:acl:bob@example.com:*:role:1487768599196
    return 'YWxpY2VAZXhhbXBsZS5jb206YWNsOmJvYkBleGFtcGxlLmNvbToqOnJvbGU6MTQ4Nzc2ODU5OTE5Ng==;';
}

function getParameters() {
    // YWxpY2VAZXhhbXBsZS5jb206YWNsOmJvYkBleGFtcGxlLmNvbToqOnJvbGU6MTQ4Nzc2ODU5OTE5Ng==
    return 'alice@example.com:acl:bob@example.com:*:role:1487768599196'
}
*/
