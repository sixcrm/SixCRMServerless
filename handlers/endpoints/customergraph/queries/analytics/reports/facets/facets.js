const body = `
	query {
		analyticsfacets (filter: {
			reportType: revenueVersusOrders
			facets: ["affiliate", "campaign"],
			filters: [ { facet: "start", values: ["2018-01-01T00:00:00"]}, { facet: "end", values: ["2019-01-01T00:00:00"]} ]
		}) {facets { facet values { key value } }}
	}
`;

module.exports = {
	requestContext: {
		authorizer: {
			user: "owner.user@test.com"
		}
	},
	pathParameters: {
		"account": "d3fa3bf3-7824-49f4-8261-87674482bf1c"
	},
	body
};
