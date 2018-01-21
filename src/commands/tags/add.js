const { Command } = require('discord-akairo')
const { stripIndents } = require('../../util')
const { Tag } = require('../../db')

class TagAddCommand extends Command {
  constructor() {
    super('tag-add', {
      aliases: ['tag-add', 'ta', '+t', 't+', 'tag+', '+tag', 'add-tag'],
      channelRestriction: 'guild',
      split: 'sticky',
      args: [
        {
          id: 'name',
          match: 'prefix',
          prefix: ['n=', 'name='],
          type: 'string',
        },
        {
          id: 'type',
          match: 'prefix',
          prefix: ['t=', 'type='],
          type: ['text', 'file'],
          default: 'text',
        },
        {
          id: 'content',
          type: 'string',
          match: 'rest',
        },
      ],
      description: stripIndents`
        Create a new tag in the guild.
         **Mandatory arguments:**
        \`name\` - the tag name.
        \`content\` - the tag content.

        **Optional arguments:**
        \`type\` - how the tag should be interpreted. (\`text\` or \`file\`. defaults to \`text\`);

        **Usage:**
        \`tag-add name=smh shaking my head\` => creates a new tag called \`smh\` with the content \`shaking my head\`.
        \`tag-add name=smh type=file <IMAGE_URL>\` => when used, this tag will send the image as a file instead of displaying the link.
      `,
    })
  }

  async exec(msg, args) {
    const { name, content } = args
    if (!name) return msg.util.error('gotta give the tag a name.')
    if (!content) return msg.util.error('gotta give the tag some content.')

    const tags = await Tag.fetch(msg.guild.id, 'tags')
    if (tags.find(tag => tag.name === name)) {
      return msg.util.error('a tag with that name already exists.')
    }

    args.author = msg.author.id
    tags.push(args)

    return Tag.set(msg.guild.id, 'tags', tags)
      .then(() => msg.util.success(`successfully added tag: **${name}**`))
      .catch(err => msg.util.error(err))
  }
}

module.exports = TagAddCommand
