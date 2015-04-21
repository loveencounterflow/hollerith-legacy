


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
          key = HOLLERITH.new_so_key db, probe...
          input.write key
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
  [ 'glyph', '嗐', 'components',  2000, ]
  [ 'glyph', '嗐', 'reading',     2000, ]
  [ 'glyph', '嗐', 'strokeorder', 2000, ]
  [ 'glyph', '嗑', 'components',  2001, ]
  [ 'glyph', '嗑', 'reading',     2001, ]
  [ 'glyph', '嗑', 'strokeorder', 2001, ]
  [ 'glyph', '嗒', 'components',  2002, ]
  [ 'glyph', '嗒', 'reading',     2002, ]
  [ 'glyph', '嗒', 'strokeorder', 2002, ]
  [ 'glyph', '嗓', 'components',  2003, ]
  [ 'glyph', '嗓', 'reading',     2003, ]
  [ 'glyph', '嗓', 'strokeorder', 2003, ]
  [ 'glyph', '嗔', 'components',  2004, ]
  [ 'glyph', '嗔', 'reading',     2004, ]
  [ 'glyph', '嗔', 'strokeorder', 2004, ]
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
@[ "keys 0" ] = ( T, done ) ->
  key_0   = HOLLERITH.new_key     db, 'so', 'glyph', '家', 'strokeorder', '4451353334'
  key_1   = HOLLERITH.new_so_key  db,       'glyph', '家', 'strokeorder', '4451353334'
  matcher = [ 'so', 'glyph', '家', 'strokeorder', '4451353334', 0 ]
  T.eq key_0, matcher
  T.eq key_1, key_0
  done()

#-----------------------------------------------------------------------------------------------------------
@[ "keys 1" ] = ( T, done ) ->
  [ sk, sv, ok, ov, ] = [ 'glyph', '家', 'strokeorder', '4451353334', ]
  [ so_key_0, os_key_0, ] = HOLLERITH.new_keys db, 'so', sk, sv, ok, ov
  so_key_1 = HOLLERITH.new_so_key db, sk, sv, ok, ov
  os_key_1 = HOLLERITH.new_os_key db, sk, sv, ok, ov
  T.eq so_key_0, so_key_1
  T.eq os_key_0, os_key_1
  done()

#-----------------------------------------------------------------------------------------------------------
@[ "keys 2" ] = ( T, done ) ->
  [ t_0, sk_0, sv_0, ok_0, ov_0, idx_0, ] = [ 'so', 'glyph', '家', 'strokeorder', '4451353334', 0, ]
  so_key_0 = HOLLERITH.new_key db, t_0, sk_0, sv_0, ok_0, ov_0, idx_0
  [ t_1, sk_1, sv_1, ok_1, ov_1, idx_1, ] = HOLLERITH.normalize_key db, so_key_0
  T.eq [ t_0, sk_0, sv_0, ok_0, ov_0, idx_0, ], [ t_1, sk_1, sv_1, ok_1, ov_1, idx_1, ]
  done()

#-----------------------------------------------------------------------------------------------------------
@[ "ordering and value recovery 0" ] = ( T, done ) ->
  matchers    = []
  probes_idx  = 0
  #.........................................................................................................
  for probe in @_feed_test_data.probes[ probes_idx ]
    [ sk, sv, ok, ov, ] = probe
    matchers.push [ 'os', ok, ov, sk, sv, 0, ]
    matchers.push [ 'so', sk, sv, ok, ov, 0, ]
  @_sort_list matchers
  #.........................................................................................................
  idx = -1
  step ( resume ) =>
    yield @_feed_test_data db, probes_idx, resume
    input = db[ '%self' ].createKeyStream()
    input
      .pipe $ ( key, send ) =>
        key = BYTEWISE.decode key
        idx += +1
        T.eq key, matchers[ idx ]
      .pipe D.$on_end => done()

