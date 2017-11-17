const _ = require('underscore');
const chai = require('chai');
const expect = chai.expect;
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

describe('lib/object-utilities', () => {

  describe('has', () => {

    it('should return false when it\'s not an object', () => {
        expect(objectutilities.has()).to.equal(false);
    });

    it('should return true when object has properties', () => {
        expect(objectutilities.has({test:{test2:'hello'}}, 'test')).to.equal(true);
    });

    it('should fail when object is missing arguments', () => {
        try{
            objectutilities.has({},'test', true);
            expect.fail();
        }catch(error){
            expect(error.message).to.equal('[500] Object missing property "test".');
        }
    });

    it('should fail due to non string properties', () => {
        try{
          //properties object with any value that is not a string
            objectutilities.has({},[1], true);
            expect.fail();
        }catch(error){
            expect(error.message).to.equal('[500] Unrecognized properties object: 1');
        }
    });

    it('should return true when object has properties that are strings', () => {
        expect(objectutilities.has({test:{test2:'hello'}}, ['test'])).to.equal(true);
    });

    it('should fail due to object missing property', () => {
        try{
            objectutilities.has({},['test'], true);
            expect.fail();
        }catch(error){
            expect(error.message).to.equal('[500] Object missing property "test".');
        }
    });

  });

  describe('hasRecursive', () => {

    it('should fail with null key argumentation', () => {

      try{
        objectutilities.hasRecursive({});
        expect.fail();
      }catch(error){
        expect(error.message).to.equal('[500] Key must be a array or a string.');
      }

    });

    it('should fail with empty key argumentation', () => {

      try{
        objectutilities.hasRecursive({},[]);
        expect.fail();
      }catch(error){
        expect(error.message).to.equal('[500] key array must be of length 1 or greater.');
      }

    });

    it('should fail with fatal argumentation', () => {

      try{
        objectutilities.hasRecursive({},['test'], true);
        expect.fail();
      }catch(error){
        expect(error.message).to.equal('[500] Expected object to have key "test"');
      }

    });

    it('should return false', () => {

      expect(objectutilities.hasRecursive({},['test'])).to.equal(false);

    });

    it('should fail due to invalid argumentation (object)', () => {

      try{

        objectutilities.hasRecursive({test:'hello'}, {}, true);
        expect.fail();

      }catch(error){

        expect(error.message).to.equal('[500] Key must be a array or a string.');

      }

    });

    it('should fail due to invalid argumentation (object in array)', () => {

      try{

        objectutilities.hasRecursive({test:'hello'}, [{}], true);
        expect.fail();

      }catch(error){

        expect(error.message).to.equal('[500] Non-string key observed.');

      }

    });

    it('should return true for array argument (one dimensional)', () => {

      expect(objectutilities.hasRecursive({test:'hello'},['test'])).to.equal(true);

    });

    it('should return true for string argument (one dimensional)', () => {

      expect(objectutilities.hasRecursive({test:'hello'},'test')).to.equal(true);

    });

    it('should return true for string argument (one dimensional) with arbitrary property types', () => {

      expect(objectutilities.hasRecursive({test:{test2:'hello'}}, 'test')).to.equal(true);
      expect(objectutilities.hasRecursive({test:'hello'}, 'test')).to.equal(true);
      expect(objectutilities.hasRecursive({test:null}, 'test')).to.equal(true);
      expect(objectutilities.hasRecursive({test:false}, 'test')).to.equal(true);
      expect(objectutilities.hasRecursive({test:true}, 'test')).to.equal(true);
      expect(objectutilities.hasRecursive({test:{}}, 'test')).to.equal(true);
      expect(objectutilities.hasRecursive({test:['hello']}, 'test')).to.equal(true);
      expect(objectutilities.hasRecursive({test:() => {return 'hello'; }}, 'test')).to.equal(true);

    });

    it('should return true for array argument (one dimensional) with arbitrary property types', () => {

      expect(objectutilities.hasRecursive({test:{test2:'hello'}}, ['test'])).to.equal(true);
      expect(objectutilities.hasRecursive({test:'hello'}, ['test'])).to.equal(true);
      expect(objectutilities.hasRecursive({test:null}, ['test'])).to.equal(true);
      expect(objectutilities.hasRecursive({test:false}, ['test'])).to.equal(true);
      expect(objectutilities.hasRecursive({test:true}, ['test'])).to.equal(true);
      expect(objectutilities.hasRecursive({test:{}}, ['test'])).to.equal(true);
      expect(objectutilities.hasRecursive({test:['hello']}, ['test'])).to.equal(true);
      expect(objectutilities.hasRecursive({test:() => {return 'hello'; }}, ['test'])).to.equal(true);

    });

    it('should return true for array argument (two dimensional)', () => {

      expect(objectutilities.hasRecursive({test:{test2:'hello'}},['test', 'test2'])).to.equal(true);

    });

    it('should return true for string argument (two dimensional)', () => {

      expect(objectutilities.hasRecursive({test:{test2:'hello'}},'test.test2')).to.equal(true);

    });

    it('should return true for string argument (two dimensional) with arbitrary property types', () => {

      expect(objectutilities.hasRecursive({test:{test2:{test3: 'hello'}}}, 'test.test2')).to.equal(true);
      expect(objectutilities.hasRecursive({test:{test2:'hello'}}, 'test.test2')).to.equal(true);
      expect(objectutilities.hasRecursive({test:{test2:null}}, 'test.test2')).to.equal(true);
      expect(objectutilities.hasRecursive({test:{test2:false}}, 'test.test2')).to.equal(true);
      expect(objectutilities.hasRecursive({test:{test2:true}}, 'test.test2')).to.equal(true);
      expect(objectutilities.hasRecursive({test:{test2:{}}}, 'test.test2')).to.equal(true);
      expect(objectutilities.hasRecursive({test:{test2:['hello']}}, 'test.test2')).to.equal(true);
      expect(objectutilities.hasRecursive({test:{test2: () => {return 'hello'; }}}, 'test.test2')).to.equal(true);

    });

    it('should return true for array argument (two dimensional) with arbitrary property types', () => {

      expect(objectutilities.hasRecursive({test:{test2:{test3: 'hello'}}}, ['test','test2'])).to.equal(true);
      expect(objectutilities.hasRecursive({test:{test2:'hello'}}, ['test','test2'])).to.equal(true);
      expect(objectutilities.hasRecursive({test:{test2:null}}, ['test','test2'])).to.equal(true);
      expect(objectutilities.hasRecursive({test:{test2:false}}, ['test','test2'])).to.equal(true);
      expect(objectutilities.hasRecursive({test:{test2:true}}, ['test','test2'])).to.equal(true);
      expect(objectutilities.hasRecursive({test:{test2:{}}}, ['test','test2'])).to.equal(true);
      expect(objectutilities.hasRecursive({test:{test2:['hello']}}, ['test','test2'])).to.equal(true);
      expect(objectutilities.hasRecursive({test:{test2: () => {return 'hello'; }}}, ['test','test2'])).to.equal(true);

    });

    it('should return true for array argument (three dimensional)', () => {

      expect(objectutilities.hasRecursive({test:{test2:{test3:'hello'}}},['test', 'test2', 'test3'])).to.equal(true);

    });

    it('should return true for string argument (two dimensional)', () => {

      expect(objectutilities.hasRecursive({test:{test2:{test3:'hello'}}},'test.test2.test3')).to.equal(true);

    });

    it('should return false for array argument (three dimensional)', () => {

      expect(objectutilities.hasRecursive({test:{test2:{test4:'hello'}}},['test', 'test2', 'test3'])).to.equal(false);

    });

    it('should return false for string argument (two dimensional)', () => {

      expect(objectutilities.hasRecursive({test:{test2:{test4:'hello'}}},'test.test2.test3')).to.equal(false);

    });

    it('should return true for array argument (three dimensional with array index notation)', () => {

      expect(objectutilities.hasRecursive({test:[{another_key:{yet_another_key:'1'}}]},'test.0.another_key.yet_another_key'), true).to.equal(true);

    });

  });

  describe('getClassName', () => {

    it('returns class name', () => {
        expect(objectutilities.getClassName({constructor:{name:'test'}})).to.equal('test');
    });

    it('returns null when class name is', () => {
        expect(objectutilities.getClassName({constructor:{}})).to.equal(null);
    });
  });

  describe('nonEmpty', () => {

    it('returns false if parameter is not an object', () => {
        expect(objectutilities.nonEmpty('test')).to.be.false
    });

    it('throws error if fatal is true', () => {
        try{
          objectutilities.nonEmpty({}, true)
        }catch(error){
            expect(error.message).to.equal('[500] Object is empty.');
        }
    });
  });

  describe('recurseByDepth', () => {

    it('returns result if sent function was successful', () => {
      //send any function
        expect(objectutilities.recurseByDepth(
            {'a_key': 'a_value'},
            function(){
                return true;
            }
        )).to.equal('a_value');
    });
  });

  describe('recurseAll', () => {

    it('throws error if fatal is true', () => {
        try{
          objectutilities.recurseAll({}, 'not_a_function')
        }catch(error){
            expect(error.message).to.equal('[500] Match function must be a function.');
        }
    });
  });

  describe('orderedRecursion', () => {

    it('returns value from object', () => {
        //send any function
        expect(objectutilities.orderedRecursion(
            {'a_key': 'a_value'},
            function(){
                return true;
            }
        )).to.equal('a_value');
    });

    it('returns null when there is no recursion result', () => {
        //send any function
        expect(objectutilities.orderedRecursion(
            {'a_key': ['a_value']},
            function(){
                return false;
            }
        )).to.equal(null);
    });
  });

  describe('getObjectType', () => {

    it('returns array', () => {
        expect(objectutilities.getObjectType(['an_array'])).to.equal('array');
    });

    it('returns string', () => {
        expect(objectutilities.getObjectType('a_string')).to.equal('string');
    });

    it('returns number', () => {
        expect(objectutilities.getObjectType(1)).to.equal('number');
    });

    it('returns boolean', () => {
        expect(objectutilities.getObjectType(true)).to.equal('boolean');
    });

    it('returns object', () => {
        expect(objectutilities.getObjectType({'a_key': 'a_value'})).to.equal('object');
    });

    it('returns null', () => {
        expect(objectutilities.getObjectType(null)).to.equal(null);
    });
  });

});
