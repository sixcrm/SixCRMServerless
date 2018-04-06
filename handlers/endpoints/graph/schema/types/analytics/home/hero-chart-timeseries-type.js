const GraphQLString = require('graphql').GraphQLString;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLFloat = require('graphql').GraphQLFloat;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

module.exports = new GraphQLObjectType({
	name: 'heroChartTimeseriesType',
	description: 'Timeseries of orders versus revenue by period',
	fields: () => ({
		timeseries: {
			type: new GraphQLList(HeroChartTimeseriesRowType),
			description: 'Rows of order and revenue totals by period'
		}
	}),
	interfaces: []
});

const HeroChartTimeseriesRowType = new GraphQLObjectType({
	name: 'HeroChartTimeseriesRowType',
	description: 'Timeseries of orders versus revenue rows by period',
	fields: () => ({
		datetime: {
			type: GraphQLString
		},
		orders: {
			type: GraphQLInt
		},
		revenue: {
			type: GraphQLFloat
		}
	}),
	interfaces: []
});