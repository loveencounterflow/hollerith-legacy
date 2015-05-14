


############################################################################################################
njs_path                  = require 'path'
# njs_fs                    = require 'fs'
join                      = njs_path.join
#...........................................................................................................
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'HOLLERITH/test'
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
#...........................................................................................................
new_db                    = require 'level'
# new_levelgraph            = require 'levelgraph'
# db                        = new_levelgraph '/tmp/levelgraph'
HOLLERITH                 = require './main'
ƒ                         = CND.format_number.bind CND
#...........................................................................................................
options                   = null

#-----------------------------------------------------------------------------------------------------------
@_misfit          = Symbol 'misfit'


#===========================================================================================================
# PIPEDREAMS
#-----------------------------------------------------------------------------------------------------------
D.new_indexer = ( idx = 0 ) -> ( data ) => [ idx++, data, ]


#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
@initialize = ( handler ) ->
  options[ 'db' ] = HOLLERITH.new_db options[ 'route' ]
  handler null

#-----------------------------------------------------------------------------------------------------------
@main = ( first_query ) ->
  first_query ?= { gte: 'os|rank/cjt:0', lte: 'os|rank/cjt:9', }
  step ( resume ) =>
    yield @initialize resume
    db = options[ 'db' ]
    CHR = require '/Volumes/Storage/io/coffeenode-chr'
    count_chrs = ( text ) -> ( CHR.chrs_from_text text, input: 'xncr' ).length
    #.......................................................................................................
    input = db[ '%self' ].createKeyStream first_query
    # k = "so|glyph:繼|pod:"
    # input = db[ '%self' ].createKeyStream db, { gte: k, lte: k + '\uffff' }
    # debug '©cW8tK', HOLLERITH.new_key db, 'os', 'rank/cjt', '00000'
    #.......................................................................................................
    ### TAINT We can currently not use `HOLLERITH2.read_sub` because HOLLERITH2 assumes a key-only
    DB that uses binary encoding with a custom https://github.com/deanlandolt/bytewise layer; the current
    Jizura DB version uses UTF-8 strings and is a key/value DB. ###
    #.......................................................................................................
    input
      .pipe @_$split_bkey()
      #.....................................................................................................
      # .pipe HOLLERITH.read_sub db, indexed: yes, ( key ) =>
      .pipe @read_sub db, indexed: yes, ( key ) =>
        [ pt, ok, rank, sk, glyph, ] = key
        sub_key = "so|glyph:#{glyph}|pod:"
        return db[ '%self' ].createValueStream { gte: sub_key, lte: sub_key + '\uffff' }
      #.....................................................................................................
      .pipe D.$densort 0, 0, true
      #.....................................................................................................
      .pipe $ ( [ idx, [ pod, ], ], send ) =>
        debug '©jd5cE', pod
        unless pod[ 'strokeorder/short'  ]?
          warn '©9YXoq',  pod
        else
          glyph       = pod[ 'glyph/uchr'         ]
          strokeorder = pod[ 'strokeorder/short'  ][ 0 ].length
          lineup      = pod[ 'guide/lineup/uchr'  ].replace /\u3000/g, ''
          send [ glyph, strokeorder, lineup, ]
      #.....................................................................................................
      .pipe $ ( [ glyph, strokeorder, lineup, ], send ) =>
        send [ glyph, strokeorder, count_chrs lineup, ]
      #.....................................................................................................
      .pipe D.$sort ( a, b ) ->
        idx = 1
        return +1 if a[ idx ] > b[ idx ]
        return -1 if a[ idx ] < b[ idx ]
        return  0
      #.....................................................................................................
      .pipe D.$show()

#-----------------------------------------------------------------------------------------------------------
@_$split_bkey = -> $ ( bkey, send ) => send @_split_bkey bkey

#-----------------------------------------------------------------------------------------------------------
@_split_bkey = ( bkey ) ->
  R = bkey.toString 'utf-8'
  R = ( R.split '|' )[ .. 2 ]
  R = [ R[ 0 ], ( R[ 1 ].split ':' )..., ( R[ 2 ].split ':' )..., ]
  return R

