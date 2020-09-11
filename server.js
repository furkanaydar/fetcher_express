// require http modules first

const http = require('http');

//import app.js file
const app = require('./app__');

const port = 3101;
const server = http.createServer(app);

server.listen(port, () => {
    //    let's print a message when the server run successfully
    console.log("Server restarted successfully")
});