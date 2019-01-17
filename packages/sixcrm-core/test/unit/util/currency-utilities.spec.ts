import * as chai from 'chai';
const expect = chai.expect;
import currencyutilities from '../../../src/util/currency-utilities';
import arrayutilities from '../../../src/util/array-utilities';

function getValidCurrencyStrings() {
	return ['$1.00', '$32.94', '$0.22', '$0.00'];
}

function getValidCurrencyNumbers() {
	return [1.00, 32.94, 0.22, 0.00];
}

describe('lib/currency-utilities.js', () => {

	it('toCurrency from number', () => {

		const currency_numbers = getValidCurrencyNumbers();

		arrayutilities.map(currency_numbers, (currency_number) => {

			expect(currencyutilities.toCurrency(currency_number)).to.equal(currency_number.toFixed(2));

		});

	});

	it('toCurrency from string', () => {

		const currency_numbers = getValidCurrencyNumbers();
		const currency_strings = getValidCurrencyStrings();

		let index = 0;

		arrayutilities.map(currency_strings, (currency_string) => {

			currency_string = currency_string.substring(1);

			expect(currencyutilities.toCurrency(currency_string)).to.equal(currency_numbers[index].toFixed(2));
			index++;
		});

	});

	it('toCurrency from invalid values', () => {

		const any_currency_values = [true, false]; // random values that are not string nor int

		expect(currencyutilities.toCurrency(any_currency_values as any)).to.equal(null);

	});

	it('toCurrencyString', () => {

		const currency_numbers = getValidCurrencyNumbers();
		const currency_strings = getValidCurrencyStrings();

		let index = 0;

		arrayutilities.map(currency_numbers, (currency_number) => {

			expect(currencyutilities.toCurrencyString(currency_number)).to.equal(currency_strings[index]);
			index++;

		});

	});

});

describe('isCurrency', () => {

	it('returns true', () => {

		const good_currency = [1.23, '1.23', 30, 4000.00, '4,001.00'];

		good_currency.map((currency) => {

			expect(currencyutilities.isCurrency(currency as any)).to.equal(true);

		});

	});

	it('returns false', () => {

		const bad_currency = [[], {}, null, 'adjawiudaoiwjdoa'];

		bad_currency.map((currency) => {

			expect(currencyutilities.isCurrency(currency as any)).to.equal(false);

		});

	});

});
