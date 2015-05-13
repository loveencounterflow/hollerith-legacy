(function() {
  var $, CND, CODEC, D, LODASH, _codec_decode, _codec_encode, _new_level_db, badge, debug, echo, help, leveldown, log, repeat_immediately, rpr, step, suspend, urge, warn, whisper,
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
        (yield db['%self'].close(resume));
        (yield leveldown.destroy(route, resume));
        (yield db['%self'].open(resume));
        return handler(null);
      };
    })(this));
  };

  this.$write = function(db, buffer_size) {
    var _send, batch_count, buffer, flush, has_ended, push, substrate;
    if (buffer_size == null) {
      buffer_size = 1000;
    }

    /* Expects a Hollerith DB object and an optional buffer size; returns a stream transformer that does all
    of the following:
    
    * It expects an SO key for which it will generate a corresponding OS key.
    * A corresponding OS key is formulated except when the SO key's object value is a JS object / a POD (since
      in that case, the value serialization is jolly useless as an index).
    * It sends on both the SO and the OS key downstream for optional further processing.
    * It forms a proper `node-level`-compatible batch record for each key and collect all records
      in a buffer.
    * Whenever the buffer has outgrown the given buffer size, the buffer will be written into the DB using
      `levelup`'s `batch` command.
    * When the last pending batch has been written into the DB, the `end` event is called on the stream
      and may be detected downstream.
     */
    if (!(buffer_size > 0)) {
      throw new Error("buffer size must be positive integer, got " + (rpr(buffer_size)));
    }
    buffer = [];
    substrate = db['%self'];
    batch_count = 0;
    has_ended = false;
    _send = null;
    push = (function(_this) {
      return function(key, value) {
        var value_bfr;
        value_bfr = value != null ? _this._encode_value(db, value) : _this._zero_value_bfr;
        return buffer.push({
          type: 'put',
          key: _this._encode_key(db, key),
          value: value_bfr
        });
      };
    })(this);
    flush = (function(_this) {
      return function() {
        if (buffer.length > 0) {
          batch_count += +1;
          substrate.batch(buffer, function(error) {
            if (error != null) {
              throw error;
            }
            batch_count += -1;
            if (has_ended && batch_count < 1) {
              return _send.end();
            }
          });
          return buffer = [];
        } else {
          return _send.end();
        }
      };
    })(this);
    return $((function(_this) {
      return function(spo, send, end) {
        var i, len, obj, obj_element, obj_idx, prd, sbj;
        _send = send;
        if (spo != null) {
          sbj = spo[0], prd = spo[1], obj = spo[2];
          push(['spo', sbj, prd], obj);

          /* TAINT what to send, if anything? */
          if (CND.isa_pod(obj)) {

            /* Do not create index entries in case `obj` is a POD: */
            null;
          } else if (CND.isa_list(obj)) {

            /* Create one index entry for each element in case `obj` is a list: */
            for (obj_idx = i = 0, len = obj.length; i < len; obj_idx = ++i) {
              obj_element = obj[obj_idx];
              push(['pos', prd, obj_element, sbj, obj_idx]);
            }
          } else {

            /* Create one index entry for `obj` otherwise: */
            push(['pos', prd, obj, sbj]);
          }
          if (buffer.length >= buffer_size) {
            flush();
          }
        }

        /* Flush remaining buffered entries to DB */
        if (end != null) {
          has_ended = true;
          return flush();
        }
      };
    })(this));
  };

  this.create_phrasestream = function(db, lo_hint, hi_hint) {
    var R;
    if (lo_hint == null) {
      lo_hint = null;
    }
    if (hi_hint == null) {
      hi_hint = null;
    }
    R = this.create_facetstream(db, lo_hint, hi_hint).pipe(this.$as_phrase(db));
    return R;
  };

  this.create_facetstream = function(db, lo_hint, hi_hint) {
    var R, hi_hint_bfr, lo_hint_bfr, query;
    if (lo_hint == null) {
      lo_hint = null;
    }
    if (hi_hint == null) {
      hi_hint = null;
    }

    /*
    * If no hint is given, all entries will be given in the stream.
    * If both `lo_hint` and `hi_hint` are given, a query with lower and upper, inclusive boundaries is
      issued.
    * If only `lo_hint` is given, a prefix query is issued.
    * If `hi_hint` is given but `lo_hint` is missing, an error is issued.
     */
    if ((hi_hint != null) && (lo_hint == null)) {
      throw new Error("must give `lo_hint` when `hi_hint` is given");
    }
    if (lo_hint && (hi_hint == null)) {
      query = this._query_from_prefix(db, lo_hint);
    } else {
      lo_hint_bfr = lo_hint != null ? this._encode_key(db, lo_hint) : CODEC['keys']['lo'];
      hi_hint_bfr = hi_hint != null ? (this._query_from_prefix(db, hi_hint))['lte'] : CODEC['keys']['hi'];
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
        return send([_this._decode_key(db, key), _this._decode_value(db, value)]);
      };
    })(this)));
    return R;
  };

  this.read_many = function(db, hint) {
    if (hint == null) {
      return hint = null;
    }

    /* Hints are interpreted as partial secondary (POS) keys. */
  };

  this.read_one = function(db, key, fallback, handler) {
    var arity;
    if (fallback == null) {
      fallback = this._misfit;
    }

    /* Hints are interpreted as complete primary (SPO) keys. */
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
    return db['%self'].get(key, handler);
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
    return JSON.stringify(value);
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

  this.as_phrase = function(db, key, value) {
    var _, idx, length, obj, phrasetype, prd, ref, sbj;
    switch (phrasetype = key[0]) {
      case 'spo':
        if ((length = key.length) !== 3) {
          throw new Error("illegal SPO key (length " + length + ")");
        }
        if (value === (void 0)) {
          throw new Error("illegal value (1) " + (rpr(value)));
        }
        return [key[1], key[2], value];
      case 'pos':
        if (!((4 <= (ref = (length = key.length)) && ref <= 5))) {
          throw new Error("illegal POS key (length " + length + ")");
        }
        if (!(value === null)) {
          throw new Error("illegal value (2) " + (rpr(value)));
        }
        _ = key[0], prd = key[1], obj = key[2], sbj = key[3], idx = key[4];
        if (idx != null) {
          return [sbj, prd, obj, idx];
        } else {
          return [sbj, prd, obj];
        }
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
    var idx, idx_rpr, k0, k1, phrasetype, v0, v1;
    if ((this._type_from_key(db, key)) === 'list') {
      phrasetype = key[0], k0 = key[1], v0 = key[2], k1 = key[3], v1 = key[4], idx = key[5];
      idx_rpr = idx != null ? rpr(idx) : '';

      /* TAINT should escape metachrs `|`, ':' */

      /* TAINT should use `rpr` on parts of speech (e.g. object value could be a number etc.) */
      return phrasetype + "|" + k0 + ":" + v0 + "|" + k1 + ":" + v1 + "|" + idx_rpr;
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
    var first, idx, phrasetype, second;
    if (Array.isArray(key)) {
      if (key.length !== 6) {
        throw new Error("illegal key: " + (rpr(key)));
      }
      phrasetype = key[0], first = key[1], second = key[2], idx = key[3];
      if (phrasetype !== 'so' && phrasetype !== 'os') {
        throw new Error("illegal phrasetype: " + (rpr(key)));
      }
      return 'list';
    }
    return 'other';
  };

  this._query_from_prefix = function(db, lo_hint) {
    var base, gte, lte;
    base = this._encode_key(db, lo_hint, 0xff);
    gte = base.slice(0, base.length - 1);
    lte = base.slice(0, base.length);
    return {
      gte: gte,
      lte: lte
    };
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,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QUEsR0FBUSxJQUFDLENBQUEsV0FBRCxDQUFhLEVBQWIsRUFBaUIsT0FBakIsRUFBMEIsSUFBMUIsQ0FBUixDQUFBO0FBQUEsSUFDQSxHQUFBLEdBQVEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFYLEVBQWMsSUFBSSxDQUFDLE1BQUwsR0FBYyxDQUE1QixDQURSLENBQUE7QUFBQSxJQUVBLEdBQUEsR0FBUSxJQUFJLENBQUMsS0FBTCxDQUFXLENBQVgsRUFBYyxJQUFJLENBQUMsTUFBbkIsQ0FGUixDQUFBO0FBR0EsV0FBTztBQUFBLE1BQUUsS0FBQSxHQUFGO0FBQUEsTUFBTyxLQUFBLEdBQVA7S0FBUCxDQUpvQjtFQUFBLENBN1h0QixDQUFBO0FBQUEiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIlxuXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuIyBuanNfdXRpbCAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAndXRpbCdcbiMgbmpzX3BhdGggICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ3BhdGgnXG4jIG5qc19mcyAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdmcydcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuQ05EICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2NuZCdcbnJwciAgICAgICAgICAgICAgICAgICAgICAgPSBDTkQucnByXG5iYWRnZSAgICAgICAgICAgICAgICAgICAgID0gJ0hPTExFUklUSC9tYWluJ1xubG9nICAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdwbGFpbicsICAgICBiYWRnZVxuZGVidWcgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdkZWJ1ZycsICAgICBiYWRnZVxud2FybiAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICd3YXJuJywgICAgICBiYWRnZVxuaGVscCAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdoZWxwJywgICAgICBiYWRnZVxudXJnZSAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICd1cmdlJywgICAgICBiYWRnZVxud2hpc3BlciAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICd3aGlzcGVyJywgICBiYWRnZVxuZWNobyAgICAgICAgICAgICAgICAgICAgICA9IENORC5lY2hvLmJpbmQgQ05EXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnN1c3BlbmQgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdjb2ZmZWVub2RlLXN1c3BlbmQnXG5zdGVwICAgICAgICAgICAgICAgICAgICAgID0gc3VzcGVuZC5zdGVwXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkNPREVDICAgICAgICAgICAgICAgICAgICAgPSBAQ09ERUMgPSByZXF1aXJlICcuL2NvZGVjJ1xuX2NvZGVjX2VuY29kZSAgICAgICAgICAgICA9IENPREVDLmVuY29kZS5iaW5kIENPREVDXG5fY29kZWNfZGVjb2RlICAgICAgICAgICAgID0gQ09ERUMuZGVjb2RlLmJpbmQgQ09ERUNcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuRCAgICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ3BpcGVkcmVhbXMyJ1xuJCAgICAgICAgICAgICAgICAgICAgICAgICA9IEQucmVtaXQuYmluZCBEXG5fbmV3X2xldmVsX2RiICAgICAgICAgICAgID0gcmVxdWlyZSAnbGV2ZWwnXG5sZXZlbGRvd24gICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbGV2ZWwvbm9kZV9tb2R1bGVzL2xldmVsZG93bidcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuc3VzcGVuZCAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2NvZmZlZW5vZGUtc3VzcGVuZCdcbnN0ZXAgICAgICAgICAgICAgICAgICAgICAgPSBzdXNwZW5kLnN0ZXBcbnJlcGVhdF9pbW1lZGlhdGVseSAgICAgICAgPSBzdXNwZW5kLnJlcGVhdF9pbW1lZGlhdGVseVxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5MT0RBU0ggICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbG9kYXNoJ1xuXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQHBocmFzZXR5cGVzICAgICAgPSBbICdwb3MnLCAnc3BvJywgXVxuQF9taXNmaXQgICAgICAgICAgPSBTeW1ib2wgJ21pc2ZpdCdcbkBfemVyb192YWx1ZV9iZnIgID0gbmV3IEJ1ZmZlciAnbnVsbCdcbiMgd2FybiBcIm1pbmQgaW5jb25zaXN0ZW5jaWVzIGluIEhPTExFUklUSDIvbWFpbiBAX3plcm9fZW5jIGV0Y1wiXG4jIEBfemVybyAgICAgICAgICAgID0gdHJ1ZSAjID8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/XG4jIEBfemVyb19lbmMgICAgICAgID0gX2NvZGVjX2VuY29kZSBbIEBfemVybywgICAgXVxuIyBAX2xvX2VuYyAgICAgICAgICA9IF9jb2RlY19lbmNvZGUgWyBudWxsLCAgICAgIF1cbiMgQF9oaV9lbmMgICAgICAgICAgPSBfY29kZWNfZW5jb2RlIFsgQ09ERUMuLCBdXG4jIEBfbGFzdF9vY3RldCAgICAgID0gbmV3IEJ1ZmZlciBbIDB4ZmYsIF1cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AbmV3X2RiID0gKCByb3V0ZSApIC0+XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgbGV2ZWxfc2V0dGluZ3MgPVxuICAgICdrZXlFbmNvZGluZyc6ICAgICAgICAgICdiaW5hcnknXG4gICAgJ3ZhbHVlRW5jb2RpbmcnOiAgICAgICAgJ2JpbmFyeSdcbiAgICAnY3JlYXRlSWZNaXNzaW5nJzogICAgICB0cnVlXG4gICAgJ2Vycm9ySWZFeGlzdHMnOiAgICAgICAgZmFsc2VcbiAgICAnY29tcHJlc3Npb24nOiAgICAgICAgICB5ZXNcbiAgICAnc3luYyc6ICAgICAgICAgICAgICAgICBub1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHN1YnN0cmF0ZSAgICAgICAgICAgPSBfbmV3X2xldmVsX2RiIHJvdXRlLCBsZXZlbF9zZXR0aW5nc1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIFIgPVxuICAgICd+aXNhJzogICAgICAgICAgICdIT0xMRVJJVEgvZGInXG4gICAgJyVzZWxmJzogICAgICAgICAgc3Vic3RyYXRlXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcmV0dXJuIFJcblxuIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQF9yZW9wZW4gPSAoIGRiLCBoYW5kbGVyICkgLT5cbiMgICBzdGVwICggcmVzdW1lICkgPT5cbiMgICAgIHJvdXRlID0gZGJbICclc2VsZicgXVsgJ2xvY2F0aW9uJyBdXG4jICAgICB5aWVsZCBkYlsgJyVzZWxmJyBdLmNsb3NlIHJlc3VtZVxuIyAgICAgeWllbGQgZGJbICclc2VsZicgXS5vcGVuIHJlc3VtZVxuIyAgICAgd2hpc3BlciBcInJlLW9wZW5lZCBMZXZlbERCIGF0ICN7cm91dGV9XCJcbiMgICAgIGhhbmRsZXIgbnVsbFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBjbGVhciA9ICggZGIsIGhhbmRsZXIgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICByb3V0ZSA9IGRiWyAnJXNlbGYnIF1bICdsb2NhdGlvbicgXVxuICAgIHlpZWxkIGRiWyAnJXNlbGYnIF0uY2xvc2UgcmVzdW1lXG4gICAgeWllbGQgbGV2ZWxkb3duLmRlc3Ryb3kgcm91dGUsIHJlc3VtZVxuICAgIHlpZWxkIGRiWyAnJXNlbGYnIF0ub3BlbiByZXN1bWVcbiAgICAjIGhlbHAgXCJlcmFzZWQgYW5kIHJlLW9wZW5lZCBMZXZlbERCIGF0ICN7cm91dGV9XCJcbiAgICBoYW5kbGVyIG51bGxcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgV1JJVElOR1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AJHdyaXRlID0gKCBkYiwgYnVmZmVyX3NpemUgPSAxMDAwICkgLT5cbiAgIyMjIEV4cGVjdHMgYSBIb2xsZXJpdGggREIgb2JqZWN0IGFuZCBhbiBvcHRpb25hbCBidWZmZXIgc2l6ZTsgcmV0dXJucyBhIHN0cmVhbSB0cmFuc2Zvcm1lciB0aGF0IGRvZXMgYWxsXG4gIG9mIHRoZSBmb2xsb3dpbmc6XG5cbiAgKiBJdCBleHBlY3RzIGFuIFNPIGtleSBmb3Igd2hpY2ggaXQgd2lsbCBnZW5lcmF0ZSBhIGNvcnJlc3BvbmRpbmcgT1Mga2V5LlxuICAqIEEgY29ycmVzcG9uZGluZyBPUyBrZXkgaXMgZm9ybXVsYXRlZCBleGNlcHQgd2hlbiB0aGUgU08ga2V5J3Mgb2JqZWN0IHZhbHVlIGlzIGEgSlMgb2JqZWN0IC8gYSBQT0QgKHNpbmNlXG4gICAgaW4gdGhhdCBjYXNlLCB0aGUgdmFsdWUgc2VyaWFsaXphdGlvbiBpcyBqb2xseSB1c2VsZXNzIGFzIGFuIGluZGV4KS5cbiAgKiBJdCBzZW5kcyBvbiBib3RoIHRoZSBTTyBhbmQgdGhlIE9TIGtleSBkb3duc3RyZWFtIGZvciBvcHRpb25hbCBmdXJ0aGVyIHByb2Nlc3NpbmcuXG4gICogSXQgZm9ybXMgYSBwcm9wZXIgYG5vZGUtbGV2ZWxgLWNvbXBhdGlibGUgYmF0Y2ggcmVjb3JkIGZvciBlYWNoIGtleSBhbmQgY29sbGVjdCBhbGwgcmVjb3Jkc1xuICAgIGluIGEgYnVmZmVyLlxuICAqIFdoZW5ldmVyIHRoZSBidWZmZXIgaGFzIG91dGdyb3duIHRoZSBnaXZlbiBidWZmZXIgc2l6ZSwgdGhlIGJ1ZmZlciB3aWxsIGJlIHdyaXR0ZW4gaW50byB0aGUgREIgdXNpbmdcbiAgICBgbGV2ZWx1cGAncyBgYmF0Y2hgIGNvbW1hbmQuXG4gICogV2hlbiB0aGUgbGFzdCBwZW5kaW5nIGJhdGNoIGhhcyBiZWVuIHdyaXR0ZW4gaW50byB0aGUgREIsIHRoZSBgZW5kYCBldmVudCBpcyBjYWxsZWQgb24gdGhlIHN0cmVhbVxuICAgIGFuZCBtYXkgYmUgZGV0ZWN0ZWQgZG93bnN0cmVhbS5cblxuICAjIyNcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICB0aHJvdyBuZXcgRXJyb3IgXCJidWZmZXIgc2l6ZSBtdXN0IGJlIHBvc2l0aXZlIGludGVnZXIsIGdvdCAje3JwciBidWZmZXJfc2l6ZX1cIiB1bmxlc3MgYnVmZmVyX3NpemUgPiAwXG4gIGJ1ZmZlciAgICAgID0gW11cbiAgc3Vic3RyYXRlICAgPSBkYlsgJyVzZWxmJyBdXG4gIGJhdGNoX2NvdW50ID0gMFxuICBoYXNfZW5kZWQgICA9IG5vXG4gIF9zZW5kICAgICAgID0gbnVsbFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHB1c2ggPSAoIGtleSwgdmFsdWUgKSA9PlxuICAgIHZhbHVlX2JmciA9IGlmIHZhbHVlPyB0aGVuIEBfZW5jb2RlX3ZhbHVlIGRiLCB2YWx1ZSBlbHNlIEBfemVyb192YWx1ZV9iZnJcbiAgICBidWZmZXIucHVzaCB7IHR5cGU6ICdwdXQnLCBrZXk6ICggQF9lbmNvZGVfa2V5IGRiLCBrZXkgKSwgdmFsdWU6IHZhbHVlX2JmciwgfVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGZsdXNoID0gPT5cbiAgICBpZiBidWZmZXIubGVuZ3RoID4gMFxuICAgICAgYmF0Y2hfY291bnQgKz0gKzFcbiAgICAgICMgIyMjIC0tLSAjIyNcbiAgICAgICMgZm9yIHsga2V5LCB2YWx1ZSwgfSBpbiBidWZmZXJcbiAgICAgICMgICBkZWJ1ZyAnwqlBYkRVMScsICggQF9kZWNvZGVfa2V5IGRiLCBrZXkgKSwgKCBAX2RlY29kZV9rZXkgZGIsIHZhbHVlIClcbiAgICAgICMgIyMjIC0tLSAjIyNcbiAgICAgIHN1YnN0cmF0ZS5iYXRjaCBidWZmZXIsICggZXJyb3IgKSA9PlxuICAgICAgICB0aHJvdyBlcnJvciBpZiBlcnJvcj9cbiAgICAgICAgYmF0Y2hfY291bnQgKz0gLTFcbiAgICAgICAgX3NlbmQuZW5kKCkgaWYgaGFzX2VuZGVkIGFuZCBiYXRjaF9jb3VudCA8IDFcbiAgICAgIGJ1ZmZlciA9IFtdXG4gICAgZWxzZVxuICAgICAgX3NlbmQuZW5kKClcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICByZXR1cm4gJCAoIHNwbywgc2VuZCwgZW5kICkgPT5cbiAgICAjIGRlYnVnICfCqUJwSlF0Jywgc3BvXG4gICAgX3NlbmQgPSBzZW5kXG4gICAgaWYgc3BvP1xuICAgICAgWyBzYmosIHByZCwgb2JqLCBdID0gc3BvXG4gICAgICBwdXNoIFsgJ3NwbycsIHNiaiwgcHJkLCBdLCBvYmpcbiAgICAgICMgZGVidWcgJ8KpT1ltYUQnLCBbICdzcG8nLCBzYmosIHByZCwgXSwgb2JqXG4gICAgICAjIyMgVEFJTlQgd2hhdCB0byBzZW5kLCBpZiBhbnl0aGluZz8gIyMjXG4gICAgICAjIHNlbmQgZW50cnlcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgaWYgQ05ELmlzYV9wb2Qgb2JqXG4gICAgICAgICMjIyBEbyBub3QgY3JlYXRlIGluZGV4IGVudHJpZXMgaW4gY2FzZSBgb2JqYCBpcyBhIFBPRDogIyMjXG4gICAgICAgIG51bGxcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgZWxzZSBpZiBDTkQuaXNhX2xpc3Qgb2JqXG4gICAgICAgICMjIyBDcmVhdGUgb25lIGluZGV4IGVudHJ5IGZvciBlYWNoIGVsZW1lbnQgaW4gY2FzZSBgb2JqYCBpcyBhIGxpc3Q6ICMjI1xuICAgICAgICBmb3Igb2JqX2VsZW1lbnQsIG9ial9pZHggaW4gb2JqXG4gICAgICAgICAgcHVzaCBbICdwb3MnLCBwcmQsIG9ial9lbGVtZW50LCBzYmosIG9ial9pZHgsIF1cbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgZWxzZVxuICAgICAgICAjIyMgQ3JlYXRlIG9uZSBpbmRleCBlbnRyeSBmb3IgYG9iamAgb3RoZXJ3aXNlOiAjIyNcbiAgICAgICAgcHVzaCBbICdwb3MnLCBwcmQsIG9iaiwgc2JqLCBdXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIGZsdXNoKCkgaWYgYnVmZmVyLmxlbmd0aCA+PSBidWZmZXJfc2l6ZVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyMjIEZsdXNoIHJlbWFpbmluZyBidWZmZXJlZCBlbnRyaWVzIHRvIERCICMjI1xuICAgIGlmIGVuZD9cbiAgICAgIGhhc19lbmRlZCA9IHllc1xuICAgICAgZmx1c2goKVxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyBSRUFESU5HXG4jICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBAY3JlYXRlX2tleXN0cmVhbSA9ICggZGIsIGxvX2hpbnQgPSBudWxsLCBoaV9oaW50ID0gbnVsbCApIC0+XG4jICAgIyMjIFRBSU5UIGNvZGUgZHVwbGljYXRpb24gIyMjXG4jICAgaWYgbG9faGludD9cbiMgICAgIGlmIGhpX2hpbnQ/XG4jICAgICAgIHF1ZXJ5ID0geyBndGU6IGxvX2hpbnQsIGx0ZTpoaV9oaW50LCB9XG4jICAgICBlbHNlXG4jICAgICAgIHF1ZXJ5ID0geyBndGU6IGxvX2hpbnQsIH1cbiMgICBlbHNlIGlmIGhpX2hpbnQ/XG4jICAgICBxdWVyeSA9IHsgbHRlOiBoaV9oaW50LCB9XG4jICAgZWxzZVxuIyAgICAgcXVlcnkgPSBudWxsXG4jICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgIGRlYnVnICfCqTgzNUpQJywgcXVlcnlcbiMgICBSID0gaWYgcXVlcnk/IHRoZW4gKCBkYlsgJyVzZWxmJyBdLmNyZWF0ZUtleVN0cmVhbSBxdWVyeSApIGVsc2UgZGJbICclc2VsZicgXS5jcmVhdGVLZXlTdHJlYW0oKVxuIyAgICMgUiA9IGRiWyAnJXNlbGYnIF0uY3JlYXRlS2V5U3RyZWFtIEBuZXdfcXVlcnkgZGIsIHF1ZXJ5XG4jICAgIyMjIFRBSU5UIFNob3VsZCB3ZSB0ZXN0IGZvciB3ZWxsLWZvcm1lZCBlbnRyaWVzIGhlcmU/ICMjI1xuIyAgIFIgPSBSLnBpcGUgJCAoIGJrZXksIHNlbmQgKSA9PiBzZW5kIEBfZGVjb2RlX2tleSBkYiwgYmtleVxuIyAgIHJldHVybiBSXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQGNyZWF0ZV9waHJhc2VzdHJlYW0gPSAoIGRiLCBsb19oaW50ID0gbnVsbCwgaGlfaGludCA9IG51bGwgKSAtPlxuICBSID0gQGNyZWF0ZV9mYWNldHN0cmVhbSBkYiwgbG9faGludCwgaGlfaGludFxuICAgIC5waXBlIEAkYXNfcGhyYXNlIGRiXG4gIHJldHVybiBSXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQGNyZWF0ZV9mYWNldHN0cmVhbSA9ICggZGIsIGxvX2hpbnQgPSBudWxsLCBoaV9oaW50ID0gbnVsbCApIC0+XG4gICMjI1xuICAqIElmIG5vIGhpbnQgaXMgZ2l2ZW4sIGFsbCBlbnRyaWVzIHdpbGwgYmUgZ2l2ZW4gaW4gdGhlIHN0cmVhbS5cbiAgKiBJZiBib3RoIGBsb19oaW50YCBhbmQgYGhpX2hpbnRgIGFyZSBnaXZlbiwgYSBxdWVyeSB3aXRoIGxvd2VyIGFuZCB1cHBlciwgaW5jbHVzaXZlIGJvdW5kYXJpZXMgaXNcbiAgICBpc3N1ZWQuXG4gICogSWYgb25seSBgbG9faGludGAgaXMgZ2l2ZW4sIGEgcHJlZml4IHF1ZXJ5IGlzIGlzc3VlZC5cbiAgKiBJZiBgaGlfaGludGAgaXMgZ2l2ZW4gYnV0IGBsb19oaW50YCBpcyBtaXNzaW5nLCBhbiBlcnJvciBpcyBpc3N1ZWQuXG4gICMjI1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGlmIGhpX2hpbnQ/IGFuZCBub3QgbG9faGludD9cbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJtdXN0IGdpdmUgYGxvX2hpbnRgIHdoZW4gYGhpX2hpbnRgIGlzIGdpdmVuXCJcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBpZiBsb19oaW50IGFuZCBub3QgaGlfaGludD9cbiAgICBxdWVyeSAgICAgICA9IEBfcXVlcnlfZnJvbV9wcmVmaXggZGIsIGxvX2hpbnRcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBlbHNlXG4gICAgbG9faGludF9iZnIgPSBpZiBsb19oaW50PyB0aGVuICggICAgICAgIEBfZW5jb2RlX2tleSBkYiwgbG9faGludCApICAgICAgICAgIGVsc2UgQ09ERUNbICdrZXlzJyBdWyAnbG8nIF1cbiAgICBoaV9oaW50X2JmciA9IGlmIGhpX2hpbnQ/IHRoZW4gKCBAX3F1ZXJ5X2Zyb21fcHJlZml4IGRiLCBoaV9oaW50IClbICdsdGUnIF0gZWxzZSBDT0RFQ1sgJ2tleXMnIF1bICdoaScgXVxuICAgIHF1ZXJ5ICAgICAgID0geyBndGU6IGxvX2hpbnRfYmZyLCBsdGU6IGhpX2hpbnRfYmZyLCB9XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgIyMjIFRBSU5UIFNob3VsZCB3ZSB0ZXN0IGZvciB3ZWxsLWZvcm1lZCBlbnRyaWVzIGhlcmU/ICMjI1xuICBSID0gZGJbICclc2VsZicgXS5jcmVhdGVSZWFkU3RyZWFtIHF1ZXJ5XG4gIFIgPSBSLnBpcGUgJCAoIHsga2V5LCB2YWx1ZSB9LCBzZW5kICkgPT4gc2VuZCBbICggQF9kZWNvZGVfa2V5IGRiLCBrZXkgKSwgKCBAX2RlY29kZV92YWx1ZSBkYiwgdmFsdWUgKSwgXVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHJldHVybiBSXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQHJlYWRfbWFueSA9ICggZGIsIGhpbnQgPSBudWxsICkgLT5cbiAgIyMjIEhpbnRzIGFyZSBpbnRlcnByZXRlZCBhcyBwYXJ0aWFsIHNlY29uZGFyeSAoUE9TKSBrZXlzLiAjIyNcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AcmVhZF9vbmUgPSAoIGRiLCBrZXksIGZhbGxiYWNrID0gQF9taXNmaXQsIGhhbmRsZXIgKSAtPlxuICAjIyMgSGludHMgYXJlIGludGVycHJldGVkIGFzIGNvbXBsZXRlIHByaW1hcnkgKFNQTykga2V5cy4gIyMjXG4gIHN3aXRjaCBhcml0eSA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICB3aGVuIDNcbiAgICAgIGhhbmRsZXIgICA9IGZhbGxiYWNrXG4gICAgICBmYWxsYmFjayAgPSBAX21pc2ZpdFxuICAgIHdoZW4gNCB0aGVuIG51bGxcbiAgICBlbHNlIHRocm93IG5ldyBFcnJvciBcImV4cGVjdGVkIDMgb3IgNCBhcmd1bWVudHMsIGdvdCAje2FyaXR5fVwiXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZGJbICclc2VsZicgXS5nZXQga2V5LCBoYW5kbGVyXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQHJlYWRfc3ViID0gKCBkYiwgc2V0dGluZ3MsIHJlYWQgKSAtPlxuICBzd2l0Y2ggYXJpdHkgPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgd2hlbiAyXG4gICAgICByZWFkICAgICAgPSBzZXR0aW5nc1xuICAgICAgc2V0dGluZ3MgID0gbnVsbFxuICAgIHdoZW4gM1xuICAgICAgbnVsbFxuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBFcnJvciBcImV4cGVjdGVkIDIgb3IgMyBhcmd1bWVudHMsIGdvdCAje2FyaXR5fVwiXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgaW5kZXhlZCAgICAgICAgICAgPSBzZXR0aW5ncz9bICdpbmRleGVkJyAgICBdID8gbm9cbiAgIyB0cmFuc2Zvcm0gICAgICAgICA9IHNldHRpbmdzP1sgJ3RyYW5zZm9ybScgIF0gPyBELiRwYXNzX3Rocm91Z2goKVxuICBtYW5nbGUgICAgICAgICAgICA9IHNldHRpbmdzP1sgJ21hbmdsZScgICAgIF0gPyAoIGRhdGEgKSAtPiBkYXRhXG4gIHNlbmRfZW1wdHkgICAgICAgID0gc2V0dGluZ3M/WyAnZW1wdHknICAgICAgXSA/IG5vXG4gIGluc2VydF9pbmRleCAgICAgID0gaWYgaW5kZXhlZCB0aGVuIEQubmV3X2luZGV4ZXIoKSBlbHNlICggeCApIC0+IHhcbiAgb3Blbl9zdHJlYW1fY291bnQgPSAwXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcmV0dXJuICQgKCBvdXRlcl9kYXRhLCBvdXRlcl9zZW5kLCBvdXRlcl9lbmQgKSA9PlxuICAgIGNvdW50ID0gMFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaWYgb3V0ZXJfZGF0YT9cbiAgICAgIG9wZW5fc3RyZWFtX2NvdW50ICAgICs9ICsxXG4gICAgICBzdWJfaW5wdXQgICAgICAgICAgICAgPSByZWFkIG91dGVyX2RhdGFcbiAgICAgIFsgbWVtbywgc3ViX2lucHV0LCBdICA9IGlmIENORC5pc2FfbGlzdCBzdWJfaW5wdXQgdGhlbiBzdWJfaW5wdXQgZWxzZSBbIEBfbWlzZml0LCBzdWJfaW5wdXQsIF1cbiAgICAgIHN1Yl9pbnB1dFxuICAgICAgICAjIC5waXBlIHRyYW5zZm9ybVxuICAgICAgICAucGlwZSBkbyA9PlxuICAgICAgICAgICMjIyBUQUlOVCBubyBuZWVkIHRvIGJ1aWxkIGJ1ZmZlciBpZiBub3QgYHNlbmRfZW1wdHlgIGFuZCB0aGVyZSBhcmUgbm8gcmVzdWx0cyAjIyNcbiAgICAgICAgICBidWZmZXIgPSBpZiBtZW1vIGlzIEBfbWlzZml0IHRoZW4gW10gZWxzZSBbIG1lbW8sIF1cbiAgICAgICAgICByZXR1cm4gJCAoIGlubmVyX2RhdGEsIF8sIGlubmVyX2VuZCApID0+XG4gICAgICAgICAgICBpZiBpbm5lcl9kYXRhP1xuICAgICAgICAgICAgICBpbm5lcl9kYXRhID0gbWFuZ2xlIGlubmVyX2RhdGFcbiAgICAgICAgICAgICAgaWYgaW5uZXJfZGF0YT9cbiAgICAgICAgICAgICAgICBjb3VudCArPSArMVxuICAgICAgICAgICAgICAgIGJ1ZmZlci5wdXNoIGlubmVyX2RhdGFcbiAgICAgICAgICAgIGlmIGlubmVyX2VuZD9cbiAgICAgICAgICAgICAgaWYgc2VuZF9lbXB0eSBvciBjb3VudCA+IDBcbiAgICAgICAgICAgICAgICBvdXRlcl9zZW5kIGluc2VydF9pbmRleCBidWZmZXJcbiAgICAgICAgICAgICAgb3Blbl9zdHJlYW1fY291bnQgKz0gLTFcbiAgICAgICAgICAgICAgaW5uZXJfZW5kKClcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGlmIG91dGVyX2VuZD9cbiAgICAgIHJlcGVhdF9pbW1lZGlhdGVseSAtPlxuICAgICAgICByZXR1cm4gdHJ1ZSB1bmxlc3Mgb3Blbl9zdHJlYW1fY291bnQgaXMgMFxuICAgICAgICBvdXRlcl9lbmQoKVxuICAgICAgICByZXR1cm4gZmFsc2VcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgS0VZUyAmIFZBTFVFU1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX2VuY29kZV9rZXkgPSAoIGRiLCBrZXksIGV4dHJhX2J5dGUgKSAtPlxuICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIGtleSAje3JwciBrZXl9XCIgaWYga2V5IGlzIHVuZGVmaW5lZFxuICByZXR1cm4gX2NvZGVjX2VuY29kZSBrZXksIGV4dHJhX2J5dGVcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX2RlY29kZV9rZXkgPSAoIGRiLCBrZXkgKSAtPlxuICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIGtleSAje3JwciBrZXl9XCIgaWYgKCBSID0gX2NvZGVjX2RlY29kZSBrZXkgKSBpcyB1bmRlZmluZWRcbiAgcmV0dXJuIFJcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX2VuY29kZV92YWx1ZSA9ICggZGIsIHZhbHVlICAgICAgKSAtPiBKU09OLnN0cmluZ2lmeSB2YWx1ZVxuQF9kZWNvZGVfdmFsdWUgPSAoIGRiLCB2YWx1ZV9iZnIgICkgLT4gSlNPTi5wYXJzZSAgICAgdmFsdWVfYmZyLnRvU3RyaW5nICd1dGYtOCdcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIyMgTkIgQXJndW1lbnQgb3JkZXJpbmcgZm9yIHRoZXNlIGZ1bmN0aW9uIGlzIGFsd2F5cyBzdWJqZWN0IGJlZm9yZSBvYmplY3QsIHJlZ2FyZGxlc3Mgb2YgdGhlIHBocmFzZXR5cGVcbmFuZCB0aGUgb3JkZXJpbmcgaW4gdGhlIHJlc3VsdGluZyBrZXkuICMjI1xuQG5ld19rZXkgPSAoIGRiLCBwaHJhc2V0eXBlLCBzaywgc3YsIG9rLCBvdiwgaWR4ICkgLT5cbiAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBwaHJhc2V0eXBlOiAje3JwciBwaHJhc2V0eXBlfVwiIHVubGVzcyBwaHJhc2V0eXBlIGluIFsgJ3NvJywgJ29zJywgXVxuICBbIHNrLCBzdiwgb2ssIG92LCBdID0gWyBvaywgb3YsIHNrLCBzdiwgXSBpZiBwaHJhc2V0eXBlIGlzICdvcydcbiAgcmV0dXJuIFsgcGhyYXNldHlwZSwgc2ssIHN2LCBvaywgb3YsICggaWR4ID8gMCApLCBdXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQG5ld19zb19rZXkgPSAoIGRiLCBQLi4uICkgLT4gQG5ld19rZXkgZGIsICdzbycsIFAuLi5cbkBuZXdfb3Nfa2V5ID0gKCBkYiwgUC4uLiApIC0+IEBuZXdfa2V5IGRiLCAnb3MnLCBQLi4uXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9uZXdfb3Nfa2V5X2Zyb21fc29fa2V5ID0gKCBkYiwgc29fa2V5ICkgLT5cbiAgWyBwaHJhc2V0eXBlLCBzaywgc3YsIG9rLCBvdiwgaWR4LCBdID0gQGFzX3BocmFzZSBkYiwgc29fa2V5XG4gIHRocm93IG5ldyBFcnJvciBcImV4cGVjdGVkIHBocmFzZXR5cGUgJ3NvJywgZ290ICN7cnByIHBocmFzZXR5cGV9XCIgdW5sZXNzIHBocmFzZXR5cGUgaXMgJ3NvJ1xuICByZXR1cm4gWyAnb3MnLCBvaywgb3YsIHNrLCBzdiwgaWR4LCBdXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQG5ld19rZXlzID0gKCBkYiwgcGhyYXNldHlwZSwgc2ssIHN2LCBvaywgb3YsIGlkeCApIC0+XG4gIG90aGVyX3BocmFzZXR5cGUgID0gaWYgcGhyYXNldHlwZSBpcyAnc28nIHRoZW4gJ29zJyBlbHNlICdzbydcbiAgcmV0dXJuIFtcbiAgICAoIEBuZXdfa2V5IGRiLCAgICAgICBwaHJhc2V0eXBlLCBzaywgc3YsIG9rLCBvdiwgaWR4ICksXG4gICAgKCBAbmV3X2tleSBkYiwgb3RoZXJfcGhyYXNldHlwZSwgc2ssIHN2LCBvaywgb3YsIGlkeCApLCBdXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQGFzX3BocmFzZSA9ICggZGIsIGtleSwgdmFsdWUgKSAtPlxuICBzd2l0Y2ggcGhyYXNldHlwZSA9IGtleVsgMCBdXG4gICAgd2hlbiAnc3BvJ1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBTUE8ga2V5IChsZW5ndGggI3tsZW5ndGh9KVwiIHVubGVzcyAoIGxlbmd0aCA9IGtleS5sZW5ndGggKSBpcyAzXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIHZhbHVlICgxKSAje3JwciB2YWx1ZX1cIiBpZiB2YWx1ZSBpbiBbIHVuZGVmaW5lZCwgXVxuICAgICAgcmV0dXJuIFsga2V5WyAxIF0sIGtleVsgMiBdLCB2YWx1ZSwgXVxuICAgIHdoZW4gJ3BvcydcbiAgICAgIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgUE9TIGtleSAobGVuZ3RoICN7bGVuZ3RofSlcIiB1bmxlc3MgNCA8PSAoIGxlbmd0aCA9IGtleS5sZW5ndGggKSA8PSA1XG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIHZhbHVlICgyKSAje3JwciB2YWx1ZX1cIiBpZiBub3QgKCB2YWx1ZSBpbiBbIG51bGwsIF0gKVxuICAgICAgWyBfLCBwcmQsIG9iaiwgc2JqLCBpZHgsIF0gPSBrZXlcbiAgICAgIHJldHVybiBpZiBpZHg/IHRoZW4gWyBzYmosIHByZCwgb2JqLCBpZHgsIF0gZWxzZSBbIHNiaiwgcHJkLCBvYmosIF1cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AJGFzX3BocmFzZSA9ICggZGIgKSAtPlxuICByZXR1cm4gJCAoIGRhdGEsIHNlbmQgKSA9PlxuICAgIHNlbmQgQGFzX3BocmFzZSBkYiwgZGF0YS4uLlxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBrZXlfZnJvbV91cmwgPSAoIGRiLCB1cmwgKSAtPlxuICAjIyMgVEFJTiBkb2VzIG5vdCB1bmVzY2FwZSBhcyB5ZXQgIyMjXG4gICMjIyBUQUlOIGRvZXMgbm90IGNhc3QgdmFsdWVzIGFzIHlldCAjIyNcbiAgIyMjIFRBSU5UIGRvZXMgbm90IHN1cHBvcnQgbXVsdGlwbGUgaW5kZXhlcyBhcyB5ZXQgIyMjXG4gIFsgcGhyYXNldHlwZSwgZmlyc3QsIHNlY29uZCwgaWR4LCBdID0gdXJsLnNwbGl0ICd8J1xuICB1bmxlc3MgcGhyYXNldHlwZT8gYW5kIHBocmFzZXR5cGUubGVuZ3RoID4gMCBhbmQgcGhyYXNldHlwZSBpbiBbICdzbycsICdvcycsIF1cbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIFVSTCBrZXkgI3tycHIgdXJsfVwiXG4gIHVubGVzcyBmaXJzdD8gYW5kIGZpcnN0Lmxlbmd0aCA+IDAgYW5kIHNlY29uZD8gYW5kIHNlY29uZC5sZW5ndGggPiAwXG4gICAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBVUkwga2V5ICN7cnByIHVybH1cIlxuICBpZHggPSBpZiAoIGlkeD8gYW5kIGlkeC5sZW5ndGggPiAwICkgdGhlbiAoIHBhcnNlSW50IGlkeCwgMTAgKSBlbHNlIDBcbiAgWyBzaywgc3YsIF0gPSAgZmlyc3Quc3BsaXQgJzonXG4gIFsgb2ssIG92LCBdID0gc2Vjb25kLnNwbGl0ICc6J1xuICB1bmxlc3Mgc2s/IGFuZCBzay5sZW5ndGggPiAwIGFuZCBvaz8gYW5kIG9rLmxlbmd0aCA+IDBcbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIFVSTCBrZXkgI3tycHIgdXJsfVwiXG4gIFsgc2ssIHN2LCBvaywgb3YsIF0gPSBbIG9rLCBvdiwgc2ssIHN2LCBdIGlmIHBocmFzZXR5cGUgaXMgJ29zJ1xuICByZXR1cm4gWyBwaHJhc2V0eXBlLCBzaywgc3YsIG9rLCBvdiwgaWR4LCBdXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQHVybF9mcm9tX2tleSA9ICggZGIsIGtleSApIC0+XG4gIGlmICggQF90eXBlX2Zyb21fa2V5IGRiLCBrZXkgKSBpcyAnbGlzdCdcbiAgICBbIHBocmFzZXR5cGUsIGswLCB2MCwgazEsIHYxLCBpZHgsIF0gPSBrZXlcbiAgICBpZHhfcnByID0gaWYgaWR4PyB0aGVuIHJwciBpZHggZWxzZSAnJ1xuICAgICMjIyBUQUlOVCBzaG91bGQgZXNjYXBlIG1ldGFjaHJzIGB8YCwgJzonICMjI1xuICAgICMjIyBUQUlOVCBzaG91bGQgdXNlIGBycHJgIG9uIHBhcnRzIG9mIHNwZWVjaCAoZS5nLiBvYmplY3QgdmFsdWUgY291bGQgYmUgYSBudW1iZXIgZXRjLikgIyMjXG4gICAgcmV0dXJuIFwiI3twaHJhc2V0eXBlfXwje2swfToje3YwfXwje2sxfToje3YxfXwje2lkeF9ycHJ9XCJcbiAgcmV0dXJuIFwiI3tycHIga2V5fVwiXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQCR1cmxfZnJvbV9rZXkgPSAoIGRiICkgLT4gJCAoIGtleSwgc2VuZCApID0+IHNlbmQgQHVybF9mcm9tX2tleSBkYiwga2V5XG5AJGtleV9mcm9tX3VybCA9ICggZGIgKSAtPiAkICggdXJsLCBzZW5kICkgPT4gc2VuZCBAa2V5X2Zyb21fdXJsIGRiLCBrZXlcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX3R5cGVfZnJvbV9rZXkgPSAoIGRiLCBrZXkgKSAtPlxuICBpZiBBcnJheS5pc0FycmF5IGtleVxuICAgIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwga2V5OiAje3JwciBrZXl9XCIgdW5sZXNzIGtleS5sZW5ndGggaXMgNlxuICAgIFsgcGhyYXNldHlwZSwgZmlyc3QsIHNlY29uZCwgaWR4LCBdID0ga2V5XG4gICAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBwaHJhc2V0eXBlOiAje3JwciBrZXl9XCIgdW5sZXNzIHBocmFzZXR5cGUgaW4gWyAnc28nLCAnb3MnLCBdXG4gICAgcmV0dXJuICdsaXN0J1xuICByZXR1cm4gJ290aGVyJ1xuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyBQUkVGSVhFUyAmIFFVRVJJRVNcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9xdWVyeV9mcm9tX3ByZWZpeCA9ICggZGIsIGxvX2hpbnQgKSAtPlxuICBiYXNlICA9IEBfZW5jb2RlX2tleSBkYiwgbG9faGludCwgMHhmZlxuICBndGUgICA9IGJhc2Uuc2xpY2UgMCwgYmFzZS5sZW5ndGggLSAxXG4gIGx0ZSAgID0gYmFzZS5zbGljZSAwLCBiYXNlLmxlbmd0aFxuICByZXR1cm4geyBndGUsIGx0ZSwgfVxuXG5cblxuXG5cbiJdfQ==