const { Command } = require('discord-akairo');
const { Item } = require('../../structures/all.js');

async function exec(msg, args) {
  const { item } = args;
  if (!item) return msg.util.error('couldn\'t find that item.');
  if (!item.imagePath) return msg.util.error('this item cannot be inspected.');
  return msg.util.send({ files: [{ attachment: item.imagePath }] });
}

module.exports = new Command('inspect', exec, {
  aliases: ['inspect'],
  description: 'Inspect an item.',
  split: 'sticky',
  args: [
    {
      id: 'item',
      match: 'rest',
      type: word => Item.resolve(word)
    }
  ]
});
