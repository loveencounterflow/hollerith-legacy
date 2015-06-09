(function() {
  var $, Bloom, CND, CODEC, D, DUMP, LODASH, _codec_decode, _codec_encode, _new_level_db, badge, debug, echo, help, leveldown, log, repeat_immediately, rpr, step, suspend, urge, warn, whisper,
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
    var $write, R, buffer_size, ref, ref1, solid_predicates, substrate;
    if (settings == null) {
      settings = {};
    }
    buffer_size = (ref = settings['batch']) != null ? ref : 10000;
    solid_predicates = (ref1 = settings['solids']) != null ? ref1 : [];
    substrate = db['%self'];
    R = D.create_throughstream();
    if (buffer_size < 0) {
      throw new Error("buffer size must be positive integer, got " + (rpr(buffer_size)));
    } else if (buffer_size < 2) {
      $write = (function(_this) {
        return function() {
          return $(function(facet_bfrs, send, end) {
            if (facet_bfrs != null) {
              return substrate.put.apply(substrate, slice.call(facet_bfrs).concat([function() {
                if (end != null) {
                  return end();
                }
              }]));
            } else if (end != null) {
              return end();
            }
          });
        };
      })(this);
    } else {
      $write = (function(_this) {
        return function() {
          var buffer, flush;
          buffer = [];
          flush = function(send, end) {
            var _buffer;
            _buffer = buffer;
            buffer = [];
            return substrate.batch(_buffer, function(error) {
              if (error != null) {
                send.error(error);
              }
              if (end != null) {
                return end();
              }
            });
          };
          return $(function(facet_bfrs, send, end) {
            var key_bfr, value_bfr;
            if (facet_bfrs != null) {
              key_bfr = facet_bfrs[0], value_bfr = facet_bfrs[1];
              buffer.push({
                type: 'put',
                key: key_bfr,
                value: value_bfr
              });
              if (buffer.length >= buffer_size) {
                return flush(send, end);
              }
            } else if (end != null) {
              if (buffer.length > 0) {
                return flush(send, end);
              } else {
                return end();
              }
            }
          });
        };
      })(this);
    }
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
    })(this))).pipe($write());
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

