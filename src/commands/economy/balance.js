const { Command } = require('discord-akairo')
const { stripIndents } = require('../../util/Util')
const Embed = require('../../structures/HakuEmbed')
const Items = require('../../structures/items/ItemHandler')

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
          type: word => {
            if (!word || isNaN(word)) return null
            const num = parseInt(word)
            if (num < 1) return null
            return num
          },
          default: 1,
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

    const inventory = await this.client.inventories.fetch(user.id)
    if (inventory.size === 0) {
      return msg.util.info(`can't show what ${pron} ${neg} have.`)
    }

    if (item) {
      const itemGroup = inventory.get(item.id)
      if (!itemGroup) return msg.util.error(`${pron} ${neg} have any of that.`)
      return msg.util.info(`${pron} currently ${pos} **${itemGroup}**.`)
    }

    const items = inventory
      .items()
      .concat(inventory.recipes())
      .map(i => i.toString())

    return new Embed(msg.channel, {
      paginate: { items, page },
    })
      .setTitle(`${user.username}'s items:`)
      .setDescription(inventory.currencyString)
      .setIcon(Embed.icons.LIST)
      .setColor(Embed.colors.BLUE)
      .send()
  }
}

module.exports = BalanceCommand
