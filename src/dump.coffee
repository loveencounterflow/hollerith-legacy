


############################################################################################################
njs_path                  = require 'path'
# njs_fs                    = require 'fs'
join                      = njs_path.join
#...........................................................................................................
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'HOLLERITH/dump'
log                       = CND.get_logger 'plain',     badge
info                      = CND.get_logger 'info',      badge
whisper                   = CND.get_logger 'whisper',   badge
alert                     = CND.get_logger 'alert',     badge
debug                     = CND.get_logger 'debug',     badge
warn                      = CND.get_logger 'warn',      badge
help                      = CND.get_logger 'help',      badge
urge                      = CND.get_logger 'urge',      badge
echo                      = CND.echo.bind CND
#...........................................................................................................
# bytewise                  = require 'bytewise'
# through                   = require 'through2'
# LevelBatch                = require 'level-batch-stream'
# BatchStream               = require 'batch-stream'
# parallel                  = require 'concurrent-writable'
D                         = require 'pipedreams2'
$                         = D.remit.bind D
#...........................................................................................................
new_db                    = require 'level'
# new_levelgraph            = require 'levelgraph'
# db                        = new_levelgraph '/tmp/levelgraph'
HOLLERITH                 = require './main'
ƒ                         = CND.format_number.bind CND

# '@'

# batched_db  = new LevelBatch level_db
# input       = D.create_throughstream()


# input
#   .pipe $ ( key, send ) =>
#     send { type: 'put', key: key, value: 1, }
#   .pipe new BatchStream size: 100
#   .pipe parallel batched_db, 10


# triple = { subject: "札", predicate: "strokeorder::foobar", object: "12345" }
# db.put triple, ( error ) ->
#   throw error if error?


#-----------------------------------------------------------------------------------------------------------
@_first_chrs_of = ( text, n ) ->
  ###
  for text in [ 'abc', '中國皇帝', 'a𪜄b', ]
    for n in [ 0 .. 5 ]
      debug '©DLOTs', n, rpr prefix_of text, n
  ###
  return '' if n <= 0
  count     = 0
  idx       = -1
  last_idx  = text.length - 1
  while count < n
    break if idx >= last_idx
    idx    += +1
    idx    += +1 if ( text.codePointAt idx ) > 0xffff
    count  += 1
  return [ text[ .. idx ], idx + 1, ]

#-----------------------------------------------------------------------------------------------------------
### TAINT code duplication ###
@_$dump_keys = ( db, input, settings ) ->
  { limit, colors, chrs, } = settings
  count     = 0
  #.........................................................................................................
  return $ ( key, send, end ) =>
    #.......................................................................................................
    if key?
      count += +1
      if count < limit
        key_rpr = HOLLERITH.url_from_key db, HOLLERITH._decode db, key
        if colors
          log ( CND.grey ƒ count ), ( CND.plum key_rpr ), ( CND.grey key.slice 0, 10 )
        else
          echo ( ƒ count ), key
        send key
      #.....................................................................................................
      input.emit 'end' if count >= limit
    #.......................................................................................................
    if end?
      help "dumped #{ƒ count} entries"
      process.exit()

#-----------------------------------------------------------------------------------------------------------
### TAINT code duplication ###
@_$dump_prefixes = ( db, input, settings ) ->
  { limit, colors, chrs, } = settings
  key_count     = 0
  prefix_count  = 0
  prefixes      = {}
  t0            = +new Date()
  #.........................................................................................................
  return $ ( key, send, end ) =>
    #.......................................................................................................
    if key?
      key_count += +1
      if key_count < limit
        key_rpr = HOLLERITH.url_from_key db, HOLLERITH._decode db, key
        [ prefix, suffix_idx, ] = @_first_chrs_of key_rpr, chrs
        unless prefixes[ prefix ]?
          prefix_count       += +1
          prefixes[ prefix ]  = 1
          if colors
            log ( CND.grey ƒ key_count ), ( CND.plum prefix ) + ( CND.grey key_rpr[ suffix_idx .. ] )
          else
            echo ( ƒ key_count ), prefix, key_rpr[ suffix_idx .. ]
          send key
      #.....................................................................................................
      input.emit 'end' if key_count >= limit
    #.......................................................................................................
    if end?
      t1      = +new Date()
      dt      = t1 - t0
      dt_s    = ( dt /  1000 ).toFixed 3
      dt_min  = ( dt / 60000 ).toFixed 1
      help "dumped #{ƒ key_count} entries in #{dt_s}s (#{dt_min}min)"
      help "found #{ƒ prefix_count} distinct prefixes with up to #{ƒ chrs} characters"
      process.exit()