//# sourceMappingURL=data:application/json;base64,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Ym9CO0VBQUEsQ0Fqb0J0QixDQUFBO0FBQUEiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIlxuXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuIyBuanNfdXRpbCAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAndXRpbCdcbiMgbmpzX3BhdGggICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ3BhdGgnXG4jIG5qc19mcyAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdmcydcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuQ05EICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2NuZCdcbnJwciAgICAgICAgICAgICAgICAgICAgICAgPSBDTkQucnByXG5iYWRnZSAgICAgICAgICAgICAgICAgICAgID0gJ0hPTExFUklUSC9tYWluJ1xubG9nICAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdwbGFpbicsICAgICBiYWRnZVxuZGVidWcgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdkZWJ1ZycsICAgICBiYWRnZVxud2FybiAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICd3YXJuJywgICAgICBiYWRnZVxuaGVscCAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdoZWxwJywgICAgICBiYWRnZVxudXJnZSAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICd1cmdlJywgICAgICBiYWRnZVxud2hpc3BlciAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICd3aGlzcGVyJywgICBiYWRnZVxuZWNobyAgICAgICAgICAgICAgICAgICAgICA9IENORC5lY2hvLmJpbmQgQ05EXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnN1c3BlbmQgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdjb2ZmZWVub2RlLXN1c3BlbmQnXG5zdGVwICAgICAgICAgICAgICAgICAgICAgID0gc3VzcGVuZC5zdGVwXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkNPREVDICAgICAgICAgICAgICAgICAgICAgPSBAQ09ERUMgPSByZXF1aXJlICcuL2NvZGVjJ1xuRFVNUCAgICAgICAgICAgICAgICAgICAgICA9IEBEVU1QICA9IHJlcXVpcmUgJy4vZHVtcCdcbl9jb2RlY19lbmNvZGUgICAgICAgICAgICAgPSBDT0RFQy5lbmNvZGUuYmluZCBDT0RFQ1xuX2NvZGVjX2RlY29kZSAgICAgICAgICAgICA9IENPREVDLmRlY29kZS5iaW5kIENPREVDXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkQgICAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdwaXBlZHJlYW1zMidcbiQgICAgICAgICAgICAgICAgICAgICAgICAgPSBELnJlbWl0LmJpbmQgRFxuX25ld19sZXZlbF9kYiAgICAgICAgICAgICA9IHJlcXVpcmUgJ2xldmVsJ1xubGV2ZWxkb3duICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2xldmVsL25vZGVfbW9kdWxlcy9sZXZlbGRvd24nXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnN1c3BlbmQgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdjb2ZmZWVub2RlLXN1c3BlbmQnXG5zdGVwICAgICAgICAgICAgICAgICAgICAgID0gc3VzcGVuZC5zdGVwXG5yZXBlYXRfaW1tZWRpYXRlbHkgICAgICAgID0gc3VzcGVuZC5yZXBlYXRfaW1tZWRpYXRlbHlcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuTE9EQVNIICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2xvZGFzaCdcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyMjIGh0dHBzOi8vZ2l0aHViLmNvbS9iM25qNG0vYmxvb20tc3RyZWFtICMjI1xuQmxvb20gICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2Jsb29tLXN0cmVhbSdcblxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBwaHJhc2V0eXBlcyAgICAgID0gWyAncG9zJywgJ3NwbycsIF1cbkBfbWlzZml0ICAgICAgICAgID0gU3ltYm9sICdtaXNmaXQnXG5AX3plcm9fdmFsdWVfYmZyICA9IG5ldyBCdWZmZXIgJ251bGwnXG4jIHdhcm4gXCJtaW5kIGluY29uc2lzdGVuY2llcyBpbiBIT0xMRVJJVEgyL21haW4gQF96ZXJvX2VuYyBldGNcIlxuIyBAX3plcm8gICAgICAgICAgICA9IHRydWUgIyA/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/P1xuIyBAX3plcm9fZW5jICAgICAgICA9IF9jb2RlY19lbmNvZGUgWyBAX3plcm8sICAgIF1cbiMgQF9sb19lbmMgICAgICAgICAgPSBfY29kZWNfZW5jb2RlIFsgbnVsbCwgICAgICBdXG4jIEBfaGlfZW5jICAgICAgICAgID0gX2NvZGVjX2VuY29kZSBbIENPREVDLiwgXVxuIyBAX2xhc3Rfb2N0ZXQgICAgICA9IG5ldyBCdWZmZXIgWyAweGZmLCBdXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQG5ld19kYiA9ICggcm91dGUgKSAtPlxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGxldmVsX3NldHRpbmdzID1cbiAgICAna2V5RW5jb2RpbmcnOiAgICAgICAgICAnYmluYXJ5J1xuICAgICd2YWx1ZUVuY29kaW5nJzogICAgICAgICdiaW5hcnknXG4gICAgJ2NyZWF0ZUlmTWlzc2luZyc6ICAgICAgeWVzXG4gICAgJ2Vycm9ySWZFeGlzdHMnOiAgICAgICAgbm9cbiAgICAnY29tcHJlc3Npb24nOiAgICAgICAgICB5ZXNcbiAgICAnc3luYyc6ICAgICAgICAgICAgICAgICBub1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHN1YnN0cmF0ZSAgICAgICAgICAgPSBfbmV3X2xldmVsX2RiIHJvdXRlLCBsZXZlbF9zZXR0aW5nc1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIFIgPVxuICAgICd+aXNhJzogICAgICAgICAgICdIT0xMRVJJVEgvZGInXG4gICAgJyVzZWxmJzogICAgICAgICAgc3Vic3RyYXRlXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcmV0dXJuIFJcblxuIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQF9yZW9wZW4gPSAoIGRiLCBoYW5kbGVyICkgLT5cbiMgICBzdGVwICggcmVzdW1lICkgPT5cbiMgICAgIHJvdXRlID0gZGJbICclc2VsZicgXVsgJ2xvY2F0aW9uJyBdXG4jICAgICB5aWVsZCBkYlsgJyVzZWxmJyBdLmNsb3NlIHJlc3VtZVxuIyAgICAgeWllbGQgZGJbICclc2VsZicgXS5vcGVuIHJlc3VtZVxuIyAgICAgd2hpc3BlciBcInJlLW9wZW5lZCBMZXZlbERCIGF0ICN7cm91dGV9XCJcbiMgICAgIGhhbmRsZXIgbnVsbFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBjbGVhciA9ICggZGIsIGhhbmRsZXIgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICByb3V0ZSA9IGRiWyAnJXNlbGYnIF1bICdsb2NhdGlvbicgXVxuICAgIHdoaXNwZXIgXCJjbG9zaW5nIERCXCJcbiAgICB5aWVsZCBkYlsgJyVzZWxmJyBdLmNsb3NlIHJlc3VtZVxuICAgICMgd2hpc3BlciBcImVyYXNpbmcgREJcIlxuICAgIHlpZWxkIGxldmVsZG93bi5kZXN0cm95IHJvdXRlLCByZXN1bWVcbiAgICAjIHdoaXNwZXIgXCJyZS1vcGVuaW5nIERCXCJcbiAgICB5aWVsZCBkYlsgJyVzZWxmJyBdLm9wZW4gcmVzdW1lXG4gICAgIyBoZWxwIFwiZXJhc2VkIGFuZCByZS1vcGVuZWQgTGV2ZWxEQiBhdCAje3JvdXRlfVwiXG4gICAgaGFuZGxlciBudWxsXG5cbiMgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jICMgV1JJVElOR1xuIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQCR3cml0ZSA9ICggZGIsIHNldHRpbmdzICkgLT5cbiMgICAjIyMgRXhwZWN0cyBhIEhvbGxlcml0aCBEQiBvYmplY3QgYW5kIGFuIG9wdGlvbmFsIGJ1ZmZlciBzaXplOyByZXR1cm5zIGEgc3RyZWFtIHRyYW5zZm9ybWVyIHRoYXQgZG9lcyBhbGxcbiMgICBvZiB0aGUgZm9sbG93aW5nOlxuXG4jICAgKiBJdCBleHBlY3RzIGFuIFNPIGtleSBmb3Igd2hpY2ggaXQgd2lsbCBnZW5lcmF0ZSBhIGNvcnJlc3BvbmRpbmcgT1Mga2V5LlxuIyAgICogQSBjb3JyZXNwb25kaW5nIE9TIGtleSBpcyBmb3JtdWxhdGVkIGV4Y2VwdCB3aGVuIHRoZSBTTyBrZXkncyBvYmplY3QgdmFsdWUgaXMgYSBKUyBvYmplY3QgLyBhIFBPRCAoc2luY2VcbiMgICAgIGluIHRoYXQgY2FzZSwgdGhlIHZhbHVlIHNlcmlhbGl6YXRpb24gaXMgam9sbHkgdXNlbGVzcyBhcyBhbiBpbmRleCkuXG4jICAgKiBJdCBzZW5kcyBvbiBib3RoIHRoZSBTTyBhbmQgdGhlIE9TIGtleSBkb3duc3RyZWFtIGZvciBvcHRpb25hbCBmdXJ0aGVyIHByb2Nlc3NpbmcuXG4jICAgKiBJdCBmb3JtcyBhIHByb3BlciBgbm9kZS1sZXZlbGAtY29tcGF0aWJsZSBiYXRjaCByZWNvcmQgZm9yIGVhY2gga2V5IGFuZCBjb2xsZWN0IGFsbCByZWNvcmRzXG4jICAgICBpbiBhIGJ1ZmZlci5cbiMgICAqIFdoZW5ldmVyIHRoZSBidWZmZXIgaGFzIG91dGdyb3duIHRoZSBnaXZlbiBidWZmZXIgc2l6ZSwgdGhlIGJ1ZmZlciB3aWxsIGJlIHdyaXR0ZW4gaW50byB0aGUgREIgdXNpbmdcbiMgICAgIGBsZXZlbHVwYCdzIGBiYXRjaGAgY29tbWFuZC5cbiMgICAqIFdoZW4gdGhlIGxhc3QgcGVuZGluZyBiYXRjaCBoYXMgYmVlbiB3cml0dGVuIGludG8gdGhlIERCLCB0aGUgYGVuZGAgZXZlbnQgaXMgY2FsbGVkIG9uIHRoZSBzdHJlYW1cbiMgICAgIGFuZCBtYXkgYmUgZGV0ZWN0ZWQgZG93bnN0cmVhbS5cblxuIyAgICMjI1xuIyAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICBzZXR0aW5ncyAgICAgICAgID89IHt9XG4jICAgYnVmZmVyX3NpemUgICAgICAgPSBzZXR0aW5nc1sgJ2JhdGNoJyAgXSA/IDEwMDAwXG4jICAgc29saWRfcHJlZGljYXRlcyAgPSBzZXR0aW5nc1sgJ3NvbGlkcycgXSA/IFtdXG4jICAgYnVmZmVyICAgICAgICAgICAgPSBbXVxuIyAgIHN1YnN0cmF0ZSAgICAgICAgID0gZGJbICclc2VsZicgXVxuIyAgIGJhdGNoX2NvdW50ICAgICAgID0gMFxuIyAgIGhhc19lbmRlZCAgICAgICAgID0gbm9cbiMgICBfc2VuZCAgICAgICAgICAgICA9IG51bGxcbiMgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgdGhyb3cgbmV3IEVycm9yIFwiYnVmZmVyIHNpemUgbXVzdCBiZSBwb3NpdGl2ZSBpbnRlZ2VyLCBnb3QgI3tycHIgYnVmZmVyX3NpemV9XCIgdW5sZXNzIGJ1ZmZlcl9zaXplID4gMFxuIyAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICBwdXNoID0gKCBrZXksIHZhbHVlICkgPT5cbiMgICAgIHZhbHVlX2JmciA9IGlmIHZhbHVlPyB0aGVuIEBfZW5jb2RlX3ZhbHVlIGRiLCB2YWx1ZSBlbHNlIEBfemVyb192YWx1ZV9iZnJcbiMgICAgIGJ1ZmZlci5wdXNoIHsgdHlwZTogJ3B1dCcsIGtleTogKCBAX2VuY29kZV9rZXkgZGIsIGtleSApLCB2YWx1ZTogdmFsdWVfYmZyLCB9XG4jICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgIGZsdXNoID0gPT5cbiMgICAgIGlmIGJ1ZmZlci5sZW5ndGggPiAwXG4jICAgICAgIGJhdGNoX2NvdW50ICs9ICsxXG4jICAgICAgIHN1YnN0cmF0ZS5iYXRjaCBidWZmZXIsICggZXJyb3IgKSA9PlxuIyAgICAgICAgIHRocm93IGVycm9yIGlmIGVycm9yP1xuIyAgICAgICAgIGJhdGNoX2NvdW50ICs9IC0xXG4jICAgICAgICAgX3NlbmQuZW5kKCkgaWYgaGFzX2VuZGVkIGFuZCBiYXRjaF9jb3VudCA8IDFcbiMgICAgICAgYnVmZmVyID0gW11cbiMgICAgIGVsc2VcbiMgICAgICAgX3NlbmQuZW5kKClcbiMgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgcmV0dXJuICQgKCBzcG8sIHNlbmQsIGVuZCApID0+XG4jICAgICBfc2VuZCA9IHNlbmRcbiMgICAgIGlmIHNwbz9cbiMgICAgICAgWyBzYmosIHByZCwgb2JqLCBdID0gc3BvXG4jICAgICAgIHB1c2ggWyAnc3BvJywgc2JqLCBwcmQsIF0sIG9ialxuIyAgICAgICAjIyMgVEFJTlQgd2hhdCB0byBzZW5kLCBpZiBhbnl0aGluZz8gIyMjXG4jICAgICAgICMgc2VuZCBlbnRyeVxuIyAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICAgICAgaWYgQ05ELmlzYV9wb2Qgb2JqXG4jICAgICAgICAgIyMjIERvIG5vdCBjcmVhdGUgaW5kZXggZW50cmllcyBpbiBjYXNlIGBvYmpgIGlzIGEgUE9EOiAjIyNcbiMgICAgICAgICBudWxsXG4jICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgICAgICBlbHNlIGlmIENORC5pc2FfbGlzdCBvYmpcbiMgICAgICAgICBpZiBwcmQgaW4gc29saWRfcHJlZGljYXRlc1xuIyAgICAgICAgICAgcHVzaCBbICdwb3MnLCBwcmQsIG9iaiwgc2JqLCBdXG4jICAgICAgICAgZWxzZVxuIyAgICAgICAgICAgIyMjIENyZWF0ZSBvbmUgaW5kZXggZW50cnkgZm9yIGVhY2ggZWxlbWVudCBpbiBjYXNlIGBvYmpgIGlzIGEgbGlzdDogIyMjXG4jICAgICAgICAgICBmb3Igb2JqX2VsZW1lbnQsIG9ial9pZHggaW4gb2JqXG4jICAgICAgICAgICAgIHB1c2ggWyAncG9zJywgcHJkLCBvYmpfZWxlbWVudCwgc2JqLCBvYmpfaWR4LCBdXG4jICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgICAgICBlbHNlXG4jICAgICAgICAgIyMjIENyZWF0ZSBvbmUgaW5kZXggZW50cnkgZm9yIGBvYmpgIG90aGVyd2lzZTogIyMjXG4jICAgICAgICAgcHVzaCBbICdwb3MnLCBwcmQsIG9iaiwgc2JqLCBdXG4jICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgICAgICBmbHVzaCgpIGlmIGJ1ZmZlci5sZW5ndGggPj0gYnVmZmVyX3NpemVcbiMgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgICAjIyMgRmx1c2ggcmVtYWluaW5nIGJ1ZmZlcmVkIGVudHJpZXMgdG8gREIgIyMjXG4jICAgICBpZiBlbmQ/XG4jICAgICAgIGhhc19lbmRlZCA9IHllc1xuIyAgICAgICBmbHVzaCgpXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIFdSSVRJTkdcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQCR3cml0ZSA9ICggZGIsIHNldHRpbmdzICkgLT5cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzZXR0aW5ncyAgICAgICAgID89IHt9XG4gIGJ1ZmZlcl9zaXplICAgICAgID0gc2V0dGluZ3NbICdiYXRjaCcgIF0gPyAxMDAwMFxuICBzb2xpZF9wcmVkaWNhdGVzICA9IHNldHRpbmdzWyAnc29saWRzJyBdID8gW11cbiAgc3Vic3RyYXRlICAgICAgICAgPSBkYlsgJyVzZWxmJyBdXG4gIFIgICAgICAgICAgICAgICAgID0gRC5jcmVhdGVfdGhyb3VnaHN0cmVhbSgpXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgaWYgYnVmZmVyX3NpemUgPCAwXG4gICAgdGhyb3cgbmV3IEVycm9yIFwiYnVmZmVyIHNpemUgbXVzdCBiZSBwb3NpdGl2ZSBpbnRlZ2VyLCBnb3QgI3tycHIgYnVmZmVyX3NpemV9XCJcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBlbHNlIGlmIGJ1ZmZlcl9zaXplIDwgMlxuICAgICR3cml0ZSA9ID0+XG4gICAgICByZXR1cm4gJCAoIGZhY2V0X2JmcnMsIHNlbmQsIGVuZCApID0+XG4gICAgICAgIGlmIGZhY2V0X2JmcnM/XG4gICAgICAgICAgc3Vic3RyYXRlLnB1dCBmYWNldF9iZnJzLi4uLCA9PlxuICAgICAgICAgICAgaWYgZW5kP1xuICAgICAgICAgICAgICBlbmQoKVxuICAgICAgICBlbHNlIGlmIGVuZD9cbiAgICAgICAgICBlbmQoKVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGVsc2VcbiAgICAkd3JpdGUgPSA9PlxuICAgICAgYnVmZmVyID0gW11cbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgZmx1c2ggPSAoIHNlbmQsIGVuZCApID0+XG4gICAgICAgIF9idWZmZXIgPSBidWZmZXJcbiAgICAgICAgYnVmZmVyICA9IFtdXG4gICAgICAgIHN1YnN0cmF0ZS5iYXRjaCBfYnVmZmVyLCAoIGVycm9yICkgPT5cbiAgICAgICAgICBzZW5kLmVycm9yIGVycm9yIGlmIGVycm9yP1xuICAgICAgICAgIGlmIGVuZD9cbiAgICAgICAgICAgIGVuZCgpXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHJldHVybiAkICggZmFjZXRfYmZycywgc2VuZCwgZW5kICkgPT5cbiAgICAgICAgaWYgZmFjZXRfYmZycz9cbiAgICAgICAgICBbIGtleV9iZnIsIHZhbHVlX2JmciwgXSA9IGZhY2V0X2JmcnNcbiAgICAgICAgICBidWZmZXIucHVzaCB7IHR5cGU6ICdwdXQnLCBrZXk6IGtleV9iZnIsIHZhbHVlOiB2YWx1ZV9iZnIsIH1cbiAgICAgICAgICBpZiBidWZmZXIubGVuZ3RoID49IGJ1ZmZlcl9zaXplXG4gICAgICAgICAgICBmbHVzaCBzZW5kLCBlbmRcbiAgICAgICAgZWxzZSBpZiBlbmQ/XG4gICAgICAgICAgaWYgYnVmZmVyLmxlbmd0aCA+IDBcbiAgICAgICAgICAgIGZsdXNoIHNlbmQsIGVuZFxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGVuZCgpXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgUlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgLnBpcGUgJCAoIHNwbywgc2VuZCApID0+XG4gICAgICAjIyMgQW5hbHl6ZSBTUE8ga2V5IGFuZCBzZW5kIGFsbCBuZWNlc3NhcnkgUE9TIGZhY2V0czogIyMjXG4gICAgICBbIHNiaiwgcHJkLCBvYmosIF0gPSBzcG9cbiAgICAgIHNlbmQgWyBbICdzcG8nLCBzYmosIHByZCwgXSwgb2JqLCBdXG4gICAgICBvYmpfdHlwZSA9IENORC50eXBlX29mIG9ialxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICB1bmxlc3Mgb2JqX3R5cGUgaXMgJ3BvZCdcbiAgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgICBpZiAoIG9ial90eXBlIGlzICdsaXN0JyApIGFuZCBub3QgKCBwcmQgaW4gc29saWRfcHJlZGljYXRlcyApXG4gICAgICAgICAgZm9yIG9ial9lbGVtZW50LCBvYmpfaWR4IGluIG9ialxuICAgICAgICAgICAgc2VuZCBbIFsgJ3BvcycsIHByZCwgb2JqX2VsZW1lbnQsIHNiaiwgb2JqX2lkeCwgXSwgXVxuICAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBzZW5kIFsgWyAncG9zJywgcHJkLCBvYmosIHNiaiwgXSwgXVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgLnBpcGUgJCAoIGZhY2V0LCBzZW5kICkgPT5cbiAgICAgICMjIyBFbmNvZGUgZmFjZXQ6ICMjI1xuICAgICAgWyBrZXksIHZhbHVlLCBdID0gZmFjZXRcbiAgICAgIGtleV9iZnIgICAgICAgICA9IEBfZW5jb2RlX2tleSBkYiwga2V5XG4gICAgICB2YWx1ZV9iZnIgICAgICAgPSBpZiB2YWx1ZT8gdGhlbiBAX2VuY29kZV92YWx1ZSBkYiwgdmFsdWUgZWxzZSBAX3plcm9fdmFsdWVfYmZyXG4gICAgICBzZW5kIFsga2V5X2JmciwgdmFsdWVfYmZyLCBdXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAucGlwZSAkd3JpdGUoKVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHJldHVybiBSXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AXyRzZW5kX2xhdGVyID0gLT5cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBSICAgICA9IEQuY3JlYXRlX3Rocm91Z2hzdHJlYW0oKVxuICBjb3VudCA9IDBcbiAgX2VuZCAgPSBudWxsXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzZW5kX2VuZCA9ID0+XG4gICAgaWYgX2VuZD8gYW5kIGNvdW50IDw9IDBcbiAgICAgIF9lbmQoKVxuICAgIGVsc2VcbiAgICAgIHNldEltbWVkaWF0ZSBzZW5kX2VuZFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgUlxuICAgIC5waXBlICQgKCBkYXRhLCBzZW5kLCBlbmQgKSA9PlxuICAgICAgaWYgZGF0YT9cbiAgICAgICAgY291bnQgKz0gKzFcbiAgICAgICAgc2V0SW1tZWRpYXRlID0+XG4gICAgICAgICAgY291bnQgKz0gLTFcbiAgICAgICAgICBzZW5kIGRhdGFcbiAgICAgICAgICBkZWJ1ZyAnwqlNeHlCaScsIGNvdW50XG4gICAgICBpZiBlbmQ/XG4gICAgICAgIF9lbmQgPSBlbmRcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHNlbmRfZW5kKClcbiAgcmV0dXJuIFJcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AXyRwdWxsID0gLT5cbiAgcXVldWUgICAgID0gW11cbiAgIyBfc2VuZCAgICAgPSBudWxsXG4gIGlzX2ZpcnN0ICA9IHllc1xuICBwdWxsID0gLT5cbiAgICBpZiBxdWV1ZS5sZW5ndGggPiAwXG4gICAgICByZXR1cm4gcXVldWUucG9wKClcbiAgICBlbHNlXG4gICAgICByZXR1cm4gWyAnZW1wdHknLCBdXG4gIHJldHVybiAkICggZGF0YSwgc2VuZCwgZW5kICkgPT5cbiAgICBpZiBpc19maXJzdFxuICAgICAgaXNfZmlyc3QgPSBub1xuICAgICAgc2VuZCBwdWxsXG4gICAgaWYgZGF0YT9cbiAgICAgIHF1ZXVlLnVuc2hpZnQgWyAnZGF0YScsIGRhdGEsIF1cbiAgICBpZiBlbmQ/XG4gICAgICBxdWV1ZS51bnNoaWZ0IFsgJ2VuZCcsIGVuZCwgXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfJHRha2UgPSAtPlxuICByZXR1cm4gJCAoIHB1bGwsIHNlbmQgKSA9PlxuICAgICMgZGVidWcgJ8KpdktrSmYnLCBwdWxsXG4gICAgIyBkZWJ1ZyAnwql2S2tKZicsIHB1bGwoKVxuICAgIHByb2Nlc3MgPSA9PlxuICAgICAgWyB0eXBlLCBkYXRhLCBdID0gcHVsbCgpXG4gICAgICAjIGRlYnVnICfCqWJhbU9CJywgWyB0eXBlLCBkYXRhLCBdXG4gICAgICBzd2l0Y2ggdHlwZVxuICAgICAgICB3aGVuICdkYXRhJyAgIHRoZW4gc2VuZCBkYXRhXG4gICAgICAgIHdoZW4gJ2VtcHR5JyAgdGhlbiBudWxsXG4gICAgICAgIHdoZW4gJ2VuZCcgICAgdGhlbiByZXR1cm4gc2VuZC5lbmQoKVxuICAgICAgICBlbHNlIHNlbmQuZXJyb3IgbmV3IEVycm9yIFwidW5rbm93biBldmVudCB0eXBlICN7cnByIHR5cGV9XCJcbiAgICAgIHNldEltbWVkaWF0ZSBwcm9jZXNzXG4gICAgcHJvY2VzcygpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF8kZW5zdXJlX3VuaXF1ZSA9ICggZGIgKSAtPlxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICMgYmxvb20gICA9IEJsb29tLmZvckNhcGFjaXR5IDFlNywgMC4xXG4gIGJsb29tICAgICA9IEJsb29tLmZvckNhcGFjaXR5IDFlMSwgMVxuICBycV9jb3VudCAgPSAwXG4gIHF1ZXVlICAgICA9IFtdXG4gIF9lbmQgICAgICA9IG51bGxcbiAgX3NlbmQgICAgID0gbnVsbFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHByb2Nlc3NfcXVldWUgPSA9PlxuICAgIGlmIF9lbmQ/IGFuZCBycV9jb3VudCA8IDEgYW5kIHF1ZXVlLmxlbmd0aCA8IDFcbiAgICAgIF9lbmQoKVxuICAgICAgcmV0dXJuXG4gICAgc2V0SW1tZWRpYXRlIHByb2Nlc3NfcXVldWVcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBSID0gRC5jcmVhdGVfdGhyb3VnaHN0cmVhbSgpXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAucGlwZSAkICggZmFjZXRfYmZycywgc2VuZCwgZW5kICkgLT5cbiAgICAgIF9zZW5kID0gc2VuZFxuICAgICAgaWYgZmFjZXRfYmZycz9cbiAgICAgICAgZGVidWcgJ8KpbnVTSWonLCBmYWNldF9iZnJzXG4gICAgICAgIHF1ZXVlLnVuc2hpZnQgZmFjZXRfYmZyc1xuICAgICAgaWYgZW5kP1xuICAgICAgICBfZW5kID0gZW5kXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcmV0dXJuIFJcblxuIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQF8kZW5zdXJlX3VuaXF1ZSA9ICggZGIgKSAtPlxuIyAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICAjIGJsb29tICAgPSBCbG9vbS5mb3JDYXBhY2l0eSAxZTcsIDAuMVxuIyAgIGJsb29tICAgICA9IEJsb29tLmZvckNhcGFjaXR5IDFlMSwgMVxuIyAgIHJxX2NvdW50ICA9IDBcbiMgICBidWZmZXIgICAgPSBbXVxuIyAgIF9lbmQgICAgICA9IG51bGxcbiMgICBfc2VuZCAgICAgPSBudWxsXG4jICAgUiAgICAgICAgID0gRC5jcmVhdGVfdGhyb3VnaHN0cmVhbSgpXG4jICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgIGZsdXNoID0gPT5cbiMgICAgIHJldHVybiBpZiBidWZmZXIubGVuZ3RoIGlzIDBcbiMgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgICBpZiBycV9jb3VudCA+IDBcbiMgICAgICAgc2V0SW1tZWRpYXRlIGZsdXNoXG4jICAgICAgIHJldHVybiBudWxsXG4jICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgICAgX3NlbmQgYnVmZmVyLnBvcCgpXG4jICAgICBzZXRJbW1lZGlhdGUgZmx1c2hcbiMgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgICByZXR1cm4gbnVsbFxuIyAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICBSXG4jICAgICAucGlwZSAkICggZmFjZXRfYmZycywgc2VuZCwgZW5kICkgPT5cbiMgICAgICAgX3NlbmQgPSBzZW5kXG4jICAgICAgIGlmIGZhY2V0X2JmcnM/XG4jICAgICAgICAgYnVmZmVyLnNwbGljZSAwLCAwLCBmYWNldF9iZnJzXG4jICAgICAgIGZsdXNoKClcbiMgICAgICAgaWYgZW5kP1xuIyAgICAgICAgIGZsdXNoKClcbiMgICAgIC5waXBlICQgKCBmYWNldF9iZnJzLCBzZW5kLCBlbmQgKSA9PlxuIyAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4sLFxuIyAgICAgICBpZiBmYWNldF9iZnJzP1xuIyAgICAgICAgIFsga2V5X2JmciwgXywgXSAgID0gZmFjZXRfYmZyc1xuIyAgICAgICAgIG1heV9iZV9rbm93bl9rZXkgID0gYmxvb20uaGFzIGtleV9iZnJcbiMgICAgICAgICBibG9vbS53cml0ZSBrZXlfYmZyXG4jICAgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgICAgICAgaWYgbWF5X2JlX2tub3duX2tleVxuIyAgICAgICAgICAgcnFfY291bnQgKz0gKzFcbiMgICAgICAgICAgIGRlYnVnICfCqVFTNmtGJywgJ21heV9iZV9rbm93bl9rZXknLCBycV9jb3VudCwgQF9kZWNvZGVfa2V5IGRiLCBrZXlfYmZyXG4jICAgICAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgICAgICAgICBkYlsgJyVzZWxmJyBdLmdldCBrZXlfYmZyLCAoIGVycm9yICkgPT5cbiMgICAgICAgICAgICAgcnFfY291bnQgKz0gLTFcbiMgICAgICAgICAgICAgZGVidWcgJ8KpUVM2a0YnLCAnbWF5X2JlX2tub3duX2tleScsIHJxX2NvdW50LCBfZW5kPywgQF9kZWNvZGVfa2V5IGRiLCBrZXlfYmZyXG4jICAgICAgICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgICAgICAgICAgIGlmIGVycm9yP1xuIyAgICAgICAgICAgICAgIGlmIGVycm9yWyAndHlwZScgXSBpcyAnTm90Rm91bmRFcnJvcidcbiMgICAgICAgICAgICAgICAgIHVyZ2UgJ8KpOWQwVXEnLCAnc2VuZGluZycsIEBfZGVjb2RlX2tleSBkYiwga2V5X2JmclxuIyAgICAgICAgICAgICAgICAgc2VuZCBmYWNldF9iZnJzXG4jICAgICAgICAgICAgICAgZWxzZVxuIyAgICAgICAgICAgICAgICAgc2VuZC5lcnJvciBlcnJvclxuIyAgICAgICAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgICAgICAgICAgICBlbHNlXG4jICAgICAgICAgICAgICAgc2VuZC5lcnJvciBuZXcgRXJyb3IgXCJrZXkgYWxyZWFkeSBpbiBEQjogI3tycHIgQF9kZWNvZGVfa2V5IGRiLCBrZXlfYmZyfVwiXG4jICAgICAgICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgICAgICAgICAgIGlmIHJxX2NvdW50IDw9IDAgYW5kIF9lbmQ/XG4jICAgICAgICAgICAgICAgIyB3YXJuICfCqUpPUUxiLTEnLCAnZW5kJ1xuIyAgICAgICAgICAgICAgIGJsb29tLmVuZCgpXG4jICAgICAgICAgICAgICAgIyBfZW5kKClcbiMgICAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICAgICAgICBlbHNlXG4jICAgICAgICAgICBzZW5kIGZhY2V0X2JmcnNcbiMgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLCxcbiMgICAgICAgaWYgZW5kP1xuIyAgICAgICAgICMjIyBUQUlOVCBzaG91bGQgd3JpdGUgYmxvb20uZXhwb3J0IHRvIERCICMjI1xuIyAgICAgICAgIGRlYnVnICfCqWRKY2JrJywgYnVmZmVyXG4jICAgICAgICAgaWYgcnFfY291bnQgPiAwXG4jICAgICAgICAgICBfZW5kID0gZW5kXG4jICAgICAgICAgZWxzZVxuIyAgICAgICAgICAgd2FybiAnwqlKT1FMYi0yJywgJ2VuZCdcbiMgICAgICAgICAgIGJsb29tLmVuZCgpXG4jICAgICAgICAgICBlbmQoKVxuIyAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICByZXR1cm4gUlxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgUkVBRElOR1xuIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQGNyZWF0ZV9rZXlzdHJlYW0gPSAoIGRiLCBsb19oaW50ID0gbnVsbCwgaGlfaGludCA9IG51bGwgKSAtPlxuIyAgICMjIyBUQUlOVCBjb2RlIGR1cGxpY2F0aW9uICMjI1xuIyAgIGlmIGxvX2hpbnQ/XG4jICAgICBpZiBoaV9oaW50P1xuIyAgICAgICBxdWVyeSA9IHsgZ3RlOiBsb19oaW50LCBsdGU6aGlfaGludCwgfVxuIyAgICAgZWxzZVxuIyAgICAgICBxdWVyeSA9IHsgZ3RlOiBsb19oaW50LCB9XG4jICAgZWxzZSBpZiBoaV9oaW50P1xuIyAgICAgcXVlcnkgPSB7IGx0ZTogaGlfaGludCwgfVxuIyAgIGVsc2VcbiMgICAgIHF1ZXJ5ID0gbnVsbFxuIyAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICBkZWJ1ZyAnwqk4MzVKUCcsIHF1ZXJ5XG4jICAgUiA9IGlmIHF1ZXJ5PyB0aGVuICggZGJbICclc2VsZicgXS5jcmVhdGVLZXlTdHJlYW0gcXVlcnkgKSBlbHNlIGRiWyAnJXNlbGYnIF0uY3JlYXRlS2V5U3RyZWFtKClcbiMgICAjIFIgPSBkYlsgJyVzZWxmJyBdLmNyZWF0ZUtleVN0cmVhbSBAbmV3X3F1ZXJ5IGRiLCBxdWVyeVxuIyAgICMjIyBUQUlOVCBTaG91bGQgd2UgdGVzdCBmb3Igd2VsbC1mb3JtZWQgZW50cmllcyBoZXJlPyAjIyNcbiMgICBSID0gUi5waXBlICQgKCBia2V5LCBzZW5kICkgPT4gc2VuZCBAX2RlY29kZV9rZXkgZGIsIGJrZXlcbiMgICByZXR1cm4gUlxuXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQGNyZWF0ZV9waHJhc2VzdHJlYW0gPSAoIGRiLCBsb19oaW50ID0gbnVsbCwgaGlfaGludCA9IG51bGwsIHNldHRpbmdzICkgLT5cbiAgaW5wdXQgPSBAY3JlYXRlX2ZhY2V0c3RyZWFtIGRiLCBsb19oaW50LCBoaV9oaW50LCBzZXR0aW5nc1xuICBSID0gaW5wdXRcbiAgICAucGlwZSBAJGFzX3BocmFzZSBkYlxuICBSWyAnJW1ldGEnIF0gPSBpbnB1dFsgJyVtZXRhJyBdXG4gIHJldHVybiBSXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQGNyZWF0ZV9mYWNldHN0cmVhbSA9ICggZGIsIGxvX2hpbnQgPSBudWxsLCBoaV9oaW50ID0gbnVsbCwgc2V0dGluZ3MgKSAtPlxuICAjIyNcbiAgKiBJZiBuZWl0ZXIgYGxvYCBub3IgYGhpYCBpcyBnaXZlbiwgdGhlIHN0cmVhbSB3aWxsIGl0ZXJhdGUgb3ZlciBhbGwgZW50cmllcy5cbiAgKiBJZiBib3RoIGBsb2AgYW5kIGBoaWAgYXJlIGdpdmVuLCBhIHF1ZXJ5IHdpdGggbG93ZXIgYW5kIHVwcGVyLCBpbmNsdXNpdmUgYm91bmRhcmllcyBpc1xuICAgIGlzc3VlZC5cbiAgKiBJZiBvbmx5IGBsb2AgaXMgZ2l2ZW4sIGEgcHJlZml4IHF1ZXJ5IGlzIGlzc3VlZC5cbiAgKiBJZiBgaGlgIGlzIGdpdmVuIGJ1dCBgbG9gIGlzIG1pc3NpbmcsIGFuIGVycm9yIGlzIGlzc3VlZC5cbiAgIyMjXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgaWYgaGlfaGludD8gYW5kIG5vdCBsb19oaW50P1xuICAgIHRocm93IG5ldyBFcnJvciBcIm11c3QgZ2l2ZSBgbG9faGludGAgd2hlbiBgaGlfaGludGAgaXMgZ2l2ZW5cIlxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGlmIGxvX2hpbnQ/IGFuZCBub3QgaGlfaGludD9cbiAgICBxdWVyeSAgICAgICA9IEBfcXVlcnlfZnJvbV9wcmVmaXggZGIsIGxvX2hpbnRcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBlbHNlIGlmIGxvX2hpbnQ/IGFuZCBoaV9oaW50IGlzICcqJ1xuICAgIHF1ZXJ5ICAgICAgID0gQF9xdWVyeV9mcm9tX3ByZWZpeCBkYiwgbG9faGludCwgJyonXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZWxzZVxuICAgIGxvX2hpbnRfYmZyID0gaWYgbG9faGludD8gdGhlbiAoICAgICAgICBAX2VuY29kZV9rZXkgZGIsIGxvX2hpbnQgKSAgICAgICAgICBlbHNlIG51bGxcbiAgICBoaV9oaW50X2JmciA9IGlmIGhpX2hpbnQ/IHRoZW4gKCBAX3F1ZXJ5X2Zyb21fcHJlZml4IGRiLCBoaV9oaW50IClbICdsdGUnIF0gZWxzZSBudWxsXG4gICAgIyBsb19oaW50X2JmciA9IGlmIGxvX2hpbnQ/IHRoZW4gKCAgICAgICAgQF9lbmNvZGVfa2V5IGRiLCBsb19oaW50ICkgICAgICAgICAgZWxzZSBDT0RFQ1sgJ2tleXMnIF1bICdsbycgXVxuICAgICMgaGlfaGludF9iZnIgPSBpZiBoaV9oaW50PyB0aGVuICggQF9xdWVyeV9mcm9tX3ByZWZpeCBkYiwgaGlfaGludCApWyAnbHRlJyBdIGVsc2UgQ09ERUNbICdrZXlzJyBdWyAnaGknIF1cbiAgICBxdWVyeSAgICAgICA9IHsgZ3RlOiBsb19oaW50X2JmciwgbHRlOiBoaV9oaW50X2JmciwgfVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICMjIyBUQUlOVCBTaG91bGQgd2UgdGVzdCBmb3Igd2VsbC1mb3JtZWQgZW50cmllcyBoZXJlPyAjIyNcbiAgUiA9IGRiWyAnJXNlbGYnIF0uY3JlYXRlUmVhZFN0cmVhbSBxdWVyeVxuICBSID0gUi5waXBlICQgKCB7IGtleSwgdmFsdWUgfSwgc2VuZCApID0+IHNlbmQgWyAoIEBfZGVjb2RlX2tleSBkYiwga2V5ICksICggQF9kZWNvZGVfdmFsdWUgZGIsIHZhbHVlICksIF1cbiAgUlsgJyVtZXRhJyBdID0ge31cbiAgUlsgJyVtZXRhJyBdWyAncXVlcnknIF0gPSBxdWVyeVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHJldHVybiBSXG5cbiMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEByZWFkX21hbnkgPSAoIGRiLCBoaW50ID0gbnVsbCApIC0+XG4jICAgIyMjIEhpbnRzIGFyZSBpbnRlcnByZXRlZCBhcyBwYXJ0aWFsIHNlY29uZGFyeSAoUE9TKSBrZXlzLiAjIyNcblxuIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQF9yZWFkX29uZSA9ICggZGIsIGtleSwgZmFsbGJhY2sgPSBAX21pc2ZpdCwgaGFuZGxlciApIC0+XG4jICAgc3dpdGNoIGFyaXR5ID0gYXJndW1lbnRzLmxlbmd0aFxuIyAgICAgd2hlbiAzXG4jICAgICAgIGhhbmRsZXIgICA9IGZhbGxiYWNrXG4jICAgICAgIGZhbGxiYWNrICA9IEBfbWlzZml0XG4jICAgICB3aGVuIDQgdGhlbiBudWxsXG4jICAgICBlbHNlIHRocm93IG5ldyBFcnJvciBcImV4cGVjdGVkIDMgb3IgNCBhcmd1bWVudHMsIGdvdCAje2FyaXR5fVwiXG4jICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgIGRiWyAnJXNlbGYnIF0uZ2V0IGtleSwgaGFuZGxlclxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkByZWFkX3N1YiA9ICggZGIsIHNldHRpbmdzLCByZWFkICkgLT5cbiAgc3dpdGNoIGFyaXR5ID0gYXJndW1lbnRzLmxlbmd0aFxuICAgIHdoZW4gMlxuICAgICAgcmVhZCAgICAgID0gc2V0dGluZ3NcbiAgICAgIHNldHRpbmdzICA9IG51bGxcbiAgICB3aGVuIDNcbiAgICAgIG51bGxcbiAgICBlbHNlXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJleHBlY3RlZCAyIG9yIDMgYXJndW1lbnRzLCBnb3QgI3thcml0eX1cIlxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGluZGV4ZWQgICAgICAgICAgID0gc2V0dGluZ3M/WyAnaW5kZXhlZCcgICAgXSA/IG5vXG4gICMgdHJhbnNmb3JtICAgICAgICAgPSBzZXR0aW5ncz9bICd0cmFuc2Zvcm0nICBdID8gRC4kcGFzc190aHJvdWdoKClcbiAgbWFuZ2xlICAgICAgICAgICAgPSBzZXR0aW5ncz9bICdtYW5nbGUnICAgICBdID8gKCBkYXRhICkgLT4gZGF0YVxuICBzZW5kX2VtcHR5ICAgICAgICA9IHNldHRpbmdzP1sgJ2VtcHR5JyAgICAgIF0gPyBub1xuICBpbnNlcnRfaW5kZXggICAgICA9IGlmIGluZGV4ZWQgdGhlbiBELm5ld19pbmRleGVyKCkgZWxzZSAoIHggKSAtPiB4XG4gIG9wZW5fc3RyZWFtX2NvdW50ID0gMFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHJldHVybiAkICggb3V0ZXJfZGF0YSwgb3V0ZXJfc2VuZCwgb3V0ZXJfZW5kICkgPT5cbiAgICBjb3VudCA9IDBcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGlmIG91dGVyX2RhdGE/XG4gICAgICBvcGVuX3N0cmVhbV9jb3VudCAgICArPSArMVxuICAgICAgc3ViX2lucHV0ICAgICAgICAgICAgID0gcmVhZCBvdXRlcl9kYXRhXG4gICAgICBbIG1lbW8sIHN1Yl9pbnB1dCwgXSAgPSBpZiBDTkQuaXNhX2xpc3Qgc3ViX2lucHV0IHRoZW4gc3ViX2lucHV0IGVsc2UgWyBAX21pc2ZpdCwgc3ViX2lucHV0LCBdXG4gICAgICBzdWJfaW5wdXRcbiAgICAgICAgIyAucGlwZSB0cmFuc2Zvcm1cbiAgICAgICAgLnBpcGUgZG8gPT5cbiAgICAgICAgICAjIyMgVEFJTlQgbm8gbmVlZCB0byBidWlsZCBidWZmZXIgaWYgbm90IGBzZW5kX2VtcHR5YCBhbmQgdGhlcmUgYXJlIG5vIHJlc3VsdHMgIyMjXG4gICAgICAgICAgYnVmZmVyID0gaWYgbWVtbyBpcyBAX21pc2ZpdCB0aGVuIFtdIGVsc2UgWyBtZW1vLCBdXG4gICAgICAgICAgcmV0dXJuICQgKCBpbm5lcl9kYXRhLCBfLCBpbm5lcl9lbmQgKSA9PlxuICAgICAgICAgICAgaWYgaW5uZXJfZGF0YT9cbiAgICAgICAgICAgICAgaW5uZXJfZGF0YSA9IG1hbmdsZSBpbm5lcl9kYXRhXG4gICAgICAgICAgICAgIGlmIGlubmVyX2RhdGE/XG4gICAgICAgICAgICAgICAgY291bnQgKz0gKzFcbiAgICAgICAgICAgICAgICBidWZmZXIucHVzaCBpbm5lcl9kYXRhXG4gICAgICAgICAgICBpZiBpbm5lcl9lbmQ/XG4gICAgICAgICAgICAgIGlmIHNlbmRfZW1wdHkgb3IgY291bnQgPiAwXG4gICAgICAgICAgICAgICAgb3V0ZXJfc2VuZCBpbnNlcnRfaW5kZXggYnVmZmVyXG4gICAgICAgICAgICAgIG9wZW5fc3RyZWFtX2NvdW50ICs9IC0xXG4gICAgICAgICAgICAgIGlubmVyX2VuZCgpXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpZiBvdXRlcl9lbmQ/XG4gICAgICByZXBlYXRfaW1tZWRpYXRlbHkgLT5cbiAgICAgICAgcmV0dXJuIHRydWUgdW5sZXNzIG9wZW5fc3RyZWFtX2NvdW50IGlzIDBcbiAgICAgICAgb3V0ZXJfZW5kKClcbiAgICAgICAgcmV0dXJuIGZhbHNlXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIEtFWVMgJiBWQUxVRVNcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9lbmNvZGVfa2V5ID0gKCBkYiwga2V5LCBleHRyYV9ieXRlICkgLT5cbiAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBrZXkgI3tycHIga2V5fVwiIGlmIGtleSBpcyB1bmRlZmluZWRcbiAgcmV0dXJuIF9jb2RlY19lbmNvZGUga2V5LCBleHRyYV9ieXRlXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9kZWNvZGVfa2V5ID0gKCBkYiwga2V5ICkgLT5cbiAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBrZXkgI3tycHIga2V5fVwiIGlmICggUiA9IF9jb2RlY19kZWNvZGUga2V5ICkgaXMgdW5kZWZpbmVkXG4gIHJldHVybiBSXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9lbmNvZGVfdmFsdWUgPSAoIGRiLCB2YWx1ZSAgICAgICkgLT4gbmV3IEJ1ZmZlciAoIEpTT04uc3RyaW5naWZ5IHZhbHVlICksICd1dGYtOCdcbkBfZGVjb2RlX3ZhbHVlID0gKCBkYiwgdmFsdWVfYmZyICApIC0+IEpTT04ucGFyc2UgdmFsdWVfYmZyLnRvU3RyaW5nICd1dGYtOCdcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIyMgTkIgQXJndW1lbnQgb3JkZXJpbmcgZm9yIHRoZXNlIGZ1bmN0aW9uIGlzIGFsd2F5cyBzdWJqZWN0IGJlZm9yZSBvYmplY3QsIHJlZ2FyZGxlc3Mgb2YgdGhlIHBocmFzZXR5cGVcbmFuZCB0aGUgb3JkZXJpbmcgaW4gdGhlIHJlc3VsdGluZyBrZXkuICMjI1xuQG5ld19rZXkgPSAoIGRiLCBwaHJhc2V0eXBlLCBzaywgc3YsIG9rLCBvdiwgaWR4ICkgLT5cbiAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBwaHJhc2V0eXBlOiAje3JwciBwaHJhc2V0eXBlfVwiIHVubGVzcyBwaHJhc2V0eXBlIGluIFsgJ3NvJywgJ29zJywgXVxuICBbIHNrLCBzdiwgb2ssIG92LCBdID0gWyBvaywgb3YsIHNrLCBzdiwgXSBpZiBwaHJhc2V0eXBlIGlzICdvcydcbiAgcmV0dXJuIFsgcGhyYXNldHlwZSwgc2ssIHN2LCBvaywgb3YsICggaWR4ID8gMCApLCBdXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQG5ld19zb19rZXkgPSAoIGRiLCBQLi4uICkgLT4gQG5ld19rZXkgZGIsICdzbycsIFAuLi5cbkBuZXdfb3Nfa2V5ID0gKCBkYiwgUC4uLiApIC0+IEBuZXdfa2V5IGRiLCAnb3MnLCBQLi4uXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9uZXdfb3Nfa2V5X2Zyb21fc29fa2V5ID0gKCBkYiwgc29fa2V5ICkgLT5cbiAgWyBwaHJhc2V0eXBlLCBzaywgc3YsIG9rLCBvdiwgaWR4LCBdID0gQGFzX3BocmFzZSBkYiwgc29fa2V5XG4gIHRocm93IG5ldyBFcnJvciBcImV4cGVjdGVkIHBocmFzZXR5cGUgJ3NvJywgZ290ICN7cnByIHBocmFzZXR5cGV9XCIgdW5sZXNzIHBocmFzZXR5cGUgaXMgJ3NvJ1xuICByZXR1cm4gWyAnb3MnLCBvaywgb3YsIHNrLCBzdiwgaWR4LCBdXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQG5ld19rZXlzID0gKCBkYiwgcGhyYXNldHlwZSwgc2ssIHN2LCBvaywgb3YsIGlkeCApIC0+XG4gIG90aGVyX3BocmFzZXR5cGUgID0gaWYgcGhyYXNldHlwZSBpcyAnc28nIHRoZW4gJ29zJyBlbHNlICdzbydcbiAgcmV0dXJuIFtcbiAgICAoIEBuZXdfa2V5IGRiLCAgICAgICBwaHJhc2V0eXBlLCBzaywgc3YsIG9rLCBvdiwgaWR4ICksXG4gICAgKCBAbmV3X2tleSBkYiwgb3RoZXJfcGhyYXNldHlwZSwgc2ssIHN2LCBvaywgb3YsIGlkeCApLCBdXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQGFzX3BocmFzZSA9ICggZGIsIGtleSwgdmFsdWUsIG5vcm1hbGl6ZSA9IHllcyApIC0+XG4gIHN3aXRjaCBwaHJhc2V0eXBlID0ga2V5WyAwIF1cbiAgICB3aGVuICdzcG8nXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIFNQTyBrZXkgKGxlbmd0aCAje2xlbmd0aH0pXCIgdW5sZXNzICggbGVuZ3RoID0ga2V5Lmxlbmd0aCApIGlzIDNcbiAgICAgIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgdmFsdWUgKDEpICN7cnByIHZhbHVlfVwiIGlmIHZhbHVlIGluIFsgdW5kZWZpbmVkLCBdXG4gICAgICByZXR1cm4gWyBwaHJhc2V0eXBlLCBrZXlbIDEgXSwga2V5WyAyIF0sIHZhbHVlLCBdXG4gICAgd2hlbiAncG9zJ1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBQT1Mga2V5IChsZW5ndGggI3tsZW5ndGh9KVwiIHVubGVzcyA0IDw9ICggbGVuZ3RoID0ga2V5Lmxlbmd0aCApIDw9IDVcbiAgICAgIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgdmFsdWUgKDIpICN7cnByIHZhbHVlfVwiIGlmIG5vdCAoIHZhbHVlIGluIFsgbnVsbCwgXSApXG4gICAgICByZXR1cm4gWyBwaHJhc2V0eXBlLCBrZXlbIDMgXSwga2V5WyAxIF0sIGtleVsgMiBdLCBrZXlbIDQgXSwgXSBpZiBrZXlbIDQgXT9cbiAgICAgIHJldHVybiBbIHBocmFzZXR5cGUsIGtleVsgMyBdLCBrZXlbIDEgXSwga2V5WyAyIF0sIF1cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AJGFzX3BocmFzZSA9ICggZGIgKSAtPlxuICByZXR1cm4gJCAoIGRhdGEsIHNlbmQgKSA9PlxuICAgIHNlbmQgQGFzX3BocmFzZSBkYiwgZGF0YS4uLlxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBrZXlfZnJvbV91cmwgPSAoIGRiLCB1cmwgKSAtPlxuICAjIyMgVEFJTiBkb2VzIG5vdCB1bmVzY2FwZSBhcyB5ZXQgIyMjXG4gICMjIyBUQUlOIGRvZXMgbm90IGNhc3QgdmFsdWVzIGFzIHlldCAjIyNcbiAgIyMjIFRBSU5UIGRvZXMgbm90IHN1cHBvcnQgbXVsdGlwbGUgaW5kZXhlcyBhcyB5ZXQgIyMjXG4gIFsgcGhyYXNldHlwZSwgZmlyc3QsIHNlY29uZCwgaWR4LCBdID0gdXJsLnNwbGl0ICd8J1xuICB1bmxlc3MgcGhyYXNldHlwZT8gYW5kIHBocmFzZXR5cGUubGVuZ3RoID4gMCBhbmQgcGhyYXNldHlwZSBpbiBbICdzbycsICdvcycsIF1cbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIFVSTCBrZXkgI3tycHIgdXJsfVwiXG4gIHVubGVzcyBmaXJzdD8gYW5kIGZpcnN0Lmxlbmd0aCA+IDAgYW5kIHNlY29uZD8gYW5kIHNlY29uZC5sZW5ndGggPiAwXG4gICAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBVUkwga2V5ICN7cnByIHVybH1cIlxuICBpZHggPSBpZiAoIGlkeD8gYW5kIGlkeC5sZW5ndGggPiAwICkgdGhlbiAoIHBhcnNlSW50IGlkeCwgMTAgKSBlbHNlIDBcbiAgWyBzaywgc3YsIF0gPSAgZmlyc3Quc3BsaXQgJzonXG4gIFsgb2ssIG92LCBdID0gc2Vjb25kLnNwbGl0ICc6J1xuICB1bmxlc3Mgc2s/IGFuZCBzay5sZW5ndGggPiAwIGFuZCBvaz8gYW5kIG9rLmxlbmd0aCA+IDBcbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIFVSTCBrZXkgI3tycHIgdXJsfVwiXG4gIFsgc2ssIHN2LCBvaywgb3YsIF0gPSBbIG9rLCBvdiwgc2ssIHN2LCBdIGlmIHBocmFzZXR5cGUgaXMgJ29zJ1xuICByZXR1cm4gWyBwaHJhc2V0eXBlLCBzaywgc3YsIG9rLCBvdiwgaWR4LCBdXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQHVybF9mcm9tX2tleSA9ICggZGIsIGtleSApIC0+XG4gIGlmICggQF90eXBlX2Zyb21fa2V5IGRiLCBrZXkgKSBpcyAnbGlzdCdcbiAgICBbIHBocmFzZXR5cGUsIHRhaWwuLi4sIF0gPSBrZXlcbiAgICBpZiBwaHJhc2V0eXBlIGlzICdzcG8nXG4gICAgICBbIHNiaiwgcHJkLCBdID0gdGFpbFxuICAgICAgcmV0dXJuIFwic3BvfCN7c2JqfXwje3ByZH18XCJcbiAgICBlbHNlXG4gICAgICBbIHByZCwgb2JqLCBzYmosIGlkeCwgXSA9IHRhaWxcbiAgICAgIGlkeF9ycHIgPSBpZiBpZHg/IHRoZW4gcnByIGlkeCBlbHNlICcnXG4gICAgICByZXR1cm4gXCJwb3N8I3twcmR9OiN7b2JqfXwje3Nian18I3tpZHhfcnByfVwiXG4gIHJldHVybiBcIiN7cnByIGtleX1cIlxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkAkdXJsX2Zyb21fa2V5ID0gKCBkYiApIC0+ICQgKCBrZXksIHNlbmQgKSA9PiBzZW5kIEB1cmxfZnJvbV9rZXkgZGIsIGtleVxuQCRrZXlfZnJvbV91cmwgPSAoIGRiICkgLT4gJCAoIHVybCwgc2VuZCApID0+IHNlbmQgQGtleV9mcm9tX3VybCBkYiwga2V5XG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF90eXBlX2Zyb21fa2V5ID0gKCBkYiwga2V5ICkgLT5cbiAgaWYgQXJyYXkuaXNBcnJheSBrZXlcbiAgICAjIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwga2V5OiAje3JwciBrZXl9XCIgdW5sZXNzIGtleS5sZW5ndGggaXMgNlxuICAgIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgcGhyYXNldHlwZTogI3tycHIga2V5fVwiIHVubGVzcyBrZXlbICcwJyBdIGluIEBwaHJhc2V0eXBlc1xuICAgIHJldHVybiAnbGlzdCdcbiAgcmV0dXJuICdvdGhlcidcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgUFJFRklYRVMgJiBRVUVSSUVTXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfcXVlcnlfZnJvbV9wcmVmaXggPSAoIGRiLCBsb19oaW50LCBzdGFyICkgLT5cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBpZiBzdGFyP1xuICAgICMjIyAnQXN0ZXJpc2snIGVuY29kaW5nOiBwYXJ0aWFsIGtleSBzZWdtZW50cyBtYXRjaCAjIyNcbiAgICBndGUgICA9IEBfZW5jb2RlX2tleSBkYiwgbG9faGludFxuICAgIGx0ZSAgID0gQF9lbmNvZGVfa2V5IGRiLCBsb19oaW50XG4gICAgbHRlWyBsdGUubGVuZ3RoIC0gMSBdID0gQ09ERUNbICd0eXBlbWFya2VycycgIF1bICdoaScgXVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGVsc2VcbiAgICAjIyMgJ0NsYXNzaWNhbCcgZW5jb2Rpbmc6IG9ubHkgZnVsbCBrZXkgc2VnbWVudHMgbWF0Y2ggIyMjXG4gICAgYmFzZSAgPSBAX2VuY29kZV9rZXkgZGIsIGxvX2hpbnQsIENPREVDWyAndHlwZW1hcmtlcnMnICBdWyAnaGknIF1cbiAgICBndGUgICA9IGJhc2Uuc2xpY2UgMCwgYmFzZS5sZW5ndGggLSAxXG4gICAgbHRlICAgPSBiYXNlLnNsaWNlIDAsIGJhc2UubGVuZ3RoXG4gIHJldHVybiB7IGd0ZSwgbHRlLCB9XG5cblxuXG5cblxuIl19