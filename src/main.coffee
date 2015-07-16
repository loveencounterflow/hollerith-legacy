

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
ƒ                         = CND.format_number.bind CND
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
$async                    = D.remit_async.bind D
_new_level_db             = require 'level'
leveldown                 = require 'level/node_modules/leveldown'
#...........................................................................................................
suspend                   = require 'coffeenode-suspend'
step                      = suspend.step
repeat_immediately        = suspend.repeat_immediately
#...........................................................................................................
@_LODASH                  = require 'lodash'


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
@new_db = ( route, settings ) ->
  ### TAINT we should force this operation to be asynchronous; otherwise, DB may not be writeable ###
  create_if_missing = settings?[ 'create' ] ? yes
  size              = settings?[ 'size'   ] ? 1e5
  #.........................................................................................................
  level_settings =
    'keyEncoding':          'binary'
    'valueEncoding':        'binary'
    'createIfMissing':      create_if_missing
    'errorIfExists':        no
    'compression':          yes
    'sync':                 no
  #.........................................................................................................
  substrate = _new_level_db route, level_settings, ( error ) ->
    if error?
      if error[ 'name' ] is 'OpenError'
        throw new Error "No database found at #{route} and no `create` setting given"
      throw error
  #.........................................................................................................
  R =
    '~isa':           'HOLLERITH/db'
    '%self':          substrate
    'size':           size
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

# #-----------------------------------------------------------------------------------------------------------
# @clear = ( db, handler ) ->
#   ASYNC = require 'async'
#   route = db[ '%self' ][ 'location' ]
#   tasks = []
#   #.........................................................................................................
#   tasks.push ( handler ) =>
#     whisper "closing DB..."
#     db[ '%self' ].close =>
#       whisper "ok"
#       handler()
#   #.........................................................................................................
#   tasks.push ( handler ) =>
#     whisper "erasing DB..."
#     leveldown.destroy route, =>
#       whisper "ok"
#       handler()
#   #.........................................................................................................
#   tasks.push ( handler ) =>
#     whisper "re-opening DB..."
#     db[ '%self' ].open =>
#       whisper "ok"
#       handler()
#   #.........................................................................................................
#   ASYNC.series tasks, ( error ) =>
#     return handler error if error?
#     whisper "erased and re-opened LevelDB at #{route}"
#     handler()


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
    return send.error new Error "invalid SPO key, must be list: #{rpr spo}" unless CND.isa_list spo
    return send.error new Error "invalid SPO key, must be of length 3: #{rpr spo}" unless spo.length is 3
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
    { $ensure_unique_spo, $load_bloom, $save_bloom, } = @_get_bloom_methods db
  #.........................................................................................................
  pipeline = []
  pipeline.push $load_bloom()         if ensure_unique
  pipeline.push $index()
  pipeline.push $encode()
  pipeline.push $ensure_unique_spo()  if ensure_unique
  pipeline.push $as_batch_entry()
  pipeline.push D.$batch batch_size
  pipeline.push $write()
  pipeline.push $save_bloom()         if ensure_unique
  #.........................................................................................................
  R.pipe D.combine pipeline...
  return R

