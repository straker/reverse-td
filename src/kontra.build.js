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