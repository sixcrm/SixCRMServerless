'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLInt = require('graphql').GraphQLInt;

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'BINFilterInput',
    fields: () => ({
        binnumber:{
            description: 'The BIN number list.',
            type: new GraphQLList(GraphQLInt)
        },
        brand:{
            description: 'The BIN brand.',
            type: new GraphQLList(GraphQLString)
        },
        bank:{
            description: 'The BIN bank.',
            type: new GraphQLList(GraphQLString)
        },
        type:{
            description: 'The BIN type.',
            type: new GraphQLList(GraphQLString)
        },
        level:{
            description: 'The BIN level.',
            type: new GraphQLList(GraphQLString)
        },
        country:{
            description: 'The BIN country.',
            type: new GraphQLList(GraphQLString)
        },
        info:{
            description: 'The BIN info.',
            type: new GraphQLList(GraphQLString)
        },
        country_iso:{
            description: 'The BIN country_iso.',
            type: new GraphQLList(GraphQLString)
        },
        country2_iso:{
            description: 'The BIN country2_iso.',
            type: new GraphQLList(GraphQLString)
        },
        country3_iso:{
            description: 'The BIN country3_iso.',
            type: new GraphQLList(GraphQLString)
        },
        webpage:{
            description: 'The BIN webpage.',
            type: new GraphQLList(GraphQLString)
        },
        phone:{
            description: 'The BIN phone.',
            type: new GraphQLList(GraphQLString)
        }
    })
});
