const GraphQLList = require('graphql').GraphQLList;
const sessionController = require('../../../../controllers/Session.js');
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
let sessionInterface = require('./sessionInterface');
let campaignType = require('./campaignType');
let rebillType = require('./rebillType');
let productScheduleType = require('./productScheduleType');
let customerType = require('./customerType');


module.exports.graphObj = new GraphQLObjectType({
    name: 'Session',
    description: 'A record denoting a customer, a group of products and corresponding transactions.',
    fields: () => ({
        id: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The id of the session.',
        },
        completed: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'A boolean string denoting that that session has otherwise been completed or expired.',
        },
        customer: {
            type: customerType.graphObj,
            description: 'The customer record that the session references.',
            resolve: session => sessionController.getCustomer(session),
        },
        product_schedules: {
            type: new GraphQLList(productScheduleType.graphObj),
            description: 'The product schedules associated with the session',
            resolve: session => sessionController.getProductSchedules(session),
        },
        rebills: {
            type: new GraphQLList(rebillType.graphObj),
            description: 'The rebills associated with the session',
            resolve: function(session){
      	 return sessionController.getRebills(session);
            }
        },
        campaign: {
            type: campaignType.graphObj,
            description: 'The campaign associated with the session',
            resolve: function(session){
      	return sessionController.getCampaign(session);
            }
        },
        created_at: {
	  type: new GraphQLNonNull(GraphQLString),
            description: 'ISO8601 datetime when the entity was created.',
        },
        updated_at: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'ISO8601 datetime when the entity was updated.',
        }
    }),
    interfaces: [sessionInterface.graphObj]
});
