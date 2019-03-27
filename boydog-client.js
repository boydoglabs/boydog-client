//Boydog client module

"use strict";

const $ = require("cash-dom");
const _ = require("lodash");
const shareDB = require("sharedb/lib/client");
const attributeBinding = require("sharedb-attribute-binding");
const reconnectingWebSocket = require("reconnecting-websocket");
const utils = require("./utils.js");

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

          let binding = new attributeBinding(
            domEl,
            documentScope[path],
            ["content"],
            attr.match(/^dog-([a-zA-Z._-]+)$/)[1]
          );

          try {
            binding.setup();
          } catch (e) {
            if (e instanceof TypeError) {
              console.warn(
                "BoyDog couldn't connect. Retrying in a few seconds."
              );
              setTimeout(function() {
                binding.setup(); //Try again if we couldn't bind tags
              }, 1500);
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
