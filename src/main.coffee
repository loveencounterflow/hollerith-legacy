

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
CODEC                     = @CODEC = require 'hollerith-codec'
DUMP                      = @DUMP  = require './dump'
_codec_encode             = CODEC.encode.bind CODEC
_codec_encode_plus_tm_hi  = CODEC.encode_plus_hi.bind CODEC
_codec_decode             = CODEC.decode.bind CODEC
#...........................................................................................................
D                         = require 'pipedreams'
$                         = D.remit.bind D
$async                    = D.remit_async.bind D
_new_level_db             = require 'level'
leveldown                 = require 'leveldown'
#...........................................................................................................
step                      = ( require 'coffeenode-suspend' ).step


#-----------------------------------------------------------------------------------------------------------
@phrasetypes      = [ 'pos', 'spo', ]
@_misfit          = Symbol 'misfit'
@_zero_value_bfr  = new Buffer '\x00'
# warn "mind inconsistencies in HOLLERITH2/main @_zero_enc etc"
# @_zero            = true # ?????????????????????????????
# @_zero_enc        = _codec_encode [ @_zero,    ]
# @_lo_enc          = _codec_encode [ null,      ]
# @_hi_enc          = _codec_encode [ CODEC., ]
# @_last_octet      = new Buffer [ 0xff, ]

#-----------------------------------------------------------------------------------------------------------
@new_db = ( route, settings ) ->
  ### TAINT we should force this operation to be asynchronous; otherwise, DB may not be writeable ###
  create_if_missing = settings?[ 'create'   ] ? yes
  size              = settings?[ 'size'     ] ? 1e5
  encoder           = settings?[ 'encoder'  ] ? null
  decoder           = settings?[ 'decoder'  ] ? null
  #.........................................................................................................
  level_settings =
    'keyEncoding':          'binary'
    'valueEncoding':        'binary'
    'createIfMissing':      create_if_missing
    'errorIfExists':        no
    'compression':          yes
    'sync':                 no
  #.........................................................................................................
  ( require 'mkdirp' ).sync route if create_if_missing
  #.........................................................................................................
  substrate = _new_level_db route, level_settings, ( error ) ->
    if error?
      if error[ 'name' ] is 'OpenError'
        ### TAINT error also thrown with misleading message if route doesn't exist up the penultimate term ###
        throw new Error "No database found at #{route} and no `create` setting given"
      throw error
  #.........................................................................................................
  R =
    '~isa':           'HOLLERITH/db'
    '%self':          substrate
    'size':           size
    'encoder':        encoder
    'decoder':        decoder
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
  # ### TAINT currently loading and saving bloom filter each time a pipeline with `$write` is run ###
  #.........................................................................................................
  settings         ?= {}
  ### Superficial experiments show that a much bigger batch size than 1'000 does not tend to improve
  throughput; therefore, in order to reduce memory footprint, it seems advisable to leave batch size
  in the order of around a thousand entries. ###
  batch_size        = settings[ 'batch'  ] ? 1000
  solid_predicates  = settings[ 'solids' ] ? []
  loner_predicates  = settings[ 'loners' ] ? []
  ensure_unique     = settings[ 'unique' ] ? true
  substrate         = db[ '%self' ]
  R                 = D.create_throughstream()
  batch_written     = null
  #.........................................................................................................
  is_integer = ( x ) -> ( x? ) and ( x is parseInt x )
  #.........................................................................................................
  $index = => $ ( spo, send ) =>
    index_only = no
    if spo[ 0 ] is Symbol.for 'index'
      spo.shift()
      index_only = yes
    [ sbj, prd, idx, obj, ]   = spo
    @validate_spo spo
    sbj                       = [ sbj, ]        unless CND.isa_list sbj
    [ obj, idx, ]             = [ idx, null, ]  unless obj?
    send [ 'spo', sbj, prd,  idx, obj,      ]   unless index_only
    send [ 'pos',      prd,  idx, obj, sbj, ]
    ### For each phrase that has an integer index, we store a second phrase with the index field
    set to `null` to enable queries for object values at any index. Note that as a matter of course,
    phrases with duplicate object values (which would differ solely by index) will thereby be
    conflated; in other words, this step turns lists into sets. ###
    ### TAINT the `is_integer` function should be configurable with the `settings` object and
    be more generally named sth like `use default index` or somesuch. (???) ###
    send [ 'pos',      prd, null, obj, sbj, ] if is_integer idx
  #.........................................................................................................
  $encode = => $ ( longphrase, send ) =>
    send type: 'put', key: ( @_encode_key db, longphrase ), value: @_zero_value_bfr
  #.........................................................................................................
  $write = => $ ( batch, send ) =>
    substrate.batch batch
    batch_written()
    send batch
  #.........................................................................................................
  if ensure_unique
    throw new Error "`unique` setting currently not supported"
    # { batch_written, $ensure_unique_sp, $load_bloom, $save_bloom, } = @_get_bloom_methods db
  else
    batch_written = ->
  #.........................................................................................................
  pipeline = []
  # pipeline.push $load_bloom()         if ensure_unique
  # pipeline.push @$validate_spo()
  # pipeline.push $ensure_unique_sp()   if ensure_unique
  pipeline.push $index()
  pipeline.push $encode()
  pipeline.push D.$batch batch_size
  pipeline.push $write()
  # pipeline.push $save_bloom()         if ensure_unique
  #.........................................................................................................
  R = R.pipe D.combine pipeline...
  return R

