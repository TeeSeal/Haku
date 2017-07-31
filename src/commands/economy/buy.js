const { Command } = require('discord-akairo');
const { Inventory, Item } = require('../../structures/all.js');

function exec(msg, args) {
  const { item } = args;
  if (!item) return msg.util.error('dunno what you\'re trying to buy.');

  if (!Item.SHOP.has(item.id)) return msg.util.error('there is no such item in the shop.');

  const inventory = new Inventory(msg.author);
  const gems = inventory.gems || { amount: 0 };
  if (gems.amount < item.price) return msg.util.error('you don\'t have enough gems to buy that.');

  inventory.update(item);
  inventory.consume(Item.GEM, item.price);

  return msg.util.success(`you have acquired ${item.amount} ${item.name}.`);
}

module.exports = new Command('buy', exec, {
  aliases: ['buy'],
  description: 'Buy an item from the shop.',
  split: 'sticky',
  args: [
    {
      id: 'item',
      match: 'rest',
      type: Item.resolveGroup
    }
  ]
});
