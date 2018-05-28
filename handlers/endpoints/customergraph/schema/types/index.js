
function init() {
	let files = require('fs').readdirSync(__dirname);
	let types = {};

	files.map( (file) => {
		if (file.indexOf('.') != 0 && file != 'index.js') {
			types[file.substring(0,file.length - 3)] = require(__dirname + '/' + file);
		}
	})
	return types;
}
module.exports = new init();
