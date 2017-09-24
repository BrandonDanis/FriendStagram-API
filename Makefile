SERVICE = backend

build:
	sudo docker build -t friendstagram/$(SERVICE) .

run:
	docker-compose -f docker-compose.yml up -d friendstagram
