module.exports = ($, id, name, cleanseOutput) => {

	const providerId = cleanseOutput($('API Key').val());
	const providerKey = cleanseOutput($('API Secret').val());

	return {
		providerId,
		providerKey
	}

}
