const chai = require('chai');
const expect = chai.expect;
const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

describe('lib/s3-utilities', () => {

    describe('assureDelete', () => {

        it('non-existing bucket', () => {

            s3utilities.bucketExists = () => Promise.resolve(false);

            return s3utilities.assureDelete('a_bucket').then((deleted) => {
                return expect(deleted).to.be.false;
            });

        });

        it('existing bucket', () => {

            s3utilities.bucketExists = () => Promise.resolve(true);
            s3utilities.deleteBucket = () => Promise.resolve(true);

            return s3utilities.assureDelete('a_bucket').then((deleted) => {
                return expect(deleted).to.be.true;
            });

        });

        it('catch error', () => {

            s3utilities.bucketExists = () => Promise.resolve(true);
            s3utilities.deleteBucket = () => Promise.reject('S3 Error');

            return s3utilities.assureDelete('a_bucket').catch((error) => {
                return expect(error).to.equal('S3 Error');
            });

        });

    });

    describe('objectExists', () => {

        it('handles wrong parameters', () => {

            try {
                s3utilities.objectExists({});
                expect.failure();
            } catch (error) {
                expect(error.message).to.equal('[500] This operation requires a "Bucket" parameter.');
            }

            try {
                s3utilities.objectExists({
                    Bucket: 'a_bucket'
                });
                expect.failure();
            } catch (error) {
                expect(error.message).to.equal('[500] This operation requires a "Key" parameter.');
            }

        });

        it('returns true when does exist', () => {

            s3utilities.s3.headObject = (parameters, func) => { func(null, {}) };

            s3utilities.objectExists({
                Bucket: 'a_bucket',
                Key: 'a_key'
            }).then((exists) => {
                return expect(exists).to.be.true;
            });
        });

        it('returns false when doesn\'t exist', () => {

            s3utilities.s3.headObject = (parameters, func) => { func(new Error('S3 Error'), null) };

            s3utilities.objectExists({
                Bucket: 'a_bucket',
                Key: 'a_key'
            }).then((exists) => {
                return expect(exists).to.be.false;
            });
        });

    });
});
