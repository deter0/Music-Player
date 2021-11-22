import express from 'express';
import fs from "fs";
import path from "path";
// import * as LoadData from "./LoadData";
import bodyParser from 'body-parser';
import cors from 'cors';
import * as PathHandler from "./Handlers/Path";
// import Ratings from './Rating';
// import { Images } from './Images';

import Graph from "./Graph";

import * as Types from "./Types";

// import { spawn } from "child_process";
// (async () => {
// 	try {
// 		let python = spawn("python", ["-V"]);
// 		python.on("close", (code) => {
// 			console.log(`python child process exited with code ${code}`);
// 		});
// 	} catch (e) { }
// 	try {
// 		let python = spawn("python3", ["-V"]);
// 		python.on("close", (code) => {
// 			console.log(`python3 child process exited with code ${code}`);
// 		});
// 	} catch (e) { }
// 	try {
// 		let Python = spawn("Python", ["-V"]);
// 		Python.on("close", (code) => {
// 			console.log(`Python child process exited with code ${code}`);
// 		});
// 	} catch (e) { }
// })();

// Routers

import SongsRouter from './Routes/Songs';
import SearchRouter from "./Routes/Search";
import AlbumsRouter from './Routes/Albums';
import GetLocalNetworks from './GetLocalNetworkAddress';
import SpotifyRouter from './Routes/Spotify';
import PlaylistsRouter from "./Routes/Playlists";
import { Playlist } from './Handlers/Playlists/Playlists';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
export const GET_PORT = () => 9091;
export const PORT = GET_PORT(); // default port to listen

import GetUTC from './GetUTC';
import PlaybackRouter from './Routes/Playback';
import WSS from './WSS';
import axios from 'axios';
import LyricsRouter from './Routes/Lyrics';

(async () => {
	try {
		const RequiredFolders = ["Data", "Songs"];
		const RequiredFiles = ["Data/Plays.json", "Data/Ratings.json", "Data/Info.json", "Data/Playback.json", "Data/Playlists.json"];
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

const SongArray: Types.SongArray = [];
const AlbumArray: Types.AlbumArray = [];
const SongLookup: Types.SongLookup = {};
const AlbumLookup: Types.AlbumLookup = {};
const SongImages: Types.SongImages = {};
const ArtistLookup: Types.ArtistLookup = {};
const ArtistArray: Types.ArtistArray = [];

const PlaylistArray: Playlist[] = [];
const PlaylistLookup: { [key: string]: Playlist } = {};

const pathHandler = new PathHandler.default();

const WebServer = new WSS(PORT + 1);

WebServer.AppendRequestHandler<null>("Live", (Client, Message) => {
	return true;
});

// ! Could this have security issues?
app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
	res.header('Access-Control-Allow-Credentials', 'true');
	res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
	res.header('Access-Control-Expose-Headers', 'Content-Length');
	res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range');
	if (req.method === 'OPTIONS') {
		return res.send(200);
	} else {
		return next();
	}
});

var RoutesSubscribed = false;
const SubscribeRoutes = () => {
	if (!RoutesSubscribed) {
		RoutesSubscribed = true;
		app.use("/songs", new SongsRouter(SongArray, SongLookup, SongImages, AlbumArray, AlbumLookup, pathHandler.Path).Router);
		app.use("/search", new SearchRouter(SongArray, AlbumArray).Router);
		app.use("/albums", new AlbumsRouter(AlbumArray, AlbumLookup).Router);
		app.use("/spotify", new SpotifyRouter(pathHandler.Path, WebServer, pathHandler.Python).Router);
		app.use("/playback", new PlaybackRouter().Router);
		app.use("/playlists", new PlaylistsRouter(PlaylistArray, PlaylistLookup, WebServer).Router);
		app.use("/lyrics", new LyricsRouter().Router);
	}
}

if (pathHandler.Path) {
	SubscribeRoutes();
}
app.post("/", (Request, Response) => {
	let Path = Request.query.Path as string;
	let Python = Request.query.Python as string;

	if (!pathHandler.Path && Path) {
		pathHandler.SetPath(Path, Python).then((Path: string) => {
			SubscribeRoutes();
		}).catch(error => {
			console.error(error);
		});
		Response.sendStatus(202);
	} else {
		Response.sendStatus(400);
	}
})
app.get("/path", (Request, Response) => {
	Response.send(pathHandler.Path !== undefined);
});
app.get("/online", (Request, Response) => {
	Response.sendStatus(200);
});
// start the Express server
// const LocalIps = GetLocalNetworks();
// const Ip = LocalIps.wlp2s0[0];
// NOTE(deter): Changing to local server because I'm going to be working on this at my school.
app.listen(PORT, () => {
	console.log(`server started at "http://localhost:${PORT}/ping"`);
});

