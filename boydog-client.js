//Boydog client module

"use strict";

//const $ = require("cash-dom");
const _ = require("lodash");
const generateUid = require("uid");
const shareDB = require("sharedb/lib/client");
const attributeBinding = require("sharedb-attribute-binding");
const reconnectingWebSocket = require("reconnecting-websocket");
const jsCookie = require("js-cookie");
const utils = require("./utils.js");

var boydog = function(client) {
  var documentScope = {};
  var scope;

  let userId = undefined;
  let urlStructure = location.pathname.split("/") || [];
  let monitorIndex = urlStructure.indexOf("boydog-monitor");
  let monitorHash = urlStructure[monitorIndex + 1] || undefined;

  if (!monitorHash) {
    userId = jsCookie.get("boydog-uid");
    if (!userId) {
      userId = generateUid(16);
      jsCookie.set("boydog-uid", userId);
      console.log("New boydog userId generated: ", userId);
    }
  } else {
    userId = monitorHash;
  }

  if (!client) client = window.location.host;
  let socket = new reconnectingWebSocket(`ws://${client}?userId=${userId}`);
  let connection = new shareDB.Connection(socket);

  const restart = function() {
    utils.normalizeAll();

    var allElements = utils.getDogDOMElements();

    _.each(allElements, (els, attr) => {
      _.each(els, (domEl) => {
        let path = domEl.getAttribute(attr);

        documentScope[path] = connection.get("default", path);
        documentScope[path].subscribe(function(err) {
          if (err) throw err;

          let binding = new attributeBinding(
            domEl,
            documentScope[path],
            ["content"],
            attr.match(/^dog-([a-zA-Z._-]+)$/)[1],
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

        //Note: The "on before" is not exactly a "before" operation event, and operations are already applied when the event is triggered. Changing the op inside this event is not useful.
        //A "op" event is triggered "after" the operation has been applied
        /*documentScope[path].on("op", (op, source) => {
          //TODO: Add trigger event support here. It will be an event that is triggered
          //TODO: Check last two ops and fix caret in case they are exactly the same length, to avoid this issue: https://github.com/ottypes/text/issues/8
          return;
        });*/
      });
    });
  };

  const attach = function(_scope) {
    scope = _scope || "html";
    restart();
  };

  return { scope, attach };
};

window.boydog = boydog;
