const loggingPrefix = "Product Info Extension:";
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	// We retrieve the page again, this results with the SSR generated code, which is cached in redis
	// This cached redis content is the reason we want to fetch it again, so we have the exact page content JSON (stored in the pageContent Vuex module, which is set in hydration)
	fetch(document.URL)
		.then(response => {
			return response.text();
		})
		.then(html => {
			// This temp div is here so that we can cast the html response to a DOM so we can with Nodes
			const tempDiv = document.createElement("div");
			tempDiv.innerHTML = html;

			const scriptElements = tempDiv.querySelectorAll("script");

			// Finding the script element containing the intial state script (which is handed over from SSR for client hydration)
			let initStateScript;
			const matchEndScript = /^(.*?);\(function\(\)/;

			for (const scriptEl of scriptElements) {
				const match = scriptEl.innerHTML.match("window.__INITIAL_STATE__=(.*)");
				if (match !== null) {
					initStateScript = match[1].match(matchEndScript)[1];
				}
			}

			if (initStateScript === undefined) {
				console.warn(`${loggingPrefix} Unable to find __INITIAL_STATE__ script.`);
				sendResponse({ message: null });
				return;
			}

			// We just want the JSON object that contains the visual state module, has JS after the initial state object set
			// Run the sript in the isolation space of the content.js script, we don't have access to the JS variables from the page at all
			// So we need to run this script in the content space instead
			try {
				const vuexModules = JSON.parse(initStateScript);

				sendResponse({ message: vuexModules.pagecontentModule?.content });
			} catch (error) {
				console.error(`${loggingPrefix} Unable to parse VuexModule state data.`);
				sendResponse({ message: null });
				return;
			}
		})
		.catch(error => {
			console.error(`${loggingPrefix} `, error);
		});
	return true;
});
