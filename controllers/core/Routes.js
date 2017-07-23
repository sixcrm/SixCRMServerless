'use strict'
require('require-yaml');

const path = require('path');
const _ = require('underscore');
var fs = require('fs');

module.exports = class Routes{

    constructor(root_path){

      this.setRootPath(root_path);

      this.loadRoutes('/config/routes.yml');

    }

    setRootPath(root_path){

      if(_.isUndefined(root_path)){
        root_path = __dirname;
      }

      this.root = path.resolve(root_path);

    }

    include(feature, sub_path){

        return require(this.path(feature, sub_path));

    }

    path(feature, sub_path){

        if(_.has(this.routes, feature)){

            if(_.isUndefined(sub_path)){

        //console.log(this.root+this.routes[feature]);
                return this.root+this.routes[feature];

            }

      //console.log(this.root+this.routes[feature]+sub_path);
            return this.root+this.routes[feature]+sub_path;

        }else{

            throw new Error('Undefined route: '+feature);

        }

    }

    files(feature, subpath){

        let directory_path = this.path(feature, subpath);

        let files = fs.readdirSync(directory_path);

        return files;

    }

    loadRoutes(routes_path){

        this.routes = require(this.root+routes_path);

    }

}
