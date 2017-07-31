const { Command } = require('discord-akairo');
const { Item } = require('../../structures/all.js');

async function exec(msg, args) {
  const { item } = args;
  if (!item) return msg.util.error('couldn\'t find that item.');
  const id = item.id;
  item.destroy();
  return msg.util.success(`destroyed **${id}**.`);
}

module.exports = new Command('destroy', exec, {
  aliases: ['destroy'],
  ownerOnly: true,
  description: 'Destroy an item.',
  split: 'sticky',
  args: [
    {
      id: 'item',
      match: 'rest',
      type: word => Item.resolve(word)
    }
  ]
});
