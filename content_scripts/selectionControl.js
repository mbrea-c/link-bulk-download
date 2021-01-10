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
  /**
   * Wraps all links '<a/> elements' in a div (to allow for
   * absolute positioning of checkbox) and adds a checkbox
   * next to them
   */

  function showSelectors() {
    const makeButton = (link) => {
      const button = document.createElement("input");
      button.type = "checkbox";
      button.setAttribute("href", link.href);
      button.className = "bulkDownloadLinkSelector";
      button.style.position = "absolute";
      button.style.zIndex = "1";
      button.style.display = "inline";
      button.addEventListener("click", (event) => {
        const button = event.target;
        button.checked
          ? checkedSelectors.push(button)
          : checkedSelectors.splice(checkedSelectors.indexOf(button), 1);
      });
      return button;
    };
    const wrapElement = (link) => {
      const wrapper = document.createElement("div");
      wrapper.style.display = "inline";
      link.replaceWith(wrapper);
      wrapper.appendChild(makeButton(link));
      wrapper.appendChild(link);
    };

    const links = Array.from(document.querySelectorAll("a"));

    links.map((link) => wrapElement(link));
  }

  /**
   * Removes checkbox and wrapper div from all links in
   * the page (inverse of showSelectors)
   */
  function hideSelectors() {
    const unwrapElement = (selector) => {
      const container = selector.parentElement;
      const originalParent = container.parentElement;
      const targetLink = container.querySelector("a");
      container.remove();
      originalParent.appendChild(targetLink);
    };
    const selectors = Array.from(
      document.querySelectorAll(".bulkDownloadLinkSelector")
    );
    selectors.map((selector) => unwrapElement(selector));
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
      const formatParameters = [
        { value: index + 1, format: "{index}" },
        { value: basename, format: "{name}" },
      ];
      return {
        url: url,
        formatString: formatString,
        formatParameters: formatParameters,
      };
    });
    browser.runtime.sendMessage({ targets: targets });
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
      const { formatString } = message.args;
      downloadSelected(formatString);
    }
  });
})();
