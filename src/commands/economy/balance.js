const { Command } = require('discord-akairo')
const { stripIndents, parserInRange } = require('../../util')
const Embed = require('../../structures/HakuEmbed')
const Items = require('../../structures/items/')
const Inventory = require('../../structures/items/InventoryHandler')

class BalanceCommand extends Command {
  constructor() {
    super('balance', {
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
          default: msg => msg.author,
        },
        {
          id: 'item',
          match: 'rest',
          type: Items.resolveGroup,
        },
        {
          id: 'page',
          match: 'prefix',
          prefix: ['page=', 'p='],
          type: parserInRange(0),
          default: 0,
        },
      ],
    })
  }

  async exec(msg, args) {
    const { user, item, page } = args
    const [pron, neg, pos]
      = user.id === msg.author.id
        ? ['you', "don't", 'have']
        : [user.username, "doesn't", 'has']

    const inventory = await Inventory.fetch(user.id)
    if (inventory.size === 0) {
      return msg.util.info(`can't show what ${pron} ${neg} have.`)
    }

    if (item) {
      const itemGroup = inventory.get(item.id)
      if (!itemGroup) return msg.util.error(`${pron} ${neg} have any of that.`)
      return msg.util.info(`${pron} currently ${pos} **${itemGroup}**.`)
    }

    const items = [inventory.currencyString]
      .concat(inventory.items().map(i => i.toString()))
      .concat(inventory.recipes().map(i => i.toString()))

    return new Embed(msg.channel)
      .setTitle(`${user.username}'s items:`)
      .setDescription(items)
      .setIcon(Embed.icons.LIST)
      .setColor(Embed.colors.BLUE)
      .setPage(page)
      .send()
  }
}

module.exports = BalanceCommand
