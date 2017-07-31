const { Listener } = require('discord-akairo');
const { Inventory, Item } = require('../structures/all.js');

const cooldowns = [];

function exec(msg) {
  if (!cooldowns.includes(msg.author.id)) {
    const inventory = new Inventory(msg.author);
    inventory.update(Item.GEM.groupOf(Math.floor((Math.random() * (4 - 1)) + 1)));
    cooldowns.push(msg.author.id);
    setTimeout(() => cooldowns.splice(cooldowns.indexOf(msg.author.id), 1), 6e4);
  }
}

module.exports = new Listener('message', exec, {
  emitter: 'client',
  eventName: 'message'
});
