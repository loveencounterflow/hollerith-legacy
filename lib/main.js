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

  CODEC = require('./codec');

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

//# sourceMappingURL=data:application/json;base64,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QUQsQ0FBYSxFQUFiLEVBQWlCLE9BQWpCLEVBQTBCLElBQTFCLENBQVIsQ0FBQTtBQUFBLElBQ0EsR0FBQSxHQUFRLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBWCxFQUFjLElBQUksQ0FBQyxNQUFMLEdBQWMsQ0FBNUIsQ0FEUixDQUFBO0FBQUEsSUFFQSxHQUFBLEdBQVEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFYLEVBQWMsSUFBSSxDQUFDLE1BQW5CLENBRlIsQ0FBQTtBQUdBLFdBQU87QUFBQSxNQUFFLEtBQUEsR0FBRjtBQUFBLE1BQU8sS0FBQSxHQUFQO0tBQVAsQ0FKb0I7RUFBQSxDQTdYdEIsQ0FBQTtBQUFBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJcblxuXG4jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiMgbmpzX3V0aWwgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ3V0aWwnXG4jIG5qc19wYXRoICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdwYXRoJ1xuIyBuanNfZnMgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnZnMnXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkNORCAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdjbmQnXG5ycHIgICAgICAgICAgICAgICAgICAgICAgID0gQ05ELnJwclxuYmFkZ2UgICAgICAgICAgICAgICAgICAgICA9ICdIT0xMRVJJVEgvbWFpbidcbmxvZyAgICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAncGxhaW4nLCAgICAgYmFkZ2VcbmRlYnVnICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnZGVidWcnLCAgICAgYmFkZ2Vcbndhcm4gICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnd2FybicsICAgICAgYmFkZ2VcbmhlbHAgICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnaGVscCcsICAgICAgYmFkZ2VcbnVyZ2UgICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAndXJnZScsICAgICAgYmFkZ2VcbndoaXNwZXIgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnd2hpc3BlcicsICAgYmFkZ2VcbmVjaG8gICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZWNoby5iaW5kIENORFxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5zdXNwZW5kICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnY29mZmVlbm9kZS1zdXNwZW5kJ1xuc3RlcCAgICAgICAgICAgICAgICAgICAgICA9IHN1c3BlbmQuc3RlcFxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5DT0RFQyAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi9jb2RlYydcbl9jb2RlY19lbmNvZGUgICAgICAgICAgICAgPSBDT0RFQy5lbmNvZGUuYmluZCBDT0RFQ1xuX2NvZGVjX2RlY29kZSAgICAgICAgICAgICA9IENPREVDLmRlY29kZS5iaW5kIENPREVDXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkQgICAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdwaXBlZHJlYW1zMidcbiQgICAgICAgICAgICAgICAgICAgICAgICAgPSBELnJlbWl0LmJpbmQgRFxuX25ld19sZXZlbF9kYiAgICAgICAgICAgICA9IHJlcXVpcmUgJ2xldmVsJ1xubGV2ZWxkb3duICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2xldmVsL25vZGVfbW9kdWxlcy9sZXZlbGRvd24nXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnN1c3BlbmQgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdjb2ZmZWVub2RlLXN1c3BlbmQnXG5zdGVwICAgICAgICAgICAgICAgICAgICAgID0gc3VzcGVuZC5zdGVwXG5yZXBlYXRfaW1tZWRpYXRlbHkgICAgICAgID0gc3VzcGVuZC5yZXBlYXRfaW1tZWRpYXRlbHlcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuTE9EQVNIICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2xvZGFzaCdcblxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBwaHJhc2V0eXBlcyAgICAgID0gWyAncG9zJywgJ3NwbycsIF1cbkBfbWlzZml0ICAgICAgICAgID0gU3ltYm9sICdtaXNmaXQnXG5AX3plcm9fdmFsdWVfYmZyICA9IG5ldyBCdWZmZXIgJ251bGwnXG4jIHdhcm4gXCJtaW5kIGluY29uc2lzdGVuY2llcyBpbiBIT0xMRVJJVEgyL21haW4gQF96ZXJvX2VuYyBldGNcIlxuIyBAX3plcm8gICAgICAgICAgICA9IHRydWUgIyA/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/P1xuIyBAX3plcm9fZW5jICAgICAgICA9IF9jb2RlY19lbmNvZGUgWyBAX3plcm8sICAgIF1cbiMgQF9sb19lbmMgICAgICAgICAgPSBfY29kZWNfZW5jb2RlIFsgbnVsbCwgICAgICBdXG4jIEBfaGlfZW5jICAgICAgICAgID0gX2NvZGVjX2VuY29kZSBbIENPREVDLiwgXVxuIyBAX2xhc3Rfb2N0ZXQgICAgICA9IG5ldyBCdWZmZXIgWyAweGZmLCBdXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQG5ld19kYiA9ICggcm91dGUgKSAtPlxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGxldmVsX3NldHRpbmdzID1cbiAgICAna2V5RW5jb2RpbmcnOiAgICAgICAgICAnYmluYXJ5J1xuICAgICd2YWx1ZUVuY29kaW5nJzogICAgICAgICdiaW5hcnknXG4gICAgJ2NyZWF0ZUlmTWlzc2luZyc6ICAgICAgdHJ1ZVxuICAgICdlcnJvcklmRXhpc3RzJzogICAgICAgIGZhbHNlXG4gICAgJ2NvbXByZXNzaW9uJzogICAgICAgICAgeWVzXG4gICAgJ3N5bmMnOiAgICAgICAgICAgICAgICAgbm9cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzdWJzdHJhdGUgICAgICAgICAgID0gX25ld19sZXZlbF9kYiByb3V0ZSwgbGV2ZWxfc2V0dGluZ3NcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBSID1cbiAgICAnfmlzYSc6ICAgICAgICAgICAnSE9MTEVSSVRIL2RiJ1xuICAgICclc2VsZic6ICAgICAgICAgIHN1YnN0cmF0ZVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHJldHVybiBSXG5cbiMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEBfcmVvcGVuID0gKCBkYiwgaGFuZGxlciApIC0+XG4jICAgc3RlcCAoIHJlc3VtZSApID0+XG4jICAgICByb3V0ZSA9IGRiWyAnJXNlbGYnIF1bICdsb2NhdGlvbicgXVxuIyAgICAgeWllbGQgZGJbICclc2VsZicgXS5jbG9zZSByZXN1bWVcbiMgICAgIHlpZWxkIGRiWyAnJXNlbGYnIF0ub3BlbiByZXN1bWVcbiMgICAgIHdoaXNwZXIgXCJyZS1vcGVuZWQgTGV2ZWxEQiBhdCAje3JvdXRlfVwiXG4jICAgICBoYW5kbGVyIG51bGxcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AY2xlYXIgPSAoIGRiLCBoYW5kbGVyICkgLT5cbiAgc3RlcCAoIHJlc3VtZSApID0+XG4gICAgcm91dGUgPSBkYlsgJyVzZWxmJyBdWyAnbG9jYXRpb24nIF1cbiAgICB5aWVsZCBkYlsgJyVzZWxmJyBdLmNsb3NlIHJlc3VtZVxuICAgIHlpZWxkIGxldmVsZG93bi5kZXN0cm95IHJvdXRlLCByZXN1bWVcbiAgICB5aWVsZCBkYlsgJyVzZWxmJyBdLm9wZW4gcmVzdW1lXG4gICAgIyBoZWxwIFwiZXJhc2VkIGFuZCByZS1vcGVuZWQgTGV2ZWxEQiBhdCAje3JvdXRlfVwiXG4gICAgaGFuZGxlciBudWxsXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIFdSSVRJTkdcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQCR3cml0ZSA9ICggZGIsIGJ1ZmZlcl9zaXplID0gMTAwMCApIC0+XG4gICMjIyBFeHBlY3RzIGEgSG9sbGVyaXRoIERCIG9iamVjdCBhbmQgYW4gb3B0aW9uYWwgYnVmZmVyIHNpemU7IHJldHVybnMgYSBzdHJlYW0gdHJhbnNmb3JtZXIgdGhhdCBkb2VzIGFsbFxuICBvZiB0aGUgZm9sbG93aW5nOlxuXG4gICogSXQgZXhwZWN0cyBhbiBTTyBrZXkgZm9yIHdoaWNoIGl0IHdpbGwgZ2VuZXJhdGUgYSBjb3JyZXNwb25kaW5nIE9TIGtleS5cbiAgKiBBIGNvcnJlc3BvbmRpbmcgT1Mga2V5IGlzIGZvcm11bGF0ZWQgZXhjZXB0IHdoZW4gdGhlIFNPIGtleSdzIG9iamVjdCB2YWx1ZSBpcyBhIEpTIG9iamVjdCAvIGEgUE9EIChzaW5jZVxuICAgIGluIHRoYXQgY2FzZSwgdGhlIHZhbHVlIHNlcmlhbGl6YXRpb24gaXMgam9sbHkgdXNlbGVzcyBhcyBhbiBpbmRleCkuXG4gICogSXQgc2VuZHMgb24gYm90aCB0aGUgU08gYW5kIHRoZSBPUyBrZXkgZG93bnN0cmVhbSBmb3Igb3B0aW9uYWwgZnVydGhlciBwcm9jZXNzaW5nLlxuICAqIEl0IGZvcm1zIGEgcHJvcGVyIGBub2RlLWxldmVsYC1jb21wYXRpYmxlIGJhdGNoIHJlY29yZCBmb3IgZWFjaCBrZXkgYW5kIGNvbGxlY3QgYWxsIHJlY29yZHNcbiAgICBpbiBhIGJ1ZmZlci5cbiAgKiBXaGVuZXZlciB0aGUgYnVmZmVyIGhhcyBvdXRncm93biB0aGUgZ2l2ZW4gYnVmZmVyIHNpemUsIHRoZSBidWZmZXIgd2lsbCBiZSB3cml0dGVuIGludG8gdGhlIERCIHVzaW5nXG4gICAgYGxldmVsdXBgJ3MgYGJhdGNoYCBjb21tYW5kLlxuICAqIFdoZW4gdGhlIGxhc3QgcGVuZGluZyBiYXRjaCBoYXMgYmVlbiB3cml0dGVuIGludG8gdGhlIERCLCB0aGUgYGVuZGAgZXZlbnQgaXMgY2FsbGVkIG9uIHRoZSBzdHJlYW1cbiAgICBhbmQgbWF5IGJlIGRldGVjdGVkIGRvd25zdHJlYW0uXG5cbiAgIyMjXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgdGhyb3cgbmV3IEVycm9yIFwiYnVmZmVyIHNpemUgbXVzdCBiZSBwb3NpdGl2ZSBpbnRlZ2VyLCBnb3QgI3tycHIgYnVmZmVyX3NpemV9XCIgdW5sZXNzIGJ1ZmZlcl9zaXplID4gMFxuICBidWZmZXIgICAgICA9IFtdXG4gIHN1YnN0cmF0ZSAgID0gZGJbICclc2VsZicgXVxuICBiYXRjaF9jb3VudCA9IDBcbiAgaGFzX2VuZGVkICAgPSBub1xuICBfc2VuZCAgICAgICA9IG51bGxcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBwdXNoID0gKCBrZXksIHZhbHVlICkgPT5cbiAgICB2YWx1ZV9iZnIgPSBpZiB2YWx1ZT8gdGhlbiBAX2VuY29kZV92YWx1ZSBkYiwgdmFsdWUgZWxzZSBAX3plcm9fdmFsdWVfYmZyXG4gICAgYnVmZmVyLnB1c2ggeyB0eXBlOiAncHV0Jywga2V5OiAoIEBfZW5jb2RlX2tleSBkYiwga2V5ICksIHZhbHVlOiB2YWx1ZV9iZnIsIH1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBmbHVzaCA9ID0+XG4gICAgaWYgYnVmZmVyLmxlbmd0aCA+IDBcbiAgICAgIGJhdGNoX2NvdW50ICs9ICsxXG4gICAgICAjICMjIyAtLS0gIyMjXG4gICAgICAjIGZvciB7IGtleSwgdmFsdWUsIH0gaW4gYnVmZmVyXG4gICAgICAjICAgZGVidWcgJ8KpQWJEVTEnLCAoIEBfZGVjb2RlX2tleSBkYiwga2V5ICksICggQF9kZWNvZGVfa2V5IGRiLCB2YWx1ZSApXG4gICAgICAjICMjIyAtLS0gIyMjXG4gICAgICBzdWJzdHJhdGUuYmF0Y2ggYnVmZmVyLCAoIGVycm9yICkgPT5cbiAgICAgICAgdGhyb3cgZXJyb3IgaWYgZXJyb3I/XG4gICAgICAgIGJhdGNoX2NvdW50ICs9IC0xXG4gICAgICAgIF9zZW5kLmVuZCgpIGlmIGhhc19lbmRlZCBhbmQgYmF0Y2hfY291bnQgPCAxXG4gICAgICBidWZmZXIgPSBbXVxuICAgIGVsc2VcbiAgICAgIF9zZW5kLmVuZCgpXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcmV0dXJuICQgKCBzcG8sIHNlbmQsIGVuZCApID0+XG4gICAgIyBkZWJ1ZyAnwqlCcEpRdCcsIHNwb1xuICAgIF9zZW5kID0gc2VuZFxuICAgIGlmIHNwbz9cbiAgICAgIFsgc2JqLCBwcmQsIG9iaiwgXSA9IHNwb1xuICAgICAgcHVzaCBbICdzcG8nLCBzYmosIHByZCwgXSwgb2JqXG4gICAgICAjIGRlYnVnICfCqU9ZbWFEJywgWyAnc3BvJywgc2JqLCBwcmQsIF0sIG9ialxuICAgICAgIyMjIFRBSU5UIHdoYXQgdG8gc2VuZCwgaWYgYW55dGhpbmc/ICMjI1xuICAgICAgIyBzZW5kIGVudHJ5XG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIGlmIENORC5pc2FfcG9kIG9ialxuICAgICAgICAjIyMgRG8gbm90IGNyZWF0ZSBpbmRleCBlbnRyaWVzIGluIGNhc2UgYG9iamAgaXMgYSBQT0Q6ICMjI1xuICAgICAgICBudWxsXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIGVsc2UgaWYgQ05ELmlzYV9saXN0IG9ialxuICAgICAgICAjIyMgQ3JlYXRlIG9uZSBpbmRleCBlbnRyeSBmb3IgZWFjaCBlbGVtZW50IGluIGNhc2UgYG9iamAgaXMgYSBsaXN0OiAjIyNcbiAgICAgICAgZm9yIG9ial9lbGVtZW50LCBvYmpfaWR4IGluIG9ialxuICAgICAgICAgIHB1c2ggWyAncG9zJywgcHJkLCBvYmpfZWxlbWVudCwgc2JqLCBvYmpfaWR4LCBdXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIGVsc2VcbiAgICAgICAgIyMjIENyZWF0ZSBvbmUgaW5kZXggZW50cnkgZm9yIGBvYmpgIG90aGVyd2lzZTogIyMjXG4gICAgICAgIHB1c2ggWyAncG9zJywgcHJkLCBvYmosIHNiaiwgXVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBmbHVzaCgpIGlmIGJ1ZmZlci5sZW5ndGggPj0gYnVmZmVyX3NpemVcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICMjIyBGbHVzaCByZW1haW5pbmcgYnVmZmVyZWQgZW50cmllcyB0byBEQiAjIyNcbiAgICBpZiBlbmQ/XG4gICAgICBoYXNfZW5kZWQgPSB5ZXNcbiAgICAgIGZsdXNoKClcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgUkVBRElOR1xuIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQGNyZWF0ZV9rZXlzdHJlYW0gPSAoIGRiLCBsb19oaW50ID0gbnVsbCwgaGlfaGludCA9IG51bGwgKSAtPlxuIyAgICMjIyBUQUlOVCBjb2RlIGR1cGxpY2F0aW9uICMjI1xuIyAgIGlmIGxvX2hpbnQ/XG4jICAgICBpZiBoaV9oaW50P1xuIyAgICAgICBxdWVyeSA9IHsgZ3RlOiBsb19oaW50LCBsdGU6aGlfaGludCwgfVxuIyAgICAgZWxzZVxuIyAgICAgICBxdWVyeSA9IHsgZ3RlOiBsb19oaW50LCB9XG4jICAgZWxzZSBpZiBoaV9oaW50P1xuIyAgICAgcXVlcnkgPSB7IGx0ZTogaGlfaGludCwgfVxuIyAgIGVsc2VcbiMgICAgIHF1ZXJ5ID0gbnVsbFxuIyAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICBkZWJ1ZyAnwqk4MzVKUCcsIHF1ZXJ5XG4jICAgUiA9IGlmIHF1ZXJ5PyB0aGVuICggZGJbICclc2VsZicgXS5jcmVhdGVLZXlTdHJlYW0gcXVlcnkgKSBlbHNlIGRiWyAnJXNlbGYnIF0uY3JlYXRlS2V5U3RyZWFtKClcbiMgICAjIFIgPSBkYlsgJyVzZWxmJyBdLmNyZWF0ZUtleVN0cmVhbSBAbmV3X3F1ZXJ5IGRiLCBxdWVyeVxuIyAgICMjIyBUQUlOVCBTaG91bGQgd2UgdGVzdCBmb3Igd2VsbC1mb3JtZWQgZW50cmllcyBoZXJlPyAjIyNcbiMgICBSID0gUi5waXBlICQgKCBia2V5LCBzZW5kICkgPT4gc2VuZCBAX2RlY29kZV9rZXkgZGIsIGJrZXlcbiMgICByZXR1cm4gUlxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBjcmVhdGVfcGhyYXNlc3RyZWFtID0gKCBkYiwgbG9faGludCA9IG51bGwsIGhpX2hpbnQgPSBudWxsICkgLT5cbiAgUiA9IEBjcmVhdGVfZmFjZXRzdHJlYW0gZGIsIGxvX2hpbnQsIGhpX2hpbnRcbiAgICAucGlwZSBAJGFzX3BocmFzZSBkYlxuICByZXR1cm4gUlxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBjcmVhdGVfZmFjZXRzdHJlYW0gPSAoIGRiLCBsb19oaW50ID0gbnVsbCwgaGlfaGludCA9IG51bGwgKSAtPlxuICAjIyNcbiAgKiBJZiBubyBoaW50IGlzIGdpdmVuLCBhbGwgZW50cmllcyB3aWxsIGJlIGdpdmVuIGluIHRoZSBzdHJlYW0uXG4gICogSWYgYm90aCBgbG9faGludGAgYW5kIGBoaV9oaW50YCBhcmUgZ2l2ZW4sIGEgcXVlcnkgd2l0aCBsb3dlciBhbmQgdXBwZXIsIGluY2x1c2l2ZSBib3VuZGFyaWVzIGlzXG4gICAgaXNzdWVkLlxuICAqIElmIG9ubHkgYGxvX2hpbnRgIGlzIGdpdmVuLCBhIHByZWZpeCBxdWVyeSBpcyBpc3N1ZWQuXG4gICogSWYgYGhpX2hpbnRgIGlzIGdpdmVuIGJ1dCBgbG9faGludGAgaXMgbWlzc2luZywgYW4gZXJyb3IgaXMgaXNzdWVkLlxuICAjIyNcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBpZiBoaV9oaW50PyBhbmQgbm90IGxvX2hpbnQ/XG4gICAgdGhyb3cgbmV3IEVycm9yIFwibXVzdCBnaXZlIGBsb19oaW50YCB3aGVuIGBoaV9oaW50YCBpcyBnaXZlblwiXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgaWYgbG9faGludCBhbmQgbm90IGhpX2hpbnQ/XG4gICAgcXVlcnkgICAgICAgPSBAX3F1ZXJ5X2Zyb21fcHJlZml4IGRiLCBsb19oaW50XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZWxzZVxuICAgIGxvX2hpbnRfYmZyID0gaWYgbG9faGludD8gdGhlbiAoICAgICAgICBAX2VuY29kZV9rZXkgZGIsIGxvX2hpbnQgKSAgICAgICAgICBlbHNlIENPREVDWyAna2V5cycgXVsgJ2xvJyBdXG4gICAgaGlfaGludF9iZnIgPSBpZiBoaV9oaW50PyB0aGVuICggQF9xdWVyeV9mcm9tX3ByZWZpeCBkYiwgaGlfaGludCApWyAnbHRlJyBdIGVsc2UgQ09ERUNbICdrZXlzJyBdWyAnaGknIF1cbiAgICBxdWVyeSAgICAgICA9IHsgZ3RlOiBsb19oaW50X2JmciwgbHRlOiBoaV9oaW50X2JmciwgfVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICMjIyBUQUlOVCBTaG91bGQgd2UgdGVzdCBmb3Igd2VsbC1mb3JtZWQgZW50cmllcyBoZXJlPyAjIyNcbiAgUiA9IGRiWyAnJXNlbGYnIF0uY3JlYXRlUmVhZFN0cmVhbSBxdWVyeVxuICBSID0gUi5waXBlICQgKCB7IGtleSwgdmFsdWUgfSwgc2VuZCApID0+IHNlbmQgWyAoIEBfZGVjb2RlX2tleSBkYiwga2V5ICksICggQF9kZWNvZGVfdmFsdWUgZGIsIHZhbHVlICksIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICByZXR1cm4gUlxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkByZWFkX21hbnkgPSAoIGRiLCBoaW50ID0gbnVsbCApIC0+XG4gICMjIyBIaW50cyBhcmUgaW50ZXJwcmV0ZWQgYXMgcGFydGlhbCBzZWNvbmRhcnkgKFBPUykga2V5cy4gIyMjXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQHJlYWRfb25lID0gKCBkYiwga2V5LCBmYWxsYmFjayA9IEBfbWlzZml0LCBoYW5kbGVyICkgLT5cbiAgIyMjIEhpbnRzIGFyZSBpbnRlcnByZXRlZCBhcyBjb21wbGV0ZSBwcmltYXJ5IChTUE8pIGtleXMuICMjI1xuICBzd2l0Y2ggYXJpdHkgPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgd2hlbiAzXG4gICAgICBoYW5kbGVyICAgPSBmYWxsYmFja1xuICAgICAgZmFsbGJhY2sgID0gQF9taXNmaXRcbiAgICB3aGVuIDQgdGhlbiBudWxsXG4gICAgZWxzZSB0aHJvdyBuZXcgRXJyb3IgXCJleHBlY3RlZCAzIG9yIDQgYXJndW1lbnRzLCBnb3QgI3thcml0eX1cIlxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGRiWyAnJXNlbGYnIF0uZ2V0IGtleSwgaGFuZGxlclxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkByZWFkX3N1YiA9ICggZGIsIHNldHRpbmdzLCByZWFkICkgLT5cbiAgc3dpdGNoIGFyaXR5ID0gYXJndW1lbnRzLmxlbmd0aFxuICAgIHdoZW4gMlxuICAgICAgcmVhZCAgICAgID0gc2V0dGluZ3NcbiAgICAgIHNldHRpbmdzICA9IG51bGxcbiAgICB3aGVuIDNcbiAgICAgIG51bGxcbiAgICBlbHNlXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJleHBlY3RlZCAyIG9yIDMgYXJndW1lbnRzLCBnb3QgI3thcml0eX1cIlxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGluZGV4ZWQgICAgICAgICAgID0gc2V0dGluZ3M/WyAnaW5kZXhlZCcgICAgXSA/IG5vXG4gICMgdHJhbnNmb3JtICAgICAgICAgPSBzZXR0aW5ncz9bICd0cmFuc2Zvcm0nICBdID8gRC4kcGFzc190aHJvdWdoKClcbiAgbWFuZ2xlICAgICAgICAgICAgPSBzZXR0aW5ncz9bICdtYW5nbGUnICAgICBdID8gKCBkYXRhICkgLT4gZGF0YVxuICBzZW5kX2VtcHR5ICAgICAgICA9IHNldHRpbmdzP1sgJ2VtcHR5JyAgICAgIF0gPyBub1xuICBpbnNlcnRfaW5kZXggICAgICA9IGlmIGluZGV4ZWQgdGhlbiBELm5ld19pbmRleGVyKCkgZWxzZSAoIHggKSAtPiB4XG4gIG9wZW5fc3RyZWFtX2NvdW50ID0gMFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHJldHVybiAkICggb3V0ZXJfZGF0YSwgb3V0ZXJfc2VuZCwgb3V0ZXJfZW5kICkgPT5cbiAgICBjb3VudCA9IDBcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGlmIG91dGVyX2RhdGE/XG4gICAgICBvcGVuX3N0cmVhbV9jb3VudCAgICArPSArMVxuICAgICAgc3ViX2lucHV0ICAgICAgICAgICAgID0gcmVhZCBvdXRlcl9kYXRhXG4gICAgICBbIG1lbW8sIHN1Yl9pbnB1dCwgXSAgPSBpZiBDTkQuaXNhX2xpc3Qgc3ViX2lucHV0IHRoZW4gc3ViX2lucHV0IGVsc2UgWyBAX21pc2ZpdCwgc3ViX2lucHV0LCBdXG4gICAgICBzdWJfaW5wdXRcbiAgICAgICAgIyAucGlwZSB0cmFuc2Zvcm1cbiAgICAgICAgLnBpcGUgZG8gPT5cbiAgICAgICAgICAjIyMgVEFJTlQgbm8gbmVlZCB0byBidWlsZCBidWZmZXIgaWYgbm90IGBzZW5kX2VtcHR5YCBhbmQgdGhlcmUgYXJlIG5vIHJlc3VsdHMgIyMjXG4gICAgICAgICAgYnVmZmVyID0gaWYgbWVtbyBpcyBAX21pc2ZpdCB0aGVuIFtdIGVsc2UgWyBtZW1vLCBdXG4gICAgICAgICAgcmV0dXJuICQgKCBpbm5lcl9kYXRhLCBfLCBpbm5lcl9lbmQgKSA9PlxuICAgICAgICAgICAgaWYgaW5uZXJfZGF0YT9cbiAgICAgICAgICAgICAgaW5uZXJfZGF0YSA9IG1hbmdsZSBpbm5lcl9kYXRhXG4gICAgICAgICAgICAgIGlmIGlubmVyX2RhdGE/XG4gICAgICAgICAgICAgICAgY291bnQgKz0gKzFcbiAgICAgICAgICAgICAgICBidWZmZXIucHVzaCBpbm5lcl9kYXRhXG4gICAgICAgICAgICBpZiBpbm5lcl9lbmQ/XG4gICAgICAgICAgICAgIGlmIHNlbmRfZW1wdHkgb3IgY291bnQgPiAwXG4gICAgICAgICAgICAgICAgb3V0ZXJfc2VuZCBpbnNlcnRfaW5kZXggYnVmZmVyXG4gICAgICAgICAgICAgIG9wZW5fc3RyZWFtX2NvdW50ICs9IC0xXG4gICAgICAgICAgICAgIGlubmVyX2VuZCgpXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpZiBvdXRlcl9lbmQ/XG4gICAgICByZXBlYXRfaW1tZWRpYXRlbHkgLT5cbiAgICAgICAgcmV0dXJuIHRydWUgdW5sZXNzIG9wZW5fc3RyZWFtX2NvdW50IGlzIDBcbiAgICAgICAgb3V0ZXJfZW5kKClcbiAgICAgICAgcmV0dXJuIGZhbHNlXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIEtFWVMgJiBWQUxVRVNcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9lbmNvZGVfa2V5ID0gKCBkYiwga2V5LCBleHRyYV9ieXRlICkgLT5cbiAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBrZXkgI3tycHIga2V5fVwiIGlmIGtleSBpcyB1bmRlZmluZWRcbiAgcmV0dXJuIF9jb2RlY19lbmNvZGUga2V5LCBleHRyYV9ieXRlXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9kZWNvZGVfa2V5ID0gKCBkYiwga2V5ICkgLT5cbiAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBrZXkgI3tycHIga2V5fVwiIGlmICggUiA9IF9jb2RlY19kZWNvZGUga2V5ICkgaXMgdW5kZWZpbmVkXG4gIHJldHVybiBSXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9lbmNvZGVfdmFsdWUgPSAoIGRiLCB2YWx1ZSAgICAgICkgLT4gSlNPTi5zdHJpbmdpZnkgdmFsdWVcbkBfZGVjb2RlX3ZhbHVlID0gKCBkYiwgdmFsdWVfYmZyICApIC0+IEpTT04ucGFyc2UgICAgIHZhbHVlX2Jmci50b1N0cmluZyAndXRmLTgnXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyMjIE5CIEFyZ3VtZW50IG9yZGVyaW5nIGZvciB0aGVzZSBmdW5jdGlvbiBpcyBhbHdheXMgc3ViamVjdCBiZWZvcmUgb2JqZWN0LCByZWdhcmRsZXNzIG9mIHRoZSBwaHJhc2V0eXBlXG5hbmQgdGhlIG9yZGVyaW5nIGluIHRoZSByZXN1bHRpbmcga2V5LiAjIyNcbkBuZXdfa2V5ID0gKCBkYiwgcGhyYXNldHlwZSwgc2ssIHN2LCBvaywgb3YsIGlkeCApIC0+XG4gIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgcGhyYXNldHlwZTogI3tycHIgcGhyYXNldHlwZX1cIiB1bmxlc3MgcGhyYXNldHlwZSBpbiBbICdzbycsICdvcycsIF1cbiAgWyBzaywgc3YsIG9rLCBvdiwgXSA9IFsgb2ssIG92LCBzaywgc3YsIF0gaWYgcGhyYXNldHlwZSBpcyAnb3MnXG4gIHJldHVybiBbIHBocmFzZXR5cGUsIHNrLCBzdiwgb2ssIG92LCAoIGlkeCA/IDAgKSwgXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBuZXdfc29fa2V5ID0gKCBkYiwgUC4uLiApIC0+IEBuZXdfa2V5IGRiLCAnc28nLCBQLi4uXG5AbmV3X29zX2tleSA9ICggZGIsIFAuLi4gKSAtPiBAbmV3X2tleSBkYiwgJ29zJywgUC4uLlxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfbmV3X29zX2tleV9mcm9tX3NvX2tleSA9ICggZGIsIHNvX2tleSApIC0+XG4gIFsgcGhyYXNldHlwZSwgc2ssIHN2LCBvaywgb3YsIGlkeCwgXSA9IEBhc19waHJhc2UgZGIsIHNvX2tleVxuICB0aHJvdyBuZXcgRXJyb3IgXCJleHBlY3RlZCBwaHJhc2V0eXBlICdzbycsIGdvdCAje3JwciBwaHJhc2V0eXBlfVwiIHVubGVzcyBwaHJhc2V0eXBlIGlzICdzbydcbiAgcmV0dXJuIFsgJ29zJywgb2ssIG92LCBzaywgc3YsIGlkeCwgXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBuZXdfa2V5cyA9ICggZGIsIHBocmFzZXR5cGUsIHNrLCBzdiwgb2ssIG92LCBpZHggKSAtPlxuICBvdGhlcl9waHJhc2V0eXBlICA9IGlmIHBocmFzZXR5cGUgaXMgJ3NvJyB0aGVuICdvcycgZWxzZSAnc28nXG4gIHJldHVybiBbXG4gICAgKCBAbmV3X2tleSBkYiwgICAgICAgcGhyYXNldHlwZSwgc2ssIHN2LCBvaywgb3YsIGlkeCApLFxuICAgICggQG5ld19rZXkgZGIsIG90aGVyX3BocmFzZXR5cGUsIHNrLCBzdiwgb2ssIG92LCBpZHggKSwgXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBhc19waHJhc2UgPSAoIGRiLCBrZXksIHZhbHVlICkgLT5cbiAgc3dpdGNoIHBocmFzZXR5cGUgPSBrZXlbIDAgXVxuICAgIHdoZW4gJ3NwbydcbiAgICAgIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgU1BPIGtleSAobGVuZ3RoICN7bGVuZ3RofSlcIiB1bmxlc3MgKCBsZW5ndGggPSBrZXkubGVuZ3RoICkgaXMgM1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCB2YWx1ZSAoMSkgI3tycHIgdmFsdWV9XCIgaWYgdmFsdWUgaW4gWyB1bmRlZmluZWQsIF1cbiAgICAgIHJldHVybiBbIGtleVsgMSBdLCBrZXlbIDIgXSwgdmFsdWUsIF1cbiAgICB3aGVuICdwb3MnXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIFBPUyBrZXkgKGxlbmd0aCAje2xlbmd0aH0pXCIgdW5sZXNzIDQgPD0gKCBsZW5ndGggPSBrZXkubGVuZ3RoICkgPD0gNVxuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCB2YWx1ZSAoMikgI3tycHIgdmFsdWV9XCIgaWYgbm90ICggdmFsdWUgaW4gWyBudWxsLCBdIClcbiAgICAgIFsgXywgcHJkLCBvYmosIHNiaiwgaWR4LCBdID0ga2V5XG4gICAgICByZXR1cm4gaWYgaWR4PyB0aGVuIFsgc2JqLCBwcmQsIG9iaiwgaWR4LCBdIGVsc2UgWyBzYmosIHByZCwgb2JqLCBdXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQCRhc19waHJhc2UgPSAoIGRiICkgLT5cbiAgcmV0dXJuICQgKCBkYXRhLCBzZW5kICkgPT5cbiAgICBzZW5kIEBhc19waHJhc2UgZGIsIGRhdGEuLi5cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5Aa2V5X2Zyb21fdXJsID0gKCBkYiwgdXJsICkgLT5cbiAgIyMjIFRBSU4gZG9lcyBub3QgdW5lc2NhcGUgYXMgeWV0ICMjI1xuICAjIyMgVEFJTiBkb2VzIG5vdCBjYXN0IHZhbHVlcyBhcyB5ZXQgIyMjXG4gICMjIyBUQUlOVCBkb2VzIG5vdCBzdXBwb3J0IG11bHRpcGxlIGluZGV4ZXMgYXMgeWV0ICMjI1xuICBbIHBocmFzZXR5cGUsIGZpcnN0LCBzZWNvbmQsIGlkeCwgXSA9IHVybC5zcGxpdCAnfCdcbiAgdW5sZXNzIHBocmFzZXR5cGU/IGFuZCBwaHJhc2V0eXBlLmxlbmd0aCA+IDAgYW5kIHBocmFzZXR5cGUgaW4gWyAnc28nLCAnb3MnLCBdXG4gICAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBVUkwga2V5ICN7cnByIHVybH1cIlxuICB1bmxlc3MgZmlyc3Q/IGFuZCBmaXJzdC5sZW5ndGggPiAwIGFuZCBzZWNvbmQ/IGFuZCBzZWNvbmQubGVuZ3RoID4gMFxuICAgIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgVVJMIGtleSAje3JwciB1cmx9XCJcbiAgaWR4ID0gaWYgKCBpZHg/IGFuZCBpZHgubGVuZ3RoID4gMCApIHRoZW4gKCBwYXJzZUludCBpZHgsIDEwICkgZWxzZSAwXG4gIFsgc2ssIHN2LCBdID0gIGZpcnN0LnNwbGl0ICc6J1xuICBbIG9rLCBvdiwgXSA9IHNlY29uZC5zcGxpdCAnOidcbiAgdW5sZXNzIHNrPyBhbmQgc2subGVuZ3RoID4gMCBhbmQgb2s/IGFuZCBvay5sZW5ndGggPiAwXG4gICAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBVUkwga2V5ICN7cnByIHVybH1cIlxuICBbIHNrLCBzdiwgb2ssIG92LCBdID0gWyBvaywgb3YsIHNrLCBzdiwgXSBpZiBwaHJhc2V0eXBlIGlzICdvcydcbiAgcmV0dXJuIFsgcGhyYXNldHlwZSwgc2ssIHN2LCBvaywgb3YsIGlkeCwgXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkB1cmxfZnJvbV9rZXkgPSAoIGRiLCBrZXkgKSAtPlxuICBpZiAoIEBfdHlwZV9mcm9tX2tleSBkYiwga2V5ICkgaXMgJ2xpc3QnXG4gICAgWyBwaHJhc2V0eXBlLCBrMCwgdjAsIGsxLCB2MSwgaWR4LCBdID0ga2V5XG4gICAgaWR4X3JwciA9IGlmIGlkeD8gdGhlbiBycHIgaWR4IGVsc2UgJydcbiAgICAjIyMgVEFJTlQgc2hvdWxkIGVzY2FwZSBtZXRhY2hycyBgfGAsICc6JyAjIyNcbiAgICAjIyMgVEFJTlQgc2hvdWxkIHVzZSBgcnByYCBvbiBwYXJ0cyBvZiBzcGVlY2ggKGUuZy4gb2JqZWN0IHZhbHVlIGNvdWxkIGJlIGEgbnVtYmVyIGV0Yy4pICMjI1xuICAgIHJldHVybiBcIiN7cGhyYXNldHlwZX18I3trMH06I3t2MH18I3trMX06I3t2MX18I3tpZHhfcnByfVwiXG4gIHJldHVybiBcIiN7cnByIGtleX1cIlxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkAkdXJsX2Zyb21fa2V5ID0gKCBkYiApIC0+ICQgKCBrZXksIHNlbmQgKSA9PiBzZW5kIEB1cmxfZnJvbV9rZXkgZGIsIGtleVxuQCRrZXlfZnJvbV91cmwgPSAoIGRiICkgLT4gJCAoIHVybCwgc2VuZCApID0+IHNlbmQgQGtleV9mcm9tX3VybCBkYiwga2V5XG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF90eXBlX2Zyb21fa2V5ID0gKCBkYiwga2V5ICkgLT5cbiAgaWYgQXJyYXkuaXNBcnJheSBrZXlcbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIGtleTogI3tycHIga2V5fVwiIHVubGVzcyBrZXkubGVuZ3RoIGlzIDZcbiAgICBbIHBocmFzZXR5cGUsIGZpcnN0LCBzZWNvbmQsIGlkeCwgXSA9IGtleVxuICAgIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgcGhyYXNldHlwZTogI3tycHIga2V5fVwiIHVubGVzcyBwaHJhc2V0eXBlIGluIFsgJ3NvJywgJ29zJywgXVxuICAgIHJldHVybiAnbGlzdCdcbiAgcmV0dXJuICdvdGhlcidcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgUFJFRklYRVMgJiBRVUVSSUVTXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfcXVlcnlfZnJvbV9wcmVmaXggPSAoIGRiLCBsb19oaW50ICkgLT5cbiAgYmFzZSAgPSBAX2VuY29kZV9rZXkgZGIsIGxvX2hpbnQsIDB4ZmZcbiAgZ3RlICAgPSBiYXNlLnNsaWNlIDAsIGJhc2UubGVuZ3RoIC0gMVxuICBsdGUgICA9IGJhc2Uuc2xpY2UgMCwgYmFzZS5sZW5ndGhcbiAgcmV0dXJuIHsgZ3RlLCBsdGUsIH1cblxuXG5cblxuXG4iXX0=