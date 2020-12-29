VERSION = $(shell git describe --tags)

build:
	web-ext build --filename "link-bulk-download-$(VERSION).zip" -i Makefile --overwrite-dest
