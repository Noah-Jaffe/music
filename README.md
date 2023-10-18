# music
musicplayer hosted by github ecosystem :D

# idea
the idea is to load the source urls into a file (how you get those source urls can be customized, see below for how i do it)
then the musicplayer.html file should be able to read from it to know which songs to play.

### how i get source urls:
github actions that run periodically to update our song list.

# Components
1. [Generate song list](#songFinder)
2. [Get song srcs](#songSrc)

<a name="songFinder"></a>
## Generate song list 
Use generateSongList.py to find the songs we want to listen to
Rule: do not remove old songs

<a name="songSrc"></a>
## Get song srcs 
Triggers on: 
  - Periodically
  - After the song list generator adds a new song 

