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
    })(this))).pipe(this._$defer()).pipe($write());
    return R;
  };

  this._$defer = function() {
    var R, count, end_later;
    count = 0;
    end_later = (function(_this) {
      return function(end) {
        if (count <= 0) {
          return end();
        } else {
          return setImmediate(function() {
            return end_later(end);
          });
        }
      };
    })(this);
    return R = D.create_throughstream().pipe($((function(_this) {
      return function(data, send, end) {
        if (data != null) {
          count += +1;
          setImmediate(function() {
            send(data);
            return count += -1;
          });
        }
        if (end != null) {
          return end_later(end);
        }
      };
    })(this)));
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
        var _, key_bfr, ref;
        if (queue.length >= 1) {
          ref = queue.pop(), key_bfr = ref[0], _ = ref[1];
          if (bloom.has(key_bfr)) {
            rq_count += +1;
          }
        }
        if ((_end != null) && rq_count <= 0 && queue.length <= 0) {
          _end();
          return;
        }
        return setImmediate(process_queue);
      };
    })(this);
    R = D.create_throughstream().pipe($((function(_this) {
      return function(data, send, end) {
        if (data != null) {
          setImmediate(function() {
            return send(data);
          });
        }
        if (end != null) {
          return setImmediate(function() {
            return end();
          });
        }
      };
    })(this)));
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

