import express from 'express';
import fs from "fs";
import path from "path";
// import * as LoadData from "./LoadData";
import bodyParser from 'body-parser';
import cors from 'cors';
// import Ratings from './Rating';
// import { Images } from './Images';

import Graph from "./Graph";

import * as Types from "./Types";

// Routers

import SongsRouter from './Routes/Songs';
import SearchRouter from "./Routes/Search";
import AlbumsRouter from './Routes/Albums';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const port = 8080; // default port to listen

const GetUTC = () => {
	const now = new Date();
	return now.getUTCSeconds() + now.getUTCMilliseconds() / 1000;
}

(async () => {
	try {
		const RequiredFolders = ["Data", "Songs"];
		const RequiredFiles = ["Data/Plays.json", "Data/Ratings.json"];
		const Path = path.join(__dirname, '../');
		const Files = await fs.readdirSync(Path);

		for (const RequiredFolder of RequiredFolders) {
			if (Files.indexOf(RequiredFolder) === -1) {
				await fs.mkdirSync(`${Path}/${RequiredFolder}`);

				for (const RequiredFile of RequiredFiles) {
					if (RequiredFile.split(`/`)[0] === RequiredFolder) {
						await fs.closeSync(await fs.openSync(`${Path}/${RequiredFile}`, 'w'));
					}
				}
			} else {
				// const FolderFiles = await fs.readdirSync(`${Path}/${RequiredFolder}`);
				// console.log(`Search data: ${FolderFiles} ${typeof (FolderFiles)} index of ${FolderFiles.indexOf(`Plays.json`)}`)
				// for (const RequiredFile of RequiredFiles) {
				// 	console.log(`Searching for: "${RequiredFile.split(`/`)[1]}"`)
				// 	if (FolderFiles.indexOf(RequiredFile.split(`/`)[1]) === -1) {
				// 		console.log(`created file ${RequiredFile.split(`/`)[1]}`);
				// 		console.log(FolderFiles.indexOf(RequiredFile.split(`/`)[1]), '\n');
				// 		for (const File of FolderFiles) {
				// 			console.log(File == RequiredFile.split(`/`)[1]);
				// 			console.log(File);
				// 		}
				// 		await fs.closeSync(await fs.openSync(`${Path}/${RequiredFile}`, 'w'));
				// 	}
				// }
			}
		}
	} catch (err) {
		throw err;
	}
})();

const Path = `/home/deter/Music/Liked`;
// LoadData.CacheAllSongs(Path).then(() => {
// 	console.log("Cached all songs");
// });

// app.post("/like/:Id", async (Request, Response) => {
// 	console.log(`Setting liked ${Request.params.Id} ${Request.body.Liked}`);
// 	Ratings.SetRating(Request.params.Id, Request.body.Liked);
// });

// app.post("/", async (req, res) => {
// 	const response
// 		= await LoadData.GetSongs(
// 			req.body.From,
// 			req.body.To,
// 			Path
// 		);
// 	res.status(200).send(response);
// });

// app.post("/albums", async (Request, Response) => {
// 	const response = await LoadData.GetAlbums(
// 		Request.body.From,
// 		Request.body.To
// 	);
// 	Response.send(response);
// });

// app.post("/song/:Id", async (Request, Response) => {
// 	const Identifier = Request.body.Identifier as string;
// 	if (Identifier) {
// 		const Song = await LoadData.GetSong(Identifier, Path, false, false);
// 		if (Song) {
// 			console.log("Responding with song", Song);
// 			Response.status(200).send(JSON.stringify(Song));
// 		} else {
// 			Response.sendStatus(404);
// 		}
// 	} else {
// 		Response.sendStatus(400);
// 	}
// });

// app.get("/album/:Title", (Request, Response) => {
// 	const Title = Request.params.Title;
// 	const Artist = Request.query.Artist as string;

// 	if (Title && Artist) {
// 		const Album = LoadData.GetAlbum(Title, Artist);
// 		if (Album) {
// 			Response.send(Album);
// 		} else {
// 			Response.sendStatus(404);
// 		}
// 	} else {
// 		Response.sendStatus(400);
// 	}
// })

// app.get("/search-songs", (Request, Response) => {
// 	const Query = Request.query.Query as string;
// 	const From = parseInt((Request.query.From || "0") as string);
// 	const To = parseInt((Request.query.To || "8") as string);
// 	if (Query) {
// 		Response.status(200).send(LoadData.SearchSongs(Query, From, To));
// 	}
// });

// app.post("/search-albums", (Request, Response) => {
// 	const Query = Request.query.Query as string;
// 	const From = parseInt((Request.body.From || "0") as string);
// 	const To = parseInt((Request.body.To || "20") as string);
// 	console.log(Query, From, To);
// 	if (Query) {
// 		Response.status(200).send(LoadData.SearchAlbums(Query, From, To));
// 	}
// });

// app.get("/ping", (_, Response) => {
// 	Response.sendStatus(200);
// })

// app.use("/song-image/", Images(async (Id: string, Request: any) => {
// 	const Identifier = Request.query.Identifier as string;

// 	if (Identifier) {
// 		return LoadData.GetSongThumbnail(Id, Identifier, Path);
// 	} else {
// 		return 400;
// 	}
// }));

// app.get("/song/play/:SongIdentifier", async (Request, Response) => {
// 	if (Request.params.SongIdentifier) {
// 		try {
// 			const Song = await LoadData.GetSongData(Request.params.SongIdentifier, Path);
// 			Response.send(Song);
// 		} catch (error) {
// 			console.error(error);
// 			Response.sendStatus(400);
// 		}
// 	}
// });

const SongArray: Types.SongArray = [];
const AlbumArray: Types.AlbumArray = [];
const SongLookup: Types.SongLookup = {};
const AlbumLookup: Types.AlbumLookup = {};
const SongImages: Types.SongImages = {};

app.use("/songs", new SongsRouter(SongArray, SongLookup, SongImages, AlbumArray, AlbumLookup, Path).Router);
app.use("/search", new SearchRouter(SongArray, AlbumArray).Router);
app.use("/albums", new AlbumsRouter(AlbumArray, AlbumLookup).Router);

// start the Express server
app.listen(port, "192.168.2.13", () => {
	console.log(`server started at http://192.168.2.13:${port}`);
	setTimeout(() => {
		const G = new Graph("Memory", process.stdout.columns - 30);
		setInterval(() => {
			const Memory = Math.abs(Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100);
			G.PushData(Memory);
			G.Print();
		}, 1000);
	}, 15000);
});
