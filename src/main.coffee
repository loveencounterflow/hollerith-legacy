

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
# METADATA
#-----------------------------------------------------------------------------------------------------------
@_put_meta = ( db, name, value, handler ) ->
  ### TAINT should use own type for metadata ###
  key_bfr   = @_encode_key db, [ 'meta', name, ]
  value_bfr = if CND.isa_jsbuffer then value else @_encode_value db, value
  db[ '%self' ].put key_bfr, value_bfr, ( error ) => handler error if handler?

#-----------------------------------------------------------------------------------------------------------
@_get_meta = ( db, name, fallback, handler ) ->
  switch arity = arguments.length
    when 3
      handler   = fallback
      fallback  = @_misfit
    when 4
      null
    else
      throw new Error "expected 3 or 4 arguments, got #{arity}"
  #.........................................................................................................
  key_bfr = @_encode_key db, [ 'meta', name, ]
  db[ '%self' ].get key_bfr, ( error, value ) =>
    if error?
      return handler null, fallback if ( error[ 'type' ] is 'NotFoundError' ) and ( fallback isnt @_misfit )
      return handler error
    handler null, value

#-----------------------------------------------------------------------------------------------------------
@_is_meta = ( db, key_bfr ) -> ( ( key_bfr.slice 0, @_meta_prefix.length ).compare @_meta_prefix ) is 0

### TAINT must derive meta key prefix from result of `_put_meta` ###
@_meta_prefix = new Buffer [ 0x54, 0x6d, 0x65, 0x74, 0x61, 0x00, ]


#===========================================================================================================
# WRITING
#-----------------------------------------------------------------------------------------------------------
@$write = ( db, settings ) ->
  ### TAINT currently loading and saving bloom filter each time a pipeline with `$write` is run ###
  #.........................................................................................................
  settings         ?= {}
  ### Superficial experiments show that a much bigger batch size than 1'000 does not tend to improve
  throughput; therefore, in order to reduce memory footprint, it seems advisable to leave batch size
  in the order of around a thousand entries. ###
  batch_size        = settings[ 'batch'  ] ? 1000
  solid_predicates  = settings[ 'solids' ] ? []
  ensure_unique     = settings[ 'unique' ] ? true
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
  if ensure_unique
    { $ensure_unique, $load_bloom, $save_bloom, } = @_get_bloom_methods db
  #.........................................................................................................
  pipeline = []
  pipeline.push $load_bloom()     if ensure_unique
  pipeline.push $index()
  pipeline.push $encode()
  pipeline.push $ensure_unique()  if ensure_unique
  pipeline.push $as_batch_entry()
  pipeline.push D.$batch batch_size
  pipeline.push $write()
  pipeline.push $save_bloom()     if ensure_unique
  #.........................................................................................................
  R.pipe D.combine pipeline...
  return R

