const GraphQLScalarType = require('graphql').GraphQLScalarType;
const Kind = require('graphql').Kind;

module.exports = new GraphQLScalarType({
	name: 'AnalyticsReportAny',
	serialize: anyValue,
	parseValue: anyValue,
	parseLiteral
});

function parseLiteral(ast) {

	switch (ast.kind) {

		case Kind.INT:
			return anyValue(parseInt(ast.value));
		case Kind.FLOAT:
			return anyValue(parseFloat(ast.value));
		case Kind.STRING:
			return ast.value;
		case Kind.LIST:
			return ast.values.map(parseLiteral);
		default:
			return null;
	}

}

function anyValue(value) {

	return value;

}
