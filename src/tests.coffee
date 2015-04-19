


############################################################################################################
njs_path                  = require 'path'
# njs_fs                    = require 'fs'
join                      = njs_path.join
#...........................................................................................................
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'HOLLERITH/tests'
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
# eventually                = suspend.eventually
# immediately               = suspend.immediately
# repeat_immediately        = suspend.repeat_immediately
# every                     = suspend.every
#...........................................................................................................
test                      = require 'guy-test'
#...........................................................................................................
D                         = require 'pipedreams2'
$                         = D.remit.bind D
#...........................................................................................................
HOLLERITH                 = require './main'
db                        = null


#-----------------------------------------------------------------------------------------------------------
@[ "keys 0" ] = ( T, done ) ->
  key_0   = HOLLERITH.new_key     db, 'so', 'glyph', '家', 'strokeorder', '4451353334'
  key_1   = HOLLERITH.new_so_key  db,       'glyph', '家', 'strokeorder', '4451353334'
  matcher = [ 'so', [ 'glyph', '家' ], [ 'strokeorder', '4451353334' ], null ]
  T.eq key_0, matcher
  T.eq key_1, key_0
  done()

#-----------------------------------------------------------------------------------------------------------
@[ "keys 1" ] = ( T, done ) ->
  [ sk, sv, ok, ov, ] = [ 'glyph', '家', 'strokeorder', '4451353334', ]
  [ so_key_0, os_key_0, ] = HOLLERITH.new_keys db, 'so', sk, sv, ok, ov
  so_key_1 = HOLLERITH.new_so_key db, sk, sv, ok, ov
  os_key_1 = HOLLERITH.new_os_key db, ok, ov, sk, sv
  T.eq so_key_0, so_key_1
  T.eq os_key_0, os_key_1
  done()

#-----------------------------------------------------------------------------------------------------------
@_main = ( handler ) ->
  db = HOLLERITH.new_db join __dirname, '..', 'dbs/tests'
  test @, 'timeout': 2500

############################################################################################################
unless module.parent?
  @_main()
