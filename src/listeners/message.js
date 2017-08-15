const { Listener } = require('discord-akairo');
const { Inventory, ItemGroup } = require('../structures/all.js');

const cooldowns = [];

function exec(msg) {
  if (!cooldowns.includes(msg.author.id) && !msg.author.bot) {
    const inventory = new Inventory(msg.author);
    inventory.add(ItemGroup.baseCurrency().groupOf(Math.floor((Math.random() * (60 - 40)) + 40)));
    cooldowns.push(msg.author.id);
    setTimeout(() => cooldowns.splice(cooldowns.indexOf(msg.author.id), 1), 6e4);
  }
}

module.exports = new Listener('message', exec, {
  emitter: 'client',
  eventName: 'message'
});
