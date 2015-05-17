


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
CODEC                     = @CODEC = require './codec'
DUMP                      = @DUMP  = require './dump'
_codec_encode             = CODEC.encode.bind CODEC
_codec_decode             = CODEC.decode.bind CODEC
#...........................................................................................................
D                         = require 'pipedreams2'
$                         = D.remit.bind D
_new_level_db             = require 'level'
leveldown                 = require 'level/node_modules/leveldown'
#...........................................................................................................
suspend                   = require 'coffeenode-suspend'
step                      = suspend.step
repeat_immediately        = suspend.repeat_immediately
#...........................................................................................................
LODASH                    = require 'lodash'


#-----------------------------------------------------------------------------------------------------------
@phrasetypes      = [ 'pos', 'spo', ]
@_misfit          = Symbol 'misfit'
@_zero_value_bfr  = new Buffer 'null'
# warn "mind inconsistencies in HOLLERITH2/main @_zero_enc etc"
# @_zero            = true # ?????????????????????????????
# @_zero_enc        = _codec_encode [ @_zero,    ]
# @_lo_enc          = _codec_encode [ null,      ]
# @_hi_enc          = _codec_encode [ CODEC., ]
# @_last_octet      = new Buffer [ 0xff, ]

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
@$write = ( db, settings ) ->
  ### Expects a Hollerith DB object and an optional buffer size; returns a stream transformer that does all
  of the following:

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
  settings         ?= {}
  buffer_size       = settings[ 'batch'  ] ? 10000
  solid_predicates  = settings[ 'solids' ] ? []
  buffer            = []
  substrate         = db[ '%self' ]
  batch_count       = 0
  has_ended         = no
  _send             = null
  #.........................................................................................................
  throw new Error "buffer size must be positive integer, got #{rpr buffer_size}" unless buffer_size > 0
  #.........................................................................................................
  push = ( key, value ) =>
    value_bfr = if value? then @_encode_value db, value else @_zero_value_bfr
    buffer.push { type: 'put', key: ( @_encode_key db, key ), value: value_bfr, }
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
  return $ ( spo, send, end ) =>
    _send = send
    if spo?
      [ sbj, prd, obj, ] = spo
      push [ 'spo', sbj, prd, ], obj
      ### TAINT what to send, if anything? ###
      # send entry
      #.....................................................................................................
      if CND.isa_pod obj
        ### Do not create index entries in case `obj` is a POD: ###
        null
      #.....................................................................................................
      else if CND.isa_list obj
        if prd in solid_predicates
          push [ 'pos', prd, obj, sbj, ]
        else
          ### Create one index entry for each element in case `obj` is a list: ###
          for obj_element, obj_idx in obj
            push [ 'pos', prd, obj_element, sbj, obj_idx, ]
      #.....................................................................................................
      else
        ### Create one index entry for `obj` otherwise: ###
        push [ 'pos', prd, obj, sbj, ]
      #.....................................................................................................
      flush() if buffer.length >= buffer_size
    #.......................................................................................................
    ### Flush remaining buffered entries to DB ###
    if end?
      has_ended = yes
      flush()


#===========================================================================================================
# READING
# #-----------------------------------------------------------------------------------------------------------
# @create_keystream = ( db, lo_hint = null, hi_hint = null ) ->
#   ### TAINT code duplication ###
#   if lo_hint?
#     if hi_hint?
#       query = { gte: lo_hint, lte:hi_hint, }
#     else
#       query = { gte: lo_hint, }
#   else if hi_hint?
#     query = { lte: hi_hint, }
#   else
#     query = null
#   #.........................................................................................................
#   debug '©835JP', query
#   R = if query? then ( db[ '%self' ].createKeyStream query ) else db[ '%self' ].createKeyStream()
#   # R = db[ '%self' ].createKeyStream @new_query db, query
#   ### TAINT Should we test for well-formed entries here? ###
#   R = R.pipe $ ( bkey, send ) => send @_decode_key db, bkey
#   return R

#-----------------------------------------------------------------------------------------------------------
@create_phrasestream = ( db, lo_hint = null, hi_hint = null, settings ) ->
  input = @create_facetstream db, lo_hint, hi_hint, settings
  R = input
    .pipe @$as_phrase db
  R[ '%meta' ] = input[ '%meta' ]
  return R

