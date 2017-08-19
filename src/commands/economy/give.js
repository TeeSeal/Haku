const { Command } = require('discord-akairo');
const { Items, Inventory } = require('../../structures/all.js');

function exec(msg, args) {
  const { user, items } = args;
  if (!items.every(i => i)) return msg.util.error('couldn\'t resolve items.');

  new Inventory(user).add(items);
  return msg.util.success(`gave ${user}: ${items}`);
}

module.exports = new Command('give', exec, {
  aliases: ['give'],
  ownerOnly: true,
  channelRestriction: 'guild',
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
      id: 'items',
      match: 'rest',
      type: Items.resolveCollection
    }
  ]
});
