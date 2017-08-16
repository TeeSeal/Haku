const { Command } = require('discord-akairo');
const { ItemGroup, Inventory } = require('../../structures/all.js');

function exec(msg, args) {
  const { item } = args;
  if (!item) return msg.util.error('dunno what you\'re trying to buy.');

  if (!ItemGroup.SHOP.has(item.id)) return msg.util.error('there is no such item in the shop.');

  const inventory = new Inventory(msg.author);
  const balance = inventory.currencyValue();
  if (balance < item.price) return msg.util.error('you have insufficeint to buy that.');

  inventory.setBalance(balance - item.price);
  inventory.add(item);

  return msg.util.success(`you have acquired ${item}`);
}

module.exports = new Command('buy', exec, {
  aliases: ['buy'],
  description: 'Buy an item from the shop.',
  split: 'sticky',
  args: [
    {
      id: 'item',
      match: 'rest',
      type: ItemGroup.resolve
    }
  ]
});
