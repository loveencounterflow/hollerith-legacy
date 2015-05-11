(function() {
  var $, CND, D, HOLLERITH, after, alert, badge, debug, echo, eventually, every, help, immediately, info, join, log, new_db, njs_path, options, repeat_immediately, rpr, step, suspend, urge, warn, whisper, ƒ,
    slice = [].slice;

  njs_path = require('path');

  join = njs_path.join;

  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'HOLLERITH/test';

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

  eventually = suspend.eventually;

  immediately = suspend.immediately;

  repeat_immediately = suspend.repeat_immediately;

  every = suspend.every;

  D = require('pipedreams2');

  $ = D.remit.bind(D);

  new_db = require('level');

  HOLLERITH = require('./main');

  ƒ = CND.format_number.bind(CND);

  options = null;

  this._misfit = Symbol('misfit');

  D.new_indexer = function(idx) {
    if (idx == null) {
      idx = 0;
    }
    return (function(_this) {
      return function(data) {
        return [idx++, data];
      };
    })(this);
  };

  this.initialize = function(handler) {
    options['db'] = HOLLERITH.new_db(options['route']);
    return handler(null);
  };

  this.main = function(first_query) {
    if (first_query == null) {
      first_query = {
        gte: 'os|rank/cjt:0',
        lte: 'os|rank/cjt:9'
      };
    }
    return step((function(_this) {
      return function*(resume) {
        var CHR, count_chrs, db, input;
        (yield _this.initialize(resume));
        db = options['db'];
        CHR = require('/Volumes/Storage/io/coffeenode-chr');
        count_chrs = function(text) {
          return (CHR.chrs_from_text(text, {
            input: 'xncr'
          })).length;
        };
        input = db['%self'].createKeyStream(first_query);

        /* TAINT We can currently not use `HOLLERITH2.read_sub` because HOLLERITH2 assumes a key-only
        DB that uses binary encoding with a custom https://github.com/deanlandolt/bytewise layer; the current
        Jizura DB version uses UTF-8 strings and is a key/value DB.
         */
        return input.pipe(_this._$split_bkey()).pipe(_this.read_sub(db, {
          indexed: true
        }, function(key) {
          var glyph, ok, pt, rank, sk, sub_key;
          pt = key[0], ok = key[1], rank = key[2], sk = key[3], glyph = key[4];
          sub_key = "so|glyph:" + glyph + "|pod:";
          return db['%self'].createValueStream({
            gte: sub_key,
            lte: sub_key + '\uffff'
          });
        })).pipe(D.$densort(0, 0, true)).pipe($(function(arg, send) {
          var glyph, idx, lineup, pod, ref, strokeorder;
          idx = arg[0], (ref = arg[1], pod = ref[0]);
          debug('©jd5cE', pod);
          if (pod['strokeorder/short'] == null) {
            return warn('©9YXoq', pod);
          } else {
            glyph = pod['glyph/uchr'];
            strokeorder = pod['strokeorder/short'][0].length;
            lineup = pod['guide/lineup/uchr'].replace(/\u3000/g, '');
            return send([glyph, strokeorder, lineup]);
          }
        })).pipe($(function(arg, send) {
          var glyph, lineup, strokeorder;
          glyph = arg[0], strokeorder = arg[1], lineup = arg[2];
          return send([glyph, strokeorder, count_chrs(lineup)]);
        })).pipe(D.$sort(function(a, b) {
          var idx;
          idx = 1;
          if (a[idx] > b[idx]) {
            return +1;
          }
          if (a[idx] < b[idx]) {
            return -1;
          }
          return 0;
        })).pipe(D.$show());
      };
    })(this));
  };

  this._$split_bkey = function() {
    return $((function(_this) {
      return function(bkey, send) {
        return send(_this._split_bkey(bkey));
      };
    })(this));
  };

  this._split_bkey = function(bkey) {
    var R;
    R = bkey.toString('utf-8');
    R = (R.split('|')).slice(0, 3);
    R = [R[0]].concat(slice.call(R[1].split(':')), slice.call(R[2].split(':')));
    return R;
  };

  this._$split_so_bkey = function() {
    return $((function(_this) {
      return function(bkey, send) {
        return send(_this._split_so_bkey(bkey));
      };
    })(this));
  };

  this._split_so_bkey = function(bkey) {
    var R, idx_txt;
    R = bkey.toString('utf-8');
    R = R.split('|');
    idx_txt = R[3];
    R = [(R[1].split(':'))[1]].concat(slice.call(R[2].split(':')));
    if ((idx_txt != null) && idx_txt.length > 0) {
      R.push(parseInt(idx_txt, 10));
    }
    return R;
  };

  this._lte_from_gte = function(gte) {
    var R, last_idx;
    R = new Buffer((last_idx = Buffer.byteLength(gte)) + 1);
    R.write(gte);
    R[last_idx] = 0xff;
    return R;
  };

  this.$lineup_from_glyph = function(db) {
    var settings;
    settings = {
      indexed: false,
      single: true
    };
    return this.read_sub(db, settings, (function(_this) {
      return function(glyph) {
        var lte, sub_input;
        lte = "so|glyph:" + glyph + "|guide/lineup/uchr:";
        sub_input = db['%self'].createKeyStream({
          gte: lte,
          lte: _this._lte_from_gte(lte)
        });
        return sub_input;
      };
    })(this));
  };

  this.$shapeclass_wbf_from_glyph_and_lineup = function(db) {

    /* TAINT wrong */
    var settings;
    settings = {
      indexed: false,
      single: true
    };
    return this.read_sub(db, settings, (function(_this) {
      return function(arg) {
        var glyph, i, len, lineup_glyph, lineup_glyphs, results;
        glyph = arg[0], lineup_glyphs = arg[1];
        results = [];
        for (i = 0, len = lineup_glyphs.length; i < len; i++) {
          lineup_glyph = lineup_glyphs[i];
          results.push((function(lineup_glyph) {
            var gte, sub_input;
            gte = "so|glyph:" + lineup_glyph + "|factor/strokeclass/wbf:";
            sub_input = db['%self'].createKeyStream({
              gte: gte,
              lte: _this._lte_from_gte(gte)
            });
            return sub_input;
          })(lineup_glyph));
        }
        return results;
      };
    })(this));
  };

  HOLLERITH.$pick_subject = function() {
    return $((function(_this) {
      return function(lkey, send) {
        var _, pt, v0, v1;
        pt = lkey[0], _ = lkey[1], v0 = lkey[2], _ = lkey[3], v1 = lkey[4];
        return send(pt === 'so' ? v0 : v1);
      };
    })(this));
  };

  HOLLERITH.$pick_object = function() {
    return $((function(_this) {
      return function(lkey, send) {
        var _, pt, v0, v1;
        pt = lkey[0], _ = lkey[1], v0 = lkey[2], _ = lkey[3], v1 = lkey[4];
        return send(pt === 'so' ? v1 : v0);
      };
    })(this));
  };

  HOLLERITH.$pick_values = function() {
    return $((function(_this) {
      return function(lkey, send) {
        var _, pt, v0, v1;
        pt = lkey[0], _ = lkey[1], v0 = lkey[2], _ = lkey[3], v1 = lkey[4];
        return send(pt === 'so' ? [v0, v1] : [v1, v0]);
      };
    })(this));
  };

  this.copy_jizura_db = function() {
    var batch_size, ds_options, gte, input, lte, output, source_db, target_db;
    ds_options = require('/Volumes/Storage/io/jizura-datasources/options');
    source_db = HOLLERITH.new_db(options['route']);
    target_db = HOLLERITH.new_db('/Volumes/Storage/temp/jizura-hollerith2');
    gte = 'so|';
    lte = this._lte_from_gte(gte);
    input = source_db['%self'].createKeyStream({
      gte: gte,
      lte: lte
    });
    batch_size = 10000;
    output = HOLLERITH.$write(target_db, batch_size);
    return input.pipe(D.$count(function(count) {
      return help("read " + count + " keys");
    })).pipe(this._$split_so_bkey()).pipe($((function(_this) {
      return function(key, send) {
        var glyph, idx, obj, prd;
        glyph = key[0], prd = key[1], obj = key[2], idx = key[3];
        if (prd !== 'pod') {
          return send(key);
        }
      };
    })(this))).pipe(D.$count(function(count) {
      return help("kept " + count + " entries");
    })).pipe((function(_this) {
      return function() {
        var buffer, last_sp, memo;
        buffer = null;
        memo = null;
        last_sp = null;
        return $(function(key, send) {
          var idx, obj, prd, sbj, sp;
          sbj = key[0], prd = key[1], obj = key[2], idx = key[3];
          if (idx != null) {
            sp = sbj + "|" + prd;
            if (sp === last_sp) {
              return buffer[idx] = obj;
            } else {
              if (buffer != null) {
                send(slice.call(memo).concat([buffer]));
              }
              buffer = [];
              buffer[idx] = obj;
              memo = [sbj, prd];
              return last_sp = sp;
            }
          } else {
            return send([sbj, prd, obj]);
          }
        });
      };
    })(this)()).pipe($((function(_this) {
      return function(arg, send) {
        var obj, prd, sbj, type, type_description;
        sbj = arg[0], prd = arg[1], obj = arg[2];

        /* Type Casting */
        type_description = ds_options['schema'][prd];
        if (type_description == null) {
          warn("no type description for predicate " + (rpr(prd)));
        } else {
          switch (type = type_description['type']) {
            case 'int':
              obj = parseInt(obj, 10);
              break;
            case 'text':

              /* TAINT we have no booleans configured */
              if (obj === 'true') {
                obj = true;
              } else if (obj === 'false') {
                obj = false;
              }
          }
        }
        return send([sbj, prd, obj]);
      };
    })(this))).pipe((function(_this) {
      return function() {
        var count;
        count = 0;
        return $(function(phrase, send) {
          count += 1;
          if (count % 1000 === 0) {
            echo(count, phrase);
          }
          return send(phrase);
        });
      };
    })(this)()).pipe(output);
  };

  this.dump_jizura_db = function() {
    var input, prefix, source_db;
    source_db = HOLLERITH.new_db('/Volumes/Storage/temp/jizura-hollerith2');
    prefix = ['spo', '𡏠'];
    prefix = ['spo', '㔰'];
    input = HOLLERITH.create_phrasestream(source_db, prefix);
    return input.pipe(D.$count(function(count) {
      return help("read " + count + " keys");
    })).pipe($((function(_this) {
      return function(data, send) {
        return send(JSON.stringify(data));
      };
    })(this))).pipe(D.$show());
  };


  /* version for Hollerith1 DBs */

  this.find_good_kwic_sample_glyphs_1 = function(db) {
    return step((function(_this) {
      return function*(resume) {
        var CHR, chrs_from_text, decode_lineup, decode_rank, gte, input, lte, xncr_from_uchr;
        if (db == null) {
          (yield _this.initialize(resume));
          db = options['db'];
        }
        CHR = require('/Volumes/Storage/io/coffeenode-chr');
        chrs_from_text = function(text) {
          return CHR.chrs_from_text(text, {
            input: 'xncr'
          });
        };
        gte = 'os|guide/lineup/length:05';
        lte = _this._lte_from_gte(gte);
        input = db['%self'].createKeyStream({
          gte: gte,
          lte: lte
        });
        decode_rank = function(bkey) {
          var rank_txt, ref;
          ref = _this._split_bkey(bkey), rank_txt = ref[ref.length - 1];
          return parseInt(rank_txt, 10);
        };
        decode_lineup = function(bkey) {
          var lineup, ref;
          ref = _this._split_bkey(bkey), lineup = ref[ref.length - 1];
          lineup = lineup.replace(/\u3000/g, '');
          return chrs_from_text(lineup);
        };
        xncr_from_uchr = function(uchr) {
          if ((CHR.as_rsg(uchr)) === 'u-pua') {
            return CHR.as_xncr(uchr, {
              csg: 'jzr'
            });
          } else {
            return uchr;
          }
        };
        return input.pipe(_this._$split_bkey()).pipe(HOLLERITH.read_sub(db, {
          mangle: decode_rank
        }, function(phrase) {
          var glyph, sub_gte, sub_input, sub_lte;
          glyph = phrase[phrase.length - 1];
          sub_gte = "so|glyph:" + glyph + "|rank/cjt:";
          sub_lte = _this._lte_from_gte(sub_gte);
          sub_input = db['%self'].createKeyStream({
            gte: sub_gte,
            lte: sub_lte
          });
          return [glyph, sub_input];
        })).pipe(D.$filter(function(arg) {
          var glyph, rank;
          glyph = arg[0], rank = arg[1];
          return rank < 1500;
        })).pipe(HOLLERITH.read_sub(db, {
          mangle: decode_lineup
        }, function(record) {
          var glyph, rank, sub_gte, sub_input, sub_lte;
          glyph = record[0], rank = record[1];
          sub_gte = "so|glyph:" + glyph + "|guide/lineup/uchr:";
          sub_lte = _this._lte_from_gte(sub_gte);
          sub_input = db['%self'].createKeyStream({
            gte: sub_gte,
            lte: sub_lte
          });
          return [[glyph, rank], sub_input];
        })).pipe(HOLLERITH.read_sub(db, function(record) {
          var confluence, fn, glyph, guide, guides, i, len, rank, ref, stream_count;
          (ref = record[0], glyph = ref[0], rank = ref[1]), guides = record[1];
          confluence = D.create_throughstream();
          stream_count = 0;
          fn = function(guide) {
            var guide_xncr, sub_gte, sub_input, sub_lte;
            guide_xncr = xncr_from_uchr(guide);
            stream_count += +1;
            sub_gte = "so|glyph:" + guide_xncr + "|factor/shapeclass/wbf:";
            sub_lte = _this._lte_from_gte(sub_gte);
            sub_input = db['%self'].createKeyStream({
              gte: sub_gte,
              lte: sub_lte
            });
            sub_input.on('end', function() {
              stream_count += -1;
              if (stream_count < 1) {
                return confluence.end();
              }
            });
            return sub_input.pipe(_this._$split_bkey()).pipe($(function(data, send) {
              var shapeclass_wbf;
              shapeclass_wbf = data[data.length - 1];
              return confluence.write([guide, shapeclass_wbf]);
            }));
          };
          for (i = 0, len = guides.length; i < len; i++) {
            guide = guides[i];
            fn(guide);
          }
          return [[glyph, rank, guides], confluence];
        })).pipe($(function(data, send) {
          return send(JSON.stringify(data));
        })).pipe(D.$show());
      };
    })(this));
  };


  /* version for Hollerith2 DBs */

  this.find_good_kwic_sample_glyphs_2 = function(db) {
    return step((function(_this) {
      return function(resume) {
        var CHR, chrs_from_text, decode_lineup, input, prefix, xncr_from_uchr;
        if (db == null) {
          db = HOLLERITH.new_db('/Volumes/Storage/temp/jizura-hollerith2');
        }
        CHR = require('/Volumes/Storage/io/coffeenode-chr');
        chrs_from_text = function(text) {
          return CHR.chrs_from_text(text, {
            input: 'xncr'
          });
        };
        prefix = ['pos', 'guide/lineup/length', 5];
        input = HOLLERITH.create_phrasestream(db, prefix);
        decode_lineup = function(data) {
          var lineup;
          lineup = data[data.length - 1];
          return chrs_from_text(lineup.replace(/\u3000/g, ''));
        };
        xncr_from_uchr = function(uchr) {
          if ((CHR.as_rsg(uchr)) === 'u-pua') {
            return CHR.as_xncr(uchr, {
              csg: 'jzr'
            });
          } else {
            return uchr;
          }
        };
        return input.pipe(HOLLERITH.read_sub(db, function(phrase) {
          var _, glyph, lineup_length, sub_input, sub_prefix;
          glyph = phrase[0], _ = phrase[1], lineup_length = phrase[2];
          sub_prefix = ['spo', glyph, 'rank/cjt'];
          sub_input = HOLLERITH.create_phrasestream(db, sub_prefix);
          return [[glyph, lineup_length], sub_input];
        })).pipe($(function(data, send) {
          var _, glyph, lineup_length, rank, ref, ref1;
          (ref = data[0], glyph = ref[0], lineup_length = ref[1]), (ref1 = data[1], _ = ref1[0], _ = ref1[1], rank = ref1[2]);
          return send([glyph, lineup_length, rank]);
        })).pipe(D.$filter(function(arg) {
          var glyph, lineup_length, rank;
          glyph = arg[0], lineup_length = arg[1], rank = arg[2];
          return rank < 15000;
        })).pipe(HOLLERITH.read_sub(db, {
          mangle: decode_lineup
        }, function(data) {
          var glyph, lineup_length, rank, sub_input, sub_prefix;
          glyph = data[0], lineup_length = data[1], rank = data[2];
          sub_prefix = ['spo', glyph, 'guide/lineup/uchr'];
          sub_input = HOLLERITH.create_phrasestream(db, sub_prefix);
          return [[glyph, lineup_length, rank], sub_input];
        })).pipe(HOLLERITH.read_sub(db, function(data) {
          var confluence, fn, glyph, guide, guides, i, len, lineup_length, rank, ref, stream_count;
          (ref = data[0], glyph = ref[0], lineup_length = ref[1], rank = ref[2]), guides = data[1];
          confluence = D.create_throughstream();
          stream_count = 0;
          fn = function(guide) {
            var guide_xncr, sub_input, sub_prefix;
            guide_xncr = xncr_from_uchr(guide);
            stream_count += +1;
            sub_prefix = ['spo', guide_xncr, 'factor/shapeclass/wbf'];
            sub_input = HOLLERITH.create_phrasestream(db, sub_prefix);
            sub_input.on('end', function() {
              stream_count += -1;
              if (stream_count < 1) {
                return confluence.end();
              }
            });
            return sub_input.pipe($(function(data, send) {
              var shapeclass_wbf;
              shapeclass_wbf = data[data.length - 1];
              return confluence.write(shapeclass_wbf);
            }));
          };
          for (i = 0, len = guides.length; i < len; i++) {
            guide = guides[i];
            fn(guide);
          }
          return [[glyph, lineup_length, rank, guides], confluence];
        })).pipe(D.$filter(function(data) {
          var counts, glyph, guides, i, len, lineup_length, rank, ref, shapeclass_idx, shapeclass_wbf, shapeclasses_wbf;
          (ref = data[0], glyph = ref[0], lineup_length = ref[1], rank = ref[2], guides = ref[3]), shapeclasses_wbf = 2 <= data.length ? slice.call(data, 1) : [];
          counts = [0, 0, 0, 0, 0];
          for (i = 0, len = shapeclasses_wbf.length; i < len; i++) {
            shapeclass_wbf = shapeclasses_wbf[i];
            shapeclass_idx = (parseInt(shapeclass_wbf[0], 10)) - 1;
            counts[shapeclass_idx] += +1;
          }
          return (counts.join(',')) === '1,1,1,1,1';
        })).pipe($(function(data, send) {
          return send(JSON.stringify(data));
        })).pipe(D.$show());
      };
    })(this));
  };

  if (module.parent == null) {
    options = {
      'route': '/Volumes/Storage/io/jizura-datasources/data/leveldb'
    };
    debug('©AoOAS', options);
    this.find_good_kwic_sample_glyphs_2();
  }

}).call(this);

