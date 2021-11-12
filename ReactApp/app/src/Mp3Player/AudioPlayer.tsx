import * as App from "./App";
import Signal from "./Signal";
import { Song } from "./Types";

export default class AudioPlayer {
	Audio: HTMLAudioElement;
	OnPause = new Signal<boolean>();
	OnEnded = new Signal<void>();
	OnLoad = new Signal<boolean>();
	OnSongChange = new Signal<Song>();
	constructor(src: string) {
		this.Audio = document.createElement("audio");

		this.Audio.oncanplaythrough = () => {
			this.Audio.play();
		}
		this.Audio.onpause = () => {
			this.OnPause.dispatch(true);
		}
		this.Audio.onplay = () => {
			this.OnPause.dispatch(false);
		}
		this.Audio.onended = () => {
			this.OnEnded.dispatch();
		}
		this.Audio.onload = () => {
			this.OnLoad.dispatch(true);
		}
		this.Audio.onloadstart = () => {
			this.OnLoad.dispatch(false);
		}
	}
	PlayingSong?: Song;
	PlaySong(Song: Song) {
		const Src = `http://localhost:${App.Port[0]}/songs/raw?Identifier=${Song.Identifier}`;
		this.Audio.pause();
		this.SetSrc(Src);
		this.PlayingSong = Song;
		this.OnSongChange.dispatch(Song);
		this.Seek(0);
		this.SetMetadata(Song);
	}
	SetMetadata(Song: Song) {
		if ('mediaSession' in navigator) {
			navigator.mediaSession.playbackState = "playing";
			if ('mediaSession' in navigator) {
				navigator.mediaSession.metadata = new MediaMetadata({
					title: 'Unforgettable',
					artist: 'Nat King Cole',
					album: 'The Ultimate Collection (Remastered)',
					artwork: [
						{ src: 'https://dummyimage.com/96x96', sizes: '96x96', type: 'image/png' },
						{ src: 'https://dummyimage.com/128x128', sizes: '128x128', type: 'image/png' },
						{ src: 'https://dummyimage.com/192x192', sizes: '192x192', type: 'image/png' },
						{ src: 'https://dummyimage.com/256x256', sizes: '256x256', type: 'image/png' },
						{ src: 'https://dummyimage.com/384x384', sizes: '384x384', type: 'image/png' },
						{ src: 'https://dummyimage.com/512x512', sizes: '512x512', type: 'image/png' },
					]
				});
				navigator.mediaSession.setActionHandler('play', () => {
					this.Pause(true);
				});
				navigator.mediaSession.setActionHandler('pause', () => {
					this.Pause(false);
				});
			}
			console.log("Set metadata");
			console.log(navigator.mediaSession.metadata);
		}
	}
	TimeUpdates: Signal<number>[] = [];
	SubscribeOnTimeUpdate(Interval: number) {
		let TimeUpdate = new Signal<number>();
		setInterval(() => {
			TimeUpdate.dispatch(this.Audio.currentTime);
		}, Interval);
		this.TimeUpdates.push(TimeUpdate);
		return TimeUpdate;
	}
	Seek(Time: number) {
		this.Audio.currentTime = Time;
		for (let i = 0; i < this.TimeUpdates.length; i++) {
			this.TimeUpdates[i].dispatch(Time);
		}
	}
	SetSrc(src: string) {
		this.Audio.pause();
		this.Audio.src = src;
		this.Audio.load();
	}
	GetSong() {
		return this.PlayingSong;
	}
	IsPlaying() {
		return !this.Audio.paused;
	}
	Pause(state?: boolean) {
		if (state || !this.Audio.paused) {
			this.Audio.pause();
		} else {
			this.Audio.play();
		}
	}
}