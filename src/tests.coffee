


############################################################################################################
njs_path                  = require 'path'
# njs_fs                    = require 'fs'
join                      = njs_path.join
#...........................................................................................................
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'HOLLERITH/tests'
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
# eventually                = suspend.eventually
# immediately               = suspend.immediately
# repeat_immediately        = suspend.repeat_immediately
# every                     = suspend.every
#...........................................................................................................
test                      = require 'guy-test'
#...........................................................................................................
D                         = require 'pipedreams2'
$                         = D.remit.bind D
#...........................................................................................................
HOLLERITH                 = require './main'
db                        = null
#...........................................................................................................
BYTEWISE                  = require 'bytewise'
levelup                   = require 'levelup'
leveldown                 = require 'leveldown'
CODEC                     = require './codec'


#-----------------------------------------------------------------------------------------------------------
@_encode_list = ( list ) ->
  ( list[ idx ] = BYTEWISE.encode value ) for value, idx in list
  return list

#-----------------------------------------------------------------------------------------------------------
@_decode_list = ( list ) ->
  ( list[ idx ] = BYTEWISE.decode value ) for value, idx in list
  return list

#-----------------------------------------------------------------------------------------------------------
@_sort_list = ( list ) ->
  @_encode_list list
  list.sort Buffer.compare
  @_decode_list list
  return list

#-----------------------------------------------------------------------------------------------------------
@_feed_test_data = ( db, probes_idx, handler ) ->
  switch probes_idx
    #-------------------------------------------------------------------------------------------------------
    when 0
      step ( resume ) =>
        yield HOLLERITH.clear db, resume
        input = D.create_throughstream()
        input
          .pipe HOLLERITH.$write db, 3
          # .pipe D.$show()
          .pipe D.$on_end =>
            urge "test data written"
            handler null
        #...................................................................................................
        for probe in @_feed_test_data.probes[ probes_idx ]
          # key = HOLLERITH.new_so_key db, probe...
          # debug '©WV0j2', probe
          input.write probe
        input.end()
    #-------------------------------------------------------------------------------------------------------
    when 1
      step ( resume ) =>
        yield HOLLERITH.clear db, resume
        input = D.create_throughstream()
        input
          .pipe HOLLERITH.$write db, 3
          # .pipe D.$show()
          .pipe D.$on_end =>
            urge "test data written"
            handler null
        #...................................................................................................
        for url_key in @_feed_test_data.probes[ probes_idx ]
          key = HOLLERITH.key_from_url db, url_key
          input.write key
        input.end()
    #-------------------------------------------------------------------------------------------------------
    else return handler new Error "illegal probes index #{rpr probes_idx}"
  #.........................................................................................................
  return null

#-----------------------------------------------------------------------------------------------------------
@_feed_test_data.probes = []

#...........................................................................................................
@_feed_test_data.probes.push [
  [ '𧷟1', 'guide/lineup/length',              1,                                   ]
  [ '𧷟2', 'guide/lineup/length',              2,                                   ]
  [ '𧷟3', 'guide/lineup/length',              3,                                   ]
  [ '𧷟4', 'guide/lineup/length',              4,                                   ]
  [ '𧷟', 'guide/lineup/length',              5,                                    ]
  [ '𧷟6', 'guide/lineup/length',              6,                                   ]
  [ '𧷟', 'cp/cid',                           163295,                               ]
  [ '𧷟', 'guide/uchr/has',                   [ '八', '刀', '宀', '', '貝', ],      ]
  [ '𧷟', 'rank/cjt',                         5432,                                 ]
  [ '八', 'factor/strokeclass/wbf',          '34',                                  ]
  [ '刀', 'factor/strokeclass/wbf',          '5(12)3',                              ]
  [ '宀', 'factor/strokeclass/wbf',          '44',                                  ]
  [ '', 'factor/strokeclass/wbf',          '12',                                  ]
  [ '貝', 'factor/strokeclass/wbf',          '25(12)',                              ]
  [ '八', 'rank/cjt',                         12541,                                ]
  [ '刀', 'rank/cjt',                         12542,                                ]
  [ '宀', 'rank/cjt',                         12543,                                ]
  [ '', 'rank/cjt',                         12544,                                ]
  [ '貝', 'rank/cjt',                         12545,                                ]
  ]

#...........................................................................................................
@_feed_test_data.probes.push [
  'so|glyph:劬|cp/fncr:u-cjk/52ac|0'
  'so|glyph:邭|cp/fncr:u-cjk/90ad|0'
  'so|glyph:𠴦|cp/fncr:u-cjk-xb/20d26|0'
  'so|glyph:𤿯|cp/fncr:u-cjk-xb/24fef|0'
  'so|glyph:𧑴|cp/fncr:u-cjk-xb/27474|0'
  'so|glyph:𨒡|cp/fncr:u-cjk-xb/284a1|0'
  'so|glyph:𪚧|cp/fncr:u-cjk-xb/2a6a7|0'
  'so|glyph:𪚫|cp/fncr:u-cjk-xb/2a6ab|0'
  'so|glyph:𤿯|strokeorder:352513553254|0'
  'so|glyph:𠴦|strokeorder:3525141121|0'
  'so|glyph:𨒡|strokeorder:35251454|0'
  'so|glyph:邭|strokeorder:3525152|0'
  'so|glyph:𪚫|strokeorder:352515251115115113541|0'
  'so|glyph:𪚧|strokeorder:35251525112511511|0'
  'so|glyph:𧑴|strokeorder:352515251214251214|0'
  'so|glyph:劬|strokeorder:3525153|0'
  ]


