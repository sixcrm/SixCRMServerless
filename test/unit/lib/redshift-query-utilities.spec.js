const chai = require('chai');
const expect = chai.expect;

describe('lib/redshift-query-utilities', () => {

    describe('transformResult', () => {

        it('successfully transforms result', () => {

            const redshiftQueryUtilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

            expect(redshiftQueryUtilities.transformResult([{a_result: 'any_data'}]))
                .to.deep.equal([{a_result: 'any_data'}]);
        });

        it('returns data from rows when result has rows property', () => {

            const redshiftQueryUtilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

            //result has rows property
            expect(redshiftQueryUtilities.transformResult({rows: 'any_data'}))
                .to.equal('any_data');
        });

        it('throws error when rows property is not set', () => {

            const redshiftQueryUtilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

            //result is missing rows property
            try {
                redshiftQueryUtilities.transformResult({not_rows: 'any_data'})
            }catch(error){
                expect(error.message).to.equal('[500] Result does not have rows property');
            }
        });

        it('throws error when result is unrecognized return type', () => {

            const redshiftQueryUtilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

            //result is missing rows property
            try {
                redshiftQueryUtilities.transformResult('any_data')
            }catch(error){
                expect(error.message).to.equal('[500] Unrecognized return type');
            }
        });
    });

    describe('queryRaw', () => {

        it('throws error when redshift connection is not set', () => {

            const redshiftQueryUtilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

            delete redshiftQueryUtilities.redshift_connection;

            return redshiftQueryUtilities.queryRaw().catch((error) => {
                expect(error.message).to.equal('[500] Unset redshift_connection.');
            });
        });

        it('throws error when redshift query wasn\'t successfull', () => {

            const redshiftQueryUtilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

            redshiftQueryUtilities.redshift_connection = 'a_connection';

            return redshiftQueryUtilities.queryRaw().catch((error) => {
                expect(error.message).to.equal('[500] Unable to query redshift.');
            });
        });

        it('throws error from redshift connection query', () => {

            const redshiftQueryUtilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

            redshiftQueryUtilities.redshift_connection = 'a_connection';

            redshiftQueryUtilities.redshift_connection = {
                query: (query, params, callback) => {
                    callback('fail', null);
                }
            };

            return redshiftQueryUtilities.queryRaw('a_query', 'any_parameters').catch((error) => {
                expect(error.message).to.equal('[500] fail');
            });
        });

        it('returns data from redshift connection query', () => {

            let data = [{a_result: 'any_data'}];

            const redshiftQueryUtilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

            redshiftQueryUtilities.redshift_connection = 'a_connection';

            redshiftQueryUtilities.redshift_connection = {
                query: (query, params, callback) => {
                    callback(null, data);
                }
            };

            return redshiftQueryUtilities.queryRaw('a_query', 'any_parameters').then((result) => {
                expect(result).to.deep.equal(data);
            });
        });
    });

    describe('openConnection', () => {

        it('throws error when redshift connection is not set', () => {

            const redshiftQueryUtilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

            delete redshiftQueryUtilities.redshift_connection;

            return redshiftQueryUtilities.openConnection().catch((error) => {
                expect(error.message).to.equal('[500] Unset redshift_connection.');
            });
        });

        it('throws error when redshift connection wasn\'t successfull', () => {

            const redshiftQueryUtilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

            redshiftQueryUtilities.redshift_connection = 'a_connection';

            return redshiftQueryUtilities.openConnection().catch((error) => {
                expect(error.message).to.equal('[500] redshift_connection.connect is not a function.');
            });
        });

        it('throws error from redshift connection connect', () => {

            const redshiftQueryUtilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

            redshiftQueryUtilities.redshift_connection = 'a_connection';

            redshiftQueryUtilities.redshift_connection = {
                connect: (callback) => {
                    callback('fail');
                }
            };

            return redshiftQueryUtilities.openConnection().catch((error) => {
                expect(error.message).to.equal('[500] fail');
            });
        });

        it('returns true when connected successfully', () => {

            const redshiftQueryUtilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

            redshiftQueryUtilities.redshift_connection = 'a_connection';

            redshiftQueryUtilities.redshift_connection = {
                connect: (callback) => {
                    callback(null);
                }
            };

            return redshiftQueryUtilities.openConnection().then((result) => {
                expect(result).to.be.true
            });
        });
    });

    describe('closeConnection', () => {

        it('throws error when redshift connection is not set', () => {

            const redshiftQueryUtilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

            delete redshiftQueryUtilities.redshift_connection;

            return redshiftQueryUtilities.closeConnection().catch((error) => {
                expect(error.message).to.equal('[500] Unset redshift_connection.');
            });
        });

        it('throws error when closing redshift connection wasn\'t successfull', () => {

            const redshiftQueryUtilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

            redshiftQueryUtilities.redshift_connection = 'a_connection';

            return redshiftQueryUtilities.closeConnection().catch((error) => {
                expect(error.message).to.equal('[500] redshift_connection.end is not a function.');
            });
        });

        it('throws error from redshift connection end', () => {

            const redshiftQueryUtilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

            redshiftQueryUtilities.redshift_connection = 'a_connection';

            redshiftQueryUtilities.redshift_connection = {
                end: (callback) => {
                    callback('fail');
                }
            };

            return redshiftQueryUtilities.closeConnection().catch((error) => {
                expect(error).to.equal('fail');
            });
        });

        it('returns true when connection was closed successfully', () => {

            const redshiftQueryUtilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

            redshiftQueryUtilities.redshift_connection = 'a_connection';

            redshiftQueryUtilities.redshift_connection = {
                end: (callback) => {
                    callback(null);
                }
            };

            return redshiftQueryUtilities.closeConnection().then((result) => {
                expect(result).to.be.true
            });
        });
    });

    describe('instantiateRedshift', () => {

        it('throws error if redshift configuration parameter is missing', () => {

            const redshiftQueryUtilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

            redshiftQueryUtilities.required_configuration = ['a_param'];

            delete redshiftQueryUtilities.redshift_configuration;

            try {
                redshiftQueryUtilities.instantiateRedshift()
            }catch(error){
                expect(error.message).to.equal('[500] Redshift connection errors: Missing Redshift configuration parameter: a_param');
            }
        });
    });
});
