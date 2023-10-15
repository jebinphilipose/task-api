# Task API

A basic Node.js RESTful API for managing tasks and getting metrics. API Documentation can be found [here](https://documenter.getpostman.com/view/3899486/2s9YR6ZDZv)

## Tools / Frameworks Used

* Node.js
* Express.js
* PostgreSQL
* Prisma ORM
* Docker
* Jest

## Features

* Code written in **JavaScript ES6+**
* Containerized application using **Docker**
* Request validation using **Joi** for 400 Bad Requests
* HTTP request logging using **Morgan** middleware
* Gzip compression of response body using **Compression** middleware
* Automatic code linting with pre-commit hook using **ESLint + Husky** for better code quality
* ≈100% code coverage using **Jest** integration tests
* Handled errors and edge cases using a custom error handler middleware
* API Documentation with **Postman**

## Getting Started

### Prerequisites

* Node Version Manager ([instructions](https://github.com/nvm-sh/nvm#installing-and-updating))
* Node v18.18.0
    ```
    $ nvm install 18.18.0
    $ nvm use 18.18.0
    ```
* Docker CLI / Docker Desktop ([instructions](https://docs.docker.com/engine/install/))
* Docker Compose (included in Docker Desktop; [instructions](https://docs.docker.com/compose/install/#installation-scenarios))

### Installing

1. Clone this repo:
    ```
    git clone https://github.com/jebinphilipose/task-api.git
    ```
2. Change working directory:
    ```
    cd task-api
    ```
3. Setup environment variables:
    ```
    cp .env.sample .env.development.local && cp .env.sample .env.test.local
    ```
    And modify `.env.development.local` and `.env.test.local` to have appropriate values.
    
    NOTE: You must enter different values of `db`, `user`, `port` and `password` for `development` and `test` environments.
4. Setup and run `development` server:
    ```
    npm i && npm run docker:dev:build && npm run docker:dev:migrate && npm run docker:dev:up
    ```
5. Verify if server is running:
    ```
    curl 'http://localhost:3000/api/v1/ready'
    ```
6. To view logs:
    ```
    $ docker ps # copy container id of 'task-api-dev-server' image
    $ docker logs --follow <container-id>
    ```
7. To stop the container after you're done:
    ```
    npm run docker:dev:down
    ```

### Running the tests

1. Setup and run `test` server:
    ```
    npm run docker:test:build && npm run docker:test:run
    ```
2. To stop the container after you're done:
    ```
    npm run docker:test:down
    ```

## Design Decisions

* Project is structured using **MVC** architectural pattern
* Common functionalities have been moved out to separate **modules** which enhances readability, mantainability and reusability of code
* **Error handling** is done properly using a custom middleware
* All **edge-cases** have been thought (like not allowing user to send a negative page query param in GET /tasks API) and **400** is sent while making a bad request
* **Validations** are performed both on request-level (using **Joi**) and DB-level (using **Prisma ORM**)
* **REST API best practices** have been considered like using proper HTTP verbs (GET, POST, PUT) and status codes (200, 201, 400, 404, 500)
* **Code quality** is maintained using JavaScript ES6+ features (async/await, arrow functions, higher order function like map and reduce, etc), linting (ESLint + Husky), and ≈100% code coverage (with Jest integration tests)

## API Documentation

To know more about the endpoints and how to make requests, check the API documentation [here](https://documenter.getpostman.com/view/3899486/2s9YR6ZDZv)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details
