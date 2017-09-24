SERVICE = backend

build:
	docker build -t friendstagram/$(SERVICE) .
