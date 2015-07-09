(function() {
  var $, $async, CND, D, DEMO, HOLLERITH, after, alert, badge, debug, echo, eventually, every, help, immediately, info, log, options, repeat_immediately, rpr, step, suspend, urge, warn, whisper, ƒ,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    slice = [].slice;

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
    sample: null,
    sample: ['中', '國', '皇', '帝']
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
          whisper(ƒ(count));
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
    var last_digest, objs, sbj_prd;
    objs = null;
    sbj_prd = null;
    last_digest = null;
    return $((function(_this) {
      return function(key, send, end) {
        var digest, idx, obj, prd, sbj;
        debug('©aEv6c', key);
        if (key != null) {
          sbj = key[0], prd = key[1], obj = key[2], idx = key[3];
          digest = JSON.stringify([sbj, prd]);
          if (digest === last_digest) {
            if (idx != null) {
              objs[idx] = obj;
            } else {

              /* A certain subject/predicate combination can only ever be repeated if an addition index is
              present in the key
               */
              throw new Error("should never happen");
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
          end();
        }
        return null;
      };
    })(this));
  };

  this.copy_jizura_db = function() {
    var ds_options, source_db, target_db;
    ds_options = require('/Volumes/Storage/io/jizura-datasources/options');
    source_db = HOLLERITH.new_db('/Volumes/Storage/io/jizura-datasources/data/leveldb');
    target_db = HOLLERITH.new_db('/tmp/jizura-hollerith2');
    return step((function(_this) {
      return function*(resume) {
        var batch_size, gte, input, lte, output;
        (yield HOLLERITH.clear(target_db, resume));

        /* !!!!!!!!!!!!!!!!!!!!!!!! */
        gte = 'so|glyph:中';

        /* !!!!!!!!!!!!!!!!!!!!!!!! */
        lte = DEMO._lte_from_gte(gte);
        debug('©Y4DzO', {
          gte: gte,
          lte: lte
        });
        input = source_db['%self'].createKeyStream({
          gte: gte,
          lte: lte
        });
        batch_size = 10000;

        /* !!!!!!!!!!!!!!!!!!!!!!!! */
        batch_size = 3;

        /* !!!!!!!!!!!!!!!!!!!!!!!! */
        output = HOLLERITH.$write(target_db, {
          batch: batch_size
        });
        return input.pipe(_this.$show_progress(1e5)).pipe(D.$count(function(count) {
          return help("read " + (ƒ(count)) + " keys");
        })).pipe(DEMO._$split_so_bkey()).pipe(_this.$keep_small_sample()).pipe(_this.$throw_out_pods()).pipe(_this.$cast_types(ds_options)).pipe(_this.$collect_lists()).pipe(D.$show()).pipe(D.$count(function(count) {
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