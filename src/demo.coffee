


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

#-----------------------------------------------------------------------------------------------------------
@_misfit          = Symbol 'misfit'


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
@main = ( first_query ) ->
  first_query ?= { gte: 'os|rank/cjt:0', lte: 'os|rank/cjt:9', }
  step ( resume ) =>
    yield @initialize resume
    db = options[ 'db' ]
    CHR = require '/Volumes/Storage/io/coffeenode-chr'
    count_chrs = ( text ) -> ( CHR.chrs_from_text text, input: 'xncr' ).length
    #.......................................................................................................
    input = db[ '%self' ].createKeyStream first_query
    # k = "so|glyph:繼|pod:"
    # input = db[ '%self' ].createKeyStream db, { gte: k, lte: k + '\uffff' }
    # debug '©cW8tK', HOLLERITH.new_key db, 'os', 'rank/cjt', '00000'
    #.......................................................................................................
    ### TAINT We can currently not use `HOLLERITH2.read_sub` because HOLLERITH2 assumes a key-only
    DB that uses binary encoding with a custom https://github.com/deanlandolt/bytewise layer; the current
    Jizura DB version uses UTF-8 strings and is a key/value DB. ###
    #.......................................................................................................
    input
      .pipe @_$split_bkey()
      #.....................................................................................................
      # .pipe HOLLERITH.read_sub db, indexed: yes, ( key ) =>
      .pipe @read_sub db, indexed: yes, ( key ) =>
        [ pt, ok, rank, sk, glyph, ] = key
        sub_key = "so|glyph:#{glyph}|pod:"
        return db[ '%self' ].createValueStream { gte: sub_key, lte: sub_key + '\uffff' }
      #.....................................................................................................
      .pipe D.$densort 0, 0, true
      #.....................................................................................................
      .pipe $ ( [ idx, [ pod, ], ], send ) =>
        debug '©jd5cE', pod
        unless pod[ 'strokeorder/short'  ]?
          warn '©9YXoq',  pod
        else
          glyph       = pod[ 'glyph/uchr'         ]
          strokeorder = pod[ 'strokeorder/short'  ][ 0 ].length
          lineup      = pod[ 'guide/lineup/uchr'  ].replace /\u3000/g, ''
          send [ glyph, strokeorder, lineup, ]
      #.....................................................................................................
      .pipe $ ( [ glyph, strokeorder, lineup, ], send ) =>
        send [ glyph, strokeorder, count_chrs lineup, ]
      #.....................................................................................................
      .pipe D.$sort ( a, b ) ->
        idx = 1
        return +1 if a[ idx ] > b[ idx ]
        return -1 if a[ idx ] < b[ idx ]
        return  0
      #.....................................................................................................
      .pipe D.$show()

#-----------------------------------------------------------------------------------------------------------
@_$split_bkey = -> $ ( bkey, send ) => send @_split_bkey bkey

#-----------------------------------------------------------------------------------------------------------
@_split_bkey = ( bkey ) ->
  R = bkey.toString 'utf-8'
  R = ( R.split '|' )[ .. 2 ]
  R = [ R[ 0 ], ( R[ 1 ].split ':' )..., ( R[ 2 ].split ':' )..., ]
  return R

#-----------------------------------------------------------------------------------------------------------
@_lte_from_gte = ( gte ) ->
  R = new Buffer ( last_idx = Buffer.byteLength gte ) + 1
  R.write gte
  R[ last_idx ] = 0xff
  return R

#-----------------------------------------------------------------------------------------------------------
@$lineup_from_glyph = ( db ) ->
  settings =
    indexed:  no
    single:   yes
  return @read_sub db, settings, ( glyph ) =>
    lte = "so|glyph:#{glyph}|guide/lineup/uchr:"
    sub_input = db[ '%self' ].createKeyStream { gte: lte, lte: @_lte_from_gte lte, }
    return sub_input

#-----------------------------------------------------------------------------------------------------------
@$shapeclass_wbf_from_glyph_and_lineup = ( db ) ->
  ### TAINT wrong ###
  settings =
    indexed:  no
    single:   yes
  return @read_sub db, settings, ( [ glyph, lineup_glyphs, ] ) =>
    for lineup_glyph in lineup_glyphs
      do ( lineup_glyph ) =>
        gte = "so|glyph:#{lineup_glyph}|factor/strokeclass/wbf:"
        sub_input = db[ '%self' ].createKeyStream { gte: gte, lte: @_lte_from_gte gte, }
        return sub_input

