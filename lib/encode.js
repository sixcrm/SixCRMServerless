'use strict';

module.exports = class Encode {

    static objectToBase64(object){

        return this.toBase64(JSON.stringify(object));

    }

    static base64ToObject(string){

        return JSON.parse(this.fromBase64(string));

    }

    static toBase64(string){

        return Buffer.from(string).toString('base64');

    }

    static fromBase64(string){

        return Buffer.from(string, 'base64').toString('ascii')

    }

}
