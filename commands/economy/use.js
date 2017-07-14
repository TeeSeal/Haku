const { Command } = require('discord-akairo');
const { Inventory, Item } = _struct;

async function exec(msg, args) {
  const { item } = args;
  const inventory = await Inventory.fetch(msg.author);
  if (!inventory.has(item.id)) return msg.util.error('you don\'t have any of that.');
  return await inventory.use(item, msg);
}

module.exports = new Command('use', exec, {
  aliases: ['use'],
  description: 'Use an item.',
  split: 'sticky',
  args: [
    {
      id: 'item',
      match: 'rest',
      type: word => Item.resolve(word)
    }
  ]
});
