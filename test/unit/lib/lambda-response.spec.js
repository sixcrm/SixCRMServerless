let LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');
let chai = require('chai');
let expect = chai.expect;

const anyCode = 200;
const anyBody = {};
const anyEvent = {};
const anyError = { code: 500, name:'Server Error', message: 'Internal Service Error.', issues: [] };

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

                expect(response).to.deep.equal(expectedResponse);
                done();
            });
        });

        it('should issue a response with a body', (done) => {
            // given
            let aCode = anyCode;
            let aBody = 'a_body';
            let expectedResponse = aResponseWithDefaultBody();

            expectedResponse.body = aBody;

            // when
            new LambdaResponse().issueResponse(aCode, aBody, (first, second) => {
                let response = second;

                expect(response).to.deep.equal(expectedResponse);
                done();
            });
        });

        it('should issue an error', (done) => {
            // given
            let anEvent = anyEvent;
            let anError = anyError;
            let expectedResponse = anyErrorResponse();

            // when
            new LambdaResponse().issueError(anError, anEvent, (first, second) => {
                let response = second;

                // then
                expect(response).to.deep.equal(expectedResponse);
                done();
            });
        });

        it('should issue an error when nested message provided', (done) => {
            // given
            let anEvent = anyEvent;
            let anError = anyError;
            let expectedResponse = anyErrorResponse();

            // when
            new LambdaResponse().issueError(anError, anEvent, (first, second) => {
                let response = second;

                // then
                expect(response).to.deep.equal(expectedResponse);
                done();
            });
        });

        it('should issue an error with generic message when no message provided', (done) => {
            // given
            let anEvent = anyEvent;
            let anError = anyError;
            let expectedResponse = anErrorResponseWithGenericMessage();

            // when
            new LambdaResponse().issueError(anError, anEvent, (first, second) => {
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
            body: JSON.stringify({
              success: false,
              code: 500,
              response: null,
              error_type: "Server Error",
              message: "Internal Service Error."
            })
        };
    }

    function anyErrorResponse() {
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body:JSON.stringify({
              success:false,
              code:500,
              response:null,
              error_type: "Server Error",
              message: "Internal Service Error.",
              issues:[]
            })
        };
    }

    function anErrorResponseWithGenericMessage() {
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
              success:false,
              code:500,
              response:null,
              error_type: "Server Error",
              message: "Internal Service Error.",
              issues:[]
            })
        };
    }
});
