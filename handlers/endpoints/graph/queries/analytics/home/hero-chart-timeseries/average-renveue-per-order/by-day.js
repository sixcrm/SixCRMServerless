const fs = require('fs');
const path = require('path');

const body = `
  query {
    analytics (
      reportType: averageRevenuePerOrder
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

fs.writeFileSync(path.join(__dirname, 'by-day.json'), JSON.stringify({
	requestContext: {
		authorizer: {
			user: "owner.user@test.com"
		}
	},
	pathParameters: {
		"account": "d3fa3bf3-7824-49f4-8261-87674482bf1c"
	},
	body
}, null, 4), 'utf8');
