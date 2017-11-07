'use strict';
const _ = require('underscore');
const fs = require('fs');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

class TermsAndConditions {

  getLatestTermsAndConditions(role) {

    du.debug('Reading latest terms and conditions for role:', role);

    return new Promise((resolve, reject) => {

      this.getAllTermsAndConditionFileNames(role)
        .then(terms_and_conditions => {

          const file_name = 'resources/terms-and-conditions/' + (role ? role : 'user') + '/' + terms_and_conditions[0];

          fs.readFile(file_name, function(err, file) {
            if (err) {
              return reject(err);
            }

            const parsedFile = JSON.parse(file);

            du.debug('Latest terms and conditions file:', parsedFile);

            if (!parsedFile || !parsedFile.version || !parsedFile.content) {
              return reject('Terms And Conditions file not valid');
            }

            return resolve(parsedFile);
          });

        }).catch(error => reject(error));

    });

  }

  getAllTermsAndConditionFileNames(role) {

    du.debug('Reading all terms and conditions for role:', role);

    return new Promise((resolve, reject) => {
      const directory = 'resources/terms-and-conditions/' + (role ? role : 'user');

      fs.readdir(directory, function(err, items) {
        if (err) {
          return reject(err);
        }

        if (!items || items.length <= 0) {
          return reject('No Terms And Conditions Files Found');
        }

        const terms_and_conditions = items.sort((a, b) => {

          if(a < b) return 1;

          if(a > b) return -1;

          return 0;

        });

        return resolve(terms_and_conditions);
      });

    })

  }

}

module.exports = new TermsAndConditions();