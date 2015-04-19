![](https://github.com/loveencounterflow/hollerith/raw/master/art/hollerith-logo-v2.png)


- [hollerith](#hollerith)
- [What is LevelDB?](#what-is-leveldb)
	- [Lexicographic Order and UTF-8](#lexicographic-order-and-utf-8)
- [xxx](#xxx)

> **Table of Contents**  *generated with [DocToc](http://doctoc.herokuapp.com/)*


## hollerith


use LevelDB like 1969


## What is LevelDB?

LevelDB is fast key/value store developed and opensourced by Google and made readily available to NodeJS
folks as `npm install level` (see [level](https://github.com/level/level) and
[levelup](https://github.com/rvagg/node-levelup)).

LevelDB is very focussed on doing this one thing—being a key/value store—and forgoes a lot of features
you might expect a modern database should provide; in particular, LevelDB

* is a pure in-process DB; there are no other communication mechanisms like an HTTP API or somesuch;
* does not provide indexes on data;
* does not have data types or even have a concept of string encoding—all keys and values are just
  arbitrary byte sequences;
* does not have intricate transaction handling (although it does feature compound batch operations that
  either succeed or fail with no partial commits);

What LevelDB does have, on the other hand is this (names given are for `hollerith` plus, in brackets,
their equivalents in `levelup`):

* **a `set key, value` (`levelup`: `put`) operation that stores a key / value pair (let's call that a 'facet' for short),**
* **a `get key` (`levelup`: `get`) operation that either yields the value that was `put` under that key, or else throws an
  error in case the key is not found,**
* **a `drop key` (`levelup`: `del`) operation that erases a key and its value from the records,**

and, most interestingly:

* **a `read ...` (`levelup`: `createReadStream`) operation that walks over keys, lexicographically
  ordered by their byte sequences; this can optionally be confined by setting a lower and an upper bound**.

### Lexicographic Order and UTF-8

![](https://github.com/loveencounterflow/hollerith/raw/master/art/hollerith.png)


The term '[lexicographically ordered](http://en.wikipedia.org/wiki/Lexicographical_order)' deserves some
explanation: lexicographical ordering (in computer science) is somewhat different from alphabetical ordering
(used in phone directories, card files and dictionaries) in that *only the underlying bits of the binary
representation* are considered in a purely mechanical way to decide what comes first and what comes next;
there are no further considerations of a linguistic, orthographic or cultural nature made.

Because early computers *were* in fact mechanical beasts that operated quite 'close to the metal' (resp. the
holes on punched cards that were detected with rods, electric brushes, or photosensors, as the case may be),
early encoding schemes had a huge impact on whether or not you could sort that huge card deck with customer
names and sales figures in a convenient manner using period machinery. Incidentally, this consideration is
the reason why, to this day, Unicode's first block (Basic Latin, a holdover from the 1960s' 7bit ASCII
standard) looks so orderly with its contiguous ranges that comprise the digits `0`&nbsp;⋯&nbsp;`9`, the
upper case letters `A`&nbsp;⋯&nbsp;`Z`, and the lower case letters `a`&nbsp;⋯&nbsp;`z`, all of them in
alphabetic respectively numerical order. As shown below, this property makes binary-based lexicographic
sorting straightforward and intuitive. The table also shows that as soon as we leave that comfort zone, the
equivalence between alphabetical and lexicographical ordering breaks down quickly:



|  nr | chr |    CID     |     UTF-8 octets (hex.)     |                UTF-8 (binary)                |
| --: | --- | ---------: | --------------------------- | -------------------------------------------- |
|   1 | ␀*  |      `u/0` | <tt>00</tt>                 | <tt>00000000</tt>                            |
|   2 | 0   |     `u/30` | <tt><b>30</b></tt>          | <tt>00▲10000</tt>                            |
|   3 | 1   |     `u/31` | <tt><b>31</b></tt>          | <tt>0011000▲</tt>                            |
|   4 | 2   |     `u/32` | <tt><b>32</b></tt>          | <tt>001100▲0</tt>                            |
|   5 | A   |     `u/41` | <tt><b>42</b></tt>          | <tt>0▲000001</tt>                            |
|   6 | B   |     `u/42` | <tt><b>42</b></tt>          | <tt>010000▲0</tt>                            |
|   7 | C   |     `u/43` | <tt><b>43</b></tt>          | <tt>0100001▲</tt>                            |
|   8 | a   |     `u/61` | <tt><b>61</b></tt>          | <tt>01▲00001</tt>                            |
|   9 | b   |     `u/62` | <tt><b>62</b></tt>          | <tt>011000▲0</tt>                            |
|  10 | c   |     `u/63` | <tt><b>63</b></tt>          | <tt>0110001▲</tt>                            |
|  11 | ~   |     `u/7e` | <tt><b>7E</b></tt>          | <tt>011▲1110</tt>                            |
|  12 | ä   |     `u/e4` | <tt>C3 <b>A4</b></tt>       | <tt>11000011 ▲0100100</tt>                   |
|  13 | ÿ   |     `u/ff` | <tt>C3 <b>BF</b></tt>       | <tt>11000011 001▲1111</tt>                   |
|  14 | Θ   |   `u/0398` | <tt><b>CE</b> 98</tt>       | <tt>1100▲110 10011000</tt>                   |
|  15 | 中  |   `u/4e2d` | <tt><b>E4</b> B8 AD</tt>    | <tt>11▲00100 10111000 10101101</tt>          |
|  16 | 𠀀   |  `u/20000` | <tt><b>F0</b> A0 80 80</tt> | <tt>111▲0000 10100000 10000000 10000000</tt> |
|  17 | 𠀁   |  `u/20001` | <tt>F0 A0 80 <b>81</b></tt> | <tt>11110000 10100000 10000000 1000000▲</tt> |
|  18 | 􏿽*  | `u/10fffd` | <tt><b>F4</b> 8F BF BD</tt> | <tt>11110▲00 10001111 10111111 10111101</tt> |
|  19 | �*  |        ./. | <tt><b>FF</b></tt>          | <tt>1111▲111</tt>                            |

> *Comments*—Shown in boldface are the UTF-8 bytes that cause one entry to be sorted after its predecessor;
> shown as `▲` are the specific bits (of value `1`) that cause a key to be sorted after the previous one.
> As can be seen, sorting is done (in principle) by a
> pairwise comparison of the bits representing two given keys from left to right; as soon as there is a `1` in one
> key and a `0` in the other, the key with the `1` is sorted after the one with the `0`.
>
> Note that of the 19 entries shown here, the six keys coming after `ÿ` represent the majority of the world's
> writing systems, including Greek, Cyrillic, Arabic, Ethiopic, Cherokee, Tifinagh, Georgian, Armenian,
> Chinese, Japanese, Korean, and so on ad libitum. Keys 2 thru 13 represent roughly 200 out of the 112'956
> printing codepoints defined in Unicode 7.0, that's 0.18%. Visit [the Unicode Slide Show](http://www.babelstone.co.uk/Unicode/unicode.html)
> to appreciate the dimensions: you'll spend less than a minute within the comfy equivalence of Latin-1, and
> the remaining *three hours* with the rest of the world.
>
> **(1)** symbolically using a character from the Unicode Command Pictures block; **(18)** the last
> legal codepoint of Unicode, located in the Supplementary Private Use Area B; appearance undefined; **(19)** as
> `0xff` is not (the start of) a legal UTF-8 sequence, this byte will cause a � `u/fffd` Replacement
> Character to appear in the decoded output; some decoders may throw an error upon hitting such an illegal
> sequence.

1960's computing sure was cumbersome by today's standards; however, it was also simpler in many ways, not
least because the equivalence between a 'byte' (or other unit of fixed bit-length) and a 'character' (a unit
of written text, representing natural language, programming instructions or business data) could always be
relied upon. This equivalence so evident in the punched cards and teletype terminals used by ye old computer
shoppe in days of lore has been carried over and since become a deeply entrenched thinking-habit in the mind
of many a programmer, which sometimes leads to curious and fallacious results in software to this day.

The astute reader will need mere seconds to dig up the postings of some helpful soul who publicly recommends
to 'end your upper limit keys with a `ÿ`', the reasoning apparently being that, since `ÿ` is encoded as
`0xff` (in Latin-1) and `0xff` is the highest encodable byte-value, there can not be a key that comes after
that, for the Earth is flat and dragons be beyond the eighteth bit.

As the above table shows, this is wrong as soon as you ditch the (in NodeJS) poorly-supported legacy
encodings that Latin-1 / Latin-9 / CP1252 and like schemes have become and embrace, instead, the one
standard that is rightfully (in spite of any shortcomings that it possesses, too) considered 'The Standard'
in 2014—i.e. character repertoire Unicode / ISO 10646, encoded as UTF-8.


<!--

they swap in U+ffff to replace U+00ff

witness commit: https://github.com/mcollina/levelgraph/commit/cb081cd5cbb54e9294b114a028f857710282ba4f

if (i < 3) {  if (i < 3) {
- result += '::\xff';   + result += '::\uffff';
}   }

return result;  return result;
@@ -1217,8 +1217,8 @@ function createQuery(pattern, options) {
, key = genKey(index, pattern, '')  , key = genKey(index, pattern, '')
, limit = pattern.limit   , limit = pattern.limit
, reverse = pattern.reverse || false  , reverse = pattern.reverse || false
- , start = reverse ? key + '\xff' : key  + , start = reverse ? key + '\uffff' : key
- , end = reverse ? key : key + '\xff'  + , end = reverse ? key : key + '\uffff'
, query = {   , query = {
start: start  start: start
, end: end  , end: end




 -->


<!-- Worse still, one can often see `~` as a delimiter.

When using Unicode, the naïve, old-fashioned way of constructing an upper limit by appending Latin-1 `ÿ`
(`0xff`) to the key does *not* work in UTF-8.


100'000 printable codepoints; using `ÿ` (`0xff`) encoded as `C3 BF` means that roughly 998‰ of all
printable codepoints are *not* caught
 -->

> "The lexicographic sorting order of UCS-4 strings is preserved."—[RFC 2044](https://www.ietf.org/rfc/rfc2044.txt)

<!--
CESU-8 and Binary DB Compatibility

Here we have to mention a somewhat thorny issue that is quite JavaScript-specific and a perennial source of
confusion and subtle bugs. The problems go back to the late 1980's and early 1990's, when Unicode was first
conceived and published. Back then, the decision was made to not create another [variable-width
encoding](http://en.wikipedia.org/wiki/Variable-width_encoding); rather, it was thought that going from
legacy 8bit encodings (that provides space for up to 156 characters) to a 16bit encoding with 65'536
positions would be big enough and future-proof. True, three bytes would have offerred a whopping 16'777'216
code points, but 3 is an awkward number when it comes to efficiently partition memory addresses. Four bytes
would have given us a Unicode with no less than 4'294'967'296 codepoints, which nobody could imagine to be
ever necessary for a character encoding scheme. Anyway, Unicode came under fire for being inefficient and
wasteful for requiring a full 16 bits for each letter, each digit and each punctuation mark, so anything
beyond 16 bits was out of question as it would have impaired Unicode's chances to ever gain wide adoption.

Now it soon became evident that 65'536 codepoints was in fact little if you really wanted to encode *all* of
the world's scripts, ancient and modern, widely used and obscure. Whether or not to include characters from
such a wide range of sources was a matter of debate for some years, some members of the consortium putting
forth the proposition that only 'commercially viable scripts in daily use in the present world' should be
elligble for encoding.

Fortunately, this narrow view did not prevail, and today, there are around 75'000 Chinese characters and
over 10'000 Hangeul syllables encoded in Unicode. These alone exceed the limit set by a 16bit encoding, so a
solution was needed. The Unicode consortium was still shy to break the 16bit barrier, as it was felt that it
would break too much existing software at the time, again hampering the projects rate of adoption; also,
spending *four* bytes on *each* character was in fact rather wasteful terms of both transmission times and
storage volumes.

The Gordian knot was untied with the introduction of so-called 'surrogate pairs'. These were reserved
the existing

 -->

## xxx

![](https://github.com/loveencounterflow/hollerith/raw/master/art/082.jpg)



samples:

```coffee
gtfs:
  stoptime:
    id:               gtfs/stoptime/876
    stop-id:          gtfs/stop/123
    trip-id:          gtfs/trip/456
    ...
    arr:              15:38
    dep:              15:38


  stop:
    id:               gtfs/stop/123
    name:             Bayerischer+Platz
    ...

  trip:
    id:               gtfs/trip/456
    route-id:         gtfs/route/777
    service-id:       gtfs/service/888

  route:
    id:               gtfs/route/777
    name:             U4

$ . | realm / type / idn
$ : | realm / type / idn | name | value
$ ^ | realm₀ / type₀ / idn₀|>realm₁ / type₁ / idn₁


$:|gtfs/route/777|0|name|U4
$:|gtfs/stop/123|0|name|Bayerischer+Platz
$:|gtfs/stoptime/876|0|arr|15%2538
$:|gtfs/stoptime/876|0|dep|15%2538
$^|gtfs/stoptime/876|0|gtfs/stop/123
$^|gtfs/stoptime/876|0|gtfs/trip/456
$^|gtfs/trip/456|0|gtfs/route/777
$^|gtfs/trip/456|0|gtfs/service/888


  $^|gtfs/stoptime/876|gtfs/trip/456
+                   $^|gtfs/trip/456|gtfs/route/777
—————————————————————————————————————————————————————————
= %^|gtfs/stoptime| 2               |gtfs/route/777|876
+                                 $:|gtfs/route/777|name|U4
—————————————————————————————————————————————————————————
= %:|gtfs/stoptime/876              |gtfs/route/    name|U4

# or

= gtfs/stoptime/876|=gtfs/route|name:U4

# or

= gtfs/stoptime/876|=2>gtfs/route|name:U4|777



  gtfs/stoptime/876|-1>gtfs/trip/456
                        gtfs/trip/456|-1>gtfs/service/888
——————————————————————————————————————————————————————————————————
= gtfs/stoptime/876|-2>gtfs/service/888
——————————————————————————————————————————————————————————————————


% : | realm / type   | name | value | idn
% ^ | realm₀ / type₀ | n | realm₁ / type₁ / idn₁ | idn₀

%:|gtfs/route|0|name|U4|777
%:|gtfs/stoptime|0|arr|15%2538|876
%:|gtfs/stoptime|0|dep|15%2538|876
%:|gtfs/stop|0|name|Bayerischer+Platz|123
%^|gtfs/stoptime|0|gtfs/stop/123|876
%^|gtfs/stoptime|0|gtfs/trip/456|876
%^|gtfs/stoptime|1|gtfs/route/777|876
%^|gtfs/stoptime|1|gtfs/service/888|876
%^|gtfs/trip|0|gtfs/route/777|456
%^|gtfs/trip|0|gtfs/service/888|456


realm
type
name
value
idn

joiner      |
%
escape_chr
=
>
:
^
```

```


phrasetype  | subject       | object            | index
pt          | label: theme  | predicate: value  | idx

###

so|glyph:字|gloss:letter, character, word|o:0
·········●●●··································
●●●●●●●●·●··●●●●●●·●●●●●●··●●●●●●●●●··●●●●●●··
●●●●●●●●●●●·●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●
●·●··●●·●··●●···●●●··●●·●·····●··●·●··●·●·●·●●
·●●·●●·●●·●·●·●●··●●·····●··●·······●··●··●●●·
·●●●●····●●●●●●●···●●●●●·●·······●●·●·●●·●●●··
●●·●····●··●·●·●●●●·····●··●··●·●··●··●●●··●●·
●●·●·●···●●●·●·●●●··●··●···●·●·●●·●···●●···●··


so|glyph:字|gloss:letter, character, word|o:0

phrasetype  | subject         | object                  | index
            | theme : topic   | predicate : complement  | idx [ , idx ... ]
pt          | sk    : sv      | ok        : ov          | idx [ , idx ... ]

             conjunct
                                            adjunct

###


```