#-----------------------------------------------------------------------------------------------------------
@_$split_so_bkey = -> $ ( bkey, send ) => send @_split_so_bkey bkey

#-----------------------------------------------------------------------------------------------------------
@_split_so_bkey = ( bkey ) ->
  R       = bkey.toString 'utf-8'
  R       = R.split '|'
  idx_txt = R[ 3 ]
  R       = [ ( R[ 1 ].split ':' )[ 1 ], ( R[ 2 ].split ':' )..., ]
  R.push ( parseInt idx_txt, 10 ) if idx_txt? and idx_txt.length > 0
  return R

#-----------------------------------------------------------------------------------------------------------
@_lte_from_gte = ( gte ) ->
  R = new Buffer ( last_idx = Buffer.byteLength gte ) + 1
  R.write gte
  R[ last_idx ] = 0xff
  return R

#-----------------------------------------------------------------------------------------------------------
@$lineup_from_glyph = ( db ) ->
  settings =
    indexed:  no
    single:   yes
  return @read_sub db, settings, ( glyph ) =>
    lte = "so|glyph:#{glyph}|guide/lineup/uchr:"
    sub_input = db[ '%self' ].createKeyStream { gte: lte, lte: @_lte_from_gte lte, }
    return sub_input

#-----------------------------------------------------------------------------------------------------------
@$shapeclass_wbf_from_glyph_and_lineup = ( db ) ->
  ### TAINT wrong ###
  settings =
    indexed:  no
    single:   yes
  return @read_sub db, settings, ( [ glyph, lineup_glyphs, ] ) =>
    for lineup_glyph in lineup_glyphs
      do ( lineup_glyph ) =>
        gte = "so|glyph:#{lineup_glyph}|factor/strokeclass/wbf:"
        sub_input = db[ '%self' ].createKeyStream { gte: gte, lte: @_lte_from_gte gte, }
        return sub_input

#-----------------------------------------------------------------------------------------------------------
HOLLERITH.$pick_subject = ->
  return $ ( lkey, send ) =>
    [ pt, _, v0, _, v1, ] = lkey
    send if pt is 'so' then v0 else v1

#-----------------------------------------------------------------------------------------------------------
HOLLERITH.$pick_object = ->
  return $ ( lkey, send ) =>
    [ pt, _, v0, _, v1, ] = lkey
    send if pt is 'so' then v1 else v0

#-----------------------------------------------------------------------------------------------------------
HOLLERITH.$pick_values = ->
  return $ ( lkey, send ) =>
    [ pt, _, v0, _, v1, ] = lkey
    send if pt is 'so' then [ v0, v1, ] else [ v1, v0, ]

