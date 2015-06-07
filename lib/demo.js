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
          _ = phrase[0], glyph = phrase[1], _ = phrase[2], lineup_length = phrase[3];
          sub_prefix = ['spo', glyph, 'rank/cjt'];
          sub_input = HOLLERITH.create_phrasestream(db, sub_prefix);
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
    this.find_good_kwic_sample_glyphs_2();
  }

}).call(this);

//# sourceMappingURL=data:application/json;base64,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Q0FBQSxDQUFBLEdBQUssQ0FBYixDQUF2QixDQUFuQyxDQUFMLEVBL0JzQjtFQUFBLENBMWJ4QixDQUFBOztBQXVlQSxFQUFBLElBQU8scUJBQVA7QUFHRSxJQUFBLE9BQUEsR0FHRTtBQUFBLE1BQUEsT0FBQSxFQUF3QixxREFBeEI7S0FIRixDQUFBO0FBQUEsSUFNQSxLQUFBLENBQU0sUUFBTixFQUFnQixPQUFoQixDQU5BLENBQUE7QUFBQSxJQWFBLElBQUMsQ0FBQSw4QkFBRCxDQUFBLENBYkEsQ0FIRjtHQXZlQTtBQUFBIiwiZmlsZSI6ImRlbW8uanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJcblxuXG4jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbm5qc19wYXRoICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdwYXRoJ1xuIyBuanNfZnMgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnZnMnXG5qb2luICAgICAgICAgICAgICAgICAgICAgID0gbmpzX3BhdGguam9pblxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5DTkQgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnY25kJ1xucnByICAgICAgICAgICAgICAgICAgICAgICA9IENORC5ycHJcbmJhZGdlICAgICAgICAgICAgICAgICAgICAgPSAnSE9MTEVSSVRIL3Rlc3QnXG5sb2cgICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3BsYWluJywgICAgIGJhZGdlXG5pbmZvICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ2luZm8nLCAgICAgIGJhZGdlXG53aGlzcGVyICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3doaXNwZXInLCAgIGJhZGdlXG5hbGVydCAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ2FsZXJ0JywgICAgIGJhZGdlXG5kZWJ1ZyAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ2RlYnVnJywgICAgIGJhZGdlXG53YXJuICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3dhcm4nLCAgICAgIGJhZGdlXG5oZWxwICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ2hlbHAnLCAgICAgIGJhZGdlXG51cmdlICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3VyZ2UnLCAgICAgIGJhZGdlXG5lY2hvICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmVjaG8uYmluZCBDTkRcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuc3VzcGVuZCAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2NvZmZlZW5vZGUtc3VzcGVuZCdcbnN0ZXAgICAgICAgICAgICAgICAgICAgICAgPSBzdXNwZW5kLnN0ZXBcbmFmdGVyICAgICAgICAgICAgICAgICAgICAgPSBzdXNwZW5kLmFmdGVyXG5ldmVudHVhbGx5ICAgICAgICAgICAgICAgID0gc3VzcGVuZC5ldmVudHVhbGx5XG5pbW1lZGlhdGVseSAgICAgICAgICAgICAgID0gc3VzcGVuZC5pbW1lZGlhdGVseVxucmVwZWF0X2ltbWVkaWF0ZWx5ICAgICAgICA9IHN1c3BlbmQucmVwZWF0X2ltbWVkaWF0ZWx5XG5ldmVyeSAgICAgICAgICAgICAgICAgICAgID0gc3VzcGVuZC5ldmVyeVxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jIEJZVEVXSVNFICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdieXRld2lzZSdcbiMgdGhyb3VnaCAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ3Rocm91Z2gyJ1xuIyBMZXZlbEJhdGNoICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbGV2ZWwtYmF0Y2gtc3RyZWFtJ1xuIyBCYXRjaFN0cmVhbSAgICAgICAgICAgICAgID0gcmVxdWlyZSAnYmF0Y2gtc3RyZWFtJ1xuIyBwYXJhbGxlbCAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnY29uY3VycmVudC13cml0YWJsZSdcbkQgICAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdwaXBlZHJlYW1zMidcbiQgICAgICAgICAgICAgICAgICAgICAgICAgPSBELnJlbWl0LmJpbmQgRFxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5uZXdfZGIgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbGV2ZWwnXG4jIG5ld19sZXZlbGdyYXBoICAgICAgICAgICAgPSByZXF1aXJlICdsZXZlbGdyYXBoJ1xuIyBkYiAgICAgICAgICAgICAgICAgICAgICAgID0gbmV3X2xldmVsZ3JhcGggJy90bXAvbGV2ZWxncmFwaCdcbkhPTExFUklUSCAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL21haW4nXG7GkiAgICAgICAgICAgICAgICAgICAgICAgICA9IENORC5mb3JtYXRfbnVtYmVyLmJpbmQgQ05EXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbm9wdGlvbnMgICAgICAgICAgICAgICAgICAgPSBudWxsXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9taXNmaXQgICAgICAgICAgPSBTeW1ib2wgJ21pc2ZpdCdcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgUElQRURSRUFNU1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5ELm5ld19pbmRleGVyID0gKCBpZHggPSAwICkgLT4gKCBkYXRhICkgPT4gWyBpZHgrKywgZGF0YSwgXVxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuI1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AaW5pdGlhbGl6ZSA9ICggaGFuZGxlciApIC0+XG4gIG9wdGlvbnNbICdkYicgXSA9IEhPTExFUklUSC5uZXdfZGIgb3B0aW9uc1sgJ3JvdXRlJyBdXG4gIGhhbmRsZXIgbnVsbFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBtYWluID0gKCBmaXJzdF9xdWVyeSApIC0+XG4gIGZpcnN0X3F1ZXJ5ID89IHsgZ3RlOiAnb3N8cmFuay9janQ6MCcsIGx0ZTogJ29zfHJhbmsvY2p0OjknLCB9XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHlpZWxkIEBpbml0aWFsaXplIHJlc3VtZVxuICAgIGRiID0gb3B0aW9uc1sgJ2RiJyBdXG4gICAgQ0hSID0gcmVxdWlyZSAnL1ZvbHVtZXMvU3RvcmFnZS9pby9jb2ZmZWVub2RlLWNocidcbiAgICBjb3VudF9jaHJzID0gKCB0ZXh0ICkgLT4gKCBDSFIuY2hyc19mcm9tX3RleHQgdGV4dCwgaW5wdXQ6ICd4bmNyJyApLmxlbmd0aFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaW5wdXQgPSBkYlsgJyVzZWxmJyBdLmNyZWF0ZUtleVN0cmVhbSBmaXJzdF9xdWVyeVxuICAgICMgayA9IFwic298Z2x5cGg657m8fHBvZDpcIlxuICAgICMgaW5wdXQgPSBkYlsgJyVzZWxmJyBdLmNyZWF0ZUtleVN0cmVhbSBkYiwgeyBndGU6IGssIGx0ZTogayArICdcXHVmZmZmJyB9XG4gICAgIyBkZWJ1ZyAnwqljVzh0SycsIEhPTExFUklUSC5uZXdfa2V5IGRiLCAnb3MnLCAncmFuay9janQnLCAnMDAwMDAnXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAjIyMgVEFJTlQgV2UgY2FuIGN1cnJlbnRseSBub3QgdXNlIGBIT0xMRVJJVEgyLnJlYWRfc3ViYCBiZWNhdXNlIEhPTExFUklUSDIgYXNzdW1lcyBhIGtleS1vbmx5XG4gICAgREIgdGhhdCB1c2VzIGJpbmFyeSBlbmNvZGluZyB3aXRoIGEgY3VzdG9tIGh0dHBzOi8vZ2l0aHViLmNvbS9kZWFubGFuZG9sdC9ieXRld2lzZSBsYXllcjsgdGhlIGN1cnJlbnRcbiAgICBKaXp1cmEgREIgdmVyc2lvbiB1c2VzIFVURi04IHN0cmluZ3MgYW5kIGlzIGEga2V5L3ZhbHVlIERCLiAjIyNcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGlucHV0XG4gICAgICAucGlwZSBAXyRzcGxpdF9ia2V5KClcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgIyAucGlwZSBIT0xMRVJJVEgucmVhZF9zdWIgZGIsIGluZGV4ZWQ6IHllcywgKCBrZXkgKSA9PlxuICAgICAgLnBpcGUgQHJlYWRfc3ViIGRiLCBpbmRleGVkOiB5ZXMsICgga2V5ICkgPT5cbiAgICAgICAgWyBwdCwgb2ssIHJhbmssIHNrLCBnbHlwaCwgXSA9IGtleVxuICAgICAgICBzdWJfa2V5ID0gXCJzb3xnbHlwaDoje2dseXBofXxwb2Q6XCJcbiAgICAgICAgcmV0dXJuIGRiWyAnJXNlbGYnIF0uY3JlYXRlVmFsdWVTdHJlYW0geyBndGU6IHN1Yl9rZXksIGx0ZTogc3ViX2tleSArICdcXHVmZmZmJyB9XG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIC5waXBlIEQuJGRlbnNvcnQgMCwgMCwgdHJ1ZVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAucGlwZSAkICggWyBpZHgsIFsgcG9kLCBdLCBdLCBzZW5kICkgPT5cbiAgICAgICAgZGVidWcgJ8KpamQ1Y0UnLCBwb2RcbiAgICAgICAgdW5sZXNzIHBvZFsgJ3N0cm9rZW9yZGVyL3Nob3J0JyAgXT9cbiAgICAgICAgICB3YXJuICfCqTlZWG9xJywgIHBvZFxuICAgICAgICBlbHNlXG4gICAgICAgICAgZ2x5cGggICAgICAgPSBwb2RbICdnbHlwaC91Y2hyJyAgICAgICAgIF1cbiAgICAgICAgICBzdHJva2VvcmRlciA9IHBvZFsgJ3N0cm9rZW9yZGVyL3Nob3J0JyAgXVsgMCBdLmxlbmd0aFxuICAgICAgICAgIGxpbmV1cCAgICAgID0gcG9kWyAnZ3VpZGUvbGluZXVwL3VjaHInICBdLnJlcGxhY2UgL1xcdTMwMDAvZywgJydcbiAgICAgICAgICBzZW5kIFsgZ2x5cGgsIHN0cm9rZW9yZGVyLCBsaW5ldXAsIF1cbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgLnBpcGUgJCAoIFsgZ2x5cGgsIHN0cm9rZW9yZGVyLCBsaW5ldXAsIF0sIHNlbmQgKSA9PlxuICAgICAgICBzZW5kIFsgZ2x5cGgsIHN0cm9rZW9yZGVyLCBjb3VudF9jaHJzIGxpbmV1cCwgXVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAucGlwZSBELiRzb3J0ICggYSwgYiApIC0+XG4gICAgICAgIGlkeCA9IDFcbiAgICAgICAgcmV0dXJuICsxIGlmIGFbIGlkeCBdID4gYlsgaWR4IF1cbiAgICAgICAgcmV0dXJuIC0xIGlmIGFbIGlkeCBdIDwgYlsgaWR4IF1cbiAgICAgICAgcmV0dXJuICAwXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIC5waXBlIEQuJHNob3coKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfJHNwbGl0X2JrZXkgPSAtPiAkICggYmtleSwgc2VuZCApID0+IHNlbmQgQF9zcGxpdF9ia2V5IGJrZXlcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX3NwbGl0X2JrZXkgPSAoIGJrZXkgKSAtPlxuICBSID0gYmtleS50b1N0cmluZyAndXRmLTgnXG4gIFIgPSAoIFIuc3BsaXQgJ3wnIClbIC4uIDIgXVxuICBSID0gWyBSWyAwIF0sICggUlsgMSBdLnNwbGl0ICc6JyApLi4uLCAoIFJbIDIgXS5zcGxpdCAnOicgKS4uLiwgXVxuICByZXR1cm4gUlxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfJHNwbGl0X3NvX2JrZXkgPSAtPiAkICggYmtleSwgc2VuZCApID0+IHNlbmQgQF9zcGxpdF9zb19ia2V5IGJrZXlcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX3NwbGl0X3NvX2JrZXkgPSAoIGJrZXkgKSAtPlxuICBSICAgICAgID0gYmtleS50b1N0cmluZyAndXRmLTgnXG4gIFIgICAgICAgPSBSLnNwbGl0ICd8J1xuICBpZHhfdHh0ID0gUlsgMyBdXG4gIFIgICAgICAgPSBbICggUlsgMSBdLnNwbGl0ICc6JyApWyAxIF0sICggUlsgMiBdLnNwbGl0ICc6JyApLi4uLCBdXG4gIFIucHVzaCAoIHBhcnNlSW50IGlkeF90eHQsIDEwwqApIGlmIGlkeF90eHQ/IGFuZCBpZHhfdHh0Lmxlbmd0aCA+IDBcbiAgcmV0dXJuIFJcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX2x0ZV9mcm9tX2d0ZSA9ICggZ3RlICkgLT5cbiAgUiA9IG5ldyBCdWZmZXIgKCBsYXN0X2lkeCA9IEJ1ZmZlci5ieXRlTGVuZ3RoIGd0ZSApICsgMVxuICBSLndyaXRlIGd0ZVxuICBSWyBsYXN0X2lkeCBdID0gMHhmZlxuICByZXR1cm4gUlxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkAkbGluZXVwX2Zyb21fZ2x5cGggPSAoIGRiICkgLT5cbiAgc2V0dGluZ3MgPVxuICAgIGluZGV4ZWQ6ICBub1xuICAgIHNpbmdsZTogICB5ZXNcbiAgcmV0dXJuIEByZWFkX3N1YiBkYiwgc2V0dGluZ3MsICggZ2x5cGggKSA9PlxuICAgIGx0ZSA9IFwic298Z2x5cGg6I3tnbHlwaH18Z3VpZGUvbGluZXVwL3VjaHI6XCJcbiAgICBzdWJfaW5wdXQgPSBkYlsgJyVzZWxmJyBdLmNyZWF0ZUtleVN0cmVhbSB7IGd0ZTogbHRlLCBsdGU6IEBfbHRlX2Zyb21fZ3RlIGx0ZSwgfVxuICAgIHJldHVybiBzdWJfaW5wdXRcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AJHNoYXBlY2xhc3Nfd2JmX2Zyb21fZ2x5cGhfYW5kX2xpbmV1cCA9ICggZGIgKSAtPlxuICAjIyMgVEFJTlQgd3JvbmcgIyMjXG4gIHNldHRpbmdzID1cbiAgICBpbmRleGVkOiAgbm9cbiAgICBzaW5nbGU6ICAgeWVzXG4gIHJldHVybiBAcmVhZF9zdWIgZGIsIHNldHRpbmdzLCAoIFsgZ2x5cGgsIGxpbmV1cF9nbHlwaHMsIF0gKSA9PlxuICAgIGZvciBsaW5ldXBfZ2x5cGggaW4gbGluZXVwX2dseXBoc1xuICAgICAgZG8gKCBsaW5ldXBfZ2x5cGggKSA9PlxuICAgICAgICBndGUgPSBcInNvfGdseXBoOiN7bGluZXVwX2dseXBofXxmYWN0b3Ivc3Ryb2tlY2xhc3Mvd2JmOlwiXG4gICAgICAgIHN1Yl9pbnB1dCA9IGRiWyAnJXNlbGYnIF0uY3JlYXRlS2V5U3RyZWFtIHsgZ3RlOiBndGUsIGx0ZTogQF9sdGVfZnJvbV9ndGUgZ3RlLCB9XG4gICAgICAgIHJldHVybiBzdWJfaW5wdXRcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5IT0xMRVJJVEguJHBpY2tfc3ViamVjdCA9IC0+XG4gIHJldHVybiAkICggbGtleSwgc2VuZCApID0+XG4gICAgWyBwdCwgXywgdjAsIF8sIHYxLCBdID0gbGtleVxuICAgIHNlbmQgaWYgcHQgaXMgJ3NvJyB0aGVuIHYwIGVsc2UgdjFcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5IT0xMRVJJVEguJHBpY2tfb2JqZWN0ID0gLT5cbiAgcmV0dXJuICQgKCBsa2V5LCBzZW5kICkgPT5cbiAgICBbIHB0LCBfLCB2MCwgXywgdjEsIF0gPSBsa2V5XG4gICAgc2VuZCBpZiBwdCBpcyAnc28nIHRoZW4gdjEgZWxzZSB2MFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkhPTExFUklUSC4kcGlja192YWx1ZXMgPSAtPlxuICByZXR1cm4gJCAoIGxrZXksIHNlbmQgKSA9PlxuICAgIFsgcHQsIF8sIHYwLCBfLCB2MSwgXSA9IGxrZXlcbiAgICBzZW5kIGlmIHB0IGlzICdzbycgdGhlbiBbIHYwLCB2MSwgXSBlbHNlIFsgdjEsIHYwLCBdXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQGNvcHlfaml6dXJhX2RiID0gLT5cbiAgZHNfb3B0aW9ucyAgPSByZXF1aXJlICcvVm9sdW1lcy9TdG9yYWdlL2lvL2ppenVyYS1kYXRhc291cmNlcy9vcHRpb25zJ1xuICBzb3VyY2VfZGIgICA9IEhPTExFUklUSC5uZXdfZGIgb3B0aW9uc1sgJ3JvdXRlJyBdXG4gIHRhcmdldF9kYiAgID0gSE9MTEVSSVRILm5ld19kYiAnL1ZvbHVtZXMvU3RvcmFnZS90ZW1wL2ppenVyYS1ob2xsZXJpdGgyJ1xuICBndGUgICAgICAgICA9ICdzb3wnXG4gICMgZ3RlICAgICAgICAgPSAnc298Z2x5cGg68KSKgicgIyAhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhIVxuICBsdGUgICAgICAgICA9IEBfbHRlX2Zyb21fZ3RlIGd0ZVxuICBpbnB1dCAgICAgICA9IHNvdXJjZV9kYlsgJyVzZWxmJyBdLmNyZWF0ZUtleVN0cmVhbSB7IGd0ZSwgbHRlLCB9XG4gIGJhdGNoX3NpemUgID0gMTAwMDBcbiAgb3V0cHV0ICAgICAgPSBIT0xMRVJJVEguJHdyaXRlIHRhcmdldF9kYiwgeyBiYXRjaDogYmF0Y2hfc2l6ZSwgfVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGlucHV0XG4gICAgLnBpcGUgRC4kY291bnQgKCBjb3VudCApIC0+IGhlbHAgXCJyZWFkICN7Y291bnR9IGtleXNcIlxuICAgIC5waXBlIEBfJHNwbGl0X3NvX2JrZXkoKVxuICAgICMgLnBpcGUgJCAoIGtleSwgc2VuZCApID0+XG4gICAgIyAgICMjIyAhISEhISAjIyNcbiAgICAjICAgWyBnbHlwaCwgcHJkLCBvYmosIGlkeCwgXSA9IGtleVxuICAgICMgICBzZW5kIGtleSBpZiBnbHlwaCBpbiBbICfkuK0nLCAn5ZyLJywgJ+eahycsICfluJ0nLCBdXG4gICAgLnBpcGUgJCAoIGtleSwgc2VuZCApID0+XG4gICAgICBbIGdseXBoLCBwcmQsIG9iaiwgaWR4LCBdID0ga2V5XG4gICAgICBzZW5kIGtleSB1bmxlc3MgcHJkIGlzICdwb2QnXG4gICAgLnBpcGUgRC4kY291bnQgKCBjb3VudCApIC0+IGhlbHAgXCJrZXB0ICN7Y291bnR9IGVudHJpZXNcIlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgLnBpcGUgZG8gPT5cbiAgICAgIGJ1ZmZlciAgICAgID0gbnVsbFxuICAgICAgbWVtbyAgICAgICAgPSBudWxsXG4gICAgICBsYXN0X3NwICAgICA9IG51bGxcbiAgICAgICMgd2l0aGluX2xpc3QgPSBub1xuICAgICAgcmV0dXJuICQgKCBrZXksIHNlbmQgKSA9PlxuICAgICAgICBbIHNiaiwgcHJkLCBvYmosIGlkeCwgXSA9IGtleVxuICAgICAgICBpZiBpZHg/XG4gICAgICAgICAgc3AgPSBcIiN7c2JqfXwje3ByZH1cIlxuICAgICAgICAgIGlmIHNwIGlzIGxhc3Rfc3BcbiAgICAgICAgICAgIGJ1ZmZlclsgaWR4IF0gPSBvYmpcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBzZW5kIFsgbWVtby4uLiwgYnVmZmVyLCBdIGlmIGJ1ZmZlcj9cbiAgICAgICAgICAgIGJ1ZmZlciAgICAgICAgPSBbXVxuICAgICAgICAgICAgYnVmZmVyWyBpZHggXSA9IG9ialxuICAgICAgICAgICAgbWVtbyAgICAgICAgICA9IFsgc2JqLCBwcmQsIF1cbiAgICAgICAgICAgIGxhc3Rfc3AgICAgICAgPSBzcFxuICAgICAgICBlbHNlXG4gICAgICAgICAgc2VuZCBbIHNiaiwgcHJkLCBvYmosIF1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIC5waXBlICQgKCBbIHNiaiwgcHJkLCBvYmosIF0sIHNlbmQgKSA9PlxuICAgICAgIyMjIENvbXBhY3RpZnkgc3BhcnNlIGxpc3RzIHNvIGFsbCBgdW5kZWZpbmVkYCBlbGVtZW50cyBhcmUgcmVtb3ZlZDsgd2FybiBhYm91dCB0aGlzICMjI1xuICAgICAgaWYgKCBDTkQudHlwZV9vZiBvYmogKSBpcyAnbGlzdCdcbiAgICAgICAgbmV3X29iaiA9ICggZWxlbWVudCBmb3IgZWxlbWVudCBpbiBvYmogd2hlbiBlbGVtZW50IGlzbnQgdW5kZWZpbmVkIClcbiAgICAgICAgaWYgb2JqLmxlbmd0aCBpc250IG5ld19vYmoubGVuZ3RoXG4gICAgICAgICAgd2FybiBcInBocmFzZSAje3JwciBbIHNiaiwgcHJkLCBvYmosIF19IGNvbnRhaW5lZCB1bmRlZmluZWQgZWxlbWVudHM7IGNvbXBhY3RpZmllZFwiXG4gICAgICAgIG9iaiA9IG5ld19vYmpcbiAgICAgIHNlbmQgWyBzYmosIHByZCwgb2JqLCBdXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAjIC5waXBlIEQuJHNob3coKVxuICAgIC5waXBlICQgKCBbIHNiaiwgcHJkLCBvYmosIF0sIHNlbmQgKSA9PlxuICAgICAgIyMjIFR5cGUgQ2FzdGluZyAjIyNcbiAgICAgIHR5cGVfZGVzY3JpcHRpb24gPSBkc19vcHRpb25zWyAnc2NoZW1hJyBdWyBwcmQgXVxuICAgICAgdW5sZXNzIHR5cGVfZGVzY3JpcHRpb24/XG4gICAgICAgIHdhcm4gXCJubyB0eXBlIGRlc2NyaXB0aW9uIGZvciBwcmVkaWNhdGUgI3tycHIgcHJkfVwiXG4gICAgICBlbHNlXG4gICAgICAgIHN3aXRjaCB0eXBlID0gdHlwZV9kZXNjcmlwdGlvblsgJ3R5cGUnIF1cbiAgICAgICAgICB3aGVuICdpbnQnXG4gICAgICAgICAgICBvYmogPSBwYXJzZUludCBvYmosIDEwXG4gICAgICAgICAgd2hlbiAndGV4dCdcbiAgICAgICAgICAgICMjIyBUQUlOVCB3ZSBoYXZlIG5vIGJvb2xlYW5zIGNvbmZpZ3VyZWQgIyMjXG4gICAgICAgICAgICBpZiAgICAgIG9iaiBpcyAndHJ1ZScgICB0aGVuIG9iaiA9IHRydWVcbiAgICAgICAgICAgIGVsc2UgaWYgb2JqIGlzICdmYWxzZScgIHRoZW4gb2JqID0gZmFsc2VcbiAgICAgIHNlbmQgWyBzYmosIHByZCwgb2JqLCBdXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAucGlwZSBkbyA9PlxuICAgICAgY291bnQgPSAwXG4gICAgICByZXR1cm4gJCAoIHBocmFzZSwgc2VuZCApID0+XG4gICAgICAgIGNvdW50ICs9IDFcbiAgICAgICAgIyAhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISFcbiAgICAgICAgIyBpZiBjb3VudCAlIDEwMDAwIGlzIDBcbiAgICAgICAgIyAgIGVjaG8gY291bnQsIHBocmFzZVxuICAgICAgICBzZW5kIHBocmFzZVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgLnBpcGUgb3V0cHV0XG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQGR1bXBfaml6dXJhX2RiID0gLT5cbiAgc291cmNlX2RiICAgPSBIT0xMRVJJVEgubmV3X2RiICcvVm9sdW1lcy9TdG9yYWdlL3RlbXAvaml6dXJhLWhvbGxlcml0aDInXG4gIHByZWZpeCAgICAgID0gWyAnc3BvJywgJ/Chj6AnLCBdXG4gIHByZWZpeCAgICAgID0gWyAnc3BvJywgJ+OUsCcsIF1cbiAgaW5wdXQgICAgICAgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBzb3VyY2VfZGIsIHByZWZpeFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGlucHV0XG4gICAgLnBpcGUgRC4kY291bnQgKCBjb3VudCApIC0+IGhlbHAgXCJyZWFkICN7Y291bnR9IGtleXNcIlxuICAgIC5waXBlICQgKCBkYXRhLCBzZW5kICkgPT4gc2VuZCBKU09OLnN0cmluZ2lmeSBkYXRhXG4gICAgLnBpcGUgRC4kc2hvdygpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyMjIHZlcnNpb24gZm9yIEhvbGxlcml0aDEgREJzICMjI1xuQGZpbmRfZ29vZF9rd2ljX3NhbXBsZV9nbHlwaHNfMSA9ICggZGIgKSAtPlxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHVubGVzcyBkYj9cbiAgICAgIHlpZWxkIEBpbml0aWFsaXplIHJlc3VtZVxuICAgICAgZGIgPSBvcHRpb25zWyAnZGInIF1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIENIUiA9IHJlcXVpcmUgJy9Wb2x1bWVzL1N0b3JhZ2UvaW8vY29mZmVlbm9kZS1jaHInXG4gICAgY2hyc19mcm9tX3RleHQgPSAoIHRleHQgKSAtPiBDSFIuY2hyc19mcm9tX3RleHQgdGV4dCwgaW5wdXQ6ICd4bmNyJ1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgZ3RlICAgICA9ICdvc3xndWlkZS9saW5ldXAvbGVuZ3RoOjA1J1xuICAgIGx0ZSAgICAgPSBAX2x0ZV9mcm9tX2d0ZSBndGVcbiAgICBpbnB1dCAgID0gZGJbICclc2VsZicgXS5jcmVhdGVLZXlTdHJlYW0geyBndGU6IGd0ZSwgbHRlOiBsdGUsIH1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGRlY29kZV9yYW5rID0gKCBia2V5ICkgPT5cbiAgICAgIFsgLi4uLCByYW5rX3R4dCwgXSA9IEBfc3BsaXRfYmtleSBia2V5XG4gICAgICByZXR1cm4gcGFyc2VJbnQgcmFua190eHQsIDEwXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBkZWNvZGVfbGluZXVwID0gKCBia2V5ICkgPT5cbiAgICAgIFsgLi4uLCBsaW5ldXAsIF0gPSBAX3NwbGl0X2JrZXkgYmtleVxuICAgICAgbGluZXVwID0gbGluZXVwLnJlcGxhY2UgL1xcdTMwMDAvZywgJydcbiAgICAgIHJldHVybiBjaHJzX2Zyb21fdGV4dCBsaW5ldXBcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHhuY3JfZnJvbV91Y2hyID0gKCB1Y2hyICkgPT5cbiAgICAgIHJldHVybiBpZiAoIENIUi5hc19yc2cgdWNociApIGlzICd1LXB1YScgdGhlbiAoIENIUi5hc194bmNyIHVjaHIsIGNzZzogJ2p6cicgKSBlbHNlIHVjaHJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGlucHV0XG4gICAgICAucGlwZSBAXyRzcGxpdF9ia2V5KClcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgLnBpcGUgSE9MTEVSSVRILnJlYWRfc3ViIGRiLCBtYW5nbGU6IGRlY29kZV9yYW5rLCAoIHBocmFzZSApID0+XG4gICAgICAgIFsgLi4uLCBnbHlwaCwgXSAgICAgICAgICAgPSBwaHJhc2VcbiAgICAgICAgc3ViX2d0ZSAgICAgPSBcInNvfGdseXBoOiN7Z2x5cGh9fHJhbmsvY2p0OlwiXG4gICAgICAgIHN1Yl9sdGUgICAgID0gQF9sdGVfZnJvbV9ndGUgc3ViX2d0ZVxuICAgICAgICBzdWJfaW5wdXQgICA9IGRiWyAnJXNlbGYnIF0uY3JlYXRlS2V5U3RyZWFtIHsgZ3RlOiBzdWJfZ3RlLCBsdGU6IHN1Yl9sdGUsIH1cbiAgICAgICAgcmV0dXJuIFsgZ2x5cGgsIHN1Yl9pbnB1dCwgXVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAucGlwZSBELiRmaWx0ZXIgKCBbIGdseXBoLCByYW5rLCBdICkgLT4gcmFuayA8IDE1MDBcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgLnBpcGUgSE9MTEVSSVRILnJlYWRfc3ViIGRiLCBtYW5nbGU6IGRlY29kZV9saW5ldXAsICggcmVjb3JkICkgPT5cbiAgICAgICAgWyBnbHlwaCwgcmFuaywgXSAgPSByZWNvcmRcbiAgICAgICAgc3ViX2d0ZSAgICAgICAgICAgPSBcInNvfGdseXBoOiN7Z2x5cGh9fGd1aWRlL2xpbmV1cC91Y2hyOlwiXG4gICAgICAgIHN1Yl9sdGUgICAgICAgICAgID0gQF9sdGVfZnJvbV9ndGUgc3ViX2d0ZVxuICAgICAgICBzdWJfaW5wdXQgICAgICAgICA9IGRiWyAnJXNlbGYnIF0uY3JlYXRlS2V5U3RyZWFtIHsgZ3RlOiBzdWJfZ3RlLCBsdGU6IHN1Yl9sdGUsIH1cbiAgICAgICAgcmV0dXJuIFsgWyBnbHlwaCwgcmFuaywgXSwgc3ViX2lucHV0LCBdXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIC5waXBlIEhPTExFUklUSC5yZWFkX3N1YiBkYiwgKCByZWNvcmQgKSA9PlxuICAgICAgICBbIFsgZ2x5cGgsIHJhbmssIF0sIGd1aWRlcywgXSA9IHJlY29yZFxuICAgICAgICBjb25mbHVlbmNlICAgICAgICAgICAgICAgICAgICA9IEQuY3JlYXRlX3Rocm91Z2hzdHJlYW0oKVxuICAgICAgICBzdHJlYW1fY291bnQgICAgICAgICAgICAgICAgICA9IDBcbiAgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgICBmb3IgZ3VpZGUgaW4gZ3VpZGVzXG4gICAgICAgICAgZG8gKCBndWlkZSApID0+XG4gICAgICAgICAgICBndWlkZV94bmNyICAgICAgICA9IHhuY3JfZnJvbV91Y2hyIGd1aWRlXG4gICAgICAgICAgICBzdHJlYW1fY291bnQgICAgICs9ICsxXG4gICAgICAgICAgICBzdWJfZ3RlICAgICAgICAgICA9IFwic298Z2x5cGg6I3tndWlkZV94bmNyfXxmYWN0b3Ivc2hhcGVjbGFzcy93YmY6XCJcbiAgICAgICAgICAgIHN1Yl9sdGUgICAgICAgICAgID0gQF9sdGVfZnJvbV9ndGUgc3ViX2d0ZVxuICAgICAgICAgICAgc3ViX2lucHV0ICAgICAgICAgPSBkYlsgJyVzZWxmJyBdLmNyZWF0ZUtleVN0cmVhbSB7IGd0ZTogc3ViX2d0ZSwgbHRlOiBzdWJfbHRlLCB9XG4gICAgICAgICAgICBzdWJfaW5wdXQub24gJ2VuZCcsIC0+XG4gICAgICAgICAgICAgIHN0cmVhbV9jb3VudCArPSAtMVxuICAgICAgICAgICAgICBpZiBzdHJlYW1fY291bnQgPCAxXG4gICAgICAgICAgICAgICAgY29uZmx1ZW5jZS5lbmQoKVxuICAgICAgICAgICAgc3ViX2lucHV0XG4gICAgICAgICAgICAgIC5waXBlIEBfJHNwbGl0X2JrZXkoKVxuICAgICAgICAgICAgICAucGlwZSAkICggZGF0YSwgc2VuZCApID0+XG4gICAgICAgICAgICAgICAgWyAuLi4sIHNoYXBlY2xhc3Nfd2JmLCBdID0gZGF0YVxuICAgICAgICAgICAgICAgIGNvbmZsdWVuY2Uud3JpdGUgWyBndWlkZSwgc2hhcGVjbGFzc193YmYsIF1cbiAgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgICByZXR1cm4gWyBbIGdseXBoLCByYW5rLCBndWlkZXMsIF0sIGNvbmZsdWVuY2UsIF1cbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgLnBpcGUgJCAoIGRhdGEsIHNlbmQgKSAtPiBzZW5kIEpTT04uc3RyaW5naWZ5IGRhdGFcbiAgICAgIC5waXBlIEQuJHNob3coKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMjIyB2ZXJzaW9uIGZvciBIb2xsZXJpdGgyIERCcyAjIyNcbkBmaW5kX2dvb2Rfa3dpY19zYW1wbGVfZ2x5cGhzXzIgPSAoIGRiICkgLT5cbiAgIyMjXG4gICogIOKWtiAgJ1tbXCLli7dcIiw1LDk5MDcsW1wi5LqgXCIsXCLlkIVcIixcIvCggI5cIixcIvCnmIdcIixcIuWKm1wiXV0sXCI0MVwiLFwiMjVcIixcIjExXCIsXCIzNVwiLFwiNTNcIl0nXG4gICogIOKWtiAgJ1tbXCLlmb9cIiw1LDEzMDkwLFtcIuWPo1wiLFwi5769XCIsXCLkuqBcIixcIuS7jlwiLFwi5Y2BXCJdXSxcIjI1XCIsXCI1NFwiLFwiNDFcIixcIjM0XCIsXCIxMlwiXSdcbiAgKiAg4pa2ICAnW1tcIuWhvlwiLDUsMzgxOCxbXCLkuqBcIixcIuWPo1wiLFwi5a2QXCIsXCLkuLhcIixcIuWcn1wiXV0sXCI0MVwiLFwiMjVcIixcIjUxXCIsXCIzNVwiLFwiMTJcIl0nXG4gICogIOKWtiAgJ1tbXCLloqlcIiw1LDU0NTcsW1wi5ZyfXCIsXCLkuqBcIixcIuWPo1wiLFwi5a2QXCIsXCLlpIpcIl1dLFwiMTJcIixcIjQxXCIsXCIyNVwiLFwiNTFcIixcIjM1XCJdJ1xuICAqICDilrYgICdbW1wi5a2DXCIsNSw3MjI1LFtcIuWls1wiLFwi5LqgXCIsXCLlkIVcIixcIvCggI5cIixcIvCnmIdcIl1dLFwiNTNcIixcIjQxXCIsXCIyNVwiLFwiMTFcIixcIjM1XCJdJ1xuICAqICDilrYgICdbW1wi5a+hXCIsNSwzNDEyLFtcIuWugFwiLFwi5LiGXCIsXCLkuJRcIixcIuWFq1wiLFwi5YiAXCJdXSxcIjQ0XCIsXCIxM1wiLFwiMjVcIixcIjM0XCIsXCI1M1wiXSdcbiAgKiAg4pa2ICAnW1tcIuW3lVwiLDUsMTM1ODYsW1wi5bGxXCIsXCLljYRcIixcIvCggqRcIixcIui+m1wiLFwi5aWzXCJdXSxcIjI1XCIsXCIxMlwiLFwiMzJcIixcIjQxXCIsXCI1M1wiXSdcbiAgKiAg4pa2ICAnW1tcIuaplFwiLDUsMTM4ODMsW1wi5pyoXCIsXCLkuqBcIixcIuWPo1wiLFwi5a2QXCIsXCLlpIpcIl1dLFwiMTJcIixcIjQxXCIsXCIyNVwiLFwiNTFcIixcIjM1XCJdJ1xuICAqICDilrYgICdbW1wi54GCXCIsNSwxMjM0OSxbXCLmsLVcIixcIueIq1wiLFwi572SXCIsXCLuhIJcIixcIuWvuFwiXV0sXCI0NFwiLFwiMzRcIixcIjI1XCIsXCI1MVwiLFwiMTJcIl0nXG4gICogIOKWtiAgJ1tbXCLnuo9cIiw1LDM0MjEsW1wi57O5XCIsXCLlub9cIixcIumHjFwiLFwi5YWrXCIsXCLlnJ9cIl1dLFwiNTVcIixcIjQxXCIsXCIyNVwiLFwiMzRcIixcIjEyXCJdJ1xuICAqICDilrYgICdbW1wi57qVXCIsNSw4ODgyLFtcIuezuVwiLFwi5LqgXCIsXCLlkIVcIixcIvCggI5cIixcIvCnmIdcIl1dLFwiNTVcIixcIjQxXCIsXCIyNVwiLFwiMTFcIixcIjM1XCJdJ1xuICAqICDilrYgICdbW1wi6YS4XCIsNSw4MzkyLFtcIuWNhFwiLFwi572SXCIsXCLlhpZcIixcIuWklVwiLFwi6ZidXCJdXSxcIjEyXCIsXCIyNVwiLFwiNDVcIixcIjM1XCIsXCI1MlwiXSdcbiAgKiAg4pa2ICAnW1tcIumfvVwiLDUsMTAzNzcsW1wi5Lq9XCIsXCLwoIOMXCIsXCLphYlcIixcIueri1wiLFwi5pelXCJdXSxcIjM0XCIsXCI1XCIsXCIxMlwiLFwiNDFcIixcIjI1XCJdJ1xuICAqICDilrYgICdbW1wi6aCAXCIsNSw4Mzg1LFtcIueri1wiLFwi5pelXCIsXCLljYRcIixcIumauVwiLFwi5Y+IXCJdXSxcIjQxXCIsXCIyNVwiLFwiMTJcIixcIjMyXCIsXCI1NFwiXSdcbiAgKiAg4pa2ICAnW1tcIumpkFwiLDUsMTI2NDQsW1wi6aasXCIsXCLkuqBcIixcIuWPo1wiLFwi5a2QXCIsXCLlpIpcIl1dLFwiMTJcIixcIjQxXCIsXCIyNVwiLFwiNTFcIixcIjM1XCJdJ1xuICAqICDilrYgICdbW1wi6aqnXCIsNSw2MDEwLFtcIumprFwiLFwi5LqgXCIsXCLlkIVcIixcIvCggI5cIixcIvCnmIdcIl1dLFwiNTVcIixcIjQxXCIsXCIyNVwiLFwiMTFcIixcIjM1XCJdJ1xuICAjIyNcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICBkYiA/PSBIT0xMRVJJVEgubmV3X2RiICcvVm9sdW1lcy9TdG9yYWdlL3RlbXAvaml6dXJhLWhvbGxlcml0aDInXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBDSFIgPSByZXF1aXJlICcvVm9sdW1lcy9TdG9yYWdlL2lvL2NvZmZlZW5vZGUtY2hyJ1xuICAgIGNocnNfZnJvbV90ZXh0ID0gKCB0ZXh0ICkgLT4gQ0hSLmNocnNfZnJvbV90ZXh0IHRleHQsIGlucHV0OiAneG5jcidcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHByZWZpeCAgPSBbICdwb3MnLCAnZ3VpZGUvbGluZXVwL2xlbmd0aCcsIDUsIF1cbiAgICBpbnB1dCAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIHByZWZpeFxuICAgICMgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAjIGRlY29kZV9yYW5rID0gKCBia2V5ICkgPT5cbiAgICAjICAgWyAuLi4sIHJhbmtfdHh0LCBdID0gQF9zcGxpdF9ia2V5IGJrZXlcbiAgICAjICAgcmV0dXJuIHBhcnNlSW50IHJhbmtfdHh0LCAxMFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgZGVjb2RlX2xpbmV1cCA9ICggZGF0YSApID0+XG4gICAgICBbIC4uLiwgbGluZXVwLCBdID0gZGF0YVxuICAgICAgcmV0dXJuIGNocnNfZnJvbV90ZXh0IGxpbmV1cC5yZXBsYWNlIC9cXHUzMDAwL2csICcnXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICB4bmNyX2Zyb21fdWNociA9ICggdWNociApID0+XG4gICAgICByZXR1cm4gaWYgKCBDSFIuYXNfcnNnIHVjaHIgKSBpcyAndS1wdWEnIHRoZW4gKCBDSFIuYXNfeG5jciB1Y2hyLCBjc2c6ICdqenInICkgZWxzZSB1Y2hyXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpbnB1dFxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAucGlwZSBIT0xMRVJJVEgucmVhZF9zdWIgZGIsICggcGhyYXNlICkgPT5cbiAgICAgICAgWyBfLCBnbHlwaCwgXywgbGluZXVwX2xlbmd0aCwgXSA9IHBocmFzZVxuICAgICAgICAjIGRlYnVnICfCqXhoSGptJywgcnByIHBocmFzZVxuICAgICAgICBzdWJfcHJlZml4ICAgICAgICAgICAgICAgICAgICAgID0gWyAnc3BvJywgZ2x5cGgsICdyYW5rL2NqdCcsIF1cbiAgICAgICAgc3ViX2lucHV0ICAgICAgICAgICAgICAgICAgICAgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBzdWJfcHJlZml4XG4gICAgICAgIHJldHVybiBbIFsgZ2x5cGgsIGxpbmV1cF9sZW5ndGgsIF0sIHN1Yl9pbnB1dCwgXVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAucGlwZSAkICggZGF0YSwgc2VuZCApID0+XG4gICAgICAgIFsgWyBnbHlwaCwgbGluZXVwX2xlbmd0aCwgXSwgWyAuLi4sIHJhbmssIF0sIF0gPSBkYXRhXG4gICAgICAgIHNlbmQgWyBnbHlwaCwgbGluZXVwX2xlbmd0aCwgcmFuaywgXVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAucGlwZSBELiRmaWx0ZXIgKCBbIGdseXBoLCBsaW5ldXBfbGVuZ3RoLCByYW5rLCBdICkgLT4gcmFuayA8IDE1MDAwXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIC5waXBlIEhPTExFUklUSC5yZWFkX3N1YiBkYiwgbWFuZ2xlOiBkZWNvZGVfbGluZXVwLCAoIGRhdGEgKSA9PlxuICAgICAgICBbIGdseXBoLCBsaW5ldXBfbGVuZ3RoLCByYW5rLCBdID0gZGF0YVxuICAgICAgICBzdWJfcHJlZml4ICAgICAgICAgICAgICAgICAgICAgID0gWyAnc3BvJywgZ2x5cGgsICdndWlkZS9saW5ldXAvdWNocicsIF1cbiAgICAgICAgc3ViX2lucHV0ICAgICAgICAgICAgICAgICAgICAgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBzdWJfcHJlZml4XG4gICAgICAgIHJldHVybiBbIFsgZ2x5cGgsIGxpbmV1cF9sZW5ndGgsIHJhbmssIF0sIHN1Yl9pbnB1dCwgXVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAucGlwZSBIT0xMRVJJVEgucmVhZF9zdWIgZGIsICggZGF0YSApID0+XG4gICAgICAgIFsgWyBnbHlwaCwgbGluZXVwX2xlbmd0aCwgcmFuaywgXSwgZ3VpZGVzLCBdICA9IGRhdGFcbiAgICAgICAgY29uZmx1ZW5jZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gRC5jcmVhdGVfdGhyb3VnaHN0cmVhbSgpXG4gICAgICAgIHN0cmVhbV9jb3VudCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IDBcbiAgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgICBmb3IgZ3VpZGUgaW4gZ3VpZGVzXG4gICAgICAgICAgZG8gKCBndWlkZSApID0+XG4gICAgICAgICAgICBndWlkZV94bmNyICAgICAgICA9IHhuY3JfZnJvbV91Y2hyIGd1aWRlXG4gICAgICAgICAgICBzdHJlYW1fY291bnQgICAgICs9ICsxXG4gICAgICAgICAgICBzdWJfcHJlZml4ICAgICAgICA9IFsgJ3NwbycsIGd1aWRlX3huY3IsICdmYWN0b3Ivc2hhcGVjbGFzcy93YmYnLCBdXG4gICAgICAgICAgICBzdWJfaW5wdXQgICAgICAgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBzdWJfcHJlZml4XG4gICAgICAgICAgICBzdWJfaW5wdXQub24gJ2VuZCcsIC0+XG4gICAgICAgICAgICAgIHN0cmVhbV9jb3VudCArPSAtMVxuICAgICAgICAgICAgICBpZiBzdHJlYW1fY291bnQgPCAxXG4gICAgICAgICAgICAgICAgY29uZmx1ZW5jZS5lbmQoKVxuICAgICAgICAgICAgc3ViX2lucHV0XG4gICAgICAgICAgICAgIC5waXBlICQgKCBkYXRhLCBzZW5kICkgPT5cbiAgICAgICAgICAgICAgICBbIC4uLiwgc2hhcGVjbGFzc193YmYsIF0gPSBkYXRhXG4gICAgICAgICAgICAgICAgY29uZmx1ZW5jZS53cml0ZSBzaGFwZWNsYXNzX3diZlxuICAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAgIHJldHVybiBbIFsgZ2x5cGgsIGxpbmV1cF9sZW5ndGgsIHJhbmssIGd1aWRlcywgXSwgY29uZmx1ZW5jZSwgXVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAucGlwZSBELiRmaWx0ZXIgKCBkYXRhICkgPT5cbiAgICAgICAgWyBbIGdseXBoLCBsaW5ldXBfbGVuZ3RoLCByYW5rLCBndWlkZXMsIF0sIHNoYXBlY2xhc3Nlc193YmYuLi4sIF0gPSBkYXRhXG4gICAgICAgIGNvdW50cyA9IFsgMCwgMCwgMCwgMCwgMCwgXVxuICAgICAgICBmb3Igc2hhcGVjbGFzc193YmYgaW4gc2hhcGVjbGFzc2VzX3diZlxuICAgICAgICAgIHNoYXBlY2xhc3NfaWR4ICAgICAgICAgICAgPSAoIHBhcnNlSW50IHNoYXBlY2xhc3Nfd2JmWyAwIF0sIDEwICkgLSAxXG4gICAgICAgICAgY291bnRzWyBzaGFwZWNsYXNzX2lkeCBdICs9ICsxXG4gICAgICAgIHJldHVybiAoIGNvdW50cy5qb2luICcsJyApIGlzICcxLDEsMSwxLDEnXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIC5waXBlICQgKCBkYXRhLCBzZW5kICkgLT4gc2VuZCBKU09OLnN0cmluZ2lmeSBkYXRhXG4gICAgICAucGlwZSBELiRzaG93KClcblxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBzaG93X2VuY29kaW5nX3NhbXBsZSA9IC0+XG4gIGVuY29kaW5nICA9IEhPTExFUklUSC5EVU1QLmVuY29kaW5nc1sgJ2RiY3MyJyBdXG4gIGVuY29kaW5nICA9IEhPTExFUklUSC5EVU1QLmVuY29kaW5nc1sgJ2FsZXBoJyBdXG4gIGVuY29kaW5nICA9IEhPTExFUklUSC5EVU1QLmVuY29kaW5nc1sgJ3JkY3RuJyBdXG4gIHBocmFzZXMgICA9IFtcbiAgICBbICfkuIEnLCAnc3Ryb2tlY291bnQnLCAgICAgMiwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICBbICfkuIknLCAnc3Ryb2tlY291bnQnLCAgICAgMywgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICBbICflpKsnLCAnc3Ryb2tlY291bnQnLCAgICAgNSwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICBbICflnIsnLCAnc3Ryb2tlY291bnQnLCAgICAgMTEsICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICBbICflvaInLCAnc3Ryb2tlY291bnQnLCAgICAgNywgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICBbICfkuIEnLCAnY29tcG9uZW50Y291bnQnLCAgMSwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICBbICfkuIknLCAnY29tcG9uZW50Y291bnQnLCAgMSwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICBbICflpKsnLCAnY29tcG9uZW50Y291bnQnLCAgMSwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICBbICflnIsnLCAnY29tcG9uZW50Y291bnQnLCAgNCwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICBbICflvaInLCAnY29tcG9uZW50Y291bnQnLCAgMiwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICBbICfkuIEnLCAnY29tcG9uZW50cycsICAgICAgWyAn5LiBJywgXSwgICAgICAgICAgICAgICAgICBdXG4gICAgWyAn5LiJJywgJ2NvbXBvbmVudHMnLCAgICAgIFsgJ+S4iScsIF0sICAgICAgICAgICAgICAgICAgXVxuICAgIFsgJ+WkqycsICdjb21wb25lbnRzJywgICAgICBbICflpKsnLCBdLCAgICAgICAgICAgICAgICAgIF1cbiAgICBbICflnIsnLCAnY29tcG9uZW50cycsICAgICAgWyAn5ZuXJywgJ+aIiCcsICflj6MnLCAn5LiAJywgXSwgXVxuICAgIFsgJ+W9oicsICdjb21wb25lbnRzJywgICAgICBbICflvIAnLCAn5b2hJywgXSwgICAgICAgICAgICAgXVxuICAgIF1cbiAgZm9yIFsgc2JqLCBwcmQsIG9iaiwgXSBpbiBwaHJhc2VzXG4gICAga2V5ICAgICAgID0gKCBIT0xMRVJJVEguQ09ERUMuZW5jb2RlIFsgc2JqLCBwcmQsIF0sIClcbiAgICB2YWx1ZSAgICAgPSAoIG5ldyBCdWZmZXIgSlNPTi5zdHJpbmdpZnkgb2JqIClcbiAgICBrZXlfcnByICAgPSAoIGVuY29kaW5nWyBrZXlbIGlkeCBdIF0gZm9yIGlkeCBpbiBbIDAgLi4uIGtleS5sZW5ndGggXSApLmpvaW4gJydcbiAgICB2YWx1ZV9ycHIgPSAoIGVuY29kaW5nWyB2YWx1ZVsgaWR4IF0gXSBmb3IgaWR4IGluIFsgMCAuLi4gdmFsdWUubGVuZ3RoIF0gKS5qb2luICcnXG4gICAgdXJnZSBrZXlfcnByLCAn4pSKJywgdmFsdWVfcnByXG4gIGIgPSBuZXcgQnVmZmVyICfkuIB45LiBeOS4gidcbiAgIyB0ZXh0ID0gbmV3IEJ1ZmZlciAn5LiAJ1xuICAjIHRleHRfcnByID1cbiAgIyBoZWxwIGIsIHRleHRfcnByXG4gIGhlbHAgSE9MTEVSSVRILkRVTVAucnByX29mX2J1ZmZlciBudWxsLCBIT0xMRVJJVEguQ09ERUMuZW5jb2RlIFsgdHJ1ZSwgLTEgLyA3LCBdXG5cbiAgIyBjaHJzID0gW11cbiAgIyBmb3IgY2lkIGluIFsgMCAuLiAyNTUgXVxuICAjICAgY2hycy5wdXNoIFN0cmluZy5mcm9tQ29kZVBvaW50IGNpZFxuICAjICAgY2hycy5wdXNoICdcXG4nIGlmIGNpZCA+IDAgYW5kIGNpZCAlIDMyIGlzIDBcbiAgIyBkZWJ1ZyAnwqlaZ1k0RCcsIGNocnNcbiAgIyBoZWxwIGNocnMuam9pbiAnJ1xuICAjIHVyZ2UgKCBTdHJpbmcuZnJvbUNvZGVQb2ludCBjaWQgZm9yIGNpZCBpbiBbIDB4MjQwMCAuLiAweDI0MjYgXSApLmpvaW4gJydcbiAgIyB1cmdlICggU3RyaW5nLmZyb21Db2RlUG9pbnQgY2lkIGZvciBjaWQgaW4gWyAweDI0YjYgLi4gMHgyNGU5IF0gKS5qb2luICcnXG4gICMgdXJnZSAoIFN0cmluZy5mcm9tQ29kZVBvaW50IGNpZCBmb3IgY2lkIGluIFsgMHhmZjAxIC4uIDB4ZmY2MCBdICkuam9pbiAnJ1xuXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xudW5sZXNzIG1vZHVsZS5wYXJlbnQ/XG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBvcHRpb25zID1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICMgJ3JvdXRlJzogICAgICAgICAgICAgICAgbmpzX3BhdGguam9pbiBfX2Rpcm5hbWUsICcuLi9kYnMvZGVtbydcbiAgICAncm91dGUnOiAgICAgICAgICAgICAgICAnL1ZvbHVtZXMvU3RvcmFnZS9pby9qaXp1cmEtZGF0YXNvdXJjZXMvZGF0YS9sZXZlbGRiJ1xuICAgICMgJ3JvdXRlJzogICAgICAgICAgICAnL3RtcC9sZXZlbGRiJ1xuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGRlYnVnICfCqUFvT0FTJywgb3B0aW9uc1xuICAjIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAjICAgeWllbGQgQGluaXRpYWxpemUgcmVzdW1lXG4gICMgICBkYiA9IG9wdGlvbnNbICdkYicgXVxuICAjICAgQGZpbmRfZ29vZF9rd2ljX3NhbXBsZV9nbHlwaHNfMiBkYlxuICAjIEBjb3B5X2ppenVyYV9kYigpXG4gICMgQGR1bXBfaml6dXJhX2RiKClcbiAgQGZpbmRfZ29vZF9rd2ljX3NhbXBsZV9nbHlwaHNfMigpXG4gICMgQHNob3dfZW5jb2Rpbmdfc2FtcGxlKClcbiAgIyBAY29tcGlsZV9lbmNvZGluZ3MoKVxuXG5cbiJdfQ==