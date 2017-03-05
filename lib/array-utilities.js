'use strict';

class ArrayUtilities {
	
	//Technical Debt:  Just use _.contains
	static inArray(needle, haystack){
	
		var length = haystack.length;
		
		for(var i = 0; i < length; i++) {
			if(haystack[i] == needle){ 
				return true; 
			}
		}
		
		return false;

	}
	
}

module.exports = ArrayUtilities;