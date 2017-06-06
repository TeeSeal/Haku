const { Command } = require('discord-akairo');
const { Inventory, Item } = structures;
const { paginate, stripIndents } = helpers;

async function exec(msg, args) {
  const { user, name } = args;
  let { page } = args;
  const item = name ? await Item.get(name) : null;
  const [pron, pos] = user.id === msg.author.id ? ['you', 'have'] : [user.username, 'has'];

  if (item) {
    const balance = await Inventory.get(user, item);
    return msg.util.reply(`${pron} currently ${pos} **${balance} ${item.format(balance)}**.`);
  }

  const inventory = await Inventory.get(user);
  const lines = paginate(Object.keys(inventory), 3).map(arr => {
    return arr.map(key => `${key}: ${inventory[key]}`).join(' | ');
  });

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
        Use: \`inventory page=<integer>\` to view another page.
      `,
      color: 6711039,
      thumbnail: { url: 'attachment://list.png' }
    }
  });
}

module.exports = new Command('balance', exec, {
  aliases: ['balance', 'inventory'],
  ownderOnly: true,
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
      id: 'name',
      match: 'prefix',
      type: 'lowercase',
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
