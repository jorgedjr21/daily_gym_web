DOCKER_RUN = docker run --rm -u 1000:1000 -v $(PWD):/app -w /app node:22-alpine

dev:
	docker compose up

install:
	$(DOCKER_RUN) npm install

test:
	$(DOCKER_RUN) npm run test

test-watch:
	$(DOCKER_RUN) npm run test:watch

build:
	$(DOCKER_RUN) npm run build

type-check:
	$(DOCKER_RUN) npm run type-check

lint:
	$(DOCKER_RUN) npm run lint

format:
	$(DOCKER_RUN) npm run format

.PHONY: dev install test test-watch build type-check lint format
