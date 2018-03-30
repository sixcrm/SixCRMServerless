const expect = require('chai').expect;
const TestUtils = require('./test-utils.js');

require('../../routes');

TestUtils.setEnvironmentVariables();
const AuthController = global.SixCRM.routes.include('controllers', 'authorizers/verifySiteJWT.js');
const authController = new AuthController();

xdescribe('verifySiteJWTController', function () {
    before(() => {
        TestUtils.setGlobalUser();
    });

    it('should not validate expired auth0 JWT', function () {
        return authController.execute(eventWithExpiredAuth0Jwt()).then(result => {
            expect(result).to.equal(false);
        });
    });

    // Technical Debt: JWT used in this test will expire at 05/29/2018 @ 4:02pm (UTC)
    it('should validate self-signed JWT', function () {
        return authController.execute(eventWithSelfSignedJwt()).then(result => {
            expect(result).to.equal('ljubomir@toptal.com');
        });
    });

    // Technical Debt: JWT used in this test will expire at 05/29/2018 @ 4:02pm (UTC)
    it('should not validate invalid self-signed JWT', function () {
        return authController.execute(eventWithInvalidSelfSignedJwt()).then(result => {
            expect(result).to.equal(false);
        });
    });

    function eventWithSelfSignedJwt() {
        return {
            authorizationToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL3NpeGNybS5hdXRoMC5jb20vIiwiaWF0IjoxNDk2MDczNzc5LCJleHAiOjE1Mjc2MDk3NzksImF1ZCI6Ind3dy5leGFtcGxlLmNvbSIsInN1YiI6Impyb2NrZXRAZXhhbXBsZS5jb20iLCJhbGlhcyI6ImY3MmI2NTYzMDk1ZjEyNDBmOWFjMmMwM2YyNTZjY2YzYTk0ZmFjODEiLCJlbWFpbCI6ImxqdWJvbWlyQHRvcHRhbC5jb20ifQ.1XHt5ERGaNLmontO2dAsE9wCYpsDzsDswDNParCxbiY'
        }
    }

    function eventWithInvalidSelfSignedJwt() {
        return {
            authorizationToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodabcczovL3NpeGNybS5hdXRoMC5jb20vIiwiaWF0IjoxNDk2MDczNzc5LCJleHAiOjE1Mjc2MDk3NzksImF1ZCI6Ind3dy5leGFtcGxlLmNvbSIsInN1YiI6Impyb2NrZXRAZXhhbXBsZS5jb20iLCJhbGlhcyI6ImY3MmI2NTYzMDk1ZjEyNDBmOWFjMmMwM2YyNTZjY2YzYTk0ZmFjODEiLCJlbWFpbCI6ImxqdWJvbWlyQHRvcHRhbC5jb20ifQ.1XHt5ERGaNLmontO2dAsE9wCYpsDzsDswDNParCxbiY'
        }
    }

    function eventWithExpiredAuth0Jwt() {
        return {
            authorizationToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImxqdWJvbWlyQHRvcHRhbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS8tWGRVSXFkTWtDV0EvQUFBQUFBQUFBQUkvQUFBQUFBQUFBQUEvNDI1MnJzY2J2NU0vcGhvdG8uanBnIiwiaXNzIjoiaHR0cHM6Ly9zaXhjcm0uYXV0aDAuY29tLyIsInN1YiI6Imdvb2dsZS1vYXV0aDJ8MTA3NTYyMDY0NDM2ODcyOTk1MTQ4IiwiYXVkIjoiSk0xdEMyajd0eWNidTYyZWwzb0JoeWtscE5iazV4NkYiLCJleHAiOjE0OTYxMTAzMDEsImlhdCI6MTQ5NjA3NDMwMX0.G2UWRr2PGW_z7F6FNKDm1hv0M6UltyGt00LRRpgChzI'
        }
    }

});

