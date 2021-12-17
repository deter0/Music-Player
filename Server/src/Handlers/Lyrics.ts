import axios from "axios";

const ValidateStr = (Str: string) => {
	return Str.normalize("NFD").replace("'", "-").replace(/[^a-zA-Z0-9-: ]/g, "").replace(/[ :]/g, "-");
}

const Lyrics = (Artist: string, Title: string, In: number = 0): Promise<string> => {
	return new Promise<string>(async (resolve, reject) => {
		const LyricsQuery = `/lyrics/${ValidateStr(Artist) + (In !== 0 ? `-${In}` : "")}/${ValidateStr(Title)}`;
		console.log("Fetching lyrics", LyricsQuery);
		axios.get("https://www.musixmatch.com" + LyricsQuery).then(Response => {
			let LyricsRes = (Response.data as string).match(/\"body":"(.*)/gm);
			let Lyrics = LyricsRes[0].split(`"body":"`)[1].split(`","language`)[0].replace(/\\n/gm, "<br/>").replace("\n", "<br/>");
			resolve(Lyrics);
		}).catch(async error => {
			let Resolved = false;
			if (In === 0) {
				for (let i = 0; i < 5; i++) { /*
					 Motive:
					 Sometimes artist are named weirdly (well sometimes it's not even possible to name them correctly) if they're are multiple artists
					 with the same name it'll append a `-n` to their name so if the lyrics aren't find try it five times
				*/
					if (Resolved) return;
					Lyrics(Artist, Title, i + 1).then(LyricsRetry => {
						console.log(`Lyrics retryed ${i} times and found.`);
						console.log(LyricsRetry);
						resolve(LyricsRetry);
						Resolved = true;
						return;
					}).catch(error => {
						console.log(`Lyrics fetch attempt ${i + 1} failed`);
					})
				}
			} else {
				reject(error);
			}
		})
	});
}

export default Lyrics;