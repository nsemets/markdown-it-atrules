/* eslint func-names: ["error", "never"] */
var assert = require('assert');

var md;
var renderedHtml;
var id;

function getMfrId(html) {
  return html.split('"')[1];
}

function getMfrUrl(assetID) {
  return 'https://mfr.osf.io/render?url=https://osf.io/' + assetID + '/?action=download%26mode=render';
}

// Because the mfr iframe requires a random id these tests cannot be part of
// the markdown-it-testgen fixture
describe('markdown-it-atrules', function () {
  md = require('markdown-it')({
    html: true,
    linkify: true,
    typography: true,
  }).use(require('..'), {
    type: 'osf',
    pattern: /^http(?:s?):\/\/(?:www\.)?[a-zA-Z0-9 .:]{1,}\/render\?url=http(?:s?):\/\/[a-zA-Z0-9 .:]{1,}\/([a-zA-Z0-9]{5})\/\?action=download|(^[a-zA-Z0-9]{5}$)/,
    format(assetID) {
      var cssId = '__markdown-it-atrules-' + (new Date()).getTime();
      return '<div id="' + cssId + '" class="mfr mfr-file"></div>'
        + '<script>$(document).ready(function () {new mfr.Render("' + cssId + '", "' + getMfrUrl(assetID) + '");    }); </script>';
    },
  });

  it('fails with bad guid', function () {
    renderedHtml = md.render('@[osf](2manychars)');
    assert.equal(renderedHtml, '<p>@<a href="2manychars">osf</a></p>\n');
  });

  it('fails with bad non osf link', function () {
    renderedHtml = md.render('@[osf](https://google.com )');
    assert.equal(renderedHtml, '<p>@<a href="https://google.com">osf</a></p>\n');
  });

  it('fails when empty', function () {
    renderedHtml = md.render('@[osf]()');
    assert.equal(renderedHtml, '<p>@<a href="">osf</a></p>\n');
  });

  it('generates iframe properly with guid', function () {
    renderedHtml = md.render('@[osf](xxxxx)');
    id = getMfrId(renderedHtml);
    assert.equal(renderedHtml, '<p><div id="' + id + '" class="mfr mfr-file"></div><script>$(document).ready(function () {new mfr.Render("' + id + '", "https://mfr.osf.io/render?url=https://osf.io/xxxxx/?action=download%26mode=render");    }); </script></p>\n');
  });

  it('generates iframe properly with guid and line break', function () {
    renderedHtml = md.render('@[osf](xxxxx\n)');
    id = getMfrId(renderedHtml);
    assert.equal(renderedHtml, '<p><div id="' + id + '" class="mfr mfr-file"></div><script>$(document).ready(function () {new mfr.Render("' + id + '", "https://mfr.osf.io/render?url=https://osf.io/xxxxx/?action=download%26mode=render");    }); </script></p>\n');
  });

  it('generates iframe properly with guid and extra space', function () {
    renderedHtml = md.render('@[osf](xxxxx )');
    id = getMfrId(renderedHtml);
    assert.equal(renderedHtml, '<p><div id="' + id + '" class="mfr mfr-file"></div><script>$(document).ready(function () {new mfr.Render("' + id + '", "https://mfr.osf.io/render?url=https://osf.io/xxxxx/?action=download%26mode=render");    }); </script></p>\n');
  });

  it('generates iframe properly with guid and two extra spaces', function () {
    renderedHtml = md.render('@[osf]( xxxxx )');
    id = getMfrId(renderedHtml);
    assert.equal(renderedHtml, '<p><div id="' + id + '" class="mfr mfr-file"></div><script>$(document).ready(function () {new mfr.Render("' + id + '", "https://mfr.osf.io/render?url=https://osf.io/xxxxx/?action=download%26mode=render");    }); </script></p>\n');
  });

  it('generates iframe properly with link', function () {
    renderedHtml = md.render('@[osf](https://mfr.osf.io/render?url=https://osf.io/xxxxx/?action=download%26mode=render)');
    id = getMfrId(renderedHtml);
    assert.equal(renderedHtml, '<p><div id="' + id + '" class="mfr mfr-file"></div><script>$(document).ready(function () {new mfr.Render("' + id + '", "https://mfr.osf.io/render?url=https://osf.io/xxxxx/?action=download%26mode=render");    }); </script></p>\n');
  });

  it('generates iframe properly with link and extra space', function () {
    renderedHtml = md.render('@[osf](https://mfr.osf.io/render?url=https://osf.io/xxxxx/?action=download%26mode=render )');
    id = getMfrId(renderedHtml);
    assert.equal(renderedHtml, '<p><div id="' + id + '" class="mfr mfr-file"></div><script>$(document).ready(function () {new mfr.Render("' + id + '", "https://mfr.osf.io/render?url=https://osf.io/xxxxx/?action=download%26mode=render");    }); </script></p>\n');
  });

  it('generates iframe properly with link and two extra spaces', function () {
    renderedHtml = md.render('@[osf](https://mfr.osf.io/render?url=https://osf.io/xxxxx/?action=download%26mode=render )');
    id = getMfrId(renderedHtml);
    assert.equal(renderedHtml, '<p><div id="' + id + '" class="mfr mfr-file"></div><script>$(document).ready(function () {new mfr.Render("' + id + '", "https://mfr.osf.io/render?url=https://osf.io/xxxxx/?action=download%26mode=render");    }); </script></p>\n');
  });

  it('generates iframe properly with local ip', function () {
    renderedHtml = md.render('@[osf](http://localhost:7778/render?url=http://192.168.168.167:5000/xxxxx/?action=download%26mode=render)');
    id = getMfrId(renderedHtml);
    assert.equal(renderedHtml, '<p><div id="' + id + '" class="mfr mfr-file"></div><script>$(document).ready(function () {new mfr.Render("' + id + '", "https://mfr.osf.io/render?url=https://osf.io/xxxxx/?action=download%26mode=render");    }); </script></p>\n');
  });

  it('generates embed followed by formatted markdown', function () {
    renderedHtml = md.render('@[osf](abc12)\n*foo*');
    id = getMfrId(renderedHtml);
    assert.ok(renderedHtml.indexOf(id) >= 0);
  });
});
