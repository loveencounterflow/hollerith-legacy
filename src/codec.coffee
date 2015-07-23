


############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'HOLLERITH/CODEC'
debug                     = CND.get_logger 'debug',     badge
warn                      = CND.get_logger 'warn',      badge


#-----------------------------------------------------------------------------------------------------------
last_unicode_chr        = ( String.fromCharCode 0xdbff ) + ( String.fromCharCode 0xdfff )
### should always be 3 in modern versions of NodeJS: ###
max_bytes_per_chr       = Math.max ( new Buffer "\uffff" ).length, ( new Buffer last_unicode_chr ).length / 2
rbuffer_min_size        = 1024
rbuffer_delta_size      = 1024
rbuffer_max_size        = 65536
rbuffer_new_size        = Math.floor ( rbuffer_max_size + rbuffer_min_size ) / 2
rbuffer                 = new Buffer rbuffer_min_size
buffer_too_short_error  = new Error "buffer too short"

#-----------------------------------------------------------------------------------------------------------
@[ 'typemarkers' ]  = {}
#...........................................................................................................
tm_lo               = @[ 'typemarkers'  ][ 'lo'         ] = 0x00
tm_null             = @[ 'typemarkers'  ][ 'null'       ] = 'B'.codePointAt 0
tm_false            = @[ 'typemarkers'  ][ 'false'      ] = 'C'.codePointAt 0
tm_true             = @[ 'typemarkers'  ][ 'true'       ] = 'D'.codePointAt 0
tm_list             = @[ 'typemarkers'  ][ 'list'       ] = 'E'.codePointAt 0
tm_date             = @[ 'typemarkers'  ][ 'date'       ] = 'G'.codePointAt 0
tm_ninfinity        = @[ 'typemarkers'  ][ 'ninfinity'  ] = 'J'.codePointAt 0
tm_nnumber          = @[ 'typemarkers'  ][ 'nnumber'    ] = 'K'.codePointAt 0
tm_pnumber          = @[ 'typemarkers'  ][ 'pnumber'    ] = 'L'.codePointAt 0
tm_pinfinity        = @[ 'typemarkers'  ][ 'pinfinity'  ] = 'M'.codePointAt 0
tm_text             = @[ 'typemarkers'  ][ 'text'       ] = 'T'.codePointAt 0
tm_hi               = @[ 'typemarkers'  ][ 'hi'         ] = 0xff

#-----------------------------------------------------------------------------------------------------------
@[ 'bytecounts' ]   = {}
#...........................................................................................................
bytecount_singular  = @[ 'bytecounts'   ][ 'singular'   ] = 1
bytecount_number    = @[ 'bytecounts'   ][ 'number'     ] = 9
bytecount_date      = @[ 'bytecounts'   ][ 'date'       ] = bytecount_number + 1

#-----------------------------------------------------------------------------------------------------------
@[ 'sentinels' ]  = {}
#...........................................................................................................
### http://www.merlyn.demon.co.uk/js-datex.htm ###
@[ 'sentinels' ][ 'firstdate' ] = new Date -8640000000000000
@[ 'sentinels' ][ 'lastdate'  ] = new Date +8640000000000000

#-----------------------------------------------------------------------------------------------------------
@[ 'keys' ]  = {}
#...........................................................................................................
@[ 'keys' ][ 'lo' ] = new Buffer [ @[ 'typemarkers' ][ 'lo' ] ]
@[ 'keys' ][ 'hi' ] = new Buffer [ @[ 'typemarkers' ][ 'hi' ] ]

#-----------------------------------------------------------------------------------------------------------
grow_rbuffer = ( delta_size ) ->
  delta_size ?= rbuffer_delta_size
  return null if delta_size < 1
  # warn "growing rbuffer (#{delta_size} bytes)"
  new_result_buffer = new Buffer rbuffer.length + delta_size
  rbuffer.copy new_result_buffer
  rbuffer     = new_result_buffer
  return null

#-----------------------------------------------------------------------------------------------------------
release_extraneous_rbuffer_bytes = ->
  rbuffer = new Buffer rbuffer_new_size if rbuffer.length > rbuffer_max_size
  return null


#===========================================================================================================
# VARIANTS
#-----------------------------------------------------------------------------------------------------------
write_singular = ( idx, value ) ->
  throw buffer_too_short_error unless rbuffer.length >= idx + bytecount_singular
  if      value is null   then typemarker = tm_null
  else if value is false  then typemarker = tm_false
  else if value is true   then typemarker = tm_true
  else throw new Error "unable to encode value of type #{CND.type_of value}"
  rbuffer[ idx ] = typemarker
  return idx + bytecount_singular

#-----------------------------------------------------------------------------------------------------------
read_singular = ( buffer, idx ) ->
  switch typemarker = buffer[ idx ]
    when tm_null  then value = null
    when tm_false then value = false
    when tm_true  then value = true
    else throw new Error "unable to decode 0x#{typemarker.toString 16} at index #{idx} (#{rpr buffer})"
  return [ idx + bytecount_singular, value, ]


