const moment = require('moment');

class HandlebarsHelper {

	constructor() {
		this.handlebars = require('handlebars');

		this.handlebars.registerHelper('formatDate', (date, format) => {
			return moment(date).format(format);
		});

	}

}

module.exports = new HandlebarsHelper().handlebars;
