


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
memdown                   = require 'memdown'
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
read_all_keys = ( db, handler ) ->
  Z = []
  input = db.createKeyStream()
  input.on 'end', -> handler null, Z
  input
    .pipe $ ( data, send ) => Z.push data

#-----------------------------------------------------------------------------------------------------------
@[ "sort using memdown" ] = ( T, done ) ->
  step ( resume ) =>
    settings =
      db:           memdown
      keyEncoding:  'binary'
    db = levelup '/route-discarded', settings
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
      yield db.put probe_bfr, '1', resume
    probes = yield read_all_keys db, resume
    for probe, probe_idx in probes
      T.eq probe, matchers[ probe_idx ]
    done()

#-----------------------------------------------------------------------------------------------------------
@[ "H2 codec `encode` throws on anything but a list" ] = ( T, done ) ->
  T.throws "expected a list, got a text",         ( -> CODEC.encode 'unaccaptable' )
  T.throws "expected a list, got a number",       ( -> CODEC.encode 42 )
  T.throws "expected a list, got a boolean",      ( -> CODEC.encode true )
  T.throws "expected a list, got a boolean",      ( -> CODEC.encode false )
  T.throws "expected a list, got a jsundefined",  ( -> CODEC.encode() )
  done()

#-----------------------------------------------------------------------------------------------------------
@[ "sort with H2 codec" ] = ( T, done ) ->
  step ( resume ) =>
    settings =
      db:           memdown
      keyEncoding:  'binary'
    db = levelup '/route-discarded', settings
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
    # CND.shuffle probes
    for probe in probes
      debug '©nJGS2', probe_bfr = CODEC.encode [ probe, ]
    #   yield db.put probe_bfr, '1', resume
    # probes = yield read_all_keys db, resume
    # for probe, probe_idx in probes
    #   T.eq probe, matchers[ probe_idx ]
    T.eq 1, 0
    T.eq 1, 0
    T.eq 1, 0
    T.eq 1, 0
    T.eq 1, 0
    T.eq 1, 0
    T.eq 1, 0
    T.eq 1, 0
    T.eq 1, 0
    T.eq 1, 0
    T.eq 1, 0
    T.eq 1, 0
    T.eq 1, 0
    T.eq 1, 0
    done()


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

