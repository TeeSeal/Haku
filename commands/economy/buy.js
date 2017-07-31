const { Command } = require('discord-akairo');
const { Inventory, Item } = require('../../structures/all.js');

async function exec(msg, args) {
  let { amount, item } = args;
  if (!amount) return msg.util.error('dunno what you\'re trying to buy.');
  if (amount instanceof Item) {
    item = amount;
    amount = 1;
  }

  if (!item || Item.SHOP.has(item.id)) return msg.util.error('there is no such item in the shop.');

  const itemGroup = item.groupOf(amount);
  const inventory = await Inventory.fetch(msg.author);
  const gems = inventory.get('gem') || { amount: 0 };
  if (gems.amount < itemGroup.price) return msg.util.error('you don\'t have enough gems to buy that.');

  inventory.update(itemGroup);
  inventory.consume(Item.GEM, itemGroup.price);

  return msg.util.success(`you have acquired ${amount} ${itemGroup.name}.`);
}

module.exports = new Command('buy', exec, {
  aliases: ['buy'],
  description: 'Buy an item from the shop.',
  split: 'sticky',
  args: [
    {
      id: 'amount',
      type: word => {
        if (isNaN(word)) return Item.resolve(word);
        const num = parseInt(word);
        if (num < 1) return 1;
        return num;
      }
    },
    {
      id: 'item',
      match: 'rest',
      type: word => Item.resolve(word)
    }
  ]
});
