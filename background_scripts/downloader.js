function downloader(message) {
  const targets = message.targets;
  targets.map(({ url, formatString, formatParameters }) => {
    let filename = formatString;
    formatParameters.map(({ format, value }) => {
      filename = filename.replaceAll(format, value);
    });
    alert(filename);
    browser.downloads.download({ filename: filename, url: url });
  });
}
browser.runtime.onMessage.addListener(downloader);
