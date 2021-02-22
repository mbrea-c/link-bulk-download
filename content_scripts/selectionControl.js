(function () {
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
	let checkedSelectors = [];

	function getGlobalBoundingRect(element) {
		let {top, bottom, left, right} = element.getBoundingClientRect()
		return {
			top: top + window.scrollY,
			bottom: bottom + window.scrollY,
			left: left + window.scrollX,
			right: right + window.scrollX
		}
	}

	/**
	 * Wraps all links '<a/> elements' in a div (to allow for
	 * absolute positioning of checkbox) and adds a checkbox
	 * next to them
	 */
	function showSelectors() {
		const makeButton = (link) => {
			const button = document.createElement("input");
			const linkBoundingRect = getGlobalBoundingRect(link)
			button.type = "checkbox";
			button.setAttribute("href", link.href);
			button.setAttribute("linkText", link.textContent);
			button.className = "bulkDownloadLinkSelector";
			button.style.position = "absolute";
			button.style.zIndex = "1";
			button.style.top = `${linkBoundingRect.top}px`;
			button.style.left = `${linkBoundingRect.left}px`;
			console.log(linkBoundingRect);
			button.addEventListener("click", (event) => {
				const button = event.target;
				button.checked
					? checkedSelectors.push(button)
					: checkedSelectors.splice(checkedSelectors.indexOf(button), 1);
			});
			return button;
		};
		const addLinkSelector = (link, selectorContainer) => {
			selectorContainer.appendChild(makeButton(link));
		};

		const selectorContainer = document.createElement("div");
		selectorContainer.className = "bulkDownloadLinkSelectorContainer";
		const links = Array.from(document.querySelectorAll("a"));

		document.body.appendChild(selectorContainer);

		links.map((link) => addLinkSelector(link, selectorContainer));
	}

	/**
	 * Removes checkbox and wrapper div from all links in
	 * the page (inverse of showSelectors)
	 */
	function hideSelectors() {
		const selectors = Array.from(
			document.querySelectorAll(".bulkDownloadLinkSelectorContainer")
		);
		selectors.map((selector) => selector.remove());
		checkedSelectors = [];
	}

	/**
	 * Gets link href attributes from selected links and
	 * sends a message for the background script to
	 * download them
	 */
	function downloadSelected(formatString) {
		const targets = checkedSelectors.map((selector, index) => {
			const url = selector.getAttribute("href");
			const basename = url.split("/").pop().split("?").pop(0).split("#").pop(0);
			const linkText = selector.getAttribute("linkText");
			const formatParameters = [
				{value: index + 1, format: "{index}"},
				{value: basename, format: "{name}"},
				{value: linkText, format: "{linkText}"},
			];
			return {
				url: url,
				formatString: formatString,
				formatParameters: formatParameters,
			};
		});
		browser.runtime.sendMessage({targets: targets});
	}

	/**
	 * Listens for messages (from browserAction popup)
	 */
	browser.runtime.onMessage.addListener((message) => {
		if (message.command === "showSelectors" && !selectorsActive) {
			selectorsActive = true;
			showSelectors();
		} else if (message.command === "hideSelectors" && selectorsActive) {
			selectorsActive = false;
			hideSelectors();
		} else if (message.command === "downloadSelected" && selectorsActive) {
			const {formatString} = message.args;
			downloadSelected(formatString);
		}
	});

	/** 
	 * Reposition selectors on window resize
	 */
	window.onresize = () => {
		if (selectorsActive) {
			hideSelectors();
			showSelectors();
		}
	}
})();
