/* In work */

var fs = require("fs");
var writeStream = fs.createWriteStream("file.csv");

var header="stamp"+","+"customer"+","+"creditcard"+","+"merchprocessor"+","+"campaign"+","+"affiliate"+","+"amount"+","+"result"+","+"account"+
","+"type"+","+"subtype"+","+"schedule"+","+"subaffiliate_1"+","+"subaffiliate_2"+","+"subaffiliate_3"+","+"subaffiliate_4"+","+"subaffiliate_5"

function createGuid()
{
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

var arr_customers = [];
var len = 100;

for (var i = 0; i < len; i++) {
     arr_customers.push(createGuid());
}



/* Wrting to the filee */
writeStream.write(header);
writeStream.close();
