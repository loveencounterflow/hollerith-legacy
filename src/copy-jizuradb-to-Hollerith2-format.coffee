


############################################################################################################
# njs_path                  = require 'path'
# # njs_fs                    = require 'fs'
# join                      = njs_path.join
#...........................................................................................................
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'HOLLERITH/copy'
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
eventually                = suspend.eventually
immediately               = suspend.immediately
repeat_immediately        = suspend.repeat_immediately
every                     = suspend.every
#...........................................................................................................
# BYTEWISE                  = require 'bytewise'
# through                   = require 'through2'
# LevelBatch                = require 'level-batch-stream'
# BatchStream               = require 'batch-stream'
# parallel                  = require 'concurrent-writable'
D                         = require 'pipedreams2'
$                         = D.remit.bind D
$async                    = D.remit_async.bind D
#...........................................................................................................
# new_db                    = require 'level'
# new_levelgraph            = require 'levelgraph'
# db                        = new_levelgraph '/tmp/levelgraph'
HOLLERITH                 = require './main'
DEMO                      = require './demo'
ƒ                         = CND.format_number.bind CND

#-----------------------------------------------------------------------------------------------------------
options =
  sample:         null
  # sample:         [ '中', '國', '皇', '帝', ]

#-----------------------------------------------------------------------------------------------------------
@$show_progress = ( size ) ->
  size   ?= 1e3
  count   = 0
  return $ ( data, send ) =>
    count += 1
    echo ƒ count if count % size is 0
    send data

#-----------------------------------------------------------------------------------------------------------
@$keep_small_sample = ->
  return $ ( key, send ) =>
    return send key unless options[ 'sample' ]?
    [ glyph, prd, obj, idx, ] = key
    send key if glyph in options[ 'sample' ]

#-----------------------------------------------------------------------------------------------------------
@$throw_out_pods = ->
  return $ ( key, send ) =>
    [ glyph, prd, obj, idx, ] = key
    send key unless prd is 'pod'

#-----------------------------------------------------------------------------------------------------------
@$cast_types = ( ds_options ) ->
  return $ ( [ sbj, prd, obj, idx, ], send ) =>
    type_description = ds_options[ 'schema' ][ prd ]
    unless type_description?
      warn "no type description for predicate #{rpr prd}"
    else
      switch type = type_description[ 'type' ]
        when 'int'
          obj = parseInt obj, 10
        when 'text'
          ### TAINT we have no booleans configured ###
          if      obj is 'true'   then obj = true
          else if obj is 'false'  then obj = false
    send if idx? then [ sbj, prd, obj, idx, ] else [ sbj, prd, obj, ]

#-----------------------------------------------------------------------------------------------------------
@$collect_lists = ->
  objs          = null
  sbj_prd       = null
  last_digest   = null
  context_keys  = []
  has_errors    = false
  #.........................................................................................................
  return $ ( key, send, end ) =>
    #.......................................................................................................
    if key?
      context_keys.push key; context_keys.shift() if context_keys.length > 10
      [ sbj, prd, obj, idx, ] = key
      digest                  = JSON.stringify [ sbj, prd, ]
      #.....................................................................................................
      if digest is last_digest
        if idx?
          objs[ idx ] = obj
        else
          ### A certain subject/predicate combination can only ever be repeated if an index is
          present in the key ###
          alert()
          alert "erroneous repeated entry; context:"
          alert context_keys
          has_errors = true
      else
        send [ sbj_prd..., objs, ] if objs?
        objs            = null
        last_digest     = digest
        if idx?
          objs            = []
          objs[ idx ]     = obj
          sbj_prd         = [ sbj, prd, ]
        else
          send key
    #.......................................................................................................
    if end?
      send [ sbj_prd..., objs, ] if objs?
      return send.error new Error "there were errors; see alerts above" if has_errors
      end()
    #.......................................................................................................
    return null

#-----------------------------------------------------------------------------------------------------------
@$compact_lists = ->
  return $ ( [ sbj, prd, obj, ], send ) =>
    ### Compactify sparse lists so all `undefined` elements are removed; warn about this ###
    if ( CND.type_of obj ) is 'list'
      new_obj = ( element for element in obj when element isnt undefined )
      if obj.length isnt new_obj.length
        warn "phrase #{rpr [ sbj, prd, obj, ]} contained undefined elements; compactified"
      obj = new_obj
    send [ sbj, prd, obj, ]

#-----------------------------------------------------------------------------------------------------------
@copy_jizura_db = ->
  ds_options  = require '/Volumes/Storage/io/jizura-datasources/options'
  source_db   = HOLLERITH.new_db '/Volumes/Storage/io/jizura-datasources/data/leveldb' # options[ 'route' ]
  target_db   = HOLLERITH.new_db '/tmp/jizura-hollerith2'
  # target_db   = HOLLERITH.new_db '/Volumes/Storage/temp/jizura-hollerith2'
  #.........................................................................................................
  step ( resume ) =>
    yield HOLLERITH.clear target_db, resume
    gte         = 'so|'
    # ### !!!!!!!!!!!!!!!!!!!!!!!! ###
    # gte         = 'so|glyph:中' # !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    # ### !!!!!!!!!!!!!!!!!!!!!!!! ###
    lte         = DEMO._lte_from_gte gte
    debug '©Y4DzO', { gte, lte, }
    input       = source_db[ '%self' ].createKeyStream { gte, lte, }
    batch_size  = 10000
    ### !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ###
    batch_size  = 1
    output      = HOLLERITH.$write target_db, { batch: batch_size, }
    #.........................................................................................................
    input
      #.......................................................................................................
      .pipe @$show_progress 1e5
      .pipe D.$count ( count ) -> help "read #{ƒ count} keys"
      .pipe DEMO._$split_so_bkey()
      .pipe @$keep_small_sample()
      .pipe @$throw_out_pods()
      .pipe @$cast_types ds_options
      .pipe @$collect_lists()
      .pipe @$compact_lists()
      # .pipe D.$show()
      .pipe D.$count ( count ) -> help "kept #{ƒ count} entries"
      .pipe output


    # #.......................................................................................................
    # .pipe $ ( [ sbj, prd, obj, ], send ) =>
    #   ### Type Casting ###
    #   type_description = ds_options[ 'schema' ][ prd ]
    #   unless type_description?
    #     warn "no type description for predicate #{rpr prd}"
    #   else
    #     switch type = type_description[ 'type' ]
    #       when 'int'
    #         obj = parseInt obj, 10
    #       when 'text'
    #         ### TAINT we have no booleans configured ###
    #         if      obj is 'true'   then obj = true
    #         else if obj is 'false'  then obj = false
    #   send [ sbj, prd, obj, ]
    # #.......................................................................................................


############################################################################################################
unless module.parent?
  @copy_jizura_db()
