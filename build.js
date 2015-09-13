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
/*
 * Kontra.js v1.1.1 (Custom Build on 2015-08-22) | MIT
 * Build: --files gameLoop,sprite,pool
 */

/* global console */
var kontra = (function(kontra, document) {
  'use strict';

  /**
   * Set up the canvas.
   * @memberof kontra
   *
   * @param {object} properties - Properties for the game.
   * @param {string|Canvas} properties.canvas - Main canvas ID or Element for the game.
   */
  kontra.init = function init(properties) {
    properties = properties || {};

    if (kontra.isString(properties.canvas)) {
      this.canvas = document.getElementById(properties.canvas);
    }
    else if (kontra.isCanvas(properties.canvas)) {
      this.canvas = properties.canvas;
    }
    else {
      this.canvas = document.getElementsByTagName('canvas')[0];

      if (!this.canvas) {
        var error = new ReferenceError('No canvas element found.');
        kontra.logError(error, 'You must provide a canvas element for the game.');
        return;
      }
    }

    this.context = this.canvas.getContext('2d');
    this.game = {
      width: this.canvas.width,
      height: this.canvas.height
    };
  };

  /**
   * Throw an error message to the user with readable formating.
   * @memberof kontra
   *
   * @param {Error}  error - Error object.
   * @param {string} message - Error message.
   */
  kontra.logError = function logError(error, message) {
    console.error('Kontra: ' + message + '\n\t' + error.stack);
  };

  /**
   * Noop function.
   * @memberof kontra
   */
  kontra.noop = function noop() {};

  /**
   * Determine if a value is an Array.
   * @memberof kontra
   *
   * @param {*} value - Value to test.
   *
   * @returns {boolean}
   */
  kontra.isArray = Array.isArray;

  /**
   * Determine if a value is a String.
   * @memberof kontra
   *
   * @param {*} value - Value to test.
   *
   * @returns {boolean}
   */
  kontra.isString = function isString(value) {
    return typeof value === 'string';
  };

  /**
   * Determine if a value is a Number.
   * @memberof kontra
   *
   * @param {*} value - Value to test.
   *
   * @returns {boolean}
   */
  kontra.isNumber = function isNumber(value) {
    return typeof value === 'number';
  };

  /**
   * Determine if a value is an Image.
   * @memberof kontra
   *
   * @param {*} value - Value to test.
   *
   * @returns {boolean}
   */
  kontra.isImage = function isImage(value) {
    return value && value.nodeName.toLowerCase() === 'img';
  };

  /**
   * Determine if a value is a Canvas.
   * @memberof kontra
   *
   * @param {*} value - Value to test.
   *
   * @returns {boolean}
   */
  kontra.isCanvas = function isCanvas(value) {
    return value && value.nodeName.toLowerCase() === 'canvas';
  };

  return kontra;
})(kontra || {}, document);
var kontra = (function(kontra, window) {
  'use strict';

  /**
   * Get the current time. Uses the User Timing API if it's available or defaults to using
   * Date().getTime()
   * @private
   *
   * @returns {number}
   */
  kontra.timestamp = (function() {
    if (window.performance && window.performance.now) {
      return function timestampPerformance() {
        return window.performance.now();
      };
    }
    else {
      return function timestampDate() {
        return new Date().getTime();
      };
    }
  })();

  /**
   * Game loop that updates and renders the game every frame.
   * @memberof kontra
   *
   * @see kontra.gameLoop.prototype.set for list of parameters.
   */
  kontra.gameLoop = function(properties) {
    var gameLoop = Object.create(kontra.gameLoop.prototype);
    gameLoop.set(properties);

    return gameLoop;
  };

  kontra.gameLoop.prototype = {
    /**
     * Set properties on the game loop.
     * @memberof kontra.gameLoop
     *
     * @param {object}   properties - Configure the game loop.
     * @param {number}   [properties.fps=60] - Desired frame rate.
     * @param {function} properties.update - Function called to update the game.
     * @param {function} properties.render - Function called to render the game.
     */
    set: function set(properties) {
      properties = properties || {};

      // check for required functions
      if (typeof properties.update !== 'function' || typeof properties.render !== 'function') {
        var error = new ReferenceError('Required functions not found');
        kontra.logError(error, 'You must provide update() and render() functions to create a game loop.');
        return;
      }

      this.isStopped = false;

      // animation variables
      this._accumulator = 0;
      this._delta = 1E3 / (properties.fps || 60);

      this.update = properties.update;
      this.render = properties.render;
    },

    /**
     * Called every frame of the game loop.
     * @memberof kontra.gameLoop
     */
    frame: function frame() {
      var _this = this;

      _this._rAF = requestAnimationFrame(_this.frame.bind(_this));

      _this._now = kontra.timestamp();
      _this._dt = _this._now - _this._last;
      _this._last = _this._now;

      // prevent updating the game with a very large dt if the game were to lose focus
      // and then regain focus later
      if (_this._dt > 1E3) {
        return;
      }

      _this._accumulator += _this._dt;

      while (_this._accumulator >= _this._delta) {
        _this.update(_this._delta / 1E3);

        _this._accumulator -= _this._delta;
      }

      _this.render();
    },

    /**
     * Start the game loop.
     * @memberof kontra.gameLoop
     */
    start: function start() {
      this._last = kontra.timestamp();
      this.isStopped = false;
      requestAnimationFrame(this.frame.bind(this));
    },

    /**
     * Stop the game loop.
     */
    stop: function stop() {
      this.isStopped = true;
      cancelAnimationFrame(this._rAF);
    }
  };

  return kontra;
})(kontra || {}, window);
var kontra = (function(kontra, Math, undefined) {
  'use strict';

  /**
   * A vector for 2D space.
   * @memberof kontra
   *
   * @see kontra.vector.prototype.set for list of parameters.
   */
  kontra.vector = function(x, y) {
    var vector = Object.create(kontra.vector.prototype);
    vector.set(x, y);

    return vector;
  };

  kontra.vector.prototype = {
    /**
     * Set the vector's x and y position.
     * @memberof kontra.vector
     *
     * @param {number} x=0 - Center x coordinate.
     * @param {number} y=0 - Center y coordinate.
     *
     * @returns {vector}
     */
    set: function set(x, y) {
      this.x = x || 0;
      this.y = y || 0;

      return this;
    },

    /**
     * Add a vector to this vector.
     * @memberof kontra.vector
     *
     * @param {vector} vector - Vector to add.
     * @param {number} dt=1 - Time since last update.
     */
    add: function add(vector, dt) {
      this.x += (vector.x || 0) * (dt || 1);
      this.y += (vector.y || 0) * (dt || 1);
    },

    /**
     * Clamp the vector between two points that form a rectangle.
     * Please note that clamping will only work if the add function is called.
     * @memberof kontra.vector
     *
     * @param {number} xMin - Min x value.
     * @param {number} yMin - Min y value.
     * @param {number} xMax - Max x value.
     * @param {number} yMax - Max y value.
     */
    clamp: function clamp(xMin, yMin, xMax, yMax) {

      // overwrite add function to clamp the final values.
      this.add = function clampAdd(vector, dt) {
        var x = this.x + (vector.x || 0) * (dt || 1);
        var y = this.y + (vector.y || 0) * (dt || 1);

        this.x = Math.min( Math.max(x, xMin), xMax );
        this.y = Math.min( Math.max(y, yMin), yMax );
      };
    }
  };





  /**
   * A sprite with a position, velocity, and acceleration.
   * @memberof kontra
   * @requires kontra.vector
   *
   * @see kontra.sprite._prot.set for list of parameters.
   */
  kontra.sprite = function(properties) {
    var sprite = Object.create(kontra.sprite.prototype);
    sprite.set(properties);

    return sprite;
  };

  kontra.sprite.prototype = {
    /**
     * Move the sprite by its velocity.
     * @memberof kontra.sprite
     *
     * @param {number} dt - Time since last update.
     */
    advanceSprite: function advanceSprite(dt) {
      this.velocity.add(this.acceleration, dt);
      this.position.add(this.velocity, dt);

      this.timeToLive--;
    },

    /**
     * Draw a simple rectangle. Useful for prototyping.
     * @memberof kontra.sprite
     */
    drawRect: function drawRect() {
      this.context.fillStyle = this.color;
      this.context.fillRect(this.position.x, this.position.y, this.width, this.height);
    },

    /**
     * Draw the sprite.
     * @memberof kontra.sprite
     */
    drawImage: function drawImage() {
      this.context.drawImage(this.image, this.position.x, this.position.y);
    },

    /**
     * Update the currently playing animation. Used when animations are passed to the sprite.
     * @memberof kontra.sprite
     *
     * @param {number} dt - Time since last update.
     */
    advanceAnimation: function advanceAnimation(dt) {
      this.advanceSprite(dt);

      this.currentAnimation.update(dt);
    },

    /**
     * Draw the currently playing animation. Used when animations are passed to the sprite.
     * @memberof kontra.sprite
     */
    drawAnimation: function drawAnimation() {
      this.currentAnimation.render({
        context: this.context,
        x: this.position.x,
        y: this.position.y
      });
    },

    /**
     * Play an animation.
     * @memberof kontra.sprite
     *
     * @param {string} name - Name of the animation to play.
     */
    playAnimation: function playAnimation(name) {
      this.currentAnimation = this.animations[name];
    },

    /**
     * Determine if the sprite is alive.
     * @memberof kontra.sprite
     *
     * @returns {boolean}
     */
    isAlive: function isAlive() {
      return this.timeToLive > 0;
    },

    /**
     * Set properties on the sprite.
     * @memberof kontra.sprite
     *
     * @param {object} properties - Properties to set on the sprite.
     * @param {number} properties.x - X coordinate of the sprite.
     * @param {number} properties.y - Y coordinate of the sprite.
     * @param {number} [properties.dx] - Change in X position.
     * @param {number} [properties.dy] - Change in Y position.
     * @param {number} [properties.ddx] - Change in X velocity.
     * @param {number} [properties.ddy] - Change in Y velocity.
     *
     * @param {object} [properties.properties] - Additional properties to set on the sprite.
     * @param {number} [properties.timeToLive=0] - How may frames the sprite should be alive.
     * @param {Context} [properties.context=kontra.context] - Provide a context for the sprite to draw on.
     *
     * @param {Image|Canvas} [properties.image] - Image for the sprite.
     *
     * @param {object} [properties.animations] - Animations for the sprite instead of an image.
     *
     * @param {string} [properties.color] - If no image or animation is provided, use color to draw a rectangle for the sprite.
     * @param {number} [properties.width] - Width of the sprite for drawing a rectangle.
     * @param {number} [properties.height] - Height of the sprite for drawing a rectangle.
     *
     * @param {function} [properties.update] - Function to use to update the sprite.
     * @param {function} [properties.render] - Function to use to render the sprite.
     *
     * If you need the sprite to live forever, or just need it to stay on screen until you
     * decide when to kill it, you can set <code>timeToLive</code> to <code>Infinity</code>.
     * Just be sure to set <code>timeToLive</code> to 0 when you want the sprite to die.
     */
    set: function set(properties) {
      properties = properties || {};

      var _this = this;

      _this.position = (_this.position || kontra.vector()).set(properties.x, properties.y);
      _this.velocity = (_this.velocity || kontra.vector()).set(properties.dx, properties.dy);
      _this.acceleration = (_this.acceleration || kontra.vector()).set(properties.ddx, properties.ddy);

      _this.timeToLive = properties.timeToLive || 0;
      _this.context = properties.context || kontra.context;

      // image sprite
      if (kontra.isImage(properties.image) || kontra.isCanvas(properties.image)) {
        _this.image = properties.image;
        _this.width = properties.image.width;
        _this.height = properties.image.height;

        // change the advance and draw functions to work with images
        _this.advance = _this.advanceSprite;
        _this.draw = _this.drawImage;
      }
      // animation sprite
      else if (properties.animations) {
        _this.animations = properties.animations;

        // default the current animation to the first one in the list
        _this.currentAnimation = properties.animations[ Object.keys(properties.animations)[0] ];
        _this.width = _this.currentAnimation.width;
        _this.height = _this.currentAnimation.height;

        // change the advance and draw functions to work with animations
        _this.advance = _this.advanceAnimation;
        _this.draw = _this.drawAnimation;
      }
      // rectangle sprite
      else {
        _this.color = properties.color;
        _this.width = properties.width;
        _this.height = properties.height;

        // change the advance and draw functions to work with rectangles
        _this.advance = _this.advanceSprite;
        _this.draw = _this.drawRect;
      }

      // loop through all other properties an add them to the sprite
      var excludedProperties = ['x', 'y', 'dx', 'dy', 'ddx', 'ddy', 'timeToLive', 'context', 'image', 'animations', 'color', 'width', 'height'];
      for (var prop in properties) {
        if (properties.hasOwnProperty(prop) && excludedProperties.indexOf(prop) === -1) {
          _this[prop] = properties[prop];
        }
      }
    },

    /**
     * Simple bounding box collision test.
     * @memberof kontra.sprite
     *
     * @param {object} object - Object to check collision against.
     *
     * @returns {boolean} True if the objects collide, false otherwise.
     */
    collidesWith: function collidesWith(object) {
      // handle non-kontra.sprite objects as well as kontra.sprite objects
      var x = (object.x !== undefined ? object.x : object.position.x);
      var y = (object.y !== undefined ? object.y : object.position.y);

      if (this.position.x < x + object.width &&
          this.position.x + this.width > x &&
          this.position.y < y + object.height &&
          this.position.y + this.height > y) {
        return true;
      }

      return false;
    },

    /**
     * Update the sprites velocity and position.
     * @memberof kontra.sprite
     * @abstract
     *
     * @param {number} dt - Time since last update.
     *
     * This function can be overridden on a per sprite basis if more functionality
     * is needed in the update step. Just call <code>this.advance()</code> when you need
     * the sprite to update its position.
     *
     * @example
     * sprite = kontra.sprite({
     *   update: function update(dt) {
     *     // do some logic
     *
     *     this.advance(dt);
     *   }
     * });
     */
    update: function update(dt) {
      this.advance(dt);
    },

    /**
     * Render the sprite.
     * @memberof kontra.sprite.
     * @abstract
     *
     * This function can be overridden on a per sprite basis if more functionality
     * is needed in the render step. Just call <code>this.draw()</code> when you need the
     * sprite to draw its image.
     *
     * @example
     * sprite = kontra.sprite({
     *   render: function render() {
     *     // do some logic
     *
     *     this.draw();
     *   }
     * });
     */
    render: function render() {
      this.draw();
    }
  };

  return kontra;
})(kontra || {}, Math);
/*jshint -W084 */

