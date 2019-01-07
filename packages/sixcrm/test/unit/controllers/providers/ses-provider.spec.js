const chai = require('chai');
const expect = chai.expect;

describe('controllers/providers/ses-provider', () => {

	describe('createParametersObject', () => {

		it('creates parameters object from specified data', () => {

			//valid params structure with sample data
			let params = {
				to: ['to_example_data'],
				body: {html: 'html_example_data'},
				subject: 'subject_example_data',
				reply_to: ['replay_to_example_data'],
				source: 'source_example_data',
				source_arn: 'source_arn_example_data'
			};

			const SESProvider = global.SixCRM.routes.include('controllers', 'providers/ses-provider.js');
			const sesprovider = new SESProvider();

			return sesprovider.createParametersObject(params).then((result) => {
				expect(result).to.deep.equal({
					"Destination": {
						"ToAddresses": [
							"to_example_data"
						]
					},
					"Message": {
						"Body": {
							"Html": {
								"Charset": "UTF-8",
								"Data": "html_example_data"
							}
						},
						"Subject": {
							"Charset": "UTF-8",
							"Data": "subject_example_data"
						}
					},
					"ReplyToAddresses": [
						"replay_to_example_data"
					],
					"Source": "source_example_data",
					"SourceArn": "source_arn_example_data"
				});
			});
		});

		it('creates parameters object from differently specified data', () => {

			//valid params structure with sample data
			let params = {
				to: 'to_example_data',
				body: {text: 'text_example_data'},
				reply_to: 'replay_to_example_data'
			};

			const SESProvider = global.SixCRM.routes.include('controllers', 'providers/ses-provider.js');
			const sesprovider = new SESProvider();

			return sesprovider.createParametersObject(params).then((result) => {
				expect(result).to.deep.equal({
					"Destination": {
						"ToAddresses": [
							"to_example_data"
						]
					},
					"Message": {
						"Body": {
							"Text": {
								"Charset": "UTF-8",
								"Data": "text_example_data"
							}
						}
					},
					"ReplyToAddresses": [
						"replay_to_example_data"
					],
					"Source": "info@sixcrm.com"
				});
			});
		});
	});

	describe('sendEmail', () => {

		it('sends email with specified data', () => {

			//valid params structure with sample data
			let params = {
				to: 'to_example_data',
				body: {text: 'text_example_data'},
				reply_to: 'replay_to_example_data'
			};

			const SESProvider = global.SixCRM.routes.include('controllers', 'providers/ses-provider.js');
			const sesprovider = new SESProvider();

			sesprovider.ses = {
				sendEmail: function(params, callback) {
					callback(null, 'success')
				}
			};

			return sesprovider.sendEmail(params).then((result) => {
				expect(result).to.equal('success');
			});
		});

		it('throws error when email hasn\'t been sent', () => {

			//valid params structure with sample data
			let params = {
				to: 'to_example_data',
				body: {text: 'text_example_data'},
				reply_to: 'replay_to_example_data'
			};

			const SESProvider = global.SixCRM.routes.include('controllers', 'providers/ses-provider.js');
			const sesprovider = new SESProvider();

			sesprovider.ses = {
				sendEmail: function(params, callback) {
					callback('fail', null)
				}
			};

			return sesprovider.sendEmail(params).catch((error) => {
				expect(error).to.equal('fail');
			});
		});
	});
});
