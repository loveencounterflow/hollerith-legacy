


############################################################################################################
njs_path                  = require 'path'
# njs_fs                    = require 'fs'
join                      = njs_path.join
#...........................................................................................................
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'HOLLERITH/demo'
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
$async                    = D.remit_async.bind D
ASYNC                     = require 'async'
CHR                       = require 'coffeenode-chr'
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
@_$split_so_bkey = -> $ ( bkey, send ) => send @_split_so_bkey bkey

#-----------------------------------------------------------------------------------------------------------
@_split_so_bkey = ( bkey ) ->
  R       = bkey.toString 'utf-8'
  R       = R.split '|'
  idx_txt = R[ 3 ]
  R       = [ ( R[ 1 ].split ':' )[ 1 ], ( R[ 2 ].split ':' )..., ]
  R.push ( parseInt idx_txt, 10 ) if idx_txt? and idx_txt.length > 0
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
@dump_jizura_db = ->
  source_db   = HOLLERITH.new_db '/Volumes/Storage/temp/jizura-hollerith2'
  prefix      = [ 'spo', '𡏠', ]
  prefix      = [ 'spo', '㔰', ]
  input       = HOLLERITH.create_phrasestream source_db, prefix
  #.........................................................................................................
  input
    .pipe D.$count ( count ) -> help "read #{count} keys"
    .pipe $ ( data, send ) => send JSON.stringify data
    .pipe D.$show()

