(function() {
  var $, $async, CND, D, DEMO, HOLLERITH, after, alert, badge, debug, echo, eventually, every, help, immediately, info, join, log, njs_path, options, repeat_immediately, rpr, step, suspend, urge, warn, whisper, ƒ,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    slice = [].slice;

  njs_path = require('path');

  join = njs_path.join;

  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'HOLLERITH/copy';

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

  HOLLERITH = require('./main');

  DEMO = require('./demo');

  ƒ = CND.format_number.bind(CND);

  options = {
    sample: null
  };

  this.$show_progress = function(size) {
    var count;
    if (size == null) {
      size = 1e3;
    }
    count = 0;
    return $((function(_this) {
      return function(data, send) {
        count += 1;
        if (count % size === 0) {
          echo(ƒ(count));
        }
        return send(data);
      };
    })(this));
  };

  this.$keep_small_sample = function() {
    return $((function(_this) {
      return function(key, send) {
        var glyph, idx, obj, prd;
        if (options['sample'] == null) {
          return send(key);
        }
        glyph = key[0], prd = key[1], obj = key[2], idx = key[3];
        if (indexOf.call(options['sample'], glyph) >= 0) {
          return send(key);
        }
      };
    })(this));
  };

  this.$throw_out_pods = function() {
    return $((function(_this) {
      return function(key, send) {
        var glyph, idx, obj, prd;
        glyph = key[0], prd = key[1], obj = key[2], idx = key[3];
        if (prd !== 'pod') {
          return send(key);
        }
      };
    })(this));
  };

  this.$cast_types = function(ds_options) {
    return $((function(_this) {
      return function(arg, send) {
        var idx, obj, prd, sbj, type, type_description;
        sbj = arg[0], prd = arg[1], obj = arg[2], idx = arg[3];
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
        return send(idx != null ? [sbj, prd, obj, idx] : [sbj, prd, obj]);
      };
    })(this));
  };

  this.$collect_lists = function() {
    var context_keys, has_errors, last_digest, objs, sbj_prd;
    objs = null;
    sbj_prd = null;
    last_digest = null;
    context_keys = [];
    has_errors = false;
    return $((function(_this) {
      return function(key, send, end) {
        var digest, idx, obj, prd, sbj;
        if (key != null) {
          context_keys.push(key);
          if (context_keys.length > 10) {
            context_keys.shift();
          }
          sbj = key[0], prd = key[1], obj = key[2], idx = key[3];
          digest = JSON.stringify([sbj, prd]);
          if (digest === last_digest) {
            if (idx != null) {
              objs[idx] = obj;
            } else {

              /* A certain subject/predicate combination can only ever be repeated if an index is
              present in the key
               */
              alert();
              alert("erroneous repeated entry; context:");
              alert(context_keys);
              has_errors = true;
            }
          } else {
            if (objs != null) {
              send(slice.call(sbj_prd).concat([objs]));
            }
            objs = null;
            last_digest = digest;
            if (idx != null) {
              objs = [];
              objs[idx] = obj;
              sbj_prd = [sbj, prd];
            } else {
              send(key);
            }
          }
        }
        if (end != null) {
          if (objs != null) {
            send(slice.call(sbj_prd).concat([objs]));
          }
          if (has_errors) {
            return send.error(new Error("there were errors; see alerts above"));
          }
          end();
        }
        return null;
      };
    })(this));
  };

  this.$compact_lists = function() {
    return $((function(_this) {
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
    })(this));
  };

  this.$add_kwic_v2 = function() {

    /* see `demo/show_kwic_v2_sample` */
    return $((function(_this) {
      return function(arg, send) {
        var _, glyph, i, j, k, len, len1, len2, obj, position, prd, ref, ref1, ref2, sbj, sortcode, sortcode_v1, sortcodes_v1, sortcodes_v2, sortrow_v1, sortrow_v2, x;
        sbj = arg[0], prd = arg[1], obj = arg[2];
        if (prd === 'guide/kwic/sortcode') {
          ref = [sbj, prd, obj], glyph = ref[0], _ = ref[1], sortcodes_v1 = ref[2];
          sortcodes_v2 = [];
          for (i = 0, len = sortcodes_v1.length; i < len; i++) {
            sortcode_v1 = sortcodes_v1[i];
            sortrow_v1 = (function() {
              var j, len1, ref1, results;
              ref1 = sortcode_v1.split(/(........,..),/);
              results = [];
              for (j = 0, len1 = ref1.length; j < len1; j++) {
                x = ref1[j];
                if (x.length > 0) {
                  results.push(x);
                }
              }
              return results;
            })();
            sortrow_v1 = (function() {
              var j, len1, results;
              results = [];
              for (j = 0, len1 = sortrow_v1.length; j < len1; j++) {
                x = sortrow_v1[j];
                results.push(x.split(','));
              }
              return results;
            })();
            sortrow_v2 = [];
            for (j = 0, len1 = sortrow_v1.length; j < len1; j++) {
              ref1 = sortrow_v1[j], sortcode = ref1[0], _ = ref1[1];
              sortrow_v2.push(sortcode);
            }
            for (k = 0, len2 = sortrow_v1.length; k < len2; k++) {
              ref2 = sortrow_v1[k], _ = ref2[0], position = ref2[1];
              sortrow_v2.push(position);
            }
            sortcodes_v2.push(sortrow_v2.join(','));
          }
          send([glyph, 'guide/kwic/sortcode/v1', sortcodes_v1]);
          return send([glyph, 'guide/kwic/sortcode/v2', sortcodes_v2]);
        } else {
          return send([sbj, prd, obj]);
        }
      };
    })(this));
  };

  this.copy_jizura_db = function() {
    var ds_options, home, source_db, source_route, target_db, target_db_size, target_route;
    home = join(__dirname, '../../jizura-datasources');
    source_route = join(home, 'data/leveldb');
    target_route = join(home, 'data/leveldb-v2');
    target_db_size = 1e6;
    ds_options = require(join(home, 'options'));
    source_db = HOLLERITH.new_db(source_route);
    target_db = HOLLERITH.new_db(target_route, {
      size: target_db_size
    });
    return step((function(_this) {
      return function*(resume) {
        var batch_size, gte, input, lte, output;
        (yield HOLLERITH.clear(target_db, resume));
        gte = 'so|';
        lte = DEMO._lte_from_gte(gte);
        input = source_db['%self'].createKeyStream({
          gte: gte,
          lte: lte
        });
        batch_size = 1e4;
        output = HOLLERITH.$write(target_db, {
          batch: batch_size
        });
        help("copying from  " + source_route);
        help("to            " + target_route);
        help("reading records with prefix " + (rpr(gte)));
        help("writing with batch size " + (ƒ(batch_size)));
        return input.pipe(_this.$show_progress(1e4)).pipe(D.$count(function(count) {
          return help("read " + (ƒ(count)) + " keys");
        })).pipe(DEMO._$split_so_bkey()).pipe(_this.$keep_small_sample()).pipe(_this.$throw_out_pods()).pipe(_this.$cast_types(ds_options)).pipe(_this.$collect_lists()).pipe(_this.$compact_lists()).pipe(_this.$add_kwic_v2()).pipe(D.$count(function(count) {
          return help("kept " + (ƒ(count)) + " entries");
        })).pipe(output);
      };
    })(this));
  };

  if (module.parent == null) {
    this.copy_jizura_db();
  }

}).call(this);

//# sourceMappingURL=../sourcemaps/copy-jizuradb-to-Hollerith2-format.js.map