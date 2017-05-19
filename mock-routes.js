'use strict'
require('require-yaml');
const mockery = require('mockery');
const path = require('path');
const _ = require('underscore');

class MockRoutes{

    constructor(){

        this.root = path.resolve(__dirname);

        this.loadRoutes('/config/routes.yml');

    }

    include(feature, sub_path){

        return require(this.path(feature, sub_path));

    }

    registerMock(feature, sub_path, mock){

        let path = this.path(feature, sub_path);

        // return require(this.path(feature, sub_path));

        mockery.registerMock(path, mock);

    }

    enable(options) {
        mockery.enable(options);
    }

    resetCache() {
        mockery.resetCache();
    }

    deregisterAll() {
        mockery.deregisterAll();
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

    loadRoutes(routes_path){

        this.routes = require(this.root+routes_path);

    }

}

global.mockRoutes = new MockRoutes();
