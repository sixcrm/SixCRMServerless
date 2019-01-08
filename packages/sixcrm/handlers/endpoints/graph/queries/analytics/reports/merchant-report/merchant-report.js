const fs = require('fs');
const path = require('path');

const body = `
query {
    analytics (
      reportType: merchantReport
      facets: [{
      facet: "start"
        values: ["2017-03-10T14:32:28Z"]
      },
      {
        facet: "end"
        values: ["2019-04-09T14:32:28Z"]
      },
      {
        facet: "campaign"
        values: ["70a6689a-5814-438b-b9fd-dd484d0812f9"]
      },
      {
        facet: "affiliate"
        values: ["9b0607b8-17e5-4a3f-a6f0-1f90636f37f9", "2ab1b8c5-f3b0-4275-bfb1-048a880b86a7"]
      },
      {
        facet: "product"
        values: ["11111111-1111-1111-1111-111111111001"]
      }
    ]) {records { key value }}
  }
`;

fs.writeFileSync(path.join(__dirname, 'merchant-report.json'), JSON.stringify({
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
