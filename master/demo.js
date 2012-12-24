/**
 * Super basic Ads on Demand example.
 * You'd want to write your own javascript and/or convert the below to something more OOP.
 *
 * @see https://github.com/registerguard/ads-on-demand
 * @see https://github.com/registerguard/js-media-queries
 */

//--------------------------------------------------------------------

/**
 * Builds and returns our `<iframe>` html.
 *
 * @param auid { integer } Ad unit ID.
 * @param width { integer } Width of `<iframe>`.
 * @param height { integer } Height of `<iframe>`.
 */

function make_iframe(auid, width, height) {
	
	return '<iframe src="http://ox-d.registerguard.com/w/1.0/afr?auid=' + auid + '&cb=' + (Math.random() * 10000000000000000) + '"' + 'frameBorder="0" frameSpacing="0" scrolling="no" width="' + width + '" height="' + height + '"><\/iframe>';
	
}

//--------------------------------------------------------------------

// Simple `onload` checking:
window.onload = function() {
	
	// Used to count query media query matches:
	var flag = 1,
	
	// The `onmediaquery` setup:
	queries = [
		
		// Mobile:
		
		{
			
			context : ['alpha', 'bravo'],
			call_for_each_context : false,
			match : function() {
				
				// Using `flag` to avoid loading ads more than once:
				if (flag <= 2) {
					
					// Inject `<iframe>` into DOM:
					document.getElementById('leaderboard_320').innerHTML = make_iframe(314042, 320, 50);
					
					// Up the flag count:
					flag++;
					
				}
				
			}
			
		},
		
		// Desktop:
		
		{
			
			context : ['charlie', 'delta'],
			call_for_each_context : false,
			match : function() {
				
				if (flag <= 2) {
					
					document.getElementById('leaderboard_728').innerHTML = make_iframe(314041, 728, 90);
					
					flag++;
					
				}
				
			}
			
		}
		
	];
	
	//--------------------------------------------------------------------
	
	// Initialize the `onmediaquery` plugin:
	oMQ.init(queries);
	
};