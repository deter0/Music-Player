// import path from "path";
// import fs from "fs";
// import * as Rating from "./Rating";

// import * as MusicMetadata from "music-metadata";
// import sha256 from "sha256";

// import Fuse from "fuse.js";
// import * as Types from "./Server/src/Types";

// export let SongImages: Types.SongImages = {};
// export const SongLookup: Types.SongLookup = {};
// export const SongArray: Types.SongArray = [];

// class Song extends Types.Song { };
// export const AlbumLookup: Types.AlbumLookup = {};
// export const AlbumArray: Types.AlbumArray = [];

// declare type SongT = Types.Song;

// const GetUTC = () => {
// 	const now = new Date();
// 	return now.getUTCSeconds() + now.getUTCMilliseconds() / 1000;
// }

// export const GetSongs = (From_: any, To_: any, Path?: string) => {
// 	return new Promise<Song[]>(async (resolve, reject) => {
// 		const Songs = new Array<Song>();
// 		if (!Path) {
// 			Path = path.join(__dirname, '../Songs');
// 		}
// 		const FileNames = await fs.readdirSync(Path);
// 		let Finished = 0;
// 		let From: number = 0; let To: number = 0;
// 		if (typeof (From_) === "string")
// 			From = parseInt(From_);
// 		else
// 			From = From_;
// 		if (typeof (To_) === "string")
// 			To = parseInt(To_);
// 		else
// 			To = To_;

// 		if (From < 0)
// 			From = 0;
// 		if (To >= FileNames.length)
// 			To = FileNames.length;

// 		if ((!From && !To) || (From === 0 && To === 0))
// 			resolve([]);
// 		for (let i = From; i < To; i++) {
// 			(async () => {
// 				const FileName = FileNames[i];
// 				const FilePath = `${Path}/${FileName}`;
// 				const LookupSong = SongLookup[Path + FileName];
// 				if (LookupSong) {
// 					await LookupSong.Update();
// 					Songs.push(LookupSong);
// 					Finished++;
// 					return;
// 				}
// 				const Metadata = await MusicMetadata.parseFile(FilePath);
// 				const Cover = MusicMetadata.selectCover(Metadata.common.picture);
// 				const CoverIndex = sha256(`${Metadata.common.title},${Metadata.common.artist},${Metadata.common.album},${Metadata.format.duration}`);
// 				if (!SongImages[CoverIndex]) {
// 					// const CoverData = `data:${Cover.format};base64,${Cover.data.toString('base64')}`;
// 					// SongImages[CoverIndex] = CoverData;
// 				}
// 				const song = new Song(
// 					Metadata.common.artist,
// 					Metadata.common.title,
// 					FileName,
// 					CoverIndex,
// 					Metadata.format.duration,
// 					Metadata.common.album,
// 					Cover.format,
// 					`/song-image/${CoverIndex}`,
// 				);
// 				song.Liked = (await Rating.GetSongRating(song)).UserLiked;
// 				song.Codec = Metadata.format.codec;
// 				Songs.push(song);
// 				Finished++;
// 			})().finally(() => {
// 				if (Finished >= (To - From)) {
// 					resolve(Songs);
// 				}
// 			});
// 		}
// 	})
// }

// export const GetAlbums = async (From: any, To: any) => {
// 	const Albums = new Array<Types.Album>();
// 	if (typeof (From) === "string")
// 		From = parseInt(From);
// 	if (typeof (To) === "string")
// 		To = parseInt(To);
// 	else
// 		To = To;

// 	if (To > AlbumArray.length)
// 		To = AlbumArray.length;
// 	for (let i = From; i < To; i++) {
// 		Albums.push(AlbumArray[i]);
// 	}

// 	return Albums;
// }

// export const CacheAllSongs = async (Path?: string) => {
// 	if (!Path) {
// 		Path = path.join(__dirname, '../Songs');
// 	}
// 	const FileNames = await fs.readdirSync(Path);
// 	for (let i = 0; i < FileNames.length; i++) {
// 		const Song = await GetSong(FileNames[i], Path, true);
// 		if (Song.Album) {
// 			let Album = AlbumLookup[Song.Album + Song.Artist];
// 			if (!Album) {
// 				AlbumLookup[Song.Album + Song.Artist] = {
// 					Title: Song.Album,
// 					Artist: Song.Artist,
// 					Songs: [],
// 					Cover: `/song-image/${Song.CoverIndex}`,
// 					Id: Song.Identifier
// 				}
// 				AlbumArray.push(AlbumLookup[Song.Album + Song.Artist]);
// 			}
// 			Album = AlbumLookup[Song.Album + Song.Artist];
// 			Album.Songs.push(Song);
// 		}
// 		SongLookup[Path + FileNames[i]] = Song;
// 		SongArray.push(Song);
// 	}
// }

