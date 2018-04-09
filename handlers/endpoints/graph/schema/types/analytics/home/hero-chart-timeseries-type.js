const GraphQLString = require('graphql').GraphQLString;
const GraphQLFloat = require('graphql').GraphQLFloat;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

module.exports = new GraphQLObjectType({
	name: 'HeroChartTimeseriesType',
	description: 'Timeseries of facets by a period',
	fields: () => ({
		facets: {
			type: new GraphQLList(HeroChartTimeseriesFacetType),
			description: 'Facets'
		}
	}),
	interfaces: []
});

const HeroChartTimeseriesFacetType = new GraphQLObjectType({
	name: 'HeroChartTimeseriesFacetType',
	description: 'Facet',
	fields: () => ({
		facet: {
			type: GraphQLString
		},
		timeseries: {
			type: new GraphQLList(HeroChartTimeseriesFacetSliceType),
		}
	}),
	interfaces: []
});

const HeroChartTimeseriesFacetSliceType = new GraphQLObjectType({
	name: 'HeroChartTimeseriesFacetSliceType',
	description: 'Time slice of a facet a by a period',
	fields: () => ({
		datetime: {
			type: GraphQLString
		},
		value: {
			type: GraphQLFloat
		}
	}),
	interfaces: []
});