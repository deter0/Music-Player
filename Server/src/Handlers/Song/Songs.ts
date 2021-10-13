import fs from "fs";
import path from "path";
import sha256 from "sha256";
import * as Types from "../../Types";
import * as MusicMetadata from "music-metadata";
import { Table } from "console-table-printer";

import * as Ratings from "./Rating/Rating";

class Song extends Types.Song { };

export const Formats = [".m4a", ".mp3", ".wav"];

var FileExtensionPattern = /\.[0-9a-z]+$/i;
const GetFileExtension = (FileName: string) => {
	const Match = FileName.match(FileExtensionPattern);
	return Match ? Match[0] : null;
}

const GetUTC = () => {
	const now = new Date();
	return now.getUTCSeconds() + now.getUTCMilliseconds() / 1000;
}

export default class Songs {
	SongArray: Types.SongArray;
	SongLookup: Types.SongLookup;
	SongImages: Types.SongImages;
	Ratings: Ratings.default;
	AlbumArray: Types.AlbumArray;
	AlbumLookup: Types.AlbumLookup;
	Path?: string;
	constructor(
		SongArray: Types.SongArray,
		SongLookup: Types.SongLookup,
		SongImages: Types.SongImages,
		Ratings: Ratings.default,
		AlbumArray: Types.AlbumArray,
		AlbumLookup: Types.AlbumLookup,
		Path?: string
	) {
		this.SongArray = SongArray;
		this.SongLookup = SongLookup;
		this.SongImages = SongImages;
		this.Ratings = Ratings;
		this.Path = Path;

		this.AlbumArray = AlbumArray;
		this.AlbumLookup = AlbumLookup;

		const Start = GetUTC();
		this.CacheAllSongs().finally(() => {
			let AverageSongsInUniqueAlbums = 0;
			let UniqueAlbumCount = 0;

			for (const Album of this.AlbumArray) {
				if (Album.Songs.length > 1) {
					UniqueAlbumCount++;
					AverageSongsInUniqueAlbums += Album.Songs.length;
				}
			}
			AverageSongsInUniqueAlbums /= UniqueAlbumCount;

			let TimeTook = (GetUTC() - Start).toString().substr(0, 5) + "s";
			let numTimeTook = (GetUTC() - Start);
			const MaxAcceptableTime = Math.abs(this.SongArray.length * 0.0144);
			const table = new Table();
			table.addRow(
				{ index: 0, type: "Songs", amount: this.SongArray.length, time: TimeTook },
				{ color: (numTimeTook > MaxAcceptableTime) ? 'yellow' : 'white' }
			);
			table.addRows([
				{ index: 1, type: "Albums", amount: this.AlbumArray.length, time: TimeTook },
				{ index: 2, type: "Unique Albums", amount: UniqueAlbumCount, time: TimeTook },
				{ index: 3, type: "Average songs in unique albums", amount: AverageSongsInUniqueAlbums.toString().substr(0, 5), time: TimeTook },
			]);
			table.printTable();
		});
	}

	async GetSong(Identifier: string, Path?: string, DontSaveImage?: boolean, DontLookup?: boolean) {
		let Accepted = false;
		const FileExtension = GetFileExtension(Identifier);
		for (const Format of Formats) {
			if (FileExtension && FileExtension === Format) {
				Accepted = true;
			}
		}
		if (!FileExtension || !Accepted) {
			return null;
		}

		Path = Path || this.Path || path.join(__dirname + "../Songs");
		try {
			if (!DontLookup && this.SongLookup[Path + Identifier]) {
				const LookupSong = this.SongLookup[Path + Identifier];
				await LookupSong.Update();
				return LookupSong;
			}
			if (!Path) {
				Path = path.join(__dirname, '../Songs');
			}
			const FilePath = `${Path}/${Identifier}`;
			const Metadata = await MusicMetadata.parseFile(FilePath);
			const Cover = MusicMetadata.selectCover(Metadata.common.picture);
			const CoverIndex = sha256(`${Metadata.common.title},${Metadata.common.artist},${Metadata.common.album},${Metadata.format.duration}`);
			if (!this.SongImages[CoverIndex] && !DontSaveImage) {
				const CoverData = `data:${Cover.format};base64,${Cover.data.toString('base64')}`;
				this.SongImages[CoverIndex] = CoverData;
			}
			const song = new Song(
				Metadata.common.artist,
				Metadata.common.title,
				Identifier,
				CoverIndex,
				Metadata.format.duration,
				Metadata.common.album,
				Cover.format,
				`/songs/thumbnail?Identifier=${Identifier}`,
			);
			song.Liked = (await this.Ratings.GetSongRating(song)).UserLiked;
			song.Codec = Metadata.format.codec;
			return song;
		} catch (error) {
			console.warn("ERROR:", error);
			return null;
		}
	}

	async GetSongs(From: number, To: number, Path?: string) {
		return new Promise<Song[]>(async (resolve, reject) => {
			const Songs = new Array<Song>();
			if (!Path) {
				Path = path.join(__dirname, '../Songs');
			}
			const FileNames = fs.readdirSync(Path);
			let Finished = 0;
			To = Math.min(FileNames.length, To);
			From = Math.max(0, From);
			if ((!From && !To) || (From === 0 && To === 0))
				resolve([]);
			for (let i = From; i < To; i++) {
				(async () => {
					const FileName = FileNames[i];
					const Song = await this.GetSong(FileName, Path, true);
					if (Song) {
						Songs.push(Song);
					}
					Finished++;
				})().finally(() => {
					if (Finished >= (To - From)) {
						resolve(Songs);
					}
				}).catch(error => {
					console.error(error);
				});
			}
		})
	}

	async CacheAllSongs() {
		if (!this.Path) {
			this.Path = path.join(__dirname, '../Songs');
		}
		const FileNames = fs.readdirSync(this.Path);
		for (let i = 0; i < FileNames.length; i++) {
			const Song = await this.GetSong(FileNames[i], this.Path, true);
			if (!Song) {
				continue;
			}
			if (Song.Album) {
				let Id = sha256(Song.Album + Song.Artist);
				let Album = this.AlbumLookup[Id];
				if (!Album) {
					this.AlbumLookup[Id] = {
						Title: Song.Album,
						Artist: Song.Artist,
						Songs: [],
						Cover: `/songs/thumbnail?Identifier=${FileNames[i]}`,
						Id: Id
					}
					this.AlbumArray.push(this.AlbumLookup[Id]);
				}
				Album = this.AlbumLookup[Id];
				Album.Songs.push(Song);
			}
			this.SongLookup[this.Path + FileNames[i]] = Song;
			this.SongArray.push(Song);
		}
	}

	async GetSongImage(Identifier: string, Path?: string) {
		const FilePath = `${Path || this.Path}/${Identifier}`;
		const Metadata = await MusicMetadata.parseFile(FilePath);
		const Cover = MusicMetadata.selectCover(Metadata.common.picture);
		const CoverData = `data:${Cover.format};base64,${Cover.data.toString('base64')}`;
		return CoverData;
	}
}