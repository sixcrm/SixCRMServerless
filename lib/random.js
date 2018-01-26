'use strict';
const rs = require('randomstring');
const _ = require('underscore');
const faker = require('faker');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

class Random {

  static createDomainName(){

    return faker.internet.domainName();

  }

  static createRandomEmail(){

    return faker.internet.email();

  }

  static createRandomPhoneNumber(){

    return faker.phone.phoneNumber();

  }

  static createRandomAddress(segment){

    segment = (_.isUndefined(segment))?'full':segment;

    if(!_.contains(['line1','line2','city','state','zip', 'country', 'full'], segment)){
      eu.throwError('server', 'Unknown address segment: '+segment);
    }

    let methods = {
      line1: () => faker.address.streetAddress(),
      line2: () => faker.address.secondaryAddress(),
      city: () => faker.address.city(),
      state: () => faker.address.stateAbbr(),
      zip:() => faker.address.zipCode(),
      country: () => faker.address.countryCode()
    };

    return methods[segment]();

  }

  static createRandomName(segment){

    segment = (_.isUndefined(segment))?'full':segment;

    if(!_.contains(['first','middle','last','full'], segment)){
      eu.throwError('server', 'Unknown name segment: '+segment)
    }

    let methods = {
      full: () => faker.name.findName(),
      first: () => faker.name.firstName(),
      last: () => faker.name.lastName(),
      middle: () => faker.name.firstName()
    };

    return methods[segment]();

  }

  static createRandomString(length, charset, capitalization){

    charset = (_.isUndefined(charset) || _.isNull(charset))?'alphanumeric':charset;
    capitalization = (_.isUndefined(capitalization))?'uppercase':capitalization;

    return rs.generate({
        readable: true,
        length: length,
        charset: charset,
        capitalization: capitalization
    });

  }

  //Technical Debt:  This kind-of works -  I bet it's a non-uniform distribution
    static selectRandomFromArray(list){

        if(!_.isArray(list)){ eu.throwError('validation','List argument must be an array.'); }

        if(list.length < 1){ eu.throwError('validation','List argument must be of length one or greater.'); }

        let random_index = Math.floor(Math.random() * list.length);

        return list[random_index];

    }

    static randomInt(min, max){

      min = (_.isUndefined(min))?1:min;
      max = (_.isUndefined(max))?10000:max;

      if (min !== parseInt(min, 10)){ eu.throwError('validation','Minimum input is not an integer.'); }
      if (max !== parseInt(max, 10)){ eu.throwError('validation','Maximum input is not an integer.'); }

      return Math.floor(Math.random() * (max - min)) + min;

    }

    static randomDouble(min, max, precision){

      if(_.isUndefined(precision)){
          precision = 2;
      }

      if (min !== parseInt(min, 10)){ eu.throwError('validation','Minimum input is not an integer.'); }
      if (max !== parseInt(max, 10)){ eu.throwError('validation','Maximum input is not an integer.'); }

      if (precision !== parseInt(precision, 10)){ eu.throwError('validation','Precision input is not an integer.'); }

      return parseFloat(Math.min(min + (Math.random() * (max - min)), max).toFixed(precision));

    }

    static randomBoolean(){

      return this.randomProbability(0.5);

    }

    static randomProbability(probability){


        if(!_.isNumber(probability)){
            eu.throwError('validation','Probability is not a number.');
        }

        probability = parseFloat(probability);

        if(probability < 0 || probability > 1){
            eu.throwError('validation','Probability must be greater than or equal to 0 and less than or equal to 1');
        }

        return !(this.randomDouble(0, 1, 5) > probability);

    }

    static randomGaussian(mean, stdev) {

        let y1, y2;
        let use_last = false;

        if(use_last) {
            y1 = y2;
            use_last = false;
        }else{
            let x1, x2, w;

            do {
                x1 = 2.0 * Math.random() - 1.0;
                x2 = 2.0 * Math.random() - 1.0;
                w  = x1 * x1 + x2 * x2;
            } while(w >= 1.0);
            w = Math.sqrt((-2.0 * Math.log(w))/w);
            y1 = x1 * w;
            y2 = x2 * w;
            use_last = true;
        }

        var retval = mean + stdev * y1;

        return Math.abs(retval);

    }

}

module.exports = Random;