#-----------------------------------------------------------------------------------------------------------
@copy_jizura_db = ->
  ds_options  = require '/Volumes/Storage/io/jizura-datasources/options'
  source_db   = HOLLERITH.new_db options[ 'route' ]
  target_db   = HOLLERITH.new_db '/Volumes/Storage/temp/jizura-hollerith2'
  gte         = 'so|'
  # gte         = 'so|glyph:𤊂' # !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  lte         = @_lte_from_gte gte
  input       = source_db[ '%self' ].createKeyStream { gte, lte, }
  batch_size  = 10000
  output      = HOLLERITH.$write target_db, batch_size
  #.........................................................................................................
  input
    .pipe D.$count ( count ) -> help "read #{count} keys"
    .pipe @_$split_so_bkey()
    # .pipe $ ( key, send ) =>
    #   ### !!!!! ###
    #   [ glyph, prd, obj, idx, ] = key
    #   send key if glyph in [ '中', '國', '皇', '帝', ]
    .pipe $ ( key, send ) =>
      [ glyph, prd, obj, idx, ] = key
      send key unless prd is 'pod'
    .pipe D.$count ( count ) -> help "kept #{count} entries"
    #.......................................................................................................
    .pipe do =>
      buffer      = null
      memo        = null
      last_sp     = null
      # within_list = no
      return $ ( key, send ) =>
        [ sbj, prd, obj, idx, ] = key
        if idx?
          sp = "#{sbj}|#{prd}"
          if sp is last_sp
            buffer[ idx ] = obj
          else
            send [ memo..., buffer, ] if buffer?
            buffer        = []
            buffer[ idx ] = obj
            memo          = [ sbj, prd, ]
            last_sp       = sp
        else
          send [ sbj, prd, obj, ]
    #.......................................................................................................
    .pipe $ ( [ sbj, prd, obj, ], send ) =>
      ### Compactify sparse lists so all `undefined` elements are removed; warn about this ###
      if ( CND.type_of obj ) is 'list'
        new_obj = ( element for element in obj when element isnt undefined )
        if obj.length isnt new_obj.length
          warn "phrase #{rpr [ sbj, prd, obj, ]} contained undefined elements; compactified"
        obj = new_obj
      send [ sbj, prd, obj, ]
    #.......................................................................................................
    # .pipe D.$show()
    .pipe $ ( [ sbj, prd, obj, ], send ) =>
      ### Type Casting ###
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
      send [ sbj, prd, obj, ]
    #.......................................................................................................
    .pipe do =>
      count = 0
      return $ ( phrase, send ) =>
        count += 1
        # !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        # if count % 10000 is 0
        #   echo count, phrase
        send phrase
    #.......................................................................................................
    .pipe output

#-----------------------------------------------------------------------------------------------------------
@dump_jizura_db = ->
  source_db   = HOLLERITH.new_db '/Volumes/Storage/temp/jizura-hollerith2'
  prefix      = [ 'spo', '𡏠', ]
  prefix      = [ 'spo', '㔰', ]
  input       = HOLLERITH.create_phrasestream source_db, prefix
  #.........................................................................................................
  input
    .pipe D.$count ( count ) -> help "read #{count} keys"
    .pipe $ ( data, send ) => send JSON.stringify data
    .pipe D.$show()

#-----------------------------------------------------------------------------------------------------------
### version for Hollerith1 DBs ###
@find_good_kwic_sample_glyphs_1 = ( db ) ->
  #.........................................................................................................
  step ( resume ) =>
    unless db?
      yield @initialize resume
      db = options[ 'db' ]
    #.......................................................................................................
    CHR = require '/Volumes/Storage/io/coffeenode-chr'
    chrs_from_text = ( text ) -> CHR.chrs_from_text text, input: 'xncr'
    #.......................................................................................................
    gte     = 'os|guide/lineup/length:05'
    lte     = @_lte_from_gte gte
    input   = db[ '%self' ].createKeyStream { gte: gte, lte: lte, }
    #.......................................................................................................
    decode_rank = ( bkey ) =>
      [ ..., rank_txt, ] = @_split_bkey bkey
      return parseInt rank_txt, 10
    #.......................................................................................................
    decode_lineup = ( bkey ) =>
      [ ..., lineup, ] = @_split_bkey bkey
      lineup = lineup.replace /\u3000/g, ''
      return chrs_from_text lineup
    #.......................................................................................................
    xncr_from_uchr = ( uchr ) =>
      return if ( CHR.as_rsg uchr ) is 'u-pua' then ( CHR.as_xncr uchr, csg: 'jzr' ) else uchr
    #.......................................................................................................
    input
      .pipe @_$split_bkey()
      #.....................................................................................................
      .pipe HOLLERITH.read_sub db, mangle: decode_rank, ( phrase ) =>
        [ ..., glyph, ]           = phrase
        sub_gte     = "so|glyph:#{glyph}|rank/cjt:"
        sub_lte     = @_lte_from_gte sub_gte
        sub_input   = db[ '%self' ].createKeyStream { gte: sub_gte, lte: sub_lte, }
        return [ glyph, sub_input, ]
      #.....................................................................................................
      .pipe D.$filter ( [ glyph, rank, ] ) -> rank < 1500
      #.....................................................................................................
      .pipe HOLLERITH.read_sub db, mangle: decode_lineup, ( record ) =>
        [ glyph, rank, ]  = record
        sub_gte           = "so|glyph:#{glyph}|guide/lineup/uchr:"
        sub_lte           = @_lte_from_gte sub_gte
        sub_input         = db[ '%self' ].createKeyStream { gte: sub_gte, lte: sub_lte, }
        return [ [ glyph, rank, ], sub_input, ]
      #.....................................................................................................
      .pipe HOLLERITH.read_sub db, ( record ) =>
        [ [ glyph, rank, ], guides, ] = record
        confluence                    = D.create_throughstream()
        stream_count                  = 0
        #...................................................................................................
        for guide in guides
          do ( guide ) =>
            guide_xncr        = xncr_from_uchr guide
            stream_count     += +1
            sub_gte           = "so|glyph:#{guide_xncr}|factor/shapeclass/wbf:"
            sub_lte           = @_lte_from_gte sub_gte
            sub_input         = db[ '%self' ].createKeyStream { gte: sub_gte, lte: sub_lte, }
            sub_input.on 'end', ->
              stream_count += -1
              if stream_count < 1
                confluence.end()
            sub_input
              .pipe @_$split_bkey()
              .pipe $ ( data, send ) =>
                [ ..., shapeclass_wbf, ] = data
                confluence.write [ guide, shapeclass_wbf, ]
        #...................................................................................................
        return [ [ glyph, rank, guides, ], confluence, ]
      #.....................................................................................................
      .pipe $ ( data, send ) -> send JSON.stringify data
      .pipe D.$show()

