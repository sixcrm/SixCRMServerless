const body = `
	query {
		analyticsfacets (facets: {
			reportType: revenueVersusOrders 
			facets: ["affiliate"]
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
}