var kontra = (function(kontra) {
  'use strict';

  /**
   * Object pool. The pool will grow in size to accommodate as many objects as are needed.
   * Unused items are at the front of the pool and in use items are at the of the pool.
   * @memberof kontra
   *
   * @see kontra.pool.prototype.set for list of parameters.
   */
  kontra.pool = function(properties) {
    var pool = Object.create(kontra.pool.prototype);
    pool.set(properties);

    return pool;
  };

  kontra.pool.prototype = {
    /**
     * Set properties on the pool.
     * @memberof kontra.pool
     *
     * @param {object} properties - Properties of the pool.
     * @param {object} properties.create - Function that returns the object to use in the pool.
     * @param {object} properties.createProperties - Properties that will be passed to the create function.
     * @param {number} properties.maxSize - The maximum size that the pool will grow to.
     * @param {boolean} properties.fill - Fill the pool to max size instead of slowly growing.
     *
     * Objects inside the pool must implement <code>render()</code>, <code>update()</code>,
     * <code>set()</code>, and <code>isAlive()</code> functions.
     */
    set: function set(properties) {
      properties = properties || {};

      var error, obj;

      if (typeof properties.create !== 'function') {
        error = new SyntaxError('Required function not found.');
        kontra.logError(error, 'Parameter \'create\' must be a function that returns an object.');
        return;
      }

      // bind the create function to always use the create properties
      this.create = properties.create.bind(this, properties.createProperties || {});

      // ensure objects for the pool have required functions
      obj = this.create();

      if (!obj || typeof obj.render !== 'function' || typeof obj.update !== 'function' ||
          typeof obj.set !== 'function' || typeof obj.isAlive !== 'function') {
        error = new SyntaxError('Create object required functions not found.');
        kontra.logError(error, 'Objects to be pooled must implement render(), update(), set() and isAlive() functions.');
        return;
      }

      // start the pool with an object
      this.objects = [obj];
      this.size = 1;
      this.maxSize = properties.maxSize || Infinity;
      this.lastIndex = 0;
      this.inUse = 0;

      // fill the pool
      if (properties.fill) {
        while (this.objects.length < this.maxSize) {
          this.objects.unshift(this.create());
        }
      }
    },

    /**
     * Get an object from the pool.
     * @memberof kontra.pool
     *
     * @param {object} properties - Properties to pass to object.set().
     */
    get: function get(properties) {
      properties = properties || {};

      var _this = this;

      // the pool is out of objects if the first object is in use and it can't grow
      if (_this.objects[0].isAlive()) {
        if (_this.size === _this.maxSize) {
          return;
        }
        // 'double' the size of the array by filling it with twice as many objects
        else {
          for (var x = 0; x < _this.size && _this.objects.length < _this.maxSize; x++) {
            _this.objects.unshift(_this.create());
          }

          _this.size = _this.objects.length;
          _this.lastIndex = _this.size - 1;
        }
      }

      // save off first object in pool to reassign to last object after unshift
      var obj = _this.objects[0];
      obj.set(properties);

      // unshift the array
      for (var i = 1; i < _this.size; i++) {
        _this.objects[i-1] = _this.objects[i];
      }

      _this.objects[_this.lastIndex] = obj;
      _this.inUse++;
    },

    /**
     * Return all objects that are alive from the pool.
     * @memberof kontra.pool
     *
     * @returns {object[]}
     */
    getAliveObjects: function getAliveObjects() {
      return this.objects.slice(this.objects.length - this.inUse);
    },

    /**
     * Clear the object pool.
     * @memberof kontra.pool
     */
    clear: function clear() {
      this.inUse = 0;
      this.size = 1;
      this.lastIndex = 0;
      this.objects.length = 0;
      this.objects.push(this.create({}));
    },

    /**
     * Update all alive pool objects.
     * @memberof kontra.pool
     */
    update: function update(dt) {
      var i = this.lastIndex;
      var obj;

      // only iterate over the objects that are alive
      //
      // If the user kills an object outside of the update cycle, the pool won't know of
      // the change until the next update and inUse won't be decremented. If the user then
      // gets an object when inUse is the same size as objects.length, inUse will increment
      // and this statement will evaluate to -1.
      //
      // I don't like having to go through the pool to kill an object as it forces you to know
      // which object came from which pool. Instead, we'll just prevent the index from going below
      // 0 and accept the fact that inUse may be out of sync for a frame.
      var index = Math.max(this.objects.length - this.inUse, 0);

      while (i >= index) {
        obj = this.objects[i];

        obj.update(dt);

        // if the object is dead, move it to the front of the pool
        if (!obj.isAlive()) {

          // push an object from the middle of the pool to the front of the pool
          // without returning a new array through Array#splice to avoid garbage
          // collection of the old array
          // @see http://jsperf.com/object-pools-array-vs-loop
          for (var j = i; j > 0; j--) {
            this.objects[j] = this.objects[j-1];
          }

          this.objects[0] = obj;
          this.inUse--;
          index++;
        }
        else {
          i--;
        }
      }
    },

    /**
     * render all alive pool objects.
     * @memberof kontra.pool
     */
    render: function render() {
      var index = Math.max(this.objects.length - this.inUse, 0);

      for (var i = this.lastIndex; i >= index; i--) {
        this.objects[i].render();
      }
    }
  };

  return kontra;
})(kontra || {});

