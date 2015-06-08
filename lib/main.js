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
      return function(key_bfr, value_bfr) {
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
          if (has_ended) {
            return _send.end();
          }
        }
      };
    })(this);
    R.pipe($((function(_this) {
      return function(spo, send) {

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
      };
    })(this))).pipe($((function(_this) {
      return function(facet, send) {

        /* Encode facet: */
        var key, key_bfr, value, value_bfr;
        key = facet[0], value = facet[1];
        key_bfr = _this._encode_key(db, key);
        value_bfr = value != null ? _this._encode_value(db, value) : _this._zero_value_bfr;
        return send([key_bfr, value_bfr]);
      };
    })(this))).pipe(this._$pull()).pipe(this._$take()).pipe($((function(_this) {
      return function(facet_bfrs, send, end) {

        /* Organize buffering: */
        _send = send;
        if (facet_bfrs != null) {
          push.apply(null, facet_bfrs);
          if (buffer.length >= buffer_size) {
            flush();
          }
        }
        if (end != null) {
          has_ended = true;
          return flush();
        }
      };
    })(this)));
    return R;
  };

  this._$send_later = function() {
    var R, _end, count, send_end;
    R = D.create_throughstream();
    count = 0;
    _end = null;
    send_end = (function(_this) {
      return function() {
        if ((_end != null) && count <= 0) {
          return _end();
        } else {
          return setImmediate(send_end);
        }
      };
    })(this);
    R.pipe($((function(_this) {
      return function(data, send, end) {
        if (data != null) {
          count += +1;
          setImmediate(function() {
            count += -1;
            send(data);
            return debug('©MxyBi', count);
          });
        }
        if (end != null) {
          return _end = end;
        }
      };
    })(this)));
    send_end();
    return R;
  };

  this._$pull = function() {
    var is_first, pull, queue;
    queue = [];
    is_first = true;
    pull = function() {
      if (queue.length > 0) {
        return queue.pop();
      } else {
        return ['empty'];
      }
    };
    return $((function(_this) {
      return function(data, send, end) {
        if (is_first) {
          is_first = false;
          send(pull);
        }
        if (data != null) {
          queue.unshift(['data', data]);
        }
        if (end != null) {
          return queue.unshift(['end', end]);
        }
      };
    })(this));
  };

  this._$take = function() {
    return $((function(_this) {
      return function(pull, send) {
        var process;
        process = function() {
          var data, ref, type;
          ref = pull(), type = ref[0], data = ref[1];
          switch (type) {
            case 'data':
              send(data);
              break;
            case 'empty':
              null;
              break;
            case 'end':
              return send.end();
            default:
              send.error(new Error("unknown event type " + (rpr(type))));
          }
          return setImmediate(process);
        };
        return process();
      };
    })(this));
  };

  this._$ensure_unique = function(db) {
    var R, _end, _send, bloom, process_queue, queue, rq_count;
    bloom = Bloom.forCapacity(1e1, 1);
    rq_count = 0;
    queue = [];
    _end = null;
    _send = null;
    process_queue = (function(_this) {
      return function() {
        if ((_end != null) && rq_count < 1 && queue.length < 1) {
          _end();
          return;
        }
        return setImmediate(process_queue);
      };
    })(this);
    R = D.create_throughstream().pipe($(function(facet_bfrs, send, end) {
      _send = send;
      if (facet_bfrs != null) {
        debug('©nuSIj', facet_bfrs);
        queue.unshift(facet_bfrs);
      }
      if (end != null) {
        return _end = end;
      }
    }));
    return R;
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

//# sourceMappingURL=data:application/json;base64,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ZSI6Im1haW4uanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJcblxuXG4jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiMgbmpzX3V0aWwgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ3V0aWwnXG4jIG5qc19wYXRoICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdwYXRoJ1xuIyBuanNfZnMgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnZnMnXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkNORCAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdjbmQnXG5ycHIgICAgICAgICAgICAgICAgICAgICAgID0gQ05ELnJwclxuYmFkZ2UgICAgICAgICAgICAgICAgICAgICA9ICdIT0xMRVJJVEgvbWFpbidcbmxvZyAgICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAncGxhaW4nLCAgICAgYmFkZ2VcbmRlYnVnICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnZGVidWcnLCAgICAgYmFkZ2Vcbndhcm4gICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnd2FybicsICAgICAgYmFkZ2VcbmhlbHAgICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnaGVscCcsICAgICAgYmFkZ2VcbnVyZ2UgICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAndXJnZScsICAgICAgYmFkZ2VcbndoaXNwZXIgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnd2hpc3BlcicsICAgYmFkZ2VcbmVjaG8gICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZWNoby5iaW5kIENORFxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5zdXNwZW5kICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnY29mZmVlbm9kZS1zdXNwZW5kJ1xuc3RlcCAgICAgICAgICAgICAgICAgICAgICA9IHN1c3BlbmQuc3RlcFxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5DT0RFQyAgICAgICAgICAgICAgICAgICAgID0gQENPREVDID0gcmVxdWlyZSAnLi9jb2RlYydcbkRVTVAgICAgICAgICAgICAgICAgICAgICAgPSBARFVNUCAgPSByZXF1aXJlICcuL2R1bXAnXG5fY29kZWNfZW5jb2RlICAgICAgICAgICAgID0gQ09ERUMuZW5jb2RlLmJpbmQgQ09ERUNcbl9jb2RlY19kZWNvZGUgICAgICAgICAgICAgPSBDT0RFQy5kZWNvZGUuYmluZCBDT0RFQ1xuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5EICAgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAncGlwZWRyZWFtczInXG4kICAgICAgICAgICAgICAgICAgICAgICAgID0gRC5yZW1pdC5iaW5kIERcbl9uZXdfbGV2ZWxfZGIgICAgICAgICAgICAgPSByZXF1aXJlICdsZXZlbCdcbmxldmVsZG93biAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdsZXZlbC9ub2RlX21vZHVsZXMvbGV2ZWxkb3duJ1xuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5zdXNwZW5kICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnY29mZmVlbm9kZS1zdXNwZW5kJ1xuc3RlcCAgICAgICAgICAgICAgICAgICAgICA9IHN1c3BlbmQuc3RlcFxucmVwZWF0X2ltbWVkaWF0ZWx5ICAgICAgICA9IHN1c3BlbmQucmVwZWF0X2ltbWVkaWF0ZWx5XG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkxPREFTSCAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdsb2Rhc2gnXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMjIyBodHRwczovL2dpdGh1Yi5jb20vYjNuajRtL2Jsb29tLXN0cmVhbSAjIyNcbkJsb29tICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdibG9vbS1zdHJlYW0nXG5cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AcGhyYXNldHlwZXMgICAgICA9IFsgJ3BvcycsICdzcG8nLCBdXG5AX21pc2ZpdCAgICAgICAgICA9IFN5bWJvbCAnbWlzZml0J1xuQF96ZXJvX3ZhbHVlX2JmciAgPSBuZXcgQnVmZmVyICdudWxsJ1xuIyB3YXJuIFwibWluZCBpbmNvbnNpc3RlbmNpZXMgaW4gSE9MTEVSSVRIMi9tYWluIEBfemVyb19lbmMgZXRjXCJcbiMgQF96ZXJvICAgICAgICAgICAgPSB0cnVlICMgPz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz9cbiMgQF96ZXJvX2VuYyAgICAgICAgPSBfY29kZWNfZW5jb2RlIFsgQF96ZXJvLCAgICBdXG4jIEBfbG9fZW5jICAgICAgICAgID0gX2NvZGVjX2VuY29kZSBbIG51bGwsICAgICAgXVxuIyBAX2hpX2VuYyAgICAgICAgICA9IF9jb2RlY19lbmNvZGUgWyBDT0RFQy4sIF1cbiMgQF9sYXN0X29jdGV0ICAgICAgPSBuZXcgQnVmZmVyIFsgMHhmZiwgXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBuZXdfZGIgPSAoIHJvdXRlICkgLT5cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBsZXZlbF9zZXR0aW5ncyA9XG4gICAgJ2tleUVuY29kaW5nJzogICAgICAgICAgJ2JpbmFyeSdcbiAgICAndmFsdWVFbmNvZGluZyc6ICAgICAgICAnYmluYXJ5J1xuICAgICdjcmVhdGVJZk1pc3NpbmcnOiAgICAgIHRydWVcbiAgICAnZXJyb3JJZkV4aXN0cyc6ICAgICAgICBmYWxzZVxuICAgICdjb21wcmVzc2lvbic6ICAgICAgICAgIHllc1xuICAgICdzeW5jJzogICAgICAgICAgICAgICAgIG5vXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3Vic3RyYXRlICAgICAgICAgICA9IF9uZXdfbGV2ZWxfZGIgcm91dGUsIGxldmVsX3NldHRpbmdzXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgUiA9XG4gICAgJ35pc2EnOiAgICAgICAgICAgJ0hPTExFUklUSC9kYidcbiAgICAnJXNlbGYnOiAgICAgICAgICBzdWJzdHJhdGVcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICByZXR1cm4gUlxuXG4jICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBAX3Jlb3BlbiA9ICggZGIsIGhhbmRsZXIgKSAtPlxuIyAgIHN0ZXAgKCByZXN1bWUgKSA9PlxuIyAgICAgcm91dGUgPSBkYlsgJyVzZWxmJyBdWyAnbG9jYXRpb24nIF1cbiMgICAgIHlpZWxkIGRiWyAnJXNlbGYnIF0uY2xvc2UgcmVzdW1lXG4jICAgICB5aWVsZCBkYlsgJyVzZWxmJyBdLm9wZW4gcmVzdW1lXG4jICAgICB3aGlzcGVyIFwicmUtb3BlbmVkIExldmVsREIgYXQgI3tyb3V0ZX1cIlxuIyAgICAgaGFuZGxlciBudWxsXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQGNsZWFyID0gKCBkYiwgaGFuZGxlciApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHJvdXRlID0gZGJbICclc2VsZicgXVsgJ2xvY2F0aW9uJyBdXG4gICAgd2hpc3BlciBcImNsb3NpbmcgREJcIlxuICAgIHlpZWxkIGRiWyAnJXNlbGYnIF0uY2xvc2UgcmVzdW1lXG4gICAgIyB3aGlzcGVyIFwiZXJhc2luZyBEQlwiXG4gICAgeWllbGQgbGV2ZWxkb3duLmRlc3Ryb3kgcm91dGUsIHJlc3VtZVxuICAgICMgd2hpc3BlciBcInJlLW9wZW5pbmcgREJcIlxuICAgIHlpZWxkIGRiWyAnJXNlbGYnIF0ub3BlbiByZXN1bWVcbiAgICAjIGhlbHAgXCJlcmFzZWQgYW5kIHJlLW9wZW5lZCBMZXZlbERCIGF0ICN7cm91dGV9XCJcbiAgICBoYW5kbGVyIG51bGxcblxuIyAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgIyBXUklUSU5HXG4jICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBAJHdyaXRlID0gKCBkYiwgc2V0dGluZ3MgKSAtPlxuIyAgICMjIyBFeHBlY3RzIGEgSG9sbGVyaXRoIERCIG9iamVjdCBhbmQgYW4gb3B0aW9uYWwgYnVmZmVyIHNpemU7IHJldHVybnMgYSBzdHJlYW0gdHJhbnNmb3JtZXIgdGhhdCBkb2VzIGFsbFxuIyAgIG9mIHRoZSBmb2xsb3dpbmc6XG5cbiMgICAqIEl0IGV4cGVjdHMgYW4gU08ga2V5IGZvciB3aGljaCBpdCB3aWxsIGdlbmVyYXRlIGEgY29ycmVzcG9uZGluZyBPUyBrZXkuXG4jICAgKiBBIGNvcnJlc3BvbmRpbmcgT1Mga2V5IGlzIGZvcm11bGF0ZWQgZXhjZXB0IHdoZW4gdGhlIFNPIGtleSdzIG9iamVjdCB2YWx1ZSBpcyBhIEpTIG9iamVjdCAvIGEgUE9EIChzaW5jZVxuIyAgICAgaW4gdGhhdCBjYXNlLCB0aGUgdmFsdWUgc2VyaWFsaXphdGlvbiBpcyBqb2xseSB1c2VsZXNzIGFzIGFuIGluZGV4KS5cbiMgICAqIEl0IHNlbmRzIG9uIGJvdGggdGhlIFNPIGFuZCB0aGUgT1Mga2V5IGRvd25zdHJlYW0gZm9yIG9wdGlvbmFsIGZ1cnRoZXIgcHJvY2Vzc2luZy5cbiMgICAqIEl0IGZvcm1zIGEgcHJvcGVyIGBub2RlLWxldmVsYC1jb21wYXRpYmxlIGJhdGNoIHJlY29yZCBmb3IgZWFjaCBrZXkgYW5kIGNvbGxlY3QgYWxsIHJlY29yZHNcbiMgICAgIGluIGEgYnVmZmVyLlxuIyAgICogV2hlbmV2ZXIgdGhlIGJ1ZmZlciBoYXMgb3V0Z3Jvd24gdGhlIGdpdmVuIGJ1ZmZlciBzaXplLCB0aGUgYnVmZmVyIHdpbGwgYmUgd3JpdHRlbiBpbnRvIHRoZSBEQiB1c2luZ1xuIyAgICAgYGxldmVsdXBgJ3MgYGJhdGNoYCBjb21tYW5kLlxuIyAgICogV2hlbiB0aGUgbGFzdCBwZW5kaW5nIGJhdGNoIGhhcyBiZWVuIHdyaXR0ZW4gaW50byB0aGUgREIsIHRoZSBgZW5kYCBldmVudCBpcyBjYWxsZWQgb24gdGhlIHN0cmVhbVxuIyAgICAgYW5kIG1heSBiZSBkZXRlY3RlZCBkb3duc3RyZWFtLlxuXG4jICAgIyMjXG4jICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgIHNldHRpbmdzICAgICAgICAgPz0ge31cbiMgICBidWZmZXJfc2l6ZSAgICAgICA9IHNldHRpbmdzWyAnYmF0Y2gnICBdID8gMTAwMDBcbiMgICBzb2xpZF9wcmVkaWNhdGVzICA9IHNldHRpbmdzWyAnc29saWRzJyBdID8gW11cbiMgICBidWZmZXIgICAgICAgICAgICA9IFtdXG4jICAgc3Vic3RyYXRlICAgICAgICAgPSBkYlsgJyVzZWxmJyBdXG4jICAgYmF0Y2hfY291bnQgICAgICAgPSAwXG4jICAgaGFzX2VuZGVkICAgICAgICAgPSBub1xuIyAgIF9zZW5kICAgICAgICAgICAgID0gbnVsbFxuIyAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICB0aHJvdyBuZXcgRXJyb3IgXCJidWZmZXIgc2l6ZSBtdXN0IGJlIHBvc2l0aXZlIGludGVnZXIsIGdvdCAje3JwciBidWZmZXJfc2l6ZX1cIiB1bmxlc3MgYnVmZmVyX3NpemUgPiAwXG4jICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgIHB1c2ggPSAoIGtleSwgdmFsdWUgKSA9PlxuIyAgICAgdmFsdWVfYmZyID0gaWYgdmFsdWU/IHRoZW4gQF9lbmNvZGVfdmFsdWUgZGIsIHZhbHVlIGVsc2UgQF96ZXJvX3ZhbHVlX2JmclxuIyAgICAgYnVmZmVyLnB1c2ggeyB0eXBlOiAncHV0Jywga2V5OiAoIEBfZW5jb2RlX2tleSBkYiwga2V5ICksIHZhbHVlOiB2YWx1ZV9iZnIsIH1cbiMgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgZmx1c2ggPSA9PlxuIyAgICAgaWYgYnVmZmVyLmxlbmd0aCA+IDBcbiMgICAgICAgYmF0Y2hfY291bnQgKz0gKzFcbiMgICAgICAgc3Vic3RyYXRlLmJhdGNoIGJ1ZmZlciwgKCBlcnJvciApID0+XG4jICAgICAgICAgdGhyb3cgZXJyb3IgaWYgZXJyb3I/XG4jICAgICAgICAgYmF0Y2hfY291bnQgKz0gLTFcbiMgICAgICAgICBfc2VuZC5lbmQoKSBpZiBoYXNfZW5kZWQgYW5kIGJhdGNoX2NvdW50IDwgMVxuIyAgICAgICBidWZmZXIgPSBbXVxuIyAgICAgZWxzZVxuIyAgICAgICBfc2VuZC5lbmQoKVxuIyAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICByZXR1cm4gJCAoIHNwbywgc2VuZCwgZW5kICkgPT5cbiMgICAgIF9zZW5kID0gc2VuZFxuIyAgICAgaWYgc3BvP1xuIyAgICAgICBbIHNiaiwgcHJkLCBvYmosIF0gPSBzcG9cbiMgICAgICAgcHVzaCBbICdzcG8nLCBzYmosIHByZCwgXSwgb2JqXG4jICAgICAgICMjIyBUQUlOVCB3aGF0IHRvIHNlbmQsIGlmIGFueXRoaW5nPyAjIyNcbiMgICAgICAgIyBzZW5kIGVudHJ5XG4jICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgICAgICBpZiBDTkQuaXNhX3BvZCBvYmpcbiMgICAgICAgICAjIyMgRG8gbm90IGNyZWF0ZSBpbmRleCBlbnRyaWVzIGluIGNhc2UgYG9iamAgaXMgYSBQT0Q6ICMjI1xuIyAgICAgICAgIG51bGxcbiMgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgICAgIGVsc2UgaWYgQ05ELmlzYV9saXN0IG9ialxuIyAgICAgICAgIGlmIHByZCBpbiBzb2xpZF9wcmVkaWNhdGVzXG4jICAgICAgICAgICBwdXNoIFsgJ3BvcycsIHByZCwgb2JqLCBzYmosIF1cbiMgICAgICAgICBlbHNlXG4jICAgICAgICAgICAjIyMgQ3JlYXRlIG9uZSBpbmRleCBlbnRyeSBmb3IgZWFjaCBlbGVtZW50IGluIGNhc2UgYG9iamAgaXMgYSBsaXN0OiAjIyNcbiMgICAgICAgICAgIGZvciBvYmpfZWxlbWVudCwgb2JqX2lkeCBpbiBvYmpcbiMgICAgICAgICAgICAgcHVzaCBbICdwb3MnLCBwcmQsIG9ial9lbGVtZW50LCBzYmosIG9ial9pZHgsIF1cbiMgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgICAgIGVsc2VcbiMgICAgICAgICAjIyMgQ3JlYXRlIG9uZSBpbmRleCBlbnRyeSBmb3IgYG9iamAgb3RoZXJ3aXNlOiAjIyNcbiMgICAgICAgICBwdXNoIFsgJ3BvcycsIHByZCwgb2JqLCBzYmosIF1cbiMgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgICAgIGZsdXNoKCkgaWYgYnVmZmVyLmxlbmd0aCA+PSBidWZmZXJfc2l6ZVxuIyAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICAgICMjIyBGbHVzaCByZW1haW5pbmcgYnVmZmVyZWQgZW50cmllcyB0byBEQiAjIyNcbiMgICAgIGlmIGVuZD9cbiMgICAgICAgaGFzX2VuZGVkID0geWVzXG4jICAgICAgIGZsdXNoKClcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgV1JJVElOR1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AJHdyaXRlID0gKCBkYiwgc2V0dGluZ3MgKSAtPlxuICAjIyMgRXhwZWN0cyBhIEhvbGxlcml0aCBEQiBvYmplY3QgYW5kIGFuIG9wdGlvbmFsIGJ1ZmZlciBzaXplOyByZXR1cm5zIGEgc3RyZWFtIHRyYW5zZm9ybWVyIHRoYXQgZG9lcyBhbGxcbiAgb2YgdGhlIGZvbGxvd2luZzpcblxuICAqIEl0IGV4cGVjdHMgYW4gU08ga2V5IGZvciB3aGljaCBpdCB3aWxsIGdlbmVyYXRlIGEgY29ycmVzcG9uZGluZyBPUyBrZXkuXG4gICogQSBjb3JyZXNwb25kaW5nIE9TIGtleSBpcyBmb3JtdWxhdGVkIGV4Y2VwdCB3aGVuIHRoZSBTTyBrZXkncyBvYmplY3QgdmFsdWUgaXMgYSBKUyBvYmplY3QgLyBhIFBPRCAoc2luY2VcbiAgICBpbiB0aGF0IGNhc2UsIHRoZSB2YWx1ZSBzZXJpYWxpemF0aW9uIGlzIGpvbGx5IHVzZWxlc3MgYXMgYW4gaW5kZXgpLlxuICAqIEl0IHNlbmRzIG9uIGJvdGggdGhlIFNPIGFuZCB0aGUgT1Mga2V5IGRvd25zdHJlYW0gZm9yIG9wdGlvbmFsIGZ1cnRoZXIgcHJvY2Vzc2luZy5cbiAgKiBJdCBmb3JtcyBhIHByb3BlciBgbm9kZS1sZXZlbGAtY29tcGF0aWJsZSBiYXRjaCByZWNvcmQgZm9yIGVhY2gga2V5IGFuZCBjb2xsZWN0IGFsbCByZWNvcmRzXG4gICAgaW4gYSBidWZmZXIuXG4gICogV2hlbmV2ZXIgdGhlIGJ1ZmZlciBoYXMgb3V0Z3Jvd24gdGhlIGdpdmVuIGJ1ZmZlciBzaXplLCB0aGUgYnVmZmVyIHdpbGwgYmUgd3JpdHRlbiBpbnRvIHRoZSBEQiB1c2luZ1xuICAgIGBsZXZlbHVwYCdzIGBiYXRjaGAgY29tbWFuZC5cbiAgKiBXaGVuIHRoZSBsYXN0IHBlbmRpbmcgYmF0Y2ggaGFzIGJlZW4gd3JpdHRlbiBpbnRvIHRoZSBEQiwgdGhlIGBlbmRgIGV2ZW50IGlzIGNhbGxlZCBvbiB0aGUgc3RyZWFtXG4gICAgYW5kIG1heSBiZSBkZXRlY3RlZCBkb3duc3RyZWFtLlxuXG4gICMjI1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHNldHRpbmdzICAgICAgICAgPz0ge31cbiAgYnVmZmVyX3NpemUgICAgICAgPSBzZXR0aW5nc1sgJ2JhdGNoJyAgXSA/IDEwMDAwXG4gIHNvbGlkX3ByZWRpY2F0ZXMgID0gc2V0dGluZ3NbICdzb2xpZHMnIF0gPyBbXVxuICBidWZmZXIgICAgICAgICAgICA9IFtdXG4gIHN1YnN0cmF0ZSAgICAgICAgID0gZGJbICclc2VsZicgXVxuICBiYXRjaF9jb3VudCAgICAgICA9IDBcbiAgaGFzX2VuZGVkICAgICAgICAgPSBub1xuICBfc2VuZCAgICAgICAgICAgICA9IG51bGxcbiAgUiAgICAgICAgICAgICAgICAgPSBELmNyZWF0ZV90aHJvdWdoc3RyZWFtKClcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICB0aHJvdyBuZXcgRXJyb3IgXCJidWZmZXIgc2l6ZSBtdXN0IGJlIHBvc2l0aXZlIGludGVnZXIsIGdvdCAje3JwciBidWZmZXJfc2l6ZX1cIiB1bmxlc3MgYnVmZmVyX3NpemUgPiAwXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcHVzaCA9ICgga2V5X2JmciwgdmFsdWVfYmZyICkgPT5cbiAgICBidWZmZXIucHVzaCB7IHR5cGU6ICdwdXQnLCBrZXk6IGtleV9iZnIsIHZhbHVlOiB2YWx1ZV9iZnIsIH1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBmbHVzaCA9ID0+XG4gICAgaWYgYnVmZmVyLmxlbmd0aCA+IDBcbiAgICAgIGJhdGNoX2NvdW50ICs9ICsxXG4gICAgICBzdWJzdHJhdGUuYmF0Y2ggYnVmZmVyLCAoIGVycm9yICkgPT5cbiAgICAgICAgdGhyb3cgZXJyb3IgaWYgZXJyb3I/XG4gICAgICAgIGJhdGNoX2NvdW50ICs9IC0xXG4gICAgICAgIF9zZW5kLmVuZCgpIGlmIGhhc19lbmRlZCBhbmQgYmF0Y2hfY291bnQgPCAxXG4gICAgICBidWZmZXIgPSBbXVxuICAgIGVsc2VcbiAgICAgIGlmIGhhc19lbmRlZFxuICAgICAgICBfc2VuZC5lbmQoKVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIFJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIC5waXBlICQgKCBzcG8sIHNlbmQgKSA9PlxuICAgICAgIyMjIEFuYWx5emUgU1BPIGtleSBhbmQgc2VuZCBhbGwgbmVjZXNzYXJ5IFBPUyBmYWNldHM6ICMjI1xuICAgICAgWyBzYmosIHByZCwgb2JqLCBdID0gc3BvXG4gICAgICBzZW5kIFsgWyAnc3BvJywgc2JqLCBwcmQsIF0sIG9iaiwgXVxuICAgICAgb2JqX3R5cGUgPSBDTkQudHlwZV9vZiBvYmpcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgdW5sZXNzIG9ial90eXBlIGlzICdwb2QnXG4gICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgICAgaWYgKCBvYmpfdHlwZSBpcyAnbGlzdCcgKSBhbmQgbm90ICggcHJkIGluIHNvbGlkX3ByZWRpY2F0ZXMgKVxuICAgICAgICAgIGZvciBvYmpfZWxlbWVudCwgb2JqX2lkeCBpbiBvYmpcbiAgICAgICAgICAgIHNlbmQgWyBbICdwb3MnLCBwcmQsIG9ial9lbGVtZW50LCBzYmosIG9ial9pZHgsIF0sIF1cbiAgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgICBlbHNlXG4gICAgICAgICAgc2VuZCBbIFsgJ3BvcycsIHByZCwgb2JqLCBzYmosIF0sIF1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIC5waXBlICQgKCBmYWNldCwgc2VuZCApID0+XG4gICAgICAjIyMgRW5jb2RlIGZhY2V0OiAjIyNcbiAgICAgIFsga2V5LCB2YWx1ZSwgXSA9IGZhY2V0XG4gICAgICBrZXlfYmZyICAgICAgICAgPSBAX2VuY29kZV9rZXkgZGIsIGtleVxuICAgICAgdmFsdWVfYmZyICAgICAgID0gaWYgdmFsdWU/IHRoZW4gQF9lbmNvZGVfdmFsdWUgZGIsIHZhbHVlIGVsc2UgQF96ZXJvX3ZhbHVlX2JmclxuICAgICAgc2VuZCBbIGtleV9iZnIsIHZhbHVlX2JmciwgXVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyAucGlwZSBAXyRzZW5kX2xhdGVyKClcbiAgICAjIC5waXBlIEBfJGVuc3VyZV91bmlxdWUgZGJcbiAgICAucGlwZSBAXyRwdWxsKClcbiAgICAucGlwZSBAXyR0YWtlKClcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIC5waXBlICQgKCBmYWNldF9iZnJzLCBzZW5kLCBlbmQgKSA9PlxuICAgICAgIyMjIE9yZ2FuaXplIGJ1ZmZlcmluZzogIyMjXG4gICAgICBfc2VuZCA9IHNlbmRcbiAgICAgIGlmIGZhY2V0X2JmcnM/XG4gICAgICAgICMgZGVidWcgJ8KpQ0VSVzAnLCBmYWNldF9iZnJzXG4gICAgICAgIHB1c2ggZmFjZXRfYmZycy4uLlxuICAgICAgICBmbHVzaCgpIGlmIGJ1ZmZlci5sZW5ndGggPj0gYnVmZmVyX3NpemVcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgaWYgZW5kP1xuICAgICAgICBoYXNfZW5kZWQgPSB5ZXNcbiAgICAgICAgZmx1c2goKVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHJldHVybiBSXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF8kc2VuZF9sYXRlciA9IC0+XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgUiAgICAgPSBELmNyZWF0ZV90aHJvdWdoc3RyZWFtKClcbiAgY291bnQgPSAwXG4gIF9lbmQgID0gbnVsbFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc2VuZF9lbmQgPSA9PlxuICAgIGlmIF9lbmQ/IGFuZCBjb3VudCA8PSAwXG4gICAgICBfZW5kKClcbiAgICBlbHNlXG4gICAgICBzZXRJbW1lZGlhdGUgc2VuZF9lbmRcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIFJcbiAgICAucGlwZSAkICggZGF0YSwgc2VuZCwgZW5kICkgPT5cbiAgICAgIGlmIGRhdGE/XG4gICAgICAgIGNvdW50ICs9ICsxXG4gICAgICAgIHNldEltbWVkaWF0ZSA9PlxuICAgICAgICAgIGNvdW50ICs9IC0xXG4gICAgICAgICAgc2VuZCBkYXRhXG4gICAgICAgICAgZGVidWcgJ8KpTXh5QmknLCBjb3VudFxuICAgICAgaWYgZW5kP1xuICAgICAgICBfZW5kID0gZW5kXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzZW5kX2VuZCgpXG4gIHJldHVybiBSXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF8kcHVsbCA9IC0+XG4gIHF1ZXVlICAgICA9IFtdXG4gICMgX3NlbmQgICAgID0gbnVsbFxuICBpc19maXJzdCAgPSB5ZXNcbiAgcHVsbCA9IC0+XG4gICAgaWYgcXVldWUubGVuZ3RoID4gMFxuICAgICAgcmV0dXJuIHF1ZXVlLnBvcCgpXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIFsgJ2VtcHR5JywgXVxuICByZXR1cm4gJCAoIGRhdGEsIHNlbmQsIGVuZCApID0+XG4gICAgaWYgaXNfZmlyc3RcbiAgICAgIGlzX2ZpcnN0ID0gbm9cbiAgICAgIHNlbmQgcHVsbFxuICAgIGlmIGRhdGE/XG4gICAgICBxdWV1ZS51bnNoaWZ0IFsgJ2RhdGEnLCBkYXRhLCBdXG4gICAgaWYgZW5kP1xuICAgICAgcXVldWUudW5zaGlmdCBbICdlbmQnLCBlbmQsIF1cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AXyR0YWtlID0gLT5cbiAgcmV0dXJuICQgKCBwdWxsLCBzZW5kICkgPT5cbiAgICAjIGRlYnVnICfCqXZLa0pmJywgcHVsbFxuICAgICMgZGVidWcgJ8KpdktrSmYnLCBwdWxsKClcbiAgICBwcm9jZXNzID0gPT5cbiAgICAgIFsgdHlwZSwgZGF0YSwgXSA9IHB1bGwoKVxuICAgICAgIyBkZWJ1ZyAnwqliYW1PQicsIFsgdHlwZSwgZGF0YSwgXVxuICAgICAgc3dpdGNoIHR5cGVcbiAgICAgICAgd2hlbiAnZGF0YScgICB0aGVuIHNlbmQgZGF0YVxuICAgICAgICB3aGVuICdlbXB0eScgIHRoZW4gbnVsbFxuICAgICAgICB3aGVuICdlbmQnICAgIHRoZW4gcmV0dXJuIHNlbmQuZW5kKClcbiAgICAgICAgZWxzZSBzZW5kLmVycm9yIG5ldyBFcnJvciBcInVua25vd24gZXZlbnQgdHlwZSAje3JwciB0eXBlfVwiXG4gICAgICBzZXRJbW1lZGlhdGUgcHJvY2Vzc1xuICAgIHByb2Nlc3MoKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfJGVuc3VyZV91bmlxdWUgPSAoIGRiICkgLT5cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAjIGJsb29tICAgPSBCbG9vbS5mb3JDYXBhY2l0eSAxZTcsIDAuMVxuICBibG9vbSAgICAgPSBCbG9vbS5mb3JDYXBhY2l0eSAxZTEsIDFcbiAgcnFfY291bnQgID0gMFxuICBxdWV1ZSAgICAgPSBbXVxuICBfZW5kICAgICAgPSBudWxsXG4gIF9zZW5kICAgICA9IG51bGxcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBwcm9jZXNzX3F1ZXVlID0gPT5cbiAgICBpZiBfZW5kPyBhbmQgcnFfY291bnQgPCAxIGFuZCBxdWV1ZS5sZW5ndGggPCAxXG4gICAgICBfZW5kKClcbiAgICAgIHJldHVyblxuICAgIHNldEltbWVkaWF0ZSBwcm9jZXNzX3F1ZXVlXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgUiA9IEQuY3JlYXRlX3Rocm91Z2hzdHJlYW0oKVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgLnBpcGUgJCAoIGZhY2V0X2JmcnMsIHNlbmQsIGVuZCApIC0+XG4gICAgICBfc2VuZCA9IHNlbmRcbiAgICAgIGlmIGZhY2V0X2JmcnM/XG4gICAgICAgIGRlYnVnICfCqW51U0lqJywgZmFjZXRfYmZyc1xuICAgICAgICBxdWV1ZS51bnNoaWZ0IGZhY2V0X2JmcnNcbiAgICAgIGlmIGVuZD9cbiAgICAgICAgX2VuZCA9IGVuZFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHJldHVybiBSXG5cbiMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEBfJGVuc3VyZV91bmlxdWUgPSAoIGRiICkgLT5cbiMgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgIyBibG9vbSAgID0gQmxvb20uZm9yQ2FwYWNpdHkgMWU3LCAwLjFcbiMgICBibG9vbSAgICAgPSBCbG9vbS5mb3JDYXBhY2l0eSAxZTEsIDFcbiMgICBycV9jb3VudCAgPSAwXG4jICAgYnVmZmVyICAgID0gW11cbiMgICBfZW5kICAgICAgPSBudWxsXG4jICAgX3NlbmQgICAgID0gbnVsbFxuIyAgIFIgICAgICAgICA9IEQuY3JlYXRlX3Rocm91Z2hzdHJlYW0oKVxuIyAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICBmbHVzaCA9ID0+XG4jICAgICByZXR1cm4gaWYgYnVmZmVyLmxlbmd0aCBpcyAwXG4jICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgICAgaWYgcnFfY291bnQgPiAwXG4jICAgICAgIHNldEltbWVkaWF0ZSBmbHVzaFxuIyAgICAgICByZXR1cm4gbnVsbFxuIyAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICAgIF9zZW5kIGJ1ZmZlci5wb3AoKVxuIyAgICAgc2V0SW1tZWRpYXRlIGZsdXNoXG4jICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgICAgcmV0dXJuIG51bGxcbiMgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgUlxuIyAgICAgLnBpcGUgJCAoIGZhY2V0X2JmcnMsIHNlbmQsIGVuZCApID0+XG4jICAgICAgIF9zZW5kID0gc2VuZFxuIyAgICAgICBpZiBmYWNldF9iZnJzP1xuIyAgICAgICAgIGJ1ZmZlci5zcGxpY2UgMCwgMCwgZmFjZXRfYmZyc1xuIyAgICAgICBmbHVzaCgpXG4jICAgICAgIGlmIGVuZD9cbiMgICAgICAgICBmbHVzaCgpXG4jICAgICAucGlwZSAkICggZmFjZXRfYmZycywgc2VuZCwgZW5kICkgPT5cbiMgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLCxcbiMgICAgICAgaWYgZmFjZXRfYmZycz9cbiMgICAgICAgICBbIGtleV9iZnIsIF8sIF0gICA9IGZhY2V0X2JmcnNcbiMgICAgICAgICBtYXlfYmVfa25vd25fa2V5ICA9IGJsb29tLmhhcyBrZXlfYmZyXG4jICAgICAgICAgYmxvb20ud3JpdGUga2V5X2JmclxuIyAgICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgICAgICAgIGlmIG1heV9iZV9rbm93bl9rZXlcbiMgICAgICAgICAgIHJxX2NvdW50ICs9ICsxXG4jICAgICAgICAgICBkZWJ1ZyAnwqlRUzZrRicsICdtYXlfYmVfa25vd25fa2V5JywgcnFfY291bnQsIEBfZGVjb2RlX2tleSBkYiwga2V5X2JmclxuIyAgICAgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgICAgICAgICAgZGJbICclc2VsZicgXS5nZXQga2V5X2JmciwgKCBlcnJvciApID0+XG4jICAgICAgICAgICAgIHJxX2NvdW50ICs9IC0xXG4jICAgICAgICAgICAgIGRlYnVnICfCqVFTNmtGJywgJ21heV9iZV9rbm93bl9rZXknLCBycV9jb3VudCwgX2VuZD8sIEBfZGVjb2RlX2tleSBkYiwga2V5X2JmclxuIyAgICAgICAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgICAgICAgICAgICBpZiBlcnJvcj9cbiMgICAgICAgICAgICAgICBpZiBlcnJvclsgJ3R5cGUnIF0gaXMgJ05vdEZvdW5kRXJyb3InXG4jICAgICAgICAgICAgICAgICB1cmdlICfCqTlkMFVxJywgJ3NlbmRpbmcnLCBAX2RlY29kZV9rZXkgZGIsIGtleV9iZnJcbiMgICAgICAgICAgICAgICAgIHNlbmQgZmFjZXRfYmZyc1xuIyAgICAgICAgICAgICAgIGVsc2VcbiMgICAgICAgICAgICAgICAgIHNlbmQuZXJyb3IgZXJyb3JcbiMgICAgICAgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICAgICAgICAgICAgZWxzZVxuIyAgICAgICAgICAgICAgIHNlbmQuZXJyb3IgbmV3IEVycm9yIFwia2V5IGFscmVhZHkgaW4gREI6ICN7cnByIEBfZGVjb2RlX2tleSBkYiwga2V5X2Jmcn1cIlxuIyAgICAgICAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgICAgICAgICAgICBpZiBycV9jb3VudCA8PSAwIGFuZCBfZW5kP1xuIyAgICAgICAgICAgICAgICMgd2FybiAnwqlKT1FMYi0xJywgJ2VuZCdcbiMgICAgICAgICAgICAgICBibG9vbS5lbmQoKVxuIyAgICAgICAgICAgICAgICMgX2VuZCgpXG4jICAgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgICAgICAgZWxzZVxuIyAgICAgICAgICAgc2VuZCBmYWNldF9iZnJzXG4jICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLiwsXG4jICAgICAgIGlmIGVuZD9cbiMgICAgICAgICAjIyMgVEFJTlQgc2hvdWxkIHdyaXRlIGJsb29tLmV4cG9ydCB0byBEQiAjIyNcbiMgICAgICAgICBkZWJ1ZyAnwqlkSmNiaycsIGJ1ZmZlclxuIyAgICAgICAgIGlmIHJxX2NvdW50ID4gMFxuIyAgICAgICAgICAgX2VuZCA9IGVuZFxuIyAgICAgICAgIGVsc2VcbiMgICAgICAgICAgIHdhcm4gJ8KpSk9RTGItMicsICdlbmQnXG4jICAgICAgICAgICBibG9vbS5lbmQoKVxuIyAgICAgICAgICAgZW5kKClcbiMgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgcmV0dXJuIFJcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIFJFQURJTkdcbiMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEBjcmVhdGVfa2V5c3RyZWFtID0gKCBkYiwgbG9faGludCA9IG51bGwsIGhpX2hpbnQgPSBudWxsICkgLT5cbiMgICAjIyMgVEFJTlQgY29kZSBkdXBsaWNhdGlvbiAjIyNcbiMgICBpZiBsb19oaW50P1xuIyAgICAgaWYgaGlfaGludD9cbiMgICAgICAgcXVlcnkgPSB7IGd0ZTogbG9faGludCwgbHRlOmhpX2hpbnQsIH1cbiMgICAgIGVsc2VcbiMgICAgICAgcXVlcnkgPSB7IGd0ZTogbG9faGludCwgfVxuIyAgIGVsc2UgaWYgaGlfaGludD9cbiMgICAgIHF1ZXJ5ID0geyBsdGU6IGhpX2hpbnQsIH1cbiMgICBlbHNlXG4jICAgICBxdWVyeSA9IG51bGxcbiMgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgZGVidWcgJ8KpODM1SlAnLCBxdWVyeVxuIyAgIFIgPSBpZiBxdWVyeT8gdGhlbiAoIGRiWyAnJXNlbGYnIF0uY3JlYXRlS2V5U3RyZWFtIHF1ZXJ5ICkgZWxzZSBkYlsgJyVzZWxmJyBdLmNyZWF0ZUtleVN0cmVhbSgpXG4jICAgIyBSID0gZGJbICclc2VsZicgXS5jcmVhdGVLZXlTdHJlYW0gQG5ld19xdWVyeSBkYiwgcXVlcnlcbiMgICAjIyMgVEFJTlQgU2hvdWxkIHdlIHRlc3QgZm9yIHdlbGwtZm9ybWVkIGVudHJpZXMgaGVyZT8gIyMjXG4jICAgUiA9IFIucGlwZSAkICggYmtleSwgc2VuZCApID0+IHNlbmQgQF9kZWNvZGVfa2V5IGRiLCBia2V5XG4jICAgcmV0dXJuIFJcblxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBjcmVhdGVfcGhyYXNlc3RyZWFtID0gKCBkYiwgbG9faGludCA9IG51bGwsIGhpX2hpbnQgPSBudWxsLCBzZXR0aW5ncyApIC0+XG4gIGlucHV0ID0gQGNyZWF0ZV9mYWNldHN0cmVhbSBkYiwgbG9faGludCwgaGlfaGludCwgc2V0dGluZ3NcbiAgUiA9IGlucHV0XG4gICAgLnBpcGUgQCRhc19waHJhc2UgZGJcbiAgUlsgJyVtZXRhJyBdID0gaW5wdXRbICclbWV0YScgXVxuICByZXR1cm4gUlxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBjcmVhdGVfZmFjZXRzdHJlYW0gPSAoIGRiLCBsb19oaW50ID0gbnVsbCwgaGlfaGludCA9IG51bGwsIHNldHRpbmdzICkgLT5cbiAgIyMjXG4gICogSWYgbmVpdGVyIGBsb2Agbm9yIGBoaWAgaXMgZ2l2ZW4sIHRoZSBzdHJlYW0gd2lsbCBpdGVyYXRlIG92ZXIgYWxsIGVudHJpZXMuXG4gICogSWYgYm90aCBgbG9gIGFuZCBgaGlgIGFyZSBnaXZlbiwgYSBxdWVyeSB3aXRoIGxvd2VyIGFuZCB1cHBlciwgaW5jbHVzaXZlIGJvdW5kYXJpZXMgaXNcbiAgICBpc3N1ZWQuXG4gICogSWYgb25seSBgbG9gIGlzIGdpdmVuLCBhIHByZWZpeCBxdWVyeSBpcyBpc3N1ZWQuXG4gICogSWYgYGhpYCBpcyBnaXZlbiBidXQgYGxvYCBpcyBtaXNzaW5nLCBhbiBlcnJvciBpcyBpc3N1ZWQuXG4gICMjI1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGlmIGhpX2hpbnQ/IGFuZCBub3QgbG9faGludD9cbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJtdXN0IGdpdmUgYGxvX2hpbnRgIHdoZW4gYGhpX2hpbnRgIGlzIGdpdmVuXCJcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBpZiBsb19oaW50PyBhbmQgbm90IGhpX2hpbnQ/XG4gICAgcXVlcnkgICAgICAgPSBAX3F1ZXJ5X2Zyb21fcHJlZml4IGRiLCBsb19oaW50XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZWxzZSBpZiBsb19oaW50PyBhbmQgaGlfaGludCBpcyAnKidcbiAgICBxdWVyeSAgICAgICA9IEBfcXVlcnlfZnJvbV9wcmVmaXggZGIsIGxvX2hpbnQsICcqJ1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGVsc2VcbiAgICBsb19oaW50X2JmciA9IGlmIGxvX2hpbnQ/IHRoZW4gKCAgICAgICAgQF9lbmNvZGVfa2V5IGRiLCBsb19oaW50ICkgICAgICAgICAgZWxzZSBudWxsXG4gICAgaGlfaGludF9iZnIgPSBpZiBoaV9oaW50PyB0aGVuICggQF9xdWVyeV9mcm9tX3ByZWZpeCBkYiwgaGlfaGludCApWyAnbHRlJyBdIGVsc2UgbnVsbFxuICAgICMgbG9faGludF9iZnIgPSBpZiBsb19oaW50PyB0aGVuICggICAgICAgIEBfZW5jb2RlX2tleSBkYiwgbG9faGludCApICAgICAgICAgIGVsc2UgQ09ERUNbICdrZXlzJyBdWyAnbG8nIF1cbiAgICAjIGhpX2hpbnRfYmZyID0gaWYgaGlfaGludD8gdGhlbiAoIEBfcXVlcnlfZnJvbV9wcmVmaXggZGIsIGhpX2hpbnQgKVsgJ2x0ZScgXSBlbHNlIENPREVDWyAna2V5cycgXVsgJ2hpJyBdXG4gICAgcXVlcnkgICAgICAgPSB7IGd0ZTogbG9faGludF9iZnIsIGx0ZTogaGlfaGludF9iZnIsIH1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAjIyMgVEFJTlQgU2hvdWxkIHdlIHRlc3QgZm9yIHdlbGwtZm9ybWVkIGVudHJpZXMgaGVyZT8gIyMjXG4gIFIgPSBkYlsgJyVzZWxmJyBdLmNyZWF0ZVJlYWRTdHJlYW0gcXVlcnlcbiAgUiA9IFIucGlwZSAkICggeyBrZXksIHZhbHVlIH0sIHNlbmQgKSA9PiBzZW5kIFsgKCBAX2RlY29kZV9rZXkgZGIsIGtleSApLCAoIEBfZGVjb2RlX3ZhbHVlIGRiLCB2YWx1ZSApLCBdXG4gIFJbICclbWV0YScgXSA9IHt9XG4gIFJbICclbWV0YScgXVsgJ3F1ZXJ5JyBdID0gcXVlcnlcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICByZXR1cm4gUlxuXG4jICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBAcmVhZF9tYW55ID0gKCBkYiwgaGludCA9IG51bGwgKSAtPlxuIyAgICMjIyBIaW50cyBhcmUgaW50ZXJwcmV0ZWQgYXMgcGFydGlhbCBzZWNvbmRhcnkgKFBPUykga2V5cy4gIyMjXG5cbiMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEBfcmVhZF9vbmUgPSAoIGRiLCBrZXksIGZhbGxiYWNrID0gQF9taXNmaXQsIGhhbmRsZXIgKSAtPlxuIyAgIHN3aXRjaCBhcml0eSA9IGFyZ3VtZW50cy5sZW5ndGhcbiMgICAgIHdoZW4gM1xuIyAgICAgICBoYW5kbGVyICAgPSBmYWxsYmFja1xuIyAgICAgICBmYWxsYmFjayAgPSBAX21pc2ZpdFxuIyAgICAgd2hlbiA0IHRoZW4gbnVsbFxuIyAgICAgZWxzZSB0aHJvdyBuZXcgRXJyb3IgXCJleHBlY3RlZCAzIG9yIDQgYXJndW1lbnRzLCBnb3QgI3thcml0eX1cIlxuIyAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICBkYlsgJyVzZWxmJyBdLmdldCBrZXksIGhhbmRsZXJcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AcmVhZF9zdWIgPSAoIGRiLCBzZXR0aW5ncywgcmVhZCApIC0+XG4gIHN3aXRjaCBhcml0eSA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICB3aGVuIDJcbiAgICAgIHJlYWQgICAgICA9IHNldHRpbmdzXG4gICAgICBzZXR0aW5ncyAgPSBudWxsXG4gICAgd2hlbiAzXG4gICAgICBudWxsXG4gICAgZWxzZVxuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiZXhwZWN0ZWQgMiBvciAzIGFyZ3VtZW50cywgZ290ICN7YXJpdHl9XCJcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBpbmRleGVkICAgICAgICAgICA9IHNldHRpbmdzP1sgJ2luZGV4ZWQnICAgIF0gPyBub1xuICAjIHRyYW5zZm9ybSAgICAgICAgID0gc2V0dGluZ3M/WyAndHJhbnNmb3JtJyAgXSA/IEQuJHBhc3NfdGhyb3VnaCgpXG4gIG1hbmdsZSAgICAgICAgICAgID0gc2V0dGluZ3M/WyAnbWFuZ2xlJyAgICAgXSA/ICggZGF0YSApIC0+IGRhdGFcbiAgc2VuZF9lbXB0eSAgICAgICAgPSBzZXR0aW5ncz9bICdlbXB0eScgICAgICBdID8gbm9cbiAgaW5zZXJ0X2luZGV4ICAgICAgPSBpZiBpbmRleGVkIHRoZW4gRC5uZXdfaW5kZXhlcigpIGVsc2UgKCB4ICkgLT4geFxuICBvcGVuX3N0cmVhbV9jb3VudCA9IDBcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICByZXR1cm4gJCAoIG91dGVyX2RhdGEsIG91dGVyX3NlbmQsIG91dGVyX2VuZCApID0+XG4gICAgY291bnQgPSAwXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpZiBvdXRlcl9kYXRhP1xuICAgICAgb3Blbl9zdHJlYW1fY291bnQgICAgKz0gKzFcbiAgICAgIHN1Yl9pbnB1dCAgICAgICAgICAgICA9IHJlYWQgb3V0ZXJfZGF0YVxuICAgICAgWyBtZW1vLCBzdWJfaW5wdXQsIF0gID0gaWYgQ05ELmlzYV9saXN0IHN1Yl9pbnB1dCB0aGVuIHN1Yl9pbnB1dCBlbHNlIFsgQF9taXNmaXQsIHN1Yl9pbnB1dCwgXVxuICAgICAgc3ViX2lucHV0XG4gICAgICAgICMgLnBpcGUgdHJhbnNmb3JtXG4gICAgICAgIC5waXBlIGRvID0+XG4gICAgICAgICAgIyMjIFRBSU5UIG5vIG5lZWQgdG8gYnVpbGQgYnVmZmVyIGlmIG5vdCBgc2VuZF9lbXB0eWAgYW5kIHRoZXJlIGFyZSBubyByZXN1bHRzICMjI1xuICAgICAgICAgIGJ1ZmZlciA9IGlmIG1lbW8gaXMgQF9taXNmaXQgdGhlbiBbXSBlbHNlIFsgbWVtbywgXVxuICAgICAgICAgIHJldHVybiAkICggaW5uZXJfZGF0YSwgXywgaW5uZXJfZW5kICkgPT5cbiAgICAgICAgICAgIGlmIGlubmVyX2RhdGE/XG4gICAgICAgICAgICAgIGlubmVyX2RhdGEgPSBtYW5nbGUgaW5uZXJfZGF0YVxuICAgICAgICAgICAgICBpZiBpbm5lcl9kYXRhP1xuICAgICAgICAgICAgICAgIGNvdW50ICs9ICsxXG4gICAgICAgICAgICAgICAgYnVmZmVyLnB1c2ggaW5uZXJfZGF0YVxuICAgICAgICAgICAgaWYgaW5uZXJfZW5kP1xuICAgICAgICAgICAgICBpZiBzZW5kX2VtcHR5IG9yIGNvdW50ID4gMFxuICAgICAgICAgICAgICAgIG91dGVyX3NlbmQgaW5zZXJ0X2luZGV4IGJ1ZmZlclxuICAgICAgICAgICAgICBvcGVuX3N0cmVhbV9jb3VudCArPSAtMVxuICAgICAgICAgICAgICBpbm5lcl9lbmQoKVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaWYgb3V0ZXJfZW5kP1xuICAgICAgcmVwZWF0X2ltbWVkaWF0ZWx5IC0+XG4gICAgICAgIHJldHVybiB0cnVlIHVubGVzcyBvcGVuX3N0cmVhbV9jb3VudCBpcyAwXG4gICAgICAgIG91dGVyX2VuZCgpXG4gICAgICAgIHJldHVybiBmYWxzZVxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyBLRVlTICYgVkFMVUVTXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfZW5jb2RlX2tleSA9ICggZGIsIGtleSwgZXh0cmFfYnl0ZSApIC0+XG4gIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwga2V5ICN7cnByIGtleX1cIiBpZiBrZXkgaXMgdW5kZWZpbmVkXG4gIHJldHVybiBfY29kZWNfZW5jb2RlIGtleSwgZXh0cmFfYnl0ZVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfZGVjb2RlX2tleSA9ICggZGIsIGtleSApIC0+XG4gIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwga2V5ICN7cnByIGtleX1cIiBpZiAoIFIgPSBfY29kZWNfZGVjb2RlIGtleSApIGlzIHVuZGVmaW5lZFxuICByZXR1cm4gUlxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfZW5jb2RlX3ZhbHVlID0gKCBkYiwgdmFsdWUgICAgICApIC0+IEpTT04uc3RyaW5naWZ5IHZhbHVlXG5AX2RlY29kZV92YWx1ZSA9ICggZGIsIHZhbHVlX2JmciAgKSAtPiBKU09OLnBhcnNlICAgICB2YWx1ZV9iZnIudG9TdHJpbmcgJ3V0Zi04J1xuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMjIyBOQiBBcmd1bWVudCBvcmRlcmluZyBmb3IgdGhlc2UgZnVuY3Rpb24gaXMgYWx3YXlzIHN1YmplY3QgYmVmb3JlIG9iamVjdCwgcmVnYXJkbGVzcyBvZiB0aGUgcGhyYXNldHlwZVxuYW5kIHRoZSBvcmRlcmluZyBpbiB0aGUgcmVzdWx0aW5nIGtleS4gIyMjXG5AbmV3X2tleSA9ICggZGIsIHBocmFzZXR5cGUsIHNrLCBzdiwgb2ssIG92LCBpZHggKSAtPlxuICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIHBocmFzZXR5cGU6ICN7cnByIHBocmFzZXR5cGV9XCIgdW5sZXNzIHBocmFzZXR5cGUgaW4gWyAnc28nLCAnb3MnLCBdXG4gIFsgc2ssIHN2LCBvaywgb3YsIF0gPSBbIG9rLCBvdiwgc2ssIHN2LCBdIGlmIHBocmFzZXR5cGUgaXMgJ29zJ1xuICByZXR1cm4gWyBwaHJhc2V0eXBlLCBzaywgc3YsIG9rLCBvdiwgKCBpZHggPyAwICksIF1cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AbmV3X3NvX2tleSA9ICggZGIsIFAuLi4gKSAtPiBAbmV3X2tleSBkYiwgJ3NvJywgUC4uLlxuQG5ld19vc19rZXkgPSAoIGRiLCBQLi4uICkgLT4gQG5ld19rZXkgZGIsICdvcycsIFAuLi5cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX25ld19vc19rZXlfZnJvbV9zb19rZXkgPSAoIGRiLCBzb19rZXkgKSAtPlxuICBbIHBocmFzZXR5cGUsIHNrLCBzdiwgb2ssIG92LCBpZHgsIF0gPSBAYXNfcGhyYXNlIGRiLCBzb19rZXlcbiAgdGhyb3cgbmV3IEVycm9yIFwiZXhwZWN0ZWQgcGhyYXNldHlwZSAnc28nLCBnb3QgI3tycHIgcGhyYXNldHlwZX1cIiB1bmxlc3MgcGhyYXNldHlwZSBpcyAnc28nXG4gIHJldHVybiBbICdvcycsIG9rLCBvdiwgc2ssIHN2LCBpZHgsIF1cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AbmV3X2tleXMgPSAoIGRiLCBwaHJhc2V0eXBlLCBzaywgc3YsIG9rLCBvdiwgaWR4ICkgLT5cbiAgb3RoZXJfcGhyYXNldHlwZSAgPSBpZiBwaHJhc2V0eXBlIGlzICdzbycgdGhlbiAnb3MnIGVsc2UgJ3NvJ1xuICByZXR1cm4gW1xuICAgICggQG5ld19rZXkgZGIsICAgICAgIHBocmFzZXR5cGUsIHNrLCBzdiwgb2ssIG92LCBpZHggKSxcbiAgICAoIEBuZXdfa2V5IGRiLCBvdGhlcl9waHJhc2V0eXBlLCBzaywgc3YsIG9rLCBvdiwgaWR4ICksIF1cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AYXNfcGhyYXNlID0gKCBkYiwga2V5LCB2YWx1ZSwgbm9ybWFsaXplID0geWVzICkgLT5cbiAgc3dpdGNoIHBocmFzZXR5cGUgPSBrZXlbIDAgXVxuICAgIHdoZW4gJ3NwbydcbiAgICAgIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgU1BPIGtleSAobGVuZ3RoICN7bGVuZ3RofSlcIiB1bmxlc3MgKCBsZW5ndGggPSBrZXkubGVuZ3RoICkgaXMgM1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCB2YWx1ZSAoMSkgI3tycHIgdmFsdWV9XCIgaWYgdmFsdWUgaW4gWyB1bmRlZmluZWQsIF1cbiAgICAgIHJldHVybiBbIHBocmFzZXR5cGUsIGtleVsgMSBdLCBrZXlbIDIgXSwgdmFsdWUsIF1cbiAgICB3aGVuICdwb3MnXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIFBPUyBrZXkgKGxlbmd0aCAje2xlbmd0aH0pXCIgdW5sZXNzIDQgPD0gKCBsZW5ndGggPSBrZXkubGVuZ3RoICkgPD0gNVxuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCB2YWx1ZSAoMikgI3tycHIgdmFsdWV9XCIgaWYgbm90ICggdmFsdWUgaW4gWyBudWxsLCBdIClcbiAgICAgIHJldHVybiBbIHBocmFzZXR5cGUsIGtleVsgMyBdLCBrZXlbIDEgXSwga2V5WyAyIF0sIGtleVsgNCBdLCBdIGlmIGtleVsgNCBdP1xuICAgICAgcmV0dXJuIFsgcGhyYXNldHlwZSwga2V5WyAzIF0sIGtleVsgMSBdLCBrZXlbIDIgXSwgXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkAkYXNfcGhyYXNlID0gKCBkYiApIC0+XG4gIHJldHVybiAkICggZGF0YSwgc2VuZCApID0+XG4gICAgc2VuZCBAYXNfcGhyYXNlIGRiLCBkYXRhLi4uXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQGtleV9mcm9tX3VybCA9ICggZGIsIHVybCApIC0+XG4gICMjIyBUQUlOIGRvZXMgbm90IHVuZXNjYXBlIGFzIHlldCAjIyNcbiAgIyMjIFRBSU4gZG9lcyBub3QgY2FzdCB2YWx1ZXMgYXMgeWV0ICMjI1xuICAjIyMgVEFJTlQgZG9lcyBub3Qgc3VwcG9ydCBtdWx0aXBsZSBpbmRleGVzIGFzIHlldCAjIyNcbiAgWyBwaHJhc2V0eXBlLCBmaXJzdCwgc2Vjb25kLCBpZHgsIF0gPSB1cmwuc3BsaXQgJ3wnXG4gIHVubGVzcyBwaHJhc2V0eXBlPyBhbmQgcGhyYXNldHlwZS5sZW5ndGggPiAwIGFuZCBwaHJhc2V0eXBlIGluIFsgJ3NvJywgJ29zJywgXVxuICAgIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgVVJMIGtleSAje3JwciB1cmx9XCJcbiAgdW5sZXNzIGZpcnN0PyBhbmQgZmlyc3QubGVuZ3RoID4gMCBhbmQgc2Vjb25kPyBhbmQgc2Vjb25kLmxlbmd0aCA+IDBcbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIFVSTCBrZXkgI3tycHIgdXJsfVwiXG4gIGlkeCA9IGlmICggaWR4PyBhbmQgaWR4Lmxlbmd0aCA+IDAgKSB0aGVuICggcGFyc2VJbnQgaWR4LCAxMCApIGVsc2UgMFxuICBbIHNrLCBzdiwgXSA9ICBmaXJzdC5zcGxpdCAnOidcbiAgWyBvaywgb3YsIF0gPSBzZWNvbmQuc3BsaXQgJzonXG4gIHVubGVzcyBzaz8gYW5kIHNrLmxlbmd0aCA+IDAgYW5kIG9rPyBhbmQgb2subGVuZ3RoID4gMFxuICAgIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgVVJMIGtleSAje3JwciB1cmx9XCJcbiAgWyBzaywgc3YsIG9rLCBvdiwgXSA9IFsgb2ssIG92LCBzaywgc3YsIF0gaWYgcGhyYXNldHlwZSBpcyAnb3MnXG4gIHJldHVybiBbIHBocmFzZXR5cGUsIHNrLCBzdiwgb2ssIG92LCBpZHgsIF1cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AdXJsX2Zyb21fa2V5ID0gKCBkYiwga2V5ICkgLT5cbiAgaWYgKCBAX3R5cGVfZnJvbV9rZXkgZGIsIGtleSApIGlzICdsaXN0J1xuICAgIFsgcGhyYXNldHlwZSwgdGFpbC4uLiwgXSA9IGtleVxuICAgIGlmIHBocmFzZXR5cGUgaXMgJ3NwbydcbiAgICAgIFsgc2JqLCBwcmQsIF0gPSB0YWlsXG4gICAgICByZXR1cm4gXCJzcG98I3tzYmp9fCN7cHJkfXxcIlxuICAgIGVsc2VcbiAgICAgIFsgcHJkLCBvYmosIHNiaiwgaWR4LCBdID0gdGFpbFxuICAgICAgaWR4X3JwciA9IGlmIGlkeD8gdGhlbiBycHIgaWR4IGVsc2UgJydcbiAgICAgIHJldHVybiBcInBvc3wje3ByZH06I3tvYmp9fCN7c2JqfXwje2lkeF9ycHJ9XCJcbiAgcmV0dXJuIFwiI3tycHIga2V5fVwiXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQCR1cmxfZnJvbV9rZXkgPSAoIGRiICkgLT4gJCAoIGtleSwgc2VuZCApID0+IHNlbmQgQHVybF9mcm9tX2tleSBkYiwga2V5XG5AJGtleV9mcm9tX3VybCA9ICggZGIgKSAtPiAkICggdXJsLCBzZW5kICkgPT4gc2VuZCBAa2V5X2Zyb21fdXJsIGRiLCBrZXlcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX3R5cGVfZnJvbV9rZXkgPSAoIGRiLCBrZXkgKSAtPlxuICBpZiBBcnJheS5pc0FycmF5IGtleVxuICAgICMgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBrZXk6ICN7cnByIGtleX1cIiB1bmxlc3Mga2V5Lmxlbmd0aCBpcyA2XG4gICAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBwaHJhc2V0eXBlOiAje3JwciBrZXl9XCIgdW5sZXNzIGtleVsgJzAnIF0gaW4gQHBocmFzZXR5cGVzXG4gICAgcmV0dXJuICdsaXN0J1xuICByZXR1cm4gJ290aGVyJ1xuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyBQUkVGSVhFUyAmIFFVRVJJRVNcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9xdWVyeV9mcm9tX3ByZWZpeCA9ICggZGIsIGxvX2hpbnQsIHN0YXIgKSAtPlxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGlmIHN0YXI/XG4gICAgIyMjICdBc3RlcmlzaycgZW5jb2Rpbmc6IHBhcnRpYWwga2V5IHNlZ21lbnRzIG1hdGNoICMjI1xuICAgIGd0ZSAgID0gQF9lbmNvZGVfa2V5IGRiLCBsb19oaW50XG4gICAgbHRlICAgPSBAX2VuY29kZV9rZXkgZGIsIGxvX2hpbnRcbiAgICBsdGVbIGx0ZS5sZW5ndGggLSAxIF0gPSBDT0RFQ1sgJ3R5cGVtYXJrZXJzJyAgXVsgJ2hpJyBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZWxzZVxuICAgICMjIyAnQ2xhc3NpY2FsJyBlbmNvZGluZzogb25seSBmdWxsIGtleSBzZWdtZW50cyBtYXRjaCAjIyNcbiAgICBiYXNlICA9IEBfZW5jb2RlX2tleSBkYiwgbG9faGludCwgQ09ERUNbICd0eXBlbWFya2VycycgIF1bICdoaScgXVxuICAgIGd0ZSAgID0gYmFzZS5zbGljZSAwLCBiYXNlLmxlbmd0aCAtIDFcbiAgICBsdGUgICA9IGJhc2Uuc2xpY2UgMCwgYmFzZS5sZW5ndGhcbiAgcmV0dXJuIHsgZ3RlLCBsdGUsIH1cblxuXG5cblxuXG4iXX0=