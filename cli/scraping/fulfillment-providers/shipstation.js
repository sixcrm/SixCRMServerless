module.exports = ($, id, name, cleanseOutput) => {

	const providerId = cleanseOutput($('input[id="API Key"]').val());
	const providerKey = cleanseOutput($('input[id="API Secret"]').val());

	return {
		providerId,
		providerKey
	}

}
