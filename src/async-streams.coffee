



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
CODEC                     = require 'hollerith-codec'
#...........................................................................................................
ƒ                         = CND.format_number
misfit                    = Symbol 'misfit'


#-----------------------------------------------------------------------------------------------------------
f = ->
  step ( resume ) =>
    number_input = D.create_throughstream()
    lc_input    = D.create_throughstream()
    uc_input    = D.create_throughstream()
    #.......................................................................................................
    number_input
      .pipe D.$lockstep lc_input, fallback: 'missing'
      .pipe D.$lockstep uc_input, fallback: 'missing'
      # .pipe $async ( data, done ) ->
      #   dt = if data is 1 then 5 else CND.random_number 0.5, 1.5
      #   # debug '©WscFi', data, dt
      #   after dt, =>
      #     urge "send #{rpr data}"
      #     done data
      .pipe D.$show()
      .pipe D.$on_end ( end ) =>
        urge '$on_end 1'
        after 0.5, => urge '$on_end 2'; end()
    #.......................................................................................................
    for n in [ 0 .. 7 ]
      letter = String.fromCodePoint ( 'a'.codePointAt 0 ) + n
      help "write #{letter}"
      lc_input.write letter
      yield after 0.25, resume
    lc_input.end()
    #.......................................................................................................
    for n in [ 0 .. 7 ]
      letter = String.fromCodePoint ( 'A'.codePointAt 0 ) + n
      help "write #{letter}"
      uc_input.write letter
      yield after 0.25, resume
    uc_input.end()
    #.......................................................................................................
    for n in [ 0 .. 9 ]
      help "write #{n}"
      number_input.write n
      yield after 0.25, resume
    number_input.end()
    #.......................................................................................................
    return null


f()






