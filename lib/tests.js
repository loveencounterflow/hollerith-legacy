(function() {
  var $, BYTEWISE, CND, CODEC, D, HOLLERITH, after, alert, badge, clear_leveldb, db, debug, echo, get_new_db_name, help, info, join, leveldown, levelup, log, njs_path, read_all_keys, rpr, show_keys_and_key_bfrs, step, suspend, test, urge, warn, whisper;

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

  test = require('guy-test');

  D = require('pipedreams2');

  $ = D.remit.bind(D);

  HOLLERITH = require('./main');

  db = null;

  BYTEWISE = require('bytewise');

  levelup = require('levelup');

  leveldown = require('leveldown');

  CODEC = require('./codec');

  this._feed_test_data = function(db, probes_idx, handler) {
    switch (probes_idx) {
      case 0:
      case 2:
        step((function(_this) {
          return function*(resume) {
            var i, input, len, probe, ref;
            (yield HOLLERITH.clear(db, resume));
            input = D.create_throughstream();
            input.pipe(HOLLERITH.$write(db, 3)).pipe(D.$on_end(function() {
              urge("test data written");
              return handler(null);
            }));
            ref = _this._feed_test_data.probes[probes_idx];
            for (i = 0, len = ref.length; i < len; i++) {
              probe = ref[i];
              input.write(probe);
            }
            return input.end();
          };
        })(this));
        break;
      case 1:
        step((function(_this) {
          return function*(resume) {
            var i, input, key, len, ref, url_key;
            (yield HOLLERITH.clear(db, resume));
            input = D.create_throughstream();
            input.pipe(HOLLERITH.$write(db, 3)).pipe(D.$on_end(function() {
              urge("test data written");
              return handler(null);
            }));
            ref = _this._feed_test_data.probes[probes_idx];
            for (i = 0, len = ref.length; i < len; i++) {
              url_key = ref[i];
              key = HOLLERITH.key_from_url(db, url_key);
              input.write(key);
            }
            return input.end();
          };
        })(this));
        break;
      default:
        return handler(new Error("illegal probes index " + (rpr(probes_idx))));
    }
    return null;
  };

  this._feed_test_data.probes = [];

  this._feed_test_data.probes.push([['𧷟1', 'guide/lineup/length', 1], ['𧷟2', 'guide/lineup/length', 2], ['𧷟3', 'guide/lineup/length', 3], ['𧷟4', 'guide/lineup/length', 4], ['𧷟', 'guide/lineup/length', 5], ['𧷟6', 'guide/lineup/length', 6], ['𧷟', 'cp/cid', 163295], ['𧷟', 'guide/uchr/has', ['八', '刀', '宀', '', '貝']], ['𧷟', 'rank/cjt', 5432], ['八', 'factor/strokeclass/wbf', '34'], ['刀', 'factor/strokeclass/wbf', '5(12)3'], ['宀', 'factor/strokeclass/wbf', '44'], ['', 'factor/strokeclass/wbf', '12'], ['貝', 'factor/strokeclass/wbf', '25(12)'], ['八', 'rank/cjt', 12541], ['刀', 'rank/cjt', 12542], ['宀', 'rank/cjt', 12543], ['', 'rank/cjt', 12544], ['貝', 'rank/cjt', 12545]]);

  this._feed_test_data.probes.push(['so|glyph:劬|cp/fncr:u-cjk/52ac|0', 'so|glyph:邭|cp/fncr:u-cjk/90ad|0', 'so|glyph:𠴦|cp/fncr:u-cjk-xb/20d26|0', 'so|glyph:𤿯|cp/fncr:u-cjk-xb/24fef|0', 'so|glyph:𧑴|cp/fncr:u-cjk-xb/27474|0', 'so|glyph:𨒡|cp/fncr:u-cjk-xb/284a1|0', 'so|glyph:𪚧|cp/fncr:u-cjk-xb/2a6a7|0', 'so|glyph:𪚫|cp/fncr:u-cjk-xb/2a6ab|0', 'so|glyph:𤿯|strokeorder:352513553254|0', 'so|glyph:𠴦|strokeorder:3525141121|0', 'so|glyph:𨒡|strokeorder:35251454|0', 'so|glyph:邭|strokeorder:3525152|0', 'so|glyph:𪚫|strokeorder:352515251115115113541|0', 'so|glyph:𪚧|strokeorder:35251525112511511|0', 'so|glyph:𧑴|strokeorder:352515251214251214|0', 'so|glyph:劬|strokeorder:3525153|0']);

  this._feed_test_data.probes.push([['丁', 'strokecount', 2], ['三', 'strokecount', 3], ['夫', 'strokecount', 5], ['國', 'strokecount', 11], ['形', 'strokecount', 7], ['丁', 'componentcount', 1], ['三', 'componentcount', 1], ['夫', 'componentcount', 1], ['國', 'componentcount', 4], ['形', 'componentcount', 2], ['丁', 'components', ['丁']], ['三', 'components', ['三']], ['夫', 'components', ['夫']], ['國', 'components', ['囗', '戈', '口', '一']], ['形', 'components', ['开', '彡']]]);

  this["write without error"] = function(T, done) {
    var idx, probes_idx;
    probes_idx = 0;
    idx = -1;
    return step((function(_this) {
      return function*(resume) {
        (yield _this._feed_test_data(db, probes_idx, resume));
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
        })).pipe(D.$on_end(function() {
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
        })).pipe(D.$on_end(function() {
          T.eq(count, 1);
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
        input = HOLLERITH.create_facetstream(db, prefix);
        return input.pipe($(function(facet, send) {
          var key, value;
          count += 1;
          key = facet[0], value = facet[1];
          return T.eq(key[1], probe_idx);
        })).pipe(D.$on_end(function() {
          T.eq(count, 1);
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
        })).pipe(D.$on_end(function() {
          T.eq(count, delta + 1);
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
        input = HOLLERITH.create_facetstream(db, lo, hi);
        return input.pipe($(function(arg, send) {
          var key, value;
          key = arg[0], value = arg[1];
          count += 1;
          return T.eq(key[1], probe_idx + count - 1);
        })).pipe(D.$on_end(function() {
          T.eq(count, delta + 1);
          return done();
        }));
      };
    })(this));
  };

  this["create_facetstream throws with wrong arguments"] = function(T, done) {
    var message;
    message = "must give `lo_hint` when `hi_hint` is given";
    T.throws(message, (function() {
      return HOLLERITH.create_facetstream(db, null, ['xxx']);
    }));
    return done();
  };

  this["read POS facets"] = function(T, done) {
    var idx, key_matchers, phrase_matchers, probes_idx;
    probes_idx = 0;
    idx = -1;
    key_matchers = [['pos', 'guide/lineup/length', 2, '𧷟2'], ['pos', 'guide/lineup/length', 3, '𧷟3'], ['pos', 'guide/lineup/length', 4, '𧷟4']];
    phrase_matchers = [['𧷟2', 'guide/lineup/length', 2], ['𧷟3', 'guide/lineup/length', 3], ['𧷟4', 'guide/lineup/length', 4]];
    return step((function(_this) {
      return function*(resume) {
        var hi, input, lo;
        (yield _this._feed_test_data(db, probes_idx, resume));
        lo = ['pos', 'guide/lineup/length', 2];
        hi = ['pos', 'guide/lineup/length', 4];
        input = HOLLERITH.create_facetstream(db, lo, hi);
        return input.pipe($(function(arg, send) {
          var key, phrase, value;
          key = arg[0], value = arg[1];
          idx += +1;
          phrase = HOLLERITH.as_phrase(db, key, value);
          T.eq(key, key_matchers[idx]);
          return T.eq(phrase, phrase_matchers[idx]);
        })).pipe(D.$on_end(function() {
          return done();
        }));
      };
    })(this));
  };

  this["read POS phrases (1)"] = function(T, done) {
    var idx, matchers, probes_idx;
    probes_idx = 0;
    idx = -1;
    matchers = [['𧷟2', 'guide/lineup/length', 2], ['𧷟3', 'guide/lineup/length', 3], ['𧷟4', 'guide/lineup/length', 4]];
    return step((function(_this) {
      return function*(resume) {
        var hi, input, lo;
        (yield _this._feed_test_data(db, probes_idx, resume));
        lo = ['pos', 'guide/lineup/length', 2];
        hi = ['pos', 'guide/lineup/length', 4];
        input = HOLLERITH.create_phrasestream(db, lo, hi);
        return input.pipe($(function(phrase, send) {
          idx += +1;
          return T.eq(phrase, matchers[idx]);
        })).pipe(D.$on_end(function() {
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
    matchers = [['𧷟', 'guide/uchr/has', '八', 0], ['𧷟', 'guide/uchr/has', '刀', 1], ['𧷟', 'guide/uchr/has', '宀', 2], ['𧷟', 'guide/uchr/has', '貝', 4], ['𧷟', 'guide/uchr/has', '', 3]];
    return step((function(_this) {
      return function*(resume) {
        var input, prefix, settings;
        (yield _this._feed_test_data(db, probes_idx, resume));
        prefix = ['pos', 'guide/uchr/has'];
        input = HOLLERITH.create_phrasestream(db, prefix);
        settings = {
          indexed: false
        };
        return input.pipe($(function(phrase, send) {
          count += +1;
          idx += +1;
          return T.eq(phrase, matchers[idx]);
        })).pipe(D.$on_end(function() {
          T.eq(count, matchers.length);
          return done();
        }));
      };
    })(this));
  };

  this["read SPO phrases"] = function(T, done) {
    var count, idx, matchers, probes_idx;
    probes_idx = 0;
    idx = -1;
    count = 0;
    matchers = [['𧷟', 'cp/cid', 163295], ['𧷟', 'guide/lineup/length', 5], ['𧷟', 'guide/uchr/has', ['八', '刀', '宀', '', '貝']], ['𧷟', 'rank/cjt', 5432]];
    return step((function(_this) {
      return function*(resume) {
        var input, prefix;
        (yield _this._feed_test_data(db, probes_idx, resume));
        prefix = ['spo', '𧷟'];
        input = HOLLERITH.create_phrasestream(db, prefix);
        return input.pipe($(function(phrase, send) {
          debug('©DsAfY', rpr(phrase));
          count += +1;
          idx += +1;
          return T.eq(phrase, matchers[idx]);
        })).pipe(D.$on_end(function() {
          T.eq(count, matchers.length);
          return done();
        }));
      };
    })(this));
  };

  this["read with sub-read (1)"] = function(T, done) {
    var count, idx, matchers, probes_idx;
    probes_idx = 0;
    idx = -1;
    count = 0;
    matchers = [['𧷟', ['八', 'factor/strokeclass/wbf', '34']]];
    return step((function(_this) {
      return function*(resume) {
        var input, prefix, settings;
        (yield _this._feed_test_data(db, probes_idx, resume));
        prefix = ['spo', '𧷟', 'guide/uchr/has'];
        input = HOLLERITH.create_phrasestream(db, prefix);
        settings = {
          indexed: false
        };
        return input.pipe(HOLLERITH.read_sub(db, settings, function(arg) {
          var glyph, guides, prd, sub_input;
          glyph = arg[0], prd = arg[1], guides = arg[2];
          sub_input = HOLLERITH.create_phrasestream(db, ['spo', guides[0], 'factor/strokeclass/wbf']);
          return [glyph, sub_input];
        })).pipe($(function(phrase, send) {
          count += +1;
          idx += +1;
          return T.eq(phrase, matchers[idx]);
        })).pipe(D.$on_end(function() {
          T.eq(count, matchers.length);
          return done();
        }));
      };
    })(this));
  };

  this["read with sub-read (2)"] = function(T, done) {
    var count, idx, matchers, probes_idx;
    probes_idx = 0;
    idx = -1;
    count = 0;
    matchers = [['𧷟', ['八', 'factor/strokeclass/wbf', '34']], ['𧷟', ['刀', 'factor/strokeclass/wbf', '5(12)3']], ['𧷟', ['宀', 'factor/strokeclass/wbf', '44']], ['𧷟', ['貝', 'factor/strokeclass/wbf', '25(12)']], ['𧷟', ['', 'factor/strokeclass/wbf', '12']]];
    return step((function(_this) {
      return function*(resume) {
        var input, prefix, settings;
        (yield _this._feed_test_data(db, probes_idx, resume));
        prefix = ['pos', 'guide/uchr/has'];
        input = HOLLERITH.create_phrasestream(db, prefix);
        settings = {
          indexed: false
        };
        return input.pipe(HOLLERITH.read_sub(db, settings, function(phrase) {
          var glyph, guide, prd, sub_input;
          glyph = phrase[0], prd = phrase[1], guide = phrase[2];
          prefix = ['spo', guide, 'factor/strokeclass/wbf'];
          sub_input = HOLLERITH.create_phrasestream(db, prefix);
          return [glyph, sub_input];
        })).pipe($(function(phrase, send) {
          debug('©quPbg', JSON.stringify(phrase));
          count += +1;
          idx += +1;
          return T.eq(phrase, matchers[idx]);
        })).pipe(D.$on_end(function() {
          T.eq(count, matchers.length);
          return done();
        }));
      };
    })(this));
  };

  this["read with sub-read (3)"] = function(T, done) {
    var count, idx, matchers, probes_idx;
    probes_idx = 0;
    idx = -1;
    count = 0;
    matchers = [[["𧷟", "八", "34"], ["八", "rank/cjt", 12541]], [["𧷟", "刀", "5(12)3"], ["刀", "rank/cjt", 12542]], [["𧷟", "宀", "44"], ["宀", "rank/cjt", 12543]], [["𧷟", "貝", "25(12)"], ["貝", "rank/cjt", 12545]], [["𧷟", "", "12"], ["", "rank/cjt", 12544]]];
    return step((function(_this) {
      return function*(resume) {
        var input, prefix, settings;
        (yield _this._feed_test_data(db, probes_idx, resume));
        prefix = ['pos', 'guide/uchr/has'];
        input = HOLLERITH.create_phrasestream(db, prefix);
        settings = {
          indexed: false
        };
        return input.pipe(HOLLERITH.read_sub(db, settings, function(phrase) {
          var glyph, guide, prd, sub_input;
          glyph = phrase[0], prd = phrase[1], guide = phrase[2];
          prefix = ['spo', guide, 'factor/strokeclass/wbf'];
          sub_input = HOLLERITH.create_phrasestream(db, prefix);
          return [glyph, sub_input];
        })).pipe(HOLLERITH.read_sub(db, settings, function(xphrase) {
          var glyph, guide, prd, ref, shapeclass, sub_input;
          glyph = xphrase[0], (ref = xphrase[1], guide = ref[0], prd = ref[1], shapeclass = ref[2]);
          prefix = ['spo', guide, 'rank/cjt'];
          sub_input = HOLLERITH.create_phrasestream(db, prefix);
          return [[glyph, guide, shapeclass], sub_input];
        })).pipe($(function(xphrase, send) {
          debug('©quPbg', JSON.stringify(xphrase));
          count += +1;
          idx += +1;
          return T.eq(xphrase, matchers[idx]);
        })).pipe(D.$on_end(function() {
          T.eq(count, matchers.length);
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

  this["read sample data (1)"] = function(T, done) {
    var idx, probes_idx;
    probes_idx = 2;
    idx = -1;
    step((function(_this) {
      return function*(resume) {
        var input;
        (yield _this._feed_test_data(db, probes_idx, resume));
        input = db['%self'].createReadStream();
        return input.pipe($(function(arg, send) {
          var key, value;
          key = arg.key, value = arg.value;
          return send([key, value]);
        })).pipe($(function(arg, send) {
          var key, value;
          key = arg[0], value = arg[1];
          debug('©RluhF', HOLLERITH.CODEC.decode(key), JSON.parse(value));
          return send([key, value]);
        })).pipe(D.$collect()).pipe($(function(facets, send) {
          return help('\n' + HOLLERITH.DUMP.rpr_of_facets(db, facets));
        })).pipe(D.$on_end(function() {
          return done();
        }));
      };
    })(this));
    return null;
  };

  this["read partial POS phrases"] = function(T, done) {
    var count, idx, matchers, probes_idx;
    probes_idx = 0;
    idx = -1;
    count = 0;
    matchers = [['𧷟1', 'guide/lineup/length', 1], ['𧷟2', 'guide/lineup/length', 2], ['𧷟3', 'guide/lineup/length', 3], ['𧷟4', 'guide/lineup/length', 4], ['𧷟', 'guide/lineup/length', 5], ['𧷟6', 'guide/lineup/length', 6], ['𧷟', 'guide/uchr/has', '八', 0], ['𧷟', 'guide/uchr/has', '刀', 1], ['𧷟', 'guide/uchr/has', '宀', 2], ['𧷟', 'guide/uchr/has', '貝', 4], ['𧷟', 'guide/uchr/has', '', 3]];
    return step((function(_this) {
      return function*(resume) {
        var input, prefix, settings;
        (yield _this._feed_test_data(db, probes_idx, resume));
        prefix = ['pos', 'guide'];
        input = HOLLERITH.create_phrasestream(db, prefix, '*');
        debug('©FphJK', input['%meta']);
        settings = {
          indexed: false
        };
        return input.pipe($(function(phrase, send) {
          count += +1;
          idx += +1;
          return debug('©Sc5FG', phrase);
        })).pipe(D.$on_end(function() {
          T.eq(count, matchers.length);
          return done();
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
        (yield leveldown.destroy(route, resume));
        (yield leveldb.open(resume));
        return handler(null);
      };
    })(this));
  };

  this._main = function(handler) {
    db = HOLLERITH.new_db(join(__dirname, '..', 'dbs/tests'));
    return test(this, {
      'timeout': 2500
    });
  };

  if (module.parent == null) {
    this._main();
  }

}).call(this);

//# sourceMappingURL=data:application/json;base64,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RUFORztNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUwsRUFEYztFQUFBLENBbDdCaEIsQ0FBQTs7QUFBQSxFQTQ3QkEsSUFBQyxDQUFBLEtBQUQsR0FBUyxTQUFFLE9BQUYsR0FBQTtBQUNQLElBQUEsRUFBQSxHQUFLLFNBQVMsQ0FBQyxNQUFWLENBQWlCLElBQUEsQ0FBSyxTQUFMLEVBQWdCLElBQWhCLEVBQXNCLFdBQXRCLENBQWpCLENBQUwsQ0FBQTtXQUNBLElBQUEsQ0FBSyxJQUFMLEVBQVE7QUFBQSxNQUFBLFNBQUEsRUFBVyxJQUFYO0tBQVIsRUFGTztFQUFBLENBNTdCVCxDQUFBOztBQWk4QkEsRUFBQSxJQUFPLHFCQUFQO0FBQ0UsSUFBQSxJQUFDLENBQUEsS0FBRCxDQUFBLENBQUEsQ0FERjtHQWo4QkE7QUFBQSIsImZpbGUiOiJ0ZXN0cy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIlxuXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xubmpzX3BhdGggICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ3BhdGgnXG4jIG5qc19mcyAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdmcydcbmpvaW4gICAgICAgICAgICAgICAgICAgICAgPSBuanNfcGF0aC5qb2luXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkNORCAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdjbmQnXG5ycHIgICAgICAgICAgICAgICAgICAgICAgID0gQ05ELnJwclxuYmFkZ2UgICAgICAgICAgICAgICAgICAgICA9ICdIT0xMRVJJVEgvdGVzdHMnXG5sb2cgICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3BsYWluJywgICAgIGJhZGdlXG5pbmZvICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ2luZm8nLCAgICAgIGJhZGdlXG53aGlzcGVyICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3doaXNwZXInLCAgIGJhZGdlXG5hbGVydCAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ2FsZXJ0JywgICAgIGJhZGdlXG5kZWJ1ZyAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ2RlYnVnJywgICAgIGJhZGdlXG53YXJuICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3dhcm4nLCAgICAgIGJhZGdlXG5oZWxwICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ2hlbHAnLCAgICAgIGJhZGdlXG51cmdlICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3VyZ2UnLCAgICAgIGJhZGdlXG5lY2hvICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmVjaG8uYmluZCBDTkRcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuc3VzcGVuZCAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2NvZmZlZW5vZGUtc3VzcGVuZCdcbnN0ZXAgICAgICAgICAgICAgICAgICAgICAgPSBzdXNwZW5kLnN0ZXBcbmFmdGVyICAgICAgICAgICAgICAgICAgICAgPSBzdXNwZW5kLmFmdGVyXG4jIGV2ZW50dWFsbHkgICAgICAgICAgICAgICAgPSBzdXNwZW5kLmV2ZW50dWFsbHlcbiMgaW1tZWRpYXRlbHkgICAgICAgICAgICAgICA9IHN1c3BlbmQuaW1tZWRpYXRlbHlcbiMgcmVwZWF0X2ltbWVkaWF0ZWx5ICAgICAgICA9IHN1c3BlbmQucmVwZWF0X2ltbWVkaWF0ZWx5XG4jIGV2ZXJ5ICAgICAgICAgICAgICAgICAgICAgPSBzdXNwZW5kLmV2ZXJ5XG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnRlc3QgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdndXktdGVzdCdcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuRCAgICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ3BpcGVkcmVhbXMyJ1xuJCAgICAgICAgICAgICAgICAgICAgICAgICA9IEQucmVtaXQuYmluZCBEXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkhPTExFUklUSCAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL21haW4nXG5kYiAgICAgICAgICAgICAgICAgICAgICAgID0gbnVsbFxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5CWVRFV0lTRSAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnYnl0ZXdpc2UnXG5sZXZlbHVwICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbGV2ZWx1cCdcbmxldmVsZG93biAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdsZXZlbGRvd24nXG5DT0RFQyAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi9jb2RlYydcblxuXG4jICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBAX2VuY29kZV9saXN0ID0gKCBsaXN0ICkgLT5cbiMgICAoIGxpc3RbIGlkeCBdID0gQllURVdJU0UuZW5jb2RlIHZhbHVlICkgZm9yIHZhbHVlLCBpZHggaW4gbGlzdFxuIyAgIHJldHVybiBsaXN0XG5cbiMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEBfZGVjb2RlX2xpc3QgPSAoIGxpc3QgKSAtPlxuIyAgICggbGlzdFsgaWR4IF0gPSBCWVRFV0lTRS5kZWNvZGUgdmFsdWUgKSBmb3IgdmFsdWUsIGlkeCBpbiBsaXN0XG4jICAgcmV0dXJuIGxpc3RcblxuIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQF9zb3J0X2xpc3QgPSAoIGxpc3QgKSAtPlxuIyAgIEBfZW5jb2RlX2xpc3QgbGlzdFxuIyAgIGxpc3Quc29ydCBCdWZmZXIuY29tcGFyZVxuIyAgIEBfZGVjb2RlX2xpc3QgbGlzdFxuIyAgIHJldHVybiBsaXN0XG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9mZWVkX3Rlc3RfZGF0YSA9ICggZGIsIHByb2Jlc19pZHgsIGhhbmRsZXIgKSAtPlxuICBzd2l0Y2ggcHJvYmVzX2lkeFxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgd2hlbiAwLCAyXG4gICAgICBzdGVwICggcmVzdW1lICkgPT5cbiAgICAgICAgeWllbGQgSE9MTEVSSVRILmNsZWFyIGRiLCByZXN1bWVcbiAgICAgICAgaW5wdXQgPSBELmNyZWF0ZV90aHJvdWdoc3RyZWFtKClcbiAgICAgICAgaW5wdXRcbiAgICAgICAgICAucGlwZSBIT0xMRVJJVEguJHdyaXRlIGRiLCAzXG4gICAgICAgICAgIyAucGlwZSBELiRzaG93KClcbiAgICAgICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgICAgIHVyZ2UgXCJ0ZXN0IGRhdGEgd3JpdHRlblwiXG4gICAgICAgICAgICBoYW5kbGVyIG51bGxcbiAgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgICBmb3IgcHJvYmUgaW4gQF9mZWVkX3Rlc3RfZGF0YS5wcm9iZXNbIHByb2Jlc19pZHggXVxuICAgICAgICAgICMga2V5ID0gSE9MTEVSSVRILm5ld19zb19rZXkgZGIsIHByb2JlLi4uXG4gICAgICAgICAgIyBkZWJ1ZyAnwqlXVjBqMicsIHByb2JlXG4gICAgICAgICAgaW5wdXQud3JpdGUgcHJvYmVcbiAgICAgICAgaW5wdXQuZW5kKClcbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIHdoZW4gMVxuICAgICAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgICAgIHlpZWxkIEhPTExFUklUSC5jbGVhciBkYiwgcmVzdW1lXG4gICAgICAgIGlucHV0ID0gRC5jcmVhdGVfdGhyb3VnaHN0cmVhbSgpXG4gICAgICAgIGlucHV0XG4gICAgICAgICAgLnBpcGUgSE9MTEVSSVRILiR3cml0ZSBkYiwgM1xuICAgICAgICAgICMgLnBpcGUgRC4kc2hvdygpXG4gICAgICAgICAgLnBpcGUgRC4kb25fZW5kID0+XG4gICAgICAgICAgICB1cmdlIFwidGVzdCBkYXRhIHdyaXR0ZW5cIlxuICAgICAgICAgICAgaGFuZGxlciBudWxsXG4gICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgICAgZm9yIHVybF9rZXkgaW4gQF9mZWVkX3Rlc3RfZGF0YS5wcm9iZXNbIHByb2Jlc19pZHggXVxuICAgICAgICAgIGtleSA9IEhPTExFUklUSC5rZXlfZnJvbV91cmwgZGIsIHVybF9rZXlcbiAgICAgICAgICBpbnB1dC53cml0ZSBrZXlcbiAgICAgICAgaW5wdXQuZW5kKClcbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGVsc2UgcmV0dXJuIGhhbmRsZXIgbmV3IEVycm9yIFwiaWxsZWdhbCBwcm9iZXMgaW5kZXggI3tycHIgcHJvYmVzX2lkeH1cIlxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHJldHVybiBudWxsXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9mZWVkX3Rlc3RfZGF0YS5wcm9iZXMgPSBbXVxuXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkBfZmVlZF90ZXN0X2RhdGEucHJvYmVzLnB1c2ggW1xuICBbICfwp7efMScsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgICAgICAgICAgICAgIDEsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ/Cnt58yJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAgICAgICAgICAgICAgMiwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn8Ke3nzMnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsICAgICAgICAgICAgICAzLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfwp7efNCcsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgICAgICAgICAgICAgIDQsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ/Cnt58nLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsICAgICAgICAgICAgICA1LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn8Ke3nzYnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsICAgICAgICAgICAgICA2LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfwp7efJywgJ2NwL2NpZCcsICAgICAgICAgICAgICAgICAgICAgICAgICAgMTYzMjk1LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ/Cnt58nLCAnZ3VpZGUvdWNoci9oYXMnLCAgICAgICAgICAgICAgICAgICBbICflhasnLCAn5YiAJywgJ+WugCcsICfuh7onLCAn6LKdJywgXSwgICAgICBdXG4gIFsgJ/Cnt58nLCAncmFuay9janQnLCAgICAgICAgICAgICAgICAgICAgICAgICA1NDMyLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5YWrJywgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCAgICAgICAgICAnMzQnLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+WIgCcsICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgICAgICAgICAgJzUoMTIpMycsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICflroAnLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICAgICAgICAgICc0NCcsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn7oe6JywgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCAgICAgICAgICAnMTInLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+iynScsICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgICAgICAgICAgJzI1KDEyKScsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICflhasnLCAncmFuay9janQnLCAgICAgICAgICAgICAgICAgICAgICAgICAxMjU0MSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5YiAJywgJ3JhbmsvY2p0JywgICAgICAgICAgICAgICAgICAgICAgICAgMTI1NDIsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+WugCcsICdyYW5rL2NqdCcsICAgICAgICAgICAgICAgICAgICAgICAgIDEyNTQzLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfuh7onLCAncmFuay9janQnLCAgICAgICAgICAgICAgICAgICAgICAgICAxMjU0NCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn6LKdJywgJ3JhbmsvY2p0JywgICAgICAgICAgICAgICAgICAgICAgICAgMTI1NDUsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIF1cblxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5AX2ZlZWRfdGVzdF9kYXRhLnByb2Jlcy5wdXNoIFtcbiAgJ3NvfGdseXBoOuWKrHxjcC9mbmNyOnUtY2prLzUyYWN8MCdcbiAgJ3NvfGdseXBoOumCrXxjcC9mbmNyOnUtY2prLzkwYWR8MCdcbiAgJ3NvfGdseXBoOvCgtKZ8Y3AvZm5jcjp1LWNqay14Yi8yMGQyNnwwJ1xuICAnc298Z2x5cGg68KS/r3xjcC9mbmNyOnUtY2prLXhiLzI0ZmVmfDAnXG4gICdzb3xnbHlwaDrwp5G0fGNwL2ZuY3I6dS1jamsteGIvMjc0NzR8MCdcbiAgJ3NvfGdseXBoOvCokqF8Y3AvZm5jcjp1LWNqay14Yi8yODRhMXwwJ1xuICAnc298Z2x5cGg68Kqap3xjcC9mbmNyOnUtY2prLXhiLzJhNmE3fDAnXG4gICdzb3xnbHlwaDrwqpqrfGNwL2ZuY3I6dS1jamsteGIvMmE2YWJ8MCdcbiAgJ3NvfGdseXBoOvCkv698c3Ryb2tlb3JkZXI6MzUyNTEzNTUzMjU0fDAnXG4gICdzb3xnbHlwaDrwoLSmfHN0cm9rZW9yZGVyOjM1MjUxNDExMjF8MCdcbiAgJ3NvfGdseXBoOvCokqF8c3Ryb2tlb3JkZXI6MzUyNTE0NTR8MCdcbiAgJ3NvfGdseXBoOumCrXxzdHJva2VvcmRlcjozNTI1MTUyfDAnXG4gICdzb3xnbHlwaDrwqpqrfHN0cm9rZW9yZGVyOjM1MjUxNTI1MTExNTExNTExMzU0MXwwJ1xuICAnc298Z2x5cGg68Kqap3xzdHJva2VvcmRlcjozNTI1MTUyNTExMjUxMTUxMXwwJ1xuICAnc298Z2x5cGg68KeRtHxzdHJva2VvcmRlcjozNTI1MTUyNTEyMTQyNTEyMTR8MCdcbiAgJ3NvfGdseXBoOuWKrHxzdHJva2VvcmRlcjozNTI1MTUzfDAnXG4gIF1cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX2ZlZWRfdGVzdF9kYXRhLnByb2Jlcy5wdXNoIFtcbiAgWyAn5LiBJywgJ3N0cm9rZWNvdW50JywgICAgIDIsICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+S4iScsICdzdHJva2Vjb3VudCcsICAgICAzLCAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICflpKsnLCAnc3Ryb2tlY291bnQnLCAgICAgNSwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5ZyLJywgJ3N0cm9rZWNvdW50JywgICAgIDExLCAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+W9oicsICdzdHJva2Vjb3VudCcsICAgICA3LCAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfkuIEnLCAnY29tcG9uZW50Y291bnQnLCAgMSwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5LiJJywgJ2NvbXBvbmVudGNvdW50JywgIDEsICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+WkqycsICdjb21wb25lbnRjb3VudCcsICAxLCAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICflnIsnLCAnY29tcG9uZW50Y291bnQnLCAgNCwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5b2iJywgJ2NvbXBvbmVudGNvdW50JywgIDIsICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+S4gScsICdjb21wb25lbnRzJywgICAgICBbICfkuIEnLCBdLCAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5LiJJywgJ2NvbXBvbmVudHMnLCAgICAgIFsgJ+S4iScsIF0sICAgICAgICAgICAgICAgICAgXVxuICBbICflpKsnLCAnY29tcG9uZW50cycsICAgICAgWyAn5aSrJywgXSwgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+WciycsICdjb21wb25lbnRzJywgICAgICBbICflm5cnLCAn5oiIJywgJ+WPoycsICfkuIAnLCBdLCBdXG4gIFsgJ+W9oicsICdjb21wb25lbnRzJywgICAgICBbICflvIAnLCAn5b2hJywgXSwgICAgICAgICAgICAgXVxuICBdXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJ3cml0ZSB3aXRob3V0IGVycm9yXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHByb2Jlc19pZHggID0gMFxuICBpZHggPSAtMVxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBAX2ZlZWRfdGVzdF9kYXRhIGRiLCBwcm9iZXNfaWR4LCByZXN1bWVcbiAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgd2l0aG91dCBlcnJvclwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ID0gLTFcbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgQF9mZWVkX3Rlc3RfZGF0YSBkYiwgcHJvYmVzX2lkeCwgcmVzdW1lXG4gICAgaW5wdXQgPSBIT0xMRVJJVEguY3JlYXRlX2ZhY2V0c3RyZWFtIGRiXG4gICAgaW5wdXRcbiAgICAgICMgLnBpcGUgSE9MTEVSSVRILiR1cmxfZnJvbV9rZXkgZGJcbiAgICAgIC5waXBlICQgKCBbIGtleSwgdmFsdWUsIF0sIHNlbmQgKSA9PlxuICAgICAgICBpZHggKz0gKzFcbiAgICAgICAgIyBULmVxIGtleSwgbWF0Y2hlcnNbIGlkeCBdXG4gICAgICAucGlwZSBELiRvbl9lbmQgPT4gZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZWFkIGtleXMgd2l0aG91dCBlcnJvciAoMSlcIiBdID0gKCBULCBkb25lICkgLT5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgSE9MTEVSSVRILmNsZWFyIGRiLCByZXN1bWVcbiAgICAjIyMgVEFJTlQgYXdhaXRpbmcgYmV0dGVyIHNvbHV0aW9uICMjI1xuICAgIE5VTEwgPSBIT0xMRVJJVEguX2VuY29kZV92YWx1ZSBkYiwgMVxuICAgIGZvciBpZHggaW4gWyAwIC4uLiAxMCBdXG4gICAgICBkYlsgJyVzZWxmJyBdLnB1dCAoIEhPTExFUklUSC5fZW5jb2RlX2tleSBkYiwgWyAneCcsIGlkeCwgJ3gnLCBdICksIE5VTExcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHByb2JlX2lkeCA9IDRcbiAgICBjb3VudCAgICAgPSAwXG4gICAgcXVlcnkgICAgID0gSE9MTEVSSVRILl9xdWVyeV9mcm9tX3ByZWZpeCBkYiwgWyAneCcsIHByb2JlX2lkeCwgXVxuICAgIGlucHV0ICAgICA9IGRiWyAnJXNlbGYnIF0uY3JlYXRlUmVhZFN0cmVhbSBxdWVyeVxuICAgIGlucHV0XG4gICAgICAucGlwZSAkICggeyBrZXksIHZhbHVlLCB9LCBzZW5kICkgPT5cbiAgICAgICAgY291bnQgKz0gMVxuICAgICAgICBULmVxICggSE9MTEVSSVRILl9kZWNvZGVfa2V5IGRiLCBrZXkgKVsgMSBdLCBwcm9iZV9pZHhcbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICBULmVxIGNvdW50LCAxXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCBrZXlzIHdpdGhvdXQgZXJyb3IgKDIpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEhPTExFUklUSC5jbGVhciBkYiwgcmVzdW1lXG4gICAgIyMjIFRBSU5UIGF3YWl0aW5nIGJldHRlciBzb2x1dGlvbiAjIyNcbiAgICBOVUxMID0gSE9MTEVSSVRILl9lbmNvZGVfdmFsdWUgZGIsIDFcbiAgICBmb3IgaWR4IGluIFsgMCAuLi4gMTAgXVxuICAgICAgZGJbICclc2VsZicgXS5wdXQgKCBIT0xMRVJJVEguX2VuY29kZV9rZXkgZGIsIFsgJ3gnLCBpZHgsICd4JywgXSApLCBOVUxMXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwcm9iZV9pZHggPSA0XG4gICAgY291bnQgICAgID0gMFxuICAgIHByZWZpeCAgICA9IFsgJ3gnLCBwcm9iZV9pZHgsIF1cbiAgICBpbnB1dCAgICAgPSBIT0xMRVJJVEguY3JlYXRlX2ZhY2V0c3RyZWFtIGRiLCBwcmVmaXhcbiAgICBpbnB1dFxuICAgICAgLnBpcGUgJCAoIGZhY2V0LCBzZW5kICkgPT5cbiAgICAgICAgY291bnQgKz0gMVxuICAgICAgICBbIGtleSwgdmFsdWUsIF0gPSBmYWNldFxuICAgICAgICBULmVxIGtleVsgMSBdLCBwcm9iZV9pZHhcbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICBULmVxIGNvdW50LCAxXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCBrZXlzIHdpdGhvdXQgZXJyb3IgKDMpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEhPTExFUklUSC5jbGVhciBkYiwgcmVzdW1lXG4gICAgIyMjIFRBSU5UIGF3YWl0aW5nIGJldHRlciBzb2x1dGlvbiAjIyNcbiAgICBOVUxMID0gSE9MTEVSSVRILl9lbmNvZGVfdmFsdWUgZGIsIDFcbiAgICBmb3IgaWR4IGluIFsgMCAuLi4gMTAgXVxuICAgICAgZGJbICclc2VsZicgXS5wdXQgKCBIT0xMRVJJVEguX2VuY29kZV9rZXkgZGIsIFsgJ3gnLCBpZHgsICd4JywgXSApLCBOVUxMXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwcm9iZV9pZHggPSAzXG4gICAgY291bnQgICAgID0gMFxuICAgIGRlbHRhICAgICA9IDJcbiAgICBsbyAgICAgICAgPSBbICd4JywgcHJvYmVfaWR4LCBdXG4gICAgaGkgICAgICAgID0gWyAneCcsIHByb2JlX2lkeCArIGRlbHRhLCBdXG4gICAgcXVlcnkgICAgID0geyBndGU6ICggSE9MTEVSSVRILl9lbmNvZGVfa2V5IGRiLCBsbyApLCBsdGU6ICggSE9MTEVSSVRILl9xdWVyeV9mcm9tX3ByZWZpeCBkYiwgaGkgKVsgJ2x0ZScgXSwgfVxuICAgIGlucHV0ICAgICA9IGRiWyAnJXNlbGYnIF0uY3JlYXRlUmVhZFN0cmVhbSBxdWVyeVxuICAgIGlucHV0XG4gICAgICAucGlwZSAkICggeyBrZXksIHZhbHVlLCB9LCBzZW5kICkgPT5cbiAgICAgICAgY291bnQgKz0gMVxuICAgICAgICBULmVxICggSE9MTEVSSVRILl9kZWNvZGVfa2V5IGRiLCBrZXkgKVsgMSBdLCBwcm9iZV9pZHggKyBjb3VudCAtIDFcbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICBULmVxIGNvdW50LCBkZWx0YSArIDFcbiAgICAgICAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZWFkIGtleXMgd2l0aG91dCBlcnJvciAoNClcIiBdID0gKCBULCBkb25lICkgLT5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgSE9MTEVSSVRILmNsZWFyIGRiLCByZXN1bWVcbiAgICBmb3IgaWR4IGluIFsgMCAuLi4gMTAgXVxuICAgICAgZGJbICclc2VsZicgXS5wdXQgKCBIT0xMRVJJVEguX2VuY29kZV9rZXkgZGIsIFsgJ3gnLCBpZHgsICd4JywgXSApLCBIT0xMRVJJVEguX2VuY29kZV92YWx1ZSBkYiwgMVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcHJvYmVfaWR4ID0gM1xuICAgIGNvdW50ICAgICA9IDBcbiAgICBkZWx0YSAgICAgPSAyXG4gICAgbG8gICAgICAgID0gWyAneCcsIHByb2JlX2lkeCwgXVxuICAgIGhpICAgICAgICA9IFsgJ3gnLCBwcm9iZV9pZHggKyBkZWx0YSwgXVxuICAgIGlucHV0ICAgICA9IEhPTExFUklUSC5jcmVhdGVfZmFjZXRzdHJlYW0gZGIsIGxvLCBoaVxuICAgIGlucHV0XG4gICAgICAucGlwZSAkICggWyBrZXksIHZhbHVlLCBdLCBzZW5kICkgPT5cbiAgICAgICAgY291bnQgKz0gMVxuICAgICAgICBULmVxIGtleVsgMSBdLCBwcm9iZV9pZHggKyBjb3VudCAtIDFcbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICBULmVxIGNvdW50LCBkZWx0YSArIDFcbiAgICAgICAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJjcmVhdGVfZmFjZXRzdHJlYW0gdGhyb3dzIHdpdGggd3JvbmcgYXJndW1lbnRzXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIG1lc3NhZ2UgPSBcIm11c3QgZ2l2ZSBgbG9faGludGAgd2hlbiBgaGlfaGludGAgaXMgZ2l2ZW5cIlxuICBULnRocm93cyBtZXNzYWdlLCAoIC0+IEhPTExFUklUSC5jcmVhdGVfZmFjZXRzdHJlYW0gZGIsIG51bGwsIFsgJ3h4eCcsIF0gKVxuICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgUE9TIGZhY2V0c1wiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ICAgICAgICAgPSAtMVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGtleV9tYXRjaGVycyA9IFtcbiAgICBbICdwb3MnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDIsICfwp7efMicgXVxuICAgIFsgJ3BvcycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgMywgJ/Cnt58zJyBdXG4gICAgWyAncG9zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCA0LCAn8Ke3nzQnIF1cbiAgICBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcGhyYXNlX21hdGNoZXJzID0gW1xuICAgIFsgJ/Cnt58yJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAyIF1cbiAgICBbICfwp7efMycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgMyBdXG4gICAgWyAn8Ke3nzQnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDQgXVxuICAgIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBAX2ZlZWRfdGVzdF9kYXRhIGRiLCBwcm9iZXNfaWR4LCByZXN1bWVcbiAgICBsbyA9IFsgJ3BvcycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgMiwgXVxuICAgIGhpID0gWyAncG9zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCA0LCBdXG4gICAgIyBpbnB1dCAgID0gSE9MTEVSSVRILmNyZWF0ZV9rZXlzdHJlYW0gZGIsIGxvXG4gICAgaW5wdXQgICA9IEhPTExFUklUSC5jcmVhdGVfZmFjZXRzdHJlYW0gZGIsIGxvLCBoaVxuICAgIGlucHV0XG4gICAgICAjIC5waXBlIEhPTExFUklUSC4kdXJsX2Zyb21fa2V5IGRiXG4gICAgICAucGlwZSAkICggWyBrZXksIHZhbHVlLCBdLCBzZW5kICkgPT5cbiAgICAgICAgaWR4ICs9ICsxXG4gICAgICAgIHBocmFzZSA9IEhPTExFUklUSC5hc19waHJhc2UgZGIsIGtleSwgdmFsdWVcbiAgICAgICAgVC5lcSBrZXksIGtleV9tYXRjaGVyc1sgaWR4IF1cbiAgICAgICAgVC5lcSBwaHJhc2UsIHBocmFzZV9tYXRjaGVyc1sgaWR4IF1cbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PiBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgUE9TIHBocmFzZXMgKDEpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHByb2Jlc19pZHggID0gMFxuICBpZHggICAgICAgICA9IC0xXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgbWF0Y2hlcnMgPSBbXG4gICAgWyAn8Ke3nzInLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDIgXVxuICAgIFsgJ/Cnt58zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAzIF1cbiAgICBbICfwp7efNCcsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgNCBdXG4gICAgXVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHJlc3VtZVxuICAgIGxvID0gWyAncG9zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAyLCBdXG4gICAgaGkgPSBbICdwb3MnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDQsIF1cbiAgICBpbnB1dCAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIGxvLCBoaVxuICAgIGlucHV0XG4gICAgICAucGlwZSAkICggcGhyYXNlLCBzZW5kICkgPT5cbiAgICAgICAgaWR4ICs9ICsxXG4gICAgICAgIFQuZXEgcGhyYXNlLCBtYXRjaGVyc1sgaWR4IF1cbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PiBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgUE9TIHBocmFzZXMgKDIpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHByb2Jlc19pZHggID0gMFxuICBpZHggICAgICAgICA9IC0xXG4gIGNvdW50ICAgICAgID0gMFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIG1hdGNoZXJzID0gW1xuICAgIFsgJ/Cnt58nLCAnZ3VpZGUvdWNoci9oYXMnLCAn5YWrJywgMCBdXG4gICAgWyAn8Ke3nycsICdndWlkZS91Y2hyL2hhcycsICfliIAnLCAxIF1cbiAgICBbICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgJ+WugCcsIDIgXVxuICAgIFsgJ/Cnt58nLCAnZ3VpZGUvdWNoci9oYXMnLCAn6LKdJywgNCBdXG4gICAgWyAn8Ke3nycsICdndWlkZS91Y2hyL2hhcycsICfuh7onLCAzIF1cbiAgICBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgQF9mZWVkX3Rlc3RfZGF0YSBkYiwgcHJvYmVzX2lkeCwgcmVzdW1lXG4gICAgcHJlZml4ICAgID0gWyAncG9zJywgJ2d1aWRlL3VjaHIvaGFzJywgXVxuICAgIGlucHV0ICAgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBwcmVmaXhcbiAgICBzZXR0aW5ncyAgPSB7IGluZGV4ZWQ6IG5vLCB9XG4gICAgaW5wdXRcbiAgICAgIC5waXBlICQgKCBwaHJhc2UsIHNlbmQgKSA9PlxuICAgICAgICBjb3VudCAgKz0gKzFcbiAgICAgICAgaWR4ICAgICs9ICsxXG4gICAgICAgIFQuZXEgcGhyYXNlLCBtYXRjaGVyc1sgaWR4IF1cbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICBULmVxIGNvdW50LCBtYXRjaGVycy5sZW5ndGhcbiAgICAgICAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZWFkIFNQTyBwaHJhc2VzXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHByb2Jlc19pZHggID0gMFxuICBpZHggICAgICAgICA9IC0xXG4gIGNvdW50ICAgICAgID0gMFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIG1hdGNoZXJzID0gW1xuICAgIFsgJ/Cnt58nLCAnY3AvY2lkJywgMTYzMjk1IF1cbiAgICBbICfwp7efJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCA1IF1cbiAgICBbICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgWyAn5YWrJywgJ+WIgCcsICflroAnLCAn7oe6JywgJ+iynScgXSBdXG4gICAgWyAn8Ke3nycsICdyYW5rL2NqdCcsIDU0MzIgXVxuICAgIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBAX2ZlZWRfdGVzdF9kYXRhIGRiLCBwcm9iZXNfaWR4LCByZXN1bWVcbiAgICBwcmVmaXggID0gWyAnc3BvJywgJ/Cnt58nLCBdXG4gICAgaW5wdXQgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBwcmVmaXhcbiAgICBpbnB1dFxuICAgICAgLnBpcGUgJCAoIHBocmFzZSwgc2VuZCApID0+XG4gICAgICAgIGRlYnVnICfCqURzQWZZJywgcnByIHBocmFzZVxuICAgICAgICBjb3VudCAgKz0gKzFcbiAgICAgICAgaWR4ICAgICs9ICsxXG4gICAgICAgIFQuZXEgcGhyYXNlLCBtYXRjaGVyc1sgaWR4IF1cbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICBULmVxIGNvdW50LCBtYXRjaGVycy5sZW5ndGhcbiAgICAgICAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZWFkIHdpdGggc3ViLXJlYWQgKDEpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHByb2Jlc19pZHggID0gMFxuICBpZHggICAgICAgICA9IC0xXG4gIGNvdW50ICAgICAgID0gMFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIG1hdGNoZXJzID0gW1xuICAgIFsgJ/Cnt58nLCBbICflhasnLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICczNCcgXSBdXG4gICAgXVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHJlc3VtZVxuICAgIHByZWZpeCAgICA9IFsgJ3NwbycsICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgXVxuICAgIGlucHV0ICAgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBwcmVmaXhcbiAgICBzZXR0aW5ncyAgPSB7IGluZGV4ZWQ6IG5vLCB9XG4gICAgaW5wdXRcbiAgICAgIC5waXBlIEhPTExFUklUSC5yZWFkX3N1YiBkYiwgc2V0dGluZ3MsICggWyBnbHlwaCwgcHJkLCBndWlkZXMsIF0gKSA9PlxuICAgICAgICBzdWJfaW5wdXQgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgWyAnc3BvJywgZ3VpZGVzWyAwIF0sICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgXVxuICAgICAgICByZXR1cm4gWyBnbHlwaCwgc3ViX2lucHV0LCBdXG4gICAgICAucGlwZSAkICggcGhyYXNlLCBzZW5kICkgPT5cbiAgICAgICAgY291bnQgICs9ICsxXG4gICAgICAgIGlkeCAgICArPSArMVxuICAgICAgICBULmVxIHBocmFzZSwgbWF0Y2hlcnNbIGlkeCBdXG4gICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgVC5lcSBjb3VudCwgbWF0Y2hlcnMubGVuZ3RoXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCB3aXRoIHN1Yi1yZWFkICgyKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ICAgICAgICAgPSAtMVxuICBjb3VudCAgICAgICA9IDBcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBtYXRjaGVycyA9IFtcbiAgICBbICfwp7efJywgWyAn5YWrJywgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCAnMzQnIF0gXVxuICAgIFsgJ/Cnt58nLCBbICfliIAnLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICc1KDEyKTMnIF0gXVxuICAgIFsgJ/Cnt58nLCBbICflroAnLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICc0NCcgXSBdXG4gICAgWyAn8Ke3nycsIFsgJ+iynScsICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgJzI1KDEyKScgXSBdXG4gICAgWyAn8Ke3nycsIFsgJ+6HuicsICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgJzEyJyBdIF1cbiAgICBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgQF9mZWVkX3Rlc3RfZGF0YSBkYiwgcHJvYmVzX2lkeCwgcmVzdW1lXG4gICAgcHJlZml4ICAgID0gWyAncG9zJywgJ2d1aWRlL3VjaHIvaGFzJywgXVxuICAgIGlucHV0ICAgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBwcmVmaXhcbiAgICBzZXR0aW5ncyAgPSB7IGluZGV4ZWQ6IG5vLCB9XG4gICAgaW5wdXRcbiAgICAgIC5waXBlIEhPTExFUklUSC5yZWFkX3N1YiBkYiwgc2V0dGluZ3MsICggcGhyYXNlICkgPT5cbiAgICAgICAgWyBnbHlwaCwgcHJkLCBndWlkZSwgXSAgPSBwaHJhc2VcbiAgICAgICAgcHJlZml4ICAgICAgICAgICAgICAgICAgPSBbICdzcG8nLCBndWlkZSwgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCBdXG4gICAgICAgIHN1Yl9pbnB1dCAgICAgICAgICAgICAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIHByZWZpeFxuICAgICAgICByZXR1cm4gWyBnbHlwaCwgc3ViX2lucHV0LCBdXG4gICAgICAucGlwZSAkICggcGhyYXNlLCBzZW5kICkgPT5cbiAgICAgICAgZGVidWcgJ8KpcXVQYmcnLCBKU09OLnN0cmluZ2lmeSBwaHJhc2VcbiAgICAgICAgY291bnQgICs9ICsxXG4gICAgICAgIGlkeCAgICArPSArMVxuICAgICAgICBULmVxIHBocmFzZSwgbWF0Y2hlcnNbIGlkeCBdXG4gICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgVC5lcSBjb3VudCwgbWF0Y2hlcnMubGVuZ3RoXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCB3aXRoIHN1Yi1yZWFkICgzKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ICAgICAgICAgPSAtMVxuICBjb3VudCAgICAgICA9IDBcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBtYXRjaGVycyA9IFtcbiAgICBbW1wi8Ke3n1wiLFwi5YWrXCIsXCIzNFwiXSxbXCLlhatcIixcInJhbmsvY2p0XCIsMTI1NDFdXVxuICAgIFtbXCLwp7efXCIsXCLliIBcIixcIjUoMTIpM1wiXSxbXCLliIBcIixcInJhbmsvY2p0XCIsMTI1NDJdXVxuICAgIFtbXCLwp7efXCIsXCLlroBcIixcIjQ0XCJdLFtcIuWugFwiLFwicmFuay9janRcIiwxMjU0M11dXG4gICAgW1tcIvCnt59cIixcIuiynVwiLFwiMjUoMTIpXCJdLFtcIuiynVwiLFwicmFuay9janRcIiwxMjU0NV1dXG4gICAgW1tcIvCnt59cIixcIu6HulwiLFwiMTJcIl0sW1wi7oe6XCIsXCJyYW5rL2NqdFwiLDEyNTQ0XV1cbiAgICBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgQF9mZWVkX3Rlc3RfZGF0YSBkYiwgcHJvYmVzX2lkeCwgcmVzdW1lXG4gICAgcHJlZml4ICAgID0gWyAncG9zJywgJ2d1aWRlL3VjaHIvaGFzJywgXVxuICAgIGlucHV0ICAgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBwcmVmaXhcbiAgICBzZXR0aW5ncyAgPSB7IGluZGV4ZWQ6IG5vLCB9XG4gICAgaW5wdXRcbiAgICAgIC5waXBlIEhPTExFUklUSC5yZWFkX3N1YiBkYiwgc2V0dGluZ3MsICggcGhyYXNlICkgPT5cbiAgICAgICAgWyBnbHlwaCwgcHJkLCBndWlkZSwgXSAgPSBwaHJhc2VcbiAgICAgICAgcHJlZml4ICAgICAgICAgICAgICAgICAgPSBbICdzcG8nLCBndWlkZSwgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCBdXG4gICAgICAgIHN1Yl9pbnB1dCAgICAgICAgICAgICAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIHByZWZpeFxuICAgICAgICByZXR1cm4gWyBnbHlwaCwgc3ViX2lucHV0LCBdXG4gICAgICAucGlwZSBIT0xMRVJJVEgucmVhZF9zdWIgZGIsIHNldHRpbmdzLCAoIHhwaHJhc2UgKSA9PlxuICAgICAgICBbIGdseXBoLCBbIGd1aWRlLCBwcmQsIHNoYXBlY2xhc3MsIF0gXSAgPSB4cGhyYXNlXG4gICAgICAgIHByZWZpeCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFsgJ3NwbycsIGd1aWRlLCAncmFuay9janQnLCBdXG4gICAgICAgIHN1Yl9pbnB1dCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBwcmVmaXhcbiAgICAgICAgcmV0dXJuIFsgWyBnbHlwaCwgZ3VpZGUsIHNoYXBlY2xhc3MsIF0sIHN1Yl9pbnB1dCwgXVxuICAgICAgLnBpcGUgJCAoIHhwaHJhc2UsIHNlbmQgKSA9PlxuICAgICAgICBkZWJ1ZyAnwqlxdVBiZycsIEpTT04uc3RyaW5naWZ5IHhwaHJhc2VcbiAgICAgICAgY291bnQgICs9ICsxXG4gICAgICAgIGlkeCAgICArPSArMVxuICAgICAgICBULmVxIHhwaHJhc2UsIG1hdGNoZXJzWyBpZHggXVxuICAgICAgLnBpcGUgRC4kb25fZW5kID0+XG4gICAgICAgIFQuZXEgY291bnQsIG1hdGNoZXJzLmxlbmd0aFxuICAgICAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInNvcnRpbmcgKDEpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHNldHRpbmdzID1cbiAgICAgIGRiOiAgICAgICAgICAgbGV2ZWxkb3duXG4gICAgICBrZXlFbmNvZGluZzogICdiaW5hcnknXG4gICAgbGV2ZWxkYiA9IGxldmVsdXAgJy90bXAvaG9sbGVyaXRoMi10ZXN0Jywgc2V0dGluZ3NcbiAgICB5aWVsZCBjbGVhcl9sZXZlbGRiIGxldmVsZGIsIHJlc3VtZVxuICAgIHByb2JlcyA9IFtcbiAgICAgICdhJ1xuICAgICAgJ2FiJ1xuICAgICAgJ2FiYydcbiAgICAgICdhYmNcXHgwMCdcbiAgICAgICdhYmNcXHgwMGEnXG4gICAgICAnYWJjYSdcbiAgICAgICdhYmNiJ1xuICAgICAgJ2FiY2MnXG4gICAgICAnYWJjZCdcbiAgICAgICdhYmNkZSdcbiAgICAgICdhYmNkZWYnXG4gICAgICAnYWJjZGVmZycgXVxuICAgIG1hdGNoZXJzID0gW1xuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCAweDYyLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgMHg2MiwgMHg2MywgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIDB4NjIsIDB4NjMsIDB4MDAsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCAweDYyLCAweDYzLCAweDAwLCAweDYxLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgMHg2MiwgMHg2MywgMHg2MSwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIDB4NjIsIDB4NjMsIDB4NjIsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCAweDYyLCAweDYzLCAweDYzLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgMHg2MiwgMHg2MywgMHg2NCwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIDB4NjIsIDB4NjMsIDB4NjQsIDB4NjUsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCAweDYyLCAweDYzLCAweDY0LCAweDY1LCAweDY2LCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgMHg2MiwgMHg2MywgMHg2NCwgMHg2NSwgMHg2NiwgMHg2NywgXSBdXG4gICAgQ05ELnNodWZmbGUgcHJvYmVzXG4gICAgZm9yIHByb2JlIGluIHByb2Jlc1xuICAgICAgcHJvYmVfYmZyID0gbmV3IEJ1ZmZlciBwcm9iZSwgJ3V0Zi04J1xuICAgICAgeWllbGQgbGV2ZWxkYi5wdXQgcHJvYmVfYmZyLCAnMScsIHJlc3VtZVxuICAgICAgcHJvYmVfYmZycyA9IHlpZWxkIHJlYWRfYWxsX2tleXMgbGV2ZWxkYiwgcmVzdW1lXG4gICAgcHJvYmVfYmZycyA9IHlpZWxkIHJlYWRfYWxsX2tleXMgbGV2ZWxkYiwgcmVzdW1lXG4gICAgIyBkZWJ1ZyAnwqlSWFB2dicsICdcXG4nICsgcnByIHByb2JlX2JmcnNcbiAgICBmb3IgcHJvYmVfYmZyLCBwcm9iZV9pZHggaW4gcHJvYmVfYmZyc1xuICAgICAgbWF0Y2hlciA9IG1hdGNoZXJzWyBwcm9iZV9pZHggXVxuICAgICAgIyMjIFRBSU5UIGxvb2tzIGxpa2UgYFQuZXEgYnVmZmVyMSwgYnVmZmVyMmAgZG9lc24ndCB3b3JrLS0tc29tZXRpbWVzLi4uICMjI1xuICAgICAgIyBULmVxIHByb2JlX2JmciwgbWF0Y2hlclxuICAgICAgVC5vayBwcm9iZV9iZnIuZXF1YWxzIG1hdGNoZXJcbiAgICBsZXZlbGRiLmNsb3NlIC0+IGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwic29ydGluZyAoMilcIiBdID0gKCBULCBkb25lICkgLT5cbiAgIyMjIFRoaXMgdGVzdCBpcyBoZXJlIGJlY2F1c2UgdGhlcmUgc2VlbWVkIHRvIG9jY3VyIHNvbWUgc3RyYW5nZSBvcmRlcmluZyBpc3N1ZXMgd2hlblxuICB1c2luZyBtZW1kb3duIGluc3RlYWQgb2YgbGV2ZWxkb3duICMjI1xuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICBzZXR0aW5ncyA9XG4gICAgICBkYjogICAgICAgICAgIGxldmVsZG93blxuICAgICAga2V5RW5jb2Rpbmc6ICAnYmluYXJ5J1xuICAgIGxldmVsZGIgPSBsZXZlbHVwICcvdG1wL2hvbGxlcml0aDItdGVzdCcsIHNldHRpbmdzXG4gICAgeWllbGQgY2xlYXJfbGV2ZWxkYiBsZXZlbGRiLCByZXN1bWVcbiAgICBwcm9iZXMgPSBbXG4gICAgICBuZXcgQnVmZmVyIFsgMHgwMCwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4MDEsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDAyLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHgwMywgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4ZjksIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweGZhLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHhmYiwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4ZmMsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweGZkLCBdXG4gICAgICBdXG4gICAgbWF0Y2hlcnMgPSAoIHByb2JlIGZvciBwcm9iZSBpbiBwcm9iZXMgKVxuICAgIENORC5zaHVmZmxlIHByb2Jlc1xuICAgIGZvciBwcm9iZSBpbiBwcm9iZXNcbiAgICAgIHlpZWxkIGxldmVsZGIucHV0IHByb2JlLCAnMScsIHJlc3VtZVxuICAgIHByb2JlX2JmcnMgPSB5aWVsZCByZWFkX2FsbF9rZXlzIGxldmVsZGIsIHJlc3VtZVxuICAgIGZvciBwcm9iZV9iZnIsIHByb2JlX2lkeCBpbiBwcm9iZV9iZnJzXG4gICAgICBtYXRjaGVyID0gbWF0Y2hlcnNbIHByb2JlX2lkeCBdXG4gICAgICAjIGRlYnVnICfCqTE1MDYwJywgcHJvYmVfaWR4LCBwcm9iZV9iZnIsIG1hdGNoZXJcbiAgICAgICMjIyBUQUlOVCBsb29rcyBsaWtlIGBULmVxIGJ1ZmZlcjEsIGJ1ZmZlcjJgIGRvZXNuJ3Qgd29yay0tLXNvbWV0aW1lcy4uLiAjIyNcbiAgICAgIFQub2sgcHJvYmVfYmZyLmVxdWFscyBtYXRjaGVyXG4gICAgbGV2ZWxkYi5jbG9zZSAtPiBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcIkgyIGNvZGVjIGBlbmNvZGVgIHRocm93cyBvbiBhbnl0aGluZyBidXQgYSBsaXN0XCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIFQudGhyb3dzIFwiZXhwZWN0ZWQgYSBsaXN0LCBnb3QgYSB0ZXh0XCIsICAgICAgICAgKCAtPiBDT0RFQy5lbmNvZGUgJ3VuYWNjYXB0YWJsZScgKVxuICBULnRocm93cyBcImV4cGVjdGVkIGEgbGlzdCwgZ290IGEgbnVtYmVyXCIsICAgICAgICggLT4gQ09ERUMuZW5jb2RlIDQyIClcbiAgVC50aHJvd3MgXCJleHBlY3RlZCBhIGxpc3QsIGdvdCBhIGJvb2xlYW5cIiwgICAgICAoIC0+IENPREVDLmVuY29kZSB0cnVlIClcbiAgVC50aHJvd3MgXCJleHBlY3RlZCBhIGxpc3QsIGdvdCBhIGJvb2xlYW5cIiwgICAgICAoIC0+IENPREVDLmVuY29kZSBmYWxzZSApXG4gIFQudGhyb3dzIFwiZXhwZWN0ZWQgYSBsaXN0LCBnb3QgYSBqc3VuZGVmaW5lZFwiLCAgKCAtPiBDT0RFQy5lbmNvZGUoKSApXG4gIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwic29ydCB0ZXh0cyB3aXRoIEgyIGNvZGVjICgxKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICBzZXR0aW5ncyA9XG4gICAgICBkYjogICAgICAgICAgIGxldmVsZG93blxuICAgICAga2V5RW5jb2Rpbmc6ICAnYmluYXJ5J1xuICAgIGxldmVsZGIgPSBsZXZlbHVwICcvdG1wL2hvbGxlcml0aDItdGVzdCcsIHNldHRpbmdzXG4gICAgeWllbGQgY2xlYXJfbGV2ZWxkYiBsZXZlbGRiLCByZXN1bWVcbiAgICBwcm9iZXMgPSBbXG4gICAgICAnYSdcbiAgICAgICdhYidcbiAgICAgICdhYmMnXG4gICAgICAnYWJjXFx4MDAnXG4gICAgICAnYWJjXFx4MDBhJ1xuICAgICAgJ2FiY2EnXG4gICAgICAnYWJjYVxceDAwJ1xuICAgICAgJ2FiY2InXG4gICAgICAnYWJjYydcbiAgICAgICdhYmNkJ1xuICAgICAgJ2FiY2RlJ1xuICAgICAgJ2FiY2RlZidcbiAgICAgICdhYmNkZWZnJ1xuICAgICAgXVxuICAgIG1hdGNoZXJzID0gKCBbIHByb2JlLCBdIGZvciBwcm9iZSBpbiBwcm9iZXMgKVxuICAgIENORC5zaHVmZmxlIHByb2Jlc1xuICAgIGZvciBwcm9iZSBpbiBwcm9iZXNcbiAgICAgIHlpZWxkIGxldmVsZGIucHV0ICggQ09ERUMuZW5jb2RlIFsgcHJvYmUsIF0gKSwgJzEnLCByZXN1bWVcbiAgICBwcm9iZV9iZnJzICA9IHlpZWxkIHJlYWRfYWxsX2tleXMgbGV2ZWxkYiwgcmVzdW1lXG4gICAgcHJvYmVzICAgICAgPSAoIENPREVDLmRlY29kZSBwcm9iZV9iZnIgZm9yIHByb2JlX2JmciBpbiBwcm9iZV9iZnJzIClcbiAgICBzaG93X2tleXNfYW5kX2tleV9iZnJzIHByb2JlcywgcHJvYmVfYmZyc1xuICAgIGZvciBwcm9iZSwgcHJvYmVfaWR4IGluIHByb2Jlc1xuICAgICAgbWF0Y2hlciA9IG1hdGNoZXJzWyBwcm9iZV9pZHggXVxuICAgICAgVC5lcSBwcm9iZSwgbWF0Y2hlclxuICAgIGxldmVsZGIuY2xvc2UgLT4gZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJzb3J0IHRleHRzIHdpdGggSDIgY29kZWMgKDIpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHNldHRpbmdzID1cbiAgICAgIGRiOiAgICAgICAgICAgbGV2ZWxkb3duXG4gICAgICBrZXlFbmNvZGluZzogICdiaW5hcnknXG4gICAgbGV2ZWxkYiA9IGxldmVsdXAgJy90bXAvaG9sbGVyaXRoMi10ZXN0Jywgc2V0dGluZ3NcbiAgICB5aWVsZCBjbGVhcl9sZXZlbGRiIGxldmVsZGIsIHJlc3VtZVxuICAgIHByb2JlcyA9IFtcbiAgICAgICcnXG4gICAgICAnICdcbiAgICAgICdhJ1xuICAgICAgJ2FiYydcbiAgICAgICfkuIAnXG4gICAgICAn5LiA5LqMJ1xuICAgICAgJ+S4gOS6jOS4iSdcbiAgICAgICfkuIknXG4gICAgICAn5LqMJ1xuICAgICAgJ/CggIAnXG4gICAgICAn8KCAgFxceDAwJ1xuICAgICAgJ/CggIBhJ1xuICAgICAgJ/CqnIAnXG4gICAgICAn8KudgCdcbiAgICAgIFN0cmluZy5mcm9tQ29kZVBvaW50IDB4MTBmZmZmXG4gICAgICBdXG4gICAgbWF0Y2hlcnMgPSAoIFsgcHJvYmUsIF0gZm9yIHByb2JlIGluIHByb2JlcyApXG4gICAgQ05ELnNodWZmbGUgcHJvYmVzXG4gICAgZm9yIHByb2JlIGluIHByb2Jlc1xuICAgICAgcHJvYmVfYmZyID0gQ09ERUMuZW5jb2RlIFsgcHJvYmUsIF1cbiAgICAgIHlpZWxkIGxldmVsZGIucHV0IHByb2JlX2JmciwgJzEnLCByZXN1bWVcbiAgICBwcm9iZV9iZnJzICA9IHlpZWxkIHJlYWRfYWxsX2tleXMgbGV2ZWxkYiwgcmVzdW1lXG4gICAgIyBkZWJ1ZyAnwqlGZDVpdycsIHByb2JlX2JmcnNcbiAgICBwcm9iZXMgICAgICA9ICggQ09ERUMuZGVjb2RlIHByb2JlX2JmciBmb3IgcHJvYmVfYmZyIGluIHByb2JlX2JmcnMgKVxuICAgIHNob3dfa2V5c19hbmRfa2V5X2JmcnMgcHJvYmVzLCBwcm9iZV9iZnJzXG4gICAgZm9yIHByb2JlLCBwcm9iZV9pZHggaW4gcHJvYmVzXG4gICAgICBtYXRjaGVyID0gbWF0Y2hlcnNbIHByb2JlX2lkeCBdXG4gICAgICBULmVxIHByb2JlLCBtYXRjaGVyXG4gICAgbGV2ZWxkYi5jbG9zZSAtPiBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInNvcnQgbnVtYmVycyB3aXRoIEgyIGNvZGVjICgxKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICBzZXR0aW5ncyA9XG4gICAgICBkYjogICAgICAgICAgIGxldmVsZG93blxuICAgICAga2V5RW5jb2Rpbmc6ICAnYmluYXJ5J1xuICAgIGxldmVsZGIgPSBsZXZlbHVwICcvdG1wL2hvbGxlcml0aDItdGVzdCcsIHNldHRpbmdzXG4gICAgeWllbGQgY2xlYXJfbGV2ZWxkYiBsZXZlbGRiLCByZXN1bWVcbiAgICBwcm9iZXNfYW5kX2Rlc2NyaXB0aW9ucyA9IFtcbiAgICAgIFsgLUluZmluaXR5LCAgICAgICAgICAgICAgIFwiLUluZmluaXR5XCIgICAgICAgICAgICAgICBdXG4gICAgICBbIC1OdW1iZXIuTUFYX1ZBTFVFLCAgICAgICBcIi1OdW1iZXIuTUFYX1ZBTFVFXCIgICAgICAgXVxuICAgICAgWyBOdW1iZXIuTUlOX1NBRkVfSU5URUdFUiwgXCJOdW1iZXIuTUlOX1NBRkVfSU5URUdFUlwiIF1cbiAgICAgIFsgLTEyMzQ1Njc4OSwgICAgICAgICAgICAgIFwiLTEyMzQ1Njc4OVwiICAgICAgICAgICAgICBdXG4gICAgICBbIC0zLCAgICAgICAgICAgICAgICAgICAgICBcIi0zXCIgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgWyAtMiwgICAgICAgICAgICAgICAgICAgICAgXCItMlwiICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgIFsgLTEuNSwgICAgICAgICAgICAgICAgICAgIFwiLTEuNVwiICAgICAgICAgICAgICAgICAgICBdXG4gICAgICBbIC0xLCAgICAgICAgICAgICAgICAgICAgICBcIi0xXCIgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgWyAtTnVtYmVyLkVQU0lMT04sICAgICAgICAgXCItTnVtYmVyLkVQU0lMT05cIiAgICAgICAgIF1cbiAgICAgIFsgLU51bWJlci5NSU5fVkFMVUUsICAgICAgIFwiLU51bWJlci5NSU5fVkFMVUVcIiAgICAgICBdXG4gICAgICBbIDAsICAgICAgICAgICAgICAgICAgICAgICBcIjBcIiAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgWyArTnVtYmVyLk1JTl9WQUxVRSwgICAgICAgXCIrTnVtYmVyLk1JTl9WQUxVRVwiICAgICAgIF1cbiAgICAgIFsgK051bWJlci5FUFNJTE9OLCAgICAgICAgIFwiK051bWJlci5FUFNJTE9OXCIgICAgICAgICBdXG4gICAgICBbICsxLCAgICAgICAgICAgICAgICAgICAgICBcIisxXCIgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgWyArMS41LCAgICAgICAgICAgICAgICAgICAgXCIrMS41XCIgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgIFsgKzIsICAgICAgICAgICAgICAgICAgICAgIFwiKzJcIiAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICBbICszLCAgICAgICAgICAgICAgICAgICAgICBcIiszXCIgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgWyArMTIzNDU2Nzg5LCAgICAgICAgICAgICAgXCIrMTIzNDU2Nzg5XCIgICAgICAgICAgICAgIF1cbiAgICAgIFsgTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIsIFwiTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVJcIiBdXG4gICAgICBbIE51bWJlci5NQVhfVkFMVUUsICAgICAgICBcIk51bWJlci5NQVhfVkFMVUVcIiAgICAgICAgXVxuICAgICAgWyArSW5maW5pdHksICAgICAgICAgICAgICAgXCIrSW5maW5pdHlcIiAgICAgICAgICAgICAgIF1cbiAgICAgIF1cbiAgICAjIHByb2Jlc19hbmRfZGVzY3JpcHRpb25zLnNvcnQgKCBhLCBiICkgLT5cbiAgICAjICAgcmV0dXJuICsxIGlmIGFbIDAgXSA+IGJbIDAgXVxuICAgICMgICByZXR1cm4gLTEgaWYgYVsgMCBdIDwgYlsgMCBdXG4gICAgIyAgIHJldHVybiAgMFxuICAgIG1hdGNoZXJzICAgICAgPSAoIFsgcGFkWyAwIF0sIF0gZm9yIHBhZCBpbiBwcm9iZXNfYW5kX2Rlc2NyaXB0aW9ucyApXG4gICAgIyBkZXNjcmlwdGlvbnMgID0gKCBbIHBhZFsgMSBdLCBdIGZvciBwYWQgaW4gcHJvYmVzX2FuZF9kZXNjcmlwdGlvbnMgKVxuICAgIGZvciBwYWQgaW4gcHJvYmVzX2FuZF9kZXNjcmlwdGlvbnNcbiAgICAgIHVyZ2UgcGFkXG4gICAgQ05ELnNodWZmbGUgcHJvYmVzX2FuZF9kZXNjcmlwdGlvbnNcbiAgICBmb3IgWyBwcm9iZSwgXywgXSBpbiBwcm9iZXNfYW5kX2Rlc2NyaXB0aW9uc1xuICAgICAgcHJvYmVfYmZyID0gQ09ERUMuZW5jb2RlIFsgcHJvYmUsIF1cbiAgICAgIHlpZWxkIGxldmVsZGIucHV0IHByb2JlX2JmciwgJzEnLCByZXN1bWVcbiAgICBwcm9iZV9iZnJzICA9IHlpZWxkIHJlYWRfYWxsX2tleXMgbGV2ZWxkYiwgcmVzdW1lXG4gICAgcHJvYmVzICAgICAgPSAoIENPREVDLmRlY29kZSBwcm9iZV9iZnIgZm9yIHByb2JlX2JmciBpbiBwcm9iZV9iZnJzIClcbiAgICBzaG93X2tleXNfYW5kX2tleV9iZnJzIHByb2JlcywgcHJvYmVfYmZyc1xuICAgIGZvciBwcm9iZSwgcHJvYmVfaWR4IGluIHByb2Jlc1xuICAgICAgbWF0Y2hlciA9IG1hdGNoZXJzWyBwcm9iZV9pZHggXVxuICAgICAgVC5lcSBwcm9iZSwgbWF0Y2hlclxuICAgIGxldmVsZGIuY2xvc2UgLT4gZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJzb3J0IG1peGVkIHZhbHVlcyB3aXRoIEgyIGNvZGVjXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHNldHRpbmdzID1cbiAgICAgIGRiOiAgICAgICAgICAgbGV2ZWxkb3duXG4gICAgICBrZXlFbmNvZGluZzogICdiaW5hcnknXG4gICAgbGV2ZWxkYiA9IGxldmVsdXAgJy90bXAvaG9sbGVyaXRoMi10ZXN0Jywgc2V0dGluZ3NcbiAgICB5aWVsZCBjbGVhcl9sZXZlbGRiIGxldmVsZGIsIHJlc3VtZVxuICAgIHByb2JlcyA9IFtcbiAgICAgIG51bGxcbiAgICAgIGZhbHNlXG4gICAgICB0cnVlXG4gICAgICBDT0RFQ1sgJ3NlbnRpbmVscycgXVsgJ2ZpcnN0ZGF0ZScgXVxuICAgICAgbmV3IERhdGUgMFxuICAgICAgbmV3IERhdGUgOGUxMVxuICAgICAgbmV3IERhdGUoKVxuICAgICAgQ09ERUNbICdzZW50aW5lbHMnIF1bICdsYXN0ZGF0ZScgIF1cbiAgICAgIDEyMzRcbiAgICAgIEluZmluaXR5XG4gICAgICAnJ1xuICAgICAgJ+S4gCdcbiAgICAgICfkuIknXG4gICAgICAn5LqMJ1xuICAgICAgJ/CggIAnXG4gICAgICAn8KCAgFxceDAwJ1xuICAgICAgU3RyaW5nLmZyb21Db2RlUG9pbnQgMHgxMGZmZmZcbiAgICAgIF1cbiAgICBtYXRjaGVycyA9ICggWyBwcm9iZSwgXSBmb3IgcHJvYmUgaW4gcHJvYmVzIClcbiAgICBDTkQuc2h1ZmZsZSBwcm9iZXNcbiAgICBmb3IgcHJvYmUgaW4gcHJvYmVzXG4gICAgICBkZWJ1ZyAnwqlvTVhKWicsIHByb2JlXG4gICAgICBwcm9iZV9iZnIgPSBDT0RFQy5lbmNvZGUgWyBwcm9iZSwgXVxuICAgICAgeWllbGQgbGV2ZWxkYi5wdXQgcHJvYmVfYmZyLCAnMScsIHJlc3VtZVxuICAgIHByb2JlX2JmcnMgID0geWllbGQgcmVhZF9hbGxfa2V5cyBsZXZlbGRiLCByZXN1bWVcbiAgICAjIGRlYnVnICfCqUZkNWl3JywgcHJvYmVfYmZyc1xuICAgIHByb2JlcyAgICAgID0gKCBDT0RFQy5kZWNvZGUgcHJvYmVfYmZyIGZvciBwcm9iZV9iZnIgaW4gcHJvYmVfYmZycyApXG4gICAgc2hvd19rZXlzX2FuZF9rZXlfYmZycyBwcm9iZXMsIHByb2JlX2JmcnNcbiAgICBmb3IgcHJvYmUsIHByb2JlX2lkeCBpbiBwcm9iZXNcbiAgICAgIG1hdGNoZXIgPSBtYXRjaGVyc1sgcHJvYmVfaWR4IF1cbiAgICAgIFQuZXEgcHJvYmUsIG1hdGNoZXJcbiAgICBsZXZlbGRiLmNsb3NlIC0+IGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwic29ydCBsaXN0cyBvZiBtaXhlZCB2YWx1ZXMgd2l0aCBIMiBjb2RlY1wiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICBzZXR0aW5ncyA9XG4gICAgICBkYjogICAgICAgICAgIGxldmVsZG93blxuICAgICAga2V5RW5jb2Rpbmc6ICAnYmluYXJ5J1xuICAgIGxldmVsZGIgPSBsZXZlbHVwICcvdG1wL2hvbGxlcml0aDItdGVzdCcsIHNldHRpbmdzXG4gICAgeWllbGQgY2xlYXJfbGV2ZWxkYiBsZXZlbGRiLCByZXN1bWVcbiAgICBwcm9iZXMgPSBbXG4gICAgICBbIFwiXCIsICAgICAgICAgICAgICcnLCAgICAgICAgICAgICBdXG4gICAgICBbIFwiMTIzNFwiLCAgICAgICAgICAxMjM0LCAgICAgICAgICAgXVxuICAgICAgWyBcIkluZmluaXR5XCIsICAgICAgSW5maW5pdHksICAgICAgIF1cbiAgICAgIFsgXCJTdHJpbmcuZnJvbUNvZGVQb2ludCAweDEwZmZmZlwiLCBTdHJpbmcuZnJvbUNvZGVQb2ludCAweDEwZmZmZiBdXG4gICAgICBbIFwiZmFsc2VcIiwgICAgICAgICBmYWxzZSwgICAgICAgICAgXVxuICAgICAgWyBcIm5ldyBEYXRlIDBcIiwgICAgbmV3IERhdGUgMCwgICAgIF1cbiAgICAgIFsgXCJuZXcgRGF0ZSA4ZTExXCIsIG5ldyBEYXRlIDhlMTEsICBdXG4gICAgICBbIFwibmV3IERhdGUoKVwiLCAgICBuZXcgRGF0ZSgpLCAgICAgXVxuICAgICAgWyBcIm51bGxcIiwgICAgICAgICAgbnVsbCwgICAgICAgICAgIF1cbiAgICAgIFsgXCJ0cnVlXCIsICAgICAgICAgIHRydWUsICAgICAgICAgICBdXG4gICAgICBbIFwi5LiAXCIsICAgICAgICAgICAgJ+S4gCcsICAgICAgICAgICAgXVxuICAgICAgWyBcIuS4iVwiLCAgICAgICAgICAgICfkuIknLCAgICAgICAgICAgIF1cbiAgICAgIFsgXCLkuoxcIiwgICAgICAgICAgICAn5LqMJywgICAgICAgICAgICBdXG4gICAgICBbIFwi8KCAgFwiLCAgICAgICAgICAgICfwoICAJywgICAgICAgICAgICBdXG4gICAgICBbIFwi8KCAgFxceDAwXCIsICAgICAgICAn8KCAgFxceDAwJywgICAgICAgIF1cbiAgICAgIF1cbiAgICBtYXRjaGVycyA9ICggcHJvYmUgZm9yIHByb2JlIGluIHByb2JlcyApXG4gICAgQ05ELnNodWZmbGUgcHJvYmVzXG4gICAgZm9yIHByb2JlIGluIHByb2Jlc1xuICAgICAgZGVidWcgJ8Kpb01YSlonLCBwcm9iZVxuICAgICAgcHJvYmVfYmZyID0gQ09ERUMuZW5jb2RlIHByb2JlXG4gICAgICB5aWVsZCBsZXZlbGRiLnB1dCBwcm9iZV9iZnIsICcxJywgcmVzdW1lXG4gICAgcHJvYmVfYmZycyAgPSB5aWVsZCByZWFkX2FsbF9rZXlzIGxldmVsZGIsIHJlc3VtZVxuICAgICMgZGVidWcgJ8KpRmQ1aXcnLCBwcm9iZV9iZnJzXG4gICAgcHJvYmVzICAgICAgPSAoIENPREVDLmRlY29kZSBwcm9iZV9iZnIgZm9yIHByb2JlX2JmciBpbiBwcm9iZV9iZnJzIClcbiAgICBzaG93X2tleXNfYW5kX2tleV9iZnJzIHByb2JlcywgcHJvYmVfYmZyc1xuICAgIGZvciBwcm9iZSwgcHJvYmVfaWR4IGluIHByb2Jlc1xuICAgICAgbWF0Y2hlciA9IG1hdGNoZXJzWyBwcm9iZV9pZHggXVxuICAgICAgVC5lcSBwcm9iZSwgbWF0Y2hlclxuICAgIGxldmVsZGIuY2xvc2UgLT4gZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJzb3J0IHJvdXRlcyB3aXRoIHZhbHVlcyAoMSlcIiBdID0gKCBULCBkb25lICkgLT5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgc2V0dGluZ3MgPVxuICAgICAgZGI6ICAgICAgICAgICBsZXZlbGRvd25cbiAgICAgIGtleUVuY29kaW5nOiAgJ2JpbmFyeSdcbiAgICBsZXZlbGRiID0gbGV2ZWx1cCAnL3RtcC9ob2xsZXJpdGgyLXRlc3QnLCBzZXR0aW5nc1xuICAgIHlpZWxkIGNsZWFyX2xldmVsZGIgbGV2ZWxkYiwgcmVzdW1lXG4gICAgcHJvYmVzID0gW1xuICAgICAgWyAncG9zJywgJ3N0cm9rZW9yZGVyJywgJzM1MjUxMzU1MzI1NCcsICAgICAgICAgICfwpL+vJywgXVxuICAgICAgWyAncG9zJywgJ3N0cm9rZW9yZGVyJywgJzM1MjUxNDExMjEnLCAgICAgICAgICAgICfwoLSmJywgXVxuICAgICAgWyAncG9zJywgJ3N0cm9rZW9yZGVyJywgJzM1MjUxNDU0JywgICAgICAgICAgICAgICfwqJKhJywgXVxuICAgICAgWyAncG9zJywgJ3N0cm9rZW9yZGVyJywgJzM1MjUxNTInLCAgICAgICAgICAgICAgICfpgq0nLCBdXG4gICAgICBbICdwb3MnLCAnc3Ryb2tlb3JkZXInLCAnMzUyNTE1MjUxMTE1MTE1MTEzNTQxJywgJ/CqmqsnLCBdXG4gICAgICBbICdwb3MnLCAnc3Ryb2tlb3JkZXInLCAnMzUyNTE1MjUxMTI1MTE1MTEnLCAgICAgJ/CqmqcnLCBdXG4gICAgICBbICdwb3MnLCAnc3Ryb2tlb3JkZXInLCAnMzUyNTE1MjUxMjE0MjUxMjE0JywgICAgJ/CnkbQnLCBdXG4gICAgICBbICdwb3MnLCAnc3Ryb2tlb3JkZXInLCAnMzUyNTE1MycsICAgICAgICAgICAgICAgJ+WKrCcsIF1cbiAgICAgIFsgJ3BvcycsICdzdHJva2VvcmRlcicsICczNTI1MTUzXFx4MDAnLCAgICAgICAgICAgICAgICfliqwnLCBdXG4gICAgICBbICdwb3MnLCAnc3Ryb2tlb3JkZXJcXHgwMCcsICczNTI1MTM1NTMyNTQnLCAgICAgICAgICAn8KS/rycsIF1cbiAgICAgIF1cbiAgICBtYXRjaGVycyA9ICggcHJvYmUgZm9yIHByb2JlIGluIHByb2JlcyApXG4gICAgQ05ELnNodWZmbGUgcHJvYmVzXG4gICAgZm9yIHByb2JlIGluIHByb2Jlc1xuICAgICAgcHJvYmVfYmZyID0gQ09ERUMuZW5jb2RlIHByb2JlXG4gICAgICB5aWVsZCBsZXZlbGRiLnB1dCBwcm9iZV9iZnIsICcxJywgcmVzdW1lXG4gICAgcHJvYmVfYmZycyAgPSB5aWVsZCByZWFkX2FsbF9rZXlzIGxldmVsZGIsIHJlc3VtZVxuICAgICMgZGVidWcgJ8KpRmQ1aXcnLCBwcm9iZV9iZnJzXG4gICAgcHJvYmVzICAgICAgPSAoIENPREVDLmRlY29kZSBwcm9iZV9iZnIgZm9yIHByb2JlX2JmciBpbiBwcm9iZV9iZnJzIClcbiAgICBzaG93X2tleXNfYW5kX2tleV9iZnJzIHByb2JlcywgcHJvYmVfYmZyc1xuICAgIGZvciBwcm9iZSwgcHJvYmVfaWR4IGluIHByb2Jlc1xuICAgICAgbWF0Y2hlciA9IG1hdGNoZXJzWyBwcm9iZV9pZHggXVxuICAgICAgVC5lcSBwcm9iZSwgbWF0Y2hlclxuICAgIGxldmVsZGIuY2xvc2UgLT4gZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJzb3J0IHJvdXRlcyB3aXRoIHZhbHVlcyAoMilcIiBdID0gKCBULCBkb25lICkgLT5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgc2V0dGluZ3MgPVxuICAgICAgZGI6ICAgICAgICAgICBsZXZlbGRvd25cbiAgICAgIGtleUVuY29kaW5nOiAgJ2JpbmFyeSdcbiAgICBsZXZlbGRiID0gbGV2ZWx1cCAnL3RtcC9ob2xsZXJpdGgyLXRlc3QnLCBzZXR0aW5nc1xuICAgIHlpZWxkIGNsZWFyX2xldmVsZGIgbGV2ZWxkYiwgcmVzdW1lXG4gICAgcHJvYmVzID0gW1xuICAgICAgWyAnYScsICAgICAgbnVsbCwgXVxuICAgICAgWyAnYScsICAgICAgZmFsc2UsIF1cbiAgICAgIFsgJ2EnLCAgICAgIHRydWUsIF1cbiAgICAgIFsgJ2EnLCAgICAgIG5ldyBEYXRlKCksIF1cbiAgICAgIFsgJ2EnLCAgICAgIC1JbmZpbml0eSwgXVxuICAgICAgWyAnYScsICAgICAgKzEyMzQsIF1cbiAgICAgIFsgJ2EnLCAgICAgICtJbmZpbml0eSwgXVxuICAgICAgWyAnYScsICAgICAgJ2InLCBdXG4gICAgICBbICdhJywgICAgICAnYlxceDAwJywgXVxuICAgICAgWyAnYVxceDAwJywgICsxMjM0LCBdXG4gICAgICBbICdhXFx4MDAnLCAgJ2InLCBdXG4gICAgICBbICdhYScsICAgICArMTIzNCwgXVxuICAgICAgWyAnYWEnLCAgICAgJ2InLCBdXG4gICAgICBbICdhYScsICAgICAnYlxceDAwJywgXVxuICAgICAgXVxuICAgIG1hdGNoZXJzID0gKCBwcm9iZSBmb3IgcHJvYmUgaW4gcHJvYmVzIClcbiAgICBDTkQuc2h1ZmZsZSBwcm9iZXNcbiAgICBmb3IgcHJvYmUgaW4gcHJvYmVzXG4gICAgICBwcm9iZV9iZnIgPSBDT0RFQy5lbmNvZGUgcHJvYmVcbiAgICAgIHlpZWxkIGxldmVsZGIucHV0IHByb2JlX2JmciwgJzEnLCByZXN1bWVcbiAgICBwcm9iZV9iZnJzICA9IHlpZWxkIHJlYWRfYWxsX2tleXMgbGV2ZWxkYiwgcmVzdW1lXG4gICAgIyBkZWJ1ZyAnwqlGZDVpdycsIHByb2JlX2JmcnNcbiAgICBwcm9iZXMgICAgICA9ICggQ09ERUMuZGVjb2RlIHByb2JlX2JmciBmb3IgcHJvYmVfYmZyIGluIHByb2JlX2JmcnMgKVxuICAgIHNob3dfa2V5c19hbmRfa2V5X2JmcnMgcHJvYmVzLCBwcm9iZV9iZnJzXG4gICAgZm9yIHByb2JlLCBwcm9iZV9pZHggaW4gcHJvYmVzXG4gICAgICBtYXRjaGVyID0gbWF0Y2hlcnNbIHByb2JlX2lkeCBdXG4gICAgICBULmVxIHByb2JlLCBtYXRjaGVyXG4gICAgbGV2ZWxkYi5jbG9zZSAtPiBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgc2FtcGxlIGRhdGEgKDEpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHByb2Jlc19pZHggID0gMlxuICBpZHggPSAtMVxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBAX2ZlZWRfdGVzdF9kYXRhIGRiLCBwcm9iZXNfaWR4LCByZXN1bWVcbiAgICBpbnB1dCA9IGRiWyAnJXNlbGYnIF0uY3JlYXRlUmVhZFN0cmVhbSgpXG4gICAgaW5wdXRcbiAgICAgICMgLnBpcGUgRC4kc2hvdygpXG4gICAgICAucGlwZSAkICggeyBrZXksIHZhbHVlLCB9LCBzZW5kICkgPT4gc2VuZCBbIGtleSwgdmFsdWUsIF1cbiAgICAgIC5waXBlICQgKCBbIGtleSwgdmFsdWUsIF0sIHNlbmQgKSA9PlxuICAgICAgICBkZWJ1ZyAnwqlSbHVoRicsICggSE9MTEVSSVRILkNPREVDLmRlY29kZSBrZXkgKSwgKCBKU09OLnBhcnNlIHZhbHVlIClcbiAgICAgICAgc2VuZCBbIGtleSwgdmFsdWUsIF1cbiAgICAgIC5waXBlIEQuJGNvbGxlY3QoKVxuICAgICAgLnBpcGUgJCAoIGZhY2V0cywgc2VuZCApID0+XG4gICAgICAgICMgZGVidWcgJ8KpRnRtQjQnLCBmYWNldHNcbiAgICAgICAgaGVscCAnXFxuJyArIEhPTExFUklUSC5EVU1QLnJwcl9vZl9mYWNldHMgZGIsIGZhY2V0c1xuICAgICAgLnBpcGUgRC4kb25fZW5kID0+IGRvbmUoKVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHJldHVybiBudWxsXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZWFkIHBhcnRpYWwgUE9TIHBocmFzZXNcIiBdID0gKCBULCBkb25lICkgLT5cbiAgcHJvYmVzX2lkeCAgPSAwXG4gIGlkeCAgICAgICAgID0gLTFcbiAgY291bnQgICAgICAgPSAwXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgbWF0Y2hlcnMgPSBbXG4gICAgWyAn8Ke3nzEnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDEgXVxuICAgIFsgJ/Cnt58yJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAyIF1cbiAgICBbICfwp7efMycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgMyBdXG4gICAgWyAn8Ke3nzQnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDQgXVxuICAgIFsgJ/Cnt58nLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDUgXVxuICAgIFsgJ/Cnt582JywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCA2IF1cbiAgICBbICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgJ+WFqycsIDAgXVxuICAgIFsgJ/Cnt58nLCAnZ3VpZGUvdWNoci9oYXMnLCAn5YiAJywgMSBdXG4gICAgWyAn8Ke3nycsICdndWlkZS91Y2hyL2hhcycsICflroAnLCAyIF1cbiAgICBbICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgJ+iynScsIDQgXVxuICAgIFsgJ/Cnt58nLCAnZ3VpZGUvdWNoci9oYXMnLCAn7oe6JywgMyBdXG4gICAgXVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHJlc3VtZVxuICAgIHByZWZpeCAgICA9IFsgJ3BvcycsICdndWlkZScsIF1cbiAgICBpbnB1dCAgICAgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgcHJlZml4LCAnKidcbiAgICBkZWJ1ZyAnwqlGcGhKSycsIGlucHV0WyAnJW1ldGEnIF1cbiAgICBzZXR0aW5ncyAgPSB7IGluZGV4ZWQ6IG5vLCB9XG4gICAgaW5wdXRcbiAgICAgIC5waXBlICQgKCBwaHJhc2UsIHNlbmQgKSA9PlxuICAgICAgICBjb3VudCAgKz0gKzFcbiAgICAgICAgaWR4ICAgICs9ICsxXG4gICAgICAgIGRlYnVnICfCqVNjNUZHJywgcGhyYXNlXG4gICAgICAgICMgVC5lcSBwaHJhc2UsIG1hdGNoZXJzWyBpZHggXVxuICAgICAgLnBpcGUgRC4kb25fZW5kID0+XG4gICAgICAgIFQuZXEgY291bnQsIG1hdGNoZXJzLmxlbmd0aFxuICAgICAgICBkb25lKClcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgSEVMUEVSU1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5zaG93X2tleXNfYW5kX2tleV9iZnJzID0gKCBrZXlzLCBrZXlfYmZycyApIC0+XG4gIGYgPSAoIHAgKSAtPiAoIHQgZm9yIHQgaW4gKCBwLnRvU3RyaW5nICdoZXgnICkuc3BsaXQgLyguLikvIHdoZW4gdCBpc250ICcnICkuam9pbiAnICdcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBjb2x1bW5pZnlfc2V0dGluZ3MgPVxuICAgIHBhZGRpbmdDaHI6ICcgJ1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGRhdGEgICAgICA9IFtdXG4gIGtleV9iZnJzICA9ICggZiBwIGZvciBwIGluIGtleV9iZnJzIClcbiAgZm9yIGtleSwgaWR4IGluIGtleXNcbiAgICBrZXlfdHh0ID0gKCBycHIga2V5ICkucmVwbGFjZSAvXFxcXHUwMDAwL2csICfiiIcnXG4gICAgZGF0YS5wdXNoIHsgJ3N0cic6IGtleV90eHQsICdiZnInOiBrZXlfYmZyc1sgaWR4IF19XG4gIGhlbHAgJ1xcbicgKyBDTkQuY29sdW1uaWZ5IGRhdGEsIGNvbHVtbmlmeV9zZXR0aW5nc1xuICByZXR1cm4gbnVsbFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmdldF9uZXdfZGJfbmFtZSA9IC0+XG4gIGdldF9uZXdfZGJfbmFtZS5pZHggKz0gKzFcbiAgcmV0dXJuIFwiL3RtcC9ob2xsZXJpdGgyLXRlc3RkYi0je2dldF9uZXdfZGJfbmFtZS5pZHh9XCJcbmdldF9uZXdfZGJfbmFtZS5pZHggPSAwXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxucmVhZF9hbGxfa2V5cyA9ICggZGIsIGhhbmRsZXIgKSAtPlxuICBaID0gW11cbiAgaW5wdXQgPSBkYi5jcmVhdGVLZXlTdHJlYW0oKVxuICBpbnB1dC5vbiAnZW5kJywgLT4gaGFuZGxlciBudWxsLCBaXG4gIGlucHV0XG4gICAgLnBpcGUgJCAoIGRhdGEsIHNlbmQgKSA9PiBaLnB1c2ggZGF0YVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsZWFyX2xldmVsZGIgPSAoIGxldmVsZGIsIGhhbmRsZXIgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICByb3V0ZSA9IGxldmVsZGJbICdsb2NhdGlvbicgXVxuICAgIHlpZWxkIGxldmVsZGIuY2xvc2UgcmVzdW1lXG4gICAgeWllbGQgbGV2ZWxkb3duLmRlc3Ryb3kgcm91dGUsIHJlc3VtZVxuICAgIHlpZWxkIGxldmVsZGIub3BlbiByZXN1bWVcbiAgICAjIGhlbHAgXCJlcmFzZWQgYW5kIHJlLW9wZW5lZCBMZXZlbERCIGF0ICN7cm91dGV9XCJcbiAgICBoYW5kbGVyIG51bGxcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX21haW4gPSAoIGhhbmRsZXIgKSAtPlxuICBkYiA9IEhPTExFUklUSC5uZXdfZGIgam9pbiBfX2Rpcm5hbWUsICcuLicsICdkYnMvdGVzdHMnXG4gIHRlc3QgQCwgJ3RpbWVvdXQnOiAyNTAwXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xudW5sZXNzIG1vZHVsZS5wYXJlbnQ/XG4gIEBfbWFpbigpXG5cbiAgIyBkZWJ1ZyAnwqlQOUFPUicsICggSE9MTEVSSVRILkNPREVDWyAndHlwZW1hcmtlcnMnICBdWyAnbnVsbCcgICAgICAgXSApLnRvU3RyaW5nIDE2XG4gICMgZGVidWcgJ8KpeHhtSXAnLCAoIEhPTExFUklUSC5DT0RFQ1sgJ3R5cGVtYXJrZXJzJyAgXVsgJ2ZhbHNlJyAgICAgIF0gKS50b1N0cmluZyAxNlxuICAjIGRlYnVnICfCqVplWTI2JywgKCBIT0xMRVJJVEguQ09ERUNbICd0eXBlbWFya2VycycgIF1bICd0cnVlJyAgICAgICBdICkudG9TdHJpbmcgMTZcbiAgIyBkZWJ1ZyAnwqlXZ0VSOScsICggSE9MTEVSSVRILkNPREVDWyAndHlwZW1hcmtlcnMnICBdWyAnZGF0ZScgICAgICAgXSApLnRvU3RyaW5nIDE2XG4gICMgZGVidWcgJ8KpVW1wakonLCAoIEhPTExFUklUSC5DT0RFQ1sgJ3R5cGVtYXJrZXJzJyAgXVsgJ25pbmZpbml0eScgIF0gKS50b1N0cmluZyAxNlxuICAjIGRlYnVnICfCqVVybDBLJywgKCBIT0xMRVJJVEguQ09ERUNbICd0eXBlbWFya2VycycgIF1bICdubnVtYmVyJyAgICBdICkudG9TdHJpbmcgMTZcbiAgIyBkZWJ1ZyAnwqluRklJaScsICggSE9MTEVSSVRILkNPREVDWyAndHlwZW1hcmtlcnMnICBdWyAncG51bWJlcicgICAgXSApLnRvU3RyaW5nIDE2XG4gICMgZGVidWcgJ8KpTFo1OFInLCAoIEhPTExFUklUSC5DT0RFQ1sgJ3R5cGVtYXJrZXJzJyAgXVsgJ3BpbmZpbml0eScgIF0gKS50b1N0cmluZyAxNlxuICAjIGRlYnVnICfCqU1ZeGRhJywgKCBIT0xMRVJJVEguQ09ERUNbICd0eXBlbWFya2VycycgIF1bICd0ZXh0JyAgICAgICBdICkudG9TdHJpbmcgMTZcblxuXG5cblxuXG5cblxuXG5cblxuIl19