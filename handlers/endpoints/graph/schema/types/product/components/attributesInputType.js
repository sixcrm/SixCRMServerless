
const GraphQLList = require('graphql').GraphQLList;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

let dimensionsInputType = require('./dimensionsInputType');
let weightInputType = require('./weightInputType');
let imageInputType = require('./imageInputType');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'AttributesInput',
	fields: () => ({
		dimensions:			{ type: dimensionsInputType.graphObj },
		weight:					{ type: weightInputType.graphObj },
		images:					{ type: new GraphQLList(imageInputType.graphObj) }
	})
});
