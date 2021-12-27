import axios from "axios";
import fs from "fs";
import path from "path";
import * as Types from "../Types";

const ValidateStr = (Str: string) => {
	return Str.normalize("NFD").replace("'", "-").replace(/[^a-zA-Z0-9-: ]/g, "").replace(/[ :]/g, "-");
}

var ExplicitWords = fs.readFileSync(path.join(__dirname, "../../Assets/ExplicitWords.txt"), "utf8").split("\n")
ExplicitWords = ExplicitWords.map(Word => Word.toLowerCase().replace("\r", "")).filter(Word => Word.length > 0 && !Word.startsWith("##"));
console.log(ExplicitWords);
export function AreLyricsExplicit(Lyrics: string): boolean {
	let Count = 0;
	for (const ExplicitWord of ExplicitWords) {
		if (Lyrics.match(new RegExp(`\\b${ExplicitWord}\\b`, "gi"))) {
			Count++;
		}
		if (Count > 1) {
			return true;
		}
	}
	return false;
}

var LyricsData!:{[key: string]: string};
function SaveLyrics(Song: Types.Song) {
	if (!fs.existsSync(path.join(__dirname, "../../Data/Lyrics.json"))) {
		fs.writeFileSync(path.join(__dirname, "../../Data/Lyrics.json"), "{}");
	}
	if (!LyricsData) {
		LyricsData = JSON.parse(fs.readFileSync(path.join(__dirname, "../../Data/Lyrics.json"), "utf8"));
	}
	LyricsData[Song.Identifier] = Song.Lyrics;
	fs.writeFileSync(path.join(__dirname, "../../Data/Lyrics.json"), JSON.stringify(LyricsData));
}

function ReadLyrics() {
	const _global = global as any;
	if (!_global.GetSong || !_global.CachedAllSongs) {
		setTimeout(ReadLyrics, 500);
		return;
	}
	if (!fs.existsSync(path.join(__dirname, "../../Data/Lyrics.json"))) {
		fs.writeFileSync(path.join(__dirname, "../../Data/Lyrics.json"), "{}");
	}
	LyricsData = JSON.parse(fs.readFileSync(path.join(__dirname, "../../Data/Lyrics.json"), "utf8")) || {};
	
	for (const SongIdentifier in LyricsData) {
		_global.GetSong(SongIdentifier).then((Song:Types.Song) => {
			Song.Lyrics = LyricsData[SongIdentifier];
		}).catch(() => {
			console.warn("Unknow song id: ", SongIdentifier);
		});
	}
}
ReadLyrics();

const Lyrics = (Song: Types.Song, In: number = 0): Promise<string> => {
	const Artist = Song.Artist;
	const Title = Song.Title;
	return new Promise<string>(async (resolve, reject) => {
		if (Song.Lyrics) {
			console.log("Cached lyrics.");
			resolve(Song.Lyrics);
			return;
		}
		const LyricsQuery = `/lyrics/${ValidateStr(Artist) + (In !== 0 ? `-${In}` : "")}/${ValidateStr(Title)}`;
		console.log("Fetching lyrics", LyricsQuery);
		axios.get("https://www.musixmatch.com" + LyricsQuery).then(Response => {
			let LyricsRes = (Response.data as string).match(/\"body":"(.*)/gm);
			let Lyrics = LyricsRes[0].split(`"body":"`)[1].split(`","language`)[0].replace(/\\n/gm, "<br/>").replace("\n", "<br/>");
			Song.Lyrics = Lyrics;
			SaveLyrics(Song);
			resolve(Lyrics);
		}).catch(async error => {
			let Resolved = false;
			if (In === 0) {
				for (let i = 1; i <= 3; i++) { /*
					 Motive:
					 Sometimes artist are named weirdly (well sometimes it's not even possible to name them correctly) if they're are multiple artists
					 with the same name it'll append a `-n` to their name so if the lyrics aren't find try it five times
				*/
				if (Resolved) return;
					Lyrics(Song, i).then(LyricsRetry => {
						resolve(LyricsRetry);
						Resolved = true;
						return;
					}).catch(error => {
						console.log(`Lyrics fetch attempt ${i + 1} failed`);
					})
				}
			} else {
				Song.Lyrics = "";
				Song.ExplicitLikely = false;
				console.log("Saved non lyrics.");
				SaveLyrics(Song);
				reject(error);
			}
		})
	});
}

export default Lyrics;