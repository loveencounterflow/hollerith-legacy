


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
### TAINT experimentally using `later` in place of `setImmediate` ###
later                     = suspend.immediately
#...........................................................................................................
test                      = require 'guy-test'
#...........................................................................................................
D                         = require 'pipedreams'
$                         = D.remit.bind D
$async                    = D.remit_async.bind D
#...........................................................................................................
HOLLERITH                 = require './main'
db                        = null
#...........................................................................................................
levelup                   = require 'level'
leveldown                 = require 'leveldown'
CODEC                     = require 'hollerith-codec'
ASYNC                     = require 'async'
#...........................................................................................................
ƒ                         = CND.format_number


# #-----------------------------------------------------------------------------------------------------------
# @_sort_list = ( list ) ->
#   @_encode_list list
#   list.sort Buffer.compare
#   @_decode_list list
#   return list


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
show_db_entries = ( handler ) ->
  input = db[ '%self' ].createReadStream()
  input
    .pipe D.$show()
    .pipe $ ( { key, value, }, send ) => send [ key, value, ]
    .pipe $ ( [ key, value, ], send ) => send [ key, value, ] unless HOLLERITH._is_meta db, key
    .pipe $ ( [ key, value, ], send ) =>
      # debug '©RluhF', ( HOLLERITH.CODEC.decode key ), ( JSON.parse value )
      send [ key, value, ]
    .pipe D.$collect()
    .pipe $ ( facets, send ) =>
      help '\n' + HOLLERITH.DUMP.rpr_of_facets db, facets
      # buffer = new Buffer JSON.stringify [ '开', '彡' ]
      # debug '©GJfL6', HOLLERITH.CODEC.rpr_of_buffer null, buffer
    .pipe D.$on_end => handler()

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
    whisper "closed LevelDB"
    yield leveldown.destroy route, resume
    whisper "destroyed LevelDB"
    yield leveldb.open resume
    whisper "re-opened LevelDB"
    # help "erased and re-opened LevelDB at #{route}"
    handler null

#-----------------------------------------------------------------------------------------------------------
@_main = ( handler ) ->
  db_route    = join __dirname, '..', 'dbs/tests'
  db_settings = size: 500
  db = HOLLERITH.new_db db_route, db_settings
  test @, 'timeout': 2500

#-----------------------------------------------------------------------------------------------------------
@_feed_test_data = ( db, probes_idx, settings, handler ) ->
  switch arity = arguments.length
    when 3
      handler   = settings
      settings  = null
    when 4
      null
    else
      throw new Error "expected 3 or 4 arguments, got #{arity}"
  #.........................................................................................................
  step ( resume ) =>
    yield HOLLERITH.clear db, resume
    whisper "writing test dataset ##{probes_idx} with settings #{rpr settings}"
    input = D.create_throughstream()
    #.......................................................................................................
    switch probes_idx
      #-----------------------------------------------------------------------------------------------------
      when -1
        # settings =
        input
          .pipe HOLLERITH.$write db, settings
          # .pipe D.$show()
          .pipe D.$on_end ( end ) =>
            whisper "test data written"
            handler null
            end()
        #...................................................................................................
        for n in [ 0 .. 1000 ]
          key = [ "number:#{n}", "square", n ** 2, ]
          input.write key
          yield later resume
        input.end()
      #-----------------------------------------------------------------------------------------------------
      when 0, 2, 3, 4, 5
        input
          .pipe HOLLERITH.$write db, settings
          # .pipe D.$show()
          .pipe D.$on_end ( end ) =>
            whisper "test data written"
            handler null
            end()
        #...................................................................................................
        for probe in @_feed_test_data.probes[ probes_idx ]
          # key = HOLLERITH.new_so_key db, probe...
          # debug '©WV0j2', probe
          input.write probe
          yield later resume
        input.end()
      #-----------------------------------------------------------------------------------------------------
      when 1
        input
          .pipe HOLLERITH.$write db, settings
          # .pipe D.$show()
          .pipe D.$on_end ( end ) =>
            whisper "test data written"
            end()
            handler null
        #...................................................................................................
        for url_key in @_feed_test_data.probes[ probes_idx ]
          key = HOLLERITH.key_from_url db, url_key
          input.write key
          yield later resume
        input.end()
      #-------------------------------------------------------------------------------------------------------
      else return handler new Error "illegal probes index #{rpr probes_idx}"
  #.........................................................................................................
  return null

#-----------------------------------------------------------------------------------------------------------
@_feed_test_data.probes = []