#-----------------------------------------------------------------------------------------------------------
@create_facetstream = ( db, lo_hint = null, hi_hint = null, settings ) ->
  ###
  * If neiter `lo` nor `hi` is given, the stream will iterate over all entries.
  * If both `lo` and `hi` are given, a query with lower and upper, inclusive boundaries is
    issued.
  * If only `lo` is given, a prefix query is issued.
  * If `hi` is given but `lo` is missing, an error is issued.
  ###
  #.........................................................................................................
  if hi_hint? and not lo_hint?
    throw new Error "must give `lo_hint` when `hi_hint` is given"
  #.........................................................................................................
  if lo_hint? and not hi_hint?
    query       = @_query_from_prefix db, lo_hint
  #.........................................................................................................
  else if lo_hint? and hi_hint is '*'
    query       = @_query_from_prefix db, lo_hint, '*'
  #.........................................................................................................
  else
    lo_hint_bfr = if lo_hint? then (        @_encode_key db, lo_hint )          else null
    hi_hint_bfr = if hi_hint? then ( @_query_from_prefix db, hi_hint )[ 'lte' ] else null
    # lo_hint_bfr = if lo_hint? then (        @_encode_key db, lo_hint )          else CODEC[ 'keys' ][ 'lo' ]
    # hi_hint_bfr = if hi_hint? then ( @_query_from_prefix db, hi_hint )[ 'lte' ] else CODEC[ 'keys' ][ 'hi' ]
    query       = { gte: lo_hint_bfr, lte: hi_hint_bfr, }
  #.........................................................................................................
  ### TAINT Should we test for well-formed entries here? ###
  R = db[ '%self' ].createReadStream query
  R = R.pipe $ ( { key, value }, send ) => send [ ( @_decode_key db, key ), ( @_decode_value db, value ), ]
  R[ '%meta' ] = {}
  R[ '%meta' ][ 'query' ] = query
  #.........................................................................................................
  return R

#-----------------------------------------------------------------------------------------------------------
@read_many = ( db, hint = null ) ->
  ### Hints are interpreted as partial secondary (POS) keys. ###

#-----------------------------------------------------------------------------------------------------------
@read_one = ( db, key, fallback = @_misfit, handler ) ->
  ### Hints are interpreted as complete primary (SPO) keys. ###
  switch arity = arguments.length
    when 3
      handler   = fallback
      fallback  = @_misfit
    when 4 then null
    else throw new Error "expected 3 or 4 arguments, got #{arity}"
  #.........................................................................................................
  db[ '%self' ].get key, handler

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
  indexed           = settings?[ 'indexed'    ] ? no
  # transform         = settings?[ 'transform'  ] ? D.$pass_through()
  mangle            = settings?[ 'mangle'     ] ? ( data ) -> data
  send_empty        = settings?[ 'empty'      ] ? no
  insert_index      = if indexed then D.new_indexer() else ( x ) -> x
  open_stream_count = 0
  #.........................................................................................................
  return $ ( outer_data, outer_send, outer_end ) =>
    count = 0
    #.......................................................................................................
    if outer_data?
      open_stream_count    += +1
      sub_input             = read outer_data
      [ memo, sub_input, ]  = if CND.isa_list sub_input then sub_input else [ @_misfit, sub_input, ]
      sub_input
        # .pipe transform
        .pipe do =>
          ### TAINT no need to build buffer if not `send_empty` and there are no results ###
          buffer = if memo is @_misfit then [] else [ memo, ]
          return $ ( inner_data, _, inner_end ) =>
            if inner_data?
              inner_data = mangle inner_data
              if inner_data?
                count += +1
                buffer.push inner_data
            if inner_end?
              if send_empty or count > 0
                outer_send insert_index buffer
              open_stream_count += -1
              inner_end()
    #.......................................................................................................
    if outer_end?
      repeat_immediately ->
        return true unless open_stream_count is 0
        outer_end()
        return false