#-----------------------------------------------------------------------------------------------------------
### version for Hollerith2 DBs ###
@find_good_kwic_sample_glyphs_2 = ( db ) ->
  #.........................................................................................................
  step ( resume ) =>
    db ?= HOLLERITH.new_db '/Volumes/Storage/temp/jizura-hollerith2'
    #.......................................................................................................
    CHR = require '/Volumes/Storage/io/coffeenode-chr'
    chrs_from_text = ( text ) -> CHR.chrs_from_text text, input: 'xncr'
    #.......................................................................................................
    prefix  = [ 'pos', 'guide/lineup/length', 5, ]
    input   = HOLLERITH.create_phrasestream db, prefix
    # #.......................................................................................................
    # decode_rank = ( bkey ) =>
    #   [ ..., rank_txt, ] = @_split_bkey bkey
    #   return parseInt rank_txt, 10
    #.......................................................................................................
    decode_lineup = ( data ) =>
      [ ..., lineup, ] = data
      return chrs_from_text lineup.replace /\u3000/g, ''
    #.......................................................................................................
    xncr_from_uchr = ( uchr ) =>
      return if ( CHR.as_rsg uchr ) is 'u-pua' then ( CHR.as_xncr uchr, csg: 'jzr' ) else uchr
    #.......................................................................................................
    input
      #.....................................................................................................
      .pipe HOLLERITH.read_sub db, ( phrase ) =>
        [ glyph, _, lineup_length, ]    = phrase
        sub_prefix                      = [ 'spo', glyph, 'rank/cjt', ]
        sub_input                       = HOLLERITH.create_phrasestream db, sub_prefix
        return [ [ glyph, lineup_length, ], sub_input, ]
      #.....................................................................................................
      .pipe $ ( data, send ) =>
        [ [ glyph, lineup_length, ], [ _, _, rank, ], ] = data
        send [ glyph, lineup_length, rank, ]
      #.....................................................................................................
      .pipe D.$filter ( [ glyph, lineup_length, rank, ] ) -> rank < 15000
      #.....................................................................................................
      .pipe HOLLERITH.read_sub db, mangle: decode_lineup, ( data ) =>
        [ glyph, lineup_length, rank, ] = data
        sub_prefix                      = [ 'spo', glyph, 'guide/lineup/uchr', ]
        sub_input                       = HOLLERITH.create_phrasestream db, sub_prefix
        return [ [ glyph, lineup_length, rank, ], sub_input, ]
      #.....................................................................................................
      .pipe HOLLERITH.read_sub db, ( data ) =>
        [ [ glyph, lineup_length, rank, ], guides, ]  = data
        confluence                                    = D.create_throughstream()
        stream_count                                  = 0
        #...................................................................................................
        for guide in guides
          do ( guide ) =>
            guide_xncr        = xncr_from_uchr guide
            stream_count     += +1
            sub_prefix        = [ 'spo', guide_xncr, 'factor/shapeclass/wbf', ]
            sub_input         = HOLLERITH.create_phrasestream db, sub_prefix
            sub_input.on 'end', ->
              stream_count += -1
              if stream_count < 1
                confluence.end()
            sub_input
              .pipe $ ( data, send ) =>
                [ ..., shapeclass_wbf, ] = data
                confluence.write shapeclass_wbf
        #...................................................................................................
        return [ [ glyph, lineup_length, rank, guides, ], confluence, ]
      #.....................................................................................................
      .pipe D.$filter ( data ) =>
        [ [ glyph, lineup_length, rank, guides, ], shapeclasses_wbf..., ] = data
        counts = [ 0, 0, 0, 0, 0, ]
        for shapeclass_wbf in shapeclasses_wbf
          shapeclass_idx            = ( parseInt shapeclass_wbf[ 0 ], 10 ) - 1
          counts[ shapeclass_idx ] += +1
        return ( counts.join ',' ) is '1,1,1,1,1'
      #.....................................................................................................
      .pipe $ ( data, send ) -> send JSON.stringify data
      .pipe D.$show()

