(function() {
  var $, $async, CND, CODEC, D, HOLLERITH, after, alert, badge, clear_leveldb, db, debug, echo, get_new_db_name, help, immediately, info, join, leveldown, levelup, log, njs_path, read_all_keys, rpr, show_db_entries, show_keys_and_key_bfrs, step, suspend, test, urge, warn, whisper, ƒ,
    slice = [].slice;

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

  $async = D.remit_async.bind(D);

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
          case 3:
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

  this._feed_test_data.probes.push([['丁', 'isa', ['glyph', 'guide']], ['三', 'isa', ['glyph', 'guide']], ['夫', 'isa', ['glyph', 'guide']], ['國', 'isa', ['glyph']], ['形', 'isa', ['glyph']], ['glyph:丁', 'strokeorder/count', 2], ['glyph:三', 'strokeorder/count', 3], ['glyph:夫', 'strokeorder/count', 5], ['glyph:國', 'strokeorder/count', 11], ['glyph:形', 'strokeorder/count', 7], ['glyph:丁', 'guide/count', 1], ['glyph:三', 'guide/count', 1], ['glyph:夫', 'guide/count', 1], ['glyph:國', 'guide/count', 4], ['glyph:形', 'guide/count', 2], ['glyph:丁', 'guide/lineup', ['丁']], ['glyph:三', 'guide/lineup', ['三']], ['glyph:夫', 'guide/lineup', ['夫']], ['glyph:國', 'guide/lineup', ['囗', '戈', '口', '一']], ['glyph:形', 'guide/lineup', ['开', '彡']]]);

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

  this["XXX"] = function(T, done) {
    var glyphs, probes_idx;
    warn("must test for bug with multiple identical entries");
    probes_idx = 3;
    glyphs = ['丁', '三', '夫', '國', '形'];
    return step((function(_this) {
      return function*(resume) {
        var input, prefix;
        (yield _this._feed_test_data(db, probes_idx, resume));
        (yield show_db_entries(resume));

        /* TAINT doesn't work: */
        prefix = ['pos', 'isa', 'glyph'];
        input = HOLLERITH.create_phrasestream(db, prefix);
        return input.pipe(D.$map(function(phrase, handler) {
          var _, obj, sbj, sub_input, sub_prefix;
          debug('©gg5Fr', phrase);
          _ = phrase[0], sbj = phrase[1], _ = phrase[2], obj = phrase[3];
          debug('©NxZo4', sbj);
          sub_prefix = ['spo', obj + ':' + sbj, 'guide'];
          sub_input = HOLLERITH.create_phrasestream(db, sub_prefix, '*');
          return sub_input.pipe(D.$collect()).pipe(D.$show('A')).pipe($(function(sub_results, send) {
            return handler(null, sub_results);
          }));
        })).pipe(D.$show('B')).pipe(D.$on_end(function() {
          return done();
        }));
      };
    })(this));
  };

  this["YYY"] = function(T, T_done) {
    var glyphs, probes_idx;
    warn("must test for bug with multiple identical entries");
    probes_idx = 3;
    glyphs = ['丁', '三', '夫', '國', '形'];
    return step((function(_this) {
      return function*(resume) {
        var input, prefix;
        (yield _this._feed_test_data(db, probes_idx, resume));
        (yield show_db_entries(resume));
        prefix = ['pos', 'isa', 'glyph'];
        input = HOLLERITH.create_phrasestream(db, prefix);
        return input.pipe($async(function(phrase, done) {
          var _, obj, sbj, sub_prefix;
          _ = phrase[0], sbj = phrase[1], _ = phrase[2], obj = phrase[3];
          sub_prefix = ['spo', obj + ':' + sbj, 'guide'];

          /* TAINT must honor arity */
          return HOLLERITH.read_phrases(db, sub_prefix, '*', null, function(error, sub_phrases) {
            var i, len, sub_obj, sub_phrase, sub_phrase_idx, sub_prd;
            if (error != null) {
              return done.error(error);
            }
            for (sub_phrase_idx = i = 0, len = sub_phrases.length; i < len; sub_phrase_idx = ++i) {
              sub_phrase = sub_phrases[sub_phrase_idx];
              _ = sub_phrase[0], _ = sub_phrase[1], sub_prd = sub_phrase[2], sub_obj = sub_phrase[3];
              sub_phrases[sub_phrase_idx] = [sub_prd, sub_obj];
            }
            return done([sbj].concat(slice.call(sub_phrases)));
          });
        })).pipe(D.$show('B')).pipe(D.$on_end(function() {
          return T_done();
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
    db = HOLLERITH.new_db(join(__dirname, '..', 'dbs/tests'));
    return test(this, {
      'timeout': 2500
    });
  };

  if (module.parent == null) {
    this._main();
  }

}).call(this);

//# sourceMappingURL=data:application/json;base64,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QUFBLEtBQUQsR0FBUyxTQUFFLE9BQUYsR0FBQTtBQUNQLElBQUEsRUFBQSxHQUFLLFNBQVMsQ0FBQyxNQUFWLENBQWlCLElBQUEsQ0FBSyxTQUFMLEVBQWdCLElBQWhCLEVBQXNCLFdBQXRCLENBQWpCLENBQUwsQ0FBQTtXQUNBLElBQUEsQ0FBSyxJQUFMLEVBQVE7QUFBQSxNQUFBLFNBQUEsRUFBVyxJQUFYO0tBQVIsRUFGTztFQUFBLENBajNDVCxDQUFBOztBQXMzQ0EsRUFBQSxJQUFPLHFCQUFQO0FBQ0UsSUFBQSxJQUFDLENBQUEsS0FBRCxDQUFBLENBQUEsQ0FERjtHQXQzQ0E7QUFBQSIsImZpbGUiOiJ0ZXN0cy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIlxuXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xubmpzX3BhdGggICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ3BhdGgnXG4jIG5qc19mcyAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdmcydcbmpvaW4gICAgICAgICAgICAgICAgICAgICAgPSBuanNfcGF0aC5qb2luXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkNORCAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdjbmQnXG5ycHIgICAgICAgICAgICAgICAgICAgICAgID0gQ05ELnJwclxuYmFkZ2UgICAgICAgICAgICAgICAgICAgICA9ICdIT0xMRVJJVEgvdGVzdHMnXG5sb2cgICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3BsYWluJywgICAgIGJhZGdlXG5pbmZvICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ2luZm8nLCAgICAgIGJhZGdlXG53aGlzcGVyICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3doaXNwZXInLCAgIGJhZGdlXG5hbGVydCAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ2FsZXJ0JywgICAgIGJhZGdlXG5kZWJ1ZyAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ2RlYnVnJywgICAgIGJhZGdlXG53YXJuICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3dhcm4nLCAgICAgIGJhZGdlXG5oZWxwICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ2hlbHAnLCAgICAgIGJhZGdlXG51cmdlICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3VyZ2UnLCAgICAgIGJhZGdlXG5lY2hvICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmVjaG8uYmluZCBDTkRcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuc3VzcGVuZCAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2NvZmZlZW5vZGUtc3VzcGVuZCdcbnN0ZXAgICAgICAgICAgICAgICAgICAgICAgPSBzdXNwZW5kLnN0ZXBcbmFmdGVyICAgICAgICAgICAgICAgICAgICAgPSBzdXNwZW5kLmFmdGVyXG4jIGV2ZW50dWFsbHkgICAgICAgICAgICAgICAgPSBzdXNwZW5kLmV2ZW50dWFsbHlcbmltbWVkaWF0ZWx5ICAgICAgICAgICAgICAgPSBzdXNwZW5kLmltbWVkaWF0ZWx5XG4jIHJlcGVhdF9pbW1lZGlhdGVseSAgICAgICAgPSBzdXNwZW5kLnJlcGVhdF9pbW1lZGlhdGVseVxuIyBldmVyeSAgICAgICAgICAgICAgICAgICAgID0gc3VzcGVuZC5ldmVyeVxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG50ZXN0ICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnZ3V5LXRlc3QnXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkQgICAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdwaXBlZHJlYW1zMidcbiQgICAgICAgICAgICAgICAgICAgICAgICAgPSBELnJlbWl0LmJpbmQgRFxuJGFzeW5jICAgICAgICAgICAgICAgICAgICA9IEQucmVtaXRfYXN5bmMuYmluZCBEXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkhPTExFUklUSCAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL21haW4nXG5kYiAgICAgICAgICAgICAgICAgICAgICAgID0gbnVsbFxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5sZXZlbHVwICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbGV2ZWx1cCdcbmxldmVsZG93biAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdsZXZlbGRvd24nXG5DT0RFQyAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi9jb2RlYydcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuxpIgICAgICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZm9ybWF0X251bWJlclxuXG4jICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBAX3NvcnRfbGlzdCA9ICggbGlzdCApIC0+XG4jICAgQF9lbmNvZGVfbGlzdCBsaXN0XG4jICAgbGlzdC5zb3J0IEJ1ZmZlci5jb21wYXJlXG4jICAgQF9kZWNvZGVfbGlzdCBsaXN0XG4jICAgcmV0dXJuIGxpc3RcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX2ZlZWRfdGVzdF9kYXRhID0gKCBkYiwgcHJvYmVzX2lkeCwgc2V0dGluZ3MsIGhhbmRsZXIgKSAtPlxuICBzd2l0Y2ggYXJpdHkgPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgd2hlbiAzXG4gICAgICBoYW5kbGVyICAgPSBzZXR0aW5nc1xuICAgICAgc2V0dGluZ3MgID0gbnVsbFxuICAgIHdoZW4gNFxuICAgICAgbnVsbFxuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBFcnJvciBcImV4cGVjdGVkIDMgb3IgNCBhcmd1bWVudHMsIGdvdCAje2FyaXR5fVwiXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgSE9MTEVSSVRILmNsZWFyIGRiLCByZXN1bWVcbiAgICB3aGlzcGVyIFwid3JpdGluZyB0ZXN0IGRhdGFzZXQgIyN7cHJvYmVzX2lkeH0gd2l0aCBzZXR0aW5ncyAje3JwciBzZXR0aW5nc31cIlxuICAgIGlucHV0ID0gRC5jcmVhdGVfdGhyb3VnaHN0cmVhbSgpXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBzd2l0Y2ggcHJvYmVzX2lkeFxuICAgICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICB3aGVuIDAsIDIsIDNcbiAgICAgICAgaW5wdXRcbiAgICAgICAgICAucGlwZSBIT0xMRVJJVEguJHdyaXRlIGRiLCBzZXR0aW5nc1xuICAgICAgICAgICMgLnBpcGUgRC4kc2hvdygpXG4gICAgICAgICAgLnBpcGUgRC4kb25fZW5kICggZW5kICkgPT5cbiAgICAgICAgICAgIHdoaXNwZXIgXCJ0ZXN0IGRhdGEgd3JpdHRlblwiXG4gICAgICAgICAgICBoYW5kbGVyIG51bGxcbiAgICAgICAgICAgIGVuZCgpXG4gICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgICAgZm9yIHByb2JlIGluIEBfZmVlZF90ZXN0X2RhdGEucHJvYmVzWyBwcm9iZXNfaWR4IF1cbiAgICAgICAgICAjIGtleSA9IEhPTExFUklUSC5uZXdfc29fa2V5IGRiLCBwcm9iZS4uLlxuICAgICAgICAgICMgZGVidWcgJ8KpV1YwajInLCBwcm9iZVxuICAgICAgICAgIGlucHV0LndyaXRlIHByb2JlXG4gICAgICAgICAgeWllbGQgc2V0SW1tZWRpYXRlIHJlc3VtZVxuICAgICAgICBpbnB1dC5lbmQoKVxuICAgICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICB3aGVuIDFcbiAgICAgICAgaW5wdXRcbiAgICAgICAgICAucGlwZSBIT0xMRVJJVEguJHdyaXRlIGRiLCBzZXR0aW5nc1xuICAgICAgICAgICMgLnBpcGUgRC4kc2hvdygpXG4gICAgICAgICAgLnBpcGUgRC4kb25fZW5kICggZW5kICkgPT5cbiAgICAgICAgICAgIHdoaXNwZXIgXCJ0ZXN0IGRhdGEgd3JpdHRlblwiXG4gICAgICAgICAgICBlbmQoKVxuICAgICAgICAgICAgaGFuZGxlciBudWxsXG4gICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgICAgZm9yIHVybF9rZXkgaW4gQF9mZWVkX3Rlc3RfZGF0YS5wcm9iZXNbIHByb2Jlc19pZHggXVxuICAgICAgICAgIGtleSA9IEhPTExFUklUSC5rZXlfZnJvbV91cmwgZGIsIHVybF9rZXlcbiAgICAgICAgICBpbnB1dC53cml0ZSBrZXlcbiAgICAgICAgICB5aWVsZCBzZXRJbW1lZGlhdGUgcmVzdW1lXG4gICAgICAgIGlucHV0LmVuZCgpXG4gICAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgZWxzZSByZXR1cm4gaGFuZGxlciBuZXcgRXJyb3IgXCJpbGxlZ2FsIHByb2JlcyBpbmRleCAje3JwciBwcm9iZXNfaWR4fVwiXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcmV0dXJuIG51bGxcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX2ZlZWRfdGVzdF9kYXRhLnByb2JlcyA9IFtdXG5cbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuQF9mZWVkX3Rlc3RfZGF0YS5wcm9iZXMucHVzaCBbXG4gIFsgJ/Cnt58xJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAgICAgICAgICAgICAgMSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn8Ke3nzInLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsICAgICAgICAgICAgICAyLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfwp7efMycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgICAgICAgICAgICAgIDMsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ/Cnt580JywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAgICAgICAgICAgICAgNCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn8Ke3nycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgICAgICAgICAgICAgICA1LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfwp7efNicsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgICAgICAgICAgICAgIDYsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ/Cnt58nLCAnY3AvY2lkJywgICAgICAgICAgICAgICAgICAgICAgICAgICAxNjMyOTUsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn8Ke3nycsICdndWlkZS91Y2hyL2hhcycsICAgICAgICAgICAgICAgICAgIFsgJ+WFqycsICfliIAnLCAn5a6AJywgJ+6HuicsICfosp0nLCBdLCAgICAgIF1cbiAgWyAn8Ke3nycsICdyYW5rL2NqdCcsICAgICAgICAgICAgICAgICAgICAgICAgIDU0MzIsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICflhasnLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICAgICAgICAgICczNCcsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5YiAJywgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCAgICAgICAgICAnNSgxMikzJywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+WugCcsICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgICAgICAgICAgJzQ0JywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfuh7onLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICAgICAgICAgICcxMicsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn6LKdJywgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCAgICAgICAgICAnMjUoMTIpJywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+WFqycsICdyYW5rL2NqdCcsICAgICAgICAgICAgICAgICAgICAgICAgIDEyNTQxLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfliIAnLCAncmFuay9janQnLCAgICAgICAgICAgICAgICAgICAgICAgICAxMjU0MiwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5a6AJywgJ3JhbmsvY2p0JywgICAgICAgICAgICAgICAgICAgICAgICAgMTI1NDMsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+6HuicsICdyYW5rL2NqdCcsICAgICAgICAgICAgICAgICAgICAgICAgIDEyNTQ0LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfosp0nLCAncmFuay9janQnLCAgICAgICAgICAgICAgICAgICAgICAgICAxMjU0NSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgXVxuXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkBfZmVlZF90ZXN0X2RhdGEucHJvYmVzLnB1c2ggW1xuICAnc298Z2x5cGg65YqsfGNwL2ZuY3I6dS1jamsvNTJhY3wwJ1xuICAnc298Z2x5cGg66YKtfGNwL2ZuY3I6dS1jamsvOTBhZHwwJ1xuICAnc298Z2x5cGg68KC0pnxjcC9mbmNyOnUtY2prLXhiLzIwZDI2fDAnXG4gICdzb3xnbHlwaDrwpL+vfGNwL2ZuY3I6dS1jamsteGIvMjRmZWZ8MCdcbiAgJ3NvfGdseXBoOvCnkbR8Y3AvZm5jcjp1LWNqay14Yi8yNzQ3NHwwJ1xuICAnc298Z2x5cGg68KiSoXxjcC9mbmNyOnUtY2prLXhiLzI4NGExfDAnXG4gICdzb3xnbHlwaDrwqpqnfGNwL2ZuY3I6dS1jamsteGIvMmE2YTd8MCdcbiAgJ3NvfGdseXBoOvCqmqt8Y3AvZm5jcjp1LWNqay14Yi8yYTZhYnwwJ1xuICAnc298Z2x5cGg68KS/r3xzdHJva2VvcmRlcjozNTI1MTM1NTMyNTR8MCdcbiAgJ3NvfGdseXBoOvCgtKZ8c3Ryb2tlb3JkZXI6MzUyNTE0MTEyMXwwJ1xuICAnc298Z2x5cGg68KiSoXxzdHJva2VvcmRlcjozNTI1MTQ1NHwwJ1xuICAnc298Z2x5cGg66YKtfHN0cm9rZW9yZGVyOjM1MjUxNTJ8MCdcbiAgJ3NvfGdseXBoOvCqmqt8c3Ryb2tlb3JkZXI6MzUyNTE1MjUxMTE1MTE1MTEzNTQxfDAnXG4gICdzb3xnbHlwaDrwqpqnfHN0cm9rZW9yZGVyOjM1MjUxNTI1MTEyNTExNTExfDAnXG4gICdzb3xnbHlwaDrwp5G0fHN0cm9rZW9yZGVyOjM1MjUxNTI1MTIxNDI1MTIxNHwwJ1xuICAnc298Z2x5cGg65YqsfHN0cm9rZW9yZGVyOjM1MjUxNTN8MCdcbiAgXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfZmVlZF90ZXN0X2RhdGEucHJvYmVzLnB1c2ggW1xuICBbICfkuIEnLCAnc3Ryb2tlY291bnQnLCAgICAgMiwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5LiJJywgJ3N0cm9rZWNvdW50JywgICAgIDMsICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+WkqycsICdzdHJva2Vjb3VudCcsICAgICA1LCAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICflnIsnLCAnc3Ryb2tlY291bnQnLCAgICAgMTEsICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5b2iJywgJ3N0cm9rZWNvdW50JywgICAgIDcsICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+S4gScsICdjb21wb25lbnRjb3VudCcsICAxLCAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfkuIknLCAnY29tcG9uZW50Y291bnQnLCAgMSwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5aSrJywgJ2NvbXBvbmVudGNvdW50JywgIDEsICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+WciycsICdjb21wb25lbnRjb3VudCcsICA0LCAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICflvaInLCAnY29tcG9uZW50Y291bnQnLCAgMiwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5LiBJywgJ2NvbXBvbmVudHMnLCAgICAgIFsgJ+S4gScsIF0sICAgICAgICAgICAgICAgICAgXVxuICBbICfkuIknLCAnY29tcG9uZW50cycsICAgICAgWyAn5LiJJywgXSwgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+WkqycsICdjb21wb25lbnRzJywgICAgICBbICflpKsnLCBdLCAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5ZyLJywgJ2NvbXBvbmVudHMnLCAgICAgIFsgJ+WblycsICfmiIgnLCAn5Y+jJywgJ+S4gCcsIF0sIF1cbiAgWyAn5b2iJywgJ2NvbXBvbmVudHMnLCAgICAgIFsgJ+W8gCcsICflvaEnLCBdLCAgICAgICAgICAgICBdXG4gIF1cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX2ZlZWRfdGVzdF9kYXRhLnByb2Jlcy5wdXNoIFtcbiAgWyAn5LiBJywgJ2lzYScsICAgICAgICAgICAgICAgICAgICAgICAgIFsgJ2dseXBoJywgJ2d1aWRlJywgXSAgICAgICBdXG4gIFsgJ+S4iScsICdpc2EnLCAgICAgICAgICAgICAgICAgICAgICAgICBbICdnbHlwaCcsICdndWlkZScsIF0gICAgICAgXVxuICBbICflpKsnLCAnaXNhJywgICAgICAgICAgICAgICAgICAgICAgICAgWyAnZ2x5cGgnLCAnZ3VpZGUnLCBdICAgICAgIF1cbiAgWyAn5ZyLJywgJ2lzYScsICAgICAgICAgICAgICAgICAgICAgICAgIFsgJ2dseXBoJywgXSAgICAgICAgICAgICAgICBdXG4gIFsgJ+W9oicsICdpc2EnLCAgICAgICAgICAgICAgICAgICAgICAgICBbICdnbHlwaCcsIF0gICAgICAgICAgICAgICAgXVxuICBbICdnbHlwaDrkuIEnLCAnc3Ryb2tlb3JkZXIvY291bnQnLCAgICAgMiwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAnZ2x5cGg65LiJJywgJ3N0cm9rZW9yZGVyL2NvdW50JywgICAgIDMsICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ2dseXBoOuWkqycsICdzdHJva2VvcmRlci9jb3VudCcsICAgICA1LCAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICdnbHlwaDrlnIsnLCAnc3Ryb2tlb3JkZXIvY291bnQnLCAgICAgMTEsICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAnZ2x5cGg65b2iJywgJ3N0cm9rZW9yZGVyL2NvdW50JywgICAgIDcsICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ2dseXBoOuS4gScsICdndWlkZS9jb3VudCcsICAgICAgICAgICAxLCAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICdnbHlwaDrkuIknLCAnZ3VpZGUvY291bnQnLCAgICAgICAgICAgMSwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAnZ2x5cGg65aSrJywgJ2d1aWRlL2NvdW50JywgICAgICAgICAgIDEsICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ2dseXBoOuWciycsICdndWlkZS9jb3VudCcsICAgICAgICAgICA0LCAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICdnbHlwaDrlvaInLCAnZ3VpZGUvY291bnQnLCAgICAgICAgICAgMiwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAnZ2x5cGg65LiBJywgJ2d1aWRlL2xpbmV1cCcsICAgICAgICAgIFsgJ+S4gScsIF0sICAgICAgICAgICAgICAgICAgXVxuICBbICdnbHlwaDrkuIknLCAnZ3VpZGUvbGluZXVwJywgICAgICAgICAgWyAn5LiJJywgXSwgICAgICAgICAgICAgICAgICBdXG4gIFsgJ2dseXBoOuWkqycsICdndWlkZS9saW5ldXAnLCAgICAgICAgICBbICflpKsnLCBdLCAgICAgICAgICAgICAgICAgIF1cbiAgWyAnZ2x5cGg65ZyLJywgJ2d1aWRlL2xpbmV1cCcsICAgICAgICAgIFsgJ+WblycsICfmiIgnLCAn5Y+jJywgJ+S4gCcsIF0sIF1cbiAgWyAnZ2x5cGg65b2iJywgJ2d1aWRlL2xpbmV1cCcsICAgICAgICAgIFsgJ+W8gCcsICflvaEnLCBdLCAgICAgICAgICAgICBdXG4gIF1cblxuIyBwb3N8Z3VpZGUva3dpYy9zb3J0Y29kZVxuXG4jICMgW1xuIyAjIFwiMTAyN35+fn4sMDBcIixcIjAxNTZ+fn5+LDAxLDA1MDl+fn5+LDAyLDAwMDB+fn5+LDAzLC0tLS0tLS0tLDA0LC0tLS0tLS0tLDA1LC0tLS0tLS0tLDA2LC0tLS0tLS0tLDA3LC0tLS0tLS0tLDA4LC0tLS0tLS0tLDA5LC0tLS0tLS0tLDEwLC0tLS0tLS0tLDExLC0tLS0tLS0tLDEyLFwiXG4jICMgXCIwMTU2fn5+fiwwMVwiLFwiMDUwOX5+fn4sMDIsMDAwMH5+fn4sMDMsLS0tLS0tLS0sMDQsLS0tLS0tLS0sMDUsLS0tLS0tLS0sMDYsLS0tLS0tLS0sMDcsLS0tLS0tLS0sMDgsLS0tLS0tLS0sMDksLS0tLS0tLS0sMTAsLS0tLS0tLS0sMTEsLS0tLS0tLS0sMTIsMTAyN35+fn4sMDAsXCJcbiMgIyBcIjA1MDl+fn5+LDAyXCIsXCIwMDAwfn5+fiwwMywtLS0tLS0tLSwwNCwtLS0tLS0tLSwwNSwtLS0tLS0tLSwwNiwtLS0tLS0tLSwwNywtLS0tLS0tLSwwOCwtLS0tLS0tLSwwOSwtLS0tLS0tLSwxMCwtLS0tLS0tLSwxMSwtLS0tLS0tLSwxMiwxMDI3fn5+fiwwMCwwMTU2fn5+fiwwMSxcIlxuIyAjIFwiMDAwMH5+fn4sMDNcIixcIi0tLS0tLS0tLDA0LC0tLS0tLS0tLDA1LC0tLS0tLS0tLDA2LC0tLS0tLS0tLDA3LC0tLS0tLS0tLDA4LC0tLS0tLS0tLDA5LC0tLS0tLS0tLDEwLC0tLS0tLS0tLDExLC0tLS0tLS0tLDEyLDEwMjd+fn5+LDAwLDAxNTZ+fn5+LDAxLDA1MDl+fn5+LDAyLFwiXG4jICMgXVxuXG4jIDAwODd+fn5+LDAwLDAyOTF+fn5+LDAxLDA1NTV+fn5+LDAyLC0tLS0tLS0tLDAzLC0tLS0tLS0tLDA0LC0tLS0tLS0tLDA1LC0tLS0tLS0tLDA2LC0tLS0tLS0tLDA3LC0tLS0tLS0tLDA4LC0tLS0tLS0tLDA5LC0tLS0tLS0tLDEwLC0tLS0tLS0tLDExLC0tLS0tLS0tLDEyLHzwppaIfDBcbiMgMDA4N35+fn4sMDAsMDI5MX5+fn4sMDEsMDgyM3gyaC0sMDIsLS0tLS0tLS0sMDMsLS0tLS0tLS0sMDQsLS0tLS0tLS0sMDUsLS0tLS0tLS0sMDYsLS0tLS0tLS0sMDcsLS0tLS0tLS0sMDgsLS0tLS0tLS0sMDksLS0tLS0tLS0sMTAsLS0tLS0tLS0sMTEsLS0tLS0tLS0sMTIsfOiBl3wwXG4jIDAwODd+fn5+LDAwLDAyOTF+fn5+LDAxLDEwMjN+fn5+LDAyLC0tLS0tLS0tLDAzLC0tLS0tLS0tLDA0LC0tLS0tLS0tLDA1LC0tLS0tLS0tLDA2LC0tLS0tLS0tLDA3LC0tLS0tLS0tLDA4LC0tLS0tLS0tLDA5LC0tLS0tLS0tLDEwLC0tLS0tLS0tLDExLC0tLS0tLS0tLDEyLHzwpIuVfDBcbiMgMDA4N35+fn4sMDAsMDI5NH5+fn4sMDEsMDA2MH5+fn4sMDIsLS0tLS0tLS0sMDMsLS0tLS0tLS0sMDQsLS0tLS0tLS0sMDUsLS0tLS0tLS0sMDYsLS0tLS0tLS0sMDcsLS0tLS0tLS0sMDgsLS0tLS0tLS0sMDksLS0tLS0tLS0sMTAsLS0tLS0tLS0sMTEsLS0tLS0tLS0sMTIsfPCmlpR8MFxuIyAwMDg3fn5+fiwwMCwwMjk0fn5+fiwwMSwwNTU1fn5+fiwwMiwtLS0tLS0tLSwwMywtLS0tLS0tLSwwNCwtLS0tLS0tLSwwNSwtLS0tLS0tLSwwNiwtLS0tLS0tLSwwNywtLS0tLS0tLSwwOCwtLS0tLS0tLSwwOSwtLS0tLS0tLSwxMCwtLS0tLS0tLSwxMSwtLS0tLS0tLSwxMix88KaXhnwwXG4jIDAwODd+fn5+LDAwLDAyOTV+fn5+LDAxLDA4MDJ+fn5+LDAyLDA5NTh+fn5+LDAzLC0tLS0tLS0tLDA0LC0tLS0tLS0tLDA1LC0tLS0tLS0tLDA2LC0tLS0tLS0tLDA3LC0tLS0tLS0tLDA4LC0tLS0tLS0tLDA5LC0tLS0tLS0tLDEwLC0tLS0tLS0tLDExLC0tLS0tLS0tLDEyLHzwpaq7fDBcbiMgMDA4N35+fn4sMDAsMDMxMn5+fn4sMDEsLS0tLS0tLS0sMDIsLS0tLS0tLS0sMDMsLS0tLS0tLS0sMDQsLS0tLS0tLS0sMDUsLS0tLS0tLS0sMDYsLS0tLS0tLS0sMDcsLS0tLS0tLS0sMDgsLS0tLS0tLS0sMDksLS0tLS0tLS0sMTAsLS0tLS0tLS0sMTEsLS0tLS0tLS0sMTIsfPCmlLJ8MFxuIyAwMDg3fn5+fiwwMCwwMzE0fn5+fiwwMSwxMTczfn5+fiwwMiwtLS0tLS0tLSwwMywtLS0tLS0tLSwwNCwtLS0tLS0tLSwwNSwtLS0tLS0tLSwwNiwtLS0tLS0tLSwwNywtLS0tLS0tLSwwOCwtLS0tLS0tLSwwOSwtLS0tLS0tLSwxMCwtLS0tLS0tLSwxMSwtLS0tLS0tLSwxMix88KaVgHwwXG4jIDAwODd+fn5+LDAwLDAzMTl+fn5+LDAxLC0tLS0tLS0tLDAyLC0tLS0tLS0tLDAzLC0tLS0tLS0tLDA0LC0tLS0tLS0tLDA1LC0tLS0tLS0tLDA2LC0tLS0tLS0tLDA3LC0tLS0tLS0tLDA4LC0tLS0tLS0tLDA5LC0tLS0tLS0tLDEwLC0tLS0tLS0tLDExLC0tLS0tLS0tLDEyLHzwppWHfDBcbiMgMDA4N35+fn4sMDAsMDM1NX5+fn4sMDEsLS0tLS0tLS0sMDIsLS0tLS0tLS0sMDMsLS0tLS0tLS0sMDQsLS0tLS0tLS0sMDUsLS0tLS0tLS0sMDYsLS0tLS0tLS0sMDcsLS0tLS0tLS0sMDgsLS0tLS0tLS0sMDksLS0tLS0tLS0sMTAsLS0tLS0tLS0sMTEsLS0tLS0tLS0sMTIsfPCmlYZ8MFxuIyAwMDg3fn5+fiwwMCwwMzczfn5+fiwwMSwwMjg0fn5+fiwwMiwtLS0tLS0tLSwwMywtLS0tLS0tLSwwNCwtLS0tLS0tLSwwNSwtLS0tLS0tLSwwNiwtLS0tLS0tLSwwNywtLS0tLS0tLSwwOCwtLS0tLS0tLSwwOSwtLS0tLS0tLSwxMCwtLS0tLS0tLSwxMSwtLS0tLS0tLSwxMix88KaVp3wwXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJ3cml0ZSB3aXRob3V0IGVycm9yXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHByb2Jlc19pZHggID0gMFxuICBpZHggPSAtMVxuICB3cml0ZV9zZXR0aW5ncyA9XG4gICAgYmF0Y2g6IDEwXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHdyaXRlX3NldHRpbmdzLCByZXN1bWVcbiAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgd2l0aG91dCBlcnJvclwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ID0gLTFcbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgZGVidWcgJ8KpN2xFZ3knLCBkYlsnJXNlbGYnXS5pc0Nsb3NlZCgpXG4gICAgZGVidWcgJ8KpN2xFZ3knLCBkYlsnJXNlbGYnXS5pc09wZW4oKVxuICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHJlc3VtZVxuICAgICMgZG9uZSgpXG4gICAgaW5wdXQgPSBIT0xMRVJJVEguY3JlYXRlX2ZhY2V0c3RyZWFtIGRiXG4gICAgaW5wdXRcbiAgICAgICMgLnBpcGUgSE9MTEVSSVRILiR1cmxfZnJvbV9rZXkgZGJcbiAgICAgIC5waXBlICQgKCBbIGtleSwgdmFsdWUsIF0sIHNlbmQgKSA9PlxuICAgICAgICBpZHggKz0gKzFcbiAgICAgICAgIyBULmVxIGtleSwgbWF0Y2hlcnNbIGlkeCBdXG4gICAgICAucGlwZSBELiRvbl9lbmQgKCBlbmQgKSA9PiBlbmQ7IGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCBrZXlzIHdpdGhvdXQgZXJyb3IgKDEpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEhPTExFUklUSC5jbGVhciBkYiwgcmVzdW1lXG4gICAgIyMjIFRBSU5UIGF3YWl0aW5nIGJldHRlciBzb2x1dGlvbiAjIyNcbiAgICBOVUxMID0gSE9MTEVSSVRILl9lbmNvZGVfdmFsdWUgZGIsIDFcbiAgICBmb3IgaWR4IGluIFsgMCAuLi4gMTAgXVxuICAgICAgZGJbICclc2VsZicgXS5wdXQgKCBIT0xMRVJJVEguX2VuY29kZV9rZXkgZGIsIFsgJ3gnLCBpZHgsICd4JywgXSApLCBOVUxMXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwcm9iZV9pZHggPSA0XG4gICAgY291bnQgICAgID0gMFxuICAgIHF1ZXJ5ICAgICA9IEhPTExFUklUSC5fcXVlcnlfZnJvbV9wcmVmaXggZGIsIFsgJ3gnLCBwcm9iZV9pZHgsIF1cbiAgICBpbnB1dCAgICAgPSBkYlsgJyVzZWxmJyBdLmNyZWF0ZVJlYWRTdHJlYW0gcXVlcnlcbiAgICBpbnB1dFxuICAgICAgLnBpcGUgJCAoIHsga2V5LCB2YWx1ZSwgfSwgc2VuZCApID0+XG4gICAgICAgIGNvdW50ICs9IDFcbiAgICAgICAgVC5lcSAoIEhPTExFUklUSC5fZGVjb2RlX2tleSBkYiwga2V5IClbIDEgXSwgcHJvYmVfaWR4XG4gICAgICAucGlwZSBELiRvbl9lbmQgKCBlbmQgKSA9PlxuICAgICAgICBULmVxIGNvdW50LCAxXG4gICAgICAgIGVuZCgpXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCBrZXlzIHdpdGhvdXQgZXJyb3IgKDIpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEhPTExFUklUSC5jbGVhciBkYiwgcmVzdW1lXG4gICAgIyMjIFRBSU5UIGF3YWl0aW5nIGJldHRlciBzb2x1dGlvbiAjIyNcbiAgICBOVUxMID0gSE9MTEVSSVRILl9lbmNvZGVfdmFsdWUgZGIsIDFcbiAgICBmb3IgaWR4IGluIFsgMCAuLi4gMTAgXVxuICAgICAgZGJbICclc2VsZicgXS5wdXQgKCBIT0xMRVJJVEguX2VuY29kZV9rZXkgZGIsIFsgJ3gnLCBpZHgsICd4JywgXSApLCBOVUxMXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwcm9iZV9pZHggPSA0XG4gICAgY291bnQgICAgID0gMFxuICAgIHByZWZpeCAgICA9IFsgJ3gnLCBwcm9iZV9pZHgsIF1cbiAgICBpbnB1dCAgICAgPSBIT0xMRVJJVEguY3JlYXRlX2ZhY2V0c3RyZWFtIGRiLCBwcmVmaXhcbiAgICBpbnB1dFxuICAgICAgLnBpcGUgJCAoIGZhY2V0LCBzZW5kICkgPT5cbiAgICAgICAgY291bnQgKz0gMVxuICAgICAgICBbIGtleSwgdmFsdWUsIF0gPSBmYWNldFxuICAgICAgICBULmVxIGtleVsgMSBdLCBwcm9iZV9pZHhcbiAgICAgIC5waXBlIEQuJG9uX2VuZCAoIGVuZCApID0+XG4gICAgICAgIFQuZXEgY291bnQsIDFcbiAgICAgICAgZW5kKClcbiAgICAgICAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZWFkIGtleXMgd2l0aG91dCBlcnJvciAoMylcIiBdID0gKCBULCBkb25lICkgLT5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgSE9MTEVSSVRILmNsZWFyIGRiLCByZXN1bWVcbiAgICAjIyMgVEFJTlQgYXdhaXRpbmcgYmV0dGVyIHNvbHV0aW9uICMjI1xuICAgIE5VTEwgPSBIT0xMRVJJVEguX2VuY29kZV92YWx1ZSBkYiwgMVxuICAgIGZvciBpZHggaW4gWyAwIC4uLiAxMCBdXG4gICAgICBkYlsgJyVzZWxmJyBdLnB1dCAoIEhPTExFUklUSC5fZW5jb2RlX2tleSBkYiwgWyAneCcsIGlkeCwgJ3gnLCBdICksIE5VTExcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHByb2JlX2lkeCA9IDNcbiAgICBjb3VudCAgICAgPSAwXG4gICAgZGVsdGEgICAgID0gMlxuICAgIGxvICAgICAgICA9IFsgJ3gnLCBwcm9iZV9pZHgsIF1cbiAgICBoaSAgICAgICAgPSBbICd4JywgcHJvYmVfaWR4ICsgZGVsdGEsIF1cbiAgICBxdWVyeSAgICAgPSB7IGd0ZTogKCBIT0xMRVJJVEguX2VuY29kZV9rZXkgZGIsIGxvICksIGx0ZTogKCBIT0xMRVJJVEguX3F1ZXJ5X2Zyb21fcHJlZml4IGRiLCBoaSApWyAnbHRlJyBdLCB9XG4gICAgaW5wdXQgICAgID0gZGJbICclc2VsZicgXS5jcmVhdGVSZWFkU3RyZWFtIHF1ZXJ5XG4gICAgaW5wdXRcbiAgICAgIC5waXBlICQgKCB7IGtleSwgdmFsdWUsIH0sIHNlbmQgKSA9PlxuICAgICAgICBjb3VudCArPSAxXG4gICAgICAgIFQuZXEgKCBIT0xMRVJJVEguX2RlY29kZV9rZXkgZGIsIGtleSApWyAxIF0sIHByb2JlX2lkeCArIGNvdW50IC0gMVxuICAgICAgLnBpcGUgRC4kb25fZW5kICggZW5kICkgPT5cbiAgICAgICAgVC5lcSBjb3VudCwgZGVsdGEgKyAxXG4gICAgICAgIGVuZCgpXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCBrZXlzIHdpdGhvdXQgZXJyb3IgKDQpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEhPTExFUklUSC5jbGVhciBkYiwgcmVzdW1lXG4gICAgZm9yIGlkeCBpbiBbIDAgLi4uIDEwIF1cbiAgICAgIGRiWyAnJXNlbGYnIF0ucHV0ICggSE9MTEVSSVRILl9lbmNvZGVfa2V5IGRiLCBbICd4JywgaWR4LCAneCcsIF0gKSwgSE9MTEVSSVRILl9lbmNvZGVfdmFsdWUgZGIsIDFcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHByb2JlX2lkeCA9IDNcbiAgICBjb3VudCAgICAgPSAwXG4gICAgZGVsdGEgICAgID0gMlxuICAgIGxvICAgICAgICA9IFsgJ3gnLCBwcm9iZV9pZHgsIF1cbiAgICBoaSAgICAgICAgPSBbICd4JywgcHJvYmVfaWR4ICsgZGVsdGEsIF1cbiAgICBpbnB1dCAgICAgPSBIT0xMRVJJVEguY3JlYXRlX2ZhY2V0c3RyZWFtIGRiLCBsbywgaGlcbiAgICBpbnB1dFxuICAgICAgLnBpcGUgJCAoIFsga2V5LCB2YWx1ZSwgXSwgc2VuZCApID0+XG4gICAgICAgIGNvdW50ICs9IDFcbiAgICAgICAgVC5lcSBrZXlbIDEgXSwgcHJvYmVfaWR4ICsgY291bnQgLSAxXG4gICAgICAucGlwZSBELiRvbl9lbmQgKCBlbmQgKSA9PlxuICAgICAgICBULmVxIGNvdW50LCBkZWx0YSArIDFcbiAgICAgICAgZW5kKClcbiAgICAgICAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJjcmVhdGVfZmFjZXRzdHJlYW0gdGhyb3dzIHdpdGggd3JvbmcgYXJndW1lbnRzXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIG1lc3NhZ2UgPSBcIm11c3QgZ2l2ZSBgbG9faGludGAgd2hlbiBgaGlfaGludGAgaXMgZ2l2ZW5cIlxuICBULnRocm93cyBtZXNzYWdlLCAoIC0+IEhPTExFUklUSC5jcmVhdGVfZmFjZXRzdHJlYW0gZGIsIG51bGwsIFsgJ3h4eCcsIF0gKVxuICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgUE9TIGZhY2V0c1wiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ICAgICAgICAgPSAtMVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGtleV9tYXRjaGVycyA9IFtcbiAgICBbICdwb3MnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDIsICfwp7efMicgXVxuICAgIFsgJ3BvcycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgMywgJ/Cnt58zJyBdXG4gICAgWyAncG9zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCA0LCAn8Ke3nzQnIF1cbiAgICBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcGhyYXNlX21hdGNoZXJzID0gW1xuICAgIFsgJ3BvcycsICfwp7efMicsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgMiBdXG4gICAgWyAncG9zJywgJ/Cnt58zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAzIF1cbiAgICBbICdwb3MnLCAn8Ke3nzQnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDQgXVxuICAgIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBAX2ZlZWRfdGVzdF9kYXRhIGRiLCBwcm9iZXNfaWR4LCByZXN1bWVcbiAgICBsbyA9IFsgJ3BvcycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgMiwgXVxuICAgIGhpID0gWyAncG9zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCA0LCBdXG4gICAgIyBpbnB1dCAgID0gSE9MTEVSSVRILmNyZWF0ZV9rZXlzdHJlYW0gZGIsIGxvXG4gICAgaW5wdXQgICA9IEhPTExFUklUSC5jcmVhdGVfZmFjZXRzdHJlYW0gZGIsIGxvLCBoaVxuICAgIGlucHV0XG4gICAgICAjIC5waXBlIEhPTExFUklUSC4kdXJsX2Zyb21fa2V5IGRiXG4gICAgICAucGlwZSAkICggWyBrZXksIHZhbHVlLCBdLCBzZW5kICkgPT5cbiAgICAgICAgaWR4ICs9ICsxXG4gICAgICAgIHBocmFzZSA9IEhPTExFUklUSC5hc19waHJhc2UgZGIsIGtleSwgdmFsdWVcbiAgICAgICAgVC5lcSBrZXksIGtleV9tYXRjaGVyc1sgaWR4IF1cbiAgICAgICAgVC5lcSBwaHJhc2UsIHBocmFzZV9tYXRjaGVyc1sgaWR4IF1cbiAgICAgIC5waXBlIEQuJG9uX2VuZCAoIGVuZCApID0+IGVuZCgpOyBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgUE9TIHBocmFzZXMgKDEpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHByb2Jlc19pZHggID0gMFxuICBpZHggICAgICAgICA9IC0xXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgbWF0Y2hlcnMgPSBbXG4gICAgWyAncG9zJywgJ/Cnt58yJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAyIF1cbiAgICBbICdwb3MnLCAn8Ke3nzMnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDMgXVxuICAgIFsgJ3BvcycsICfwp7efNCcsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgNCBdXG4gICAgXVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHJlc3VtZVxuICAgIGxvID0gWyAncG9zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAyLCBdXG4gICAgaGkgPSBbICdwb3MnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDQsIF1cbiAgICBpbnB1dCAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIGxvLCBoaVxuICAgIGlucHV0XG4gICAgICAucGlwZSAkICggcGhyYXNlLCBzZW5kICkgPT5cbiAgICAgICAgaWR4ICs9ICsxXG4gICAgICAgIFQuZXEgcGhyYXNlLCBtYXRjaGVyc1sgaWR4IF1cbiAgICAgIC5waXBlIEQuJG9uX2VuZCAoIGVuZCApID0+IGVuZCgpOyBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgUE9TIHBocmFzZXMgKDIpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHByb2Jlc19pZHggID0gMFxuICBpZHggICAgICAgICA9IC0xXG4gIGNvdW50ICAgICAgID0gMFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIG1hdGNoZXJzID0gW1xuICAgIFsgJ3BvcycsICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgJ+WFqycsIDAgXVxuICAgIFsgJ3BvcycsICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgJ+WIgCcsIDEgXVxuICAgIFsgJ3BvcycsICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgJ+WugCcsIDIgXVxuICAgIFsgJ3BvcycsICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgJ+iynScsIDQgXVxuICAgIFsgJ3BvcycsICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgJ+6HuicsIDMgXVxuICAgIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBAX2ZlZWRfdGVzdF9kYXRhIGRiLCBwcm9iZXNfaWR4LCByZXN1bWVcbiAgICBwcmVmaXggICAgPSBbICdwb3MnLCAnZ3VpZGUvdWNoci9oYXMnLCBdXG4gICAgaW5wdXQgICAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIHByZWZpeFxuICAgIHNldHRpbmdzICA9IHsgaW5kZXhlZDogbm8sIH1cbiAgICBpbnB1dFxuICAgICAgLnBpcGUgJCAoIHBocmFzZSwgc2VuZCApID0+XG4gICAgICAgIGRlYnVnICfCqURzQWZZJywgcnByIHBocmFzZVxuICAgICAgICBjb3VudCAgKz0gKzFcbiAgICAgICAgaWR4ICAgICs9ICsxXG4gICAgICAgIFQuZXEgcGhyYXNlLCBtYXRjaGVyc1sgaWR4IF1cbiAgICAgIC5waXBlIEQuJG9uX2VuZCAoIGVuZCApID0+XG4gICAgICAgIFQuZXEgY291bnQsIG1hdGNoZXJzLmxlbmd0aFxuICAgICAgICBlbmQoKVxuICAgICAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgU1BPIHBocmFzZXNcIiBdID0gKCBULCBkb25lICkgLT5cbiAgZGVidWcgJ8KpUnNveGInLCBkYlsgJyVzZWxmJyBdLmlzT3BlbigpXG4gIHByb2Jlc19pZHggID0gMFxuICBpZHggICAgICAgICA9IC0xXG4gIGNvdW50ICAgICAgID0gMFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIG1hdGNoZXJzID0gW1xuICAgIFsgJ3NwbycsICfwp7efJywgJ2NwL2NpZCcsIDE2MzI5NSBdXG4gICAgWyAnc3BvJywgJ/Cnt58nLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDUgXVxuICAgIFsgJ3NwbycsICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgWyAn5YWrJywgJ+WIgCcsICflroAnLCAn7oe6JywgJ+iynScgXSBdXG4gICAgWyAnc3BvJywgJ/Cnt58nLCAncmFuay9janQnLCA1NDMyIF1cbiAgICBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgQF9mZWVkX3Rlc3RfZGF0YSBkYiwgcHJvYmVzX2lkeCwgcmVzdW1lXG4gICAgcHJlZml4ICA9IFsgJ3NwbycsICfwp7efJywgXVxuICAgIGlucHV0ICAgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgcHJlZml4XG4gICAgaW5wdXRcbiAgICAgIC5waXBlICQgKCBwaHJhc2UsIHNlbmQgKSA9PlxuICAgICAgICBkZWJ1ZyAnwqlEc0FmWScsIHJwciBwaHJhc2VcbiAgICAgICAgY291bnQgICs9ICsxXG4gICAgICAgIGlkeCAgICArPSArMVxuICAgICAgICBULmVxIHBocmFzZSwgbWF0Y2hlcnNbIGlkeCBdXG4gICAgICAucGlwZSBELiRvbl9lbmQgKCBlbmQgKSA9PlxuICAgICAgICBULmVxIGNvdW50LCBtYXRjaGVycy5sZW5ndGhcbiAgICAgICAgZW5kKClcbiAgICAgICAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZWFkIHdpdGggc3ViLXJlYWQgKDEpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHByb2Jlc19pZHggID0gMFxuICBpZHggICAgICAgICA9IC0xXG4gIGNvdW50ICAgICAgID0gMFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIG1hdGNoZXJzID0gW1xuICAgIFsgJ/Cnt58nLCBbICdzcG8nLCAn5YWrJywgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCAnMzQnIF0gXVxuICAgIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBAX2ZlZWRfdGVzdF9kYXRhIGRiLCBwcm9iZXNfaWR4LCByZXN1bWVcbiAgICBwcmVmaXggICAgPSBbICdzcG8nLCAn8Ke3nycsICdndWlkZS91Y2hyL2hhcycsIF1cbiAgICBpbnB1dCAgICAgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgcHJlZml4XG4gICAgc2V0dGluZ3MgID0geyBpbmRleGVkOiBubywgfVxuICAgIGlucHV0XG4gICAgICAucGlwZSBIT0xMRVJJVEgucmVhZF9zdWIgZGIsIHNldHRpbmdzLCAoIFsgcGhyYXNldHlwZSwgZ2x5cGgsIHByZCwgZ3VpZGVzLCBdICkgPT5cbiAgICAgICAgc3ViX2lucHV0ID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIFsgJ3NwbycsIGd1aWRlc1sgMCBdLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsIF1cbiAgICAgICAgcmV0dXJuIFsgZ2x5cGgsIHN1Yl9pbnB1dCwgXVxuICAgICAgLnBpcGUgJCAoIHBocmFzZSwgc2VuZCApID0+XG4gICAgICAgIGNvdW50ICArPSArMVxuICAgICAgICBpZHggICAgKz0gKzFcbiAgICAgICAgVC5lcSBwaHJhc2UsIG1hdGNoZXJzWyBpZHggXVxuICAgICAgLnBpcGUgRC4kb25fZW5kICggZW5kICkgPT5cbiAgICAgICAgVC5lcSBjb3VudCwgbWF0Y2hlcnMubGVuZ3RoXG4gICAgICAgIGVuZCgpXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCB3aXRoIHN1Yi1yZWFkICgyKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ICAgICAgICAgPSAtMVxuICBjb3VudCAgICAgICA9IDBcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBtYXRjaGVycyA9IFtcbiAgICBbICfwp7efJywgWyAnc3BvJywgJ+WFqycsICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgJzM0JyBdIF1cbiAgICBbICfwp7efJywgWyAnc3BvJywgJ+WIgCcsICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgJzUoMTIpMycgXSBdXG4gICAgWyAn8Ke3nycsIFsgJ3NwbycsICflroAnLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICc0NCcgXSBdXG4gICAgWyAn8Ke3nycsIFsgJ3NwbycsICfosp0nLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICcyNSgxMiknIF0gXVxuICAgIFsgJ/Cnt58nLCBbICdzcG8nLCAn7oe6JywgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCAnMTInIF0gXVxuICAgIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBAX2ZlZWRfdGVzdF9kYXRhIGRiLCBwcm9iZXNfaWR4LCByZXN1bWVcbiAgICBwcmVmaXggICAgPSBbICdwb3MnLCAnZ3VpZGUvdWNoci9oYXMnLCBdXG4gICAgaW5wdXQgICAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIHByZWZpeFxuICAgIHNldHRpbmdzICA9IHsgaW5kZXhlZDogbm8sIH1cbiAgICBpbnB1dFxuICAgICAgLnBpcGUgSE9MTEVSSVRILnJlYWRfc3ViIGRiLCBzZXR0aW5ncywgKCBwaHJhc2UgKSA9PlxuICAgICAgICBbIF8sIGdseXBoLCBwcmQsIGd1aWRlLCBdID0gcGhyYXNlXG4gICAgICAgIHByZWZpeCAgICAgICAgICAgICAgICAgICAgPSBbICdzcG8nLCBndWlkZSwgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCBdXG4gICAgICAgIHN1Yl9pbnB1dCAgICAgICAgICAgICAgICAgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgcHJlZml4XG4gICAgICAgIHJldHVybiBbIGdseXBoLCBzdWJfaW5wdXQsIF1cbiAgICAgIC5waXBlICQgKCBwaHJhc2UsIHNlbmQgKSA9PlxuICAgICAgICBkZWJ1ZyAnwqlxdVBiZycsIEpTT04uc3RyaW5naWZ5IHBocmFzZVxuICAgICAgICBjb3VudCAgKz0gKzFcbiAgICAgICAgaWR4ICAgICs9ICsxXG4gICAgICAgIFQuZXEgcGhyYXNlLCBtYXRjaGVyc1sgaWR4IF1cbiAgICAgIC5waXBlIEQuJG9uX2VuZCAoIGVuZCApID0+XG4gICAgICAgIFQuZXEgY291bnQsIG1hdGNoZXJzLmxlbmd0aFxuICAgICAgICBlbmQoKVxuICAgICAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgd2l0aCBzdWItcmVhZCAoMylcIiBdID0gKCBULCBkb25lICkgLT5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgQF9yZWFkX3dpdGhfc3ViX3JlYWRfMyBULCBiYXRjaDogMCwgICAgcmVzdW1lXG4gICAgeWllbGQgQF9yZWFkX3dpdGhfc3ViX3JlYWRfMyBULCBiYXRjaDogMywgICAgcmVzdW1lXG4gICAgeWllbGQgQF9yZWFkX3dpdGhfc3ViX3JlYWRfMyBULCBiYXRjaDogNSwgICAgcmVzdW1lXG4gICAgeWllbGQgQF9yZWFkX3dpdGhfc3ViX3JlYWRfMyBULCBiYXRjaDogMTAwMCwgcmVzdW1lXG4gICAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9yZWFkX3dpdGhfc3ViX3JlYWRfMyA9ICggVCwgd3JpdGVfc2V0dGluZ3MsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ICAgICAgICAgPSAtMVxuICBjb3VudCAgICAgICA9IDBcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBtYXRjaGVycyA9IFtcbiAgICBbW1wi8Ke3n1wiLFwi5YWrXCIsXCIzNFwiXSwgICAgICBbXCJzcG9cIixcIuWFq1wiLFwicmFuay9janRcIiwxMjU0MV1dXG4gICAgW1tcIvCnt59cIixcIuWIgFwiLFwiNSgxMikzXCJdLCAgW1wic3BvXCIsXCLliIBcIixcInJhbmsvY2p0XCIsMTI1NDJdXVxuICAgIFtbXCLwp7efXCIsXCLlroBcIixcIjQ0XCJdLCAgICAgIFtcInNwb1wiLFwi5a6AXCIsXCJyYW5rL2NqdFwiLDEyNTQzXV1cbiAgICBbW1wi8Ke3n1wiLFwi6LKdXCIsXCIyNSgxMilcIl0sICBbXCJzcG9cIixcIuiynVwiLFwicmFuay9janRcIiwxMjU0NV1dXG4gICAgW1tcIvCnt59cIixcIu6HulwiLFwiMTJcIl0sICAgICAgW1wic3BvXCIsXCLuh7pcIixcInJhbmsvY2p0XCIsMTI1NDRdXVxuICAgIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBAX2ZlZWRfdGVzdF9kYXRhIGRiLCBwcm9iZXNfaWR4LCB3cml0ZV9zZXR0aW5ncywgcmVzdW1lXG4gICAgcHJlZml4ICAgICAgICA9IFsgJ3BvcycsICdndWlkZS91Y2hyL2hhcycsIF1cbiAgICBpbnB1dCAgICAgICAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIHByZWZpeFxuICAgIHJlYWRfc2V0dGluZ3MgPSB7IGluZGV4ZWQ6IG5vLCB9XG4gICAgaW5wdXRcbiAgICAgIC5waXBlIEhPTExFUklUSC5yZWFkX3N1YiBkYiwgcmVhZF9zZXR0aW5ncywgKCBwaHJhc2UgKSA9PlxuICAgICAgICBbIF8sIGdseXBoLCBwcmQsIGd1aWRlLCBdID0gcGhyYXNlXG4gICAgICAgIHByZWZpeCAgICAgICAgICAgICAgICAgICAgPSBbICdzcG8nLCBndWlkZSwgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCBdXG4gICAgICAgIHN1Yl9pbnB1dCAgICAgICAgICAgICAgICAgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgcHJlZml4XG4gICAgICAgIHJldHVybiBbIGdseXBoLCBzdWJfaW5wdXQsIF1cbiAgICAgIC5waXBlIEhPTExFUklUSC5yZWFkX3N1YiBkYiwgcmVhZF9zZXR0aW5ncywgKCB4cGhyYXNlICkgPT5cbiAgICAgICAgWyBnbHlwaCwgWyBfLCBndWlkZSwgcHJkLCBzaGFwZWNsYXNzLCBdIF0gPSB4cGhyYXNlXG4gICAgICAgIHByZWZpeCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gWyAnc3BvJywgZ3VpZGUsICdyYW5rL2NqdCcsIF1cbiAgICAgICAgc3ViX2lucHV0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgcHJlZml4XG4gICAgICAgIHJldHVybiBbIFsgZ2x5cGgsIGd1aWRlLCBzaGFwZWNsYXNzLCBdLCBzdWJfaW5wdXQsIF1cbiAgICAgIC5waXBlICQgKCB4cGhyYXNlLCBzZW5kICkgPT5cbiAgICAgICAgZGVidWcgJ8KpcXVQYmcnLCBKU09OLnN0cmluZ2lmeSB4cGhyYXNlXG4gICAgICAgIGNvdW50ICArPSArMVxuICAgICAgICBpZHggICAgKz0gKzFcbiAgICAgICAgVC5lcSB4cGhyYXNlLCBtYXRjaGVyc1sgaWR4IF1cbiAgICAgIC5waXBlIEQuJG9uX2VuZCAoIGVuZCApID0+XG4gICAgICAgIFQuZXEgY291bnQsIG1hdGNoZXJzLmxlbmd0aFxuICAgICAgICBlbmQoKVxuICAgICAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInNvcnRpbmcgKDEpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHNldHRpbmdzID1cbiAgICAgIGRiOiAgICAgICAgICAgbGV2ZWxkb3duXG4gICAgICBrZXlFbmNvZGluZzogICdiaW5hcnknXG4gICAgbGV2ZWxkYiA9IGxldmVsdXAgJy90bXAvaG9sbGVyaXRoMi10ZXN0Jywgc2V0dGluZ3NcbiAgICB5aWVsZCBjbGVhcl9sZXZlbGRiIGxldmVsZGIsIHJlc3VtZVxuICAgIHByb2JlcyA9IFtcbiAgICAgICdhJ1xuICAgICAgJ2FiJ1xuICAgICAgJ2FiYydcbiAgICAgICdhYmNcXHgwMCdcbiAgICAgICdhYmNcXHgwMGEnXG4gICAgICAnYWJjYSdcbiAgICAgICdhYmNiJ1xuICAgICAgJ2FiY2MnXG4gICAgICAnYWJjZCdcbiAgICAgICdhYmNkZSdcbiAgICAgICdhYmNkZWYnXG4gICAgICAnYWJjZGVmZycgXVxuICAgIG1hdGNoZXJzID0gW1xuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCAweDYyLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgMHg2MiwgMHg2MywgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIDB4NjIsIDB4NjMsIDB4MDAsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCAweDYyLCAweDYzLCAweDAwLCAweDYxLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgMHg2MiwgMHg2MywgMHg2MSwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIDB4NjIsIDB4NjMsIDB4NjIsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCAweDYyLCAweDYzLCAweDYzLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgMHg2MiwgMHg2MywgMHg2NCwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIDB4NjIsIDB4NjMsIDB4NjQsIDB4NjUsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCAweDYyLCAweDYzLCAweDY0LCAweDY1LCAweDY2LCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgMHg2MiwgMHg2MywgMHg2NCwgMHg2NSwgMHg2NiwgMHg2NywgXSBdXG4gICAgQ05ELnNodWZmbGUgcHJvYmVzXG4gICAgZm9yIHByb2JlIGluIHByb2Jlc1xuICAgICAgcHJvYmVfYmZyID0gbmV3IEJ1ZmZlciBwcm9iZSwgJ3V0Zi04J1xuICAgICAgeWllbGQgbGV2ZWxkYi5wdXQgcHJvYmVfYmZyLCAnMScsIHJlc3VtZVxuICAgICAgcHJvYmVfYmZycyA9IHlpZWxkIHJlYWRfYWxsX2tleXMgbGV2ZWxkYiwgcmVzdW1lXG4gICAgcHJvYmVfYmZycyA9IHlpZWxkIHJlYWRfYWxsX2tleXMgbGV2ZWxkYiwgcmVzdW1lXG4gICAgIyBkZWJ1ZyAnwqlSWFB2dicsICdcXG4nICsgcnByIHByb2JlX2JmcnNcbiAgICBmb3IgcHJvYmVfYmZyLCBwcm9iZV9pZHggaW4gcHJvYmVfYmZyc1xuICAgICAgbWF0Y2hlciA9IG1hdGNoZXJzWyBwcm9iZV9pZHggXVxuICAgICAgIyMjIFRBSU5UIGxvb2tzIGxpa2UgYFQuZXEgYnVmZmVyMSwgYnVmZmVyMmAgZG9lc24ndCB3b3JrLS0tc29tZXRpbWVzLi4uICMjI1xuICAgICAgIyBULmVxIHByb2JlX2JmciwgbWF0Y2hlclxuICAgICAgVC5vayBwcm9iZV9iZnIuZXF1YWxzIG1hdGNoZXJcbiAgICBsZXZlbGRiLmNsb3NlIC0+IGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwic29ydGluZyAoMilcIiBdID0gKCBULCBkb25lICkgLT5cbiAgIyMjIFRoaXMgdGVzdCBpcyBoZXJlIGJlY2F1c2UgdGhlcmUgc2VlbWVkIHRvIG9jY3VyIHNvbWUgc3RyYW5nZSBvcmRlcmluZyBpc3N1ZXMgd2hlblxuICB1c2luZyBtZW1kb3duIGluc3RlYWQgb2YgbGV2ZWxkb3duICMjI1xuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICBzZXR0aW5ncyA9XG4gICAgICBkYjogICAgICAgICAgIGxldmVsZG93blxuICAgICAga2V5RW5jb2Rpbmc6ICAnYmluYXJ5J1xuICAgIGxldmVsZGIgPSBsZXZlbHVwICcvdG1wL2hvbGxlcml0aDItdGVzdCcsIHNldHRpbmdzXG4gICAgeWllbGQgY2xlYXJfbGV2ZWxkYiBsZXZlbGRiLCByZXN1bWVcbiAgICBwcm9iZXMgPSBbXG4gICAgICBuZXcgQnVmZmVyIFsgMHgwMCwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4MDEsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDAyLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHgwMywgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4ZjksIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweGZhLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHhmYiwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4ZmMsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweGZkLCBdXG4gICAgICBdXG4gICAgbWF0Y2hlcnMgPSAoIHByb2JlIGZvciBwcm9iZSBpbiBwcm9iZXMgKVxuICAgIENORC5zaHVmZmxlIHByb2Jlc1xuICAgIGZvciBwcm9iZSBpbiBwcm9iZXNcbiAgICAgIHlpZWxkIGxldmVsZGIucHV0IHByb2JlLCAnMScsIHJlc3VtZVxuICAgIHByb2JlX2JmcnMgPSB5aWVsZCByZWFkX2FsbF9rZXlzIGxldmVsZGIsIHJlc3VtZVxuICAgIGZvciBwcm9iZV9iZnIsIHByb2JlX2lkeCBpbiBwcm9iZV9iZnJzXG4gICAgICBtYXRjaGVyID0gbWF0Y2hlcnNbIHByb2JlX2lkeCBdXG4gICAgICAjIGRlYnVnICfCqTE1MDYwJywgcHJvYmVfaWR4LCBwcm9iZV9iZnIsIG1hdGNoZXJcbiAgICAgICMjIyBUQUlOVCBsb29rcyBsaWtlIGBULmVxIGJ1ZmZlcjEsIGJ1ZmZlcjJgIGRvZXNuJ3Qgd29yay0tLXNvbWV0aW1lcy4uLiAjIyNcbiAgICAgIFQub2sgcHJvYmVfYmZyLmVxdWFscyBtYXRjaGVyXG4gICAgbGV2ZWxkYi5jbG9zZSAtPiBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcIkgyIGNvZGVjIGBlbmNvZGVgIHRocm93cyBvbiBhbnl0aGluZyBidXQgYSBsaXN0XCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIFQudGhyb3dzIFwiZXhwZWN0ZWQgYSBsaXN0LCBnb3QgYSB0ZXh0XCIsICAgICAgICAgKCAtPiBDT0RFQy5lbmNvZGUgJ3VuYWNjYXB0YWJsZScgKVxuICBULnRocm93cyBcImV4cGVjdGVkIGEgbGlzdCwgZ290IGEgbnVtYmVyXCIsICAgICAgICggLT4gQ09ERUMuZW5jb2RlIDQyIClcbiAgVC50aHJvd3MgXCJleHBlY3RlZCBhIGxpc3QsIGdvdCBhIGJvb2xlYW5cIiwgICAgICAoIC0+IENPREVDLmVuY29kZSB0cnVlIClcbiAgVC50aHJvd3MgXCJleHBlY3RlZCBhIGxpc3QsIGdvdCBhIGJvb2xlYW5cIiwgICAgICAoIC0+IENPREVDLmVuY29kZSBmYWxzZSApXG4gIFQudGhyb3dzIFwiZXhwZWN0ZWQgYSBsaXN0LCBnb3QgYSBqc3VuZGVmaW5lZFwiLCAgKCAtPiBDT0RFQy5lbmNvZGUoKSApXG4gIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwic29ydCB0ZXh0cyB3aXRoIEgyIGNvZGVjICgxKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICBzZXR0aW5ncyA9XG4gICAgICBkYjogICAgICAgICAgIGxldmVsZG93blxuICAgICAga2V5RW5jb2Rpbmc6ICAnYmluYXJ5J1xuICAgIGxldmVsZGIgPSBsZXZlbHVwICcvdG1wL2hvbGxlcml0aDItdGVzdCcsIHNldHRpbmdzXG4gICAgeWllbGQgY2xlYXJfbGV2ZWxkYiBsZXZlbGRiLCByZXN1bWVcbiAgICBwcm9iZXMgPSBbXG4gICAgICAnYSdcbiAgICAgICdhYidcbiAgICAgICdhYmMnXG4gICAgICAnYWJjXFx4MDAnXG4gICAgICAnYWJjXFx4MDBhJ1xuICAgICAgJ2FiY2EnXG4gICAgICAnYWJjYVxceDAwJ1xuICAgICAgJ2FiY2InXG4gICAgICAnYWJjYydcbiAgICAgICdhYmNkJ1xuICAgICAgJ2FiY2RlJ1xuICAgICAgJ2FiY2RlZidcbiAgICAgICdhYmNkZWZnJ1xuICAgICAgXVxuICAgIG1hdGNoZXJzID0gKCBbIHByb2JlLCBdIGZvciBwcm9iZSBpbiBwcm9iZXMgKVxuICAgIENORC5zaHVmZmxlIHByb2Jlc1xuICAgIGZvciBwcm9iZSBpbiBwcm9iZXNcbiAgICAgIHlpZWxkIGxldmVsZGIucHV0ICggQ09ERUMuZW5jb2RlIFsgcHJvYmUsIF0gKSwgJzEnLCByZXN1bWVcbiAgICBwcm9iZV9iZnJzICA9IHlpZWxkIHJlYWRfYWxsX2tleXMgbGV2ZWxkYiwgcmVzdW1lXG4gICAgcHJvYmVzICAgICAgPSAoIENPREVDLmRlY29kZSBwcm9iZV9iZnIgZm9yIHByb2JlX2JmciBpbiBwcm9iZV9iZnJzIClcbiAgICBzaG93X2tleXNfYW5kX2tleV9iZnJzIHByb2JlcywgcHJvYmVfYmZyc1xuICAgIGZvciBwcm9iZSwgcHJvYmVfaWR4IGluIHByb2Jlc1xuICAgICAgbWF0Y2hlciA9IG1hdGNoZXJzWyBwcm9iZV9pZHggXVxuICAgICAgVC5lcSBwcm9iZSwgbWF0Y2hlclxuICAgIGxldmVsZGIuY2xvc2UgLT4gZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJzb3J0IHRleHRzIHdpdGggSDIgY29kZWMgKDIpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHNldHRpbmdzID1cbiAgICAgIGRiOiAgICAgICAgICAgbGV2ZWxkb3duXG4gICAgICBrZXlFbmNvZGluZzogICdiaW5hcnknXG4gICAgbGV2ZWxkYiA9IGxldmVsdXAgJy90bXAvaG9sbGVyaXRoMi10ZXN0Jywgc2V0dGluZ3NcbiAgICB5aWVsZCBjbGVhcl9sZXZlbGRiIGxldmVsZGIsIHJlc3VtZVxuICAgIHByb2JlcyA9IFtcbiAgICAgICcnXG4gICAgICAnICdcbiAgICAgICdhJ1xuICAgICAgJ2FiYydcbiAgICAgICfkuIAnXG4gICAgICAn5LiA5LqMJ1xuICAgICAgJ+S4gOS6jOS4iSdcbiAgICAgICfkuIknXG4gICAgICAn5LqMJ1xuICAgICAgJ/CggIAnXG4gICAgICAn8KCAgFxceDAwJ1xuICAgICAgJ/CggIBhJ1xuICAgICAgJ/CqnIAnXG4gICAgICAn8KudgCdcbiAgICAgIFN0cmluZy5mcm9tQ29kZVBvaW50IDB4MTBmZmZmXG4gICAgICBdXG4gICAgbWF0Y2hlcnMgPSAoIFsgcHJvYmUsIF0gZm9yIHByb2JlIGluIHByb2JlcyApXG4gICAgQ05ELnNodWZmbGUgcHJvYmVzXG4gICAgZm9yIHByb2JlIGluIHByb2Jlc1xuICAgICAgcHJvYmVfYmZyID0gQ09ERUMuZW5jb2RlIFsgcHJvYmUsIF1cbiAgICAgIHlpZWxkIGxldmVsZGIucHV0IHByb2JlX2JmciwgJzEnLCByZXN1bWVcbiAgICBwcm9iZV9iZnJzICA9IHlpZWxkIHJlYWRfYWxsX2tleXMgbGV2ZWxkYiwgcmVzdW1lXG4gICAgIyBkZWJ1ZyAnwqlGZDVpdycsIHByb2JlX2JmcnNcbiAgICBwcm9iZXMgICAgICA9ICggQ09ERUMuZGVjb2RlIHByb2JlX2JmciBmb3IgcHJvYmVfYmZyIGluIHByb2JlX2JmcnMgKVxuICAgIHNob3dfa2V5c19hbmRfa2V5X2JmcnMgcHJvYmVzLCBwcm9iZV9iZnJzXG4gICAgZm9yIHByb2JlLCBwcm9iZV9pZHggaW4gcHJvYmVzXG4gICAgICBtYXRjaGVyID0gbWF0Y2hlcnNbIHByb2JlX2lkeCBdXG4gICAgICBULmVxIHByb2JlLCBtYXRjaGVyXG4gICAgbGV2ZWxkYi5jbG9zZSAtPiBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInNvcnQgbnVtYmVycyB3aXRoIEgyIGNvZGVjICgxKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICBzZXR0aW5ncyA9XG4gICAgICBkYjogICAgICAgICAgIGxldmVsZG93blxuICAgICAga2V5RW5jb2Rpbmc6ICAnYmluYXJ5J1xuICAgIGxldmVsZGIgPSBsZXZlbHVwICcvdG1wL2hvbGxlcml0aDItdGVzdCcsIHNldHRpbmdzXG4gICAgeWllbGQgY2xlYXJfbGV2ZWxkYiBsZXZlbGRiLCByZXN1bWVcbiAgICBwcm9iZXNfYW5kX2Rlc2NyaXB0aW9ucyA9IFtcbiAgICAgIFsgLUluZmluaXR5LCAgICAgICAgICAgICAgIFwiLUluZmluaXR5XCIgICAgICAgICAgICAgICBdXG4gICAgICBbIC1OdW1iZXIuTUFYX1ZBTFVFLCAgICAgICBcIi1OdW1iZXIuTUFYX1ZBTFVFXCIgICAgICAgXVxuICAgICAgWyBOdW1iZXIuTUlOX1NBRkVfSU5URUdFUiwgXCJOdW1iZXIuTUlOX1NBRkVfSU5URUdFUlwiIF1cbiAgICAgIFsgLTEyMzQ1Njc4OSwgICAgICAgICAgICAgIFwiLTEyMzQ1Njc4OVwiICAgICAgICAgICAgICBdXG4gICAgICBbIC0zLCAgICAgICAgICAgICAgICAgICAgICBcIi0zXCIgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgWyAtMiwgICAgICAgICAgICAgICAgICAgICAgXCItMlwiICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgIFsgLTEuNSwgICAgICAgICAgICAgICAgICAgIFwiLTEuNVwiICAgICAgICAgICAgICAgICAgICBdXG4gICAgICBbIC0xLCAgICAgICAgICAgICAgICAgICAgICBcIi0xXCIgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgWyAtTnVtYmVyLkVQU0lMT04sICAgICAgICAgXCItTnVtYmVyLkVQU0lMT05cIiAgICAgICAgIF1cbiAgICAgIFsgLU51bWJlci5NSU5fVkFMVUUsICAgICAgIFwiLU51bWJlci5NSU5fVkFMVUVcIiAgICAgICBdXG4gICAgICBbIDAsICAgICAgICAgICAgICAgICAgICAgICBcIjBcIiAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgWyArTnVtYmVyLk1JTl9WQUxVRSwgICAgICAgXCIrTnVtYmVyLk1JTl9WQUxVRVwiICAgICAgIF1cbiAgICAgIFsgK051bWJlci5FUFNJTE9OLCAgICAgICAgIFwiK051bWJlci5FUFNJTE9OXCIgICAgICAgICBdXG4gICAgICBbICsxLCAgICAgICAgICAgICAgICAgICAgICBcIisxXCIgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgWyArMS41LCAgICAgICAgICAgICAgICAgICAgXCIrMS41XCIgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgIFsgKzIsICAgICAgICAgICAgICAgICAgICAgIFwiKzJcIiAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICBbICszLCAgICAgICAgICAgICAgICAgICAgICBcIiszXCIgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgWyArMTIzNDU2Nzg5LCAgICAgICAgICAgICAgXCIrMTIzNDU2Nzg5XCIgICAgICAgICAgICAgIF1cbiAgICAgIFsgTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIsIFwiTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVJcIiBdXG4gICAgICBbIE51bWJlci5NQVhfVkFMVUUsICAgICAgICBcIk51bWJlci5NQVhfVkFMVUVcIiAgICAgICAgXVxuICAgICAgWyArSW5maW5pdHksICAgICAgICAgICAgICAgXCIrSW5maW5pdHlcIiAgICAgICAgICAgICAgIF1cbiAgICAgIF1cbiAgICAjIHByb2Jlc19hbmRfZGVzY3JpcHRpb25zLnNvcnQgKCBhLCBiICkgLT5cbiAgICAjICAgcmV0dXJuICsxIGlmIGFbIDAgXSA+IGJbIDAgXVxuICAgICMgICByZXR1cm4gLTEgaWYgYVsgMCBdIDwgYlsgMCBdXG4gICAgIyAgIHJldHVybiAgMFxuICAgIG1hdGNoZXJzICAgICAgPSAoIFsgcGFkWyAwIF0sIF0gZm9yIHBhZCBpbiBwcm9iZXNfYW5kX2Rlc2NyaXB0aW9ucyApXG4gICAgIyBkZXNjcmlwdGlvbnMgID0gKCBbIHBhZFsgMSBdLCBdIGZvciBwYWQgaW4gcHJvYmVzX2FuZF9kZXNjcmlwdGlvbnMgKVxuICAgIGZvciBwYWQgaW4gcHJvYmVzX2FuZF9kZXNjcmlwdGlvbnNcbiAgICAgIHVyZ2UgcGFkXG4gICAgQ05ELnNodWZmbGUgcHJvYmVzX2FuZF9kZXNjcmlwdGlvbnNcbiAgICBmb3IgWyBwcm9iZSwgXywgXSBpbiBwcm9iZXNfYW5kX2Rlc2NyaXB0aW9uc1xuICAgICAgcHJvYmVfYmZyID0gQ09ERUMuZW5jb2RlIFsgcHJvYmUsIF1cbiAgICAgIHlpZWxkIGxldmVsZGIucHV0IHByb2JlX2JmciwgJzEnLCByZXN1bWVcbiAgICBwcm9iZV9iZnJzICA9IHlpZWxkIHJlYWRfYWxsX2tleXMgbGV2ZWxkYiwgcmVzdW1lXG4gICAgcHJvYmVzICAgICAgPSAoIENPREVDLmRlY29kZSBwcm9iZV9iZnIgZm9yIHByb2JlX2JmciBpbiBwcm9iZV9iZnJzIClcbiAgICBzaG93X2tleXNfYW5kX2tleV9iZnJzIHByb2JlcywgcHJvYmVfYmZyc1xuICAgIGZvciBwcm9iZSwgcHJvYmVfaWR4IGluIHByb2Jlc1xuICAgICAgbWF0Y2hlciA9IG1hdGNoZXJzWyBwcm9iZV9pZHggXVxuICAgICAgVC5lcSBwcm9iZSwgbWF0Y2hlclxuICAgIGxldmVsZGIuY2xvc2UgLT4gZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJzb3J0IG1peGVkIHZhbHVlcyB3aXRoIEgyIGNvZGVjXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHNldHRpbmdzID1cbiAgICAgIGRiOiAgICAgICAgICAgbGV2ZWxkb3duXG4gICAgICBrZXlFbmNvZGluZzogICdiaW5hcnknXG4gICAgbGV2ZWxkYiA9IGxldmVsdXAgJy90bXAvaG9sbGVyaXRoMi10ZXN0Jywgc2V0dGluZ3NcbiAgICB5aWVsZCBjbGVhcl9sZXZlbGRiIGxldmVsZGIsIHJlc3VtZVxuICAgIHByb2JlcyA9IFtcbiAgICAgIG51bGxcbiAgICAgIGZhbHNlXG4gICAgICB0cnVlXG4gICAgICBDT0RFQ1sgJ3NlbnRpbmVscycgXVsgJ2ZpcnN0ZGF0ZScgXVxuICAgICAgbmV3IERhdGUgMFxuICAgICAgbmV3IERhdGUgOGUxMVxuICAgICAgbmV3IERhdGUoKVxuICAgICAgQ09ERUNbICdzZW50aW5lbHMnIF1bICdsYXN0ZGF0ZScgIF1cbiAgICAgIDEyMzRcbiAgICAgIEluZmluaXR5XG4gICAgICAnJ1xuICAgICAgJ+S4gCdcbiAgICAgICfkuIknXG4gICAgICAn5LqMJ1xuICAgICAgJ/CggIAnXG4gICAgICAn8KCAgFxceDAwJ1xuICAgICAgU3RyaW5nLmZyb21Db2RlUG9pbnQgMHgxMGZmZmZcbiAgICAgIF1cbiAgICBtYXRjaGVycyA9ICggWyBwcm9iZSwgXSBmb3IgcHJvYmUgaW4gcHJvYmVzIClcbiAgICBDTkQuc2h1ZmZsZSBwcm9iZXNcbiAgICBmb3IgcHJvYmUgaW4gcHJvYmVzXG4gICAgICBkZWJ1ZyAnwqlvTVhKWicsIHByb2JlXG4gICAgICBwcm9iZV9iZnIgPSBDT0RFQy5lbmNvZGUgWyBwcm9iZSwgXVxuICAgICAgeWllbGQgbGV2ZWxkYi5wdXQgcHJvYmVfYmZyLCAnMScsIHJlc3VtZVxuICAgIHByb2JlX2JmcnMgID0geWllbGQgcmVhZF9hbGxfa2V5cyBsZXZlbGRiLCByZXN1bWVcbiAgICAjIGRlYnVnICfCqUZkNWl3JywgcHJvYmVfYmZyc1xuICAgIHByb2JlcyAgICAgID0gKCBDT0RFQy5kZWNvZGUgcHJvYmVfYmZyIGZvciBwcm9iZV9iZnIgaW4gcHJvYmVfYmZycyApXG4gICAgc2hvd19rZXlzX2FuZF9rZXlfYmZycyBwcm9iZXMsIHByb2JlX2JmcnNcbiAgICBmb3IgcHJvYmUsIHByb2JlX2lkeCBpbiBwcm9iZXNcbiAgICAgIG1hdGNoZXIgPSBtYXRjaGVyc1sgcHJvYmVfaWR4IF1cbiAgICAgIFQuZXEgcHJvYmUsIG1hdGNoZXJcbiAgICBsZXZlbGRiLmNsb3NlIC0+IGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwic29ydCBsaXN0cyBvZiBtaXhlZCB2YWx1ZXMgd2l0aCBIMiBjb2RlY1wiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICBzZXR0aW5ncyA9XG4gICAgICBkYjogICAgICAgICAgIGxldmVsZG93blxuICAgICAga2V5RW5jb2Rpbmc6ICAnYmluYXJ5J1xuICAgIGxldmVsZGIgPSBsZXZlbHVwICcvdG1wL2hvbGxlcml0aDItdGVzdCcsIHNldHRpbmdzXG4gICAgeWllbGQgY2xlYXJfbGV2ZWxkYiBsZXZlbGRiLCByZXN1bWVcbiAgICBwcm9iZXMgPSBbXG4gICAgICBbIFwiXCIsICAgICAgICAgICAgICcnLCAgICAgICAgICAgICBdXG4gICAgICBbIFwiMTIzNFwiLCAgICAgICAgICAxMjM0LCAgICAgICAgICAgXVxuICAgICAgWyBcIkluZmluaXR5XCIsICAgICAgSW5maW5pdHksICAgICAgIF1cbiAgICAgIFsgXCJTdHJpbmcuZnJvbUNvZGVQb2ludCAweDEwZmZmZlwiLCBTdHJpbmcuZnJvbUNvZGVQb2ludCAweDEwZmZmZiBdXG4gICAgICBbIFwiZmFsc2VcIiwgICAgICAgICBmYWxzZSwgICAgICAgICAgXVxuICAgICAgWyBcIm5ldyBEYXRlIDBcIiwgICAgbmV3IERhdGUgMCwgICAgIF1cbiAgICAgIFsgXCJuZXcgRGF0ZSA4ZTExXCIsIG5ldyBEYXRlIDhlMTEsICBdXG4gICAgICBbIFwibmV3IERhdGUoKVwiLCAgICBuZXcgRGF0ZSgpLCAgICAgXVxuICAgICAgWyBcIm51bGxcIiwgICAgICAgICAgbnVsbCwgICAgICAgICAgIF1cbiAgICAgIFsgXCJ0cnVlXCIsICAgICAgICAgIHRydWUsICAgICAgICAgICBdXG4gICAgICBbIFwi5LiAXCIsICAgICAgICAgICAgJ+S4gCcsICAgICAgICAgICAgXVxuICAgICAgWyBcIuS4iVwiLCAgICAgICAgICAgICfkuIknLCAgICAgICAgICAgIF1cbiAgICAgIFsgXCLkuoxcIiwgICAgICAgICAgICAn5LqMJywgICAgICAgICAgICBdXG4gICAgICBbIFwi8KCAgFwiLCAgICAgICAgICAgICfwoICAJywgICAgICAgICAgICBdXG4gICAgICBbIFwi8KCAgFxceDAwXCIsICAgICAgICAn8KCAgFxceDAwJywgICAgICAgIF1cbiAgICAgIF1cbiAgICBtYXRjaGVycyA9ICggcHJvYmUgZm9yIHByb2JlIGluIHByb2JlcyApXG4gICAgQ05ELnNodWZmbGUgcHJvYmVzXG4gICAgZm9yIHByb2JlIGluIHByb2Jlc1xuICAgICAgZGVidWcgJ8Kpb01YSlonLCBwcm9iZVxuICAgICAgcHJvYmVfYmZyID0gQ09ERUMuZW5jb2RlIHByb2JlXG4gICAgICB5aWVsZCBsZXZlbGRiLnB1dCBwcm9iZV9iZnIsICcxJywgcmVzdW1lXG4gICAgcHJvYmVfYmZycyAgPSB5aWVsZCByZWFkX2FsbF9rZXlzIGxldmVsZGIsIHJlc3VtZVxuICAgICMgZGVidWcgJ8KpRmQ1aXcnLCBwcm9iZV9iZnJzXG4gICAgcHJvYmVzICAgICAgPSAoIENPREVDLmRlY29kZSBwcm9iZV9iZnIgZm9yIHByb2JlX2JmciBpbiBwcm9iZV9iZnJzIClcbiAgICBzaG93X2tleXNfYW5kX2tleV9iZnJzIHByb2JlcywgcHJvYmVfYmZyc1xuICAgIGZvciBwcm9iZSwgcHJvYmVfaWR4IGluIHByb2Jlc1xuICAgICAgbWF0Y2hlciA9IG1hdGNoZXJzWyBwcm9iZV9pZHggXVxuICAgICAgVC5lcSBwcm9iZSwgbWF0Y2hlclxuICAgIGxldmVsZGIuY2xvc2UgLT4gZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJzb3J0IHJvdXRlcyB3aXRoIHZhbHVlcyAoMSlcIiBdID0gKCBULCBkb25lICkgLT5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgc2V0dGluZ3MgPVxuICAgICAgZGI6ICAgICAgICAgICBsZXZlbGRvd25cbiAgICAgIGtleUVuY29kaW5nOiAgJ2JpbmFyeSdcbiAgICBsZXZlbGRiID0gbGV2ZWx1cCAnL3RtcC9ob2xsZXJpdGgyLXRlc3QnLCBzZXR0aW5nc1xuICAgIHlpZWxkIGNsZWFyX2xldmVsZGIgbGV2ZWxkYiwgcmVzdW1lXG4gICAgcHJvYmVzID0gW1xuICAgICAgWyAncG9zJywgJ3N0cm9rZW9yZGVyJywgJzM1MjUxMzU1MzI1NCcsICAgICAgICAgICfwpL+vJywgXVxuICAgICAgWyAncG9zJywgJ3N0cm9rZW9yZGVyJywgJzM1MjUxNDExMjEnLCAgICAgICAgICAgICfwoLSmJywgXVxuICAgICAgWyAncG9zJywgJ3N0cm9rZW9yZGVyJywgJzM1MjUxNDU0JywgICAgICAgICAgICAgICfwqJKhJywgXVxuICAgICAgWyAncG9zJywgJ3N0cm9rZW9yZGVyJywgJzM1MjUxNTInLCAgICAgICAgICAgICAgICfpgq0nLCBdXG4gICAgICBbICdwb3MnLCAnc3Ryb2tlb3JkZXInLCAnMzUyNTE1MjUxMTE1MTE1MTEzNTQxJywgJ/CqmqsnLCBdXG4gICAgICBbICdwb3MnLCAnc3Ryb2tlb3JkZXInLCAnMzUyNTE1MjUxMTI1MTE1MTEnLCAgICAgJ/CqmqcnLCBdXG4gICAgICBbICdwb3MnLCAnc3Ryb2tlb3JkZXInLCAnMzUyNTE1MjUxMjE0MjUxMjE0JywgICAgJ/CnkbQnLCBdXG4gICAgICBbICdwb3MnLCAnc3Ryb2tlb3JkZXInLCAnMzUyNTE1MycsICAgICAgICAgICAgICAgJ+WKrCcsIF1cbiAgICAgIFsgJ3BvcycsICdzdHJva2VvcmRlcicsICczNTI1MTUzXFx4MDAnLCAgICAgICAgICAgICAgICfliqwnLCBdXG4gICAgICBbICdwb3MnLCAnc3Ryb2tlb3JkZXJcXHgwMCcsICczNTI1MTM1NTMyNTQnLCAgICAgICAgICAn8KS/rycsIF1cbiAgICAgIF1cbiAgICBtYXRjaGVycyA9ICggcHJvYmUgZm9yIHByb2JlIGluIHByb2JlcyApXG4gICAgQ05ELnNodWZmbGUgcHJvYmVzXG4gICAgZm9yIHByb2JlIGluIHByb2Jlc1xuICAgICAgcHJvYmVfYmZyID0gQ09ERUMuZW5jb2RlIHByb2JlXG4gICAgICB5aWVsZCBsZXZlbGRiLnB1dCBwcm9iZV9iZnIsICcxJywgcmVzdW1lXG4gICAgcHJvYmVfYmZycyAgPSB5aWVsZCByZWFkX2FsbF9rZXlzIGxldmVsZGIsIHJlc3VtZVxuICAgICMgZGVidWcgJ8KpRmQ1aXcnLCBwcm9iZV9iZnJzXG4gICAgcHJvYmVzICAgICAgPSAoIENPREVDLmRlY29kZSBwcm9iZV9iZnIgZm9yIHByb2JlX2JmciBpbiBwcm9iZV9iZnJzIClcbiAgICBzaG93X2tleXNfYW5kX2tleV9iZnJzIHByb2JlcywgcHJvYmVfYmZyc1xuICAgIGZvciBwcm9iZSwgcHJvYmVfaWR4IGluIHByb2Jlc1xuICAgICAgbWF0Y2hlciA9IG1hdGNoZXJzWyBwcm9iZV9pZHggXVxuICAgICAgVC5lcSBwcm9iZSwgbWF0Y2hlclxuICAgIGxldmVsZGIuY2xvc2UgLT4gZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJzb3J0IHJvdXRlcyB3aXRoIHZhbHVlcyAoMilcIiBdID0gKCBULCBkb25lICkgLT5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgc2V0dGluZ3MgPVxuICAgICAgZGI6ICAgICAgICAgICBsZXZlbGRvd25cbiAgICAgIGtleUVuY29kaW5nOiAgJ2JpbmFyeSdcbiAgICBsZXZlbGRiID0gbGV2ZWx1cCAnL3RtcC9ob2xsZXJpdGgyLXRlc3QnLCBzZXR0aW5nc1xuICAgIHlpZWxkIGNsZWFyX2xldmVsZGIgbGV2ZWxkYiwgcmVzdW1lXG4gICAgcHJvYmVzID0gW1xuICAgICAgWyAnYScsICAgICAgbnVsbCwgXVxuICAgICAgWyAnYScsICAgICAgZmFsc2UsIF1cbiAgICAgIFsgJ2EnLCAgICAgIHRydWUsIF1cbiAgICAgIFsgJ2EnLCAgICAgIG5ldyBEYXRlKCksIF1cbiAgICAgIFsgJ2EnLCAgICAgIC1JbmZpbml0eSwgXVxuICAgICAgWyAnYScsICAgICAgKzEyMzQsIF1cbiAgICAgIFsgJ2EnLCAgICAgICtJbmZpbml0eSwgXVxuICAgICAgWyAnYScsICAgICAgJ2InLCBdXG4gICAgICBbICdhJywgICAgICAnYlxceDAwJywgXVxuICAgICAgWyAnYVxceDAwJywgICsxMjM0LCBdXG4gICAgICBbICdhXFx4MDAnLCAgJ2InLCBdXG4gICAgICBbICdhYScsICAgICArMTIzNCwgXVxuICAgICAgWyAnYWEnLCAgICAgJ2InLCBdXG4gICAgICBbICdhYScsICAgICAnYlxceDAwJywgXVxuICAgICAgXVxuICAgIG1hdGNoZXJzID0gKCBwcm9iZSBmb3IgcHJvYmUgaW4gcHJvYmVzIClcbiAgICBDTkQuc2h1ZmZsZSBwcm9iZXNcbiAgICBmb3IgcHJvYmUgaW4gcHJvYmVzXG4gICAgICBwcm9iZV9iZnIgPSBDT0RFQy5lbmNvZGUgcHJvYmVcbiAgICAgIHlpZWxkIGxldmVsZGIucHV0IHByb2JlX2JmciwgJzEnLCByZXN1bWVcbiAgICBwcm9iZV9iZnJzICA9IHlpZWxkIHJlYWRfYWxsX2tleXMgbGV2ZWxkYiwgcmVzdW1lXG4gICAgIyBkZWJ1ZyAnwqlGZDVpdycsIHByb2JlX2JmcnNcbiAgICBwcm9iZXMgICAgICA9ICggQ09ERUMuZGVjb2RlIHByb2JlX2JmciBmb3IgcHJvYmVfYmZyIGluIHByb2JlX2JmcnMgKVxuICAgIHNob3dfa2V5c19hbmRfa2V5X2JmcnMgcHJvYmVzLCBwcm9iZV9iZnJzXG4gICAgZm9yIHByb2JlLCBwcm9iZV9pZHggaW4gcHJvYmVzXG4gICAgICBtYXRjaGVyID0gbWF0Y2hlcnNbIHByb2JlX2lkeCBdXG4gICAgICBULmVxIHByb2JlLCBtYXRjaGVyXG4gICAgbGV2ZWxkYi5jbG9zZSAtPiBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgc2FtcGxlIGRhdGFcIiBdID0gKCBULCBkb25lICkgLT5cbiAgcHJvYmVzX2lkeCAgPSAyXG4gIGlkeCA9IC0xXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIGRlYnVnICfCqWJVSmhJJywgJ1hYJ1xuICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHJlc3VtZVxuICAgIGRlYnVnICfCqVBSekE1JywgJ1hYJ1xuICAgIGlucHV0ID0gZGJbICclc2VsZicgXS5jcmVhdGVSZWFkU3RyZWFtKClcbiAgICBpbnB1dFxuICAgICAgLnBpcGUgRC4kc2hvdygpXG4gICAgICAucGlwZSAkICggeyBrZXksIHZhbHVlLCB9LCBzZW5kICkgPT4gc2VuZCBbIGtleSwgdmFsdWUsIF1cbiAgICAgIC5waXBlICQgKCBbIGtleSwgdmFsdWUsIF0sIHNlbmQgKSA9PiBzZW5kIFsga2V5LCB2YWx1ZSwgXSB1bmxlc3MgSE9MTEVSSVRILl9pc19tZXRhIGRiLCBrZXlcbiAgICAgIC5waXBlICQgKCBbIGtleSwgdmFsdWUsIF0sIHNlbmQgKSA9PlxuICAgICAgICAjIGRlYnVnICfCqVJsdWhGJywgKCBIT0xMRVJJVEguQ09ERUMuZGVjb2RlIGtleSApLCAoIEpTT04ucGFyc2UgdmFsdWUgKVxuICAgICAgICBzZW5kIFsga2V5LCB2YWx1ZSwgXVxuICAgICAgLnBpcGUgRC4kY29sbGVjdCgpXG4gICAgICAucGlwZSAkICggZmFjZXRzLCBzZW5kICkgPT5cbiAgICAgICAgaGVscCAnXFxuJyArIEhPTExFUklUSC5EVU1QLnJwcl9vZl9mYWNldHMgZGIsIGZhY2V0c1xuICAgICAgICBidWZmZXIgPSBuZXcgQnVmZmVyIEpTT04uc3RyaW5naWZ5IFsgJ+W8gCcsICflvaEnIF1cbiAgICAgICAgZGVidWcgJ8KpR0pmTDYnLCBIT0xMRVJJVEguRFVNUC5ycHJfb2ZfYnVmZmVyIG51bGwsIGJ1ZmZlclxuICAgICAgLnBpcGUgRC4kb25fZW5kID0+IGRvbmUoKVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHJldHVybiBudWxsXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZWFkIGFuZCB3cml0ZSBrZXlzIHdpdGggbGlzdHNcIiBdID0gKCBULCBkb25lICkgLT5cbiAgcHJvYmVzX2lkeCAgPSAwXG4gIGlkeCAgICAgICAgID0gLTFcbiAgY291bnQgICAgICAgPSAwXG4gIHByb2JlcyAgICAgID0gW1xuICAgIFsgJ2EnLCAxLCBdXG4gICAgWyAnYScsIFtdLCBdXG4gICAgWyAnYScsIFsgMSwgXSwgXVxuICAgIFsgJ2EnLCBbIHRydWUsIF0sIF1cbiAgICBbICdhJywgWyAneCcsICd5JywgJ2InLCBdLCBdXG4gICAgWyAnYScsIFsgMTIwLCAxIC8gMywgXSwgXVxuICAgIFsgJ2EnLCBbICd4JywgXSwgXVxuICAgIF1cbiAgbWF0Y2hlcnMgICAgPSAoIHByb2JlIGZvciBwcm9iZSBpbiBwcm9iZXMgKVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGZvciBwcm9iZSwgcHJvYmVfaWR4IGluIHByb2Jlc1xuICAgIGJ1ZmZlciA9IEhPTExFUklUSC5DT0RFQy5lbmNvZGUgcHJvYmVcbiAgICByZXN1bHQgPSBIT0xMRVJJVEguQ09ERUMuZGVjb2RlIGJ1ZmZlclxuICAgIFQuZXEgcmVzdWx0LCBtYXRjaGVyc1sgcHJvYmVfaWR4IF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgcGFydGlhbCBQT1MgcGhyYXNlc1wiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ICAgICAgICAgPSAtMVxuICBjb3VudCAgICAgICA9IDBcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBtYXRjaGVycyA9IFtcbiAgICBbICfwp7efMScsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgMSBdXG4gICAgWyAn8Ke3nzInLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDIgXVxuICAgIFsgJ/Cnt58zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAzIF1cbiAgICBbICfwp7efNCcsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgNCBdXG4gICAgWyAn8Ke3nycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgNSBdXG4gICAgWyAn8Ke3nzYnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDYgXVxuICAgIFsgJ/Cnt58nLCAnZ3VpZGUvdWNoci9oYXMnLCAn5YWrJywgMCBdXG4gICAgWyAn8Ke3nycsICdndWlkZS91Y2hyL2hhcycsICfliIAnLCAxIF1cbiAgICBbICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgJ+WugCcsIDIgXVxuICAgIFsgJ/Cnt58nLCAnZ3VpZGUvdWNoci9oYXMnLCAn6LKdJywgNCBdXG4gICAgWyAn8Ke3nycsICdndWlkZS91Y2hyL2hhcycsICfuh7onLCAzIF1cbiAgICBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgQF9mZWVkX3Rlc3RfZGF0YSBkYiwgcHJvYmVzX2lkeCwgcmVzdW1lXG4gICAgcHJlZml4ICAgID0gWyAncG9zJywgJ2d1aWRlJywgXVxuICAgIGlucHV0ICAgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBwcmVmaXgsICcqJ1xuICAgIGRlYnVnICfCqUZwaEpLJywgaW5wdXRbICclbWV0YScgXVxuICAgIHNldHRpbmdzICA9IHsgaW5kZXhlZDogbm8sIH1cbiAgICBpbnB1dFxuICAgICAgLnBpcGUgJCAoIHBocmFzZSwgc2VuZCApID0+XG4gICAgICAgIGNvdW50ICArPSArMVxuICAgICAgICBpZHggICAgKz0gKzFcbiAgICAgICAgZGVidWcgJ8KpU2M1RkcnLCBwaHJhc2VcbiAgICAgICAgIyBULmVxIHBocmFzZSwgbWF0Y2hlcnNbIGlkeCBdXG4gICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgVC5lcSBjb3VudCwgbWF0Y2hlcnMubGVuZ3RoXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwiZW5jb2RlIGtleXMgd2l0aCBsaXN0IGVsZW1lbnRzXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHByb2JlcyA9IFtcbiAgICBbICdmb28nLCAnYmFyJywgXVxuICAgIFsgJ2ZvbycsIFsgJ2JhcicsIF0sIF1cbiAgICBbIFtdLCAnYmFyJywgXVxuICAgIFsgJ2ZvbycsIFtdLCBdXG4gICAgWyBbICdmb28nLCBdLCAnYmFyJywgXVxuICAgIFsgWyA0MiwgXSwgJ2JhcicsIF1cbiAgICBbICdmb28nLCBbIDQyLCBdIF1cbiAgICBdXG4gIGZvciBwcm9iZSBpbiBwcm9iZXNcbiAgICBULmVxIHByb2JlLCBIT0xMRVJJVEguQ09ERUMuZGVjb2RlIEhPTExFUklUSC5DT0RFQy5lbmNvZGUgcHJvYmVcbiAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZWFkIGFuZCB3cml0ZSBwaHJhc2VzIHdpdGggdW5hbmFseXplZCBsaXN0c1wiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBpZHggICAgICAgICA9IC0xXG4gIGNvdW50ICAgICAgID0gMFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHByb2JlcyA9IFtcbiAgICBbICdwcm9iZSMwMCcsICdzb21lLXByZWRpY2F0ZScsIFtdLCBdXG4gICAgWyAncHJvYmUjMDEnLCAnc29tZS1wcmVkaWNhdGUnLCBbIC0xIF0sIF1cbiAgICBbICdwcm9iZSMwMicsICdzb21lLXByZWRpY2F0ZScsIFsgIDAgXSwgXVxuICAgIFsgJ3Byb2JlIzAzJywgJ3NvbWUtcHJlZGljYXRlJywgWyAgMSBdLCBdXG4gICAgWyAncHJvYmUjMDQnLCAnc29tZS1wcmVkaWNhdGUnLCBbICAyIF0sIF1cbiAgICBbICdwcm9iZSMwNScsICdzb21lLXByZWRpY2F0ZScsIFsgIDIsIC0xLCBdLCBdXG4gICAgWyAncHJvYmUjMDYnLCAnc29tZS1wcmVkaWNhdGUnLCBbICAyLCAwLCBdLCBdXG4gICAgWyAncHJvYmUjMDcnLCAnc29tZS1wcmVkaWNhdGUnLCBbICAyLCAxLCBdLCBdXG4gICAgWyAncHJvYmUjMDgnLCAnc29tZS1wcmVkaWNhdGUnLCBbICAyLCAxLCAwIF0sIF1cbiAgICBbICdwcm9iZSMwOScsICdzb21lLXByZWRpY2F0ZScsIFsgIDIsIDIsIF0sIF1cbiAgICBbICdwcm9iZSMxMCcsICdzb21lLXByZWRpY2F0ZScsIFsgIDIsIFsgMiwgXSwgXSwgXVxuICAgIFsgJ3Byb2JlIzExJywgJ3NvbWUtcHJlZGljYXRlJywgWyAgMyBdLCBdXG4gICAgXVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHdyaXRlX3Byb2JlcyA9ICggaGFuZGxlciApID0+XG4gICAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgICB5aWVsZCBIT0xMRVJJVEguY2xlYXIgZGIsIHJlc3VtZVxuICAgICAgaW5wdXQgPSBELmNyZWF0ZV90aHJvdWdoc3RyZWFtKClcbiAgICAgIGlucHV0XG4gICAgICAgICMgLnBpcGUgKCBbIHNiaiwgcHJkLCBvYmosIF0sIHNlbmQgKSA9PlxuICAgICAgICAjICAgaWYgcHJkIGlzICdzb21lLXByZWRpY2F0ZScgIyBhbHdheXMgdGhlIGNhc2UgaW4gdGhpcyBleGFtcGxlXG4gICAgICAgICMgICAgIG9ialxuICAgICAgICAucGlwZSBIT0xMRVJJVEguJHdyaXRlIGRiLCBzb2xpZHM6IFsgJ3NvbWUtcHJlZGljYXRlJywgXVxuICAgICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgICB1cmdlIFwidGVzdCBkYXRhIHdyaXR0ZW5cIlxuICAgICAgICAgIGhhbmRsZXIoKVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBpbnB1dC53cml0ZSBwcm9iZSBmb3IgcHJvYmUgaW4gcHJvYmVzXG4gICAgICBpbnB1dC5lbmQoKVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgeWllbGQgd3JpdGVfcHJvYmVzIHJlc3VtZVxuICAgIGlucHV0ID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGJcbiAgICBkZWJ1ZyAnwqlGcGhKSycsIGlucHV0WyAnJW1ldGEnIF1cbiAgICBpbnB1dFxuICAgICAgLnBpcGUgJCAoIHBocmFzZSwgc2VuZCApID0+XG4gICAgICAgIGNvdW50ICArPSArMVxuICAgICAgICBpZHggICAgKz0gKzFcbiAgICAgICAgIyBkZWJ1ZyAnwqlTYzVGRycsIHBocmFzZVxuICAgICAgICAjIFQuZXEgcGhyYXNlLCBtYXRjaGVyc1sgaWR4IF1cbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICAjIFQuZXEgY291bnQsIG1hdGNoZXJzLmxlbmd0aFxuICAgICAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcIlhYWFwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICB3YXJuIFwibXVzdCB0ZXN0IGZvciBidWcgd2l0aCBtdWx0aXBsZSBpZGVudGljYWwgZW50cmllc1wiXG4gIHByb2Jlc19pZHggID0gM1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGdseXBocyA9IFsgJ+S4gScsICfkuIknLCAn5aSrJywgJ+WciycsICflvaInLCBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgQF9mZWVkX3Rlc3RfZGF0YSBkYiwgcHJvYmVzX2lkeCwgcmVzdW1lXG4gICAgeWllbGQgc2hvd19kYl9lbnRyaWVzIHJlc3VtZVxuICAgICMjIyBUQUlOVCBkb2Vzbid0IHdvcms6ICMjI1xuICAgICMgcHJlZml4ICAgID0gWyAncG9zJywgJ2lzYScsICcqJywgXVxuICAgIHByZWZpeCAgICA9IFsgJ3BvcycsICdpc2EnLCAnZ2x5cGgnLCBdXG4gICAgaW5wdXQgICAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIHByZWZpeFxuICAgIGlucHV0XG4gICAgICAucGlwZSBELiRtYXAgKCBwaHJhc2UsIGhhbmRsZXIgKSA9PlxuICAgICAgICBkZWJ1ZyAnwqlnZzVGcicsIHBocmFzZVxuICAgICAgICBbIF8sIHNiaiwgXywgb2JqLCBdID0gcGhyYXNlXG4gICAgICAgIGRlYnVnICfCqU54Wm80Jywgc2JqXG4gICAgICAgIHN1Yl9wcmVmaXggID0gWyAnc3BvJywgb2JqICsgJzonICsgc2JqLCAnZ3VpZGUnLCBdXG4gICAgICAgIHN1Yl9pbnB1dCAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIHN1Yl9wcmVmaXgsICcqJ1xuICAgICAgICBzdWJfaW5wdXRcbiAgICAgICAgICAucGlwZSBELiRjb2xsZWN0KClcbiAgICAgICAgICAucGlwZSBELiRzaG93ICdBJ1xuICAgICAgICAgIC5waXBlICQgKCBzdWJfcmVzdWx0cywgc2VuZCApID0+XG4gICAgICAgICAgICBoYW5kbGVyIG51bGwsIHN1Yl9yZXN1bHRzXG4gICAgICAucGlwZSBELiRzaG93ICdCJ1xuICAgICAgLnBpcGUgRC4kb25fZW5kID0+XG4gICAgICAgICMgVC5lcSBjb3VudCwgbWF0Y2hlcnMubGVuZ3RoXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwiWVlZXCIgXSA9ICggVCwgVF9kb25lICkgLT5cbiAgd2FybiBcIm11c3QgdGVzdCBmb3IgYnVnIHdpdGggbXVsdGlwbGUgaWRlbnRpY2FsIGVudHJpZXNcIlxuICBwcm9iZXNfaWR4ICA9IDNcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBnbHlwaHMgPSBbICfkuIEnLCAn5LiJJywgJ+WkqycsICflnIsnLCAn5b2iJywgXVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHJlc3VtZVxuICAgIHlpZWxkIHNob3dfZGJfZW50cmllcyByZXN1bWVcbiAgICBwcmVmaXggICAgPSBbICdwb3MnLCAnaXNhJywgJ2dseXBoJywgXVxuICAgIGlucHV0ICAgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBwcmVmaXhcbiAgICBpbnB1dFxuICAgICAgLnBpcGUgJGFzeW5jICggcGhyYXNlLCBkb25lICkgPT5cbiAgICAgICAgIyBkZWJ1ZyAnwqlQQ2o5UicsIHBocmFzZVxuICAgICAgICBbIF8sIHNiaiwgXywgb2JqLCBdID0gcGhyYXNlXG4gICAgICAgIHN1Yl9wcmVmaXggID0gWyAnc3BvJywgb2JqICsgJzonICsgc2JqLCAnZ3VpZGUnLCBdXG4gICAgICAgICMjIyBUQUlOVCBtdXN0IGhvbm9yIGFyaXR5ICMjI1xuICAgICAgICBIT0xMRVJJVEgucmVhZF9waHJhc2VzIGRiLCBzdWJfcHJlZml4LCAnKicsIG51bGwsICggZXJyb3IsIHN1Yl9waHJhc2VzICkgPT5cbiAgICAgICAgICAjIGRlYnVnICfCqVZPWjBwJywgc2JqLCBzdWJfcGhyYXNlc1xuICAgICAgICAgIHJldHVybiBkb25lLmVycm9yIGVycm9yIGlmIGVycm9yP1xuICAgICAgICAgIGZvciBzdWJfcGhyYXNlLCBzdWJfcGhyYXNlX2lkeCBpbiBzdWJfcGhyYXNlc1xuICAgICAgICAgICAgWyBfLCBfLCBzdWJfcHJkLCBzdWJfb2JqLCBdID0gc3ViX3BocmFzZVxuICAgICAgICAgICAgc3ViX3BocmFzZXNbIHN1Yl9waHJhc2VfaWR4IF0gPSBbIHN1Yl9wcmQsIHN1Yl9vYmosIF1cbiAgICAgICAgICBkb25lIFsgc2JqLCBzdWJfcGhyYXNlcy4uLiwgXVxuICAgICAgLnBpcGUgRC4kc2hvdyAnQidcbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICAjIFQuZXEgY291bnQsIG1hdGNoZXJzLmxlbmd0aFxuICAgICAgICBUX2RvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwid3JpdGluZyBwaHJhc2VzIHdpdGggbm9uLXVuaXF1ZSBrZXlzIGZhaWxzXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIGFsZXJ0IFwiXCJcInRlc3QgY2FzZSBcIndyaXRpbmcgcGhyYXNlcyB3aXRoIG5vbi11bmlxdWUga2V5cyBmYWlsc1wiIHRvIGJlIHdyaXR0ZW5cIlwiXCJcbiAgZG9uZSgpXG4gICMgaWR4ICAgICAgICAgPSAtMVxuICAjIGNvdW50ICAgICAgID0gMFxuICAjIGRlbGF5ID0gKCBoYW5kbGVyICkgLT5cbiAgIyAgIHNldEltbWVkaWF0ZSBoYW5kbGVyXG4gICMgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAjIHdyaXRlX3Byb2JlcyA9ICggaGFuZGxlciApID0+XG4gICMgICBzdGVwICggcmVzdW1lICkgPT5cbiAgIyAgICAgeWllbGQgSE9MTEVSSVRILmNsZWFyIGRiLCByZXN1bWVcbiAgIyAgICAgaW5wdXQgPSBELmNyZWF0ZV90aHJvdWdoc3RyZWFtKClcbiAgIyAgICAgaW5wdXRcbiAgIyAgICAgICAucGlwZSBIT0xMRVJJVEguJHdyaXRlIGRiLCBzb2xpZHM6IFsgJ3NvbWUtcHJlZGljYXRlJywgXVxuICAjICAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAjICAgICAgICAgdXJnZSBcInRlc3QgZGF0YSB3cml0dGVuXCJcbiAgIyAgICAgICAgIGhhbmRsZXIoKVxuICAjICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAjICAgICBmb3IgaWR4IGluIFsgMCAuLiAxMDAgXVxuICAjICAgICAgIHByb2JlID0gWyAnZW50cnknLCBcImZvby0je2lkeH1cIiwgaWR4LCBdXG4gICMgICAgICAgeWllbGQgaW5wdXQud3JpdGUgcHJvYmUsIHJlc3VtZVxuICAjICAgICAgICMgeWllbGQgZGVsYXkgcmVzdW1lXG4gICMgICAgIGlucHV0LmVuZCgpXG4gICMgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAjIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAjICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgIyAgIHlpZWxkIHdyaXRlX3Byb2JlcyByZXN1bWVcbiAgIyAgIGlucHV0ID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGJcbiAgIyAgIGRlYnVnICfCqXFDYnU2JywgaW5wdXRbICclbWV0YScgXVxuICAjICAgaW5wdXRcbiAgIyAgICAgLnBpcGUgJCAoIHBocmFzZSwgc2VuZCApID0+XG4gICMgICAgICAgY291bnQgICs9ICsxXG4gICMgICAgICAgaWR4ICAgICs9ICsxXG4gICMgICAgICAgZGVidWcgJ8KpU2M1RkcnLCBwaHJhc2VcbiAgIyAgICAgICAjIFQuZXEgcGhyYXNlLCBtYXRjaGVyc1sgaWR4IF1cbiAgIyAgICAgLnBpcGUgRC4kb25fZW5kID0+XG4gICMgICAgICAgIyBULmVxIGNvdW50LCBtYXRjaGVycy5sZW5ndGhcbiAgIyAgICAgICBkb25lKClcblxuIyAjICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyAjIEBbIFwiX3RyYW5zYWN0aW9uc1wiIF0gPSAoIFQsIGRvbmUgKSAtPlxuIyAjICAgbGV2ZWx1cCA9IHJlcXVpcmUoJ2xldmVsdXAnKVxuIyAjICAgZGIgPSBsZXZlbHVwKCcuL2RiJywgdmFsdWVFbmNvZGluZzogJ2pzb24nKVxuIyAjICAgcmVxdWlyZSgnbGV2ZWwtYXN5bmMtdHJhbnNhY3Rpb24nKSBkYlxuIyAjICAgdHggPSBkYi50cmFuc2FjdGlvbigpXG4jICMgICB0eDIgPSBkYi50cmFuc2FjdGlvbigpXG4jICMgICB0eC5wdXQgJ2snLCAxNjdcbiMgIyAgIHR4LmNvbW1pdCAtPlxuIyAjICAgICB0eDIuZ2V0ICdrJywgKGVycm9yLCB2YWx1ZSkgLT5cbiMgIyAgICAgICAjdHgyIGluY3JlbWVudHMgdmFsdWVcbiMgIyAgICAgICB0eDIucHV0ICdrJywgdmFsdWUgKyAxXG4jICMgICAgICAgcmV0dXJuXG4jICMgICAgIGRiLmdldCAnaycsIChlcnJvciwgZGF0YSkgLT5cbiMgIyAgICAgICAjdHggY29tbWl0OiBkYXRhIGVxdWFscyB0byAxNjdcbiMgIyAgICAgICB0eDIuY29tbWl0IC0+XG4jICMgICAgICAgICBkYi5nZXQgJ2snLCAoZXJyb3IsIGRhdGEpIC0+XG4jICMgICAgICAgICAgICN0eDIgY29tbWl0OiBkYXRhIGVxdWFscyB0byAxNjhcbiMgIyAgICAgICAgICAgcmV0dXJuXG4jICMgICAgICAgICByZXR1cm5cbiMgIyAgICAgICByZXR1cm5cbiMgIyAgICAgcmV0dXJuXG5cblxuXG4jICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBAWyBcIlpaWlwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuIyAgIGxvZ190aWNrc19pZCA9IG51bGxcbiMgICBsb2dfdGlja3MgPSAtPlxuIyAgICAgZGVidWcgXCItLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gdGlja1wiXG4jICAgICBsb2dfdGlja3NfaWQgPSBpbW1lZGlhdGVseSBsb2dfdGlja3NcbiMgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jICAgcm91dGUgICAgICAgICAgICAgPSAnL3RtcC9YLXRlc3QtZGInXG4jICAgZGIgICAgICAgICAgICAgICAgPSBIT0xMRVJJVEgubmV3X2RiIHJvdXRlXG4jICAgaW5wdXRfQSAgICAgICAgICAgPSBELmNyZWF0ZV90aHJvdWdoc3RyZWFtKClcbiMgICBuICAgICAgICAgICAgICAgICA9IDFlNlxuIyAgIG4gICAgICAgICAgICAgICAgID0gMTBcbiMgICBuICAgICAgICAgICAgICAgICA9IDFlNFxuIyAgIGJsb29tX2Vycm9yX3JhdGUgID0gMC4xXG4jICAgZW50cnlfY291bnQgICAgICAgPSAwXG4jICAgZGJfcmVxdWVzdF9jb3VudCAgPSAwXG4jICAgdDAgICAgICAgICAgICAgICAgPSBudWxsXG4jICAgdDEgICAgICAgICAgICAgICAgPSBudWxsXG4jICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgIEJTT04gPSAoIHJlcXVpcmUgJ2Jzb24nICkuQlNPTlB1cmUuQlNPTlxuIyAgIG5qc19mcyA9IHJlcXVpcmUgJ2ZzJ1xuIyAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICBCTE9FTSAgICAgICAgICAgICA9IHJlcXVpcmUgJ2Jsb2VtJ1xuIyAgIGJsb2VtX3NldHRpbmdzICAgID1cbiMgICAgIGluaXRpYWxfY2FwYWNpdHk6ICAgbiAjLyAxMFxuIyAgICAgc2NhbGluZzogICAgICAgICAgICAyXG4jICAgICByYXRpbzogICAgICAgICAgICAgIDAuMVxuIyAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgICBzaG93X2Jsb29tX2luZm8gPSAoIGRiICkgPT5cbiMgICAgIGJsb29tICAgICAgID0gZGJbICclYmxvb20nIF1cbiMgICAgIGZpbHRlcnMgICAgID0gYmxvb21bICdmaWx0ZXJzJyBdXG4jICAgICBmaWx0ZXJfc2l6ZSA9IDBcbiMgICAgIGZvciBmaWx0ZXIgaW4gZmlsdGVyc1xuIyAgICAgICBmaWx0ZXJfc2l6ZSArPSBmaWx0ZXJbICdmaWx0ZXInIF1bICdiaXRmaWVsZCcgXVsgJ2J1ZmZlcicgXS5sZW5ndGhcbiMgICAgIHdoaXNwZXIgXCJzY2FsYWJsZSBibG9vbTogZmlsdGVyIGNvdW50OiAje2ZpbHRlcnMubGVuZ3RofSwgZmlsdGVyIHNpemU6ICN7xpIgZmlsdGVyX3NpemV9IGJ5dGVzXCJcbiMgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jICAgJGVuc3VyZV91bmlxdWUgPSAoIGRiICkgPT5cbiMgICAgIHJldHVybiBELiRtYXAgKCBwaHJhc2UsIGhhbmRsZXIgKSA9PlxuIyAgICAgICBibG9vbSAgICAgICAgICAgICAgID0gZGJbICclYmxvb20nIF1cbiMgICAgICAgIyMjID4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+ICMjI1xuIyAgICAgICBbIHNiaiwgcHJkLCBvYmosIF0gID0gcGhyYXNlXG4jICAgICAgIGtleSAgICAgICAgICAgICAgICAgPSBbICdzcG8nLCBzYmosIHByZCwgXVxuIyAgICAgICBrZXlfYmZyICAgICAgICAgICAgID0ga2V5LmpvaW4gJ3wnXG4jICAgICAgICMjIyA+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+PiAjIyNcbiMgICAgICAgYmxvb21faGFzX2tleSAgICAgICA9IGJsb29tLmhhcyBrZXlfYmZyXG4jICAgICAgIGJsb29tLmFkZCBrZXlfYmZyXG4jICAgICAgIHJldHVybiBoYW5kbGVyIG51bGwsIHBocmFzZSB1bmxlc3MgYmxvb21faGFzX2tleVxuIyAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICAgICAgSE9MTEVSSVRILmhhcyBkYiwga2V5LCAoIGVycm9yLCBkYl9oYXNfa2V5ICkgPT5cbiMgICAgICAgICByZXR1cm4gaGFuZGxlciBlcnJvciBpZiBlcnJvcj9cbiMgICAgICAgICBkYl9yZXF1ZXN0X2NvdW50ICs9ICsxXG4jICAgICAgICAgcmV0dXJuIGhhbmRsZXIgbmV3IEVycm9yIFwicGhyYXNlIGFscmVhZHkgaW4gREI6ICN7cnByIHBocmFzZX1cIiBpZiBkYl9oYXNfa2V5XG4jICAgICAgICAgaGFuZGxlciBudWxsLCBwaHJhc2VcbiMgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jICAgJGxvYWRfYmxvb20gPSAoIGRiICkgPT5cbiMgICAgIGlzX2ZpcnN0ID0geWVzXG4jICAgICByZXR1cm4gRC4kbWFwICggZGF0YSwgaGFuZGxlciApID0+XG4jICAgICAgIHVubGVzcyBpc19maXJzdFxuIyAgICAgICAgIHJldHVybiBpZiBkYXRhPyB0aGVuIGhhbmRsZXIgbnVsbCwgZGF0YSBlbHNlIGhhbmRsZXIoKVxuIyAgICAgICBpc19maXJzdCA9IG5vXG4jICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgICAgICBIT0xMRVJJVEguX2dldF9tZXRhIGRiLCAnYmxvb20nLCBudWxsLCAoIGVycm9yLCBibG9vbV9iZnIgKSA9PlxuIyAgICAgICAgIHJldHVybiBzZW5kLmVycm9yIGVycm9yIGlmIGVycm9yP1xuIyAgICAgICAgIGlmIGJsb29tX2JmciBpcyBudWxsXG4jICAgICAgICAgICB3YXJuICdubyBibG9vbSBmaWx0ZXIgZm91bmQnXG4jICAgICAgICAgICBibG9vbSA9IG5ldyBCTE9FTS5TY2FsaW5nQmxvZW0gYmxvb21fZXJyb3JfcmF0ZSwgYmxvZW1fc2V0dGluZ3NcbiMgICAgICAgICBlbHNlXG4jICAgICAgICAgICBibG9vbV9kYXRhID0gQlNPTi5kZXNlcmlhbGl6ZSBibG9vbV9iZnJcbiMgICAgICAgICAgICMjIyBUQUlOVCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3dpZWRpL25vZGUtYmxvZW0vaXNzdWVzLzUgIyMjXG4jICAgICAgICAgICBmb3IgZmlsdGVyIGluIGJsb29tX2RhdGFbICdmaWx0ZXJzJyBdXG4jICAgICAgICAgICAgIGJpdGZpZWxkICAgICAgICAgICAgICA9IGZpbHRlclsgJ2ZpbHRlcicgXVsgJ2JpdGZpZWxkJyBdXG4jICAgICAgICAgICAgIGJpdGZpZWxkWyAnYnVmZmVyJyBdICA9IGJpdGZpZWxkWyAnYnVmZmVyJyBdWyAnYnVmZmVyJyBdXG4jICAgICAgICAgICBibG9vbSA9IEJMT0VNLlNjYWxpbmdCbG9lbS5kZXN0cmluZ2lmeSBibG9vbV9kYXRhXG4jICAgICAgICAgZGJbICclYmxvb20nIF0gPSBibG9vbVxuIyAgICAgICAgIHJldHVybiBpZiBkYXRhPyB0aGVuIGhhbmRsZXIgbnVsbCwgZGF0YSBlbHNlIGhhbmRsZXIoKVxuIyAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgICAkc2F2ZV9ibG9vbSA9ICggZGIgKSA9PlxuIyAgICAgcmV0dXJuIEQuJG9uX2VuZCAoIHNlbmQsIGVuZCApID0+XG4jICAgICAgIGJsb29tICAgICA9IGRiWyAnJWJsb29tJyBdXG4jICAgICAgIGJsb29tX2JmciA9IEJTT04uc2VyaWFsaXplIGJsb29tXG4jICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgICAgICBIT0xMRVJJVEguX3B1dF9tZXRhIGRiLCAnYmxvb20nLCBibG9vbV9iZnIsICggZXJyb3IgKSA9PlxuIyAgICAgICAgIHJldHVybiBzZW5kLmVycm9yIGVycm9yIGlmIGVycm9yP1xuIyAgICAgICAgIGVuZCgpXG4jICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyAgIGlucHV0X0IgPSBpbnB1dF9BXG4jICAgICAucGlwZSAkbG9hZF9ibG9vbSAgICAgZGJcbiMgICAgIC5waXBlICRlbnN1cmVfdW5pcXVlICBkYlxuIyAgICAgLnBpcGUgJHNhdmVfYmxvb20gICAgIGRiXG4jICAgICAucGlwZSAkICggZGF0YSwgc2VuZCApID0+XG4jICAgICAgIGVudHJ5X2NvdW50ICs9ICsxXG4jICAgICAgIHdoaXNwZXIgZW50cnlfY291bnQgaWYgZW50cnlfY291bnQgJSAxMDAwMDAgaXMgMFxuIyAgICAgICBzZW5kIGRhdGFcbiMgICAgIC5waXBlIEhPTExFUklUSC4kd3JpdGUgZGIsIGJhdGNoOiAxMDAwXG4jICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgICBpbnB1dF9CLm9uICdlbmQnLCA9PlxuIyAgICAgdDEgPSArbmV3IERhdGUoKVxuIyAgICAgaGVscCBcImlucHV0X0IvZW5kXCJcbiMgICAgIGhlbHAgXCJuOiAgICAgICAgICAgICAgICAgICN7xpIgbn1cIlxuIyAgICAgaGVscCBcIkRCIHJlcXVlc3QgY291bnQ6ICAgI3vGkiBkYl9yZXF1ZXN0X2NvdW50fVwiXG4jICAgICBoZWxwIFwicmVxdWVzdCByYXRlOiAgICAgICAjeyggZGJfcmVxdWVzdF9jb3VudCAvIG4gKS50b0ZpeGVkIDR9XCJcbiMgICAgIGhlbHAgXCJkdDogICAgICAgICAgICAgICAgICN7xpIgKCB0MSAtIHQwICkgLyAxMDAwfXNcIlxuIyAgICAgY2xlYXJJbW1lZGlhdGUgbG9nX3RpY2tzX2lkXG4jICAgICBkb25lKClcbiMgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyAgIHN0ZXAgKCByZXN1bWUgKSA9PlxuIyAgICAgeWllbGQgSE9MTEVSSVRILmNsZWFyIGRiLCByZXN1bWVcbiMgICAgICMgbG9nX3RpY2tzKClcbiMgICAgIHQwID0gK25ldyBEYXRlKClcbiMgICAgIGZvciByZWNvcmRfaWR4IGluIFsgMCAuLi4gbiBdXG4jICAgICAgIHNiaiAgICAgPSBcInJlY29yZFwiXG4jICAgICAgIHByZCAgICAgPSBcIm5yLSN7cmVjb3JkX2lkeH1cIlxuIyAgICAgICBvYmogICAgID0gcmVjb3JkX2lkeFxuIyAgICAgICBwaHJhc2UgID0gWyBzYmosIHByZCwgb2JqLCBdXG4jICAgICAgICMgd2hpc3BlciBcImlucHV0X0Eud3JpdGUgI3tycHIgcGhyYXNlfVwiXG4jICAgICAgIHlpZWxkIGlucHV0X0Eud3JpdGUgcGhyYXNlLCByZXN1bWVcbiMgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgICB3aGlzcGVyIFwiY2FsbGluZyBpbnB1dF9BLmVuZCgpXCJcbiMgICAgIHlpZWxkIGlucHV0X0EuZW5kIHJlc3VtZVxuXG5cbiMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEBbIFwicmVtaW5kZXJzXCIgXSA9ICggVCwgZG9uZSApIC0+XG4jICAgYWxlcnQgXCJILiR3cml0ZSgpIG11c3QgdGVzdCBmb3IgcmVwZWF0ZWQga2V5cyBvciBpbXBsZW1lbnQgcmV3cml0aW5nIG9mIFBPUyBlbnRyaWVzXCJcbiMgICBkb25lKClcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIEhFTFBFUlNcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuc2hvd19rZXlzX2FuZF9rZXlfYmZycyA9ICgga2V5cywga2V5X2JmcnMgKSAtPlxuICBmID0gKCBwICkgLT4gKCB0IGZvciB0IGluICggcC50b1N0cmluZyAnaGV4JyApLnNwbGl0IC8oLi4pLyB3aGVuIHQgaXNudCAnJyApLmpvaW4gJyAnXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgY29sdW1uaWZ5X3NldHRpbmdzID1cbiAgICBwYWRkaW5nQ2hyOiAnICdcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBkYXRhICAgICAgPSBbXVxuICBrZXlfYmZycyAgPSAoIGYgcCBmb3IgcCBpbiBrZXlfYmZycyApXG4gIGZvciBrZXksIGlkeCBpbiBrZXlzXG4gICAga2V5X3R4dCA9ICggcnByIGtleSApLnJlcGxhY2UgL1xcXFx1MDAwMC9nLCAn4oiHJ1xuICAgIGRhdGEucHVzaCB7ICdzdHInOiBrZXlfdHh0LCAnYmZyJzoga2V5X2JmcnNbIGlkeCBdfVxuICBoZWxwICdcXG4nICsgQ05ELmNvbHVtbmlmeSBkYXRhLCBjb2x1bW5pZnlfc2V0dGluZ3NcbiAgcmV0dXJuIG51bGxcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5zaG93X2RiX2VudHJpZXMgPSAoIGhhbmRsZXIgKSAtPlxuICBpbnB1dCA9IGRiWyAnJXNlbGYnIF0uY3JlYXRlUmVhZFN0cmVhbSgpXG4gIGlucHV0XG4gICAgLnBpcGUgRC4kc2hvdygpXG4gICAgLnBpcGUgJCAoIHsga2V5LCB2YWx1ZSwgfSwgc2VuZCApID0+IHNlbmQgWyBrZXksIHZhbHVlLCBdXG4gICAgLnBpcGUgJCAoIFsga2V5LCB2YWx1ZSwgXSwgc2VuZCApID0+IHNlbmQgWyBrZXksIHZhbHVlLCBdIHVubGVzcyBIT0xMRVJJVEguX2lzX21ldGEgZGIsIGtleVxuICAgIC5waXBlICQgKCBbIGtleSwgdmFsdWUsIF0sIHNlbmQgKSA9PlxuICAgICAgIyBkZWJ1ZyAnwqlSbHVoRicsICggSE9MTEVSSVRILkNPREVDLmRlY29kZSBrZXkgKSwgKCBKU09OLnBhcnNlIHZhbHVlIClcbiAgICAgIHNlbmQgWyBrZXksIHZhbHVlLCBdXG4gICAgLnBpcGUgRC4kY29sbGVjdCgpXG4gICAgLnBpcGUgJCAoIGZhY2V0cywgc2VuZCApID0+XG4gICAgICBoZWxwICdcXG4nICsgSE9MTEVSSVRILkRVTVAucnByX29mX2ZhY2V0cyBkYiwgZmFjZXRzXG4gICAgICAjIGJ1ZmZlciA9IG5ldyBCdWZmZXIgSlNPTi5zdHJpbmdpZnkgWyAn5byAJywgJ+W9oScgXVxuICAgICAgIyBkZWJ1ZyAnwqlHSmZMNicsIEhPTExFUklUSC5EVU1QLnJwcl9vZl9idWZmZXIgbnVsbCwgYnVmZmVyXG4gICAgLnBpcGUgRC4kb25fZW5kID0+IGhhbmRsZXIoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmdldF9uZXdfZGJfbmFtZSA9IC0+XG4gIGdldF9uZXdfZGJfbmFtZS5pZHggKz0gKzFcbiAgcmV0dXJuIFwiL3RtcC9ob2xsZXJpdGgyLXRlc3RkYi0je2dldF9uZXdfZGJfbmFtZS5pZHh9XCJcbmdldF9uZXdfZGJfbmFtZS5pZHggPSAwXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxucmVhZF9hbGxfa2V5cyA9ICggZGIsIGhhbmRsZXIgKSAtPlxuICBaID0gW11cbiAgaW5wdXQgPSBkYi5jcmVhdGVLZXlTdHJlYW0oKVxuICBpbnB1dC5vbiAnZW5kJywgLT4gaGFuZGxlciBudWxsLCBaXG4gIGlucHV0XG4gICAgLnBpcGUgJCAoIGRhdGEsIHNlbmQgKSA9PiBaLnB1c2ggZGF0YVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsZWFyX2xldmVsZGIgPSAoIGxldmVsZGIsIGhhbmRsZXIgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICByb3V0ZSA9IGxldmVsZGJbICdsb2NhdGlvbicgXVxuICAgIHlpZWxkIGxldmVsZGIuY2xvc2UgcmVzdW1lXG4gICAgd2hpc3BlciBcImNsb3NlZCBMZXZlbERCXCJcbiAgICB5aWVsZCBsZXZlbGRvd24uZGVzdHJveSByb3V0ZSwgcmVzdW1lXG4gICAgd2hpc3BlciBcImRlc3Ryb3llZCBMZXZlbERCXCJcbiAgICB5aWVsZCBsZXZlbGRiLm9wZW4gcmVzdW1lXG4gICAgd2hpc3BlciBcInJlLW9wZW5lZCBMZXZlbERCXCJcbiAgICAjIGhlbHAgXCJlcmFzZWQgYW5kIHJlLW9wZW5lZCBMZXZlbERCIGF0ICN7cm91dGV9XCJcbiAgICBoYW5kbGVyIG51bGxcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX21haW4gPSAoIGhhbmRsZXIgKSAtPlxuICBkYiA9IEhPTExFUklUSC5uZXdfZGIgam9pbiBfX2Rpcm5hbWUsICcuLicsICdkYnMvdGVzdHMnXG4gIHRlc3QgQCwgJ3RpbWVvdXQnOiAyNTAwXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xudW5sZXNzIG1vZHVsZS5wYXJlbnQ/XG4gIEBfbWFpbigpXG4gICMgQFsgXCJYWFhcIiBdIG51bGwsIC0+IGhlbHAgXCIoZG9uZSlcIlxuICAjIEBbIFwiWVlZXCIgXSBudWxsLCAtPiBoZWxwIFwiKGRvbmUpXCJcbiAgIyBAWyBcIlpaWlwiIF0gbnVsbCwgLT4gaGVscCBcIihkb25lKVwiXG5cbiAgIyBkZWJ1ZyAnwqlQOUFPUicsICggSE9MTEVSSVRILkNPREVDWyAndHlwZW1hcmtlcnMnICBdWyAnbnVsbCcgICAgICAgXSApLnRvU3RyaW5nIDE2XG4gICMgZGVidWcgJ8KpeHhtSXAnLCAoIEhPTExFUklUSC5DT0RFQ1sgJ3R5cGVtYXJrZXJzJyAgXVsgJ2ZhbHNlJyAgICAgIF0gKS50b1N0cmluZyAxNlxuICAjIGRlYnVnICfCqVplWTI2JywgKCBIT0xMRVJJVEguQ09ERUNbICd0eXBlbWFya2VycycgIF1bICd0cnVlJyAgICAgICBdICkudG9TdHJpbmcgMTZcbiAgIyBkZWJ1ZyAnwqlXZ0VSOScsICggSE9MTEVSSVRILkNPREVDWyAndHlwZW1hcmtlcnMnICBdWyAnZGF0ZScgICAgICAgXSApLnRvU3RyaW5nIDE2XG4gICMgZGVidWcgJ8KpVW1wakonLCAoIEhPTExFUklUSC5DT0RFQ1sgJ3R5cGVtYXJrZXJzJyAgXVsgJ25pbmZpbml0eScgIF0gKS50b1N0cmluZyAxNlxuICAjIGRlYnVnICfCqVVybDBLJywgKCBIT0xMRVJJVEguQ09ERUNbICd0eXBlbWFya2VycycgIF1bICdubnVtYmVyJyAgICBdICkudG9TdHJpbmcgMTZcbiAgIyBkZWJ1ZyAnwqluRklJaScsICggSE9MTEVSSVRILkNPREVDWyAndHlwZW1hcmtlcnMnICBdWyAncG51bWJlcicgICAgXSApLnRvU3RyaW5nIDE2XG4gICMgZGVidWcgJ8KpTFo1OFInLCAoIEhPTExFUklUSC5DT0RFQ1sgJ3R5cGVtYXJrZXJzJyAgXVsgJ3BpbmZpbml0eScgIF0gKS50b1N0cmluZyAxNlxuICAjIGRlYnVnICfCqU1ZeGRhJywgKCBIT0xMRVJJVEguQ09ERUNbICd0eXBlbWFya2VycycgIF1bICd0ZXh0JyAgICAgICBdICkudG9TdHJpbmcgMTZcblxuXG5cblxuXG5cblxuXG5cblxuIl19