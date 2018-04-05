const fs = require('fs');

let cache = {};

class Schemas {

    loadSchema(path) {

        return new Promise((resolve, reject) => {
            if (cache[path]) {
                return resolve(cache[path]);
            }

            fs.readFile(path, (error, data) => {
                if (error) {
                    return reject(error);
                }

                let schema = JSON.parse(data);
                cache[path] = schema;

                return resolve(schema);
            });
        });
    }

}

module.exports = new Schemas();