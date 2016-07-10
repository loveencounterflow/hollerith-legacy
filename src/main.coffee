

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
  settings         ?= {}
  ### Superficial experiments show that a much bigger batch size than 1'000 does not tend to improve
  throughput; therefore, in order to reduce memory footprint, it seems advisable to leave batch size
  in the order of around a thousand entries. ###
  batch_size        = settings[ 'batch'  ] ? 1000
  solid_predicates  = settings[ 'solids' ] ? []
  loner_predicates  = settings[ 'loners' ] ? []
  ensure_unique     = settings[ 'unique' ] ? true
  substrate         = db[ '%self' ]
  batch_written     = null
  throw new Error "`unique` setting currently not supported" if ensure_unique
  #.........................................................................................................
  is_integer = ( x ) -> ( x? ) and ( x is parseInt x )
  #.........................................................................................................
  $add_secondary_index = =>
    cache = []
    return $async ( phrase, send, end ) =>
      # debug '7765-1', phrase
      if phrase?
        return send.done phrase unless phrase[ 0 ] is Symbol.for 'make-secondary-index'
        [ _, predicates, ] = phrase
        debug '7765-A', "indexing predicates #{rpr predicates}"
        cache.push { predicates, }
        send.done()
      if end?
        ASYNC = require 'async'
        tasks = []
        for entry in cache
        debug '7765-B', "indexing predicates #{rpr cache}"
        @_add_secondary_index db, entry...
        end()
      return null
  #.........................................................................................................
  $add_primary_index = => $ ( spo, send ) =>
    # debug '7765-2', spo
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
    send { type: 'put', key: ( @_encode_key db, longphrase ), value: @_zero_value_bfr, }
  #.........................................................................................................
  $write = => $async ( batch, send, end ) =>
    if batch?
      substrate.batch batch, ->
        send batch
        send.done()
    end() if end?
    return null
  #.........................................................................................................
  pipeline = []
  # pipeline.push @$validate_spo()
  pipeline.push $add_secondary_index()
  pipeline.push $add_primary_index()
  pipeline.push $encode()
  pipeline.push D.$batch batch_size
  pipeline.push $write()
  #.........................................................................................................
  return D.new_stream { pipeline, }

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


#===========================================================================================================
# HIGHER-ORDER INDEXING
#-----------------------------------------------------------------------------------------------------------
@$index = ( descriptions ) =>
  throw new Error "deprecated"
  # ### TAINT For the time being, we only support secondary indexes, and the implementation is not at all
  # written in a generic fashion. A future version will likely support tertiary indexes, but that will
  # necessitate waiting for the end of the write stream and re-reading all the records. ###
  # predicates      = []
  # predicate_count = 0
  # arities         = []
  # phrases         = []
  # phrase_counts   = {}
  # #.........................................................................................................
  # for predicate, arity of descriptions
  #   predicate_count += +1
  #   unless arity in [ 'singular', 'plural', ]
  #     throw new Error "expected 'singular' or 'plural' for arity, got #{rpr arity}"
  #   predicates.push   predicate
  #   phrases.push      {}
  #   arities.push      arity
  # #.........................................................................................................
  # if predicate_count.length < 2
  #   throw new Error "expected at least two predicate descriptions, got #{predicates.length}"
  # if predicate_count.length > 2
  #   throw new Error "indexes with more than 2 steps not supported yet"
  # #.........................................................................................................
  # new_index_phrase = ( tsbj, tprd, tobj, fprd, fobj, tsbj_is_list, idx = 0 ) =>
  #   return [ [ tsbj..., tprd, idx, tobj, ], fprd, fobj, ] if tsbj_is_list
  #   return [ [ tsbj,    tprd, idx, tobj, ], fprd, fobj, ]
  # #.........................................................................................................
  # link = ( phrases ) =>
  #   throw new Error "indexes with anything but 2 steps not supported yet" if phrases.length != 2
  #   [ from_phrase, to_phrase, ] = phrases
  #   [ fsbj, fprd, fobj, ]       = from_phrase
  #   [ tsbj, tprd, tobj, ]       =   to_phrase
  #   tsbj_is_list                = CND.isa_list tsbj
  #   from_is_plural              = arities[ 0 ] is 'plural'
  #   to_is_plural                = arities[ 1 ] is 'plural'
  #   #.......................................................................................................
  #   unless from_is_plural or to_is_plural
  #     return [ new_index_phrase tsbj, tprd, tobj, fprd, fobj, tsbj_is_list ]
  #   #.......................................................................................................
  #   idx = -1
  #   R   = []
  #   if from_is_plural
  #     if to_is_plural
  #       for sub_fobj in fobj
  #         for sub_tobj in tobj
  #           idx += +1
  #           R.push new_index_phrase tsbj, tprd, sub_tobj, fprd, sub_fobj, tsbj_is_list, idx
  #     else
  #       for sub_fobj in fobj
  #         idx += +1
  #         R.push new_index_phrase tsbj, tprd, tobj, fprd, sub_fobj, tsbj_is_list, idx
  #   else
  #     for sub_tobj in tobj
  #       idx += +1
  #       R.push new_index_phrase tsbj, tprd, sub_tobj, fprd, fobj, tsbj_is_list, idx
  #   #.......................................................................................................
  #   return R
  # #.........................................................................................................
  # return $ ( phrase, send ) =>
  #   send phrase
  #   [ sbj, prd, obj, ] = phrase
  #   return unless ( prd_idx = predicates.indexOf prd ) >= 0
  #   sbj_txt                       = JSON.stringify sbj
  #   phrase_target                 = phrases[ sbj_txt]?= []
  #   phrase_target[ prd_idx ]      = phrase
  #   phrase_counts[ sbj_txt ]      = ( phrase_counts[ sbj_txt ] ? 0 ) + 1
  #   return null if phrase_counts[ sbj_txt ] < predicate_count
  #   #.......................................................................................................
  #   send index_phrase for index_phrase in link phrases[ sbj_txt ]
  #   return null