#-----------------------------------------------------------------------------------------------------------
@[ "write without error" ] = ( T, done ) ->
  probes_idx  = 0
  idx = -1
  step ( resume ) =>
    yield @_feed_test_data db, probes_idx, resume
    done()

#-----------------------------------------------------------------------------------------------------------
@[ "read without error" ] = ( T, done ) ->
  probes_idx  = 0
  idx = -1
  step ( resume ) =>
    yield @_feed_test_data db, probes_idx, resume
    input = HOLLERITH.create_facetstream db
    input
      # .pipe HOLLERITH.$url_from_key db
      .pipe $ ( [ key, value, ], send ) =>
        idx += +1
        # T.eq key, matchers[ idx ]
      .pipe D.$on_end => done()

#-----------------------------------------------------------------------------------------------------------
@[ "read keys without error (1)" ] = ( T, done ) ->
  step ( resume ) =>
    yield HOLLERITH.clear db, resume
    for idx in [ 0 ... 10 ]
      db[ '%self' ].put ( HOLLERITH._encode db, [ 'x', idx, 'x', ] ), HOLLERITH._zero_enc
    #.......................................................................................................
    probe_idx = 4
    count     = 0
    query     = HOLLERITH._query_from_prefix db, [ 'x', probe_idx, ]
    input     = db[ '%self' ].createReadStream query
    input
      .pipe $ ( { key, value, }, send ) =>
        count += 1
        T.eq ( HOLLERITH._decode db, key )[ 1 ], probe_idx
      .pipe D.$on_end =>
        T.eq count, 1
        done()

#-----------------------------------------------------------------------------------------------------------
@[ "read keys without error (2)" ] = ( T, done ) ->
  step ( resume ) =>
    yield HOLLERITH.clear db, resume
    for idx in [ 0 ... 10 ]
      db[ '%self' ].put ( HOLLERITH._encode db, [ 'x', idx, 'x', ] ), HOLLERITH._zero_enc
    #.......................................................................................................
    probe_idx = 4
    count     = 0
    prefix    = [ 'x', probe_idx, ]
    input     = HOLLERITH.create_facetstream db, prefix
    input
      .pipe $ ( facet, send ) =>
        count += 1
        [ key, value, ] = facet
        T.eq key[ 1 ], probe_idx
      .pipe D.$on_end =>
        T.eq count, 1
        done()

#-----------------------------------------------------------------------------------------------------------
@[ "read keys without error (3)" ] = ( T, done ) ->
  step ( resume ) =>
    yield HOLLERITH.clear db, resume
    for idx in [ 0 ... 10 ]
      db[ '%self' ].put ( HOLLERITH._encode db, [ 'x', idx, 'x', ] ), HOLLERITH._zero_enc
    #.......................................................................................................
    probe_idx = 3
    count     = 0
    delta     = 2
    lo        = [ 'x', probe_idx, ]
    hi        = [ 'x', probe_idx + delta, ]
    query     = { gte: ( HOLLERITH._encode db, lo ), lte: ( HOLLERITH._query_from_prefix db, hi )[ 'lte' ], }
    input     = db[ '%self' ].createReadStream query
    input
      .pipe $ ( { key, value, }, send ) =>
        count += 1
        T.eq ( HOLLERITH._decode db, key )[ 1 ], probe_idx + count - 1
      .pipe D.$on_end =>
        T.eq count, delta + 1
        done()

#-----------------------------------------------------------------------------------------------------------
@[ "read keys without error (4)" ] = ( T, done ) ->
  step ( resume ) =>
    yield HOLLERITH.clear db, resume
    for idx in [ 0 ... 10 ]
      db[ '%self' ].put ( HOLLERITH._encode db, [ 'x', idx, 'x', ] ), HOLLERITH._zero_enc
    #.......................................................................................................
    probe_idx = 3
    count     = 0
    delta     = 2
    lo        = [ 'x', probe_idx, ]
    hi        = [ 'x', probe_idx + delta, ]
    input     = HOLLERITH.create_facetstream db, lo, hi
    input
      .pipe $ ( [ key, value, ], send ) =>
        count += 1
        T.eq key[ 1 ], probe_idx + count - 1
      .pipe D.$on_end =>
        T.eq count, delta + 1
        done()

#-----------------------------------------------------------------------------------------------------------
@[ "create_facetstream throws with wrong arguments" ] = ( T, done ) ->
  message = "must give `lo_hint` when `hi_hint` is given"
  T.throws message, ( -> HOLLERITH.create_facetstream db, null, [ 'xxx', ] )
  done()

#-----------------------------------------------------------------------------------------------------------
@[ "read POS facets" ] = ( T, done ) ->
  probes_idx  = 0
  idx         = -1
  #.........................................................................................................
  key_matchers = [
    [ 'pos', 'guide/lineup/length', 2, '𧷟2' ]
    [ 'pos', 'guide/lineup/length', 3, '𧷟3' ]
    [ 'pos', 'guide/lineup/length', 4, '𧷟4' ]
    ]
  #.........................................................................................................
  phrase_matchers = [
    [ '𧷟2', 'guide/lineup/length', 2 ]
    [ '𧷟3', 'guide/lineup/length', 3 ]
    [ '𧷟4', 'guide/lineup/length', 4 ]
    ]
  #.........................................................................................................
  step ( resume ) =>
    yield @_feed_test_data db, probes_idx, resume
    lo = [ 'pos', 'guide/lineup/length', 2, ]
    hi = [ 'pos', 'guide/lineup/length', 4, ]
    # input   = HOLLERITH.create_keystream db, lo
    input   = HOLLERITH.create_facetstream db, lo, hi
    input
      # .pipe HOLLERITH.$url_from_key db
      .pipe $ ( [ key, value, ], send ) =>
        idx += +1
        phrase = HOLLERITH.as_phrase db, key, value
        T.eq key, key_matchers[ idx ]
        T.eq phrase, phrase_matchers[ idx ]
      .pipe D.$on_end => done()

