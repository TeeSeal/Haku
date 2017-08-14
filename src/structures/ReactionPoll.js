const EventEmitter = require('events');
const Collection = require('./Collection.js');

class ReactionPoll extends EventEmitter {
  constructor(message, options) {
    if (!options.emojis) throw new Error('you need to specify emojis to use.');

    super();
    Object.assign(this, options);
    this.message = message;
    this.votes = new Collection(this.emojis.map(emoji => {
      return [emoji, []];
    }));

    this.react().then(() => this.collect());
  }

  react() {
    return new Promise(async resolve => {
      for (const emoji of this.emojis) {
        await this.message.react(emoji);
      }
      resolve(this.message);
    });
  }

  collect() {
    const { time, users, emojis } = this;
    const collector = this.message.createReactionCollector((reaction, user) => {
      const emojiFlag = [reaction.emoji.name, reaction.emoji.identifier]
        .some(id => emojis.includes(id));

      const userFlag = users
        ? users.includes(user.id)
        : null;

      if (!users) return emojiFlag;
      return emojiFlag && userFlag;
    }, { time });

    this.collector = collector;

    collector.on('collect', reaction => {
      const reactionUsers = Array.from(reaction.users.keys());
      const emoji = [reaction.emoji.name, reaction.emoji.identifier]
        .find(id => this.emojis.includes(id));


      const userID = this.users.find(id => {
        return reactionUsers.includes(id) && !this.votes.get(emoji).includes(id);
      });

      this.votes.set(emoji, reactionUsers.filter(id => this.users.includes(id)));

      if (!userID) return;
      return this.emit('vote', emoji, userID);
    });

    collector.once('end', () => {
      this.emit('end', this.votes);
    });
  }

  stop() { this.collector.stop(); }
}

module.exports = ReactionPoll;