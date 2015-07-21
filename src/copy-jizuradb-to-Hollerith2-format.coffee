


############################################################################################################
njs_path                  = require 'path'
# # njs_fs                    = require 'fs'
join                      = njs_path.join
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
D                         = require 'pipedreams2'
$                         = D.remit.bind D
$async                    = D.remit_async.bind D
#...........................................................................................................
HOLLERITH                 = require './main'
DEMO                      = require './demo'
ƒ                         = CND.format_number.bind CND

#-----------------------------------------------------------------------------------------------------------
options =
  # sample:         null
  # sample:         [ '疈', '國', '𠵓', ]
  # sample:         [ '𡬜', '國', '𠵓', ]

# #-----------------------------------------------------------------------------------------------------------
# @$show_progress = ( size ) ->
#   size   ?= 1e3
#   count   = 0
#   return $ ( data, send ) =>
#     count += 1
#     echo ƒ count if count % size is 0
#     send data

#-----------------------------------------------------------------------------------------------------------
@$show_progress = ( size ) ->
  size         ?= 1e3
  phrase_count  = 0
  glyph_count   = 0
  last_glyph    = null
  return D.$observe ( phrase, has_ended ) =>
    unless has_ended
      phrase_count += 1
      echo ƒ phrase_count if phrase_count % size is 0
      glyph_count  += +1 if ( glyph = phrase[ 0 ] ) isnt last_glyph
      last_glyph    = glyph
    else
      help "read #{ƒ phrase_count} phrases for #{ƒ glyph_count} glyphs"
      help "(#{( phrase_count / glyph_count ).toFixed 2} phrases per glyph)"

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
@$add_version_to_kwic_v1 = ->
  ### mark up all predicates `guide/kwic/*` as `guide/kwic/v1/*` ###
  return $ ( [ sbj, prd, obj, ], send ) =>
    if prd.startsWith 'guide/kwic/'
      prd = prd.replace /^guide\/kwic\//, 'guide/kwic/v1/'
    send [ sbj, prd, obj, ]

#-----------------------------------------------------------------------------------------------------------
@_long_wrapped_lineups_from_guide_has_uchr = ( guides ) ->
  ### Extending lineups to accommodate for glyphs with 'overlong' factorials (those with more than 6
  factors; these were previously excluded from the gamut in `feed-db.coffee`, line 2135,
  `@KWIC.$compose_lineup_facets`). ###
  lineup      = guides[ .. ]
  last_idx    = lineup.length - 1 + 6
  lineup.push    '\u3000' while lineup.length < 19
  lineup.unshift '\u3000' while lineup.length < 25
  R           = []
  for idx in [ 6 .. last_idx ]
    infix   = lineup[ idx ]
    suffix  = lineup[ idx + 1 .. idx + 6 ].join ''
    prefix  = lineup[ idx - 6 .. idx - 1 ].join ''
    R.push [ infix, suffix, prefix, ].join ','
  return R

#-----------------------------------------------------------------------------------------------------------
@$add_kwic_v2 = ->
  ### see `demo/show_kwic_v2_sample` ###
  last_glyph            = null
  long_wrapped_lineups  = null
  return $ ( [ sbj, prd, obj, ], send ) =>
    #.......................................................................................................
    if prd is 'guide/has/uchr'
      last_glyph            = sbj
      long_wrapped_lineups  = @_long_wrapped_lineups_from_guide_has_uchr obj
    #.......................................................................................................
    return send [ sbj, prd, obj, ] unless prd.startsWith 'guide/kwic/v1/'
    #.......................................................................................................
    switch prd.replace /^guide\/kwic\/v1\//, ''
      when 'lineup/wrapped/infix', 'lineup/wrapped/prefix', 'lineup/wrapped/suffix', 'lineup/wrapped/single'
        ### copy to target ###
        send [ sbj, prd, obj, ]
      when 'sortcode'
        [ glyph, _, sortcodes_v1, ] = [ sbj, prd, obj, ]
        sortcodes_v2                = []
        #...................................................................................................
        ### The difference between KWIC sortcodes of version 1 and version 2 lies in the re-arrangement
        of the factor codes and the index codes. In v1, the index codes appeared interspersed with
        the factor codes; in v2, the index codes come up front and the index codes come in the latter half
        of the sortcode strings. The effect of this rearrangement is that now that all of the indexes
        (which indicate the position of each factor in the lineup) are weaker than any of the factor codes,
        like sequences of factor codes (and, therefore, factors) will always be grouped together (whereas
        in v1, only like factors with like positions appeared together, and often like sequences appeared
        with other sequences interspersed where their indexes demanded it so). ###
        for sortcode_v1 in sortcodes_v1
          sortrow_v1 = ( x for x in sortcode_v1.split /(........,..),/ when x.length > 0 )
          sortrow_v1 = ( x.split ',' for x in sortrow_v1 )
          sortrow_v2 = []
          sortrow_v2.push sortcode for [ sortcode, _, ] in sortrow_v1
          sortrow_v2.push position for [ _, position, ] in sortrow_v1
          sortcodes_v2.push sortrow_v2.join ','
        #...................................................................................................
        unless glyph is last_glyph
          return send.error new Error "unexpected mismatch: #{rpr glyph}, #{rpr last_glyph}"
        #...................................................................................................
        unless long_wrapped_lineups?
          return send.error new Error "missing long wrapped lineups for glyph #{rpr glyph}"
        #...................................................................................................
        unless sortcodes_v2.length is long_wrapped_lineups.length
          warn 'sortcodes_v2:         ', sortcodes_v2
          warn 'long_wrapped_lineups: ', long_wrapped_lineups
          return send.error new Error "length mismatch for glyph #{rpr glyph}"
        #...................................................................................................
        sortcodes_v1[ idx ] += ";" + lineup for lineup, idx in long_wrapped_lineups
        sortcodes_v2[ idx ] += ";" + lineup for lineup, idx in long_wrapped_lineups
        send [ glyph, 'guide/kwic/v2/lineup/wrapped/single', long_wrapped_lineups, ]
        long_wrapped_lineups  = null
        #...................................................................................................
        send [ glyph, prd, sortcodes_v1, ]
        send [ glyph, 'guide/kwic/v2/sortcode', sortcodes_v2, ]
      else
        send.error new Error "unhandled predicate #{rpr prd}"