#-----------------------------------------------------------------------------------------------------------
@[ "read POS phrases (1)" ] = ( T, done ) ->
  probes_idx  = 0
  idx         = -1
  #.........................................................................................................
  matchers = [
    [ '𧷟2', 'guide/lineup/length', 2 ]
    [ '𧷟3', 'guide/lineup/length', 3 ]
    [ '𧷟4', 'guide/lineup/length', 4 ]
    ]
  #.........................................................................................................
  step ( resume ) =>
    yield @_feed_test_data db, probes_idx, resume
    lo = [ 'pos', 'guide/lineup/length', 2, ]
    hi = [ 'pos', 'guide/lineup/length', 4, ]
    input   = HOLLERITH.create_phrasestream db, lo, hi
    input
      .pipe $ ( phrase, send ) =>
        idx += +1
        T.eq phrase, matchers[ idx ]
      .pipe D.$on_end => done()

#-----------------------------------------------------------------------------------------------------------
@[ "read POS phrases (2)" ] = ( T, done ) ->
  probes_idx  = 0
  idx         = -1
  count       = 0
  #.........................................................................................................
  matchers = [
    [ '𧷟', 'guide/uchr/has', '八', 0 ]
    [ '𧷟', 'guide/uchr/has', '刀', 1 ]
    [ '𧷟', 'guide/uchr/has', '宀', 2 ]
    [ '𧷟', 'guide/uchr/has', '貝', 4 ]
    [ '𧷟', 'guide/uchr/has', '', 3 ]
    ]
  #.........................................................................................................
  step ( resume ) =>
    yield @_feed_test_data db, probes_idx, resume
    prefix    = [ 'pos', 'guide/uchr/has', ]
    input     = HOLLERITH.create_phrasestream db, prefix
    settings  = { indexed: no, }
    input
      .pipe $ ( phrase, send ) =>
        count  += +1
        idx    += +1
        T.eq phrase, matchers[ idx ]
      .pipe D.$on_end =>
        T.eq count, matchers.length
        done()

#-----------------------------------------------------------------------------------------------------------
@[ "read SPO phrases" ] = ( T, done ) ->
  probes_idx  = 0
  idx         = -1
  count       = 0
  #.........................................................................................................
  matchers = [
    [ '𧷟', 'cp/cid', 163295 ]
    [ '𧷟', 'guide/lineup/length', 5 ]
    [ '𧷟', 'guide/uchr/has', [ '八', '刀', '宀', '', '貝' ] ]
    [ '𧷟', 'rank/cjt', 5432 ]
    [ '𧷟1', 'guide/lineup/length', 1 ]
    [ '𧷟2', 'guide/lineup/length', 2 ]
    [ '𧷟3', 'guide/lineup/length', 3 ]
    [ '𧷟4', 'guide/lineup/length', 4 ]
    [ '𧷟6', 'guide/lineup/length', 6 ]
    ]
  #.........................................................................................................
  step ( resume ) =>
    yield @_feed_test_data db, probes_idx, resume
    prefix  = [ 'spo', '𧷟', ]
    input   = HOLLERITH.create_phrasestream db, prefix
    input
      .pipe $ ( phrase, send ) =>
        count  += +1
        idx    += +1
        T.eq phrase, matchers[ idx ]
      .pipe D.$on_end =>
        T.eq count, matchers.length
        done()

#-----------------------------------------------------------------------------------------------------------
@[ "read with sub-read (1)" ] = ( T, done ) ->
  probes_idx  = 0
  idx         = -1
  count       = 0
  #.........................................................................................................
  matchers = [
    [ '𧷟', [ '八', 'factor/strokeclass/wbf', '34' ] ]
    ]
  #.........................................................................................................
  step ( resume ) =>
    yield @_feed_test_data db, probes_idx, resume
    prefix    = [ 'spo', '𧷟', 'guide/uchr/has', ]
    input     = HOLLERITH.create_phrasestream db, prefix
    settings  = { indexed: no, }
    input
      .pipe HOLLERITH.read_sub db, settings, ( [ glyph, prd, guides, ] ) =>
        sub_input = HOLLERITH.create_phrasestream db, [ 'spo', guides[ 0 ], 'factor/strokeclass/wbf', ]
        return [ glyph, sub_input, ]
      .pipe $ ( phrase, send ) =>
        count  += +1
        idx    += +1
        T.eq phrase, matchers[ idx ]
      .pipe D.$on_end =>
        T.eq count, matchers.length
        done()

