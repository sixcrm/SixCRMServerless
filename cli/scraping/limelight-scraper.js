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

		await fs.writeJson(path.join(this._artifactsDirectory, 'scraped-gateways.json'), gateways, {
			spaces: 4
		});

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
		const discover = $('input[name="discover"]');
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
			id,
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

		await fs.writeJson(path.join(this._artifactsDirectory, 'scraped-payment-routes.json'), gateways, {
			spaces: 4
		});

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
		const paymentRoutingProcess = $('select[id="lbc_process_type"] option:selected').text();
		const midGroupRouting = $('select[id="mid_group_setting_id"] option:selected').text();
		const currency = $('#currency');
		const totalGateways = $('#total_gateways');
		const totalCampaigns = $('#total_campaigns');
		const processingAmt = $('#processing_amount');
		const amtRemaining = $('#remaining_amount');
		const amtUsed = $('#amount_used');
		const monthlyForecast = $('#monthly_forecast');
		const remainingForecastedRevenue = $('#remaining_forecasted_revenue');

		const gatewaysTable = $('#gateway_list table tbody');

		const gateways = _.reduce(gatewaysTable.children(), (memo, row, i) => {

			if (i < 2 || i === gatewaysTable.children().length - 1) {

				return memo;

			}

			const active = this._cleanseOutput($(row.children[1]).text());
			const id = this._cleanseOutput($(row.children[5]).text().split('(')[1]).replace(/\)/, '');
			const alias = this._cleanseOutput($(row.children[5]).text().split('(')[0]);
			const initialOrderLimit = this._cleanseOutput($($(row).find($(`#initial_limit input[id="initial_${id}_input"]`))[0]).val());
			const rebillOrderLimit = this._cleanseOutput($($(row).find($(`#rebill_limit input[id="initial_${id}_input"]`))[0]).val());
			const monthlyCap = this._cleanseOutput($(`input[id="${id}_input"]`).val());
			const preserveBilling = this._cleanseOutput($(`input[id="${id}_preserve_gateway"]`).val());
			const reserveGateway = $($(row).find($(`.is_reserve`))[0]).val();
			const globalCapRemaining = this._cleanseOutput($(`input[id="${id}_balance"]`).val());
			const globalMonthlyRemaining = this._cleanseOutput($($(row).find($('.global-monthly-remaining-percentage'))[0]).text());
			const reserveForecastedRevenue = this._cleanseOutput($(row.children[15]).text());
			const currentMonthlyCharges = this._cleanseOutput($(row.children[17]).text());
			const remainingBalance = this._cleanseOutput($(row.children[19]).text());
			const currentWeight = this._cleanseOutput($(row.children[21]).text());

			memo.push({
				id,
				alias,
				active,
				initialOrderLimit,
				rebillOrderLimit,
				monthlyCap,
				preserveBilling,
				reserveGateway,
				globalCapRemaining,
				globalMonthlyRemaining,
				reserveForecastedRevenue,
				currentMonthlyCharges,
				remainingBalance,
				currentWeight
			});

			return memo;

		}, []);

		return {
			id,
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
			remainingForecastedRevenue: remainingForecastedRevenue.text(),
			gateways
		}

	}

	async getCampaigns(cookie, ids) {

		const campaigns = await BBPromise.reduce(ids, async (memo, id) => {

			memo.push(await this._getCampaignDetail(cookie, id));
			return memo;

		}, []);

		await fs.writeJson(path.join(this._artifactsDirectory, 'scraped-campaigns.json'), campaigns, {
			spaces: 4
		});

	}

	async _getCampaignDetail(cookie, id) {

		const url = `${this._url}/campaign/profile.php`;

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

		const currency = this._cleanseOutput($('#campaign_currency').text());
		const name = this._cleanseOutput($('#input_campaign_name_id').val());
		const desc = this._cleanseOutput($('#campaign_description').text());
		const ccGateway = $('select[id="gateway_id"] option:selected').text();
		const paymentRouting = $('select[id="gateway_lbc_id"] option:selected').text();

		const productsTable = $('.product-table-row tbody');

		const products = _.reduce(productsTable.children(), (memo, row, i) => {

			if (i === productsTable.length - 1) {

				return memo;

			}

			const cell = $(row.children[1]);
			const id = this._cleanseOutput($(cell.find($('input[id="products_main_id"]'))[0]).val());

			memo.push({
				id
			});

			return memo;

		}, []);

		return {
			id,
			name,
			desc,
			currency,
			ccGateway,
			paymentRouting,
			products
		}

	}

	async getProducts(cookie, ids) {

		const products = await BBPromise.reduce(ids, async (memo, id) => {

			memo.push(await this._getProductDetail(cookie, id));
			return memo;

		}, []);

		await fs.writeJson(path.join(this._artifactsDirectory, 'scraped-products.json'), products, {
			spaces: 4
		});

	}

	async _getProductDetail(cookie, id) {

		const url = `${this._url}/products/products.php`;

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
				product_id: id,
				use_new: 1
			}
		});

		const $ = cheerio.load(res.body);

		const name = this._cleanseOutput($('#product_name').val());
		const sku = this._cleanseOutput($('#product_sku').val());
		const vertical = this._cleanseOutput($('select[id="product_vertical"] option:selected').text());
		const category = this._cleanseOutput($('select[id="product_category"] option:selected').text());
		const price = this._cleanseOutput($('#product_price').val());
		const costOfGoods = this._cleanseOutput($('#product_cost_price').val());
		const restockFee = this._cleanseOutput($('#product_restocking_fee').val());
		const maxQty = this._cleanseOutput($('#product_max_qty').val());
		const desc = this._cleanseOutput($('#product_description').text());
		const shippable = $('#product_shippable').val();
		const nextRecurringProduct = this._cleanseOutput($('select[name="recurring_next_product"] option:selected').text());
		const subscriptionType = this._cleanseOutput($('select[id="subscription_type"] option:selected').text());
		const daysToNextBilling = this._cleanseOutput($('#recurring_days').val());
		const maxDiscount = this._cleanseOutput(this._cleanseOutput($('#recurring_discount_max').val()));
		const preserveQuantity = $('#preserve_quantity').val();

		return {
			id,
			name,
			sku,
			vertical,
			category,
			price,
			costOfGoods,
			restockFee,
			maxQty,
			desc,
			shippable,
			nextRecurringProduct,
			subscriptionType,
			daysToNextBilling,
			maxDiscount,
			preserveQuantity
		}

	}

	async getEmailTemplates(cookie) {

		const ids = await this._getEmailTemplateIds(cookie);
		const templates = await BBPromise.reduce(ids, async (memo, id) => {

			memo.push(await this._getEmailTemplate(cookie, id));
			return memo;

		}, []);

		await fs.writeJson(path.join(this._artifactsDirectory, 'scraped-email-templates.json'), templates, {
			spaces: 4
		});

	}

	async _getEmailTemplateIds(cookie) {

		const url = `${this._url}/notifications/notifications.php?SQL_HASH=fbff594eb8408332f4acf749b6224d20&PAGE_ID=notifications.php&LIST_NAME=templates&BUTTON_VALUE=templateListJump&LIST_FILTER_ALL=&list_jump=1&LIST_COL_SORT=&LIST_COL_SORT_ORDER=ASC&ROW_LIMIT=1000&LIST_SEQUENCE=1`;

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

		const json = JSON.parse(res.body);

		const $ = cheerio.load(json.list);

		const table = $('.list tbody');

		const ids = _.reduce(table.children(), (memo, row, i) => {

			if (i < 1 || i === table.children().length - 1) {

				return memo;

			}

			const cell = $(row.children[1]);
			const id = this._cleanseOutput(cell.text());

			memo.push(id);
			return memo;

		}, []);

		return ids;

	}

	async _getEmailTemplate(cookie, id) {

		const url = `${this._url}/notifications/notification_edit.php`;

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
				templateId: id
			}
		});

		const $ = cheerio.load(res.body);

		const subject = this._cleanseOutput($('#templateSubject').val());
		const name = this._cleanseOutput($('#templateName').val());
		const description = this._cleanseOutput($('#templateDesc').text());
		const active = $('#active').val();
		const plainText = this._cleanseOutput($('#templatePlainT').text());
		const html = $('textarea[name=templateHTML]').text();

		return {
			id,
			subject,
			name,
			description,
			active,
			plainText,
			html
		}

	}

	async getSMTPProviders(cookie) {

		const ids = await this._getSMTPProviderIds(cookie);

		const smtpProviders = await BBPromise.reduce(ids, async (memo, id) => {

			memo.push(await this._getSMTPProviderDetail(cookie, id));
			return memo;

		}, []);

		await fs.writeJson(path.join(this._artifactsDirectory, 'scraped-smtp-providers.json'), smtpProviders, {
			spaces: 4
		});

	}

	async _getSMTPProviderIds(cookie) {

		const url = `${this._url}/smtp/smtp.php?SQL_HASH=36fcd15087e8715059fa1adfc0abc5e6&PAGE_ID=smtp.php&LIST_NAME=smtpList&BUTTON_VALUE=smtpListJump&LIST_FILTER_ALL=&list_jump=1&LIST_COL_SORT=&LIST_COL_SORT_ORDER=ASC&ROW_LIMIT=1000&LIST_SEQUENCE=1`;

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

		const json = JSON.parse(res.body);

		const $ = cheerio.load(json.list);

		const table = $('.list tbody');

		const ids = _.reduce(table.children(), (memo, row, i) => {

			if (i < 1 || i === table.children().length - 1) {

				return memo;

			}

			const cell = $(row.children[1]);
			const id = this._cleanseOutput(cell.text());

			memo.push(id);
			return memo;

		}, []);

		return ids;

	}

	async _getSMTPProviderDetail(cookie, id) {

		const url = `${this._url}/smtp/smtp_edit.php`;

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
				smtpId: id
			}
		});

		const $ = cheerio.load(res.body);

		const name = this._cleanseOutput($('#smtpName').val());
		const host = this._cleanseOutput($('#smtpHost').val());
		const domain = this._cleanseOutput($('#smtpDomain').val());
		const port = this._cleanseOutput($('#smtpPort').val());
		const email = this._cleanseOutput($('#smtpEmail').val());
		const mailFrom = this._cleanseOutput($('#smtpMailFrom').val());
		const username = this._cleanseOutput($('#smtpUsername').val());
		const password = this._cleanseOutput($('#smtpPassword').val());
		const useAuth = $('input[name=smtpUseAuth]').val();
		const publish = $('input[name=active]').val();

		return {
			id,
			name,
			host,
			domain,
			port,
			email,
			mailFrom,
			username,
			password,
			useAuth,
			publish
		}

	}

	async getFulfillmentProviders(cookie) {

		const ids = await this._getFulfillmentProviderIds(cookie);

		const fulfillmentProviders = await BBPromise.reduce(ids, async (memo, id) => {

			memo.push(await this._getFulfillmentProviderDetail(cookie, id));
			return memo;

		}, []);

		await fs.writeJson(path.join(this._artifactsDirectory, 'scraped-fulfillment-providers.json'), fulfillmentProviders, {
			spaces: 4
		});

	}

	async _getFulfillmentProviderIds(cookie) {

		await request.get({
			url: `${this._url}/my_providers/index.php`,
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

		const url = `${this._url}/ajax_min.php?draw=6&columns%5B0%5D%5Bdata%5D=ID&columns%5B0%5D%5Bname%5D=&columns%5B0%5D%5Bsearchable%5D=false&columns%5B0%5D%5Borderable%5D=false&columns%5B0%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B0%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B1%5D%5Bdata%5D=LOGO_IMG&columns%5B1%5D%5Bname%5D=LOGO_IMG&columns%5B1%5D%5Bsearchable%5D=true&columns%5B1%5D%5Borderable%5D=false&columns%5B1%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B1%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B2%5D%5Bdata%5D=ACCOUNT_NAME&columns%5B2%5D%5Bname%5D=&columns%5B2%5D%5Bsearchable%5D=true&columns%5B2%5D%5Borderable%5D=true&columns%5B2%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B2%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B3%5D%5Bdata%5D=PROVIDER_TYPE_FORMATTED&columns%5B3%5D%5Bname%5D=PROVIDER_TYPE_FORMATTED&columns%5B3%5D%5Bsearchable%5D=true&columns%5B3%5D%5Borderable%5D=true&columns%5B3%5D%5Bsearch%5D%5Bvalue%5D=Fulfillment&columns%5B3%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B4%5D%5Bdata%5D=ALIAS_NAME&columns%5B4%5D%5Bname%5D=ALIAS_NAME&columns%5B4%5D%5Bsearchable%5D=true&columns%5B4%5D%5Borderable%5D=true&columns%5B4%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B4%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B5%5D%5Bdata%5D=GLOBAL_CAP&columns%5B5%5D%5Bname%5D=GLOBAL_CAP&columns%5B5%5D%5Bsearchable%5D=true&columns%5B5%5D%5Borderable%5D=true&columns%5B5%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B5%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B6%5D%5Bdata%5D=CURRENCY&columns%5B6%5D%5Bname%5D=&columns%5B6%5D%5Bsearchable%5D=true&columns%5B6%5D%5Borderable%5D=false&columns%5B6%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B6%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B7%5D%5Bdata%5D=MID_GROUP&columns%5B7%5D%5Bname%5D=MID_GROUP&columns%5B7%5D%5Bsearchable%5D=true&columns%5B7%5D%5Borderable%5D=true&columns%5B7%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B7%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B8%5D%5Bdata%5D=CVV_TYPE&columns%5B8%5D%5Bname%5D=CVV_TYPE&columns%5B8%5D%5Bsearchable%5D=true&columns%5B8%5D%5Borderable%5D=true&columns%5B8%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B8%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B9%5D%5Bdata%5D=CREATE_DATE_FORMATTED&columns%5B9%5D%5Bname%5D=CREATE_DATE_FORMATTED&columns%5B9%5D%5Bsearchable%5D=true&columns%5B9%5D%5Borderable%5D=true&columns%5B9%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B9%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B10%5D%5Bdata%5D=STATUS_FORMATTED&columns%5B10%5D%5Bname%5D=STATUS_FORMATTED&columns%5B10%5D%5Bsearchable%5D=true&columns%5B10%5D%5Borderable%5D=true&columns%5B10%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B10%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B11%5D%5Bdata%5D=PROVIDER_TYPE_ID&columns%5B11%5D%5Bname%5D=&columns%5B11%5D%5Bsearchable%5D=true&columns%5B11%5D%5Borderable%5D=false&columns%5B11%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B11%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B12%5D%5Bdata%5D=ROW_ACTIONS&columns%5B12%5D%5Bname%5D=&columns%5B12%5D%5Bsearchable%5D=true&columns%5B12%5D%5Borderable%5D=false&columns%5B12%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B12%5D%5Bsearch%5D%5Bregex%5D=false&start=0&length=1000&search%5Bvalue%5D=&search%5Bregex%5D=false&list_id=my_providers&action=ll_my_providers_ajax&method=draw_list&_=1528976763051`;

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

		const json = JSON.parse(res.body);

		return json.data.map(d => d.ID);

	}

	async _getFulfillmentProviderDetail(cookie, id) {

		const url = `${this._url}/ajax_min.php`;

		const res = await request.post({
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
			form: {
				action:'ll_ajax_crud',
				mode:'view',
				profile_id: 1,
				provider_type_id: 2
			}
		});

		const json = JSON.parse(res.body);

		const $ = cheerio.load(json.content);

		// this is going to be different per provider....

		const alias = this._cleanseOutput($('#profile_alias').val());
		const active =  this._cleanseOutput($('input[name=profile_status]').val());
		const billingCode =  this._cleanseOutput($('select[id="Billing Code"] option:selected').text());
		const combineSimilarAddresses = this._cleanseOutput($('select[id="Combine Similar Addresses"] option:selected').text());
		const customerID = this._cleanseOutput($('input[id="Customer ID"]').val());
		const delayHours = this._cleanseOutput($('input[id="Delay Hours"]').val());
		const password = this._cleanseOutput($('input[id="Password"]').val());
		const recieveTrackingNumber = this._cleanseOutput($('select[id="Receive Tracking #"] option:selected').text());
		const username = this._cleanseOutput($('input[id="Username"]').val());
		const warehouseId = this._cleanseOutput($('input[id="Warehouse ID"]').val());
		const worldEasyId = this._cleanseOutput($('input[id="World Easy ID"]').val());
		const worldEasyKey = this._cleanseOutput($('input[id="World Easy Key"]').val());

		return {
			id,
			alias,
			active,
			billingCode,
			combineSimilarAddresses,
			customerID,
			delayHours,
			password,
			recieveTrackingNumber,
			username,
			warehouseId,
			worldEasyId,
			worldEasyKey
		}

	}

	_cleanseOutput(val) {

		if (!_.isString(val)) {

			return val;

		}

		return _.trim(val.replace(/\n/g, ''));

	}

}
