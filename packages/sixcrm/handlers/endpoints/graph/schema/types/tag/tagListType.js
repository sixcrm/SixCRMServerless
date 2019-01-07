
const {
	GraphQLNonNull,
	GraphQLList,
	GraphQLObjectType
} = require('graphql');

let tagType = require('./tagType');
let paginationType = require('../pagination/paginationType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'Tags',
	description: 'Tags.',
	fields: () => ({
		tags: {
			type: new GraphQLList(tagType.graphObj),
			description: 'The tags',
		},
		pagination: {
			type: new GraphQLNonNull(paginationType.graphObj),
			description: 'Query pagination',
		}
	}),
	interfaces: []
});
