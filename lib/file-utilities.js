'use strict';

const _ = require('underscore');
const fs = require('fs');
const eu = global.routes.include('lib', 'error-utilities.js');

module.exports = class FileUtilities {

    static getDirectoryFiles(directory_path){

      return fs.readdir(directory_path, (error, files) => {

        if(_.isError(error)){ eu.throwError('server', error.message); }

        return files;

      });

    }

    static getDirectoryFilesSync(directory_path){

      return fs.readdirSync(directory_path);

    }

}
