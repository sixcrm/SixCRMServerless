var fs = require('fs');

module.exports = function(chai) {
	var Assertion = chai.Assertion;

	Assertion.addChainableMethod('deepEqualProcessor', assertProcessor);

	function assertProcessor(basePath, fileName) {
		var expectedPath = basePath + '/' + fileName + '.expected.json';
		var expected = require(expectedPath);

		if (this._obj && this._obj.then) {
			return this._obj.then(saveProcessedAndAssert);
		} else {
			return saveProcessedAndAssert(this._obj);
		}

		function saveProcessedAndAssert(actual) {
			var data = actual;

			if (typeof actual !== 'string') {
				data = JSON.stringify(actual, null, '	');
			}
			fs.writeFileSync(basePath + '/' + fileName + '.processed.json', data);

			chai.assert.deepEqual(actual, expected, "Expected data to equal contents of " + expectedPath);
		}
	}
};

