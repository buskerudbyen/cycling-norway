SHELL := /bin/bash
DEST := /home/lenni/www/cycling-norway/

.PHONY: build

build:
	npm run build

deploy: build
	rsync -rCv \
		-e "ssh" --rsync-path="sudo rsync" \
		--exclude 'Makefile' \
		`pwd`/build/ \
		lenni@leonard.io:${DEST}
	ssh lenni@leonard.io 'sudo chown www-data:www-data -R ${DEST}'

SVGS:=$(shell find img/svg)
pngs: $(patsubst img/svg/%.svg, img/png/%.png, $(SVGS))

img/png/%.png : img/svg/%.svg
	inkscape -z -w 64 -h 64 $< -o $@

clean:
	rm -rf img/png/*

watch:
	ag -l | entr make deploy
