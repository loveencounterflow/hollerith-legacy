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

  "\n⓿❶❷❸❹❺❻❼❽❾❿⓫⓬⓭⓮⓯⓰⓱⓲⓳⓴\n⓵⓶⓷⓸⓹⓺⓻⓼⓽⓾\n㍘㍙㍚㍛㍜㍝㍞㍟㍠㍡㍢㍣㍤㍥㍦㍧㍨㍩㍪㍫㍬㍭㍮㍯㍰\n⑴⑵⑶⑷⑸⑹⑺⑻⑼⑽⑾⑿⒀⒁⒂⒃⒄⒅⒆⒇\n⒈⒉⒊⒋⒌⒍⒎⒏⒐⒑⒒⒓⒔⒕⒖⒗⒘⒙⒚⒛\n⒜⒝⒞⒟⒠⒡⒢⒣⒤⒥⒦⒧⒨⒩⒪⒫⒬⒭⒮⒯⒰⒱⒲⒳⒴⒵\n㈠㈡㈢㈣㈤㈥㈦㈧㈨㈩\n\n㋀㋁㋂㋃㋄㋅㋆㋇㋈㋉㋊㋋\n\n㈀㈁㈂㈃㈄㈅㈆㈇㈈㈉㈊㈋㈌㈍㈎㈏㈐㈑㈒㈓㈔㈕㈖㈗㈘㈙㈚㈛㈜㈝㈞㈟\n㈪㈫㈬㈭㈮㈯㈰㈱㈲㈳㈴㈵㈶㈷㈸㈹㈺㈻㈼㈽㈾㈿\n㉀㉁㉂㉃㉄㉅㉆㉇\n㉠㉡㉢㉣㉤㉥㉦㉧㉨㉩㉪㉫㉬㉭㉮㉯㉰㉱㉲㉳㉴㉵㉶㉷㉸㉹㉺㉻㉼㉽㉾㉿\n㌀㌁㌂㌃㌄㌅㌆㌇㌈㌉㌊㌋㌌㌍㌎㌏㌐㌑㌒㌓㌔㌕㌖㌗㌘㌙㌚㌛㌜㌝㌞㌟\n㌠㌡㌢㌣㌤㌥㌦㌧㌨㌩㌪㌫㌬㌭㌮㌯㌰㌱㌲㌳㌴㌵㌶㌷㌸㌹㌺㌻㌼㌽㌾㌿\n㍀㍁㍂㍃㍄㍅㍆㍇㍈㍉㍊㍋㍌㍍㍎㍏㍐㍑㍒㍓㍔㍕㍖㍗\n∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎\n⚀⚁⚂⚃⚄⚅⚀⚁⚂⚃⚄⚅⚀⚁⚂⚃⚄⚅⚀⚁⚂⚃⚄⚅⚀⚁⚂⚃⚄⚅⚄⚅\nĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮį\n    〓㏠㏡㏢㏣㏤㏥㏦㏧㏨㏩㏪㏫㏬㏭㏮㏯㏰㏱㏲㏳㏴㏵㏶㏷㏸㏹㏺㏻㏼㏽㏾\n    〓ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ〓〓〓〓〓\n    〓ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ〓〓〓〓〓\n";

  this.encodings = {
    dbcs2: "⓪①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳㉑㉒㉓㉔㉕㉖㉗㉘㉙㉚㉛\n㉜！＂＃＄％＆＇（）＊＋，－．／０１２３４５６７８９：；＜＝＞？\n＠ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ［＼］＾＿\n｀ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ｛｜｝～㉠\n㉝㉞㉟㊱㊲㊳㊴㊵㊶㊷㊸㊹㊺㊻㊼㊽㊾㊿㋐㋑㋒㋓㋔㋕㋖㋗㋘㋙㋚㋛㋜㋝\n㋞㋟㋠㋡㋢㋣㋤㋥㋦㋧㋨㋩㋪㋫㋬㋭㋮㋯㋰㋱㋲㋳㋴㋵㋶㋷㋸㋹㋺㋻㋼㋽\n㋾㊊㊋㊌㊍㊎㊏㊐㊑㊒㊓㊔㊕㊖㊗㊘㊙㊚㊛㊜㊝㊞㊟㊠㊡㊢㊣㊤㊥㊦㊧㊨\n㊩㊪㊫㊬㊭㊮㊯㊰㊀㊁㊂㊃㊄㊅㊆㊇㊈㊉㉈㉉㉊㉋㉌㉍㉎㉏⓵⓶⓷⓸⓹〓",
    aleph: "БДИЛЦЧШЭЮƆƋƏƐƔƥƧƸψŐőŒœŊŁłЯɔɘɐɕəɞ\n␣!\"#$%&'()*+,-./0123456789:;<=>?\n@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_\n`abcdefghijklmnopqrstuvwxyz{|}~ω\nΓΔΘΛΞΠΣΦΨΩαβγδεζηθικλμνξπρςστυφχ\nЖ¡¢£¤¥¦§¨©ª«¬Я®¯°±²³´µ¶·¸¹º»¼½¾¿\nÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞß\nàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ",
    rdctn: "Δ≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡\n␣!\"#$%&'()*+,-./0123456789:;<=>?\n@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_\n`abcdefghijklmnopqrstuvwxyz{|}~≡\n⊪⊪⊪⊪⊪⊪⊪⊪⊪⊪⊪⊪⊪⊪⊪⊪⊪⊪⊪⊪⊪⊪⊪⊪⊪⊪⊪⊪⊪⊪⊪⊪\n≢≢¢£¤¥¦§¨©ª«¬Я®¯°±²³´µ¶·¸¹º»¼½¾¿\nÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞß\nàáâãäåæçèéêëìíîïðñò≢≢≢≢≢≢≢≢≢≢≢≢∇"
  };

  this._chrs_of = function(text) {
    var chr;
    text = text.split(/([\ud800-\udbff].|.)/);
    return (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = text.length; i < len; i++) {
        chr = text[i];
        if (chr !== '') {
          results.push(chr);
        }
      }
      return results;
    })();
  };

  this.compile_encodings = function() {
    var encoding, length, name, ref;
    ref = this.encodings;
    for (name in ref) {
      encoding = ref[name];
      encoding = this._chrs_of(encoding.replace(/\n+/g, ''));
      if ((length = encoding.length) !== 256) {
        throw new Error("expected 256 characters, found " + length + " in encoding " + (rpr(name)));
      }
      this.encodings[name] = encoding;
    }
    return null;
  };

  this.compile_encodings();

  this.show_encoding_sample = function() {
    var encoding, i, idx, key, key_rpr, len, obj, phrases, prd, ref, sbj, text, text_rpr, value, value_rpr;
    encoding = this.encodings['dbcs2'];
    encoding = this.encodings['aleph'];
    encoding = this.encodings['rdctn'];
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
    text = new Buffer('一');
    text_rpr = ((function() {
      var j, ref1, results;
      results = [];
      for (idx = j = 0, ref1 = text.length; 0 <= ref1 ? j < ref1 : j > ref1; idx = 0 <= ref1 ? ++j : --j) {
        results.push(encoding[text[idx]]);
      }
      return results;
    })()).join('');
    return help(text, text_rpr);
  };

  if (module.parent == null) {
    options = {
      'route': '/Volumes/Storage/io/jizura-datasources/data/leveldb'
    };
    debug('©AoOAS', options);
    this.show_encoding_sample();
  }

}).call(this);