#-----------------------------------------------------------------------------------------------------------
@_get_bloom_methods = ( db ) ->
  #---------------------------------------------------------------------------------------------------------
  db_size           = db[ 'size' ] ? 1e6
  db_size           = db[ 'size' ] ? 10
  db_size           = db[ 'size' ] ? 1e4
  bloom_error_rate  = 0.1
  #.........................................................................................................
  BSON = ( require 'bson' ).BSONPure.BSON
  njs_fs = require 'fs'
  #.........................................................................................................
  BLOEM             = require 'bloem'
  bloem_settings    =
    initial_capacity:   db_size * 3
    scaling:            2
    ratio:              0.1
  #---------------------------------------------------------------------------------------------------------
  show_bloom_info = =>
    bloom       = db[ '%bloom' ]
    filters     = bloom[ 'filters' ]
    filter_size = 0
    ƒ           = CND.format_number
    for filter in filters
      filter_size += filter[ 'filter' ][ 'bitfield' ][ 'buffer' ].length
    whisper "scalable Bloom filter size: #{ƒ filter_size} bytes"
  #---------------------------------------------------------------------------------------------------------
  $ensure_unique = =>
    return D.$map ( phrase, handler ) =>
      bloom               = db[ '%bloom' ]
      ### >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ###
      [ sbj, prd, obj, ]  = phrase
      key                 = [ 'spo', sbj, prd, ]
      key_bfr             = key.join '|'
      ### >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ###
      bloom_has_key       = bloom.has key_bfr
      bloom.add key_bfr
      return handler null, phrase unless bloom_has_key
      #.....................................................................................................
      @has db, key, ( error, db_has_key ) =>
        return handler error if error?
        return handler new Error "phrase already in DB: #{rpr phrase}" if db_has_key
        handler null, phrase
  #---------------------------------------------------------------------------------------------------------
  $load_bloom = =>
    is_first = yes
    return D.$map ( data, handler ) =>
      unless is_first
        return if data? then handler null, data else handler()
      #.....................................................................................................
      is_first = no
      whisper "loading Bloom filter..."
      #.....................................................................................................
      @_get_meta db, 'bloom', null, ( error, bloom_bfr ) =>
        return handler error if error?
        if bloom_bfr is null
          warn 'no bloom filter found'
          bloom = new BLOEM.ScalingBloem bloom_error_rate, bloem_settings
        else
          bloom_data = BSON.deserialize bloom_bfr
          ### TAINT see https://github.com/wiedi/node-bloem/issues/5 ###
          for filter in bloom_data[ 'filters' ]
            bitfield              = filter[ 'filter' ][ 'bitfield' ]
            bitfield[ 'buffer' ]  = bitfield[ 'buffer' ][ 'buffer' ]
          bloom = BLOEM.ScalingBloem.destringify bloom_data
        db[ '%bloom' ] = bloom
        whisper "...ok"
        show_bloom_info()
        return if data? then handler null, data else handler()
  #---------------------------------------------------------------------------------------------------------
  $save_bloom = =>
    return D.$on_end ( send, end ) =>
      whisper "saving Bloom filter..."
      bloom     = db[ '%bloom' ]
      bloom_bfr = BSON.serialize bloom
      #.....................................................................................................
      @_put_meta db, 'bloom', bloom_bfr, ( error ) =>
        return send.error error if error?
        whisper "...ok"
        end()
  #---------------------------------------------------------------------------------------------------------
  return { $ensure_unique, $load_bloom, $save_bloom, }


#===========================================================================================================
# READING
#-----------------------------------------------------------------------------------------------------------
@create_phrasestream = ( db, settings ) ->
  return @_create_phrasestream db, settings

#-----------------------------------------------------------------------------------------------------------
@read_phrases = ( db, settings, handler ) ->
  switch arity = arguments.length
    when 2
      handler   = settings
      settings  = null
    when 3
      null
    else
      throw new Error "expected 4 or 5 arguments, got #{arity}"
  return @_create_phrasestream db, settings, handler

#-----------------------------------------------------------------------------------------------------------
@read_one_phrase = ( db, settings, handler ) ->
  fallback = @_misfit
  #.........................................................................................................
  switch arity = arguments.length
    when 2
      handler   = settings
      settings  = null
    when 3
      null
    else
      throw new Error "expected 4 or 5 arguments, got #{arity}"
  #.........................................................................................................
  if settings? and 'fallback' of settings
    fallback = settings[ 'fallback' ]
    delete settings[ 'fallback' ]
  #.........................................................................................................
  @read_phrases db, settings, ( error, phrases ) =>
    return handler error if error?
    return handler null, fallback if ( phrases.length is 0 ) and ( fallback isnt @_misfit )
    return handler new Error "expected single phrase, got #{phrases.length}" if phrases.length isnt 1
    handler null, phrases[ 0 ]

