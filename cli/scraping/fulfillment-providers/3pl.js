module.exports = ($, id, name, cleanseOutput) => {

	const providerId = cleanseOutput($('input[id="3PL ID"]').val());
	const providerKey = cleanseOutput($('input[id="3PL Key"]').val());

	return {
		providerId,
		providerKey
	}

}
