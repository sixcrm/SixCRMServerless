
const _ = require('lodash');

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const arrayutilities = require('@sixcrm/sixcrmcore/util/array-utilities').default;
const mathutilities = require('@sixcrm/sixcrmcore/util/math-utilities').default;
const timestamp = require('@sixcrm/sixcrmcore/util/timestamp').default;

module.exports = class ProductScheduleHelper {

	//Tested
	constructor(){

	}

	getHydrated({id}){

		du.debug('Get Hydrated');

		let ProductScheduleController = global.SixCRM.routes.include('controllers', 'entities/ProductSchedule.js');
		const productScheduleController = new ProductScheduleController();

		return productScheduleController.get({id: id}).then(product_schedule => {

			return productScheduleController.getProducts(product_schedule).then(products => {

				return this.marryProductsToSchedule({product_schedule: product_schedule, products: products.products});

			});

		});

	}

	//Tested
	marryProductsToSchedule({product_schedule, products}){

		du.debug('Marry Products To Schedules');

		if(_.has(product_schedule, 'schedule') && arrayutilities.nonEmpty(product_schedule.schedule)){

			if(arrayutilities.nonEmpty(products)){

				arrayutilities.map(product_schedule.schedule, (schedule_element, index) => {

					let found_product = arrayutilities.find(products, product => {

						// Technical Debt: accounting for legacy data ('product_id' exists in legacy data, switched to 'product')
						// Remove at earliest convenience
						return (product.id == schedule_element.product || product.id == schedule_element.product_id);

					});

					if(!_.isNull(found_product)){
						product_schedule.schedule[index].product = found_product;
					}

				});

			}

		}

		return product_schedule;

	}

	//Tested
	getScheduleElementsOnDayInSchedule({product_schedule, day}){

		du.debug('Get Schedule Element By Day In Schedule');

		let scheduled_elements = arrayutilities.filter(product_schedule.schedule, (scheduled_product) => {

			if(parseInt(day) >= parseInt(scheduled_product.start)){

				if(!_.has(scheduled_product, "end") || (parseInt(day) < parseInt(scheduled_product.end))){

					return true;

				}

			}

			return false;

		});

		return (_.isUndefined(scheduled_elements) || _.isNull(scheduled_elements))?null:scheduled_elements;

	}

	//Tested
	calculateNextBillingInSchedule({schedule_element, day}){

		du.debug('Calculate Next Billing In Schedule');

		if(!_.has(schedule_element, 'samedayofmonth') || schedule_element.samedayofmonth !== true){
			return this.calculateNextStandardRecurringBillingInSchedule({schedule_element: schedule_element, day: day});
		}else{
			du.i
			return this.calculateNextMonthlyBillingInSchedule({schedule_element: schedule_element, day: day});
		}

	}

	calculateNextStandardRecurringBillingInSchedule({schedule_element, day}){

		du.debug('Calculate Next Standard Recurring Billing In Schedule');

		return day + (parseInt(schedule_element.period) - (mathutilities.signIdempotentModulus((parseInt(day) - parseInt(schedule_element.start)), parseInt(schedule_element.period))));

	}

	calculateNextMonthlyBillingInSchedule({schedule_element, day}){

		du.debug('Calculare Next Monthly Billing In Schedule');

		if(schedule_element.start > day){

			//A number representing day of the month (1-31)
			const first_billing_day = timestamp.subtractDays(day - schedule_element.start);
			du.info('First billing day: '+first_billing_day);

			return schedule_element.start;

		}

		//A number representing day of the month (1-31)
		const first_billing_day = timestamp.subtractDays(day - schedule_element.start);
		du.info('First billing day: '+first_billing_day);

		const first_billing_dom = timestamp.getDayNumber(first_billing_day);
		du.info('First Billing Day Of Month: '+first_billing_dom);

		//A number representing day of the month (1-31)
		const this_month_bill_dom = Math.min(timestamp.daysInMonth(), first_billing_dom);
		du.info('This Month Bill Day Of Month: '+this_month_bill_dom);

		//A number representing day of the month (1-31)
		const today_dom = timestamp.getDayNumber();
		du.info('Now Day Of Month: '+today_dom);

		if(today_dom >= this_month_bill_dom){

			//1-31
			let next_month_days_in_month = timestamp.daysInMonth(timestamp.nextMonth());
			du.info('Next Month Days In Month: '+next_month_days_in_month);

			//1-31
			let next_month_bill_dom = Math.min(next_month_days_in_month, first_billing_dom);
			du.info('Next Month Bill Day Of Month: '+next_month_bill_dom);


			let next_month_bill_date = timestamp.nextMonth((next_month_bill_dom-1));
			du.info('Next Month Bill Date: '+ next_month_bill_date);

			let days_difference = timestamp.daysDifference(next_month_bill_date);
			du.info('Days Difference: '+days_difference);

			return day + days_difference;

		}

		let this_month_bill_date = timestamp.thisMonth((this_month_bill_dom - 1));
		du.info('This month\'s bill date: '+this_month_bill_date);

		let days_difference = timestamp.daysDifference(this_month_bill_date);
		du.info('Days Difference: '+days_difference);

		return day + days_difference;

	}

	//Tested
	getNextScheduleElement({product_schedule, day}){

		du.debug('Get Next Schedule Element');

		//need to validate?
		//has schedule, is non-empty array

		product_schedule.schedule = arrayutilities.sort(product_schedule.schedule, (a, b) => {
			return (a.start - b.start);
		})

		let next_schedule_element = arrayutilities.find(product_schedule.schedule, (schedule_element) => {

			if(_.has(schedule_element, 'end') && this.calculateNextBillingInSchedule({schedule_element: schedule_element, day: day}) > parseInt(schedule_element.end)){
				return false;
			}

			return true;

		});

		if(_.isNull(next_schedule_element) || _.isUndefined(next_schedule_element)){
			du.debug(day, product_schedule.schedule);
		}

		return next_schedule_element;

	}

	//Tested
	getNextScheduleElementStartDayNumber({day}){

		du.debug('Get Next Period Day');

		let schedule_element = this.getNextScheduleElement(arguments[0]);

		if(_.has(schedule_element, 'start')){

			if(day < schedule_element.start){
				return schedule_element.start;
			}

			return this.calculateNextBillingInSchedule({schedule_element: schedule_element, day: day});

		}

		return null;

	}

	//Tested
	getTransactionProducts({day, product_schedules}){

		du.debug('Get Transaction Products');

		let transaction_products = [];

		product_schedules.forEach((product_schedule) => {

			let schedule_element = this.getScheduleElementByDay({day: day, schedule: product_schedule.schedule});

			transaction_products.push({
				amount: parseFloat(schedule_element.price),
				product: schedule_element.product
			});

		});

		return transaction_products;

	}

	//Tested
	getScheduleElementByDay({day, schedule}){

		du.debug('Get Schedule Element By Day');

		schedule = arrayutilities.sort(schedule, (a, b) => { return a.start - b.start; });

		let return_product = arrayutilities.find(schedule, (schedule_element) => {

			if(parseInt(day) >= parseInt(schedule_element.start)){

				if(!_.has(schedule_element, "end") || parseInt(day) < parseInt(schedule_element.end)){

					return true;

				}

			}

			return false;

		});

		return return_product;

	}

	/* Deprecated?
  productSum({day, product_schedules}){

    du.debug('Product Sum');

    let return_amount = 0.0;

    arrayutilities.reduce(schedules, (sum, schedule) => {

      let schedule_element = this.getScheduleElementByDay({day: day, schedule: schedule.schedule});

      return_amount += parseFloat(schedule_element.price);

    });

    return parseFloat(return_amount);

  }
  */


	getSchedule({product_schedule}){

		//Note:  This is a graph utility method
		du.debug('Get Schedule');

		if(arrayutilities.nonEmpty(product_schedule.schedule)){

			return arrayutilities.map(product_schedule.schedule, (schedule_element) => {
				return this.transformScheduleElement({schedule_element: schedule_element});
			});

		}else{

			return null;

		}

	}

	//Tested
	transformScheduleElement({schedule_element}){

		du.debug('Get Scheduled Product');

		//Technical Debt:  Use the objectutilities.transcribe method.
		let return_object = {
			price: schedule_element.price,
			start: schedule_element.start,
			period: schedule_element.period,
			//Techincal Debt: accounting for legacy deta, remove at earliest convenience
			product: _.has(schedule_element, 'product') ? schedule_element.product : schedule_element.product_id
		};

		if(_.has(schedule_element, 'end')){
			return_object.end = schedule_element.end;
		}

		return return_object;

	}

}
