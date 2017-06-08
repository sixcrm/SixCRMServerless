'use strict'
const uuidV4 = require('uuid/v4');
const _ = require('underscore');
const fs = require('fs');

require('../routes.js');

const du = global.routes.include('lib','debug-utilities.js');
const random = global.routes.include('lib','random.js');
const timestamp = global.routes.include('lib','timestamp.js');

setEnvironmentVariables();

let entities = global.routes.files('seeds');

entities = entities.map(function(filename){
    return filename.substring(0, filename.indexOf(".json"));
});

const kinesisfirehoseutilities = require('../lib/kinesis-firehose-utilities');

function createRandomKinesisActivityRecord(){

    let actor = createEntity('actor');
    let acted_upon = createEntity('acted_upon');
    let associated_with = createEntity('associated_with');

    let spoofed_record = {
        id: uuidV4(),
        datetime: timestamp.getISO8601(),
        actor: actor.id,
        actor_type:actor.type,
        acted_upon:acted_upon.id,
        acted_upon_type:acted_upon.type,
        associated_with:associated_with.id,
        associated_with_type:associated_with.type,
        action:"tested",
        account:uuidV4()
    };

    du.debug('Spoofed Record:', spoofed_record);
    process.exit();

    return spoofed_record;

}

function createEntity(entity_type){

    let entity_types = {
        actor:['user','customer','system'],
        acted_upon: entities,
        associated_with: entities
    };

    let return_object = {id: '', type: ''};

    return_object.selected_type = random.selectRandomFromArray(entity_types[entity_type]);

    if(return_object.selected_type == 'system'){

        return_object.id = return_object.selected_type;

    }else if(return_object.selected_type !== ''){

        return_object.id = getIDFromSeed(return_object.selected_type);

    }

    if(_.has(return_object, 'id') && return_object.id !== ''){

        return return_object;

    }

    throw new Error('Unable to create '+entity_type+' object.');

}

function getIDFromSeed(seed_type){

    let seeds = global.routes.include('seeds', seed_type+'.json');

    let seeds_array = (_.has(seeds, 'Seeds'))?seeds.Seeds:seeds;

    let selected_seed = random.selectRandomFromArray(seeds);

    if(_.has(selected_seed, 'id')){
        return selected_seed.id;
    }else{
        return getIDFromSeed(seed_type);
    }

}

function setEnvironmentVariables(){

    process.env.SIX_VERBOSE = 2;
    process.env.kinesis_firehose_activity_stream = 'six-development-activity';
    process.env.aws_region = 'us-east-1';

}

return kinesisfirehoseutilities.putRecord('activity', createRandomKinesisActivityRecord()).then((result) => {
    du.output('Kinesis Firehose Result', result);
    return result;
})
.catch((error) => {
    du.warning('Error:', error);
});