# '\u0000',
#   '\u0001',
#   '\u0002',
#   '\u0003',
#   '\u0004',
#   '\u0005',
#   '\u0006',
#   '\u0007',
#   '\b',
#   '\t',
#   '\n',
#   '\u000b',
#   '\f',
#   '\r',
#   '\u000e',
#   '\u000f',
#   '\u0010',
#   '\u0011',
#   '\u0012',
#   '\u0013',
#   '\u0014',
#   '\u0015',
#   '\u0016',
#   '\u0017',
#   '\u0018',
#   '\u0019',
#   '\u001a',
#   '\u001b',
#   '\u001c',
#   '\u001d',
#   '\u001e',
#   '\u001f',


"""
〇〓
␀␁␂␃␄␅␆␇␈␉␊␋␌␍␎␏␐␑␒␓␔␕␖␗␘␙␚␛␜␝␞␟␠␡␢␣␤␥␦
ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ
！＂＃＄％＆＇（）＊＋，－．／０１２３４５６７８９：；＜＝＞？＠ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ［＼］＾＿｀ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ｛｜｝～｟｠
!"#$%&'()*+,-./0123456789:;<=>?
@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_
`abcdefghijklmnopqrstuvwxyz{|}~

¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿À
ÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßà
áâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ
"""

"""

⓿❶❷❸❹❺❻❼❽❾❿⓫⓬⓭⓮⓯⓰⓱⓲⓳⓴
⓵⓶⓷⓸⓹⓺⓻⓼⓽⓾
㍘㍙㍚㍛㍜㍝㍞㍟㍠㍡㍢㍣㍤㍥㍦㍧㍨㍩㍪㍫㍬㍭㍮㍯㍰
⑴⑵⑶⑷⑸⑹⑺⑻⑼⑽⑾⑿⒀⒁⒂⒃⒄⒅⒆⒇
⒈⒉⒊⒋⒌⒍⒎⒏⒐⒑⒒⒓⒔⒕⒖⒗⒘⒙⒚⒛
⒜⒝⒞⒟⒠⒡⒢⒣⒤⒥⒦⒧⒨⒩⒪⒫⒬⒭⒮⒯⒰⒱⒲⒳⒴⒵
㈠㈡㈢㈣㈤㈥㈦㈧㈨㈩

㋀㋁㋂㋃㋄㋅㋆㋇㋈㋉㋊㋋

㈀㈁㈂㈃㈄㈅㈆㈇㈈㈉㈊㈋㈌㈍㈎㈏㈐㈑㈒㈓㈔㈕㈖㈗㈘㈙㈚㈛㈜㈝㈞㈟
㈪㈫㈬㈭㈮㈯㈰㈱㈲㈳㈴㈵㈶㈷㈸㈹㈺㈻㈼㈽㈾㈿
㉀㉁㉂㉃㉄㉅㉆㉇
㉠㉡㉢㉣㉤㉥㉦㉧㉨㉩㉪㉫㉬㉭㉮㉯㉰㉱㉲㉳㉴㉵㉶㉷㉸㉹㉺㉻㉼㉽㉾㉿
㌀㌁㌂㌃㌄㌅㌆㌇㌈㌉㌊㌋㌌㌍㌎㌏㌐㌑㌒㌓㌔㌕㌖㌗㌘㌙㌚㌛㌜㌝㌞㌟
㌠㌡㌢㌣㌤㌥㌦㌧㌨㌩㌪㌫㌬㌭㌮㌯㌰㌱㌲㌳㌴㌵㌶㌷㌸㌹㌺㌻㌼㌽㌾㌿
㍀㍁㍂㍃㍄㍅㍆㍇㍈㍉㍊㍋㍌㍍㍎㍏㍐㍑㍒㍓㍔㍕㍖㍗
∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎
⚀⚁⚂⚃⚄⚅⚀⚁⚂⚃⚄⚅⚀⚁⚂⚃⚄⚅⚀⚁⚂⚃⚄⚅⚀⚁⚂⚃⚄⚅⚄⚅
ĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮį
    〓㏠㏡㏢㏣㏤㏥㏦㏧㏨㏩㏪㏫㏬㏭㏮㏯㏰㏱㏲㏳㏴㏵㏶㏷㏸㏹㏺㏻㏼㏽㏾
    〓ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ〓〓〓〓〓
    〓ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ〓〓〓〓〓

"""

