const chai = require('chai');
const expect = chai.expect;
const currencyutilities = global.SixCRM.routes.include('lib', 'currency-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

function getValidCurrencyStrings(){
	return ['$1.00', '$32.94', '$0.22', '$0.00'];
}

function getValidCurrencyNumbers(){
	return [1.00, 32.94, 0.22, 0.00];
}

describe('lib/currency-utilities.js', () => {

	it('toCurrency from number', () => {

		let currency_numbers = getValidCurrencyNumbers();

		arrayutilities.map(currency_numbers, currency_number => {

			expect(currencyutilities.toCurrency(currency_number)).to.equal(currency_number.toFixed(2));

		});

	});

	it('toCurrency from string', () => {

		let currency_numbers = getValidCurrencyNumbers();
		let currency_strings = getValidCurrencyStrings();

		let index = 0;

		arrayutilities.map(currency_strings, currency_string => {

			currency_string = currency_string.substring(1);

			expect(currencyutilities.toCurrency(currency_string)).to.equal(currency_numbers[index].toFixed(2));
			index++;
		});

	});

	it('toCurrency from invalid values', () => {

		let any_currency_values = [true, false]; //random values that are not string nor int

		expect(currencyutilities.toCurrency(any_currency_values)).to.equal(null);

	});

	it('toCurrencyString', () => {

		let currency_numbers = getValidCurrencyNumbers();
		let currency_strings = getValidCurrencyStrings();

		let index = 0;

		arrayutilities.map(currency_numbers, currency_number => {

			expect(currencyutilities.toCurrencyString(currency_number)).to.equal(currency_strings[index]);
			index++;

		});

	});

});
