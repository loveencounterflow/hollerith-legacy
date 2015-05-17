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
    var _send, batch_count, buffer, buffer_size, flush, has_ended, push, ref, ref1, solid_predicates, substrate;
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
    if (!(buffer_size > 0)) {
      throw new Error("buffer size must be positive integer, got " + (rpr(buffer_size)));
    }
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
    })(this));
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

//# sourceMappingURL=data:application/json;base64,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LE1BQUE7QUFPRTtBQUFBLDhEQUFBO0FBQUEsTUFDQSxJQUFBLEdBQVEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxFQUFiLEVBQWlCLE9BQWpCLEVBQTBCLEtBQU8sQ0FBQSxhQUFBLENBQWtCLENBQUEsSUFBQSxDQUFuRCxDQURSLENBQUE7QUFBQSxNQUVBLEdBQUEsR0FBUSxJQUFJLENBQUMsS0FBTCxDQUFXLENBQVgsRUFBYyxJQUFJLENBQUMsTUFBTCxHQUFjLENBQTVCLENBRlIsQ0FBQTtBQUFBLE1BR0EsR0FBQSxHQUFRLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBWCxFQUFjLElBQUksQ0FBQyxNQUFuQixDQUhSLENBUEY7S0FBQTtBQVdBLFdBQU87QUFBQSxNQUFFLEtBQUEsR0FBRjtBQUFBLE1BQU8sS0FBQSxHQUFQO0tBQVAsQ0Fib0I7RUFBQSxDQTFZdEIsQ0FBQTtBQUFBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJcblxuXG4jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiMgbmpzX3V0aWwgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ3V0aWwnXG4jIG5qc19wYXRoICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdwYXRoJ1xuIyBuanNfZnMgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnZnMnXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkNORCAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdjbmQnXG5ycHIgICAgICAgICAgICAgICAgICAgICAgID0gQ05ELnJwclxuYmFkZ2UgICAgICAgICAgICAgICAgICAgICA9ICdIT0xMRVJJVEgvbWFpbidcbmxvZyAgICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAncGxhaW4nLCAgICAgYmFkZ2VcbmRlYnVnICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnZGVidWcnLCAgICAgYmFkZ2Vcbndhcm4gICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnd2FybicsICAgICAgYmFkZ2VcbmhlbHAgICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnaGVscCcsICAgICAgYmFkZ2VcbnVyZ2UgICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAndXJnZScsICAgICAgYmFkZ2VcbndoaXNwZXIgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnd2hpc3BlcicsICAgYmFkZ2VcbmVjaG8gICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZWNoby5iaW5kIENORFxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5zdXNwZW5kICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnY29mZmVlbm9kZS1zdXNwZW5kJ1xuc3RlcCAgICAgICAgICAgICAgICAgICAgICA9IHN1c3BlbmQuc3RlcFxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5DT0RFQyAgICAgICAgICAgICAgICAgICAgID0gQENPREVDID0gcmVxdWlyZSAnLi9jb2RlYydcbkRVTVAgICAgICAgICAgICAgICAgICAgICAgPSBARFVNUCAgPSByZXF1aXJlICcuL2R1bXAnXG5fY29kZWNfZW5jb2RlICAgICAgICAgICAgID0gQ09ERUMuZW5jb2RlLmJpbmQgQ09ERUNcbl9jb2RlY19kZWNvZGUgICAgICAgICAgICAgPSBDT0RFQy5kZWNvZGUuYmluZCBDT0RFQ1xuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5EICAgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAncGlwZWRyZWFtczInXG4kICAgICAgICAgICAgICAgICAgICAgICAgID0gRC5yZW1pdC5iaW5kIERcbl9uZXdfbGV2ZWxfZGIgICAgICAgICAgICAgPSByZXF1aXJlICdsZXZlbCdcbmxldmVsZG93biAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdsZXZlbC9ub2RlX21vZHVsZXMvbGV2ZWxkb3duJ1xuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5zdXNwZW5kICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnY29mZmVlbm9kZS1zdXNwZW5kJ1xuc3RlcCAgICAgICAgICAgICAgICAgICAgICA9IHN1c3BlbmQuc3RlcFxucmVwZWF0X2ltbWVkaWF0ZWx5ICAgICAgICA9IHN1c3BlbmQucmVwZWF0X2ltbWVkaWF0ZWx5XG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkxPREFTSCAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdsb2Rhc2gnXG5cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AcGhyYXNldHlwZXMgICAgICA9IFsgJ3BvcycsICdzcG8nLCBdXG5AX21pc2ZpdCAgICAgICAgICA9IFN5bWJvbCAnbWlzZml0J1xuQF96ZXJvX3ZhbHVlX2JmciAgPSBuZXcgQnVmZmVyICdudWxsJ1xuIyB3YXJuIFwibWluZCBpbmNvbnNpc3RlbmNpZXMgaW4gSE9MTEVSSVRIMi9tYWluIEBfemVyb19lbmMgZXRjXCJcbiMgQF96ZXJvICAgICAgICAgICAgPSB0cnVlICMgPz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz9cbiMgQF96ZXJvX2VuYyAgICAgICAgPSBfY29kZWNfZW5jb2RlIFsgQF96ZXJvLCAgICBdXG4jIEBfbG9fZW5jICAgICAgICAgID0gX2NvZGVjX2VuY29kZSBbIG51bGwsICAgICAgXVxuIyBAX2hpX2VuYyAgICAgICAgICA9IF9jb2RlY19lbmNvZGUgWyBDT0RFQy4sIF1cbiMgQF9sYXN0X29jdGV0ICAgICAgPSBuZXcgQnVmZmVyIFsgMHhmZiwgXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBuZXdfZGIgPSAoIHJvdXRlICkgLT5cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBsZXZlbF9zZXR0aW5ncyA9XG4gICAgJ2tleUVuY29kaW5nJzogICAgICAgICAgJ2JpbmFyeSdcbiAgICAndmFsdWVFbmNvZGluZyc6ICAgICAgICAnYmluYXJ5J1xuICAgICdjcmVhdGVJZk1pc3NpbmcnOiAgICAgIHRydWVcbiAgICAnZXJyb3JJZkV4aXN0cyc6ICAgICAgICBmYWxzZVxuICAgICdjb21wcmVzc2lvbic6ICAgICAgICAgIHllc1xuICAgICdzeW5jJzogICAgICAgICAgICAgICAgIG5vXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3Vic3RyYXRlICAgICAgICAgICA9IF9uZXdfbGV2ZWxfZGIgcm91dGUsIGxldmVsX3NldHRpbmdzXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgUiA9XG4gICAgJ35pc2EnOiAgICAgICAgICAgJ0hPTExFUklUSC9kYidcbiAgICAnJXNlbGYnOiAgICAgICAgICBzdWJzdHJhdGVcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICByZXR1cm4gUlxuXG4jICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBAX3Jlb3BlbiA9ICggZGIsIGhhbmRsZXIgKSAtPlxuIyAgIHN0ZXAgKCByZXN1bWUgKSA9PlxuIyAgICAgcm91dGUgPSBkYlsgJyVzZWxmJyBdWyAnbG9jYXRpb24nIF1cbiMgICAgIHlpZWxkIGRiWyAnJXNlbGYnIF0uY2xvc2UgcmVzdW1lXG4jICAgICB5aWVsZCBkYlsgJyVzZWxmJyBdLm9wZW4gcmVzdW1lXG4jICAgICB3aGlzcGVyIFwicmUtb3BlbmVkIExldmVsREIgYXQgI3tyb3V0ZX1cIlxuIyAgICAgaGFuZGxlciBudWxsXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQGNsZWFyID0gKCBkYiwgaGFuZGxlciApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHJvdXRlID0gZGJbICclc2VsZicgXVsgJ2xvY2F0aW9uJyBdXG4gICAgeWllbGQgZGJbICclc2VsZicgXS5jbG9zZSByZXN1bWVcbiAgICB5aWVsZCBsZXZlbGRvd24uZGVzdHJveSByb3V0ZSwgcmVzdW1lXG4gICAgeWllbGQgZGJbICclc2VsZicgXS5vcGVuIHJlc3VtZVxuICAgICMgaGVscCBcImVyYXNlZCBhbmQgcmUtb3BlbmVkIExldmVsREIgYXQgI3tyb3V0ZX1cIlxuICAgIGhhbmRsZXIgbnVsbFxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyBXUklUSU5HXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkAkd3JpdGUgPSAoIGRiLCBzZXR0aW5ncyApIC0+XG4gICMjIyBFeHBlY3RzIGEgSG9sbGVyaXRoIERCIG9iamVjdCBhbmQgYW4gb3B0aW9uYWwgYnVmZmVyIHNpemU7IHJldHVybnMgYSBzdHJlYW0gdHJhbnNmb3JtZXIgdGhhdCBkb2VzIGFsbFxuICBvZiB0aGUgZm9sbG93aW5nOlxuXG4gICogSXQgZXhwZWN0cyBhbiBTTyBrZXkgZm9yIHdoaWNoIGl0IHdpbGwgZ2VuZXJhdGUgYSBjb3JyZXNwb25kaW5nIE9TIGtleS5cbiAgKiBBIGNvcnJlc3BvbmRpbmcgT1Mga2V5IGlzIGZvcm11bGF0ZWQgZXhjZXB0IHdoZW4gdGhlIFNPIGtleSdzIG9iamVjdCB2YWx1ZSBpcyBhIEpTIG9iamVjdCAvIGEgUE9EIChzaW5jZVxuICAgIGluIHRoYXQgY2FzZSwgdGhlIHZhbHVlIHNlcmlhbGl6YXRpb24gaXMgam9sbHkgdXNlbGVzcyBhcyBhbiBpbmRleCkuXG4gICogSXQgc2VuZHMgb24gYm90aCB0aGUgU08gYW5kIHRoZSBPUyBrZXkgZG93bnN0cmVhbSBmb3Igb3B0aW9uYWwgZnVydGhlciBwcm9jZXNzaW5nLlxuICAqIEl0IGZvcm1zIGEgcHJvcGVyIGBub2RlLWxldmVsYC1jb21wYXRpYmxlIGJhdGNoIHJlY29yZCBmb3IgZWFjaCBrZXkgYW5kIGNvbGxlY3QgYWxsIHJlY29yZHNcbiAgICBpbiBhIGJ1ZmZlci5cbiAgKiBXaGVuZXZlciB0aGUgYnVmZmVyIGhhcyBvdXRncm93biB0aGUgZ2l2ZW4gYnVmZmVyIHNpemUsIHRoZSBidWZmZXIgd2lsbCBiZSB3cml0dGVuIGludG8gdGhlIERCIHVzaW5nXG4gICAgYGxldmVsdXBgJ3MgYGJhdGNoYCBjb21tYW5kLlxuICAqIFdoZW4gdGhlIGxhc3QgcGVuZGluZyBiYXRjaCBoYXMgYmVlbiB3cml0dGVuIGludG8gdGhlIERCLCB0aGUgYGVuZGAgZXZlbnQgaXMgY2FsbGVkIG9uIHRoZSBzdHJlYW1cbiAgICBhbmQgbWF5IGJlIGRldGVjdGVkIGRvd25zdHJlYW0uXG5cbiAgIyMjXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc2V0dGluZ3MgICAgICAgICA/PSB7fVxuICBidWZmZXJfc2l6ZSAgICAgICA9IHNldHRpbmdzWyAnYmF0Y2gnICBdID8gMTAwMDBcbiAgc29saWRfcHJlZGljYXRlcyAgPSBzZXR0aW5nc1sgJ3NvbGlkcycgXSA/IFtdXG4gIGJ1ZmZlciAgICAgICAgICAgID0gW11cbiAgc3Vic3RyYXRlICAgICAgICAgPSBkYlsgJyVzZWxmJyBdXG4gIGJhdGNoX2NvdW50ICAgICAgID0gMFxuICBoYXNfZW5kZWQgICAgICAgICA9IG5vXG4gIF9zZW5kICAgICAgICAgICAgID0gbnVsbFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHRocm93IG5ldyBFcnJvciBcImJ1ZmZlciBzaXplIG11c3QgYmUgcG9zaXRpdmUgaW50ZWdlciwgZ290ICN7cnByIGJ1ZmZlcl9zaXplfVwiIHVubGVzcyBidWZmZXJfc2l6ZSA+IDBcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBwdXNoID0gKCBrZXksIHZhbHVlICkgPT5cbiAgICB2YWx1ZV9iZnIgPSBpZiB2YWx1ZT8gdGhlbiBAX2VuY29kZV92YWx1ZSBkYiwgdmFsdWUgZWxzZSBAX3plcm9fdmFsdWVfYmZyXG4gICAgYnVmZmVyLnB1c2ggeyB0eXBlOiAncHV0Jywga2V5OiAoIEBfZW5jb2RlX2tleSBkYiwga2V5ICksIHZhbHVlOiB2YWx1ZV9iZnIsIH1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBmbHVzaCA9ID0+XG4gICAgaWYgYnVmZmVyLmxlbmd0aCA+IDBcbiAgICAgIGJhdGNoX2NvdW50ICs9ICsxXG4gICAgICBzdWJzdHJhdGUuYmF0Y2ggYnVmZmVyLCAoIGVycm9yICkgPT5cbiAgICAgICAgdGhyb3cgZXJyb3IgaWYgZXJyb3I/XG4gICAgICAgIGJhdGNoX2NvdW50ICs9IC0xXG4gICAgICAgIF9zZW5kLmVuZCgpIGlmIGhhc19lbmRlZCBhbmQgYmF0Y2hfY291bnQgPCAxXG4gICAgICBidWZmZXIgPSBbXVxuICAgIGVsc2VcbiAgICAgIF9zZW5kLmVuZCgpXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcmV0dXJuICQgKCBzcG8sIHNlbmQsIGVuZCApID0+XG4gICAgX3NlbmQgPSBzZW5kXG4gICAgaWYgc3BvP1xuICAgICAgWyBzYmosIHByZCwgb2JqLCBdID0gc3BvXG4gICAgICBwdXNoIFsgJ3NwbycsIHNiaiwgcHJkLCBdLCBvYmpcbiAgICAgICMjIyBUQUlOVCB3aGF0IHRvIHNlbmQsIGlmIGFueXRoaW5nPyAjIyNcbiAgICAgICMgc2VuZCBlbnRyeVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBpZiBDTkQuaXNhX3BvZCBvYmpcbiAgICAgICAgIyMjIERvIG5vdCBjcmVhdGUgaW5kZXggZW50cmllcyBpbiBjYXNlIGBvYmpgIGlzIGEgUE9EOiAjIyNcbiAgICAgICAgbnVsbFxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBlbHNlIGlmIENORC5pc2FfbGlzdCBvYmpcbiAgICAgICAgaWYgcHJkIGluIHNvbGlkX3ByZWRpY2F0ZXNcbiAgICAgICAgICBwdXNoIFsgJ3BvcycsIHByZCwgb2JqLCBzYmosIF1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICMjIyBDcmVhdGUgb25lIGluZGV4IGVudHJ5IGZvciBlYWNoIGVsZW1lbnQgaW4gY2FzZSBgb2JqYCBpcyBhIGxpc3Q6ICMjI1xuICAgICAgICAgIGZvciBvYmpfZWxlbWVudCwgb2JqX2lkeCBpbiBvYmpcbiAgICAgICAgICAgIHB1c2ggWyAncG9zJywgcHJkLCBvYmpfZWxlbWVudCwgc2JqLCBvYmpfaWR4LCBdXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIGVsc2VcbiAgICAgICAgIyMjIENyZWF0ZSBvbmUgaW5kZXggZW50cnkgZm9yIGBvYmpgIG90aGVyd2lzZTogIyMjXG4gICAgICAgIHB1c2ggWyAncG9zJywgcHJkLCBvYmosIHNiaiwgXVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBmbHVzaCgpIGlmIGJ1ZmZlci5sZW5ndGggPj0gYnVmZmVyX3NpemVcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICMjIyBGbHVzaCByZW1haW5pbmcgYnVmZmVyZWQgZW50cmllcyB0byBEQiAjIyNcbiAgICBpZiBlbmQ/XG4gICAgICBoYXNfZW5kZWQgPSB5ZXNcbiAgICAgIGZsdXNoKClcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgUkVBRElOR1xuIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQGNyZWF0ZV9rZXlzdHJlYW0gPSAoIGRiLCBsb19oaW50ID0gbnVsbCwgaGlfaGludCA9IG51bGwgKSAtPlxuIyAgICMjIyBUQUlOVCBjb2RlIGR1cGxpY2F0aW9uICMjI1xuIyAgIGlmIGxvX2hpbnQ/XG4jICAgICBpZiBoaV9oaW50P1xuIyAgICAgICBxdWVyeSA9IHsgZ3RlOiBsb19oaW50LCBsdGU6aGlfaGludCwgfVxuIyAgICAgZWxzZVxuIyAgICAgICBxdWVyeSA9IHsgZ3RlOiBsb19oaW50LCB9XG4jICAgZWxzZSBpZiBoaV9oaW50P1xuIyAgICAgcXVlcnkgPSB7IGx0ZTogaGlfaGludCwgfVxuIyAgIGVsc2VcbiMgICAgIHF1ZXJ5ID0gbnVsbFxuIyAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICBkZWJ1ZyAnwqk4MzVKUCcsIHF1ZXJ5XG4jICAgUiA9IGlmIHF1ZXJ5PyB0aGVuICggZGJbICclc2VsZicgXS5jcmVhdGVLZXlTdHJlYW0gcXVlcnkgKSBlbHNlIGRiWyAnJXNlbGYnIF0uY3JlYXRlS2V5U3RyZWFtKClcbiMgICAjIFIgPSBkYlsgJyVzZWxmJyBdLmNyZWF0ZUtleVN0cmVhbSBAbmV3X3F1ZXJ5IGRiLCBxdWVyeVxuIyAgICMjIyBUQUlOVCBTaG91bGQgd2UgdGVzdCBmb3Igd2VsbC1mb3JtZWQgZW50cmllcyBoZXJlPyAjIyNcbiMgICBSID0gUi5waXBlICQgKCBia2V5LCBzZW5kICkgPT4gc2VuZCBAX2RlY29kZV9rZXkgZGIsIGJrZXlcbiMgICByZXR1cm4gUlxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBjcmVhdGVfcGhyYXNlc3RyZWFtID0gKCBkYiwgbG9faGludCA9IG51bGwsIGhpX2hpbnQgPSBudWxsLCBzZXR0aW5ncyApIC0+XG4gIGlucHV0ID0gQGNyZWF0ZV9mYWNldHN0cmVhbSBkYiwgbG9faGludCwgaGlfaGludCwgc2V0dGluZ3NcbiAgUiA9IGlucHV0XG4gICAgLnBpcGUgQCRhc19waHJhc2UgZGJcbiAgUlsgJyVtZXRhJyBdID0gaW5wdXRbICclbWV0YScgXVxuICByZXR1cm4gUlxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBjcmVhdGVfZmFjZXRzdHJlYW0gPSAoIGRiLCBsb19oaW50ID0gbnVsbCwgaGlfaGludCA9IG51bGwsIHNldHRpbmdzICkgLT5cbiAgIyMjXG4gICogSWYgbmVpdGVyIGBsb2Agbm9yIGBoaWAgaXMgZ2l2ZW4sIHRoZSBzdHJlYW0gd2lsbCBpdGVyYXRlIG92ZXIgYWxsIGVudHJpZXMuXG4gICogSWYgYm90aCBgbG9gIGFuZCBgaGlgIGFyZSBnaXZlbiwgYSBxdWVyeSB3aXRoIGxvd2VyIGFuZCB1cHBlciwgaW5jbHVzaXZlIGJvdW5kYXJpZXMgaXNcbiAgICBpc3N1ZWQuXG4gICogSWYgb25seSBgbG9gIGlzIGdpdmVuLCBhIHByZWZpeCBxdWVyeSBpcyBpc3N1ZWQuXG4gICogSWYgYGhpYCBpcyBnaXZlbiBidXQgYGxvYCBpcyBtaXNzaW5nLCBhbiBlcnJvciBpcyBpc3N1ZWQuXG4gICMjI1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGlmIGhpX2hpbnQ/IGFuZCBub3QgbG9faGludD9cbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJtdXN0IGdpdmUgYGxvX2hpbnRgIHdoZW4gYGhpX2hpbnRgIGlzIGdpdmVuXCJcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBpZiBsb19oaW50PyBhbmQgbm90IGhpX2hpbnQ/XG4gICAgcXVlcnkgICAgICAgPSBAX3F1ZXJ5X2Zyb21fcHJlZml4IGRiLCBsb19oaW50XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZWxzZSBpZiBsb19oaW50PyBhbmQgaGlfaGludCBpcyAnKidcbiAgICBxdWVyeSAgICAgICA9IEBfcXVlcnlfZnJvbV9wcmVmaXggZGIsIGxvX2hpbnQsICcqJ1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGVsc2VcbiAgICBsb19oaW50X2JmciA9IGlmIGxvX2hpbnQ/IHRoZW4gKCAgICAgICAgQF9lbmNvZGVfa2V5IGRiLCBsb19oaW50ICkgICAgICAgICAgZWxzZSBudWxsXG4gICAgaGlfaGludF9iZnIgPSBpZiBoaV9oaW50PyB0aGVuICggQF9xdWVyeV9mcm9tX3ByZWZpeCBkYiwgaGlfaGludCApWyAnbHRlJyBdIGVsc2UgbnVsbFxuICAgICMgbG9faGludF9iZnIgPSBpZiBsb19oaW50PyB0aGVuICggICAgICAgIEBfZW5jb2RlX2tleSBkYiwgbG9faGludCApICAgICAgICAgIGVsc2UgQ09ERUNbICdrZXlzJyBdWyAnbG8nIF1cbiAgICAjIGhpX2hpbnRfYmZyID0gaWYgaGlfaGludD8gdGhlbiAoIEBfcXVlcnlfZnJvbV9wcmVmaXggZGIsIGhpX2hpbnQgKVsgJ2x0ZScgXSBlbHNlIENPREVDWyAna2V5cycgXVsgJ2hpJyBdXG4gICAgcXVlcnkgICAgICAgPSB7IGd0ZTogbG9faGludF9iZnIsIGx0ZTogaGlfaGludF9iZnIsIH1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAjIyMgVEFJTlQgU2hvdWxkIHdlIHRlc3QgZm9yIHdlbGwtZm9ybWVkIGVudHJpZXMgaGVyZT8gIyMjXG4gIFIgPSBkYlsgJyVzZWxmJyBdLmNyZWF0ZVJlYWRTdHJlYW0gcXVlcnlcbiAgUiA9IFIucGlwZSAkICggeyBrZXksIHZhbHVlIH0sIHNlbmQgKSA9PiBzZW5kIFsgKCBAX2RlY29kZV9rZXkgZGIsIGtleSApLCAoIEBfZGVjb2RlX3ZhbHVlIGRiLCB2YWx1ZSApLCBdXG4gIFJbICclbWV0YScgXSA9IHt9XG4gIFJbICclbWV0YScgXVsgJ3F1ZXJ5JyBdID0gcXVlcnlcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICByZXR1cm4gUlxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkByZWFkX21hbnkgPSAoIGRiLCBoaW50ID0gbnVsbCApIC0+XG4gICMjIyBIaW50cyBhcmUgaW50ZXJwcmV0ZWQgYXMgcGFydGlhbCBzZWNvbmRhcnkgKFBPUykga2V5cy4gIyMjXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQHJlYWRfb25lID0gKCBkYiwga2V5LCBmYWxsYmFjayA9IEBfbWlzZml0LCBoYW5kbGVyICkgLT5cbiAgIyMjIEhpbnRzIGFyZSBpbnRlcnByZXRlZCBhcyBjb21wbGV0ZSBwcmltYXJ5IChTUE8pIGtleXMuICMjI1xuICBzd2l0Y2ggYXJpdHkgPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgd2hlbiAzXG4gICAgICBoYW5kbGVyICAgPSBmYWxsYmFja1xuICAgICAgZmFsbGJhY2sgID0gQF9taXNmaXRcbiAgICB3aGVuIDQgdGhlbiBudWxsXG4gICAgZWxzZSB0aHJvdyBuZXcgRXJyb3IgXCJleHBlY3RlZCAzIG9yIDQgYXJndW1lbnRzLCBnb3QgI3thcml0eX1cIlxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGRiWyAnJXNlbGYnIF0uZ2V0IGtleSwgaGFuZGxlclxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkByZWFkX3N1YiA9ICggZGIsIHNldHRpbmdzLCByZWFkICkgLT5cbiAgc3dpdGNoIGFyaXR5ID0gYXJndW1lbnRzLmxlbmd0aFxuICAgIHdoZW4gMlxuICAgICAgcmVhZCAgICAgID0gc2V0dGluZ3NcbiAgICAgIHNldHRpbmdzICA9IG51bGxcbiAgICB3aGVuIDNcbiAgICAgIG51bGxcbiAgICBlbHNlXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJleHBlY3RlZCAyIG9yIDMgYXJndW1lbnRzLCBnb3QgI3thcml0eX1cIlxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGluZGV4ZWQgICAgICAgICAgID0gc2V0dGluZ3M/WyAnaW5kZXhlZCcgICAgXSA/IG5vXG4gICMgdHJhbnNmb3JtICAgICAgICAgPSBzZXR0aW5ncz9bICd0cmFuc2Zvcm0nICBdID8gRC4kcGFzc190aHJvdWdoKClcbiAgbWFuZ2xlICAgICAgICAgICAgPSBzZXR0aW5ncz9bICdtYW5nbGUnICAgICBdID8gKCBkYXRhICkgLT4gZGF0YVxuICBzZW5kX2VtcHR5ICAgICAgICA9IHNldHRpbmdzP1sgJ2VtcHR5JyAgICAgIF0gPyBub1xuICBpbnNlcnRfaW5kZXggICAgICA9IGlmIGluZGV4ZWQgdGhlbiBELm5ld19pbmRleGVyKCkgZWxzZSAoIHggKSAtPiB4XG4gIG9wZW5fc3RyZWFtX2NvdW50ID0gMFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHJldHVybiAkICggb3V0ZXJfZGF0YSwgb3V0ZXJfc2VuZCwgb3V0ZXJfZW5kICkgPT5cbiAgICBjb3VudCA9IDBcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGlmIG91dGVyX2RhdGE/XG4gICAgICBvcGVuX3N0cmVhbV9jb3VudCAgICArPSArMVxuICAgICAgc3ViX2lucHV0ICAgICAgICAgICAgID0gcmVhZCBvdXRlcl9kYXRhXG4gICAgICBbIG1lbW8sIHN1Yl9pbnB1dCwgXSAgPSBpZiBDTkQuaXNhX2xpc3Qgc3ViX2lucHV0IHRoZW4gc3ViX2lucHV0IGVsc2UgWyBAX21pc2ZpdCwgc3ViX2lucHV0LCBdXG4gICAgICBzdWJfaW5wdXRcbiAgICAgICAgIyAucGlwZSB0cmFuc2Zvcm1cbiAgICAgICAgLnBpcGUgZG8gPT5cbiAgICAgICAgICAjIyMgVEFJTlQgbm8gbmVlZCB0byBidWlsZCBidWZmZXIgaWYgbm90IGBzZW5kX2VtcHR5YCBhbmQgdGhlcmUgYXJlIG5vIHJlc3VsdHMgIyMjXG4gICAgICAgICAgYnVmZmVyID0gaWYgbWVtbyBpcyBAX21pc2ZpdCB0aGVuIFtdIGVsc2UgWyBtZW1vLCBdXG4gICAgICAgICAgcmV0dXJuICQgKCBpbm5lcl9kYXRhLCBfLCBpbm5lcl9lbmQgKSA9PlxuICAgICAgICAgICAgaWYgaW5uZXJfZGF0YT9cbiAgICAgICAgICAgICAgaW5uZXJfZGF0YSA9IG1hbmdsZSBpbm5lcl9kYXRhXG4gICAgICAgICAgICAgIGlmIGlubmVyX2RhdGE/XG4gICAgICAgICAgICAgICAgY291bnQgKz0gKzFcbiAgICAgICAgICAgICAgICBidWZmZXIucHVzaCBpbm5lcl9kYXRhXG4gICAgICAgICAgICBpZiBpbm5lcl9lbmQ/XG4gICAgICAgICAgICAgIGlmIHNlbmRfZW1wdHkgb3IgY291bnQgPiAwXG4gICAgICAgICAgICAgICAgb3V0ZXJfc2VuZCBpbnNlcnRfaW5kZXggYnVmZmVyXG4gICAgICAgICAgICAgIG9wZW5fc3RyZWFtX2NvdW50ICs9IC0xXG4gICAgICAgICAgICAgIGlubmVyX2VuZCgpXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpZiBvdXRlcl9lbmQ/XG4gICAgICByZXBlYXRfaW1tZWRpYXRlbHkgLT5cbiAgICAgICAgcmV0dXJuIHRydWUgdW5sZXNzIG9wZW5fc3RyZWFtX2NvdW50IGlzIDBcbiAgICAgICAgb3V0ZXJfZW5kKClcbiAgICAgICAgcmV0dXJuIGZhbHNlXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIEtFWVMgJiBWQUxVRVNcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9lbmNvZGVfa2V5ID0gKCBkYiwga2V5LCBleHRyYV9ieXRlICkgLT5cbiAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBrZXkgI3tycHIga2V5fVwiIGlmIGtleSBpcyB1bmRlZmluZWRcbiAgcmV0dXJuIF9jb2RlY19lbmNvZGUga2V5LCBleHRyYV9ieXRlXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9kZWNvZGVfa2V5ID0gKCBkYiwga2V5ICkgLT5cbiAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBrZXkgI3tycHIga2V5fVwiIGlmICggUiA9IF9jb2RlY19kZWNvZGUga2V5ICkgaXMgdW5kZWZpbmVkXG4gIHJldHVybiBSXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9lbmNvZGVfdmFsdWUgPSAoIGRiLCB2YWx1ZSAgICAgICkgLT4gSlNPTi5zdHJpbmdpZnkgdmFsdWVcbkBfZGVjb2RlX3ZhbHVlID0gKCBkYiwgdmFsdWVfYmZyICApIC0+IEpTT04ucGFyc2UgICAgIHZhbHVlX2Jmci50b1N0cmluZyAndXRmLTgnXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyMjIE5CIEFyZ3VtZW50IG9yZGVyaW5nIGZvciB0aGVzZSBmdW5jdGlvbiBpcyBhbHdheXMgc3ViamVjdCBiZWZvcmUgb2JqZWN0LCByZWdhcmRsZXNzIG9mIHRoZSBwaHJhc2V0eXBlXG5hbmQgdGhlIG9yZGVyaW5nIGluIHRoZSByZXN1bHRpbmcga2V5LiAjIyNcbkBuZXdfa2V5ID0gKCBkYiwgcGhyYXNldHlwZSwgc2ssIHN2LCBvaywgb3YsIGlkeCApIC0+XG4gIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgcGhyYXNldHlwZTogI3tycHIgcGhyYXNldHlwZX1cIiB1bmxlc3MgcGhyYXNldHlwZSBpbiBbICdzbycsICdvcycsIF1cbiAgWyBzaywgc3YsIG9rLCBvdiwgXSA9IFsgb2ssIG92LCBzaywgc3YsIF0gaWYgcGhyYXNldHlwZSBpcyAnb3MnXG4gIHJldHVybiBbIHBocmFzZXR5cGUsIHNrLCBzdiwgb2ssIG92LCAoIGlkeCA/IDAgKSwgXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBuZXdfc29fa2V5ID0gKCBkYiwgUC4uLiApIC0+IEBuZXdfa2V5IGRiLCAnc28nLCBQLi4uXG5AbmV3X29zX2tleSA9ICggZGIsIFAuLi4gKSAtPiBAbmV3X2tleSBkYiwgJ29zJywgUC4uLlxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfbmV3X29zX2tleV9mcm9tX3NvX2tleSA9ICggZGIsIHNvX2tleSApIC0+XG4gIFsgcGhyYXNldHlwZSwgc2ssIHN2LCBvaywgb3YsIGlkeCwgXSA9IEBhc19waHJhc2UgZGIsIHNvX2tleVxuICB0aHJvdyBuZXcgRXJyb3IgXCJleHBlY3RlZCBwaHJhc2V0eXBlICdzbycsIGdvdCAje3JwciBwaHJhc2V0eXBlfVwiIHVubGVzcyBwaHJhc2V0eXBlIGlzICdzbydcbiAgcmV0dXJuIFsgJ29zJywgb2ssIG92LCBzaywgc3YsIGlkeCwgXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBuZXdfa2V5cyA9ICggZGIsIHBocmFzZXR5cGUsIHNrLCBzdiwgb2ssIG92LCBpZHggKSAtPlxuICBvdGhlcl9waHJhc2V0eXBlICA9IGlmIHBocmFzZXR5cGUgaXMgJ3NvJyB0aGVuICdvcycgZWxzZSAnc28nXG4gIHJldHVybiBbXG4gICAgKCBAbmV3X2tleSBkYiwgICAgICAgcGhyYXNldHlwZSwgc2ssIHN2LCBvaywgb3YsIGlkeCApLFxuICAgICggQG5ld19rZXkgZGIsIG90aGVyX3BocmFzZXR5cGUsIHNrLCBzdiwgb2ssIG92LCBpZHggKSwgXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBhc19waHJhc2UgPSAoIGRiLCBrZXksIHZhbHVlLCBub3JtYWxpemUgPSB5ZXMgKSAtPlxuICBzd2l0Y2ggcGhyYXNldHlwZSA9IGtleVsgMCBdXG4gICAgd2hlbiAnc3BvJ1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBTUE8ga2V5IChsZW5ndGggI3tsZW5ndGh9KVwiIHVubGVzcyAoIGxlbmd0aCA9IGtleS5sZW5ndGggKSBpcyAzXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIHZhbHVlICgxKSAje3JwciB2YWx1ZX1cIiBpZiB2YWx1ZSBpbiBbIHVuZGVmaW5lZCwgXVxuICAgICAgcmV0dXJuIFsgcGhyYXNldHlwZSwga2V5WyAxIF0sIGtleVsgMiBdLCB2YWx1ZSwgXVxuICAgIHdoZW4gJ3BvcydcbiAgICAgIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgUE9TIGtleSAobGVuZ3RoICN7bGVuZ3RofSlcIiB1bmxlc3MgNCA8PSAoIGxlbmd0aCA9IGtleS5sZW5ndGggKSA8PSA1XG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIHZhbHVlICgyKSAje3JwciB2YWx1ZX1cIiBpZiBub3QgKCB2YWx1ZSBpbiBbIG51bGwsIF0gKVxuICAgICAgcmV0dXJuIFsgcGhyYXNldHlwZSwga2V5WyAzIF0sIGtleVsgMSBdLCBrZXlbIDIgXSwga2V5WyA0IF0sIF0gaWYga2V5WyA0IF0/XG4gICAgICByZXR1cm4gWyBwaHJhc2V0eXBlLCBrZXlbIDMgXSwga2V5WyAxIF0sIGtleVsgMiBdLCBdXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQCRhc19waHJhc2UgPSAoIGRiICkgLT5cbiAgcmV0dXJuICQgKCBkYXRhLCBzZW5kICkgPT5cbiAgICBzZW5kIEBhc19waHJhc2UgZGIsIGRhdGEuLi5cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5Aa2V5X2Zyb21fdXJsID0gKCBkYiwgdXJsICkgLT5cbiAgIyMjIFRBSU4gZG9lcyBub3QgdW5lc2NhcGUgYXMgeWV0ICMjI1xuICAjIyMgVEFJTiBkb2VzIG5vdCBjYXN0IHZhbHVlcyBhcyB5ZXQgIyMjXG4gICMjIyBUQUlOVCBkb2VzIG5vdCBzdXBwb3J0IG11bHRpcGxlIGluZGV4ZXMgYXMgeWV0ICMjI1xuICBbIHBocmFzZXR5cGUsIGZpcnN0LCBzZWNvbmQsIGlkeCwgXSA9IHVybC5zcGxpdCAnfCdcbiAgdW5sZXNzIHBocmFzZXR5cGU/IGFuZCBwaHJhc2V0eXBlLmxlbmd0aCA+IDAgYW5kIHBocmFzZXR5cGUgaW4gWyAnc28nLCAnb3MnLCBdXG4gICAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBVUkwga2V5ICN7cnByIHVybH1cIlxuICB1bmxlc3MgZmlyc3Q/IGFuZCBmaXJzdC5sZW5ndGggPiAwIGFuZCBzZWNvbmQ/IGFuZCBzZWNvbmQubGVuZ3RoID4gMFxuICAgIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgVVJMIGtleSAje3JwciB1cmx9XCJcbiAgaWR4ID0gaWYgKCBpZHg/IGFuZCBpZHgubGVuZ3RoID4gMCApIHRoZW4gKCBwYXJzZUludCBpZHgsIDEwICkgZWxzZSAwXG4gIFsgc2ssIHN2LCBdID0gIGZpcnN0LnNwbGl0ICc6J1xuICBbIG9rLCBvdiwgXSA9IHNlY29uZC5zcGxpdCAnOidcbiAgdW5sZXNzIHNrPyBhbmQgc2subGVuZ3RoID4gMCBhbmQgb2s/IGFuZCBvay5sZW5ndGggPiAwXG4gICAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBVUkwga2V5ICN7cnByIHVybH1cIlxuICBbIHNrLCBzdiwgb2ssIG92LCBdID0gWyBvaywgb3YsIHNrLCBzdiwgXSBpZiBwaHJhc2V0eXBlIGlzICdvcydcbiAgcmV0dXJuIFsgcGhyYXNldHlwZSwgc2ssIHN2LCBvaywgb3YsIGlkeCwgXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkB1cmxfZnJvbV9rZXkgPSAoIGRiLCBrZXkgKSAtPlxuICBpZiAoIEBfdHlwZV9mcm9tX2tleSBkYiwga2V5ICkgaXMgJ2xpc3QnXG4gICAgWyBwaHJhc2V0eXBlLCB0YWlsLi4uLCBdID0ga2V5XG4gICAgaWYgcGhyYXNldHlwZSBpcyAnc3BvJ1xuICAgICAgWyBzYmosIHByZCwgXSA9IHRhaWxcbiAgICAgIHJldHVybiBcInNwb3wje3Nian18I3twcmR9fFwiXG4gICAgZWxzZVxuICAgICAgWyBwcmQsIG9iaiwgc2JqLCBpZHgsIF0gPSB0YWlsXG4gICAgICBpZHhfcnByID0gaWYgaWR4PyB0aGVuIHJwciBpZHggZWxzZSAnJ1xuICAgICAgcmV0dXJuIFwicG9zfCN7cHJkfToje29ian18I3tzYmp9fCN7aWR4X3Jwcn1cIlxuICByZXR1cm4gXCIje3JwciBrZXl9XCJcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AJHVybF9mcm9tX2tleSA9ICggZGIgKSAtPiAkICgga2V5LCBzZW5kICkgPT4gc2VuZCBAdXJsX2Zyb21fa2V5IGRiLCBrZXlcbkAka2V5X2Zyb21fdXJsID0gKCBkYiApIC0+ICQgKCB1cmwsIHNlbmQgKSA9PiBzZW5kIEBrZXlfZnJvbV91cmwgZGIsIGtleVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfdHlwZV9mcm9tX2tleSA9ICggZGIsIGtleSApIC0+XG4gIGlmIEFycmF5LmlzQXJyYXkga2V5XG4gICAgIyB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIGtleTogI3tycHIga2V5fVwiIHVubGVzcyBrZXkubGVuZ3RoIGlzIDZcbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIHBocmFzZXR5cGU6ICN7cnByIGtleX1cIiB1bmxlc3Mga2V5WyAnMCcgXSBpbiBAcGhyYXNldHlwZXNcbiAgICByZXR1cm4gJ2xpc3QnXG4gIHJldHVybiAnb3RoZXInXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIFBSRUZJWEVTICYgUVVFUklFU1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX3F1ZXJ5X2Zyb21fcHJlZml4ID0gKCBkYiwgbG9faGludCwgc3RhciApIC0+XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgaWYgc3Rhcj9cbiAgICAjIyMgJ0FzdGVyaXNrJyBlbmNvZGluZzogcGFydGlhbCBrZXkgc2VnbWVudHMgbWF0Y2ggIyMjXG4gICAgZ3RlICAgPSBAX2VuY29kZV9rZXkgZGIsIGxvX2hpbnRcbiAgICBsdGUgICA9IEBfZW5jb2RlX2tleSBkYiwgbG9faGludFxuICAgIGx0ZVsgbHRlLmxlbmd0aCAtIDEgXSA9IENPREVDWyAndHlwZW1hcmtlcnMnICBdWyAnaGknIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBlbHNlXG4gICAgIyMjICdDbGFzc2ljYWwnIGVuY29kaW5nOiBvbmx5IGZ1bGwga2V5IHNlZ21lbnRzIG1hdGNoICMjI1xuICAgIGJhc2UgID0gQF9lbmNvZGVfa2V5IGRiLCBsb19oaW50LCBDT0RFQ1sgJ3R5cGVtYXJrZXJzJyAgXVsgJ2hpJyBdXG4gICAgZ3RlICAgPSBiYXNlLnNsaWNlIDAsIGJhc2UubGVuZ3RoIC0gMVxuICAgIGx0ZSAgID0gYmFzZS5zbGljZSAwLCBiYXNlLmxlbmd0aFxuICByZXR1cm4geyBndGUsIGx0ZSwgfVxuXG5cblxuXG5cbiJdfQ==