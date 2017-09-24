SERVICE = backend

build:
	sudo docker build -t friendstagram/$(SERVICE) .
