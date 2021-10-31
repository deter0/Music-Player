import { Router } from "express";
import Playback from "../Handlers/Playback";

export default class PlaybackRouter {
	Router = Router();
	Playback = new Playback();
	constructor() {
		this.Router.post("/", (Request, Response) => {
			let Data = Request.body as { Method: string, Data: typeof Playback.prototype.CurrentPlaying };
			if (Data) {
				this.Playback.ClientSetPlaying(Data);
				Response.sendStatus(200);
			} else {
				Response.sendStatus(400);
			}
		});
		this.Router.get("/", (Request, Response) => {
			Response.send(this.Playback.GetPlaybackState());
		})
	}
}