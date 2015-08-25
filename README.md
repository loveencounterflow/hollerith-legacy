![](https://github.com/loveencounterflow/hollerith/raw/master/art/hollerith-logo-v2.png)


- [hollerith](#hollerith)
- [Theory](#theory)
	- [What is LevelDB?](#what-is-leveldb)
	- [The Hollerith2 Codec (H2C)](#the-hollerith2-codec-h2c)
		- [Performance Considerations](#performance-considerations)
		- [Encoding Details](#encoding-details)
			- [Texts (Strings)](#texts-strings)
			- [Numbers](#numbers)
			- [Dates](#dates)
			- [Singular Values](#singular-values)
			- [Private Values](#private-values)
		- [Lexicographic Order and UTF-8](#lexicographic-order-and-utf-8)
		- [X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X](#x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x)
	- [The Hollerith2 Phrase Structure](#the-hollerith2-phrase-structure)
		- [SPO and POS](#spo-and-pos)
- [Practice](#practice)
	- [Inserting Data](#inserting-data)
	- [Indexing Data](#indexing-data)
	- [Deleting Data](#deleting-data)
	- [Reading Data](#reading-data)
	- [Error Handling](#error-handling)
		- [@create_phrasestream = ( db, lo_hint = null, hi_hint = null ) ->](#@create_phrasestream-=--db-lo_hint-=-null-hi_hint-=-null--->)
		- [@create_facetstream = ( db, lo_hint = null, hi_hint = null ) ->](#@create_facetstream-=--db-lo_hint-=-null-hi_hint-=-null--->)
		- [@read_sub = ( db, settings, read ) ->](#@read_sub-=--db-settings-read--->)
- [XXXXXXX](#xxxxxxx)

> **Table of Contents**  *generated with [DocToc](http://doctoc.herokuapp.com/)*


# hollerith

[![Build Status](https://travis-ci.org/loveencounterflow/hollerith2.png)](https://travis-ci.org/loveencounterflow/hollerith2)

> Use LevelDB like 1960s punched cards

<!-- Hollerith² is a NodeJS v0.12.x-compatible library written in 100% CoffeeScript to
write and read to and from  -->

```
npm install --save hollerith2
```

(In the near future, this will change to `npm install --save hollerith`, `hollerith2` being the
release candidate for the next major version of `hollerith`.)

# Theory

## What is LevelDB?

LevelDB is fast key / value embedded database engine developed and opensourced by
Google and made readily available to NodeJS folks as `npm install level` (see
[level](https://github.com/level/level) and
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


<!-- Now LevelDB—the DB engine underlying Hollerith²—is a key / value store that has
exactly one value per key. All keys are lexicographically ordered, and there are
only two ways to retrieve an entry from the datastore: either by giving the
full, exact key that a value was stored under, or by iterating over all key /
value pairs, optionally by giving a lower and / or an upper boundary for the
keys.

> There is no way in LevelDB to query values as such; the best you can do is to
> retrieve (all or a subset of the) key / value pairs and sort out matching
> values in your application code. This can make a lot of sense especially if
> you can limit the amount of key / value pairs to look at, but becomes
> unbearably slow if you have stored millions of facts and have to sift through
> all of them in order to find the single needle in the haystack.
 -->

## The Hollerith2 Codec (H2C)

![tape code pocket rule](https://github.com/loveencounterflow/hollerith2/raw/master/art/fairchild-tts-tape-code-pocket-rule-1200rgb-verso-rot0p6cw-crop-7744x1736-scale-1024x230.jpg)

Hollerith comes with its own codec, dubbed the Hollerith² Codec, or H2C for
short. It works like a subset of the [`bytewise`
codec](https://github.com/deanlandolt/bytewise) whose core implementation ideas
are shamelessly re-implemented.

### Performance Considerations

The `bytewise` codec is one great idea; it allows us to build LevelDB keys from
JavaScript lists of values that sort properly: keys encoded with `bytewise` will
keep apart data types in their own segments of the key space, sort numbers
properly by their magnitudes and correctly order strings by the lexicographic
ordering imposed by their constituent Unicode code points. If you wanted to do the
same just using strings as keys and JSON-like value seriealizations, you'd have to
construct everything very carefully to ensure this same set of desirable properties.

Not least, since the JSON representation of integer numbers is a series of
digits, you'd have to left-pad all your integers with zeroes to get it right;
this is because the strings `'4'`, `'6'`, `'12'`, `'333'` sort as `'12'`,
`'333'`, `'4'`, `'6'`. Only when padded with zeros they sort as `'004'`,
`'006'`, `'012'`, `'333'`—but even this doesn't ensure proper sorting when
numbers like `4.562e24` should occur. Even the JSON representation of strings
may become a problem with some code points; for example, a null byte will be
represented as the character sequence `"\u0000"` in JSON, with a literal slash
as the first character. Now Unicode encodes the slash as U+005c, while `A` is
U+0041 (i.e. smaller than U+005c) and `a` is U+0061 (i.e. greater than U+005c);
the net effect is that null bytes will sort *after* Basic Latin capital letters
A—Z, but *before* Basic Latin lower case letters a—z.

`bytewise` has none of these issues. Sadly, it is considerably slower than JSON.
When you do `npm run benchmark`, you will get an output
like below; the figures in the `DT` column show the number of seconds needed to
process 100'000 arbitrary probes; the `REL` column shows relative times in
comparison to JSON, while the `MAX` column show relative times in comparison to
the slowest test case:

```
hollerith-codec ► npm run benchmark
NAME                               DT  REL  MAX
bytewise.encode           4.441503192 8.51 1.00
new Buffer JSON.stringify 0.521810996 1.00 0.12
H2C.encode                1.471865467 2.82 0.33
```

Roughly speaking, `bytewise` (v1.1.0) achieves less than 12% of the throughput
that would be achievable by first encoding each probe to JSON and then turning
the resulting string into a buffer. By comparison, the H2C codec allows for
around 35% throughput of the JSON solution. Since H2C has not been aggressively
optimized, further performance gains are not impossible.

### Encoding Details

H2C is much more restrictive than `bytewise`. `bytewise` strives to support all
JavaScript data types (including objects) and to work in both the browser and in
NodeJS. By contrast, H2C is not currently designed to run in the browser. Also,
it only supports lists as keys whose elements can only be

* lists (which may be nested),
* `null`,
* `false`,
* `true`,
* numbers (including `Infinity`),
* Date objects, or
* strings.

This means that when working with Hollerith², you will always have
to use lists of JavaScript primitive types for the keys. This is a
good thing: because of the way that the H2C encoding works, putting
a number of lists like, say

```
[ 'sku', '3345-d', 'price', ]                       # ⎫          ⎫
[ 'sku', '3345-d', 'weight', ]                      # ⎪          ⎬ `sku`, `3345-d`
[ 'sku', '3345-d', 'description', ]                 # ⎬ `sku`    ⎭ subspace
[ 'sku', '3348A',  'price', ]                       # ⎪ subspace ⎫
[ 'sku', '3348A',  'weight', ]                      # ⎪          ⎬ `sku`, `3348A`
[ 'sku', '3348A',  'description', ]                 # ⎭          ⎭ subspace
[ 'invoice', ( new_date "2012-01-30" ), '33421', ]  # ⎫
[ 'invoice', ( new_date "2012-01-30" ), '66345', ]  # ⎬ `invoice`
[ 'invoice', ( new_date "2012-01-31" ), '54662', ]  # ⎭ subspace
```

into the DB will cause them to occupy clearly delineated portions of the ordered
key space, meaning that it is easy to retrieve, say, all data related to
stock-keeping units by searching for the prefix (a.k.a. incomplete key) `[
'sku', ]`; if you're only interested in the SKU designated `3348A`, you can
iterate over that subspace using the prefix `[ 'sku', '3348A', ]`.

In other words, desirable properties of DB indexes—namely, unique keys that are
hierarchically partitioned into disjunct, addressable subspaces—fall out
naturally from the rather simple, efficient and straight-forward encoding
afforded by H2C.


<!--
```coffee
tms = HOLLERITH2[ 'CODEC' ][ 'typemarkers' ]

                                         Value        Length
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
tms[ 'lo'         ] =                     0x00             1
tms[ 'null'       ] = 'B'.codePointAt 0 # 0x42             1
tms[ 'false'      ] = 'C'.codePointAt 0 # 0x43             1
tms[ 'true'       ] = 'D'.codePointAt 0 # 0x44             1
tms[ 'date'       ] = 'G'.codePointAt 0 # 0x47            10
tms[ 'ninfinity'  ] = 'J'.codePointAt 0 # 0x4a             1
tms[ 'nnumber'    ] = 'K'.codePointAt 0 # 0x4b             9
tms[ 'pnumber'    ] = 'L'.codePointAt 0 # 0x4c             9
tms[ 'pinfinity'  ] = 'M'.codePointAt 0 # 0x4d             1
tms[ 'text'       ] = 'T'.codePointAt 0 # 0x54    (variable)
tms[ 'hi'         ] =                     0xff             1
```
 -->

#### Texts (Strings)

The H2C encoding for strings is almost binary compatible to the `bytewise`
encoding of strings that are elements in lists (since H2C only encodes values in
lists). The basic ideas are the following:

* The beginning of a string is indicated by a typemarker byte (`0x54 ≙ 'T'` at the moment);
* its end is indicated by a terminating zero byte (`0x00`).
* Since `0x00` must, thus, not occur inside a string, all occurrances of `0x00`
  bytes are replaced by the sequence `0x01 0x01`, and all occurrances of `0x01`
  bytes are replaced by the sequence `0x01 0x02`. That way, the lexicographic
  ordering of 'low bytes' is preserved.
* The resulting zero-byte-free string is encoded as UTF-8, an encoding scheme
  that maps positive integer numbers big and small to octet bit patterns in a
  way that preserves Unicode code point ordering.
* No other normalization is done on strings. (If you want to, say, index a
  database with entries in a a 'complex script' that uses decomposable sequences
  of diacritics and so on, it's your own repsonsibility to apply a Unicode
  Normalization Form or other transforms; such concerns are outside the scope of
  H2C.)
* To decode an encoded string, the buffer is searched, from the typemarker byte
  onwards, for a zero byte; when it is found, the part between the initial and
  the terminal markers is decoded as UTF-8, and escaped 'low bytes' are
  unescaped.

#### Numbers

Like H2C's string encoding, H2C's encoding of numbers has been copied from `bytewise`.
Its characteristics are:

* The beginning of numbers is indicated by a typemarker byte that changes according
  to whether or not the number is finite and whether or not it is negative:
  * Negative infinity is marked by a sole `0x4a ≙ 'J'`, positive infinity as a
    sole `0x4d ≙ 'M'`; these two non-finite numbers are only captured by their
    typemarkers.
  * Negative finite numbers are marked with `0x4b ≙ 'K'`, positive finite
    numbers as `0x4c ≙ 'L'`.
* Finite numbers are written into the result buffer using `Buffer.writeDoubleBE()`,
  which means that
  * all finite numbers take up 1 + 8 = 9 bytes of space;
  * the lexicographical ordering of the binary representation of finite numbers
    is in direct relationship to the mathematical ordering of the values they represent;
  * no one is left behind, i.e. all the critical tiny, big and small values of
    JavaScript (resp. the IEEE-754 standard) like `Number.MIN_VALUE`, `Number.EPSILON`,
    `Number.MAX_SAFE_INTEGER` and so on are correctly handled without any distortions
    or rounding errors.
* The bytes of an encoded negative number are obtained by taking the absolute
  value of that number, encoding it with `Buffer.writeDoubleBE()` and then
  inversing its bits (so that e.g. `0x00` becomes `~0x00` == `0xff`); that way,
  the mathematically correct ordering `... -3 ... -2 ... -1 ... -0.5 ...` is
  obtained. Since the leading byte marker of negative numbers is smaller than
  the one for positive numbers, all encoded keys with negative numbers will
  collectively come before any positive number (including zero).

#### Dates

Dates are encoded with a leading typemarker for dates (`0x47 ≙ 'G'` in case you where
wondering), followed by 9 bytes necessary to [encode finite numbers](#numbers), since
H2C uses the underlying milliseconds-since-epoch (1st of January, 1970) to
characterize dates. This means that

* in contradistinction to pure numbers, no infinitely distant dates can be encoded,
  since JavaScript doesn't accept `new Date( Infinity )`;
* dates will be ordered according to their relative temporal ordering, earlier dates coming
  before later dates; however
* additional information such as time zones will be irretrievably lost.

As an experimental feature, two extreme dates:

```coffee
sentinels = HOLLERITH2[ 'CODEC' ][ 'sentinels' ]
sentinels[ 'firstdate' ] = new Date -8640000000000000 # ≙ Tue, 20 Apr -271821 00:00:00 GMT
sentinels[ 'lastdate'  ] = new Date +8640000000000000 # ≙ Sat, 13 Sep  275760 00:00:00 GMT
```

are provided by the Hollerith² Codec module. According to [a website with
copious information about JS Date
objects](http://www.merlyn.demon.co.uk/js-datex.htm), these should represent the
earliest and latest dates possible with JavaScript (in fact, if you try the
above formulas with `1` subtracted or added to the arguments, you will get an
`Invalid Date` error).


#### Singular Values

A so-called 'singular' encoding is used to capture the solitary values `null`,
`false` and `true`; these are expressed as their type markers `0x42 ≙ 'B'`
`0x43 ≙ 'C'` `0x44 ≙ 'D'`, respectively.

#### Private Values



### Lexicographic Order and UTF-8

![](https://github.com/loveencounterflow/hollerith/raw/master/art/hollerith.png)


The term '[lexicographically ordered](http://en.wikipedia.org/wiki/Lexicographical_order)' deserves some
explanation: lexicographical ordering (in computer science) is somewhat different from alphabetical ordering
(used in phone directories, card files and dictionaries) in that *only the underlying bits of the binary
representation* are considered in a purely mechanical way to decide what comes first and what comes next;
there are no further considerations of a linguistic, orthographic or cultural nature made.

Because early computers *were* in fact mechanical beasts that operated quite
'close to the metal' (resp. the holes on punched cards that were detected with
rods, electric brushes, or photosensors, as the case may be), the bit-level
details of early encoding schemes (such as
[EBCDIC](https://en.wikipedia.org/wiki/EBCDIC) or
[US-ASCII](https://en.wikipedia.org/wiki/ASCII)) had a very direct impact on
whether or not you could sort that huge card deck with customer names and sales
figures in a convenient manner using period machinery. Incidentally, this
consideration is the reason why, to this day, Unicode's first block (Basic
Latin, a holdover from the 1960s' 7bit ASCII standard) looks so orderly with its
contiguous ranges that comprise the digits `0`&nbsp;⋯&nbsp;`9`, the upper case
letters `A`&nbsp;⋯&nbsp;`Z`, and the lower case letters `a`&nbsp;⋯&nbsp;`z`, all
of them in alphabetic respectively numerical order. As shown below, this
property makes binary-based lexicographic sorting straightforward and intuitive.
The table also shows that as soon as we leave that comfort zone, the equivalence
between alphabetical and lexicographical ordering breaks down quickly:



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

### X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X

The buffers that we obtained in the previous step are somewhat hard to visualize
in a readable manner—we can either list the value of all the bytes in
hexadecimal, or try to print out the buffers as strings. Unfortunately, it turns
out that for [historical reasons](http://en.wikipedia.org/wiki/ASCII), many
Unicode code positions in the range `[ 0x00 .. 0xff ]` do not define 'printable'
but rather 'control' characters such as newlines, tabulators and what not, and
actually, the code points in the range `[ 0x80 .. 0x9f ]` do not even have
specified jobs—they're defined as 'generic control' characters that are, in
practice, nothing but unusable gaps in the code table.

When a text is encoded as UTF-8—which is basically what H2C and JSON do—then
only characters between `0x00` and `0x7f` are preserved in a one-to-one fashion;
all other characters are turned into sequences of between 2 and 3 bytes, not all
of which correspond to 'nice' Unicode characters.

For this reason, we have here adopted a customary encoding that preserves most
printable Unicode codepoints in the range `[ 0x00 .. 0xff ]` and adds a few
symbolic printable characters to make the output more readily interpretable. In
detail:

* `∇` (`0x00`) symbolizes the zero byte;
* `≡` (`0x01 .. 0x1f`) symbolizes all 'unprintable' control characters;
* `␣` (`0x20`) symbolizes the space character;
* `∃` (`0x08 .. 0x9f`) symbolizes code points that occur as follow-up bytes
  in UTF-8 byte sequences which do not have an printable representation in Unicode;
* `≢` (`0xa0`, `0xa1`, `0xf3 .. 0xfe`) symbolizes code points that can not occur
  in a weel-formed UTF-8 byte sequence;
* `Δ` (`0xff`) symbolizes the highest byte.

Thus, our code table looks like this:

```
     0123456789abcdef 0123456789abcdef
0x00 ∇≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡ ≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡ 0x10
0x20 ␣!"#$%&'()*+,-./ 0123456789:;<=>? 0x30
0x40 @ABCDEFGHIJKLMNO PQRSTUVWXYZ[\]^_ 0x50
0x60 `abcdefghijklmno pqrstuvwxyz{|}~≡ 0x70
0x80 ∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃ ∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃∃ 0x90
0xa0 ∃∃¢£¤¥¦§¨©ª«¬Я®¯ °±²³´µ¶·¸¹º»¼½¾¿ 0xb0
0xc0 ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏ ÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞß 0xd0
0xe0 àáâãäåæçèéêëìíîï ðñò≢≢≢≢≢≢≢≢≢≢≢≢Δ 0xf0
```

Let's try out this encoding so we learn how to interpret the below
illustrations. First, let's encode a string `'abcäöü'` in UTF-8 and look at the
result: `b = new Buffer 'abcäöü'` gives us `<Buffer 61 62 63 c3 a4 c3 b6 c3
bc>`, the usual representation of a `Buffer` instance in the NodeJS REPL. Of
course. `b.toString 'utf-8'` would give us back the original string, but
decoding the same using `latin-1` (properly called ISO/IEC 8859-1)—which is an
8bit encoding—gives us one printable character per byte: `'abcÃ¤Ã¶Ã¼'`.

Things turn worse when doing the same with the string `'一x丁x丂'`. The buffer is
logged as `<Buffer e4 b8 80 78 e4 b8 81 78 e4 b8 82>`, which turns into
something like `'ä¸▓xä¸▓xä¸▓'` when decoded as `latin-1`. What you'll actually
see in place of those `▓` boxes depends; in my console, i get a space for the
first two and something looking like a comma for the last box, but when i copy
that into my text editor, the boxes all turn into zero-width spaces, and when i
publish a text containing those characters to GitHub, i get `�` in the browser.
This is truly confusing and not helpful. In our custom encoding, the bytes used
to encode `'一x丁x丂'` are rendered as `ä¸∃xä¸∃xä¸∃`, where `∃` represents three
(further undifferentiated) UTF-8 sequence continuation bytes.

Now let's take a look at the H2C encoding: Calling `HOLLERITH.CODEC.encode [
'abc', 'def', ]` gives us `<Buffer 54 61 62 63 00 54 64 65 66 00>`, which may be
rendered as `Tabc∇Tdef∇`. The `T`s indicate the start of strings, while the
`∇`s—which symbolize `0x00` bytes—signal the end of strings; hence, our input
value contined two strings, encoded as `T...∇T...∇`. Using `[ 'xxx', 42, ]` as
input, we get `<Buffer 54 78 78 78 00 4c 40 45 00 00 00 00 00 00>`, which is
visualized as `Txxx∇L@E∇∇∇∇∇∇`. Here, `...∇L...` shows the end of a string as
`∇` and the start of a positive finite number as `L`; the ensuing eight bytes
`@E∇∇∇∇∇∇` (which are mostly zero) encode the numerical value of `42` according
to IEEE-754. FInally, `[ true, -1 / 7, ]` is encoded as `<Buffer 44 4b c0 3d b6
db 6d b6 db 6d>`, which corresponds to `DKÀ=¶Ûm¶Ûm` (`D` encodes `true`, and `K`
signals a negative finite number).



## The Hollerith2 Phrase Structure

![](https://github.com/loveencounterflow/hollerith/raw/master/art/082.jpg)

<!-- If you've read [the section on H2C](#the-hollerith2-codec-h2c) you might have
noticed the restriction on DB facets mentioned there: While DB facet *values*
are encoded as JSON and can, therefore, hold any value that is acceptable to
`JSON.stringify()`, facet *keys* are encoded using the Hollerith² Codec, which
accepts only flat (unnested) lists of numbers, texts, dates, or `null`, `false`,
`true`. In this section, we will motivate why that is a good thing and how
building an indexed, structured data collection is intended to work with
Hollerith.

### SPO and POS
 -->

The Hollerith² data model may be characterized as a 'binary phrase database with
transparent total indexing'. Let's take that apart for once.

The term 'phrase' points out that facts are recorded in a format akin to phrases
or sentences used in natural language. In spoken language, we distinguish the
major roles of sentences as *subject* (that which is spoken about), *predicate*
(the topic of the sentence, as it were), and *object* (what is being said about
the subject). That may or may not be a linguistically correct explanation, but
it's one that will serve us well for our purposes.

With 'binary phrase database' I mean that facts are recorded in two ways—once as
a primary, main entry and once as a secondary, index entry; 'transparent total
indexing' points out that this happens automatically and for all the fact
phrases you enter into the DB.

Let's clarify that by way of example.

> The motivation to write Hollerith² comes from the desire to record and process
> facts about [Chinese characters (a.k.a. Kanji in Japanese and Hanja in
> Korean)](http://en.wikipedia.org/wiki/Chinese_characters), of which there are
> many thousands encoded in Unicode, so our examples will draw from that data
> collection. No example here is contrived; I will try and use only such
> examples that are intelligible to people who are not acquainted with
> East-Asian languages.

Something very obvious that can be said about Chinese characters is that they
vary greatly in terms of visual complexity: for example, among the very common
characters 丁, 三, 夫, 國, 形 the characters 丁 and 三 are vastly easier to read and
write than 國, while 形 is somewhere in the middle.

One way to capture this difference in complexity is to simply count the strokes
needed to write a given character. We find that 丁, 三, 夫, 國, and 形 are written
using 2, 3, 5, 11, and 7 strokes, respectively.

Another way to account for percevived complexity is to count from how many
indivual parts a character is composed—a more promising approach, but also a
much more contentious one, as it is often quite difficult to clearly delineate
parts of characters in an unequivocal fashion. Be that as it may, in my book 國
is analyzed as 囗戈口一 and 形 as 开彡, while 丁, 三, and 夫 are counted as single
components.

Using Hollerith phrases, we can tentatively record these finds as follows:

```
subject     predicate                     object
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
丁          strokecount                    2
三          strokecount                    3
夫          strokecount                    5
國          strokecount                    11
形          strokecount                    7
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
丁          componentcount                 1
三          componentcount                 1
夫          componentcount                 1
國          componentcount                 4
形          componentcount                 2
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
丁          components                     [ 丁, ]
三          components                     [ 三, ]
夫          components                     [ 夫, ]
國          components                     [ 囗, 戈, 口, 一, ]
形          components                     [ 开, 彡, ]

```

The entries can be readily read out as `夫` (has a) `strokecount` (of) `5` and so
on. These phrases will become our mainstay entries. In order to record them,
each fact is bundled into a triplet `[ S(ubject), P(redicate), O(bject), ]` and
sent to the database engine. At this point in time, the relative ordering of the
phrases is irrelevant, as they will transparently become ordered upon
insertion:

```
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
```

Hollerith will then do a couple things: first, it will split each phrase into a
key and a value part, with the keys comprising both the subject and the
predicate of each phrase while the objects become the values of the key / value
pairs (a.k.a. 'facets'):

```
key                             value
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[ '丁', 'strokecount',    ]  ┊  2
[ '三', 'strokecount',    ]  ┊  3
[ '夫', 'strokecount',    ]  ┊  5
[ '國', 'strokecount',    ]  ┊  11
[ '形', 'strokecount',    ]  ┊  7
[ '丁', 'componentcount', ]  ┊  1
[ '三', 'componentcount', ]  ┊  1
[ '夫', 'componentcount', ]  ┊  1
[ '國', 'componentcount', ]  ┊  4
[ '形', 'componentcount', ]  ┊  2
[ '丁', 'components',     ]  ┊  [ '丁', ]
[ '三', 'components',     ]  ┊  [ '三', ]
[ '夫', 'components',     ]  ┊  [ '夫', ]
[ '國', 'components',     ]  ┊  [ '囗', '戈', '口', '一', ]
[ '形', 'components',     ]  ┊  [ '开', '彡', ]
```

Next, a so-called phrasetype marker is prepended to each key. As there are
primary and secondary phrases in Hollerith, there are two matching phrasetype
markers as well, `'spo'` (for Subject—Predicate—Object) and `'pos'` (for
Predicate—Object—Subject). We will first confine ourselves to the primary type
marked `'spo'`, and this is what they look like now:

```
key                                   value
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[ 'spo', '丁', 'strokecount',    ] ┊  2
[ 'spo', '三', 'strokecount',    ] ┊  3
[ 'spo', '夫', 'strokecount',    ] ┊  5
...
```

At this point the keys are encoded using the H2C codec, and the values with what
comes down to `new Buffer ( JSON.stringify value ), 'utf-8'`, that is, the
result of `JSON.stringify` encoded in UTF-8. We are left with two buffers per
entry, which are written to the store just as if you had called `db = level
'route/to/db'; db.put key, value` directly.

X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X
X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X
X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X
X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X
X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X
X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X
X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X
X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X
X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X
X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X
X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X
X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X
X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X
X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X
X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X

With that preparation, it becomes sort of easy to parse the below display which
shows how our sample data about some Chinese characters are stored in a LevelDB
instance. On the top we have the hexadecimal values of the bytes stored, and
below that the readable representations of those byte sequences in our custom
encoding:


```
key                                                                             value
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
54 73 70 6f 00 54 e4 b8 81 00 54 73 74 72 6f 6b 65 63 6f 75 6e 74 00          ┊ 32
54 73 70 6f 00 54 e4 b8 89 00 54 73 74 72 6f 6b 65 63 6f 75 6e 74 00          ┊ 33
54 73 70 6f 00 54 e5 a4 ab 00 54 73 74 72 6f 6b 65 63 6f 75 6e 74 00          ┊ 35
54 73 70 6f 00 54 e5 9c 8b 00 54 73 74 72 6f 6b 65 63 6f 75 6e 74 00          ┊ 31 31
54 73 70 6f 00 54 e5 bd a2 00 54 73 74 72 6f 6b 65 63 6f 75 6e 74 00          ┊ 37
54 73 70 6f 00 54 e4 b8 81 00 54 63 6f 6d 70 6f 6e 65 6e 74 63 6f 75 6e 74 00 ┊ 31
54 73 70 6f 00 54 e4 b8 89 00 54 63 6f 6d 70 6f 6e 65 6e 74 63 6f 75 6e 74 00 ┊ 31
54 73 70 6f 00 54 e5 a4 ab 00 54 63 6f 6d 70 6f 6e 65 6e 74 63 6f 75 6e 74 00 ┊ 31
54 73 70 6f 00 54 e5 9c 8b 00 54 63 6f 6d 70 6f 6e 65 6e 74 63 6f 75 6e 74 00 ┊ 34
54 73 70 6f 00 54 e5 bd a2 00 54 63 6f 6d 70 6f 6e 65 6e 74 63 6f 75 6e 74 00 ┊ 32
54 73 70 6f 00 54 e4 b8 81 00 54 63 6f 6d 70 6f 6e 65 6e 74 73 00             ┊ 5b 22 e4 b8 81 22 5d
54 73 70 6f 00 54 e4 b8 89 00 54 63 6f 6d 70 6f 6e 65 6e 74 73 00             ┊ 5b 22 e4 b8 89 22 5d
54 73 70 6f 00 54 e5 a4 ab 00 54 63 6f 6d 70 6f 6e 65 6e 74 73 00             ┊ 5b 22 e5 a4 ab 22 5d
54 73 70 6f 00 54 e5 9c 8b 00 54 63 6f 6d 70 6f 6e 65 6e 74 73 00             ┊ 5b 22 e5 9b 97 22 2c 22 e6 88 88 22 2c 22 e5 8f a3 22 2c 22 e4 b8 80 22 5d
54 73 70 6f 00 54 e5 bd a2 00 54 63 6f 6d 70 6f 6e 65 6e 74 73 00             ┊ 5b 22 e5 bc 80 22 2c 22 e5 bd a1 22 5d
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TspoTä¸∃∇Tstrokecount∇     ┊ 2
TspoTä¸∃∇Tstrokecount∇     ┊ 3
TspoTå¤«∇Tstrokecount∇     ┊ 5
TspoTå∃∃∇Tstrokecount∇     ┊ 11
TspoTå½¢∇Tstrokecount∇     ┊ 7
TspoTä¸∃∇Tcomponentcount∇  ┊ 1
TspoTä¸∃∇Tcomponentcount∇  ┊ 1
TspoTå¤«∇Tcomponentcount∇  ┊ 1
TspoTå∃∃∇Tcomponentcount∇  ┊ 4
TspoTå½¢∇Tcomponentcount∇  ┊ 2
TspoTä¸∃∇Tcomponents∇      ┊ ["ä¸∃"]
TspoTä¸∃∇Tcomponents∇      ┊ ["ä¸∃"]
TspoTå¤«∇Tcomponents∇      ┊ ["å¤«"]
TspoTå∃∃∇Tcomponents∇      ┊ ["å∃∃","æ∃∃","å∃£","ä¸∃"]
TspoTå½¢∇Tcomponents∇      ┊ ["å¼∃","å½∃"]
```

We can see at a glance that while this is how Hollerith *encodes* data, it isn't
quite how LevelDB will *store* it, as it always keeps all key lexicographically
ordered. No matter whatever which way you happened to send your keys to the DB,
when you read them out again, they will come up in this order:

```
key                                                                             value
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
54 73 70 6f 00 54 e4 b8 81 00 54 63 6f 6d 70 6f 6e 65 6e 74 63 6f 75 6e 74 00 ┊ 31
54 73 70 6f 00 54 e4 b8 81 00 54 63 6f 6d 70 6f 6e 65 6e 74 73 00             ┊ 5b 22 e4 b8 81 22 5d
54 73 70 6f 00 54 e4 b8 81 00 54 73 74 72 6f 6b 65 63 6f 75 6e 74 00          ┊ 32
54 73 70 6f 00 54 e4 b8 89 00 54 63 6f 6d 70 6f 6e 65 6e 74 63 6f 75 6e 74 00 ┊ 31
54 73 70 6f 00 54 e4 b8 89 00 54 63 6f 6d 70 6f 6e 65 6e 74 73 00             ┊ 5b 22 e4 b8 89 22 5d
54 73 70 6f 00 54 e4 b8 89 00 54 73 74 72 6f 6b 65 63 6f 75 6e 74 00          ┊ 33
54 73 70 6f 00 54 e5 9c 8b 00 54 63 6f 6d 70 6f 6e 65 6e 74 63 6f 75 6e 74 00 ┊ 34
54 73 70 6f 00 54 e5 9c 8b 00 54 63 6f 6d 70 6f 6e 65 6e 74 73 00             ┊ 5b 22 e5 9b 97 22 2c 22 e6 88 88 22 2c 22 e5 8f a3 22 2c 22 e4 b8 80 22 5d
54 73 70 6f 00 54 e5 9c 8b 00 54 73 74 72 6f 6b 65 63 6f 75 6e 74 00          ┊ 31 31
54 73 70 6f 00 54 e5 a4 ab 00 54 63 6f 6d 70 6f 6e 65 6e 74 63 6f 75 6e 74 00 ┊ 31
54 73 70 6f 00 54 e5 a4 ab 00 54 63 6f 6d 70 6f 6e 65 6e 74 73 00             ┊ 5b 22 e5 a4 ab 22 5d
54 73 70 6f 00 54 e5 a4 ab 00 54 73 74 72 6f 6b 65 63 6f 75 6e 74 00          ┊ 35
54 73 70 6f 00 54 e5 bd a2 00 54 63 6f 6d 70 6f 6e 65 6e 74 63 6f 75 6e 74 00 ┊ 32
54 73 70 6f 00 54 e5 bd a2 00 54 63 6f 6d 70 6f 6e 65 6e 74 73 00             ┊ 5b 22 e5 bc 80 22 2c 22 e5 bd a1 22 5d
54 73 70 6f 00 54 e5 bd a2 00 54 73 74 72 6f 6b 65 63 6f 75 6e 74 00          ┊ 37
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tspo∇Tä¸∃∇Tcomponentcount∇           ┊ 1
Tspo∇Tä¸∃∇Tcomponents∇               ┊ ["ä¸∃"]
Tspo∇Tä¸∃∇Tstrokecount∇              ┊ 2
Tspo∇Tä¸∃∇Tcomponentcount∇           ┊ 1
Tspo∇Tä¸∃∇Tcomponents∇               ┊ ["ä¸∃"]
Tspo∇Tä¸∃∇Tstrokecount∇              ┊ 3
Tspo∇Tå∃∃∇Tcomponentcount∇           ┊ 4
Tspo∇Tå∃∃∇Tcomponents∇               ┊ ["å∃∃","æ∃∃","å∃£","ä¸∃"]
Tspo∇Tå∃∃∇Tstrokecount∇              ┊ 11
Tspo∇Tå¤«∇Tcomponentcount∇           ┊ 1
Tspo∇Tå¤«∇Tcomponents∇               ┊ ["å¤«"]
Tspo∇Tå¤«∇Tstrokecount∇              ┊ 5
Tspo∇Tå½¢∇Tcomponentcount∇           ┊ 2
Tspo∇Tå½¢∇Tcomponents∇               ┊ ["å¼∃","å½∃"]
Tspo∇Tå½¢∇Tstrokecount∇              ┊ 7
```

# Practice

## Inserting Data

```
  #.........................................................................................................
  step ( resume ) =>
    yield @_feed_test_data db, probes_idx, resume
    prefix    = [ 'pos', 'guide', ]
    input     = HOLLERITH.create_phrasestream db, prefix, '*'
    debug '©FphJK', input[ '%meta' ]
    settings  = { indexed: no, }
    input
      .pipe $ ( phrase, send ) =>
        count  += +1
        idx    += +1
        debug '©Sc5FG', phrase
        # T.eq phrase, matchers[ idx ]
      .pipe D.$on_end =>
        T.eq count, matchers.length
        done()
```

## Indexing Data
## Deleting Data
## Reading Data

## Error Handling

Handling errors that occur in NodeJS streams can be tough. The best solution known
to me is to use domains. Here's an example from the Hollerith tests:

```coffee
@[ "invalid key not accepted (2)" ] = ( T, done ) ->
  domain  = ( require 'domain' ).create();
  domain.on 'error', ( error ) ->
    T.eq error[ 'message' ], "invalid SPO key, must be of length 3: [ 'foo' ]"
    done()
  domain.run ->
    input   = D.create_throughstream()
    input
      .pipe HOLLERITH.$write db
      .pipe D.$on_end -> setImmediate done
    input.write [ 'foo', ]
```

> thx to http://stackoverflow.com/a/22389498/256361, http://grokbase.com/t/gg/nodejs/12bwd4zm4x/should-stream-pipe-forward-errors#20121129e2ve6sah3cwqgbsc2noefyrsba
> for this suggestion.

See [the part on error handling in the PipeDreams readme](https://github.com/loveencounterflow/pipedreams2#error-handling)
for how to use `PIPEDREAMS.run` and what to watch out for, especially on why we call
`setImmediate done` here, not simply `done()`.

### @create_phrasestream = ( db, lo_hint = null, hi_hint = null ) ->
### @create_facetstream = ( db, lo_hint = null, hi_hint = null ) ->
### @read_sub = ( db, settings, read ) ->


# XXXXXXX


```

so|glyph:字|gloss:letter, character, word|o:0
·········●●●··································
●●●●●●●●·●··●●●●●●·●●●●●●··●●●●●●●●●··●●●●●●··
●●●●●●●●●●●·●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●
●·●··●●·●··●●···●●●··●●·●·····●··●·●··●·●·●·●●
·●●·●●·●●·●·●·●●··●●·····●··●·······●··●··●●●·
·●●●●····●●●●●●●···●●●●●·●·······●●·●·●●·●●●··
●●·●····●··●·●·●●●●·····●··●··●·●··●··●●●··●●·
●●·●·●···●●●·●·●●●··●··●···●·●·●●·●···●●···●··



phrasetype  | subject         | object                  | index
            | theme : topic   | predicate : complement  | idx [ , idx ... ]
pt          | sk    : sv      | ok        : ov          | idx [ , idx ... ]

             conjunct
                                            adjunct

```


```

so|glyph:丁|factor/strokeclass/wbf:"12"|
so|glyph:丁|factor/shapeclass/wbf:"12"|

os|factor/strokeclass/wbf:"32"|
os|guide/lineup/length:5|
os|guide/lineup/uchr:"八刀宀貝"|
os|rank/cjt:000000|


os|guide/lineup/length:5|"𧷟"|
                      so|"𧷟"|guide/lineup/uchr:"八刀宀貝"|
                      so|"𧷟"|guide/uchr/has:"八"|0
                                          so|"八"|factor/shapeclass/wbf:34 |
                      so|"𧷟"|guide/uchr/has:"刀"|1
                                          so|"刀"|factor/shapeclass/wbf:5(12)3|
                      so|"𧷟"|guide/uchr/has:"宀"|2
                                          so|"宀"|factor/shapeclass/wbf:44|
                      so|"𧷟"|guide/uchr/has:""|3
                                          so|""|factor/shapeclass/wbf:"12"|
                      so|"𧷟"|guide/uchr/has:"貝"|4
                                          so|"貝"|factor/shapeclass/wbf:"25(12)"|


os|guide/lineup/length:5|"𧷟"|
                       so|"𧷟"|rank/cjt:5432|

                       so|"𧷟"|guide/lineup/uchr/full:"八刀宀貝"|


(pos|guide/lineup/length:5)-"𧷟"
											 [spo|"𧷟"|rank/cjt]=5432
											 ...
											 [spo|"𧷟"|guide/uchr/has]=["八","刀","宀","","貝"]
											 ...
	                      										 [spo|"八"|factor/strokeclass/wbf]="34"
	                      										     [spo|"刀"|factor/strokeclass/wbf]="53"
	                      										          [spo|"宀"|factor/strokeclass/wbf]=...




```
