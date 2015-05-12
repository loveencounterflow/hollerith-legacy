(function() {
  var $, BYTEWISE, CND, CODEC, D, HOLLERITH, after, alert, badge, db, debug, echo, get_new_db_name, help, info, join, levelup, log, memdown, njs_path, read_all_keys, rpr, show_keys_and_key_bfrs, step, suspend, test, urge, warn, whisper;

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

  memdown = require('memdown');

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

  get_new_db_name = function() {
    get_new_db_name.idx += +1;
    return "mydb-" + get_new_db_name.idx;
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

  this["sort using memdown"] = function(T, done) {
    return step((function(_this) {
      return function*(resume) {
        var i, j, len, len1, matchers, probe, probe_bfr, probe_idx, probes, settings;
        settings = {
          db: memdown,
          keyEncoding: 'binary'
        };
        db = levelup(get_new_db_name(), settings);
        probes = ['a', 'ab', 'abc', 'abc\x00', 'abc\x00a', 'abca', 'abcb', 'abcc', 'abcd', 'abcde', 'abcdef', 'abcdefg'];
        matchers = [new Buffer([0x61]), new Buffer([0x61, 0x62]), new Buffer([0x61, 0x62, 0x63]), new Buffer([0x61, 0x62, 0x63, 0x00]), new Buffer([0x61, 0x62, 0x63, 0x00, 0x61]), new Buffer([0x61, 0x62, 0x63, 0x61]), new Buffer([0x61, 0x62, 0x63, 0x62]), new Buffer([0x61, 0x62, 0x63, 0x63]), new Buffer([0x61, 0x62, 0x63, 0x64]), new Buffer([0x61, 0x62, 0x63, 0x64, 0x65]), new Buffer([0x61, 0x62, 0x63, 0x64, 0x65, 0x66]), new Buffer([0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67])];
        CND.shuffle(probes);
        for (i = 0, len = probes.length; i < len; i++) {
          probe = probes[i];
          probe_bfr = new Buffer(probe, 'utf-8');
          (yield db.put(probe_bfr, '1', resume));
        }
        probes = (yield read_all_keys(db, resume));
        for (probe_idx = j = 0, len1 = probes.length; j < len1; probe_idx = ++j) {
          probe = probes[probe_idx];
          T.eq(probe, matchers[probe_idx]);
        }
        return done();
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

  this["sort with H2 codec"] = function(T, done) {
    return step((function(_this) {
      return function*(resume) {
        var i, len, matchers, probe, probe_bfr, probe_bfrs, probes, settings;
        settings = {
          db: memdown,
          keyEncoding: 'binary'
        };
        db = levelup(get_new_db_name(), settings);
        probes = ['a', 'ab', 'abc', 'abc\x00', 'abca\x00', 'abc\x00a', 'abca', 'abcb', 'abcc', 'abcd', 'abcde', 'abcdef', 'abcdefg'];
        matchers = [new Buffer([0x61]), new Buffer([0x61, 0x62]), new Buffer([0x61, 0x62, 0x63]), new Buffer([0x61, 0x62, 0x63, 0x00]), new Buffer([0x61, 0x62, 0x63, 0x00, 0x61]), new Buffer([0x61, 0x62, 0x63, 0x61]), new Buffer([0x61, 0x62, 0x63, 0x62]), new Buffer([0x61, 0x62, 0x63, 0x63]), new Buffer([0x61, 0x62, 0x63, 0x64]), new Buffer([0x61, 0x62, 0x63, 0x64, 0x65]), new Buffer([0x61, 0x62, 0x63, 0x64, 0x65, 0x66]), new Buffer([0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67])];
        for (i = 0, len = probes.length; i < len; i++) {
          probe = probes[i];
          probe_bfr = CODEC.encode([probe]);
          (yield db.put(probe_bfr, '1', resume));
        }
        probe_bfrs = (yield read_all_keys(db, resume));
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
        return done();
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

//# sourceMappingURL=data:application/json;base64,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QVE7QUFBQSxNQUFBLFNBQUEsRUFBVyxJQUFYO0tBQVIsRUFGTztFQUFBLENBdnhCVCxDQUFBOztBQTR4QkEsRUFBQSxJQUFPLHFCQUFQO0FBQ0UsSUFBQSxJQUFDLENBQUEsS0FBRCxDQUFBLENBQUEsQ0FERjtHQTV4QkE7QUFBQSIsImZpbGUiOiJ0ZXN0cy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIlxuXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xubmpzX3BhdGggICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ3BhdGgnXG4jIG5qc19mcyAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdmcydcbmpvaW4gICAgICAgICAgICAgICAgICAgICAgPSBuanNfcGF0aC5qb2luXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkNORCAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdjbmQnXG5ycHIgICAgICAgICAgICAgICAgICAgICAgID0gQ05ELnJwclxuYmFkZ2UgICAgICAgICAgICAgICAgICAgICA9ICdIT0xMRVJJVEgvdGVzdHMnXG5sb2cgICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3BsYWluJywgICAgIGJhZGdlXG5pbmZvICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ2luZm8nLCAgICAgIGJhZGdlXG53aGlzcGVyICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3doaXNwZXInLCAgIGJhZGdlXG5hbGVydCAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ2FsZXJ0JywgICAgIGJhZGdlXG5kZWJ1ZyAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ2RlYnVnJywgICAgIGJhZGdlXG53YXJuICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3dhcm4nLCAgICAgIGJhZGdlXG5oZWxwICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ2hlbHAnLCAgICAgIGJhZGdlXG51cmdlICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3VyZ2UnLCAgICAgIGJhZGdlXG5lY2hvICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmVjaG8uYmluZCBDTkRcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuc3VzcGVuZCAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2NvZmZlZW5vZGUtc3VzcGVuZCdcbnN0ZXAgICAgICAgICAgICAgICAgICAgICAgPSBzdXNwZW5kLnN0ZXBcbmFmdGVyICAgICAgICAgICAgICAgICAgICAgPSBzdXNwZW5kLmFmdGVyXG4jIGV2ZW50dWFsbHkgICAgICAgICAgICAgICAgPSBzdXNwZW5kLmV2ZW50dWFsbHlcbiMgaW1tZWRpYXRlbHkgICAgICAgICAgICAgICA9IHN1c3BlbmQuaW1tZWRpYXRlbHlcbiMgcmVwZWF0X2ltbWVkaWF0ZWx5ICAgICAgICA9IHN1c3BlbmQucmVwZWF0X2ltbWVkaWF0ZWx5XG4jIGV2ZXJ5ICAgICAgICAgICAgICAgICAgICAgPSBzdXNwZW5kLmV2ZXJ5XG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnRlc3QgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdndXktdGVzdCdcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuRCAgICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ3BpcGVkcmVhbXMyJ1xuJCAgICAgICAgICAgICAgICAgICAgICAgICA9IEQucmVtaXQuYmluZCBEXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkhPTExFUklUSCAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL21haW4nXG5kYiAgICAgICAgICAgICAgICAgICAgICAgID0gbnVsbFxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5CWVRFV0lTRSAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnYnl0ZXdpc2UnXG5sZXZlbHVwICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbGV2ZWx1cCdcbm1lbWRvd24gICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdtZW1kb3duJ1xuQ09ERUMgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vY29kZWMnXG5cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX2VuY29kZV9saXN0ID0gKCBsaXN0ICkgLT5cbiAgKCBsaXN0WyBpZHggXSA9IEJZVEVXSVNFLmVuY29kZSB2YWx1ZSApIGZvciB2YWx1ZSwgaWR4IGluIGxpc3RcbiAgcmV0dXJuIGxpc3RcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX2RlY29kZV9saXN0ID0gKCBsaXN0ICkgLT5cbiAgKCBsaXN0WyBpZHggXSA9IEJZVEVXSVNFLmRlY29kZSB2YWx1ZSApIGZvciB2YWx1ZSwgaWR4IGluIGxpc3RcbiAgcmV0dXJuIGxpc3RcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX3NvcnRfbGlzdCA9ICggbGlzdCApIC0+XG4gIEBfZW5jb2RlX2xpc3QgbGlzdFxuICBsaXN0LnNvcnQgQnVmZmVyLmNvbXBhcmVcbiAgQF9kZWNvZGVfbGlzdCBsaXN0XG4gIHJldHVybiBsaXN0XG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9mZWVkX3Rlc3RfZGF0YSA9ICggZGIsIHByb2Jlc19pZHgsIGhhbmRsZXIgKSAtPlxuICBzd2l0Y2ggcHJvYmVzX2lkeFxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgd2hlbiAwXG4gICAgICBzdGVwICggcmVzdW1lICkgPT5cbiAgICAgICAgeWllbGQgSE9MTEVSSVRILmNsZWFyIGRiLCByZXN1bWVcbiAgICAgICAgaW5wdXQgPSBELmNyZWF0ZV90aHJvdWdoc3RyZWFtKClcbiAgICAgICAgaW5wdXRcbiAgICAgICAgICAucGlwZSBIT0xMRVJJVEguJHdyaXRlIGRiLCAzXG4gICAgICAgICAgIyAucGlwZSBELiRzaG93KClcbiAgICAgICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgICAgIHVyZ2UgXCJ0ZXN0IGRhdGEgd3JpdHRlblwiXG4gICAgICAgICAgICBoYW5kbGVyIG51bGxcbiAgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgICBmb3IgcHJvYmUgaW4gQF9mZWVkX3Rlc3RfZGF0YS5wcm9iZXNbIHByb2Jlc19pZHggXVxuICAgICAgICAgICMga2V5ID0gSE9MTEVSSVRILm5ld19zb19rZXkgZGIsIHByb2JlLi4uXG4gICAgICAgICAgIyBkZWJ1ZyAnwqlXVjBqMicsIHByb2JlXG4gICAgICAgICAgaW5wdXQud3JpdGUgcHJvYmVcbiAgICAgICAgaW5wdXQuZW5kKClcbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIHdoZW4gMVxuICAgICAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgICAgIHlpZWxkIEhPTExFUklUSC5jbGVhciBkYiwgcmVzdW1lXG4gICAgICAgIGlucHV0ID0gRC5jcmVhdGVfdGhyb3VnaHN0cmVhbSgpXG4gICAgICAgIGlucHV0XG4gICAgICAgICAgLnBpcGUgSE9MTEVSSVRILiR3cml0ZSBkYiwgM1xuICAgICAgICAgICMgLnBpcGUgRC4kc2hvdygpXG4gICAgICAgICAgLnBpcGUgRC4kb25fZW5kID0+XG4gICAgICAgICAgICB1cmdlIFwidGVzdCBkYXRhIHdyaXR0ZW5cIlxuICAgICAgICAgICAgaGFuZGxlciBudWxsXG4gICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgICAgZm9yIHVybF9rZXkgaW4gQF9mZWVkX3Rlc3RfZGF0YS5wcm9iZXNbIHByb2Jlc19pZHggXVxuICAgICAgICAgIGtleSA9IEhPTExFUklUSC5rZXlfZnJvbV91cmwgZGIsIHVybF9rZXlcbiAgICAgICAgICBpbnB1dC53cml0ZSBrZXlcbiAgICAgICAgaW5wdXQuZW5kKClcbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGVsc2UgcmV0dXJuIGhhbmRsZXIgbmV3IEVycm9yIFwiaWxsZWdhbCBwcm9iZXMgaW5kZXggI3tycHIgcHJvYmVzX2lkeH1cIlxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHJldHVybiBudWxsXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9mZWVkX3Rlc3RfZGF0YS5wcm9iZXMgPSBbXVxuXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkBfZmVlZF90ZXN0X2RhdGEucHJvYmVzLnB1c2ggW1xuICBbICfwp7efMScsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgICAgICAgICAgICAgIDEsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ/Cnt58yJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAgICAgICAgICAgICAgMiwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn8Ke3nzMnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsICAgICAgICAgICAgICAzLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfwp7efNCcsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgICAgICAgICAgICAgIDQsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ/Cnt58nLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsICAgICAgICAgICAgICA1LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn8Ke3nzYnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsICAgICAgICAgICAgICA2LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfwp7efJywgJ2NwL2NpZCcsICAgICAgICAgICAgICAgICAgICAgICAgICAgMTYzMjk1LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ/Cnt58nLCAnZ3VpZGUvdWNoci9oYXMnLCAgICAgICAgICAgICAgICAgICBbICflhasnLCAn5YiAJywgJ+WugCcsICfuh7onLCAn6LKdJywgXSwgICAgICBdXG4gIFsgJ/Cnt58nLCAncmFuay9janQnLCAgICAgICAgICAgICAgICAgICAgICAgICA1NDMyLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5YWrJywgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCAgICAgICAgICAnMzQnLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+WIgCcsICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgICAgICAgICAgJzUoMTIpMycsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICflroAnLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICAgICAgICAgICc0NCcsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn7oe6JywgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCAgICAgICAgICAnMTInLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+iynScsICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgICAgICAgICAgJzI1KDEyKScsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICflhasnLCAncmFuay9janQnLCAgICAgICAgICAgICAgICAgICAgICAgICAxMjU0MSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5YiAJywgJ3JhbmsvY2p0JywgICAgICAgICAgICAgICAgICAgICAgICAgMTI1NDIsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+WugCcsICdyYW5rL2NqdCcsICAgICAgICAgICAgICAgICAgICAgICAgIDEyNTQzLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfuh7onLCAncmFuay9janQnLCAgICAgICAgICAgICAgICAgICAgICAgICAxMjU0NCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn6LKdJywgJ3JhbmsvY2p0JywgICAgICAgICAgICAgICAgICAgICAgICAgMTI1NDUsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIF1cblxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5AX2ZlZWRfdGVzdF9kYXRhLnByb2Jlcy5wdXNoIFtcbiAgJ3NvfGdseXBoOuWKrHxjcC9mbmNyOnUtY2prLzUyYWN8MCdcbiAgJ3NvfGdseXBoOumCrXxjcC9mbmNyOnUtY2prLzkwYWR8MCdcbiAgJ3NvfGdseXBoOvCgtKZ8Y3AvZm5jcjp1LWNqay14Yi8yMGQyNnwwJ1xuICAnc298Z2x5cGg68KS/r3xjcC9mbmNyOnUtY2prLXhiLzI0ZmVmfDAnXG4gICdzb3xnbHlwaDrwp5G0fGNwL2ZuY3I6dS1jamsteGIvMjc0NzR8MCdcbiAgJ3NvfGdseXBoOvCokqF8Y3AvZm5jcjp1LWNqay14Yi8yODRhMXwwJ1xuICAnc298Z2x5cGg68Kqap3xjcC9mbmNyOnUtY2prLXhiLzJhNmE3fDAnXG4gICdzb3xnbHlwaDrwqpqrfGNwL2ZuY3I6dS1jamsteGIvMmE2YWJ8MCdcbiAgJ3NvfGdseXBoOvCkv698c3Ryb2tlb3JkZXI6MzUyNTEzNTUzMjU0fDAnXG4gICdzb3xnbHlwaDrwoLSmfHN0cm9rZW9yZGVyOjM1MjUxNDExMjF8MCdcbiAgJ3NvfGdseXBoOvCokqF8c3Ryb2tlb3JkZXI6MzUyNTE0NTR8MCdcbiAgJ3NvfGdseXBoOumCrXxzdHJva2VvcmRlcjozNTI1MTUyfDAnXG4gICdzb3xnbHlwaDrwqpqrfHN0cm9rZW9yZGVyOjM1MjUxNTI1MTExNTExNTExMzU0MXwwJ1xuICAnc298Z2x5cGg68Kqap3xzdHJva2VvcmRlcjozNTI1MTUyNTExMjUxMTUxMXwwJ1xuICAnc298Z2x5cGg68KeRtHxzdHJva2VvcmRlcjozNTI1MTUyNTEyMTQyNTEyMTR8MCdcbiAgJ3NvfGdseXBoOuWKrHxzdHJva2VvcmRlcjozNTI1MTUzfDAnXG4gIF1cblxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwid3JpdGUgd2l0aG91dCBlcnJvclwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ID0gLTFcbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgQF9mZWVkX3Rlc3RfZGF0YSBkYiwgcHJvYmVzX2lkeCwgcmVzdW1lXG4gICAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZWFkIHdpdGhvdXQgZXJyb3JcIiBdID0gKCBULCBkb25lICkgLT5cbiAgcHJvYmVzX2lkeCAgPSAwXG4gIGlkeCA9IC0xXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHJlc3VtZVxuICAgIGlucHV0ID0gSE9MTEVSSVRILmNyZWF0ZV9mYWNldHN0cmVhbSBkYlxuICAgIGlucHV0XG4gICAgICAjIC5waXBlIEhPTExFUklUSC4kdXJsX2Zyb21fa2V5IGRiXG4gICAgICAucGlwZSAkICggWyBrZXksIHZhbHVlLCBdLCBzZW5kICkgPT5cbiAgICAgICAgaWR4ICs9ICsxXG4gICAgICAgICMgVC5lcSBrZXksIG1hdGNoZXJzWyBpZHggXVxuICAgICAgLnBpcGUgRC4kb25fZW5kID0+IGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCBrZXlzIHdpdGhvdXQgZXJyb3IgKDEpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEhPTExFUklUSC5jbGVhciBkYiwgcmVzdW1lXG4gICAgZm9yIGlkeCBpbiBbIDAgLi4uIDEwIF1cbiAgICAgIGRiWyAnJXNlbGYnIF0ucHV0ICggSE9MTEVSSVRILl9lbmNvZGUgZGIsIFsgJ3gnLCBpZHgsICd4JywgXSApLCBIT0xMRVJJVEguX3plcm9fZW5jXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwcm9iZV9pZHggPSA0XG4gICAgY291bnQgICAgID0gMFxuICAgIHF1ZXJ5ICAgICA9IEhPTExFUklUSC5fcXVlcnlfZnJvbV9wcmVmaXggZGIsIFsgJ3gnLCBwcm9iZV9pZHgsIF1cbiAgICBpbnB1dCAgICAgPSBkYlsgJyVzZWxmJyBdLmNyZWF0ZVJlYWRTdHJlYW0gcXVlcnlcbiAgICBpbnB1dFxuICAgICAgLnBpcGUgJCAoIHsga2V5LCB2YWx1ZSwgfSwgc2VuZCApID0+XG4gICAgICAgIGNvdW50ICs9IDFcbiAgICAgICAgVC5lcSAoIEhPTExFUklUSC5fZGVjb2RlIGRiLCBrZXkgKVsgMSBdLCBwcm9iZV9pZHhcbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICBULmVxIGNvdW50LCAxXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCBrZXlzIHdpdGhvdXQgZXJyb3IgKDIpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEhPTExFUklUSC5jbGVhciBkYiwgcmVzdW1lXG4gICAgZm9yIGlkeCBpbiBbIDAgLi4uIDEwIF1cbiAgICAgIGRiWyAnJXNlbGYnIF0ucHV0ICggSE9MTEVSSVRILl9lbmNvZGUgZGIsIFsgJ3gnLCBpZHgsICd4JywgXSApLCBIT0xMRVJJVEguX3plcm9fZW5jXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwcm9iZV9pZHggPSA0XG4gICAgY291bnQgICAgID0gMFxuICAgIHByZWZpeCAgICA9IFsgJ3gnLCBwcm9iZV9pZHgsIF1cbiAgICBpbnB1dCAgICAgPSBIT0xMRVJJVEguY3JlYXRlX2ZhY2V0c3RyZWFtIGRiLCBwcmVmaXhcbiAgICBpbnB1dFxuICAgICAgLnBpcGUgJCAoIGZhY2V0LCBzZW5kICkgPT5cbiAgICAgICAgY291bnQgKz0gMVxuICAgICAgICBbIGtleSwgdmFsdWUsIF0gPSBmYWNldFxuICAgICAgICBULmVxIGtleVsgMSBdLCBwcm9iZV9pZHhcbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICBULmVxIGNvdW50LCAxXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCBrZXlzIHdpdGhvdXQgZXJyb3IgKDMpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEhPTExFUklUSC5jbGVhciBkYiwgcmVzdW1lXG4gICAgZm9yIGlkeCBpbiBbIDAgLi4uIDEwIF1cbiAgICAgIGRiWyAnJXNlbGYnIF0ucHV0ICggSE9MTEVSSVRILl9lbmNvZGUgZGIsIFsgJ3gnLCBpZHgsICd4JywgXSApLCBIT0xMRVJJVEguX3plcm9fZW5jXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwcm9iZV9pZHggPSAzXG4gICAgY291bnQgICAgID0gMFxuICAgIGRlbHRhICAgICA9IDJcbiAgICBsbyAgICAgICAgPSBbICd4JywgcHJvYmVfaWR4LCBdXG4gICAgaGkgICAgICAgID0gWyAneCcsIHByb2JlX2lkeCArIGRlbHRhLCBdXG4gICAgcXVlcnkgICAgID0geyBndGU6ICggSE9MTEVSSVRILl9lbmNvZGUgZGIsIGxvICksIGx0ZTogKCBIT0xMRVJJVEguX3F1ZXJ5X2Zyb21fcHJlZml4IGRiLCBoaSApWyAnbHRlJyBdLCB9XG4gICAgaW5wdXQgICAgID0gZGJbICclc2VsZicgXS5jcmVhdGVSZWFkU3RyZWFtIHF1ZXJ5XG4gICAgaW5wdXRcbiAgICAgIC5waXBlICQgKCB7IGtleSwgdmFsdWUsIH0sIHNlbmQgKSA9PlxuICAgICAgICBjb3VudCArPSAxXG4gICAgICAgIFQuZXEgKCBIT0xMRVJJVEguX2RlY29kZSBkYiwga2V5IClbIDEgXSwgcHJvYmVfaWR4ICsgY291bnQgLSAxXG4gICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgVC5lcSBjb3VudCwgZGVsdGEgKyAxXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCBrZXlzIHdpdGhvdXQgZXJyb3IgKDQpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEhPTExFUklUSC5jbGVhciBkYiwgcmVzdW1lXG4gICAgZm9yIGlkeCBpbiBbIDAgLi4uIDEwIF1cbiAgICAgIGRiWyAnJXNlbGYnIF0ucHV0ICggSE9MTEVSSVRILl9lbmNvZGUgZGIsIFsgJ3gnLCBpZHgsICd4JywgXSApLCBIT0xMRVJJVEguX3plcm9fZW5jXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwcm9iZV9pZHggPSAzXG4gICAgY291bnQgICAgID0gMFxuICAgIGRlbHRhICAgICA9IDJcbiAgICBsbyAgICAgICAgPSBbICd4JywgcHJvYmVfaWR4LCBdXG4gICAgaGkgICAgICAgID0gWyAneCcsIHByb2JlX2lkeCArIGRlbHRhLCBdXG4gICAgaW5wdXQgICAgID0gSE9MTEVSSVRILmNyZWF0ZV9mYWNldHN0cmVhbSBkYiwgbG8sIGhpXG4gICAgaW5wdXRcbiAgICAgIC5waXBlICQgKCBbIGtleSwgdmFsdWUsIF0sIHNlbmQgKSA9PlxuICAgICAgICBjb3VudCArPSAxXG4gICAgICAgIFQuZXEga2V5WyAxIF0sIHByb2JlX2lkeCArIGNvdW50IC0gMVxuICAgICAgLnBpcGUgRC4kb25fZW5kID0+XG4gICAgICAgIFQuZXEgY291bnQsIGRlbHRhICsgMVxuICAgICAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcImNyZWF0ZV9mYWNldHN0cmVhbSB0aHJvd3Mgd2l0aCB3cm9uZyBhcmd1bWVudHNcIiBdID0gKCBULCBkb25lICkgLT5cbiAgbWVzc2FnZSA9IFwibXVzdCBnaXZlIGBsb19oaW50YCB3aGVuIGBoaV9oaW50YCBpcyBnaXZlblwiXG4gIFQudGhyb3dzIG1lc3NhZ2UsICggLT4gSE9MTEVSSVRILmNyZWF0ZV9mYWNldHN0cmVhbSBkYiwgbnVsbCwgWyAneHh4JywgXSApXG4gIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCBQT1MgZmFjZXRzXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHByb2Jlc19pZHggID0gMFxuICBpZHggICAgICAgICA9IC0xXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAga2V5X21hdGNoZXJzID0gW1xuICAgIFsgJ3BvcycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgMiwgJ/Cnt58yJyBdXG4gICAgWyAncG9zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAzLCAn8Ke3nzMnIF1cbiAgICBbICdwb3MnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDQsICfwp7efNCcgXVxuICAgIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBwaHJhc2VfbWF0Y2hlcnMgPSBbXG4gICAgWyAn8Ke3nzInLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDIgXVxuICAgIFsgJ/Cnt58zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAzIF1cbiAgICBbICfwp7efNCcsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgNCBdXG4gICAgXVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHJlc3VtZVxuICAgIGxvID0gWyAncG9zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAyLCBdXG4gICAgaGkgPSBbICdwb3MnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDQsIF1cbiAgICAjIGlucHV0ICAgPSBIT0xMRVJJVEguY3JlYXRlX2tleXN0cmVhbSBkYiwgbG9cbiAgICBpbnB1dCAgID0gSE9MTEVSSVRILmNyZWF0ZV9mYWNldHN0cmVhbSBkYiwgbG8sIGhpXG4gICAgaW5wdXRcbiAgICAgICMgLnBpcGUgSE9MTEVSSVRILiR1cmxfZnJvbV9rZXkgZGJcbiAgICAgIC5waXBlICQgKCBbIGtleSwgdmFsdWUsIF0sIHNlbmQgKSA9PlxuICAgICAgICBpZHggKz0gKzFcbiAgICAgICAgcGhyYXNlID0gSE9MTEVSSVRILmFzX3BocmFzZSBkYiwga2V5LCB2YWx1ZVxuICAgICAgICBULmVxIGtleSwga2V5X21hdGNoZXJzWyBpZHggXVxuICAgICAgICBULmVxIHBocmFzZSwgcGhyYXNlX21hdGNoZXJzWyBpZHggXVxuICAgICAgLnBpcGUgRC4kb25fZW5kID0+IGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCBQT1MgcGhyYXNlcyAoMSlcIiBdID0gKCBULCBkb25lICkgLT5cbiAgcHJvYmVzX2lkeCAgPSAwXG4gIGlkeCAgICAgICAgID0gLTFcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBtYXRjaGVycyA9IFtcbiAgICBbICfwp7efMicsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgMiBdXG4gICAgWyAn8Ke3nzMnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDMgXVxuICAgIFsgJ/Cnt580JywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCA0IF1cbiAgICBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgQF9mZWVkX3Rlc3RfZGF0YSBkYiwgcHJvYmVzX2lkeCwgcmVzdW1lXG4gICAgbG8gPSBbICdwb3MnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDIsIF1cbiAgICBoaSA9IFsgJ3BvcycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgNCwgXVxuICAgIGlucHV0ICAgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgbG8sIGhpXG4gICAgaW5wdXRcbiAgICAgIC5waXBlICQgKCBwaHJhc2UsIHNlbmQgKSA9PlxuICAgICAgICBpZHggKz0gKzFcbiAgICAgICAgVC5lcSBwaHJhc2UsIG1hdGNoZXJzWyBpZHggXVxuICAgICAgLnBpcGUgRC4kb25fZW5kID0+IGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCBQT1MgcGhyYXNlcyAoMilcIiBdID0gKCBULCBkb25lICkgLT5cbiAgcHJvYmVzX2lkeCAgPSAwXG4gIGlkeCAgICAgICAgID0gLTFcbiAgY291bnQgICAgICAgPSAwXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgbWF0Y2hlcnMgPSBbXG4gICAgWyAn8Ke3nycsICdndWlkZS91Y2hyL2hhcycsICflhasnLCAwIF1cbiAgICBbICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgJ+WIgCcsIDEgXVxuICAgIFsgJ/Cnt58nLCAnZ3VpZGUvdWNoci9oYXMnLCAn5a6AJywgMiBdXG4gICAgWyAn8Ke3nycsICdndWlkZS91Y2hyL2hhcycsICfosp0nLCA0IF1cbiAgICBbICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgJ+6HuicsIDMgXVxuICAgIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBAX2ZlZWRfdGVzdF9kYXRhIGRiLCBwcm9iZXNfaWR4LCByZXN1bWVcbiAgICBwcmVmaXggICAgPSBbICdwb3MnLCAnZ3VpZGUvdWNoci9oYXMnLCBdXG4gICAgaW5wdXQgICAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIHByZWZpeFxuICAgIHNldHRpbmdzICA9IHsgaW5kZXhlZDogbm8sIH1cbiAgICBpbnB1dFxuICAgICAgLnBpcGUgJCAoIHBocmFzZSwgc2VuZCApID0+XG4gICAgICAgIGNvdW50ICArPSArMVxuICAgICAgICBpZHggICAgKz0gKzFcbiAgICAgICAgVC5lcSBwaHJhc2UsIG1hdGNoZXJzWyBpZHggXVxuICAgICAgLnBpcGUgRC4kb25fZW5kID0+XG4gICAgICAgIFQuZXEgY291bnQsIG1hdGNoZXJzLmxlbmd0aFxuICAgICAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgU1BPIHBocmFzZXNcIiBdID0gKCBULCBkb25lICkgLT5cbiAgcHJvYmVzX2lkeCAgPSAwXG4gIGlkeCAgICAgICAgID0gLTFcbiAgY291bnQgICAgICAgPSAwXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgbWF0Y2hlcnMgPSBbXG4gICAgWyAn8Ke3nycsICdjcC9jaWQnLCAxNjMyOTUgXVxuICAgIFsgJ/Cnt58nLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDUgXVxuICAgIFsgJ/Cnt58nLCAnZ3VpZGUvdWNoci9oYXMnLCBbICflhasnLCAn5YiAJywgJ+WugCcsICfuh7onLCAn6LKdJyBdIF1cbiAgICBbICfwp7efJywgJ3JhbmsvY2p0JywgNTQzMiBdXG4gICAgWyAn8Ke3nzEnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDEgXVxuICAgIFsgJ/Cnt58yJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAyIF1cbiAgICBbICfwp7efMycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgMyBdXG4gICAgWyAn8Ke3nzQnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDQgXVxuICAgIFsgJ/Cnt582JywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCA2IF1cbiAgICBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgQF9mZWVkX3Rlc3RfZGF0YSBkYiwgcHJvYmVzX2lkeCwgcmVzdW1lXG4gICAgcHJlZml4ICA9IFsgJ3NwbycsICfwp7efJywgXVxuICAgIGlucHV0ICAgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgcHJlZml4XG4gICAgaW5wdXRcbiAgICAgIC5waXBlICQgKCBwaHJhc2UsIHNlbmQgKSA9PlxuICAgICAgICBjb3VudCAgKz0gKzFcbiAgICAgICAgaWR4ICAgICs9ICsxXG4gICAgICAgIFQuZXEgcGhyYXNlLCBtYXRjaGVyc1sgaWR4IF1cbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICBULmVxIGNvdW50LCBtYXRjaGVycy5sZW5ndGhcbiAgICAgICAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZWFkIHdpdGggc3ViLXJlYWQgKDEpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHByb2Jlc19pZHggID0gMFxuICBpZHggICAgICAgICA9IC0xXG4gIGNvdW50ICAgICAgID0gMFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIG1hdGNoZXJzID0gW1xuICAgIFsgJ/Cnt58nLCBbICflhasnLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICczNCcgXSBdXG4gICAgXVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHJlc3VtZVxuICAgIHByZWZpeCAgICA9IFsgJ3NwbycsICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgXVxuICAgIGlucHV0ICAgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBwcmVmaXhcbiAgICBzZXR0aW5ncyAgPSB7IGluZGV4ZWQ6IG5vLCB9XG4gICAgaW5wdXRcbiAgICAgIC5waXBlIEhPTExFUklUSC5yZWFkX3N1YiBkYiwgc2V0dGluZ3MsICggWyBnbHlwaCwgcHJkLCBndWlkZXMsIF0gKSA9PlxuICAgICAgICBzdWJfaW5wdXQgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgWyAnc3BvJywgZ3VpZGVzWyAwIF0sICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgXVxuICAgICAgICByZXR1cm4gWyBnbHlwaCwgc3ViX2lucHV0LCBdXG4gICAgICAucGlwZSAkICggcGhyYXNlLCBzZW5kICkgPT5cbiAgICAgICAgY291bnQgICs9ICsxXG4gICAgICAgIGlkeCAgICArPSArMVxuICAgICAgICBULmVxIHBocmFzZSwgbWF0Y2hlcnNbIGlkeCBdXG4gICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgVC5lcSBjb3VudCwgbWF0Y2hlcnMubGVuZ3RoXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCB3aXRoIHN1Yi1yZWFkICgyKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ICAgICAgICAgPSAtMVxuICBjb3VudCAgICAgICA9IDBcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBtYXRjaGVycyA9IFtcbiAgICBbICfwp7efJywgWyAn5YWrJywgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCAnMzQnIF0gXVxuICAgIFsgJ/Cnt58nLCBbICfliIAnLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICc1KDEyKTMnIF0gXVxuICAgIFsgJ/Cnt58nLCBbICflroAnLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICc0NCcgXSBdXG4gICAgWyAn8Ke3nycsIFsgJ+iynScsICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgJzI1KDEyKScgXSBdXG4gICAgWyAn8Ke3nycsIFsgJ+6HuicsICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgJzEyJyBdIF1cbiAgICBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgQF9mZWVkX3Rlc3RfZGF0YSBkYiwgcHJvYmVzX2lkeCwgcmVzdW1lXG4gICAgcHJlZml4ICAgID0gWyAncG9zJywgJ2d1aWRlL3VjaHIvaGFzJywgXVxuICAgIGlucHV0ICAgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBwcmVmaXhcbiAgICBzZXR0aW5ncyAgPSB7IGluZGV4ZWQ6IG5vLCB9XG4gICAgaW5wdXRcbiAgICAgIC5waXBlIEhPTExFUklUSC5yZWFkX3N1YiBkYiwgc2V0dGluZ3MsICggcGhyYXNlICkgPT5cbiAgICAgICAgWyBnbHlwaCwgcHJkLCBndWlkZSwgXSAgPSBwaHJhc2VcbiAgICAgICAgcHJlZml4ICAgICAgICAgICAgICAgICAgPSBbICdzcG8nLCBndWlkZSwgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCBdXG4gICAgICAgIHN1Yl9pbnB1dCAgICAgICAgICAgICAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIHByZWZpeFxuICAgICAgICByZXR1cm4gWyBnbHlwaCwgc3ViX2lucHV0LCBdXG4gICAgICAucGlwZSAkICggcGhyYXNlLCBzZW5kICkgPT5cbiAgICAgICAgZGVidWcgJ8KpcXVQYmcnLCBKU09OLnN0cmluZ2lmeSBwaHJhc2VcbiAgICAgICAgY291bnQgICs9ICsxXG4gICAgICAgIGlkeCAgICArPSArMVxuICAgICAgICBULmVxIHBocmFzZSwgbWF0Y2hlcnNbIGlkeCBdXG4gICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgVC5lcSBjb3VudCwgbWF0Y2hlcnMubGVuZ3RoXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCB3aXRoIHN1Yi1yZWFkICgzKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ICAgICAgICAgPSAtMVxuICBjb3VudCAgICAgICA9IDBcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBtYXRjaGVycyA9IFtcbiAgICBbW1wi8Ke3n1wiLFwi5YWrXCIsXCIzNFwiXSxbXCLlhatcIixcInJhbmsvY2p0XCIsMTI1NDFdXVxuICAgIFtbXCLwp7efXCIsXCLliIBcIixcIjUoMTIpM1wiXSxbXCLliIBcIixcInJhbmsvY2p0XCIsMTI1NDJdXVxuICAgIFtbXCLwp7efXCIsXCLlroBcIixcIjQ0XCJdLFtcIuWugFwiLFwicmFuay9janRcIiwxMjU0M11dXG4gICAgW1tcIvCnt59cIixcIuiynVwiLFwiMjUoMTIpXCJdLFtcIuiynVwiLFwicmFuay9janRcIiwxMjU0NV1dXG4gICAgW1tcIvCnt59cIixcIu6HulwiLFwiMTJcIl0sW1wi7oe6XCIsXCJyYW5rL2NqdFwiLDEyNTQ0XV1cbiAgICBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgQF9mZWVkX3Rlc3RfZGF0YSBkYiwgcHJvYmVzX2lkeCwgcmVzdW1lXG4gICAgcHJlZml4ICAgID0gWyAncG9zJywgJ2d1aWRlL3VjaHIvaGFzJywgXVxuICAgIGlucHV0ICAgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBwcmVmaXhcbiAgICBzZXR0aW5ncyAgPSB7IGluZGV4ZWQ6IG5vLCB9XG4gICAgaW5wdXRcbiAgICAgIC5waXBlIEhPTExFUklUSC5yZWFkX3N1YiBkYiwgc2V0dGluZ3MsICggcGhyYXNlICkgPT5cbiAgICAgICAgWyBnbHlwaCwgcHJkLCBndWlkZSwgXSAgPSBwaHJhc2VcbiAgICAgICAgcHJlZml4ICAgICAgICAgICAgICAgICAgPSBbICdzcG8nLCBndWlkZSwgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCBdXG4gICAgICAgIHN1Yl9pbnB1dCAgICAgICAgICAgICAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIHByZWZpeFxuICAgICAgICByZXR1cm4gWyBnbHlwaCwgc3ViX2lucHV0LCBdXG4gICAgICAucGlwZSBIT0xMRVJJVEgucmVhZF9zdWIgZGIsIHNldHRpbmdzLCAoIHhwaHJhc2UgKSA9PlxuICAgICAgICBbIGdseXBoLCBbIGd1aWRlLCBwcmQsIHNoYXBlY2xhc3MsIF0gXSAgPSB4cGhyYXNlXG4gICAgICAgIHByZWZpeCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFsgJ3NwbycsIGd1aWRlLCAncmFuay9janQnLCBdXG4gICAgICAgIHN1Yl9pbnB1dCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBwcmVmaXhcbiAgICAgICAgcmV0dXJuIFsgWyBnbHlwaCwgZ3VpZGUsIHNoYXBlY2xhc3MsIF0sIHN1Yl9pbnB1dCwgXVxuICAgICAgLnBpcGUgJCAoIHhwaHJhc2UsIHNlbmQgKSA9PlxuICAgICAgICBkZWJ1ZyAnwqlxdVBiZycsIEpTT04uc3RyaW5naWZ5IHhwaHJhc2VcbiAgICAgICAgY291bnQgICs9ICsxXG4gICAgICAgIGlkeCAgICArPSArMVxuICAgICAgICBULmVxIHhwaHJhc2UsIG1hdGNoZXJzWyBpZHggXVxuICAgICAgLnBpcGUgRC4kb25fZW5kID0+XG4gICAgICAgIFQuZXEgY291bnQsIG1hdGNoZXJzLmxlbmd0aFxuICAgICAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5nZXRfbmV3X2RiX25hbWUgPSAtPlxuICBnZXRfbmV3X2RiX25hbWUuaWR4ICs9ICsxXG4gIHJldHVybiBcIm15ZGItI3tnZXRfbmV3X2RiX25hbWUuaWR4fVwiXG5nZXRfbmV3X2RiX25hbWUuaWR4ID0gMFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbnJlYWRfYWxsX2tleXMgPSAoIGRiLCBoYW5kbGVyICkgLT5cbiAgWiA9IFtdXG4gIGlucHV0ID0gZGIuY3JlYXRlS2V5U3RyZWFtKClcbiAgaW5wdXQub24gJ2VuZCcsIC0+IGhhbmRsZXIgbnVsbCwgWlxuICBpbnB1dFxuICAgIC5waXBlICQgKCBkYXRhLCBzZW5kICkgPT4gWi5wdXNoIGRhdGFcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInNvcnQgdXNpbmcgbWVtZG93blwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICBzZXR0aW5ncyA9XG4gICAgICBkYjogICAgICAgICAgIG1lbWRvd25cbiAgICAgIGtleUVuY29kaW5nOiAgJ2JpbmFyeSdcbiAgICBkYiA9IGxldmVsdXAgZ2V0X25ld19kYl9uYW1lKCksIHNldHRpbmdzXG4gICAgcHJvYmVzID0gW1xuICAgICAgJ2EnXG4gICAgICAnYWInXG4gICAgICAnYWJjJ1xuICAgICAgJ2FiY1xceDAwJ1xuICAgICAgJ2FiY1xceDAwYSdcbiAgICAgICdhYmNhJ1xuICAgICAgJ2FiY2InXG4gICAgICAnYWJjYydcbiAgICAgICdhYmNkJ1xuICAgICAgJ2FiY2RlJ1xuICAgICAgJ2FiY2RlZidcbiAgICAgICdhYmNkZWZnJyBdXG4gICAgbWF0Y2hlcnMgPSBbXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIDB4NjIsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCAweDYyLCAweDYzLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgMHg2MiwgMHg2MywgMHgwMCwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIDB4NjIsIDB4NjMsIDB4MDAsIDB4NjEsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCAweDYyLCAweDYzLCAweDYxLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgMHg2MiwgMHg2MywgMHg2MiwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIDB4NjIsIDB4NjMsIDB4NjMsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCAweDYyLCAweDYzLCAweDY0LCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgMHg2MiwgMHg2MywgMHg2NCwgMHg2NSwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIDB4NjIsIDB4NjMsIDB4NjQsIDB4NjUsIDB4NjYsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCAweDYyLCAweDYzLCAweDY0LCAweDY1LCAweDY2LCAweDY3LCBdIF1cbiAgICBDTkQuc2h1ZmZsZSBwcm9iZXNcbiAgICBmb3IgcHJvYmUgaW4gcHJvYmVzXG4gICAgICBwcm9iZV9iZnIgPSBuZXcgQnVmZmVyIHByb2JlLCAndXRmLTgnXG4gICAgICB5aWVsZCBkYi5wdXQgcHJvYmVfYmZyLCAnMScsIHJlc3VtZVxuICAgIHByb2JlcyA9IHlpZWxkIHJlYWRfYWxsX2tleXMgZGIsIHJlc3VtZVxuICAgIGZvciBwcm9iZSwgcHJvYmVfaWR4IGluIHByb2Jlc1xuICAgICAgVC5lcSBwcm9iZSwgbWF0Y2hlcnNbIHByb2JlX2lkeCBdXG4gICAgICAjIGRlYnVnICfCqUdwTEtCJywgcnByIHByb2JlLnRvU3RyaW5nICd1dGYtOCdcbiAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcIkgyIGNvZGVjIGBlbmNvZGVgIHRocm93cyBvbiBhbnl0aGluZyBidXQgYSBsaXN0XCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIFQudGhyb3dzIFwiZXhwZWN0ZWQgYSBsaXN0LCBnb3QgYSB0ZXh0XCIsICAgICAgICAgKCAtPiBDT0RFQy5lbmNvZGUgJ3VuYWNjYXB0YWJsZScgKVxuICBULnRocm93cyBcImV4cGVjdGVkIGEgbGlzdCwgZ290IGEgbnVtYmVyXCIsICAgICAgICggLT4gQ09ERUMuZW5jb2RlIDQyIClcbiAgVC50aHJvd3MgXCJleHBlY3RlZCBhIGxpc3QsIGdvdCBhIGJvb2xlYW5cIiwgICAgICAoIC0+IENPREVDLmVuY29kZSB0cnVlIClcbiAgVC50aHJvd3MgXCJleHBlY3RlZCBhIGxpc3QsIGdvdCBhIGJvb2xlYW5cIiwgICAgICAoIC0+IENPREVDLmVuY29kZSBmYWxzZSApXG4gIFQudGhyb3dzIFwiZXhwZWN0ZWQgYSBsaXN0LCBnb3QgYSBqc3VuZGVmaW5lZFwiLCAgKCAtPiBDT0RFQy5lbmNvZGUoKSApXG4gIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwic29ydCB3aXRoIEgyIGNvZGVjXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHNldHRpbmdzID1cbiAgICAgIGRiOiAgICAgICAgICAgbWVtZG93blxuICAgICAga2V5RW5jb2Rpbmc6ICAnYmluYXJ5J1xuICAgIGRiID0gbGV2ZWx1cCBnZXRfbmV3X2RiX25hbWUoKSwgc2V0dGluZ3NcbiAgICBwcm9iZXMgPSBbXG4gICAgICAnYSdcbiAgICAgICdhYidcbiAgICAgICdhYmMnXG4gICAgICAnYWJjXFx4MDAnXG4gICAgICAnYWJjYVxceDAwJ1xuICAgICAgJ2FiY1xceDAwYSdcbiAgICAgICdhYmNhJ1xuICAgICAgJ2FiY2InXG4gICAgICAnYWJjYydcbiAgICAgICdhYmNkJ1xuICAgICAgJ2FiY2RlJ1xuICAgICAgJ2FiY2RlZidcbiAgICAgICdhYmNkZWZnJ1xuICAgICAgXVxuICAgIG1hdGNoZXJzID0gW1xuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCAweDYyLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgMHg2MiwgMHg2MywgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIDB4NjIsIDB4NjMsIDB4MDAsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCAweDYyLCAweDYzLCAweDAwLCAweDYxLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgMHg2MiwgMHg2MywgMHg2MSwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIDB4NjIsIDB4NjMsIDB4NjIsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCAweDYyLCAweDYzLCAweDYzLCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgMHg2MiwgMHg2MywgMHg2NCwgXVxuICAgICAgbmV3IEJ1ZmZlciBbIDB4NjEsIDB4NjIsIDB4NjMsIDB4NjQsIDB4NjUsIF1cbiAgICAgIG5ldyBCdWZmZXIgWyAweDYxLCAweDYyLCAweDYzLCAweDY0LCAweDY1LCAweDY2LCBdXG4gICAgICBuZXcgQnVmZmVyIFsgMHg2MSwgMHg2MiwgMHg2MywgMHg2NCwgMHg2NSwgMHg2NiwgMHg2NywgXSBdXG4gICAgIyBDTkQuc2h1ZmZsZSBwcm9iZXNcbiAgICBmb3IgcHJvYmUgaW4gcHJvYmVzXG4gICAgICBwcm9iZV9iZnIgPSBDT0RFQy5lbmNvZGUgWyBwcm9iZSwgXVxuICAgICAgeWllbGQgZGIucHV0IHByb2JlX2JmciwgJzEnLCByZXN1bWVcbiAgICBwcm9iZV9iZnJzICA9IHlpZWxkIHJlYWRfYWxsX2tleXMgZGIsIHJlc3VtZVxuICAgIHByb2JlcyAgICAgID0gKCBDT0RFQy5kZWNvZGUgcHJvYmVfYmZyIGZvciBwcm9iZV9iZnIgaW4gcHJvYmVfYmZycyApXG4gICAgc2hvd19rZXlzX2FuZF9rZXlfYmZycyBwcm9iZXMsIHByb2JlX2JmcnNcbiAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5zaG93X2tleXNfYW5kX2tleV9iZnJzID0gKCBrZXlzLCBrZXlfYmZycyApIC0+XG4gIGYgPSAoIHAgKSAtPiAoIHQgZm9yIHQgaW4gKCBwLnRvU3RyaW5nICdoZXgnICkuc3BsaXQgLyguLikvIHdoZW4gdCBpc250ICcnICkuam9pbiAnICdcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBjb2x1bW5pZnlfc2V0dGluZ3MgPVxuICAgIHBhZGRpbmdDaHI6ICcgJ1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGRhdGEgICAgICA9IFtdXG4gIGtleV9iZnJzICA9ICggZiBwIGZvciBwIGluIGtleV9iZnJzIClcbiAgZm9yIGtleSwgaWR4IGluIGtleXNcbiAgICBrZXlfdHh0ID0gKCBycHIga2V5ICkucmVwbGFjZSAvXFxcXHUwMDAwL2csICfiiIcnXG4gICAgZGF0YS5wdXNoIHsgJ3N0cic6IGtleV90eHQsICdiZnInOiBrZXlfYmZyc1sgaWR4IF19XG4gIGhlbHAgJ1xcbicgKyBDTkQuY29sdW1uaWZ5IGRhdGEsIGNvbHVtbmlmeV9zZXR0aW5nc1xuICByZXR1cm4gbnVsbFxuXG5cbiMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEBbIFwia2V5cyAwXCIgXSA9ICggVCwgZG9uZSApIC0+XG4jICAga2V5XzAgICA9IEhPTExFUklUSC5uZXdfa2V5ICAgICBkYiwgJ3NvJywgJ2dseXBoJywgJ+WuticsICdzdHJva2VvcmRlcicsICc0NDUxMzUzMzM0J1xuIyAgIGtleV8xICAgPSBIT0xMRVJJVEgubmV3X3NvX2tleSAgZGIsICAgICAgICdnbHlwaCcsICflrrYnLCAnc3Ryb2tlb3JkZXInLCAnNDQ1MTM1MzMzNCdcbiMgICBtYXRjaGVyID0gWyAnc28nLCAnZ2x5cGgnLCAn5a62JywgJ3N0cm9rZW9yZGVyJywgJzQ0NTEzNTMzMzQnLCAwIF1cbiMgICBULmVxIGtleV8wLCBtYXRjaGVyXG4jICAgVC5lcSBrZXlfMSwga2V5XzBcbiMgICBkb25lKClcblxuIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQFsgXCJrZXlzIDFcIiBdID0gKCBULCBkb25lICkgLT5cbiMgICBbIHNrLCBzdiwgb2ssIG92LCBdID0gWyAnZ2x5cGgnLCAn5a62JywgJ3N0cm9rZW9yZGVyJywgJzQ0NTEzNTMzMzQnLCBdXG4jICAgWyBzb19rZXlfMCwgb3Nfa2V5XzAsIF0gPSBIT0xMRVJJVEgubmV3X2tleXMgZGIsICdzbycsIHNrLCBzdiwgb2ssIG92XG4jICAgc29fa2V5XzEgPSBIT0xMRVJJVEgubmV3X3NvX2tleSBkYiwgc2ssIHN2LCBvaywgb3ZcbiMgICBvc19rZXlfMSA9IEhPTExFUklUSC5uZXdfb3Nfa2V5IGRiLCBzaywgc3YsIG9rLCBvdlxuIyAgIFQuZXEgc29fa2V5XzAsIHNvX2tleV8xXG4jICAgVC5lcSBvc19rZXlfMCwgb3Nfa2V5XzFcbiMgICBkb25lKClcblxuIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQFsgXCJrZXlzIDJcIiBdID0gKCBULCBkb25lICkgLT5cbiMgICBbIHRfMCwgc2tfMCwgc3ZfMCwgb2tfMCwgb3ZfMCwgaWR4XzAsIF0gPSBbICdzbycsICdnbHlwaCcsICflrrYnLCAnc3Ryb2tlb3JkZXInLCAnNDQ1MTM1MzMzNCcsIDAsIF1cbiMgICBzb19rZXlfMCA9IEhPTExFUklUSC5uZXdfa2V5IGRiLCB0XzAsIHNrXzAsIHN2XzAsIG9rXzAsIG92XzAsIGlkeF8wXG4jICAgWyB0XzEsIHNrXzEsIHN2XzEsIG9rXzEsIG92XzEsIGlkeF8xLCBdID0gSE9MTEVSSVRILmFzX3BocmFzZSBkYiwgc29fa2V5XzBcbiMgICBULmVxIFsgdF8wLCBza18wLCBzdl8wLCBva18wLCBvdl8wLCBpZHhfMCwgXSwgWyB0XzEsIHNrXzEsIHN2XzEsIG9rXzEsIG92XzEsIGlkeF8xLCBdXG4jICAgZG9uZSgpXG5cbiMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEBbIFwib3JkZXJpbmcgYW5kIHZhbHVlIHJlY292ZXJ5IDBcIiBdID0gKCBULCBkb25lICkgLT5cbiMgICBtYXRjaGVycyAgICA9IFtdXG4jICAgcHJvYmVzX2lkeCAgPSAwXG4jICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgIGZvciBwcm9iZSBpbiBAX2ZlZWRfdGVzdF9kYXRhLnByb2Jlc1sgcHJvYmVzX2lkeCBdXG4jICAgICBbIHNrLCBzdiwgb2ssIG92LCBdID0gcHJvYmVcbiMgICAgIG1hdGNoZXJzLnB1c2ggWyAnb3MnLCBvaywgb3YsIHNrLCBzdiwgMCwgXVxuIyAgICAgbWF0Y2hlcnMucHVzaCBbICdzbycsIHNrLCBzdiwgb2ssIG92LCAwLCBdXG4jICAgQF9zb3J0X2xpc3QgbWF0Y2hlcnNcbiMgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgaWR4ID0gLTFcbiMgICBzdGVwICggcmVzdW1lICkgPT5cbiMgICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHJlc3VtZVxuIyAgICAgaW5wdXQgPSBkYlsgJyVzZWxmJyBdLmNyZWF0ZUtleVN0cmVhbSgpXG4jICAgICBpbnB1dFxuIyAgICAgICAucGlwZSAkICgga2V5LCBzZW5kICkgPT5cbiMgICAgICAgICBrZXkgPSBCWVRFV0lTRS5kZWNvZGUga2V5XG4jICAgICAgICAgaWR4ICs9ICsxXG4jICAgICAgICAgVC5lcSBrZXksIG1hdGNoZXJzWyBpZHggXVxuIyAgICAgICAucGlwZSBELiRvbl9lbmQgPT4gZG9uZSgpXG5cbiMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEBbIFwib3JkZXJpbmcgYW5kIHZhbHVlIHJlY292ZXJ5IDFcIiBdID0gKCBULCBkb25lICkgLT5cbiMgICBwcm9iZXNfaWR4ICA9IDFcbiMgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgbWF0Y2hlcnMgICAgPSBbXG4jICAgICAnb3N8Y3AvZm5jcjp1LWNqay14Yi8yMGQyNnxnbHlwaDrwoLSmfDAnXG4jICAgICAnb3N8Y3AvZm5jcjp1LWNqay14Yi8yNGZlZnxnbHlwaDrwpL+vfDAnXG4jICAgICAnb3N8Y3AvZm5jcjp1LWNqay14Yi8yNzQ3NHxnbHlwaDrwp5G0fDAnXG4jICAgICAnb3N8Y3AvZm5jcjp1LWNqay14Yi8yODRhMXxnbHlwaDrwqJKhfDAnXG4jICAgICAnb3N8Y3AvZm5jcjp1LWNqay14Yi8yYTZhN3xnbHlwaDrwqpqnfDAnXG4jICAgICAnb3N8Y3AvZm5jcjp1LWNqay14Yi8yYTZhYnxnbHlwaDrwqpqrfDAnXG4jICAgICAnb3N8Y3AvZm5jcjp1LWNqay81MmFjfGdseXBoOuWKrHwwJ1xuIyAgICAgJ29zfGNwL2ZuY3I6dS1jamsvOTBhZHxnbHlwaDrpgq18MCdcbiMgICAgICdvc3xzdHJva2VvcmRlcjozNTI1MTM1NTMyNTR8Z2x5cGg68KS/r3wwJ1xuIyAgICAgJ29zfHN0cm9rZW9yZGVyOjM1MjUxNDExMjF8Z2x5cGg68KC0pnwwJ1xuIyAgICAgJ29zfHN0cm9rZW9yZGVyOjM1MjUxNDU0fGdseXBoOvCokqF8MCdcbiMgICAgICdvc3xzdHJva2VvcmRlcjozNTI1MTUyfGdseXBoOumCrXwwJ1xuIyAgICAgJ29zfHN0cm9rZW9yZGVyOjM1MjUxNTI1MTExNTExNTExMzU0MXxnbHlwaDrwqpqrfDAnXG4jICAgICAnb3N8c3Ryb2tlb3JkZXI6MzUyNTE1MjUxMTI1MTE1MTF8Z2x5cGg68Kqap3wwJ1xuIyAgICAgJ29zfHN0cm9rZW9yZGVyOjM1MjUxNTI1MTIxNDI1MTIxNHxnbHlwaDrwp5G0fDAnXG4jICAgICAnb3N8c3Ryb2tlb3JkZXI6MzUyNTE1M3xnbHlwaDrliqx8MCdcbiMgICAgICdzb3xnbHlwaDrliqx8Y3AvZm5jcjp1LWNqay81MmFjfDAnXG4jICAgICAnc298Z2x5cGg65YqsfHN0cm9rZW9yZGVyOjM1MjUxNTN8MCdcbiMgICAgICdzb3xnbHlwaDrpgq18Y3AvZm5jcjp1LWNqay85MGFkfDAnXG4jICAgICAnc298Z2x5cGg66YKtfHN0cm9rZW9yZGVyOjM1MjUxNTJ8MCdcbiMgICAgICdzb3xnbHlwaDrwoLSmfGNwL2ZuY3I6dS1jamsteGIvMjBkMjZ8MCdcbiMgICAgICdzb3xnbHlwaDrwoLSmfHN0cm9rZW9yZGVyOjM1MjUxNDExMjF8MCdcbiMgICAgICdzb3xnbHlwaDrwpL+vfGNwL2ZuY3I6dS1jamsteGIvMjRmZWZ8MCdcbiMgICAgICdzb3xnbHlwaDrwpL+vfHN0cm9rZW9yZGVyOjM1MjUxMzU1MzI1NHwwJ1xuIyAgICAgJ3NvfGdseXBoOvCnkbR8Y3AvZm5jcjp1LWNqay14Yi8yNzQ3NHwwJ1xuIyAgICAgJ3NvfGdseXBoOvCnkbR8c3Ryb2tlb3JkZXI6MzUyNTE1MjUxMjE0MjUxMjE0fDAnXG4jICAgICAnc298Z2x5cGg68KiSoXxjcC9mbmNyOnUtY2prLXhiLzI4NGExfDAnXG4jICAgICAnc298Z2x5cGg68KiSoXxzdHJva2VvcmRlcjozNTI1MTQ1NHwwJ1xuIyAgICAgJ3NvfGdseXBoOvCqmqd8Y3AvZm5jcjp1LWNqay14Yi8yYTZhN3wwJ1xuIyAgICAgJ3NvfGdseXBoOvCqmqd8c3Ryb2tlb3JkZXI6MzUyNTE1MjUxMTI1MTE1MTF8MCdcbiMgICAgICdzb3xnbHlwaDrwqpqrfGNwL2ZuY3I6dS1jamsteGIvMmE2YWJ8MCdcbiMgICAgICdzb3xnbHlwaDrwqpqrfHN0cm9rZW9yZGVyOjM1MjUxNTI1MTExNTExNTExMzU0MXwwJ1xuIyAgICAgXVxuIyAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICBpZHggPSAtMVxuIyAgIHN0ZXAgKCByZXN1bWUgKSA9PlxuIyAgICAgeWllbGQgQF9mZWVkX3Rlc3RfZGF0YSBkYiwgcHJvYmVzX2lkeCwgcmVzdW1lXG4jICAgICBpbnB1dCA9IEhPTExFUklUSC5yZWFkIGRiXG4jICAgICBpbnB1dFxuIyAgICAgICAucGlwZSBIT0xMRVJJVEguJHVybF9mcm9tX2tleSBkYlxuIyAgICAgICAucGlwZSAkICgga2V5LCBzZW5kICkgPT5cbiMgICAgICAgICAjIGRlYnVnICfCqTRpM3FaJywga2V5XG4jICAgICAgICAgaWR4ICs9ICsxXG4jICAgICAgICAgVC5lcSBrZXksIG1hdGNoZXJzWyBpZHggXVxuIyAgICAgICAucGlwZSBELiRvbl9lbmQgPT4gZG9uZSgpXG5cbiMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEBbIFwicHJlZml4ZXMgYW5kIHNlYXJjaGluZyAwXCIgXSA9ICggVCwgZG9uZSApIC0+XG4jICAgbWF0Y2hlcnMgICAgPSBbXVxuIyAgIHByb2Jlc19pZHggID0gMVxuIyAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICBtYXRjaGVycyA9IFtcbiMgICAgICdvc3xzdHJva2VvcmRlcjozNTI1MTQxMTIxfGdseXBoOvCgtKZ8MCdcbiMgICAgICdvc3xzdHJva2VvcmRlcjozNTI1MTQ1NHxnbHlwaDrwqJKhfDAnXG4jICAgICBdXG4jICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgIGlkeCA9IC0xXG4jICAgc3RlcCAoIHJlc3VtZSApID0+XG4jICAgICB5aWVsZCBAX2ZlZWRfdGVzdF9kYXRhIGRiLCBwcm9iZXNfaWR4LCByZXN1bWVcbiMgICAgIHF1ZXJ5ID0gSE9MTEVSSVRILm5ld19xdWVyeSBkYiwgWyAnb3MnLCAnc3Ryb2tlb3JkZXInLCAnMzUyNTE0JywgXVxuIyAgICAgIyBkZWJ1ZyAnwqlxMG9qMicsIHF1ZXJ5XG4jICAgICBpbnB1dCA9IGRiWyAnJXNlbGYnIF0uY3JlYXRlS2V5U3RyZWFtIHF1ZXJ5XG4jICAgICBpbnB1dFxuIyAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICAgICAgLnBpcGUgJCAoIGJrZXksIHNlbmQgKSA9PlxuIyAgICAgICAgIHVybCA9IEhPTExFUklUSC51cmxfZnJvbV9rZXkgZGIsIEhPTExFUklUSC5fZGVjb2RlIGRiLCBia2V5XG4jICAgICAgICAgaWR4ICs9ICsxXG4jICAgICAgICAgVC5lcSB1cmwsIG1hdGNoZXJzWyBpZHggXVxuIyAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICAgICAgLnBpcGUgRC4kb25fZW5kID0+XG4jICAgICAgICAgVC5lcSBpZHgsIDFcbiMgICAgICAgICBkb25lKClcblxuIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQFsgXCJwcmVmaXhlcyBhbmQgc2VhcmNoaW5nIDFcIiBdID0gKCBULCBkb25lICkgLT5cbiMgICBtYXRjaGVycyAgICA9IFtdXG4jICAgcHJvYmVzX2lkeCAgPSAxXG4jICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgIG1hdGNoZXJzID0gW1xuIyAgICAgJ29zfHN0cm9rZW9yZGVyOjM1MjUxNDExMjF8Z2x5cGg68KC0pnwwJ1xuIyAgICAgJ29zfHN0cm9rZW9yZGVyOjM1MjUxNDU0fGdseXBoOvCokqF8MCdcbiMgICAgIF1cbiMgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgaWR4ID0gLTFcbiMgICBzdGVwICggcmVzdW1lICkgPT5cbiMgICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHJlc3VtZVxuIyAgICAgaW5wdXQgPSBIT0xMRVJJVEgucmVhZCBkYiwgWyAnb3MnLCAnc3Ryb2tlb3JkZXInLCAnMzUyNTE0JywgXVxuIyAgICAgICAucGlwZSBIT0xMRVJJVEguJHVybF9mcm9tX2tleSBkYlxuIyAgICAgICAucGlwZSBELiRzaG93KClcbiMgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgICAgIC5waXBlICQgKCB1cmwsIHNlbmQgKSA9PlxuIyAgICAgICAgIGlkeCArPSArMVxuIyAgICAgICAgIFQuZXEgdXJsLCBtYXRjaGVyc1sgaWR4IF1cbiMgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuIyAgICAgICAgIFQuZXEgaWR4LCAxXG4jICAgICAgICAgZG9uZSgpXG5cbiMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEBbIFwiX29yZGVyaW5nXCIgXSA9ICggVCwgZG9uZSApIC0+XG4jICAgaGkgPSB1bmRlZmluZWRcbiMgICBsbyA9IG51bGxcbiMgICBwcm9iZXMgPSBbXG4jICAgICBbICd4JywgJzwzNTI1MTM1PicsICAgICAgICAgICAgIF1cbiMgICAgIFsgJ3gnLCAnPDM1MjUxNDExMjE+JywgICAgICAgICAgXVxuIyAgICAgWyAneCcsICc8MzUyNTE0NTQ+JywgICAgICAgICAgICBdXG4jICAgICBbICd4JywgJzwzNTI1MTUyPicsICAgICAgICAgICAgIF1cbiMgICAgIFsgJ3gnLCAnPDM1MjUxNTI1MT4nLCAgICAgICAgICAgXVxuIyAgICAgWyAneCcsICc8MzUyNTE1MjUxMT4nLCAgICAgICAgICBdXG4jICAgICBbICd4JywgJzwzNTI1MTUzPicsICAgICAgICAgICAgIF1cbiMgICAgIFsgJ3gnLCArSW5maW5pdHksIF1cbiMgICAgIFsgJ3gnLCAtSW5maW5pdHksIF1cbiMgICAgIFsgJ3gnLCA0MiwgXVxuIyAgICAgWyAneCcsIC00MiwgXVxuIyAgICAgWyAneCcsICdhJywgXVxuIyAgICAgWyAneCcsICd6JywgXVxuIyAgICAgWyAneCcsICfkuK0nLCBdXG4jICAgICBbICd4JywgJ1xcdWZmZmYnLCBdXG4jICAgICBbICd4JywgJ/Cggp0nLCBdXG4jICAgICAjIFsgJ3gnLCAoIG5ldyBCdWZmZXIgKCBTdHJpbmcuZnJvbUNvZGVQb2ludCAweDEwZmZmZiApLCAndXRmLTgnICksIF1cbiMgICAgICMgWyAneCcsICggbmV3IEJ1ZmZlciAoIFN0cmluZy5mcm9tQ29kZVBvaW50IDB4MTBmZmZmICksICd1dGYtOCcgKS50b1N0cmluZygpLCBdXG4jICAgICAjIFsgJ3gnLCBoaSwgXVxuIyAgICAgIyBbICd4JywgbG8sIF1cbiMgICAgIFsgJ29zJywgJ29rJywgXSAgICAgICAgIyAnb3N8b2snXG4jICAgICBbICdvcycsICdvaycsICdvdicsIF0gICMgJ29zfG9rOm92J1xuIyAgICAgWyAnb3MnLCAnb2sqJywgXSAgICAgICAjICdvc3xvayonXG4jICAgICBbICdvcycsICdvaycsICdvdionLCBdICMgJ29zfG9rOm92KidcbiMgICAgIF1cbiMgICAgICMgIyBbICdvcycsIFsgJ29rJywgJ292JywgXSwgWyAnc2snLCAnc3YnLCBdLCAwLCBdXG4jICAgICAjIFsgJ29zJywgJ3N0cm9rZW9yZGVyJywgJzwzNTI1MTQxMTIxPicsICAgICAgICAgICAgJ2dseXBoJywgJ/CgtKYnLCAwLCBdXG4jICAgICAjIFsgJ29zJywgJ3N0cm9rZW9yZGVyJywgJzwzNTI1MTQ1ND4nLCAgICAgICAgICAgICAgJ2dseXBoJywgJ/CokqEnLCAwLCBdXG4jICAgICAjIFsgJ29zJywgJ3N0cm9rZW9yZGVyJywgJzwzNTI1MTUyPicsICAgICAgICAgICAgICAgJ2dseXBoJywgJ+mCrScsIDAsIF1cbiMgICAgICMgWyAnb3MnLCAnc3Ryb2tlb3JkZXInLCAnPDM1MjUxNTI1MTExNTExNTExMzU0MT4nLCAnZ2x5cGgnLCAn8KqaqycsIDAsIF1cbiMgICAgICMgWyAnb3MnLCAnc3Ryb2tlb3JkZXInLCAnPDM1MjUxNTI1MTEyNTExNTExPicsICAgICAnZ2x5cGgnLCAn8KqapycsIDAsIF1cbiMgICAgICMgWyAnb3MnLCAnc3Ryb2tlb3JkZXInLCAnPDM1MjUxNTI1MTIxNDI1MTIxND4nLCAgICAnZ2x5cGgnLCAn8KeRtCcsIDAsIF1cbiMgICAgICMgWyAnb3MnLCAnc3Ryb2tlb3JkZXInLCAnPDM1MjUxNTM+JywgICAgICAgICAgICAgICAnZ2x5cGgnLCAn5YqsJywgMCwgXVxuIyAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICBAX3NvcnRfbGlzdCBwcm9iZXNcbiMgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgbGluZXMgPSAoIFsgKCBDTkQuZ3JlZW4gcHJvYmUgKSwgKCBDTkQuZ3JleSBCWVRFV0lTRS5lbmNvZGUgcHJvYmUgKSwgXSBmb3IgcHJvYmUgaW4gcHJvYmVzIClcbiMgICBsb2cgKCByZXF1aXJlICdjb2x1bW5pZnknICkgbGluZXNcblxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfbWFpbiA9ICggaGFuZGxlciApIC0+XG4gIGRiID0gSE9MTEVSSVRILm5ld19kYiBqb2luIF9fZGlybmFtZSwgJy4uJywgJ2Ricy90ZXN0cydcbiAgdGVzdCBALCAndGltZW91dCc6IDI1MDBcblxuIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG51bmxlc3MgbW9kdWxlLnBhcmVudD9cbiAgQF9tYWluKClcbiAgIyBhID0gWyAnYWFhJywgJ2InLCAnYycsIF1cbiAgIyBiID0gWyAnQScsICdCQkInLCAnQycsIF1cbiAgIyBjb2x1bW5pZnlfc2V0dGluZ3MgPVxuICAjICAgcGFkZGluZ0NocjogJ18nXG4gICMgICAjIGNvbHVtbnM6IFsgJ2RlY29kZWQnLCAnZW5jb2RlZCcsICd4JyBdXG4gICMgIyBoZWxwICdcXG4nICsgQ05ELmNvbHVtbmlmeSBbIGEsIGIsIF0sIGNvbHVtbmlmeV9zZXR0aW5nc1xuICAjIGRhdGEgPSBbXVxuICAjIGZvciBlbGVtZW50X2EsIGlkeCBpbiBhXG4gICMgICBkYXRhLnB1c2ggeyAnc3RyJzogZWxlbWVudF9hLCAnYmZyJzogYlsgaWR4IF19XG4gICMgaGVscCAnXFxuJyArIENORC5jb2x1bW5pZnkgZGF0YSwgY29sdW1uaWZ5X3NldHRpbmdzXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cbiJdfQ==