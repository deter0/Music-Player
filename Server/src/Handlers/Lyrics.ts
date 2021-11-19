import axios from "axios";

const ValidateStr = (Str: string) => {
	return Str.normalize("NFD").replace(/[^a-zA-Z0-9 ]/g, "").replace(/[ ]/g, "-");
}

export default function Lyrics(Artist: string, Title: string): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		const LyricsQuery = `/lyrics/${ValidateStr(Artist)}/${ValidateStr(Title)}`;
		axios.get("https://www.musixmatch.com" + LyricsQuery).then(Response => {
			let LyricsRes = (Response.data as string).match(/\"body":"(.*)/gm);
			let Lyrics = LyricsRes[0].split(`"body":"`)[1].split(`","language`)[0].replace(/\\n/gm, "\n");
			resolve(Lyrics);
		}).catch(error => {
			reject(error);
		})
	});
}