#-----------------------------------------------------------------------------------------------------------
@[ "ordering and value recovery 1" ] = ( T, done ) ->
  probes_idx  = 1
  #.........................................................................................................
  matchers    = [
    'os|cp/fncr:u-cjk-xb/20d26|glyph:𠴦|0'
    'os|cp/fncr:u-cjk-xb/24fef|glyph:𤿯|0'
    'os|cp/fncr:u-cjk-xb/27474|glyph:𧑴|0'
    'os|cp/fncr:u-cjk-xb/284a1|glyph:𨒡|0'
    'os|cp/fncr:u-cjk-xb/2a6a7|glyph:𪚧|0'
    'os|cp/fncr:u-cjk-xb/2a6ab|glyph:𪚫|0'
    'os|cp/fncr:u-cjk/52ac|glyph:劬|0'
    'os|cp/fncr:u-cjk/90ad|glyph:邭|0'
    'os|strokeorder:352513553254|glyph:𤿯|0'
    'os|strokeorder:3525141121|glyph:𠴦|0'
    'os|strokeorder:35251454|glyph:𨒡|0'
    'os|strokeorder:3525152|glyph:邭|0'
    'os|strokeorder:352515251115115113541|glyph:𪚫|0'
    'os|strokeorder:35251525112511511|glyph:𪚧|0'
    'os|strokeorder:352515251214251214|glyph:𧑴|0'
    'os|strokeorder:3525153|glyph:劬|0'
    'so|glyph:劬|cp/fncr:u-cjk/52ac|0'
    'so|glyph:劬|strokeorder:3525153|0'
    'so|glyph:邭|cp/fncr:u-cjk/90ad|0'
    'so|glyph:邭|strokeorder:3525152|0'
    'so|glyph:𠴦|cp/fncr:u-cjk-xb/20d26|0'
    'so|glyph:𠴦|strokeorder:3525141121|0'
    'so|glyph:𤿯|cp/fncr:u-cjk-xb/24fef|0'
    'so|glyph:𤿯|strokeorder:352513553254|0'
    'so|glyph:𧑴|cp/fncr:u-cjk-xb/27474|0'
    'so|glyph:𧑴|strokeorder:352515251214251214|0'
    'so|glyph:𨒡|cp/fncr:u-cjk-xb/284a1|0'
    'so|glyph:𨒡|strokeorder:35251454|0'
    'so|glyph:𪚧|cp/fncr:u-cjk-xb/2a6a7|0'
    'so|glyph:𪚧|strokeorder:35251525112511511|0'
    'so|glyph:𪚫|cp/fncr:u-cjk-xb/2a6ab|0'
    'so|glyph:𪚫|strokeorder:352515251115115113541|0'
    ]
  #.........................................................................................................
  idx = -1
  step ( resume ) =>
    yield @_feed_test_data db, probes_idx, resume
    input = HOLLERITH.read db
    input
      .pipe HOLLERITH.$url_from_key db
      .pipe $ ( key, send ) =>
        # debug '©4i3qZ', key
        idx += +1
        T.eq key, matchers[ idx ]
      .pipe D.$on_end => done()

#-----------------------------------------------------------------------------------------------------------
@[ "prefixes and searching 0" ] = ( T, done ) ->
  matchers    = []
  probes_idx  = 1
  #.........................................................................................................
  matchers = [
    'os|strokeorder:3525141121|glyph:𠴦|0'
    'os|strokeorder:35251454|glyph:𨒡|0'
    ]
  #.........................................................................................................
  idx = -1
  step ( resume ) =>
    yield @_feed_test_data db, probes_idx, resume
    query = HOLLERITH.new_query db, [ 'os', 'strokeorder', '352514', ]
    # debug '©q0oj2', query
    input = db[ '%self' ].createKeyStream query
    input
      #.....................................................................................................
      .pipe $ ( bkey, send ) =>
        url = HOLLERITH.url_from_key db, HOLLERITH._decode db, bkey
        idx += +1
        T.eq url, matchers[ idx ]
      #.....................................................................................................
      .pipe D.$on_end =>
        T.eq idx, 1
        done()

