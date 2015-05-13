


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
# #...........................................................................................................
# test                      = require 'guy-test'
# #...........................................................................................................
# D                         = require 'pipedreams2'
# $                         = D.remit.bind D
# #...........................................................................................................
# HOLLERITH                 = require './main'
# db                        = null
# #...........................................................................................................
BYTEWISE                  = require 'bytewise'
# levelup                   = require 'levelup'
# leveldown                 = require 'leveldown'
CODEC                     = require './codec'
PASSPHRASE                = require 'coffeenode-passphrase'
ƒ                         = CND.format_number.bind CND

#-----------------------------------------------------------------------------------------------------------
@test_h2c = ( probes ) ->
  t0 = +new Date()
  CODEC.encode probe for probe in probes
  t1 = +new Date()
  return t1 - t0

#-----------------------------------------------------------------------------------------------------------
@test_bytewise = ( probes ) ->
  t0 = +new Date()
  BYTEWISE.encode probe for probe in probes
  t1 = +new Date()
  return t1 - t0

#-----------------------------------------------------------------------------------------------------------
@test_json = ( probes ) ->
  t0 = +new Date()
  JSON.stringify probe for probe in probes
  t1 = +new Date()
  return t1 - t0

#-----------------------------------------------------------------------------------------------------------
@main = ->
  n = 1e5
  # n = 10
  # routes = ( PASSPHRASE.get_passphrase() for _ in [ 1 .. n ] )
  whisper "generating #{ƒ n} probes"
  values = [
    0
    +Number.MIN_VALUE
    +Number.EPSILON
    +32451
    +32451.5
    +32452
    +32453
    +123456789
    ]
  # values = [
  #   'xxxx'
  #   ]
  probes = ( [ PASSPHRASE.get_passphrase(), values[ idx % values.length ] ] for idx in [ 1 .. n ] )
  help "generated #{ƒ probes.length} probes; now performing benchmarks"
  bytewise_ms = @test_bytewise probes
  h2c_ms      = @test_h2c      probes
  json_ms     = @test_json     probes
  urge "encode bytewise: #{ƒ bytewise_ms}ms (#{(bytewise_ms / json_ms * 100).toFixed 2}%)"
  urge "encode h2c:      #{ƒ h2c_ms}ms (#{(h2c_ms / json_ms * 100).toFixed 2}%)"
  urge "encode json:     #{ƒ json_ms}ms (#{(json_ms / json_ms * 100).toFixed 2}%)"

############################################################################################################
unless module.parent?
  @main()











