const body = `
  query {
    analytics (
      reportType: revenueVersusOrders
      facets: [{
        facet: "start"
        values: ["2018-03-10T14:32:28Z"]
      },
      {
        facet: "end"
        values: ["2018-04-09T14:32:28Z"]
      },
      {
        facet: "period"
        values: ["day"]
      }]
    ) {records { key value }}
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
