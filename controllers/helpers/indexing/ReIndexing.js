'use strict'

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const dynamoutilities = global.SixCRM.routes.include('lib','dynamodb-utilities.js');
const cloudsearchutilities = global.SixCRM.routes.include('lib','cloudsearch-utilities.js');

const PreIndexingHelperController = global.SixCRM.routes.include('helpers', 'indexing/PreIndexing.js');
let preIndexingHelperController = new PreIndexingHelperController();

module.exports = class ReIndexingHelperController {

  constructor(){

  }

  //Entrypoint
  execute(fix){

    du.debug('Reindexing');

      let indexing_entities = preIndexingHelperController.indexing_entities;

      du.output('Indexing entities: ' + indexing_entities);

      let entities_dynamodb = [];
      let entities_index = [];

      let missing_in_index = [];
      let missing_in_dynamo = [];

      let promises = [];

      indexing_entities.map(entity => {
          promises.push(() => dynamoutilities.scanRecords(entity + 's').then(r => {
              r.Items.map(c => {
                  entities_dynamodb.push({
                      id: c.id,
                      entity_type: entity,
                      entity: c
                  });
              });
              return true;
          }));

      });

      return arrayutilities.serial(promises).then(() => {
          // Technical Debt: This only works for up to 10000 entities in index.
          return cloudsearchutilities.executeStatedSearch({ query: 'matchall', queryParser: 'structured', size: 10000})
      }).then((search) => {
          search.hits.hit.map((s) => {
              entities_index.push(s);
          })
          return true;
      }).then(() => {
          let index_details = {};
          let db_details = {};

          entities_dynamodb.map(d => {
              if (!(entities_index.map(i => i.id).includes(d.id))) {
                  let add = Object.assign({}, d.entity);

                  add.entity_type = d.entity_type;
                  missing_in_index.push(add);

                  if (!index_details[add.entity_type]) {
                      index_details[add.entity_type] = 0;
                  }

                  index_details[add.entity_type]++;
              }
          });

          entities_index.map(i => {
              if (!(entities_dynamodb.map(d => d.id).includes(i.id))) {
                  missing_in_dynamo.push({id: i.id, entity_type: i.fields.entity_type[0]});

                  if (!db_details[i.fields.entity_type]) {
                      db_details[i.fields.entity_type] = 0;
                  }

                  db_details[i.fields.entity_type]++;
              }
          });

          let operations = [];

          du.output('Total in dynamodb: ' + entities_dynamodb.length);
          du.output('Total in index: ' + entities_index.length);
          du.output('Missing in index: ' + missing_in_index.length);
          du.debug(index_details);
          du.output('Missing in dynamodb: ' + missing_in_dynamo.length);
          du.debug(db_details);

          missing_in_index.map(m => {
              if (fix === true) {
                  operations.push(() => preIndexingHelperController.addToSearchIndex(m));
              }
          });

          missing_in_dynamo.map(m => {
              if (fix === true) {
                  operations.push(() => preIndexingHelperController.removeFromSearchIndex(m));
              }
          });


          return arrayutilities.serial(operations);

      }).then(() => {
          du.output('Finished');
          return true;
      });


  }

}
