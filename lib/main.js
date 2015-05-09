(function() {
  var $, BYTEWISE, CND, D, LODASH, _btws_decode, _btws_encode, _new_level_db, badge, debug, echo, help, leveldown, log, repeat_immediately, rpr, step, suspend, urge, warn, whisper,
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


  /* https://github.com/deanlandolt/bytewise */

  BYTEWISE = require('bytewise');

  _btws_encode = BYTEWISE.encode.bind(BYTEWISE);

  _btws_decode = BYTEWISE.decode.bind(BYTEWISE);

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

  this._zero = true;

  this._zero_enc = _btws_encode(this._zero);

  this._lo_enc = _btws_encode(null);

  this._hi_enc = _btws_encode(void 0);

  this._last_octet = new Buffer([0xff]);

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

    /* Expects a Hollerith DB object and an optional buffer size; returns a pipe transformer that does all of
    the following:
    
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
        value = value != null ? _this._encode(db, value) : _this._zero_enc;
        return buffer.push({
          type: 'put',
          key: _this._encode(db, key),
          value: value
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
    var R, hi_hint_enc, lo_hint_enc, query;
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
      lo_hint_enc = lo_hint != null ? this._encode(db, lo_hint) : this._lo_enc;
      hi_hint_enc = hi_hint != null ? (this._query_from_prefix(db, hi_hint))['lte'] : this._hi_enc;
      query = {
        gte: lo_hint_enc,
        lte: hi_hint_enc
      };
    }
    R = db['%self'].createReadStream(query);

    /* TAINT Should we test for well-formed entries here? */
    R = R.pipe($((function(_this) {
      return function(arg, send) {
        var key, value;
        key = arg.key, value = arg.value;
        return send([_this._decode(db, key), _this._decode(db, value)]);
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

  this._encode = function(db, key) {
    if (key === void 0) {
      throw new Error("illegal key " + (rpr(key)));
    }
    return _btws_encode(key);
  };

  this._decode = function(db, key) {
    var R;
    if ((R = _btws_decode(key)) === void 0) {
      throw new Error("illegal key " + (rpr(key)));
    }
    return R;
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
    if (value == null) {
      value = this._zero_enc;
    }
    switch (phrasetype = key[0]) {
      case 'spo':
        if ((length = key.length) !== 3) {
          throw new Error("illegal SPO key (length " + length + ")");
        }
        if (value === this._zero_enc || value === (void 0)) {
          throw new Error("illegal value " + (rpr(value)));
        }
        return [key[1], key[2], value];
      case 'pos':
        if (!((4 <= (ref = (length = key.length)) && ref <= 5))) {
          throw new Error("illegal POS key (length " + length + ")");
        }
        if (!(value === this._zero || value === (void 0))) {
          throw new Error("illegal value " + (rpr(value)));
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
    var base, gte, length, lte;
    base = this._encode(db, lo_hint);
    length = base.length;
    if (base[length - 1] !== 0x00) {
      throw new Error("illegal prefix-key (1): " + (rpr(lo_hint)));
    }
    if (base[length - 2] !== 0x00) {
      throw new Error("illegal prefix-key (2): " + (rpr(lo_hint)));
    }
    base[length - 2] = 0xff;
    gte = base.slice(0, length - 2);
    lte = base.slice(0, length - 1);
    return {
      gte: gte,
      lte: lte
    };
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVFBO0FBQUEsTUFBQSw2S0FBQTtJQUFBLGdCQUFBOztBQUFBLEVBQUEsR0FBQSxHQUE0QixPQUFBLENBQVEsS0FBUixDQUE1QixDQUFBOztBQUFBLEVBQ0EsR0FBQSxHQUE0QixHQUFHLENBQUMsR0FEaEMsQ0FBQTs7QUFBQSxFQUVBLEtBQUEsR0FBNEIsZ0JBRjVCLENBQUE7O0FBQUEsRUFHQSxHQUFBLEdBQTRCLEdBQUcsQ0FBQyxVQUFKLENBQWUsT0FBZixFQUE0QixLQUE1QixDQUg1QixDQUFBOztBQUFBLEVBSUEsS0FBQSxHQUE0QixHQUFHLENBQUMsVUFBSixDQUFlLE9BQWYsRUFBNEIsS0FBNUIsQ0FKNUIsQ0FBQTs7QUFBQSxFQUtBLElBQUEsR0FBNEIsR0FBRyxDQUFDLFVBQUosQ0FBZSxNQUFmLEVBQTRCLEtBQTVCLENBTDVCLENBQUE7O0FBQUEsRUFNQSxJQUFBLEdBQTRCLEdBQUcsQ0FBQyxVQUFKLENBQWUsTUFBZixFQUE0QixLQUE1QixDQU41QixDQUFBOztBQUFBLEVBT0EsSUFBQSxHQUE0QixHQUFHLENBQUMsVUFBSixDQUFlLE1BQWYsRUFBNEIsS0FBNUIsQ0FQNUIsQ0FBQTs7QUFBQSxFQVFBLE9BQUEsR0FBNEIsR0FBRyxDQUFDLFVBQUosQ0FBZSxTQUFmLEVBQTRCLEtBQTVCLENBUjVCLENBQUE7O0FBQUEsRUFTQSxJQUFBLEdBQTRCLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBVCxDQUFjLEdBQWQsQ0FUNUIsQ0FBQTs7QUFBQSxFQVdBLE9BQUEsR0FBNEIsT0FBQSxDQUFRLG9CQUFSLENBWDVCLENBQUE7O0FBQUEsRUFZQSxJQUFBLEdBQTRCLE9BQU8sQ0FBQyxJQVpwQyxDQUFBOztBQWNBO0FBQUEsK0NBZEE7O0FBQUEsRUFlQSxRQUFBLEdBQTRCLE9BQUEsQ0FBUSxVQUFSLENBZjVCLENBQUE7O0FBQUEsRUFnQkEsWUFBQSxHQUE0QixRQUFRLENBQUMsTUFBTSxDQUFDLElBQWhCLENBQXFCLFFBQXJCLENBaEI1QixDQUFBOztBQUFBLEVBaUJBLFlBQUEsR0FBNEIsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFoQixDQUFxQixRQUFyQixDQWpCNUIsQ0FBQTs7QUFBQSxFQW1CQSxDQUFBLEdBQTRCLE9BQUEsQ0FBUSxhQUFSLENBbkI1QixDQUFBOztBQUFBLEVBb0JBLENBQUEsR0FBNEIsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFSLENBQWEsQ0FBYixDQXBCNUIsQ0FBQTs7QUFBQSxFQXFCQSxhQUFBLEdBQTRCLE9BQUEsQ0FBUSxPQUFSLENBckI1QixDQUFBOztBQUFBLEVBc0JBLFNBQUEsR0FBNEIsT0FBQSxDQUFRLDhCQUFSLENBdEI1QixDQUFBOztBQUFBLEVBd0JBLE9BQUEsR0FBNEIsT0FBQSxDQUFRLG9CQUFSLENBeEI1QixDQUFBOztBQUFBLEVBeUJBLElBQUEsR0FBNEIsT0FBTyxDQUFDLElBekJwQyxDQUFBOztBQUFBLEVBMEJBLGtCQUFBLEdBQTRCLE9BQU8sQ0FBQyxrQkExQnBDLENBQUE7O0FBQUEsRUE0QkEsTUFBQSxHQUE0QixPQUFBLENBQVEsUUFBUixDQTVCNUIsQ0FBQTs7QUFBQSxFQWdDQSxJQUFDLENBQUEsV0FBRCxHQUFvQixDQUFFLEtBQUYsRUFBUyxLQUFULENBaENwQixDQUFBOztBQUFBLEVBaUNBLElBQUMsQ0FBQSxPQUFELEdBQW9CLE1BQUEsQ0FBTyxRQUFQLENBakNwQixDQUFBOztBQUFBLEVBa0NBLElBQUMsQ0FBQSxLQUFELEdBQW9CLElBbENwQixDQUFBOztBQUFBLEVBbUNBLElBQUMsQ0FBQSxTQUFELEdBQW9CLFlBQUEsQ0FBYSxJQUFDLENBQUEsS0FBZCxDQW5DcEIsQ0FBQTs7QUFBQSxFQW9DQSxJQUFDLENBQUEsT0FBRCxHQUFvQixZQUFBLENBQWEsSUFBYixDQXBDcEIsQ0FBQTs7QUFBQSxFQXFDQSxJQUFDLENBQUEsT0FBRCxHQUFvQixZQUFBLENBQWEsTUFBYixDQXJDcEIsQ0FBQTs7QUFBQSxFQXNDQSxJQUFDLENBQUEsV0FBRCxHQUF3QixJQUFBLE1BQUEsQ0FBTyxDQUFFLElBQUYsQ0FBUCxDQXRDeEIsQ0FBQTs7QUFBQSxFQXlDQSxJQUFDLENBQUEsTUFBRCxHQUFVLFNBQUUsS0FBRixHQUFBO0FBRVIsUUFBQSw0QkFBQTtBQUFBLElBQUEsY0FBQSxHQUNFO0FBQUEsTUFBQSxhQUFBLEVBQXdCLFFBQXhCO0FBQUEsTUFDQSxlQUFBLEVBQXdCLFFBRHhCO0FBQUEsTUFFQSxpQkFBQSxFQUF3QixJQUZ4QjtBQUFBLE1BR0EsZUFBQSxFQUF3QixLQUh4QjtBQUFBLE1BSUEsYUFBQSxFQUF3QixJQUp4QjtBQUFBLE1BS0EsTUFBQSxFQUF3QixLQUx4QjtLQURGLENBQUE7QUFBQSxJQVFBLFNBQUEsR0FBc0IsYUFBQSxDQUFjLEtBQWQsRUFBcUIsY0FBckIsQ0FSdEIsQ0FBQTtBQUFBLElBVUEsQ0FBQSxHQUNFO0FBQUEsTUFBQSxNQUFBLEVBQWtCLGNBQWxCO0FBQUEsTUFDQSxPQUFBLEVBQWtCLFNBRGxCO0tBWEYsQ0FBQTtBQWNBLFdBQU8sQ0FBUCxDQWhCUTtFQUFBLENBekNWLENBQUE7O0FBQUEsRUFxRUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxTQUFFLEVBQUYsRUFBTSxPQUFOLEdBQUE7V0FDUCxJQUFBLENBQUssQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFVBQUUsTUFBRixHQUFBO0FBQ0gsWUFBQSxLQUFBO0FBQUEsUUFBQSxLQUFBLEdBQVEsRUFBSSxDQUFBLE9BQUEsQ0FBVyxDQUFBLFVBQUEsQ0FBdkIsQ0FBQTtBQUFBLFFBQ0EsT0FBQSxFQUFVLENBQUEsT0FBQSxDQUFTLENBQUMsS0FBZCxDQUFvQixNQUFwQixDQUFOLENBREEsQ0FBQTtBQUFBLFFBRUEsT0FBQSxTQUFlLENBQUMsT0FBVixDQUFrQixLQUFsQixFQUF5QixNQUF6QixDQUFOLENBRkEsQ0FBQTtBQUFBLFFBR0EsT0FBQSxFQUFVLENBQUEsT0FBQSxDQUFTLENBQUMsSUFBZCxDQUFtQixNQUFuQixDQUFOLENBSEEsQ0FBQTtlQUtBLE9BQUEsQ0FBUSxJQUFSLEVBTkc7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFMLEVBRE87RUFBQSxDQXJFVCxDQUFBOztBQUFBLEVBa0ZBLElBQUMsQ0FBQSxNQUFELEdBQVUsU0FBRSxFQUFGLEVBQU0sV0FBTixHQUFBO0FBQ1IsUUFBQSw2REFBQTs7TUFEYyxjQUFjO0tBQzVCO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7OztPQUFBO0FBZ0JBLElBQUEsSUFBQSxDQUFBLENBQXNGLFdBQUEsR0FBYyxDQUFwRyxDQUFBO0FBQUEsWUFBVSxJQUFBLEtBQUEsQ0FBTSw0Q0FBQSxHQUE0QyxDQUFDLEdBQUEsQ0FBSSxXQUFKLENBQUQsQ0FBbEQsQ0FBVixDQUFBO0tBaEJBO0FBQUEsSUFpQkEsTUFBQSxHQUFjLEVBakJkLENBQUE7QUFBQSxJQWtCQSxTQUFBLEdBQWMsRUFBSSxDQUFBLE9BQUEsQ0FsQmxCLENBQUE7QUFBQSxJQW1CQSxXQUFBLEdBQWMsQ0FuQmQsQ0FBQTtBQUFBLElBb0JBLFNBQUEsR0FBYyxLQXBCZCxDQUFBO0FBQUEsSUFxQkEsS0FBQSxHQUFjLElBckJkLENBQUE7QUFBQSxJQXVCQSxJQUFBLEdBQU8sQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUUsR0FBRixFQUFPLEtBQVAsR0FBQTtBQUNMLFFBQUEsS0FBQSxHQUFXLGFBQUgsR0FBZSxLQUFDLENBQUEsT0FBRCxDQUFTLEVBQVQsRUFBYSxLQUFiLENBQWYsR0FBdUMsS0FBQyxDQUFBLFNBQWhELENBQUE7ZUFDQSxNQUFNLENBQUMsSUFBUCxDQUFZO0FBQUEsVUFBRSxJQUFBLEVBQU0sS0FBUjtBQUFBLFVBQWUsR0FBQSxFQUFPLEtBQUMsQ0FBQSxPQUFELENBQVMsRUFBVCxFQUFhLEdBQWIsQ0FBdEI7QUFBQSxVQUEwQyxLQUFBLEVBQU8sS0FBakQ7U0FBWixFQUZLO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0F2QlAsQ0FBQTtBQUFBLElBMkJBLEtBQUEsR0FBUSxDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQSxHQUFBO0FBQ04sUUFBQSxJQUFHLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLENBQW5CO0FBQ0UsVUFBQSxXQUFBLElBQWUsQ0FBQSxDQUFmLENBQUE7QUFBQSxVQUtBLFNBQVMsQ0FBQyxLQUFWLENBQWdCLE1BQWhCLEVBQXdCLFNBQUUsS0FBRixHQUFBO0FBQ3RCLFlBQUEsSUFBZSxhQUFmO0FBQUEsb0JBQU0sS0FBTixDQUFBO2FBQUE7QUFBQSxZQUNBLFdBQUEsSUFBZSxDQUFBLENBRGYsQ0FBQTtBQUVBLFlBQUEsSUFBZSxTQUFBLElBQWMsV0FBQSxHQUFjLENBQTNDO3FCQUFBLEtBQUssQ0FBQyxHQUFOLENBQUEsRUFBQTthQUhzQjtVQUFBLENBQXhCLENBTEEsQ0FBQTtpQkFTQSxNQUFBLEdBQVMsR0FWWDtTQUFBLE1BQUE7aUJBWUUsS0FBSyxDQUFDLEdBQU4sQ0FBQSxFQVpGO1NBRE07TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQTNCUixDQUFBO0FBMENBLFdBQU8sQ0FBQSxDQUFFLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFFLEdBQUYsRUFBTyxJQUFQLEVBQWEsR0FBYixHQUFBO0FBRVAsWUFBQSwyQ0FBQTtBQUFBLFFBQUEsS0FBQSxHQUFRLElBQVIsQ0FBQTtBQUNBLFFBQUEsSUFBRyxXQUFIO0FBQ0UsVUFBRSxZQUFGLEVBQU8sWUFBUCxFQUFZLFlBQVosQ0FBQTtBQUFBLFVBQ0EsSUFBQSxDQUFLLENBQUUsS0FBRixFQUFTLEdBQVQsRUFBYyxHQUFkLENBQUwsRUFBMkIsR0FBM0IsQ0FEQSxDQUFBO0FBR0E7QUFBQSxnREFIQTtBQU1BLFVBQUEsSUFBRyxHQUFHLENBQUMsT0FBSixDQUFZLEdBQVosQ0FBSDtBQUNFO0FBQUEscUVBQUE7QUFBQSxZQUNBLElBREEsQ0FERjtXQUFBLE1BSUssSUFBRyxHQUFHLENBQUMsUUFBSixDQUFhLEdBQWIsQ0FBSDtBQUNIO0FBQUEsa0ZBQUE7QUFDQSxpQkFBQSx5REFBQTt5Q0FBQTtBQUNFLGNBQUEsSUFBQSxDQUFLLENBQUUsS0FBRixFQUFTLEdBQVQsRUFBYyxXQUFkLEVBQTJCLEdBQTNCLEVBQWdDLE9BQWhDLENBQUwsQ0FBQSxDQURGO0FBQUEsYUFGRztXQUFBLE1BQUE7QUFNSDtBQUFBLDZEQUFBO0FBQUEsWUFDQSxJQUFBLENBQUssQ0FBRSxLQUFGLEVBQVMsR0FBVCxFQUFjLEdBQWQsRUFBbUIsR0FBbkIsQ0FBTCxDQURBLENBTkc7V0FWTDtBQW1CQSxVQUFBLElBQVcsTUFBTSxDQUFDLE1BQVAsSUFBaUIsV0FBNUI7QUFBQSxZQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7V0FwQkY7U0FEQTtBQXVCQTtBQUFBLG9EQXZCQTtBQXdCQSxRQUFBLElBQUcsV0FBSDtBQUNFLFVBQUEsU0FBQSxHQUFZLElBQVosQ0FBQTtpQkFDQSxLQUFBLENBQUEsRUFGRjtTQTFCTztNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUYsQ0FBUCxDQTNDUTtFQUFBLENBbEZWLENBQUE7O0FBQUEsRUFtTEEsSUFBQyxDQUFBLG1CQUFELEdBQXVCLFNBQUUsRUFBRixFQUFNLE9BQU4sRUFBc0IsT0FBdEIsR0FBQTtBQUNyQixRQUFBLENBQUE7O01BRDJCLFVBQVU7S0FDckM7O01BRDJDLFVBQVU7S0FDckQ7QUFBQSxJQUFBLENBQUEsR0FBSSxJQUFDLENBQUEsa0JBQUQsQ0FBb0IsRUFBcEIsRUFBd0IsT0FBeEIsRUFBaUMsT0FBakMsQ0FDRixDQUFDLElBREMsQ0FDSSxJQUFDLENBQUEsVUFBRCxDQUFZLEVBQVosQ0FESixDQUFKLENBQUE7QUFFQSxXQUFPLENBQVAsQ0FIcUI7RUFBQSxDQW5MdkIsQ0FBQTs7QUFBQSxFQXlMQSxJQUFDLENBQUEsa0JBQUQsR0FBc0IsU0FBRSxFQUFGLEVBQU0sT0FBTixFQUFzQixPQUF0QixHQUFBO0FBQ3BCLFFBQUEsa0NBQUE7O01BRDBCLFVBQVU7S0FDcEM7O01BRDBDLFVBQVU7S0FDcEQ7QUFBQTtBQUFBOzs7Ozs7T0FBQTtBQVFBLElBQUEsSUFBRyxpQkFBQSxJQUFpQixpQkFBcEI7QUFDRSxZQUFVLElBQUEsS0FBQSxDQUFNLDZDQUFOLENBQVYsQ0FERjtLQVJBO0FBV0EsSUFBQSxJQUFHLE9BQUEsSUFBZ0IsaUJBQW5CO0FBQ0UsTUFBQSxLQUFBLEdBQWMsSUFBQyxDQUFBLGtCQUFELENBQW9CLEVBQXBCLEVBQXdCLE9BQXhCLENBQWQsQ0FERjtLQUFBLE1BQUE7QUFJRSxNQUFBLFdBQUEsR0FBaUIsZUFBSCxHQUE4QixJQUFDLENBQUEsT0FBRCxDQUFTLEVBQVQsRUFBYSxPQUFiLENBQTlCLEdBQW1FLElBQUMsQ0FBQSxPQUFsRixDQUFBO0FBQUEsTUFDQSxXQUFBLEdBQWlCLGVBQUgsR0FBaUIsQ0FBRSxJQUFDLENBQUEsa0JBQUQsQ0FBb0IsRUFBcEIsRUFBd0IsT0FBeEIsQ0FBRixDQUFxQyxDQUFBLEtBQUEsQ0FBdEQsR0FBbUUsSUFBQyxDQUFBLE9BRGxGLENBQUE7QUFBQSxNQUVBLEtBQUEsR0FBYztBQUFBLFFBQUUsR0FBQSxFQUFLLFdBQVA7QUFBQSxRQUFvQixHQUFBLEVBQUssV0FBekI7T0FGZCxDQUpGO0tBWEE7QUFBQSxJQW1CQSxDQUFBLEdBQVksRUFBSSxDQUFBLE9BQUEsQ0FBUyxDQUFDLGdCQUFkLENBQStCLEtBQS9CLENBbkJaLENBQUE7QUFvQkE7QUFBQSw0REFwQkE7QUFBQSxJQXFCQSxDQUFBLEdBQVksQ0FBQyxDQUFDLElBQUYsQ0FBTyxDQUFBLENBQUUsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUUsR0FBRixFQUFrQixJQUFsQixHQUFBO0FBQTRCLFlBQUEsVUFBQTtBQUFBLFFBQXhCLFVBQUEsS0FBSyxZQUFBLEtBQW1CLENBQUE7ZUFBQSxJQUFBLENBQUssQ0FBSSxLQUFDLENBQUEsT0FBRCxDQUFTLEVBQVQsRUFBYSxHQUFiLENBQUosRUFBMEIsS0FBQyxDQUFBLE9BQUQsQ0FBUyxFQUFULEVBQWEsS0FBYixDQUExQixDQUFMLEVBQTVCO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBRixDQUFQLENBckJaLENBQUE7QUF1QkEsV0FBTyxDQUFQLENBeEJvQjtFQUFBLENBekx0QixDQUFBOztBQUFBLEVBb05BLElBQUMsQ0FBQSxTQUFELEdBQWEsU0FBRSxFQUFGLEVBQU0sSUFBTixHQUFBOzthQUFNLE9BQU87S0FDeEI7QUFBQTtBQUFBLGdFQURXO0VBQUEsQ0FwTmIsQ0FBQTs7QUFBQSxFQXdOQSxJQUFDLENBQUEsUUFBRCxHQUFZLFNBQUUsRUFBRixFQUFNLEdBQU4sRUFBVyxRQUFYLEVBQWdDLE9BQWhDLEdBQUE7QUFDVixRQUFBLEtBQUE7O01BRHFCLFdBQVcsSUFBQyxDQUFBO0tBQ2pDO0FBQUE7QUFBQSwrREFBQTtBQUNBLFlBQU8sS0FBQSxHQUFRLFNBQVMsQ0FBQyxNQUF6QjtBQUFBLFdBQ08sQ0FEUDtBQUVJLFFBQUEsT0FBQSxHQUFZLFFBQVosQ0FBQTtBQUFBLFFBQ0EsUUFBQSxHQUFZLElBQUMsQ0FBQSxPQURiLENBRko7QUFDTztBQURQLFdBSU8sQ0FKUDtBQUljLFFBQUEsSUFBQSxDQUpkO0FBSU87QUFKUDtBQUtPLGNBQVUsSUFBQSxLQUFBLENBQU0saUNBQUEsR0FBa0MsS0FBeEMsQ0FBVixDQUxQO0FBQUEsS0FEQTtXQVFBLEVBQUksQ0FBQSxPQUFBLENBQVMsQ0FBQyxHQUFkLENBQWtCLEdBQWxCLEVBQXVCLE9BQXZCLEVBVFU7RUFBQSxDQXhOWixDQUFBOztBQUFBLEVBb09BLElBQUMsQ0FBQSxRQUFELEdBQVksU0FBRSxFQUFGLEVBQU0sUUFBTixFQUFnQixJQUFoQixHQUFBO0FBQ1YsUUFBQSxvRkFBQTtBQUFBLFlBQU8sS0FBQSxHQUFRLFNBQVMsQ0FBQyxNQUF6QjtBQUFBLFdBQ08sQ0FEUDtBQUVJLFFBQUEsSUFBQSxHQUFZLFFBQVosQ0FBQTtBQUFBLFFBQ0EsUUFBQSxHQUFZLElBRFosQ0FGSjtBQUNPO0FBRFAsV0FJTyxDQUpQO0FBS0ksUUFBQSxJQUFBLENBTEo7QUFJTztBQUpQO0FBT0ksY0FBVSxJQUFBLEtBQUEsQ0FBTSxpQ0FBQSxHQUFrQyxLQUF4QyxDQUFWLENBUEo7QUFBQSxLQUFBO0FBQUEsSUFTQSxPQUFBLDJFQUFnRCxLQVRoRCxDQUFBO0FBQUEsSUFXQSxNQUFBLDRFQUFnRCxTQUFFLElBQUYsR0FBQTthQUFZLEtBQVo7SUFBQSxDQVhoRCxDQUFBO0FBQUEsSUFZQSxVQUFBLDJFQUFnRCxLQVpoRCxDQUFBO0FBQUEsSUFhQSxZQUFBLEdBQXVCLE9BQUgsR0FBZ0IsQ0FBQyxDQUFDLFdBQUYsQ0FBQSxDQUFoQixHQUFxQyxTQUFFLENBQUYsR0FBQTthQUFTLEVBQVQ7SUFBQSxDQWJ6RCxDQUFBO0FBQUEsSUFjQSxpQkFBQSxHQUFvQixDQWRwQixDQUFBO0FBZ0JBLFdBQU8sQ0FBQSxDQUFFLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFFLFVBQUYsRUFBYyxVQUFkLEVBQTBCLFNBQTFCLEdBQUE7QUFDUCxZQUFBLDRCQUFBO0FBQUEsUUFBQSxLQUFBLEdBQVEsQ0FBUixDQUFBO0FBRUEsUUFBQSxJQUFHLGtCQUFIO0FBQ0UsVUFBQSxpQkFBQSxJQUF3QixDQUFBLENBQXhCLENBQUE7QUFBQSxVQUNBLFNBQUEsR0FBd0IsSUFBQSxDQUFLLFVBQUwsQ0FEeEIsQ0FBQTtBQUFBLFVBRUEsT0FBMkIsR0FBRyxDQUFDLFFBQUosQ0FBYSxTQUFiLENBQUgsR0FBK0IsU0FBL0IsR0FBOEMsQ0FBRSxLQUFDLENBQUEsT0FBSCxFQUFZLFNBQVosQ0FBdEUsRUFBRSxjQUFGLEVBQVEsbUJBRlIsQ0FBQTtBQUFBLFVBR0EsU0FFRSxDQUFDLElBRkgsQ0FFVyxDQUFBLFNBQUEsR0FBQTtBQUNQO0FBQUEsNEZBQUE7QUFBQSxnQkFBQSxNQUFBO0FBQUEsWUFDQSxNQUFBLEdBQVksSUFBQSxLQUFRLEtBQUMsQ0FBQSxPQUFaLEdBQXlCLEVBQXpCLEdBQWlDLENBQUUsSUFBRixDQUQxQyxDQUFBO0FBRUEsbUJBQU8sQ0FBQSxDQUFFLFNBQUUsVUFBRixFQUFjLENBQWQsRUFBaUIsU0FBakIsR0FBQTtBQUNQLGNBQUEsSUFBRyxrQkFBSDtBQUNFLGdCQUFBLFVBQUEsR0FBYSxNQUFBLENBQU8sVUFBUCxDQUFiLENBQUE7QUFDQSxnQkFBQSxJQUFHLGtCQUFIO0FBQ0Usa0JBQUEsS0FBQSxJQUFTLENBQUEsQ0FBVCxDQUFBO0FBQUEsa0JBQ0EsTUFBTSxDQUFDLElBQVAsQ0FBWSxVQUFaLENBREEsQ0FERjtpQkFGRjtlQUFBO0FBS0EsY0FBQSxJQUFHLGlCQUFIO0FBQ0UsZ0JBQUEsSUFBRyxVQUFBLElBQWMsS0FBQSxHQUFRLENBQXpCO0FBQ0Usa0JBQUEsVUFBQSxDQUFXLFlBQUEsQ0FBYSxNQUFiLENBQVgsQ0FBQSxDQURGO2lCQUFBO0FBQUEsZ0JBRUEsaUJBQUEsSUFBcUIsQ0FBQSxDQUZyQixDQUFBO3VCQUdBLFNBQUEsQ0FBQSxFQUpGO2VBTk87WUFBQSxDQUFGLENBQVAsQ0FITztVQUFBLENBQUEsQ0FBSCxDQUFBLENBRlIsQ0FIQSxDQURGO1NBRkE7QUF1QkEsUUFBQSxJQUFHLGlCQUFIO2lCQUNFLGtCQUFBLENBQW1CLFNBQUEsR0FBQTtBQUNqQixZQUFBLElBQW1CLGlCQUFBLEtBQXFCLENBQXhDO0FBQUEscUJBQU8sSUFBUCxDQUFBO2FBQUE7QUFBQSxZQUNBLFNBQUEsQ0FBQSxDQURBLENBQUE7QUFFQSxtQkFBTyxLQUFQLENBSGlCO1VBQUEsQ0FBbkIsRUFERjtTQXhCTztNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUYsQ0FBUCxDQWpCVTtFQUFBLENBcE9aLENBQUE7O0FBQUEsRUF1UkEsSUFBQyxDQUFBLE9BQUQsR0FBVyxTQUFFLEVBQUYsRUFBTSxHQUFOLEdBQUE7QUFDVCxJQUFBLElBQTRDLEdBQUEsS0FBTyxNQUFuRDtBQUFBLFlBQVUsSUFBQSxLQUFBLENBQU0sY0FBQSxHQUFjLENBQUMsR0FBQSxDQUFJLEdBQUosQ0FBRCxDQUFwQixDQUFWLENBQUE7S0FBQTtBQUNBLFdBQU8sWUFBQSxDQUFhLEdBQWIsQ0FBUCxDQUZTO0VBQUEsQ0F2UlgsQ0FBQTs7QUFBQSxFQTRSQSxJQUFDLENBQUEsT0FBRCxHQUFXLFNBQUUsRUFBRixFQUFNLEdBQU4sR0FBQTtBQUNULFFBQUEsQ0FBQTtBQUFBLElBQUEsSUFBNEMsQ0FBRSxDQUFBLEdBQUksWUFBQSxDQUFhLEdBQWIsQ0FBTixDQUFBLEtBQTRCLE1BQXhFO0FBQUEsWUFBVSxJQUFBLEtBQUEsQ0FBTSxjQUFBLEdBQWMsQ0FBQyxHQUFBLENBQUksR0FBSixDQUFELENBQXBCLENBQVYsQ0FBQTtLQUFBO0FBQ0EsV0FBTyxDQUFQLENBRlM7RUFBQSxDQTVSWCxDQUFBOztBQWlTQTtBQUFBOztLQWpTQTs7QUFBQSxFQW1TQSxJQUFDLENBQUEsT0FBRCxHQUFXLFNBQUUsRUFBRixFQUFNLFVBQU4sRUFBa0IsRUFBbEIsRUFBc0IsRUFBdEIsRUFBMEIsRUFBMUIsRUFBOEIsRUFBOUIsRUFBa0MsR0FBbEMsR0FBQTtBQUNULFFBQUEsR0FBQTtBQUFBLElBQUEsSUFBK0QsVUFBQSxLQUFnQixJQUFoQixJQUFBLFVBQUEsS0FBc0IsSUFBckY7QUFBQSxZQUFVLElBQUEsS0FBQSxDQUFNLHNCQUFBLEdBQXNCLENBQUMsR0FBQSxDQUFJLFVBQUosQ0FBRCxDQUE1QixDQUFWLENBQUE7S0FBQTtBQUNBLElBQUEsSUFBNkMsVUFBQSxLQUFjLElBQTNEO0FBQUEsTUFBQSxNQUFzQixDQUFFLEVBQUYsRUFBTSxFQUFOLEVBQVUsRUFBVixFQUFjLEVBQWQsQ0FBdEIsRUFBRSxXQUFGLEVBQU0sV0FBTixFQUFVLFdBQVYsRUFBYyxXQUFkLENBQUE7S0FEQTtBQUVBLFdBQU8sQ0FBRSxVQUFGLEVBQWMsRUFBZCxFQUFrQixFQUFsQixFQUFzQixFQUF0QixFQUEwQixFQUExQixnQkFBZ0MsTUFBTSxDQUF0QyxDQUFQLENBSFM7RUFBQSxDQW5TWCxDQUFBOztBQUFBLEVBeVNBLElBQUMsQ0FBQSxVQUFELEdBQWMsU0FBQSxHQUFBO0FBQWdCLFFBQUEsS0FBQTtBQUFBLElBQWQsbUJBQUkseURBQVUsQ0FBQTtXQUFBLElBQUMsQ0FBQSxPQUFELGFBQVMsQ0FBQSxFQUFBLEVBQUksSUFBTSxTQUFBLFdBQUEsQ0FBQSxDQUFBLENBQW5CLEVBQWhCO0VBQUEsQ0F6U2QsQ0FBQTs7QUFBQSxFQTBTQSxJQUFDLENBQUEsVUFBRCxHQUFjLFNBQUEsR0FBQTtBQUFnQixRQUFBLEtBQUE7QUFBQSxJQUFkLG1CQUFJLHlEQUFVLENBQUE7V0FBQSxJQUFDLENBQUEsT0FBRCxhQUFTLENBQUEsRUFBQSxFQUFJLElBQU0sU0FBQSxXQUFBLENBQUEsQ0FBQSxDQUFuQixFQUFoQjtFQUFBLENBMVNkLENBQUE7O0FBQUEsRUE2U0EsSUFBQyxDQUFBLHVCQUFELEdBQTJCLFNBQUUsRUFBRixFQUFNLE1BQU4sR0FBQTtBQUN6QixRQUFBLG9DQUFBO0FBQUEsSUFBQSxNQUF1QyxJQUFDLENBQUEsU0FBRCxDQUFXLEVBQVgsRUFBZSxNQUFmLENBQXZDLEVBQUUsbUJBQUYsRUFBYyxXQUFkLEVBQWtCLFdBQWxCLEVBQXNCLFdBQXRCLEVBQTBCLFdBQTFCLEVBQThCLFlBQTlCLENBQUE7QUFDQSxJQUFBLElBQXlFLFVBQUEsS0FBYyxJQUF2RjtBQUFBLFlBQVUsSUFBQSxLQUFBLENBQU0sZ0NBQUEsR0FBZ0MsQ0FBQyxHQUFBLENBQUksVUFBSixDQUFELENBQXRDLENBQVYsQ0FBQTtLQURBO0FBRUEsV0FBTyxDQUFFLElBQUYsRUFBUSxFQUFSLEVBQVksRUFBWixFQUFnQixFQUFoQixFQUFvQixFQUFwQixFQUF3QixHQUF4QixDQUFQLENBSHlCO0VBQUEsQ0E3UzNCLENBQUE7O0FBQUEsRUFtVEEsSUFBQyxDQUFBLFFBQUQsR0FBWSxTQUFFLEVBQUYsRUFBTSxVQUFOLEVBQWtCLEVBQWxCLEVBQXNCLEVBQXRCLEVBQTBCLEVBQTFCLEVBQThCLEVBQTlCLEVBQWtDLEdBQWxDLEdBQUE7QUFDVixRQUFBLGdCQUFBO0FBQUEsSUFBQSxnQkFBQSxHQUF1QixVQUFBLEtBQWMsSUFBakIsR0FBMkIsSUFBM0IsR0FBcUMsSUFBekQsQ0FBQTtBQUNBLFdBQU8sQ0FDSCxJQUFDLENBQUEsT0FBRCxDQUFTLEVBQVQsRUFBbUIsVUFBbkIsRUFBK0IsRUFBL0IsRUFBbUMsRUFBbkMsRUFBdUMsRUFBdkMsRUFBMkMsRUFBM0MsRUFBK0MsR0FBL0MsQ0FERyxFQUVILElBQUMsQ0FBQSxPQUFELENBQVMsRUFBVCxFQUFhLGdCQUFiLEVBQStCLEVBQS9CLEVBQW1DLEVBQW5DLEVBQXVDLEVBQXZDLEVBQTJDLEVBQTNDLEVBQStDLEdBQS9DLENBRkcsQ0FBUCxDQUZVO0VBQUEsQ0FuVFosQ0FBQTs7QUFBQSxFQTBUQSxJQUFDLENBQUEsU0FBRCxHQUFhLFNBQUUsRUFBRixFQUFNLEdBQU4sRUFBVyxLQUFYLEdBQUE7QUFDWCxRQUFBLDhDQUFBOztNQURzQixRQUFRLElBQUMsQ0FBQTtLQUMvQjtBQUFBLFlBQU8sVUFBQSxHQUFhLEdBQUssQ0FBQSxDQUFBLENBQXpCO0FBQUEsV0FDTyxLQURQO0FBRUksUUFBQSxJQUE0RCxDQUFFLE1BQUEsR0FBUyxHQUFHLENBQUMsTUFBZixDQUFBLEtBQTJCLENBQXZGO0FBQUEsZ0JBQVUsSUFBQSxLQUFBLENBQU0sMEJBQUEsR0FBMkIsTUFBM0IsR0FBa0MsR0FBeEMsQ0FBVixDQUFBO1NBQUE7QUFDQSxRQUFBLElBQWdELEtBQUEsS0FBVyxJQUFDLENBQUEsU0FBWixJQUFBLEtBQUEsS0FBdUIsUUFBdkU7QUFBQSxnQkFBVSxJQUFBLEtBQUEsQ0FBTSxnQkFBQSxHQUFnQixDQUFDLEdBQUEsQ0FBSSxLQUFKLENBQUQsQ0FBdEIsQ0FBVixDQUFBO1NBREE7QUFFQSxlQUFPLENBQUUsR0FBSyxDQUFBLENBQUEsQ0FBUCxFQUFZLEdBQUssQ0FBQSxDQUFBLENBQWpCLEVBQXNCLEtBQXRCLENBQVAsQ0FKSjtBQUFBLFdBS08sS0FMUDtBQU1JLFFBQUEsSUFBQSxDQUFBLENBQTRELENBQUEsQ0FBQSxXQUFLLENBQUUsTUFBQSxHQUFTLEdBQUcsQ0FBQyxNQUFmLEVBQUwsT0FBQSxJQUFnQyxDQUFoQyxDQUE1RCxDQUFBO0FBQUEsZ0JBQVUsSUFBQSxLQUFBLENBQU0sMEJBQUEsR0FBMkIsTUFBM0IsR0FBa0MsR0FBeEMsQ0FBVixDQUFBO1NBQUE7QUFDQSxRQUFBLElBQWdELENBQUEsQ0FBTSxLQUFBLEtBQVcsSUFBQyxDQUFBLEtBQVosSUFBQSxLQUFBLEtBQW1CLFFBQXJCLENBQXBEO0FBQUEsZ0JBQVUsSUFBQSxLQUFBLENBQU0sZ0JBQUEsR0FBZ0IsQ0FBQyxHQUFBLENBQUksS0FBSixDQUFELENBQXRCLENBQVYsQ0FBQTtTQURBO0FBQUEsUUFFRSxVQUFGLEVBQUssWUFBTCxFQUFVLFlBQVYsRUFBZSxZQUFmLEVBQW9CLFlBRnBCLENBQUE7QUFHTyxRQUFBLElBQUcsV0FBSDtpQkFBYSxDQUFFLEdBQUYsRUFBTyxHQUFQLEVBQVksR0FBWixFQUFpQixHQUFqQixFQUFiO1NBQUEsTUFBQTtpQkFBMEMsQ0FBRSxHQUFGLEVBQU8sR0FBUCxFQUFZLEdBQVosRUFBMUM7U0FUWDtBQUFBLEtBRFc7RUFBQSxDQTFUYixDQUFBOztBQUFBLEVBdVVBLElBQUMsQ0FBQSxVQUFELEdBQWMsU0FBRSxFQUFGLEdBQUE7QUFDWixXQUFPLENBQUEsQ0FBRSxDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBRSxJQUFGLEVBQVEsSUFBUixHQUFBO2VBQ1AsSUFBQSxDQUFLLEtBQUMsQ0FBQSxTQUFELGNBQVcsQ0FBQSxFQUFJLFNBQUEsV0FBQSxJQUFBLENBQUEsQ0FBZixDQUFMLEVBRE87TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFGLENBQVAsQ0FEWTtFQUFBLENBdlVkLENBQUE7O0FBQUEsRUE0VUEsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsU0FBRSxFQUFGLEVBQU0sR0FBTixHQUFBO0FBQ2Q7QUFBQSx1Q0FBQTtBQUNBO0FBQUEsMENBREE7QUFFQTtBQUFBLHdEQUZBO0FBQUEsUUFBQSxxRUFBQTtBQUFBLElBR0EsTUFBc0MsR0FBRyxDQUFDLEtBQUosQ0FBVSxHQUFWLENBQXRDLEVBQUUsbUJBQUYsRUFBYyxjQUFkLEVBQXFCLGVBQXJCLEVBQTZCLFlBSDdCLENBQUE7QUFJQSxJQUFBLElBQUEsQ0FBQSxDQUFPLG9CQUFBLElBQWdCLFVBQVUsQ0FBQyxNQUFYLEdBQW9CLENBQXBDLElBQTBDLENBQUEsVUFBQSxLQUFnQixJQUFoQixJQUFBLFVBQUEsS0FBc0IsSUFBdEIsQ0FBakQsQ0FBQTtBQUNFLFlBQVUsSUFBQSxLQUFBLENBQU0sa0JBQUEsR0FBa0IsQ0FBQyxHQUFBLENBQUksR0FBSixDQUFELENBQXhCLENBQVYsQ0FERjtLQUpBO0FBTUEsSUFBQSxJQUFBLENBQUEsQ0FBTyxlQUFBLElBQVcsS0FBSyxDQUFDLE1BQU4sR0FBZSxDQUExQixJQUFnQyxnQkFBaEMsSUFBNEMsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsQ0FBbkUsQ0FBQTtBQUNFLFlBQVUsSUFBQSxLQUFBLENBQU0sa0JBQUEsR0FBa0IsQ0FBQyxHQUFBLENBQUksR0FBSixDQUFELENBQXhCLENBQVYsQ0FERjtLQU5BO0FBQUEsSUFRQSxHQUFBLEdBQVcsYUFBQSxJQUFTLEdBQUcsQ0FBQyxNQUFKLEdBQWEsQ0FBM0IsR0FBc0MsUUFBQSxDQUFTLEdBQVQsRUFBYyxFQUFkLENBQXRDLEdBQThELENBUnBFLENBQUE7QUFBQSxJQVNBLE9BQWUsS0FBSyxDQUFDLEtBQU4sQ0FBWSxHQUFaLENBQWYsRUFBRSxZQUFGLEVBQU0sWUFUTixDQUFBO0FBQUEsSUFVQSxPQUFjLE1BQU0sQ0FBQyxLQUFQLENBQWEsR0FBYixDQUFkLEVBQUUsWUFBRixFQUFNLFlBVk4sQ0FBQTtBQVdBLElBQUEsSUFBQSxDQUFBLENBQU8sWUFBQSxJQUFRLEVBQUUsQ0FBQyxNQUFILEdBQVksQ0FBcEIsSUFBMEIsWUFBMUIsSUFBa0MsRUFBRSxDQUFDLE1BQUgsR0FBWSxDQUFyRCxDQUFBO0FBQ0UsWUFBVSxJQUFBLEtBQUEsQ0FBTSxrQkFBQSxHQUFrQixDQUFDLEdBQUEsQ0FBSSxHQUFKLENBQUQsQ0FBeEIsQ0FBVixDQURGO0tBWEE7QUFhQSxJQUFBLElBQTZDLFVBQUEsS0FBYyxJQUEzRDtBQUFBLE1BQUEsT0FBc0IsQ0FBRSxFQUFGLEVBQU0sRUFBTixFQUFVLEVBQVYsRUFBYyxFQUFkLENBQXRCLEVBQUUsWUFBRixFQUFNLFlBQU4sRUFBVSxZQUFWLEVBQWMsWUFBZCxDQUFBO0tBYkE7QUFjQSxXQUFPLENBQUUsVUFBRixFQUFjLEVBQWQsRUFBa0IsRUFBbEIsRUFBc0IsRUFBdEIsRUFBMEIsRUFBMUIsRUFBOEIsR0FBOUIsQ0FBUCxDQWZjO0VBQUEsQ0E1VWhCLENBQUE7O0FBQUEsRUE4VkEsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsU0FBRSxFQUFGLEVBQU0sR0FBTixHQUFBO0FBQ2QsUUFBQSx3Q0FBQTtBQUFBLElBQUEsSUFBRyxDQUFFLElBQUMsQ0FBQSxjQUFELENBQWdCLEVBQWhCLEVBQW9CLEdBQXBCLENBQUYsQ0FBQSxLQUErQixNQUFsQztBQUNFLE1BQUUsbUJBQUYsRUFBYyxXQUFkLEVBQWtCLFdBQWxCLEVBQXNCLFdBQXRCLEVBQTBCLFdBQTFCLEVBQThCLFlBQTlCLENBQUE7QUFBQSxNQUNBLE9BQUEsR0FBYSxXQUFILEdBQWEsR0FBQSxDQUFJLEdBQUosQ0FBYixHQUEwQixFQURwQyxDQUFBO0FBRUE7QUFBQSxpREFGQTtBQUdBO0FBQUEsZ0dBSEE7QUFJQSxhQUFVLFVBQUQsR0FBWSxHQUFaLEdBQWUsRUFBZixHQUFrQixHQUFsQixHQUFxQixFQUFyQixHQUF3QixHQUF4QixHQUEyQixFQUEzQixHQUE4QixHQUE5QixHQUFpQyxFQUFqQyxHQUFvQyxHQUFwQyxHQUF1QyxPQUFoRCxDQUxGO0tBQUE7QUFNQSxXQUFPLEVBQUEsR0FBRSxDQUFDLEdBQUEsQ0FBSSxHQUFKLENBQUQsQ0FBVCxDQVBjO0VBQUEsQ0E5VmhCLENBQUE7O0FBQUEsRUF3V0EsSUFBQyxDQUFBLGFBQUQsR0FBaUIsU0FBRSxFQUFGLEdBQUE7V0FBVSxDQUFBLENBQUUsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUUsR0FBRixFQUFPLElBQVAsR0FBQTtlQUFpQixJQUFBLENBQUssS0FBQyxDQUFBLFlBQUQsQ0FBYyxFQUFkLEVBQWtCLEdBQWxCLENBQUwsRUFBakI7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFGLEVBQVY7RUFBQSxDQXhXakIsQ0FBQTs7QUFBQSxFQXlXQSxJQUFDLENBQUEsYUFBRCxHQUFpQixTQUFFLEVBQUYsR0FBQTtXQUFVLENBQUEsQ0FBRSxDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBRSxHQUFGLEVBQU8sSUFBUCxHQUFBO2VBQWlCLElBQUEsQ0FBSyxLQUFDLENBQUEsWUFBRCxDQUFjLEVBQWQsRUFBa0IsR0FBbEIsQ0FBTCxFQUFqQjtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUYsRUFBVjtFQUFBLENBeldqQixDQUFBOztBQUFBLEVBNFdBLElBQUMsQ0FBQSxjQUFELEdBQWtCLFNBQUUsRUFBRixFQUFNLEdBQU4sR0FBQTtBQUNoQixRQUFBLDhCQUFBO0FBQUEsSUFBQSxJQUFHLEtBQUssQ0FBQyxPQUFOLENBQWMsR0FBZCxDQUFIO0FBQ0UsTUFBQSxJQUFpRCxHQUFHLENBQUMsTUFBSixLQUFjLENBQS9EO0FBQUEsY0FBVSxJQUFBLEtBQUEsQ0FBTSxlQUFBLEdBQWUsQ0FBQyxHQUFBLENBQUksR0FBSixDQUFELENBQXJCLENBQVYsQ0FBQTtPQUFBO0FBQUEsTUFDRSxtQkFBRixFQUFjLGNBQWQsRUFBcUIsZUFBckIsRUFBNkIsWUFEN0IsQ0FBQTtBQUVBLE1BQUEsSUFBd0QsVUFBQSxLQUFnQixJQUFoQixJQUFBLFVBQUEsS0FBc0IsSUFBOUU7QUFBQSxjQUFVLElBQUEsS0FBQSxDQUFNLHNCQUFBLEdBQXNCLENBQUMsR0FBQSxDQUFJLEdBQUosQ0FBRCxDQUE1QixDQUFWLENBQUE7T0FGQTtBQUdBLGFBQU8sTUFBUCxDQUpGO0tBQUE7QUFLQSxXQUFPLE9BQVAsQ0FOZ0I7RUFBQSxDQTVXbEIsQ0FBQTs7QUFBQSxFQW9aQSxJQUFDLENBQUEsa0JBQUQsR0FBc0IsU0FBRSxFQUFGLEVBQU0sT0FBTixHQUFBO0FBQ3BCLFFBQUEsc0JBQUE7QUFBQSxJQUFBLElBQUEsR0FBc0IsSUFBQyxDQUFBLE9BQUQsQ0FBUyxFQUFULEVBQWEsT0FBYixDQUF0QixDQUFBO0FBQUEsSUFDQSxNQUFBLEdBQXNCLElBQUksQ0FBQyxNQUQzQixDQUFBO0FBRUEsSUFBQSxJQUFnRSxJQUFNLENBQUEsTUFBQSxHQUFTLENBQVQsQ0FBTixLQUFzQixJQUF0RjtBQUFBLFlBQVUsSUFBQSxLQUFBLENBQU0sMEJBQUEsR0FBMEIsQ0FBQyxHQUFBLENBQUksT0FBSixDQUFELENBQWhDLENBQVYsQ0FBQTtLQUZBO0FBR0EsSUFBQSxJQUFnRSxJQUFNLENBQUEsTUFBQSxHQUFTLENBQVQsQ0FBTixLQUFzQixJQUF0RjtBQUFBLFlBQVUsSUFBQSxLQUFBLENBQU0sMEJBQUEsR0FBMEIsQ0FBQyxHQUFBLENBQUksT0FBSixDQUFELENBQWhDLENBQVYsQ0FBQTtLQUhBO0FBQUEsSUFJQSxJQUFNLENBQUEsTUFBQSxHQUFTLENBQVQsQ0FBTixHQUFzQixJQUp0QixDQUFBO0FBQUEsSUFLQSxHQUFBLEdBQXNCLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBWCxFQUFjLE1BQUEsR0FBUyxDQUF2QixDQUx0QixDQUFBO0FBQUEsSUFNQSxHQUFBLEdBQXNCLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBWCxFQUFjLE1BQUEsR0FBUyxDQUF2QixDQU50QixDQUFBO0FBT0EsV0FBTztBQUFBLE1BQUUsS0FBQSxHQUFGO0FBQUEsTUFBTyxLQUFBLEdBQVA7S0FBUCxDQVJvQjtFQUFBLENBcFp0QixDQUFBO0FBQUEiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIlxuXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuIyBuanNfdXRpbCAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAndXRpbCdcbiMgbmpzX3BhdGggICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ3BhdGgnXG4jIG5qc19mcyAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdmcydcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuQ05EICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2NuZCdcbnJwciAgICAgICAgICAgICAgICAgICAgICAgPSBDTkQucnByXG5iYWRnZSAgICAgICAgICAgICAgICAgICAgID0gJ0hPTExFUklUSC9tYWluJ1xubG9nICAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdwbGFpbicsICAgICBiYWRnZVxuZGVidWcgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdkZWJ1ZycsICAgICBiYWRnZVxud2FybiAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICd3YXJuJywgICAgICBiYWRnZVxuaGVscCAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdoZWxwJywgICAgICBiYWRnZVxudXJnZSAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICd1cmdlJywgICAgICBiYWRnZVxud2hpc3BlciAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICd3aGlzcGVyJywgICBiYWRnZVxuZWNobyAgICAgICAgICAgICAgICAgICAgICA9IENORC5lY2hvLmJpbmQgQ05EXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnN1c3BlbmQgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdjb2ZmZWVub2RlLXN1c3BlbmQnXG5zdGVwICAgICAgICAgICAgICAgICAgICAgID0gc3VzcGVuZC5zdGVwXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMjIyBodHRwczovL2dpdGh1Yi5jb20vZGVhbmxhbmRvbHQvYnl0ZXdpc2UgIyMjXG5CWVRFV0lTRSAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnYnl0ZXdpc2UnXG5fYnR3c19lbmNvZGUgICAgICAgICAgICAgID0gQllURVdJU0UuZW5jb2RlLmJpbmQgQllURVdJU0Vcbl9idHdzX2RlY29kZSAgICAgICAgICAgICAgPSBCWVRFV0lTRS5kZWNvZGUuYmluZCBCWVRFV0lTRVxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5EICAgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAncGlwZWRyZWFtczInXG4kICAgICAgICAgICAgICAgICAgICAgICAgID0gRC5yZW1pdC5iaW5kIERcbl9uZXdfbGV2ZWxfZGIgICAgICAgICAgICAgPSByZXF1aXJlICdsZXZlbCdcbmxldmVsZG93biAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdsZXZlbC9ub2RlX21vZHVsZXMvbGV2ZWxkb3duJ1xuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5zdXNwZW5kICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnY29mZmVlbm9kZS1zdXNwZW5kJ1xuc3RlcCAgICAgICAgICAgICAgICAgICAgICA9IHN1c3BlbmQuc3RlcFxucmVwZWF0X2ltbWVkaWF0ZWx5ICAgICAgICA9IHN1c3BlbmQucmVwZWF0X2ltbWVkaWF0ZWx5XG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkxPREFTSCAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdsb2Rhc2gnXG5cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AcGhyYXNldHlwZXMgICAgICA9IFsgJ3BvcycsICdzcG8nLCBdXG5AX21pc2ZpdCAgICAgICAgICA9IFN5bWJvbCAnbWlzZml0J1xuQF96ZXJvICAgICAgICAgICAgPSB0cnVlXG5AX3plcm9fZW5jICAgICAgICA9IF9idHdzX2VuY29kZSBAX3plcm9cbkBfbG9fZW5jICAgICAgICAgID0gX2J0d3NfZW5jb2RlIG51bGxcbkBfaGlfZW5jICAgICAgICAgID0gX2J0d3NfZW5jb2RlIHVuZGVmaW5lZFxuQF9sYXN0X29jdGV0ICAgICAgPSBuZXcgQnVmZmVyIFsgMHhmZiwgXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBuZXdfZGIgPSAoIHJvdXRlICkgLT5cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBsZXZlbF9zZXR0aW5ncyA9XG4gICAgJ2tleUVuY29kaW5nJzogICAgICAgICAgJ2JpbmFyeSdcbiAgICAndmFsdWVFbmNvZGluZyc6ICAgICAgICAnYmluYXJ5J1xuICAgICdjcmVhdGVJZk1pc3NpbmcnOiAgICAgIHRydWVcbiAgICAnZXJyb3JJZkV4aXN0cyc6ICAgICAgICBmYWxzZVxuICAgICdjb21wcmVzc2lvbic6ICAgICAgICAgIHllc1xuICAgICdzeW5jJzogICAgICAgICAgICAgICAgIG5vXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3Vic3RyYXRlICAgICAgICAgICA9IF9uZXdfbGV2ZWxfZGIgcm91dGUsIGxldmVsX3NldHRpbmdzXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgUiA9XG4gICAgJ35pc2EnOiAgICAgICAgICAgJ0hPTExFUklUSC9kYidcbiAgICAnJXNlbGYnOiAgICAgICAgICBzdWJzdHJhdGVcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICByZXR1cm4gUlxuXG4jICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBAX3Jlb3BlbiA9ICggZGIsIGhhbmRsZXIgKSAtPlxuIyAgIHN0ZXAgKCByZXN1bWUgKSA9PlxuIyAgICAgcm91dGUgPSBkYlsgJyVzZWxmJyBdWyAnbG9jYXRpb24nIF1cbiMgICAgIHlpZWxkIGRiWyAnJXNlbGYnIF0uY2xvc2UgcmVzdW1lXG4jICAgICB5aWVsZCBkYlsgJyVzZWxmJyBdLm9wZW4gcmVzdW1lXG4jICAgICB3aGlzcGVyIFwicmUtb3BlbmVkIExldmVsREIgYXQgI3tyb3V0ZX1cIlxuIyAgICAgaGFuZGxlciBudWxsXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQGNsZWFyID0gKCBkYiwgaGFuZGxlciApIC0+XG4gIHN0ZXAgKCByZXN1bWUgKSA9PlxuICAgIHJvdXRlID0gZGJbICclc2VsZicgXVsgJ2xvY2F0aW9uJyBdXG4gICAgeWllbGQgZGJbICclc2VsZicgXS5jbG9zZSByZXN1bWVcbiAgICB5aWVsZCBsZXZlbGRvd24uZGVzdHJveSByb3V0ZSwgcmVzdW1lXG4gICAgeWllbGQgZGJbICclc2VsZicgXS5vcGVuIHJlc3VtZVxuICAgICMgaGVscCBcImVyYXNlZCBhbmQgcmUtb3BlbmVkIExldmVsREIgYXQgI3tyb3V0ZX1cIlxuICAgIGhhbmRsZXIgbnVsbFxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyBXUklUSU5HXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkAkd3JpdGUgPSAoIGRiLCBidWZmZXJfc2l6ZSA9IDEwMDAgKSAtPlxuICAjIyMgRXhwZWN0cyBhIEhvbGxlcml0aCBEQiBvYmplY3QgYW5kIGFuIG9wdGlvbmFsIGJ1ZmZlciBzaXplOyByZXR1cm5zIGEgcGlwZSB0cmFuc2Zvcm1lciB0aGF0IGRvZXMgYWxsIG9mXG4gIHRoZSBmb2xsb3dpbmc6XG5cbiAgKiBJdCBleHBlY3RzIGFuIFNPIGtleSBmb3Igd2hpY2ggaXQgd2lsbCBnZW5lcmF0ZSBhIGNvcnJlc3BvbmRpbmcgT1Mga2V5LlxuICAqIEEgY29ycmVzcG9uZGluZyBPUyBrZXkgaXMgZm9ybXVsYXRlZCBleGNlcHQgd2hlbiB0aGUgU08ga2V5J3Mgb2JqZWN0IHZhbHVlIGlzIGEgSlMgb2JqZWN0IC8gYSBQT0QgKHNpbmNlXG4gICAgaW4gdGhhdCBjYXNlLCB0aGUgdmFsdWUgc2VyaWFsaXphdGlvbiBpcyBqb2xseSB1c2VsZXNzIGFzIGFuIGluZGV4KS5cbiAgKiBJdCBzZW5kcyBvbiBib3RoIHRoZSBTTyBhbmQgdGhlIE9TIGtleSBkb3duc3RyZWFtIGZvciBvcHRpb25hbCBmdXJ0aGVyIHByb2Nlc3NpbmcuXG4gICogSXQgZm9ybXMgYSBwcm9wZXIgYG5vZGUtbGV2ZWxgLWNvbXBhdGlibGUgYmF0Y2ggcmVjb3JkIGZvciBlYWNoIGtleSBhbmQgY29sbGVjdCBhbGwgcmVjb3Jkc1xuICAgIGluIGEgYnVmZmVyLlxuICAqIFdoZW5ldmVyIHRoZSBidWZmZXIgaGFzIG91dGdyb3duIHRoZSBnaXZlbiBidWZmZXIgc2l6ZSwgdGhlIGJ1ZmZlciB3aWxsIGJlIHdyaXR0ZW4gaW50byB0aGUgREIgdXNpbmdcbiAgICBgbGV2ZWx1cGAncyBgYmF0Y2hgIGNvbW1hbmQuXG4gICogV2hlbiB0aGUgbGFzdCBwZW5kaW5nIGJhdGNoIGhhcyBiZWVuIHdyaXR0ZW4gaW50byB0aGUgREIsIHRoZSBgZW5kYCBldmVudCBpcyBjYWxsZWQgb24gdGhlIHN0cmVhbVxuICAgIGFuZCBtYXkgYmUgZGV0ZWN0ZWQgZG93bnN0cmVhbS5cblxuICAjIyNcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICB0aHJvdyBuZXcgRXJyb3IgXCJidWZmZXIgc2l6ZSBtdXN0IGJlIHBvc2l0aXZlIGludGVnZXIsIGdvdCAje3JwciBidWZmZXJfc2l6ZX1cIiB1bmxlc3MgYnVmZmVyX3NpemUgPiAwXG4gIGJ1ZmZlciAgICAgID0gW11cbiAgc3Vic3RyYXRlICAgPSBkYlsgJyVzZWxmJyBdXG4gIGJhdGNoX2NvdW50ID0gMFxuICBoYXNfZW5kZWQgICA9IG5vXG4gIF9zZW5kICAgICAgID0gbnVsbFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHB1c2ggPSAoIGtleSwgdmFsdWUgKSA9PlxuICAgIHZhbHVlID0gaWYgdmFsdWU/IHRoZW4gQF9lbmNvZGUgZGIsIHZhbHVlIGVsc2UgQF96ZXJvX2VuY1xuICAgIGJ1ZmZlci5wdXNoIHsgdHlwZTogJ3B1dCcsIGtleTogKCBAX2VuY29kZSBkYiwga2V5ICksIHZhbHVlOiB2YWx1ZSwgfVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGZsdXNoID0gPT5cbiAgICBpZiBidWZmZXIubGVuZ3RoID4gMFxuICAgICAgYmF0Y2hfY291bnQgKz0gKzFcbiAgICAgICMgIyMjIC0tLSAjIyNcbiAgICAgICMgZm9yIHsga2V5LCB2YWx1ZSwgfSBpbiBidWZmZXJcbiAgICAgICMgICBkZWJ1ZyAnwqlBYkRVMScsICggQF9kZWNvZGUgZGIsIGtleSApLCAoIEBfZGVjb2RlIGRiLCB2YWx1ZSApXG4gICAgICAjICMjIyAtLS0gIyMjXG4gICAgICBzdWJzdHJhdGUuYmF0Y2ggYnVmZmVyLCAoIGVycm9yICkgPT5cbiAgICAgICAgdGhyb3cgZXJyb3IgaWYgZXJyb3I/XG4gICAgICAgIGJhdGNoX2NvdW50ICs9IC0xXG4gICAgICAgIF9zZW5kLmVuZCgpIGlmIGhhc19lbmRlZCBhbmQgYmF0Y2hfY291bnQgPCAxXG4gICAgICBidWZmZXIgPSBbXVxuICAgIGVsc2VcbiAgICAgIF9zZW5kLmVuZCgpXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcmV0dXJuICQgKCBzcG8sIHNlbmQsIGVuZCApID0+XG4gICAgIyBkZWJ1ZyAnwqlCcEpRdCcsIHNwb1xuICAgIF9zZW5kID0gc2VuZFxuICAgIGlmIHNwbz9cbiAgICAgIFsgc2JqLCBwcmQsIG9iaiwgXSA9IHNwb1xuICAgICAgcHVzaCBbICdzcG8nLCBzYmosIHByZCwgXSwgb2JqXG4gICAgICAjIGRlYnVnICfCqU9ZbWFEJywgWyAnc3BvJywgc2JqLCBwcmQsIF0sIG9ialxuICAgICAgIyMjIFRBSU5UIHdoYXQgdG8gc2VuZCwgaWYgYW55dGhpbmc/ICMjI1xuICAgICAgIyBzZW5kIGVudHJ5XG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIGlmIENORC5pc2FfcG9kIG9ialxuICAgICAgICAjIyMgRG8gbm90IGNyZWF0ZSBpbmRleCBlbnRyaWVzIGluIGNhc2UgYG9iamAgaXMgYSBQT0Q6ICMjI1xuICAgICAgICBudWxsXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIGVsc2UgaWYgQ05ELmlzYV9saXN0IG9ialxuICAgICAgICAjIyMgQ3JlYXRlIG9uZSBpbmRleCBlbnRyeSBmb3IgZWFjaCBlbGVtZW50IGluIGNhc2UgYG9iamAgaXMgYSBsaXN0OiAjIyNcbiAgICAgICAgZm9yIG9ial9lbGVtZW50LCBvYmpfaWR4IGluIG9ialxuICAgICAgICAgIHB1c2ggWyAncG9zJywgcHJkLCBvYmpfZWxlbWVudCwgc2JqLCBvYmpfaWR4LCBdXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIGVsc2VcbiAgICAgICAgIyMjIENyZWF0ZSBvbmUgaW5kZXggZW50cnkgZm9yIGBvYmpgIG90aGVyd2lzZTogIyMjXG4gICAgICAgIHB1c2ggWyAncG9zJywgcHJkLCBvYmosIHNiaiwgXVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBmbHVzaCgpIGlmIGJ1ZmZlci5sZW5ndGggPj0gYnVmZmVyX3NpemVcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICMjIyBGbHVzaCByZW1haW5pbmcgYnVmZmVyZWQgZW50cmllcyB0byBEQiAjIyNcbiAgICBpZiBlbmQ/XG4gICAgICBoYXNfZW5kZWQgPSB5ZXNcbiAgICAgIGZsdXNoKClcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgUkVBRElOR1xuIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQGNyZWF0ZV9rZXlzdHJlYW0gPSAoIGRiLCBsb19oaW50ID0gbnVsbCwgaGlfaGludCA9IG51bGwgKSAtPlxuIyAgICMjIyBUQUlOVCBjb2RlIGR1cGxpY2F0aW9uICMjI1xuIyAgIGlmIGxvX2hpbnQ/XG4jICAgICBpZiBoaV9oaW50P1xuIyAgICAgICBxdWVyeSA9IHsgZ3RlOiBsb19oaW50LCBsdGU6aGlfaGludCwgfVxuIyAgICAgZWxzZVxuIyAgICAgICBxdWVyeSA9IHsgZ3RlOiBsb19oaW50LCB9XG4jICAgZWxzZSBpZiBoaV9oaW50P1xuIyAgICAgcXVlcnkgPSB7IGx0ZTogaGlfaGludCwgfVxuIyAgIGVsc2VcbiMgICAgIHF1ZXJ5ID0gbnVsbFxuIyAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICBkZWJ1ZyAnwqk4MzVKUCcsIHF1ZXJ5XG4jICAgUiA9IGlmIHF1ZXJ5PyB0aGVuICggZGJbICclc2VsZicgXS5jcmVhdGVLZXlTdHJlYW0gcXVlcnkgKSBlbHNlIGRiWyAnJXNlbGYnIF0uY3JlYXRlS2V5U3RyZWFtKClcbiMgICAjIFIgPSBkYlsgJyVzZWxmJyBdLmNyZWF0ZUtleVN0cmVhbSBAbmV3X3F1ZXJ5IGRiLCBxdWVyeVxuIyAgICMjIyBUQUlOVCBTaG91bGQgd2UgdGVzdCBmb3Igd2VsbC1mb3JtZWQgZW50cmllcyBoZXJlPyAjIyNcbiMgICBSID0gUi5waXBlICQgKCBia2V5LCBzZW5kICkgPT4gc2VuZCBAX2RlY29kZSBkYiwgYmtleVxuIyAgIHJldHVybiBSXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQGNyZWF0ZV9waHJhc2VzdHJlYW0gPSAoIGRiLCBsb19oaW50ID0gbnVsbCwgaGlfaGludCA9IG51bGwgKSAtPlxuICBSID0gQGNyZWF0ZV9mYWNldHN0cmVhbSBkYiwgbG9faGludCwgaGlfaGludFxuICAgIC5waXBlIEAkYXNfcGhyYXNlIGRiXG4gIHJldHVybiBSXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQGNyZWF0ZV9mYWNldHN0cmVhbSA9ICggZGIsIGxvX2hpbnQgPSBudWxsLCBoaV9oaW50ID0gbnVsbCApIC0+XG4gICMjI1xuICAqIElmIG5vIGhpbnQgaXMgZ2l2ZW4sIGFsbCBlbnRyaWVzIHdpbGwgYmUgZ2l2ZW4gaW4gdGhlIHN0cmVhbS5cbiAgKiBJZiBib3RoIGBsb19oaW50YCBhbmQgYGhpX2hpbnRgIGFyZSBnaXZlbiwgYSBxdWVyeSB3aXRoIGxvd2VyIGFuZCB1cHBlciwgaW5jbHVzaXZlIGJvdW5kYXJpZXMgaXNcbiAgICBpc3N1ZWQuXG4gICogSWYgb25seSBgbG9faGludGAgaXMgZ2l2ZW4sIGEgcHJlZml4IHF1ZXJ5IGlzIGlzc3VlZC5cbiAgKiBJZiBgaGlfaGludGAgaXMgZ2l2ZW4gYnV0IGBsb19oaW50YCBpcyBtaXNzaW5nLCBhbiBlcnJvciBpcyBpc3N1ZWQuXG4gICMjI1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGlmIGhpX2hpbnQ/IGFuZCBub3QgbG9faGludD9cbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJtdXN0IGdpdmUgYGxvX2hpbnRgIHdoZW4gYGhpX2hpbnRgIGlzIGdpdmVuXCJcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBpZiBsb19oaW50IGFuZCBub3QgaGlfaGludD9cbiAgICBxdWVyeSAgICAgICA9IEBfcXVlcnlfZnJvbV9wcmVmaXggZGIsIGxvX2hpbnRcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBlbHNlXG4gICAgbG9faGludF9lbmMgPSBpZiBsb19oaW50PyB0aGVuICAgICAgICAgICAgKCBAX2VuY29kZSBkYiwgbG9faGludCApICAgICAgICAgIGVsc2UgQF9sb19lbmNcbiAgICBoaV9oaW50X2VuYyA9IGlmIGhpX2hpbnQ/IHRoZW4gKCBAX3F1ZXJ5X2Zyb21fcHJlZml4IGRiLCBoaV9oaW50IClbICdsdGUnIF0gZWxzZSBAX2hpX2VuY1xuICAgIHF1ZXJ5ICAgICAgID0geyBndGU6IGxvX2hpbnRfZW5jLCBsdGU6IGhpX2hpbnRfZW5jLCB9XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgUiAgICAgICAgID0gZGJbICclc2VsZicgXS5jcmVhdGVSZWFkU3RyZWFtIHF1ZXJ5XG4gICMjIyBUQUlOVCBTaG91bGQgd2UgdGVzdCBmb3Igd2VsbC1mb3JtZWQgZW50cmllcyBoZXJlPyAjIyNcbiAgUiAgICAgICAgID0gUi5waXBlICQgKCB7IGtleSwgdmFsdWUgfSwgc2VuZCApID0+IHNlbmQgWyAoIEBfZGVjb2RlIGRiLCBrZXkgKSwgKCBAX2RlY29kZSBkYiwgdmFsdWUgKSwgXVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHJldHVybiBSXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQHJlYWRfbWFueSA9ICggZGIsIGhpbnQgPSBudWxsICkgLT5cbiAgIyMjIEhpbnRzIGFyZSBpbnRlcnByZXRlZCBhcyBwYXJ0aWFsIHNlY29uZGFyeSAoUE9TKSBrZXlzLiAjIyNcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AcmVhZF9vbmUgPSAoIGRiLCBrZXksIGZhbGxiYWNrID0gQF9taXNmaXQsIGhhbmRsZXIgKSAtPlxuICAjIyMgSGludHMgYXJlIGludGVycHJldGVkIGFzIGNvbXBsZXRlIHByaW1hcnkgKFNQTykga2V5cy4gIyMjXG4gIHN3aXRjaCBhcml0eSA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICB3aGVuIDNcbiAgICAgIGhhbmRsZXIgICA9IGZhbGxiYWNrXG4gICAgICBmYWxsYmFjayAgPSBAX21pc2ZpdFxuICAgIHdoZW4gNCB0aGVuIG51bGxcbiAgICBlbHNlIHRocm93IG5ldyBFcnJvciBcImV4cGVjdGVkIDMgb3IgNCBhcmd1bWVudHMsIGdvdCAje2FyaXR5fVwiXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZGJbICclc2VsZicgXS5nZXQga2V5LCBoYW5kbGVyXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQHJlYWRfc3ViID0gKCBkYiwgc2V0dGluZ3MsIHJlYWQgKSAtPlxuICBzd2l0Y2ggYXJpdHkgPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgd2hlbiAyXG4gICAgICByZWFkICAgICAgPSBzZXR0aW5nc1xuICAgICAgc2V0dGluZ3MgID0gbnVsbFxuICAgIHdoZW4gM1xuICAgICAgbnVsbFxuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBFcnJvciBcImV4cGVjdGVkIDIgb3IgMyBhcmd1bWVudHMsIGdvdCAje2FyaXR5fVwiXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgaW5kZXhlZCAgICAgICAgICAgPSBzZXR0aW5ncz9bICdpbmRleGVkJyAgICBdID8gbm9cbiAgIyB0cmFuc2Zvcm0gICAgICAgICA9IHNldHRpbmdzP1sgJ3RyYW5zZm9ybScgIF0gPyBELiRwYXNzX3Rocm91Z2goKVxuICBtYW5nbGUgICAgICAgICAgICA9IHNldHRpbmdzP1sgJ21hbmdsZScgICAgIF0gPyAoIGRhdGEgKSAtPiBkYXRhXG4gIHNlbmRfZW1wdHkgICAgICAgID0gc2V0dGluZ3M/WyAnZW1wdHknICAgICAgXSA/IG5vXG4gIGluc2VydF9pbmRleCAgICAgID0gaWYgaW5kZXhlZCB0aGVuIEQubmV3X2luZGV4ZXIoKSBlbHNlICggeCApIC0+IHhcbiAgb3Blbl9zdHJlYW1fY291bnQgPSAwXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcmV0dXJuICQgKCBvdXRlcl9kYXRhLCBvdXRlcl9zZW5kLCBvdXRlcl9lbmQgKSA9PlxuICAgIGNvdW50ID0gMFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaWYgb3V0ZXJfZGF0YT9cbiAgICAgIG9wZW5fc3RyZWFtX2NvdW50ICAgICs9ICsxXG4gICAgICBzdWJfaW5wdXQgICAgICAgICAgICAgPSByZWFkIG91dGVyX2RhdGFcbiAgICAgIFsgbWVtbywgc3ViX2lucHV0LCBdICA9IGlmIENORC5pc2FfbGlzdCBzdWJfaW5wdXQgdGhlbiBzdWJfaW5wdXQgZWxzZSBbIEBfbWlzZml0LCBzdWJfaW5wdXQsIF1cbiAgICAgIHN1Yl9pbnB1dFxuICAgICAgICAjIC5waXBlIHRyYW5zZm9ybVxuICAgICAgICAucGlwZSBkbyA9PlxuICAgICAgICAgICMjIyBUQUlOVCBubyBuZWVkIHRvIGJ1aWxkIGJ1ZmZlciBpZiBub3QgYHNlbmRfZW1wdHlgIGFuZCB0aGVyZSBhcmUgbm8gcmVzdWx0cyAjIyNcbiAgICAgICAgICBidWZmZXIgPSBpZiBtZW1vIGlzIEBfbWlzZml0IHRoZW4gW10gZWxzZSBbIG1lbW8sIF1cbiAgICAgICAgICByZXR1cm4gJCAoIGlubmVyX2RhdGEsIF8sIGlubmVyX2VuZCApID0+XG4gICAgICAgICAgICBpZiBpbm5lcl9kYXRhP1xuICAgICAgICAgICAgICBpbm5lcl9kYXRhID0gbWFuZ2xlIGlubmVyX2RhdGFcbiAgICAgICAgICAgICAgaWYgaW5uZXJfZGF0YT9cbiAgICAgICAgICAgICAgICBjb3VudCArPSArMVxuICAgICAgICAgICAgICAgIGJ1ZmZlci5wdXNoIGlubmVyX2RhdGFcbiAgICAgICAgICAgIGlmIGlubmVyX2VuZD9cbiAgICAgICAgICAgICAgaWYgc2VuZF9lbXB0eSBvciBjb3VudCA+IDBcbiAgICAgICAgICAgICAgICBvdXRlcl9zZW5kIGluc2VydF9pbmRleCBidWZmZXJcbiAgICAgICAgICAgICAgb3Blbl9zdHJlYW1fY291bnQgKz0gLTFcbiAgICAgICAgICAgICAgaW5uZXJfZW5kKClcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGlmIG91dGVyX2VuZD9cbiAgICAgIHJlcGVhdF9pbW1lZGlhdGVseSAtPlxuICAgICAgICByZXR1cm4gdHJ1ZSB1bmxlc3Mgb3Blbl9zdHJlYW1fY291bnQgaXMgMFxuICAgICAgICBvdXRlcl9lbmQoKVxuICAgICAgICByZXR1cm4gZmFsc2VcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgS0VZIEFORCBQUkVGSVhFU1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX2VuY29kZSA9ICggZGIsIGtleSApIC0+XG4gIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwga2V5ICN7cnByIGtleX1cIiBpZiBrZXkgaXMgdW5kZWZpbmVkXG4gIHJldHVybiBfYnR3c19lbmNvZGUga2V5XG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9kZWNvZGUgPSAoIGRiLCBrZXkgKSAtPlxuICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIGtleSAje3JwciBrZXl9XCIgaWYgKCBSID0gX2J0d3NfZGVjb2RlIGtleSApIGlzIHVuZGVmaW5lZFxuICByZXR1cm4gUlxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMjIyBOQiBBcmd1bWVudCBvcmRlcmluZyBmb3IgdGhlc2UgZnVuY3Rpb24gaXMgYWx3YXlzIHN1YmplY3QgYmVmb3JlIG9iamVjdCwgcmVnYXJkbGVzcyBvZiB0aGUgcGhyYXNldHlwZVxuYW5kIHRoZSBvcmRlcmluZyBpbiB0aGUgcmVzdWx0aW5nIGtleS4gIyMjXG5AbmV3X2tleSA9ICggZGIsIHBocmFzZXR5cGUsIHNrLCBzdiwgb2ssIG92LCBpZHggKSAtPlxuICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIHBocmFzZXR5cGU6ICN7cnByIHBocmFzZXR5cGV9XCIgdW5sZXNzIHBocmFzZXR5cGUgaW4gWyAnc28nLCAnb3MnLCBdXG4gIFsgc2ssIHN2LCBvaywgb3YsIF0gPSBbIG9rLCBvdiwgc2ssIHN2LCBdIGlmIHBocmFzZXR5cGUgaXMgJ29zJ1xuICByZXR1cm4gWyBwaHJhc2V0eXBlLCBzaywgc3YsIG9rLCBvdiwgKCBpZHggPyAwICksIF1cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AbmV3X3NvX2tleSA9ICggZGIsIFAuLi4gKSAtPiBAbmV3X2tleSBkYiwgJ3NvJywgUC4uLlxuQG5ld19vc19rZXkgPSAoIGRiLCBQLi4uICkgLT4gQG5ld19rZXkgZGIsICdvcycsIFAuLi5cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX25ld19vc19rZXlfZnJvbV9zb19rZXkgPSAoIGRiLCBzb19rZXkgKSAtPlxuICBbIHBocmFzZXR5cGUsIHNrLCBzdiwgb2ssIG92LCBpZHgsIF0gPSBAYXNfcGhyYXNlIGRiLCBzb19rZXlcbiAgdGhyb3cgbmV3IEVycm9yIFwiZXhwZWN0ZWQgcGhyYXNldHlwZSAnc28nLCBnb3QgI3tycHIgcGhyYXNldHlwZX1cIiB1bmxlc3MgcGhyYXNldHlwZSBpcyAnc28nXG4gIHJldHVybiBbICdvcycsIG9rLCBvdiwgc2ssIHN2LCBpZHgsIF1cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AbmV3X2tleXMgPSAoIGRiLCBwaHJhc2V0eXBlLCBzaywgc3YsIG9rLCBvdiwgaWR4ICkgLT5cbiAgb3RoZXJfcGhyYXNldHlwZSAgPSBpZiBwaHJhc2V0eXBlIGlzICdzbycgdGhlbiAnb3MnIGVsc2UgJ3NvJ1xuICByZXR1cm4gW1xuICAgICggQG5ld19rZXkgZGIsICAgICAgIHBocmFzZXR5cGUsIHNrLCBzdiwgb2ssIG92LCBpZHggKSxcbiAgICAoIEBuZXdfa2V5IGRiLCBvdGhlcl9waHJhc2V0eXBlLCBzaywgc3YsIG9rLCBvdiwgaWR4ICksIF1cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AYXNfcGhyYXNlID0gKCBkYiwga2V5LCB2YWx1ZSA9IEBfemVyb19lbmMgKSAtPlxuICBzd2l0Y2ggcGhyYXNldHlwZSA9IGtleVsgMCBdXG4gICAgd2hlbiAnc3BvJ1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBTUE8ga2V5IChsZW5ndGggI3tsZW5ndGh9KVwiIHVubGVzcyAoIGxlbmd0aCA9IGtleS5sZW5ndGggKSBpcyAzXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIHZhbHVlICN7cnByIHZhbHVlfVwiIGlmIHZhbHVlIGluIFsgQF96ZXJvX2VuYywgdW5kZWZpbmVkLCBdXG4gICAgICByZXR1cm4gWyBrZXlbIDEgXSwga2V5WyAyIF0sIHZhbHVlLCBdXG4gICAgd2hlbiAncG9zJ1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBQT1Mga2V5IChsZW5ndGggI3tsZW5ndGh9KVwiIHVubGVzcyA0IDw9ICggbGVuZ3RoID0ga2V5Lmxlbmd0aCApIDw9IDVcbiAgICAgIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgdmFsdWUgI3tycHIgdmFsdWV9XCIgaWYgbm90ICggdmFsdWUgaW4gWyBAX3plcm8sIHVuZGVmaW5lZCwgXSApXG4gICAgICBbIF8sIHByZCwgb2JqLCBzYmosIGlkeCwgXSA9IGtleVxuICAgICAgcmV0dXJuIGlmIGlkeD8gdGhlbiBbIHNiaiwgcHJkLCBvYmosIGlkeCwgXSBlbHNlIFsgc2JqLCBwcmQsIG9iaiwgXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkAkYXNfcGhyYXNlID0gKCBkYiApIC0+XG4gIHJldHVybiAkICggZGF0YSwgc2VuZCApID0+XG4gICAgc2VuZCBAYXNfcGhyYXNlIGRiLCBkYXRhLi4uXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQGtleV9mcm9tX3VybCA9ICggZGIsIHVybCApIC0+XG4gICMjIyBUQUlOIGRvZXMgbm90IHVuZXNjYXBlIGFzIHlldCAjIyNcbiAgIyMjIFRBSU4gZG9lcyBub3QgY2FzdCB2YWx1ZXMgYXMgeWV0ICMjI1xuICAjIyMgVEFJTlQgZG9lcyBub3Qgc3VwcG9ydCBtdWx0aXBsZSBpbmRleGVzIGFzIHlldCAjIyNcbiAgWyBwaHJhc2V0eXBlLCBmaXJzdCwgc2Vjb25kLCBpZHgsIF0gPSB1cmwuc3BsaXQgJ3wnXG4gIHVubGVzcyBwaHJhc2V0eXBlPyBhbmQgcGhyYXNldHlwZS5sZW5ndGggPiAwIGFuZCBwaHJhc2V0eXBlIGluIFsgJ3NvJywgJ29zJywgXVxuICAgIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgVVJMIGtleSAje3JwciB1cmx9XCJcbiAgdW5sZXNzIGZpcnN0PyBhbmQgZmlyc3QubGVuZ3RoID4gMCBhbmQgc2Vjb25kPyBhbmQgc2Vjb25kLmxlbmd0aCA+IDBcbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIFVSTCBrZXkgI3tycHIgdXJsfVwiXG4gIGlkeCA9IGlmICggaWR4PyBhbmQgaWR4Lmxlbmd0aCA+IDAgKSB0aGVuICggcGFyc2VJbnQgaWR4LCAxMCApIGVsc2UgMFxuICBbIHNrLCBzdiwgXSA9ICBmaXJzdC5zcGxpdCAnOidcbiAgWyBvaywgb3YsIF0gPSBzZWNvbmQuc3BsaXQgJzonXG4gIHVubGVzcyBzaz8gYW5kIHNrLmxlbmd0aCA+IDAgYW5kIG9rPyBhbmQgb2subGVuZ3RoID4gMFxuICAgIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgVVJMIGtleSAje3JwciB1cmx9XCJcbiAgWyBzaywgc3YsIG9rLCBvdiwgXSA9IFsgb2ssIG92LCBzaywgc3YsIF0gaWYgcGhyYXNldHlwZSBpcyAnb3MnXG4gIHJldHVybiBbIHBocmFzZXR5cGUsIHNrLCBzdiwgb2ssIG92LCBpZHgsIF1cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AdXJsX2Zyb21fa2V5ID0gKCBkYiwga2V5ICkgLT5cbiAgaWYgKCBAX3R5cGVfZnJvbV9rZXkgZGIsIGtleSApIGlzICdsaXN0J1xuICAgIFsgcGhyYXNldHlwZSwgazAsIHYwLCBrMSwgdjEsIGlkeCwgXSA9IGtleVxuICAgIGlkeF9ycHIgPSBpZiBpZHg/IHRoZW4gcnByIGlkeCBlbHNlICcnXG4gICAgIyMjIFRBSU5UIHNob3VsZCBlc2NhcGUgbWV0YWNocnMgYHxgLCAnOicgIyMjXG4gICAgIyMjIFRBSU5UIHNob3VsZCB1c2UgYHJwcmAgb24gcGFydHMgb2Ygc3BlZWNoIChlLmcuIG9iamVjdCB2YWx1ZSBjb3VsZCBiZSBhIG51bWJlciBldGMuKSAjIyNcbiAgICByZXR1cm4gXCIje3BocmFzZXR5cGV9fCN7azB9OiN7djB9fCN7azF9OiN7djF9fCN7aWR4X3Jwcn1cIlxuICByZXR1cm4gXCIje3JwciBrZXl9XCJcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AJHVybF9mcm9tX2tleSA9ICggZGIgKSAtPiAkICgga2V5LCBzZW5kICkgPT4gc2VuZCBAdXJsX2Zyb21fa2V5IGRiLCBrZXlcbkAka2V5X2Zyb21fdXJsID0gKCBkYiApIC0+ICQgKCB1cmwsIHNlbmQgKSA9PiBzZW5kIEBrZXlfZnJvbV91cmwgZGIsIGtleVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfdHlwZV9mcm9tX2tleSA9ICggZGIsIGtleSApIC0+XG4gIGlmIEFycmF5LmlzQXJyYXkga2V5XG4gICAgdGhyb3cgbmV3IEVycm9yIFwiaWxsZWdhbCBrZXk6ICN7cnByIGtleX1cIiB1bmxlc3Mga2V5Lmxlbmd0aCBpcyA2XG4gICAgWyBwaHJhc2V0eXBlLCBmaXJzdCwgc2Vjb25kLCBpZHgsIF0gPSBrZXlcbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIHBocmFzZXR5cGU6ICN7cnByIGtleX1cIiB1bmxlc3MgcGhyYXNldHlwZSBpbiBbICdzbycsICdvcycsIF1cbiAgICByZXR1cm4gJ2xpc3QnXG4gIHJldHVybiAnb3RoZXInXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIFBSRUZJWEVTIC8gUVVFUklFU1xuIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQG5ld19xdWVyeSA9ICggZGIsIGhpbnQgKSAtPlxuIyAgIHN3aXRjaCB0eXBlID0gQ05ELnR5cGVfb2YgaGludFxuIyAgICAgd2hlbiAndGV4dCcgICAgICAgICAgICAgICAgICAgdGhlbiByZXR1cm4gQF9xdWVyeV9mcm9tX3BhcnRpYWxfdXJsIGRiLCBoaW50XG4jICAgICB3aGVuICdsaXN0JyAgICAgICAgICAgICAgICAgICB0aGVuIHJldHVybiBAX3F1ZXJ5X2Zyb21fcGFydGlhbF9rZXkgZGIsIGhpbnRcbiMgICAgIHdoZW4gJ3BvZCcsICdIT0xMRVJJVEgvcXVlcnknIHRoZW4gcmV0dXJuIExPREFTSC5jbG9uZURlZXAgaGludFxuIyAgIHRocm93IG5ldyBFcnJvciBcImV4cGVjdGVkIGEgcGFydGlhbCBVUkwgKGEgdGV4dCkgb3Iga2V5IChhIGxpc3QpLCBnb3QgYSAje3R5cGV9XCJcblxuIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQF9xdWVyeV9mcm9tX3BhcnRpYWxfdXJsID0gKCBkYiwgcHVybCApIC0+XG4jICAgWyBwaHJhc2V0eXBlLCB0YWlsLCBdID0gcHVybC5zcGxpdCAnfCcsIDJcbiMgICBbIGswLCB2MCwgXSAgICAgICAgICAgPSBpZiB0YWlsPyB0aGVuICggdGFpbC5zcGxpdCAnOicsIDIgKSBlbHNlIFsgbnVsbCwgbnVsbCwgXVxuIyAgIHBrZXkgICAgICAgICAgICAgICAgICA9IFsgcGhyYXNldHlwZSwgXVxuIyAgIHBrZXkucHVzaCBrMCBpZiBrMD9cbiMgICBwa2V5LnB1c2ggdjAgaWYgdjA/XG4jICAgcmV0dXJuIEBfcXVlcnlfZnJvbV9wYXJ0aWFsX2tleSBkYiwgcGtleVxuXG4jICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBAX3F1ZXJ5X2Zyb21fcGFydGlhbF9rZXkgPSAoIGRiLCBwa2V5ICkgLT5cbiMgICBiYXNlICAgICAgICAgICAgICAgID0gQF9lbmNvZGUgZGIsIHBrZXlcbiMgICBsZW5ndGggICAgICAgICAgICAgID0gYmFzZS5sZW5ndGhcbiMgICB0aHJvdyBuZXcgRXJyb3IgXCJpbGxlZ2FsIHByZWZpeC1rZXkgKDEpOiAje3JwciBwa2V5fVwiIHVubGVzcyBiYXNlWyBsZW5ndGggLSAxIF0gaXMgMHgwMFxuIyAgIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgcHJlZml4LWtleSAoMik6ICN7cnByIHBrZXl9XCIgdW5sZXNzIGJhc2VbIGxlbmd0aCAtIDIgXSBpcyAweDAwXG4jICAgYmFzZVsgbGVuZ3RoIC0gMiBdICA9IDB4ZmZcbiMgICBndGUgICAgICAgICAgICAgICAgID0gYmFzZS5zbGljZSAwLCBsZW5ndGggLSAyXG4jICAgbHRlICAgICAgICAgICAgICAgICA9IGJhc2Uuc2xpY2UgMCwgbGVuZ3RoIC0gMVxuIyAgIHJldHVybiB7IGd0ZSwgbHRlLCB9XG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9xdWVyeV9mcm9tX3ByZWZpeCA9ICggZGIsIGxvX2hpbnQgKSAtPlxuICBiYXNlICAgICAgICAgICAgICAgID0gQF9lbmNvZGUgZGIsIGxvX2hpbnRcbiAgbGVuZ3RoICAgICAgICAgICAgICA9IGJhc2UubGVuZ3RoXG4gIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgcHJlZml4LWtleSAoMSk6ICN7cnByIGxvX2hpbnR9XCIgdW5sZXNzIGJhc2VbIGxlbmd0aCAtIDEgXSBpcyAweDAwXG4gIHRocm93IG5ldyBFcnJvciBcImlsbGVnYWwgcHJlZml4LWtleSAoMik6ICN7cnByIGxvX2hpbnR9XCIgdW5sZXNzIGJhc2VbIGxlbmd0aCAtIDIgXSBpcyAweDAwXG4gIGJhc2VbIGxlbmd0aCAtIDIgXSAgPSAweGZmXG4gIGd0ZSAgICAgICAgICAgICAgICAgPSBiYXNlLnNsaWNlIDAsIGxlbmd0aCAtIDJcbiAgbHRlICAgICAgICAgICAgICAgICA9IGJhc2Uuc2xpY2UgMCwgbGVuZ3RoIC0gMVxuICByZXR1cm4geyBndGUsIGx0ZSwgfVxuXG5cblxuXG5cbiJdfQ==