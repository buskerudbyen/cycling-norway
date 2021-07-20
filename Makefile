SHELL := /bin/bash
DEST := /home/lenni/www/

deploy:
	rsync -rC \
		-e "ssh" --rsync-path="sudo rsync" \
		--exclude 'Makefile' \
		`pwd` \
		lenni@leonard.io:${DEST}
	ssh lenni@leonard.io 'sudo chown www-data:www-data -R ${DEST}'

watch:
	ag -l | entr make deploy
