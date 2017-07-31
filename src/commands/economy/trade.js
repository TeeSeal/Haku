const { Command } = require('discord-akairo');
const { stripIndents } = require('../../util/all.js');
const { Inventory, Item } = require('../../structures/all.js');

async function exec(msg, args) {
  let { member, offer, demand } = args;
  if (!member) return msg.util.error('you need to specify a user to trade with.');
  if (!offer) return msg.util.error('you must offer something when trading. Use `help trade` to see how to correctly trade.');

  const oInv = new Inventory(msg.author);
  const dInv = new Inventory(member);

  const oBal = oInv.get(offer.id);
  if (!oBal || oBal.amount < offer.ammount) return msg.util.error('you do not have sufficient funds.');

  const dBal = demand ? dInv.get(demand.id) : null;
  if (demand && (!dBal || dBal.amount < demand.amount)) return msg.util.error(`${member.displayName} doesn't have sufficient funds.`);

  const statusMsg = await msg.util.send(`${msg.member} ${member}`, {
    embed: {
      title: 'ITEM TRADE',
      description: stripIndents`
        Both parties must click on the ✅ for the trade to be completed.
        Otherwise click on the ❌ or ignore this message.
      `,
      fields: [
        {
          name: `${msg.author.tag}`,
          value: `**${offer.amount}** ${offer.name}`
        },
        {
          name: `${member.user.tag}`,
          value: demand ? `**${demand.amount}** ${demand.name}` : '---'
        }
      ],
      color: 16758861
    }
  });

  await statusMsg.react('✅').then(() => statusMsg.react('❌'));
  const collector = statusMsg.createReactionCollector(
    (r, u) => ['✅', '❌'].includes(r.emoji.name) && [msg.author.id, member.id].includes(u.id),
    { time: 20e3 }
  );

  collector.on('collect', r => {
    if ((r.emoji.name === '✅' && [msg.author.id, member.id].every(id => Array.from(r.users.keys()).includes(id)))
      || r.emoji.name === '❌') {
      collector.stop();
    }
  });

  collector.once('end', collected => {
    const checkMark = collected.get('✅');
    let status;

    if (!checkMark || ![msg.author.id, member.id].every(id => Array.from(checkMark.users.keys()).includes(id))) {
      status = '**TRADE CANCLED**';
    } else {
      oInv.update(offer.id, -offer.amount);
      dInv.update(offer);
      if (demand) {
        dInv.update(demand.id, -demand.amount);
        oInv.update(demand);
      }
      status = '**TRADE COMPLETED**';
    }

    return statusMsg.edit(`${msg.member} ${member}`, {
      embed: {
        title: 'ITEM TRADE',
        description: status,
        fields: [
          {
            name: `${msg.author.tag}`,
            value: `**${offer.amount}** ${offer.name}`
          },
          {
            name: `${member.user.tag}`,
            value: demand ? `**${demand.amount}** ${demand.name}` : '---'
          }
        ],
        color: 16758861
      }
    });
  });
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
      id: 'offer',
      type: Item.resolveGroup
    },
    {
      id: 'demand',
      type: Item.resolveGroup
    }
  ],
  description: stripIndents`
    Trade items with someone.
    **Mandatory arguments:**
    \`member\` - the user with whom you want to trade.
    \`offer\` - the items you are willing to offer.

    **Optional arguments:**
    \`demand\` - the items you wish to receive for your offer.

    **NOTE:** when giving both amount and item name, wrap both in double quotes (as seen below).
    **Usage:**
    \`trade User "50 gems" apple\` - offer User to trade 50 gems for 1 of their apples.
    \`trade User apple book\` - offer User to trade an apple for a book.
    \`trade User "300 gems"\` - offer a gift of 300 gems to User.
  `
});
