const AWS = require('aws-sdk');
const _ = require('underscore');
const fs = require('fs');
const du = require('../../lib/debug-utilities.js');

const cs = new AWS.CloudSearch({
    region: 'us-east-1',
    apiVersion: '2013-01-01',
});
const environment = process.argv[2];
const domainName = `sixcrm-${environment}`;

du.highlight(`Executing CloudSearch Deployment: ${domainName}`);

// Start the creation
createDomain()
.then(createIndexes)
.then(indexDocuments)
.then(du.highlight('Complete'))
.catch((error) => {
    throw new Error(error);
});

function createDomain() {
    du.debug('Create Domain');

    return new Promise((resolve, reject) => {
        const params = {
            DomainName: domainName,
        };

        cs.createDomain(params, (error, data) => {
            if (error) {
                du.warn('Error creating domain', error);
                return reject(error);
            }
            return resolve(data);
        });
    });
}

function getIndexObjects() {
    const indexDir = `${__dirname}/indexes/`;
    const files = fs.readdirSync(indexDir);
    const indexObjects = files.map((file) => {
        du.debug(`Index File: ${file}`);
        const indexObj = require(`${indexDir}${file}`);

        indexObj.DomainName = domainName;
        return indexObj;
    });

    return indexObjects;
}

function createIndex(indexObject) {
    return new Promise((resolve, reject) => {
        if (!_.has(indexObject, 'IndexField')) {
            du.warning(indexObject);
            return reject('Index Object lacks IndexField');
        }

        if (!_.has(indexObject.IndexField, 'IndexFieldName')) {
            du.warning(indexObject);
            return reject('Index Object lacks IndexField.IndexFieldName');
        }

        cs.defineIndexField(indexObject, (error, data) => {
            if (error) {
                du.warn('Failed to create index:', indexObject, error);
                return reject(error);
            }
            return resolve(data);
        });
    });
}

function createIndexes() {
    du.debug('Create Indexes');

    const indexObjects = getIndexObjects();
    const results = [];

  // Chain createIndex promises together to run one at a time
    return indexObjects.reduce((promise, indexObject) => promise.then(() => {
        du.debug(`Index created for: '${indexObject.IndexField.IndexFieldName}'`);
        return createIndex(indexObject)
      .then(val => results.push(val));
    }), Promise.resolve())
  .then(() => {
      du.debug('Resolved Promises: ', results);
      return results;
  });
}


function indexDocuments() {
    return new Promise((resolve, reject) => {
        const params = {
            DomainName: domainName,
        };

        cs.indexDocuments(params, (error, data) => {
            if (error) {
                du.warn('Error on indexDocuments', error);
                return reject(error);
            }
            return resolve(data);
        });
    });
}
