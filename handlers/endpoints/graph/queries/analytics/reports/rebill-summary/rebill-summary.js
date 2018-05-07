const fs = require('fs');
const path = require('path');

const body = `
query {
    analytics (
      reportType: rebillSummary
      facets: [{
      facet: "start"
        values: ["2018-01-10T14:32:28Z"]
      },
      {
        facet: "end"
        values: ["2018-04-09T14:32:28Z"]
      },
      {
        facet: "period"
        values: ["DAY"]
      },
      {
        facet: "queueName"
        values: ["hold_failed"]
      }]
      pagination: {
        limit: 100
        offset: 0
        direction: ["ASC"]
      }
   ) {records { key value }}
  }
`;

fs.writeFileSync(path.join(__dirname, 'rebill-summary.json'), JSON.stringify({
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
