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
        var count_txt, key_bfr, key_rpr, value_bfr;
        if (facet != null) {
          count += +1;
          key_bfr = facet.key, value_bfr = facet.value;
          if (count < limit) {
            if (HOLLERITH._is_meta(db, key_bfr)) {
              warn("skipped meta: " + (rpr(key_bfr.toString())));
            } else {
              key_rpr = HOLLERITH.as_url(db, key_bfr, value_bfr, {
                colors: colors
              });
              count_txt = colors ? CND.grey(ƒ(count)) : ƒ(count);
              write(count_txt, key_rpr);
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

  this.dump = function(db, settings) {
    var input, key, mode, prefix, query, star, star_rpr, worker;
    mode = settings.mode, prefix = settings.prefix;
    switch (mode) {
      case 'keys':
        if (prefix != null) {

          /* TAINT use library method */
          if (prefix[prefix.length - 1] === '*') {
            star = '*';
            star_rpr = '*';
            prefix = prefix.slice(0, prefix.length - 1);
          } else {
            star = null;
            star_rpr = '';
          }
          key = prefix.split(/\||:/);
          query = HOLLERITH._query_from_prefix(db, key, star);
          urge("prefix: " + (rpr(prefix)) + " " + star_rpr);
          urge("key:    " + (rpr(key)) + " " + star_rpr);
          input = db['%self'].createReadStream(query);
        } else {
          input = db['%self'].createReadStream();
        }
        worker = this._$dump_facets(db, input, settings);
        break;
      default:
        throw new Error("unknown mode " + (rpr(mode)));
    }
    return input.pipe(worker);
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
      key_rpr = HOLLERITH.CODEC._encode_buffer(db, key, encoding);
      value_rpr = HOLLERITH.CODEC._encode_buffer(db, value, encoding);
      b.push([key_rpr, value_rpr]);
    }
    b = CND.columnify(b, columnify_settings);
    return a + '\n' + b;
  };

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
    db = HOLLERITH.new_db(dump_settings['route'], {
      create: false
    });
    help("using LevelDB at " + dump_settings['route']);
    this.dump(db, dump_settings);
  }

}).call(this);

//# sourceMappingURL=../sourcemaps/dump.js.map