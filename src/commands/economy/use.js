const { Command } = require('discord-akairo');
const { ItemGroup, Inventory } = require('../../structures/all.js');

async function exec(msg, args) {
  const { item } = args;
  const inventory = new Inventory(msg.author);
  if (!inventory.has(item.id)) return msg.util.error('you don\'t have any of that.');
  return inventory.get(item.id).use(msg);
}

module.exports = new Command('use', exec, {
  aliases: ['use'],
  description: 'Use an item.',
  split: 'sticky',
  args: [
    {
      id: 'item',
      match: 'rest',
      type: ItemGroup.resolve
    }
  ]
});
