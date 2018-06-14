module.exports = ($, id, name, cleanseOutput) => {

	const alias = cleanseOutput($('#profile_alias').val());
	const active = cleanseOutput($('input[name=profile_status]').val());
	const billingCode = cleanseOutput($('select[id="Billing Code"] option:selected').text());
	const combineSimilarAddresses = cleanseOutput($('select[id="Combine Similar Addresses"] option:selected').text());
	const customerID = cleanseOutput($('input[id="Customer ID"]').val());
	const delayHours = cleanseOutput($('input[id="Delay Hours"]').val());
	const password = cleanseOutput($('input[id="Password"]').val());
	const recieveTrackingNumber = cleanseOutput($('select[id="Receive Tracking #"] option:selected').text());
	const username = cleanseOutput($('input[id="Username"]').val());
	const warehouseId = cleanseOutput($('input[id="Warehouse ID"]').val());
	const worldEasyId = cleanseOutput($('input[id="World Easy ID"]').val());
	const worldEasyKey = cleanseOutput($('input[id="World Easy Key"]').val());

	return {
		id,
		name,
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