#===========================================================================================================
# NUMBERS
#-----------------------------------------------------------------------------------------------------------
write_number = ( idx, number ) ->
  throw buffer_too_short_error unless rbuffer.length >= idx + bytecount_number
  if number < 0
    type    = tm_nnumber
    number  = -number
  else
    type    = tm_pnumber
  rbuffer[ idx ] = type
  rbuffer.writeDoubleBE number, idx + 1
  _invert_buffer rbuffer, idx if type is tm_nnumber
  return idx + bytecount_number

#-----------------------------------------------------------------------------------------------------------
write_infinity = ( idx, number ) ->
  throw buffer_too_short_error unless rbuffer.length >= idx + bytecount_singular
  rbuffer[ idx ] = if number is -Infinity then tm_ninfinity else tm_pinfinity
  return idx + bytecount_singular

#-----------------------------------------------------------------------------------------------------------
read_nnumber = ( buffer, idx ) ->
  throw new Error "not a negative number at index #{idx}" unless buffer[ idx ] is tm_nnumber
  copy = _invert_buffer ( new Buffer buffer.slice idx, idx + bytecount_number ), 0
  return [ idx + bytecount_number, -( copy.readDoubleBE 1 ), ]

#-----------------------------------------------------------------------------------------------------------
read_pnumber = ( buffer, idx ) ->
  throw new Error "not a positive number at index #{idx}" unless buffer[ idx ] is tm_pnumber
  return [ idx + bytecount_number, buffer.readDoubleBE idx + 1, ]

#-----------------------------------------------------------------------------------------------------------
_invert_buffer = ( buffer, idx ) ->
  buffer[ i ] = ~buffer[ i ] for i in [ idx + 1 .. idx + 8 ]
  return buffer


#===========================================================================================================
# DATES
#-----------------------------------------------------------------------------------------------------------
write_date = ( idx, date ) ->
  number          = +date
  rbuffer[ idx ]  = tm_date
  new_idx         = write_number idx + 1, number
  return new_idx

#-----------------------------------------------------------------------------------------------------------
read_date = ( buffer, idx ) ->
  throw new Error "not a date at index #{idx}" unless buffer[ idx ] is tm_date
  switch type = buffer[ idx + 1 ]
    when tm_nnumber    then [ idx, value, ] = read_nnumber    buffer, idx + 1
    when tm_pnumber    then [ idx, value, ] = read_pnumber    buffer, idx + 1
    else throw new Error "unknown date type marker 0x#{type.toString 16} at index #{idx}"
  return [ idx, ( new Date value ), ]


#===========================================================================================================
# TEXTS
#-----------------------------------------------------------------------------------------------------------
write_text = ( idx, text ) ->
  text                              = text.replace /\x01/g, '\x01\x02'
  text                              = text.replace /\x00/g, '\x01\x01'
  length_estimate                   = max_bytes_per_chr * text.length + 3
  grow_rbuffer length_estimate - rbuffer.length - idx - 1
  rbuffer[ idx                    ] = tm_text
  byte_count                        = rbuffer.write text, idx + 1
  rbuffer[ idx + byte_count + 1   ] = tm_lo
  return idx + byte_count + 2

#-----------------------------------------------------------------------------------------------------------
read_text = ( buffer, idx ) ->
  # urge '©J2d6R', buffer[ idx ], buffer[ idx ] is tm_text
  throw new Error "not a text at index #{idx}" unless buffer[ idx ] is tm_text
  stop_idx = idx
  loop
    stop_idx += +1
    break if ( byte = buffer[ stop_idx ] ) is tm_lo
    throw new Error "runaway string at index #{idx}" unless byte?
  R = buffer.toString 'utf-8', idx + 1, stop_idx
  R = R.replace /\x01\x02/g, '\x01'
  R = R.replace /\x01\x01/g, '\x00'
  return [ stop_idx + 1, R, ]


#===========================================================================================================
# LISTS
#-----------------------------------------------------------------------------------------------------------
### TAINT remove is_top_level if not used ###
read_list = ( buffer, idx, is_top_level ) ->
  # urge '©J2d6R', buffer[ idx ], buffer[ idx ] is tm_text
  # throw new Error "unable to read nested list at index #{idx}" unless is_top_level
  throw new Error "not a list at index #{idx}" unless buffer[ idx ] is tm_list
  R     = []
  idx  += +1
  loop
    break if ( byte = buffer[ idx ] ) is tm_lo
    [ idx, value, ] = _decode buffer, idx, false, true
    R.push value[ 0 ]
    throw new Error "runaway list at index #{idx}" unless byte?
  return [ idx + 1, R, ]


#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
write = ( idx, value ) ->
  switch type = CND.type_of value
    when 'text'       then return write_text     idx, value
    when 'number'     then return write_number   idx, value
    when 'jsinfinity' then return write_infinity idx, value
    when 'jsdate'     then return write_date     idx, value
  #.........................................................................................................
  return write_singular  idx, value


