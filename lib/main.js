(function() {
  var $, CND, CODEC, D, DUMP, LODASH, _codec_decode, _codec_encode, _new_level_db, badge, debug, echo, help, leveldown, log, repeat_immediately, rpr, step, suspend, urge, warn, whisper,
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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
    var R, input;
    if (lo_hint == null) {
      lo_hint = null;
    }
    if (hi_hint == null) {
      hi_hint = null;
    }
    input = this.create_facetstream(db, lo_hint, hi_hint);
    R = input.pipe(this.$as_phrase(db));
    R['%meta'] = input['%meta'];
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

//# sourceMappingURL=data:application/json;base64,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QUFBQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiXG5cblxuIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4jIG5qc191dGlsICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICd1dGlsJ1xuIyBuanNfcGF0aCAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAncGF0aCdcbiMgbmpzX2ZzICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2ZzJ1xuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5DTkQgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnY25kJ1xucnByICAgICAgICAgICAgICAgICAgICAgICA9IENORC5ycHJcbmJhZGdlICAgICAgICAgICAgICAgICAgICAgPSAnSE9MTEVSSVRIL21haW4nXG5sb2cgICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3BsYWluJywgICAgIGJhZGdlXG5kZWJ1ZyAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ2RlYnVnJywgICAgIGJhZGdlXG53YXJuICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3dhcm4nLCAgICAgIGJhZGdlXG5oZWxwICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ2hlbHAnLCAgICAgIGJhZGdlXG51cmdlICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3VyZ2UnLCAgICAgIGJhZGdlXG53aGlzcGVyICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3doaXNwZXInLCAgIGJhZGdlXG5lY2hvICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmVjaG8uYmluZCBDTkRcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuc3VzcGVuZCAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2NvZmZlZW5vZGUtc3VzcGVuZCdcbnN0ZXAgICAgICAgICAgICAgICAgICAgICAgPSBzdXNwZW5kLnN0ZXBcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuQ09ERUMgICAgICAgICAgICAgICAgICAgICA9IEBDT0RFQyA9IHJlcXVpcmUgJy4vY29kZWMnXG5EVU1QICAgICAgICAgICAgICAgICAgICAgID0gQERVTVAgID0gcmVxdWlyZSAnLi9kdW1wJ1xuX2NvZGVjX2VuY29kZSAgICAgICAgICAgICA9IENPREVDLmVuY29kZS5iaW5kIENPREVDXG5fY29kZWNfZGVjb2RlICAgICAgICAgICAgID0gQ09ERUMuZGVjb2RlLmJpbmQgQ09ERUNcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuRCAgICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ3BpcGVkcmVhbXMyJ1xuJCAgICAgICAgICAgICAgICAgICAgICAgICA9IEQucmVtaXQuYmluZCBEXG5fbmV3X2xldmVsX2RiICAgICAgICAgICAgID0gcmVxdWlyZSAnbGV2ZWwnXG5sZXZlbGRvd24gICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbGV2ZWwvbm9kZV9tb2R1bGVzL2xldmVsZG93bidcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuc3VzcGVuZCAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2NvZmZlZW5vZGUtc3VzcGVuZCdcbnN0ZXAgICAgICAgICAgICAgICAgICAgICAgPSBzdXNwZW5kLnN0ZXBcbnJlcGVhdF9pbW1lZGlhdGVseSAgICAgICAgPSBzdXNwZW5kLnJlcGVhdF9pbW1lZGlhdGVseVxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5MT0RBU0ggICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbG9kYXNoJ1xuXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQHBocmFzZXR5cGVzICAgICAgPSBbICdwb3MnLCAnc3BvJywgXVxuQF9taXNmaXQgICAgICAgICAgPSBTeW1ib2wgJ21pc2ZpdCdcbkBfemVyb192YWx1ZV9iZnIgID0gbmV3IEJ1ZmZlciAnbnVsbCdcbiMgd2FybiBcIm1pbmQgaW5jb25zaXN0ZW5jaWVzIGluIEhPTExFUklUSDIvbWFpbiBAX3plcm9fZW5jIGV0Y1wiXG4jIEBfemVybyAgICAgICAgICAgID0gdHJ1ZSAjID8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/XG4jIEBfemVyb19lbmMgICAgICAgID0gX2NvZGVjX2VuY29kZSBbIEBfemVybywgICAgXVxuIyBAX2xvX2VuYyAgICAgICAgICA9IF9jb2RlY19lbmNvZGUgWyBudWxsLCAgICAgIF1cbiMgQF9oaV9lbmMgICAgICAgICAgPSBfY29kZWNfZW5jb2RlIFsgQ09ERUMuLCBdXG4jIEBfbGFzdF9vY3RldCAgICAgID0gbmV3IEJ1ZmZlciBbIDB4ZmYsIF1cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AbmV3X2RiID0gKCByb3V0ZSApIC0+XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgbGV2ZWxfc2V0dGluZ3MgPVxuICAgICdrZXlFbmNvZGluZyc6ICAgICAgICAgICdiaW5hcnknXG4gICAgJ3ZhbHVlRW5jb2RpbmcnOiAgICAgICAgJ2JpbmFyeSdcbiAgICAnY3JlYXRlSWZNaXNzaW5nJzogICAgICB0cnVlXG4gICAgJ2Vycm9ySWZFeGlzdHMnOiAgICAgICAgZmFsc2VcbiAgICAnY29tcHJlc3Npb24nOiAgICAgICAgICB5ZXNcbiAgICAnc3luYyc6ICAgICAgICAgICAgICAgICBub1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHN1YnN0cmF0ZSAgICAgICAgICAgPSBfbmV3X2xldmVsX2RiIHJvdXRlLCBsZXZlbF9zZXR0aW5nc1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIFIgPVxuICAgICd+aXNhJzogICAgICAgICAgICdIT0xMRVJJVEgvZGInXG4gICAgJyVzZWxmJzogICAgICAgICAgc3Vic3RyYXRlXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcmV0dXJuIFJcblxuIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQF9yZW9wZW4gPSAoIGRiLCBoYW5kbGVyICkgLT5cbiMgICBzdGVwICggcmVzdW1lICkgPT5cbiMgICAgIHJvdXRlID0gZGJbICclc2VsZicgXVsgJ2xvY2F0aW9uJyBdXG4jICAgICB5aWVsZCBkYlsgJyVzZWxmJyBdLmNsb3NlIHJlc3VtZVxuIyAgICAgeWllbGQgZGJbICclc2VsZicgXS5vcGVuIHJlc3VtZVxuIyAgICAgd2hpc3BlciBcInJlLW9wZW5lZCBMZXZlbERCIGF0ICN7cm91dGV9XCJcbiMgICAgIGhhbmRsZXIgbnVsbFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBjbGVhciA9ICggZGIsIGhhbmRsZXIgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICByb3V0ZSA9IGRiWyAnJXNlbGYnIF1bICdsb2NhdGlvbicgXVxuICAgIHlpZWxkIGRiWyAnJXNlbGYnIF0uY2xvc2UgcmVzdW1lXG4gICAgeWllbGQgbGV2ZWxkb3duLmRlc3Ryb3kgcm91dGUsIHJlc3VtZVxuICAgIHlpZWxkIGRiWyAnJXNlbGYnIF0ub3BlbiByZXN1bWVcbiAgICAjIGhlbHAgXCJlcmFzZWQgYW5kIHJlLW9wZW5lZCBMZXZlbERCIGF0ICN7cm91dGV9XCJcbiAgICBoYW5kbGVyIG51bGxcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgV1JJVElOR1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AJHdyaXRlID0gKCBkYiwgYnVmZmVyX3NpemUgPSAxMDAwICkgLT5cbiAgIyMjIEV4cGVjdHMgYSBIb2xsZXJpdGggREIgb2JqZWN0IGFuZCBhbiBvcHRpb25hbCBidWZmZXIgc2l6ZTsgcmV0dXJucyBhIHN0cmVhbSB0cmFuc2Zvcm1lciB0aGF0IGRvZXMgYWxsXG4gIG9mIHRoZSBmb2xsb3dpbmc6XG5cbiAgKiBJdCBleHBlY3RzIGFuIFNPIGtleSBmb3Igd2hpY2ggaXQgd2lsbCBnZW5lcmF0ZSBhIGNvcnJlc3BvbmRpbmcgT1Mga2V5LlxuICAqIEEgY29ycmVzcG9uZGluZyBPUyBrZXkgaXMgZm9ybXVsYXRlZCBleGNlcHQgd2hlbiB0aGUgU08ga2V5J3Mgb2JqZWN0IHZhbHVlIGlzIGEgSlMgb2JqZWN0IC8gYSBQT0QgKHNpbmNlXG4gICAgaW4gdGhhdCBjYXNlLCB0aGUgdmFsdWUgc2VyaWFsaXphdGlvbiBpcyBqb2xseSB1c2VsZXNzIGFzIGFuIGluZGV4KS5cbiAgKiBJdCBzZW5kcyBvbiBib3RoIHRoZSBTTyBhbmQgdGhlIE9TIGtleSBkb3duc3RyZWFtIGZvciBvcHRpb25hbCBmdXJ0aGVyIHByb2Nlc3NpbmcuXG4gICogSXQgZm9ybXMgYSBwcm9wZXIgYG5vZGUtbGV2ZWxgLWNvbXBhdGlibGUgYmF0Y2ggcmVjb3JkIGZvciBlYWNoIGtleSBhbmQgY29sbGVjdCBhbGwgcmVjb3Jkc1xuICAgIGluIGEgYnVmZmVyLlxuICAqIFdoZW5ldmVyIHRoZSBidWZmZXIgaGFzIG91dGdyb3duIHRoZSBnaXZlbiBidWZmZXIgc2l6ZSwgdGhlIGJ1ZmZlciB3aWxsIGJlIHdyaXR0ZW4gaW50byB0aGUgREIgdXNpbmdcbiAgICBgbGV2ZWx1cGAncyBgYmF0Y2hgIGNvbW1hbmQuXG4gICogV2hlbiB0aGUgbGFzdCBwZW5kaW5nIGJhdGNoIGhhcyBiZWVuIHdyaXR0ZW4gaW50byB0aGUgREIsIHRoZSBgZW5kYCBldmVudCBpcyBjYWxsZWQgb24gdGhlIHN0cmVhbVxuICAgIGFuZCBtYXkgYmUgZGV0ZWN0ZWQgZG93bnN0cmVhbS5cblxuICAjIyNcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICB0aHJvdyBuZXcgRXJyb3IgXCJidWZmZXIgc2l6ZSBtdXN0IGJlIHBvc2l0aXZlIGludGVnZXIsIGdvdCAje3JwciBidWZmZXJfc2l6ZX1cIiB1bmxlc3MgYnVmZmVyX3NpemUgPiAwXG4gIGJ1ZmZlciAgICAgID0gW11cbiAgc3Vic3RyYXRlICAgPSBkYlsgJyVzZWxmJyBdXG4gIGJhdGNoX2NvdW50ID0gMFxuICBoYXNfZW5kZWQgICA9IG5vXG4gIF9zZW5kICAgICAgID0gbnVsbFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHB1c2ggPSAoIGtleSwgdmFsdWUgKSA9PlxuICAgIHZhbHVlX2JmciA9IGlmIHZhbHVlPyB0aGVuIEBfZW5jb2RlX3ZhbHVlIGRiLCB2YWx1ZSBlbHNlIEBfemVyb192YWx1ZV9iZnJcbiAgICBidWZmZXIucHVzaCB7IHR5cGU6ICdwdXQnLCBrZXk6ICggQF9lbmNvZGVfa2V5IGRiLCBrZXkgKSwgdmFsdWU6IHZhbHVlX2JmciwgfVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGZsdXNoID0gPT5cbiAgICBpZiBidWZmZXIubGVuZ3RoID4gMFxuICAgICAgYmF0Y2hfY291bnQgKz0gKzFcbiAgICAgICMgIyMjIC0tLSAjIyNcbiAgICAgICMgZm9yIHsga2V5LCB2YWx1ZSwgfSBpbiBidWZmZXJcbiAgICAgICMgICBkZWJ1ZyAnwqlBYkRVMScsICggQF9kZWNvZGVfa2V5IGRiLCBrZXkgKSwgKCBAX2RlY29kZV9rZXkgZGIsIHZhbHVlIClcbiAgICAgICMgIyMjIC0tLSAjIyNcbiAgICAgIHN1YnN0cmF0ZS5iYXRjaCBidWZmZXIsICggZXJyb3IgKSA9PlxuICAgICAgICB0aHJvdyBlcnJvciBpZiBlcnJvcj9cbiAgICAgICAgYmF0Y2hfY291bnQgKz0gLTFcbiAgICAgICAgX3NlbmQuZW5kKCkgaWYgaGFzX2VuZGVkIGFuZCBiYXRjaF9jb3VudCA8IDFcbiAgICAgIGJ1ZmZlciA9IFtdXG4gICAgZWxzZVxuICAgICAgX3NlbmQuZW5kKClcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICByZXR1cm4gJCAoIHNwbywgc2VuZCwgZW5kICkgPT5cbiAgICAjIGRlYnVnICfCqUJwSlF0Jywgc3BvXG4gICAgX3NlbmQgPSBzZW5kXG4gICAgaWYgc3BvP1xuICAgICAgWyBzYmosIHByZCwgb2JqLCBdID0gc3BvXG4gICAgICBwdXNoIFsgJ3NwbycsIHNiaiwgcHJkLCBdLCBvYmpcbiAgICAgICMgZGVidWcgJ8KpT1ltYUQnLCBbICdzcG8nLCBzYmosIHByZCwgXSwgb2JqXG4gICAgICAjIyMgVEFJTlQgd2hhdCB0byBzZW5kLCBpZiBhbnl0aGluZz8gIyMjXG4gICAgICAjIHNlbmQgZW50cnlcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgaWYgQ05ELmlzYV9wb2Qgb2JqXG4gICAgICAgICMjIyBEbyBub3QgY3JlYXRlIGluZGV4IGVudHJpZXMgaW4gY2FzZSBgb2JqYCBpcyBhIFBPRDogIyMjXG4gICAgICAgIG51bGxcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgZWxzZSBpZiBDTkQuaXNhX2xpc3Qgb2JqXG4gICAgICAgICMjIyBDcmVhdGUgb25lIGluZGV4IGVudHJ5IGZvciBlYWNoIGVsZW1lbnQgaW4gY2FzZSBgb2JqYCBpcyBhIGxpc3Q6ICMjI1xuICAgICAgICBmb3Igb2JqX2VsZW1lbnQsIG9ial9pZHggaW4gb2JqXG4gICAgICAgICAgcHVzaCBbICdwb3MnLCBwcmQsIG9ial9lbGVtZW50LCBzYmosIG9ial9pZHgsIF1cbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgZWxzZVxuICAgICAgICAjIyMgQ3JlYXRlIG9uZSBpbmRleCBlbnRyeSBmb3IgYG9iamAgb3RoZXJ3aXNlOiAjIyNcbiAgICAgICAgcHVzaCBbICdwb3MnLCBwcmQsIG9iaiwgc2JqLCBdXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIGZsdXNoKCkgaWYgYnVmZmVyLmxlbmd0aCA+PSBidWZmZXJfc2l6ZVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyMjIEZsdXNoIHJlbWFpbmluZyBidWZmZXJlZCBlbnRyaWVzIHRvIERCICMjI1xuICAgIGlmIGVuZD9cbiAgICAgIGhhc19lbmRlZCA9IHllc1xuICAgICAgZmx1c2goKVxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyBSRUFESU5HXG4jICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBAY3JlYXRlX2tleXN0cmVhbSA9ICggZGIsIGxvX2hpbnQgPSBudWxsLCBoaV9oaW50ID0gbnVsbCApIC0+XG4jICAgIyMjIFRBSU5UIGNvZGUgZHVwbGljYXRpb24gIyMjXG4jICAgaWYgbG9faGludD9cbiMgICAgIGlmIGhpX2hpbnQ/XG4jICAgICAgIHF1ZXJ5ID0geyBndGU6IGxvX2hpbnQsIGx0ZTpoaV9oaW50LCB9XG4jICAgICBlbHNlXG4jICAgICAgIHF1ZXJ5ID0geyBndGU6IGxvX2hpbnQsIH1cbiMgICBlbHNlIGlmIGhpX2hpbnQ/XG4jICAgICBxdWVyeSA9IHsgbHRlOiBoaV9oaW50LCB9XG4jICAgZWxzZVxuIyAgICAgcXVlcnkgPSBudWxsXG4jICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgIGRlYnVnICfCqTgzNUpQJywgcXVlcnlcbiMgICBSID0gaWYgcXVlcnk/IHRoZW4gKCBkYlsgJyVzZWxmJyBdLmNyZWF0ZUtleVN0cmVhbSBxdWVyeSApIGVsc2UgZGJbICclc2VsZicgXS5jcmVhdGVLZXlTdHJlYW0oKVxuIyAgICMgUiA9IGRiWyAnJXNlbGYnIF0uY3JlYXRlS2V5U3RyZWFtIEBuZXdfcXVlcnkgZGIsIHF1ZXJ5XG4jICAgIyMjIFRBSU5UIFNob3VsZCB3ZSB0ZXN0IGZvciB3ZWxsLWZvcm1lZCBlbnRyaWVzIGhlcmU/ICMjI1xuIyAgIFIgPSBSLnBpcGUgJCAoIGJrZXksIHNlbmQgKSA9PiBzZW5kIEBfZGVjb2RlX2tleSBkYiwgYmtleVxuIyAgIHJldHVybiBSXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQGNyZWF0ZV9waHJhc2VzdHJlYW0gPSAoIGRiLCBsb19oaW50ID0gbnVsbCwgaGlfaGludCA9IG51bGwgKSAtPlxuICBpbnB1dCA9IEBjcmVhdGVfZmFjZXRzdHJlYW0gZGIsIGxvX2hpbnQsIGhpX2hpbnRcbiAgUiA9IGlucHV0XG4gICAgLnBpcGUgQCRhc19waHJhc2UgZGJcbiAgUlsgJyVtZXRhJyBdID0gaW5wdXRbICclbWV0YScgXVxuICByZXR1cm4gUlxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBjcmVhdGVfZmFjZXRzdHJlYW0gPSAoIGRiLCBsb19oaW50ID0gbnVsbCwgaGlfaGludCA9IG51bGwgKSAtPlxuICAjIyNcbiAgKiBJZiBubyBoaW50IGlzIGdpdmVuLCBhbGwgZW50cmllcyB3aWxsIGJlIGdpdmVuIGluIHRoZSBzdHJlYW0uXG4gICogSWYgYm90aCBgbG9faGludGAgYW5kIGBoaV9oaW50YCBhcmUgZ2l2ZW4sIGEgcXVlcnkgd2l0aCBsb3dlciBhbmQgdXBwZXIsIGluY2x1c2l2ZSBib3VuZGFyaWVzIGlzXG4gICAgaXNzdWVkLlxuICAqIElmIG9ubHkgYGxvX2hpbnRgIGlzIGdpdmVuLCBhIHByZWZpeCBxdWVyeSBpcyBpc3N1ZWQuXG4gICogSWYgYGhpX2hpbnRgIGlzIGdpdmVuIGJ1dCBgbG9faGludGAgaXMgbWlzc2luZywgYW4gZXJyb3IgaXMgaXNzdWVkLlxuICAjIyNcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBpZiBoaV9oaW50PyBhbmQgbm90IGxvX2hpbnQ/XG4gICAgdGhyb3cgbmV3IEVycm9yIFwibXVzdCBnaXZlIGBsb19oaW50YCB3aGVuIGBoaV9oaW50YCBpcyBnaXZlblwiXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgaWYgbG9faGludD8gYW5kIG5vdCBoaV9oaW50P1xuICAgIHF1ZXJ5ICAgICAgID0gQF9xdWVyeV9mcm9tX3ByZWZpeCBkYiwgbG9faGludFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGVsc2UgaWYgbG9faGludD8gYW5kIGhpX2hpbnQgaXMgJyonXG4gICAgcXVlcnkgICAgICAgPSBAX3F1ZXJ5X2Zyb21fcHJlZml4IGRiLCBsb19oaW50LCAnKidcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBlbHNlXG4gICAgbG9faGludF9iZnIgPSBpZiBsb19oaW50PyB0aGVuICggICAgICAgIEBfZW5jb2RlX2tleSBkYiwgbG9faGludCApICAgICAgICAgIGVsc2UgbnVsbFxuICAgIGhpX2hpbnRfYmZyID0gaWYgaGlfaGludD8gdGhlbiAoIEBfcXVlcnlfZnJvbV9wcmVmaXggZGIsIGhpX2hpbnQgKVsgJ2x0ZScgXSBlbHNlIG51bGxcbiAgICAjIGxvX2hpbnRfYmZyID0gaWYgbG9faGludD8gdGhlbiAoICAgICAgICBAX2VuY29kZV9rZXkgZGIsIGxvX2hpbnQgKSAgICAgICAgICBlbHNlIENPREVDWyAna2V5cycgXVsgJ2xvJyBdXG4gICAgIyBoaV9oaW50X2JmciA9IGlmIGhpX2hpbnQ/IHRoZW4gKCBAX3F1ZXJ5X2Zyb21fcHJlZml4IGRiLCBoaV9oaW50IClbICdsdGUnIF0gZWxzZSBDT0RFQ1sgJ2tleXMnIF1bICdoaScgXVxuICAgIHF1ZXJ5ICAgICAgID0geyBndGU6IGxvX2hpbnRfYmZyLCBsdGU6IGhpX2hpbnRfYmZyLCB9XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgIyMjIFRBSU5UIFNob3VsZCB3ZSB0ZXN0IGZvciB3ZWxsLWZvcm1lZCBlbnRyaWVzIGhlcmU/ICMjI1xuICBSID0gZGJbICclc2VsZicgXS5jcmVhdGVSZWFkU3RyZWFtIHF1ZXJ5XG4gIFIgPSBSLnBpcGUgJCAoIHsga2V5LCB2YWx1ZSB9LCBzZW5kICkgPT4gc2VuZCBbICggQF9kZWNvZGVfa2V5IGRiLCBrZXkgKSwgKCBAX2RlY29kZV92YWx1ZSBkYiwgdmFsdWUgKSwgXVxuICBSWyAnJW1ldGEnIF0gPSB7fVxuICBSWyAnJW1ldGEnIF1bICdxdWVyeScgXSA9IHF1ZXJ5XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcmV0dXJuIFJcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AcmVhZF9tYW55ID0gKCBkYiwgaGludCA9IG51bGwgKSAtPlxuICAjIyMgSGludHMgYXJlIGludGVycHJldGVkIGFzIHBhcnRpYWwgc2Vjb25kYXJ5IChQT1MpIGtleXMuICMjI1xuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkByZWFkX29uZSA9ICggZGIsIGtleSwgZmFsbGJhY2sgPSBAX21pc2ZpdCwgaGFuZGxlciApIC0+XG4gICMjIyBIaW50cyBhcmUgaW50ZXJwcmV0ZWQgYXMgY29tcGxldGUgcHJpbWFyeSAoU1BPKSBrZXlzLiAjIyNcbiAgc3dpdGNoIGFyaXR5ID0gYXJndW1lbnRzLmxlbmd0aFxuICAgIHdoZW4gM1xuICAgICAgaGFuZGxlciAgID0gZmFsbGJhY2tcbiAgICAgIGZhbGxiYWNrICA9IEBfbWlzZml0XG4gICAgd2hlbiA0IHRoZW4gbnVsbFxuICAgIGVsc2UgdGhyb3cgbmV3IEVycm9yIFwiZXhwZWN0ZWQgMyBvciA0IGFyZ3VtZW50cywgZ290ICN7YXJpdHl9XCJcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBkYlsgJyVzZWxmJyBdLmdldCBrZXksIGhhbmRsZXJcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AcmVhZF9zdWIgPSAoIGRiLCBzZXR0aW5ncywgcmVhZCApIC0+XG4gIHN3aXRjaCBhcml0eSA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICB3aGVuIDJcbiAgICAgIHJlYWQgICAgICA9IHNldHRpbmdzXG4gICAgICBzZXR0aW5ncyAgPSBudWxsXG4gICAgd2hlbiAzXG4gICAgICBudWxsXG4gICAgZWxzZVxuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiZXhwZWN0ZWQgMiBvciAzIGFyZ3VtZW50cywgZ290ICN7YXJpdHl9XCJcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBpbmRleGVkICAgICAgICAgICA9IHNldHRpbmdzP1sgJ2luZGV4ZWQnICAgIF0gPyBub1xuICAjIHRyYW5zZm9ybSAgICAgICAgID0gc2V0dGluZ3M/WyAndHJhbnNmb3JtJyAgXSA/IEQuJHBhc3NfdGhyb3VnaCgpXG4gIG1hbmdsZSAgICAgICAgICAgID0gc2V0dGluZ3M/WyAnbWFuZ2xlJyAgICAgXSA/ICggZGF0YSApIC0+IGRhdGFcbiAgc2VuZF9lbXB0eSAgICAgICAgPSBzZXR0aW5ncz9bICdlbXB0eScgICAgICBdID8gbm9cbiAgaW5zZXJ0X2luZGV4ICAgICAgPSBpZiBpbmRleGVkIHRoZW4gRC5uZXdfaW5kZXhlcigpIGVsc2UgKCB4ICkgLT4geFxuICBvcGVuX3N0cmVhbV9jb3VudCA9IDBcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICByZXR1cm4gJCAoIG91dGVyX2RhdGEsIG91dGVyX3NlbmQsIG91dGVyX2VuZCApID0+XG4gICAgY291bnQgPSAwXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpZiBvdXRlcl9kYXRhP1xuICAgICAgb3Blbl9zdHJlYW1fY291bnQgICAgKz0gKzFcbiAgICAgIHN1Yl9pbnB1dCAgICAgICAgICAgICA9IHJlYWQgb3V0ZXJfZGF0YVxuICAgICAgWyBtZW1vLCBzdWJfaW5wdXQsIF0gID0gaWYgQ05ELmlzYV9saXN0IHN1Yl9pbnB1dCB0aGVuIHN1Yl9pbnB1dCBlbHNlIFsgQF9taXNmaXQsIHN1Yl9pbnB1dCwgXVxuICAgICAgc3ViX2lucHV0XG4gICAgICAgICMgLnBpcGUgdHJhbnNmb3JtXG4gICAgICAgIC5waXBlIGRvID0+XG4gICAgICAgICAgIyMjIFRBSU5UIG5vIG5lZWQgdG8gYnVpbGQgYnVmZmVyIGlmIG5vdCBgc2VuZF9lbXB0eWAgYW5kIHRoZXJlIGFyZSBubyByZXN1bHRzICMjI1xuICAgICAgICAgIGJ1ZmZlciA9IGlmIG1lbW8gaXMgQF9taXNmaXQgdGhlbiBbXSBlbHNlIFsgbWVtbywgXVxuICAgICAgICAgIHJldHVybiAkICggaW5uZXJfZGF0YSwgXywgaW5uZXJfZW5kICkgPT5cbiAgICAgICAgICAgIGlmIGlubmVyX2RhdGE/XG4gICAgICAgICAgICAgIGlubmVyX2RhdGEgPSBtYW5nbGUgaW5uZXJfZGF0YVxuICAgICAgICAgICAgICBpZiBpbm5lcl9kYXRhP1xuICAgICAgICAgICAgICAgIGNvdW50ICs9ICsxXG4gICAgICAgICAgICAgICAgYnVmZmVyLnB1c2ggaW5uZXJfZGF0YVxuICAgICAgICAgICAgaWYgaW5uZXJfZW5kP1xuICAgICAgICAgICAgICBpZiBzZW5kX2VtcHR5IG9yIGNvdW50ID4gMFxuICAgICAgICAgICAgICAgIG91dGVyX3NlbmQgaW5zZXJ0X2luZGV4IGJ1ZmZlclxuICAgICAgICAgICAgICBvcGVuX3N0cmVhbV9jb3VudCArPSAtMVxuICAgICAgICAgICAgICBpbm5lcl9lbmQoKVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaWYgb3V0ZXJfZW5kP1xuICAgICAgcmVwZWF0X2ltbWVkaWF0ZWx5IC0+XG4gICAgICAgIHJldHVybiB0cnVlIHVubGVzcyBvcGVuX3N0cmVhbV9jb3VudCBpcyAwXG4gICAgICAgIG91dGVyX2VuZCgpXG4gICAgICAgIHJldHVybiBmYWxzZVxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyBLRVlTICYgVkFMVUVTXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfZW5jb2RlX2tleSA9ICggZGIsIGtleSwgZXh0cmFfYnl0ZSApIC0+XG4gIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwga2V5ICN7cnByIGtleX1cIiBpZiBrZXkgaXMgdW5kZWZpbmVkXG4gIHJldHVybiBfY29kZWNfZW5jb2RlIGtleSwgZXh0cmFfYnl0ZVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfZGVjb2RlX2tleSA9ICggZGIsIGtleSApIC0+XG4gIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwga2V5ICN7cnByIGtleX1cIiBpZiAoIFIgPSBfY29kZWNfZGVjb2RlIGtleSApIGlzIHVuZGVmaW5lZFxuICByZXR1cm4gUlxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfZW5jb2RlX3ZhbHVlID0gKCBkYiwgdmFsdWUgICAgICApIC0+IEpTT04uc3RyaW5naWZ5IHZhbHVlXG5AX2RlY29kZV92YWx1ZSA9ICggZGIsIHZhbHVlX2JmciAgKSAtPiBKU09OLnBhcnNlICAgICB2YWx1ZV9iZnIudG9TdHJpbmcgJ3V0Zi04J1xuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMjIyBOQiBBcmd1bWVudCBvcmRlcmluZyBmb3IgdGhlc2UgZnVuY3Rpb24gaXMgYWx3YXlzIHN1YmplY3QgYmVmb3JlIG9iamVjdCwgcmVnYXJkbGVzcyBvZiB0aGUgcGhyYXNldHlwZVxuYW5kIHRoZSBvcmRlcmluZyBpbiB0aGUgcmVzdWx0aW5nIGtleS4gIyMjXG5AbmV3X2tleSA9ICggZGIsIHBocmFzZXR5cGUsIHNrLCBzdiwgb2ssIG92LCBpZHggKSAtPlxuICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIHBocmFzZXR5cGU6ICN7cnByIHBocmFzZXR5cGV9XCIgdW5sZXNzIHBocmFzZXR5cGUgaW4gWyAnc28nLCAnb3MnLCBdXG4gIFsgc2ssIHN2LCBvaywgb3YsIF0gPSBbIG9rLCBvdiwgc2ssIHN2LCBdIGlmIHBocmFzZXR5cGUgaXMgJ29zJ1xuICByZXR1cm4gWyBwaHJhc2V0eXBlLCBzaywgc3YsIG9rLCBvdiwgKCBpZHggPyAwICksIF1cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AbmV3X3NvX2tleSA9ICggZGIsIFAuLi4gKSAtPiBAbmV3X2tleSBkYiwgJ3NvJywgUC4uLlxuQG5ld19vc19rZXkgPSAoIGRiLCBQLi4uICkgLT4gQG5ld19rZXkgZGIsICdvcycsIFAuLi5cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX25ld19vc19rZXlfZnJvbV9zb19rZXkgPSAoIGRiLCBzb19rZXkgKSAtPlxuICBbIHBocmFzZXR5cGUsIHNrLCBzdiwgb2ssIG92LCBpZHgsIF0gPSBAYXNfcGhyYXNlIGRiLCBzb19rZXlcbiAgdGhyb3cgbmV3IEVycm9yIFwiZXhwZWN0ZWQgcGhyYXNldHlwZSAnc28nLCBnb3QgI3tycHIgcGhyYXNldHlwZX1cIiB1bmxlc3MgcGhyYXNldHlwZSBpcyAnc28nXG4gIHJldHVybiBbICdvcycsIG9rLCBvdiwgc2ssIHN2LCBpZHgsIF1cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AbmV3X2tleXMgPSAoIGRiLCBwaHJhc2V0eXBlLCBzaywgc3YsIG9rLCBvdiwgaWR4ICkgLT5cbiAgb3RoZXJfcGhyYXNldHlwZSAgPSBpZiBwaHJhc2V0eXBlIGlzICdzbycgdGhlbiAnb3MnIGVsc2UgJ3NvJ1xuICByZXR1cm4gW1xuICAgICggQG5ld19rZXkgZGIsICAgICAgIHBocmFzZXR5cGUsIHNrLCBzdiwgb2ssIG92LCBpZHggKSxcbiAgICAoIEBuZXdfa2V5IGRiLCBvdGhlcl9waHJhc2V0eXBlLCBzaywgc3YsIG9rLCBvdiwgaWR4ICksIF1cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AYXNfcGhyYXNlID0gKCBkYiwga2V5LCB2YWx1ZSApIC0+XG4gIHN3aXRjaCBwaHJhc2V0eXBlID0ga2V5WyAwIF1cbiAgICB3aGVuICdzcG8nXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIFNQTyBrZXkgKGxlbmd0aCAje2xlbmd0aH0pXCIgdW5sZXNzICggbGVuZ3RoID0ga2V5Lmxlbmd0aCApIGlzIDNcbiAgICAgIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgdmFsdWUgKDEpICN7cnByIHZhbHVlfVwiIGlmIHZhbHVlIGluIFsgdW5kZWZpbmVkLCBdXG4gICAgICByZXR1cm4gWyBrZXlbIDEgXSwga2V5WyAyIF0sIHZhbHVlLCBdXG4gICAgd2hlbiAncG9zJ1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBQT1Mga2V5IChsZW5ndGggI3tsZW5ndGh9KVwiIHVubGVzcyA0IDw9ICggbGVuZ3RoID0ga2V5Lmxlbmd0aCApIDw9IDVcbiAgICAgIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgdmFsdWUgKDIpICN7cnByIHZhbHVlfVwiIGlmIG5vdCAoIHZhbHVlIGluIFsgbnVsbCwgXSApXG4gICAgICBbIF8sIHByZCwgb2JqLCBzYmosIGlkeCwgXSA9IGtleVxuICAgICAgcmV0dXJuIGlmIGlkeD8gdGhlbiBbIHNiaiwgcHJkLCBvYmosIGlkeCwgXSBlbHNlIFsgc2JqLCBwcmQsIG9iaiwgXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkAkYXNfcGhyYXNlID0gKCBkYiApIC0+XG4gIHJldHVybiAkICggZGF0YSwgc2VuZCApID0+XG4gICAgc2VuZCBAYXNfcGhyYXNlIGRiLCBkYXRhLi4uXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQGtleV9mcm9tX3VybCA9ICggZGIsIHVybCApIC0+XG4gICMjIyBUQUlOIGRvZXMgbm90IHVuZXNjYXBlIGFzIHlldCAjIyNcbiAgIyMjIFRBSU4gZG9lcyBub3QgY2FzdCB2YWx1ZXMgYXMgeWV0ICMjI1xuICAjIyMgVEFJTlQgZG9lcyBub3Qgc3VwcG9ydCBtdWx0aXBsZSBpbmRleGVzIGFzIHlldCAjIyNcbiAgWyBwaHJhc2V0eXBlLCBmaXJzdCwgc2Vjb25kLCBpZHgsIF0gPSB1cmwuc3BsaXQgJ3wnXG4gIHVubGVzcyBwaHJhc2V0eXBlPyBhbmQgcGhyYXNldHlwZS5sZW5ndGggPiAwIGFuZCBwaHJhc2V0eXBlIGluIFsgJ3NvJywgJ29zJywgXVxuICAgIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgVVJMIGtleSAje3JwciB1cmx9XCJcbiAgdW5sZXNzIGZpcnN0PyBhbmQgZmlyc3QubGVuZ3RoID4gMCBhbmQgc2Vjb25kPyBhbmQgc2Vjb25kLmxlbmd0aCA+IDBcbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIFVSTCBrZXkgI3tycHIgdXJsfVwiXG4gIGlkeCA9IGlmICggaWR4PyBhbmQgaWR4Lmxlbmd0aCA+IDAgKSB0aGVuICggcGFyc2VJbnQgaWR4LCAxMCApIGVsc2UgMFxuICBbIHNrLCBzdiwgXSA9ICBmaXJzdC5zcGxpdCAnOidcbiAgWyBvaywgb3YsIF0gPSBzZWNvbmQuc3BsaXQgJzonXG4gIHVubGVzcyBzaz8gYW5kIHNrLmxlbmd0aCA+IDAgYW5kIG9rPyBhbmQgb2subGVuZ3RoID4gMFxuICAgIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgVVJMIGtleSAje3JwciB1cmx9XCJcbiAgWyBzaywgc3YsIG9rLCBvdiwgXSA9IFsgb2ssIG92LCBzaywgc3YsIF0gaWYgcGhyYXNldHlwZSBpcyAnb3MnXG4gIHJldHVybiBbIHBocmFzZXR5cGUsIHNrLCBzdiwgb2ssIG92LCBpZHgsIF1cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AdXJsX2Zyb21fa2V5ID0gKCBkYiwga2V5ICkgLT5cbiAgaWYgKCBAX3R5cGVfZnJvbV9rZXkgZGIsIGtleSApIGlzICdsaXN0J1xuICAgIFsgcGhyYXNldHlwZSwgdGFpbC4uLiwgXSA9IGtleVxuICAgIGlmIHBocmFzZXR5cGUgaXMgJ3NwbydcbiAgICAgIFsgc2JqLCBwcmQsIF0gPSB0YWlsXG4gICAgICByZXR1cm4gXCJzcG98I3tzYmp9fCN7cHJkfXxcIlxuICAgIGVsc2VcbiAgICAgIFsgcHJkLCBvYmosIHNiaiwgaWR4LCBdID0gdGFpbFxuICAgICAgaWR4X3JwciA9IGlmIGlkeD8gdGhlbiBycHIgaWR4IGVsc2UgJydcbiAgICAgIHJldHVybiBcInBvc3wje3ByZH06I3tvYmp9fCN7c2JqfXwje2lkeF9ycHJ9XCJcbiAgcmV0dXJuIFwiI3tycHIga2V5fVwiXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQCR1cmxfZnJvbV9rZXkgPSAoIGRiICkgLT4gJCAoIGtleSwgc2VuZCApID0+IHNlbmQgQHVybF9mcm9tX2tleSBkYiwga2V5XG5AJGtleV9mcm9tX3VybCA9ICggZGIgKSAtPiAkICggdXJsLCBzZW5kICkgPT4gc2VuZCBAa2V5X2Zyb21fdXJsIGRiLCBrZXlcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX3R5cGVfZnJvbV9rZXkgPSAoIGRiLCBrZXkgKSAtPlxuICBpZiBBcnJheS5pc0FycmF5IGtleVxuICAgICMgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBrZXk6ICN7cnByIGtleX1cIiB1bmxlc3Mga2V5Lmxlbmd0aCBpcyA2XG4gICAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBwaHJhc2V0eXBlOiAje3JwciBrZXl9XCIgdW5sZXNzIGtleVsgJzAnIF0gaW4gQHBocmFzZXR5cGVzXG4gICAgcmV0dXJuICdsaXN0J1xuICByZXR1cm4gJ290aGVyJ1xuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyBQUkVGSVhFUyAmIFFVRVJJRVNcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9xdWVyeV9mcm9tX3ByZWZpeCA9ICggZGIsIGxvX2hpbnQsIHN0YXIgKSAtPlxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGlmIHN0YXI/XG4gICAgIyMjICdBc3RlcmlzaycgZW5jb2Rpbmc6IHBhcnRpYWwga2V5IHNlZ21lbnRzIG1hdGNoICMjI1xuICAgIGd0ZSAgID0gQF9lbmNvZGVfa2V5IGRiLCBsb19oaW50XG4gICAgbHRlICAgPSBAX2VuY29kZV9rZXkgZGIsIGxvX2hpbnRcbiAgICBsdGVbIGx0ZS5sZW5ndGggLSAxIF0gPSBDT0RFQ1sgJ3R5cGVtYXJrZXJzJyAgXVsgJ2hpJyBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZWxzZVxuICAgICMjIyAnQ2xhc3NpY2FsJyBlbmNvZGluZzogb25seSBmdWxsIGtleSBzZWdtZW50cyBtYXRjaCAjIyNcbiAgICBiYXNlICA9IEBfZW5jb2RlX2tleSBkYiwgbG9faGludCwgQ09ERUNbICd0eXBlbWFya2VycycgIF1bICdoaScgXVxuICAgIGd0ZSAgID0gYmFzZS5zbGljZSAwLCBiYXNlLmxlbmd0aCAtIDFcbiAgICBsdGUgICA9IGJhc2Uuc2xpY2UgMCwgYmFzZS5sZW5ndGhcbiAgcmV0dXJuIHsgZ3RlLCBsdGUsIH1cblxuXG5cblxuXG4iXX0=