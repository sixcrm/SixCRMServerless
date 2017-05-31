'use strict';
const _ = require('underscore');
const du = global.routes.include('lib', 'debug-utilities.js');

module.exports = class EncodeUtilities {

    static objectToBase64(object){

        du.debug('Object To Base 64');

        return this.toBase64(JSON.stringify(object));

    }

    static base64ToObject(string){

        du.debug('Base64 To Object');

        return JSON.parse(this.fromBase64(string));

    }

    static toBase64(string){

        du.debug('To Base64');

        if (_.isFunction(Buffer.from)) {

            return Buffer.from(string).toString('base64');

        }else{

            return new Buffer(string).toString('base64');

        }

    }

    static fromBase64(string){

        du.debug('From Base64');

        if (_.isFunction(Buffer.from)) {

            return Buffer.from(string, 'base64');

        } else {

            return new Buffer(string, 'base64');

        }

    }

}
