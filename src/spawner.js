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