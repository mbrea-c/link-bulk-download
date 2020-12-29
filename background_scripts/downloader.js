function downloader(message) {
	hrefs = message.hrefs;
	args = message.args;
	hrefs.map(url => browser.downloads.download({ url: url, saveAs: args.saveAs }));
}

browser.runtime.onMessage.addListener(downloader);
