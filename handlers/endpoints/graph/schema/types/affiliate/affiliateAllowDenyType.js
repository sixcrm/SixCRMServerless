'use strict';
const GraphQLUnionType = require('graphql').GraphQLUnionType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

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
