(function() {
  var $, CND, CODEC, D, HOLLERITH, after, alert, badge, clear_leveldb, db, debug, echo, get_new_db_name, help, immediately, info, join, leveldown, levelup, log, njs_path, read_all_keys, rpr, show_keys_and_key_bfrs, step, suspend, test, urge, warn, whisper, ƒ;

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

  immediately = suspend.immediately;

  test = require('guy-test');

  D = require('pipedreams2');

  $ = D.remit.bind(D);

  HOLLERITH = require('./main');

  db = null;

  levelup = require('levelup');

  leveldown = require('leveldown');

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
        var i, input, j, key, len, len1, probe, ref, ref1, url_key;
        (yield HOLLERITH.clear(db, resume));
        whisper("writing test dataset #" + probes_idx + " with settings " + (rpr(settings)));
        input = D.create_throughstream();
        switch (probes_idx) {
          case 0:
          case 2:
            input.pipe(HOLLERITH.$write(db, settings)).pipe(D.$on_end(function(end) {
              whisper("test data written");
              handler(null);
              return end();
            }));
            ref = _this._feed_test_data.probes[probes_idx];
            for (i = 0, len = ref.length; i < len; i++) {
              probe = ref[i];
              input.write(probe);
              (yield setImmediate(resume));
            }
            return input.end();
          case 1:
            input.pipe(HOLLERITH.$write(db, settings)).pipe(D.$on_end(function(end) {
              whisper("test data written");
              end();
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
        input = HOLLERITH.create_facetstream(db, prefix);
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
        input = HOLLERITH.create_facetstream(db, lo, hi);
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
        input = HOLLERITH.create_phrasestream(db, prefix);
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
        })).pipe(D.$on_end(function(end) {
          T.eq(count, matchers.length);
          end();
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
        })).pipe(D.$on_end(function(end) {
          T.eq(count, matchers.length);
          end();
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
          return idx += +1;
        })).pipe(D.$on_end(function() {
          return done();
        }));
      };
    })(this));
  };

  this["writing phrases with non-unique keys fails"] = function(T, done) {
    alert("test case \"writing phrases with non-unique keys fails\" to be written");
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

//# sourceMappingURL=data:application/json;base64,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QUFBOztBQUFBLEVBMHdDQSxJQUFDLENBQUEsS0FBRCxHQUFTLFNBQUUsT0FBRixHQUFBO0FBQ1AsSUFBQSxFQUFBLEdBQUssU0FBUyxDQUFDLE1BQVYsQ0FBaUIsSUFBQSxDQUFLLFNBQUwsRUFBZ0IsSUFBaEIsRUFBc0IsV0FBdEIsQ0FBakIsQ0FBTCxDQUFBO1dBQ0EsSUFBQSxDQUFLLElBQUwsRUFBUTtBQUFBLE1BQUEsU0FBQSxFQUFXLElBQVg7S0FBUixFQUZPO0VBQUEsQ0Exd0NULENBQUE7O0FBK3dDQSxFQUFBLElBQU8scUJBQVA7QUFDRSxJQUFBLElBQUMsQ0FBQSxLQUFELENBQUEsQ0FBQSxDQURGO0dBL3dDQTtBQUFBIiwiZmlsZSI6InRlc3RzLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiXG5cblxuIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5uanNfcGF0aCAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAncGF0aCdcbiMgbmpzX2ZzICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2ZzJ1xuam9pbiAgICAgICAgICAgICAgICAgICAgICA9IG5qc19wYXRoLmpvaW5cbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuQ05EICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2NuZCdcbnJwciAgICAgICAgICAgICAgICAgICAgICAgPSBDTkQucnByXG5iYWRnZSAgICAgICAgICAgICAgICAgICAgID0gJ0hPTExFUklUSC90ZXN0cydcbmxvZyAgICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAncGxhaW4nLCAgICAgYmFkZ2VcbmluZm8gICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnaW5mbycsICAgICAgYmFkZ2VcbndoaXNwZXIgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnd2hpc3BlcicsICAgYmFkZ2VcbmFsZXJ0ICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnYWxlcnQnLCAgICAgYmFkZ2VcbmRlYnVnICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnZGVidWcnLCAgICAgYmFkZ2Vcbndhcm4gICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnd2FybicsICAgICAgYmFkZ2VcbmhlbHAgICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnaGVscCcsICAgICAgYmFkZ2VcbnVyZ2UgICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAndXJnZScsICAgICAgYmFkZ2VcbmVjaG8gICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZWNoby5iaW5kIENORFxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5zdXNwZW5kICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnY29mZmVlbm9kZS1zdXNwZW5kJ1xuc3RlcCAgICAgICAgICAgICAgICAgICAgICA9IHN1c3BlbmQuc3RlcFxuYWZ0ZXIgICAgICAgICAgICAgICAgICAgICA9IHN1c3BlbmQuYWZ0ZXJcbiMgZXZlbnR1YWxseSAgICAgICAgICAgICAgICA9IHN1c3BlbmQuZXZlbnR1YWxseVxuaW1tZWRpYXRlbHkgICAgICAgICAgICAgICA9IHN1c3BlbmQuaW1tZWRpYXRlbHlcbiMgcmVwZWF0X2ltbWVkaWF0ZWx5ICAgICAgICA9IHN1c3BlbmQucmVwZWF0X2ltbWVkaWF0ZWx5XG4jIGV2ZXJ5ICAgICAgICAgICAgICAgICAgICAgPSBzdXNwZW5kLmV2ZXJ5XG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnRlc3QgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdndXktdGVzdCdcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuRCAgICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ3BpcGVkcmVhbXMyJ1xuJCAgICAgICAgICAgICAgICAgICAgICAgICA9IEQucmVtaXQuYmluZCBEXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkhPTExFUklUSCAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL21haW4nXG5kYiAgICAgICAgICAgICAgICAgICAgICAgID0gbnVsbFxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5sZXZlbHVwICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbGV2ZWx1cCdcbmxldmVsZG93biAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdsZXZlbGRvd24nXG5DT0RFQyAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi9jb2RlYydcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuxpIgICAgICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZm9ybWF0X251bWJlclxuXG4jICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBAX3NvcnRfbGlzdCA9ICggbGlzdCApIC0+XG4jICAgQF9lbmNvZGVfbGlzdCBsaXN0XG4jICAgbGlzdC5zb3J0IEJ1ZmZlci5jb21wYXJlXG4jICAgQF9kZWNvZGVfbGlzdCBsaXN0XG4jICAgcmV0dXJuIGxpc3RcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX2ZlZWRfdGVzdF9kYXRhID0gKCBkYiwgcHJvYmVzX2lkeCwgc2V0dGluZ3MsIGhhbmRsZXIgKSAtPlxuICBzd2l0Y2ggYXJpdHkgPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgd2hlbiAzXG4gICAgICBoYW5kbGVyICAgPSBzZXR0aW5nc1xuICAgICAgc2V0dGluZ3MgID0gbnVsbFxuICAgIHdoZW4gNFxuICAgICAgbnVsbFxuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBFcnJvciBcImV4cGVjdGVkIDMgb3IgNCBhcmd1bWVudHMsIGdvdCAje2FyaXR5fVwiXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgSE9MTEVSSVRILmNsZWFyIGRiLCByZXN1bWVcbiAgICB3aGlzcGVyIFwid3JpdGluZyB0ZXN0IGRhdGFzZXQgIyN7cHJvYmVzX2lkeH0gd2l0aCBzZXR0aW5ncyAje3JwciBzZXR0aW5nc31cIlxuICAgIGlucHV0ID0gRC5jcmVhdGVfdGhyb3VnaHN0cmVhbSgpXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBzd2l0Y2ggcHJvYmVzX2lkeFxuICAgICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICB3aGVuIDAsIDJcbiAgICAgICAgaW5wdXRcbiAgICAgICAgICAucGlwZSBIT0xMRVJJVEguJHdyaXRlIGRiLCBzZXR0aW5nc1xuICAgICAgICAgICMgLnBpcGUgRC4kc2hvdygpXG4gICAgICAgICAgLnBpcGUgRC4kb25fZW5kICggZW5kICkgPT5cbiAgICAgICAgICAgIHdoaXNwZXIgXCJ0ZXN0IGRhdGEgd3JpdHRlblwiXG4gICAgICAgICAgICBoYW5kbGVyIG51bGxcbiAgICAgICAgICAgIGVuZCgpXG4gICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgICAgZm9yIHByb2JlIGluIEBfZmVlZF90ZXN0X2RhdGEucHJvYmVzWyBwcm9iZXNfaWR4IF1cbiAgICAgICAgICAjIGtleSA9IEhPTExFUklUSC5uZXdfc29fa2V5IGRiLCBwcm9iZS4uLlxuICAgICAgICAgICMgZGVidWcgJ8KpV1YwajInLCBwcm9iZVxuICAgICAgICAgIGlucHV0LndyaXRlIHByb2JlXG4gICAgICAgICAgeWllbGQgc2V0SW1tZWRpYXRlIHJlc3VtZVxuICAgICAgICBpbnB1dC5lbmQoKVxuICAgICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICB3aGVuIDFcbiAgICAgICAgaW5wdXRcbiAgICAgICAgICAucGlwZSBIT0xMRVJJVEguJHdyaXRlIGRiLCBzZXR0aW5nc1xuICAgICAgICAgICMgLnBpcGUgRC4kc2hvdygpXG4gICAgICAgICAgLnBpcGUgRC4kb25fZW5kICggZW5kICkgPT5cbiAgICAgICAgICAgIHdoaXNwZXIgXCJ0ZXN0IGRhdGEgd3JpdHRlblwiXG4gICAgICAgICAgICBlbmQoKVxuICAgICAgICAgICAgaGFuZGxlciBudWxsXG4gICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgICAgZm9yIHVybF9rZXkgaW4gQF9mZWVkX3Rlc3RfZGF0YS5wcm9iZXNbIHByb2Jlc19pZHggXVxuICAgICAgICAgIGtleSA9IEhPTExFUklUSC5rZXlfZnJvbV91cmwgZGIsIHVybF9rZXlcbiAgICAgICAgICBpbnB1dC53cml0ZSBrZXlcbiAgICAgICAgICB5aWVsZCBzZXRJbW1lZGlhdGUgcmVzdW1lXG4gICAgICAgIGlucHV0LmVuZCgpXG4gICAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgZWxzZSByZXR1cm4gaGFuZGxlciBuZXcgRXJyb3IgXCJpbGxlZ2FsIHByb2JlcyBpbmRleCAje3JwciBwcm9iZXNfaWR4fVwiXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcmV0dXJuIG51bGxcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX2ZlZWRfdGVzdF9kYXRhLnByb2JlcyA9IFtdXG5cbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuQF9mZWVkX3Rlc3RfZGF0YS5wcm9iZXMucHVzaCBbXG4gIFsgJ/Cnt58xJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAgICAgICAgICAgICAgMSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn8Ke3nzInLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsICAgICAgICAgICAgICAyLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfwp7efMycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgICAgICAgICAgICAgIDMsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ/Cnt580JywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAgICAgICAgICAgICAgNCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn8Ke3nycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgICAgICAgICAgICAgICA1LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfwp7efNicsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgICAgICAgICAgICAgIDYsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ/Cnt58nLCAnY3AvY2lkJywgICAgICAgICAgICAgICAgICAgICAgICAgICAxNjMyOTUsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn8Ke3nycsICdndWlkZS91Y2hyL2hhcycsICAgICAgICAgICAgICAgICAgIFsgJ+WFqycsICfliIAnLCAn5a6AJywgJ+6HuicsICfosp0nLCBdLCAgICAgIF1cbiAgWyAn8Ke3nycsICdyYW5rL2NqdCcsICAgICAgICAgICAgICAgICAgICAgICAgIDU0MzIsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICflhasnLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICAgICAgICAgICczNCcsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5YiAJywgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCAgICAgICAgICAnNSgxMikzJywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+WugCcsICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgICAgICAgICAgJzQ0JywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfuh7onLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICAgICAgICAgICcxMicsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn6LKdJywgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCAgICAgICAgICAnMjUoMTIpJywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+WFqycsICdyYW5rL2NqdCcsICAgICAgICAgICAgICAgICAgICAgICAgIDEyNTQxLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfliIAnLCAncmFuay9janQnLCAgICAgICAgICAgICAgICAgICAgICAgICAxMjU0MiwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5a6AJywgJ3JhbmsvY2p0JywgICAgICAgICAgICAgICAgICAgICAgICAgMTI1NDMsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+6HuicsICdyYW5rL2NqdCcsICAgICAgICAgICAgICAgICAgICAgICAgIDEyNTQ0LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfosp0nLCAncmFuay9janQnLCAgICAgICAgICAgICAgICAgICAgICAgICAxMjU0NSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgXVxuXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkBfZmVlZF90ZXN0X2RhdGEucHJvYmVzLnB1c2ggW1xuICAnc298Z2x5cGg65YqsfGNwL2ZuY3I6dS1jamsvNTJhY3wwJ1xuICAnc298Z2x5cGg66YKtfGNwL2ZuY3I6dS1jamsvOTBhZHwwJ1xuICAnc298Z2x5cGg68KC0pnxjcC9mbmNyOnUtY2prLXhiLzIwZDI2fDAnXG4gICdzb3xnbHlwaDrwpL+vfGNwL2ZuY3I6dS1jamsteGIvMjRmZWZ8MCdcbiAgJ3NvfGdseXBoOvCnkbR8Y3AvZm5jcjp1LWNqay14Yi8yNzQ3NHwwJ1xuICAnc298Z2x5cGg68KiSoXxjcC9mbmNyOnUtY2prLXhiLzI4NGExfDAnXG4gICdzb3xnbHlwaDrwqpqnfGNwL2ZuY3I6dS1jamsteGIvMmE2YTd8MCdcbiAgJ3NvfGdseXBoOvCqmqt8Y3AvZm5jcjp1LWNqay14Yi8yYTZhYnwwJ1xuICAnc298Z2x5cGg68KS/r3xzdHJva2VvcmRlcjozNTI1MTM1NTMyNTR8MCdcbiAgJ3NvfGdseXBoOvCgtKZ8c3Ryb2tlb3JkZXI6MzUyNTE0MTEyMXwwJ1xuICAnc298Z2x5cGg68KiSoXxzdHJva2VvcmRlcjozNTI1MTQ1NHwwJ1xuICAnc298Z2x5cGg66YKtfHN0cm9rZW9yZGVyOjM1MjUxNTJ8MCdcbiAgJ3NvfGdseXBoOvCqmqt8c3Ryb2tlb3JkZXI6MzUyNTE1MjUxMTE1MTE1MTEzNTQxfDAnXG4gICdzb3xnbHlwaDrwqpqnfHN0cm9rZW9yZGVyOjM1MjUxNTI1MTEyNTExNTExfDAnXG4gICdzb3xnbHlwaDrwp5G0fHN0cm9rZW9yZGVyOjM1MjUxNTI1MTIxNDI1MTIxNHwwJ1xuICAnc298Z2x5cGg65YqsfHN0cm9rZW9yZGVyOjM1MjUxNTN8MCdcbiAgXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfZmVlZF90ZXN0X2RhdGEucHJvYmVzLnB1c2ggW1xuICBbICfkuIEnLCAnc3Ryb2tlY291bnQnLCAgICAgMiwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5LiJJywgJ3N0cm9rZWNvdW50JywgICAgIDMsICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+WkqycsICdzdHJva2Vjb3VudCcsICAgICA1LCAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICflnIsnLCAnc3Ryb2tlY291bnQnLCAgICAgMTEsICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5b2iJywgJ3N0cm9rZWNvdW50JywgICAgIDcsICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+S4gScsICdjb21wb25lbnRjb3VudCcsICAxLCAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfkuIknLCAnY29tcG9uZW50Y291bnQnLCAgMSwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5aSrJywgJ2NvbXBvbmVudGNvdW50JywgIDEsICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+WciycsICdjb21wb25lbnRjb3VudCcsICA0LCAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICflvaInLCAnY29tcG9uZW50Y291bnQnLCAgMiwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5LiBJywgJ2NvbXBvbmVudHMnLCAgICAgIFsgJ+S4gScsIF0sICAgICAgICAgICAgICAgICAgXVxuICBbICfkuIknLCAnY29tcG9uZW50cycsICAgICAgWyAn5LiJJywgXSwgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+WkqycsICdjb21wb25lbnRzJywgICAgICBbICflpKsnLCBdLCAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5ZyLJywgJ2NvbXBvbmVudHMnLCAgICAgIFsgJ+WblycsICfmiIgnLCAn5Y+jJywgJ+S4gCcsIF0sIF1cbiAgWyAn5b2iJywgJ2NvbXBvbmVudHMnLCAgICAgIFsgJ+W8gCcsICflvaEnLCBdLCAgICAgICAgICAgICBdXG4gIF1cblxuIyBwb3N8Z3VpZGUva3dpYy9zb3J0Y29kZVxuXG4jICMgW1xuIyAjIFwiMTAyN35+fn4sMDBcIixcIjAxNTZ+fn5+LDAxLDA1MDl+fn5+LDAyLDAwMDB+fn5+LDAzLC0tLS0tLS0tLDA0LC0tLS0tLS0tLDA1LC0tLS0tLS0tLDA2LC0tLS0tLS0tLDA3LC0tLS0tLS0tLDA4LC0tLS0tLS0tLDA5LC0tLS0tLS0tLDEwLC0tLS0tLS0tLDExLC0tLS0tLS0tLDEyLFwiXG4jICMgXCIwMTU2fn5+fiwwMVwiLFwiMDUwOX5+fn4sMDIsMDAwMH5+fn4sMDMsLS0tLS0tLS0sMDQsLS0tLS0tLS0sMDUsLS0tLS0tLS0sMDYsLS0tLS0tLS0sMDcsLS0tLS0tLS0sMDgsLS0tLS0tLS0sMDksLS0tLS0tLS0sMTAsLS0tLS0tLS0sMTEsLS0tLS0tLS0sMTIsMTAyN35+fn4sMDAsXCJcbiMgIyBcIjA1MDl+fn5+LDAyXCIsXCIwMDAwfn5+fiwwMywtLS0tLS0tLSwwNCwtLS0tLS0tLSwwNSwtLS0tLS0tLSwwNiwtLS0tLS0tLSwwNywtLS0tLS0tLSwwOCwtLS0tLS0tLSwwOSwtLS0tLS0tLSwxMCwtLS0tLS0tLSwxMSwtLS0tLS0tLSwxMiwxMDI3fn5+fiwwMCwwMTU2fn5+fiwwMSxcIlxuIyAjIFwiMDAwMH5+fn4sMDNcIixcIi0tLS0tLS0tLDA0LC0tLS0tLS0tLDA1LC0tLS0tLS0tLDA2LC0tLS0tLS0tLDA3LC0tLS0tLS0tLDA4LC0tLS0tLS0tLDA5LC0tLS0tLS0tLDEwLC0tLS0tLS0tLDExLC0tLS0tLS0tLDEyLDEwMjd+fn5+LDAwLDAxNTZ+fn5+LDAxLDA1MDl+fn5+LDAyLFwiXG4jICMgXVxuXG4jIDAwODd+fn5+LDAwLDAyOTF+fn5+LDAxLDA1NTV+fn5+LDAyLC0tLS0tLS0tLDAzLC0tLS0tLS0tLDA0LC0tLS0tLS0tLDA1LC0tLS0tLS0tLDA2LC0tLS0tLS0tLDA3LC0tLS0tLS0tLDA4LC0tLS0tLS0tLDA5LC0tLS0tLS0tLDEwLC0tLS0tLS0tLDExLC0tLS0tLS0tLDEyLHzwppaIfDBcbiMgMDA4N35+fn4sMDAsMDI5MX5+fn4sMDEsMDgyM3gyaC0sMDIsLS0tLS0tLS0sMDMsLS0tLS0tLS0sMDQsLS0tLS0tLS0sMDUsLS0tLS0tLS0sMDYsLS0tLS0tLS0sMDcsLS0tLS0tLS0sMDgsLS0tLS0tLS0sMDksLS0tLS0tLS0sMTAsLS0tLS0tLS0sMTEsLS0tLS0tLS0sMTIsfOiBl3wwXG4jIDAwODd+fn5+LDAwLDAyOTF+fn5+LDAxLDEwMjN+fn5+LDAyLC0tLS0tLS0tLDAzLC0tLS0tLS0tLDA0LC0tLS0tLS0tLDA1LC0tLS0tLS0tLDA2LC0tLS0tLS0tLDA3LC0tLS0tLS0tLDA4LC0tLS0tLS0tLDA5LC0tLS0tLS0tLDEwLC0tLS0tLS0tLDExLC0tLS0tLS0tLDEyLHzwpIuVfDBcbiMgMDA4N35+fn4sMDAsMDI5NH5+fn4sMDEsMDA2MH5+fn4sMDIsLS0tLS0tLS0sMDMsLS0tLS0tLS0sMDQsLS0tLS0tLS0sMDUsLS0tLS0tLS0sMDYsLS0tLS0tLS0sMDcsLS0tLS0tLS0sMDgsLS0tLS0tLS0sMDksLS0tLS0tLS0sMTAsLS0tLS0tLS0sMTEsLS0tLS0tLS0sMTIsfPCmlpR8MFxuIyAwMDg3fn5+fiwwMCwwMjk0fn5+fiwwMSwwNTU1fn5+fiwwMiwtLS0tLS0tLSwwMywtLS0tLS0tLSwwNCwtLS0tLS0tLSwwNSwtLS0tLS0tLSwwNiwtLS0tLS0tLSwwNywtLS0tLS0tLSwwOCwtLS0tLS0tLSwwOSwtLS0tLS0tLSwxMCwtLS0tLS0tLSwxMSwtLS0tLS0tLSwxMix88KaXhnwwXG4jIDAwODd+fn5+LDAwLDAyOTV+fn5+LDAxLDA4MDJ+fn5+LDAyLDA5NTh+fn5+LDAzLC0tLS0tLS0tLDA0LC0tLS0tLS0tLDA1LC0tLS0tLS0tLDA2LC0tLS0tLS0tLDA3LC0tLS0tLS0tLDA4LC0tLS0tLS0tLDA5LC0tLS0tLS0tLDEwLC0tLS0tLS0tLDExLC0tLS0tLS0tLDEyLHzwpaq7fDBcbiMgMDA4N35+fn4sMDAsMDMxMn5+fn4sMDEsLS0tLS0tLS0sMDIsLS0tLS0tLS0sMDMsLS0tLS0tLS0sMDQsLS0tLS0tLS0sMDUsLS0tLS0tLS0sMDYsLS0tLS0tLS0sMDcsLS0tLS0tLS0sMDgsLS0tLS0tLS0sMDksLS0tLS0tLS0sMTAsLS0tLS0tLS0sMTEsLS0tLS0tLS0sMTIsfPCmlLJ8MFxuIyAwMDg3fn5+fiwwMCwwMzE0fn5+fiwwMSwxMTczfn5+fiwwMiwtLS0tLS0tLSwwMywtLS0tLS0tLSwwNCwtLS0tLS0tLSwwNSwtLS0tLS0tLSwwNiwtLS0tLS0tLSwwNywtLS0tLS0tLSwwOCwtLS0tLS0tLSwwOSwtLS0tLS0tLSwxMCwtLS0tLS0tLSwxMSwtLS0tLS0tLSwxMix88KaVgHwwXG4jIDAwODd+fn5+LDAwLDAzMTl+fn5+LDAxLC0tLS0tLS0tLDAyLC0tLS0tLS0tLDAzLC0tLS0tLS0tLDA0LC0tLS0tLS0tLDA1LC0tLS0tLS0tLDA2LC0tLS0tLS0tLDA3LC0tLS0tLS0tLDA4LC0tLS0tLS0tLDA5LC0tLS0tLS0tLDEwLC0tLS0tLS0tLDExLC0tLS0tLS0tLDEyLHzwppWHfDBcbiMgMDA4N35+fn4sMDAsMDM1NX5+fn4sMDEsLS0tLS0tLS0sMDIsLS0tLS0tLS0sMDMsLS0tLS0tLS0sMDQsLS0tLS0tLS0sMDUsLS0tLS0tLS0sMDYsLS0tLS0tLS0sMDcsLS0tLS0tLS0sMDgsLS0tLS0tLS0sMDksLS0tLS0tLS0sMTAsLS0tLS0tLS0sMTEsLS0tLS0tLS0sMTIsfPCmlYZ8MFxuIyAwMDg3fn5+fiwwMCwwMzczfn5+fiwwMSwwMjg0fn5+fiwwMiwtLS0tLS0tLSwwMywtLS0tLS0tLSwwNCwtLS0tLS0tLSwwNSwtLS0tLS0tLSwwNiwtLS0tLS0tLSwwNywtLS0tLS0tLSwwOCwtLS0tLS0tLSwwOSwtLS0tLS0tLSwxMCwtLS0tLS0tLSwxMSwtLS0tLS0tLSwxMix88KaVp3wwXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJ3cml0ZSB3aXRob3V0IGVycm9yXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHByb2Jlc19pZHggID0gMFxuICBpZHggPSAtMVxuICB3cml0ZV9zZXR0aW5ncyA9XG4gICAgYmF0Y2g6IDEwXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHdyaXRlX3NldHRpbmdzLCByZXN1bWVcbiAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgd2l0aG91dCBlcnJvclwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ID0gLTFcbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgZGVidWcgJ8KpN2xFZ3knLCBkYlsnJXNlbGYnXS5pc0Nsb3NlZCgpXG4gICAgZGVidWcgJ8KpN2xFZ3knLCBkYlsnJXNlbGYnXS5pc09wZW4oKVxuICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHJlc3VtZVxuICAgICMgZG9uZSgpXG4gICAgaW5wdXQgPSBIT0xMRVJJVEguY3JlYXRlX2ZhY2V0c3RyZWFtIGRiXG4gICAgaW5wdXRcbiAgICAgICMgLnBpcGUgSE9MTEVSSVRILiR1cmxfZnJvbV9rZXkgZGJcbiAgICAgIC5waXBlICQgKCBbIGtleSwgdmFsdWUsIF0sIHNlbmQgKSA9PlxuICAgICAgICBpZHggKz0gKzFcbiAgICAgICAgIyBULmVxIGtleSwgbWF0Y2hlcnNbIGlkeCBdXG4gICAgICAucGlwZSBELiRvbl9lbmQgKCBlbmQgKSA9PiBlbmQ7IGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCBrZXlzIHdpdGhvdXQgZXJyb3IgKDEpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEhPTExFUklUSC5jbGVhciBkYiwgcmVzdW1lXG4gICAgIyMjIFRBSU5UIGF3YWl0aW5nIGJldHRlciBzb2x1dGlvbiAjIyNcbiAgICBOVUxMID0gSE9MTEVSSVRILl9lbmNvZGVfdmFsdWUgZGIsIDFcbiAgICBmb3IgaWR4IGluIFsgMCAuLi4gMTAgXVxuICAgICAgZGJbICclc2VsZicgXS5wdXQgKCBIT0xMRVJJVEguX2VuY29kZV9rZXkgZGIsIFsgJ3gnLCBpZHgsICd4JywgXSApLCBOVUxMXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwcm9iZV9pZHggPSA0XG4gICAgY291bnQgICAgID0gMFxuICAgIHF1ZXJ5ICAgICA9IEhPTExFUklUSC5fcXVlcnlfZnJvbV9wcmVmaXggZGIsIFsgJ3gnLCBwcm9iZV9pZHgsIF1cbiAgICBpbnB1dCAgICAgPSBkYlsgJyVzZWxmJyBdLmNyZWF0ZVJlYWRTdHJlYW0gcXVlcnlcbiAgICBpbnB1dFxuICAgICAgLnBpcGUgJCAoIHsga2V5LCB2YWx1ZSwgfSwgc2VuZCApID0+XG4gICAgICAgIGNvdW50ICs9IDFcbiAgICAgICAgVC5lcSAoIEhPTExFUklUSC5fZGVjb2RlX2tleSBkYiwga2V5IClbIDEgXSwgcHJvYmVfaWR4XG4gICAgICAucGlwZSBELiRvbl9lbmQgKCBlbmQgKSA9PlxuICAgICAgICBULmVxIGNvdW50LCAxXG4gICAgICAgIGVuZCgpXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCBrZXlzIHdpdGhvdXQgZXJyb3IgKDIpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEhPTExFUklUSC5jbGVhciBkYiwgcmVzdW1lXG4gICAgIyMjIFRBSU5UIGF3YWl0aW5nIGJldHRlciBzb2x1dGlvbiAjIyNcbiAgICBOVUxMID0gSE9MTEVSSVRILl9lbmNvZGVfdmFsdWUgZGIsIDFcbiAgICBmb3IgaWR4IGluIFsgMCAuLi4gMTAgXVxuICAgICAgZGJbICclc2VsZicgXS5wdXQgKCBIT0xMRVJJVEguX2VuY29kZV9rZXkgZGIsIFsgJ3gnLCBpZHgsICd4JywgXSApLCBOVUxMXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwcm9iZV9pZHggPSA0XG4gICAgY291bnQgICAgID0gMFxuICAgIHByZWZpeCAgICA9IFsgJ3gnLCBwcm9iZV9pZHgsIF1cbiAgICBpbnB1dCAgICAgPSBIT0xMRVJJVEguY3JlYXRlX2ZhY2V0c3RyZWFtIGRiLCBwcmVmaXhcbiAgICBpbnB1dFxuICAgICAgLnBpcGUgJCAoIGZhY2V0LCBzZW5kICkgPT5cbiAgICAgICAgY291bnQgKz0gMVxuICAgICAgICBbIGtleSwgdmFsdWUsIF0gPSBmYWNldFxuICAgICAgICBULmVxIGtleVsgMSBdLCBwcm9iZV9pZHhcbiAgICAgIC5waXBlIEQuJG9uX2VuZCAoIGVuZCApID0+XG4gICAgICAgIFQuZXEgY291bnQsIDFcbiAgICAgICAgZW5kKClcbiAgICAgICAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZWFkIGtleXMgd2l0aG91dCBlcnJvciAoMylcIiBdID0gKCBULCBkb25lICkgLT5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgSE9MTEVSSVRILmNsZWFyIGRiLCByZXN1bWVcbiAgICAjIyMgVEFJTlQgYXdhaXRpbmcgYmV0dGVyIHNvbHV0aW9uICMjI1xuICAgIE5VTEwgPSBIT0xMRVJJVEguX2VuY29kZV92YWx1ZSBkYiwgMVxuICAgIGZvciBpZHggaW4gWyAwIC4uLiAxMCBdXG4gICAgICBkYlsgJyVzZWxmJyBdLnB1dCAoIEhPTExFUklUSC5fZW5jb2RlX2tleSBkYiwgWyAneCcsIGlkeCwgJ3gnLCBdICksIE5VTExcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHByb2JlX2lkeCA9IDNcbiAgICBjb3VudCAgICAgPSAwXG4gICAgZGVsdGEgICAgID0gMlxuICAgIGxvICAgICAgICA9IFsgJ3gnLCBwcm9iZV9pZHgsIF1cbiAgICBoaSAgICAgICAgPSBbICd4JywgcHJvYmVfaWR4ICsgZGVsdGEsIF1cbiAgICBxdWVyeSAgICAgPSB7IGd0ZTogKCBIT0xMRVJJVEguX2VuY29kZV9rZXkgZGIsIGxvICksIGx0ZTogKCBIT0xMRVJJVEguX3F1ZXJ5X2Zyb21fcHJlZml4IGRiLCBoaSApWyAnbHRlJyBdLCB9XG4gICAgaW5wdXQgICAgID0gZGJbICclc2VsZicgXS5jcmVhdGVSZWFkU3RyZWFtIHF1ZXJ5XG4gICAgaW5wdXRcbiAgICAgIC5waXBlICQgKCB7IGtleSwgdmFsdWUsIH0sIHNlbmQgKSA9PlxuICAgICAgICBjb3VudCArPSAxXG4gICAgICAgIFQuZXEgKCBIT0xMRVJJVEguX2RlY29kZV9rZXkgZGIsIGtleSApWyAxIF0sIHByb2JlX2lkeCArIGNvdW50IC0gMVxuICAgICAgLnBpcGUgRC4kb25fZW5kICggZW5kICkgPT5cbiAgICAgICAgVC5lcSBjb3VudCwgZGVsdGEgKyAxXG4gICAgICAgIGVuZCgpXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCBrZXlzIHdpdGhvdXQgZXJyb3IgKDQpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEhPTExFUklUSC5jbGVhciBkYiwgcmVzdW1lXG4gICAgZm9yIGlkeCBpbiBbIDAgLi4uIDEwIF1cbiAgICAgIGRiWyAnJXNlbGYnIF0ucHV0ICggSE9MTEVSSVRILl9lbmNvZGVfa2V5IGRiLCBbICd4JywgaWR4LCAneCcsIF0gKSwgSE9MTEVSSVRILl9lbmNvZGVfdmFsdWUgZGIsIDFcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHByb2JlX2lkeCA9IDNcbiAgICBjb3VudCAgICAgPSAwXG4gICAgZGVsdGEgICAgID0gMlxuICAgIGxvICAgICAgICA9IFsgJ3gnLCBwcm9iZV9pZHgsIF1cbiAgICBoaSAgICAgICAgPSBbICd4JywgcHJvYmVfaWR4ICsgZGVsdGEsIF1cbiAgICBpbnB1dCAgICAgPSBIT0xMRVJJVEguY3JlYXRlX2ZhY2V0c3RyZWFtIGRiLCBsbywgaGlcbiAgICBpbnB1dFxuICAgICAgLnBpcGUgJCAoIFsga2V5LCB2YWx1ZSwgXSwgc2VuZCApID0+XG4gICAgICAgIGNvdW50ICs9IDFcbiAgICAgICAgVC5lcSBrZXlbIDEgXSwgcHJvYmVfaWR4ICsgY291bnQgLSAxXG4gICAgICAucGlwZSBELiRvbl9lbmQgKCBlbmQgKSA9PlxuICAgICAgICBULmVxIGNvdW50LCBkZWx0YSArIDFcbiAgICAgICAgZW5kKClcbiAgICAgICAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJjcmVhdGVfZmFjZXRzdHJlYW0gdGhyb3dzIHdpdGggd3JvbmcgYXJndW1lbnRzXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIG1lc3NhZ2UgPSBcIm11c3QgZ2l2ZSBgbG9faGludGAgd2hlbiBgaGlfaGludGAgaXMgZ2l2ZW5cIlxuICBULnRocm93cyBtZXNzYWdlLCAoIC0+IEhPTExFUklUSC5jcmVhdGVfZmFjZXRzdHJlYW0gZGIsIG51bGwsIFsgJ3h4eCcsIF0gKVxuICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgUE9TIGZhY2V0c1wiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ICAgICAgICAgPSAtMVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGtleV9tYXRjaGVycyA9IFtcbiAgICBbICdwb3MnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDIsICfwp7efMicgXVxuICAgIFsgJ3BvcycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgMywgJ/Cnt58zJyBdXG4gICAgWyAncG9zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCA0LCAn8Ke3nzQnIF1cbiAgICBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcGhyYXNlX21hdGNoZXJzID0gW1xuICAgIFsgJ3BvcycsICfwp7efMicsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgMiBdXG4gICAgWyAncG9zJywgJ/Cnt58zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAzIF1cbiAgICBbICdwb3MnLCAn8Ke3nzQnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDQgXVxuICAgIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBAX2ZlZWRfdGVzdF9kYXRhIGRiLCBwcm9iZXNfaWR4LCByZXN1bWVcbiAgICBsbyA9IFsgJ3BvcycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgMiwgXVxuICAgIGhpID0gWyAncG9zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCA0LCBdXG4gICAgIyBpbnB1dCAgID0gSE9MTEVSSVRILmNyZWF0ZV9rZXlzdHJlYW0gZGIsIGxvXG4gICAgaW5wdXQgICA9IEhPTExFUklUSC5jcmVhdGVfZmFjZXRzdHJlYW0gZGIsIGxvLCBoaVxuICAgIGlucHV0XG4gICAgICAjIC5waXBlIEhPTExFUklUSC4kdXJsX2Zyb21fa2V5IGRiXG4gICAgICAucGlwZSAkICggWyBrZXksIHZhbHVlLCBdLCBzZW5kICkgPT5cbiAgICAgICAgaWR4ICs9ICsxXG4gICAgICAgIHBocmFzZSA9IEhPTExFUklUSC5hc19waHJhc2UgZGIsIGtleSwgdmFsdWVcbiAgICAgICAgVC5lcSBrZXksIGtleV9tYXRjaGVyc1sgaWR4IF1cbiAgICAgICAgVC5lcSBwaHJhc2UsIHBocmFzZV9tYXRjaGVyc1sgaWR4IF1cbiAgICAgIC5waXBlIEQuJG9uX2VuZCAoIGVuZCApID0+IGVuZCgpOyBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgUE9TIHBocmFzZXMgKDEpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHByb2Jlc19pZHggID0gMFxuICBpZHggICAgICAgICA9IC0xXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgbWF0Y2hlcnMgPSBbXG4gICAgWyAncG9zJywgJ/Cnt58yJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAyIF1cbiAgICBbICdwb3MnLCAn8Ke3nzMnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDMgXVxuICAgIFsgJ3BvcycsICfwp7efNCcsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgNCBdXG4gICAgXVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHJlc3VtZVxuICAgIGxvID0gWyAncG9zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAyLCBdXG4gICAgaGkgPSBbICdwb3MnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDQsIF1cbiAgICBpbnB1dCAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIGxvLCBoaVxuICAgIGlucHV0XG4gICAgICAucGlwZSAkICggcGhyYXNlLCBzZW5kICkgPT5cbiAgICAgICAgaWR4ICs9ICsxXG4gICAgICAgIFQuZXEgcGhyYXNlLCBtYXRjaGVyc1sgaWR4IF1cbiAgICAgIC5waXBlIEQuJG9uX2VuZCAoIGVuZCApID0+IGVuZCgpOyBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgUE9TIHBocmFzZXMgKDIpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHByb2Jlc19pZHggID0gMFxuICBpZHggICAgICAgICA9IC0xXG4gIGNvdW50ICAgICAgID0gMFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIG1hdGNoZXJzID0gW1xuICAgIFsgJ3BvcycsICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgJ+WFqycsIDAgXVxuICAgIFsgJ3BvcycsICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgJ+WIgCcsIDEgXVxuICAgIFsgJ3BvcycsICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgJ+WugCcsIDIgXVxuICAgIFsgJ3BvcycsICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgJ+iynScsIDQgXVxuICAgIFsgJ3BvcycsICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgJ+6HuicsIDMgXVxuICAgIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBAX2ZlZWRfdGVzdF9kYXRhIGRiLCBwcm9iZXNfaWR4LCByZXN1bWVcbiAgICBwcmVmaXggICAgPSBbICdwb3MnLCAnZ3VpZGUvdWNoci9oYXMnLCBdXG4gICAgaW5wdXQgICAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIHByZWZpeFxuICAgIHNldHRpbmdzICA9IHsgaW5kZXhlZDogbm8sIH1cbiAgICBpbnB1dFxuICAgICAgLnBpcGUgJCAoIHBocmFzZSwgc2VuZCApID0+XG4gICAgICAgIGRlYnVnICfCqURzQWZZJywgcnByIHBocmFzZVxuICAgICAgICBjb3VudCAgKz0gKzFcbiAgICAgICAgaWR4ICAgICs9ICsxXG4gICAgICAgIFQuZXEgcGhyYXNlLCBtYXRjaGVyc1sgaWR4IF1cbiAgICAgIC5waXBlIEQuJG9uX2VuZCAoIGVuZCApID0+XG4gICAgICAgIFQuZXEgY291bnQsIG1hdGNoZXJzLmxlbmd0aFxuICAgICAgICBlbmQoKVxuICAgICAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgU1BPIHBocmFzZXNcIiBdID0gKCBULCBkb25lICkgLT5cbiAgZGVidWcgJ8KpUnNveGInLCBkYlsgJyVzZWxmJyBdLmlzT3BlbigpXG4gIHByb2Jlc19pZHggID0gMFxuICBpZHggICAgICAgICA9IC0xXG4gIGNvdW50ICAgICAgID0gMFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIG1hdGNoZXJzID0gW1xuICAgIFsgJ3NwbycsICfwp7efJywgJ2NwL2NpZCcsIDE2MzI5NSBdXG4gICAgWyAnc3BvJywgJ/Cnt58nLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDUgXVxuICAgIFsgJ3NwbycsICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgWyAn5YWrJywgJ+WIgCcsICflroAnLCAn7oe6JywgJ+iynScgXSBdXG4gICAgWyAnc3BvJywgJ/Cnt58nLCAncmFuay9janQnLCA1NDMyIF1cbiAgICBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgQF9mZWVkX3Rlc3RfZGF0YSBkYiwgcHJvYmVzX2lkeCwgcmVzdW1lXG4gICAgcHJlZml4ICA9IFsgJ3NwbycsICfwp7efJywgXVxuICAgIGlucHV0ICAgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgcHJlZml4XG4gICAgaW5wdXRcbiAgICAgIC5waXBlICQgKCBwaHJhc2UsIHNlbmQgKSA9PlxuICAgICAgICBkZWJ1ZyAnwqlEc0FmWScsIHJwciBwaHJhc2VcbiAgICAgICAgY291bnQgICs9ICsxXG4gICAgICAgIGlkeCAgICArPSArMVxuICAgICAgICBULmVxIHBocmFzZSwgbWF0Y2hlcnNbIGlkeCBdXG4gICAgICAucGlwZSBELiRvbl9lbmQgKCBlbmQgKSA9PlxuICAgICAgICBULmVxIGNvdW50LCBtYXRjaGVycy5sZW5ndGhcbiAgICAgICAgZW5kKClcbiAgICAgICAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZWFkIHdpdGggc3ViLXJlYWQgKDEpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHByb2Jlc19pZHggID0gMFxuICBpZHggICAgICAgICA9IC0xXG4gIGNvdW50ICAgICAgID0gMFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIG1hdGNoZXJzID0gW1xuICAgIFsgJ/Cnt58nLCBbICdzcG8nLCAn5YWrJywgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCAnMzQnIF0gXVxuICAgIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBAX2ZlZWRfdGVzdF9kYXRhIGRiLCBwcm9iZXNfaWR4LCByZXN1bWVcbiAgICBwcmVmaXggICAgPSBbICdzcG8nLCAn8Ke3nycsICdndWlkZS91Y2hyL2hhcycsIF1cbiAgICBpbnB1dCAgICAgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgcHJlZml4XG4gICAgc2V0dGluZ3MgID0geyBpbmRleGVkOiBubywgfVxuICAgIGlucHV0XG4gICAgICAucGlwZSBIT0xMRVJJVEgucmVhZF9zdWIgZGIsIHNldHRpbmdzLCAoIFsgcGhyYXNldHlwZSwgZ2x5cGgsIHByZCwgZ3VpZGVzLCBdICkgPT5cbiAgICAgICAgc3ViX2lucHV0ID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIFsgJ3NwbycsIGd1aWRlc1sgMCBdLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsIF1cbiAgICAgICAgcmV0dXJuIFsgZ2x5cGgsIHN1Yl9pbnB1dCwgXVxuICAgICAgLnBpcGUgJCAoIHBocmFzZSwgc2VuZCApID0+XG4gICAgICAgIGNvdW50ICArPSArMVxuICAgICAgICBpZHggICAgKz0gKzFcbiAgICAgICAgVC5lcSBwaHJhc2UsIG1hdGNoZXJzWyBpZHggXVxuICAgICAgLnBpcGUgRC4kb25fZW5kICggZW5kICkgPT5cbiAgICAgICAgVC5lcSBjb3VudCwgbWF0Y2hlcnMubGVuZ3RoXG4gICAgICAgIGVuZCgpXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCB3aXRoIHN1Yi1yZWFkICgyKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ICAgICAgICAgPSAtMVxuICBjb3VudCAgICAgICA9IDBcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBtYXRjaGVycyA9IFtcbiAgICBbICfwp7efJywgWyAnc3BvJywgJ+WFqycsICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgJzM0JyBdIF1cbiAgICBbICfwp7efJywgWyAnc3BvJywgJ+WIgCcsICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgJzUoMTIpMycgXSBdXG4gICAgWyAn8Ke3nycsIFsgJ3NwbycsICflroAnLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICc0NCcgXSBdXG4gICAgWyAn8Ke3nycsIFsgJ3NwbycsICfosp0nLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICcyNSgxMiknIF0gXVxuICAgIFsgJ/Cnt58nLCBbICdzcG8nLCAn7oe6JywgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCAnMTInIF0gXVxuICAgIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBAX2ZlZWRfdGVzdF9kYXRhIGRiLCBwcm9iZXNfaWR4LCByZXN1bWVcbiAgICBwcmVmaXggICAgPSBbICdwb3MnLCAnZ3VpZGUvdWNoci9oYXMnLCBdXG4gICAgaW5wdXQgICAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIHByZWZpeFxuICAgIHNldHRpbmdzICA9IHsgaW5kZXhlZDogbm8sIH1cbiAgICBpbnB1dFxuICAgICAgLnBpcGUgSE9MTEVSSVRILnJlYWRfc3ViIGRiLCBzZXR0aW5ncywgKCBwaHJhc2UgKSA9PlxuICAgICAgICBbIF8sIGdseXBoLCBwcmQsIGd1aWRlLCBdID0gcGhyYXNlXG4gICAgICAgIHByZWZpeCAgICAgICAgICAgICAgICAgICAgPSBbICdzcG8nLCBndWlkZSwgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCBdXG4gICAgICAgIHN1Yl9pbnB1dCAgICAgICAgICAgICAgICAgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgcHJlZml4XG4gICAgICAgIHJldHVybiBbIGdseXBoLCBzdWJfaW5wdXQsIF1cbiAgICAgIC5waXBlICQgKCBwaHJhc2UsIHNlbmQgKSA9PlxuICAgICAgICBkZWJ1ZyAnwqlxdVBiZycsIEpTT04uc3RyaW5naWZ5IHBocmFzZVxuICAgICAgICBjb3VudCAgKz0gKzFcbiAgICAgICAgaWR4ICAgICs9ICsxXG4gICAgICAgIFQuZXEgcGhyYXNlLCBtYXRjaGVyc1sgaWR4IF1cbiAgICAgIC5waXBlIEQuJG9uX2VuZCAoIGVuZCApID0+XG4gICAgICAgIFQuZXEgY291bnQsIG1hdGNoZXJzLmxlbmd0aFxuICAgICAgICBlbmQoKVxuICAgICAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgd2l0aCBzdWItcmVhZCAoMylcIiBdID0gKCBULCBkb25lICkgLT5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgQF9yZWFkX3dpdGhfc3ViX3JlYWRfMyBULCBiYXRjaDogMCwgICAgcmVzdW1lXG4gICAgeWllbGQgQF9yZWFkX3dpdGhfc3ViX3JlYWRfMyBULCBiYXRjaDogMywgICAgcmVzdW1lXG4gICAgeWllbGQgQF9yZWFkX3dpdGhfc3ViX3JlYWRfMyBULCBiYXRjaDogNSwgICAgcmVzdW1lXG4gICAgeWllbGQgQF9yZWFkX3dpdGhfc3ViX3JlYWRfMyBULCBiYXRjaDogMTAwMCwgcmVzdW1lXG4gICAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9yZWFkX3dpdGhfc3ViX3JlYWRfMyA9ICggVCwgd3JpdGVfc2V0dGluZ3MsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ICAgICAgICAgPSAtMVxuICBjb3VudCAgICAgICA9IDBcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBtYXRjaGVycyA9IFtcbiAgICBbW1wi8Ke3n1wiLFwi5YWrXCIsXCIzNFwiXSwgICAgICBbXCJzcG9cIixcIuWFq1wiLFwicmFuay9janRcIiwxMjU0MV1dXG4gICAgW1tcIvCnt59cIixcIuWIgFwiLFwiNSgxMikzXCJdLCAgW1wic3BvXCIsXCLliIBcIixcInJhbmsvY2p0XCIsMTI1NDJdXVxuICAgIFtbXCLwp7efXCIsXCLlroBcIixcIjQ0XCJdLCAgICAgIFtcInNwb1wiLFwi5a6AXCIsXCJyYW5rL2NqdFwiLDEyNTQzXV1cbiAgICBbW1wi8Ke3n1wiLFwi6LKdXCIsXCIyNSgxMilcIl0sICBbXCJzcG9cIixcIuiynVwiLFwicmFuay9janRcIiwxMjU0NV1dXG4gICAgW1tcIvCnt59cIixcIu6HulwiLFwiMTJcIl0sICAgICAgW1wic3BvXCIsXCLuh7pcIixcInJhbmsvY2p0XCIsMTI1NDRdXVxuICAgIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBAX2ZlZWRfdGVzdF9kYXRhIGRiLCBwcm9iZXNfaWR4LCB3cml0ZV9zZXR0aW5ncywgcmVzdW1lXG4gICAgcHJlZml4ICAgICAgICA9IFsgJ3BvcycsICdndWlkZS91Y2hyL2hhcycsIF1cbiAgICBpbnB1dCAgICAgICAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIHByZWZpeFxuICAgIHJlYWRfc2V0dGluZ3MgPSB7IGluZGV4ZWQ6IG5vLCB9XG4gICAgaW5wdXRcbiAgICAgIC5waXBlIEhPTExFUklUSC5yZWFkX3N1YiBkYiwgcmVhZF9zZXR0aW5ncywgKCBwaHJhc2UgKSA9PlxuICAgICAgICBbIF8sIGdseXBoLCBwcmQsIGd1aWRlLCBdID0gcGhyYXNlXG4gICAgICAgIHByZWZpeCAgICAgICAgICAgICAgICAgICAgPSBbICdzcG8nLCBndWlkZSwgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCBdXG4gICAgICAgIHN1Yl9pbnB1dCAgICAgICAgICAgICAgICAgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgcHJlZml4XG4gICAgICAgIHJldHVybiBbIGdseXBoLCBzdWJfaW5wdXQsIF1cbiAgICAgIC5waXBlIEhPTExFUklUSC5yZWFkX3N1YiBkYiwgcmVhZF9zZXR0aW5ncywgKCB4cGhyYXNlICkgPT5cbiAgICAgICAgWyBnbHlwaCwgWyBfLCBndWlkZSwgcHJkLCBzaGFwZWNsYXNzLCBdIF0gPSB4cGhyYXNlXG4gICAgICAgIHByZWZpeCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gWyAnc3BvJywgZ3VpZGUsICdyYW5rL2NqdCcsIF1cbiAgICAgICAgc3ViX2lucHV0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgcHJlZml4XG4gICAgICAgIHJldHVybiBbIFsgZ2x5cGgsIGd1aWRlLCBzaGFwZWNsYXNzLCBdLCBzdWJfaW5wdXQsIF1cbiAgICAgIC5waXBlICQgKCB4cGhyYXNlLCBzZW5kICkgPT5cbiAgICAgICAgZGVidWcgJ8KpcXVQYmcnLCBKU09OLnN0cmluZ2lmeSB4cGhyYXNlXG4gICAgICAgIGNvdW50ICArPSArMVxuICAgICAgICBpZHggICAgKz0gKzFcbiAgICAgICAgVC5lcSB4cGhyYXNlLCBtYXRjaGVyc1sgaWR4IF1cbiAgICAgIC5waXBlIEQuJG9uX2VuZCAoIGVuZCApID0+XG4gICAgICAgIFQuZXEgY291bnQsIG1hdGNoZXJzLmxlbmd0aFxuICAgICAgICBlbmQoKVxuICAgICAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInNvcnRpbmcgKDEpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHNldHRpbmdzID1cbiAgICAgIGRiOiAgICAgICAgICAgbGV2ZWxkb3duXG4gICAgICBrZXlFbmNvZGluZzogICdiaW5hcnknXG4gICAgbGV2ZWxkYiA9IGxldmVsdXAgJy90bXAvaG9sbGVyaXRoMi10ZXN0Jywgc2V0dGluZ3NcbiAgICB5aWVsZCBjbGVhcl9sZXZlbGRiIGxldmVsZGIsIHJlc3VtZVxuICAgIHByb2JlcyA9IFtcbiAgICAgICdhJ1xuICAgICAgJ2FiJ1xuICAgICAgJ2FiYydcbiAgICAgICdhYmNcXHgwMCdcbiAgICAgICdhYmNcXHgwMGEnXG4gICAgICAnYWJjYSdcbiAgICAgICdhYmNiJ1xuICAgICAgJ2FiY2MnXG4gICAgICAnYWJjZCdcbiAgICAgICdhYmNkZSdcbiAgICAgICdhYmNkZWYnXG4gICAgICAnYWJjZGVmZycgXVxuICAgIG1hdGNoZXJzID0gW1xuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCAweDYyLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgMHg2MiwgMHg2MywgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIDB4NjIsIDB4NjMsIDB4MDAsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCAweDYyLCAweDYzLCAweDAwLCAweDYxLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgMHg2MiwgMHg2MywgMHg2MSwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIDB4NjIsIDB4NjMsIDB4NjIsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCAweDYyLCAweDYzLCAweDYzLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgMHg2MiwgMHg2MywgMHg2NCwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIDB4NjIsIDB4NjMsIDB4NjQsIDB4NjUsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCAweDYyLCAweDYzLCAweDY0LCAweDY1LCAweDY2LCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgMHg2MiwgMHg2MywgMHg2NCwgMHg2NSwgMHg2NiwgMHg2NywgXSBdXG4gICAgQ05ELnNodWZmbGUgcHJvYmVzXG4gICAgZm9yIHByb2JlIGluIHByb2Jlc1xuICAgICAgcHJvYmVfYmZyID0gbmV3IEJ1ZmZlciBwcm9iZSwgJ3V0Zi04J1xuICAgICAgeWllbGQgbGV2ZWxkYi5wdXQgcHJvYmVfYmZyLCAnMScsIHJlc3VtZVxuICAgICAgcHJvYmVfYmZycyA9IHlpZWxkIHJlYWRfYWxsX2tleXMgbGV2ZWxkYiwgcmVzdW1lXG4gICAgcHJvYmVfYmZycyA9IHlpZWxkIHJlYWRfYWxsX2tleXMgbGV2ZWxkYiwgcmVzdW1lXG4gICAgIyBkZWJ1ZyAnwqlSWFB2dicsICdcXG4nICsgcnByIHByb2JlX2JmcnNcbiAgICBmb3IgcHJvYmVfYmZyLCBwcm9iZV9pZHggaW4gcHJvYmVfYmZyc1xuICAgICAgbWF0Y2hlciA9IG1hdGNoZXJzWyBwcm9iZV9pZHggXVxuICAgICAgIyMjIFRBSU5UIGxvb2tzIGxpa2UgYFQuZXEgYnVmZmVyMSwgYnVmZmVyMmAgZG9lc24ndCB3b3JrLS0tc29tZXRpbWVzLi4uICMjI1xuICAgICAgIyBULmVxIHByb2JlX2JmciwgbWF0Y2hlclxuICAgICAgVC5vayBwcm9iZV9iZnIuZXF1YWxzIG1hdGNoZXJcbiAgICBsZXZlbGRiLmNsb3NlIC0+IGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwic29ydGluZyAoMilcIiBdID0gKCBULCBkb25lICkgLT5cbiAgIyMjIFRoaXMgdGVzdCBpcyBoZXJlIGJlY2F1c2UgdGhlcmUgc2VlbWVkIHRvIG9jY3VyIHNvbWUgc3RyYW5nZSBvcmRlcmluZyBpc3N1ZXMgd2hlblxuICB1c2luZyBtZW1kb3duIGluc3RlYWQgb2YgbGV2ZWxkb3duICMjI1xuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICBzZXR0aW5ncyA9XG4gICAgICBkYjogICAgICAgICAgIGxldmVsZG93blxuICAgICAga2V5RW5jb2Rpbmc6ICAnYmluYXJ5J1xuICAgIGxldmVsZGIgPSBsZXZlbHVwICcvdG1wL2hvbGxlcml0aDItdGVzdCcsIHNldHRpbmdzXG4gICAgeWllbGQgY2xlYXJfbGV2ZWxkYiBsZXZlbGRiLCByZXN1bWVcbiAgICBwcm9iZXMgPSBbXG4gICAgICBuZXcgQnVmZmVyIFsgMHgwMCwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4MDEsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDAyLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHgwMywgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4ZjksIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweGZhLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHhmYiwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4ZmMsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweGZkLCBdXG4gICAgICBdXG4gICAgbWF0Y2hlcnMgPSAoIHByb2JlIGZvciBwcm9iZSBpbiBwcm9iZXMgKVxuICAgIENORC5zaHVmZmxlIHByb2Jlc1xuICAgIGZvciBwcm9iZSBpbiBwcm9iZXNcbiAgICAgIHlpZWxkIGxldmVsZGIucHV0IHByb2JlLCAnMScsIHJlc3VtZVxuICAgIHByb2JlX2JmcnMgPSB5aWVsZCByZWFkX2FsbF9rZXlzIGxldmVsZGIsIHJlc3VtZVxuICAgIGZvciBwcm9iZV9iZnIsIHByb2JlX2lkeCBpbiBwcm9iZV9iZnJzXG4gICAgICBtYXRjaGVyID0gbWF0Y2hlcnNbIHByb2JlX2lkeCBdXG4gICAgICAjIGRlYnVnICfCqTE1MDYwJywgcHJvYmVfaWR4LCBwcm9iZV9iZnIsIG1hdGNoZXJcbiAgICAgICMjIyBUQUlOVCBsb29rcyBsaWtlIGBULmVxIGJ1ZmZlcjEsIGJ1ZmZlcjJgIGRvZXNuJ3Qgd29yay0tLXNvbWV0aW1lcy4uLiAjIyNcbiAgICAgIFQub2sgcHJvYmVfYmZyLmVxdWFscyBtYXRjaGVyXG4gICAgbGV2ZWxkYi5jbG9zZSAtPiBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcIkgyIGNvZGVjIGBlbmNvZGVgIHRocm93cyBvbiBhbnl0aGluZyBidXQgYSBsaXN0XCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIFQudGhyb3dzIFwiZXhwZWN0ZWQgYSBsaXN0LCBnb3QgYSB0ZXh0XCIsICAgICAgICAgKCAtPiBDT0RFQy5lbmNvZGUgJ3VuYWNjYXB0YWJsZScgKVxuICBULnRocm93cyBcImV4cGVjdGVkIGEgbGlzdCwgZ290IGEgbnVtYmVyXCIsICAgICAgICggLT4gQ09ERUMuZW5jb2RlIDQyIClcbiAgVC50aHJvd3MgXCJleHBlY3RlZCBhIGxpc3QsIGdvdCBhIGJvb2xlYW5cIiwgICAgICAoIC0+IENPREVDLmVuY29kZSB0cnVlIClcbiAgVC50aHJvd3MgXCJleHBlY3RlZCBhIGxpc3QsIGdvdCBhIGJvb2xlYW5cIiwgICAgICAoIC0+IENPREVDLmVuY29kZSBmYWxzZSApXG4gIFQudGhyb3dzIFwiZXhwZWN0ZWQgYSBsaXN0LCBnb3QgYSBqc3VuZGVmaW5lZFwiLCAgKCAtPiBDT0RFQy5lbmNvZGUoKSApXG4gIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwic29ydCB0ZXh0cyB3aXRoIEgyIGNvZGVjICgxKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICBzZXR0aW5ncyA9XG4gICAgICBkYjogICAgICAgICAgIGxldmVsZG93blxuICAgICAga2V5RW5jb2Rpbmc6ICAnYmluYXJ5J1xuICAgIGxldmVsZGIgPSBsZXZlbHVwICcvdG1wL2hvbGxlcml0aDItdGVzdCcsIHNldHRpbmdzXG4gICAgeWllbGQgY2xlYXJfbGV2ZWxkYiBsZXZlbGRiLCByZXN1bWVcbiAgICBwcm9iZXMgPSBbXG4gICAgICAnYSdcbiAgICAgICdhYidcbiAgICAgICdhYmMnXG4gICAgICAnYWJjXFx4MDAnXG4gICAgICAnYWJjXFx4MDBhJ1xuICAgICAgJ2FiY2EnXG4gICAgICAnYWJjYVxceDAwJ1xuICAgICAgJ2FiY2InXG4gICAgICAnYWJjYydcbiAgICAgICdhYmNkJ1xuICAgICAgJ2FiY2RlJ1xuICAgICAgJ2FiY2RlZidcbiAgICAgICdhYmNkZWZnJ1xuICAgICAgXVxuICAgIG1hdGNoZXJzID0gKCBbIHByb2JlLCBdIGZvciBwcm9iZSBpbiBwcm9iZXMgKVxuICAgIENORC5zaHVmZmxlIHByb2Jlc1xuICAgIGZvciBwcm9iZSBpbiBwcm9iZXNcbiAgICAgIHlpZWxkIGxldmVsZGIucHV0ICggQ09ERUMuZW5jb2RlIFsgcHJvYmUsIF0gKSwgJzEnLCByZXN1bWVcbiAgICBwcm9iZV9iZnJzICA9IHlpZWxkIHJlYWRfYWxsX2tleXMgbGV2ZWxkYiwgcmVzdW1lXG4gICAgcHJvYmVzICAgICAgPSAoIENPREVDLmRlY29kZSBwcm9iZV9iZnIgZm9yIHByb2JlX2JmciBpbiBwcm9iZV9iZnJzIClcbiAgICBzaG93X2tleXNfYW5kX2tleV9iZnJzIHByb2JlcywgcHJvYmVfYmZyc1xuICAgIGZvciBwcm9iZSwgcHJvYmVfaWR4IGluIHByb2Jlc1xuICAgICAgbWF0Y2hlciA9IG1hdGNoZXJzWyBwcm9iZV9pZHggXVxuICAgICAgVC5lcSBwcm9iZSwgbWF0Y2hlclxuICAgIGxldmVsZGIuY2xvc2UgLT4gZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJzb3J0IHRleHRzIHdpdGggSDIgY29kZWMgKDIpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHNldHRpbmdzID1cbiAgICAgIGRiOiAgICAgICAgICAgbGV2ZWxkb3duXG4gICAgICBrZXlFbmNvZGluZzogICdiaW5hcnknXG4gICAgbGV2ZWxkYiA9IGxldmVsdXAgJy90bXAvaG9sbGVyaXRoMi10ZXN0Jywgc2V0dGluZ3NcbiAgICB5aWVsZCBjbGVhcl9sZXZlbGRiIGxldmVsZGIsIHJlc3VtZVxuICAgIHByb2JlcyA9IFtcbiAgICAgICcnXG4gICAgICAnICdcbiAgICAgICdhJ1xuICAgICAgJ2FiYydcbiAgICAgICfkuIAnXG4gICAgICAn5LiA5LqMJ1xuICAgICAgJ+S4gOS6jOS4iSdcbiAgICAgICfkuIknXG4gICAgICAn5LqMJ1xuICAgICAgJ/CggIAnXG4gICAgICAn8KCAgFxceDAwJ1xuICAgICAgJ/CggIBhJ1xuICAgICAgJ/CqnIAnXG4gICAgICAn8KudgCdcbiAgICAgIFN0cmluZy5mcm9tQ29kZVBvaW50IDB4MTBmZmZmXG4gICAgICBdXG4gICAgbWF0Y2hlcnMgPSAoIFsgcHJvYmUsIF0gZm9yIHByb2JlIGluIHByb2JlcyApXG4gICAgQ05ELnNodWZmbGUgcHJvYmVzXG4gICAgZm9yIHByb2JlIGluIHByb2Jlc1xuICAgICAgcHJvYmVfYmZyID0gQ09ERUMuZW5jb2RlIFsgcHJvYmUsIF1cbiAgICAgIHlpZWxkIGxldmVsZGIucHV0IHByb2JlX2JmciwgJzEnLCByZXN1bWVcbiAgICBwcm9iZV9iZnJzICA9IHlpZWxkIHJlYWRfYWxsX2tleXMgbGV2ZWxkYiwgcmVzdW1lXG4gICAgIyBkZWJ1ZyAnwqlGZDVpdycsIHByb2JlX2JmcnNcbiAgICBwcm9iZXMgICAgICA9ICggQ09ERUMuZGVjb2RlIHByb2JlX2JmciBmb3IgcHJvYmVfYmZyIGluIHByb2JlX2JmcnMgKVxuICAgIHNob3dfa2V5c19hbmRfa2V5X2JmcnMgcHJvYmVzLCBwcm9iZV9iZnJzXG4gICAgZm9yIHByb2JlLCBwcm9iZV9pZHggaW4gcHJvYmVzXG4gICAgICBtYXRjaGVyID0gbWF0Y2hlcnNbIHByb2JlX2lkeCBdXG4gICAgICBULmVxIHByb2JlLCBtYXRjaGVyXG4gICAgbGV2ZWxkYi5jbG9zZSAtPiBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInNvcnQgbnVtYmVycyB3aXRoIEgyIGNvZGVjICgxKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICBzZXR0aW5ncyA9XG4gICAgICBkYjogICAgICAgICAgIGxldmVsZG93blxuICAgICAga2V5RW5jb2Rpbmc6ICAnYmluYXJ5J1xuICAgIGxldmVsZGIgPSBsZXZlbHVwICcvdG1wL2hvbGxlcml0aDItdGVzdCcsIHNldHRpbmdzXG4gICAgeWllbGQgY2xlYXJfbGV2ZWxkYiBsZXZlbGRiLCByZXN1bWVcbiAgICBwcm9iZXNfYW5kX2Rlc2NyaXB0aW9ucyA9IFtcbiAgICAgIFsgLUluZmluaXR5LCAgICAgICAgICAgICAgIFwiLUluZmluaXR5XCIgICAgICAgICAgICAgICBdXG4gICAgICBbIC1OdW1iZXIuTUFYX1ZBTFVFLCAgICAgICBcIi1OdW1iZXIuTUFYX1ZBTFVFXCIgICAgICAgXVxuICAgICAgWyBOdW1iZXIuTUlOX1NBRkVfSU5URUdFUiwgXCJOdW1iZXIuTUlOX1NBRkVfSU5URUdFUlwiIF1cbiAgICAgIFsgLTEyMzQ1Njc4OSwgICAgICAgICAgICAgIFwiLTEyMzQ1Njc4OVwiICAgICAgICAgICAgICBdXG4gICAgICBbIC0zLCAgICAgICAgICAgICAgICAgICAgICBcIi0zXCIgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgWyAtMiwgICAgICAgICAgICAgICAgICAgICAgXCItMlwiICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgIFsgLTEuNSwgICAgICAgICAgICAgICAgICAgIFwiLTEuNVwiICAgICAgICAgICAgICAgICAgICBdXG4gICAgICBbIC0xLCAgICAgICAgICAgICAgICAgICAgICBcIi0xXCIgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgWyAtTnVtYmVyLkVQU0lMT04sICAgICAgICAgXCItTnVtYmVyLkVQU0lMT05cIiAgICAgICAgIF1cbiAgICAgIFsgLU51bWJlci5NSU5fVkFMVUUsICAgICAgIFwiLU51bWJlci5NSU5fVkFMVUVcIiAgICAgICBdXG4gICAgICBbIDAsICAgICAgICAgICAgICAgICAgICAgICBcIjBcIiAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgWyArTnVtYmVyLk1JTl9WQUxVRSwgICAgICAgXCIrTnVtYmVyLk1JTl9WQUxVRVwiICAgICAgIF1cbiAgICAgIFsgK051bWJlci5FUFNJTE9OLCAgICAgICAgIFwiK051bWJlci5FUFNJTE9OXCIgICAgICAgICBdXG4gICAgICBbICsxLCAgICAgICAgICAgICAgICAgICAgICBcIisxXCIgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgWyArMS41LCAgICAgICAgICAgICAgICAgICAgXCIrMS41XCIgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgIFsgKzIsICAgICAgICAgICAgICAgICAgICAgIFwiKzJcIiAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICBbICszLCAgICAgICAgICAgICAgICAgICAgICBcIiszXCIgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgWyArMTIzNDU2Nzg5LCAgICAgICAgICAgICAgXCIrMTIzNDU2Nzg5XCIgICAgICAgICAgICAgIF1cbiAgICAgIFsgTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIsIFwiTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVJcIiBdXG4gICAgICBbIE51bWJlci5NQVhfVkFMVUUsICAgICAgICBcIk51bWJlci5NQVhfVkFMVUVcIiAgICAgICAgXVxuICAgICAgWyArSW5maW5pdHksICAgICAgICAgICAgICAgXCIrSW5maW5pdHlcIiAgICAgICAgICAgICAgIF1cbiAgICAgIF1cbiAgICAjIHByb2Jlc19hbmRfZGVzY3JpcHRpb25zLnNvcnQgKCBhLCBiICkgLT5cbiAgICAjICAgcmV0dXJuICsxIGlmIGFbIDAgXSA+IGJbIDAgXVxuICAgICMgICByZXR1cm4gLTEgaWYgYVsgMCBdIDwgYlsgMCBdXG4gICAgIyAgIHJldHVybiAgMFxuICAgIG1hdGNoZXJzICAgICAgPSAoIFsgcGFkWyAwIF0sIF0gZm9yIHBhZCBpbiBwcm9iZXNfYW5kX2Rlc2NyaXB0aW9ucyApXG4gICAgIyBkZXNjcmlwdGlvbnMgID0gKCBbIHBhZFsgMSBdLCBdIGZvciBwYWQgaW4gcHJvYmVzX2FuZF9kZXNjcmlwdGlvbnMgKVxuICAgIGZvciBwYWQgaW4gcHJvYmVzX2FuZF9kZXNjcmlwdGlvbnNcbiAgICAgIHVyZ2UgcGFkXG4gICAgQ05ELnNodWZmbGUgcHJvYmVzX2FuZF9kZXNjcmlwdGlvbnNcbiAgICBmb3IgWyBwcm9iZSwgXywgXSBpbiBwcm9iZXNfYW5kX2Rlc2NyaXB0aW9uc1xuICAgICAgcHJvYmVfYmZyID0gQ09ERUMuZW5jb2RlIFsgcHJvYmUsIF1cbiAgICAgIHlpZWxkIGxldmVsZGIucHV0IHByb2JlX2JmciwgJzEnLCByZXN1bWVcbiAgICBwcm9iZV9iZnJzICA9IHlpZWxkIHJlYWRfYWxsX2tleXMgbGV2ZWxkYiwgcmVzdW1lXG4gICAgcHJvYmVzICAgICAgPSAoIENPREVDLmRlY29kZSBwcm9iZV9iZnIgZm9yIHByb2JlX2JmciBpbiBwcm9iZV9iZnJzIClcbiAgICBzaG93X2tleXNfYW5kX2tleV9iZnJzIHByb2JlcywgcHJvYmVfYmZyc1xuICAgIGZvciBwcm9iZSwgcHJvYmVfaWR4IGluIHByb2Jlc1xuICAgICAgbWF0Y2hlciA9IG1hdGNoZXJzWyBwcm9iZV9pZHggXVxuICAgICAgVC5lcSBwcm9iZSwgbWF0Y2hlclxuICAgIGxldmVsZGIuY2xvc2UgLT4gZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJzb3J0IG1peGVkIHZhbHVlcyB3aXRoIEgyIGNvZGVjXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHNldHRpbmdzID1cbiAgICAgIGRiOiAgICAgICAgICAgbGV2ZWxkb3duXG4gICAgICBrZXlFbmNvZGluZzogICdiaW5hcnknXG4gICAgbGV2ZWxkYiA9IGxldmVsdXAgJy90bXAvaG9sbGVyaXRoMi10ZXN0Jywgc2V0dGluZ3NcbiAgICB5aWVsZCBjbGVhcl9sZXZlbGRiIGxldmVsZGIsIHJlc3VtZVxuICAgIHByb2JlcyA9IFtcbiAgICAgIG51bGxcbiAgICAgIGZhbHNlXG4gICAgICB0cnVlXG4gICAgICBDT0RFQ1sgJ3NlbnRpbmVscycgXVsgJ2ZpcnN0ZGF0ZScgXVxuICAgICAgbmV3IERhdGUgMFxuICAgICAgbmV3IERhdGUgOGUxMVxuICAgICAgbmV3IERhdGUoKVxuICAgICAgQ09ERUNbICdzZW50aW5lbHMnIF1bICdsYXN0ZGF0ZScgIF1cbiAgICAgIDEyMzRcbiAgICAgIEluZmluaXR5XG4gICAgICAnJ1xuICAgICAgJ+S4gCdcbiAgICAgICfkuIknXG4gICAgICAn5LqMJ1xuICAgICAgJ/CggIAnXG4gICAgICAn8KCAgFxceDAwJ1xuICAgICAgU3RyaW5nLmZyb21Db2RlUG9pbnQgMHgxMGZmZmZcbiAgICAgIF1cbiAgICBtYXRjaGVycyA9ICggWyBwcm9iZSwgXSBmb3IgcHJvYmUgaW4gcHJvYmVzIClcbiAgICBDTkQuc2h1ZmZsZSBwcm9iZXNcbiAgICBmb3IgcHJvYmUgaW4gcHJvYmVzXG4gICAgICBkZWJ1ZyAnwqlvTVhKWicsIHByb2JlXG4gICAgICBwcm9iZV9iZnIgPSBDT0RFQy5lbmNvZGUgWyBwcm9iZSwgXVxuICAgICAgeWllbGQgbGV2ZWxkYi5wdXQgcHJvYmVfYmZyLCAnMScsIHJlc3VtZVxuICAgIHByb2JlX2JmcnMgID0geWllbGQgcmVhZF9hbGxfa2V5cyBsZXZlbGRiLCByZXN1bWVcbiAgICAjIGRlYnVnICfCqUZkNWl3JywgcHJvYmVfYmZyc1xuICAgIHByb2JlcyAgICAgID0gKCBDT0RFQy5kZWNvZGUgcHJvYmVfYmZyIGZvciBwcm9iZV9iZnIgaW4gcHJvYmVfYmZycyApXG4gICAgc2hvd19rZXlzX2FuZF9rZXlfYmZycyBwcm9iZXMsIHByb2JlX2JmcnNcbiAgICBmb3IgcHJvYmUsIHByb2JlX2lkeCBpbiBwcm9iZXNcbiAgICAgIG1hdGNoZXIgPSBtYXRjaGVyc1sgcHJvYmVfaWR4IF1cbiAgICAgIFQuZXEgcHJvYmUsIG1hdGNoZXJcbiAgICBsZXZlbGRiLmNsb3NlIC0+IGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwic29ydCBsaXN0cyBvZiBtaXhlZCB2YWx1ZXMgd2l0aCBIMiBjb2RlY1wiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICBzZXR0aW5ncyA9XG4gICAgICBkYjogICAgICAgICAgIGxldmVsZG93blxuICAgICAga2V5RW5jb2Rpbmc6ICAnYmluYXJ5J1xuICAgIGxldmVsZGIgPSBsZXZlbHVwICcvdG1wL2hvbGxlcml0aDItdGVzdCcsIHNldHRpbmdzXG4gICAgeWllbGQgY2xlYXJfbGV2ZWxkYiBsZXZlbGRiLCByZXN1bWVcbiAgICBwcm9iZXMgPSBbXG4gICAgICBbIFwiXCIsICAgICAgICAgICAgICcnLCAgICAgICAgICAgICBdXG4gICAgICBbIFwiMTIzNFwiLCAgICAgICAgICAxMjM0LCAgICAgICAgICAgXVxuICAgICAgWyBcIkluZmluaXR5XCIsICAgICAgSW5maW5pdHksICAgICAgIF1cbiAgICAgIFsgXCJTdHJpbmcuZnJvbUNvZGVQb2ludCAweDEwZmZmZlwiLCBTdHJpbmcuZnJvbUNvZGVQb2ludCAweDEwZmZmZiBdXG4gICAgICBbIFwiZmFsc2VcIiwgICAgICAgICBmYWxzZSwgICAgICAgICAgXVxuICAgICAgWyBcIm5ldyBEYXRlIDBcIiwgICAgbmV3IERhdGUgMCwgICAgIF1cbiAgICAgIFsgXCJuZXcgRGF0ZSA4ZTExXCIsIG5ldyBEYXRlIDhlMTEsICBdXG4gICAgICBbIFwibmV3IERhdGUoKVwiLCAgICBuZXcgRGF0ZSgpLCAgICAgXVxuICAgICAgWyBcIm51bGxcIiwgICAgICAgICAgbnVsbCwgICAgICAgICAgIF1cbiAgICAgIFsgXCJ0cnVlXCIsICAgICAgICAgIHRydWUsICAgICAgICAgICBdXG4gICAgICBbIFwi5LiAXCIsICAgICAgICAgICAgJ+S4gCcsICAgICAgICAgICAgXVxuICAgICAgWyBcIuS4iVwiLCAgICAgICAgICAgICfkuIknLCAgICAgICAgICAgIF1cbiAgICAgIFsgXCLkuoxcIiwgICAgICAgICAgICAn5LqMJywgICAgICAgICAgICBdXG4gICAgICBbIFwi8KCAgFwiLCAgICAgICAgICAgICfwoICAJywgICAgICAgICAgICBdXG4gICAgICBbIFwi8KCAgFxceDAwXCIsICAgICAgICAn8KCAgFxceDAwJywgICAgICAgIF1cbiAgICAgIF1cbiAgICBtYXRjaGVycyA9ICggcHJvYmUgZm9yIHByb2JlIGluIHByb2JlcyApXG4gICAgQ05ELnNodWZmbGUgcHJvYmVzXG4gICAgZm9yIHByb2JlIGluIHByb2Jlc1xuICAgICAgZGVidWcgJ8Kpb01YSlonLCBwcm9iZVxuICAgICAgcHJvYmVfYmZyID0gQ09ERUMuZW5jb2RlIHByb2JlXG4gICAgICB5aWVsZCBsZXZlbGRiLnB1dCBwcm9iZV9iZnIsICcxJywgcmVzdW1lXG4gICAgcHJvYmVfYmZycyAgPSB5aWVsZCByZWFkX2FsbF9rZXlzIGxldmVsZGIsIHJlc3VtZVxuICAgICMgZGVidWcgJ8KpRmQ1aXcnLCBwcm9iZV9iZnJzXG4gICAgcHJvYmVzICAgICAgPSAoIENPREVDLmRlY29kZSBwcm9iZV9iZnIgZm9yIHByb2JlX2JmciBpbiBwcm9iZV9iZnJzIClcbiAgICBzaG93X2tleXNfYW5kX2tleV9iZnJzIHByb2JlcywgcHJvYmVfYmZyc1xuICAgIGZvciBwcm9iZSwgcHJvYmVfaWR4IGluIHByb2Jlc1xuICAgICAgbWF0Y2hlciA9IG1hdGNoZXJzWyBwcm9iZV9pZHggXVxuICAgICAgVC5lcSBwcm9iZSwgbWF0Y2hlclxuICAgIGxldmVsZGIuY2xvc2UgLT4gZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJzb3J0IHJvdXRlcyB3aXRoIHZhbHVlcyAoMSlcIiBdID0gKCBULCBkb25lICkgLT5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgc2V0dGluZ3MgPVxuICAgICAgZGI6ICAgICAgICAgICBsZXZlbGRvd25cbiAgICAgIGtleUVuY29kaW5nOiAgJ2JpbmFyeSdcbiAgICBsZXZlbGRiID0gbGV2ZWx1cCAnL3RtcC9ob2xsZXJpdGgyLXRlc3QnLCBzZXR0aW5nc1xuICAgIHlpZWxkIGNsZWFyX2xldmVsZGIgbGV2ZWxkYiwgcmVzdW1lXG4gICAgcHJvYmVzID0gW1xuICAgICAgWyAncG9zJywgJ3N0cm9rZW9yZGVyJywgJzM1MjUxMzU1MzI1NCcsICAgICAgICAgICfwpL+vJywgXVxuICAgICAgWyAncG9zJywgJ3N0cm9rZW9yZGVyJywgJzM1MjUxNDExMjEnLCAgICAgICAgICAgICfwoLSmJywgXVxuICAgICAgWyAncG9zJywgJ3N0cm9rZW9yZGVyJywgJzM1MjUxNDU0JywgICAgICAgICAgICAgICfwqJKhJywgXVxuICAgICAgWyAncG9zJywgJ3N0cm9rZW9yZGVyJywgJzM1MjUxNTInLCAgICAgICAgICAgICAgICfpgq0nLCBdXG4gICAgICBbICdwb3MnLCAnc3Ryb2tlb3JkZXInLCAnMzUyNTE1MjUxMTE1MTE1MTEzNTQxJywgJ/CqmqsnLCBdXG4gICAgICBbICdwb3MnLCAnc3Ryb2tlb3JkZXInLCAnMzUyNTE1MjUxMTI1MTE1MTEnLCAgICAgJ/CqmqcnLCBdXG4gICAgICBbICdwb3MnLCAnc3Ryb2tlb3JkZXInLCAnMzUyNTE1MjUxMjE0MjUxMjE0JywgICAgJ/CnkbQnLCBdXG4gICAgICBbICdwb3MnLCAnc3Ryb2tlb3JkZXInLCAnMzUyNTE1MycsICAgICAgICAgICAgICAgJ+WKrCcsIF1cbiAgICAgIFsgJ3BvcycsICdzdHJva2VvcmRlcicsICczNTI1MTUzXFx4MDAnLCAgICAgICAgICAgICAgICfliqwnLCBdXG4gICAgICBbICdwb3MnLCAnc3Ryb2tlb3JkZXJcXHgwMCcsICczNTI1MTM1NTMyNTQnLCAgICAgICAgICAn8KS/rycsIF1cbiAgICAgIF1cbiAgICBtYXRjaGVycyA9ICggcHJvYmUgZm9yIHByb2JlIGluIHByb2JlcyApXG4gICAgQ05ELnNodWZmbGUgcHJvYmVzXG4gICAgZm9yIHByb2JlIGluIHByb2Jlc1xuICAgICAgcHJvYmVfYmZyID0gQ09ERUMuZW5jb2RlIHByb2JlXG4gICAgICB5aWVsZCBsZXZlbGRiLnB1dCBwcm9iZV9iZnIsICcxJywgcmVzdW1lXG4gICAgcHJvYmVfYmZycyAgPSB5aWVsZCByZWFkX2FsbF9rZXlzIGxldmVsZGIsIHJlc3VtZVxuICAgICMgZGVidWcgJ8KpRmQ1aXcnLCBwcm9iZV9iZnJzXG4gICAgcHJvYmVzICAgICAgPSAoIENPREVDLmRlY29kZSBwcm9iZV9iZnIgZm9yIHByb2JlX2JmciBpbiBwcm9iZV9iZnJzIClcbiAgICBzaG93X2tleXNfYW5kX2tleV9iZnJzIHByb2JlcywgcHJvYmVfYmZyc1xuICAgIGZvciBwcm9iZSwgcHJvYmVfaWR4IGluIHByb2Jlc1xuICAgICAgbWF0Y2hlciA9IG1hdGNoZXJzWyBwcm9iZV9pZHggXVxuICAgICAgVC5lcSBwcm9iZSwgbWF0Y2hlclxuICAgIGxldmVsZGIuY2xvc2UgLT4gZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJzb3J0IHJvdXRlcyB3aXRoIHZhbHVlcyAoMilcIiBdID0gKCBULCBkb25lICkgLT5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgc2V0dGluZ3MgPVxuICAgICAgZGI6ICAgICAgICAgICBsZXZlbGRvd25cbiAgICAgIGtleUVuY29kaW5nOiAgJ2JpbmFyeSdcbiAgICBsZXZlbGRiID0gbGV2ZWx1cCAnL3RtcC9ob2xsZXJpdGgyLXRlc3QnLCBzZXR0aW5nc1xuICAgIHlpZWxkIGNsZWFyX2xldmVsZGIgbGV2ZWxkYiwgcmVzdW1lXG4gICAgcHJvYmVzID0gW1xuICAgICAgWyAnYScsICAgICAgbnVsbCwgXVxuICAgICAgWyAnYScsICAgICAgZmFsc2UsIF1cbiAgICAgIFsgJ2EnLCAgICAgIHRydWUsIF1cbiAgICAgIFsgJ2EnLCAgICAgIG5ldyBEYXRlKCksIF1cbiAgICAgIFsgJ2EnLCAgICAgIC1JbmZpbml0eSwgXVxuICAgICAgWyAnYScsICAgICAgKzEyMzQsIF1cbiAgICAgIFsgJ2EnLCAgICAgICtJbmZpbml0eSwgXVxuICAgICAgWyAnYScsICAgICAgJ2InLCBdXG4gICAgICBbICdhJywgICAgICAnYlxceDAwJywgXVxuICAgICAgWyAnYVxceDAwJywgICsxMjM0LCBdXG4gICAgICBbICdhXFx4MDAnLCAgJ2InLCBdXG4gICAgICBbICdhYScsICAgICArMTIzNCwgXVxuICAgICAgWyAnYWEnLCAgICAgJ2InLCBdXG4gICAgICBbICdhYScsICAgICAnYlxceDAwJywgXVxuICAgICAgXVxuICAgIG1hdGNoZXJzID0gKCBwcm9iZSBmb3IgcHJvYmUgaW4gcHJvYmVzIClcbiAgICBDTkQuc2h1ZmZsZSBwcm9iZXNcbiAgICBmb3IgcHJvYmUgaW4gcHJvYmVzXG4gICAgICBwcm9iZV9iZnIgPSBDT0RFQy5lbmNvZGUgcHJvYmVcbiAgICAgIHlpZWxkIGxldmVsZGIucHV0IHByb2JlX2JmciwgJzEnLCByZXN1bWVcbiAgICBwcm9iZV9iZnJzICA9IHlpZWxkIHJlYWRfYWxsX2tleXMgbGV2ZWxkYiwgcmVzdW1lXG4gICAgIyBkZWJ1ZyAnwqlGZDVpdycsIHByb2JlX2JmcnNcbiAgICBwcm9iZXMgICAgICA9ICggQ09ERUMuZGVjb2RlIHByb2JlX2JmciBmb3IgcHJvYmVfYmZyIGluIHByb2JlX2JmcnMgKVxuICAgIHNob3dfa2V5c19hbmRfa2V5X2JmcnMgcHJvYmVzLCBwcm9iZV9iZnJzXG4gICAgZm9yIHByb2JlLCBwcm9iZV9pZHggaW4gcHJvYmVzXG4gICAgICBtYXRjaGVyID0gbWF0Y2hlcnNbIHByb2JlX2lkeCBdXG4gICAgICBULmVxIHByb2JlLCBtYXRjaGVyXG4gICAgbGV2ZWxkYi5jbG9zZSAtPiBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgc2FtcGxlIGRhdGFcIiBdID0gKCBULCBkb25lICkgLT5cbiAgcHJvYmVzX2lkeCAgPSAyXG4gIGlkeCA9IC0xXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIGRlYnVnICfCqWJVSmhJJywgJ1hYJ1xuICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHJlc3VtZVxuICAgIGRlYnVnICfCqVBSekE1JywgJ1hYJ1xuICAgIGlucHV0ID0gZGJbICclc2VsZicgXS5jcmVhdGVSZWFkU3RyZWFtKClcbiAgICBpbnB1dFxuICAgICAgLnBpcGUgRC4kc2hvdygpXG4gICAgICAucGlwZSAkICggeyBrZXksIHZhbHVlLCB9LCBzZW5kICkgPT4gc2VuZCBbIGtleSwgdmFsdWUsIF1cbiAgICAgIC5waXBlICQgKCBbIGtleSwgdmFsdWUsIF0sIHNlbmQgKSA9PiBzZW5kIFsga2V5LCB2YWx1ZSwgXSB1bmxlc3MgSE9MTEVSSVRILl9pc19tZXRhIGRiLCBrZXlcbiAgICAgIC5waXBlICQgKCBbIGtleSwgdmFsdWUsIF0sIHNlbmQgKSA9PlxuICAgICAgICAjIGRlYnVnICfCqVJsdWhGJywgKCBIT0xMRVJJVEguQ09ERUMuZGVjb2RlIGtleSApLCAoIEpTT04ucGFyc2UgdmFsdWUgKVxuICAgICAgICBzZW5kIFsga2V5LCB2YWx1ZSwgXVxuICAgICAgLnBpcGUgRC4kY29sbGVjdCgpXG4gICAgICAucGlwZSAkICggZmFjZXRzLCBzZW5kICkgPT5cbiAgICAgICAgaGVscCAnXFxuJyArIEhPTExFUklUSC5EVU1QLnJwcl9vZl9mYWNldHMgZGIsIGZhY2V0c1xuICAgICAgICBidWZmZXIgPSBuZXcgQnVmZmVyIEpTT04uc3RyaW5naWZ5IFsgJ+W8gCcsICflvaEnIF1cbiAgICAgICAgZGVidWcgJ8KpR0pmTDYnLCBIT0xMRVJJVEguRFVNUC5ycHJfb2ZfYnVmZmVyIG51bGwsIGJ1ZmZlclxuICAgICAgLnBpcGUgRC4kb25fZW5kID0+IGRvbmUoKVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHJldHVybiBudWxsXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZWFkIGFuZCB3cml0ZSBrZXlzIHdpdGggbGlzdHNcIiBdID0gKCBULCBkb25lICkgLT5cbiAgcHJvYmVzX2lkeCAgPSAwXG4gIGlkeCAgICAgICAgID0gLTFcbiAgY291bnQgICAgICAgPSAwXG4gIHByb2JlcyAgICAgID0gW1xuICAgIFsgJ2EnLCAxLCBdXG4gICAgWyAnYScsIFtdLCBdXG4gICAgWyAnYScsIFsgMSwgXSwgXVxuICAgIFsgJ2EnLCBbIHRydWUsIF0sIF1cbiAgICBbICdhJywgWyAneCcsICd5JywgJ2InLCBdLCBdXG4gICAgWyAnYScsIFsgMTIwLCAxIC8gMywgXSwgXVxuICAgIFsgJ2EnLCBbICd4JywgXSwgXVxuICAgIF1cbiAgbWF0Y2hlcnMgICAgPSAoIHByb2JlIGZvciBwcm9iZSBpbiBwcm9iZXMgKVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGZvciBwcm9iZSwgcHJvYmVfaWR4IGluIHByb2Jlc1xuICAgIGJ1ZmZlciA9IEhPTExFUklUSC5DT0RFQy5lbmNvZGUgcHJvYmVcbiAgICByZXN1bHQgPSBIT0xMRVJJVEguQ09ERUMuZGVjb2RlIGJ1ZmZlclxuICAgIFQuZXEgcmVzdWx0LCBtYXRjaGVyc1sgcHJvYmVfaWR4IF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgcGFydGlhbCBQT1MgcGhyYXNlc1wiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ICAgICAgICAgPSAtMVxuICBjb3VudCAgICAgICA9IDBcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBtYXRjaGVycyA9IFtcbiAgICBbICfwp7efMScsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgMSBdXG4gICAgWyAn8Ke3nzInLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDIgXVxuICAgIFsgJ/Cnt58zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAzIF1cbiAgICBbICfwp7efNCcsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgNCBdXG4gICAgWyAn8Ke3nycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgNSBdXG4gICAgWyAn8Ke3nzYnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDYgXVxuICAgIFsgJ/Cnt58nLCAnZ3VpZGUvdWNoci9oYXMnLCAn5YWrJywgMCBdXG4gICAgWyAn8Ke3nycsICdndWlkZS91Y2hyL2hhcycsICfliIAnLCAxIF1cbiAgICBbICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgJ+WugCcsIDIgXVxuICAgIFsgJ/Cnt58nLCAnZ3VpZGUvdWNoci9oYXMnLCAn6LKdJywgNCBdXG4gICAgWyAn8Ke3nycsICdndWlkZS91Y2hyL2hhcycsICfuh7onLCAzIF1cbiAgICBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgQF9mZWVkX3Rlc3RfZGF0YSBkYiwgcHJvYmVzX2lkeCwgcmVzdW1lXG4gICAgcHJlZml4ICAgID0gWyAncG9zJywgJ2d1aWRlJywgXVxuICAgIGlucHV0ICAgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBwcmVmaXgsICcqJ1xuICAgIGRlYnVnICfCqUZwaEpLJywgaW5wdXRbICclbWV0YScgXVxuICAgIHNldHRpbmdzICA9IHsgaW5kZXhlZDogbm8sIH1cbiAgICBpbnB1dFxuICAgICAgLnBpcGUgJCAoIHBocmFzZSwgc2VuZCApID0+XG4gICAgICAgIGNvdW50ICArPSArMVxuICAgICAgICBpZHggICAgKz0gKzFcbiAgICAgICAgZGVidWcgJ8KpU2M1RkcnLCBwaHJhc2VcbiAgICAgICAgIyBULmVxIHBocmFzZSwgbWF0Y2hlcnNbIGlkeCBdXG4gICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgVC5lcSBjb3VudCwgbWF0Y2hlcnMubGVuZ3RoXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwiZW5jb2RlIGtleXMgd2l0aCBsaXN0IGVsZW1lbnRzXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHByb2JlcyA9IFtcbiAgICBbICdmb28nLCAnYmFyJywgXVxuICAgIFsgJ2ZvbycsIFsgJ2JhcicsIF0sIF1cbiAgICBbIFtdLCAnYmFyJywgXVxuICAgIFsgJ2ZvbycsIFtdLCBdXG4gICAgWyBbICdmb28nLCBdLCAnYmFyJywgXVxuICAgIFsgWyA0MiwgXSwgJ2JhcicsIF1cbiAgICBbICdmb28nLCBbIDQyLCBdIF1cbiAgICBdXG4gIGZvciBwcm9iZSBpbiBwcm9iZXNcbiAgICBULmVxIHByb2JlLCBIT0xMRVJJVEguQ09ERUMuZGVjb2RlIEhPTExFUklUSC5DT0RFQy5lbmNvZGUgcHJvYmVcbiAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZWFkIGFuZCB3cml0ZSBwaHJhc2VzIHdpdGggdW5hbmFseXplZCBsaXN0c1wiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBpZHggICAgICAgICA9IC0xXG4gIGNvdW50ICAgICAgID0gMFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHByb2JlcyA9IFtcbiAgICBbICdwcm9iZSMwMCcsICdzb21lLXByZWRpY2F0ZScsIFtdLCBdXG4gICAgWyAncHJvYmUjMDEnLCAnc29tZS1wcmVkaWNhdGUnLCBbIC0xIF0sIF1cbiAgICBbICdwcm9iZSMwMicsICdzb21lLXByZWRpY2F0ZScsIFsgIDAgXSwgXVxuICAgIFsgJ3Byb2JlIzAzJywgJ3NvbWUtcHJlZGljYXRlJywgWyAgMSBdLCBdXG4gICAgWyAncHJvYmUjMDQnLCAnc29tZS1wcmVkaWNhdGUnLCBbICAyIF0sIF1cbiAgICBbICdwcm9iZSMwNScsICdzb21lLXByZWRpY2F0ZScsIFsgIDIsIC0xLCBdLCBdXG4gICAgWyAncHJvYmUjMDYnLCAnc29tZS1wcmVkaWNhdGUnLCBbICAyLCAwLCBdLCBdXG4gICAgWyAncHJvYmUjMDcnLCAnc29tZS1wcmVkaWNhdGUnLCBbICAyLCAxLCBdLCBdXG4gICAgWyAncHJvYmUjMDgnLCAnc29tZS1wcmVkaWNhdGUnLCBbICAyLCAxLCAwIF0sIF1cbiAgICBbICdwcm9iZSMwOScsICdzb21lLXByZWRpY2F0ZScsIFsgIDIsIDIsIF0sIF1cbiAgICBbICdwcm9iZSMxMCcsICdzb21lLXByZWRpY2F0ZScsIFsgIDIsIFsgMiwgXSwgXSwgXVxuICAgIFsgJ3Byb2JlIzExJywgJ3NvbWUtcHJlZGljYXRlJywgWyAgMyBdLCBdXG4gICAgXVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHdyaXRlX3Byb2JlcyA9ICggaGFuZGxlciApID0+XG4gICAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgICB5aWVsZCBIT0xMRVJJVEguY2xlYXIgZGIsIHJlc3VtZVxuICAgICAgaW5wdXQgPSBELmNyZWF0ZV90aHJvdWdoc3RyZWFtKClcbiAgICAgIGlucHV0XG4gICAgICAgICMgLnBpcGUgKCBbIHNiaiwgcHJkLCBvYmosIF0sIHNlbmQgKSA9PlxuICAgICAgICAjICAgaWYgcHJkIGlzICdzb21lLXByZWRpY2F0ZScgIyBhbHdheXMgdGhlIGNhc2UgaW4gdGhpcyBleGFtcGxlXG4gICAgICAgICMgICAgIG9ialxuICAgICAgICAucGlwZSBIT0xMRVJJVEguJHdyaXRlIGRiLCBzb2xpZHM6IFsgJ3NvbWUtcHJlZGljYXRlJywgXVxuICAgICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgICB1cmdlIFwidGVzdCBkYXRhIHdyaXR0ZW5cIlxuICAgICAgICAgIGhhbmRsZXIoKVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIGlucHV0LndyaXRlIHByb2JlIGZvciBwcm9iZSBpbiBwcm9iZXNcbiAgICAgIGlucHV0LmVuZCgpXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICB5aWVsZCB3cml0ZV9wcm9iZXMgcmVzdW1lXG4gICAgaW5wdXQgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYlxuICAgIGRlYnVnICfCqUZwaEpLJywgaW5wdXRbICclbWV0YScgXVxuICAgIGlucHV0XG4gICAgICAucGlwZSAkICggcGhyYXNlLCBzZW5kICkgPT5cbiAgICAgICAgY291bnQgICs9ICsxXG4gICAgICAgIGlkeCAgICArPSArMVxuICAgICAgICAjIGRlYnVnICfCqVNjNUZHJywgcGhyYXNlXG4gICAgICAgICMgVC5lcSBwaHJhc2UsIG1hdGNoZXJzWyBpZHggXVxuICAgICAgLnBpcGUgRC4kb25fZW5kID0+XG4gICAgICAgICMgVC5lcSBjb3VudCwgbWF0Y2hlcnMubGVuZ3RoXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwid3JpdGluZyBwaHJhc2VzIHdpdGggbm9uLXVuaXF1ZSBrZXlzIGZhaWxzXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIGFsZXJ0IFwiXCJcInRlc3QgY2FzZSBcIndyaXRpbmcgcGhyYXNlcyB3aXRoIG5vbi11bmlxdWUga2V5cyBmYWlsc1wiIHRvIGJlIHdyaXR0ZW5cIlwiXCJcbiAgZG9uZSgpXG4gICMgaWR4ICAgICAgICAgPSAtMVxuICAjIGNvdW50ICAgICAgID0gMFxuICAjIGRlbGF5ID0gKCBoYW5kbGVyICkgLT5cbiAgIyAgIHNldEltbWVkaWF0ZSBoYW5kbGVyXG4gICMgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAjIHdyaXRlX3Byb2JlcyA9ICggaGFuZGxlciApID0+XG4gICMgICBzdGVwICggcmVzdW1lICkgPT5cbiAgIyAgICAgeWllbGQgSE9MTEVSSVRILmNsZWFyIGRiLCByZXN1bWVcbiAgIyAgICAgaW5wdXQgPSBELmNyZWF0ZV90aHJvdWdoc3RyZWFtKClcbiAgIyAgICAgaW5wdXRcbiAgIyAgICAgICAucGlwZSBIT0xMRVJJVEguJHdyaXRlIGRiLCBzb2xpZHM6IFsgJ3NvbWUtcHJlZGljYXRlJywgXVxuICAjICAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAjICAgICAgICAgdXJnZSBcInRlc3QgZGF0YSB3cml0dGVuXCJcbiAgIyAgICAgICAgIGhhbmRsZXIoKVxuICAjICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAjICAgICBmb3IgaWR4IGluIFsgMCAuLiAxMDAgXVxuICAjICAgICAgIHByb2JlID0gWyAnZW50cnknLCBcImZvby0je2lkeH1cIiwgaWR4LCBdXG4gICMgICAgICAgeWllbGQgaW5wdXQud3JpdGUgcHJvYmUsIHJlc3VtZVxuICAjICAgICAgICMgeWllbGQgZGVsYXkgcmVzdW1lXG4gICMgICAgIGlucHV0LmVuZCgpXG4gICMgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAjIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAjICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgIyAgIHlpZWxkIHdyaXRlX3Byb2JlcyByZXN1bWVcbiAgIyAgIGlucHV0ID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGJcbiAgIyAgIGRlYnVnICfCqXFDYnU2JywgaW5wdXRbICclbWV0YScgXVxuICAjICAgaW5wdXRcbiAgIyAgICAgLnBpcGUgJCAoIHBocmFzZSwgc2VuZCApID0+XG4gICMgICAgICAgY291bnQgICs9ICsxXG4gICMgICAgICAgaWR4ICAgICs9ICsxXG4gICMgICAgICAgZGVidWcgJ8KpU2M1RkcnLCBwaHJhc2VcbiAgIyAgICAgICAjIFQuZXEgcGhyYXNlLCBtYXRjaGVyc1sgaWR4IF1cbiAgIyAgICAgLnBpcGUgRC4kb25fZW5kID0+XG4gICMgICAgICAgIyBULmVxIGNvdW50LCBtYXRjaGVycy5sZW5ndGhcbiAgIyAgICAgICBkb25lKClcblxuIyAjICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyAjIEBbIFwiX3RyYW5zYWN0aW9uc1wiIF0gPSAoIFQsIGRvbmUgKSAtPlxuIyAjICAgbGV2ZWx1cCA9IHJlcXVpcmUoJ2xldmVsdXAnKVxuIyAjICAgZGIgPSBsZXZlbHVwKCcuL2RiJywgdmFsdWVFbmNvZGluZzogJ2pzb24nKVxuIyAjICAgcmVxdWlyZSgnbGV2ZWwtYXN5bmMtdHJhbnNhY3Rpb24nKSBkYlxuIyAjICAgdHggPSBkYi50cmFuc2FjdGlvbigpXG4jICMgICB0eDIgPSBkYi50cmFuc2FjdGlvbigpXG4jICMgICB0eC5wdXQgJ2snLCAxNjdcbiMgIyAgIHR4LmNvbW1pdCAtPlxuIyAjICAgICB0eDIuZ2V0ICdrJywgKGVycm9yLCB2YWx1ZSkgLT5cbiMgIyAgICAgICAjdHgyIGluY3JlbWVudHMgdmFsdWVcbiMgIyAgICAgICB0eDIucHV0ICdrJywgdmFsdWUgKyAxXG4jICMgICAgICAgcmV0dXJuXG4jICMgICAgIGRiLmdldCAnaycsIChlcnJvciwgZGF0YSkgLT5cbiMgIyAgICAgICAjdHggY29tbWl0OiBkYXRhIGVxdWFscyB0byAxNjdcbiMgIyAgICAgICB0eDIuY29tbWl0IC0+XG4jICMgICAgICAgICBkYi5nZXQgJ2snLCAoZXJyb3IsIGRhdGEpIC0+XG4jICMgICAgICAgICAgICN0eDIgY29tbWl0OiBkYXRhIGVxdWFscyB0byAxNjhcbiMgIyAgICAgICAgICAgcmV0dXJuXG4jICMgICAgICAgICByZXR1cm5cbiMgIyAgICAgICByZXR1cm5cbiMgIyAgICAgcmV0dXJuXG5cblxuXG4jICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBAWyBcIlpaWlwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuIyAgIGxvZ190aWNrc19pZCA9IG51bGxcbiMgICBsb2dfdGlja3MgPSAtPlxuIyAgICAgZGVidWcgXCItLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gdGlja1wiXG4jICAgICBsb2dfdGlja3NfaWQgPSBpbW1lZGlhdGVseSBsb2dfdGlja3NcbiMgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jICAgcm91dGUgICAgICAgICAgICAgPSAnL3RtcC9YLXRlc3QtZGInXG4jICAgZGIgICAgICAgICAgICAgICAgPSBIT0xMRVJJVEgubmV3X2RiIHJvdXRlXG4jICAgaW5wdXRfQSAgICAgICAgICAgPSBELmNyZWF0ZV90aHJvdWdoc3RyZWFtKClcbiMgICBuICAgICAgICAgICAgICAgICA9IDFlNlxuIyAgIG4gICAgICAgICAgICAgICAgID0gMTBcbiMgICBuICAgICAgICAgICAgICAgICA9IDFlNFxuIyAgIGJsb29tX2Vycm9yX3JhdGUgID0gMC4xXG4jICAgZW50cnlfY291bnQgICAgICAgPSAwXG4jICAgZGJfcmVxdWVzdF9jb3VudCAgPSAwXG4jICAgdDAgICAgICAgICAgICAgICAgPSBudWxsXG4jICAgdDEgICAgICAgICAgICAgICAgPSBudWxsXG4jICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgIEJTT04gPSAoIHJlcXVpcmUgJ2Jzb24nICkuQlNPTlB1cmUuQlNPTlxuIyAgIG5qc19mcyA9IHJlcXVpcmUgJ2ZzJ1xuIyAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICBCTE9FTSAgICAgICAgICAgICA9IHJlcXVpcmUgJ2Jsb2VtJ1xuIyAgIGJsb2VtX3NldHRpbmdzICAgID1cbiMgICAgIGluaXRpYWxfY2FwYWNpdHk6ICAgbiAjLyAxMFxuIyAgICAgc2NhbGluZzogICAgICAgICAgICAyXG4jICAgICByYXRpbzogICAgICAgICAgICAgIDAuMVxuIyAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgICBzaG93X2Jsb29tX2luZm8gPSAoIGRiICkgPT5cbiMgICAgIGJsb29tICAgICAgID0gZGJbICclYmxvb20nIF1cbiMgICAgIGZpbHRlcnMgICAgID0gYmxvb21bICdmaWx0ZXJzJyBdXG4jICAgICBmaWx0ZXJfc2l6ZSA9IDBcbiMgICAgIGZvciBmaWx0ZXIgaW4gZmlsdGVyc1xuIyAgICAgICBmaWx0ZXJfc2l6ZSArPSBmaWx0ZXJbICdmaWx0ZXInIF1bICdiaXRmaWVsZCcgXVsgJ2J1ZmZlcicgXS5sZW5ndGhcbiMgICAgIHdoaXNwZXIgXCJzY2FsYWJsZSBibG9vbTogZmlsdGVyIGNvdW50OiAje2ZpbHRlcnMubGVuZ3RofSwgZmlsdGVyIHNpemU6ICN7xpIgZmlsdGVyX3NpemV9IGJ5dGVzXCJcbiMgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jICAgJGVuc3VyZV91bmlxdWUgPSAoIGRiICkgPT5cbiMgICAgIHJldHVybiBELiRtYXAgKCBwaHJhc2UsIGhhbmRsZXIgKSA9PlxuIyAgICAgICBibG9vbSAgICAgICAgICAgICAgID0gZGJbICclYmxvb20nIF1cbiMgICAgICAgIyMjID4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+ICMjI1xuIyAgICAgICBbIHNiaiwgcHJkLCBvYmosIF0gID0gcGhyYXNlXG4jICAgICAgIGtleSAgICAgICAgICAgICAgICAgPSBbICdzcG8nLCBzYmosIHByZCwgXVxuIyAgICAgICBrZXlfYmZyICAgICAgICAgICAgID0ga2V5LmpvaW4gJ3wnXG4jICAgICAgICMjIyA+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+PiAjIyNcbiMgICAgICAgYmxvb21faGFzX2tleSAgICAgICA9IGJsb29tLmhhcyBrZXlfYmZyXG4jICAgICAgIGJsb29tLmFkZCBrZXlfYmZyXG4jICAgICAgIHJldHVybiBoYW5kbGVyIG51bGwsIHBocmFzZSB1bmxlc3MgYmxvb21faGFzX2tleVxuIyAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICAgICAgSE9MTEVSSVRILmhhcyBkYiwga2V5LCAoIGVycm9yLCBkYl9oYXNfa2V5ICkgPT5cbiMgICAgICAgICByZXR1cm4gaGFuZGxlciBlcnJvciBpZiBlcnJvcj9cbiMgICAgICAgICBkYl9yZXF1ZXN0X2NvdW50ICs9ICsxXG4jICAgICAgICAgcmV0dXJuIGhhbmRsZXIgbmV3IEVycm9yIFwicGhyYXNlIGFscmVhZHkgaW4gREI6ICN7cnByIHBocmFzZX1cIiBpZiBkYl9oYXNfa2V5XG4jICAgICAgICAgaGFuZGxlciBudWxsLCBwaHJhc2VcbiMgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jICAgJGxvYWRfYmxvb20gPSAoIGRiICkgPT5cbiMgICAgIGlzX2ZpcnN0ID0geWVzXG4jICAgICByZXR1cm4gRC4kbWFwICggZGF0YSwgaGFuZGxlciApID0+XG4jICAgICAgIHVubGVzcyBpc19maXJzdFxuIyAgICAgICAgIHJldHVybiBpZiBkYXRhPyB0aGVuIGhhbmRsZXIgbnVsbCwgZGF0YSBlbHNlIGhhbmRsZXIoKVxuIyAgICAgICBpc19maXJzdCA9IG5vXG4jICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgICAgICBIT0xMRVJJVEguX2dldF9tZXRhIGRiLCAnYmxvb20nLCBudWxsLCAoIGVycm9yLCBibG9vbV9iZnIgKSA9PlxuIyAgICAgICAgIHJldHVybiBzZW5kLmVycm9yIGVycm9yIGlmIGVycm9yP1xuIyAgICAgICAgIGlmIGJsb29tX2JmciBpcyBudWxsXG4jICAgICAgICAgICB3YXJuICdubyBibG9vbSBmaWx0ZXIgZm91bmQnXG4jICAgICAgICAgICBibG9vbSA9IG5ldyBCTE9FTS5TY2FsaW5nQmxvZW0gYmxvb21fZXJyb3JfcmF0ZSwgYmxvZW1fc2V0dGluZ3NcbiMgICAgICAgICBlbHNlXG4jICAgICAgICAgICBibG9vbV9kYXRhID0gQlNPTi5kZXNlcmlhbGl6ZSBibG9vbV9iZnJcbiMgICAgICAgICAgICMjIyBUQUlOVCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3dpZWRpL25vZGUtYmxvZW0vaXNzdWVzLzUgIyMjXG4jICAgICAgICAgICBmb3IgZmlsdGVyIGluIGJsb29tX2RhdGFbICdmaWx0ZXJzJyBdXG4jICAgICAgICAgICAgIGJpdGZpZWxkICAgICAgICAgICAgICA9IGZpbHRlclsgJ2ZpbHRlcicgXVsgJ2JpdGZpZWxkJyBdXG4jICAgICAgICAgICAgIGJpdGZpZWxkWyAnYnVmZmVyJyBdICA9IGJpdGZpZWxkWyAnYnVmZmVyJyBdWyAnYnVmZmVyJyBdXG4jICAgICAgICAgICBibG9vbSA9IEJMT0VNLlNjYWxpbmdCbG9lbS5kZXN0cmluZ2lmeSBibG9vbV9kYXRhXG4jICAgICAgICAgZGJbICclYmxvb20nIF0gPSBibG9vbVxuIyAgICAgICAgIHJldHVybiBpZiBkYXRhPyB0aGVuIGhhbmRsZXIgbnVsbCwgZGF0YSBlbHNlIGhhbmRsZXIoKVxuIyAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgICAkc2F2ZV9ibG9vbSA9ICggZGIgKSA9PlxuIyAgICAgcmV0dXJuIEQuJG9uX2VuZCAoIHNlbmQsIGVuZCApID0+XG4jICAgICAgIGJsb29tICAgICA9IGRiWyAnJWJsb29tJyBdXG4jICAgICAgIGJsb29tX2JmciA9IEJTT04uc2VyaWFsaXplIGJsb29tXG4jICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgICAgICBIT0xMRVJJVEguX3B1dF9tZXRhIGRiLCAnYmxvb20nLCBibG9vbV9iZnIsICggZXJyb3IgKSA9PlxuIyAgICAgICAgIHJldHVybiBzZW5kLmVycm9yIGVycm9yIGlmIGVycm9yP1xuIyAgICAgICAgIGVuZCgpXG4jICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyAgIGlucHV0X0IgPSBpbnB1dF9BXG4jICAgICAucGlwZSAkbG9hZF9ibG9vbSAgICAgZGJcbiMgICAgIC5waXBlICRlbnN1cmVfdW5pcXVlICBkYlxuIyAgICAgLnBpcGUgJHNhdmVfYmxvb20gICAgIGRiXG4jICAgICAucGlwZSAkICggZGF0YSwgc2VuZCApID0+XG4jICAgICAgIGVudHJ5X2NvdW50ICs9ICsxXG4jICAgICAgIHdoaXNwZXIgZW50cnlfY291bnQgaWYgZW50cnlfY291bnQgJSAxMDAwMDAgaXMgMFxuIyAgICAgICBzZW5kIGRhdGFcbiMgICAgIC5waXBlIEhPTExFUklUSC4kd3JpdGUgZGIsIGJhdGNoOiAxMDAwXG4jICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgICBpbnB1dF9CLm9uICdlbmQnLCA9PlxuIyAgICAgdDEgPSArbmV3IERhdGUoKVxuIyAgICAgaGVscCBcImlucHV0X0IvZW5kXCJcbiMgICAgIGhlbHAgXCJuOiAgICAgICAgICAgICAgICAgICN7xpIgbn1cIlxuIyAgICAgaGVscCBcIkRCIHJlcXVlc3QgY291bnQ6ICAgI3vGkiBkYl9yZXF1ZXN0X2NvdW50fVwiXG4jICAgICBoZWxwIFwicmVxdWVzdCByYXRlOiAgICAgICAjeyggZGJfcmVxdWVzdF9jb3VudCAvIG4gKS50b0ZpeGVkIDR9XCJcbiMgICAgIGhlbHAgXCJkdDogICAgICAgICAgICAgICAgICN7xpIgKCB0MSAtIHQwICkgLyAxMDAwfXNcIlxuIyAgICAgY2xlYXJJbW1lZGlhdGUgbG9nX3RpY2tzX2lkXG4jICAgICBkb25lKClcbiMgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyAgIHN0ZXAgKCByZXN1bWUgKSA9PlxuIyAgICAgeWllbGQgSE9MTEVSSVRILmNsZWFyIGRiLCByZXN1bWVcbiMgICAgICMgbG9nX3RpY2tzKClcbiMgICAgIHQwID0gK25ldyBEYXRlKClcbiMgICAgIGZvciByZWNvcmRfaWR4IGluIFsgMCAuLi4gbiBdXG4jICAgICAgIHNiaiAgICAgPSBcInJlY29yZFwiXG4jICAgICAgIHByZCAgICAgPSBcIm5yLSN7cmVjb3JkX2lkeH1cIlxuIyAgICAgICBvYmogICAgID0gcmVjb3JkX2lkeFxuIyAgICAgICBwaHJhc2UgID0gWyBzYmosIHByZCwgb2JqLCBdXG4jICAgICAgICMgd2hpc3BlciBcImlucHV0X0Eud3JpdGUgI3tycHIgcGhyYXNlfVwiXG4jICAgICAgIHlpZWxkIGlucHV0X0Eud3JpdGUgcGhyYXNlLCByZXN1bWVcbiMgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgICB3aGlzcGVyIFwiY2FsbGluZyBpbnB1dF9BLmVuZCgpXCJcbiMgICAgIHlpZWxkIGlucHV0X0EuZW5kIHJlc3VtZVxuXG5cbiMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEBbIFwicmVtaW5kZXJzXCIgXSA9ICggVCwgZG9uZSApIC0+XG4jICAgYWxlcnQgXCJILiR3cml0ZSgpIG11c3QgdGVzdCBmb3IgcmVwZWF0ZWQga2V5cyBvciBpbXBsZW1lbnQgcmV3cml0aW5nIG9mIFBPUyBlbnRyaWVzXCJcbiMgICBkb25lKClcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIEhFTFBFUlNcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuc2hvd19rZXlzX2FuZF9rZXlfYmZycyA9ICgga2V5cywga2V5X2JmcnMgKSAtPlxuICBmID0gKCBwICkgLT4gKCB0IGZvciB0IGluICggcC50b1N0cmluZyAnaGV4JyApLnNwbGl0IC8oLi4pLyB3aGVuIHQgaXNudCAnJyApLmpvaW4gJyAnXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgY29sdW1uaWZ5X3NldHRpbmdzID1cbiAgICBwYWRkaW5nQ2hyOiAnICdcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBkYXRhICAgICAgPSBbXVxuICBrZXlfYmZycyAgPSAoIGYgcCBmb3IgcCBpbiBrZXlfYmZycyApXG4gIGZvciBrZXksIGlkeCBpbiBrZXlzXG4gICAga2V5X3R4dCA9ICggcnByIGtleSApLnJlcGxhY2UgL1xcXFx1MDAwMC9nLCAn4oiHJ1xuICAgIGRhdGEucHVzaCB7ICdzdHInOiBrZXlfdHh0LCAnYmZyJzoga2V5X2JmcnNbIGlkeCBdfVxuICBoZWxwICdcXG4nICsgQ05ELmNvbHVtbmlmeSBkYXRhLCBjb2x1bW5pZnlfc2V0dGluZ3NcbiAgcmV0dXJuIG51bGxcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5nZXRfbmV3X2RiX25hbWUgPSAtPlxuICBnZXRfbmV3X2RiX25hbWUuaWR4ICs9ICsxXG4gIHJldHVybiBcIi90bXAvaG9sbGVyaXRoMi10ZXN0ZGItI3tnZXRfbmV3X2RiX25hbWUuaWR4fVwiXG5nZXRfbmV3X2RiX25hbWUuaWR4ID0gMFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbnJlYWRfYWxsX2tleXMgPSAoIGRiLCBoYW5kbGVyICkgLT5cbiAgWiA9IFtdXG4gIGlucHV0ID0gZGIuY3JlYXRlS2V5U3RyZWFtKClcbiAgaW5wdXQub24gJ2VuZCcsIC0+IGhhbmRsZXIgbnVsbCwgWlxuICBpbnB1dFxuICAgIC5waXBlICQgKCBkYXRhLCBzZW5kICkgPT4gWi5wdXNoIGRhdGFcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGVhcl9sZXZlbGRiID0gKCBsZXZlbGRiLCBoYW5kbGVyICkgLT5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgcm91dGUgPSBsZXZlbGRiWyAnbG9jYXRpb24nIF1cbiAgICB5aWVsZCBsZXZlbGRiLmNsb3NlIHJlc3VtZVxuICAgIHdoaXNwZXIgXCJjbG9zZWQgTGV2ZWxEQlwiXG4gICAgeWllbGQgbGV2ZWxkb3duLmRlc3Ryb3kgcm91dGUsIHJlc3VtZVxuICAgIHdoaXNwZXIgXCJkZXN0cm95ZWQgTGV2ZWxEQlwiXG4gICAgeWllbGQgbGV2ZWxkYi5vcGVuIHJlc3VtZVxuICAgIHdoaXNwZXIgXCJyZS1vcGVuZWQgTGV2ZWxEQlwiXG4gICAgIyBoZWxwIFwiZXJhc2VkIGFuZCByZS1vcGVuZWQgTGV2ZWxEQiBhdCAje3JvdXRlfVwiXG4gICAgaGFuZGxlciBudWxsXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9tYWluID0gKCBoYW5kbGVyICkgLT5cbiAgZGIgPSBIT0xMRVJJVEgubmV3X2RiIGpvaW4gX19kaXJuYW1lLCAnLi4nLCAnZGJzL3Rlc3RzJ1xuICB0ZXN0IEAsICd0aW1lb3V0JzogMjUwMFxuXG4jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbnVubGVzcyBtb2R1bGUucGFyZW50P1xuICBAX21haW4oKVxuICAjIEBbIFwiWFhYXCIgXSBudWxsLCAtPiBoZWxwIFwiKGRvbmUpXCJcbiAgIyBAWyBcIllZWVwiIF0gbnVsbCwgLT4gaGVscCBcIihkb25lKVwiXG4gICMgQFsgXCJaWlpcIiBdIG51bGwsIC0+IGhlbHAgXCIoZG9uZSlcIlxuXG4gICMgZGVidWcgJ8KpUDlBT1InLCAoIEhPTExFUklUSC5DT0RFQ1sgJ3R5cGVtYXJrZXJzJyAgXVsgJ251bGwnICAgICAgIF0gKS50b1N0cmluZyAxNlxuICAjIGRlYnVnICfCqXh4bUlwJywgKCBIT0xMRVJJVEguQ09ERUNbICd0eXBlbWFya2VycycgIF1bICdmYWxzZScgICAgICBdICkudG9TdHJpbmcgMTZcbiAgIyBkZWJ1ZyAnwqlaZVkyNicsICggSE9MTEVSSVRILkNPREVDWyAndHlwZW1hcmtlcnMnICBdWyAndHJ1ZScgICAgICAgXSApLnRvU3RyaW5nIDE2XG4gICMgZGVidWcgJ8KpV2dFUjknLCAoIEhPTExFUklUSC5DT0RFQ1sgJ3R5cGVtYXJrZXJzJyAgXVsgJ2RhdGUnICAgICAgIF0gKS50b1N0cmluZyAxNlxuICAjIGRlYnVnICfCqVVtcGpKJywgKCBIT0xMRVJJVEguQ09ERUNbICd0eXBlbWFya2VycycgIF1bICduaW5maW5pdHknICBdICkudG9TdHJpbmcgMTZcbiAgIyBkZWJ1ZyAnwqlVcmwwSycsICggSE9MTEVSSVRILkNPREVDWyAndHlwZW1hcmtlcnMnICBdWyAnbm51bWJlcicgICAgXSApLnRvU3RyaW5nIDE2XG4gICMgZGVidWcgJ8KpbkZJSWknLCAoIEhPTExFUklUSC5DT0RFQ1sgJ3R5cGVtYXJrZXJzJyAgXVsgJ3BudW1iZXInICAgIF0gKS50b1N0cmluZyAxNlxuICAjIGRlYnVnICfCqUxaNThSJywgKCBIT0xMRVJJVEguQ09ERUNbICd0eXBlbWFya2VycycgIF1bICdwaW5maW5pdHknICBdICkudG9TdHJpbmcgMTZcbiAgIyBkZWJ1ZyAnwqlNWXhkYScsICggSE9MTEVSSVRILkNPREVDWyAndHlwZW1hcmtlcnMnICBdWyAndGV4dCcgICAgICAgXSApLnRvU3RyaW5nIDE2XG5cblxuXG5cblxuXG5cblxuXG5cbiJdfQ==