// export const GetSong = async (Identifier: string, Path?: string, DontSaveImage?: boolean, DontLookup?: boolean) => {
// 	try {
// 		if (!DontLookup && SongLookup[Path + Identifier]) {
// 			const LookupSong = SongLookup[Path + Identifier];
// 			await LookupSong.Update();
// 			return LookupSong;
// 		}
// 		if (!Path) {
// 			Path = path.join(__dirname, '../Songs');
// 		}
// 		const FilePath = `${Path}/${Identifier}`;
// 		const Metadata = await MusicMetadata.parseFile(FilePath);
// 		const Cover = MusicMetadata.selectCover(Metadata.common.picture);
// 		const CoverIndex = sha256(`${Metadata.common.title},${Metadata.common.artist},${Metadata.common.album},${Metadata.format.duration}`);
// 		if (!SongImages[CoverIndex] && !DontSaveImage) {
// 			const CoverData = `data:${Cover.format};base64,${Cover.data.toString('base64')}`;
// 			SongImages[CoverIndex] = CoverData;
// 		}
// 		const song = new Song(
// 			Metadata.common.artist,
// 			Metadata.common.title,
// 			Identifier,
// 			CoverIndex,
// 			Metadata.format.duration,
// 			Metadata.common.album,
// 			Cover.format,
// 			`/song-image/${CoverIndex}`,
// 		);
// 		song.Liked = (await Rating.GetSongRating(song)).UserLiked;
// 		song.Codec = Metadata.format.codec;
// 		return song;
// 	} catch (error) {
// 		console.warn("ERROR:", error);
// 		return null;
// 	}
// }

// // * This is a fallback if the thumbnail doesn't appear in cache
// export const GetSongThumbnail = async (Id: string, Identifier: string, Path?: string) => {
// 	let Image = SongImages[Id];
// 	if (!Image) {
// 		if (Identifier) {
// 			const Song = await GetSong(Identifier, Path, false, true);
// 			if (Song) {
// 				Image = SongImages[Song.CoverIndex];
// 			}
// 		}
// 	}
// 	return Image;
// }

// export const GetAlbum = (Title: string, Artist: string) => {
// 	const Lookup = Title + Artist;
// 	return AlbumLookup[Lookup];
// }

// const SongSearchOptions = {
// 	shouldSort: true,
// 	threshold: 0.58,
// 	keys: [
// 		"Title",
// 		"Album",
// 		"Artist"
// 	]
// };

// export const GetSongData = async (Identifier: string, Path?: string) => {
// 	return await fs.readFileSync(`${Path || path.join(__dirname, '../Songs')}/${Identifier}`);
// }

// const AlbumSearchOptions = {
// 	shouldSort: true,
// 	threshold: 0.58,
// 	keys: [
// 		"Artist",
// 		"Title",
// 		"Song.Title",
// 		"Song.Album"
// 	]
// };
// export const SearchSongs = (Query: string, From: number, To: number) => {
// 	Query = Query.trim();
// 	Query = Query.substr(0, 200);
// 	const FuseSongSearch = new Fuse(SongArray, SongSearchOptions);
// 	const SongResults = FuseSongSearch.search(Query, {
// 		limit: 20
// 	});
// 	for (const Result of SongResults) {
// 		Result.item.Update();
// 	}
// 	const Songs = SongResults.map(Result => {
// 		return Result.item;
// 	});

// 	return Songs;
// }

// export const SearchAlbums = (Query: string, From: number, To: number) => {
// 	Query = Query.trim();
// 	Query = Query.substr(0, 200);
// 	const FuseAlbumSearch = new Fuse(AlbumArray.filter(Album => {
// 		return Album.Songs.length > 1;
// 	}), AlbumSearchOptions);
// 	const AlbumResults = FuseAlbumSearch.search(Query, {
// 		limit: Math.min(To, 8)
// 	});
// 	const Albums = AlbumResults.map(Result => {
// 		return Result.item;
// 	});
// 	return Albums;
// }

// // Clear images every 30 seconds so memory doesnt explode
// setInterval(() => {
// 	SongImages = {};
// }, 30 * 1000);