#-----------------------------------------------------------------------------------------------------------
@[ "prefixes and searching 1" ] = ( T, done ) ->
  matchers    = []
  probes_idx  = 1
  #.........................................................................................................
  matchers = [
    'os|strokeorder:3525141121|glyph:𠴦|0'
    'os|strokeorder:35251454|glyph:𨒡|0'
    ]
  #.........................................................................................................
  idx = -1
  step ( resume ) =>
    yield @_feed_test_data db, probes_idx, resume
    input = HOLLERITH.read db, [ 'os', 'strokeorder', '352514', ]
      .pipe HOLLERITH.$url_from_key db
      .pipe D.$show()
      #.....................................................................................................
      .pipe $ ( url, send ) =>
        idx += +1
        T.eq url, matchers[ idx ]
      #.....................................................................................................
      .pipe D.$on_end =>
        T.eq idx, 1
        done()

#-----------------------------------------------------------------------------------------------------------
@[ "_ordering" ] = ( T, done ) ->
  hi = undefined
  lo = null
  probes = [
    [ 'x', '<3525135>',             ]
    [ 'x', '<3525141121>',          ]
    [ 'x', '<35251454>',            ]
    [ 'x', '<3525152>',             ]
    [ 'x', '<352515251>',           ]
    [ 'x', '<3525152511>',          ]
    [ 'x', '<3525153>',             ]
    [ 'x', +Infinity, ]
    [ 'x', -Infinity, ]
    [ 'x', 42, ]
    [ 'x', -42, ]
    [ 'x', 'a', ]
    [ 'x', 'z', ]
    [ 'x', '中', ]
    [ 'x', '\uffff', ]
    [ 'x', '𠂝', ]
    # [ 'x', ( new Buffer ( String.fromCodePoint 0x10ffff ), 'utf-8' ), ]
    # [ 'x', ( new Buffer ( String.fromCodePoint 0x10ffff ), 'utf-8' ).toString(), ]
    # [ 'x', hi, ]
    # [ 'x', lo, ]
    [ 'os', 'ok', ]        # 'os|ok'
    [ 'os', 'ok', 'ov', ]  # 'os|ok:ov'
    [ 'os', 'ok*', ]       # 'os|ok*'
    [ 'os', 'ok', 'ov*', ] # 'os|ok:ov*'
    ]
    # # [ 'os', [ 'ok', 'ov', ], [ 'sk', 'sv', ], 0, ]
    # [ 'os', 'strokeorder', '<3525141121>',            'glyph', '𠴦', 0, ]
    # [ 'os', 'strokeorder', '<35251454>',              'glyph', '𨒡', 0, ]
    # [ 'os', 'strokeorder', '<3525152>',               'glyph', '邭', 0, ]
    # [ 'os', 'strokeorder', '<352515251115115113541>', 'glyph', '𪚫', 0, ]
    # [ 'os', 'strokeorder', '<35251525112511511>',     'glyph', '𪚧', 0, ]
    # [ 'os', 'strokeorder', '<352515251214251214>',    'glyph', '𧑴', 0, ]
    # [ 'os', 'strokeorder', '<3525153>',               'glyph', '劬', 0, ]
  #.........................................................................................................
  @_sort_list probes
  #.........................................................................................................
  lines = ( [ ( CND.green probe ), ( CND.grey BYTEWISE.encode probe ), ] for probe in probes )
  log ( require 'columnify' ) lines


#-----------------------------------------------------------------------------------------------------------
@_main = ( handler ) ->
  db = HOLLERITH.new_db join __dirname, '..', 'dbs/tests'
  test @, 'timeout': 2500

############################################################################################################
unless module.parent?
  @_main()
  # @[ "ordering" ]()
  # CND.dir ( require 'leveldown' ) join __dirname, '..', 'dbs/tests'
  # db = HOLLERITH.new_db join __dirname, '..', 'dbs/tests'
  # @_feed_test_data db, ( error ) ->
  #   throw error if error?
  #   db[ '%self' ].createKeyStream()
  #     .pipe D.$show()


