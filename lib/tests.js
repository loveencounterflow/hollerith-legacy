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

  this._encode_list = function(list) {
    var i, idx, len, value;
    for (idx = i = 0, len = list.length; i < len; idx = ++i) {
      value = list[idx];
      list[idx] = BYTEWISE.encode(value);
    }
    return list;
  };

  this._decode_list = function(list) {
    var i, idx, len, value;
    for (idx = i = 0, len = list.length; i < len; idx = ++i) {
      value = list[idx];
      list[idx] = BYTEWISE.decode(value);
    }
    return list;
  };

  this._sort_list = function(list) {
    this._encode_list(list);
    list.sort(Buffer.compare);
    this._decode_list(list);
    return list;
  };

  this._feed_test_data = function(db, probes_idx, handler) {
    switch (probes_idx) {
      case 0:
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
        var count, i, idx, input, probe_idx, query;
        (yield HOLLERITH.clear(db, resume));
        for (idx = i = 0; i < 10; idx = ++i) {
          db['%self'].put(HOLLERITH._encode(db, ['x', idx, 'x']), HOLLERITH._zero_enc);
        }
        probe_idx = 4;
        count = 0;
        query = HOLLERITH._query_from_prefix(db, ['x', probe_idx]);
        input = db['%self'].createReadStream(query);
        return input.pipe($(function(arg, send) {
          var key, value;
          key = arg.key, value = arg.value;
          count += 1;
          return T.eq((HOLLERITH._decode(db, key))[1], probe_idx);
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
        var count, i, idx, input, prefix, probe_idx;
        (yield HOLLERITH.clear(db, resume));
        for (idx = i = 0; i < 10; idx = ++i) {
          db['%self'].put(HOLLERITH._encode(db, ['x', idx, 'x']), HOLLERITH._zero_enc);
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
        var count, delta, hi, i, idx, input, lo, probe_idx, query;
        (yield HOLLERITH.clear(db, resume));
        for (idx = i = 0; i < 10; idx = ++i) {
          db['%self'].put(HOLLERITH._encode(db, ['x', idx, 'x']), HOLLERITH._zero_enc);
        }
        probe_idx = 3;
        count = 0;
        delta = 2;
        lo = ['x', probe_idx];
        hi = ['x', probe_idx + delta];
        query = {
          gte: HOLLERITH._encode(db, lo),
          lte: (HOLLERITH._query_from_prefix(db, hi))['lte']
        };
        input = db['%self'].createReadStream(query);
        return input.pipe($(function(arg, send) {
          var key, value;
          key = arg.key, value = arg.value;
          count += 1;
          return T.eq((HOLLERITH._decode(db, key))[1], probe_idx + count - 1);
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
          db['%self'].put(HOLLERITH._encode(db, ['x', idx, 'x']), HOLLERITH._zero_enc);
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
    matchers = [['𧷟', 'cp/cid', 163295], ['𧷟', 'guide/lineup/length', 5], ['𧷟', 'guide/uchr/has', ['八', '刀', '宀', '', '貝']], ['𧷟', 'rank/cjt', 5432], ['𧷟1', 'guide/lineup/length', 1], ['𧷟2', 'guide/lineup/length', 2], ['𧷟3', 'guide/lineup/length', 3], ['𧷟4', 'guide/lineup/length', 4], ['𧷟6', 'guide/lineup/length', 6]];
    return step((function(_this) {
      return function*(resume) {
        var input, prefix;
        (yield _this._feed_test_data(db, probes_idx, resume));
        prefix = ['spo', '𧷟'];
        input = HOLLERITH.create_phrasestream(db, prefix);
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
        probes = [null, false, true, CODEC.first_date, new Date(0), new Date(8e11), new Date(), CODEC.last_date, 1234, Infinity, '', '一', '三', '二', '𠀀', '𠀀\x00', String.fromCodePoint(0x10ffff)];
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlc3RzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJQTtBQUFBLE1BQUEsc1BBQUE7O0FBQUEsRUFBQSxRQUFBLEdBQTRCLE9BQUEsQ0FBUSxNQUFSLENBQTVCLENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQTRCLFFBQVEsQ0FBQyxJQUZyQyxDQUFBOztBQUFBLEVBSUEsR0FBQSxHQUE0QixPQUFBLENBQVEsS0FBUixDQUo1QixDQUFBOztBQUFBLEVBS0EsR0FBQSxHQUE0QixHQUFHLENBQUMsR0FMaEMsQ0FBQTs7QUFBQSxFQU1BLEtBQUEsR0FBNEIsaUJBTjVCLENBQUE7O0FBQUEsRUFPQSxHQUFBLEdBQTRCLEdBQUcsQ0FBQyxVQUFKLENBQWUsT0FBZixFQUE0QixLQUE1QixDQVA1QixDQUFBOztBQUFBLEVBUUEsSUFBQSxHQUE0QixHQUFHLENBQUMsVUFBSixDQUFlLE1BQWYsRUFBNEIsS0FBNUIsQ0FSNUIsQ0FBQTs7QUFBQSxFQVNBLE9BQUEsR0FBNEIsR0FBRyxDQUFDLFVBQUosQ0FBZSxTQUFmLEVBQTRCLEtBQTVCLENBVDVCLENBQUE7O0FBQUEsRUFVQSxLQUFBLEdBQTRCLEdBQUcsQ0FBQyxVQUFKLENBQWUsT0FBZixFQUE0QixLQUE1QixDQVY1QixDQUFBOztBQUFBLEVBV0EsS0FBQSxHQUE0QixHQUFHLENBQUMsVUFBSixDQUFlLE9BQWYsRUFBNEIsS0FBNUIsQ0FYNUIsQ0FBQTs7QUFBQSxFQVlBLElBQUEsR0FBNEIsR0FBRyxDQUFDLFVBQUosQ0FBZSxNQUFmLEVBQTRCLEtBQTVCLENBWjVCLENBQUE7O0FBQUEsRUFhQSxJQUFBLEdBQTRCLEdBQUcsQ0FBQyxVQUFKLENBQWUsTUFBZixFQUE0QixLQUE1QixDQWI1QixDQUFBOztBQUFBLEVBY0EsSUFBQSxHQUE0QixHQUFHLENBQUMsVUFBSixDQUFlLE1BQWYsRUFBNEIsS0FBNUIsQ0FkNUIsQ0FBQTs7QUFBQSxFQWVBLElBQUEsR0FBNEIsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFULENBQWMsR0FBZCxDQWY1QixDQUFBOztBQUFBLEVBaUJBLE9BQUEsR0FBNEIsT0FBQSxDQUFRLG9CQUFSLENBakI1QixDQUFBOztBQUFBLEVBa0JBLElBQUEsR0FBNEIsT0FBTyxDQUFDLElBbEJwQyxDQUFBOztBQUFBLEVBbUJBLEtBQUEsR0FBNEIsT0FBTyxDQUFDLEtBbkJwQyxDQUFBOztBQUFBLEVBeUJBLElBQUEsR0FBNEIsT0FBQSxDQUFRLFVBQVIsQ0F6QjVCLENBQUE7O0FBQUEsRUEyQkEsQ0FBQSxHQUE0QixPQUFBLENBQVEsYUFBUixDQTNCNUIsQ0FBQTs7QUFBQSxFQTRCQSxDQUFBLEdBQTRCLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBUixDQUFhLENBQWIsQ0E1QjVCLENBQUE7O0FBQUEsRUE4QkEsU0FBQSxHQUE0QixPQUFBLENBQVEsUUFBUixDQTlCNUIsQ0FBQTs7QUFBQSxFQStCQSxFQUFBLEdBQTRCLElBL0I1QixDQUFBOztBQUFBLEVBaUNBLFFBQUEsR0FBNEIsT0FBQSxDQUFRLFVBQVIsQ0FqQzVCLENBQUE7O0FBQUEsRUFrQ0EsT0FBQSxHQUE0QixPQUFBLENBQVEsU0FBUixDQWxDNUIsQ0FBQTs7QUFBQSxFQW1DQSxTQUFBLEdBQTRCLE9BQUEsQ0FBUSxXQUFSLENBbkM1QixDQUFBOztBQUFBLEVBb0NBLEtBQUEsR0FBNEIsT0FBQSxDQUFRLFNBQVIsQ0FwQzVCLENBQUE7O0FBQUEsRUF3Q0EsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsU0FBRSxJQUFGLEdBQUE7QUFDZCxRQUFBLGtCQUFBO0FBQUEsU0FBQSxrREFBQTt3QkFBQTtBQUFBLE1BQUUsSUFBTSxDQUFBLEdBQUEsQ0FBTixHQUFjLFFBQVEsQ0FBQyxNQUFULENBQWdCLEtBQWhCLENBQWhCLENBQUE7QUFBQSxLQUFBO0FBQ0EsV0FBTyxJQUFQLENBRmM7RUFBQSxDQXhDaEIsQ0FBQTs7QUFBQSxFQTZDQSxJQUFDLENBQUEsWUFBRCxHQUFnQixTQUFFLElBQUYsR0FBQTtBQUNkLFFBQUEsa0JBQUE7QUFBQSxTQUFBLGtEQUFBO3dCQUFBO0FBQUEsTUFBRSxJQUFNLENBQUEsR0FBQSxDQUFOLEdBQWMsUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsS0FBaEIsQ0FBaEIsQ0FBQTtBQUFBLEtBQUE7QUFDQSxXQUFPLElBQVAsQ0FGYztFQUFBLENBN0NoQixDQUFBOztBQUFBLEVBa0RBLElBQUMsQ0FBQSxVQUFELEdBQWMsU0FBRSxJQUFGLEdBQUE7QUFDWixJQUFBLElBQUMsQ0FBQSxZQUFELENBQWMsSUFBZCxDQUFBLENBQUE7QUFBQSxJQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsTUFBTSxDQUFDLE9BQWpCLENBREEsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLFlBQUQsQ0FBYyxJQUFkLENBRkEsQ0FBQTtBQUdBLFdBQU8sSUFBUCxDQUpZO0VBQUEsQ0FsRGQsQ0FBQTs7QUFBQSxFQXlEQSxJQUFDLENBQUEsZUFBRCxHQUFtQixTQUFFLEVBQUYsRUFBTSxVQUFOLEVBQWtCLE9BQWxCLEdBQUE7QUFDakIsWUFBTyxVQUFQO0FBQUEsV0FFTyxDQUZQO0FBR0ksUUFBQSxJQUFBLENBQUssQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxVQUFFLE1BQUYsR0FBQTtBQUNILGdCQUFBLHlCQUFBO0FBQUEsWUFBQSxPQUFBLFNBQWUsQ0FBQyxLQUFWLENBQWdCLEVBQWhCLEVBQW9CLE1BQXBCLENBQU4sQ0FBQSxDQUFBO0FBQUEsWUFDQSxLQUFBLEdBQVEsQ0FBQyxDQUFDLG9CQUFGLENBQUEsQ0FEUixDQUFBO0FBQUEsWUFFQSxLQUNFLENBQUMsSUFESCxDQUNRLFNBQVMsQ0FBQyxNQUFWLENBQWlCLEVBQWpCLEVBQXFCLENBQXJCLENBRFIsQ0FHRSxDQUFDLElBSEgsQ0FHUSxDQUFDLENBQUMsT0FBRixDQUFVLFNBQUEsR0FBQTtBQUNkLGNBQUEsSUFBQSxDQUFLLG1CQUFMLENBQUEsQ0FBQTtxQkFDQSxPQUFBLENBQVEsSUFBUixFQUZjO1lBQUEsQ0FBVixDQUhSLENBRkEsQ0FBQTtBQVNBO0FBQUEsaUJBQUEscUNBQUE7NkJBQUE7QUFHRSxjQUFBLEtBQUssQ0FBQyxLQUFOLENBQVksS0FBWixDQUFBLENBSEY7QUFBQSxhQVRBO21CQWFBLEtBQUssQ0FBQyxHQUFOLENBQUEsRUFkRztVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUwsQ0FBQSxDQUhKO0FBRU87QUFGUCxXQW1CTyxDQW5CUDtBQW9CSSxRQUFBLElBQUEsQ0FBSyxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFVBQUUsTUFBRixHQUFBO0FBQ0gsZ0JBQUEsZ0NBQUE7QUFBQSxZQUFBLE9BQUEsU0FBZSxDQUFDLEtBQVYsQ0FBZ0IsRUFBaEIsRUFBb0IsTUFBcEIsQ0FBTixDQUFBLENBQUE7QUFBQSxZQUNBLEtBQUEsR0FBUSxDQUFDLENBQUMsb0JBQUYsQ0FBQSxDQURSLENBQUE7QUFBQSxZQUVBLEtBQ0UsQ0FBQyxJQURILENBQ1EsU0FBUyxDQUFDLE1BQVYsQ0FBaUIsRUFBakIsRUFBcUIsQ0FBckIsQ0FEUixDQUdFLENBQUMsSUFISCxDQUdRLENBQUMsQ0FBQyxPQUFGLENBQVUsU0FBQSxHQUFBO0FBQ2QsY0FBQSxJQUFBLENBQUssbUJBQUwsQ0FBQSxDQUFBO3FCQUNBLE9BQUEsQ0FBUSxJQUFSLEVBRmM7WUFBQSxDQUFWLENBSFIsQ0FGQSxDQUFBO0FBU0E7QUFBQSxpQkFBQSxxQ0FBQTsrQkFBQTtBQUNFLGNBQUEsR0FBQSxHQUFNLFNBQVMsQ0FBQyxZQUFWLENBQXVCLEVBQXZCLEVBQTJCLE9BQTNCLENBQU4sQ0FBQTtBQUFBLGNBQ0EsS0FBSyxDQUFDLEtBQU4sQ0FBWSxHQUFaLENBREEsQ0FERjtBQUFBLGFBVEE7bUJBWUEsS0FBSyxDQUFDLEdBQU4sQ0FBQSxFQWJHO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBTCxDQUFBLENBcEJKO0FBbUJPO0FBbkJQO0FBbUNPLGVBQU8sT0FBQSxDQUFZLElBQUEsS0FBQSxDQUFNLHVCQUFBLEdBQXVCLENBQUMsR0FBQSxDQUFJLFVBQUosQ0FBRCxDQUE3QixDQUFaLENBQVAsQ0FuQ1A7QUFBQSxLQUFBO0FBcUNBLFdBQU8sSUFBUCxDQXRDaUI7RUFBQSxDQXpEbkIsQ0FBQTs7QUFBQSxFQWtHQSxJQUFDLENBQUEsZUFBZSxDQUFDLE1BQWpCLEdBQTBCLEVBbEcxQixDQUFBOztBQUFBLEVBcUdBLElBQUMsQ0FBQSxlQUFlLENBQUMsTUFBTSxDQUFDLElBQXhCLENBQTZCLENBQzNCLENBQUUsS0FBRixFQUFTLHFCQUFULEVBQTZDLENBQTdDLENBRDJCLEVBRTNCLENBQUUsS0FBRixFQUFTLHFCQUFULEVBQTZDLENBQTdDLENBRjJCLEVBRzNCLENBQUUsS0FBRixFQUFTLHFCQUFULEVBQTZDLENBQTdDLENBSDJCLEVBSTNCLENBQUUsS0FBRixFQUFTLHFCQUFULEVBQTZDLENBQTdDLENBSjJCLEVBSzNCLENBQUUsSUFBRixFQUFRLHFCQUFSLEVBQTRDLENBQTVDLENBTDJCLEVBTTNCLENBQUUsS0FBRixFQUFTLHFCQUFULEVBQTZDLENBQTdDLENBTjJCLEVBTzNCLENBQUUsSUFBRixFQUFRLFFBQVIsRUFBNEMsTUFBNUMsQ0FQMkIsRUFRM0IsQ0FBRSxJQUFGLEVBQVEsZ0JBQVIsRUFBNEMsQ0FBRSxHQUFGLEVBQU8sR0FBUCxFQUFZLEdBQVosRUFBaUIsR0FBakIsRUFBc0IsR0FBdEIsQ0FBNUMsQ0FSMkIsRUFTM0IsQ0FBRSxJQUFGLEVBQVEsVUFBUixFQUE0QyxJQUE1QyxDQVQyQixFQVUzQixDQUFFLEdBQUYsRUFBTyx3QkFBUCxFQUEwQyxJQUExQyxDQVYyQixFQVczQixDQUFFLEdBQUYsRUFBTyx3QkFBUCxFQUEwQyxRQUExQyxDQVgyQixFQVkzQixDQUFFLEdBQUYsRUFBTyx3QkFBUCxFQUEwQyxJQUExQyxDQVoyQixFQWEzQixDQUFFLEdBQUYsRUFBTyx3QkFBUCxFQUEwQyxJQUExQyxDQWIyQixFQWMzQixDQUFFLEdBQUYsRUFBTyx3QkFBUCxFQUEwQyxRQUExQyxDQWQyQixFQWUzQixDQUFFLEdBQUYsRUFBTyxVQUFQLEVBQTJDLEtBQTNDLENBZjJCLEVBZ0IzQixDQUFFLEdBQUYsRUFBTyxVQUFQLEVBQTJDLEtBQTNDLENBaEIyQixFQWlCM0IsQ0FBRSxHQUFGLEVBQU8sVUFBUCxFQUEyQyxLQUEzQyxDQWpCMkIsRUFrQjNCLENBQUUsR0FBRixFQUFPLFVBQVAsRUFBMkMsS0FBM0MsQ0FsQjJCLEVBbUIzQixDQUFFLEdBQUYsRUFBTyxVQUFQLEVBQTJDLEtBQTNDLENBbkIyQixDQUE3QixDQXJHQSxDQUFBOztBQUFBLEVBNEhBLElBQUMsQ0FBQSxlQUFlLENBQUMsTUFBTSxDQUFDLElBQXhCLENBQTZCLENBQzNCLGlDQUQyQixFQUUzQixpQ0FGMkIsRUFHM0Isc0NBSDJCLEVBSTNCLHNDQUoyQixFQUszQixzQ0FMMkIsRUFNM0Isc0NBTjJCLEVBTzNCLHNDQVAyQixFQVEzQixzQ0FSMkIsRUFTM0Isd0NBVDJCLEVBVTNCLHNDQVYyQixFQVczQixvQ0FYMkIsRUFZM0Isa0NBWjJCLEVBYTNCLGlEQWIyQixFQWMzQiw2Q0FkMkIsRUFlM0IsOENBZjJCLEVBZ0IzQixrQ0FoQjJCLENBQTdCLENBNUhBLENBQUE7O0FBQUEsRUFpSkEsSUFBRyxDQUFBLHFCQUFBLENBQUgsR0FBNkIsU0FBRSxDQUFGLEVBQUssSUFBTCxHQUFBO0FBQzNCLFFBQUEsZUFBQTtBQUFBLElBQUEsVUFBQSxHQUFjLENBQWQsQ0FBQTtBQUFBLElBQ0EsR0FBQSxHQUFNLENBQUEsQ0FETixDQUFBO1dBRUEsSUFBQSxDQUFLLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxVQUFFLE1BQUYsR0FBQTtBQUNILFFBQUEsT0FBQSxLQUFPLENBQUEsZUFBRCxDQUFpQixFQUFqQixFQUFxQixVQUFyQixFQUFpQyxNQUFqQyxDQUFOLENBQUEsQ0FBQTtlQUNBLElBQUEsQ0FBQSxFQUZHO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBTCxFQUgyQjtFQUFBLENBako3QixDQUFBOztBQUFBLEVBeUpBLElBQUcsQ0FBQSxvQkFBQSxDQUFILEdBQTRCLFNBQUUsQ0FBRixFQUFLLElBQUwsR0FBQTtBQUMxQixRQUFBLGVBQUE7QUFBQSxJQUFBLFVBQUEsR0FBYyxDQUFkLENBQUE7QUFBQSxJQUNBLEdBQUEsR0FBTSxDQUFBLENBRE4sQ0FBQTtXQUVBLElBQUEsQ0FBSyxDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsVUFBRSxNQUFGLEdBQUE7QUFDSCxZQUFBLEtBQUE7QUFBQSxRQUFBLE9BQUEsS0FBTyxDQUFBLGVBQUQsQ0FBaUIsRUFBakIsRUFBcUIsVUFBckIsRUFBaUMsTUFBakMsQ0FBTixDQUFBLENBQUE7QUFBQSxRQUNBLEtBQUEsR0FBUSxTQUFTLENBQUMsa0JBQVYsQ0FBNkIsRUFBN0IsQ0FEUixDQUFBO2VBRUEsS0FFRSxDQUFDLElBRkgsQ0FFUSxDQUFBLENBQUUsU0FBRSxHQUFGLEVBQW1CLElBQW5CLEdBQUE7QUFDTixjQUFBLFVBQUE7QUFBQSxVQURVLGNBQUssY0FDZixDQUFBO2lCQUFBLEdBQUEsSUFBTyxDQUFBLEVBREQ7UUFBQSxDQUFGLENBRlIsQ0FLRSxDQUFDLElBTEgsQ0FLUSxDQUFDLENBQUMsT0FBRixDQUFVLFNBQUEsR0FBQTtpQkFBRyxJQUFBLENBQUEsRUFBSDtRQUFBLENBQVYsQ0FMUixFQUhHO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBTCxFQUgwQjtFQUFBLENBeko1QixDQUFBOztBQUFBLEVBdUtBLElBQUcsQ0FBQSw2QkFBQSxDQUFILEdBQXFDLFNBQUUsQ0FBRixFQUFLLElBQUwsR0FBQTtXQUNuQyxJQUFBLENBQUssQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFVBQUUsTUFBRixHQUFBO0FBQ0gsWUFBQSxzQ0FBQTtBQUFBLFFBQUEsT0FBQSxTQUFlLENBQUMsS0FBVixDQUFnQixFQUFoQixFQUFvQixNQUFwQixDQUFOLENBQUEsQ0FBQTtBQUNBLGFBQVcsOEJBQVgsR0FBQTtBQUNFLFVBQUEsRUFBSSxDQUFBLE9BQUEsQ0FBUyxDQUFDLEdBQWQsQ0FBb0IsU0FBUyxDQUFDLE9BQVYsQ0FBa0IsRUFBbEIsRUFBc0IsQ0FBRSxHQUFGLEVBQU8sR0FBUCxFQUFZLEdBQVosQ0FBdEIsQ0FBcEIsRUFBZ0UsU0FBUyxDQUFDLFNBQTFFLENBQUEsQ0FERjtBQUFBLFNBREE7QUFBQSxRQUlBLFNBQUEsR0FBWSxDQUpaLENBQUE7QUFBQSxRQUtBLEtBQUEsR0FBWSxDQUxaLENBQUE7QUFBQSxRQU1BLEtBQUEsR0FBWSxTQUFTLENBQUMsa0JBQVYsQ0FBNkIsRUFBN0IsRUFBaUMsQ0FBRSxHQUFGLEVBQU8sU0FBUCxDQUFqQyxDQU5aLENBQUE7QUFBQSxRQU9BLEtBQUEsR0FBWSxFQUFJLENBQUEsT0FBQSxDQUFTLENBQUMsZ0JBQWQsQ0FBK0IsS0FBL0IsQ0FQWixDQUFBO2VBUUEsS0FDRSxDQUFDLElBREgsQ0FDUSxDQUFBLENBQUUsU0FBRSxHQUFGLEVBQW1CLElBQW5CLEdBQUE7QUFDTixjQUFBLFVBQUE7QUFBQSxVQURVLFVBQUEsS0FBSyxZQUFBLEtBQ2YsQ0FBQTtBQUFBLFVBQUEsS0FBQSxJQUFTLENBQVQsQ0FBQTtpQkFDQSxDQUFDLENBQUMsRUFBRixDQUFLLENBQUUsU0FBUyxDQUFDLE9BQVYsQ0FBa0IsRUFBbEIsRUFBc0IsR0FBdEIsQ0FBRixDQUErQixDQUFBLENBQUEsQ0FBcEMsRUFBeUMsU0FBekMsRUFGTTtRQUFBLENBQUYsQ0FEUixDQUlFLENBQUMsSUFKSCxDQUlRLENBQUMsQ0FBQyxPQUFGLENBQVUsU0FBQSxHQUFBO0FBQ2QsVUFBQSxDQUFDLENBQUMsRUFBRixDQUFLLEtBQUwsRUFBWSxDQUFaLENBQUEsQ0FBQTtpQkFDQSxJQUFBLENBQUEsRUFGYztRQUFBLENBQVYsQ0FKUixFQVRHO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBTCxFQURtQztFQUFBLENBdktyQyxDQUFBOztBQUFBLEVBMExBLElBQUcsQ0FBQSw2QkFBQSxDQUFILEdBQXFDLFNBQUUsQ0FBRixFQUFLLElBQUwsR0FBQTtXQUNuQyxJQUFBLENBQUssQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFVBQUUsTUFBRixHQUFBO0FBQ0gsWUFBQSx1Q0FBQTtBQUFBLFFBQUEsT0FBQSxTQUFlLENBQUMsS0FBVixDQUFnQixFQUFoQixFQUFvQixNQUFwQixDQUFOLENBQUEsQ0FBQTtBQUNBLGFBQVcsOEJBQVgsR0FBQTtBQUNFLFVBQUEsRUFBSSxDQUFBLE9BQUEsQ0FBUyxDQUFDLEdBQWQsQ0FBb0IsU0FBUyxDQUFDLE9BQVYsQ0FBa0IsRUFBbEIsRUFBc0IsQ0FBRSxHQUFGLEVBQU8sR0FBUCxFQUFZLEdBQVosQ0FBdEIsQ0FBcEIsRUFBZ0UsU0FBUyxDQUFDLFNBQTFFLENBQUEsQ0FERjtBQUFBLFNBREE7QUFBQSxRQUlBLFNBQUEsR0FBWSxDQUpaLENBQUE7QUFBQSxRQUtBLEtBQUEsR0FBWSxDQUxaLENBQUE7QUFBQSxRQU1BLE1BQUEsR0FBWSxDQUFFLEdBQUYsRUFBTyxTQUFQLENBTlosQ0FBQTtBQUFBLFFBT0EsS0FBQSxHQUFZLFNBQVMsQ0FBQyxrQkFBVixDQUE2QixFQUE3QixFQUFpQyxNQUFqQyxDQVBaLENBQUE7ZUFRQSxLQUNFLENBQUMsSUFESCxDQUNRLENBQUEsQ0FBRSxTQUFFLEtBQUYsRUFBUyxJQUFULEdBQUE7QUFDTixjQUFBLFVBQUE7QUFBQSxVQUFBLEtBQUEsSUFBUyxDQUFULENBQUE7QUFBQSxVQUNFLGNBQUYsRUFBTyxnQkFEUCxDQUFBO2lCQUVBLENBQUMsQ0FBQyxFQUFGLENBQUssR0FBSyxDQUFBLENBQUEsQ0FBVixFQUFlLFNBQWYsRUFITTtRQUFBLENBQUYsQ0FEUixDQUtFLENBQUMsSUFMSCxDQUtRLENBQUMsQ0FBQyxPQUFGLENBQVUsU0FBQSxHQUFBO0FBQ2QsVUFBQSxDQUFDLENBQUMsRUFBRixDQUFLLEtBQUwsRUFBWSxDQUFaLENBQUEsQ0FBQTtpQkFDQSxJQUFBLENBQUEsRUFGYztRQUFBLENBQVYsQ0FMUixFQVRHO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBTCxFQURtQztFQUFBLENBMUxyQyxDQUFBOztBQUFBLEVBOE1BLElBQUcsQ0FBQSw2QkFBQSxDQUFILEdBQXFDLFNBQUUsQ0FBRixFQUFLLElBQUwsR0FBQTtXQUNuQyxJQUFBLENBQUssQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFVBQUUsTUFBRixHQUFBO0FBQ0gsWUFBQSxxREFBQTtBQUFBLFFBQUEsT0FBQSxTQUFlLENBQUMsS0FBVixDQUFnQixFQUFoQixFQUFvQixNQUFwQixDQUFOLENBQUEsQ0FBQTtBQUNBLGFBQVcsOEJBQVgsR0FBQTtBQUNFLFVBQUEsRUFBSSxDQUFBLE9BQUEsQ0FBUyxDQUFDLEdBQWQsQ0FBb0IsU0FBUyxDQUFDLE9BQVYsQ0FBa0IsRUFBbEIsRUFBc0IsQ0FBRSxHQUFGLEVBQU8sR0FBUCxFQUFZLEdBQVosQ0FBdEIsQ0FBcEIsRUFBZ0UsU0FBUyxDQUFDLFNBQTFFLENBQUEsQ0FERjtBQUFBLFNBREE7QUFBQSxRQUlBLFNBQUEsR0FBWSxDQUpaLENBQUE7QUFBQSxRQUtBLEtBQUEsR0FBWSxDQUxaLENBQUE7QUFBQSxRQU1BLEtBQUEsR0FBWSxDQU5aLENBQUE7QUFBQSxRQU9BLEVBQUEsR0FBWSxDQUFFLEdBQUYsRUFBTyxTQUFQLENBUFosQ0FBQTtBQUFBLFFBUUEsRUFBQSxHQUFZLENBQUUsR0FBRixFQUFPLFNBQUEsR0FBWSxLQUFuQixDQVJaLENBQUE7QUFBQSxRQVNBLEtBQUEsR0FBWTtBQUFBLFVBQUUsR0FBQSxFQUFPLFNBQVMsQ0FBQyxPQUFWLENBQWtCLEVBQWxCLEVBQXNCLEVBQXRCLENBQVQ7QUFBQSxVQUFxQyxHQUFBLEVBQUssQ0FBRSxTQUFTLENBQUMsa0JBQVYsQ0FBNkIsRUFBN0IsRUFBaUMsRUFBakMsQ0FBRixDQUF5QyxDQUFBLEtBQUEsQ0FBbkY7U0FUWixDQUFBO0FBQUEsUUFVQSxLQUFBLEdBQVksRUFBSSxDQUFBLE9BQUEsQ0FBUyxDQUFDLGdCQUFkLENBQStCLEtBQS9CLENBVlosQ0FBQTtlQVdBLEtBQ0UsQ0FBQyxJQURILENBQ1EsQ0FBQSxDQUFFLFNBQUUsR0FBRixFQUFtQixJQUFuQixHQUFBO0FBQ04sY0FBQSxVQUFBO0FBQUEsVUFEVSxVQUFBLEtBQUssWUFBQSxLQUNmLENBQUE7QUFBQSxVQUFBLEtBQUEsSUFBUyxDQUFULENBQUE7aUJBQ0EsQ0FBQyxDQUFDLEVBQUYsQ0FBSyxDQUFFLFNBQVMsQ0FBQyxPQUFWLENBQWtCLEVBQWxCLEVBQXNCLEdBQXRCLENBQUYsQ0FBK0IsQ0FBQSxDQUFBLENBQXBDLEVBQXlDLFNBQUEsR0FBWSxLQUFaLEdBQW9CLENBQTdELEVBRk07UUFBQSxDQUFGLENBRFIsQ0FJRSxDQUFDLElBSkgsQ0FJUSxDQUFDLENBQUMsT0FBRixDQUFVLFNBQUEsR0FBQTtBQUNkLFVBQUEsQ0FBQyxDQUFDLEVBQUYsQ0FBSyxLQUFMLEVBQVksS0FBQSxHQUFRLENBQXBCLENBQUEsQ0FBQTtpQkFDQSxJQUFBLENBQUEsRUFGYztRQUFBLENBQVYsQ0FKUixFQVpHO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBTCxFQURtQztFQUFBLENBOU1yQyxDQUFBOztBQUFBLEVBb09BLElBQUcsQ0FBQSw2QkFBQSxDQUFILEdBQXFDLFNBQUUsQ0FBRixFQUFLLElBQUwsR0FBQTtXQUNuQyxJQUFBLENBQUssQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFVBQUUsTUFBRixHQUFBO0FBQ0gsWUFBQSw4Q0FBQTtBQUFBLFFBQUEsT0FBQSxTQUFlLENBQUMsS0FBVixDQUFnQixFQUFoQixFQUFvQixNQUFwQixDQUFOLENBQUEsQ0FBQTtBQUNBLGFBQVcsOEJBQVgsR0FBQTtBQUNFLFVBQUEsRUFBSSxDQUFBLE9BQUEsQ0FBUyxDQUFDLEdBQWQsQ0FBb0IsU0FBUyxDQUFDLE9BQVYsQ0FBa0IsRUFBbEIsRUFBc0IsQ0FBRSxHQUFGLEVBQU8sR0FBUCxFQUFZLEdBQVosQ0FBdEIsQ0FBcEIsRUFBZ0UsU0FBUyxDQUFDLFNBQTFFLENBQUEsQ0FERjtBQUFBLFNBREE7QUFBQSxRQUlBLFNBQUEsR0FBWSxDQUpaLENBQUE7QUFBQSxRQUtBLEtBQUEsR0FBWSxDQUxaLENBQUE7QUFBQSxRQU1BLEtBQUEsR0FBWSxDQU5aLENBQUE7QUFBQSxRQU9BLEVBQUEsR0FBWSxDQUFFLEdBQUYsRUFBTyxTQUFQLENBUFosQ0FBQTtBQUFBLFFBUUEsRUFBQSxHQUFZLENBQUUsR0FBRixFQUFPLFNBQUEsR0FBWSxLQUFuQixDQVJaLENBQUE7QUFBQSxRQVNBLEtBQUEsR0FBWSxTQUFTLENBQUMsa0JBQVYsQ0FBNkIsRUFBN0IsRUFBaUMsRUFBakMsRUFBcUMsRUFBckMsQ0FUWixDQUFBO2VBVUEsS0FDRSxDQUFDLElBREgsQ0FDUSxDQUFBLENBQUUsU0FBRSxHQUFGLEVBQW1CLElBQW5CLEdBQUE7QUFDTixjQUFBLFVBQUE7QUFBQSxVQURVLGNBQUssY0FDZixDQUFBO0FBQUEsVUFBQSxLQUFBLElBQVMsQ0FBVCxDQUFBO2lCQUNBLENBQUMsQ0FBQyxFQUFGLENBQUssR0FBSyxDQUFBLENBQUEsQ0FBVixFQUFlLFNBQUEsR0FBWSxLQUFaLEdBQW9CLENBQW5DLEVBRk07UUFBQSxDQUFGLENBRFIsQ0FJRSxDQUFDLElBSkgsQ0FJUSxDQUFDLENBQUMsT0FBRixDQUFVLFNBQUEsR0FBQTtBQUNkLFVBQUEsQ0FBQyxDQUFDLEVBQUYsQ0FBSyxLQUFMLEVBQVksS0FBQSxHQUFRLENBQXBCLENBQUEsQ0FBQTtpQkFDQSxJQUFBLENBQUEsRUFGYztRQUFBLENBQVYsQ0FKUixFQVhHO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBTCxFQURtQztFQUFBLENBcE9yQyxDQUFBOztBQUFBLEVBeVBBLElBQUcsQ0FBQSxnREFBQSxDQUFILEdBQXdELFNBQUUsQ0FBRixFQUFLLElBQUwsR0FBQTtBQUN0RCxRQUFBLE9BQUE7QUFBQSxJQUFBLE9BQUEsR0FBVSw2Q0FBVixDQUFBO0FBQUEsSUFDQSxDQUFDLENBQUMsTUFBRixDQUFTLE9BQVQsRUFBa0IsQ0FBRSxTQUFBLEdBQUE7YUFBRyxTQUFTLENBQUMsa0JBQVYsQ0FBNkIsRUFBN0IsRUFBaUMsSUFBakMsRUFBdUMsQ0FBRSxLQUFGLENBQXZDLEVBQUg7SUFBQSxDQUFGLENBQWxCLENBREEsQ0FBQTtXQUVBLElBQUEsQ0FBQSxFQUhzRDtFQUFBLENBelB4RCxDQUFBOztBQUFBLEVBK1BBLElBQUcsQ0FBQSxpQkFBQSxDQUFILEdBQXlCLFNBQUUsQ0FBRixFQUFLLElBQUwsR0FBQTtBQUN2QixRQUFBLDhDQUFBO0FBQUEsSUFBQSxVQUFBLEdBQWMsQ0FBZCxDQUFBO0FBQUEsSUFDQSxHQUFBLEdBQWMsQ0FBQSxDQURkLENBQUE7QUFBQSxJQUdBLFlBQUEsR0FBZSxDQUNiLENBQUUsS0FBRixFQUFTLHFCQUFULEVBQWdDLENBQWhDLEVBQW1DLEtBQW5DLENBRGEsRUFFYixDQUFFLEtBQUYsRUFBUyxxQkFBVCxFQUFnQyxDQUFoQyxFQUFtQyxLQUFuQyxDQUZhLEVBR2IsQ0FBRSxLQUFGLEVBQVMscUJBQVQsRUFBZ0MsQ0FBaEMsRUFBbUMsS0FBbkMsQ0FIYSxDQUhmLENBQUE7QUFBQSxJQVNBLGVBQUEsR0FBa0IsQ0FDaEIsQ0FBRSxLQUFGLEVBQVMscUJBQVQsRUFBZ0MsQ0FBaEMsQ0FEZ0IsRUFFaEIsQ0FBRSxLQUFGLEVBQVMscUJBQVQsRUFBZ0MsQ0FBaEMsQ0FGZ0IsRUFHaEIsQ0FBRSxLQUFGLEVBQVMscUJBQVQsRUFBZ0MsQ0FBaEMsQ0FIZ0IsQ0FUbEIsQ0FBQTtXQWVBLElBQUEsQ0FBSyxDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsVUFBRSxNQUFGLEdBQUE7QUFDSCxZQUFBLGFBQUE7QUFBQSxRQUFBLE9BQUEsS0FBTyxDQUFBLGVBQUQsQ0FBaUIsRUFBakIsRUFBcUIsVUFBckIsRUFBaUMsTUFBakMsQ0FBTixDQUFBLENBQUE7QUFBQSxRQUNBLEVBQUEsR0FBSyxDQUFFLEtBQUYsRUFBUyxxQkFBVCxFQUFnQyxDQUFoQyxDQURMLENBQUE7QUFBQSxRQUVBLEVBQUEsR0FBSyxDQUFFLEtBQUYsRUFBUyxxQkFBVCxFQUFnQyxDQUFoQyxDQUZMLENBQUE7QUFBQSxRQUlBLEtBQUEsR0FBVSxTQUFTLENBQUMsa0JBQVYsQ0FBNkIsRUFBN0IsRUFBaUMsRUFBakMsRUFBcUMsRUFBckMsQ0FKVixDQUFBO2VBS0EsS0FFRSxDQUFDLElBRkgsQ0FFUSxDQUFBLENBQUUsU0FBRSxHQUFGLEVBQW1CLElBQW5CLEdBQUE7QUFDTixjQUFBLGtCQUFBO0FBQUEsVUFEVSxjQUFLLGNBQ2YsQ0FBQTtBQUFBLFVBQUEsR0FBQSxJQUFPLENBQUEsQ0FBUCxDQUFBO0FBQUEsVUFDQSxNQUFBLEdBQVMsU0FBUyxDQUFDLFNBQVYsQ0FBb0IsRUFBcEIsRUFBd0IsR0FBeEIsRUFBNkIsS0FBN0IsQ0FEVCxDQUFBO0FBQUEsVUFFQSxDQUFDLENBQUMsRUFBRixDQUFLLEdBQUwsRUFBVSxZQUFjLENBQUEsR0FBQSxDQUF4QixDQUZBLENBQUE7aUJBR0EsQ0FBQyxDQUFDLEVBQUYsQ0FBSyxNQUFMLEVBQWEsZUFBaUIsQ0FBQSxHQUFBLENBQTlCLEVBSk07UUFBQSxDQUFGLENBRlIsQ0FPRSxDQUFDLElBUEgsQ0FPUSxDQUFDLENBQUMsT0FBRixDQUFVLFNBQUEsR0FBQTtpQkFBRyxJQUFBLENBQUEsRUFBSDtRQUFBLENBQVYsQ0FQUixFQU5HO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBTCxFQWhCdUI7RUFBQSxDQS9QekIsQ0FBQTs7QUFBQSxFQStSQSxJQUFHLENBQUEsc0JBQUEsQ0FBSCxHQUE4QixTQUFFLENBQUYsRUFBSyxJQUFMLEdBQUE7QUFDNUIsUUFBQSx5QkFBQTtBQUFBLElBQUEsVUFBQSxHQUFjLENBQWQsQ0FBQTtBQUFBLElBQ0EsR0FBQSxHQUFjLENBQUEsQ0FEZCxDQUFBO0FBQUEsSUFHQSxRQUFBLEdBQVcsQ0FDVCxDQUFFLEtBQUYsRUFBUyxxQkFBVCxFQUFnQyxDQUFoQyxDQURTLEVBRVQsQ0FBRSxLQUFGLEVBQVMscUJBQVQsRUFBZ0MsQ0FBaEMsQ0FGUyxFQUdULENBQUUsS0FBRixFQUFTLHFCQUFULEVBQWdDLENBQWhDLENBSFMsQ0FIWCxDQUFBO1dBU0EsSUFBQSxDQUFLLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxVQUFFLE1BQUYsR0FBQTtBQUNILFlBQUEsYUFBQTtBQUFBLFFBQUEsT0FBQSxLQUFPLENBQUEsZUFBRCxDQUFpQixFQUFqQixFQUFxQixVQUFyQixFQUFpQyxNQUFqQyxDQUFOLENBQUEsQ0FBQTtBQUFBLFFBQ0EsRUFBQSxHQUFLLENBQUUsS0FBRixFQUFTLHFCQUFULEVBQWdDLENBQWhDLENBREwsQ0FBQTtBQUFBLFFBRUEsRUFBQSxHQUFLLENBQUUsS0FBRixFQUFTLHFCQUFULEVBQWdDLENBQWhDLENBRkwsQ0FBQTtBQUFBLFFBR0EsS0FBQSxHQUFVLFNBQVMsQ0FBQyxtQkFBVixDQUE4QixFQUE5QixFQUFrQyxFQUFsQyxFQUFzQyxFQUF0QyxDQUhWLENBQUE7ZUFJQSxLQUNFLENBQUMsSUFESCxDQUNRLENBQUEsQ0FBRSxTQUFFLE1BQUYsRUFBVSxJQUFWLEdBQUE7QUFDTixVQUFBLEdBQUEsSUFBTyxDQUFBLENBQVAsQ0FBQTtpQkFDQSxDQUFDLENBQUMsRUFBRixDQUFLLE1BQUwsRUFBYSxRQUFVLENBQUEsR0FBQSxDQUF2QixFQUZNO1FBQUEsQ0FBRixDQURSLENBSUUsQ0FBQyxJQUpILENBSVEsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxTQUFBLEdBQUE7aUJBQUcsSUFBQSxDQUFBLEVBQUg7UUFBQSxDQUFWLENBSlIsRUFMRztNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUwsRUFWNEI7RUFBQSxDQS9SOUIsQ0FBQTs7QUFBQSxFQXFUQSxJQUFHLENBQUEsc0JBQUEsQ0FBSCxHQUE4QixTQUFFLENBQUYsRUFBSyxJQUFMLEdBQUE7QUFDNUIsUUFBQSxnQ0FBQTtBQUFBLElBQUEsVUFBQSxHQUFjLENBQWQsQ0FBQTtBQUFBLElBQ0EsR0FBQSxHQUFjLENBQUEsQ0FEZCxDQUFBO0FBQUEsSUFFQSxLQUFBLEdBQWMsQ0FGZCxDQUFBO0FBQUEsSUFJQSxRQUFBLEdBQVcsQ0FDVCxDQUFFLElBQUYsRUFBUSxnQkFBUixFQUEwQixHQUExQixFQUErQixDQUEvQixDQURTLEVBRVQsQ0FBRSxJQUFGLEVBQVEsZ0JBQVIsRUFBMEIsR0FBMUIsRUFBK0IsQ0FBL0IsQ0FGUyxFQUdULENBQUUsSUFBRixFQUFRLGdCQUFSLEVBQTBCLEdBQTFCLEVBQStCLENBQS9CLENBSFMsRUFJVCxDQUFFLElBQUYsRUFBUSxnQkFBUixFQUEwQixHQUExQixFQUErQixDQUEvQixDQUpTLEVBS1QsQ0FBRSxJQUFGLEVBQVEsZ0JBQVIsRUFBMEIsR0FBMUIsRUFBK0IsQ0FBL0IsQ0FMUyxDQUpYLENBQUE7V0FZQSxJQUFBLENBQUssQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFVBQUUsTUFBRixHQUFBO0FBQ0gsWUFBQSx1QkFBQTtBQUFBLFFBQUEsT0FBQSxLQUFPLENBQUEsZUFBRCxDQUFpQixFQUFqQixFQUFxQixVQUFyQixFQUFpQyxNQUFqQyxDQUFOLENBQUEsQ0FBQTtBQUFBLFFBQ0EsTUFBQSxHQUFZLENBQUUsS0FBRixFQUFTLGdCQUFULENBRFosQ0FBQTtBQUFBLFFBRUEsS0FBQSxHQUFZLFNBQVMsQ0FBQyxtQkFBVixDQUE4QixFQUE5QixFQUFrQyxNQUFsQyxDQUZaLENBQUE7QUFBQSxRQUdBLFFBQUEsR0FBWTtBQUFBLFVBQUUsT0FBQSxFQUFTLEtBQVg7U0FIWixDQUFBO2VBSUEsS0FDRSxDQUFDLElBREgsQ0FDUSxDQUFBLENBQUUsU0FBRSxNQUFGLEVBQVUsSUFBVixHQUFBO0FBQ04sVUFBQSxLQUFBLElBQVUsQ0FBQSxDQUFWLENBQUE7QUFBQSxVQUNBLEdBQUEsSUFBVSxDQUFBLENBRFYsQ0FBQTtpQkFFQSxDQUFDLENBQUMsRUFBRixDQUFLLE1BQUwsRUFBYSxRQUFVLENBQUEsR0FBQSxDQUF2QixFQUhNO1FBQUEsQ0FBRixDQURSLENBS0UsQ0FBQyxJQUxILENBS1EsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxTQUFBLEdBQUE7QUFDZCxVQUFBLENBQUMsQ0FBQyxFQUFGLENBQUssS0FBTCxFQUFZLFFBQVEsQ0FBQyxNQUFyQixDQUFBLENBQUE7aUJBQ0EsSUFBQSxDQUFBLEVBRmM7UUFBQSxDQUFWLENBTFIsRUFMRztNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUwsRUFiNEI7RUFBQSxDQXJUOUIsQ0FBQTs7QUFBQSxFQWlWQSxJQUFHLENBQUEsa0JBQUEsQ0FBSCxHQUEwQixTQUFFLENBQUYsRUFBSyxJQUFMLEdBQUE7QUFDeEIsUUFBQSxnQ0FBQTtBQUFBLElBQUEsVUFBQSxHQUFjLENBQWQsQ0FBQTtBQUFBLElBQ0EsR0FBQSxHQUFjLENBQUEsQ0FEZCxDQUFBO0FBQUEsSUFFQSxLQUFBLEdBQWMsQ0FGZCxDQUFBO0FBQUEsSUFJQSxRQUFBLEdBQVcsQ0FDVCxDQUFFLElBQUYsRUFBUSxRQUFSLEVBQWtCLE1BQWxCLENBRFMsRUFFVCxDQUFFLElBQUYsRUFBUSxxQkFBUixFQUErQixDQUEvQixDQUZTLEVBR1QsQ0FBRSxJQUFGLEVBQVEsZ0JBQVIsRUFBMEIsQ0FBRSxHQUFGLEVBQU8sR0FBUCxFQUFZLEdBQVosRUFBaUIsR0FBakIsRUFBc0IsR0FBdEIsQ0FBMUIsQ0FIUyxFQUlULENBQUUsSUFBRixFQUFRLFVBQVIsRUFBb0IsSUFBcEIsQ0FKUyxFQUtULENBQUUsS0FBRixFQUFTLHFCQUFULEVBQWdDLENBQWhDLENBTFMsRUFNVCxDQUFFLEtBQUYsRUFBUyxxQkFBVCxFQUFnQyxDQUFoQyxDQU5TLEVBT1QsQ0FBRSxLQUFGLEVBQVMscUJBQVQsRUFBZ0MsQ0FBaEMsQ0FQUyxFQVFULENBQUUsS0FBRixFQUFTLHFCQUFULEVBQWdDLENBQWhDLENBUlMsRUFTVCxDQUFFLEtBQUYsRUFBUyxxQkFBVCxFQUFnQyxDQUFoQyxDQVRTLENBSlgsQ0FBQTtXQWdCQSxJQUFBLENBQUssQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFVBQUUsTUFBRixHQUFBO0FBQ0gsWUFBQSxhQUFBO0FBQUEsUUFBQSxPQUFBLEtBQU8sQ0FBQSxlQUFELENBQWlCLEVBQWpCLEVBQXFCLFVBQXJCLEVBQWlDLE1BQWpDLENBQU4sQ0FBQSxDQUFBO0FBQUEsUUFDQSxNQUFBLEdBQVUsQ0FBRSxLQUFGLEVBQVMsSUFBVCxDQURWLENBQUE7QUFBQSxRQUVBLEtBQUEsR0FBVSxTQUFTLENBQUMsbUJBQVYsQ0FBOEIsRUFBOUIsRUFBa0MsTUFBbEMsQ0FGVixDQUFBO2VBR0EsS0FDRSxDQUFDLElBREgsQ0FDUSxDQUFBLENBQUUsU0FBRSxNQUFGLEVBQVUsSUFBVixHQUFBO0FBQ04sVUFBQSxLQUFBLElBQVUsQ0FBQSxDQUFWLENBQUE7QUFBQSxVQUNBLEdBQUEsSUFBVSxDQUFBLENBRFYsQ0FBQTtpQkFFQSxDQUFDLENBQUMsRUFBRixDQUFLLE1BQUwsRUFBYSxRQUFVLENBQUEsR0FBQSxDQUF2QixFQUhNO1FBQUEsQ0FBRixDQURSLENBS0UsQ0FBQyxJQUxILENBS1EsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxTQUFBLEdBQUE7QUFDZCxVQUFBLENBQUMsQ0FBQyxFQUFGLENBQUssS0FBTCxFQUFZLFFBQVEsQ0FBQyxNQUFyQixDQUFBLENBQUE7aUJBQ0EsSUFBQSxDQUFBLEVBRmM7UUFBQSxDQUFWLENBTFIsRUFKRztNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUwsRUFqQndCO0VBQUEsQ0FqVjFCLENBQUE7O0FBQUEsRUFnWEEsSUFBRyxDQUFBLHdCQUFBLENBQUgsR0FBZ0MsU0FBRSxDQUFGLEVBQUssSUFBTCxHQUFBO0FBQzlCLFFBQUEsZ0NBQUE7QUFBQSxJQUFBLFVBQUEsR0FBYyxDQUFkLENBQUE7QUFBQSxJQUNBLEdBQUEsR0FBYyxDQUFBLENBRGQsQ0FBQTtBQUFBLElBRUEsS0FBQSxHQUFjLENBRmQsQ0FBQTtBQUFBLElBSUEsUUFBQSxHQUFXLENBQ1QsQ0FBRSxJQUFGLEVBQVEsQ0FBRSxHQUFGLEVBQU8sd0JBQVAsRUFBaUMsSUFBakMsQ0FBUixDQURTLENBSlgsQ0FBQTtXQVFBLElBQUEsQ0FBSyxDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsVUFBRSxNQUFGLEdBQUE7QUFDSCxZQUFBLHVCQUFBO0FBQUEsUUFBQSxPQUFBLEtBQU8sQ0FBQSxlQUFELENBQWlCLEVBQWpCLEVBQXFCLFVBQXJCLEVBQWlDLE1BQWpDLENBQU4sQ0FBQSxDQUFBO0FBQUEsUUFDQSxNQUFBLEdBQVksQ0FBRSxLQUFGLEVBQVMsSUFBVCxFQUFlLGdCQUFmLENBRFosQ0FBQTtBQUFBLFFBRUEsS0FBQSxHQUFZLFNBQVMsQ0FBQyxtQkFBVixDQUE4QixFQUE5QixFQUFrQyxNQUFsQyxDQUZaLENBQUE7QUFBQSxRQUdBLFFBQUEsR0FBWTtBQUFBLFVBQUUsT0FBQSxFQUFTLEtBQVg7U0FIWixDQUFBO2VBSUEsS0FDRSxDQUFDLElBREgsQ0FDUSxTQUFTLENBQUMsUUFBVixDQUFtQixFQUFuQixFQUF1QixRQUF2QixFQUFpQyxTQUFFLEdBQUYsR0FBQTtBQUNyQyxjQUFBLDZCQUFBO0FBQUEsVUFEeUMsZ0JBQU8sY0FBSyxlQUNyRCxDQUFBO0FBQUEsVUFBQSxTQUFBLEdBQVksU0FBUyxDQUFDLG1CQUFWLENBQThCLEVBQTlCLEVBQWtDLENBQUUsS0FBRixFQUFTLE1BQVEsQ0FBQSxDQUFBLENBQWpCLEVBQXNCLHdCQUF0QixDQUFsQyxDQUFaLENBQUE7QUFDQSxpQkFBTyxDQUFFLEtBQUYsRUFBUyxTQUFULENBQVAsQ0FGcUM7UUFBQSxDQUFqQyxDQURSLENBSUUsQ0FBQyxJQUpILENBSVEsQ0FBQSxDQUFFLFNBQUUsTUFBRixFQUFVLElBQVYsR0FBQTtBQUNOLFVBQUEsS0FBQSxJQUFVLENBQUEsQ0FBVixDQUFBO0FBQUEsVUFDQSxHQUFBLElBQVUsQ0FBQSxDQURWLENBQUE7aUJBRUEsQ0FBQyxDQUFDLEVBQUYsQ0FBSyxNQUFMLEVBQWEsUUFBVSxDQUFBLEdBQUEsQ0FBdkIsRUFITTtRQUFBLENBQUYsQ0FKUixDQVFFLENBQUMsSUFSSCxDQVFRLENBQUMsQ0FBQyxPQUFGLENBQVUsU0FBQSxHQUFBO0FBQ2QsVUFBQSxDQUFDLENBQUMsRUFBRixDQUFLLEtBQUwsRUFBWSxRQUFRLENBQUMsTUFBckIsQ0FBQSxDQUFBO2lCQUNBLElBQUEsQ0FBQSxFQUZjO1FBQUEsQ0FBVixDQVJSLEVBTEc7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFMLEVBVDhCO0VBQUEsQ0FoWGhDLENBQUE7O0FBQUEsRUEyWUEsSUFBRyxDQUFBLHdCQUFBLENBQUgsR0FBZ0MsU0FBRSxDQUFGLEVBQUssSUFBTCxHQUFBO0FBQzlCLFFBQUEsZ0NBQUE7QUFBQSxJQUFBLFVBQUEsR0FBYyxDQUFkLENBQUE7QUFBQSxJQUNBLEdBQUEsR0FBYyxDQUFBLENBRGQsQ0FBQTtBQUFBLElBRUEsS0FBQSxHQUFjLENBRmQsQ0FBQTtBQUFBLElBSUEsUUFBQSxHQUFXLENBQ1QsQ0FBRSxJQUFGLEVBQVEsQ0FBRSxHQUFGLEVBQU8sd0JBQVAsRUFBaUMsSUFBakMsQ0FBUixDQURTLEVBRVQsQ0FBRSxJQUFGLEVBQVEsQ0FBRSxHQUFGLEVBQU8sd0JBQVAsRUFBaUMsUUFBakMsQ0FBUixDQUZTLEVBR1QsQ0FBRSxJQUFGLEVBQVEsQ0FBRSxHQUFGLEVBQU8sd0JBQVAsRUFBaUMsSUFBakMsQ0FBUixDQUhTLEVBSVQsQ0FBRSxJQUFGLEVBQVEsQ0FBRSxHQUFGLEVBQU8sd0JBQVAsRUFBaUMsUUFBakMsQ0FBUixDQUpTLEVBS1QsQ0FBRSxJQUFGLEVBQVEsQ0FBRSxHQUFGLEVBQU8sd0JBQVAsRUFBaUMsSUFBakMsQ0FBUixDQUxTLENBSlgsQ0FBQTtXQVlBLElBQUEsQ0FBSyxDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsVUFBRSxNQUFGLEdBQUE7QUFDSCxZQUFBLHVCQUFBO0FBQUEsUUFBQSxPQUFBLEtBQU8sQ0FBQSxlQUFELENBQWlCLEVBQWpCLEVBQXFCLFVBQXJCLEVBQWlDLE1BQWpDLENBQU4sQ0FBQSxDQUFBO0FBQUEsUUFDQSxNQUFBLEdBQVksQ0FBRSxLQUFGLEVBQVMsZ0JBQVQsQ0FEWixDQUFBO0FBQUEsUUFFQSxLQUFBLEdBQVksU0FBUyxDQUFDLG1CQUFWLENBQThCLEVBQTlCLEVBQWtDLE1BQWxDLENBRlosQ0FBQTtBQUFBLFFBR0EsUUFBQSxHQUFZO0FBQUEsVUFBRSxPQUFBLEVBQVMsS0FBWDtTQUhaLENBQUE7ZUFJQSxLQUNFLENBQUMsSUFESCxDQUNRLFNBQVMsQ0FBQyxRQUFWLENBQW1CLEVBQW5CLEVBQXVCLFFBQXZCLEVBQWlDLFNBQUUsTUFBRixHQUFBO0FBQ3JDLGNBQUEsNEJBQUE7QUFBQSxVQUFFLGlCQUFGLEVBQVMsZUFBVCxFQUFjLGlCQUFkLENBQUE7QUFBQSxVQUNBLE1BQUEsR0FBMEIsQ0FBRSxLQUFGLEVBQVMsS0FBVCxFQUFnQix3QkFBaEIsQ0FEMUIsQ0FBQTtBQUFBLFVBRUEsU0FBQSxHQUEwQixTQUFTLENBQUMsbUJBQVYsQ0FBOEIsRUFBOUIsRUFBa0MsTUFBbEMsQ0FGMUIsQ0FBQTtBQUdBLGlCQUFPLENBQUUsS0FBRixFQUFTLFNBQVQsQ0FBUCxDQUpxQztRQUFBLENBQWpDLENBRFIsQ0FNRSxDQUFDLElBTkgsQ0FNUSxDQUFBLENBQUUsU0FBRSxNQUFGLEVBQVUsSUFBVixHQUFBO0FBQ04sVUFBQSxLQUFBLENBQU0sUUFBTixFQUFnQixJQUFJLENBQUMsU0FBTCxDQUFlLE1BQWYsQ0FBaEIsQ0FBQSxDQUFBO0FBQUEsVUFDQSxLQUFBLElBQVUsQ0FBQSxDQURWLENBQUE7QUFBQSxVQUVBLEdBQUEsSUFBVSxDQUFBLENBRlYsQ0FBQTtpQkFHQSxDQUFDLENBQUMsRUFBRixDQUFLLE1BQUwsRUFBYSxRQUFVLENBQUEsR0FBQSxDQUF2QixFQUpNO1FBQUEsQ0FBRixDQU5SLENBV0UsQ0FBQyxJQVhILENBV1EsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxTQUFBLEdBQUE7QUFDZCxVQUFBLENBQUMsQ0FBQyxFQUFGLENBQUssS0FBTCxFQUFZLFFBQVEsQ0FBQyxNQUFyQixDQUFBLENBQUE7aUJBQ0EsSUFBQSxDQUFBLEVBRmM7UUFBQSxDQUFWLENBWFIsRUFMRztNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUwsRUFiOEI7RUFBQSxDQTNZaEMsQ0FBQTs7QUFBQSxFQTZhQSxJQUFHLENBQUEsd0JBQUEsQ0FBSCxHQUFnQyxTQUFFLENBQUYsRUFBSyxJQUFMLEdBQUE7QUFDOUIsUUFBQSxnQ0FBQTtBQUFBLElBQUEsVUFBQSxHQUFjLENBQWQsQ0FBQTtBQUFBLElBQ0EsR0FBQSxHQUFjLENBQUEsQ0FEZCxDQUFBO0FBQUEsSUFFQSxLQUFBLEdBQWMsQ0FGZCxDQUFBO0FBQUEsSUFJQSxRQUFBLEdBQVcsQ0FDVCxDQUFDLENBQUMsSUFBRCxFQUFNLEdBQU4sRUFBVSxJQUFWLENBQUQsRUFBaUIsQ0FBQyxHQUFELEVBQUssVUFBTCxFQUFnQixLQUFoQixDQUFqQixDQURTLEVBRVQsQ0FBQyxDQUFDLElBQUQsRUFBTSxHQUFOLEVBQVUsUUFBVixDQUFELEVBQXFCLENBQUMsR0FBRCxFQUFLLFVBQUwsRUFBZ0IsS0FBaEIsQ0FBckIsQ0FGUyxFQUdULENBQUMsQ0FBQyxJQUFELEVBQU0sR0FBTixFQUFVLElBQVYsQ0FBRCxFQUFpQixDQUFDLEdBQUQsRUFBSyxVQUFMLEVBQWdCLEtBQWhCLENBQWpCLENBSFMsRUFJVCxDQUFDLENBQUMsSUFBRCxFQUFNLEdBQU4sRUFBVSxRQUFWLENBQUQsRUFBcUIsQ0FBQyxHQUFELEVBQUssVUFBTCxFQUFnQixLQUFoQixDQUFyQixDQUpTLEVBS1QsQ0FBQyxDQUFDLElBQUQsRUFBTSxHQUFOLEVBQVUsSUFBVixDQUFELEVBQWlCLENBQUMsR0FBRCxFQUFLLFVBQUwsRUFBZ0IsS0FBaEIsQ0FBakIsQ0FMUyxDQUpYLENBQUE7V0FZQSxJQUFBLENBQUssQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFVBQUUsTUFBRixHQUFBO0FBQ0gsWUFBQSx1QkFBQTtBQUFBLFFBQUEsT0FBQSxLQUFPLENBQUEsZUFBRCxDQUFpQixFQUFqQixFQUFxQixVQUFyQixFQUFpQyxNQUFqQyxDQUFOLENBQUEsQ0FBQTtBQUFBLFFBQ0EsTUFBQSxHQUFZLENBQUUsS0FBRixFQUFTLGdCQUFULENBRFosQ0FBQTtBQUFBLFFBRUEsS0FBQSxHQUFZLFNBQVMsQ0FBQyxtQkFBVixDQUE4QixFQUE5QixFQUFrQyxNQUFsQyxDQUZaLENBQUE7QUFBQSxRQUdBLFFBQUEsR0FBWTtBQUFBLFVBQUUsT0FBQSxFQUFTLEtBQVg7U0FIWixDQUFBO2VBSUEsS0FDRSxDQUFDLElBREgsQ0FDUSxTQUFTLENBQUMsUUFBVixDQUFtQixFQUFuQixFQUF1QixRQUF2QixFQUFpQyxTQUFFLE1BQUYsR0FBQTtBQUNyQyxjQUFBLDRCQUFBO0FBQUEsVUFBRSxpQkFBRixFQUFTLGVBQVQsRUFBYyxpQkFBZCxDQUFBO0FBQUEsVUFDQSxNQUFBLEdBQTBCLENBQUUsS0FBRixFQUFTLEtBQVQsRUFBZ0Isd0JBQWhCLENBRDFCLENBQUE7QUFBQSxVQUVBLFNBQUEsR0FBMEIsU0FBUyxDQUFDLG1CQUFWLENBQThCLEVBQTlCLEVBQWtDLE1BQWxDLENBRjFCLENBQUE7QUFHQSxpQkFBTyxDQUFFLEtBQUYsRUFBUyxTQUFULENBQVAsQ0FKcUM7UUFBQSxDQUFqQyxDQURSLENBTUUsQ0FBQyxJQU5ILENBTVEsU0FBUyxDQUFDLFFBQVYsQ0FBbUIsRUFBbkIsRUFBdUIsUUFBdkIsRUFBaUMsU0FBRSxPQUFGLEdBQUE7QUFDckMsY0FBQSw2Q0FBQTtBQUFBLFVBQUUsa0JBQUYscUJBQVcsZ0JBQU8sY0FBSyxvQkFBdkIsQ0FBQTtBQUFBLFVBQ0EsTUFBQSxHQUEwQyxDQUFFLEtBQUYsRUFBUyxLQUFULEVBQWdCLFVBQWhCLENBRDFDLENBQUE7QUFBQSxVQUVBLFNBQUEsR0FBMEMsU0FBUyxDQUFDLG1CQUFWLENBQThCLEVBQTlCLEVBQWtDLE1BQWxDLENBRjFDLENBQUE7QUFHQSxpQkFBTyxDQUFFLENBQUUsS0FBRixFQUFTLEtBQVQsRUFBZ0IsVUFBaEIsQ0FBRixFQUFpQyxTQUFqQyxDQUFQLENBSnFDO1FBQUEsQ0FBakMsQ0FOUixDQVdFLENBQUMsSUFYSCxDQVdRLENBQUEsQ0FBRSxTQUFFLE9BQUYsRUFBVyxJQUFYLEdBQUE7QUFDTixVQUFBLEtBQUEsQ0FBTSxRQUFOLEVBQWdCLElBQUksQ0FBQyxTQUFMLENBQWUsT0FBZixDQUFoQixDQUFBLENBQUE7QUFBQSxVQUNBLEtBQUEsSUFBVSxDQUFBLENBRFYsQ0FBQTtBQUFBLFVBRUEsR0FBQSxJQUFVLENBQUEsQ0FGVixDQUFBO2lCQUdBLENBQUMsQ0FBQyxFQUFGLENBQUssT0FBTCxFQUFjLFFBQVUsQ0FBQSxHQUFBLENBQXhCLEVBSk07UUFBQSxDQUFGLENBWFIsQ0FnQkUsQ0FBQyxJQWhCSCxDQWdCUSxDQUFDLENBQUMsT0FBRixDQUFVLFNBQUEsR0FBQTtBQUNkLFVBQUEsQ0FBQyxDQUFDLEVBQUYsQ0FBSyxLQUFMLEVBQVksUUFBUSxDQUFDLE1BQXJCLENBQUEsQ0FBQTtpQkFDQSxJQUFBLENBQUEsRUFGYztRQUFBLENBQVYsQ0FoQlIsRUFMRztNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUwsRUFiOEI7RUFBQSxDQTdhaEMsQ0FBQTs7QUFBQSxFQW9kQSxJQUFHLENBQUEsYUFBQSxDQUFILEdBQXFCLFNBQUUsQ0FBRixFQUFLLElBQUwsR0FBQTtXQUNuQixJQUFBLENBQUssQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFVBQUUsTUFBRixHQUFBO0FBQ0gsWUFBQSxzR0FBQTtBQUFBLFFBQUEsUUFBQSxHQUNFO0FBQUEsVUFBQSxFQUFBLEVBQWMsU0FBZDtBQUFBLFVBQ0EsV0FBQSxFQUFjLFFBRGQ7U0FERixDQUFBO0FBQUEsUUFHQSxPQUFBLEdBQVUsT0FBQSxDQUFRLHNCQUFSLEVBQWdDLFFBQWhDLENBSFYsQ0FBQTtBQUFBLFFBSUEsT0FBQSxhQUFNLENBQWMsT0FBZCxFQUF1QixNQUF2QixDQUFOLENBSkEsQ0FBQTtBQUFBLFFBS0EsTUFBQSxHQUFTLENBQ1AsR0FETyxFQUVQLElBRk8sRUFHUCxLQUhPLEVBSVAsU0FKTyxFQUtQLFVBTE8sRUFNUCxNQU5PLEVBT1AsTUFQTyxFQVFQLE1BUk8sRUFTUCxNQVRPLEVBVVAsT0FWTyxFQVdQLFFBWE8sRUFZUCxTQVpPLENBTFQsQ0FBQTtBQUFBLFFBa0JBLFFBQUEsR0FBVyxDQUNMLElBQUEsTUFBQSxDQUFPLENBQUUsSUFBRixDQUFQLENBREssRUFFTCxJQUFBLE1BQUEsQ0FBTyxDQUFFLElBQUYsRUFBUSxJQUFSLENBQVAsQ0FGSyxFQUdMLElBQUEsTUFBQSxDQUFPLENBQUUsSUFBRixFQUFRLElBQVIsRUFBYyxJQUFkLENBQVAsQ0FISyxFQUlMLElBQUEsTUFBQSxDQUFPLENBQUUsSUFBRixFQUFRLElBQVIsRUFBYyxJQUFkLEVBQW9CLElBQXBCLENBQVAsQ0FKSyxFQUtMLElBQUEsTUFBQSxDQUFPLENBQUUsSUFBRixFQUFRLElBQVIsRUFBYyxJQUFkLEVBQW9CLElBQXBCLEVBQTBCLElBQTFCLENBQVAsQ0FMSyxFQU1MLElBQUEsTUFBQSxDQUFPLENBQUUsSUFBRixFQUFRLElBQVIsRUFBYyxJQUFkLEVBQW9CLElBQXBCLENBQVAsQ0FOSyxFQU9MLElBQUEsTUFBQSxDQUFPLENBQUUsSUFBRixFQUFRLElBQVIsRUFBYyxJQUFkLEVBQW9CLElBQXBCLENBQVAsQ0FQSyxFQVFMLElBQUEsTUFBQSxDQUFPLENBQUUsSUFBRixFQUFRLElBQVIsRUFBYyxJQUFkLEVBQW9CLElBQXBCLENBQVAsQ0FSSyxFQVNMLElBQUEsTUFBQSxDQUFPLENBQUUsSUFBRixFQUFRLElBQVIsRUFBYyxJQUFkLEVBQW9CLElBQXBCLENBQVAsQ0FUSyxFQVVMLElBQUEsTUFBQSxDQUFPLENBQUUsSUFBRixFQUFRLElBQVIsRUFBYyxJQUFkLEVBQW9CLElBQXBCLEVBQTBCLElBQTFCLENBQVAsQ0FWSyxFQVdMLElBQUEsTUFBQSxDQUFPLENBQUUsSUFBRixFQUFRLElBQVIsRUFBYyxJQUFkLEVBQW9CLElBQXBCLEVBQTBCLElBQTFCLEVBQWdDLElBQWhDLENBQVAsQ0FYSyxFQVlMLElBQUEsTUFBQSxDQUFPLENBQUUsSUFBRixFQUFRLElBQVIsRUFBYyxJQUFkLEVBQW9CLElBQXBCLEVBQTBCLElBQTFCLEVBQWdDLElBQWhDLEVBQXNDLElBQXRDLENBQVAsQ0FaSyxDQWxCWCxDQUFBO0FBQUEsUUErQkEsR0FBRyxDQUFDLE9BQUosQ0FBWSxNQUFaLENBL0JBLENBQUE7QUFnQ0EsYUFBQSx3Q0FBQTs0QkFBQTtBQUNFLFVBQUEsU0FBQSxHQUFnQixJQUFBLE1BQUEsQ0FBTyxLQUFQLEVBQWMsT0FBZCxDQUFoQixDQUFBO0FBQUEsVUFDQSxPQUFBLE9BQWEsQ0FBQyxHQUFSLENBQVksU0FBWixFQUF1QixHQUF2QixFQUE0QixNQUE1QixDQUFOLENBREEsQ0FBQTtBQUFBLFVBRUEsVUFBQSxHQUFhLE9BQUEsYUFBTSxDQUFjLE9BQWQsRUFBdUIsTUFBdkIsQ0FBTixDQUZiLENBREY7QUFBQSxTQWhDQTtBQUFBLFFBb0NBLFVBQUEsR0FBYSxPQUFBLGFBQU0sQ0FBYyxPQUFkLEVBQXVCLE1BQXZCLENBQU4sQ0FwQ2IsQ0FBQTtBQXNDQSxhQUFBLHNFQUFBOzRDQUFBO0FBQ0UsVUFBQSxPQUFBLEdBQVUsUUFBVSxDQUFBLFNBQUEsQ0FBcEIsQ0FBQTtBQUNBO0FBQUEsb0ZBREE7QUFBQSxVQUdBLENBQUMsQ0FBQyxFQUFGLENBQUssU0FBUyxDQUFDLE1BQVYsQ0FBaUIsT0FBakIsQ0FBTCxDQUhBLENBREY7QUFBQSxTQXRDQTtlQTJDQSxPQUFPLENBQUMsS0FBUixDQUFjLFNBQUEsR0FBQTtpQkFBRyxJQUFBLENBQUEsRUFBSDtRQUFBLENBQWQsRUE1Q0c7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFMLEVBRG1CO0VBQUEsQ0FwZHJCLENBQUE7O0FBQUEsRUFvZ0JBLElBQUcsQ0FBQSxhQUFBLENBQUgsR0FBcUIsU0FBRSxDQUFGLEVBQUssSUFBTCxHQUFBO0FBQ25CO0FBQUE7O09BQUE7V0FFQSxJQUFBLENBQUssQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFVBQUUsTUFBRixHQUFBO0FBQ0gsWUFBQSxzR0FBQTtBQUFBLFFBQUEsUUFBQSxHQUNFO0FBQUEsVUFBQSxFQUFBLEVBQWMsU0FBZDtBQUFBLFVBQ0EsV0FBQSxFQUFjLFFBRGQ7U0FERixDQUFBO0FBQUEsUUFHQSxPQUFBLEdBQVUsT0FBQSxDQUFRLHNCQUFSLEVBQWdDLFFBQWhDLENBSFYsQ0FBQTtBQUFBLFFBSUEsT0FBQSxhQUFNLENBQWMsT0FBZCxFQUF1QixNQUF2QixDQUFOLENBSkEsQ0FBQTtBQUFBLFFBS0EsTUFBQSxHQUFTLENBQ0gsSUFBQSxNQUFBLENBQU8sQ0FBRSxJQUFGLENBQVAsQ0FERyxFQUVILElBQUEsTUFBQSxDQUFPLENBQUUsSUFBRixDQUFQLENBRkcsRUFHSCxJQUFBLE1BQUEsQ0FBTyxDQUFFLElBQUYsQ0FBUCxDQUhHLEVBSUgsSUFBQSxNQUFBLENBQU8sQ0FBRSxJQUFGLENBQVAsQ0FKRyxFQUtILElBQUEsTUFBQSxDQUFPLENBQUUsSUFBRixDQUFQLENBTEcsRUFNSCxJQUFBLE1BQUEsQ0FBTyxDQUFFLElBQUYsQ0FBUCxDQU5HLEVBT0gsSUFBQSxNQUFBLENBQU8sQ0FBRSxJQUFGLENBQVAsQ0FQRyxFQVFILElBQUEsTUFBQSxDQUFPLENBQUUsSUFBRixDQUFQLENBUkcsRUFTSCxJQUFBLE1BQUEsQ0FBTyxDQUFFLElBQUYsQ0FBUCxDQVRHLENBTFQsQ0FBQTtBQUFBLFFBZ0JBLFFBQUE7O0FBQWE7ZUFBQSx3Q0FBQTs4QkFBQTtBQUFBLHlCQUFBLE1BQUEsQ0FBQTtBQUFBOztZQWhCYixDQUFBO0FBQUEsUUFpQkEsR0FBRyxDQUFDLE9BQUosQ0FBWSxNQUFaLENBakJBLENBQUE7QUFrQkEsYUFBQSx3Q0FBQTs0QkFBQTtBQUNFLFVBQUEsT0FBQSxPQUFhLENBQUMsR0FBUixDQUFZLEtBQVosRUFBbUIsR0FBbkIsRUFBd0IsTUFBeEIsQ0FBTixDQUFBLENBREY7QUFBQSxTQWxCQTtBQUFBLFFBb0JBLFVBQUEsR0FBYSxPQUFBLGFBQU0sQ0FBYyxPQUFkLEVBQXVCLE1BQXZCLENBQU4sQ0FwQmIsQ0FBQTtBQXFCQSxhQUFBLHNFQUFBOzRDQUFBO0FBQ0UsVUFBQSxPQUFBLEdBQVUsUUFBVSxDQUFBLFNBQUEsQ0FBcEIsQ0FBQTtBQUVBO0FBQUEsb0ZBRkE7QUFBQSxVQUdBLENBQUMsQ0FBQyxFQUFGLENBQUssU0FBUyxDQUFDLE1BQVYsQ0FBaUIsT0FBakIsQ0FBTCxDQUhBLENBREY7QUFBQSxTQXJCQTtlQTBCQSxPQUFPLENBQUMsS0FBUixDQUFjLFNBQUEsR0FBQTtpQkFBRyxJQUFBLENBQUEsRUFBSDtRQUFBLENBQWQsRUEzQkc7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFMLEVBSG1CO0VBQUEsQ0FwZ0JyQixDQUFBOztBQUFBLEVBcWlCQSxJQUFHLENBQUEsaURBQUEsQ0FBSCxHQUF5RCxTQUFFLENBQUYsRUFBSyxJQUFMLEdBQUE7QUFDdkQsSUFBQSxDQUFDLENBQUMsTUFBRixDQUFTLDZCQUFULEVBQWdELENBQUUsU0FBQSxHQUFBO2FBQUcsS0FBSyxDQUFDLE1BQU4sQ0FBYSxjQUFiLEVBQUg7SUFBQSxDQUFGLENBQWhELENBQUEsQ0FBQTtBQUFBLElBQ0EsQ0FBQyxDQUFDLE1BQUYsQ0FBUywrQkFBVCxFQUFnRCxDQUFFLFNBQUEsR0FBQTthQUFHLEtBQUssQ0FBQyxNQUFOLENBQWEsRUFBYixFQUFIO0lBQUEsQ0FBRixDQUFoRCxDQURBLENBQUE7QUFBQSxJQUVBLENBQUMsQ0FBQyxNQUFGLENBQVMsZ0NBQVQsRUFBZ0QsQ0FBRSxTQUFBLEdBQUE7YUFBRyxLQUFLLENBQUMsTUFBTixDQUFhLElBQWIsRUFBSDtJQUFBLENBQUYsQ0FBaEQsQ0FGQSxDQUFBO0FBQUEsSUFHQSxDQUFDLENBQUMsTUFBRixDQUFTLGdDQUFULEVBQWdELENBQUUsU0FBQSxHQUFBO2FBQUcsS0FBSyxDQUFDLE1BQU4sQ0FBYSxLQUFiLEVBQUg7SUFBQSxDQUFGLENBQWhELENBSEEsQ0FBQTtBQUFBLElBSUEsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxvQ0FBVCxFQUFnRCxDQUFFLFNBQUEsR0FBQTthQUFHLEtBQUssQ0FBQyxNQUFOLENBQUEsRUFBSDtJQUFBLENBQUYsQ0FBaEQsQ0FKQSxDQUFBO1dBS0EsSUFBQSxDQUFBLEVBTnVEO0VBQUEsQ0FyaUJ6RCxDQUFBOztBQUFBLEVBOGlCQSxJQUFHLENBQUEsOEJBQUEsQ0FBSCxHQUFzQyxTQUFFLENBQUYsRUFBSyxJQUFMLEdBQUE7V0FDcEMsSUFBQSxDQUFLLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxVQUFFLE1BQUYsR0FBQTtBQUNILFlBQUEsc0dBQUE7QUFBQSxRQUFBLFFBQUEsR0FDRTtBQUFBLFVBQUEsRUFBQSxFQUFjLFNBQWQ7QUFBQSxVQUNBLFdBQUEsRUFBYyxRQURkO1NBREYsQ0FBQTtBQUFBLFFBR0EsT0FBQSxHQUFVLE9BQUEsQ0FBUSxzQkFBUixFQUFnQyxRQUFoQyxDQUhWLENBQUE7QUFBQSxRQUlBLE9BQUEsYUFBTSxDQUFjLE9BQWQsRUFBdUIsTUFBdkIsQ0FBTixDQUpBLENBQUE7QUFBQSxRQUtBLE1BQUEsR0FBUyxDQUNQLEdBRE8sRUFFUCxJQUZPLEVBR1AsS0FITyxFQUlQLFNBSk8sRUFLUCxVQUxPLEVBTVAsTUFOTyxFQU9QLFVBUE8sRUFRUCxNQVJPLEVBU1AsTUFUTyxFQVVQLE1BVk8sRUFXUCxPQVhPLEVBWVAsUUFaTyxFQWFQLFNBYk8sQ0FMVCxDQUFBO0FBQUEsUUFvQkEsUUFBQTs7QUFBYTtlQUFBLHdDQUFBOzhCQUFBO0FBQUEseUJBQUEsQ0FBRSxLQUFGLEVBQUEsQ0FBQTtBQUFBOztZQXBCYixDQUFBO0FBQUEsUUFxQkEsR0FBRyxDQUFDLE9BQUosQ0FBWSxNQUFaLENBckJBLENBQUE7QUFzQkEsYUFBQSx3Q0FBQTs0QkFBQTtBQUNFLFVBQUEsT0FBQSxPQUFhLENBQUMsR0FBUixDQUFjLEtBQUssQ0FBQyxNQUFOLENBQWEsQ0FBRSxLQUFGLENBQWIsQ0FBZCxFQUF5QyxHQUF6QyxFQUE4QyxNQUE5QyxDQUFOLENBQUEsQ0FERjtBQUFBLFNBdEJBO0FBQUEsUUF3QkEsVUFBQSxHQUFjLE9BQUEsYUFBTSxDQUFjLE9BQWQsRUFBdUIsTUFBdkIsQ0FBTixDQXhCZCxDQUFBO0FBQUEsUUF5QkEsTUFBQTs7QUFBZ0I7ZUFBQSw4Q0FBQTtzQ0FBQTtBQUFBLHlCQUFBLEtBQUssQ0FBQyxNQUFOLENBQWEsU0FBYixFQUFBLENBQUE7QUFBQTs7WUF6QmhCLENBQUE7QUFBQSxRQTBCQSxzQkFBQSxDQUF1QixNQUF2QixFQUErQixVQUEvQixDQTFCQSxDQUFBO0FBMkJBLGFBQUEsa0VBQUE7b0NBQUE7QUFDRSxVQUFBLE9BQUEsR0FBVSxRQUFVLENBQUEsU0FBQSxDQUFwQixDQUFBO0FBQUEsVUFDQSxDQUFDLENBQUMsRUFBRixDQUFLLEtBQUwsRUFBWSxPQUFaLENBREEsQ0FERjtBQUFBLFNBM0JBO2VBOEJBLE9BQU8sQ0FBQyxLQUFSLENBQWMsU0FBQSxHQUFBO2lCQUFHLElBQUEsQ0FBQSxFQUFIO1FBQUEsQ0FBZCxFQS9CRztNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUwsRUFEb0M7RUFBQSxDQTlpQnRDLENBQUE7O0FBQUEsRUFpbEJBLElBQUcsQ0FBQSw4QkFBQSxDQUFILEdBQXNDLFNBQUUsQ0FBRixFQUFLLElBQUwsR0FBQTtXQUNwQyxJQUFBLENBQUssQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFVBQUUsTUFBRixHQUFBO0FBQ0gsWUFBQSxzR0FBQTtBQUFBLFFBQUEsUUFBQSxHQUNFO0FBQUEsVUFBQSxFQUFBLEVBQWMsU0FBZDtBQUFBLFVBQ0EsV0FBQSxFQUFjLFFBRGQ7U0FERixDQUFBO0FBQUEsUUFHQSxPQUFBLEdBQVUsT0FBQSxDQUFRLHNCQUFSLEVBQWdDLFFBQWhDLENBSFYsQ0FBQTtBQUFBLFFBSUEsT0FBQSxhQUFNLENBQWMsT0FBZCxFQUF1QixNQUF2QixDQUFOLENBSkEsQ0FBQTtBQUFBLFFBS0EsTUFBQSxHQUFTLENBQ1AsRUFETyxFQUVQLEdBRk8sRUFHUCxHQUhPLEVBSVAsS0FKTyxFQUtQLEdBTE8sRUFNUCxJQU5PLEVBT1AsS0FQTyxFQVFQLEdBUk8sRUFTUCxHQVRPLEVBVVAsSUFWTyxFQVdQLFFBWE8sRUFZUCxLQVpPLEVBYVAsSUFiTyxFQWNQLElBZE8sRUFlUCxNQUFNLENBQUMsYUFBUCxDQUFxQixRQUFyQixDQWZPLENBTFQsQ0FBQTtBQUFBLFFBc0JBLFFBQUE7O0FBQWE7ZUFBQSx3Q0FBQTs4QkFBQTtBQUFBLHlCQUFBLENBQUUsS0FBRixFQUFBLENBQUE7QUFBQTs7WUF0QmIsQ0FBQTtBQUFBLFFBdUJBLEdBQUcsQ0FBQyxPQUFKLENBQVksTUFBWixDQXZCQSxDQUFBO0FBd0JBLGFBQUEsd0NBQUE7NEJBQUE7QUFDRSxVQUFBLFNBQUEsR0FBWSxLQUFLLENBQUMsTUFBTixDQUFhLENBQUUsS0FBRixDQUFiLENBQVosQ0FBQTtBQUFBLFVBQ0EsT0FBQSxPQUFhLENBQUMsR0FBUixDQUFZLFNBQVosRUFBdUIsR0FBdkIsRUFBNEIsTUFBNUIsQ0FBTixDQURBLENBREY7QUFBQSxTQXhCQTtBQUFBLFFBMkJBLFVBQUEsR0FBYyxPQUFBLGFBQU0sQ0FBYyxPQUFkLEVBQXVCLE1BQXZCLENBQU4sQ0EzQmQsQ0FBQTtBQUFBLFFBNkJBLE1BQUE7O0FBQWdCO2VBQUEsOENBQUE7c0NBQUE7QUFBQSx5QkFBQSxLQUFLLENBQUMsTUFBTixDQUFhLFNBQWIsRUFBQSxDQUFBO0FBQUE7O1lBN0JoQixDQUFBO0FBQUEsUUE4QkEsc0JBQUEsQ0FBdUIsTUFBdkIsRUFBK0IsVUFBL0IsQ0E5QkEsQ0FBQTtBQStCQSxhQUFBLGtFQUFBO29DQUFBO0FBQ0UsVUFBQSxPQUFBLEdBQVUsUUFBVSxDQUFBLFNBQUEsQ0FBcEIsQ0FBQTtBQUFBLFVBQ0EsQ0FBQyxDQUFDLEVBQUYsQ0FBSyxLQUFMLEVBQVksT0FBWixDQURBLENBREY7QUFBQSxTQS9CQTtlQWtDQSxPQUFPLENBQUMsS0FBUixDQUFjLFNBQUEsR0FBQTtpQkFBRyxJQUFBLENBQUEsRUFBSDtRQUFBLENBQWQsRUFuQ0c7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFMLEVBRG9DO0VBQUEsQ0FqbEJ0QyxDQUFBOztBQUFBLEVBd25CQSxJQUFHLENBQUEsZ0NBQUEsQ0FBSCxHQUF3QyxTQUFFLENBQUYsRUFBSyxJQUFMLEdBQUE7V0FDdEMsSUFBQSxDQUFLLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxVQUFFLE1BQUYsR0FBQTtBQUNILFlBQUEscUpBQUE7QUFBQSxRQUFBLFFBQUEsR0FDRTtBQUFBLFVBQUEsRUFBQSxFQUFjLFNBQWQ7QUFBQSxVQUNBLFdBQUEsRUFBYyxRQURkO1NBREYsQ0FBQTtBQUFBLFFBR0EsT0FBQSxHQUFVLE9BQUEsQ0FBUSxzQkFBUixFQUFnQyxRQUFoQyxDQUhWLENBQUE7QUFBQSxRQUlBLE9BQUEsYUFBTSxDQUFjLE9BQWQsRUFBdUIsTUFBdkIsQ0FBTixDQUpBLENBQUE7QUFBQSxRQUtBLHVCQUFBLEdBQTBCLENBQ3hCLENBQUUsQ0FBQSxRQUFGLEVBQTJCLFdBQTNCLENBRHdCLEVBRXhCLENBQUUsQ0FBQSxNQUFPLENBQUMsU0FBVixFQUEyQixtQkFBM0IsQ0FGd0IsRUFHeEIsQ0FBRSxNQUFNLENBQUMsZ0JBQVQsRUFBMkIseUJBQTNCLENBSHdCLEVBSXhCLENBQUUsQ0FBQSxTQUFGLEVBQTJCLFlBQTNCLENBSndCLEVBS3hCLENBQUUsQ0FBQSxDQUFGLEVBQTJCLElBQTNCLENBTHdCLEVBTXhCLENBQUUsQ0FBQSxDQUFGLEVBQTJCLElBQTNCLENBTndCLEVBT3hCLENBQUUsQ0FBQSxHQUFGLEVBQTJCLE1BQTNCLENBUHdCLEVBUXhCLENBQUUsQ0FBQSxDQUFGLEVBQTJCLElBQTNCLENBUndCLEVBU3hCLENBQUUsQ0FBQSxNQUFPLENBQUMsT0FBVixFQUEyQixpQkFBM0IsQ0FUd0IsRUFVeEIsQ0FBRSxDQUFBLE1BQU8sQ0FBQyxTQUFWLEVBQTJCLG1CQUEzQixDQVZ3QixFQVd4QixDQUFFLENBQUYsRUFBMkIsR0FBM0IsQ0FYd0IsRUFZeEIsQ0FBRSxDQUFBLE1BQU8sQ0FBQyxTQUFWLEVBQTJCLG1CQUEzQixDQVp3QixFQWF4QixDQUFFLENBQUEsTUFBTyxDQUFDLE9BQVYsRUFBMkIsaUJBQTNCLENBYndCLEVBY3hCLENBQUUsQ0FBQSxDQUFGLEVBQTJCLElBQTNCLENBZHdCLEVBZXhCLENBQUUsQ0FBQSxHQUFGLEVBQTJCLE1BQTNCLENBZndCLEVBZ0J4QixDQUFFLENBQUEsQ0FBRixFQUEyQixJQUEzQixDQWhCd0IsRUFpQnhCLENBQUUsQ0FBQSxDQUFGLEVBQTJCLElBQTNCLENBakJ3QixFQWtCeEIsQ0FBRSxDQUFBLFNBQUYsRUFBMkIsWUFBM0IsQ0FsQndCLEVBbUJ4QixDQUFFLE1BQU0sQ0FBQyxnQkFBVCxFQUEyQix5QkFBM0IsQ0FuQndCLEVBb0J4QixDQUFFLE1BQU0sQ0FBQyxTQUFULEVBQTJCLGtCQUEzQixDQXBCd0IsRUFxQnhCLENBQUUsQ0FBQSxRQUFGLEVBQTJCLFdBQTNCLENBckJ3QixDQUwxQixDQUFBO0FBQUEsUUFnQ0EsUUFBQTs7QUFBa0I7ZUFBQSx5REFBQTs2Q0FBQTtBQUFBLHlCQUFBLENBQUUsR0FBSyxDQUFBLENBQUEsQ0FBUCxFQUFBLENBQUE7QUFBQTs7WUFoQ2xCLENBQUE7QUFrQ0EsYUFBQSx5REFBQTsyQ0FBQTtBQUNFLFVBQUEsSUFBQSxDQUFLLEdBQUwsQ0FBQSxDQURGO0FBQUEsU0FsQ0E7QUFBQSxRQW9DQSxHQUFHLENBQUMsT0FBSixDQUFZLHVCQUFaLENBcENBLENBQUE7QUFxQ0EsYUFBQSwyREFBQSxHQUFBO0FBQ0UsNENBREksZ0JBQU8sVUFDWCxDQUFBO0FBQUEsVUFBQSxTQUFBLEdBQVksS0FBSyxDQUFDLE1BQU4sQ0FBYSxDQUFFLEtBQUYsQ0FBYixDQUFaLENBQUE7QUFBQSxVQUNBLE9BQUEsT0FBYSxDQUFDLEdBQVIsQ0FBWSxTQUFaLEVBQXVCLEdBQXZCLEVBQTRCLE1BQTVCLENBQU4sQ0FEQSxDQURGO0FBQUEsU0FyQ0E7QUFBQSxRQXdDQSxVQUFBLEdBQWMsT0FBQSxhQUFNLENBQWMsT0FBZCxFQUF1QixNQUF2QixDQUFOLENBeENkLENBQUE7QUFBQSxRQXlDQSxNQUFBOztBQUFnQjtlQUFBLDhDQUFBO3NDQUFBO0FBQUEseUJBQUEsS0FBSyxDQUFDLE1BQU4sQ0FBYSxTQUFiLEVBQUEsQ0FBQTtBQUFBOztZQXpDaEIsQ0FBQTtBQUFBLFFBMENBLHNCQUFBLENBQXVCLE1BQXZCLEVBQStCLFVBQS9CLENBMUNBLENBQUE7QUEyQ0EsYUFBQSxrRUFBQTtvQ0FBQTtBQUNFLFVBQUEsT0FBQSxHQUFVLFFBQVUsQ0FBQSxTQUFBLENBQXBCLENBQUE7QUFBQSxVQUNBLENBQUMsQ0FBQyxFQUFGLENBQUssS0FBTCxFQUFZLE9BQVosQ0FEQSxDQURGO0FBQUEsU0EzQ0E7ZUE4Q0EsT0FBTyxDQUFDLEtBQVIsQ0FBYyxTQUFBLEdBQUE7aUJBQUcsSUFBQSxDQUFBLEVBQUg7UUFBQSxDQUFkLEVBL0NHO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBTCxFQURzQztFQUFBLENBeG5CeEMsQ0FBQTs7QUFBQSxFQTJxQkEsSUFBRyxDQUFBLGlDQUFBLENBQUgsR0FBeUMsU0FBRSxDQUFGLEVBQUssSUFBTCxHQUFBO1dBQ3ZDLElBQUEsQ0FBSyxDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsVUFBRSxNQUFGLEdBQUE7QUFDSCxZQUFBLHNHQUFBO0FBQUEsUUFBQSxRQUFBLEdBQ0U7QUFBQSxVQUFBLEVBQUEsRUFBYyxTQUFkO0FBQUEsVUFDQSxXQUFBLEVBQWMsUUFEZDtTQURGLENBQUE7QUFBQSxRQUdBLE9BQUEsR0FBVSxPQUFBLENBQVEsc0JBQVIsRUFBZ0MsUUFBaEMsQ0FIVixDQUFBO0FBQUEsUUFJQSxPQUFBLGFBQU0sQ0FBYyxPQUFkLEVBQXVCLE1BQXZCLENBQU4sQ0FKQSxDQUFBO0FBQUEsUUFLQSxNQUFBLEdBQVMsQ0FDUCxJQURPLEVBRVAsS0FGTyxFQUdQLElBSE8sRUFJUCxLQUFLLENBQUMsVUFKQyxFQUtILElBQUEsSUFBQSxDQUFLLENBQUwsQ0FMRyxFQU1ILElBQUEsSUFBQSxDQUFLLElBQUwsQ0FORyxFQU9ILElBQUEsSUFBQSxDQUFBLENBUEcsRUFRUCxLQUFLLENBQUMsU0FSQyxFQVNQLElBVE8sRUFVUCxRQVZPLEVBV1AsRUFYTyxFQVlQLEdBWk8sRUFhUCxHQWJPLEVBY1AsR0FkTyxFQWVQLElBZk8sRUFnQlAsUUFoQk8sRUFpQlAsTUFBTSxDQUFDLGFBQVAsQ0FBcUIsUUFBckIsQ0FqQk8sQ0FMVCxDQUFBO0FBQUEsUUF3QkEsUUFBQTs7QUFBYTtlQUFBLHdDQUFBOzhCQUFBO0FBQUEseUJBQUEsQ0FBRSxLQUFGLEVBQUEsQ0FBQTtBQUFBOztZQXhCYixDQUFBO0FBQUEsUUF5QkEsR0FBRyxDQUFDLE9BQUosQ0FBWSxNQUFaLENBekJBLENBQUE7QUEwQkEsYUFBQSx3Q0FBQTs0QkFBQTtBQUNFLFVBQUEsS0FBQSxDQUFNLFFBQU4sRUFBZ0IsS0FBaEIsQ0FBQSxDQUFBO0FBQUEsVUFDQSxTQUFBLEdBQVksS0FBSyxDQUFDLE1BQU4sQ0FBYSxDQUFFLEtBQUYsQ0FBYixDQURaLENBQUE7QUFBQSxVQUVBLE9BQUEsT0FBYSxDQUFDLEdBQVIsQ0FBWSxTQUFaLEVBQXVCLEdBQXZCLEVBQTRCLE1BQTVCLENBQU4sQ0FGQSxDQURGO0FBQUEsU0ExQkE7QUFBQSxRQThCQSxVQUFBLEdBQWMsT0FBQSxhQUFNLENBQWMsT0FBZCxFQUF1QixNQUF2QixDQUFOLENBOUJkLENBQUE7QUFBQSxRQWdDQSxNQUFBOztBQUFnQjtlQUFBLDhDQUFBO3NDQUFBO0FBQUEseUJBQUEsS0FBSyxDQUFDLE1BQU4sQ0FBYSxTQUFiLEVBQUEsQ0FBQTtBQUFBOztZQWhDaEIsQ0FBQTtBQUFBLFFBaUNBLHNCQUFBLENBQXVCLE1BQXZCLEVBQStCLFVBQS9CLENBakNBLENBQUE7QUFrQ0EsYUFBQSxrRUFBQTtvQ0FBQTtBQUNFLFVBQUEsT0FBQSxHQUFVLFFBQVUsQ0FBQSxTQUFBLENBQXBCLENBQUE7QUFBQSxVQUNBLENBQUMsQ0FBQyxFQUFGLENBQUssS0FBTCxFQUFZLE9BQVosQ0FEQSxDQURGO0FBQUEsU0FsQ0E7ZUFxQ0EsT0FBTyxDQUFDLEtBQVIsQ0FBYyxTQUFBLEdBQUE7aUJBQUcsSUFBQSxDQUFBLEVBQUg7UUFBQSxDQUFkLEVBdENHO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBTCxFQUR1QztFQUFBLENBM3FCekMsQ0FBQTs7QUFBQSxFQXF0QkEsSUFBRyxDQUFBLDBDQUFBLENBQUgsR0FBa0QsU0FBRSxDQUFGLEVBQUssSUFBTCxHQUFBO1dBQ2hELElBQUEsQ0FBSyxDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsVUFBRSxNQUFGLEdBQUE7QUFDSCxZQUFBLHNHQUFBO0FBQUEsUUFBQSxRQUFBLEdBQ0U7QUFBQSxVQUFBLEVBQUEsRUFBYyxTQUFkO0FBQUEsVUFDQSxXQUFBLEVBQWMsUUFEZDtTQURGLENBQUE7QUFBQSxRQUdBLE9BQUEsR0FBVSxPQUFBLENBQVEsc0JBQVIsRUFBZ0MsUUFBaEMsQ0FIVixDQUFBO0FBQUEsUUFJQSxPQUFBLGFBQU0sQ0FBYyxPQUFkLEVBQXVCLE1BQXZCLENBQU4sQ0FKQSxDQUFBO0FBQUEsUUFLQSxNQUFBLEdBQVMsQ0FDUCxDQUFFLEVBQUYsRUFBa0IsRUFBbEIsQ0FETyxFQUVQLENBQUUsTUFBRixFQUFtQixJQUFuQixDQUZPLEVBR1AsQ0FBRSxVQUFGLEVBQW1CLFFBQW5CLENBSE8sRUFJUCxDQUFFLCtCQUFGLEVBQW1DLE1BQU0sQ0FBQyxhQUFQLENBQXFCLFFBQXJCLENBQW5DLENBSk8sRUFLUCxDQUFFLE9BQUYsRUFBbUIsS0FBbkIsQ0FMTyxFQU1QLENBQUUsWUFBRixFQUF1QixJQUFBLElBQUEsQ0FBSyxDQUFMLENBQXZCLENBTk8sRUFPUCxDQUFFLGVBQUYsRUFBdUIsSUFBQSxJQUFBLENBQUssSUFBTCxDQUF2QixDQVBPLEVBUVAsQ0FBRSxZQUFGLEVBQXVCLElBQUEsSUFBQSxDQUFBLENBQXZCLENBUk8sRUFTUCxDQUFFLE1BQUYsRUFBbUIsSUFBbkIsQ0FUTyxFQVVQLENBQUUsTUFBRixFQUFtQixJQUFuQixDQVZPLEVBV1AsQ0FBRSxHQUFGLEVBQWtCLEdBQWxCLENBWE8sRUFZUCxDQUFFLEdBQUYsRUFBa0IsR0FBbEIsQ0FaTyxFQWFQLENBQUUsR0FBRixFQUFrQixHQUFsQixDQWJPLEVBY1AsQ0FBRSxJQUFGLEVBQW1CLElBQW5CLENBZE8sRUFlUCxDQUFFLFFBQUYsRUFBbUIsUUFBbkIsQ0FmTyxDQUxULENBQUE7QUFBQSxRQXNCQSxRQUFBOztBQUFhO2VBQUEsd0NBQUE7OEJBQUE7QUFBQSx5QkFBQSxNQUFBLENBQUE7QUFBQTs7WUF0QmIsQ0FBQTtBQUFBLFFBdUJBLEdBQUcsQ0FBQyxPQUFKLENBQVksTUFBWixDQXZCQSxDQUFBO0FBd0JBLGFBQUEsd0NBQUE7NEJBQUE7QUFDRSxVQUFBLEtBQUEsQ0FBTSxRQUFOLEVBQWdCLEtBQWhCLENBQUEsQ0FBQTtBQUFBLFVBQ0EsU0FBQSxHQUFZLEtBQUssQ0FBQyxNQUFOLENBQWEsS0FBYixDQURaLENBQUE7QUFBQSxVQUVBLE9BQUEsT0FBYSxDQUFDLEdBQVIsQ0FBWSxTQUFaLEVBQXVCLEdBQXZCLEVBQTRCLE1BQTVCLENBQU4sQ0FGQSxDQURGO0FBQUEsU0F4QkE7QUFBQSxRQTRCQSxVQUFBLEdBQWMsT0FBQSxhQUFNLENBQWMsT0FBZCxFQUF1QixNQUF2QixDQUFOLENBNUJkLENBQUE7QUFBQSxRQThCQSxNQUFBOztBQUFnQjtlQUFBLDhDQUFBO3NDQUFBO0FBQUEseUJBQUEsS0FBSyxDQUFDLE1BQU4sQ0FBYSxTQUFiLEVBQUEsQ0FBQTtBQUFBOztZQTlCaEIsQ0FBQTtBQUFBLFFBK0JBLHNCQUFBLENBQXVCLE1BQXZCLEVBQStCLFVBQS9CLENBL0JBLENBQUE7QUFnQ0EsYUFBQSxrRUFBQTtvQ0FBQTtBQUNFLFVBQUEsT0FBQSxHQUFVLFFBQVUsQ0FBQSxTQUFBLENBQXBCLENBQUE7QUFBQSxVQUNBLENBQUMsQ0FBQyxFQUFGLENBQUssS0FBTCxFQUFZLE9BQVosQ0FEQSxDQURGO0FBQUEsU0FoQ0E7ZUFtQ0EsT0FBTyxDQUFDLEtBQVIsQ0FBYyxTQUFBLEdBQUE7aUJBQUcsSUFBQSxDQUFBLEVBQUg7UUFBQSxDQUFkLEVBcENHO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBTCxFQURnRDtFQUFBLENBcnRCbEQsQ0FBQTs7QUFBQSxFQTZ2QkEsSUFBRyxDQUFBLDZCQUFBLENBQUgsR0FBcUMsU0FBRSxDQUFGLEVBQUssSUFBTCxHQUFBO1dBQ25DLElBQUEsQ0FBSyxDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsVUFBRSxNQUFGLEdBQUE7QUFDSCxZQUFBLHNHQUFBO0FBQUEsUUFBQSxRQUFBLEdBQ0U7QUFBQSxVQUFBLEVBQUEsRUFBYyxTQUFkO0FBQUEsVUFDQSxXQUFBLEVBQWMsUUFEZDtTQURGLENBQUE7QUFBQSxRQUdBLE9BQUEsR0FBVSxPQUFBLENBQVEsc0JBQVIsRUFBZ0MsUUFBaEMsQ0FIVixDQUFBO0FBQUEsUUFJQSxPQUFBLGFBQU0sQ0FBYyxPQUFkLEVBQXVCLE1BQXZCLENBQU4sQ0FKQSxDQUFBO0FBQUEsUUFLQSxNQUFBLEdBQVMsQ0FDUCxDQUFFLEtBQUYsRUFBUyxhQUFULEVBQXdCLGNBQXhCLEVBQWlELElBQWpELENBRE8sRUFFUCxDQUFFLEtBQUYsRUFBUyxhQUFULEVBQXdCLFlBQXhCLEVBQWlELElBQWpELENBRk8sRUFHUCxDQUFFLEtBQUYsRUFBUyxhQUFULEVBQXdCLFVBQXhCLEVBQWlELElBQWpELENBSE8sRUFJUCxDQUFFLEtBQUYsRUFBUyxhQUFULEVBQXdCLFNBQXhCLEVBQWlELEdBQWpELENBSk8sRUFLUCxDQUFFLEtBQUYsRUFBUyxhQUFULEVBQXdCLHVCQUF4QixFQUFpRCxJQUFqRCxDQUxPLEVBTVAsQ0FBRSxLQUFGLEVBQVMsYUFBVCxFQUF3QixtQkFBeEIsRUFBaUQsSUFBakQsQ0FOTyxFQU9QLENBQUUsS0FBRixFQUFTLGFBQVQsRUFBd0Isb0JBQXhCLEVBQWlELElBQWpELENBUE8sRUFRUCxDQUFFLEtBQUYsRUFBUyxhQUFULEVBQXdCLFNBQXhCLEVBQWlELEdBQWpELENBUk8sRUFTUCxDQUFFLEtBQUYsRUFBUyxhQUFULEVBQXdCLGFBQXhCLEVBQXFELEdBQXJELENBVE8sRUFVUCxDQUFFLEtBQUYsRUFBUyxpQkFBVCxFQUE0QixjQUE1QixFQUFxRCxJQUFyRCxDQVZPLENBTFQsQ0FBQTtBQUFBLFFBaUJBLFFBQUE7O0FBQWE7ZUFBQSx3Q0FBQTs4QkFBQTtBQUFBLHlCQUFBLE1BQUEsQ0FBQTtBQUFBOztZQWpCYixDQUFBO0FBQUEsUUFrQkEsR0FBRyxDQUFDLE9BQUosQ0FBWSxNQUFaLENBbEJBLENBQUE7QUFtQkEsYUFBQSx3Q0FBQTs0QkFBQTtBQUNFLFVBQUEsU0FBQSxHQUFZLEtBQUssQ0FBQyxNQUFOLENBQWEsS0FBYixDQUFaLENBQUE7QUFBQSxVQUNBLE9BQUEsT0FBYSxDQUFDLEdBQVIsQ0FBWSxTQUFaLEVBQXVCLEdBQXZCLEVBQTRCLE1BQTVCLENBQU4sQ0FEQSxDQURGO0FBQUEsU0FuQkE7QUFBQSxRQXNCQSxVQUFBLEdBQWMsT0FBQSxhQUFNLENBQWMsT0FBZCxFQUF1QixNQUF2QixDQUFOLENBdEJkLENBQUE7QUFBQSxRQXdCQSxNQUFBOztBQUFnQjtlQUFBLDhDQUFBO3NDQUFBO0FBQUEseUJBQUEsS0FBSyxDQUFDLE1BQU4sQ0FBYSxTQUFiLEVBQUEsQ0FBQTtBQUFBOztZQXhCaEIsQ0FBQTtBQUFBLFFBeUJBLHNCQUFBLENBQXVCLE1BQXZCLEVBQStCLFVBQS9CLENBekJBLENBQUE7QUEwQkEsYUFBQSxrRUFBQTtvQ0FBQTtBQUNFLFVBQUEsT0FBQSxHQUFVLFFBQVUsQ0FBQSxTQUFBLENBQXBCLENBQUE7QUFBQSxVQUNBLENBQUMsQ0FBQyxFQUFGLENBQUssS0FBTCxFQUFZLE9BQVosQ0FEQSxDQURGO0FBQUEsU0ExQkE7ZUE2QkEsT0FBTyxDQUFDLEtBQVIsQ0FBYyxTQUFBLEdBQUE7aUJBQUcsSUFBQSxDQUFBLEVBQUg7UUFBQSxDQUFkLEVBOUJHO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBTCxFQURtQztFQUFBLENBN3ZCckMsQ0FBQTs7QUFBQSxFQSt4QkEsSUFBRyxDQUFBLDZCQUFBLENBQUgsR0FBcUMsU0FBRSxDQUFGLEVBQUssSUFBTCxHQUFBO1dBQ25DLElBQUEsQ0FBSyxDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsVUFBRSxNQUFGLEdBQUE7QUFDSCxZQUFBLHNHQUFBO0FBQUEsUUFBQSxRQUFBLEdBQ0U7QUFBQSxVQUFBLEVBQUEsRUFBYyxTQUFkO0FBQUEsVUFDQSxXQUFBLEVBQWMsUUFEZDtTQURGLENBQUE7QUFBQSxRQUdBLE9BQUEsR0FBVSxPQUFBLENBQVEsc0JBQVIsRUFBZ0MsUUFBaEMsQ0FIVixDQUFBO0FBQUEsUUFJQSxPQUFBLGFBQU0sQ0FBYyxPQUFkLEVBQXVCLE1BQXZCLENBQU4sQ0FKQSxDQUFBO0FBQUEsUUFLQSxNQUFBLEdBQVMsQ0FDUCxDQUFFLEdBQUYsRUFBWSxJQUFaLENBRE8sRUFFUCxDQUFFLEdBQUYsRUFBWSxLQUFaLENBRk8sRUFHUCxDQUFFLEdBQUYsRUFBWSxJQUFaLENBSE8sRUFJUCxDQUFFLEdBQUYsRUFBZ0IsSUFBQSxJQUFBLENBQUEsQ0FBaEIsQ0FKTyxFQUtQLENBQUUsR0FBRixFQUFZLENBQUEsUUFBWixDQUxPLEVBTVAsQ0FBRSxHQUFGLEVBQVksQ0FBQSxJQUFaLENBTk8sRUFPUCxDQUFFLEdBQUYsRUFBWSxDQUFBLFFBQVosQ0FQTyxFQVFQLENBQUUsR0FBRixFQUFZLEdBQVosQ0FSTyxFQVNQLENBQUUsR0FBRixFQUFZLE9BQVosQ0FUTyxFQVVQLENBQUUsT0FBRixFQUFZLENBQUEsSUFBWixDQVZPLEVBV1AsQ0FBRSxPQUFGLEVBQVksR0FBWixDQVhPLEVBWVAsQ0FBRSxJQUFGLEVBQVksQ0FBQSxJQUFaLENBWk8sRUFhUCxDQUFFLElBQUYsRUFBWSxHQUFaLENBYk8sRUFjUCxDQUFFLElBQUYsRUFBWSxPQUFaLENBZE8sQ0FMVCxDQUFBO0FBQUEsUUFxQkEsUUFBQTs7QUFBYTtlQUFBLHdDQUFBOzhCQUFBO0FBQUEseUJBQUEsTUFBQSxDQUFBO0FBQUE7O1lBckJiLENBQUE7QUFBQSxRQXNCQSxHQUFHLENBQUMsT0FBSixDQUFZLE1BQVosQ0F0QkEsQ0FBQTtBQXVCQSxhQUFBLHdDQUFBOzRCQUFBO0FBQ0UsVUFBQSxTQUFBLEdBQVksS0FBSyxDQUFDLE1BQU4sQ0FBYSxLQUFiLENBQVosQ0FBQTtBQUFBLFVBQ0EsT0FBQSxPQUFhLENBQUMsR0FBUixDQUFZLFNBQVosRUFBdUIsR0FBdkIsRUFBNEIsTUFBNUIsQ0FBTixDQURBLENBREY7QUFBQSxTQXZCQTtBQUFBLFFBMEJBLFVBQUEsR0FBYyxPQUFBLGFBQU0sQ0FBYyxPQUFkLEVBQXVCLE1BQXZCLENBQU4sQ0ExQmQsQ0FBQTtBQUFBLFFBNEJBLE1BQUE7O0FBQWdCO2VBQUEsOENBQUE7c0NBQUE7QUFBQSx5QkFBQSxLQUFLLENBQUMsTUFBTixDQUFhLFNBQWIsRUFBQSxDQUFBO0FBQUE7O1lBNUJoQixDQUFBO0FBQUEsUUE2QkEsc0JBQUEsQ0FBdUIsTUFBdkIsRUFBK0IsVUFBL0IsQ0E3QkEsQ0FBQTtBQThCQSxhQUFBLGtFQUFBO29DQUFBO0FBQ0UsVUFBQSxPQUFBLEdBQVUsUUFBVSxDQUFBLFNBQUEsQ0FBcEIsQ0FBQTtBQUFBLFVBQ0EsQ0FBQyxDQUFDLEVBQUYsQ0FBSyxLQUFMLEVBQVksT0FBWixDQURBLENBREY7QUFBQSxTQTlCQTtlQWlDQSxPQUFPLENBQUMsS0FBUixDQUFjLFNBQUEsR0FBQTtpQkFBRyxJQUFBLENBQUEsRUFBSDtRQUFBLENBQWQsRUFsQ0c7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFMLEVBRG1DO0VBQUEsQ0EveEJyQyxDQUFBOztBQUFBLEVBdzBCQSxzQkFBQSxHQUF5QixTQUFFLElBQUYsRUFBUSxRQUFSLEdBQUE7QUFDdkIsUUFBQSx5REFBQTtBQUFBLElBQUEsQ0FBQSxHQUFJLFNBQUUsQ0FBRixHQUFBO0FBQVMsVUFBQSxDQUFBO2FBQUE7O0FBQUU7QUFBQTthQUFBLHFDQUFBO3FCQUFBO2NBQWtELENBQUEsS0FBTztBQUF6RCx5QkFBQSxFQUFBO1dBQUE7QUFBQTs7VUFBRixDQUErRCxDQUFDLElBQWhFLENBQXFFLEdBQXJFLEVBQVQ7SUFBQSxDQUFKLENBQUE7QUFBQSxJQUVBLGtCQUFBLEdBQ0U7QUFBQSxNQUFBLFVBQUEsRUFBWSxHQUFaO0tBSEYsQ0FBQTtBQUFBLElBS0EsSUFBQSxHQUFZLEVBTFosQ0FBQTtBQUFBLElBTUEsUUFBQTs7QUFBYztXQUFBLDBDQUFBO3dCQUFBO0FBQUEscUJBQUEsQ0FBQSxDQUFFLENBQUYsRUFBQSxDQUFBO0FBQUE7O1FBTmQsQ0FBQTtBQU9BLFNBQUEsa0RBQUE7c0JBQUE7QUFDRSxNQUFBLE9BQUEsR0FBVSxDQUFFLEdBQUEsQ0FBSSxHQUFKLENBQUYsQ0FBVyxDQUFDLE9BQVosQ0FBb0IsVUFBcEIsRUFBZ0MsR0FBaEMsQ0FBVixDQUFBO0FBQUEsTUFDQSxJQUFJLENBQUMsSUFBTCxDQUFVO0FBQUEsUUFBRSxLQUFBLEVBQU8sT0FBVDtBQUFBLFFBQWtCLEtBQUEsRUFBTyxRQUFVLENBQUEsR0FBQSxDQUFuQztPQUFWLENBREEsQ0FERjtBQUFBLEtBUEE7QUFBQSxJQVVBLElBQUEsQ0FBSyxJQUFBLEdBQU8sR0FBRyxDQUFDLFNBQUosQ0FBYyxJQUFkLEVBQW9CLGtCQUFwQixDQUFaLENBVkEsQ0FBQTtBQVdBLFdBQU8sSUFBUCxDQVp1QjtFQUFBLENBeDBCekIsQ0FBQTs7QUFBQSxFQXUxQkEsZUFBQSxHQUFrQixTQUFBLEdBQUE7QUFDaEIsSUFBQSxlQUFlLENBQUMsR0FBaEIsSUFBdUIsQ0FBQSxDQUF2QixDQUFBO0FBQ0EsV0FBTyx5QkFBQSxHQUEwQixlQUFlLENBQUMsR0FBakQsQ0FGZ0I7RUFBQSxDQXYxQmxCLENBQUE7O0FBQUEsRUEwMUJBLGVBQWUsQ0FBQyxHQUFoQixHQUFzQixDQTExQnRCLENBQUE7O0FBQUEsRUE2MUJBLGFBQUEsR0FBZ0IsU0FBRSxFQUFGLEVBQU0sT0FBTixHQUFBO0FBQ2QsUUFBQSxRQUFBO0FBQUEsSUFBQSxDQUFBLEdBQUksRUFBSixDQUFBO0FBQUEsSUFDQSxLQUFBLEdBQVEsRUFBRSxDQUFDLGVBQUgsQ0FBQSxDQURSLENBQUE7QUFBQSxJQUVBLEtBQUssQ0FBQyxFQUFOLENBQVMsS0FBVCxFQUFnQixTQUFBLEdBQUE7YUFBRyxPQUFBLENBQVEsSUFBUixFQUFjLENBQWQsRUFBSDtJQUFBLENBQWhCLENBRkEsQ0FBQTtXQUdBLEtBQ0UsQ0FBQyxJQURILENBQ1EsQ0FBQSxDQUFFLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFFLElBQUYsRUFBUSxJQUFSLEdBQUE7ZUFBa0IsQ0FBQyxDQUFDLElBQUYsQ0FBTyxJQUFQLEVBQWxCO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBRixDQURSLEVBSmM7RUFBQSxDQTcxQmhCLENBQUE7O0FBQUEsRUFxMkJBLGFBQUEsR0FBZ0IsU0FBRSxPQUFGLEVBQVcsT0FBWCxHQUFBO1dBQ2QsSUFBQSxDQUFLLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxVQUFFLE1BQUYsR0FBQTtBQUNILFlBQUEsS0FBQTtBQUFBLFFBQUEsS0FBQSxHQUFRLE9BQVMsQ0FBQSxVQUFBLENBQWpCLENBQUE7QUFBQSxRQUNBLE9BQUEsT0FBYSxDQUFDLEtBQVIsQ0FBYyxNQUFkLENBQU4sQ0FEQSxDQUFBO0FBQUEsUUFFQSxPQUFBLFNBQWUsQ0FBQyxPQUFWLENBQWtCLEtBQWxCLEVBQXlCLE1BQXpCLENBQU4sQ0FGQSxDQUFBO0FBQUEsUUFHQSxPQUFBLE9BQWEsQ0FBQyxJQUFSLENBQWEsTUFBYixDQUFOLENBSEEsQ0FBQTtlQUtBLE9BQUEsQ0FBUSxJQUFSLEVBTkc7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFMLEVBRGM7RUFBQSxDQXIyQmhCLENBQUE7O0FBQUEsRUErMkJBLElBQUMsQ0FBQSxLQUFELEdBQVMsU0FBRSxPQUFGLEdBQUE7QUFDUCxJQUFBLEVBQUEsR0FBSyxTQUFTLENBQUMsTUFBVixDQUFpQixJQUFBLENBQUssU0FBTCxFQUFnQixJQUFoQixFQUFzQixXQUF0QixDQUFqQixDQUFMLENBQUE7V0FDQSxJQUFBLENBQUssSUFBTCxFQUFRO0FBQUEsTUFBQSxTQUFBLEVBQVcsSUFBWDtLQUFSLEVBRk87RUFBQSxDQS8yQlQsQ0FBQTs7QUFvM0JBLEVBQUEsSUFBTyxxQkFBUDtBQUNFLElBQUEsSUFBQyxDQUFBLEtBQUQsQ0FBQSxDQUFBLENBREY7R0FwM0JBO0FBQUEiLCJmaWxlIjoidGVzdHMuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJcblxuXG4jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbm5qc19wYXRoICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdwYXRoJ1xuIyBuanNfZnMgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnZnMnXG5qb2luICAgICAgICAgICAgICAgICAgICAgID0gbmpzX3BhdGguam9pblxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5DTkQgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnY25kJ1xucnByICAgICAgICAgICAgICAgICAgICAgICA9IENORC5ycHJcbmJhZGdlICAgICAgICAgICAgICAgICAgICAgPSAnSE9MTEVSSVRIL3Rlc3RzJ1xubG9nICAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdwbGFpbicsICAgICBiYWRnZVxuaW5mbyAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdpbmZvJywgICAgICBiYWRnZVxud2hpc3BlciAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICd3aGlzcGVyJywgICBiYWRnZVxuYWxlcnQgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdhbGVydCcsICAgICBiYWRnZVxuZGVidWcgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdkZWJ1ZycsICAgICBiYWRnZVxud2FybiAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICd3YXJuJywgICAgICBiYWRnZVxuaGVscCAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdoZWxwJywgICAgICBiYWRnZVxudXJnZSAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICd1cmdlJywgICAgICBiYWRnZVxuZWNobyAgICAgICAgICAgICAgICAgICAgICA9IENORC5lY2hvLmJpbmQgQ05EXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnN1c3BlbmQgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdjb2ZmZWVub2RlLXN1c3BlbmQnXG5zdGVwICAgICAgICAgICAgICAgICAgICAgID0gc3VzcGVuZC5zdGVwXG5hZnRlciAgICAgICAgICAgICAgICAgICAgID0gc3VzcGVuZC5hZnRlclxuIyBldmVudHVhbGx5ICAgICAgICAgICAgICAgID0gc3VzcGVuZC5ldmVudHVhbGx5XG4jIGltbWVkaWF0ZWx5ICAgICAgICAgICAgICAgPSBzdXNwZW5kLmltbWVkaWF0ZWx5XG4jIHJlcGVhdF9pbW1lZGlhdGVseSAgICAgICAgPSBzdXNwZW5kLnJlcGVhdF9pbW1lZGlhdGVseVxuIyBldmVyeSAgICAgICAgICAgICAgICAgICAgID0gc3VzcGVuZC5ldmVyeVxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG50ZXN0ICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnZ3V5LXRlc3QnXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkQgICAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdwaXBlZHJlYW1zMidcbiQgICAgICAgICAgICAgICAgICAgICAgICAgPSBELnJlbWl0LmJpbmQgRFxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5IT0xMRVJJVEggICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi9tYWluJ1xuZGIgICAgICAgICAgICAgICAgICAgICAgICA9IG51bGxcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuQllURVdJU0UgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2J5dGV3aXNlJ1xubGV2ZWx1cCAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2xldmVsdXAnXG5sZXZlbGRvd24gICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbGV2ZWxkb3duJ1xuQ09ERUMgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vY29kZWMnXG5cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX2VuY29kZV9saXN0ID0gKCBsaXN0ICkgLT5cbiAgKCBsaXN0WyBpZHggXSA9IEJZVEVXSVNFLmVuY29kZSB2YWx1ZSApIGZvciB2YWx1ZSwgaWR4IGluIGxpc3RcbiAgcmV0dXJuIGxpc3RcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX2RlY29kZV9saXN0ID0gKCBsaXN0ICkgLT5cbiAgKCBsaXN0WyBpZHggXSA9IEJZVEVXSVNFLmRlY29kZSB2YWx1ZSApIGZvciB2YWx1ZSwgaWR4IGluIGxpc3RcbiAgcmV0dXJuIGxpc3RcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX3NvcnRfbGlzdCA9ICggbGlzdCApIC0+XG4gIEBfZW5jb2RlX2xpc3QgbGlzdFxuICBsaXN0LnNvcnQgQnVmZmVyLmNvbXBhcmVcbiAgQF9kZWNvZGVfbGlzdCBsaXN0XG4gIHJldHVybiBsaXN0XG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9mZWVkX3Rlc3RfZGF0YSA9ICggZGIsIHByb2Jlc19pZHgsIGhhbmRsZXIgKSAtPlxuICBzd2l0Y2ggcHJvYmVzX2lkeFxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgd2hlbiAwXG4gICAgICBzdGVwICggcmVzdW1lICkgPT5cbiAgICAgICAgeWllbGQgSE9MTEVSSVRILmNsZWFyIGRiLCByZXN1bWVcbiAgICAgICAgaW5wdXQgPSBELmNyZWF0ZV90aHJvdWdoc3RyZWFtKClcbiAgICAgICAgaW5wdXRcbiAgICAgICAgICAucGlwZSBIT0xMRVJJVEguJHdyaXRlIGRiLCAzXG4gICAgICAgICAgIyAucGlwZSBELiRzaG93KClcbiAgICAgICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgICAgIHVyZ2UgXCJ0ZXN0IGRhdGEgd3JpdHRlblwiXG4gICAgICAgICAgICBoYW5kbGVyIG51bGxcbiAgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgICBmb3IgcHJvYmUgaW4gQF9mZWVkX3Rlc3RfZGF0YS5wcm9iZXNbIHByb2Jlc19pZHggXVxuICAgICAgICAgICMga2V5ID0gSE9MTEVSSVRILm5ld19zb19rZXkgZGIsIHByb2JlLi4uXG4gICAgICAgICAgIyBkZWJ1ZyAnwqlXVjBqMicsIHByb2JlXG4gICAgICAgICAgaW5wdXQud3JpdGUgcHJvYmVcbiAgICAgICAgaW5wdXQuZW5kKClcbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIHdoZW4gMVxuICAgICAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgICAgIHlpZWxkIEhPTExFUklUSC5jbGVhciBkYiwgcmVzdW1lXG4gICAgICAgIGlucHV0ID0gRC5jcmVhdGVfdGhyb3VnaHN0cmVhbSgpXG4gICAgICAgIGlucHV0XG4gICAgICAgICAgLnBpcGUgSE9MTEVSSVRILiR3cml0ZSBkYiwgM1xuICAgICAgICAgICMgLnBpcGUgRC4kc2hvdygpXG4gICAgICAgICAgLnBpcGUgRC4kb25fZW5kID0+XG4gICAgICAgICAgICB1cmdlIFwidGVzdCBkYXRhIHdyaXR0ZW5cIlxuICAgICAgICAgICAgaGFuZGxlciBudWxsXG4gICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgICAgZm9yIHVybF9rZXkgaW4gQF9mZWVkX3Rlc3RfZGF0YS5wcm9iZXNbIHByb2Jlc19pZHggXVxuICAgICAgICAgIGtleSA9IEhPTExFUklUSC5rZXlfZnJvbV91cmwgZGIsIHVybF9rZXlcbiAgICAgICAgICBpbnB1dC53cml0ZSBrZXlcbiAgICAgICAgaW5wdXQuZW5kKClcbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGVsc2UgcmV0dXJuIGhhbmRsZXIgbmV3IEVycm9yIFwiaWxsZWdhbCBwcm9iZXMgaW5kZXggI3tycHIgcHJvYmVzX2lkeH1cIlxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHJldHVybiBudWxsXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9mZWVkX3Rlc3RfZGF0YS5wcm9iZXMgPSBbXVxuXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkBfZmVlZF90ZXN0X2RhdGEucHJvYmVzLnB1c2ggW1xuICBbICfwp7efMScsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgICAgICAgICAgICAgIDEsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ/Cnt58yJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAgICAgICAgICAgICAgMiwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn8Ke3nzMnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsICAgICAgICAgICAgICAzLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfwp7efNCcsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgICAgICAgICAgICAgIDQsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ/Cnt58nLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsICAgICAgICAgICAgICA1LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn8Ke3nzYnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsICAgICAgICAgICAgICA2LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfwp7efJywgJ2NwL2NpZCcsICAgICAgICAgICAgICAgICAgICAgICAgICAgMTYzMjk1LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ/Cnt58nLCAnZ3VpZGUvdWNoci9oYXMnLCAgICAgICAgICAgICAgICAgICBbICflhasnLCAn5YiAJywgJ+WugCcsICfuh7onLCAn6LKdJywgXSwgICAgICBdXG4gIFsgJ/Cnt58nLCAncmFuay9janQnLCAgICAgICAgICAgICAgICAgICAgICAgICA1NDMyLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5YWrJywgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCAgICAgICAgICAnMzQnLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+WIgCcsICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgICAgICAgICAgJzUoMTIpMycsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICflroAnLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICAgICAgICAgICc0NCcsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn7oe6JywgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCAgICAgICAgICAnMTInLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+iynScsICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgICAgICAgICAgJzI1KDEyKScsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICflhasnLCAncmFuay9janQnLCAgICAgICAgICAgICAgICAgICAgICAgICAxMjU0MSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5YiAJywgJ3JhbmsvY2p0JywgICAgICAgICAgICAgICAgICAgICAgICAgMTI1NDIsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+WugCcsICdyYW5rL2NqdCcsICAgICAgICAgICAgICAgICAgICAgICAgIDEyNTQzLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfuh7onLCAncmFuay9janQnLCAgICAgICAgICAgICAgICAgICAgICAgICAxMjU0NCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn6LKdJywgJ3JhbmsvY2p0JywgICAgICAgICAgICAgICAgICAgICAgICAgMTI1NDUsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIF1cblxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5AX2ZlZWRfdGVzdF9kYXRhLnByb2Jlcy5wdXNoIFtcbiAgJ3NvfGdseXBoOuWKrHxjcC9mbmNyOnUtY2prLzUyYWN8MCdcbiAgJ3NvfGdseXBoOumCrXxjcC9mbmNyOnUtY2prLzkwYWR8MCdcbiAgJ3NvfGdseXBoOvCgtKZ8Y3AvZm5jcjp1LWNqay14Yi8yMGQyNnwwJ1xuICAnc298Z2x5cGg68KS/r3xjcC9mbmNyOnUtY2prLXhiLzI0ZmVmfDAnXG4gICdzb3xnbHlwaDrwp5G0fGNwL2ZuY3I6dS1jamsteGIvMjc0NzR8MCdcbiAgJ3NvfGdseXBoOvCokqF8Y3AvZm5jcjp1LWNqay14Yi8yODRhMXwwJ1xuICAnc298Z2x5cGg68Kqap3xjcC9mbmNyOnUtY2prLXhiLzJhNmE3fDAnXG4gICdzb3xnbHlwaDrwqpqrfGNwL2ZuY3I6dS1jamsteGIvMmE2YWJ8MCdcbiAgJ3NvfGdseXBoOvCkv698c3Ryb2tlb3JkZXI6MzUyNTEzNTUzMjU0fDAnXG4gICdzb3xnbHlwaDrwoLSmfHN0cm9rZW9yZGVyOjM1MjUxNDExMjF8MCdcbiAgJ3NvfGdseXBoOvCokqF8c3Ryb2tlb3JkZXI6MzUyNTE0NTR8MCdcbiAgJ3NvfGdseXBoOumCrXxzdHJva2VvcmRlcjozNTI1MTUyfDAnXG4gICdzb3xnbHlwaDrwqpqrfHN0cm9rZW9yZGVyOjM1MjUxNTI1MTExNTExNTExMzU0MXwwJ1xuICAnc298Z2x5cGg68Kqap3xzdHJva2VvcmRlcjozNTI1MTUyNTExMjUxMTUxMXwwJ1xuICAnc298Z2x5cGg68KeRtHxzdHJva2VvcmRlcjozNTI1MTUyNTEyMTQyNTEyMTR8MCdcbiAgJ3NvfGdseXBoOuWKrHxzdHJva2VvcmRlcjozNTI1MTUzfDAnXG4gIF1cblxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwid3JpdGUgd2l0aG91dCBlcnJvclwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ID0gLTFcbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgQF9mZWVkX3Rlc3RfZGF0YSBkYiwgcHJvYmVzX2lkeCwgcmVzdW1lXG4gICAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZWFkIHdpdGhvdXQgZXJyb3JcIiBdID0gKCBULCBkb25lICkgLT5cbiAgcHJvYmVzX2lkeCAgPSAwXG4gIGlkeCA9IC0xXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHJlc3VtZVxuICAgIGlucHV0ID0gSE9MTEVSSVRILmNyZWF0ZV9mYWNldHN0cmVhbSBkYlxuICAgIGlucHV0XG4gICAgICAjIC5waXBlIEhPTExFUklUSC4kdXJsX2Zyb21fa2V5IGRiXG4gICAgICAucGlwZSAkICggWyBrZXksIHZhbHVlLCBdLCBzZW5kICkgPT5cbiAgICAgICAgaWR4ICs9ICsxXG4gICAgICAgICMgVC5lcSBrZXksIG1hdGNoZXJzWyBpZHggXVxuICAgICAgLnBpcGUgRC4kb25fZW5kID0+IGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCBrZXlzIHdpdGhvdXQgZXJyb3IgKDEpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEhPTExFUklUSC5jbGVhciBkYiwgcmVzdW1lXG4gICAgZm9yIGlkeCBpbiBbIDAgLi4uIDEwIF1cbiAgICAgIGRiWyAnJXNlbGYnIF0ucHV0ICggSE9MTEVSSVRILl9lbmNvZGUgZGIsIFsgJ3gnLCBpZHgsICd4JywgXSApLCBIT0xMRVJJVEguX3plcm9fZW5jXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwcm9iZV9pZHggPSA0XG4gICAgY291bnQgICAgID0gMFxuICAgIHF1ZXJ5ICAgICA9IEhPTExFUklUSC5fcXVlcnlfZnJvbV9wcmVmaXggZGIsIFsgJ3gnLCBwcm9iZV9pZHgsIF1cbiAgICBpbnB1dCAgICAgPSBkYlsgJyVzZWxmJyBdLmNyZWF0ZVJlYWRTdHJlYW0gcXVlcnlcbiAgICBpbnB1dFxuICAgICAgLnBpcGUgJCAoIHsga2V5LCB2YWx1ZSwgfSwgc2VuZCApID0+XG4gICAgICAgIGNvdW50ICs9IDFcbiAgICAgICAgVC5lcSAoIEhPTExFUklUSC5fZGVjb2RlIGRiLCBrZXkgKVsgMSBdLCBwcm9iZV9pZHhcbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICBULmVxIGNvdW50LCAxXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCBrZXlzIHdpdGhvdXQgZXJyb3IgKDIpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEhPTExFUklUSC5jbGVhciBkYiwgcmVzdW1lXG4gICAgZm9yIGlkeCBpbiBbIDAgLi4uIDEwIF1cbiAgICAgIGRiWyAnJXNlbGYnIF0ucHV0ICggSE9MTEVSSVRILl9lbmNvZGUgZGIsIFsgJ3gnLCBpZHgsICd4JywgXSApLCBIT0xMRVJJVEguX3plcm9fZW5jXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwcm9iZV9pZHggPSA0XG4gICAgY291bnQgICAgID0gMFxuICAgIHByZWZpeCAgICA9IFsgJ3gnLCBwcm9iZV9pZHgsIF1cbiAgICBpbnB1dCAgICAgPSBIT0xMRVJJVEguY3JlYXRlX2ZhY2V0c3RyZWFtIGRiLCBwcmVmaXhcbiAgICBpbnB1dFxuICAgICAgLnBpcGUgJCAoIGZhY2V0LCBzZW5kICkgPT5cbiAgICAgICAgY291bnQgKz0gMVxuICAgICAgICBbIGtleSwgdmFsdWUsIF0gPSBmYWNldFxuICAgICAgICBULmVxIGtleVsgMSBdLCBwcm9iZV9pZHhcbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICBULmVxIGNvdW50LCAxXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCBrZXlzIHdpdGhvdXQgZXJyb3IgKDMpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEhPTExFUklUSC5jbGVhciBkYiwgcmVzdW1lXG4gICAgZm9yIGlkeCBpbiBbIDAgLi4uIDEwIF1cbiAgICAgIGRiWyAnJXNlbGYnIF0ucHV0ICggSE9MTEVSSVRILl9lbmNvZGUgZGIsIFsgJ3gnLCBpZHgsICd4JywgXSApLCBIT0xMRVJJVEguX3plcm9fZW5jXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwcm9iZV9pZHggPSAzXG4gICAgY291bnQgICAgID0gMFxuICAgIGRlbHRhICAgICA9IDJcbiAgICBsbyAgICAgICAgPSBbICd4JywgcHJvYmVfaWR4LCBdXG4gICAgaGkgICAgICAgID0gWyAneCcsIHByb2JlX2lkeCArIGRlbHRhLCBdXG4gICAgcXVlcnkgICAgID0geyBndGU6ICggSE9MTEVSSVRILl9lbmNvZGUgZGIsIGxvICksIGx0ZTogKCBIT0xMRVJJVEguX3F1ZXJ5X2Zyb21fcHJlZml4IGRiLCBoaSApWyAnbHRlJyBdLCB9XG4gICAgaW5wdXQgICAgID0gZGJbICclc2VsZicgXS5jcmVhdGVSZWFkU3RyZWFtIHF1ZXJ5XG4gICAgaW5wdXRcbiAgICAgIC5waXBlICQgKCB7IGtleSwgdmFsdWUsIH0sIHNlbmQgKSA9PlxuICAgICAgICBjb3VudCArPSAxXG4gICAgICAgIFQuZXEgKCBIT0xMRVJJVEguX2RlY29kZSBkYiwga2V5IClbIDEgXSwgcHJvYmVfaWR4ICsgY291bnQgLSAxXG4gICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgVC5lcSBjb3VudCwgZGVsdGEgKyAxXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCBrZXlzIHdpdGhvdXQgZXJyb3IgKDQpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEhPTExFUklUSC5jbGVhciBkYiwgcmVzdW1lXG4gICAgZm9yIGlkeCBpbiBbIDAgLi4uIDEwIF1cbiAgICAgIGRiWyAnJXNlbGYnIF0ucHV0ICggSE9MTEVSSVRILl9lbmNvZGUgZGIsIFsgJ3gnLCBpZHgsICd4JywgXSApLCBIT0xMRVJJVEguX3plcm9fZW5jXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwcm9iZV9pZHggPSAzXG4gICAgY291bnQgICAgID0gMFxuICAgIGRlbHRhICAgICA9IDJcbiAgICBsbyAgICAgICAgPSBbICd4JywgcHJvYmVfaWR4LCBdXG4gICAgaGkgICAgICAgID0gWyAneCcsIHByb2JlX2lkeCArIGRlbHRhLCBdXG4gICAgaW5wdXQgICAgID0gSE9MTEVSSVRILmNyZWF0ZV9mYWNldHN0cmVhbSBkYiwgbG8sIGhpXG4gICAgaW5wdXRcbiAgICAgIC5waXBlICQgKCBbIGtleSwgdmFsdWUsIF0sIHNlbmQgKSA9PlxuICAgICAgICBjb3VudCArPSAxXG4gICAgICAgIFQuZXEga2V5WyAxIF0sIHByb2JlX2lkeCArIGNvdW50IC0gMVxuICAgICAgLnBpcGUgRC4kb25fZW5kID0+XG4gICAgICAgIFQuZXEgY291bnQsIGRlbHRhICsgMVxuICAgICAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcImNyZWF0ZV9mYWNldHN0cmVhbSB0aHJvd3Mgd2l0aCB3cm9uZyBhcmd1bWVudHNcIiBdID0gKCBULCBkb25lICkgLT5cbiAgbWVzc2FnZSA9IFwibXVzdCBnaXZlIGBsb19oaW50YCB3aGVuIGBoaV9oaW50YCBpcyBnaXZlblwiXG4gIFQudGhyb3dzIG1lc3NhZ2UsICggLT4gSE9MTEVSSVRILmNyZWF0ZV9mYWNldHN0cmVhbSBkYiwgbnVsbCwgWyAneHh4JywgXSApXG4gIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCBQT1MgZmFjZXRzXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHByb2Jlc19pZHggID0gMFxuICBpZHggICAgICAgICA9IC0xXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAga2V5X21hdGNoZXJzID0gW1xuICAgIFsgJ3BvcycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgMiwgJ/Cnt58yJyBdXG4gICAgWyAncG9zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAzLCAn8Ke3nzMnIF1cbiAgICBbICdwb3MnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDQsICfwp7efNCcgXVxuICAgIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBwaHJhc2VfbWF0Y2hlcnMgPSBbXG4gICAgWyAn8Ke3nzInLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDIgXVxuICAgIFsgJ/Cnt58zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAzIF1cbiAgICBbICfwp7efNCcsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgNCBdXG4gICAgXVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHJlc3VtZVxuICAgIGxvID0gWyAncG9zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAyLCBdXG4gICAgaGkgPSBbICdwb3MnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDQsIF1cbiAgICAjIGlucHV0ICAgPSBIT0xMRVJJVEguY3JlYXRlX2tleXN0cmVhbSBkYiwgbG9cbiAgICBpbnB1dCAgID0gSE9MTEVSSVRILmNyZWF0ZV9mYWNldHN0cmVhbSBkYiwgbG8sIGhpXG4gICAgaW5wdXRcbiAgICAgICMgLnBpcGUgSE9MTEVSSVRILiR1cmxfZnJvbV9rZXkgZGJcbiAgICAgIC5waXBlICQgKCBbIGtleSwgdmFsdWUsIF0sIHNlbmQgKSA9PlxuICAgICAgICBpZHggKz0gKzFcbiAgICAgICAgcGhyYXNlID0gSE9MTEVSSVRILmFzX3BocmFzZSBkYiwga2V5LCB2YWx1ZVxuICAgICAgICBULmVxIGtleSwga2V5X21hdGNoZXJzWyBpZHggXVxuICAgICAgICBULmVxIHBocmFzZSwgcGhyYXNlX21hdGNoZXJzWyBpZHggXVxuICAgICAgLnBpcGUgRC4kb25fZW5kID0+IGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCBQT1MgcGhyYXNlcyAoMSlcIiBdID0gKCBULCBkb25lICkgLT5cbiAgcHJvYmVzX2lkeCAgPSAwXG4gIGlkeCAgICAgICAgID0gLTFcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBtYXRjaGVycyA9IFtcbiAgICBbICfwp7efMicsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgMiBdXG4gICAgWyAn8Ke3nzMnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDMgXVxuICAgIFsgJ/Cnt580JywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCA0IF1cbiAgICBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgQF9mZWVkX3Rlc3RfZGF0YSBkYiwgcHJvYmVzX2lkeCwgcmVzdW1lXG4gICAgbG8gPSBbICdwb3MnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDIsIF1cbiAgICBoaSA9IFsgJ3BvcycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgNCwgXVxuICAgIGlucHV0ICAgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgbG8sIGhpXG4gICAgaW5wdXRcbiAgICAgIC5waXBlICQgKCBwaHJhc2UsIHNlbmQgKSA9PlxuICAgICAgICBpZHggKz0gKzFcbiAgICAgICAgVC5lcSBwaHJhc2UsIG1hdGNoZXJzWyBpZHggXVxuICAgICAgLnBpcGUgRC4kb25fZW5kID0+IGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCBQT1MgcGhyYXNlcyAoMilcIiBdID0gKCBULCBkb25lICkgLT5cbiAgcHJvYmVzX2lkeCAgPSAwXG4gIGlkeCAgICAgICAgID0gLTFcbiAgY291bnQgICAgICAgPSAwXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgbWF0Y2hlcnMgPSBbXG4gICAgWyAn8Ke3nycsICdndWlkZS91Y2hyL2hhcycsICflhasnLCAwIF1cbiAgICBbICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgJ+WIgCcsIDEgXVxuICAgIFsgJ/Cnt58nLCAnZ3VpZGUvdWNoci9oYXMnLCAn5a6AJywgMiBdXG4gICAgWyAn8Ke3nycsICdndWlkZS91Y2hyL2hhcycsICfosp0nLCA0IF1cbiAgICBbICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgJ+6HuicsIDMgXVxuICAgIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBAX2ZlZWRfdGVzdF9kYXRhIGRiLCBwcm9iZXNfaWR4LCByZXN1bWVcbiAgICBwcmVmaXggICAgPSBbICdwb3MnLCAnZ3VpZGUvdWNoci9oYXMnLCBdXG4gICAgaW5wdXQgICAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIHByZWZpeFxuICAgIHNldHRpbmdzICA9IHsgaW5kZXhlZDogbm8sIH1cbiAgICBpbnB1dFxuICAgICAgLnBpcGUgJCAoIHBocmFzZSwgc2VuZCApID0+XG4gICAgICAgIGNvdW50ICArPSArMVxuICAgICAgICBpZHggICAgKz0gKzFcbiAgICAgICAgVC5lcSBwaHJhc2UsIG1hdGNoZXJzWyBpZHggXVxuICAgICAgLnBpcGUgRC4kb25fZW5kID0+XG4gICAgICAgIFQuZXEgY291bnQsIG1hdGNoZXJzLmxlbmd0aFxuICAgICAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgU1BPIHBocmFzZXNcIiBdID0gKCBULCBkb25lICkgLT5cbiAgcHJvYmVzX2lkeCAgPSAwXG4gIGlkeCAgICAgICAgID0gLTFcbiAgY291bnQgICAgICAgPSAwXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgbWF0Y2hlcnMgPSBbXG4gICAgWyAn8Ke3nycsICdjcC9jaWQnLCAxNjMyOTUgXVxuICAgIFsgJ/Cnt58nLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDUgXVxuICAgIFsgJ/Cnt58nLCAnZ3VpZGUvdWNoci9oYXMnLCBbICflhasnLCAn5YiAJywgJ+WugCcsICfuh7onLCAn6LKdJyBdIF1cbiAgICBbICfwp7efJywgJ3JhbmsvY2p0JywgNTQzMiBdXG4gICAgWyAn8Ke3nzEnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDEgXVxuICAgIFsgJ/Cnt58yJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAyIF1cbiAgICBbICfwp7efMycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgMyBdXG4gICAgWyAn8Ke3nzQnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDQgXVxuICAgIFsgJ/Cnt582JywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCA2IF1cbiAgICBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgQF9mZWVkX3Rlc3RfZGF0YSBkYiwgcHJvYmVzX2lkeCwgcmVzdW1lXG4gICAgcHJlZml4ICA9IFsgJ3NwbycsICfwp7efJywgXVxuICAgIGlucHV0ICAgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgcHJlZml4XG4gICAgaW5wdXRcbiAgICAgIC5waXBlICQgKCBwaHJhc2UsIHNlbmQgKSA9PlxuICAgICAgICBjb3VudCAgKz0gKzFcbiAgICAgICAgaWR4ICAgICs9ICsxXG4gICAgICAgIFQuZXEgcGhyYXNlLCBtYXRjaGVyc1sgaWR4IF1cbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICBULmVxIGNvdW50LCBtYXRjaGVycy5sZW5ndGhcbiAgICAgICAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZWFkIHdpdGggc3ViLXJlYWQgKDEpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHByb2Jlc19pZHggID0gMFxuICBpZHggICAgICAgICA9IC0xXG4gIGNvdW50ICAgICAgID0gMFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIG1hdGNoZXJzID0gW1xuICAgIFsgJ/Cnt58nLCBbICflhasnLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICczNCcgXSBdXG4gICAgXVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHJlc3VtZVxuICAgIHByZWZpeCAgICA9IFsgJ3NwbycsICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgXVxuICAgIGlucHV0ICAgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBwcmVmaXhcbiAgICBzZXR0aW5ncyAgPSB7IGluZGV4ZWQ6IG5vLCB9XG4gICAgaW5wdXRcbiAgICAgIC5waXBlIEhPTExFUklUSC5yZWFkX3N1YiBkYiwgc2V0dGluZ3MsICggWyBnbHlwaCwgcHJkLCBndWlkZXMsIF0gKSA9PlxuICAgICAgICBzdWJfaW5wdXQgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgWyAnc3BvJywgZ3VpZGVzWyAwIF0sICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgXVxuICAgICAgICByZXR1cm4gWyBnbHlwaCwgc3ViX2lucHV0LCBdXG4gICAgICAucGlwZSAkICggcGhyYXNlLCBzZW5kICkgPT5cbiAgICAgICAgY291bnQgICs9ICsxXG4gICAgICAgIGlkeCAgICArPSArMVxuICAgICAgICBULmVxIHBocmFzZSwgbWF0Y2hlcnNbIGlkeCBdXG4gICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgVC5lcSBjb3VudCwgbWF0Y2hlcnMubGVuZ3RoXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCB3aXRoIHN1Yi1yZWFkICgyKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ICAgICAgICAgPSAtMVxuICBjb3VudCAgICAgICA9IDBcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBtYXRjaGVycyA9IFtcbiAgICBbICfwp7efJywgWyAn5YWrJywgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCAnMzQnIF0gXVxuICAgIFsgJ/Cnt58nLCBbICfliIAnLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICc1KDEyKTMnIF0gXVxuICAgIFsgJ/Cnt58nLCBbICflroAnLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICc0NCcgXSBdXG4gICAgWyAn8Ke3nycsIFsgJ+iynScsICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgJzI1KDEyKScgXSBdXG4gICAgWyAn8Ke3nycsIFsgJ+6HuicsICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgJzEyJyBdIF1cbiAgICBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgQF9mZWVkX3Rlc3RfZGF0YSBkYiwgcHJvYmVzX2lkeCwgcmVzdW1lXG4gICAgcHJlZml4ICAgID0gWyAncG9zJywgJ2d1aWRlL3VjaHIvaGFzJywgXVxuICAgIGlucHV0ICAgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBwcmVmaXhcbiAgICBzZXR0aW5ncyAgPSB7IGluZGV4ZWQ6IG5vLCB9XG4gICAgaW5wdXRcbiAgICAgIC5waXBlIEhPTExFUklUSC5yZWFkX3N1YiBkYiwgc2V0dGluZ3MsICggcGhyYXNlICkgPT5cbiAgICAgICAgWyBnbHlwaCwgcHJkLCBndWlkZSwgXSAgPSBwaHJhc2VcbiAgICAgICAgcHJlZml4ICAgICAgICAgICAgICAgICAgPSBbICdzcG8nLCBndWlkZSwgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCBdXG4gICAgICAgIHN1Yl9pbnB1dCAgICAgICAgICAgICAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIHByZWZpeFxuICAgICAgICByZXR1cm4gWyBnbHlwaCwgc3ViX2lucHV0LCBdXG4gICAgICAucGlwZSAkICggcGhyYXNlLCBzZW5kICkgPT5cbiAgICAgICAgZGVidWcgJ8KpcXVQYmcnLCBKU09OLnN0cmluZ2lmeSBwaHJhc2VcbiAgICAgICAgY291bnQgICs9ICsxXG4gICAgICAgIGlkeCAgICArPSArMVxuICAgICAgICBULmVxIHBocmFzZSwgbWF0Y2hlcnNbIGlkeCBdXG4gICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgVC5lcSBjb3VudCwgbWF0Y2hlcnMubGVuZ3RoXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCB3aXRoIHN1Yi1yZWFkICgzKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ICAgICAgICAgPSAtMVxuICBjb3VudCAgICAgICA9IDBcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBtYXRjaGVycyA9IFtcbiAgICBbW1wi8Ke3n1wiLFwi5YWrXCIsXCIzNFwiXSxbXCLlhatcIixcInJhbmsvY2p0XCIsMTI1NDFdXVxuICAgIFtbXCLwp7efXCIsXCLliIBcIixcIjUoMTIpM1wiXSxbXCLliIBcIixcInJhbmsvY2p0XCIsMTI1NDJdXVxuICAgIFtbXCLwp7efXCIsXCLlroBcIixcIjQ0XCJdLFtcIuWugFwiLFwicmFuay9janRcIiwxMjU0M11dXG4gICAgW1tcIvCnt59cIixcIuiynVwiLFwiMjUoMTIpXCJdLFtcIuiynVwiLFwicmFuay9janRcIiwxMjU0NV1dXG4gICAgW1tcIvCnt59cIixcIu6HulwiLFwiMTJcIl0sW1wi7oe6XCIsXCJyYW5rL2NqdFwiLDEyNTQ0XV1cbiAgICBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgQF9mZWVkX3Rlc3RfZGF0YSBkYiwgcHJvYmVzX2lkeCwgcmVzdW1lXG4gICAgcHJlZml4ICAgID0gWyAncG9zJywgJ2d1aWRlL3VjaHIvaGFzJywgXVxuICAgIGlucHV0ICAgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBwcmVmaXhcbiAgICBzZXR0aW5ncyAgPSB7IGluZGV4ZWQ6IG5vLCB9XG4gICAgaW5wdXRcbiAgICAgIC5waXBlIEhPTExFUklUSC5yZWFkX3N1YiBkYiwgc2V0dGluZ3MsICggcGhyYXNlICkgPT5cbiAgICAgICAgWyBnbHlwaCwgcHJkLCBndWlkZSwgXSAgPSBwaHJhc2VcbiAgICAgICAgcHJlZml4ICAgICAgICAgICAgICAgICAgPSBbICdzcG8nLCBndWlkZSwgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCBdXG4gICAgICAgIHN1Yl9pbnB1dCAgICAgICAgICAgICAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIHByZWZpeFxuICAgICAgICByZXR1cm4gWyBnbHlwaCwgc3ViX2lucHV0LCBdXG4gICAgICAucGlwZSBIT0xMRVJJVEgucmVhZF9zdWIgZGIsIHNldHRpbmdzLCAoIHhwaHJhc2UgKSA9PlxuICAgICAgICBbIGdseXBoLCBbIGd1aWRlLCBwcmQsIHNoYXBlY2xhc3MsIF0gXSAgPSB4cGhyYXNlXG4gICAgICAgIHByZWZpeCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFsgJ3NwbycsIGd1aWRlLCAncmFuay9janQnLCBdXG4gICAgICAgIHN1Yl9pbnB1dCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBwcmVmaXhcbiAgICAgICAgcmV0dXJuIFsgWyBnbHlwaCwgZ3VpZGUsIHNoYXBlY2xhc3MsIF0sIHN1Yl9pbnB1dCwgXVxuICAgICAgLnBpcGUgJCAoIHhwaHJhc2UsIHNlbmQgKSA9PlxuICAgICAgICBkZWJ1ZyAnwqlxdVBiZycsIEpTT04uc3RyaW5naWZ5IHhwaHJhc2VcbiAgICAgICAgY291bnQgICs9ICsxXG4gICAgICAgIGlkeCAgICArPSArMVxuICAgICAgICBULmVxIHhwaHJhc2UsIG1hdGNoZXJzWyBpZHggXVxuICAgICAgLnBpcGUgRC4kb25fZW5kID0+XG4gICAgICAgIFQuZXEgY291bnQsIG1hdGNoZXJzLmxlbmd0aFxuICAgICAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInNvcnRpbmcgKDEpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHNldHRpbmdzID1cbiAgICAgIGRiOiAgICAgICAgICAgbGV2ZWxkb3duXG4gICAgICBrZXlFbmNvZGluZzogICdiaW5hcnknXG4gICAgbGV2ZWxkYiA9IGxldmVsdXAgJy90bXAvaG9sbGVyaXRoMi10ZXN0Jywgc2V0dGluZ3NcbiAgICB5aWVsZCBjbGVhcl9sZXZlbGRiIGxldmVsZGIsIHJlc3VtZVxuICAgIHByb2JlcyA9IFtcbiAgICAgICdhJ1xuICAgICAgJ2FiJ1xuICAgICAgJ2FiYydcbiAgICAgICdhYmNcXHgwMCdcbiAgICAgICdhYmNcXHgwMGEnXG4gICAgICAnYWJjYSdcbiAgICAgICdhYmNiJ1xuICAgICAgJ2FiY2MnXG4gICAgICAnYWJjZCdcbiAgICAgICdhYmNkZSdcbiAgICAgICdhYmNkZWYnXG4gICAgICAnYWJjZGVmZycgXVxuICAgIG1hdGNoZXJzID0gW1xuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCAweDYyLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgMHg2MiwgMHg2MywgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIDB4NjIsIDB4NjMsIDB4MDAsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCAweDYyLCAweDYzLCAweDAwLCAweDYxLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgMHg2MiwgMHg2MywgMHg2MSwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIDB4NjIsIDB4NjMsIDB4NjIsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCAweDYyLCAweDYzLCAweDYzLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgMHg2MiwgMHg2MywgMHg2NCwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIDB4NjIsIDB4NjMsIDB4NjQsIDB4NjUsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCAweDYyLCAweDYzLCAweDY0LCAweDY1LCAweDY2LCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgMHg2MiwgMHg2MywgMHg2NCwgMHg2NSwgMHg2NiwgMHg2NywgXSBdXG4gICAgQ05ELnNodWZmbGUgcHJvYmVzXG4gICAgZm9yIHByb2JlIGluIHByb2Jlc1xuICAgICAgcHJvYmVfYmZyID0gbmV3IEJ1ZmZlciBwcm9iZSwgJ3V0Zi04J1xuICAgICAgeWllbGQgbGV2ZWxkYi5wdXQgcHJvYmVfYmZyLCAnMScsIHJlc3VtZVxuICAgICAgcHJvYmVfYmZycyA9IHlpZWxkIHJlYWRfYWxsX2tleXMgbGV2ZWxkYiwgcmVzdW1lXG4gICAgcHJvYmVfYmZycyA9IHlpZWxkIHJlYWRfYWxsX2tleXMgbGV2ZWxkYiwgcmVzdW1lXG4gICAgIyBkZWJ1ZyAnwqlSWFB2dicsICdcXG4nICsgcnByIHByb2JlX2JmcnNcbiAgICBmb3IgcHJvYmVfYmZyLCBwcm9iZV9pZHggaW4gcHJvYmVfYmZyc1xuICAgICAgbWF0Y2hlciA9IG1hdGNoZXJzWyBwcm9iZV9pZHggXVxuICAgICAgIyMjIFRBSU5UIGxvb2tzIGxpa2UgYFQuZXEgYnVmZmVyMSwgYnVmZmVyMmAgZG9lc24ndCB3b3JrLS0tc29tZXRpbWVzLi4uICMjI1xuICAgICAgIyBULmVxIHByb2JlX2JmciwgbWF0Y2hlclxuICAgICAgVC5vayBwcm9iZV9iZnIuZXF1YWxzIG1hdGNoZXJcbiAgICBsZXZlbGRiLmNsb3NlIC0+IGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwic29ydGluZyAoMilcIiBdID0gKCBULCBkb25lICkgLT5cbiAgIyMjIFRoaXMgdGVzdCBpcyBoZXJlIGJlY2F1c2UgdGhlcmUgc2VlbWVkIHRvIG9jY3VyIHNvbWUgc3RyYW5nZSBvcmRlcmluZyBpc3N1ZXMgd2hlblxuICB1c2luZyBtZW1kb3duIGluc3RlYWQgb2YgbGV2ZWxkb3duICMjI1xuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICBzZXR0aW5ncyA9XG4gICAgICBkYjogICAgICAgICAgIGxldmVsZG93blxuICAgICAga2V5RW5jb2Rpbmc6ICAnYmluYXJ5J1xuICAgIGxldmVsZGIgPSBsZXZlbHVwICcvdG1wL2hvbGxlcml0aDItdGVzdCcsIHNldHRpbmdzXG4gICAgeWllbGQgY2xlYXJfbGV2ZWxkYiBsZXZlbGRiLCByZXN1bWVcbiAgICBwcm9iZXMgPSBbXG4gICAgICBuZXcgQnVmZmVyIFsgMHgwMCwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4MDEsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDAyLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHgwMywgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4ZjksIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweGZhLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHhmYiwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4ZmMsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweGZkLCBdXG4gICAgICBdXG4gICAgbWF0Y2hlcnMgPSAoIHByb2JlIGZvciBwcm9iZSBpbiBwcm9iZXMgKVxuICAgIENORC5zaHVmZmxlIHByb2Jlc1xuICAgIGZvciBwcm9iZSBpbiBwcm9iZXNcbiAgICAgIHlpZWxkIGxldmVsZGIucHV0IHByb2JlLCAnMScsIHJlc3VtZVxuICAgIHByb2JlX2JmcnMgPSB5aWVsZCByZWFkX2FsbF9rZXlzIGxldmVsZGIsIHJlc3VtZVxuICAgIGZvciBwcm9iZV9iZnIsIHByb2JlX2lkeCBpbiBwcm9iZV9iZnJzXG4gICAgICBtYXRjaGVyID0gbWF0Y2hlcnNbIHByb2JlX2lkeCBdXG4gICAgICAjIGRlYnVnICfCqTE1MDYwJywgcHJvYmVfaWR4LCBwcm9iZV9iZnIsIG1hdGNoZXJcbiAgICAgICMjIyBUQUlOVCBsb29rcyBsaWtlIGBULmVxIGJ1ZmZlcjEsIGJ1ZmZlcjJgIGRvZXNuJ3Qgd29yay0tLXNvbWV0aW1lcy4uLiAjIyNcbiAgICAgIFQub2sgcHJvYmVfYmZyLmVxdWFscyBtYXRjaGVyXG4gICAgbGV2ZWxkYi5jbG9zZSAtPiBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcIkgyIGNvZGVjIGBlbmNvZGVgIHRocm93cyBvbiBhbnl0aGluZyBidXQgYSBsaXN0XCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIFQudGhyb3dzIFwiZXhwZWN0ZWQgYSBsaXN0LCBnb3QgYSB0ZXh0XCIsICAgICAgICAgKCAtPiBDT0RFQy5lbmNvZGUgJ3VuYWNjYXB0YWJsZScgKVxuICBULnRocm93cyBcImV4cGVjdGVkIGEgbGlzdCwgZ290IGEgbnVtYmVyXCIsICAgICAgICggLT4gQ09ERUMuZW5jb2RlIDQyIClcbiAgVC50aHJvd3MgXCJleHBlY3RlZCBhIGxpc3QsIGdvdCBhIGJvb2xlYW5cIiwgICAgICAoIC0+IENPREVDLmVuY29kZSB0cnVlIClcbiAgVC50aHJvd3MgXCJleHBlY3RlZCBhIGxpc3QsIGdvdCBhIGJvb2xlYW5cIiwgICAgICAoIC0+IENPREVDLmVuY29kZSBmYWxzZSApXG4gIFQudGhyb3dzIFwiZXhwZWN0ZWQgYSBsaXN0LCBnb3QgYSBqc3VuZGVmaW5lZFwiLCAgKCAtPiBDT0RFQy5lbmNvZGUoKSApXG4gIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwic29ydCB0ZXh0cyB3aXRoIEgyIGNvZGVjICgxKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICBzZXR0aW5ncyA9XG4gICAgICBkYjogICAgICAgICAgIGxldmVsZG93blxuICAgICAga2V5RW5jb2Rpbmc6ICAnYmluYXJ5J1xuICAgIGxldmVsZGIgPSBsZXZlbHVwICcvdG1wL2hvbGxlcml0aDItdGVzdCcsIHNldHRpbmdzXG4gICAgeWllbGQgY2xlYXJfbGV2ZWxkYiBsZXZlbGRiLCByZXN1bWVcbiAgICBwcm9iZXMgPSBbXG4gICAgICAnYSdcbiAgICAgICdhYidcbiAgICAgICdhYmMnXG4gICAgICAnYWJjXFx4MDAnXG4gICAgICAnYWJjXFx4MDBhJ1xuICAgICAgJ2FiY2EnXG4gICAgICAnYWJjYVxceDAwJ1xuICAgICAgJ2FiY2InXG4gICAgICAnYWJjYydcbiAgICAgICdhYmNkJ1xuICAgICAgJ2FiY2RlJ1xuICAgICAgJ2FiY2RlZidcbiAgICAgICdhYmNkZWZnJ1xuICAgICAgXVxuICAgIG1hdGNoZXJzID0gKCBbIHByb2JlLCBdIGZvciBwcm9iZSBpbiBwcm9iZXMgKVxuICAgIENORC5zaHVmZmxlIHByb2Jlc1xuICAgIGZvciBwcm9iZSBpbiBwcm9iZXNcbiAgICAgIHlpZWxkIGxldmVsZGIucHV0ICggQ09ERUMuZW5jb2RlIFsgcHJvYmUsIF0gKSwgJzEnLCByZXN1bWVcbiAgICBwcm9iZV9iZnJzICA9IHlpZWxkIHJlYWRfYWxsX2tleXMgbGV2ZWxkYiwgcmVzdW1lXG4gICAgcHJvYmVzICAgICAgPSAoIENPREVDLmRlY29kZSBwcm9iZV9iZnIgZm9yIHByb2JlX2JmciBpbiBwcm9iZV9iZnJzIClcbiAgICBzaG93X2tleXNfYW5kX2tleV9iZnJzIHByb2JlcywgcHJvYmVfYmZyc1xuICAgIGZvciBwcm9iZSwgcHJvYmVfaWR4IGluIHByb2Jlc1xuICAgICAgbWF0Y2hlciA9IG1hdGNoZXJzWyBwcm9iZV9pZHggXVxuICAgICAgVC5lcSBwcm9iZSwgbWF0Y2hlclxuICAgIGxldmVsZGIuY2xvc2UgLT4gZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJzb3J0IHRleHRzIHdpdGggSDIgY29kZWMgKDIpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHNldHRpbmdzID1cbiAgICAgIGRiOiAgICAgICAgICAgbGV2ZWxkb3duXG4gICAgICBrZXlFbmNvZGluZzogICdiaW5hcnknXG4gICAgbGV2ZWxkYiA9IGxldmVsdXAgJy90bXAvaG9sbGVyaXRoMi10ZXN0Jywgc2V0dGluZ3NcbiAgICB5aWVsZCBjbGVhcl9sZXZlbGRiIGxldmVsZGIsIHJlc3VtZVxuICAgIHByb2JlcyA9IFtcbiAgICAgICcnXG4gICAgICAnICdcbiAgICAgICdhJ1xuICAgICAgJ2FiYydcbiAgICAgICfkuIAnXG4gICAgICAn5LiA5LqMJ1xuICAgICAgJ+S4gOS6jOS4iSdcbiAgICAgICfkuIknXG4gICAgICAn5LqMJ1xuICAgICAgJ/CggIAnXG4gICAgICAn8KCAgFxceDAwJ1xuICAgICAgJ/CggIBhJ1xuICAgICAgJ/CqnIAnXG4gICAgICAn8KudgCdcbiAgICAgIFN0cmluZy5mcm9tQ29kZVBvaW50IDB4MTBmZmZmXG4gICAgICBdXG4gICAgbWF0Y2hlcnMgPSAoIFsgcHJvYmUsIF0gZm9yIHByb2JlIGluIHByb2JlcyApXG4gICAgQ05ELnNodWZmbGUgcHJvYmVzXG4gICAgZm9yIHByb2JlIGluIHByb2Jlc1xuICAgICAgcHJvYmVfYmZyID0gQ09ERUMuZW5jb2RlIFsgcHJvYmUsIF1cbiAgICAgIHlpZWxkIGxldmVsZGIucHV0IHByb2JlX2JmciwgJzEnLCByZXN1bWVcbiAgICBwcm9iZV9iZnJzICA9IHlpZWxkIHJlYWRfYWxsX2tleXMgbGV2ZWxkYiwgcmVzdW1lXG4gICAgIyBkZWJ1ZyAnwqlGZDVpdycsIHByb2JlX2JmcnNcbiAgICBwcm9iZXMgICAgICA9ICggQ09ERUMuZGVjb2RlIHByb2JlX2JmciBmb3IgcHJvYmVfYmZyIGluIHByb2JlX2JmcnMgKVxuICAgIHNob3dfa2V5c19hbmRfa2V5X2JmcnMgcHJvYmVzLCBwcm9iZV9iZnJzXG4gICAgZm9yIHByb2JlLCBwcm9iZV9pZHggaW4gcHJvYmVzXG4gICAgICBtYXRjaGVyID0gbWF0Y2hlcnNbIHByb2JlX2lkeCBdXG4gICAgICBULmVxIHByb2JlLCBtYXRjaGVyXG4gICAgbGV2ZWxkYi5jbG9zZSAtPiBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInNvcnQgbnVtYmVycyB3aXRoIEgyIGNvZGVjICgxKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICBzZXR0aW5ncyA9XG4gICAgICBkYjogICAgICAgICAgIGxldmVsZG93blxuICAgICAga2V5RW5jb2Rpbmc6ICAnYmluYXJ5J1xuICAgIGxldmVsZGIgPSBsZXZlbHVwICcvdG1wL2hvbGxlcml0aDItdGVzdCcsIHNldHRpbmdzXG4gICAgeWllbGQgY2xlYXJfbGV2ZWxkYiBsZXZlbGRiLCByZXN1bWVcbiAgICBwcm9iZXNfYW5kX2Rlc2NyaXB0aW9ucyA9IFtcbiAgICAgIFsgLUluZmluaXR5LCAgICAgICAgICAgICAgIFwiLUluZmluaXR5XCIgICAgICAgICAgICAgICBdXG4gICAgICBbIC1OdW1iZXIuTUFYX1ZBTFVFLCAgICAgICBcIi1OdW1iZXIuTUFYX1ZBTFVFXCIgICAgICAgXVxuICAgICAgWyBOdW1iZXIuTUlOX1NBRkVfSU5URUdFUiwgXCJOdW1iZXIuTUlOX1NBRkVfSU5URUdFUlwiIF1cbiAgICAgIFsgLTEyMzQ1Njc4OSwgICAgICAgICAgICAgIFwiLTEyMzQ1Njc4OVwiICAgICAgICAgICAgICBdXG4gICAgICBbIC0zLCAgICAgICAgICAgICAgICAgICAgICBcIi0zXCIgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgWyAtMiwgICAgICAgICAgICAgICAgICAgICAgXCItMlwiICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgIFsgLTEuNSwgICAgICAgICAgICAgICAgICAgIFwiLTEuNVwiICAgICAgICAgICAgICAgICAgICBdXG4gICAgICBbIC0xLCAgICAgICAgICAgICAgICAgICAgICBcIi0xXCIgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgWyAtTnVtYmVyLkVQU0lMT04sICAgICAgICAgXCItTnVtYmVyLkVQU0lMT05cIiAgICAgICAgIF1cbiAgICAgIFsgLU51bWJlci5NSU5fVkFMVUUsICAgICAgIFwiLU51bWJlci5NSU5fVkFMVUVcIiAgICAgICBdXG4gICAgICBbIDAsICAgICAgICAgICAgICAgICAgICAgICBcIjBcIiAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgWyArTnVtYmVyLk1JTl9WQUxVRSwgICAgICAgXCIrTnVtYmVyLk1JTl9WQUxVRVwiICAgICAgIF1cbiAgICAgIFsgK051bWJlci5FUFNJTE9OLCAgICAgICAgIFwiK051bWJlci5FUFNJTE9OXCIgICAgICAgICBdXG4gICAgICBbICsxLCAgICAgICAgICAgICAgICAgICAgICBcIisxXCIgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgWyArMS41LCAgICAgICAgICAgICAgICAgICAgXCIrMS41XCIgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgIFsgKzIsICAgICAgICAgICAgICAgICAgICAgIFwiKzJcIiAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICBbICszLCAgICAgICAgICAgICAgICAgICAgICBcIiszXCIgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgWyArMTIzNDU2Nzg5LCAgICAgICAgICAgICAgXCIrMTIzNDU2Nzg5XCIgICAgICAgICAgICAgIF1cbiAgICAgIFsgTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIsIFwiTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVJcIiBdXG4gICAgICBbIE51bWJlci5NQVhfVkFMVUUsICAgICAgICBcIk51bWJlci5NQVhfVkFMVUVcIiAgICAgICAgXVxuICAgICAgWyArSW5maW5pdHksICAgICAgICAgICAgICAgXCIrSW5maW5pdHlcIiAgICAgICAgICAgICAgIF1cbiAgICAgIF1cbiAgICAjIHByb2Jlc19hbmRfZGVzY3JpcHRpb25zLnNvcnQgKCBhLCBiICkgLT5cbiAgICAjICAgcmV0dXJuICsxIGlmIGFbIDAgXSA+IGJbIDAgXVxuICAgICMgICByZXR1cm4gLTEgaWYgYVsgMCBdIDwgYlsgMCBdXG4gICAgIyAgIHJldHVybiAgMFxuICAgIG1hdGNoZXJzICAgICAgPSAoIFsgcGFkWyAwIF0sIF0gZm9yIHBhZCBpbiBwcm9iZXNfYW5kX2Rlc2NyaXB0aW9ucyApXG4gICAgIyBkZXNjcmlwdGlvbnMgID0gKCBbIHBhZFsgMSBdLCBdIGZvciBwYWQgaW4gcHJvYmVzX2FuZF9kZXNjcmlwdGlvbnMgKVxuICAgIGZvciBwYWQgaW4gcHJvYmVzX2FuZF9kZXNjcmlwdGlvbnNcbiAgICAgIHVyZ2UgcGFkXG4gICAgQ05ELnNodWZmbGUgcHJvYmVzX2FuZF9kZXNjcmlwdGlvbnNcbiAgICBmb3IgWyBwcm9iZSwgXywgXSBpbiBwcm9iZXNfYW5kX2Rlc2NyaXB0aW9uc1xuICAgICAgcHJvYmVfYmZyID0gQ09ERUMuZW5jb2RlIFsgcHJvYmUsIF1cbiAgICAgIHlpZWxkIGxldmVsZGIucHV0IHByb2JlX2JmciwgJzEnLCByZXN1bWVcbiAgICBwcm9iZV9iZnJzICA9IHlpZWxkIHJlYWRfYWxsX2tleXMgbGV2ZWxkYiwgcmVzdW1lXG4gICAgcHJvYmVzICAgICAgPSAoIENPREVDLmRlY29kZSBwcm9iZV9iZnIgZm9yIHByb2JlX2JmciBpbiBwcm9iZV9iZnJzIClcbiAgICBzaG93X2tleXNfYW5kX2tleV9iZnJzIHByb2JlcywgcHJvYmVfYmZyc1xuICAgIGZvciBwcm9iZSwgcHJvYmVfaWR4IGluIHByb2Jlc1xuICAgICAgbWF0Y2hlciA9IG1hdGNoZXJzWyBwcm9iZV9pZHggXVxuICAgICAgVC5lcSBwcm9iZSwgbWF0Y2hlclxuICAgIGxldmVsZGIuY2xvc2UgLT4gZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJzb3J0IG1peGVkIHZhbHVlcyB3aXRoIEgyIGNvZGVjXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHNldHRpbmdzID1cbiAgICAgIGRiOiAgICAgICAgICAgbGV2ZWxkb3duXG4gICAgICBrZXlFbmNvZGluZzogICdiaW5hcnknXG4gICAgbGV2ZWxkYiA9IGxldmVsdXAgJy90bXAvaG9sbGVyaXRoMi10ZXN0Jywgc2V0dGluZ3NcbiAgICB5aWVsZCBjbGVhcl9sZXZlbGRiIGxldmVsZGIsIHJlc3VtZVxuICAgIHByb2JlcyA9IFtcbiAgICAgIG51bGxcbiAgICAgIGZhbHNlXG4gICAgICB0cnVlXG4gICAgICBDT0RFQy5maXJzdF9kYXRlXG4gICAgICBuZXcgRGF0ZSAwXG4gICAgICBuZXcgRGF0ZSA4ZTExXG4gICAgICBuZXcgRGF0ZSgpXG4gICAgICBDT0RFQy5sYXN0X2RhdGVcbiAgICAgIDEyMzRcbiAgICAgIEluZmluaXR5XG4gICAgICAnJ1xuICAgICAgJ+S4gCdcbiAgICAgICfkuIknXG4gICAgICAn5LqMJ1xuICAgICAgJ/CggIAnXG4gICAgICAn8KCAgFxceDAwJ1xuICAgICAgU3RyaW5nLmZyb21Db2RlUG9pbnQgMHgxMGZmZmZcbiAgICAgIF1cbiAgICBtYXRjaGVycyA9ICggWyBwcm9iZSwgXSBmb3IgcHJvYmUgaW4gcHJvYmVzIClcbiAgICBDTkQuc2h1ZmZsZSBwcm9iZXNcbiAgICBmb3IgcHJvYmUgaW4gcHJvYmVzXG4gICAgICBkZWJ1ZyAnwqlvTVhKWicsIHByb2JlXG4gICAgICBwcm9iZV9iZnIgPSBDT0RFQy5lbmNvZGUgWyBwcm9iZSwgXVxuICAgICAgeWllbGQgbGV2ZWxkYi5wdXQgcHJvYmVfYmZyLCAnMScsIHJlc3VtZVxuICAgIHByb2JlX2JmcnMgID0geWllbGQgcmVhZF9hbGxfa2V5cyBsZXZlbGRiLCByZXN1bWVcbiAgICAjIGRlYnVnICfCqUZkNWl3JywgcHJvYmVfYmZyc1xuICAgIHByb2JlcyAgICAgID0gKCBDT0RFQy5kZWNvZGUgcHJvYmVfYmZyIGZvciBwcm9iZV9iZnIgaW4gcHJvYmVfYmZycyApXG4gICAgc2hvd19rZXlzX2FuZF9rZXlfYmZycyBwcm9iZXMsIHByb2JlX2JmcnNcbiAgICBmb3IgcHJvYmUsIHByb2JlX2lkeCBpbiBwcm9iZXNcbiAgICAgIG1hdGNoZXIgPSBtYXRjaGVyc1sgcHJvYmVfaWR4IF1cbiAgICAgIFQuZXEgcHJvYmUsIG1hdGNoZXJcbiAgICBsZXZlbGRiLmNsb3NlIC0+IGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwic29ydCBsaXN0cyBvZiBtaXhlZCB2YWx1ZXMgd2l0aCBIMiBjb2RlY1wiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICBzZXR0aW5ncyA9XG4gICAgICBkYjogICAgICAgICAgIGxldmVsZG93blxuICAgICAga2V5RW5jb2Rpbmc6ICAnYmluYXJ5J1xuICAgIGxldmVsZGIgPSBsZXZlbHVwICcvdG1wL2hvbGxlcml0aDItdGVzdCcsIHNldHRpbmdzXG4gICAgeWllbGQgY2xlYXJfbGV2ZWxkYiBsZXZlbGRiLCByZXN1bWVcbiAgICBwcm9iZXMgPSBbXG4gICAgICBbIFwiXCIsICAgICAgICAgICAgICcnLCAgICAgICAgICAgICBdXG4gICAgICBbIFwiMTIzNFwiLCAgICAgICAgICAxMjM0LCAgICAgICAgICAgXVxuICAgICAgWyBcIkluZmluaXR5XCIsICAgICAgSW5maW5pdHksICAgICAgIF1cbiAgICAgIFsgXCJTdHJpbmcuZnJvbUNvZGVQb2ludCAweDEwZmZmZlwiLCBTdHJpbmcuZnJvbUNvZGVQb2ludCAweDEwZmZmZiBdXG4gICAgICBbIFwiZmFsc2VcIiwgICAgICAgICBmYWxzZSwgICAgICAgICAgXVxuICAgICAgWyBcIm5ldyBEYXRlIDBcIiwgICAgbmV3IERhdGUgMCwgICAgIF1cbiAgICAgIFsgXCJuZXcgRGF0ZSA4ZTExXCIsIG5ldyBEYXRlIDhlMTEsICBdXG4gICAgICBbIFwibmV3IERhdGUoKVwiLCAgICBuZXcgRGF0ZSgpLCAgICAgXVxuICAgICAgWyBcIm51bGxcIiwgICAgICAgICAgbnVsbCwgICAgICAgICAgIF1cbiAgICAgIFsgXCJ0cnVlXCIsICAgICAgICAgIHRydWUsICAgICAgICAgICBdXG4gICAgICBbIFwi5LiAXCIsICAgICAgICAgICAgJ+S4gCcsICAgICAgICAgICAgXVxuICAgICAgWyBcIuS4iVwiLCAgICAgICAgICAgICfkuIknLCAgICAgICAgICAgIF1cbiAgICAgIFsgXCLkuoxcIiwgICAgICAgICAgICAn5LqMJywgICAgICAgICAgICBdXG4gICAgICBbIFwi8KCAgFwiLCAgICAgICAgICAgICfwoICAJywgICAgICAgICAgICBdXG4gICAgICBbIFwi8KCAgFxceDAwXCIsICAgICAgICAn8KCAgFxceDAwJywgICAgICAgIF1cbiAgICAgIF1cbiAgICBtYXRjaGVycyA9ICggcHJvYmUgZm9yIHByb2JlIGluIHByb2JlcyApXG4gICAgQ05ELnNodWZmbGUgcHJvYmVzXG4gICAgZm9yIHByb2JlIGluIHByb2Jlc1xuICAgICAgZGVidWcgJ8Kpb01YSlonLCBwcm9iZVxuICAgICAgcHJvYmVfYmZyID0gQ09ERUMuZW5jb2RlIHByb2JlXG4gICAgICB5aWVsZCBsZXZlbGRiLnB1dCBwcm9iZV9iZnIsICcxJywgcmVzdW1lXG4gICAgcHJvYmVfYmZycyAgPSB5aWVsZCByZWFkX2FsbF9rZXlzIGxldmVsZGIsIHJlc3VtZVxuICAgICMgZGVidWcgJ8KpRmQ1aXcnLCBwcm9iZV9iZnJzXG4gICAgcHJvYmVzICAgICAgPSAoIENPREVDLmRlY29kZSBwcm9iZV9iZnIgZm9yIHByb2JlX2JmciBpbiBwcm9iZV9iZnJzIClcbiAgICBzaG93X2tleXNfYW5kX2tleV9iZnJzIHByb2JlcywgcHJvYmVfYmZyc1xuICAgIGZvciBwcm9iZSwgcHJvYmVfaWR4IGluIHByb2Jlc1xuICAgICAgbWF0Y2hlciA9IG1hdGNoZXJzWyBwcm9iZV9pZHggXVxuICAgICAgVC5lcSBwcm9iZSwgbWF0Y2hlclxuICAgIGxldmVsZGIuY2xvc2UgLT4gZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJzb3J0IHJvdXRlcyB3aXRoIHZhbHVlcyAoMSlcIiBdID0gKCBULCBkb25lICkgLT5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgc2V0dGluZ3MgPVxuICAgICAgZGI6ICAgICAgICAgICBsZXZlbGRvd25cbiAgICAgIGtleUVuY29kaW5nOiAgJ2JpbmFyeSdcbiAgICBsZXZlbGRiID0gbGV2ZWx1cCAnL3RtcC9ob2xsZXJpdGgyLXRlc3QnLCBzZXR0aW5nc1xuICAgIHlpZWxkIGNsZWFyX2xldmVsZGIgbGV2ZWxkYiwgcmVzdW1lXG4gICAgcHJvYmVzID0gW1xuICAgICAgWyAncG9zJywgJ3N0cm9rZW9yZGVyJywgJzM1MjUxMzU1MzI1NCcsICAgICAgICAgICfwpL+vJywgXVxuICAgICAgWyAncG9zJywgJ3N0cm9rZW9yZGVyJywgJzM1MjUxNDExMjEnLCAgICAgICAgICAgICfwoLSmJywgXVxuICAgICAgWyAncG9zJywgJ3N0cm9rZW9yZGVyJywgJzM1MjUxNDU0JywgICAgICAgICAgICAgICfwqJKhJywgXVxuICAgICAgWyAncG9zJywgJ3N0cm9rZW9yZGVyJywgJzM1MjUxNTInLCAgICAgICAgICAgICAgICfpgq0nLCBdXG4gICAgICBbICdwb3MnLCAnc3Ryb2tlb3JkZXInLCAnMzUyNTE1MjUxMTE1MTE1MTEzNTQxJywgJ/CqmqsnLCBdXG4gICAgICBbICdwb3MnLCAnc3Ryb2tlb3JkZXInLCAnMzUyNTE1MjUxMTI1MTE1MTEnLCAgICAgJ/CqmqcnLCBdXG4gICAgICBbICdwb3MnLCAnc3Ryb2tlb3JkZXInLCAnMzUyNTE1MjUxMjE0MjUxMjE0JywgICAgJ/CnkbQnLCBdXG4gICAgICBbICdwb3MnLCAnc3Ryb2tlb3JkZXInLCAnMzUyNTE1MycsICAgICAgICAgICAgICAgJ+WKrCcsIF1cbiAgICAgIFsgJ3BvcycsICdzdHJva2VvcmRlcicsICczNTI1MTUzXFx4MDAnLCAgICAgICAgICAgICAgICfliqwnLCBdXG4gICAgICBbICdwb3MnLCAnc3Ryb2tlb3JkZXJcXHgwMCcsICczNTI1MTM1NTMyNTQnLCAgICAgICAgICAn8KS/rycsIF1cbiAgICAgIF1cbiAgICBtYXRjaGVycyA9ICggcHJvYmUgZm9yIHByb2JlIGluIHByb2JlcyApXG4gICAgQ05ELnNodWZmbGUgcHJvYmVzXG4gICAgZm9yIHByb2JlIGluIHByb2Jlc1xuICAgICAgcHJvYmVfYmZyID0gQ09ERUMuZW5jb2RlIHByb2JlXG4gICAgICB5aWVsZCBsZXZlbGRiLnB1dCBwcm9iZV9iZnIsICcxJywgcmVzdW1lXG4gICAgcHJvYmVfYmZycyAgPSB5aWVsZCByZWFkX2FsbF9rZXlzIGxldmVsZGIsIHJlc3VtZVxuICAgICMgZGVidWcgJ8KpRmQ1aXcnLCBwcm9iZV9iZnJzXG4gICAgcHJvYmVzICAgICAgPSAoIENPREVDLmRlY29kZSBwcm9iZV9iZnIgZm9yIHByb2JlX2JmciBpbiBwcm9iZV9iZnJzIClcbiAgICBzaG93X2tleXNfYW5kX2tleV9iZnJzIHByb2JlcywgcHJvYmVfYmZyc1xuICAgIGZvciBwcm9iZSwgcHJvYmVfaWR4IGluIHByb2Jlc1xuICAgICAgbWF0Y2hlciA9IG1hdGNoZXJzWyBwcm9iZV9pZHggXVxuICAgICAgVC5lcSBwcm9iZSwgbWF0Y2hlclxuICAgIGxldmVsZGIuY2xvc2UgLT4gZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJzb3J0IHJvdXRlcyB3aXRoIHZhbHVlcyAoMilcIiBdID0gKCBULCBkb25lICkgLT5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgc2V0dGluZ3MgPVxuICAgICAgZGI6ICAgICAgICAgICBsZXZlbGRvd25cbiAgICAgIGtleUVuY29kaW5nOiAgJ2JpbmFyeSdcbiAgICBsZXZlbGRiID0gbGV2ZWx1cCAnL3RtcC9ob2xsZXJpdGgyLXRlc3QnLCBzZXR0aW5nc1xuICAgIHlpZWxkIGNsZWFyX2xldmVsZGIgbGV2ZWxkYiwgcmVzdW1lXG4gICAgcHJvYmVzID0gW1xuICAgICAgWyAnYScsICAgICAgbnVsbCwgXVxuICAgICAgWyAnYScsICAgICAgZmFsc2UsIF1cbiAgICAgIFsgJ2EnLCAgICAgIHRydWUsIF1cbiAgICAgIFsgJ2EnLCAgICAgIG5ldyBEYXRlKCksIF1cbiAgICAgIFsgJ2EnLCAgICAgIC1JbmZpbml0eSwgXVxuICAgICAgWyAnYScsICAgICAgKzEyMzQsIF1cbiAgICAgIFsgJ2EnLCAgICAgICtJbmZpbml0eSwgXVxuICAgICAgWyAnYScsICAgICAgJ2InLCBdXG4gICAgICBbICdhJywgICAgICAnYlxceDAwJywgXVxuICAgICAgWyAnYVxceDAwJywgICsxMjM0LCBdXG4gICAgICBbICdhXFx4MDAnLCAgJ2InLCBdXG4gICAgICBbICdhYScsICAgICArMTIzNCwgXVxuICAgICAgWyAnYWEnLCAgICAgJ2InLCBdXG4gICAgICBbICdhYScsICAgICAnYlxceDAwJywgXVxuICAgICAgXVxuICAgIG1hdGNoZXJzID0gKCBwcm9iZSBmb3IgcHJvYmUgaW4gcHJvYmVzIClcbiAgICBDTkQuc2h1ZmZsZSBwcm9iZXNcbiAgICBmb3IgcHJvYmUgaW4gcHJvYmVzXG4gICAgICBwcm9iZV9iZnIgPSBDT0RFQy5lbmNvZGUgcHJvYmVcbiAgICAgIHlpZWxkIGxldmVsZGIucHV0IHByb2JlX2JmciwgJzEnLCByZXN1bWVcbiAgICBwcm9iZV9iZnJzICA9IHlpZWxkIHJlYWRfYWxsX2tleXMgbGV2ZWxkYiwgcmVzdW1lXG4gICAgIyBkZWJ1ZyAnwqlGZDVpdycsIHByb2JlX2JmcnNcbiAgICBwcm9iZXMgICAgICA9ICggQ09ERUMuZGVjb2RlIHByb2JlX2JmciBmb3IgcHJvYmVfYmZyIGluIHByb2JlX2JmcnMgKVxuICAgIHNob3dfa2V5c19hbmRfa2V5X2JmcnMgcHJvYmVzLCBwcm9iZV9iZnJzXG4gICAgZm9yIHByb2JlLCBwcm9iZV9pZHggaW4gcHJvYmVzXG4gICAgICBtYXRjaGVyID0gbWF0Y2hlcnNbIHByb2JlX2lkeCBdXG4gICAgICBULmVxIHByb2JlLCBtYXRjaGVyXG4gICAgbGV2ZWxkYi5jbG9zZSAtPiBkb25lKClcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgSEVMUEVSU1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5zaG93X2tleXNfYW5kX2tleV9iZnJzID0gKCBrZXlzLCBrZXlfYmZycyApIC0+XG4gIGYgPSAoIHAgKSAtPiAoIHQgZm9yIHQgaW4gKCBwLnRvU3RyaW5nICdoZXgnICkuc3BsaXQgLyguLikvIHdoZW4gdCBpc250ICcnICkuam9pbiAnICdcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBjb2x1bW5pZnlfc2V0dGluZ3MgPVxuICAgIHBhZGRpbmdDaHI6ICcgJ1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGRhdGEgICAgICA9IFtdXG4gIGtleV9iZnJzICA9ICggZiBwIGZvciBwIGluIGtleV9iZnJzIClcbiAgZm9yIGtleSwgaWR4IGluIGtleXNcbiAgICBrZXlfdHh0ID0gKCBycHIga2V5ICkucmVwbGFjZSAvXFxcXHUwMDAwL2csICfiiIcnXG4gICAgZGF0YS5wdXNoIHsgJ3N0cic6IGtleV90eHQsICdiZnInOiBrZXlfYmZyc1sgaWR4IF19XG4gIGhlbHAgJ1xcbicgKyBDTkQuY29sdW1uaWZ5IGRhdGEsIGNvbHVtbmlmeV9zZXR0aW5nc1xuICByZXR1cm4gbnVsbFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmdldF9uZXdfZGJfbmFtZSA9IC0+XG4gIGdldF9uZXdfZGJfbmFtZS5pZHggKz0gKzFcbiAgcmV0dXJuIFwiL3RtcC9ob2xsZXJpdGgyLXRlc3RkYi0je2dldF9uZXdfZGJfbmFtZS5pZHh9XCJcbmdldF9uZXdfZGJfbmFtZS5pZHggPSAwXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxucmVhZF9hbGxfa2V5cyA9ICggZGIsIGhhbmRsZXIgKSAtPlxuICBaID0gW11cbiAgaW5wdXQgPSBkYi5jcmVhdGVLZXlTdHJlYW0oKVxuICBpbnB1dC5vbiAnZW5kJywgLT4gaGFuZGxlciBudWxsLCBaXG4gIGlucHV0XG4gICAgLnBpcGUgJCAoIGRhdGEsIHNlbmQgKSA9PiBaLnB1c2ggZGF0YVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsZWFyX2xldmVsZGIgPSAoIGxldmVsZGIsIGhhbmRsZXIgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICByb3V0ZSA9IGxldmVsZGJbICdsb2NhdGlvbicgXVxuICAgIHlpZWxkIGxldmVsZGIuY2xvc2UgcmVzdW1lXG4gICAgeWllbGQgbGV2ZWxkb3duLmRlc3Ryb3kgcm91dGUsIHJlc3VtZVxuICAgIHlpZWxkIGxldmVsZGIub3BlbiByZXN1bWVcbiAgICAjIGhlbHAgXCJlcmFzZWQgYW5kIHJlLW9wZW5lZCBMZXZlbERCIGF0ICN7cm91dGV9XCJcbiAgICBoYW5kbGVyIG51bGxcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX21haW4gPSAoIGhhbmRsZXIgKSAtPlxuICBkYiA9IEhPTExFUklUSC5uZXdfZGIgam9pbiBfX2Rpcm5hbWUsICcuLicsICdkYnMvdGVzdHMnXG4gIHRlc3QgQCwgJ3RpbWVvdXQnOiAyNTAwXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xudW5sZXNzIG1vZHVsZS5wYXJlbnQ/XG4gIEBfbWFpbigpXG5cblxuXG5cblxuXG5cblxuXG5cblxuIl19