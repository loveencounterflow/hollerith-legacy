



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
### TAINT experimentally using `later` in place of `setImmediate` ###
later                     = suspend.immediately
#...........................................................................................................
test                      = require 'guy-test'
#...........................................................................................................
D                         = require 'pipedreams2'
$                         = D.remit.bind D
$async                    = D.remit_async.bind D
#...........................................................................................................
HOLLERITH                 = require './main'
db                        = null
#...........................................................................................................
levelup                   = require 'level'
leveldown                 = require 'level/node_modules/leveldown'
CODEC                     = require './codec'
#...........................................................................................................
ƒ                         = CND.format_number






f = ->
  step ( resume ) =>
    input_A = D.create_throughstream()
    #.......................................................................................................
    input_B = input_A
      .pipe $async ( data, done ) ->
        dt = CND.random_number 0.5, 1.5
        debug '©WscFi', data, dt
        after dt, =>
          urge "send #{rpr data}"
          done data
      .pipe D.$show()
      .pipe D.$on_end ( end ) =>
        urge '$on_end 1'
        after 1, => urge '$on_end 2'; end()
    #.......................................................................................................
    input_A.on  'end', -> urge "input_A.end"
    input_B.on  'end', -> urge "input_B.end"
    #.......................................................................................................
    write = ->
      for n in [ 0 .. 10 ]
        help "write #{n}"
        input_A.write n
        yield after 0.5, resume
      input_A.end()
    #.......................................................................................................
    write()





f()






