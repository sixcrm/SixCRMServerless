
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

let paginationType = require('../pagination/paginationType');
let userSettingType = require('./userSettingType');

module.exports.graphObj =  new GraphQLObjectType({
	name: 'UserSettingList',
	description: 'User Settings.',
	fields: () => ({
		usersettings: {
			type: new GraphQLList(userSettingType.graphObj),
			description: 'User Settings.',
		},
		pagination: {
			type: new GraphQLNonNull(paginationType.graphObj),
			description: 'Query pagination',
		}
	}),
	interfaces: []
});
