


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


# #-----------------------------------------------------------------------------------------------------------
# @_encode_list = ( list ) ->
#   ( list[ idx ] = BYTEWISE.encode value ) for value, idx in list
#   return list

# #-----------------------------------------------------------------------------------------------------------
# @_decode_list = ( list ) ->
#   ( list[ idx ] = BYTEWISE.decode value ) for value, idx in list
#   return list

# #-----------------------------------------------------------------------------------------------------------
# @_sort_list = ( list ) ->
#   @_encode_list list
#   list.sort Buffer.compare
#   @_decode_list list
#   return list

#-----------------------------------------------------------------------------------------------------------
@_feed_test_data = ( db, probes_idx, handler ) ->
  switch probes_idx
    #-------------------------------------------------------------------------------------------------------
    when 0, 2
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
@_feed_test_data.probes.push [
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
    ### TAINT awaiting better solution ###
    NULL = HOLLERITH._encode_value db, 1
    for idx in [ 0 ... 10 ]
      db[ '%self' ].put ( HOLLERITH._encode_key db, [ 'x', idx, 'x', ] ), NULL
    #.......................................................................................................
    probe_idx = 4
    count     = 0
    query     = HOLLERITH._query_from_prefix db, [ 'x', probe_idx, ]
    input     = db[ '%self' ].createReadStream query
    input
      .pipe $ ( { key, value, }, send ) =>
        count += 1
        T.eq ( HOLLERITH._decode_key db, key )[ 1 ], probe_idx
      .pipe D.$on_end =>
        T.eq count, 1
        done()

#-----------------------------------------------------------------------------------------------------------
@[ "read keys without error (2)" ] = ( T, done ) ->
  step ( resume ) =>
    yield HOLLERITH.clear db, resume
    ### TAINT awaiting better solution ###
    NULL = HOLLERITH._encode_value db, 1
    for idx in [ 0 ... 10 ]
      db[ '%self' ].put ( HOLLERITH._encode_key db, [ 'x', idx, 'x', ] ), NULL
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
    ### TAINT awaiting better solution ###
    NULL = HOLLERITH._encode_value db, 1
    for idx in [ 0 ... 10 ]
      db[ '%self' ].put ( HOLLERITH._encode_key db, [ 'x', idx, 'x', ] ), NULL
    #.......................................................................................................
    probe_idx = 3
    count     = 0
    delta     = 2
    lo        = [ 'x', probe_idx, ]
    hi        = [ 'x', probe_idx + delta, ]
    query     = { gte: ( HOLLERITH._encode_key db, lo ), lte: ( HOLLERITH._query_from_prefix db, hi )[ 'lte' ], }
    input     = db[ '%self' ].createReadStream query
    input
      .pipe $ ( { key, value, }, send ) =>
        count += 1
        T.eq ( HOLLERITH._decode_key db, key )[ 1 ], probe_idx + count - 1
      .pipe D.$on_end =>
        T.eq count, delta + 1
        done()

#-----------------------------------------------------------------------------------------------------------
@[ "read keys without error (4)" ] = ( T, done ) ->
  step ( resume ) =>
    yield HOLLERITH.clear db, resume
    for idx in [ 0 ... 10 ]
      db[ '%self' ].put ( HOLLERITH._encode_key db, [ 'x', idx, 'x', ] ), HOLLERITH._encode_value db, 1
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
    ]
  #.........................................................................................................
  step ( resume ) =>
    yield @_feed_test_data db, probes_idx, resume
    prefix  = [ 'spo', '𧷟', ]
    input   = HOLLERITH.create_phrasestream db, prefix
    input
      .pipe $ ( phrase, send ) =>
        debug '©DsAfY', rpr phrase
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
      CODEC[ 'sentinels' ][ 'firstdate' ]
      new Date 0
      new Date 8e11
      new Date()
      CODEC[ 'sentinels' ][ 'lastdate'  ]
      1234
      Infinity
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
      debug '©oMXJZ', probe
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
@[ "sort lists of mixed values with H2 codec" ] = ( T, done ) ->
  step ( resume ) =>
    settings =
      db:           leveldown
      keyEncoding:  'binary'
    leveldb = levelup '/tmp/hollerith2-test', settings
    yield clear_leveldb leveldb, resume
    probes = [
      [ "",             '',             ]
      [ "1234",          1234,           ]
      [ "Infinity",      Infinity,       ]
      [ "String.fromCodePoint 0x10ffff", String.fromCodePoint 0x10ffff ]
      [ "false",         false,          ]
      [ "new Date 0",    new Date 0,     ]
      [ "new Date 8e11", new Date 8e11,  ]
      [ "new Date()",    new Date(),     ]
      [ "null",          null,           ]
      [ "true",          true,           ]
      [ "一",            '一',            ]
      [ "三",            '三',            ]
      [ "二",            '二',            ]
      [ "𠀀",            '𠀀',            ]
      [ "𠀀\x00",        '𠀀\x00',        ]
      ]
    matchers = ( probe for probe in probes )
    CND.shuffle probes
    for probe in probes
      debug '©oMXJZ', probe
      probe_bfr = CODEC.encode probe
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
@[ "sort routes with values (1)" ] = ( T, done ) ->
  step ( resume ) =>
    settings =
      db:           leveldown
      keyEncoding:  'binary'
    leveldb = levelup '/tmp/hollerith2-test', settings
    yield clear_leveldb leveldb, resume
    probes = [
      [ 'pos', 'strokeorder', '352513553254',          '𤿯', ]
      [ 'pos', 'strokeorder', '3525141121',            '𠴦', ]
      [ 'pos', 'strokeorder', '35251454',              '𨒡', ]
      [ 'pos', 'strokeorder', '3525152',               '邭', ]
      [ 'pos', 'strokeorder', '352515251115115113541', '𪚫', ]
      [ 'pos', 'strokeorder', '35251525112511511',     '𪚧', ]
      [ 'pos', 'strokeorder', '352515251214251214',    '𧑴', ]
      [ 'pos', 'strokeorder', '3525153',               '劬', ]
      [ 'pos', 'strokeorder', '3525153\x00',               '劬', ]
      [ 'pos', 'strokeorder\x00', '352513553254',          '𤿯', ]
      ]
    matchers = ( probe for probe in probes )
    CND.shuffle probes
    for probe in probes
      probe_bfr = CODEC.encode probe
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
@[ "sort routes with values (2)" ] = ( T, done ) ->
  step ( resume ) =>
    settings =
      db:           leveldown
      keyEncoding:  'binary'
    leveldb = levelup '/tmp/hollerith2-test', settings
    yield clear_leveldb leveldb, resume
    probes = [
      [ 'a',      null, ]
      [ 'a',      false, ]
      [ 'a',      true, ]
      [ 'a',      new Date(), ]
      [ 'a',      -Infinity, ]
      [ 'a',      +1234, ]
      [ 'a',      +Infinity, ]
      [ 'a',      'b', ]
      [ 'a',      'b\x00', ]
      [ 'a\x00',  +1234, ]
      [ 'a\x00',  'b', ]
      [ 'aa',     +1234, ]
      [ 'aa',     'b', ]
      [ 'aa',     'b\x00', ]
      ]
    matchers = ( probe for probe in probes )
    CND.shuffle probes
    for probe in probes
      probe_bfr = CODEC.encode probe
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
@[ "read sample data (1)" ] = ( T, done ) ->
  probes_idx  = 2
  idx = -1
  step ( resume ) =>
    yield @_feed_test_data db, probes_idx, resume
    input = db[ '%self' ].createReadStream()
    input
      # .pipe D.$show()
      .pipe $ ( { key, value, }, send ) => send [ key, value, ]
      .pipe $ ( [ key, value, ], send ) =>
        debug '©RluhF', ( HOLLERITH.CODEC.decode key ), ( JSON.parse value )
        send [ key, value, ]
      .pipe D.$collect()
      .pipe $ ( facets, send ) =>
        # debug '©FtmB4', facets
        help '\n' + HOLLERITH.DUMP.rpr_of_facets db, facets
      .pipe D.$on_end => done()
  #.........................................................................................................
  return null


