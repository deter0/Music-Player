# CANNOT GURRANTE SAFETY NOR FUNCTIONALITY OF THIS PROJECT ANYMORE
## I've abondoned it, might restart on it at some point. If I do I will probably rewrite it.
# Music Player<br/>
#### WARNING: WORK IN PROGRESS<br/>
Please note that **a name has not been decided** and "Music Player" is not the final name, obviously. But if you have name suggestion send them to me, please!!<br/>

An audio player, Spotify downloader, lyric finder, playlist maker, song organizer, song searcher, or anything you want it to be.

### Supported formats: .M4A, .MP3, .WAV (and most likely more; testing needed)

## Home Page
<img src="https://cdn.discordapp.com/attachments/911132045294571532/911459926008807494/unknown.png"/>

## Liked songs
<img src="https://cdn.discordapp.com/attachments/911132045294571532/911459926256267284/unknown.png"/>
All data is saved locally. None is sent, ever.

## Intelligent Search
<img src="https://cdn.discordapp.com/attachments/911132045294571532/911461438181224468/unknown.png"/>

Powered by [Fuse.js](https://fusejs.io/)

## Spotify Song Download
<img src="https://cdn.discordapp.com/attachments/911132045294571532/911459926499557376/unknown.png"/>

### How it works:
You first have to create an application on the [Spotify developer website](https://developers.spotify.com/dashboard), then it will ask you to put in the client id and client secret. After that it will log you in with your Spotify account. You can search songs with the Spotify api. It then makes a Youtube search query `"${song_name}"+lyrics` (Can customize) to get the most relavent video then downloads it through youtube-dl. After it has been saved as an `.m4a` file the corresponding metadata is attached to the file e.g. the album cover, the title, the artist, etc.

## Album Page
<img src="https://cdn.discordapp.com/attachments/911132045294571532/911460065351966771/unknown.png"/>

## Lyrics
<img src="https://cdn.discordapp.com/attachments/911132045294571532/911461924795977748/unknown.png"/>

Powered by [Musixmatch](https://musixmatch.com)

# Running
currently the only method is to run from source, this will change in the future.

# Running from source
Dependencies: [NodeJS](https://nodejs.org/en/), [python](https://www.python.org), [pip](https://packaging.python.org/tutorials/installing-packages/)<br/>
First you'll have to clone the repo do so by running the following commands.
```bash
$ git clone https://www.github.com/deter0/Music-Player
```
then cd into the `/Run` folder and if not installed do. It is a folder for simple scripts I've made to make the process of installing dependencies and running easier.
```sh
$ ./install.sh
```
If it fails you might need to do `chmod +x ./install.sh && chmod +x ./run.sh` this just adds the executable permission.<br/>
After installation of modules has finished. Simply run the `/Run/run.sh` script.
```sh
$ ./run.sh
```
or manually do it by cd into `/ReactApp/app/` and running
```sh
$ npm start
```
and in a seperate terminal tab run the server by cd'ing into `/Server` and also running
```sh
$ npm start
```

**After running** It will take you through a first time setup. If you somehow happen to input it wrong (don't be ashamed I've done it) you can see all the data in `/Server/Data`. Primarily the first time setup data is stored in `/Server/Data/Paths.txt` simply edit it and then restart the server. I will likely include this in settings page in the future.

## TODO<br/>
### Backend<br/>
1. Spotify Download (and Youtube Download)<br/>
	- [x] Integrate https://github.com/piyx/YoutubeSpotifyDL
	- [x] Downloads page
	- [x] Add a "Download" button to the songs
	- [ ] Add a "Download" button to the playlist
	- [ ] Add a "Download" button to the albums
	- [ ] Youtube link download
		- [ ] Integreated Youtube search
2. Song Page<br/>
3. Artist Page<br/>
### Frontend<br/>
1. Artist<br/>
2. Song Page<br/>
3. Artist Page<br/>
4. Queues
5. Better tracking of where you left of playing music
### Other<br/>
1. Command line interface<br/>
