const { Command } = require('discord-akairo');
const { inspect } = require('util');
const { stripIndents } = helpers;

async function exec(msg, args) {
  const { code } = args;
  const evaled = eval(code);
  const promise = evaled instanceof Promise ? await evaled : null;
  const [oLang, pLang] = [getLang(evaled), getLang(promise)];
  const [cleanOutput, promiseOutput] = [clean(evaled), clean(promise)];

  let output = stripIndents`
    :inbox_tray: **INPUT:**
    \`\`\`js
    ${code}
    \`\`\`

    :outbox_tray: **OUTPUT:**
    \`\`\`${oLang}
    ${cleanOutput}
    \`\`\`
  `;
  if (promise) {
    output += `\n${stripIndents`
      **PROMISE:**
      \`\`\`${pLang}
      ${promiseOutput}
      \`\`\`
    `}`;
  }

  return msg.util.send('\u200b', {
    embed: {
      title: 'EVAL:',
      description: output,
      color: 16711782
    }
  });
}

function getLang(thing) {
  return typeof thing === 'string' ? 'js' : '';
}

function clean(thing) {
  let output = typeof thing === 'string' ? thing : inspect(thing);
  if (output.length > 1900) output = 'Output too long.';
  return output;
}

module.exports = new Command('eval', exec, {
  aliases: ['eval'],
  description: 'Evaluate some code.',
  ownerOnly: true,
  args: [
    {
      id: 'code',
      match: 'content'
    }
  ]
});
