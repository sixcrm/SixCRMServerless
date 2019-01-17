import * as chai from 'chai';
const expect = chai.expect;
import stringutilities from '../../../src/util/string-utilities';
import xmlutilities from '../../../src/util/xml-utilities';

describe('lib/xml-utilities', () => {

	const valid_xml_string_1 = "<root>Test</root>";

	const valid_xml_string_2 =
		"<note>\n" +
			"<to>John</to>\n" +
			"<from>Jane</from>\n" +
			"<heading>Reminder</heading>\n" +
			"<body>Example</body>\n" +
		"</note>";

	const valid_xml_string_3 =
		"<characters>\n" +
			"<character>\n" +
				"<name>John</name>\n" +
			"</character>\n" +
			"<character>\n" +
				"<name>Jane</name>\n" +
			"</character>\n" +
		"</characters>";

	describe('parse', () => {

		it('parse', () => {
			expect(xmlutilities.parse(valid_xml_string_1)).to.deep.equal({ root: 'Test' });
			expect(xmlutilities.parse(valid_xml_string_2))
				.to.deep.equal({
					note: {
						to: [ "John" ],
						from: [ "Jane" ],
						heading: [ "Reminder" ],
						body: [ "Example" ]
					}
				});
			expect(xmlutilities.parse(valid_xml_string_3))
				.to.deep.equal({ characters: {
					character: [{
						name: [ "John" ]
					}, {
						name: [ "Jane" ]
					}]
				}
				});
		});

		it('throws error when xml is not valid', () => {

			const unexpected_arguments = [
				'any_string', 'any_string12345',
				-123, null, true, {}, () => {},
				stringutilities.replaceAll(valid_xml_string_1, '</', ''),
				stringutilities.replaceAll(valid_xml_string_2, '/from', 'to'),
				stringutilities.replaceAll(valid_xml_string_3, '<name>', '<n>'),
			];

			unexpected_arguments.forEach((unexpected_argument) => {
				try {
					xmlutilities.parse(unexpected_argument, true);
				} catch (error) {
					expect(error.message).to.equal('[500] Internal Server Error');
				}
			});
		});

		it('throws error when parsing fails', () => {

			try {
				xmlutilities.parse([], true);
			} catch (error) {
				expect(error.message).to.equal('[500] The callback was suddenly async or something.');
			}
		});
	});
});
