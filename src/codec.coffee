


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


#-----------------------------------------------------------------------------------------------------------
sorter            = ( a, b ) -> a.compare b
last_unicode_chr  = ( String.fromCharCode 0xdbff ) + ( String.fromCharCode 0xdfff )
### should always be 3 in modern versions of NodeJS: ###
max_bytes_per_chr = Math.max ( new Buffer "\uffff" ).length, ( new Buffer last_unicode_chr ).length / 2
buffer_min_size   = 1024
buffer_delta_size = 1024
buffer_max_size   = 65536
buffer_new_size   = Math.floor ( buffer_max_size + buffer_min_size ) / 2
text_buffer       = new Buffer buffer_min_size
result_buffer     = new Buffer buffer_min_size

#-----------------------------------------------------------------------------------------------------------
@type_x           = 0xc0
@type_x           = 0xc1
@type_x           = 0xf5
@type_x           = 0xf6
@type_x           = 0xf7
@type_x           = 0xf8
@type_x           = 0xf9
@type_ninfinity   = 0xfa
@type_nnumber     = 0xfb
@type_pnumber     = 0xfc
@type_pinfinity   = 0xfd
@type_text        = 0xfe
@type_last        = 0xff

#-----------------------------------------------------------------------------------------------------------
@bytecount_number = 9

#-----------------------------------------------------------------------------------------------------------
buffer_too_short_error = new Error "buffer too short"

#-----------------------------------------------------------------------------------------------------------
@resize_result_buffer = ->
  new_result_buffer = new Buffer result_buffer.length + buffer_delta_size
  result_buffer.copy new_result_buffer
  result_buffer     = new_result_buffer
  return null

#-----------------------------------------------------------------------------------------------------------
@release_result_buffer = ->
  result_buffer = new Buffer buffer_new_size if result_buffer.length > buffer_max_size
  return null


#===========================================================================================================
# NUMBERS
#-----------------------------------------------------------------------------------------------------------
@write_number = ( buffer, idx, number ) ->
  throw buffer_too_short_error unless buffer.length >= idx + @bytecount_number
  if number < 0
    type    = @type_nnumber
    number  = -number
  else
    type    = @type_pnumber
  buffer[ idx ] = type
  buffer.writeDoubleBE number, idx + 1
  @_invert_buffer buffer, idx if type is @type_nnumber
  return idx + @bytecount_number

#-----------------------------------------------------------------------------------------------------------
@read_nnumber = ( buffer, idx ) ->
  throw new Error "not a negative number at index #{idx}" unless buffer[ idx ] is @type_nnumber
  copy = @_invert_buffer ( new Buffer buffer.slice idx, idx + @bytecount_number ), 0
  return [ idx + @bytecount_number, -( copy.readDoubleBE 1 ), ]

#-----------------------------------------------------------------------------------------------------------
@read_pnumber = ( buffer, idx ) ->
  throw new Error "not a positive number at index #{idx}" unless buffer[ idx ] is @type_pnumber
  return [ idx + @bytecount_number, buffer.readDoubleBE idx + 1, ]

#-----------------------------------------------------------------------------------------------------------
@_invert_buffer = ( buffer, idx ) ->
  buffer[ i ] = ~buffer[ i ] for i in [ idx + 1 .. idx + 8 ]
  return buffer


#===========================================================================================================
# TEXT
#-----------------------------------------------------------------------------------------------------------
@write_text = ( buffer, idx, text ) ->
  length_estimate = max_bytes_per_chr * text.length
  if length_estimate > text_buffer.length
    text_buffer = new Buffer length_estimate
  byte_count = text_buffer.write text, 'utf-8'
  ### TAINT estimate incorrect ###
  throw buffer_too_short_error unless buffer.length >= idx + byte_count
  buffer[ idx                   ] = @type_text
  buffer[ idx + byte_count + 1  ] = @type_last
  text_buffer.copy buffer, idx + 1, 0, byte_count
  ### Reduce intermediary buffer size in case it exceeds limits: ###
  text_buffer = new Buffer buffer_new_size if text_buffer.length > buffer_max_size
  return idx + byte_count + 2

