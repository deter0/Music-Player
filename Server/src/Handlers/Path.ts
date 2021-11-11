import fs from "fs";
import path from "path";

export default class Path {
	constructor() {
		this.LoadPath();
	}
	Path?: string;
	private LoadPath() {
		try {
			let PInfo = fs.readFileSync(path.join(__dirname, "../../Data/Path.txt"), "utf8");
			let Data = PInfo.split("\n");
			this.Path = Data[0];
			this.Python = Data[1];
		} catch (error) {
			if (error.code === "ENOENT") {
				this.Path = undefined;
			}
		}
	}
	Python?: string;
	SetPath(Path: string, Python?: string) {
		return new Promise<string>((resolve, reject) => {
			Path.replace(/\\/g, "/");
			Path.replace(/\n/g, "");
			if (Python) {
				Python.replace(/[^a-z0-9]/g, "");
				Python.replace(/\n/g, "");
			}
			this.Path = Path;
			fs.writeFile(path.join(__dirname, "../../Data/Path.txt"), `${Path}\n${Python || ""}`, (error) => {
				if (error) {
					reject(error);
				} else {
					resolve(Path);
				}
			});
		});
	}
}