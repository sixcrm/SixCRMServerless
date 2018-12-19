module.exports = {

	AWSPromise: function(result) {

		return () => ({
			promise: () => Promise.resolve(result)
		});

	},

	AWSError: function(error) {

		return () => ({
			promise: () => {
				if (typeof error === "string") {
					error = new Error(error);
				}
				return Promise.reject(error);
			}
		});

	}

};
