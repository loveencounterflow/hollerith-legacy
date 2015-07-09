(function() {
  var $, CND, D, HOLLERITH, alert, badge, chrs, cli_options, db, debug, docopt, dump_settings, echo, filename, help, info, join, limit, log, new_db, njs_path, prefix, rpr, urge, usage, version, warn, whisper, ƒ;

  njs_path = require('path');

  join = njs_path.join;

  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'HOLLERITH/dump';

  log = CND.get_logger('plain', badge);

  info = CND.get_logger('info', badge);

  whisper = CND.get_logger('whisper', badge);

  alert = CND.get_logger('alert', badge);

  debug = CND.get_logger('debug', badge);

  warn = CND.get_logger('warn', badge);

  help = CND.get_logger('help', badge);

  urge = CND.get_logger('urge', badge);

  echo = CND.echo.bind(CND);

  D = require('pipedreams2');

  $ = D.remit.bind(D);

  new_db = require('level');

  HOLLERITH = require('./main');

  ƒ = CND.format_number.bind(CND);

  this._first_chrs_of = function(text, n) {

    /*
    for text in [ 'abc', '中國皇帝', 'a𪜄b', ]
      for n in [ 0 .. 5 ]
        debug '©DLOTs', n, rpr prefix_of text, n
     */
    var count, idx, last_idx;
    if (n <= 0) {
      return '';
    }
    count = 0;
    idx = -1;
    last_idx = text.length - 1;
    while (count < n) {
      if (idx >= last_idx) {
        break;
      }
      idx += +1;
      if ((text.codePointAt(idx)) > 0xffff) {
        idx += +1;
      }
      count += 1;
    }
    return [text.slice(0, +idx + 1 || 9e9), idx + 1];
  };


  /* TAINT code duplication */

  this._$dump_facets = function(db, input, settings) {
    var chrs, colors, count, limit, write;
    limit = settings.limit, colors = settings.colors, chrs = settings.chrs;
    count = 0;
    write = colors ? log : echo;
    return $((function(_this) {
      return function(facet, send, end) {
        var key_bfr, key_rpr, part, phrasetype, value, value_bfr, value_rpr;
        if (facet != null) {
          count += +1;
          key_bfr = facet.key, value_bfr = facet.value;
          if (count < limit) {
            if (HOLLERITH._is_meta(db, key_bfr)) {
              warn("skipped meta: " + (rpr(key_bfr.toString())));
            } else {
              key_rpr = HOLLERITH.url_from_key(db, HOLLERITH._decode_key(db, key_bfr));
              phrasetype = key_rpr.slice(0, 3);
              if (colors) {
                key_rpr = ((function() {
                  var i, len, ref, results;
                  ref = key_rpr.split('|');
                  results = [];
                  for (i = 0, len = ref.length; i < len; i++) {
                    part = ref[i];
                    results.push(CND.plum(part));
                  }
                  return results;
                })()).join(CND.grey('|'));
              }
              if (phrasetype === 'spo' && (value_bfr != null)) {
                value = value_bfr.toString('utf-8');
                value_rpr = (rpr(value)).replace(/^'(.*)'$/, '$1');
                if (colors) {
                  value_rpr = CND.orange(value_rpr);
                }
              } else {
                value_rpr = '';
              }
              write(CND.grey(ƒ(count)), key_rpr + value_rpr);
              send(key_bfr);
            }
          }
          if (count >= limit) {
            input.emit('end');
          }
        }
        if (end != null) {
          help("dumped " + (ƒ(count)) + " entries");
          return process.exit();
        }
      };
    })(this));
  };


  /* TAINT code duplication */

  this._$dump_prefixes = function(db, input, settings) {
    var chrs, colors, key_count, limit, prefix_count, prefixes, t0;
    limit = settings.limit, colors = settings.colors, chrs = settings.chrs;
    key_count = 0;
    prefix_count = 0;
    prefixes = {};
    t0 = +new Date();
    return $((function(_this) {
      return function(key, send, end) {
        var dt, dt_min, dt_s, key_rpr, prefix, ref, suffix_idx, t1;
        if (key != null) {
          key_count += +1;
          if (key_count < limit) {
            key_rpr = HOLLERITH.url_from_key(db, HOLLERITH._decode_key(db, key));
            ref = _this._first_chrs_of(key_rpr, chrs), prefix = ref[0], suffix_idx = ref[1];
            if (prefixes[prefix] == null) {
              prefix_count += +1;
              prefixes[prefix] = 1;
              if (colors) {
                log(CND.grey(ƒ(key_count)), (CND.plum(prefix)) + (CND.grey(key_rpr.slice(suffix_idx))));
              } else {
                echo(ƒ(key_count), prefix, key_rpr.slice(suffix_idx));
              }
              send(key);
            }
          }
          if (key_count >= limit) {
            input.emit('end');
          }
        }
        if (end != null) {
          t1 = +new Date();
          dt = t1 - t0;
          dt_s = (dt / 1000).toFixed(3);
          dt_min = (dt / 60000).toFixed(1);
          help("dumped " + (ƒ(key_count)) + " entries in " + dt_s + "s (" + dt_min + "min)");
          help("found " + (ƒ(prefix_count)) + " distinct prefixes with up to " + (ƒ(chrs)) + " characters");
          return process.exit();
        }
      };
    })(this));
  };

  this.dump = function(db, settings) {
    var input, key, mode, prefix, query, worker;
    mode = settings.mode, prefix = settings.prefix;
    switch (mode) {
      case 'keys':
        if (prefix != null) {
          debug('©7fHvz', rpr(prefix));

          /* TAINT use library method */
          key = prefix.split('|');
          query = HOLLERITH._query_from_prefix(db, key, '*');
          urge('©g1y6J', key);
          urge('©g1y6J', query['gte']);
          urge('©g1y6J', query['lte']);
          input = db['%self'].createReadStream(query);
        } else {
          input = db['%self'].createReadStream();
        }
        worker = this._$dump_facets(db, input, settings);
        break;
      case 'prefixes':
        input = db['%self'].createKeyStream();
        worker = this._$dump_prefixes(db, input, settings);
        break;
      default:
        throw new Error("unknown mode " + (rpr(mode)));
    }
    return input.pipe(worker);
  };

  this.encodings = {
    dbcs2: "⓪①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳㉑㉒㉓㉔㉕㉖㉗㉘㉙㉚㉛\n㉜！＂＃＄％＆＇（）＊＋，－．／０１２３４５６７８９：；＜＝＞？\n＠ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ［＼］＾＿\n｀ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ｛｜｝～㉠\n㉝㉞㉟㊱㊲㊳㊴㊵㊶㊷㊸㊹㊺㊻㊼㊽㊾㊿㋐㋑㋒㋓㋔㋕㋖㋗㋘㋙㋚㋛㋜㋝\n㋞㋟㋠㋡㋢㋣㋤㋥㋦㋧㋨㋩㋪㋫㋬㋭㋮㋯㋰㋱㋲㋳㋴㋵㋶㋷㋸㋹㋺㋻㋼㋽\n㋾㊊㊋㊌㊍㊎㊏㊐㊑㊒㊓㊔㊕㊖㊗㊘㊙㊚㊛㊜㊝㊞㊟㊠㊡㊢㊣㊤㊥㊦㊧㊨\n㊩㊪㊫㊬㊭㊮㊯㊰㊀㊁㊂㊃㊄㊅㊆㊇㊈㊉㉈㉉㉊㉋㉌㉍㉎㉏⓵⓶⓷⓸⓹〓",
    aleph: "БДИЛЦЧШЭЮƆƋƏƐƔƥƧƸψŐőŒœŊŁłЯɔɘɐɕəɞ\n␣!\"#$%&'()*+,-./0123456789:;<=>?\n@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_\n`abcdefghijklmnopqrstuvwxyz{|}~ω\nΓΔΘΛΞΠΣΦΨΩαβγδεζηθικλμνξπρςστυφχ\nЖ¡¢£¤¥¦§¨©ª«¬Я®¯°±²³´µ¶·¸¹º»¼½¾¿\nÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞß\nàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ",
    rdctn: "∇≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡\n␣!\"#$%&'()*+,-./0123456789:;<=>?\n@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_\n`abcdefghijklmnopqrstuvwxyz{|}~≡\n∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃\n∃∃¢£¤¥¦§¨©ª«¬Я®¯°±²³´µ¶·¸¹º»¼½¾¿\nÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞß\nàáâãäåæçèéêëìíîïðñò≢≢≢≢≢≢≢≢≢≢≢≢Δ"
  };

  this.rpr_of_buffer = function(db, buffer, encoding) {
    return (rpr(buffer)) + ' ' + this.encode_buffer(db, buffer, encoding);
  };

  this.encode_buffer = function(db, buffer, encoding) {
    var idx;
    if (encoding == null) {
      encoding = 'rdctn';
    }
    if (!CND.isa_list(encoding)) {
      encoding = this.encodings[encoding];
    }
    return ((function() {
      var i, ref, results;
      results = [];
      for (idx = i = 0, ref = buffer.length; 0 <= ref ? i < ref : i > ref; idx = 0 <= ref ? ++i : --i) {
        results.push(encoding[buffer[idx]]);
      }
      return results;
    })()).join('');
  };

  this.rpr_of_facets = function(db, facets, encoding) {
    var a, b, columnify_settings, i, j, key, key_rpr, len, len1, ref, ref1, value, value_rpr;
    columnify_settings = {
      paddingChr: ' ',
      columnSplitter: ' ┊ '
    };
    a = [];
    b = [];
    for (i = 0, len = facets.length; i < len; i++) {
      ref = facets[i], key = ref[0], value = ref[1];
      key_rpr = (rpr(key)).replace(/^<Buffer (.*)>$/, '$1');
      value_rpr = (rpr(value)).replace(/^<Buffer (.*)>$/, '$1');
      a.push([key_rpr, value_rpr]);
    }
    a = CND.columnify(a, columnify_settings);
    for (j = 0, len1 = facets.length; j < len1; j++) {
      ref1 = facets[j], key = ref1[0], value = ref1[1];
      key_rpr = this.encode_buffer(db, key, encoding);
      value_rpr = this.encode_buffer(db, value, encoding);
      b.push([key_rpr, value_rpr]);
    }
    b = CND.columnify(b, columnify_settings);
    return a + '\n' + b;
  };

  this._compile_encodings = function() {
    var chrs_of, encoding, length, name, ref;
    chrs_of = function(text) {
      var chr;
      text = text.split(/([\ud800-\udbff].|.)/);
      return (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = text.length; i < len; i++) {
          chr = text[i];
          if (chr !== '') {
            results.push(chr);
          }
        }
        return results;
      })();
    };
    ref = this.encodings;
    for (name in ref) {
      encoding = ref[name];
      encoding = chrs_of(encoding.replace(/\n+/g, ''));
      if ((length = encoding.length) !== 256) {
        throw new Error("expected 256 characters, found " + length + " in encoding " + (rpr(name)));
      }
      this.encodings[name] = encoding;
    }
    return null;
  };

  this._compile_encodings();

  if (module.parent == null) {
    docopt = (require('coffeenode-docopt')).docopt;
    version = (require('../package.json'))['version'];
    filename = (require('path')).basename(__filename);
    usage = "Usage: " + filename + " <db-route> [--limit=N]\n       " + filename + " <db-route> ( [<prefix>] | keys [<prefix>] | prefixes [<chrs>] ) [--limit=N]\n\nOptions:\n  -l, --limit\n  -h, --help\n  -v, --version";

    /*
           #{filename} pos [--sample]
           #{filename} so [--db] [--limit] [--stdout] [<prefix>]
           #{filename} os [--db] [--limit] [--stdout] [<prefix>]
           #{filename} x
           #{filename} y
           #{filename} q <query0> [+|-] <query1>
           #{filename} sql
           #{filename} count
     */
    cli_options = docopt(usage, {
      version: version,
      help: function(left, collected) {
        urge(left);
        help(collected);
        help('\n' + usage);
        return process.exit();
      }
    });
    dump_settings = {
      limit: Infinity,
      mode: 'keys',
      colors: process.stdout.isTTY ? true : false,
      chrs: 3
    };
    dump_settings['route'] = cli_options['<db-route>'];
    if ((limit = cli_options['--limit'])) {
      dump_settings['limit'] = parseInt(limit, 10);
    }
    if (cli_options['prefixes']) {
      dump_settings['mode'] = 'prefixes';
    }
    if ((chrs = cli_options['<chrs>'])) {
      dump_settings['chrs'] = parseInt(chrs, 10);
    }
    if ((prefix = cli_options['<prefix>']) != null) {
      dump_settings['prefix'] = prefix;
    }
    db = HOLLERITH.new_db(dump_settings['route']);
    help("using LevelDB at " + dump_settings['route']);
    this.dump(db, dump_settings);
  }

}).call(this);

//# sourceMappingURL=../sourcemaps/dump.js.map