const { Command } = require('discord-akairo');
const { Item } = require('../../structures/all.js');

function exec(msg, args) {
  if (!args.id) return msg.util.error('gotta give it a name.');
  if (args.url) args.url = args.url.toString();
  new Item(args).add();
  return msg.util.success('item created.');
}

module.exports = new Command('create', exec, {
  aliases: ['create'],
  ownerOnly: true,
  description: 'Create an item.',
  split: 'sticky',
  args: [
    {
      id: 'id',
      match: 'rest',
      type: 'lowercase'
    },
    {
      id: 'worth',
      match: 'prefix',
      prefix: ['worth=', 'w='],
      type: word => {
        if (!word || isNaN(word)) return null;
        const num = parseInt(word);
        if (num < 1) return 1;
        return num;
      },
      default: 1
    },
    {
      id: 'shop',
      match: 'flag',
      prefix: ['-inShop', '-shop', '-s'],
      default: false
    },
    {
      id: 'description',
      match: 'prefix',
      prefix: ['description=', 'desc=', 'd='],
      default: ''
    },
    {
      id: 'emoji',
      match: 'prefix',
      prefix: ['emoji=', 'e='],
      default: ''
    },
    {
      id: 'use',
      match: 'prefix',
      prefix: ['use=', 'u='],
      type: line => {
        const evaled = eval(line);
        if (typeof evaled !== 'function') return null;
        return evaled;
      },
      default: () => (msg) => msg.util.reply('this item has no usage capabilites.')
    },
    {
      id: 'url',
      match: 'prefix',
      prefix: ['url=', 'link='],
      type: 'url'
    }
  ]
});