/**
 * Load images.
 */
kontra.getAssetName = function (url) {
  return url.replace(/\.[^/.]+$/, '');
};

kontra.images = {};
['footman.png', 'wizard.png', 'paladin.png'].forEach(function(src) {
  var image = new Image();
  var name = kontra.getAssetName(src);

  src = 'imgs/' + src;

  image.onload = function loadImageOnLoad() {
    kontra.images[name] = kontra.images[src] = this;
    document.querySelectorAll('.' + name).forEach(function(node) {
      node.stats.image = image;
    });
  };

  image.src = src;
});
/**
 *
 */
function createCreep(properties) {
  var creep = Object.create(createCreep.prototype);
  creep.set(properties);

  return creep;
}
createCreep.prototype = Object.create(kontra.sprite.prototype);

createCreep.prototype.set = function(properties) {
  kontra.sprite.prototype.set.call(this, properties);

  // additional properties
  this.position.set((waypoints[0].c + 0.5) * gridSize, (waypoints[0].r + 0.5) * gridSize);
  this.velocity.set(dir(waypoints[1].c, waypoints[0].c), dir(waypoints[1].r, waypoints[0].r));

  // set waypoint
  this.wp = 1;
  this.wpX = (waypoints[1].c + 0.5) * gridSize;
  this.wpY = (waypoints[1].r + 0.5) * gridSize;

  // set additional information about the creep
  this.center = {};
  this.traveled = 0;
  this.fullHealth = this.health;
  this.startCounting = false;
  this.accumulator = 0;
};

