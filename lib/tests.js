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

  this["read sample data"] = function(T, done) {
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
          var buffer;
          help('\n' + HOLLERITH.DUMP.rpr_of_facets(db, facets));
          buffer = new Buffer(JSON.stringify(['开', '彡']));
          return debug('©GJfL6', HOLLERITH.DUMP.rpr_of_buffer(null, buffer));
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

  this["read and write phrases with unanalyzed lists"] = function(T, done) {
    var count, idx, probes;
    idx = -1;
    count = 0;
    probes = [['probe#00', 'prd', []], ['probe#01', 'prd', [-1]], ['probe#02', 'prd', [0]], ['probe#03', 'prd', [1]], ['probe#04', 'prd', [2]], ['probe#05', 'prd', [3]], ['probe#06', 'prd', [4]], ['probe#07', 'prd', [5]], ['probe#08', 'prd', [6]], ['probe#09', 'prd', [7]], ['probe#10', 'prd', [8]], ['probe#11', 'prd', [9]]];
    return step((function(_this) {
      return function*(resume) {
        var i, input, len, probe;
        (yield HOLLERITH.clear(db, resume));
        input = D.create_throughstream();
        input.pipe(HOLLERITH.$write(db, 3)).pipe(D.$on_end(function() {
          return urge("test data written");
        }));
        for (i = 0, len = probes.length; i < len; i++) {
          probe = probes[i];
          input.write(probe);
        }
        input.end();
        input = HOLLERITH.create_phrasestream(db);
        debug('©FphJK', input['%meta']);
        return input.pipe($(function(phrase, send) {
          count += +1;
          idx += +1;
          return debug('©Sc5FG', phrase);
        })).pipe(D.$on_end(function() {
          return done();
        }));
      };
    })(this));
  };

  this["reminders"] = function(T, done) {
    alert("H.$write() must test for repeated keys or implement rewriting of POS entries");
    return done();
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

//# sourceMappingURL=data:application/json;base64,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S0FBQTtBQUFBLFFBQUEsS0FBQSxHQUFRLE9BQVMsQ0FBQSxVQUFBLENBQWpCLENBQUE7QUFBQSxRQUNBLE9BQUEsT0FBYSxDQUFDLEtBQVIsQ0FBYyxNQUFkLENBQU4sQ0FEQSxDQUFBO0FBQUEsUUFFQSxPQUFBLFNBQWUsQ0FBQyxPQUFWLENBQWtCLEtBQWxCLEVBQXlCLE1BQXpCLENBQU4sQ0FGQSxDQUFBO0FBQUEsUUFHQSxPQUFBLE9BQWEsQ0FBQyxJQUFSLENBQWEsTUFBYixDQUFOLENBSEEsQ0FBQTtlQUtBLE9BQUEsQ0FBUSxJQUFSLEVBTkc7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFMLEVBRGM7RUFBQSxDQWpnQ2hCLENBQUE7O0FBQUEsRUEyZ0NBLElBQUMsQ0FBQSxLQUFELEdBQVMsU0FBRSxPQUFGLEdBQUE7QUFDUCxJQUFBLEVBQUEsR0FBSyxTQUFTLENBQUMsTUFBVixDQUFpQixJQUFBLENBQUssU0FBTCxFQUFnQixJQUFoQixFQUFzQixXQUF0QixDQUFqQixDQUFMLENBQUE7V0FDQSxJQUFBLENBQUssSUFBTCxFQUFRO0FBQUEsTUFBQSxTQUFBLEVBQVcsSUFBWDtLQUFSLEVBRk87RUFBQSxDQTNnQ1QsQ0FBQTs7QUFnaENBLEVBQUEsSUFBTyxxQkFBUDtBQUNFLElBQUEsSUFBQyxDQUFBLEtBQUQsQ0FBQSxDQUFBLENBREY7R0FoaENBO0FBQUEiLCJmaWxlIjoidGVzdHMuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJcblxuXG4jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbm5qc19wYXRoICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdwYXRoJ1xuIyBuanNfZnMgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnZnMnXG5qb2luICAgICAgICAgICAgICAgICAgICAgID0gbmpzX3BhdGguam9pblxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5DTkQgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnY25kJ1xucnByICAgICAgICAgICAgICAgICAgICAgICA9IENORC5ycHJcbmJhZGdlICAgICAgICAgICAgICAgICAgICAgPSAnSE9MTEVSSVRIL3Rlc3RzJ1xubG9nICAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdwbGFpbicsICAgICBiYWRnZVxuaW5mbyAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdpbmZvJywgICAgICBiYWRnZVxud2hpc3BlciAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICd3aGlzcGVyJywgICBiYWRnZVxuYWxlcnQgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdhbGVydCcsICAgICBiYWRnZVxuZGVidWcgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdkZWJ1ZycsICAgICBiYWRnZVxud2FybiAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICd3YXJuJywgICAgICBiYWRnZVxuaGVscCAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdoZWxwJywgICAgICBiYWRnZVxudXJnZSAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICd1cmdlJywgICAgICBiYWRnZVxuZWNobyAgICAgICAgICAgICAgICAgICAgICA9IENORC5lY2hvLmJpbmQgQ05EXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnN1c3BlbmQgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdjb2ZmZWVub2RlLXN1c3BlbmQnXG5zdGVwICAgICAgICAgICAgICAgICAgICAgID0gc3VzcGVuZC5zdGVwXG5hZnRlciAgICAgICAgICAgICAgICAgICAgID0gc3VzcGVuZC5hZnRlclxuIyBldmVudHVhbGx5ICAgICAgICAgICAgICAgID0gc3VzcGVuZC5ldmVudHVhbGx5XG4jIGltbWVkaWF0ZWx5ICAgICAgICAgICAgICAgPSBzdXNwZW5kLmltbWVkaWF0ZWx5XG4jIHJlcGVhdF9pbW1lZGlhdGVseSAgICAgICAgPSBzdXNwZW5kLnJlcGVhdF9pbW1lZGlhdGVseVxuIyBldmVyeSAgICAgICAgICAgICAgICAgICAgID0gc3VzcGVuZC5ldmVyeVxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG50ZXN0ICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnZ3V5LXRlc3QnXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkQgICAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdwaXBlZHJlYW1zMidcbiQgICAgICAgICAgICAgICAgICAgICAgICAgPSBELnJlbWl0LmJpbmQgRFxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5IT0xMRVJJVEggICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi9tYWluJ1xuZGIgICAgICAgICAgICAgICAgICAgICAgICA9IG51bGxcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuQllURVdJU0UgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2J5dGV3aXNlJ1xubGV2ZWx1cCAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2xldmVsdXAnXG5sZXZlbGRvd24gICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbGV2ZWxkb3duJ1xuQ09ERUMgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vY29kZWMnXG5cblxuIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQF9lbmNvZGVfbGlzdCA9ICggbGlzdCApIC0+XG4jICAgKCBsaXN0WyBpZHggXSA9IEJZVEVXSVNFLmVuY29kZSB2YWx1ZSApIGZvciB2YWx1ZSwgaWR4IGluIGxpc3RcbiMgICByZXR1cm4gbGlzdFxuXG4jICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBAX2RlY29kZV9saXN0ID0gKCBsaXN0ICkgLT5cbiMgICAoIGxpc3RbIGlkeCBdID0gQllURVdJU0UuZGVjb2RlIHZhbHVlICkgZm9yIHZhbHVlLCBpZHggaW4gbGlzdFxuIyAgIHJldHVybiBsaXN0XG5cbiMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEBfc29ydF9saXN0ID0gKCBsaXN0ICkgLT5cbiMgICBAX2VuY29kZV9saXN0IGxpc3RcbiMgICBsaXN0LnNvcnQgQnVmZmVyLmNvbXBhcmVcbiMgICBAX2RlY29kZV9saXN0IGxpc3RcbiMgICByZXR1cm4gbGlzdFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfZmVlZF90ZXN0X2RhdGEgPSAoIGRiLCBwcm9iZXNfaWR4LCBoYW5kbGVyICkgLT5cbiAgc3dpdGNoIHByb2Jlc19pZHhcbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIHdoZW4gMCwgMlxuICAgICAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgICAgIHlpZWxkIEhPTExFUklUSC5jbGVhciBkYiwgcmVzdW1lXG4gICAgICAgIGlucHV0ID0gRC5jcmVhdGVfdGhyb3VnaHN0cmVhbSgpXG4gICAgICAgIGlucHV0XG4gICAgICAgICAgLnBpcGUgSE9MTEVSSVRILiR3cml0ZSBkYiwgM1xuICAgICAgICAgICMgLnBpcGUgRC4kc2hvdygpXG4gICAgICAgICAgLnBpcGUgRC4kb25fZW5kID0+XG4gICAgICAgICAgICB1cmdlIFwidGVzdCBkYXRhIHdyaXR0ZW5cIlxuICAgICAgICAgICAgaGFuZGxlciBudWxsXG4gICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgICAgZm9yIHByb2JlIGluIEBfZmVlZF90ZXN0X2RhdGEucHJvYmVzWyBwcm9iZXNfaWR4IF1cbiAgICAgICAgICAjIGtleSA9IEhPTExFUklUSC5uZXdfc29fa2V5IGRiLCBwcm9iZS4uLlxuICAgICAgICAgICMgZGVidWcgJ8KpV1YwajInLCBwcm9iZVxuICAgICAgICAgIGlucHV0LndyaXRlIHByb2JlXG4gICAgICAgIGlucHV0LmVuZCgpXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICB3aGVuIDFcbiAgICAgIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgICAgICB5aWVsZCBIT0xMRVJJVEguY2xlYXIgZGIsIHJlc3VtZVxuICAgICAgICBpbnB1dCA9IEQuY3JlYXRlX3Rocm91Z2hzdHJlYW0oKVxuICAgICAgICBpbnB1dFxuICAgICAgICAgIC5waXBlIEhPTExFUklUSC4kd3JpdGUgZGIsIDNcbiAgICAgICAgICAjIC5waXBlIEQuJHNob3coKVxuICAgICAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICAgICAgdXJnZSBcInRlc3QgZGF0YSB3cml0dGVuXCJcbiAgICAgICAgICAgIGhhbmRsZXIgbnVsbFxuICAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAgIGZvciB1cmxfa2V5IGluIEBfZmVlZF90ZXN0X2RhdGEucHJvYmVzWyBwcm9iZXNfaWR4IF1cbiAgICAgICAgICBrZXkgPSBIT0xMRVJJVEgua2V5X2Zyb21fdXJsIGRiLCB1cmxfa2V5XG4gICAgICAgICAgaW5wdXQud3JpdGUga2V5XG4gICAgICAgIGlucHV0LmVuZCgpXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBlbHNlIHJldHVybiBoYW5kbGVyIG5ldyBFcnJvciBcImlsbGVnYWwgcHJvYmVzIGluZGV4ICN7cnByIHByb2Jlc19pZHh9XCJcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICByZXR1cm4gbnVsbFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfZmVlZF90ZXN0X2RhdGEucHJvYmVzID0gW11cblxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5AX2ZlZWRfdGVzdF9kYXRhLnByb2Jlcy5wdXNoIFtcbiAgWyAn8Ke3nzEnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsICAgICAgICAgICAgICAxLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfwp7efMicsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgICAgICAgICAgICAgIDIsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ/Cnt58zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAgICAgICAgICAgICAgMywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn8Ke3nzQnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsICAgICAgICAgICAgICA0LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfwp7efJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAgICAgICAgICAgICAgNSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ/Cnt582JywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAgICAgICAgICAgICAgNiwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn8Ke3nycsICdjcC9jaWQnLCAgICAgICAgICAgICAgICAgICAgICAgICAgIDE2MzI5NSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgICAgICAgICAgICAgICAgICAgWyAn5YWrJywgJ+WIgCcsICflroAnLCAn7oe6JywgJ+iynScsIF0sICAgICAgXVxuICBbICfwp7efJywgJ3JhbmsvY2p0JywgICAgICAgICAgICAgICAgICAgICAgICAgNTQzMiwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+WFqycsICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgICAgICAgICAgJzM0JywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfliIAnLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICAgICAgICAgICc1KDEyKTMnLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5a6AJywgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCAgICAgICAgICAnNDQnLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+6HuicsICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgICAgICAgICAgJzEyJywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfosp0nLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICAgICAgICAgICcyNSgxMiknLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5YWrJywgJ3JhbmsvY2p0JywgICAgICAgICAgICAgICAgICAgICAgICAgMTI1NDEsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+WIgCcsICdyYW5rL2NqdCcsICAgICAgICAgICAgICAgICAgICAgICAgIDEyNTQyLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICflroAnLCAncmFuay9janQnLCAgICAgICAgICAgICAgICAgICAgICAgICAxMjU0MywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn7oe6JywgJ3JhbmsvY2p0JywgICAgICAgICAgICAgICAgICAgICAgICAgMTI1NDQsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+iynScsICdyYW5rL2NqdCcsICAgICAgICAgICAgICAgICAgICAgICAgIDEyNTQ1LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBdXG5cbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuQF9mZWVkX3Rlc3RfZGF0YS5wcm9iZXMucHVzaCBbXG4gICdzb3xnbHlwaDrliqx8Y3AvZm5jcjp1LWNqay81MmFjfDAnXG4gICdzb3xnbHlwaDrpgq18Y3AvZm5jcjp1LWNqay85MGFkfDAnXG4gICdzb3xnbHlwaDrwoLSmfGNwL2ZuY3I6dS1jamsteGIvMjBkMjZ8MCdcbiAgJ3NvfGdseXBoOvCkv698Y3AvZm5jcjp1LWNqay14Yi8yNGZlZnwwJ1xuICAnc298Z2x5cGg68KeRtHxjcC9mbmNyOnUtY2prLXhiLzI3NDc0fDAnXG4gICdzb3xnbHlwaDrwqJKhfGNwL2ZuY3I6dS1jamsteGIvMjg0YTF8MCdcbiAgJ3NvfGdseXBoOvCqmqd8Y3AvZm5jcjp1LWNqay14Yi8yYTZhN3wwJ1xuICAnc298Z2x5cGg68Kqaq3xjcC9mbmNyOnUtY2prLXhiLzJhNmFifDAnXG4gICdzb3xnbHlwaDrwpL+vfHN0cm9rZW9yZGVyOjM1MjUxMzU1MzI1NHwwJ1xuICAnc298Z2x5cGg68KC0pnxzdHJva2VvcmRlcjozNTI1MTQxMTIxfDAnXG4gICdzb3xnbHlwaDrwqJKhfHN0cm9rZW9yZGVyOjM1MjUxNDU0fDAnXG4gICdzb3xnbHlwaDrpgq18c3Ryb2tlb3JkZXI6MzUyNTE1MnwwJ1xuICAnc298Z2x5cGg68Kqaq3xzdHJva2VvcmRlcjozNTI1MTUyNTExMTUxMTUxMTM1NDF8MCdcbiAgJ3NvfGdseXBoOvCqmqd8c3Ryb2tlb3JkZXI6MzUyNTE1MjUxMTI1MTE1MTF8MCdcbiAgJ3NvfGdseXBoOvCnkbR8c3Ryb2tlb3JkZXI6MzUyNTE1MjUxMjE0MjUxMjE0fDAnXG4gICdzb3xnbHlwaDrliqx8c3Ryb2tlb3JkZXI6MzUyNTE1M3wwJ1xuICBdXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9mZWVkX3Rlc3RfZGF0YS5wcm9iZXMucHVzaCBbXG4gIFsgJ+S4gScsICdzdHJva2Vjb3VudCcsICAgICAyLCAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfkuIknLCAnc3Ryb2tlY291bnQnLCAgICAgMywgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5aSrJywgJ3N0cm9rZWNvdW50JywgICAgIDUsICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+WciycsICdzdHJva2Vjb3VudCcsICAgICAxMSwgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICflvaInLCAnc3Ryb2tlY291bnQnLCAgICAgNywgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5LiBJywgJ2NvbXBvbmVudGNvdW50JywgIDEsICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+S4iScsICdjb21wb25lbnRjb3VudCcsICAxLCAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICflpKsnLCAnY29tcG9uZW50Y291bnQnLCAgMSwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5ZyLJywgJ2NvbXBvbmVudGNvdW50JywgIDQsICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+W9oicsICdjb21wb25lbnRjb3VudCcsICAyLCAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfkuIEnLCAnY29tcG9uZW50cycsICAgICAgWyAn5LiBJywgXSwgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+S4iScsICdjb21wb25lbnRzJywgICAgICBbICfkuIknLCBdLCAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5aSrJywgJ2NvbXBvbmVudHMnLCAgICAgIFsgJ+WkqycsIF0sICAgICAgICAgICAgICAgICAgXVxuICBbICflnIsnLCAnY29tcG9uZW50cycsICAgICAgWyAn5ZuXJywgJ+aIiCcsICflj6MnLCAn5LiAJywgXSwgXVxuICBbICflvaInLCAnY29tcG9uZW50cycsICAgICAgWyAn5byAJywgJ+W9oScsIF0sICAgICAgICAgICAgIF1cbiAgXVxuXG4jIFtcbiMgXCIxMDI3fn5+fiwwMFwiLFwiMDE1Nn5+fn4sMDEsMDUwOX5+fn4sMDIsMDAwMH5+fn4sMDMsLS0tLS0tLS0sMDQsLS0tLS0tLS0sMDUsLS0tLS0tLS0sMDYsLS0tLS0tLS0sMDcsLS0tLS0tLS0sMDgsLS0tLS0tLS0sMDksLS0tLS0tLS0sMTAsLS0tLS0tLS0sMTEsLS0tLS0tLS0sMTIsXCJcbiMgXCIwMTU2fn5+fiwwMVwiLFwiMDUwOX5+fn4sMDIsMDAwMH5+fn4sMDMsLS0tLS0tLS0sMDQsLS0tLS0tLS0sMDUsLS0tLS0tLS0sMDYsLS0tLS0tLS0sMDcsLS0tLS0tLS0sMDgsLS0tLS0tLS0sMDksLS0tLS0tLS0sMTAsLS0tLS0tLS0sMTEsLS0tLS0tLS0sMTIsMTAyN35+fn4sMDAsXCJcbiMgXCIwNTA5fn5+fiwwMlwiLFwiMDAwMH5+fn4sMDMsLS0tLS0tLS0sMDQsLS0tLS0tLS0sMDUsLS0tLS0tLS0sMDYsLS0tLS0tLS0sMDcsLS0tLS0tLS0sMDgsLS0tLS0tLS0sMDksLS0tLS0tLS0sMTAsLS0tLS0tLS0sMTEsLS0tLS0tLS0sMTIsMTAyN35+fn4sMDAsMDE1Nn5+fn4sMDEsXCJcbiMgXCIwMDAwfn5+fiwwM1wiLFwiLS0tLS0tLS0sMDQsLS0tLS0tLS0sMDUsLS0tLS0tLS0sMDYsLS0tLS0tLS0sMDcsLS0tLS0tLS0sMDgsLS0tLS0tLS0sMDksLS0tLS0tLS0sMTAsLS0tLS0tLS0sMTEsLS0tLS0tLS0sMTIsMTAyN35+fn4sMDAsMDE1Nn5+fn4sMDEsMDUwOX5+fn4sMDIsXCJcbiMgXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwid3JpdGUgd2l0aG91dCBlcnJvclwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ID0gLTFcbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgQF9mZWVkX3Rlc3RfZGF0YSBkYiwgcHJvYmVzX2lkeCwgcmVzdW1lXG4gICAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZWFkIHdpdGhvdXQgZXJyb3JcIiBdID0gKCBULCBkb25lICkgLT5cbiAgcHJvYmVzX2lkeCAgPSAwXG4gIGlkeCA9IC0xXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHJlc3VtZVxuICAgIGlucHV0ID0gSE9MTEVSSVRILmNyZWF0ZV9mYWNldHN0cmVhbSBkYlxuICAgIGlucHV0XG4gICAgICAjIC5waXBlIEhPTExFUklUSC4kdXJsX2Zyb21fa2V5IGRiXG4gICAgICAucGlwZSAkICggWyBrZXksIHZhbHVlLCBdLCBzZW5kICkgPT5cbiAgICAgICAgaWR4ICs9ICsxXG4gICAgICAgICMgVC5lcSBrZXksIG1hdGNoZXJzWyBpZHggXVxuICAgICAgLnBpcGUgRC4kb25fZW5kID0+IGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCBrZXlzIHdpdGhvdXQgZXJyb3IgKDEpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEhPTExFUklUSC5jbGVhciBkYiwgcmVzdW1lXG4gICAgIyMjIFRBSU5UIGF3YWl0aW5nIGJldHRlciBzb2x1dGlvbiAjIyNcbiAgICBOVUxMID0gSE9MTEVSSVRILl9lbmNvZGVfdmFsdWUgZGIsIDFcbiAgICBmb3IgaWR4IGluIFsgMCAuLi4gMTAgXVxuICAgICAgZGJbICclc2VsZicgXS5wdXQgKCBIT0xMRVJJVEguX2VuY29kZV9rZXkgZGIsIFsgJ3gnLCBpZHgsICd4JywgXSApLCBOVUxMXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwcm9iZV9pZHggPSA0XG4gICAgY291bnQgICAgID0gMFxuICAgIHF1ZXJ5ICAgICA9IEhPTExFUklUSC5fcXVlcnlfZnJvbV9wcmVmaXggZGIsIFsgJ3gnLCBwcm9iZV9pZHgsIF1cbiAgICBpbnB1dCAgICAgPSBkYlsgJyVzZWxmJyBdLmNyZWF0ZVJlYWRTdHJlYW0gcXVlcnlcbiAgICBpbnB1dFxuICAgICAgLnBpcGUgJCAoIHsga2V5LCB2YWx1ZSwgfSwgc2VuZCApID0+XG4gICAgICAgIGNvdW50ICs9IDFcbiAgICAgICAgVC5lcSAoIEhPTExFUklUSC5fZGVjb2RlX2tleSBkYiwga2V5IClbIDEgXSwgcHJvYmVfaWR4XG4gICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgVC5lcSBjb3VudCwgMVxuICAgICAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQga2V5cyB3aXRob3V0IGVycm9yICgyKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBIT0xMRVJJVEguY2xlYXIgZGIsIHJlc3VtZVxuICAgICMjIyBUQUlOVCBhd2FpdGluZyBiZXR0ZXIgc29sdXRpb24gIyMjXG4gICAgTlVMTCA9IEhPTExFUklUSC5fZW5jb2RlX3ZhbHVlIGRiLCAxXG4gICAgZm9yIGlkeCBpbiBbIDAgLi4uIDEwIF1cbiAgICAgIGRiWyAnJXNlbGYnIF0ucHV0ICggSE9MTEVSSVRILl9lbmNvZGVfa2V5IGRiLCBbICd4JywgaWR4LCAneCcsIF0gKSwgTlVMTFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcHJvYmVfaWR4ID0gNFxuICAgIGNvdW50ICAgICA9IDBcbiAgICBwcmVmaXggICAgPSBbICd4JywgcHJvYmVfaWR4LCBdXG4gICAgaW5wdXQgICAgID0gSE9MTEVSSVRILmNyZWF0ZV9mYWNldHN0cmVhbSBkYiwgcHJlZml4XG4gICAgaW5wdXRcbiAgICAgIC5waXBlICQgKCBmYWNldCwgc2VuZCApID0+XG4gICAgICAgIGNvdW50ICs9IDFcbiAgICAgICAgWyBrZXksIHZhbHVlLCBdID0gZmFjZXRcbiAgICAgICAgVC5lcSBrZXlbIDEgXSwgcHJvYmVfaWR4XG4gICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgVC5lcSBjb3VudCwgMVxuICAgICAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQga2V5cyB3aXRob3V0IGVycm9yICgzKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBIT0xMRVJJVEguY2xlYXIgZGIsIHJlc3VtZVxuICAgICMjIyBUQUlOVCBhd2FpdGluZyBiZXR0ZXIgc29sdXRpb24gIyMjXG4gICAgTlVMTCA9IEhPTExFUklUSC5fZW5jb2RlX3ZhbHVlIGRiLCAxXG4gICAgZm9yIGlkeCBpbiBbIDAgLi4uIDEwIF1cbiAgICAgIGRiWyAnJXNlbGYnIF0ucHV0ICggSE9MTEVSSVRILl9lbmNvZGVfa2V5IGRiLCBbICd4JywgaWR4LCAneCcsIF0gKSwgTlVMTFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcHJvYmVfaWR4ID0gM1xuICAgIGNvdW50ICAgICA9IDBcbiAgICBkZWx0YSAgICAgPSAyXG4gICAgbG8gICAgICAgID0gWyAneCcsIHByb2JlX2lkeCwgXVxuICAgIGhpICAgICAgICA9IFsgJ3gnLCBwcm9iZV9pZHggKyBkZWx0YSwgXVxuICAgIHF1ZXJ5ICAgICA9IHsgZ3RlOiAoIEhPTExFUklUSC5fZW5jb2RlX2tleSBkYiwgbG8gKSwgbHRlOiAoIEhPTExFUklUSC5fcXVlcnlfZnJvbV9wcmVmaXggZGIsIGhpIClbICdsdGUnIF0sIH1cbiAgICBpbnB1dCAgICAgPSBkYlsgJyVzZWxmJyBdLmNyZWF0ZVJlYWRTdHJlYW0gcXVlcnlcbiAgICBpbnB1dFxuICAgICAgLnBpcGUgJCAoIHsga2V5LCB2YWx1ZSwgfSwgc2VuZCApID0+XG4gICAgICAgIGNvdW50ICs9IDFcbiAgICAgICAgVC5lcSAoIEhPTExFUklUSC5fZGVjb2RlX2tleSBkYiwga2V5IClbIDEgXSwgcHJvYmVfaWR4ICsgY291bnQgLSAxXG4gICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgVC5lcSBjb3VudCwgZGVsdGEgKyAxXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCBrZXlzIHdpdGhvdXQgZXJyb3IgKDQpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEhPTExFUklUSC5jbGVhciBkYiwgcmVzdW1lXG4gICAgZm9yIGlkeCBpbiBbIDAgLi4uIDEwIF1cbiAgICAgIGRiWyAnJXNlbGYnIF0ucHV0ICggSE9MTEVSSVRILl9lbmNvZGVfa2V5IGRiLCBbICd4JywgaWR4LCAneCcsIF0gKSwgSE9MTEVSSVRILl9lbmNvZGVfdmFsdWUgZGIsIDFcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHByb2JlX2lkeCA9IDNcbiAgICBjb3VudCAgICAgPSAwXG4gICAgZGVsdGEgICAgID0gMlxuICAgIGxvICAgICAgICA9IFsgJ3gnLCBwcm9iZV9pZHgsIF1cbiAgICBoaSAgICAgICAgPSBbICd4JywgcHJvYmVfaWR4ICsgZGVsdGEsIF1cbiAgICBpbnB1dCAgICAgPSBIT0xMRVJJVEguY3JlYXRlX2ZhY2V0c3RyZWFtIGRiLCBsbywgaGlcbiAgICBpbnB1dFxuICAgICAgLnBpcGUgJCAoIFsga2V5LCB2YWx1ZSwgXSwgc2VuZCApID0+XG4gICAgICAgIGNvdW50ICs9IDFcbiAgICAgICAgVC5lcSBrZXlbIDEgXSwgcHJvYmVfaWR4ICsgY291bnQgLSAxXG4gICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgVC5lcSBjb3VudCwgZGVsdGEgKyAxXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwiY3JlYXRlX2ZhY2V0c3RyZWFtIHRocm93cyB3aXRoIHdyb25nIGFyZ3VtZW50c1wiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBtZXNzYWdlID0gXCJtdXN0IGdpdmUgYGxvX2hpbnRgIHdoZW4gYGhpX2hpbnRgIGlzIGdpdmVuXCJcbiAgVC50aHJvd3MgbWVzc2FnZSwgKCAtPiBIT0xMRVJJVEguY3JlYXRlX2ZhY2V0c3RyZWFtIGRiLCBudWxsLCBbICd4eHgnLCBdIClcbiAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZWFkIFBPUyBmYWNldHNcIiBdID0gKCBULCBkb25lICkgLT5cbiAgcHJvYmVzX2lkeCAgPSAwXG4gIGlkeCAgICAgICAgID0gLTFcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBrZXlfbWF0Y2hlcnMgPSBbXG4gICAgWyAncG9zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAyLCAn8Ke3nzInIF1cbiAgICBbICdwb3MnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDMsICfwp7efMycgXVxuICAgIFsgJ3BvcycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgNCwgJ/Cnt580JyBdXG4gICAgXVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHBocmFzZV9tYXRjaGVycyA9IFtcbiAgICBbICfwp7efMicsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgMiBdXG4gICAgWyAn8Ke3nzMnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDMgXVxuICAgIFsgJ/Cnt580JywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCA0IF1cbiAgICBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgQF9mZWVkX3Rlc3RfZGF0YSBkYiwgcHJvYmVzX2lkeCwgcmVzdW1lXG4gICAgbG8gPSBbICdwb3MnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDIsIF1cbiAgICBoaSA9IFsgJ3BvcycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgNCwgXVxuICAgICMgaW5wdXQgICA9IEhPTExFUklUSC5jcmVhdGVfa2V5c3RyZWFtIGRiLCBsb1xuICAgIGlucHV0ICAgPSBIT0xMRVJJVEguY3JlYXRlX2ZhY2V0c3RyZWFtIGRiLCBsbywgaGlcbiAgICBpbnB1dFxuICAgICAgIyAucGlwZSBIT0xMRVJJVEguJHVybF9mcm9tX2tleSBkYlxuICAgICAgLnBpcGUgJCAoIFsga2V5LCB2YWx1ZSwgXSwgc2VuZCApID0+XG4gICAgICAgIGlkeCArPSArMVxuICAgICAgICBwaHJhc2UgPSBIT0xMRVJJVEguYXNfcGhyYXNlIGRiLCBrZXksIHZhbHVlXG4gICAgICAgIFQuZXEga2V5LCBrZXlfbWF0Y2hlcnNbIGlkeCBdXG4gICAgICAgIFQuZXEgcGhyYXNlLCBwaHJhc2VfbWF0Y2hlcnNbIGlkeCBdXG4gICAgICAucGlwZSBELiRvbl9lbmQgPT4gZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZWFkIFBPUyBwaHJhc2VzICgxKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ICAgICAgICAgPSAtMVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIG1hdGNoZXJzID0gW1xuICAgIFsgJ/Cnt58yJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAyIF1cbiAgICBbICfwp7efMycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgMyBdXG4gICAgWyAn8Ke3nzQnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDQgXVxuICAgIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBAX2ZlZWRfdGVzdF9kYXRhIGRiLCBwcm9iZXNfaWR4LCByZXN1bWVcbiAgICBsbyA9IFsgJ3BvcycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgMiwgXVxuICAgIGhpID0gWyAncG9zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCA0LCBdXG4gICAgaW5wdXQgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBsbywgaGlcbiAgICBpbnB1dFxuICAgICAgLnBpcGUgJCAoIHBocmFzZSwgc2VuZCApID0+XG4gICAgICAgIGlkeCArPSArMVxuICAgICAgICBULmVxIHBocmFzZSwgbWF0Y2hlcnNbIGlkeCBdXG4gICAgICAucGlwZSBELiRvbl9lbmQgPT4gZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZWFkIFBPUyBwaHJhc2VzICgyKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ICAgICAgICAgPSAtMVxuICBjb3VudCAgICAgICA9IDBcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBtYXRjaGVycyA9IFtcbiAgICBbICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgJ+WFqycsIDAgXVxuICAgIFsgJ/Cnt58nLCAnZ3VpZGUvdWNoci9oYXMnLCAn5YiAJywgMSBdXG4gICAgWyAn8Ke3nycsICdndWlkZS91Y2hyL2hhcycsICflroAnLCAyIF1cbiAgICBbICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgJ+iynScsIDQgXVxuICAgIFsgJ/Cnt58nLCAnZ3VpZGUvdWNoci9oYXMnLCAn7oe6JywgMyBdXG4gICAgXVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHJlc3VtZVxuICAgIHByZWZpeCAgICA9IFsgJ3BvcycsICdndWlkZS91Y2hyL2hhcycsIF1cbiAgICBpbnB1dCAgICAgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgcHJlZml4XG4gICAgc2V0dGluZ3MgID0geyBpbmRleGVkOiBubywgfVxuICAgIGlucHV0XG4gICAgICAucGlwZSAkICggcGhyYXNlLCBzZW5kICkgPT5cbiAgICAgICAgY291bnQgICs9ICsxXG4gICAgICAgIGlkeCAgICArPSArMVxuICAgICAgICBULmVxIHBocmFzZSwgbWF0Y2hlcnNbIGlkeCBdXG4gICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgVC5lcSBjb3VudCwgbWF0Y2hlcnMubGVuZ3RoXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCBTUE8gcGhyYXNlc1wiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ICAgICAgICAgPSAtMVxuICBjb3VudCAgICAgICA9IDBcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBtYXRjaGVycyA9IFtcbiAgICBbICfwp7efJywgJ2NwL2NpZCcsIDE2MzI5NSBdXG4gICAgWyAn8Ke3nycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgNSBdXG4gICAgWyAn8Ke3nycsICdndWlkZS91Y2hyL2hhcycsIFsgJ+WFqycsICfliIAnLCAn5a6AJywgJ+6HuicsICfosp0nIF0gXVxuICAgIFsgJ/Cnt58nLCAncmFuay9janQnLCA1NDMyIF1cbiAgICBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgQF9mZWVkX3Rlc3RfZGF0YSBkYiwgcHJvYmVzX2lkeCwgcmVzdW1lXG4gICAgcHJlZml4ICA9IFsgJ3NwbycsICfwp7efJywgXVxuICAgIGlucHV0ICAgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgcHJlZml4XG4gICAgaW5wdXRcbiAgICAgIC5waXBlICQgKCBwaHJhc2UsIHNlbmQgKSA9PlxuICAgICAgICBkZWJ1ZyAnwqlEc0FmWScsIHJwciBwaHJhc2VcbiAgICAgICAgY291bnQgICs9ICsxXG4gICAgICAgIGlkeCAgICArPSArMVxuICAgICAgICBULmVxIHBocmFzZSwgbWF0Y2hlcnNbIGlkeCBdXG4gICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgVC5lcSBjb3VudCwgbWF0Y2hlcnMubGVuZ3RoXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCB3aXRoIHN1Yi1yZWFkICgxKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ICAgICAgICAgPSAtMVxuICBjb3VudCAgICAgICA9IDBcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBtYXRjaGVycyA9IFtcbiAgICBbICfwp7efJywgWyAn5YWrJywgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCAnMzQnIF0gXVxuICAgIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBAX2ZlZWRfdGVzdF9kYXRhIGRiLCBwcm9iZXNfaWR4LCByZXN1bWVcbiAgICBwcmVmaXggICAgPSBbICdzcG8nLCAn8Ke3nycsICdndWlkZS91Y2hyL2hhcycsIF1cbiAgICBpbnB1dCAgICAgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgcHJlZml4XG4gICAgc2V0dGluZ3MgID0geyBpbmRleGVkOiBubywgfVxuICAgIGlucHV0XG4gICAgICAucGlwZSBIT0xMRVJJVEgucmVhZF9zdWIgZGIsIHNldHRpbmdzLCAoIFsgZ2x5cGgsIHByZCwgZ3VpZGVzLCBdICkgPT5cbiAgICAgICAgc3ViX2lucHV0ID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIFsgJ3NwbycsIGd1aWRlc1sgMCBdLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsIF1cbiAgICAgICAgcmV0dXJuIFsgZ2x5cGgsIHN1Yl9pbnB1dCwgXVxuICAgICAgLnBpcGUgJCAoIHBocmFzZSwgc2VuZCApID0+XG4gICAgICAgIGNvdW50ICArPSArMVxuICAgICAgICBpZHggICAgKz0gKzFcbiAgICAgICAgVC5lcSBwaHJhc2UsIG1hdGNoZXJzWyBpZHggXVxuICAgICAgLnBpcGUgRC4kb25fZW5kID0+XG4gICAgICAgIFQuZXEgY291bnQsIG1hdGNoZXJzLmxlbmd0aFxuICAgICAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgd2l0aCBzdWItcmVhZCAoMilcIiBdID0gKCBULCBkb25lICkgLT5cbiAgcHJvYmVzX2lkeCAgPSAwXG4gIGlkeCAgICAgICAgID0gLTFcbiAgY291bnQgICAgICAgPSAwXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgbWF0Y2hlcnMgPSBbXG4gICAgWyAn8Ke3nycsIFsgJ+WFqycsICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgJzM0JyBdIF1cbiAgICBbICfwp7efJywgWyAn5YiAJywgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCAnNSgxMikzJyBdIF1cbiAgICBbICfwp7efJywgWyAn5a6AJywgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCAnNDQnIF0gXVxuICAgIFsgJ/Cnt58nLCBbICfosp0nLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICcyNSgxMiknIF0gXVxuICAgIFsgJ/Cnt58nLCBbICfuh7onLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICcxMicgXSBdXG4gICAgXVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHJlc3VtZVxuICAgIHByZWZpeCAgICA9IFsgJ3BvcycsICdndWlkZS91Y2hyL2hhcycsIF1cbiAgICBpbnB1dCAgICAgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgcHJlZml4XG4gICAgc2V0dGluZ3MgID0geyBpbmRleGVkOiBubywgfVxuICAgIGlucHV0XG4gICAgICAucGlwZSBIT0xMRVJJVEgucmVhZF9zdWIgZGIsIHNldHRpbmdzLCAoIHBocmFzZSApID0+XG4gICAgICAgIFsgZ2x5cGgsIHByZCwgZ3VpZGUsIF0gID0gcGhyYXNlXG4gICAgICAgIHByZWZpeCAgICAgICAgICAgICAgICAgID0gWyAnc3BvJywgZ3VpZGUsICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgXVxuICAgICAgICBzdWJfaW5wdXQgICAgICAgICAgICAgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBwcmVmaXhcbiAgICAgICAgcmV0dXJuIFsgZ2x5cGgsIHN1Yl9pbnB1dCwgXVxuICAgICAgLnBpcGUgJCAoIHBocmFzZSwgc2VuZCApID0+XG4gICAgICAgIGRlYnVnICfCqXF1UGJnJywgSlNPTi5zdHJpbmdpZnkgcGhyYXNlXG4gICAgICAgIGNvdW50ICArPSArMVxuICAgICAgICBpZHggICAgKz0gKzFcbiAgICAgICAgVC5lcSBwaHJhc2UsIG1hdGNoZXJzWyBpZHggXVxuICAgICAgLnBpcGUgRC4kb25fZW5kID0+XG4gICAgICAgIFQuZXEgY291bnQsIG1hdGNoZXJzLmxlbmd0aFxuICAgICAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgd2l0aCBzdWItcmVhZCAoMylcIiBdID0gKCBULCBkb25lICkgLT5cbiAgcHJvYmVzX2lkeCAgPSAwXG4gIGlkeCAgICAgICAgID0gLTFcbiAgY291bnQgICAgICAgPSAwXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgbWF0Y2hlcnMgPSBbXG4gICAgW1tcIvCnt59cIixcIuWFq1wiLFwiMzRcIl0sW1wi5YWrXCIsXCJyYW5rL2NqdFwiLDEyNTQxXV1cbiAgICBbW1wi8Ke3n1wiLFwi5YiAXCIsXCI1KDEyKTNcIl0sW1wi5YiAXCIsXCJyYW5rL2NqdFwiLDEyNTQyXV1cbiAgICBbW1wi8Ke3n1wiLFwi5a6AXCIsXCI0NFwiXSxbXCLlroBcIixcInJhbmsvY2p0XCIsMTI1NDNdXVxuICAgIFtbXCLwp7efXCIsXCLosp1cIixcIjI1KDEyKVwiXSxbXCLosp1cIixcInJhbmsvY2p0XCIsMTI1NDVdXVxuICAgIFtbXCLwp7efXCIsXCLuh7pcIixcIjEyXCJdLFtcIu6HulwiLFwicmFuay9janRcIiwxMjU0NF1dXG4gICAgXVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHJlc3VtZVxuICAgIHByZWZpeCAgICA9IFsgJ3BvcycsICdndWlkZS91Y2hyL2hhcycsIF1cbiAgICBpbnB1dCAgICAgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgcHJlZml4XG4gICAgc2V0dGluZ3MgID0geyBpbmRleGVkOiBubywgfVxuICAgIGlucHV0XG4gICAgICAucGlwZSBIT0xMRVJJVEgucmVhZF9zdWIgZGIsIHNldHRpbmdzLCAoIHBocmFzZSApID0+XG4gICAgICAgIFsgZ2x5cGgsIHByZCwgZ3VpZGUsIF0gID0gcGhyYXNlXG4gICAgICAgIHByZWZpeCAgICAgICAgICAgICAgICAgID0gWyAnc3BvJywgZ3VpZGUsICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgXVxuICAgICAgICBzdWJfaW5wdXQgICAgICAgICAgICAgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBwcmVmaXhcbiAgICAgICAgcmV0dXJuIFsgZ2x5cGgsIHN1Yl9pbnB1dCwgXVxuICAgICAgLnBpcGUgSE9MTEVSSVRILnJlYWRfc3ViIGRiLCBzZXR0aW5ncywgKCB4cGhyYXNlICkgPT5cbiAgICAgICAgWyBnbHlwaCwgWyBndWlkZSwgcHJkLCBzaGFwZWNsYXNzLCBdIF0gID0geHBocmFzZVxuICAgICAgICBwcmVmaXggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBbICdzcG8nLCBndWlkZSwgJ3JhbmsvY2p0JywgXVxuICAgICAgICBzdWJfaW5wdXQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgcHJlZml4XG4gICAgICAgIHJldHVybiBbIFsgZ2x5cGgsIGd1aWRlLCBzaGFwZWNsYXNzLCBdLCBzdWJfaW5wdXQsIF1cbiAgICAgIC5waXBlICQgKCB4cGhyYXNlLCBzZW5kICkgPT5cbiAgICAgICAgZGVidWcgJ8KpcXVQYmcnLCBKU09OLnN0cmluZ2lmeSB4cGhyYXNlXG4gICAgICAgIGNvdW50ICArPSArMVxuICAgICAgICBpZHggICAgKz0gKzFcbiAgICAgICAgVC5lcSB4cGhyYXNlLCBtYXRjaGVyc1sgaWR4IF1cbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICBULmVxIGNvdW50LCBtYXRjaGVycy5sZW5ndGhcbiAgICAgICAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJzb3J0aW5nICgxKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICBzZXR0aW5ncyA9XG4gICAgICBkYjogICAgICAgICAgIGxldmVsZG93blxuICAgICAga2V5RW5jb2Rpbmc6ICAnYmluYXJ5J1xuICAgIGxldmVsZGIgPSBsZXZlbHVwICcvdG1wL2hvbGxlcml0aDItdGVzdCcsIHNldHRpbmdzXG4gICAgeWllbGQgY2xlYXJfbGV2ZWxkYiBsZXZlbGRiLCByZXN1bWVcbiAgICBwcm9iZXMgPSBbXG4gICAgICAnYSdcbiAgICAgICdhYidcbiAgICAgICdhYmMnXG4gICAgICAnYWJjXFx4MDAnXG4gICAgICAnYWJjXFx4MDBhJ1xuICAgICAgJ2FiY2EnXG4gICAgICAnYWJjYidcbiAgICAgICdhYmNjJ1xuICAgICAgJ2FiY2QnXG4gICAgICAnYWJjZGUnXG4gICAgICAnYWJjZGVmJ1xuICAgICAgJ2FiY2RlZmcnIF1cbiAgICBtYXRjaGVycyA9IFtcbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgMHg2MiwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIDB4NjIsIDB4NjMsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCAweDYyLCAweDYzLCAweDAwLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgMHg2MiwgMHg2MywgMHgwMCwgMHg2MSwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIDB4NjIsIDB4NjMsIDB4NjEsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCAweDYyLCAweDYzLCAweDYyLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgMHg2MiwgMHg2MywgMHg2MywgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIDB4NjIsIDB4NjMsIDB4NjQsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCAweDYyLCAweDYzLCAweDY0LCAweDY1LCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgMHg2MiwgMHg2MywgMHg2NCwgMHg2NSwgMHg2NiwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIDB4NjIsIDB4NjMsIDB4NjQsIDB4NjUsIDB4NjYsIDB4NjcsIF0gXVxuICAgIENORC5zaHVmZmxlIHByb2Jlc1xuICAgIGZvciBwcm9iZSBpbiBwcm9iZXNcbiAgICAgIHByb2JlX2JmciA9IG5ldyBCdWZmZXIgcHJvYmUsICd1dGYtOCdcbiAgICAgIHlpZWxkIGxldmVsZGIucHV0IHByb2JlX2JmciwgJzEnLCByZXN1bWVcbiAgICAgIHByb2JlX2JmcnMgPSB5aWVsZCByZWFkX2FsbF9rZXlzIGxldmVsZGIsIHJlc3VtZVxuICAgIHByb2JlX2JmcnMgPSB5aWVsZCByZWFkX2FsbF9rZXlzIGxldmVsZGIsIHJlc3VtZVxuICAgICMgZGVidWcgJ8KpUlhQdnYnLCAnXFxuJyArIHJwciBwcm9iZV9iZnJzXG4gICAgZm9yIHByb2JlX2JmciwgcHJvYmVfaWR4IGluIHByb2JlX2JmcnNcbiAgICAgIG1hdGNoZXIgPSBtYXRjaGVyc1sgcHJvYmVfaWR4IF1cbiAgICAgICMjIyBUQUlOVCBsb29rcyBsaWtlIGBULmVxIGJ1ZmZlcjEsIGJ1ZmZlcjJgIGRvZXNuJ3Qgd29yay0tLXNvbWV0aW1lcy4uLiAjIyNcbiAgICAgICMgVC5lcSBwcm9iZV9iZnIsIG1hdGNoZXJcbiAgICAgIFQub2sgcHJvYmVfYmZyLmVxdWFscyBtYXRjaGVyXG4gICAgbGV2ZWxkYi5jbG9zZSAtPiBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInNvcnRpbmcgKDIpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gICMjIyBUaGlzIHRlc3QgaXMgaGVyZSBiZWNhdXNlIHRoZXJlIHNlZW1lZCB0byBvY2N1ciBzb21lIHN0cmFuZ2Ugb3JkZXJpbmcgaXNzdWVzIHdoZW5cbiAgdXNpbmcgbWVtZG93biBpbnN0ZWFkIG9mIGxldmVsZG93biAjIyNcbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgc2V0dGluZ3MgPVxuICAgICAgZGI6ICAgICAgICAgICBsZXZlbGRvd25cbiAgICAgIGtleUVuY29kaW5nOiAgJ2JpbmFyeSdcbiAgICBsZXZlbGRiID0gbGV2ZWx1cCAnL3RtcC9ob2xsZXJpdGgyLXRlc3QnLCBzZXR0aW5nc1xuICAgIHlpZWxkIGNsZWFyX2xldmVsZGIgbGV2ZWxkYiwgcmVzdW1lXG4gICAgcHJvYmVzID0gW1xuICAgICAgbmV3IEJ1ZmZlciBbIDB4MDAsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDAxLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHgwMiwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4MDMsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweGY5LCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHhmYSwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4ZmIsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweGZjLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHhmZCwgXVxuICAgICAgXVxuICAgIG1hdGNoZXJzID0gKCBwcm9iZSBmb3IgcHJvYmUgaW4gcHJvYmVzIClcbiAgICBDTkQuc2h1ZmZsZSBwcm9iZXNcbiAgICBmb3IgcHJvYmUgaW4gcHJvYmVzXG4gICAgICB5aWVsZCBsZXZlbGRiLnB1dCBwcm9iZSwgJzEnLCByZXN1bWVcbiAgICBwcm9iZV9iZnJzID0geWllbGQgcmVhZF9hbGxfa2V5cyBsZXZlbGRiLCByZXN1bWVcbiAgICBmb3IgcHJvYmVfYmZyLCBwcm9iZV9pZHggaW4gcHJvYmVfYmZyc1xuICAgICAgbWF0Y2hlciA9IG1hdGNoZXJzWyBwcm9iZV9pZHggXVxuICAgICAgIyBkZWJ1ZyAnwqkxNTA2MCcsIHByb2JlX2lkeCwgcHJvYmVfYmZyLCBtYXRjaGVyXG4gICAgICAjIyMgVEFJTlQgbG9va3MgbGlrZSBgVC5lcSBidWZmZXIxLCBidWZmZXIyYCBkb2Vzbid0IHdvcmstLS1zb21ldGltZXMuLi4gIyMjXG4gICAgICBULm9rIHByb2JlX2Jmci5lcXVhbHMgbWF0Y2hlclxuICAgIGxldmVsZGIuY2xvc2UgLT4gZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJIMiBjb2RlYyBgZW5jb2RlYCB0aHJvd3Mgb24gYW55dGhpbmcgYnV0IGEgbGlzdFwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBULnRocm93cyBcImV4cGVjdGVkIGEgbGlzdCwgZ290IGEgdGV4dFwiLCAgICAgICAgICggLT4gQ09ERUMuZW5jb2RlICd1bmFjY2FwdGFibGUnIClcbiAgVC50aHJvd3MgXCJleHBlY3RlZCBhIGxpc3QsIGdvdCBhIG51bWJlclwiLCAgICAgICAoIC0+IENPREVDLmVuY29kZSA0MiApXG4gIFQudGhyb3dzIFwiZXhwZWN0ZWQgYSBsaXN0LCBnb3QgYSBib29sZWFuXCIsICAgICAgKCAtPiBDT0RFQy5lbmNvZGUgdHJ1ZSApXG4gIFQudGhyb3dzIFwiZXhwZWN0ZWQgYSBsaXN0LCBnb3QgYSBib29sZWFuXCIsICAgICAgKCAtPiBDT0RFQy5lbmNvZGUgZmFsc2UgKVxuICBULnRocm93cyBcImV4cGVjdGVkIGEgbGlzdCwgZ290IGEganN1bmRlZmluZWRcIiwgICggLT4gQ09ERUMuZW5jb2RlKCkgKVxuICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInNvcnQgdGV4dHMgd2l0aCBIMiBjb2RlYyAoMSlcIiBdID0gKCBULCBkb25lICkgLT5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgc2V0dGluZ3MgPVxuICAgICAgZGI6ICAgICAgICAgICBsZXZlbGRvd25cbiAgICAgIGtleUVuY29kaW5nOiAgJ2JpbmFyeSdcbiAgICBsZXZlbGRiID0gbGV2ZWx1cCAnL3RtcC9ob2xsZXJpdGgyLXRlc3QnLCBzZXR0aW5nc1xuICAgIHlpZWxkIGNsZWFyX2xldmVsZGIgbGV2ZWxkYiwgcmVzdW1lXG4gICAgcHJvYmVzID0gW1xuICAgICAgJ2EnXG4gICAgICAnYWInXG4gICAgICAnYWJjJ1xuICAgICAgJ2FiY1xceDAwJ1xuICAgICAgJ2FiY1xceDAwYSdcbiAgICAgICdhYmNhJ1xuICAgICAgJ2FiY2FcXHgwMCdcbiAgICAgICdhYmNiJ1xuICAgICAgJ2FiY2MnXG4gICAgICAnYWJjZCdcbiAgICAgICdhYmNkZSdcbiAgICAgICdhYmNkZWYnXG4gICAgICAnYWJjZGVmZydcbiAgICAgIF1cbiAgICBtYXRjaGVycyA9ICggWyBwcm9iZSwgXSBmb3IgcHJvYmUgaW4gcHJvYmVzIClcbiAgICBDTkQuc2h1ZmZsZSBwcm9iZXNcbiAgICBmb3IgcHJvYmUgaW4gcHJvYmVzXG4gICAgICB5aWVsZCBsZXZlbGRiLnB1dCAoIENPREVDLmVuY29kZSBbIHByb2JlLCBdICksICcxJywgcmVzdW1lXG4gICAgcHJvYmVfYmZycyAgPSB5aWVsZCByZWFkX2FsbF9rZXlzIGxldmVsZGIsIHJlc3VtZVxuICAgIHByb2JlcyAgICAgID0gKCBDT0RFQy5kZWNvZGUgcHJvYmVfYmZyIGZvciBwcm9iZV9iZnIgaW4gcHJvYmVfYmZycyApXG4gICAgc2hvd19rZXlzX2FuZF9rZXlfYmZycyBwcm9iZXMsIHByb2JlX2JmcnNcbiAgICBmb3IgcHJvYmUsIHByb2JlX2lkeCBpbiBwcm9iZXNcbiAgICAgIG1hdGNoZXIgPSBtYXRjaGVyc1sgcHJvYmVfaWR4IF1cbiAgICAgIFQuZXEgcHJvYmUsIG1hdGNoZXJcbiAgICBsZXZlbGRiLmNsb3NlIC0+IGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwic29ydCB0ZXh0cyB3aXRoIEgyIGNvZGVjICgyKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICBzZXR0aW5ncyA9XG4gICAgICBkYjogICAgICAgICAgIGxldmVsZG93blxuICAgICAga2V5RW5jb2Rpbmc6ICAnYmluYXJ5J1xuICAgIGxldmVsZGIgPSBsZXZlbHVwICcvdG1wL2hvbGxlcml0aDItdGVzdCcsIHNldHRpbmdzXG4gICAgeWllbGQgY2xlYXJfbGV2ZWxkYiBsZXZlbGRiLCByZXN1bWVcbiAgICBwcm9iZXMgPSBbXG4gICAgICAnJ1xuICAgICAgJyAnXG4gICAgICAnYSdcbiAgICAgICdhYmMnXG4gICAgICAn5LiAJ1xuICAgICAgJ+S4gOS6jCdcbiAgICAgICfkuIDkuozkuIknXG4gICAgICAn5LiJJ1xuICAgICAgJ+S6jCdcbiAgICAgICfwoICAJ1xuICAgICAgJ/CggIBcXHgwMCdcbiAgICAgICfwoICAYSdcbiAgICAgICfwqpyAJ1xuICAgICAgJ/CrnYAnXG4gICAgICBTdHJpbmcuZnJvbUNvZGVQb2ludCAweDEwZmZmZlxuICAgICAgXVxuICAgIG1hdGNoZXJzID0gKCBbIHByb2JlLCBdIGZvciBwcm9iZSBpbiBwcm9iZXMgKVxuICAgIENORC5zaHVmZmxlIHByb2Jlc1xuICAgIGZvciBwcm9iZSBpbiBwcm9iZXNcbiAgICAgIHByb2JlX2JmciA9IENPREVDLmVuY29kZSBbIHByb2JlLCBdXG4gICAgICB5aWVsZCBsZXZlbGRiLnB1dCBwcm9iZV9iZnIsICcxJywgcmVzdW1lXG4gICAgcHJvYmVfYmZycyAgPSB5aWVsZCByZWFkX2FsbF9rZXlzIGxldmVsZGIsIHJlc3VtZVxuICAgICMgZGVidWcgJ8KpRmQ1aXcnLCBwcm9iZV9iZnJzXG4gICAgcHJvYmVzICAgICAgPSAoIENPREVDLmRlY29kZSBwcm9iZV9iZnIgZm9yIHByb2JlX2JmciBpbiBwcm9iZV9iZnJzIClcbiAgICBzaG93X2tleXNfYW5kX2tleV9iZnJzIHByb2JlcywgcHJvYmVfYmZyc1xuICAgIGZvciBwcm9iZSwgcHJvYmVfaWR4IGluIHByb2Jlc1xuICAgICAgbWF0Y2hlciA9IG1hdGNoZXJzWyBwcm9iZV9pZHggXVxuICAgICAgVC5lcSBwcm9iZSwgbWF0Y2hlclxuICAgIGxldmVsZGIuY2xvc2UgLT4gZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJzb3J0IG51bWJlcnMgd2l0aCBIMiBjb2RlYyAoMSlcIiBdID0gKCBULCBkb25lICkgLT5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgc2V0dGluZ3MgPVxuICAgICAgZGI6ICAgICAgICAgICBsZXZlbGRvd25cbiAgICAgIGtleUVuY29kaW5nOiAgJ2JpbmFyeSdcbiAgICBsZXZlbGRiID0gbGV2ZWx1cCAnL3RtcC9ob2xsZXJpdGgyLXRlc3QnLCBzZXR0aW5nc1xuICAgIHlpZWxkIGNsZWFyX2xldmVsZGIgbGV2ZWxkYiwgcmVzdW1lXG4gICAgcHJvYmVzX2FuZF9kZXNjcmlwdGlvbnMgPSBbXG4gICAgICBbIC1JbmZpbml0eSwgICAgICAgICAgICAgICBcIi1JbmZpbml0eVwiICAgICAgICAgICAgICAgXVxuICAgICAgWyAtTnVtYmVyLk1BWF9WQUxVRSwgICAgICAgXCItTnVtYmVyLk1BWF9WQUxVRVwiICAgICAgIF1cbiAgICAgIFsgTnVtYmVyLk1JTl9TQUZFX0lOVEVHRVIsIFwiTnVtYmVyLk1JTl9TQUZFX0lOVEVHRVJcIiBdXG4gICAgICBbIC0xMjM0NTY3ODksICAgICAgICAgICAgICBcIi0xMjM0NTY3ODlcIiAgICAgICAgICAgICAgXVxuICAgICAgWyAtMywgICAgICAgICAgICAgICAgICAgICAgXCItM1wiICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgIFsgLTIsICAgICAgICAgICAgICAgICAgICAgIFwiLTJcIiAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICBbIC0xLjUsICAgICAgICAgICAgICAgICAgICBcIi0xLjVcIiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgWyAtMSwgICAgICAgICAgICAgICAgICAgICAgXCItMVwiICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgIFsgLU51bWJlci5FUFNJTE9OLCAgICAgICAgIFwiLU51bWJlci5FUFNJTE9OXCIgICAgICAgICBdXG4gICAgICBbIC1OdW1iZXIuTUlOX1ZBTFVFLCAgICAgICBcIi1OdW1iZXIuTUlOX1ZBTFVFXCIgICAgICAgXVxuICAgICAgWyAwLCAgICAgICAgICAgICAgICAgICAgICAgXCIwXCIgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgIFsgK051bWJlci5NSU5fVkFMVUUsICAgICAgIFwiK051bWJlci5NSU5fVkFMVUVcIiAgICAgICBdXG4gICAgICBbICtOdW1iZXIuRVBTSUxPTiwgICAgICAgICBcIitOdW1iZXIuRVBTSUxPTlwiICAgICAgICAgXVxuICAgICAgWyArMSwgICAgICAgICAgICAgICAgICAgICAgXCIrMVwiICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgIFsgKzEuNSwgICAgICAgICAgICAgICAgICAgIFwiKzEuNVwiICAgICAgICAgICAgICAgICAgICBdXG4gICAgICBbICsyLCAgICAgICAgICAgICAgICAgICAgICBcIisyXCIgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgWyArMywgICAgICAgICAgICAgICAgICAgICAgXCIrM1wiICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgIFsgKzEyMzQ1Njc4OSwgICAgICAgICAgICAgIFwiKzEyMzQ1Njc4OVwiICAgICAgICAgICAgICBdXG4gICAgICBbIE51bWJlci5NQVhfU0FGRV9JTlRFR0VSLCBcIk51bWJlci5NQVhfU0FGRV9JTlRFR0VSXCIgXVxuICAgICAgWyBOdW1iZXIuTUFYX1ZBTFVFLCAgICAgICAgXCJOdW1iZXIuTUFYX1ZBTFVFXCIgICAgICAgIF1cbiAgICAgIFsgK0luZmluaXR5LCAgICAgICAgICAgICAgIFwiK0luZmluaXR5XCIgICAgICAgICAgICAgICBdXG4gICAgICBdXG4gICAgIyBwcm9iZXNfYW5kX2Rlc2NyaXB0aW9ucy5zb3J0ICggYSwgYiApIC0+XG4gICAgIyAgIHJldHVybiArMSBpZiBhWyAwIF0gPiBiWyAwIF1cbiAgICAjICAgcmV0dXJuIC0xIGlmIGFbIDAgXSA8IGJbIDAgXVxuICAgICMgICByZXR1cm4gIDBcbiAgICBtYXRjaGVycyAgICAgID0gKCBbIHBhZFsgMCBdLCBdIGZvciBwYWQgaW4gcHJvYmVzX2FuZF9kZXNjcmlwdGlvbnMgKVxuICAgICMgZGVzY3JpcHRpb25zICA9ICggWyBwYWRbIDEgXSwgXSBmb3IgcGFkIGluIHByb2Jlc19hbmRfZGVzY3JpcHRpb25zIClcbiAgICBmb3IgcGFkIGluIHByb2Jlc19hbmRfZGVzY3JpcHRpb25zXG4gICAgICB1cmdlIHBhZFxuICAgIENORC5zaHVmZmxlIHByb2Jlc19hbmRfZGVzY3JpcHRpb25zXG4gICAgZm9yIFsgcHJvYmUsIF8sIF0gaW4gcHJvYmVzX2FuZF9kZXNjcmlwdGlvbnNcbiAgICAgIHByb2JlX2JmciA9IENPREVDLmVuY29kZSBbIHByb2JlLCBdXG4gICAgICB5aWVsZCBsZXZlbGRiLnB1dCBwcm9iZV9iZnIsICcxJywgcmVzdW1lXG4gICAgcHJvYmVfYmZycyAgPSB5aWVsZCByZWFkX2FsbF9rZXlzIGxldmVsZGIsIHJlc3VtZVxuICAgIHByb2JlcyAgICAgID0gKCBDT0RFQy5kZWNvZGUgcHJvYmVfYmZyIGZvciBwcm9iZV9iZnIgaW4gcHJvYmVfYmZycyApXG4gICAgc2hvd19rZXlzX2FuZF9rZXlfYmZycyBwcm9iZXMsIHByb2JlX2JmcnNcbiAgICBmb3IgcHJvYmUsIHByb2JlX2lkeCBpbiBwcm9iZXNcbiAgICAgIG1hdGNoZXIgPSBtYXRjaGVyc1sgcHJvYmVfaWR4IF1cbiAgICAgIFQuZXEgcHJvYmUsIG1hdGNoZXJcbiAgICBsZXZlbGRiLmNsb3NlIC0+IGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwic29ydCBtaXhlZCB2YWx1ZXMgd2l0aCBIMiBjb2RlY1wiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICBzZXR0aW5ncyA9XG4gICAgICBkYjogICAgICAgICAgIGxldmVsZG93blxuICAgICAga2V5RW5jb2Rpbmc6ICAnYmluYXJ5J1xuICAgIGxldmVsZGIgPSBsZXZlbHVwICcvdG1wL2hvbGxlcml0aDItdGVzdCcsIHNldHRpbmdzXG4gICAgeWllbGQgY2xlYXJfbGV2ZWxkYiBsZXZlbGRiLCByZXN1bWVcbiAgICBwcm9iZXMgPSBbXG4gICAgICBudWxsXG4gICAgICBmYWxzZVxuICAgICAgdHJ1ZVxuICAgICAgQ09ERUNbICdzZW50aW5lbHMnIF1bICdmaXJzdGRhdGUnIF1cbiAgICAgIG5ldyBEYXRlIDBcbiAgICAgIG5ldyBEYXRlIDhlMTFcbiAgICAgIG5ldyBEYXRlKClcbiAgICAgIENPREVDWyAnc2VudGluZWxzJyBdWyAnbGFzdGRhdGUnICBdXG4gICAgICAxMjM0XG4gICAgICBJbmZpbml0eVxuICAgICAgJydcbiAgICAgICfkuIAnXG4gICAgICAn5LiJJ1xuICAgICAgJ+S6jCdcbiAgICAgICfwoICAJ1xuICAgICAgJ/CggIBcXHgwMCdcbiAgICAgIFN0cmluZy5mcm9tQ29kZVBvaW50IDB4MTBmZmZmXG4gICAgICBdXG4gICAgbWF0Y2hlcnMgPSAoIFsgcHJvYmUsIF0gZm9yIHByb2JlIGluIHByb2JlcyApXG4gICAgQ05ELnNodWZmbGUgcHJvYmVzXG4gICAgZm9yIHByb2JlIGluIHByb2Jlc1xuICAgICAgZGVidWcgJ8Kpb01YSlonLCBwcm9iZVxuICAgICAgcHJvYmVfYmZyID0gQ09ERUMuZW5jb2RlIFsgcHJvYmUsIF1cbiAgICAgIHlpZWxkIGxldmVsZGIucHV0IHByb2JlX2JmciwgJzEnLCByZXN1bWVcbiAgICBwcm9iZV9iZnJzICA9IHlpZWxkIHJlYWRfYWxsX2tleXMgbGV2ZWxkYiwgcmVzdW1lXG4gICAgIyBkZWJ1ZyAnwqlGZDVpdycsIHByb2JlX2JmcnNcbiAgICBwcm9iZXMgICAgICA9ICggQ09ERUMuZGVjb2RlIHByb2JlX2JmciBmb3IgcHJvYmVfYmZyIGluIHByb2JlX2JmcnMgKVxuICAgIHNob3dfa2V5c19hbmRfa2V5X2JmcnMgcHJvYmVzLCBwcm9iZV9iZnJzXG4gICAgZm9yIHByb2JlLCBwcm9iZV9pZHggaW4gcHJvYmVzXG4gICAgICBtYXRjaGVyID0gbWF0Y2hlcnNbIHByb2JlX2lkeCBdXG4gICAgICBULmVxIHByb2JlLCBtYXRjaGVyXG4gICAgbGV2ZWxkYi5jbG9zZSAtPiBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInNvcnQgbGlzdHMgb2YgbWl4ZWQgdmFsdWVzIHdpdGggSDIgY29kZWNcIiBdID0gKCBULCBkb25lICkgLT5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgc2V0dGluZ3MgPVxuICAgICAgZGI6ICAgICAgICAgICBsZXZlbGRvd25cbiAgICAgIGtleUVuY29kaW5nOiAgJ2JpbmFyeSdcbiAgICBsZXZlbGRiID0gbGV2ZWx1cCAnL3RtcC9ob2xsZXJpdGgyLXRlc3QnLCBzZXR0aW5nc1xuICAgIHlpZWxkIGNsZWFyX2xldmVsZGIgbGV2ZWxkYiwgcmVzdW1lXG4gICAgcHJvYmVzID0gW1xuICAgICAgWyBcIlwiLCAgICAgICAgICAgICAnJywgICAgICAgICAgICAgXVxuICAgICAgWyBcIjEyMzRcIiwgICAgICAgICAgMTIzNCwgICAgICAgICAgIF1cbiAgICAgIFsgXCJJbmZpbml0eVwiLCAgICAgIEluZmluaXR5LCAgICAgICBdXG4gICAgICBbIFwiU3RyaW5nLmZyb21Db2RlUG9pbnQgMHgxMGZmZmZcIiwgU3RyaW5nLmZyb21Db2RlUG9pbnQgMHgxMGZmZmYgXVxuICAgICAgWyBcImZhbHNlXCIsICAgICAgICAgZmFsc2UsICAgICAgICAgIF1cbiAgICAgIFsgXCJuZXcgRGF0ZSAwXCIsICAgIG5ldyBEYXRlIDAsICAgICBdXG4gICAgICBbIFwibmV3IERhdGUgOGUxMVwiLCBuZXcgRGF0ZSA4ZTExLCAgXVxuICAgICAgWyBcIm5ldyBEYXRlKClcIiwgICAgbmV3IERhdGUoKSwgICAgIF1cbiAgICAgIFsgXCJudWxsXCIsICAgICAgICAgIG51bGwsICAgICAgICAgICBdXG4gICAgICBbIFwidHJ1ZVwiLCAgICAgICAgICB0cnVlLCAgICAgICAgICAgXVxuICAgICAgWyBcIuS4gFwiLCAgICAgICAgICAgICfkuIAnLCAgICAgICAgICAgIF1cbiAgICAgIFsgXCLkuIlcIiwgICAgICAgICAgICAn5LiJJywgICAgICAgICAgICBdXG4gICAgICBbIFwi5LqMXCIsICAgICAgICAgICAgJ+S6jCcsICAgICAgICAgICAgXVxuICAgICAgWyBcIvCggIBcIiwgICAgICAgICAgICAn8KCAgCcsICAgICAgICAgICAgXVxuICAgICAgWyBcIvCggIBcXHgwMFwiLCAgICAgICAgJ/CggIBcXHgwMCcsICAgICAgICBdXG4gICAgICBdXG4gICAgbWF0Y2hlcnMgPSAoIHByb2JlIGZvciBwcm9iZSBpbiBwcm9iZXMgKVxuICAgIENORC5zaHVmZmxlIHByb2Jlc1xuICAgIGZvciBwcm9iZSBpbiBwcm9iZXNcbiAgICAgIGRlYnVnICfCqW9NWEpaJywgcHJvYmVcbiAgICAgIHByb2JlX2JmciA9IENPREVDLmVuY29kZSBwcm9iZVxuICAgICAgeWllbGQgbGV2ZWxkYi5wdXQgcHJvYmVfYmZyLCAnMScsIHJlc3VtZVxuICAgIHByb2JlX2JmcnMgID0geWllbGQgcmVhZF9hbGxfa2V5cyBsZXZlbGRiLCByZXN1bWVcbiAgICAjIGRlYnVnICfCqUZkNWl3JywgcHJvYmVfYmZyc1xuICAgIHByb2JlcyAgICAgID0gKCBDT0RFQy5kZWNvZGUgcHJvYmVfYmZyIGZvciBwcm9iZV9iZnIgaW4gcHJvYmVfYmZycyApXG4gICAgc2hvd19rZXlzX2FuZF9rZXlfYmZycyBwcm9iZXMsIHByb2JlX2JmcnNcbiAgICBmb3IgcHJvYmUsIHByb2JlX2lkeCBpbiBwcm9iZXNcbiAgICAgIG1hdGNoZXIgPSBtYXRjaGVyc1sgcHJvYmVfaWR4IF1cbiAgICAgIFQuZXEgcHJvYmUsIG1hdGNoZXJcbiAgICBsZXZlbGRiLmNsb3NlIC0+IGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwic29ydCByb3V0ZXMgd2l0aCB2YWx1ZXMgKDEpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHNldHRpbmdzID1cbiAgICAgIGRiOiAgICAgICAgICAgbGV2ZWxkb3duXG4gICAgICBrZXlFbmNvZGluZzogICdiaW5hcnknXG4gICAgbGV2ZWxkYiA9IGxldmVsdXAgJy90bXAvaG9sbGVyaXRoMi10ZXN0Jywgc2V0dGluZ3NcbiAgICB5aWVsZCBjbGVhcl9sZXZlbGRiIGxldmVsZGIsIHJlc3VtZVxuICAgIHByb2JlcyA9IFtcbiAgICAgIFsgJ3BvcycsICdzdHJva2VvcmRlcicsICczNTI1MTM1NTMyNTQnLCAgICAgICAgICAn8KS/rycsIF1cbiAgICAgIFsgJ3BvcycsICdzdHJva2VvcmRlcicsICczNTI1MTQxMTIxJywgICAgICAgICAgICAn8KC0picsIF1cbiAgICAgIFsgJ3BvcycsICdzdHJva2VvcmRlcicsICczNTI1MTQ1NCcsICAgICAgICAgICAgICAn8KiSoScsIF1cbiAgICAgIFsgJ3BvcycsICdzdHJva2VvcmRlcicsICczNTI1MTUyJywgICAgICAgICAgICAgICAn6YKtJywgXVxuICAgICAgWyAncG9zJywgJ3N0cm9rZW9yZGVyJywgJzM1MjUxNTI1MTExNTExNTExMzU0MScsICfwqpqrJywgXVxuICAgICAgWyAncG9zJywgJ3N0cm9rZW9yZGVyJywgJzM1MjUxNTI1MTEyNTExNTExJywgICAgICfwqpqnJywgXVxuICAgICAgWyAncG9zJywgJ3N0cm9rZW9yZGVyJywgJzM1MjUxNTI1MTIxNDI1MTIxNCcsICAgICfwp5G0JywgXVxuICAgICAgWyAncG9zJywgJ3N0cm9rZW9yZGVyJywgJzM1MjUxNTMnLCAgICAgICAgICAgICAgICfliqwnLCBdXG4gICAgICBbICdwb3MnLCAnc3Ryb2tlb3JkZXInLCAnMzUyNTE1M1xceDAwJywgICAgICAgICAgICAgICAn5YqsJywgXVxuICAgICAgWyAncG9zJywgJ3N0cm9rZW9yZGVyXFx4MDAnLCAnMzUyNTEzNTUzMjU0JywgICAgICAgICAgJ/Ckv68nLCBdXG4gICAgICBdXG4gICAgbWF0Y2hlcnMgPSAoIHByb2JlIGZvciBwcm9iZSBpbiBwcm9iZXMgKVxuICAgIENORC5zaHVmZmxlIHByb2Jlc1xuICAgIGZvciBwcm9iZSBpbiBwcm9iZXNcbiAgICAgIHByb2JlX2JmciA9IENPREVDLmVuY29kZSBwcm9iZVxuICAgICAgeWllbGQgbGV2ZWxkYi5wdXQgcHJvYmVfYmZyLCAnMScsIHJlc3VtZVxuICAgIHByb2JlX2JmcnMgID0geWllbGQgcmVhZF9hbGxfa2V5cyBsZXZlbGRiLCByZXN1bWVcbiAgICAjIGRlYnVnICfCqUZkNWl3JywgcHJvYmVfYmZyc1xuICAgIHByb2JlcyAgICAgID0gKCBDT0RFQy5kZWNvZGUgcHJvYmVfYmZyIGZvciBwcm9iZV9iZnIgaW4gcHJvYmVfYmZycyApXG4gICAgc2hvd19rZXlzX2FuZF9rZXlfYmZycyBwcm9iZXMsIHByb2JlX2JmcnNcbiAgICBmb3IgcHJvYmUsIHByb2JlX2lkeCBpbiBwcm9iZXNcbiAgICAgIG1hdGNoZXIgPSBtYXRjaGVyc1sgcHJvYmVfaWR4IF1cbiAgICAgIFQuZXEgcHJvYmUsIG1hdGNoZXJcbiAgICBsZXZlbGRiLmNsb3NlIC0+IGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwic29ydCByb3V0ZXMgd2l0aCB2YWx1ZXMgKDIpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHNldHRpbmdzID1cbiAgICAgIGRiOiAgICAgICAgICAgbGV2ZWxkb3duXG4gICAgICBrZXlFbmNvZGluZzogICdiaW5hcnknXG4gICAgbGV2ZWxkYiA9IGxldmVsdXAgJy90bXAvaG9sbGVyaXRoMi10ZXN0Jywgc2V0dGluZ3NcbiAgICB5aWVsZCBjbGVhcl9sZXZlbGRiIGxldmVsZGIsIHJlc3VtZVxuICAgIHByb2JlcyA9IFtcbiAgICAgIFsgJ2EnLCAgICAgIG51bGwsIF1cbiAgICAgIFsgJ2EnLCAgICAgIGZhbHNlLCBdXG4gICAgICBbICdhJywgICAgICB0cnVlLCBdXG4gICAgICBbICdhJywgICAgICBuZXcgRGF0ZSgpLCBdXG4gICAgICBbICdhJywgICAgICAtSW5maW5pdHksIF1cbiAgICAgIFsgJ2EnLCAgICAgICsxMjM0LCBdXG4gICAgICBbICdhJywgICAgICArSW5maW5pdHksIF1cbiAgICAgIFsgJ2EnLCAgICAgICdiJywgXVxuICAgICAgWyAnYScsICAgICAgJ2JcXHgwMCcsIF1cbiAgICAgIFsgJ2FcXHgwMCcsICArMTIzNCwgXVxuICAgICAgWyAnYVxceDAwJywgICdiJywgXVxuICAgICAgWyAnYWEnLCAgICAgKzEyMzQsIF1cbiAgICAgIFsgJ2FhJywgICAgICdiJywgXVxuICAgICAgWyAnYWEnLCAgICAgJ2JcXHgwMCcsIF1cbiAgICAgIF1cbiAgICBtYXRjaGVycyA9ICggcHJvYmUgZm9yIHByb2JlIGluIHByb2JlcyApXG4gICAgQ05ELnNodWZmbGUgcHJvYmVzXG4gICAgZm9yIHByb2JlIGluIHByb2Jlc1xuICAgICAgcHJvYmVfYmZyID0gQ09ERUMuZW5jb2RlIHByb2JlXG4gICAgICB5aWVsZCBsZXZlbGRiLnB1dCBwcm9iZV9iZnIsICcxJywgcmVzdW1lXG4gICAgcHJvYmVfYmZycyAgPSB5aWVsZCByZWFkX2FsbF9rZXlzIGxldmVsZGIsIHJlc3VtZVxuICAgICMgZGVidWcgJ8KpRmQ1aXcnLCBwcm9iZV9iZnJzXG4gICAgcHJvYmVzICAgICAgPSAoIENPREVDLmRlY29kZSBwcm9iZV9iZnIgZm9yIHByb2JlX2JmciBpbiBwcm9iZV9iZnJzIClcbiAgICBzaG93X2tleXNfYW5kX2tleV9iZnJzIHByb2JlcywgcHJvYmVfYmZyc1xuICAgIGZvciBwcm9iZSwgcHJvYmVfaWR4IGluIHByb2Jlc1xuICAgICAgbWF0Y2hlciA9IG1hdGNoZXJzWyBwcm9iZV9pZHggXVxuICAgICAgVC5lcSBwcm9iZSwgbWF0Y2hlclxuICAgIGxldmVsZGIuY2xvc2UgLT4gZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZWFkIHNhbXBsZSBkYXRhXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHByb2Jlc19pZHggID0gMlxuICBpZHggPSAtMVxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBAX2ZlZWRfdGVzdF9kYXRhIGRiLCBwcm9iZXNfaWR4LCByZXN1bWVcbiAgICBpbnB1dCA9IGRiWyAnJXNlbGYnIF0uY3JlYXRlUmVhZFN0cmVhbSgpXG4gICAgaW5wdXRcbiAgICAgICMgLnBpcGUgRC4kc2hvdygpXG4gICAgICAucGlwZSAkICggeyBrZXksIHZhbHVlLCB9LCBzZW5kICkgPT4gc2VuZCBbIGtleSwgdmFsdWUsIF1cbiAgICAgIC5waXBlICQgKCBbIGtleSwgdmFsdWUsIF0sIHNlbmQgKSA9PlxuICAgICAgICBkZWJ1ZyAnwqlSbHVoRicsICggSE9MTEVSSVRILkNPREVDLmRlY29kZSBrZXkgKSwgKCBKU09OLnBhcnNlIHZhbHVlIClcbiAgICAgICAgc2VuZCBbIGtleSwgdmFsdWUsIF1cbiAgICAgIC5waXBlIEQuJGNvbGxlY3QoKVxuICAgICAgLnBpcGUgJCAoIGZhY2V0cywgc2VuZCApID0+XG4gICAgICAgICMgZGVidWcgJ8KpRnRtQjQnLCBmYWNldHNcbiAgICAgICAgaGVscCAnXFxuJyArIEhPTExFUklUSC5EVU1QLnJwcl9vZl9mYWNldHMgZGIsIGZhY2V0c1xuICAgICAgICBidWZmZXIgPSBuZXcgQnVmZmVyIEpTT04uc3RyaW5naWZ5IFsgJ+W8gCcsICflvaEnIF1cbiAgICAgICAgZGVidWcgJ8KpR0pmTDYnLCBIT0xMRVJJVEguRFVNUC5ycHJfb2ZfYnVmZmVyIG51bGwsIGJ1ZmZlclxuICAgICAgLnBpcGUgRC4kb25fZW5kID0+IGRvbmUoKVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHJldHVybiBudWxsXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZWFkIGFuZCB3cml0ZSBrZXlzIHdpdGggbGlzdHNcIiBdID0gKCBULCBkb25lICkgLT5cbiAgcHJvYmVzX2lkeCAgPSAwXG4gIGlkeCAgICAgICAgID0gLTFcbiAgY291bnQgICAgICAgPSAwXG4gIHByb2JlcyAgICAgID0gW1xuICAgIFsgJ2EnLCAxLCBdXG4gICAgWyAnYScsIFtdLCBdXG4gICAgWyAnYScsIFsgMSwgXSwgXVxuICAgIFsgJ2EnLCBbIHRydWUsIF0sIF1cbiAgICBbICdhJywgWyAneCcsICd5JywgJ2InLCBdLCBdXG4gICAgWyAnYScsIFsgMTIwLCAxIC8gMywgXSwgXVxuICAgIFsgJ2EnLCBbICd4JywgXSwgXVxuICAgIF1cbiAgbWF0Y2hlcnMgICAgPSAoIHByb2JlIGZvciBwcm9iZSBpbiBwcm9iZXMgKVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGZvciBwcm9iZSwgcHJvYmVfaWR4IGluIHByb2Jlc1xuICAgIGJ1ZmZlciA9IEhPTExFUklUSC5DT0RFQy5lbmNvZGUgcHJvYmVcbiAgICByZXN1bHQgPSBIT0xMRVJJVEguQ09ERUMuZGVjb2RlIGJ1ZmZlclxuICAgIFQuZXEgcmVzdWx0LCBtYXRjaGVyc1sgcHJvYmVfaWR4IF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgcGFydGlhbCBQT1MgcGhyYXNlc1wiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ICAgICAgICAgPSAtMVxuICBjb3VudCAgICAgICA9IDBcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBtYXRjaGVycyA9IFtcbiAgICBbICfwp7efMScsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgMSBdXG4gICAgWyAn8Ke3nzInLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDIgXVxuICAgIFsgJ/Cnt58zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAzIF1cbiAgICBbICfwp7efNCcsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgNCBdXG4gICAgWyAn8Ke3nycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgNSBdXG4gICAgWyAn8Ke3nzYnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDYgXVxuICAgIFsgJ/Cnt58nLCAnZ3VpZGUvdWNoci9oYXMnLCAn5YWrJywgMCBdXG4gICAgWyAn8Ke3nycsICdndWlkZS91Y2hyL2hhcycsICfliIAnLCAxIF1cbiAgICBbICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgJ+WugCcsIDIgXVxuICAgIFsgJ/Cnt58nLCAnZ3VpZGUvdWNoci9oYXMnLCAn6LKdJywgNCBdXG4gICAgWyAn8Ke3nycsICdndWlkZS91Y2hyL2hhcycsICfuh7onLCAzIF1cbiAgICBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgQF9mZWVkX3Rlc3RfZGF0YSBkYiwgcHJvYmVzX2lkeCwgcmVzdW1lXG4gICAgcHJlZml4ICAgID0gWyAncG9zJywgJ2d1aWRlJywgXVxuICAgIGlucHV0ICAgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBwcmVmaXgsICcqJ1xuICAgIGRlYnVnICfCqUZwaEpLJywgaW5wdXRbICclbWV0YScgXVxuICAgIHNldHRpbmdzICA9IHsgaW5kZXhlZDogbm8sIH1cbiAgICBpbnB1dFxuICAgICAgLnBpcGUgJCAoIHBocmFzZSwgc2VuZCApID0+XG4gICAgICAgIGNvdW50ICArPSArMVxuICAgICAgICBpZHggICAgKz0gKzFcbiAgICAgICAgZGVidWcgJ8KpU2M1RkcnLCBwaHJhc2VcbiAgICAgICAgIyBULmVxIHBocmFzZSwgbWF0Y2hlcnNbIGlkeCBdXG4gICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgVC5lcSBjb3VudCwgbWF0Y2hlcnMubGVuZ3RoXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCBhbmQgd3JpdGUgcGhyYXNlcyB3aXRoIHVuYW5hbHl6ZWQgbGlzdHNcIiBdID0gKCBULCBkb25lICkgLT5cbiAgaWR4ICAgICAgICAgPSAtMVxuICBjb3VudCAgICAgICA9IDBcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBwcm9iZXMgPSBbXG4gICAgWyAncHJvYmUjMDAnLCAncHJkJywgW10sIF1cbiAgICBbICdwcm9iZSMwMScsICdwcmQnLCBbIC0xIF0sIF1cbiAgICBbICdwcm9iZSMwMicsICdwcmQnLCBbICAwIF0sIF1cbiAgICBbICdwcm9iZSMwMycsICdwcmQnLCBbICAxIF0sIF1cbiAgICBbICdwcm9iZSMwNCcsICdwcmQnLCBbICAyIF0sIF1cbiAgICBbICdwcm9iZSMwNScsICdwcmQnLCBbICAzIF0sIF1cbiAgICBbICdwcm9iZSMwNicsICdwcmQnLCBbICA0IF0sIF1cbiAgICBbICdwcm9iZSMwNycsICdwcmQnLCBbICA1IF0sIF1cbiAgICBbICdwcm9iZSMwOCcsICdwcmQnLCBbICA2IF0sIF1cbiAgICBbICdwcm9iZSMwOScsICdwcmQnLCBbICA3IF0sIF1cbiAgICBbICdwcm9iZSMxMCcsICdwcmQnLCBbICA4IF0sIF1cbiAgICBbICdwcm9iZSMxMScsICdwcmQnLCBbICA5IF0sIF1cbiAgICBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgSE9MTEVSSVRILmNsZWFyIGRiLCByZXN1bWVcbiAgICBpbnB1dCA9IEQuY3JlYXRlX3Rocm91Z2hzdHJlYW0oKVxuICAgIGlucHV0XG4gICAgICAucGlwZSBIT0xMRVJJVEguJHdyaXRlIGRiLCAzXG4gICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgdXJnZSBcInRlc3QgZGF0YSB3cml0dGVuXCJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGlucHV0LndyaXRlIHByb2JlIGZvciBwcm9iZSBpbiBwcm9iZXNcbiAgICBpbnB1dC5lbmQoKVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaW5wdXQgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYlxuICAgIGRlYnVnICfCqUZwaEpLJywgaW5wdXRbICclbWV0YScgXVxuICAgIGlucHV0XG4gICAgICAucGlwZSAkICggcGhyYXNlLCBzZW5kICkgPT5cbiAgICAgICAgY291bnQgICs9ICsxXG4gICAgICAgIGlkeCAgICArPSArMVxuICAgICAgICBkZWJ1ZyAnwqlTYzVGRycsIHBocmFzZVxuICAgICAgICAjIFQuZXEgcGhyYXNlLCBtYXRjaGVyc1sgaWR4IF1cbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICAjIFQuZXEgY291bnQsIG1hdGNoZXJzLmxlbmd0aFxuICAgICAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlbWluZGVyc1wiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBhbGVydCBcIkguJHdyaXRlKCkgbXVzdCB0ZXN0IGZvciByZXBlYXRlZCBrZXlzIG9yIGltcGxlbWVudCByZXdyaXRpbmcgb2YgUE9TIGVudHJpZXNcIlxuICBkb25lKClcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIEhFTFBFUlNcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuc2hvd19rZXlzX2FuZF9rZXlfYmZycyA9ICgga2V5cywga2V5X2JmcnMgKSAtPlxuICBmID0gKCBwICkgLT4gKCB0IGZvciB0IGluICggcC50b1N0cmluZyAnaGV4JyApLnNwbGl0IC8oLi4pLyB3aGVuIHQgaXNudCAnJyApLmpvaW4gJyAnXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgY29sdW1uaWZ5X3NldHRpbmdzID1cbiAgICBwYWRkaW5nQ2hyOiAnICdcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBkYXRhICAgICAgPSBbXVxuICBrZXlfYmZycyAgPSAoIGYgcCBmb3IgcCBpbiBrZXlfYmZycyApXG4gIGZvciBrZXksIGlkeCBpbiBrZXlzXG4gICAga2V5X3R4dCA9ICggcnByIGtleSApLnJlcGxhY2UgL1xcXFx1MDAwMC9nLCAn4oiHJ1xuICAgIGRhdGEucHVzaCB7ICdzdHInOiBrZXlfdHh0LCAnYmZyJzoga2V5X2JmcnNbIGlkeCBdfVxuICBoZWxwICdcXG4nICsgQ05ELmNvbHVtbmlmeSBkYXRhLCBjb2x1bW5pZnlfc2V0dGluZ3NcbiAgcmV0dXJuIG51bGxcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5nZXRfbmV3X2RiX25hbWUgPSAtPlxuICBnZXRfbmV3X2RiX25hbWUuaWR4ICs9ICsxXG4gIHJldHVybiBcIi90bXAvaG9sbGVyaXRoMi10ZXN0ZGItI3tnZXRfbmV3X2RiX25hbWUuaWR4fVwiXG5nZXRfbmV3X2RiX25hbWUuaWR4ID0gMFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbnJlYWRfYWxsX2tleXMgPSAoIGRiLCBoYW5kbGVyICkgLT5cbiAgWiA9IFtdXG4gIGlucHV0ID0gZGIuY3JlYXRlS2V5U3RyZWFtKClcbiAgaW5wdXQub24gJ2VuZCcsIC0+IGhhbmRsZXIgbnVsbCwgWlxuICBpbnB1dFxuICAgIC5waXBlICQgKCBkYXRhLCBzZW5kICkgPT4gWi5wdXNoIGRhdGFcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGVhcl9sZXZlbGRiID0gKCBsZXZlbGRiLCBoYW5kbGVyICkgLT5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgcm91dGUgPSBsZXZlbGRiWyAnbG9jYXRpb24nIF1cbiAgICB5aWVsZCBsZXZlbGRiLmNsb3NlIHJlc3VtZVxuICAgIHlpZWxkIGxldmVsZG93bi5kZXN0cm95IHJvdXRlLCByZXN1bWVcbiAgICB5aWVsZCBsZXZlbGRiLm9wZW4gcmVzdW1lXG4gICAgIyBoZWxwIFwiZXJhc2VkIGFuZCByZS1vcGVuZWQgTGV2ZWxEQiBhdCAje3JvdXRlfVwiXG4gICAgaGFuZGxlciBudWxsXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9tYWluID0gKCBoYW5kbGVyICkgLT5cbiAgZGIgPSBIT0xMRVJJVEgubmV3X2RiIGpvaW4gX19kaXJuYW1lLCAnLi4nLCAnZGJzL3Rlc3RzJ1xuICB0ZXN0IEAsICd0aW1lb3V0JzogMjUwMFxuXG4jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbnVubGVzcyBtb2R1bGUucGFyZW50P1xuICBAX21haW4oKVxuXG4gICMgZGVidWcgJ8KpUDlBT1InLCAoIEhPTExFUklUSC5DT0RFQ1sgJ3R5cGVtYXJrZXJzJyAgXVsgJ251bGwnICAgICAgIF0gKS50b1N0cmluZyAxNlxuICAjIGRlYnVnICfCqXh4bUlwJywgKCBIT0xMRVJJVEguQ09ERUNbICd0eXBlbWFya2VycycgIF1bICdmYWxzZScgICAgICBdICkudG9TdHJpbmcgMTZcbiAgIyBkZWJ1ZyAnwqlaZVkyNicsICggSE9MTEVSSVRILkNPREVDWyAndHlwZW1hcmtlcnMnICBdWyAndHJ1ZScgICAgICAgXSApLnRvU3RyaW5nIDE2XG4gICMgZGVidWcgJ8KpV2dFUjknLCAoIEhPTExFUklUSC5DT0RFQ1sgJ3R5cGVtYXJrZXJzJyAgXVsgJ2RhdGUnICAgICAgIF0gKS50b1N0cmluZyAxNlxuICAjIGRlYnVnICfCqVVtcGpKJywgKCBIT0xMRVJJVEguQ09ERUNbICd0eXBlbWFya2VycycgIF1bICduaW5maW5pdHknICBdICkudG9TdHJpbmcgMTZcbiAgIyBkZWJ1ZyAnwqlVcmwwSycsICggSE9MTEVSSVRILkNPREVDWyAndHlwZW1hcmtlcnMnICBdWyAnbm51bWJlcicgICAgXSApLnRvU3RyaW5nIDE2XG4gICMgZGVidWcgJ8KpbkZJSWknLCAoIEhPTExFUklUSC5DT0RFQ1sgJ3R5cGVtYXJrZXJzJyAgXVsgJ3BudW1iZXInICAgIF0gKS50b1N0cmluZyAxNlxuICAjIGRlYnVnICfCqUxaNThSJywgKCBIT0xMRVJJVEguQ09ERUNbICd0eXBlbWFya2VycycgIF1bICdwaW5maW5pdHknICBdICkudG9TdHJpbmcgMTZcbiAgIyBkZWJ1ZyAnwqlNWXhkYScsICggSE9MTEVSSVRILkNPREVDWyAndHlwZW1hcmtlcnMnICBdWyAndGV4dCcgICAgICAgXSApLnRvU3RyaW5nIDE2XG5cblxuXG5cblxuXG5cblxuXG5cbiJdfQ==