//# sourceMappingURL=data:application/json;base64,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QUMsQ0FBQSxrQkFBRCxHQUFzQixTQUFFLEVBQUYsRUFBTSxPQUFOLEVBQWUsSUFBZixHQUFBO0FBRXBCLFFBQUEsY0FBQTtBQUFBLElBQUEsSUFBRyxZQUFIO0FBQ0U7QUFBQSwyREFBQTtBQUFBLE1BQ0EsR0FBQSxHQUFRLElBQUMsQ0FBQSxXQUFELENBQWEsRUFBYixFQUFpQixPQUFqQixDQURSLENBQUE7QUFBQSxNQUVBLEdBQUEsR0FBUSxJQUFDLENBQUEsV0FBRCxDQUFhLEVBQWIsRUFBaUIsT0FBakIsQ0FGUixDQUFBO0FBQUEsTUFHQSxHQUFLLENBQUEsR0FBRyxDQUFDLE1BQUosR0FBYSxDQUFiLENBQUwsR0FBd0IsS0FBTyxDQUFBLGFBQUEsQ0FBa0IsQ0FBQSxJQUFBLENBSGpELENBREY7S0FBQSxNQUFBO0FBT0U7QUFBQSw4REFBQTtBQUFBLE1BQ0EsSUFBQSxHQUFRLElBQUMsQ0FBQSxXQUFELENBQWEsRUFBYixFQUFpQixPQUFqQixFQUEwQixLQUFPLENBQUEsYUFBQSxDQUFrQixDQUFBLElBQUEsQ0FBbkQsQ0FEUixDQUFBO0FBQUEsTUFFQSxHQUFBLEdBQVEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFYLEVBQWMsSUFBSSxDQUFDLE1BQUwsR0FBYyxDQUE1QixDQUZSLENBQUE7QUFBQSxNQUdBLEdBQUEsR0FBUSxJQUFJLENBQUMsS0FBTCxDQUFXLENBQVgsRUFBYyxJQUFJLENBQUMsTUFBbkIsQ0FIUixDQVBGO0tBQUE7QUFXQSxXQUFPO0FBQUEsTUFBRSxLQUFBLEdBQUY7QUFBQSxNQUFPLEtBQUEsR0FBUDtLQUFQLENBYm9CO0VBQUEsQ0EzbUJ0QixDQUFBO0FBQUEiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIlxuXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuIyBuanNfdXRpbCAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAndXRpbCdcbiMgbmpzX3BhdGggICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ3BhdGgnXG4jIG5qc19mcyAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdmcydcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuQ05EICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2NuZCdcbnJwciAgICAgICAgICAgICAgICAgICAgICAgPSBDTkQucnByXG5iYWRnZSAgICAgICAgICAgICAgICAgICAgID0gJ0hPTExFUklUSC9tYWluJ1xubG9nICAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdwbGFpbicsICAgICBiYWRnZVxuZGVidWcgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdkZWJ1ZycsICAgICBiYWRnZVxud2FybiAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICd3YXJuJywgICAgICBiYWRnZVxuaGVscCAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdoZWxwJywgICAgICBiYWRnZVxudXJnZSAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICd1cmdlJywgICAgICBiYWRnZVxud2hpc3BlciAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICd3aGlzcGVyJywgICBiYWRnZVxuZWNobyAgICAgICAgICAgICAgICAgICAgICA9IENORC5lY2hvLmJpbmQgQ05EXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnN1c3BlbmQgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdjb2ZmZWVub2RlLXN1c3BlbmQnXG5zdGVwICAgICAgICAgICAgICAgICAgICAgID0gc3VzcGVuZC5zdGVwXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkNPREVDICAgICAgICAgICAgICAgICAgICAgPSBAQ09ERUMgPSByZXF1aXJlICcuL2NvZGVjJ1xuRFVNUCAgICAgICAgICAgICAgICAgICAgICA9IEBEVU1QICA9IHJlcXVpcmUgJy4vZHVtcCdcbl9jb2RlY19lbmNvZGUgICAgICAgICAgICAgPSBDT0RFQy5lbmNvZGUuYmluZCBDT0RFQ1xuX2NvZGVjX2RlY29kZSAgICAgICAgICAgICA9IENPREVDLmRlY29kZS5iaW5kIENPREVDXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkQgICAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdwaXBlZHJlYW1zMidcbiQgICAgICAgICAgICAgICAgICAgICAgICAgPSBELnJlbWl0LmJpbmQgRFxuX25ld19sZXZlbF9kYiAgICAgICAgICAgICA9IHJlcXVpcmUgJ2xldmVsJ1xubGV2ZWxkb3duICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2xldmVsL25vZGVfbW9kdWxlcy9sZXZlbGRvd24nXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnN1c3BlbmQgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdjb2ZmZWVub2RlLXN1c3BlbmQnXG5zdGVwICAgICAgICAgICAgICAgICAgICAgID0gc3VzcGVuZC5zdGVwXG5yZXBlYXRfaW1tZWRpYXRlbHkgICAgICAgID0gc3VzcGVuZC5yZXBlYXRfaW1tZWRpYXRlbHlcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuTE9EQVNIICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2xvZGFzaCdcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyMjIGh0dHBzOi8vZ2l0aHViLmNvbS9iM25qNG0vYmxvb20tc3RyZWFtICMjI1xuQmxvb20gICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2Jsb29tLXN0cmVhbSdcblxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBwaHJhc2V0eXBlcyAgICAgID0gWyAncG9zJywgJ3NwbycsIF1cbkBfbWlzZml0ICAgICAgICAgID0gU3ltYm9sICdtaXNmaXQnXG5AX3plcm9fdmFsdWVfYmZyICA9IG5ldyBCdWZmZXIgJ251bGwnXG4jIHdhcm4gXCJtaW5kIGluY29uc2lzdGVuY2llcyBpbiBIT0xMRVJJVEgyL21haW4gQF96ZXJvX2VuYyBldGNcIlxuIyBAX3plcm8gICAgICAgICAgICA9IHRydWUgIyA/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/P1xuIyBAX3plcm9fZW5jICAgICAgICA9IF9jb2RlY19lbmNvZGUgWyBAX3plcm8sICAgIF1cbiMgQF9sb19lbmMgICAgICAgICAgPSBfY29kZWNfZW5jb2RlIFsgbnVsbCwgICAgICBdXG4jIEBfaGlfZW5jICAgICAgICAgID0gX2NvZGVjX2VuY29kZSBbIENPREVDLiwgXVxuIyBAX2xhc3Rfb2N0ZXQgICAgICA9IG5ldyBCdWZmZXIgWyAweGZmLCBdXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQG5ld19kYiA9ICggcm91dGUgKSAtPlxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGxldmVsX3NldHRpbmdzID1cbiAgICAna2V5RW5jb2RpbmcnOiAgICAgICAgICAnYmluYXJ5J1xuICAgICd2YWx1ZUVuY29kaW5nJzogICAgICAgICdiaW5hcnknXG4gICAgJ2NyZWF0ZUlmTWlzc2luZyc6ICAgICAgeWVzXG4gICAgJ2Vycm9ySWZFeGlzdHMnOiAgICAgICAgbm9cbiAgICAnY29tcHJlc3Npb24nOiAgICAgICAgICB5ZXNcbiAgICAnc3luYyc6ICAgICAgICAgICAgICAgICBub1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHN1YnN0cmF0ZSAgICAgICAgICAgPSBfbmV3X2xldmVsX2RiIHJvdXRlLCBsZXZlbF9zZXR0aW5nc1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIFIgPVxuICAgICd+aXNhJzogICAgICAgICAgICdIT0xMRVJJVEgvZGInXG4gICAgJyVzZWxmJzogICAgICAgICAgc3Vic3RyYXRlXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcmV0dXJuIFJcblxuIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQF9yZW9wZW4gPSAoIGRiLCBoYW5kbGVyICkgLT5cbiMgICBzdGVwICggcmVzdW1lICkgPT5cbiMgICAgIHJvdXRlID0gZGJbICclc2VsZicgXVsgJ2xvY2F0aW9uJyBdXG4jICAgICB5aWVsZCBkYlsgJyVzZWxmJyBdLmNsb3NlIHJlc3VtZVxuIyAgICAgeWllbGQgZGJbICclc2VsZicgXS5vcGVuIHJlc3VtZVxuIyAgICAgd2hpc3BlciBcInJlLW9wZW5lZCBMZXZlbERCIGF0ICN7cm91dGV9XCJcbiMgICAgIGhhbmRsZXIgbnVsbFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBjbGVhciA9ICggZGIsIGhhbmRsZXIgKSAtPlxuICBzdGVwICggcmVzdW1lICkgPT5cbiAgICByb3V0ZSA9IGRiWyAnJXNlbGYnIF1bICdsb2NhdGlvbicgXVxuICAgIHdoaXNwZXIgXCJjbG9zaW5nIERCXCJcbiAgICB5aWVsZCBkYlsgJyVzZWxmJyBdLmNsb3NlIHJlc3VtZVxuICAgICMgd2hpc3BlciBcImVyYXNpbmcgREJcIlxuICAgIHlpZWxkIGxldmVsZG93bi5kZXN0cm95IHJvdXRlLCByZXN1bWVcbiAgICAjIHdoaXNwZXIgXCJyZS1vcGVuaW5nIERCXCJcbiAgICB5aWVsZCBkYlsgJyVzZWxmJyBdLm9wZW4gcmVzdW1lXG4gICAgd2hpc3BlciBcImVyYXNlZCBhbmQgcmUtb3BlbmVkIExldmVsREIgYXQgI3tyb3V0ZX1cIlxuICAgIGhhbmRsZXIgbnVsbFxuXG4jICM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyAjIFdSSVRJTkdcbiMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEAkd3JpdGUgPSAoIGRiLCBzZXR0aW5ncyApIC0+XG4jICAgIyMjIEV4cGVjdHMgYSBIb2xsZXJpdGggREIgb2JqZWN0IGFuZCBhbiBvcHRpb25hbCBidWZmZXIgc2l6ZTsgcmV0dXJucyBhIHN0cmVhbSB0cmFuc2Zvcm1lciB0aGF0IGRvZXMgYWxsXG4jICAgb2YgdGhlIGZvbGxvd2luZzpcblxuIyAgICogSXQgZXhwZWN0cyBhbiBTTyBrZXkgZm9yIHdoaWNoIGl0IHdpbGwgZ2VuZXJhdGUgYSBjb3JyZXNwb25kaW5nIE9TIGtleS5cbiMgICAqIEEgY29ycmVzcG9uZGluZyBPUyBrZXkgaXMgZm9ybXVsYXRlZCBleGNlcHQgd2hlbiB0aGUgU08ga2V5J3Mgb2JqZWN0IHZhbHVlIGlzIGEgSlMgb2JqZWN0IC8gYSBQT0QgKHNpbmNlXG4jICAgICBpbiB0aGF0IGNhc2UsIHRoZSB2YWx1ZSBzZXJpYWxpemF0aW9uIGlzIGpvbGx5IHVzZWxlc3MgYXMgYW4gaW5kZXgpLlxuIyAgICogSXQgc2VuZHMgb24gYm90aCB0aGUgU08gYW5kIHRoZSBPUyBrZXkgZG93bnN0cmVhbSBmb3Igb3B0aW9uYWwgZnVydGhlciBwcm9jZXNzaW5nLlxuIyAgICogSXQgZm9ybXMgYSBwcm9wZXIgYG5vZGUtbGV2ZWxgLWNvbXBhdGlibGUgYmF0Y2ggcmVjb3JkIGZvciBlYWNoIGtleSBhbmQgY29sbGVjdCBhbGwgcmVjb3Jkc1xuIyAgICAgaW4gYSBidWZmZXIuXG4jICAgKiBXaGVuZXZlciB0aGUgYnVmZmVyIGhhcyBvdXRncm93biB0aGUgZ2l2ZW4gYnVmZmVyIHNpemUsIHRoZSBidWZmZXIgd2lsbCBiZSB3cml0dGVuIGludG8gdGhlIERCIHVzaW5nXG4jICAgICBgbGV2ZWx1cGAncyBgYmF0Y2hgIGNvbW1hbmQuXG4jICAgKiBXaGVuIHRoZSBsYXN0IHBlbmRpbmcgYmF0Y2ggaGFzIGJlZW4gd3JpdHRlbiBpbnRvIHRoZSBEQiwgdGhlIGBlbmRgIGV2ZW50IGlzIGNhbGxlZCBvbiB0aGUgc3RyZWFtXG4jICAgICBhbmQgbWF5IGJlIGRldGVjdGVkIGRvd25zdHJlYW0uXG5cbiMgICAjIyNcbiMgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgc2V0dGluZ3MgICAgICAgICA/PSB7fVxuIyAgIGJ1ZmZlcl9zaXplICAgICAgID0gc2V0dGluZ3NbICdiYXRjaCcgIF0gPyAxMDAwMFxuIyAgIHNvbGlkX3ByZWRpY2F0ZXMgID0gc2V0dGluZ3NbICdzb2xpZHMnIF0gPyBbXVxuIyAgIGJ1ZmZlciAgICAgICAgICAgID0gW11cbiMgICBzdWJzdHJhdGUgICAgICAgICA9IGRiWyAnJXNlbGYnIF1cbiMgICBiYXRjaF9jb3VudCAgICAgICA9IDBcbiMgICBoYXNfZW5kZWQgICAgICAgICA9IG5vXG4jICAgX3NlbmQgICAgICAgICAgICAgPSBudWxsXG4jICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgIHRocm93IG5ldyBFcnJvciBcImJ1ZmZlciBzaXplIG11c3QgYmUgcG9zaXRpdmUgaW50ZWdlciwgZ290ICN7cnByIGJ1ZmZlcl9zaXplfVwiIHVubGVzcyBidWZmZXJfc2l6ZSA+IDBcbiMgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgcHVzaCA9ICgga2V5LCB2YWx1ZSApID0+XG4jICAgICB2YWx1ZV9iZnIgPSBpZiB2YWx1ZT8gdGhlbiBAX2VuY29kZV92YWx1ZSBkYiwgdmFsdWUgZWxzZSBAX3plcm9fdmFsdWVfYmZyXG4jICAgICBidWZmZXIucHVzaCB7IHR5cGU6ICdwdXQnLCBrZXk6ICggQF9lbmNvZGVfa2V5IGRiLCBrZXkgKSwgdmFsdWU6IHZhbHVlX2JmciwgfVxuIyAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICBmbHVzaCA9ID0+XG4jICAgICBpZiBidWZmZXIubGVuZ3RoID4gMFxuIyAgICAgICBiYXRjaF9jb3VudCArPSArMVxuIyAgICAgICBzdWJzdHJhdGUuYmF0Y2ggYnVmZmVyLCAoIGVycm9yICkgPT5cbiMgICAgICAgICB0aHJvdyBlcnJvciBpZiBlcnJvcj9cbiMgICAgICAgICBiYXRjaF9jb3VudCArPSAtMVxuIyAgICAgICAgIF9zZW5kLmVuZCgpIGlmIGhhc19lbmRlZCBhbmQgYmF0Y2hfY291bnQgPCAxXG4jICAgICAgIGJ1ZmZlciA9IFtdXG4jICAgICBlbHNlXG4jICAgICAgIF9zZW5kLmVuZCgpXG4jICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgIHJldHVybiAkICggc3BvLCBzZW5kLCBlbmQgKSA9PlxuIyAgICAgX3NlbmQgPSBzZW5kXG4jICAgICBpZiBzcG8/XG4jICAgICAgIFsgc2JqLCBwcmQsIG9iaiwgXSA9IHNwb1xuIyAgICAgICBwdXNoIFsgJ3NwbycsIHNiaiwgcHJkLCBdLCBvYmpcbiMgICAgICAgIyMjIFRBSU5UIHdoYXQgdG8gc2VuZCwgaWYgYW55dGhpbmc/ICMjI1xuIyAgICAgICAjIHNlbmQgZW50cnlcbiMgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgICAgIGlmIENORC5pc2FfcG9kIG9ialxuIyAgICAgICAgICMjIyBEbyBub3QgY3JlYXRlIGluZGV4IGVudHJpZXMgaW4gY2FzZSBgb2JqYCBpcyBhIFBPRDogIyMjXG4jICAgICAgICAgbnVsbFxuIyAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICAgICAgZWxzZSBpZiBDTkQuaXNhX2xpc3Qgb2JqXG4jICAgICAgICAgaWYgcHJkIGluIHNvbGlkX3ByZWRpY2F0ZXNcbiMgICAgICAgICAgIHB1c2ggWyAncG9zJywgcHJkLCBvYmosIHNiaiwgXVxuIyAgICAgICAgIGVsc2VcbiMgICAgICAgICAgICMjIyBDcmVhdGUgb25lIGluZGV4IGVudHJ5IGZvciBlYWNoIGVsZW1lbnQgaW4gY2FzZSBgb2JqYCBpcyBhIGxpc3Q6ICMjI1xuIyAgICAgICAgICAgZm9yIG9ial9lbGVtZW50LCBvYmpfaWR4IGluIG9ialxuIyAgICAgICAgICAgICBwdXNoIFsgJ3BvcycsIHByZCwgb2JqX2VsZW1lbnQsIHNiaiwgb2JqX2lkeCwgXVxuIyAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICAgICAgZWxzZVxuIyAgICAgICAgICMjIyBDcmVhdGUgb25lIGluZGV4IGVudHJ5IGZvciBgb2JqYCBvdGhlcndpc2U6ICMjI1xuIyAgICAgICAgIHB1c2ggWyAncG9zJywgcHJkLCBvYmosIHNiaiwgXVxuIyAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICAgICAgZmx1c2goKSBpZiBidWZmZXIubGVuZ3RoID49IGJ1ZmZlcl9zaXplXG4jICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgICAgIyMjIEZsdXNoIHJlbWFpbmluZyBidWZmZXJlZCBlbnRyaWVzIHRvIERCICMjI1xuIyAgICAgaWYgZW5kP1xuIyAgICAgICBoYXNfZW5kZWQgPSB5ZXNcbiMgICAgICAgZmx1c2goKVxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyBXUklUSU5HXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkAkd3JpdGUgPSAoIGRiLCBzZXR0aW5ncyApIC0+XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc2V0dGluZ3MgICAgICAgICA/PSB7fVxuICBidWZmZXJfc2l6ZSAgICAgICA9IHNldHRpbmdzWyAnYmF0Y2gnICBdID8gMTAwMDBcbiAgc29saWRfcHJlZGljYXRlcyAgPSBzZXR0aW5nc1sgJ3NvbGlkcycgXSA/IFtdXG4gIHN1YnN0cmF0ZSAgICAgICAgID0gZGJbICclc2VsZicgXVxuICBSICAgICAgICAgICAgICAgICA9IEQuY3JlYXRlX3Rocm91Z2hzdHJlYW0oKVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGlmIGJ1ZmZlcl9zaXplIDwgMFxuICAgIHRocm93IG5ldyBFcnJvciBcImJ1ZmZlciBzaXplIG11c3QgYmUgcG9zaXRpdmUgaW50ZWdlciwgZ290ICN7cnByIGJ1ZmZlcl9zaXplfVwiXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZWxzZSBpZiBidWZmZXJfc2l6ZSA8IDJcbiAgICAkd3JpdGUgPSA9PlxuICAgICAgcmV0dXJuICQgKCBmYWNldF9iZnJzLCBzZW5kLCBlbmQgKSA9PlxuICAgICAgICBpZiBmYWNldF9iZnJzP1xuICAgICAgICAgIHN1YnN0cmF0ZS5wdXQgZmFjZXRfYmZycy4uLiwgPT5cbiAgICAgICAgICAgIGlmIGVuZD9cbiAgICAgICAgICAgICAgZW5kKClcbiAgICAgICAgZWxzZSBpZiBlbmQ/XG4gICAgICAgICAgZW5kKClcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBlbHNlXG4gICAgJHdyaXRlID0gPT5cbiAgICAgIGJ1ZmZlciA9IFtdXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIGZsdXNoID0gKCBzZW5kLCBlbmQgKSA9PlxuICAgICAgICBfYnVmZmVyID0gYnVmZmVyXG4gICAgICAgIGJ1ZmZlciAgPSBbXVxuICAgICAgICBzdWJzdHJhdGUuYmF0Y2ggX2J1ZmZlciwgKCBlcnJvciApID0+XG4gICAgICAgICAgc2VuZC5lcnJvciBlcnJvciBpZiBlcnJvcj9cbiAgICAgICAgICBpZiBlbmQ/XG4gICAgICAgICAgICBlbmQoKVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICByZXR1cm4gJCAoIGZhY2V0X2JmcnMsIHNlbmQsIGVuZCApID0+XG4gICAgICAgIGlmIGZhY2V0X2JmcnM/XG4gICAgICAgICAgWyBrZXlfYmZyLCB2YWx1ZV9iZnIsIF0gPSBmYWNldF9iZnJzXG4gICAgICAgICAgYnVmZmVyLnB1c2ggeyB0eXBlOiAncHV0Jywga2V5OiBrZXlfYmZyLCB2YWx1ZTogdmFsdWVfYmZyLCB9XG4gICAgICAgICAgaWYgYnVmZmVyLmxlbmd0aCA+PSBidWZmZXJfc2l6ZVxuICAgICAgICAgICAgZmx1c2ggc2VuZCwgZW5kXG4gICAgICAgIGVsc2UgaWYgZW5kP1xuICAgICAgICAgIGlmIGJ1ZmZlci5sZW5ndGggPiAwXG4gICAgICAgICAgICBmbHVzaCBzZW5kLCBlbmRcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBzZXRJbW1lZGlhdGUgZW5kXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgUlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgLnBpcGUgJCAoIHNwbywgc2VuZCApID0+XG4gICAgICAjIyMgQW5hbHl6ZSBTUE8ga2V5IGFuZCBzZW5kIGFsbCBuZWNlc3NhcnkgUE9TIGZhY2V0czogIyMjXG4gICAgICBbIHNiaiwgcHJkLCBvYmosIF0gPSBzcG9cbiAgICAgIHNlbmQgWyBbICdzcG8nLCBzYmosIHByZCwgXSwgb2JqLCBdXG4gICAgICBvYmpfdHlwZSA9IENORC50eXBlX29mIG9ialxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICB1bmxlc3Mgb2JqX3R5cGUgaXMgJ3BvZCdcbiAgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgICBpZiAoIG9ial90eXBlIGlzICdsaXN0JyApIGFuZCBub3QgKCBwcmQgaW4gc29saWRfcHJlZGljYXRlcyApXG4gICAgICAgICAgZm9yIG9ial9lbGVtZW50LCBvYmpfaWR4IGluIG9ialxuICAgICAgICAgICAgc2VuZCBbIFsgJ3BvcycsIHByZCwgb2JqX2VsZW1lbnQsIHNiaiwgb2JqX2lkeCwgXSwgXVxuICAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBzZW5kIFsgWyAncG9zJywgcHJkLCBvYmosIHNiaiwgXSwgXVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgLnBpcGUgJCAoIGZhY2V0LCBzZW5kICkgPT5cbiAgICAgICMjIyBFbmNvZGUgZmFjZXQ6ICMjI1xuICAgICAgWyBrZXksIHZhbHVlLCBdID0gZmFjZXRcbiAgICAgIGtleV9iZnIgICAgICAgICA9IEBfZW5jb2RlX2tleSBkYiwga2V5XG4gICAgICB2YWx1ZV9iZnIgICAgICAgPSBpZiB2YWx1ZT8gdGhlbiBAX2VuY29kZV92YWx1ZSBkYiwgdmFsdWUgZWxzZSBAX3plcm9fdmFsdWVfYmZyXG4gICAgICBzZW5kIFsga2V5X2JmciwgdmFsdWVfYmZyLCBdXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAucGlwZSBAXyRkZWZlcigpXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAucGlwZSAkd3JpdGUoKVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHJldHVybiBSXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF8kZGVmZXIgPSAtPlxuICBjb3VudCA9IDBcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBlbmRfbGF0ZXIgPSAoIGVuZCApID0+XG4gICAgIyBkZWJ1ZyAnwqlLZmdRNScsIGNvdW50XG4gICAgaWYgY291bnQgPD0gMFxuICAgICAgZW5kKClcbiAgICBlbHNlXG4gICAgICBzZXRJbW1lZGlhdGUgPT4gZW5kX2xhdGVyIGVuZFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIFIgPSBELmNyZWF0ZV90aHJvdWdoc3RyZWFtKClcbiAgICAucGlwZSAkICggZGF0YSwgc2VuZCwgZW5kICkgPT5cbiAgICAgIGlmIGRhdGE/XG4gICAgICAgIGNvdW50ICs9ICsxXG4gICAgICAgICMgZGVidWcgJ8KpaTZzbmEnLCBjb3VudFxuICAgICAgICBzZXRJbW1lZGlhdGUgPT5cbiAgICAgICAgICBzZW5kIGRhdGFcbiAgICAgICAgICBjb3VudCArPSAtMVxuICAgICAgICAgICMgZGVidWcgJ8Kpd1NRVksnLCBjb3VudFxuICAgICAgaWYgZW5kP1xuICAgICAgICBlbmRfbGF0ZXIgZW5kXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF8kZW5zdXJlX3VuaXF1ZSA9ICggZGIgKSAtPlxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICMgYmxvb20gICA9IEJsb29tLmZvckNhcGFjaXR5IDFlNywgMC4xXG4gIGJsb29tICAgICA9IEJsb29tLmZvckNhcGFjaXR5IDFlMSwgMVxuICBycV9jb3VudCAgPSAwXG4gIHF1ZXVlICAgICA9IFtdXG4gIF9lbmQgICAgICA9IG51bGxcbiAgX3NlbmQgICAgID0gbnVsbFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHByb2Nlc3NfcXVldWUgPSA9PlxuICAgIGlmIHF1ZXVlLmxlbmd0aCA+PSAxXG4gICAgICBbIGtleV9iZnIsIF8sIF0gPSBxdWV1ZS5wb3AoKVxuICAgICAgaWYgYmxvb20uaGFzIGtleV9iZnJcbiAgICAgICAgcnFfY291bnQgKz0gKzFcblxuICAgIGlmIF9lbmQ/IGFuZCBycV9jb3VudCA8PSAwIGFuZCBxdWV1ZS5sZW5ndGggPD0gMFxuICAgICAgX2VuZCgpXG4gICAgICByZXR1cm5cbiAgICBzZXRJbW1lZGlhdGUgcHJvY2Vzc19xdWV1ZVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIFIgPSBELmNyZWF0ZV90aHJvdWdoc3RyZWFtKClcbiAgICAucGlwZSAkICggZGF0YSwgc2VuZCwgZW5kICkgPT5cbiAgICAgIGlmIGRhdGE/XG4gICAgICAgIHNldEltbWVkaWF0ZSA9PlxuICAgICAgICAgICMgZGVidWcgJ8KpcXQ5WDcnLCBycHIgZGF0YVxuICAgICAgICAgIHNlbmQgZGF0YVxuICAgICAgICAgICMgZW5kKCkgaWYgZW5kP1xuICAgICAgaWYgZW5kP1xuICAgICAgICBzZXRJbW1lZGlhdGUgPT5cbiAgICAgICAgICBlbmQoKVxuICAjICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgIyAgIC5waXBlICQgKCBmYWNldF9iZnJzLCBzZW5kLCBlbmQgKSA9PlxuICAjICAgICBfc2VuZCA9IHNlbmRcbiAgIyAgICAgaWYgZmFjZXRfYmZycz9cbiAgIyAgICAgICBkZWJ1ZyAnwqludVNJaicsIGZhY2V0X2JmcnNcbiAgIyAgICAgICBxdWV1ZS51bnNoaWZ0IGZhY2V0X2JmcnNcbiAgIyAgICAgaWYgZW5kP1xuICAjICAgICAgIF9lbmQgPSBlbmRcbiAgIyAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICMgcHJvY2Vzc19xdWV1ZSgpXG4gIHJldHVybiBSXG5cbiMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEBfJGVuc3VyZV91bmlxdWUgPSAoIGRiICkgLT5cbiMgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgIyBibG9vbSAgID0gQmxvb20uZm9yQ2FwYWNpdHkgMWU3LCAwLjFcbiMgICBibG9vbSAgICAgPSBCbG9vbS5mb3JDYXBhY2l0eSAxZTEsIDFcbiMgICBycV9jb3VudCAgPSAwXG4jICAgYnVmZmVyICAgID0gW11cbiMgICBfZW5kICAgICAgPSBudWxsXG4jICAgX3NlbmQgICAgID0gbnVsbFxuIyAgIFIgICAgICAgICA9IEQuY3JlYXRlX3Rocm91Z2hzdHJlYW0oKVxuIyAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICBmbHVzaCA9ID0+XG4jICAgICByZXR1cm4gaWYgYnVmZmVyLmxlbmd0aCBpcyAwXG4jICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgICAgaWYgcnFfY291bnQgPiAwXG4jICAgICAgIHNldEltbWVkaWF0ZSBmbHVzaFxuIyAgICAgICByZXR1cm4gbnVsbFxuIyAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICAgIF9zZW5kIGJ1ZmZlci5wb3AoKVxuIyAgICAgc2V0SW1tZWRpYXRlIGZsdXNoXG4jICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgICAgcmV0dXJuIG51bGxcbiMgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgUlxuIyAgICAgLnBpcGUgJCAoIGZhY2V0X2JmcnMsIHNlbmQsIGVuZCApID0+XG4jICAgICAgIF9zZW5kID0gc2VuZFxuIyAgICAgICBpZiBmYWNldF9iZnJzP1xuIyAgICAgICAgIGJ1ZmZlci5zcGxpY2UgMCwgMCwgZmFjZXRfYmZyc1xuIyAgICAgICBmbHVzaCgpXG4jICAgICAgIGlmIGVuZD9cbiMgICAgICAgICBmbHVzaCgpXG4jICAgICAucGlwZSAkICggZmFjZXRfYmZycywgc2VuZCwgZW5kICkgPT5cbiMgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLCxcbiMgICAgICAgaWYgZmFjZXRfYmZycz9cbiMgICAgICAgICBbIGtleV9iZnIsIF8sIF0gICA9IGZhY2V0X2JmcnNcbiMgICAgICAgICBtYXlfYmVfa25vd25fa2V5ICA9IGJsb29tLmhhcyBrZXlfYmZyXG4jICAgICAgICAgYmxvb20ud3JpdGUga2V5X2JmclxuIyAgICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgICAgICAgIGlmIG1heV9iZV9rbm93bl9rZXlcbiMgICAgICAgICAgIHJxX2NvdW50ICs9ICsxXG4jICAgICAgICAgICBkZWJ1ZyAnwqlRUzZrRicsICdtYXlfYmVfa25vd25fa2V5JywgcnFfY291bnQsIEBfZGVjb2RlX2tleSBkYiwga2V5X2JmclxuIyAgICAgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgICAgICAgICAgZGJbICclc2VsZicgXS5nZXQga2V5X2JmciwgKCBlcnJvciApID0+XG4jICAgICAgICAgICAgIHJxX2NvdW50ICs9IC0xXG4jICAgICAgICAgICAgIGRlYnVnICfCqVFTNmtGJywgJ21heV9iZV9rbm93bl9rZXknLCBycV9jb3VudCwgX2VuZD8sIEBfZGVjb2RlX2tleSBkYiwga2V5X2JmclxuIyAgICAgICAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgICAgICAgICAgICBpZiBlcnJvcj9cbiMgICAgICAgICAgICAgICBpZiBlcnJvclsgJ3R5cGUnIF0gaXMgJ05vdEZvdW5kRXJyb3InXG4jICAgICAgICAgICAgICAgICB1cmdlICfCqTlkMFVxJywgJ3NlbmRpbmcnLCBAX2RlY29kZV9rZXkgZGIsIGtleV9iZnJcbiMgICAgICAgICAgICAgICAgIHNlbmQgZmFjZXRfYmZyc1xuIyAgICAgICAgICAgICAgIGVsc2VcbiMgICAgICAgICAgICAgICAgIHNlbmQuZXJyb3IgZXJyb3JcbiMgICAgICAgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICAgICAgICAgICAgZWxzZVxuIyAgICAgICAgICAgICAgIHNlbmQuZXJyb3IgbmV3IEVycm9yIFwia2V5IGFscmVhZHkgaW4gREI6ICN7cnByIEBfZGVjb2RlX2tleSBkYiwga2V5X2Jmcn1cIlxuIyAgICAgICAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgICAgICAgICAgICBpZiBycV9jb3VudCA8PSAwIGFuZCBfZW5kP1xuIyAgICAgICAgICAgICAgICMgd2FybiAnwqlKT1FMYi0xJywgJ2VuZCdcbiMgICAgICAgICAgICAgICBibG9vbS5lbmQoKVxuIyAgICAgICAgICAgICAgICMgX2VuZCgpXG4jICAgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgICAgICAgZWxzZVxuIyAgICAgICAgICAgc2VuZCBmYWNldF9iZnJzXG4jICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLiwsXG4jICAgICAgIGlmIGVuZD9cbiMgICAgICAgICAjIyMgVEFJTlQgc2hvdWxkIHdyaXRlIGJsb29tLmV4cG9ydCB0byBEQiAjIyNcbiMgICAgICAgICBkZWJ1ZyAnwqlkSmNiaycsIGJ1ZmZlclxuIyAgICAgICAgIGlmIHJxX2NvdW50ID4gMFxuIyAgICAgICAgICAgX2VuZCA9IGVuZFxuIyAgICAgICAgIGVsc2VcbiMgICAgICAgICAgIHdhcm4gJ8KpSk9RTGItMicsICdlbmQnXG4jICAgICAgICAgICBibG9vbS5lbmQoKVxuIyAgICAgICAgICAgZW5kKClcbiMgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgcmV0dXJuIFJcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIFJFQURJTkdcbiMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEBjcmVhdGVfa2V5c3RyZWFtID0gKCBkYiwgbG9faGludCA9IG51bGwsIGhpX2hpbnQgPSBudWxsICkgLT5cbiMgICAjIyMgVEFJTlQgY29kZSBkdXBsaWNhdGlvbiAjIyNcbiMgICBpZiBsb19oaW50P1xuIyAgICAgaWYgaGlfaGludD9cbiMgICAgICAgcXVlcnkgPSB7IGd0ZTogbG9faGludCwgbHRlOmhpX2hpbnQsIH1cbiMgICAgIGVsc2VcbiMgICAgICAgcXVlcnkgPSB7IGd0ZTogbG9faGludCwgfVxuIyAgIGVsc2UgaWYgaGlfaGludD9cbiMgICAgIHF1ZXJ5ID0geyBsdGU6IGhpX2hpbnQsIH1cbiMgICBlbHNlXG4jICAgICBxdWVyeSA9IG51bGxcbiMgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgZGVidWcgJ8KpODM1SlAnLCBxdWVyeVxuIyAgIFIgPSBpZiBxdWVyeT8gdGhlbiAoIGRiWyAnJXNlbGYnIF0uY3JlYXRlS2V5U3RyZWFtIHF1ZXJ5ICkgZWxzZSBkYlsgJyVzZWxmJyBdLmNyZWF0ZUtleVN0cmVhbSgpXG4jICAgIyBSID0gZGJbICclc2VsZicgXS5jcmVhdGVLZXlTdHJlYW0gQG5ld19xdWVyeSBkYiwgcXVlcnlcbiMgICAjIyMgVEFJTlQgU2hvdWxkIHdlIHRlc3QgZm9yIHdlbGwtZm9ybWVkIGVudHJpZXMgaGVyZT8gIyMjXG4jICAgUiA9IFIucGlwZSAkICggYmtleSwgc2VuZCApID0+IHNlbmQgQF9kZWNvZGVfa2V5IGRiLCBia2V5XG4jICAgcmV0dXJuIFJcblxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBjcmVhdGVfcGhyYXNlc3RyZWFtID0gKCBkYiwgbG9faGludCA9IG51bGwsIGhpX2hpbnQgPSBudWxsLCBzZXR0aW5ncyApIC0+XG4gIGlucHV0ID0gQGNyZWF0ZV9mYWNldHN0cmVhbSBkYiwgbG9faGludCwgaGlfaGludCwgc2V0dGluZ3NcbiAgUiA9IGlucHV0XG4gICAgLnBpcGUgQCRhc19waHJhc2UgZGJcbiAgUlsgJyVtZXRhJyBdID0gaW5wdXRbICclbWV0YScgXVxuICByZXR1cm4gUlxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBjcmVhdGVfZmFjZXRzdHJlYW0gPSAoIGRiLCBsb19oaW50ID0gbnVsbCwgaGlfaGludCA9IG51bGwsIHNldHRpbmdzICkgLT5cbiAgIyMjXG4gICogSWYgbmVpdGVyIGBsb2Agbm9yIGBoaWAgaXMgZ2l2ZW4sIHRoZSBzdHJlYW0gd2lsbCBpdGVyYXRlIG92ZXIgYWxsIGVudHJpZXMuXG4gICogSWYgYm90aCBgbG9gIGFuZCBgaGlgIGFyZSBnaXZlbiwgYSBxdWVyeSB3aXRoIGxvd2VyIGFuZCB1cHBlciwgaW5jbHVzaXZlIGJvdW5kYXJpZXMgaXNcbiAgICBpc3N1ZWQuXG4gICogSWYgb25seSBgbG9gIGlzIGdpdmVuLCBhIHByZWZpeCBxdWVyeSBpcyBpc3N1ZWQuXG4gICogSWYgYGhpYCBpcyBnaXZlbiBidXQgYGxvYCBpcyBtaXNzaW5nLCBhbiBlcnJvciBpcyBpc3N1ZWQuXG4gICMjI1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGlmIGhpX2hpbnQ/IGFuZCBub3QgbG9faGludD9cbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJtdXN0IGdpdmUgYGxvX2hpbnRgIHdoZW4gYGhpX2hpbnRgIGlzIGdpdmVuXCJcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBpZiBsb19oaW50PyBhbmQgbm90IGhpX2hpbnQ/XG4gICAgcXVlcnkgICAgICAgPSBAX3F1ZXJ5X2Zyb21fcHJlZml4IGRiLCBsb19oaW50XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZWxzZSBpZiBsb19oaW50PyBhbmQgaGlfaGludCBpcyAnKidcbiAgICBxdWVyeSAgICAgICA9IEBfcXVlcnlfZnJvbV9wcmVmaXggZGIsIGxvX2hpbnQsICcqJ1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGVsc2VcbiAgICBsb19oaW50X2JmciA9IGlmIGxvX2hpbnQ/IHRoZW4gKCAgICAgICAgQF9lbmNvZGVfa2V5IGRiLCBsb19oaW50ICkgICAgICAgICAgZWxzZSBudWxsXG4gICAgaGlfaGludF9iZnIgPSBpZiBoaV9oaW50PyB0aGVuICggQF9xdWVyeV9mcm9tX3ByZWZpeCBkYiwgaGlfaGludCApWyAnbHRlJyBdIGVsc2UgbnVsbFxuICAgICMgbG9faGludF9iZnIgPSBpZiBsb19oaW50PyB0aGVuICggICAgICAgIEBfZW5jb2RlX2tleSBkYiwgbG9faGludCApICAgICAgICAgIGVsc2UgQ09ERUNbICdrZXlzJyBdWyAnbG8nIF1cbiAgICAjIGhpX2hpbnRfYmZyID0gaWYgaGlfaGludD8gdGhlbiAoIEBfcXVlcnlfZnJvbV9wcmVmaXggZGIsIGhpX2hpbnQgKVsgJ2x0ZScgXSBlbHNlIENPREVDWyAna2V5cycgXVsgJ2hpJyBdXG4gICAgcXVlcnkgICAgICAgPSB7IGd0ZTogbG9faGludF9iZnIsIGx0ZTogaGlfaGludF9iZnIsIH1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAjIyMgVEFJTlQgU2hvdWxkIHdlIHRlc3QgZm9yIHdlbGwtZm9ybWVkIGVudHJpZXMgaGVyZT8gIyMjXG4gIFIgPSBkYlsgJyVzZWxmJyBdLmNyZWF0ZVJlYWRTdHJlYW0gcXVlcnlcbiAgUiA9IFIucGlwZSAkICggeyBrZXksIHZhbHVlIH0sIHNlbmQgKSA9PiBzZW5kIFsgKCBAX2RlY29kZV9rZXkgZGIsIGtleSApLCAoIEBfZGVjb2RlX3ZhbHVlIGRiLCB2YWx1ZSApLCBdXG4gIFJbICclbWV0YScgXSA9IHt9XG4gIFJbICclbWV0YScgXVsgJ3F1ZXJ5JyBdID0gcXVlcnlcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICByZXR1cm4gUlxuXG4jICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBAcmVhZF9tYW55ID0gKCBkYiwgaGludCA9IG51bGwgKSAtPlxuIyAgICMjIyBIaW50cyBhcmUgaW50ZXJwcmV0ZWQgYXMgcGFydGlhbCBzZWNvbmRhcnkgKFBPUykga2V5cy4gIyMjXG5cbiMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEBfcmVhZF9vbmUgPSAoIGRiLCBrZXksIGZhbGxiYWNrID0gQF9taXNmaXQsIGhhbmRsZXIgKSAtPlxuIyAgIHN3aXRjaCBhcml0eSA9IGFyZ3VtZW50cy5sZW5ndGhcbiMgICAgIHdoZW4gM1xuIyAgICAgICBoYW5kbGVyICAgPSBmYWxsYmFja1xuIyAgICAgICBmYWxsYmFjayAgPSBAX21pc2ZpdFxuIyAgICAgd2hlbiA0IHRoZW4gbnVsbFxuIyAgICAgZWxzZSB0aHJvdyBuZXcgRXJyb3IgXCJleHBlY3RlZCAzIG9yIDQgYXJndW1lbnRzLCBnb3QgI3thcml0eX1cIlxuIyAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICBkYlsgJyVzZWxmJyBdLmdldCBrZXksIGhhbmRsZXJcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AcmVhZF9zdWIgPSAoIGRiLCBzZXR0aW5ncywgcmVhZCApIC0+XG4gIHN3aXRjaCBhcml0eSA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICB3aGVuIDJcbiAgICAgIHJlYWQgICAgICA9IHNldHRpbmdzXG4gICAgICBzZXR0aW5ncyAgPSBudWxsXG4gICAgd2hlbiAzXG4gICAgICBudWxsXG4gICAgZWxzZVxuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiZXhwZWN0ZWQgMiBvciAzIGFyZ3VtZW50cywgZ290ICN7YXJpdHl9XCJcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBpbmRleGVkICAgICAgICAgICA9IHNldHRpbmdzP1sgJ2luZGV4ZWQnICAgIF0gPyBub1xuICAjIHRyYW5zZm9ybSAgICAgICAgID0gc2V0dGluZ3M/WyAndHJhbnNmb3JtJyAgXSA/IEQuJHBhc3NfdGhyb3VnaCgpXG4gIG1hbmdsZSAgICAgICAgICAgID0gc2V0dGluZ3M/WyAnbWFuZ2xlJyAgICAgXSA/ICggZGF0YSApIC0+IGRhdGFcbiAgc2VuZF9lbXB0eSAgICAgICAgPSBzZXR0aW5ncz9bICdlbXB0eScgICAgICBdID8gbm9cbiAgaW5zZXJ0X2luZGV4ICAgICAgPSBpZiBpbmRleGVkIHRoZW4gRC5uZXdfaW5kZXhlcigpIGVsc2UgKCB4ICkgLT4geFxuICBvcGVuX3N0cmVhbV9jb3VudCA9IDBcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICByZXR1cm4gJCAoIG91dGVyX2RhdGEsIG91dGVyX3NlbmQsIG91dGVyX2VuZCApID0+XG4gICAgY291bnQgPSAwXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpZiBvdXRlcl9kYXRhP1xuICAgICAgb3Blbl9zdHJlYW1fY291bnQgICAgKz0gKzFcbiAgICAgIHN1Yl9pbnB1dCAgICAgICAgICAgICA9IHJlYWQgb3V0ZXJfZGF0YVxuICAgICAgWyBtZW1vLCBzdWJfaW5wdXQsIF0gID0gaWYgQ05ELmlzYV9saXN0IHN1Yl9pbnB1dCB0aGVuIHN1Yl9pbnB1dCBlbHNlIFsgQF9taXNmaXQsIHN1Yl9pbnB1dCwgXVxuICAgICAgc3ViX2lucHV0XG4gICAgICAgICMgLnBpcGUgdHJhbnNmb3JtXG4gICAgICAgIC5waXBlIGRvID0+XG4gICAgICAgICAgIyMjIFRBSU5UIG5vIG5lZWQgdG8gYnVpbGQgYnVmZmVyIGlmIG5vdCBgc2VuZF9lbXB0eWAgYW5kIHRoZXJlIGFyZSBubyByZXN1bHRzICMjI1xuICAgICAgICAgIGJ1ZmZlciA9IGlmIG1lbW8gaXMgQF9taXNmaXQgdGhlbiBbXSBlbHNlIFsgbWVtbywgXVxuICAgICAgICAgIHJldHVybiAkICggaW5uZXJfZGF0YSwgXywgaW5uZXJfZW5kICkgPT5cbiAgICAgICAgICAgIGlmIGlubmVyX2RhdGE/XG4gICAgICAgICAgICAgIGlubmVyX2RhdGEgPSBtYW5nbGUgaW5uZXJfZGF0YVxuICAgICAgICAgICAgICBpZiBpbm5lcl9kYXRhP1xuICAgICAgICAgICAgICAgIGNvdW50ICs9ICsxXG4gICAgICAgICAgICAgICAgYnVmZmVyLnB1c2ggaW5uZXJfZGF0YVxuICAgICAgICAgICAgaWYgaW5uZXJfZW5kP1xuICAgICAgICAgICAgICBpZiBzZW5kX2VtcHR5IG9yIGNvdW50ID4gMFxuICAgICAgICAgICAgICAgIG91dGVyX3NlbmQgaW5zZXJ0X2luZGV4IGJ1ZmZlclxuICAgICAgICAgICAgICBvcGVuX3N0cmVhbV9jb3VudCArPSAtMVxuICAgICAgICAgICAgICBpbm5lcl9lbmQoKVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaWYgb3V0ZXJfZW5kP1xuICAgICAgcmVwZWF0X2ltbWVkaWF0ZWx5IC0+XG4gICAgICAgIHJldHVybiB0cnVlIHVubGVzcyBvcGVuX3N0cmVhbV9jb3VudCBpcyAwXG4gICAgICAgIG91dGVyX2VuZCgpXG4gICAgICAgIHJldHVybiBmYWxzZVxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyBLRVlTICYgVkFMVUVTXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfZW5jb2RlX2tleSA9ICggZGIsIGtleSwgZXh0cmFfYnl0ZSApIC0+XG4gIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwga2V5ICN7cnByIGtleX1cIiBpZiBrZXkgaXMgdW5kZWZpbmVkXG4gIHJldHVybiBfY29kZWNfZW5jb2RlIGtleSwgZXh0cmFfYnl0ZVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfZGVjb2RlX2tleSA9ICggZGIsIGtleSApIC0+XG4gIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwga2V5ICN7cnByIGtleX1cIiBpZiAoIFIgPSBfY29kZWNfZGVjb2RlIGtleSApIGlzIHVuZGVmaW5lZFxuICByZXR1cm4gUlxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfZW5jb2RlX3ZhbHVlID0gKCBkYiwgdmFsdWUgICAgICApIC0+IG5ldyBCdWZmZXIgKCBKU09OLnN0cmluZ2lmeSB2YWx1ZSApLCAndXRmLTgnXG5AX2RlY29kZV92YWx1ZSA9ICggZGIsIHZhbHVlX2JmciAgKSAtPiBKU09OLnBhcnNlIHZhbHVlX2Jmci50b1N0cmluZyAndXRmLTgnXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyMjIE5CIEFyZ3VtZW50IG9yZGVyaW5nIGZvciB0aGVzZSBmdW5jdGlvbiBpcyBhbHdheXMgc3ViamVjdCBiZWZvcmUgb2JqZWN0LCByZWdhcmRsZXNzIG9mIHRoZSBwaHJhc2V0eXBlXG5hbmQgdGhlIG9yZGVyaW5nIGluIHRoZSByZXN1bHRpbmcga2V5LiAjIyNcbkBuZXdfa2V5ID0gKCBkYiwgcGhyYXNldHlwZSwgc2ssIHN2LCBvaywgb3YsIGlkeCApIC0+XG4gIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgcGhyYXNldHlwZTogI3tycHIgcGhyYXNldHlwZX1cIiB1bmxlc3MgcGhyYXNldHlwZSBpbiBbICdzbycsICdvcycsIF1cbiAgWyBzaywgc3YsIG9rLCBvdiwgXSA9IFsgb2ssIG92LCBzaywgc3YsIF0gaWYgcGhyYXNldHlwZSBpcyAnb3MnXG4gIHJldHVybiBbIHBocmFzZXR5cGUsIHNrLCBzdiwgb2ssIG92LCAoIGlkeCA/IDAgKSwgXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBuZXdfc29fa2V5ID0gKCBkYiwgUC4uLiApIC0+IEBuZXdfa2V5IGRiLCAnc28nLCBQLi4uXG5AbmV3X29zX2tleSA9ICggZGIsIFAuLi4gKSAtPiBAbmV3X2tleSBkYiwgJ29zJywgUC4uLlxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfbmV3X29zX2tleV9mcm9tX3NvX2tleSA9ICggZGIsIHNvX2tleSApIC0+XG4gIFsgcGhyYXNldHlwZSwgc2ssIHN2LCBvaywgb3YsIGlkeCwgXSA9IEBhc19waHJhc2UgZGIsIHNvX2tleVxuICB0aHJvdyBuZXcgRXJyb3IgXCJleHBlY3RlZCBwaHJhc2V0eXBlICdzbycsIGdvdCAje3JwciBwaHJhc2V0eXBlfVwiIHVubGVzcyBwaHJhc2V0eXBlIGlzICdzbydcbiAgcmV0dXJuIFsgJ29zJywgb2ssIG92LCBzaywgc3YsIGlkeCwgXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBuZXdfa2V5cyA9ICggZGIsIHBocmFzZXR5cGUsIHNrLCBzdiwgb2ssIG92LCBpZHggKSAtPlxuICBvdGhlcl9waHJhc2V0eXBlICA9IGlmIHBocmFzZXR5cGUgaXMgJ3NvJyB0aGVuICdvcycgZWxzZSAnc28nXG4gIHJldHVybiBbXG4gICAgKCBAbmV3X2tleSBkYiwgICAgICAgcGhyYXNldHlwZSwgc2ssIHN2LCBvaywgb3YsIGlkeCApLFxuICAgICggQG5ld19rZXkgZGIsIG90aGVyX3BocmFzZXR5cGUsIHNrLCBzdiwgb2ssIG92LCBpZHggKSwgXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBhc19waHJhc2UgPSAoIGRiLCBrZXksIHZhbHVlLCBub3JtYWxpemUgPSB5ZXMgKSAtPlxuICBzd2l0Y2ggcGhyYXNldHlwZSA9IGtleVsgMCBdXG4gICAgd2hlbiAnc3BvJ1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBTUE8ga2V5IChsZW5ndGggI3tsZW5ndGh9KVwiIHVubGVzcyAoIGxlbmd0aCA9IGtleS5sZW5ndGggKSBpcyAzXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIHZhbHVlICgxKSAje3JwciB2YWx1ZX1cIiBpZiB2YWx1ZSBpbiBbIHVuZGVmaW5lZCwgXVxuICAgICAgcmV0dXJuIFsgcGhyYXNldHlwZSwga2V5WyAxIF0sIGtleVsgMiBdLCB2YWx1ZSwgXVxuICAgIHdoZW4gJ3BvcydcbiAgICAgIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgUE9TIGtleSAobGVuZ3RoICN7bGVuZ3RofSlcIiB1bmxlc3MgNCA8PSAoIGxlbmd0aCA9IGtleS5sZW5ndGggKSA8PSA1XG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIHZhbHVlICgyKSAje3JwciB2YWx1ZX1cIiBpZiBub3QgKCB2YWx1ZSBpbiBbIG51bGwsIF0gKVxuICAgICAgcmV0dXJuIFsgcGhyYXNldHlwZSwga2V5WyAzIF0sIGtleVsgMSBdLCBrZXlbIDIgXSwga2V5WyA0IF0sIF0gaWYga2V5WyA0IF0/XG4gICAgICByZXR1cm4gWyBwaHJhc2V0eXBlLCBrZXlbIDMgXSwga2V5WyAxIF0sIGtleVsgMiBdLCBdXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQCRhc19waHJhc2UgPSAoIGRiICkgLT5cbiAgcmV0dXJuICQgKCBkYXRhLCBzZW5kICkgPT5cbiAgICBzZW5kIEBhc19waHJhc2UgZGIsIGRhdGEuLi5cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5Aa2V5X2Zyb21fdXJsID0gKCBkYiwgdXJsICkgLT5cbiAgIyMjIFRBSU4gZG9lcyBub3QgdW5lc2NhcGUgYXMgeWV0ICMjI1xuICAjIyMgVEFJTiBkb2VzIG5vdCBjYXN0IHZhbHVlcyBhcyB5ZXQgIyMjXG4gICMjIyBUQUlOVCBkb2VzIG5vdCBzdXBwb3J0IG11bHRpcGxlIGluZGV4ZXMgYXMgeWV0ICMjI1xuICBbIHBocmFzZXR5cGUsIGZpcnN0LCBzZWNvbmQsIGlkeCwgXSA9IHVybC5zcGxpdCAnfCdcbiAgdW5sZXNzIHBocmFzZXR5cGU/IGFuZCBwaHJhc2V0eXBlLmxlbmd0aCA+IDAgYW5kIHBocmFzZXR5cGUgaW4gWyAnc28nLCAnb3MnLCBdXG4gICAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBVUkwga2V5ICN7cnByIHVybH1cIlxuICB1bmxlc3MgZmlyc3Q/IGFuZCBmaXJzdC5sZW5ndGggPiAwIGFuZCBzZWNvbmQ/IGFuZCBzZWNvbmQubGVuZ3RoID4gMFxuICAgIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgVVJMIGtleSAje3JwciB1cmx9XCJcbiAgaWR4ID0gaWYgKCBpZHg/IGFuZCBpZHgubGVuZ3RoID4gMCApIHRoZW4gKCBwYXJzZUludCBpZHgsIDEwICkgZWxzZSAwXG4gIFsgc2ssIHN2LCBdID0gIGZpcnN0LnNwbGl0ICc6J1xuICBbIG9rLCBvdiwgXSA9IHNlY29uZC5zcGxpdCAnOidcbiAgdW5sZXNzIHNrPyBhbmQgc2subGVuZ3RoID4gMCBhbmQgb2s/IGFuZCBvay5sZW5ndGggPiAwXG4gICAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBVUkwga2V5ICN7cnByIHVybH1cIlxuICBbIHNrLCBzdiwgb2ssIG92LCBdID0gWyBvaywgb3YsIHNrLCBzdiwgXSBpZiBwaHJhc2V0eXBlIGlzICdvcydcbiAgcmV0dXJuIFsgcGhyYXNldHlwZSwgc2ssIHN2LCBvaywgb3YsIGlkeCwgXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkB1cmxfZnJvbV9rZXkgPSAoIGRiLCBrZXkgKSAtPlxuICBpZiAoIEBfdHlwZV9mcm9tX2tleSBkYiwga2V5ICkgaXMgJ2xpc3QnXG4gICAgWyBwaHJhc2V0eXBlLCB0YWlsLi4uLCBdID0ga2V5XG4gICAgaWYgcGhyYXNldHlwZSBpcyAnc3BvJ1xuICAgICAgWyBzYmosIHByZCwgXSA9IHRhaWxcbiAgICAgIHJldHVybiBcInNwb3wje3Nian18I3twcmR9fFwiXG4gICAgZWxzZVxuICAgICAgWyBwcmQsIG9iaiwgc2JqLCBpZHgsIF0gPSB0YWlsXG4gICAgICBpZHhfcnByID0gaWYgaWR4PyB0aGVuIHJwciBpZHggZWxzZSAnJ1xuICAgICAgcmV0dXJuIFwicG9zfCN7cHJkfToje29ian18I3tzYmp9fCN7aWR4X3Jwcn1cIlxuICByZXR1cm4gXCIje3JwciBrZXl9XCJcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AJHVybF9mcm9tX2tleSA9ICggZGIgKSAtPiAkICgga2V5LCBzZW5kICkgPT4gc2VuZCBAdXJsX2Zyb21fa2V5IGRiLCBrZXlcbkAka2V5X2Zyb21fdXJsID0gKCBkYiApIC0+ICQgKCB1cmwsIHNlbmQgKSA9PiBzZW5kIEBrZXlfZnJvbV91cmwgZGIsIGtleVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfdHlwZV9mcm9tX2tleSA9ICggZGIsIGtleSApIC0+XG4gIGlmIEFycmF5LmlzQXJyYXkga2V5XG4gICAgIyB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIGtleTogI3tycHIga2V5fVwiIHVubGVzcyBrZXkubGVuZ3RoIGlzIDZcbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIHBocmFzZXR5cGU6ICN7cnByIGtleX1cIiB1bmxlc3Mga2V5WyAnMCcgXSBpbiBAcGhyYXNldHlwZXNcbiAgICByZXR1cm4gJ2xpc3QnXG4gIHJldHVybiAnb3RoZXInXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIFBSRUZJWEVTICYgUVVFUklFU1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX3F1ZXJ5X2Zyb21fcHJlZml4ID0gKCBkYiwgbG9faGludCwgc3RhciApIC0+XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgaWYgc3Rhcj9cbiAgICAjIyMgJ0FzdGVyaXNrJyBlbmNvZGluZzogcGFydGlhbCBrZXkgc2VnbWVudHMgbWF0Y2ggIyMjXG4gICAgZ3RlICAgPSBAX2VuY29kZV9rZXkgZGIsIGxvX2hpbnRcbiAgICBsdGUgICA9IEBfZW5jb2RlX2tleSBkYiwgbG9faGludFxuICAgIGx0ZVsgbHRlLmxlbmd0aCAtIDEgXSA9IENPREVDWyAndHlwZW1hcmtlcnMnICBdWyAnaGknIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBlbHNlXG4gICAgIyMjICdDbGFzc2ljYWwnIGVuY29kaW5nOiBvbmx5IGZ1bGwga2V5IHNlZ21lbnRzIG1hdGNoICMjI1xuICAgIGJhc2UgID0gQF9lbmNvZGVfa2V5IGRiLCBsb19oaW50LCBDT0RFQ1sgJ3R5cGVtYXJrZXJzJyAgXVsgJ2hpJyBdXG4gICAgZ3RlICAgPSBiYXNlLnNsaWNlIDAsIGJhc2UubGVuZ3RoIC0gMVxuICAgIGx0ZSAgID0gYmFzZS5zbGljZSAwLCBiYXNlLmxlbmd0aFxuICByZXR1cm4geyBndGUsIGx0ZSwgfVxuXG5cblxuXG5cbiJdfQ==