#-----------------------------------------------------------------------------------------------------------
@find_good_kwic_sample_glyphs_3 = ( db ) ->
  ### version for Hollerith2 DBs; using `HOLLERITH.remit_async` instead of `HOLLERITH.read_sub`. ###
  ###
  *  ▶  '[["勷",5,9907,["亠","吅","𠀎","𧘇","力"]],"41","25","11","35","53"]'
  *  ▶  '[["噿",5,13090,["口","羽","亠","从","十"]],"25","54","41","34","12"]'
  *  ▶  '[["塾",5,3818,["亠","口","子","丸","土"]],"41","25","51","35","12"]'
  *  ▶  '[["墩",5,5457,["土","亠","口","子","夊"]],"12","41","25","51","35"]'
  *  ▶  '[["孃",5,7225,["女","亠","吅","𠀎","𧘇"]],"53","41","25","11","35"]'
  *  ▶  '[["寡",5,3412,["宀","丆","且","八","刀"]],"44","13","25","34","53"]'
  *  ▶  '[["巕",5,13586,["山","卄","𠂤","辛","女"]],"25","12","32","41","53"]'
  *  ▶  '[["橔",5,13883,["木","亠","口","子","夊"]],"12","41","25","51","35"]'
  *  ▶  '[["灂",5,12349,["氵","爫","罒","","寸"]],"44","34","25","51","12"]'
  *  ▶  '[["纏",5,3421,["糹","广","里","八","土"]],"55","41","25","34","12"]'
  *  ▶  '[["纕",5,8882,["糹","亠","吅","𠀎","𧘇"]],"55","41","25","11","35"]'
  *  ▶  '[["鄸",5,8392,["卄","罒","冖","夕","阝"]],"12","25","45","35","52"]'
  *  ▶  '[["韽",5,10377,["亽","𠃌","酉","立","日"]],"34","5","12","41","25"]'
  *  ▶  '[["頀",5,8385,["立","日","卄","隹","又"]],"41","25","12","32","54"]'
  *  ▶  '[["驐",5,12644,["馬","亠","口","子","夊"]],"12","41","25","51","35"]'
  *  ▶  '[["骧",5,6010,["马","亠","吅","𠀎","𧘇"]],"55","41","25","11","35"]'
  ###
  #.........................................................................................................
  step ( resume ) =>
    db_route  = join __dirname, '../../jizura-datasources/data/leveldb-v2'
    db       ?= HOLLERITH.new_db db_route, create: no
    help "using DB at #{db[ '%self' ][ 'location' ]}"
    #.......................................................................................................
    CHR = require join __dirname, '../../coffeenode-chr'
    chrs_from_text = ( text ) -> CHR.chrs_from_text text, input: 'xncr'
    #.......................................................................................................
    prefix  = [ 'pos', 'guide/lineup/length', 5, ]
    query   = { prefix, }
    input   = HOLLERITH.create_phrasestream db, query
    #.......................................................................................................
    decode_lineup = ( lineup ) =>
      return chrs_from_text lineup.replace /\u3000/g, ''
    #.......................................................................................................
    xncr_from_uchr = ( uchr ) =>
      return if ( CHR.as_rsg uchr ) is 'u-pua' then ( CHR.as_xncr uchr, csg: 'jzr' ) else uchr
    #.......................................................................................................
    input
      #.....................................................................................................
      .pipe $async ( phrase, done ) =>
        [ _, _, lineup_length, glyph, ]       = phrase
        sub_prefix                            = [ 'spo', glyph, 'rank/cjt', ]
        sub_fallback                          = [ null, null, null, Infinity, ]
        sub_query                             = { prefix: sub_prefix, fallback: sub_fallback, }
        debug '©zfQhm', phrase, sub_prefix if glyph is '公'
        HOLLERITH.read_one_phrase db, sub_query, ( error, sub_phrase ) =>
          return done.error error if error?
          # debug '©FST09', sub_phrase unless sub_phrase[ sub_phrase.length - 1 ] is Infinity
          [ _, _, _, rank, ] = sub_phrase
          done [ glyph, { lineup_length, rank, }, ]
      #.....................................................................................................
      # .pipe D.$show()
      .pipe D.$filter ( [ glyph, { lineup_length, rank, }, ] ) -> rank < 15000
      #.....................................................................................................
      .pipe $async ( entry, done ) =>
        [ glyph, { lineup_length, rank, }, ]  = entry
        sub_prefix                            = [ 'spo', glyph, 'guide/lineup/uchr', ]
        sub_query                             = { prefix: sub_prefix, star: '*', fallback: null, }
        HOLLERITH.read_one_phrase db, sub_query, ( error, sub_phrase ) =>
          # debug '©h4GY2', sub_phrase
          return done.error error if error?
          return done() unless sub_phrase?
          [ _, _, _, guides, ]  = sub_phrase
          guides                = decode_lineup guides
          done [ glyph, { lineup_length, rank, guides, }, ]
      #.....................................................................................................
      .pipe $async ( entry, done ) =>
        [ glyph, { lineup_length, rank, guides, }, ]  = entry
        tasks                                         = []
        #...................................................................................................
        for guide in guides
          do ( guide ) =>
            guide_xncr        = xncr_from_uchr guide
            sub_prefix        = [ 'spo', guide_xncr, 'factor/shapeclass/wbf', ]
            sub_fallback      = [ null, null, null, 'X', ]
            sub_query         = { prefix: sub_prefix, fallback: sub_fallback, }
            tasks.push ( handler ) -> HOLLERITH.read_one_phrase db, sub_query, handler
        #...................................................................................................
        ASYNC.parallelLimit tasks, 10, ( error, sub_phrases ) =>
          return done.error error if error?
          strokeclasses = []
          for sub_phrase, sub_idx in sub_phrases
            [ _, _, _, strokeorder, ] = sub_phrase
            strokeclasses[ sub_idx ]  = strokeorder[ 0 ]
          done [ glyph, { lineup_length, rank, guides, strokeclasses, }, ]
      #.....................................................................................................
      .pipe D.$filter ( entry ) =>
        [ glyph, { lineup_length, rank, guides, strokeclasses, }, ] = entry
        return ( strokeclasses[ .. ].sort().join '' ) is '12345'
      #.....................................................................................................
      .pipe $ ( [ glyph, { lineup_length, rank, guides, strokeclasses, }, ], send ) ->
        guides        = guides.join ''
        strokeclasses = strokeclasses.join ''
        send [ glyph, { lineup_length, rank, guides, strokeclasses, }, ]
      #.....................................................................................................
      # .pipe D.$filter ( entry ) => entry[ 1 ][ 'strokeclasses' ] is '12345'
      .pipe D.$show()

