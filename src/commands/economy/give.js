const { Command } = require('discord-akairo');
const { ItemGroup, Inventory } = require('../../structures/all.js');

function exec(msg, args) {
  const { user, item } = args;
  if (!item) return msg.util.error('there is no such item available.');

  const inventory = new Inventory(user);
  inventory.add(item);
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
      type(word, msg) {
        if (word === 'me') return msg.author;
        return this.client.util.resolveUser(word, msg.guild.members.map(m => m.user));
      }
    },
    {
      id: 'item',
      match: 'rest',
      type: ItemGroup.resolve
    }
  ]
});
