"use strict";

const shareDB = require('sharedb/lib/client');
const stringBinding = require('sharedb-string-binding');
const reconnectingWebSocket = require('reconnecting-websocket');
const utils = require('./utils.js');

var boydog = function(client) {
  var scope;
  
  if (!client) client = window.location.host;
  let socket = new reconnectingWebSocket('ws://' + client);
  let connection = new shareDB.Connection(socket);

  //Create local Doc instance mapped to 'examples' collection document with id 'textarea'
  let element = document.querySelector('input');
  let doc = connection.get('examples', 'randomABC');
  doc.subscribe(function(err) {
    if (err) throw err;
    
    let binding = new stringBinding(element, doc, ['content']);
    binding.setup();
  });
  
  /*//Working event example
  doc.on("op", (o, s) => {
    console.log("op", o, s);
  })*/
  
  var reload = function() {
    console.log("reloading boydog", utils);
    utils.normalize();
  }
  
  var attach = function(_scope) {
    scope = _scope || "html";
    reload();
  }
  
  return { scope, attach };
}

window.boydog = boydog;