//# sourceMappingURL=data:application/json;base64,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QUE7O0FBbWxCQSxFQUFBLElBQU8scUJBQVA7QUFHRSxJQUFBLE9BQUEsR0FHRTtBQUFBLE1BQUEsT0FBQSxFQUF3QixxREFBeEI7S0FIRixDQUFBO0FBQUEsSUFNQSxLQUFBLENBQU0sUUFBTixFQUFnQixPQUFoQixDQU5BLENBQUE7QUFBQSxJQWNBLElBQUMsQ0FBQSxvQkFBRCxDQUFBLENBZEEsQ0FIRjtHQW5sQkE7QUFBQSIsImZpbGUiOiJkZW1vLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiXG5cblxuIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5uanNfcGF0aCAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAncGF0aCdcbiMgbmpzX2ZzICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2ZzJ1xuam9pbiAgICAgICAgICAgICAgICAgICAgICA9IG5qc19wYXRoLmpvaW5cbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuQ05EICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2NuZCdcbnJwciAgICAgICAgICAgICAgICAgICAgICAgPSBDTkQucnByXG5iYWRnZSAgICAgICAgICAgICAgICAgICAgID0gJ0hPTExFUklUSC90ZXN0J1xubG9nICAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdwbGFpbicsICAgICBiYWRnZVxuaW5mbyAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdpbmZvJywgICAgICBiYWRnZVxud2hpc3BlciAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICd3aGlzcGVyJywgICBiYWRnZVxuYWxlcnQgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdhbGVydCcsICAgICBiYWRnZVxuZGVidWcgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdkZWJ1ZycsICAgICBiYWRnZVxud2FybiAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICd3YXJuJywgICAgICBiYWRnZVxuaGVscCAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdoZWxwJywgICAgICBiYWRnZVxudXJnZSAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICd1cmdlJywgICAgICBiYWRnZVxuZWNobyAgICAgICAgICAgICAgICAgICAgICA9IENORC5lY2hvLmJpbmQgQ05EXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnN1c3BlbmQgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdjb2ZmZWVub2RlLXN1c3BlbmQnXG5zdGVwICAgICAgICAgICAgICAgICAgICAgID0gc3VzcGVuZC5zdGVwXG5hZnRlciAgICAgICAgICAgICAgICAgICAgID0gc3VzcGVuZC5hZnRlclxuZXZlbnR1YWxseSAgICAgICAgICAgICAgICA9IHN1c3BlbmQuZXZlbnR1YWxseVxuaW1tZWRpYXRlbHkgICAgICAgICAgICAgICA9IHN1c3BlbmQuaW1tZWRpYXRlbHlcbnJlcGVhdF9pbW1lZGlhdGVseSAgICAgICAgPSBzdXNwZW5kLnJlcGVhdF9pbW1lZGlhdGVseVxuZXZlcnkgICAgICAgICAgICAgICAgICAgICA9IHN1c3BlbmQuZXZlcnlcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyBCWVRFV0lTRSAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnYnl0ZXdpc2UnXG4jIHRocm91Z2ggICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICd0aHJvdWdoMidcbiMgTGV2ZWxCYXRjaCAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2xldmVsLWJhdGNoLXN0cmVhbSdcbiMgQmF0Y2hTdHJlYW0gICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2JhdGNoLXN0cmVhbSdcbiMgcGFyYWxsZWwgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2NvbmN1cnJlbnQtd3JpdGFibGUnXG5EICAgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAncGlwZWRyZWFtczInXG4kICAgICAgICAgICAgICAgICAgICAgICAgID0gRC5yZW1pdC5iaW5kIERcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxubmV3X2RiICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2xldmVsJ1xuIyBuZXdfbGV2ZWxncmFwaCAgICAgICAgICAgID0gcmVxdWlyZSAnbGV2ZWxncmFwaCdcbiMgZGIgICAgICAgICAgICAgICAgICAgICAgICA9IG5ld19sZXZlbGdyYXBoICcvdG1wL2xldmVsZ3JhcGgnXG5IT0xMRVJJVEggICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi9tYWluJ1xuxpIgICAgICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZm9ybWF0X251bWJlci5iaW5kIENORFxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5vcHRpb25zICAgICAgICAgICAgICAgICAgID0gbnVsbFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfbWlzZml0ICAgICAgICAgID0gU3ltYm9sICdtaXNmaXQnXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIFBJUEVEUkVBTVNcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuRC5uZXdfaW5kZXhlciA9ICggaWR4ID0gMCApIC0+ICggZGF0YSApID0+IFsgaWR4KyssIGRhdGEsIF1cblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQGluaXRpYWxpemUgPSAoIGhhbmRsZXIgKSAtPlxuICBvcHRpb25zWyAnZGInIF0gPSBIT0xMRVJJVEgubmV3X2RiIG9wdGlvbnNbICdyb3V0ZScgXVxuICBoYW5kbGVyIG51bGxcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AbWFpbiA9ICggZmlyc3RfcXVlcnkgKSAtPlxuICBmaXJzdF9xdWVyeSA/PSB7IGd0ZTogJ29zfHJhbmsvY2p0OjAnLCBsdGU6ICdvc3xyYW5rL2NqdDo5JywgfVxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB5aWVsZCBAaW5pdGlhbGl6ZSByZXN1bWVcbiAgICBkYiA9IG9wdGlvbnNbICdkYicgXVxuICAgIENIUiA9IHJlcXVpcmUgJy9Wb2x1bWVzL1N0b3JhZ2UvaW8vY29mZmVlbm9kZS1jaHInXG4gICAgY291bnRfY2hycyA9ICggdGV4dCApIC0+ICggQ0hSLmNocnNfZnJvbV90ZXh0IHRleHQsIGlucHV0OiAneG5jcicgKS5sZW5ndGhcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGlucHV0ID0gZGJbICclc2VsZicgXS5jcmVhdGVLZXlTdHJlYW0gZmlyc3RfcXVlcnlcbiAgICAjIGsgPSBcInNvfGdseXBoOue5vHxwb2Q6XCJcbiAgICAjIGlucHV0ID0gZGJbICclc2VsZicgXS5jcmVhdGVLZXlTdHJlYW0gZGIsIHsgZ3RlOiBrLCBsdGU6IGsgKyAnXFx1ZmZmZicgfVxuICAgICMgZGVidWcgJ8KpY1c4dEsnLCBIT0xMRVJJVEgubmV3X2tleSBkYiwgJ29zJywgJ3JhbmsvY2p0JywgJzAwMDAwJ1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyMjIFRBSU5UIFdlIGNhbiBjdXJyZW50bHkgbm90IHVzZSBgSE9MTEVSSVRIMi5yZWFkX3N1YmAgYmVjYXVzZSBIT0xMRVJJVEgyIGFzc3VtZXMgYSBrZXktb25seVxuICAgIERCIHRoYXQgdXNlcyBiaW5hcnkgZW5jb2Rpbmcgd2l0aCBhIGN1c3RvbSBodHRwczovL2dpdGh1Yi5jb20vZGVhbmxhbmRvbHQvYnl0ZXdpc2UgbGF5ZXI7IHRoZSBjdXJyZW50XG4gICAgSml6dXJhIERCIHZlcnNpb24gdXNlcyBVVEYtOCBzdHJpbmdzIGFuZCBpcyBhIGtleS92YWx1ZSBEQi4gIyMjXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpbnB1dFxuICAgICAgLnBpcGUgQF8kc3BsaXRfYmtleSgpXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgICMgLnBpcGUgSE9MTEVSSVRILnJlYWRfc3ViIGRiLCBpbmRleGVkOiB5ZXMsICgga2V5ICkgPT5cbiAgICAgIC5waXBlIEByZWFkX3N1YiBkYiwgaW5kZXhlZDogeWVzLCAoIGtleSApID0+XG4gICAgICAgIFsgcHQsIG9rLCByYW5rLCBzaywgZ2x5cGgsIF0gPSBrZXlcbiAgICAgICAgc3ViX2tleSA9IFwic298Z2x5cGg6I3tnbHlwaH18cG9kOlwiXG4gICAgICAgIHJldHVybiBkYlsgJyVzZWxmJyBdLmNyZWF0ZVZhbHVlU3RyZWFtIHsgZ3RlOiBzdWJfa2V5LCBsdGU6IHN1Yl9rZXkgKyAnXFx1ZmZmZicgfVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAucGlwZSBELiRkZW5zb3J0IDAsIDAsIHRydWVcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgLnBpcGUgJCAoIFsgaWR4LCBbIHBvZCwgXSwgXSwgc2VuZCApID0+XG4gICAgICAgIGRlYnVnICfCqWpkNWNFJywgcG9kXG4gICAgICAgIHVubGVzcyBwb2RbICdzdHJva2VvcmRlci9zaG9ydCcgIF0/XG4gICAgICAgICAgd2FybiAnwqk5WVhvcScsICBwb2RcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGdseXBoICAgICAgID0gcG9kWyAnZ2x5cGgvdWNocicgICAgICAgICBdXG4gICAgICAgICAgc3Ryb2tlb3JkZXIgPSBwb2RbICdzdHJva2VvcmRlci9zaG9ydCcgIF1bIDAgXS5sZW5ndGhcbiAgICAgICAgICBsaW5ldXAgICAgICA9IHBvZFsgJ2d1aWRlL2xpbmV1cC91Y2hyJyAgXS5yZXBsYWNlIC9cXHUzMDAwL2csICcnXG4gICAgICAgICAgc2VuZCBbIGdseXBoLCBzdHJva2VvcmRlciwgbGluZXVwLCBdXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIC5waXBlICQgKCBbIGdseXBoLCBzdHJva2VvcmRlciwgbGluZXVwLCBdLCBzZW5kICkgPT5cbiAgICAgICAgc2VuZCBbIGdseXBoLCBzdHJva2VvcmRlciwgY291bnRfY2hycyBsaW5ldXAsIF1cbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgLnBpcGUgRC4kc29ydCAoIGEsIGIgKSAtPlxuICAgICAgICBpZHggPSAxXG4gICAgICAgIHJldHVybiArMSBpZiBhWyBpZHggXSA+IGJbIGlkeCBdXG4gICAgICAgIHJldHVybiAtMSBpZiBhWyBpZHggXSA8IGJbIGlkeCBdXG4gICAgICAgIHJldHVybiAgMFxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAucGlwZSBELiRzaG93KClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AXyRzcGxpdF9ia2V5ID0gLT4gJCAoIGJrZXksIHNlbmQgKSA9PiBzZW5kIEBfc3BsaXRfYmtleSBia2V5XG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9zcGxpdF9ia2V5ID0gKCBia2V5ICkgLT5cbiAgUiA9IGJrZXkudG9TdHJpbmcgJ3V0Zi04J1xuICBSID0gKCBSLnNwbGl0ICd8JyApWyAuLiAyIF1cbiAgUiA9IFsgUlsgMCBdLCAoIFJbIDEgXS5zcGxpdCAnOicgKS4uLiwgKCBSWyAyIF0uc3BsaXQgJzonICkuLi4sIF1cbiAgcmV0dXJuIFJcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AXyRzcGxpdF9zb19ia2V5ID0gLT4gJCAoIGJrZXksIHNlbmQgKSA9PiBzZW5kIEBfc3BsaXRfc29fYmtleSBia2V5XG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9zcGxpdF9zb19ia2V5ID0gKCBia2V5ICkgLT5cbiAgUiAgICAgICA9IGJrZXkudG9TdHJpbmcgJ3V0Zi04J1xuICBSICAgICAgID0gUi5zcGxpdCAnfCdcbiAgaWR4X3R4dCA9IFJbIDMgXVxuICBSICAgICAgID0gWyAoIFJbIDEgXS5zcGxpdCAnOicgKVsgMSBdLCAoIFJbIDIgXS5zcGxpdCAnOicgKS4uLiwgXVxuICBSLnB1c2ggKCBwYXJzZUludCBpZHhfdHh0LCAxMMKgKSBpZiBpZHhfdHh0PyBhbmQgaWR4X3R4dC5sZW5ndGggPiAwXG4gIHJldHVybiBSXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9sdGVfZnJvbV9ndGUgPSAoIGd0ZSApIC0+XG4gIFIgPSBuZXcgQnVmZmVyICggbGFzdF9pZHggPSBCdWZmZXIuYnl0ZUxlbmd0aCBndGUgKSArIDFcbiAgUi53cml0ZSBndGVcbiAgUlsgbGFzdF9pZHggXSA9IDB4ZmZcbiAgcmV0dXJuIFJcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AJGxpbmV1cF9mcm9tX2dseXBoID0gKCBkYiApIC0+XG4gIHNldHRpbmdzID1cbiAgICBpbmRleGVkOiAgbm9cbiAgICBzaW5nbGU6ICAgeWVzXG4gIHJldHVybiBAcmVhZF9zdWIgZGIsIHNldHRpbmdzLCAoIGdseXBoICkgPT5cbiAgICBsdGUgPSBcInNvfGdseXBoOiN7Z2x5cGh9fGd1aWRlL2xpbmV1cC91Y2hyOlwiXG4gICAgc3ViX2lucHV0ID0gZGJbICclc2VsZicgXS5jcmVhdGVLZXlTdHJlYW0geyBndGU6IGx0ZSwgbHRlOiBAX2x0ZV9mcm9tX2d0ZSBsdGUsIH1cbiAgICByZXR1cm4gc3ViX2lucHV0XG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQCRzaGFwZWNsYXNzX3diZl9mcm9tX2dseXBoX2FuZF9saW5ldXAgPSAoIGRiICkgLT5cbiAgIyMjIFRBSU5UIHdyb25nICMjI1xuICBzZXR0aW5ncyA9XG4gICAgaW5kZXhlZDogIG5vXG4gICAgc2luZ2xlOiAgIHllc1xuICByZXR1cm4gQHJlYWRfc3ViIGRiLCBzZXR0aW5ncywgKCBbIGdseXBoLCBsaW5ldXBfZ2x5cGhzLCBdICkgPT5cbiAgICBmb3IgbGluZXVwX2dseXBoIGluIGxpbmV1cF9nbHlwaHNcbiAgICAgIGRvICggbGluZXVwX2dseXBoICkgPT5cbiAgICAgICAgZ3RlID0gXCJzb3xnbHlwaDoje2xpbmV1cF9nbHlwaH18ZmFjdG9yL3N0cm9rZWNsYXNzL3diZjpcIlxuICAgICAgICBzdWJfaW5wdXQgPSBkYlsgJyVzZWxmJyBdLmNyZWF0ZUtleVN0cmVhbSB7IGd0ZTogZ3RlLCBsdGU6IEBfbHRlX2Zyb21fZ3RlIGd0ZSwgfVxuICAgICAgICByZXR1cm4gc3ViX2lucHV0XG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuSE9MTEVSSVRILiRwaWNrX3N1YmplY3QgPSAtPlxuICByZXR1cm4gJCAoIGxrZXksIHNlbmQgKSA9PlxuICAgIFsgcHQsIF8sIHYwLCBfLCB2MSwgXSA9IGxrZXlcbiAgICBzZW5kIGlmIHB0IGlzICdzbycgdGhlbiB2MCBlbHNlIHYxXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuSE9MTEVSSVRILiRwaWNrX29iamVjdCA9IC0+XG4gIHJldHVybiAkICggbGtleSwgc2VuZCApID0+XG4gICAgWyBwdCwgXywgdjAsIF8sIHYxLCBdID0gbGtleVxuICAgIHNlbmQgaWYgcHQgaXMgJ3NvJyB0aGVuIHYxIGVsc2UgdjBcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5IT0xMRVJJVEguJHBpY2tfdmFsdWVzID0gLT5cbiAgcmV0dXJuICQgKCBsa2V5LCBzZW5kICkgPT5cbiAgICBbIHB0LCBfLCB2MCwgXywgdjEsIF0gPSBsa2V5XG4gICAgc2VuZCBpZiBwdCBpcyAnc28nIHRoZW4gWyB2MCwgdjEsIF0gZWxzZSBbIHYxLCB2MCwgXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBjb3B5X2ppenVyYV9kYiA9IC0+XG4gIGRzX29wdGlvbnMgID0gcmVxdWlyZSAnL1ZvbHVtZXMvU3RvcmFnZS9pby9qaXp1cmEtZGF0YXNvdXJjZXMvb3B0aW9ucydcbiAgc291cmNlX2RiICAgPSBIT0xMRVJJVEgubmV3X2RiIG9wdGlvbnNbICdyb3V0ZScgXVxuICB0YXJnZXRfZGIgICA9IEhPTExFUklUSC5uZXdfZGIgJy9Wb2x1bWVzL1N0b3JhZ2UvdGVtcC9qaXp1cmEtaG9sbGVyaXRoMidcbiAgZ3RlICAgICAgICAgPSAnc298J1xuICAjIGd0ZSAgICAgICAgID0gJ3NvfGdseXBoOvCkioInICMgISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISFcbiAgbHRlICAgICAgICAgPSBAX2x0ZV9mcm9tX2d0ZSBndGVcbiAgaW5wdXQgICAgICAgPSBzb3VyY2VfZGJbICclc2VsZicgXS5jcmVhdGVLZXlTdHJlYW0geyBndGUsIGx0ZSwgfVxuICBiYXRjaF9zaXplICA9IDEwMDAwXG4gIG91dHB1dCAgICAgID0gSE9MTEVSSVRILiR3cml0ZSB0YXJnZXRfZGIsIGJhdGNoX3NpemVcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBpbnB1dFxuICAgIC5waXBlIEQuJGNvdW50ICggY291bnQgKSAtPiBoZWxwIFwicmVhZCAje2NvdW50fSBrZXlzXCJcbiAgICAucGlwZSBAXyRzcGxpdF9zb19ia2V5KClcbiAgICAjIC5waXBlICQgKCBrZXksIHNlbmQgKSA9PlxuICAgICMgICAjIyMgISEhISEgIyMjXG4gICAgIyAgIFsgZ2x5cGgsIHByZCwgb2JqLCBpZHgsIF0gPSBrZXlcbiAgICAjICAgc2VuZCBrZXkgaWYgZ2x5cGggaW4gWyAn5LitJywgJ+WciycsICfnmocnLCAn5bidJywgXVxuICAgIC5waXBlICQgKCBrZXksIHNlbmQgKSA9PlxuICAgICAgWyBnbHlwaCwgcHJkLCBvYmosIGlkeCwgXSA9IGtleVxuICAgICAgc2VuZCBrZXkgdW5sZXNzIHByZCBpcyAncG9kJ1xuICAgIC5waXBlIEQuJGNvdW50ICggY291bnQgKSAtPiBoZWxwIFwia2VwdCAje2NvdW50fSBlbnRyaWVzXCJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIC5waXBlIGRvID0+XG4gICAgICBidWZmZXIgICAgICA9IG51bGxcbiAgICAgIG1lbW8gICAgICAgID0gbnVsbFxuICAgICAgbGFzdF9zcCAgICAgPSBudWxsXG4gICAgICAjIHdpdGhpbl9saXN0ID0gbm9cbiAgICAgIHJldHVybiAkICgga2V5LCBzZW5kICkgPT5cbiAgICAgICAgWyBzYmosIHByZCwgb2JqLCBpZHgsIF0gPSBrZXlcbiAgICAgICAgaWYgaWR4P1xuICAgICAgICAgIHNwID0gXCIje3Nian18I3twcmR9XCJcbiAgICAgICAgICBpZiBzcCBpcyBsYXN0X3NwXG4gICAgICAgICAgICBidWZmZXJbIGlkeCBdID0gb2JqXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgc2VuZCBbIG1lbW8uLi4sIGJ1ZmZlciwgXSBpZiBidWZmZXI/XG4gICAgICAgICAgICBidWZmZXIgICAgICAgID0gW11cbiAgICAgICAgICAgIGJ1ZmZlclsgaWR4IF0gPSBvYmpcbiAgICAgICAgICAgIG1lbW8gICAgICAgICAgPSBbIHNiaiwgcHJkLCBdXG4gICAgICAgICAgICBsYXN0X3NwICAgICAgID0gc3BcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHNlbmQgWyBzYmosIHByZCwgb2JqLCBdXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAucGlwZSAkICggWyBzYmosIHByZCwgb2JqLCBdLCBzZW5kICkgPT5cbiAgICAgICMjIyBDb21wYWN0aWZ5IHNwYXJzZSBsaXN0cyBzbyBhbGwgYHVuZGVmaW5lZGAgZWxlbWVudHMgYXJlIHJlbW92ZWQ7IHdhcm4gYWJvdXQgdGhpcyAjIyNcbiAgICAgIGlmICggQ05ELnR5cGVfb2Ygb2JqICkgaXMgJ2xpc3QnXG4gICAgICAgIG5ld19vYmogPSAoIGVsZW1lbnQgZm9yIGVsZW1lbnQgaW4gb2JqIHdoZW4gZWxlbWVudCBpc250IHVuZGVmaW5lZCApXG4gICAgICAgIGlmIG9iai5sZW5ndGggaXNudCBuZXdfb2JqLmxlbmd0aFxuICAgICAgICAgIHdhcm4gXCJwaHJhc2UgI3tycHIgWyBzYmosIHByZCwgb2JqLCBdfSBjb250YWluZWQgdW5kZWZpbmVkIGVsZW1lbnRzOyBjb21wYWN0aWZpZWRcIlxuICAgICAgICBvYmogPSBuZXdfb2JqXG4gICAgICBzZW5kIFsgc2JqLCBwcmQsIG9iaiwgXVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyAucGlwZSBELiRzaG93KClcbiAgICAucGlwZSAkICggWyBzYmosIHByZCwgb2JqLCBdLCBzZW5kICkgPT5cbiAgICAgICMjIyBUeXBlIENhc3RpbmcgIyMjXG4gICAgICB0eXBlX2Rlc2NyaXB0aW9uID0gZHNfb3B0aW9uc1sgJ3NjaGVtYScgXVsgcHJkIF1cbiAgICAgIHVubGVzcyB0eXBlX2Rlc2NyaXB0aW9uP1xuICAgICAgICB3YXJuIFwibm8gdHlwZSBkZXNjcmlwdGlvbiBmb3IgcHJlZGljYXRlICN7cnByIHByZH1cIlxuICAgICAgZWxzZVxuICAgICAgICBzd2l0Y2ggdHlwZSA9IHR5cGVfZGVzY3JpcHRpb25bICd0eXBlJyBdXG4gICAgICAgICAgd2hlbiAnaW50J1xuICAgICAgICAgICAgb2JqID0gcGFyc2VJbnQgb2JqLCAxMFxuICAgICAgICAgIHdoZW4gJ3RleHQnXG4gICAgICAgICAgICAjIyMgVEFJTlQgd2UgaGF2ZSBubyBib29sZWFucyBjb25maWd1cmVkICMjI1xuICAgICAgICAgICAgaWYgICAgICBvYmogaXMgJ3RydWUnICAgdGhlbiBvYmogPSB0cnVlXG4gICAgICAgICAgICBlbHNlIGlmIG9iaiBpcyAnZmFsc2UnICB0aGVuIG9iaiA9IGZhbHNlXG4gICAgICBzZW5kIFsgc2JqLCBwcmQsIG9iaiwgXVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgLnBpcGUgZG8gPT5cbiAgICAgIGNvdW50ID0gMFxuICAgICAgcmV0dXJuICQgKCBwaHJhc2UsIHNlbmQgKSA9PlxuICAgICAgICBjb3VudCArPSAxXG4gICAgICAgICMgISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhXG4gICAgICAgICMgaWYgY291bnQgJSAxMDAwMCBpcyAwXG4gICAgICAgICMgICBlY2hvIGNvdW50LCBwaHJhc2VcbiAgICAgICAgc2VuZCBwaHJhc2VcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIC5waXBlIG91dHB1dFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBkdW1wX2ppenVyYV9kYiA9IC0+XG4gIHNvdXJjZV9kYiAgID0gSE9MTEVSSVRILm5ld19kYiAnL1ZvbHVtZXMvU3RvcmFnZS90ZW1wL2ppenVyYS1ob2xsZXJpdGgyJ1xuICBwcmVmaXggICAgICA9IFsgJ3NwbycsICfwoY+gJywgXVxuICBwcmVmaXggICAgICA9IFsgJ3NwbycsICfjlLAnLCBdXG4gIGlucHV0ICAgICAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gc291cmNlX2RiLCBwcmVmaXhcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBpbnB1dFxuICAgIC5waXBlIEQuJGNvdW50ICggY291bnQgKSAtPiBoZWxwIFwicmVhZCAje2NvdW50fSBrZXlzXCJcbiAgICAucGlwZSAkICggZGF0YSwgc2VuZCApID0+IHNlbmQgSlNPTi5zdHJpbmdpZnkgZGF0YVxuICAgIC5waXBlIEQuJHNob3coKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMjIyB2ZXJzaW9uIGZvciBIb2xsZXJpdGgxIERCcyAjIyNcbkBmaW5kX2dvb2Rfa3dpY19zYW1wbGVfZ2x5cGhzXzEgPSAoIGRiICkgLT5cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICB1bmxlc3MgZGI/XG4gICAgICB5aWVsZCBAaW5pdGlhbGl6ZSByZXN1bWVcbiAgICAgIGRiID0gb3B0aW9uc1sgJ2RiJyBdXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBDSFIgPSByZXF1aXJlICcvVm9sdW1lcy9TdG9yYWdlL2lvL2NvZmZlZW5vZGUtY2hyJ1xuICAgIGNocnNfZnJvbV90ZXh0ID0gKCB0ZXh0ICkgLT4gQ0hSLmNocnNfZnJvbV90ZXh0IHRleHQsIGlucHV0OiAneG5jcidcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGd0ZSAgICAgPSAnb3N8Z3VpZGUvbGluZXVwL2xlbmd0aDowNSdcbiAgICBsdGUgICAgID0gQF9sdGVfZnJvbV9ndGUgZ3RlXG4gICAgaW5wdXQgICA9IGRiWyAnJXNlbGYnIF0uY3JlYXRlS2V5U3RyZWFtIHsgZ3RlOiBndGUsIGx0ZTogbHRlLCB9XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBkZWNvZGVfcmFuayA9ICggYmtleSApID0+XG4gICAgICBbIC4uLiwgcmFua190eHQsIF0gPSBAX3NwbGl0X2JrZXkgYmtleVxuICAgICAgcmV0dXJuIHBhcnNlSW50IHJhbmtfdHh0LCAxMFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgZGVjb2RlX2xpbmV1cCA9ICggYmtleSApID0+XG4gICAgICBbIC4uLiwgbGluZXVwLCBdID0gQF9zcGxpdF9ia2V5IGJrZXlcbiAgICAgIGxpbmV1cCA9IGxpbmV1cC5yZXBsYWNlIC9cXHUzMDAwL2csICcnXG4gICAgICByZXR1cm4gY2hyc19mcm9tX3RleHQgbGluZXVwXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICB4bmNyX2Zyb21fdWNociA9ICggdWNociApID0+XG4gICAgICByZXR1cm4gaWYgKCBDSFIuYXNfcnNnIHVjaHIgKSBpcyAndS1wdWEnIHRoZW4gKCBDSFIuYXNfeG5jciB1Y2hyLCBjc2c6ICdqenInICkgZWxzZSB1Y2hyXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpbnB1dFxuICAgICAgLnBpcGUgQF8kc3BsaXRfYmtleSgpXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIC5waXBlIEhPTExFUklUSC5yZWFkX3N1YiBkYiwgbWFuZ2xlOiBkZWNvZGVfcmFuaywgKCBwaHJhc2UgKSA9PlxuICAgICAgICBbIC4uLiwgZ2x5cGgsIF0gICAgICAgICAgID0gcGhyYXNlXG4gICAgICAgIHN1Yl9ndGUgICAgID0gXCJzb3xnbHlwaDoje2dseXBofXxyYW5rL2NqdDpcIlxuICAgICAgICBzdWJfbHRlICAgICA9IEBfbHRlX2Zyb21fZ3RlIHN1Yl9ndGVcbiAgICAgICAgc3ViX2lucHV0ICAgPSBkYlsgJyVzZWxmJyBdLmNyZWF0ZUtleVN0cmVhbSB7IGd0ZTogc3ViX2d0ZSwgbHRlOiBzdWJfbHRlLCB9XG4gICAgICAgIHJldHVybiBbIGdseXBoLCBzdWJfaW5wdXQsIF1cbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgLnBpcGUgRC4kZmlsdGVyICggWyBnbHlwaCwgcmFuaywgXSApIC0+IHJhbmsgPCAxNTAwXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIC5waXBlIEhPTExFUklUSC5yZWFkX3N1YiBkYiwgbWFuZ2xlOiBkZWNvZGVfbGluZXVwLCAoIHJlY29yZCApID0+XG4gICAgICAgIFsgZ2x5cGgsIHJhbmssIF0gID0gcmVjb3JkXG4gICAgICAgIHN1Yl9ndGUgICAgICAgICAgID0gXCJzb3xnbHlwaDoje2dseXBofXxndWlkZS9saW5ldXAvdWNocjpcIlxuICAgICAgICBzdWJfbHRlICAgICAgICAgICA9IEBfbHRlX2Zyb21fZ3RlIHN1Yl9ndGVcbiAgICAgICAgc3ViX2lucHV0ICAgICAgICAgPSBkYlsgJyVzZWxmJyBdLmNyZWF0ZUtleVN0cmVhbSB7IGd0ZTogc3ViX2d0ZSwgbHRlOiBzdWJfbHRlLCB9XG4gICAgICAgIHJldHVybiBbIFsgZ2x5cGgsIHJhbmssIF0sIHN1Yl9pbnB1dCwgXVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAucGlwZSBIT0xMRVJJVEgucmVhZF9zdWIgZGIsICggcmVjb3JkICkgPT5cbiAgICAgICAgWyBbIGdseXBoLCByYW5rLCBdLCBndWlkZXMsIF0gPSByZWNvcmRcbiAgICAgICAgY29uZmx1ZW5jZSAgICAgICAgICAgICAgICAgICAgPSBELmNyZWF0ZV90aHJvdWdoc3RyZWFtKClcbiAgICAgICAgc3RyZWFtX2NvdW50ICAgICAgICAgICAgICAgICAgPSAwXG4gICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgICAgZm9yIGd1aWRlIGluIGd1aWRlc1xuICAgICAgICAgIGRvICggZ3VpZGUgKSA9PlxuICAgICAgICAgICAgZ3VpZGVfeG5jciAgICAgICAgPSB4bmNyX2Zyb21fdWNociBndWlkZVxuICAgICAgICAgICAgc3RyZWFtX2NvdW50ICAgICArPSArMVxuICAgICAgICAgICAgc3ViX2d0ZSAgICAgICAgICAgPSBcInNvfGdseXBoOiN7Z3VpZGVfeG5jcn18ZmFjdG9yL3NoYXBlY2xhc3Mvd2JmOlwiXG4gICAgICAgICAgICBzdWJfbHRlICAgICAgICAgICA9IEBfbHRlX2Zyb21fZ3RlIHN1Yl9ndGVcbiAgICAgICAgICAgIHN1Yl9pbnB1dCAgICAgICAgID0gZGJbICclc2VsZicgXS5jcmVhdGVLZXlTdHJlYW0geyBndGU6IHN1Yl9ndGUsIGx0ZTogc3ViX2x0ZSwgfVxuICAgICAgICAgICAgc3ViX2lucHV0Lm9uICdlbmQnLCAtPlxuICAgICAgICAgICAgICBzdHJlYW1fY291bnQgKz0gLTFcbiAgICAgICAgICAgICAgaWYgc3RyZWFtX2NvdW50IDwgMVxuICAgICAgICAgICAgICAgIGNvbmZsdWVuY2UuZW5kKClcbiAgICAgICAgICAgIHN1Yl9pbnB1dFxuICAgICAgICAgICAgICAucGlwZSBAXyRzcGxpdF9ia2V5KClcbiAgICAgICAgICAgICAgLnBpcGUgJCAoIGRhdGEsIHNlbmQgKSA9PlxuICAgICAgICAgICAgICAgIFsgLi4uLCBzaGFwZWNsYXNzX3diZiwgXSA9IGRhdGFcbiAgICAgICAgICAgICAgICBjb25mbHVlbmNlLndyaXRlIFsgZ3VpZGUsIHNoYXBlY2xhc3Nfd2JmLCBdXG4gICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgICAgcmV0dXJuIFsgWyBnbHlwaCwgcmFuaywgZ3VpZGVzLCBdLCBjb25mbHVlbmNlLCBdXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIC5waXBlICQgKCBkYXRhLCBzZW5kICkgLT4gc2VuZCBKU09OLnN0cmluZ2lmeSBkYXRhXG4gICAgICAucGlwZSBELiRzaG93KClcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIyMgdmVyc2lvbiBmb3IgSG9sbGVyaXRoMiBEQnMgIyMjXG5AZmluZF9nb29kX2t3aWNfc2FtcGxlX2dseXBoc18yID0gKCBkYiApIC0+XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgZGIgPz0gSE9MTEVSSVRILm5ld19kYiAnL1ZvbHVtZXMvU3RvcmFnZS90ZW1wL2ppenVyYS1ob2xsZXJpdGgyJ1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgQ0hSID0gcmVxdWlyZSAnL1ZvbHVtZXMvU3RvcmFnZS9pby9jb2ZmZWVub2RlLWNocidcbiAgICBjaHJzX2Zyb21fdGV4dCA9ICggdGV4dCApIC0+IENIUi5jaHJzX2Zyb21fdGV4dCB0ZXh0LCBpbnB1dDogJ3huY3InXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwcmVmaXggID0gWyAncG9zJywgJ2d1aWRlL2xpbmV1cC9sZW5ndGgnLCA1LCBdXG4gICAgaW5wdXQgICA9IEhPTExFUklUSC5jcmVhdGVfcGhyYXNlc3RyZWFtIGRiLCBwcmVmaXhcbiAgICAjICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyBkZWNvZGVfcmFuayA9ICggYmtleSApID0+XG4gICAgIyAgIFsgLi4uLCByYW5rX3R4dCwgXSA9IEBfc3BsaXRfYmtleSBia2V5XG4gICAgIyAgIHJldHVybiBwYXJzZUludCByYW5rX3R4dCwgMTBcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGRlY29kZV9saW5ldXAgPSAoIGRhdGEgKSA9PlxuICAgICAgWyAuLi4sIGxpbmV1cCwgXSA9IGRhdGFcbiAgICAgIHJldHVybiBjaHJzX2Zyb21fdGV4dCBsaW5ldXAucmVwbGFjZSAvXFx1MzAwMC9nLCAnJ1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgeG5jcl9mcm9tX3VjaHIgPSAoIHVjaHIgKSA9PlxuICAgICAgcmV0dXJuIGlmICggQ0hSLmFzX3JzZyB1Y2hyICkgaXMgJ3UtcHVhJyB0aGVuICggQ0hSLmFzX3huY3IgdWNociwgY3NnOiAnanpyJyApIGVsc2UgdWNoclxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaW5wdXRcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgLnBpcGUgSE9MTEVSSVRILnJlYWRfc3ViIGRiLCAoIHBocmFzZSApID0+XG4gICAgICAgIFsgZ2x5cGgsIF8sIGxpbmV1cF9sZW5ndGgsIF0gICAgPSBwaHJhc2VcbiAgICAgICAgc3ViX3ByZWZpeCAgICAgICAgICAgICAgICAgICAgICA9IFsgJ3NwbycsIGdseXBoLCAncmFuay9janQnLCBdXG4gICAgICAgIHN1Yl9pbnB1dCAgICAgICAgICAgICAgICAgICAgICAgPSBIT0xMRVJJVEguY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgc3ViX3ByZWZpeFxuICAgICAgICByZXR1cm4gWyBbIGdseXBoLCBsaW5ldXBfbGVuZ3RoLCBdLCBzdWJfaW5wdXQsIF1cbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgLnBpcGUgJCAoIGRhdGEsIHNlbmQgKSA9PlxuICAgICAgICBbIFsgZ2x5cGgsIGxpbmV1cF9sZW5ndGgsIF0sIFsgXywgXywgcmFuaywgXSwgXSA9IGRhdGFcbiAgICAgICAgc2VuZCBbIGdseXBoLCBsaW5ldXBfbGVuZ3RoLCByYW5rLCBdXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIC5waXBlIEQuJGZpbHRlciAoIFsgZ2x5cGgsIGxpbmV1cF9sZW5ndGgsIHJhbmssIF0gKSAtPiByYW5rIDwgMTUwMDBcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgLnBpcGUgSE9MTEVSSVRILnJlYWRfc3ViIGRiLCBtYW5nbGU6IGRlY29kZV9saW5ldXAsICggZGF0YSApID0+XG4gICAgICAgIFsgZ2x5cGgsIGxpbmV1cF9sZW5ndGgsIHJhbmssIF0gPSBkYXRhXG4gICAgICAgIHN1Yl9wcmVmaXggICAgICAgICAgICAgICAgICAgICAgPSBbICdzcG8nLCBnbHlwaCwgJ2d1aWRlL2xpbmV1cC91Y2hyJywgXVxuICAgICAgICBzdWJfaW5wdXQgICAgICAgICAgICAgICAgICAgICAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIHN1Yl9wcmVmaXhcbiAgICAgICAgcmV0dXJuIFsgWyBnbHlwaCwgbGluZXVwX2xlbmd0aCwgcmFuaywgXSwgc3ViX2lucHV0LCBdXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIC5waXBlIEhPTExFUklUSC5yZWFkX3N1YiBkYiwgKCBkYXRhICkgPT5cbiAgICAgICAgWyBbIGdseXBoLCBsaW5ldXBfbGVuZ3RoLCByYW5rLCBdLCBndWlkZXMsIF0gID0gZGF0YVxuICAgICAgICBjb25mbHVlbmNlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBELmNyZWF0ZV90aHJvdWdoc3RyZWFtKClcbiAgICAgICAgc3RyZWFtX2NvdW50ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gMFxuICAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAgIGZvciBndWlkZSBpbiBndWlkZXNcbiAgICAgICAgICBkbyAoIGd1aWRlICkgPT5cbiAgICAgICAgICAgIGd1aWRlX3huY3IgICAgICAgID0geG5jcl9mcm9tX3VjaHIgZ3VpZGVcbiAgICAgICAgICAgIHN0cmVhbV9jb3VudCAgICAgKz0gKzFcbiAgICAgICAgICAgIHN1Yl9wcmVmaXggICAgICAgID0gWyAnc3BvJywgZ3VpZGVfeG5jciwgJ2ZhY3Rvci9zaGFwZWNsYXNzL3diZicsIF1cbiAgICAgICAgICAgIHN1Yl9pbnB1dCAgICAgICAgID0gSE9MTEVSSVRILmNyZWF0ZV9waHJhc2VzdHJlYW0gZGIsIHN1Yl9wcmVmaXhcbiAgICAgICAgICAgIHN1Yl9pbnB1dC5vbiAnZW5kJywgLT5cbiAgICAgICAgICAgICAgc3RyZWFtX2NvdW50ICs9IC0xXG4gICAgICAgICAgICAgIGlmIHN0cmVhbV9jb3VudCA8IDFcbiAgICAgICAgICAgICAgICBjb25mbHVlbmNlLmVuZCgpXG4gICAgICAgICAgICBzdWJfaW5wdXRcbiAgICAgICAgICAgICAgLnBpcGUgJCAoIGRhdGEsIHNlbmQgKSA9PlxuICAgICAgICAgICAgICAgIFsgLi4uLCBzaGFwZWNsYXNzX3diZiwgXSA9IGRhdGFcbiAgICAgICAgICAgICAgICBjb25mbHVlbmNlLndyaXRlIHNoYXBlY2xhc3Nfd2JmXG4gICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgICAgcmV0dXJuIFsgWyBnbHlwaCwgbGluZXVwX2xlbmd0aCwgcmFuaywgZ3VpZGVzLCBdLCBjb25mbHVlbmNlLCBdXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIC5waXBlIEQuJGZpbHRlciAoIGRhdGEgKSA9PlxuICAgICAgICBbIFsgZ2x5cGgsIGxpbmV1cF9sZW5ndGgsIHJhbmssIGd1aWRlcywgXSwgc2hhcGVjbGFzc2VzX3diZi4uLiwgXSA9IGRhdGFcbiAgICAgICAgY291bnRzID0gWyAwLCAwLCAwLCAwLCAwLCBdXG4gICAgICAgIGZvciBzaGFwZWNsYXNzX3diZiBpbiBzaGFwZWNsYXNzZXNfd2JmXG4gICAgICAgICAgc2hhcGVjbGFzc19pZHggICAgICAgICAgICA9ICggcGFyc2VJbnQgc2hhcGVjbGFzc193YmZbIDAgXSwgMTAgKSAtIDFcbiAgICAgICAgICBjb3VudHNbIHNoYXBlY2xhc3NfaWR4IF0gKz0gKzFcbiAgICAgICAgcmV0dXJuICggY291bnRzLmpvaW4gJywnICkgaXMgJzEsMSwxLDEsMSdcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgLnBpcGUgJCAoIGRhdGEsIHNlbmQgKSAtPiBzZW5kIEpTT04uc3RyaW5naWZ5IGRhdGFcbiAgICAgIC5waXBlIEQuJHNob3coKVxuXG4jICdcXHUwMDAwJyxcbiMgICAnXFx1MDAwMScsXG4jICAgJ1xcdTAwMDInLFxuIyAgICdcXHUwMDAzJyxcbiMgICAnXFx1MDAwNCcsXG4jICAgJ1xcdTAwMDUnLFxuIyAgICdcXHUwMDA2JyxcbiMgICAnXFx1MDAwNycsXG4jICAgJ1xcYicsXG4jICAgJ1xcdCcsXG4jICAgJ1xcbicsXG4jICAgJ1xcdTAwMGInLFxuIyAgICdcXGYnLFxuIyAgICdcXHInLFxuIyAgICdcXHUwMDBlJyxcbiMgICAnXFx1MDAwZicsXG4jICAgJ1xcdTAwMTAnLFxuIyAgICdcXHUwMDExJyxcbiMgICAnXFx1MDAxMicsXG4jICAgJ1xcdTAwMTMnLFxuIyAgICdcXHUwMDE0JyxcbiMgICAnXFx1MDAxNScsXG4jICAgJ1xcdTAwMTYnLFxuIyAgICdcXHUwMDE3JyxcbiMgICAnXFx1MDAxOCcsXG4jICAgJ1xcdTAwMTknLFxuIyAgICdcXHUwMDFhJyxcbiMgICAnXFx1MDAxYicsXG4jICAgJ1xcdTAwMWMnLFxuIyAgICdcXHUwMDFkJyxcbiMgICAnXFx1MDAxZScsXG4jICAgJ1xcdTAwMWYnLFxuXG5cblwiXCJcIlxu44CH44CTXG7ikIDikIHikILikIPikITikIXikIbikIfikIjikInikIrikIvikIzikI3ikI7ikI/ikJDikJHikJLikJPikJTikJXikJbikJfikJjikJnikJrikJvikJzikJ3ikJ7ikJ/ikKDikKHikKLikKPikKTikKXikKZcbuKStuKSt+KSuOKSueKSuuKSu+KSvOKSveKSvuKSv+KTgOKTgeKTguKTg+KThOKTheKThuKTh+KTiOKTieKTiuKTi+KTjOKTjeKTjuKTj+KTkOKTkeKTkuKTk+KTlOKTleKTluKTl+KTmOKTmeKTmuKTm+KTnOKTneKTnuKTn+KToOKToeKTouKTo+KTpOKTpeKTpuKTp+KTqOKTqVxu77yB77yC77yD77yE77yF77yG77yH77yI77yJ77yK77yL77yM77yN77yO77yP77yQ77yR77yS77yT77yU77yV77yW77yX77yY77yZ77ya77yb77yc77yd77ye77yf77yg77yh77yi77yj77yk77yl77ym77yn77yo77yp77yq77yr77ys77yt77yu77yv77yw77yx77yy77yz77y077y177y277y377y477y577y677y777y877y977y+77y/772A772B772C772D772E772F772G772H772I772J772K772L772M772N772O772P772Q772R772S772T772U772V772W772X772Y772Z772a772b772c772d772e772f772gXG4hXCIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P1xuQEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaW1xcXV5fXG5gYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXp7fH1+f8KAXG7CgcKCwoPChMKFwobCh8KIwonCisKLwozCjcKOwo/CkMKRwpLCk8KUwpXClsKXwpjCmcKawpvCnMKdwp7Cn1xuwqHCosKjwqTCpcKmwqfCqMKpwqrCq8Kswq3CrsKvwrDCscKywrPCtMK1wrbCt8K4wrnCusK7wrzCvcK+wr/DgFxuw4HDgsODw4TDhcOGw4fDiMOJw4rDi8OMw43DjsOPw5DDkcOSw5PDlMOVw5bDl8OYw5nDmsObw5zDncOew5/DoFxuw6HDosOjw6TDpcOmw6fDqMOpw6rDq8Osw63DrsOvw7DDscOyw7PDtMO1w7bDt8O4w7nDusO7w7zDvcO+w79cblwiXCJcIlxuXG5cIlwiXCJcblxu4pO/4p224p234p244p254p264p274p284p294p2+4p2/4pOr4pOs4pOt4pOu4pOv4pOw4pOx4pOy4pOz4pO0XG7ik7Xik7bik7fik7jik7nik7rik7vik7zik73ik75cbuONmOONmeONmuONm+ONnOONneONnuONn+ONoOONoeONouONo+ONpOONpeONpuONp+ONqOONqeONquONq+ONrOONreONruONr+ONsFxu4pG04pG14pG24pG34pG44pG54pG64pG74pG84pG94pG+4pG/4pKA4pKB4pKC4pKD4pKE4pKF4pKG4pKHXG7ikojikonikorikovikoziko3iko7iko/ikpDikpHikpLikpPikpTikpXikpbikpfikpjikpnikprikptcbuKSnOKSneKSnuKSn+KSoOKSoeKSouKSo+KSpOKSpeKSpuKSp+KSqOKSqeKSquKSq+KSrOKSreKSruKSr+KSsOKSseKSsuKSs+KStOKStVxu44ig44ih44ii44ij44ik44il44im44in44io44ipXG5cbuOLgOOLgeOLguOLg+OLhOOLheOLhuOLh+OLiOOLieOLiuOLi1xuXG7jiIDjiIHjiILjiIPjiITjiIXjiIbjiIfjiIjjiInjiIrjiIvjiIzjiI3jiI7jiI/jiJDjiJHjiJLjiJPjiJTjiJXjiJbjiJfjiJjjiJnjiJrjiJvjiJzjiJ3jiJ7jiJ9cbuOIquOIq+OIrOOIreOIruOIr+OIsOOIseOIsuOIs+OItOOIteOItuOIt+OIuOOIueOIuuOIu+OIvOOIveOIvuOIv1xu44mA44mB44mC44mD44mE44mF44mG44mHXG7jiaDjiaHjiaLjiaPjiaTjiaXjiabjiafjiajjianjiarjiavjiazjia3jia7jia/jibDjibHjibLjibPjibTjibXjibbjibfjibjjibnjibrjibvjibzjib3jib7jib9cbuOMgOOMgeOMguOMg+OMhOOMheOMhuOMh+OMiOOMieOMiuOMi+OMjOOMjeOMjuOMj+OMkOOMkeOMkuOMk+OMlOOMleOMluOMl+OMmOOMmeOMmuOMm+OMnOOMneOMnuOMn1xu44yg44yh44yi44yj44yk44yl44ym44yn44yo44yp44yq44yr44ys44yt44yu44yv44yw44yx44yy44yz44y044y144y244y344y444y544y644y744y844y944y+44y/XG7jjYDjjYHjjYLjjYPjjYTjjYXjjYbjjYfjjYjjjYnjjYrjjYvjjYzjjY3jjY7jjY/jjZDjjZHjjZLjjZPjjZTjjZXjjZbjjZdcbuKIjuKIjuKIjuKIjuKIjuKIjuKIjuKIjuKIjuKIjuKIjuKIjuKIjuKIjuKIjuKIjuKIjuKIjuKIjuKIjuKIjuKIjuKIjuKIjuKIjuKIjuKIjuKIjuKIjuKIjuKIjuKIjlxu4pqA4pqB4pqC4pqD4pqE4pqF4pqA4pqB4pqC4pqD4pqE4pqF4pqA4pqB4pqC4pqD4pqE4pqF4pqA4pqB4pqC4pqD4pqE4pqF4pqA4pqB4pqC4pqD4pqE4pqF4pqE4pqFXG7EkMSRxJLEk8SUxJXElsSXxJjEmcSaxJvEnMSdxJ7En8SgxKHEosSjxKTEpcSmxKfEqMSpxKrEq8SsxK3ErsSvXG4gICAg44CT44+g44+h44+i44+j44+k44+l44+m44+n44+o44+p44+q44+r44+s44+t44+u44+v44+w44+x44+y44+z44+044+144+244+344+444+544+644+744+844+944++XG4gICAg44CT4pK24pK34pK44pK54pK64pK74pK84pK94pK+4pK/4pOA4pOB4pOC4pOD4pOE4pOF4pOG4pOH4pOI4pOJ4pOK4pOL4pOM4pON4pOO4pOP44CT44CT44CT44CT44CTXG4gICAg44CT4pOQ4pOR4pOS4pOT4pOU4pOV4pOW4pOX4pOY4pOZ4pOa4pOb4pOc4pOd4pOe4pOf4pOg4pOh4pOi4pOj4pOk4pOl4pOm4pOn4pOo4pOp44CT44CT44CT44CT44CTXG5cblwiXCJcIlxuXG5AZW5jb2RpbmdzID1cblxuICBkYmNzMjogXCJcIlwiXG4gICAg4pOq4pGg4pGh4pGi4pGj4pGk4pGl4pGm4pGn4pGo4pGp4pGq4pGr4pGs4pGt4pGu4pGv4pGw4pGx4pGy4pGz44mR44mS44mT44mU44mV44mW44mX44mY44mZ44ma44mbXG4gICAg44mc77yB77yC77yD77yE77yF77yG77yH77yI77yJ77yK77yL77yM77yN77yO77yP77yQ77yR77yS77yT77yU77yV77yW77yX77yY77yZ77ya77yb77yc77yd77ye77yfXG4gICAg77yg77yh77yi77yj77yk77yl77ym77yn77yo77yp77yq77yr77ys77yt77yu77yv77yw77yx77yy77yz77y077y177y277y377y477y577y677y777y877y977y+77y/XG4gICAg772A772B772C772D772E772F772G772H772I772J772K772L772M772N772O772P772Q772R772S772T772U772V772W772X772Y772Z772a772b772c772d772e44mgXG4gICAg44md44me44mf44qx44qy44qz44q044q144q244q344q444q544q644q744q844q944q+44q/44uQ44uR44uS44uT44uU44uV44uW44uX44uY44uZ44ua44ub44uc44udXG4gICAg44ue44uf44ug44uh44ui44uj44uk44ul44um44un44uo44up44uq44ur44us44ut44uu44uv44uw44ux44uy44uz44u044u144u244u344u444u544u644u744u844u9XG4gICAg44u+44qK44qL44qM44qN44qO44qP44qQ44qR44qS44qT44qU44qV44qW44qX44qY44qZ44qa44qb44qc44qd44qe44qf44qg44qh44qi44qj44qk44ql44qm44qn44qoXG4gICAg44qp44qq44qr44qs44qt44qu44qv44qw44qA44qB44qC44qD44qE44qF44qG44qH44qI44qJ44mI44mJ44mK44mL44mM44mN44mO44mP4pO14pO24pO34pO44pO544CTXG4gICAgXCJcIlwiXG5cbiAgYWxlcGg6IFwiXCJcIlxuICAgINCR0JTQmNCb0KbQp9Co0K3QrsaGxovGj8aQxpTGpcanxrjPiMWQxZHFksWTxYrFgcWC0K/JlMmYyZDJlcmZyZ5cbiAgICDikKMhXCIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P1xuICAgIEBBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXFxcXV5fXG4gICAgYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fs+JXG4gICAgzpPOlM6YzpvOns6gzqPOps6ozqnOsc6yzrPOtM61zrbOt864zrnOus67zrzOvc6+z4DPgc+Cz4PPhM+Fz4bPh1xuICAgINCWwqHCosKjwqTCpcKmwqfCqMKpwqrCq8Ks0K/CrsKvwrDCscKywrPCtMK1wrbCt8K4wrnCusK7wrzCvcK+wr9cbiAgICDDgMOBw4LDg8OEw4XDhsOHw4jDicOKw4vDjMONw47Dj8OQw5HDksOTw5TDlcOWw5fDmMOZw5rDm8Ocw53DnsOfXG4gICAgw6DDocOiw6PDpMOlw6bDp8Oow6nDqsOrw6zDrcOuw6/DsMOxw7LDs8O0w7XDtsO3w7jDucO6w7vDvMO9w77Dv1xuICAgIFwiXCJcIlxuXG4gIHJkY3RuOiBcIlwiXCJcbiAgICDOlOKJoeKJoeKJoeKJoeKJoeKJoeKJoeKJoeKJoeKJoeKJoeKJoeKJoeKJoeKJoeKJoeKJoeKJoeKJoeKJoeKJoeKJoeKJoeKJoeKJoeKJoeKJoeKJoeKJoeKJoeKJoVxuICAgIOKQoyFcIiMkJSYnKCkqKywtLi8wMTIzNDU2Nzg5Ojs8PT4/XG4gICAgQEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaW1xcXFxdXl9cbiAgICBgYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXp7fH1+4omhXG4gICAg4oqq4oqq4oqq4oqq4oqq4oqq4oqq4oqq4oqq4oqq4oqq4oqq4oqq4oqq4oqq4oqq4oqq4oqq4oqq4oqq4oqq4oqq4oqq4oqq4oqq4oqq4oqq4oqq4oqq4oqq4oqq4oqqXG4gICAg4omi4omiwqLCo8KkwqXCpsKnwqjCqcKqwqvCrNCvwq7Cr8KwwrHCssKzwrTCtcK2wrfCuMK5wrrCu8K8wr3CvsK/XG4gICAgw4DDgcOCw4PDhMOFw4bDh8OIw4nDisOLw4zDjcOOw4/DkMORw5LDk8OUw5XDlsOXw5jDmcOaw5vDnMOdw57Dn1xuICAgIMOgw6HDosOjw6TDpcOmw6fDqMOpw6rDq8Osw63DrsOvw7DDscOy4omi4omi4omi4omi4omi4omi4omi4omi4omi4omi4omi4omi4oiHXG4gICAgXCJcIlwiXG5cblxuXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9jaHJzX29mID0gKCB0ZXh0ICkgLT5cbiAgdGV4dCA9IHRleHQuc3BsaXQgLyhbXFx1ZDgwMC1cXHVkYmZmXS58LikvXG4gIHJldHVybiAoIGNociBmb3IgY2hyIGluIHRleHQgd2hlbiBjaHIgaXNudCAnJyApXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQGNvbXBpbGVfZW5jb2RpbmdzID0gLT5cbiAgZm9yIG5hbWUsIGVuY29kaW5nIG9mIEBlbmNvZGluZ3NcbiAgICBlbmNvZGluZyA9IEBfY2hyc19vZiBlbmNvZGluZy5yZXBsYWNlIC9cXG4rL2csICcnXG4gICAgdW5sZXNzICggbGVuZ3RoID0gZW5jb2RpbmcubGVuZ3RoICkgaXMgMjU2XG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJleHBlY3RlZCAyNTYgY2hhcmFjdGVycywgZm91bmQgI3tsZW5ndGh9IGluIGVuY29kaW5nICN7cnByIG5hbWV9XCJcbiAgICBAZW5jb2RpbmdzWyBuYW1lIF0gPSBlbmNvZGluZ1xuICByZXR1cm4gbnVsbFxuXG5AY29tcGlsZV9lbmNvZGluZ3MoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBzaG93X2VuY29kaW5nX3NhbXBsZSA9IC0+XG4gIGVuY29kaW5nICA9IEBlbmNvZGluZ3NbICdkYmNzMicgXVxuICBlbmNvZGluZyAgPSBAZW5jb2RpbmdzWyAnYWxlcGgnIF1cbiAgZW5jb2RpbmcgID0gQGVuY29kaW5nc1sgJ3JkY3RuJyBdXG4gIHBocmFzZXMgICA9IFtcbiAgICBbICfkuIEnLCAnc3Ryb2tlY291bnQnLCAgICAgMiwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICBbICfkuIknLCAnc3Ryb2tlY291bnQnLCAgICAgMywgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICBbICflpKsnLCAnc3Ryb2tlY291bnQnLCAgICAgNSwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICBbICflnIsnLCAnc3Ryb2tlY291bnQnLCAgICAgMTEsICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICBbICflvaInLCAnc3Ryb2tlY291bnQnLCAgICAgNywgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICBbICfkuIEnLCAnY29tcG9uZW50Y291bnQnLCAgMSwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICBbICfkuIknLCAnY29tcG9uZW50Y291bnQnLCAgMSwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICBbICflpKsnLCAnY29tcG9uZW50Y291bnQnLCAgMSwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICBbICflnIsnLCAnY29tcG9uZW50Y291bnQnLCAgNCwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICBbICflvaInLCAnY29tcG9uZW50Y291bnQnLCAgMiwgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICBbICfkuIEnLCAnY29tcG9uZW50cycsICAgICAgWyAn5LiBJywgXSwgICAgICAgICAgICAgICAgICBdXG4gICAgWyAn5LiJJywgJ2NvbXBvbmVudHMnLCAgICAgIFsgJ+S4iScsIF0sICAgICAgICAgICAgICAgICAgXVxuICAgIFsgJ+WkqycsICdjb21wb25lbnRzJywgICAgICBbICflpKsnLCBdLCAgICAgICAgICAgICAgICAgIF1cbiAgICBbICflnIsnLCAnY29tcG9uZW50cycsICAgICAgWyAn5ZuXJywgJ+aIiCcsICflj6MnLCAn5LiAJywgXSwgXVxuICAgIFsgJ+W9oicsICdjb21wb25lbnRzJywgICAgICBbICflvIAnLCAn5b2hJywgXSwgICAgICAgICAgICAgXVxuICAgIF1cbiAgZm9yIFsgc2JqLCBwcmQsIG9iaiwgXSBpbiBwaHJhc2VzXG4gICAga2V5ICAgICAgID0gKCBIT0xMRVJJVEguQ09ERUMuZW5jb2RlIFsgc2JqLCBwcmQsIF0sIClcbiAgICB2YWx1ZSAgICAgPSAoIG5ldyBCdWZmZXIgSlNPTi5zdHJpbmdpZnkgb2JqIClcbiAgICBrZXlfcnByICAgPSAoIGVuY29kaW5nWyBrZXlbIGlkeCBdIF0gZm9yIGlkeCBpbiBbIDAgLi4uIGtleS5sZW5ndGggXSApLmpvaW4gJydcbiAgICB2YWx1ZV9ycHIgPSAoIGVuY29kaW5nWyB2YWx1ZVsgaWR4IF0gXSBmb3IgaWR4IGluIFsgMCAuLi4gdmFsdWUubGVuZ3RoIF0gKS5qb2luICcnXG4gICAgdXJnZSBrZXlfcnByLCAn4pSKJywgdmFsdWVfcnByXG4gIHRleHQgPSBuZXcgQnVmZmVyICfkuIAnXG4gIHRleHRfcnByID0gKCBlbmNvZGluZ1sgdGV4dFsgaWR4IF0gXSBmb3IgaWR4IGluIFsgMCAuLi4gdGV4dC5sZW5ndGggXSApLmpvaW4gJydcbiAgaGVscCB0ZXh0LCB0ZXh0X3JwclxuXG4gICMgY2hycyA9IFtdXG4gICMgZm9yIGNpZCBpbiBbIDAgLi4gMjU1IF1cbiAgIyAgIGNocnMucHVzaCBTdHJpbmcuZnJvbUNvZGVQb2ludCBjaWRcbiAgIyAgIGNocnMucHVzaCAnXFxuJyBpZiBjaWQgPiAwIGFuZCBjaWQgJSAzMiBpcyAwXG4gICMgZGVidWcgJ8KpWmdZNEQnLCBjaHJzXG4gICMgaGVscCBjaHJzLmpvaW4gJydcbiAgIyB1cmdlICggU3RyaW5nLmZyb21Db2RlUG9pbnQgY2lkIGZvciBjaWQgaW4gWyAweDI0MDAgLi4gMHgyNDI2IF0gKS5qb2luICcnXG4gICMgdXJnZSAoIFN0cmluZy5mcm9tQ29kZVBvaW50IGNpZCBmb3IgY2lkIGluIFsgMHgyNGI2IC4uIDB4MjRlOSBdICkuam9pbiAnJ1xuICAjIHVyZ2UgKCBTdHJpbmcuZnJvbUNvZGVQb2ludCBjaWQgZm9yIGNpZCBpbiBbIDB4ZmYwMSAuLiAweGZmNjAgXSApLmpvaW4gJydcblxuXG4jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbnVubGVzcyBtb2R1bGUucGFyZW50P1xuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgb3B0aW9ucyA9XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAjICdyb3V0ZSc6ICAgICAgICAgICAgICAgIG5qc19wYXRoLmpvaW4gX19kaXJuYW1lLCAnLi4vZGJzL2RlbW8nXG4gICAgJ3JvdXRlJzogICAgICAgICAgICAgICAgJy9Wb2x1bWVzL1N0b3JhZ2UvaW8vaml6dXJhLWRhdGFzb3VyY2VzL2RhdGEvbGV2ZWxkYidcbiAgICAjICdyb3V0ZSc6ICAgICAgICAgICAgJy90bXAvbGV2ZWxkYidcbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBkZWJ1ZyAnwqlBb09BUycsIG9wdGlvbnNcbiAgIyBzdGVwICggcmVzdW1lICkgPT5cbiAgIyAgIHlpZWxkIEBpbml0aWFsaXplIHJlc3VtZVxuICAjICAgZGIgPSBvcHRpb25zWyAnZGInIF1cbiAgIyAgIEBmaW5kX2dvb2Rfa3dpY19zYW1wbGVfZ2x5cGhzXzIgZGJcbiAgIyBAY29weV9qaXp1cmFfZGIoKVxuICAjIEBkdW1wX2ppenVyYV9kYigpXG4gICMgQGZpbmRfZ29vZF9rd2ljX3NhbXBsZV9nbHlwaHNfMigpXG4gIEBzaG93X2VuY29kaW5nX3NhbXBsZSgpXG4gICMgQGNvbXBpbGVfZW5jb2RpbmdzKClcblxuXG4iXX0=