//# sourceMappingURL=data:application/json;base64,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QSxDQUFSLElBQTRCLENBQUEsQ0FENUIsQ0FERjtBQUFBLFdBRkE7QUFLQSxpQkFBTyxDQUFFLE1BQU0sQ0FBQyxJQUFQLENBQVksR0FBWixDQUFGLENBQUEsS0FBdUIsV0FBOUIsQ0FOYztRQUFBLENBQVYsQ0ExQ1IsQ0FrREUsQ0FBQyxJQWxESCxDQWtEUSxDQUFBLENBQUUsU0FBRSxJQUFGLEVBQVEsSUFBUixHQUFBO2lCQUFrQixJQUFBLENBQUssSUFBSSxDQUFDLFNBQUwsQ0FBZSxJQUFmLENBQUwsRUFBbEI7UUFBQSxDQUFGLENBbERSLENBbURFLENBQUMsSUFuREgsQ0FtRFEsQ0FBQyxDQUFDLEtBQUYsQ0FBQSxDQW5EUixFQXBCRztNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUwsRUFGZ0M7RUFBQSxDQTlVbEMsQ0FBQTs7QUEyWkEsRUFBQSxJQUFPLHFCQUFQO0FBR0UsSUFBQSxPQUFBLEdBR0U7QUFBQSxNQUFBLE9BQUEsRUFBd0IscURBQXhCO0tBSEYsQ0FBQTtBQUFBLElBTUEsS0FBQSxDQUFNLFFBQU4sRUFBZ0IsT0FBaEIsQ0FOQSxDQUFBO0FBQUEsSUFhQSxJQUFDLENBQUEsOEJBQUQsQ0FBQSxDQWJBLENBSEY7R0EzWkE7QUFBQSIsImZpbGUiOiJkZW1vLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiXG5cblxuIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5uanNfcGF0aCAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAncGF0aCdcbiMgbmpzX2ZzICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2ZzJ1xuam9pbiAgICAgICAgICAgICAgICAgICAgICA9IG5qc19wYXRoLmpvaW5cbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuQ05EICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2NuZCdcbnJwciAgICAgICAgICAgICAgICAgICAgICAgPSBDTkQucnByXG5iYWRnZSAgICAgICAgICAgICAgICAgICAgID0gJ0hPTExFUklUSC90ZXN0J1xubG9nICAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdwbGFpbicsICAgICBiYWRnZVxuaW5mbyAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdpbmZvJywgICAgICBiYWRnZVxud2hpc3BlciAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICd3aGlzcGVyJywgICBiYWRnZVxuYWxlcnQgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdhbGVydCcsICAgICBiYWRnZVxuZGVidWcgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdkZWJ1ZycsICAgICBiYWRnZVxud2FybiAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICd3YXJuJywgICAgICBiYWRnZVxuaGVscCAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdoZWxwJywgICAgICBiYWRnZVxudXJnZSAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICd1cmdlJywgICAgICBiYWRnZVxuZWNobyAgICAgICAgICAgICAgICAgICAgICA9IENORC5lY2hvLmJpbmQgQ05EXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnN1c3BlbmQgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdjb2ZmZWVub2RlLXN1c3BlbmQnXG5zdGVwICAgICAgICAgICAgICAgICAgICAgID0gc3VzcGVuZC5zdGVwXG5hZnRlciAgICAgICAgICAgICAgICAgICAgID0gc3VzcGVuZC5hZnRlclxuZXZlbnR1YWxseSAgICAgICAgICAgICAgICA9IHN1c3BlbmQuZXZlbnR1YWxseVxuaW1tZWRpYXRlbHkgICAgICAgICAgICAgICA9IHN1c3BlbmQuaW1tZWRpYXRlbHlcbnJlcGVhdF9pbW1lZGlhdGVseSAgICAgICAgPSBzdXNwZW5kLnJlcGVhdF9pbW1lZGlhdGVseVxuZXZlcnkgICAgICAgICAgICAgICAgICAgICA9IHN1c3BlbmQuZXZlcnlcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyBCWVRFV0lTRSAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnYnl0ZXdpc2UnXG4jIHRocm91Z2ggICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICd0aHJvdWdoMidcbiMgTGV2ZWxCYXRjaCAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2xldmVsLWJhdGNoLXN0cmVhbSdcbiMgQmF0Y2hTdHJlYW0gICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2JhdGNoLXN0cmVhbSdcbiMgcGFyYWxsZWwgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2NvbmN1cnJlbnQtd3JpdGFibGUnXG5EICAgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAncGlwZWRyZWFtczInXG4kICAgICAgICAgICAgICAgICAgICAgICAgID0gRC5yZW1pdC5iaW5kIERcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxubmV3X2RiICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2xldmVsJ1xuIyBuZXdfbGV2ZWxncmFwaCAgICAgICAgICAgID0gcmVxdWlyZSAnbGV2ZWxncmFwaCdcbiMgZGIgICAgICAgICAgICAgICAgICAgICAgICA9IG5ld19sZXZlbGdyYXBoICcvdG1wL2xldmVsZ3JhcGgnXG5IT0xMRVJJVEggICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi9tYWluJ1xuxpIgICAgICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZm9ybWF0X251bWJlci5iaW5kIENORFxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5vcHRpb25zICAgICAgICAgICAgICAgICAgID0gbnVsbFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfbWlzZml0ICAgICAgICAgID0gU3ltYm9sICdtaXNmaXQnXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIFBJUEVEUkVBTVNcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuRC5uZXdfaW5kZXhlciA9ICggaWR4ID0gMCApIC0+ICggZGF0YSApID0+IFsgaWR4KyssIGRhdGEsIF1cblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQGluaXRpYWxpemUgPSAoIGhhbmRsZXIgKSAtPlxuICBvcHRpb25zWyAnZGInIF0gPSBIT0xMRVJJVEgubmV3X2RiIG9wdGlvbnNbICdyb3V0ZScgXVxuICBoYW5kbGVyIG51bGxcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AbWFpbiA9ICggZmlyc3RfcXVlcnkgKSAtPlxuICBmaXJzdF9xdWVyeSA/PSB7IGd0ZTogJ29zfHJhbmsvY2p0OjAnLCBsdGU6ICdvc3xyYW5rL2NqdDo5JywgfVxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBAaW5pdGlhbGl6ZSByZXN1bWVcbiAgICBkYiA9IG9wdGlvbnNbICdkYicgXVxuICAgIENIUiA9IHJlcXVpcmUgJy9Wb2x1bWVzL1N0b3JhZ2UvaW8vY29mZmVlbm9kZS1jaHInXG4gICAgY291bnRfY2hycyA9ICggdGV4dCApIC0+ICggQ0hSLmNocnNfZnJvbV90ZXh0IHRleHQsIGlucHV0OiAneG5jcicgKS5sZW5ndGhcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGlucHV0ID0gZGJbICclc2VsZicgXS5jcmVhdGVLZXlTdHJlYW0gZmlyc3RfcXVlcnlcbiAgICAjIGsgPSBcInNvfGdseXBoOue5vHxwb2Q6XCJcbiAgICAjIGlucHV0ID0gZGJbICclc2VsZicgXS5jcmVhdGVLZXlTdHJlYW0gZGIsIHsgZ3RlOiBrLCBsdGU6IGsgKyAnXFx1ZmZmZicgfVxuICAgICMgZGVidWcgJ8KpY1c4dEsnLCBIT0xMRVJJVEgubmV3X2tleSBkYiwgJ29zJywgJ3JhbmsvY2p0JywgJzAwMDAwJ1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyMjIFRBSU5UIFdlIGNhbiBjdXJyZW50bHkgbm90IHVzZSBgSE9MTEVSSVRIMi5yZWFkX3N1YmAgYmVjYXVzZSBIT0xMRVJJVEgyIGFzc3VtZXMgYSBrZXktb25seVxuICAgIERCIHRoYXQgdXNlcyBiaW5hcnkgZW5jb2Rpbmcgd2l0aCBhIGN1c3RvbSBodHRwczovL2dpdGh1Yi5jb20vZGVhbmxhbmRvbHQvYnl0ZXdpc2UgbGF5ZXI7IHRoZSBjdXJyZW50XG4gICAgSml6dXJhIERCIHZlcnNpb24gdXNlcyBVVEYtOCBzdHJpbmdzIGFuZCBpcyBhIGtleS92YWx1ZSBEQi4gIyMjXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpbnB1dFxuICAgICAgLnBpcGUgQF8kc3BsaXRfYmtleSgpXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgICMgLnBpcGUgSE9MTEVSSVRILnJlYWRfc3ViIGRiLCBpbmRleGVkOiB5ZXMsICgga2V5ICkgPT5cbiAgICAgIC5waXBlIEByZWFkX3N1YiBkYiwgaW5kZXhlZDogeWVzLCAoIGtleSApID0+XG4gICAgICAgIFsgcHQsIG9rLCByYW5rLCBzaywgZ2x5cGgsIF0gPSBrZXlcbiAgICAgICAgc3ViX2tleSA9IFwic298Z2x5cGg6I3tnbHlwaH18cG9kOlwiXG4gICAgICAgIHJldHVybiBkYlsgJyVzZWxmJyBdLmNyZWF0ZVZhbHVlU3RyZWFtIHsgZ3RlOiBzdWJfa2V5LCBsdGU6IHN1Yl9rZXkgKyAnXFx1ZmZmZicgfVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAucGlwZSBELiRkZW5zb3J0IDAsIDAsIHRydWVcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgLnBpcGUgJCAoIFsgaWR4LCBbIHBvZCwgXSwgXSwgc2VuZCApID0+XG4gICAgICAgIGRlYnVnICfCqWpkNWNFJywgcG9kXG4gICAgICAgIHVubGVzcyBwb2RbICdzdHJva2VvcmRlci9zaG9ydCcgIF0/XG4gICAgICAgICAgd2FybiAnwqk5WVhvcScsICBwb2RcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGdseXBoICAgICAgID0gcG9kWyAnZ2x5cGgvdWNocicgICAgICAgICBdXG4gICAgICAgICAgc3Ryb2tlb3JkZXIgPSBwb2RbICdzdHJva2VvcmRlci9zaG9ydCcgIF1bIDAgXS5sZW5ndGhcbiAgICAgICAgICBsaW5ldXAgICAgICA9IHBvZFsgJ2d1aWRlL2xpbmV1cC91Y2hyJyAgXS5yZXBsYWNlIC9cXHUzMDAwL2csICcnXG4gICAgICAgICAgc2VuZCBbIGdseXBoLCBzdHJva2VvcmRlciwgbGluZXVwLCBdXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIC5waXBlICQgKCBbIGdseXBoLCBzdHJva2VvcmRlciwgbGluZXVwLCBdLCBzZW5kICkgPT5cbiAgICAgICAgc2VuZCBbIGdseXBoLCBzdHJva2VvcmRlciwgY291bnRfY2hycyBsaW5ldXAsIF1cbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgLnBpcGUgRC4kc29ydCAoIGEsIGIgKSAtPlxuICAgICAgICBpZHggPSAxXG4gICAgICAgIHJldHVybiArMSBpZiBhWyBpZHggXSA+IGJbIGlkeCBdXG4gICAgICAgIHJldHVybiAtMSBpZiBhWyBpZHggXSA8IGJbIGlkeCBdXG4gICAgICAgIHJldHVybiAgMFxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAucGlwZSBELiRzaG93KClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AXyRzcGxpdF9ia2V5ID0gLT4gJCAoIGJrZXksIHNlbmQgKSA9PiBzZW5kIEBfc3BsaXRfYmtleSBia2V5XG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9zcGxpdF9ia2V5ID0gKCBia2V5ICkgLT5cbiAgUiA9IGJrZXkudG9TdHJpbmcgJ3V0Zi04J1xuICBSID0gKCBSLnNwbGl0ICd8JyApWyAuLiAyIF1cbiAgUiA9IFsgUlsgMCBdLCAoIFJbIDEgXS5zcGxpdCAnOicgKS4uLiwgKCBSWyAyIF0uc3BsaXQgJzonICkuLi4sIF1cbiAgcmV0dXJuIFJcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AXyRzcGxpdF9zb19ia2V5ID0gLT4gJCAoIGJrZXksIHNlbmQgKSA9PiBzZW5kIEBfc3BsaXRfc29fYmtleSBia2V5XG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9zcGxpdF9zb19ia2V5ID0gKCBia2V5ICkgLT5cbiAgUiAgICAgICA9IGJrZXkudG9TdHJpbmcgJ3V0Zi04J1xuICBSICAgICAgID0gUi5zcGxpdCAnfCdcbiAgaWR4X3R4dCA9IFJbIDMgXVxuICBSICAgICAgID0gWyAoIFJbIDEgXS5zcGxpdCAnOicgKVsgMSBdLCAoIFJbIDIgXS5zcGxpdCAnOicgKS4uLiwgXVxuICBSLnB1c2ggKCBwYXJzZUludCBpZHhfdHh0LCAxMMKgKSBpZiBpZHhfdHh0PyBhbmQgaWR4X3R4dC5sZW5ndGggPiAwXG4gIHJldHVybiBSXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9sdGVfZnJvbV9ndGUgPSAoIGd0ZSApIC0+XG4gIFIgPSBuZXcgQnVmZmVyICggbGFzdF9pZHggPSBCdWZmZXIuYnl0ZUxlbmd0aCBndGUgKSArIDFcbiAgUi53cml0ZSBndGVcbiAgUlsgbGFzdF9pZHggXSA9IDB4ZmZcbiAgcmV0dXJuIFJcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AJGxpbmV1cF9mcm9tX2dseXBoID0gKCBkYiApIC0+XG4gIHNldHRpbmdzID1cbiAgICBpbmRleGVkOiAgbm9cbiAgICBzaW5nbGU6ICAgeWVzXG4gIHJldHVybiBAcmVhZF9zdWIgZGIsIHNldHRpbmdzLCAoIGdseXBoICkgPT5cbiAgICBsdGUgPSBcInNvfGdseXBoOiN7Z2x5cGh9fGd1aWRlL2xpbmV1cC91Y2hyOlwiXG4gICAgc3ViX2lucHV0ID0gZGJbICclc2VsZicgXS5jcmVhdGVLZXlTdHJlYW0geyBndGU6IGx0ZSwgbHRlOiBAX2x0ZV9mcm9tX2d0ZSBsdGUsIH1cbiAgICByZXR1cm4gc3ViX2lucHV0XG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQCRzaGFwZWNsYXNzX3diZl9mcm9tX2dseXBoX2FuZF9saW5ldXAgPSAoIGRiICkgLT5cbiAgIyMjIFRBSU5UIHdyb25nICMjI1xuICBzZXR0aW5ncyA9XG4gICAgaW5kZXhlZDogIG5vXG4gICAgc2luZ2xlOiAgIHllc1xuICByZXR1cm4gQHJlYWRfc3ViIGRiLCBzZXR0aW5ncywgKCBbIGdseXBoLCBsaW5ldXBfZ2x5cGhzLCBdICkgPT5cbiAgICBmb3IgbGluZXVwX2dseXBoIGluIGxpbmV1cF9nbHlwaHNcbiAgICAgIGRvICggbGluZXVwX2dseXBoICkgPT5cbiAgICAgICAgZ3RlID0gXCJzb3xnbHlwaDoje2xpbmV1cF9nbHlwaH18ZmFjdG9yL3N0cm9rZWNsYXNzL3diZjpcIlxuICAgICAgICBzdWJfaW5wdXQgPSBkYlsgJyVzZWxmJyBdLmNyZWF0ZUtleVN0cmVhbSB7IGd0ZTogZ3RlLCBsdGU6IEBfbHRlX2Zyb21fZ3RlIGd0ZSwgfVxuICAgICAgICByZXR1cm4gc3ViX2lucHV0XG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuSE9MTEVSSVRILiRwaWNrX3N1YmplY3QgPSAtPlxuICByZXR1cm4gJCAoIGxrZXksIHNlbmQgKSA9PlxuICAgIFsgcHQsIF8sIHYwLCBfLCB2MSwgXSA9IGxrZXlcbiAgICBzZW5kIGlmIHB0IGlzICdzbycgdGhlbiB2MCBlbHNlIHYxXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuSE9MTEVSSVRILiRwaWNrX29iamVjdCA9IC0+XG4gIHJldHVybiAkICggbGtleSwgc2VuZCApID0+XG4gICAgWyBwdCwgXywgdjAsIF8sIHYxLCBdID0gbGtleVxuICAgIHNlbmQgaWYgcHQgaXMgJ3NvJyB0aGVuIHYxIGVsc2UgdjBcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5IT0xMRVJJVEguJHBpY2tfdmFsdWVzID0gLT5cbiAgcmV0dXJuICQgKCBsa2V5LCBzZW5kICkgPT5cbiAgICBbIHB0LCBfLCB2MCwgXywgdjEsIF0gPSBsa2V5XG4gICAgc2VuZCBpZiBwdCBpcyAnc28nIHRoZW4gWyB2MCwgdjEsIF0gZWxzZSBbIHYxLCB2MCwgXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBjb3B5X2ppenVyYV9kYiA9IC0+XG4gIGRzX29wdGlvbnMgID0gcmVxdWlyZSAnL1ZvbHVtZXMvU3RvcmFnZS9pby9qaXp1cmEtZGF0YXNvdXJjZXMvb3B0aW9ucydcbiAgc291cmNlX2RiICAgPSBIT0xMRVJJVEgubmV3X2RiIG9wdGlvbnNbICdyb3V0ZScgXVxuICB0YXJnZXRfZGIgICA9IEhPTExFUklUSC5uZXdfZGIgJy9Wb2x1bWVzL1N0b3JhZ2UvdGVtcC9qaXp1cmEtaG9sbGVyaXRoMidcbiAgZ3RlICAgICAgICAgPSAnc298J1xuICBsdGUgICAgICAgICA9IEBfbHRlX2Zyb21fZ3RlIGd0ZVxuICBpbnB1dCAgICAgICA9IHNvdXJjZV9kYlsgJyVzZWxmJyBdLmNyZWF0ZUtleVN0cmVhbSB7IGd0ZSwgbHRlLCB9XG4gIGJhdGNoX3NpemUgID0gMTAwMDBcbiAgb3V0cHV0ICAgICAgPSBIT0xMRVJJVEguJHdyaXRlIHRhcmdldF9kYiwgYmF0Y2hfc2l6ZVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGlucHV0XG4gICAgLnBpcGUgRC4kY291bnQgKCBjb3VudCApIC0+IGhlbHAgXCJyZWFkICN7Y291bnR9IGtleXNcIlxuICAgIC5waXBlIEBfJHNwbGl0X3NvX2JrZXkoKVxuICAgICMgLnBpcGUgJCAoIGtleSwgc2VuZCApID0+XG4gICAgIyAgICMjIyAhISEhISAjIyNcbiAgICAjICAgWyBnbHlwaCwgcHJkLCBvYmosIGlkeCwgXSA9IGtleVxuICAgICMgICBzZW5kIGtleSBpZiBnbHlwaCBpbiBbICfkuK0nLCAn5ZyLJywgJ+eahycsICfluJ0nLCBdXG4gICAgLnBpcGUgJCAoIGtleSwgc2VuZCApID0+XG4gICAgICBbIGdseXBoLCBwcmQsIG9iaiwgaWR4LCBdID0ga2V5XG4gICAgICBzZW5kIGtleSB1bmxlc3MgcHJkIGlzICdwb2QnXG4gICAgLnBpcGUgRC4kY291bnQgKCBjb3VudCApIC0+IGhlbHAgXCJrZXB0ICN7Y291bnR9IGVudHJpZXNcIlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgLnBpcGUgZG8gPT5cbiAgICAgIGJ1ZmZlciAgICAgID0gbnVsbFxuICAgICAgbWVtbyAgICAgICAgPSBudWxsXG4gICAgICBsYXN0X3NwICAgICA9IG51bGxcbiAgICAgICMgd2l0aGluX2xpc3QgPSBub1xuICAgICAgcmV0dXJuICQgKCBrZXksIHNlbmQgKSA9PlxuICAgICAgICBbIHNiaiwgcHJkLCBvYmosIGlkeCwgXSA9IGtleVxuICAgICAgICBpZiBpZHg/XG4gICAgICAgICAgc3AgPSBcIiN7c2JqfXwje3ByZH1cIlxuICAgICAgICAgIGlmIHNwIGlzIGxhc3Rfc3BcbiAgICAgICAgICAgIGJ1ZmZlclsgaWR4IF0gPSBvYmpcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBzZW5kIFsgbWVtby4uLiwgYnVmZmVyLCBdIGlmIGJ1ZmZlcj9cbiAgICAgICAgICAgIGJ1ZmZlciAgICAgICAgPSBbXVxuICAgICAgICAgICAgYnVmZmVyWyBpZHggXSA9IG9ialxuICAgICAgICAgICAgbWVtbyAgICAgICAgICA9IFsgc2JqLCBwcmQsIF1cbiAgICAgICAgICAgIGxhc3Rfc3AgICAgICAgPSBzcFxuICAgICAgICBlbHNlXG4gICAgICAgICAgc2VuZCBbIHNiaiwgcHJkLCBvYmosIF1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIC5waXBlICQgKCBbIHNiaiwgcHJkLCBvYmosIF0sIHNlbmQgKSA9PlxuICAgICAgIyMjIFR5cGUgQ2FzdGluZyAjIyNcbiAgICAgIHR5cGVfZGVzY3JpcHRpb24gPSBkc19vcHRpb25zWyAnc2NoZW1hJyBdWyBwcmQgXVxuICAgICAgdW5sZXNzIHR5cGVfZGVzY3JpcHRpb24/XG4gICAgICAgIHdhcm4gXCJubyB0eXBlIGRlc2NyaXB0aW9uIGZvciBwcmVkaWNhdGUgI3tycHIgcHJkfVwiXG4gICAgICBlbHNlXG4gICAgICAgIHN3aXRjaCB0eXBlID0gdHlwZV9kZXNjcmlwdGlvblsgJ3R5cGUnIF1cbiAgICAgICAgICB3aGVuICdpbnQnXG4gICAgICAgICAgICBvYmogPSBwYXJzZUludCBvYmosIDEwXG4gICAgICAgICAgd2hlbiAndGV4dCdcbiAgICAgICAgICAgICMjIyBUQUlOVCB3ZSBoYXZlIG5vIGJvb2xlYW5zIGNvbmZpZ3VyZWQgIyMjXG4gICAgICAgICAgICBpZiAgICAgIG9iaiBpcyAndHJ1ZScgICB0aGVuIG9iaiA9IHRydWVcbiAgICAgICAgICAgIGVsc2UgaWYgb2JqIGlzICdmYWxzZScgIHRoZW4gb2JqID0gZmFsc2VcbiAgICAgIHNlbmQgWyBzYmosIHByZCwgb2JqLCBdXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAucGlwZSBkbyA9PlxuICAgICAgY291bnQgPSAwXG4gICAgICByZXR1cm4gJCAoIHBocmFzZSwgc2VuZCApID0+XG4gICAgICAgIGNvdW50ICs9IDFcbiAgICAgICAgaWYgY291bnQgJSAxMDAwIGlzIDBcbiAgICAgICAgICBlY2hvIGNvdW50LCBwaHJhc2VcbiAgICAgICAgc2VuZCBwaHJhc2VcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIC5waXBlIG91dHB1dFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBkdW1wX2ppenVyYV9kYiA9IC0+XG4gIHNvdXJjZV9kYiAgID0gSE9MTEVSSVRILm5ld19kYiAnL1ZvbHVtZXMvU3RvcmFnZS90ZW1wL2ppenVyYS1ob2xsZXJpdGgyJ1xuICBwcmVmaXggICAgICA9IFsgJ3NwbycsICfwoY+gJywgXVxuICBwcmVmaXggICAgICA9IFsgJ3NwbycsICfjlLAnLCBdXG4gIGlucHV0ICAgICAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gc291cmNlX2RiLCBwcmVmaXhcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBpbnB1dFxuICAgIC5waXBlIEQuJGNvdW50ICggY291bnQgKSAtPiBoZWxwIFwicmVhZCAje2NvdW50fSBrZXlzXCJcbiAgICAucGlwZSAkICggZGF0YSwgc2VuZCApID0+IHNlbmQgSlNPTi5zdHJpbmdpZnkgZGF0YVxuICAgIC5waXBlIEQuJHNob3coKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMjIyB2ZXJzaW9uIGZvciBIb2xsZXJpdGgxIERCcyAjIyNcbkBmaW5kX2dvb2Rfa3dpY19zYW1wbGVfZ2x5cGhzXzEgPSAoIGRiICkgLT5cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB1bmxlc3MgZGI/XG4gICAgICB5aWVsZCBAaW5pdGlhbGl6ZSByZXN1bWVcbiAgICAgIGRiID0gb3B0aW9uc1sgJ2RiJyBdXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBDSFIgPSByZXF1aXJlICcvVm9sdW1lcy9TdG9yYWdlL2lvL2NvZmZlZW5vZGUtY2hyJ1xuICAgIGNocnNfZnJvbV90ZXh0ID0gKCB0ZXh0ICkgLT4gQ0hSLmNocnNfZnJvbV90ZXh0IHRleHQsIGlucHV0OiAneG5jcidcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGd0ZSAgICAgPSAnb3N8Z3VpZGUvbGluZXVwL2xlbmd0aDowNSdcbiAgICBsdGUgICAgID0gQF9sdGVfZnJvbV9ndGUgZ3RlXG4gICAgaW5wdXQgICA9IGRiWyAnJXNlbGYnIF0uY3JlYXRlS2V5U3RyZWFtIHsgZ3RlOiBndGUsIGx0ZTogbHRlLCB9XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBkZWNvZGVfcmFuayA9ICggYmtleSApID0+XG4gICAgICBbIC4uLiwgcmFua190eHQsIF0gPSBAX3NwbGl0X2JrZXkgYmtleVxuICAgICAgcmV0dXJuIHBhcnNlSW50IHJhbmtfdHh0LCAxMFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgZGVjb2RlX2xpbmV1cCA9ICggYmtleSApID0+XG4gICAgICBbIC4uLiwgbGluZXVwLCBdID0gQF9zcGxpdF9ia2V5IGJrZXlcbiAgICAgIGxpbmV1cCA9IGxpbmV1cC5yZXBsYWNlIC9cXHUzMDAwL2csICcnXG4gICAgICByZXR1cm4gY2hyc19mcm9tX3RleHQgbGluZXVwXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICB4bmNyX2Zyb21fdWNociA9ICggdWNociApID0+XG4gICAgICByZXR1cm4gaWYgKCBDSFIuYXNfcnNnIHVjaHIgKSBpcyAndS1wdWEnIHRoZW4gKCBDSFIuYXNfeG5jciB1Y2hyLCBjc2c6ICdqenInICkgZWxzZSB1Y2hyXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpbnB1dFxuICAgICAgLnBpcGUgQF8kc3BsaXRfYmtleSgpXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIC5waXBlIEhPTExFUklUSC5yZWFkX3N1YiBkYiwgbWFuZ2xlOiBkZWNvZGVfcmFuaywgKCBwaHJhc2UgKSA9PlxuICAgICAgICBbIC4uLiwgZ2x5cGgsIF0gICAgICAgICAgID0gcGhyYXNlXG4gICAgICAgIHN1Yl9ndGUgICAgID0gXCJzb3xnbHlwaDoje2dseXBofXxyYW5rL2NqdDpcIlxuICAgICAgICBzdWJfbHRlICAgICA9IEBfbHRlX2Zyb21fZ3RlIHN1Yl9ndGVcbiAgICAgICAgc3ViX2lucHV0ICAgPSBkYlsgJyVzZWxmJyBdLmNyZWF0ZUtleVN0cmVhbSB7IGd0ZTogc3ViX2d0ZSwgbHRlOiBzdWJfbHRlLCB9XG4gICAgICAgIHJldHVybiBbIGdseXBoLCBzdWJfaW5wdXQsIF1cbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgLnBpcGUgRC4kZmlsdGVyICggWyBnbHlwaCwgcmFuaywgXSApIC0+IHJhbmsgPCAxNTAwXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIC5waXBlIEhPTExFUklUSC5yZWFkX3N1YiBkYiwgbWFuZ2xlOiBkZWNvZGVfbGluZXVwLCAoIHJlY29yZCApID0+XG4gICAgICAgIFsgZ2x5cGgsIHJhbmssIF0gID0gcmVjb3JkXG4gICAgICAgIHN1Yl9ndGUgICAgICAgICAgID0gXCJzb3xnbHlwaDoje2dseXBofXxndWlkZS9saW5ldXAvdWNocjpcIlxuICAgICAgICBzdWJfbHRlICAgICAgICAgICA9IEBfbHRlX2Zyb21fZ3RlIHN1Yl9ndGVcbiAgICAgICAgc3ViX2lucHV0ICAgICAgICAgPSBkYlsgJyVzZWxmJyBdLmNyZWF0ZUtleVN0cmVhbSB7IGd0ZTogc3ViX2d0ZSwgbHRlOiBzdWJfbHRlLCB9XG4gICAgICAgIHJldHVybiBbIFsgZ2x5cGgsIHJhbmssIF0sIHN1Yl9pbnB1dCwgXVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAucGlwZSBIT0xMRVJJVEgucmVhZF9zdWIgZGIsICggcmVjb3JkICkgPT5cbiAgICAgICAgWyBbIGdseXBoLCByYW5rLCBdLCBndWlkZXMsIF0gPSByZWNvcmRcbiAgICAgICAgY29uZmx1ZW5jZSAgICAgICAgICAgICAgICAgICAgPSBELmNyZWF0ZV90aHJvdWdoc3RyZWFtKClcbiAgICAgICAgc3RyZWFtX2NvdW50ICAgICAgICAgICAgICAgICAgPSAwXG4gICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgICAgZm9yIGd1aWRlIGluIGd1aWRlc1xuICAgICAgICAgIGRvICggZ3VpZGUgKSA9PlxuICAgICAgICAgICAgZ3VpZGVfeG5jciAgICAgICAgPSB4bmNyX2Zyb21fdWNociBndWlkZVxuICAgICAgICAgICAgc3RyZWFtX2NvdW50ICAgICArPSArMVxuICAgICAgICAgICAgc3ViX2d0ZSAgICAgICAgICAgPSBcInNvfGdseXBoOiN7Z3VpZGVfeG5jcn18ZmFjdG9yL3NoYXBlY2xhc3Mvd2JmOlwiXG4gICAgICAgICAgICBzdWJfbHRlICAgICAgICAgICA9IEBfbHRlX2Zyb21fZ3RlIHN1Yl9ndGVcbiAgICAgICAgICAgIHN1Yl9pbnB1dCAgICAgICAgID0gZGJbICclc2VsZicgXS5jcmVhdGVLZXlTdHJlYW0geyBndGU6IHN1Yl9ndGUsIGx0ZTogc3ViX2x0ZSwgfVxuICAgICAgICAgICAgc3ViX2lucHV0Lm9uICdlbmQnLCAtPlxuICAgICAgICAgICAgICBzdHJlYW1fY291bnQgKz0gLTFcbiAgICAgICAgICAgICAgaWYgc3RyZWFtX2NvdW50IDwgMVxuICAgICAgICAgICAgICAgIGNvbmZsdWVuY2UuZW5kKClcbiAgICAgICAgICAgIHN1Yl9pbnB1dFxuICAgICAgICAgICAgICAucGlwZSBAXyRzcGxpdF9ia2V5KClcbiAgICAgICAgICAgICAgLnBpcGUgJCAoIGRhdGEsIHNlbmQgKSA9PlxuICAgICAgICAgICAgICAgIFsgLi4uLCBzaGFwZWNsYXNzX3diZiwgXSA9IGRhdGFcbiAgICAgICAgICAgICAgICBjb25mbHVlbmNlLndyaXRlIFsgZ3VpZGUsIHNoYXBlY2xhc3Nfd2JmLCBdXG4gICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgICAgcmV0dXJuIFsgWyBnbHlwaCwgcmFuaywgZ3VpZGVzLCBdLCBjb25mbHVlbmNlLCBdXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIC5waXBlICQgKCBkYXRhLCBzZW5kICkgLT4gc2VuZCBKU09OLnN0cmluZ2lmeSBkYXRhXG4gICAgICAucGlwZSBELiRzaG93KClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIyMgdmVyc2lvbiBmb3IgSG9sbGVyaXRoMiBEQnMgIyMjXG5AZmluZF9nb29kX2t3aWNfc2FtcGxlX2dseXBoc18yID0gKCBkYiApIC0+XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgZGIgPz0gSE9MTEVSSVRILm5ld19kYiAnL1ZvbHVtZXMvU3RvcmFnZS90ZW1wL2ppenVyYS1ob2xsZXJpdGgyJ1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgQ0hSID0gcmVxdWlyZSAnL1ZvbHVtZXMvU3RvcmFnZS9pby9jb2ZmZWVub2RlLWNocidcbiAgICBjaHJzX2Zyb21fdGV4dCA9ICggdGV4dCApIC0+IENIUi5jaHJzX2Zyb21fdGV4dCB0ZXh0LCBpbnB1dDogJ3huY3InXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwcmVmaXggID0gWyAncG9zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCA1LCBdXG4gICAgaW5wdXQgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBwcmVmaXhcbiAgICAjICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyBkZWNvZGVfcmFuayA9ICggYmtleSApID0+XG4gICAgIyAgIFsgLi4uLCByYW5rX3R4dCwgXSA9IEBfc3BsaXRfYmtleSBia2V5XG4gICAgIyAgIHJldHVybiBwYXJzZUludCByYW5rX3R4dCwgMTBcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGRlY29kZV9saW5ldXAgPSAoIGRhdGEgKSA9PlxuICAgICAgWyAuLi4sIGxpbmV1cCwgXSA9IGRhdGFcbiAgICAgIHJldHVybiBjaHJzX2Zyb21fdGV4dCBsaW5ldXAucmVwbGFjZSAvXFx1MzAwMC9nLCAnJ1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgeG5jcl9mcm9tX3VjaHIgPSAoIHVjaHIgKSA9PlxuICAgICAgcmV0dXJuIGlmICggQ0hSLmFzX3JzZyB1Y2hyICkgaXMgJ3UtcHVhJyB0aGVuICggQ0hSLmFzX3huY3IgdWNociwgY3NnOiAnanpyJyApIGVsc2UgdWNoclxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaW5wdXRcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgLnBpcGUgSE9MTEVSSVRILnJlYWRfc3ViIGRiLCAoIHBocmFzZSApID0+XG4gICAgICAgIFsgZ2x5cGgsIF8sIGxpbmV1cF9sZW5ndGgsIF0gICAgPSBwaHJhc2VcbiAgICAgICAgc3ViX3ByZWZpeCAgICAgICAgICAgICAgICAgICAgICA9IFsgJ3NwbycsIGdseXBoLCAncmFuay9janQnLCBdXG4gICAgICAgIHN1Yl9pbnB1dCAgICAgICAgICAgICAgICAgICAgICAgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgc3ViX3ByZWZpeFxuICAgICAgICByZXR1cm4gWyBbIGdseXBoLCBsaW5ldXBfbGVuZ3RoLCBdLCBzdWJfaW5wdXQsIF1cbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgLnBpcGUgJCAoIGRhdGEsIHNlbmQgKSA9PlxuICAgICAgICBbIFsgZ2x5cGgsIGxpbmV1cF9sZW5ndGgsIF0sIFsgXywgXywgcmFuaywgXSwgXSA9IGRhdGFcbiAgICAgICAgc2VuZCBbIGdseXBoLCBsaW5ldXBfbGVuZ3RoLCByYW5rLCBdXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIC5waXBlIEQuJGZpbHRlciAoIFsgZ2x5cGgsIGxpbmV1cF9sZW5ndGgsIHJhbmssIF0gKSAtPiByYW5rIDwgMTUwMDBcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgLnBpcGUgSE9MTEVSSVRILnJlYWRfc3ViIGRiLCBtYW5nbGU6IGRlY29kZV9saW5ldXAsICggZGF0YSApID0+XG4gICAgICAgIFsgZ2x5cGgsIGxpbmV1cF9sZW5ndGgsIHJhbmssIF0gPSBkYXRhXG4gICAgICAgIHN1Yl9wcmVmaXggICAgICAgICAgICAgICAgICAgICAgPSBbICdzcG8nLCBnbHlwaCwgJ2d1aWRlL2xpbmV1cC91Y2hyJywgXVxuICAgICAgICBzdWJfaW5wdXQgICAgICAgICAgICAgICAgICAgICAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIHN1Yl9wcmVmaXhcbiAgICAgICAgcmV0dXJuIFsgWyBnbHlwaCwgbGluZXVwX2xlbmd0aCwgcmFuaywgXSwgc3ViX2lucHV0LCBdXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIC5waXBlIEhPTExFUklUSC5yZWFkX3N1YiBkYiwgKCBkYXRhICkgPT5cbiAgICAgICAgWyBbIGdseXBoLCBsaW5ldXBfbGVuZ3RoLCByYW5rLCBdLCBndWlkZXMsIF0gID0gZGF0YVxuICAgICAgICBjb25mbHVlbmNlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBELmNyZWF0ZV90aHJvdWdoc3RyZWFtKClcbiAgICAgICAgc3RyZWFtX2NvdW50ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gMFxuICAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAgIGZvciBndWlkZSBpbiBndWlkZXNcbiAgICAgICAgICBkbyAoIGd1aWRlICkgPT5cbiAgICAgICAgICAgIGd1aWRlX3huY3IgICAgICAgID0geG5jcl9mcm9tX3VjaHIgZ3VpZGVcbiAgICAgICAgICAgIHN0cmVhbV9jb3VudCAgICAgKz0gKzFcbiAgICAgICAgICAgIHN1Yl9wcmVmaXggICAgICAgID0gWyAnc3BvJywgZ3VpZGVfeG5jciwgJ2ZhY3Rvci9zaGFwZWNsYXNzL3diZicsIF1cbiAgICAgICAgICAgIHN1Yl9pbnB1dCAgICAgICAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIHN1Yl9wcmVmaXhcbiAgICAgICAgICAgIHN1Yl9pbnB1dC5vbiAnZW5kJywgLT5cbiAgICAgICAgICAgICAgc3RyZWFtX2NvdW50ICs9IC0xXG4gICAgICAgICAgICAgIGlmIHN0cmVhbV9jb3VudCA8IDFcbiAgICAgICAgICAgICAgICBjb25mbHVlbmNlLmVuZCgpXG4gICAgICAgICAgICBzdWJfaW5wdXRcbiAgICAgICAgICAgICAgLnBpcGUgJCAoIGRhdGEsIHNlbmQgKSA9PlxuICAgICAgICAgICAgICAgIFsgLi4uLCBzaGFwZWNsYXNzX3diZiwgXSA9IGRhdGFcbiAgICAgICAgICAgICAgICBjb25mbHVlbmNlLndyaXRlIHNoYXBlY2xhc3Nfd2JmXG4gICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgICAgcmV0dXJuIFsgWyBnbHlwaCwgbGluZXVwX2xlbmd0aCwgcmFuaywgZ3VpZGVzLCBdLCBjb25mbHVlbmNlLCBdXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIC5waXBlIEQuJGZpbHRlciAoIGRhdGEgKSA9PlxuICAgICAgICBbIFsgZ2x5cGgsIGxpbmV1cF9sZW5ndGgsIHJhbmssIGd1aWRlcywgXSwgc2hhcGVjbGFzc2VzX3diZi4uLiwgXSA9IGRhdGFcbiAgICAgICAgY291bnRzID0gWyAwLCAwLCAwLCAwLCAwLCBdXG4gICAgICAgIGZvciBzaGFwZWNsYXNzX3diZiBpbiBzaGFwZWNsYXNzZXNfd2JmXG4gICAgICAgICAgc2hhcGVjbGFzc19pZHggICAgICAgICAgICA9ICggcGFyc2VJbnQgc2hhcGVjbGFzc193YmZbIDAgXSwgMTAgKSAtIDFcbiAgICAgICAgICBjb3VudHNbIHNoYXBlY2xhc3NfaWR4IF0gKz0gKzFcbiAgICAgICAgcmV0dXJuICggY291bnRzLmpvaW4gJywnICkgaXMgJzEsMSwxLDEsMSdcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgLnBpcGUgJCAoIGRhdGEsIHNlbmQgKSAtPiBzZW5kIEpTT04uc3RyaW5naWZ5IGRhdGFcbiAgICAgIC5waXBlIEQuJHNob3coKVxuXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xudW5sZXNzIG1vZHVsZS5wYXJlbnQ/XG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBvcHRpb25zID1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICMgJ3JvdXRlJzogICAgICAgICAgICAgICAgbmpzX3BhdGguam9pbiBfX2Rpcm5hbWUsICcuLi9kYnMvZGVtbydcbiAgICAncm91dGUnOiAgICAgICAgICAgICAgICAnL1ZvbHVtZXMvU3RvcmFnZS9pby9qaXp1cmEtZGF0YXNvdXJjZXMvZGF0YS9sZXZlbGRiJ1xuICAgICMgJ3JvdXRlJzogICAgICAgICAgICAnL3RtcC9sZXZlbGRiJ1xuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGRlYnVnICfCqUFvT0FTJywgb3B0aW9uc1xuICAjIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAjICAgeWllbGQgQGluaXRpYWxpemUgcmVzdW1lXG4gICMgICBkYiA9IG9wdGlvbnNbICdkYicgXVxuICAjICAgQGZpbmRfZ29vZF9rd2ljX3NhbXBsZV9nbHlwaHNfMiBkYlxuICAjIEBjb3B5X2ppenVyYV9kYigpXG4gICMgQGR1bXBfaml6dXJhX2RiKClcbiAgQGZpbmRfZ29vZF9rd2ljX3NhbXBsZV9nbHlwaHNfMigpXG5cblxuIl19