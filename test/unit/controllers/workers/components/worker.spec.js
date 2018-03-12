const chai = require("chai");
const expect = chai.expect;
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidMessage(){
    return MockEntities.getValidMessage()
}

describe('controllers/workers/components/worker.js', function () {

    describe('constructor', () => {

        it('successfully constructs', () => {

            const WorkerController = global.SixCRM.routes.include('workers', 'components/worker.js');
            let workerController = new WorkerController();

            expect(objectutilities.getClassName(workerController)).to.equal('workerController');
        });
    });

    describe('setMessage', () => {

        it('returns unchanged message when message is specified', () => {

            let message = getValidMessage();

            const WorkerController = global.SixCRM.routes.include('workers', 'components/worker.js');
            let workerController = new WorkerController();

            expect(workerController.setMessage(message)).to.equal(message);
        });

        it('retrieves message when message is not specified', () => {

            let message = getValidMessage();

            const WorkerController = global.SixCRM.routes.include('workers', 'components/worker.js');
            let workerController = new WorkerController();

            workerController.parameters.set('message', message);

            expect(workerController.setMessage()).to.equal(message);
        });
    });

    describe('setResponseField', () => {

        it('returns response field unchanged when response field is specified', () => {

            const WorkerController = global.SixCRM.routes.include('workers', 'components/worker.js');
            let workerController = new WorkerController();

            expect(workerController.setResponseField('a_response_field')).to.equal('a_response_field');
        });

        it('returns previously set response field when response field is not specified', () => {

            const WorkerController = global.SixCRM.routes.include('workers', 'components/worker.js');
            let workerController = new WorkerController();

            workerController.response_field = 'a_response_field';

            expect(workerController.setResponseField()).to.equal('a_response_field');
        });

        it('returns default response field when response field is not specified nor previously set', () => {

            const WorkerController = global.SixCRM.routes.include('workers', 'components/worker.js');
            let workerController = new WorkerController();

            delete workerController.response_field;

            expect(workerController.setResponseField()).to.equal('id');
        });
    });
});