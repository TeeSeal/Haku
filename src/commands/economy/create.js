const { Command } = require('discord-akairo');
const { Items } = require('../../structures/all.js');

function exec(msg, args) {
  if (!args.type) return msg.util.error('please specify a type.');
  if (!args.id) return msg.util.error('gotta give it a name.');
  if (args.url) args.url = args.url.toString();

  if (args.type === 'recipe') {
    if (!args.result || !args.ingredients) {
      return msg.util.error('give the recipe both a result and some ingredients.');
    }

    args.recipe = {
      result: {
        id: args.result.id,
        amount: args.result.amount
      },
      ingredients: args.ingredients.toJSON()
    };
  }

  Items.create(args);
  return msg.util.success('item created.');
}

module.exports = new Command('create', exec, {
  aliases: ['create'],
  ownerOnly: true,
  description: 'Create an item.',
  split: 'sticky',
  args: [
    {
      id: 'type',
      type: ['item', 'recipe', 'currency']
    },
    {
      id: 'id',
      match: 'prefix',
      prefix: ['name=', 'n='],
      type: 'lowercase'
    },
    {
      id: 'value',
      match: 'prefix',
      prefix: ['value=', 'v='],
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
      id: 'rarity',
      match: 'prefix',
      prefix: ['rarity=', 'r='],
      type: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
      default: 'common'
    },
    {
      id: 'url',
      match: 'prefix',
      prefix: ['url=', 'link='],
      type: 'url'
    },
    {
      id: 'result',
      match: 'prefix',
      prefix: ['result=', 'r='],
      type: Items.resolveGroup
    },
    {
      id: 'ingredients',
      match: 'prefix',
      prefix: ['ingredients=', 'i='],
      type: Items.resolveCollection
    }
  ]
});