#-----------------------------------------------------------------------------------------------------------
@read_factors = ( db, handler ) ->
  #.........................................................................................................
  step ( resume ) =>
    Z         = {}
    db_route  = join __dirname, '../../jizura-datasources/data/leveldb-v2'
    db       ?= HOLLERITH.new_db db_route, create: no
    #.......................................................................................................
    prefix  = [ 'pos', 'factor/', ]
    query   = { prefix, star: '*', }
    input   = HOLLERITH.create_phrasestream db, query
    #.......................................................................................................
    input
      .pipe do =>
        last_sbj  = null
        target    = null
        #...................................................................................................
        return $ ( phrase, send, end ) =>
          #.................................................................................................
          if phrase?
            [ _, prd, obj, sbj, ] = phrase
            prd           = prd.replace /^factor\//g, ''
            sbj           = CHR.as_uchr sbj, input: 'xncr'
            if sbj isnt last_sbj
              send target if target?
              target    = Z[ sbj ]?= { glyph: sbj, }
              last_sbj  = sbj
            target[ prd ] = obj
            Z[ obj ]      = target if prd is 'sortcode'
          #.................................................................................................
          if end?
            send target if target?
            end()
      .pipe D.$on_end -> handler null, Z

#-----------------------------------------------------------------------------------------------------------
@read_sample = ( db, limit_or_list, handler ) ->
  ### Return a gamut of select glyphs from the DB. `limit_or_list` may be a list of glyphs or a number
  representing an upper bound to the usage rank recorded as `rank/cjt`. If `limit_or_list` is a list,
  a POD whose keys are the glyphs in the list is returned; if it is a number, a similar POD with all the
  glyphs whose rank is not worse than the given limit is returned. If `limit_or_list` is smaller than zero
  or equals infinity, `null` is returned to indicate absence of a filter. ###
  Z         = {}
  #.......................................................................................................
  if CND.isa_list limit_or_list
    Z[ glyph ] = 1 for glyph in limit_or_list
    return handler null, Z
  #.......................................................................................................
  return handler null, null if limit_or_list < 0 or limit_or_list is Infinity
  #.......................................................................................................
  throw new Error "expected list or number, got a #{type}" unless CND.isa_number limit_or_list
  #.......................................................................................................
  db_route  = join __dirname, '../../jizura-datasources/data/leveldb-v2'
  db       ?= HOLLERITH.new_db db_route, create: no
  #.......................................................................................................
  lo      = [ 'pos', 'rank/cjt', 0, ]
  hi      = [ 'pos', 'rank/cjt', limit_or_list, ]
  query   = { lo, hi, }
  input   = HOLLERITH.create_phrasestream db, query
  #.......................................................................................................
  input
    .pipe $ ( phrase, send ) =>
        [ _, _, _, glyph, ] = phrase
        Z[ glyph ]          = 1
    .pipe D.$on_end -> handler null, Z

#-----------------------------------------------------------------------------------------------------------
@show_kwic_v2_sample = ( db ) ->
  #.........................................................................................................
  step ( resume ) =>
    db_route      = join __dirname, '../../jizura-datasources/data/leveldb-v2'
    db           ?= HOLLERITH.new_db db_route, create: no
    help "using DB at #{db[ '%self' ][ 'location' ]}"
    # factors       = yield @read_factors db, resume
    # debug '©g5bVR', factors; process.exit()
    # help "read #{( Object.keys factors ).length} entries for factors"
    ranks         = {}
    include       = Infinity
    include       = [ '寿', '邦', '帮', '畴', '铸', '筹', '涛', '祷', '绑', '綁',    ]
    include       = 10000
    #.........................................................................................................
    sample        = yield @read_sample db, include, resume
    #.........................................................................................................
    $reorder_phrase = =>
      return $ ( phrase, send ) =>
        ### extract sortcode ###
        [ _, _, sortcode, glyph, _, ] = phrase
        send [ glyph, sortcode, ]
    #.........................................................................................................
    $exclude_gaiji = =>
      return D.$filter ( [ glyph, sortcode ] ) =>
        return ( not glyph.startsWith '&' ) or ( glyph.startsWith '&jzr#' )
    #.........................................................................................................
    $include_sample = =>
      return D.$filter ( [ glyph, sortcode ] ) => if sample? then ( glyph of sample ) else true
    #.........................................................................................................
    $extract_lineup = =>
      return $ ( [ glyph, sortcode ], send ) =>
        [ _, lineup, ]              = sortcode.split ';'
        [ infix, suffix, prefix, ]  = lineup.split ','
        lineup                      = prefix + '|' + infix + '|' + suffix
        send [ glyph, lineup, ]
    #.........................................................................................................
    $transform = => D.combine [
        $reorder_phrase()
        $exclude_gaiji()
        $include_sample()
        $extract_lineup()
        ]
    #.........................................................................................................
    prefix_v1 = { prefix: [ 'pos', 'guide/kwic/v1/sortcode', ], }
    prefix_v2 = { prefix: [ 'pos', 'guide/kwic/v2/sortcode', ], }
    input_v1  = ( HOLLERITH.create_phrasestream db, prefix_v1 ).pipe $transform()
    input_v2  = ( HOLLERITH.create_phrasestream db, prefix_v2 ).pipe $transform()
    #.........................................................................................................
    input_v1
      .pipe D.$lockstep input_v2
      .pipe do =>
        count = 0
        return $ ( [ [ glyph_v1, lineup_v1, ], [ glyph_v2, lineup_v2, ], ], send ) =>
          spc   = '\u3000'
          line  = lineup_v1 + spc + glyph_v1 + spc + '◉' + spc + lineup_v2 + spc + glyph_v2
          # help line
          count += 1
          help ƒ count if count % 10000 is 0
          echo line
    #.........................................................................................................
    return null

