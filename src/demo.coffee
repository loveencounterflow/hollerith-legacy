


############################################################################################################
njs_path                  = require 'path'
# njs_fs                    = require 'fs'
join                      = njs_path.join
#...........................................................................................................
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'HOLLERITH/test'
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
suspend                   = require 'coffeenode-suspend'
step                      = suspend.step
after                     = suspend.after
eventually                = suspend.eventually
immediately               = suspend.immediately
repeat_immediately        = suspend.repeat_immediately
every                     = suspend.every
#...........................................................................................................
# BYTEWISE                  = require 'bytewise'
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
#...........................................................................................................
options                   = null


#===========================================================================================================
# PIPEDREAMS
#-----------------------------------------------------------------------------------------------------------
D.new_indexer = ( idx = 0 ) -> ( data ) => [ idx++, data, ]


#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
@initialize = ( handler ) ->
  options[ 'db' ] = HOLLERITH.new_db options[ 'route' ]
  handler null

#-----------------------------------------------------------------------------------------------------------
@feed_demo_data = ( db, handler ) ->
  substrate = db[ '%self' ]
  count     = 0
  zero      = HOLLERITH._zero
  step ( resume ) =>
    for n in [ 1000 ... 1005 ]
      yield substrate.put ( HOLLERITH._encode db, n ), zero, resume
    yield substrate.put ( HOLLERITH._encode db, 'A'       ), zero, resume
    yield substrate.put ( HOLLERITH._encode db, 'B'       ), zero, resume
    yield substrate.put ( HOLLERITH._encode db, 'C'       ), zero, resume
    yield substrate.put ( HOLLERITH._encode db, 'a'       ), zero, resume
    yield substrate.put ( HOLLERITH._encode db, 'b'       ), zero, resume
    yield substrate.put ( HOLLERITH._encode db, 'c'       ), zero, resume
    yield substrate.put ( HOLLERITH._encode db, '𪜄'       ), zero, resume
    yield substrate.put ( HOLLERITH._encode db, '一'       ), zero, resume
    yield substrate.put ( HOLLERITH._encode db, '二'       ), zero, resume
    yield substrate.put ( HOLLERITH._encode db, '三'       ), zero, resume
    yield substrate.put ( HOLLERITH._encode db, null      ), zero, resume
    yield substrate.put ( HOLLERITH._encode db, undefined ), zero, resume
    yield substrate.put ( HOLLERITH._encode db, true      ), zero, resume
    yield substrate.put ( HOLLERITH._encode db, false     ), zero, resume
    yield substrate.put ( HOLLERITH._encode db, +Infinity ), zero, resume
    yield substrate.put ( HOLLERITH._encode db, -Infinity ), zero, resume
    yield substrate.put ( HOLLERITH._encode db, { foo: 1, bar: 1, } ), zero, resume
    yield substrate.put ( HOLLERITH._encode db, { bar: 1, foo: 1, } ), zero, resume
    for idx in [ 2000 ... 2005 ]
      for fact_name in [ 'strokeorder', 'components', 'reading', ]
        value   = idx
        glyph   = String.fromCodePoint 0x4e00 + idx
        # so_key  = "so|glyph:#{glyph}|#{fact_name}:#{value}"
        # os_key  = "os|#{fact_name}:#{value}|glyph:#{glyph}"
        so_key  = HOLLERITH._encode db, [ 'so', [ 'glyph', glyph,   ], [ fact_name, value, ], null, ]
        os_key  = HOLLERITH._encode db, [ 'os', [ fact_name, value, ], [ 'glyph', glyph,   ], null, ]
        # so_key  = HOLLERITH._encode db, [ 'so', [ 'glyph', glyph,   ], [ fact_name, value, ], null, ]
        # os_key  = HOLLERITH._encode db, [ 'os', [ fact_name, value, ], [ 'glyph', glyph,   ], null, ]
        yield substrate.put os_key, zero, resume
        yield substrate.put so_key, zero, resume
        count += +1
    #.......................................................................................................
    help "inserted #{count} entries"
    handler null if handler?

#-----------------------------------------------------------------------------------------------------------
@main = ->
  step ( resume ) =>
    yield @initialize resume
    db = options[ 'db' ]
    # debug '©8YwPo', db
    #.......................................................................................................
    unless ( /jizura/i ).test options[ 'route' ]
      yield HOLLERITH.clear db, resume
      yield @feed_demo_data db, resume
    # #.......................................................................................................
    # input = HOLLERITH.read_keys db, 'os|rank/cjt:00000'
    # debug '©cW8tK', HOLLERITH.new_key db, 'os', 'rank/cjt', '00000'
    # #.......................................................................................................
    # input
    #   #.....................................................................................................
    #   .pipe HOLLERITH.$split()
    #   #.....................................................................................................
    #   .pipe HOLLERITH.read_sub db, indexed: yes, ( event ) =>
    #     [ phrasetype, predicate, complement, theme, topic, ] = event
    #     # whisper JSON.stringify event
    #     return HOLLERITH.read_values db, "so|#{theme}:#{topic}|pod:"
    #   #.....................................................................................................
    #   .pipe D.$densort 0, 0, true
    #   #.....................................................................................................
    #   .pipe $ ( [ idx, [ pod, ], ], send ) =>
    #     glyph       = pod[ 'glyph/uchr'         ]
    #     strokeorder = pod[ 'strokeorder/short'  ][ 0 ]
    #     lineup      = pod[ 'guide/lineup/uchr'  ]
    #     send [ glyph, strokeorder, lineup, ]
    #   #.....................................................................................................
    #   .pipe $ ( event, send ) =>
    #     [ glyph, strokeorder, lineup, ] = event
    #     # whisper JSON.stringify event
    #     urge glyph, ( TEXT.flush_left strokeorder, 32 ), lineup
    #     send event
    #   .pipe D.$count ( count ) => help "read #{count} entries"


############################################################################################################
unless module.parent?

  #---------------------------------------------------------------------------------------------------------
  options =
    #.......................................................................................................
    'route':                njs_path.join __dirname, '../dbs/demo'
    # 'route':                '/Volumes/Storage/io/jizura-datasources/data/leveldb'
    # 'route':            '/tmp/leveldb'
  #---------------------------------------------------------------------------------------------------------
  debug '©AoOAS', options
  @main()
  #---------------------------------------------------------------------------------------------------------
  f = ->
    debug '©VhyC6', HOLLERITH.new_key db, 'so', 'glyph', '家'
    debug '©VhyC6', HOLLERITH.new_keys db, 'so', 'glyph', '家', 'strokeorder', '4451353334'
    debug '©VhyC6', HOLLERITH.new_key db, 'so', 'glyph', '家', 'pod', { '%foo': 'bar', }



