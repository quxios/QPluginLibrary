import fs from 'fs'
import path from 'path'

export function getPluginData(pluginPath, callback) {
  fs.readFile(pluginPath, 'utf8', (err, data) => {
    if (err) {
      return callback(true, null, data);
    }
    const header = getPluginHeader(data);
    const props = getProps(header);
    const help = getPluginHelp(header);
    let pluginData = {
      path: pluginPath,
      name: path.basename(pluginPath, '.js'),
      version: getPluginVersion(header),
      help,
      parsedHelp: parseHelp(help),
      ...props,
      updateStatus: 'ok'
    }
    callback(false, pluginData, data);
  })
}

// Private functions

function getPluginHeader(file) {
  let match = /\/\*\:([\s\S]*?)\*\//i.exec(file);
  if (match) {
    return match[1];
  }
  return '';
}

function getProps(header) {
  let props = {};
  const regex = /^ *\*? *@(author|version|requires|updateurl|site) *(.*?)\s*$/gmi;
  while (true) {
    let match = regex.exec(header);
    if (match) {
      props[match[1].toLowerCase()] = match[2] ? match[2] : true;
    } else {
      break;
    }
  }
  return props;
}

function getPluginVersion(header) {
  let match = /Version (\d+.\d+.\d+)/i.exec(header);
  if (match) {
    return match[1];
  }
  return '';
}

function getPluginHelp(header) {
  let help = /@help([\s\S]*?)(\@|\*\/)/.exec(header);
  if (help) {
    help = help[1].replace(/^\s*\*( |)/gm, '');
    return help;
  }
  return '';
}

function parseHelp(help) {
  const reg = {
    h1h2: /^ *={3,100} *[\n|\r]^(.*)[\n\r]^ *={3,100} *[\n|\r]^(.*)[\n\r]^ *-{3,100}/gm,
    h1: /^ *={3,100} *[\n|\r]^(.*)[\n\r]^ *={3,100}/gm,
    h2: /^ *-{3,100}\s*[\n|\r]^(.*)[\n\r]^ *-{3,100}/gm
  }
  return help.replace(reg.h1h2, '\n\n## $1\n### $2')
    .replace(reg.h1, '\n\n## $1')
    .replace(reg.h2, '\n\n### $1');
}