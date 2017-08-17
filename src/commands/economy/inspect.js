const { Command } = require('discord-akairo');
const { Items, Inventory } = require('../../structures/all.js');

function exec(msg, args) {
  const { item } = args;
  if (!item) return msg.util.error('couldn\'t find that item.');

  const inventory = new Inventory(msg.author);
  if (!inventory.has(item.id) && !Items.SHOP.has(item.id)) {
    return msg.util.error('you can only inspect items in your inventory or in the shop.');
  }

  return msg.util.send(item.examine(), { files: item.imagePath ? [item.imagePath] : [] });
}

module.exports = new Command('inspect', exec, {
  aliases: ['inspect'],
  description: 'Inspect an item.',
  split: 'sticky',
  args: [
    {
      id: 'item',
      match: 'rest',
      type: Items.resolveGroup
    }
  ]
});
