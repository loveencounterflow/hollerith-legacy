


############################################################################################################
# njs_util                  = require 'util'
# njs_path                  = require 'path'
# njs_fs                    = require 'fs'
#...........................................................................................................
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'HOLLERITH/main'
log                       = CND.get_logger 'plain',     badge
debug                     = CND.get_logger 'debug',     badge
warn                      = CND.get_logger 'warn',      badge
help                      = CND.get_logger 'help',      badge
urge                      = CND.get_logger 'urge',      badge
whisper                   = CND.get_logger 'whisper',   badge
echo                      = CND.echo.bind CND
#...........................................................................................................
suspend                   = require 'coffeenode-suspend'
step                      = suspend.step
#...........................................................................................................
### https://github.com/deanlandolt/bytewise ###
BYTEWISE                  = require 'bytewise'
_btws_encode              = BYTEWISE.encode.bind BYTEWISE
_btws_decode              = BYTEWISE.decode.bind BYTEWISE
#...........................................................................................................
D                         = require 'pipedreams2'
$                         = D.remit.bind D
_new_level_db             = require 'level'
@_zero                    = _btws_encode true
@_last_octet              = new Buffer [ 0xff, ]
leveldown                 = require 'level/node_modules/leveldown'
#...........................................................................................................
suspend                   = require 'coffeenode-suspend'
step                      = suspend.step
repeat_immediately        = suspend.repeat_immediately
#...........................................................................................................
LODASH                    = require 'lodash'


#-----------------------------------------------------------------------------------------------------------
@new_db = ( route ) ->
  #.........................................................................................................
  level_settings =
    'keyEncoding':          'binary'
    'valueEncoding':        'binary'
    'createIfMissing':      true
    'errorIfExists':        false
    'compression':          yes
    'sync':                 no
  #.........................................................................................................
  substrate           = _new_level_db route, level_settings
  #.........................................................................................................
  R =
    '~isa':           'HOLLERITH/db'
    '%self':          substrate
  #.........................................................................................................
  return R

# #-----------------------------------------------------------------------------------------------------------
# @_reopen = ( db, handler ) ->
#   step ( resume ) =>
#     route = db[ '%self' ][ 'location' ]
#     yield db[ '%self' ].close resume
#     yield db[ '%self' ].open resume
#     whisper "re-opened LevelDB at #{route}"
#     handler null

#-----------------------------------------------------------------------------------------------------------
@clear = ( db, handler ) ->
  step ( resume ) =>
    route = db[ '%self' ][ 'location' ]
    yield db[ '%self' ].close resume
    yield leveldown.destroy route, resume
    yield db[ '%self' ].open resume
    # help "erased and re-opened LevelDB at #{route}"
    handler null


#===========================================================================================================
# WRITING
#-----------------------------------------------------------------------------------------------------------
@$write = ( db, buffer_size = 1000 ) ->
  ### Expects a Hollerith DB object and an optional buffer size; returns a pipe transformer that does all of
  the following:

  * It expects an SO key for which it will generate a corresponding OS key.
  * A corresponding OS key is formulated except when the SO key's object value is a JS object / a POD (since
    in that case, the value serialization is jolly useless as an index).
  * It sends on both the SO and the OS key downstream for optional further processing.
  * It forms a proper `node-level`-compatible batch record for each key and collect all records
    in a buffer.
  * Whenever the buffer has outgrown the given buffer size, the buffer will be written into the DB using
    `levelup`'s `batch` command.
  * When the last pending batch has been written into the DB, the `end` event is called on the stream
    and may be detected downstream.

  ###
  #.........................................................................................................
  throw new Error "buffer size must be positive integer, got #{rpr buffer_size}" unless buffer_size > 0
  buffer      = []
  substrate   = db[ '%self' ]
  batch_count = 0
  has_ended   = no
  _send       = null
  #.........................................................................................................
  flush = =>
    if buffer.length > 0
      batch_count += +1
      substrate.batch buffer, ( error ) =>
        throw error if error?
        batch_count += -1
        _send.end() if has_ended and batch_count < 1
      buffer = []
    else
      _send.end()
  #.........................................................................................................
  return $ ( so_key, send, end ) =>
    _send = send
    if so_key?
      # debug '©rDlYA', so_key
      buffer.push { type: 'put', key: ( @_encode db, so_key ), value: @_zero, }
      ### TAINT must validate this type check still works as intended ###
      unless CND.isa_pod so_key[ 2 ][ 1 ]
        os_key = @_new_os_key_from_so_key db, so_key
        buffer.push { type: 'put', key: ( @_encode db, os_key ), value: @_zero, }
      flush() if buffer.length >= buffer_size
      send so_key
      send os_key
    if end?
      has_ended = yes
      flush()