createCreep.prototype.update = function(dt) {
  this.position.add({x: this.velocity.x * gameSpeed * this.speed, y: this.velocity.y * gameSpeed * this.speed});
  this.center = {
    x: this.position.x - this.width / 2 | 0,
    y: this.position.y - this.height / 2 | 0
  };

  // heal self every sec
  if (this.healSec) {
    this.accumulator += dt;

    if (this.accumulator >= 1) {
      this.health += this.healSec;
      this.health = Math.min(this.fullHealth, this.health);

      this.accumulator -= 1;
    }
  }

  // only start counting how far the creep has gone once they've entered the screen
  if (this.startCounting) {
    this.traveled += this.speed;
  }
  else {
    this.startCounting = this.position.x > 0 && this.position.x < kontra.game.width &&
                         this.position.y > 0 && this.position.y < kontra.game.height;
  }

  // move to next waypoint when reached
  if (// check x
      ((this.velocity.x > 0 && this.position.x >= this.wpX) ||
       (this.velocity.x < 0 && this.position.x <= this.wpX)) ||
      // check y
      ((this.velocity.y > 0 && this.position.y >= this.wpY) ||
       (this.velocity.y < 0 && this.position.y <= this.wpY))) {
    this.wp++;

    // creep reached end of path
    if (!waypoints[this.wp]) {
      this.timeToLive = 0;
      this.reset();
      lives--;
      money += 30;
      return;
    }

    this.wpX = (waypoints[this.wp].c + 0.5) * gridSize;
    this.wpY = (waypoints[this.wp].r + 0.5) * gridSize;
    this.velocity.set(
      dir(waypoints[this.wp].c, waypoints[this.wp - 1].c),
      dir(waypoints[this.wp].r, waypoints[this.wp - 1].r)
    );
  }
};

createCreep.prototype.render = function() {
  this.context.drawImage(this.image, this.center.x, this.center.y);

  if (this.aura) {
    this.context.beginPath();
    this.context.arc(this.center.x + this.width/2, this.center.y + this.height/2, this.aura * gridSize, 0, 2 * Math.PI, false);
    this.context.stroke();
  }

  this.context.fillStyle = 'red';
  this.context.fillRect(this.center.x, this.position.y - 15, this.width, 5);
  this.context.fillStyle = 'green';
  this.context.fillRect(this.center.x, this.position.y - 15, (this.health / this.fullHealth) * this.width, 5);
};

createCreep.prototype.damage = function(damage, specials) {
  var damageReduction = Math.max(0, this.armor - (specials.armorPiercing || 0));
  var magicResist = (specials.armorPiercing && this.resistPiercing ? this.resistPiercing : 0);
  var miss = false;

  if (this.dodge) {
    miss = Math.random() <= (this.dodge / 100);
  }

  if (!miss) {
    this.health -= Math.max(0, damage - damageReduction - magicResist);
  }

  if (this.health <= 0) {
    this.timeToLive = 0;
    this.reset();
  }
};

createCreep.prototype.setProp = function(key, value) {
  switch(key) {
  case 'health':
    this.health = value;
    this.fullHealth = value;
    break;
  default:
    this[key] = value;
  }
};

createCreep.prototype.reset = function() {
  var _this = this;

  forEach(this, function(value, key) {
    if (typeof value === 'number') {
      _this[key] = 0;
    }
  });
};
/*jshint -W084 */

// spawner stats
var spawnerStats = [{
  armor: 0,
  desc: 'Basic soldier with no special abilities. Can spawn in large numbers.',
  title: 'Footman',
  cost: 60,
  incomeSec: 1,
  spawns: 1,
  speed: 1.35,
  health: 20,
  label: 'footman',
  timeToLive: Infinity,
  width: 10,
  height: 10,
  color: 'blue',
  keyCode: '70',
  gKey: 'F',
  upgrades: [{
    title: 'Training Grounds',
    desc: 'Send more Footman at once.',
    levels: [{
      cost: 110,
      spawns: 2
    },
    {
      cost: 200,
      spawns: 3
    }]
  },
  {
    title: 'Improved Rations',
    desc: 'Improve the health of Footman.',
    levels: [{
      cost: 125,
      health: 30
    },
    {
      cost: 215,
      health: 40
    },
    {
      cost: 500,
      health: 50
    }]
  }]
},
{
  armor: 2,
  desc: 'Armored creep that takes reduced damage.',
  title: 'Paladin',
  cost: 110,
  incomeSec: 1,
  spawns: 1,
  speed: 1,
  health: 40,
  label: 'paladin',
  timeToLive: Infinity,
  width: 12,
  height: 12,
  color: 'darkgrey',
  keyCode: '65',
  gKey: 'A',
  upgrades: [{
    title: 'Steel Plating',
    desc: 'Increase the armor of Paladins.',
    levels: [{
      cost: 140,
      armor: 4
    },
    {
      cost: 240,
      armor: 5
    }]
  },
  {
    title: 'Holy Hands',
    desc: 'Allow Paladins to heal themselves over time.',
    levels: [{
      cost: 200,
      healSec: 2
    },
    {
      cost: 500,
      healSec: 4
    }]
  }]
},
// {
//   armor: 1,
//   desc: 'Fast creep.',
//   title: 'Calvary',
//   cost: 75,
//   incomeSec: 1,
//   spawns: 1,
//   speed: 2,
//   health: 15,
//   label: 'speedster',
//   timeToLive: Infinity,
//   width: 14,
//   height: 9,
//   color: 'red',
//   keyCode: '67',
//   gKey: 'C',
//   upgrades: [{
//     title: 'Spurs',
//     desc: 'Increase move speed of Calvary.',
//     levels: [{
//       cost: 210,
//       speed: 2.25
//     },
//     {
//       cost: 325,
//       speed: 2.5
//     },
//     {
//       cost: 500,
//       speed: 3
//     }]
//   }]
// },
{
  armor: 0,
  desc: 'Power spell cater able to buff allies with spells.',
  title: 'Wizard',
  cost: 60,
  incomeSec: 1,
  spawns: 1,
  speed: 1.35,
  health: 15,
  label: 'wizard',
  timeToLive: Infinity,
  width: 10,
  height: 10,
  color: 'purple',
  keyCode: '87',
  gKey: 'W',
  upgrades: [{
    title: 'Protection Aura',
    desc: 'Reduce enemy spell damage around the Wizard.',
    levels: [{
      cost: 100,
      magicResist: 5,
      aura: 1 // range of aura in tiles
    },
    {
      cost: 300,
      magicResist: 10,
      aura: 1.25
    },
    {
      cost: 600,
      magicResist: 15,
      aura: 1.5
    }]
  },
  {
    title: 'Far Sight',
    desc: 'Wizard is able to see the future and avoid an attack.',
    levels: [{
      cost: 200,
      dodge: 25
    },
    {
      cost: 500,
      dodge: 50
    }]
  }]
}];

