import sys
from typing import Iterator, Optional
import re

import requests
from ytmusicapi import YTMusic

from utils import Song


ytmusic = YTMusic()


class Youtube:
    def __init__(self):
        pass

    @staticmethod
    def get_playlist_songs(playlist_id: str, limit: int = 100) -> Iterator[Song]:
        try:
            data = ytmusic.get_playlist(playlistId=playlist_id, limit=limit)
        except Exception as e:
            return None

        fetched = 0
        for track in data["tracks"]:
            if fetched >= limit:
                break

            vid_id = track["videoId"]

            yield Song(
                imgurl=f"https://i.ytimg.com/vi/{vid_id}/sddefault.jpg",
                vidurl=f"https://www.youtube.com/watch?v={vid_id}",
                title=track["title"],
                artist=track["artists"][0]["name"],
                album=track["album"]["name"] if track["album"] else track["title"],
            )

            fetched += 1

    @staticmethod
    def get_video_id(song_name: str) -> Optional[str]:
        query = "+".join(song_name.split()).encode("utf-8")
       
        url = f"https://www.youtube.com/results?search_query={query}+lyrics"
        html = requests.get(url)
        vid_ids = re.findall(r"watch\?v=(\S{11})", html.text)

        print(len(vid_ids));
        return vid_ids[0] if vid_ids else None

    @staticmethod
    def get_song(song_name: str) -> Optional[Song]:
        vid_id = Youtube.get_video_id(song_name)

        try:
            track = ytmusic.get_song(videoId=vid_id)["videoDetails"]
        except Exception as e:
            return None

        return Song(
            imgurl=f"https://i.ytimg.com/vi/{vid_id}/sddefault.jpg",
            vidurl=f"https://www.youtube.com/watch?v={vid_id}",
            title=track["title"],
            artist=track["author"],
            album=track["title"],
        )
