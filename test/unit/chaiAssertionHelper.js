var fs = require('fs');

module.exports = function(chai, utils) {
	var Assertion = chai.Assertion;
	Assertion.addChainableMethod('deepEqualProcessor', assertProcessed);

	function assertProcessed(basePath, fileName) {
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
			fs.writeFile(basePath + '/' + fileName + '.processed.json', data);

			deleteUndefined(actual);
			chai.assert.deepEqual(actual, expected, "Expected data to equal contents of " + expectedPath);
		}
	}

	function deleteUndefined(processed) {
		for (var i in processed) {
			if (processed[i] === null || typeof processed[i] === "undefined") {
				delete processed[i];
			} else if (typeof processed[i] === 'object') {
				deleteUndefined(processed[i]);
			}
		}
	}
};

