
const GraphQLUnionType = require('graphql').GraphQLUnionType;

let affiliateType = require('./affiliateType');
let affiliateGroupType = require('./affiliateGroupType');

module.exports.graphObj = new GraphQLUnionType({
	name: 'AffiliateAllowDeny',
	description: 'A affiliate allow/deny list.',
	types:[affiliateType.graphObj, affiliateGroupType.graphObj],
	resolveType: (data) => {
		if(data.created_at){
			return affiliateType.graphObj;
		}
		return affiliateGroupType.graphObj;
	}
});
