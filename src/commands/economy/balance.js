const { Command } = require('discord-akairo');
const { buildEmbed, paginate, stripIndents } = require('../../util/Util.js');
const { Items } = require('../../structures/all.js');

async function exec(msg, args) {
  const { user, item } = args;
  let { page } = args;
  const [pron, neg, pos] = user.id === msg.author.id ? ['you', 'don\'t', 'have'] : [user.username, 'doesn\'t', 'has'];

  const inventory = await this.client.inventories.fetch(user.id);

  if (item) {
    const itemGroup = inventory.get(item.id);
    if (!itemGroup) return msg.util.error(`${pron} ${neg} have any of that.`);
    return msg.util.reply(`${pron} currently ${pos} **${itemGroup}**.`);
  }

  const lines = inventory.items().concat(inventory.recipes()).map(itemGroup => itemGroup.toString());
  if (inventory.currencyString()) lines.unshift(inventory.currencyString());
  if (lines.length === 0) return msg.util.reply(`can't show what ${pron} ${neg} have.`);

  const paginated = paginate(lines);
  if (page < 1 || !page) page = 1;
  if (page > paginated.length) page = paginated.length;

  return msg.util.send(buildEmbed({
    title: `${user.username}'s items:`,
    content: stripIndents`
      ${paginated[page - 1].join('\n')}

      **Page: ${page}/${paginated.length}**
      Use: \`${this.id} page=<integer>\` to view another page.
    `,
    icon: 'list',
    color: 'blue'
  }));
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
      match: 'rest',
      type: Items.resolveGroup
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
