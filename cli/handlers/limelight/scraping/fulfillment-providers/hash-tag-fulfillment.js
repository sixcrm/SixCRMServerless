module.exports = ($, id, name, cleanseOutput) => {

	const providerId = cleanseOutput($('input[id="#Fulfillment ID"]').val());
	const providerKey = cleanseOutput($('input[id="#Fulfillment Key"]').val());

	return {
		providerId,
		providerKey
	}

}
