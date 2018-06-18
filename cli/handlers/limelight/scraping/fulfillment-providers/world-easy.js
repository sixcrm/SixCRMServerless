module.exports = ($, id, name, cleanseOutput) => {

	const providerId = cleanseOutput($('input[id="World Easy ID"]').val());
	const providerKey = cleanseOutput($('input[id="World Easy Key"]').val());

	return {
		providerId,
		providerKey
	}

}
