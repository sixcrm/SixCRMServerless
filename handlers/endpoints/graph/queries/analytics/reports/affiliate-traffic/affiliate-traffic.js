const fs = require('fs');
const path = require('path');

const body = `
query {
    analytics (
      reportType: affiliateTraffic
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
        values: ["8882b1de-e4be-485b-b887-1a41ff93677e"]
      },
      {
        facet: "subId"
        values: ["d7435e1d-9c9e-43c0-b4de-e4d5eda14a4f"]
      },
      {
        facet: "product"
        values: ["c08afc78-6305-4b7d-9c5e-ed5cd9bcfb41"]
      },
      {
        facet: "productSchedule"
        values: ["336aea70-86f3-459f-b337-94ccdbf3b614"]
      },
      {
        facet: "mid"
        values: ["6c40761d-8919-4ad6-884d-6a46a776cfb9"]
      }
    ]) {records { key value }}
  }
`;

fs.writeFileSync(path.join(__dirname, 'affiliate-traffic.json'), JSON.stringify({
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
