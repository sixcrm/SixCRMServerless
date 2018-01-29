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
            resolve: (rebill_ids) => {
                let rebillController = global.SixCRM.routes.include('entities', 'Rebill.js');
                let rebills = [];

                if (rebill_ids) {
                    rebills = rebill_ids.map((rebilll_id) => rebillController.get({id: rebilll_id}));
                }

                return Promise.all(rebills);
            }
        },
        pagination: {
            type: new GraphQLNonNull(analyticsPaginationType.graphObj),
            description: ''
        }
    }),
    interfaces: []
});
