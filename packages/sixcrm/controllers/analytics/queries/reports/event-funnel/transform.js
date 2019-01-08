const math = require('@6crm/sixcrmcore/util/math-utilities').default;

module.exports = async (results) => {
	const click = results[0].count_click;
	const lead = results[0].count_lead;
	const main = results[0].count_order;
	const upsell = results[0].count_upsell;
	const confirm = results[0].count_confirm;

	return {

		records: [
			[{
				key: 'name',
				value: 'click'
			}, {
				key: 'count',
				value: click
			}, {
				key: 'percentage',
				value: math.safePercentage(click, click)
			}, {
				key: 'relative_percentage',
				value: math.safePercentage(0, click)
			}],
			[{
				key: 'name',
				value: 'lead'
			}, {
				key: 'count',
				value: lead
			}, {
				key: 'percentage',
				value: math.safePercentage(lead, click)
			}, {
				key: 'relative_percentage',
				value: math.safePercentage(lead, click)
			}],
			[{
				key: 'name',
				value: 'main'
			}, {
				key: 'count',
				value: main
			}, {
				key: 'percentage',
				value: math.safePercentage(main, click)
			}, {
				key: 'relative_percentage',
				value: math.safePercentage(main, lead)
			}],
			[{
				key: 'name',
				value: 'upsell'
			}, {
				key: 'count',
				value: upsell
			}, {
				key: 'percentage',
				value: math.safePercentage(upsell, click)
			}, {
				key: 'relative_percentage',
				value: math.safePercentage(upsell, main)
			}],
			[{
				key: 'name',
				value: 'confirm'
			}, {
				key: 'count',
				value: confirm
			}, {
				key: 'percentage',
				value: math.safePercentage(confirm, click)
			}, {
				key: 'relative_percentage',
				value: math.safePercentage(confirm, main)
			}]
		]

	};

}