#===========================================================================================================
# READING
#-----------------------------------------------------------------------------------------------------------
@read = ( db, hint = null ) ->
  if hint? then R = db[ '%self' ].createKeyStream @new_query db, hint
  else          R = db[ '%self' ].createKeyStream()
  #.........................................................................................................
  R = R.pipe $ ( bkey, send ) => send @_decode db, bkey
  return R

#-----------------------------------------------------------------------------------------------------------
@read_sub = ( db, settings, read ) ->
  switch arity = arguments.length
    when 2
      read      = settings
      settings  = null
    when 3
      null
    else
      throw new Error "expected 2 or 3 arguments, got #{arity}"
  #.........................................................................................................
  indexed           = settings?[ 'indexed' ] ? no
  insert_index      = if indexed then D.new_indexer() else ( x ) -> x
  open_stream_count = 0
  #.........................................................................................................
  return $ ( outer_data, outer_send, outer_end ) =>
    #.......................................................................................................
    if outer_data?
      open_stream_count  += +1
      sub_input = read outer_data
        .pipe do =>
          buffer = []
          return $ ( inner_data, _, inner_end ) =>
            buffer.push inner_data if inner_data?
            if inner_end?
              outer_send insert_index buffer
              open_stream_count += -1
    #.......................................................................................................
    if outer_end?
      repeat_immediately ->
        return true unless open_stream_count is 0
        outer_end()
        return false


#===========================================================================================================
# KEY AND PREFIXES
#-----------------------------------------------------------------------------------------------------------
@_encode = ( db, key ) ->
  throw new Error "illegal key #{rpr key}" if key is undefined
  return _btws_encode key

#-----------------------------------------------------------------------------------------------------------
@_decode = ( db, key ) ->
  throw new Error "illegal key #{rpr key}" if ( R = _btws_decode key ) is undefined
  return R

#-----------------------------------------------------------------------------------------------------------
### NB Argument ordering for these function is always subject before object, regardless of the phrasetype
and the ordering in the resulting key. ###
@new_key = ( db, phrasetype, sk, sv, ok, ov, idx ) ->
  throw new Error "illegal phrasetype: #{rpr phrasetype}" unless phrasetype in [ 'so', 'os', ]
  [ sk, sv, ok, ov, ] = [ ok, ov, sk, sv, ] if phrasetype is 'os'
  return [ phrasetype, sk, sv, ok, ov, ( idx ? 0 ), ]

#-----------------------------------------------------------------------------------------------------------
@new_so_key = ( db, P... ) -> @new_key db, 'so', P...
@new_os_key = ( db, P... ) -> @new_key db, 'os', P...

#-----------------------------------------------------------------------------------------------------------
@_new_os_key_from_so_key = ( db, so_key ) ->
  [ phrasetype, sk, sv, ok, ov, idx, ] = @normalize_key db, so_key
  throw new Error "expected phrasetype 'so', got #{rpr phrasetype}" unless phrasetype is 'so'
  return [ 'os', ok, ov, sk, sv, idx, ]

#-----------------------------------------------------------------------------------------------------------
@new_keys = ( db, phrasetype, sk, sv, ok, ov, idx ) ->
  other_phrasetype  = if phrasetype is 'so' then 'os' else 'so'
  return [
    ( @new_key db,       phrasetype, sk, sv, ok, ov, idx ),
    ( @new_key db, other_phrasetype, sk, sv, ok, ov, idx ), ]

