'use strict';

var express = require('express'),
    compression = require('compression'),
    morgan = require('morgan'),
    serveStatic = require('serve-static');

console.log('starting up web server');

var dist = __dirname + '/dist';
var app = express();
app.use(morgan('combined'));
app.use(compression());
app.use(serveStatic(dist, {'index': ['index.html']}));
app.use(function(req, res, next) { res.sendFile(dist + '/index.html'); });

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('web server started on port ' + port);
});
