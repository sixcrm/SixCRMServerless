module.exports = ($, id, name, cleanseOutput) => {

	const providerId = cleanseOutput($('3PL ID').val());
	const providerKey = cleanseOutput($('3PL Key').val());

	return {
		providerId,
		providerKey
	}

}
