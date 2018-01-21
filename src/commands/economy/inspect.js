const { Command } = require('discord-akairo')
const Items = require('../../structures/items/')
const Inventory = require('../../structures/items/InventoryHandler')
const Embed = require('../../structures/HakuEmbed')

class InspectCommand extends Command {
  constructor() {
    super('inspect', {
      aliases: ['inspect'],
      description: 'Inspect an item.',
      split: 'sticky',
      args: [
        {
          id: 'item',
          match: 'rest',
          type: Items.resolveGroup,
        },
      ],
    })
  }

  async exec(msg, args) {
    const { item } = args
    if (!item) return msg.util.error("couldn't find that item.")

    const inventory = await Inventory.fetch(msg.author.id)
    if (!inventory.has(item.id) && !Items.SHOP.has(item.id)) {
      return msg.util.error(
        'you can only inspect items in your inventory or in the shop.'
      )
    }

    if (item.type === 'recipe') {
      return new Embed(msg.channel)
        .setTitle(item.name.toUpperCase())
        .setFields([
          [
            'Ingredients',
            Object.entries(item.ingredients)
              .map(([id, amount]) => Items.resolveGroup(id, amount))
              .join(' + '),
          ],
          [
            'Result',
            Items.resolveGroup(item.result.id, item.result.amount).toString(),
          ],
        ])
        .setIcon(Embed.icons.CRAFT)
        .setColor(Embed.colors.GOLD)
        .setAuthor(msg.member)
        .send()
    }

    return msg.util.send(item.examine(), {
      files: item.imagePath ? [item.imagePath] : [],
    })
  }
}

module.exports = InspectCommand
