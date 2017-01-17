var SessionController = require('./controllers/Session.js');

module.exports = { 
	hello: () => 'Hello world!' ,
	session: (obj, args, context) => {	
		//note: what's the obj for?
		return SessionController.getSession(obj.id).then(
			sessionData => new Session(sessionData)
		)
	}
};
