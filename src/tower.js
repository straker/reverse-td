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