#-----------------------------------------------------------------------------------------------------------
@read_text = ( buffer, idx ) ->
  urge '©J2d6R', buffer[ idx ], buffer[ idx ] is @type_text
  throw new Error "not a text at index #{idx}" unless buffer[ idx ] is @type_text
  stop_idx = idx + 1
  loop
    stop_idx += +1
    break if ( byte = buffer[ stop_idx ] ) is @type_last
    throw new Error "runaway string at index #{idx}" unless byte?
  text = buffer.toString 'utf-8', idx + 1, stop_idx
  return [ stop_idx + 1, text, ]


#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
@write = ( buffer, idx, value ) ->
  switch type = CND.type_of value
    when 'infinity'
      throw new Error "not implemented"
    when 'text'   then return @write_text     buffer, idx, value
    when 'number' then return @write_number   buffer, idx, value
  throw new Error "unable to encode value of type #{type}"


#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
@encode = ( value ) ->
  throw new Error "expected a list, got a #{type}" unless ( type = CND.type_of value ) is 'list'
  idx = 0
  for element in value
    loop
      try
        idx = @write result_buffer, idx, element
        break
      catch error
        throw error unless error is buffer_too_short_error
        @resize_result_buffer()
  #.........................................................................................................
  R = new Buffer idx
  result_buffer.copy R, 0, 0, idx
  @release_result_buffer()
  #.........................................................................................................
  return R

#-----------------------------------------------------------------------------------------------------------
@decode = ( buffer ) ->
  R         = []
  idx       = 0
  last_idx  = buffer.length - 1
  loop
    break if idx >= last_idx
    switch type = buffer[ idx ]
      when @type_text     then [ idx, value, ] = @read_text     buffer, idx
      when @type_nnumber  then [ idx, value, ] = @read_nnumber  buffer, idx
      when @type_pnumber  then [ idx, value, ] = @read_pnumber  buffer, idx
      else throw new Error "unknown type marker 0x#{type.toString 16} at index #{idx}"
    R.push value
  #.........................................................................................................
  return R

#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
@f = ->
  buffers = []
  for n in [ -10 .. +10 ]
    buffer = new Buffer 9
    @write_number buffer, n / 2, 0
    buffers.push buffer
  buffers.sort sorter
  for buffer in buffers
    debug '©eQulN', buffer, @read_number buffer, 0


############################################################################################################
unless module.parent?
  # @f()

  # b = new Buffer 9
  # debug '©K3IC9', b
  # @write_number b, -123.456, 0
  # debug '©EH88B', @read_number b, 0

  b = new Buffer 30
  # text = 'abcdef中國皇帝𪜌'
  text  = 'abcde'
  idx   = 0
  debug '©aKjBW', idx = @write_text   b, idx, text
  debug '©aKjBW', idx = @write_number b, idx, -1234
  debug '©aKjBW', idx = @write_text   b, idx, 'XXXX'
  help '©w1rDL', b
  # help '©w1rDL', idx
  # debug '©w1rDL', b.toString 'utf-8', 1
  # b = b.slice 0, 5
  debug '©c7dYA', rpr @read_text b, 0
  debug '©c7dYA', rpr @read_text b, idx - 6
  c = b.slice 0, idx
  debug '©c7dYA', @decode c

# for n in [ 192, 193, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255, ]
#   debug '©d9f7g', '0x' + n.toString 16

  debug '©yG4FD', new Buffer "\uffff"
  debug '©yG4FD', @encode [ 'foo', ]
  debug '©yG4FD', @encode [ 'foo', 1234, ]
  debug '©yG4FD', @encode [ 'foo', 1234, 'foo', ]
  debug '©yG4FD', @decode @encode [ 'foo', ]
  debug '©yG4FD', @decode @encode [ 'foo', 1234, ]
  debug '©yG4FD', @decode @encode [ 'foo', 1234, 'foo', ]










