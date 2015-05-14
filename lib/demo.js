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

  "〇〓\n␀␁␂␃␄␅␆␇␈␉␊␋␌␍␎␏␐␑␒␓␔␕␖␗␘␙␚␛␜␝␞␟␠␡␢␣␤␥␦\nⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ\n！＂＃＄％＆＇（）＊＋，－．／０１２３４５６７８９：；＜＝＞？＠ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ［＼］＾＿｀ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ｛｜｝～｟｠\n!\"#$%&'()*+,-./0123456789:;<=>?\n@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_\n`abcdefghijklmnopqrstuvwxyz{|}~\n\n¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿À\nÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßà\náâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ";

  "〓！＂＃＄％＆＇（）＊＋，－．／０１２３４５６７８９：；＜＝＞？\n＠ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ［＼］＾＿\n｀ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ｛｜｝～〓\n〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓\n〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓\n〓ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ〓〓〓〓〓\n〓ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ〓〓〓〓〓\n\n㈀㈁㈂㈃㈄㈅㈆㈇㈈㈉㈊㈋㈌㈍㈎㈏㈐㈑㈒㈓㈔㈕㈖㈗㈘㈙㈚㈛㈜㈝㈞㈟\n㈠㈡㈢㈣㈤㈥㈦㈧㈨㈩㈪㈫㈬㈭㈮㈯㈰㈱㈲㈳㈴㈵㈶㈷㈸㈹㈺㈻㈼㈽㈾㈿\n㉀㉁㉂㉃㉄㉅㉆㉇㉈㉉㉊㉋㉌㉍㉎㉏㉐㉑㉒㉓㉔㉕㉖㉗㉘㉙㉚㉛㉜㉝㉞㉟\n㉠㉡㉢㉣㉤㉥㉦㉧㉨㉩㉪㉫㉬㉭㉮㉯㉰㉱㉲㉳㉴㉵㉶㉷㉸㉹㉺㉻㉼㉽㉾㉿\n㊀㊁㊂㊃㊄㊅㊆㊇㊈㊉㊊㊋㊌㊍㊎㊏㊐㊑㊒㊓㊔㊕㊖㊗㊘㊙㊚㊛㊜㊝㊞㊟\n㊠㊡㊢㊣㊤㊥㊦㊧㊨㊩㊪㊫㊬㊭㊮㊯㊰㊱㊲㊳㊴㊵㊶㊷㊸㊹㊺㊻㊼㊽㊾㊿\n㋀㋁㋂㋃㋄㋅㋆㋇㋈㋉㋊㋋㋌㋍㋎㋏㋐㋑㋒㋓㋔㋕㋖㋗㋘㋙㋚㋛㋜㋝㋞㋟\n㋠㋡㋢㋣㋤㋥㋦㋧㋨㋩㋪㋫㋬㋭㋮㋯㋰㋱㋲㋳㋴㋵㋶㋷㋸㋹㋺㋻㋼㋽㋾㋿\n🈀🈁🈂🈐🈑🈒🈓🈔🈕🈖🈗🈘🈙🈚🈛🈜🈝🈞🈟🈠🈡🈢🈣🈤🈥🈦🈧🈨🈩🈪🈫🈬🈭🈮🈯\n🈰🈱🈲🈳🈴🈵🈶🈷🈸🈹🈺🈻🈼🈽🈾🈿\n🉀🉁🉂🉃🉄🉅🉆🉇🉈🉉🉊🉋🉌🉍🉎🉏\n🉐🉑🉒🉓🉔🉕🉖🉗🉘🉙🉚🉛🉜🉝🉞🉟\n㌀㌁㌂㌃㌄㌅㌆㌇㌈㌉㌊㌋㌌㌍㌎㌏㌐㌑㌒㌓㌔㌕㌖㌗㌘㌙㌚㌛㌜㌝㌞㌟\n㌠㌡㌢㌣㌤㌥㌦㌧㌨㌩㌪㌫㌬㌭㌮㌯㌰㌱㌲㌳㌴㌵㌶㌷㌸㌹㌺㌻㌼㌽㌾㌿\n㍀㍁㍂㍃㍄㍅㍆㍇㍈㍉㍊㍋㍌㍍㍎㍏㍐㍑㍒㍓㍔㍕㍖㍗㍘㍙㍚㍛㍜㍝㍞㍟\n㍠㍡㍢㍣㍤㍥㍦㍧㍨㍩㍪㍫㍬㍭㍮㍯㍰㍱㍲㍳㍴㍵㍶㍷㍸㍹㍺㍻㍼㍽㍾㍿\n㎀㎁㎂㎃㎄㎅㎆㎇㎈㎉㎊㎋㎌㎍㎎㎏㎐㎑㎒㎓㎔㎕㎖㎗㎘㎙㎚㎛㎜㎝㎞㎟\n㎠㎡㎢㎣㎤㎥㎦㎧㎨㎩㎪㎫㎬㎭㎮㎯㎰㎱㎲㎳㎴㎵㎶㎷㎸㎹㎺㎻㎼㎽㎾㎿\n㏀㏁㏂㏃㏄㏅㏆㏇㏈㏉㏊㏋㏌㏍㏎㏏㏐㏑㏒㏓㏔㏕㏖㏗㏘㏙㏚㏛㏜㏝㏞㏟\n㏠㏡㏢㏣㏤㏥㏦㏧㏨㏩㏪㏫㏬㏭㏮㏯㏰㏱㏲㏳㏴㏵㏶㏷㏸㏹㏺㏻㏼㏽㏾㏿\n①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳⑴⑵⑶⑷⑸⑹⑺⑻⑼⑽⑾⑿\n⒀⒁⒂⒃⒄⒅⒆⒇⒈⒉⒊⒋⒌⒍⒎⒏⒐⒑⒒⒓⒔⒕⒖⒗⒘⒙⒚⒛⒜⒝⒞⒟\n⒠⒡⒢⒣⒤⒥⒦⒧⒨⒩⒪⒫⒬⒭⒮⒯⒰⒱⒲⒳⒴⒵ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿ\nⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟ\nⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ⓪⓫⓬⓭⓮⓯⓰⓱⓲⓳⓴⓵⓶⓷⓸⓹⓺⓻⓼⓽⓾⓿\n❶❷❸❹❺❻❼❽❾❿➀➁➂➃➄➅➆➇➈➉➊➋➌➍➎➏➐➑➒➓";

  "∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎\n⚀⚁⚂⚃⚄⚅⚀⚁⚂⚃⚄⚅⚀⚁⚂⚃⚄⚅⚀⚁⚂⚃⚄⚅⚀⚁⚂⚃⚄⚅⚄⚅\nБДИЛЦЧШЭЮƆƋƏƐƔƥƧƸψŐőŒœŊŁłЯɔɘɐɕəɞ\nĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮį\n␣!\"#$%&'()*+,-./0123456789:;<=>?\n@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_\n`abcdefghijklmnopqrstuvwxyz{|}~ω\nΓΔΘΛΞΠΣΦΨΩαβγδεζηθικλμνξπρςστυφχ\nЖ¡¢£¤¥¦§¨©ª«¬Я®¯°±²³´µ¶·¸¹º»¼½¾¿\nÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞß\nàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ";

  this.show_encoding_sample = function() {
    var chrs, cid, i, phrases;
    phrases = [['丁', 'strokecount', 2], ['三', 'strokecount', 3], ['夫', 'strokecount', 5], ['國', 'strokecount', 11], ['形', 'strokecount', 7], ['丁', 'componentcount', 1], ['三', 'componentcount', 1], ['夫', 'componentcount', 1], ['國', 'componentcount', 4], ['形', 'componentcount', 2], ['丁', 'components', ['丁']], ['三', 'components', ['三']], ['夫', 'components', ['夫']], ['國', 'components', ['囗', '戈', '口', '一']], ['形', 'components', ['开', '彡']]];
    chrs = [];
    for (cid = i = 0; i <= 255; cid = ++i) {
      chrs.push(String.fromCodePoint(cid));
      if (cid > 0 && cid % 32 === 0) {
        chrs.push('\n');
      }
    }
    debug('©ZgY4D', chrs);
    help(chrs.join(''));
    urge(((function() {
      var j, results;
      results = [];
      for (cid = j = 0x2400; j <= 9254; cid = ++j) {
        results.push(String.fromCodePoint(cid));
      }
      return results;
    })()).join(''));
    urge(((function() {
      var j, results;
      results = [];
      for (cid = j = 0x24b6; j <= 9449; cid = ++j) {
        results.push(String.fromCodePoint(cid));
      }
      return results;
    })()).join(''));
    return urge(((function() {
      var j, results;
      results = [];
      for (cid = j = 0xff01; j <= 65376; cid = ++j) {
        results.push(String.fromCodePoint(cid));
      }
      return results;
    })()).join(''));
  };

  if (module.parent == null) {
    options = {
      'route': '/Volumes/Storage/io/jizura-datasources/data/leveldb'
    };
    debug('©AoOAS', options);
    this.show_encoding_sample();
  }

}).call(this);

