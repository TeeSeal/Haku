const { Command } = require('discord-akairo')
const { stripIndents } = require('common-tags')

const typeHandlers = {
  text(tag, msg) {
    return msg.util.send(tag.content)
  },
  file(tag, msg) {
    return msg.util.send({ files: [tag.content] })
      .catch(() => msg.util.error('this tag is broken, might want to recreate it.'))
  }
}

async function exec(msg, args) {
  const { name, rename, del } = args
  const tags = await this.client.db.tags.fetch(msg.guild.id, 'tags')

  if (!name) {
    if (tags.length === 0) return msg.util.info('there are currently no tags.')

    return msg.util.send(stripIndents`
      Available tags:
      ${tags.map(tag => `\`${tag.name}\``).join(', ')}.
    `)
  }

  const tag = tags.find(t => t.name === name)
  if (!tag) return msg.util.error(`couldn't find tag: **${name}**.`)

  if (del || rename) {
    if (tag.author !== msg.author.id || !msg.member.permissions.has('MANAGE_GUILD')) {
      return msg.util.error(`you do not have permissions to moderate the **${name}** tag.`)
    }

    let message

    if (del) {
      tags.splice(tags.indexOf(tag), 1)
      message = `successfully deleted tag: **${name}**`
    } else if (rename) {
      tag.name = rename
      message = `**${name}** tag renamed to **${rename}**.`
    }

    return this.client.db.tags.set(msg.guild.id, 'tags', tags)
      .then(() => msg.util.success(message))
  }

  return typeHandlers[tag.type](tag, msg)
}

module.exports = new Command('tag', exec, {
  aliases: ['tag', 't', 'tags'],
  split: 'sticky',
  channelRestriction: 'guild',
  args: [
    {
      id: 'name',
      match: 'rest',
      type: 'string'
    },
    {
      id: 'rename',
      match: 'prefix',
      prefix: ['name=', 'rename=', 'rn=']
    },
    {
      id: 'del',
      match: 'flag',
      prefix: ['-d', '-del', '-delete']
    }
  ],
  description: stripIndents`
    Show, rename or delete a tag.
     **Optional arguments:**
    \`rename\` - the name to rename the tag to.

    **Optional flags:**
    \`delete\` - whether or not to delete this tag.

    **Usage:**
    \`tag smh\` => displays the \`smh\` tag.
    \`tag smh rename=kek\` => renames the \`smh\` tag to \`kek\`.
    \`tag smh -delete\` => deletes the \`smh\` tag.

    **NOTE:** If you do not supply a tag name, all available tag names will be displayed.
  `
})
