# Express tutorial from MDN - local-library

A basic website built using Express JS following the tutorial by MDN (Morzilla Developer Network) [here](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/Introduction).

The webpage is used as an online catalog for a small local library, and it allows CRUD actions for Authors, Books, Genres etc.

## Demo

This project is deployed to Heroku:
[Local Library](https://safe-bayou-99430.herokuapp.com/catalog)

## Technologies used

- NodeJS and ExpressJS
  - Third party npm packages (see package json)
- MongoDB and Mongoose
- Pug (Templating language)

## Quick Start

To get it running locally on your pc:

1. Set up Nodejs dev environment (npm etc)
2. In root of this repo, install dependencies:
    ```
    npm install
    ```
3. Either:
    - Add `config.json` file in root directory with development MongoDB URI that was set up for this app (see `config-TEMPLATE.json`)
    - Set up environment variable for `MONGODB_URI` with this URI
4. Start the server
    ```
    npm run devstart
    ```
5. Visit http://localhost:3000/ to view site
   
