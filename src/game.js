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