#-----------------------------------------------------------------------------------------------------------
@[ "read with sub-read (2)" ] = ( T, done ) ->
  probes_idx  = 0
  idx         = -1
  count       = 0
  #.........................................................................................................
  matchers = [
    [ '𧷟', [ '八', 'factor/strokeclass/wbf', '34' ] ]
    [ '𧷟', [ '刀', 'factor/strokeclass/wbf', '5(12)3' ] ]
    [ '𧷟', [ '宀', 'factor/strokeclass/wbf', '44' ] ]
    [ '𧷟', [ '貝', 'factor/strokeclass/wbf', '25(12)' ] ]
    [ '𧷟', [ '', 'factor/strokeclass/wbf', '12' ] ]
    ]
  #.........................................................................................................
  step ( resume ) =>
    yield @_feed_test_data db, probes_idx, resume
    prefix    = [ 'pos', 'guide/uchr/has', ]
    input     = HOLLERITH.create_phrasestream db, prefix
    settings  = { indexed: no, }
    input
      .pipe HOLLERITH.read_sub db, settings, ( phrase ) =>
        [ glyph, prd, guide, ]  = phrase
        prefix                  = [ 'spo', guide, 'factor/strokeclass/wbf', ]
        sub_input               = HOLLERITH.create_phrasestream db, prefix
        return [ glyph, sub_input, ]
      .pipe $ ( phrase, send ) =>
        debug '©quPbg', JSON.stringify phrase
        count  += +1
        idx    += +1
        T.eq phrase, matchers[ idx ]
      .pipe D.$on_end =>
        T.eq count, matchers.length
        done()

#-----------------------------------------------------------------------------------------------------------
@[ "read with sub-read (3)" ] = ( T, done ) ->
  probes_idx  = 0
  idx         = -1
  count       = 0
  #.........................................................................................................
  matchers = [
    [["𧷟","八","34"],["八","rank/cjt",12541]]
    [["𧷟","刀","5(12)3"],["刀","rank/cjt",12542]]
    [["𧷟","宀","44"],["宀","rank/cjt",12543]]
    [["𧷟","貝","25(12)"],["貝","rank/cjt",12545]]
    [["𧷟","","12"],["","rank/cjt",12544]]
    ]
  #.........................................................................................................
  step ( resume ) =>
    yield @_feed_test_data db, probes_idx, resume
    prefix    = [ 'pos', 'guide/uchr/has', ]
    input     = HOLLERITH.create_phrasestream db, prefix
    settings  = { indexed: no, }
    input
      .pipe HOLLERITH.read_sub db, settings, ( phrase ) =>
        [ glyph, prd, guide, ]  = phrase
        prefix                  = [ 'spo', guide, 'factor/strokeclass/wbf', ]
        sub_input               = HOLLERITH.create_phrasestream db, prefix
        return [ glyph, sub_input, ]
      .pipe HOLLERITH.read_sub db, settings, ( xphrase ) =>
        [ glyph, [ guide, prd, shapeclass, ] ]  = xphrase
        prefix                                  = [ 'spo', guide, 'rank/cjt', ]
        sub_input                               = HOLLERITH.create_phrasestream db, prefix
        return [ [ glyph, guide, shapeclass, ], sub_input, ]
      .pipe $ ( xphrase, send ) =>
        debug '©quPbg', JSON.stringify xphrase
        count  += +1
        idx    += +1
        T.eq xphrase, matchers[ idx ]
      .pipe D.$on_end =>
        T.eq count, matchers.length
        done()

#-----------------------------------------------------------------------------------------------------------
@[ "sorting (1)" ] = ( T, done ) ->
  step ( resume ) =>
    settings =
      db:           leveldown
      keyEncoding:  'binary'
    leveldb = levelup '/tmp/hollerith2-test', settings
    yield clear_leveldb leveldb, resume
    probes = [
      'a'
      'ab'
      'abc'
      'abc\x00'
      'abc\x00a'
      'abca'
      'abcb'
      'abcc'
      'abcd'
      'abcde'
      'abcdef'
      'abcdefg' ]
    matchers = [
      new Buffer [ 0x61, ]
      new Buffer [ 0x61, 0x62, ]
      new Buffer [ 0x61, 0x62, 0x63, ]
      new Buffer [ 0x61, 0x62, 0x63, 0x00, ]
      new Buffer [ 0x61, 0x62, 0x63, 0x00, 0x61, ]
      new Buffer [ 0x61, 0x62, 0x63, 0x61, ]
      new Buffer [ 0x61, 0x62, 0x63, 0x62, ]
      new Buffer [ 0x61, 0x62, 0x63, 0x63, ]
      new Buffer [ 0x61, 0x62, 0x63, 0x64, ]
      new Buffer [ 0x61, 0x62, 0x63, 0x64, 0x65, ]
      new Buffer [ 0x61, 0x62, 0x63, 0x64, 0x65, 0x66, ]
      new Buffer [ 0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, ] ]
    CND.shuffle probes
    for probe in probes
      probe_bfr = new Buffer probe, 'utf-8'
      yield leveldb.put probe_bfr, '1', resume
      probe_bfrs = yield read_all_keys leveldb, resume
    probe_bfrs = yield read_all_keys leveldb, resume
    # debug '©RXPvv', '\n' + rpr probe_bfrs
    for probe_bfr, probe_idx in probe_bfrs
      matcher = matchers[ probe_idx ]
      ### TAINT looks like `T.eq buffer1, buffer2` doesn't work---sometimes... ###
      # T.eq probe_bfr, matcher
      T.ok probe_bfr.equals matcher
    leveldb.close -> done()

