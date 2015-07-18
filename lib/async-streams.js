(function() {
  var $, $async, CND, CODEC, D, HOLLERITH, after, alert, badge, db, debug, echo, f, help, info, join, later, leveldown, levelup, log, njs_path, rpr, step, suspend, test, urge, warn, whisper, ƒ;

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

  CODEC = require('./codec');

  ƒ = CND.format_number;

  f = function() {
    return step((function(_this) {
      return function(resume) {
        var input_A, input_B, write;
        input_A = D.create_throughstream();
        input_B = input_A.pipe($async(function(data, done) {
          var dt;
          dt = data === 1 ? 5 : CND.random_number(0.5, 1.5);
          debug('©WscFi', data, dt);
          return after(dt, (function(_this) {
            return function() {
              urge("send " + (rpr(data)));
              return done(data);
            };
          })(this));
        })).pipe(D.$show()).pipe(D.$on_end(function(end) {
          urge('$on_end 1');
          return after(1, function() {
            urge('$on_end 2');
            return end();
          });
        }));
        input_A.on('end', function() {
          return urge("input_A.end");
        });
        input_B.on('end', function() {
          return urge("input_B.end");
        });
        write = function*() {
          var i, n;
          for (n = i = 0; i <= 10; n = ++i) {
            help("write " + n);
            input_A.write(n);
            (yield after(0.5, resume));
          }
          return input_A.end();
        };
        return write();
      };
    })(this));
  };

  f();

}).call(this);

//# sourceMappingURL=../sourcemaps/async-streams.js.map