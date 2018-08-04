const { Command } = require('discord-akairo')
const Items = require('../../structures/items/')

class DestroyCommand extends Command {
  constructor () {
    super('destroy', {
      aliases: ['destroy'],
      ownerOnly: true,
      description: 'Destroy an item.',
      split: 'sticky',
      args: [
        {
          id: 'item',
          match: 'rest',
          type: Items.resolveGroup
        }
      ]
    })
  }

  exec (msg, args) {
    const { item } = args
    if (!item) return msg.util.error("couldn't find that item.")
    Items.destroy(item.id)
    return msg.util.success(`destroyed **${item.name}**.`)
  }
}

module.exports = DestroyCommand
