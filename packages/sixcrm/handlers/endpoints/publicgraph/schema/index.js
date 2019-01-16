const GraphQLSchema = require('graphql').GraphQLSchema;
let mutationType = require('./types/mutationType');
let queryType = require('./types/queryType');

module.exports = new GraphQLSchema({
	query: queryType.graphObj,
	mutation: mutationType.graphObj,
	types: []
});
