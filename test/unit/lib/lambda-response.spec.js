let LambdaResponse = require('../../../lib/lambda-response');
let chai = require('chai');
let expect = chai.expect;

const anyMessage = 'a message';
const anyCode = 200;
const anyBody = {};
const anyEvent = {};
const anyIssues = [];
const anyError = { issues: [] };

describe('lib/lambda-response', () => {
    describe('response', () => {

        it('should issue a response', (done) => {
            // given
            let aCode = anyCode;
            let aBody = anyBody;
            let expectedResponse = anyResponse();

            // when
            LambdaResponse.issueResponse(aCode, aBody, (first, second) => {
                let response = second;

                // then
                expect(response).to.deep.equal(expectedResponse);
                done();
            });
        });

        xit('should issue a response with a default code when no code provided', (done) => {
            // given
            let aCode = null;
            let aBody = anyBody;
            let expectedResponse = aResponseWithDefaultCode();

            // when
            LambdaResponse.issueResponse(aCode, aBody, (first, second) => {
                let response = second;

                // then
                expect(response).to.deep.equal(expectedResponse);
                done();
            });
        });

        it('should issue an error', (done) => {
            // given
            let aMessage = anyMessage;
            let aCode = anyCode;
            let anEvent = anyEvent;
            let anError = anyError;
            let expectedResponse = anyErrorResponse();

            // when
            LambdaResponse.issueError(aMessage, aCode, anEvent, anError, (first, second) => {
                let response = second;

                // then
                expect(response).to.deep.equal(expectedResponse);
                done();
            });
        });

        it('should issue an error when nested message provided', (done) => {
            // given
            let aMessage = { message: 'a message' };
            let aCode = anyCode;
            let anEvent = anyEvent;
            let anError = anyError;
            let expectedResponse = anyErrorResponse();

            // when
            LambdaResponse.issueError(aMessage, aCode, anEvent, anError, (first, second) => {
                let response = second;

                // then
                expect(response).to.deep.equal(expectedResponse);
                done();
            });
        });

        it('should issue an error with generic message when no message provided', (done) => {
            // given
            let aMessage = '';
            let aCode = anyCode;
            let anEvent = anyEvent;
            let anError = anyError;
            let expectedResponse = anErrorResponseWithGenericMessage();

            // when
            LambdaResponse.issueError(aMessage, aCode, anEvent, anError, (first, second) => {
                let response = second;

                // then
                expect(response).to.deep.equal(expectedResponse);
                done();
            });
        });

    });

    function anyResponse() {
        return {
            statusCode: anyCode,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: '{}'
        };
    }

    function aResponseWithDefaultCode() {
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: '{}'
        };
    }

    function anyErrorResponse() {
        return {
            statusCode: anyCode,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                message: anyMessage,
                issues: anyIssues
            })
        };
    }

    function anErrorResponseWithGenericMessage() {
        return {
            statusCode: anyCode,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                message: 'An unexpected error occurred.',
                issues: anyIssues
            })
        };
    }
});