#-----------------------------------------------------------------------------------------------------------
@_create_phrasestream = ( db, settings, handler ) ->
  input = @create_facetstream db, settings
  R = input.pipe @$as_phrase db
  if handler?
    R = R
      .pipe D.$collect()
      .pipe $ ( data, send ) =>
        handler null, data
    R.on 'error', ( error ) => handler error
  R[ '%meta' ] = input[ '%meta' ]
  return R

#-----------------------------------------------------------------------------------------------------------
@create_facetstream = ( db, settings ) ->
  ###
  * If none of `lo`, `hi` or 'prefix' are given, the stream will iterate over all entries.
  * If both `lo` and `hi` are given, a query with lower and upper, inclusive boundaries (in LevelDB these
    are called `gte` and `lte`, repsectively) is issued.
  * If only `prefix` is given, a prefix query is issued. Prefix queries may be 'exclusive' or 'inclusive'.
    Exclusive prefixes match the list elements that make up the HOLLERITH entry keys in a component-wise
    fashion, while inclusive queries also match when the last prefix element is the start of the
    corresponding component of the entry key. For example, `{ prefix: [ 'pos', 'shape', ] }` will match
    only entries whose first two key elements are `'pos'` and `'shape'`, while a query using
    `{ prefix: [ 'pos', 'shape', ], star: '*', }` will additionally match entries with such keys as
    `[ 'pos', 'shapeclass', ]` and `[ 'pos', 'shape/strokeorder', ]`.
  * If only `lo` or only `hi` is given, an error is issued.
  ###
  lo_hint = null
  hi_hint = null
  #.........................................................................................................
  if settings?
    keys = Object.keys settings
    switch arity = keys.length
      when 1
        switch key = keys[ 0 ]
          when 'prefix'
            lo_hint = settings[ key ]
          when 'lo', 'prefix'
            throw new Error "illegal to specify `lo` but not `hi`"
            # lo_hint = settings[ key ]
          when 'hi'
            throw new Error "illegal to specify `hi` but not `lo`"
            # hi_hint = settings[ key ]
          else
            throw new Error "unknown hint key #{rpr key}"
      when 2
        keys.sort()
        if keys[ 0 ] is 'hi' and keys[ 1 ] is 'lo'
          lo_hint = settings[ 'lo' ]
          hi_hint = settings[ 'hi' ]
        else if keys[ 0 ] is 'prefix' and keys[ 1 ] is 'star'
          lo_hint = settings[ 'prefix' ]
          hi_hint = settings[ 'star' ]
          throw new Error "expected `star` to be '*', got #{rpr hi_hint}" unless hi_hint is '*'
        else
          throw new Error "illegal hint keys #{rpr keys}"
      else
        throw new Error "illegal hint arity #{rpr arity}"
  #.........................................................................................................
  # debug '©KaWp7', lo_hint, hi_hint
  return @_create_facetstream db, lo_hint, hi_hint

#-----------------------------------------------------------------------------------------------------------
@_create_facetstream = ( db, lo_hint = null, hi_hint = null ) ->
  ### TAINT `lo_hint` and `hi_hint` should be called `first` and `second` ###
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
  #.........................................................................................................
  R = R.pipe $ ( { key, value }, send ) =>
    unless @_is_meta db, key
      send [ ( @_decode_key db, key ), ( @_decode_value db, value ), ]
  #.........................................................................................................
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
  ### TAINT does not unescape as yet ###
  ### TAINT does not cast values as yet ###
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
@_query_from_prefix = ( db, prefix, star ) ->
  if star?
    ### 'Asterisk' encoding: partial key segments match ###
    gte   = @_encode_key db, prefix
    lte   = @_encode_key db, prefix
    lte[ lte.length - 1 ] = CODEC[ 'typemarkers'  ][ 'hi' ]
  #.........................................................................................................
  else
    ### 'Classical' encoding: only full key segments match ###
    base  = @_encode_key db, prefix, CODEC[ 'typemarkers'  ][ 'hi' ]
    gte   = base.slice 0, base.length - 1
    lte   = base.slice 0, base.length
  #.........................................................................................................
  return { gte, lte, }





