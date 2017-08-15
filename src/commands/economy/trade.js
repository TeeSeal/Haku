const { Command } = require('discord-akairo');
const { buildEmbed, stripIndents } = require('../../util/all.js');
const { ItemCollection, Inventory, ReactionPoll } = require('../../structures/all.js');

async function exec(msg, args) {
  const { member, tradeDetails: [offer, demand] } = args;
  if (!member) return msg.util.error('you need to specify a user to trade with.');
  if (!offer || !offer.every(item => item) || (demand && !demand.every(item => item))) {
    return msg.util.error('couldn\'t understand your offer/demand. Use `help trade` to see how to use this correctly');
  }
  if (offer.size > 5 || (demand && (demand.size > 5))) return msg.util.error(`can't trade more than 5 items at once.`);

  const offInv = new Inventory(msg.author);
  const demInv = new Inventory(member);

  if (!checkInventory(offer, offInv)) return msg.util.error('you have insufficient funds.');
  if (demand && !checkInventory(demand, demInv)) return msg.util.error(`**${member.displayName}** has insufficient funds.`);

  // --- MESSAGE OTPIONS ---
  const options = buildEmbed({
    title: 'ITEM TRADE:',
    fields: [
      [
        msg.author.tag,
        offer.map(item => `**${item.amount}** ${item.name}`).join('\n')
      ],
      [
        member.user.tag,
        demand ? demand.map(item => `**${item.amount}** ${item.name}`).join('\n') : '---'
      ]
    ],
    content: stripIndents`
      Both parties must click on the ✅ for the trade to be completed.
      Otherwise click on the ❌ or ignore this message.
    `,
    icon: 'trade',
    color: 'gold'
  });
  // --- MESSAGE OPTIONS ---

  const statusMsg = await msg.util.send(`${msg.member} ${member}`, options);
  const poll = new ReactionPoll(statusMsg, {
    emojis: ['✅', '❌'],
    users: [msg.author.id, member.id],
    time: 6e4
  });

  poll.on('vote', () => {
    if (poll.votes.get('✅').length === 2 || poll.votes.get('❌').length > 0) poll.stop();
  });

  poll.once('end', votes => {
    const success = votes.get('✅').length === 2;

    if (success) {
      for (const itemGroup of offer) {
        offInv.get(itemGroup.id).consume(itemGroup.amount);
        demInv.add(itemGroup);
      }
      if (demand) {
        for (const itemGroup of demand) {
          demInv.get(itemGroup.id).consume(itemGroup.amount);
          offInv.add(itemGroup);
        }
      }
    }

    options.embed.description = `**TRADE ${success ? 'COMPLETED' : 'CANCELED'}**`;
    return statusMsg.edit(`${msg.member} ${member}`, options);
  });
}

function checkInventory(itemColl, inventory) {
  const hasItems = itemColl.items()
    .every(itemGroup => inventory.has(itemGroup.id) || inventory.get(itemGroup.id).amount >= itemGroup.amount);
  const hasCurrency = inventory.currencyValue() >= itemColl.currencyValue();

  if (hasItems && hasCurrency) return true;
  return false;
}

module.exports = new Command('trade', exec, {
  aliases: ['trade'],
  split: 'sticky',
  args: [
    {
      id: 'member',
      type: 'member'
    },
    {
      id: 'tradeDetails',
      match: 'rest',
      type(string) {
        return string.split(' for ').map(str => ItemCollection.resolve(str));
      }
    }
  ],
  description: stripIndents`
    Trade items with someone.
    **Mandatory arguments:**
    \`member\` - the user with whom you want to trade.
    \`offer\` - the items you are willing to offer.

    **Optional arguments:**
    \`demand\` - the items you wish to receive for your offer.

    **Usage:**
    \`trade User 50 gems for apple\` - offer User to trade 50 gems for 1 of their apples.
    \`trade User apple for book\` - offer User to trade an apple for a book.
    \`trade User 300 gems\` - offer a gift of 300 gems to User.
    \`trade User 13 gems, 3 apples for 5 books, 5 chairs\` - self explanatory.

    **NOTE:** to ask for items in return place them after the \`for\` keyword.
    Most item names used above are not actual items, they were used for demonstrational purposes.
  `
});
