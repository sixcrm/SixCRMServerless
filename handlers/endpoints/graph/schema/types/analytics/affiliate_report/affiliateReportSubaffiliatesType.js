
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

const affiliateReportSubaffiliateRowType = require('./affiliateReportSubaffiliateRowType');
const analyticsPaginationType = require('./../paginationType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'AffiliateReportSubaffiliatesType',
	description: 'Affiliates Report Subaffiliates Type',
	fields: () => ({
		subaffiliates: {
			type: new GraphQLList(affiliateReportSubaffiliateRowType.graphObj),
			description: 'A subaffiliate'
		},
		pagination: {
			type: new GraphQLNonNull(analyticsPaginationType.graphObj),
			description: ''
		}
	}),
	interfaces: []
});
