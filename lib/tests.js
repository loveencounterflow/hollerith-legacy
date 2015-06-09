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
        var i, input, j, key, len, len1, probe, ref, ref1, url_key;
        (yield HOLLERITH.clear(db, resume));
        whisper("writing test dataset #" + probes_idx + " with settings " + (rpr(settings)));
        input = D.create_throughstream();
        switch (probes_idx) {
          case 0:
          case 2:
            input.pipe(HOLLERITH.$write(db, settings)).pipe(D.$on_end(function() {
              whisper("test data written");
              return handler(null);
            }));
            ref = _this._feed_test_data.probes[probes_idx];
            for (i = 0, len = ref.length; i < len; i++) {
              probe = ref[i];
              input.write(probe);
              (yield setImmediate(resume));
            }
            return input.end();
          case 1:
            input.pipe(HOLLERITH.$write(db, settings)).pipe(D.$on_end(function() {
              whisper("test data written");
              return handler(null);
            }));
            ref1 = _this._feed_test_data.probes[probes_idx];
            for (j = 0, len1 = ref1.length; j < len1; j++) {
              url_key = ref1[j];
              key = HOLLERITH.key_from_url(db, url_key);
              input.write(key);
              (yield setImmediate(resume));
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

  this._feed_test_data.probes.push([['𧷟1', 'guide/lineup/length', 1], ['𧷟2', 'guide/lineup/length', 2], ['𧷟3', 'guide/lineup/length', 3], ['𧷟4', 'guide/lineup/length', 4], ['𧷟', 'guide/lineup/length', 5], ['𧷟6', 'guide/lineup/length', 6], ['𧷟', 'cp/cid', 163295], ['𧷟', 'guide/uchr/has', ['八', '刀', '宀', '', '貝']], ['𧷟', 'rank/cjt', 5432], ['八', 'factor/strokeclass/wbf', '34'], ['刀', 'factor/strokeclass/wbf', '5(12)3'], ['宀', 'factor/strokeclass/wbf', '44'], ['', 'factor/strokeclass/wbf', '12'], ['貝', 'factor/strokeclass/wbf', '25(12)'], ['八', 'rank/cjt', 12541], ['刀', 'rank/cjt', 12542], ['宀', 'rank/cjt', 12543], ['', 'rank/cjt', 12544], ['貝', 'rank/cjt', 12545]]);

  this._feed_test_data.probes.push(['so|glyph:劬|cp/fncr:u-cjk/52ac|0', 'so|glyph:邭|cp/fncr:u-cjk/90ad|0', 'so|glyph:𠴦|cp/fncr:u-cjk-xb/20d26|0', 'so|glyph:𤿯|cp/fncr:u-cjk-xb/24fef|0', 'so|glyph:𧑴|cp/fncr:u-cjk-xb/27474|0', 'so|glyph:𨒡|cp/fncr:u-cjk-xb/284a1|0', 'so|glyph:𪚧|cp/fncr:u-cjk-xb/2a6a7|0', 'so|glyph:𪚫|cp/fncr:u-cjk-xb/2a6ab|0', 'so|glyph:𤿯|strokeorder:352513553254|0', 'so|glyph:𠴦|strokeorder:3525141121|0', 'so|glyph:𨒡|strokeorder:35251454|0', 'so|glyph:邭|strokeorder:3525152|0', 'so|glyph:𪚫|strokeorder:352515251115115113541|0', 'so|glyph:𪚧|strokeorder:35251525112511511|0', 'so|glyph:𧑴|strokeorder:352515251214251214|0', 'so|glyph:劬|strokeorder:3525153|0']);

  this._feed_test_data.probes.push([['丁', 'strokecount', 2], ['三', 'strokecount', 3], ['夫', 'strokecount', 5], ['國', 'strokecount', 11], ['形', 'strokecount', 7], ['丁', 'componentcount', 1], ['三', 'componentcount', 1], ['夫', 'componentcount', 1], ['國', 'componentcount', 4], ['形', 'componentcount', 2], ['丁', 'components', ['丁']], ['三', 'components', ['三']], ['夫', 'components', ['夫']], ['國', 'components', ['囗', '戈', '口', '一']], ['形', 'components', ['开', '彡']]]);

  this["write without error"] = function(T, done) {
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
    return step((function(_this) {
      return function*(resume) {
        (yield _this._read_with_sub_read_3(T, {
          batch: 0
        }, resume));
        (yield _this._read_with_sub_read_3(T, {
          batch: 3
        }, resume));
        (yield _this._read_with_sub_read_3(T, {
          batch: 5
        }, resume));
        (yield _this._read_with_sub_read_3(T, {
          batch: 1000
        }, resume));
        return done();
      };
    })(this));
  };

  this._read_with_sub_read_3 = function(T, write_settings, done) {
    var count, idx, matchers, probes_idx;
    probes_idx = 0;
    idx = -1;
    count = 0;
    matchers = [[["𧷟", "八", "34"], ["spo", "八", "rank/cjt", 12541]], [["𧷟", "刀", "5(12)3"], ["spo", "刀", "rank/cjt", 12542]], [["𧷟", "宀", "44"], ["spo", "宀", "rank/cjt", 12543]], [["𧷟", "貝", "25(12)"], ["spo", "貝", "rank/cjt", 12545]], [["𧷟", "", "12"], ["spo", "", "rank/cjt", 12544]]];
    return step((function(_this) {
      return function*(resume) {
        var input, prefix, read_settings;
        (yield _this._feed_test_data(db, probes_idx, write_settings, resume));
        prefix = ['pos', 'guide/uchr/has'];
        input = HOLLERITH.create_phrasestream(db, prefix);
        read_settings = {
          indexed: false
        };
        return input.pipe(HOLLERITH.read_sub(db, read_settings, function(phrase) {
          var _, glyph, guide, prd, sub_input;
          _ = phrase[0], glyph = phrase[1], prd = phrase[2], guide = phrase[3];
          prefix = ['spo', guide, 'factor/strokeclass/wbf'];
          sub_input = HOLLERITH.create_phrasestream(db, prefix);
          return [glyph, sub_input];
        })).pipe(HOLLERITH.read_sub(db, read_settings, function(xphrase) {
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

  this["write many phrases"] = function(T, done) {
    var count, delay, idx, write_probes;
    idx = -1;
    count = 0;
    delay = function(handler) {
      return setImmediate(handler);
    };
    write_probes = (function(_this) {
      return function(handler) {
        return step(function*(resume) {
          var i, input, probe;
          (yield HOLLERITH.clear(db, resume));
          input = D.create_throughstream();
          input.pipe(HOLLERITH.$write(db, {
            solids: ['some-predicate']
          })).pipe(D.$on_end(function() {
            urge("test data written");
            return handler();
          }));
          for (idx = i = 0; i <= 100; idx = ++i) {
            probe = "entry-" + idx;
            (yield input.write(probe, resume));
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
    db = HOLLERITH.new_db(join(__dirname, '..', 'dbs/tests'));
    return test(this, {
      'timeout': 2500
    });
  };

  if (module.parent == null) {
    this._main();
  }

}).call(this);

//# sourceMappingURL=data:application/json;base64,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aEIsRUFBc0IsV0FBdEIsQ0FBakIsQ0FBTCxDQUFBO1dBQ0EsSUFBQSxDQUFLLElBQUwsRUFBUTtBQUFBLE1BQUEsU0FBQSxFQUFXLElBQVg7S0FBUixFQUZPO0VBQUEsQ0F0bkNULENBQUE7O0FBMm5DQSxFQUFBLElBQU8scUJBQVA7QUFDRSxJQUFBLElBQUMsQ0FBQSxLQUFELENBQUEsQ0FBQSxDQURGO0dBM25DQTtBQUFBIiwiZmlsZSI6InRlc3RzLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiXG5cblxuIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5uanNfcGF0aCAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAncGF0aCdcbiMgbmpzX2ZzICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2ZzJ1xuam9pbiAgICAgICAgICAgICAgICAgICAgICA9IG5qc19wYXRoLmpvaW5cbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuQ05EICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2NuZCdcbnJwciAgICAgICAgICAgICAgICAgICAgICAgPSBDTkQucnByXG5iYWRnZSAgICAgICAgICAgICAgICAgICAgID0gJ0hPTExFUklUSC90ZXN0cydcbmxvZyAgICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAncGxhaW4nLCAgICAgYmFkZ2VcbmluZm8gICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnaW5mbycsICAgICAgYmFkZ2VcbndoaXNwZXIgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnd2hpc3BlcicsICAgYmFkZ2VcbmFsZXJ0ICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnYWxlcnQnLCAgICAgYmFkZ2VcbmRlYnVnICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnZGVidWcnLCAgICAgYmFkZ2Vcbndhcm4gICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnd2FybicsICAgICAgYmFkZ2VcbmhlbHAgICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnaGVscCcsICAgICAgYmFkZ2VcbnVyZ2UgICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAndXJnZScsICAgICAgYmFkZ2VcbmVjaG8gICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZWNoby5iaW5kIENORFxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5zdXNwZW5kICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnY29mZmVlbm9kZS1zdXNwZW5kJ1xuc3RlcCAgICAgICAgICAgICAgICAgICAgICA9IHN1c3BlbmQuc3RlcFxuYWZ0ZXIgICAgICAgICAgICAgICAgICAgICA9IHN1c3BlbmQuYWZ0ZXJcbiMgZXZlbnR1YWxseSAgICAgICAgICAgICAgICA9IHN1c3BlbmQuZXZlbnR1YWxseVxuIyBpbW1lZGlhdGVseSAgICAgICAgICAgICAgID0gc3VzcGVuZC5pbW1lZGlhdGVseVxuIyByZXBlYXRfaW1tZWRpYXRlbHkgICAgICAgID0gc3VzcGVuZC5yZXBlYXRfaW1tZWRpYXRlbHlcbiMgZXZlcnkgICAgICAgICAgICAgICAgICAgICA9IHN1c3BlbmQuZXZlcnlcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxudGVzdCAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2d1eS10ZXN0J1xuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5EICAgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAncGlwZWRyZWFtczInXG4kICAgICAgICAgICAgICAgICAgICAgICAgID0gRC5yZW1pdC5iaW5kIERcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuSE9MTEVSSVRIICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vbWFpbidcbmRiICAgICAgICAgICAgICAgICAgICAgICAgPSBudWxsXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkJZVEVXSVNFICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdieXRld2lzZSdcbmxldmVsdXAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdsZXZlbHVwJ1xubGV2ZWxkb3duICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2xldmVsZG93bidcbkNPREVDICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL2NvZGVjJ1xuXG5cbiMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEBfZW5jb2RlX2xpc3QgPSAoIGxpc3QgKSAtPlxuIyAgICggbGlzdFsgaWR4IF0gPSBCWVRFV0lTRS5lbmNvZGUgdmFsdWUgKSBmb3IgdmFsdWUsIGlkeCBpbiBsaXN0XG4jICAgcmV0dXJuIGxpc3RcblxuIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQF9kZWNvZGVfbGlzdCA9ICggbGlzdCApIC0+XG4jICAgKCBsaXN0WyBpZHggXSA9IEJZVEVXSVNFLmRlY29kZSB2YWx1ZSApIGZvciB2YWx1ZSwgaWR4IGluIGxpc3RcbiMgICByZXR1cm4gbGlzdFxuXG4jICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBAX3NvcnRfbGlzdCA9ICggbGlzdCApIC0+XG4jICAgQF9lbmNvZGVfbGlzdCBsaXN0XG4jICAgbGlzdC5zb3J0IEJ1ZmZlci5jb21wYXJlXG4jICAgQF9kZWNvZGVfbGlzdCBsaXN0XG4jICAgcmV0dXJuIGxpc3RcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX2ZlZWRfdGVzdF9kYXRhID0gKCBkYiwgcHJvYmVzX2lkeCwgc2V0dGluZ3MsIGhhbmRsZXIgKSAtPlxuICBzd2l0Y2ggYXJpdHkgPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgd2hlbiAzXG4gICAgICBoYW5kbGVyICAgPSBzZXR0aW5nc1xuICAgICAgc2V0dGluZ3MgID0gbnVsbFxuICAgIHdoZW4gNFxuICAgICAgbnVsbFxuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBFcnJvciBcImV4cGVjdGVkIDMgb3IgNCBhcmd1bWVudHMsIGdvdCAje2FyaXR5fVwiXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgSE9MTEVSSVRILmNsZWFyIGRiLCByZXN1bWVcbiAgICB3aGlzcGVyIFwid3JpdGluZyB0ZXN0IGRhdGFzZXQgIyN7cHJvYmVzX2lkeH0gd2l0aCBzZXR0aW5ncyAje3JwciBzZXR0aW5nc31cIlxuICAgIGlucHV0ID0gRC5jcmVhdGVfdGhyb3VnaHN0cmVhbSgpXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBzd2l0Y2ggcHJvYmVzX2lkeFxuICAgICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICB3aGVuIDAsIDJcbiAgICAgICAgaW5wdXRcbiAgICAgICAgICAucGlwZSBIT0xMRVJJVEguJHdyaXRlIGRiLCBzZXR0aW5nc1xuICAgICAgICAgICMgLnBpcGUgRC4kc2hvdygpXG4gICAgICAgICAgLnBpcGUgRC4kb25fZW5kID0+XG4gICAgICAgICAgICB3aGlzcGVyIFwidGVzdCBkYXRhIHdyaXR0ZW5cIlxuICAgICAgICAgICAgaGFuZGxlciBudWxsXG4gICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgICAgZm9yIHByb2JlIGluIEBfZmVlZF90ZXN0X2RhdGEucHJvYmVzWyBwcm9iZXNfaWR4IF1cbiAgICAgICAgICAjIGtleSA9IEhPTExFUklUSC5uZXdfc29fa2V5IGRiLCBwcm9iZS4uLlxuICAgICAgICAgICMgZGVidWcgJ8KpV1YwajInLCBwcm9iZVxuICAgICAgICAgIGlucHV0LndyaXRlIHByb2JlXG4gICAgICAgICAgeWllbGQgc2V0SW1tZWRpYXRlIHJlc3VtZVxuICAgICAgICBpbnB1dC5lbmQoKVxuICAgICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICB3aGVuIDFcbiAgICAgICAgaW5wdXRcbiAgICAgICAgICAucGlwZSBIT0xMRVJJVEguJHdyaXRlIGRiLCBzZXR0aW5nc1xuICAgICAgICAgICMgLnBpcGUgRC4kc2hvdygpXG4gICAgICAgICAgLnBpcGUgRC4kb25fZW5kID0+XG4gICAgICAgICAgICB3aGlzcGVyIFwidGVzdCBkYXRhIHdyaXR0ZW5cIlxuICAgICAgICAgICAgaGFuZGxlciBudWxsXG4gICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgICAgZm9yIHVybF9rZXkgaW4gQF9mZWVkX3Rlc3RfZGF0YS5wcm9iZXNbIHByb2Jlc19pZHggXVxuICAgICAgICAgIGtleSA9IEhPTExFUklUSC5rZXlfZnJvbV91cmwgZGIsIHVybF9rZXlcbiAgICAgICAgICBpbnB1dC53cml0ZSBrZXlcbiAgICAgICAgICB5aWVsZCBzZXRJbW1lZGlhdGUgcmVzdW1lXG4gICAgICAgIGlucHV0LmVuZCgpXG4gICAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgZWxzZSByZXR1cm4gaGFuZGxlciBuZXcgRXJyb3IgXCJpbGxlZ2FsIHByb2JlcyBpbmRleCAje3JwciBwcm9iZXNfaWR4fVwiXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcmV0dXJuIG51bGxcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX2ZlZWRfdGVzdF9kYXRhLnByb2JlcyA9IFtdXG5cbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuQF9mZWVkX3Rlc3RfZGF0YS5wcm9iZXMucHVzaCBbXG4gIFsgJ/Cnt58xJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAgICAgICAgICAgICAgMSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn8Ke3nzInLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsICAgICAgICAgICAgICAyLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfwp7efMycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgICAgICAgICAgICAgIDMsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ/Cnt580JywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAgICAgICAgICAgICAgNCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn8Ke3nycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgICAgICAgICAgICAgICA1LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfwp7efNicsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgICAgICAgICAgICAgIDYsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ/Cnt58nLCAnY3AvY2lkJywgICAgICAgICAgICAgICAgICAgICAgICAgICAxNjMyOTUsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn8Ke3nycsICdndWlkZS91Y2hyL2hhcycsICAgICAgICAgICAgICAgICAgIFsgJ+WFqycsICfliIAnLCAn5a6AJywgJ+6HuicsICfosp0nLCBdLCAgICAgIF1cbiAgWyAn8Ke3nycsICdyYW5rL2NqdCcsICAgICAgICAgICAgICAgICAgICAgICAgIDU0MzIsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICflhasnLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICAgICAgICAgICczNCcsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5YiAJywgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCAgICAgICAgICAnNSgxMikzJywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+WugCcsICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgICAgICAgICAgJzQ0JywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfuh7onLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICAgICAgICAgICcxMicsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn6LKdJywgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCAgICAgICAgICAnMjUoMTIpJywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+WFqycsICdyYW5rL2NqdCcsICAgICAgICAgICAgICAgICAgICAgICAgIDEyNTQxLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfliIAnLCAncmFuay9janQnLCAgICAgICAgICAgICAgICAgICAgICAgICAxMjU0MiwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5a6AJywgJ3JhbmsvY2p0JywgICAgICAgICAgICAgICAgICAgICAgICAgMTI1NDMsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+6HuicsICdyYW5rL2NqdCcsICAgICAgICAgICAgICAgICAgICAgICAgIDEyNTQ0LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfosp0nLCAncmFuay9janQnLCAgICAgICAgICAgICAgICAgICAgICAgICAxMjU0NSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgXVxuXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkBfZmVlZF90ZXN0X2RhdGEucHJvYmVzLnB1c2ggW1xuICAnc298Z2x5cGg65YqsfGNwL2ZuY3I6dS1jamsvNTJhY3wwJ1xuICAnc298Z2x5cGg66YKtfGNwL2ZuY3I6dS1jamsvOTBhZHwwJ1xuICAnc298Z2x5cGg68KC0pnxjcC9mbmNyOnUtY2prLXhiLzIwZDI2fDAnXG4gICdzb3xnbHlwaDrwpL+vfGNwL2ZuY3I6dS1jamsteGIvMjRmZWZ8MCdcbiAgJ3NvfGdseXBoOvCnkbR8Y3AvZm5jcjp1LWNqay14Yi8yNzQ3NHwwJ1xuICAnc298Z2x5cGg68KiSoXxjcC9mbmNyOnUtY2prLXhiLzI4NGExfDAnXG4gICdzb3xnbHlwaDrwqpqnfGNwL2ZuY3I6dS1jamsteGIvMmE2YTd8MCdcbiAgJ3NvfGdseXBoOvCqmqt8Y3AvZm5jcjp1LWNqay14Yi8yYTZhYnwwJ1xuICAnc298Z2x5cGg68KS/r3xzdHJva2VvcmRlcjozNTI1MTM1NTMyNTR8MCdcbiAgJ3NvfGdseXBoOvCgtKZ8c3Ryb2tlb3JkZXI6MzUyNTE0MTEyMXwwJ1xuICAnc298Z2x5cGg68KiSoXxzdHJva2VvcmRlcjozNTI1MTQ1NHwwJ1xuICAnc298Z2x5cGg66YKtfHN0cm9rZW9yZGVyOjM1MjUxNTJ8MCdcbiAgJ3NvfGdseXBoOvCqmqt8c3Ryb2tlb3JkZXI6MzUyNTE1MjUxMTE1MTE1MTEzNTQxfDAnXG4gICdzb3xnbHlwaDrwqpqnfHN0cm9rZW9yZGVyOjM1MjUxNTI1MTEyNTExNTExfDAnXG4gICdzb3xnbHlwaDrwp5G0fHN0cm9rZW9yZGVyOjM1MjUxNTI1MTIxNDI1MTIxNHwwJ1xuICAnc298Z2x5cGg65YqsfHN0cm9rZW9yZGVyOjM1MjUxNTN8MCdcbiAgXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfZmVlZF90ZXN0X2RhdGEucHJvYmVzLnB1c2ggW1xuICBbICfkuIEnLCAnc3Ryb2tlY291bnQnLCAgICAgMiwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5LiJJywgJ3N0cm9rZWNvdW50JywgICAgIDMsICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+WkqycsICdzdHJva2Vjb3VudCcsICAgICA1LCAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICflnIsnLCAnc3Ryb2tlY291bnQnLCAgICAgMTEsICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5b2iJywgJ3N0cm9rZWNvdW50JywgICAgIDcsICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+S4gScsICdjb21wb25lbnRjb3VudCcsICAxLCAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfkuIknLCAnY29tcG9uZW50Y291bnQnLCAgMSwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5aSrJywgJ2NvbXBvbmVudGNvdW50JywgIDEsICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+WciycsICdjb21wb25lbnRjb3VudCcsICA0LCAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICflvaInLCAnY29tcG9uZW50Y291bnQnLCAgMiwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5LiBJywgJ2NvbXBvbmVudHMnLCAgICAgIFsgJ+S4gScsIF0sICAgICAgICAgICAgICAgICAgXVxuICBbICfkuIknLCAnY29tcG9uZW50cycsICAgICAgWyAn5LiJJywgXSwgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+WkqycsICdjb21wb25lbnRzJywgICAgICBbICflpKsnLCBdLCAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5ZyLJywgJ2NvbXBvbmVudHMnLCAgICAgIFsgJ+WblycsICfmiIgnLCAn5Y+jJywgJ+S4gCcsIF0sIF1cbiAgWyAn5b2iJywgJ2NvbXBvbmVudHMnLCAgICAgIFsgJ+W8gCcsICflvaEnLCBdLCAgICAgICAgICAgICBdXG4gIF1cblxuIyBwb3N8Z3VpZGUva3dpYy9zb3J0Y29kZVxuXG4jICMgW1xuIyAjIFwiMTAyN35+fn4sMDBcIixcIjAxNTZ+fn5+LDAxLDA1MDl+fn5+LDAyLDAwMDB+fn5+LDAzLC0tLS0tLS0tLDA0LC0tLS0tLS0tLDA1LC0tLS0tLS0tLDA2LC0tLS0tLS0tLDA3LC0tLS0tLS0tLDA4LC0tLS0tLS0tLDA5LC0tLS0tLS0tLDEwLC0tLS0tLS0tLDExLC0tLS0tLS0tLDEyLFwiXG4jICMgXCIwMTU2fn5+fiwwMVwiLFwiMDUwOX5+fn4sMDIsMDAwMH5+fn4sMDMsLS0tLS0tLS0sMDQsLS0tLS0tLS0sMDUsLS0tLS0tLS0sMDYsLS0tLS0tLS0sMDcsLS0tLS0tLS0sMDgsLS0tLS0tLS0sMDksLS0tLS0tLS0sMTAsLS0tLS0tLS0sMTEsLS0tLS0tLS0sMTIsMTAyN35+fn4sMDAsXCJcbiMgIyBcIjA1MDl+fn5+LDAyXCIsXCIwMDAwfn5+fiwwMywtLS0tLS0tLSwwNCwtLS0tLS0tLSwwNSwtLS0tLS0tLSwwNiwtLS0tLS0tLSwwNywtLS0tLS0tLSwwOCwtLS0tLS0tLSwwOSwtLS0tLS0tLSwxMCwtLS0tLS0tLSwxMSwtLS0tLS0tLSwxMiwxMDI3fn5+fiwwMCwwMTU2fn5+fiwwMSxcIlxuIyAjIFwiMDAwMH5+fn4sMDNcIixcIi0tLS0tLS0tLDA0LC0tLS0tLS0tLDA1LC0tLS0tLS0tLDA2LC0tLS0tLS0tLDA3LC0tLS0tLS0tLDA4LC0tLS0tLS0tLDA5LC0tLS0tLS0tLDEwLC0tLS0tLS0tLDExLC0tLS0tLS0tLDEyLDEwMjd+fn5+LDAwLDAxNTZ+fn5+LDAxLDA1MDl+fn5+LDAyLFwiXG4jICMgXVxuXG4jIDAwODd+fn5+LDAwLDAyOTF+fn5+LDAxLDA1NTV+fn5+LDAyLC0tLS0tLS0tLDAzLC0tLS0tLS0tLDA0LC0tLS0tLS0tLDA1LC0tLS0tLS0tLDA2LC0tLS0tLS0tLDA3LC0tLS0tLS0tLDA4LC0tLS0tLS0tLDA5LC0tLS0tLS0tLDEwLC0tLS0tLS0tLDExLC0tLS0tLS0tLDEyLHzwppaIfDBcbiMgMDA4N35+fn4sMDAsMDI5MX5+fn4sMDEsMDgyM3gyaC0sMDIsLS0tLS0tLS0sMDMsLS0tLS0tLS0sMDQsLS0tLS0tLS0sMDUsLS0tLS0tLS0sMDYsLS0tLS0tLS0sMDcsLS0tLS0tLS0sMDgsLS0tLS0tLS0sMDksLS0tLS0tLS0sMTAsLS0tLS0tLS0sMTEsLS0tLS0tLS0sMTIsfOiBl3wwXG4jIDAwODd+fn5+LDAwLDAyOTF+fn5+LDAxLDEwMjN+fn5+LDAyLC0tLS0tLS0tLDAzLC0tLS0tLS0tLDA0LC0tLS0tLS0tLDA1LC0tLS0tLS0tLDA2LC0tLS0tLS0tLDA3LC0tLS0tLS0tLDA4LC0tLS0tLS0tLDA5LC0tLS0tLS0tLDEwLC0tLS0tLS0tLDExLC0tLS0tLS0tLDEyLHzwpIuVfDBcbiMgMDA4N35+fn4sMDAsMDI5NH5+fn4sMDEsMDA2MH5+fn4sMDIsLS0tLS0tLS0sMDMsLS0tLS0tLS0sMDQsLS0tLS0tLS0sMDUsLS0tLS0tLS0sMDYsLS0tLS0tLS0sMDcsLS0tLS0tLS0sMDgsLS0tLS0tLS0sMDksLS0tLS0tLS0sMTAsLS0tLS0tLS0sMTEsLS0tLS0tLS0sMTIsfPCmlpR8MFxuIyAwMDg3fn5+fiwwMCwwMjk0fn5+fiwwMSwwNTU1fn5+fiwwMiwtLS0tLS0tLSwwMywtLS0tLS0tLSwwNCwtLS0tLS0tLSwwNSwtLS0tLS0tLSwwNiwtLS0tLS0tLSwwNywtLS0tLS0tLSwwOCwtLS0tLS0tLSwwOSwtLS0tLS0tLSwxMCwtLS0tLS0tLSwxMSwtLS0tLS0tLSwxMix88KaXhnwwXG4jIDAwODd+fn5+LDAwLDAyOTV+fn5+LDAxLDA4MDJ+fn5+LDAyLDA5NTh+fn5+LDAzLC0tLS0tLS0tLDA0LC0tLS0tLS0tLDA1LC0tLS0tLS0tLDA2LC0tLS0tLS0tLDA3LC0tLS0tLS0tLDA4LC0tLS0tLS0tLDA5LC0tLS0tLS0tLDEwLC0tLS0tLS0tLDExLC0tLS0tLS0tLDEyLHzwpaq7fDBcbiMgMDA4N35+fn4sMDAsMDMxMn5+fn4sMDEsLS0tLS0tLS0sMDIsLS0tLS0tLS0sMDMsLS0tLS0tLS0sMDQsLS0tLS0tLS0sMDUsLS0tLS0tLS0sMDYsLS0tLS0tLS0sMDcsLS0tLS0tLS0sMDgsLS0tLS0tLS0sMDksLS0tLS0tLS0sMTAsLS0tLS0tLS0sMTEsLS0tLS0tLS0sMTIsfPCmlLJ8MFxuIyAwMDg3fn5+fiwwMCwwMzE0fn5+fiwwMSwxMTczfn5+fiwwMiwtLS0tLS0tLSwwMywtLS0tLS0tLSwwNCwtLS0tLS0tLSwwNSwtLS0tLS0tLSwwNiwtLS0tLS0tLSwwNywtLS0tLS0tLSwwOCwtLS0tLS0tLSwwOSwtLS0tLS0tLSwxMCwtLS0tLS0tLSwxMSwtLS0tLS0tLSwxMix88KaVgHwwXG4jIDAwODd+fn5+LDAwLDAzMTl+fn5+LDAxLC0tLS0tLS0tLDAyLC0tLS0tLS0tLDAzLC0tLS0tLS0tLDA0LC0tLS0tLS0tLDA1LC0tLS0tLS0tLDA2LC0tLS0tLS0tLDA3LC0tLS0tLS0tLDA4LC0tLS0tLS0tLDA5LC0tLS0tLS0tLDEwLC0tLS0tLS0tLDExLC0tLS0tLS0tLDEyLHzwppWHfDBcbiMgMDA4N35+fn4sMDAsMDM1NX5+fn4sMDEsLS0tLS0tLS0sMDIsLS0tLS0tLS0sMDMsLS0tLS0tLS0sMDQsLS0tLS0tLS0sMDUsLS0tLS0tLS0sMDYsLS0tLS0tLS0sMDcsLS0tLS0tLS0sMDgsLS0tLS0tLS0sMDksLS0tLS0tLS0sMTAsLS0tLS0tLS0sMTEsLS0tLS0tLS0sMTIsfPCmlYZ8MFxuIyAwMDg3fn5+fiwwMCwwMzczfn5+fiwwMSwwMjg0fn5+fiwwMiwtLS0tLS0tLSwwMywtLS0tLS0tLSwwNCwtLS0tLS0tLSwwNSwtLS0tLS0tLSwwNiwtLS0tLS0tLSwwNywtLS0tLS0tLSwwOCwtLS0tLS0tLSwwOSwtLS0tLS0tLSwxMCwtLS0tLS0tLSwxMSwtLS0tLS0tLSwxMix88KaVp3wwXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJ3cml0ZSB3aXRob3V0IGVycm9yXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHByb2Jlc19pZHggID0gMFxuICBpZHggPSAtMVxuICB3cml0ZV9zZXR0aW5ncyA9XG4gICAgYmF0Y2g6IDEwXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHdyaXRlX3NldHRpbmdzLCByZXN1bWVcbiAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgd2l0aG91dCBlcnJvclwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ID0gLTFcbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgZGVidWcgJ8KpN2xFZ3knLCBkYlsnJXNlbGYnXS5pc0Nsb3NlZCgpXG4gICAgZGVidWcgJ8KpN2xFZ3knLCBkYlsnJXNlbGYnXS5pc09wZW4oKVxuICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHJlc3VtZVxuICAgICMgZG9uZSgpXG4gICAgaW5wdXQgPSBIT0xMRVJJVEguY3JlYXRlX2ZhY2V0c3RyZWFtIGRiXG4gICAgaW5wdXRcbiAgICAgICMgLnBpcGUgSE9MTEVSSVRILiR1cmxfZnJvbV9rZXkgZGJcbiAgICAgIC5waXBlICQgKCBbIGtleSwgdmFsdWUsIF0sIHNlbmQgKSA9PlxuICAgICAgICBpZHggKz0gKzFcbiAgICAgICAgIyBULmVxIGtleSwgbWF0Y2hlcnNbIGlkeCBdXG4gICAgICAucGlwZSBELiRvbl9lbmQgPT4gZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZWFkIGtleXMgd2l0aG91dCBlcnJvciAoMSlcIiBdID0gKCBULCBkb25lICkgLT5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgSE9MTEVSSVRILmNsZWFyIGRiLCByZXN1bWVcbiAgICAjIyMgVEFJTlQgYXdhaXRpbmcgYmV0dGVyIHNvbHV0aW9uICMjI1xuICAgIE5VTEwgPSBIT0xMRVJJVEguX2VuY29kZV92YWx1ZSBkYiwgMVxuICAgIGZvciBpZHggaW4gWyAwIC4uLiAxMCBdXG4gICAgICBkYlsgJyVzZWxmJyBdLnB1dCAoIEhPTExFUklUSC5fZW5jb2RlX2tleSBkYiwgWyAneCcsIGlkeCwgJ3gnLCBdICksIE5VTExcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHByb2JlX2lkeCA9IDRcbiAgICBjb3VudCAgICAgPSAwXG4gICAgcXVlcnkgICAgID0gSE9MTEVSSVRILl9xdWVyeV9mcm9tX3ByZWZpeCBkYiwgWyAneCcsIHByb2JlX2lkeCwgXVxuICAgIGlucHV0ICAgICA9IGRiWyAnJXNlbGYnIF0uY3JlYXRlUmVhZFN0cmVhbSBxdWVyeVxuICAgIGlucHV0XG4gICAgICAucGlwZSAkICggeyBrZXksIHZhbHVlLCB9LCBzZW5kICkgPT5cbiAgICAgICAgY291bnQgKz0gMVxuICAgICAgICBULmVxICggSE9MTEVSSVRILl9kZWNvZGVfa2V5IGRiLCBrZXkgKVsgMSBdLCBwcm9iZV9pZHhcbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICBULmVxIGNvdW50LCAxXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCBrZXlzIHdpdGhvdXQgZXJyb3IgKDIpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEhPTExFUklUSC5jbGVhciBkYiwgcmVzdW1lXG4gICAgIyMjIFRBSU5UIGF3YWl0aW5nIGJldHRlciBzb2x1dGlvbiAjIyNcbiAgICBOVUxMID0gSE9MTEVSSVRILl9lbmNvZGVfdmFsdWUgZGIsIDFcbiAgICBmb3IgaWR4IGluIFsgMCAuLi4gMTAgXVxuICAgICAgZGJbICclc2VsZicgXS5wdXQgKCBIT0xMRVJJVEguX2VuY29kZV9rZXkgZGIsIFsgJ3gnLCBpZHgsICd4JywgXSApLCBOVUxMXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwcm9iZV9pZHggPSA0XG4gICAgY291bnQgICAgID0gMFxuICAgIHByZWZpeCAgICA9IFsgJ3gnLCBwcm9iZV9pZHgsIF1cbiAgICBpbnB1dCAgICAgPSBIT0xMRVJJVEguY3JlYXRlX2ZhY2V0c3RyZWFtIGRiLCBwcmVmaXhcbiAgICBpbnB1dFxuICAgICAgLnBpcGUgJCAoIGZhY2V0LCBzZW5kICkgPT5cbiAgICAgICAgY291bnQgKz0gMVxuICAgICAgICBbIGtleSwgdmFsdWUsIF0gPSBmYWNldFxuICAgICAgICBULmVxIGtleVsgMSBdLCBwcm9iZV9pZHhcbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICBULmVxIGNvdW50LCAxXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCBrZXlzIHdpdGhvdXQgZXJyb3IgKDMpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEhPTExFUklUSC5jbGVhciBkYiwgcmVzdW1lXG4gICAgIyMjIFRBSU5UIGF3YWl0aW5nIGJldHRlciBzb2x1dGlvbiAjIyNcbiAgICBOVUxMID0gSE9MTEVSSVRILl9lbmNvZGVfdmFsdWUgZGIsIDFcbiAgICBmb3IgaWR4IGluIFsgMCAuLi4gMTAgXVxuICAgICAgZGJbICclc2VsZicgXS5wdXQgKCBIT0xMRVJJVEguX2VuY29kZV9rZXkgZGIsIFsgJ3gnLCBpZHgsICd4JywgXSApLCBOVUxMXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwcm9iZV9pZHggPSAzXG4gICAgY291bnQgICAgID0gMFxuICAgIGRlbHRhICAgICA9IDJcbiAgICBsbyAgICAgICAgPSBbICd4JywgcHJvYmVfaWR4LCBdXG4gICAgaGkgICAgICAgID0gWyAneCcsIHByb2JlX2lkeCArIGRlbHRhLCBdXG4gICAgcXVlcnkgICAgID0geyBndGU6ICggSE9MTEVSSVRILl9lbmNvZGVfa2V5IGRiLCBsbyApLCBsdGU6ICggSE9MTEVSSVRILl9xdWVyeV9mcm9tX3ByZWZpeCBkYiwgaGkgKVsgJ2x0ZScgXSwgfVxuICAgIGlucHV0ICAgICA9IGRiWyAnJXNlbGYnIF0uY3JlYXRlUmVhZFN0cmVhbSBxdWVyeVxuICAgIGlucHV0XG4gICAgICAucGlwZSAkICggeyBrZXksIHZhbHVlLCB9LCBzZW5kICkgPT5cbiAgICAgICAgY291bnQgKz0gMVxuICAgICAgICBULmVxICggSE9MTEVSSVRILl9kZWNvZGVfa2V5IGRiLCBrZXkgKVsgMSBdLCBwcm9iZV9pZHggKyBjb3VudCAtIDFcbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICBULmVxIGNvdW50LCBkZWx0YSArIDFcbiAgICAgICAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZWFkIGtleXMgd2l0aG91dCBlcnJvciAoNClcIiBdID0gKCBULCBkb25lICkgLT5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgSE9MTEVSSVRILmNsZWFyIGRiLCByZXN1bWVcbiAgICBmb3IgaWR4IGluIFsgMCAuLi4gMTAgXVxuICAgICAgZGJbICclc2VsZicgXS5wdXQgKCBIT0xMRVJJVEguX2VuY29kZV9rZXkgZGIsIFsgJ3gnLCBpZHgsICd4JywgXSApLCBIT0xMRVJJVEguX2VuY29kZV92YWx1ZSBkYiwgMVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcHJvYmVfaWR4ID0gM1xuICAgIGNvdW50ICAgICA9IDBcbiAgICBkZWx0YSAgICAgPSAyXG4gICAgbG8gICAgICAgID0gWyAneCcsIHByb2JlX2lkeCwgXVxuICAgIGhpICAgICAgICA9IFsgJ3gnLCBwcm9iZV9pZHggKyBkZWx0YSwgXVxuICAgIGlucHV0ICAgICA9IEhPTExFUklUSC5jcmVhdGVfZmFjZXRzdHJlYW0gZGIsIGxvLCBoaVxuICAgIGlucHV0XG4gICAgICAucGlwZSAkICggWyBrZXksIHZhbHVlLCBdLCBzZW5kICkgPT5cbiAgICAgICAgY291bnQgKz0gMVxuICAgICAgICBULmVxIGtleVsgMSBdLCBwcm9iZV9pZHggKyBjb3VudCAtIDFcbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICBULmVxIGNvdW50LCBkZWx0YSArIDFcbiAgICAgICAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJjcmVhdGVfZmFjZXRzdHJlYW0gdGhyb3dzIHdpdGggd3JvbmcgYXJndW1lbnRzXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIG1lc3NhZ2UgPSBcIm11c3QgZ2l2ZSBgbG9faGludGAgd2hlbiBgaGlfaGludGAgaXMgZ2l2ZW5cIlxuICBULnRocm93cyBtZXNzYWdlLCAoIC0+IEhPTExFUklUSC5jcmVhdGVfZmFjZXRzdHJlYW0gZGIsIG51bGwsIFsgJ3h4eCcsIF0gKVxuICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgUE9TIGZhY2V0c1wiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ICAgICAgICAgPSAtMVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGtleV9tYXRjaGVycyA9IFtcbiAgICBbICdwb3MnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDIsICfwp7efMicgXVxuICAgIFsgJ3BvcycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgMywgJ/Cnt58zJyBdXG4gICAgWyAncG9zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCA0LCAn8Ke3nzQnIF1cbiAgICBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcGhyYXNlX21hdGNoZXJzID0gW1xuICAgIFsgJ3BvcycsICfwp7efMicsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgMiBdXG4gICAgWyAncG9zJywgJ/Cnt58zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAzIF1cbiAgICBbICdwb3MnLCAn8Ke3nzQnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDQgXVxuICAgIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBAX2ZlZWRfdGVzdF9kYXRhIGRiLCBwcm9iZXNfaWR4LCByZXN1bWVcbiAgICBsbyA9IFsgJ3BvcycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgMiwgXVxuICAgIGhpID0gWyAncG9zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCA0LCBdXG4gICAgIyBpbnB1dCAgID0gSE9MTEVSSVRILmNyZWF0ZV9rZXlzdHJlYW0gZGIsIGxvXG4gICAgaW5wdXQgICA9IEhPTExFUklUSC5jcmVhdGVfZmFjZXRzdHJlYW0gZGIsIGxvLCBoaVxuICAgIGlucHV0XG4gICAgICAjIC5waXBlIEhPTExFUklUSC4kdXJsX2Zyb21fa2V5IGRiXG4gICAgICAucGlwZSAkICggWyBrZXksIHZhbHVlLCBdLCBzZW5kICkgPT5cbiAgICAgICAgaWR4ICs9ICsxXG4gICAgICAgIHBocmFzZSA9IEhPTExFUklUSC5hc19waHJhc2UgZGIsIGtleSwgdmFsdWVcbiAgICAgICAgVC5lcSBrZXksIGtleV9tYXRjaGVyc1sgaWR4IF1cbiAgICAgICAgVC5lcSBwaHJhc2UsIHBocmFzZV9tYXRjaGVyc1sgaWR4IF1cbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PiBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgUE9TIHBocmFzZXMgKDEpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHByb2Jlc19pZHggID0gMFxuICBpZHggICAgICAgICA9IC0xXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgbWF0Y2hlcnMgPSBbXG4gICAgWyAncG9zJywgJ/Cnt58yJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAyIF1cbiAgICBbICdwb3MnLCAn8Ke3nzMnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDMgXVxuICAgIFsgJ3BvcycsICfwp7efNCcsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgNCBdXG4gICAgXVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHJlc3VtZVxuICAgIGxvID0gWyAncG9zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAyLCBdXG4gICAgaGkgPSBbICdwb3MnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDQsIF1cbiAgICBpbnB1dCAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIGxvLCBoaVxuICAgIGlucHV0XG4gICAgICAucGlwZSAkICggcGhyYXNlLCBzZW5kICkgPT5cbiAgICAgICAgaWR4ICs9ICsxXG4gICAgICAgIFQuZXEgcGhyYXNlLCBtYXRjaGVyc1sgaWR4IF1cbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PiBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgUE9TIHBocmFzZXMgKDIpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHByb2Jlc19pZHggID0gMFxuICBpZHggICAgICAgICA9IC0xXG4gIGNvdW50ICAgICAgID0gMFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIG1hdGNoZXJzID0gW1xuICAgIFsgJ3BvcycsICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgJ+WFqycsIDAgXVxuICAgIFsgJ3BvcycsICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgJ+WIgCcsIDEgXVxuICAgIFsgJ3BvcycsICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgJ+WugCcsIDIgXVxuICAgIFsgJ3BvcycsICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgJ+iynScsIDQgXVxuICAgIFsgJ3BvcycsICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgJ+6HuicsIDMgXVxuICAgIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBAX2ZlZWRfdGVzdF9kYXRhIGRiLCBwcm9iZXNfaWR4LCByZXN1bWVcbiAgICBwcmVmaXggICAgPSBbICdwb3MnLCAnZ3VpZGUvdWNoci9oYXMnLCBdXG4gICAgaW5wdXQgICAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIHByZWZpeFxuICAgIHNldHRpbmdzICA9IHsgaW5kZXhlZDogbm8sIH1cbiAgICBpbnB1dFxuICAgICAgLnBpcGUgJCAoIHBocmFzZSwgc2VuZCApID0+XG4gICAgICAgIGRlYnVnICfCqURzQWZZJywgcnByIHBocmFzZVxuICAgICAgICBjb3VudCAgKz0gKzFcbiAgICAgICAgaWR4ICAgICs9ICsxXG4gICAgICAgIFQuZXEgcGhyYXNlLCBtYXRjaGVyc1sgaWR4IF1cbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICBULmVxIGNvdW50LCBtYXRjaGVycy5sZW5ndGhcbiAgICAgICAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZWFkIFNQTyBwaHJhc2VzXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIGRlYnVnICfCqVJzb3hiJywgZGJbICclc2VsZicgXS5pc09wZW4oKVxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ICAgICAgICAgPSAtMVxuICBjb3VudCAgICAgICA9IDBcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBtYXRjaGVycyA9IFtcbiAgICBbICdzcG8nLCAn8Ke3nycsICdjcC9jaWQnLCAxNjMyOTUgXVxuICAgIFsgJ3NwbycsICfwp7efJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCA1IF1cbiAgICBbICdzcG8nLCAn8Ke3nycsICdndWlkZS91Y2hyL2hhcycsIFsgJ+WFqycsICfliIAnLCAn5a6AJywgJ+6HuicsICfosp0nIF0gXVxuICAgIFsgJ3NwbycsICfwp7efJywgJ3JhbmsvY2p0JywgNTQzMiBdXG4gICAgXVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHJlc3VtZVxuICAgIHByZWZpeCAgPSBbICdzcG8nLCAn8Ke3nycsIF1cbiAgICBpbnB1dCAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIHByZWZpeFxuICAgIGlucHV0XG4gICAgICAucGlwZSAkICggcGhyYXNlLCBzZW5kICkgPT5cbiAgICAgICAgZGVidWcgJ8KpRHNBZlknLCBycHIgcGhyYXNlXG4gICAgICAgIGNvdW50ICArPSArMVxuICAgICAgICBpZHggICAgKz0gKzFcbiAgICAgICAgVC5lcSBwaHJhc2UsIG1hdGNoZXJzWyBpZHggXVxuICAgICAgLnBpcGUgRC4kb25fZW5kID0+XG4gICAgICAgIFQuZXEgY291bnQsIG1hdGNoZXJzLmxlbmd0aFxuICAgICAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgd2l0aCBzdWItcmVhZCAoMSlcIiBdID0gKCBULCBkb25lICkgLT5cbiAgcHJvYmVzX2lkeCAgPSAwXG4gIGlkeCAgICAgICAgID0gLTFcbiAgY291bnQgICAgICAgPSAwXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgbWF0Y2hlcnMgPSBbXG4gICAgWyAn8Ke3nycsIFsgJ3NwbycsICflhasnLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICczNCcgXSBdXG4gICAgXVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHJlc3VtZVxuICAgIHByZWZpeCAgICA9IFsgJ3NwbycsICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgXVxuICAgIGlucHV0ICAgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBwcmVmaXhcbiAgICBzZXR0aW5ncyAgPSB7IGluZGV4ZWQ6IG5vLCB9XG4gICAgaW5wdXRcbiAgICAgIC5waXBlIEhPTExFUklUSC5yZWFkX3N1YiBkYiwgc2V0dGluZ3MsICggWyBwaHJhc2V0eXBlLCBnbHlwaCwgcHJkLCBndWlkZXMsIF0gKSA9PlxuICAgICAgICBzdWJfaW5wdXQgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgWyAnc3BvJywgZ3VpZGVzWyAwIF0sICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgXVxuICAgICAgICByZXR1cm4gWyBnbHlwaCwgc3ViX2lucHV0LCBdXG4gICAgICAucGlwZSAkICggcGhyYXNlLCBzZW5kICkgPT5cbiAgICAgICAgY291bnQgICs9ICsxXG4gICAgICAgIGlkeCAgICArPSArMVxuICAgICAgICBULmVxIHBocmFzZSwgbWF0Y2hlcnNbIGlkeCBdXG4gICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgVC5lcSBjb3VudCwgbWF0Y2hlcnMubGVuZ3RoXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCB3aXRoIHN1Yi1yZWFkICgyKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ICAgICAgICAgPSAtMVxuICBjb3VudCAgICAgICA9IDBcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBtYXRjaGVycyA9IFtcbiAgICBbICfwp7efJywgWyAnc3BvJywgJ+WFqycsICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgJzM0JyBdIF1cbiAgICBbICfwp7efJywgWyAnc3BvJywgJ+WIgCcsICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgJzUoMTIpMycgXSBdXG4gICAgWyAn8Ke3nycsIFsgJ3NwbycsICflroAnLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICc0NCcgXSBdXG4gICAgWyAn8Ke3nycsIFsgJ3NwbycsICfosp0nLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICcyNSgxMiknIF0gXVxuICAgIFsgJ/Cnt58nLCBbICdzcG8nLCAn7oe6JywgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCAnMTInIF0gXVxuICAgIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBAX2ZlZWRfdGVzdF9kYXRhIGRiLCBwcm9iZXNfaWR4LCByZXN1bWVcbiAgICBwcmVmaXggICAgPSBbICdwb3MnLCAnZ3VpZGUvdWNoci9oYXMnLCBdXG4gICAgaW5wdXQgICAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIHByZWZpeFxuICAgIHNldHRpbmdzICA9IHsgaW5kZXhlZDogbm8sIH1cbiAgICBpbnB1dFxuICAgICAgLnBpcGUgSE9MTEVSSVRILnJlYWRfc3ViIGRiLCBzZXR0aW5ncywgKCBwaHJhc2UgKSA9PlxuICAgICAgICBbIF8sIGdseXBoLCBwcmQsIGd1aWRlLCBdID0gcGhyYXNlXG4gICAgICAgIHByZWZpeCAgICAgICAgICAgICAgICAgICAgPSBbICdzcG8nLCBndWlkZSwgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCBdXG4gICAgICAgIHN1Yl9pbnB1dCAgICAgICAgICAgICAgICAgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgcHJlZml4XG4gICAgICAgIHJldHVybiBbIGdseXBoLCBzdWJfaW5wdXQsIF1cbiAgICAgIC5waXBlICQgKCBwaHJhc2UsIHNlbmQgKSA9PlxuICAgICAgICBkZWJ1ZyAnwqlxdVBiZycsIEpTT04uc3RyaW5naWZ5IHBocmFzZVxuICAgICAgICBjb3VudCAgKz0gKzFcbiAgICAgICAgaWR4ICAgICs9ICsxXG4gICAgICAgIFQuZXEgcGhyYXNlLCBtYXRjaGVyc1sgaWR4IF1cbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICBULmVxIGNvdW50LCBtYXRjaGVycy5sZW5ndGhcbiAgICAgICAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZWFkIHdpdGggc3ViLXJlYWQgKDMpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEBfcmVhZF93aXRoX3N1Yl9yZWFkXzMgVCwgYmF0Y2g6IDAsICAgIHJlc3VtZVxuICAgIHlpZWxkIEBfcmVhZF93aXRoX3N1Yl9yZWFkXzMgVCwgYmF0Y2g6IDMsICAgIHJlc3VtZVxuICAgIHlpZWxkIEBfcmVhZF93aXRoX3N1Yl9yZWFkXzMgVCwgYmF0Y2g6IDUsICAgIHJlc3VtZVxuICAgIHlpZWxkIEBfcmVhZF93aXRoX3N1Yl9yZWFkXzMgVCwgYmF0Y2g6IDEwMDAsIHJlc3VtZVxuICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfcmVhZF93aXRoX3N1Yl9yZWFkXzMgPSAoIFQsIHdyaXRlX3NldHRpbmdzLCBkb25lICkgLT5cbiAgcHJvYmVzX2lkeCAgPSAwXG4gIGlkeCAgICAgICAgID0gLTFcbiAgY291bnQgICAgICAgPSAwXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgbWF0Y2hlcnMgPSBbXG4gICAgW1tcIvCnt59cIixcIuWFq1wiLFwiMzRcIl0sICAgICAgW1wic3BvXCIsXCLlhatcIixcInJhbmsvY2p0XCIsMTI1NDFdXVxuICAgIFtbXCLwp7efXCIsXCLliIBcIixcIjUoMTIpM1wiXSwgIFtcInNwb1wiLFwi5YiAXCIsXCJyYW5rL2NqdFwiLDEyNTQyXV1cbiAgICBbW1wi8Ke3n1wiLFwi5a6AXCIsXCI0NFwiXSwgICAgICBbXCJzcG9cIixcIuWugFwiLFwicmFuay9janRcIiwxMjU0M11dXG4gICAgW1tcIvCnt59cIixcIuiynVwiLFwiMjUoMTIpXCJdLCAgW1wic3BvXCIsXCLosp1cIixcInJhbmsvY2p0XCIsMTI1NDVdXVxuICAgIFtbXCLwp7efXCIsXCLuh7pcIixcIjEyXCJdLCAgICAgIFtcInNwb1wiLFwi7oe6XCIsXCJyYW5rL2NqdFwiLDEyNTQ0XV1cbiAgICBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgQF9mZWVkX3Rlc3RfZGF0YSBkYiwgcHJvYmVzX2lkeCwgd3JpdGVfc2V0dGluZ3MsIHJlc3VtZVxuICAgIHByZWZpeCAgICAgICAgPSBbICdwb3MnLCAnZ3VpZGUvdWNoci9oYXMnLCBdXG4gICAgaW5wdXQgICAgICAgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBwcmVmaXhcbiAgICByZWFkX3NldHRpbmdzID0geyBpbmRleGVkOiBubywgfVxuICAgIGlucHV0XG4gICAgICAucGlwZSBIT0xMRVJJVEgucmVhZF9zdWIgZGIsIHJlYWRfc2V0dGluZ3MsICggcGhyYXNlICkgPT5cbiAgICAgICAgWyBfLCBnbHlwaCwgcHJkLCBndWlkZSwgXSA9IHBocmFzZVxuICAgICAgICBwcmVmaXggICAgICAgICAgICAgICAgICAgID0gWyAnc3BvJywgZ3VpZGUsICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgXVxuICAgICAgICBzdWJfaW5wdXQgICAgICAgICAgICAgICAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIHByZWZpeFxuICAgICAgICByZXR1cm4gWyBnbHlwaCwgc3ViX2lucHV0LCBdXG4gICAgICAucGlwZSBIT0xMRVJJVEgucmVhZF9zdWIgZGIsIHJlYWRfc2V0dGluZ3MsICggeHBocmFzZSApID0+XG4gICAgICAgIFsgZ2x5cGgsIFsgXywgZ3VpZGUsIHByZCwgc2hhcGVjbGFzcywgXSBdID0geHBocmFzZVxuICAgICAgICBwcmVmaXggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFsgJ3NwbycsIGd1aWRlLCAncmFuay9janQnLCBdXG4gICAgICAgIHN1Yl9pbnB1dCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIHByZWZpeFxuICAgICAgICByZXR1cm4gWyBbIGdseXBoLCBndWlkZSwgc2hhcGVjbGFzcywgXSwgc3ViX2lucHV0LCBdXG4gICAgICAucGlwZSAkICggeHBocmFzZSwgc2VuZCApID0+XG4gICAgICAgIGRlYnVnICfCqXF1UGJnJywgSlNPTi5zdHJpbmdpZnkgeHBocmFzZVxuICAgICAgICBjb3VudCAgKz0gKzFcbiAgICAgICAgaWR4ICAgICs9ICsxXG4gICAgICAgIFQuZXEgeHBocmFzZSwgbWF0Y2hlcnNbIGlkeCBdXG4gICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgVC5lcSBjb3VudCwgbWF0Y2hlcnMubGVuZ3RoXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwic29ydGluZyAoMSlcIiBdID0gKCBULCBkb25lICkgLT5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgc2V0dGluZ3MgPVxuICAgICAgZGI6ICAgICAgICAgICBsZXZlbGRvd25cbiAgICAgIGtleUVuY29kaW5nOiAgJ2JpbmFyeSdcbiAgICBsZXZlbGRiID0gbGV2ZWx1cCAnL3RtcC9ob2xsZXJpdGgyLXRlc3QnLCBzZXR0aW5nc1xuICAgIHlpZWxkIGNsZWFyX2xldmVsZGIgbGV2ZWxkYiwgcmVzdW1lXG4gICAgcHJvYmVzID0gW1xuICAgICAgJ2EnXG4gICAgICAnYWInXG4gICAgICAnYWJjJ1xuICAgICAgJ2FiY1xceDAwJ1xuICAgICAgJ2FiY1xceDAwYSdcbiAgICAgICdhYmNhJ1xuICAgICAgJ2FiY2InXG4gICAgICAnYWJjYydcbiAgICAgICdhYmNkJ1xuICAgICAgJ2FiY2RlJ1xuICAgICAgJ2FiY2RlZidcbiAgICAgICdhYmNkZWZnJyBdXG4gICAgbWF0Y2hlcnMgPSBbXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIDB4NjIsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCAweDYyLCAweDYzLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgMHg2MiwgMHg2MywgMHgwMCwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIDB4NjIsIDB4NjMsIDB4MDAsIDB4NjEsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCAweDYyLCAweDYzLCAweDYxLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgMHg2MiwgMHg2MywgMHg2MiwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIDB4NjIsIDB4NjMsIDB4NjMsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCAweDYyLCAweDYzLCAweDY0LCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgMHg2MiwgMHg2MywgMHg2NCwgMHg2NSwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIDB4NjIsIDB4NjMsIDB4NjQsIDB4NjUsIDB4NjYsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCAweDYyLCAweDYzLCAweDY0LCAweDY1LCAweDY2LCAweDY3LCBdIF1cbiAgICBDTkQuc2h1ZmZsZSBwcm9iZXNcbiAgICBmb3IgcHJvYmUgaW4gcHJvYmVzXG4gICAgICBwcm9iZV9iZnIgPSBuZXcgQnVmZmVyIHByb2JlLCAndXRmLTgnXG4gICAgICB5aWVsZCBsZXZlbGRiLnB1dCBwcm9iZV9iZnIsICcxJywgcmVzdW1lXG4gICAgICBwcm9iZV9iZnJzID0geWllbGQgcmVhZF9hbGxfa2V5cyBsZXZlbGRiLCByZXN1bWVcbiAgICBwcm9iZV9iZnJzID0geWllbGQgcmVhZF9hbGxfa2V5cyBsZXZlbGRiLCByZXN1bWVcbiAgICAjIGRlYnVnICfCqVJYUHZ2JywgJ1xcbicgKyBycHIgcHJvYmVfYmZyc1xuICAgIGZvciBwcm9iZV9iZnIsIHByb2JlX2lkeCBpbiBwcm9iZV9iZnJzXG4gICAgICBtYXRjaGVyID0gbWF0Y2hlcnNbIHByb2JlX2lkeCBdXG4gICAgICAjIyMgVEFJTlQgbG9va3MgbGlrZSBgVC5lcSBidWZmZXIxLCBidWZmZXIyYCBkb2Vzbid0IHdvcmstLS1zb21ldGltZXMuLi4gIyMjXG4gICAgICAjIFQuZXEgcHJvYmVfYmZyLCBtYXRjaGVyXG4gICAgICBULm9rIHByb2JlX2Jmci5lcXVhbHMgbWF0Y2hlclxuICAgIGxldmVsZGIuY2xvc2UgLT4gZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJzb3J0aW5nICgyKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICAjIyMgVGhpcyB0ZXN0IGlzIGhlcmUgYmVjYXVzZSB0aGVyZSBzZWVtZWQgdG8gb2NjdXIgc29tZSBzdHJhbmdlIG9yZGVyaW5nIGlzc3VlcyB3aGVuXG4gIHVzaW5nIG1lbWRvd24gaW5zdGVhZCBvZiBsZXZlbGRvd24gIyMjXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHNldHRpbmdzID1cbiAgICAgIGRiOiAgICAgICAgICAgbGV2ZWxkb3duXG4gICAgICBrZXlFbmNvZGluZzogICdiaW5hcnknXG4gICAgbGV2ZWxkYiA9IGxldmVsdXAgJy90bXAvaG9sbGVyaXRoMi10ZXN0Jywgc2V0dGluZ3NcbiAgICB5aWVsZCBjbGVhcl9sZXZlbGRiIGxldmVsZGIsIHJlc3VtZVxuICAgIHByb2JlcyA9IFtcbiAgICAgIG5ldyBCdWZmZXIgWyAweDAwLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHgwMSwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4MDIsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDAzLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHhmOSwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4ZmEsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweGZiLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHhmYywgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4ZmQsIF1cbiAgICAgIF1cbiAgICBtYXRjaGVycyA9ICggcHJvYmUgZm9yIHByb2JlIGluIHByb2JlcyApXG4gICAgQ05ELnNodWZmbGUgcHJvYmVzXG4gICAgZm9yIHByb2JlIGluIHByb2Jlc1xuICAgICAgeWllbGQgbGV2ZWxkYi5wdXQgcHJvYmUsICcxJywgcmVzdW1lXG4gICAgcHJvYmVfYmZycyA9IHlpZWxkIHJlYWRfYWxsX2tleXMgbGV2ZWxkYiwgcmVzdW1lXG4gICAgZm9yIHByb2JlX2JmciwgcHJvYmVfaWR4IGluIHByb2JlX2JmcnNcbiAgICAgIG1hdGNoZXIgPSBtYXRjaGVyc1sgcHJvYmVfaWR4IF1cbiAgICAgICMgZGVidWcgJ8KpMTUwNjAnLCBwcm9iZV9pZHgsIHByb2JlX2JmciwgbWF0Y2hlclxuICAgICAgIyMjIFRBSU5UIGxvb2tzIGxpa2UgYFQuZXEgYnVmZmVyMSwgYnVmZmVyMmAgZG9lc24ndCB3b3JrLS0tc29tZXRpbWVzLi4uICMjI1xuICAgICAgVC5vayBwcm9iZV9iZnIuZXF1YWxzIG1hdGNoZXJcbiAgICBsZXZlbGRiLmNsb3NlIC0+IGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwiSDIgY29kZWMgYGVuY29kZWAgdGhyb3dzIG9uIGFueXRoaW5nIGJ1dCBhIGxpc3RcIiBdID0gKCBULCBkb25lICkgLT5cbiAgVC50aHJvd3MgXCJleHBlY3RlZCBhIGxpc3QsIGdvdCBhIHRleHRcIiwgICAgICAgICAoIC0+IENPREVDLmVuY29kZSAndW5hY2NhcHRhYmxlJyApXG4gIFQudGhyb3dzIFwiZXhwZWN0ZWQgYSBsaXN0LCBnb3QgYSBudW1iZXJcIiwgICAgICAgKCAtPiBDT0RFQy5lbmNvZGUgNDIgKVxuICBULnRocm93cyBcImV4cGVjdGVkIGEgbGlzdCwgZ290IGEgYm9vbGVhblwiLCAgICAgICggLT4gQ09ERUMuZW5jb2RlIHRydWUgKVxuICBULnRocm93cyBcImV4cGVjdGVkIGEgbGlzdCwgZ290IGEgYm9vbGVhblwiLCAgICAgICggLT4gQ09ERUMuZW5jb2RlIGZhbHNlIClcbiAgVC50aHJvd3MgXCJleHBlY3RlZCBhIGxpc3QsIGdvdCBhIGpzdW5kZWZpbmVkXCIsICAoIC0+IENPREVDLmVuY29kZSgpIClcbiAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJzb3J0IHRleHRzIHdpdGggSDIgY29kZWMgKDEpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHNldHRpbmdzID1cbiAgICAgIGRiOiAgICAgICAgICAgbGV2ZWxkb3duXG4gICAgICBrZXlFbmNvZGluZzogICdiaW5hcnknXG4gICAgbGV2ZWxkYiA9IGxldmVsdXAgJy90bXAvaG9sbGVyaXRoMi10ZXN0Jywgc2V0dGluZ3NcbiAgICB5aWVsZCBjbGVhcl9sZXZlbGRiIGxldmVsZGIsIHJlc3VtZVxuICAgIHByb2JlcyA9IFtcbiAgICAgICdhJ1xuICAgICAgJ2FiJ1xuICAgICAgJ2FiYydcbiAgICAgICdhYmNcXHgwMCdcbiAgICAgICdhYmNcXHgwMGEnXG4gICAgICAnYWJjYSdcbiAgICAgICdhYmNhXFx4MDAnXG4gICAgICAnYWJjYidcbiAgICAgICdhYmNjJ1xuICAgICAgJ2FiY2QnXG4gICAgICAnYWJjZGUnXG4gICAgICAnYWJjZGVmJ1xuICAgICAgJ2FiY2RlZmcnXG4gICAgICBdXG4gICAgbWF0Y2hlcnMgPSAoIFsgcHJvYmUsIF0gZm9yIHByb2JlIGluIHByb2JlcyApXG4gICAgQ05ELnNodWZmbGUgcHJvYmVzXG4gICAgZm9yIHByb2JlIGluIHByb2Jlc1xuICAgICAgeWllbGQgbGV2ZWxkYi5wdXQgKCBDT0RFQy5lbmNvZGUgWyBwcm9iZSwgXSApLCAnMScsIHJlc3VtZVxuICAgIHByb2JlX2JmcnMgID0geWllbGQgcmVhZF9hbGxfa2V5cyBsZXZlbGRiLCByZXN1bWVcbiAgICBwcm9iZXMgICAgICA9ICggQ09ERUMuZGVjb2RlIHByb2JlX2JmciBmb3IgcHJvYmVfYmZyIGluIHByb2JlX2JmcnMgKVxuICAgIHNob3dfa2V5c19hbmRfa2V5X2JmcnMgcHJvYmVzLCBwcm9iZV9iZnJzXG4gICAgZm9yIHByb2JlLCBwcm9iZV9pZHggaW4gcHJvYmVzXG4gICAgICBtYXRjaGVyID0gbWF0Y2hlcnNbIHByb2JlX2lkeCBdXG4gICAgICBULmVxIHByb2JlLCBtYXRjaGVyXG4gICAgbGV2ZWxkYi5jbG9zZSAtPiBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInNvcnQgdGV4dHMgd2l0aCBIMiBjb2RlYyAoMilcIiBdID0gKCBULCBkb25lICkgLT5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgc2V0dGluZ3MgPVxuICAgICAgZGI6ICAgICAgICAgICBsZXZlbGRvd25cbiAgICAgIGtleUVuY29kaW5nOiAgJ2JpbmFyeSdcbiAgICBsZXZlbGRiID0gbGV2ZWx1cCAnL3RtcC9ob2xsZXJpdGgyLXRlc3QnLCBzZXR0aW5nc1xuICAgIHlpZWxkIGNsZWFyX2xldmVsZGIgbGV2ZWxkYiwgcmVzdW1lXG4gICAgcHJvYmVzID0gW1xuICAgICAgJydcbiAgICAgICcgJ1xuICAgICAgJ2EnXG4gICAgICAnYWJjJ1xuICAgICAgJ+S4gCdcbiAgICAgICfkuIDkuownXG4gICAgICAn5LiA5LqM5LiJJ1xuICAgICAgJ+S4iSdcbiAgICAgICfkuownXG4gICAgICAn8KCAgCdcbiAgICAgICfwoICAXFx4MDAnXG4gICAgICAn8KCAgGEnXG4gICAgICAn8KqcgCdcbiAgICAgICfwq52AJ1xuICAgICAgU3RyaW5nLmZyb21Db2RlUG9pbnQgMHgxMGZmZmZcbiAgICAgIF1cbiAgICBtYXRjaGVycyA9ICggWyBwcm9iZSwgXSBmb3IgcHJvYmUgaW4gcHJvYmVzIClcbiAgICBDTkQuc2h1ZmZsZSBwcm9iZXNcbiAgICBmb3IgcHJvYmUgaW4gcHJvYmVzXG4gICAgICBwcm9iZV9iZnIgPSBDT0RFQy5lbmNvZGUgWyBwcm9iZSwgXVxuICAgICAgeWllbGQgbGV2ZWxkYi5wdXQgcHJvYmVfYmZyLCAnMScsIHJlc3VtZVxuICAgIHByb2JlX2JmcnMgID0geWllbGQgcmVhZF9hbGxfa2V5cyBsZXZlbGRiLCByZXN1bWVcbiAgICAjIGRlYnVnICfCqUZkNWl3JywgcHJvYmVfYmZyc1xuICAgIHByb2JlcyAgICAgID0gKCBDT0RFQy5kZWNvZGUgcHJvYmVfYmZyIGZvciBwcm9iZV9iZnIgaW4gcHJvYmVfYmZycyApXG4gICAgc2hvd19rZXlzX2FuZF9rZXlfYmZycyBwcm9iZXMsIHByb2JlX2JmcnNcbiAgICBmb3IgcHJvYmUsIHByb2JlX2lkeCBpbiBwcm9iZXNcbiAgICAgIG1hdGNoZXIgPSBtYXRjaGVyc1sgcHJvYmVfaWR4IF1cbiAgICAgIFQuZXEgcHJvYmUsIG1hdGNoZXJcbiAgICBsZXZlbGRiLmNsb3NlIC0+IGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwic29ydCBudW1iZXJzIHdpdGggSDIgY29kZWMgKDEpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHNldHRpbmdzID1cbiAgICAgIGRiOiAgICAgICAgICAgbGV2ZWxkb3duXG4gICAgICBrZXlFbmNvZGluZzogICdiaW5hcnknXG4gICAgbGV2ZWxkYiA9IGxldmVsdXAgJy90bXAvaG9sbGVyaXRoMi10ZXN0Jywgc2V0dGluZ3NcbiAgICB5aWVsZCBjbGVhcl9sZXZlbGRiIGxldmVsZGIsIHJlc3VtZVxuICAgIHByb2Jlc19hbmRfZGVzY3JpcHRpb25zID0gW1xuICAgICAgWyAtSW5maW5pdHksICAgICAgICAgICAgICAgXCItSW5maW5pdHlcIiAgICAgICAgICAgICAgIF1cbiAgICAgIFsgLU51bWJlci5NQVhfVkFMVUUsICAgICAgIFwiLU51bWJlci5NQVhfVkFMVUVcIiAgICAgICBdXG4gICAgICBbIE51bWJlci5NSU5fU0FGRV9JTlRFR0VSLCBcIk51bWJlci5NSU5fU0FGRV9JTlRFR0VSXCIgXVxuICAgICAgWyAtMTIzNDU2Nzg5LCAgICAgICAgICAgICAgXCItMTIzNDU2Nzg5XCIgICAgICAgICAgICAgIF1cbiAgICAgIFsgLTMsICAgICAgICAgICAgICAgICAgICAgIFwiLTNcIiAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICBbIC0yLCAgICAgICAgICAgICAgICAgICAgICBcIi0yXCIgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgWyAtMS41LCAgICAgICAgICAgICAgICAgICAgXCItMS41XCIgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgIFsgLTEsICAgICAgICAgICAgICAgICAgICAgIFwiLTFcIiAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICBbIC1OdW1iZXIuRVBTSUxPTiwgICAgICAgICBcIi1OdW1iZXIuRVBTSUxPTlwiICAgICAgICAgXVxuICAgICAgWyAtTnVtYmVyLk1JTl9WQUxVRSwgICAgICAgXCItTnVtYmVyLk1JTl9WQUxVRVwiICAgICAgIF1cbiAgICAgIFsgMCwgICAgICAgICAgICAgICAgICAgICAgIFwiMFwiICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICBbICtOdW1iZXIuTUlOX1ZBTFVFLCAgICAgICBcIitOdW1iZXIuTUlOX1ZBTFVFXCIgICAgICAgXVxuICAgICAgWyArTnVtYmVyLkVQU0lMT04sICAgICAgICAgXCIrTnVtYmVyLkVQU0lMT05cIiAgICAgICAgIF1cbiAgICAgIFsgKzEsICAgICAgICAgICAgICAgICAgICAgIFwiKzFcIiAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICBbICsxLjUsICAgICAgICAgICAgICAgICAgICBcIisxLjVcIiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgWyArMiwgICAgICAgICAgICAgICAgICAgICAgXCIrMlwiICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgIFsgKzMsICAgICAgICAgICAgICAgICAgICAgIFwiKzNcIiAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICBbICsxMjM0NTY3ODksICAgICAgICAgICAgICBcIisxMjM0NTY3ODlcIiAgICAgICAgICAgICAgXVxuICAgICAgWyBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUiwgXCJOdW1iZXIuTUFYX1NBRkVfSU5URUdFUlwiIF1cbiAgICAgIFsgTnVtYmVyLk1BWF9WQUxVRSwgICAgICAgIFwiTnVtYmVyLk1BWF9WQUxVRVwiICAgICAgICBdXG4gICAgICBbICtJbmZpbml0eSwgICAgICAgICAgICAgICBcIitJbmZpbml0eVwiICAgICAgICAgICAgICAgXVxuICAgICAgXVxuICAgICMgcHJvYmVzX2FuZF9kZXNjcmlwdGlvbnMuc29ydCAoIGEsIGIgKSAtPlxuICAgICMgICByZXR1cm4gKzEgaWYgYVsgMCBdID4gYlsgMCBdXG4gICAgIyAgIHJldHVybiAtMSBpZiBhWyAwIF0gPCBiWyAwIF1cbiAgICAjICAgcmV0dXJuICAwXG4gICAgbWF0Y2hlcnMgICAgICA9ICggWyBwYWRbIDAgXSwgXSBmb3IgcGFkIGluIHByb2Jlc19hbmRfZGVzY3JpcHRpb25zIClcbiAgICAjIGRlc2NyaXB0aW9ucyAgPSAoIFsgcGFkWyAxIF0sIF0gZm9yIHBhZCBpbiBwcm9iZXNfYW5kX2Rlc2NyaXB0aW9ucyApXG4gICAgZm9yIHBhZCBpbiBwcm9iZXNfYW5kX2Rlc2NyaXB0aW9uc1xuICAgICAgdXJnZSBwYWRcbiAgICBDTkQuc2h1ZmZsZSBwcm9iZXNfYW5kX2Rlc2NyaXB0aW9uc1xuICAgIGZvciBbIHByb2JlLCBfLCBdIGluIHByb2Jlc19hbmRfZGVzY3JpcHRpb25zXG4gICAgICBwcm9iZV9iZnIgPSBDT0RFQy5lbmNvZGUgWyBwcm9iZSwgXVxuICAgICAgeWllbGQgbGV2ZWxkYi5wdXQgcHJvYmVfYmZyLCAnMScsIHJlc3VtZVxuICAgIHByb2JlX2JmcnMgID0geWllbGQgcmVhZF9hbGxfa2V5cyBsZXZlbGRiLCByZXN1bWVcbiAgICBwcm9iZXMgICAgICA9ICggQ09ERUMuZGVjb2RlIHByb2JlX2JmciBmb3IgcHJvYmVfYmZyIGluIHByb2JlX2JmcnMgKVxuICAgIHNob3dfa2V5c19hbmRfa2V5X2JmcnMgcHJvYmVzLCBwcm9iZV9iZnJzXG4gICAgZm9yIHByb2JlLCBwcm9iZV9pZHggaW4gcHJvYmVzXG4gICAgICBtYXRjaGVyID0gbWF0Y2hlcnNbIHByb2JlX2lkeCBdXG4gICAgICBULmVxIHByb2JlLCBtYXRjaGVyXG4gICAgbGV2ZWxkYi5jbG9zZSAtPiBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInNvcnQgbWl4ZWQgdmFsdWVzIHdpdGggSDIgY29kZWNcIiBdID0gKCBULCBkb25lICkgLT5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgc2V0dGluZ3MgPVxuICAgICAgZGI6ICAgICAgICAgICBsZXZlbGRvd25cbiAgICAgIGtleUVuY29kaW5nOiAgJ2JpbmFyeSdcbiAgICBsZXZlbGRiID0gbGV2ZWx1cCAnL3RtcC9ob2xsZXJpdGgyLXRlc3QnLCBzZXR0aW5nc1xuICAgIHlpZWxkIGNsZWFyX2xldmVsZGIgbGV2ZWxkYiwgcmVzdW1lXG4gICAgcHJvYmVzID0gW1xuICAgICAgbnVsbFxuICAgICAgZmFsc2VcbiAgICAgIHRydWVcbiAgICAgIENPREVDWyAnc2VudGluZWxzJyBdWyAnZmlyc3RkYXRlJyBdXG4gICAgICBuZXcgRGF0ZSAwXG4gICAgICBuZXcgRGF0ZSA4ZTExXG4gICAgICBuZXcgRGF0ZSgpXG4gICAgICBDT0RFQ1sgJ3NlbnRpbmVscycgXVsgJ2xhc3RkYXRlJyAgXVxuICAgICAgMTIzNFxuICAgICAgSW5maW5pdHlcbiAgICAgICcnXG4gICAgICAn5LiAJ1xuICAgICAgJ+S4iSdcbiAgICAgICfkuownXG4gICAgICAn8KCAgCdcbiAgICAgICfwoICAXFx4MDAnXG4gICAgICBTdHJpbmcuZnJvbUNvZGVQb2ludCAweDEwZmZmZlxuICAgICAgXVxuICAgIG1hdGNoZXJzID0gKCBbIHByb2JlLCBdIGZvciBwcm9iZSBpbiBwcm9iZXMgKVxuICAgIENORC5zaHVmZmxlIHByb2Jlc1xuICAgIGZvciBwcm9iZSBpbiBwcm9iZXNcbiAgICAgIGRlYnVnICfCqW9NWEpaJywgcHJvYmVcbiAgICAgIHByb2JlX2JmciA9IENPREVDLmVuY29kZSBbIHByb2JlLCBdXG4gICAgICB5aWVsZCBsZXZlbGRiLnB1dCBwcm9iZV9iZnIsICcxJywgcmVzdW1lXG4gICAgcHJvYmVfYmZycyAgPSB5aWVsZCByZWFkX2FsbF9rZXlzIGxldmVsZGIsIHJlc3VtZVxuICAgICMgZGVidWcgJ8KpRmQ1aXcnLCBwcm9iZV9iZnJzXG4gICAgcHJvYmVzICAgICAgPSAoIENPREVDLmRlY29kZSBwcm9iZV9iZnIgZm9yIHByb2JlX2JmciBpbiBwcm9iZV9iZnJzIClcbiAgICBzaG93X2tleXNfYW5kX2tleV9iZnJzIHByb2JlcywgcHJvYmVfYmZyc1xuICAgIGZvciBwcm9iZSwgcHJvYmVfaWR4IGluIHByb2Jlc1xuICAgICAgbWF0Y2hlciA9IG1hdGNoZXJzWyBwcm9iZV9pZHggXVxuICAgICAgVC5lcSBwcm9iZSwgbWF0Y2hlclxuICAgIGxldmVsZGIuY2xvc2UgLT4gZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJzb3J0IGxpc3RzIG9mIG1peGVkIHZhbHVlcyB3aXRoIEgyIGNvZGVjXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHNldHRpbmdzID1cbiAgICAgIGRiOiAgICAgICAgICAgbGV2ZWxkb3duXG4gICAgICBrZXlFbmNvZGluZzogICdiaW5hcnknXG4gICAgbGV2ZWxkYiA9IGxldmVsdXAgJy90bXAvaG9sbGVyaXRoMi10ZXN0Jywgc2V0dGluZ3NcbiAgICB5aWVsZCBjbGVhcl9sZXZlbGRiIGxldmVsZGIsIHJlc3VtZVxuICAgIHByb2JlcyA9IFtcbiAgICAgIFsgXCJcIiwgICAgICAgICAgICAgJycsICAgICAgICAgICAgIF1cbiAgICAgIFsgXCIxMjM0XCIsICAgICAgICAgIDEyMzQsICAgICAgICAgICBdXG4gICAgICBbIFwiSW5maW5pdHlcIiwgICAgICBJbmZpbml0eSwgICAgICAgXVxuICAgICAgWyBcIlN0cmluZy5mcm9tQ29kZVBvaW50IDB4MTBmZmZmXCIsIFN0cmluZy5mcm9tQ29kZVBvaW50IDB4MTBmZmZmIF1cbiAgICAgIFsgXCJmYWxzZVwiLCAgICAgICAgIGZhbHNlLCAgICAgICAgICBdXG4gICAgICBbIFwibmV3IERhdGUgMFwiLCAgICBuZXcgRGF0ZSAwLCAgICAgXVxuICAgICAgWyBcIm5ldyBEYXRlIDhlMTFcIiwgbmV3IERhdGUgOGUxMSwgIF1cbiAgICAgIFsgXCJuZXcgRGF0ZSgpXCIsICAgIG5ldyBEYXRlKCksICAgICBdXG4gICAgICBbIFwibnVsbFwiLCAgICAgICAgICBudWxsLCAgICAgICAgICAgXVxuICAgICAgWyBcInRydWVcIiwgICAgICAgICAgdHJ1ZSwgICAgICAgICAgIF1cbiAgICAgIFsgXCLkuIBcIiwgICAgICAgICAgICAn5LiAJywgICAgICAgICAgICBdXG4gICAgICBbIFwi5LiJXCIsICAgICAgICAgICAgJ+S4iScsICAgICAgICAgICAgXVxuICAgICAgWyBcIuS6jFwiLCAgICAgICAgICAgICfkuownLCAgICAgICAgICAgIF1cbiAgICAgIFsgXCLwoICAXCIsICAgICAgICAgICAgJ/CggIAnLCAgICAgICAgICAgIF1cbiAgICAgIFsgXCLwoICAXFx4MDBcIiwgICAgICAgICfwoICAXFx4MDAnLCAgICAgICAgXVxuICAgICAgXVxuICAgIG1hdGNoZXJzID0gKCBwcm9iZSBmb3IgcHJvYmUgaW4gcHJvYmVzIClcbiAgICBDTkQuc2h1ZmZsZSBwcm9iZXNcbiAgICBmb3IgcHJvYmUgaW4gcHJvYmVzXG4gICAgICBkZWJ1ZyAnwqlvTVhKWicsIHByb2JlXG4gICAgICBwcm9iZV9iZnIgPSBDT0RFQy5lbmNvZGUgcHJvYmVcbiAgICAgIHlpZWxkIGxldmVsZGIucHV0IHByb2JlX2JmciwgJzEnLCByZXN1bWVcbiAgICBwcm9iZV9iZnJzICA9IHlpZWxkIHJlYWRfYWxsX2tleXMgbGV2ZWxkYiwgcmVzdW1lXG4gICAgIyBkZWJ1ZyAnwqlGZDVpdycsIHByb2JlX2JmcnNcbiAgICBwcm9iZXMgICAgICA9ICggQ09ERUMuZGVjb2RlIHByb2JlX2JmciBmb3IgcHJvYmVfYmZyIGluIHByb2JlX2JmcnMgKVxuICAgIHNob3dfa2V5c19hbmRfa2V5X2JmcnMgcHJvYmVzLCBwcm9iZV9iZnJzXG4gICAgZm9yIHByb2JlLCBwcm9iZV9pZHggaW4gcHJvYmVzXG4gICAgICBtYXRjaGVyID0gbWF0Y2hlcnNbIHByb2JlX2lkeCBdXG4gICAgICBULmVxIHByb2JlLCBtYXRjaGVyXG4gICAgbGV2ZWxkYi5jbG9zZSAtPiBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInNvcnQgcm91dGVzIHdpdGggdmFsdWVzICgxKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICBzZXR0aW5ncyA9XG4gICAgICBkYjogICAgICAgICAgIGxldmVsZG93blxuICAgICAga2V5RW5jb2Rpbmc6ICAnYmluYXJ5J1xuICAgIGxldmVsZGIgPSBsZXZlbHVwICcvdG1wL2hvbGxlcml0aDItdGVzdCcsIHNldHRpbmdzXG4gICAgeWllbGQgY2xlYXJfbGV2ZWxkYiBsZXZlbGRiLCByZXN1bWVcbiAgICBwcm9iZXMgPSBbXG4gICAgICBbICdwb3MnLCAnc3Ryb2tlb3JkZXInLCAnMzUyNTEzNTUzMjU0JywgICAgICAgICAgJ/Ckv68nLCBdXG4gICAgICBbICdwb3MnLCAnc3Ryb2tlb3JkZXInLCAnMzUyNTE0MTEyMScsICAgICAgICAgICAgJ/CgtKYnLCBdXG4gICAgICBbICdwb3MnLCAnc3Ryb2tlb3JkZXInLCAnMzUyNTE0NTQnLCAgICAgICAgICAgICAgJ/CokqEnLCBdXG4gICAgICBbICdwb3MnLCAnc3Ryb2tlb3JkZXInLCAnMzUyNTE1MicsICAgICAgICAgICAgICAgJ+mCrScsIF1cbiAgICAgIFsgJ3BvcycsICdzdHJva2VvcmRlcicsICczNTI1MTUyNTExMTUxMTUxMTM1NDEnLCAn8KqaqycsIF1cbiAgICAgIFsgJ3BvcycsICdzdHJva2VvcmRlcicsICczNTI1MTUyNTExMjUxMTUxMScsICAgICAn8KqapycsIF1cbiAgICAgIFsgJ3BvcycsICdzdHJva2VvcmRlcicsICczNTI1MTUyNTEyMTQyNTEyMTQnLCAgICAn8KeRtCcsIF1cbiAgICAgIFsgJ3BvcycsICdzdHJva2VvcmRlcicsICczNTI1MTUzJywgICAgICAgICAgICAgICAn5YqsJywgXVxuICAgICAgWyAncG9zJywgJ3N0cm9rZW9yZGVyJywgJzM1MjUxNTNcXHgwMCcsICAgICAgICAgICAgICAgJ+WKrCcsIF1cbiAgICAgIFsgJ3BvcycsICdzdHJva2VvcmRlclxceDAwJywgJzM1MjUxMzU1MzI1NCcsICAgICAgICAgICfwpL+vJywgXVxuICAgICAgXVxuICAgIG1hdGNoZXJzID0gKCBwcm9iZSBmb3IgcHJvYmUgaW4gcHJvYmVzIClcbiAgICBDTkQuc2h1ZmZsZSBwcm9iZXNcbiAgICBmb3IgcHJvYmUgaW4gcHJvYmVzXG4gICAgICBwcm9iZV9iZnIgPSBDT0RFQy5lbmNvZGUgcHJvYmVcbiAgICAgIHlpZWxkIGxldmVsZGIucHV0IHByb2JlX2JmciwgJzEnLCByZXN1bWVcbiAgICBwcm9iZV9iZnJzICA9IHlpZWxkIHJlYWRfYWxsX2tleXMgbGV2ZWxkYiwgcmVzdW1lXG4gICAgIyBkZWJ1ZyAnwqlGZDVpdycsIHByb2JlX2JmcnNcbiAgICBwcm9iZXMgICAgICA9ICggQ09ERUMuZGVjb2RlIHByb2JlX2JmciBmb3IgcHJvYmVfYmZyIGluIHByb2JlX2JmcnMgKVxuICAgIHNob3dfa2V5c19hbmRfa2V5X2JmcnMgcHJvYmVzLCBwcm9iZV9iZnJzXG4gICAgZm9yIHByb2JlLCBwcm9iZV9pZHggaW4gcHJvYmVzXG4gICAgICBtYXRjaGVyID0gbWF0Y2hlcnNbIHByb2JlX2lkeCBdXG4gICAgICBULmVxIHByb2JlLCBtYXRjaGVyXG4gICAgbGV2ZWxkYi5jbG9zZSAtPiBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInNvcnQgcm91dGVzIHdpdGggdmFsdWVzICgyKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICBzZXR0aW5ncyA9XG4gICAgICBkYjogICAgICAgICAgIGxldmVsZG93blxuICAgICAga2V5RW5jb2Rpbmc6ICAnYmluYXJ5J1xuICAgIGxldmVsZGIgPSBsZXZlbHVwICcvdG1wL2hvbGxlcml0aDItdGVzdCcsIHNldHRpbmdzXG4gICAgeWllbGQgY2xlYXJfbGV2ZWxkYiBsZXZlbGRiLCByZXN1bWVcbiAgICBwcm9iZXMgPSBbXG4gICAgICBbICdhJywgICAgICBudWxsLCBdXG4gICAgICBbICdhJywgICAgICBmYWxzZSwgXVxuICAgICAgWyAnYScsICAgICAgdHJ1ZSwgXVxuICAgICAgWyAnYScsICAgICAgbmV3IERhdGUoKSwgXVxuICAgICAgWyAnYScsICAgICAgLUluZmluaXR5LCBdXG4gICAgICBbICdhJywgICAgICArMTIzNCwgXVxuICAgICAgWyAnYScsICAgICAgK0luZmluaXR5LCBdXG4gICAgICBbICdhJywgICAgICAnYicsIF1cbiAgICAgIFsgJ2EnLCAgICAgICdiXFx4MDAnLCBdXG4gICAgICBbICdhXFx4MDAnLCAgKzEyMzQsIF1cbiAgICAgIFsgJ2FcXHgwMCcsICAnYicsIF1cbiAgICAgIFsgJ2FhJywgICAgICsxMjM0LCBdXG4gICAgICBbICdhYScsICAgICAnYicsIF1cbiAgICAgIFsgJ2FhJywgICAgICdiXFx4MDAnLCBdXG4gICAgICBdXG4gICAgbWF0Y2hlcnMgPSAoIHByb2JlIGZvciBwcm9iZSBpbiBwcm9iZXMgKVxuICAgIENORC5zaHVmZmxlIHByb2Jlc1xuICAgIGZvciBwcm9iZSBpbiBwcm9iZXNcbiAgICAgIHByb2JlX2JmciA9IENPREVDLmVuY29kZSBwcm9iZVxuICAgICAgeWllbGQgbGV2ZWxkYi5wdXQgcHJvYmVfYmZyLCAnMScsIHJlc3VtZVxuICAgIHByb2JlX2JmcnMgID0geWllbGQgcmVhZF9hbGxfa2V5cyBsZXZlbGRiLCByZXN1bWVcbiAgICAjIGRlYnVnICfCqUZkNWl3JywgcHJvYmVfYmZyc1xuICAgIHByb2JlcyAgICAgID0gKCBDT0RFQy5kZWNvZGUgcHJvYmVfYmZyIGZvciBwcm9iZV9iZnIgaW4gcHJvYmVfYmZycyApXG4gICAgc2hvd19rZXlzX2FuZF9rZXlfYmZycyBwcm9iZXMsIHByb2JlX2JmcnNcbiAgICBmb3IgcHJvYmUsIHByb2JlX2lkeCBpbiBwcm9iZXNcbiAgICAgIG1hdGNoZXIgPSBtYXRjaGVyc1sgcHJvYmVfaWR4IF1cbiAgICAgIFQuZXEgcHJvYmUsIG1hdGNoZXJcbiAgICBsZXZlbGRiLmNsb3NlIC0+IGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCBzYW1wbGUgZGF0YVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDJcbiAgaWR4ID0gLTFcbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgZGVidWcgJ8KpYlVKaEknLCAnWFgnXG4gICAgeWllbGQgQF9mZWVkX3Rlc3RfZGF0YSBkYiwgcHJvYmVzX2lkeCwgcmVzdW1lXG4gICAgZGVidWcgJ8KpUFJ6QTUnLCAnWFgnXG4gICAgaW5wdXQgPSBkYlsgJyVzZWxmJyBdLmNyZWF0ZVJlYWRTdHJlYW0oKVxuICAgIGlucHV0XG4gICAgICAucGlwZSBELiRzaG93KClcbiAgICAgIC5waXBlICQgKCB7IGtleSwgdmFsdWUsIH0sIHNlbmQgKSA9PiBzZW5kIFsga2V5LCB2YWx1ZSwgXVxuICAgICAgLnBpcGUgJCAoIFsga2V5LCB2YWx1ZSwgXSwgc2VuZCApID0+XG4gICAgICAgICMgZGVidWcgJ8KpUmx1aEYnLCAoIEhPTExFUklUSC5DT0RFQy5kZWNvZGUga2V5ICksICggSlNPTi5wYXJzZSB2YWx1ZSApXG4gICAgICAgIHNlbmQgWyBrZXksIHZhbHVlLCBdXG4gICAgICAucGlwZSBELiRjb2xsZWN0KClcbiAgICAgIC5waXBlICQgKCBmYWNldHMsIHNlbmQgKSA9PlxuICAgICAgICAjIGRlYnVnICfCqUZ0bUI0JywgZmFjZXRzXG4gICAgICAgIGhlbHAgJ1xcbicgKyBIT0xMRVJJVEguRFVNUC5ycHJfb2ZfZmFjZXRzIGRiLCBmYWNldHNcbiAgICAgICAgIyBwcm9jZXNzLmV4aXQoKSAjID4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+XG4gICAgICAgIGJ1ZmZlciA9IG5ldyBCdWZmZXIgSlNPTi5zdHJpbmdpZnkgWyAn5byAJywgJ+W9oScgXVxuICAgICAgICBkZWJ1ZyAnwqlHSmZMNicsIEhPTExFUklUSC5EVU1QLnJwcl9vZl9idWZmZXIgbnVsbCwgYnVmZmVyXG4gICAgICAucGlwZSBELiRvbl9lbmQgPT4gZG9uZSgpXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcmV0dXJuIG51bGxcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgYW5kIHdyaXRlIGtleXMgd2l0aCBsaXN0c1wiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ICAgICAgICAgPSAtMVxuICBjb3VudCAgICAgICA9IDBcbiAgcHJvYmVzICAgICAgPSBbXG4gICAgWyAnYScsIDEsIF1cbiAgICBbICdhJywgW10sIF1cbiAgICBbICdhJywgWyAxLCBdLCBdXG4gICAgWyAnYScsIFsgdHJ1ZSwgXSwgXVxuICAgIFsgJ2EnLCBbICd4JywgJ3knLCAnYicsIF0sIF1cbiAgICBbICdhJywgWyAxMjAsIDEgLyAzLCBdLCBdXG4gICAgWyAnYScsIFsgJ3gnLCBdLCBdXG4gICAgXVxuICBtYXRjaGVycyAgICA9ICggcHJvYmUgZm9yIHByb2JlIGluIHByb2JlcyApXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZm9yIHByb2JlLCBwcm9iZV9pZHggaW4gcHJvYmVzXG4gICAgYnVmZmVyID0gSE9MTEVSSVRILkNPREVDLmVuY29kZSBwcm9iZVxuICAgIHJlc3VsdCA9IEhPTExFUklUSC5DT0RFQy5kZWNvZGUgYnVmZmVyXG4gICAgVC5lcSByZXN1bHQsIG1hdGNoZXJzWyBwcm9iZV9pZHggXVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCBwYXJ0aWFsIFBPUyBwaHJhc2VzXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHByb2Jlc19pZHggID0gMFxuICBpZHggICAgICAgICA9IC0xXG4gIGNvdW50ICAgICAgID0gMFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIG1hdGNoZXJzID0gW1xuICAgIFsgJ/Cnt58xJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAxIF1cbiAgICBbICfwp7efMicsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgMiBdXG4gICAgWyAn8Ke3nzMnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDMgXVxuICAgIFsgJ/Cnt580JywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCA0IF1cbiAgICBbICfwp7efJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCA1IF1cbiAgICBbICfwp7efNicsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgNiBdXG4gICAgWyAn8Ke3nycsICdndWlkZS91Y2hyL2hhcycsICflhasnLCAwIF1cbiAgICBbICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgJ+WIgCcsIDEgXVxuICAgIFsgJ/Cnt58nLCAnZ3VpZGUvdWNoci9oYXMnLCAn5a6AJywgMiBdXG4gICAgWyAn8Ke3nycsICdndWlkZS91Y2hyL2hhcycsICfosp0nLCA0IF1cbiAgICBbICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgJ+6HuicsIDMgXVxuICAgIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBAX2ZlZWRfdGVzdF9kYXRhIGRiLCBwcm9iZXNfaWR4LCByZXN1bWVcbiAgICBwcmVmaXggICAgPSBbICdwb3MnLCAnZ3VpZGUnLCBdXG4gICAgaW5wdXQgICAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIHByZWZpeCwgJyonXG4gICAgZGVidWcgJ8KpRnBoSksnLCBpbnB1dFsgJyVtZXRhJyBdXG4gICAgc2V0dGluZ3MgID0geyBpbmRleGVkOiBubywgfVxuICAgIGlucHV0XG4gICAgICAucGlwZSAkICggcGhyYXNlLCBzZW5kICkgPT5cbiAgICAgICAgY291bnQgICs9ICsxXG4gICAgICAgIGlkeCAgICArPSArMVxuICAgICAgICBkZWJ1ZyAnwqlTYzVGRycsIHBocmFzZVxuICAgICAgICAjIFQuZXEgcGhyYXNlLCBtYXRjaGVyc1sgaWR4IF1cbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICBULmVxIGNvdW50LCBtYXRjaGVycy5sZW5ndGhcbiAgICAgICAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJlbmNvZGUga2V5cyB3aXRoIGxpc3QgZWxlbWVudHNcIiBdID0gKCBULCBkb25lICkgLT5cbiAgcHJvYmVzID0gW1xuICAgIFsgJ2ZvbycsICdiYXInLCBdXG4gICAgWyAnZm9vJywgWyAnYmFyJywgXSwgXVxuICAgIFsgW10sICdiYXInLCBdXG4gICAgWyAnZm9vJywgW10sIF1cbiAgICBbIFsgJ2ZvbycsIF0sICdiYXInLCBdXG4gICAgWyBbIDQyLCBdLCAnYmFyJywgXVxuICAgIFsgJ2ZvbycsIFsgNDIsIF0gXVxuICAgIF1cbiAgZm9yIHByb2JlIGluIHByb2Jlc1xuICAgIFQuZXEgcHJvYmUsIEhPTExFUklUSC5DT0RFQy5kZWNvZGUgSE9MTEVSSVRILkNPREVDLmVuY29kZSBwcm9iZVxuICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgYW5kIHdyaXRlIHBocmFzZXMgd2l0aCB1bmFuYWx5emVkIGxpc3RzXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIGlkeCAgICAgICAgID0gLTFcbiAgY291bnQgICAgICAgPSAwXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcHJvYmVzID0gW1xuICAgIFsgJ3Byb2JlIzAwJywgJ3NvbWUtcHJlZGljYXRlJywgW10sIF1cbiAgICBbICdwcm9iZSMwMScsICdzb21lLXByZWRpY2F0ZScsIFsgLTEgXSwgXVxuICAgIFsgJ3Byb2JlIzAyJywgJ3NvbWUtcHJlZGljYXRlJywgWyAgMCBdLCBdXG4gICAgWyAncHJvYmUjMDMnLCAnc29tZS1wcmVkaWNhdGUnLCBbICAxIF0sIF1cbiAgICBbICdwcm9iZSMwNCcsICdzb21lLXByZWRpY2F0ZScsIFsgIDIgXSwgXVxuICAgIFsgJ3Byb2JlIzA1JywgJ3NvbWUtcHJlZGljYXRlJywgWyAgMiwgLTEsIF0sIF1cbiAgICBbICdwcm9iZSMwNicsICdzb21lLXByZWRpY2F0ZScsIFsgIDIsIDAsIF0sIF1cbiAgICBbICdwcm9iZSMwNycsICdzb21lLXByZWRpY2F0ZScsIFsgIDIsIDEsIF0sIF1cbiAgICBbICdwcm9iZSMwOCcsICdzb21lLXByZWRpY2F0ZScsIFsgIDIsIDEsIDAgXSwgXVxuICAgIFsgJ3Byb2JlIzA5JywgJ3NvbWUtcHJlZGljYXRlJywgWyAgMiwgMiwgXSwgXVxuICAgIFsgJ3Byb2JlIzEwJywgJ3NvbWUtcHJlZGljYXRlJywgWyAgMiwgWyAyLCBdLCBdLCBdXG4gICAgWyAncHJvYmUjMTEnLCAnc29tZS1wcmVkaWNhdGUnLCBbICAzIF0sIF1cbiAgICBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgd3JpdGVfcHJvYmVzID0gKCBoYW5kbGVyICkgPT5cbiAgICBzdGVwICggcmVzdW1lICkgPT5cbiAgICAgIHlpZWxkIEhPTExFUklUSC5jbGVhciBkYiwgcmVzdW1lXG4gICAgICBpbnB1dCA9IEQuY3JlYXRlX3Rocm91Z2hzdHJlYW0oKVxuICAgICAgaW5wdXRcbiAgICAgICAgIyAucGlwZSAoIFsgc2JqLCBwcmQsIG9iaiwgXSwgc2VuZCApID0+XG4gICAgICAgICMgICBpZiBwcmQgaXMgJ3NvbWUtcHJlZGljYXRlJyAjIGFsd2F5cyB0aGUgY2FzZSBpbiB0aGlzIGV4YW1wbGVcbiAgICAgICAgIyAgICAgb2JqXG4gICAgICAgIC5waXBlIEhPTExFUklUSC4kd3JpdGUgZGIsIHNvbGlkczogWyAnc29tZS1wcmVkaWNhdGUnLCBdXG4gICAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICAgIHVyZ2UgXCJ0ZXN0IGRhdGEgd3JpdHRlblwiXG4gICAgICAgICAgaGFuZGxlcigpXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgaW5wdXQud3JpdGUgcHJvYmUgZm9yIHByb2JlIGluIHByb2Jlc1xuICAgICAgaW5wdXQuZW5kKClcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHlpZWxkIHdyaXRlX3Byb2JlcyByZXN1bWVcbiAgICBpbnB1dCA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiXG4gICAgZGVidWcgJ8KpRnBoSksnLCBpbnB1dFsgJyVtZXRhJyBdXG4gICAgaW5wdXRcbiAgICAgIC5waXBlICQgKCBwaHJhc2UsIHNlbmQgKSA9PlxuICAgICAgICBjb3VudCAgKz0gKzFcbiAgICAgICAgaWR4ICAgICs9ICsxXG4gICAgICAgIGRlYnVnICfCqVNjNUZHJywgcGhyYXNlXG4gICAgICAgICMgVC5lcSBwaHJhc2UsIG1hdGNoZXJzWyBpZHggXVxuICAgICAgLnBpcGUgRC4kb25fZW5kID0+XG4gICAgICAgICMgVC5lcSBjb3VudCwgbWF0Y2hlcnMubGVuZ3RoXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwid3JpdGUgbWFueSBwaHJhc2VzXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIGlkeCAgICAgICAgID0gLTFcbiAgY291bnQgICAgICAgPSAwXG4gIGRlbGF5ID0gKCBoYW5kbGVyICkgLT5cbiAgICBzZXRJbW1lZGlhdGUgaGFuZGxlclxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHdyaXRlX3Byb2JlcyA9ICggaGFuZGxlciApID0+XG4gICAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgICB5aWVsZCBIT0xMRVJJVEguY2xlYXIgZGIsIHJlc3VtZVxuICAgICAgaW5wdXQgPSBELmNyZWF0ZV90aHJvdWdoc3RyZWFtKClcbiAgICAgIGlucHV0XG4gICAgICAgIC5waXBlIEhPTExFUklUSC4kd3JpdGUgZGIsIHNvbGlkczogWyAnc29tZS1wcmVkaWNhdGUnLCBdXG4gICAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICAgIHVyZ2UgXCJ0ZXN0IGRhdGEgd3JpdHRlblwiXG4gICAgICAgICAgaGFuZGxlcigpXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgZm9yIGlkeCBpbiBbIDAgLi4gMTAwIF1cbiAgICAgICAgcHJvYmUgPSBcImVudHJ5LSN7aWR4fVwiXG4gICAgICAgIHlpZWxkIGlucHV0LndyaXRlIHByb2JlLCByZXN1bWVcbiAgICAgICAgIyB5aWVsZCBkZWxheSByZXN1bWVcbiAgICAgIGlucHV0LmVuZCgpXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICB5aWVsZCB3cml0ZV9wcm9iZXMgcmVzdW1lXG4gICAgaW5wdXQgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYlxuICAgIGRlYnVnICfCqUZwaEpLJywgaW5wdXRbICclbWV0YScgXVxuICAgIGlucHV0XG4gICAgICAucGlwZSAkICggcGhyYXNlLCBzZW5kICkgPT5cbiAgICAgICAgY291bnQgICs9ICsxXG4gICAgICAgIGlkeCAgICArPSArMVxuICAgICAgICBkZWJ1ZyAnwqlTYzVGRycsIHBocmFzZVxuICAgICAgICAjIFQuZXEgcGhyYXNlLCBtYXRjaGVyc1sgaWR4IF1cbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICAjIFQuZXEgY291bnQsIG1hdGNoZXJzLmxlbmd0aFxuICAgICAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlbWluZGVyc1wiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBhbGVydCBcIkguJHdyaXRlKCkgbXVzdCB0ZXN0IGZvciByZXBlYXRlZCBrZXlzIG9yIGltcGxlbWVudCByZXdyaXRpbmcgb2YgUE9TIGVudHJpZXNcIlxuICBkb25lKClcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIEhFTFBFUlNcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuc2hvd19rZXlzX2FuZF9rZXlfYmZycyA9ICgga2V5cywga2V5X2JmcnMgKSAtPlxuICBmID0gKCBwICkgLT4gKCB0IGZvciB0IGluICggcC50b1N0cmluZyAnaGV4JyApLnNwbGl0IC8oLi4pLyB3aGVuIHQgaXNudCAnJyApLmpvaW4gJyAnXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgY29sdW1uaWZ5X3NldHRpbmdzID1cbiAgICBwYWRkaW5nQ2hyOiAnICdcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBkYXRhICAgICAgPSBbXVxuICBrZXlfYmZycyAgPSAoIGYgcCBmb3IgcCBpbiBrZXlfYmZycyApXG4gIGZvciBrZXksIGlkeCBpbiBrZXlzXG4gICAga2V5X3R4dCA9ICggcnByIGtleSApLnJlcGxhY2UgL1xcXFx1MDAwMC9nLCAn4oiHJ1xuICAgIGRhdGEucHVzaCB7ICdzdHInOiBrZXlfdHh0LCAnYmZyJzoga2V5X2JmcnNbIGlkeCBdfVxuICBoZWxwICdcXG4nICsgQ05ELmNvbHVtbmlmeSBkYXRhLCBjb2x1bW5pZnlfc2V0dGluZ3NcbiAgcmV0dXJuIG51bGxcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5nZXRfbmV3X2RiX25hbWUgPSAtPlxuICBnZXRfbmV3X2RiX25hbWUuaWR4ICs9ICsxXG4gIHJldHVybiBcIi90bXAvaG9sbGVyaXRoMi10ZXN0ZGItI3tnZXRfbmV3X2RiX25hbWUuaWR4fVwiXG5nZXRfbmV3X2RiX25hbWUuaWR4ID0gMFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbnJlYWRfYWxsX2tleXMgPSAoIGRiLCBoYW5kbGVyICkgLT5cbiAgWiA9IFtdXG4gIGlucHV0ID0gZGIuY3JlYXRlS2V5U3RyZWFtKClcbiAgaW5wdXQub24gJ2VuZCcsIC0+IGhhbmRsZXIgbnVsbCwgWlxuICBpbnB1dFxuICAgIC5waXBlICQgKCBkYXRhLCBzZW5kICkgPT4gWi5wdXNoIGRhdGFcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGVhcl9sZXZlbGRiID0gKCBsZXZlbGRiLCBoYW5kbGVyICkgLT5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgcm91dGUgPSBsZXZlbGRiWyAnbG9jYXRpb24nIF1cbiAgICB5aWVsZCBsZXZlbGRiLmNsb3NlIHJlc3VtZVxuICAgIHdoaXNwZXIgXCJjbG9zZWQgTGV2ZWxEQlwiXG4gICAgeWllbGQgbGV2ZWxkb3duLmRlc3Ryb3kgcm91dGUsIHJlc3VtZVxuICAgIHdoaXNwZXIgXCJkZXN0cm95ZWQgTGV2ZWxEQlwiXG4gICAgeWllbGQgbGV2ZWxkYi5vcGVuIHJlc3VtZVxuICAgIHdoaXNwZXIgXCJyZS1vcGVuZWQgTGV2ZWxEQlwiXG4gICAgIyBoZWxwIFwiZXJhc2VkIGFuZCByZS1vcGVuZWQgTGV2ZWxEQiBhdCAje3JvdXRlfVwiXG4gICAgaGFuZGxlciBudWxsXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9tYWluID0gKCBoYW5kbGVyICkgLT5cbiAgZGIgPSBIT0xMRVJJVEgubmV3X2RiIGpvaW4gX19kaXJuYW1lLCAnLi4nLCAnZGJzL3Rlc3RzJ1xuICB0ZXN0IEAsICd0aW1lb3V0JzogMjUwMFxuXG4jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbnVubGVzcyBtb2R1bGUucGFyZW50P1xuICBAX21haW4oKVxuXG4gICMgZGVidWcgJ8KpUDlBT1InLCAoIEhPTExFUklUSC5DT0RFQ1sgJ3R5cGVtYXJrZXJzJyAgXVsgJ251bGwnICAgICAgIF0gKS50b1N0cmluZyAxNlxuICAjIGRlYnVnICfCqXh4bUlwJywgKCBIT0xMRVJJVEguQ09ERUNbICd0eXBlbWFya2VycycgIF1bICdmYWxzZScgICAgICBdICkudG9TdHJpbmcgMTZcbiAgIyBkZWJ1ZyAnwqlaZVkyNicsICggSE9MTEVSSVRILkNPREVDWyAndHlwZW1hcmtlcnMnICBdWyAndHJ1ZScgICAgICAgXSApLnRvU3RyaW5nIDE2XG4gICMgZGVidWcgJ8KpV2dFUjknLCAoIEhPTExFUklUSC5DT0RFQ1sgJ3R5cGVtYXJrZXJzJyAgXVsgJ2RhdGUnICAgICAgIF0gKS50b1N0cmluZyAxNlxuICAjIGRlYnVnICfCqVVtcGpKJywgKCBIT0xMRVJJVEguQ09ERUNbICd0eXBlbWFya2VycycgIF1bICduaW5maW5pdHknICBdICkudG9TdHJpbmcgMTZcbiAgIyBkZWJ1ZyAnwqlVcmwwSycsICggSE9MTEVSSVRILkNPREVDWyAndHlwZW1hcmtlcnMnICBdWyAnbm51bWJlcicgICAgXSApLnRvU3RyaW5nIDE2XG4gICMgZGVidWcgJ8KpbkZJSWknLCAoIEhPTExFUklUSC5DT0RFQ1sgJ3R5cGVtYXJrZXJzJyAgXVsgJ3BudW1iZXInICAgIF0gKS50b1N0cmluZyAxNlxuICAjIGRlYnVnICfCqUxaNThSJywgKCBIT0xMRVJJVEguQ09ERUNbICd0eXBlbWFya2VycycgIF1bICdwaW5maW5pdHknICBdICkudG9TdHJpbmcgMTZcbiAgIyBkZWJ1ZyAnwqlNWXhkYScsICggSE9MTEVSSVRILkNPREVDWyAndHlwZW1hcmtlcnMnICBdWyAndGV4dCcgICAgICAgXSApLnRvU3RyaW5nIDE2XG5cblxuXG5cblxuXG5cblxuXG5cbiJdfQ==