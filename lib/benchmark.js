(function() {
  var BYTEWISE, CND, CODEC, PASSPHRASE, after, alert, badge, debug, echo, eventually, help, immediately, info, join, log, njs_path, report, rpr, start, step, stop, suspend, times, urge, warn, whisper, ƒ;

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

  eventually = suspend.eventually;

  immediately = suspend.immediately;

  BYTEWISE = require('bytewise');

  CODEC = require('hollerith-codec');

  PASSPHRASE = require('coffeenode-passphrase');

  ƒ = CND.format_number.bind(CND);

  times = {};

  start = function(name) {
    whisper("start " + name);
    times[name] = process.hrtime();
    return null;
  };

  stop = function(name) {
    var dt;
    dt = process.hrtime(times[name]);
    times[name] = dt[0] + dt[1] / 1e9;
    return null;
  };

  report = function(n, min_name) {
    var _, columnify_settings, data, dt, entry, max, min, name;
    columnify_settings = {
      config: {
        dt: {
          align: 'right'
        },
        rel: {
          align: 'right'
        },
        max: {
          align: 'right'
        }
      }
    };
    if (min_name != null) {
      min = times[min_name];
    } else {
      min = Math.min.apply(Math, (function() {
        var results;
        results = [];
        for (_ in times) {
          dt = times[_];
          results.push(dt);
        }
        return results;
      })());
    }
    max = Math.max.apply(Math, (function() {
      var results;
      results = [];
      for (_ in times) {
        dt = times[_];
        results.push(dt);
      }
      return results;
    })());
    debug('©q6yuS', min, max);
    data = [];
    for (name in times) {
      dt = times[name];
      entry = {
        name: name,
        dt: dt.toFixed(9),
        rel: "" + ((dt / min).toFixed(2)),
        max: "" + ((dt / max).toFixed(2))
      };
      data.push(entry);
    }
    urge("time needed to process " + (ƒ(n)) + " arbitrary strings (lower is better):");
    return help('\n' + CND.columnify(data, columnify_settings));
  };

  this.test_h2c = function(probes) {
    var i, len, probe;
    start('H2C.encode');
    for (i = 0, len = probes.length; i < len; i++) {
      probe = probes[i];
      CODEC.encode(probe);
    }
    return stop('H2C.encode');
  };

  this.test_bytewise = function(probes) {
    var i, len, probe;
    start('bytewise.encode');
    for (i = 0, len = probes.length; i < len; i++) {
      probe = probes[i];
      BYTEWISE.encode(probe);
    }
    return stop('bytewise.encode');
  };

  this.test_json = function(probes) {
    var i, len, probe;
    start('new Buffer JSON.stringify');
    for (i = 0, len = probes.length; i < len; i++) {
      probe = probes[i];
      new Buffer(JSON.stringify(probe));
    }
    return stop('new Buffer JSON.stringify');
  };

  this.test_new_buffer = function(probes) {
    var b, i, len, probe;
    start('new_buffer');
    for (i = 0, len = probes.length; i < len; i++) {
      probe = probes[i];
      b = new Buffer(probe);
    }
    return stop('new_buffer');
  };

  this.test_buffer_write = function(probes) {
    var b, i, len, probe;
    b = new Buffer(1024);
    start('buffer_write');
    for (i = 0, len = probes.length; i < len; i++) {
      probe = probes[i];
      b.write(probe[0]);
    }
    return stop('buffer_write');
  };

  this.test_string_replace = function(probes) {
    var i, len, probe, x;
    start('string_replace');
    for (i = 0, len = probes.length; i < len; i++) {
      probe = probes[i];
      x = probe[0].replace(/a/g, '#');
    }
    return stop('string_replace');
  };

  this.main = function() {
    var idx, n, probes;
    n = 100000;
    whisper("generating " + (ƒ(n)) + " probes");
    probes = (function() {
      var i, ref, results;
      results = [];
      for (idx = i = 1, ref = n; 1 <= ref ? i <= ref : i >= ref; idx = 1 <= ref ? ++i : --i) {
        results.push([PASSPHRASE.get_passphrase()]);
      }
      return results;
    })();
    help("generated " + (ƒ(probes.length)) + " probes; now performing benchmarks");
    this.test_bytewise(probes);
    this.test_json(probes);
    this.test_h2c(probes);
    this.test_new_buffer(probes);
    this.test_buffer_write(probes);
    this.test_string_replace(probes);
    return report(n, 'new Buffer JSON.stringify');
  };

  if (module.parent == null) {
    this.main();
  }

}).call(this);

//# sourceMappingURL=../sourcemaps/benchmark.js.map