const { Command } = require('discord-akairo');
const { stripIndents } = require('../../util/all.js');
const { Inventory, Item } = require('../../structures/all.js');

async function exec(msg, args) {
  const { member, tradeDetails: [offer, demand] } = args;
  if (!member) return msg.util.error('you need to specify a user to trade with.');
  if (!offer || !offer.every(item => item) || (demand && !demand.every(item => item))) {
    return msg.util.error('couldn\'t understand your offer/demand. Use `help trade` to see how to use this correctly');
  }
  if (offer.length > 5 || (demand && (demand.length > 5))) return msg.util.error(`can't trade more than 5 items at once.`);

  const oInv = new Inventory(msg.author);
  const dInv = new Inventory(member);

  const oBal = offer.map(item => oInv.get(item.id));
  if (oBal.length !== offer.length || oBal.some((item, idx) => item.amount < offer[idx].amount)) {
    return msg.util.error('you do not have sufficient funds.');
  }

  const dBal = demand ? demand.map(item => dInv.get(item.id)) : null;
  if (demand && (dBal.length !== demand.length || dBal.some((item, idx) => item.amount < demand[idx].amount))) {
    return msg.util.error(`**${member.displayName}** doesn't have sufficient funds.`);
  }

  // --- MESSAGE OTPIONS ---
  const options = {
    files: [{ attachment: 'src/assets/icons/trade.png' }],
    embed: {
      title: 'ITEM TRADE',
      description: stripIndents`
      Both parties must click on the ✅ for the trade to be completed.
      Otherwise click on the ❌ or ignore this message.
    `,
      fields: [
        {
          name: `${msg.author.tag}`,
          value: offer.map(item => `**${item.amount}** ${item.name}`).join('\n')
        },
        {
          name: `${member.user.tag}`,
          value: demand ? demand.map(item => `**${item.amount}** ${item.name}`).join('\n') : '---'
        }
      ],
      color: 16758861,
      thumbnail: { url: 'attachment://trade.png' }
    }
  };
  // --- MESSAGE OPTIONS ---

  const statusMsg = await msg.util.send(`${msg.member} ${member}`, options);

  await statusMsg.react('✅').then(() => statusMsg.react('❌'));
  const collector = statusMsg.createReactionCollector(
    (r, u) => ['✅', '❌'].includes(r.emoji.name) && [msg.author.id, member.id].includes(u.id),
    { time: 6e4 }
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
      for (const item of offer) {
        oInv.update(item.id, -item.amount);
        dInv.update(item);
      }
      if (demand) {
        for (const item of demand) {
          dInv.update(item.id, -item.amount);
          oInv.update(item);
        }
      }
      status = '**TRADE COMPLETED**';
    }

    options.embed.description = status;
    return statusMsg.edit(`${msg.member} ${member}`, options);
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
      id: 'tradeDetails',
      match: 'rest',
      type(string) {
        return string.split(' for ').map(str => {
          if (!str) return null;
          return str.split(/[+,]|and/).map(word => Item.resolveGroup(word.trim()));
        });
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