#-----------------------------------------------------------------------------------------------------------
@dump = ( db, settings ) ->
  { mode, prefix, } = settings
  switch settings[ 'mode' ]
    when 'keys'
      if prefix?
        # debug '©7fHvz', rpr prefix
        query = HOLLERITH.new_query db, prefix
        urge '©g1y6J', query[ 'gte' ]
        urge '©g1y6J', query[ 'lte' ]
        input = db[ '%self' ].createKeyStream query
      else
        input = db[ '%self' ].createKeyStream()
      worker  = @_$dump_keys db, input, settings
    when 'prefixes'
      input   = db[ '%self' ].createKeyStream()
      worker  = @_$dump_prefixes db, input, settings
    else throw new Error "unknown mode #{rpr mode}"
  input
    .pipe worker


############################################################################################################
unless module.parent?

  #---------------------------------------------------------------------------------------------------------
  docopt    = ( require 'coffeenode-docopt' ).docopt
  version   = ( require '../package.json' )[ 'version' ]
  filename  = ( require 'path' ).basename __filename
         # #{filename} pos [--sample] [<prefix>]
  usage     = """
  Usage: #{filename} <db-route> [--limit=N]
         #{filename} <db-route> ( [<prefix>] | keys [<prefix>] | prefixes [<chrs>] ) [--limit=N]

  Options:
    -l, --limit
    -h, --help
    -v, --version
  """
  ###
         #{filename} pos [--sample]
         #{filename} so [--db] [--limit] [--stdout] [<prefix>]
         #{filename} os [--db] [--limit] [--stdout] [<prefix>]
         #{filename} x
         #{filename} y
         #{filename} q <query0> [+|-] <query1>
         #{filename} sql
         #{filename} count
  ###
  cli_options = docopt usage, version: version, help: ( left, collected ) ->
    urge left
    help collected
    help '\n' + usage
    process.exit()
  #.........................................................................................................
  dump_settings =
    limit:            Infinity
    mode:             'keys'
    colors:           if process.stdout.isTTY then true else false
    chrs:             3
  #.........................................................................................................
  dump_settings[ 'route'    ] = cli_options[ '<db-route>' ]
  dump_settings[ 'limit'    ] = ( parseInt limit, 10 ) if ( limit = cli_options[ '--limit' ] )
  dump_settings[ 'mode'     ] = 'prefixes' if cli_options[ 'prefixes' ]
  dump_settings[ 'chrs'     ] = ( parseInt  chrs, 10 ) if (  chrs = cli_options[  '<chrs>' ] )
  dump_settings[ 'prefix'   ] = prefix if ( prefix = cli_options[ '<prefix>' ] )?
  #---------------------------------------------------------------------------------------------------------
  db = HOLLERITH.new_db dump_settings[ 'route' ]
  # debug '©bEIeE', cli_options
  # help '©bEIeE', dump_settings
  help "using LevelDB at #{dump_settings[ 'route' ]}"
  @dump db, dump_settings

  # debug '©lJ8nb', HOLLERITH._encode null, 1
  # debug '©lJ8nb', HOLLERITH._encode null, [ 1, ]
  # debug '©lJ8nb', HOLLERITH._encode null, [ 1, undefined, ]
  # log()
  # debug '©lJ8nb', HOLLERITH._encode null, '1'
  # debug '©lJ8nb', HOLLERITH._encode null, [ '1', ]
  # debug '©lJ8nb', HOLLERITH._query_from_prefix null, 1
  # debug '©lJ8nb', HOLLERITH._query_from_prefix null, [ 1, ]
  # debug '©lJ8nb', HOLLERITH._query_from_prefix null, '1'
  # debug '©lJ8nb', HOLLERITH._query_from_prefix null, [ '1', ]
  # debug '©lJ8nb', HOLLERITH._encode null, '\x00'
  # debug '©lJ8nb', HOLLERITH._encode null, '\x01'
  # debug '©lJ8nb', HOLLERITH._encode null, '\x02'
  # log()

  # for cid in [ 0x00 .. 0xff ]
  #   debug '©lJ8nb', ( '0x' + ( if cid <= 0xf then '0' else '' ) + cid.toString 16 ), HOLLERITH._encode null, [ String.fromCodePoint cid, ]
  # debug '©vfkkx', HOLLERITH._decode null, HOLLERITH.encode null, +Infinity
  # debug '©vfkkx', HOLLERITH._decode null, HOLLERITH.encode null, -Infinity
  # debug '©vfkkx', HOLLERITH._decode null, HOLLERITH.encode null, null
  # debug '©vfkkx', HOLLERITH._decode null, HOLLERITH.encode null, undefined
  # CND.listen_to_keys ( P... ) ->
  #   debug '©WOmlj', P
  # process.stdin.resume()

  # for text in [ 'abc', '中國皇帝', 'a𪜄b', ]
  #   for n in [ 0 .. 5 ]
  #     debug '©DLOTs', n, rpr @_first_chrs_of text, n






























