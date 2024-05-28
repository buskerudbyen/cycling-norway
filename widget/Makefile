DEST:=/var/www/widget
clean:
	rm -rf build

build:
	npm run build

deploy: build
	rsync -rCv \
		-e "ssh" --rsync-path="sudo rsync" \
		--exclude 'Makefile' \
		--delete \
		`pwd`/dist/ index.html \
		cycling-norway.leonard.io:${DEST}
	ssh cycling-norway.leonard.io 'sudo mkdir -p ${DEST}/dist && sudo ln -s ${DEST}/widget.js ${DEST}/dist/widget.js'
	ssh cycling-norway.leonard.io 'sudo chown caddy:caddy -R ${DEST}'


