const { Command } = require('discord-akairo');
const { buildEmbed, stripIndents, paginate } = require('../../util/all.js');
const { Items } = require('../../structures/all.js');

function exec(msg, args) {
  let { items, page } = args;

  const shop = Items.SHOP;
  if (shop.size === 0) return msg.util.error('sorry, there\'s nothing in the shop yet.');

  if (items) {
    items = items.filter(item => shop.has(item.id));
    if (items.size > 0) {
      return msg.util.send(items.map(item => {
        return `**${item.name}** | ${Items.convertToCurrency(item.price).currencyString()}`;
      }).join('\n'));
    }
  }

  const fields = shop.map(item => {
    return [item.name, Items.convertToCurrency(item.price).currencyString(), true];
  });

  const paginated = paginate(fields, 10);
  if (page < 1 || !page) page = 1;
  if (page > paginated.length) page = paginated.length;

  return msg.util.send(buildEmbed({
    title: '**SHOP:**',
    fields: paginated[page - 1],
    content: stripIndents`
      **Page: ${page}/${paginated.length}**
      Use: \`${this.id} page=<integer>\` to view another page.
    `,
    icon: 'shop',
    color: 'gold'
  }));
}

module.exports = new Command('shop', exec, {
  aliases: ['shop'],
  description: 'View the shop.',
  split: 'sticky',
  args: [
    {
      id: 'items',
      match: 'rest',
      type: Items.resolveCollection
    },
    {
      id: 'page',
      match: 'prefix',
      prefix: ['page=', 'p='],
      type: word => {
        if (!word || isNaN(word)) return null;
        const num = parseInt(word);
        if (num < 1) return null;
        return num;
      },
      default: 1
    }
  ]
});
