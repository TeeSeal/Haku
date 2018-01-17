const { Command } = require('discord-akairo')
const { stripIndents } = require('../../util/Util')
const Embed = require('../../structures/HakuEmbed')
const Roulette = require('../../structures/games/Roulette')

const time = 30

class RouletteCommand extends Command {
  constructor() {
    super('roulette', {
      aliases: ['roulette', 'rlt'],
      args: [
        {
          id: 'bet',
          type: Roulette.resolveBet,
          match: 'rest',
        },
      ],
      description: stripIndents`
        Play casino roulette!
        **Mandatory arguments:**
        \`amount\` - the amount of money you want to bet.
        \`space\` - the space you want to be on

        **Usage:**
        \`roulette 3 gold on 1-12\` => bet 3 gold on the 1-12 space.
        \`rlt 5 silver odd\` => bet 5 silver on the odd space.

        Refer to the image below for valid betting spaces:
        https://i.imgur.com/eYQV1my.png
      `,
    })
  }

  async exec(msg, args) {
    const { space, bet } = args.bet

    if (!space) {
      return msg.util.error('invalid usage. Please refer to `help roulette`.')
    }
    if (!bet) return msg.util.error("couldn't resolve your bet.")
    if (bet.currencyValue === 0) {
      return msg.util.error('you have to bet some money.')
    }
    if (bet.currencyValue > Roulette.MAXBET.price) {
      return msg.util.error(`can't bet more than ${Roulette.MAXBET}.`)
    }
    if (!Roulette.SPACES.includes(space)) {
      return msg.util.error('invalid space. Please refer to `help roulette`')
    }

    const inventory = await this.client.inventories.fetch(msg.author.id)
    if (!inventory.includes(bet)) {
      return msg.util.error('you have insufficient funds.')
    }

    const player = {
      id: msg.member.id,
      displayName: msg.member.displayName,
      inventory,
    }

    const game = Roulette.findCreate(msg.channel)

    if (game.ongoing) {
      const reply = game.hasBet(msg.member, space)
        ? `you have changed your bet on ${space} to ${bet}.`
        : `you have placed your bet of ${bet} on ${space}.`

      game.addBet(player, space, bet)
      return msg.util.success(reply, game.statusEmbed)
    }

    game.addBet(player, space, bet)
    await msg.util.success(
      `You have started a new game of game with a bet of ${bet} on ${space}!`,
      game.statusEmbed
    )

    return game.start(msg.channel, time).then(() => {
      game.rewardWinners()

      let content = `The ball landed on **${game.winningSpaces[1]} ${
        game.winningSpaces[0]
      }**!`

      if (game.winnerFields.length > 0) content += '\n**WINNERS:**'
      else content += '\nNobody won this round.'

      return new Embed(msg.channel)
        .setTitle('Roulette Results')
        .setDescription(content)
        .setFields(game.winnerFields)
        .setIcon(Embed.icons.GAME)
        .setColor(Embed.colors.SCARLET)
        .send()
    })
  }
}

module.exports = RouletteCommand
