'use strict';
const _ = require('underscore');
const fs = require('fs');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

class TermsAndConditions {

  getLatestTermsAndConditions(role) {

    du.debug('Retrieving latest terms and conditions for role:', role);

    return new Promise((resolve, reject) => {

      const directory = (role && role !== 'user') ? ('user_acl/' + role) : 'user';
      const file_name = 'resources/terms-and-conditions/' + directory + '/terms-and-conditions.json';

      fs.readFile(file_name, function(err, file) {
        if (err) {
          return reject(err);
        }

        const parsedFile = JSON.parse(file);

        du.debug('Latest terms and conditions file:', parsedFile);

        if (!parsedFile || !parsedFile.version || !parsedFile.title || !parsedFile.body) {
          return reject('Terms And Conditions file not valid');
        }

        return resolve(parsedFile);
      })

    });

  }

}

module.exports = new TermsAndConditions();