#===========================================================================================================
# PUBLIC API
#-----------------------------------------------------------------------------------------------------------
@encode = ( key, extra_byte ) ->
  rbuffer.fill 0x99
  throw new Error "expected a list, got a #{type}" unless ( type = CND.type_of key ) is 'list'
  idx = _encode key, 0, true
  #.........................................................................................................
  if extra_byte?
    rbuffer[ idx ]  = extra_byte
    idx            += +1
  #.........................................................................................................
  R = new Buffer idx
  rbuffer.copy R, 0, 0, idx
  release_extraneous_rbuffer_bytes()
  #.........................................................................................................
  return R

#-----------------------------------------------------------------------------------------------------------
### TAINT remove is_top_level if not used ###
_encode = ( key, idx, is_top_level ) ->
  last_element_idx = key.length - 1
  # debug '©GP4RE', rpr key
  for element, element_idx in key
    loop
      try
        if CND.isa_list element
          # unless is_top_level
          #   throw new Error "unable to encode nested list"
          rbuffer[ idx ]  = tm_list
          idx            += +1
          for sub_element in element
            idx = _encode [ sub_element, ], idx, false
          rbuffer[ idx ]  = tm_lo
          idx            += +1
        else
          idx = write idx, element
        break
      catch error
        unless error is buffer_too_short_error
          key_rpr = []
          for element in key
            if CND.isa_jsbuffer element
              key_rpr.push "#{@rpr_of_buffer null, key[ 2 ]}"
            else
              key_rpr.push rpr element
          warn "detected problem with key [ #{rpr key_rpr.join ', '} ]"
          throw error
        grow_rbuffer()
  #.........................................................................................................
  return idx

#-----------------------------------------------------------------------------------------------------------
@decode = ( buffer ) ->
  return ( _decode buffer, 0, true, false )[ 1 ]

#-----------------------------------------------------------------------------------------------------------
### TAINT remove is_top_level if not used ###
_decode = ( buffer, idx, is_top_level, single ) ->
  R         = []
  last_idx  = buffer.length - 1
  loop
    break if idx > last_idx
    switch type = buffer[ idx ]
      when tm_list       then [ idx, value, ] = read_list       buffer, idx, is_top_level
      when tm_text       then [ idx, value, ] = read_text       buffer, idx
      when tm_nnumber    then [ idx, value, ] = read_nnumber    buffer, idx
      when tm_ninfinity  then [ idx, value, ] = [ idx + 1, -Infinity, ]
      when tm_pnumber    then [ idx, value, ] = read_pnumber    buffer, idx
      when tm_pinfinity  then [ idx, value, ] = [ idx + 1, +Infinity, ]
      when tm_date       then [ idx, value, ] = read_date       buffer, idx
      else                    [ idx, value, ] = read_singular   buffer, idx
    R.push value
    break if single
  #.........................................................................................................
  return [ idx, R ]


# debug ( require './dump' ).rpr_of_buffer null, buffer = @encode [ 'aaa', [], ]
# debug '©tP5xQ', @decode buffer

#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
@encodings =

  #.........................................................................................................
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
  #.........................................................................................................
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
  #.........................................................................................................
  rdctn: """
    ∇≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡
    ␣!"#$%&'()*+,-./0123456789:;<=>?
    @ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_
    `abcdefghijklmnopqrstuvwxyz{|}~≡
    ∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃
    ∃∃¢£¤¥¦§¨©ª«¬Я®¯°±²³´µ¶·¸¹º»¼½¾¿
    ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞß
    àáâãäåæçèéêëìíîïðñò≢≢≢≢≢≢≢≢≢≢≢≢Δ
    """


#-----------------------------------------------------------------------------------------------------------
@rpr_of_buffer = ( db, buffer, encoding ) ->
  return ( rpr buffer ) + ' ' +  @_encode_buffer db, buffer, encoding

#-----------------------------------------------------------------------------------------------------------
@_encode_buffer = ( db, buffer, encoding = 'rdctn' ) ->
  ### TAINT use switch, emit error if `encoding` not list or known key ###
  encoding = @encodings[ encoding ] unless CND.isa_list encoding
  return ( encoding[ buffer[ idx ] ] for idx in [ 0 ... buffer.length ] ).join ''

#-----------------------------------------------------------------------------------------------------------
@_compile_encodings = ->
  #.........................................................................................................
  chrs_of = ( text ) ->
    text = text.split /([\ud800-\udbff].|.)/
    return ( chr for chr in text when chr isnt '' )
  #.........................................................................................................
  for name, encoding of @encodings
    encoding = chrs_of encoding.replace /\n+/g, ''
    unless ( length = encoding.length ) is 256
      throw new Error "expected 256 characters, found #{length} in encoding #{rpr name}"
    @encodings[ name ] = encoding
  return null
@_compile_encodings()