#-----------------------------------------------------------------------------------------------------------
@normalize_key = ( db, key ) ->
  [ phrasetype, sk, sv, ok, ov, idx, ] = key
  [ sk, sv, ok, ov, ] = [ ok, ov, sk, sv, ] if phrasetype is 'os'
  return [ phrasetype, sk, sv, ok, ov, ( idx ? 0 ), ]

#-----------------------------------------------------------------------------------------------------------
@key_from_url = ( db, url ) ->
  ### TAIN does not unescape as yet ###
  ### TAIN does not cast values as yet ###
  ### TAINT does not support multiple indexes as yet ###
  [ phrasetype, first, second, idx, ] = url.split '|'
  unless phrasetype? and phrasetype.length > 0 and phrasetype in [ 'so', 'os', ]
    throw new Error "illegal URL key #{rpr url}"
  unless first? and first.length > 0 and second? and second.length > 0
    throw new Error "illegal URL key #{rpr url}"
  idx = if ( idx? and idx.length > 0 ) then ( parseInt idx, 10 ) else 0
  [ sk, sv, ] =  first.split ':'
  [ ok, ov, ] = second.split ':'
  unless sk? and sk.length > 0 and ok? and ok.length > 0
    throw new Error "illegal URL key #{rpr url}"
  [ sk, sv, ok, ov, ] = [ ok, ov, sk, sv, ] if phrasetype is 'os'
  return [ phrasetype, sk, sv, ok, ov, idx, ]

#-----------------------------------------------------------------------------------------------------------
@url_from_key = ( db, key ) ->
  if ( @_type_from_key db, key ) is 'list'
    [ phrasetype, k0, v0, k1, v1, idx, ] = key
    idx_rpr = if idx? then rpr idx else ''
    ### TAINT should escape metachrs `|`, ':' ###
    ### TAINT should use `rpr` on parts of speech (e.g. object value could be a number etc.) ###
    return "#{phrasetype}|#{k0}:#{v0}|#{k1}:#{v1}|#{idx_rpr}"
  return "#{rpr key}"

#-----------------------------------------------------------------------------------------------------------
@$url_from_key = ( db ) -> $ ( key, send ) => send @url_from_key db, key
@$key_from_url = ( db ) -> $ ( url, send ) => send @key_from_url db, key

#-----------------------------------------------------------------------------------------------------------
@_type_from_key = ( db, key ) ->
  if Array.isArray key
    throw new Error "illegal key: #{rpr key}" unless key.length is 6
    [ phrasetype, first, second, idx, ] = key
    throw new Error "illegal phrasetype: #{rpr key}" unless phrasetype in [ 'so', 'os', ]
    return 'list'
  return 'other'


#===========================================================================================================
# PREFIXES / QUERIES
#-----------------------------------------------------------------------------------------------------------
@new_query = ( db, hint ) ->
  switch type = CND.type_of hint
    when 'text'                   then return @_query_from_partial_url db, hint
    when 'list'                   then return @_query_from_partial_key db, hint
    when 'pod', 'HOLLERITH/query' then return LODASH.cloneDeep hint
  throw new Error "expected a partial URL (a text) or key (a list), got a #{type}"

#-----------------------------------------------------------------------------------------------------------
@_query_from_partial_url = ( db, purl ) ->
  [ phrasetype, tail, ] = purl.split '|', 2
  [ k0, v0, ]           = if tail? then ( tail.split ':', 2 ) else [ null, null, ]
  pkey                  = [ phrasetype, ]
  pkey.push k0 if k0?
  pkey.push v0 if v0?
  return @_query_from_partial_key db, pkey

#-----------------------------------------------------------------------------------------------------------
@_query_from_partial_key = ( db, pkey ) ->
  for element in pkey
    throw new Error "illegal prefix-key: #{rpr pkey}" unless CND.isa_text element
  base                = @_encode db, pkey
  length              = base.length
  throw new Error "illegal prefix-key: #{rpr pkey}" unless base[ length - 1 ] is 0x00
  throw new Error "illegal prefix-key: #{rpr pkey}" unless base[ length - 2 ] is 0x00
  base[ length - 2 ]  = 0xff
  gte                 = base.slice 0, length - 2
  lte                 = base.slice 0, length - 1
  return { gte, lte, }





