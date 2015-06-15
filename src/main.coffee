


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
#...........................................................................................................
### https://github.com/b3nj4m/bloom-stream ###
Bloom                     = require 'bloom-stream'


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
    'createIfMissing':      yes
    'errorIfExists':        no
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
    whisper "closing DB"
    yield db[ '%self' ].close resume
    # whisper "erasing DB"
    yield leveldown.destroy route, resume
    # whisper "re-opening DB"
    yield db[ '%self' ].open resume
    whisper "erased and re-opened LevelDB at #{route}"
    handler null


#===========================================================================================================
# WRITING
#-----------------------------------------------------------------------------------------------------------
@$write = ( db, settings ) ->
  #.........................................................................................................
  settings         ?= {}
  ### Superficial experiments show that a much bigger batch size than 1'000 does not tend to improve
  throughput; therefore, in order to reduce memory footprint, it seems advisable to leave batch size
  in the order of around a thousand entries. ###
  batch_size        = settings[ 'batch'  ] ? 1000
  solid_predicates  = settings[ 'solids' ] ? []
  substrate         = db[ '%self' ]
  R                 = D.create_throughstream()
  #.........................................................................................................
  $index = => $ ( spo, send ) =>
    ### Analyze SPO key and send all necessary POS facets: ###
    [ sbj, prd, obj, ] = spo
    send [ [ 'spo', sbj, prd, ], obj, ]
    obj_type = CND.type_of obj
    #.......................................................................................................
    unless obj_type is 'pod'
      #.....................................................................................................
      if ( obj_type is 'list' ) and not ( prd in solid_predicates )
        for obj_element, obj_idx in obj
          send [ [ 'pos', prd, obj_element, sbj, obj_idx, ], ]
      #.....................................................................................................
      else
        send [ [ 'pos', prd, obj, sbj, ], ]
  #.........................................................................................................
  $encode = => $ ( facet, send ) =>
    [ key, value, ] = facet
    phrasetype      = key[ 0 ]
    key_bfr         = @_encode_key db, key
    value_bfr       = if value? then @_encode_value db, value else @_zero_value_bfr
    send [ phrasetype, key_bfr, value_bfr, ]
  #.........................................................................................................
  $as_batch_entry = => $ ( facet_bfr_plus, send ) =>
    [ phrasetype, key_bfr, value_bfr, ] = facet_bfr_plus
    send type: 'put', key: key_bfr, value: value_bfr
  #.........................................................................................................
  $write = => $ ( batch, send ) =>
    substrate.batch batch
  #.........................................................................................................
  R
    .pipe $index()
    .pipe $encode()
    .pipe $as_batch_entry()
    .pipe D.$batch batch_size
    .pipe $write()
  #.........................................................................................................
  return R

#===========================================================================================================
# READING
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
@has = ( db, key, handler ) ->
  key_bfr = @_encode_key db, key
  db[ '%self' ].get key_bfr, ( error, obj_bfr ) =>
    if error?
      return handler null, false if error[ 'type' ] is 'NotFoundError'
      return handler error
    handler null, true

#-----------------------------------------------------------------------------------------------------------
@ensure_new_key = ( db, key, handler ) ->
  key_bfr = @_encode_key db, key
  db[ '%self' ].get key_bfr, ( error, obj_bfr ) =>
    if error?
      return handler null if error[ 'type' ] is 'NotFoundError'
      return handler error
    obj = @_decode_value obj_bfr
    handler new Error "key #{rpr key} already in DB with value #{rpr obj}"

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
@_encode_value = ( db, value      ) -> new Buffer ( JSON.stringify value ), 'utf-8'
@_decode_value = ( db, value_bfr  ) -> JSON.parse value_bfr.toString 'utf-8'

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





