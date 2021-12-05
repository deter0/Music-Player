import re
import os
import sys

from pytube import YouTube as youtube_dl
import requests
from mutagen.mp4 import MP4, MP4Cover

from utils import Song
from youtube import Youtube

song_gl = None;
song_name_gl = "";

def progress_callback(stream, chunk, bytes_remaining):
    print(bytes_remaining);
    return;

# def on_complete_callback(stream, file_handle):
#     if (song_gl):
#         addtags(os.getcwd() + f"/{song_name_gl}.m4a", song_gl);

def download_song_from_yt(vid_url: str, song_name: str, song:Song) -> None:
    """Download song in the current directory and rename it"""
    song_gl = song;
    song_name_gl = song_name;
    def completed(*args):
        print("COMPLETED");
        addtags(os.path.join(os.getcwd(), song_name+".m4a"), song_gl);
    vid = youtube_dl(vid_url, on_progress_callback=progress_callback, on_complete_callback=completed);
    ys = vid.streams.filter(only_audio=True, file_extension='mp4').last();
    ys.download(output_path=os.getcwd(), filename=song_name+".m4a");


def addtags(songpath: str, song: Song) -> None:
    TITLE = "\xa9nam"
    ALBUM = "\xa9alb"
    ARTIST = "\xa9ART"
    ART = "covr"
    f = MP4(songpath)
    f[TITLE] = song.title
    f[ALBUM] = song.album
    f[ARTIST] = song.artist
    res = requests.get(song.imgurl)
    f[ART] = [MP4Cover(res.content, MP4Cover.FORMAT_JPEG)]
    f.save()

def get_video_id(song_name: str) -> str:
    """Get the video id from the song name"""
    response = requests.get(f"https://www.youtube.com/results?search_query={song_name}")
    if (response.status_code != 200):
        sys.stderr("Got non 200 response from youtube")
        sys.exit(1)
    regex_result = re.search(r'\/watch\?v=(.{11})', response.text)
    link = regex_result.group(1) if regex_result else None
    if (link):
        return f"https://youtu.be/{link}";

def download(song: Song) -> None:
    INVALID = r"[#<%>&\*\{\?\}/\\$+!`'\|\"=@\.\[\]:]*"
    song_name = re.sub(
        INVALID, "", f"{song.artist} {song.title}"
    )  # Remove invalid chars
    vid_id = get_video_id(song_name);
    if (not vid_id):
        sys.stderr("Something went wrong finding youtube link")
        sys.exit(1);
    song.vidurl = vid_id

    song_path = f"{song_name}.m4a"

    if os.path.exists(song_path):
        print(f"Skipping {song_name} : Already Downloaded")
        return

    print(f"Downloading {vid_id}");
    sys.stdout.flush();
    download_song_from_yt(vid_id, song_name, song)
    # addtags(song_path, song)
    # except Exception as e:
    #     if os.path.exists(song_path):
    #         os.remove(song_path)

    #     print(f"Error downloading {song_name}: {e}")
