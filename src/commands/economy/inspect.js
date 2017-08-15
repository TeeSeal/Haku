const { Command } = require('discord-akairo');
const { ItemGroup, Inventory } = require('../../structures/all.js');

function exec(msg, args) {
  const { item } = args;
  if (!item) return msg.util.error('couldn\'t find that item.');

  const inventory = new Inventory(msg.author);
  if (!inventory.has(item.id)) return msg.util.error('you may not inspect items that you don\'t have.');

  return msg.util.send(item.inspect(), { files: item.imagePath ? [item.imagePath] : [] });
}

module.exports = new Command('inspect', exec, {
  aliases: ['inspect'],
  description: 'Inspect an item.',
  split: 'sticky',
  args: [
    {
      id: 'item',
      match: 'rest',
      type: ItemGroup.resolve
    }
  ]
});
