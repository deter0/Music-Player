type Callback = (...args: any) => void;

export class Connection {
	isConnected: boolean;
	__signal: any;
	__callback: Callback | null;
	constructor(Signal: any, callback: Callback) {
		this.isConnected = true;
		this.__signal = Signal;
		this.__callback = callback;
	}
	disconnect() {
		this.isConnected = false;
		this.__callback = null;
		this.__signal.__disconnect(this);
	}
}

class Signal<T> {
	Connections: Connection[];
	Z!: T;
	constructor() {
		this.Connections = [];
	}
	connect(callback: (args: T) => void): Connection {
		var connection = new Connection(this, callback);
		this.Connections.push(connection);

		return connection;
	}
	__disconnect(connection: Connection) {
		let ind = -1;
		this.Connections.filter((value, index) => {
			if (ind === -1 && value === connection) {
				ind = index;
			}
			return null;
		});
		delete this.Connections[ind];
	}
	dispatch(args: T) {
		this.Connections.forEach((connection) => {
			if (connection.__callback) {
				connection.__callback(args);
			}
		})
	}
}

export default Signal;