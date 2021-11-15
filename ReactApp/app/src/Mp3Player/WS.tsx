import Signal from "./Signal";
import GetUTC from "./Helpers/GetUTC";

function UUID() { // Public Domain/MIT
	let d = new Date().getTime();//Timestamp
	let d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		let r = Math.random() * 16;//random number between 0 and 16
		if (d > 0) {//Use timestamp until depleted
			r = (d + r) % 16 | 0;
			d = Math.floor(d / 16);
		} else {//Use microseconds since page-load if supported
			r = (d2 + r) % 16 | 0;
			d2 = Math.floor(d2 / 16);
		}
		return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
}

export default class WS {
	Url: string; // 'ws://localhost:8081'
	Connection: WebSocket;
	constructor(Url: string, Protocols: string[] = ['soap', 'xmpp']) {
		this.Url = Url;

		const Connection = new WebSocket(this.Url, Protocols);
		this.Connection = Connection;
		this.SubscribeEvents();
		this.HandleOvergoingRequests();
	}
	HandleOvergoingRequests() {
		setInterval(() => {
			const Now = GetUTC();
			for (let i = 0; i < this.OutgoingMessages.length; i++) {
				if (this.OutgoingMessages[i]) {
					const ElapsedTime = Now - this.OutgoingMessages[i].At;
					if (ElapsedTime > 10) {
						this.OutgoingMessages[i].Reject("TIMEOUT");
						this.OutgoingMessages.splice(i, 1);
					}
				}
			}
		}, 500);
	}
	private InternalOnMessage(Message: MessageEvent) {
		try {
			const JSONObj = JSON.parse(Message.data.toString());
			if (JSONObj.Action) {
				if (JSONObj.Referer === "RESPONSE") {
					const Id = JSONObj.Id;
					const Now = GetUTC();
					for (let i = 0; i < this.OutgoingMessages.length; i++) {
						if (!this.OutgoingMessages[i])
							continue;
						if (this.OutgoingMessages[i].Id === Id) {
							this.OutgoingMessages[i].Resolve({ Action: JSONObj.Action, Data: JSONObj.Data });
							this.OutgoingMessages.splice(i, 1);
							break;
						} else {
							if (Now - this.OutgoingMessages[i].At > 10) {
								this.OutgoingMessages[i].Reject("TIMEOUT");
								this.OutgoingMessages.splice(i, 1);
							}
						}
					}
					return;
				}
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
	private OutgoingMessages: { At: number, Action: string, Id: string, Resolve: (params: { Action: string, Data: unknown }, Reject: (Reason?: any) => void) => void }[] = [];
	SendData<T>(Action: string, Data: unknown, AnticipatingResponse: boolean = true) {
		return new Promise<{ Action: String, Data: T }>((Resolve, Reject) => {
			if (typeof (Data) === "object") {
				Data = JSON.stringify(Data as { [key: string]: unknown });
			}
			const MessageId = UUID();
			this.Connection.send(JSON.stringify({
				Action: Action,
				Data: Data,
				MessageId: MessageID
			}));
			if (AnticipatingResponse) {
				this.OutgoingMessages.push({
					Action: Action,
					Id: MessageId,
					Resolve: Resolve,
					Reject: Reject,
					At: GetUTC()
				});
			} else {
				Resolve({ Action: "NO_DATA", Data: undefined });
			}
		})
	}
}