#-----------------------------------------------------------------------------------------------------------
@validate_spo = ( spo ) ->
  ### Do a shallow sanity check to see whether `spo` is a triplet. ###
  throw new Error "invalid SPO key, must be list: #{rpr spo}"             unless CND.isa_list spo
  throw new Error "invalid SPO key, must be of length 3 or 4: #{rpr spo}" unless 3 <= spo.length <= 4
  return null

#-----------------------------------------------------------------------------------------------------------
@$validate_spo = ->
  ### Do a shallow sanity check to see whether all incoming data are triplets. ###
  return $ ( spo, send ) =>
    ### Analyze SPO key and send all necessary POS facets: ###
    try
      @validate_spo spo
    catch error
      return send.error error
      # throw error
    send spo

### TAINT under revision
#-----------------------------------------------------------------------------------------------------------
@_get_bloom_methods = ( db ) ->
  #---------------------------------------------------------------------------------------------------------
  bloom_settings        = size: db[ 'size' ] ? 1e5
  seen                  = {}
  #---------------------------------------------------------------------------------------------------------
  batch_written = ->
    seen = {}
  #---------------------------------------------------------------------------------------------------------
  show_bloom_info = =>
    CND.BLOOM.report db[ '%bloom' ]
  #---------------------------------------------------------------------------------------------------------
  $ensure_unique_sp = =>
    #.......................................................................................................
    return $async ( spo, done ) =>
      [ sbj, prd, _, ]      = spo
      key                   = [ sbj, prd, ]
      key_bfr               = CODEC.encode key
      key_txt               = key_bfr.toString 'hex'
      bloom                 = db[ '%bloom' ]
      seen_has_key          = seen[ key_txt ]?
      bloom_has_key         = CND.BLOOM.has bloom, key_bfr
      #.....................................................................................................
      if seen_has_key
        warn key
        return done.error new Error "S/P pair already in DB: #{rpr key}"
      #.....................................................................................................
      seen[ key_txt ] = 1
      CND.BLOOM.add bloom, key_bfr
      #.....................................................................................................
      return done spo unless bloom_has_key
      #.....................................................................................................
      @has_any db, { prefix: [ 'spo', sbj, prd, ], }, ( error, db_has_key ) =>
        return done.error error if error?
        if db_has_key
          return done.error new Error "S/P pair already in DB: #{rpr key}"
        done spo
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
    return $ ( data, send, end ) =>
      send data if data?
      if end?
        if db[ '%bloom' ]?
          whisper "saving Bloom filter..."
          bloom_bfr = CND.BLOOM.as_buffer db[ '%bloom' ]
          whisper "serialized bloom filter to #{ƒ bloom_bfr.length} bytes"
          show_bloom_info()
          #.................................................................................................
          @_put_meta db, 'bloom', bloom_bfr, ( error ) =>
            return send.error error if error?
            whisper "...ok"
            end()
        else
          whisper "no data written, no Bloom filter to save"
  #---------------------------------------------------------------------------------------------------------
  return { batch_written, $ensure_unique_sp, $load_bloom, $save_bloom, }
