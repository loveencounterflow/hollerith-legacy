(function() {
  var $, BYTEWISE, CND, D, HOLLERITH, after, alert, badge, db, debug, echo, help, info, join, log, njs_path, rpr, step, suspend, test, urge, warn, whisper;

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

//# sourceMappingURL=data:application/json;base64,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SCxDQWdCUSxDQUFDLENBQUMsT0FBRixDQUFVLFNBQUEsR0FBQTtBQUNkLFVBQUEsQ0FBQyxDQUFDLEVBQUYsQ0FBSyxLQUFMLEVBQVksUUFBUSxDQUFDLE1BQXJCLENBQUEsQ0FBQTtpQkFDQSxJQUFBLENBQUEsRUFGYztRQUFBLENBQVYsQ0FoQlIsRUFMRztNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUwsRUFiOEI7RUFBQSxDQXphaEMsQ0FBQTs7QUFBQSxFQXFwQkEsSUFBQyxDQUFBLEtBQUQsR0FBUyxTQUFFLE9BQUYsR0FBQTtBQUNQLElBQUEsRUFBQSxHQUFLLFNBQVMsQ0FBQyxNQUFWLENBQWlCLElBQUEsQ0FBSyxTQUFMLEVBQWdCLElBQWhCLEVBQXNCLFdBQXRCLENBQWpCLENBQUwsQ0FBQTtXQUNBLElBQUEsQ0FBSyxJQUFMLEVBQVE7QUFBQSxNQUFBLFNBQUEsRUFBVyxJQUFYO0tBQVIsRUFGTztFQUFBLENBcnBCVCxDQUFBOztBQTBwQkEsRUFBQSxJQUFPLHFCQUFQO0FBQ0UsSUFBQSxJQUFDLENBQUEsS0FBRCxDQUFBLENBQUEsQ0FERjtHQTFwQkE7QUFBQSIsImZpbGUiOiJ0ZXN0cy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIlxuXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xubmpzX3BhdGggICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ3BhdGgnXG4jIG5qc19mcyAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdmcydcbmpvaW4gICAgICAgICAgICAgICAgICAgICAgPSBuanNfcGF0aC5qb2luXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkNORCAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdjbmQnXG5ycHIgICAgICAgICAgICAgICAgICAgICAgID0gQ05ELnJwclxuYmFkZ2UgICAgICAgICAgICAgICAgICAgICA9ICdIT0xMRVJJVEgvdGVzdHMnXG5sb2cgICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3BsYWluJywgICAgIGJhZGdlXG5pbmZvICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ2luZm8nLCAgICAgIGJhZGdlXG53aGlzcGVyICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3doaXNwZXInLCAgIGJhZGdlXG5hbGVydCAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ2FsZXJ0JywgICAgIGJhZGdlXG5kZWJ1ZyAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ2RlYnVnJywgICAgIGJhZGdlXG53YXJuICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3dhcm4nLCAgICAgIGJhZGdlXG5oZWxwICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ2hlbHAnLCAgICAgIGJhZGdlXG51cmdlICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3VyZ2UnLCAgICAgIGJhZGdlXG5lY2hvICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmVjaG8uYmluZCBDTkRcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuc3VzcGVuZCAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2NvZmZlZW5vZGUtc3VzcGVuZCdcbnN0ZXAgICAgICAgICAgICAgICAgICAgICAgPSBzdXNwZW5kLnN0ZXBcbmFmdGVyICAgICAgICAgICAgICAgICAgICAgPSBzdXNwZW5kLmFmdGVyXG4jIGV2ZW50dWFsbHkgICAgICAgICAgICAgICAgPSBzdXNwZW5kLmV2ZW50dWFsbHlcbiMgaW1tZWRpYXRlbHkgICAgICAgICAgICAgICA9IHN1c3BlbmQuaW1tZWRpYXRlbHlcbiMgcmVwZWF0X2ltbWVkaWF0ZWx5ICAgICAgICA9IHN1c3BlbmQucmVwZWF0X2ltbWVkaWF0ZWx5XG4jIGV2ZXJ5ICAgICAgICAgICAgICAgICAgICAgPSBzdXNwZW5kLmV2ZXJ5XG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnRlc3QgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdndXktdGVzdCdcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuRCAgICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ3BpcGVkcmVhbXMyJ1xuJCAgICAgICAgICAgICAgICAgICAgICAgICA9IEQucmVtaXQuYmluZCBEXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkhPTExFUklUSCAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL21haW4nXG5kYiAgICAgICAgICAgICAgICAgICAgICAgID0gbnVsbFxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5CWVRFV0lTRSAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnYnl0ZXdpc2UnXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9lbmNvZGVfbGlzdCA9ICggbGlzdCApIC0+XG4gICggbGlzdFsgaWR4IF0gPSBCWVRFV0lTRS5lbmNvZGUgdmFsdWUgKSBmb3IgdmFsdWUsIGlkeCBpbiBsaXN0XG4gIHJldHVybiBsaXN0XG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9kZWNvZGVfbGlzdCA9ICggbGlzdCApIC0+XG4gICggbGlzdFsgaWR4IF0gPSBCWVRFV0lTRS5kZWNvZGUgdmFsdWUgKSBmb3IgdmFsdWUsIGlkeCBpbiBsaXN0XG4gIHJldHVybiBsaXN0XG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9zb3J0X2xpc3QgPSAoIGxpc3QgKSAtPlxuICBAX2VuY29kZV9saXN0IGxpc3RcbiAgbGlzdC5zb3J0IEJ1ZmZlci5jb21wYXJlXG4gIEBfZGVjb2RlX2xpc3QgbGlzdFxuICByZXR1cm4gbGlzdFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfZmVlZF90ZXN0X2RhdGEgPSAoIGRiLCBwcm9iZXNfaWR4LCBoYW5kbGVyICkgLT5cbiAgc3dpdGNoIHByb2Jlc19pZHhcbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIHdoZW4gMFxuICAgICAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgICAgIHlpZWxkIEhPTExFUklUSC5jbGVhciBkYiwgcmVzdW1lXG4gICAgICAgIGlucHV0ID0gRC5jcmVhdGVfdGhyb3VnaHN0cmVhbSgpXG4gICAgICAgIGlucHV0XG4gICAgICAgICAgLnBpcGUgSE9MTEVSSVRILiR3cml0ZSBkYiwgM1xuICAgICAgICAgICMgLnBpcGUgRC4kc2hvdygpXG4gICAgICAgICAgLnBpcGUgRC4kb25fZW5kID0+XG4gICAgICAgICAgICB1cmdlIFwidGVzdCBkYXRhIHdyaXR0ZW5cIlxuICAgICAgICAgICAgaGFuZGxlciBudWxsXG4gICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgICAgZm9yIHByb2JlIGluIEBfZmVlZF90ZXN0X2RhdGEucHJvYmVzWyBwcm9iZXNfaWR4IF1cbiAgICAgICAgICAjIGtleSA9IEhPTExFUklUSC5uZXdfc29fa2V5IGRiLCBwcm9iZS4uLlxuICAgICAgICAgICMgZGVidWcgJ8KpV1YwajInLCBwcm9iZVxuICAgICAgICAgIGlucHV0LndyaXRlIHByb2JlXG4gICAgICAgIGlucHV0LmVuZCgpXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICB3aGVuIDFcbiAgICAgIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgICAgICB5aWVsZCBIT0xMRVJJVEguY2xlYXIgZGIsIHJlc3VtZVxuICAgICAgICBpbnB1dCA9IEQuY3JlYXRlX3Rocm91Z2hzdHJlYW0oKVxuICAgICAgICBpbnB1dFxuICAgICAgICAgIC5waXBlIEhPTExFUklUSC4kd3JpdGUgZGIsIDNcbiAgICAgICAgICAjIC5waXBlIEQuJHNob3coKVxuICAgICAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICAgICAgdXJnZSBcInRlc3QgZGF0YSB3cml0dGVuXCJcbiAgICAgICAgICAgIGhhbmRsZXIgbnVsbFxuICAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAgIGZvciB1cmxfa2V5IGluIEBfZmVlZF90ZXN0X2RhdGEucHJvYmVzWyBwcm9iZXNfaWR4IF1cbiAgICAgICAgICBrZXkgPSBIT0xMRVJJVEgua2V5X2Zyb21fdXJsIGRiLCB1cmxfa2V5XG4gICAgICAgICAgaW5wdXQud3JpdGUga2V5XG4gICAgICAgIGlucHV0LmVuZCgpXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBlbHNlIHJldHVybiBoYW5kbGVyIG5ldyBFcnJvciBcImlsbGVnYWwgcHJvYmVzIGluZGV4ICN7cnByIHByb2Jlc19pZHh9XCJcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICByZXR1cm4gbnVsbFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfZmVlZF90ZXN0X2RhdGEucHJvYmVzID0gW11cblxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5AX2ZlZWRfdGVzdF9kYXRhLnByb2Jlcy5wdXNoIFtcbiAgWyAn8Ke3nzEnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsICAgICAgICAgICAgICAxLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfwp7efMicsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgICAgICAgICAgICAgIDIsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ/Cnt58zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAgICAgICAgICAgICAgMywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn8Ke3nzQnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsICAgICAgICAgICAgICA0LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfwp7efJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAgICAgICAgICAgICAgNSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ/Cnt582JywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAgICAgICAgICAgICAgNiwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn8Ke3nycsICdjcC9jaWQnLCAgICAgICAgICAgICAgICAgICAgICAgICAgIDE2MzI5NSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgICAgICAgICAgICAgICAgICAgWyAn5YWrJywgJ+WIgCcsICflroAnLCAn7oe6JywgJ+iynScsIF0sICAgICAgXVxuICBbICfwp7efJywgJ3JhbmsvY2p0JywgICAgICAgICAgICAgICAgICAgICAgICAgNTQzMiwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+WFqycsICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgICAgICAgICAgJzM0JywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfliIAnLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICAgICAgICAgICc1KDEyKTMnLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5a6AJywgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCAgICAgICAgICAnNDQnLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+6HuicsICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgICAgICAgICAgJzEyJywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICfosp0nLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICAgICAgICAgICcyNSgxMiknLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn5YWrJywgJ3JhbmsvY2p0JywgICAgICAgICAgICAgICAgICAgICAgICAgMTI1NDEsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+WIgCcsICdyYW5rL2NqdCcsICAgICAgICAgICAgICAgICAgICAgICAgIDEyNTQyLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBbICflroAnLCAncmFuay9janQnLCAgICAgICAgICAgICAgICAgICAgICAgICAxMjU0MywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgWyAn7oe6JywgJ3JhbmsvY2p0JywgICAgICAgICAgICAgICAgICAgICAgICAgMTI1NDQsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gIFsgJ+iynScsICdyYW5rL2NqdCcsICAgICAgICAgICAgICAgICAgICAgICAgIDEyNTQ1LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICBdXG5cbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuQF9mZWVkX3Rlc3RfZGF0YS5wcm9iZXMucHVzaCBbXG4gICdzb3xnbHlwaDrliqx8Y3AvZm5jcjp1LWNqay81MmFjfDAnXG4gICdzb3xnbHlwaDrpgq18Y3AvZm5jcjp1LWNqay85MGFkfDAnXG4gICdzb3xnbHlwaDrwoLSmfGNwL2ZuY3I6dS1jamsteGIvMjBkMjZ8MCdcbiAgJ3NvfGdseXBoOvCkv698Y3AvZm5jcjp1LWNqay14Yi8yNGZlZnwwJ1xuICAnc298Z2x5cGg68KeRtHxjcC9mbmNyOnUtY2prLXhiLzI3NDc0fDAnXG4gICdzb3xnbHlwaDrwqJKhfGNwL2ZuY3I6dS1jamsteGIvMjg0YTF8MCdcbiAgJ3NvfGdseXBoOvCqmqd8Y3AvZm5jcjp1LWNqay14Yi8yYTZhN3wwJ1xuICAnc298Z2x5cGg68Kqaq3xjcC9mbmNyOnUtY2prLXhiLzJhNmFifDAnXG4gICdzb3xnbHlwaDrwpL+vfHN0cm9rZW9yZGVyOjM1MjUxMzU1MzI1NHwwJ1xuICAnc298Z2x5cGg68KC0pnxzdHJva2VvcmRlcjozNTI1MTQxMTIxfDAnXG4gICdzb3xnbHlwaDrwqJKhfHN0cm9rZW9yZGVyOjM1MjUxNDU0fDAnXG4gICdzb3xnbHlwaDrpgq18c3Ryb2tlb3JkZXI6MzUyNTE1MnwwJ1xuICAnc298Z2x5cGg68Kqaq3xzdHJva2VvcmRlcjozNTI1MTUyNTExMTUxMTUxMTM1NDF8MCdcbiAgJ3NvfGdseXBoOvCqmqd8c3Ryb2tlb3JkZXI6MzUyNTE1MjUxMTI1MTE1MTF8MCdcbiAgJ3NvfGdseXBoOvCnkbR8c3Ryb2tlb3JkZXI6MzUyNTE1MjUxMjE0MjUxMjE0fDAnXG4gICdzb3xnbHlwaDrliqx8c3Ryb2tlb3JkZXI6MzUyNTE1M3wwJ1xuICBdXG5cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcIndyaXRlIHdpdGhvdXQgZXJyb3JcIiBdID0gKCBULCBkb25lICkgLT5cbiAgcHJvYmVzX2lkeCAgPSAwXG4gIGlkeCA9IC0xXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHJlc3VtZVxuICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCB3aXRob3V0IGVycm9yXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHByb2Jlc19pZHggID0gMFxuICBpZHggPSAtMVxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBAX2ZlZWRfdGVzdF9kYXRhIGRiLCBwcm9iZXNfaWR4LCByZXN1bWVcbiAgICBpbnB1dCA9IEhPTExFUklUSC5jcmVhdGVfZmFjZXRzdHJlYW0gZGJcbiAgICBpbnB1dFxuICAgICAgIyAucGlwZSBIT0xMRVJJVEguJHVybF9mcm9tX2tleSBkYlxuICAgICAgLnBpcGUgJCAoIFsga2V5LCB2YWx1ZSwgXSwgc2VuZCApID0+XG4gICAgICAgIGlkeCArPSArMVxuICAgICAgICAjIFQuZXEga2V5LCBtYXRjaGVyc1sgaWR4IF1cbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PiBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQga2V5cyB3aXRob3V0IGVycm9yICgxKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBIT0xMRVJJVEguY2xlYXIgZGIsIHJlc3VtZVxuICAgIGZvciBpZHggaW4gWyAwIC4uLiAxMCBdXG4gICAgICBkYlsgJyVzZWxmJyBdLnB1dCAoIEhPTExFUklUSC5fZW5jb2RlIGRiLCBbICd4JywgaWR4LCAneCcsIF0gKSwgSE9MTEVSSVRILl96ZXJvX2VuY1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcHJvYmVfaWR4ID0gNFxuICAgIGNvdW50ICAgICA9IDBcbiAgICBxdWVyeSAgICAgPSBIT0xMRVJJVEguX3F1ZXJ5X2Zyb21fcHJlZml4IGRiLCBbICd4JywgcHJvYmVfaWR4LCBdXG4gICAgaW5wdXQgICAgID0gZGJbICclc2VsZicgXS5jcmVhdGVSZWFkU3RyZWFtIHF1ZXJ5XG4gICAgaW5wdXRcbiAgICAgIC5waXBlICQgKCB7IGtleSwgdmFsdWUsIH0sIHNlbmQgKSA9PlxuICAgICAgICBjb3VudCArPSAxXG4gICAgICAgIFQuZXEgKCBIT0xMRVJJVEguX2RlY29kZSBkYiwga2V5IClbIDEgXSwgcHJvYmVfaWR4XG4gICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgVC5lcSBjb3VudCwgMVxuICAgICAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQga2V5cyB3aXRob3V0IGVycm9yICgyKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBIT0xMRVJJVEguY2xlYXIgZGIsIHJlc3VtZVxuICAgIGZvciBpZHggaW4gWyAwIC4uLiAxMCBdXG4gICAgICBkYlsgJyVzZWxmJyBdLnB1dCAoIEhPTExFUklUSC5fZW5jb2RlIGRiLCBbICd4JywgaWR4LCAneCcsIF0gKSwgSE9MTEVSSVRILl96ZXJvX2VuY1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcHJvYmVfaWR4ID0gNFxuICAgIGNvdW50ICAgICA9IDBcbiAgICBwcmVmaXggICAgPSBbICd4JywgcHJvYmVfaWR4LCBdXG4gICAgaW5wdXQgICAgID0gSE9MTEVSSVRILmNyZWF0ZV9mYWNldHN0cmVhbSBkYiwgcHJlZml4XG4gICAgaW5wdXRcbiAgICAgIC5waXBlICQgKCBmYWNldCwgc2VuZCApID0+XG4gICAgICAgIGNvdW50ICs9IDFcbiAgICAgICAgWyBrZXksIHZhbHVlLCBdID0gZmFjZXRcbiAgICAgICAgVC5lcSBrZXlbIDEgXSwgcHJvYmVfaWR4XG4gICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgVC5lcSBjb3VudCwgMVxuICAgICAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQga2V5cyB3aXRob3V0IGVycm9yICgzKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBIT0xMRVJJVEguY2xlYXIgZGIsIHJlc3VtZVxuICAgIGZvciBpZHggaW4gWyAwIC4uLiAxMCBdXG4gICAgICBkYlsgJyVzZWxmJyBdLnB1dCAoIEhPTExFUklUSC5fZW5jb2RlIGRiLCBbICd4JywgaWR4LCAneCcsIF0gKSwgSE9MTEVSSVRILl96ZXJvX2VuY1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcHJvYmVfaWR4ID0gM1xuICAgIGNvdW50ICAgICA9IDBcbiAgICBkZWx0YSAgICAgPSAyXG4gICAgbG8gICAgICAgID0gWyAneCcsIHByb2JlX2lkeCwgXVxuICAgIGhpICAgICAgICA9IFsgJ3gnLCBwcm9iZV9pZHggKyBkZWx0YSwgXVxuICAgIHF1ZXJ5ICAgICA9IHsgZ3RlOiAoIEhPTExFUklUSC5fZW5jb2RlIGRiLCBsbyApLCBsdGU6ICggSE9MTEVSSVRILl9xdWVyeV9mcm9tX3ByZWZpeCBkYiwgaGkgKVsgJ2x0ZScgXSwgfVxuICAgIGlucHV0ICAgICA9IGRiWyAnJXNlbGYnIF0uY3JlYXRlUmVhZFN0cmVhbSBxdWVyeVxuICAgIGlucHV0XG4gICAgICAucGlwZSAkICggeyBrZXksIHZhbHVlLCB9LCBzZW5kICkgPT5cbiAgICAgICAgY291bnQgKz0gMVxuICAgICAgICBULmVxICggSE9MTEVSSVRILl9kZWNvZGUgZGIsIGtleSApWyAxIF0sIHByb2JlX2lkeCArIGNvdW50IC0gMVxuICAgICAgLnBpcGUgRC4kb25fZW5kID0+XG4gICAgICAgIFQuZXEgY291bnQsIGRlbHRhICsgMVxuICAgICAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQga2V5cyB3aXRob3V0IGVycm9yICg0KVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBIT0xMRVJJVEguY2xlYXIgZGIsIHJlc3VtZVxuICAgIGZvciBpZHggaW4gWyAwIC4uLiAxMCBdXG4gICAgICBkYlsgJyVzZWxmJyBdLnB1dCAoIEhPTExFUklUSC5fZW5jb2RlIGRiLCBbICd4JywgaWR4LCAneCcsIF0gKSwgSE9MTEVSSVRILl96ZXJvX2VuY1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcHJvYmVfaWR4ID0gM1xuICAgIGNvdW50ICAgICA9IDBcbiAgICBkZWx0YSAgICAgPSAyXG4gICAgbG8gICAgICAgID0gWyAneCcsIHByb2JlX2lkeCwgXVxuICAgIGhpICAgICAgICA9IFsgJ3gnLCBwcm9iZV9pZHggKyBkZWx0YSwgXVxuICAgIGlucHV0ICAgICA9IEhPTExFUklUSC5jcmVhdGVfZmFjZXRzdHJlYW0gZGIsIGxvLCBoaVxuICAgIGlucHV0XG4gICAgICAucGlwZSAkICggWyBrZXksIHZhbHVlLCBdLCBzZW5kICkgPT5cbiAgICAgICAgY291bnQgKz0gMVxuICAgICAgICBULmVxIGtleVsgMSBdLCBwcm9iZV9pZHggKyBjb3VudCAtIDFcbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICBULmVxIGNvdW50LCBkZWx0YSArIDFcbiAgICAgICAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJjcmVhdGVfZmFjZXRzdHJlYW0gdGhyb3dzIHdpdGggd3JvbmcgYXJndW1lbnRzXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIG1lc3NhZ2UgPSBcIm11c3QgZ2l2ZSBgbG9faGludGAgd2hlbiBgaGlfaGludGAgaXMgZ2l2ZW5cIlxuICBULnRocm93cyBtZXNzYWdlLCAoIC0+IEhPTExFUklUSC5jcmVhdGVfZmFjZXRzdHJlYW0gZGIsIG51bGwsIFsgJ3h4eCcsIF0gKVxuICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgUE9TIGZhY2V0c1wiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ICAgICAgICAgPSAtMVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGtleV9tYXRjaGVycyA9IFtcbiAgICBbICdwb3MnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDIsICfwp7efMicgXVxuICAgIFsgJ3BvcycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgMywgJ/Cnt58zJyBdXG4gICAgWyAncG9zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCA0LCAn8Ke3nzQnIF1cbiAgICBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcGhyYXNlX21hdGNoZXJzID0gW1xuICAgIFsgJ/Cnt58yJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAyIF1cbiAgICBbICfwp7efMycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgMyBdXG4gICAgWyAn8Ke3nzQnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDQgXVxuICAgIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBAX2ZlZWRfdGVzdF9kYXRhIGRiLCBwcm9iZXNfaWR4LCByZXN1bWVcbiAgICBsbyA9IFsgJ3BvcycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgMiwgXVxuICAgIGhpID0gWyAncG9zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCA0LCBdXG4gICAgIyBpbnB1dCAgID0gSE9MTEVSSVRILmNyZWF0ZV9rZXlzdHJlYW0gZGIsIGxvXG4gICAgaW5wdXQgICA9IEhPTExFUklUSC5jcmVhdGVfZmFjZXRzdHJlYW0gZGIsIGxvLCBoaVxuICAgIGlucHV0XG4gICAgICAjIC5waXBlIEhPTExFUklUSC4kdXJsX2Zyb21fa2V5IGRiXG4gICAgICAucGlwZSAkICggWyBrZXksIHZhbHVlLCBdLCBzZW5kICkgPT5cbiAgICAgICAgaWR4ICs9ICsxXG4gICAgICAgIHBocmFzZSA9IEhPTExFUklUSC5hc19waHJhc2UgZGIsIGtleSwgdmFsdWVcbiAgICAgICAgVC5lcSBrZXksIGtleV9tYXRjaGVyc1sgaWR4IF1cbiAgICAgICAgVC5lcSBwaHJhc2UsIHBocmFzZV9tYXRjaGVyc1sgaWR4IF1cbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PiBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgUE9TIHBocmFzZXMgKDEpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHByb2Jlc19pZHggID0gMFxuICBpZHggICAgICAgICA9IC0xXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgbWF0Y2hlcnMgPSBbXG4gICAgWyAn8Ke3nzInLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDIgXVxuICAgIFsgJ/Cnt58zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAzIF1cbiAgICBbICfwp7efNCcsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgNCBdXG4gICAgXVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHJlc3VtZVxuICAgIGxvID0gWyAncG9zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAyLCBdXG4gICAgaGkgPSBbICdwb3MnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDQsIF1cbiAgICBpbnB1dCAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIGxvLCBoaVxuICAgIGlucHV0XG4gICAgICAucGlwZSAkICggcGhyYXNlLCBzZW5kICkgPT5cbiAgICAgICAgaWR4ICs9ICsxXG4gICAgICAgIFQuZXEgcGhyYXNlLCBtYXRjaGVyc1sgaWR4IF1cbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PiBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgUE9TIHBocmFzZXMgKDIpXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHByb2Jlc19pZHggID0gMFxuICBpZHggICAgICAgICA9IC0xXG4gIGNvdW50ICAgICAgID0gMFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIG1hdGNoZXJzID0gW1xuICAgIFsgJ/Cnt58nLCAnZ3VpZGUvdWNoci9oYXMnLCAn5YWrJywgMCBdXG4gICAgWyAn8Ke3nycsICdndWlkZS91Y2hyL2hhcycsICfliIAnLCAxIF1cbiAgICBbICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgJ+WugCcsIDIgXVxuICAgIFsgJ/Cnt58nLCAnZ3VpZGUvdWNoci9oYXMnLCAn6LKdJywgNCBdXG4gICAgWyAn8Ke3nycsICdndWlkZS91Y2hyL2hhcycsICfuh7onLCAzIF1cbiAgICBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgQF9mZWVkX3Rlc3RfZGF0YSBkYiwgcHJvYmVzX2lkeCwgcmVzdW1lXG4gICAgcHJlZml4ICAgID0gWyAncG9zJywgJ2d1aWRlL3VjaHIvaGFzJywgXVxuICAgIGlucHV0ICAgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBwcmVmaXhcbiAgICBzZXR0aW5ncyAgPSB7IGluZGV4ZWQ6IG5vLCB9XG4gICAgaW5wdXRcbiAgICAgIC5waXBlICQgKCBwaHJhc2UsIHNlbmQgKSA9PlxuICAgICAgICBjb3VudCAgKz0gKzFcbiAgICAgICAgaWR4ICAgICs9ICsxXG4gICAgICAgIFQuZXEgcGhyYXNlLCBtYXRjaGVyc1sgaWR4IF1cbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICBULmVxIGNvdW50LCBtYXRjaGVycy5sZW5ndGhcbiAgICAgICAgZG9uZSgpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQFsgXCJyZWFkIFNQTyBwaHJhc2VzXCIgXSA9ICggVCwgZG9uZSApIC0+XG4gIHByb2Jlc19pZHggID0gMFxuICBpZHggICAgICAgICA9IC0xXG4gIGNvdW50ICAgICAgID0gMFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIG1hdGNoZXJzID0gW1xuICAgIFsgJ/Cnt58nLCAnY3AvY2lkJywgMTYzMjk1IF1cbiAgICBbICfwp7efJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCA1IF1cbiAgICBbICfwp7efJywgJ2d1aWRlL3VjaHIvaGFzJywgWyAn5YWrJywgJ+WIgCcsICflroAnLCAn7oe6JywgJ+iynScgXSBdXG4gICAgWyAn8Ke3nycsICdyYW5rL2NqdCcsIDU0MzIgXVxuICAgIFsgJ/Cnt58xJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCAxIF1cbiAgICBbICfwp7efMicsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgMiBdXG4gICAgWyAn8Ke3nzMnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDMgXVxuICAgIFsgJ/Cnt580JywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCA0IF1cbiAgICBbICfwp7efNicsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgNiBdXG4gICAgXVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHJlc3VtZVxuICAgIHByZWZpeCAgPSBbICdzcG8nLCAn8Ke3nycsIF1cbiAgICBpbnB1dCAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIHByZWZpeFxuICAgIGlucHV0XG4gICAgICAucGlwZSAkICggcGhyYXNlLCBzZW5kICkgPT5cbiAgICAgICAgY291bnQgICs9ICsxXG4gICAgICAgIGlkeCAgICArPSArMVxuICAgICAgICBULmVxIHBocmFzZSwgbWF0Y2hlcnNbIGlkeCBdXG4gICAgICAucGlwZSBELiRvbl9lbmQgPT5cbiAgICAgICAgVC5lcSBjb3VudCwgbWF0Y2hlcnMubGVuZ3RoXG4gICAgICAgIGRvbmUoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBbIFwicmVhZCB3aXRoIHN1Yi1yZWFkICgxKVwiIF0gPSAoIFQsIGRvbmUgKSAtPlxuICBwcm9iZXNfaWR4ICA9IDBcbiAgaWR4ICAgICAgICAgPSAtMVxuICBjb3VudCAgICAgICA9IDBcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBtYXRjaGVycyA9IFtcbiAgICBbICfwp7efJywgWyAn5YWrJywgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCAnMzQnIF0gXVxuICAgIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBAX2ZlZWRfdGVzdF9kYXRhIGRiLCBwcm9iZXNfaWR4LCByZXN1bWVcbiAgICBwcmVmaXggICAgPSBbICdzcG8nLCAn8Ke3nycsICdndWlkZS91Y2hyL2hhcycsIF1cbiAgICBpbnB1dCAgICAgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgcHJlZml4XG4gICAgc2V0dGluZ3MgID0geyBpbmRleGVkOiBubywgfVxuICAgIGlucHV0XG4gICAgICAucGlwZSBIT0xMRVJJVEgucmVhZF9zdWIgZGIsIHNldHRpbmdzLCAoIFsgZ2x5cGgsIHByZCwgZ3VpZGVzLCBdICkgPT5cbiAgICAgICAgc3ViX2lucHV0ID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIFsgJ3NwbycsIGd1aWRlc1sgMCBdLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsIF1cbiAgICAgICAgcmV0dXJuIFsgZ2x5cGgsIHN1Yl9pbnB1dCwgXVxuICAgICAgLnBpcGUgJCAoIHBocmFzZSwgc2VuZCApID0+XG4gICAgICAgIGNvdW50ICArPSArMVxuICAgICAgICBpZHggICAgKz0gKzFcbiAgICAgICAgVC5lcSBwaHJhc2UsIG1hdGNoZXJzWyBpZHggXVxuICAgICAgLnBpcGUgRC4kb25fZW5kID0+XG4gICAgICAgIFQuZXEgY291bnQsIG1hdGNoZXJzLmxlbmd0aFxuICAgICAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgd2l0aCBzdWItcmVhZCAoMilcIiBdID0gKCBULCBkb25lICkgLT5cbiAgcHJvYmVzX2lkeCAgPSAwXG4gIGlkeCAgICAgICAgID0gLTFcbiAgY291bnQgICAgICAgPSAwXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgbWF0Y2hlcnMgPSBbXG4gICAgWyAn8Ke3nycsIFsgJ+WFqycsICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgJzM0JyBdIF1cbiAgICBbICfwp7efJywgWyAn5YiAJywgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCAnNSgxMikzJyBdIF1cbiAgICBbICfwp7efJywgWyAn5a6AJywgJ2ZhY3Rvci9zdHJva2VjbGFzcy93YmYnLCAnNDQnIF0gXVxuICAgIFsgJ/Cnt58nLCBbICfosp0nLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICcyNSgxMiknIF0gXVxuICAgIFsgJ/Cnt58nLCBbICfuh7onLCAnZmFjdG9yL3N0cm9rZWNsYXNzL3diZicsICcxMicgXSBdXG4gICAgXVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHJlc3VtZVxuICAgIHByZWZpeCAgICA9IFsgJ3BvcycsICdndWlkZS91Y2hyL2hhcycsIF1cbiAgICBpbnB1dCAgICAgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgcHJlZml4XG4gICAgc2V0dGluZ3MgID0geyBpbmRleGVkOiBubywgfVxuICAgIGlucHV0XG4gICAgICAucGlwZSBIT0xMRVJJVEgucmVhZF9zdWIgZGIsIHNldHRpbmdzLCAoIHBocmFzZSApID0+XG4gICAgICAgIFsgZ2x5cGgsIHByZCwgZ3VpZGUsIF0gID0gcGhyYXNlXG4gICAgICAgIHByZWZpeCAgICAgICAgICAgICAgICAgID0gWyAnc3BvJywgZ3VpZGUsICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgXVxuICAgICAgICBzdWJfaW5wdXQgICAgICAgICAgICAgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBwcmVmaXhcbiAgICAgICAgcmV0dXJuIFsgZ2x5cGgsIHN1Yl9pbnB1dCwgXVxuICAgICAgLnBpcGUgJCAoIHBocmFzZSwgc2VuZCApID0+XG4gICAgICAgIGRlYnVnICfCqXF1UGJnJywgSlNPTi5zdHJpbmdpZnkgcGhyYXNlXG4gICAgICAgIGNvdW50ICArPSArMVxuICAgICAgICBpZHggICAgKz0gKzFcbiAgICAgICAgVC5lcSBwaHJhc2UsIG1hdGNoZXJzWyBpZHggXVxuICAgICAgLnBpcGUgRC4kb25fZW5kID0+XG4gICAgICAgIFQuZXEgY291bnQsIG1hdGNoZXJzLmxlbmd0aFxuICAgICAgICBkb25lKClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AWyBcInJlYWQgd2l0aCBzdWItcmVhZCAoMylcIiBdID0gKCBULCBkb25lICkgLT5cbiAgcHJvYmVzX2lkeCAgPSAwXG4gIGlkeCAgICAgICAgID0gLTFcbiAgY291bnQgICAgICAgPSAwXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgbWF0Y2hlcnMgPSBbXG4gICAgW1tcIvCnt59cIixcIuWFq1wiLFwiMzRcIl0sW1wi5YWrXCIsXCJyYW5rL2NqdFwiLDEyNTQxXV1cbiAgICBbW1wi8Ke3n1wiLFwi5YiAXCIsXCI1KDEyKTNcIl0sW1wi5YiAXCIsXCJyYW5rL2NqdFwiLDEyNTQyXV1cbiAgICBbW1wi8Ke3n1wiLFwi5a6AXCIsXCI0NFwiXSxbXCLlroBcIixcInJhbmsvY2p0XCIsMTI1NDNdXVxuICAgIFtbXCLwp7efXCIsXCLosp1cIixcIjI1KDEyKVwiXSxbXCLosp1cIixcInJhbmsvY2p0XCIsMTI1NDVdXVxuICAgIFtbXCLwp7efXCIsXCLuh7pcIixcIjEyXCJdLFtcIu6HulwiLFwicmFuay9janRcIiwxMjU0NF1dXG4gICAgXVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHJlc3VtZVxuICAgIHByZWZpeCAgICA9IFsgJ3BvcycsICdndWlkZS91Y2hyL2hhcycsIF1cbiAgICBpbnB1dCAgICAgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgcHJlZml4XG4gICAgc2V0dGluZ3MgID0geyBpbmRleGVkOiBubywgfVxuICAgIGlucHV0XG4gICAgICAucGlwZSBIT0xMRVJJVEgucmVhZF9zdWIgZGIsIHNldHRpbmdzLCAoIHBocmFzZSApID0+XG4gICAgICAgIFsgZ2x5cGgsIHByZCwgZ3VpZGUsIF0gID0gcGhyYXNlXG4gICAgICAgIHByZWZpeCAgICAgICAgICAgICAgICAgID0gWyAnc3BvJywgZ3VpZGUsICdmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmJywgXVxuICAgICAgICBzdWJfaW5wdXQgICAgICAgICAgICAgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBwcmVmaXhcbiAgICAgICAgcmV0dXJuIFsgZ2x5cGgsIHN1Yl9pbnB1dCwgXVxuICAgICAgLnBpcGUgSE9MTEVSSVRILnJlYWRfc3ViIGRiLCBzZXR0aW5ncywgKCB4cGhyYXNlICkgPT5cbiAgICAgICAgWyBnbHlwaCwgWyBndWlkZSwgcHJkLCBzaGFwZWNsYXNzLCBdIF0gID0geHBocmFzZVxuICAgICAgICBwcmVmaXggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBbICdzcG8nLCBndWlkZSwgJ3JhbmsvY2p0JywgXVxuICAgICAgICBzdWJfaW5wdXQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgcHJlZml4XG4gICAgICAgIHJldHVybiBbIFsgZ2x5cGgsIGd1aWRlLCBzaGFwZWNsYXNzLCBdLCBzdWJfaW5wdXQsIF1cbiAgICAgIC5waXBlICQgKCB4cGhyYXNlLCBzZW5kICkgPT5cbiAgICAgICAgZGVidWcgJ8KpcXVQYmcnLCBKU09OLnN0cmluZ2lmeSB4cGhyYXNlXG4gICAgICAgIGNvdW50ICArPSArMVxuICAgICAgICBpZHggICAgKz0gKzFcbiAgICAgICAgVC5lcSB4cGhyYXNlLCBtYXRjaGVyc1sgaWR4IF1cbiAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuICAgICAgICBULmVxIGNvdW50LCBtYXRjaGVycy5sZW5ndGhcbiAgICAgICAgZG9uZSgpXG5cbiMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEBbIFwia2V5cyAwXCIgXSA9ICggVCwgZG9uZSApIC0+XG4jICAga2V5XzAgICA9IEhPTExFUklUSC5uZXdfa2V5ICAgICBkYiwgJ3NvJywgJ2dseXBoJywgJ+WuticsICdzdHJva2VvcmRlcicsICc0NDUxMzUzMzM0J1xuIyAgIGtleV8xICAgPSBIT0xMRVJJVEgubmV3X3NvX2tleSAgZGIsICAgICAgICdnbHlwaCcsICflrrYnLCAnc3Ryb2tlb3JkZXInLCAnNDQ1MTM1MzMzNCdcbiMgICBtYXRjaGVyID0gWyAnc28nLCAnZ2x5cGgnLCAn5a62JywgJ3N0cm9rZW9yZGVyJywgJzQ0NTEzNTMzMzQnLCAwIF1cbiMgICBULmVxIGtleV8wLCBtYXRjaGVyXG4jICAgVC5lcSBrZXlfMSwga2V5XzBcbiMgICBkb25lKClcblxuIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQFsgXCJrZXlzIDFcIiBdID0gKCBULCBkb25lICkgLT5cbiMgICBbIHNrLCBzdiwgb2ssIG92LCBdID0gWyAnZ2x5cGgnLCAn5a62JywgJ3N0cm9rZW9yZGVyJywgJzQ0NTEzNTMzMzQnLCBdXG4jICAgWyBzb19rZXlfMCwgb3Nfa2V5XzAsIF0gPSBIT0xMRVJJVEgubmV3X2tleXMgZGIsICdzbycsIHNrLCBzdiwgb2ssIG92XG4jICAgc29fa2V5XzEgPSBIT0xMRVJJVEgubmV3X3NvX2tleSBkYiwgc2ssIHN2LCBvaywgb3ZcbiMgICBvc19rZXlfMSA9IEhPTExFUklUSC5uZXdfb3Nfa2V5IGRiLCBzaywgc3YsIG9rLCBvdlxuIyAgIFQuZXEgc29fa2V5XzAsIHNvX2tleV8xXG4jICAgVC5lcSBvc19rZXlfMCwgb3Nfa2V5XzFcbiMgICBkb25lKClcblxuIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQFsgXCJrZXlzIDJcIiBdID0gKCBULCBkb25lICkgLT5cbiMgICBbIHRfMCwgc2tfMCwgc3ZfMCwgb2tfMCwgb3ZfMCwgaWR4XzAsIF0gPSBbICdzbycsICdnbHlwaCcsICflrrYnLCAnc3Ryb2tlb3JkZXInLCAnNDQ1MTM1MzMzNCcsIDAsIF1cbiMgICBzb19rZXlfMCA9IEhPTExFUklUSC5uZXdfa2V5IGRiLCB0XzAsIHNrXzAsIHN2XzAsIG9rXzAsIG92XzAsIGlkeF8wXG4jICAgWyB0XzEsIHNrXzEsIHN2XzEsIG9rXzEsIG92XzEsIGlkeF8xLCBdID0gSE9MTEVSSVRILmFzX3BocmFzZSBkYiwgc29fa2V5XzBcbiMgICBULmVxIFsgdF8wLCBza18wLCBzdl8wLCBva18wLCBvdl8wLCBpZHhfMCwgXSwgWyB0XzEsIHNrXzEsIHN2XzEsIG9rXzEsIG92XzEsIGlkeF8xLCBdXG4jICAgZG9uZSgpXG5cbiMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEBbIFwib3JkZXJpbmcgYW5kIHZhbHVlIHJlY292ZXJ5IDBcIiBdID0gKCBULCBkb25lICkgLT5cbiMgICBtYXRjaGVycyAgICA9IFtdXG4jICAgcHJvYmVzX2lkeCAgPSAwXG4jICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgIGZvciBwcm9iZSBpbiBAX2ZlZWRfdGVzdF9kYXRhLnByb2Jlc1sgcHJvYmVzX2lkeCBdXG4jICAgICBbIHNrLCBzdiwgb2ssIG92LCBdID0gcHJvYmVcbiMgICAgIG1hdGNoZXJzLnB1c2ggWyAnb3MnLCBvaywgb3YsIHNrLCBzdiwgMCwgXVxuIyAgICAgbWF0Y2hlcnMucHVzaCBbICdzbycsIHNrLCBzdiwgb2ssIG92LCAwLCBdXG4jICAgQF9zb3J0X2xpc3QgbWF0Y2hlcnNcbiMgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgaWR4ID0gLTFcbiMgICBzdGVwICggcmVzdW1lICkgPT5cbiMgICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHJlc3VtZVxuIyAgICAgaW5wdXQgPSBkYlsgJyVzZWxmJyBdLmNyZWF0ZUtleVN0cmVhbSgpXG4jICAgICBpbnB1dFxuIyAgICAgICAucGlwZSAkICgga2V5LCBzZW5kICkgPT5cbiMgICAgICAgICBrZXkgPSBCWVRFV0lTRS5kZWNvZGUga2V5XG4jICAgICAgICAgaWR4ICs9ICsxXG4jICAgICAgICAgVC5lcSBrZXksIG1hdGNoZXJzWyBpZHggXVxuIyAgICAgICAucGlwZSBELiRvbl9lbmQgPT4gZG9uZSgpXG5cbiMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEBbIFwib3JkZXJpbmcgYW5kIHZhbHVlIHJlY292ZXJ5IDFcIiBdID0gKCBULCBkb25lICkgLT5cbiMgICBwcm9iZXNfaWR4ICA9IDFcbiMgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgbWF0Y2hlcnMgICAgPSBbXG4jICAgICAnb3N8Y3AvZm5jcjp1LWNqay14Yi8yMGQyNnxnbHlwaDrwoLSmfDAnXG4jICAgICAnb3N8Y3AvZm5jcjp1LWNqay14Yi8yNGZlZnxnbHlwaDrwpL+vfDAnXG4jICAgICAnb3N8Y3AvZm5jcjp1LWNqay14Yi8yNzQ3NHxnbHlwaDrwp5G0fDAnXG4jICAgICAnb3N8Y3AvZm5jcjp1LWNqay14Yi8yODRhMXxnbHlwaDrwqJKhfDAnXG4jICAgICAnb3N8Y3AvZm5jcjp1LWNqay14Yi8yYTZhN3xnbHlwaDrwqpqnfDAnXG4jICAgICAnb3N8Y3AvZm5jcjp1LWNqay14Yi8yYTZhYnxnbHlwaDrwqpqrfDAnXG4jICAgICAnb3N8Y3AvZm5jcjp1LWNqay81MmFjfGdseXBoOuWKrHwwJ1xuIyAgICAgJ29zfGNwL2ZuY3I6dS1jamsvOTBhZHxnbHlwaDrpgq18MCdcbiMgICAgICdvc3xzdHJva2VvcmRlcjozNTI1MTM1NTMyNTR8Z2x5cGg68KS/r3wwJ1xuIyAgICAgJ29zfHN0cm9rZW9yZGVyOjM1MjUxNDExMjF8Z2x5cGg68KC0pnwwJ1xuIyAgICAgJ29zfHN0cm9rZW9yZGVyOjM1MjUxNDU0fGdseXBoOvCokqF8MCdcbiMgICAgICdvc3xzdHJva2VvcmRlcjozNTI1MTUyfGdseXBoOumCrXwwJ1xuIyAgICAgJ29zfHN0cm9rZW9yZGVyOjM1MjUxNTI1MTExNTExNTExMzU0MXxnbHlwaDrwqpqrfDAnXG4jICAgICAnb3N8c3Ryb2tlb3JkZXI6MzUyNTE1MjUxMTI1MTE1MTF8Z2x5cGg68Kqap3wwJ1xuIyAgICAgJ29zfHN0cm9rZW9yZGVyOjM1MjUxNTI1MTIxNDI1MTIxNHxnbHlwaDrwp5G0fDAnXG4jICAgICAnb3N8c3Ryb2tlb3JkZXI6MzUyNTE1M3xnbHlwaDrliqx8MCdcbiMgICAgICdzb3xnbHlwaDrliqx8Y3AvZm5jcjp1LWNqay81MmFjfDAnXG4jICAgICAnc298Z2x5cGg65YqsfHN0cm9rZW9yZGVyOjM1MjUxNTN8MCdcbiMgICAgICdzb3xnbHlwaDrpgq18Y3AvZm5jcjp1LWNqay85MGFkfDAnXG4jICAgICAnc298Z2x5cGg66YKtfHN0cm9rZW9yZGVyOjM1MjUxNTJ8MCdcbiMgICAgICdzb3xnbHlwaDrwoLSmfGNwL2ZuY3I6dS1jamsteGIvMjBkMjZ8MCdcbiMgICAgICdzb3xnbHlwaDrwoLSmfHN0cm9rZW9yZGVyOjM1MjUxNDExMjF8MCdcbiMgICAgICdzb3xnbHlwaDrwpL+vfGNwL2ZuY3I6dS1jamsteGIvMjRmZWZ8MCdcbiMgICAgICdzb3xnbHlwaDrwpL+vfHN0cm9rZW9yZGVyOjM1MjUxMzU1MzI1NHwwJ1xuIyAgICAgJ3NvfGdseXBoOvCnkbR8Y3AvZm5jcjp1LWNqay14Yi8yNzQ3NHwwJ1xuIyAgICAgJ3NvfGdseXBoOvCnkbR8c3Ryb2tlb3JkZXI6MzUyNTE1MjUxMjE0MjUxMjE0fDAnXG4jICAgICAnc298Z2x5cGg68KiSoXxjcC9mbmNyOnUtY2prLXhiLzI4NGExfDAnXG4jICAgICAnc298Z2x5cGg68KiSoXxzdHJva2VvcmRlcjozNTI1MTQ1NHwwJ1xuIyAgICAgJ3NvfGdseXBoOvCqmqd8Y3AvZm5jcjp1LWNqay14Yi8yYTZhN3wwJ1xuIyAgICAgJ3NvfGdseXBoOvCqmqd8c3Ryb2tlb3JkZXI6MzUyNTE1MjUxMTI1MTE1MTF8MCdcbiMgICAgICdzb3xnbHlwaDrwqpqrfGNwL2ZuY3I6dS1jamsteGIvMmE2YWJ8MCdcbiMgICAgICdzb3xnbHlwaDrwqpqrfHN0cm9rZW9yZGVyOjM1MjUxNTI1MTExNTExNTExMzU0MXwwJ1xuIyAgICAgXVxuIyAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICBpZHggPSAtMVxuIyAgIHN0ZXAgKCByZXN1bWUgKSA9PlxuIyAgICAgeWllbGQgQF9mZWVkX3Rlc3RfZGF0YSBkYiwgcHJvYmVzX2lkeCwgcmVzdW1lXG4jICAgICBpbnB1dCA9IEhPTExFUklUSC5yZWFkIGRiXG4jICAgICBpbnB1dFxuIyAgICAgICAucGlwZSBIT0xMRVJJVEguJHVybF9mcm9tX2tleSBkYlxuIyAgICAgICAucGlwZSAkICgga2V5LCBzZW5kICkgPT5cbiMgICAgICAgICAjIGRlYnVnICfCqTRpM3FaJywga2V5XG4jICAgICAgICAgaWR4ICs9ICsxXG4jICAgICAgICAgVC5lcSBrZXksIG1hdGNoZXJzWyBpZHggXVxuIyAgICAgICAucGlwZSBELiRvbl9lbmQgPT4gZG9uZSgpXG5cbiMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEBbIFwicHJlZml4ZXMgYW5kIHNlYXJjaGluZyAwXCIgXSA9ICggVCwgZG9uZSApIC0+XG4jICAgbWF0Y2hlcnMgICAgPSBbXVxuIyAgIHByb2Jlc19pZHggID0gMVxuIyAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICBtYXRjaGVycyA9IFtcbiMgICAgICdvc3xzdHJva2VvcmRlcjozNTI1MTQxMTIxfGdseXBoOvCgtKZ8MCdcbiMgICAgICdvc3xzdHJva2VvcmRlcjozNTI1MTQ1NHxnbHlwaDrwqJKhfDAnXG4jICAgICBdXG4jICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgIGlkeCA9IC0xXG4jICAgc3RlcCAoIHJlc3VtZSApID0+XG4jICAgICB5aWVsZCBAX2ZlZWRfdGVzdF9kYXRhIGRiLCBwcm9iZXNfaWR4LCByZXN1bWVcbiMgICAgIHF1ZXJ5ID0gSE9MTEVSSVRILm5ld19xdWVyeSBkYiwgWyAnb3MnLCAnc3Ryb2tlb3JkZXInLCAnMzUyNTE0JywgXVxuIyAgICAgIyBkZWJ1ZyAnwqlxMG9qMicsIHF1ZXJ5XG4jICAgICBpbnB1dCA9IGRiWyAnJXNlbGYnIF0uY3JlYXRlS2V5U3RyZWFtIHF1ZXJ5XG4jICAgICBpbnB1dFxuIyAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICAgICAgLnBpcGUgJCAoIGJrZXksIHNlbmQgKSA9PlxuIyAgICAgICAgIHVybCA9IEhPTExFUklUSC51cmxfZnJvbV9rZXkgZGIsIEhPTExFUklUSC5fZGVjb2RlIGRiLCBia2V5XG4jICAgICAgICAgaWR4ICs9ICsxXG4jICAgICAgICAgVC5lcSB1cmwsIG1hdGNoZXJzWyBpZHggXVxuIyAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICAgICAgLnBpcGUgRC4kb25fZW5kID0+XG4jICAgICAgICAgVC5lcSBpZHgsIDFcbiMgICAgICAgICBkb25lKClcblxuIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQFsgXCJwcmVmaXhlcyBhbmQgc2VhcmNoaW5nIDFcIiBdID0gKCBULCBkb25lICkgLT5cbiMgICBtYXRjaGVycyAgICA9IFtdXG4jICAgcHJvYmVzX2lkeCAgPSAxXG4jICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgIG1hdGNoZXJzID0gW1xuIyAgICAgJ29zfHN0cm9rZW9yZGVyOjM1MjUxNDExMjF8Z2x5cGg68KC0pnwwJ1xuIyAgICAgJ29zfHN0cm9rZW9yZGVyOjM1MjUxNDU0fGdseXBoOvCokqF8MCdcbiMgICAgIF1cbiMgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgaWR4ID0gLTFcbiMgICBzdGVwICggcmVzdW1lICkgPT5cbiMgICAgIHlpZWxkIEBfZmVlZF90ZXN0X2RhdGEgZGIsIHByb2Jlc19pZHgsIHJlc3VtZVxuIyAgICAgaW5wdXQgPSBIT0xMRVJJVEgucmVhZCBkYiwgWyAnb3MnLCAnc3Ryb2tlb3JkZXInLCAnMzUyNTE0JywgXVxuIyAgICAgICAucGlwZSBIT0xMRVJJVEguJHVybF9mcm9tX2tleSBkYlxuIyAgICAgICAucGlwZSBELiRzaG93KClcbiMgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgICAgIC5waXBlICQgKCB1cmwsIHNlbmQgKSA9PlxuIyAgICAgICAgIGlkeCArPSArMVxuIyAgICAgICAgIFQuZXEgdXJsLCBtYXRjaGVyc1sgaWR4IF1cbiMgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgICAgIC5waXBlIEQuJG9uX2VuZCA9PlxuIyAgICAgICAgIFQuZXEgaWR4LCAxXG4jICAgICAgICAgZG9uZSgpXG5cbiMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEBbIFwiX29yZGVyaW5nXCIgXSA9ICggVCwgZG9uZSApIC0+XG4jICAgaGkgPSB1bmRlZmluZWRcbiMgICBsbyA9IG51bGxcbiMgICBwcm9iZXMgPSBbXG4jICAgICBbICd4JywgJzwzNTI1MTM1PicsICAgICAgICAgICAgIF1cbiMgICAgIFsgJ3gnLCAnPDM1MjUxNDExMjE+JywgICAgICAgICAgXVxuIyAgICAgWyAneCcsICc8MzUyNTE0NTQ+JywgICAgICAgICAgICBdXG4jICAgICBbICd4JywgJzwzNTI1MTUyPicsICAgICAgICAgICAgIF1cbiMgICAgIFsgJ3gnLCAnPDM1MjUxNTI1MT4nLCAgICAgICAgICAgXVxuIyAgICAgWyAneCcsICc8MzUyNTE1MjUxMT4nLCAgICAgICAgICBdXG4jICAgICBbICd4JywgJzwzNTI1MTUzPicsICAgICAgICAgICAgIF1cbiMgICAgIFsgJ3gnLCArSW5maW5pdHksIF1cbiMgICAgIFsgJ3gnLCAtSW5maW5pdHksIF1cbiMgICAgIFsgJ3gnLCA0MiwgXVxuIyAgICAgWyAneCcsIC00MiwgXVxuIyAgICAgWyAneCcsICdhJywgXVxuIyAgICAgWyAneCcsICd6JywgXVxuIyAgICAgWyAneCcsICfkuK0nLCBdXG4jICAgICBbICd4JywgJ1xcdWZmZmYnLCBdXG4jICAgICBbICd4JywgJ/Cggp0nLCBdXG4jICAgICAjIFsgJ3gnLCAoIG5ldyBCdWZmZXIgKCBTdHJpbmcuZnJvbUNvZGVQb2ludCAweDEwZmZmZiApLCAndXRmLTgnICksIF1cbiMgICAgICMgWyAneCcsICggbmV3IEJ1ZmZlciAoIFN0cmluZy5mcm9tQ29kZVBvaW50IDB4MTBmZmZmICksICd1dGYtOCcgKS50b1N0cmluZygpLCBdXG4jICAgICAjIFsgJ3gnLCBoaSwgXVxuIyAgICAgIyBbICd4JywgbG8sIF1cbiMgICAgIFsgJ29zJywgJ29rJywgXSAgICAgICAgIyAnb3N8b2snXG4jICAgICBbICdvcycsICdvaycsICdvdicsIF0gICMgJ29zfG9rOm92J1xuIyAgICAgWyAnb3MnLCAnb2sqJywgXSAgICAgICAjICdvc3xvayonXG4jICAgICBbICdvcycsICdvaycsICdvdionLCBdICMgJ29zfG9rOm92KidcbiMgICAgIF1cbiMgICAgICMgIyBbICdvcycsIFsgJ29rJywgJ292JywgXSwgWyAnc2snLCAnc3YnLCBdLCAwLCBdXG4jICAgICAjIFsgJ29zJywgJ3N0cm9rZW9yZGVyJywgJzwzNTI1MTQxMTIxPicsICAgICAgICAgICAgJ2dseXBoJywgJ/CgtKYnLCAwLCBdXG4jICAgICAjIFsgJ29zJywgJ3N0cm9rZW9yZGVyJywgJzwzNTI1MTQ1ND4nLCAgICAgICAgICAgICAgJ2dseXBoJywgJ/CokqEnLCAwLCBdXG4jICAgICAjIFsgJ29zJywgJ3N0cm9rZW9yZGVyJywgJzwzNTI1MTUyPicsICAgICAgICAgICAgICAgJ2dseXBoJywgJ+mCrScsIDAsIF1cbiMgICAgICMgWyAnb3MnLCAnc3Ryb2tlb3JkZXInLCAnPDM1MjUxNTI1MTExNTExNTExMzU0MT4nLCAnZ2x5cGgnLCAn8KqaqycsIDAsIF1cbiMgICAgICMgWyAnb3MnLCAnc3Ryb2tlb3JkZXInLCAnPDM1MjUxNTI1MTEyNTExNTExPicsICAgICAnZ2x5cGgnLCAn8KqapycsIDAsIF1cbiMgICAgICMgWyAnb3MnLCAnc3Ryb2tlb3JkZXInLCAnPDM1MjUxNTI1MTIxNDI1MTIxND4nLCAgICAnZ2x5cGgnLCAn8KeRtCcsIDAsIF1cbiMgICAgICMgWyAnb3MnLCAnc3Ryb2tlb3JkZXInLCAnPDM1MjUxNTM+JywgICAgICAgICAgICAgICAnZ2x5cGgnLCAn5YqsJywgMCwgXVxuIyAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICBAX3NvcnRfbGlzdCBwcm9iZXNcbiMgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgbGluZXMgPSAoIFsgKCBDTkQuZ3JlZW4gcHJvYmUgKSwgKCBDTkQuZ3JleSBCWVRFV0lTRS5lbmNvZGUgcHJvYmUgKSwgXSBmb3IgcHJvYmUgaW4gcHJvYmVzIClcbiMgICBsb2cgKCByZXF1aXJlICdjb2x1bW5pZnknICkgbGluZXNcblxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfbWFpbiA9ICggaGFuZGxlciApIC0+XG4gIGRiID0gSE9MTEVSSVRILm5ld19kYiBqb2luIF9fZGlybmFtZSwgJy4uJywgJ2Ricy90ZXN0cydcbiAgdGVzdCBALCAndGltZW91dCc6IDI1MDBcblxuIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG51bmxlc3MgbW9kdWxlLnBhcmVudD9cbiAgQF9tYWluKClcblxuIl19