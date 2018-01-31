'use strict';
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const rebillType = require('../../../rebill/rebillType');
const analyticsPaginationType = require('./../../paginationType');


module.exports.graphObj = new GraphQLObjectType({
    name: 'RebillsInQueueType',
    description: 'Rebills in queue',
    fields: () => ({
        rebills: {
            type: new GraphQLList(rebillType.graphObj),
            description: 'The rebills',
            resolve: (analytics_response) => {
                let rebillController = global.SixCRM.routes.include('entities', 'Rebill.js');

                if (!analytics_response || !analytics_response.summary) {
                    return Promise.resolve([]);
                }

                return Promise.all(analytics_response.summary.map((item) => rebillController.get({id: item.id_rebill})))
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
