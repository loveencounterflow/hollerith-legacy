(function() {
  var $, $async, CND, CODEC, D, DUMP, _codec_decode, _codec_encode, _new_level_db, badge, debug, echo, help, later, leveldown, log, rpr, step, suspend, urge, warn, whisper, ƒ,
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

  ƒ = CND.format_number.bind(CND);

  suspend = require('coffeenode-suspend');

  step = suspend.step;

  CODEC = this.CODEC = require('./codec');

  DUMP = this.DUMP = require('./dump');

  _codec_encode = CODEC.encode.bind(CODEC);

  _codec_decode = CODEC.decode.bind(CODEC);

  D = require('pipedreams2');

  $ = D.remit.bind(D);

  $async = D.remit_async.bind(D);

  _new_level_db = require('level');

  leveldown = require('level/node_modules/leveldown');

  suspend = require('coffeenode-suspend');

  step = suspend.step;

  later = suspend.immediately;

  this._LODASH = require('lodash');

  this.phrasetypes = ['pos', 'spo'];

  this._misfit = Symbol('misfit');

  this._zero_value_bfr = new Buffer('null');

  this.new_db = function(route, settings) {

    /* TAINT we should force this operation to be asynchronous; otherwise, DB may not be writeable */
    var R, create_if_missing, level_settings, ref, ref1, size, substrate;
    create_if_missing = (ref = settings != null ? settings['create'] : void 0) != null ? ref : true;
    size = (ref1 = settings != null ? settings['size'] : void 0) != null ? ref1 : 1e5;
    level_settings = {
      'keyEncoding': 'binary',
      'valueEncoding': 'binary',
      'createIfMissing': create_if_missing,
      'errorIfExists': false,
      'compression': true,
      'sync': false
    };
    substrate = _new_level_db(route, level_settings, function(error) {
      if (error != null) {
        if (error['name'] === 'OpenError') {
          throw new Error("No database found at " + route + " and no `create` setting given");
        }
        throw error;
      }
    });
    R = {
      '~isa': 'HOLLERITH/db',
      '%self': substrate,
      'size': size
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
    var $as_batch_entry, $encode, $ensure_unique_spo, $index, $load_bloom, $save_bloom, $write, R, S, batch_size, ensure_unique, pipeline, ref, ref1, ref2, ref3, solid_predicates, substrate;
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
          var i, len, obj, obj_element, obj_idx, obj_type, prd, results, sbj;
          sbj = spo[0], prd = spo[1], obj = spo[2];
          send([['spo', sbj, prd], obj]);
          if ((obj_type = CND.type_of(obj)) !== 'pod') {
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
        return $(function(batch, send, end) {
          if (batch != null) {
            substrate.batch(batch);
          }
          if (end != null) {
            debug('©BQqOp', '###');
            return end();
          }
        });
      };
    })(this);
    if (ensure_unique) {
      ref3 = this._get_bloom_methods(db), $ensure_unique_spo = ref3.$ensure_unique_spo, $load_bloom = ref3.$load_bloom, $save_bloom = ref3.$save_bloom;
    }
    pipeline = [];
    if (ensure_unique) {
      pipeline.push($load_bloom());
    }
    pipeline.push(this.$validate_spo());
    pipeline.push($index());
    pipeline.push($encode());
    if (ensure_unique) {
      pipeline.push($ensure_unique_spo());
    }
    pipeline.push($as_batch_entry());
    pipeline.push(D.$batch(batch_size));
    pipeline.push($write());
    if (ensure_unique) {
      pipeline.push($save_bloom());
    }
    S = R.pipe(D.combine.apply(D, pipeline));
    S.pipe(D.$on_end(function() {
      return debug('©xtQq0', '+++');
    }));
    return R;
  };

  this.validate_spo = function(spo) {

    /* Do a shallow sanity check to see whether `spo` is a triplet. */
    if (!CND.isa_list(spo)) {
      throw new Error("invalid SPO key, must be list: " + (rpr(spo)));
    }
    if (spo.length !== 3) {
      throw new Error("invalid SPO key, must be of length 3: " + (rpr(spo)));
    }
    return null;
  };

  this.$validate_spo = function() {

    /* Do a shallow sanity check to see whether all incoming data are triplets. */
    return $((function(_this) {
      return function(spo, send) {

        /* Analyze SPO key and send all necessary POS facets: */
        var error;
        try {
          _this.validate_spo(spo);
        } catch (_error) {
          error = _error;
          return send.error(error);
        }
        return send(spo);
      };
    })(this));
  };

  this._get_bloom_methods = function(db) {
    var $ensure_unique_spo, $load_bloom, $save_bloom, bloom_settings, entry_count, false_positive_count, ref, show_bloom_info;
    entry_count = 0;
    false_positive_count = 0;
    bloom_settings = {
      size: (ref = db['size']) != null ? ref : 1e5
    };
    show_bloom_info = (function(_this) {
      return function() {
        return CND.BLOOM.report(db['%bloom']);
      };
    })(this);
    $ensure_unique_spo = (function(_this) {
      return function() {

        /* We skip all phrases except for SPO entries, the problem being that even IF some erroneous processing
        should result in bogus `[ 'pos', 'foo', 'bar', 'baz', ]` tuples, fact is that the object value of that
        bogus phrase gets right into the key—which may or may not be on record. In other words, you could still
        create millions of wrong entries like `[ 'pos', 'weighs', kgs, 'my-rabbit' ]` for non-existing (but in
        themselves, were those actually on record, repetitive) assertions like `[ 'spo', 'my-rabbit', 'weighs',
        kgs, ]` for any possible value of `kgs` without ever being caught by the no-duplicates restriction.
        
        It seems better to forgo this test as it only incurs a performance and space burden without being really
        helpful (a worthwhile alternative would be to check that for all SPO entries there are all the POS
        entries and that there are no extraneous POS entries, which is even more of a computational burden, but
        at least reaches a meaningful level of safety against malformed data.
         */
        return $async(function(xphrase, done) {

          /* Skip if this is not a main entry to the DB: */
          var bloom, bloom_has_key, key_bfr;
          if (xphrase[0] !== 'spo') {
            return done(xphrase);
          }
          key_bfr = xphrase[1];
          bloom = db['%bloom'];
          bloom_has_key = CND.BLOOM.has(bloom, key_bfr);
          CND.BLOOM.add(bloom, key_bfr);
          entry_count += +1;
          if (!bloom_has_key) {
            return done(xphrase);
          }
          false_positive_count += +1;
          return _this.has(db, key_bfr, function(error, db_has_key) {
            if (error != null) {
              return done.error(error);
            }

            /* At this point `rpr xphrase` show raw buffers; should decode */
            if (db_has_key) {
              return done.error(new Error("phrase already in DB: " + (rpr(xphrase))));
            }
            return done(xphrase);
          });
        });
      };
    })(this);
    $load_bloom = (function(_this) {
      return function() {
        var is_first;
        is_first = true;
        return $async(function(data, done) {
          if (!is_first) {
            if (data != null) {
              return done(data);
            } else {
              return done();
            }
          }
          is_first = false;
          whisper("loading Bloom filter...");
          return _this._get_meta(db, 'bloom', null, function(error, bloom_bfr) {
            var bloom;
            if (error != null) {
              return done.error(error);
            }
            if (bloom_bfr === null) {
              warn('no bloom filter found');
              bloom = CND.BLOOM.new_filter(bloom_settings);
            } else {
              bloom = CND.BLOOM.from_buffer(bloom_bfr);
            }
            db['%bloom'] = bloom;
            whisper("...ok");
            show_bloom_info();
            if (data != null) {
              return done(data);
            } else {
              return done();
            }
          });
        });
      };
    })(this);
    $save_bloom = (function(_this) {
      return function() {
        return D.$on_end(function(send, end) {
          var bloom_bfr;
          whisper("saving Bloom filter...");
          bloom_bfr = CND.BLOOM.as_buffer(db['%bloom']);
          whisper("serialized bloom filter to " + (ƒ(bloom_bfr.length)) + " bytes");
          show_bloom_info();
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
      $ensure_unique_spo: $ensure_unique_spo,
      $load_bloom: $load_bloom,
      $save_bloom: $save_bloom
    };
  };

  this.create_phrasestream = function(db, query) {
    return this._create_phrasestream(db, query);
  };

  this.read_phrases = function(db, query, handler) {
    var arity;
    switch (arity = arguments.length) {
      case 2:
        handler = query;
        query = null;
        break;
      case 3:
        null;
        break;
      default:
        throw new Error("expected 2 or 3 arguments, got " + arity);
    }
    return this._create_phrasestream(db, query, handler);
  };

  this.read_one_phrase = function(db, query, handler) {
    var arity, fallback;
    fallback = this._misfit;
    switch (arity = arguments.length) {
      case 2:
        handler = query;
        query = null;
        break;
      case 3:
        null;
        break;
      default:
        throw new Error("expected 4 or 5 arguments, got " + arity);
    }
    if ((query != null) && 'fallback' in query) {
      fallback = query['fallback'];
      delete query['fallback'];
    }
    return this.read_phrases(db, query, (function(_this) {
      return function(error, phrases) {
        if (error != null) {
          return handler(error);
        }
        if ((phrases.length === 0) && (fallback !== _this._misfit)) {
          return handler(null, fallback);
        }
        if (phrases.length !== 1) {
          return handler(new Error("expected 1 phrase, got " + phrases.length));
        }
        return handler(null, phrases[0]);
      };
    })(this));
  };

  this._create_phrasestream = function(db, query, handler) {
    var R, input;
    input = this.create_facetstream(db, query);
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

  this.create_facetstream = function(db, query) {

    /*
    * If none of `lo`, `hi` or 'prefix' are given, the stream will iterate over all entries.
    * If both `lo` and `hi` are given, a query with lower and upper, inclusive boundaries (in LevelDB these
      are called `gte` and `lte`, repsectively) is issued.
    * If only `prefix` is given, a prefix query is issued. Prefix queries may be 'exclusive' or 'inclusive'.
      Exclusive prefixes match the list elements that make up the HOLLERITH entry keys in a component-wise
      fashion, while inclusive queries also match when the last prefix element is the start of the
      corresponding component of the entry key. For example, `{ prefix: [ 'pos', 'shape', ] }` will match
      only entries whose first two key elements are `'pos'` and `'shape'`, while a query using
      `{ prefix: [ 'pos', 'shape', ], star: '*', }` will additionally match entries with such keys as
      `[ 'pos', 'shapeclass', ]` and `[ 'pos', 'shape/strokeorder', ]`.
    * If only `lo` or only `hi` is given, an error is issued.
     */
    var arity, hi_hint, key, keys, lo_hint;
    lo_hint = null;
    hi_hint = null;
    if (query != null) {
      keys = Object.keys(query);
      switch (arity = keys.length) {
        case 1:
          switch (key = keys[0]) {
            case 'prefix':
              lo_hint = query[key];
              break;
            case 'lo':
            case 'prefix':
              throw new Error("illegal to specify `lo` but not `hi`");
              break;
            case 'hi':
              throw new Error("illegal to specify `hi` but not `lo`");
              break;
            default:
              throw new Error("unknown hint key " + (rpr(key)));
          }
          break;
        case 2:
          keys.sort();
          if (keys[0] === 'hi' && keys[1] === 'lo') {
            lo_hint = query['lo'];
            hi_hint = query['hi'];
          } else if (keys[0] === 'prefix' && keys[1] === 'star') {
            lo_hint = query['prefix'];
            hi_hint = query['star'];
            if (hi_hint !== '*') {
              throw new Error("expected `star` to be '*', got " + (rpr(hi_hint)));
            }
          } else {
            throw new Error("illegal hint keys " + (rpr(keys)));
          }
          break;
        default:
          throw new Error("illegal hint arity " + (rpr(arity)));
      }
    }
    return this._create_facetstream(db, lo_hint, hi_hint);
  };

  this._create_facetstream = function(db, lo_hint, hi_hint) {
    var R, hi_hint_bfr, lo_hint_bfr, query;
    if (lo_hint == null) {
      lo_hint = null;
    }
    if (hi_hint == null) {
      hi_hint = null;
    }

    /* TAINT `lo_hint` and `hi_hint` should be called `first` and `second` */
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
    key_bfr = CND.isa_jsbuffer ? key : this._encode_key(db, key);
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

  this.as_phrase = function(db, key, value) {
    var error, length, phrasetype, ref;
    try {
      switch (phrasetype = key[0]) {
        case 'spo':
          if ((length = key.length) !== 3) {
            throw new Error("illegal SPO key (length " + length + ")");
          }
          if (value === void 0) {
            throw new Error("illegal value (A) " + (rpr(value)));
          }
          return [phrasetype, key[1], key[2], value];
        case 'pos':
          if (!((4 <= (ref = (length = key.length)) && ref <= 5))) {
            throw new Error("illegal POS key (length " + length + ")");
          }
          if (!(value === (void 0) || value === null)) {
            throw new Error("illegal value (B) " + (rpr(value)));
          }
          if (key[4] != null) {
            return [phrasetype, key[1], key[2], key[3], key[4]];
          }
          return [phrasetype, key[1], key[2], key[3]];
      }
      throw new Error("unknown phrasetype " + (rpr(phrasetype)));
    } catch (_error) {
      error = _error;
      warn("detected problem with key " + (rpr(key)));
      warn("and/or value              " + (rpr(value)));
      throw error;
    }
  };

  this.normalize_phrase = function(db, phrase) {
    var phrasetype;
    switch (phrasetype = phrase[0]) {
      case 'spo':
        return phrase;
      case 'pos':
        if (phrase[4] != null) {
          return ['spo', phrase[3], phrase[1], phrase[2], phrase[4]];
        }
        return ['spo', phrase[3], phrase[1], phrase[2]];
    }
    throw new Error("unknown phrasetype " + (rpr(phrasetype)));
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

  this.as_url = function(db, key, value, settings) {
    var E, I, colors, idx, idx_rpr, obj, phrasetype, prd, ref, sbj, tail;
    if (CND.isa_jsbuffer(key)) {
      key = this._decode_key(db, key);
    }
    if (CND.isa_jsbuffer(value)) {
      value = this._decode_value(db, value);
    }
    colors = (ref = settings != null ? settings['colors'] : void 0) != null ? ref : false;
    I = colors ? CND.darkgrey('|') : '|';
    E = colors ? CND.darkgrey(':') : ':';
    phrasetype = key[0], tail = 2 <= key.length ? slice.call(key, 1) : [];
    if (phrasetype === 'spo') {
      sbj = tail[0], prd = tail[1];
      obj = rpr(value);
      if (colors) {
        phrasetype = CND.grey(phrasetype);
        sbj = CND.RED(sbj);
        prd = CND.YELLOW(prd);
        obj = CND.GREEN(obj);
        return phrasetype + I + sbj + I + prd + E + obj;
      } else {
        return "spo|" + sbj + "|" + prd + "|";
      }
    } else {
      prd = tail[0], obj = tail[1], sbj = tail[2], idx = tail[3];
      idx_rpr = idx != null ? rpr(idx) : '';
      if (colors) {
        phrasetype = CND.grey(phrasetype);
        sbj = CND.RED(sbj);
        prd = CND.YELLOW(prd);
        obj = CND.GREEN(obj);
        return phrasetype + I + prd + E + obj + I + sbj;
      } else {
        return "pos|" + prd + ":" + obj + "|" + sbj + "|" + idx_rpr;
      }
    }
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

  this._query_from_prefix = function(db, prefix, star) {
    var base, gte, lte;
    if (star != null) {

      /* 'Asterisk' encoding: partial key segments match */
      gte = this._encode_key(db, prefix);
      lte = this._encode_key(db, prefix);
      lte[lte.length - 1] = CODEC['typemarkers']['hi'];
    } else {

      /* 'Classical' encoding: only full key segments match */
      base = this._encode_key(db, prefix, CODEC['typemarkers']['hi']);
      gte = base.slice(0, base.length - 1);
      lte = base.slice(0, base.length);
    }
    return {
      gte: gte,
      lte: lte
    };
  };

}).call(this);

//# sourceMappingURL=../sourcemaps/main.js.map