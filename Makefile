SHELL := /bin/bash
DEST := /home/lenni/www/

deploy:
	rsync -rC \
		-e "ssh" --rsync-path="sudo rsync" \
		--exclude 'Makefile' \
		`pwd` \
		lenni@leonard.io:${DEST}
	ssh lenni@leonard.io 'sudo chown www-data:www-data -R ${DEST}'

OBJS=$(patsubst img/svg/%.svg, img/png/%.png, $(wildcard img/svg/*.svg))

pngs: img/png/bicycle_parking.png img/png/bicycle_shed.png img/png/bicycle_covered.png img/png/bicycle_locker.png

img/png/%.png : img/svg/%.svg
	inkscape -z -w 64 -h 64 $< -o $@

watch:
	ag -l | entr make deploy
