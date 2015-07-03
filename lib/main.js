(function() {
  var $, Bloom, CND, CODEC, D, DUMP, LODASH, _codec_decode, _codec_encode, _new_level_db, badge, debug, echo, help, leveldown, log, repeat_immediately, rpr, step, suspend, urge, warn, whisper,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    slice = [].slice;

  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'HOLLERITH/main';

  log = CND.get_logger('plain', badge);

  debug = CND.get_logger('debug', badge);

  warn = CND.get_logger('warn', badge);

  help = CND.get_logger('help', badge);

  urge = CND.get_logger('urge', badge);

  whisper = CND.get_logger('whisper', badge);

  echo = CND.echo.bind(CND);

  suspend = require('coffeenode-suspend');

  step = suspend.step;

  CODEC = this.CODEC = require('./codec');

  DUMP = this.DUMP = require('./dump');

  _codec_encode = CODEC.encode.bind(CODEC);

  _codec_decode = CODEC.decode.bind(CODEC);

  D = require('pipedreams2');

  $ = D.remit.bind(D);

  _new_level_db = require('level');

  leveldown = require('level/node_modules/leveldown');

  suspend = require('coffeenode-suspend');

  step = suspend.step;

  repeat_immediately = suspend.repeat_immediately;

  LODASH = require('lodash');


  /* https://github.com/b3nj4m/bloom-stream */

  Bloom = require('bloom-stream');

  this.phrasetypes = ['pos', 'spo'];

  this._misfit = Symbol('misfit');

  this._zero_value_bfr = new Buffer('null');

  this.new_db = function(route) {
    var R, level_settings, substrate;
    level_settings = {
      'keyEncoding': 'binary',
      'valueEncoding': 'binary',
      'createIfMissing': true,
      'errorIfExists': false,
      'compression': true,
      'sync': false
    };
    substrate = _new_level_db(route, level_settings);
    R = {
      '~isa': 'HOLLERITH/db',
      '%self': substrate
    };
    return R;
  };

  this.clear = function(db, handler) {
    return step((function(_this) {
      return function*(resume) {
        var route;
        route = db['%self']['location'];
        whisper("closing DB");
        (yield db['%self'].close(resume));
        (yield leveldown.destroy(route, resume));
        (yield db['%self'].open(resume));
        whisper("erased and re-opened LevelDB at " + route);
        return handler(null);
      };
    })(this));
  };

  this._put_meta = function(db, name, value, handler) {

    /* TAINT should use own type for metadata */
    var key_bfr, value_bfr;
    key_bfr = this._encode_key(db, ['meta', name]);
    value_bfr = CND.isa_jsbuffer ? value : this._encode_value(db, value);
    return db['%self'].put(key_bfr, value_bfr, (function(_this) {
      return function(error) {
        if (handler != null) {
          return handler(error);
        }
      };
    })(this));
  };

  this._get_meta = function(db, name, fallback, handler) {
    var arity, key_bfr;
    switch (arity = arguments.length) {
      case 3:
        handler = fallback;
        fallback = this._misfit;
        break;
      case 4:
        null;
        break;
      default:
        throw new Error("expected 3 or 4 arguments, got " + arity);
    }
    key_bfr = this._encode_key(db, ['meta', name]);
    return db['%self'].get(key_bfr, (function(_this) {
      return function(error, value) {
        if (error != null) {
          if ((error['type'] === 'NotFoundError') && (fallback !== _this._misfit)) {
            return handler(null, fallback);
          }
          return handler(error);
        }
        return handler(null, value);
      };
    })(this));
  };

  this._is_meta = function(db, key_bfr) {
    return ((key_bfr.slice(0, this._meta_prefix.length)).compare(this._meta_prefix)) === 0;
  };


  /* TAINT must derive meta key prefix from result of `_put_meta` */

  this._meta_prefix = new Buffer([0x54, 0x6d, 0x65, 0x74, 0x61, 0x00]);

  this.$write = function(db, settings) {

    /* TAINT currently loading and saving bloom filter each time a pipeline with `$write` is run */
    var $as_batch_entry, $encode, $ensure_unique, $index, $load_bloom, $save_bloom, $write, R, batch_size, ensure_unique, pipeline, ref, ref1, ref2, ref3, solid_predicates, substrate;
    if (settings == null) {
      settings = {};
    }

    /* Superficial experiments show that a much bigger batch size than 1'000 does not tend to improve
    throughput; therefore, in order to reduce memory footprint, it seems advisable to leave batch size
    in the order of around a thousand entries.
     */
    batch_size = (ref = settings['batch']) != null ? ref : 1000;
    solid_predicates = (ref1 = settings['solids']) != null ? ref1 : [];
    ensure_unique = (ref2 = settings['unique']) != null ? ref2 : true;
    substrate = db['%self'];
    R = D.create_throughstream();
    $index = (function(_this) {
      return function() {
        return $(function(spo, send) {

          /* Analyze SPO key and send all necessary POS facets: */
          var i, len, obj, obj_element, obj_idx, obj_type, prd, results, sbj;
          sbj = spo[0], prd = spo[1], obj = spo[2];
          send([['spo', sbj, prd], obj]);
          obj_type = CND.type_of(obj);
          if (obj_type !== 'pod') {
            if ((obj_type === 'list') && !(indexOf.call(solid_predicates, prd) >= 0)) {
              results = [];
              for (obj_idx = i = 0, len = obj.length; i < len; obj_idx = ++i) {
                obj_element = obj[obj_idx];
                results.push(send([['pos', prd, obj_element, sbj, obj_idx]]));
              }
              return results;
            } else {
              return send([['pos', prd, obj, sbj]]);
            }
          }
        });
      };
    })(this);
    $encode = (function(_this) {
      return function() {
        return $(function(facet, send) {
          var key, key_bfr, phrasetype, value, value_bfr;
          key = facet[0], value = facet[1];
          phrasetype = key[0];
          key_bfr = _this._encode_key(db, key);
          value_bfr = value != null ? _this._encode_value(db, value) : _this._zero_value_bfr;
          return send([phrasetype, key_bfr, value_bfr]);
        });
      };
    })(this);
    $as_batch_entry = (function(_this) {
      return function() {
        return $(function(facet_bfr_plus, send) {
          var key_bfr, phrasetype, value_bfr;
          phrasetype = facet_bfr_plus[0], key_bfr = facet_bfr_plus[1], value_bfr = facet_bfr_plus[2];
          return send({
            type: 'put',
            key: key_bfr,
            value: value_bfr
          });
        });
      };
    })(this);
    $write = (function(_this) {
      return function() {
        return $(function(batch, send) {
          return substrate.batch(batch);
        });
      };
    })(this);
    if (ensure_unique) {
      ref3 = this._get_bloom_methods(db), $ensure_unique = ref3.$ensure_unique, $load_bloom = ref3.$load_bloom, $save_bloom = ref3.$save_bloom;
    }
    pipeline = [];
    if (ensure_unique) {
      pipeline.push($load_bloom());
    }
    pipeline.push($index());
    pipeline.push($encode());
    if (ensure_unique) {
      pipeline.push($ensure_unique());
    }
    pipeline.push($as_batch_entry());
    pipeline.push(D.$batch(batch_size));
    pipeline.push($write());
    if (ensure_unique) {
      pipeline.push($save_bloom());
    }
    R.pipe(D.combine.apply(D, pipeline));
    return R;
  };

  this._get_bloom_methods = function(db) {
    var $ensure_unique, $load_bloom, $save_bloom, BLOEM, BSON, bloem_settings, bloom_error_rate, db_size, njs_fs, ref, ref1, ref2, show_bloom_info;
    db_size = (ref = db['size']) != null ? ref : 1e6;
    db_size = (ref1 = db['size']) != null ? ref1 : 10;
    db_size = (ref2 = db['size']) != null ? ref2 : 1e4;
    bloom_error_rate = 0.1;
    BSON = (require('bson')).BSONPure.BSON;
    njs_fs = require('fs');
    BLOEM = require('bloem');
    bloem_settings = {
      initial_capacity: db_size * 3,
      scaling: 2,
      ratio: 0.1
    };
    show_bloom_info = (function(_this) {
      return function() {
        var bloom, filter, filter_size, filters, i, len, ƒ;
        bloom = db['%bloom'];
        filters = bloom['filters'];
        filter_size = 0;
        ƒ = CND.format_number;
        for (i = 0, len = filters.length; i < len; i++) {
          filter = filters[i];
          filter_size += filter['filter']['bitfield']['buffer'].length;
        }
        return whisper("scalable Bloom filter size: " + (ƒ(filter_size)) + " bytes");
      };
    })(this);
    $ensure_unique = (function(_this) {
      return function() {
        return D.$map(function(phrase, handler) {
          var bloom, bloom_has_key, key, key_bfr, obj, prd, sbj;
          bloom = db['%bloom'];

          /* >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */
          sbj = phrase[0], prd = phrase[1], obj = phrase[2];
          key = ['spo', sbj, prd];
          key_bfr = key.join('|');

          /* >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */
          bloom_has_key = bloom.has(key_bfr);
          bloom.add(key_bfr);
          if (!bloom_has_key) {
            return handler(null, phrase);
          }
          return _this.has(db, key, function(error, db_has_key) {
            if (error != null) {
              return handler(error);
            }
            if (db_has_key) {
              return handler(new Error("phrase already in DB: " + (rpr(phrase))));
            }
            return handler(null, phrase);
          });
        });
      };
    })(this);
    $load_bloom = (function(_this) {
      return function() {
        var is_first;
        is_first = true;
        return D.$map(function(data, handler) {
          if (!is_first) {
            if (data != null) {
              return handler(null, data);
            } else {
              return handler();
            }
          }
          is_first = false;
          whisper("loading Bloom filter...");
          return _this._get_meta(db, 'bloom', null, function(error, bloom_bfr) {
            var bitfield, bloom, bloom_data, filter, i, len, ref3;
            if (error != null) {
              return send.error(error);
            }
            if (bloom_bfr === null) {
              warn('no bloom filter found');
              bloom = new BLOEM.ScalingBloem(bloom_error_rate, bloem_settings);
            } else {
              bloom_data = BSON.deserialize(bloom_bfr);

              /* TAINT see https://github.com/wiedi/node-bloem/issues/5 */
              ref3 = bloom_data['filters'];
              for (i = 0, len = ref3.length; i < len; i++) {
                filter = ref3[i];
                bitfield = filter['filter']['bitfield'];
                bitfield['buffer'] = bitfield['buffer']['buffer'];
              }
              bloom = BLOEM.ScalingBloem.destringify(bloom_data);
            }
            db['%bloom'] = bloom;
            whisper("...ok");
            show_bloom_info();
            if (data != null) {
              return handler(null, data);
            } else {
              return handler();
            }
          });
        });
      };
    })(this);
    $save_bloom = (function(_this) {
      return function() {
        return D.$on_end(function(send, end) {
          var bloom, bloom_bfr;
          whisper("saving Bloom filter...");
          bloom = db['%bloom'];
          bloom_bfr = BSON.serialize(bloom);
          return _this._put_meta(db, 'bloom', bloom_bfr, function(error) {
            if (error != null) {
              return send.error(error);
            }
            whisper("...ok");
            return end();
          });
        });
      };
    })(this);
    return {
      $ensure_unique: $ensure_unique,
      $load_bloom: $load_bloom,
      $save_bloom: $save_bloom
    };
  };

  this.create_phrasestream = function(db, lo_hint, hi_hint, settings) {
    if (lo_hint == null) {
      lo_hint = null;
    }
    if (hi_hint == null) {
      hi_hint = null;
    }
    return this._create_phrasestream(db, lo_hint, hi_hint, settings);
  };

  this.read_phrases = function(db, lo_hint, hi_hint, settings, handler) {
    if (lo_hint == null) {
      lo_hint = null;
    }
    if (hi_hint == null) {
      hi_hint = null;
    }

    /* TAINT arguments don't work this way, must honor arity */
    return this._create_phrasestream(db, lo_hint, hi_hint, settings, handler);
  };

  this._create_phrasestream = function(db, lo_hint, hi_hint, settings, handler) {
    var R, input;
    if (lo_hint == null) {
      lo_hint = null;
    }
    if (hi_hint == null) {
      hi_hint = null;
    }
    input = this.create_facetstream(db, lo_hint, hi_hint, settings);
    R = input.pipe(this.$as_phrase(db));
    if (handler != null) {
      R = R.pipe(D.$collect()).pipe($((function(_this) {
        return function(data, send) {
          return handler(null, data);
        };
      })(this)));
      R.on('error', (function(_this) {
        return function(error) {
          return handler(error);
        };
      })(this));
    }
    R['%meta'] = input['%meta'];
    return R;
  };

  this.create_facetstream = function(db, lo_hint, hi_hint, settings) {
    var R, hi_hint_bfr, lo_hint_bfr, query;
    if (lo_hint == null) {
      lo_hint = null;
    }
    if (hi_hint == null) {
      hi_hint = null;
    }

    /*
    * If neiter `lo` nor `hi` is given, the stream will iterate over all entries.
    * If both `lo` and `hi` are given, a query with lower and upper, inclusive boundaries is
      issued.
    * If only `lo` is given, a prefix query is issued.
    * If `hi` is given but `lo` is missing, an error is issued.
     */
    if ((hi_hint != null) && (lo_hint == null)) {
      throw new Error("must give `lo_hint` when `hi_hint` is given");
    }
    if ((lo_hint != null) && (hi_hint == null)) {
      query = this._query_from_prefix(db, lo_hint);
    } else if ((lo_hint != null) && hi_hint === '*') {
      query = this._query_from_prefix(db, lo_hint, '*');
    } else {
      lo_hint_bfr = lo_hint != null ? this._encode_key(db, lo_hint) : null;
      hi_hint_bfr = hi_hint != null ? (this._query_from_prefix(db, hi_hint))['lte'] : null;
      query = {
        gte: lo_hint_bfr,
        lte: hi_hint_bfr
      };
    }

    /* TAINT Should we test for well-formed entries here? */
    R = db['%self'].createReadStream(query);
    R = R.pipe($((function(_this) {
      return function(arg, send) {
        var key, value;
        key = arg.key, value = arg.value;
        if (!_this._is_meta(db, key)) {
          return send([_this._decode_key(db, key), _this._decode_value(db, value)]);
        }
      };
    })(this)));
    R['%meta'] = {};
    R['%meta']['query'] = query;
    return R;
  };

  this.has = function(db, key, handler) {
    var key_bfr;
    key_bfr = this._encode_key(db, key);
    return db['%self'].get(key_bfr, (function(_this) {
      return function(error, obj_bfr) {
        if (error != null) {
          if (error['type'] === 'NotFoundError') {
            return handler(null, false);
          }
          return handler(error);
        }
        return handler(null, true);
      };
    })(this));
  };

  this.ensure_new_key = function(db, key, handler) {
    var key_bfr;
    key_bfr = this._encode_key(db, key);
    return db['%self'].get(key_bfr, (function(_this) {
      return function(error, obj_bfr) {
        var obj;
        if (error != null) {
          if (error['type'] === 'NotFoundError') {
            return handler(null);
          }
          return handler(error);
        }
        obj = _this._decode_value(obj_bfr);
        return handler(new Error("key " + (rpr(key)) + " already in DB with value " + (rpr(obj))));
      };
    })(this));
  };

  this.read_sub = function(db, settings, read) {
    var arity, indexed, insert_index, mangle, open_stream_count, ref, ref1, ref2, send_empty;
    switch (arity = arguments.length) {
      case 2:
        read = settings;
        settings = null;
        break;
      case 3:
        null;
        break;
      default:
        throw new Error("expected 2 or 3 arguments, got " + arity);
    }
    indexed = (ref = settings != null ? settings['indexed'] : void 0) != null ? ref : false;
    mangle = (ref1 = settings != null ? settings['mangle'] : void 0) != null ? ref1 : function(data) {
      return data;
    };
    send_empty = (ref2 = settings != null ? settings['empty'] : void 0) != null ? ref2 : false;
    insert_index = indexed ? D.new_indexer() : function(x) {
      return x;
    };
    open_stream_count = 0;
    return $((function(_this) {
      return function(outer_data, outer_send, outer_end) {
        var count, memo, ref3, sub_input;
        count = 0;
        if (outer_data != null) {
          open_stream_count += +1;
          sub_input = read(outer_data);
          ref3 = CND.isa_list(sub_input) ? sub_input : [_this._misfit, sub_input], memo = ref3[0], sub_input = ref3[1];
          sub_input.pipe((function() {

            /* TAINT no need to build buffer if not `send_empty` and there are no results */
            var buffer;
            buffer = memo === _this._misfit ? [] : [memo];
            return $(function(inner_data, _, inner_end) {
              if (inner_data != null) {
                inner_data = mangle(inner_data);
                if (inner_data != null) {
                  count += +1;
                  buffer.push(inner_data);
                }
              }
              if (inner_end != null) {
                if (send_empty || count > 0) {
                  outer_send(insert_index(buffer));
                }
                open_stream_count += -1;
                return inner_end();
              }
            });
          })());
        }
        if (outer_end != null) {
          return repeat_immediately(function() {
            if (open_stream_count !== 0) {
              return true;
            }
            outer_end();
            return false;
          });
        }
      };
    })(this));
  };

  this._encode_key = function(db, key, extra_byte) {
    if (key === void 0) {
      throw new Error("illegal key " + (rpr(key)));
    }
    return _codec_encode(key, extra_byte);
  };

  this._decode_key = function(db, key) {
    var R;
    if ((R = _codec_decode(key)) === void 0) {
      throw new Error("illegal key " + (rpr(key)));
    }
    return R;
  };

  this._encode_value = function(db, value) {
    return new Buffer(JSON.stringify(value), 'utf-8');
  };

  this._decode_value = function(db, value_bfr) {
    return JSON.parse(value_bfr.toString('utf-8'));
  };


  /* NB Argument ordering for these function is always subject before object, regardless of the phrasetype
  and the ordering in the resulting key.
   */

  this.new_key = function(db, phrasetype, sk, sv, ok, ov, idx) {
    var ref;
    if (phrasetype !== 'so' && phrasetype !== 'os') {
      throw new Error("illegal phrasetype: " + (rpr(phrasetype)));
    }
    if (phrasetype === 'os') {
      ref = [ok, ov, sk, sv], sk = ref[0], sv = ref[1], ok = ref[2], ov = ref[3];
    }
    return [phrasetype, sk, sv, ok, ov, idx != null ? idx : 0];
  };

  this.new_so_key = function() {
    var P, db;
    db = arguments[0], P = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    return this.new_key.apply(this, [db, 'so'].concat(slice.call(P)));
  };

  this.new_os_key = function() {
    var P, db;
    db = arguments[0], P = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    return this.new_key.apply(this, [db, 'os'].concat(slice.call(P)));
  };

  this._new_os_key_from_so_key = function(db, so_key) {
    var idx, ok, ov, phrasetype, ref, sk, sv;
    ref = this.as_phrase(db, so_key), phrasetype = ref[0], sk = ref[1], sv = ref[2], ok = ref[3], ov = ref[4], idx = ref[5];
    if (phrasetype !== 'so') {
      throw new Error("expected phrasetype 'so', got " + (rpr(phrasetype)));
    }
    return ['os', ok, ov, sk, sv, idx];
  };

  this.new_keys = function(db, phrasetype, sk, sv, ok, ov, idx) {
    var other_phrasetype;
    other_phrasetype = phrasetype === 'so' ? 'os' : 'so';
    return [this.new_key(db, phrasetype, sk, sv, ok, ov, idx), this.new_key(db, other_phrasetype, sk, sv, ok, ov, idx)];
  };

  this.as_phrase = function(db, key, value, normalize) {
    var length, phrasetype, ref;
    if (normalize == null) {
      normalize = true;
    }
    switch (phrasetype = key[0]) {
      case 'spo':
        if ((length = key.length) !== 3) {
          throw new Error("illegal SPO key (length " + length + ")");
        }
        if (value === (void 0)) {
          throw new Error("illegal value (1) " + (rpr(value)));
        }
        return [phrasetype, key[1], key[2], value];
      case 'pos':
        if (!((4 <= (ref = (length = key.length)) && ref <= 5))) {
          throw new Error("illegal POS key (length " + length + ")");
        }
        if (!(value === null)) {
          throw new Error("illegal value (2) " + (rpr(value)));
        }
        if (key[4] != null) {
          return [phrasetype, key[3], key[1], key[2], key[4]];
        }
        return [phrasetype, key[3], key[1], key[2]];
    }
  };

  this.$as_phrase = function(db) {
    return $((function(_this) {
      return function(data, send) {
        return send(_this.as_phrase.apply(_this, [db].concat(slice.call(data))));
      };
    })(this));
  };

  this.key_from_url = function(db, url) {

    /* TAINT does not unescape as yet */

    /* TAINT does not cast values as yet */

    /* TAINT does not support multiple indexes as yet */
    var first, idx, ok, ov, phrasetype, ref, ref1, ref2, ref3, second, sk, sv;
    ref = url.split('|'), phrasetype = ref[0], first = ref[1], second = ref[2], idx = ref[3];
    if (!((phrasetype != null) && phrasetype.length > 0 && (phrasetype === 'so' || phrasetype === 'os'))) {
      throw new Error("illegal URL key " + (rpr(url)));
    }
    if (!((first != null) && first.length > 0 && (second != null) && second.length > 0)) {
      throw new Error("illegal URL key " + (rpr(url)));
    }
    idx = (idx != null) && idx.length > 0 ? parseInt(idx, 10) : 0;
    ref1 = first.split(':'), sk = ref1[0], sv = ref1[1];
    ref2 = second.split(':'), ok = ref2[0], ov = ref2[1];
    if (!((sk != null) && sk.length > 0 && (ok != null) && ok.length > 0)) {
      throw new Error("illegal URL key " + (rpr(url)));
    }
    if (phrasetype === 'os') {
      ref3 = [ok, ov, sk, sv], sk = ref3[0], sv = ref3[1], ok = ref3[2], ov = ref3[3];
    }
    return [phrasetype, sk, sv, ok, ov, idx];
  };

  this.url_from_key = function(db, key) {
    var idx, idx_rpr, obj, phrasetype, prd, sbj, tail;
    if ((this._type_from_key(db, key)) === 'list') {
      phrasetype = key[0], tail = 2 <= key.length ? slice.call(key, 1) : [];
      if (phrasetype === 'spo') {
        sbj = tail[0], prd = tail[1];
        return "spo|" + sbj + "|" + prd + "|";
      } else {
        prd = tail[0], obj = tail[1], sbj = tail[2], idx = tail[3];
        idx_rpr = idx != null ? rpr(idx) : '';
        return "pos|" + prd + ":" + obj + "|" + sbj + "|" + idx_rpr;
      }
    }
    return "" + (rpr(key));
  };

  this.$url_from_key = function(db) {
    return $((function(_this) {
      return function(key, send) {
        return send(_this.url_from_key(db, key));
      };
    })(this));
  };

  this.$key_from_url = function(db) {
    return $((function(_this) {
      return function(url, send) {
        return send(_this.key_from_url(db, key));
      };
    })(this));
  };

  this._type_from_key = function(db, key) {
    var ref;
    if (Array.isArray(key)) {
      if (ref = key['0'], indexOf.call(this.phrasetypes, ref) < 0) {
        throw new Error("illegal phrasetype: " + (rpr(key)));
      }
      return 'list';
    }
    return 'other';
  };

  this._query_from_prefix = function(db, lo_hint, star) {
    var base, gte, lte;
    if (star != null) {

      /* 'Asterisk' encoding: partial key segments match */
      gte = this._encode_key(db, lo_hint);
      lte = this._encode_key(db, lo_hint);
      lte[lte.length - 1] = CODEC['typemarkers']['hi'];
    } else {

      /* 'Classical' encoding: only full key segments match */
      base = this._encode_key(db, lo_hint, CODEC['typemarkers']['hi']);
      gte = base.slice(0, base.length - 1);
      lte = base.slice(0, base.length);
    }
    return {
      gte: gte,
      lte: lte
    };
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,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LEdBQUY7QUFBQSxNQUFPLEtBQUEsR0FBUDtLQUFQLENBYm9CO0VBQUEsQ0FyZnRCLENBQUE7QUFBQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiXG5cblxuIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4jIG5qc191dGlsICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICd1dGlsJ1xuIyBuanNfcGF0aCAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAncGF0aCdcbiMgbmpzX2ZzICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2ZzJ1xuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5DTkQgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnY25kJ1xucnByICAgICAgICAgICAgICAgICAgICAgICA9IENORC5ycHJcbmJhZGdlICAgICAgICAgICAgICAgICAgICAgPSAnSE9MTEVSSVRIL21haW4nXG5sb2cgICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3BsYWluJywgICAgIGJhZGdlXG5kZWJ1ZyAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ2RlYnVnJywgICAgIGJhZGdlXG53YXJuICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3dhcm4nLCAgICAgIGJhZGdlXG5oZWxwICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ2hlbHAnLCAgICAgIGJhZGdlXG51cmdlICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3VyZ2UnLCAgICAgIGJhZGdlXG53aGlzcGVyICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3doaXNwZXInLCAgIGJhZGdlXG5lY2hvICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmVjaG8uYmluZCBDTkRcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuc3VzcGVuZCAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2NvZmZlZW5vZGUtc3VzcGVuZCdcbnN0ZXAgICAgICAgICAgICAgICAgICAgICAgPSBzdXNwZW5kLnN0ZXBcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuQ09ERUMgICAgICAgICAgICAgICAgICAgICA9IEBDT0RFQyA9IHJlcXVpcmUgJy4vY29kZWMnXG5EVU1QICAgICAgICAgICAgICAgICAgICAgID0gQERVTVAgID0gcmVxdWlyZSAnLi9kdW1wJ1xuX2NvZGVjX2VuY29kZSAgICAgICAgICAgICA9IENPREVDLmVuY29kZS5iaW5kIENPREVDXG5fY29kZWNfZGVjb2RlICAgICAgICAgICAgID0gQ09ERUMuZGVjb2RlLmJpbmQgQ09ERUNcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuRCAgICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ3BpcGVkcmVhbXMyJ1xuJCAgICAgICAgICAgICAgICAgICAgICAgICA9IEQucmVtaXQuYmluZCBEXG5fbmV3X2xldmVsX2RiICAgICAgICAgICAgID0gcmVxdWlyZSAnbGV2ZWwnXG5sZXZlbGRvd24gICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbGV2ZWwvbm9kZV9tb2R1bGVzL2xldmVsZG93bidcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuc3VzcGVuZCAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2NvZmZlZW5vZGUtc3VzcGVuZCdcbnN0ZXAgICAgICAgICAgICAgICAgICAgICAgPSBzdXNwZW5kLnN0ZXBcbnJlcGVhdF9pbW1lZGlhdGVseSAgICAgICAgPSBzdXNwZW5kLnJlcGVhdF9pbW1lZGlhdGVseVxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5MT0RBU0ggICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbG9kYXNoJ1xuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jIyMgaHR0cHM6Ly9naXRodWIuY29tL2Izbmo0bS9ibG9vbS1zdHJlYW0gIyMjXG5CbG9vbSAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnYmxvb20tc3RyZWFtJ1xuXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQHBocmFzZXR5cGVzICAgICAgPSBbICdwb3MnLCAnc3BvJywgXVxuQF9taXNmaXQgICAgICAgICAgPSBTeW1ib2wgJ21pc2ZpdCdcbkBfemVyb192YWx1ZV9iZnIgID0gbmV3IEJ1ZmZlciAnbnVsbCdcbiMgd2FybiBcIm1pbmQgaW5jb25zaXN0ZW5jaWVzIGluIEhPTExFUklUSDIvbWFpbiBAX3plcm9fZW5jIGV0Y1wiXG4jIEBfemVybyAgICAgICAgICAgID0gdHJ1ZSAjID8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/XG4jIEBfemVyb19lbmMgICAgICAgID0gX2NvZGVjX2VuY29kZSBbIEBfemVybywgICAgXVxuIyBAX2xvX2VuYyAgICAgICAgICA9IF9jb2RlY19lbmNvZGUgWyBudWxsLCAgICAgIF1cbiMgQF9oaV9lbmMgICAgICAgICAgPSBfY29kZWNfZW5jb2RlIFsgQ09ERUMuLCBdXG4jIEBfbGFzdF9vY3RldCAgICAgID0gbmV3IEJ1ZmZlciBbIDB4ZmYsIF1cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AbmV3X2RiID0gKCByb3V0ZSApIC0+XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgbGV2ZWxfc2V0dGluZ3MgPVxuICAgICdrZXlFbmNvZGluZyc6ICAgICAgICAgICdiaW5hcnknXG4gICAgJ3ZhbHVlRW5jb2RpbmcnOiAgICAgICAgJ2JpbmFyeSdcbiAgICAnY3JlYXRlSWZNaXNzaW5nJzogICAgICB5ZXNcbiAgICAnZXJyb3JJZkV4aXN0cyc6ICAgICAgICBub1xuICAgICdjb21wcmVzc2lvbic6ICAgICAgICAgIHllc1xuICAgICdzeW5jJzogICAgICAgICAgICAgICAgIG5vXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3Vic3RyYXRlICAgICAgICAgICA9IF9uZXdfbGV2ZWxfZGIgcm91dGUsIGxldmVsX3NldHRpbmdzXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgUiA9XG4gICAgJ35pc2EnOiAgICAgICAgICAgJ0hPTExFUklUSC9kYidcbiAgICAnJXNlbGYnOiAgICAgICAgICBzdWJzdHJhdGVcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICByZXR1cm4gUlxuXG4jICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBAX3Jlb3BlbiA9ICggZGIsIGhhbmRsZXIgKSAtPlxuIyAgIHN0ZXAgKCByZXN1bWUgKSA9PlxuIyAgICAgcm91dGUgPSBkYlsgJyVzZWxmJyBdWyAnbG9jYXRpb24nIF1cbiMgICAgIHlpZWxkIGRiWyAnJXNlbGYnIF0uY2xvc2UgcmVzdW1lXG4jICAgICB5aWVsZCBkYlsgJyVzZWxmJyBdLm9wZW4gcmVzdW1lXG4jICAgICB3aGlzcGVyIFwicmUtb3BlbmVkIExldmVsREIgYXQgI3tyb3V0ZX1cIlxuIyAgICAgaGFuZGxlciBudWxsXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQGNsZWFyID0gKCBkYiwgaGFuZGxlciApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHJvdXRlID0gZGJbICclc2VsZicgXVsgJ2xvY2F0aW9uJyBdXG4gICAgd2hpc3BlciBcImNsb3NpbmcgREJcIlxuICAgIHlpZWxkIGRiWyAnJXNlbGYnIF0uY2xvc2UgcmVzdW1lXG4gICAgIyB3aGlzcGVyIFwiZXJhc2luZyBEQlwiXG4gICAgeWllbGQgbGV2ZWxkb3duLmRlc3Ryb3kgcm91dGUsIHJlc3VtZVxuICAgICMgd2hpc3BlciBcInJlLW9wZW5pbmcgREJcIlxuICAgIHlpZWxkIGRiWyAnJXNlbGYnIF0ub3BlbiByZXN1bWVcbiAgICB3aGlzcGVyIFwiZXJhc2VkIGFuZCByZS1vcGVuZWQgTGV2ZWxEQiBhdCAje3JvdXRlfVwiXG4gICAgaGFuZGxlciBudWxsXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIE1FVEFEQVRBXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfcHV0X21ldGEgPSAoIGRiLCBuYW1lLCB2YWx1ZSwgaGFuZGxlciApIC0+XG4gICMjIyBUQUlOVCBzaG91bGQgdXNlIG93biB0eXBlIGZvciBtZXRhZGF0YSAjIyNcbiAga2V5X2JmciAgID0gQF9lbmNvZGVfa2V5IGRiLCBbICdtZXRhJywgbmFtZSwgXVxuICB2YWx1ZV9iZnIgPSBpZiBDTkQuaXNhX2pzYnVmZmVyIHRoZW4gdmFsdWUgZWxzZSBAX2VuY29kZV92YWx1ZSBkYiwgdmFsdWVcbiAgZGJbICclc2VsZicgXS5wdXQga2V5X2JmciwgdmFsdWVfYmZyLCAoIGVycm9yICkgPT4gaGFuZGxlciBlcnJvciBpZiBoYW5kbGVyP1xuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfZ2V0X21ldGEgPSAoIGRiLCBuYW1lLCBmYWxsYmFjaywgaGFuZGxlciApIC0+XG4gIHN3aXRjaCBhcml0eSA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICB3aGVuIDNcbiAgICAgIGhhbmRsZXIgICA9IGZhbGxiYWNrXG4gICAgICBmYWxsYmFjayAgPSBAX21pc2ZpdFxuICAgIHdoZW4gNFxuICAgICAgbnVsbFxuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBFcnJvciBcImV4cGVjdGVkIDMgb3IgNCBhcmd1bWVudHMsIGdvdCAje2FyaXR5fVwiXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAga2V5X2JmciA9IEBfZW5jb2RlX2tleSBkYiwgWyAnbWV0YScsIG5hbWUsIF1cbiAgZGJbICclc2VsZicgXS5nZXQga2V5X2JmciwgKCBlcnJvciwgdmFsdWUgKSA9PlxuICAgIGlmIGVycm9yP1xuICAgICAgcmV0dXJuIGhhbmRsZXIgbnVsbCwgZmFsbGJhY2sgaWYgKCBlcnJvclsgJ3R5cGUnIF0gaXMgJ05vdEZvdW5kRXJyb3InICkgYW5kICggZmFsbGJhY2sgaXNudCBAX21pc2ZpdCApXG4gICAgICByZXR1cm4gaGFuZGxlciBlcnJvclxuICAgIGhhbmRsZXIgbnVsbCwgdmFsdWVcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX2lzX21ldGEgPSAoIGRiLCBrZXlfYmZyICkgLT4gKCAoIGtleV9iZnIuc2xpY2UgMCwgQF9tZXRhX3ByZWZpeC5sZW5ndGggKS5jb21wYXJlIEBfbWV0YV9wcmVmaXggKSBpcyAwXG5cbiMjIyBUQUlOVCBtdXN0IGRlcml2ZSBtZXRhIGtleSBwcmVmaXggZnJvbSByZXN1bHQgb2YgYF9wdXRfbWV0YWAgIyMjXG5AX21ldGFfcHJlZml4ID0gbmV3IEJ1ZmZlciBbIDB4NTQsIDB4NmQsIDB4NjUsIDB4NzQsIDB4NjEsIDB4MDAsIF1cblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgV1JJVElOR1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AJHdyaXRlID0gKCBkYiwgc2V0dGluZ3MgKSAtPlxuICAjIyMgVEFJTlQgY3VycmVudGx5IGxvYWRpbmcgYW5kIHNhdmluZyBibG9vbSBmaWx0ZXIgZWFjaCB0aW1lIGEgcGlwZWxpbmUgd2l0aCBgJHdyaXRlYCBpcyBydW4gIyMjXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc2V0dGluZ3MgICAgICAgICA/PSB7fVxuICAjIyMgU3VwZXJmaWNpYWwgZXhwZXJpbWVudHMgc2hvdyB0aGF0IGEgbXVjaCBiaWdnZXIgYmF0Y2ggc2l6ZSB0aGFuIDEnMDAwIGRvZXMgbm90IHRlbmQgdG8gaW1wcm92ZVxuICB0aHJvdWdocHV0OyB0aGVyZWZvcmUsIGluIG9yZGVyIHRvIHJlZHVjZSBtZW1vcnkgZm9vdHByaW50LCBpdCBzZWVtcyBhZHZpc2FibGUgdG8gbGVhdmUgYmF0Y2ggc2l6ZVxuICBpbiB0aGUgb3JkZXIgb2YgYXJvdW5kIGEgdGhvdXNhbmQgZW50cmllcy4gIyMjXG4gIGJhdGNoX3NpemUgICAgICAgID0gc2V0dGluZ3NbICdiYXRjaCcgIF0gPyAxMDAwXG4gIHNvbGlkX3ByZWRpY2F0ZXMgID0gc2V0dGluZ3NbICdzb2xpZHMnIF0gPyBbXVxuICBlbnN1cmVfdW5pcXVlICAgICA9IHNldHRpbmdzWyAndW5pcXVlJyBdID8gdHJ1ZVxuICBzdWJzdHJhdGUgICAgICAgICA9IGRiWyAnJXNlbGYnIF1cbiAgUiAgICAgICAgICAgICAgICAgPSBELmNyZWF0ZV90aHJvdWdoc3RyZWFtKClcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAkaW5kZXggPSA9PiAkICggc3BvLCBzZW5kICkgPT5cbiAgICAjIyMgQW5hbHl6ZSBTUE8ga2V5IGFuZCBzZW5kIGFsbCBuZWNlc3NhcnkgUE9TIGZhY2V0czogIyMjXG4gICAgWyBzYmosIHByZCwgb2JqLCBdID0gc3BvXG4gICAgc2VuZCBbIFsgJ3NwbycsIHNiaiwgcHJkLCBdLCBvYmosIF1cbiAgICBvYmpfdHlwZSA9IENORC50eXBlX29mIG9ialxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgdW5sZXNzIG9ial90eXBlIGlzICdwb2QnXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIGlmICggb2JqX3R5cGUgaXMgJ2xpc3QnICkgYW5kIG5vdCAoIHByZCBpbiBzb2xpZF9wcmVkaWNhdGVzIClcbiAgICAgICAgZm9yIG9ial9lbGVtZW50LCBvYmpfaWR4IGluIG9ialxuICAgICAgICAgIHNlbmQgWyBbICdwb3MnLCBwcmQsIG9ial9lbGVtZW50LCBzYmosIG9ial9pZHgsIF0sIF1cbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgZWxzZVxuICAgICAgICBzZW5kIFsgWyAncG9zJywgcHJkLCBvYmosIHNiaiwgXSwgXVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICRlbmNvZGUgPSA9PiAkICggZmFjZXQsIHNlbmQgKSA9PlxuICAgIFsga2V5LCB2YWx1ZSwgXSA9IGZhY2V0XG4gICAgcGhyYXNldHlwZSAgICAgID0ga2V5WyAwIF1cbiAgICBrZXlfYmZyICAgICAgICAgPSBAX2VuY29kZV9rZXkgZGIsIGtleVxuICAgIHZhbHVlX2JmciAgICAgICA9IGlmIHZhbHVlPyB0aGVuIEBfZW5jb2RlX3ZhbHVlIGRiLCB2YWx1ZSBlbHNlIEBfemVyb192YWx1ZV9iZnJcbiAgICBzZW5kIFsgcGhyYXNldHlwZSwga2V5X2JmciwgdmFsdWVfYmZyLCBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgJGFzX2JhdGNoX2VudHJ5ID0gPT4gJCAoIGZhY2V0X2Jmcl9wbHVzLCBzZW5kICkgPT5cbiAgICBbIHBocmFzZXR5cGUsIGtleV9iZnIsIHZhbHVlX2JmciwgXSA9IGZhY2V0X2Jmcl9wbHVzXG4gICAgc2VuZCB0eXBlOiAncHV0Jywga2V5OiBrZXlfYmZyLCB2YWx1ZTogdmFsdWVfYmZyXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgJHdyaXRlID0gPT4gJCAoIGJhdGNoLCBzZW5kICkgPT5cbiAgICBzdWJzdHJhdGUuYmF0Y2ggYmF0Y2hcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBpZiBlbnN1cmVfdW5pcXVlXG4gICAgeyAkZW5zdXJlX3VuaXF1ZSwgJGxvYWRfYmxvb20sICRzYXZlX2Jsb29tLCB9ID0gQF9nZXRfYmxvb21fbWV0aG9kcyBkYlxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHBpcGVsaW5lID0gW11cbiAgcGlwZWxpbmUucHVzaCAkbG9hZF9ibG9vbSgpICAgICBpZiBlbnN1cmVfdW5pcXVlXG4gIHBpcGVsaW5lLnB1c2ggJGluZGV4KClcbiAgcGlwZWxpbmUucHVzaCAkZW5jb2RlKClcbiAgcGlwZWxpbmUucHVzaCAkZW5zdXJlX3VuaXF1ZSgpICBpZiBlbnN1cmVfdW5pcXVlXG4gIHBpcGVsaW5lLnB1c2ggJGFzX2JhdGNoX2VudHJ5KClcbiAgcGlwZWxpbmUucHVzaCBELiRiYXRjaCBiYXRjaF9zaXplXG4gIHBpcGVsaW5lLnB1c2ggJHdyaXRlKClcbiAgcGlwZWxpbmUucHVzaCAkc2F2ZV9ibG9vbSgpICAgICBpZiBlbnN1cmVfdW5pcXVlXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgUi5waXBlIEQuY29tYmluZSBwaXBlbGluZS4uLlxuICByZXR1cm4gUlxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfZ2V0X2Jsb29tX21ldGhvZHMgPSAoIGRiICkgLT5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBkYl9zaXplICAgICAgICAgICA9IGRiWyAnc2l6ZScgXSA/IDFlNlxuICBkYl9zaXplICAgICAgICAgICA9IGRiWyAnc2l6ZScgXSA/IDEwXG4gIGRiX3NpemUgICAgICAgICAgID0gZGJbICdzaXplJyBdID8gMWU0XG4gIGJsb29tX2Vycm9yX3JhdGUgID0gMC4xXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgQlNPTiA9ICggcmVxdWlyZSAnYnNvbicgKS5CU09OUHVyZS5CU09OXG4gIG5qc19mcyA9IHJlcXVpcmUgJ2ZzJ1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIEJMT0VNICAgICAgICAgICAgID0gcmVxdWlyZSAnYmxvZW0nXG4gIGJsb2VtX3NldHRpbmdzICAgID1cbiAgICBpbml0aWFsX2NhcGFjaXR5OiAgIGRiX3NpemUgKiAzXG4gICAgc2NhbGluZzogICAgICAgICAgICAyXG4gICAgcmF0aW86ICAgICAgICAgICAgICAwLjFcbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBzaG93X2Jsb29tX2luZm8gPSA9PlxuICAgIGJsb29tICAgICAgID0gZGJbICclYmxvb20nIF1cbiAgICBmaWx0ZXJzICAgICA9IGJsb29tWyAnZmlsdGVycycgXVxuICAgIGZpbHRlcl9zaXplID0gMFxuICAgIMaSICAgICAgICAgICA9IENORC5mb3JtYXRfbnVtYmVyXG4gICAgZm9yIGZpbHRlciBpbiBmaWx0ZXJzXG4gICAgICBmaWx0ZXJfc2l6ZSArPSBmaWx0ZXJbICdmaWx0ZXInIF1bICdiaXRmaWVsZCcgXVsgJ2J1ZmZlcicgXS5sZW5ndGhcbiAgICB3aGlzcGVyIFwic2NhbGFibGUgQmxvb20gZmlsdGVyIHNpemU6ICN7xpIgZmlsdGVyX3NpemV9IGJ5dGVzXCJcbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAkZW5zdXJlX3VuaXF1ZSA9ID0+XG4gICAgcmV0dXJuIEQuJG1hcCAoIHBocmFzZSwgaGFuZGxlciApID0+XG4gICAgICBibG9vbSAgICAgICAgICAgICAgID0gZGJbICclYmxvb20nIF1cbiAgICAgICMjIyA+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+PiAjIyNcbiAgICAgIFsgc2JqLCBwcmQsIG9iaiwgXSAgPSBwaHJhc2VcbiAgICAgIGtleSAgICAgICAgICAgICAgICAgPSBbICdzcG8nLCBzYmosIHByZCwgXVxuICAgICAga2V5X2JmciAgICAgICAgICAgICA9IGtleS5qb2luICd8J1xuICAgICAgIyMjID4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+ICMjI1xuICAgICAgYmxvb21faGFzX2tleSAgICAgICA9IGJsb29tLmhhcyBrZXlfYmZyXG4gICAgICBibG9vbS5hZGQga2V5X2JmclxuICAgICAgcmV0dXJuIGhhbmRsZXIgbnVsbCwgcGhyYXNlIHVubGVzcyBibG9vbV9oYXNfa2V5XG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIEBoYXMgZGIsIGtleSwgKCBlcnJvciwgZGJfaGFzX2tleSApID0+XG4gICAgICAgIHJldHVybiBoYW5kbGVyIGVycm9yIGlmIGVycm9yP1xuICAgICAgICByZXR1cm4gaGFuZGxlciBuZXcgRXJyb3IgXCJwaHJhc2UgYWxyZWFkeSBpbiBEQjogI3tycHIgcGhyYXNlfVwiIGlmIGRiX2hhc19rZXlcbiAgICAgICAgaGFuZGxlciBudWxsLCBwaHJhc2VcbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAkbG9hZF9ibG9vbSA9ID0+XG4gICAgaXNfZmlyc3QgPSB5ZXNcbiAgICByZXR1cm4gRC4kbWFwICggZGF0YSwgaGFuZGxlciApID0+XG4gICAgICB1bmxlc3MgaXNfZmlyc3RcbiAgICAgICAgcmV0dXJuIGlmIGRhdGE/IHRoZW4gaGFuZGxlciBudWxsLCBkYXRhIGVsc2UgaGFuZGxlcigpXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIGlzX2ZpcnN0ID0gbm9cbiAgICAgIHdoaXNwZXIgXCJsb2FkaW5nIEJsb29tIGZpbHRlci4uLlwiXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIEBfZ2V0X21ldGEgZGIsICdibG9vbScsIG51bGwsICggZXJyb3IsIGJsb29tX2JmciApID0+XG4gICAgICAgIHJldHVybiBzZW5kLmVycm9yIGVycm9yIGlmIGVycm9yP1xuICAgICAgICBpZiBibG9vbV9iZnIgaXMgbnVsbFxuICAgICAgICAgIHdhcm4gJ25vIGJsb29tIGZpbHRlciBmb3VuZCdcbiAgICAgICAgICBibG9vbSA9IG5ldyBCTE9FTS5TY2FsaW5nQmxvZW0gYmxvb21fZXJyb3JfcmF0ZSwgYmxvZW1fc2V0dGluZ3NcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGJsb29tX2RhdGEgPSBCU09OLmRlc2VyaWFsaXplIGJsb29tX2JmclxuICAgICAgICAgICMjIyBUQUlOVCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3dpZWRpL25vZGUtYmxvZW0vaXNzdWVzLzUgIyMjXG4gICAgICAgICAgZm9yIGZpbHRlciBpbiBibG9vbV9kYXRhWyAnZmlsdGVycycgXVxuICAgICAgICAgICAgYml0ZmllbGQgICAgICAgICAgICAgID0gZmlsdGVyWyAnZmlsdGVyJyBdWyAnYml0ZmllbGQnIF1cbiAgICAgICAgICAgIGJpdGZpZWxkWyAnYnVmZmVyJyBdICA9IGJpdGZpZWxkWyAnYnVmZmVyJyBdWyAnYnVmZmVyJyBdXG4gICAgICAgICAgYmxvb20gPSBCTE9FTS5TY2FsaW5nQmxvZW0uZGVzdHJpbmdpZnkgYmxvb21fZGF0YVxuICAgICAgICBkYlsgJyVibG9vbScgXSA9IGJsb29tXG4gICAgICAgIHdoaXNwZXIgXCIuLi5va1wiXG4gICAgICAgIHNob3dfYmxvb21faW5mbygpXG4gICAgICAgIHJldHVybiBpZiBkYXRhPyB0aGVuIGhhbmRsZXIgbnVsbCwgZGF0YSBlbHNlIGhhbmRsZXIoKVxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICRzYXZlX2Jsb29tID0gPT5cbiAgICByZXR1cm4gRC4kb25fZW5kICggc2VuZCwgZW5kICkgPT5cbiAgICAgIHdoaXNwZXIgXCJzYXZpbmcgQmxvb20gZmlsdGVyLi4uXCJcbiAgICAgIGJsb29tICAgICA9IGRiWyAnJWJsb29tJyBdXG4gICAgICBibG9vbV9iZnIgPSBCU09OLnNlcmlhbGl6ZSBibG9vbVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBAX3B1dF9tZXRhIGRiLCAnYmxvb20nLCBibG9vbV9iZnIsICggZXJyb3IgKSA9PlxuICAgICAgICByZXR1cm4gc2VuZC5lcnJvciBlcnJvciBpZiBlcnJvcj9cbiAgICAgICAgd2hpc3BlciBcIi4uLm9rXCJcbiAgICAgICAgZW5kKClcbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICByZXR1cm4geyAkZW5zdXJlX3VuaXF1ZSwgJGxvYWRfYmxvb20sICRzYXZlX2Jsb29tLCB9XG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIFJFQURJTkdcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQGNyZWF0ZV9waHJhc2VzdHJlYW0gPSAoIGRiLCBsb19oaW50ID0gbnVsbCwgaGlfaGludCA9IG51bGwsIHNldHRpbmdzICkgLT5cbiAgcmV0dXJuIEBfY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgbG9faGludCwgaGlfaGludCwgc2V0dGluZ3NcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AcmVhZF9waHJhc2VzID0gKCBkYiwgbG9faGludCA9IG51bGwsIGhpX2hpbnQgPSBudWxsLCBzZXR0aW5ncywgaGFuZGxlciApIC0+XG4gICMjIyBUQUlOVCBhcmd1bWVudHMgZG9uJ3Qgd29yayB0aGlzIHdheSwgbXVzdCBob25vciBhcml0eSAjIyNcbiAgcmV0dXJuIEBfY3JlYXRlX3BocmFzZXN0cmVhbSBkYiwgbG9faGludCwgaGlfaGludCwgc2V0dGluZ3MsIGhhbmRsZXJcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX2NyZWF0ZV9waHJhc2VzdHJlYW0gPSAoIGRiLCBsb19oaW50ID0gbnVsbCwgaGlfaGludCA9IG51bGwsIHNldHRpbmdzLCBoYW5kbGVyICkgLT5cbiAgaW5wdXQgPSBAY3JlYXRlX2ZhY2V0c3RyZWFtIGRiLCBsb19oaW50LCBoaV9oaW50LCBzZXR0aW5nc1xuICBSID0gaW5wdXQucGlwZSBAJGFzX3BocmFzZSBkYlxuICBpZiBoYW5kbGVyP1xuICAgIFIgPSBSXG4gICAgICAucGlwZSBELiRjb2xsZWN0KClcbiAgICAgIC5waXBlICQgKCBkYXRhLCBzZW5kICkgPT5cbiAgICAgICAgaGFuZGxlciBudWxsLCBkYXRhXG4gICAgUi5vbiAnZXJyb3InLCAoIGVycm9yICkgPT4gaGFuZGxlciBlcnJvclxuICBSWyAnJW1ldGEnIF0gPSBpbnB1dFsgJyVtZXRhJyBdXG4gIHJldHVybiBSXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQGNyZWF0ZV9mYWNldHN0cmVhbSA9ICggZGIsIGxvX2hpbnQgPSBudWxsLCBoaV9oaW50ID0gbnVsbCwgc2V0dGluZ3MgKSAtPlxuICAjIyNcbiAgKiBJZiBuZWl0ZXIgYGxvYCBub3IgYGhpYCBpcyBnaXZlbiwgdGhlIHN0cmVhbSB3aWxsIGl0ZXJhdGUgb3ZlciBhbGwgZW50cmllcy5cbiAgKiBJZiBib3RoIGBsb2AgYW5kIGBoaWAgYXJlIGdpdmVuLCBhIHF1ZXJ5IHdpdGggbG93ZXIgYW5kIHVwcGVyLCBpbmNsdXNpdmUgYm91bmRhcmllcyBpc1xuICAgIGlzc3VlZC5cbiAgKiBJZiBvbmx5IGBsb2AgaXMgZ2l2ZW4sIGEgcHJlZml4IHF1ZXJ5IGlzIGlzc3VlZC5cbiAgKiBJZiBgaGlgIGlzIGdpdmVuIGJ1dCBgbG9gIGlzIG1pc3NpbmcsIGFuIGVycm9yIGlzIGlzc3VlZC5cbiAgIyMjXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgaWYgaGlfaGludD8gYW5kIG5vdCBsb19oaW50P1xuICAgIHRocm93IG5ldyBFcnJvciBcIm11c3QgZ2l2ZSBgbG9faGludGAgd2hlbiBgaGlfaGludGAgaXMgZ2l2ZW5cIlxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGlmIGxvX2hpbnQ/IGFuZCBub3QgaGlfaGludD9cbiAgICBxdWVyeSAgICAgICA9IEBfcXVlcnlfZnJvbV9wcmVmaXggZGIsIGxvX2hpbnRcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBlbHNlIGlmIGxvX2hpbnQ/IGFuZCBoaV9oaW50IGlzICcqJ1xuICAgIHF1ZXJ5ICAgICAgID0gQF9xdWVyeV9mcm9tX3ByZWZpeCBkYiwgbG9faGludCwgJyonXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZWxzZVxuICAgIGxvX2hpbnRfYmZyID0gaWYgbG9faGludD8gdGhlbiAoICAgICAgICBAX2VuY29kZV9rZXkgZGIsIGxvX2hpbnQgKSAgICAgICAgICBlbHNlIG51bGxcbiAgICBoaV9oaW50X2JmciA9IGlmIGhpX2hpbnQ/IHRoZW4gKCBAX3F1ZXJ5X2Zyb21fcHJlZml4IGRiLCBoaV9oaW50IClbICdsdGUnIF0gZWxzZSBudWxsXG4gICAgIyBsb19oaW50X2JmciA9IGlmIGxvX2hpbnQ/IHRoZW4gKCAgICAgICAgQF9lbmNvZGVfa2V5IGRiLCBsb19oaW50ICkgICAgICAgICAgZWxzZSBDT0RFQ1sgJ2tleXMnIF1bICdsbycgXVxuICAgICMgaGlfaGludF9iZnIgPSBpZiBoaV9oaW50PyB0aGVuICggQF9xdWVyeV9mcm9tX3ByZWZpeCBkYiwgaGlfaGludCApWyAnbHRlJyBdIGVsc2UgQ09ERUNbICdrZXlzJyBdWyAnaGknIF1cbiAgICBxdWVyeSAgICAgICA9IHsgZ3RlOiBsb19oaW50X2JmciwgbHRlOiBoaV9oaW50X2JmciwgfVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICMjIyBUQUlOVCBTaG91bGQgd2UgdGVzdCBmb3Igd2VsbC1mb3JtZWQgZW50cmllcyBoZXJlPyAjIyNcbiAgUiA9IGRiWyAnJXNlbGYnIF0uY3JlYXRlUmVhZFN0cmVhbSBxdWVyeVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIFIgPSBSLnBpcGUgJCAoIHsga2V5LCB2YWx1ZSB9LCBzZW5kICkgPT5cbiAgICB1bmxlc3MgQF9pc19tZXRhIGRiLCBrZXlcbiAgICAgIHNlbmQgWyAoIEBfZGVjb2RlX2tleSBkYiwga2V5ICksICggQF9kZWNvZGVfdmFsdWUgZGIsIHZhbHVlICksIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBSWyAnJW1ldGEnIF0gPSB7fVxuICBSWyAnJW1ldGEnIF1bICdxdWVyeScgXSA9IHF1ZXJ5XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcmV0dXJuIFJcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AaGFzID0gKCBkYiwga2V5LCBoYW5kbGVyICkgLT5cbiAga2V5X2JmciA9IEBfZW5jb2RlX2tleSBkYiwga2V5XG4gIGRiWyAnJXNlbGYnIF0uZ2V0IGtleV9iZnIsICggZXJyb3IsIG9ial9iZnIgKSA9PlxuICAgIGlmIGVycm9yP1xuICAgICAgcmV0dXJuIGhhbmRsZXIgbnVsbCwgZmFsc2UgaWYgZXJyb3JbICd0eXBlJyBdIGlzICdOb3RGb3VuZEVycm9yJ1xuICAgICAgcmV0dXJuIGhhbmRsZXIgZXJyb3JcbiAgICBoYW5kbGVyIG51bGwsIHRydWVcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AZW5zdXJlX25ld19rZXkgPSAoIGRiLCBrZXksIGhhbmRsZXIgKSAtPlxuICBrZXlfYmZyID0gQF9lbmNvZGVfa2V5IGRiLCBrZXlcbiAgZGJbICclc2VsZicgXS5nZXQga2V5X2JmciwgKCBlcnJvciwgb2JqX2JmciApID0+XG4gICAgaWYgZXJyb3I/XG4gICAgICByZXR1cm4gaGFuZGxlciBudWxsIGlmIGVycm9yWyAndHlwZScgXSBpcyAnTm90Rm91bmRFcnJvcidcbiAgICAgIHJldHVybiBoYW5kbGVyIGVycm9yXG4gICAgb2JqID0gQF9kZWNvZGVfdmFsdWUgb2JqX2JmclxuICAgIGhhbmRsZXIgbmV3IEVycm9yIFwia2V5ICN7cnByIGtleX0gYWxyZWFkeSBpbiBEQiB3aXRoIHZhbHVlICN7cnByIG9ian1cIlxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkByZWFkX3N1YiA9ICggZGIsIHNldHRpbmdzLCByZWFkICkgLT5cbiAgc3dpdGNoIGFyaXR5ID0gYXJndW1lbnRzLmxlbmd0aFxuICAgIHdoZW4gMlxuICAgICAgcmVhZCAgICAgID0gc2V0dGluZ3NcbiAgICAgIHNldHRpbmdzICA9IG51bGxcbiAgICB3aGVuIDNcbiAgICAgIG51bGxcbiAgICBlbHNlXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJleHBlY3RlZCAyIG9yIDMgYXJndW1lbnRzLCBnb3QgI3thcml0eX1cIlxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGluZGV4ZWQgICAgICAgICAgID0gc2V0dGluZ3M/WyAnaW5kZXhlZCcgICAgXSA/IG5vXG4gICMgdHJhbnNmb3JtICAgICAgICAgPSBzZXR0aW5ncz9bICd0cmFuc2Zvcm0nICBdID8gRC4kcGFzc190aHJvdWdoKClcbiAgbWFuZ2xlICAgICAgICAgICAgPSBzZXR0aW5ncz9bICdtYW5nbGUnICAgICBdID8gKCBkYXRhICkgLT4gZGF0YVxuICBzZW5kX2VtcHR5ICAgICAgICA9IHNldHRpbmdzP1sgJ2VtcHR5JyAgICAgIF0gPyBub1xuICBpbnNlcnRfaW5kZXggICAgICA9IGlmIGluZGV4ZWQgdGhlbiBELm5ld19pbmRleGVyKCkgZWxzZSAoIHggKSAtPiB4XG4gIG9wZW5fc3RyZWFtX2NvdW50ID0gMFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHJldHVybiAkICggb3V0ZXJfZGF0YSwgb3V0ZXJfc2VuZCwgb3V0ZXJfZW5kICkgPT5cbiAgICBjb3VudCA9IDBcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGlmIG91dGVyX2RhdGE/XG4gICAgICBvcGVuX3N0cmVhbV9jb3VudCAgICArPSArMVxuICAgICAgc3ViX2lucHV0ICAgICAgICAgICAgID0gcmVhZCBvdXRlcl9kYXRhXG4gICAgICBbIG1lbW8sIHN1Yl9pbnB1dCwgXSAgPSBpZiBDTkQuaXNhX2xpc3Qgc3ViX2lucHV0IHRoZW4gc3ViX2lucHV0IGVsc2UgWyBAX21pc2ZpdCwgc3ViX2lucHV0LCBdXG4gICAgICBzdWJfaW5wdXRcbiAgICAgICAgIyAucGlwZSB0cmFuc2Zvcm1cbiAgICAgICAgLnBpcGUgZG8gPT5cbiAgICAgICAgICAjIyMgVEFJTlQgbm8gbmVlZCB0byBidWlsZCBidWZmZXIgaWYgbm90IGBzZW5kX2VtcHR5YCBhbmQgdGhlcmUgYXJlIG5vIHJlc3VsdHMgIyMjXG4gICAgICAgICAgYnVmZmVyID0gaWYgbWVtbyBpcyBAX21pc2ZpdCB0aGVuIFtdIGVsc2UgWyBtZW1vLCBdXG4gICAgICAgICAgcmV0dXJuICQgKCBpbm5lcl9kYXRhLCBfLCBpbm5lcl9lbmQgKSA9PlxuICAgICAgICAgICAgaWYgaW5uZXJfZGF0YT9cbiAgICAgICAgICAgICAgaW5uZXJfZGF0YSA9IG1hbmdsZSBpbm5lcl9kYXRhXG4gICAgICAgICAgICAgIGlmIGlubmVyX2RhdGE/XG4gICAgICAgICAgICAgICAgY291bnQgKz0gKzFcbiAgICAgICAgICAgICAgICBidWZmZXIucHVzaCBpbm5lcl9kYXRhXG4gICAgICAgICAgICBpZiBpbm5lcl9lbmQ/XG4gICAgICAgICAgICAgIGlmIHNlbmRfZW1wdHkgb3IgY291bnQgPiAwXG4gICAgICAgICAgICAgICAgb3V0ZXJfc2VuZCBpbnNlcnRfaW5kZXggYnVmZmVyXG4gICAgICAgICAgICAgIG9wZW5fc3RyZWFtX2NvdW50ICs9IC0xXG4gICAgICAgICAgICAgIGlubmVyX2VuZCgpXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpZiBvdXRlcl9lbmQ/XG4gICAgICByZXBlYXRfaW1tZWRpYXRlbHkgLT5cbiAgICAgICAgcmV0dXJuIHRydWUgdW5sZXNzIG9wZW5fc3RyZWFtX2NvdW50IGlzIDBcbiAgICAgICAgb3V0ZXJfZW5kKClcbiAgICAgICAgcmV0dXJuIGZhbHNlXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIEtFWVMgJiBWQUxVRVNcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9lbmNvZGVfa2V5ID0gKCBkYiwga2V5LCBleHRyYV9ieXRlICkgLT5cbiAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBrZXkgI3tycHIga2V5fVwiIGlmIGtleSBpcyB1bmRlZmluZWRcbiAgcmV0dXJuIF9jb2RlY19lbmNvZGUga2V5LCBleHRyYV9ieXRlXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9kZWNvZGVfa2V5ID0gKCBkYiwga2V5ICkgLT5cbiAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBrZXkgI3tycHIga2V5fVwiIGlmICggUiA9IF9jb2RlY19kZWNvZGUga2V5ICkgaXMgdW5kZWZpbmVkXG4gIHJldHVybiBSXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9lbmNvZGVfdmFsdWUgPSAoIGRiLCB2YWx1ZSAgICAgICkgLT4gbmV3IEJ1ZmZlciAoIEpTT04uc3RyaW5naWZ5IHZhbHVlICksICd1dGYtOCdcbkBfZGVjb2RlX3ZhbHVlID0gKCBkYiwgdmFsdWVfYmZyICApIC0+IEpTT04ucGFyc2UgdmFsdWVfYmZyLnRvU3RyaW5nICd1dGYtOCdcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIyMgTkIgQXJndW1lbnQgb3JkZXJpbmcgZm9yIHRoZXNlIGZ1bmN0aW9uIGlzIGFsd2F5cyBzdWJqZWN0IGJlZm9yZSBvYmplY3QsIHJlZ2FyZGxlc3Mgb2YgdGhlIHBocmFzZXR5cGVcbmFuZCB0aGUgb3JkZXJpbmcgaW4gdGhlIHJlc3VsdGluZyBrZXkuICMjI1xuQG5ld19rZXkgPSAoIGRiLCBwaHJhc2V0eXBlLCBzaywgc3YsIG9rLCBvdiwgaWR4ICkgLT5cbiAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBwaHJhc2V0eXBlOiAje3JwciBwaHJhc2V0eXBlfVwiIHVubGVzcyBwaHJhc2V0eXBlIGluIFsgJ3NvJywgJ29zJywgXVxuICBbIHNrLCBzdiwgb2ssIG92LCBdID0gWyBvaywgb3YsIHNrLCBzdiwgXSBpZiBwaHJhc2V0eXBlIGlzICdvcydcbiAgcmV0dXJuIFsgcGhyYXNldHlwZSwgc2ssIHN2LCBvaywgb3YsICggaWR4ID8gMCApLCBdXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQG5ld19zb19rZXkgPSAoIGRiLCBQLi4uICkgLT4gQG5ld19rZXkgZGIsICdzbycsIFAuLi5cbkBuZXdfb3Nfa2V5ID0gKCBkYiwgUC4uLiApIC0+IEBuZXdfa2V5IGRiLCAnb3MnLCBQLi4uXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9uZXdfb3Nfa2V5X2Zyb21fc29fa2V5ID0gKCBkYiwgc29fa2V5ICkgLT5cbiAgWyBwaHJhc2V0eXBlLCBzaywgc3YsIG9rLCBvdiwgaWR4LCBdID0gQGFzX3BocmFzZSBkYiwgc29fa2V5XG4gIHRocm93IG5ldyBFcnJvciBcImV4cGVjdGVkIHBocmFzZXR5cGUgJ3NvJywgZ290ICN7cnByIHBocmFzZXR5cGV9XCIgdW5sZXNzIHBocmFzZXR5cGUgaXMgJ3NvJ1xuICByZXR1cm4gWyAnb3MnLCBvaywgb3YsIHNrLCBzdiwgaWR4LCBdXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQG5ld19rZXlzID0gKCBkYiwgcGhyYXNldHlwZSwgc2ssIHN2LCBvaywgb3YsIGlkeCApIC0+XG4gIG90aGVyX3BocmFzZXR5cGUgID0gaWYgcGhyYXNldHlwZSBpcyAnc28nIHRoZW4gJ29zJyBlbHNlICdzbydcbiAgcmV0dXJuIFtcbiAgICAoIEBuZXdfa2V5IGRiLCAgICAgICBwaHJhc2V0eXBlLCBzaywgc3YsIG9rLCBvdiwgaWR4ICksXG4gICAgKCBAbmV3X2tleSBkYiwgb3RoZXJfcGhyYXNldHlwZSwgc2ssIHN2LCBvaywgb3YsIGlkeCApLCBdXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQGFzX3BocmFzZSA9ICggZGIsIGtleSwgdmFsdWUsIG5vcm1hbGl6ZSA9IHllcyApIC0+XG4gIHN3aXRjaCBwaHJhc2V0eXBlID0ga2V5WyAwIF1cbiAgICB3aGVuICdzcG8nXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIFNQTyBrZXkgKGxlbmd0aCAje2xlbmd0aH0pXCIgdW5sZXNzICggbGVuZ3RoID0ga2V5Lmxlbmd0aCApIGlzIDNcbiAgICAgIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgdmFsdWUgKDEpICN7cnByIHZhbHVlfVwiIGlmIHZhbHVlIGluIFsgdW5kZWZpbmVkLCBdXG4gICAgICByZXR1cm4gWyBwaHJhc2V0eXBlLCBrZXlbIDEgXSwga2V5WyAyIF0sIHZhbHVlLCBdXG4gICAgd2hlbiAncG9zJ1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBQT1Mga2V5IChsZW5ndGggI3tsZW5ndGh9KVwiIHVubGVzcyA0IDw9ICggbGVuZ3RoID0ga2V5Lmxlbmd0aCApIDw9IDVcbiAgICAgIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgdmFsdWUgKDIpICN7cnByIHZhbHVlfVwiIGlmIG5vdCAoIHZhbHVlIGluIFsgbnVsbCwgXSApXG4gICAgICByZXR1cm4gWyBwaHJhc2V0eXBlLCBrZXlbIDMgXSwga2V5WyAxIF0sIGtleVsgMiBdLCBrZXlbIDQgXSwgXSBpZiBrZXlbIDQgXT9cbiAgICAgIHJldHVybiBbIHBocmFzZXR5cGUsIGtleVsgMyBdLCBrZXlbIDEgXSwga2V5WyAyIF0sIF1cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AJGFzX3BocmFzZSA9ICggZGIgKSAtPlxuICByZXR1cm4gJCAoIGRhdGEsIHNlbmQgKSA9PlxuICAgIHNlbmQgQGFzX3BocmFzZSBkYiwgZGF0YS4uLlxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBrZXlfZnJvbV91cmwgPSAoIGRiLCB1cmwgKSAtPlxuICAjIyMgVEFJTlQgZG9lcyBub3QgdW5lc2NhcGUgYXMgeWV0ICMjI1xuICAjIyMgVEFJTlQgZG9lcyBub3QgY2FzdCB2YWx1ZXMgYXMgeWV0ICMjI1xuICAjIyMgVEFJTlQgZG9lcyBub3Qgc3VwcG9ydCBtdWx0aXBsZSBpbmRleGVzIGFzIHlldCAjIyNcbiAgWyBwaHJhc2V0eXBlLCBmaXJzdCwgc2Vjb25kLCBpZHgsIF0gPSB1cmwuc3BsaXQgJ3wnXG4gIHVubGVzcyBwaHJhc2V0eXBlPyBhbmQgcGhyYXNldHlwZS5sZW5ndGggPiAwIGFuZCBwaHJhc2V0eXBlIGluIFsgJ3NvJywgJ29zJywgXVxuICAgIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgVVJMIGtleSAje3JwciB1cmx9XCJcbiAgdW5sZXNzIGZpcnN0PyBhbmQgZmlyc3QubGVuZ3RoID4gMCBhbmQgc2Vjb25kPyBhbmQgc2Vjb25kLmxlbmd0aCA+IDBcbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIFVSTCBrZXkgI3tycHIgdXJsfVwiXG4gIGlkeCA9IGlmICggaWR4PyBhbmQgaWR4Lmxlbmd0aCA+IDAgKSB0aGVuICggcGFyc2VJbnQgaWR4LCAxMCApIGVsc2UgMFxuICBbIHNrLCBzdiwgXSA9ICBmaXJzdC5zcGxpdCAnOidcbiAgWyBvaywgb3YsIF0gPSBzZWNvbmQuc3BsaXQgJzonXG4gIHVubGVzcyBzaz8gYW5kIHNrLmxlbmd0aCA+IDAgYW5kIG9rPyBhbmQgb2subGVuZ3RoID4gMFxuICAgIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgVVJMIGtleSAje3JwciB1cmx9XCJcbiAgWyBzaywgc3YsIG9rLCBvdiwgXSA9IFsgb2ssIG92LCBzaywgc3YsIF0gaWYgcGhyYXNldHlwZSBpcyAnb3MnXG4gIHJldHVybiBbIHBocmFzZXR5cGUsIHNrLCBzdiwgb2ssIG92LCBpZHgsIF1cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AdXJsX2Zyb21fa2V5ID0gKCBkYiwga2V5ICkgLT5cbiAgaWYgKCBAX3R5cGVfZnJvbV9rZXkgZGIsIGtleSApIGlzICdsaXN0J1xuICAgIFsgcGhyYXNldHlwZSwgdGFpbC4uLiwgXSA9IGtleVxuICAgIGlmIHBocmFzZXR5cGUgaXMgJ3NwbydcbiAgICAgIFsgc2JqLCBwcmQsIF0gPSB0YWlsXG4gICAgICByZXR1cm4gXCJzcG98I3tzYmp9fCN7cHJkfXxcIlxuICAgIGVsc2VcbiAgICAgIFsgcHJkLCBvYmosIHNiaiwgaWR4LCBdID0gdGFpbFxuICAgICAgaWR4X3JwciA9IGlmIGlkeD8gdGhlbiBycHIgaWR4IGVsc2UgJydcbiAgICAgIHJldHVybiBcInBvc3wje3ByZH06I3tvYmp9fCN7c2JqfXwje2lkeF9ycHJ9XCJcbiAgcmV0dXJuIFwiI3tycHIga2V5fVwiXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQCR1cmxfZnJvbV9rZXkgPSAoIGRiICkgLT4gJCAoIGtleSwgc2VuZCApID0+IHNlbmQgQHVybF9mcm9tX2tleSBkYiwga2V5XG5AJGtleV9mcm9tX3VybCA9ICggZGIgKSAtPiAkICggdXJsLCBzZW5kICkgPT4gc2VuZCBAa2V5X2Zyb21fdXJsIGRiLCBrZXlcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX3R5cGVfZnJvbV9rZXkgPSAoIGRiLCBrZXkgKSAtPlxuICBpZiBBcnJheS5pc0FycmF5IGtleVxuICAgICMgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBrZXk6ICN7cnByIGtleX1cIiB1bmxlc3Mga2V5Lmxlbmd0aCBpcyA2XG4gICAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBwaHJhc2V0eXBlOiAje3JwciBrZXl9XCIgdW5sZXNzIGtleVsgJzAnIF0gaW4gQHBocmFzZXR5cGVzXG4gICAgcmV0dXJuICdsaXN0J1xuICByZXR1cm4gJ290aGVyJ1xuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyBQUkVGSVhFUyAmIFFVRVJJRVNcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9xdWVyeV9mcm9tX3ByZWZpeCA9ICggZGIsIGxvX2hpbnQsIHN0YXIgKSAtPlxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGlmIHN0YXI/XG4gICAgIyMjICdBc3RlcmlzaycgZW5jb2Rpbmc6IHBhcnRpYWwga2V5IHNlZ21lbnRzIG1hdGNoICMjI1xuICAgIGd0ZSAgID0gQF9lbmNvZGVfa2V5IGRiLCBsb19oaW50XG4gICAgbHRlICAgPSBAX2VuY29kZV9rZXkgZGIsIGxvX2hpbnRcbiAgICBsdGVbIGx0ZS5sZW5ndGggLSAxIF0gPSBDT0RFQ1sgJ3R5cGVtYXJrZXJzJyAgXVsgJ2hpJyBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZWxzZVxuICAgICMjIyAnQ2xhc3NpY2FsJyBlbmNvZGluZzogb25seSBmdWxsIGtleSBzZWdtZW50cyBtYXRjaCAjIyNcbiAgICBiYXNlICA9IEBfZW5jb2RlX2tleSBkYiwgbG9faGludCwgQ09ERUNbICd0eXBlbWFya2VycycgIF1bICdoaScgXVxuICAgIGd0ZSAgID0gYmFzZS5zbGljZSAwLCBiYXNlLmxlbmd0aCAtIDFcbiAgICBsdGUgICA9IGJhc2Uuc2xpY2UgMCwgYmFzZS5sZW5ndGhcbiAgcmV0dXJuIHsgZ3RlLCBsdGUsIH1cblxuXG5cblxuXG4iXX0=