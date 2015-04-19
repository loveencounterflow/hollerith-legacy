


############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'HOLLERITH/dump'
log                       = CND.get_logger 'plain',     badge
info                      = CND.get_logger 'info',      badge
whisper                   = CND.get_logger 'whisper',   badge
alert                     = CND.get_logger 'alert',     badge
debug                     = CND.get_logger 'debug',     badge
warn                      = CND.get_logger 'warn',      badge
help                      = CND.get_logger 'help',      badge
urge                      = CND.get_logger 'urge',      badge
echo                      = CND.echo.bind CND
m                         = require 'morton'
TEXT                      = require 'coffeenode-text'
ƒ                         = ( n ) -> TEXT.flush_right ( CND.format_number n ), 5


R = []
for x in [ 1000 .. 1008 ]
  for y in [ 500 .. 508 ]
    R.push [ ( m x, y ), x, y, ]

R.sort ( [ z0, x0, y0, ], [ z1, x1, y1, ] ) ->
  return -1 if z0 < z1
  return +1 if z0 > z1
  return  0


for [ z, x, y, ] in R
  help ( ƒ z ), ( ƒ x ), ( ƒ y )


urge ( m 1, 1, ), ( m 5, 5, ), ( m 6, 50, )
# urge m.code 62, 6, 7










