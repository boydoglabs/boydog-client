//Boydog client module

"use strict";

const $ = require("cash-dom");
const _ = require("lodash");
const shareDB = require("sharedb/lib/client");
const genericBinding = require("sharedb-generic-binding");
const stringBinding = require("sharedb-string-binding");
const reconnectingWebSocket = require("reconnecting-websocket");
const utils = require("./utils.js");

const bindings = {
  "dog-value": stringBinding,
  "dog-html": genericBinding
};

var boydog = function(client) {
  var documentScope = {};
  var scope;

  if (!client) client = window.location.host;
  let socket = new reconnectingWebSocket("ws://" + client);
  let connection = new shareDB.Connection(socket);

  var restart = function() {
    utils.normalizeAll();

    var allElements = utils.getDogDOMElements();

    _.each(allElements, (els, attr) => {
      _.each(els, (domEl, i) => {
        let path = domEl.getAttribute(attr);

        documentScope[path] = connection.get("default", path);
        documentScope[path].subscribe(function(err) {
          if (err) throw err;

          let binding = new bindings[attr](domEl, documentScope[path], [
            "content"
          ]);

          try {
            binding.setup();
          } catch (e) {
            if (e instanceof TypeError) {
              console.warn(
                "BoyDog couldn't connect. Retrying in a few seconds."
              );
              setTimeout(function() {
                binding.setup(); //Try again if we couldn't bind tags
              }, 3000);
            }
          }
        });

        documentScope[path].on("op", (op, source) => {
          //TODO: Add middleware support here
          return;
        });
      });
    });
  };

  var attach = function(_scope) {
    scope = _scope || "html";
    restart();
  };

  return { scope, attach };
};

window.boydog = boydog;
