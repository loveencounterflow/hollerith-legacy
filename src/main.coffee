


############################################################################################################
# njs_util                  = require 'util'
# njs_path                  = require 'path'
# njs_fs                    = require 'fs'
#...........................................................................................................
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'test-hollerith'
log                       = CND.get_logger 'plain',     badge
debug                     = CND.get_logger 'debug',     badge
warn                      = CND.get_logger 'warn',      badge
help                      = CND.get_logger 'help',      badge
urge                      = CND.get_logger 'urge',      badge
echo                      = CND.echo.bind CND
#...........................................................................................................
suspend                   = require 'coffeenode-suspend'
step                      = suspend.step
#...........................................................................................................
BYTEWISE                  = require 'bytewise'
_btws_encode              = BYTEWISE.encode.bind BYTEWISE
_btws_decode              = BYTEWISE.decode.bind BYTEWISE
#...........................................................................................................
D                         = require 'pipedreams2'
$                         = D.remit.bind D
_new_level_db             = require 'level'
@_zero                    = _btws_encode true
@_last_octet              = new Buffer [ 0xff, ]


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

#-----------------------------------------------------------------------------------------------------------
@clear = ( db, handler ) ->
  ### TAINT consider to simply remove files as it is faster and leads to more reproducible results as
  we then always really start from scratch ###
  substrate = db[ '%self' ]
  input     = substrate.createKeyStream()
  count     = 0
  input
    .pipe $ ( key, send, end ) =>
      step ( resume ) =>
        if key?
          count += +1
          yield substrate.del key, resume
        if end?
          help "deleted #{count} entries"
          handler null if handler?


#===========================================================================================================
# CODEC
#-----------------------------------------------------------------------------------------------------------
@_encode = ( db, key ) -> _btws_encode key
@_decode = ( db, key ) -> _btws_decode key

#-----------------------------------------------------------------------------------------------------------
@_rpr_of_key = ( db, key ) ->
  if ( @_type_from_key db, key ) is 'list'
    [ phrasetype, first, second, idx, ] = key
    idx_rpr = if idx? then rpr idx else ''
    ### TAINT should escape metachrs `|`, ':' ###
    ### TAINT should use `rpr` on parts of speech (e.g. object value could be a number etc.) ###
    return "#{phrasetype}|#{first.join ':'}|#{second.join ':'}|#{idx_rpr}"
  return "#{rpr key}"

#===========================================================================================================
# READING
#-----------------------------------------------------------------------------------------------------------
@read = ( db, prefix = null ) ->
  return db[ '%self' ].createKeyStream() unless prefix?
  return db[ '%self' ].createKeyStream @_query_from_prefix

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
@new_key = ( db, phrasetype, key_0, value_0, key_1, value_1, idx ) ->
  throw new Error "illegal phrasetype: #{rpr phrasetype}" unless phrasetype in [ 'so', 'os', ]
  return [ phrasetype, [ key_0, value_0, ], [ key_1, value_1, ], ( idx ? null ), ]

#-----------------------------------------------------------------------------------------------------------
@new_so_key = ( db, P... ) -> @new_key db, 'so', P...
@new_os_key = ( db, P... ) -> @new_key db, 'os', P...

#-----------------------------------------------------------------------------------------------------------
@new_keys = ( db, phrasetype, key_0, value_0, key_1, value_1, idx ) ->
  other_phrasetype  = if phrasetype is 'so' then 'os' else 'so'
  return [
    ( @new_key db,       phrasetype, key_0, value_0, key_1, value_1, idx ),
    ( @new_key db, other_phrasetype, key_1, value_1, key_0, value_0, idx ), ]

#-----------------------------------------------------------------------------------------------------------
@new_prefix = ( db, phrasetype, elements... ) -> throw new Error "xxxxxxxxxx"

#-----------------------------------------------------------------------------------------------------------
@_query_from_prefix = ( db, prefix ) ->
  gte           = if ( Buffer.isBuffer prefix ) then prefix else @_encode db, prefix
  ### `BYTEWISE` encodes lists with zeroes at the end; we skip those zeroes to arrive at a minimal prefix to
  which a `0xff` byte can be meaningfully appended: ###
  last_gte_idx  = gte.length - 1
  last_gte_idx += -1 while ( last_gte_idx > 0 ) and ( gte[ last_gte_idx ] is 0x00 )
  gte           = gte.slice 0, last_gte_idx + 1 if last_gte_idx < gte.length - 1
  lte           = Buffer.concat [ gte, @_last_octet, ], gte.length + 1
  return { gte, lte, }






