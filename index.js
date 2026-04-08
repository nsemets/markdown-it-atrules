// Process @[osf](guid0)

const EMBED_REGEX = /@\[([a-zA-Z].+)]\([\s]*(.*?)[\s]*[)]/im;

function assetEmbed(md, options) {
  function assetReturn(state, silent) {
    var serviceEnd;
    var serviceStart;
    var token;
    var assetID;
    var theState = state;
    const oldPos = state.pos;

    if (state.src.charCodeAt(oldPos) !== 0x40
        ||/* @ */ state.src.charCodeAt(oldPos + 1) !== 0x5B/* [ */) {
      return false;
    }

    const tagMatch = EMBED_REGEX.exec(state.src.slice(state.pos, state.src.length));

    if (!tagMatch || tagMatch.length < 3) {
      return false;
    }

    const service = tagMatch[1];
    assetID = tagMatch[2];
    const serviceLower = service.toLowerCase();
    if (serviceLower === options.type) {
      const mfrRegex = options.pattern;
      const urlMatch = assetID.match(mfrRegex);
      if (urlMatch) {
        assetID = urlMatch[1] || urlMatch[0]; // guid or whole link
      } else {
        return false;
      }
    } else if (!options[serviceLower]) {
      return false;
    }

    // If the assetID field is empty, regex currently make it the close parenthesis.
    if (assetID === ')') {
      assetID = '';
    }

    serviceStart = oldPos + 2;
    serviceEnd = md.helpers.parseLinkLabel(state, oldPos + 1, false);

    //
    // We found the end of the link, and know for a fact it's a valid link;
    // so all that's left to do is to call tokenizer.
    //
    if (!silent) {
      theState.pos = serviceStart;
      theState.service = theState.src.slice(serviceStart, serviceEnd);
      const newState = new theState.md.inline.State(service, theState.md, theState.env, []);
      newState.md.inline.tokenize(newState);

      token = theState.push('asset', '');
      token.assetID = assetID;
      token.service = service;
      token.level = theState.level;
    }

    theState.pos += theState.src.indexOf(')', theState.pos);
    return true;
  }

  return assetReturn;
}

function tokenizeAsset(md, options) {
  function tokenizeReturn(tokens, idx) {
    const assetID = md.utils.escapeHtml(tokens[idx].assetID);
    return options.format(assetID);
  }
  return tokenizeReturn;
}

module.exports = function assetPlugin(md, options) {
  var theOptions = options;
  var theMd = md;
  if (theOptions) {
    Object.keys(options).forEach(function checkForKeys(key) {
      if (typeof theOptions[key] === 'undefined') {
        theOptions[key] = options[key];
      }
    });
  } else {
    theOptions = options;
  }
  theMd.renderer.rules.asset = tokenizeAsset(theMd, theOptions);
  theMd.inline.ruler.before('emphasis', 'asset', assetEmbed(theMd, theOptions));
};