#...........................................................................................................
### probes_idx == 0 ###
@_feed_test_data.probes.push [
  [ '𧷟1', 'guide/lineup/length',              1,                                   ]
  [ '𧷟2', 'guide/lineup/length',              2,                                   ]
  [ '𧷟3', 'guide/lineup/length',              3,                                   ]
  [ '𧷟4', 'guide/lineup/length',              4,                                   ]
  [ '𧷟', 'guide/lineup/length',               5,                                   ]
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
### probes_idx == 1 ###
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
### probes_idx == 2 ###
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
### probes_idx == 3 ###
@_feed_test_data.probes.push [
  [ '丁', 'isa',                         [ 'glyph', 'guide', ]       ]
  [ '三', 'isa',                         [ 'glyph', 'guide', ]       ]
  [ '夫', 'isa',                         [ 'glyph', 'guide', ]       ]
  [ '國', 'isa',                         [ 'glyph', ]                ]
  [ '形', 'isa',                         [ 'glyph', ]                ]
  [ 'glyph:丁', 'strokeorder/count',     2,                          ]
  [ 'glyph:三', 'strokeorder/count',     3,                          ]
  [ 'glyph:夫', 'strokeorder/count',     5,                          ]
  [ 'glyph:國', 'strokeorder/count',     11,                         ]
  [ 'glyph:形', 'strokeorder/count',     7,                          ]
  [ 'glyph:丁', 'guide/count',           1,                          ]
  [ 'glyph:三', 'guide/count',           1,                          ]
  [ 'glyph:夫', 'guide/count',           1,                          ]
  [ 'glyph:國', 'guide/count',           4,                          ]
  [ 'glyph:形', 'guide/count',           2,                          ]
  [ 'glyph:丁', 'guide/lineup',          [ '丁', ],                  ]
  [ 'glyph:三', 'guide/lineup',          [ '三', ],                  ]
  [ 'glyph:夫', 'guide/lineup',          [ '夫', ],                  ]
  [ 'glyph:國', 'guide/lineup',          [ '囗', '戈', '口', '一', ], ]
  [ 'glyph:形', 'guide/lineup',          [ '开', '彡', ],             ]
  ]

#...........................................................................................................
### probes_idx == 4 ###
@_feed_test_data.probes.push [
  [ '𧷟1', 'guide/lineup/length',              1,                                   ]
  [ '𧷟2', 'guide/lineup/length',              2,                                   ]
  [ '𧷟3', 'guide/lineup/length',              3,                                   ]
  [ '𧷟4', 'guide/lineup/length',              4,                                   ]
  [ '𧷟', 'guide/lineup/length',               5,                                   ]
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
  [ '𧷟1', 'a', 42 ]
  [ '𧷟1', 'ab', 42 ]
  [ '𧷟1', 'guide', 'xxx' ]
  [ '𧷟1', 'guide/', 'yyy' ]
  [ '𧷟1', 'z', 42 ]
  ]

#-----------------------------------------------------------------------------------------------------------
### probes_idx == 5 ###
@_feed_test_data.probes.push [
  [ '丁', 'strokecount',     2,                          ]
  # [ '三', 'strokecount',     3,                          ]
  # [ '夫', 'strokecount',     5,                          ]
  # [ '國', 'strokecount',     11,                         ]
  # [ '形', 'strokecount',     7,                          ]
  [ '丁', 'componentcount',  1,                          ]
  # [ '三', 'componentcount',  1,                          ]
  # [ '夫', 'componentcount',  1,                          ]
  # [ '國', 'componentcount',  4,                          ]
  # [ '形', 'componentcount',  2,                          ]
  [ '丁', 'components',      [ '丁', ],                  ]
  # [ '三', 'components',      [ '三', ],                  ]
  # [ '夫', 'components',      [ '夫', ],                  ]
  # [ '國', 'components',      [ '囗', '戈', '口', '一', ], ]
  # [ '形', 'components',      [ '开', '彡', ],             ]
  # [ { type: 'route', value: '/foo/bar', }, 'mtime', new Date '2011-10-10T14:48:00Z', ]
  [ { type: 'route', value: '/foo/bar', }, 'mtime', 123456789, ]
  ]

# pos|guide/kwic/sortcode

# # [
# # "1027~~~~,00","0156~~~~,01,0509~~~~,02,0000~~~~,03,--------,04,--------,05,--------,06,--------,07,--------,08,--------,09,--------,10,--------,11,--------,12,"
# # "0156~~~~,01","0509~~~~,02,0000~~~~,03,--------,04,--------,05,--------,06,--------,07,--------,08,--------,09,--------,10,--------,11,--------,12,1027~~~~,00,"
# # "0509~~~~,02","0000~~~~,03,--------,04,--------,05,--------,06,--------,07,--------,08,--------,09,--------,10,--------,11,--------,12,1027~~~~,00,0156~~~~,01,"
# # "0000~~~~,03","--------,04,--------,05,--------,06,--------,07,--------,08,--------,09,--------,10,--------,11,--------,12,1027~~~~,00,0156~~~~,01,0509~~~~,02,"
# # ]

# 0087~~~~,00,0291~~~~,01,0555~~~~,02,--------,03,--------,04,--------,05,--------,06,--------,07,--------,08,--------,09,--------,10,--------,11,--------,12,|𦖈|0
# 0087~~~~,00,0291~~~~,01,0823x2h-,02,--------,03,--------,04,--------,05,--------,06,--------,07,--------,08,--------,09,--------,10,--------,11,--------,12,|聗|0
# 0087~~~~,00,0291~~~~,01,1023~~~~,02,--------,03,--------,04,--------,05,--------,06,--------,07,--------,08,--------,09,--------,10,--------,11,--------,12,|𤋕|0
# 0087~~~~,00,0294~~~~,01,0060~~~~,02,--------,03,--------,04,--------,05,--------,06,--------,07,--------,08,--------,09,--------,10,--------,11,--------,12,|𦖔|0
# 0087~~~~,00,0294~~~~,01,0555~~~~,02,--------,03,--------,04,--------,05,--------,06,--------,07,--------,08,--------,09,--------,10,--------,11,--------,12,|𦗆|0
# 0087~~~~,00,0295~~~~,01,0802~~~~,02,0958~~~~,03,--------,04,--------,05,--------,06,--------,07,--------,08,--------,09,--------,10,--------,11,--------,12,|𥪻|0
# 0087~~~~,00,0312~~~~,01,--------,02,--------,03,--------,04,--------,05,--------,06,--------,07,--------,08,--------,09,--------,10,--------,11,--------,12,|𦔲|0
# 0087~~~~,00,0314~~~~,01,1173~~~~,02,--------,03,--------,04,--------,05,--------,06,--------,07,--------,08,--------,09,--------,10,--------,11,--------,12,|𦕀|0
# 0087~~~~,00,0319~~~~,01,--------,02,--------,03,--------,04,--------,05,--------,06,--------,07,--------,08,--------,09,--------,10,--------,11,--------,12,|𦕇|0
# 0087~~~~,00,0355~~~~,01,--------,02,--------,03,--------,04,--------,05,--------,06,--------,07,--------,08,--------,09,--------,10,--------,11,--------,12,|𦕆|0
# 0087~~~~,00,0373~~~~,01,0284~~~~,02,--------,03,--------,04,--------,05,--------,06,--------,07,--------,08,--------,09,--------,10,--------,11,--------,12,|𦕧|0

#-----------------------------------------------------------------------------------------------------------
@[ "write without error (1)" ] = ( T, done ) ->
  probes_idx  = 0
  idx = -1
  write_settings =
    batch: 10
  step ( resume ) =>
    yield @_feed_test_data db, probes_idx, write_settings, resume
    done()

#-----------------------------------------------------------------------------------------------------------
@[ "write without error (2)" ] = ( T, done ) ->
  probes_idx  = -1
  idx = -1
  write_settings =
    batch: 10
  step ( resume ) =>
    yield @_feed_test_data db, probes_idx, write_settings, resume
    done()

#-----------------------------------------------------------------------------------------------------------
@[ "read without error" ] = ( T, done ) ->
  probes_idx  = 0
  idx = -1
  step ( resume ) =>
    yield @_feed_test_data db, probes_idx, resume
    # done()
    input = HOLLERITH.create_facetstream db
    input
      # .pipe HOLLERITH.$url_from_key db
      .pipe $ ( [ key, value, ], send ) =>
        idx += +1
        # T.eq key, matchers[ idx ]
      .pipe D.$on_end ( end ) => end; done()

#-----------------------------------------------------------------------------------------------------------
@[ "read keys without error (1)" ] = ( T, done ) ->
  step ( resume ) =>
    yield HOLLERITH.clear db, resume
    ### TAINT awaiting better solution ###
    NULL = HOLLERITH._encode_value db, 1
    for idx in [ 0 ... 10 ]
      key_bfr = HOLLERITH._encode_key db, [ 'x', idx, 'x', ]
      db[ '%self' ].put key_bfr, NULL
    #.......................................................................................................
    probe_idx = 4
    count     = 0
    query     = HOLLERITH._query_from_prefix db, [ 'x', probe_idx, ]
    # debug '©ETONp', HOLLERITH.CODEC.rpr_of_buffer key_bfr
    input     = db[ '%self' ].createReadStream query
    input
      .pipe $ ( { key, value, }, send ) =>
        count += 1
        T.eq ( HOLLERITH._decode_key db, key )[ 1 ], probe_idx
      .pipe D.$on_end ( end ) =>
        T.eq count, 1
        end()
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
    input     = HOLLERITH.create_facetstream db, { prefix, }
    input
      .pipe $ ( facet, send ) =>
        count += 1
        [ key, value, ] = facet
        T.eq key[ 1 ], probe_idx
      .pipe D.$on_end ( end ) =>
        T.eq count, 1
        end()
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
      .pipe D.$on_end ( end ) =>
        T.eq count, delta + 1
        end()
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
    input     = HOLLERITH.create_facetstream db, { lo, hi, }
    input
      .pipe $ ( [ key, value, ], send ) =>
        count += 1
        T.eq key[ 1 ], probe_idx + count - 1
      .pipe D.$on_end ( end ) =>
        T.eq count, delta + 1
        end()
        done()

#-----------------------------------------------------------------------------------------------------------
@[ "read POS facets" ] = ( T, done ) ->
  probes_idx  = 0
  idx         = -1
  #.........................................................................................................
  key_matchers = [
    [ 'pos', 'guide/lineup/length', 2, '𧷟2', ]
    [ 'pos', 'guide/lineup/length', 3, '𧷟3', ]
    [ 'pos', 'guide/lineup/length', 4, '𧷟4', ]
    ]
  #.........................................................................................................
  step ( resume ) =>
    yield @_feed_test_data db, probes_idx, resume
    lo = [ 'pos', 'guide/lineup/length', 2, ]
    hi = [ 'pos', 'guide/lineup/length', 4, ]
    # input   = HOLLERITH.create_keystream db, lo
    input   = HOLLERITH.create_facetstream db, { lo, hi, }
    input
      # .pipe HOLLERITH.$url_from_key db
      .pipe $ ( [ key, value, ], send ) =>
        idx += +1
        phrase = HOLLERITH.as_phrase db, key, value
        T.eq key, key_matchers[ idx ]
      .pipe D.$on_end ( end ) => end(); done()

#-----------------------------------------------------------------------------------------------------------
@[ "read POS phrases (1)" ] = ( T, done ) ->
  probes_idx  = 0
  idx         = -1
  #.........................................................................................................
  matchers = [
    [ 'pos', 'guide/lineup/length', 2, '𧷟2', ]
    [ 'pos', 'guide/lineup/length', 3, '𧷟3', ]
    [ 'pos', 'guide/lineup/length', 4, '𧷟4', ]
    ]
  #.........................................................................................................
  step ( resume ) =>
    yield @_feed_test_data db, probes_idx, resume
    lo = [ 'pos', 'guide/lineup/length', 2, ]
    hi = [ 'pos', 'guide/lineup/length', 4, ]
    input   = HOLLERITH.create_phrasestream db, { lo, hi, }
    input
      .pipe $ ( phrase, send ) =>
        idx += +1
        T.eq phrase, matchers[ idx ]
      .pipe D.$on_end ( end ) => end(); done()

#-----------------------------------------------------------------------------------------------------------
@[ "read POS phrases (2)" ] = ( T, done ) ->
  probes_idx  = 0
  idx         = -1
  count       = 0
  #.........................................................................................................
  matchers = [
    [ 'pos', 'guide/uchr/has', '八', '𧷟', 0, ]
    [ 'pos', 'guide/uchr/has', '刀', '𧷟', 1, ]
    [ 'pos', 'guide/uchr/has', '宀', '𧷟', 2, ]
    [ 'pos', 'guide/uchr/has', '貝', '𧷟', 4, ]
    [ 'pos', 'guide/uchr/has', '', '𧷟', 3, ]
    ]
  #.........................................................................................................
  step ( resume ) =>
    yield @_feed_test_data db, probes_idx, resume
    prefix    = [ 'pos', 'guide/uchr/has', ]
    input     = HOLLERITH.create_phrasestream db, { prefix, }
    settings  = { indexed: no, }
    input
      .pipe $ ( phrase, send ) =>
        debug '©DsAfY', rpr phrase
        count  += +1
        idx    += +1
        T.eq phrase, matchers[ idx ]
      .pipe D.$on_end ( end ) =>
        T.eq count, matchers.length
        end()
        done()

#-----------------------------------------------------------------------------------------------------------
@[ "read SPO phrases" ] = ( T, done ) ->
  debug '©Rsoxb', db[ '%self' ].isOpen()
  probes_idx  = 0
  idx         = -1
  count       = 0
  #.........................................................................................................
  matchers = [
    [ 'spo', '𧷟', 'cp/cid', 163295 ]
    [ 'spo', '𧷟', 'guide/lineup/length', 5 ]
    [ 'spo', '𧷟', 'guide/uchr/has', [ '八', '刀', '宀', '', '貝' ] ]
    [ 'spo', '𧷟', 'rank/cjt', 5432 ]
    ]
  #.........................................................................................................
  step ( resume ) =>
    yield @_feed_test_data db, probes_idx, resume
    prefix  = [ 'spo', '𧷟', ]
    input   = HOLLERITH.create_phrasestream db, { prefix, }
    input
      .pipe $ ( phrase, send ) =>
        debug '©DsAfY', rpr phrase
        count  += +1
        idx    += +1
        T.eq phrase, matchers[ idx ]
      .pipe D.$on_end ( end ) =>
        T.eq count, matchers.length
        end()
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
  T.throws "expected a list, got a text",               ( -> CODEC.encode 'unaccaptable' )
  T.throws "expected a list, got a number",             ( -> CODEC.encode 42 )
  T.throws "expected a list, got a boolean",            ( -> CODEC.encode true )
  T.throws "expected a list, got a boolean",            ( -> CODEC.encode false )
  T.throws /^expected a list, got a (?:js)?undefined$/, ( -> CODEC.encode() )
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
@[ "ensure `Buffer.compare` gives same sorting as LevelDB" ] = ( T, done ) ->
  step ( resume ) =>
    settings =
      db:           leveldown
      keyEncoding:  'binary'
    leveldb = levelup '/tmp/hollerith2-test', settings
    yield clear_leveldb leveldb, resume
    probes = [
      # { x: 1234.5678 }
      [ "",             '',              ]
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
    CND.shuffle probes
    for probe in probes
      probe_bfr = CODEC.encode probe
      yield leveldb.put probe_bfr, '1', resume
    probe_bfrs  = yield read_all_keys leveldb, resume
    last_probe_bfr = null
    for probe_bfr in probe_bfrs
      if last_probe_bfr?
        T.eq ( Buffer.compare last_probe_bfr, probe_bfr ), -1
      last_probe_bfr = probe_bfr
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
@[ "read sample data" ] = ( T, done ) ->
  probes_idx  = 2
  idx = -1
  step ( resume ) =>
    debug '©bUJhI', 'XX'
    yield @_feed_test_data db, probes_idx, resume
    debug '©PRzA5', 'XX'
    input = db[ '%self' ].createReadStream()
    input
      .pipe D.$show()
      .pipe $ ( { key, value, }, send ) => send [ key, value, ]
      .pipe $ ( [ key, value, ], send ) => send [ key, value, ] unless HOLLERITH._is_meta db, key
      .pipe $ ( [ key, value, ], send ) =>
        # debug '©RluhF', ( HOLLERITH.CODEC.decode key ), ( JSON.parse value )
        send [ key, value, ]
      .pipe D.$collect()
      .pipe $ ( facets, send ) =>
        # debug '©54IKt', facets
        help '\n' + HOLLERITH.DUMP.rpr_of_facets db, facets
        buffer = new Buffer JSON.stringify [ '开', '彡' ]
        debug '©GJfL6', HOLLERITH.CODEC.rpr_of_buffer buffer
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
@[ "encode keys with list elements" ] = ( T, done ) ->
  probes = [
    [ 'foo', 'bar', ]
    [ 'foo', [ 'bar', ], ]
    [ [], 'bar', ]
    [ 'foo', [], ]
    [ [ 'foo', ], 'bar', ]
    [ [ 42, ], 'bar', ]
    [ 'foo', [ 42, ] ]
    ]
  for probe in probes
    T.eq probe, HOLLERITH.CODEC.decode HOLLERITH.CODEC.encode probe
  done()

#-----------------------------------------------------------------------------------------------------------
@[ "read and write phrases with unanalyzed lists" ] = ( T, done ) ->
  # ### !!!!!!!!!!!!!!!!!!!!!! ###
  # warn "skipped"
  # return done()
  # ### !!!!!!!!!!!!!!!!!!!!!! ###
  idx         = -1
  count       = 0
  #.........................................................................................................
  probes = [
    [ 'probe#00', 'some-predicate', [], ]
    [ 'probe#01', 'some-predicate', [ -1 ], ]
    [ 'probe#02', 'some-predicate', [  0 ], ]
    [ 'probe#03', 'some-predicate', [  1 ], ]
    [ 'probe#04', 'some-predicate', [  2 ], ]
    [ 'probe#05', 'some-predicate', [  2, -1, ], ]
    [ 'probe#06', 'some-predicate', [  2, 0, ], ]
    [ 'probe#07', 'some-predicate', [  2, 1, ], ]
    [ 'probe#08', 'some-predicate', [  2, 1, 0 ], ]
    [ 'probe#09', 'some-predicate', [  2, 2, ], ]
    [ 'probe#10', 'some-predicate', [  2, [ 2, ], ], ]
    [ 'probe#11', 'some-predicate', [  3 ], ]
    ]
  #.........................................................................................................
  write_probes = ( handler ) =>
    step ( resume ) =>
      yield HOLLERITH.clear db, resume
      input = D.create_throughstream()
      input
        # .pipe ( [ sbj, prd, obj, ], send ) =>
        #   if prd is 'some-predicate' # always the case in this example
        #     obj
        .pipe HOLLERITH.$write db, solids: [ 'some-predicate', ]
        .pipe D.$on_end =>
          urge "test data written"
          handler()
      #.....................................................................................................
      input.write probe for probe in probes
      input.end()
  #.........................................................................................................
  step ( resume ) =>
    #.......................................................................................................
    yield write_probes resume
    input = HOLLERITH.create_phrasestream db
    debug '©FphJK', input[ '%meta' ]
    input
      .pipe $ ( phrase, send ) =>
        count  += +1
        idx    += +1
        # debug '©Sc5FG', phrase
        # T.eq phrase, matchers[ idx ]
      .pipe D.$on_end =>
        # T.eq count, matchers.length
        done()

#-----------------------------------------------------------------------------------------------------------
@[ "read partial POS phrases" ] = ( T, done ) ->
  # ### !!!!!!!!!!!!!!!!!!!!!! ###
  # warn "skipped"
  # return done()
  # ### !!!!!!!!!!!!!!!!!!!!!! ###
  probes_idx  = 4
  idx         = -1
  count       = 0
  #.........................................................................................................
  matchers = [
    [ 'pos', 'guide', 'xxx', '𧷟1' ]
    [ 'pos', 'guide/', 'yyy', '𧷟1' ]
    [ 'pos', 'guide/lineup/length', 1, '𧷟1', ]
    [ 'pos', 'guide/lineup/length', 2, '𧷟2', ]
    [ 'pos', 'guide/lineup/length', 3, '𧷟3', ]
    [ 'pos', 'guide/lineup/length', 4, '𧷟4', ]
    [ 'pos', 'guide/lineup/length', 5, '𧷟', ]
    [ 'pos', 'guide/lineup/length', 6, '𧷟6', ]
    [ 'pos', 'guide/uchr/has', '八', '𧷟', 0 ]
    [ 'pos', 'guide/uchr/has', '刀', '𧷟', 1 ]
    [ 'pos', 'guide/uchr/has', '宀', '𧷟', 2 ]
    [ 'pos', 'guide/uchr/has', '貝', '𧷟', 4 ]
    [ 'pos', 'guide/uchr/has', '', '𧷟', 3 ]
    ]
  #.........................................................................................................
  step ( resume ) =>
    yield @_feed_test_data db, probes_idx, resume
    # prefix    = [ 'pos', 'guide', ]
    prefix    = [ 'pos', 'guide', ]
    input     = HOLLERITH.create_phrasestream db, { prefix, star: '*', }
    # input     = HOLLERITH.create_phrasestream db, { prefix, }
    debug '©FphJK', input[ '%meta' ]
    settings  = { indexed: no, }
    input
      .pipe $ ( phrase, send ) =>
        count  += +1
        idx    += +1
        debug '©Sc5FG', phrase
        T.eq phrase, matchers[ idx ]
      .pipe D.$on_end =>
        T.eq count, matchers.length
        done()

#-----------------------------------------------------------------------------------------------------------
@[ "read single phrases (1)" ] = ( T, done ) ->
  probes_idx  = 4
  matcher = [ 'spo', '𧷟', 'guide/lineup/length', 5 ]
  #.........................................................................................................
  step ( resume ) =>
    yield @_feed_test_data db, probes_idx, resume
    # prefix    = [ 'pos', 'guide', ]
    prefix    = [ 'spo', '𧷟', 'guide/lineup/length', ]
    query     = { prefix, star: '*', }
    input     = HOLLERITH.read_one_phrase db, query, ( error, phrase ) ->
      throw error if error?
      debug '©61ENl', phrase
      T.eq phrase, matcher
      done()

#-----------------------------------------------------------------------------------------------------------
@[ "read single phrases (2)" ] = ( T, done ) ->
  probes_idx  = 4
  matcher = [ 'spo', '𧷟', 'guide/lineup/length', 5 ]
  #.........................................................................................................
  step ( resume ) =>
    yield @_feed_test_data db, probes_idx, resume
    prefix    = [ 'spo', '𧷟', 'guide/lineup/length', ]
    query     = { prefix, star: '*', fallback: 'not to be used', }
    input     = HOLLERITH.read_one_phrase db, query, ( error, phrase ) ->
      throw error if error?
      debug '©61ENl', phrase
      T.eq phrase, matcher
      done()

#-----------------------------------------------------------------------------------------------------------
@[ "read single phrases (3)" ] = ( T, done ) ->
  probes_idx  = 4
  matcher = "expected 1 phrase, got 0"
  #.........................................................................................................
  step ( resume ) =>
    yield @_feed_test_data db, probes_idx, resume
    prefix    = [ 'spo', '中', 'guide/lineup/length', ]
    query     = { prefix, star: '*', }
    input     = HOLLERITH.read_one_phrase db, query, ( error, phrase ) ->
      throw new Error "expected error" unless error?
      T.eq error[ 'message' ], matcher
      done()

#-----------------------------------------------------------------------------------------------------------
@[ "read single phrases (4)" ] = ( T, done ) ->
  probes_idx  = 4
  matcher     = "this entry is missing"
  #.........................................................................................................
  step ( resume ) =>
    yield @_feed_test_data db, probes_idx, resume
    prefix    = [ 'spo', '中', 'guide/lineup/length', ]
    query     = { prefix, star: '*', fallback: matcher, }
    input     = HOLLERITH.read_one_phrase db, query, ( error, phrase ) ->
      throw error if error?
      T.eq phrase, matcher
      done()

#-----------------------------------------------------------------------------------------------------------
@[ "writing phrases with non-unique keys fails" ] = ( T, done ) ->
  alert """test case "writing phrases with non-unique keys fails" to be written"""
  done()


#-----------------------------------------------------------------------------------------------------------
@[ "reminders" ] = ( T, done ) ->
  alert "H.$write() must test for repeated keys"
  done()

#-----------------------------------------------------------------------------------------------------------
@[ "invalid key not accepted (1)" ] = ( T, done ) ->
  domain  = ( require 'domain' ).create()
  domain.on 'error', ( error ) ->
    # debug '©AOSmn', JSON.stringify error[ 'message' ]
    T.eq error[ 'message' ], "invalid SPO key, must be list: 'xxx'"
    later done
  domain.run ->
    input   = D.create_throughstream()
    input
      .pipe HOLLERITH.$write db
      .pipe D.$on_end ->
        # T.fail "should throw error"
        later done
    input.write 'xxx'
    input.end()

#-----------------------------------------------------------------------------------------------------------
@[ "invalid key not accepted (2)" ] = ( T, done ) ->
  domain  = ( require 'domain' ).create()
  domain.on 'error', ( error ) ->
    # debug '©AOSmn', JSON.stringify error[ 'message' ]
    T.eq error[ 'message' ], "invalid SPO key, must be of length 3: [ 'foo' ]"
    done()
  domain.run ->
    input   = D.create_throughstream()
    input.pipe HOLLERITH.$write db
    input.write [ 'foo', ]

#-----------------------------------------------------------------------------------------------------------
@[ "catching errors (2)" ] = ( T, done ) ->
  run = ( method, handler ) ->
    domain  = ( require 'domain' ).create()
    domain.on 'error', ( error ) ->
      handler error
    domain.run ->
      method()
  #.........................................................................................................
  f = ->
    input   = D.create_throughstream()
    input
      .pipe HOLLERITH.$write db
      .pipe D.$on_end ->
        later done
    input.write [ 'foo', 'bar', 'baz', ]
    input.end()
  run f, ( error ) ->
    debug '©WaXJV', JSON.stringify error[ 'message' ]
    T.eq true, false
    done()

#-----------------------------------------------------------------------------------------------------------
@[ "catching errors (1)" ] = ( T, done ) ->
  #.........................................................................................................
  d = D.run ->
    input   = D.create_throughstream()
    input
      .pipe HOLLERITH.$write db
      .pipe D.$on_end ->
        later done
    input.write [ 'foo', 'bar', 'baz', 'gnu', ]
    input.end()
  , ( error ) ->
    T.eq error[ 'message' ], "invalid SPO key, must be of length 3: [ 'foo', 'bar', 'baz', 'gnu' ]"
    later done

#-----------------------------------------------------------------------------------------------------------
@[ "catching errors (2)" ] = ( T, done ) ->
  message = "should not produce error"
  #.........................................................................................................
  d = D.run ->
    input   = D.create_throughstream()
    input
      .pipe HOLLERITH.$write db
      .pipe D.$on_end ->
        T.succeed message
        later done
    input.write [ 'foo', 'bar', 'baz', ]
    input.end()
  , ( error ) ->
    T.fail message
    later done

#-----------------------------------------------------------------------------------------------------------
@[ "building PODs from SPO phrases" ] = ( T, done ) ->
  probes_idx  = 4
  idx         = -1
  count       = 0
  # #.........................................................................................................
  # matchers = [
  #   [ 'spo', '𧷟', 'cp/cid', 163295 ]
  #   [ 'spo', '𧷟', 'guide/lineup/length', 5 ]
  #   [ 'spo', '𧷟', 'guide/uchr/has', [ '八', '刀', '宀', '', '貝' ] ]
  #   [ 'spo', '𧷟', 'rank/cjt', 5432 ]
  #   ]
  #.........................................................................................................
  $shorten_spo = ->
    return $ ( phrase, send ) =>
      unless ( CND.isa_list phrase ) and phrase[ 0 ] is 'spo'
        return send.error new Error "not an SPO phrase: #{rpr phrase}"
      spo = phrase[ 1 .. ]
      ### TAINT repeated validation? ###
      HOLLERITH.validate_spo spo
      send spo
  #.........................................................................................................
  $consolidate = ->
    last_sbj  = null
    pod       = null
    return $ ( spo, send, end ) =>
      if spo?
        ### TAINT repeated validation? ###
        HOLLERITH.validate_spo spo
        [ sbj, prd, obj, ] = spo
        #...................................................................................................
        if sbj is last_sbj
          pod[ prd ] = obj
        #...................................................................................................
        else
          if pod?
            ### TAINT implicit key `pod` ###
            send [ last_sbj, 'pod', pod, ]
          pod         = '%sbj': sbj
          pod[ prd ]  = obj
          last_sbj    = sbj
        #...................................................................................................
        # send spo
      #.....................................................................................................
      if end?
        send [ last_sbj, 'pod', pod, ] if last_sbj?
        end()
  #.........................................................................................................
  step ( resume ) =>
    yield @_feed_test_data db, probes_idx, resume
    prefix  = [ 'spo', ]
    input   = HOLLERITH.create_phrasestream db, { prefix, }
    input
      .pipe $shorten_spo()
      .pipe $consolidate()
      .pipe D.$show()
      .pipe HOLLERITH.$write db
      .pipe D.$on_end done

###
#-----------------------------------------------------------------------------------------------------------
@[ "keep ordering and completeness in asynchronous streams" ] = ( T, T_done ) ->
  step ( resume ) =>
    idx     = 0
    input_A = D.create_throughstream()
    #.......................................................................................................
    input_B = input_A
      .pipe D.$stop_time "keep ordering and completeness in asynchronous streams"
      .pipe $async ( data, done ) ->
        dt = CND.random_number 0.5, 1.5
        # debug '©WscFi', data, dt
        after dt, =>
          warn "send #{rpr data}"
          done data
      .pipe $ ( data, send ) ->
        help "read #{rpr data}"
        T.eq data, idx
        idx += +1
        send data
      .pipe D.$on_end =>
        T_done()
    #.......................................................................................................
    write = ->
      for n in [ 0 .. 10 ]
        # help "write #{n}"
        input_A.write n
        yield after 0.1, resume
      input_A.end()
    #.......................................................................................................
    write()
###

#-----------------------------------------------------------------------------------------------------------
@[ "read phrases in lockstep" ] = ( T, done ) ->
  probes_idx  = 2
  #.........................................................................................................
  step ( resume ) =>
    yield @_feed_test_data db, probes_idx, resume
    input_1     = HOLLERITH.create_phrasestream db, { prefix: [ 'pos', 'strokecount'    ], }
    input_2     = HOLLERITH.create_phrasestream db, { prefix: [ 'pos', 'componentcount' ], }
    input_3     = HOLLERITH.create_phrasestream db, { prefix: [ 'pos', 'components'     ], }
    input_1
      .pipe D.$lockstep input_2, fallback: null
      .pipe D.$lockstep input_3, fallback: null
      .pipe $ ( data, send ) => help JSON.stringify data; send data
      .pipe D.$on_end done

#-----------------------------------------------------------------------------------------------------------
@[ "has_any yields existence of key" ] = ( T, done ) ->
  probes_idx  = 2
  probes_and_matchers = [
    [ [ 'spo', '形', 'strokecount',      ], true, ]
    [ [ 'spo', '丁', 'componentcount',   ], true, ]
    [ [ 'spo', '三', 'componentcount',   ], true, ]
    [ [ 'spo', '夫', 'componentcount',   ], true, ]
    [ [ 'spo', '國', 'componentcount',   ], true, ]
    [ [ 'spo', '形', 'componentcount',   ], true, ]
    [ [ 'spo', '丁', 'components',       ], true, ]
    [ [ 'spo', '丁', 'xxxx',             ], false, ]
    [ [ 'spo', '丁',                     ], true, ]
    [ [ 'spo',                           ], true, ]
    [ [ 'xxx',                           ], false, ]
    ]
  #.........................................................................................................
  step ( resume ) =>
    yield @_feed_test_data db, probes_idx, resume
    for [ probe, matcher, ] in probes_and_matchers
      T.eq matcher, yield HOLLERITH.has_any db, { prefix: probe, }, resume
    done()

#-----------------------------------------------------------------------------------------------------------
@[ "$write rejects duplicate S/P pairs" ] = ( T, done ) ->
  probes_idx  = 2
  #.........................................................................................................
  step ( resume ) =>
    yield @_feed_test_data db, probes_idx, resume
    #.......................................................................................................
    try_writing = ->
      input = D.create_throughstream()
      #.....................................................................................................
      input
        .pipe D.$show()
        .pipe HOLLERITH.$write db
        .pipe D.$on_end ->
          T.fail "should never be called"
          done()
      #.....................................................................................................
      input.write [ '形', 'strokecount', 1234, ]
      input.end()
    #.......................................................................................................
    D.run try_writing, ( error ) ->
      T.eq "S/P pair already in DB: [ '形', 'strokecount' ]", error[ 'message' ]
      done()

#-----------------------------------------------------------------------------------------------------------
@[ "codec accepts long keys" ] = ( T, done ) ->
  probes_idx  = 2
  probes      = []
  long_text   = ( new Array 1025 ).join '#'
  # probes.push [ 'foo', long_text, [ long_text, long_text, long_text, long_text, long_text, ], ]
  # probes.push [ 'foo', [ long_text, long_text, long_text, long_text, long_text, ],
  #   [ long_text, long_text, long_text, long_text, long_text, ], ]
  # probes.push [ 'foo', [ long_text, long_text, long_text, long_text, long_text, ], ]
  probes.push [ 'foo', [ long_text, long_text, long_text, long_text, ], 42, ]
  #.........................................................................................................
  step ( resume ) =>
    yield @_feed_test_data db, probes_idx, resume
    #.......................................................................................................
    try_writing = ->
      input = D.create_throughstream()
      #.....................................................................................................
      input
        # .pipe D.$show()
        .pipe HOLLERITH.$write db
        .pipe D.$on_end ->
          T.eq 1, 1
          done()
      #.....................................................................................................
      for probe in probes
        input.write probe
        # yield later resume
      input.end()
    #.......................................................................................................
    D.run try_writing, ( error ) ->
      T.fail "should not throw error"
      warn error
      done()

#-----------------------------------------------------------------------------------------------------------
@[ "write private types (1)" ] = ( T, done ) ->
  probes_idx  = 5
  idx         = -1
  count       = 0
  #.........................................................................................................
  matchers = [
    ["pos","componentcount",1,"丁"]
    ["pos","components","丁","丁",0]
    ["pos","mtime",123456789,{"type":"route","value":"/foo/bar"}]
    ["pos","strokecount",2,"丁"]
    ["spo","丁","componentcount",1]
    ["spo","丁","components",["丁"]]
    ["spo","丁","strokecount",2]
    ["spo",{"type":"route","value":"/foo/bar"},"mtime",123456789]
    ]
  #.........................................................................................................
  write_data = ( handler ) =>
    input = D.create_throughstream()
    input
      # .pipe D.$show()
      .pipe HOLLERITH.$write db
      .pipe D.$on_end -> handler()
    #.......................................................................................................
    for probe in @_feed_test_data.probes[ probes_idx ]
      input.write probe
    input.end()
  #.........................................................................................................
  read_data = ( handler ) ->
    #.......................................................................................................
    input = HOLLERITH.create_phrasestream db
    input
      # .pipe D.$show()
      .pipe $ ( phrase, send ) =>
        count  += +1
        idx    += +1
        debug '©Sc5FG', JSON.stringify phrase
        T.eq phrase, matchers[ idx ]
      .pipe D.$on_end -> handler()
  #.........................................................................................................
  step ( resume ) =>
    yield HOLLERITH.clear db, resume
    yield write_data resume
    yield read_data  resume
    done()

#-----------------------------------------------------------------------------------------------------------
@[ "write private types (2)" ] = ( T, done ) ->
  probes_idx    = 5
  idx           = -1
  count         = 0
  #.........................................................................................................
  encoder = ( type, value ) ->
    debug '©XXX-encoder', type, rpr value
    return value.split '/' if type is 'route'
    throw new Error "unknown private type #{rpr type}"
  #.........................................................................................................
  xdb_route     = join __dirname, '..', 'dbs/tests-with-private-types'
  #.........................................................................................................
  xdb_settings  =
    size:           500
    encoder:        encoder
  #.........................................................................................................
  xdb           = HOLLERITH.new_db xdb_route, xdb_settings
  #.........................................................................................................
  matchers = [
    ["pos","componentcount",1,"丁"]
    ["pos","components","丁","丁",0]
    ["pos","mtime",123456789,{"type":"route","value":["","foo","bar"]}]
    ["pos","strokecount",2,"丁"]
    ["spo","丁","componentcount",1]
    ["spo","丁","components",["丁"]]
    ["spo","丁","strokecount",2]
    ["spo",{"type":"route","value":["","foo","bar"]},"mtime",123456789]
    ]
  #.........................................................................................................
  write_data = ( handler ) =>
    input = D.create_throughstream()
    input
      # .pipe D.$show()
      .pipe HOLLERITH.$write xdb
      .pipe D.$on_end -> handler()
    #.......................................................................................................
    for probe in @_feed_test_data.probes[ probes_idx ]
      input.write probe
    input.end()
  #.........................................................................................................
  read_data = ( handler ) ->
    #.......................................................................................................
    input = HOLLERITH.create_phrasestream xdb
    input
      # .pipe D.$show()
      .pipe $ ( phrase, send ) =>
        count  += +1
        idx    += +1
        debug '©Sc5FG', JSON.stringify phrase
        T.eq phrase, matchers[ idx ]
      .pipe D.$on_end -> handler()
  #.........................................................................................................
  step ( resume ) =>
    yield HOLLERITH.clear xdb, resume
    yield write_data resume
    yield read_data  resume
    yield xdb[ '%self' ].close resume
    done()

#-----------------------------------------------------------------------------------------------------------
@[ "write private types (3)" ] = ( T, done ) ->
  probes_idx    = 5
  idx           = -1
  count         = 0
  #.........................................................................................................
  encoder = ( type, value ) ->
    # debug '©XXX-encoder', type, rpr value
    return value.split '/' if type is 'route'
    throw new Error "unknown private type #{rpr type}"
  #.........................................................................................................
  decoder = ( type, value ) ->
    # debug '©XXX-decoder', type, rpr value
    return value.join '/' if type is 'route'
    throw new Error "unknown private type #{rpr type}"
  #.........................................................................................................
  xdb_route     = join __dirname, '..', 'dbs/tests-with-private-types'
  #.........................................................................................................
  xdb_settings  =
    size:           500
    encoder:        encoder
    decoder:        decoder
  #.........................................................................................................
  xdb           = HOLLERITH.new_db xdb_route, xdb_settings
  #.........................................................................................................
  matchers = [
    ["pos","componentcount",1,"丁"]
    ["pos","components","丁","丁",0]
    ["pos","mtime",123456789,"/foo/bar"]
    ["pos","strokecount",2,"丁"]
    ["spo","丁","componentcount",1]
    ["spo","丁","components",["丁"]]
    ["spo","丁","strokecount",2]
    ["spo","/foo/bar","mtime",123456789]
    ]
  #.........................................................................................................
  write_data = ( handler ) =>
    input = D.create_throughstream()
    input
      # .pipe D.$show()
      .pipe HOLLERITH.$write xdb
      .pipe D.$on_end -> handler()
    #.......................................................................................................
    for probe in @_feed_test_data.probes[ probes_idx ]
      input.write probe
    input.end()
  #.........................................................................................................
  read_data = ( handler ) ->
    #.......................................................................................................
    input = HOLLERITH.create_phrasestream xdb
    input
      # .pipe D.$show()
      .pipe $ ( phrase, send ) =>
        count  += +1
        idx    += +1
        urge '©Sc5FG', JSON.stringify phrase
        T.eq phrase, matchers[ idx ]
      .pipe D.$on_end -> handler()
  #.........................................................................................................
  step ( resume ) =>
    yield HOLLERITH.clear xdb, resume
    yield write_data resume
    yield read_data  resume
    yield xdb[ '%self' ].close resume
    done()

#-----------------------------------------------------------------------------------------------------------
@[ "bloom filter serialization without writes" ] = ( T, done ) ->
  #.........................................................................................................
  # step ( resume ) =>
  xdb   = HOLLERITH.new_db get_new_db_name()
  input = HOLLERITH.create_phrasestream xdb
  input.pause()
  input.pipe HOLLERITH.$write xdb
  input.resume()
  input.end()
  T.ok true
  done()

#-----------------------------------------------------------------------------------------------------------
@[ "Pinyin Unicode Sorting" ] = ( T, done ) ->
  #.........................................................................................................
  write_data = ( handler ) ->
    input = D.create_throughstream()
    #.......................................................................................................
    input
      .pipe HOLLERITH.$write db
      .pipe D.$on_end ->
        handler()
    #.......................................................................................................
    input.write [ '01', 'reading', 'ā', ]
    input.write [ '02', 'reading', 'ɑ̄', ]
    input.write [ '03', 'reading', 'ē', ]
    input.write [ '04', 'reading', 'ī', ]
    input.write [ '05', 'reading', 'ō', ]
    input.write [ '06', 'reading', 'ū', ]
    input.write [ '07', 'reading', 'ǖ', ]
    input.write [ '08', 'reading', 'Ā', ]
    input.write [ '09', 'reading', 'Ē', ]
    input.write [ '10', 'reading', 'Ī', ]
    input.write [ '11', 'reading', 'Ō', ]
    input.write [ '12', 'reading', 'Ū', ]
    input.write [ '13', 'reading', 'Ǖ', ]
    input.write [ '14', 'reading', 'á', ]
    input.write [ '15', 'reading', 'ɑ́', ]
    input.write [ '16', 'reading', 'é', ]
    input.write [ '17', 'reading', 'í', ]
    input.write [ '18', 'reading', 'ó', ]
    input.write [ '19', 'reading', 'ú', ]
    input.write [ '20', 'reading', 'ǘ', ]
    input.write [ '21', 'reading', 'Á', ]
    input.write [ '22', 'reading', 'É', ]
    input.write [ '23', 'reading', 'Í', ]
    input.write [ '24', 'reading', 'Ó', ]
    input.write [ '25', 'reading', 'Ú', ]
    input.write [ '26', 'reading', 'Ǘ', ]
    input.write [ '27', 'reading', 'ǎ', ]
    input.write [ '28', 'reading', 'ɑ̌', ]
    input.write [ '29', 'reading', 'ě', ]
    input.write [ '30', 'reading', 'ǐ', ]
    input.write [ '31', 'reading', 'ǒ', ]
    input.write [ '32', 'reading', 'ǔ', ]
    input.write [ '33', 'reading', 'ǚ', ]
    input.write [ '34', 'reading', 'Ǎ', ]
    input.write [ '35', 'reading', 'Ě', ]
    input.write [ '36', 'reading', 'Ǐ', ]
    input.write [ '37', 'reading', 'Ǒ', ]
    input.write [ '38', 'reading', 'Ǔ', ]
    input.write [ '39', 'reading', 'Ǚ', ]
    input.write [ '40', 'reading', 'à', ]
    input.write [ '41', 'reading', 'ɑ̀', ]
    input.write [ '42', 'reading', 'è', ]
    input.write [ '43', 'reading', 'ì', ]
    input.write [ '44', 'reading', 'ò', ]
    input.write [ '45', 'reading', 'ù', ]
    input.write [ '46', 'reading', 'ǜ', ]
    input.write [ '47', 'reading', 'À', ]
    input.write [ '48', 'reading', 'È', ]
    input.write [ '49', 'reading', 'Ì', ]
    input.write [ '50', 'reading', 'Ò', ]
    input.write [ '51', 'reading', 'Ù', ]
    input.write [ '52', 'reading', 'Ǜ', ]
    input.write [ '53', 'reading', 'a', ]
    input.write [ '54', 'reading', 'ɑ', ]
    input.write [ '55', 'reading', 'e', ]
    input.write [ '56', 'reading', 'i', ]
    input.write [ '57', 'reading', 'o', ]
    input.write [ '58', 'reading', 'u', ]
    input.write [ '59', 'reading', 'ü', ]
    input.write [ '60', 'reading', 'A', ]
    input.write [ '61', 'reading', 'Ɑ', ]
    input.write [ '62', 'reading', 'E', ]
    input.write [ '63', 'reading', 'I', ]
    input.write [ '64', 'reading', 'O', ]
    input.write [ '65', 'reading', 'U', ]
    input.write [ '66', 'reading', 'Ü', ]
    #.......................................................................................................
    input.end()
  #.........................................................................................................
  show = ( handler ) ->
    query = { prefix: [ 'pos', ], star: '*', }
    input = HOLLERITH.create_phrasestream db, query
    input
      .pipe do =>
        collector = []
        return $ ( phrase, send, end ) =>
          if phrase?
            [ _, _, letter, _, ] = phrase
            collector.push letter
          if end?
            urge collector = collector.join ''
            T.eq collector, 'AEIOUaeiouÀÁÈÉÌÍÒÓÙÚÜàáèéìíòóùúüĀāĒēĚěĪīŌōŪūǍǎǏǐǑǒǓǔǕǖǗǘǙǚǛǜɑɑ̀ɑ́ɑ̄ɑ̌Ɑ'
            end()
      .pipe D.$observe ( phrase ) =>
        info JSON.stringify phrase
      .pipe D.$on_end ->
        handler()
  #.........................................................................................................
  step ( resume ) =>
    yield clear_leveldb db[ '%self' ], resume
    # yield feed_test_data db, probes_idx, resume
    yield write_data resume
    yield show resume
    done()

#-----------------------------------------------------------------------------------------------------------
@[ "(v4) use non-string subjects in phrases (1)" ] = ( T, done ) ->
  #.........................................................................................................
  write_data = ( handler ) ->
    IDX   = Symbol.for 'index'
    input = D.create_throughstream()
    #.......................................................................................................
    input
      .pipe HOLLERITH.$write db, unique: no
      .pipe D.$on_end ->
        handler()
    #.......................................................................................................
    input.write [ '千', 'kwic/sortcode', '34d###', ]
    input.write [ ( Symbol.for 'index' ), [ '千', 'reading',          'foo', ], 'kwic/sortcode', '34d###', ]
    input.write [ ( Symbol.for 'index' ), [ '千', 'shape/similarity', '于', ],  'kwic/sortcode', '34d###', ]
    #.......................................................................................................
    input.end()
  #.........................................................................................................
  read = ( settings, handler ) ->
    Z = []
    input = HOLLERITH.create_phrasestream db, settings
    input
      .pipe D.$observe ( phrase ) => Z.push phrase
      .pipe D.$on_end             => handler null, Z
  #.........................................................................................................
  show = ( handler ) ->
    tasks = []
    #.......................................................................................................
    tasks.push ( handler ) =>
      input = HOLLERITH.create_phrasestream db, unbox: no, flatten: no
      input
        .pipe D.$observe ( phrase ) => urge '1 (ubx:n flt:n)', JSON.stringify phrase
        .pipe D.$on_end             => urge(); handler()
    #.......................................................................................................
    tasks.push ( handler ) =>
      input = HOLLERITH.create_phrasestream db, unbox: no, flatten: yes
      input
        .pipe D.$observe ( phrase ) => urge '2 (ubx:n flt:y)', JSON.stringify phrase
        .pipe D.$on_end             => urge(); handler()
    #.......................................................................................................
    tasks.push ( handler ) =>
      input = HOLLERITH.create_phrasestream db, unbox: yes, flatten: no
      input
        .pipe D.$observe ( phrase ) => urge '3 (ubx:y flt:n)', JSON.stringify phrase
        .pipe D.$on_end             => urge(); handler()
    #.......................................................................................................
    tasks.push ( handler ) =>
      input = HOLLERITH.create_phrasestream db, unbox: yes, flatten: yes
      input
        .pipe D.$observe ( phrase ) => urge '4 (ubx:y flt:y)', JSON.stringify phrase
        .pipe D.$on_end             => urge(); handler()
    #.......................................................................................................
    ASYNC.series tasks, => handler()
  #.........................................................................................................
  step ( resume ) =>
    yield clear_leveldb db[ '%self' ], resume
    # yield feed_test_data db, probes_idx, resume
    yield write_data resume
    yield show resume
    probes = yield read { unbox: no, flatten: no, }, resume
    T.eq probes, [
      ["pos","kwic/sortcode",null,"34d###",["千"]]
      ["pos","kwic/sortcode",null,"34d###",["千","reading","foo"]]
      ["pos","kwic/sortcode",null,"34d###",["千","shape/similarity","于"]]
      ["spo",["千"],"kwic/sortcode",null,"34d###"]
      ]
    probes = yield read { unbox: no, flatten: yes, }, resume
    T.eq probes, [
      ["pos","kwic/sortcode",null,"34d###","千"]
      ["pos","kwic/sortcode",null,"34d###","千","reading","foo"]
      ["pos","kwic/sortcode",null,"34d###","千","shape/similarity","于"]
      ["spo",["千"],"kwic/sortcode",null,"34d###"]
      ]
    probes = yield read { unbox: yes, flatten: no, }, resume
    T.eq probes, [
      ["pos","kwic/sortcode",null,"34d###","千"]
      ["pos","kwic/sortcode",null,"34d###",["千","reading","foo"]]
      ["pos","kwic/sortcode",null,"34d###",["千","shape/similarity","于"]]
      ["spo","千","kwic/sortcode",null,"34d###"]
      ]
    probes = yield read { unbox: yes, flatten: yes, }, resume
    T.eq probes, [
      ["pos","kwic/sortcode",null,"34d###","千"]
      ["pos","kwic/sortcode",null,"34d###","千","reading","foo"]
      ["pos","kwic/sortcode",null,"34d###","千","shape/similarity","于"]
      ["spo","千","kwic/sortcode",null,"34d###"]
      ]
    done()

#-----------------------------------------------------------------------------------------------------------
@[ "(v4) secondary indexing, manual" ] = ( T, done ) ->
  #.........................................................................................................
  write_data = ( handler ) ->
    IDX   = Symbol.for 'index'
    input = D.create_throughstream()
    #.......................................................................................................
    input
      .pipe HOLLERITH.$write db, unique: no
      .pipe D.$on_end ->
        handler()
    #.......................................................................................................
    input.write [ '千', 'reading',     'qian',       ]
    input.write [ '千', 'reading',     'foo',        ]
    input.write [ '千', 'reading',     'bar',        ]
    input.write [ '千', 'variant',     '仟',         ]
    input.write [ '千', 'variant',     '韆',         ]
    input.write [ '千', 'similarity',  '于',         ]
    input.write [ '千', 'similarity',  '干',         ]
    input.write [ '千', 'usagecode',   'CJKTHM',     ]
    input.write [ '千', 'gloss', 0,  'thousand',     ]
    input.write [ '千', 'gloss', 1,  'kilo',         ]
    input.write [ '千', 'gloss', 2,  'millenary',    ]
    #.......................................................................................................
    input.write [ IDX, [ '千', 'reading',    null, 'foo',    ], 'reading', 'qian', ]
    input.write [ IDX, [ '千', 'reading',    null, 'bar',    ], 'reading', 'qian', ]
    input.write [ IDX, [ '千', 'reading',    null, 'qian',   ], 'reading', 'foo', ]
    input.write [ IDX, [ '千', 'reading',    null, 'bar',    ], 'reading', 'foo', ]
    input.write [ IDX, [ '千', 'reading',    null, 'qian',   ], 'reading', 'bar', ]
    input.write [ IDX, [ '千', 'reading',    null, 'foo',    ], 'reading', 'bar', ]
    #.......................................................................................................
    input.write [ IDX, [ '千', 'variant',    null, '仟',      ], 'reading', 'qian', ]
    input.write [ IDX, [ '千', 'variant',    null, '韆',      ], 'reading', 'qian', ]
    input.write [ IDX, [ '千', 'variant',    null, '仟',      ], 'reading', 'foo', ]
    input.write [ IDX, [ '千', 'variant',    null, '韆',      ], 'reading', 'foo', ]
    input.write [ IDX, [ '千', 'variant',    null, '仟',      ], 'reading', 'bar', ]
    input.write [ IDX, [ '千', 'variant',    null, '韆',      ], 'reading', 'bar', ]
    #.......................................................................................................
    input.write [ IDX, [ '千', 'similarity', null, '于',      ], 'reading', 'qian', ]
    input.write [ IDX, [ '千', 'similarity', null, '干',      ], 'reading', 'qian', ]
    input.write [ IDX, [ '千', 'similarity', null, '于',      ], 'reading', 'foo', ]
    input.write [ IDX, [ '千', 'similarity', null, '干',      ], 'reading', 'foo', ]
    input.write [ IDX, [ '千', 'similarity', null, '于',      ], 'reading', 'bar', ]
    input.write [ IDX, [ '千', 'similarity', null, '干',      ], 'reading', 'bar', ]
    #.......................................................................................................
    input.write [ IDX, [ '千', 'usagecode',  null, 'CJKTHM', ], 'reading', 'qian', ]
    input.write [ IDX, [ '千', 'usagecode',  null, 'CJKTHM', ], 'reading', 'foo', ]
    input.write [ IDX, [ '千', 'usagecode',  null, 'CJKTHM', ], 'reading', 'bar', ]
    #.......................................................................................................
    input.write [ IDX, [ '千', 'gloss',      0,    'thousand',  ], 'reading', 'qian', ]
    input.write [ IDX, [ '千', 'gloss',      1,    'kilo',      ], 'reading', 'qian', ]
    input.write [ IDX, [ '千', 'gloss',      2,    'millenary', ], 'reading', 'qian', ]
    input.write [ IDX, [ '千', 'gloss',      0,    'thousand',  ], 'reading', 'foo', ]
    input.write [ IDX, [ '千', 'gloss',      1,    'kilo',      ], 'reading', 'foo', ]
    input.write [ IDX, [ '千', 'gloss',      2,    'millenary', ], 'reading', 'foo', ]
    input.write [ IDX, [ '千', 'gloss',      0,    'thousand',  ], 'reading', 'bar', ]
    input.write [ IDX, [ '千', 'gloss',      1,    'kilo',      ], 'reading', 'bar', ]
    input.write [ IDX, [ '千', 'gloss',      2,    'millenary', ], 'reading', 'bar', ]
    #.......................................................................................................
    input.end()
  #.........................................................................................................
  show = ( handler ) ->
    #.......................................................................................................
    input = HOLLERITH.create_phrasestream db#, flatten: yes
    input
      .pipe D.$observe ( phrase ) =>
        ( if phrase[ 0 ] is 'pos' then urge else help ) JSON.stringify phrase
      .pipe D.$on_end             => info(); handler()
  #.........................................................................................................
  step ( resume ) =>
    yield clear_leveldb db[ '%self' ], resume
    # yield feed_test_data db, probes_idx, resume
    yield write_data resume
    yield show resume
    done()

#-----------------------------------------------------------------------------------------------------------
@[ "(v4) secondary indexing, API" ] = ( T, done ) ->
  #.........................................................................................................
  write_data = ( handler ) ->
    IDX   = Symbol.for 'index'
    input = D.create_throughstream()
    #.......................................................................................................
    input
    # .pipe HOLLERITH.$index_v4 db, 'reading', 'reading'
    .pipe HOLLERITH.$write db, unique: no
    .pipe D.$on_end ->
      handler()
    #.......................................................................................................
    input.write [ '千', 'reading',     'qian',       ]
    input.write [ '千', 'reading',     'foo',        ]
    input.write [ '千', 'reading',     'bar',        ]
    input.write [ '千', 'variant',     '仟',         ]
    input.write [ '千', 'variant',     '韆',         ]
    input.write [ '千', 'similarity',  '于',         ]
    input.write [ '千', 'similarity',  '干',         ]
    input.write [ '千', 'usagecode',   'CJKTHM',     ]
    input.write [ '千', 'gloss', 0,  'thousand',     ]
    input.write [ '千', 'gloss', 1,  'kilo',         ]
    input.write [ '千', 'gloss', 2,  'millenary',    ]
    #.......................................................................................................
    input.end()
  #.........................................................................................................
  show = ( handler ) ->
    #.......................................................................................................
    input = HOLLERITH.create_phrasestream db, flatten: yes
    input
      .pipe D.$observe ( phrase ) =>
        ( if phrase[ 0 ] is 'pos' then urge else help ) JSON.stringify phrase
      .pipe D.$on_end             => info(); handler()
  #.........................................................................................................
  step ( resume ) =>
    yield clear_leveldb db[ '%self' ], resume
    # yield feed_test_data db, probes_idx, resume
    yield write_data resume
    yield show resume
    done()

#-----------------------------------------------------------------------------------------------------------
@[ "(v4) n-ary indexing (2)" ] = ( T, done ) ->
  #.........................................................................................................
  write_data = ( handler ) =>
    input = D.create_throughstream()
    #.......................................................................................................
    input
      # .pipe HOLLERITH.$index 'reading':     'plural',   'similarity':  'plural'
      # .pipe HOLLERITH.$index 'reading':     'plural',   'variant':     'plural'
      # .pipe HOLLERITH.$index 'reading':     'plural',   'strokeorder': 'singular'
      # .pipe HOLLERITH.$index 'strokeorder': 'singular', 'reading':     'plural'
      # .pipe HOLLERITH.$index 'strokeorder': 'singular', 'variant':     'plural'
      # .pipe HOLLERITH.$index 'strokeorder': 'singular', 'similarity':  'plural'
      .pipe HOLLERITH.$write db, unique: no
      .pipe D.$on_end => handler()
    #.......................................................................................................
    input.write [ '千', 'variant',     '仟',                         ]
    input.write [ '千', 'variant',     '韆',                         ]
    input.write [ '千', 'similarity',  '于',                         ]
    input.write [ '千', 'similarity',  '干',                         ]
    input.write [ '千', 'usagecode',   'CJKTHM',                    ]
    input.write [ '千', 'strokeorder', '312',                       ]
    input.write [ '千', 'reading',     'qian',                      ]
    input.write [ '千', 'reading',     'foo',                       ]
    input.write [ '千', 'reading',     'bar',                       ]
    input.write [ '仟', 'strokeorder', '32312',                     ]
    input.write [ '仟', 'usagecode',   'CJKTHm',                    ]
    input.write [ '仟', 'reading',     'qian',                      ]
    input.write [ '韆', 'strokeorder', '122125112125221134515454',  ]
    input.write [ '韆', 'usagecode',   'KTHm',                      ]
    input.write [ '韆', 'reading',     'qian',                      ]
    #.......................................................................................................
    input.end()
  #.........................................................................................................
  matchers = []
  #.........................................................................................................
  show = ( handler ) ->
    query = { prefix: [ 'pos', ], star: '*', }
    # query = {}
    input = HOLLERITH.create_phrasestream db, query
    input
      .pipe D.$observe ( phrase ) => info '5543', JSON.stringify phrase
      .pipe do =>
        idx = -1
        return D.$observe ( phrase, has_ended ) =>
          # if phrase?
          #   idx += +1
          #   T.eq phrase, matchers[ idx ]
          if has_ended
          #   T.eq idx, matchers.length - 1
            handler()
          return null
  #.........................................................................................................
  step ( resume ) =>
    yield clear_leveldb db[ '%self' ], resume
    yield write_data resume
    yield show resume
    done()

#-----------------------------------------------------------------------------------------------------------
@[ "(v4) values are `0x00` buffers" ] = ( T, done ) ->
  matcher = new Buffer '\x00'
  #.........................................................................................................
  write_data = ( handler ) ->
    input = D.create_throughstream()
    #.......................................................................................................
    input
      .pipe HOLLERITH.$write db, unique: no
      .pipe D.$on_end => handler()
    #.......................................................................................................
    input.write [ [ '千', ], 'variant',     [ '仟', '韆',              ], ]
    input.write [ [ '千', ], 'usagecode',   'CJKTHM',                    ]
    input.end()
  #.........................................................................................................
  show = ( handler ) ->
    input = db[ '%self' ].createValueStream()
    input
      .pipe D.$observe ( value ) =>
        T.eq value, matcher
      #.....................................................................................................
      .pipe D.$on_end -> handler()
  #.........................................................................................................
  step ( resume ) =>
    yield clear_leveldb db[ '%self' ], resume
    yield write_data resume
    yield show resume
    done()

#-----------------------------------------------------------------------------------------------------------
@[ "(v4) store SPO, POS both as keys only" ] = ( T, done ) ->
  #.........................................................................................................
  write_data = ( handler ) ->
    input = D.create_throughstream()
    #.......................................................................................................
    input
      .pipe HOLLERITH.$write db, unique: no
      .pipe D.$on_end => handler()
    #.......................................................................................................
    input.write [ '千', 'variant', '仟', ]
    input.end()
  #.........................................................................................................
  value_matchers = [
    [84,112,111,115,0,84,118,97,114,105,97,110,116,0,66,84,228,187,159,0,69,84,229,141,131,0,0]
    [84,115,112,111,0,69,84,229,141,131,0,0,84,118,97,114,105,97,110,116,0,66,84,228,187,159,0]
    ]
  #.........................................................................................................
  show = ( handler ) ->
    query = { prefix: [], star: '*', }
    input = db[ '%self' ].createReadStream()
    input
      # .pipe D.$observe ( record ) => info rpr record
      .pipe D.$observe ( record ) => info JSON.stringify record
      .pipe do =>
        idx       = -1
        zero_bfr  = new Buffer [ 0x00, ]
        return D.$observe ( record, has_ended ) =>
          if record?
            idx += +1
            { key, value, } = record
            T.eq key,   new Buffer value_matchers[ idx ]
            T.eq value, zero_bfr
          if has_ended
            T.eq idx, value_matchers.length - 1
      #.....................................................................................................
      .pipe D.$on_end -> handler()
  #.........................................................................................................
  step ( resume ) =>
    yield clear_leveldb db[ '%self' ], resume
    yield write_data resume
    yield show resume
    done()

#-----------------------------------------------------------------------------------------------------------
@[ "(v4) store non-list subject as single-element list" ] = ( T, done ) ->
  #.........................................................................................................
  write_data = ( handler ) ->
    input = D.create_throughstream()
    #.......................................................................................................
    input
      .pipe HOLLERITH.$write db, unique: no
      .pipe D.$on_end => handler()
    #.......................................................................................................
    input.write [ '千', 'variant', '仟', ]
    input.end()
  #.........................................................................................................
  value_matchers = [
    [ 0x54, 0x70, 0x6f, 0x73, 0x00, 0x54, 0x76, 0x61, 0x72, 0x69, 0x61, 0x6e, 0x74, 0x00, 0x42, 0x54, 0xe4, 0xbb, 0x9f, 0x00, 0x45, 0x54, 0xe5, 0x8d, 0x83, 0x00, 0x00, ]
    [ 0x54, 0x73, 0x70, 0x6f, 0x00, 0x45, 0x54, 0xe5, 0x8d, 0x83, 0x00, 0x00, 0x54, 0x76, 0x61, 0x72, 0x69, 0x61, 0x6e, 0x74, 0x00, 0x42, 0x54, 0xe4, 0xbb, 0x9f, 0x00, ]
    ]
  #.........................................................................................................
  show = ( handler ) ->
    query = { prefix: [], star: '*', }
    input = db[ '%self' ].createReadStream()
    input
      .pipe D.$observe ( record ) => info rpr record
      .pipe do =>
        idx       = -1
        zero_bfr  = new Buffer [ 0x00, ]
        return D.$observe ( record, has_ended ) =>
          if record?
            idx += +1
            { key, value, } = record
            T.eq key,   new Buffer value_matchers[ idx ]
            T.eq value, zero_bfr
          if has_ended
            T.eq idx, value_matchers.length - 1
      #.....................................................................................................
      .pipe D.$on_end -> handler()
  #.........................................................................................................
  step ( resume ) =>
    yield clear_leveldb db[ '%self' ], resume
    yield write_data resume
    yield show resume
    done()

#-----------------------------------------------------------------------------------------------------------
@[ "(v4) read POS phrases (sbj is a list)" ] = ( T, done ) ->
  #.........................................................................................................
  write_data = ( handler ) ->
    input = D.create_throughstream()
    #.......................................................................................................
    input
      .pipe HOLLERITH.$write db, unique: no
      .pipe D.$on_end => handler()
    #.......................................................................................................
    input.write [ [ 'glyph', '千', ], 'variant',     '仟',      ]
    input.write [ [ 'glyph', '千', ], 'variant',     '韆',      ]
    input.write [ [ 'glyph', '千', ], 'usagecode',   'CJKTHM',  ]
    #.......................................................................................................
    input.end()
  #.........................................................................................................
  matchers_boxed = [
    [ 'pos', 'usagecode', null, 'CJKTHM', [ 'glyph', '千' ], ]
    [ 'pos', 'variant',   null, '仟',     [ 'glyph', '千' ], ]
    [ 'pos', 'variant',   null, '韆',     [ 'glyph', '千' ], ]
    ]
  #.........................................................................................................
  matchers_unboxed = [
    [ 'pos', 'usagecode', null, 'CJKTHM', [ 'glyph', '千' ], ]
    [ 'pos', 'variant',   null, '仟',     [ 'glyph', '千' ], ]
    [ 'pos', 'variant',   null, '韆',     [ 'glyph', '千' ], ]
    ]
  #.........................................................................................................
  show = ( handler ) ->
    boxed_has_ended   = no
    unboxed_has_ended = no
    #.......................................................................................................
    query = { prefix: [ 'pos', ], star: '*', }
    input_boxed = HOLLERITH.create_phrasestream db, query
    input_boxed
      .pipe D.$observe ( phrase ) => info rpr phrase # JSON.stringify phrase
      #.....................................................................................................
      .pipe do =>
        idx = -1
        return D.$observe ( phrase, has_ended ) =>
          if phrase?
            idx += +1
            T.eq phrase, matchers_boxed[ idx ]
          if has_ended
            boxed_has_ended = yes
            T.eq idx, matchers_boxed.length - 1
            warn "part of test deactivated"
            return handler()# if unboxed_has_ended
    # #.......................................................................................................
    # query = { prefix: [ 'pos', ], star: '*', unbox: no, }
    # input_unboxed = HOLLERITH.create_phrasestream db, query
    # input_unboxed
    #   .pipe D.$observe ( phrase ) => info rpr phrase # JSON.stringify phrase
    #   #.....................................................................................................
    #   .pipe do =>
    #     idx = -1
    #     return D.$observe ( phrase, has_ended ) =>
    #       if phrase?
    #         idx += +1
    #         T.eq phrase, matchers_unboxed[ idx ]
    #       if has_ended
    #         unboxed_has_ended = yes
    #         T.eq idx, matchers_unboxed.length - 1
    #         return handler() if boxed_has_ended
  #.........................................................................................................
  step ( resume ) =>
    yield clear_leveldb db[ '%self' ], resume
    yield write_data resume
    yield show resume
    done()

#-----------------------------------------------------------------------------------------------------------
@[ "(v4) read POS phrases (sbj isn't a list)" ] = ( T, done ) ->
  #.........................................................................................................
  write_data = ( handler ) ->
    input = D.create_throughstream()
    #.......................................................................................................
    input
      .pipe HOLLERITH.$write db, unique: no
      .pipe D.$on_end => handler()
    #.......................................................................................................
    input.write [ '千', 'variant',     '仟',      ]
    input.write [ '千', 'variant',     '韆',      ]
    input.write [ '千', 'usagecode',   'CJKTHM',  ]
    #.......................................................................................................
    input.end()
  #.........................................................................................................
  matchers = [
    [ 'pos', 'usagecode', null, 'CJKTHM', '千' ]
    [ 'pos', 'variant',   null, '仟',     '千', ]
    [ 'pos', 'variant',   null, '韆',     '千', ]
    ]
  #.........................................................................................................
  show = ( handler ) ->
    query = { prefix: [ 'pos', ], star: '*', }
    input = HOLLERITH.create_phrasestream db, query
    input
      .pipe D.$observe ( phrase ) => info JSON.stringify phrase
      .pipe do =>
        idx = -1
        return D.$observe ( phrase, has_ended ) =>
          if phrase?
            idx += +1
            T.eq phrase, matchers[ idx ]
          if has_ended
            T.eq idx, matchers.length - 1
      #.....................................................................................................
      .pipe D.$on_end => handler()
  #.........................................................................................................
  step ( resume ) =>
    yield clear_leveldb db[ '%self' ], resume
    yield write_data resume
    yield show resume
    done()

#-----------------------------------------------------------------------------------------------------------
@[ "(v4) read POS phrases (sbj is a singleton list)" ] = ( T, done ) ->
  #.........................................................................................................
  write_data = ( handler ) ->
    input = D.create_throughstream()
    #.......................................................................................................
    input
      .pipe HOLLERITH.$write db, unique: no
      .pipe D.$on_end => handler()
    #.......................................................................................................
    input.write [ [ '千', ], 'variant',     '仟',      ]
    input.write [ [ '千', ], 'variant',     '韆',      ]
    input.write [ [ '千', ], 'usagecode',   'CJKTHM',  ]
    #.......................................................................................................
    input.end()
  #.........................................................................................................
  matchers = [
    [ 'pos', 'usagecode', null, 'CJKTHM', '千' ]
    [ 'pos', 'variant',   null, '仟',     '千', ]
    [ 'pos', 'variant',   null, '韆',     '千', ]
    ]
  #.........................................................................................................
  show = ( handler ) ->
    query = { prefix: [ 'pos', ], star: '*', }
    input = HOLLERITH.create_phrasestream db, query
    input
      .pipe D.$observe ( phrase ) => info rpr phrase # JSON.stringify phrase
      #.....................................................................................................
      .pipe do =>
        idx = -1
        return D.$observe ( phrase, has_ended ) =>
          if phrase?
            idx += +1
            T.eq phrase, matchers[ idx ]
          if has_ended
            T.eq idx, matchers.length - 1
      #.....................................................................................................
      .pipe D.$on_end => handler()
  #.........................................................................................................
  step ( resume ) =>
    yield clear_leveldb db[ '%self' ], resume
    yield write_data resume
    yield show resume
    done()

#-----------------------------------------------------------------------------------------------------------
@[ "(v4) read normalized phrases" ] = ( T, done ) ->
  T.fail "not implemented"
  done()

#-----------------------------------------------------------------------------------------------------------
@[ "dddddddddddddddddd" ] = ( T, done ) ->
  #.........................................................................................................
  write_data = ( handler ) ->
    input = D.create_throughstream()
    #.......................................................................................................
    input
      .pipe HOLLERITH.$write db, unique: no
      .pipe D.$on_end => handler()
    #.......................................................................................................
    # input.write [ '千', 'variant',     [ '仟', '韆',              ], ]
    # input.write [ '千', 'variant',     '仟', ]
    # input.write [ '千', 'variant',     '韆', ]
    # input.write [ '千', 'similarity',  [ '于', '干',              ], ]
    # input.write [ '千', 'usagecode',   'CJKTHM',                    ]
    # input.write [ '千', 'strokeorder', '312',                       ]
    # input.write [ '千', 'reading',     [ 'qian', 'foo', 'bar',   ], ]
    # input.write [ '仟', 'strokeorder', '32312',                     ]
    # input.write [ '仟', 'usagecode',   'CJKTHm',                    ]
    # input.write [ '仟', 'reading',     [ 'qian',                 ], ]
    # input.write [ '韆', 'strokeorder', '122125112125221134515454',  ]
    # input.write [ '韆', 'usagecode',   'KTHm',                      ]
    # input.write [ '韆', 'reading',     [ 'qian',                 ], ]
    # input.write [ '千', 'reading',     [ 'qian', 'foo', 'bar',   ], ]
    input.write [ '千', 'usagecode',           'CJKTHM',   ]
    input.write [ '韆', 'usagecode',   null,   'KTHm',     ] # can use explicit `null`
    input.write [ '千', 'reading',     0,      'foo',      ]
    input.write [ '千', 'reading',     1,      'bar',      ]
    input.write [ '千', 'reading',     2,      'qian',     ]
    input.write [ '韆', 'reading',     0,      'qian',     ]
    input.write [ '千', 'similarity',  'XYZ',  '于',       ]
    input.write [ '千', 'similarity',  'DEF',  '干',       ]
    input.write [ 'room-012', 'temperature',  ( new Date 2016, 3, 1, 13,  3, 56 ), { type: 'temperature', value: [ 17.4, '°C' ], }, ]
    input.write [ 'room-012', 'temperature',  ( new Date 2016, 3, 1, 13,  4, 30 ), { type: 'temperature', value: [ 18.5, '°C' ], }, ]
    input.write [ 'room-012', 'temperature',  ( new Date 2016, 3, 1, 13, 23,  2 ), { type: 'temperature', value: [ 16.1, '°C' ], }, ]
    #.......................................................................................................
    input.end()
  #.........................................................................................................
  matchers = []
  #.........................................................................................................
  show = ( handler ) ->
    input = HOLLERITH.create_phrasestream db, { prefix: [], star: '*', }
    # input = HOLLERITH.create_phrasestream db, { prefix: [ 'pos', ], star: '*', }
    #.......................................................................................................
    input
      .pipe D.$observe ( phrase ) => info JSON.stringify phrase
      # .pipe D.$observe ( phrase ) => info rpr phrase
      # .pipe D.$observe ( phrase ) => log ( require 'util' ).inspect phrase, { maxArrayLength: 1000, depth: null, colors: true, }
      # .pipe do =>
      #   idx = -1
      #   return D.$observe ( phrase ) =>
      #     idx += +1
      #     T.eq phrase, matchers[ idx ]
      #.....................................................................................................
      .pipe D.$on_end -> handler()
  #.........................................................................................................
  step ( resume ) =>
    yield clear_leveldb db[ '%self' ], resume
    yield write_data resume
    yield show resume
    done()

#-----------------------------------------------------------------------------------------------------------
@[ "eeeeeeeeeeeeeeeeee" ] = ( T, done ) ->
  #.........................................................................................................
  write_data = ( handler ) ->
    input = D.create_throughstream()
    #.......................................................................................................
    input
      .pipe HOLLERITH.$write db, unique: no
      .pipe D.$on_end => handler()
    #.......................................................................................................
    input.write [ 'A1', 'reading', null, [ 'a1', 'ā', ], ]
    input.write [ 'A2', 'reading', null, [ 'a2', 'á', ], ]
    input.write [ 'A3', 'reading', null, [ 'a3', 'ǎ', ], ]
    input.write [ 'A4', 'reading', null, [ 'a4', 'à', ], ]
    input.write [ 'A5', 'reading', null, [ 'a5', 'a', ], ]
    #.......................................................................................................
    input.write [ 'E1', 'reading', null, [ 'e1', 'ē', ], ]
    input.write [ 'E2', 'reading', null, [ 'e2', 'é', ], ]
    input.write [ 'E3', 'reading', null, [ 'e3', 'ě', ], ]
    input.write [ 'E4', 'reading', null, [ 'e4', 'è', ], ]
    input.write [ 'E5', 'reading', null, [ 'e5', 'e', ], ]
    #.......................................................................................................
    input.write [ 'I1', 'reading', null, [ 'i1', 'ī', ], ]
    input.write [ 'I2', 'reading', null, [ 'i2', 'í', ], ]
    input.write [ 'I3', 'reading', null, [ 'i3', 'ǐ', ], ]
    input.write [ 'I4', 'reading', null, [ 'i4', 'ì', ], ]
    input.write [ 'I5', 'reading', null, [ 'i5', 'i', ], ]
    #.......................................................................................................
    input.write [ 'O1', 'reading', null, [ 'o1', 'ō', ], ]
    input.write [ 'O2', 'reading', null, [ 'o2', 'ó', ], ]
    input.write [ 'O3', 'reading', null, [ 'o3', 'ǒ', ], ]
    input.write [ 'O4', 'reading', null, [ 'o4', 'ò', ], ]
    input.write [ 'O5', 'reading', null, [ 'o5', 'o', ], ]
    #.......................................................................................................
    input.write [ 'U1', 'reading', null, [ 'u1', 'ū', ], ]
    input.write [ 'U2', 'reading', null, [ 'u2', 'ú', ], ]
    input.write [ 'U3', 'reading', null, [ 'u3', 'ǔ', ], ]
    input.write [ 'U4', 'reading', null, [ 'u4', 'ù', ], ]
    input.write [ 'U5', 'reading', null, [ 'u5', 'u', ], ]
    #.......................................................................................................
    input.write [ 'Ü1', 'reading', null, [ 'ü1', 'ǖ', ], ]
    input.write [ 'Ü2', 'reading', null, [ 'ü2', 'ǘ', ], ]
    input.write [ 'Ü3', 'reading', null, [ 'ü3', 'ǚ', ], ]
    input.write [ 'Ü4', 'reading', null, [ 'ü4', 'ǜ', ], ]
    input.write [ 'Ü5', 'reading', null, [ 'ü5', 'ü', ], ]
    #.......................................................................................................
    input.end()
  #.........................................................................................................
  matchers = []
  #.........................................................................................................
  show = ( handler ) ->
    # input = HOLLERITH.create_phrasestream db, { prefix: [], star: '*', }
    input = HOLLERITH.create_phrasestream db, { prefix: [ 'pos', ], star: '*', }
    #.......................................................................................................
    input
      .pipe D.$observe ( phrase ) => info JSON.stringify phrase
      # .pipe do =>
      #   idx = -1
      #   return D.$observe ( phrase ) =>
      #     idx += +1
      #     T.eq phrase, matchers[ idx ]
      #.....................................................................................................
      .pipe D.$on_end -> handler()
  #.........................................................................................................
  step ( resume ) =>
    yield clear_leveldb db[ '%self' ], resume
    yield write_data resume
    yield show resume
    done()

#-----------------------------------------------------------------------------------------------------------
@[ "(v4) create_longphrasestream rejects illegal arguments" ] = ( T, done ) ->
  probes = [
    ( -> HOLLERITH.create_longphrasestream db, hi: [ 'xxx', ] )
    ( -> HOLLERITH.create_longphrasestream db, lo: [ 'xxx', ] )
    ( -> HOLLERITH.create_longphrasestream db, hi: [ 'xxx', ], prefix: [ 'xxx' ] )
    ( -> HOLLERITH.create_longphrasestream db, foobar: [ 'xxx', ] )
    ( -> HOLLERITH.create_longphrasestream db, prefix: [ 'xxx' ], star: '?' )
    ( -> HOLLERITH.create_longphrasestream db, lo: [ 'xxx' ], star: '?' )
    ]
  matchers = [
    "must use either 'prefix' or 'hi' and 'lo', got 'hi'"
    "must use either 'prefix' or 'hi' and 'lo', got 'lo'"
    "illegal to use 'hi' or 'lo' together with 'prefix'"
    "legal query keys are 'prefix', 'star', 'lo', 'hi', 'unbox', 'flatten', got 'foobar'"
    "expected 'star' to be '*', got '?'"
    "must use either 'prefix' or 'hi' and 'lo', got 'lo', 'star'"
    ]
  for probe, probe_idx in probes
    matcher = matchers[ probe_idx ]
    # try
    #   probe()
    #   throw new Error "shouldn't happen"
    # catch error
    #   throw error if error[ 'message' ] is "shouldn't happen"
    #   debug '5620' , JSON.stringify error[ 'message' ]
    T.throws matcher, probe
  done()

#-----------------------------------------------------------------------------------------------------------
@[ "(v4) create_longphrasestream accepts legal arguments" ] = ( T, done ) ->
  probes = [
    { lo: [ 'xxx', ], hi: [ 'xxx', ],                         }
    { prefix: [ 'xxx', ],                                     }
    { prefix: [ 'xxx', ], star: '*',                          }
    { prefix: [ 'xxx', ], star: '*', unbox: yes,              }
    { prefix: [ 'xxx', ], star: '*', flatten: yes,            }
    { prefix: [ 'xxx', ], star: '*', unbox: no, flatten: yes, }
    { unbox: yes,                                             }
    { unbox: yes, flatten: no,                                }
    { flatten: no,                                            }
    ]
  for probe, probe_idx in probes
    ### thx to German Attanasio http://stackoverflow.com/a/28564000/256361 ###
    try
      T.ok ( HOLLERITH.create_longphrasestream db, probe ) instanceof ( require 'stream' ).Stream
    catch error
      T.fail "#{rpr probe} fails with '#{error[ 'message' ]}'"
  done()


#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
@_prune = ->
  for name, value of @
    continue if name.startsWith '_'
    delete @[ name ] unless name in include
  return null


############################################################################################################
unless module.parent?
  # debug '0980', JSON.stringify ( Object.keys @ ), null, '  '
  include = [
    # "write without error (1)"
    # "write without error (2)"
    # "read without error"
    # "read keys without error (1)"
    # "read keys without error (2)"
    # "read keys without error (3)"
    # "read keys without error (4)"
    # "read POS facets"
    # "read POS phrases (1)"
    # "read POS phrases (2)"
    # "read SPO phrases"
    # "sorting (1)"
    # "sorting (2)"
    # "H2 codec `encode` throws on anything but a list"
    # "sort texts with H2 codec (1)"
    # "sort texts with H2 codec (2)"
    # "sort numbers with H2 codec (1)"
    # "sort mixed values with H2 codec"
    # "sort lists of mixed values with H2 codec"
    # "sort routes with values (1)"
    # "sort routes with values (2)"
    # "read sample data"
    # "read and write keys with lists"
    # "encode keys with list elements"
    # "read and write phrases with unanalyzed lists"
    # "read partial POS phrases"
    # "read single phrases (1)"
    # "read single phrases (2)"
    # "read single phrases (3)"
    # "read single phrases (4)"
    # "writing phrases with non-unique keys fails"
    # "reminders"
    # "invalid key not accepted (1)"
    # "invalid key not accepted (2)"
    # "catching errors (2)"
    # "catching errors (1)"
    # "building PODs from SPO phrases"
    # "read phrases in lockstep"
    # "has_any yields existence of key"
    # "$write rejects duplicate S/P pairs"
    # "codec accepts long keys"
    # "write private types (1)"
    # "write private types (2)"
    # "write private types (3)"
    # "bloom filter serialization without writes"
    # "use non-string subjects in phrases"
    # "$write rejects duplicate S/P pairs"
    # "codec accepts long keys"
    # "write private types (1)"
    "(v4) use non-string subjects in phrases (1)"
    "(v4) secondary indexing, manual"
    "(v4) secondary indexing, API"
    # # "binary indexing"
    # # "n-ary indexing (1)"
    "(v4) n-ary indexing (2)"
    # # # "Pinyin Unicode Sorting"
    # # # "ensure `Buffer.compare` gives same sorting as LevelDB"
    # "(v4) values are `0x00` buffers"
    # "(v4) store SPO, POS both as keys only"
    # "(v4) store non-list subject as single-element list"
    # "(v4) read POS phrases (sbj is a list)"
    # "(v4) read POS phrases (sbj isn't a list)"
    # "(v4) read POS phrases (sbj is a singleton list)"
    # "(v4) create_longphrasestream rejects illegal arguments"
    # "(v4) create_longphrasestream accepts legal arguments"
    # "(v4) read normalized phrases"
    # # "dddddddddddddddddd"
    # # "eeeeeeeeeeeeeeeeee"
    ]
  @_prune()
  @_main()
  # @[ "XXX" ] null, -> help "(done)"
  # @[ "YYY" ] null, -> help "(done)"
  # @[ "ZZZ" ] null, -> help "(done)"

  # debug '©P9AOR', ( HOLLERITH.CODEC[ 'typemarkers'  ][ 'null'       ] ).toString 16
  # debug '©xxmIp', ( HOLLERITH.CODEC[ 'typemarkers'  ][ 'false'      ] ).toString 16
  # debug '©ZeY26', ( HOLLERITH.CODEC[ 'typemarkers'  ][ 'true'       ] ).toString 16
  # debug '©WgER9', ( HOLLERITH.CODEC[ 'typemarkers'  ][ 'date'       ] ).toString 16
  # debug '©UmpjJ', ( HOLLERITH.CODEC[ 'typemarkers'  ][ 'ninfinity'  ] ).toString 16
  # debug '©Url0K', ( HOLLERITH.CODEC[ 'typemarkers'  ][ 'nnumber'    ] ).toString 16
  # debug '©nFIIi', ( HOLLERITH.CODEC[ 'typemarkers'  ][ 'pnumber'    ] ).toString 16
  # debug '©LZ58R', ( HOLLERITH.CODEC[ 'typemarkers'  ][ 'pinfinity'  ] ).toString 16
  # debug '©MYxda', ( HOLLERITH.CODEC[ 'typemarkers'  ][ 'text'       ] ).toString 16










