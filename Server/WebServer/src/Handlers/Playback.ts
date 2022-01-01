import * as Types from "../Types";
import path from "path";
import fs from 'fs';
import GetUTC from "../GetUTC";

const DATA_PATH = "../../../Data/Playback.json";

export default class Playback {
	CurrentPlaying?: {
		Song: Types.Song,
		Started?: number,
		Ended?: number
	}
	private SetPlaying(Playing: typeof this.CurrentPlaying) {
		this.CurrentPlaying = Playing;
		this.SavePlaybackState();
	}
	ClientSetPlaying(Playing: { Method: string, Data: typeof this.CurrentPlaying }) {
		this.CurrentPlaying = {
			Song: Playing.Data.Song,
			Started: this.CurrentPlaying.Started,
			Ended: this.CurrentPlaying.Ended
		};
		switch (Playing.Method) {
			case ("Play"):
				console.log("Playing");
				this.CurrentPlaying.Started = GetUTC();
				break;
			case ("Stop"):
				console.log("Stopping");
				this.CurrentPlaying.Ended = GetUTC();
				break;
			case ("Pause"):
				console.log("Pausing");
				this.CurrentPlaying.Ended = GetUTC();
				break;
			case ("UnPause"):
				console.log("UnPause");
				this.CurrentPlaying.Ended = undefined;
				break;
		}
		this.SavePlaybackState();
	}
	constructor() {
		this.ReadPlaybackState();
	}
	GetPlaybackState() {
		if (this.CurrentPlaying) {
			let Song = this.CurrentPlaying.Song;
			let Started = this.CurrentPlaying.Started || GetUTC();
			let Ended = this.CurrentPlaying.Ended || GetUTC();
			let Delta = Ended - Started;
			console.log("Delta", Delta, this.CurrentPlaying);
			return {
				Song: Song,
				CurrentTime: Delta
			};
		}
	}
	private SavePlaybackState() {
		console.log("saving", this.CurrentPlaying);
		fs.writeFileSync(path.join(__dirname, DATA_PATH), JSON.stringify(this.CurrentPlaying), 'utf-8');
		console.log("Saved Playback state!");
	}
	private ReadPlaybackState() {
		try {
			let PlaybackState = JSON.parse(fs.readFileSync(path.join(__dirname, DATA_PATH), "utf-8")) as typeof this.CurrentPlaying;
			this.SetPlaying(PlaybackState);
		} catch (error) {
			console.warn(error);
		}
	}
}