#===========================================================================================================
# KEYS & VALUES
#-----------------------------------------------------------------------------------------------------------
@_encode_key = ( db, key, extra_byte ) ->
  throw new Error "illegal key #{rpr key}" if key is undefined
  return _codec_encode key, extra_byte

#-----------------------------------------------------------------------------------------------------------
@_decode_key = ( db, key ) ->
  throw new Error "illegal key #{rpr key}" if ( R = _codec_decode key ) is undefined
  return R

#-----------------------------------------------------------------------------------------------------------
@_encode_value = ( db, value      ) -> JSON.stringify value
@_decode_value = ( db, value_bfr  ) -> JSON.parse     value_bfr.toString 'utf-8'

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
  [ phrasetype, sk, sv, ok, ov, idx, ] = @as_phrase db, so_key
  throw new Error "expected phrasetype 'so', got #{rpr phrasetype}" unless phrasetype is 'so'
  return [ 'os', ok, ov, sk, sv, idx, ]

#-----------------------------------------------------------------------------------------------------------
@new_keys = ( db, phrasetype, sk, sv, ok, ov, idx ) ->
  other_phrasetype  = if phrasetype is 'so' then 'os' else 'so'
  return [
    ( @new_key db,       phrasetype, sk, sv, ok, ov, idx ),
    ( @new_key db, other_phrasetype, sk, sv, ok, ov, idx ), ]

#-----------------------------------------------------------------------------------------------------------
@as_phrase = ( db, key, value, normalize = yes ) ->
  switch phrasetype = key[ 0 ]
    when 'spo'
      throw new Error "illegal SPO key (length #{length})" unless ( length = key.length ) is 3
      throw new Error "illegal value (1) #{rpr value}" if value in [ undefined, ]
      return [ phrasetype, key[ 1 ], key[ 2 ], value, ]
    when 'pos'
      throw new Error "illegal POS key (length #{length})" unless 4 <= ( length = key.length ) <= 5
      throw new Error "illegal value (2) #{rpr value}" if not ( value in [ null, ] )
      return [ phrasetype, key[ 3 ], key[ 1 ], key[ 2 ], key[ 4 ], ] if key[ 4 ]?
      return [ phrasetype, key[ 3 ], key[ 1 ], key[ 2 ], ]

#-----------------------------------------------------------------------------------------------------------
@$as_phrase = ( db ) ->
  return $ ( data, send ) =>
    send @as_phrase db, data...

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
    [ phrasetype, tail..., ] = key
    if phrasetype is 'spo'
      [ sbj, prd, ] = tail
      return "spo|#{sbj}|#{prd}|"
    else
      [ prd, obj, sbj, idx, ] = tail
      idx_rpr = if idx? then rpr idx else ''
      return "pos|#{prd}:#{obj}|#{sbj}|#{idx_rpr}"
  return "#{rpr key}"

#-----------------------------------------------------------------------------------------------------------
@$url_from_key = ( db ) -> $ ( key, send ) => send @url_from_key db, key
@$key_from_url = ( db ) -> $ ( url, send ) => send @key_from_url db, key

#-----------------------------------------------------------------------------------------------------------
@_type_from_key = ( db, key ) ->
  if Array.isArray key
    # throw new Error "illegal key: #{rpr key}" unless key.length is 6
    throw new Error "illegal phrasetype: #{rpr key}" unless key[ '0' ] in @phrasetypes
    return 'list'
  return 'other'


#===========================================================================================================
# PREFIXES & QUERIES
#-----------------------------------------------------------------------------------------------------------
@_query_from_prefix = ( db, lo_hint, star ) ->
  #.........................................................................................................
  if star?
    ### 'Asterisk' encoding: partial key segments match ###
    gte   = @_encode_key db, lo_hint
    lte   = @_encode_key db, lo_hint
    lte[ lte.length - 1 ] = CODEC[ 'typemarkers'  ][ 'hi' ]
  #.........................................................................................................
  else
    ### 'Classical' encoding: only full key segments match ###
    base  = @_encode_key db, lo_hint, CODEC[ 'typemarkers'  ][ 'hi' ]
    gte   = base.slice 0, base.length - 1
    lte   = base.slice 0, base.length
  return { gte, lte, }





