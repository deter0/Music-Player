import fs from "fs";
import path from "path";

export default class Path {
	constructor() {
		this.LoadPath();
	}
	Path?: string;
	private LoadPath() {
		try {
			this.Path = fs.readFileSync(path.join(__dirname, "../../Data/Path.txt"), "utf8");
			this.Path = this.Path.replace(/\r/g, "");
			this.Path = this.Path.replace(/\n/g, "");
		} catch (error) {
			if (error.code === "ENOENT") {
				this.Path = undefined;
			}
		}
	}
	SetPath(Path: string) {
		return new Promise<string>((resolve, reject) => {
			this.Path = Path;
			fs.writeFile(path.join(__dirname, "../../Data/Path.txt"), Path, (error) => {
				if (error) {
					reject(error);
				} else {
					resolve(Path);
				}
			});
		});
	}
}