#-----------------------------------------------------------------------------------------------------------
@[ "sorting (2)" ] = ( T, done ) ->
  ### This test is here because there seemed to occur some strange ordering issues when
  using memdown instead of leveldown ###
  step ( resume ) =>
    settings =
      db:           leveldown
      keyEncoding:  'binary'
    leveldb = levelup '/tmp/hollerith2-test', settings
    yield clear_leveldb leveldb, resume
    probes = [
      new Buffer [ 0x00, ]
      new Buffer [ 0x01, ]
      new Buffer [ 0x02, ]
      new Buffer [ 0x03, ]
      new Buffer [ 0xf9, ]
      new Buffer [ 0xfa, ]
      new Buffer [ 0xfb, ]
      new Buffer [ 0xfc, ]
      new Buffer [ 0xfd, ]
      ]
    matchers = ( probe for probe in probes )
    CND.shuffle probes
    for probe in probes
      yield leveldb.put probe, '1', resume
    probe_bfrs = yield read_all_keys leveldb, resume
    for probe_bfr, probe_idx in probe_bfrs
      matcher = matchers[ probe_idx ]
      # debug '©15060', probe_idx, probe_bfr, matcher
      ### TAINT looks like `T.eq buffer1, buffer2` doesn't work---sometimes... ###
      T.ok probe_bfr.equals matcher
    leveldb.close -> done()

#-----------------------------------------------------------------------------------------------------------
@[ "H2 codec `encode` throws on anything but a list" ] = ( T, done ) ->
  T.throws "expected a list, got a text",         ( -> CODEC.encode 'unaccaptable' )
  T.throws "expected a list, got a number",       ( -> CODEC.encode 42 )
  T.throws "expected a list, got a boolean",      ( -> CODEC.encode true )
  T.throws "expected a list, got a boolean",      ( -> CODEC.encode false )
  T.throws "expected a list, got a jsundefined",  ( -> CODEC.encode() )
  done()

#-----------------------------------------------------------------------------------------------------------
@[ "sort texts with H2 codec (1)" ] = ( T, done ) ->
  step ( resume ) =>
    settings =
      db:           leveldown
      keyEncoding:  'binary'
    leveldb = levelup '/tmp/hollerith2-test', settings
    yield clear_leveldb leveldb, resume
    probes = [
      'a'
      'ab'
      'abc'
      'abc\x00'
      'abc\x00a'
      'abca'
      'abca\x00'
      'abcb'
      'abcc'
      'abcd'
      'abcde'
      'abcdef'
      'abcdefg'
      ]
    matchers = ( [ probe, ] for probe in probes )
    CND.shuffle probes
    for probe in probes
      yield leveldb.put ( CODEC.encode [ probe, ] ), '1', resume
    probe_bfrs  = yield read_all_keys leveldb, resume
    probes      = ( CODEC.decode probe_bfr for probe_bfr in probe_bfrs )
    show_keys_and_key_bfrs probes, probe_bfrs
    for probe, probe_idx in probes
      matcher = matchers[ probe_idx ]
      T.eq probe, matcher
    leveldb.close -> done()

#-----------------------------------------------------------------------------------------------------------
@[ "sort texts with H2 codec (2)" ] = ( T, done ) ->
  step ( resume ) =>
    settings =
      db:           leveldown
      keyEncoding:  'binary'
    leveldb = levelup '/tmp/hollerith2-test', settings
    yield clear_leveldb leveldb, resume
    probes = [
      ''
      ' '
      'a'
      'abc'
      '一'
      '一二'
      '一二三'
      '三'
      '二'
      '𠀀'
      '𠀀\x00'
      '𠀀a'
      '𪜀'
      '𫝀'
      String.fromCodePoint 0x10ffff
      ]
    matchers = ( [ probe, ] for probe in probes )
    CND.shuffle probes
    for probe in probes
      probe_bfr = CODEC.encode [ probe, ]
      yield leveldb.put probe_bfr, '1', resume
    probe_bfrs  = yield read_all_keys leveldb, resume
    # debug '©Fd5iw', probe_bfrs
    probes      = ( CODEC.decode probe_bfr for probe_bfr in probe_bfrs )
    show_keys_and_key_bfrs probes, probe_bfrs
    for probe, probe_idx in probes
      matcher = matchers[ probe_idx ]
      T.eq probe, matcher
    leveldb.close -> done()

#-----------------------------------------------------------------------------------------------------------
@[ "sort numbers with H2 codec (1)" ] = ( T, done ) ->
  step ( resume ) =>
    settings =
      db:           leveldown
      keyEncoding:  'binary'
    leveldb = levelup '/tmp/hollerith2-test', settings
    yield clear_leveldb leveldb, resume
    probes_and_descriptions = [
      [ -Infinity,               "-Infinity"               ]
      [ -Number.MAX_VALUE,       "-Number.MAX_VALUE"       ]
      [ Number.MIN_SAFE_INTEGER, "Number.MIN_SAFE_INTEGER" ]
      [ -123456789,              "-123456789"              ]
      [ -3,                      "-3"                      ]
      [ -2,                      "-2"                      ]
      [ -1.5,                    "-1.5"                    ]
      [ -1,                      "-1"                      ]
      [ -Number.EPSILON,         "-Number.EPSILON"         ]
      [ -Number.MIN_VALUE,       "-Number.MIN_VALUE"       ]
      [ 0,                       "0"                       ]
      [ +Number.MIN_VALUE,       "+Number.MIN_VALUE"       ]
      [ +Number.EPSILON,         "+Number.EPSILON"         ]
      [ +1,                      "+1"                      ]
      [ +1.5,                    "+1.5"                    ]
      [ +2,                      "+2"                      ]
      [ +3,                      "+3"                      ]
      [ +123456789,              "+123456789"              ]
      [ Number.MAX_SAFE_INTEGER, "Number.MAX_SAFE_INTEGER" ]
      [ Number.MAX_VALUE,        "Number.MAX_VALUE"        ]
      [ +Infinity,               "+Infinity"               ]
      ]
    # probes_and_descriptions.sort ( a, b ) ->
    #   return +1 if a[ 0 ] > b[ 0 ]
    #   return -1 if a[ 0 ] < b[ 0 ]
    #   return  0
    matchers      = ( [ pad[ 0 ], ] for pad in probes_and_descriptions )
    # descriptions  = ( [ pad[ 1 ], ] for pad in probes_and_descriptions )
    for pad in probes_and_descriptions
      urge pad
    CND.shuffle probes_and_descriptions
    for [ probe, _, ] in probes_and_descriptions
      probe_bfr = CODEC.encode [ probe, ]
      yield leveldb.put probe_bfr, '1', resume
    probe_bfrs  = yield read_all_keys leveldb, resume
    probes      = ( CODEC.decode probe_bfr for probe_bfr in probe_bfrs )
    show_keys_and_key_bfrs probes, probe_bfrs
    for probe, probe_idx in probes
      matcher = matchers[ probe_idx ]
      T.eq probe, matcher
    leveldb.close -> done()

