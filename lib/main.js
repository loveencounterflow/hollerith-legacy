(function() {
  var $, CND, CODEC, D, DUMP, LODASH, _codec_decode, _codec_encode, _new_level_db, badge, debug, echo, help, leveldown, log, repeat_immediately, rpr, step, suspend, urge, warn, whisper,
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

  this.$write = function(db, settings) {

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
    var R, _send, batch_count, buffer, buffer_size, flush, has_ended, push, ref, ref1, solid_predicates, substrate;
    if (settings == null) {
      settings = {};
    }
    buffer_size = (ref = settings['batch']) != null ? ref : 10000;
    solid_predicates = (ref1 = settings['solids']) != null ? ref1 : [];
    buffer = [];
    substrate = db['%self'];
    batch_count = 0;
    has_ended = false;
    _send = null;
    R = D.create_throughstream();
    if (!(buffer_size > 0)) {
      throw new Error("buffer size must be positive integer, got " + (rpr(buffer_size)));
    }
    push = (function(_this) {
      return function(key, value) {
        var key_bfr, value_bfr;
        key_bfr = _this._encode_key(db, key);
        value_bfr = value != null ? _this._encode_value(db, value) : _this._zero_value_bfr;
        return buffer.push({
          type: 'put',
          key: key_bfr,
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
    R = R.pipe($((function(_this) {
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
            if (indexOf.call(solid_predicates, prd) >= 0) {
              push(['pos', prd, obj, sbj]);
            } else {

              /* Create one index entry for each element in case `obj` is a list: */
              for (obj_idx = i = 0, len = obj.length; i < len; obj_idx = ++i) {
                obj_element = obj[obj_idx];
                push(['pos', prd, obj_element, sbj, obj_idx]);
              }
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
    })(this))).pipe(this._$ensure_unique(db));
    return R;
  };

  this._$ensure_unique = function(db) {
    var Bloom, bloom;
    Bloom = require('bloom-stream');

    /* Bloom.forCapacity(capacity, errorRate, seed, hashType, streamOpts) */
    bloom = Bloom.forCapacity(1e1, 1);
    return $(function(data, send) {
      var key_bfr;
      if (data['type'] !== 'put') {
        send.error(new Error("unexpected data: " + (rpr(data))));
      }
      debug('©38dZl', data);
      key_bfr = data['key'];
      if (!bloom.has(key_bfr)) {
        return send(data);
      }
    });
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
        return send([_this._decode_key(db, key), _this._decode_value(db, value)]);
      };
    })(this)));
    R['%meta'] = {};
    R['%meta']['query'] = query;
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

//# sourceMappingURL=data:application/json;base64,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QUFpQixPQUFqQixFQUEwQixLQUFPLENBQUEsYUFBQSxDQUFrQixDQUFBLElBQUEsQ0FBbkQsQ0FEUixDQUFBO0FBQUEsTUFFQSxHQUFBLEdBQVEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFYLEVBQWMsSUFBSSxDQUFDLE1BQUwsR0FBYyxDQUE1QixDQUZSLENBQUE7QUFBQSxNQUdBLEdBQUEsR0FBUSxJQUFJLENBQUMsS0FBTCxDQUFXLENBQVgsRUFBYyxJQUFJLENBQUMsTUFBbkIsQ0FIUixDQVBGO0tBQUE7QUFXQSxXQUFPO0FBQUEsTUFBRSxLQUFBLEdBQUY7QUFBQSxNQUFPLEtBQUEsR0FBUDtLQUFQLENBYm9CO0VBQUEsQ0E5WnRCLENBQUE7QUFBQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiXG5cblxuIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4jIG5qc191dGlsICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICd1dGlsJ1xuIyBuanNfcGF0aCAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAncGF0aCdcbiMgbmpzX2ZzICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2ZzJ1xuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5DTkQgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnY25kJ1xucnByICAgICAgICAgICAgICAgICAgICAgICA9IENORC5ycHJcbmJhZGdlICAgICAgICAgICAgICAgICAgICAgPSAnSE9MTEVSSVRIL21haW4nXG5sb2cgICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3BsYWluJywgICAgIGJhZGdlXG5kZWJ1ZyAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ2RlYnVnJywgICAgIGJhZGdlXG53YXJuICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3dhcm4nLCAgICAgIGJhZGdlXG5oZWxwICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ2hlbHAnLCAgICAgIGJhZGdlXG51cmdlICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3VyZ2UnLCAgICAgIGJhZGdlXG53aGlzcGVyICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3doaXNwZXInLCAgIGJhZGdlXG5lY2hvICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmVjaG8uYmluZCBDTkRcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuc3VzcGVuZCAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2NvZmZlZW5vZGUtc3VzcGVuZCdcbnN0ZXAgICAgICAgICAgICAgICAgICAgICAgPSBzdXNwZW5kLnN0ZXBcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuQ09ERUMgICAgICAgICAgICAgICAgICAgICA9IEBDT0RFQyA9IHJlcXVpcmUgJy4vY29kZWMnXG5EVU1QICAgICAgICAgICAgICAgICAgICAgID0gQERVTVAgID0gcmVxdWlyZSAnLi9kdW1wJ1xuX2NvZGVjX2VuY29kZSAgICAgICAgICAgICA9IENPREVDLmVuY29kZS5iaW5kIENPREVDXG5fY29kZWNfZGVjb2RlICAgICAgICAgICAgID0gQ09ERUMuZGVjb2RlLmJpbmQgQ09ERUNcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuRCAgICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ3BpcGVkcmVhbXMyJ1xuJCAgICAgICAgICAgICAgICAgICAgICAgICA9IEQucmVtaXQuYmluZCBEXG5fbmV3X2xldmVsX2RiICAgICAgICAgICAgID0gcmVxdWlyZSAnbGV2ZWwnXG5sZXZlbGRvd24gICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbGV2ZWwvbm9kZV9tb2R1bGVzL2xldmVsZG93bidcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuc3VzcGVuZCAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2NvZmZlZW5vZGUtc3VzcGVuZCdcbnN0ZXAgICAgICAgICAgICAgICAgICAgICAgPSBzdXNwZW5kLnN0ZXBcbnJlcGVhdF9pbW1lZGlhdGVseSAgICAgICAgPSBzdXNwZW5kLnJlcGVhdF9pbW1lZGlhdGVseVxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5MT0RBU0ggICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbG9kYXNoJ1xuXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQHBocmFzZXR5cGVzICAgICAgPSBbICdwb3MnLCAnc3BvJywgXVxuQF9taXNmaXQgICAgICAgICAgPSBTeW1ib2wgJ21pc2ZpdCdcbkBfemVyb192YWx1ZV9iZnIgID0gbmV3IEJ1ZmZlciAnbnVsbCdcbiMgd2FybiBcIm1pbmQgaW5jb25zaXN0ZW5jaWVzIGluIEhPTExFUklUSDIvbWFpbiBAX3plcm9fZW5jIGV0Y1wiXG4jIEBfemVybyAgICAgICAgICAgID0gdHJ1ZSAjID8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/XG4jIEBfemVyb19lbmMgICAgICAgID0gX2NvZGVjX2VuY29kZSBbIEBfemVybywgICAgXVxuIyBAX2xvX2VuYyAgICAgICAgICA9IF9jb2RlY19lbmNvZGUgWyBudWxsLCAgICAgIF1cbiMgQF9oaV9lbmMgICAgICAgICAgPSBfY29kZWNfZW5jb2RlIFsgQ09ERUMuLCBdXG4jIEBfbGFzdF9vY3RldCAgICAgID0gbmV3IEJ1ZmZlciBbIDB4ZmYsIF1cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AbmV3X2RiID0gKCByb3V0ZSApIC0+XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgbGV2ZWxfc2V0dGluZ3MgPVxuICAgICdrZXlFbmNvZGluZyc6ICAgICAgICAgICdiaW5hcnknXG4gICAgJ3ZhbHVlRW5jb2RpbmcnOiAgICAgICAgJ2JpbmFyeSdcbiAgICAnY3JlYXRlSWZNaXNzaW5nJzogICAgICB0cnVlXG4gICAgJ2Vycm9ySWZFeGlzdHMnOiAgICAgICAgZmFsc2VcbiAgICAnY29tcHJlc3Npb24nOiAgICAgICAgICB5ZXNcbiAgICAnc3luYyc6ICAgICAgICAgICAgICAgICBub1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHN1YnN0cmF0ZSAgICAgICAgICAgPSBfbmV3X2xldmVsX2RiIHJvdXRlLCBsZXZlbF9zZXR0aW5nc1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIFIgPVxuICAgICd+aXNhJzogICAgICAgICAgICdIT0xMRVJJVEgvZGInXG4gICAgJyVzZWxmJzogICAgICAgICAgc3Vic3RyYXRlXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcmV0dXJuIFJcblxuIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQF9yZW9wZW4gPSAoIGRiLCBoYW5kbGVyICkgLT5cbiMgICBzdGVwICggcmVzdW1lICkgPT5cbiMgICAgIHJvdXRlID0gZGJbICclc2VsZicgXVsgJ2xvY2F0aW9uJyBdXG4jICAgICB5aWVsZCBkYlsgJyVzZWxmJyBdLmNsb3NlIHJlc3VtZVxuIyAgICAgeWllbGQgZGJbICclc2VsZicgXS5vcGVuIHJlc3VtZVxuIyAgICAgd2hpc3BlciBcInJlLW9wZW5lZCBMZXZlbERCIGF0ICN7cm91dGV9XCJcbiMgICAgIGhhbmRsZXIgbnVsbFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBjbGVhciA9ICggZGIsIGhhbmRsZXIgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICByb3V0ZSA9IGRiWyAnJXNlbGYnIF1bICdsb2NhdGlvbicgXVxuICAgIHlpZWxkIGRiWyAnJXNlbGYnIF0uY2xvc2UgcmVzdW1lXG4gICAgeWllbGQgbGV2ZWxkb3duLmRlc3Ryb3kgcm91dGUsIHJlc3VtZVxuICAgIHlpZWxkIGRiWyAnJXNlbGYnIF0ub3BlbiByZXN1bWVcbiAgICAjIGhlbHAgXCJlcmFzZWQgYW5kIHJlLW9wZW5lZCBMZXZlbERCIGF0ICN7cm91dGV9XCJcbiAgICBoYW5kbGVyIG51bGxcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgV1JJVElOR1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AJHdyaXRlID0gKCBkYiwgc2V0dGluZ3MgKSAtPlxuICAjIyMgRXhwZWN0cyBhIEhvbGxlcml0aCBEQiBvYmplY3QgYW5kIGFuIG9wdGlvbmFsIGJ1ZmZlciBzaXplOyByZXR1cm5zIGEgc3RyZWFtIHRyYW5zZm9ybWVyIHRoYXQgZG9lcyBhbGxcbiAgb2YgdGhlIGZvbGxvd2luZzpcblxuICAqIEl0IGV4cGVjdHMgYW4gU08ga2V5IGZvciB3aGljaCBpdCB3aWxsIGdlbmVyYXRlIGEgY29ycmVzcG9uZGluZyBPUyBrZXkuXG4gICogQSBjb3JyZXNwb25kaW5nIE9TIGtleSBpcyBmb3JtdWxhdGVkIGV4Y2VwdCB3aGVuIHRoZSBTTyBrZXkncyBvYmplY3QgdmFsdWUgaXMgYSBKUyBvYmplY3QgLyBhIFBPRCAoc2luY2VcbiAgICBpbiB0aGF0IGNhc2UsIHRoZSB2YWx1ZSBzZXJpYWxpemF0aW9uIGlzIGpvbGx5IHVzZWxlc3MgYXMgYW4gaW5kZXgpLlxuICAqIEl0IHNlbmRzIG9uIGJvdGggdGhlIFNPIGFuZCB0aGUgT1Mga2V5IGRvd25zdHJlYW0gZm9yIG9wdGlvbmFsIGZ1cnRoZXIgcHJvY2Vzc2luZy5cbiAgKiBJdCBmb3JtcyBhIHByb3BlciBgbm9kZS1sZXZlbGAtY29tcGF0aWJsZSBiYXRjaCByZWNvcmQgZm9yIGVhY2gga2V5IGFuZCBjb2xsZWN0IGFsbCByZWNvcmRzXG4gICAgaW4gYSBidWZmZXIuXG4gICogV2hlbmV2ZXIgdGhlIGJ1ZmZlciBoYXMgb3V0Z3Jvd24gdGhlIGdpdmVuIGJ1ZmZlciBzaXplLCB0aGUgYnVmZmVyIHdpbGwgYmUgd3JpdHRlbiBpbnRvIHRoZSBEQiB1c2luZ1xuICAgIGBsZXZlbHVwYCdzIGBiYXRjaGAgY29tbWFuZC5cbiAgKiBXaGVuIHRoZSBsYXN0IHBlbmRpbmcgYmF0Y2ggaGFzIGJlZW4gd3JpdHRlbiBpbnRvIHRoZSBEQiwgdGhlIGBlbmRgIGV2ZW50IGlzIGNhbGxlZCBvbiB0aGUgc3RyZWFtXG4gICAgYW5kIG1heSBiZSBkZXRlY3RlZCBkb3duc3RyZWFtLlxuXG4gICMjI1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHNldHRpbmdzICAgICAgICAgPz0ge31cbiAgYnVmZmVyX3NpemUgICAgICAgPSBzZXR0aW5nc1sgJ2JhdGNoJyAgXSA/IDEwMDAwXG4gIHNvbGlkX3ByZWRpY2F0ZXMgID0gc2V0dGluZ3NbICdzb2xpZHMnIF0gPyBbXVxuICBidWZmZXIgICAgICAgICAgICA9IFtdXG4gIHN1YnN0cmF0ZSAgICAgICAgID0gZGJbICclc2VsZicgXVxuICBiYXRjaF9jb3VudCAgICAgICA9IDBcbiAgaGFzX2VuZGVkICAgICAgICAgPSBub1xuICBfc2VuZCAgICAgICAgICAgICA9IG51bGxcbiAgUiAgICAgICAgICAgICAgICAgPSBELmNyZWF0ZV90aHJvdWdoc3RyZWFtKClcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICB0aHJvdyBuZXcgRXJyb3IgXCJidWZmZXIgc2l6ZSBtdXN0IGJlIHBvc2l0aXZlIGludGVnZXIsIGdvdCAje3JwciBidWZmZXJfc2l6ZX1cIiB1bmxlc3MgYnVmZmVyX3NpemUgPiAwXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcHVzaCA9ICgga2V5LCB2YWx1ZSApID0+XG4gICAga2V5X2JmciAgID0gQF9lbmNvZGVfa2V5IGRiLCBrZXlcbiAgICB2YWx1ZV9iZnIgPSBpZiB2YWx1ZT8gdGhlbiBAX2VuY29kZV92YWx1ZSBkYiwgdmFsdWUgZWxzZSBAX3plcm9fdmFsdWVfYmZyXG4gICAgYnVmZmVyLnB1c2ggeyB0eXBlOiAncHV0Jywga2V5OiBrZXlfYmZyLCB2YWx1ZTogdmFsdWVfYmZyLCB9XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZmx1c2ggPSA9PlxuICAgIGlmIGJ1ZmZlci5sZW5ndGggPiAwXG4gICAgICBiYXRjaF9jb3VudCArPSArMVxuICAgICAgc3Vic3RyYXRlLmJhdGNoIGJ1ZmZlciwgKCBlcnJvciApID0+XG4gICAgICAgIHRocm93IGVycm9yIGlmIGVycm9yP1xuICAgICAgICBiYXRjaF9jb3VudCArPSAtMVxuICAgICAgICBfc2VuZC5lbmQoKSBpZiBoYXNfZW5kZWQgYW5kIGJhdGNoX2NvdW50IDwgMVxuICAgICAgYnVmZmVyID0gW11cbiAgICBlbHNlXG4gICAgICBfc2VuZC5lbmQoKVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIFIgPSBSXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAucGlwZSAkICggc3BvLCBzZW5kLCBlbmQgKSA9PlxuICAgICAgX3NlbmQgPSBzZW5kXG4gICAgICBpZiBzcG8/XG4gICAgICAgIFsgc2JqLCBwcmQsIG9iaiwgXSA9IHNwb1xuICAgICAgICBwdXNoIFsgJ3NwbycsIHNiaiwgcHJkLCBdLCBvYmpcbiAgICAgICAgIyMjIFRBSU5UIHdoYXQgdG8gc2VuZCwgaWYgYW55dGhpbmc/ICMjI1xuICAgICAgICAjIHNlbmQgZW50cnlcbiAgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgICBpZiBDTkQuaXNhX3BvZCBvYmpcbiAgICAgICAgICAjIyMgRG8gbm90IGNyZWF0ZSBpbmRleCBlbnRyaWVzIGluIGNhc2UgYG9iamAgaXMgYSBQT0Q6ICMjI1xuICAgICAgICAgIG51bGxcbiAgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgICBlbHNlIGlmIENORC5pc2FfbGlzdCBvYmpcbiAgICAgICAgICBpZiBwcmQgaW4gc29saWRfcHJlZGljYXRlc1xuICAgICAgICAgICAgcHVzaCBbICdwb3MnLCBwcmQsIG9iaiwgc2JqLCBdXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgIyMjIENyZWF0ZSBvbmUgaW5kZXggZW50cnkgZm9yIGVhY2ggZWxlbWVudCBpbiBjYXNlIGBvYmpgIGlzIGEgbGlzdDogIyMjXG4gICAgICAgICAgICBmb3Igb2JqX2VsZW1lbnQsIG9ial9pZHggaW4gb2JqXG4gICAgICAgICAgICAgIHB1c2ggWyAncG9zJywgcHJkLCBvYmpfZWxlbWVudCwgc2JqLCBvYmpfaWR4LCBdXG4gICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgICAgZWxzZVxuICAgICAgICAgICMjIyBDcmVhdGUgb25lIGluZGV4IGVudHJ5IGZvciBgb2JqYCBvdGhlcndpc2U6ICMjI1xuICAgICAgICAgIHB1c2ggWyAncG9zJywgcHJkLCBvYmosIHNiaiwgXVxuICAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAgIGZsdXNoKCkgaWYgYnVmZmVyLmxlbmd0aCA+PSBidWZmZXJfc2l6ZVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAjIyMgRmx1c2ggcmVtYWluaW5nIGJ1ZmZlcmVkIGVudHJpZXMgdG8gREIgIyMjXG4gICAgICBpZiBlbmQ/XG4gICAgICAgIGhhc19lbmRlZCA9IHllc1xuICAgICAgICBmbHVzaCgpXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAucGlwZSBAXyRlbnN1cmVfdW5pcXVlIGRiXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcmV0dXJuIFJcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AXyRlbnN1cmVfdW5pcXVlID0gKCBkYiApIC0+XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgQmxvb20gICA9IHJlcXVpcmUgJ2Jsb29tLXN0cmVhbSdcbiAgIyMjIEJsb29tLmZvckNhcGFjaXR5KGNhcGFjaXR5LCBlcnJvclJhdGUsIHNlZWQsIGhhc2hUeXBlLCBzdHJlYW1PcHRzKSAjIyNcbiAgYmxvb20gICA9IEJsb29tLmZvckNhcGFjaXR5IDFlMSwgMVxuICByZXR1cm4gJCAoIGRhdGEsIHNlbmQgKSAtPlxuICAgIHNlbmQuZXJyb3IgbmV3IEVycm9yIFwidW5leHBlY3RlZCBkYXRhOiAje3JwciBkYXRhfVwiIHVubGVzcyBkYXRhWyAndHlwZScgXSBpcyAncHV0J1xuICAgIGRlYnVnICfCqTM4ZFpsJywgZGF0YVxuICAgIGtleV9iZnIgPSBkYXRhWyAna2V5JyBdXG4gICAgcmV0dXJuIHNlbmQgZGF0YSB1bmxlc3MgYmxvb20uaGFzIGtleV9iZnJcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIFJFQURJTkdcbiMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEBjcmVhdGVfa2V5c3RyZWFtID0gKCBkYiwgbG9faGludCA9IG51bGwsIGhpX2hpbnQgPSBudWxsICkgLT5cbiMgICAjIyMgVEFJTlQgY29kZSBkdXBsaWNhdGlvbiAjIyNcbiMgICBpZiBsb19oaW50P1xuIyAgICAgaWYgaGlfaGludD9cbiMgICAgICAgcXVlcnkgPSB7IGd0ZTogbG9faGludCwgbHRlOmhpX2hpbnQsIH1cbiMgICAgIGVsc2VcbiMgICAgICAgcXVlcnkgPSB7IGd0ZTogbG9faGludCwgfVxuIyAgIGVsc2UgaWYgaGlfaGludD9cbiMgICAgIHF1ZXJ5ID0geyBsdGU6IGhpX2hpbnQsIH1cbiMgICBlbHNlXG4jICAgICBxdWVyeSA9IG51bGxcbiMgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgZGVidWcgJ8KpODM1SlAnLCBxdWVyeVxuIyAgIFIgPSBpZiBxdWVyeT8gdGhlbiAoIGRiWyAnJXNlbGYnIF0uY3JlYXRlS2V5U3RyZWFtIHF1ZXJ5ICkgZWxzZSBkYlsgJyVzZWxmJyBdLmNyZWF0ZUtleVN0cmVhbSgpXG4jICAgIyBSID0gZGJbICclc2VsZicgXS5jcmVhdGVLZXlTdHJlYW0gQG5ld19xdWVyeSBkYiwgcXVlcnlcbiMgICAjIyMgVEFJTlQgU2hvdWxkIHdlIHRlc3QgZm9yIHdlbGwtZm9ybWVkIGVudHJpZXMgaGVyZT8gIyMjXG4jICAgUiA9IFIucGlwZSAkICggYmtleSwgc2VuZCApID0+IHNlbmQgQF9kZWNvZGVfa2V5IGRiLCBia2V5XG4jICAgcmV0dXJuIFJcblxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBjcmVhdGVfcGhyYXNlc3RyZWFtID0gKCBkYiwgbG9faGludCA9IG51bGwsIGhpX2hpbnQgPSBudWxsLCBzZXR0aW5ncyApIC0+XG4gIGlucHV0ID0gQGNyZWF0ZV9mYWNldHN0cmVhbSBkYiwgbG9faGludCwgaGlfaGludCwgc2V0dGluZ3NcbiAgUiA9IGlucHV0XG4gICAgLnBpcGUgQCRhc19waHJhc2UgZGJcbiAgUlsgJyVtZXRhJyBdID0gaW5wdXRbICclbWV0YScgXVxuICByZXR1cm4gUlxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBjcmVhdGVfZmFjZXRzdHJlYW0gPSAoIGRiLCBsb19oaW50ID0gbnVsbCwgaGlfaGludCA9IG51bGwsIHNldHRpbmdzICkgLT5cbiAgIyMjXG4gICogSWYgbmVpdGVyIGBsb2Agbm9yIGBoaWAgaXMgZ2l2ZW4sIHRoZSBzdHJlYW0gd2lsbCBpdGVyYXRlIG92ZXIgYWxsIGVudHJpZXMuXG4gICogSWYgYm90aCBgbG9gIGFuZCBgaGlgIGFyZSBnaXZlbiwgYSBxdWVyeSB3aXRoIGxvd2VyIGFuZCB1cHBlciwgaW5jbHVzaXZlIGJvdW5kYXJpZXMgaXNcbiAgICBpc3N1ZWQuXG4gICogSWYgb25seSBgbG9gIGlzIGdpdmVuLCBhIHByZWZpeCBxdWVyeSBpcyBpc3N1ZWQuXG4gICogSWYgYGhpYCBpcyBnaXZlbiBidXQgYGxvYCBpcyBtaXNzaW5nLCBhbiBlcnJvciBpcyBpc3N1ZWQuXG4gICMjI1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGlmIGhpX2hpbnQ/IGFuZCBub3QgbG9faGludD9cbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJtdXN0IGdpdmUgYGxvX2hpbnRgIHdoZW4gYGhpX2hpbnRgIGlzIGdpdmVuXCJcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBpZiBsb19oaW50PyBhbmQgbm90IGhpX2hpbnQ/XG4gICAgcXVlcnkgICAgICAgPSBAX3F1ZXJ5X2Zyb21fcHJlZml4IGRiLCBsb19oaW50XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZWxzZSBpZiBsb19oaW50PyBhbmQgaGlfaGludCBpcyAnKidcbiAgICBxdWVyeSAgICAgICA9IEBfcXVlcnlfZnJvbV9wcmVmaXggZGIsIGxvX2hpbnQsICcqJ1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGVsc2VcbiAgICBsb19oaW50X2JmciA9IGlmIGxvX2hpbnQ/IHRoZW4gKCAgICAgICAgQF9lbmNvZGVfa2V5IGRiLCBsb19oaW50ICkgICAgICAgICAgZWxzZSBudWxsXG4gICAgaGlfaGludF9iZnIgPSBpZiBoaV9oaW50PyB0aGVuICggQF9xdWVyeV9mcm9tX3ByZWZpeCBkYiwgaGlfaGludCApWyAnbHRlJyBdIGVsc2UgbnVsbFxuICAgICMgbG9faGludF9iZnIgPSBpZiBsb19oaW50PyB0aGVuICggICAgICAgIEBfZW5jb2RlX2tleSBkYiwgbG9faGludCApICAgICAgICAgIGVsc2UgQ09ERUNbICdrZXlzJyBdWyAnbG8nIF1cbiAgICAjIGhpX2hpbnRfYmZyID0gaWYgaGlfaGludD8gdGhlbiAoIEBfcXVlcnlfZnJvbV9wcmVmaXggZGIsIGhpX2hpbnQgKVsgJ2x0ZScgXSBlbHNlIENPREVDWyAna2V5cycgXVsgJ2hpJyBdXG4gICAgcXVlcnkgICAgICAgPSB7IGd0ZTogbG9faGludF9iZnIsIGx0ZTogaGlfaGludF9iZnIsIH1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAjIyMgVEFJTlQgU2hvdWxkIHdlIHRlc3QgZm9yIHdlbGwtZm9ybWVkIGVudHJpZXMgaGVyZT8gIyMjXG4gIFIgPSBkYlsgJyVzZWxmJyBdLmNyZWF0ZVJlYWRTdHJlYW0gcXVlcnlcbiAgUiA9IFIucGlwZSAkICggeyBrZXksIHZhbHVlIH0sIHNlbmQgKSA9PiBzZW5kIFsgKCBAX2RlY29kZV9rZXkgZGIsIGtleSApLCAoIEBfZGVjb2RlX3ZhbHVlIGRiLCB2YWx1ZSApLCBdXG4gIFJbICclbWV0YScgXSA9IHt9XG4gIFJbICclbWV0YScgXVsgJ3F1ZXJ5JyBdID0gcXVlcnlcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICByZXR1cm4gUlxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkByZWFkX21hbnkgPSAoIGRiLCBoaW50ID0gbnVsbCApIC0+XG4gICMjIyBIaW50cyBhcmUgaW50ZXJwcmV0ZWQgYXMgcGFydGlhbCBzZWNvbmRhcnkgKFBPUykga2V5cy4gIyMjXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQHJlYWRfb25lID0gKCBkYiwga2V5LCBmYWxsYmFjayA9IEBfbWlzZml0LCBoYW5kbGVyICkgLT5cbiAgIyMjIEhpbnRzIGFyZSBpbnRlcnByZXRlZCBhcyBjb21wbGV0ZSBwcmltYXJ5IChTUE8pIGtleXMuICMjI1xuICBzd2l0Y2ggYXJpdHkgPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgd2hlbiAzXG4gICAgICBoYW5kbGVyICAgPSBmYWxsYmFja1xuICAgICAgZmFsbGJhY2sgID0gQF9taXNmaXRcbiAgICB3aGVuIDQgdGhlbiBudWxsXG4gICAgZWxzZSB0aHJvdyBuZXcgRXJyb3IgXCJleHBlY3RlZCAzIG9yIDQgYXJndW1lbnRzLCBnb3QgI3thcml0eX1cIlxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGRiWyAnJXNlbGYnIF0uZ2V0IGtleSwgaGFuZGxlclxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkByZWFkX3N1YiA9ICggZGIsIHNldHRpbmdzLCByZWFkICkgLT5cbiAgc3dpdGNoIGFyaXR5ID0gYXJndW1lbnRzLmxlbmd0aFxuICAgIHdoZW4gMlxuICAgICAgcmVhZCAgICAgID0gc2V0dGluZ3NcbiAgICAgIHNldHRpbmdzICA9IG51bGxcbiAgICB3aGVuIDNcbiAgICAgIG51bGxcbiAgICBlbHNlXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJleHBlY3RlZCAyIG9yIDMgYXJndW1lbnRzLCBnb3QgI3thcml0eX1cIlxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGluZGV4ZWQgICAgICAgICAgID0gc2V0dGluZ3M/WyAnaW5kZXhlZCcgICAgXSA/IG5vXG4gICMgdHJhbnNmb3JtICAgICAgICAgPSBzZXR0aW5ncz9bICd0cmFuc2Zvcm0nICBdID8gRC4kcGFzc190aHJvdWdoKClcbiAgbWFuZ2xlICAgICAgICAgICAgPSBzZXR0aW5ncz9bICdtYW5nbGUnICAgICBdID8gKCBkYXRhICkgLT4gZGF0YVxuICBzZW5kX2VtcHR5ICAgICAgICA9IHNldHRpbmdzP1sgJ2VtcHR5JyAgICAgIF0gPyBub1xuICBpbnNlcnRfaW5kZXggICAgICA9IGlmIGluZGV4ZWQgdGhlbiBELm5ld19pbmRleGVyKCkgZWxzZSAoIHggKSAtPiB4XG4gIG9wZW5fc3RyZWFtX2NvdW50ID0gMFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHJldHVybiAkICggb3V0ZXJfZGF0YSwgb3V0ZXJfc2VuZCwgb3V0ZXJfZW5kICkgPT5cbiAgICBjb3VudCA9IDBcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGlmIG91dGVyX2RhdGE/XG4gICAgICBvcGVuX3N0cmVhbV9jb3VudCAgICArPSArMVxuICAgICAgc3ViX2lucHV0ICAgICAgICAgICAgID0gcmVhZCBvdXRlcl9kYXRhXG4gICAgICBbIG1lbW8sIHN1Yl9pbnB1dCwgXSAgPSBpZiBDTkQuaXNhX2xpc3Qgc3ViX2lucHV0IHRoZW4gc3ViX2lucHV0IGVsc2UgWyBAX21pc2ZpdCwgc3ViX2lucHV0LCBdXG4gICAgICBzdWJfaW5wdXRcbiAgICAgICAgIyAucGlwZSB0cmFuc2Zvcm1cbiAgICAgICAgLnBpcGUgZG8gPT5cbiAgICAgICAgICAjIyMgVEFJTlQgbm8gbmVlZCB0byBidWlsZCBidWZmZXIgaWYgbm90IGBzZW5kX2VtcHR5YCBhbmQgdGhlcmUgYXJlIG5vIHJlc3VsdHMgIyMjXG4gICAgICAgICAgYnVmZmVyID0gaWYgbWVtbyBpcyBAX21pc2ZpdCB0aGVuIFtdIGVsc2UgWyBtZW1vLCBdXG4gICAgICAgICAgcmV0dXJuICQgKCBpbm5lcl9kYXRhLCBfLCBpbm5lcl9lbmQgKSA9PlxuICAgICAgICAgICAgaWYgaW5uZXJfZGF0YT9cbiAgICAgICAgICAgICAgaW5uZXJfZGF0YSA9IG1hbmdsZSBpbm5lcl9kYXRhXG4gICAgICAgICAgICAgIGlmIGlubmVyX2RhdGE/XG4gICAgICAgICAgICAgICAgY291bnQgKz0gKzFcbiAgICAgICAgICAgICAgICBidWZmZXIucHVzaCBpbm5lcl9kYXRhXG4gICAgICAgICAgICBpZiBpbm5lcl9lbmQ/XG4gICAgICAgICAgICAgIGlmIHNlbmRfZW1wdHkgb3IgY291bnQgPiAwXG4gICAgICAgICAgICAgICAgb3V0ZXJfc2VuZCBpbnNlcnRfaW5kZXggYnVmZmVyXG4gICAgICAgICAgICAgIG9wZW5fc3RyZWFtX2NvdW50ICs9IC0xXG4gICAgICAgICAgICAgIGlubmVyX2VuZCgpXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpZiBvdXRlcl9lbmQ/XG4gICAgICByZXBlYXRfaW1tZWRpYXRlbHkgLT5cbiAgICAgICAgcmV0dXJuIHRydWUgdW5sZXNzIG9wZW5fc3RyZWFtX2NvdW50IGlzIDBcbiAgICAgICAgb3V0ZXJfZW5kKClcbiAgICAgICAgcmV0dXJuIGZhbHNlXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIEtFWVMgJiBWQUxVRVNcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9lbmNvZGVfa2V5ID0gKCBkYiwga2V5LCBleHRyYV9ieXRlICkgLT5cbiAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBrZXkgI3tycHIga2V5fVwiIGlmIGtleSBpcyB1bmRlZmluZWRcbiAgcmV0dXJuIF9jb2RlY19lbmNvZGUga2V5LCBleHRyYV9ieXRlXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9kZWNvZGVfa2V5ID0gKCBkYiwga2V5ICkgLT5cbiAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBrZXkgI3tycHIga2V5fVwiIGlmICggUiA9IF9jb2RlY19kZWNvZGUga2V5ICkgaXMgdW5kZWZpbmVkXG4gIHJldHVybiBSXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9lbmNvZGVfdmFsdWUgPSAoIGRiLCB2YWx1ZSAgICAgICkgLT4gSlNPTi5zdHJpbmdpZnkgdmFsdWVcbkBfZGVjb2RlX3ZhbHVlID0gKCBkYiwgdmFsdWVfYmZyICApIC0+IEpTT04ucGFyc2UgICAgIHZhbHVlX2Jmci50b1N0cmluZyAndXRmLTgnXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyMjIE5CIEFyZ3VtZW50IG9yZGVyaW5nIGZvciB0aGVzZSBmdW5jdGlvbiBpcyBhbHdheXMgc3ViamVjdCBiZWZvcmUgb2JqZWN0LCByZWdhcmRsZXNzIG9mIHRoZSBwaHJhc2V0eXBlXG5hbmQgdGhlIG9yZGVyaW5nIGluIHRoZSByZXN1bHRpbmcga2V5LiAjIyNcbkBuZXdfa2V5ID0gKCBkYiwgcGhyYXNldHlwZSwgc2ssIHN2LCBvaywgb3YsIGlkeCApIC0+XG4gIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgcGhyYXNldHlwZTogI3tycHIgcGhyYXNldHlwZX1cIiB1bmxlc3MgcGhyYXNldHlwZSBpbiBbICdzbycsICdvcycsIF1cbiAgWyBzaywgc3YsIG9rLCBvdiwgXSA9IFsgb2ssIG92LCBzaywgc3YsIF0gaWYgcGhyYXNldHlwZSBpcyAnb3MnXG4gIHJldHVybiBbIHBocmFzZXR5cGUsIHNrLCBzdiwgb2ssIG92LCAoIGlkeCA/IDAgKSwgXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBuZXdfc29fa2V5ID0gKCBkYiwgUC4uLiApIC0+IEBuZXdfa2V5IGRiLCAnc28nLCBQLi4uXG5AbmV3X29zX2tleSA9ICggZGIsIFAuLi4gKSAtPiBAbmV3X2tleSBkYiwgJ29zJywgUC4uLlxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfbmV3X29zX2tleV9mcm9tX3NvX2tleSA9ICggZGIsIHNvX2tleSApIC0+XG4gIFsgcGhyYXNldHlwZSwgc2ssIHN2LCBvaywgb3YsIGlkeCwgXSA9IEBhc19waHJhc2UgZGIsIHNvX2tleVxuICB0aHJvdyBuZXcgRXJyb3IgXCJleHBlY3RlZCBwaHJhc2V0eXBlICdzbycsIGdvdCAje3JwciBwaHJhc2V0eXBlfVwiIHVubGVzcyBwaHJhc2V0eXBlIGlzICdzbydcbiAgcmV0dXJuIFsgJ29zJywgb2ssIG92LCBzaywgc3YsIGlkeCwgXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBuZXdfa2V5cyA9ICggZGIsIHBocmFzZXR5cGUsIHNrLCBzdiwgb2ssIG92LCBpZHggKSAtPlxuICBvdGhlcl9waHJhc2V0eXBlICA9IGlmIHBocmFzZXR5cGUgaXMgJ3NvJyB0aGVuICdvcycgZWxzZSAnc28nXG4gIHJldHVybiBbXG4gICAgKCBAbmV3X2tleSBkYiwgICAgICAgcGhyYXNldHlwZSwgc2ssIHN2LCBvaywgb3YsIGlkeCApLFxuICAgICggQG5ld19rZXkgZGIsIG90aGVyX3BocmFzZXR5cGUsIHNrLCBzdiwgb2ssIG92LCBpZHggKSwgXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBhc19waHJhc2UgPSAoIGRiLCBrZXksIHZhbHVlLCBub3JtYWxpemUgPSB5ZXMgKSAtPlxuICBzd2l0Y2ggcGhyYXNldHlwZSA9IGtleVsgMCBdXG4gICAgd2hlbiAnc3BvJ1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBTUE8ga2V5IChsZW5ndGggI3tsZW5ndGh9KVwiIHVubGVzcyAoIGxlbmd0aCA9IGtleS5sZW5ndGggKSBpcyAzXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIHZhbHVlICgxKSAje3JwciB2YWx1ZX1cIiBpZiB2YWx1ZSBpbiBbIHVuZGVmaW5lZCwgXVxuICAgICAgcmV0dXJuIFsgcGhyYXNldHlwZSwga2V5WyAxIF0sIGtleVsgMiBdLCB2YWx1ZSwgXVxuICAgIHdoZW4gJ3BvcydcbiAgICAgIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgUE9TIGtleSAobGVuZ3RoICN7bGVuZ3RofSlcIiB1bmxlc3MgNCA8PSAoIGxlbmd0aCA9IGtleS5sZW5ndGggKSA8PSA1XG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIHZhbHVlICgyKSAje3JwciB2YWx1ZX1cIiBpZiBub3QgKCB2YWx1ZSBpbiBbIG51bGwsIF0gKVxuICAgICAgcmV0dXJuIFsgcGhyYXNldHlwZSwga2V5WyAzIF0sIGtleVsgMSBdLCBrZXlbIDIgXSwga2V5WyA0IF0sIF0gaWYga2V5WyA0IF0/XG4gICAgICByZXR1cm4gWyBwaHJhc2V0eXBlLCBrZXlbIDMgXSwga2V5WyAxIF0sIGtleVsgMiBdLCBdXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQCRhc19waHJhc2UgPSAoIGRiICkgLT5cbiAgcmV0dXJuICQgKCBkYXRhLCBzZW5kICkgPT5cbiAgICBzZW5kIEBhc19waHJhc2UgZGIsIGRhdGEuLi5cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5Aa2V5X2Zyb21fdXJsID0gKCBkYiwgdXJsICkgLT5cbiAgIyMjIFRBSU4gZG9lcyBub3QgdW5lc2NhcGUgYXMgeWV0ICMjI1xuICAjIyMgVEFJTiBkb2VzIG5vdCBjYXN0IHZhbHVlcyBhcyB5ZXQgIyMjXG4gICMjIyBUQUlOVCBkb2VzIG5vdCBzdXBwb3J0IG11bHRpcGxlIGluZGV4ZXMgYXMgeWV0ICMjI1xuICBbIHBocmFzZXR5cGUsIGZpcnN0LCBzZWNvbmQsIGlkeCwgXSA9IHVybC5zcGxpdCAnfCdcbiAgdW5sZXNzIHBocmFzZXR5cGU/IGFuZCBwaHJhc2V0eXBlLmxlbmd0aCA+IDAgYW5kIHBocmFzZXR5cGUgaW4gWyAnc28nLCAnb3MnLCBdXG4gICAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBVUkwga2V5ICN7cnByIHVybH1cIlxuICB1bmxlc3MgZmlyc3Q/IGFuZCBmaXJzdC5sZW5ndGggPiAwIGFuZCBzZWNvbmQ/IGFuZCBzZWNvbmQubGVuZ3RoID4gMFxuICAgIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgVVJMIGtleSAje3JwciB1cmx9XCJcbiAgaWR4ID0gaWYgKCBpZHg/IGFuZCBpZHgubGVuZ3RoID4gMCApIHRoZW4gKCBwYXJzZUludCBpZHgsIDEwICkgZWxzZSAwXG4gIFsgc2ssIHN2LCBdID0gIGZpcnN0LnNwbGl0ICc6J1xuICBbIG9rLCBvdiwgXSA9IHNlY29uZC5zcGxpdCAnOidcbiAgdW5sZXNzIHNrPyBhbmQgc2subGVuZ3RoID4gMCBhbmQgb2s/IGFuZCBvay5sZW5ndGggPiAwXG4gICAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBVUkwga2V5ICN7cnByIHVybH1cIlxuICBbIHNrLCBzdiwgb2ssIG92LCBdID0gWyBvaywgb3YsIHNrLCBzdiwgXSBpZiBwaHJhc2V0eXBlIGlzICdvcydcbiAgcmV0dXJuIFsgcGhyYXNldHlwZSwgc2ssIHN2LCBvaywgb3YsIGlkeCwgXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkB1cmxfZnJvbV9rZXkgPSAoIGRiLCBrZXkgKSAtPlxuICBpZiAoIEBfdHlwZV9mcm9tX2tleSBkYiwga2V5ICkgaXMgJ2xpc3QnXG4gICAgWyBwaHJhc2V0eXBlLCB0YWlsLi4uLCBdID0ga2V5XG4gICAgaWYgcGhyYXNldHlwZSBpcyAnc3BvJ1xuICAgICAgWyBzYmosIHByZCwgXSA9IHRhaWxcbiAgICAgIHJldHVybiBcInNwb3wje3Nian18I3twcmR9fFwiXG4gICAgZWxzZVxuICAgICAgWyBwcmQsIG9iaiwgc2JqLCBpZHgsIF0gPSB0YWlsXG4gICAgICBpZHhfcnByID0gaWYgaWR4PyB0aGVuIHJwciBpZHggZWxzZSAnJ1xuICAgICAgcmV0dXJuIFwicG9zfCN7cHJkfToje29ian18I3tzYmp9fCN7aWR4X3Jwcn1cIlxuICByZXR1cm4gXCIje3JwciBrZXl9XCJcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AJHVybF9mcm9tX2tleSA9ICggZGIgKSAtPiAkICgga2V5LCBzZW5kICkgPT4gc2VuZCBAdXJsX2Zyb21fa2V5IGRiLCBrZXlcbkAka2V5X2Zyb21fdXJsID0gKCBkYiApIC0+ICQgKCB1cmwsIHNlbmQgKSA9PiBzZW5kIEBrZXlfZnJvbV91cmwgZGIsIGtleVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfdHlwZV9mcm9tX2tleSA9ICggZGIsIGtleSApIC0+XG4gIGlmIEFycmF5LmlzQXJyYXkga2V5XG4gICAgIyB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIGtleTogI3tycHIga2V5fVwiIHVubGVzcyBrZXkubGVuZ3RoIGlzIDZcbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIHBocmFzZXR5cGU6ICN7cnByIGtleX1cIiB1bmxlc3Mga2V5WyAnMCcgXSBpbiBAcGhyYXNldHlwZXNcbiAgICByZXR1cm4gJ2xpc3QnXG4gIHJldHVybiAnb3RoZXInXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIFBSRUZJWEVTICYgUVVFUklFU1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX3F1ZXJ5X2Zyb21fcHJlZml4ID0gKCBkYiwgbG9faGludCwgc3RhciApIC0+XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgaWYgc3Rhcj9cbiAgICAjIyMgJ0FzdGVyaXNrJyBlbmNvZGluZzogcGFydGlhbCBrZXkgc2VnbWVudHMgbWF0Y2ggIyMjXG4gICAgZ3RlICAgPSBAX2VuY29kZV9rZXkgZGIsIGxvX2hpbnRcbiAgICBsdGUgICA9IEBfZW5jb2RlX2tleSBkYiwgbG9faGludFxuICAgIGx0ZVsgbHRlLmxlbmd0aCAtIDEgXSA9IENPREVDWyAndHlwZW1hcmtlcnMnICBdWyAnaGknIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBlbHNlXG4gICAgIyMjICdDbGFzc2ljYWwnIGVuY29kaW5nOiBvbmx5IGZ1bGwga2V5IHNlZ21lbnRzIG1hdGNoICMjI1xuICAgIGJhc2UgID0gQF9lbmNvZGVfa2V5IGRiLCBsb19oaW50LCBDT0RFQ1sgJ3R5cGVtYXJrZXJzJyAgXVsgJ2hpJyBdXG4gICAgZ3RlICAgPSBiYXNlLnNsaWNlIDAsIGJhc2UubGVuZ3RoIC0gMVxuICAgIGx0ZSAgID0gYmFzZS5zbGljZSAwLCBiYXNlLmxlbmd0aFxuICByZXR1cm4geyBndGUsIGx0ZSwgfVxuXG5cblxuXG5cbiJdfQ==