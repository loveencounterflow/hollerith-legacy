(function() {
  var $, $async, CND, CODEC, D, DUMP, _codec_decode, _codec_encode, _codec_encode_plus_tm_hi, _new_level_db, badge, debug, echo, help, later, leveldown, log, rpr, step, suspend, urge, warn, whisper, ƒ,
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

  CODEC = this.CODEC = require('hollerith-codec');

  DUMP = this.DUMP = require('./dump');

  _codec_encode = CODEC.encode.bind(CODEC);

  _codec_encode_plus_tm_hi = CODEC.encode_plus_hi.bind(CODEC);

  _codec_decode = CODEC.decode.bind(CODEC);

  D = require('pipedreams');

  $ = D.remit.bind(D);

  $async = D.remit_async.bind(D);

  _new_level_db = require('level');

  leveldown = require('leveldown');

  suspend = require('coffeenode-suspend');

  step = suspend.step;

  later = suspend.immediately;

  this._LODASH = require('lodash');

  this.phrasetypes = ['pos', 'spo'];

  this._misfit = Symbol('misfit');

  this._zero_value_bfr = new Buffer('null');

  this.new_db = function(route, settings) {

    /* TAINT we should force this operation to be asynchronous; otherwise, DB may not be writeable */
    var R, create_if_missing, decoder, encoder, level_settings, ref, ref1, ref2, ref3, size, substrate;
    create_if_missing = (ref = settings != null ? settings['create'] : void 0) != null ? ref : true;
    size = (ref1 = settings != null ? settings['size'] : void 0) != null ? ref1 : 1e5;
    encoder = (ref2 = settings != null ? settings['encoder'] : void 0) != null ? ref2 : null;
    decoder = (ref3 = settings != null ? settings['decoder'] : void 0) != null ? ref3 : null;
    level_settings = {
      'keyEncoding': 'binary',
      'valueEncoding': 'binary',
      'createIfMissing': create_if_missing,
      'errorIfExists': false,
      'compression': true,
      'sync': false
    };
    if (create_if_missing) {
      (require('mkdirp')).sync(route);
    }
    substrate = _new_level_db(route, level_settings, function(error) {
      if (error != null) {
        if (error['name'] === 'OpenError') {

          /* TAINT error also thrown with misleading message if route doesn't exist up the penultimate term */
          throw new Error("No database found at " + route + " and no `create` setting given");
        }
        throw error;
      }
    });
    R = {
      '~isa': 'HOLLERITH/db',
      '%self': substrate,
      'size': size,
      'encoder': encoder,
      'decoder': decoder
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
    var $as_batch_entry, $encode, $ensure_unique_sp, $index, $load_bloom, $save_bloom, $write, R, batch_size, batch_written, ensure_unique, loner_predicates, pipeline, ref, ref1, ref2, ref3, ref4, solid_predicates, substrate;
    if (settings == null) {
      settings = {};
    }

    /* Superficial experiments show that a much bigger batch size than 1'000 does not tend to improve
    throughput; therefore, in order to reduce memory footprint, it seems advisable to leave batch size
    in the order of around a thousand entries.
     */
    batch_size = (ref = settings['batch']) != null ? ref : 1000;
    solid_predicates = (ref1 = settings['solids']) != null ? ref1 : [];
    loner_predicates = (ref2 = settings['loners']) != null ? ref2 : [];
    ensure_unique = (ref3 = settings['unique']) != null ? ref3 : true;
    substrate = db['%self'];
    R = D.create_throughstream();
    batch_written = null;
    $index = (function(_this) {
      return function() {
        return $(function(spo, send) {
          var i, len, obj, obj_element, obj_idx, obj_type, prd, results, sbj;
          sbj = spo[0], prd = spo[1], obj = spo[2];
          send([['spo', sbj, prd], obj]);
          if (!(((obj_type = CND.type_of(obj)) === 'pod') || (indexOf.call(loner_predicates, prd) >= 0))) {
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
          substrate.batch(batch);
          batch_written();
          return send(batch);
        });
      };
    })(this);
    if (ensure_unique) {
      ref4 = this._get_bloom_methods(db), batch_written = ref4.batch_written, $ensure_unique_sp = ref4.$ensure_unique_sp, $load_bloom = ref4.$load_bloom, $save_bloom = ref4.$save_bloom;
    } else {
      batch_written = function() {};
    }
    pipeline = [];
    if (ensure_unique) {
      pipeline.push($load_bloom());
    }
    pipeline.push(this.$validate_spo());
    if (ensure_unique) {
      pipeline.push($ensure_unique_sp());
    }
    pipeline.push($index());
    pipeline.push($encode());
    pipeline.push($as_batch_entry());
    pipeline.push(D.$batch(batch_size));
    pipeline.push($write());
    if (ensure_unique) {
      pipeline.push($save_bloom());
    }
    R = R.pipe(D.combine.apply(D, pipeline));
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
        var error, error1;
        try {
          _this.validate_spo(spo);
        } catch (error1) {
          error = error1;
          return send.error(error);
        }
        return send(spo);
      };
    })(this));
  };

  this._get_bloom_methods = function(db) {
    var $ensure_unique_sp, $load_bloom, $save_bloom, batch_written, bloom_settings, ref, seen, show_bloom_info;
    bloom_settings = {
      size: (ref = db['size']) != null ? ref : 1e5
    };
    seen = {};
    batch_written = function() {
      return seen = {};
    };
    show_bloom_info = (function(_this) {
      return function() {
        return CND.BLOOM.report(db['%bloom']);
      };
    })(this);
    $ensure_unique_sp = (function(_this) {
      return function() {
        return $async(function(spo, done) {
          var _, bloom, bloom_has_key, key, key_bfr, key_txt, prd, sbj, seen_has_key;
          sbj = spo[0], prd = spo[1], _ = spo[2];
          key = [sbj, prd];
          key_bfr = CODEC.encode(key);
          key_txt = key_bfr.toString('hex');
          bloom = db['%bloom'];
          seen_has_key = seen[key_txt] != null;
          bloom_has_key = CND.BLOOM.has(bloom, key_bfr);
          if (seen_has_key) {
            warn(key);
            return done.error(new Error("S/P pair already in DB: " + (rpr(key))));
          }
          seen[key_txt] = 1;
          CND.BLOOM.add(bloom, key_bfr);
          if (!bloom_has_key) {
            return done(spo);
          }
          return _this.has_any(db, {
            prefix: ['spo', sbj, prd]
          }, function(error, db_has_key) {
            if (error != null) {
              return done.error(error);
            }
            if (db_has_key) {
              return done.error(new Error("S/P pair already in DB: " + (rpr(key))));
            }
            return done(spo);
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
        return $(function(data, send, end) {
          var bloom_bfr;
          if (data != null) {
            send(data);
          }
          if (end != null) {
            if (db['%bloom'] != null) {
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
            } else {
              return whisper("no data written, no Bloom filter to save");
            }
          }
        });
      };
    })(this);
    return {
      batch_written: batch_written,
      $ensure_unique_sp: $ensure_unique_sp,
      $load_bloom: $load_bloom,
      $save_bloom: $save_bloom
    };
  };

  this.$index = (function(_this) {
    return function(descriptions) {
      var arities, arity, link, new_index_phrase, phrase_counts, phrases, predicate, predicate_count, predicates;
      predicates = [];
      predicate_count = 0;
      arities = [];
      phrases = [];
      phrase_counts = {};
      for (predicate in descriptions) {
        arity = descriptions[predicate];
        predicate_count += +1;
        if (arity !== 'singular' && arity !== 'plural') {
          throw new Error("expected 'singular' or 'plural' for arity, got " + (rpr(arity)));
        }
        predicates.push(predicate);
        phrases.push({});
        arities.push(arity);
      }
      if (predicate_count.length < 2) {
        throw new Error("expected at least two predicate descriptions, got " + predicates.length);
      }
      if (predicate_count.length > 2) {
        throw new Error("indexes with more than 2 steps not supported yet");
      }
      new_index_phrase = function(tsbj, tprd, tobj, fprd, fobj, tsbj_is_list, idx) {
        if (idx == null) {
          idx = 0;
        }
        if (tsbj_is_list) {
          return [slice.call(tsbj).concat([tprd], [idx], [tobj]), fprd, fobj];
        }
        return [[tsbj, tprd, idx, tobj], fprd, fobj];
      };
      link = function(phrases) {
        var R, fobj, fprd, from_is_plural, from_phrase, fsbj, i, idx, j, k, l, len, len1, len2, len3, sub_fobj, sub_tobj, to_is_plural, to_phrase, tobj, tprd, tsbj, tsbj_is_list;
        if (phrases.length !== 2) {
          throw new Error("indexes with anything but 2 steps not supported yet");
        }
        from_phrase = phrases[0], to_phrase = phrases[1];
        fsbj = from_phrase[0], fprd = from_phrase[1], fobj = from_phrase[2];
        tsbj = to_phrase[0], tprd = to_phrase[1], tobj = to_phrase[2];
        tsbj_is_list = CND.isa_list(tsbj);
        from_is_plural = arities[0] === 'plural';
        to_is_plural = arities[1] === 'plural';
        if (!(from_is_plural || to_is_plural)) {
          return [new_index_phrase(tsbj, tprd, tobj, fprd, fobj, tsbj_is_list)];
        }
        idx = -1;
        R = [];
        if (from_is_plural) {
          if (to_is_plural) {
            for (i = 0, len = fobj.length; i < len; i++) {
              sub_fobj = fobj[i];
              for (j = 0, len1 = tobj.length; j < len1; j++) {
                sub_tobj = tobj[j];
                idx += +1;
                R.push(new_index_phrase(tsbj, tprd, sub_tobj, fprd, sub_fobj, tsbj_is_list, idx));
              }
            }
          } else {
            for (k = 0, len2 = fobj.length; k < len2; k++) {
              sub_fobj = fobj[k];
              idx += +1;
              R.push(new_index_phrase(tsbj, tprd, tobj, fprd, sub_fobj, tsbj_is_list, idx));
            }
          }
        } else {
          for (l = 0, len3 = tobj.length; l < len3; l++) {
            sub_tobj = tobj[l];
            idx += +1;
            R.push(new_index_phrase(tsbj, tprd, sub_tobj, fprd, fobj, tsbj_is_list, idx));
          }
        }
        return R;
      };
      return $(function(phrase, send) {
        var i, index_phrase, len, obj, phrase_target, prd, prd_idx, ref, ref1, sbj, sbj_txt;
        send(phrase);
        sbj = phrase[0], prd = phrase[1], obj = phrase[2];
        if (!((prd_idx = predicates.indexOf(prd)) >= 0)) {
          return;
        }
        sbj_txt = JSON.stringify(sbj);
        phrase_target = phrases[sbj_txt] != null ? phrases[sbj_txt] : phrases[sbj_txt] = [];
        phrase_target[prd_idx] = phrase;
        phrase_counts[sbj_txt] = ((ref = phrase_counts[sbj_txt]) != null ? ref : 0) + 1;
        if (phrase_counts[sbj_txt] < predicate_count) {
          return null;
        }
        ref1 = link(phrases[sbj_txt]);
        for (i = 0, len = ref1.length; i < len; i++) {
          index_phrase = ref1[i];
          send(index_phrase);
        }
        return null;
      });
    };
  })(this);

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
      are called `gte` and `lte`, respectively) is issued.
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

    /* TAINT decoding transfrom should be made public */
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
    db['%self'].get(key_bfr, (function(_this) {
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
    return null;
  };

  this.has_any = function(db, query, handler) {
    var active, input;
    input = this.create_facetstream(db, query);
    active = true;
    input.pipe($((function(_this) {
      return function(data, send, end) {
        if (data != null) {
          active = false;
          input.destroy();
          handler(null, true);
        }
        if (end != null) {
          if (active != null) {
            handler(null, false);
          }
          return end();
        }
      };
    })(this)));
    return null;
  };

  this._encode_key = function(db, key, plus_tm_hi) {
    if (key === void 0) {
      throw new Error("illegal key " + (rpr(key)));
    }
    if (plus_tm_hi) {
      return _codec_encode_plus_tm_hi(key, db['encoder']);
    }
    return _codec_encode(key, db['encoder']);
  };

  this._decode_key = function(db, key) {
    var R;
    R = _codec_decode(key, db['decoder']);
    if (R === void 0) {
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
    var error, error1, length, phrasetype, ref;
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
    } catch (error1) {
      error = error1;
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
      }
      return phrasetype + I + sbj + I + prd + E + obj;
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


  /* TAINT should be public */

  this._query_from_prefix = function(db, prefix, star) {
    var base, gte, lte;
    if (star != null) {

      /* 'Asterisk' encoding: partial key segments match */
      gte = this._encode_key(db, prefix);
      lte = this._encode_key(db, prefix);
      lte[lte.length - 1] = CODEC['typemarkers']['hi'];
    } else {

      /* 'Classical' encoding: only full key segments match */
      base = this._encode_key(db, prefix, true);
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