#-----------------------------------------------------------------------------------------------------------
@[ "sort mixed values with H2 codec" ] = ( T, done ) ->
  throw new Error 'XXXX'
  step ( resume ) =>
    settings =
      db:           leveldown
      keyEncoding:  'binary'
    leveldb = levelup '/tmp/hollerith2-test', settings
    yield clear_leveldb leveldb, resume
    probes = [
      null
      false
      true
      1234
      Infinity
      new Date 0
      ''
      '一'
      '三'
      '二'
      '𠀀'
      '𠀀\x00'
      String.fromCodePoint 0x10ffff
      ]
    matchers = ( [ probe, ] for probe in probes )
    CND.shuffle probes
    for probe in probes
      probe_bfr = CODEC.encode [ probe, ]
      yield leveldb.put probe_bfr, '1', resume
    probe_bfrs  = yield read_all_keys leveldb, resume
    # debug '©Fd5iw', probe_bfrs
    probes      = ( CODEC.decode probe_bfr for probe_bfr in probe_bfrs )
    show_keys_and_key_bfrs probes, probe_bfrs
    for probe, probe_idx in probes
      matcher = matchers[ probe_idx ]
      T.eq probe, matcher
    leveldb.close -> done()

#
# #-----------------------------------------------------------------------------------------------------------
# @[ "sort numbers with bytewise codec (1)" ] = ( T, done ) ->
#   step ( resume ) =>
#     settings =
#       db:           leveldown
#       keyEncoding:  'binary'
#     leveldb = levelup '/tmp/hollerith2-test', settings
#     yield HOLLERITH.clear leveldb, resume
#     probes = [
#       Number.MIN_VALUE # ≅ -1.79E+308
#       Number.MIN_SAFE_INTEGER # -9007199254740991
#       -123456789
#       -3
#       -2
#       -1
#       -Number.EPSILON
#       0
#       +Number.EPSILON
#       +1
#       +2
#       +3
#       +123456789
#       Number.MAX_SAFE_INTEGER # +9007199254740991
#       Number.MAX_VALUE # ≅ +1.79E+308
#       ]
#     matchers = ( [ probe, ] for probe in probes )
#     CND.shuffle probes
#     for probe in probes
#       probe_bfr = ( require 'bytewise' ).encode probe
#       yield leveldb.put probe_bfr, '1', resume
#     probe_bfrs  = yield read_all_keys leveldb, resume
#     probes      = ( ( require 'bytewise' ).decode probe_bfr for probe_bfr in probe_bfrs )
#     show_keys_and_key_bfrs probes, probe_bfrs
#     done()


#===========================================================================================================
# HELPERS
#-----------------------------------------------------------------------------------------------------------
show_keys_and_key_bfrs = ( keys, key_bfrs ) ->
  f = ( p ) -> ( t for t in ( p.toString 'hex' ).split /(..)/ when t isnt '' ).join ' '
  #.........................................................................................................
  columnify_settings =
    paddingChr: ' '
  #.........................................................................................................
  data      = []
  key_bfrs  = ( f p for p in key_bfrs )
  for key, idx in keys
    key_txt = ( rpr key ).replace /\\u0000/g, '∇'
    data.push { 'str': key_txt, 'bfr': key_bfrs[ idx ]}
  help '\n' + CND.columnify data, columnify_settings
  return null

# #-----------------------------------------------------------------------------------------------------------
# get_new_db_name = ->
#   get_new_db_name.idx += +1
#   return "/tmp/hollerith2-testdb-#{get_new_db_name.idx}"
# get_new_db_name.idx = 0

#-----------------------------------------------------------------------------------------------------------
read_all_keys = ( db, handler ) ->
  Z = []
  input = db.createKeyStream()
  input.on 'end', -> handler null, Z
  input
    .pipe $ ( data, send ) => Z.push data

#-----------------------------------------------------------------------------------------------------------
clear_leveldb = ( leveldb, handler ) ->
  step ( resume ) =>
    route = leveldb[ 'location' ]
    yield leveldb.close resume
    yield leveldown.destroy route, resume
    yield leveldb.open resume
    # help "erased and re-opened LevelDB at #{route}"
    handler null


# #-----------------------------------------------------------------------------------------------------------
# @[ "keys 0" ] = ( T, done ) ->
#   key_0   = HOLLERITH.new_key     db, 'so', 'glyph', '家', 'strokeorder', '4451353334'
#   key_1   = HOLLERITH.new_so_key  db,       'glyph', '家', 'strokeorder', '4451353334'
#   matcher = [ 'so', 'glyph', '家', 'strokeorder', '4451353334', 0 ]
#   T.eq key_0, matcher
#   T.eq key_1, key_0
#   done()

