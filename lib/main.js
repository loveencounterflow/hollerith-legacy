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
        whisper("erased and re-opened LevelDB at " + route);
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
            debug('©nZTZt', "flushing " + _buffer.length);
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
                return setImmediate(end);
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
    })(this))).pipe($(function(data, send, end) {
      if (data != null) {
        send(data);
      }
      if (end != null) {
        debug('©CooNp', 'detected end');
        return end();
      }
    })).pipe($write());
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

//# sourceMappingURL=data:application/json;base64,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QUEiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIlxuXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuIyBuanNfdXRpbCAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAndXRpbCdcbiMgbmpzX3BhdGggICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ3BhdGgnXG4jIG5qc19mcyAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdmcydcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuQ05EICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2NuZCdcbnJwciAgICAgICAgICAgICAgICAgICAgICAgPSBDTkQucnByXG5iYWRnZSAgICAgICAgICAgICAgICAgICAgID0gJ0hPTExFUklUSC9tYWluJ1xubG9nICAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdwbGFpbicsICAgICBiYWRnZVxuZGVidWcgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdkZWJ1ZycsICAgICBiYWRnZVxud2FybiAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICd3YXJuJywgICAgICBiYWRnZVxuaGVscCAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdoZWxwJywgICAgICBiYWRnZVxudXJnZSAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICd1cmdlJywgICAgICBiYWRnZVxud2hpc3BlciAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICd3aGlzcGVyJywgICBiYWRnZVxuZWNobyAgICAgICAgICAgICAgICAgICAgICA9IENORC5lY2hvLmJpbmQgQ05EXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnN1c3BlbmQgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdjb2ZmZWVub2RlLXN1c3BlbmQnXG5zdGVwICAgICAgICAgICAgICAgICAgICAgID0gc3VzcGVuZC5zdGVwXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkNPREVDICAgICAgICAgICAgICAgICAgICAgPSBAQ09ERUMgPSByZXF1aXJlICcuL2NvZGVjJ1xuRFVNUCAgICAgICAgICAgICAgICAgICAgICA9IEBEVU1QICA9IHJlcXVpcmUgJy4vZHVtcCdcbl9jb2RlY19lbmNvZGUgICAgICAgICAgICAgPSBDT0RFQy5lbmNvZGUuYmluZCBDT0RFQ1xuX2NvZGVjX2RlY29kZSAgICAgICAgICAgICA9IENPREVDLmRlY29kZS5iaW5kIENPREVDXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkQgICAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdwaXBlZHJlYW1zMidcbiQgICAgICAgICAgICAgICAgICAgICAgICAgPSBELnJlbWl0LmJpbmQgRFxuX25ld19sZXZlbF9kYiAgICAgICAgICAgICA9IHJlcXVpcmUgJ2xldmVsJ1xubGV2ZWxkb3duICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2xldmVsL25vZGVfbW9kdWxlcy9sZXZlbGRvd24nXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnN1c3BlbmQgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdjb2ZmZWVub2RlLXN1c3BlbmQnXG5zdGVwICAgICAgICAgICAgICAgICAgICAgID0gc3VzcGVuZC5zdGVwXG5yZXBlYXRfaW1tZWRpYXRlbHkgICAgICAgID0gc3VzcGVuZC5yZXBlYXRfaW1tZWRpYXRlbHlcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuTE9EQVNIICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2xvZGFzaCdcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyMjIGh0dHBzOi8vZ2l0aHViLmNvbS9iM25qNG0vYmxvb20tc3RyZWFtICMjI1xuQmxvb20gICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2Jsb29tLXN0cmVhbSdcblxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBwaHJhc2V0eXBlcyAgICAgID0gWyAncG9zJywgJ3NwbycsIF1cbkBfbWlzZml0ICAgICAgICAgID0gU3ltYm9sICdtaXNmaXQnXG5AX3plcm9fdmFsdWVfYmZyICA9IG5ldyBCdWZmZXIgJ251bGwnXG4jIHdhcm4gXCJtaW5kIGluY29uc2lzdGVuY2llcyBpbiBIT0xMRVJJVEgyL21haW4gQF96ZXJvX2VuYyBldGNcIlxuIyBAX3plcm8gICAgICAgICAgICA9IHRydWUgIyA/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/P1xuIyBAX3plcm9fZW5jICAgICAgICA9IF9jb2RlY19lbmNvZGUgWyBAX3plcm8sICAgIF1cbiMgQF9sb19lbmMgICAgICAgICAgPSBfY29kZWNfZW5jb2RlIFsgbnVsbCwgICAgICBdXG4jIEBfaGlfZW5jICAgICAgICAgID0gX2NvZGVjX2VuY29kZSBbIENPREVDLiwgXVxuIyBAX2xhc3Rfb2N0ZXQgICAgICA9IG5ldyBCdWZmZXIgWyAweGZmLCBdXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQG5ld19kYiA9ICggcm91dGUgKSAtPlxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGxldmVsX3NldHRpbmdzID1cbiAgICAna2V5RW5jb2RpbmcnOiAgICAgICAgICAnYmluYXJ5J1xuICAgICd2YWx1ZUVuY29kaW5nJzogICAgICAgICdiaW5hcnknXG4gICAgJ2NyZWF0ZUlmTWlzc2luZyc6ICAgICAgeWVzXG4gICAgJ2Vycm9ySWZFeGlzdHMnOiAgICAgICAgbm9cbiAgICAnY29tcHJlc3Npb24nOiAgICAgICAgICB5ZXNcbiAgICAnc3luYyc6ICAgICAgICAgICAgICAgICBub1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHN1YnN0cmF0ZSAgICAgICAgICAgPSBfbmV3X2xldmVsX2RiIHJvdXRlLCBsZXZlbF9zZXR0aW5nc1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIFIgPVxuICAgICd+aXNhJzogICAgICAgICAgICdIT0xMRVJJVEgvZGInXG4gICAgJyVzZWxmJzogICAgICAgICAgc3Vic3RyYXRlXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcmV0dXJuIFJcblxuIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQF9yZW9wZW4gPSAoIGRiLCBoYW5kbGVyICkgLT5cbiMgICBzdGVwICggcmVzdW1lICkgPT5cbiMgICAgIHJvdXRlID0gZGJbICclc2VsZicgXVsgJ2xvY2F0aW9uJyBdXG4jICAgICB5aWVsZCBkYlsgJyVzZWxmJyBdLmNsb3NlIHJlc3VtZVxuIyAgICAgeWllbGQgZGJbICclc2VsZicgXS5vcGVuIHJlc3VtZVxuIyAgICAgd2hpc3BlciBcInJlLW9wZW5lZCBMZXZlbERCIGF0ICN7cm91dGV9XCJcbiMgICAgIGhhbmRsZXIgbnVsbFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBjbGVhciA9ICggZGIsIGhhbmRsZXIgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICByb3V0ZSA9IGRiWyAnJXNlbGYnIF1bICdsb2NhdGlvbicgXVxuICAgIHdoaXNwZXIgXCJjbG9zaW5nIERCXCJcbiAgICB5aWVsZCBkYlsgJyVzZWxmJyBdLmNsb3NlIHJlc3VtZVxuICAgICMgd2hpc3BlciBcImVyYXNpbmcgREJcIlxuICAgIHlpZWxkIGxldmVsZG93bi5kZXN0cm95IHJvdXRlLCByZXN1bWVcbiAgICAjIHdoaXNwZXIgXCJyZS1vcGVuaW5nIERCXCJcbiAgICB5aWVsZCBkYlsgJyVzZWxmJyBdLm9wZW4gcmVzdW1lXG4gICAgd2hpc3BlciBcImVyYXNlZCBhbmQgcmUtb3BlbmVkIExldmVsREIgYXQgI3tyb3V0ZX1cIlxuICAgIGhhbmRsZXIgbnVsbFxuXG4jICM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyAjIFdSSVRJTkdcbiMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEAkd3JpdGUgPSAoIGRiLCBzZXR0aW5ncyApIC0+XG4jICAgIyMjIEV4cGVjdHMgYSBIb2xsZXJpdGggREIgb2JqZWN0IGFuZCBhbiBvcHRpb25hbCBidWZmZXIgc2l6ZTsgcmV0dXJucyBhIHN0cmVhbSB0cmFuc2Zvcm1lciB0aGF0IGRvZXMgYWxsXG4jICAgb2YgdGhlIGZvbGxvd2luZzpcblxuIyAgICogSXQgZXhwZWN0cyBhbiBTTyBrZXkgZm9yIHdoaWNoIGl0IHdpbGwgZ2VuZXJhdGUgYSBjb3JyZXNwb25kaW5nIE9TIGtleS5cbiMgICAqIEEgY29ycmVzcG9uZGluZyBPUyBrZXkgaXMgZm9ybXVsYXRlZCBleGNlcHQgd2hlbiB0aGUgU08ga2V5J3Mgb2JqZWN0IHZhbHVlIGlzIGEgSlMgb2JqZWN0IC8gYSBQT0QgKHNpbmNlXG4jICAgICBpbiB0aGF0IGNhc2UsIHRoZSB2YWx1ZSBzZXJpYWxpemF0aW9uIGlzIGpvbGx5IHVzZWxlc3MgYXMgYW4gaW5kZXgpLlxuIyAgICogSXQgc2VuZHMgb24gYm90aCB0aGUgU08gYW5kIHRoZSBPUyBrZXkgZG93bnN0cmVhbSBmb3Igb3B0aW9uYWwgZnVydGhlciBwcm9jZXNzaW5nLlxuIyAgICogSXQgZm9ybXMgYSBwcm9wZXIgYG5vZGUtbGV2ZWxgLWNvbXBhdGlibGUgYmF0Y2ggcmVjb3JkIGZvciBlYWNoIGtleSBhbmQgY29sbGVjdCBhbGwgcmVjb3Jkc1xuIyAgICAgaW4gYSBidWZmZXIuXG4jICAgKiBXaGVuZXZlciB0aGUgYnVmZmVyIGhhcyBvdXRncm93biB0aGUgZ2l2ZW4gYnVmZmVyIHNpemUsIHRoZSBidWZmZXIgd2lsbCBiZSB3cml0dGVuIGludG8gdGhlIERCIHVzaW5nXG4jICAgICBgbGV2ZWx1cGAncyBgYmF0Y2hgIGNvbW1hbmQuXG4jICAgKiBXaGVuIHRoZSBsYXN0IHBlbmRpbmcgYmF0Y2ggaGFzIGJlZW4gd3JpdHRlbiBpbnRvIHRoZSBEQiwgdGhlIGBlbmRgIGV2ZW50IGlzIGNhbGxlZCBvbiB0aGUgc3RyZWFtXG4jICAgICBhbmQgbWF5IGJlIGRldGVjdGVkIGRvd25zdHJlYW0uXG5cbiMgICAjIyNcbiMgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgc2V0dGluZ3MgICAgICAgICA/PSB7fVxuIyAgIGJ1ZmZlcl9zaXplICAgICAgID0gc2V0dGluZ3NbICdiYXRjaCcgIF0gPyAxMDAwMFxuIyAgIHNvbGlkX3ByZWRpY2F0ZXMgID0gc2V0dGluZ3NbICdzb2xpZHMnIF0gPyBbXVxuIyAgIGJ1ZmZlciAgICAgICAgICAgID0gW11cbiMgICBzdWJzdHJhdGUgICAgICAgICA9IGRiWyAnJXNlbGYnIF1cbiMgICBiYXRjaF9jb3VudCAgICAgICA9IDBcbiMgICBoYXNfZW5kZWQgICAgICAgICA9IG5vXG4jICAgX3NlbmQgICAgICAgICAgICAgPSBudWxsXG4jICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgIHRocm93IG5ldyBFcnJvciBcImJ1ZmZlciBzaXplIG11c3QgYmUgcG9zaXRpdmUgaW50ZWdlciwgZ290ICN7cnByIGJ1ZmZlcl9zaXplfVwiIHVubGVzcyBidWZmZXJfc2l6ZSA+IDBcbiMgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgcHVzaCA9ICgga2V5LCB2YWx1ZSApID0+XG4jICAgICB2YWx1ZV9iZnIgPSBpZiB2YWx1ZT8gdGhlbiBAX2VuY29kZV92YWx1ZSBkYiwgdmFsdWUgZWxzZSBAX3plcm9fdmFsdWVfYmZyXG4jICAgICBidWZmZXIucHVzaCB7IHR5cGU6ICdwdXQnLCBrZXk6ICggQF9lbmNvZGVfa2V5IGRiLCBrZXkgKSwgdmFsdWU6IHZhbHVlX2JmciwgfVxuIyAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICBmbHVzaCA9ID0+XG4jICAgICBpZiBidWZmZXIubGVuZ3RoID4gMFxuIyAgICAgICBiYXRjaF9jb3VudCArPSArMVxuIyAgICAgICBzdWJzdHJhdGUuYmF0Y2ggYnVmZmVyLCAoIGVycm9yICkgPT5cbiMgICAgICAgICB0aHJvdyBlcnJvciBpZiBlcnJvcj9cbiMgICAgICAgICBiYXRjaF9jb3VudCArPSAtMVxuIyAgICAgICAgIF9zZW5kLmVuZCgpIGlmIGhhc19lbmRlZCBhbmQgYmF0Y2hfY291bnQgPCAxXG4jICAgICAgIGJ1ZmZlciA9IFtdXG4jICAgICBlbHNlXG4jICAgICAgIF9zZW5kLmVuZCgpXG4jICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgIHJldHVybiAkICggc3BvLCBzZW5kLCBlbmQgKSA9PlxuIyAgICAgX3NlbmQgPSBzZW5kXG4jICAgICBpZiBzcG8/XG4jICAgICAgIFsgc2JqLCBwcmQsIG9iaiwgXSA9IHNwb1xuIyAgICAgICBwdXNoIFsgJ3NwbycsIHNiaiwgcHJkLCBdLCBvYmpcbiMgICAgICAgIyMjIFRBSU5UIHdoYXQgdG8gc2VuZCwgaWYgYW55dGhpbmc/ICMjI1xuIyAgICAgICAjIHNlbmQgZW50cnlcbiMgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgICAgIGlmIENORC5pc2FfcG9kIG9ialxuIyAgICAgICAgICMjIyBEbyBub3QgY3JlYXRlIGluZGV4IGVudHJpZXMgaW4gY2FzZSBgb2JqYCBpcyBhIFBPRDogIyMjXG4jICAgICAgICAgbnVsbFxuIyAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICAgICAgZWxzZSBpZiBDTkQuaXNhX2xpc3Qgb2JqXG4jICAgICAgICAgaWYgcHJkIGluIHNvbGlkX3ByZWRpY2F0ZXNcbiMgICAgICAgICAgIHB1c2ggWyAncG9zJywgcHJkLCBvYmosIHNiaiwgXVxuIyAgICAgICAgIGVsc2VcbiMgICAgICAgICAgICMjIyBDcmVhdGUgb25lIGluZGV4IGVudHJ5IGZvciBlYWNoIGVsZW1lbnQgaW4gY2FzZSBgb2JqYCBpcyBhIGxpc3Q6ICMjI1xuIyAgICAgICAgICAgZm9yIG9ial9lbGVtZW50LCBvYmpfaWR4IGluIG9ialxuIyAgICAgICAgICAgICBwdXNoIFsgJ3BvcycsIHByZCwgb2JqX2VsZW1lbnQsIHNiaiwgb2JqX2lkeCwgXVxuIyAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICAgICAgZWxzZVxuIyAgICAgICAgICMjIyBDcmVhdGUgb25lIGluZGV4IGVudHJ5IGZvciBgb2JqYCBvdGhlcndpc2U6ICMjI1xuIyAgICAgICAgIHB1c2ggWyAncG9zJywgcHJkLCBvYmosIHNiaiwgXVxuIyAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICAgICAgZmx1c2goKSBpZiBidWZmZXIubGVuZ3RoID49IGJ1ZmZlcl9zaXplXG4jICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgICAgIyMjIEZsdXNoIHJlbWFpbmluZyBidWZmZXJlZCBlbnRyaWVzIHRvIERCICMjI1xuIyAgICAgaWYgZW5kP1xuIyAgICAgICBoYXNfZW5kZWQgPSB5ZXNcbiMgICAgICAgZmx1c2goKVxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyBXUklUSU5HXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkAkd3JpdGUgPSAoIGRiLCBzZXR0aW5ncyApIC0+XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc2V0dGluZ3MgICAgICAgICA/PSB7fVxuICBidWZmZXJfc2l6ZSAgICAgICA9IHNldHRpbmdzWyAnYmF0Y2gnICBdID8gMTAwMDBcbiAgc29saWRfcHJlZGljYXRlcyAgPSBzZXR0aW5nc1sgJ3NvbGlkcycgXSA/IFtdXG4gIHN1YnN0cmF0ZSAgICAgICAgID0gZGJbICclc2VsZicgXVxuICBSICAgICAgICAgICAgICAgICA9IEQuY3JlYXRlX3Rocm91Z2hzdHJlYW0oKVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGlmIGJ1ZmZlcl9zaXplIDwgMFxuICAgIHRocm93IG5ldyBFcnJvciBcImJ1ZmZlciBzaXplIG11c3QgYmUgcG9zaXRpdmUgaW50ZWdlciwgZ290ICN7cnByIGJ1ZmZlcl9zaXplfVwiXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZWxzZSBpZiBidWZmZXJfc2l6ZSA8IDJcbiAgICAkd3JpdGUgPSA9PlxuICAgICAgcmV0dXJuICQgKCBmYWNldF9iZnJzLCBzZW5kLCBlbmQgKSA9PlxuICAgICAgICBpZiBmYWNldF9iZnJzP1xuICAgICAgICAgIHN1YnN0cmF0ZS5wdXQgZmFjZXRfYmZycy4uLiwgPT5cbiAgICAgICAgICAgIGlmIGVuZD9cbiAgICAgICAgICAgICAgZW5kKClcbiAgICAgICAgZWxzZSBpZiBlbmQ/XG4gICAgICAgICAgZW5kKClcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBlbHNlXG4gICAgJHdyaXRlID0gPT5cbiAgICAgIGJ1ZmZlciA9IFtdXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIGZsdXNoID0gKCBzZW5kLCBlbmQgKSA9PlxuICAgICAgICBfYnVmZmVyID0gYnVmZmVyXG4gICAgICAgIGJ1ZmZlciAgPSBbXVxuICAgICAgICBkZWJ1ZyAnwqluWlRadCcsIFwiZmx1c2hpbmcgI3tfYnVmZmVyLmxlbmd0aH1cIlxuICAgICAgICBzdWJzdHJhdGUuYmF0Y2ggX2J1ZmZlciwgKCBlcnJvciApID0+XG4gICAgICAgICAgc2VuZC5lcnJvciBlcnJvciBpZiBlcnJvcj9cbiAgICAgICAgICBpZiBlbmQ/XG4gICAgICAgICAgICBlbmQoKVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICByZXR1cm4gJCAoIGZhY2V0X2JmcnMsIHNlbmQsIGVuZCApID0+XG4gICAgICAgIGlmIGZhY2V0X2JmcnM/XG4gICAgICAgICAgWyBrZXlfYmZyLCB2YWx1ZV9iZnIsIF0gPSBmYWNldF9iZnJzXG4gICAgICAgICAgYnVmZmVyLnB1c2ggeyB0eXBlOiAncHV0Jywga2V5OiBrZXlfYmZyLCB2YWx1ZTogdmFsdWVfYmZyLCB9XG4gICAgICAgICAgaWYgYnVmZmVyLmxlbmd0aCA+PSBidWZmZXJfc2l6ZVxuICAgICAgICAgICAgZmx1c2ggc2VuZCwgZW5kXG4gICAgICAgIGVsc2UgaWYgZW5kP1xuICAgICAgICAgIGlmIGJ1ZmZlci5sZW5ndGggPiAwXG4gICAgICAgICAgICBmbHVzaCBzZW5kLCBlbmRcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBzZXRJbW1lZGlhdGUgZW5kXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgUlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgLnBpcGUgJCAoIHNwbywgc2VuZCApID0+XG4gICAgICAjIyMgQW5hbHl6ZSBTUE8ga2V5IGFuZCBzZW5kIGFsbCBuZWNlc3NhcnkgUE9TIGZhY2V0czogIyMjXG4gICAgICBbIHNiaiwgcHJkLCBvYmosIF0gPSBzcG9cbiAgICAgIHNlbmQgWyBbICdzcG8nLCBzYmosIHByZCwgXSwgb2JqLCBdXG4gICAgICBvYmpfdHlwZSA9IENORC50eXBlX29mIG9ialxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICB1bmxlc3Mgb2JqX3R5cGUgaXMgJ3BvZCdcbiAgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgICBpZiAoIG9ial90eXBlIGlzICdsaXN0JyApIGFuZCBub3QgKCBwcmQgaW4gc29saWRfcHJlZGljYXRlcyApXG4gICAgICAgICAgZm9yIG9ial9lbGVtZW50LCBvYmpfaWR4IGluIG9ialxuICAgICAgICAgICAgc2VuZCBbIFsgJ3BvcycsIHByZCwgb2JqX2VsZW1lbnQsIHNiaiwgb2JqX2lkeCwgXSwgXVxuICAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBzZW5kIFsgWyAncG9zJywgcHJkLCBvYmosIHNiaiwgXSwgXVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgLnBpcGUgJCAoIGZhY2V0LCBzZW5kICkgPT5cbiAgICAgICMjIyBFbmNvZGUgZmFjZXQ6ICMjI1xuICAgICAgWyBrZXksIHZhbHVlLCBdID0gZmFjZXRcbiAgICAgIGtleV9iZnIgICAgICAgICA9IEBfZW5jb2RlX2tleSBkYiwga2V5XG4gICAgICB2YWx1ZV9iZnIgICAgICAgPSBpZiB2YWx1ZT8gdGhlbiBAX2VuY29kZV92YWx1ZSBkYiwgdmFsdWUgZWxzZSBAX3plcm9fdmFsdWVfYmZyXG4gICAgICBzZW5kIFsga2V5X2JmciwgdmFsdWVfYmZyLCBdXG4gICAgIyAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICMgLnBpcGUgQF8kZGVmZXIoKVxuICAgICMgLnBpcGUgQF8kZW5zdXJlX3VuaXF1ZSBkYlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgLnBpcGUgJCAoIGRhdGEsIHNlbmQsIGVuZCApIC0+XG4gICAgICBzZW5kIGRhdGEgaWYgZGF0YT9cbiAgICAgIGlmIGVuZD9cbiAgICAgICAgZGVidWcgJ8KpQ29vTnAnLCAnZGV0ZWN0ZWQgZW5kJ1xuICAgICAgICBlbmQoKVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgLnBpcGUgJHdyaXRlKClcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICByZXR1cm4gUlxuXG4jICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBAXyRkZWZlciA9IC0+XG4jICAgY291bnQgPSAwXG4jICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgIGVuZF9sYXRlciA9ICggZW5kICkgPT5cbiMgICAgICMgZGVidWcgJ8KpS2ZnUTUnLCBjb3VudFxuIyAgICAgaWYgY291bnQgPD0gMFxuIyAgICAgICBlbmQoKVxuIyAgICAgZWxzZVxuIyAgICAgICBzZXRJbW1lZGlhdGUgPT4gZW5kX2xhdGVyIGVuZFxuIyAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICBSID0gRC5jcmVhdGVfdGhyb3VnaHN0cmVhbSgpXG4jICAgICAucGlwZSAkICggZGF0YSwgc2VuZCwgZW5kICkgPT5cbiMgICAgICAgaWYgZGF0YT9cbiMgICAgICAgICBjb3VudCArPSArMVxuIyAgICAgICAgICMgZGVidWcgJ8KpaTZzbmEnLCBjb3VudFxuIyAgICAgICAgIHNldEltbWVkaWF0ZSA9PlxuIyAgICAgICAgICAgc2VuZCBkYXRhXG4jICAgICAgICAgICBjb3VudCArPSAtMVxuIyAgICAgICAgICAgIyBkZWJ1ZyAnwql3U1FWSycsIGNvdW50XG4jICAgICAgIGlmIGVuZD9cbiMgICAgICAgICBlbmRfbGF0ZXIgZW5kXG5cbiMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEBfJGVuc3VyZV91bmlxdWUgPSAoIGRiICkgLT5cbiMgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgIyBibG9vbSAgID0gQmxvb20uZm9yQ2FwYWNpdHkgMWU3LCAwLjFcbiMgICBibG9vbSAgICAgPSBCbG9vbS5mb3JDYXBhY2l0eSAxZTEsIDFcbiMgICBzdWJzdHJhdGUgPSBkYlsgJyVzZWxmJyBdXG4jICAgcnFfY291bnQgID0gMFxuIyAgIHF1ZXVlICAgICA9IFtdXG4jICAgX2VuZCAgICAgID0gbnVsbFxuIyAgIF9zZW5kICAgICA9IG51bGxcbiMgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgcHJvY2Vzc19xdWV1ZSA9ID0+XG4jICAgICBpZiBxdWV1ZS5sZW5ndGggPj0gMVxuIyAgICAgICBbIGtleV9iZnIsIHZhbHVlX2JmciwgXSA9IHF1ZXVlLnBvcCgpXG4jICAgICAgIG1heV9iZV9rbm93bl9rZXkgICAgICAgID0gYmxvb20uaGFzIGtleV9iZnJcbiMgICAgICAgYmxvb20ud3JpdGUga2V5X2JmclxuIyAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICAgICAgaWYgbWF5X2JlX2tub3duX2tleVxuIyAgICAgICAgIHJxX2NvdW50ICs9ICsxXG4jICAgICAgICAgZGVidWcgJ8KpUVM2a0YnLCAnbWF5X2JlX2tub3duX2tleScsIHJxX2NvdW50LCBAX2RlY29kZV9rZXkgZGIsIGtleV9iZnJcbiMgICAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgICAgICAgc3Vic3RyYXRlLmdldCBrZXlfYmZyLCAoIGVycm9yICkgPT5cbiMgICAgICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgICAgICAgICBpZiBlcnJvcj9cbiMgICAgICAgICAgICAgaWYgZXJyb3JbICd0eXBlJyBdIGlzICdOb3RGb3VuZEVycm9yJ1xuIyAgICAgICAgICAgICAgIHVyZ2UgJ8KpOWQwVXEnLCAnc2VuZGluZycsIEBfZGVjb2RlX2tleSBkYiwga2V5X2JmclxuIyAgICAgICAgICAgICAgIF9zZW5kIFsga2V5X2JmciwgdmFsdWVfYmZyLCBdXG4jICAgICAgICAgICAgIGVsc2VcbiMgICAgICAgICAgICAgICBfc2VuZC5lcnJvciBlcnJvclxuIyAgICAgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICAgICAgICAgIGVsc2VcbiMgICAgICAgICAgICAgX3NlbmQuZXJyb3IgbmV3IEVycm9yIFwia2V5IGFscmVhZHkgaW4gREI6ICN7cnByIEBfZGVjb2RlX2tleSBkYiwga2V5X2Jmcn1cIlxuIyAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICAgICAgZWxzZVxuIyAgICAgICAgICMjIyBUQUlOVCBtYXkgc2VuZCByaWdodGF3YXksIGFzIHdlJ3JlIGFscmVhZHkgZGVmZXJyZWQgIyMjXG4jICAgICAgICAgc2V0SW1tZWRpYXRlID0+IF9zZW5kIFsga2V5X2JmciwgdmFsdWVfYmZyLCBdXG4jICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgICAgaWYgX2VuZD8gYW5kIHJxX2NvdW50IDw9IDAgYW5kIHF1ZXVlLmxlbmd0aCA8PSAwXG4jICAgICAgIGRlYnVnICfCqTk5NWRrJywgXCJjYWxsaW5nIF9lbmRcIlxuIyAgICAgICBfZW5kKClcbiMgICAgICAgcmV0dXJuXG4jICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgICAgc2V0SW1tZWRpYXRlIHByb2Nlc3NfcXVldWVcbiMgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgUiA9IEQuY3JlYXRlX3Rocm91Z2hzdHJlYW0oKVxuIyAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICAgIC5waXBlICQgKCBmYWNldF9iZnJzLCBzZW5kLCBlbmQgKSA9PlxuIyAgICAgICBfc2VuZCA9IHNlbmRcbiMgICAgICAgaWYgZmFjZXRfYmZycz9cbiMgICAgICAgICBkZWJ1ZyAnwqludVNJaicsIEBfZGVjb2RlX2tleSBkYiwgZmFjZXRfYmZyc1sgMCBdXG4jICAgICAgICAgcXVldWUudW5zaGlmdCBmYWNldF9iZnJzXG4jICAgICAgIGlmIGVuZD9cbiMgICAgICAgICBkZWJ1ZyAnwqlBekFwVScsIFwic2V0dGluZyBfZW5kXCJcbiMgICAgICAgICBfZW5kID0gZW5kXG4jICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgIHByb2Nlc3NfcXVldWUoKVxuIyAgIHJldHVybiBSXG5cbiMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEBfJGVuc3VyZV91bmlxdWUgPSAoIGRiICkgLT5cbiMgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgIyBibG9vbSAgID0gQmxvb20uZm9yQ2FwYWNpdHkgMWU3LCAwLjFcbiMgICBibG9vbSAgICAgPSBCbG9vbS5mb3JDYXBhY2l0eSAxZTEsIDFcbiMgICBycV9jb3VudCAgPSAwXG4jICAgYnVmZmVyICAgID0gW11cbiMgICBfZW5kICAgICAgPSBudWxsXG4jICAgX3NlbmQgICAgID0gbnVsbFxuIyAgIFIgICAgICAgICA9IEQuY3JlYXRlX3Rocm91Z2hzdHJlYW0oKVxuIyAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICBmbHVzaCA9ID0+XG4jICAgICByZXR1cm4gaWYgYnVmZmVyLmxlbmd0aCBpcyAwXG4jICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgICAgaWYgcnFfY291bnQgPiAwXG4jICAgICAgIHNldEltbWVkaWF0ZSBmbHVzaFxuIyAgICAgICByZXR1cm4gbnVsbFxuIyAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICAgIF9zZW5kIGJ1ZmZlci5wb3AoKVxuIyAgICAgc2V0SW1tZWRpYXRlIGZsdXNoXG4jICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgICAgcmV0dXJuIG51bGxcbiMgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgUlxuIyAgICAgLnBpcGUgJCAoIGZhY2V0X2JmcnMsIHNlbmQsIGVuZCApID0+XG4jICAgICAgIF9zZW5kID0gc2VuZFxuIyAgICAgICBpZiBmYWNldF9iZnJzP1xuIyAgICAgICAgIGJ1ZmZlci5zcGxpY2UgMCwgMCwgZmFjZXRfYmZyc1xuIyAgICAgICBmbHVzaCgpXG4jICAgICAgIGlmIGVuZD9cbiMgICAgICAgICBmbHVzaCgpXG4jICAgICAucGlwZSAkICggZmFjZXRfYmZycywgc2VuZCwgZW5kICkgPT5cbiMgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLCxcbiMgICAgICAgaWYgZmFjZXRfYmZycz9cbiMgICAgICAgICBbIGtleV9iZnIsIF8sIF0gICA9IGZhY2V0X2JmcnNcbiAgICAgICAgIyAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgICAgIyAgIGRiWyAnJXNlbGYnIF0uZ2V0IGtleV9iZnIsICggZXJyb3IgKSA9PlxuICAgICAgICAjICAgICBycV9jb3VudCArPSAtMVxuICAgICAgICAjICAgICBkZWJ1ZyAnwqlRUzZrRicsICdtYXlfYmVfa25vd25fa2V5JywgcnFfY291bnQsIF9lbmQ/LCBAX2RlY29kZV9rZXkgZGIsIGtleV9iZnJcbiAgICAgICAgIyAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgICAgIyAgICAgaWYgcnFfY291bnQgPD0gMCBhbmQgX2VuZD9cbiAgICAgICAgIyAgICAgICAjIHdhcm4gJ8KpSk9RTGItMScsICdlbmQnXG4gICAgICAgICMgICAgICAgYmxvb20uZW5kKClcbiAgICAgICAgIyAgICAgICAjIF9lbmQoKVxuICAgICAgICAjICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgICAjIGVsc2VcbiAgICAgICAgIyAgIHNlbmQgZmFjZXRfYmZyc1xuIyAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4sLFxuIyAgICAgICBpZiBlbmQ/XG4jICAgICAgICAgIyMjIFRBSU5UIHNob3VsZCB3cml0ZSBibG9vbS5leHBvcnQgdG8gREIgIyMjXG4jICAgICAgICAgZGVidWcgJ8KpZEpjYmsnLCBidWZmZXJcbiMgICAgICAgICBpZiBycV9jb3VudCA+IDBcbiMgICAgICAgICAgIF9lbmQgPSBlbmRcbiMgICAgICAgICBlbHNlXG4jICAgICAgICAgICB3YXJuICfCqUpPUUxiLTInLCAnZW5kJ1xuIyAgICAgICAgICAgYmxvb20uZW5kKClcbiMgICAgICAgICAgIGVuZCgpXG4jICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgIHJldHVybiBSXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyBSRUFESU5HXG4jICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBAY3JlYXRlX2tleXN0cmVhbSA9ICggZGIsIGxvX2hpbnQgPSBudWxsLCBoaV9oaW50ID0gbnVsbCApIC0+XG4jICAgIyMjIFRBSU5UIGNvZGUgZHVwbGljYXRpb24gIyMjXG4jICAgaWYgbG9faGludD9cbiMgICAgIGlmIGhpX2hpbnQ/XG4jICAgICAgIHF1ZXJ5ID0geyBndGU6IGxvX2hpbnQsIGx0ZTpoaV9oaW50LCB9XG4jICAgICBlbHNlXG4jICAgICAgIHF1ZXJ5ID0geyBndGU6IGxvX2hpbnQsIH1cbiMgICBlbHNlIGlmIGhpX2hpbnQ/XG4jICAgICBxdWVyeSA9IHsgbHRlOiBoaV9oaW50LCB9XG4jICAgZWxzZVxuIyAgICAgcXVlcnkgPSBudWxsXG4jICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgIGRlYnVnICfCqTgzNUpQJywgcXVlcnlcbiMgICBSID0gaWYgcXVlcnk/IHRoZW4gKCBkYlsgJyVzZWxmJyBdLmNyZWF0ZUtleVN0cmVhbSBxdWVyeSApIGVsc2UgZGJbICclc2VsZicgXS5jcmVhdGVLZXlTdHJlYW0oKVxuIyAgICMgUiA9IGRiWyAnJXNlbGYnIF0uY3JlYXRlS2V5U3RyZWFtIEBuZXdfcXVlcnkgZGIsIHF1ZXJ5XG4jICAgIyMjIFRBSU5UIFNob3VsZCB3ZSB0ZXN0IGZvciB3ZWxsLWZvcm1lZCBlbnRyaWVzIGhlcmU/ICMjI1xuIyAgIFIgPSBSLnBpcGUgJCAoIGJrZXksIHNlbmQgKSA9PiBzZW5kIEBfZGVjb2RlX2tleSBkYiwgYmtleVxuIyAgIHJldHVybiBSXG5cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AY3JlYXRlX3BocmFzZXN0cmVhbSA9ICggZGIsIGxvX2hpbnQgPSBudWxsLCBoaV9oaW50ID0gbnVsbCwgc2V0dGluZ3MgKSAtPlxuICBpbnB1dCA9IEBjcmVhdGVfZmFjZXRzdHJlYW0gZGIsIGxvX2hpbnQsIGhpX2hpbnQsIHNldHRpbmdzXG4gIFIgPSBpbnB1dFxuICAgIC5waXBlIEAkYXNfcGhyYXNlIGRiXG4gIFJbICclbWV0YScgXSA9IGlucHV0WyAnJW1ldGEnIF1cbiAgcmV0dXJuIFJcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AY3JlYXRlX2ZhY2V0c3RyZWFtID0gKCBkYiwgbG9faGludCA9IG51bGwsIGhpX2hpbnQgPSBudWxsLCBzZXR0aW5ncyApIC0+XG4gICMjI1xuICAqIElmIG5laXRlciBgbG9gIG5vciBgaGlgIGlzIGdpdmVuLCB0aGUgc3RyZWFtIHdpbGwgaXRlcmF0ZSBvdmVyIGFsbCBlbnRyaWVzLlxuICAqIElmIGJvdGggYGxvYCBhbmQgYGhpYCBhcmUgZ2l2ZW4sIGEgcXVlcnkgd2l0aCBsb3dlciBhbmQgdXBwZXIsIGluY2x1c2l2ZSBib3VuZGFyaWVzIGlzXG4gICAgaXNzdWVkLlxuICAqIElmIG9ubHkgYGxvYCBpcyBnaXZlbiwgYSBwcmVmaXggcXVlcnkgaXMgaXNzdWVkLlxuICAqIElmIGBoaWAgaXMgZ2l2ZW4gYnV0IGBsb2AgaXMgbWlzc2luZywgYW4gZXJyb3IgaXMgaXNzdWVkLlxuICAjIyNcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBpZiBoaV9oaW50PyBhbmQgbm90IGxvX2hpbnQ/XG4gICAgdGhyb3cgbmV3IEVycm9yIFwibXVzdCBnaXZlIGBsb19oaW50YCB3aGVuIGBoaV9oaW50YCBpcyBnaXZlblwiXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgaWYgbG9faGludD8gYW5kIG5vdCBoaV9oaW50P1xuICAgIHF1ZXJ5ICAgICAgID0gQF9xdWVyeV9mcm9tX3ByZWZpeCBkYiwgbG9faGludFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGVsc2UgaWYgbG9faGludD8gYW5kIGhpX2hpbnQgaXMgJyonXG4gICAgcXVlcnkgICAgICAgPSBAX3F1ZXJ5X2Zyb21fcHJlZml4IGRiLCBsb19oaW50LCAnKidcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBlbHNlXG4gICAgbG9faGludF9iZnIgPSBpZiBsb19oaW50PyB0aGVuICggICAgICAgIEBfZW5jb2RlX2tleSBkYiwgbG9faGludCApICAgICAgICAgIGVsc2UgbnVsbFxuICAgIGhpX2hpbnRfYmZyID0gaWYgaGlfaGludD8gdGhlbiAoIEBfcXVlcnlfZnJvbV9wcmVmaXggZGIsIGhpX2hpbnQgKVsgJ2x0ZScgXSBlbHNlIG51bGxcbiAgICAjIGxvX2hpbnRfYmZyID0gaWYgbG9faGludD8gdGhlbiAoICAgICAgICBAX2VuY29kZV9rZXkgZGIsIGxvX2hpbnQgKSAgICAgICAgICBlbHNlIENPREVDWyAna2V5cycgXVsgJ2xvJyBdXG4gICAgIyBoaV9oaW50X2JmciA9IGlmIGhpX2hpbnQ/IHRoZW4gKCBAX3F1ZXJ5X2Zyb21fcHJlZml4IGRiLCBoaV9oaW50IClbICdsdGUnIF0gZWxzZSBDT0RFQ1sgJ2tleXMnIF1bICdoaScgXVxuICAgIHF1ZXJ5ICAgICAgID0geyBndGU6IGxvX2hpbnRfYmZyLCBsdGU6IGhpX2hpbnRfYmZyLCB9XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgIyMjIFRBSU5UIFNob3VsZCB3ZSB0ZXN0IGZvciB3ZWxsLWZvcm1lZCBlbnRyaWVzIGhlcmU/ICMjI1xuICBSID0gZGJbICclc2VsZicgXS5jcmVhdGVSZWFkU3RyZWFtIHF1ZXJ5XG4gIFIgPSBSLnBpcGUgJCAoIHsga2V5LCB2YWx1ZSB9LCBzZW5kICkgPT4gc2VuZCBbICggQF9kZWNvZGVfa2V5IGRiLCBrZXkgKSwgKCBAX2RlY29kZV92YWx1ZSBkYiwgdmFsdWUgKSwgXVxuICBSWyAnJW1ldGEnIF0gPSB7fVxuICBSWyAnJW1ldGEnIF1bICdxdWVyeScgXSA9IHF1ZXJ5XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcmV0dXJuIFJcblxuIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQHJlYWRfbWFueSA9ICggZGIsIGhpbnQgPSBudWxsICkgLT5cbiMgICAjIyMgSGludHMgYXJlIGludGVycHJldGVkIGFzIHBhcnRpYWwgc2Vjb25kYXJ5IChQT1MpIGtleXMuICMjI1xuXG4jICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBAX3JlYWRfb25lID0gKCBkYiwga2V5LCBmYWxsYmFjayA9IEBfbWlzZml0LCBoYW5kbGVyICkgLT5cbiMgICBzd2l0Y2ggYXJpdHkgPSBhcmd1bWVudHMubGVuZ3RoXG4jICAgICB3aGVuIDNcbiMgICAgICAgaGFuZGxlciAgID0gZmFsbGJhY2tcbiMgICAgICAgZmFsbGJhY2sgID0gQF9taXNmaXRcbiMgICAgIHdoZW4gNCB0aGVuIG51bGxcbiMgICAgIGVsc2UgdGhyb3cgbmV3IEVycm9yIFwiZXhwZWN0ZWQgMyBvciA0IGFyZ3VtZW50cywgZ290ICN7YXJpdHl9XCJcbiMgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgZGJbICclc2VsZicgXS5nZXQga2V5LCBoYW5kbGVyXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQHJlYWRfc3ViID0gKCBkYiwgc2V0dGluZ3MsIHJlYWQgKSAtPlxuICBzd2l0Y2ggYXJpdHkgPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgd2hlbiAyXG4gICAgICByZWFkICAgICAgPSBzZXR0aW5nc1xuICAgICAgc2V0dGluZ3MgID0gbnVsbFxuICAgIHdoZW4gM1xuICAgICAgbnVsbFxuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBFcnJvciBcImV4cGVjdGVkIDIgb3IgMyBhcmd1bWVudHMsIGdvdCAje2FyaXR5fVwiXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgaW5kZXhlZCAgICAgICAgICAgPSBzZXR0aW5ncz9bICdpbmRleGVkJyAgICBdID8gbm9cbiAgIyB0cmFuc2Zvcm0gICAgICAgICA9IHNldHRpbmdzP1sgJ3RyYW5zZm9ybScgIF0gPyBELiRwYXNzX3Rocm91Z2goKVxuICBtYW5nbGUgICAgICAgICAgICA9IHNldHRpbmdzP1sgJ21hbmdsZScgICAgIF0gPyAoIGRhdGEgKSAtPiBkYXRhXG4gIHNlbmRfZW1wdHkgICAgICAgID0gc2V0dGluZ3M/WyAnZW1wdHknICAgICAgXSA/IG5vXG4gIGluc2VydF9pbmRleCAgICAgID0gaWYgaW5kZXhlZCB0aGVuIEQubmV3X2luZGV4ZXIoKSBlbHNlICggeCApIC0+IHhcbiAgb3Blbl9zdHJlYW1fY291bnQgPSAwXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcmV0dXJuICQgKCBvdXRlcl9kYXRhLCBvdXRlcl9zZW5kLCBvdXRlcl9lbmQgKSA9PlxuICAgIGNvdW50ID0gMFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaWYgb3V0ZXJfZGF0YT9cbiAgICAgIG9wZW5fc3RyZWFtX2NvdW50ICAgICs9ICsxXG4gICAgICBzdWJfaW5wdXQgICAgICAgICAgICAgPSByZWFkIG91dGVyX2RhdGFcbiAgICAgIFsgbWVtbywgc3ViX2lucHV0LCBdICA9IGlmIENORC5pc2FfbGlzdCBzdWJfaW5wdXQgdGhlbiBzdWJfaW5wdXQgZWxzZSBbIEBfbWlzZml0LCBzdWJfaW5wdXQsIF1cbiAgICAgIHN1Yl9pbnB1dFxuICAgICAgICAjIC5waXBlIHRyYW5zZm9ybVxuICAgICAgICAucGlwZSBkbyA9PlxuICAgICAgICAgICMjIyBUQUlOVCBubyBuZWVkIHRvIGJ1aWxkIGJ1ZmZlciBpZiBub3QgYHNlbmRfZW1wdHlgIGFuZCB0aGVyZSBhcmUgbm8gcmVzdWx0cyAjIyNcbiAgICAgICAgICBidWZmZXIgPSBpZiBtZW1vIGlzIEBfbWlzZml0IHRoZW4gW10gZWxzZSBbIG1lbW8sIF1cbiAgICAgICAgICByZXR1cm4gJCAoIGlubmVyX2RhdGEsIF8sIGlubmVyX2VuZCApID0+XG4gICAgICAgICAgICBpZiBpbm5lcl9kYXRhP1xuICAgICAgICAgICAgICBpbm5lcl9kYXRhID0gbWFuZ2xlIGlubmVyX2RhdGFcbiAgICAgICAgICAgICAgaWYgaW5uZXJfZGF0YT9cbiAgICAgICAgICAgICAgICBjb3VudCArPSArMVxuICAgICAgICAgICAgICAgIGJ1ZmZlci5wdXNoIGlubmVyX2RhdGFcbiAgICAgICAgICAgIGlmIGlubmVyX2VuZD9cbiAgICAgICAgICAgICAgaWYgc2VuZF9lbXB0eSBvciBjb3VudCA+IDBcbiAgICAgICAgICAgICAgICBvdXRlcl9zZW5kIGluc2VydF9pbmRleCBidWZmZXJcbiAgICAgICAgICAgICAgb3Blbl9zdHJlYW1fY291bnQgKz0gLTFcbiAgICAgICAgICAgICAgaW5uZXJfZW5kKClcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGlmIG91dGVyX2VuZD9cbiAgICAgIHJlcGVhdF9pbW1lZGlhdGVseSAtPlxuICAgICAgICByZXR1cm4gdHJ1ZSB1bmxlc3Mgb3Blbl9zdHJlYW1fY291bnQgaXMgMFxuICAgICAgICBvdXRlcl9lbmQoKVxuICAgICAgICByZXR1cm4gZmFsc2VcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgS0VZUyAmIFZBTFVFU1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX2VuY29kZV9rZXkgPSAoIGRiLCBrZXksIGV4dHJhX2J5dGUgKSAtPlxuICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIGtleSAje3JwciBrZXl9XCIgaWYga2V5IGlzIHVuZGVmaW5lZFxuICByZXR1cm4gX2NvZGVjX2VuY29kZSBrZXksIGV4dHJhX2J5dGVcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX2RlY29kZV9rZXkgPSAoIGRiLCBrZXkgKSAtPlxuICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIGtleSAje3JwciBrZXl9XCIgaWYgKCBSID0gX2NvZGVjX2RlY29kZSBrZXkgKSBpcyB1bmRlZmluZWRcbiAgcmV0dXJuIFJcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX2VuY29kZV92YWx1ZSA9ICggZGIsIHZhbHVlICAgICAgKSAtPiBuZXcgQnVmZmVyICggSlNPTi5zdHJpbmdpZnkgdmFsdWUgKSwgJ3V0Zi04J1xuQF9kZWNvZGVfdmFsdWUgPSAoIGRiLCB2YWx1ZV9iZnIgICkgLT4gSlNPTi5wYXJzZSB2YWx1ZV9iZnIudG9TdHJpbmcgJ3V0Zi04J1xuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMjIyBOQiBBcmd1bWVudCBvcmRlcmluZyBmb3IgdGhlc2UgZnVuY3Rpb24gaXMgYWx3YXlzIHN1YmplY3QgYmVmb3JlIG9iamVjdCwgcmVnYXJkbGVzcyBvZiB0aGUgcGhyYXNldHlwZVxuYW5kIHRoZSBvcmRlcmluZyBpbiB0aGUgcmVzdWx0aW5nIGtleS4gIyMjXG5AbmV3X2tleSA9ICggZGIsIHBocmFzZXR5cGUsIHNrLCBzdiwgb2ssIG92LCBpZHggKSAtPlxuICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIHBocmFzZXR5cGU6ICN7cnByIHBocmFzZXR5cGV9XCIgdW5sZXNzIHBocmFzZXR5cGUgaW4gWyAnc28nLCAnb3MnLCBdXG4gIFsgc2ssIHN2LCBvaywgb3YsIF0gPSBbIG9rLCBvdiwgc2ssIHN2LCBdIGlmIHBocmFzZXR5cGUgaXMgJ29zJ1xuICByZXR1cm4gWyBwaHJhc2V0eXBlLCBzaywgc3YsIG9rLCBvdiwgKCBpZHggPyAwICksIF1cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AbmV3X3NvX2tleSA9ICggZGIsIFAuLi4gKSAtPiBAbmV3X2tleSBkYiwgJ3NvJywgUC4uLlxuQG5ld19vc19rZXkgPSAoIGRiLCBQLi4uICkgLT4gQG5ld19rZXkgZGIsICdvcycsIFAuLi5cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX25ld19vc19rZXlfZnJvbV9zb19rZXkgPSAoIGRiLCBzb19rZXkgKSAtPlxuICBbIHBocmFzZXR5cGUsIHNrLCBzdiwgb2ssIG92LCBpZHgsIF0gPSBAYXNfcGhyYXNlIGRiLCBzb19rZXlcbiAgdGhyb3cgbmV3IEVycm9yIFwiZXhwZWN0ZWQgcGhyYXNldHlwZSAnc28nLCBnb3QgI3tycHIgcGhyYXNldHlwZX1cIiB1bmxlc3MgcGhyYXNldHlwZSBpcyAnc28nXG4gIHJldHVybiBbICdvcycsIG9rLCBvdiwgc2ssIHN2LCBpZHgsIF1cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AbmV3X2tleXMgPSAoIGRiLCBwaHJhc2V0eXBlLCBzaywgc3YsIG9rLCBvdiwgaWR4ICkgLT5cbiAgb3RoZXJfcGhyYXNldHlwZSAgPSBpZiBwaHJhc2V0eXBlIGlzICdzbycgdGhlbiAnb3MnIGVsc2UgJ3NvJ1xuICByZXR1cm4gW1xuICAgICggQG5ld19rZXkgZGIsICAgICAgIHBocmFzZXR5cGUsIHNrLCBzdiwgb2ssIG92LCBpZHggKSxcbiAgICAoIEBuZXdfa2V5IGRiLCBvdGhlcl9waHJhc2V0eXBlLCBzaywgc3YsIG9rLCBvdiwgaWR4ICksIF1cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AYXNfcGhyYXNlID0gKCBkYiwga2V5LCB2YWx1ZSwgbm9ybWFsaXplID0geWVzICkgLT5cbiAgc3dpdGNoIHBocmFzZXR5cGUgPSBrZXlbIDAgXVxuICAgIHdoZW4gJ3NwbydcbiAgICAgIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgU1BPIGtleSAobGVuZ3RoICN7bGVuZ3RofSlcIiB1bmxlc3MgKCBsZW5ndGggPSBrZXkubGVuZ3RoICkgaXMgM1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCB2YWx1ZSAoMSkgI3tycHIgdmFsdWV9XCIgaWYgdmFsdWUgaW4gWyB1bmRlZmluZWQsIF1cbiAgICAgIHJldHVybiBbIHBocmFzZXR5cGUsIGtleVsgMSBdLCBrZXlbIDIgXSwgdmFsdWUsIF1cbiAgICB3aGVuICdwb3MnXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIFBPUyBrZXkgKGxlbmd0aCAje2xlbmd0aH0pXCIgdW5sZXNzIDQgPD0gKCBsZW5ndGggPSBrZXkubGVuZ3RoICkgPD0gNVxuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCB2YWx1ZSAoMikgI3tycHIgdmFsdWV9XCIgaWYgbm90ICggdmFsdWUgaW4gWyBudWxsLCBdIClcbiAgICAgIHJldHVybiBbIHBocmFzZXR5cGUsIGtleVsgMyBdLCBrZXlbIDEgXSwga2V5WyAyIF0sIGtleVsgNCBdLCBdIGlmIGtleVsgNCBdP1xuICAgICAgcmV0dXJuIFsgcGhyYXNldHlwZSwga2V5WyAzIF0sIGtleVsgMSBdLCBrZXlbIDIgXSwgXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkAkYXNfcGhyYXNlID0gKCBkYiApIC0+XG4gIHJldHVybiAkICggZGF0YSwgc2VuZCApID0+XG4gICAgc2VuZCBAYXNfcGhyYXNlIGRiLCBkYXRhLi4uXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQGtleV9mcm9tX3VybCA9ICggZGIsIHVybCApIC0+XG4gICMjIyBUQUlOIGRvZXMgbm90IHVuZXNjYXBlIGFzIHlldCAjIyNcbiAgIyMjIFRBSU4gZG9lcyBub3QgY2FzdCB2YWx1ZXMgYXMgeWV0ICMjI1xuICAjIyMgVEFJTlQgZG9lcyBub3Qgc3VwcG9ydCBtdWx0aXBsZSBpbmRleGVzIGFzIHlldCAjIyNcbiAgWyBwaHJhc2V0eXBlLCBmaXJzdCwgc2Vjb25kLCBpZHgsIF0gPSB1cmwuc3BsaXQgJ3wnXG4gIHVubGVzcyBwaHJhc2V0eXBlPyBhbmQgcGhyYXNldHlwZS5sZW5ndGggPiAwIGFuZCBwaHJhc2V0eXBlIGluIFsgJ3NvJywgJ29zJywgXVxuICAgIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgVVJMIGtleSAje3JwciB1cmx9XCJcbiAgdW5sZXNzIGZpcnN0PyBhbmQgZmlyc3QubGVuZ3RoID4gMCBhbmQgc2Vjb25kPyBhbmQgc2Vjb25kLmxlbmd0aCA+IDBcbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIFVSTCBrZXkgI3tycHIgdXJsfVwiXG4gIGlkeCA9IGlmICggaWR4PyBhbmQgaWR4Lmxlbmd0aCA+IDAgKSB0aGVuICggcGFyc2VJbnQgaWR4LCAxMCApIGVsc2UgMFxuICBbIHNrLCBzdiwgXSA9ICBmaXJzdC5zcGxpdCAnOidcbiAgWyBvaywgb3YsIF0gPSBzZWNvbmQuc3BsaXQgJzonXG4gIHVubGVzcyBzaz8gYW5kIHNrLmxlbmd0aCA+IDAgYW5kIG9rPyBhbmQgb2subGVuZ3RoID4gMFxuICAgIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgVVJMIGtleSAje3JwciB1cmx9XCJcbiAgWyBzaywgc3YsIG9rLCBvdiwgXSA9IFsgb2ssIG92LCBzaywgc3YsIF0gaWYgcGhyYXNldHlwZSBpcyAnb3MnXG4gIHJldHVybiBbIHBocmFzZXR5cGUsIHNrLCBzdiwgb2ssIG92LCBpZHgsIF1cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AdXJsX2Zyb21fa2V5ID0gKCBkYiwga2V5ICkgLT5cbiAgaWYgKCBAX3R5cGVfZnJvbV9rZXkgZGIsIGtleSApIGlzICdsaXN0J1xuICAgIFsgcGhyYXNldHlwZSwgdGFpbC4uLiwgXSA9IGtleVxuICAgIGlmIHBocmFzZXR5cGUgaXMgJ3NwbydcbiAgICAgIFsgc2JqLCBwcmQsIF0gPSB0YWlsXG4gICAgICByZXR1cm4gXCJzcG98I3tzYmp9fCN7cHJkfXxcIlxuICAgIGVsc2VcbiAgICAgIFsgcHJkLCBvYmosIHNiaiwgaWR4LCBdID0gdGFpbFxuICAgICAgaWR4X3JwciA9IGlmIGlkeD8gdGhlbiBycHIgaWR4IGVsc2UgJydcbiAgICAgIHJldHVybiBcInBvc3wje3ByZH06I3tvYmp9fCN7c2JqfXwje2lkeF9ycHJ9XCJcbiAgcmV0dXJuIFwiI3tycHIga2V5fVwiXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQCR1cmxfZnJvbV9rZXkgPSAoIGRiICkgLT4gJCAoIGtleSwgc2VuZCApID0+IHNlbmQgQHVybF9mcm9tX2tleSBkYiwga2V5XG5AJGtleV9mcm9tX3VybCA9ICggZGIgKSAtPiAkICggdXJsLCBzZW5kICkgPT4gc2VuZCBAa2V5X2Zyb21fdXJsIGRiLCBrZXlcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX3R5cGVfZnJvbV9rZXkgPSAoIGRiLCBrZXkgKSAtPlxuICBpZiBBcnJheS5pc0FycmF5IGtleVxuICAgICMgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBrZXk6ICN7cnByIGtleX1cIiB1bmxlc3Mga2V5Lmxlbmd0aCBpcyA2XG4gICAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBwaHJhc2V0eXBlOiAje3JwciBrZXl9XCIgdW5sZXNzIGtleVsgJzAnIF0gaW4gQHBocmFzZXR5cGVzXG4gICAgcmV0dXJuICdsaXN0J1xuICByZXR1cm4gJ290aGVyJ1xuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyBQUkVGSVhFUyAmIFFVRVJJRVNcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9xdWVyeV9mcm9tX3ByZWZpeCA9ICggZGIsIGxvX2hpbnQsIHN0YXIgKSAtPlxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGlmIHN0YXI/XG4gICAgIyMjICdBc3RlcmlzaycgZW5jb2Rpbmc6IHBhcnRpYWwga2V5IHNlZ21lbnRzIG1hdGNoICMjI1xuICAgIGd0ZSAgID0gQF9lbmNvZGVfa2V5IGRiLCBsb19oaW50XG4gICAgbHRlICAgPSBAX2VuY29kZV9rZXkgZGIsIGxvX2hpbnRcbiAgICBsdGVbIGx0ZS5sZW5ndGggLSAxIF0gPSBDT0RFQ1sgJ3R5cGVtYXJrZXJzJyAgXVsgJ2hpJyBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZWxzZVxuICAgICMjIyAnQ2xhc3NpY2FsJyBlbmNvZGluZzogb25seSBmdWxsIGtleSBzZWdtZW50cyBtYXRjaCAjIyNcbiAgICBiYXNlICA9IEBfZW5jb2RlX2tleSBkYiwgbG9faGludCwgQ09ERUNbICd0eXBlbWFya2VycycgIF1bICdoaScgXVxuICAgIGd0ZSAgID0gYmFzZS5zbGljZSAwLCBiYXNlLmxlbmd0aCAtIDFcbiAgICBsdGUgICA9IGJhc2Uuc2xpY2UgMCwgYmFzZS5sZW5ndGhcbiAgcmV0dXJuIHsgZ3RlLCBsdGUsIH1cblxuXG5cblxuXG4iXX0=