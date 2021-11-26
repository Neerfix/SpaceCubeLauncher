release:
	git add .
	npm run release -- --release-as v$(version)
	git commit -am v$(version)
	git tag v$(version)
	git push && git push --tags