# #-----------------------------------------------------------------------------------------------------------
# @[ "keys 1" ] = ( T, done ) ->
#   [ sk, sv, ok, ov, ] = [ 'glyph', '家', 'strokeorder', '4451353334', ]
#   [ so_key_0, os_key_0, ] = HOLLERITH.new_keys db, 'so', sk, sv, ok, ov
#   so_key_1 = HOLLERITH.new_so_key db, sk, sv, ok, ov
#   os_key_1 = HOLLERITH.new_os_key db, sk, sv, ok, ov
#   T.eq so_key_0, so_key_1
#   T.eq os_key_0, os_key_1
#   done()

# #-----------------------------------------------------------------------------------------------------------
# @[ "keys 2" ] = ( T, done ) ->
#   [ t_0, sk_0, sv_0, ok_0, ov_0, idx_0, ] = [ 'so', 'glyph', '家', 'strokeorder', '4451353334', 0, ]
#   so_key_0 = HOLLERITH.new_key db, t_0, sk_0, sv_0, ok_0, ov_0, idx_0
#   [ t_1, sk_1, sv_1, ok_1, ov_1, idx_1, ] = HOLLERITH.as_phrase db, so_key_0
#   T.eq [ t_0, sk_0, sv_0, ok_0, ov_0, idx_0, ], [ t_1, sk_1, sv_1, ok_1, ov_1, idx_1, ]
#   done()

# #-----------------------------------------------------------------------------------------------------------
# @[ "ordering and value recovery 0" ] = ( T, done ) ->
#   matchers    = []
#   probes_idx  = 0
#   #.........................................................................................................
#   for probe in @_feed_test_data.probes[ probes_idx ]
#     [ sk, sv, ok, ov, ] = probe
#     matchers.push [ 'os', ok, ov, sk, sv, 0, ]
#     matchers.push [ 'so', sk, sv, ok, ov, 0, ]
#   @_sort_list matchers
#   #.........................................................................................................
#   idx = -1
#   step ( resume ) =>
#     yield @_feed_test_data db, probes_idx, resume
#     input = db[ '%self' ].createKeyStream()
#     input
#       .pipe $ ( key, send ) =>
#         key = BYTEWISE.decode key
#         idx += +1
#         T.eq key, matchers[ idx ]
#       .pipe D.$on_end => done()

# #-----------------------------------------------------------------------------------------------------------
# @[ "ordering and value recovery 1" ] = ( T, done ) ->
#   probes_idx  = 1
#   #.........................................................................................................
#   matchers    = [
#     'os|cp/fncr:u-cjk-xb/20d26|glyph:𠴦|0'
#     'os|cp/fncr:u-cjk-xb/24fef|glyph:𤿯|0'
#     'os|cp/fncr:u-cjk-xb/27474|glyph:𧑴|0'
#     'os|cp/fncr:u-cjk-xb/284a1|glyph:𨒡|0'
#     'os|cp/fncr:u-cjk-xb/2a6a7|glyph:𪚧|0'
#     'os|cp/fncr:u-cjk-xb/2a6ab|glyph:𪚫|0'
#     'os|cp/fncr:u-cjk/52ac|glyph:劬|0'
#     'os|cp/fncr:u-cjk/90ad|glyph:邭|0'
#     'os|strokeorder:352513553254|glyph:𤿯|0'
#     'os|strokeorder:3525141121|glyph:𠴦|0'
#     'os|strokeorder:35251454|glyph:𨒡|0'
#     'os|strokeorder:3525152|glyph:邭|0'
#     'os|strokeorder:352515251115115113541|glyph:𪚫|0'
#     'os|strokeorder:35251525112511511|glyph:𪚧|0'
#     'os|strokeorder:352515251214251214|glyph:𧑴|0'
#     'os|strokeorder:3525153|glyph:劬|0'
#     'so|glyph:劬|cp/fncr:u-cjk/52ac|0'
#     'so|glyph:劬|strokeorder:3525153|0'
#     'so|glyph:邭|cp/fncr:u-cjk/90ad|0'
#     'so|glyph:邭|strokeorder:3525152|0'
#     'so|glyph:𠴦|cp/fncr:u-cjk-xb/20d26|0'
#     'so|glyph:𠴦|strokeorder:3525141121|0'
#     'so|glyph:𤿯|cp/fncr:u-cjk-xb/24fef|0'
#     'so|glyph:𤿯|strokeorder:352513553254|0'
#     'so|glyph:𧑴|cp/fncr:u-cjk-xb/27474|0'
#     'so|glyph:𧑴|strokeorder:352515251214251214|0'
#     'so|glyph:𨒡|cp/fncr:u-cjk-xb/284a1|0'
#     'so|glyph:𨒡|strokeorder:35251454|0'
#     'so|glyph:𪚧|cp/fncr:u-cjk-xb/2a6a7|0'
#     'so|glyph:𪚧|strokeorder:35251525112511511|0'
#     'so|glyph:𪚫|cp/fncr:u-cjk-xb/2a6ab|0'
#     'so|glyph:𪚫|strokeorder:352515251115115113541|0'
#     ]
#   #.........................................................................................................
#   idx = -1
#   step ( resume ) =>
#     yield @_feed_test_data db, probes_idx, resume
#     input = HOLLERITH.read db
#     input
#       .pipe HOLLERITH.$url_from_key db
#       .pipe $ ( key, send ) =>
#         # debug '©4i3qZ', key
#         idx += +1
#         T.eq key, matchers[ idx ]
#       .pipe D.$on_end => done()

