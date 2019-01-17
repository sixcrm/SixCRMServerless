const chai = require('chai');
const expect = chai.expect;
const mockery = require('mockery');

const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;

describe('controllers/providers/sts-provider', () => {

	before(() => {
		mockery.resetCache();
		mockery.deregisterAll();
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	after(() => {
		mockery.disable();
	});

	describe('constructor', () => {

		it('successfully constructs', () => {
			let STSProvider = global.SixCRM.routes.include('controllers','providers/sts-provider.js');
			let stsprovider = new STSProvider();

			expect(objectutilities.getClassName(stsprovider)).to.equal('STSProvider');
		});

	});

	describe('assumeRole', () => {

		it('fails when missing RoleARN', () => {

			let STSProvider = global.SixCRM.routes.include('controllers','providers/sts-provider.js');
			let stsprovider = new STSProvider();

			let parameters = {};

			try {
				stsprovider.assumeRole(parameters);
			}catch(error){
				expect(error.message).to.equal('[500] Missing source object field: "RoleArn".');
			}

		});

	});

	describe('assumeRole', () => {

		it('succeeds', () => {

			let response = {
				Credentials:{
					AccessKeyId:'abc',
					SecretAccessKey: 'abc',
					SessionToken: 'abc'
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('controllers','providers/aws-provider.js'), class {
				instantiateAWS(){
					this.AWS = {
						STS: class {
							constructor(){

							}
							assumeRole(parameters){
								return {
									promise: () => Promise.resolve(response)
								};
							}
						}
					}
				}
				constructor(){}
			});

			let STSProvider = global.SixCRM.routes.include('controllers','providers/sts-provider.js');
			let stsprovider = new STSProvider();

			let parameters = {
				RoleArn: 'arn:aws:iam::1234567890:role/SomeRoleName'
			};

			return stsprovider.assumeRole(parameters).then(result => {
				expect(result).to.deep.equal(response);
			});

		});

	});

});
