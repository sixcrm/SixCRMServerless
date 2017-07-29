'use strict';

const _ = require('underscore');
const fs = require('fs');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

module.exports = class FileUtilities {

    static getDirectoryFiles(directory_path){

      return new Promise((resolve) => {

        fs.readdir(directory_path, (error, files) => {

          if(_.isError(error)){ eu.throwError('server', error.message); }

          return resolve(files);

        });

      });

    }

    static getFileContentsSync(filepath, encoding){

      if(_.isUndefined(encoding)){ encoding = 'utf-8'; }

      return fs.readFileSync(filepath, encoding);

    }

    static getDirectoryFilesSync(directory_path){

      return fs.readdirSync(directory_path);

    }

    static getDirectoryList(directory_path){

      return fs.readdirSync(directory_path).filter(f => fs.statSync(directory_path+"/"+f).isDirectory());

    }
}
