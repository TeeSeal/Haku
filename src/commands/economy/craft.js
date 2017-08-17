const { Command } = require('discord-akairo');
const { Items, Inventory } = require('../../structures/all.js');

async function exec(msg, args) {
  const { recipe } = args;
  if (!recipe) return msg.util.error('couldn\'t find recipe.');

  const inventory = new Inventory(msg.author);
  if (!inventory.has(recipe.id)) return msg.util.error(`you don't have any: **${recipe.name}**`);
  return inventory.get(recipe.id).craft()
    .then(result => msg.util.success(`you have successfully crafted ${Items.resolveGroup(result.id, result.amount)}`))
    .catch(err => msg.util.error(err));
}

module.exports = new Command('craft', exec, {
  aliases: ['craft'],
  description: 'Craft an item.',
  split: 'sticky',
  args: [
    {
      id: 'recipe',
      match: 'rest',
      type(string) {
        if (!string.includes('recipe')) string = `recipe: ${string}`;
        return Items.resolveGroup(string);
      }
    }
  ]
});
