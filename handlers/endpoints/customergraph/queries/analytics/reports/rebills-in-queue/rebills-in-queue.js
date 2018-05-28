const fs = require('fs');
const path = require('path');

const body = `
query {
    analytics (
      reportType: rebillsInQueue
      facets: [{
        facet: "queueName"
        values: ["hold_failed"]
      }]
      pagination: {
        limit: 100
        offset: 0
        direction: "ASC"
      }
   ) {records { key value }}
  }
`;

fs.writeFileSync(path.join(__dirname, 'rebills-in-queue.json'), JSON.stringify({
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