//# sourceMappingURL=data:application/json;base64,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LFFBQU4sRUFBZ0IsT0FBaEIsQ0FOQSxDQUFBO0FBQUEsSUFjQSxJQUFDLENBQUEsb0JBQUQsQ0FBQSxDQWRBLENBSEY7R0FoakJBO0FBQUEiLCJmaWxlIjoiZGVtby5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIlxuXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xubmpzX3BhdGggICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ3BhdGgnXG4jIG5qc19mcyAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdmcydcbmpvaW4gICAgICAgICAgICAgICAgICAgICAgPSBuanNfcGF0aC5qb2luXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkNORCAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdjbmQnXG5ycHIgICAgICAgICAgICAgICAgICAgICAgID0gQ05ELnJwclxuYmFkZ2UgICAgICAgICAgICAgICAgICAgICA9ICdIT0xMRVJJVEgvdGVzdCdcbmxvZyAgICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAncGxhaW4nLCAgICAgYmFkZ2VcbmluZm8gICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnaW5mbycsICAgICAgYmFkZ2VcbndoaXNwZXIgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnd2hpc3BlcicsICAgYmFkZ2VcbmFsZXJ0ICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnYWxlcnQnLCAgICAgYmFkZ2VcbmRlYnVnICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnZGVidWcnLCAgICAgYmFkZ2Vcbndhcm4gICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnd2FybicsICAgICAgYmFkZ2VcbmhlbHAgICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnaGVscCcsICAgICAgYmFkZ2VcbnVyZ2UgICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAndXJnZScsICAgICAgYmFkZ2VcbmVjaG8gICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZWNoby5iaW5kIENORFxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5zdXNwZW5kICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnY29mZmVlbm9kZS1zdXNwZW5kJ1xuc3RlcCAgICAgICAgICAgICAgICAgICAgICA9IHN1c3BlbmQuc3RlcFxuYWZ0ZXIgICAgICAgICAgICAgICAgICAgICA9IHN1c3BlbmQuYWZ0ZXJcbmV2ZW50dWFsbHkgICAgICAgICAgICAgICAgPSBzdXNwZW5kLmV2ZW50dWFsbHlcbmltbWVkaWF0ZWx5ICAgICAgICAgICAgICAgPSBzdXNwZW5kLmltbWVkaWF0ZWx5XG5yZXBlYXRfaW1tZWRpYXRlbHkgICAgICAgID0gc3VzcGVuZC5yZXBlYXRfaW1tZWRpYXRlbHlcbmV2ZXJ5ICAgICAgICAgICAgICAgICAgICAgPSBzdXNwZW5kLmV2ZXJ5XG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgQllURVdJU0UgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2J5dGV3aXNlJ1xuIyB0aHJvdWdoICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAndGhyb3VnaDInXG4jIExldmVsQmF0Y2ggICAgICAgICAgICAgICAgPSByZXF1aXJlICdsZXZlbC1iYXRjaC1zdHJlYW0nXG4jIEJhdGNoU3RyZWFtICAgICAgICAgICAgICAgPSByZXF1aXJlICdiYXRjaC1zdHJlYW0nXG4jIHBhcmFsbGVsICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdjb25jdXJyZW50LXdyaXRhYmxlJ1xuRCAgICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ3BpcGVkcmVhbXMyJ1xuJCAgICAgICAgICAgICAgICAgICAgICAgICA9IEQucmVtaXQuYmluZCBEXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbm5ld19kYiAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdsZXZlbCdcbiMgbmV3X2xldmVsZ3JhcGggICAgICAgICAgICA9IHJlcXVpcmUgJ2xldmVsZ3JhcGgnXG4jIGRiICAgICAgICAgICAgICAgICAgICAgICAgPSBuZXdfbGV2ZWxncmFwaCAnL3RtcC9sZXZlbGdyYXBoJ1xuSE9MTEVSSVRIICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vbWFpbidcbsaSICAgICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmZvcm1hdF9udW1iZXIuYmluZCBDTkRcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxub3B0aW9ucyAgICAgICAgICAgICAgICAgICA9IG51bGxcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX21pc2ZpdCAgICAgICAgICA9IFN5bWJvbCAnbWlzZml0J1xuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyBQSVBFRFJFQU1TXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkQubmV3X2luZGV4ZXIgPSAoIGlkeCA9IDAgKSAtPiAoIGRhdGEgKSA9PiBbIGlkeCsrLCBkYXRhLCBdXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBpbml0aWFsaXplID0gKCBoYW5kbGVyICkgLT5cbiAgb3B0aW9uc1sgJ2RiJyBdID0gSE9MTEVSSVRILm5ld19kYiBvcHRpb25zWyAncm91dGUnIF1cbiAgaGFuZGxlciBudWxsXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQG1haW4gPSAoIGZpcnN0X3F1ZXJ5ICkgLT5cbiAgZmlyc3RfcXVlcnkgPz0geyBndGU6ICdvc3xyYW5rL2NqdDowJywgbHRlOiAnb3N8cmFuay9janQ6OScsIH1cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgeWllbGQgQGluaXRpYWxpemUgcmVzdW1lXG4gICAgZGIgPSBvcHRpb25zWyAnZGInIF1cbiAgICBDSFIgPSByZXF1aXJlICcvVm9sdW1lcy9TdG9yYWdlL2lvL2NvZmZlZW5vZGUtY2hyJ1xuICAgIGNvdW50X2NocnMgPSAoIHRleHQgKSAtPiAoIENIUi5jaHJzX2Zyb21fdGV4dCB0ZXh0LCBpbnB1dDogJ3huY3InICkubGVuZ3RoXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpbnB1dCA9IGRiWyAnJXNlbGYnIF0uY3JlYXRlS2V5U3RyZWFtIGZpcnN0X3F1ZXJ5XG4gICAgIyBrID0gXCJzb3xnbHlwaDrnubx8cG9kOlwiXG4gICAgIyBpbnB1dCA9IGRiWyAnJXNlbGYnIF0uY3JlYXRlS2V5U3RyZWFtIGRiLCB7IGd0ZTogaywgbHRlOiBrICsgJ1xcdWZmZmYnIH1cbiAgICAjIGRlYnVnICfCqWNXOHRLJywgSE9MTEVSSVRILm5ld19rZXkgZGIsICdvcycsICdyYW5rL2NqdCcsICcwMDAwMCdcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICMjIyBUQUlOVCBXZSBjYW4gY3VycmVudGx5IG5vdCB1c2UgYEhPTExFUklUSDIucmVhZF9zdWJgIGJlY2F1c2UgSE9MTEVSSVRIMiBhc3N1bWVzIGEga2V5LW9ubHlcbiAgICBEQiB0aGF0IHVzZXMgYmluYXJ5IGVuY29kaW5nIHdpdGggYSBjdXN0b20gaHR0cHM6Ly9naXRodWIuY29tL2RlYW5sYW5kb2x0L2J5dGV3aXNlIGxheWVyOyB0aGUgY3VycmVudFxuICAgIEppenVyYSBEQiB2ZXJzaW9uIHVzZXMgVVRGLTggc3RyaW5ncyBhbmQgaXMgYSBrZXkvdmFsdWUgREIuICMjI1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaW5wdXRcbiAgICAgIC5waXBlIEBfJHNwbGl0X2JrZXkoKVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAjIC5waXBlIEhPTExFUklUSC5yZWFkX3N1YiBkYiwgaW5kZXhlZDogeWVzLCAoIGtleSApID0+XG4gICAgICAucGlwZSBAcmVhZF9zdWIgZGIsIGluZGV4ZWQ6IHllcywgKCBrZXkgKSA9PlxuICAgICAgICBbIHB0LCBvaywgcmFuaywgc2ssIGdseXBoLCBdID0ga2V5XG4gICAgICAgIHN1Yl9rZXkgPSBcInNvfGdseXBoOiN7Z2x5cGh9fHBvZDpcIlxuICAgICAgICByZXR1cm4gZGJbICclc2VsZicgXS5jcmVhdGVWYWx1ZVN0cmVhbSB7IGd0ZTogc3ViX2tleSwgbHRlOiBzdWJfa2V5ICsgJ1xcdWZmZmYnIH1cbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgLnBpcGUgRC4kZGVuc29ydCAwLCAwLCB0cnVlXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIC5waXBlICQgKCBbIGlkeCwgWyBwb2QsIF0sIF0sIHNlbmQgKSA9PlxuICAgICAgICBkZWJ1ZyAnwqlqZDVjRScsIHBvZFxuICAgICAgICB1bmxlc3MgcG9kWyAnc3Ryb2tlb3JkZXIvc2hvcnQnICBdP1xuICAgICAgICAgIHdhcm4gJ8KpOVlYb3EnLCAgcG9kXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBnbHlwaCAgICAgICA9IHBvZFsgJ2dseXBoL3VjaHInICAgICAgICAgXVxuICAgICAgICAgIHN0cm9rZW9yZGVyID0gcG9kWyAnc3Ryb2tlb3JkZXIvc2hvcnQnICBdWyAwIF0ubGVuZ3RoXG4gICAgICAgICAgbGluZXVwICAgICAgPSBwb2RbICdndWlkZS9saW5ldXAvdWNocicgIF0ucmVwbGFjZSAvXFx1MzAwMC9nLCAnJ1xuICAgICAgICAgIHNlbmQgWyBnbHlwaCwgc3Ryb2tlb3JkZXIsIGxpbmV1cCwgXVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAucGlwZSAkICggWyBnbHlwaCwgc3Ryb2tlb3JkZXIsIGxpbmV1cCwgXSwgc2VuZCApID0+XG4gICAgICAgIHNlbmQgWyBnbHlwaCwgc3Ryb2tlb3JkZXIsIGNvdW50X2NocnMgbGluZXVwLCBdXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIC5waXBlIEQuJHNvcnQgKCBhLCBiICkgLT5cbiAgICAgICAgaWR4ID0gMVxuICAgICAgICByZXR1cm4gKzEgaWYgYVsgaWR4IF0gPiBiWyBpZHggXVxuICAgICAgICByZXR1cm4gLTEgaWYgYVsgaWR4IF0gPCBiWyBpZHggXVxuICAgICAgICByZXR1cm4gIDBcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgLnBpcGUgRC4kc2hvdygpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF8kc3BsaXRfYmtleSA9IC0+ICQgKCBia2V5LCBzZW5kICkgPT4gc2VuZCBAX3NwbGl0X2JrZXkgYmtleVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfc3BsaXRfYmtleSA9ICggYmtleSApIC0+XG4gIFIgPSBia2V5LnRvU3RyaW5nICd1dGYtOCdcbiAgUiA9ICggUi5zcGxpdCAnfCcgKVsgLi4gMiBdXG4gIFIgPSBbIFJbIDAgXSwgKCBSWyAxIF0uc3BsaXQgJzonICkuLi4sICggUlsgMiBdLnNwbGl0ICc6JyApLi4uLCBdXG4gIHJldHVybiBSXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF8kc3BsaXRfc29fYmtleSA9IC0+ICQgKCBia2V5LCBzZW5kICkgPT4gc2VuZCBAX3NwbGl0X3NvX2JrZXkgYmtleVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfc3BsaXRfc29fYmtleSA9ICggYmtleSApIC0+XG4gIFIgICAgICAgPSBia2V5LnRvU3RyaW5nICd1dGYtOCdcbiAgUiAgICAgICA9IFIuc3BsaXQgJ3wnXG4gIGlkeF90eHQgPSBSWyAzIF1cbiAgUiAgICAgICA9IFsgKCBSWyAxIF0uc3BsaXQgJzonIClbIDEgXSwgKCBSWyAyIF0uc3BsaXQgJzonICkuLi4sIF1cbiAgUi5wdXNoICggcGFyc2VJbnQgaWR4X3R4dCwgMTDCoCkgaWYgaWR4X3R4dD8gYW5kIGlkeF90eHQubGVuZ3RoID4gMFxuICByZXR1cm4gUlxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfbHRlX2Zyb21fZ3RlID0gKCBndGUgKSAtPlxuICBSID0gbmV3IEJ1ZmZlciAoIGxhc3RfaWR4ID0gQnVmZmVyLmJ5dGVMZW5ndGggZ3RlICkgKyAxXG4gIFIud3JpdGUgZ3RlXG4gIFJbIGxhc3RfaWR4IF0gPSAweGZmXG4gIHJldHVybiBSXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQCRsaW5ldXBfZnJvbV9nbHlwaCA9ICggZGIgKSAtPlxuICBzZXR0aW5ncyA9XG4gICAgaW5kZXhlZDogIG5vXG4gICAgc2luZ2xlOiAgIHllc1xuICByZXR1cm4gQHJlYWRfc3ViIGRiLCBzZXR0aW5ncywgKCBnbHlwaCApID0+XG4gICAgbHRlID0gXCJzb3xnbHlwaDoje2dseXBofXxndWlkZS9saW5ldXAvdWNocjpcIlxuICAgIHN1Yl9pbnB1dCA9IGRiWyAnJXNlbGYnIF0uY3JlYXRlS2V5U3RyZWFtIHsgZ3RlOiBsdGUsIGx0ZTogQF9sdGVfZnJvbV9ndGUgbHRlLCB9XG4gICAgcmV0dXJuIHN1Yl9pbnB1dFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkAkc2hhcGVjbGFzc193YmZfZnJvbV9nbHlwaF9hbmRfbGluZXVwID0gKCBkYiApIC0+XG4gICMjIyBUQUlOVCB3cm9uZyAjIyNcbiAgc2V0dGluZ3MgPVxuICAgIGluZGV4ZWQ6ICBub1xuICAgIHNpbmdsZTogICB5ZXNcbiAgcmV0dXJuIEByZWFkX3N1YiBkYiwgc2V0dGluZ3MsICggWyBnbHlwaCwgbGluZXVwX2dseXBocywgXSApID0+XG4gICAgZm9yIGxpbmV1cF9nbHlwaCBpbiBsaW5ldXBfZ2x5cGhzXG4gICAgICBkbyAoIGxpbmV1cF9nbHlwaCApID0+XG4gICAgICAgIGd0ZSA9IFwic298Z2x5cGg6I3tsaW5ldXBfZ2x5cGh9fGZhY3Rvci9zdHJva2VjbGFzcy93YmY6XCJcbiAgICAgICAgc3ViX2lucHV0ID0gZGJbICclc2VsZicgXS5jcmVhdGVLZXlTdHJlYW0geyBndGU6IGd0ZSwgbHRlOiBAX2x0ZV9mcm9tX2d0ZSBndGUsIH1cbiAgICAgICAgcmV0dXJuIHN1Yl9pbnB1dFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkhPTExFUklUSC4kcGlja19zdWJqZWN0ID0gLT5cbiAgcmV0dXJuICQgKCBsa2V5LCBzZW5kICkgPT5cbiAgICBbIHB0LCBfLCB2MCwgXywgdjEsIF0gPSBsa2V5XG4gICAgc2VuZCBpZiBwdCBpcyAnc28nIHRoZW4gdjAgZWxzZSB2MVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkhPTExFUklUSC4kcGlja19vYmplY3QgPSAtPlxuICByZXR1cm4gJCAoIGxrZXksIHNlbmQgKSA9PlxuICAgIFsgcHQsIF8sIHYwLCBfLCB2MSwgXSA9IGxrZXlcbiAgICBzZW5kIGlmIHB0IGlzICdzbycgdGhlbiB2MSBlbHNlIHYwXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuSE9MTEVSSVRILiRwaWNrX3ZhbHVlcyA9IC0+XG4gIHJldHVybiAkICggbGtleSwgc2VuZCApID0+XG4gICAgWyBwdCwgXywgdjAsIF8sIHYxLCBdID0gbGtleVxuICAgIHNlbmQgaWYgcHQgaXMgJ3NvJyB0aGVuIFsgdjAsIHYxLCBdIGVsc2UgWyB2MSwgdjAsIF1cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AY29weV9qaXp1cmFfZGIgPSAtPlxuICBkc19vcHRpb25zICA9IHJlcXVpcmUgJy9Wb2x1bWVzL1N0b3JhZ2UvaW8vaml6dXJhLWRhdGFzb3VyY2VzL29wdGlvbnMnXG4gIHNvdXJjZV9kYiAgID0gSE9MTEVSSVRILm5ld19kYiBvcHRpb25zWyAncm91dGUnIF1cbiAgdGFyZ2V0X2RiICAgPSBIT0xMRVJJVEgubmV3X2RiICcvVm9sdW1lcy9TdG9yYWdlL3RlbXAvaml6dXJhLWhvbGxlcml0aDInXG4gIGd0ZSAgICAgICAgID0gJ3NvfCdcbiAgIyBndGUgICAgICAgICA9ICdzb3xnbHlwaDrwpIqCJyAjICEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhXG4gIGx0ZSAgICAgICAgID0gQF9sdGVfZnJvbV9ndGUgZ3RlXG4gIGlucHV0ICAgICAgID0gc291cmNlX2RiWyAnJXNlbGYnIF0uY3JlYXRlS2V5U3RyZWFtIHsgZ3RlLCBsdGUsIH1cbiAgYmF0Y2hfc2l6ZSAgPSAxMDAwMFxuICBvdXRwdXQgICAgICA9IEhPTExFUklUSC4kd3JpdGUgdGFyZ2V0X2RiLCBiYXRjaF9zaXplXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgaW5wdXRcbiAgICAucGlwZSBELiRjb3VudCAoIGNvdW50ICkgLT4gaGVscCBcInJlYWQgI3tjb3VudH0ga2V5c1wiXG4gICAgLnBpcGUgQF8kc3BsaXRfc29fYmtleSgpXG4gICAgIyAucGlwZSAkICgga2V5LCBzZW5kICkgPT5cbiAgICAjICAgIyMjICEhISEhICMjI1xuICAgICMgICBbIGdseXBoLCBwcmQsIG9iaiwgaWR4LCBdID0ga2V5XG4gICAgIyAgIHNlbmQga2V5IGlmIGdseXBoIGluIFsgJ+S4rScsICflnIsnLCAn55qHJywgJ+W4nScsIF1cbiAgICAucGlwZSAkICgga2V5LCBzZW5kICkgPT5cbiAgICAgIFsgZ2x5cGgsIHByZCwgb2JqLCBpZHgsIF0gPSBrZXlcbiAgICAgIHNlbmQga2V5IHVubGVzcyBwcmQgaXMgJ3BvZCdcbiAgICAucGlwZSBELiRjb3VudCAoIGNvdW50ICkgLT4gaGVscCBcImtlcHQgI3tjb3VudH0gZW50cmllc1wiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAucGlwZSBkbyA9PlxuICAgICAgYnVmZmVyICAgICAgPSBudWxsXG4gICAgICBtZW1vICAgICAgICA9IG51bGxcbiAgICAgIGxhc3Rfc3AgICAgID0gbnVsbFxuICAgICAgIyB3aXRoaW5fbGlzdCA9IG5vXG4gICAgICByZXR1cm4gJCAoIGtleSwgc2VuZCApID0+XG4gICAgICAgIFsgc2JqLCBwcmQsIG9iaiwgaWR4LCBdID0ga2V5XG4gICAgICAgIGlmIGlkeD9cbiAgICAgICAgICBzcCA9IFwiI3tzYmp9fCN7cHJkfVwiXG4gICAgICAgICAgaWYgc3AgaXMgbGFzdF9zcFxuICAgICAgICAgICAgYnVmZmVyWyBpZHggXSA9IG9ialxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHNlbmQgWyBtZW1vLi4uLCBidWZmZXIsIF0gaWYgYnVmZmVyP1xuICAgICAgICAgICAgYnVmZmVyICAgICAgICA9IFtdXG4gICAgICAgICAgICBidWZmZXJbIGlkeCBdID0gb2JqXG4gICAgICAgICAgICBtZW1vICAgICAgICAgID0gWyBzYmosIHByZCwgXVxuICAgICAgICAgICAgbGFzdF9zcCAgICAgICA9IHNwXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBzZW5kIFsgc2JqLCBwcmQsIG9iaiwgXVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgLnBpcGUgJCAoIFsgc2JqLCBwcmQsIG9iaiwgXSwgc2VuZCApID0+XG4gICAgICAjIyMgQ29tcGFjdGlmeSBzcGFyc2UgbGlzdHMgc28gYWxsIGB1bmRlZmluZWRgIGVsZW1lbnRzIGFyZSByZW1vdmVkOyB3YXJuIGFib3V0IHRoaXMgIyMjXG4gICAgICBpZiAoIENORC50eXBlX29mIG9iaiApIGlzICdsaXN0J1xuICAgICAgICBuZXdfb2JqID0gKCBlbGVtZW50IGZvciBlbGVtZW50IGluIG9iaiB3aGVuIGVsZW1lbnQgaXNudCB1bmRlZmluZWQgKVxuICAgICAgICBpZiBvYmoubGVuZ3RoIGlzbnQgbmV3X29iai5sZW5ndGhcbiAgICAgICAgICB3YXJuIFwicGhyYXNlICN7cnByIFsgc2JqLCBwcmQsIG9iaiwgXX0gY29udGFpbmVkIHVuZGVmaW5lZCBlbGVtZW50czsgY29tcGFjdGlmaWVkXCJcbiAgICAgICAgb2JqID0gbmV3X29ialxuICAgICAgc2VuZCBbIHNiaiwgcHJkLCBvYmosIF1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICMgLnBpcGUgRC4kc2hvdygpXG4gICAgLnBpcGUgJCAoIFsgc2JqLCBwcmQsIG9iaiwgXSwgc2VuZCApID0+XG4gICAgICAjIyMgVHlwZSBDYXN0aW5nICMjI1xuICAgICAgdHlwZV9kZXNjcmlwdGlvbiA9IGRzX29wdGlvbnNbICdzY2hlbWEnIF1bIHByZCBdXG4gICAgICB1bmxlc3MgdHlwZV9kZXNjcmlwdGlvbj9cbiAgICAgICAgd2FybiBcIm5vIHR5cGUgZGVzY3JpcHRpb24gZm9yIHByZWRpY2F0ZSAje3JwciBwcmR9XCJcbiAgICAgIGVsc2VcbiAgICAgICAgc3dpdGNoIHR5cGUgPSB0eXBlX2Rlc2NyaXB0aW9uWyAndHlwZScgXVxuICAgICAgICAgIHdoZW4gJ2ludCdcbiAgICAgICAgICAgIG9iaiA9IHBhcnNlSW50IG9iaiwgMTBcbiAgICAgICAgICB3aGVuICd0ZXh0J1xuICAgICAgICAgICAgIyMjIFRBSU5UIHdlIGhhdmUgbm8gYm9vbGVhbnMgY29uZmlndXJlZCAjIyNcbiAgICAgICAgICAgIGlmICAgICAgb2JqIGlzICd0cnVlJyAgIHRoZW4gb2JqID0gdHJ1ZVxuICAgICAgICAgICAgZWxzZSBpZiBvYmogaXMgJ2ZhbHNlJyAgdGhlbiBvYmogPSBmYWxzZVxuICAgICAgc2VuZCBbIHNiaiwgcHJkLCBvYmosIF1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIC5waXBlIGRvID0+XG4gICAgICBjb3VudCA9IDBcbiAgICAgIHJldHVybiAkICggcGhyYXNlLCBzZW5kICkgPT5cbiAgICAgICAgY291bnQgKz0gMVxuICAgICAgICAjICEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhIVxuICAgICAgICAjIGlmIGNvdW50ICUgMTAwMDAgaXMgMFxuICAgICAgICAjICAgZWNobyBjb3VudCwgcGhyYXNlXG4gICAgICAgIHNlbmQgcGhyYXNlXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAucGlwZSBvdXRwdXRcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AZHVtcF9qaXp1cmFfZGIgPSAtPlxuICBzb3VyY2VfZGIgICA9IEhPTExFUklUSC5uZXdfZGIgJy9Wb2x1bWVzL1N0b3JhZ2UvdGVtcC9qaXp1cmEtaG9sbGVyaXRoMidcbiAgcHJlZml4ICAgICAgPSBbICdzcG8nLCAn8KGPoCcsIF1cbiAgcHJlZml4ICAgICAgPSBbICdzcG8nLCAn45SwJywgXVxuICBpbnB1dCAgICAgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIHNvdXJjZV9kYiwgcHJlZml4XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgaW5wdXRcbiAgICAucGlwZSBELiRjb3VudCAoIGNvdW50ICkgLT4gaGVscCBcInJlYWQgI3tjb3VudH0ga2V5c1wiXG4gICAgLnBpcGUgJCAoIGRhdGEsIHNlbmQgKSA9PiBzZW5kIEpTT04uc3RyaW5naWZ5IGRhdGFcbiAgICAucGlwZSBELiRzaG93KClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIyMgdmVyc2lvbiBmb3IgSG9sbGVyaXRoMSBEQnMgIyMjXG5AZmluZF9nb29kX2t3aWNfc2FtcGxlX2dseXBoc18xID0gKCBkYiApIC0+XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgdW5sZXNzIGRiP1xuICAgICAgeWllbGQgQGluaXRpYWxpemUgcmVzdW1lXG4gICAgICBkYiA9IG9wdGlvbnNbICdkYicgXVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgQ0hSID0gcmVxdWlyZSAnL1ZvbHVtZXMvU3RvcmFnZS9pby9jb2ZmZWVub2RlLWNocidcbiAgICBjaHJzX2Zyb21fdGV4dCA9ICggdGV4dCApIC0+IENIUi5jaHJzX2Zyb21fdGV4dCB0ZXh0LCBpbnB1dDogJ3huY3InXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBndGUgICAgID0gJ29zfGd1aWRlL2xpbmV1cC9sZW5ndGg6MDUnXG4gICAgbHRlICAgICA9IEBfbHRlX2Zyb21fZ3RlIGd0ZVxuICAgIGlucHV0ICAgPSBkYlsgJyVzZWxmJyBdLmNyZWF0ZUtleVN0cmVhbSB7IGd0ZTogZ3RlLCBsdGU6IGx0ZSwgfVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgZGVjb2RlX3JhbmsgPSAoIGJrZXkgKSA9PlxuICAgICAgWyAuLi4sIHJhbmtfdHh0LCBdID0gQF9zcGxpdF9ia2V5IGJrZXlcbiAgICAgIHJldHVybiBwYXJzZUludCByYW5rX3R4dCwgMTBcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGRlY29kZV9saW5ldXAgPSAoIGJrZXkgKSA9PlxuICAgICAgWyAuLi4sIGxpbmV1cCwgXSA9IEBfc3BsaXRfYmtleSBia2V5XG4gICAgICBsaW5ldXAgPSBsaW5ldXAucmVwbGFjZSAvXFx1MzAwMC9nLCAnJ1xuICAgICAgcmV0dXJuIGNocnNfZnJvbV90ZXh0IGxpbmV1cFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgeG5jcl9mcm9tX3VjaHIgPSAoIHVjaHIgKSA9PlxuICAgICAgcmV0dXJuIGlmICggQ0hSLmFzX3JzZyB1Y2hyICkgaXMgJ3UtcHVhJyB0aGVuICggQ0hSLmFzX3huY3IgdWNociwgY3NnOiAnanpyJyApIGVsc2UgdWNoclxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaW5wdXRcbiAgICAgIC5waXBlIEBfJHNwbGl0X2JrZXkoKVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAucGlwZSBIT0xMRVJJVEgucmVhZF9zdWIgZGIsIG1hbmdsZTogZGVjb2RlX3JhbmssICggcGhyYXNlICkgPT5cbiAgICAgICAgWyAuLi4sIGdseXBoLCBdICAgICAgICAgICA9IHBocmFzZVxuICAgICAgICBzdWJfZ3RlICAgICA9IFwic298Z2x5cGg6I3tnbHlwaH18cmFuay9janQ6XCJcbiAgICAgICAgc3ViX2x0ZSAgICAgPSBAX2x0ZV9mcm9tX2d0ZSBzdWJfZ3RlXG4gICAgICAgIHN1Yl9pbnB1dCAgID0gZGJbICclc2VsZicgXS5jcmVhdGVLZXlTdHJlYW0geyBndGU6IHN1Yl9ndGUsIGx0ZTogc3ViX2x0ZSwgfVxuICAgICAgICByZXR1cm4gWyBnbHlwaCwgc3ViX2lucHV0LCBdXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIC5waXBlIEQuJGZpbHRlciAoIFsgZ2x5cGgsIHJhbmssIF0gKSAtPiByYW5rIDwgMTUwMFxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAucGlwZSBIT0xMRVJJVEgucmVhZF9zdWIgZGIsIG1hbmdsZTogZGVjb2RlX2xpbmV1cCwgKCByZWNvcmQgKSA9PlxuICAgICAgICBbIGdseXBoLCByYW5rLCBdICA9IHJlY29yZFxuICAgICAgICBzdWJfZ3RlICAgICAgICAgICA9IFwic298Z2x5cGg6I3tnbHlwaH18Z3VpZGUvbGluZXVwL3VjaHI6XCJcbiAgICAgICAgc3ViX2x0ZSAgICAgICAgICAgPSBAX2x0ZV9mcm9tX2d0ZSBzdWJfZ3RlXG4gICAgICAgIHN1Yl9pbnB1dCAgICAgICAgID0gZGJbICclc2VsZicgXS5jcmVhdGVLZXlTdHJlYW0geyBndGU6IHN1Yl9ndGUsIGx0ZTogc3ViX2x0ZSwgfVxuICAgICAgICByZXR1cm4gWyBbIGdseXBoLCByYW5rLCBdLCBzdWJfaW5wdXQsIF1cbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgLnBpcGUgSE9MTEVSSVRILnJlYWRfc3ViIGRiLCAoIHJlY29yZCApID0+XG4gICAgICAgIFsgWyBnbHlwaCwgcmFuaywgXSwgZ3VpZGVzLCBdID0gcmVjb3JkXG4gICAgICAgIGNvbmZsdWVuY2UgICAgICAgICAgICAgICAgICAgID0gRC5jcmVhdGVfdGhyb3VnaHN0cmVhbSgpXG4gICAgICAgIHN0cmVhbV9jb3VudCAgICAgICAgICAgICAgICAgID0gMFxuICAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAgIGZvciBndWlkZSBpbiBndWlkZXNcbiAgICAgICAgICBkbyAoIGd1aWRlICkgPT5cbiAgICAgICAgICAgIGd1aWRlX3huY3IgICAgICAgID0geG5jcl9mcm9tX3VjaHIgZ3VpZGVcbiAgICAgICAgICAgIHN0cmVhbV9jb3VudCAgICAgKz0gKzFcbiAgICAgICAgICAgIHN1Yl9ndGUgICAgICAgICAgID0gXCJzb3xnbHlwaDoje2d1aWRlX3huY3J9fGZhY3Rvci9zaGFwZWNsYXNzL3diZjpcIlxuICAgICAgICAgICAgc3ViX2x0ZSAgICAgICAgICAgPSBAX2x0ZV9mcm9tX2d0ZSBzdWJfZ3RlXG4gICAgICAgICAgICBzdWJfaW5wdXQgICAgICAgICA9IGRiWyAnJXNlbGYnIF0uY3JlYXRlS2V5U3RyZWFtIHsgZ3RlOiBzdWJfZ3RlLCBsdGU6IHN1Yl9sdGUsIH1cbiAgICAgICAgICAgIHN1Yl9pbnB1dC5vbiAnZW5kJywgLT5cbiAgICAgICAgICAgICAgc3RyZWFtX2NvdW50ICs9IC0xXG4gICAgICAgICAgICAgIGlmIHN0cmVhbV9jb3VudCA8IDFcbiAgICAgICAgICAgICAgICBjb25mbHVlbmNlLmVuZCgpXG4gICAgICAgICAgICBzdWJfaW5wdXRcbiAgICAgICAgICAgICAgLnBpcGUgQF8kc3BsaXRfYmtleSgpXG4gICAgICAgICAgICAgIC5waXBlICQgKCBkYXRhLCBzZW5kICkgPT5cbiAgICAgICAgICAgICAgICBbIC4uLiwgc2hhcGVjbGFzc193YmYsIF0gPSBkYXRhXG4gICAgICAgICAgICAgICAgY29uZmx1ZW5jZS53cml0ZSBbIGd1aWRlLCBzaGFwZWNsYXNzX3diZiwgXVxuICAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAgIHJldHVybiBbIFsgZ2x5cGgsIHJhbmssIGd1aWRlcywgXSwgY29uZmx1ZW5jZSwgXVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAucGlwZSAkICggZGF0YSwgc2VuZCApIC0+IHNlbmQgSlNPTi5zdHJpbmdpZnkgZGF0YVxuICAgICAgLnBpcGUgRC4kc2hvdygpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyMjIHZlcnNpb24gZm9yIEhvbGxlcml0aDIgREJzICMjI1xuQGZpbmRfZ29vZF9rd2ljX3NhbXBsZV9nbHlwaHNfMiA9ICggZGIgKSAtPlxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIGRiID89IEhPTExFUklUSC5uZXdfZGIgJy9Wb2x1bWVzL1N0b3JhZ2UvdGVtcC9qaXp1cmEtaG9sbGVyaXRoMidcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIENIUiA9IHJlcXVpcmUgJy9Wb2x1bWVzL1N0b3JhZ2UvaW8vY29mZmVlbm9kZS1jaHInXG4gICAgY2hyc19mcm9tX3RleHQgPSAoIHRleHQgKSAtPiBDSFIuY2hyc19mcm9tX3RleHQgdGV4dCwgaW5wdXQ6ICd4bmNyJ1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcHJlZml4ICA9IFsgJ3BvcycsICdndWlkZS9saW5ldXAvbGVuZ3RoJywgNSwgXVxuICAgIGlucHV0ICAgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgcHJlZml4XG4gICAgIyAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICMgZGVjb2RlX3JhbmsgPSAoIGJrZXkgKSA9PlxuICAgICMgICBbIC4uLiwgcmFua190eHQsIF0gPSBAX3NwbGl0X2JrZXkgYmtleVxuICAgICMgICByZXR1cm4gcGFyc2VJbnQgcmFua190eHQsIDEwXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBkZWNvZGVfbGluZXVwID0gKCBkYXRhICkgPT5cbiAgICAgIFsgLi4uLCBsaW5ldXAsIF0gPSBkYXRhXG4gICAgICByZXR1cm4gY2hyc19mcm9tX3RleHQgbGluZXVwLnJlcGxhY2UgL1xcdTMwMDAvZywgJydcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHhuY3JfZnJvbV91Y2hyID0gKCB1Y2hyICkgPT5cbiAgICAgIHJldHVybiBpZiAoIENIUi5hc19yc2cgdWNociApIGlzICd1LXB1YScgdGhlbiAoIENIUi5hc194bmNyIHVjaHIsIGNzZzogJ2p6cicgKSBlbHNlIHVjaHJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGlucHV0XG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIC5waXBlIEhPTExFUklUSC5yZWFkX3N1YiBkYiwgKCBwaHJhc2UgKSA9PlxuICAgICAgICBbIGdseXBoLCBfLCBsaW5ldXBfbGVuZ3RoLCBdICAgID0gcGhyYXNlXG4gICAgICAgIHN1Yl9wcmVmaXggICAgICAgICAgICAgICAgICAgICAgPSBbICdzcG8nLCBnbHlwaCwgJ3JhbmsvY2p0JywgXVxuICAgICAgICBzdWJfaW5wdXQgICAgICAgICAgICAgICAgICAgICAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIHN1Yl9wcmVmaXhcbiAgICAgICAgcmV0dXJuIFsgWyBnbHlwaCwgbGluZXVwX2xlbmd0aCwgXSwgc3ViX2lucHV0LCBdXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIC5waXBlICQgKCBkYXRhLCBzZW5kICkgPT5cbiAgICAgICAgWyBbIGdseXBoLCBsaW5ldXBfbGVuZ3RoLCBdLCBbIF8sIF8sIHJhbmssIF0sIF0gPSBkYXRhXG4gICAgICAgIHNlbmQgWyBnbHlwaCwgbGluZXVwX2xlbmd0aCwgcmFuaywgXVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAucGlwZSBELiRmaWx0ZXIgKCBbIGdseXBoLCBsaW5ldXBfbGVuZ3RoLCByYW5rLCBdICkgLT4gcmFuayA8IDE1MDAwXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIC5waXBlIEhPTExFUklUSC5yZWFkX3N1YiBkYiwgbWFuZ2xlOiBkZWNvZGVfbGluZXVwLCAoIGRhdGEgKSA9PlxuICAgICAgICBbIGdseXBoLCBsaW5ldXBfbGVuZ3RoLCByYW5rLCBdID0gZGF0YVxuICAgICAgICBzdWJfcHJlZml4ICAgICAgICAgICAgICAgICAgICAgID0gWyAnc3BvJywgZ2x5cGgsICdndWlkZS9saW5ldXAvdWNocicsIF1cbiAgICAgICAgc3ViX2lucHV0ICAgICAgICAgICAgICAgICAgICAgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBzdWJfcHJlZml4XG4gICAgICAgIHJldHVybiBbIFsgZ2x5cGgsIGxpbmV1cF9sZW5ndGgsIHJhbmssIF0sIHN1Yl9pbnB1dCwgXVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAucGlwZSBIT0xMRVJJVEgucmVhZF9zdWIgZGIsICggZGF0YSApID0+XG4gICAgICAgIFsgWyBnbHlwaCwgbGluZXVwX2xlbmd0aCwgcmFuaywgXSwgZ3VpZGVzLCBdICA9IGRhdGFcbiAgICAgICAgY29uZmx1ZW5jZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gRC5jcmVhdGVfdGhyb3VnaHN0cmVhbSgpXG4gICAgICAgIHN0cmVhbV9jb3VudCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IDBcbiAgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgICBmb3IgZ3VpZGUgaW4gZ3VpZGVzXG4gICAgICAgICAgZG8gKCBndWlkZSApID0+XG4gICAgICAgICAgICBndWlkZV94bmNyICAgICAgICA9IHhuY3JfZnJvbV91Y2hyIGd1aWRlXG4gICAgICAgICAgICBzdHJlYW1fY291bnQgICAgICs9ICsxXG4gICAgICAgICAgICBzdWJfcHJlZml4ICAgICAgICA9IFsgJ3NwbycsIGd1aWRlX3huY3IsICdmYWN0b3Ivc2hhcGVjbGFzcy93YmYnLCBdXG4gICAgICAgICAgICBzdWJfaW5wdXQgICAgICAgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBzdWJfcHJlZml4XG4gICAgICAgICAgICBzdWJfaW5wdXQub24gJ2VuZCcsIC0+XG4gICAgICAgICAgICAgIHN0cmVhbV9jb3VudCArPSAtMVxuICAgICAgICAgICAgICBpZiBzdHJlYW1fY291bnQgPCAxXG4gICAgICAgICAgICAgICAgY29uZmx1ZW5jZS5lbmQoKVxuICAgICAgICAgICAgc3ViX2lucHV0XG4gICAgICAgICAgICAgIC5waXBlICQgKCBkYXRhLCBzZW5kICkgPT5cbiAgICAgICAgICAgICAgICBbIC4uLiwgc2hhcGVjbGFzc193YmYsIF0gPSBkYXRhXG4gICAgICAgICAgICAgICAgY29uZmx1ZW5jZS53cml0ZSBzaGFwZWNsYXNzX3diZlxuICAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAgIHJldHVybiBbIFsgZ2x5cGgsIGxpbmV1cF9sZW5ndGgsIHJhbmssIGd1aWRlcywgXSwgY29uZmx1ZW5jZSwgXVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAucGlwZSBELiRmaWx0ZXIgKCBkYXRhICkgPT5cbiAgICAgICAgWyBbIGdseXBoLCBsaW5ldXBfbGVuZ3RoLCByYW5rLCBndWlkZXMsIF0sIHNoYXBlY2xhc3Nlc193YmYuLi4sIF0gPSBkYXRhXG4gICAgICAgIGNvdW50cyA9IFsgMCwgMCwgMCwgMCwgMCwgXVxuICAgICAgICBmb3Igc2hhcGVjbGFzc193YmYgaW4gc2hhcGVjbGFzc2VzX3diZlxuICAgICAgICAgIHNoYXBlY2xhc3NfaWR4ICAgICAgICAgICAgPSAoIHBhcnNlSW50IHNoYXBlY2xhc3Nfd2JmWyAwIF0sIDEwICkgLSAxXG4gICAgICAgICAgY291bnRzWyBzaGFwZWNsYXNzX2lkeCBdICs9ICsxXG4gICAgICAgIHJldHVybiAoIGNvdW50cy5qb2luICcsJyApIGlzICcxLDEsMSwxLDEnXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIC5waXBlICQgKCBkYXRhLCBzZW5kICkgLT4gc2VuZCBKU09OLnN0cmluZ2lmeSBkYXRhXG4gICAgICAucGlwZSBELiRzaG93KClcblxuIyAnXFx1MDAwMCcsXG4jICAgJ1xcdTAwMDEnLFxuIyAgICdcXHUwMDAyJyxcbiMgICAnXFx1MDAwMycsXG4jICAgJ1xcdTAwMDQnLFxuIyAgICdcXHUwMDA1JyxcbiMgICAnXFx1MDAwNicsXG4jICAgJ1xcdTAwMDcnLFxuIyAgICdcXGInLFxuIyAgICdcXHQnLFxuIyAgICdcXG4nLFxuIyAgICdcXHUwMDBiJyxcbiMgICAnXFxmJyxcbiMgICAnXFxyJyxcbiMgICAnXFx1MDAwZScsXG4jICAgJ1xcdTAwMGYnLFxuIyAgICdcXHUwMDEwJyxcbiMgICAnXFx1MDAxMScsXG4jICAgJ1xcdTAwMTInLFxuIyAgICdcXHUwMDEzJyxcbiMgICAnXFx1MDAxNCcsXG4jICAgJ1xcdTAwMTUnLFxuIyAgICdcXHUwMDE2JyxcbiMgICAnXFx1MDAxNycsXG4jICAgJ1xcdTAwMTgnLFxuIyAgICdcXHUwMDE5JyxcbiMgICAnXFx1MDAxYScsXG4jICAgJ1xcdTAwMWInLFxuIyAgICdcXHUwMDFjJyxcbiMgICAnXFx1MDAxZCcsXG4jICAgJ1xcdTAwMWUnLFxuIyAgICdcXHUwMDFmJyxcblxuXG5cIlwiXCJcbuOAh+OAk1xu4pCA4pCB4pCC4pCD4pCE4pCF4pCG4pCH4pCI4pCJ4pCK4pCL4pCM4pCN4pCO4pCP4pCQ4pCR4pCS4pCT4pCU4pCV4pCW4pCX4pCY4pCZ4pCa4pCb4pCc4pCd4pCe4pCf4pCg4pCh4pCi4pCj4pCk4pCl4pCmXG7ikrbikrfikrjikrnikrrikrvikrzikr3ikr7ikr/ik4Dik4Hik4Lik4Pik4Tik4Xik4bik4fik4jik4nik4rik4vik4zik43ik47ik4/ik5Dik5Hik5Lik5Pik5Tik5Xik5bik5fik5jik5nik5rik5vik5zik53ik57ik5/ik6Dik6Hik6Lik6Pik6Tik6Xik6bik6fik6jik6lcbu+8ge+8gu+8g++8hO+8he+8hu+8h++8iO+8ie+8iu+8i++8jO+8je+8ju+8j++8kO+8ke+8ku+8k++8lO+8le+8lu+8l++8mO+8me+8mu+8m++8nO+8ne+8nu+8n++8oO+8oe+8ou+8o++8pO+8pe+8pu+8p++8qO+8qe+8qu+8q++8rO+8re+8ru+8r++8sO+8se+8su+8s++8tO+8te+8tu+8t++8uO+8ue+8uu+8u++8vO+8ve+8vu+8v++9gO+9ge+9gu+9g++9hO+9he+9hu+9h++9iO+9ie+9iu+9i++9jO+9je+9ju+9j++9kO+9ke+9ku+9k++9lO+9le+9lu+9l++9mO+9me+9mu+9m++9nO+9ne+9nu+9n++9oFxuIVwiIyQlJicoKSorLC0uLzAxMjM0NTY3ODk6Ozw9Pj9cbkBBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXF1eX1xuYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn/CgFxuwoHCgsKDwoTChcKGwofCiMKJworCi8KMwo3CjsKPwpDCkcKSwpPClMKVwpbCl8KYwpnCmsKbwpzCncKewp9cbsKhwqLCo8KkwqXCpsKnwqjCqcKqwqvCrMKtwq7Cr8KwwrHCssKzwrTCtcK2wrfCuMK5wrrCu8K8wr3CvsK/w4BcbsOBw4LDg8OEw4XDhsOHw4jDicOKw4vDjMONw47Dj8OQw5HDksOTw5TDlcOWw5fDmMOZw5rDm8Ocw53DnsOfw6BcbsOhw6LDo8Okw6XDpsOnw6jDqcOqw6vDrMOtw67Dr8Oww7HDssOzw7TDtcO2w7fDuMO5w7rDu8O8w73DvsO/XG5cIlwiXCJcblxuXCJcIlwiXG7jgJPvvIHvvILvvIPvvITvvIXvvIbvvIfvvIjvvInvvIrvvIvvvIzvvI3vvI7vvI/vvJDvvJHvvJLvvJPvvJTvvJXvvJbvvJfvvJjvvJnvvJrvvJvvvJzvvJ3vvJ7vvJ9cbu+8oO+8oe+8ou+8o++8pO+8pe+8pu+8p++8qO+8qe+8qu+8q++8rO+8re+8ru+8r++8sO+8se+8su+8s++8tO+8te+8tu+8t++8uO+8ue+8uu+8u++8vO+8ve+8vu+8v1xu772A772B772C772D772E772F772G772H772I772J772K772L772M772N772O772P772Q772R772S772T772U772V772W772X772Y772Z772a772b772c772d772e44CTXG7jgJPjgJPjgJPjgJPjgJPjgJPjgJPjgJPjgJPjgJPjgJPjgJPjgJPjgJPjgJPjgJPjgJPjgJPjgJPjgJPjgJPjgJPjgJPjgJPjgJPjgJPjgJPjgJPjgJPjgJPjgJPjgJNcbuOAk+OAk+OAk+OAk+OAk+OAk+OAk+OAk+OAk+OAk+OAk+OAk+OAk+OAk+OAk+OAk+OAk+OAk+OAk+OAk+OAk+OAk+OAk+OAk+OAk+OAk+OAk+OAk+OAk+OAk+OAk+OAk1xu44CT4pK24pK34pK44pK54pK64pK74pK84pK94pK+4pK/4pOA4pOB4pOC4pOD4pOE4pOF4pOG4pOH4pOI4pOJ4pOK4pOL4pOM4pON4pOO4pOP44CT44CT44CT44CT44CTXG7jgJPik5Dik5Hik5Lik5Pik5Tik5Xik5bik5fik5jik5nik5rik5vik5zik53ik57ik5/ik6Dik6Hik6Lik6Pik6Tik6Xik6bik6fik6jik6njgJPjgJPjgJPjgJPjgJNcblxu44iA44iB44iC44iD44iE44iF44iG44iH44iI44iJ44iK44iL44iM44iN44iO44iP44iQ44iR44iS44iT44iU44iV44iW44iX44iY44iZ44ia44ib44ic44id44ie44ifXG7jiKDjiKHjiKLjiKPjiKTjiKXjiKbjiKfjiKjjiKnjiKrjiKvjiKzjiK3jiK7jiK/jiLDjiLHjiLLjiLPjiLTjiLXjiLbjiLfjiLjjiLnjiLrjiLvjiLzjiL3jiL7jiL9cbuOJgOOJgeOJguOJg+OJhOOJheOJhuOJh+OJiOOJieOJiuOJi+OJjOOJjeOJjuOJj+OJkOOJkeOJkuOJk+OJlOOJleOJluOJl+OJmOOJmeOJmuOJm+OJnOOJneOJnuOJn1xu44mg44mh44mi44mj44mk44ml44mm44mn44mo44mp44mq44mr44ms44mt44mu44mv44mw44mx44my44mz44m044m144m244m344m444m544m644m744m844m944m+44m/XG7jioDjioHjioLjioPjioTjioXjiobjiofjiojjionjiorjiovjiozjio3jio7jio/jipDjipHjipLjipPjipTjipXjipbjipfjipjjipnjiprjipvjipzjip3jip7jip9cbuOKoOOKoeOKouOKo+OKpOOKpeOKpuOKp+OKqOOKqeOKquOKq+OKrOOKreOKruOKr+OKsOOKseOKsuOKs+OKtOOKteOKtuOKt+OKuOOKueOKuuOKu+OKvOOKveOKvuOKv1xu44uA44uB44uC44uD44uE44uF44uG44uH44uI44uJ44uK44uL44uM44uN44uO44uP44uQ44uR44uS44uT44uU44uV44uW44uX44uY44uZ44ua44ub44uc44ud44ue44ufXG7ji6Dji6Hji6Lji6Pji6Tji6Xji6bji6fji6jji6nji6rji6vji6zji63ji67ji6/ji7Dji7Hji7Lji7Pji7Tji7Xji7bji7fji7jji7nji7rji7vji7zji73ji77ji79cbvCfiIDwn4iB8J+IgvCfiJDwn4iR8J+IkvCfiJPwn4iU8J+IlfCfiJbwn4iX8J+ImPCfiJnwn4ia8J+Im/CfiJzwn4id8J+InvCfiJ/wn4ig8J+IofCfiKLwn4ij8J+IpPCfiKXwn4im8J+Ip/CfiKjwn4ip8J+IqvCfiKvwn4is8J+IrfCfiK7wn4ivXG7wn4iw8J+IsfCfiLLwn4iz8J+ItPCfiLXwn4i28J+It/CfiLjwn4i58J+IuvCfiLvwn4i88J+IvfCfiL7wn4i/XG7wn4mA8J+JgfCfiYLwn4mD8J+JhPCfiYXwn4mG8J+Jh/CfiYjwn4mJ8J+JivCfiYvwn4mM8J+JjfCfiY7wn4mPXG7wn4mQ8J+JkfCfiZLwn4mT8J+JlPCfiZXwn4mW8J+Jl/CfiZjwn4mZ8J+JmvCfiZvwn4mc8J+JnfCfiZ7wn4mfXG7jjIDjjIHjjILjjIPjjITjjIXjjIbjjIfjjIjjjInjjIrjjIvjjIzjjI3jjI7jjI/jjJDjjJHjjJLjjJPjjJTjjJXjjJbjjJfjjJjjjJnjjJrjjJvjjJzjjJ3jjJ7jjJ9cbuOMoOOMoeOMouOMo+OMpOOMpeOMpuOMp+OMqOOMqeOMquOMq+OMrOOMreOMruOMr+OMsOOMseOMsuOMs+OMtOOMteOMtuOMt+OMuOOMueOMuuOMu+OMvOOMveOMvuOMv1xu442A442B442C442D442E442F442G442H442I442J442K442L442M442N442O442P442Q442R442S442T442U442V442W442X442Y442Z442a442b442c442d442e442fXG7jjaDjjaHjjaLjjaPjjaTjjaXjjabjjafjjajjjanjjarjjavjjazjja3jja7jja/jjbDjjbHjjbLjjbPjjbTjjbXjjbbjjbfjjbjjjbnjjbrjjbvjjbzjjb3jjb7jjb9cbuOOgOOOgeOOguOOg+OOhOOOheOOhuOOh+OOiOOOieOOiuOOi+OOjOOOjeOOjuOOj+OOkOOOkeOOkuOOk+OOlOOOleOOluOOl+OOmOOOmeOOmuOOm+OOnOOOneOOnuOOn1xu446g446h446i446j446k446l446m446n446o446p446q446r446s446t446u446v446w446x446y446z4460446144624463446444654466446744684469446+446/XG7jj4Djj4Hjj4Ljj4Pjj4Tjj4Xjj4bjj4fjj4jjj4njj4rjj4vjj4zjj43jj47jj4/jj5Djj5Hjj5Ljj5Pjj5Tjj5Xjj5bjj5fjj5jjj5njj5rjj5vjj5zjj53jj57jj59cbuOPoOOPoeOPouOPo+OPpOOPpeOPpuOPp+OPqOOPqeOPquOPq+OPrOOPreOPruOPr+OPsOOPseOPsuOPs+OPtOOPteOPtuOPt+OPuOOPueOPuuOPu+OPvOOPveOPvuOPv1xu4pGg4pGh4pGi4pGj4pGk4pGl4pGm4pGn4pGo4pGp4pGq4pGr4pGs4pGt4pGu4pGv4pGw4pGx4pGy4pGz4pG04pG14pG24pG34pG44pG54pG64pG74pG84pG94pG+4pG/XG7ikoDikoHikoLikoPikoTikoXikobikofikojikonikorikovikoziko3iko7iko/ikpDikpHikpLikpPikpTikpXikpbikpfikpjikpnikprikpvikpzikp3ikp7ikp9cbuKSoOKSoeKSouKSo+KSpOKSpeKSpuKSp+KSqOKSqeKSquKSq+KSrOKSreKSruKSr+KSsOKSseKSsuKSs+KStOKSteKStuKSt+KSuOKSueKSuuKSu+KSvOKSveKSvuKSv1xu4pOA4pOB4pOC4pOD4pOE4pOF4pOG4pOH4pOI4pOJ4pOK4pOL4pOM4pON4pOO4pOP4pOQ4pOR4pOS4pOT4pOU4pOV4pOW4pOX4pOY4pOZ4pOa4pOb4pOc4pOd4pOe4pOfXG7ik6Dik6Hik6Lik6Pik6Tik6Xik6bik6fik6jik6nik6rik6vik6zik63ik67ik6/ik7Dik7Hik7Lik7Pik7Tik7Xik7bik7fik7jik7nik7rik7vik7zik73ik77ik79cbuKdtuKdt+KduOKdueKduuKdu+KdvOKdveKdvuKdv+KegOKegeKeguKeg+KehOKeheKehuKeh+KeiOKeieKeiuKei+KejOKejeKejuKej+KekOKekeKekuKek1xuXCJcIlwiXG5cblwiXCJcIlxu4oiO4oiO4oiO4oiO4oiO4oiO4oiO4oiO4oiO4oiO4oiO4oiO4oiO4oiO4oiO4oiO4oiO4oiO4oiO4oiO4oiO4oiO4oiO4oiO4oiO4oiO4oiO4oiO4oiO4oiO4oiO4oiOXG7imoDimoHimoLimoPimoTimoXimoDimoHimoLimoPimoTimoXimoDimoHimoLimoPimoTimoXimoDimoHimoLimoPimoTimoXimoDimoHimoLimoPimoTimoXimoTimoVcbtCR0JTQmNCb0KbQp9Co0K3QrsaGxovGj8aQxpTGpcanxrjPiMWQxZHFksWTxYrFgcWC0K/JlMmYyZDJlcmZyZ5cbsSQxJHEksSTxJTElcSWxJfEmMSZxJrEm8ScxJ3EnsSfxKDEocSixKPEpMSlxKbEp8SoxKnEqsSrxKzErcSuxK9cbuKQoyFcIiMkJSYnKCkqKywtLi8wMTIzNDU2Nzg5Ojs8PT4/XG5AQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpbXFxdXl9cbmBhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ent8fX7PiVxuzpPOlM6YzpvOns6gzqPOps6ozqnOsc6yzrPOtM61zrbOt864zrnOus67zrzOvc6+z4DPgc+Cz4PPhM+Fz4bPh1xu0JbCocKiwqPCpMKlwqbCp8KowqnCqsKrwqzQr8Kuwq/CsMKxwrLCs8K0wrXCtsK3wrjCucK6wrvCvMK9wr7Cv1xuw4DDgcOCw4PDhMOFw4bDh8OIw4nDisOLw4zDjcOOw4/DkMORw5LDk8OUw5XDlsOXw5jDmcOaw5vDnMOdw57Dn1xuw6DDocOiw6PDpMOlw6bDp8Oow6nDqsOrw6zDrcOuw6/DsMOxw7LDs8O0w7XDtsO3w7jDucO6w7vDvMO9w77Dv1xuXCJcIlwiXG5cblxuXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQHNob3dfZW5jb2Rpbmdfc2FtcGxlID0gLT5cbiAgcGhyYXNlcyA9IFtcbiAgICBbICfkuIEnLCAnc3Ryb2tlY291bnQnLCAgICAgMiwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICBbICfkuIknLCAnc3Ryb2tlY291bnQnLCAgICAgMywgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICBbICflpKsnLCAnc3Ryb2tlY291bnQnLCAgICAgNSwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICBbICflnIsnLCAnc3Ryb2tlY291bnQnLCAgICAgMTEsICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICBbICflvaInLCAnc3Ryb2tlY291bnQnLCAgICAgNywgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICBbICfkuIEnLCAnY29tcG9uZW50Y291bnQnLCAgMSwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICBbICfkuIknLCAnY29tcG9uZW50Y291bnQnLCAgMSwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICBbICflpKsnLCAnY29tcG9uZW50Y291bnQnLCAgMSwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICBbICflnIsnLCAnY29tcG9uZW50Y291bnQnLCAgNCwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICBbICflvaInLCAnY29tcG9uZW50Y291bnQnLCAgMiwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICBbICfkuIEnLCAnY29tcG9uZW50cycsICAgICAgWyAn5LiBJywgXSwgICAgICAgICAgICAgICAgICBdXG4gICAgWyAn5LiJJywgJ2NvbXBvbmVudHMnLCAgICAgIFsgJ+S4iScsIF0sICAgICAgICAgICAgICAgICAgXVxuICAgIFsgJ+WkqycsICdjb21wb25lbnRzJywgICAgICBbICflpKsnLCBdLCAgICAgICAgICAgICAgICAgIF1cbiAgICBbICflnIsnLCAnY29tcG9uZW50cycsICAgICAgWyAn5ZuXJywgJ+aIiCcsICflj6MnLCAn5LiAJywgXSwgXVxuICAgIFsgJ+W9oicsICdjb21wb25lbnRzJywgICAgICBbICflvIAnLCAn5b2hJywgXSwgICAgICAgICAgICAgXVxuICAgIF1cbiAgIyBmb3IgWyBzYmosIHByZCwgb2JqLCBdIGluIHBocmFzZXNcbiAgIyAgIGtleSAgID0gKCBIT0xMRVJJVEguQ09ERUMuZW5jb2RlIFsgc2JqLCBwcmQsIF0sIClcbiAgIyAgIHZhbHVlID0gKCBuZXcgQnVmZmVyIEpTT04uc3RyaW5naWZ5IG9iaiApXG4gICMgICBrZXlfcnByID0gW11cbiAgIyAgIGZvciBpZHggaW4gWyAwIC4uLiBrZXkubGVuZ3RoIF1cbiAgIyAgICAga2V5X3Jwci5wdXNoIFN0cmluZy5mcm9tQ29kZVBvaW50IGtleVsgaWR4IF1cbiAgIyAgIHVyZ2UgcnByIGtleV9ycHIuam9pbiAnJ1xuICBjaHJzID0gW11cbiAgZm9yIGNpZCBpbiBbIDAgLi4gMjU1IF1cbiAgICBjaHJzLnB1c2ggU3RyaW5nLmZyb21Db2RlUG9pbnQgY2lkXG4gICAgY2hycy5wdXNoICdcXG4nIGlmIGNpZCA+IDAgYW5kIGNpZCAlIDMyIGlzIDBcbiAgZGVidWcgJ8KpWmdZNEQnLCBjaHJzXG4gIGhlbHAgY2hycy5qb2luICcnXG4gIHVyZ2UgKCBTdHJpbmcuZnJvbUNvZGVQb2ludCBjaWQgZm9yIGNpZCBpbiBbIDB4MjQwMCAuLiAweDI0MjYgXSApLmpvaW4gJydcbiAgdXJnZSAoIFN0cmluZy5mcm9tQ29kZVBvaW50IGNpZCBmb3IgY2lkIGluIFsgMHgyNGI2IC4uIDB4MjRlOSBdICkuam9pbiAnJ1xuICB1cmdlICggU3RyaW5nLmZyb21Db2RlUG9pbnQgY2lkIGZvciBjaWQgaW4gWyAweGZmMDEgLi4gMHhmZjYwIF0gKS5qb2luICcnXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xudW5sZXNzIG1vZHVsZS5wYXJlbnQ/XG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBvcHRpb25zID1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICMgJ3JvdXRlJzogICAgICAgICAgICAgICAgbmpzX3BhdGguam9pbiBfX2Rpcm5hbWUsICcuLi9kYnMvZGVtbydcbiAgICAncm91dGUnOiAgICAgICAgICAgICAgICAnL1ZvbHVtZXMvU3RvcmFnZS9pby9qaXp1cmEtZGF0YXNvdXJjZXMvZGF0YS9sZXZlbGRiJ1xuICAgICMgJ3JvdXRlJzogICAgICAgICAgICAnL3RtcC9sZXZlbGRiJ1xuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGRlYnVnICfCqUFvT0FTJywgb3B0aW9uc1xuICAjIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAjICAgeWllbGQgQGluaXRpYWxpemUgcmVzdW1lXG4gICMgICBkYiA9IG9wdGlvbnNbICdkYicgXVxuICAjICAgQGZpbmRfZ29vZF9rd2ljX3NhbXBsZV9nbHlwaHNfMiBkYlxuICAjIEBjb3B5X2ppenVyYV9kYigpXG4gICMgQGR1bXBfaml6dXJhX2RiKClcbiAgIyBAZmluZF9nb29kX2t3aWNfc2FtcGxlX2dseXBoc18yKClcbiAgQHNob3dfZW5jb2Rpbmdfc2FtcGxlKClcblxuXG4iXX0=