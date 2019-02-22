"use strict";

const $ = require('cash-dom');
const _ = require('lodash');
const allAttributes = ["dog-id", "dog-class", "dog-value", "dog-html", "dog-click"];

//Normalize string like "address.gps.lat" to "address['gps']['lat']" to avoid issues when trying to access fields like "user.2.name"
var normalizeAttrString = function(attr) {
  attr = _.toPath(attr);

  if (attr.length > 1) {
    attr = _.map(attr, function(item, i) {
      if (i === 0) return item;

      if (item[0] === "#" || item[0] === ".") return item;

      return `'${ item }'`;
    });

    attr = attr.shift() + `[${ attr.join("][") }]`;
  } else {
    attr = attr.shift();
  }
  
  return attr;
}

//Get All [dog-value, dog-id, etc] as DOM elements
var getDogDOMElements = function() {
  let found = {};
  
  allAttributes.forEach((attr) => {
    let el = $(`[${ attr }]`);
    if (el.length === 0) return;
    found[attr] = el;
  })
  
  return found;
}

//Normalize all dog elements paths
var normalize = function() {
  let els = getDogDOMElements();
  
  Object.keys(els).forEach((attrName) => {
    els[attrName].each((k, el) => {
      let newAttr = normalizeAttrString($(el).attr(attrName));
      
      $(el).attr(attrName, newAttr);
    });
  });
}

module.exports = { normalize, normalizeAttrString, getDogDOMElements };