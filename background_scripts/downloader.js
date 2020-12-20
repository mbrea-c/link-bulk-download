function downloader(message) {
	hrefs = message.hrefs;
	hrefs.map(url => browser.downloads.download({ url: url }));
}

browser.runtime.onMessage.addListener(downloader);
