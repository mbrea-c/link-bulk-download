function listenForClicks() {
	document.addEventListener("click", (e) => {
		function showSelectors(tabs) {
			browser.tabs.sendMessage(tabs[0].id, {command: "showSelectors"});
		}

		function hideSelectors(tabs) {
			browser.tabs.sendMessage(tabs[0].id, {command: "hideSelectors"});
		}

		function downloadSelected(tabs) {
			const formatString =
				document.querySelector(".formatString").value || "{index}-{linkText}";
			browser.tabs.sendMessage(tabs[0].id, {
				command: "downloadSelected",
				args: {formatString: formatString},
			});
		}

		if (e.target.classList.contains("showSelectors")) {
			browser.tabs
				.query({active: true, currentWindow: true})
				.then(showSelectors);
		} else if (e.target.classList.contains("hideSelectors")) {
			browser.tabs
				.query({active: true, currentWindow: true})
				.then(hideSelectors);
		} else if (e.target.classList.contains("downloadSelected")) {
			browser.tabs
				.query({active: true, currentWindow: true})
				.then(downloadSelected);
		} else if (e.target.classList.contains("formatStringsDocs")) {
			browser.tabs.create({url: "../pages/formatStrings.html"});
		}
	});
}

browser.tabs
	.executeScript({file: "/content_scripts/selectionControl.js"})
	.then(listenForClicks);
