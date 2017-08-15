const { Command } = require('discord-akairo');
const { buildEmbed, stripIndents, paginate } = require('../../util/all.js');
const { ItemGroup } = require('../../structures/all.js');

function exec(msg, args) {
  const { item } = args;
  let { page } = args;

  const shop = ItemGroup.SHOP;
  if (shop.size === 0) return msg.util.error('sorry, there\'s nothing in the shop yet.');

  if (item) {
    if (!shop.has(item.id)) return msg.util.reply('that item is not being sold in the shop.');
    return msg.util.reply(`**${item.amount}** ${item.name} => ${item.priceString()}.`);
  }

  const fields = shop.map(itm => {
    return [itm.name, itm.priceString(), true];
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
      id: 'item',
      match: 'rest',
      type: ItemGroup.resolve
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
