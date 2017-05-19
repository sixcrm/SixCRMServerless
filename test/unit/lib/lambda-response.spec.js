let LambdaResponse = global.routes.include('lib', 'lambda-response.js');
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
            new LambdaResponse().issueResponse(aCode, aBody, (first, second) => {
                let response = second;

                // then
                expect(response).to.deep.equal(expectedResponse);
                done();
            });
        });

        it('should issue a response with a default code when no code provided', (done) => {
            // given
            let aCode = null;
            let aBody = anyBody;
            let expectedResponse = aResponseWithDefaultCode();

            // when
            new LambdaResponse().issueResponse(aCode, aBody, (first, second) => {
                let response = second;

                // then
                expect(response).to.deep.equal(expectedResponse);
                done();
            });
        });

        it('should issue a response with a default body when no body provided', (done) => {
            // given
            let aCode = anyCode;
            let aBody = null;
            let expectedResponse = aResponseWithDefaultBody();

            // when
            new LambdaResponse().issueResponse(aCode, aBody, (first, second) => {
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
            new LambdaResponse().issueError(aMessage, aCode, anEvent, anError, (first, second) => {
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
            new LambdaResponse().issueError(aMessage, aCode, anEvent, anError, (first, second) => {
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
            new LambdaResponse().issueError(aMessage, aCode, anEvent, anError, (first, second) => {
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

    function aResponseWithDefaultBody() {
        return {
            statusCode: anyCode,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: 'An unexpected error occurred.'
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
