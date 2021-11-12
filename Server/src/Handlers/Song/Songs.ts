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
		const _global = global as any;
		_global.CacheSong = this.CacheSong.bind(this);
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

			const Title = Metadata.common.title || Identifier;
			const Artist = Metadata.common.artist || "Unkown";
			const Album = Metadata.common.album || Title;
			const Duration = Metadata.format.duration || 0;

			let CoverIndex;
			if (Cover) {
				const CoverIndex = sha256(`${Title},${Artist},${Album},${Duration}`);
				if (!this.SongImages[CoverIndex] && !DontSaveImage) {
					const CoverData = `data:${Cover.format};base64,${Cover.data.toString('base64')}`;
					this.SongImages[CoverIndex] = CoverData;
				}
			} else {
				console.log(Metadata);
			}
			const song = new Song(
				Artist,
				Title,
				Identifier,
				CoverIndex,
				Duration,
				Album,
				Cover ? Cover.format : "none",
				Cover ? `/songs/image?Identifier=${Identifier}` : "https://st4.depositphotos.com/14953852/22772/v/600/depositphotos_227725020-stock-illustration-image-available-icon-flat-vector.jpg",
			);
			song.Liked = (await this.Ratings.GetSongRating(song)).UserLiked;
			song.Codec = Metadata.format.codec;
			return song;
		} catch (error) {
			console.warn("ERROR:", error);
			return null;
		}
	}

	async GetRawSong(Identifier: string, Path?: string) {
		if (!Path && this.Path) {
			Path = this.Path;
		} else {
			Path = path.join(__dirname, '../Songs');
		}
		Path = path.join(Path, Identifier);
		return fs.readFileSync(Path);
	}

	async GetSongs(From: number, To: number, Path?: string, Sort: string = "Recent") {
		return new Promise<Song[]>(async (resolve, reject) => {
			const Songs = new Array<Song>();
			if (!Path) {
				Path = path.join(__dirname, '../Songs');
			}
			let FileNames = fs.readdirSync(Path);
			switch (Sort) {
				case ("Recent"):
					FileNames = FileNames.sort((a, b) => {
						const DCreatedA = fs.statSync(path.join(this.Path, a)).birthtimeMs;
						const DCreatedB = fs.statSync(path.join(this.Path, b)).birthtimeMs;

						return DCreatedA < DCreatedB ? 1 : -1;
					});
					break;
			}
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
	
	DeleteSong(Identifier: string) {
		return new Promise((resolve, reject) => {
			fs.unlink(path.join(this.Path, Identifier), (error) => {
				if (error) {
					reject(error);
				} else {
					resolve(true);
				}
			});
		});
	}

	async CacheAllSongs() {
		if (!this.Path) {
			this.Path = path.join(__dirname, '../Songs');
		}
		const FileNames = fs.readdirSync(this.Path);
		for (let i = 0; i < FileNames.length; i++) {
			this.CacheSong(FileNames[i]);
		}
	}

	async CacheSong(Identifier: string) {
		const Song = await this.GetSong(Identifier, this.Path, true);
		if (!Song) {
			return;
		}
		if (Song.Album) {
			let Id = sha256(Song.Album + Song.Artist);
			let Album = this.AlbumLookup[Id];
			if (!Album) {
				this.AlbumLookup[Id] = {
					Title: Song.Album,
					Artist: Song.Artist,
					Songs: [],
					Cover: Song.ImageData || `/songs/image?Identifier=${Identifier}`,
					Id: Id
				}
				this.AlbumArray.push(this.AlbumLookup[Id]);
			}
			Album = this.AlbumLookup[Id];
			Album.Songs.push(Song);
		}
		this.SongLookup[this.Path + Identifier] = Song;
		this.SongArray.push(Song);
		const _global = global as any;
		_global.UpdateSearch();
	}

	async GetSongImage(Identifier: string, Path?: string) {
		const FilePath = `${Path || this.Path}/${Identifier}`;
		const Metadata = await MusicMetadata.parseFile(FilePath);
		const Cover = MusicMetadata.selectCover(Metadata.common.picture);
		const CoverData = Cover.data.toString('base64');//`data:${Cover.format};base64,${Cover.data.toString('base64')}`;
		return CoverData;
	}

	PictureId = 0;
	MaxPictureId = 10;
	async GetSongImagePng(Identifier: string, Path?: string) {
		return new Promise<string>(async (resolve, reject) => {
			const FilePath = `${Path || this.Path}/${Identifier}`;
			const OutPath = path.join(__dirname, "../../../Temp");
			if (!fs.existsSync(OutPath)) {
				fs.mkdirSync(OutPath);
			}
			const OutFile = path.join(OutPath, `song_image_${this.PictureId}.jpeg`);
			this.PictureId++;
			if (this.PictureId > this.MaxPictureId) {
				this.PictureId = 0;
			}
			MusicMetadata.parseFile(FilePath).then(Metadata => {
				const Cover = MusicMetadata.selectCover(Metadata.common.picture);
				if (Cover !== null) {
					const CoverData = Cover.data.toString('base64');//`data:${Cover.format};base64,${Cover.data.toString('base64')}`;
					const binaryData = Buffer.from(CoverData, 'base64').toString('binary');

					fs.writeFile(OutFile, binaryData, "binary", function (err) {
						if (err) {
							reject(err);
						} else {
							resolve(OutFile);
						}
					});
				} else {
					resolve("");
				}
			}).catch(error => {
				console.error(error);
				reject(error);
			});
		});
	}
}