#-----------------------------------------------------------------------------------------------------------
@v1_split_so_bkey = ( bkey ) ->
  R       = bkey.toString 'utf-8'
  R       = R.split '|'
  idx_txt = R[ 3 ]
  R       = [ ( R[ 1 ].split ':' )[ 1 ], ( R[ 2 ].split ':' )..., ]
  R.push ( parseInt idx_txt, 10 ) if idx_txt? and idx_txt.length > 0
  for r, idx in R
    continue unless CND.isa_text r
    continue unless 'µ' in r
    R[ idx ] = @v1_unescape r
  return R

#-----------------------------------------------------------------------------------------------------------
@v1_$split_so_bkey = -> $ ( bkey, send ) => send @v1_split_so_bkey bkey

#-----------------------------------------------------------------------------------------------------------
@v1_lte_from_gte = ( gte ) ->
  R = new Buffer ( last_idx = Buffer.byteLength gte ) + 1
  R.write gte
  R[ last_idx ] = 0xff
  return R

#-----------------------------------------------------------------------------------------------------------
@v1_unescape = ( text_esc ) ->
  matcher = /µ([0-9a-f]{2})/g
  return text_esc.replace matcher, ( _, cid_hex ) ->
    return String.fromCharCode parseInt cid_hex, 16

#-----------------------------------------------------------------------------------------------------------
@copy_jizura_db = ->
  home            = join __dirname, '../../jizura-datasources'
  source_route    = join home, 'data/leveldb'
  # target_route    = join home, 'data/leveldb-v2'
  ### !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ###
  target_route    = '/tmp/leveldb-v2'
  target_db_size  = 1e6
  ds_options      = require join home, 'options'
  source_db       = HOLLERITH.new_db source_route
  target_db       = HOLLERITH.new_db target_route, size: target_db_size, create: yes
  help "using DB at #{source_db[ '%self' ][ 'location' ]}"
  help "using DB at #{target_db[ '%self' ][ 'location' ]}"
  #.........................................................................................................
  step ( resume ) =>
    yield HOLLERITH.clear target_db, resume
    # gte         = 'so|glyph:中'
    # gte         = 'so|glyph:覆'
    gte         = 'so|'
    lte         = @v1_lte_from_gte gte
    input       = source_db[ '%self' ].createKeyStream { gte, lte, }
    batch_size  = 1e4
    output      = HOLLERITH.$write target_db, { batch: batch_size, }
    #.........................................................................................................
    help "copying from  #{source_route}"
    help "to            #{target_route}"
    help "reading records with prefix #{rpr gte}"
    help "writing with batch size #{ƒ batch_size}"
    #.........................................................................................................
    input
      #.......................................................................................................
      .pipe @v1_$split_so_bkey()
      .pipe @$show_progress 1e4
      .pipe @$keep_small_sample()
      .pipe @$throw_out_pods()
      .pipe @$cast_types ds_options
      .pipe @$collect_lists()
      .pipe @$compact_lists()
      .pipe @$add_version_to_kwic_v1()
      .pipe @$add_kwic_v2()
      # .pipe D.$show()
      .pipe D.$count ( count ) -> help "kept #{ƒ count} phrases"
      .pipe output


############################################################################################################
unless module.parent?
  @copy_jizura_db()
