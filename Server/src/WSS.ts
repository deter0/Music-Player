import Signal from "./Signal";
import WebSocket, { WebSocketServer } from "ws";

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


class Message<T> {
	ClientId: string;
	Data: string;
	constructor(ClientId: string, Data: string) {
		this.ClientId = ClientId;
		this.Data = Data;
	}
	Prase(): T {
		try {
			return JSON.parse(this.Data);
		} catch (error) {
			console.error(error);
		}
	}
}

export class WSC {
	Socket: WebSocket;
	ClientId: string;
	private WSS: WSS;
	constructor(Socket: WebSocket, Server: WSS) {
		this.Socket = Socket;
		this.WSS = Server;
		this.ClientId = UUID();

		console.log(`New Client connected to ws ${this.ClientId}`);

		Socket.on("message", (Message: string) => {
			this.OnInternalMessage(Message);
		});
		Socket.on("close", (Reason) => {
			console.log(`Client ${this.ClientId} because ${Reason}`);
			this.WSS.ClientDisconnect(this);
		});
	}
	private OnInternalMessage(MessageRaw: string) {
		const SentMessage = new Message(this.ClientId, MessageRaw);
		this.WSS.HandleMessage(this, SentMessage);
	}
	Send(Action: string, Data: any, Referer: string = "NONE", RefererId?: string) {
		// console.log(`Sent client ${this.ClientId} some data.`);
		this.Socket.send(JSON.stringify({ Action: Action, Data: Data, Referer: Referer, Id: RefererId }));
	}
}

export default class WSS {
	Port: number; // 8081
	Server: WebSocketServer;
	WebSocketConnections: WSC[] = [];
	constructor(PORT: number = 8082) {
		this.Port = PORT;

		const wss = new WebSocketServer({ port: PORT });
		this.Server = wss;

		this.Server.on("connection", (Socket: WebSocket) => {
			const WebSocketConnection = new WSC(Socket, this);
			this.WebSocketConnections.push(WebSocketConnection);
		});
	}
	HandleMessage(Client: WSC, Message: Message<any>) {
		const MessageData = Message.Prase();
		const Action = MessageData.Action as string;
		console.log(MessageData);
		if (this.RequestHandlers[Action]) {
			const Response = this.RequestHandlers[Action](Client, Message);
			if (Response) {
				Client.Send(Action, Response, "RESPONSE", MessageData.MessageId);
			}
		} else {
			Client.Send(Action, null, "RESPONSE", MessageData.MessageId);
		}
		// console.log(`Recieved message from ${Client.ClientId} with content: ${Message.Data}:${typeof (Message.Prase())}`);
	}
	Send(Action: string, Message: string, ValidateClient?: (Client: WSC) => boolean) {
		for (let WebSocketConnection of this.WebSocketConnections) {
			if (ValidateClient && !ValidateClient(WebSocketConnection)) {
				continue;
			}
			WebSocketConnection.Send(Action, Message);
		}
	}
	RequestHandlers: { [Action: string]: (Client: WSC, Message: Message<unknown>) => unknown } = {};
	AppendRequestHandler<T>(Action: string, Callback: (Client: WSC, Message: Message<T>) => unknown) {
		this.RequestHandlers[Action] = Callback;
	};
	ClientDisconnect(Client: WSC) {
		this.WebSocketConnections = this.WebSocketConnections.filter((WebSocketConnection) => {
			return WebSocketConnection.ClientId !== Client.ClientId;
		});
	}
}