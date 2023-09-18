SHELL := /bin/bash
DEST := /var/www/

.PHONY: build

build:
	npm run build

deploy: build
	rsync -rCv \
		-e "ssh" --rsync-path="sudo rsync" \
		--exclude 'Makefile' \
		--delete \
		`pwd`/build/ \
		cycling-norway.leonard.io:${DEST}
	ssh cycling-norway.leonard.io 'sudo chown caddy:caddy -R ${DEST}'

SVGS:=$(shell find img/svg)
pngs: $(patsubst img/svg/%.svg, img/png/%.png, $(SVGS))

img/png/%.png : img/svg/%.svg
	inkscape -z -w 64 -h 64 $< -o $@

clean:
	rm -rf img/png/*

watch:
	ag -l | entr make deploy
