(function() {
  var CND, _decode, _encode, _invert_buffer, badge, buffer_too_short_error, bytecount_date, bytecount_number, bytecount_singular, debug, grow_rbuffer, last_unicode_chr, max_bytes_per_chr, rbuffer, rbuffer_delta_size, rbuffer_max_size, rbuffer_min_size, rbuffer_new_size, read_date, read_list, read_nnumber, read_pnumber, read_singular, read_text, release_extraneous_rbuffer_bytes, rpr, tm_date, tm_false, tm_hi, tm_list, tm_lo, tm_ninfinity, tm_nnumber, tm_null, tm_pinfinity, tm_pnumber, tm_text, tm_true, warn, write, write_date, write_infinity, write_number, write_singular, write_text;

  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'HOLLERITH/CODEC';

  debug = CND.get_logger('debug', badge);

  warn = CND.get_logger('warn', badge);

  last_unicode_chr = (String.fromCharCode(0xdbff)) + (String.fromCharCode(0xdfff));


  /* should always be 3 in modern versions of NodeJS: */

  max_bytes_per_chr = Math.max((new Buffer("\uffff")).length, (new Buffer(last_unicode_chr)).length / 2);

  rbuffer_min_size = 1024;

  rbuffer_delta_size = 1024;

  rbuffer_max_size = 65536;

  rbuffer_new_size = Math.floor((rbuffer_max_size + rbuffer_min_size) / 2);

  rbuffer = new Buffer(rbuffer_min_size);

  buffer_too_short_error = new Error("buffer too short");

  this['typemarkers'] = {};

  tm_lo = this['typemarkers']['lo'] = 0x00;

  tm_null = this['typemarkers']['null'] = 'B'.codePointAt(0);

  tm_false = this['typemarkers']['false'] = 'C'.codePointAt(0);

  tm_true = this['typemarkers']['true'] = 'D'.codePointAt(0);

  tm_list = this['typemarkers']['list'] = 'E'.codePointAt(0);

  tm_date = this['typemarkers']['date'] = 'G'.codePointAt(0);

  tm_ninfinity = this['typemarkers']['ninfinity'] = 'J'.codePointAt(0);

  tm_nnumber = this['typemarkers']['nnumber'] = 'K'.codePointAt(0);

  tm_pnumber = this['typemarkers']['pnumber'] = 'L'.codePointAt(0);

  tm_pinfinity = this['typemarkers']['pinfinity'] = 'M'.codePointAt(0);

  tm_text = this['typemarkers']['text'] = 'T'.codePointAt(0);

  tm_hi = this['typemarkers']['hi'] = 0xff;

  this['bytecounts'] = {};

  bytecount_singular = this['bytecounts']['singular'] = 1;

  bytecount_number = this['bytecounts']['number'] = 9;

  bytecount_date = this['bytecounts']['date'] = bytecount_number + 1;

  this['sentinels'] = {};


  /* http://www.merlyn.demon.co.uk/js-datex.htm */

  this['sentinels']['firstdate'] = new Date(-8640000000000000);

  this['sentinels']['lastdate'] = new Date(+8640000000000000);

  this['keys'] = {};

  this['keys']['lo'] = new Buffer([this['typemarkers']['lo']]);

  this['keys']['hi'] = new Buffer([this['typemarkers']['hi']]);

  grow_rbuffer = function(delta_size) {
    var new_result_buffer;
    if (delta_size == null) {
      delta_size = rbuffer_delta_size;
    }
    if (delta_size < 1) {
      return null;
    }
    new_result_buffer = new Buffer(rbuffer.length + delta_size);
    rbuffer.copy(new_result_buffer);
    rbuffer = new_result_buffer;
    return null;
  };

  release_extraneous_rbuffer_bytes = function() {
    if (rbuffer.length > rbuffer_max_size) {
      rbuffer = new Buffer(rbuffer_new_size);
    }
    return null;
  };

  write_singular = function(idx, value) {
    var typemarker;
    if (!(rbuffer.length >= idx + bytecount_singular)) {
      throw buffer_too_short_error;
    }
    if (value === null) {
      typemarker = tm_null;
    } else if (value === false) {
      typemarker = tm_false;
    } else if (value === true) {
      typemarker = tm_true;
    } else {
      throw new Error("unable to encode value of type " + (CND.type_of(value)));
    }
    rbuffer[idx] = typemarker;
    return idx + bytecount_singular;
  };

  read_singular = function(buffer, idx) {
    var typemarker, value;
    switch (typemarker = buffer[idx]) {
      case tm_null:
        value = null;
        break;
      case tm_false:
        value = false;
        break;
      case tm_true:
        value = true;
        break;
      default:
        throw new Error("unable to decode 0x" + (typemarker.toString(16)) + " at index " + idx + " (" + (rpr(buffer)) + ")");
    }
    return [idx + bytecount_singular, value];
  };

  write_number = function(idx, number) {
    var type;
    if (!(rbuffer.length >= idx + bytecount_number)) {
      throw buffer_too_short_error;
    }
    if (number < 0) {
      type = tm_nnumber;
      number = -number;
    } else {
      type = tm_pnumber;
    }
    rbuffer[idx] = type;
    rbuffer.writeDoubleBE(number, idx + 1);
    if (type === tm_nnumber) {
      _invert_buffer(rbuffer, idx);
    }
    return idx + bytecount_number;
  };

  write_infinity = function(idx, number) {
    if (!(rbuffer.length >= idx + bytecount_singular)) {
      throw buffer_too_short_error;
    }
    rbuffer[idx] = number === -Infinity ? tm_ninfinity : tm_pinfinity;
    return idx + bytecount_singular;
  };

  read_nnumber = function(buffer, idx) {
    var copy;
    if (buffer[idx] !== tm_nnumber) {
      throw new Error("not a negative number at index " + idx);
    }
    copy = _invert_buffer(new Buffer(buffer.slice(idx, idx + bytecount_number)), 0);
    return [idx + bytecount_number, -(copy.readDoubleBE(1))];
  };

  read_pnumber = function(buffer, idx) {
    if (buffer[idx] !== tm_pnumber) {
      throw new Error("not a positive number at index " + idx);
    }
    return [idx + bytecount_number, buffer.readDoubleBE(idx + 1)];
  };

  _invert_buffer = function(buffer, idx) {
    var i, j, ref, ref1;
    for (i = j = ref = idx + 1, ref1 = idx + 8; ref <= ref1 ? j <= ref1 : j >= ref1; i = ref <= ref1 ? ++j : --j) {
      buffer[i] = ~buffer[i];
    }
    return buffer;
  };

  write_date = function(idx, date) {
    var new_idx, number;
    number = +date;
    rbuffer[idx] = tm_date;
    new_idx = write_number(idx + 1, number);
    return new_idx;
  };

  read_date = function(buffer, idx) {
    var ref, ref1, type, value;
    if (buffer[idx] !== tm_date) {
      throw new Error("not a date at index " + idx);
    }
    switch (type = buffer[idx + 1]) {
      case tm_nnumber:
        ref = read_nnumber(buffer, idx + 1), idx = ref[0], value = ref[1];
        break;
      case tm_pnumber:
        ref1 = read_pnumber(buffer, idx + 1), idx = ref1[0], value = ref1[1];
        break;
      default:
        throw new Error("unknown date type marker 0x" + (type.toString(16)) + " at index " + idx);
    }
    return [idx, new Date(value)];
  };

  write_text = function(idx, text) {
    var byte_count, length_estimate;
    text = text.replace(/\x01/g, '\x01\x02');
    text = text.replace(/\x00/g, '\x01\x01');
    length_estimate = max_bytes_per_chr * text.length + 3;
    grow_rbuffer(length_estimate - rbuffer.length - idx - 1);
    rbuffer[idx] = tm_text;
    byte_count = rbuffer.write(text, idx + 1);
    rbuffer[idx + byte_count + 1] = tm_lo;
    return idx + byte_count + 2;
  };

  read_text = function(buffer, idx) {
    var R, byte, stop_idx;
    if (buffer[idx] !== tm_text) {
      throw new Error("not a text at index " + idx);
    }
    stop_idx = idx;
    while (true) {
      stop_idx += +1;
      if ((byte = buffer[stop_idx]) === tm_lo) {
        break;
      }
      if (byte == null) {
        throw new Error("runaway string at index " + idx);
      }
    }
    R = buffer.toString('utf-8', idx + 1, stop_idx);
    R = R.replace(/\x01\x02/g, '\x01');
    R = R.replace(/\x01\x01/g, '\x00');
    return [stop_idx + 1, R];
  };


  /* TAINT remove is_top_level if not used */

  read_list = function(buffer, idx, is_top_level) {
    var R, byte, ref, value;
    if (buffer[idx] !== tm_list) {
      throw new Error("not a list at index " + idx);
    }
    R = [];
    idx += +1;
    while (true) {
      if ((byte = buffer[idx]) === tm_lo) {
        break;
      }
      ref = _decode(buffer, idx, false, true), idx = ref[0], value = ref[1];
      R.push(value[0]);
      if (byte == null) {
        throw new Error("runaway list at index " + idx);
      }
    }
    return [idx + 1, R];
  };

  write = function(idx, value) {
    var type;
    switch (type = CND.type_of(value)) {
      case 'text':
        return write_text(idx, value);
      case 'number':
        return write_number(idx, value);
      case 'jsinfinity':
        return write_infinity(idx, value);
      case 'jsdate':
        return write_date(idx, value);
    }
    return write_singular(idx, value);
  };

  this.encode = function(key, extra_byte) {
    var R, idx, type;
    rbuffer.fill(0x99);
    if ((type = CND.type_of(key)) !== 'list') {
      throw new Error("expected a list, got a " + type);
    }
    idx = _encode(key, 0, true);
    if (extra_byte != null) {
      rbuffer[idx] = extra_byte;
      idx += +1;
    }
    R = new Buffer(idx);
    rbuffer.copy(R, 0, 0, idx);
    release_extraneous_rbuffer_bytes();
    return R;
  };


  /* TAINT remove is_top_level if not used */

  _encode = function(key, idx, is_top_level) {
    var element, element_idx, error, j, k, last_element_idx, len, len1, sub_element;
    last_element_idx = key.length - 1;
    for (element_idx = j = 0, len = key.length; j < len; element_idx = ++j) {
      element = key[element_idx];
      while (true) {
        try {
          if (CND.isa_list(element)) {
            rbuffer[idx] = tm_list;
            idx += +1;
            for (k = 0, len1 = element.length; k < len1; k++) {
              sub_element = element[k];
              idx = _encode([sub_element], idx, false);
            }
            rbuffer[idx] = tm_lo;
            idx += +1;
          } else {
            idx = write(idx, element);
          }
          break;
        } catch (_error) {
          error = _error;
          if (error !== buffer_too_short_error) {
            warn("detected problem with key " + (rpr(key)));
            throw error;
          }
          grow_rbuffer();
        }
      }
    }
    return idx;
  };

  this.decode = function(buffer) {
    return (_decode(buffer, 0, true, false))[1];
  };


  /* TAINT remove is_top_level if not used */

  _decode = function(buffer, idx, is_top_level, single) {
    var R, last_idx, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, type, value;
    R = [];
    last_idx = buffer.length - 1;
    while (true) {
      if (idx > last_idx) {
        break;
      }
      switch (type = buffer[idx]) {
        case tm_list:
          ref = read_list(buffer, idx, is_top_level), idx = ref[0], value = ref[1];
          break;
        case tm_text:
          ref1 = read_text(buffer, idx), idx = ref1[0], value = ref1[1];
          break;
        case tm_nnumber:
          ref2 = read_nnumber(buffer, idx), idx = ref2[0], value = ref2[1];
          break;
        case tm_ninfinity:
          ref3 = [idx + 1, -Infinity], idx = ref3[0], value = ref3[1];
          break;
        case tm_pnumber:
          ref4 = read_pnumber(buffer, idx), idx = ref4[0], value = ref4[1];
          break;
        case tm_pinfinity:
          ref5 = [idx + 1, +Infinity], idx = ref5[0], value = ref5[1];
          break;
        case tm_date:
          ref6 = read_date(buffer, idx), idx = ref6[0], value = ref6[1];
          break;
        default:
          ref7 = read_singular(buffer, idx), idx = ref7[0], value = ref7[1];
      }
      R.push(value);
      if (single) {
        break;
      }
    }
    return [idx, R];
  };

}).call(this);

//# sourceMappingURL=../sourcemaps/codec.js.map