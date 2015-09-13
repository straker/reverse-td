var gridSize = 40;
var gridWidth = game.width / gridSize | 0;
var gridHeight = game.height / gridSize | 0;

/*jshint curly: false */

/**
 * Wrap addEventListener to handle multiple event types and be chainable.
 * @param {string} types - Space-separated event types.
 * @param {function} listener
 * @param {boolean} useCapture
 * @returns {Node}
 *
 * @example
 *  document.querySelector('a')
 *    .addEventListener('click blur', function(e) {
 *      // ...
 *    })
 *    .setAttribute('class', 'activated');
 *
 * EventTarget does not exist in Safari, and the only prototype the document and an element
 * share is Node. Not really the best place to attach it, but there's not much we can do
 * about it.
 */
Node.prototype._addEventListener = Node.prototype.addEventListener;
Node.prototype.addEventListener = function addEventListener(types, listener, useCapture) {
  var _this = this;

  if (typeof types !== 'string') return;

  types.split(' ').forEach(function(type) {
    _this._addEventListener(type, listener, useCapture);
  });

  return this;
};

/**
 * Wrap setAttribute to handle multiple attributes and be chainable.
 * @param {string|object} name - Object of name-value pairs or a string of the attribute name.
 * @param {string} [value] - Value of the attribute if name was a string.
 * @returns {Element}
 *
 * @example
 *  document.createElement('div')
 *    .setAttribute({'class': 'myClass', 'id': 'myId'})
 *    .addEventListener('click', function(e) {
 *      // ...
 *    })
 */
Element.prototype._setAttribute = Element.prototype.setAttribute;
Element.prototype.setAttribute = function setAttribute(name, value) {
  // backward compatibility
  if (arguments.length === 2) {
    this._setAttribute(name, value);
  }
  // new object syntax
  else {
    for (var prop in name) {
      if (!name.hasOwnProperty(prop)) continue;

      this._setAttribute(prop, name[prop]);
    }
  }

  return this;
};

/**
 * Wrap getAttribute to parse attributes to convert it back to it's original type.
 * @param {string} name - Name of the attribute.
 * @returns {*}
 *
 * @example
 *  document.createElement('div')
 *    .setAttribute('test', 1)
 *    .getAttribute('test');  //=> 1
 *
 *  document.createElement('div')
 *    .setAttribute('obj', {foo: 'bar'})
 *    .getAttribute('obj');  //=> {foo: 'bar'}
 */
Element.prototype._getAttribute = Element.prototype.getAttribute;
Element.prototype.getAttribute = function getAttribute(name) {
  var value = this._getAttribute(name);

  try {
    value = JSON.parse(value);
  }
  catch(e) {}

  return value;
};

/**
 * Allow innerHTML to be chainable.
 * @param {string} content - Content to set as element's descendants.
 * @returns {Element}
 *
 * @example
 *  document.createElement('div')
 *    .setInnerHTML('<span><button>click me</button></span>')
 *    .setAttribute({'class': 'myClass', 'id': 'myId'})
 */
Element.prototype.setInnerHTML = function setInnerHTML(content) {
  this.innerHTML = content;

  return this;
};

/**
 * Allow style to handle multiple styles and be chainable.
 * @param {string|object} name - Object of name-value pairs or a string of the attribute name.
 * @param {string} [value] - Value of the attribute if name was a string.
 * @returns {Element}
 *
 * @example
 *  document.createElement('div')
 *    .setStyle('width', '120px')
 *    .setStyle({'height': '120px'})
 */
Element.prototype.setStyle = function setStyle(name, value) {
  // single style
  if (arguments.length === 2) {
    this.style[name] = value;
  }
  // multiple styles
  else {
    for (var prop in name) {
      if (!name.hasOwnProperty(prop)) continue;

      this.style[prop] = name[prop];
    }
  }

  return this;
};

/**
 * Allow appendChild to be chainable.
 * @param {Node} node - Node to append.
 * @returns {Node}
 *
 * @example
 *  document.createElement('div')
 *    .append(document.createElement('span'))
 *    .setAttribute({'class': 'myClass', 'id': 'myId'})
 */
Node.prototype.append = function append(node) {
  this.appendChild(node);

  return this;
};

/**
 * Allow NodeList and HTMLCollection to have forEach.
 *
 * @example
 *  document.querySelectorAll('div').forEach(function(node) {
 *    // ...
 *  });
 *
 *  document.body.children.forEach(function(node) {
 *    // ...
 * });
 */
NodeList.prototype.forEach = HTMLCollection.prototype.forEach = Array.prototype.forEach;

/**
 * Shortcut for adding the class 'hide' to a node.
 * @returns {Element}
 */
Element.prototype.show = function(show) {
  this.classList.remove('hide');

  return this;
};

/**
 * Shortcut for removing the class 'hide' from a node.
 * @returns {Element}
 */
Element.prototype.hide = function() {
  this.classList.add('hide');

  return this;
};