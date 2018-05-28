const fs = require('fs');
const path = require('path');

const body = `
query {
    analytics (
      reportType: activities
      facets: [{
        facet: "start"
          values: ["2016-03-10T14:32:28Z"]
        },
        {
          facet: "end"
          values: ["2019-04-09T14:32:28Z"]
        },
        {
          facet: "actor"
          values: ["rama@damunaste.org"]
        },
        {
          facet: "actorType"
          values: ["customer"]
        },
        {
          facet: "actedUpon"
          values: ["rama@damunaste.org"]
        },
        {
          facet: "actedUponType"
          values: ["role"]
        },
        {
          facet: "associatedWith"
          values: ["rama@damunaste.org"]
        },
        {
          facet: "associatedWithType"
          values: ["transaction"]
        }
      ]
      pagination: {
        limit: 100
        offset: 0
        order: ["datetime"]
      }
    )
    {records { key value }}
  }
`;

fs.writeFileSync(path.join(__dirname, 'activity.json'), JSON.stringify({
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
