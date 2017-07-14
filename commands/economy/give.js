const { Command } = require('discord-akairo');
const { Inventory, Item } = _struct;

async function exec(msg, args) {
  const { user, amount, item } = args;
  if (!item) return msg.util.error('there is no such item available.');

  const inventory = await Inventory.fetch(user);
  inventory.update(item, amount);
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
      id: 'amount',
      type: 'integer',
      default: 1
    },
    {
      id: 'item',
      match: 'rest',
      type: word => Item.resolve(word)
    }
  ]
});
