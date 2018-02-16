var AWS = require('aws-sdk');

var s3 = new AWS.S3();

var myBucket = 'sixcrm-redshift-staging';
var myKey = 'test_json_gen_events.json';

if (typeof Promise === 'undefined') {
    AWS.config.setPromisesDependency(require('bluebird'));
    console.log("Console");
}

function createGuid()
{
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);

        return v.toString(16);
    });
}

function choose(choices) {
    var index = Math.floor(Math.random() * choices.length);

    return choices[index];
}


function generateJson() {
    var jsonArr =  [];

    for (var i = 0; i < 200; i++) {
        jsonArr.push({
            "session": createGuid(),
            "type": choose(["click","order","lead","upsell","confirm"]),
            "datetime": '2017-03-02T17:23:43.043Z',
            "account": createGuid(),
            "campaign": createGuid(),
            "product_schedule": createGuid(),
            "affiliate": createGuid(),
            "subaffiliate_1": createGuid(),
            "subaffiliate_2": createGuid(),
            "subaffiliate_3": createGuid(),
            "subaffiliate_4": createGuid(),
            "subaffiliate_5": createGuid()
        });
    }

    jsonArr = jsonArr.map(function(e){
        return JSON.stringify(e);
    });

    return jsonArr.join("\n");
}


var putObjectPromise  = function loadBucket() {
    s3.createBucket({Bucket: myBucket}, function(err) {
        if (err) {
            console.log(err);
        } else {
            let params = {Bucket: myBucket, Key: myKey, Body: generateJson()};

            return s3.putObject(params, function(err){
                if (err) {
                    console.log(err)
                } else {
                    console.log("Successfully uploaded data to myBucket/myKey");
                }
            }).promise()
        }
    })
};

putObjectPromise();
