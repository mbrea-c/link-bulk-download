function downloader(message) {
	hrefs = message.hrefs;
	hrefs.map(url => {
		filename = url
			.split('/').pop()
			.split('?').pop(0)
			.split('#').pop(0);
		browser.downloads.download({ filename: filename, url: url });
	});
}
browser.runtime.onMessage.addListener(downloader);