@encodings =

  dbcs2: """
    ⓪①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳㉑㉒㉓㉔㉕㉖㉗㉘㉙㉚㉛
    ㉜！＂＃＄％＆＇（）＊＋，－．／０１２３４５６７８９：；＜＝＞？
    ＠ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ［＼］＾＿
    ｀ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ｛｜｝～㉠
    ㉝㉞㉟㊱㊲㊳㊴㊵㊶㊷㊸㊹㊺㊻㊼㊽㊾㊿㋐㋑㋒㋓㋔㋕㋖㋗㋘㋙㋚㋛㋜㋝
    ㋞㋟㋠㋡㋢㋣㋤㋥㋦㋧㋨㋩㋪㋫㋬㋭㋮㋯㋰㋱㋲㋳㋴㋵㋶㋷㋸㋹㋺㋻㋼㋽
    ㋾㊊㊋㊌㊍㊎㊏㊐㊑㊒㊓㊔㊕㊖㊗㊘㊙㊚㊛㊜㊝㊞㊟㊠㊡㊢㊣㊤㊥㊦㊧㊨
    ㊩㊪㊫㊬㊭㊮㊯㊰㊀㊁㊂㊃㊄㊅㊆㊇㊈㊉㉈㉉㉊㉋㉌㉍㉎㉏⓵⓶⓷⓸⓹〓
    """

  aleph: """
    БДИЛЦЧШЭЮƆƋƏƐƔƥƧƸψŐőŒœŊŁłЯɔɘɐɕəɞ
    ␣!"#$%&'()*+,-./0123456789:;<=>?
    @ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_
    `abcdefghijklmnopqrstuvwxyz{|}~ω
    ΓΔΘΛΞΠΣΦΨΩαβγδεζηθικλμνξπρςστυφχ
    Ж¡¢£¤¥¦§¨©ª«¬Я®¯°±²³´µ¶·¸¹º»¼½¾¿
    ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞß
    àáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ
    """

  rdctn: """
    ∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎
    ␣!"#$%&'()*+,-./0123456789:;<=>?
    @ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_
    `abcdefghijklmnopqrstuvwxyz{|}~∎
    ∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎∎
    ∎¡¢£¤¥¦§¨©ª«¬Я®¯°±²³´µ¶·¸¹º»¼½¾¿
    ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞß
    àáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ
    """




