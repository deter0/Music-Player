import * as Types from "../../Types";
import fs from "fs";
import path from "path";
import * as MusicMetadata from "music-metadata";

const MAX_TMP = 33;

/*
Read images ordered by when they were last modified.
*/
function ReadImages(Path: string) {
	const Images = new Array<string>();
	const ImagePaths = fs.readdirSync(Path);
	ImagePaths.sort((a, b) => {
		const DCreatedA = fs.statSync(path.join(Path, a)).birthtimeMs;
		const DCreatedB = fs.statSync(path.join(Path, b)).birthtimeMs;
		return DCreatedA < DCreatedB ? 1 : -1;
	});
	return Images;
}
const TmpPath = path.join(__dirname, "../../../Temp");
const Images = ReadImages(TmpPath);

/* If there are more images than the max, delete the oldest ones. */
if (Images.length > MAX_TMP) {
	// ? This might delete other images that were accidentally put in the tmp folder. But this is a rare case. Since tmp folder is local.
	for (let i = 0; i < Images.length - MAX_TMP; i++) {
		fs.unlinkSync(path.join(TmpPath, Images[i]));
	}
}

function CreatingImage(): boolean {
	if (Images.length + 1 > MAX_TMP) {
		/* Delete the oldest images */
		for (let i = 0; i < Images.length + 1 - MAX_TMP; i++) {
			const OldestImage = Images.shift();
			if (OldestImage) {
				if (fs.existsSync(path.join(TmpPath, OldestImage))) {
					fs.unlinkSync(path.join(TmpPath, OldestImage));
				} else {
					console.warn("WARN: attempt to unlink file that doesn't exist: " + path.join(TmpPath, OldestImage));
				}
			}
		}
		return true;
	} else {
		/* Return false because we did not do anything */
		return false;
	}
}

/* Add image to images array */
function CreatedImage(Path: string) {
	Images.push(Path);
}

export default function CacheImageForSong(Song: Types.Song, MusicFilePath: string) {
	return new Promise<string>((resolve, reject) => {
		/* Check if an image with the Song.Album is already in the tmp folder. */
		const OutFilePath = path.join(TmpPath, Song.Album.replace(/[#<%>&\*\{\?\}/\\$+!`'\|\"=@\.\[\]:]*/g, "") + ".jpeg");
		const ImagePath = OutFilePath;
		if (fs.existsSync(ImagePath)) {
			resolve(ImagePath);
			return;
		}
		CreatingImage();
		/* If not, create an image with the Song.Album */
		MusicMetadata.parseFile(MusicFilePath, { duration: true }).then(async (Metadata) => {
			const Cover = MusicMetadata.selectCover(Metadata.common.picture);
			if (Cover) {
				const CoverData = Cover.data.toString('base64');//`data:${Cover.format};base64,${Cover.data.toString('base64')}`;
				const binaryData = Buffer.from(CoverData, 'base64').toString('binary');

				fs.writeFile(OutFilePath, binaryData, "binary", function (err) {
					if (err) {
						reject(err);
					} else {
						CreatedImage(Song.Album.replace(/[#<%>&\*\{\?\}/\\$+!`'\|\"=@\.\[\]:]*/g, "") + ".jpeg");
						resolve(OutFilePath);
					}
				});
			} else {
				/* Image does not exist return default image */
				resolve(path.join(__dirname, "../../../Assets/Images/default.png"));
				// TODO: Add default image
			}
		}).catch(error => {
			reject(error);
		});
	});
}