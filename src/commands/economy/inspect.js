const { Command } = require('discord-akairo');
const Items = require('../../structures/items/ItemHandler.js');
const { buildEmbed } = require('../../util/Util.js');

async function exec(msg, args) {
  const { item } = args;
  if (!item) return msg.util.error('couldn\'t find that item.');

  const inventory = await this.client.inventories.fetch(msg.author.id);
  if (!inventory.has(item.id) && !Items.SHOP.has(item.id)) {
    return msg.util.error('you can only inspect items in your inventory or in the shop.');
  }

  if (item.type === 'recipe') {
    return msg.util.send(buildEmbed({
      title: item.name.toUpperCase(),
      fields: [
        [
          'Ingredients',
          Object.entries(item.ingredients).map(([id, amount]) => Items.resolveGroup(id, amount))
            .join(' + ')
        ],
        [
          'Result',
          Items.resolveGroup(item.result.id, item.result.amount).toString()
        ]
      ],
      icon: 'craft',
      color: 'gold'
    }));
  }

  return msg.util.send(item.examine(), { files: item.imagePath ? [item.imagePath] : [] });
}

module.exports = new Command('inspect', exec, {
  aliases: ['inspect'],
  description: 'Inspect an item.',
  split: 'sticky',
  args: [
    {
      id: 'item',
      match: 'rest',
      type: Items.resolveGroup
    }
  ]
});