#-----------------------------------------------------------------------------------------------------------
@_chrs_of = ( text ) ->
  text = text.split /([\ud800-\udbff].|.)/
  return ( chr for chr in text when chr isnt '' )

#-----------------------------------------------------------------------------------------------------------
@compile_encodings = ->
  for name, encoding of @encodings
    encoding = @_chrs_of encoding.replace /\n+/g, ''
    unless ( length = encoding.length ) is 256
      throw new Error "expected 256 characters, found #{length} in encoding #{rpr name}"
    @encodings[ name ] = encoding
  return null

@compile_encodings()

#-----------------------------------------------------------------------------------------------------------
@show_encoding_sample = ->
  encoding  = @encodings[ 'dbcs2' ]
  encoding  = @encodings[ 'rdctn' ]
  phrases   = [
    [ '丁', 'strokecount',     2,                          ]
    [ '三', 'strokecount',     3,                          ]
    [ '夫', 'strokecount',     5,                          ]
    [ '國', 'strokecount',     11,                         ]
    [ '形', 'strokecount',     7,                          ]
    [ '丁', 'componentcount',  1,                          ]
    [ '三', 'componentcount',  1,                          ]
    [ '夫', 'componentcount',  1,                          ]
    [ '國', 'componentcount',  4,                          ]
    [ '形', 'componentcount',  2,                          ]
    [ '丁', 'components',      [ '丁', ],                  ]
    [ '三', 'components',      [ '三', ],                  ]
    [ '夫', 'components',      [ '夫', ],                  ]
    [ '國', 'components',      [ '囗', '戈', '口', '一', ], ]
    [ '形', 'components',      [ '开', '彡', ],             ]
    ]
  for [ sbj, prd, obj, ] in phrases
    key       = ( HOLLERITH.CODEC.encode [ sbj, prd, ], )
    value     = ( new Buffer JSON.stringify obj )
    key_rpr   = ( encoding[ key[ idx ] ] for idx in [ 0 ... key.length ] ).join ''
    value_rpr = ( encoding[ value[ idx ] ] for idx in [ 0 ... value.length ] ).join ''
    urge key_rpr, '┊', value_rpr
  # chrs = []
  # for cid in [ 0 .. 255 ]
  #   chrs.push String.fromCodePoint cid
  #   chrs.push '\n' if cid > 0 and cid % 32 is 0
  # debug '©ZgY4D', chrs
  # help chrs.join ''
  # urge ( String.fromCodePoint cid for cid in [ 0x2400 .. 0x2426 ] ).join ''
  # urge ( String.fromCodePoint cid for cid in [ 0x24b6 .. 0x24e9 ] ).join ''
  # urge ( String.fromCodePoint cid for cid in [ 0xff01 .. 0xff60 ] ).join ''


############################################################################################################
unless module.parent?

  #---------------------------------------------------------------------------------------------------------
  options =
    #.......................................................................................................
    # 'route':                njs_path.join __dirname, '../dbs/demo'
    'route':                '/Volumes/Storage/io/jizura-datasources/data/leveldb'
    # 'route':            '/tmp/leveldb'
  #---------------------------------------------------------------------------------------------------------
  debug '©AoOAS', options
  # step ( resume ) =>
  #   yield @initialize resume
  #   db = options[ 'db' ]
  #   @find_good_kwic_sample_glyphs_2 db
  # @copy_jizura_db()
  # @dump_jizura_db()
  # @find_good_kwic_sample_glyphs_2()
  @show_encoding_sample()
  # @compile_encodings()


