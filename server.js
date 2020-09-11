// require http modules first

const http = require('http');

//import app.js file
const app = require('./app__');

const port = process.env.PORT || 8000;
const server = http.createServer(app);

server.listen(port, () => {
    console.log("App is running on port " + port);
});
