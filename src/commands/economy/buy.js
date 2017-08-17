const { Command } = require('discord-akairo');
const { Items, Inventory } = require('../../structures/all.js');

function exec(msg, args) {
  let { items } = args;
  if (!items) return msg.util.error('dunno what you\'re trying to buy.');

  items = items.filter(item => Items.SHOP.has(item.id));
  if (items.size === 0) return msg.util.error('no such item(s) in the shop.');

  const inventory = new Inventory(msg.author);
  const balance = inventory.currencyValue();
  if (balance < items.totalValue()) return msg.util.error('you have insufficient funds to buy that.');

  inventory.setBalance(balance - items.totalValue());
  inventory.add(items);

  return msg.util.success(`you have acquired ${items}`);
}

module.exports = new Command('buy', exec, {
  aliases: ['buy'],
  description: 'Buy an item from the shop.',
  split: 'sticky',
  args: [
    {
      id: 'items',
      match: 'rest',
      type: Items.resolveCollection
    }
  ]
});