#-----------------------------------------------------------------------------------------------------------
@_get_bloom_methods = ( db ) ->
  #---------------------------------------------------------------------------------------------------------
  entry_count           = 0
  false_positive_count  = 0
  bloom_settings        = size: db[ 'size' ] ? 1e5
  #---------------------------------------------------------------------------------------------------------
  show_bloom_info = =>
    CND.BLOOM.report db[ '%bloom' ]
  #---------------------------------------------------------------------------------------------------------
  $ensure_unique_spo = =>
    ### We skip all phrases except for SPO entries, the problem being that even IF some erroneous processing
    should result in bogus `[ 'pos', 'foo', 'bar', 'baz', ]` tuples, fact is that the object value of that
    bogus phrase gets right into the key—which may or may not be on record. In other words, you could still
    create millions of wrong entries like `[ 'pos', 'weighs', kgs, 'my-rabbit' ]` for non-existing (but in
    themselves, were those actually on record, repetitive) assertions like `[ 'spo', 'my-rabbit', 'weighs',
    kgs, ]` for any possible value of `kgs` without ever being caught by the no-duplicates restriction.

    It seems better to forgo this test as it only incurs a performance and space burden without being really
    helpful (a worthwhile alternative would be to check that for all SPO entries there are all the POS
    entries and that there are no extraneous POS entries, which is even more of a computational burden, but
    at least reaches a meaningful level of safety against malformed data. ###
    #.......................................................................................................
    return $async ( xphrase, done ) =>
      ### Skip if this is not a main entry to the DB: ###
      return done xphrase unless xphrase[ 0 ] is 'spo'
      key_bfr               = xphrase[ 1 ]
      bloom                 = db[ '%bloom' ]
      bloom_has_key         = CND.BLOOM.has bloom, key_bfr
      CND.BLOOM.add bloom, key_bfr
      entry_count          += +1
      return done xphrase unless bloom_has_key
      false_positive_count += +1
      #.....................................................................................................
      @has db, key_bfr, ( error, db_has_key ) =>
        return done.error error if error?
        return done.error new Error "phrase already in DB: #{rpr phrase}" if db_has_key
        done xphrase
  #---------------------------------------------------------------------------------------------------------
  $load_bloom = =>
    is_first = yes
    return $async ( data, done ) =>
      unless is_first
        return if data? then done data else done()
      #.....................................................................................................
      is_first = no
      whisper "loading Bloom filter..."
      #.....................................................................................................
      @_get_meta db, 'bloom', null, ( error, bloom_bfr ) =>
        return done.error error if error?
        if bloom_bfr is null
          warn 'no bloom filter found'
          bloom = CND.BLOOM.new_filter bloom_settings
        else
          bloom = CND.BLOOM.from_buffer bloom_bfr
        db[ '%bloom' ] = bloom
        whisper "...ok"
        show_bloom_info()
        return if data? then done data else done()
  #---------------------------------------------------------------------------------------------------------
  $save_bloom = =>
    return D.$on_end ( send, end ) =>
      whisper "saving Bloom filter..."
      bloom_bfr = CND.BLOOM.as_buffer db[ '%bloom' ]
      whisper "serialized bloom filter to #{ƒ bloom_bfr.length} bytes"
      show_bloom_info()
      #.....................................................................................................
      @_put_meta db, 'bloom', bloom_bfr, ( error ) =>
        return send.error error if error?
        whisper "...ok"
        end()
  #---------------------------------------------------------------------------------------------------------
  return { $ensure_unique_spo, $load_bloom, $save_bloom, }


#===========================================================================================================
# READING
#-----------------------------------------------------------------------------------------------------------
@create_phrasestream = ( db, query ) ->
  return @_create_phrasestream db, query

#-----------------------------------------------------------------------------------------------------------
@read_phrases = ( db, query, handler ) ->
  switch arity = arguments.length
    when 2
      handler   = query
      query     = null
    when 3
      null
    else
      throw new Error "expected 2 or 3 arguments, got #{arity}"
  return @_create_phrasestream db, query, handler

#-----------------------------------------------------------------------------------------------------------
@read_one_phrase = ( db, query, handler ) ->
  fallback = @_misfit
  #.........................................................................................................
  switch arity = arguments.length
    when 2
      handler   = query
      query     = null
    when 3
      null
    else
      throw new Error "expected 4 or 5 arguments, got #{arity}"
  #.........................................................................................................
  if query? and 'fallback' of query
    fallback = query[ 'fallback' ]
    delete query[ 'fallback' ]
  #.........................................................................................................
  @read_phrases db, query, ( error, phrases ) =>
    return handler error if error?
    return handler null, fallback if ( phrases.length is 0 ) and ( fallback isnt @_misfit )
    return handler new Error "expected 1 phrase, got #{phrases.length}" if phrases.length isnt 1
    handler null, phrases[ 0 ]

#-----------------------------------------------------------------------------------------------------------
@_create_phrasestream = ( db, query, handler ) ->
  input = @create_facetstream db, query
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
@create_facetstream = ( db, query ) ->
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
  if query?
    keys = Object.keys query
    switch arity = keys.length
      when 1
        switch key = keys[ 0 ]
          when 'prefix'
            lo_hint = query[ key ]
          when 'lo', 'prefix'
            throw new Error "illegal to specify `lo` but not `hi`"
            # lo_hint = query[ key ]
          when 'hi'
            throw new Error "illegal to specify `hi` but not `lo`"
            # hi_hint = query[ key ]
          else
            throw new Error "unknown hint key #{rpr key}"
      when 2
        keys.sort()
        if keys[ 0 ] is 'hi' and keys[ 1 ] is 'lo'
          lo_hint = query[ 'lo' ]
          hi_hint = query[ 'hi' ]
        else if keys[ 0 ] is 'prefix' and keys[ 1 ] is 'star'
          lo_hint = query[ 'prefix' ]
          hi_hint = query[ 'star' ]
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
  key_bfr = if CND.isa_jsbuffer then key else @_encode_key db, key
  db[ '%self' ].get key_bfr, ( error, obj_bfr ) =>
    if error?
      return handler null, false if error[ 'type' ] is 'NotFoundError'
      return handler error
    handler null, true


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
@as_phrase = ( db, key, value ) ->
  try
    switch phrasetype = key[ 0 ]
      when 'spo'
        throw new Error "illegal SPO key (length #{length})"  unless ( length = key.length ) is 3
        throw new Error "illegal value (A) #{rpr value}"      if value is undefined
        return [ phrasetype, key[ 1 ], key[ 2 ], value, ]
      when 'pos'
        throw new Error "illegal POS key (length #{length})"  unless 4 <= ( length = key.length ) <= 5
        throw new Error "illegal value (B) #{rpr value}"      unless ( value in [ undefined, null, ] )
        return [ phrasetype, key[ 1 ], key[ 2 ], key[ 3 ], key[ 4 ], ] if key[ 4 ]?
        return [ phrasetype, key[ 1 ], key[ 2 ], key[ 3 ],           ]
    throw new Error "unknown phrasetype #{rpr phrasetype}"
  catch error
    warn "detected problem with key #{rpr key}"
    warn "and/or value              #{rpr value}"
    throw error
#-----------------------------------------------------------------------------------------------------------
@normalize_phrase = ( db, phrase ) ->
  switch phrasetype = phrase[ 0 ]
    when 'spo'
      return phrase
    when 'pos'
      return [ 'spo', phrase[ 3 ], phrase[ 1 ], phrase[ 2 ], phrase[ 4 ], ] if phrase[ 4 ]?
      return [ 'spo', phrase[ 3 ], phrase[ 1 ], phrase[ 2 ],           ]
  throw new Error "unknown phrasetype #{rpr phrasetype}"

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
@as_url = ( db, key, value, settings ) ->
  key         = @_decode_key    db, key   if CND.isa_jsbuffer key
  value       = @_decode_value  db, value if CND.isa_jsbuffer value
  colors      = settings?[ 'colors' ] ? no
  I           = if colors then CND.darkgrey '|' else '|'
  E           = if colors then CND.darkgrey ':' else ':'
  # debug '©HDXXd', key
  # debug '©HDXXd', value
  # debug '©iU0gA', @as_phrase db, key, value
  # debug '©iU0gA', @normalize_phrase db, @as_phrase db, key, value
  [ phrasetype, tail..., ]  = key
  if phrasetype is 'spo'
    [ sbj, prd, ] = tail
    obj           = rpr value
    if colors
      phrasetype  = CND.grey      phrasetype
      sbj         = CND.RED       sbj
      prd         = CND.YELLOW    prd
      obj         = CND.GREEN     obj
      return phrasetype + I + sbj + I + prd + E + obj
    else
      return "spo|#{sbj}|#{prd}|"
  else
    [ prd, obj, sbj, idx, ] = tail
    idx_rpr = if idx? then rpr idx else ''
    if colors
      phrasetype  = CND.grey      phrasetype
      sbj         = CND.RED       sbj
      prd         = CND.YELLOW    prd
      obj         = CND.GREEN     obj
      return phrasetype + I + prd + E + obj + I + sbj
    else
      return "pos|#{prd}:#{obj}|#{sbj}|#{idx_rpr}"

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





