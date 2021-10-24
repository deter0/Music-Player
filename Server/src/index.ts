import express from 'express';
import fs from "fs";
import path from "path";
// import * as LoadData from "./LoadData";
import bodyParser from 'body-parser';
import cors from 'cors';
// import Ratings from './Rating';
// import { Images } from './Images';

import Graph from "./Graph";

import localIpUrl from "local-ip-url";
import * as Types from "./Types";

// Routers

import SongsRouter from './Routes/Songs';
import SearchRouter from "./Routes/Search";
import AlbumsRouter from './Routes/Albums';
import GetLocalNetworks from './GetLocalNetworkAddress';
import SpotifyRouter from './Routes/Spotify';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const port = 8080; // default port to listen

import GetUTC from './GetUTC';

(async () => {
	try {
		const RequiredFolders = ["Data", "Songs"];
		const RequiredFiles = ["Data/Plays.json", "Data/Ratings.json", "Data/Info.json"];
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
			}
		}
		for (const RequiredFile of RequiredFiles) {
			let FolderFiles = fs.readdirSync(`${Path}${RequiredFile.split("/")[0]}`);
			if (FolderFiles.indexOf(RequiredFile.split("/")[1]) === -1) {
				let Open = (fs.openSync(`${Path}${RequiredFile}`, 'w'));
				fs.writeSync(Open, "{}");
				fs.closeSync(Open);
			}
		}
	} catch (err) {
		throw err;
	}
})();

const Path = `/home/deter/Music/Liked`;

const SongArray: Types.SongArray = [];
const AlbumArray: Types.AlbumArray = [];
const SongLookup: Types.SongLookup = {};
const AlbumLookup: Types.AlbumLookup = {};
const SongImages: Types.SongImages = {};

app.use("/songs", new SongsRouter(SongArray, SongLookup, SongImages, AlbumArray, AlbumLookup, Path).Router);
app.use("/search", new SearchRouter(SongArray, AlbumArray).Router);
app.use("/albums", new AlbumsRouter(AlbumArray, AlbumLookup).Router);
app.use("/spotify", new SpotifyRouter().Router);

// start the Express server
const LocalIps = GetLocalNetworks();
const Ip = LocalIps.wlp2s0[0];
// NOTE(deter): Changing to local server because I'm going to be working on this at my school.
app.listen(port, () => {
	console.log(`server started at "http://localhost:${port}/ping"`);
});

const G = new Graph("Memory", process.stdout.columns - 30);
setInterval(() => {
	// const Memory = Math.abs(Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100);
	// G.PushData(Memory);
	// G.Print();
	// console.log(GetUTC());
}, 100);
