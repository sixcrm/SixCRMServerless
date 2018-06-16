module.exports = ($, id, name, cleanseOutput) => {

	const worldEasyId = cleanseOutput($('input[id="World Easy ID"]').val());
	const worldEasyKey = cleanseOutput($('input[id="World Easy Key"]').val());

	return {
		worldEasyId,
		worldEasyKey
	}

}
