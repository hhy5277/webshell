var url = require('url'),
    sys = require('sys'),
    stylize = require('colors').stylize,
    _ = require('underscore')._;

exports.parseURL = function(urlStr, protocolHelp) {
  var u = url.parse(urlStr);
  var prevU = parseURL($_.previousUrl || 'http://example.com');
  
  if (!u.protocol && !u.hostname) {
    u.protocol = prevU.protocol;
    u.hostname = prevU.hostname;
    u.slashes = prevU.slashes;
    u.port = prevU.port;
    if (u.pathname.substr(0,1) != '/') {
      u.pathname = '/' + u.pathname;
    }
  }
  
  if (protocolHelp && !u.protocol) {
    u = url.parse('http://'+urlStr);
  }
  u.port = u.port || (u.protocol === 'https:' ? 443 : 80);
  u.pathname = u.pathname || '/';
  return u;
};

exports.formatUrl = function(u) {
  return url.format(u);
};

exports.responsePrinter = function($_, response) {
  var bufferOk = true;
  if (_.isFunction($_.toolbox.responsePrinter)) {
    bufferOk = $_.toolbox.responsePrinter($_, response);
  } else {
    if ($_.json) {
      bufferOk = web_repl.rli.outputWrite(sys.inspect($_.json, false, undefined, true));
      web_repl.rli.outputWrite("\n");
    }
  }
  return bufferOk;
};

exports.formatStatus = function(status, url) {
  var url = formatUrl(url, true);
  var msg = "HTTP " + status + " " + stylize(url, 'white');
  if (httpSuccess(status)) {
    console.log(stylize(msg, 'green'));
  } else if (httpRedirection(status)) {
    console.log(stylize(msg, 'yellow'));
  } else if (httpClientError(status) || httpServerError(status)) {
    console.log(stylize(msg, 'red'));
  } else {
    console.log(stylize(msg, 'white'));
  }
};

exports.httpSuccess = function(status) {
  return status >= 200 && status < 300;
};

exports.httpRedirection = function(status) {
  return status >= 300 && status < 400;
};

exports.httpClientError = function(status) {
  return status >= 400 && status < 500;
};

exports.httpServerError = function(status) {
  return status >= 500 && status < 600;
};

exports.base64Encode = function(str) {
  return (new Buffer(str, 'ascii')).toString('base64');
}

exports.printHeader = function(value, name) {
  function normalizeName(name) {
    return _.map(name.split('-'), function(s) { return s[0].toUpperCase() + s.slice(1, s.length); }).join('-');
  };

  sys.puts(normalizeName(name) + ": " + value);
};

