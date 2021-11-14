import re
import os
import sys
import requests;
from pathlib import Path
from threading import Thread

from PyInquirer import prompt
from utils import Song

from youtube import Youtube
from spotify import Spotify
from downloader import download

MAXVAL = 1000


def ask_platform():
    options = {
        "type": "list",
        "name": "choice",
        "message": "Download From?",
        "choices": ["1.Spotify", "2.Youtube", "3.Exit"],
    }
    return prompt(options)["choice"]


def ask_download_option_youtube():
    options = {
        "type": "list",
        "name": "choice",
        "message": "What do you want to do?",
        "choices": ["1.Download a playlist", "2.Download a particular song", "3.Exit"],
    }
    return prompt(options)["choice"]


def ask_download_option_spotify():
    options = {
        "type": "list",
        "name": "choice",
        "message": "What do you want to do?",
        "choices": [
            "1.Download your liked songs",
            "2.Download a playlist",
            "3.Download a particular song",
            "4.Download an album",
            "5.Exit",
        ],
    }
    return prompt(options)["choice"]


def ask_num_songs_to_download():
    options = {
        "type": "list",
        "name": "choice",
        "message": "Select an option.",
        "choices": ["1.Download all", "2.Enter a custom value:", "3.Exit"],
    }

    ans = prompt(options)["choice"]

    if "2" in ans:
        number = {
            "type": "input",
            "name": "num_songs",
            "message": "How many songs you want to download?",
        }

        num_songs = prompt(number)["num_songs"]
        return int(num_songs)

    elif "3" in ans:
        sys.exit()

    return MAXVAL


def ask_download_playlist_songs():
    options = {
        "type": "input",
        "name": "id",
        "message": "Enter playlist id or url (Enter playlist id for youtube):",
    }

    return prompt(options)["id"]


def ask_download_album_songs():
    options = {
        "type": "input",
        "name": "id",
        "message": "Enter album id or url:",
    }

    return prompt(options)["id"]


def ask_download_particular_song():
    options = [
        {"type": "input", "name": "artist", "message": "Enter artist name:"},
        {"type": "input", "name": "song", "message": "Enter song name:"},
    ]

    return prompt(options)


def ask_download_path():
    options = {
        "type": "list",
        "name": "choice",
        "message": "Where do you want to download the song?",
        "choices": [
            "1.Current folder",
            "2.Create a new folder here and download",
            "3.Enter a custom download path",
            "4.Exit",
        ],
    }

    choice = prompt(options)["choice"]
    if "1" in choice:
        return os.getcwd()

    elif "2" in choice:
        ques = {"type": "input", "name": "folder", "message": "Enter a folder name:"}
        folder = prompt(ques)["folder"]
        if not os.path.exists(folder):
            os.mkdir(folder)

        return folder

    elif "3" in choice:
        ques = {
            "type": "input",
            "name": "path",
            "message": "Enter path where songs should be downloaded:",
        }

        return prompt(ques)["path"]

    else:
        sys.exit()


def spotifydl():
    choice = ask_download_option_spotify()

    if "1" in choice:
        num_songs = ask_num_songs_to_download()
        songs = Spotify.get_saved_songs(limit=num_songs)

    elif "2" in choice:
        playlist_id = ask_download_playlist_songs()
        if "https" in playlist_id:
            playlist_id = re.search(r"playlist\/(.*)\?", playlist_id).group(1)
        num_songs = ask_num_songs_to_download()
        try:
            songs = Spotify.get_playlist_songs(playlist_id, limit=num_songs)
        except Exception as e:
            print("Invalid playlist ID or playlist is empty.")
            sys.exit()
    elif "3" in choice:
        data = ask_download_particular_song()
        songs = [Spotify.search_song(data["artist"], data["song"])]  # List of 1 song

    elif "4" in choice:
        album_id = ask_download_album_songs()
        if "https" in album_id:
            album_id = re.search(r"album\/(.*)\?", album_id).group(1)
        try:
            songs = Spotify.get_album_songs(album_id)
        except Exception as e:
            print("Invalid album ID or album is empty.")
            sys.exit()
    else:
        sys.exit()

    path = ask_download_path()

    return songs, path


def youtubedl():
    choice = ask_download_option_youtube()

    if "1" in choice:
        playlist_id = ask_download_playlist_songs()
        num_songs = ask_num_songs_to_download()
        songs = Youtube.get_playlist_songs(playlist_id, limit=num_songs)

    elif "2" in choice:
        data = ask_download_particular_song()
        songs = [Youtube.get_song(f"{data['artist']} {data['song']}")]

    else:
        sys.exit()

    path = ask_download_path()

    return songs, path


def main(): # Arguments: `Type Id Path TOKEN`
    for i, arg in enumerate(sys.argv):
        if (i == 1):
            Type = arg
        elif (i == 2):
            Id = arg
        elif (i == 3):
            path = arg
        elif (i == 4):
            Token = arg

    print("0");
    sys.stdout.flush();
    songs = [];
    if (Type == "song"):
        print("type is song", "https://api.spotify.com/v1/tracks/"+Id, Token);
        sys.stdout.flush();
        spotify_song = requests.get("https://api.spotify.com/v1/tracks/"+Id, headers={
            "Authorization": "Bearer " + Token
        });
        sys.stdout.flush();
        print("made request");
        sys.stdout.flush();
        if (spotify_song.status_code == 200):
            spotify_song = spotify_song.json()
            song_name = spotify_song["name"];
            song_artist = "";
            for (i, artist) in enumerate(spotify_song["artists"]):
                if (i == 0):
                    song_artist = artist["name"]
                else:
                    song_artist = song_artist + ", " + artist["name"]
            song_album = spotify_song["album"]["name"];
            song_cover = spotify_song["album"]["images"][0]["url"];

            songs = [
                Song(Id, song_name, song_artist, song_album, song_cover)
            ];
        else:
            print("Invalid song ID");
            sys.stdout.flush();
            sys.exit();
    else:
        songs = [];
    print("0.5"); 
    # platform = ask_platform()
    # if "1" in platform:
    #     songs, path = spotifydl()

    # elif "2" in platform:
    #     songs, path = youtubedl()

    # else:
    #     sys.exit()

    # if not os.path.exists(path):
    #     print("Invalid path")
    #     return

    os.chdir(Path(path));
    print("1");
    sys.stdout.flush();
    threads = []

    print("Downloading songs", songs);
    sys.stdout.flush();

    print("Press ctrl+c to stop.");
    print("0.5"); 
    for song in songs:
        if song is None:
            print("Unable to download song. Skipping..")
            continue

        thread = Thread(target=download, args=(song,), daemon=True)
        threads.append(thread)
        thread.start()
        print("1");
        sys.stdout.flush();
        # download(song)
    for thread in threads:
        thread.join()
    
    sys.stdout.flush();


if __name__ == "__main__":
    main()
