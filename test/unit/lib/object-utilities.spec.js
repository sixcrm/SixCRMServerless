const chai = require('chai');
const expect = chai.expect;
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

describe('lib/object-utilities', () => {

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

});