#-----------------------------------------------------------------------------------------------------------
@$index_v4 = ( predicates... ) =>
  ### TAINT For the time being, we only support secondary indexes. A future version will likely support
  tertiary indexes, but that will necessitate waiting for the end of the write stream and re-reading all the
  records. ###
  return D.$on_start ( send ) =>
    send [ ( Symbol.for 'make-secondary-index' ), predicates, ]

#-----------------------------------------------------------------------------------------------------------
@_add_secondary_index = ( db, description, handler ) =>
  #.........................................................................................................
  query   = { prefix: [ 'reading', ], star: '*', flatten: yes }
  input   = @new_phrasestream db, query
  input
    .pipe $ ( phrase ) => whisper '_add_secondary_index', phrase if phrase
  # #.........................................................................................................
  # if predicates.length isnt 2
  #   throw new Error "only indexes with exactly 2 steps supported at this time"
  #.........................................................................................................
  # #.........................................................................................................
  # phrases         = []
  # phrase_counts   = {}
  # #.........................................................................................................
  # if is_retro_index = predicates[ 0 ] is predicates[ 1 ]
  #   predicates.pop()
  #   phrases.push {}
  #   predicate_count = 2
  # else
  #   phrases.push {} for predicate in predicates
  # #.........................................................................................................
  # new_index_phrase = ( fphrase, tphrase ) =>
  #   [ fsubj, fprd, fidx, fobj, ]  = fphrase
  #   [ tsubj, tprd, tidx, tobj, ]  = tphrase
  #   return [ [ tsbj, tprd, tidx, tobj, ], fprd, fidx, fobj, ]
  # #.........................................................................................................
  # link = ( phrases ) =>
  #   [ from_phrase, to_phrase, ] = phrases
  #   [ fsbj, fprd, fobj, ]       = from_phrase
  #   [ tsbj, tprd, tobj, ]       =   to_phrase
  #   tsbj_is_list                = CND.isa_list tsbj
  #   #.......................................................................................................
  #   for sub_fobj in fobj
  #     for sub_tobj in tobj
  #       idx += +1
  #       R.push new_index_phrase tsbj, tprd, sub_tobj, fprd, sub_fobj, tsbj_is_list, idx
  #   #.......................................................................................................
  #   return R
  # #.........................................................................................................
  # return $ ( phrase, send ) =>
  #   if phrase?
  #     send phrase
  #     [ sbj, prd, idx, obj, ] = phrase
  #     return unless ( prd_idx = predicates.indexOf prd ) >= 0
  #     # if is_retro_index
  #     sbj_txt                       = JSON.stringify sbj
  #     phrase_target                 = phrases[ sbj_txt]?= []
  #     phrase_target[ prd_idx ]      = phrase
  #     phrase_counts[ sbj_txt ]      = ( phrase_counts[ sbj_txt ] ? 0 ) + 1
  #     return null if phrase_counts[ sbj_txt ] < predicate_count
  #   #.......................................................................................................
  #   debug '5543', phrases#[ sbj_txt ]
  #   # send index_phrase for index_phrase in link phrases[ sbj_txt ]
  #   #.......................................................................................................
  #   if end?
  #     # if is_retro_index
  #       # send index_phrase for index_phrase in link phrases[ sbj_txt ]
  #     end()
  #   #.......................................................................................................
  #   return null


