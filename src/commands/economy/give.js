const { Command } = require('discord-akairo');
const { Inventory, Item } = require('../../structures/all.js');

function exec(msg, args) {
  const { user, item } = args;
  if (!item) return msg.util.error('there is no such item available.');

  const inventory = new Inventory(user);
  inventory.update(item);
  return msg.util.success('inventory updated.');
}

module.exports = new Command('give', exec, {
  aliases: ['give'],
  ownerOnly: true,
  description: 'Give someone some items.',
  split: 'sticky',
  args: [
    {
      id: 'user',
      type: 'user'
    },
    {
      id: 'item',
      match: 'rest',
      type: Item.resolveGroup
    }
  ]
});