# #-----------------------------------------------------------------------------------------------------------
# @[ "prefixes and searching 0" ] = ( T, done ) ->
#   matchers    = []
#   probes_idx  = 1
#   #.........................................................................................................
#   matchers = [
#     'os|strokeorder:3525141121|glyph:𠴦|0'
#     'os|strokeorder:35251454|glyph:𨒡|0'
#     ]
#   #.........................................................................................................
#   idx = -1
#   step ( resume ) =>
#     yield @_feed_test_data db, probes_idx, resume
#     query = HOLLERITH.new_query db, [ 'os', 'strokeorder', '352514', ]
#     # debug '©q0oj2', query
#     input = db[ '%self' ].createKeyStream query
#     input
#       #.....................................................................................................
#       .pipe $ ( bkey, send ) =>
#         url = HOLLERITH.url_from_key db, HOLLERITH._decode db, bkey
#         idx += +1
#         T.eq url, matchers[ idx ]
#       #.....................................................................................................
#       .pipe D.$on_end =>
#         T.eq idx, 1
#         done()

# #-----------------------------------------------------------------------------------------------------------
# @[ "prefixes and searching 1" ] = ( T, done ) ->
#   matchers    = []
#   probes_idx  = 1
#   #.........................................................................................................
#   matchers = [
#     'os|strokeorder:3525141121|glyph:𠴦|0'
#     'os|strokeorder:35251454|glyph:𨒡|0'
#     ]
#   #.........................................................................................................
#   idx = -1
#   step ( resume ) =>
#     yield @_feed_test_data db, probes_idx, resume
#     input = HOLLERITH.read db, [ 'os', 'strokeorder', '352514', ]
#       .pipe HOLLERITH.$url_from_key db
#       .pipe D.$show()
#       #.....................................................................................................
#       .pipe $ ( url, send ) =>
#         idx += +1
#         T.eq url, matchers[ idx ]
#       #.....................................................................................................
#       .pipe D.$on_end =>
#         T.eq idx, 1
#         done()

# #-----------------------------------------------------------------------------------------------------------
# @[ "_ordering" ] = ( T, done ) ->
#   hi = undefined
#   lo = null
#   probes = [
#     [ 'x', '<3525135>',             ]
#     [ 'x', '<3525141121>',          ]
#     [ 'x', '<35251454>',            ]
#     [ 'x', '<3525152>',             ]
#     [ 'x', '<352515251>',           ]
#     [ 'x', '<3525152511>',          ]
#     [ 'x', '<3525153>',             ]
#     [ 'x', +Infinity, ]
#     [ 'x', -Infinity, ]
#     [ 'x', 42, ]
#     [ 'x', -42, ]
#     [ 'x', 'a', ]
#     [ 'x', 'z', ]
#     [ 'x', '中', ]
#     [ 'x', '\uffff', ]
#     [ 'x', '𠂝', ]
#     # [ 'x', ( new Buffer ( String.fromCodePoint 0x10ffff ), 'utf-8' ), ]
#     # [ 'x', ( new Buffer ( String.fromCodePoint 0x10ffff ), 'utf-8' ).toString(), ]
#     # [ 'x', hi, ]
#     # [ 'x', lo, ]
#     [ 'os', 'ok', ]        # 'os|ok'
#     [ 'os', 'ok', 'ov', ]  # 'os|ok:ov'
#     [ 'os', 'ok*', ]       # 'os|ok*'
#     [ 'os', 'ok', 'ov*', ] # 'os|ok:ov*'
#     ]
#     # # [ 'os', [ 'ok', 'ov', ], [ 'sk', 'sv', ], 0, ]
#     # [ 'os', 'strokeorder', '<3525141121>',            'glyph', '𠴦', 0, ]
#     # [ 'os', 'strokeorder', '<35251454>',              'glyph', '𨒡', 0, ]
#     # [ 'os', 'strokeorder', '<3525152>',               'glyph', '邭', 0, ]
#     # [ 'os', 'strokeorder', '<352515251115115113541>', 'glyph', '𪚫', 0, ]
#     # [ 'os', 'strokeorder', '<35251525112511511>',     'glyph', '𪚧', 0, ]
#     # [ 'os', 'strokeorder', '<352515251214251214>',    'glyph', '𧑴', 0, ]
#     # [ 'os', 'strokeorder', '<3525153>',               'glyph', '劬', 0, ]
#   #.........................................................................................................
#   @_sort_list probes
#   #.........................................................................................................
#   lines = ( [ ( CND.green probe ), ( CND.grey BYTEWISE.encode probe ), ] for probe in probes )
#   log ( require 'columnify' ) lines


#-----------------------------------------------------------------------------------------------------------
@_main = ( handler ) ->
  db = HOLLERITH.new_db join __dirname, '..', 'dbs/tests'
  test @, 'timeout': 2500

############################################################################################################
unless module.parent?
  @_main()
  # a = [ 'aaa', 'b', 'c', ]
  # b = [ 'A', 'BBB', 'C', ]
  # columnify_settings =
  #   paddingChr: '_'
  #   # columns: [ 'decoded', 'encoded', 'x' ]
  # # help '\n' + CND.columnify [ a, b, ], columnify_settings
  # data = []
  # for element_a, idx in a
  #   data.push { 'str': element_a, 'bfr': b[ idx ]}
  # help '\n' + CND.columnify data, columnify_settings