#-----------------------------------------------------------------------------------------------------------
HOLLERITH.$pick_subject = ->
  return $ ( lkey, send ) =>
    [ pt, _, v0, _, v1, ] = lkey
    send if pt is 'so' then v0 else v1

#-----------------------------------------------------------------------------------------------------------
HOLLERITH.$pick_object = ->
  return $ ( lkey, send ) =>
    [ pt, _, v0, _, v1, ] = lkey
    send if pt is 'so' then v1 else v0

#-----------------------------------------------------------------------------------------------------------
HOLLERITH.$pick_values = ->
  return $ ( lkey, send ) =>
    [ pt, _, v0, _, v1, ] = lkey
    send if pt is 'so' then [ v0, v1, ] else [ v1, v0, ]

#-----------------------------------------------------------------------------------------------------------
@$foobar = ->
  ### TAINT picking first from list should be done by read_sub with single: yes ###
  return D.combine [
    ( $ ( keylist, send ) => send keylist[ 0 ] )
    @_$split_bkey()
    HOLLERITH.$pick_values()
    ]

#-----------------------------------------------------------------------------------------------------------
@read_shapeclasswbf_by_factor = ( db, handler ) ->
  CHR = require '/Volumes/Storage/io/coffeenode-chr'
  as_uchr = ( text ) -> CHR.as_uchr text, input: 'xncr'
  step ( resume ) =>
    #.......................................................................................................
    Z     = {}
    gte   = "os|factor/shapeclass/wbf:"
    lte   = @_lte_from_gte gte
    input = db[ '%self' ].createKeyStream { gte: gte, lte: lte, }
    #.......................................................................................................
    input.on 'end', => handler null, Z
    #.......................................................................................................
    input
      .pipe @_$split_bkey()
      .pipe HOLLERITH.$pick_values()
      .pipe $ ( [ factor, shapeclass_wbf, ], send ) =>
        factor = as_uchr factor
        Z[ factor ] = shapeclass_wbf
        send [ factor, shapeclass_wbf, ]
      # .pipe D.$show()

#-----------------------------------------------------------------------------------------------------------
@find_good_kwic_sample_glyphs = ( db, shapeclasswbf_by_factor ) ->
  step ( resume ) =>
    CHR = require '/Volumes/Storage/io/coffeenode-chr'
    chrs_from_text = ( text ) -> CHR.chrs_from_text text, input: 'xncr'
    #.......................................................................................................
    gte   = 'os|guide/lineup/length:05'
    lte   = @_lte_from_gte gte
    input = db[ '%self' ].createKeyStream { gte: gte, lte: lte, }
    #.......................................................................................................
    input
      .pipe @_$split_bkey()
      .pipe $ ( lkey, send ) =>
        [ pt, ok, rank, sk, glyph, ] = lkey
        send glyph
      .pipe @$lineup_from_glyph db
      .pipe @$foobar()
      .pipe $ ( [ glyph, lineup, ], send ) =>
        lineup = lineup.replace /\u3000/g, ''
        lineup = chrs_from_text lineup
        send [ glyph, lineup, ]
      #.....................................................................................................
      .pipe $ ( [ glyph, factors, ], send ) =>
        counts = [ 0, 0, 0, 0, 0, ]
        for factor in factors
          unless ( shapeclass_wbf = shapeclasswbf_by_factor[ factor ] )?
            warn glyph, factor
            echo glyph, factor
            continue
          shapeclass_idx              = ( parseInt shapeclass_wbf[ 0 ], 10 ) - 1
          counts[ shapeclass_idx ]    = 1
        if ( counts.join '' ) is '11111'
          debug '©edwTH', glyph, factors, counts
      # .pipe D.$show()

#-----------------------------------------------------------------------------------------------------------
@f = ->
  step ( resume ) =>
    yield @initialize resume
    db = options[ 'db' ]
    shapeclasswbf_by_factor = yield @read_shapeclasswbf_by_factor db, resume
    @find_good_kwic_sample_glyphs db, shapeclasswbf_by_factor

