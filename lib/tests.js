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
            input.pipe(HOLLERITH.$write(db)).pipe(D.$on_end(function() {
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
            input.pipe(HOLLERITH.$write(db)).pipe(D.$on_end(function() {
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
    phrase_matchers = [['pos', '𧷟2', 'guide/lineup/length', 2], ['pos', '𧷟3', 'guide/lineup/length', 3], ['pos', '𧷟4', 'guide/lineup/length', 4]];
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
    matchers = [['pos', '𧷟2', 'guide/lineup/length', 2], ['pos', '𧷟3', 'guide/lineup/length', 3], ['pos', '𧷟4', 'guide/lineup/length', 4]];
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
    matchers = [['pos', '𧷟', 'guide/uchr/has', '八', 0], ['pos', '𧷟', 'guide/uchr/has', '刀', 1], ['pos', '𧷟', 'guide/uchr/has', '宀', 2], ['pos', '𧷟', 'guide/uchr/has', '貝', 4], ['pos', '𧷟', 'guide/uchr/has', '', 3]];
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
    matchers = [['spo', '𧷟', 'cp/cid', 163295], ['spo', '𧷟', 'guide/lineup/length', 5], ['spo', '𧷟', 'guide/uchr/has', ['八', '刀', '宀', '', '貝']], ['spo', '𧷟', 'rank/cjt', 5432]];
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
    matchers = [['𧷟', ['spo', '八', 'factor/strokeclass/wbf', '34']]];
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
          var glyph, guides, phrasetype, prd, sub_input;
          phrasetype = arg[0], glyph = arg[1], prd = arg[2], guides = arg[3];
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
    matchers = [['𧷟', ['spo', '八', 'factor/strokeclass/wbf', '34']], ['𧷟', ['spo', '刀', 'factor/strokeclass/wbf', '5(12)3']], ['𧷟', ['spo', '宀', 'factor/strokeclass/wbf', '44']], ['𧷟', ['spo', '貝', 'factor/strokeclass/wbf', '25(12)']], ['𧷟', ['spo', '', 'factor/strokeclass/wbf', '12']]];
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
          var _, glyph, guide, prd, sub_input;
          _ = phrase[0], glyph = phrase[1], prd = phrase[2], guide = phrase[3];
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
    matchers = [[["𧷟", "八", "34"], ["spo", "八", "rank/cjt", 12541]], [["𧷟", "刀", "5(12)3"], ["spo", "刀", "rank/cjt", 12542]], [["𧷟", "宀", "44"], ["spo", "宀", "rank/cjt", 12543]], [["𧷟", "貝", "25(12)"], ["spo", "貝", "rank/cjt", 12545]], [["𧷟", "", "12"], ["spo", "", "rank/cjt", 12544]]];
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
          var _, glyph, guide, prd, sub_input;
          _ = phrase[0], glyph = phrase[1], prd = phrase[2], guide = phrase[3];
          prefix = ['spo', guide, 'factor/strokeclass/wbf'];
          sub_input = HOLLERITH.create_phrasestream(db, prefix);
          return [glyph, sub_input];
        })).pipe(HOLLERITH.read_sub(db, settings, function(xphrase) {
          var _, glyph, guide, prd, ref, shapeclass, sub_input;
          glyph = xphrase[0], (ref = xphrase[1], _ = ref[0], guide = ref[1], prd = ref[2], shapeclass = ref[3]);
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

//# sourceMappingURL=data:application/json;base64,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LENBQUEsQ0FBQSxDQURGO0dBcmpDQTtBQUFBIiwiZmlsZSI6InRlc3RzLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiXG5cblxuIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5uanNfcGF0aCAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAncGF0aCdcbiMgbmpzX2ZzICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2ZzJ1xuam9pbiAgICAgICAgICAgICAgICAgICAgICA9IG5qc19wYXRoLmpvaW5cbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuQ05EICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2NuZCdcbnJwciAgICAgICAgICAgICAgICAgICAgICAgPSBDTkQucnByXG5iYWRnZSAgICAgICAgICAgICAgICAgICAgID0gJ0hPTExFUklUSC90ZXN0cydcbmxvZyAgICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAncGxhaW4nLCAgICAgYmFkZ2VcbmluZm8gICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnaW5mbycsICAgICAgYmFkZ2VcbndoaXNwZXIgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnd2hpc3BlcicsICAgYmFkZ2VcbmFsZXJ0ICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnYWxlcnQnLCAgICAgYmFkZ2VcbmRlYnVnICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnZGVidWcnLCAgICAgYmFkZ2Vcbndhcm4gICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnd2FybicsICAgICAgYmFkZ2VcbmhlbHAgICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnaGVscCcsICAgICAgYmFkZ2VcbnVyZ2UgICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAndXJnZScsICAgICAgYmFkZ2VcbmVjaG8gICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZWNoby5iaW5kIENORFxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5zdXNwZW5kICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnY29mZmVlbm9kZS1zdXNwZW5kJ1xuc3RlcCAgICAgICAgICAgICAgICAgICAgICA9IHN1c3BlbmQuc3RlcFxuYWZ0ZXIgICAgICAgICAgICAgICAgICAgICA9IHN1c3BlbmQuYWZ0ZXJcbiMgZXZlbnR1YWxseSAgICAgICAgICAgICAgICA9IHN1c3BlbmQuZXZlbnR1YWxseVxuIyBpbW1lZGlhdGVseSAgICAgICAgICAgICAgID0gc3VzcGVuZC5pbW1lZGlhdGVseVxuIyByZXBlYXRfaW1tZWRpYXRlbHkgICAgICAgID0gc3VzcGVuZC5yZXBlYXRfaW1tZWRpYXRlbHlcbiMgZXZlcnkgICAgICAgICAgICAgICAgICAgICA9IHN1c3BlbmQuZXZlcnlcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxudGVzdCAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2d1eS10ZXN0J1xuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5EICAgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAncGlwZWRyZWFtczInXG4kICAgICAgICAgICAgICAgICAgICAgICAgID0gRC5yZW1pdC5iaW5kIERcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuSE9MTEVSSVRIICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vbWFpbidcbmRiICAgICAgICAgICAgICAgICAgICAgICAgPSBudWxsXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkJZVEVXSVNFICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdieXRld2lzZSdcbmxldmVsdXAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdsZXZlbHVwJ1xubGV2ZWxkb3duICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2xldmVsZG93bidcbkNPREVDICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL2NvZGVjJ1xuXG5cbiMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEBfZW5jb2RlX2xpc3QgPSAoIGxpc3QgKSAtPlxuIyAgICggbGlzdFsgaWR4IF0gPSBCWVRFV0lTRS5lbmNvZGUgdmFsdWUgKSBmb3IgdmFsdWUsIGlkeCBpbiBsaXN0XG4jICAgcmV0dXJuIGxpc3RcblxuIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQF9kZWNvZGVfbGlzdCA9ICggbGlzdCApIC0+XG4jICAgKCBsaXN0WyBpZHggXSA9IEJZVEVXSVNFLmRlY29kZSB2YWx1ZSApIGZvciB2YWx1ZSwgaWR4IGluIGxpc3RcbiMgICByZXR1cm4gbGlzdFxuXG4jICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBAX3NvcnRfbGlzdCA9ICggbGlzdCApIC0+XG4jICAgQF9lbmNvZGVfbGlzdCBsaXN0XG4jICAgbGlzdC5zb3J0IEJ1ZmZlci5jb21wYXJlXG4jICAgQF9kZWNvZGVfbGlzdCBsaXN0XG4jICAgcmV0dXJuIGxpc3RcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX2ZlZWRfdGVzdF9kYXRhID0gKCBkYiwgcHJvYmVzX2lkeCwgaGFuZGxlciApIC0+XG4gIHN3aXRjaCBwcm9iZXNfaWR4XG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICB3aGVuIDAsIDJcbiAgICAgIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgICAgICB5aWVsZCBIT0xMRVJJVEguY2xlYXIgZGIsIHJlc3VtZVxuICAgICAgICBpbnB1dCA9IEQuY3JlYXRlX3Rocm91Z2hzdHJlYW0oKVxuICAgICAgICBpbnB1dFxuICAgICAgICAgIC5waXBlIEhPTExFUklUSC4kd3JpdGUgZGJcbiAgICAgICAgICAjIC5waXBlIEQuJHNob3coKVxuICAgICAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICAgICAgdXJnZSBcInRlc3QgZGF0YSB3cml0dGVuXCJcbiAgICAgICAgICAgIGhhbmRsZXIgbnVsbFxuICAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAgIGZvciBwcm9iZSBpbiBAX2ZlZWRfdGVzdF9kYXRhLnByb2Jlc1sgcHJvYmVzX2lkeCBdXG4gICAgICAgICAgIyBrZXkgPSBIT0xMRVJJVEgubmV3X3NvX2tleSBkYiwgcHJvYmUuLi5cbiAgICAgICAgICAjIGRlYnVnICfCqVdWMGoyJywgcHJvYmVcbiAgICAgICAgICBpbnB1dC53cml0ZSBwcm9iZVxuICAgICAgICBpbnB1dC5lbmQoKVxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgd2hlbiAxXG4gICAgICBzdGVwICggcmVzdW1lICkgPT5cbiAgICAgICAgeWllbGQgSE9MTEVSSVRILmNsZWFyIGRiLCByZXN1bWVcbiAgICAgICAgaW5wdXQgPSBELmNyZWF0ZV90aHJvdWdoc3RyZWFtKClcbiAgICAgICAgaW5wdXRcbiAgICAgICAgICAucGlwZSBIT0xMRVJJVEguJHdyaXRlIGRiXG4gICAgICAgICAgIyAucGlwZSBELiRzaG93KClcbiAgICAgICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgICAgIHVyZ2UgXCJ0ZXN0IGRhdGEgd3JpdHRlblwiXG4gICAgICAgICAgICBoYW5kbGVyIG51bGxcbiAgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgICBmb3IgdXJsX2tleSBpbiBAX2ZlZWRfdGVzdF9kYXRhLnByb2Jlc1sgcHJvYmVzX2lkeCBdXG4gICAgICAgICAga2V5ID0gSE9MTEVSSVRILmtleV9mcm9tX3VybCBkYiwgdXJsX2tleVxuICAgICAgICAgIGlucHV0LndyaXRlIGtleVxuICAgICAgICBpbnB1dC5lbmQoKVxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgZWxzZSByZXR1cm4gaGFuZGxlciBuZXcgRXJyb3IgXCJpbGxlZ2FsIHByb2JlcyBpbmRleCAje3JwciBwcm9iZXNfaWR4fVwiXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcmV0dXJuIG51bGxcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX2ZlZWRfdGVzdF9kYXRhLnByb2JlcyA9IFtdXG5cbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuQF9mZWVkX3Rlc3RfZGF0YS5wcm9iZXMucHVzaCBbXG4gIFsgJ/Cnt58xJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAgICAgICAgICAgICAgMSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn8Ke3nzInLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsICAgICAgICAgICAgICAyLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfwp7efMycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgICAgICAgICAgICAgIDMsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ/Cnt580JywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAgICAgICAgICAgICAgNCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn8Ke3nycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgICAgICAgICAgICAgIDUsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfwp7efNicsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgICAgICAgICAgICAgIDYsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ/Cnt58nLCAnY3AvY2lkJywgICAgICAgICAgICAgICAgICAgICAgICAgICAxNjMyOTUsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn8Ke3nycsICdndWlkZS91Y2hyL2hhcycsICAgICAgICAgICAgICAgICAgIFsgJ+WFqycsICfliIAnLCAn5a6AJywgJ+6HuicsICfosp0nLCBdLCAgICAgIF1cbiAgWyAn8Ke3nycsICdyYW5rL2NqdCcsICAgICAgICAgICAgICAgICAgICAgICAgIDU0MzIsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICflhasnLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICAgICAgICAgICczNCcsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5YiAJywgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCAgICAgICAgICAnNSgxMikzJywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+WugCcsICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgICAgICAgICAgJzQ0JywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfuh7onLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICAgICAgICAgICcxMicsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn6LKdJywgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCAgICAgICAgICAnMjUoMTIpJywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+WFqycsICdyYW5rL2NqdCcsICAgICAgICAgICAgICAgICAgICAgICAgIDEyNTQxLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfliIAnLCAncmFuay9janQnLCAgICAgICAgICAgICAgICAgICAgICAgICAxMjU0MiwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5a6AJywgJ3JhbmsvY2p0JywgICAgICAgICAgICAgICAgICAgICAgICAgMTI1NDMsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+6HuicsICdyYW5rL2NqdCcsICAgICAgICAgICAgICAgICAgICAgICAgIDEyNTQ0LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfosp0nLCAncmFuay9janQnLCAgICAgICAgICAgICAgICAgICAgICAgICAxMjU0NSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgXVxuXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkBfZmVlZF90ZXN0X2RhdGEucHJvYmVzLnB1c2ggW1xuICAnc298Z2x5cGg65YqsfGNwL2ZuY3I6dS1jamsvNTJhY3wwJ1xuICAnc298Z2x5cGg66YKtfGNwL2ZuY3I6dS1jamsvOTBhZHwwJ1xuICAnc298Z2x5cGg68KC0pnxjcC9mbmNyOnUtY2prLXhiLzIwZDI2fDAnXG4gICdzb3xnbHlwaDrwpL+vfGNwL2ZuY3I6dS1jamsteGIvMjRmZWZ8MCdcbiAgJ3NvfGdseXBoOvCnkbR8Y3AvZm5jcjp1LWNqay14Yi8yNzQ3NHwwJ1xuICAnc298Z2x5cGg68KiSoXxjcC9mbmNyOnUtY2prLXhiLzI4NGExfDAnXG4gICdzb3xnbHlwaDrwqpqnfGNwL2ZuY3I6dS1jamsteGIvMmE2YTd8MCdcbiAgJ3NvfGdseXBoOvCqmqt8Y3AvZm5jcjp1LWNqay14Yi8yYTZhYnwwJ1xuICAnc298Z2x5cGg68KS/r3xzdHJva2VvcmRlcjozNTI1MTM1NTMyNTR8MCdcbiAgJ3NvfGdseXBoOvCgtKZ8c3Ryb2tlb3JkZXI6MzUyNTE0MTEyMXwwJ1xuICAnc298Z2x5cGg68KiSoXxzdHJva2VvcmRlcjozNTI1MTQ1NHwwJ1xuICAnc298Z2x5cGg66YKtfHN0cm9rZW9yZGVyOjM1MjUxNTJ8MCdcbiAgJ3NvfGdseXBoOvCqmqt8c3Ryb2tlb3JkZXI6MzUyNTE1MjUxMTE1MTE1MTEzNTQxfDAnXG4gICdzb3xnbHlwaDrwqpqnfHN0cm9rZW9yZGVyOjM1MjUxNTI1MTEyNTExNTExfDAnXG4gICdzb3xnbHlwaDrwp5G0fHN0cm9rZW9yZGVyOjM1MjUxNTI1MTIxNDI1MTIxNHwwJ1xuICAnc298Z2x5cGg65YqsfHN0cm9rZW9yZGVyOjM1MjUxNTN8MCdcbiAgXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfZmVlZF90ZXN0X2RhdGEucHJvYmVzLnB1c2ggW1xuICBbICfkuIEnLCAnc3Ryb2tlY291bnQnLCAgICAgMiwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5LiJJywgJ3N0cm9rZWNvdW50JywgICAgIDMsICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+WkqycsICdzdHJva2Vjb3VudCcsICAgICA1LCAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICflnIsnLCAnc3Ryb2tlY291bnQnLCAgICAgMTEsICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5b2iJywgJ3N0cm9rZWNvdW50JywgICAgIDcsICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+S4gScsICdjb21wb25lbnRjb3VudCcsICAxLCAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfkuIknLCAnY29tcG9uZW50Y291bnQnLCAgMSwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5aSrJywgJ2NvbXBvbmVudGNvdW50JywgIDEsICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+WciycsICdjb21wb25lbnRjb3VudCcsICA0LCAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICflvaInLCAnY29tcG9uZW50Y291bnQnLCAgMiwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5LiBJywgJ2NvbXBvbmVudHMnLCAgICAgIFsgJ+S4gScsIF0sICAgICAgICAgICAgICAgICAgXVxuICBbICfkuIknLCAnY29tcG9uZW50cycsICAgICAgWyAn5LiJJywgXSwgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+WkqycsICdjb21wb25lbnRzJywgICAgICBbICflpKsnLCBdLCAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5ZyLJywgJ2NvbXBvbmVudHMnLCAgICAgIFsgJ+WblycsICfmiIgnLCAn5Y+jJywgJ+S4gCcsIF0sIF1cbiAgWyAn5b2iJywgJ2NvbXBvbmVudHMnLCAgICAgIFsgJ+W8gCcsICflvaEnLCBdLCAgICAgICAgICAgICBdXG4gIF1cblxuIyBwb3N8Z3VpZGUva3dpYy9zb3J0Y29kZVxuXG4jICMgW1xuIyAjIFwiMTAyN35+fn4sMDBcIixcIjAxNTZ+fn5+LDAxLDA1MDl+fn5+LDAyLDAwMDB+fn5+LDAzLC0tLS0tLS0tLDA0LC0tLS0tLS0tLDA1LC0tLS0tLS0tLDA2LC0tLS0tLS0tLDA3LC0tLS0tLS0tLDA4LC0tLS0tLS0tLDA5LC0tLS0tLS0tLDEwLC0tLS0tLS0tLDExLC0tLS0tLS0tLDEyLFwiXG4jICMgXCIwMTU2fn5+fiwwMVwiLFwiMDUwOX5+fn4sMDIsMDAwMH5+fn4sMDMsLS0tLS0tLS0sMDQsLS0tLS0tLS0sMDUsLS0tLS0tLS0sMDYsLS0tLS0tLS0sMDcsLS0tLS0tLS0sMDgsLS0tLS0tLS0sMDksLS0tLS0tLS0sMTAsLS0tLS0tLS0sMTEsLS0tLS0tLS0sMTIsMTAyN35+fn4sMDAsXCJcbiMgIyBcIjA1MDl+fn5+LDAyXCIsXCIwMDAwfn5+fiwwMywtLS0tLS0tLSwwNCwtLS0tLS0tLSwwNSwtLS0tLS0tLSwwNiwtLS0tLS0tLSwwNywtLS0tLS0tLSwwOCwtLS0tLS0tLSwwOSwtLS0tLS0tLSwxMCwtLS0tLS0tLSwxMSwtLS0tLS0tLSwxMiwxMDI3fn5+fiwwMCwwMTU2fn5+fiwwMSxcIlxuIyAjIFwiMDAwMH5+fn4sMDNcIixcIi0tLS0tLS0tLDA0LC0tLS0tLS0tLDA1LC0tLS0tLS0tLDA2LC0tLS0tLS0tLDA3LC0tLS0tLS0tLDA4LC0tLS0tLS0tLDA5LC0tLS0tLS0tLDEwLC0tLS0tLS0tLDExLC0tLS0tLS0tLDEyLDEwMjd+fn5+LDAwLDAxNTZ+fn5+LDAxLDA1MDl+fn5+LDAyLFwiXG4jICMgXVxuXG4jIDAwODd+fn5+LDAwLDAyOTF+fn5+LDAxLDA1NTV+fn5+LDAyLC0tLS0tLS0tLDAzLC0tLS0tLS0tLDA0LC0tLS0tLS0tLDA1LC0tLS0tLS0tLDA2LC0tLS0tLS0tLDA3LC0tLS0tLS0tLDA4LC0tLS0tLS0tLDA5LC0tLS0tLS0tLDEwLC0tLS0tLS0tLDExLC0tLS0tLS0tLDEyLHzwppaIfDBcbiMgMDA4N35+fn4sMDAsMDI5MX5+fn4sMDEsMDgyM3gyaC0sMDIsLS0tLS0tLS0sMDMsLS0tLS0tLS0sMDQsLS0tLS0tLS0sMDUsLS0tLS0tLS0sMDYsLS0tLS0tLS0sMDcsLS0tLS0tLS0sMDgsLS0tLS0tLS0sMDksLS0tLS0tLS0sMTAsLS0tLS0tLS0sMTEsLS0tLS0tLS0sMTIsfOiBl3wwXG4jIDAwODd+fn5+LDAwLDAyOTF+fn5+LDAxLDEwMjN+fn5+LDAyLC0tLS0tLS0tLDAzLC0tLS0tLS0tLDA0LC0tLS0tLS0tLDA1LC0tLS0tLS0tLDA2LC0tLS0tLS0tLDA3LC0tLS0tLS0tLDA4LC0tLS0tLS0tLDA5LC0tLS0tLS0tLDEwLC0tLS0tLS0tLDExLC0tLS0tLS0tLDEyLHzwpIuVfDBcbiMgMDA4N35+fn4sMDAsMDI5NH5+fn4sMDEsMDA2MH5+fn4sMDIsLS0tLS0tLS0sMDMsLS0tLS0tLS0sMDQsLS0tLS0tLS0sMDUsLS0tLS0tLS0sMDYsLS0tLS0tLS0sMDcsLS0tLS0tLS0sMDgsLS0tLS0tLS0sMDksLS0tLS0tLS0sMTAsLS0tLS0tLS0sMTEsLS0tLS0tLS0sMTIsfPCmlpR8MFxuIyAwMDg3fn5+fiwwMCwwMjk0fn5+fiwwMSwwNTU1fn5+fiwwMiwtLS0tLS0tLSwwMywtLS0tLS0tLSwwNCwtLS0tLS0tLSwwNSwtLS0tLS0tLSwwNiwtLS0tLS0tLSwwNywtLS0tLS0tLSwwOCwtLS0tLS0tLSwwOSwtLS0tLS0tLSwxMCwtLS0tLS0tLSwxMSwtLS0tLS0tLSwxMix88KaXhnwwXG4jIDAwODd+fn5+LDAwLDAyOTV+fn5+LDAxLDA4MDJ+fn5+LDAyLDA5NTh+fn5+LDAzLC0tLS0tLS0tLDA0LC0tLS0tLS0tLDA1LC0tLS0tLS0tLDA2LC0tLS0tLS0tLDA3LC0tLS0tLS0tLDA4LC0tLS0tLS0tLDA5LC0tLS0tLS0tLDEwLC0tLS0tLS0tLDExLC0tLS0tLS0tLDEyLHzwpaq7fDBcbiMgMDA4N35+fn4sMDAsMDMxMn5+fn4sMDEsLS0tLS0tLS0sMDIsLS0tLS0tLS0sMDMsLS0tLS0tLS0sMDQsLS0tLS0tLS0sMDUsLS0tLS0tLS0sMDYsLS0tLS0tLS0sMDcsLS0tLS0tLS0sMDgsLS0tLS0tLS0sMDksLS0tLS0tLS0sMTAsLS0tLS0tLS0sMTEsLS0tLS0tLS0sMTIsfPCmlLJ8MFxuIyAwMDg3fn5+fiwwMCwwMzE0fn5+fiwwMSwxMTczfn5+fiwwMiwtLS0tLS0tLSwwMywtLS0tLS0tLSwwNCwtLS0tLS0tLSwwNSwtLS0tLS0tLSwwNiwtLS0tLS0tLSwwNywtLS0tLS0tLSwwOCwtLS0tLS0tLSwwOSwtLS0tLS0tLSwxMCwtLS0tLS0tLSwxMSwtLS0tLS0tLSwxMix88KaVgHwwXG4jIDAwODd+fn5+LDAwLDAzMTl+fn5+LDAxLC0tLS0tLS0tLDAyLC0tLS0tLS0tLDAzLC0tLS0tLS0tLDA0LC0tLS0tLS0tLDA1LC0tLS0tLS0tLDA2LC0tLS0tLS0tLDA3LC0tLS0tLS0tLDA4LC0tLS0tLS0tLDA5LC0tLS0tLS0tLDEwLC0tLS0tLS0tLDExLC0tLS0tLS0tLDEyLHzwppWHfDBcbiMgMDA4N35+fn4sMDAsMDM1NX5+fn4sMDEsLS0tLS0tLS0sMDIsLS0tLS0tLS0sMDMsLS0tLS0tLS0sMDQsLS0tLS0tLS0sMDUsLS0tLS0tLS0sMDYsLS0tLS0tLS0sMDcsLS0tLS0tLS0sMDgsLS0tLS0tLS0sMDksLS0tLS0tLS0sMTAsLS0tLS0tLS0sMTEsLS0tLS0tLS0sMTIsfPCmlYZ8MFxuIyAwMDg3fn5+fiwwMCwwMzczfn5+fiwwMSwwMjg0fn5+fiwwMiwtLS0tLS0tLSwwMywtLS0tLS0tLSwwNCwtLS0tLS0tLSwwNSwtLS0tLS0tLSwwNiwtLS0tLS0tLSwwNywtLS0tLS0tLSwwOCwtLS0tLS0tLSwwOSwtLS0tLS0tLSwxMCwtLS0tLS0tLSwxMSwtLS0tLS0tLSwxMix88KaVp3wwXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJ3cml0ZSB3aXRob3V0IGVycm9yXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHByb2Jlc19pZHggID0gMFxuICBpZHggPSAtMVxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBAX2ZlZWRfdGVzdF9kYXRhIGRiLCBwcm9iZXNfaWR4LCByZXN1bWVcbiAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgd2l0aG91dCBlcnJvclwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ID0gLTFcbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgQF9mZWVkX3Rlc3RfZGF0YSBkYiwgcHJvYmVzX2lkeCwgcmVzdW1lXG4gICAgaW5wdXQgPSBIT0xMRVJJVEguY3JlYXRlX2ZhY2V0c3RyZWFtIGRiXG4gICAgaW5wdXRcbiAgICAgICMgLnBpcGUgSE9MTEVSSVRILiR1cmxfZnJvbV9rZXkgZGJcbiAgICAgIC5waXBlICQgKCBbIGtleSwgdmFsdWUsIF0sIHNlbmQgKSA9PlxuICAgICAgICBpZHggKz0gKzFcbiAgICAgICAgIyBULmVxIGtleSwgbWF0Y2hlcnNbIGlkeCBdXG4gICAgICAucGlwZSBELiRvbl9lbmQgPT4gZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZWFkIGtleXMgd2l0aG91dCBlcnJvciAoMSlcIiBdID0gKCBULCBkb25lICkgLT5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgSE9MTEVSSVRILmNsZWFyIGRiLCByZXN1bWVcbiAgICAjIyMgVEFJTlQgYXdhaXRpbmcgYmV0dGVyIHNvbHV0aW9uICMjI1xuICAgIE5VTEwgPSBIT0xMRVJJVEguX2VuY29kZV92YWx1ZSBkYiwgMVxuICAgIGZvciBpZHggaW4gWyAwIC4uLiAxMCBdXG4gICAgICBkYlsgJyVzZWxmJyBdLnB1dCAoIEhPTExFUklUSC5fZW5jb2RlX2tleSBkYiwgWyAneCcsIGlkeCwgJ3gnLCBdICksIE5VTExcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHByb2JlX2lkeCA9IDRcbiAgICBjb3VudCAgICAgPSAwXG4gICAgcXVlcnkgICAgID0gSE9MTEVSSVRILl9xdWVyeV9mcm9tX3ByZWZpeCBkYiwgWyAneCcsIHByb2JlX2lkeCwgXVxuICAgIGlucHV0ICAgICA9IGRiWyAnJXNlbGYnIF0uY3JlYXRlUmVhZFN0cmVhbSBxdWVyeVxuICAgIGlucHV0XG4gICAgICAucGlwZSAkICggeyBrZXksIHZhbHVlLCB9LCBzZW5kICkgPT5cbiAgICAgICAgY291bnQgKz0gMVxuICAgICAgICBULmVxICggSE9MTEVSSVRILl9kZWNvZGVfa2V5IGRiLCBrZXkgKVsgMSBdLCBwcm9iZV9pZHhcbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICBULmVxIGNvdW50LCAxXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCBrZXlzIHdpdGhvdXQgZXJyb3IgKDIpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEhPTExFUklUSC5jbGVhciBkYiwgcmVzdW1lXG4gICAgIyMjIFRBSU5UIGF3YWl0aW5nIGJldHRlciBzb2x1dGlvbiAjIyNcbiAgICBOVUxMID0gSE9MTEVSSVRILl9lbmNvZGVfdmFsdWUgZGIsIDFcbiAgICBmb3IgaWR4IGluIFsgMCAuLi4gMTAgXVxuICAgICAgZGJbICclc2VsZicgXS5wdXQgKCBIT0xMRVJJVEguX2VuY29kZV9rZXkgZGIsIFsgJ3gnLCBpZHgsICd4JywgXSApLCBOVUxMXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwcm9iZV9pZHggPSA0XG4gICAgY291bnQgICAgID0gMFxuICAgIHByZWZpeCAgICA9IFsgJ3gnLCBwcm9iZV9pZHgsIF1cbiAgICBpbnB1dCAgICAgPSBIT0xMRVJJVEguY3JlYXRlX2ZhY2V0c3RyZWFtIGRiLCBwcmVmaXhcbiAgICBpbnB1dFxuICAgICAgLnBpcGUgJCAoIGZhY2V0LCBzZW5kICkgPT5cbiAgICAgICAgY291bnQgKz0gMVxuICAgICAgICBbIGtleSwgdmFsdWUsIF0gPSBmYWNldFxuICAgICAgICBULmVxIGtleVsgMSBdLCBwcm9iZV9pZHhcbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICBULmVxIGNvdW50LCAxXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCBrZXlzIHdpdGhvdXQgZXJyb3IgKDMpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEhPTExFUklUSC5jbGVhciBkYiwgcmVzdW1lXG4gICAgIyMjIFRBSU5UIGF3YWl0aW5nIGJldHRlciBzb2x1dGlvbiAjIyNcbiAgICBOVUxMID0gSE9MTEVSSVRILl9lbmNvZGVfdmFsdWUgZGIsIDFcbiAgICBmb3IgaWR4IGluIFsgMCAuLi4gMTAgXVxuICAgICAgZGJbICclc2VsZicgXS5wdXQgKCBIT0xMRVJJVEguX2VuY29kZV9rZXkgZGIsIFsgJ3gnLCBpZHgsICd4JywgXSApLCBOVUxMXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwcm9iZV9pZHggPSAzXG4gICAgY291bnQgICAgID0gMFxuICAgIGRlbHRhICAgICA9IDJcbiAgICBsbyAgICAgICAgPSBbICd4JywgcHJvYmVfaWR4LCBdXG4gICAgaGkgICAgICAgID0gWyAneCcsIHByb2JlX2lkeCArIGRlbHRhLCBdXG4gICAgcXVlcnkgICAgID0geyBndGU6ICggSE9MTEVSSVRILl9lbmNvZGVfa2V5IGRiLCBsbyApLCBsdGU6ICggSE9MTEVSSVRILl9xdWVyeV9mcm9tX3ByZWZpeCBkYiwgaGkgKVsgJ2x0ZScgXSwgfVxuICAgIGlucHV0ICAgICA9IGRiWyAnJXNlbGYnIF0uY3JlYXRlUmVhZFN0cmVhbSBxdWVyeVxuICAgIGlucHV0XG4gICAgICAucGlwZSAkICggeyBrZXksIHZhbHVlLCB9LCBzZW5kICkgPT5cbiAgICAgICAgY291bnQgKz0gMVxuICAgICAgICBULmVxICggSE9MTEVSSVRILl9kZWNvZGVfa2V5IGRiLCBrZXkgKVsgMSBdLCBwcm9iZV9pZHggKyBjb3VudCAtIDFcbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICBULmVxIGNvdW50LCBkZWx0YSArIDFcbiAgICAgICAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZWFkIGtleXMgd2l0aG91dCBlcnJvciAoNClcIiBdID0gKCBULCBkb25lICkgLT5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgSE9MTEVSSVRILmNsZWFyIGRiLCByZXN1bWVcbiAgICBmb3IgaWR4IGluIFsgMCAuLi4gMTAgXVxuICAgICAgZGJbICclc2VsZicgXS5wdXQgKCBIT0xMRVJJVEguX2VuY29kZV9rZXkgZGIsIFsgJ3gnLCBpZHgsICd4JywgXSApLCBIT0xMRVJJVEguX2VuY29kZV92YWx1ZSBkYiwgMVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcHJvYmVfaWR4ID0gM1xuICAgIGNvdW50ICAgICA9IDBcbiAgICBkZWx0YSAgICAgPSAyXG4gICAgbG8gICAgICAgID0gWyAneCcsIHByb2JlX2lkeCwgXVxuICAgIGhpICAgICAgICA9IFsgJ3gnLCBwcm9iZV9pZHggKyBkZWx0YSwgXVxuICAgIGlucHV0ICAgICA9IEhPTExFUklUSC5jcmVhdGVfZmFjZXRzdHJlYW0gZGIsIGxvLCBoaVxuICAgIGlucHV0XG4gICAgICAucGlwZSAkICggWyBrZXksIHZhbHVlLCBdLCBzZW5kICkgPT5cbiAgICAgICAgY291bnQgKz0gMVxuICAgICAgICBULmVxIGtleVsgMSBdLCBwcm9iZV9pZHggKyBjb3VudCAtIDFcbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICBULmVxIGNvdW50LCBkZWx0YSArIDFcbiAgICAgICAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJjcmVhdGVfZmFjZXRzdHJlYW0gdGhyb3dzIHdpdGggd3JvbmcgYXJndW1lbnRzXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIG1lc3NhZ2UgPSBcIm11c3QgZ2l2ZSBgbG9faGludGAgd2hlbiBgaGlfaGludGAgaXMgZ2l2ZW5cIlxuICBULnRocm93cyBtZXNzYWdlLCAoIC0+IEhPTExFUklUSC5jcmVhdGVfZmFjZXRzdHJlYW0gZGIsIG51bGwsIFsgJ3h4eCcsIF0gKVxuICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgUE9TIGZhY2V0c1wiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ICAgICAgICAgPSAtMVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGtleV9tYXRjaGVycyA9IFtcbiAgICBbICdwb3MnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDIsICfwp7efMicgXVxuICAgIFsgJ3BvcycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgMywgJ/Cnt58zJyBdXG4gICAgWyAncG9zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCA0LCAn8Ke3nzQnIF1cbiAgICBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcGhyYXNlX21hdGNoZXJzID0gW1xuICAgIFsgJ3BvcycsICfwp7efMicsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgMiBdXG4gICAgWyAncG9zJywgJ/Cnt58zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAzIF1cbiAgICBbICdwb3MnLCAn8Ke3nzQnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDQgXVxuICAgIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBAX2ZlZWRfdGVzdF9kYXRhIGRiLCBwcm9iZXNfaWR4LCByZXN1bWVcbiAgICBsbyA9IFsgJ3BvcycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgMiwgXVxuICAgIGhpID0gWyAncG9zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCA0LCBdXG4gICAgIyBpbnB1dCAgID0gSE9MTEVSSVRILmNyZWF0ZV9rZXlzdHJlYW0gZGIsIGxvXG4gICAgaW5wdXQgICA9IEhPTExFUklUSC5jcmVhdGVfZmFjZXRzdHJlYW0gZGIsIGxvLCBoaVxuICAgIGlucHV0XG4gICAgICAjIC5waXBlIEhPTExFUklUSC4kdXJsX2Zyb21fa2V5IGRiXG4gICAgICAucGlwZSAkICggWyBrZXksIHZhbHVlLCBdLCBzZW5kICkgPT5cbiAgICAgICAgaWR4ICs9ICsxXG4gICAgICAgIHBocmFzZSA9IEhPTExFUklUSC5hc19waHJhc2UgZGIsIGtleSwgdmFsdWVcbiAgICAgICAgVC5lcSBrZXksIGtleV9tYXRjaGVyc1sgaWR4IF1cbiAgICAgICAgVC5lcSBwaHJhc2UsIHBocmFzZV9tYXRjaGVyc1sgaWR4IF1cbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PiBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgUE9TIHBocmFzZXMgKDEpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHByb2Jlc19pZHggID0gMFxuICBpZHggICAgICAgICA9IC0xXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgbWF0Y2hlcnMgPSBbXG4gICAgWyAncG9zJywgJ/Cnt58yJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAyIF1cbiAgICBbICdwb3MnLCAn8Ke3nzMnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDMgXVxuICAgIFsgJ3BvcycsICfwp7efNCcsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgNCBdXG4gICAgXVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHJlc3VtZVxuICAgIGxvID0gWyAncG9zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAyLCBdXG4gICAgaGkgPSBbICdwb3MnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDQsIF1cbiAgICBpbnB1dCAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIGxvLCBoaVxuICAgIGlucHV0XG4gICAgICAucGlwZSAkICggcGhyYXNlLCBzZW5kICkgPT5cbiAgICAgICAgaWR4ICs9ICsxXG4gICAgICAgIFQuZXEgcGhyYXNlLCBtYXRjaGVyc1sgaWR4IF1cbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PiBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgUE9TIHBocmFzZXMgKDIpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHByb2Jlc19pZHggID0gMFxuICBpZHggICAgICAgICA9IC0xXG4gIGNvdW50ICAgICAgID0gMFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIG1hdGNoZXJzID0gW1xuICAgIFsgJ3BvcycsICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgJ+WFqycsIDAgXVxuICAgIFsgJ3BvcycsICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgJ+WIgCcsIDEgXVxuICAgIFsgJ3BvcycsICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgJ+WugCcsIDIgXVxuICAgIFsgJ3BvcycsICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgJ+iynScsIDQgXVxuICAgIFsgJ3BvcycsICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgJ+6HuicsIDMgXVxuICAgIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBAX2ZlZWRfdGVzdF9kYXRhIGRiLCBwcm9iZXNfaWR4LCByZXN1bWVcbiAgICBwcmVmaXggICAgPSBbICdwb3MnLCAnZ3VpZGUvdWNoci9oYXMnLCBdXG4gICAgaW5wdXQgICAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIHByZWZpeFxuICAgIHNldHRpbmdzICA9IHsgaW5kZXhlZDogbm8sIH1cbiAgICBpbnB1dFxuICAgICAgLnBpcGUgJCAoIHBocmFzZSwgc2VuZCApID0+XG4gICAgICAgIGNvdW50ICArPSArMVxuICAgICAgICBpZHggICAgKz0gKzFcbiAgICAgICAgVC5lcSBwaHJhc2UsIG1hdGNoZXJzWyBpZHggXVxuICAgICAgLnBpcGUgRC4kb25fZW5kID0+XG4gICAgICAgIFQuZXEgY291bnQsIG1hdGNoZXJzLmxlbmd0aFxuICAgICAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgU1BPIHBocmFzZXNcIiBdID0gKCBULCBkb25lICkgLT5cbiAgcHJvYmVzX2lkeCAgPSAwXG4gIGlkeCAgICAgICAgID0gLTFcbiAgY291bnQgICAgICAgPSAwXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgbWF0Y2hlcnMgPSBbXG4gICAgWyAnc3BvJywgJ/Cnt58nLCAnY3AvY2lkJywgMTYzMjk1IF1cbiAgICBbICdzcG8nLCAn8Ke3nycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgNSBdXG4gICAgWyAnc3BvJywgJ/Cnt58nLCAnZ3VpZGUvdWNoci9oYXMnLCBbICflhasnLCAn5YiAJywgJ+WugCcsICfuh7onLCAn6LKdJyBdIF1cbiAgICBbICdzcG8nLCAn8Ke3nycsICdyYW5rL2NqdCcsIDU0MzIgXVxuICAgIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBAX2ZlZWRfdGVzdF9kYXRhIGRiLCBwcm9iZXNfaWR4LCByZXN1bWVcbiAgICBwcmVmaXggID0gWyAnc3BvJywgJ/Cnt58nLCBdXG4gICAgaW5wdXQgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBwcmVmaXhcbiAgICBpbnB1dFxuICAgICAgLnBpcGUgJCAoIHBocmFzZSwgc2VuZCApID0+XG4gICAgICAgIGRlYnVnICfCqURzQWZZJywgcnByIHBocmFzZVxuICAgICAgICBjb3VudCAgKz0gKzFcbiAgICAgICAgaWR4ICAgICs9ICsxXG4gICAgICAgIFQuZXEgcGhyYXNlLCBtYXRjaGVyc1sgaWR4IF1cbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICBULmVxIGNvdW50LCBtYXRjaGVycy5sZW5ndGhcbiAgICAgICAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZWFkIHdpdGggc3ViLXJlYWQgKDEpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHByb2Jlc19pZHggID0gMFxuICBpZHggICAgICAgICA9IC0xXG4gIGNvdW50ICAgICAgID0gMFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIG1hdGNoZXJzID0gW1xuICAgIFsgJ/Cnt58nLCBbICdzcG8nLCAn5YWrJywgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCAnMzQnIF0gXVxuICAgIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBAX2ZlZWRfdGVzdF9kYXRhIGRiLCBwcm9iZXNfaWR4LCByZXN1bWVcbiAgICBwcmVmaXggICAgPSBbICdzcG8nLCAn8Ke3nycsICdndWlkZS91Y2hyL2hhcycsIF1cbiAgICBpbnB1dCAgICAgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgcHJlZml4XG4gICAgc2V0dGluZ3MgID0geyBpbmRleGVkOiBubywgfVxuICAgIGlucHV0XG4gICAgICAucGlwZSBIT0xMRVJJVEgucmVhZF9zdWIgZGIsIHNldHRpbmdzLCAoIFsgcGhyYXNldHlwZSwgZ2x5cGgsIHByZCwgZ3VpZGVzLCBdICkgPT5cbiAgICAgICAgc3ViX2lucHV0ID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIFsgJ3NwbycsIGd1aWRlc1sgMCBdLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsIF1cbiAgICAgICAgcmV0dXJuIFsgZ2x5cGgsIHN1Yl9pbnB1dCwgXVxuICAgICAgLnBpcGUgJCAoIHBocmFzZSwgc2VuZCApID0+XG4gICAgICAgIGNvdW50ICArPSArMVxuICAgICAgICBpZHggICAgKz0gKzFcbiAgICAgICAgVC5lcSBwaHJhc2UsIG1hdGNoZXJzWyBpZHggXVxuICAgICAgLnBpcGUgRC4kb25fZW5kID0+XG4gICAgICAgIFQuZXEgY291bnQsIG1hdGNoZXJzLmxlbmd0aFxuICAgICAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgd2l0aCBzdWItcmVhZCAoMilcIiBdID0gKCBULCBkb25lICkgLT5cbiAgcHJvYmVzX2lkeCAgPSAwXG4gIGlkeCAgICAgICAgID0gLTFcbiAgY291bnQgICAgICAgPSAwXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgbWF0Y2hlcnMgPSBbXG4gICAgWyAn8Ke3nycsIFsgJ3NwbycsICflhasnLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICczNCcgXSBdXG4gICAgWyAn8Ke3nycsIFsgJ3NwbycsICfliIAnLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICc1KDEyKTMnIF0gXVxuICAgIFsgJ/Cnt58nLCBbICdzcG8nLCAn5a6AJywgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCAnNDQnIF0gXVxuICAgIFsgJ/Cnt58nLCBbICdzcG8nLCAn6LKdJywgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCAnMjUoMTIpJyBdIF1cbiAgICBbICfwp7efJywgWyAnc3BvJywgJ+6HuicsICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgJzEyJyBdIF1cbiAgICBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgQF9mZWVkX3Rlc3RfZGF0YSBkYiwgcHJvYmVzX2lkeCwgcmVzdW1lXG4gICAgcHJlZml4ICAgID0gWyAncG9zJywgJ2d1aWRlL3VjaHIvaGFzJywgXVxuICAgIGlucHV0ICAgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBwcmVmaXhcbiAgICBzZXR0aW5ncyAgPSB7IGluZGV4ZWQ6IG5vLCB9XG4gICAgaW5wdXRcbiAgICAgIC5waXBlIEhPTExFUklUSC5yZWFkX3N1YiBkYiwgc2V0dGluZ3MsICggcGhyYXNlICkgPT5cbiAgICAgICAgWyBfLCBnbHlwaCwgcHJkLCBndWlkZSwgXSA9IHBocmFzZVxuICAgICAgICBwcmVmaXggICAgICAgICAgICAgICAgICAgID0gWyAnc3BvJywgZ3VpZGUsICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgXVxuICAgICAgICBzdWJfaW5wdXQgICAgICAgICAgICAgICAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIHByZWZpeFxuICAgICAgICByZXR1cm4gWyBnbHlwaCwgc3ViX2lucHV0LCBdXG4gICAgICAucGlwZSAkICggcGhyYXNlLCBzZW5kICkgPT5cbiAgICAgICAgZGVidWcgJ8KpcXVQYmcnLCBKU09OLnN0cmluZ2lmeSBwaHJhc2VcbiAgICAgICAgY291bnQgICs9ICsxXG4gICAgICAgIGlkeCAgICArPSArMVxuICAgICAgICBULmVxIHBocmFzZSwgbWF0Y2hlcnNbIGlkeCBdXG4gICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgVC5lcSBjb3VudCwgbWF0Y2hlcnMubGVuZ3RoXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCB3aXRoIHN1Yi1yZWFkICgzKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ICAgICAgICAgPSAtMVxuICBjb3VudCAgICAgICA9IDBcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBtYXRjaGVycyA9IFtcbiAgICBbW1wi8Ke3n1wiLFwi5YWrXCIsXCIzNFwiXSwgICAgICBbXCJzcG9cIixcIuWFq1wiLFwicmFuay9janRcIiwxMjU0MV1dXG4gICAgW1tcIvCnt59cIixcIuWIgFwiLFwiNSgxMikzXCJdLCAgW1wic3BvXCIsXCLliIBcIixcInJhbmsvY2p0XCIsMTI1NDJdXVxuICAgIFtbXCLwp7efXCIsXCLlroBcIixcIjQ0XCJdLCAgICAgIFtcInNwb1wiLFwi5a6AXCIsXCJyYW5rL2NqdFwiLDEyNTQzXV1cbiAgICBbW1wi8Ke3n1wiLFwi6LKdXCIsXCIyNSgxMilcIl0sICBbXCJzcG9cIixcIuiynVwiLFwicmFuay9janRcIiwxMjU0NV1dXG4gICAgW1tcIvCnt59cIixcIu6HulwiLFwiMTJcIl0sICAgICAgW1wic3BvXCIsXCLuh7pcIixcInJhbmsvY2p0XCIsMTI1NDRdXVxuICAgIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBAX2ZlZWRfdGVzdF9kYXRhIGRiLCBwcm9iZXNfaWR4LCByZXN1bWVcbiAgICBwcmVmaXggICAgPSBbICdwb3MnLCAnZ3VpZGUvdWNoci9oYXMnLCBdXG4gICAgaW5wdXQgICAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIHByZWZpeFxuICAgIHNldHRpbmdzICA9IHsgaW5kZXhlZDogbm8sIH1cbiAgICBpbnB1dFxuICAgICAgLnBpcGUgSE9MTEVSSVRILnJlYWRfc3ViIGRiLCBzZXR0aW5ncywgKCBwaHJhc2UgKSA9PlxuICAgICAgICBbIF8sIGdseXBoLCBwcmQsIGd1aWRlLCBdID0gcGhyYXNlXG4gICAgICAgIHByZWZpeCAgICAgICAgICAgICAgICAgICAgPSBbICdzcG8nLCBndWlkZSwgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCBdXG4gICAgICAgIHN1Yl9pbnB1dCAgICAgICAgICAgICAgICAgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgcHJlZml4XG4gICAgICAgIHJldHVybiBbIGdseXBoLCBzdWJfaW5wdXQsIF1cbiAgICAgIC5waXBlIEhPTExFUklUSC5yZWFkX3N1YiBkYiwgc2V0dGluZ3MsICggeHBocmFzZSApID0+XG4gICAgICAgIFsgZ2x5cGgsIFsgXywgZ3VpZGUsIHByZCwgc2hhcGVjbGFzcywgXSBdID0geHBocmFzZVxuICAgICAgICBwcmVmaXggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFsgJ3NwbycsIGd1aWRlLCAncmFuay9janQnLCBdXG4gICAgICAgIHN1Yl9pbnB1dCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIHByZWZpeFxuICAgICAgICByZXR1cm4gWyBbIGdseXBoLCBndWlkZSwgc2hhcGVjbGFzcywgXSwgc3ViX2lucHV0LCBdXG4gICAgICAucGlwZSAkICggeHBocmFzZSwgc2VuZCApID0+XG4gICAgICAgIGRlYnVnICfCqXF1UGJnJywgSlNPTi5zdHJpbmdpZnkgeHBocmFzZVxuICAgICAgICBjb3VudCAgKz0gKzFcbiAgICAgICAgaWR4ICAgICs9ICsxXG4gICAgICAgIFQuZXEgeHBocmFzZSwgbWF0Y2hlcnNbIGlkeCBdXG4gICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgVC5lcSBjb3VudCwgbWF0Y2hlcnMubGVuZ3RoXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwic29ydGluZyAoMSlcIiBdID0gKCBULCBkb25lICkgLT5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgc2V0dGluZ3MgPVxuICAgICAgZGI6ICAgICAgICAgICBsZXZlbGRvd25cbiAgICAgIGtleUVuY29kaW5nOiAgJ2JpbmFyeSdcbiAgICBsZXZlbGRiID0gbGV2ZWx1cCAnL3RtcC9ob2xsZXJpdGgyLXRlc3QnLCBzZXR0aW5nc1xuICAgIHlpZWxkIGNsZWFyX2xldmVsZGIgbGV2ZWxkYiwgcmVzdW1lXG4gICAgcHJvYmVzID0gW1xuICAgICAgJ2EnXG4gICAgICAnYWInXG4gICAgICAnYWJjJ1xuICAgICAgJ2FiY1xceDAwJ1xuICAgICAgJ2FiY1xceDAwYSdcbiAgICAgICdhYmNhJ1xuICAgICAgJ2FiY2InXG4gICAgICAnYWJjYydcbiAgICAgICdhYmNkJ1xuICAgICAgJ2FiY2RlJ1xuICAgICAgJ2FiY2RlZidcbiAgICAgICdhYmNkZWZnJyBdXG4gICAgbWF0Y2hlcnMgPSBbXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIDB4NjIsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCAweDYyLCAweDYzLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgMHg2MiwgMHg2MywgMHgwMCwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIDB4NjIsIDB4NjMsIDB4MDAsIDB4NjEsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCAweDYyLCAweDYzLCAweDYxLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgMHg2MiwgMHg2MywgMHg2MiwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIDB4NjIsIDB4NjMsIDB4NjMsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCAweDYyLCAweDYzLCAweDY0LCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgMHg2MiwgMHg2MywgMHg2NCwgMHg2NSwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIDB4NjIsIDB4NjMsIDB4NjQsIDB4NjUsIDB4NjYsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCAweDYyLCAweDYzLCAweDY0LCAweDY1LCAweDY2LCAweDY3LCBdIF1cbiAgICBDTkQuc2h1ZmZsZSBwcm9iZXNcbiAgICBmb3IgcHJvYmUgaW4gcHJvYmVzXG4gICAgICBwcm9iZV9iZnIgPSBuZXcgQnVmZmVyIHByb2JlLCAndXRmLTgnXG4gICAgICB5aWVsZCBsZXZlbGRiLnB1dCBwcm9iZV9iZnIsICcxJywgcmVzdW1lXG4gICAgICBwcm9iZV9iZnJzID0geWllbGQgcmVhZF9hbGxfa2V5cyBsZXZlbGRiLCByZXN1bWVcbiAgICBwcm9iZV9iZnJzID0geWllbGQgcmVhZF9hbGxfa2V5cyBsZXZlbGRiLCByZXN1bWVcbiAgICAjIGRlYnVnICfCqVJYUHZ2JywgJ1xcbicgKyBycHIgcHJvYmVfYmZyc1xuICAgIGZvciBwcm9iZV9iZnIsIHByb2JlX2lkeCBpbiBwcm9iZV9iZnJzXG4gICAgICBtYXRjaGVyID0gbWF0Y2hlcnNbIHByb2JlX2lkeCBdXG4gICAgICAjIyMgVEFJTlQgbG9va3MgbGlrZSBgVC5lcSBidWZmZXIxLCBidWZmZXIyYCBkb2Vzbid0IHdvcmstLS1zb21ldGltZXMuLi4gIyMjXG4gICAgICAjIFQuZXEgcHJvYmVfYmZyLCBtYXRjaGVyXG4gICAgICBULm9rIHByb2JlX2Jmci5lcXVhbHMgbWF0Y2hlclxuICAgIGxldmVsZGIuY2xvc2UgLT4gZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJzb3J0aW5nICgyKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICAjIyMgVGhpcyB0ZXN0IGlzIGhlcmUgYmVjYXVzZSB0aGVyZSBzZWVtZWQgdG8gb2NjdXIgc29tZSBzdHJhbmdlIG9yZGVyaW5nIGlzc3VlcyB3aGVuXG4gIHVzaW5nIG1lbWRvd24gaW5zdGVhZCBvZiBsZXZlbGRvd24gIyMjXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHNldHRpbmdzID1cbiAgICAgIGRiOiAgICAgICAgICAgbGV2ZWxkb3duXG4gICAgICBrZXlFbmNvZGluZzogICdiaW5hcnknXG4gICAgbGV2ZWxkYiA9IGxldmVsdXAgJy90bXAvaG9sbGVyaXRoMi10ZXN0Jywgc2V0dGluZ3NcbiAgICB5aWVsZCBjbGVhcl9sZXZlbGRiIGxldmVsZGIsIHJlc3VtZVxuICAgIHByb2JlcyA9IFtcbiAgICAgIG5ldyBCdWZmZXIgWyAweDAwLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHgwMSwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4MDIsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDAzLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHhmOSwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4ZmEsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweGZiLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHhmYywgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4ZmQsIF1cbiAgICAgIF1cbiAgICBtYXRjaGVycyA9ICggcHJvYmUgZm9yIHByb2JlIGluIHByb2JlcyApXG4gICAgQ05ELnNodWZmbGUgcHJvYmVzXG4gICAgZm9yIHByb2JlIGluIHByb2Jlc1xuICAgICAgeWllbGQgbGV2ZWxkYi5wdXQgcHJvYmUsICcxJywgcmVzdW1lXG4gICAgcHJvYmVfYmZycyA9IHlpZWxkIHJlYWRfYWxsX2tleXMgbGV2ZWxkYiwgcmVzdW1lXG4gICAgZm9yIHByb2JlX2JmciwgcHJvYmVfaWR4IGluIHByb2JlX2JmcnNcbiAgICAgIG1hdGNoZXIgPSBtYXRjaGVyc1sgcHJvYmVfaWR4IF1cbiAgICAgICMgZGVidWcgJ8KpMTUwNjAnLCBwcm9iZV9pZHgsIHByb2JlX2JmciwgbWF0Y2hlclxuICAgICAgIyMjIFRBSU5UIGxvb2tzIGxpa2UgYFQuZXEgYnVmZmVyMSwgYnVmZmVyMmAgZG9lc24ndCB3b3JrLS0tc29tZXRpbWVzLi4uICMjI1xuICAgICAgVC5vayBwcm9iZV9iZnIuZXF1YWxzIG1hdGNoZXJcbiAgICBsZXZlbGRiLmNsb3NlIC0+IGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwiSDIgY29kZWMgYGVuY29kZWAgdGhyb3dzIG9uIGFueXRoaW5nIGJ1dCBhIGxpc3RcIiBdID0gKCBULCBkb25lICkgLT5cbiAgVC50aHJvd3MgXCJleHBlY3RlZCBhIGxpc3QsIGdvdCBhIHRleHRcIiwgICAgICAgICAoIC0+IENPREVDLmVuY29kZSAndW5hY2NhcHRhYmxlJyApXG4gIFQudGhyb3dzIFwiZXhwZWN0ZWQgYSBsaXN0LCBnb3QgYSBudW1iZXJcIiwgICAgICAgKCAtPiBDT0RFQy5lbmNvZGUgNDIgKVxuICBULnRocm93cyBcImV4cGVjdGVkIGEgbGlzdCwgZ290IGEgYm9vbGVhblwiLCAgICAgICggLT4gQ09ERUMuZW5jb2RlIHRydWUgKVxuICBULnRocm93cyBcImV4cGVjdGVkIGEgbGlzdCwgZ290IGEgYm9vbGVhblwiLCAgICAgICggLT4gQ09ERUMuZW5jb2RlIGZhbHNlIClcbiAgVC50aHJvd3MgXCJleHBlY3RlZCBhIGxpc3QsIGdvdCBhIGpzdW5kZWZpbmVkXCIsICAoIC0+IENPREVDLmVuY29kZSgpIClcbiAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJzb3J0IHRleHRzIHdpdGggSDIgY29kZWMgKDEpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHNldHRpbmdzID1cbiAgICAgIGRiOiAgICAgICAgICAgbGV2ZWxkb3duXG4gICAgICBrZXlFbmNvZGluZzogICdiaW5hcnknXG4gICAgbGV2ZWxkYiA9IGxldmVsdXAgJy90bXAvaG9sbGVyaXRoMi10ZXN0Jywgc2V0dGluZ3NcbiAgICB5aWVsZCBjbGVhcl9sZXZlbGRiIGxldmVsZGIsIHJlc3VtZVxuICAgIHByb2JlcyA9IFtcbiAgICAgICdhJ1xuICAgICAgJ2FiJ1xuICAgICAgJ2FiYydcbiAgICAgICdhYmNcXHgwMCdcbiAgICAgICdhYmNcXHgwMGEnXG4gICAgICAnYWJjYSdcbiAgICAgICdhYmNhXFx4MDAnXG4gICAgICAnYWJjYidcbiAgICAgICdhYmNjJ1xuICAgICAgJ2FiY2QnXG4gICAgICAnYWJjZGUnXG4gICAgICAnYWJjZGVmJ1xuICAgICAgJ2FiY2RlZmcnXG4gICAgICBdXG4gICAgbWF0Y2hlcnMgPSAoIFsgcHJvYmUsIF0gZm9yIHByb2JlIGluIHByb2JlcyApXG4gICAgQ05ELnNodWZmbGUgcHJvYmVzXG4gICAgZm9yIHByb2JlIGluIHByb2Jlc1xuICAgICAgeWllbGQgbGV2ZWxkYi5wdXQgKCBDT0RFQy5lbmNvZGUgWyBwcm9iZSwgXSApLCAnMScsIHJlc3VtZVxuICAgIHByb2JlX2JmcnMgID0geWllbGQgcmVhZF9hbGxfa2V5cyBsZXZlbGRiLCByZXN1bWVcbiAgICBwcm9iZXMgICAgICA9ICggQ09ERUMuZGVjb2RlIHByb2JlX2JmciBmb3IgcHJvYmVfYmZyIGluIHByb2JlX2JmcnMgKVxuICAgIHNob3dfa2V5c19hbmRfa2V5X2JmcnMgcHJvYmVzLCBwcm9iZV9iZnJzXG4gICAgZm9yIHByb2JlLCBwcm9iZV9pZHggaW4gcHJvYmVzXG4gICAgICBtYXRjaGVyID0gbWF0Y2hlcnNbIHByb2JlX2lkeCBdXG4gICAgICBULmVxIHByb2JlLCBtYXRjaGVyXG4gICAgbGV2ZWxkYi5jbG9zZSAtPiBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInNvcnQgdGV4dHMgd2l0aCBIMiBjb2RlYyAoMilcIiBdID0gKCBULCBkb25lICkgLT5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgc2V0dGluZ3MgPVxuICAgICAgZGI6ICAgICAgICAgICBsZXZlbGRvd25cbiAgICAgIGtleUVuY29kaW5nOiAgJ2JpbmFyeSdcbiAgICBsZXZlbGRiID0gbGV2ZWx1cCAnL3RtcC9ob2xsZXJpdGgyLXRlc3QnLCBzZXR0aW5nc1xuICAgIHlpZWxkIGNsZWFyX2xldmVsZGIgbGV2ZWxkYiwgcmVzdW1lXG4gICAgcHJvYmVzID0gW1xuICAgICAgJydcbiAgICAgICcgJ1xuICAgICAgJ2EnXG4gICAgICAnYWJjJ1xuICAgICAgJ+S4gCdcbiAgICAgICfkuIDkuownXG4gICAgICAn5LiA5LqM5LiJJ1xuICAgICAgJ+S4iSdcbiAgICAgICfkuownXG4gICAgICAn8KCAgCdcbiAgICAgICfwoICAXFx4MDAnXG4gICAgICAn8KCAgGEnXG4gICAgICAn8KqcgCdcbiAgICAgICfwq52AJ1xuICAgICAgU3RyaW5nLmZyb21Db2RlUG9pbnQgMHgxMGZmZmZcbiAgICAgIF1cbiAgICBtYXRjaGVycyA9ICggWyBwcm9iZSwgXSBmb3IgcHJvYmUgaW4gcHJvYmVzIClcbiAgICBDTkQuc2h1ZmZsZSBwcm9iZXNcbiAgICBmb3IgcHJvYmUgaW4gcHJvYmVzXG4gICAgICBwcm9iZV9iZnIgPSBDT0RFQy5lbmNvZGUgWyBwcm9iZSwgXVxuICAgICAgeWllbGQgbGV2ZWxkYi5wdXQgcHJvYmVfYmZyLCAnMScsIHJlc3VtZVxuICAgIHByb2JlX2JmcnMgID0geWllbGQgcmVhZF9hbGxfa2V5cyBsZXZlbGRiLCByZXN1bWVcbiAgICAjIGRlYnVnICfCqUZkNWl3JywgcHJvYmVfYmZyc1xuICAgIHByb2JlcyAgICAgID0gKCBDT0RFQy5kZWNvZGUgcHJvYmVfYmZyIGZvciBwcm9iZV9iZnIgaW4gcHJvYmVfYmZycyApXG4gICAgc2hvd19rZXlzX2FuZF9rZXlfYmZycyBwcm9iZXMsIHByb2JlX2JmcnNcbiAgICBmb3IgcHJvYmUsIHByb2JlX2lkeCBpbiBwcm9iZXNcbiAgICAgIG1hdGNoZXIgPSBtYXRjaGVyc1sgcHJvYmVfaWR4IF1cbiAgICAgIFQuZXEgcHJvYmUsIG1hdGNoZXJcbiAgICBsZXZlbGRiLmNsb3NlIC0+IGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwic29ydCBudW1iZXJzIHdpdGggSDIgY29kZWMgKDEpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHNldHRpbmdzID1cbiAgICAgIGRiOiAgICAgICAgICAgbGV2ZWxkb3duXG4gICAgICBrZXlFbmNvZGluZzogICdiaW5hcnknXG4gICAgbGV2ZWxkYiA9IGxldmVsdXAgJy90bXAvaG9sbGVyaXRoMi10ZXN0Jywgc2V0dGluZ3NcbiAgICB5aWVsZCBjbGVhcl9sZXZlbGRiIGxldmVsZGIsIHJlc3VtZVxuICAgIHByb2Jlc19hbmRfZGVzY3JpcHRpb25zID0gW1xuICAgICAgWyAtSW5maW5pdHksICAgICAgICAgICAgICAgXCItSW5maW5pdHlcIiAgICAgICAgICAgICAgIF1cbiAgICAgIFsgLU51bWJlci5NQVhfVkFMVUUsICAgICAgIFwiLU51bWJlci5NQVhfVkFMVUVcIiAgICAgICBdXG4gICAgICBbIE51bWJlci5NSU5fU0FGRV9JTlRFR0VSLCBcIk51bWJlci5NSU5fU0FGRV9JTlRFR0VSXCIgXVxuICAgICAgWyAtMTIzNDU2Nzg5LCAgICAgICAgICAgICAgXCItMTIzNDU2Nzg5XCIgICAgICAgICAgICAgIF1cbiAgICAgIFsgLTMsICAgICAgICAgICAgICAgICAgICAgIFwiLTNcIiAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICBbIC0yLCAgICAgICAgICAgICAgICAgICAgICBcIi0yXCIgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgWyAtMS41LCAgICAgICAgICAgICAgICAgICAgXCItMS41XCIgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgIFsgLTEsICAgICAgICAgICAgICAgICAgICAgIFwiLTFcIiAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICBbIC1OdW1iZXIuRVBTSUxPTiwgICAgICAgICBcIi1OdW1iZXIuRVBTSUxPTlwiICAgICAgICAgXVxuICAgICAgWyAtTnVtYmVyLk1JTl9WQUxVRSwgICAgICAgXCItTnVtYmVyLk1JTl9WQUxVRVwiICAgICAgIF1cbiAgICAgIFsgMCwgICAgICAgICAgICAgICAgICAgICAgIFwiMFwiICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICBbICtOdW1iZXIuTUlOX1ZBTFVFLCAgICAgICBcIitOdW1iZXIuTUlOX1ZBTFVFXCIgICAgICAgXVxuICAgICAgWyArTnVtYmVyLkVQU0lMT04sICAgICAgICAgXCIrTnVtYmVyLkVQU0lMT05cIiAgICAgICAgIF1cbiAgICAgIFsgKzEsICAgICAgICAgICAgICAgICAgICAgIFwiKzFcIiAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICBbICsxLjUsICAgICAgICAgICAgICAgICAgICBcIisxLjVcIiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgWyArMiwgICAgICAgICAgICAgICAgICAgICAgXCIrMlwiICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgIFsgKzMsICAgICAgICAgICAgICAgICAgICAgIFwiKzNcIiAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICBbICsxMjM0NTY3ODksICAgICAgICAgICAgICBcIisxMjM0NTY3ODlcIiAgICAgICAgICAgICAgXVxuICAgICAgWyBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUiwgXCJOdW1iZXIuTUFYX1NBRkVfSU5URUdFUlwiIF1cbiAgICAgIFsgTnVtYmVyLk1BWF9WQUxVRSwgICAgICAgIFwiTnVtYmVyLk1BWF9WQUxVRVwiICAgICAgICBdXG4gICAgICBbICtJbmZpbml0eSwgICAgICAgICAgICAgICBcIitJbmZpbml0eVwiICAgICAgICAgICAgICAgXVxuICAgICAgXVxuICAgICMgcHJvYmVzX2FuZF9kZXNjcmlwdGlvbnMuc29ydCAoIGEsIGIgKSAtPlxuICAgICMgICByZXR1cm4gKzEgaWYgYVsgMCBdID4gYlsgMCBdXG4gICAgIyAgIHJldHVybiAtMSBpZiBhWyAwIF0gPCBiWyAwIF1cbiAgICAjICAgcmV0dXJuICAwXG4gICAgbWF0Y2hlcnMgICAgICA9ICggWyBwYWRbIDAgXSwgXSBmb3IgcGFkIGluIHByb2Jlc19hbmRfZGVzY3JpcHRpb25zIClcbiAgICAjIGRlc2NyaXB0aW9ucyAgPSAoIFsgcGFkWyAxIF0sIF0gZm9yIHBhZCBpbiBwcm9iZXNfYW5kX2Rlc2NyaXB0aW9ucyApXG4gICAgZm9yIHBhZCBpbiBwcm9iZXNfYW5kX2Rlc2NyaXB0aW9uc1xuICAgICAgdXJnZSBwYWRcbiAgICBDTkQuc2h1ZmZsZSBwcm9iZXNfYW5kX2Rlc2NyaXB0aW9uc1xuICAgIGZvciBbIHByb2JlLCBfLCBdIGluIHByb2Jlc19hbmRfZGVzY3JpcHRpb25zXG4gICAgICBwcm9iZV9iZnIgPSBDT0RFQy5lbmNvZGUgWyBwcm9iZSwgXVxuICAgICAgeWllbGQgbGV2ZWxkYi5wdXQgcHJvYmVfYmZyLCAnMScsIHJlc3VtZVxuICAgIHByb2JlX2JmcnMgID0geWllbGQgcmVhZF9hbGxfa2V5cyBsZXZlbGRiLCByZXN1bWVcbiAgICBwcm9iZXMgICAgICA9ICggQ09ERUMuZGVjb2RlIHByb2JlX2JmciBmb3IgcHJvYmVfYmZyIGluIHByb2JlX2JmcnMgKVxuICAgIHNob3dfa2V5c19hbmRfa2V5X2JmcnMgcHJvYmVzLCBwcm9iZV9iZnJzXG4gICAgZm9yIHByb2JlLCBwcm9iZV9pZHggaW4gcHJvYmVzXG4gICAgICBtYXRjaGVyID0gbWF0Y2hlcnNbIHByb2JlX2lkeCBdXG4gICAgICBULmVxIHByb2JlLCBtYXRjaGVyXG4gICAgbGV2ZWxkYi5jbG9zZSAtPiBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInNvcnQgbWl4ZWQgdmFsdWVzIHdpdGggSDIgY29kZWNcIiBdID0gKCBULCBkb25lICkgLT5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgc2V0dGluZ3MgPVxuICAgICAgZGI6ICAgICAgICAgICBsZXZlbGRvd25cbiAgICAgIGtleUVuY29kaW5nOiAgJ2JpbmFyeSdcbiAgICBsZXZlbGRiID0gbGV2ZWx1cCAnL3RtcC9ob2xsZXJpdGgyLXRlc3QnLCBzZXR0aW5nc1xuICAgIHlpZWxkIGNsZWFyX2xldmVsZGIgbGV2ZWxkYiwgcmVzdW1lXG4gICAgcHJvYmVzID0gW1xuICAgICAgbnVsbFxuICAgICAgZmFsc2VcbiAgICAgIHRydWVcbiAgICAgIENPREVDWyAnc2VudGluZWxzJyBdWyAnZmlyc3RkYXRlJyBdXG4gICAgICBuZXcgRGF0ZSAwXG4gICAgICBuZXcgRGF0ZSA4ZTExXG4gICAgICBuZXcgRGF0ZSgpXG4gICAgICBDT0RFQ1sgJ3NlbnRpbmVscycgXVsgJ2xhc3RkYXRlJyAgXVxuICAgICAgMTIzNFxuICAgICAgSW5maW5pdHlcbiAgICAgICcnXG4gICAgICAn5LiAJ1xuICAgICAgJ+S4iSdcbiAgICAgICfkuownXG4gICAgICAn8KCAgCdcbiAgICAgICfwoICAXFx4MDAnXG4gICAgICBTdHJpbmcuZnJvbUNvZGVQb2ludCAweDEwZmZmZlxuICAgICAgXVxuICAgIG1hdGNoZXJzID0gKCBbIHByb2JlLCBdIGZvciBwcm9iZSBpbiBwcm9iZXMgKVxuICAgIENORC5zaHVmZmxlIHByb2Jlc1xuICAgIGZvciBwcm9iZSBpbiBwcm9iZXNcbiAgICAgIGRlYnVnICfCqW9NWEpaJywgcHJvYmVcbiAgICAgIHByb2JlX2JmciA9IENPREVDLmVuY29kZSBbIHByb2JlLCBdXG4gICAgICB5aWVsZCBsZXZlbGRiLnB1dCBwcm9iZV9iZnIsICcxJywgcmVzdW1lXG4gICAgcHJvYmVfYmZycyAgPSB5aWVsZCByZWFkX2FsbF9rZXlzIGxldmVsZGIsIHJlc3VtZVxuICAgICMgZGVidWcgJ8KpRmQ1aXcnLCBwcm9iZV9iZnJzXG4gICAgcHJvYmVzICAgICAgPSAoIENPREVDLmRlY29kZSBwcm9iZV9iZnIgZm9yIHByb2JlX2JmciBpbiBwcm9iZV9iZnJzIClcbiAgICBzaG93X2tleXNfYW5kX2tleV9iZnJzIHByb2JlcywgcHJvYmVfYmZyc1xuICAgIGZvciBwcm9iZSwgcHJvYmVfaWR4IGluIHByb2Jlc1xuICAgICAgbWF0Y2hlciA9IG1hdGNoZXJzWyBwcm9iZV9pZHggXVxuICAgICAgVC5lcSBwcm9iZSwgbWF0Y2hlclxuICAgIGxldmVsZGIuY2xvc2UgLT4gZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJzb3J0IGxpc3RzIG9mIG1peGVkIHZhbHVlcyB3aXRoIEgyIGNvZGVjXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHNldHRpbmdzID1cbiAgICAgIGRiOiAgICAgICAgICAgbGV2ZWxkb3duXG4gICAgICBrZXlFbmNvZGluZzogICdiaW5hcnknXG4gICAgbGV2ZWxkYiA9IGxldmVsdXAgJy90bXAvaG9sbGVyaXRoMi10ZXN0Jywgc2V0dGluZ3NcbiAgICB5aWVsZCBjbGVhcl9sZXZlbGRiIGxldmVsZGIsIHJlc3VtZVxuICAgIHByb2JlcyA9IFtcbiAgICAgIFsgXCJcIiwgICAgICAgICAgICAgJycsICAgICAgICAgICAgIF1cbiAgICAgIFsgXCIxMjM0XCIsICAgICAgICAgIDEyMzQsICAgICAgICAgICBdXG4gICAgICBbIFwiSW5maW5pdHlcIiwgICAgICBJbmZpbml0eSwgICAgICAgXVxuICAgICAgWyBcIlN0cmluZy5mcm9tQ29kZVBvaW50IDB4MTBmZmZmXCIsIFN0cmluZy5mcm9tQ29kZVBvaW50IDB4MTBmZmZmIF1cbiAgICAgIFsgXCJmYWxzZVwiLCAgICAgICAgIGZhbHNlLCAgICAgICAgICBdXG4gICAgICBbIFwibmV3IERhdGUgMFwiLCAgICBuZXcgRGF0ZSAwLCAgICAgXVxuICAgICAgWyBcIm5ldyBEYXRlIDhlMTFcIiwgbmV3IERhdGUgOGUxMSwgIF1cbiAgICAgIFsgXCJuZXcgRGF0ZSgpXCIsICAgIG5ldyBEYXRlKCksICAgICBdXG4gICAgICBbIFwibnVsbFwiLCAgICAgICAgICBudWxsLCAgICAgICAgICAgXVxuICAgICAgWyBcInRydWVcIiwgICAgICAgICAgdHJ1ZSwgICAgICAgICAgIF1cbiAgICAgIFsgXCLkuIBcIiwgICAgICAgICAgICAn5LiAJywgICAgICAgICAgICBdXG4gICAgICBbIFwi5LiJXCIsICAgICAgICAgICAgJ+S4iScsICAgICAgICAgICAgXVxuICAgICAgWyBcIuS6jFwiLCAgICAgICAgICAgICfkuownLCAgICAgICAgICAgIF1cbiAgICAgIFsgXCLwoICAXCIsICAgICAgICAgICAgJ/CggIAnLCAgICAgICAgICAgIF1cbiAgICAgIFsgXCLwoICAXFx4MDBcIiwgICAgICAgICfwoICAXFx4MDAnLCAgICAgICAgXVxuICAgICAgXVxuICAgIG1hdGNoZXJzID0gKCBwcm9iZSBmb3IgcHJvYmUgaW4gcHJvYmVzIClcbiAgICBDTkQuc2h1ZmZsZSBwcm9iZXNcbiAgICBmb3IgcHJvYmUgaW4gcHJvYmVzXG4gICAgICBkZWJ1ZyAnwqlvTVhKWicsIHByb2JlXG4gICAgICBwcm9iZV9iZnIgPSBDT0RFQy5lbmNvZGUgcHJvYmVcbiAgICAgIHlpZWxkIGxldmVsZGIucHV0IHByb2JlX2JmciwgJzEnLCByZXN1bWVcbiAgICBwcm9iZV9iZnJzICA9IHlpZWxkIHJlYWRfYWxsX2tleXMgbGV2ZWxkYiwgcmVzdW1lXG4gICAgIyBkZWJ1ZyAnwqlGZDVpdycsIHByb2JlX2JmcnNcbiAgICBwcm9iZXMgICAgICA9ICggQ09ERUMuZGVjb2RlIHByb2JlX2JmciBmb3IgcHJvYmVfYmZyIGluIHByb2JlX2JmcnMgKVxuICAgIHNob3dfa2V5c19hbmRfa2V5X2JmcnMgcHJvYmVzLCBwcm9iZV9iZnJzXG4gICAgZm9yIHByb2JlLCBwcm9iZV9pZHggaW4gcHJvYmVzXG4gICAgICBtYXRjaGVyID0gbWF0Y2hlcnNbIHByb2JlX2lkeCBdXG4gICAgICBULmVxIHByb2JlLCBtYXRjaGVyXG4gICAgbGV2ZWxkYi5jbG9zZSAtPiBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInNvcnQgcm91dGVzIHdpdGggdmFsdWVzICgxKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICBzZXR0aW5ncyA9XG4gICAgICBkYjogICAgICAgICAgIGxldmVsZG93blxuICAgICAga2V5RW5jb2Rpbmc6ICAnYmluYXJ5J1xuICAgIGxldmVsZGIgPSBsZXZlbHVwICcvdG1wL2hvbGxlcml0aDItdGVzdCcsIHNldHRpbmdzXG4gICAgeWllbGQgY2xlYXJfbGV2ZWxkYiBsZXZlbGRiLCByZXN1bWVcbiAgICBwcm9iZXMgPSBbXG4gICAgICBbICdwb3MnLCAnc3Ryb2tlb3JkZXInLCAnMzUyNTEzNTUzMjU0JywgICAgICAgICAgJ/Ckv68nLCBdXG4gICAgICBbICdwb3MnLCAnc3Ryb2tlb3JkZXInLCAnMzUyNTE0MTEyMScsICAgICAgICAgICAgJ/CgtKYnLCBdXG4gICAgICBbICdwb3MnLCAnc3Ryb2tlb3JkZXInLCAnMzUyNTE0NTQnLCAgICAgICAgICAgICAgJ/CokqEnLCBdXG4gICAgICBbICdwb3MnLCAnc3Ryb2tlb3JkZXInLCAnMzUyNTE1MicsICAgICAgICAgICAgICAgJ+mCrScsIF1cbiAgICAgIFsgJ3BvcycsICdzdHJva2VvcmRlcicsICczNTI1MTUyNTExMTUxMTUxMTM1NDEnLCAn8KqaqycsIF1cbiAgICAgIFsgJ3BvcycsICdzdHJva2VvcmRlcicsICczNTI1MTUyNTExMjUxMTUxMScsICAgICAn8KqapycsIF1cbiAgICAgIFsgJ3BvcycsICdzdHJva2VvcmRlcicsICczNTI1MTUyNTEyMTQyNTEyMTQnLCAgICAn8KeRtCcsIF1cbiAgICAgIFsgJ3BvcycsICdzdHJva2VvcmRlcicsICczNTI1MTUzJywgICAgICAgICAgICAgICAn5YqsJywgXVxuICAgICAgWyAncG9zJywgJ3N0cm9rZW9yZGVyJywgJzM1MjUxNTNcXHgwMCcsICAgICAgICAgICAgICAgJ+WKrCcsIF1cbiAgICAgIFsgJ3BvcycsICdzdHJva2VvcmRlclxceDAwJywgJzM1MjUxMzU1MzI1NCcsICAgICAgICAgICfwpL+vJywgXVxuICAgICAgXVxuICAgIG1hdGNoZXJzID0gKCBwcm9iZSBmb3IgcHJvYmUgaW4gcHJvYmVzIClcbiAgICBDTkQuc2h1ZmZsZSBwcm9iZXNcbiAgICBmb3IgcHJvYmUgaW4gcHJvYmVzXG4gICAgICBwcm9iZV9iZnIgPSBDT0RFQy5lbmNvZGUgcHJvYmVcbiAgICAgIHlpZWxkIGxldmVsZGIucHV0IHByb2JlX2JmciwgJzEnLCByZXN1bWVcbiAgICBwcm9iZV9iZnJzICA9IHlpZWxkIHJlYWRfYWxsX2tleXMgbGV2ZWxkYiwgcmVzdW1lXG4gICAgIyBkZWJ1ZyAnwqlGZDVpdycsIHByb2JlX2JmcnNcbiAgICBwcm9iZXMgICAgICA9ICggQ09ERUMuZGVjb2RlIHByb2JlX2JmciBmb3IgcHJvYmVfYmZyIGluIHByb2JlX2JmcnMgKVxuICAgIHNob3dfa2V5c19hbmRfa2V5X2JmcnMgcHJvYmVzLCBwcm9iZV9iZnJzXG4gICAgZm9yIHByb2JlLCBwcm9iZV9pZHggaW4gcHJvYmVzXG4gICAgICBtYXRjaGVyID0gbWF0Y2hlcnNbIHByb2JlX2lkeCBdXG4gICAgICBULmVxIHByb2JlLCBtYXRjaGVyXG4gICAgbGV2ZWxkYi5jbG9zZSAtPiBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInNvcnQgcm91dGVzIHdpdGggdmFsdWVzICgyKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICBzZXR0aW5ncyA9XG4gICAgICBkYjogICAgICAgICAgIGxldmVsZG93blxuICAgICAga2V5RW5jb2Rpbmc6ICAnYmluYXJ5J1xuICAgIGxldmVsZGIgPSBsZXZlbHVwICcvdG1wL2hvbGxlcml0aDItdGVzdCcsIHNldHRpbmdzXG4gICAgeWllbGQgY2xlYXJfbGV2ZWxkYiBsZXZlbGRiLCByZXN1bWVcbiAgICBwcm9iZXMgPSBbXG4gICAgICBbICdhJywgICAgICBudWxsLCBdXG4gICAgICBbICdhJywgICAgICBmYWxzZSwgXVxuICAgICAgWyAnYScsICAgICAgdHJ1ZSwgXVxuICAgICAgWyAnYScsICAgICAgbmV3IERhdGUoKSwgXVxuICAgICAgWyAnYScsICAgICAgLUluZmluaXR5LCBdXG4gICAgICBbICdhJywgICAgICArMTIzNCwgXVxuICAgICAgWyAnYScsICAgICAgK0luZmluaXR5LCBdXG4gICAgICBbICdhJywgICAgICAnYicsIF1cbiAgICAgIFsgJ2EnLCAgICAgICdiXFx4MDAnLCBdXG4gICAgICBbICdhXFx4MDAnLCAgKzEyMzQsIF1cbiAgICAgIFsgJ2FcXHgwMCcsICAnYicsIF1cbiAgICAgIFsgJ2FhJywgICAgICsxMjM0LCBdXG4gICAgICBbICdhYScsICAgICAnYicsIF1cbiAgICAgIFsgJ2FhJywgICAgICdiXFx4MDAnLCBdXG4gICAgICBdXG4gICAgbWF0Y2hlcnMgPSAoIHByb2JlIGZvciBwcm9iZSBpbiBwcm9iZXMgKVxuICAgIENORC5zaHVmZmxlIHByb2Jlc1xuICAgIGZvciBwcm9iZSBpbiBwcm9iZXNcbiAgICAgIHByb2JlX2JmciA9IENPREVDLmVuY29kZSBwcm9iZVxuICAgICAgeWllbGQgbGV2ZWxkYi5wdXQgcHJvYmVfYmZyLCAnMScsIHJlc3VtZVxuICAgIHByb2JlX2JmcnMgID0geWllbGQgcmVhZF9hbGxfa2V5cyBsZXZlbGRiLCByZXN1bWVcbiAgICAjIGRlYnVnICfCqUZkNWl3JywgcHJvYmVfYmZyc1xuICAgIHByb2JlcyAgICAgID0gKCBDT0RFQy5kZWNvZGUgcHJvYmVfYmZyIGZvciBwcm9iZV9iZnIgaW4gcHJvYmVfYmZycyApXG4gICAgc2hvd19rZXlzX2FuZF9rZXlfYmZycyBwcm9iZXMsIHByb2JlX2JmcnNcbiAgICBmb3IgcHJvYmUsIHByb2JlX2lkeCBpbiBwcm9iZXNcbiAgICAgIG1hdGNoZXIgPSBtYXRjaGVyc1sgcHJvYmVfaWR4IF1cbiAgICAgIFQuZXEgcHJvYmUsIG1hdGNoZXJcbiAgICBsZXZlbGRiLmNsb3NlIC0+IGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCBzYW1wbGUgZGF0YVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDJcbiAgaWR4ID0gLTFcbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgQF9mZWVkX3Rlc3RfZGF0YSBkYiwgcHJvYmVzX2lkeCwgcmVzdW1lXG4gICAgaW5wdXQgPSBkYlsgJyVzZWxmJyBdLmNyZWF0ZVJlYWRTdHJlYW0oKVxuICAgIGlucHV0XG4gICAgICAjIC5waXBlIEQuJHNob3coKVxuICAgICAgLnBpcGUgJCAoIHsga2V5LCB2YWx1ZSwgfSwgc2VuZCApID0+IHNlbmQgWyBrZXksIHZhbHVlLCBdXG4gICAgICAucGlwZSAkICggWyBrZXksIHZhbHVlLCBdLCBzZW5kICkgPT5cbiAgICAgICAgZGVidWcgJ8KpUmx1aEYnLCAoIEhPTExFUklUSC5DT0RFQy5kZWNvZGUga2V5ICksICggSlNPTi5wYXJzZSB2YWx1ZSApXG4gICAgICAgIHNlbmQgWyBrZXksIHZhbHVlLCBdXG4gICAgICAucGlwZSBELiRjb2xsZWN0KClcbiAgICAgIC5waXBlICQgKCBmYWNldHMsIHNlbmQgKSA9PlxuICAgICAgICAjIGRlYnVnICfCqUZ0bUI0JywgZmFjZXRzXG4gICAgICAgIGhlbHAgJ1xcbicgKyBIT0xMRVJJVEguRFVNUC5ycHJfb2ZfZmFjZXRzIGRiLCBmYWNldHNcbiAgICAgICAgYnVmZmVyID0gbmV3IEJ1ZmZlciBKU09OLnN0cmluZ2lmeSBbICflvIAnLCAn5b2hJyBdXG4gICAgICAgIGRlYnVnICfCqUdKZkw2JywgSE9MTEVSSVRILkRVTVAucnByX29mX2J1ZmZlciBudWxsLCBidWZmZXJcbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PiBkb25lKClcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICByZXR1cm4gbnVsbFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCBhbmQgd3JpdGUga2V5cyB3aXRoIGxpc3RzXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHByb2Jlc19pZHggID0gMFxuICBpZHggICAgICAgICA9IC0xXG4gIGNvdW50ICAgICAgID0gMFxuICBwcm9iZXMgICAgICA9IFtcbiAgICBbICdhJywgMSwgXVxuICAgIFsgJ2EnLCBbXSwgXVxuICAgIFsgJ2EnLCBbIDEsIF0sIF1cbiAgICBbICdhJywgWyB0cnVlLCBdLCBdXG4gICAgWyAnYScsIFsgJ3gnLCAneScsICdiJywgXSwgXVxuICAgIFsgJ2EnLCBbIDEyMCwgMSAvIDMsIF0sIF1cbiAgICBbICdhJywgWyAneCcsIF0sIF1cbiAgICBdXG4gIG1hdGNoZXJzICAgID0gKCBwcm9iZSBmb3IgcHJvYmUgaW4gcHJvYmVzIClcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBmb3IgcHJvYmUsIHByb2JlX2lkeCBpbiBwcm9iZXNcbiAgICBidWZmZXIgPSBIT0xMRVJJVEguQ09ERUMuZW5jb2RlIHByb2JlXG4gICAgcmVzdWx0ID0gSE9MTEVSSVRILkNPREVDLmRlY29kZSBidWZmZXJcbiAgICBULmVxIHJlc3VsdCwgbWF0Y2hlcnNbIHByb2JlX2lkeCBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZWFkIHBhcnRpYWwgUE9TIHBocmFzZXNcIiBdID0gKCBULCBkb25lICkgLT5cbiAgcHJvYmVzX2lkeCAgPSAwXG4gIGlkeCAgICAgICAgID0gLTFcbiAgY291bnQgICAgICAgPSAwXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgbWF0Y2hlcnMgPSBbXG4gICAgWyAn8Ke3nzEnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDEgXVxuICAgIFsgJ/Cnt58yJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAyIF1cbiAgICBbICfwp7efMycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgMyBdXG4gICAgWyAn8Ke3nzQnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDQgXVxuICAgIFsgJ/Cnt58nLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDUgXVxuICAgIFsgJ/Cnt582JywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCA2IF1cbiAgICBbICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgJ+WFqycsIDAgXVxuICAgIFsgJ/Cnt58nLCAnZ3VpZGUvdWNoci9oYXMnLCAn5YiAJywgMSBdXG4gICAgWyAn8Ke3nycsICdndWlkZS91Y2hyL2hhcycsICflroAnLCAyIF1cbiAgICBbICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgJ+iynScsIDQgXVxuICAgIFsgJ/Cnt58nLCAnZ3VpZGUvdWNoci9oYXMnLCAn7oe6JywgMyBdXG4gICAgXVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHJlc3VtZVxuICAgIHByZWZpeCAgICA9IFsgJ3BvcycsICdndWlkZScsIF1cbiAgICBpbnB1dCAgICAgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgcHJlZml4LCAnKidcbiAgICBkZWJ1ZyAnwqlGcGhKSycsIGlucHV0WyAnJW1ldGEnIF1cbiAgICBzZXR0aW5ncyAgPSB7IGluZGV4ZWQ6IG5vLCB9XG4gICAgaW5wdXRcbiAgICAgIC5waXBlICQgKCBwaHJhc2UsIHNlbmQgKSA9PlxuICAgICAgICBjb3VudCAgKz0gKzFcbiAgICAgICAgaWR4ICAgICs9ICsxXG4gICAgICAgIGRlYnVnICfCqVNjNUZHJywgcGhyYXNlXG4gICAgICAgICMgVC5lcSBwaHJhc2UsIG1hdGNoZXJzWyBpZHggXVxuICAgICAgLnBpcGUgRC4kb25fZW5kID0+XG4gICAgICAgIFQuZXEgY291bnQsIG1hdGNoZXJzLmxlbmd0aFxuICAgICAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcImVuY29kZSBrZXlzIHdpdGggbGlzdCBlbGVtZW50c1wiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXMgPSBbXG4gICAgWyAnZm9vJywgJ2JhcicsIF1cbiAgICBbICdmb28nLCBbICdiYXInLCBdLCBdXG4gICAgWyBbXSwgJ2JhcicsIF1cbiAgICBbICdmb28nLCBbXSwgXVxuICAgIFsgWyAnZm9vJywgXSwgJ2JhcicsIF1cbiAgICBbIFsgNDIsIF0sICdiYXInLCBdXG4gICAgWyAnZm9vJywgWyA0MiwgXSBdXG4gICAgXVxuICBmb3IgcHJvYmUgaW4gcHJvYmVzXG4gICAgVC5lcSBwcm9iZSwgSE9MTEVSSVRILkNPREVDLmRlY29kZSBIT0xMRVJJVEguQ09ERUMuZW5jb2RlIHByb2JlXG4gIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCBhbmQgd3JpdGUgcGhyYXNlcyB3aXRoIHVuYW5hbHl6ZWQgbGlzdHNcIiBdID0gKCBULCBkb25lICkgLT5cbiAgaWR4ICAgICAgICAgPSAtMVxuICBjb3VudCAgICAgICA9IDBcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBwcm9iZXMgPSBbXG4gICAgWyAncHJvYmUjMDAnLCAnc29tZS1wcmVkaWNhdGUnLCBbXSwgXVxuICAgIFsgJ3Byb2JlIzAxJywgJ3NvbWUtcHJlZGljYXRlJywgWyAtMSBdLCBdXG4gICAgWyAncHJvYmUjMDInLCAnc29tZS1wcmVkaWNhdGUnLCBbICAwIF0sIF1cbiAgICBbICdwcm9iZSMwMycsICdzb21lLXByZWRpY2F0ZScsIFsgIDEgXSwgXVxuICAgIFsgJ3Byb2JlIzA0JywgJ3NvbWUtcHJlZGljYXRlJywgWyAgMiBdLCBdXG4gICAgWyAncHJvYmUjMDUnLCAnc29tZS1wcmVkaWNhdGUnLCBbICAyLCAtMSwgXSwgXVxuICAgIFsgJ3Byb2JlIzA2JywgJ3NvbWUtcHJlZGljYXRlJywgWyAgMiwgMCwgXSwgXVxuICAgIFsgJ3Byb2JlIzA3JywgJ3NvbWUtcHJlZGljYXRlJywgWyAgMiwgMSwgXSwgXVxuICAgIFsgJ3Byb2JlIzA4JywgJ3NvbWUtcHJlZGljYXRlJywgWyAgMiwgMSwgMCBdLCBdXG4gICAgWyAncHJvYmUjMDknLCAnc29tZS1wcmVkaWNhdGUnLCBbICAyLCAyLCBdLCBdXG4gICAgWyAncHJvYmUjMTAnLCAnc29tZS1wcmVkaWNhdGUnLCBbICAyLCBbIDIsIF0sIF0sIF1cbiAgICBbICdwcm9iZSMxMScsICdzb21lLXByZWRpY2F0ZScsIFsgIDMgXSwgXVxuICAgIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICB3cml0ZV9wcm9iZXMgPSAoIGhhbmRsZXIgKSA9PlxuICAgIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgICAgeWllbGQgSE9MTEVSSVRILmNsZWFyIGRiLCByZXN1bWVcbiAgICAgIGlucHV0ID0gRC5jcmVhdGVfdGhyb3VnaHN0cmVhbSgpXG4gICAgICBpbnB1dFxuICAgICAgICAjIC5waXBlICggWyBzYmosIHByZCwgb2JqLCBdLCBzZW5kICkgPT5cbiAgICAgICAgIyAgIGlmIHByZCBpcyAnc29tZS1wcmVkaWNhdGUnICMgYWx3YXlzIHRoZSBjYXNlIGluIHRoaXMgZXhhbXBsZVxuICAgICAgICAjICAgICBvYmpcbiAgICAgICAgLnBpcGUgSE9MTEVSSVRILiR3cml0ZSBkYiwgc29saWRzOiBbICdzb21lLXByZWRpY2F0ZScsIF1cbiAgICAgICAgLnBpcGUgRC4kb25fZW5kID0+XG4gICAgICAgICAgdXJnZSBcInRlc3QgZGF0YSB3cml0dGVuXCJcbiAgICAgICAgICBoYW5kbGVyKClcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBpbnB1dC53cml0ZSBwcm9iZSBmb3IgcHJvYmUgaW4gcHJvYmVzXG4gICAgICBpbnB1dC5lbmQoKVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgeWllbGQgd3JpdGVfcHJvYmVzIHJlc3VtZVxuICAgIGlucHV0ID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGJcbiAgICBkZWJ1ZyAnwqlGcGhKSycsIGlucHV0WyAnJW1ldGEnIF1cbiAgICBpbnB1dFxuICAgICAgLnBpcGUgJCAoIHBocmFzZSwgc2VuZCApID0+XG4gICAgICAgIGNvdW50ICArPSArMVxuICAgICAgICBpZHggICAgKz0gKzFcbiAgICAgICAgZGVidWcgJ8KpU2M1RkcnLCBwaHJhc2VcbiAgICAgICAgIyBULmVxIHBocmFzZSwgbWF0Y2hlcnNbIGlkeCBdXG4gICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgIyBULmVxIGNvdW50LCBtYXRjaGVycy5sZW5ndGhcbiAgICAgICAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZW1pbmRlcnNcIiBdID0gKCBULCBkb25lICkgLT5cbiAgYWxlcnQgXCJILiR3cml0ZSgpIG11c3QgdGVzdCBmb3IgcmVwZWF0ZWQga2V5cyBvciBpbXBsZW1lbnQgcmV3cml0aW5nIG9mIFBPUyBlbnRyaWVzXCJcbiAgZG9uZSgpXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyBIRUxQRVJTXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbnNob3dfa2V5c19hbmRfa2V5X2JmcnMgPSAoIGtleXMsIGtleV9iZnJzICkgLT5cbiAgZiA9ICggcCApIC0+ICggdCBmb3IgdCBpbiAoIHAudG9TdHJpbmcgJ2hleCcgKS5zcGxpdCAvKC4uKS8gd2hlbiB0IGlzbnQgJycgKS5qb2luICcgJ1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGNvbHVtbmlmeV9zZXR0aW5ncyA9XG4gICAgcGFkZGluZ0NocjogJyAnXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZGF0YSAgICAgID0gW11cbiAga2V5X2JmcnMgID0gKCBmIHAgZm9yIHAgaW4ga2V5X2JmcnMgKVxuICBmb3Iga2V5LCBpZHggaW4ga2V5c1xuICAgIGtleV90eHQgPSAoIHJwciBrZXkgKS5yZXBsYWNlIC9cXFxcdTAwMDAvZywgJ+KIhydcbiAgICBkYXRhLnB1c2ggeyAnc3RyJzoga2V5X3R4dCwgJ2Jmcic6IGtleV9iZnJzWyBpZHggXX1cbiAgaGVscCAnXFxuJyArIENORC5jb2x1bW5pZnkgZGF0YSwgY29sdW1uaWZ5X3NldHRpbmdzXG4gIHJldHVybiBudWxsXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZ2V0X25ld19kYl9uYW1lID0gLT5cbiAgZ2V0X25ld19kYl9uYW1lLmlkeCArPSArMVxuICByZXR1cm4gXCIvdG1wL2hvbGxlcml0aDItdGVzdGRiLSN7Z2V0X25ld19kYl9uYW1lLmlkeH1cIlxuZ2V0X25ld19kYl9uYW1lLmlkeCA9IDBcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5yZWFkX2FsbF9rZXlzID0gKCBkYiwgaGFuZGxlciApIC0+XG4gIFogPSBbXVxuICBpbnB1dCA9IGRiLmNyZWF0ZUtleVN0cmVhbSgpXG4gIGlucHV0Lm9uICdlbmQnLCAtPiBoYW5kbGVyIG51bGwsIFpcbiAgaW5wdXRcbiAgICAucGlwZSAkICggZGF0YSwgc2VuZCApID0+IFoucHVzaCBkYXRhXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xlYXJfbGV2ZWxkYiA9ICggbGV2ZWxkYiwgaGFuZGxlciApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHJvdXRlID0gbGV2ZWxkYlsgJ2xvY2F0aW9uJyBdXG4gICAgeWllbGQgbGV2ZWxkYi5jbG9zZSByZXN1bWVcbiAgICB5aWVsZCBsZXZlbGRvd24uZGVzdHJveSByb3V0ZSwgcmVzdW1lXG4gICAgeWllbGQgbGV2ZWxkYi5vcGVuIHJlc3VtZVxuICAgICMgaGVscCBcImVyYXNlZCBhbmQgcmUtb3BlbmVkIExldmVsREIgYXQgI3tyb3V0ZX1cIlxuICAgIGhhbmRsZXIgbnVsbFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfbWFpbiA9ICggaGFuZGxlciApIC0+XG4gIGRiID0gSE9MTEVSSVRILm5ld19kYiBqb2luIF9fZGlybmFtZSwgJy4uJywgJ2Ricy90ZXN0cydcbiAgdGVzdCBALCAndGltZW91dCc6IDI1MDBcblxuIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG51bmxlc3MgbW9kdWxlLnBhcmVudD9cbiAgQF9tYWluKClcblxuICAjIGRlYnVnICfCqVA5QU9SJywgKCBIT0xMRVJJVEguQ09ERUNbICd0eXBlbWFya2VycycgIF1bICdudWxsJyAgICAgICBdICkudG9TdHJpbmcgMTZcbiAgIyBkZWJ1ZyAnwql4eG1JcCcsICggSE9MTEVSSVRILkNPREVDWyAndHlwZW1hcmtlcnMnICBdWyAnZmFsc2UnICAgICAgXSApLnRvU3RyaW5nIDE2XG4gICMgZGVidWcgJ8KpWmVZMjYnLCAoIEhPTExFUklUSC5DT0RFQ1sgJ3R5cGVtYXJrZXJzJyAgXVsgJ3RydWUnICAgICAgIF0gKS50b1N0cmluZyAxNlxuICAjIGRlYnVnICfCqVdnRVI5JywgKCBIT0xMRVJJVEguQ09ERUNbICd0eXBlbWFya2VycycgIF1bICdkYXRlJyAgICAgICBdICkudG9TdHJpbmcgMTZcbiAgIyBkZWJ1ZyAnwqlVbXBqSicsICggSE9MTEVSSVRILkNPREVDWyAndHlwZW1hcmtlcnMnICBdWyAnbmluZmluaXR5JyAgXSApLnRvU3RyaW5nIDE2XG4gICMgZGVidWcgJ8KpVXJsMEsnLCAoIEhPTExFUklUSC5DT0RFQ1sgJ3R5cGVtYXJrZXJzJyAgXVsgJ25udW1iZXInICAgIF0gKS50b1N0cmluZyAxNlxuICAjIGRlYnVnICfCqW5GSUlpJywgKCBIT0xMRVJJVEguQ09ERUNbICd0eXBlbWFya2VycycgIF1bICdwbnVtYmVyJyAgICBdICkudG9TdHJpbmcgMTZcbiAgIyBkZWJ1ZyAnwqlMWjU4UicsICggSE9MTEVSSVRILkNPREVDWyAndHlwZW1hcmtlcnMnICBdWyAncGluZmluaXR5JyAgXSApLnRvU3RyaW5nIDE2XG4gICMgZGVidWcgJ8KpTVl4ZGEnLCAoIEhPTExFUklUSC5DT0RFQ1sgJ3R5cGVtYXJrZXJzJyAgXVsgJ3RleHQnICAgICAgIF0gKS50b1N0cmluZyAxNlxuXG5cblxuXG5cblxuXG5cblxuXG4iXX0=