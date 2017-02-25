'use strict';

class ArrayUtilities {
	
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