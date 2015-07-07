(function() {
  var $, $async, CND, D, HOLLERITH, after, alert, badge, debug, echo, eventually, every, help, immediately, info, join, log, new_db, njs_path, options, repeat_immediately, rpr, step, suspend, urge, warn, whisper, ƒ,
    slice = [].slice;

  njs_path = require('path');

  join = njs_path.join;

  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'HOLLERITH/demo';

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

  $async = D.remit_async.bind(D);

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
    output = HOLLERITH.$write(target_db, {
      batch: batch_size
    });
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
        var element, new_obj, obj, prd, sbj;
        sbj = arg[0], prd = arg[1], obj = arg[2];

        /* Compactify sparse lists so all `undefined` elements are removed; warn about this */
        if ((CND.type_of(obj)) === 'list') {
          new_obj = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = obj.length; i < len; i++) {
              element = obj[i];
              if (element !== void 0) {
                results.push(element);
              }
            }
            return results;
          })();
          if (obj.length !== new_obj.length) {
            warn("phrase " + (rpr([sbj, prd, obj])) + " contained undefined elements; compactified");
          }
          obj = new_obj;
        }
        return send([sbj, prd, obj]);
      };
    })(this))).pipe($((function(_this) {
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

    /*
    *  ▶  '[["勷",5,9907,["亠","吅","𠀎","𧘇","力"]],"41","25","11","35","53"]'
    *  ▶  '[["噿",5,13090,["口","羽","亠","从","十"]],"25","54","41","34","12"]'
    *  ▶  '[["塾",5,3818,["亠","口","子","丸","土"]],"41","25","51","35","12"]'
    *  ▶  '[["墩",5,5457,["土","亠","口","子","夊"]],"12","41","25","51","35"]'
    *  ▶  '[["孃",5,7225,["女","亠","吅","𠀎","𧘇"]],"53","41","25","11","35"]'
    *  ▶  '[["寡",5,3412,["宀","丆","且","八","刀"]],"44","13","25","34","53"]'
    *  ▶  '[["巕",5,13586,["山","卄","𠂤","辛","女"]],"25","12","32","41","53"]'
    *  ▶  '[["橔",5,13883,["木","亠","口","子","夊"]],"12","41","25","51","35"]'
    *  ▶  '[["灂",5,12349,["氵","爫","罒","","寸"]],"44","34","25","51","12"]'
    *  ▶  '[["纏",5,3421,["糹","广","里","八","土"]],"55","41","25","34","12"]'
    *  ▶  '[["纕",5,8882,["糹","亠","吅","𠀎","𧘇"]],"55","41","25","11","35"]'
    *  ▶  '[["鄸",5,8392,["卄","罒","冖","夕","阝"]],"12","25","45","35","52"]'
    *  ▶  '[["韽",5,10377,["亽","𠃌","酉","立","日"]],"34","5","12","41","25"]'
    *  ▶  '[["頀",5,8385,["立","日","卄","隹","又"]],"41","25","12","32","54"]'
    *  ▶  '[["驐",5,12644,["馬","亠","口","子","夊"]],"12","41","25","51","35"]'
    *  ▶  '[["骧",5,6010,["马","亠","吅","𠀎","𧘇"]],"55","41","25","11","35"]'
     */
    return step((function(_this) {
      return function(resume) {
        var CHR, chrs_from_text, decode_lineup, input, prefix, query, xncr_from_uchr;
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
        query = {
          prefix: prefix
        };
        input = HOLLERITH.create_phrasestream(db, query);
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
          _ = phrase[0], glyph = phrase[1], _ = phrase[2], lineup_length = phrase[3];
          sub_prefix = ['spo', glyph, 'rank/cjt'];
          sub_input = HOLLERITH.create_phrasestream(db, {
            prefix: sub_prefix
          });
          return [[glyph, lineup_length], sub_input];
        })).pipe($(function(data, send) {
          var glyph, lineup_length, rank, ref, ref1;
          (ref = data[0], glyph = ref[0], lineup_length = ref[1]), (ref1 = data[1], rank = ref1[ref1.length - 1]);
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
          sub_input = HOLLERITH.create_phrasestream(db, {
            prefix: sub_prefix
          });
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
            sub_input = HOLLERITH.create_phrasestream(db, {
              prefix: sub_prefix
            });
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


  /* version for Hollerith2 DBs; using `HOLLERITH.remit_async` instead of `HOLLERITH.read_sub`. */

  this.find_good_kwic_sample_glyphs_3 = function(db) {
    var ASYNC;
    ASYNC = require('async');
    return step((function(_this) {
      return function(resume) {
        var CHR, chrs_from_text, decode_lineup, input, prefix, query, xncr_from_uchr;
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
        query = {
          prefix: prefix
        };
        input = HOLLERITH.create_phrasestream(db, query);
        decode_lineup = function(lineup) {
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
        return input.pipe($async(function(phrase, done) {
          var _, glyph, lineup_length, sub_fallback, sub_prefix, sub_query;
          _ = phrase[0], glyph = phrase[1], _ = phrase[2], lineup_length = phrase[3];
          sub_prefix = ['spo', glyph, 'rank/cjt'];
          sub_fallback = [null, null, null, Infinity];
          sub_query = {
            prefix: sub_prefix,
            fallback: sub_fallback
          };
          return HOLLERITH.read_one_phrase(db, sub_query, function(error, sub_phrase) {
            var rank;
            if (error != null) {
              return done.error(error);
            }
            if (sub_phrase == null) {
              return done();
            }
            _ = sub_phrase[0], _ = sub_phrase[1], _ = sub_phrase[2], rank = sub_phrase[3];
            return done([
              glyph, {
                lineup_length: lineup_length,
                rank: rank
              }
            ]);
          });
        })).pipe(D.$filter(function(arg) {
          var glyph, lineup_length, rank, ref;
          glyph = arg[0], (ref = arg[1], lineup_length = ref.lineup_length, rank = ref.rank);
          return rank < 15000;
        })).pipe($async(function(entry, done) {
          var glyph, lineup_length, rank, ref, sub_prefix, sub_query;
          glyph = entry[0], (ref = entry[1], lineup_length = ref.lineup_length, rank = ref.rank);
          sub_prefix = ['spo', glyph, 'guide/lineup/uchr'];
          sub_query = {
            prefix: sub_prefix,
            star: '*',
            fallback: null
          };
          return HOLLERITH.read_one_phrase(db, sub_query, function(error, sub_phrase) {
            var _, guides;
            if (error != null) {
              return done.error(error);
            }
            if (sub_phrase == null) {
              return done();
            }
            _ = sub_phrase[0], _ = sub_phrase[1], _ = sub_phrase[2], guides = sub_phrase[3];
            guides = decode_lineup(guides);
            return done([
              glyph, {
                lineup_length: lineup_length,
                rank: rank,
                guides: guides
              }
            ]);
          });
        })).pipe($async(function(entry, done) {
          var fn, glyph, guide, guides, i, len, lineup_length, rank, ref, tasks;
          glyph = entry[0], (ref = entry[1], lineup_length = ref.lineup_length, rank = ref.rank, guides = ref.guides);
          tasks = [];
          fn = function(guide) {
            var guide_xncr, sub_fallback, sub_prefix, sub_query;
            guide_xncr = xncr_from_uchr(guide);
            sub_prefix = ['spo', guide_xncr, 'factor/shapeclass/wbf'];
            sub_fallback = [null, null, null, 'X'];
            sub_query = {
              prefix: sub_prefix,
              fallback: sub_fallback
            };
            return tasks.push(function(handler) {
              return HOLLERITH.read_one_phrase(db, sub_query, handler);
            });
          };
          for (i = 0, len = guides.length; i < len; i++) {
            guide = guides[i];
            fn(guide);
          }
          return ASYNC.parallelLimit(tasks, 10, function(error, sub_phrases) {
            var _, j, len1, strokeclasses, strokeorder, sub_idx, sub_phrase;
            if (error != null) {
              return done.error(error);
            }
            strokeclasses = [];
            for (sub_idx = j = 0, len1 = sub_phrases.length; j < len1; sub_idx = ++j) {
              sub_phrase = sub_phrases[sub_idx];
              _ = sub_phrase[0], _ = sub_phrase[1], _ = sub_phrase[2], strokeorder = sub_phrase[3];
              strokeclasses[sub_idx] = strokeorder[0];
            }
            return done([
              glyph, {
                lineup_length: lineup_length,
                rank: rank,
                guides: guides,
                strokeclasses: strokeclasses
              }
            ]);
          });
        })).pipe(D.$filter(function(entry) {
          var glyph, guides, lineup_length, rank, ref, strokeclasses;
          glyph = entry[0], (ref = entry[1], lineup_length = ref.lineup_length, rank = ref.rank, guides = ref.guides, strokeclasses = ref.strokeclasses);
          return (strokeclasses.slice(0).sort().join('')) === '12345';
        })).pipe($(function(arg, send) {
          var glyph, guides, lineup_length, rank, ref, strokeclasses;
          glyph = arg[0], (ref = arg[1], lineup_length = ref.lineup_length, rank = ref.rank, guides = ref.guides, strokeclasses = ref.strokeclasses);
          guides = guides.join('');
          strokeclasses = strokeclasses.join('');
          return send([
            glyph, {
              lineup_length: lineup_length,
              rank: rank,
              guides: guides,
              strokeclasses: strokeclasses
            }
          ]);
        })).pipe(D.$show());
      };
    })(this));
  };

  this.show_encoding_sample = function() {
    var b, encoding, i, idx, key, key_rpr, len, obj, phrases, prd, ref, sbj, value, value_rpr;
    encoding = HOLLERITH.DUMP.encodings['dbcs2'];
    encoding = HOLLERITH.DUMP.encodings['aleph'];
    encoding = HOLLERITH.DUMP.encodings['rdctn'];
    phrases = [['丁', 'strokecount', 2], ['三', 'strokecount', 3], ['夫', 'strokecount', 5], ['國', 'strokecount', 11], ['形', 'strokecount', 7], ['丁', 'componentcount', 1], ['三', 'componentcount', 1], ['夫', 'componentcount', 1], ['國', 'componentcount', 4], ['形', 'componentcount', 2], ['丁', 'components', ['丁']], ['三', 'components', ['三']], ['夫', 'components', ['夫']], ['國', 'components', ['囗', '戈', '口', '一']], ['形', 'components', ['开', '彡']]];
    for (i = 0, len = phrases.length; i < len; i++) {
      ref = phrases[i], sbj = ref[0], prd = ref[1], obj = ref[2];
      key = HOLLERITH.CODEC.encode([sbj, prd]);
      value = new Buffer(JSON.stringify(obj));
      key_rpr = ((function() {
        var j, ref1, results;
        results = [];
        for (idx = j = 0, ref1 = key.length; 0 <= ref1 ? j < ref1 : j > ref1; idx = 0 <= ref1 ? ++j : --j) {
          results.push(encoding[key[idx]]);
        }
        return results;
      })()).join('');
      value_rpr = ((function() {
        var j, ref1, results;
        results = [];
        for (idx = j = 0, ref1 = value.length; 0 <= ref1 ? j < ref1 : j > ref1; idx = 0 <= ref1 ? ++j : --j) {
          results.push(encoding[value[idx]]);
        }
        return results;
      })()).join('');
      urge(key_rpr, '┊', value_rpr);
    }
    b = new Buffer('一x丁x丂');
    return help(HOLLERITH.DUMP.rpr_of_buffer(null, HOLLERITH.CODEC.encode([true, -1 / 7])));
  };

  if (module.parent == null) {
    options = {
      'route': '/Volumes/Storage/io/jizura-datasources/data/leveldb'
    };
    debug('©AoOAS', options);
    this.find_good_kwic_sample_glyphs_3();
  }

}).call(this);

//# sourceMappingURL=../sourcemaps/demo.js.map