###

#===========================================================================================================
# HIGHER-ORDER INDEXING
#-----------------------------------------------------------------------------------------------------------
@$index = ( descriptions ) =>
  ### TAINT For the time being, we only support secondary indexes, and the implementation is not at all
  written in a generic fashion. A future version will likely support tertiary indexes, but that will
  necessitate waiting for the end of the write stream and re-reading all the records. ###
  predicates      = []
  predicate_count = 0
  arities         = []
  phrases         = []
  phrase_counts   = {}
  #.........................................................................................................
  for predicate, arity of descriptions
    predicate_count += +1
    unless arity in [ 'singular', 'plural', ]
      throw new Error "expected 'singular' or 'plural' for arity, got #{rpr arity}"
    predicates.push   predicate
    phrases.push      {}
    arities.push      arity
  #.........................................................................................................
  if predicate_count.length < 2
    throw new Error "expected at least two predicate descriptions, got #{predicates.length}"
  if predicate_count.length > 2
    throw new Error "indexes with more than 2 steps not supported yet"
  #.........................................................................................................
  new_index_phrase = ( tsbj, tprd, tobj, fprd, fobj, tsbj_is_list, idx = 0 ) =>
    return [ [ tsbj..., tprd, idx, tobj, ], fprd, fobj, ] if tsbj_is_list
    return [ [ tsbj,    tprd, idx, tobj, ], fprd, fobj, ]
  #.........................................................................................................
  link = ( phrases ) =>
    throw new Error "indexes with anything but 2 steps not supported yet" if phrases.length != 2
    [ from_phrase, to_phrase, ] = phrases
    [ fsbj, fprd, fobj, ]       = from_phrase
    [ tsbj, tprd, tobj, ]       =   to_phrase
    tsbj_is_list                = CND.isa_list tsbj
    from_is_plural              = arities[ 0 ] is 'plural'
    to_is_plural                = arities[ 1 ] is 'plural'
    #.......................................................................................................
    unless from_is_plural or to_is_plural
      return [ new_index_phrase tsbj, tprd, tobj, fprd, fobj, tsbj_is_list ]
    #.......................................................................................................
    idx = -1
    R   = []
    if from_is_plural
      if to_is_plural
        for sub_fobj in fobj
          for sub_tobj in tobj
            idx += +1
            R.push new_index_phrase tsbj, tprd, sub_tobj, fprd, sub_fobj, tsbj_is_list, idx
      else
        for sub_fobj in fobj
          idx += +1
          R.push new_index_phrase tsbj, tprd, tobj, fprd, sub_fobj, tsbj_is_list, idx
    else
      for sub_tobj in tobj
        idx += +1
        R.push new_index_phrase tsbj, tprd, sub_tobj, fprd, fobj, tsbj_is_list, idx
    #.......................................................................................................
    return R
  #.........................................................................................................
  return $ ( phrase, send ) =>
    send phrase
    [ sbj, prd, obj, ] = phrase
    return unless ( prd_idx = predicates.indexOf prd ) >= 0
    sbj_txt                       = JSON.stringify sbj
    phrase_target                 = phrases[ sbj_txt]?= []
    phrase_target[ prd_idx ]      = phrase
    phrase_counts[ sbj_txt ]      = ( phrase_counts[ sbj_txt ] ? 0 ) + 1
    return null if phrase_counts[ sbj_txt ] < predicate_count
    #.......................................................................................................
    send index_phrase for index_phrase in link phrases[ sbj_txt ]
    return null


#===========================================================================================================
# READING
#-----------------------------------------------------------------------------------------------------------
@create_phrasestream = ( db, query ) ->
  R = @_create_phrasestream db, query
  # if query[ 'spo' ]
  #   R = R.pipe $ ( phrase, send ) =>
  #     [ phrasetype, tail..., ] = phrase
  #     return send tail if phrasetype is 'spo'
  #     [ prd, obj, sbj, idx, ] = tail
  return R

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
  input = @create_longphrasestream db, query
  R = input.pipe @$longphrase_as_phrase db
  if handler?
    R = R
      .pipe D.$collect()
      .pipe $ ( data, send ) =>
        handler null, data
    R.on 'error', ( error ) => handler error
  R[ '%meta' ] = input[ '%meta' ]
  return R

