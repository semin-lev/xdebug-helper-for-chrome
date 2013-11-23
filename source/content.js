var xdebug = (function() {
	// Set a cookie
	function setCookie(name, value, hours)
	{
		var exp = new Date();
		exp.setTime(exp.getTime() + (hours * 60 * 60 * 1000));
		document.cookie = name + "=" + value + "; expires=" + exp.toGMTString() + "; path=/";
	}

	// Get the content in a cookie
	function getCookie(name)
	{
		// Search for the start of the goven cookie
		var prefix = name + "=",
			cookieStartIndex = document.cookie.indexOf(prefix),
			cookieEndIndex;

		// If the cookie is not found return null
		if (cookieStartIndex == -1)
		{
			return null;
		}

		// Look for the end of the cookie
		cookieEndIndex = document.cookie.indexOf(";", cookieStartIndex + prefix.length);
		if (cookieEndIndex == -1)
		{
			cookieEndIndex = document.cookie.length;
		}

		// Extract the cookie content
		return unescape(document.cookie.substring(cookieStartIndex + prefix.length, cookieEndIndex));
	}

	// Remove a cookie
	function deleteCookie(name)
	{
		setCookie(name, null, -60);
	}

	// Public methods
	var exposed = {
		// Handles messages from other extension parts
		messageListener : function(request, sender, sendResponse)
		{
			var newStatus;

			// Execute the requested command
			if (request.cmd == "getStatus")
			{
				newStatus = exposed.getStatus();
			}
			else if (request.cmd == "toggleStatus")
			{
				newStatus = exposed.toggleStatus();
			}
			else if (request.cmd == "setStatus")
			{
				newStatus = exposed.setStatus(request.status);
			}

			// Respond with the current status
			sendResponse({ status: newStatus });
		},

		// Get current state
		getStatus : function()
		{
			var status = 0;

			if (getCookie("start_debug"))
			{
				status = 1;
			}
			else if (getCookie("start_profile"))
			{
				status = 2;
			}
			/*else if (getCookie("XDEBUG_TRACE"))
			{
				status = 3;
			}*/

			return status;
		},

		// Toggle to the next state
		toggleStatus : function()
		{
			var nextStatus = (exposed.getStatus() + 1) % 4;
			return exposed.setStatus(nextStatus);
		},

		// Set the state
		setStatus : function(status)
		{
			if (status == 1)
			{
				// Set debugging on
				setCookie("start_debug", 1, 24);
				deleteCookie("start_profile");
				//deleteCookie("XDEBUG_TRACE");
			}
			else if (status == 2)
			{
				// Set profiling on
				deleteCookie("start_debug");
				setCookie("start_profile", 24);
				//deleteCookie("XDEBUG_TRACE");
			}
			else if (status == 3)
			{
				// tracing is not available for zend debug
				/*deleteCookie("XDEBUG_SESSION");
				deleteCookie("XDEBUG_PROFILE");
				setCookie("XDEBUG_TRACE", 24);*/
			}
			else
			{
				// Disable all Xdebug functions
				deleteCookie("start_debug");
				deleteCookie("start_profile");
				//deleteCookie("XDEBUG_TRACE");
			}

			// Return the new status
			return exposed.getStatus();
		}
	};

	return exposed;
})();

// Attach the message listener
chrome.runtime.onMessage.addListener(xdebug.messageListener);
