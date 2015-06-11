(function() {
  var $, CND, CODEC, D, HOLLERITH, after, alert, badge, clear_leveldb, db, debug, echo, get_new_db_name, help, info, join, leveldown, levelup, log, njs_path, read_all_keys, rpr, show_keys_and_key_bfrs, step, suspend, test, urge, warn, whisper;

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

//# sourceMappingURL=data:application/json;base64,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LEVBQVE7QUFBQSxNQUFBLFNBQUEsRUFBVyxJQUFYO0tBQVIsRUFGTztFQUFBLENBMW1DVCxDQUFBOztBQSttQ0EsRUFBQSxJQUFPLHFCQUFQO0FBQ0UsSUFBQSxJQUFDLENBQUEsS0FBRCxDQUFBLENBQUEsQ0FERjtHQS9tQ0E7QUFBQSIsImZpbGUiOiJ0ZXN0cy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIlxuXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xubmpzX3BhdGggICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ3BhdGgnXG4jIG5qc19mcyAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdmcydcbmpvaW4gICAgICAgICAgICAgICAgICAgICAgPSBuanNfcGF0aC5qb2luXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkNORCAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdjbmQnXG5ycHIgICAgICAgICAgICAgICAgICAgICAgID0gQ05ELnJwclxuYmFkZ2UgICAgICAgICAgICAgICAgICAgICA9ICdIT0xMRVJJVEgvdGVzdHMnXG5sb2cgICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3BsYWluJywgICAgIGJhZGdlXG5pbmZvICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ2luZm8nLCAgICAgIGJhZGdlXG53aGlzcGVyICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3doaXNwZXInLCAgIGJhZGdlXG5hbGVydCAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ2FsZXJ0JywgICAgIGJhZGdlXG5kZWJ1ZyAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ2RlYnVnJywgICAgIGJhZGdlXG53YXJuICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3dhcm4nLCAgICAgIGJhZGdlXG5oZWxwICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ2hlbHAnLCAgICAgIGJhZGdlXG51cmdlICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3VyZ2UnLCAgICAgIGJhZGdlXG5lY2hvICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmVjaG8uYmluZCBDTkRcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuc3VzcGVuZCAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2NvZmZlZW5vZGUtc3VzcGVuZCdcbnN0ZXAgICAgICAgICAgICAgICAgICAgICAgPSBzdXNwZW5kLnN0ZXBcbmFmdGVyICAgICAgICAgICAgICAgICAgICAgPSBzdXNwZW5kLmFmdGVyXG4jIGV2ZW50dWFsbHkgICAgICAgICAgICAgICAgPSBzdXNwZW5kLmV2ZW50dWFsbHlcbiMgaW1tZWRpYXRlbHkgICAgICAgICAgICAgICA9IHN1c3BlbmQuaW1tZWRpYXRlbHlcbiMgcmVwZWF0X2ltbWVkaWF0ZWx5ICAgICAgICA9IHN1c3BlbmQucmVwZWF0X2ltbWVkaWF0ZWx5XG4jIGV2ZXJ5ICAgICAgICAgICAgICAgICAgICAgPSBzdXNwZW5kLmV2ZXJ5XG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnRlc3QgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdndXktdGVzdCdcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuRCAgICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ3BpcGVkcmVhbXMyJ1xuJCAgICAgICAgICAgICAgICAgICAgICAgICA9IEQucmVtaXQuYmluZCBEXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkhPTExFUklUSCAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL21haW4nXG5kYiAgICAgICAgICAgICAgICAgICAgICAgID0gbnVsbFxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5sZXZlbHVwICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbGV2ZWx1cCdcbmxldmVsZG93biAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdsZXZlbGRvd24nXG5DT0RFQyAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi9jb2RlYydcblxuIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQF9zb3J0X2xpc3QgPSAoIGxpc3QgKSAtPlxuIyAgIEBfZW5jb2RlX2xpc3QgbGlzdFxuIyAgIGxpc3Quc29ydCBCdWZmZXIuY29tcGFyZVxuIyAgIEBfZGVjb2RlX2xpc3QgbGlzdFxuIyAgIHJldHVybiBsaXN0XG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9mZWVkX3Rlc3RfZGF0YSA9ICggZGIsIHByb2Jlc19pZHgsIHNldHRpbmdzLCBoYW5kbGVyICkgLT5cbiAgc3dpdGNoIGFyaXR5ID0gYXJndW1lbnRzLmxlbmd0aFxuICAgIHdoZW4gM1xuICAgICAgaGFuZGxlciAgID0gc2V0dGluZ3NcbiAgICAgIHNldHRpbmdzICA9IG51bGxcbiAgICB3aGVuIDRcbiAgICAgIG51bGxcbiAgICBlbHNlXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJleHBlY3RlZCAzIG9yIDQgYXJndW1lbnRzLCBnb3QgI3thcml0eX1cIlxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEhPTExFUklUSC5jbGVhciBkYiwgcmVzdW1lXG4gICAgd2hpc3BlciBcIndyaXRpbmcgdGVzdCBkYXRhc2V0ICMje3Byb2Jlc19pZHh9IHdpdGggc2V0dGluZ3MgI3tycHIgc2V0dGluZ3N9XCJcbiAgICBpbnB1dCA9IEQuY3JlYXRlX3Rocm91Z2hzdHJlYW0oKVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgc3dpdGNoIHByb2Jlc19pZHhcbiAgICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgd2hlbiAwLCAyXG4gICAgICAgIGlucHV0XG4gICAgICAgICAgLnBpcGUgSE9MTEVSSVRILiR3cml0ZSBkYiwgc2V0dGluZ3NcbiAgICAgICAgICAjIC5waXBlIEQuJHNob3coKVxuICAgICAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICAgICAgd2hpc3BlciBcInRlc3QgZGF0YSB3cml0dGVuXCJcbiAgICAgICAgICAgIGhhbmRsZXIgbnVsbFxuICAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAgIGZvciBwcm9iZSBpbiBAX2ZlZWRfdGVzdF9kYXRhLnByb2Jlc1sgcHJvYmVzX2lkeCBdXG4gICAgICAgICAgIyBrZXkgPSBIT0xMRVJJVEgubmV3X3NvX2tleSBkYiwgcHJvYmUuLi5cbiAgICAgICAgICAjIGRlYnVnICfCqVdWMGoyJywgcHJvYmVcbiAgICAgICAgICBpbnB1dC53cml0ZSBwcm9iZVxuICAgICAgICAgIHlpZWxkIHNldEltbWVkaWF0ZSByZXN1bWVcbiAgICAgICAgaW5wdXQuZW5kKClcbiAgICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgd2hlbiAxXG4gICAgICAgIGlucHV0XG4gICAgICAgICAgLnBpcGUgSE9MTEVSSVRILiR3cml0ZSBkYiwgc2V0dGluZ3NcbiAgICAgICAgICAjIC5waXBlIEQuJHNob3coKVxuICAgICAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICAgICAgd2hpc3BlciBcInRlc3QgZGF0YSB3cml0dGVuXCJcbiAgICAgICAgICAgIGhhbmRsZXIgbnVsbFxuICAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAgIGZvciB1cmxfa2V5IGluIEBfZmVlZF90ZXN0X2RhdGEucHJvYmVzWyBwcm9iZXNfaWR4IF1cbiAgICAgICAgICBrZXkgPSBIT0xMRVJJVEgua2V5X2Zyb21fdXJsIGRiLCB1cmxfa2V5XG4gICAgICAgICAgaW5wdXQud3JpdGUga2V5XG4gICAgICAgICAgeWllbGQgc2V0SW1tZWRpYXRlIHJlc3VtZVxuICAgICAgICBpbnB1dC5lbmQoKVxuICAgICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgIGVsc2UgcmV0dXJuIGhhbmRsZXIgbmV3IEVycm9yIFwiaWxsZWdhbCBwcm9iZXMgaW5kZXggI3tycHIgcHJvYmVzX2lkeH1cIlxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHJldHVybiBudWxsXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9mZWVkX3Rlc3RfZGF0YS5wcm9iZXMgPSBbXVxuXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkBfZmVlZF90ZXN0X2RhdGEucHJvYmVzLnB1c2ggW1xuICBbICfwp7efMScsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgICAgICAgICAgICAgIDEsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ/Cnt58yJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAgICAgICAgICAgICAgMiwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn8Ke3nzMnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsICAgICAgICAgICAgICAzLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfwp7efNCcsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgICAgICAgICAgICAgIDQsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ/Cnt58nLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsICAgICAgICAgICAgICAgNSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn8Ke3nzYnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsICAgICAgICAgICAgICA2LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfwp7efJywgJ2NwL2NpZCcsICAgICAgICAgICAgICAgICAgICAgICAgICAgMTYzMjk1LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ/Cnt58nLCAnZ3VpZGUvdWNoci9oYXMnLCAgICAgICAgICAgICAgICAgICBbICflhasnLCAn5YiAJywgJ+WugCcsICfuh7onLCAn6LKdJywgXSwgICAgICBdXG4gIFsgJ/Cnt58nLCAncmFuay9janQnLCAgICAgICAgICAgICAgICAgICAgICAgICA1NDMyLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5YWrJywgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCAgICAgICAgICAnMzQnLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+WIgCcsICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgICAgICAgICAgJzUoMTIpMycsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICflroAnLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICAgICAgICAgICc0NCcsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn7oe6JywgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCAgICAgICAgICAnMTInLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+iynScsICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgICAgICAgICAgJzI1KDEyKScsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICflhasnLCAncmFuay9janQnLCAgICAgICAgICAgICAgICAgICAgICAgICAxMjU0MSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5YiAJywgJ3JhbmsvY2p0JywgICAgICAgICAgICAgICAgICAgICAgICAgMTI1NDIsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+WugCcsICdyYW5rL2NqdCcsICAgICAgICAgICAgICAgICAgICAgICAgIDEyNTQzLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfuh7onLCAncmFuay9janQnLCAgICAgICAgICAgICAgICAgICAgICAgICAxMjU0NCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn6LKdJywgJ3JhbmsvY2p0JywgICAgICAgICAgICAgICAgICAgICAgICAgMTI1NDUsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIF1cblxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5AX2ZlZWRfdGVzdF9kYXRhLnByb2Jlcy5wdXNoIFtcbiAgJ3NvfGdseXBoOuWKrHxjcC9mbmNyOnUtY2prLzUyYWN8MCdcbiAgJ3NvfGdseXBoOumCrXxjcC9mbmNyOnUtY2prLzkwYWR8MCdcbiAgJ3NvfGdseXBoOvCgtKZ8Y3AvZm5jcjp1LWNqay14Yi8yMGQyNnwwJ1xuICAnc298Z2x5cGg68KS/r3xjcC9mbmNyOnUtY2prLXhiLzI0ZmVmfDAnXG4gICdzb3xnbHlwaDrwp5G0fGNwL2ZuY3I6dS1jamsteGIvMjc0NzR8MCdcbiAgJ3NvfGdseXBoOvCokqF8Y3AvZm5jcjp1LWNqay14Yi8yODRhMXwwJ1xuICAnc298Z2x5cGg68Kqap3xjcC9mbmNyOnUtY2prLXhiLzJhNmE3fDAnXG4gICdzb3xnbHlwaDrwqpqrfGNwL2ZuY3I6dS1jamsteGIvMmE2YWJ8MCdcbiAgJ3NvfGdseXBoOvCkv698c3Ryb2tlb3JkZXI6MzUyNTEzNTUzMjU0fDAnXG4gICdzb3xnbHlwaDrwoLSmfHN0cm9rZW9yZGVyOjM1MjUxNDExMjF8MCdcbiAgJ3NvfGdseXBoOvCokqF8c3Ryb2tlb3JkZXI6MzUyNTE0NTR8MCdcbiAgJ3NvfGdseXBoOumCrXxzdHJva2VvcmRlcjozNTI1MTUyfDAnXG4gICdzb3xnbHlwaDrwqpqrfHN0cm9rZW9yZGVyOjM1MjUxNTI1MTExNTExNTExMzU0MXwwJ1xuICAnc298Z2x5cGg68Kqap3xzdHJva2VvcmRlcjozNTI1MTUyNTExMjUxMTUxMXwwJ1xuICAnc298Z2x5cGg68KeRtHxzdHJva2VvcmRlcjozNTI1MTUyNTEyMTQyNTEyMTR8MCdcbiAgJ3NvfGdseXBoOuWKrHxzdHJva2VvcmRlcjozNTI1MTUzfDAnXG4gIF1cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX2ZlZWRfdGVzdF9kYXRhLnByb2Jlcy5wdXNoIFtcbiAgWyAn5LiBJywgJ3N0cm9rZWNvdW50JywgICAgIDIsICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+S4iScsICdzdHJva2Vjb3VudCcsICAgICAzLCAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICflpKsnLCAnc3Ryb2tlY291bnQnLCAgICAgNSwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5ZyLJywgJ3N0cm9rZWNvdW50JywgICAgIDExLCAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+W9oicsICdzdHJva2Vjb3VudCcsICAgICA3LCAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfkuIEnLCAnY29tcG9uZW50Y291bnQnLCAgMSwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5LiJJywgJ2NvbXBvbmVudGNvdW50JywgIDEsICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+WkqycsICdjb21wb25lbnRjb3VudCcsICAxLCAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICflnIsnLCAnY29tcG9uZW50Y291bnQnLCAgNCwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5b2iJywgJ2NvbXBvbmVudGNvdW50JywgIDIsICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+S4gScsICdjb21wb25lbnRzJywgICAgICBbICfkuIEnLCBdLCAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5LiJJywgJ2NvbXBvbmVudHMnLCAgICAgIFsgJ+S4iScsIF0sICAgICAgICAgICAgICAgICAgXVxuICBbICflpKsnLCAnY29tcG9uZW50cycsICAgICAgWyAn5aSrJywgXSwgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+WciycsICdjb21wb25lbnRzJywgICAgICBbICflm5cnLCAn5oiIJywgJ+WPoycsICfkuIAnLCBdLCBdXG4gIFsgJ+W9oicsICdjb21wb25lbnRzJywgICAgICBbICflvIAnLCAn5b2hJywgXSwgICAgICAgICAgICAgXVxuICBdXG5cbiMgcG9zfGd1aWRlL2t3aWMvc29ydGNvZGVcblxuIyAjIFtcbiMgIyBcIjEwMjd+fn5+LDAwXCIsXCIwMTU2fn5+fiwwMSwwNTA5fn5+fiwwMiwwMDAwfn5+fiwwMywtLS0tLS0tLSwwNCwtLS0tLS0tLSwwNSwtLS0tLS0tLSwwNiwtLS0tLS0tLSwwNywtLS0tLS0tLSwwOCwtLS0tLS0tLSwwOSwtLS0tLS0tLSwxMCwtLS0tLS0tLSwxMSwtLS0tLS0tLSwxMixcIlxuIyAjIFwiMDE1Nn5+fn4sMDFcIixcIjA1MDl+fn5+LDAyLDAwMDB+fn5+LDAzLC0tLS0tLS0tLDA0LC0tLS0tLS0tLDA1LC0tLS0tLS0tLDA2LC0tLS0tLS0tLDA3LC0tLS0tLS0tLDA4LC0tLS0tLS0tLDA5LC0tLS0tLS0tLDEwLC0tLS0tLS0tLDExLC0tLS0tLS0tLDEyLDEwMjd+fn5+LDAwLFwiXG4jICMgXCIwNTA5fn5+fiwwMlwiLFwiMDAwMH5+fn4sMDMsLS0tLS0tLS0sMDQsLS0tLS0tLS0sMDUsLS0tLS0tLS0sMDYsLS0tLS0tLS0sMDcsLS0tLS0tLS0sMDgsLS0tLS0tLS0sMDksLS0tLS0tLS0sMTAsLS0tLS0tLS0sMTEsLS0tLS0tLS0sMTIsMTAyN35+fn4sMDAsMDE1Nn5+fn4sMDEsXCJcbiMgIyBcIjAwMDB+fn5+LDAzXCIsXCItLS0tLS0tLSwwNCwtLS0tLS0tLSwwNSwtLS0tLS0tLSwwNiwtLS0tLS0tLSwwNywtLS0tLS0tLSwwOCwtLS0tLS0tLSwwOSwtLS0tLS0tLSwxMCwtLS0tLS0tLSwxMSwtLS0tLS0tLSwxMiwxMDI3fn5+fiwwMCwwMTU2fn5+fiwwMSwwNTA5fn5+fiwwMixcIlxuIyAjIF1cblxuIyAwMDg3fn5+fiwwMCwwMjkxfn5+fiwwMSwwNTU1fn5+fiwwMiwtLS0tLS0tLSwwMywtLS0tLS0tLSwwNCwtLS0tLS0tLSwwNSwtLS0tLS0tLSwwNiwtLS0tLS0tLSwwNywtLS0tLS0tLSwwOCwtLS0tLS0tLSwwOSwtLS0tLS0tLSwxMCwtLS0tLS0tLSwxMSwtLS0tLS0tLSwxMix88KaWiHwwXG4jIDAwODd+fn5+LDAwLDAyOTF+fn5+LDAxLDA4MjN4MmgtLDAyLC0tLS0tLS0tLDAzLC0tLS0tLS0tLDA0LC0tLS0tLS0tLDA1LC0tLS0tLS0tLDA2LC0tLS0tLS0tLDA3LC0tLS0tLS0tLDA4LC0tLS0tLS0tLDA5LC0tLS0tLS0tLDEwLC0tLS0tLS0tLDExLC0tLS0tLS0tLDEyLHzogZd8MFxuIyAwMDg3fn5+fiwwMCwwMjkxfn5+fiwwMSwxMDIzfn5+fiwwMiwtLS0tLS0tLSwwMywtLS0tLS0tLSwwNCwtLS0tLS0tLSwwNSwtLS0tLS0tLSwwNiwtLS0tLS0tLSwwNywtLS0tLS0tLSwwOCwtLS0tLS0tLSwwOSwtLS0tLS0tLSwxMCwtLS0tLS0tLSwxMSwtLS0tLS0tLSwxMix88KSLlXwwXG4jIDAwODd+fn5+LDAwLDAyOTR+fn5+LDAxLDAwNjB+fn5+LDAyLC0tLS0tLS0tLDAzLC0tLS0tLS0tLDA0LC0tLS0tLS0tLDA1LC0tLS0tLS0tLDA2LC0tLS0tLS0tLDA3LC0tLS0tLS0tLDA4LC0tLS0tLS0tLDA5LC0tLS0tLS0tLDEwLC0tLS0tLS0tLDExLC0tLS0tLS0tLDEyLHzwppaUfDBcbiMgMDA4N35+fn4sMDAsMDI5NH5+fn4sMDEsMDU1NX5+fn4sMDIsLS0tLS0tLS0sMDMsLS0tLS0tLS0sMDQsLS0tLS0tLS0sMDUsLS0tLS0tLS0sMDYsLS0tLS0tLS0sMDcsLS0tLS0tLS0sMDgsLS0tLS0tLS0sMDksLS0tLS0tLS0sMTAsLS0tLS0tLS0sMTEsLS0tLS0tLS0sMTIsfPCml4Z8MFxuIyAwMDg3fn5+fiwwMCwwMjk1fn5+fiwwMSwwODAyfn5+fiwwMiwwOTU4fn5+fiwwMywtLS0tLS0tLSwwNCwtLS0tLS0tLSwwNSwtLS0tLS0tLSwwNiwtLS0tLS0tLSwwNywtLS0tLS0tLSwwOCwtLS0tLS0tLSwwOSwtLS0tLS0tLSwxMCwtLS0tLS0tLSwxMSwtLS0tLS0tLSwxMix88KWqu3wwXG4jIDAwODd+fn5+LDAwLDAzMTJ+fn5+LDAxLC0tLS0tLS0tLDAyLC0tLS0tLS0tLDAzLC0tLS0tLS0tLDA0LC0tLS0tLS0tLDA1LC0tLS0tLS0tLDA2LC0tLS0tLS0tLDA3LC0tLS0tLS0tLDA4LC0tLS0tLS0tLDA5LC0tLS0tLS0tLDEwLC0tLS0tLS0tLDExLC0tLS0tLS0tLDEyLHzwppSyfDBcbiMgMDA4N35+fn4sMDAsMDMxNH5+fn4sMDEsMTE3M35+fn4sMDIsLS0tLS0tLS0sMDMsLS0tLS0tLS0sMDQsLS0tLS0tLS0sMDUsLS0tLS0tLS0sMDYsLS0tLS0tLS0sMDcsLS0tLS0tLS0sMDgsLS0tLS0tLS0sMDksLS0tLS0tLS0sMTAsLS0tLS0tLS0sMTEsLS0tLS0tLS0sMTIsfPCmlYB8MFxuIyAwMDg3fn5+fiwwMCwwMzE5fn5+fiwwMSwtLS0tLS0tLSwwMiwtLS0tLS0tLSwwMywtLS0tLS0tLSwwNCwtLS0tLS0tLSwwNSwtLS0tLS0tLSwwNiwtLS0tLS0tLSwwNywtLS0tLS0tLSwwOCwtLS0tLS0tLSwwOSwtLS0tLS0tLSwxMCwtLS0tLS0tLSwxMSwtLS0tLS0tLSwxMix88KaVh3wwXG4jIDAwODd+fn5+LDAwLDAzNTV+fn5+LDAxLC0tLS0tLS0tLDAyLC0tLS0tLS0tLDAzLC0tLS0tLS0tLDA0LC0tLS0tLS0tLDA1LC0tLS0tLS0tLDA2LC0tLS0tLS0tLDA3LC0tLS0tLS0tLDA4LC0tLS0tLS0tLDA5LC0tLS0tLS0tLDEwLC0tLS0tLS0tLDExLC0tLS0tLS0tLDEyLHzwppWGfDBcbiMgMDA4N35+fn4sMDAsMDM3M35+fn4sMDEsMDI4NH5+fn4sMDIsLS0tLS0tLS0sMDMsLS0tLS0tLS0sMDQsLS0tLS0tLS0sMDUsLS0tLS0tLS0sMDYsLS0tLS0tLS0sMDcsLS0tLS0tLS0sMDgsLS0tLS0tLS0sMDksLS0tLS0tLS0sMTAsLS0tLS0tLS0sMTEsLS0tLS0tLS0sMTIsfPCmlad8MFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwid3JpdGUgd2l0aG91dCBlcnJvclwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ID0gLTFcbiAgd3JpdGVfc2V0dGluZ3MgPVxuICAgIGJhdGNoOiAxMFxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBAX2ZlZWRfdGVzdF9kYXRhIGRiLCBwcm9iZXNfaWR4LCB3cml0ZV9zZXR0aW5ncywgcmVzdW1lXG4gICAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZWFkIHdpdGhvdXQgZXJyb3JcIiBdID0gKCBULCBkb25lICkgLT5cbiAgcHJvYmVzX2lkeCAgPSAwXG4gIGlkeCA9IC0xXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIGRlYnVnICfCqTdsRWd5JywgZGJbJyVzZWxmJ10uaXNDbG9zZWQoKVxuICAgIGRlYnVnICfCqTdsRWd5JywgZGJbJyVzZWxmJ10uaXNPcGVuKClcbiAgICB5aWVsZCBAX2ZlZWRfdGVzdF9kYXRhIGRiLCBwcm9iZXNfaWR4LCByZXN1bWVcbiAgICAjIGRvbmUoKVxuICAgIGlucHV0ID0gSE9MTEVSSVRILmNyZWF0ZV9mYWNldHN0cmVhbSBkYlxuICAgIGlucHV0XG4gICAgICAjIC5waXBlIEhPTExFUklUSC4kdXJsX2Zyb21fa2V5IGRiXG4gICAgICAucGlwZSAkICggWyBrZXksIHZhbHVlLCBdLCBzZW5kICkgPT5cbiAgICAgICAgaWR4ICs9ICsxXG4gICAgICAgICMgVC5lcSBrZXksIG1hdGNoZXJzWyBpZHggXVxuICAgICAgLnBpcGUgRC4kb25fZW5kID0+IGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCBrZXlzIHdpdGhvdXQgZXJyb3IgKDEpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEhPTExFUklUSC5jbGVhciBkYiwgcmVzdW1lXG4gICAgIyMjIFRBSU5UIGF3YWl0aW5nIGJldHRlciBzb2x1dGlvbiAjIyNcbiAgICBOVUxMID0gSE9MTEVSSVRILl9lbmNvZGVfdmFsdWUgZGIsIDFcbiAgICBmb3IgaWR4IGluIFsgMCAuLi4gMTAgXVxuICAgICAgZGJbICclc2VsZicgXS5wdXQgKCBIT0xMRVJJVEguX2VuY29kZV9rZXkgZGIsIFsgJ3gnLCBpZHgsICd4JywgXSApLCBOVUxMXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwcm9iZV9pZHggPSA0XG4gICAgY291bnQgICAgID0gMFxuICAgIHF1ZXJ5ICAgICA9IEhPTExFUklUSC5fcXVlcnlfZnJvbV9wcmVmaXggZGIsIFsgJ3gnLCBwcm9iZV9pZHgsIF1cbiAgICBpbnB1dCAgICAgPSBkYlsgJyVzZWxmJyBdLmNyZWF0ZVJlYWRTdHJlYW0gcXVlcnlcbiAgICBpbnB1dFxuICAgICAgLnBpcGUgJCAoIHsga2V5LCB2YWx1ZSwgfSwgc2VuZCApID0+XG4gICAgICAgIGNvdW50ICs9IDFcbiAgICAgICAgVC5lcSAoIEhPTExFUklUSC5fZGVjb2RlX2tleSBkYiwga2V5IClbIDEgXSwgcHJvYmVfaWR4XG4gICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgVC5lcSBjb3VudCwgMVxuICAgICAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQga2V5cyB3aXRob3V0IGVycm9yICgyKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBIT0xMRVJJVEguY2xlYXIgZGIsIHJlc3VtZVxuICAgICMjIyBUQUlOVCBhd2FpdGluZyBiZXR0ZXIgc29sdXRpb24gIyMjXG4gICAgTlVMTCA9IEhPTExFUklUSC5fZW5jb2RlX3ZhbHVlIGRiLCAxXG4gICAgZm9yIGlkeCBpbiBbIDAgLi4uIDEwIF1cbiAgICAgIGRiWyAnJXNlbGYnIF0ucHV0ICggSE9MTEVSSVRILl9lbmNvZGVfa2V5IGRiLCBbICd4JywgaWR4LCAneCcsIF0gKSwgTlVMTFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcHJvYmVfaWR4ID0gNFxuICAgIGNvdW50ICAgICA9IDBcbiAgICBwcmVmaXggICAgPSBbICd4JywgcHJvYmVfaWR4LCBdXG4gICAgaW5wdXQgICAgID0gSE9MTEVSSVRILmNyZWF0ZV9mYWNldHN0cmVhbSBkYiwgcHJlZml4XG4gICAgaW5wdXRcbiAgICAgIC5waXBlICQgKCBmYWNldCwgc2VuZCApID0+XG4gICAgICAgIGNvdW50ICs9IDFcbiAgICAgICAgWyBrZXksIHZhbHVlLCBdID0gZmFjZXRcbiAgICAgICAgVC5lcSBrZXlbIDEgXSwgcHJvYmVfaWR4XG4gICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgVC5lcSBjb3VudCwgMVxuICAgICAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQga2V5cyB3aXRob3V0IGVycm9yICgzKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBIT0xMRVJJVEguY2xlYXIgZGIsIHJlc3VtZVxuICAgICMjIyBUQUlOVCBhd2FpdGluZyBiZXR0ZXIgc29sdXRpb24gIyMjXG4gICAgTlVMTCA9IEhPTExFUklUSC5fZW5jb2RlX3ZhbHVlIGRiLCAxXG4gICAgZm9yIGlkeCBpbiBbIDAgLi4uIDEwIF1cbiAgICAgIGRiWyAnJXNlbGYnIF0ucHV0ICggSE9MTEVSSVRILl9lbmNvZGVfa2V5IGRiLCBbICd4JywgaWR4LCAneCcsIF0gKSwgTlVMTFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcHJvYmVfaWR4ID0gM1xuICAgIGNvdW50ICAgICA9IDBcbiAgICBkZWx0YSAgICAgPSAyXG4gICAgbG8gICAgICAgID0gWyAneCcsIHByb2JlX2lkeCwgXVxuICAgIGhpICAgICAgICA9IFsgJ3gnLCBwcm9iZV9pZHggKyBkZWx0YSwgXVxuICAgIHF1ZXJ5ICAgICA9IHsgZ3RlOiAoIEhPTExFUklUSC5fZW5jb2RlX2tleSBkYiwgbG8gKSwgbHRlOiAoIEhPTExFUklUSC5fcXVlcnlfZnJvbV9wcmVmaXggZGIsIGhpIClbICdsdGUnIF0sIH1cbiAgICBpbnB1dCAgICAgPSBkYlsgJyVzZWxmJyBdLmNyZWF0ZVJlYWRTdHJlYW0gcXVlcnlcbiAgICBpbnB1dFxuICAgICAgLnBpcGUgJCAoIHsga2V5LCB2YWx1ZSwgfSwgc2VuZCApID0+XG4gICAgICAgIGNvdW50ICs9IDFcbiAgICAgICAgVC5lcSAoIEhPTExFUklUSC5fZGVjb2RlX2tleSBkYiwga2V5IClbIDEgXSwgcHJvYmVfaWR4ICsgY291bnQgLSAxXG4gICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgVC5lcSBjb3VudCwgZGVsdGEgKyAxXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCBrZXlzIHdpdGhvdXQgZXJyb3IgKDQpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEhPTExFUklUSC5jbGVhciBkYiwgcmVzdW1lXG4gICAgZm9yIGlkeCBpbiBbIDAgLi4uIDEwIF1cbiAgICAgIGRiWyAnJXNlbGYnIF0ucHV0ICggSE9MTEVSSVRILl9lbmNvZGVfa2V5IGRiLCBbICd4JywgaWR4LCAneCcsIF0gKSwgSE9MTEVSSVRILl9lbmNvZGVfdmFsdWUgZGIsIDFcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHByb2JlX2lkeCA9IDNcbiAgICBjb3VudCAgICAgPSAwXG4gICAgZGVsdGEgICAgID0gMlxuICAgIGxvICAgICAgICA9IFsgJ3gnLCBwcm9iZV9pZHgsIF1cbiAgICBoaSAgICAgICAgPSBbICd4JywgcHJvYmVfaWR4ICsgZGVsdGEsIF1cbiAgICBpbnB1dCAgICAgPSBIT0xMRVJJVEguY3JlYXRlX2ZhY2V0c3RyZWFtIGRiLCBsbywgaGlcbiAgICBpbnB1dFxuICAgICAgLnBpcGUgJCAoIFsga2V5LCB2YWx1ZSwgXSwgc2VuZCApID0+XG4gICAgICAgIGNvdW50ICs9IDFcbiAgICAgICAgVC5lcSBrZXlbIDEgXSwgcHJvYmVfaWR4ICsgY291bnQgLSAxXG4gICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgVC5lcSBjb3VudCwgZGVsdGEgKyAxXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwiY3JlYXRlX2ZhY2V0c3RyZWFtIHRocm93cyB3aXRoIHdyb25nIGFyZ3VtZW50c1wiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBtZXNzYWdlID0gXCJtdXN0IGdpdmUgYGxvX2hpbnRgIHdoZW4gYGhpX2hpbnRgIGlzIGdpdmVuXCJcbiAgVC50aHJvd3MgbWVzc2FnZSwgKCAtPiBIT0xMRVJJVEguY3JlYXRlX2ZhY2V0c3RyZWFtIGRiLCBudWxsLCBbICd4eHgnLCBdIClcbiAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZWFkIFBPUyBmYWNldHNcIiBdID0gKCBULCBkb25lICkgLT5cbiAgcHJvYmVzX2lkeCAgPSAwXG4gIGlkeCAgICAgICAgID0gLTFcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBrZXlfbWF0Y2hlcnMgPSBbXG4gICAgWyAncG9zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAyLCAn8Ke3nzInIF1cbiAgICBbICdwb3MnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDMsICfwp7efMycgXVxuICAgIFsgJ3BvcycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgNCwgJ/Cnt580JyBdXG4gICAgXVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHBocmFzZV9tYXRjaGVycyA9IFtcbiAgICBbICdwb3MnLCAn8Ke3nzInLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDIgXVxuICAgIFsgJ3BvcycsICfwp7efMycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgMyBdXG4gICAgWyAncG9zJywgJ/Cnt580JywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCA0IF1cbiAgICBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgQF9mZWVkX3Rlc3RfZGF0YSBkYiwgcHJvYmVzX2lkeCwgcmVzdW1lXG4gICAgbG8gPSBbICdwb3MnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDIsIF1cbiAgICBoaSA9IFsgJ3BvcycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgNCwgXVxuICAgICMgaW5wdXQgICA9IEhPTExFUklUSC5jcmVhdGVfa2V5c3RyZWFtIGRiLCBsb1xuICAgIGlucHV0ICAgPSBIT0xMRVJJVEguY3JlYXRlX2ZhY2V0c3RyZWFtIGRiLCBsbywgaGlcbiAgICBpbnB1dFxuICAgICAgIyAucGlwZSBIT0xMRVJJVEguJHVybF9mcm9tX2tleSBkYlxuICAgICAgLnBpcGUgJCAoIFsga2V5LCB2YWx1ZSwgXSwgc2VuZCApID0+XG4gICAgICAgIGlkeCArPSArMVxuICAgICAgICBwaHJhc2UgPSBIT0xMRVJJVEguYXNfcGhyYXNlIGRiLCBrZXksIHZhbHVlXG4gICAgICAgIFQuZXEga2V5LCBrZXlfbWF0Y2hlcnNbIGlkeCBdXG4gICAgICAgIFQuZXEgcGhyYXNlLCBwaHJhc2VfbWF0Y2hlcnNbIGlkeCBdXG4gICAgICAucGlwZSBELiRvbl9lbmQgPT4gZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZWFkIFBPUyBwaHJhc2VzICgxKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ICAgICAgICAgPSAtMVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIG1hdGNoZXJzID0gW1xuICAgIFsgJ3BvcycsICfwp7efMicsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgMiBdXG4gICAgWyAncG9zJywgJ/Cnt58zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAzIF1cbiAgICBbICdwb3MnLCAn8Ke3nzQnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDQgXVxuICAgIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBAX2ZlZWRfdGVzdF9kYXRhIGRiLCBwcm9iZXNfaWR4LCByZXN1bWVcbiAgICBsbyA9IFsgJ3BvcycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgMiwgXVxuICAgIGhpID0gWyAncG9zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCA0LCBdXG4gICAgaW5wdXQgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBsbywgaGlcbiAgICBpbnB1dFxuICAgICAgLnBpcGUgJCAoIHBocmFzZSwgc2VuZCApID0+XG4gICAgICAgIGlkeCArPSArMVxuICAgICAgICBULmVxIHBocmFzZSwgbWF0Y2hlcnNbIGlkeCBdXG4gICAgICAucGlwZSBELiRvbl9lbmQgPT4gZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZWFkIFBPUyBwaHJhc2VzICgyKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ICAgICAgICAgPSAtMVxuICBjb3VudCAgICAgICA9IDBcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBtYXRjaGVycyA9IFtcbiAgICBbICdwb3MnLCAn8Ke3nycsICdndWlkZS91Y2hyL2hhcycsICflhasnLCAwIF1cbiAgICBbICdwb3MnLCAn8Ke3nycsICdndWlkZS91Y2hyL2hhcycsICfliIAnLCAxIF1cbiAgICBbICdwb3MnLCAn8Ke3nycsICdndWlkZS91Y2hyL2hhcycsICflroAnLCAyIF1cbiAgICBbICdwb3MnLCAn8Ke3nycsICdndWlkZS91Y2hyL2hhcycsICfosp0nLCA0IF1cbiAgICBbICdwb3MnLCAn8Ke3nycsICdndWlkZS91Y2hyL2hhcycsICfuh7onLCAzIF1cbiAgICBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgQF9mZWVkX3Rlc3RfZGF0YSBkYiwgcHJvYmVzX2lkeCwgcmVzdW1lXG4gICAgcHJlZml4ICAgID0gWyAncG9zJywgJ2d1aWRlL3VjaHIvaGFzJywgXVxuICAgIGlucHV0ICAgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBwcmVmaXhcbiAgICBzZXR0aW5ncyAgPSB7IGluZGV4ZWQ6IG5vLCB9XG4gICAgaW5wdXRcbiAgICAgIC5waXBlICQgKCBwaHJhc2UsIHNlbmQgKSA9PlxuICAgICAgICBkZWJ1ZyAnwqlEc0FmWScsIHJwciBwaHJhc2VcbiAgICAgICAgY291bnQgICs9ICsxXG4gICAgICAgIGlkeCAgICArPSArMVxuICAgICAgICBULmVxIHBocmFzZSwgbWF0Y2hlcnNbIGlkeCBdXG4gICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgVC5lcSBjb3VudCwgbWF0Y2hlcnMubGVuZ3RoXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCBTUE8gcGhyYXNlc1wiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBkZWJ1ZyAnwqlSc294YicsIGRiWyAnJXNlbGYnIF0uaXNPcGVuKClcbiAgcHJvYmVzX2lkeCAgPSAwXG4gIGlkeCAgICAgICAgID0gLTFcbiAgY291bnQgICAgICAgPSAwXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgbWF0Y2hlcnMgPSBbXG4gICAgWyAnc3BvJywgJ/Cnt58nLCAnY3AvY2lkJywgMTYzMjk1IF1cbiAgICBbICdzcG8nLCAn8Ke3nycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgNSBdXG4gICAgWyAnc3BvJywgJ/Cnt58nLCAnZ3VpZGUvdWNoci9oYXMnLCBbICflhasnLCAn5YiAJywgJ+WugCcsICfuh7onLCAn6LKdJyBdIF1cbiAgICBbICdzcG8nLCAn8Ke3nycsICdyYW5rL2NqdCcsIDU0MzIgXVxuICAgIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBAX2ZlZWRfdGVzdF9kYXRhIGRiLCBwcm9iZXNfaWR4LCByZXN1bWVcbiAgICBwcmVmaXggID0gWyAnc3BvJywgJ/Cnt58nLCBdXG4gICAgaW5wdXQgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBwcmVmaXhcbiAgICBpbnB1dFxuICAgICAgLnBpcGUgJCAoIHBocmFzZSwgc2VuZCApID0+XG4gICAgICAgIGRlYnVnICfCqURzQWZZJywgcnByIHBocmFzZVxuICAgICAgICBjb3VudCAgKz0gKzFcbiAgICAgICAgaWR4ICAgICs9ICsxXG4gICAgICAgIFQuZXEgcGhyYXNlLCBtYXRjaGVyc1sgaWR4IF1cbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICBULmVxIGNvdW50LCBtYXRjaGVycy5sZW5ndGhcbiAgICAgICAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZWFkIHdpdGggc3ViLXJlYWQgKDEpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHByb2Jlc19pZHggID0gMFxuICBpZHggICAgICAgICA9IC0xXG4gIGNvdW50ICAgICAgID0gMFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIG1hdGNoZXJzID0gW1xuICAgIFsgJ/Cnt58nLCBbICdzcG8nLCAn5YWrJywgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCAnMzQnIF0gXVxuICAgIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBAX2ZlZWRfdGVzdF9kYXRhIGRiLCBwcm9iZXNfaWR4LCByZXN1bWVcbiAgICBwcmVmaXggICAgPSBbICdzcG8nLCAn8Ke3nycsICdndWlkZS91Y2hyL2hhcycsIF1cbiAgICBpbnB1dCAgICAgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgcHJlZml4XG4gICAgc2V0dGluZ3MgID0geyBpbmRleGVkOiBubywgfVxuICAgIGlucHV0XG4gICAgICAucGlwZSBIT0xMRVJJVEgucmVhZF9zdWIgZGIsIHNldHRpbmdzLCAoIFsgcGhyYXNldHlwZSwgZ2x5cGgsIHByZCwgZ3VpZGVzLCBdICkgPT5cbiAgICAgICAgc3ViX2lucHV0ID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIFsgJ3NwbycsIGd1aWRlc1sgMCBdLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsIF1cbiAgICAgICAgcmV0dXJuIFsgZ2x5cGgsIHN1Yl9pbnB1dCwgXVxuICAgICAgLnBpcGUgJCAoIHBocmFzZSwgc2VuZCApID0+XG4gICAgICAgIGNvdW50ICArPSArMVxuICAgICAgICBpZHggICAgKz0gKzFcbiAgICAgICAgVC5lcSBwaHJhc2UsIG1hdGNoZXJzWyBpZHggXVxuICAgICAgLnBpcGUgRC4kb25fZW5kID0+XG4gICAgICAgIFQuZXEgY291bnQsIG1hdGNoZXJzLmxlbmd0aFxuICAgICAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgd2l0aCBzdWItcmVhZCAoMilcIiBdID0gKCBULCBkb25lICkgLT5cbiAgcHJvYmVzX2lkeCAgPSAwXG4gIGlkeCAgICAgICAgID0gLTFcbiAgY291bnQgICAgICAgPSAwXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgbWF0Y2hlcnMgPSBbXG4gICAgWyAn8Ke3nycsIFsgJ3NwbycsICflhasnLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICczNCcgXSBdXG4gICAgWyAn8Ke3nycsIFsgJ3NwbycsICfliIAnLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICc1KDEyKTMnIF0gXVxuICAgIFsgJ/Cnt58nLCBbICdzcG8nLCAn5a6AJywgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCAnNDQnIF0gXVxuICAgIFsgJ/Cnt58nLCBbICdzcG8nLCAn6LKdJywgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCAnMjUoMTIpJyBdIF1cbiAgICBbICfwp7efJywgWyAnc3BvJywgJ+6HuicsICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgJzEyJyBdIF1cbiAgICBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgQF9mZWVkX3Rlc3RfZGF0YSBkYiwgcHJvYmVzX2lkeCwgcmVzdW1lXG4gICAgcHJlZml4ICAgID0gWyAncG9zJywgJ2d1aWRlL3VjaHIvaGFzJywgXVxuICAgIGlucHV0ICAgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBwcmVmaXhcbiAgICBzZXR0aW5ncyAgPSB7IGluZGV4ZWQ6IG5vLCB9XG4gICAgaW5wdXRcbiAgICAgIC5waXBlIEhPTExFUklUSC5yZWFkX3N1YiBkYiwgc2V0dGluZ3MsICggcGhyYXNlICkgPT5cbiAgICAgICAgWyBfLCBnbHlwaCwgcHJkLCBndWlkZSwgXSA9IHBocmFzZVxuICAgICAgICBwcmVmaXggICAgICAgICAgICAgICAgICAgID0gWyAnc3BvJywgZ3VpZGUsICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgXVxuICAgICAgICBzdWJfaW5wdXQgICAgICAgICAgICAgICAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIHByZWZpeFxuICAgICAgICByZXR1cm4gWyBnbHlwaCwgc3ViX2lucHV0LCBdXG4gICAgICAucGlwZSAkICggcGhyYXNlLCBzZW5kICkgPT5cbiAgICAgICAgZGVidWcgJ8KpcXVQYmcnLCBKU09OLnN0cmluZ2lmeSBwaHJhc2VcbiAgICAgICAgY291bnQgICs9ICsxXG4gICAgICAgIGlkeCAgICArPSArMVxuICAgICAgICBULmVxIHBocmFzZSwgbWF0Y2hlcnNbIGlkeCBdXG4gICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgVC5lcSBjb3VudCwgbWF0Y2hlcnMubGVuZ3RoXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCB3aXRoIHN1Yi1yZWFkICgzKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBAX3JlYWRfd2l0aF9zdWJfcmVhZF8zIFQsIGJhdGNoOiAwLCAgICByZXN1bWVcbiAgICB5aWVsZCBAX3JlYWRfd2l0aF9zdWJfcmVhZF8zIFQsIGJhdGNoOiAzLCAgICByZXN1bWVcbiAgICB5aWVsZCBAX3JlYWRfd2l0aF9zdWJfcmVhZF8zIFQsIGJhdGNoOiA1LCAgICByZXN1bWVcbiAgICB5aWVsZCBAX3JlYWRfd2l0aF9zdWJfcmVhZF8zIFQsIGJhdGNoOiAxMDAwLCByZXN1bWVcbiAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX3JlYWRfd2l0aF9zdWJfcmVhZF8zID0gKCBULCB3cml0ZV9zZXR0aW5ncywgZG9uZSApIC0+XG4gIHByb2Jlc19pZHggID0gMFxuICBpZHggICAgICAgICA9IC0xXG4gIGNvdW50ICAgICAgID0gMFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIG1hdGNoZXJzID0gW1xuICAgIFtbXCLwp7efXCIsXCLlhatcIixcIjM0XCJdLCAgICAgIFtcInNwb1wiLFwi5YWrXCIsXCJyYW5rL2NqdFwiLDEyNTQxXV1cbiAgICBbW1wi8Ke3n1wiLFwi5YiAXCIsXCI1KDEyKTNcIl0sICBbXCJzcG9cIixcIuWIgFwiLFwicmFuay9janRcIiwxMjU0Ml1dXG4gICAgW1tcIvCnt59cIixcIuWugFwiLFwiNDRcIl0sICAgICAgW1wic3BvXCIsXCLlroBcIixcInJhbmsvY2p0XCIsMTI1NDNdXVxuICAgIFtbXCLwp7efXCIsXCLosp1cIixcIjI1KDEyKVwiXSwgIFtcInNwb1wiLFwi6LKdXCIsXCJyYW5rL2NqdFwiLDEyNTQ1XV1cbiAgICBbW1wi8Ke3n1wiLFwi7oe6XCIsXCIxMlwiXSwgICAgICBbXCJzcG9cIixcIu6HulwiLFwicmFuay9janRcIiwxMjU0NF1dXG4gICAgXVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHdyaXRlX3NldHRpbmdzLCByZXN1bWVcbiAgICBwcmVmaXggICAgICAgID0gWyAncG9zJywgJ2d1aWRlL3VjaHIvaGFzJywgXVxuICAgIGlucHV0ICAgICAgICAgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgcHJlZml4XG4gICAgcmVhZF9zZXR0aW5ncyA9IHsgaW5kZXhlZDogbm8sIH1cbiAgICBpbnB1dFxuICAgICAgLnBpcGUgSE9MTEVSSVRILnJlYWRfc3ViIGRiLCByZWFkX3NldHRpbmdzLCAoIHBocmFzZSApID0+XG4gICAgICAgIFsgXywgZ2x5cGgsIHByZCwgZ3VpZGUsIF0gPSBwaHJhc2VcbiAgICAgICAgcHJlZml4ICAgICAgICAgICAgICAgICAgICA9IFsgJ3NwbycsIGd1aWRlLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsIF1cbiAgICAgICAgc3ViX2lucHV0ICAgICAgICAgICAgICAgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBwcmVmaXhcbiAgICAgICAgcmV0dXJuIFsgZ2x5cGgsIHN1Yl9pbnB1dCwgXVxuICAgICAgLnBpcGUgSE9MTEVSSVRILnJlYWRfc3ViIGRiLCByZWFkX3NldHRpbmdzLCAoIHhwaHJhc2UgKSA9PlxuICAgICAgICBbIGdseXBoLCBbIF8sIGd1aWRlLCBwcmQsIHNoYXBlY2xhc3MsIF0gXSA9IHhwaHJhc2VcbiAgICAgICAgcHJlZml4ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBbICdzcG8nLCBndWlkZSwgJ3JhbmsvY2p0JywgXVxuICAgICAgICBzdWJfaW5wdXQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBwcmVmaXhcbiAgICAgICAgcmV0dXJuIFsgWyBnbHlwaCwgZ3VpZGUsIHNoYXBlY2xhc3MsIF0sIHN1Yl9pbnB1dCwgXVxuICAgICAgLnBpcGUgJCAoIHhwaHJhc2UsIHNlbmQgKSA9PlxuICAgICAgICBkZWJ1ZyAnwqlxdVBiZycsIEpTT04uc3RyaW5naWZ5IHhwaHJhc2VcbiAgICAgICAgY291bnQgICs9ICsxXG4gICAgICAgIGlkeCAgICArPSArMVxuICAgICAgICBULmVxIHhwaHJhc2UsIG1hdGNoZXJzWyBpZHggXVxuICAgICAgLnBpcGUgRC4kb25fZW5kID0+XG4gICAgICAgIFQuZXEgY291bnQsIG1hdGNoZXJzLmxlbmd0aFxuICAgICAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInNvcnRpbmcgKDEpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHNldHRpbmdzID1cbiAgICAgIGRiOiAgICAgICAgICAgbGV2ZWxkb3duXG4gICAgICBrZXlFbmNvZGluZzogICdiaW5hcnknXG4gICAgbGV2ZWxkYiA9IGxldmVsdXAgJy90bXAvaG9sbGVyaXRoMi10ZXN0Jywgc2V0dGluZ3NcbiAgICB5aWVsZCBjbGVhcl9sZXZlbGRiIGxldmVsZGIsIHJlc3VtZVxuICAgIHByb2JlcyA9IFtcbiAgICAgICdhJ1xuICAgICAgJ2FiJ1xuICAgICAgJ2FiYydcbiAgICAgICdhYmNcXHgwMCdcbiAgICAgICdhYmNcXHgwMGEnXG4gICAgICAnYWJjYSdcbiAgICAgICdhYmNiJ1xuICAgICAgJ2FiY2MnXG4gICAgICAnYWJjZCdcbiAgICAgICdhYmNkZSdcbiAgICAgICdhYmNkZWYnXG4gICAgICAnYWJjZGVmZycgXVxuICAgIG1hdGNoZXJzID0gW1xuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCAweDYyLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgMHg2MiwgMHg2MywgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIDB4NjIsIDB4NjMsIDB4MDAsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCAweDYyLCAweDYzLCAweDAwLCAweDYxLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgMHg2MiwgMHg2MywgMHg2MSwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIDB4NjIsIDB4NjMsIDB4NjIsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCAweDYyLCAweDYzLCAweDYzLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgMHg2MiwgMHg2MywgMHg2NCwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIDB4NjIsIDB4NjMsIDB4NjQsIDB4NjUsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCAweDYyLCAweDYzLCAweDY0LCAweDY1LCAweDY2LCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgMHg2MiwgMHg2MywgMHg2NCwgMHg2NSwgMHg2NiwgMHg2NywgXSBdXG4gICAgQ05ELnNodWZmbGUgcHJvYmVzXG4gICAgZm9yIHByb2JlIGluIHByb2Jlc1xuICAgICAgcHJvYmVfYmZyID0gbmV3IEJ1ZmZlciBwcm9iZSwgJ3V0Zi04J1xuICAgICAgeWllbGQgbGV2ZWxkYi5wdXQgcHJvYmVfYmZyLCAnMScsIHJlc3VtZVxuICAgICAgcHJvYmVfYmZycyA9IHlpZWxkIHJlYWRfYWxsX2tleXMgbGV2ZWxkYiwgcmVzdW1lXG4gICAgcHJvYmVfYmZycyA9IHlpZWxkIHJlYWRfYWxsX2tleXMgbGV2ZWxkYiwgcmVzdW1lXG4gICAgIyBkZWJ1ZyAnwqlSWFB2dicsICdcXG4nICsgcnByIHByb2JlX2JmcnNcbiAgICBmb3IgcHJvYmVfYmZyLCBwcm9iZV9pZHggaW4gcHJvYmVfYmZyc1xuICAgICAgbWF0Y2hlciA9IG1hdGNoZXJzWyBwcm9iZV9pZHggXVxuICAgICAgIyMjIFRBSU5UIGxvb2tzIGxpa2UgYFQuZXEgYnVmZmVyMSwgYnVmZmVyMmAgZG9lc24ndCB3b3JrLS0tc29tZXRpbWVzLi4uICMjI1xuICAgICAgIyBULmVxIHByb2JlX2JmciwgbWF0Y2hlclxuICAgICAgVC5vayBwcm9iZV9iZnIuZXF1YWxzIG1hdGNoZXJcbiAgICBsZXZlbGRiLmNsb3NlIC0+IGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwic29ydGluZyAoMilcIiBdID0gKCBULCBkb25lICkgLT5cbiAgIyMjIFRoaXMgdGVzdCBpcyBoZXJlIGJlY2F1c2UgdGhlcmUgc2VlbWVkIHRvIG9jY3VyIHNvbWUgc3RyYW5nZSBvcmRlcmluZyBpc3N1ZXMgd2hlblxuICB1c2luZyBtZW1kb3duIGluc3RlYWQgb2YgbGV2ZWxkb3duICMjI1xuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICBzZXR0aW5ncyA9XG4gICAgICBkYjogICAgICAgICAgIGxldmVsZG93blxuICAgICAga2V5RW5jb2Rpbmc6ICAnYmluYXJ5J1xuICAgIGxldmVsZGIgPSBsZXZlbHVwICcvdG1wL2hvbGxlcml0aDItdGVzdCcsIHNldHRpbmdzXG4gICAgeWllbGQgY2xlYXJfbGV2ZWxkYiBsZXZlbGRiLCByZXN1bWVcbiAgICBwcm9iZXMgPSBbXG4gICAgICBuZXcgQnVmZmVyIFsgMHgwMCwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4MDEsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDAyLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHgwMywgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4ZjksIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweGZhLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHhmYiwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4ZmMsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweGZkLCBdXG4gICAgICBdXG4gICAgbWF0Y2hlcnMgPSAoIHByb2JlIGZvciBwcm9iZSBpbiBwcm9iZXMgKVxuICAgIENORC5zaHVmZmxlIHByb2Jlc1xuICAgIGZvciBwcm9iZSBpbiBwcm9iZXNcbiAgICAgIHlpZWxkIGxldmVsZGIucHV0IHByb2JlLCAnMScsIHJlc3VtZVxuICAgIHByb2JlX2JmcnMgPSB5aWVsZCByZWFkX2FsbF9rZXlzIGxldmVsZGIsIHJlc3VtZVxuICAgIGZvciBwcm9iZV9iZnIsIHByb2JlX2lkeCBpbiBwcm9iZV9iZnJzXG4gICAgICBtYXRjaGVyID0gbWF0Y2hlcnNbIHByb2JlX2lkeCBdXG4gICAgICAjIGRlYnVnICfCqTE1MDYwJywgcHJvYmVfaWR4LCBwcm9iZV9iZnIsIG1hdGNoZXJcbiAgICAgICMjIyBUQUlOVCBsb29rcyBsaWtlIGBULmVxIGJ1ZmZlcjEsIGJ1ZmZlcjJgIGRvZXNuJ3Qgd29yay0tLXNvbWV0aW1lcy4uLiAjIyNcbiAgICAgIFQub2sgcHJvYmVfYmZyLmVxdWFscyBtYXRjaGVyXG4gICAgbGV2ZWxkYi5jbG9zZSAtPiBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcIkgyIGNvZGVjIGBlbmNvZGVgIHRocm93cyBvbiBhbnl0aGluZyBidXQgYSBsaXN0XCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIFQudGhyb3dzIFwiZXhwZWN0ZWQgYSBsaXN0LCBnb3QgYSB0ZXh0XCIsICAgICAgICAgKCAtPiBDT0RFQy5lbmNvZGUgJ3VuYWNjYXB0YWJsZScgKVxuICBULnRocm93cyBcImV4cGVjdGVkIGEgbGlzdCwgZ290IGEgbnVtYmVyXCIsICAgICAgICggLT4gQ09ERUMuZW5jb2RlIDQyIClcbiAgVC50aHJvd3MgXCJleHBlY3RlZCBhIGxpc3QsIGdvdCBhIGJvb2xlYW5cIiwgICAgICAoIC0+IENPREVDLmVuY29kZSB0cnVlIClcbiAgVC50aHJvd3MgXCJleHBlY3RlZCBhIGxpc3QsIGdvdCBhIGJvb2xlYW5cIiwgICAgICAoIC0+IENPREVDLmVuY29kZSBmYWxzZSApXG4gIFQudGhyb3dzIFwiZXhwZWN0ZWQgYSBsaXN0LCBnb3QgYSBqc3VuZGVmaW5lZFwiLCAgKCAtPiBDT0RFQy5lbmNvZGUoKSApXG4gIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwic29ydCB0ZXh0cyB3aXRoIEgyIGNvZGVjICgxKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICBzZXR0aW5ncyA9XG4gICAgICBkYjogICAgICAgICAgIGxldmVsZG93blxuICAgICAga2V5RW5jb2Rpbmc6ICAnYmluYXJ5J1xuICAgIGxldmVsZGIgPSBsZXZlbHVwICcvdG1wL2hvbGxlcml0aDItdGVzdCcsIHNldHRpbmdzXG4gICAgeWllbGQgY2xlYXJfbGV2ZWxkYiBsZXZlbGRiLCByZXN1bWVcbiAgICBwcm9iZXMgPSBbXG4gICAgICAnYSdcbiAgICAgICdhYidcbiAgICAgICdhYmMnXG4gICAgICAnYWJjXFx4MDAnXG4gICAgICAnYWJjXFx4MDBhJ1xuICAgICAgJ2FiY2EnXG4gICAgICAnYWJjYVxceDAwJ1xuICAgICAgJ2FiY2InXG4gICAgICAnYWJjYydcbiAgICAgICdhYmNkJ1xuICAgICAgJ2FiY2RlJ1xuICAgICAgJ2FiY2RlZidcbiAgICAgICdhYmNkZWZnJ1xuICAgICAgXVxuICAgIG1hdGNoZXJzID0gKCBbIHByb2JlLCBdIGZvciBwcm9iZSBpbiBwcm9iZXMgKVxuICAgIENORC5zaHVmZmxlIHByb2Jlc1xuICAgIGZvciBwcm9iZSBpbiBwcm9iZXNcbiAgICAgIHlpZWxkIGxldmVsZGIucHV0ICggQ09ERUMuZW5jb2RlIFsgcHJvYmUsIF0gKSwgJzEnLCByZXN1bWVcbiAgICBwcm9iZV9iZnJzICA9IHlpZWxkIHJlYWRfYWxsX2tleXMgbGV2ZWxkYiwgcmVzdW1lXG4gICAgcHJvYmVzICAgICAgPSAoIENPREVDLmRlY29kZSBwcm9iZV9iZnIgZm9yIHByb2JlX2JmciBpbiBwcm9iZV9iZnJzIClcbiAgICBzaG93X2tleXNfYW5kX2tleV9iZnJzIHByb2JlcywgcHJvYmVfYmZyc1xuICAgIGZvciBwcm9iZSwgcHJvYmVfaWR4IGluIHByb2Jlc1xuICAgICAgbWF0Y2hlciA9IG1hdGNoZXJzWyBwcm9iZV9pZHggXVxuICAgICAgVC5lcSBwcm9iZSwgbWF0Y2hlclxuICAgIGxldmVsZGIuY2xvc2UgLT4gZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJzb3J0IHRleHRzIHdpdGggSDIgY29kZWMgKDIpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHNldHRpbmdzID1cbiAgICAgIGRiOiAgICAgICAgICAgbGV2ZWxkb3duXG4gICAgICBrZXlFbmNvZGluZzogICdiaW5hcnknXG4gICAgbGV2ZWxkYiA9IGxldmVsdXAgJy90bXAvaG9sbGVyaXRoMi10ZXN0Jywgc2V0dGluZ3NcbiAgICB5aWVsZCBjbGVhcl9sZXZlbGRiIGxldmVsZGIsIHJlc3VtZVxuICAgIHByb2JlcyA9IFtcbiAgICAgICcnXG4gICAgICAnICdcbiAgICAgICdhJ1xuICAgICAgJ2FiYydcbiAgICAgICfkuIAnXG4gICAgICAn5LiA5LqMJ1xuICAgICAgJ+S4gOS6jOS4iSdcbiAgICAgICfkuIknXG4gICAgICAn5LqMJ1xuICAgICAgJ/CggIAnXG4gICAgICAn8KCAgFxceDAwJ1xuICAgICAgJ/CggIBhJ1xuICAgICAgJ/CqnIAnXG4gICAgICAn8KudgCdcbiAgICAgIFN0cmluZy5mcm9tQ29kZVBvaW50IDB4MTBmZmZmXG4gICAgICBdXG4gICAgbWF0Y2hlcnMgPSAoIFsgcHJvYmUsIF0gZm9yIHByb2JlIGluIHByb2JlcyApXG4gICAgQ05ELnNodWZmbGUgcHJvYmVzXG4gICAgZm9yIHByb2JlIGluIHByb2Jlc1xuICAgICAgcHJvYmVfYmZyID0gQ09ERUMuZW5jb2RlIFsgcHJvYmUsIF1cbiAgICAgIHlpZWxkIGxldmVsZGIucHV0IHByb2JlX2JmciwgJzEnLCByZXN1bWVcbiAgICBwcm9iZV9iZnJzICA9IHlpZWxkIHJlYWRfYWxsX2tleXMgbGV2ZWxkYiwgcmVzdW1lXG4gICAgIyBkZWJ1ZyAnwqlGZDVpdycsIHByb2JlX2JmcnNcbiAgICBwcm9iZXMgICAgICA9ICggQ09ERUMuZGVjb2RlIHByb2JlX2JmciBmb3IgcHJvYmVfYmZyIGluIHByb2JlX2JmcnMgKVxuICAgIHNob3dfa2V5c19hbmRfa2V5X2JmcnMgcHJvYmVzLCBwcm9iZV9iZnJzXG4gICAgZm9yIHByb2JlLCBwcm9iZV9pZHggaW4gcHJvYmVzXG4gICAgICBtYXRjaGVyID0gbWF0Y2hlcnNbIHByb2JlX2lkeCBdXG4gICAgICBULmVxIHByb2JlLCBtYXRjaGVyXG4gICAgbGV2ZWxkYi5jbG9zZSAtPiBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInNvcnQgbnVtYmVycyB3aXRoIEgyIGNvZGVjICgxKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICBzZXR0aW5ncyA9XG4gICAgICBkYjogICAgICAgICAgIGxldmVsZG93blxuICAgICAga2V5RW5jb2Rpbmc6ICAnYmluYXJ5J1xuICAgIGxldmVsZGIgPSBsZXZlbHVwICcvdG1wL2hvbGxlcml0aDItdGVzdCcsIHNldHRpbmdzXG4gICAgeWllbGQgY2xlYXJfbGV2ZWxkYiBsZXZlbGRiLCByZXN1bWVcbiAgICBwcm9iZXNfYW5kX2Rlc2NyaXB0aW9ucyA9IFtcbiAgICAgIFsgLUluZmluaXR5LCAgICAgICAgICAgICAgIFwiLUluZmluaXR5XCIgICAgICAgICAgICAgICBdXG4gICAgICBbIC1OdW1iZXIuTUFYX1ZBTFVFLCAgICAgICBcIi1OdW1iZXIuTUFYX1ZBTFVFXCIgICAgICAgXVxuICAgICAgWyBOdW1iZXIuTUlOX1NBRkVfSU5URUdFUiwgXCJOdW1iZXIuTUlOX1NBRkVfSU5URUdFUlwiIF1cbiAgICAgIFsgLTEyMzQ1Njc4OSwgICAgICAgICAgICAgIFwiLTEyMzQ1Njc4OVwiICAgICAgICAgICAgICBdXG4gICAgICBbIC0zLCAgICAgICAgICAgICAgICAgICAgICBcIi0zXCIgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgWyAtMiwgICAgICAgICAgICAgICAgICAgICAgXCItMlwiICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgIFsgLTEuNSwgICAgICAgICAgICAgICAgICAgIFwiLTEuNVwiICAgICAgICAgICAgICAgICAgICBdXG4gICAgICBbIC0xLCAgICAgICAgICAgICAgICAgICAgICBcIi0xXCIgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgWyAtTnVtYmVyLkVQU0lMT04sICAgICAgICAgXCItTnVtYmVyLkVQU0lMT05cIiAgICAgICAgIF1cbiAgICAgIFsgLU51bWJlci5NSU5fVkFMVUUsICAgICAgIFwiLU51bWJlci5NSU5fVkFMVUVcIiAgICAgICBdXG4gICAgICBbIDAsICAgICAgICAgICAgICAgICAgICAgICBcIjBcIiAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgWyArTnVtYmVyLk1JTl9WQUxVRSwgICAgICAgXCIrTnVtYmVyLk1JTl9WQUxVRVwiICAgICAgIF1cbiAgICAgIFsgK051bWJlci5FUFNJTE9OLCAgICAgICAgIFwiK051bWJlci5FUFNJTE9OXCIgICAgICAgICBdXG4gICAgICBbICsxLCAgICAgICAgICAgICAgICAgICAgICBcIisxXCIgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgWyArMS41LCAgICAgICAgICAgICAgICAgICAgXCIrMS41XCIgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgIFsgKzIsICAgICAgICAgICAgICAgICAgICAgIFwiKzJcIiAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICBbICszLCAgICAgICAgICAgICAgICAgICAgICBcIiszXCIgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgWyArMTIzNDU2Nzg5LCAgICAgICAgICAgICAgXCIrMTIzNDU2Nzg5XCIgICAgICAgICAgICAgIF1cbiAgICAgIFsgTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIsIFwiTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVJcIiBdXG4gICAgICBbIE51bWJlci5NQVhfVkFMVUUsICAgICAgICBcIk51bWJlci5NQVhfVkFMVUVcIiAgICAgICAgXVxuICAgICAgWyArSW5maW5pdHksICAgICAgICAgICAgICAgXCIrSW5maW5pdHlcIiAgICAgICAgICAgICAgIF1cbiAgICAgIF1cbiAgICAjIHByb2Jlc19hbmRfZGVzY3JpcHRpb25zLnNvcnQgKCBhLCBiICkgLT5cbiAgICAjICAgcmV0dXJuICsxIGlmIGFbIDAgXSA+IGJbIDAgXVxuICAgICMgICByZXR1cm4gLTEgaWYgYVsgMCBdIDwgYlsgMCBdXG4gICAgIyAgIHJldHVybiAgMFxuICAgIG1hdGNoZXJzICAgICAgPSAoIFsgcGFkWyAwIF0sIF0gZm9yIHBhZCBpbiBwcm9iZXNfYW5kX2Rlc2NyaXB0aW9ucyApXG4gICAgIyBkZXNjcmlwdGlvbnMgID0gKCBbIHBhZFsgMSBdLCBdIGZvciBwYWQgaW4gcHJvYmVzX2FuZF9kZXNjcmlwdGlvbnMgKVxuICAgIGZvciBwYWQgaW4gcHJvYmVzX2FuZF9kZXNjcmlwdGlvbnNcbiAgICAgIHVyZ2UgcGFkXG4gICAgQ05ELnNodWZmbGUgcHJvYmVzX2FuZF9kZXNjcmlwdGlvbnNcbiAgICBmb3IgWyBwcm9iZSwgXywgXSBpbiBwcm9iZXNfYW5kX2Rlc2NyaXB0aW9uc1xuICAgICAgcHJvYmVfYmZyID0gQ09ERUMuZW5jb2RlIFsgcHJvYmUsIF1cbiAgICAgIHlpZWxkIGxldmVsZGIucHV0IHByb2JlX2JmciwgJzEnLCByZXN1bWVcbiAgICBwcm9iZV9iZnJzICA9IHlpZWxkIHJlYWRfYWxsX2tleXMgbGV2ZWxkYiwgcmVzdW1lXG4gICAgcHJvYmVzICAgICAgPSAoIENPREVDLmRlY29kZSBwcm9iZV9iZnIgZm9yIHByb2JlX2JmciBpbiBwcm9iZV9iZnJzIClcbiAgICBzaG93X2tleXNfYW5kX2tleV9iZnJzIHByb2JlcywgcHJvYmVfYmZyc1xuICAgIGZvciBwcm9iZSwgcHJvYmVfaWR4IGluIHByb2Jlc1xuICAgICAgbWF0Y2hlciA9IG1hdGNoZXJzWyBwcm9iZV9pZHggXVxuICAgICAgVC5lcSBwcm9iZSwgbWF0Y2hlclxuICAgIGxldmVsZGIuY2xvc2UgLT4gZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJzb3J0IG1peGVkIHZhbHVlcyB3aXRoIEgyIGNvZGVjXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHNldHRpbmdzID1cbiAgICAgIGRiOiAgICAgICAgICAgbGV2ZWxkb3duXG4gICAgICBrZXlFbmNvZGluZzogICdiaW5hcnknXG4gICAgbGV2ZWxkYiA9IGxldmVsdXAgJy90bXAvaG9sbGVyaXRoMi10ZXN0Jywgc2V0dGluZ3NcbiAgICB5aWVsZCBjbGVhcl9sZXZlbGRiIGxldmVsZGIsIHJlc3VtZVxuICAgIHByb2JlcyA9IFtcbiAgICAgIG51bGxcbiAgICAgIGZhbHNlXG4gICAgICB0cnVlXG4gICAgICBDT0RFQ1sgJ3NlbnRpbmVscycgXVsgJ2ZpcnN0ZGF0ZScgXVxuICAgICAgbmV3IERhdGUgMFxuICAgICAgbmV3IERhdGUgOGUxMVxuICAgICAgbmV3IERhdGUoKVxuICAgICAgQ09ERUNbICdzZW50aW5lbHMnIF1bICdsYXN0ZGF0ZScgIF1cbiAgICAgIDEyMzRcbiAgICAgIEluZmluaXR5XG4gICAgICAnJ1xuICAgICAgJ+S4gCdcbiAgICAgICfkuIknXG4gICAgICAn5LqMJ1xuICAgICAgJ/CggIAnXG4gICAgICAn8KCAgFxceDAwJ1xuICAgICAgU3RyaW5nLmZyb21Db2RlUG9pbnQgMHgxMGZmZmZcbiAgICAgIF1cbiAgICBtYXRjaGVycyA9ICggWyBwcm9iZSwgXSBmb3IgcHJvYmUgaW4gcHJvYmVzIClcbiAgICBDTkQuc2h1ZmZsZSBwcm9iZXNcbiAgICBmb3IgcHJvYmUgaW4gcHJvYmVzXG4gICAgICBkZWJ1ZyAnwqlvTVhKWicsIHByb2JlXG4gICAgICBwcm9iZV9iZnIgPSBDT0RFQy5lbmNvZGUgWyBwcm9iZSwgXVxuICAgICAgeWllbGQgbGV2ZWxkYi5wdXQgcHJvYmVfYmZyLCAnMScsIHJlc3VtZVxuICAgIHByb2JlX2JmcnMgID0geWllbGQgcmVhZF9hbGxfa2V5cyBsZXZlbGRiLCByZXN1bWVcbiAgICAjIGRlYnVnICfCqUZkNWl3JywgcHJvYmVfYmZyc1xuICAgIHByb2JlcyAgICAgID0gKCBDT0RFQy5kZWNvZGUgcHJvYmVfYmZyIGZvciBwcm9iZV9iZnIgaW4gcHJvYmVfYmZycyApXG4gICAgc2hvd19rZXlzX2FuZF9rZXlfYmZycyBwcm9iZXMsIHByb2JlX2JmcnNcbiAgICBmb3IgcHJvYmUsIHByb2JlX2lkeCBpbiBwcm9iZXNcbiAgICAgIG1hdGNoZXIgPSBtYXRjaGVyc1sgcHJvYmVfaWR4IF1cbiAgICAgIFQuZXEgcHJvYmUsIG1hdGNoZXJcbiAgICBsZXZlbGRiLmNsb3NlIC0+IGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwic29ydCBsaXN0cyBvZiBtaXhlZCB2YWx1ZXMgd2l0aCBIMiBjb2RlY1wiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICBzZXR0aW5ncyA9XG4gICAgICBkYjogICAgICAgICAgIGxldmVsZG93blxuICAgICAga2V5RW5jb2Rpbmc6ICAnYmluYXJ5J1xuICAgIGxldmVsZGIgPSBsZXZlbHVwICcvdG1wL2hvbGxlcml0aDItdGVzdCcsIHNldHRpbmdzXG4gICAgeWllbGQgY2xlYXJfbGV2ZWxkYiBsZXZlbGRiLCByZXN1bWVcbiAgICBwcm9iZXMgPSBbXG4gICAgICBbIFwiXCIsICAgICAgICAgICAgICcnLCAgICAgICAgICAgICBdXG4gICAgICBbIFwiMTIzNFwiLCAgICAgICAgICAxMjM0LCAgICAgICAgICAgXVxuICAgICAgWyBcIkluZmluaXR5XCIsICAgICAgSW5maW5pdHksICAgICAgIF1cbiAgICAgIFsgXCJTdHJpbmcuZnJvbUNvZGVQb2ludCAweDEwZmZmZlwiLCBTdHJpbmcuZnJvbUNvZGVQb2ludCAweDEwZmZmZiBdXG4gICAgICBbIFwiZmFsc2VcIiwgICAgICAgICBmYWxzZSwgICAgICAgICAgXVxuICAgICAgWyBcIm5ldyBEYXRlIDBcIiwgICAgbmV3IERhdGUgMCwgICAgIF1cbiAgICAgIFsgXCJuZXcgRGF0ZSA4ZTExXCIsIG5ldyBEYXRlIDhlMTEsICBdXG4gICAgICBbIFwibmV3IERhdGUoKVwiLCAgICBuZXcgRGF0ZSgpLCAgICAgXVxuICAgICAgWyBcIm51bGxcIiwgICAgICAgICAgbnVsbCwgICAgICAgICAgIF1cbiAgICAgIFsgXCJ0cnVlXCIsICAgICAgICAgIHRydWUsICAgICAgICAgICBdXG4gICAgICBbIFwi5LiAXCIsICAgICAgICAgICAgJ+S4gCcsICAgICAgICAgICAgXVxuICAgICAgWyBcIuS4iVwiLCAgICAgICAgICAgICfkuIknLCAgICAgICAgICAgIF1cbiAgICAgIFsgXCLkuoxcIiwgICAgICAgICAgICAn5LqMJywgICAgICAgICAgICBdXG4gICAgICBbIFwi8KCAgFwiLCAgICAgICAgICAgICfwoICAJywgICAgICAgICAgICBdXG4gICAgICBbIFwi8KCAgFxceDAwXCIsICAgICAgICAn8KCAgFxceDAwJywgICAgICAgIF1cbiAgICAgIF1cbiAgICBtYXRjaGVycyA9ICggcHJvYmUgZm9yIHByb2JlIGluIHByb2JlcyApXG4gICAgQ05ELnNodWZmbGUgcHJvYmVzXG4gICAgZm9yIHByb2JlIGluIHByb2Jlc1xuICAgICAgZGVidWcgJ8Kpb01YSlonLCBwcm9iZVxuICAgICAgcHJvYmVfYmZyID0gQ09ERUMuZW5jb2RlIHByb2JlXG4gICAgICB5aWVsZCBsZXZlbGRiLnB1dCBwcm9iZV9iZnIsICcxJywgcmVzdW1lXG4gICAgcHJvYmVfYmZycyAgPSB5aWVsZCByZWFkX2FsbF9rZXlzIGxldmVsZGIsIHJlc3VtZVxuICAgICMgZGVidWcgJ8KpRmQ1aXcnLCBwcm9iZV9iZnJzXG4gICAgcHJvYmVzICAgICAgPSAoIENPREVDLmRlY29kZSBwcm9iZV9iZnIgZm9yIHByb2JlX2JmciBpbiBwcm9iZV9iZnJzIClcbiAgICBzaG93X2tleXNfYW5kX2tleV9iZnJzIHByb2JlcywgcHJvYmVfYmZyc1xuICAgIGZvciBwcm9iZSwgcHJvYmVfaWR4IGluIHByb2Jlc1xuICAgICAgbWF0Y2hlciA9IG1hdGNoZXJzWyBwcm9iZV9pZHggXVxuICAgICAgVC5lcSBwcm9iZSwgbWF0Y2hlclxuICAgIGxldmVsZGIuY2xvc2UgLT4gZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJzb3J0IHJvdXRlcyB3aXRoIHZhbHVlcyAoMSlcIiBdID0gKCBULCBkb25lICkgLT5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgc2V0dGluZ3MgPVxuICAgICAgZGI6ICAgICAgICAgICBsZXZlbGRvd25cbiAgICAgIGtleUVuY29kaW5nOiAgJ2JpbmFyeSdcbiAgICBsZXZlbGRiID0gbGV2ZWx1cCAnL3RtcC9ob2xsZXJpdGgyLXRlc3QnLCBzZXR0aW5nc1xuICAgIHlpZWxkIGNsZWFyX2xldmVsZGIgbGV2ZWxkYiwgcmVzdW1lXG4gICAgcHJvYmVzID0gW1xuICAgICAgWyAncG9zJywgJ3N0cm9rZW9yZGVyJywgJzM1MjUxMzU1MzI1NCcsICAgICAgICAgICfwpL+vJywgXVxuICAgICAgWyAncG9zJywgJ3N0cm9rZW9yZGVyJywgJzM1MjUxNDExMjEnLCAgICAgICAgICAgICfwoLSmJywgXVxuICAgICAgWyAncG9zJywgJ3N0cm9rZW9yZGVyJywgJzM1MjUxNDU0JywgICAgICAgICAgICAgICfwqJKhJywgXVxuICAgICAgWyAncG9zJywgJ3N0cm9rZW9yZGVyJywgJzM1MjUxNTInLCAgICAgICAgICAgICAgICfpgq0nLCBdXG4gICAgICBbICdwb3MnLCAnc3Ryb2tlb3JkZXInLCAnMzUyNTE1MjUxMTE1MTE1MTEzNTQxJywgJ/CqmqsnLCBdXG4gICAgICBbICdwb3MnLCAnc3Ryb2tlb3JkZXInLCAnMzUyNTE1MjUxMTI1MTE1MTEnLCAgICAgJ/CqmqcnLCBdXG4gICAgICBbICdwb3MnLCAnc3Ryb2tlb3JkZXInLCAnMzUyNTE1MjUxMjE0MjUxMjE0JywgICAgJ/CnkbQnLCBdXG4gICAgICBbICdwb3MnLCAnc3Ryb2tlb3JkZXInLCAnMzUyNTE1MycsICAgICAgICAgICAgICAgJ+WKrCcsIF1cbiAgICAgIFsgJ3BvcycsICdzdHJva2VvcmRlcicsICczNTI1MTUzXFx4MDAnLCAgICAgICAgICAgICAgICfliqwnLCBdXG4gICAgICBbICdwb3MnLCAnc3Ryb2tlb3JkZXJcXHgwMCcsICczNTI1MTM1NTMyNTQnLCAgICAgICAgICAn8KS/rycsIF1cbiAgICAgIF1cbiAgICBtYXRjaGVycyA9ICggcHJvYmUgZm9yIHByb2JlIGluIHByb2JlcyApXG4gICAgQ05ELnNodWZmbGUgcHJvYmVzXG4gICAgZm9yIHByb2JlIGluIHByb2Jlc1xuICAgICAgcHJvYmVfYmZyID0gQ09ERUMuZW5jb2RlIHByb2JlXG4gICAgICB5aWVsZCBsZXZlbGRiLnB1dCBwcm9iZV9iZnIsICcxJywgcmVzdW1lXG4gICAgcHJvYmVfYmZycyAgPSB5aWVsZCByZWFkX2FsbF9rZXlzIGxldmVsZGIsIHJlc3VtZVxuICAgICMgZGVidWcgJ8KpRmQ1aXcnLCBwcm9iZV9iZnJzXG4gICAgcHJvYmVzICAgICAgPSAoIENPREVDLmRlY29kZSBwcm9iZV9iZnIgZm9yIHByb2JlX2JmciBpbiBwcm9iZV9iZnJzIClcbiAgICBzaG93X2tleXNfYW5kX2tleV9iZnJzIHByb2JlcywgcHJvYmVfYmZyc1xuICAgIGZvciBwcm9iZSwgcHJvYmVfaWR4IGluIHByb2Jlc1xuICAgICAgbWF0Y2hlciA9IG1hdGNoZXJzWyBwcm9iZV9pZHggXVxuICAgICAgVC5lcSBwcm9iZSwgbWF0Y2hlclxuICAgIGxldmVsZGIuY2xvc2UgLT4gZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJzb3J0IHJvdXRlcyB3aXRoIHZhbHVlcyAoMilcIiBdID0gKCBULCBkb25lICkgLT5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgc2V0dGluZ3MgPVxuICAgICAgZGI6ICAgICAgICAgICBsZXZlbGRvd25cbiAgICAgIGtleUVuY29kaW5nOiAgJ2JpbmFyeSdcbiAgICBsZXZlbGRiID0gbGV2ZWx1cCAnL3RtcC9ob2xsZXJpdGgyLXRlc3QnLCBzZXR0aW5nc1xuICAgIHlpZWxkIGNsZWFyX2xldmVsZGIgbGV2ZWxkYiwgcmVzdW1lXG4gICAgcHJvYmVzID0gW1xuICAgICAgWyAnYScsICAgICAgbnVsbCwgXVxuICAgICAgWyAnYScsICAgICAgZmFsc2UsIF1cbiAgICAgIFsgJ2EnLCAgICAgIHRydWUsIF1cbiAgICAgIFsgJ2EnLCAgICAgIG5ldyBEYXRlKCksIF1cbiAgICAgIFsgJ2EnLCAgICAgIC1JbmZpbml0eSwgXVxuICAgICAgWyAnYScsICAgICAgKzEyMzQsIF1cbiAgICAgIFsgJ2EnLCAgICAgICtJbmZpbml0eSwgXVxuICAgICAgWyAnYScsICAgICAgJ2InLCBdXG4gICAgICBbICdhJywgICAgICAnYlxceDAwJywgXVxuICAgICAgWyAnYVxceDAwJywgICsxMjM0LCBdXG4gICAgICBbICdhXFx4MDAnLCAgJ2InLCBdXG4gICAgICBbICdhYScsICAgICArMTIzNCwgXVxuICAgICAgWyAnYWEnLCAgICAgJ2InLCBdXG4gICAgICBbICdhYScsICAgICAnYlxceDAwJywgXVxuICAgICAgXVxuICAgIG1hdGNoZXJzID0gKCBwcm9iZSBmb3IgcHJvYmUgaW4gcHJvYmVzIClcbiAgICBDTkQuc2h1ZmZsZSBwcm9iZXNcbiAgICBmb3IgcHJvYmUgaW4gcHJvYmVzXG4gICAgICBwcm9iZV9iZnIgPSBDT0RFQy5lbmNvZGUgcHJvYmVcbiAgICAgIHlpZWxkIGxldmVsZGIucHV0IHByb2JlX2JmciwgJzEnLCByZXN1bWVcbiAgICBwcm9iZV9iZnJzICA9IHlpZWxkIHJlYWRfYWxsX2tleXMgbGV2ZWxkYiwgcmVzdW1lXG4gICAgIyBkZWJ1ZyAnwqlGZDVpdycsIHByb2JlX2JmcnNcbiAgICBwcm9iZXMgICAgICA9ICggQ09ERUMuZGVjb2RlIHByb2JlX2JmciBmb3IgcHJvYmVfYmZyIGluIHByb2JlX2JmcnMgKVxuICAgIHNob3dfa2V5c19hbmRfa2V5X2JmcnMgcHJvYmVzLCBwcm9iZV9iZnJzXG4gICAgZm9yIHByb2JlLCBwcm9iZV9pZHggaW4gcHJvYmVzXG4gICAgICBtYXRjaGVyID0gbWF0Y2hlcnNbIHByb2JlX2lkeCBdXG4gICAgICBULmVxIHByb2JlLCBtYXRjaGVyXG4gICAgbGV2ZWxkYi5jbG9zZSAtPiBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgc2FtcGxlIGRhdGFcIiBdID0gKCBULCBkb25lICkgLT5cbiAgcHJvYmVzX2lkeCAgPSAyXG4gIGlkeCA9IC0xXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIGRlYnVnICfCqWJVSmhJJywgJ1hYJ1xuICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHJlc3VtZVxuICAgIGRlYnVnICfCqVBSekE1JywgJ1hYJ1xuICAgIGlucHV0ID0gZGJbICclc2VsZicgXS5jcmVhdGVSZWFkU3RyZWFtKClcbiAgICBpbnB1dFxuICAgICAgLnBpcGUgRC4kc2hvdygpXG4gICAgICAucGlwZSAkICggeyBrZXksIHZhbHVlLCB9LCBzZW5kICkgPT4gc2VuZCBbIGtleSwgdmFsdWUsIF1cbiAgICAgIC5waXBlICQgKCBbIGtleSwgdmFsdWUsIF0sIHNlbmQgKSA9PlxuICAgICAgICAjIGRlYnVnICfCqVJsdWhGJywgKCBIT0xMRVJJVEguQ09ERUMuZGVjb2RlIGtleSApLCAoIEpTT04ucGFyc2UgdmFsdWUgKVxuICAgICAgICBzZW5kIFsga2V5LCB2YWx1ZSwgXVxuICAgICAgLnBpcGUgRC4kY29sbGVjdCgpXG4gICAgICAucGlwZSAkICggZmFjZXRzLCBzZW5kICkgPT5cbiAgICAgICAgIyBkZWJ1ZyAnwqlGdG1CNCcsIGZhY2V0c1xuICAgICAgICBoZWxwICdcXG4nICsgSE9MTEVSSVRILkRVTVAucnByX29mX2ZhY2V0cyBkYiwgZmFjZXRzXG4gICAgICAgICMgcHJvY2Vzcy5leGl0KCkgIyA+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+PlxuICAgICAgICBidWZmZXIgPSBuZXcgQnVmZmVyIEpTT04uc3RyaW5naWZ5IFsgJ+W8gCcsICflvaEnIF1cbiAgICAgICAgZGVidWcgJ8KpR0pmTDYnLCBIT0xMRVJJVEguRFVNUC5ycHJfb2ZfYnVmZmVyIG51bGwsIGJ1ZmZlclxuICAgICAgLnBpcGUgRC4kb25fZW5kID0+IGRvbmUoKVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHJldHVybiBudWxsXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZWFkIGFuZCB3cml0ZSBrZXlzIHdpdGggbGlzdHNcIiBdID0gKCBULCBkb25lICkgLT5cbiAgcHJvYmVzX2lkeCAgPSAwXG4gIGlkeCAgICAgICAgID0gLTFcbiAgY291bnQgICAgICAgPSAwXG4gIHByb2JlcyAgICAgID0gW1xuICAgIFsgJ2EnLCAxLCBdXG4gICAgWyAnYScsIFtdLCBdXG4gICAgWyAnYScsIFsgMSwgXSwgXVxuICAgIFsgJ2EnLCBbIHRydWUsIF0sIF1cbiAgICBbICdhJywgWyAneCcsICd5JywgJ2InLCBdLCBdXG4gICAgWyAnYScsIFsgMTIwLCAxIC8gMywgXSwgXVxuICAgIFsgJ2EnLCBbICd4JywgXSwgXVxuICAgIF1cbiAgbWF0Y2hlcnMgICAgPSAoIHByb2JlIGZvciBwcm9iZSBpbiBwcm9iZXMgKVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGZvciBwcm9iZSwgcHJvYmVfaWR4IGluIHByb2Jlc1xuICAgIGJ1ZmZlciA9IEhPTExFUklUSC5DT0RFQy5lbmNvZGUgcHJvYmVcbiAgICByZXN1bHQgPSBIT0xMRVJJVEguQ09ERUMuZGVjb2RlIGJ1ZmZlclxuICAgIFQuZXEgcmVzdWx0LCBtYXRjaGVyc1sgcHJvYmVfaWR4IF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgcGFydGlhbCBQT1MgcGhyYXNlc1wiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ICAgICAgICAgPSAtMVxuICBjb3VudCAgICAgICA9IDBcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBtYXRjaGVycyA9IFtcbiAgICBbICfwp7efMScsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgMSBdXG4gICAgWyAn8Ke3nzInLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDIgXVxuICAgIFsgJ/Cnt58zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAzIF1cbiAgICBbICfwp7efNCcsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgNCBdXG4gICAgWyAn8Ke3nycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgNSBdXG4gICAgWyAn8Ke3nzYnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDYgXVxuICAgIFsgJ/Cnt58nLCAnZ3VpZGUvdWNoci9oYXMnLCAn5YWrJywgMCBdXG4gICAgWyAn8Ke3nycsICdndWlkZS91Y2hyL2hhcycsICfliIAnLCAxIF1cbiAgICBbICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgJ+WugCcsIDIgXVxuICAgIFsgJ/Cnt58nLCAnZ3VpZGUvdWNoci9oYXMnLCAn6LKdJywgNCBdXG4gICAgWyAn8Ke3nycsICdndWlkZS91Y2hyL2hhcycsICfuh7onLCAzIF1cbiAgICBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgQF9mZWVkX3Rlc3RfZGF0YSBkYiwgcHJvYmVzX2lkeCwgcmVzdW1lXG4gICAgcHJlZml4ICAgID0gWyAncG9zJywgJ2d1aWRlJywgXVxuICAgIGlucHV0ICAgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBwcmVmaXgsICcqJ1xuICAgIGRlYnVnICfCqUZwaEpLJywgaW5wdXRbICclbWV0YScgXVxuICAgIHNldHRpbmdzICA9IHsgaW5kZXhlZDogbm8sIH1cbiAgICBpbnB1dFxuICAgICAgLnBpcGUgJCAoIHBocmFzZSwgc2VuZCApID0+XG4gICAgICAgIGNvdW50ICArPSArMVxuICAgICAgICBpZHggICAgKz0gKzFcbiAgICAgICAgZGVidWcgJ8KpU2M1RkcnLCBwaHJhc2VcbiAgICAgICAgIyBULmVxIHBocmFzZSwgbWF0Y2hlcnNbIGlkeCBdXG4gICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgVC5lcSBjb3VudCwgbWF0Y2hlcnMubGVuZ3RoXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwiZW5jb2RlIGtleXMgd2l0aCBsaXN0IGVsZW1lbnRzXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHByb2JlcyA9IFtcbiAgICBbICdmb28nLCAnYmFyJywgXVxuICAgIFsgJ2ZvbycsIFsgJ2JhcicsIF0sIF1cbiAgICBbIFtdLCAnYmFyJywgXVxuICAgIFsgJ2ZvbycsIFtdLCBdXG4gICAgWyBbICdmb28nLCBdLCAnYmFyJywgXVxuICAgIFsgWyA0MiwgXSwgJ2JhcicsIF1cbiAgICBbICdmb28nLCBbIDQyLCBdIF1cbiAgICBdXG4gIGZvciBwcm9iZSBpbiBwcm9iZXNcbiAgICBULmVxIHByb2JlLCBIT0xMRVJJVEguQ09ERUMuZGVjb2RlIEhPTExFUklUSC5DT0RFQy5lbmNvZGUgcHJvYmVcbiAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZWFkIGFuZCB3cml0ZSBwaHJhc2VzIHdpdGggdW5hbmFseXplZCBsaXN0c1wiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBpZHggICAgICAgICA9IC0xXG4gIGNvdW50ICAgICAgID0gMFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHByb2JlcyA9IFtcbiAgICBbICdwcm9iZSMwMCcsICdzb21lLXByZWRpY2F0ZScsIFtdLCBdXG4gICAgWyAncHJvYmUjMDEnLCAnc29tZS1wcmVkaWNhdGUnLCBbIC0xIF0sIF1cbiAgICBbICdwcm9iZSMwMicsICdzb21lLXByZWRpY2F0ZScsIFsgIDAgXSwgXVxuICAgIFsgJ3Byb2JlIzAzJywgJ3NvbWUtcHJlZGljYXRlJywgWyAgMSBdLCBdXG4gICAgWyAncHJvYmUjMDQnLCAnc29tZS1wcmVkaWNhdGUnLCBbICAyIF0sIF1cbiAgICBbICdwcm9iZSMwNScsICdzb21lLXByZWRpY2F0ZScsIFsgIDIsIC0xLCBdLCBdXG4gICAgWyAncHJvYmUjMDYnLCAnc29tZS1wcmVkaWNhdGUnLCBbICAyLCAwLCBdLCBdXG4gICAgWyAncHJvYmUjMDcnLCAnc29tZS1wcmVkaWNhdGUnLCBbICAyLCAxLCBdLCBdXG4gICAgWyAncHJvYmUjMDgnLCAnc29tZS1wcmVkaWNhdGUnLCBbICAyLCAxLCAwIF0sIF1cbiAgICBbICdwcm9iZSMwOScsICdzb21lLXByZWRpY2F0ZScsIFsgIDIsIDIsIF0sIF1cbiAgICBbICdwcm9iZSMxMCcsICdzb21lLXByZWRpY2F0ZScsIFsgIDIsIFsgMiwgXSwgXSwgXVxuICAgIFsgJ3Byb2JlIzExJywgJ3NvbWUtcHJlZGljYXRlJywgWyAgMyBdLCBdXG4gICAgXVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHdyaXRlX3Byb2JlcyA9ICggaGFuZGxlciApID0+XG4gICAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgICB5aWVsZCBIT0xMRVJJVEguY2xlYXIgZGIsIHJlc3VtZVxuICAgICAgaW5wdXQgPSBELmNyZWF0ZV90aHJvdWdoc3RyZWFtKClcbiAgICAgIGlucHV0XG4gICAgICAgICMgLnBpcGUgKCBbIHNiaiwgcHJkLCBvYmosIF0sIHNlbmQgKSA9PlxuICAgICAgICAjICAgaWYgcHJkIGlzICdzb21lLXByZWRpY2F0ZScgIyBhbHdheXMgdGhlIGNhc2UgaW4gdGhpcyBleGFtcGxlXG4gICAgICAgICMgICAgIG9ialxuICAgICAgICAucGlwZSBIT0xMRVJJVEguJHdyaXRlIGRiLCBzb2xpZHM6IFsgJ3NvbWUtcHJlZGljYXRlJywgXVxuICAgICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgICB1cmdlIFwidGVzdCBkYXRhIHdyaXR0ZW5cIlxuICAgICAgICAgIGhhbmRsZXIoKVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIGlucHV0LndyaXRlIHByb2JlIGZvciBwcm9iZSBpbiBwcm9iZXNcbiAgICAgIGlucHV0LmVuZCgpXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICB5aWVsZCB3cml0ZV9wcm9iZXMgcmVzdW1lXG4gICAgaW5wdXQgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYlxuICAgIGRlYnVnICfCqUZwaEpLJywgaW5wdXRbICclbWV0YScgXVxuICAgIGlucHV0XG4gICAgICAucGlwZSAkICggcGhyYXNlLCBzZW5kICkgPT5cbiAgICAgICAgY291bnQgICs9ICsxXG4gICAgICAgIGlkeCAgICArPSArMVxuICAgICAgICBkZWJ1ZyAnwqlTYzVGRycsIHBocmFzZVxuICAgICAgICAjIFQuZXEgcGhyYXNlLCBtYXRjaGVyc1sgaWR4IF1cbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICAjIFQuZXEgY291bnQsIG1hdGNoZXJzLmxlbmd0aFxuICAgICAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcIndyaXRlIG1hbnkgcGhyYXNlc1wiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBpZHggICAgICAgICA9IC0xXG4gIGNvdW50ICAgICAgID0gMFxuICBkZWxheSA9ICggaGFuZGxlciApIC0+XG4gICAgc2V0SW1tZWRpYXRlIGhhbmRsZXJcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICB3cml0ZV9wcm9iZXMgPSAoIGhhbmRsZXIgKSA9PlxuICAgIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgICAgeWllbGQgSE9MTEVSSVRILmNsZWFyIGRiLCByZXN1bWVcbiAgICAgIGlucHV0ID0gRC5jcmVhdGVfdGhyb3VnaHN0cmVhbSgpXG4gICAgICBpbnB1dFxuICAgICAgICAucGlwZSBIT0xMRVJJVEguJHdyaXRlIGRiLCBzb2xpZHM6IFsgJ3NvbWUtcHJlZGljYXRlJywgXVxuICAgICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgICB1cmdlIFwidGVzdCBkYXRhIHdyaXR0ZW5cIlxuICAgICAgICAgIGhhbmRsZXIoKVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIGZvciBpZHggaW4gWyAwIC4uIDEwMCBdXG4gICAgICAgIHByb2JlID0gXCJlbnRyeS0je2lkeH1cIlxuICAgICAgICB5aWVsZCBpbnB1dC53cml0ZSBwcm9iZSwgcmVzdW1lXG4gICAgICAgICMgeWllbGQgZGVsYXkgcmVzdW1lXG4gICAgICBpbnB1dC5lbmQoKVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgeWllbGQgd3JpdGVfcHJvYmVzIHJlc3VtZVxuICAgIGlucHV0ID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGJcbiAgICBkZWJ1ZyAnwqlGcGhKSycsIGlucHV0WyAnJW1ldGEnIF1cbiAgICBpbnB1dFxuICAgICAgLnBpcGUgJCAoIHBocmFzZSwgc2VuZCApID0+XG4gICAgICAgIGNvdW50ICArPSArMVxuICAgICAgICBpZHggICAgKz0gKzFcbiAgICAgICAgZGVidWcgJ8KpU2M1RkcnLCBwaHJhc2VcbiAgICAgICAgIyBULmVxIHBocmFzZSwgbWF0Y2hlcnNbIGlkeCBdXG4gICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgIyBULmVxIGNvdW50LCBtYXRjaGVycy5sZW5ndGhcbiAgICAgICAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZW1pbmRlcnNcIiBdID0gKCBULCBkb25lICkgLT5cbiAgYWxlcnQgXCJILiR3cml0ZSgpIG11c3QgdGVzdCBmb3IgcmVwZWF0ZWQga2V5cyBvciBpbXBsZW1lbnQgcmV3cml0aW5nIG9mIFBPUyBlbnRyaWVzXCJcbiAgZG9uZSgpXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyBIRUxQRVJTXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbnNob3dfa2V5c19hbmRfa2V5X2JmcnMgPSAoIGtleXMsIGtleV9iZnJzICkgLT5cbiAgZiA9ICggcCApIC0+ICggdCBmb3IgdCBpbiAoIHAudG9TdHJpbmcgJ2hleCcgKS5zcGxpdCAvKC4uKS8gd2hlbiB0IGlzbnQgJycgKS5qb2luICcgJ1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGNvbHVtbmlmeV9zZXR0aW5ncyA9XG4gICAgcGFkZGluZ0NocjogJyAnXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZGF0YSAgICAgID0gW11cbiAga2V5X2JmcnMgID0gKCBmIHAgZm9yIHAgaW4ga2V5X2JmcnMgKVxuICBmb3Iga2V5LCBpZHggaW4ga2V5c1xuICAgIGtleV90eHQgPSAoIHJwciBrZXkgKS5yZXBsYWNlIC9cXFxcdTAwMDAvZywgJ+KIhydcbiAgICBkYXRhLnB1c2ggeyAnc3RyJzoga2V5X3R4dCwgJ2Jmcic6IGtleV9iZnJzWyBpZHggXX1cbiAgaGVscCAnXFxuJyArIENORC5jb2x1bW5pZnkgZGF0YSwgY29sdW1uaWZ5X3NldHRpbmdzXG4gIHJldHVybiBudWxsXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZ2V0X25ld19kYl9uYW1lID0gLT5cbiAgZ2V0X25ld19kYl9uYW1lLmlkeCArPSArMVxuICByZXR1cm4gXCIvdG1wL2hvbGxlcml0aDItdGVzdGRiLSN7Z2V0X25ld19kYl9uYW1lLmlkeH1cIlxuZ2V0X25ld19kYl9uYW1lLmlkeCA9IDBcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5yZWFkX2FsbF9rZXlzID0gKCBkYiwgaGFuZGxlciApIC0+XG4gIFogPSBbXVxuICBpbnB1dCA9IGRiLmNyZWF0ZUtleVN0cmVhbSgpXG4gIGlucHV0Lm9uICdlbmQnLCAtPiBoYW5kbGVyIG51bGwsIFpcbiAgaW5wdXRcbiAgICAucGlwZSAkICggZGF0YSwgc2VuZCApID0+IFoucHVzaCBkYXRhXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xlYXJfbGV2ZWxkYiA9ICggbGV2ZWxkYiwgaGFuZGxlciApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHJvdXRlID0gbGV2ZWxkYlsgJ2xvY2F0aW9uJyBdXG4gICAgeWllbGQgbGV2ZWxkYi5jbG9zZSByZXN1bWVcbiAgICB3aGlzcGVyIFwiY2xvc2VkIExldmVsREJcIlxuICAgIHlpZWxkIGxldmVsZG93bi5kZXN0cm95IHJvdXRlLCByZXN1bWVcbiAgICB3aGlzcGVyIFwiZGVzdHJveWVkIExldmVsREJcIlxuICAgIHlpZWxkIGxldmVsZGIub3BlbiByZXN1bWVcbiAgICB3aGlzcGVyIFwicmUtb3BlbmVkIExldmVsREJcIlxuICAgICMgaGVscCBcImVyYXNlZCBhbmQgcmUtb3BlbmVkIExldmVsREIgYXQgI3tyb3V0ZX1cIlxuICAgIGhhbmRsZXIgbnVsbFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfbWFpbiA9ICggaGFuZGxlciApIC0+XG4gIGRiID0gSE9MTEVSSVRILm5ld19kYiBqb2luIF9fZGlybmFtZSwgJy4uJywgJ2Ricy90ZXN0cydcbiAgdGVzdCBALCAndGltZW91dCc6IDI1MDBcblxuIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG51bmxlc3MgbW9kdWxlLnBhcmVudD9cbiAgQF9tYWluKClcblxuICAjIGRlYnVnICfCqVA5QU9SJywgKCBIT0xMRVJJVEguQ09ERUNbICd0eXBlbWFya2VycycgIF1bICdudWxsJyAgICAgICBdICkudG9TdHJpbmcgMTZcbiAgIyBkZWJ1ZyAnwql4eG1JcCcsICggSE9MTEVSSVRILkNPREVDWyAndHlwZW1hcmtlcnMnICBdWyAnZmFsc2UnICAgICAgXSApLnRvU3RyaW5nIDE2XG4gICMgZGVidWcgJ8KpWmVZMjYnLCAoIEhPTExFUklUSC5DT0RFQ1sgJ3R5cGVtYXJrZXJzJyAgXVsgJ3RydWUnICAgICAgIF0gKS50b1N0cmluZyAxNlxuICAjIGRlYnVnICfCqVdnRVI5JywgKCBIT0xMRVJJVEguQ09ERUNbICd0eXBlbWFya2VycycgIF1bICdkYXRlJyAgICAgICBdICkudG9TdHJpbmcgMTZcbiAgIyBkZWJ1ZyAnwqlVbXBqSicsICggSE9MTEVSSVRILkNPREVDWyAndHlwZW1hcmtlcnMnICBdWyAnbmluZmluaXR5JyAgXSApLnRvU3RyaW5nIDE2XG4gICMgZGVidWcgJ8KpVXJsMEsnLCAoIEhPTExFUklUSC5DT0RFQ1sgJ3R5cGVtYXJrZXJzJyAgXVsgJ25udW1iZXInICAgIF0gKS50b1N0cmluZyAxNlxuICAjIGRlYnVnICfCqW5GSUlpJywgKCBIT0xMRVJJVEguQ09ERUNbICd0eXBlbWFya2VycycgIF1bICdwbnVtYmVyJyAgICBdICkudG9TdHJpbmcgMTZcbiAgIyBkZWJ1ZyAnwqlMWjU4UicsICggSE9MTEVSSVRILkNPREVDWyAndHlwZW1hcmtlcnMnICBdWyAncGluZmluaXR5JyAgXSApLnRvU3RyaW5nIDE2XG4gICMgZGVidWcgJ8KpTVl4ZGEnLCAoIEhPTExFUklUSC5DT0RFQ1sgJ3R5cGVtYXJrZXJzJyAgXVsgJ3RleHQnICAgICAgIF0gKS50b1N0cmluZyAxNlxuXG5cblxuXG5cblxuXG5cblxuXG4iXX0=