var spawnerStatRange = {
  armor: {
    0: 'None',
    1: 'Low',
    2: 'Low',
    3: 'Medium',
    4: 'Medium',
    5: 'High'
  },
  speed: {
    1: 'Slow',
    1.35: 'Medium',
    2: 'Fast',
    2.25: 'Fast',
    2.5: 'Very Fast',
    3: 'Extremely Fast'
  },
  magicResist: {
    0: 'None',
    5: 'Low',
    10: 'Medium',
    15: 'High'
  }
};

/**
 *
 */
function createSpawner(properties) {
  var spawner = Object.create(createSpawner.prototype);
  spawner.set(properties);

  spawner.creep = {};

  var spawn = spawnerBuildings.appendChild(document.createElement('div')
    .setAttribute({
      class: 'spawner-container',
      id: 'spawner-' + spawner.id
    })
    .setStyle({
      left: properties.x + 'px',
      top: properties.y + 'px',
    })
    .addEventListener('click', function(e) {
      var target = e.target;
      var targetClass = target.classList;
      var parent = target.parentElement;
      var cSpawn = parent.querySelector('.spawner');
      var cUpgrades = parent.querySelectorAll('.spawner-upgrade');
      var cSell = parent.querySelector('.sell');

      if (targetClass.contains('cant-afford') || targetClass.contains('completed')) {
        e.preventDefault();
        e.stopPropagation();

        return;
      }

      if (targetClass.contains('spawner')) {
        parent.classList.toggle('selected');
      }
      else if (targetClass.contains('spawner-upgrade') && money >= (target.stats.cost || 0)) {
        var upgrades, upgrade, levels, level;

        money -= target.stats.cost || 0;
        income += target.stats.incomeSec || 0;

        forEach(target.stats, function(value, key) {
          spawner.creep[key] = value;
        });

        // sell building
        if (target.stats.refund) {
          money += target.stats.refund;
          income--;

          cUpgrades.forEach(function(node, index) {
            node.show().setAttribute({
              class: 'spawner-upgrade ' + spawnerStats[index].label,
            });
            node.stats = clone(spawnerStats[index]);
          });

          cSpawn.setAttribute({
            class: 'spawner',
            desc: 'Choose a creep to send in the wave.',
            emp: ''
          });
        }
        // set building upgrades
        else if (upgrades = target.stats.upgrades) {
          cSpawn.setAttribute({
              desc: 'Upgrade',
              emp: target.stats.title
            })
            .classList.add(target.stats.label);

          var cost = target.stats.cost;

          // change to upgrade list
          cUpgrades.forEach(function(node, index) {
            if (upgrade = upgrades[index]) {
              node.stats = clone(upgrade);
              node.stats.currLevel = 0;

              node.stats.gLevels = '(0/' + upgrade.levels.length + ')';

              // set the upgrade level to 0
              forEach(upgrade.levels[0], function(value, key) {
                node.stats[key] = value;
              });
            }
            // make the last "upgrade" a sell tower
            else if (index === cUpgrades.length - 1) {
              node.classList.add('sell');
              node.stats = {
                title: 'Sell',
                desc: 'Sell for 75% of the total cost',
                refund: Math.round(cost * 0.75)
              };
            }
            // hide nodes that are not used for upgrades
            else {
              node.hide();
            }
          });
        }
        // increase a building upgrade level
        else if (levels = target.stats.levels) {
          level = ++target.stats.currLevel;
          cSell.stats.refund += Math.round(target.stats.cost * 0.75);

          target.stats.gLevels = target.stats.gLevels.replace(/\(./, '(' + level);

          if (level >= levels.length) {
            target.classList.add('completed');
            target.stats.cost = 0;
          }
          else {
            forEach(levels[level], function(value, key) {
              target.stats[key] = value;
            });
          }
        }
      }

      target.blur();
      cSpawn.focus();
    })
  );

  spawn.appendChild(document.createElement('button')
    .setAttribute({
      class: 'spawner',
      desc: 'Choose a creep to send in the wave.'
    })
  );

  for (var i = 0; i < spawnerStats.length; i++) {
    var upgrade = spawn.appendChild(document.createElement('button')
      .setAttribute({
        class: 'spawner-upgrade ' + spawnerStats[i].label,
        key: spawnerStats[i].gKey,
        keyCode: spawnerStats[i].keyCode
      })
    );
    upgrade.stats = clone(spawnerStats[i]);
  }

  document.querySelectorAll('#spawner-' + spawner.id + ' .spawner-upgrade').forEach(function(node) {
    node.addEventListener('mouseenter focus', function(e) {
      var target = e.target;

      card.classList.add('show');
      gKey.hide();

      forEach(target.stats, function(value, key) {
        var stat = window[key];

        if (stat) {
          if (stat === gKey) {
            stat.innerHTML = '[' + value + ']';
          }
          else {
            stat.innerHTML = (spawnerStatRange[key] ? spawnerStatRange[key][value] : value);
          }

          if (stat.nodeName === 'SPAN') {
            stat.parentElement.show();
          }
          else {
            stat.show();
          }
        }

        if (key === 'cost' && target.classList.contains('completed')) {
          cost.parentElement.hide();
        }

        if (key === 'upgrades') {
          cUpgrades.show();
           cUpgrades.querySelectorAll('div').forEach(function(upgrade) { upgrade.hide(); });

          value.forEach(function(upgrade, index) {
            window['upgrade-title-' + index].setInnerHTML(upgrade.title).parentElement.show();
            window['upgrade-desc-' + index].show().innerHTML = upgrade.desc;
          });
        }
      });

      showCard(target);
    });

    node.addEventListener('mouseleave blur', function(e) {
      hideCard();
    });
  });

  return spawner;
}
createSpawner.prototype = Object.create(kontra.sprite.prototype);
/*jshint -W084 */

var towerStats = {
  // arrow tower
  '>': {
    title: 'Arrow Tower',
    desc: 'Basic tower that is effective against weak creeps.',
    label: 'arrow',
    width: 32,
    height: 32,
    range: 2.5,
    fireRate: 2,  // can shoot 2 times a second
    damage: 10,
    opacity: 0.5
  },
  '^': {
    title: 'Bolt Tower',
    desc: 'Upgraded tower that is more effective against creep.',
    label: 'arrow',
    width: 32,
    height: 32,
    range: 2.75,
    fireRate: 2,  // can shoot 2 times a second
    damage: 15,
    opacity: 0.5
  },

  // magic tower
  '~': {
    title: 'Mage Tower',
    desc: 'Magic damage ignores a portion of a creeps armor.',
    label: 'magic',
    width: 32,
    height: 32,
    range: 2.25,
    fireRate: 1.5,
    damage: 15,
    armorPiercing: 7.5,
    opacity: 0.2
  },

  // cannon tower
  '@': {
    title: 'Cannon Tower',
    desc: 'Slow firing tower that deals splash damage.',
    label: 'cannon',
    width: 32,
    height: 32,
    range: 3,
    fireRate: 0.34,
    aura: 0.5, // explosion damages creeps in half a tile away (about 3 creeps)
    damage: 20,
    opacity: 0.3
  }
};

var towerStatRange = {
  fireRate: {
    1: 'Very Slow',
    1.5: 'Slow',
    2: 'Medium',
    2.5: 'Medium'
  },
  range: {
    2.25: 'Medium',
    2.5: 'Medium',
    2.75: 'Far',
    3: 'Very Far'
  }
};

/**
 * Alpha a hex color.
 * @see http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
 * @param {string} hex
 * @param {number} alpha
 * @returns {string}
 */
function makeOpaque(hex, alpha) {
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  var color = result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;

  return 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + alpha + ')';
}

/**
 *
 */
function createTower(properties) {
  var tower = Object.create(createTower.prototype);

  // merge properties
  forEach(towerStats[properties.type], function(value, key) {
    properties[key] = value;
  });
  tower.set(properties);

  var range = 2 * properties.range * gridSize;

  tower.towerDom = gTowers.appendChild(document.createElement('button')
    .setAttribute({
      class: 'tower ' + tower.label + (properties.isBuilding ? ' is-building' : ''),
      id: 'tower-' + tower.id,
    })
    .setStyle({
      left: properties.x + (gridSize - properties.width) / 2 + 'px',
      top: properties.y + (gridSize - properties.height) / 2 + 'px'
    })
    .addEventListener('mouseenter focus', function(e) {
      var target = e.target;

      gKey.hide();

      forEach(target.stats, function(value, key) {
        var stat = window[key];

        if (stat) {
          if (stat === gKey) {
            stat.innerHTML = '[' + value + ']';
          }
          else {
            stat.innerHTML = (towerStatRange[key] ? towerStatRange[key][value] : value);
          }

          if (stat.nodeName === 'SPAN') {
            stat.parentElement.show();
          }
          else {
            stat.show();
          }
        }
      });

      if (tower.isBuilding) {
        isBuilding.show();
      }
      else {
        isBuilding.hide();
      }

      showCard(target);
    })
    .addEventListener('mouseleave blur', function(e) {
      hideCard();
    }).addEventListener('click', function(e) {
      e.target.classList.add('selected');
    }));

  tower.towerDom.stats = towerStats[properties.type];

  tower.rangeDom = gTowers.appendChild(document.createElement('div')
    .setAttribute({
      class: 'tower-range',
      id: 'tower-range-' + tower.id
    })
    .setStyle({
      width: range + 'px',
      height: range + 'px',
      left: properties.x + (gridSize - properties.width) / 2 - range / 2 + properties.width / 2 + 'px',
      top: properties.y + (gridSize - properties.height) / 2 - range / 2 + properties.height / 2 + 'px',
      zIndex: -1
    }));

  tower.center = {
    x: tower.position.x + tower.width / 2 | 0,
    y: tower.position.y + tower.height / 2 | 0
  };

  tower.rateOfFire = 1 / tower.fireRate;
  tower.accumulator = 0;
  tower.prevTarget = null;

  return tower;
}
createTower.prototype = Object.create(kontra.sprite.prototype);

createTower.prototype.update = function(dt) {
  var maxTraveled = 0;
  var aliveCreeps = creeps.getAliveObjects();
  var _this = this;
  var dist;

  this.target = null;

  if (this.isBuilding) {
    return;
  }

  for (var i = 0, creep; creep = aliveCreeps[i]; i++) {
    dist = distance(this, creep);

    // target the creep in range that has traveled the farthest
    if (dist <= this.range * gridSize && creep.traveled > maxTraveled) {
      maxTraveled = creep.traveled;
      this.target = creep;
    }
  }

  this.accumulator += dt;

  if (this.accumulator >= this.rateOfFire) {
    if (this.target) {
      var targets = [this.target];

      // aoe blast
      if (this.aura) {

        // search for other creeps to damage
        for (i = 0; creep = creeps.objects[i]; i++) {
          dist = distance(this.target, creep);

          if (dist <= this.aura * gridSize && creep !== this.target) {
            targets.push(creep);
          }
        }
      }

      targets.forEach(function(target) {
        target.damage(_this.damage, {
          armorPiercing: _this.armorPiercing
        });
      });

      this.accumulator -= this.rateOfFire;
    }
    // no one to fire at so hold
    else {
      this.accumulator -= dt;
    }
  }

};

createTower.prototype.render = function() {
  // if (this.target) {
  //   this.context.beginPath();
  //   this.context.moveTo(this.center.x,this.center.y);
  //   this.context.lineTo(this.target.center.x, this.target.center.y);
  //   this.context.stroke();
  // }
};

createTower.prototype.upgrade = function(type) {
  this.isBuilding = false;
  this.towerDom.classList.remove('is-building');
};

createTower.prototype.beginUpgrade = function(type) {
  this.isBuilding = true;

  var _this = this;

  forEach(towerStats[type], function(value, key) {
    _this[key] = value;
  });

  var range = 2 * this.range * gridSize;

  this.towerDom.stats = towerStats[type];

  this.rangeDom.setStyle({
    width: range + 'px',
    height: range + 'px',
    left: this.position.x - range / 2 + this.width / 2 + 'px',
    top: this.position.y - range / 2 + this.height / 2 + 'px',
  });
};
/*jshint -W084 */

kontra.init({canvas: 'game'});

/*
 * KEY
 * #       path
 * *       spawn building locations
 * [a-z]   waypoint
 * >       arrow v1
 * ^       arrow v2
 * ~       magic v1
 * @       cannon v1
 */
var level = [
  '        o',
  '        n###m',
  '   c##d     #',
  '   # >#  k##l',
  'a##b  #  #',
  '      #  #',
  '      #  j####i',
  '  f###e       #',
  '  #           #',
  '  g###########h',
  '',
  ' * * * * * *',
];

var towerUpgrades = {
  3: [
    {'>': [8,4]}
  ],
  5: [
    {'>': [7,12]}
  ],
  6: [
    {'~': [5,8]}
  ],
  7: [
    {'^': [2,11]}
  ],
  9: [
    {'@': [8,8]}
  ],
  15: [
    {'@': [2,8]}
  ]
};

var context = kontra.context;
var waypointRegex = /[a-z]/;
var waypoints = [];
var towers = [];
var spawners = [];
var lives = 20;
var staticContext = staticCanvas.getContext('2d');
var money = 110;
var income = 0;  // money/sec
var wavesLeft = 20;
var round = 1;
var waveInProgress = false;
var groupCount = 0;
var gameSpeed = 1;
var buildingTowers = [];
var upgradingTowers = [];
var cardDivs = card.querySelectorAll('div');

cardDivs.forEach(function(node) {
  node.hide();
});

/**
 * Clone an object into a new object.
 * @param {object} obj
 * @returns {object}
 */
function clone(obj) {
  var newObj = {};

  forEach(obj, function(value, key) {
    newObj[key] = value;
  });

  return newObj;
}

/**
 * Return the direction from point a to point b.
 * @param {number} a - Row or column of origin.
 * @param {number} b - Row or column of destination.
 * @returns {number} -1 (left), 0, 1 (right)
 */
function dir(a, b) {
  return a - b > 0 ? 1 : a - b < 0 ? -1 : 0;
}


/**
 * Get the distance between two creeps.
 * @param {object} a
 * @param {object} b
 * @returns {number}
 */
function distance(a, b) {
  var x = b.position.x - a.center.x;
  var y = b.position.y - a.center.y;
  return Math.sqrt(x * x + y * y);
}

/**
 * Return a random number in range.
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function rand(low, high) {
  return Math.floor( Math.random() * (high - low + 1) + low );
}

/**
 * Loop through all properties on an object and return the key
 * @param {object} obj
 * @param {function} callback
 */
function forEach(obj, callback) {
  for (var prop in obj) {
    callback(obj[prop], prop);
  }
}

/**
 * Show the help card.
 */
function showCard(target) {
  card.classList.add('show');

  var rect = target.getBoundingClientRect();
  var cardRect = card.getBoundingClientRect();
  var containerRect = container.getBoundingClientRect();
  var top = rect.top - containerRect.top - cardRect.height - 10;
  var left = rect.left - containerRect.left;

  if (top < 0) {
    top = rect.bottom - containerRect.top + 10;
    card.classList.add('top');
  }
  else {
    card.classList.remove('top');
  }

  if (left + card.offsetWidth > kontra.game.width) {
    left = rect.right - containerRect.left - card.offsetWidth - 10;
    card.classList.add('right');
  }
  else {
    card.classList.remove('right');
  }

  card.setStyle({
    top: top + 'px',
    left: left + 'px'
  });
}

/**
 * Hide the card.
 */
function hideCard() {
  card.classList.remove('show');
  cardDivs.forEach(function(node) {
    node.hide();
  });
}

/**
 * Spawn a group for the wave.
 */
function spawnWave() {
  groupCount++;

  // spawn all creeps
  var spacer = 0;
  for (var i = 0; i < spawners.length; i++) {
    for (var j = 0; j < spawners[i].creep.spawns; j++) {
      creeps.get(spawners[i].creep);

      // space out each group
      creeps.objects[creeps.lastIndex].position.x -= (creeps.objects[creeps.lastIndex].width + 2) * (spacer + j);
    }

    spacer += spawners[i].creep.spawns || 0;
  }
}

// create waypoints and towers
for (var r = 0; r < level.length; r++) {
  for (var c = 0; c < level[r].length; c++) {
    var space = level[r][c];

    if (waypointRegex.test(space)) {
      waypoints.push({i: space.charCodeAt() - 97, r: r, c: c});
      staticContext.fillStyle = '#9b7653';
      staticContext.fillRect(c * gridSize, r * gridSize, gridSize, gridSize);
    }

    // path
    if (space === '#') {
      staticContext.fillStyle = '#9b7653';
      staticContext.fillRect(c * gridSize, r * gridSize, gridSize, gridSize);
    }
    // spawn building location
    else if (space === '*') {
      spawners.push(createSpawner({
        id: spawners.length,
        x: c * gridSize,
        y: r * gridSize
      }));
    }
    else if (towerStats[space]) {
      towers.push(createTower({
        type: space,
        id: towers.length,
        x: c * gridSize,
        y: r * gridSize
      }));
    }
  }
}

// sort waypoints in order
waypoints.sort(function(a,b) {
  return a.i - b.i;
});

// start and end waypoints off map
if (waypoints[0].r === 0) {
  waypoints[0].r = -1;
}
else if (waypoints[0].r === gridHeight - 1) {
  waypoints[0].r = gridHeight;
}
else if (waypoints[0].c === 0) {
  waypoints[0].c = -1;
}
else {
  waypoints[0].c = gridWidth;
}

var endWaypoint = waypoints[waypoints.length - 1];
if (endWaypoint.r === 0) {
  endWaypoint.r = -1;
}
else if (endWaypoint.r === gridHeight - 1) {
  endWaypoint.r = gridHeight;
}
else if (endWaypoint.c === 0) {
  endWaypoint.c = -1;
}
else {
  endWaypoint.c = gridWidth;
}

// need to spawn creeps after waypoints have been set
var creeps = kontra.pool({
  create: createCreep
});
// need to save spawner upgrades after spawners have been placed
var purchases = spawnerBuildings.querySelectorAll('.spawner-upgrade');

var accumulator = 0;
var spawnAccumulator = 0;

var loop = kontra.gameLoop({
  update: function(dt) {
    dt = dt * gameSpeed; // speed up all timers

    // check price of all purchases
    purchases.forEach(function(node) {
      if (node.stats.cost > money) {
        node.classList.add('cant-afford');
      }
      else {
        node.classList.remove('cant-afford');
      }
    });

    // gain income and spawn groups of creeps
    if (creeps.getAliveObjects().length !== 0 || waveInProgress) {
      accumulator += dt;
      spawnAccumulator += dt;

      // income tick every sec
      if (accumulator >= 1) {
        money += income;
        accumulator -= 1;
      }

      // spawn a group every 2 seconds
      if (groupCount < 9) {
        if (spawnAccumulator >= 2) {
          spawnWave();
          spawnAccumulator -= 2;
        }
      }
      else {
        waveInProgress = false;
      }
    }
    // check for new towers to be built
    else {
      sendWave.removeAttribute('disabled');

      // build towers for this round
      if (towerUpgrades[round] && !towerUpgrades[round].isBuilt) {
        upgradingTowers.forEach(function(tower) {
          tower.upgrade();
        });

        buildingTowers.forEach(function(tower) {
          tower.upgrade();
          towers.push(tower);
        });

        buildingTowers = [];
        upgradingTowers = [];
        towerUpgrades[round].isBuilt = true;
      }
      // telegraph the construction of new towers in the next round
      if (towerUpgrades[round+1] && !towerUpgrades[round+1].isBuilding) {
        towerUpgrades[round+1].forEach(function(upgrade) {

          var tower = Object.keys(upgrade)[0];
          var pos = upgrade[tower];

          // check that a tower is being upgraded
          var isUpgrade = false;
          for (var i = 0, t; t = towers[i]; i++) {
            if (t.position.x === pos[1] * gridSize && t.position.y === pos[0] * gridSize) {
              isUpgrade = true;
              t.beginUpgrade(tower);
              upgradingTowers.push(t);
              break;
            }
          }

          if (!isUpgrade) {
            buildingTowers.push(createTower({
              type: tower,
              id: towers.length,
              x: pos[1] * gridSize,
              y: pos[0] * gridSize,
              isBuilding: true
            }));
          }
        });

        towerUpgrades[round+1].isBuilding = true;
      }
    }

    pLives.innerHTML = lives;
    pMoney.innerHTML = money;
    pIncome.innerHTML = income;
    pWaves.innerHTML = wavesLeft;

    creeps.update(dt);

    if (lives <= 0) {
      loop.stop();
      alert('Game Over');
    }

    if (wavesLeft <= 0) {
      loop.stop();
      alert('You Win!');
    }

    // check wizard protection
    for (var i = 0, aCreep; aCreep = creeps.objects[i]; i++) {
      for (var j = i, bCreep; bCreep = creeps.objects[j]; j++) {
        if (aCreep.label === 'spellcaster' || bCreep.label === 'spellcaster') {
          var dist = distance(aCreep, bCreep);

          if (dist <= aCreep.aura * gridSize || dist <= bCreep.aura * gridSize) {
            var resist = Math.max(aCreep.magicResist, bCreep.magicResist);
            aCreep.resistPiercing = resist;
            bCreep.resistPiercing = resist;
          }
        }
        else {
          aCreep.resistPiercing = 0;
          bCreep.resistPiercing = 0;
        }
      }
    }

    for (var k = 0; k < towers.length; k++) {
      towers[k].update(dt);
    }
  },
  render: function() {
    kontra.context.clearRect(0 , 0, kontra.canvas.width, kontra.canvas.height);

    creeps.render();

    for (i = 0; i < towers.length; i++) {
      towers[i].render();
    }
  }
});

loop.start();

// show tooltips
document.querySelectorAll('[desc]').forEach(function(node) {
  node.addEventListener('mouseenter focus', function(e) {
    var target = e.target;

    title.show().innerHTML = target.getAttribute('desc');

    if (target.getAttribute('key')) {
      gKey.show();
      gKey.innerHTML = '[' + target.getAttribute('key') + ']';
    }
    else if (target.getAttribute('emp')) {
      gKey.show();
      gKey.innerHTML = target.getAttribute('emp');
    }

    showCard(target);
  });

  node.addEventListener('mouseleave blur', function(e) {
    hideCard();
  });
});

// blur all selected objects (set to true so it always happens first)
document.addEventListener('click keydown', function(e) {
  if (e.type === 'click' && (e.target.classList.contains('cant-afford') || e.target.classList.contains('completed'))) {
    e.preventDefault();
    e.stopPropagation();
    return;
  }

  if ((e.type === 'keydown' && e.keyCode === 27) || e.type === 'click') {
    // don't close anything if the go or speed buttons are pressed
    if (e.target !== sendWave && e.target.parentElement !== gSpeed) {
      document.querySelectorAll('.selected').forEach(function(node) {
        node.classList.remove('selected');
      });

      // set focus back to the building if an upgrade is selected
      var currentFocus = document.activeElement;
      if (e.type === 'keydown' && currentFocus && currentFocus.classList.contains('bldg-upgrade')) {
        currentFocus.parentNode.querySelector('.bldg').focus();
      }

      hideCard();
    }
  }

  // quick key
  if (e.type === 'keydown') {
    document.querySelectorAll('[keyCode="' + e.keyCode + '"]').forEach(function(el) {
      var computedStyle = window.getComputedStyle(el);

      if (computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden') {
        el.click();
      }
    });
  }
}, true);

// adjust game speed
gSpeed.addEventListener('click', function(e) {
  gameSpeed = parseInt(e.target.getAttribute('speed'));

  // remove current class from any speed buttons whose speed is greater than the current
  var query = [1,2,3]
    .filter(function(a) {
      return a > gameSpeed;
    }).map(function(a) {
      return '[speed="' + a + '"]';
    }).join(',');

  if (query) {
    gSpeed.querySelectorAll(query).forEach(function(node) {
      node.classList.remove('current');
    });
  }

  // add current class to any speed buttons whose speed is less than the current
  query = [1,2,3]
    .filter(function(a) {
      return a <= gameSpeed;
    }).map(function(a) {
      return '[speed="' + a + '"]';
    }).join(',');

  if (query) {
    // add current to other classes
    gSpeed.querySelectorAll(query).forEach(function(node) {
      node.classList.add('current');
    });
  }
});

// spawn new wave
sendWave.addEventListener('click', function(e) {
  if (!waveInProgress && creeps.getAliveObjects().length === 0 && wavesLeft > 0) {
    groupCount = 0;
    spawnAccumulator = 0;
    spawnWave();

    // there was something to send
    if (creeps.getAliveObjects().length) {
      waveInProgress = true;
      wavesLeft--;
      round++;
      e.target.setAttribute('disabled', true);
    }
  }
});