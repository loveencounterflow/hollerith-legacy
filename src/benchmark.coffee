







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
eventually                = suspend.eventually
immediately               = suspend.immediately
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
times = {}

#-----------------------------------------------------------------------------------------------------------
start = ( name ) ->
  whisper "start #{name}"
  times[ name ] = process.hrtime()
  return null

#-----------------------------------------------------------------------------------------------------------
stop = ( name ) ->
  dt = process.hrtime times[ name ]
  times[ name ] = dt[ 0 ] + dt[ 1 ] / 1e9
  return null

#-----------------------------------------------------------------------------------------------------------
report = ( n, min_name ) ->
  columnify_settings =
    config:
      dt:     { align: 'right' }
      rel:    { align: 'right' }
      max:    { align: 'right' }
  if min_name?
    min = times[ min_name ]
  else
    min = Math.min ( dt for _, dt of times )...
  max = Math.max ( dt for _, dt of times )...
  debug '©q6yuS', min, max
  data = []
  for name, dt of times
    # nanos = "000000000#{dt[ 1 ]}"
    # nanos = nanos[ nanos.length - 9 .. nanos.length - 1 ]
    # urge "#{dt[ 0 ]}.#{nanos} #{name}"
    entry =
      name:     name
      dt:       ( dt.toFixed 9 )
      rel:      "#{( dt / min ).toFixed 2}"
      max:      "#{( dt / max ).toFixed 2}"
    data.push entry
  urge "time needed to process #{ƒ n} arbitrary strings (lower is better):"
  help '\n' + CND.columnify data, columnify_settings

#-----------------------------------------------------------------------------------------------------------
@test_h2c = ( probes ) ->
  start 'H2C.encode'
  CODEC.encode probe for probe in probes
  stop 'H2C.encode'

#-----------------------------------------------------------------------------------------------------------
@test_bytewise = ( probes ) ->
  start 'bytewise.encode'
  BYTEWISE.encode probe for probe in probes
  stop 'bytewise.encode'

#-----------------------------------------------------------------------------------------------------------
@test_json = ( probes ) ->
  start 'new Buffer JSON.stringify'
  new Buffer JSON.stringify probe for probe in probes
  stop 'new Buffer JSON.stringify'

#-----------------------------------------------------------------------------------------------------------
@test_new_buffer = ( probes ) ->
  start 'new_buffer'
  for probe in probes
    b = new Buffer probe
  stop 'new_buffer'

#-----------------------------------------------------------------------------------------------------------
@test_buffer_write = ( probes ) ->
  b = new Buffer 1024
  start 'buffer_write'
  for probe in probes
    b.write probe[ 0 ]
  stop 'buffer_write'

#-----------------------------------------------------------------------------------------------------------
@test_string_replace = ( probes ) ->
  start 'string_replace'
  for probe in probes
    x = probe[ 0 ].replace /a/g, '#'
  stop 'string_replace'

#-----------------------------------------------------------------------------------------------------------
@main = ->
  n = 100000
  whisper "generating #{ƒ n} probes"
  probes = ( [ PASSPHRASE.get_passphrase(), ] for idx in [ 1 .. n ] )
  help "generated #{ƒ probes.length} probes; now performing benchmarks"
  @test_bytewise              probes
  @test_json                  probes
  @test_h2c                   probes
  @test_new_buffer            probes
  @test_buffer_write          probes
  @test_string_replace        probes
  report n, 'new Buffer JSON.stringify'


############################################################################################################
unless module.parent?
  @main()











