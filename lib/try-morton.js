(function() {
  var CND, R, TEXT, alert, badge, debug, echo, help, i, info, j, k, len, log, m, ref, rpr, urge, warn, whisper, x, y, z, ƒ;

  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'HOLLERITH/dump';

  log = CND.get_logger('plain', badge);

  info = CND.get_logger('info', badge);

  whisper = CND.get_logger('whisper', badge);

  alert = CND.get_logger('alert', badge);

  debug = CND.get_logger('debug', badge);

  warn = CND.get_logger('warn', badge);

  help = CND.get_logger('help', badge);

  urge = CND.get_logger('urge', badge);

  echo = CND.echo.bind(CND);

  m = require('morton');

  TEXT = require('coffeenode-text');

  ƒ = function(n) {
    return TEXT.flush_right(CND.format_number(n), 5);
  };

  R = [];

  for (x = i = 1000; i <= 1008; x = ++i) {
    for (y = j = 500; j <= 508; y = ++j) {
      R.push([m(x, y), x, y]);
    }
  }

  R.sort(function(arg, arg1) {
    var x0, x1, y0, y1, z0, z1;
    z0 = arg[0], x0 = arg[1], y0 = arg[2];
    z1 = arg1[0], x1 = arg1[1], y1 = arg1[2];
    if (z0 < z1) {
      return -1;
    }
    if (z0 > z1) {
      return +1;
    }
    return 0;
  });

  for (k = 0, len = R.length; k < len; k++) {
    ref = R[k], z = ref[0], x = ref[1], y = ref[2];
    help(ƒ(z), ƒ(x), ƒ(y));
  }

  urge(m(1, 1), m(5, 5), m(6, 50));

}).call(this);

//# sourceMappingURL=../sourcemaps/try-morton.js.map