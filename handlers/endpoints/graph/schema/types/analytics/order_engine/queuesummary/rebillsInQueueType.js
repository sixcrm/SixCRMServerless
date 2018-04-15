
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const rebillType = require('../../../rebill/rebillType');
const analyticsPaginationType = require('./../../paginationType');
const RebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');

module.exports.graphObj = new GraphQLObjectType({
    name: 'RebillsInQueueType',
    description: 'Rebills in queue',
    fields: () => ({
        rebills: {
            type: new GraphQLList(rebillType.graphObj),
            description: 'The rebills',
            resolve: (analytics_response) => {
                let rebillController = new RebillController();

                if (!analytics_response || !analytics_response.summary) {
                    return Promise.resolve([]);
                }

                return Promise.all(analytics_response.summary.map((item) => rebillController.get({id: item.id})))
                    .then((rebills) => rebills.filter(item => item !== null))

            }
        },
        pagination: {
            type: new GraphQLNonNull(analyticsPaginationType.graphObj),
            description: ''
        }
    }),
    interfaces: []
});