#-----------------------------------------------------------------------------------------------------------
@show_codepoints_with_missing_predicates = ( v2_db, prd = 'guide/kwic/v1/lineup' ) ->
  #.........................................................................................................
  home          = join __dirname, '../../jizura-datasources'
  v1_route      = join home, 'data/leveldb'
  v2_route      = join home, 'data/leveldb-v2'
  v1_db         = HOLLERITH.new_db v1_route, create: no
  v2_db        ?= HOLLERITH.new_db v2_route, create: no
  help "using DB at #{v1_db[ '%self' ][ 'location' ]}"
  help "using DB at #{v2_db[ '%self' ][ 'location' ]}"
  rank_limit    = Infinity
  rank_limit    = 100
  #.........................................................................................................
  $extract_glyph = => $ ( xpos, send ) => send xpos[ 3 ]
  $exclude_gaiji = => D.$filter ( glyph ) => ( not glyph.startsWith '&' ) or ( glyph.startsWith '&jzr#' )
  #.........................................................................................................
  $show_progress = =>
    count = 0
    return D.$observe =>
      count += +1
      echo ƒ count if count % 10000 is 0
  #.........................................................................................................
  $show = => D.$observe ( [ glyph, keys, ] ) =>
    echo ( CHR.as_fncr glyph, input: 'xncr' ), CHR.as_uchr glyph, input: 'xncr'
    for key in keys
      echo '  ' + key
  #.........................................................................................................
  $exclude_rare_glyphs = =>
    ### TAINT code duplication; factor out ###
    ranks = {}
    return $async ( glyph, done ) =>
      ### filter out 'uncommon' glyphs (whose rank exceeds rank limit) ###
      # debug '©72bFK', glyph, rank if ( rank = ranks[ glyph ] )?
      return done glyph if rank_limit < 0 or rank_limit is Infinity
      return done glyph if ( rank = ranks[ glyph ] )? and rank < rank_limit
      sub_prefix  = [ 'spo', glyph, 'rank/cjt', ]
      sub_query   = { prefix: sub_prefix, fallback: null, }
      HOLLERITH.read_one_phrase v2_db, sub_query, ( error, sub_phrase ) =>
        return done.error error if error?
        if sub_phrase is null
          ranks[ glyph ] = Infinity
          return done()
        [ _, _, _, rank, ]  = sub_phrase
        ranks[ glyph ]      = rank
        return done() unless rank < rank_limit
        done glyph
  #.........................................................................................................
  $test_for_predicate = ( prd ) =>
    return $async ( glyph, done ) =>
      sub_prefix  = [ 'spo', glyph, prd, ]
      sub_query   = { prefix: sub_prefix, fallback: null, }
      HOLLERITH.read_one_phrase v2_db, sub_query, ( error, sub_phrase ) =>
        return done.error error if error?
        return done glyph if sub_phrase is null
        done()
  #.........................................................................................................
  v1_lte_from_gte = ( gte ) ->
    R = new Buffer ( last_idx = Buffer.byteLength gte ) + 1
    R.write gte
    R[ last_idx ] = 0xff
    return R
  #.........................................................................................................
  $fetch_v1_entries = =>
    return $async ( glyph, done ) =>
      gte         = "so|glyph:#{glyph}"
      lte         = v1_lte_from_gte gte
      sub_input   = v1_db[ '%self' ].createKeyStream { gte, lte, }
      Z           = []
      # sub_input.on 'data', ( data ) -> debug '©9Wqdh', data
      sub_input
        .pipe $ ( key, send, end ) =>
          if key?
            Z.push key.toString 'utf-8'
          if end?
            end()
            done [ glyph, Z, ]
  #.........................................................................................................
  # prefix  = { prefix: [ 'pos', 'cp/cid', ], }
  prefix  = { prefix: [ 'pos', 'cp/inner/original', ], }
  input   = HOLLERITH.create_phrasestream v2_db, prefix
  #.........................................................................................................
  input
    .pipe $extract_glyph()
    .pipe $exclude_gaiji()
    # .pipe $show_progress()
    # .pipe $exclude_rare_glyphs()
    .pipe $test_for_predicate prd
    .pipe $fetch_v1_entries()
    .pipe D.$show()
    .pipe $show()
  #.........................................................................................................
  return null