#-----------------------------------------------------------------------------------------------------------
@[ "read and write keys with lists" ] = ( T, done ) ->
  probes_idx  = 0
  idx         = -1
  count       = 0
  probes      = [
    [ 'a', 1, ]
    [ 'a', [], ]
    [ 'a', [ 1, ], ]
    [ 'a', [ true, ], ]
    [ 'a', [ 'x', 'y', 'b', ], ]
    [ 'a', [ 120, 1 / 3, ], ]
    [ 'a', [ 'x', ], ]
    ]
  matchers    = ( probe for probe in probes )
  #.........................................................................................................
  for probe, probe_idx in probes
    buffer = HOLLERITH.CODEC.encode probe
    result = HOLLERITH.CODEC.decode buffer
    T.eq result, matchers[ probe_idx ]
  #.........................................................................................................
  done()

#-----------------------------------------------------------------------------------------------------------
@[ "read partial POS phrases" ] = ( T, done ) ->
  probes_idx  = 0
  idx         = -1
  count       = 0
  #.........................................................................................................
  matchers = [
    [ '𧷟1', 'guide/lineup/length', 1 ]
    [ '𧷟2', 'guide/lineup/length', 2 ]
    [ '𧷟3', 'guide/lineup/length', 3 ]
    [ '𧷟4', 'guide/lineup/length', 4 ]
    [ '𧷟', 'guide/lineup/length', 5 ]
    [ '𧷟6', 'guide/lineup/length', 6 ]
    [ '𧷟', 'guide/uchr/has', '八', 0 ]
    [ '𧷟', 'guide/uchr/has', '刀', 1 ]
    [ '𧷟', 'guide/uchr/has', '宀', 2 ]
    [ '𧷟', 'guide/uchr/has', '貝', 4 ]
    [ '𧷟', 'guide/uchr/has', '', 3 ]
    ]
  #.........................................................................................................
  step ( resume ) =>
    yield @_feed_test_data db, probes_idx, resume
    prefix    = [ 'pos', 'guide', ]
    input     = HOLLERITH.create_phrasestream db, prefix, '*'
    debug '©FphJK', input[ '%meta' ]
    settings  = { indexed: no, }
    input
      .pipe $ ( phrase, send ) =>
        count  += +1
        idx    += +1
        debug '©Sc5FG', phrase
        # T.eq phrase, matchers[ idx ]
      .pipe D.$on_end =>
        T.eq count, matchers.length
        done()


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

