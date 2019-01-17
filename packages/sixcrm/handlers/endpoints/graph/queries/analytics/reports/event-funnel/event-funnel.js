const fs = require('fs');
const path = require('path');

const body = `
query {
    analytics (
      reportType: eventFunnel
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
      }
    ]) {records { key value }}
  }
`;

fs.writeFileSync(path.join(__dirname, 'event-funnel.json'), JSON.stringify({
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
