"use strict";

const shareDB = require("sharedb/lib/client");
const stringBinding = require("sharedb-string-binding");
const reconnectingWebSocket = require("reconnecting-websocket");
const utils = require("./utils.js");

var boydog = function(client) {
  var documentScope = {};
  var scope;

  if (!client) client = window.location.host;
  let socket = new reconnectingWebSocket("ws://" + client);
  let connection = new shareDB.Connection(socket);

  /*//Create local Doc instance mapped to 'examples' collection document with id 'textarea'
  let element = document.querySelector("input");
  let doc = connection.get("default", "randomABC");
  doc.subscribe(function(err) {
    if (err) throw err;

    let binding = new stringBinding(element, doc, ["content"]);
    binding.setup();
  });*/

  /*//Working event example
  doc.on("op", (o, s) => {
    console.log("op", o, s);
  })*/

  var restart = function() {
    console.log("reloading boydogxyz", utils);
    utils.normalize();
    
    var els = utils.getDogDOMElements();
    console.log("els", els);
    
    let attr = "dog-value";
    els[attr].each((i, domEl) => {
      let path = domEl.getAttribute(attr);
      console.log("domEl", domEl, path);
      
      documentScope[path] = connection.get("default", path);
      documentScope[path].subscribe(function(err) {
        if (err) throw err;

        let binding = new stringBinding(domEl, documentScope[path], ["content"]);
        try {
          binding.setup();
        } catch(e) {
          if (e instanceof TypeError) {
            console.log("retrying to connect");
            setTimeout(function() {
              binding.setup();
            }, 3000);
          }
        }
      });
    })
  };

  var attach = function(_scope) {
    scope = _scope || "html";
    restart();
  };

  return { scope, attach };
};

window.boydog = boydog;