#-----------------------------------------------------------------------------------------------------------
get_new_db_name = ->
  get_new_db_name.idx += +1
  return "/tmp/hollerith2-testdb-#{get_new_db_name.idx}"
get_new_db_name.idx = 0

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

#-----------------------------------------------------------------------------------------------------------
@_main = ( handler ) ->
  db = HOLLERITH.new_db join __dirname, '..', 'dbs/tests'
  test @, 'timeout': 2500

############################################################################################################
unless module.parent?
  @_main()

  # debug '©P9AOR', ( HOLLERITH.CODEC[ 'typemarkers'  ][ 'null'       ] ).toString 16
  # debug '©xxmIp', ( HOLLERITH.CODEC[ 'typemarkers'  ][ 'false'      ] ).toString 16
  # debug '©ZeY26', ( HOLLERITH.CODEC[ 'typemarkers'  ][ 'true'       ] ).toString 16
  # debug '©WgER9', ( HOLLERITH.CODEC[ 'typemarkers'  ][ 'date'       ] ).toString 16
  # debug '©UmpjJ', ( HOLLERITH.CODEC[ 'typemarkers'  ][ 'ninfinity'  ] ).toString 16
  # debug '©Url0K', ( HOLLERITH.CODEC[ 'typemarkers'  ][ 'nnumber'    ] ).toString 16
  # debug '©nFIIi', ( HOLLERITH.CODEC[ 'typemarkers'  ][ 'pnumber'    ] ).toString 16
  # debug '©LZ58R', ( HOLLERITH.CODEC[ 'typemarkers'  ][ 'pinfinity'  ] ).toString 16
  # debug '©MYxda', ( HOLLERITH.CODEC[ 'typemarkers'  ][ 'text'       ] ).toString 16










