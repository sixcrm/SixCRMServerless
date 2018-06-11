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

		const url = `${this._url}/ajax_min.php?draw=1&columns%5B0%5D%5Bdata%5D=ID&columns%5B0%5D%5Bname%5D=&columns%5B0%5D%5Bsearchable%5D=false&columns%5B0%5D%5Borderable%5D=false&columns%5B0%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B0%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B1%5D%5Bdata%5D=LOGO_IMG&columns%5B1%5D%5Bname%5D=LOGO_IMG&columns%5B1%5D%5Bsearchable%5D=true&columns%5B1%5D%5Borderable%5D=false&columns%5B1%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B1%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B2%5D%5Bdata%5D=ACCOUNT_NAME&columns%5B2%5D%5Bname%5D=&columns%5B2%5D%5Bsearchable%5D=true&columns%5B2%5D%5Borderable%5D=true&columns%5B2%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B2%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B3%5D%5Bdata%5D=PROVIDER_TYPE_FORMATTED&columns%5B3%5D%5Bname%5D=PROVIDER_TYPE_FORMATTED&columns%5B3%5D%5Bsearchable%5D=true&columns%5B3%5D%5Borderable%5D=true&columns%5B3%5D%5Bsearch%5D%5Bvalue%5D=payment&columns%5B3%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B4%5D%5Bdata%5D=ALIAS_NAME&columns%5B4%5D%5Bname%5D=ALIAS_NAME&columns%5B4%5D%5Bsearchable%5D=true&columns%5B4%5D%5Borderable%5D=true&columns%5B4%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B4%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B5%5D%5Bdata%5D=GLOBAL_CAP&columns%5B5%5D%5Bname%5D=GLOBAL_CAP&columns%5B5%5D%5Bsearchable%5D=true&columns%5B5%5D%5Borderable%5D=true&columns%5B5%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B5%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B6%5D%5Bdata%5D=CURRENCY&columns%5B6%5D%5Bname%5D=&columns%5B6%5D%5Bsearchable%5D=true&columns%5B6%5D%5Borderable%5D=false&columns%5B6%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B6%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B7%5D%5Bdata%5D=MID_GROUP&columns%5B7%5D%5Bname%5D=MID_GROUP&columns%5B7%5D%5Bsearchable%5D=true&columns%5B7%5D%5Borderable%5D=true&columns%5B7%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B7%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B8%5D%5Bdata%5D=CVV_TYPE&columns%5B8%5D%5Bname%5D=CVV_TYPE&columns%5B8%5D%5Bsearchable%5D=true&columns%5B8%5D%5Borderable%5D=true&columns%5B8%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B8%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B9%5D%5Bdata%5D=CREATE_DATE_FORMATTED&columns%5B9%5D%5Bname%5D=CREATE_DATE_FORMATTED&columns%5B9%5D%5Bsearchable%5D=true&columns%5B9%5D%5Borderable%5D=true&columns%5B9%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B9%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B10%5D%5Bdata%5D=STATUS_FORMATTED&columns%5B10%5D%5Bname%5D=STATUS_FORMATTED&columns%5B10%5D%5Bsearchable%5D=true&columns%5B10%5D%5Borderable%5D=true&columns%5B10%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B10%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B11%5D%5Bdata%5D=PROVIDER_TYPE_ID&columns%5B11%5D%5Bname%5D=&columns%5B11%5D%5Bsearchable%5D=true&columns%5B11%5D%5Borderable%5D=false&columns%5B11%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B11%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B12%5D%5Bdata%5D=ROW_ACTIONS&columns%5B12%5D%5Bname%5D=&columns%5B12%5D%5Bsearchable%5D=true&columns%5B12%5D%5Borderable%5D=false&columns%5B12%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B12%5D%5Bsearch%5D%5Bregex%5D=false&start=0&length=1000&search%5Bvalue%5D=&search%5Bregex%5D=false&list_id=my_providers&action=ll_my_providers_ajax&method=draw_list&_=1528382510049`;

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
				user: this._cleanseOutput(usernameElement.val()),
				password: this._cleanseOutput(passwordElement.val()),
				status: this._cleanseOutput(statusElement.val()),
				alias: this._cleanseOutput(aliasElement.val()),
				currency: this._cleanseOutput(currency),
				postProcessorId: this._cleanseOutput(postProcessorId),
				captureOnShipment: this._cleanseOutput(captureOnShipment),
				preAuthFilter: this._cleanseOutput(preAuthFilter),
				postProductDesc: this._cleanseOutput(postProductDesc),
				mdf1: this._cleanseOutput(mdf1.val()),
				mdf2: this._cleanseOutput(mdf2.val()),
				mdf3: this._cleanseOutput(mdf3.val()),
				mdf4: this._cleanseOutput(mdf4.val()),
				mdf5: this._cleanseOutput(mdf5.val()),
				mdf6: this._cleanseOutput(mdf6.val()),
				mdf7: this._cleanseOutput(mdf7.val()),
				mdf8: this._cleanseOutput(mdf8.val()),
				mdf9: this._cleanseOutput(mdf9.val()),
				mdf10: this._cleanseOutput(mdf10.val()),
				mdf11: this._cleanseOutput(mdf11.val()),
				mdf12: this._cleanseOutput(mdf12.val()),
				mdf13: this._cleanseOutput(mdf13.val()),
				mdf14: this._cleanseOutput(mdf14.val()),
				mdf15: this._cleanseOutput(mdf15.val()),
				mdf16: this._cleanseOutput(mdf16.val()),
				mdf17: this._cleanseOutput(mdf17.val()),
				mdf18: this._cleanseOutput(mdf18.val()),
				mdf19: this._cleanseOutput(mdf19.val()),
				mdf20: this._cleanseOutput(mdf20.val()),
				test: this._cleanseOutput(test),
				postPhone: this._cleanseOutput(postPhone),
				requiredSSN: this._cleanseOutput(requiredSSN),
				useDeclineSalvage: this._cleanseOutput(useDeclineSalvage)
			},
			merchantAccountDetails: {
				merchantDesc: this._cleanseOutput(merchantDesc.val()),
				merchantId: this._cleanseOutput(merchantId.val()),
				customerServiceNumber: this._cleanseOutput(customerServiceNumber.val()),
				midGroup: this._cleanseOutput(midGroup.val()),
				processor: this._cleanseOutput(processor),
				vertical: this._cleanseOutput(vertical)
			},
			limitsAndFees: {
				visa: this._cleanseOutput(visa.val()),
				mastercard: this._cleanseOutput(mastercard.val()),
				discover: this._cleanseOutput(discover.val()),
				americanExpress: this._cleanseOutput(americanExpress.val()),
				other: this._cleanseOutput(other.val()),
				cvv: this._cleanseOutput(cvv),
				globalMonthlyCap: this._cleanseOutput(globalMonthlyCap.val()),
				monthlyFee: this._cleanseOutput(monthlyFee.val()),
				batchFee: this._cleanseOutput(batchFee.val()),
				transactionFee: this._cleanseOutput(transactionFee.val()),
				chargebackFee: this._cleanseOutput(chargebackFee.val()),
				reservePercent: this._cleanseOutput(reservePercent.val()),
				reserveTerm: this._cleanseOutput(reserveTerm),
				reserveTermDays: this._cleanseOutput(reserveTermDays.val()),
				reserveCap: this._cleanseOutput(reserveCap.val())
			}
		}

	}

	async getPaymentRoutes(cookie) {

		const ids = await this._getPaymentRouteConfigurations(cookie);

		const gateways = await BBPromise.reduce(ids, async (memo, id) => {

			memo.push(await this._getPaymentRouteDetail(cookie, id));
			return memo;

		}, []);

		await fs.writeJson(path.join(this._artifactsDirectory, 'scraped-payment-routes.json'), gateways);

	}

	async _getPaymentRouteConfigurations(cookie) {

		const url = `${this._url}/load_balancer/index.php?SQL_HASH=fc43f8cc89911c44fb4b3a07942faf0f&PAGE_ID=index.php&LIST_NAME=load_balance_list&BUTTON_VALUE=listJump&LIST_FILTER_ALL=&list_jump=1&LIST_COL_SORT=&LIST_COL_SORT_ORDER=ASC&ROW_LIMIT=1000&LIST_SEQUENCE=1`;

		const res = await request.get({
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

		const content = JSON.parse(res.body).list;
		const $ = cheerio.load(content);
		const table = $('table tbody');

		const ids = _.reduce(table.children(), (memo, row, i) => {

			if (i === 0) {

				return memo;

			}

			memo.push($(row.children[1]).html());
			return memo;

		}, []);

		if (ids.length > 0) {

			ids.splice(-1, 1);

		}

		return ids;

	}

	async _getPaymentRouteDetail(cookie, id) {

		const url = `${this._url}/load_balancer/profile.php`;

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
				id
			}
		});

		const $ = cheerio.load(res.body);

		const name = $('input[id="name"]');
		const desc = $('#desc');
		const dailyWeightReset = $('input[id="daily_weight_reset_idOn"]');
		const dailyInitialSubscriptionReset = $('input[id="daily_init_subscr_resetOn"]');
		const reserveForecastPercent = $('input[id="reserve_forecast_pct_idOn"]');
		const reserveForecastPercentCycle1 = $('input[name="first_rebill_pct"]');
		const reserveForecastPercentCycle2 = $('input[name="second_rebill_pct"]');
		const reserveForecastPercentCycle3 = $('input[name="third_rebill_pct"]');
		const reserveForecastPercentCycle4 = $('input[name="fourth_rebill_pct"]');
		const reserveForecastPercentCycle5 = $('input[name="fifth_rebill_pct"]');
		const gatewayDeclinesLimit = $('input[id="declines_limit_dummy"]');
		const gatewayDeclinesLimitAmt = $('input[id="declines_limit"]');
		const allowReserveGateways = $('input[id="allow_reserveOn"]');
		const threeDVerifyRouting = $('input[id="token_routing_flagOn"]');
		const strictPreservation = $('input[id="strictPreservation"]');
		const paymentRoutingProcess =  $('select[id="lbc_process_type"] option:selected').text();
		const midGroupRouting = $('select[id="mid_group_setting_id"] option:selected').text();
		const currency = $('#currency');
		const totalGateways = $('#total_gateways');
		const totalCampaigns = $('#total_campaigns');
		const processingAmt = $('#processing_amount');
		const amtRemaining = $('#remaining_amount');
		const amtUsed = $('#amount_used');
		const monthlyForecast = $('#monthly_forecast');
		const remainingForecastedRevenue = $('#remaining_forecasted_revenue');

		return {
			name: this._cleanseOutput(name.val()),
			desc: this._cleanseOutput(desc.val()),
			dailyWeightReset: this._cleanseOutput(dailyWeightReset.val()),
			dailyInitialSubscriptionReset: this._cleanseOutput(dailyInitialSubscriptionReset.val()),
			reserveForecastPercent: this._cleanseOutput(reserveForecastPercent.val()),
			reserveForecastPercentCycle1: this._cleanseOutput(reserveForecastPercentCycle1.val()),
			reserveForecastPercentCycle2: this._cleanseOutput(reserveForecastPercentCycle2.val()),
			reserveForecastPercentCycle3: this._cleanseOutput(reserveForecastPercentCycle3.val()),
			reserveForecastPercentCycle4: this._cleanseOutput(reserveForecastPercentCycle4.val()),
			reserveForecastPercentCycle5: this._cleanseOutput(reserveForecastPercentCycle5.val()),
			gatewayDeclinesLimit: this._cleanseOutput(gatewayDeclinesLimit.val()),
			gatewayDeclinesLimitAmt: this._cleanseOutput(gatewayDeclinesLimitAmt.val()),
			allowReserveGateways: this._cleanseOutput(allowReserveGateways.val()),
			threeDVerifyRouting: this._cleanseOutput(threeDVerifyRouting.val()),
			strictPreservation: this._cleanseOutput(strictPreservation.val()),
			paymentRoutingProcess,
			midGroupRouting,
			currency: currency.text(),
			totalGateways: totalGateways.text(),
			totalCampaigns: totalCampaigns.text(),
			processingAmt: processingAmt.text(),
			amtRemaining: amtRemaining.text(),
			amtUsed: amtUsed.text(),
			monthlyForecast: monthlyForecast.text(),
			remainingForecastedRevenue: remainingForecastedRevenue.text()
		}

	}

	_cleanseOutput(val) {

		if (_.isUndefined(val)) {

			return val;

		}

		return _.trim(val.replace(/\n/g, ''));

	}

}
