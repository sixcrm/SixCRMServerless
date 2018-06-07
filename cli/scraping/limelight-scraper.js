const request = require('request-promise');
const cheerio = require('cheerio');
const _ = require('lodash');
const BBPromise = require('bluebird');
const fs = require('fs-extra');
const path = require('path');

module.exports = class LimelightScraper {

	constructor(host, user, password, artifactsDirectory) {

		this._url = `https://${host}/admin`;
		this._user = user;
		this._password = password;
		this._artifactsDirectory = artifactsDirectory;

	}

	async signOn() {

		const res = await request.post({
			url: `${this._url}/login.php`,
			followRedirect: true,
			simple: false,
			resolveWithFullResponse: true,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Accept': '*/*',
				'User-Agent': 'Restler for node.js'
			},
			form: {
				login_url: '',
				admin_name: this._user,
				admin_pass: this._password
			}
		});

		const cookieHeader = res.headers['set-cookie'];

		if (!cookieHeader || cookieHeader.length < 1) {

			throw new Error('Failed to get sign on cookie for post');

		}

		const cookie = cookieHeader[0];

		const dashboard = await request.get({
			url: `${this._url}/dashboard.php`,
			headers: {
				'Content-Type': 'text/html; charset=UTF-8',
				'Accept': '*/*',
				'User-Agent': 'Restler for node.js',
				'Cookie': cookie
			}
		});

		if (dashboard.indexOf('Sign-In') > -1) {

			throw new Error('Failed to log into Limelight');

		}

		return cookie;

	}

	async getGateways(cookie) {

		await this._initializeGateways(cookie);

		const ids = await this._getGatewayIds(cookie);

		const gateways = await BBPromise.reduce(ids, async (memo, id) => {

			memo.push(await this._getGatewayDetails(cookie, id));
			return memo;

		}, []);

		await fs.writeJson(path.join(this._artifactsDirectory, 'scraped-gateways.json'), gateways);

	}

	async _initializeGateways(cookie) {

		const url = `${this._url}/my_providers/index.php?filter[type]=payment`;

		await request.get({
			url,
			followRedirect: true,
			simple: false,
			resolveWithFullResponse: true,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Accept': '*/*',
				'User-Agent': 'Restler for node.js',
				Cookie: cookie.split(';')[0]
			}
		});

	}

	async _getGatewayIds(cookie) {

		const url = `${this._url}/ajax_min.php?draw=1&columns%5B0%5D%5Bdata%5D=ID&columns%5B0%5D%5Bname%5D=&columns%5B0%5D%5Bsearchable%5D=false&columns%5B0%5D%5Borderable%5D=false&columns%5B0%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B0%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B1%5D%5Bdata%5D=LOGO_IMG&columns%5B1%5D%5Bname%5D=LOGO_IMG&columns%5B1%5D%5Bsearchable%5D=true&columns%5B1%5D%5Borderable%5D=false&columns%5B1%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B1%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B2%5D%5Bdata%5D=ACCOUNT_NAME&columns%5B2%5D%5Bname%5D=&columns%5B2%5D%5Bsearchable%5D=true&columns%5B2%5D%5Borderable%5D=true&columns%5B2%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B2%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B3%5D%5Bdata%5D=PROVIDER_TYPE_FORMATTED&columns%5B3%5D%5Bname%5D=PROVIDER_TYPE_FORMATTED&columns%5B3%5D%5Bsearchable%5D=true&columns%5B3%5D%5Borderable%5D=true&columns%5B3%5D%5Bsearch%5D%5Bvalue%5D=payment&columns%5B3%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B4%5D%5Bdata%5D=ALIAS_NAME&columns%5B4%5D%5Bname%5D=ALIAS_NAME&columns%5B4%5D%5Bsearchable%5D=true&columns%5B4%5D%5Borderable%5D=true&columns%5B4%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B4%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B5%5D%5Bdata%5D=GLOBAL_CAP&columns%5B5%5D%5Bname%5D=GLOBAL_CAP&columns%5B5%5D%5Bsearchable%5D=true&columns%5B5%5D%5Borderable%5D=true&columns%5B5%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B5%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B6%5D%5Bdata%5D=CURRENCY&columns%5B6%5D%5Bname%5D=&columns%5B6%5D%5Bsearchable%5D=true&columns%5B6%5D%5Borderable%5D=false&columns%5B6%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B6%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B7%5D%5Bdata%5D=MID_GROUP&columns%5B7%5D%5Bname%5D=MID_GROUP&columns%5B7%5D%5Bsearchable%5D=true&columns%5B7%5D%5Borderable%5D=true&columns%5B7%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B7%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B8%5D%5Bdata%5D=CVV_TYPE&columns%5B8%5D%5Bname%5D=CVV_TYPE&columns%5B8%5D%5Bsearchable%5D=true&columns%5B8%5D%5Borderable%5D=true&columns%5B8%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B8%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B9%5D%5Bdata%5D=CREATE_DATE_FORMATTED&columns%5B9%5D%5Bname%5D=CREATE_DATE_FORMATTED&columns%5B9%5D%5Bsearchable%5D=true&columns%5B9%5D%5Borderable%5D=true&columns%5B9%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B9%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B10%5D%5Bdata%5D=STATUS_FORMATTED&columns%5B10%5D%5Bname%5D=STATUS_FORMATTED&columns%5B10%5D%5Bsearchable%5D=true&columns%5B10%5D%5Borderable%5D=true&columns%5B10%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B10%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B11%5D%5Bdata%5D=PROVIDER_TYPE_ID&columns%5B11%5D%5Bname%5D=&columns%5B11%5D%5Bsearchable%5D=true&columns%5B11%5D%5Borderable%5D=false&columns%5B11%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B11%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B12%5D%5Bdata%5D=ROW_ACTIONS&columns%5B12%5D%5Bname%5D=&columns%5B12%5D%5Bsearchable%5D=true&columns%5B12%5D%5Borderable%5D=false&columns%5B12%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B12%5D%5Bsearch%5D%5Bregex%5D=false&start=0&length=10&search%5Bvalue%5D=&search%5Bregex%5D=false&list_id=my_providers&action=ll_my_providers_ajax&method=draw_list&_=1528382510049`;

		const res = await request.get({
			url,
			followRedirect: true,
			simple: false,
			resolveWithFullResponse: true,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Accept': 'application/json',
				'User-Agent': 'Restler for node.js',
				Cookie: cookie.split(';')[0]
			}
		});

		const gatewaysData = JSON.parse(res.body);
		const gatewayIds = _.map(gatewaysData.data, 'ID');
		return gatewayIds;

	}

	async _getGatewayDetails(cookie, id) {

		const url = `${this._url}/ajax_min.php`;

		const res = await request.get({
			url,
			followRedirect: true,
			simple: false,
			resolveWithFullResponse: true,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Accept': 'application/json',
				'User-Agent': 'Restler for node.js',
				Cookie: cookie.split(';')[0]
			},
			qs: {
				action: 'll_ajax_crud',
				mode: 'view',
				profile_id: String(id),
				provider_type_id: 1
			}
		});

		const content = JSON.parse(res.body).content;

		const $ = cheerio.load(content);
		const usernameElement = $('input[name="Username"]');
		const passwordElement = $('input[id="Password"]');
		const statusElement = $('input[name="profile_status"]');
		const aliasElement = $('input[name="profile_alias"]');
		const currency = $('select[id="Currency"] option:selected').text();
		const postProcessorId = $('select[id="Post Processor ID"] option:selected').text();
		const captureOnShipment = $('select[id="Capture on Shipment?"] option:selected').text();
		const preAuthFilter = $('select[id="Capture on Shipment?"] option:selected').text();
		const postProductDesc = $('select[id="Post Product Description?"] option:selected').text();
		const mdf1 = $('input[name="MDF1"]');
		const mdf2 = $('input[name="MDF2"]');
		const mdf3 = $('input[name="MDF3"]');
		const mdf4 = $('input[name="MDF4"]');
		const mdf5 = $('input[name="MDF5"]');
		const mdf6 = $('input[name="MDF6"]');
		const mdf7 = $('input[name="MDF7"]');
		const mdf8 = $('input[name="MDF8"]');
		const mdf9 = $('input[name="MDF9"]');
		const mdf10 = $('input[name="MDF10"]');
		const mdf11 = $('input[name="MDF11"]');
		const mdf12 = $('input[name="MDF12"]');
		const mdf13 = $('input[name="MDF13"]');
		const mdf14 = $('input[name="MDF14"]');
		const mdf15 = $('input[name="MDF15"]');
		const mdf16 = $('input[name="MDF16"]');
		const mdf17 = $('input[name="MDF17"]');
		const mdf18 = $('input[name="MDF18"]');
		const mdf19 = $('input[name="MDF19"]');
		const mdf20 = $('input[name="MDF20"]');
		const test = $('select[id="Test Mode"] option:selected').text();
		const postPhone = $('select[id="Post Phone"] option:selected').text();
		const requiredSSN = $('select[id="Required SSN"] option:selected').text();
		const useDeclineSalvage = $('select[id="Use Decline Salvage?"] option:selected').text();

		const merchantDesc = $('input[name="descriptor"]');
		const merchantId = $('input[name="mid merchant account id"]');
		const customerServiceNumber = $('input[name="customer service number"]');
		const midGroup = $('input[name="mid group"]');
		const processor = $('select[id="processor id"] option:selected').text();
		const vertical = $('select[id="vertical id"] option:selected').text();

		const visa = $('input[name="visa"]');
		const mastercard = $('input[name="mastercard"]');
		const discover = $('input[name="Discover"]');
		const americanExpress = $('input[name="american express"]');
		const other = $('input[name="other"]');
		const cvv = $('select[id="cvv"] option:selected').text();
		const globalMonthlyCap = $('input[name="global monthly cap"]');
		const monthlyFee = $('input[name="monthly fee"]');
		const batchFee = $('input[name="batch fee"]');
		const transactionFee = $('input[name="transaction fee"]');
		const chargebackFee = $('input[name="chargeback fee"]');
		const reservePercent = $('input[name="reserve percent"]');
		const reserveTerm = $('select[id="reserve term id"] option:selected').text();
		const reserveTermDays = $('input[name="reserve term days"]');
		const reserveCap = $('input[name="reserve cap"]');

		return {
			credentials: {
				user: usernameElement.val(),
				password: passwordElement.val(),
				status: statusElement.val(),
				alias: aliasElement.val(),
				currency,
				postProcessorId,
				captureOnShipment,
				preAuthFilter,
				postProductDesc,
				mdf1: mdf1.val(),
				mdf2: mdf2.val(),
				mdf3: mdf3.val(),
				mdf4: mdf4.val(),
				mdf5: mdf5.val(),
				mdf6: mdf6.val(),
				mdf7: mdf7.val(),
				mdf8: mdf8.val(),
				mdf9: mdf9.val(),
				mdf10: mdf10.val(),
				mdf11: mdf11.val(),
				mdf12: mdf12.val(),
				mdf13: mdf13.val(),
				mdf14: mdf14.val(),
				mdf15: mdf15.val(),
				mdf16: mdf16.val(),
				mdf17: mdf17.val(),
				mdf18: mdf18.val(),
				mdf19: mdf19.val(),
				mdf20: mdf20.val(),
				test,
				postPhone,
				requiredSSN,
				useDeclineSalvage
			},
			merchantAccountDetails: {
				merchantDesc: merchantDesc.val(),
				merchantId: merchantId.val(),
				customerServiceNumber: customerServiceNumber.val(),
				midGroup: midGroup.val(),
				processor,
				vertical
			},
			limitsAndFees: {
				visa: visa.val(),
				mastercard: mastercard.val(),
				discover: discover.val(),
				americanExpress: americanExpress.val(),
				other: other.val(),
				cvv,
				globalMonthlyCap: globalMonthlyCap.val(),
				monthlyFee: monthlyFee.val(),
				batchFee: batchFee.val(),
				transactionFee: transactionFee.val(),
				chargebackFee: chargebackFee.val(),
				reservePercent: reservePercent.val(),
				reserveTerm,
				reserveTermDays: reserveTermDays.val(),
				reserveCap: reserveCap.val()
			}
		}

	}

}