#-----------------------------------------------------------------------------------------------------------
@find_good_kwic_sample_glyphs_2 = ( db ) ->
#   step ( resume ) =>
#     CHR = require '/Volumes/Storage/io/coffeenode-chr'
#     chrs_from_text = ( text ) -> CHR.chrs_from_text text, input: 'xncr'
#     #.......................................................................................................
#     gte   = 'os|guide/lineup/length:05'
#     lte   = @_lte_from_gte gte
#     input = db[ '%self' ].createKeyStream { gte: gte, lte: lte, }
#     #.......................................................................................................
#     input
#       .pipe @_$split_bkey()
#       .pipe $ ( lkey, send ) =>
#         [ pt, ok, rank, sk, glyph, ] = lkey
#         send glyph
#       .pipe @$lineup_from_glyph db
#       .pipe @$foobar()
#       .pipe $ ( [ glyph, lineup, ], send ) =>
#         lineup = lineup.replace /\u3000/g, ''
#         lineup = chrs_from_text lineup
#         send [ glyph, lineup, ]
#       #.....................................................................................................
#       .pipe $ ( [ glyph, factors, ], send ) =>
#         counts = [ 0, 0, 0, 0, 0, ]
#         for factor in factors
#           unless ( shapeclass_wbf = shapeclasswbf_by_factor[ factor ] )?
#             warn glyph, factor
#             echo glyph, factor
#             continue
#           shapeclass_idx              = ( parseInt shapeclass_wbf[ 0 ], 10 ) - 1
#           counts[ shapeclass_idx ]    = 1
#         if ( counts.join '' ) is '11111'
#           debug '©edwTH', glyph, factors, counts
#       # .pipe D.$show()
  count       = 0
  #.........................................................................................................
  step ( resume ) =>
    unless db?
      yield @initialize resume
      db = options[ 'db' ]
    #.......................................................................................................
    CHR = require '/Volumes/Storage/io/coffeenode-chr'
    chrs_from_text = ( text ) -> CHR.chrs_from_text text, input: 'xncr'
    #.......................................................................................................
    gte     = 'os|guide/lineup/length:05'
    lte     = @_lte_from_gte gte
    input   = db[ '%self' ].createKeyStream { gte: gte, lte: lte, }
    #.......................................................................................................
    decode_rank = ( bkey ) =>
      [ ..., rank_txt, ] = @_split_bkey bkey
      return parseInt rank_txt, 10
    #.......................................................................................................
    decode_lineup = ( bkey ) =>
      [ ..., lineup, ] = @_split_bkey bkey
      lineup = lineup.replace /\u3000/g, ''
      return chrs_from_text lineup
    #.......................................................................................................
    input
      .pipe @_$split_bkey()
      #.....................................................................................................
      .pipe HOLLERITH.read_sub db, mangle: decode_rank, ( phrase ) =>
        [ ..., glyph, ]           = phrase
        sub_gte     = "so|glyph:#{glyph}|rank/cjt:"
        sub_lte     = @_lte_from_gte sub_gte
        sub_input   = db[ '%self' ].createKeyStream { gte: sub_gte, lte: sub_lte, }
        return [ glyph, sub_input, ]
      #.....................................................................................................
      .pipe D.$filter ( [ glyph, rank, ] ) -> rank < 1000
      #.....................................................................................................
      .pipe HOLLERITH.read_sub db, mangle: decode_lineup, ( record ) =>
        [ glyph, rank, ]  = record
        sub_gte     = "so|glyph:#{glyph}|guide/lineup/uchr:"
        sub_lte     = @_lte_from_gte sub_gte
        sub_input   = db[ '%self' ].createKeyStream { gte: sub_gte, lte: sub_lte, }
        return [ [ glyph, rank, ], sub_input, ]
      #.....................................................................................................
      .pipe D.$show()
      # .pipe HOLLERITH.read_sub db, settings, ( xphrase ) =>
      #   [ glyph, [ guide, prd, shapeclass, ] ]  = xphrase
      #   prefix                                  = [ 'spo', guide, 'rank/cjt', ]
      #   sub_input                               = HOLLERITH.create_phrasestream db, prefix
      #   return [ [ glyph, guide, shapeclass, ], sub_input, ]
      # .pipe $ ( xphrase, send ) =>
      #   debug '©quPbg', JSON.stringify xphrase
      #   count  += +1
      #   idx    += +1
      #   T.eq phrase, matchers[ idx ]
      # .pipe D.$on_end =>
      #   T.eq count, matchers.length
      #   done()


############################################################################################################
unless module.parent?

  #---------------------------------------------------------------------------------------------------------
  options =
    #.......................................................................................................
    # 'route':                njs_path.join __dirname, '../dbs/demo'
    'route':                '/Volumes/Storage/io/jizura-datasources/data/leveldb'
    # 'route':            '/tmp/leveldb'
  #---------------------------------------------------------------------------------------------------------
  debug '©AoOAS', options
  # @main()
  @find_good_kwic_sample_glyphs_2()
  # @f()



