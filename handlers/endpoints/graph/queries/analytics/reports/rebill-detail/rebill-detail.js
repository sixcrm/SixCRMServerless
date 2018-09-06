const fs = require('fs');
const path = require('path');

const body = `
query {
    analytics (
        reportType: rebillDetail
        facets: [
            {
                facet: "start"
                values: ["2018-01-10T14:32:28Z"]
            },
            {
                facet: "end"
                values: ["2018-09-09T14:32:28Z"]
            }
        ]
        pagination: {
            offset: 0,
            limit: 100,
            order: ["datetime"],
            direction: "ASC"
        }
    ) {records { key value }}
}`;

fs.writeFileSync(path.join(__dirname, 'rebill-detail.json'), JSON.stringify({
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
