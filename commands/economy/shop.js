const { Command } = require('discord-akairo');
const { stripIndents, paginate } = _util;
const { Item } = _struct;

async function exec(msg, args) {
  const { item } = args;
  let { page } = args;

  const shop = Item.SHOP;
  if (shop.size === 0) return msg.util.error('sorry, there\'s nothing in the shop yet.');

  if (item) {
    if (!shop.has(item.id)) return msg.util.reply('that item is not being sold in the shop.');
    return msg.util.reply(`a ${item.id} goes for ${item.worth}💎 in the shop.`);
  }

  const fields = shop.map(itm => {
    return {
      name: `${itm.id}${itm.emoji ? `\u2000${itm.emoji}` : ''}`,
      value: `${itm.worth} 💎`,
      inline: true
    };
  });

  const paginated = paginate(fields, 10);
  if (page < 1 || !page) page = 1;
  if (page > paginated.length) page = paginated.length;

  return msg.util.send({
    files: [{ attachment: 'assets/icons/shop.png' }],
    embed: {
      title: `**SHOP:**`,
      fields: paginated[page - 1],
      description: stripIndents`
        **Page: ${page}/${paginated.length}**
        Use: \`${this.id} page=<integer>\` to view another page.
      `,
      color: 16758861,
      thumbnail: { url: 'attachment://shop.png' }
    }
  });
}

module.exports = new Command('shop', exec, {
  aliases: ['shop'],
  description: 'View the shop.',
  split: 'sticky',
  args: [
    {
      id: 'item',
      type: word => Item.resolve(word)
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
