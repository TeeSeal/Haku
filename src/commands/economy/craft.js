const { Command } = require('discord-akairo')
const Items = require('../../structures/items/')
const Inventory = require('../../structures/items/InventoryHandler')
const Embed = require('../../structures/HakuEmbed')

class CraftCommand extends Command {
  constructor () {
    super('craft', {
      aliases: ['craft'],
      description: 'Craft an item.',
      split: 'sticky',
      args: [
        {
          id: 'recipe',
          match: 'rest',
          type (string) {
            if (!string.includes('recipe')) string = `recipe: ${string}`
            return Items.resolveGroup(string)
          }
        }
      ]
    })
  }

  async exec (msg, args) {
    const { recipe } = args
    if (!recipe) return msg.util.error("couldn't find recipe.")

    const inventory = await Inventory.fetch(msg.author.id)
    if (!inventory.has(recipe.id)) {
      return msg.util.error(`you don't have any: **${recipe.name}**`)
    }
    return inventory
      .get(recipe.id)
      .craft()
      .then(() => {
        new Embed(msg.channel)
          .setTitle('SUCCESS')
          .addFields([
            [
              'Ingredients',
              Object.keys(recipe.ingredients)
                .map(([id, amount]) => Items.resolveGroup(id, amount))
                .join(' + ')
            ],
            [
              'Result',
              Items.resolveGroup(
                recipe.result.id,
                recipe.result.amount
              ).toString()
            ]
          ])
          .setAuthor(msg.member)
          .setIcon(Embed.icons.CRAFT)
          .setColor(Embed.colors.GOLD)
          .send()
      })
      .catch(err => msg.util.error(err))
  }
}

module.exports = CraftCommand
