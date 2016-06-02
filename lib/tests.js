
/* https://github.com/ddopson/node-segfault-handler */

(function() {
  var $, $async, CND, CODEC, D, HOLLERITH, SegfaultHandler, after, alert, badge, clear_leveldb, db, debug, echo, get_new_db_name, help, include, info, join, later, leveldown, levelup, log, njs_path, read_all_keys, rpr, show_db_entries, show_keys_and_key_bfrs, step, suspend, test, urge, warn, whisper, ƒ,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  SegfaultHandler = require('segfault-handler');

  SegfaultHandler.registerHandler();

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

  D = require('pipedreams');

  $ = D.remit.bind(D);

  $async = D.remit_async.bind(D);

  HOLLERITH = require('./main');

  db = null;

  levelup = require('level');

  leveldown = require('leveldown');

  CODEC = require('hollerith-codec');

  ƒ = CND.format_number;

  show_keys_and_key_bfrs = function(keys, key_bfrs) {
    var columnify_settings, data, f, i, idx, key, key_txt, len, p;
    f = function(p) {
      var t;
      return ((function() {
        var i, len, ref, results;
        ref = (p.toString('hex')).split(/(..)/);
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          t = ref[i];
          if (t !== '') {
            results.push(t);
          }
        }
        return results;
      })()).join(' ');
    };
    columnify_settings = {
      paddingChr: ' '
    };
    data = [];
    key_bfrs = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = key_bfrs.length; i < len; i++) {
        p = key_bfrs[i];
        results.push(f(p));
      }
      return results;
    })();
    for (idx = i = 0, len = keys.length; i < len; idx = ++i) {
      key = keys[idx];
      key_txt = (rpr(key)).replace(/\\u0000/g, '∇');
      data.push({
        'str': key_txt,
        'bfr': key_bfrs[idx]
      });
    }
    help('\n' + CND.columnify(data, columnify_settings));
    return null;
  };

  show_db_entries = function(handler) {
    var input;
    input = db['%self'].createReadStream();
    return input.pipe(D.$show()).pipe($((function(_this) {
      return function(arg, send) {
        var key, value;
        key = arg.key, value = arg.value;
        return send([key, value]);
      };
    })(this))).pipe($((function(_this) {
      return function(arg, send) {
        var key, value;
        key = arg[0], value = arg[1];
        if (!HOLLERITH._is_meta(db, key)) {
          return send([key, value]);
        }
      };
    })(this))).pipe($((function(_this) {
      return function(arg, send) {
        var key, value;
        key = arg[0], value = arg[1];
        return send([key, value]);
      };
    })(this))).pipe(D.$collect()).pipe($((function(_this) {
      return function(facets, send) {
        return help('\n' + HOLLERITH.DUMP.rpr_of_facets(db, facets));
      };
    })(this))).pipe(D.$on_end((function(_this) {
      return function() {
        return handler();
      };
    })(this)));
  };

  get_new_db_name = function() {
    get_new_db_name.idx += +1;
    return "/tmp/hollerith2-testdb-" + get_new_db_name.idx;
  };

  get_new_db_name.idx = 0;

  read_all_keys = function(db, handler) {
    var Z, input;
    Z = [];
    input = db.createKeyStream();
    input.on('end', function() {
      return handler(null, Z);
    });
    return input.pipe($((function(_this) {
      return function(data, send) {
        return Z.push(data);
      };
    })(this)));
  };

  clear_leveldb = function(leveldb, handler) {
    return step((function(_this) {
      return function*(resume) {
        var route;
        route = leveldb['location'];
        (yield leveldb.close(resume));
        whisper("closed LevelDB");
        (yield leveldown.destroy(route, resume));
        whisper("destroyed LevelDB");
        (yield leveldb.open(resume));
        whisper("re-opened LevelDB");
        return handler(null);
      };
    })(this));
  };

  this._main = function(handler) {
    var db_route, db_settings;
    db_route = join(__dirname, '..', 'dbs/tests');
    db_settings = {
      size: 500
    };
    db = HOLLERITH.new_db(db_route, db_settings);
    return test(this, {
      'timeout': 2500
    });
  };

  this._feed_test_data = function(db, probes_idx, settings, handler) {
    var arity;
    switch (arity = arguments.length) {
      case 3:
        handler = settings;
        settings = null;
        break;
      case 4:
        null;
        break;
      default:
        throw new Error("expected 3 or 4 arguments, got " + arity);
    }
    step((function(_this) {
      return function*(resume) {
        var i, input, j, k, key, len, len1, n, probe, ref, ref1, url_key;
        (yield HOLLERITH.clear(db, resume));
        whisper("writing test dataset #" + probes_idx + " with settings " + (rpr(settings)));
        input = D.create_throughstream();
        switch (probes_idx) {
          case -1:
            input.pipe(HOLLERITH.$write(db, settings)).pipe(D.$on_end(function(end) {
              whisper("test data written");
              handler(null);
              return end();
            }));
            for (n = i = 0; i <= 1000; n = ++i) {
              key = ["number:" + n, "square", Math.pow(n, 2)];
              input.write(key);
              (yield later(resume));
            }
            return input.end();
          case 0:
          case 2:
          case 3:
          case 4:
          case 5:
            input.pipe(HOLLERITH.$write(db, settings)).pipe(D.$on_end(function(end) {
              whisper("test data written");
              handler(null);
              return end();
            }));
            ref = _this._feed_test_data.probes[probes_idx];
            for (j = 0, len = ref.length; j < len; j++) {
              probe = ref[j];
              input.write(probe);
              (yield later(resume));
            }
            return input.end();
          case 1:
            input.pipe(HOLLERITH.$write(db, settings)).pipe(D.$on_end(function(end) {
              whisper("test data written");
              end();
              return handler(null);
            }));
            ref1 = _this._feed_test_data.probes[probes_idx];
            for (k = 0, len1 = ref1.length; k < len1; k++) {
              url_key = ref1[k];
              key = HOLLERITH.key_from_url(db, url_key);
              input.write(key);
              (yield later(resume));
            }
            return input.end();
          default:
            return handler(new Error("illegal probes index " + (rpr(probes_idx))));
        }
      };
    })(this));
    return null;
  };

  this._feed_test_data.probes = [];


  /* probes_idx == 0 */

  this._feed_test_data.probes.push([['𧷟1', 'guide/lineup/length', 1], ['𧷟2', 'guide/lineup/length', 2], ['𧷟3', 'guide/lineup/length', 3], ['𧷟4', 'guide/lineup/length', 4], ['𧷟', 'guide/lineup/length', 5], ['𧷟6', 'guide/lineup/length', 6], ['𧷟', 'cp/cid', 163295], ['𧷟', 'guide/uchr/has', ['八', '刀', '宀', '', '貝']], ['𧷟', 'rank/cjt', 5432], ['八', 'factor/strokeclass/wbf', '34'], ['刀', 'factor/strokeclass/wbf', '5(12)3'], ['宀', 'factor/strokeclass/wbf', '44'], ['', 'factor/strokeclass/wbf', '12'], ['貝', 'factor/strokeclass/wbf', '25(12)'], ['八', 'rank/cjt', 12541], ['刀', 'rank/cjt', 12542], ['宀', 'rank/cjt', 12543], ['', 'rank/cjt', 12544], ['貝', 'rank/cjt', 12545]]);


  /* probes_idx == 1 */

  this._feed_test_data.probes.push(['so|glyph:劬|cp/fncr:u-cjk/52ac|0', 'so|glyph:邭|cp/fncr:u-cjk/90ad|0', 'so|glyph:𠴦|cp/fncr:u-cjk-xb/20d26|0', 'so|glyph:𤿯|cp/fncr:u-cjk-xb/24fef|0', 'so|glyph:𧑴|cp/fncr:u-cjk-xb/27474|0', 'so|glyph:𨒡|cp/fncr:u-cjk-xb/284a1|0', 'so|glyph:𪚧|cp/fncr:u-cjk-xb/2a6a7|0', 'so|glyph:𪚫|cp/fncr:u-cjk-xb/2a6ab|0', 'so|glyph:𤿯|strokeorder:352513553254|0', 'so|glyph:𠴦|strokeorder:3525141121|0', 'so|glyph:𨒡|strokeorder:35251454|0', 'so|glyph:邭|strokeorder:3525152|0', 'so|glyph:𪚫|strokeorder:352515251115115113541|0', 'so|glyph:𪚧|strokeorder:35251525112511511|0', 'so|glyph:𧑴|strokeorder:352515251214251214|0', 'so|glyph:劬|strokeorder:3525153|0']);


  /* probes_idx == 2 */

  this._feed_test_data.probes.push([['丁', 'strokecount', 2], ['三', 'strokecount', 3], ['夫', 'strokecount', 5], ['國', 'strokecount', 11], ['形', 'strokecount', 7], ['丁', 'componentcount', 1], ['三', 'componentcount', 1], ['夫', 'componentcount', 1], ['國', 'componentcount', 4], ['形', 'componentcount', 2], ['丁', 'components', ['丁']], ['三', 'components', ['三']], ['夫', 'components', ['夫']], ['國', 'components', ['囗', '戈', '口', '一']], ['形', 'components', ['开', '彡']]]);


  /* probes_idx == 3 */

  this._feed_test_data.probes.push([['丁', 'isa', ['glyph', 'guide']], ['三', 'isa', ['glyph', 'guide']], ['夫', 'isa', ['glyph', 'guide']], ['國', 'isa', ['glyph']], ['形', 'isa', ['glyph']], ['glyph:丁', 'strokeorder/count', 2], ['glyph:三', 'strokeorder/count', 3], ['glyph:夫', 'strokeorder/count', 5], ['glyph:國', 'strokeorder/count', 11], ['glyph:形', 'strokeorder/count', 7], ['glyph:丁', 'guide/count', 1], ['glyph:三', 'guide/count', 1], ['glyph:夫', 'guide/count', 1], ['glyph:國', 'guide/count', 4], ['glyph:形', 'guide/count', 2], ['glyph:丁', 'guide/lineup', ['丁']], ['glyph:三', 'guide/lineup', ['三']], ['glyph:夫', 'guide/lineup', ['夫']], ['glyph:國', 'guide/lineup', ['囗', '戈', '口', '一']], ['glyph:形', 'guide/lineup', ['开', '彡']]]);


  /* probes_idx == 4 */

  this._feed_test_data.probes.push([['𧷟1', 'guide/lineup/length', 1], ['𧷟2', 'guide/lineup/length', 2], ['𧷟3', 'guide/lineup/length', 3], ['𧷟4', 'guide/lineup/length', 4], ['𧷟', 'guide/lineup/length', 5], ['𧷟6', 'guide/lineup/length', 6], ['𧷟', 'cp/cid', 163295], ['𧷟', 'guide/uchr/has', ['八', '刀', '宀', '', '貝']], ['𧷟', 'rank/cjt', 5432], ['八', 'factor/strokeclass/wbf', '34'], ['刀', 'factor/strokeclass/wbf', '5(12)3'], ['宀', 'factor/strokeclass/wbf', '44'], ['', 'factor/strokeclass/wbf', '12'], ['貝', 'factor/strokeclass/wbf', '25(12)'], ['八', 'rank/cjt', 12541], ['刀', 'rank/cjt', 12542], ['宀', 'rank/cjt', 12543], ['', 'rank/cjt', 12544], ['貝', 'rank/cjt', 12545], ['𧷟1', 'a', 42], ['𧷟1', 'ab', 42], ['𧷟1', 'guide', 'xxx'], ['𧷟1', 'guide/', 'yyy'], ['𧷟1', 'z', 42]]);


  /* probes_idx == 5 */

  this._feed_test_data.probes.push([
    ['丁', 'strokecount', 2], ['丁', 'componentcount', 1], ['丁', 'components', ['丁']], [
      {
        type: 'route',
        value: '/foo/bar'
      }, 'mtime', 123456789
    ]
  ]);

  this["write without error (1)"] = function(T, done) {
    var idx, probes_idx, write_settings;
    probes_idx = 0;
    idx = -1;
    write_settings = {
      batch: 10
    };
    return step((function(_this) {
      return function*(resume) {
        (yield _this._feed_test_data(db, probes_idx, write_settings, resume));
        return done();
      };
    })(this));
  };

  this["write without error (2)"] = function(T, done) {
    var idx, probes_idx, write_settings;
    probes_idx = -1;
    idx = -1;
    write_settings = {
      batch: 10
    };
    return step((function(_this) {
      return function*(resume) {
        (yield _this._feed_test_data(db, probes_idx, write_settings, resume));
        return done();
      };
    })(this));
  };

  this["read without error"] = function(T, done) {
    var idx, probes_idx;
    probes_idx = 0;
    idx = -1;
    return step((function(_this) {
      return function*(resume) {
        var input;
        (yield _this._feed_test_data(db, probes_idx, resume));
        input = HOLLERITH.create_facetstream(db);
        return input.pipe($(function(arg, send) {
          var key, value;
          key = arg[0], value = arg[1];
          return idx += +1;
        })).pipe(D.$on_end(function(end) {
          end;
          return done();
        }));
      };
    })(this));
  };

  this["read keys without error (1)"] = function(T, done) {
    return step((function(_this) {
      return function*(resume) {
        var NULL, count, i, idx, input, key_bfr, probe_idx, query;
        (yield HOLLERITH.clear(db, resume));

        /* TAINT awaiting better solution */
        NULL = HOLLERITH._encode_value(db, 1);
        for (idx = i = 0; i < 10; idx = ++i) {
          key_bfr = HOLLERITH._encode_key(db, ['x', idx, 'x']);
          db['%self'].put(key_bfr, NULL);
        }
        probe_idx = 4;
        count = 0;
        query = HOLLERITH._query_from_prefix(db, ['x', probe_idx]);
        input = db['%self'].createReadStream(query);
        return input.pipe($(function(arg, send) {
          var key, value;
          key = arg.key, value = arg.value;
          count += 1;
          return T.eq((HOLLERITH._decode_key(db, key))[1], probe_idx);
        })).pipe(D.$on_end(function(end) {
          T.eq(count, 1);
          end();
          return done();
        }));
      };
    })(this));
  };

  this["read keys without error (2)"] = function(T, done) {
    return step((function(_this) {
      return function*(resume) {
        var NULL, count, i, idx, input, prefix, probe_idx;
        (yield HOLLERITH.clear(db, resume));

        /* TAINT awaiting better solution */
        NULL = HOLLERITH._encode_value(db, 1);
        for (idx = i = 0; i < 10; idx = ++i) {
          db['%self'].put(HOLLERITH._encode_key(db, ['x', idx, 'x']), NULL);
        }
        probe_idx = 4;
        count = 0;
        prefix = ['x', probe_idx];
        input = HOLLERITH.create_facetstream(db, {
          prefix: prefix
        });
        return input.pipe($(function(facet, send) {
          var key, value;
          count += 1;
          key = facet[0], value = facet[1];
          return T.eq(key[1], probe_idx);
        })).pipe(D.$on_end(function(end) {
          T.eq(count, 1);
          end();
          return done();
        }));
      };
    })(this));
  };

  this["read keys without error (3)"] = function(T, done) {
    return step((function(_this) {
      return function*(resume) {
        var NULL, count, delta, hi, i, idx, input, lo, probe_idx, query;
        (yield HOLLERITH.clear(db, resume));

        /* TAINT awaiting better solution */
        NULL = HOLLERITH._encode_value(db, 1);
        for (idx = i = 0; i < 10; idx = ++i) {
          db['%self'].put(HOLLERITH._encode_key(db, ['x', idx, 'x']), NULL);
        }
        probe_idx = 3;
        count = 0;
        delta = 2;
        lo = ['x', probe_idx];
        hi = ['x', probe_idx + delta];
        query = {
          gte: HOLLERITH._encode_key(db, lo),
          lte: (HOLLERITH._query_from_prefix(db, hi))['lte']
        };
        input = db['%self'].createReadStream(query);
        return input.pipe($(function(arg, send) {
          var key, value;
          key = arg.key, value = arg.value;
          count += 1;
          return T.eq((HOLLERITH._decode_key(db, key))[1], probe_idx + count - 1);
        })).pipe(D.$on_end(function(end) {
          T.eq(count, delta + 1);
          end();
          return done();
        }));
      };
    })(this));
  };

  this["read keys without error (4)"] = function(T, done) {
    return step((function(_this) {
      return function*(resume) {
        var count, delta, hi, i, idx, input, lo, probe_idx;
        (yield HOLLERITH.clear(db, resume));
        for (idx = i = 0; i < 10; idx = ++i) {
          db['%self'].put(HOLLERITH._encode_key(db, ['x', idx, 'x']), HOLLERITH._encode_value(db, 1));
        }
        probe_idx = 3;
        count = 0;
        delta = 2;
        lo = ['x', probe_idx];
        hi = ['x', probe_idx + delta];
        input = HOLLERITH.create_facetstream(db, {
          lo: lo,
          hi: hi
        });
        return input.pipe($(function(arg, send) {
          var key, value;
          key = arg[0], value = arg[1];
          count += 1;
          return T.eq(key[1], probe_idx + count - 1);
        })).pipe(D.$on_end(function(end) {
          T.eq(count, delta + 1);
          end();
          return done();
        }));
      };
    })(this));
  };

  this["create_facetstream throws with wrong arguments"] = function(T, done) {
    var message;
    message = "illegal to specify `hi` but not `lo`";
    T.throws(message, (function() {
      return HOLLERITH.create_facetstream(db, {
        hi: ['xxx']
      });
    }));
    return done();
  };

  this["read POS facets"] = function(T, done) {
    var idx, key_matchers, probes_idx;
    probes_idx = 0;
    idx = -1;
    key_matchers = [['pos', 'guide/lineup/length', 2, '𧷟2'], ['pos', 'guide/lineup/length', 3, '𧷟3'], ['pos', 'guide/lineup/length', 4, '𧷟4']];
    return step((function(_this) {
      return function*(resume) {
        var hi, input, lo;
        (yield _this._feed_test_data(db, probes_idx, resume));
        lo = ['pos', 'guide/lineup/length', 2];
        hi = ['pos', 'guide/lineup/length', 4];
        input = HOLLERITH.create_facetstream(db, {
          lo: lo,
          hi: hi
        });
        return input.pipe($(function(arg, send) {
          var key, phrase, value;
          key = arg[0], value = arg[1];
          idx += +1;
          phrase = HOLLERITH.as_phrase(db, key, value);
          return T.eq(key, key_matchers[idx]);
        })).pipe(D.$on_end(function(end) {
          end();
          return done();
        }));
      };
    })(this));
  };

  this["read POS phrases (1)"] = function(T, done) {
    var idx, matchers, probes_idx;
    probes_idx = 0;
    idx = -1;
    matchers = [['pos', 'guide/lineup/length', 2, '𧷟2'], ['pos', 'guide/lineup/length', 3, '𧷟3'], ['pos', 'guide/lineup/length', 4, '𧷟4']];
    return step((function(_this) {
      return function*(resume) {
        var hi, input, lo;
        (yield _this._feed_test_data(db, probes_idx, resume));
        lo = ['pos', 'guide/lineup/length', 2];
        hi = ['pos', 'guide/lineup/length', 4];
        input = HOLLERITH.create_phrasestream(db, {
          lo: lo,
          hi: hi
        });
        return input.pipe($(function(phrase, send) {
          idx += +1;
          return T.eq(phrase, matchers[idx]);
        })).pipe(D.$on_end(function(end) {
          end();
          return done();
        }));
      };
    })(this));
  };

  this["read POS phrases (2)"] = function(T, done) {
    var count, idx, matchers, probes_idx;
    probes_idx = 0;
    idx = -1;
    count = 0;
    matchers = [['pos', 'guide/uchr/has', '八', '𧷟', 0], ['pos', 'guide/uchr/has', '刀', '𧷟', 1], ['pos', 'guide/uchr/has', '宀', '𧷟', 2], ['pos', 'guide/uchr/has', '貝', '𧷟', 4], ['pos', 'guide/uchr/has', '', '𧷟', 3]];
    return step((function(_this) {
      return function*(resume) {
        var input, prefix, settings;
        (yield _this._feed_test_data(db, probes_idx, resume));
        prefix = ['pos', 'guide/uchr/has'];
        input = HOLLERITH.create_phrasestream(db, {
          prefix: prefix
        });
        settings = {
          indexed: false
        };
        return input.pipe($(function(phrase, send) {
          debug('©DsAfY', rpr(phrase));
          count += +1;
          idx += +1;
          return T.eq(phrase, matchers[idx]);
        })).pipe(D.$on_end(function(end) {
          T.eq(count, matchers.length);
          end();
          return done();
        }));
      };
    })(this));
  };

  this["read SPO phrases"] = function(T, done) {
    var count, idx, matchers, probes_idx;
    debug('©Rsoxb', db['%self'].isOpen());
    probes_idx = 0;
    idx = -1;
    count = 0;
    matchers = [['spo', '𧷟', 'cp/cid', 163295], ['spo', '𧷟', 'guide/lineup/length', 5], ['spo', '𧷟', 'guide/uchr/has', ['八', '刀', '宀', '', '貝']], ['spo', '𧷟', 'rank/cjt', 5432]];
    return step((function(_this) {
      return function*(resume) {
        var input, prefix;
        (yield _this._feed_test_data(db, probes_idx, resume));
        prefix = ['spo', '𧷟'];
        input = HOLLERITH.create_phrasestream(db, {
          prefix: prefix
        });
        return input.pipe($(function(phrase, send) {
          debug('©DsAfY', rpr(phrase));
          count += +1;
          idx += +1;
          return T.eq(phrase, matchers[idx]);
        })).pipe(D.$on_end(function(end) {
          T.eq(count, matchers.length);
          end();
          return done();
        }));
      };
    })(this));
  };

  this["sorting (1)"] = function(T, done) {
    return step((function(_this) {
      return function*(resume) {
        var i, j, len, len1, leveldb, matcher, matchers, probe, probe_bfr, probe_bfrs, probe_idx, probes, settings;
        settings = {
          db: leveldown,
          keyEncoding: 'binary'
        };
        leveldb = levelup('/tmp/hollerith2-test', settings);
        (yield clear_leveldb(leveldb, resume));
        probes = ['a', 'ab', 'abc', 'abc\x00', 'abc\x00a', 'abca', 'abcb', 'abcc', 'abcd', 'abcde', 'abcdef', 'abcdefg'];
        matchers = [new Buffer([0x61]), new Buffer([0x61, 0x62]), new Buffer([0x61, 0x62, 0x63]), new Buffer([0x61, 0x62, 0x63, 0x00]), new Buffer([0x61, 0x62, 0x63, 0x00, 0x61]), new Buffer([0x61, 0x62, 0x63, 0x61]), new Buffer([0x61, 0x62, 0x63, 0x62]), new Buffer([0x61, 0x62, 0x63, 0x63]), new Buffer([0x61, 0x62, 0x63, 0x64]), new Buffer([0x61, 0x62, 0x63, 0x64, 0x65]), new Buffer([0x61, 0x62, 0x63, 0x64, 0x65, 0x66]), new Buffer([0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67])];
        CND.shuffle(probes);
        for (i = 0, len = probes.length; i < len; i++) {
          probe = probes[i];
          probe_bfr = new Buffer(probe, 'utf-8');
          (yield leveldb.put(probe_bfr, '1', resume));
          probe_bfrs = (yield read_all_keys(leveldb, resume));
        }
        probe_bfrs = (yield read_all_keys(leveldb, resume));
        for (probe_idx = j = 0, len1 = probe_bfrs.length; j < len1; probe_idx = ++j) {
          probe_bfr = probe_bfrs[probe_idx];
          matcher = matchers[probe_idx];

          /* TAINT looks like `T.eq buffer1, buffer2` doesn't work---sometimes... */
          T.ok(probe_bfr.equals(matcher));
        }
        return leveldb.close(function() {
          return done();
        });
      };
    })(this));
  };

  this["sorting (2)"] = function(T, done) {

    /* This test is here because there seemed to occur some strange ordering issues when
    using memdown instead of leveldown
     */
    return step((function(_this) {
      return function*(resume) {
        var i, j, len, len1, leveldb, matcher, matchers, probe, probe_bfr, probe_bfrs, probe_idx, probes, settings;
        settings = {
          db: leveldown,
          keyEncoding: 'binary'
        };
        leveldb = levelup('/tmp/hollerith2-test', settings);
        (yield clear_leveldb(leveldb, resume));
        probes = [new Buffer([0x00]), new Buffer([0x01]), new Buffer([0x02]), new Buffer([0x03]), new Buffer([0xf9]), new Buffer([0xfa]), new Buffer([0xfb]), new Buffer([0xfc]), new Buffer([0xfd])];
        matchers = (function() {
          var i, len, results;
          results = [];
          for (i = 0, len = probes.length; i < len; i++) {
            probe = probes[i];
            results.push(probe);
          }
          return results;
        })();
        CND.shuffle(probes);
        for (i = 0, len = probes.length; i < len; i++) {
          probe = probes[i];
          (yield leveldb.put(probe, '1', resume));
        }
        probe_bfrs = (yield read_all_keys(leveldb, resume));
        for (probe_idx = j = 0, len1 = probe_bfrs.length; j < len1; probe_idx = ++j) {
          probe_bfr = probe_bfrs[probe_idx];
          matcher = matchers[probe_idx];

          /* TAINT looks like `T.eq buffer1, buffer2` doesn't work---sometimes... */
          T.ok(probe_bfr.equals(matcher));
        }
        return leveldb.close(function() {
          return done();
        });
      };
    })(this));
  };

  this["H2 codec `encode` throws on anything but a list"] = function(T, done) {
    T.throws("expected a list, got a text", (function() {
      return CODEC.encode('unaccaptable');
    }));
    T.throws("expected a list, got a number", (function() {
      return CODEC.encode(42);
    }));
    T.throws("expected a list, got a boolean", (function() {
      return CODEC.encode(true);
    }));
    T.throws("expected a list, got a boolean", (function() {
      return CODEC.encode(false);
    }));
    T.throws("expected a list, got a undefined", (function() {
      return CODEC.encode();
    }));
    return done();
  };

  this["sort texts with H2 codec (1)"] = function(T, done) {
    return step((function(_this) {
      return function*(resume) {
        var i, j, len, len1, leveldb, matcher, matchers, probe, probe_bfr, probe_bfrs, probe_idx, probes, settings;
        settings = {
          db: leveldown,
          keyEncoding: 'binary'
        };
        leveldb = levelup('/tmp/hollerith2-test', settings);
        (yield clear_leveldb(leveldb, resume));
        probes = ['a', 'ab', 'abc', 'abc\x00', 'abc\x00a', 'abca', 'abca\x00', 'abcb', 'abcc', 'abcd', 'abcde', 'abcdef', 'abcdefg'];
        matchers = (function() {
          var i, len, results;
          results = [];
          for (i = 0, len = probes.length; i < len; i++) {
            probe = probes[i];
            results.push([probe]);
          }
          return results;
        })();
        CND.shuffle(probes);
        for (i = 0, len = probes.length; i < len; i++) {
          probe = probes[i];
          (yield leveldb.put(CODEC.encode([probe]), '1', resume));
        }
        probe_bfrs = (yield read_all_keys(leveldb, resume));
        probes = (function() {
          var j, len1, results;
          results = [];
          for (j = 0, len1 = probe_bfrs.length; j < len1; j++) {
            probe_bfr = probe_bfrs[j];
            results.push(CODEC.decode(probe_bfr));
          }
          return results;
        })();
        show_keys_and_key_bfrs(probes, probe_bfrs);
        for (probe_idx = j = 0, len1 = probes.length; j < len1; probe_idx = ++j) {
          probe = probes[probe_idx];
          matcher = matchers[probe_idx];
          T.eq(probe, matcher);
        }
        return leveldb.close(function() {
          return done();
        });
      };
    })(this));
  };

  this["sort texts with H2 codec (2)"] = function(T, done) {
    return step((function(_this) {
      return function*(resume) {
        var i, j, len, len1, leveldb, matcher, matchers, probe, probe_bfr, probe_bfrs, probe_idx, probes, settings;
        settings = {
          db: leveldown,
          keyEncoding: 'binary'
        };
        leveldb = levelup('/tmp/hollerith2-test', settings);
        (yield clear_leveldb(leveldb, resume));
        probes = ['', ' ', 'a', 'abc', '一', '一二', '一二三', '三', '二', '𠀀', '𠀀\x00', '𠀀a', '𪜀', '𫝀', String.fromCodePoint(0x10ffff)];
        matchers = (function() {
          var i, len, results;
          results = [];
          for (i = 0, len = probes.length; i < len; i++) {
            probe = probes[i];
            results.push([probe]);
          }
          return results;
        })();
        CND.shuffle(probes);
        for (i = 0, len = probes.length; i < len; i++) {
          probe = probes[i];
          probe_bfr = CODEC.encode([probe]);
          (yield leveldb.put(probe_bfr, '1', resume));
        }
        probe_bfrs = (yield read_all_keys(leveldb, resume));
        probes = (function() {
          var j, len1, results;
          results = [];
          for (j = 0, len1 = probe_bfrs.length; j < len1; j++) {
            probe_bfr = probe_bfrs[j];
            results.push(CODEC.decode(probe_bfr));
          }
          return results;
        })();
        show_keys_and_key_bfrs(probes, probe_bfrs);
        for (probe_idx = j = 0, len1 = probes.length; j < len1; probe_idx = ++j) {
          probe = probes[probe_idx];
          matcher = matchers[probe_idx];
          T.eq(probe, matcher);
        }
        return leveldb.close(function() {
          return done();
        });
      };
    })(this));
  };

  this["sort numbers with H2 codec (1)"] = function(T, done) {
    return step((function(_this) {
      return function*(resume) {
        var _, i, j, k, len, len1, len2, leveldb, matcher, matchers, pad, probe, probe_bfr, probe_bfrs, probe_idx, probes, probes_and_descriptions, ref, settings;
        settings = {
          db: leveldown,
          keyEncoding: 'binary'
        };
        leveldb = levelup('/tmp/hollerith2-test', settings);
        (yield clear_leveldb(leveldb, resume));
        probes_and_descriptions = [[-Infinity, "-Infinity"], [-Number.MAX_VALUE, "-Number.MAX_VALUE"], [Number.MIN_SAFE_INTEGER, "Number.MIN_SAFE_INTEGER"], [-123456789, "-123456789"], [-3, "-3"], [-2, "-2"], [-1.5, "-1.5"], [-1, "-1"], [-Number.EPSILON, "-Number.EPSILON"], [-Number.MIN_VALUE, "-Number.MIN_VALUE"], [0, "0"], [+Number.MIN_VALUE, "+Number.MIN_VALUE"], [+Number.EPSILON, "+Number.EPSILON"], [+1, "+1"], [+1.5, "+1.5"], [+2, "+2"], [+3, "+3"], [+123456789, "+123456789"], [Number.MAX_SAFE_INTEGER, "Number.MAX_SAFE_INTEGER"], [Number.MAX_VALUE, "Number.MAX_VALUE"], [+Infinity, "+Infinity"]];
        matchers = (function() {
          var i, len, results;
          results = [];
          for (i = 0, len = probes_and_descriptions.length; i < len; i++) {
            pad = probes_and_descriptions[i];
            results.push([pad[0]]);
          }
          return results;
        })();
        for (i = 0, len = probes_and_descriptions.length; i < len; i++) {
          pad = probes_and_descriptions[i];
          urge(pad);
        }
        CND.shuffle(probes_and_descriptions);
        for (j = 0, len1 = probes_and_descriptions.length; j < len1; j++) {
          ref = probes_and_descriptions[j], probe = ref[0], _ = ref[1];
          probe_bfr = CODEC.encode([probe]);
          (yield leveldb.put(probe_bfr, '1', resume));
        }
        probe_bfrs = (yield read_all_keys(leveldb, resume));
        probes = (function() {
          var k, len2, results;
          results = [];
          for (k = 0, len2 = probe_bfrs.length; k < len2; k++) {
            probe_bfr = probe_bfrs[k];
            results.push(CODEC.decode(probe_bfr));
          }
          return results;
        })();
        show_keys_and_key_bfrs(probes, probe_bfrs);
        for (probe_idx = k = 0, len2 = probes.length; k < len2; probe_idx = ++k) {
          probe = probes[probe_idx];
          matcher = matchers[probe_idx];
          T.eq(probe, matcher);
        }
        return leveldb.close(function() {
          return done();
        });
      };
    })(this));
  };

  this["sort mixed values with H2 codec"] = function(T, done) {
    return step((function(_this) {
      return function*(resume) {
        var i, j, len, len1, leveldb, matcher, matchers, probe, probe_bfr, probe_bfrs, probe_idx, probes, settings;
        settings = {
          db: leveldown,
          keyEncoding: 'binary'
        };
        leveldb = levelup('/tmp/hollerith2-test', settings);
        (yield clear_leveldb(leveldb, resume));
        probes = [null, false, true, CODEC['sentinels']['firstdate'], new Date(0), new Date(8e11), new Date(), CODEC['sentinels']['lastdate'], 1234, Infinity, '', '一', '三', '二', '𠀀', '𠀀\x00', String.fromCodePoint(0x10ffff)];
        matchers = (function() {
          var i, len, results;
          results = [];
          for (i = 0, len = probes.length; i < len; i++) {
            probe = probes[i];
            results.push([probe]);
          }
          return results;
        })();
        CND.shuffle(probes);
        for (i = 0, len = probes.length; i < len; i++) {
          probe = probes[i];
          debug('©oMXJZ', probe);
          probe_bfr = CODEC.encode([probe]);
          (yield leveldb.put(probe_bfr, '1', resume));
        }
        probe_bfrs = (yield read_all_keys(leveldb, resume));
        probes = (function() {
          var j, len1, results;
          results = [];
          for (j = 0, len1 = probe_bfrs.length; j < len1; j++) {
            probe_bfr = probe_bfrs[j];
            results.push(CODEC.decode(probe_bfr));
          }
          return results;
        })();
        show_keys_and_key_bfrs(probes, probe_bfrs);
        for (probe_idx = j = 0, len1 = probes.length; j < len1; probe_idx = ++j) {
          probe = probes[probe_idx];
          matcher = matchers[probe_idx];
          T.eq(probe, matcher);
        }
        return leveldb.close(function() {
          return done();
        });
      };
    })(this));
  };

  this["sort lists of mixed values with H2 codec"] = function(T, done) {
    return step((function(_this) {
      return function*(resume) {
        var i, j, len, len1, leveldb, matcher, matchers, probe, probe_bfr, probe_bfrs, probe_idx, probes, settings;
        settings = {
          db: leveldown,
          keyEncoding: 'binary'
        };
        leveldb = levelup('/tmp/hollerith2-test', settings);
        (yield clear_leveldb(leveldb, resume));
        probes = [["", ''], ["1234", 1234], ["Infinity", Infinity], ["String.fromCodePoint 0x10ffff", String.fromCodePoint(0x10ffff)], ["false", false], ["new Date 0", new Date(0)], ["new Date 8e11", new Date(8e11)], ["new Date()", new Date()], ["null", null], ["true", true], ["一", '一'], ["三", '三'], ["二", '二'], ["𠀀", '𠀀'], ["𠀀\x00", '𠀀\x00']];
        matchers = (function() {
          var i, len, results;
          results = [];
          for (i = 0, len = probes.length; i < len; i++) {
            probe = probes[i];
            results.push(probe);
          }
          return results;
        })();
        CND.shuffle(probes);
        for (i = 0, len = probes.length; i < len; i++) {
          probe = probes[i];
          debug('©oMXJZ', probe);
          probe_bfr = CODEC.encode(probe);
          (yield leveldb.put(probe_bfr, '1', resume));
        }
        probe_bfrs = (yield read_all_keys(leveldb, resume));
        probes = (function() {
          var j, len1, results;
          results = [];
          for (j = 0, len1 = probe_bfrs.length; j < len1; j++) {
            probe_bfr = probe_bfrs[j];
            results.push(CODEC.decode(probe_bfr));
          }
          return results;
        })();
        show_keys_and_key_bfrs(probes, probe_bfrs);
        for (probe_idx = j = 0, len1 = probes.length; j < len1; probe_idx = ++j) {
          probe = probes[probe_idx];
          matcher = matchers[probe_idx];
          T.eq(probe, matcher);
        }
        return leveldb.close(function() {
          return done();
        });
      };
    })(this));
  };

  this["ensure `Buffer.compare` gives same sorting as LevelDB"] = function(T, done) {
    return step((function(_this) {
      return function*(resume) {
        var i, j, last_probe_bfr, len, len1, leveldb, probe, probe_bfr, probe_bfrs, probes, settings;
        settings = {
          db: leveldown,
          keyEncoding: 'binary'
        };
        leveldb = levelup('/tmp/hollerith2-test', settings);
        (yield clear_leveldb(leveldb, resume));
        probes = [["", ''], ["1234", 1234], ["Infinity", Infinity], ["String.fromCodePoint 0x10ffff", String.fromCodePoint(0x10ffff)], ["false", false], ["new Date 0", new Date(0)], ["new Date 8e11", new Date(8e11)], ["new Date()", new Date()], ["null", null], ["true", true], ["一", '一'], ["三", '三'], ["二", '二'], ["𠀀", '𠀀'], ["𠀀\x00", '𠀀\x00']];
        CND.shuffle(probes);
        for (i = 0, len = probes.length; i < len; i++) {
          probe = probes[i];
          probe_bfr = CODEC.encode(probe);
          (yield leveldb.put(probe_bfr, '1', resume));
        }
        probe_bfrs = (yield read_all_keys(leveldb, resume));
        last_probe_bfr = null;
        for (j = 0, len1 = probe_bfrs.length; j < len1; j++) {
          probe_bfr = probe_bfrs[j];
          if (last_probe_bfr != null) {
            T.eq(Buffer.compare(last_probe_bfr, probe_bfr), -1);
          }
          last_probe_bfr = probe_bfr;
        }
        return leveldb.close(function() {
          return done();
        });
      };
    })(this));
  };

  this["sort routes with values (1)"] = function(T, done) {
    return step((function(_this) {
      return function*(resume) {
        var i, j, len, len1, leveldb, matcher, matchers, probe, probe_bfr, probe_bfrs, probe_idx, probes, settings;
        settings = {
          db: leveldown,
          keyEncoding: 'binary'
        };
        leveldb = levelup('/tmp/hollerith2-test', settings);
        (yield clear_leveldb(leveldb, resume));
        probes = [['pos', 'strokeorder', '352513553254', '𤿯'], ['pos', 'strokeorder', '3525141121', '𠴦'], ['pos', 'strokeorder', '35251454', '𨒡'], ['pos', 'strokeorder', '3525152', '邭'], ['pos', 'strokeorder', '352515251115115113541', '𪚫'], ['pos', 'strokeorder', '35251525112511511', '𪚧'], ['pos', 'strokeorder', '352515251214251214', '𧑴'], ['pos', 'strokeorder', '3525153', '劬'], ['pos', 'strokeorder', '3525153\x00', '劬'], ['pos', 'strokeorder\x00', '352513553254', '𤿯']];
        matchers = (function() {
          var i, len, results;
          results = [];
          for (i = 0, len = probes.length; i < len; i++) {
            probe = probes[i];
            results.push(probe);
          }
          return results;
        })();
        CND.shuffle(probes);
        for (i = 0, len = probes.length; i < len; i++) {
          probe = probes[i];
          probe_bfr = CODEC.encode(probe);
          (yield leveldb.put(probe_bfr, '1', resume));
        }
        probe_bfrs = (yield read_all_keys(leveldb, resume));
        probes = (function() {
          var j, len1, results;
          results = [];
          for (j = 0, len1 = probe_bfrs.length; j < len1; j++) {
            probe_bfr = probe_bfrs[j];
            results.push(CODEC.decode(probe_bfr));
          }
          return results;
        })();
        show_keys_and_key_bfrs(probes, probe_bfrs);
        for (probe_idx = j = 0, len1 = probes.length; j < len1; probe_idx = ++j) {
          probe = probes[probe_idx];
          matcher = matchers[probe_idx];
          T.eq(probe, matcher);
        }
        return leveldb.close(function() {
          return done();
        });
      };
    })(this));
  };

  this["sort routes with values (2)"] = function(T, done) {
    return step((function(_this) {
      return function*(resume) {
        var i, j, len, len1, leveldb, matcher, matchers, probe, probe_bfr, probe_bfrs, probe_idx, probes, settings;
        settings = {
          db: leveldown,
          keyEncoding: 'binary'
        };
        leveldb = levelup('/tmp/hollerith2-test', settings);
        (yield clear_leveldb(leveldb, resume));
        probes = [['a', null], ['a', false], ['a', true], ['a', new Date()], ['a', -Infinity], ['a', +1234], ['a', +Infinity], ['a', 'b'], ['a', 'b\x00'], ['a\x00', +1234], ['a\x00', 'b'], ['aa', +1234], ['aa', 'b'], ['aa', 'b\x00']];
        matchers = (function() {
          var i, len, results;
          results = [];
          for (i = 0, len = probes.length; i < len; i++) {
            probe = probes[i];
            results.push(probe);
          }
          return results;
        })();
        CND.shuffle(probes);
        for (i = 0, len = probes.length; i < len; i++) {
          probe = probes[i];
          probe_bfr = CODEC.encode(probe);
          (yield leveldb.put(probe_bfr, '1', resume));
        }
        probe_bfrs = (yield read_all_keys(leveldb, resume));
        probes = (function() {
          var j, len1, results;
          results = [];
          for (j = 0, len1 = probe_bfrs.length; j < len1; j++) {
            probe_bfr = probe_bfrs[j];
            results.push(CODEC.decode(probe_bfr));
          }
          return results;
        })();
        show_keys_and_key_bfrs(probes, probe_bfrs);
        for (probe_idx = j = 0, len1 = probes.length; j < len1; probe_idx = ++j) {
          probe = probes[probe_idx];
          matcher = matchers[probe_idx];
          T.eq(probe, matcher);
        }
        return leveldb.close(function() {
          return done();
        });
      };
    })(this));
  };

  this["read sample data"] = function(T, done) {
    var idx, probes_idx;
    probes_idx = 2;
    idx = -1;
    step((function(_this) {
      return function*(resume) {
        var input;
        debug('©bUJhI', 'XX');
        (yield _this._feed_test_data(db, probes_idx, resume));
        debug('©PRzA5', 'XX');
        input = db['%self'].createReadStream();
        return input.pipe(D.$show()).pipe($(function(arg, send) {
          var key, value;
          key = arg.key, value = arg.value;
          return send([key, value]);
        })).pipe($(function(arg, send) {
          var key, value;
          key = arg[0], value = arg[1];
          if (!HOLLERITH._is_meta(db, key)) {
            return send([key, value]);
          }
        })).pipe($(function(arg, send) {
          var key, value;
          key = arg[0], value = arg[1];
          return send([key, value]);
        })).pipe(D.$collect()).pipe($(function(facets, send) {
          var buffer;
          help('\n' + HOLLERITH.DUMP.rpr_of_facets(db, facets));
          buffer = new Buffer(JSON.stringify(['开', '彡']));
          return debug('©GJfL6', HOLLERITH.CODEC.rpr_of_buffer(buffer));
        })).pipe(D.$on_end(function() {
          return done();
        }));
      };
    })(this));
    return null;
  };

  this["read and write keys with lists"] = function(T, done) {
    var buffer, count, i, idx, len, matchers, probe, probe_idx, probes, probes_idx, result;
    probes_idx = 0;
    idx = -1;
    count = 0;
    probes = [['a', 1], ['a', []], ['a', [1]], ['a', [true]], ['a', ['x', 'y', 'b']], ['a', [120, 1 / 3]], ['a', ['x']]];
    matchers = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = probes.length; i < len; i++) {
        probe = probes[i];
        results.push(probe);
      }
      return results;
    })();
    for (probe_idx = i = 0, len = probes.length; i < len; probe_idx = ++i) {
      probe = probes[probe_idx];
      buffer = HOLLERITH.CODEC.encode(probe);
      result = HOLLERITH.CODEC.decode(buffer);
      T.eq(result, matchers[probe_idx]);
    }
    return done();
  };

  this["encode keys with list elements"] = function(T, done) {
    var i, len, probe, probes;
    probes = [['foo', 'bar'], ['foo', ['bar']], [[], 'bar'], ['foo', []], [['foo'], 'bar'], [[42], 'bar'], ['foo', [42]]];
    for (i = 0, len = probes.length; i < len; i++) {
      probe = probes[i];
      T.eq(probe, HOLLERITH.CODEC.decode(HOLLERITH.CODEC.encode(probe)));
    }
    return done();
  };

  this["read and write phrases with unanalyzed lists"] = function(T, done) {
    var count, idx, probes, write_probes;
    idx = -1;
    count = 0;
    probes = [['probe#00', 'some-predicate', []], ['probe#01', 'some-predicate', [-1]], ['probe#02', 'some-predicate', [0]], ['probe#03', 'some-predicate', [1]], ['probe#04', 'some-predicate', [2]], ['probe#05', 'some-predicate', [2, -1]], ['probe#06', 'some-predicate', [2, 0]], ['probe#07', 'some-predicate', [2, 1]], ['probe#08', 'some-predicate', [2, 1, 0]], ['probe#09', 'some-predicate', [2, 2]], ['probe#10', 'some-predicate', [2, [2]]], ['probe#11', 'some-predicate', [3]]];
    write_probes = (function(_this) {
      return function(handler) {
        return step(function*(resume) {
          var i, input, len, probe;
          (yield HOLLERITH.clear(db, resume));
          input = D.create_throughstream();
          input.pipe(HOLLERITH.$write(db, {
            solids: ['some-predicate']
          })).pipe(D.$on_end(function() {
            urge("test data written");
            return handler();
          }));
          for (i = 0, len = probes.length; i < len; i++) {
            probe = probes[i];
            input.write(probe);
          }
          return input.end();
        });
      };
    })(this);
    return step((function(_this) {
      return function*(resume) {
        var input;
        (yield write_probes(resume));
        input = HOLLERITH.create_phrasestream(db);
        debug('©FphJK', input['%meta']);
        return input.pipe($(function(phrase, send) {
          count += +1;
          return idx += +1;
        })).pipe(D.$on_end(function() {
          return done();
        }));
      };
    })(this));
  };

  this["read partial POS phrases"] = function(T, done) {
    var count, idx, matchers, probes_idx;
    probes_idx = 4;
    idx = -1;
    count = 0;
    matchers = [['pos', 'guide', 'xxx', '𧷟1'], ['pos', 'guide/', 'yyy', '𧷟1'], ['pos', 'guide/lineup/length', 1, '𧷟1'], ['pos', 'guide/lineup/length', 2, '𧷟2'], ['pos', 'guide/lineup/length', 3, '𧷟3'], ['pos', 'guide/lineup/length', 4, '𧷟4'], ['pos', 'guide/lineup/length', 5, '𧷟'], ['pos', 'guide/lineup/length', 6, '𧷟6'], ['pos', 'guide/uchr/has', '八', '𧷟', 0], ['pos', 'guide/uchr/has', '刀', '𧷟', 1], ['pos', 'guide/uchr/has', '宀', '𧷟', 2], ['pos', 'guide/uchr/has', '貝', '𧷟', 4], ['pos', 'guide/uchr/has', '', '𧷟', 3]];
    return step((function(_this) {
      return function*(resume) {
        var input, prefix, settings;
        (yield _this._feed_test_data(db, probes_idx, resume));
        prefix = ['pos', 'guide'];
        input = HOLLERITH.create_phrasestream(db, {
          prefix: prefix,
          star: '*'
        });
        debug('©FphJK', input['%meta']);
        settings = {
          indexed: false
        };
        return input.pipe($(function(phrase, send) {
          count += +1;
          idx += +1;
          debug('©Sc5FG', phrase);
          return T.eq(phrase, matchers[idx]);
        })).pipe(D.$on_end(function() {
          T.eq(count, matchers.length);
          return done();
        }));
      };
    })(this));
  };

  this["read single phrases (1)"] = function(T, done) {
    var matcher, probes_idx;
    probes_idx = 4;
    matcher = ['spo', '𧷟', 'guide/lineup/length', 5];
    return step((function(_this) {
      return function*(resume) {
        var input, prefix, query;
        (yield _this._feed_test_data(db, probes_idx, resume));
        prefix = ['spo', '𧷟', 'guide/lineup/length'];
        query = {
          prefix: prefix,
          star: '*'
        };
        return input = HOLLERITH.read_one_phrase(db, query, function(error, phrase) {
          if (error != null) {
            throw error;
          }
          debug('©61ENl', phrase);
          T.eq(phrase, matcher);
          return done();
        });
      };
    })(this));
  };

  this["read single phrases (2)"] = function(T, done) {
    var matcher, probes_idx;
    probes_idx = 4;
    matcher = ['spo', '𧷟', 'guide/lineup/length', 5];
    return step((function(_this) {
      return function*(resume) {
        var input, prefix, query;
        (yield _this._feed_test_data(db, probes_idx, resume));
        prefix = ['spo', '𧷟', 'guide/lineup/length'];
        query = {
          prefix: prefix,
          star: '*',
          fallback: 'not to be used'
        };
        return input = HOLLERITH.read_one_phrase(db, query, function(error, phrase) {
          if (error != null) {
            throw error;
          }
          debug('©61ENl', phrase);
          T.eq(phrase, matcher);
          return done();
        });
      };
    })(this));
  };

  this["read single phrases (3)"] = function(T, done) {
    var matcher, probes_idx;
    probes_idx = 4;
    matcher = "expected 1 phrase, got 0";
    return step((function(_this) {
      return function*(resume) {
        var input, prefix, query;
        (yield _this._feed_test_data(db, probes_idx, resume));
        prefix = ['spo', '中', 'guide/lineup/length'];
        query = {
          prefix: prefix,
          star: '*'
        };
        return input = HOLLERITH.read_one_phrase(db, query, function(error, phrase) {
          if (error == null) {
            throw new Error("expected error");
          }
          T.eq(error['message'], matcher);
          return done();
        });
      };
    })(this));
  };

  this["read single phrases (4)"] = function(T, done) {
    var matcher, probes_idx;
    probes_idx = 4;
    matcher = "this entry is missing";
    return step((function(_this) {
      return function*(resume) {
        var input, prefix, query;
        (yield _this._feed_test_data(db, probes_idx, resume));
        prefix = ['spo', '中', 'guide/lineup/length'];
        query = {
          prefix: prefix,
          star: '*',
          fallback: matcher
        };
        return input = HOLLERITH.read_one_phrase(db, query, function(error, phrase) {
          if (error != null) {
            throw error;
          }
          T.eq(phrase, matcher);
          return done();
        });
      };
    })(this));
  };

  this["writing phrases with non-unique keys fails"] = function(T, done) {
    alert("test case \"writing phrases with non-unique keys fails\" to be written");
    return done();
  };

  this["reminders"] = function(T, done) {
    alert("H.$write() must test for repeated keys");
    return done();
  };

  this["invalid key not accepted (1)"] = function(T, done) {
    var domain;
    domain = (require('domain')).create();
    domain.on('error', function(error) {
      T.eq(error['message'], "invalid SPO key, must be list: 'xxx'");
      return later(done);
    });
    return domain.run(function() {
      var input;
      input = D.create_throughstream();
      input.pipe(HOLLERITH.$write(db)).pipe(D.$on_end(function() {
        return later(done);
      }));
      input.write('xxx');
      return input.end();
    });
  };

  this["invalid key not accepted (2)"] = function(T, done) {
    var domain;
    domain = (require('domain')).create();
    domain.on('error', function(error) {
      T.eq(error['message'], "invalid SPO key, must be of length 3: [ 'foo' ]");
      return done();
    });
    return domain.run(function() {
      var input;
      input = D.create_throughstream();
      input.pipe(HOLLERITH.$write(db));
      return input.write(['foo']);
    });
  };

  this["catching errors (2)"] = function(T, done) {
    var f, run;
    run = function(method, handler) {
      var domain;
      domain = (require('domain')).create();
      domain.on('error', function(error) {
        return handler(error);
      });
      return domain.run(function() {
        return method();
      });
    };
    f = function() {
      var input;
      input = D.create_throughstream();
      input.pipe(HOLLERITH.$write(db)).pipe(D.$on_end(function() {
        return later(done);
      }));
      input.write(['foo', 'bar', 'baz']);
      return input.end();
    };
    return run(f, function(error) {
      debug('©WaXJV', JSON.stringify(error['message']));
      T.eq(true, false);
      return done();
    });
  };

  this["catching errors (1)"] = function(T, done) {
    var d;
    return d = D.run(function() {
      var input;
      input = D.create_throughstream();
      input.pipe(HOLLERITH.$write(db)).pipe(D.$on_end(function() {
        return later(done);
      }));
      input.write(['foo', 'bar', 'baz', 'gnu']);
      return input.end();
    }, function(error) {
      T.eq(error['message'], "invalid SPO key, must be of length 3: [ 'foo', 'bar', 'baz', 'gnu' ]");
      return later(done);
    });
  };

  this["catching errors (2)"] = function(T, done) {
    var d, message;
    message = "should not produce error";
    return d = D.run(function() {
      var input;
      input = D.create_throughstream();
      input.pipe(HOLLERITH.$write(db)).pipe(D.$on_end(function() {
        T.succeed(message);
        return later(done);
      }));
      input.write(['foo', 'bar', 'baz']);
      return input.end();
    }, function(error) {
      T.fail(message);
      return later(done);
    });
  };

  this["building PODs from SPO phrases"] = function(T, done) {
    var $consolidate, $shorten_spo, count, idx, probes_idx;
    probes_idx = 4;
    idx = -1;
    count = 0;
    $shorten_spo = function() {
      return $((function(_this) {
        return function(phrase, send) {
          var spo;
          if (!((CND.isa_list(phrase)) && phrase[0] === 'spo')) {
            return send.error(new Error("not an SPO phrase: " + (rpr(phrase))));
          }
          spo = phrase.slice(1);

          /* TAINT repeated validation? */
          HOLLERITH.validate_spo(spo);
          return send(spo);
        };
      })(this));
    };
    $consolidate = function() {
      var last_sbj, pod;
      last_sbj = null;
      pod = null;
      return $((function(_this) {
        return function(spo, send, end) {
          var obj, prd, sbj;
          if (spo != null) {

            /* TAINT repeated validation? */
            HOLLERITH.validate_spo(spo);
            sbj = spo[0], prd = spo[1], obj = spo[2];
            if (sbj === last_sbj) {
              pod[prd] = obj;
            } else {
              if (pod != null) {

                /* TAINT implicit key `pod` */
                send([last_sbj, 'pod', pod]);
              }
              pod = {
                '%sbj': sbj
              };
              pod[prd] = obj;
              last_sbj = sbj;
            }
          }
          if (end != null) {
            if (last_sbj != null) {
              send([last_sbj, 'pod', pod]);
            }
            return end();
          }
        };
      })(this));
    };
    return step((function(_this) {
      return function*(resume) {
        var input, prefix;
        (yield _this._feed_test_data(db, probes_idx, resume));
        prefix = ['spo'];
        input = HOLLERITH.create_phrasestream(db, {
          prefix: prefix
        });
        return input.pipe($shorten_spo()).pipe($consolidate()).pipe(D.$show()).pipe(HOLLERITH.$write(db)).pipe(D.$on_end(done));
      };
    })(this));
  };


  /*
  #-----------------------------------------------------------------------------------------------------------
  @[ "keep ordering and completeness in asynchronous streams" ] = ( T, T_done ) ->
    step ( resume ) =>
      idx     = 0
      input_A = D.create_throughstream()
      #.......................................................................................................
      input_B = input_A
        .pipe D.$stop_time "keep ordering and completeness in asynchronous streams"
        .pipe $async ( data, done ) ->
          dt = CND.random_number 0.5, 1.5
           * debug '©WscFi', data, dt
          after dt, =>
            warn "send #{rpr data}"
            done data
        .pipe $ ( data, send ) ->
          help "read #{rpr data}"
          T.eq data, idx
          idx += +1
          send data
        .pipe D.$on_end =>
          T_done()
      #.......................................................................................................
      write = ->
        for n in [ 0 .. 10 ]
           * help "write #{n}"
          input_A.write n
          yield after 0.1, resume
        input_A.end()
      #.......................................................................................................
      write()
   */

  this["read phrases in lockstep"] = function(T, done) {
    var probes_idx;
    probes_idx = 2;
    return step((function(_this) {
      return function*(resume) {
        var input_1, input_2, input_3;
        (yield _this._feed_test_data(db, probes_idx, resume));
        input_1 = HOLLERITH.create_phrasestream(db, {
          prefix: ['pos', 'strokecount']
        });
        input_2 = HOLLERITH.create_phrasestream(db, {
          prefix: ['pos', 'componentcount']
        });
        input_3 = HOLLERITH.create_phrasestream(db, {
          prefix: ['pos', 'components']
        });
        return input_1.pipe(D.$lockstep(input_2, {
          fallback: null
        })).pipe(D.$lockstep(input_3, {
          fallback: null
        })).pipe($(function(data, send) {
          help(JSON.stringify(data));
          return send(data);
        })).pipe(D.$on_end(done));
      };
    })(this));
  };

  this["has_any yields existence of key"] = function(T, done) {
    var probes_and_matchers, probes_idx;
    probes_idx = 2;
    probes_and_matchers = [[['spo', '形', 'strokecount'], true], [['spo', '丁', 'componentcount'], true], [['spo', '三', 'componentcount'], true], [['spo', '夫', 'componentcount'], true], [['spo', '國', 'componentcount'], true], [['spo', '形', 'componentcount'], true], [['spo', '丁', 'components'], true], [['spo', '丁', 'xxxx'], false], [['spo', '丁'], true], [['spo'], true], [['xxx'], false]];
    return step((function(_this) {
      return function*(resume) {
        var i, len, matcher, probe, ref;
        (yield _this._feed_test_data(db, probes_idx, resume));
        for (i = 0, len = probes_and_matchers.length; i < len; i++) {
          ref = probes_and_matchers[i], probe = ref[0], matcher = ref[1];
          T.eq(matcher, (yield HOLLERITH.has_any(db, {
            prefix: probe
          }, resume)));
        }
        return done();
      };
    })(this));
  };

  this["$write rejects duplicate S/P pairs"] = function(T, done) {
    var probes_idx;
    probes_idx = 2;
    return step((function(_this) {
      return function*(resume) {
        var try_writing;
        (yield _this._feed_test_data(db, probes_idx, resume));
        try_writing = function() {
          var input;
          input = D.create_throughstream();
          input.pipe(D.$show()).pipe(HOLLERITH.$write(db)).pipe(D.$on_end(function() {
            T.fail("should never be called");
            return done();
          }));
          input.write(['形', 'strokecount', 1234]);
          return input.end();
        };
        return D.run(try_writing, function(error) {
          T.eq("S/P pair already in DB: [ '形', 'strokecount' ]", error['message']);
          return done();
        });
      };
    })(this));
  };

  this["codec accepts long keys"] = function(T, done) {
    var long_text, probes, probes_idx;
    probes_idx = 2;
    probes = [];
    long_text = (new Array(1025)).join('#');
    probes.push(['foo', [long_text, long_text, long_text, long_text], 42]);
    return step((function(_this) {
      return function*(resume) {
        var try_writing;
        (yield _this._feed_test_data(db, probes_idx, resume));
        try_writing = function() {
          var i, input, len, probe;
          input = D.create_throughstream();
          input.pipe(HOLLERITH.$write(db)).pipe(D.$on_end(function() {
            T.eq(1, 1);
            return done();
          }));
          for (i = 0, len = probes.length; i < len; i++) {
            probe = probes[i];
            input.write(probe);
          }
          return input.end();
        };
        return D.run(try_writing, function(error) {
          T.fail("should not throw error");
          warn(error);
          return done();
        });
      };
    })(this));
  };

  this["write private types (1)"] = function(T, done) {
    var count, idx, matchers, probes_idx, read_data, write_data;
    probes_idx = 5;
    idx = -1;
    count = 0;
    matchers = [
      ["pos", "componentcount", 1, "丁"], ["pos", "components", "丁", "丁", 0], [
        "pos", "mtime", 123456789, {
          "type": "route",
          "value": "/foo/bar"
        }
      ], ["pos", "strokecount", 2, "丁"], ["spo", "丁", "componentcount", 1], ["spo", "丁", "components", ["丁"]], ["spo", "丁", "strokecount", 2], [
        "spo", {
          "type": "route",
          "value": "/foo/bar"
        }, "mtime", 123456789
      ]
    ];
    write_data = (function(_this) {
      return function(handler) {
        var i, input, len, probe, ref;
        input = D.create_throughstream();
        input.pipe(HOLLERITH.$write(db)).pipe(D.$on_end(function() {
          return handler();
        }));
        ref = _this._feed_test_data.probes[probes_idx];
        for (i = 0, len = ref.length; i < len; i++) {
          probe = ref[i];
          input.write(probe);
        }
        return input.end();
      };
    })(this);
    read_data = function(handler) {
      var input;
      input = HOLLERITH.create_phrasestream(db);
      return input.pipe($((function(_this) {
        return function(phrase, send) {
          count += +1;
          idx += +1;
          debug('©Sc5FG', JSON.stringify(phrase));
          return T.eq(phrase, matchers[idx]);
        };
      })(this))).pipe(D.$on_end(function() {
        return handler();
      }));
    };
    return step((function(_this) {
      return function*(resume) {
        (yield HOLLERITH.clear(db, resume));
        (yield write_data(resume));
        (yield read_data(resume));
        return done();
      };
    })(this));
  };

  this["write private types (2)"] = function(T, done) {
    var count, encoder, idx, matchers, probes_idx, read_data, write_data, xdb, xdb_route, xdb_settings;
    probes_idx = 5;
    idx = -1;
    count = 0;
    encoder = function(type, value) {
      debug('©XXX-encoder', type, rpr(value));
      if (type === 'route') {
        return value.split('/');
      }
      throw new Error("unknown private type " + (rpr(type)));
    };
    xdb_route = join(__dirname, '..', 'dbs/tests-with-private-types');
    xdb_settings = {
      size: 500,
      encoder: encoder
    };
    xdb = HOLLERITH.new_db(xdb_route, xdb_settings);
    matchers = [
      ["pos", "componentcount", 1, "丁"], ["pos", "components", "丁", "丁", 0], [
        "pos", "mtime", 123456789, {
          "type": "route",
          "value": ["", "foo", "bar"]
        }
      ], ["pos", "strokecount", 2, "丁"], ["spo", "丁", "componentcount", 1], ["spo", "丁", "components", ["丁"]], ["spo", "丁", "strokecount", 2], [
        "spo", {
          "type": "route",
          "value": ["", "foo", "bar"]
        }, "mtime", 123456789
      ]
    ];
    write_data = (function(_this) {
      return function(handler) {
        var i, input, len, probe, ref;
        input = D.create_throughstream();
        input.pipe(HOLLERITH.$write(xdb)).pipe(D.$on_end(function() {
          return handler();
        }));
        ref = _this._feed_test_data.probes[probes_idx];
        for (i = 0, len = ref.length; i < len; i++) {
          probe = ref[i];
          input.write(probe);
        }
        return input.end();
      };
    })(this);
    read_data = function(handler) {
      var input;
      input = HOLLERITH.create_phrasestream(xdb);
      return input.pipe($((function(_this) {
        return function(phrase, send) {
          count += +1;
          idx += +1;
          debug('©Sc5FG', JSON.stringify(phrase));
          return T.eq(phrase, matchers[idx]);
        };
      })(this))).pipe(D.$on_end(function() {
        return handler();
      }));
    };
    return step((function(_this) {
      return function*(resume) {
        (yield HOLLERITH.clear(xdb, resume));
        (yield write_data(resume));
        (yield read_data(resume));
        (yield xdb['%self'].close(resume));
        return done();
      };
    })(this));
  };

  this["write private types (3)"] = function(T, done) {
    var count, decoder, encoder, idx, matchers, probes_idx, read_data, write_data, xdb, xdb_route, xdb_settings;
    probes_idx = 5;
    idx = -1;
    count = 0;
    encoder = function(type, value) {
      if (type === 'route') {
        return value.split('/');
      }
      throw new Error("unknown private type " + (rpr(type)));
    };
    decoder = function(type, value) {
      if (type === 'route') {
        return value.join('/');
      }
      throw new Error("unknown private type " + (rpr(type)));
    };
    xdb_route = join(__dirname, '..', 'dbs/tests-with-private-types');
    xdb_settings = {
      size: 500,
      encoder: encoder,
      decoder: decoder
    };
    xdb = HOLLERITH.new_db(xdb_route, xdb_settings);
    matchers = [["pos", "componentcount", 1, "丁"], ["pos", "components", "丁", "丁", 0], ["pos", "mtime", 123456789, "/foo/bar"], ["pos", "strokecount", 2, "丁"], ["spo", "丁", "componentcount", 1], ["spo", "丁", "components", ["丁"]], ["spo", "丁", "strokecount", 2], ["spo", "/foo/bar", "mtime", 123456789]];
    write_data = (function(_this) {
      return function(handler) {
        var i, input, len, probe, ref;
        input = D.create_throughstream();
        input.pipe(HOLLERITH.$write(xdb)).pipe(D.$on_end(function() {
          return handler();
        }));
        ref = _this._feed_test_data.probes[probes_idx];
        for (i = 0, len = ref.length; i < len; i++) {
          probe = ref[i];
          input.write(probe);
        }
        return input.end();
      };
    })(this);
    read_data = function(handler) {
      var input;
      input = HOLLERITH.create_phrasestream(xdb);
      return input.pipe($((function(_this) {
        return function(phrase, send) {
          count += +1;
          idx += +1;
          urge('©Sc5FG', JSON.stringify(phrase));
          return T.eq(phrase, matchers[idx]);
        };
      })(this))).pipe(D.$on_end(function() {
        return handler();
      }));
    };
    return step((function(_this) {
      return function*(resume) {
        (yield HOLLERITH.clear(xdb, resume));
        (yield write_data(resume));
        (yield read_data(resume));
        (yield xdb['%self'].close(resume));
        return done();
      };
    })(this));
  };

  this["bloom filter serialization without writes"] = function(T, done) {
    var input, xdb;
    xdb = HOLLERITH.new_db(get_new_db_name());
    input = HOLLERITH.create_phrasestream(xdb);
    input.pause();
    input.pipe(HOLLERITH.$write(xdb));
    input.resume();
    input.end();
    T.ok(true);
    return done();
  };

  this["use non-string subjects in phrases (1)"] = function(T, done) {
    var show, write_data;
    write_data = function(handler) {
      var input;
      input = D.create_throughstream();
      input.pipe(HOLLERITH.$write(db)).pipe(D.$on_end(function() {
        return handler();
      }));
      input.write(['千', 'guide/kwic/v3/sortcode', [[['0686f---', null], '千', [], []]]]);
      input.write(['于', 'guide/kwic/v3/sortcode', [[['0019f---', null], '于', [], []]]]);
      input.write(['干', 'guide/kwic/v3/sortcode', [[['0020f---', null], '干', [], []]]]);

      /* Three phrases to register '千 looks similar to both 于 and 干': */
      input.write(['千', 'shape/similarity', ['于', '干']]);
      input.write(['于', 'shape/similarity', ['干', '千']]);
      input.write(['干', 'shape/similarity', ['千', '于']]);

      /* The same as the above, experimentally using nested phrases whose subject is itself a phrase: */
      input.write([['千', 'shape/similarity', ['于', '干']], 'guide/kwic/v3/sortcode', [[['0686f---', null], '千', [], []]]]);
      input.write([['于', 'shape/similarity', ['千', '干']], 'guide/kwic/v3/sortcode', [[['0019f---', null], '于', [], []]]]);
      input.write([['干', 'shape/similarity', ['千', '于']], 'guide/kwic/v3/sortcode', [[['0020f---', null], '干', [], []]]]);

      /* Two sub-factorial renderings of 千 as 亻一 and 丿十: */
      input.write(['亻', 'guide/kwic/v3/sortcode', [[['0774f---', null], '亻', [], []]]]);
      input.write(['一', 'guide/kwic/v3/sortcode', [[['0000f---', null], '一', [], []]]]);
      input.write(['丿', 'guide/kwic/v3/sortcode', [[['0645f---', null], '丿', [], []]]]);
      input.write(['十', 'guide/kwic/v3/sortcode', [[['0104f---', null], '十', [], []]]]);
      input.write([['千', 'guide/lineup/uchr', '亻一'], 'guide/kwic/v3/sortcode', [[['0774f---', '0000f---', null], ['亻', ['一'], []]], [['0000f---', null, '0774f---'], ['一', [], ['亻']]]]]);
      input.write([['千', 'guide/lineup/uchr', '丿十'], 'guide/kwic/v3/sortcode', [[['0645f---', '0104f---', null], ['丿', ['十'], []]], [['0104f---', null, '0645f---'], ['十', [], ['丿']]]]]);
      return input.end();
    };
    show = function(handler) {
      var input;
      input = HOLLERITH.create_phrasestream(db);
      return input.pipe(D.$observe((function(_this) {
        return function(phrase) {
          return info(JSON.stringify(phrase));
        };
      })(this))).pipe(D.$on_end(function() {
        return handler();
      }));
    };
    return step((function(_this) {
      return function*(resume) {
        (yield clear_leveldb(db['%self'], resume));
        (yield write_data(resume));
        (yield show(resume));
        return done();
      };
    })(this));
  };

  this["use non-string subjects in phrases (2)"] = function(T, done) {
    var show, write_data;
    write_data = function(handler) {
      var input;
      input = D.create_throughstream();
      input.pipe(HOLLERITH.$write(db)).pipe(D.$on_end(function() {
        return handler();
      }));
      input.write(['千', 'reading/py/base', ['qian']]);
      input.write(['于', 'reading/py/base', ['yu']]);
      input.write(['干', 'reading/py/base', ['gan']]);

      /* Three phrases to register '千 looks similar to both 于 and 干': */
      input.write(['千', 'shape/similarity', ['于', '干']]);
      input.write(['于', 'shape/similarity', ['干', '千']]);
      input.write(['干', 'shape/similarity', ['千', '于']]);

      /* The same as the above, experimentally using nested phrases whose subject is itself a phrase: */
      input.write([['千', 'shape/similarity', ['于', '干'], 0], 'reading/py/base', ['qian']]);
      input.write([['于', 'shape/similarity', ['千', '干'], 0], 'reading/py/base', ['yu']]);
      input.write([['干', 'shape/similarity', ['千', '于'], 0], 'reading/py/base', ['gan']]);
      input.write([['千', 'reading/py/base', ['qian'], 0], 'shape/similarity', ['于', '干']]);
      input.write([['于', 'reading/py/base', ['yu'], 0], 'shape/similarity', ['千', '干']]);
      input.write([['干', 'reading/py/base', ['gan'], 0], 'shape/similarity', ['千', '于']]);
      return input.end();
    };
    show = function(handler) {
      var input;
      input = HOLLERITH.create_phrasestream(db);
      return input.pipe(D.$observe((function(_this) {
        return function(phrase) {
          return info(JSON.stringify(phrase));
        };
      })(this))).pipe(D.$on_end(function() {
        return handler();
      }));
    };
    return step((function(_this) {
      return function*(resume) {
        (yield clear_leveldb(db['%self'], resume));
        (yield write_data(resume));
        (yield show(resume));
        return done();
      };
    })(this));
  };

  this["use non-string subjects in phrases (3)"] = function(T, done) {
    var show, write_data;
    write_data = function(handler) {
      var input;
      input = D.create_throughstream();
      input.pipe(HOLLERITH.$write(db)).pipe(D.$on_end(function() {
        return handler();
      }));

      /* Readings for 3 glyphs: */
      input.write([['千'], 'reading/py/base', ['qian']]);
      input.write([['于'], 'reading/py/base', ['yu']]);
      input.write([['干'], 'reading/py/base', ['gan']]);

      /* Three phrases to register '千 looks similar to both 于 and 干': */
      input.write([['千'], 'shape/similarity', ['于', '干']]);
      input.write([['于'], 'shape/similarity', ['干', '千']]);
      input.write([['干'], 'shape/similarity', ['千', '于']]);

      /* The same as the above, experimentally using nested phrases whose subject is itself a phrase: */

      /* (1) these will lead from reading to similarity, as in
        `["pos","reading/py/base","gan",["干","shape/similarity",["千","于"]],0]`, meaning these phrases
        are suitable for building a dictionary organzed by Pinyin readings with cross-references
        to similar characters:
       */
      input.write([['千', 'shape/similarity', ['于', '干']], 'reading/py/base', ['qian']]);
      input.write([['于', 'shape/similarity', ['千', '干']], 'reading/py/base', ['yu']]);
      input.write([['干', 'shape/similarity', ['千', '于']], 'reading/py/base', ['gan']]);

      /* (2) these will lead from similarity to reading, as in
        `["pos","shape/similarity","于",["千","reading/py/base",["qian"]],0]`
       */
      input.write([['千', 'reading/py/base', ['qian']], 'shape/similarity', ['于', '干']]);
      input.write([['于', 'reading/py/base', ['yu']], 'shape/similarity', ['千', '干']]);
      input.write([['干', 'reading/py/base', ['gan']], 'shape/similarity', ['千', '于']]);
      return input.end();
    };
    show = function(handler) {
      var input;
      input = HOLLERITH.create_phrasestream(db);
      return input.pipe(D.$observe((function(_this) {
        return function(phrase) {
          return info(JSON.stringify(phrase));
        };
      })(this))).pipe(D.$on_end(function() {
        return handler();
      }));
    };
    return step((function(_this) {
      return function*(resume) {
        (yield clear_leveldb(db['%self'], resume));
        (yield write_data(resume));
        (yield show(resume));
        return done();
      };
    })(this));
  };

  this["use non-string subjects in phrases (4)"] = function(T, done) {
    var show, write_data;
    write_data = function(handler) {
      var input;
      input = D.create_throughstream();
      input.pipe(HOLLERITH.$write(db)).pipe(D.$on_end(function() {
        return handler();
      }));

      /* Readings for 3 glyphs: */
      input.write([['千'], 'reading/py/base', ['qian']]);
      input.write([['于'], 'reading/py/base', ['yu']]);
      input.write([['干'], 'reading/py/base', ['gan']]);
      input.write([['人'], 'reading/py/base', ['ren']]);

      /* Three phrases to register '千 looks similar to both 于 and 干': */

      /* The same as the above, experimentally using nested phrases whose subject is itself a phrase: */

      /* (1) these will lead from reading to similarity, as in
        `["pos","reading/py/base","gan",["干","shape/similarity",["千","于"]],0]`, meaning these phrases
        are suitable for building a dictionary organzed by Pinyin readings with cross-references
        to similar characters:
       */
      input.write([['千', 'shape/similarity', '于'], 'reading/py/base', 'qian']);
      input.write([['千', 'shape/similarity', '干'], 'reading/py/base', 'qian']);
      input.write([['于', 'shape/similarity', '千'], 'reading/py/base', 'yu']);
      input.write([['于', 'shape/similarity', '干'], 'reading/py/base', 'yu']);
      input.write([['干', 'shape/similarity', '千'], 'reading/py/base', 'gan']);
      input.write([['干', 'shape/similarity', '于'], 'reading/py/base', 'gan']);
      return input.end();
    };
    show = function(handler) {
      var input, query;
      query = {
        prefix: ['pos'],
        star: '*'
      };
      input = HOLLERITH.create_phrasestream(db);
      return input.pipe(D.$observe((function(_this) {
        return function(phrase) {
          return info(JSON.stringify(phrase));
        };
      })(this))).pipe(D.$on_end(function() {
        return handler();
      }));
    };
    return step((function(_this) {
      return function*(resume) {
        (yield clear_leveldb(db['%self'], resume));
        (yield write_data(resume));
        (yield show(resume));
        return done();
      };
    })(this));
  };

  this["Pinyin Unicode Sorting"] = function(T, done) {
    var show, write_data;
    write_data = function(handler) {
      var input;
      input = D.create_throughstream();
      input.pipe(HOLLERITH.$write(db)).pipe(D.$on_end(function() {
        return handler();
      }));
      input.write(['01', 'reading', 'ā']);
      input.write(['02', 'reading', 'ɑ̄']);
      input.write(['03', 'reading', 'ē']);
      input.write(['04', 'reading', 'ī']);
      input.write(['05', 'reading', 'ō']);
      input.write(['06', 'reading', 'ū']);
      input.write(['07', 'reading', 'ǖ']);
      input.write(['08', 'reading', 'Ā']);
      input.write(['09', 'reading', 'Ē']);
      input.write(['10', 'reading', 'Ī']);
      input.write(['11', 'reading', 'Ō']);
      input.write(['12', 'reading', 'Ū']);
      input.write(['13', 'reading', 'Ǖ']);
      input.write(['14', 'reading', 'á']);
      input.write(['15', 'reading', 'ɑ́']);
      input.write(['16', 'reading', 'é']);
      input.write(['17', 'reading', 'í']);
      input.write(['18', 'reading', 'ó']);
      input.write(['19', 'reading', 'ú']);
      input.write(['20', 'reading', 'ǘ']);
      input.write(['21', 'reading', 'Á']);
      input.write(['22', 'reading', 'É']);
      input.write(['23', 'reading', 'Í']);
      input.write(['24', 'reading', 'Ó']);
      input.write(['25', 'reading', 'Ú']);
      input.write(['26', 'reading', 'Ǘ']);
      input.write(['27', 'reading', 'ǎ']);
      input.write(['28', 'reading', 'ɑ̌']);
      input.write(['29', 'reading', 'ě']);
      input.write(['30', 'reading', 'ǐ']);
      input.write(['31', 'reading', 'ǒ']);
      input.write(['32', 'reading', 'ǔ']);
      input.write(['33', 'reading', 'ǚ']);
      input.write(['34', 'reading', 'Ǎ']);
      input.write(['35', 'reading', 'Ě']);
      input.write(['36', 'reading', 'Ǐ']);
      input.write(['37', 'reading', 'Ǒ']);
      input.write(['38', 'reading', 'Ǔ']);
      input.write(['39', 'reading', 'Ǚ']);
      input.write(['40', 'reading', 'à']);
      input.write(['41', 'reading', 'ɑ̀']);
      input.write(['42', 'reading', 'è']);
      input.write(['43', 'reading', 'ì']);
      input.write(['44', 'reading', 'ò']);
      input.write(['45', 'reading', 'ù']);
      input.write(['46', 'reading', 'ǜ']);
      input.write(['47', 'reading', 'À']);
      input.write(['48', 'reading', 'È']);
      input.write(['49', 'reading', 'Ì']);
      input.write(['50', 'reading', 'Ò']);
      input.write(['51', 'reading', 'Ù']);
      input.write(['52', 'reading', 'Ǜ']);
      input.write(['53', 'reading', 'a']);
      input.write(['54', 'reading', 'ɑ']);
      input.write(['55', 'reading', 'e']);
      input.write(['56', 'reading', 'i']);
      input.write(['57', 'reading', 'o']);
      input.write(['58', 'reading', 'u']);
      input.write(['59', 'reading', 'ü']);
      input.write(['60', 'reading', 'A']);
      input.write(['61', 'reading', 'Ɑ']);
      input.write(['62', 'reading', 'E']);
      input.write(['63', 'reading', 'I']);
      input.write(['64', 'reading', 'O']);
      input.write(['65', 'reading', 'U']);
      input.write(['66', 'reading', 'Ü']);
      return input.end();
    };
    show = function(handler) {
      var input, query;
      query = {
        prefix: ['pos'],
        star: '*'
      };
      input = HOLLERITH.create_phrasestream(db, query);
      return input.pipe((function(_this) {
        return function() {
          var collector;
          collector = [];
          return $(function(phrase, send, end) {
            var _, letter;
            if (phrase != null) {
              _ = phrase[0], _ = phrase[1], letter = phrase[2], _ = phrase[3];
              collector.push(letter);
            }
            if (end != null) {
              urge(collector = collector.join(''));
              T.eq(collector, 'AEIOUaeiouÀÁÈÉÌÍÒÓÙÚÜàáèéìíòóùúüĀāĒēĚěĪīŌōŪūǍǎǏǐǑǒǓǔǕǖǗǘǙǚǛǜɑɑ̀ɑ́ɑ̄ɑ̌Ɑ');
              return end();
            }
          });
        };
      })(this)()).pipe(D.$observe((function(_this) {
        return function(phrase) {
          return info(JSON.stringify(phrase));
        };
      })(this))).pipe(D.$on_end(function() {
        return handler();
      }));
    };
    return step((function(_this) {
      return function*(resume) {
        (yield clear_leveldb(db['%self'], resume));
        (yield write_data(resume));
        (yield show(resume));
        return done();
      };
    })(this));
  };

  this._prune = function() {
    var name, value;
    for (name in this) {
      value = this[name];
      if (name.startsWith('_')) {
        continue;
      }
      if (indexOf.call(include, name) < 0) {
        delete this[name];
      }
    }
    return null;
  };

  if (module.parent == null) {
    include = ['use non-string subjects in phrases (2)', 'use non-string subjects in phrases (3)', 'use non-string subjects in phrases (4)', "Pinyin Unicode Sorting"];
    this._prune();
    this._main();
  }

}).call(this);

//# sourceMappingURL=../sourcemaps/tests.js.map
