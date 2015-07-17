
/* https://github.com/ddopson/node-segfault-handler */

(function() {
  var $, $async, CND, CODEC, D, HOLLERITH, SegfaultHandler, after, alert, badge, clear_leveldb, db, debug, echo, get_new_db_name, help, info, join, later, leveldown, levelup, log, njs_path, read_all_keys, rpr, show_db_entries, show_keys_and_key_bfrs, step, suspend, test, urge, warn, whisper, ƒ;

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

  D = require('pipedreams2');

  $ = D.remit.bind(D);

  $async = D.remit_async.bind(D);

  HOLLERITH = require('./main');

  db = null;

  levelup = require('level');

  leveldown = require('level/node_modules/leveldown');

  CODEC = require('./codec');

  ƒ = CND.format_number;

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
        debug('©7lEgy', db['%self'].isClosed());
        debug('©7lEgy', db['%self'].isOpen());
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
        var NULL, count, i, idx, input, probe_idx, query;
        (yield HOLLERITH.clear(db, resume));

        /* TAINT awaiting better solution */
        NULL = HOLLERITH._encode_value(db, 1);
        for (idx = i = 0; i < 10; idx = ++i) {
          db['%self'].put(HOLLERITH._encode_key(db, ['x', idx, 'x']), NULL);
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
    T.throws("expected a list, got a jsundefined", (function() {
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
          return debug('©GJfL6', HOLLERITH.DUMP.rpr_of_buffer(db, buffer));
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
        return input.pipe($shorten_spo()).pipe($consolidate()).pipe(D.$show()).pipe(HOLLERITH.$write(db)).pipe(D.$on_end(function() {
          return debug('©Lqzy1', '...');
        }));
      };
    })(this));
  };

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

  if (module.parent == null) {
    this._main();
  }

}).call(this);

//# sourceMappingURL=../sourcemaps/tests.js.map