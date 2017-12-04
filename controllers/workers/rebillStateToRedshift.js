'use strict';

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const workerController = global.SixCRM.routes.include('controllers', 'workers/components/worker.js');
const kinesisfirehoseutilities = global.SixCRM.routes.include('lib', 'kinesis-firehose-utilities');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const timestamp = global.SixCRM.routes.include('lib','timestamp.js');

module.exports = class RebillStateToRedshiftController extends workerController {

    constructor(){
        super();

        this.parameter_validation = {
            'rebills': global.SixCRM.routes.path('model', 'entities/components/rebills.json'),
            'transformedrebills': global.SixCRM.routes.path('model', 'entities/components/transformedrebills.json')
        };

        this.augmentParameters();
    }

    execute(){

        du.debug('Executing Rebill State To Redshift');

        return this.getRebills()
          .then(() => this.transformRebills())
          .then(() => this.pushToRedshift())
          .then(() => this.feedback())

    }

    feedback(){

        du.debug('Feedback');

        const response = this.parameters.get('rebills').length === 0 ? 'No Data Uploaded' : 'Rebills State Data Uploaded.';

        return Promise.resolve(response);

    }

    getRebills() {

        if (!this.rebillController) {
            this.rebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');
        }

        const changed_after = timestamp.getLastHourInISO8601();
        const changed_before = timestamp.getThisHourInISO8601();

        return this.rebillController.listByState({state_changed_after: changed_after, state_changed_before: changed_before}).then((rebills) =>{
            this.parameters.set('rebills', rebills);

            return Promise.resolve(true);
        })
    }

    pushToRedshift() {

        let transformedRebills = this.parameters.get('transformedrebills');

        let promises = arrayutilities.map(transformedRebills, (rebill) => {
            return kinesisfirehoseutilities.putRecord('rebills', rebill);
        });

        return Promise.all(promises).then((results) => {
            du.debug('Rebills Uploaded to Kenesis, count:', results.length);

            return Promise.resolve(true);
        })
    }

    transformRebills() {
        let rebills = this.parameters.get('rebills');

        let transformed_rebills = arrayutilities.map(rebills, (rebill) => {
            return {
                id_rebill: rebill.id,
                current_queuename: rebill.state,
                previous_queuename: rebill.previous_state,
                account: rebill.account,
                datetime: rebill.state_changed_at
            }
        });

        this.parameters.set('transformedrebills', transformed_rebills);

        return Promise.resolve();
    }

};
