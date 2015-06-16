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
    var R, input;
    if (lo_hint == null) {
      lo_hint = null;
    }
    if (hi_hint == null) {
      hi_hint = null;
    }
    input = this.create_facetstream(db, lo_hint, hi_hint, settings);
    R = input.pipe(this.$as_phrase(db));
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

    /* TAIN does not unescape as yet */

    /* TAIN does not cast values as yet */

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

//# sourceMappingURL=data:application/json;base64,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QUFBLE1BQU8sS0FBQSxHQUFQO0tBQVAsQ0Fib0I7RUFBQSxDQXZldEIsQ0FBQTtBQUFBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJcblxuXG4jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiMgbmpzX3V0aWwgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ3V0aWwnXG4jIG5qc19wYXRoICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdwYXRoJ1xuIyBuanNfZnMgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnZnMnXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkNORCAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdjbmQnXG5ycHIgICAgICAgICAgICAgICAgICAgICAgID0gQ05ELnJwclxuYmFkZ2UgICAgICAgICAgICAgICAgICAgICA9ICdIT0xMRVJJVEgvbWFpbidcbmxvZyAgICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAncGxhaW4nLCAgICAgYmFkZ2VcbmRlYnVnICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnZGVidWcnLCAgICAgYmFkZ2Vcbndhcm4gICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnd2FybicsICAgICAgYmFkZ2VcbmhlbHAgICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnaGVscCcsICAgICAgYmFkZ2VcbnVyZ2UgICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAndXJnZScsICAgICAgYmFkZ2VcbndoaXNwZXIgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnd2hpc3BlcicsICAgYmFkZ2VcbmVjaG8gICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZWNoby5iaW5kIENORFxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5zdXNwZW5kICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnY29mZmVlbm9kZS1zdXNwZW5kJ1xuc3RlcCAgICAgICAgICAgICAgICAgICAgICA9IHN1c3BlbmQuc3RlcFxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5DT0RFQyAgICAgICAgICAgICAgICAgICAgID0gQENPREVDID0gcmVxdWlyZSAnLi9jb2RlYydcbkRVTVAgICAgICAgICAgICAgICAgICAgICAgPSBARFVNUCAgPSByZXF1aXJlICcuL2R1bXAnXG5fY29kZWNfZW5jb2RlICAgICAgICAgICAgID0gQ09ERUMuZW5jb2RlLmJpbmQgQ09ERUNcbl9jb2RlY19kZWNvZGUgICAgICAgICAgICAgPSBDT0RFQy5kZWNvZGUuYmluZCBDT0RFQ1xuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5EICAgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAncGlwZWRyZWFtczInXG4kICAgICAgICAgICAgICAgICAgICAgICAgID0gRC5yZW1pdC5iaW5kIERcbl9uZXdfbGV2ZWxfZGIgICAgICAgICAgICAgPSByZXF1aXJlICdsZXZlbCdcbmxldmVsZG93biAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdsZXZlbC9ub2RlX21vZHVsZXMvbGV2ZWxkb3duJ1xuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5zdXNwZW5kICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnY29mZmVlbm9kZS1zdXNwZW5kJ1xuc3RlcCAgICAgICAgICAgICAgICAgICAgICA9IHN1c3BlbmQuc3RlcFxucmVwZWF0X2ltbWVkaWF0ZWx5ICAgICAgICA9IHN1c3BlbmQucmVwZWF0X2ltbWVkaWF0ZWx5XG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkxPREFTSCAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdsb2Rhc2gnXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMjIyBodHRwczovL2dpdGh1Yi5jb20vYjNuajRtL2Jsb29tLXN0cmVhbSAjIyNcbkJsb29tICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdibG9vbS1zdHJlYW0nXG5cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AcGhyYXNldHlwZXMgICAgICA9IFsgJ3BvcycsICdzcG8nLCBdXG5AX21pc2ZpdCAgICAgICAgICA9IFN5bWJvbCAnbWlzZml0J1xuQF96ZXJvX3ZhbHVlX2JmciAgPSBuZXcgQnVmZmVyICdudWxsJ1xuIyB3YXJuIFwibWluZCBpbmNvbnNpc3RlbmNpZXMgaW4gSE9MTEVSSVRIMi9tYWluIEBfemVyb19lbmMgZXRjXCJcbiMgQF96ZXJvICAgICAgICAgICAgPSB0cnVlICMgPz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz9cbiMgQF96ZXJvX2VuYyAgICAgICAgPSBfY29kZWNfZW5jb2RlIFsgQF96ZXJvLCAgICBdXG4jIEBfbG9fZW5jICAgICAgICAgID0gX2NvZGVjX2VuY29kZSBbIG51bGwsICAgICAgXVxuIyBAX2hpX2VuYyAgICAgICAgICA9IF9jb2RlY19lbmNvZGUgWyBDT0RFQy4sIF1cbiMgQF9sYXN0X29jdGV0ICAgICAgPSBuZXcgQnVmZmVyIFsgMHhmZiwgXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBuZXdfZGIgPSAoIHJvdXRlICkgLT5cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBsZXZlbF9zZXR0aW5ncyA9XG4gICAgJ2tleUVuY29kaW5nJzogICAgICAgICAgJ2JpbmFyeSdcbiAgICAndmFsdWVFbmNvZGluZyc6ICAgICAgICAnYmluYXJ5J1xuICAgICdjcmVhdGVJZk1pc3NpbmcnOiAgICAgIHllc1xuICAgICdlcnJvcklmRXhpc3RzJzogICAgICAgIG5vXG4gICAgJ2NvbXByZXNzaW9uJzogICAgICAgICAgeWVzXG4gICAgJ3N5bmMnOiAgICAgICAgICAgICAgICAgbm9cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzdWJzdHJhdGUgICAgICAgICAgID0gX25ld19sZXZlbF9kYiByb3V0ZSwgbGV2ZWxfc2V0dGluZ3NcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBSID1cbiAgICAnfmlzYSc6ICAgICAgICAgICAnSE9MTEVSSVRIL2RiJ1xuICAgICclc2VsZic6ICAgICAgICAgIHN1YnN0cmF0ZVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHJldHVybiBSXG5cbiMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEBfcmVvcGVuID0gKCBkYiwgaGFuZGxlciApIC0+XG4jICAgc3RlcCAoIHJlc3VtZSApID0+XG4jICAgICByb3V0ZSA9IGRiWyAnJXNlbGYnIF1bICdsb2NhdGlvbicgXVxuIyAgICAgeWllbGQgZGJbICclc2VsZicgXS5jbG9zZSByZXN1bWVcbiMgICAgIHlpZWxkIGRiWyAnJXNlbGYnIF0ub3BlbiByZXN1bWVcbiMgICAgIHdoaXNwZXIgXCJyZS1vcGVuZWQgTGV2ZWxEQiBhdCAje3JvdXRlfVwiXG4jICAgICBoYW5kbGVyIG51bGxcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AY2xlYXIgPSAoIGRiLCBoYW5kbGVyICkgLT5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgcm91dGUgPSBkYlsgJyVzZWxmJyBdWyAnbG9jYXRpb24nIF1cbiAgICB3aGlzcGVyIFwiY2xvc2luZyBEQlwiXG4gICAgeWllbGQgZGJbICclc2VsZicgXS5jbG9zZSByZXN1bWVcbiAgICAjIHdoaXNwZXIgXCJlcmFzaW5nIERCXCJcbiAgICB5aWVsZCBsZXZlbGRvd24uZGVzdHJveSByb3V0ZSwgcmVzdW1lXG4gICAgIyB3aGlzcGVyIFwicmUtb3BlbmluZyBEQlwiXG4gICAgeWllbGQgZGJbICclc2VsZicgXS5vcGVuIHJlc3VtZVxuICAgIHdoaXNwZXIgXCJlcmFzZWQgYW5kIHJlLW9wZW5lZCBMZXZlbERCIGF0ICN7cm91dGV9XCJcbiAgICBoYW5kbGVyIG51bGxcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgTUVUQURBVEFcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9wdXRfbWV0YSA9ICggZGIsIG5hbWUsIHZhbHVlLCBoYW5kbGVyICkgLT5cbiAgIyMjIFRBSU5UIHNob3VsZCB1c2Ugb3duIHR5cGUgZm9yIG1ldGFkYXRhICMjI1xuICBrZXlfYmZyICAgPSBAX2VuY29kZV9rZXkgZGIsIFsgJ21ldGEnLCBuYW1lLCBdXG4gIHZhbHVlX2JmciA9IGlmIENORC5pc2FfanNidWZmZXIgdGhlbiB2YWx1ZSBlbHNlIEBfZW5jb2RlX3ZhbHVlIGRiLCB2YWx1ZVxuICBkYlsgJyVzZWxmJyBdLnB1dCBrZXlfYmZyLCB2YWx1ZV9iZnIsICggZXJyb3IgKSA9PiBoYW5kbGVyIGVycm9yIGlmIGhhbmRsZXI/XG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9nZXRfbWV0YSA9ICggZGIsIG5hbWUsIGZhbGxiYWNrLCBoYW5kbGVyICkgLT5cbiAgc3dpdGNoIGFyaXR5ID0gYXJndW1lbnRzLmxlbmd0aFxuICAgIHdoZW4gM1xuICAgICAgaGFuZGxlciAgID0gZmFsbGJhY2tcbiAgICAgIGZhbGxiYWNrICA9IEBfbWlzZml0XG4gICAgd2hlbiA0XG4gICAgICBudWxsXG4gICAgZWxzZVxuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiZXhwZWN0ZWQgMyBvciA0IGFyZ3VtZW50cywgZ290ICN7YXJpdHl9XCJcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBrZXlfYmZyID0gQF9lbmNvZGVfa2V5IGRiLCBbICdtZXRhJywgbmFtZSwgXVxuICBkYlsgJyVzZWxmJyBdLmdldCBrZXlfYmZyLCAoIGVycm9yLCB2YWx1ZSApID0+XG4gICAgaWYgZXJyb3I/XG4gICAgICByZXR1cm4gaGFuZGxlciBudWxsLCBmYWxsYmFjayBpZiAoIGVycm9yWyAndHlwZScgXSBpcyAnTm90Rm91bmRFcnJvcicgKSBhbmQgKCBmYWxsYmFjayBpc250IEBfbWlzZml0IClcbiAgICAgIHJldHVybiBoYW5kbGVyIGVycm9yXG4gICAgaGFuZGxlciBudWxsLCB2YWx1ZVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfaXNfbWV0YSA9ICggZGIsIGtleV9iZnIgKSAtPiAoICgga2V5X2Jmci5zbGljZSAwLCBAX21ldGFfcHJlZml4Lmxlbmd0aCApLmNvbXBhcmUgQF9tZXRhX3ByZWZpeCApIGlzIDBcblxuIyMjIFRBSU5UIG11c3QgZGVyaXZlIG1ldGEga2V5IHByZWZpeCBmcm9tIHJlc3VsdCBvZiBgX3B1dF9tZXRhYCAjIyNcbkBfbWV0YV9wcmVmaXggPSBuZXcgQnVmZmVyIFsgMHg1NCwgMHg2ZCwgMHg2NSwgMHg3NCwgMHg2MSwgMHgwMCwgXVxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyBXUklUSU5HXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkAkd3JpdGUgPSAoIGRiLCBzZXR0aW5ncyApIC0+XG4gICMjIyBUQUlOVCBjdXJyZW50bHkgbG9hZGluZyBhbmQgc2F2aW5nIGJsb29tIGZpbHRlciBlYWNoIHRpbWUgYSBwaXBlbGluZSB3aXRoIGAkd3JpdGVgIGlzIHJ1biAjIyNcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzZXR0aW5ncyAgICAgICAgID89IHt9XG4gICMjIyBTdXBlcmZpY2lhbCBleHBlcmltZW50cyBzaG93IHRoYXQgYSBtdWNoIGJpZ2dlciBiYXRjaCBzaXplIHRoYW4gMScwMDAgZG9lcyBub3QgdGVuZCB0byBpbXByb3ZlXG4gIHRocm91Z2hwdXQ7IHRoZXJlZm9yZSwgaW4gb3JkZXIgdG8gcmVkdWNlIG1lbW9yeSBmb290cHJpbnQsIGl0IHNlZW1zIGFkdmlzYWJsZSB0byBsZWF2ZSBiYXRjaCBzaXplXG4gIGluIHRoZSBvcmRlciBvZiBhcm91bmQgYSB0aG91c2FuZCBlbnRyaWVzLiAjIyNcbiAgYmF0Y2hfc2l6ZSAgICAgICAgPSBzZXR0aW5nc1sgJ2JhdGNoJyAgXSA/IDEwMDBcbiAgc29saWRfcHJlZGljYXRlcyAgPSBzZXR0aW5nc1sgJ3NvbGlkcycgXSA/IFtdXG4gIGVuc3VyZV91bmlxdWUgICAgID0gc2V0dGluZ3NbICd1bmlxdWUnIF0gPyB0cnVlXG4gIHN1YnN0cmF0ZSAgICAgICAgID0gZGJbICclc2VsZicgXVxuICBSICAgICAgICAgICAgICAgICA9IEQuY3JlYXRlX3Rocm91Z2hzdHJlYW0oKVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICRpbmRleCA9ID0+ICQgKCBzcG8sIHNlbmQgKSA9PlxuICAgICMjIyBBbmFseXplIFNQTyBrZXkgYW5kIHNlbmQgYWxsIG5lY2Vzc2FyeSBQT1MgZmFjZXRzOiAjIyNcbiAgICBbIHNiaiwgcHJkLCBvYmosIF0gPSBzcG9cbiAgICBzZW5kIFsgWyAnc3BvJywgc2JqLCBwcmQsIF0sIG9iaiwgXVxuICAgIG9ial90eXBlID0gQ05ELnR5cGVfb2Ygb2JqXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICB1bmxlc3Mgb2JqX3R5cGUgaXMgJ3BvZCdcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgaWYgKCBvYmpfdHlwZSBpcyAnbGlzdCcgKSBhbmQgbm90ICggcHJkIGluIHNvbGlkX3ByZWRpY2F0ZXMgKVxuICAgICAgICBmb3Igb2JqX2VsZW1lbnQsIG9ial9pZHggaW4gb2JqXG4gICAgICAgICAgc2VuZCBbIFsgJ3BvcycsIHByZCwgb2JqX2VsZW1lbnQsIHNiaiwgb2JqX2lkeCwgXSwgXVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBlbHNlXG4gICAgICAgIHNlbmQgWyBbICdwb3MnLCBwcmQsIG9iaiwgc2JqLCBdLCBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgJGVuY29kZSA9ID0+ICQgKCBmYWNldCwgc2VuZCApID0+XG4gICAgWyBrZXksIHZhbHVlLCBdID0gZmFjZXRcbiAgICBwaHJhc2V0eXBlICAgICAgPSBrZXlbIDAgXVxuICAgIGtleV9iZnIgICAgICAgICA9IEBfZW5jb2RlX2tleSBkYiwga2V5XG4gICAgdmFsdWVfYmZyICAgICAgID0gaWYgdmFsdWU/IHRoZW4gQF9lbmNvZGVfdmFsdWUgZGIsIHZhbHVlIGVsc2UgQF96ZXJvX3ZhbHVlX2JmclxuICAgIHNlbmQgWyBwaHJhc2V0eXBlLCBrZXlfYmZyLCB2YWx1ZV9iZnIsIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAkYXNfYmF0Y2hfZW50cnkgPSA9PiAkICggZmFjZXRfYmZyX3BsdXMsIHNlbmQgKSA9PlxuICAgIFsgcGhyYXNldHlwZSwga2V5X2JmciwgdmFsdWVfYmZyLCBdID0gZmFjZXRfYmZyX3BsdXNcbiAgICBzZW5kIHR5cGU6ICdwdXQnLCBrZXk6IGtleV9iZnIsIHZhbHVlOiB2YWx1ZV9iZnJcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAkd3JpdGUgPSA9PiAkICggYmF0Y2gsIHNlbmQgKSA9PlxuICAgIHN1YnN0cmF0ZS5iYXRjaCBiYXRjaFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGlmIGVuc3VyZV91bmlxdWVcbiAgICB7ICRlbnN1cmVfdW5pcXVlLCAkbG9hZF9ibG9vbSwgJHNhdmVfYmxvb20sIH0gPSBAX2dldF9ibG9vbV9tZXRob2RzIGRiXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcGlwZWxpbmUgPSBbXVxuICBwaXBlbGluZS5wdXNoICRsb2FkX2Jsb29tKCkgICAgIGlmIGVuc3VyZV91bmlxdWVcbiAgcGlwZWxpbmUucHVzaCAkaW5kZXgoKVxuICBwaXBlbGluZS5wdXNoICRlbmNvZGUoKVxuICBwaXBlbGluZS5wdXNoICRlbnN1cmVfdW5pcXVlKCkgIGlmIGVuc3VyZV91bmlxdWVcbiAgcGlwZWxpbmUucHVzaCAkYXNfYmF0Y2hfZW50cnkoKVxuICBwaXBlbGluZS5wdXNoIEQuJGJhdGNoIGJhdGNoX3NpemVcbiAgcGlwZWxpbmUucHVzaCAkd3JpdGUoKVxuICBwaXBlbGluZS5wdXNoICRzYXZlX2Jsb29tKCkgICAgIGlmIGVuc3VyZV91bmlxdWVcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBSLnBpcGUgRC5jb21iaW5lIHBpcGVsaW5lLi4uXG4gIHJldHVybiBSXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9nZXRfYmxvb21fbWV0aG9kcyA9ICggZGIgKSAtPlxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGRiX3NpemUgICAgICAgICAgID0gZGJbICdzaXplJyBdID8gMWU2XG4gIGRiX3NpemUgICAgICAgICAgID0gZGJbICdzaXplJyBdID8gMTBcbiAgZGJfc2l6ZSAgICAgICAgICAgPSBkYlsgJ3NpemUnIF0gPyAxZTRcbiAgYmxvb21fZXJyb3JfcmF0ZSAgPSAwLjFcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBCU09OID0gKCByZXF1aXJlICdic29uJyApLkJTT05QdXJlLkJTT05cbiAgbmpzX2ZzID0gcmVxdWlyZSAnZnMnXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgQkxPRU0gICAgICAgICAgICAgPSByZXF1aXJlICdibG9lbSdcbiAgYmxvZW1fc2V0dGluZ3MgICAgPVxuICAgIGluaXRpYWxfY2FwYWNpdHk6ICAgZGJfc2l6ZSAqIDNcbiAgICBzY2FsaW5nOiAgICAgICAgICAgIDJcbiAgICByYXRpbzogICAgICAgICAgICAgIDAuMVxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHNob3dfYmxvb21faW5mbyA9ID0+XG4gICAgYmxvb20gICAgICAgPSBkYlsgJyVibG9vbScgXVxuICAgIGZpbHRlcnMgICAgID0gYmxvb21bICdmaWx0ZXJzJyBdXG4gICAgZmlsdGVyX3NpemUgPSAwXG4gICAgxpIgICAgICAgICAgID0gQ05ELmZvcm1hdF9udW1iZXJcbiAgICBmb3IgZmlsdGVyIGluIGZpbHRlcnNcbiAgICAgIGZpbHRlcl9zaXplICs9IGZpbHRlclsgJ2ZpbHRlcicgXVsgJ2JpdGZpZWxkJyBdWyAnYnVmZmVyJyBdLmxlbmd0aFxuICAgIHdoaXNwZXIgXCJzY2FsYWJsZSBCbG9vbSBmaWx0ZXIgc2l6ZTogI3vGkiBmaWx0ZXJfc2l6ZX0gYnl0ZXNcIlxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICRlbnN1cmVfdW5pcXVlID0gPT5cbiAgICByZXR1cm4gRC4kbWFwICggcGhyYXNlLCBoYW5kbGVyICkgPT5cbiAgICAgIGJsb29tICAgICAgICAgICAgICAgPSBkYlsgJyVibG9vbScgXVxuICAgICAgIyMjID4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+ICMjI1xuICAgICAgWyBzYmosIHByZCwgb2JqLCBdICA9IHBocmFzZVxuICAgICAga2V5ICAgICAgICAgICAgICAgICA9IFsgJ3NwbycsIHNiaiwgcHJkLCBdXG4gICAgICBrZXlfYmZyICAgICAgICAgICAgID0ga2V5LmpvaW4gJ3wnXG4gICAgICAjIyMgPj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4gIyMjXG4gICAgICBibG9vbV9oYXNfa2V5ICAgICAgID0gYmxvb20uaGFzIGtleV9iZnJcbiAgICAgIGJsb29tLmFkZCBrZXlfYmZyXG4gICAgICByZXR1cm4gaGFuZGxlciBudWxsLCBwaHJhc2UgdW5sZXNzIGJsb29tX2hhc19rZXlcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgQGhhcyBkYiwga2V5LCAoIGVycm9yLCBkYl9oYXNfa2V5ICkgPT5cbiAgICAgICAgcmV0dXJuIGhhbmRsZXIgZXJyb3IgaWYgZXJyb3I/XG4gICAgICAgIHJldHVybiBoYW5kbGVyIG5ldyBFcnJvciBcInBocmFzZSBhbHJlYWR5IGluIERCOiAje3JwciBwaHJhc2V9XCIgaWYgZGJfaGFzX2tleVxuICAgICAgICBoYW5kbGVyIG51bGwsIHBocmFzZVxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICRsb2FkX2Jsb29tID0gPT5cbiAgICBpc19maXJzdCA9IHllc1xuICAgIHJldHVybiBELiRtYXAgKCBkYXRhLCBoYW5kbGVyICkgPT5cbiAgICAgIHVubGVzcyBpc19maXJzdFxuICAgICAgICByZXR1cm4gaWYgZGF0YT8gdGhlbiBoYW5kbGVyIG51bGwsIGRhdGEgZWxzZSBoYW5kbGVyKClcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgaXNfZmlyc3QgPSBub1xuICAgICAgd2hpc3BlciBcImxvYWRpbmcgQmxvb20gZmlsdGVyLi4uXCJcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgQF9nZXRfbWV0YSBkYiwgJ2Jsb29tJywgbnVsbCwgKCBlcnJvciwgYmxvb21fYmZyICkgPT5cbiAgICAgICAgcmV0dXJuIHNlbmQuZXJyb3IgZXJyb3IgaWYgZXJyb3I/XG4gICAgICAgIGlmIGJsb29tX2JmciBpcyBudWxsXG4gICAgICAgICAgd2FybiAnbm8gYmxvb20gZmlsdGVyIGZvdW5kJ1xuICAgICAgICAgIGJsb29tID0gbmV3IEJMT0VNLlNjYWxpbmdCbG9lbSBibG9vbV9lcnJvcl9yYXRlLCBibG9lbV9zZXR0aW5nc1xuICAgICAgICBlbHNlXG4gICAgICAgICAgYmxvb21fZGF0YSA9IEJTT04uZGVzZXJpYWxpemUgYmxvb21fYmZyXG4gICAgICAgICAgIyMjIFRBSU5UIHNlZSBodHRwczovL2dpdGh1Yi5jb20vd2llZGkvbm9kZS1ibG9lbS9pc3N1ZXMvNSAjIyNcbiAgICAgICAgICBmb3IgZmlsdGVyIGluIGJsb29tX2RhdGFbICdmaWx0ZXJzJyBdXG4gICAgICAgICAgICBiaXRmaWVsZCAgICAgICAgICAgICAgPSBmaWx0ZXJbICdmaWx0ZXInIF1bICdiaXRmaWVsZCcgXVxuICAgICAgICAgICAgYml0ZmllbGRbICdidWZmZXInIF0gID0gYml0ZmllbGRbICdidWZmZXInIF1bICdidWZmZXInIF1cbiAgICAgICAgICBibG9vbSA9IEJMT0VNLlNjYWxpbmdCbG9lbS5kZXN0cmluZ2lmeSBibG9vbV9kYXRhXG4gICAgICAgIGRiWyAnJWJsb29tJyBdID0gYmxvb21cbiAgICAgICAgd2hpc3BlciBcIi4uLm9rXCJcbiAgICAgICAgc2hvd19ibG9vbV9pbmZvKClcbiAgICAgICAgcmV0dXJuIGlmIGRhdGE/IHRoZW4gaGFuZGxlciBudWxsLCBkYXRhIGVsc2UgaGFuZGxlcigpXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgJHNhdmVfYmxvb20gPSA9PlxuICAgIHJldHVybiBELiRvbl9lbmQgKCBzZW5kLCBlbmQgKSA9PlxuICAgICAgd2hpc3BlciBcInNhdmluZyBCbG9vbSBmaWx0ZXIuLi5cIlxuICAgICAgYmxvb20gICAgID0gZGJbICclYmxvb20nIF1cbiAgICAgIGJsb29tX2JmciA9IEJTT04uc2VyaWFsaXplIGJsb29tXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIEBfcHV0X21ldGEgZGIsICdibG9vbScsIGJsb29tX2JmciwgKCBlcnJvciApID0+XG4gICAgICAgIHJldHVybiBzZW5kLmVycm9yIGVycm9yIGlmIGVycm9yP1xuICAgICAgICB3aGlzcGVyIFwiLi4ub2tcIlxuICAgICAgICBlbmQoKVxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHJldHVybiB7ICRlbnN1cmVfdW5pcXVlLCAkbG9hZF9ibG9vbSwgJHNhdmVfYmxvb20sIH1cblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgUkVBRElOR1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AY3JlYXRlX3BocmFzZXN0cmVhbSA9ICggZGIsIGxvX2hpbnQgPSBudWxsLCBoaV9oaW50ID0gbnVsbCwgc2V0dGluZ3MgKSAtPlxuICBpbnB1dCA9IEBjcmVhdGVfZmFjZXRzdHJlYW0gZGIsIGxvX2hpbnQsIGhpX2hpbnQsIHNldHRpbmdzXG4gIFIgPSBpbnB1dFxuICAgIC5waXBlIEAkYXNfcGhyYXNlIGRiXG4gIFJbICclbWV0YScgXSA9IGlucHV0WyAnJW1ldGEnIF1cbiAgcmV0dXJuIFJcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AY3JlYXRlX2ZhY2V0c3RyZWFtID0gKCBkYiwgbG9faGludCA9IG51bGwsIGhpX2hpbnQgPSBudWxsLCBzZXR0aW5ncyApIC0+XG4gICMjI1xuICAqIElmIG5laXRlciBgbG9gIG5vciBgaGlgIGlzIGdpdmVuLCB0aGUgc3RyZWFtIHdpbGwgaXRlcmF0ZSBvdmVyIGFsbCBlbnRyaWVzLlxuICAqIElmIGJvdGggYGxvYCBhbmQgYGhpYCBhcmUgZ2l2ZW4sIGEgcXVlcnkgd2l0aCBsb3dlciBhbmQgdXBwZXIsIGluY2x1c2l2ZSBib3VuZGFyaWVzIGlzXG4gICAgaXNzdWVkLlxuICAqIElmIG9ubHkgYGxvYCBpcyBnaXZlbiwgYSBwcmVmaXggcXVlcnkgaXMgaXNzdWVkLlxuICAqIElmIGBoaWAgaXMgZ2l2ZW4gYnV0IGBsb2AgaXMgbWlzc2luZywgYW4gZXJyb3IgaXMgaXNzdWVkLlxuICAjIyNcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBpZiBoaV9oaW50PyBhbmQgbm90IGxvX2hpbnQ/XG4gICAgdGhyb3cgbmV3IEVycm9yIFwibXVzdCBnaXZlIGBsb19oaW50YCB3aGVuIGBoaV9oaW50YCBpcyBnaXZlblwiXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgaWYgbG9faGludD8gYW5kIG5vdCBoaV9oaW50P1xuICAgIHF1ZXJ5ICAgICAgID0gQF9xdWVyeV9mcm9tX3ByZWZpeCBkYiwgbG9faGludFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGVsc2UgaWYgbG9faGludD8gYW5kIGhpX2hpbnQgaXMgJyonXG4gICAgcXVlcnkgICAgICAgPSBAX3F1ZXJ5X2Zyb21fcHJlZml4IGRiLCBsb19oaW50LCAnKidcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBlbHNlXG4gICAgbG9faGludF9iZnIgPSBpZiBsb19oaW50PyB0aGVuICggICAgICAgIEBfZW5jb2RlX2tleSBkYiwgbG9faGludCApICAgICAgICAgIGVsc2UgbnVsbFxuICAgIGhpX2hpbnRfYmZyID0gaWYgaGlfaGludD8gdGhlbiAoIEBfcXVlcnlfZnJvbV9wcmVmaXggZGIsIGhpX2hpbnQgKVsgJ2x0ZScgXSBlbHNlIG51bGxcbiAgICAjIGxvX2hpbnRfYmZyID0gaWYgbG9faGludD8gdGhlbiAoICAgICAgICBAX2VuY29kZV9rZXkgZGIsIGxvX2hpbnQgKSAgICAgICAgICBlbHNlIENPREVDWyAna2V5cycgXVsgJ2xvJyBdXG4gICAgIyBoaV9oaW50X2JmciA9IGlmIGhpX2hpbnQ/IHRoZW4gKCBAX3F1ZXJ5X2Zyb21fcHJlZml4IGRiLCBoaV9oaW50IClbICdsdGUnIF0gZWxzZSBDT0RFQ1sgJ2tleXMnIF1bICdoaScgXVxuICAgIHF1ZXJ5ICAgICAgID0geyBndGU6IGxvX2hpbnRfYmZyLCBsdGU6IGhpX2hpbnRfYmZyLCB9XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgIyMjIFRBSU5UIFNob3VsZCB3ZSB0ZXN0IGZvciB3ZWxsLWZvcm1lZCBlbnRyaWVzIGhlcmU/ICMjI1xuICBSID0gZGJbICclc2VsZicgXS5jcmVhdGVSZWFkU3RyZWFtIHF1ZXJ5XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgUiA9IFIucGlwZSAkICggeyBrZXksIHZhbHVlIH0sIHNlbmQgKSA9PlxuICAgIHVubGVzcyBAX2lzX21ldGEgZGIsIGtleVxuICAgICAgc2VuZCBbICggQF9kZWNvZGVfa2V5IGRiLCBrZXkgKSwgKCBAX2RlY29kZV92YWx1ZSBkYiwgdmFsdWUgKSwgXVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIFJbICclbWV0YScgXSA9IHt9XG4gIFJbICclbWV0YScgXVsgJ3F1ZXJ5JyBdID0gcXVlcnlcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICByZXR1cm4gUlxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBoYXMgPSAoIGRiLCBrZXksIGhhbmRsZXIgKSAtPlxuICBrZXlfYmZyID0gQF9lbmNvZGVfa2V5IGRiLCBrZXlcbiAgZGJbICclc2VsZicgXS5nZXQga2V5X2JmciwgKCBlcnJvciwgb2JqX2JmciApID0+XG4gICAgaWYgZXJyb3I/XG4gICAgICByZXR1cm4gaGFuZGxlciBudWxsLCBmYWxzZSBpZiBlcnJvclsgJ3R5cGUnIF0gaXMgJ05vdEZvdW5kRXJyb3InXG4gICAgICByZXR1cm4gaGFuZGxlciBlcnJvclxuICAgIGhhbmRsZXIgbnVsbCwgdHJ1ZVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBlbnN1cmVfbmV3X2tleSA9ICggZGIsIGtleSwgaGFuZGxlciApIC0+XG4gIGtleV9iZnIgPSBAX2VuY29kZV9rZXkgZGIsIGtleVxuICBkYlsgJyVzZWxmJyBdLmdldCBrZXlfYmZyLCAoIGVycm9yLCBvYmpfYmZyICkgPT5cbiAgICBpZiBlcnJvcj9cbiAgICAgIHJldHVybiBoYW5kbGVyIG51bGwgaWYgZXJyb3JbICd0eXBlJyBdIGlzICdOb3RGb3VuZEVycm9yJ1xuICAgICAgcmV0dXJuIGhhbmRsZXIgZXJyb3JcbiAgICBvYmogPSBAX2RlY29kZV92YWx1ZSBvYmpfYmZyXG4gICAgaGFuZGxlciBuZXcgRXJyb3IgXCJrZXkgI3tycHIga2V5fSBhbHJlYWR5IGluIERCIHdpdGggdmFsdWUgI3tycHIgb2JqfVwiXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQHJlYWRfc3ViID0gKCBkYiwgc2V0dGluZ3MsIHJlYWQgKSAtPlxuICBzd2l0Y2ggYXJpdHkgPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgd2hlbiAyXG4gICAgICByZWFkICAgICAgPSBzZXR0aW5nc1xuICAgICAgc2V0dGluZ3MgID0gbnVsbFxuICAgIHdoZW4gM1xuICAgICAgbnVsbFxuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBFcnJvciBcImV4cGVjdGVkIDIgb3IgMyBhcmd1bWVudHMsIGdvdCAje2FyaXR5fVwiXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgaW5kZXhlZCAgICAgICAgICAgPSBzZXR0aW5ncz9bICdpbmRleGVkJyAgICBdID8gbm9cbiAgIyB0cmFuc2Zvcm0gICAgICAgICA9IHNldHRpbmdzP1sgJ3RyYW5zZm9ybScgIF0gPyBELiRwYXNzX3Rocm91Z2goKVxuICBtYW5nbGUgICAgICAgICAgICA9IHNldHRpbmdzP1sgJ21hbmdsZScgICAgIF0gPyAoIGRhdGEgKSAtPiBkYXRhXG4gIHNlbmRfZW1wdHkgICAgICAgID0gc2V0dGluZ3M/WyAnZW1wdHknICAgICAgXSA/IG5vXG4gIGluc2VydF9pbmRleCAgICAgID0gaWYgaW5kZXhlZCB0aGVuIEQubmV3X2luZGV4ZXIoKSBlbHNlICggeCApIC0+IHhcbiAgb3Blbl9zdHJlYW1fY291bnQgPSAwXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcmV0dXJuICQgKCBvdXRlcl9kYXRhLCBvdXRlcl9zZW5kLCBvdXRlcl9lbmQgKSA9PlxuICAgIGNvdW50ID0gMFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaWYgb3V0ZXJfZGF0YT9cbiAgICAgIG9wZW5fc3RyZWFtX2NvdW50ICAgICs9ICsxXG4gICAgICBzdWJfaW5wdXQgICAgICAgICAgICAgPSByZWFkIG91dGVyX2RhdGFcbiAgICAgIFsgbWVtbywgc3ViX2lucHV0LCBdICA9IGlmIENORC5pc2FfbGlzdCBzdWJfaW5wdXQgdGhlbiBzdWJfaW5wdXQgZWxzZSBbIEBfbWlzZml0LCBzdWJfaW5wdXQsIF1cbiAgICAgIHN1Yl9pbnB1dFxuICAgICAgICAjIC5waXBlIHRyYW5zZm9ybVxuICAgICAgICAucGlwZSBkbyA9PlxuICAgICAgICAgICMjIyBUQUlOVCBubyBuZWVkIHRvIGJ1aWxkIGJ1ZmZlciBpZiBub3QgYHNlbmRfZW1wdHlgIGFuZCB0aGVyZSBhcmUgbm8gcmVzdWx0cyAjIyNcbiAgICAgICAgICBidWZmZXIgPSBpZiBtZW1vIGlzIEBfbWlzZml0IHRoZW4gW10gZWxzZSBbIG1lbW8sIF1cbiAgICAgICAgICByZXR1cm4gJCAoIGlubmVyX2RhdGEsIF8sIGlubmVyX2VuZCApID0+XG4gICAgICAgICAgICBpZiBpbm5lcl9kYXRhP1xuICAgICAgICAgICAgICBpbm5lcl9kYXRhID0gbWFuZ2xlIGlubmVyX2RhdGFcbiAgICAgICAgICAgICAgaWYgaW5uZXJfZGF0YT9cbiAgICAgICAgICAgICAgICBjb3VudCArPSArMVxuICAgICAgICAgICAgICAgIGJ1ZmZlci5wdXNoIGlubmVyX2RhdGFcbiAgICAgICAgICAgIGlmIGlubmVyX2VuZD9cbiAgICAgICAgICAgICAgaWYgc2VuZF9lbXB0eSBvciBjb3VudCA+IDBcbiAgICAgICAgICAgICAgICBvdXRlcl9zZW5kIGluc2VydF9pbmRleCBidWZmZXJcbiAgICAgICAgICAgICAgb3Blbl9zdHJlYW1fY291bnQgKz0gLTFcbiAgICAgICAgICAgICAgaW5uZXJfZW5kKClcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGlmIG91dGVyX2VuZD9cbiAgICAgIHJlcGVhdF9pbW1lZGlhdGVseSAtPlxuICAgICAgICByZXR1cm4gdHJ1ZSB1bmxlc3Mgb3Blbl9zdHJlYW1fY291bnQgaXMgMFxuICAgICAgICBvdXRlcl9lbmQoKVxuICAgICAgICByZXR1cm4gZmFsc2VcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgS0VZUyAmIFZBTFVFU1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX2VuY29kZV9rZXkgPSAoIGRiLCBrZXksIGV4dHJhX2J5dGUgKSAtPlxuICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIGtleSAje3JwciBrZXl9XCIgaWYga2V5IGlzIHVuZGVmaW5lZFxuICByZXR1cm4gX2NvZGVjX2VuY29kZSBrZXksIGV4dHJhX2J5dGVcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX2RlY29kZV9rZXkgPSAoIGRiLCBrZXkgKSAtPlxuICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIGtleSAje3JwciBrZXl9XCIgaWYgKCBSID0gX2NvZGVjX2RlY29kZSBrZXkgKSBpcyB1bmRlZmluZWRcbiAgcmV0dXJuIFJcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX2VuY29kZV92YWx1ZSA9ICggZGIsIHZhbHVlICAgICAgKSAtPiBuZXcgQnVmZmVyICggSlNPTi5zdHJpbmdpZnkgdmFsdWUgKSwgJ3V0Zi04J1xuQF9kZWNvZGVfdmFsdWUgPSAoIGRiLCB2YWx1ZV9iZnIgICkgLT4gSlNPTi5wYXJzZSB2YWx1ZV9iZnIudG9TdHJpbmcgJ3V0Zi04J1xuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMjIyBOQiBBcmd1bWVudCBvcmRlcmluZyBmb3IgdGhlc2UgZnVuY3Rpb24gaXMgYWx3YXlzIHN1YmplY3QgYmVmb3JlIG9iamVjdCwgcmVnYXJkbGVzcyBvZiB0aGUgcGhyYXNldHlwZVxuYW5kIHRoZSBvcmRlcmluZyBpbiB0aGUgcmVzdWx0aW5nIGtleS4gIyMjXG5AbmV3X2tleSA9ICggZGIsIHBocmFzZXR5cGUsIHNrLCBzdiwgb2ssIG92LCBpZHggKSAtPlxuICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIHBocmFzZXR5cGU6ICN7cnByIHBocmFzZXR5cGV9XCIgdW5sZXNzIHBocmFzZXR5cGUgaW4gWyAnc28nLCAnb3MnLCBdXG4gIFsgc2ssIHN2LCBvaywgb3YsIF0gPSBbIG9rLCBvdiwgc2ssIHN2LCBdIGlmIHBocmFzZXR5cGUgaXMgJ29zJ1xuICByZXR1cm4gWyBwaHJhc2V0eXBlLCBzaywgc3YsIG9rLCBvdiwgKCBpZHggPyAwICksIF1cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AbmV3X3NvX2tleSA9ICggZGIsIFAuLi4gKSAtPiBAbmV3X2tleSBkYiwgJ3NvJywgUC4uLlxuQG5ld19vc19rZXkgPSAoIGRiLCBQLi4uICkgLT4gQG5ld19rZXkgZGIsICdvcycsIFAuLi5cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX25ld19vc19rZXlfZnJvbV9zb19rZXkgPSAoIGRiLCBzb19rZXkgKSAtPlxuICBbIHBocmFzZXR5cGUsIHNrLCBzdiwgb2ssIG92LCBpZHgsIF0gPSBAYXNfcGhyYXNlIGRiLCBzb19rZXlcbiAgdGhyb3cgbmV3IEVycm9yIFwiZXhwZWN0ZWQgcGhyYXNldHlwZSAnc28nLCBnb3QgI3tycHIgcGhyYXNldHlwZX1cIiB1bmxlc3MgcGhyYXNldHlwZSBpcyAnc28nXG4gIHJldHVybiBbICdvcycsIG9rLCBvdiwgc2ssIHN2LCBpZHgsIF1cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AbmV3X2tleXMgPSAoIGRiLCBwaHJhc2V0eXBlLCBzaywgc3YsIG9rLCBvdiwgaWR4ICkgLT5cbiAgb3RoZXJfcGhyYXNldHlwZSAgPSBpZiBwaHJhc2V0eXBlIGlzICdzbycgdGhlbiAnb3MnIGVsc2UgJ3NvJ1xuICByZXR1cm4gW1xuICAgICggQG5ld19rZXkgZGIsICAgICAgIHBocmFzZXR5cGUsIHNrLCBzdiwgb2ssIG92LCBpZHggKSxcbiAgICAoIEBuZXdfa2V5IGRiLCBvdGhlcl9waHJhc2V0eXBlLCBzaywgc3YsIG9rLCBvdiwgaWR4ICksIF1cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AYXNfcGhyYXNlID0gKCBkYiwga2V5LCB2YWx1ZSwgbm9ybWFsaXplID0geWVzICkgLT5cbiAgc3dpdGNoIHBocmFzZXR5cGUgPSBrZXlbIDAgXVxuICAgIHdoZW4gJ3NwbydcbiAgICAgIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgU1BPIGtleSAobGVuZ3RoICN7bGVuZ3RofSlcIiB1bmxlc3MgKCBsZW5ndGggPSBrZXkubGVuZ3RoICkgaXMgM1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCB2YWx1ZSAoMSkgI3tycHIgdmFsdWV9XCIgaWYgdmFsdWUgaW4gWyB1bmRlZmluZWQsIF1cbiAgICAgIHJldHVybiBbIHBocmFzZXR5cGUsIGtleVsgMSBdLCBrZXlbIDIgXSwgdmFsdWUsIF1cbiAgICB3aGVuICdwb3MnXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIFBPUyBrZXkgKGxlbmd0aCAje2xlbmd0aH0pXCIgdW5sZXNzIDQgPD0gKCBsZW5ndGggPSBrZXkubGVuZ3RoICkgPD0gNVxuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCB2YWx1ZSAoMikgI3tycHIgdmFsdWV9XCIgaWYgbm90ICggdmFsdWUgaW4gWyBudWxsLCBdIClcbiAgICAgIHJldHVybiBbIHBocmFzZXR5cGUsIGtleVsgMyBdLCBrZXlbIDEgXSwga2V5WyAyIF0sIGtleVsgNCBdLCBdIGlmIGtleVsgNCBdP1xuICAgICAgcmV0dXJuIFsgcGhyYXNldHlwZSwga2V5WyAzIF0sIGtleVsgMSBdLCBrZXlbIDIgXSwgXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkAkYXNfcGhyYXNlID0gKCBkYiApIC0+XG4gIHJldHVybiAkICggZGF0YSwgc2VuZCApID0+XG4gICAgc2VuZCBAYXNfcGhyYXNlIGRiLCBkYXRhLi4uXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQGtleV9mcm9tX3VybCA9ICggZGIsIHVybCApIC0+XG4gICMjIyBUQUlOIGRvZXMgbm90IHVuZXNjYXBlIGFzIHlldCAjIyNcbiAgIyMjIFRBSU4gZG9lcyBub3QgY2FzdCB2YWx1ZXMgYXMgeWV0ICMjI1xuICAjIyMgVEFJTlQgZG9lcyBub3Qgc3VwcG9ydCBtdWx0aXBsZSBpbmRleGVzIGFzIHlldCAjIyNcbiAgWyBwaHJhc2V0eXBlLCBmaXJzdCwgc2Vjb25kLCBpZHgsIF0gPSB1cmwuc3BsaXQgJ3wnXG4gIHVubGVzcyBwaHJhc2V0eXBlPyBhbmQgcGhyYXNldHlwZS5sZW5ndGggPiAwIGFuZCBwaHJhc2V0eXBlIGluIFsgJ3NvJywgJ29zJywgXVxuICAgIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgVVJMIGtleSAje3JwciB1cmx9XCJcbiAgdW5sZXNzIGZpcnN0PyBhbmQgZmlyc3QubGVuZ3RoID4gMCBhbmQgc2Vjb25kPyBhbmQgc2Vjb25kLmxlbmd0aCA+IDBcbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIFVSTCBrZXkgI3tycHIgdXJsfVwiXG4gIGlkeCA9IGlmICggaWR4PyBhbmQgaWR4Lmxlbmd0aCA+IDAgKSB0aGVuICggcGFyc2VJbnQgaWR4LCAxMCApIGVsc2UgMFxuICBbIHNrLCBzdiwgXSA9ICBmaXJzdC5zcGxpdCAnOidcbiAgWyBvaywgb3YsIF0gPSBzZWNvbmQuc3BsaXQgJzonXG4gIHVubGVzcyBzaz8gYW5kIHNrLmxlbmd0aCA+IDAgYW5kIG9rPyBhbmQgb2subGVuZ3RoID4gMFxuICAgIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgVVJMIGtleSAje3JwciB1cmx9XCJcbiAgWyBzaywgc3YsIG9rLCBvdiwgXSA9IFsgb2ssIG92LCBzaywgc3YsIF0gaWYgcGhyYXNldHlwZSBpcyAnb3MnXG4gIHJldHVybiBbIHBocmFzZXR5cGUsIHNrLCBzdiwgb2ssIG92LCBpZHgsIF1cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AdXJsX2Zyb21fa2V5ID0gKCBkYiwga2V5ICkgLT5cbiAgaWYgKCBAX3R5cGVfZnJvbV9rZXkgZGIsIGtleSApIGlzICdsaXN0J1xuICAgIFsgcGhyYXNldHlwZSwgdGFpbC4uLiwgXSA9IGtleVxuICAgIGlmIHBocmFzZXR5cGUgaXMgJ3NwbydcbiAgICAgIFsgc2JqLCBwcmQsIF0gPSB0YWlsXG4gICAgICByZXR1cm4gXCJzcG98I3tzYmp9fCN7cHJkfXxcIlxuICAgIGVsc2VcbiAgICAgIFsgcHJkLCBvYmosIHNiaiwgaWR4LCBdID0gdGFpbFxuICAgICAgaWR4X3JwciA9IGlmIGlkeD8gdGhlbiBycHIgaWR4IGVsc2UgJydcbiAgICAgIHJldHVybiBcInBvc3wje3ByZH06I3tvYmp9fCN7c2JqfXwje2lkeF9ycHJ9XCJcbiAgcmV0dXJuIFwiI3tycHIga2V5fVwiXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQCR1cmxfZnJvbV9rZXkgPSAoIGRiICkgLT4gJCAoIGtleSwgc2VuZCApID0+IHNlbmQgQHVybF9mcm9tX2tleSBkYiwga2V5XG5AJGtleV9mcm9tX3VybCA9ICggZGIgKSAtPiAkICggdXJsLCBzZW5kICkgPT4gc2VuZCBAa2V5X2Zyb21fdXJsIGRiLCBrZXlcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX3R5cGVfZnJvbV9rZXkgPSAoIGRiLCBrZXkgKSAtPlxuICBpZiBBcnJheS5pc0FycmF5IGtleVxuICAgICMgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBrZXk6ICN7cnByIGtleX1cIiB1bmxlc3Mga2V5Lmxlbmd0aCBpcyA2XG4gICAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBwaHJhc2V0eXBlOiAje3JwciBrZXl9XCIgdW5sZXNzIGtleVsgJzAnIF0gaW4gQHBocmFzZXR5cGVzXG4gICAgcmV0dXJuICdsaXN0J1xuICByZXR1cm4gJ290aGVyJ1xuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyBQUkVGSVhFUyAmIFFVRVJJRVNcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9xdWVyeV9mcm9tX3ByZWZpeCA9ICggZGIsIGxvX2hpbnQsIHN0YXIgKSAtPlxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGlmIHN0YXI/XG4gICAgIyMjICdBc3RlcmlzaycgZW5jb2Rpbmc6IHBhcnRpYWwga2V5IHNlZ21lbnRzIG1hdGNoICMjI1xuICAgIGd0ZSAgID0gQF9lbmNvZGVfa2V5IGRiLCBsb19oaW50XG4gICAgbHRlICAgPSBAX2VuY29kZV9rZXkgZGIsIGxvX2hpbnRcbiAgICBsdGVbIGx0ZS5sZW5ndGggLSAxIF0gPSBDT0RFQ1sgJ3R5cGVtYXJrZXJzJyAgXVsgJ2hpJyBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZWxzZVxuICAgICMjIyAnQ2xhc3NpY2FsJyBlbmNvZGluZzogb25seSBmdWxsIGtleSBzZWdtZW50cyBtYXRjaCAjIyNcbiAgICBiYXNlICA9IEBfZW5jb2RlX2tleSBkYiwgbG9faGludCwgQ09ERUNbICd0eXBlbWFya2VycycgIF1bICdoaScgXVxuICAgIGd0ZSAgID0gYmFzZS5zbGljZSAwLCBiYXNlLmxlbmd0aCAtIDFcbiAgICBsdGUgICA9IGJhc2Uuc2xpY2UgMCwgYmFzZS5sZW5ndGhcbiAgcmV0dXJuIHsgZ3RlLCBsdGUsIH1cblxuXG5cblxuXG4iXX0=