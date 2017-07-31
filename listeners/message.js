const { Listener } = require('discord-akairo');
const { Inventory, Item } = require('../structures/all.js');

const cooldowns = [];

async function exec(msg) {
  if (!cooldowns.includes(msg.author.id)) {
    const inventory = await Inventory.fetch(msg.author);
    inventory.update(Item.GEM, Math.floor((Math.random() * (4 - 1)) + 1));
    cooldowns.push(msg.author.id);
    setTimeout(() => cooldowns.splice(cooldowns.indexOf(msg.author.id), 1), 6e4);
  }
}

module.exports = new Listener('message', exec, {
  emitter: 'client',
  eventName: 'message'
});