#-----------------------------------------------------------------------------------------------------------
@show_encoding_sample = ->
  encoding  = HOLLERITH.DUMP.encodings[ 'dbcs2' ]
  encoding  = HOLLERITH.DUMP.encodings[ 'aleph' ]
  encoding  = HOLLERITH.DUMP.encodings[ 'rdctn' ]
  phrases   = [
    [ '丁', 'strokecount',     2,                          ]
    [ '三', 'strokecount',     3,                          ]
    [ '夫', 'strokecount',     5,                          ]
    [ '國', 'strokecount',     11,                         ]
    [ '形', 'strokecount',     7,                          ]
    [ '丁', 'componentcount',  1,                          ]
    [ '三', 'componentcount',  1,                          ]
    [ '夫', 'componentcount',  1,                          ]
    [ '國', 'componentcount',  4,                          ]
    [ '形', 'componentcount',  2,                          ]
    [ '丁', 'components',      [ '丁', ],                  ]
    [ '三', 'components',      [ '三', ],                  ]
    [ '夫', 'components',      [ '夫', ],                  ]
    [ '國', 'components',      [ '囗', '戈', '口', '一', ], ]
    [ '形', 'components',      [ '开', '彡', ],             ]
    ]
  for [ sbj, prd, obj, ] in phrases
    key       = ( HOLLERITH.CODEC.encode [ sbj, prd, ], )
    value     = ( new Buffer JSON.stringify obj )
    key_rpr   = ( encoding[ key[ idx ] ] for idx in [ 0 ... key.length ] ).join ''
    value_rpr = ( encoding[ value[ idx ] ] for idx in [ 0 ... value.length ] ).join ''
    urge key_rpr, '┊', value_rpr
  b = new Buffer '一x丁x丂'
  # text = new Buffer '一'
  # text_rpr =
  # help b, text_rpr
  help HOLLERITH.DUMP.rpr_of_buffer null, HOLLERITH.CODEC.encode [ true, -1 / 7, ]

  # chrs = []
  # for cid in [ 0 .. 255 ]
  #   chrs.push String.fromCodePoint cid
  #   chrs.push '\n' if cid > 0 and cid % 32 is 0
  # debug '©ZgY4D', chrs
  # help chrs.join ''
  # urge ( String.fromCodePoint cid for cid in [ 0x2400 .. 0x2426 ] ).join ''
  # urge ( String.fromCodePoint cid for cid in [ 0x24b6 .. 0x24e9 ] ).join ''
  # urge ( String.fromCodePoint cid for cid in [ 0xff01 .. 0xff60 ] ).join ''


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
  # @find_good_kwic_sample_glyphs_3()
  @show_kwic_v2_sample()
  # @show_codepoints_with_missing_predicates()
  # @show_encoding_sample()
  # @compile_encodings()


