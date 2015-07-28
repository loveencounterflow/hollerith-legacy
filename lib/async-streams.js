(function() {
  var $, $async, CND, CODEC, D, HOLLERITH, after, alert, badge, db, debug, echo, f, help, info, join, later, leveldown, levelup, log, misfit, njs_path, rpr, step, suspend, test, urge, warn, whisper, ƒ;

  njs_path = require('path');

  join = njs_path.join;

  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'HOLLERITH/tests';

  log = CND.get_logger('plain', badge);

  info = CND.get_logger('info', badge);

  whisper = CND.get_logger('whisper', badge);

  alert = CND.get_logger('alert', badge);

  debug = CND.get_logger('debug', badge);

  warn = CND.get_logger('warn', badge);

  help = CND.get_logger('help', badge);

  urge = CND.get_logger('urge', badge);

  echo = CND.echo.bind(CND);

  suspend = require('coffeenode-suspend');

  step = suspend.step;

  after = suspend.after;


  /* TAINT experimentally using `later` in place of `setImmediate` */

  later = suspend.immediately;

  test = require('guy-test');

  D = require('pipedreams2');

  $ = D.remit.bind(D);

  $async = D.remit_async.bind(D);

  HOLLERITH = require('./main');

  db = null;

  levelup = require('level');

  leveldown = require('level/node_modules/leveldown');

  CODEC = require('hollerith-codec');

  ƒ = CND.format_number;

  misfit = Symbol('misfit');

  f = function() {
    return step((function(_this) {
      return function*(resume) {
        var i, j, k, lc_input, letter, n, number_input, uc_input;
        number_input = D.create_throughstream();
        lc_input = D.create_throughstream();
        uc_input = D.create_throughstream();
        number_input.pipe(D.$lockstep(lc_input, {
          fallback: 'missing'
        })).pipe(D.$lockstep(uc_input, {
          fallback: 'missing'
        })).pipe(D.$show()).pipe(D.$on_end(function(end) {
          urge('$on_end 1');
          return after(0.5, function() {
            urge('$on_end 2');
            return end();
          });
        }));
        for (n = i = 0; i <= 7; n = ++i) {
          letter = String.fromCodePoint(('a'.codePointAt(0)) + n);
          help("write " + letter);
          lc_input.write(letter);
          (yield after(0.25, resume));
        }
        lc_input.end();
        for (n = j = 0; j <= 7; n = ++j) {
          letter = String.fromCodePoint(('A'.codePointAt(0)) + n);
          help("write " + letter);
          uc_input.write(letter);
          (yield after(0.25, resume));
        }
        uc_input.end();
        for (n = k = 0; k <= 9; n = ++k) {
          help("write " + n);
          number_input.write(n);
          (yield after(0.25, resume));
        }
        number_input.end();
        return null;
      };
    })(this));
  };

  f();

}).call(this);

//# sourceMappingURL=../sourcemaps/async-streams.js.map