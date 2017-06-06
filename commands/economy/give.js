const { Command } = require('discord-akairo');
const { Inventory } = structures;

async function exec(msg, args) {
  const { user, amount, name } = args;
  const inventory = await Inventory.get(user);

  let finalAmount = (inventory[name] || 0) + amount;
  if (finalAmount < 0) finalAmount = 0;

  Inventory.update(user, name, finalAmount);
  return msg.util.success('inventory updated.');
}

module.exports = new Command('give', exec, {
  aliases: ['give'],
  ownderOnly: true,
  description: 'Give someone some items.',
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
      id: 'name',
      type: 'lowercase'
    }
  ]
});