#===========================================================================================================
# READING
#-----------------------------------------------------------------------------------------------------------
@new_phrasestream = ( db, query, settings ) ->
  R = @_new_phrasestream db, query, settings
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
  return @_new_phrasestream db, query, handler

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
@_new_phrasestream = ( db, query, handler ) ->
  # switch arity = arguments.length
  #   when 3
  #     if CND.isa_function settings
  #       handler   = settings
  #       settings  = null
  #   when 4 then null
  #   else throw new Error "expected 3 or 4 arguments, got #{arity}"
  input = @new_longphrasestream db, query
  R = input.pipe @$longphrase_as_phrase db, query
  if handler?
    R = R
      .pipe D.$collect()
      .pipe $ ( data, send ) =>
        handler null, data
    R.on 'error', ( error ) => handler error
  # R[ '%meta' ] = input[ '%meta' ]
  return R

#-----------------------------------------------------------------------------------------------------------
@new_longphrasestream = ( db, query ) ->
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
  lo_hint     = null
  hi_hint     = null
  legal_keys  = [ 'prefix', 'star', 'lo', 'hi', 'unbox', 'flatten', ]
  #.........................................................................................................
  if query?
    keys        = Object.keys query
    has_prefix  = 'prefix' in keys
    has_lo      = 'lo'     in keys
    has_hi      = 'hi'     in keys
    has_star    = 'star'   in keys
    star        = query[ 'star'   ] ? null
    prefix      = query[ 'prefix' ] ? null
    #.......................................................................................................
    unless CND.is_subset keys, legal_keys
      legal_keys  = ( rpr key for key in legal_keys ).join ', '
      keys        = ( rpr key for key in       keys ).join ', '
      throw new Error "legal query keys are #{legal_keys}, got #{keys}"
    #.......................................................................................................
    if ( not has_prefix ) and ( not has_lo ) and ( not has_hi )
      has_prefix  = yes
      prefix      = []
      has_star    = yes
      star        = '*'
    #.......................................................................................................
    else
      #.....................................................................................................
      if ( not has_prefix ) and ( not has_lo or not has_hi )
        keys        = ( rpr key for key in       keys ).join ', '
        throw new Error "must use either 'prefix' or 'hi' and 'lo', got #{keys}"
      #.....................................................................................................
      if ( has_lo or has_hi ) and ( has_star )
        throw new Error "illegal to use 'star' with 'lo' or 'hi'"
      #.....................................................................................................
      if ( has_star ) and ( star isnt '*' )
        throw new Error "expected 'star' to be '*', got #{rpr star}"
      #.....................................................................................................
      if ( has_prefix ) and ( has_lo or has_hi )
        throw new Error "illegal to use 'hi' or 'lo' together with 'prefix'"
      #.....................................................................................................
      if ( has_lo and not has_hi ) or ( has_hi and not has_lo )
        throw new Error "illegal to use only one of 'hi' or 'lo'"
    #.......................................................................................................
    if has_prefix
      lo_hint = prefix
      hi_hint = star if has_star
    #.......................................................................................................
    else
      lo_hint = query[ 'lo' ]
      hi_hint = query[ 'hi' ]
  #.........................................................................................................
  return @_new_longphrasestream db, lo_hint, hi_hint

#-----------------------------------------------------------------------------------------------------------
@_new_longphrasestream = ( db, lo_hint = null, hi_hint = null ) ->
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
  input   = @new_longphrasestream db, query
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
@longphrase_as_phrase = ( db, longphrase, settings = {} ) ->
  try
    [ phrasetype, tail..., ]  = longphrase
    unless ( tail_length = tail.length ) is 4
      throw new Error "illegal phrase #{rpr phrase} of length #{tail_length + 1}"
    switch phrasetype
      when 'spo' then [ sbj, prd, idx, obj,      ] = tail
      when 'pos' then [      prd, idx, obj, sbj, ] = tail
      else throw new Error "unknown phrasetype #{rpr phrasetype}"
    switch sbj_length = sbj.length
      when 1 then sbj = sbj[ 0 ] if settings[ 'unbox' ] ? true
      when 0 then throw new Error "subject can't be empty; read phrase #{rpr longphrase}"
    if phrasetype is 'spo'
      return [ 'spo', sbj, prd, idx, obj, ]
    return [ 'pos', prd, idx, obj, sbj..., ] if settings[ 'flatten' ] and CND.isa_list sbj
    return [ 'pos', prd, idx, obj, sbj,    ]
  catch error
    warn "detected problem with phrase #{rpr longphrase}"
    throw error

#-----------------------------------------------------------------------------------------------------------
@$longphrase_as_phrase = ( db, settings ) ->
  return $ ( key, send ) => send @longphrase_as_phrase db, key, settings

# #-----------------------------------------------------------------------------------------------------------
# @normalize_phrase = ( db, phrase ) ->
#   switch phrasetype = phrase[ 0 ]
#     when 'spo'
#       return phrase
#     when 'pos'
#       return [ 'spo', phrase[ 3 ], phrase[ 1 ], phrase[ 2 ], phrase[ 4 ], ] if phrase[ 4 ]?
#       return [ 'spo', phrase[ 3 ], phrase[ 1 ], phrase[ 2 ],           ]
#   throw new Error "unknown phrasetype #{rpr phrasetype}"

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





