const { Command } = require('discord-akairo');
const { Inventory, Item } = _struct;
const { paginate, stripIndents } = _util;

async function exec(msg, args) {
  const { user, item } = args;
  let { page } = args;
  const [pron, neg, pos] = user.id === msg.author.id ? ['you', 'don\'t', 'have'] : [user.username, 'doesn\'t', 'has'];

  const inventory = await Inventory.fetch(user);

  if (item) {
    const itemGroup = inventory.get(item.id);
    if (!itemGroup) return msg.util.error('you don\'t have any of that.');
    return msg.util.reply(`${pron} currently ${pos} **${itemGroup.amount} ${itemGroup.name}**.`);
  }

  const lines = inventory.items.map(itemGroup => {
    return `**${itemGroup.amount}** ${itemGroup.name}`;
  });

  const gemGroup = inventory.get('gem');
  if (gemGroup) lines.unshift(`**${gemGroup.amount} ${gemGroup.name}**`);

  if (lines.length === 0) return msg.util.reply(`can't show what ${pron} ${neg} have.`);

  const paginated = paginate(lines);
  if (page < 1 || !page) page = 1;
  if (page > paginated.length) page = paginated.length;

  return msg.util.send({
    files: [{ attachment: 'assets/icons/list.png' }],
    embed: {
      title: `${user.username}'s items:`,
      description: stripIndents`
        ${paginated[page - 1].join('\n')}

        **Page: ${page}/${paginated.length}**
        Use: \`${this.id} page=<integer>\` to view another page.
      `,
      color: 6711039,
      thumbnail: { url: 'attachment://list.png' }
    }
  });
}

module.exports = new Command('balance', exec, {
  aliases: ['balance', 'inventory', 'bal'],
  ownderOnly: true,
  split: 'sticky',
  description: stripIndents`
    View your or someone else's inventory.

    **Optional arguments:**
    \`user\` - the user whose inventory you want to view (defaults to yourself).
    \`item\` - the item for which you want to view the balance.
    \`page\` - the page in the inventory to view.

    **Usage:**
    \`inventory teeseal page=2\` => view second page of teeseal's inventory.
    \`inventory item=gem\` => view how many gems you have.
  `,
  args: [
    {
      id: 'user',
      type: 'user',
      default: msg => msg.author
    },
    {
      id: 'item',
      match: 'prefix',
      type: word => Item.resolve(word),
      prefix: ['item=', 'i=']
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