#-----------------------------------------------------------------------------------------------------------
@create_longphrasestream = ( db, query ) ->
  ###
  * If none of `lo`, `hi` or 'prefix' are given, the stream will iterate over all entries.
  * If both `lo` and `hi` are given, a query with lower and upper, inclusive boundaries (in LevelDB these
    are called `gte` and `lte`, respectively) is issued.
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
  return @_create_longphrasestream db, lo_hint, hi_hint

#-----------------------------------------------------------------------------------------------------------
@_create_longphrasestream = ( db, lo_hint = null, hi_hint = null ) ->
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
    query       = { gte: lo_hint_bfr, lte: hi_hint_bfr, }
  #.........................................................................................................
  R = db[ '%self' ].createKeyStream query
  #.........................................................................................................
  ### TAINT decoding transfrom should be made public ###
  R = R.pipe $ ( key, send ) => send @_decode_key db, key unless @_is_meta db, key
  #.........................................................................................................
  R[ '%meta' ] = {}
  R[ '%meta' ][ 'query' ] = query
  #.........................................................................................................
  return R

#-----------------------------------------------------------------------------------------------------------
@has = ( db, key, handler ) ->
  key_bfr = if CND.isa_jsbuffer then key else @_encode_key db, key
  #.........................................................................................................
  db[ '%self' ].get key_bfr, ( error, obj_bfr ) =>
    if error?
      return handler null, false if error[ 'type' ] is 'NotFoundError'
      return handler error
    handler null, true
  #.........................................................................................................
  return null

#-----------------------------------------------------------------------------------------------------------
@has_any = ( db, query, handler ) ->
  input   = @create_longphrasestream db, query
  active  = yes
  #.........................................................................................................
  input
    .pipe $ ( data, send, end ) =>
      if data?
        active = no
        input.destroy()
        handler null, true
      if end?
        handler null, false if active?
        end()
  #.........................................................................................................
  return null

#===========================================================================================================
# KEYS & VALUES
#-----------------------------------------------------------------------------------------------------------
@_encode_key = ( db, key, plus_tm_hi ) ->
  throw new Error "illegal key #{rpr key}" if key is undefined
  return _codec_encode_plus_tm_hi key, db[ 'encoder' ] if plus_tm_hi
  return _codec_encode            key, db[ 'encoder' ]

#-----------------------------------------------------------------------------------------------------------
@_decode_key = ( db, key ) ->
  R = _codec_decode key, db[ 'decoder' ]
  throw new Error "illegal key #{rpr key}" if R is undefined
  return R

#-----------------------------------------------------------------------------------------------------------
@longphrase_as_phrase = ( db, longphrase ) ->
  try
    [ phrasetype, tail..., ]  = longphrase
    unless ( tail_length = tail.length ) is 4
      throw new Error "illegal phrase #{rpr phrase} of length #{tail_length + 1}"
    switch phrasetype
      when 'spo' then [ sbj, prd, idx, obj,      ] = tail
      when 'pos' then [      prd, idx, obj, sbj, ] = tail
      else throw new Error "unknown phrasetype #{rpr phrasetype}"
    switch sbj_length = sbj.length
      when 1 then sbj = sbj[ 0 ]
      when 0 then throw new Error "subject can't be empty; read phrase #{rpr longphrase}"
    if phrasetype is 'spo'
      return [ 'spo', sbj, prd, idx, obj, ]
    return [ 'pos', prd, idx, obj, sbj, ]
  catch error
    warn "detected problem with phrase #{rpr longphrase}"
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
@$longphrase_as_phrase = ( db ) -> $ ( key, send ) => send @longphrase_as_phrase db, key

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
    # else
    #   return "spo|#{sbj}|#{prd}|"
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
### TAINT should be public ###
@_query_from_prefix = ( db, prefix, star ) ->
  if star?
    ### 'Asterisk' encoding: partial key segments match ###
    gte   = @_encode_key db, prefix
    lte   = @_encode_key db, prefix, yes
  #.........................................................................................................
  else
    ### 'Classical' encoding: only full key segments match ###
    base  = @_encode_key db, prefix, true
    gte   = base.slice 0, base.length - 1
    lte   = base.slice 0, base.length
  #.........................................................................................................
  return { gte, lte, }





