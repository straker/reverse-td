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