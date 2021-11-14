import Signal from "./Signal";

export default class WS {
	Url: string; // 'ws://localhost:8081'
	Connection: WebSocket;
	constructor(Url: string, Protocols: string[] = ['soap', 'xmpp']) {
		this.Url = Url;

		const Connection = new WebSocket(this.Url, Protocols);
		this.Connection = Connection;
		this.SubscribeEvents();
	}
	private InternalOnMessage(Message: MessageEvent) {
		try {
			const JSONObj = JSON.parse(Message.data.toString());
			if (JSONObj.Action) {
				const ConnectionSignal = this.Connections[JSONObj.Action];
				if (ConnectionSignal) {
					if (typeof (JSONObj.Data) === "string") {
						JSONObj.Data = JSON.parse(JSONObj.Data);
					}
					ConnectionSignal.dispatch(JSONObj.Data as typeof ConnectionSignal.Z);
				} else {
					console.warn(`WARNING: Dropped ${JSONObj.Action} WS Event for there were no listeners.`);
				}
			} else {
				console.warn(`!WARNING: Dropped WS Event for the data was malformed.`);
			}
		} catch (error) {
			console.error(error);
		}
	}
	private SubscribeEvents() {
		this.Connection.onmessage = (Message: MessageEvent<{ Action: string, Data: unknown }>) => {
			this.InternalOnMessage(Message);
		};
	}
	private Connections: { [Key: string]: Signal<unknown> } = {};
	SubscribeEvent<T>(Action: string): Signal<T> {
		if (this.Connections[Action]) {
			console.log("Action subscription exiists");
			return this.Connections[Action] as Signal<T>;
		} else {
			console.log(`WS: Subscribing to ${Action}`);
			const ConnectionSignal = new Signal<T>();
			this.Connections[Action] = ConnectionSignal;
			return ConnectionSignal;
		}
	}
	UnSubscribeEvent(Action: string) {
		console.log(`WS: UnSubscribing to ${Action}`);
		delete this.Connections[Action];
	}
}