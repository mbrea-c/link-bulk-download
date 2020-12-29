(function() {
	/**
	 * Check and set a global guard variable.
	 * If this content script is injected into the same page again,
	 * it will do nothing next time.
	 */
	if (window.hasRun) {
		return;
	}
	window.hasRun = true;
	let selectorsActive = false;
	/**
	 * Wraps all links '<a/> elements' in a div (to allow for
	 * absolute positioning of checkbox) and adds a checkbox
	 * next to them
	 */
	function showSelectors() {
		const makeButton = link => {
			const button = document.createElement("input");
			button.type = "checkbox";
			button.setAttribute("href", link.href);
			button.className = "bulkDownloadLinkSelector";
			button.style.position = "absolute";
			button.style.zIndex = "1";
			button.style.display = "inline";
			return button;
		};
		const wrapElement = link => {
			const wrapper = document.createElement("div");
			wrapper.style.display = "inline";
			link.replaceWith(wrapper);
			wrapper.appendChild(makeButton(link));
			wrapper.appendChild(link);
		};

		const links = Array.from(document.querySelectorAll("a"));

		links.map(link => wrapElement(link));
	}

	/**
	 * Removes checkbox and wrapper div from all links in
	 * the page (inverse of showSelectors)
	 */
	function hideSelectors() {
		const unwrapElement = selector => {
			const container = selector.parentElement;
			const originalParent = container.parentElement;
			const targetLink = container.querySelector("a");
			container.remove();
			originalParent.appendChild(targetLink);
		};
		const selectors = Array.from(
			document.querySelectorAll(".bulkDownloadLinkSelector")
		);
		selectors.map(selector => unwrapElement(selector));
	}

	/**
	 * Gets link href attributes from selected links and
	 * sends a message for the background script to
	 * download them
	 */
	function downloadSelected(args) {
		const checkedSelectors = Array.from(
			document.querySelectorAll(".bulkDownloadLinkSelector:checked")
		);
		const urls = checkedSelectors.map(selector =>
			selector.getAttribute("href")
		);
		browser.runtime.sendMessage({ hrefs: urls, args: args });
	}

	/**
	 * Listens for messages (from browserAction popup)
	 */
	browser.runtime.onMessage.addListener(message => {
		if (message.command === "showSelectors" && !selectorsActive) {
			selectorsActive = true;
			showSelectors();
		} else if (message.command === "hideSelectors" && selectorsActive) {
			selectorsActive = false;
			hideSelectors();
		} else if (message.command === "downloadSelected" && selectorsActive) {
			downloadSelected(message.args);
		}
	});
})();
