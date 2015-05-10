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
    this.copy_jizura_db();
  }

}).call(this);

//# sourceMappingURL=data:application/json;base64,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QSxDQUFSLElBQTRCLENBQUEsQ0FENUIsQ0FERjtBQUFBLFdBRkE7QUFLQSxpQkFBTyxDQUFFLE1BQU0sQ0FBQyxJQUFQLENBQVksR0FBWixDQUFGLENBQUEsS0FBdUIsV0FBOUIsQ0FOYztRQUFBLENBQVYsQ0ExQ1IsQ0FrREUsQ0FBQyxJQWxESCxDQWtEUSxDQUFBLENBQUUsU0FBRSxJQUFGLEVBQVEsSUFBUixHQUFBO2lCQUFrQixJQUFBLENBQUssSUFBSSxDQUFDLFNBQUwsQ0FBZSxJQUFmLENBQUwsRUFBbEI7UUFBQSxDQUFGLENBbERSLENBbURFLENBQUMsSUFuREgsQ0FtRFEsQ0FBQyxDQUFDLEtBQUYsQ0FBQSxDQW5EUixFQXBCRztNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUwsRUFGZ0M7RUFBQSxDQTlVbEMsQ0FBQTs7QUEyWkEsRUFBQSxJQUFPLHFCQUFQO0FBR0UsSUFBQSxPQUFBLEdBR0U7QUFBQSxNQUFBLE9BQUEsRUFBd0IscURBQXhCO0tBSEYsQ0FBQTtBQUFBLElBTUEsS0FBQSxDQUFNLFFBQU4sRUFBZ0IsT0FBaEIsQ0FOQSxDQUFBO0FBQUEsSUFXQSxJQUFDLENBQUEsY0FBRCxDQUFBLENBWEEsQ0FIRjtHQTNaQTtBQUFBIiwiZmlsZSI6ImRlbW8uanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJcblxuXG4jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbm5qc19wYXRoICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdwYXRoJ1xuIyBuanNfZnMgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnZnMnXG5qb2luICAgICAgICAgICAgICAgICAgICAgID0gbmpzX3BhdGguam9pblxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5DTkQgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnY25kJ1xucnByICAgICAgICAgICAgICAgICAgICAgICA9IENORC5ycHJcbmJhZGdlICAgICAgICAgICAgICAgICAgICAgPSAnSE9MTEVSSVRIL3Rlc3QnXG5sb2cgICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3BsYWluJywgICAgIGJhZGdlXG5pbmZvICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ2luZm8nLCAgICAgIGJhZGdlXG53aGlzcGVyICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3doaXNwZXInLCAgIGJhZGdlXG5hbGVydCAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ2FsZXJ0JywgICAgIGJhZGdlXG5kZWJ1ZyAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ2RlYnVnJywgICAgIGJhZGdlXG53YXJuICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3dhcm4nLCAgICAgIGJhZGdlXG5oZWxwICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ2hlbHAnLCAgICAgIGJhZGdlXG51cmdlICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3VyZ2UnLCAgICAgIGJhZGdlXG5lY2hvICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmVjaG8uYmluZCBDTkRcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuc3VzcGVuZCAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2NvZmZlZW5vZGUtc3VzcGVuZCdcbnN0ZXAgICAgICAgICAgICAgICAgICAgICAgPSBzdXNwZW5kLnN0ZXBcbmFmdGVyICAgICAgICAgICAgICAgICAgICAgPSBzdXNwZW5kLmFmdGVyXG5ldmVudHVhbGx5ICAgICAgICAgICAgICAgID0gc3VzcGVuZC5ldmVudHVhbGx5XG5pbW1lZGlhdGVseSAgICAgICAgICAgICAgID0gc3VzcGVuZC5pbW1lZGlhdGVseVxucmVwZWF0X2ltbWVkaWF0ZWx5ICAgICAgICA9IHN1c3BlbmQucmVwZWF0X2ltbWVkaWF0ZWx5XG5ldmVyeSAgICAgICAgICAgICAgICAgICAgID0gc3VzcGVuZC5ldmVyeVxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jIEJZVEVXSVNFICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdieXRld2lzZSdcbiMgdGhyb3VnaCAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ3Rocm91Z2gyJ1xuIyBMZXZlbEJhdGNoICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbGV2ZWwtYmF0Y2gtc3RyZWFtJ1xuIyBCYXRjaFN0cmVhbSAgICAgICAgICAgICAgID0gcmVxdWlyZSAnYmF0Y2gtc3RyZWFtJ1xuIyBwYXJhbGxlbCAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnY29uY3VycmVudC13cml0YWJsZSdcbkQgICAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdwaXBlZHJlYW1zMidcbiQgICAgICAgICAgICAgICAgICAgICAgICAgPSBELnJlbWl0LmJpbmQgRFxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5uZXdfZGIgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbGV2ZWwnXG4jIG5ld19sZXZlbGdyYXBoICAgICAgICAgICAgPSByZXF1aXJlICdsZXZlbGdyYXBoJ1xuIyBkYiAgICAgICAgICAgICAgICAgICAgICAgID0gbmV3X2xldmVsZ3JhcGggJy90bXAvbGV2ZWxncmFwaCdcbkhPTExFUklUSCAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL21haW4nXG7GkiAgICAgICAgICAgICAgICAgICAgICAgICA9IENORC5mb3JtYXRfbnVtYmVyLmJpbmQgQ05EXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbm9wdGlvbnMgICAgICAgICAgICAgICAgICAgPSBudWxsXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9taXNmaXQgICAgICAgICAgPSBTeW1ib2wgJ21pc2ZpdCdcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgUElQRURSRUFNU1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5ELm5ld19pbmRleGVyID0gKCBpZHggPSAwICkgLT4gKCBkYXRhICkgPT4gWyBpZHgrKywgZGF0YSwgXVxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuI1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AaW5pdGlhbGl6ZSA9ICggaGFuZGxlciApIC0+XG4gIG9wdGlvbnNbICdkYicgXSA9IEhPTExFUklUSC5uZXdfZGIgb3B0aW9uc1sgJ3JvdXRlJyBdXG4gIGhhbmRsZXIgbnVsbFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBtYWluID0gKCBmaXJzdF9xdWVyeSApIC0+XG4gIGZpcnN0X3F1ZXJ5ID89IHsgZ3RlOiAnb3N8cmFuay9janQ6MCcsIGx0ZTogJ29zfHJhbmsvY2p0OjknLCB9XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEBpbml0aWFsaXplIHJlc3VtZVxuICAgIGRiID0gb3B0aW9uc1sgJ2RiJyBdXG4gICAgQ0hSID0gcmVxdWlyZSAnL1ZvbHVtZXMvU3RvcmFnZS9pby9jb2ZmZWVub2RlLWNocidcbiAgICBjb3VudF9jaHJzID0gKCB0ZXh0ICkgLT4gKCBDSFIuY2hyc19mcm9tX3RleHQgdGV4dCwgaW5wdXQ6ICd4bmNyJyApLmxlbmd0aFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaW5wdXQgPSBkYlsgJyVzZWxmJyBdLmNyZWF0ZUtleVN0cmVhbSBmaXJzdF9xdWVyeVxuICAgICMgayA9IFwic298Z2x5cGg657m8fHBvZDpcIlxuICAgICMgaW5wdXQgPSBkYlsgJyVzZWxmJyBdLmNyZWF0ZUtleVN0cmVhbSBkYiwgeyBndGU6IGssIGx0ZTogayArICdcXHVmZmZmJyB9XG4gICAgIyBkZWJ1ZyAnwqljVzh0SycsIEhPTExFUklUSC5uZXdfa2V5IGRiLCAnb3MnLCAncmFuay9janQnLCAnMDAwMDAnXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAjIyMgVEFJTlQgV2UgY2FuIGN1cnJlbnRseSBub3QgdXNlIGBIT0xMRVJJVEgyLnJlYWRfc3ViYCBiZWNhdXNlIEhPTExFUklUSDIgYXNzdW1lcyBhIGtleS1vbmx5XG4gICAgREIgdGhhdCB1c2VzIGJpbmFyeSBlbmNvZGluZyB3aXRoIGEgY3VzdG9tIGh0dHBzOi8vZ2l0aHViLmNvbS9kZWFubGFuZG9sdC9ieXRld2lzZSBsYXllcjsgdGhlIGN1cnJlbnRcbiAgICBKaXp1cmEgREIgdmVyc2lvbiB1c2VzIFVURi04IHN0cmluZ3MgYW5kIGlzIGEga2V5L3ZhbHVlIERCLiAjIyNcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGlucHV0XG4gICAgICAucGlwZSBAXyRzcGxpdF9ia2V5KClcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgIyAucGlwZSBIT0xMRVJJVEgucmVhZF9zdWIgZGIsIGluZGV4ZWQ6IHllcywgKCBrZXkgKSA9PlxuICAgICAgLnBpcGUgQHJlYWRfc3ViIGRiLCBpbmRleGVkOiB5ZXMsICgga2V5ICkgPT5cbiAgICAgICAgWyBwdCwgb2ssIHJhbmssIHNrLCBnbHlwaCwgXSA9IGtleVxuICAgICAgICBzdWJfa2V5ID0gXCJzb3xnbHlwaDoje2dseXBofXxwb2Q6XCJcbiAgICAgICAgcmV0dXJuIGRiWyAnJXNlbGYnIF0uY3JlYXRlVmFsdWVTdHJlYW0geyBndGU6IHN1Yl9rZXksIGx0ZTogc3ViX2tleSArICdcXHVmZmZmJyB9XG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIC5waXBlIEQuJGRlbnNvcnQgMCwgMCwgdHJ1ZVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAucGlwZSAkICggWyBpZHgsIFsgcG9kLCBdLCBdLCBzZW5kICkgPT5cbiAgICAgICAgZGVidWcgJ8KpamQ1Y0UnLCBwb2RcbiAgICAgICAgdW5sZXNzIHBvZFsgJ3N0cm9rZW9yZGVyL3Nob3J0JyAgXT9cbiAgICAgICAgICB3YXJuICfCqTlZWG9xJywgIHBvZFxuICAgICAgICBlbHNlXG4gICAgICAgICAgZ2x5cGggICAgICAgPSBwb2RbICdnbHlwaC91Y2hyJyAgICAgICAgIF1cbiAgICAgICAgICBzdHJva2VvcmRlciA9IHBvZFsgJ3N0cm9rZW9yZGVyL3Nob3J0JyAgXVsgMCBdLmxlbmd0aFxuICAgICAgICAgIGxpbmV1cCAgICAgID0gcG9kWyAnZ3VpZGUvbGluZXVwL3VjaHInICBdLnJlcGxhY2UgL1xcdTMwMDAvZywgJydcbiAgICAgICAgICBzZW5kIFsgZ2x5cGgsIHN0cm9rZW9yZGVyLCBsaW5ldXAsIF1cbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgLnBpcGUgJCAoIFsgZ2x5cGgsIHN0cm9rZW9yZGVyLCBsaW5ldXAsIF0sIHNlbmQgKSA9PlxuICAgICAgICBzZW5kIFsgZ2x5cGgsIHN0cm9rZW9yZGVyLCBjb3VudF9jaHJzIGxpbmV1cCwgXVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAucGlwZSBELiRzb3J0ICggYSwgYiApIC0+XG4gICAgICAgIGlkeCA9IDFcbiAgICAgICAgcmV0dXJuICsxIGlmIGFbIGlkeCBdID4gYlsgaWR4IF1cbiAgICAgICAgcmV0dXJuIC0xIGlmIGFbIGlkeCBdIDwgYlsgaWR4IF1cbiAgICAgICAgcmV0dXJuICAwXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIC5waXBlIEQuJHNob3coKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfJHNwbGl0X2JrZXkgPSAtPiAkICggYmtleSwgc2VuZCApID0+IHNlbmQgQF9zcGxpdF9ia2V5IGJrZXlcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX3NwbGl0X2JrZXkgPSAoIGJrZXkgKSAtPlxuICBSID0gYmtleS50b1N0cmluZyAndXRmLTgnXG4gIFIgPSAoIFIuc3BsaXQgJ3wnIClbIC4uIDIgXVxuICBSID0gWyBSWyAwIF0sICggUlsgMSBdLnNwbGl0ICc6JyApLi4uLCAoIFJbIDIgXS5zcGxpdCAnOicgKS4uLiwgXVxuICByZXR1cm4gUlxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfJHNwbGl0X3NvX2JrZXkgPSAtPiAkICggYmtleSwgc2VuZCApID0+IHNlbmQgQF9zcGxpdF9zb19ia2V5IGJrZXlcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX3NwbGl0X3NvX2JrZXkgPSAoIGJrZXkgKSAtPlxuICBSICAgICAgID0gYmtleS50b1N0cmluZyAndXRmLTgnXG4gIFIgICAgICAgPSBSLnNwbGl0ICd8J1xuICBpZHhfdHh0ID0gUlsgMyBdXG4gIFIgICAgICAgPSBbICggUlsgMSBdLnNwbGl0ICc6JyApWyAxIF0sICggUlsgMiBdLnNwbGl0ICc6JyApLi4uLCBdXG4gIFIucHVzaCAoIHBhcnNlSW50IGlkeF90eHQsIDEwwqApIGlmIGlkeF90eHQ/IGFuZCBpZHhfdHh0Lmxlbmd0aCA+IDBcbiAgcmV0dXJuIFJcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX2x0ZV9mcm9tX2d0ZSA9ICggZ3RlICkgLT5cbiAgUiA9IG5ldyBCdWZmZXIgKCBsYXN0X2lkeCA9IEJ1ZmZlci5ieXRlTGVuZ3RoIGd0ZSApICsgMVxuICBSLndyaXRlIGd0ZVxuICBSWyBsYXN0X2lkeCBdID0gMHhmZlxuICByZXR1cm4gUlxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkAkbGluZXVwX2Zyb21fZ2x5cGggPSAoIGRiICkgLT5cbiAgc2V0dGluZ3MgPVxuICAgIGluZGV4ZWQ6ICBub1xuICAgIHNpbmdsZTogICB5ZXNcbiAgcmV0dXJuIEByZWFkX3N1YiBkYiwgc2V0dGluZ3MsICggZ2x5cGggKSA9PlxuICAgIGx0ZSA9IFwic298Z2x5cGg6I3tnbHlwaH18Z3VpZGUvbGluZXVwL3VjaHI6XCJcbiAgICBzdWJfaW5wdXQgPSBkYlsgJyVzZWxmJyBdLmNyZWF0ZUtleVN0cmVhbSB7IGd0ZTogbHRlLCBsdGU6IEBfbHRlX2Zyb21fZ3RlIGx0ZSwgfVxuICAgIHJldHVybiBzdWJfaW5wdXRcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AJHNoYXBlY2xhc3Nfd2JmX2Zyb21fZ2x5cGhfYW5kX2xpbmV1cCA9ICggZGIgKSAtPlxuICAjIyMgVEFJTlQgd3JvbmcgIyMjXG4gIHNldHRpbmdzID1cbiAgICBpbmRleGVkOiAgbm9cbiAgICBzaW5nbGU6ICAgeWVzXG4gIHJldHVybiBAcmVhZF9zdWIgZGIsIHNldHRpbmdzLCAoIFsgZ2x5cGgsIGxpbmV1cF9nbHlwaHMsIF0gKSA9PlxuICAgIGZvciBsaW5ldXBfZ2x5cGggaW4gbGluZXVwX2dseXBoc1xuICAgICAgZG8gKCBsaW5ldXBfZ2x5cGggKSA9PlxuICAgICAgICBndGUgPSBcInNvfGdseXBoOiN7bGluZXVwX2dseXBofXxmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmOlwiXG4gICAgICAgIHN1Yl9pbnB1dCA9IGRiWyAnJXNlbGYnIF0uY3JlYXRlS2V5U3RyZWFtIHsgZ3RlOiBndGUsIGx0ZTogQF9sdGVfZnJvbV9ndGUgZ3RlLCB9XG4gICAgICAgIHJldHVybiBzdWJfaW5wdXRcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5IT0xMRVJJVEguJHBpY2tfc3ViamVjdCA9IC0+XG4gIHJldHVybiAkICggbGtleSwgc2VuZCApID0+XG4gICAgWyBwdCwgXywgdjAsIF8sIHYxLCBdID0gbGtleVxuICAgIHNlbmQgaWYgcHQgaXMgJ3NvJyB0aGVuIHYwIGVsc2UgdjFcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5IT0xMRVJJVEguJHBpY2tfb2JqZWN0ID0gLT5cbiAgcmV0dXJuICQgKCBsa2V5LCBzZW5kICkgPT5cbiAgICBbIHB0LCBfLCB2MCwgXywgdjEsIF0gPSBsa2V5XG4gICAgc2VuZCBpZiBwdCBpcyAnc28nIHRoZW4gdjEgZWxzZSB2MFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkhPTExFUklUSC4kcGlja192YWx1ZXMgPSAtPlxuICByZXR1cm4gJCAoIGxrZXksIHNlbmQgKSA9PlxuICAgIFsgcHQsIF8sIHYwLCBfLCB2MSwgXSA9IGxrZXlcbiAgICBzZW5kIGlmIHB0IGlzICdzbycgdGhlbiBbIHYwLCB2MSwgXSBlbHNlIFsgdjEsIHYwLCBdXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQGNvcHlfaml6dXJhX2RiID0gLT5cbiAgZHNfb3B0aW9ucyAgPSByZXF1aXJlICcvVm9sdW1lcy9TdG9yYWdlL2lvL2ppenVyYS1kYXRhc291cmNlcy9vcHRpb25zJ1xuICBzb3VyY2VfZGIgICA9IEhPTExFUklUSC5uZXdfZGIgb3B0aW9uc1sgJ3JvdXRlJyBdXG4gIHRhcmdldF9kYiAgID0gSE9MTEVSSVRILm5ld19kYiAnL1ZvbHVtZXMvU3RvcmFnZS90ZW1wL2ppenVyYS1ob2xsZXJpdGgyJ1xuICBndGUgICAgICAgICA9ICdzb3wnXG4gIGx0ZSAgICAgICAgID0gQF9sdGVfZnJvbV9ndGUgZ3RlXG4gIGlucHV0ICAgICAgID0gc291cmNlX2RiWyAnJXNlbGYnIF0uY3JlYXRlS2V5U3RyZWFtIHsgZ3RlLCBsdGUsIH1cbiAgYmF0Y2hfc2l6ZSAgPSAxMDAwMFxuICBvdXRwdXQgICAgICA9IEhPTExFUklUSC4kd3JpdGUgdGFyZ2V0X2RiLCBiYXRjaF9zaXplXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgaW5wdXRcbiAgICAucGlwZSBELiRjb3VudCAoIGNvdW50ICkgLT4gaGVscCBcInJlYWQgI3tjb3VudH0ga2V5c1wiXG4gICAgLnBpcGUgQF8kc3BsaXRfc29fYmtleSgpXG4gICAgIyAucGlwZSAkICgga2V5LCBzZW5kICkgPT5cbiAgICAjICAgIyMjICEhISEhICMjI1xuICAgICMgICBbIGdseXBoLCBwcmQsIG9iaiwgaWR4LCBdID0ga2V5XG4gICAgIyAgIHNlbmQga2V5IGlmIGdseXBoIGluIFsgJ+S4rScsICflnIsnLCAn55qHJywgJ+W4nScsIF1cbiAgICAucGlwZSAkICgga2V5LCBzZW5kICkgPT5cbiAgICAgIFsgZ2x5cGgsIHByZCwgb2JqLCBpZHgsIF0gPSBrZXlcbiAgICAgIHNlbmQga2V5IHVubGVzcyBwcmQgaXMgJ3BvZCdcbiAgICAucGlwZSBELiRjb3VudCAoIGNvdW50ICkgLT4gaGVscCBcImtlcHQgI3tjb3VudH0gZW50cmllc1wiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAucGlwZSBkbyA9PlxuICAgICAgYnVmZmVyICAgICAgPSBudWxsXG4gICAgICBtZW1vICAgICAgICA9IG51bGxcbiAgICAgIGxhc3Rfc3AgICAgID0gbnVsbFxuICAgICAgIyB3aXRoaW5fbGlzdCA9IG5vXG4gICAgICByZXR1cm4gJCAoIGtleSwgc2VuZCApID0+XG4gICAgICAgIFsgc2JqLCBwcmQsIG9iaiwgaWR4LCBdID0ga2V5XG4gICAgICAgIGlmIGlkeD9cbiAgICAgICAgICBzcCA9IFwiI3tzYmp9fCN7cHJkfVwiXG4gICAgICAgICAgaWYgc3AgaXMgbGFzdF9zcFxuICAgICAgICAgICAgYnVmZmVyWyBpZHggXSA9IG9ialxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHNlbmQgWyBtZW1vLi4uLCBidWZmZXIsIF0gaWYgYnVmZmVyP1xuICAgICAgICAgICAgYnVmZmVyICAgICAgICA9IFtdXG4gICAgICAgICAgICBidWZmZXJbIGlkeCBdID0gb2JqXG4gICAgICAgICAgICBtZW1vICAgICAgICAgID0gWyBzYmosIHByZCwgXVxuICAgICAgICAgICAgbGFzdF9zcCAgICAgICA9IHNwXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBzZW5kIFsgc2JqLCBwcmQsIG9iaiwgXVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgLnBpcGUgJCAoIFsgc2JqLCBwcmQsIG9iaiwgXSwgc2VuZCApID0+XG4gICAgICAjIyMgVHlwZSBDYXN0aW5nICMjI1xuICAgICAgdHlwZV9kZXNjcmlwdGlvbiA9IGRzX29wdGlvbnNbICdzY2hlbWEnIF1bIHByZCBdXG4gICAgICB1bmxlc3MgdHlwZV9kZXNjcmlwdGlvbj9cbiAgICAgICAgd2FybiBcIm5vIHR5cGUgZGVzY3JpcHRpb24gZm9yIHByZWRpY2F0ZSAje3JwciBwcmR9XCJcbiAgICAgIGVsc2VcbiAgICAgICAgc3dpdGNoIHR5cGUgPSB0eXBlX2Rlc2NyaXB0aW9uWyAndHlwZScgXVxuICAgICAgICAgIHdoZW4gJ2ludCdcbiAgICAgICAgICAgIG9iaiA9IHBhcnNlSW50IG9iaiwgMTBcbiAgICAgICAgICB3aGVuICd0ZXh0J1xuICAgICAgICAgICAgIyMjIFRBSU5UIHdlIGhhdmUgbm8gYm9vbGVhbnMgY29uZmlndXJlZCAjIyNcbiAgICAgICAgICAgIGlmICAgICAgb2JqIGlzICd0cnVlJyAgIHRoZW4gb2JqID0gdHJ1ZVxuICAgICAgICAgICAgZWxzZSBpZiBvYmogaXMgJ2ZhbHNlJyAgdGhlbiBvYmogPSBmYWxzZVxuICAgICAgc2VuZCBbIHNiaiwgcHJkLCBvYmosIF1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIC5waXBlIGRvID0+XG4gICAgICBjb3VudCA9IDBcbiAgICAgIHJldHVybiAkICggcGhyYXNlLCBzZW5kICkgPT5cbiAgICAgICAgY291bnQgKz0gMVxuICAgICAgICBpZiBjb3VudCAlIDEwMDAgaXMgMFxuICAgICAgICAgIGVjaG8gY291bnQsIHBocmFzZVxuICAgICAgICBzZW5kIHBocmFzZVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgLnBpcGUgb3V0cHV0XG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQGR1bXBfaml6dXJhX2RiID0gLT5cbiAgc291cmNlX2RiICAgPSBIT0xMRVJJVEgubmV3X2RiICcvVm9sdW1lcy9TdG9yYWdlL3RlbXAvaml6dXJhLWhvbGxlcml0aDInXG4gIHByZWZpeCAgICAgID0gWyAnc3BvJywgJ/Chj6AnLCBdXG4gIHByZWZpeCAgICAgID0gWyAnc3BvJywgJ+OUsCcsIF1cbiAgaW5wdXQgICAgICAgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBzb3VyY2VfZGIsIHByZWZpeFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGlucHV0XG4gICAgLnBpcGUgRC4kY291bnQgKCBjb3VudCApIC0+IGhlbHAgXCJyZWFkICN7Y291bnR9IGtleXNcIlxuICAgIC5waXBlICQgKCBkYXRhLCBzZW5kICkgPT4gc2VuZCBKU09OLnN0cmluZ2lmeSBkYXRhXG4gICAgLnBpcGUgRC4kc2hvdygpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyMjIHZlcnNpb24gZm9yIEhvbGxlcml0aDEgREJzICMjI1xuQGZpbmRfZ29vZF9rd2ljX3NhbXBsZV9nbHlwaHNfMSA9ICggZGIgKSAtPlxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHVubGVzcyBkYj9cbiAgICAgIHlpZWxkIEBpbml0aWFsaXplIHJlc3VtZVxuICAgICAgZGIgPSBvcHRpb25zWyAnZGInIF1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIENIUiA9IHJlcXVpcmUgJy9Wb2x1bWVzL1N0b3JhZ2UvaW8vY29mZmVlbm9kZS1jaHInXG4gICAgY2hyc19mcm9tX3RleHQgPSAoIHRleHQgKSAtPiBDSFIuY2hyc19mcm9tX3RleHQgdGV4dCwgaW5wdXQ6ICd4bmNyJ1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgZ3RlICAgICA9ICdvc3xndWlkZS9saW5ldXAvbGVuZ3RoOjA1J1xuICAgIGx0ZSAgICAgPSBAX2x0ZV9mcm9tX2d0ZSBndGVcbiAgICBpbnB1dCAgID0gZGJbICclc2VsZicgXS5jcmVhdGVLZXlTdHJlYW0geyBndGU6IGd0ZSwgbHRlOiBsdGUsIH1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGRlY29kZV9yYW5rID0gKCBia2V5ICkgPT5cbiAgICAgIFsgLi4uLCByYW5rX3R4dCwgXSA9IEBfc3BsaXRfYmtleSBia2V5XG4gICAgICByZXR1cm4gcGFyc2VJbnQgcmFua190eHQsIDEwXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBkZWNvZGVfbGluZXVwID0gKCBia2V5ICkgPT5cbiAgICAgIFsgLi4uLCBsaW5ldXAsIF0gPSBAX3NwbGl0X2JrZXkgYmtleVxuICAgICAgbGluZXVwID0gbGluZXVwLnJlcGxhY2UgL1xcdTMwMDAvZywgJydcbiAgICAgIHJldHVybiBjaHJzX2Zyb21fdGV4dCBsaW5ldXBcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHhuY3JfZnJvbV91Y2hyID0gKCB1Y2hyICkgPT5cbiAgICAgIHJldHVybiBpZiAoIENIUi5hc19yc2cgdWNociApIGlzICd1LXB1YScgdGhlbiAoIENIUi5hc194bmNyIHVjaHIsIGNzZzogJ2p6cicgKSBlbHNlIHVjaHJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGlucHV0XG4gICAgICAucGlwZSBAXyRzcGxpdF9ia2V5KClcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgLnBpcGUgSE9MTEVSSVRILnJlYWRfc3ViIGRiLCBtYW5nbGU6IGRlY29kZV9yYW5rLCAoIHBocmFzZSApID0+XG4gICAgICAgIFsgLi4uLCBnbHlwaCwgXSAgICAgICAgICAgPSBwaHJhc2VcbiAgICAgICAgc3ViX2d0ZSAgICAgPSBcInNvfGdseXBoOiN7Z2x5cGh9fHJhbmsvY2p0OlwiXG4gICAgICAgIHN1Yl9sdGUgICAgID0gQF9sdGVfZnJvbV9ndGUgc3ViX2d0ZVxuICAgICAgICBzdWJfaW5wdXQgICA9IGRiWyAnJXNlbGYnIF0uY3JlYXRlS2V5U3RyZWFtIHsgZ3RlOiBzdWJfZ3RlLCBsdGU6IHN1Yl9sdGUsIH1cbiAgICAgICAgcmV0dXJuIFsgZ2x5cGgsIHN1Yl9pbnB1dCwgXVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAucGlwZSBELiRmaWx0ZXIgKCBbIGdseXBoLCByYW5rLCBdICkgLT4gcmFuayA8IDE1MDBcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgLnBpcGUgSE9MTEVSSVRILnJlYWRfc3ViIGRiLCBtYW5nbGU6IGRlY29kZV9saW5ldXAsICggcmVjb3JkICkgPT5cbiAgICAgICAgWyBnbHlwaCwgcmFuaywgXSAgPSByZWNvcmRcbiAgICAgICAgc3ViX2d0ZSAgICAgICAgICAgPSBcInNvfGdseXBoOiN7Z2x5cGh9fGd1aWRlL2xpbmV1cC91Y2hyOlwiXG4gICAgICAgIHN1Yl9sdGUgICAgICAgICAgID0gQF9sdGVfZnJvbV9ndGUgc3ViX2d0ZVxuICAgICAgICBzdWJfaW5wdXQgICAgICAgICA9IGRiWyAnJXNlbGYnIF0uY3JlYXRlS2V5U3RyZWFtIHsgZ3RlOiBzdWJfZ3RlLCBsdGU6IHN1Yl9sdGUsIH1cbiAgICAgICAgcmV0dXJuIFsgWyBnbHlwaCwgcmFuaywgXSwgc3ViX2lucHV0LCBdXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIC5waXBlIEhPTExFUklUSC5yZWFkX3N1YiBkYiwgKCByZWNvcmQgKSA9PlxuICAgICAgICBbIFsgZ2x5cGgsIHJhbmssIF0sIGd1aWRlcywgXSA9IHJlY29yZFxuICAgICAgICBjb25mbHVlbmNlICAgICAgICAgICAgICAgICAgICA9IEQuY3JlYXRlX3Rocm91Z2hzdHJlYW0oKVxuICAgICAgICBzdHJlYW1fY291bnQgICAgICAgICAgICAgICAgICA9IDBcbiAgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgICBmb3IgZ3VpZGUgaW4gZ3VpZGVzXG4gICAgICAgICAgZG8gKCBndWlkZSApID0+XG4gICAgICAgICAgICBndWlkZV94bmNyICAgICAgICA9IHhuY3JfZnJvbV91Y2hyIGd1aWRlXG4gICAgICAgICAgICBzdHJlYW1fY291bnQgICAgICs9ICsxXG4gICAgICAgICAgICBzdWJfZ3RlICAgICAgICAgICA9IFwic298Z2x5cGg6I3tndWlkZV94bmNyfXxmYWN0b3Ivc2hhcGVjbGFzcy93YmY6XCJcbiAgICAgICAgICAgIHN1Yl9sdGUgICAgICAgICAgID0gQF9sdGVfZnJvbV9ndGUgc3ViX2d0ZVxuICAgICAgICAgICAgc3ViX2lucHV0ICAgICAgICAgPSBkYlsgJyVzZWxmJyBdLmNyZWF0ZUtleVN0cmVhbSB7IGd0ZTogc3ViX2d0ZSwgbHRlOiBzdWJfbHRlLCB9XG4gICAgICAgICAgICBzdWJfaW5wdXQub24gJ2VuZCcsIC0+XG4gICAgICAgICAgICAgIHN0cmVhbV9jb3VudCArPSAtMVxuICAgICAgICAgICAgICBpZiBzdHJlYW1fY291bnQgPCAxXG4gICAgICAgICAgICAgICAgY29uZmx1ZW5jZS5lbmQoKVxuICAgICAgICAgICAgc3ViX2lucHV0XG4gICAgICAgICAgICAgIC5waXBlIEBfJHNwbGl0X2JrZXkoKVxuICAgICAgICAgICAgICAucGlwZSAkICggZGF0YSwgc2VuZCApID0+XG4gICAgICAgICAgICAgICAgWyAuLi4sIHNoYXBlY2xhc3Nfd2JmLCBdID0gZGF0YVxuICAgICAgICAgICAgICAgIGNvbmZsdWVuY2Uud3JpdGUgWyBndWlkZSwgc2hhcGVjbGFzc193YmYsIF1cbiAgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgICByZXR1cm4gWyBbIGdseXBoLCByYW5rLCBndWlkZXMsIF0sIGNvbmZsdWVuY2UsIF1cbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgLnBpcGUgJCAoIGRhdGEsIHNlbmQgKSAtPiBzZW5kIEpTT04uc3RyaW5naWZ5IGRhdGFcbiAgICAgIC5waXBlIEQuJHNob3coKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMjIyB2ZXJzaW9uIGZvciBIb2xsZXJpdGgyIERCcyAjIyNcbkBmaW5kX2dvb2Rfa3dpY19zYW1wbGVfZ2x5cGhzXzIgPSAoIGRiICkgLT5cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICBkYiA/PSBIT0xMRVJJVEgubmV3X2RiICcvVm9sdW1lcy9TdG9yYWdlL3RlbXAvaml6dXJhLWhvbGxlcml0aDInXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBDSFIgPSByZXF1aXJlICcvVm9sdW1lcy9TdG9yYWdlL2lvL2NvZmZlZW5vZGUtY2hyJ1xuICAgIGNocnNfZnJvbV90ZXh0ID0gKCB0ZXh0ICkgLT4gQ0hSLmNocnNfZnJvbV90ZXh0IHRleHQsIGlucHV0OiAneG5jcidcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHByZWZpeCAgPSBbICdwb3MnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDUsIF1cbiAgICBpbnB1dCAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIHByZWZpeFxuICAgICMgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAjIGRlY29kZV9yYW5rID0gKCBia2V5ICkgPT5cbiAgICAjICAgWyAuLi4sIHJhbmtfdHh0LCBdID0gQF9zcGxpdF9ia2V5IGJrZXlcbiAgICAjICAgcmV0dXJuIHBhcnNlSW50IHJhbmtfdHh0LCAxMFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgZGVjb2RlX2xpbmV1cCA9ICggZGF0YSApID0+XG4gICAgICBbIC4uLiwgbGluZXVwLCBdID0gZGF0YVxuICAgICAgcmV0dXJuIGNocnNfZnJvbV90ZXh0IGxpbmV1cC5yZXBsYWNlIC9cXHUzMDAwL2csICcnXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICB4bmNyX2Zyb21fdWNociA9ICggdWNociApID0+XG4gICAgICByZXR1cm4gaWYgKCBDSFIuYXNfcnNnIHVjaHIgKSBpcyAndS1wdWEnIHRoZW4gKCBDSFIuYXNfeG5jciB1Y2hyLCBjc2c6ICdqenInICkgZWxzZSB1Y2hyXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpbnB1dFxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAucGlwZSBIT0xMRVJJVEgucmVhZF9zdWIgZGIsICggcGhyYXNlICkgPT5cbiAgICAgICAgWyBnbHlwaCwgXywgbGluZXVwX2xlbmd0aCwgXSAgICA9IHBocmFzZVxuICAgICAgICBzdWJfcHJlZml4ICAgICAgICAgICAgICAgICAgICAgID0gWyAnc3BvJywgZ2x5cGgsICdyYW5rL2NqdCcsIF1cbiAgICAgICAgc3ViX2lucHV0ICAgICAgICAgICAgICAgICAgICAgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBzdWJfcHJlZml4XG4gICAgICAgIHJldHVybiBbIFsgZ2x5cGgsIGxpbmV1cF9sZW5ndGgsIF0sIHN1Yl9pbnB1dCwgXVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAucGlwZSAkICggZGF0YSwgc2VuZCApID0+XG4gICAgICAgIFsgWyBnbHlwaCwgbGluZXVwX2xlbmd0aCwgXSwgWyBfLCBfLCByYW5rLCBdLCBdID0gZGF0YVxuICAgICAgICBzZW5kIFsgZ2x5cGgsIGxpbmV1cF9sZW5ndGgsIHJhbmssIF1cbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgLnBpcGUgRC4kZmlsdGVyICggWyBnbHlwaCwgbGluZXVwX2xlbmd0aCwgcmFuaywgXSApIC0+IHJhbmsgPCAxNTAwMFxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAucGlwZSBIT0xMRVJJVEgucmVhZF9zdWIgZGIsIG1hbmdsZTogZGVjb2RlX2xpbmV1cCwgKCBkYXRhICkgPT5cbiAgICAgICAgWyBnbHlwaCwgbGluZXVwX2xlbmd0aCwgcmFuaywgXSA9IGRhdGFcbiAgICAgICAgc3ViX3ByZWZpeCAgICAgICAgICAgICAgICAgICAgICA9IFsgJ3NwbycsIGdseXBoLCAnZ3VpZGUvbGluZXVwL3VjaHInLCBdXG4gICAgICAgIHN1Yl9pbnB1dCAgICAgICAgICAgICAgICAgICAgICAgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgc3ViX3ByZWZpeFxuICAgICAgICByZXR1cm4gWyBbIGdseXBoLCBsaW5ldXBfbGVuZ3RoLCByYW5rLCBdLCBzdWJfaW5wdXQsIF1cbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgLnBpcGUgSE9MTEVSSVRILnJlYWRfc3ViIGRiLCAoIGRhdGEgKSA9PlxuICAgICAgICBbIFsgZ2x5cGgsIGxpbmV1cF9sZW5ndGgsIHJhbmssIF0sIGd1aWRlcywgXSAgPSBkYXRhXG4gICAgICAgIGNvbmZsdWVuY2UgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IEQuY3JlYXRlX3Rocm91Z2hzdHJlYW0oKVxuICAgICAgICBzdHJlYW1fY291bnQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSAwXG4gICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgICAgZm9yIGd1aWRlIGluIGd1aWRlc1xuICAgICAgICAgIGRvICggZ3VpZGUgKSA9PlxuICAgICAgICAgICAgZ3VpZGVfeG5jciAgICAgICAgPSB4bmNyX2Zyb21fdWNociBndWlkZVxuICAgICAgICAgICAgc3RyZWFtX2NvdW50ICAgICArPSArMVxuICAgICAgICAgICAgc3ViX3ByZWZpeCAgICAgICAgPSBbICdzcG8nLCBndWlkZV94bmNyLCAnZmFjdG9yL3NoYXBlY2xhc3Mvd2JmJywgXVxuICAgICAgICAgICAgc3ViX2lucHV0ICAgICAgICAgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgc3ViX3ByZWZpeFxuICAgICAgICAgICAgc3ViX2lucHV0Lm9uICdlbmQnLCAtPlxuICAgICAgICAgICAgICBzdHJlYW1fY291bnQgKz0gLTFcbiAgICAgICAgICAgICAgaWYgc3RyZWFtX2NvdW50IDwgMVxuICAgICAgICAgICAgICAgIGNvbmZsdWVuY2UuZW5kKClcbiAgICAgICAgICAgIHN1Yl9pbnB1dFxuICAgICAgICAgICAgICAucGlwZSAkICggZGF0YSwgc2VuZCApID0+XG4gICAgICAgICAgICAgICAgWyAuLi4sIHNoYXBlY2xhc3Nfd2JmLCBdID0gZGF0YVxuICAgICAgICAgICAgICAgIGNvbmZsdWVuY2Uud3JpdGUgc2hhcGVjbGFzc193YmZcbiAgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgICByZXR1cm4gWyBbIGdseXBoLCBsaW5ldXBfbGVuZ3RoLCByYW5rLCBndWlkZXMsIF0sIGNvbmZsdWVuY2UsIF1cbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgLnBpcGUgRC4kZmlsdGVyICggZGF0YSApID0+XG4gICAgICAgIFsgWyBnbHlwaCwgbGluZXVwX2xlbmd0aCwgcmFuaywgZ3VpZGVzLCBdLCBzaGFwZWNsYXNzZXNfd2JmLi4uLCBdID0gZGF0YVxuICAgICAgICBjb3VudHMgPSBbIDAsIDAsIDAsIDAsIDAsIF1cbiAgICAgICAgZm9yIHNoYXBlY2xhc3Nfd2JmIGluIHNoYXBlY2xhc3Nlc193YmZcbiAgICAgICAgICBzaGFwZWNsYXNzX2lkeCAgICAgICAgICAgID0gKCBwYXJzZUludCBzaGFwZWNsYXNzX3diZlsgMCBdLCAxMCApIC0gMVxuICAgICAgICAgIGNvdW50c1sgc2hhcGVjbGFzc19pZHggXSArPSArMVxuICAgICAgICByZXR1cm4gKCBjb3VudHMuam9pbiAnLCcgKSBpcyAnMSwxLDEsMSwxJ1xuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAucGlwZSAkICggZGF0YSwgc2VuZCApIC0+IHNlbmQgSlNPTi5zdHJpbmdpZnkgZGF0YVxuICAgICAgLnBpcGUgRC4kc2hvdygpXG5cblxuIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG51bmxlc3MgbW9kdWxlLnBhcmVudD9cblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIG9wdGlvbnMgPVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyAncm91dGUnOiAgICAgICAgICAgICAgICBuanNfcGF0aC5qb2luIF9fZGlybmFtZSwgJy4uL2Ricy9kZW1vJ1xuICAgICdyb3V0ZSc6ICAgICAgICAgICAgICAgICcvVm9sdW1lcy9TdG9yYWdlL2lvL2ppenVyYS1kYXRhc291cmNlcy9kYXRhL2xldmVsZGInXG4gICAgIyAncm91dGUnOiAgICAgICAgICAgICcvdG1wL2xldmVsZGInXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZGVidWcgJ8KpQW9PQVMnLCBvcHRpb25zXG4gICMgc3RlcCAoIHJlc3VtZSApID0+XG4gICMgICB5aWVsZCBAaW5pdGlhbGl6ZSByZXN1bWVcbiAgIyAgIGRiID0gb3B0aW9uc1sgJ2RiJyBdXG4gICMgICBAZmluZF9nb29kX2t3aWNfc2FtcGxlX2dseXBoc18yIGRiXG4gIEBjb3B5X2ppenVyYV9kYigpXG4gICMgQGR1bXBfaml6dXJhX2RiKClcbiAgIyBAZmluZF9nb29kX2t3aWNfc2FtcGxlX2dseXBoc18yKClcblxuXG4iXX0=