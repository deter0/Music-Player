import Signal from "../Signal";
import RawShortcutsBindingData from "./Shortcuts.json";

type Bind = string[];

class ShortcutBinding {
	Binds: Bind[];
	name: string;
	constructor(from: string, name: string) {
		this.Binds = [];
		this.name = name;
		from.toLowerCase().split("\n").forEach((keybindPair) => {
			this.Binds.push(keybindPair.split("+"));
		});
		this.Binds.forEach((value, index) => { // Filters "" strings
			this.Binds[index] = value.filter((bind) => {
				return bind !== "";
			});
		});
		return this;
	}
}

function InitalizeBindings(): ShortcutBinding[] {
	let ShortcutData = [];
	for (const keyIndex in RawShortcutsBindingData) {
		const key = RawShortcutsBindingData[keyIndex];
		ShortcutData.push(
			new ShortcutBinding(key.Keys, key.Name)
		);
	}

	return ShortcutData;
}

class KeybindConnection {
	name: string;
	signal: Signal<KeyboardEvent>;
	constructor(name: string, signal: Signal<KeyboardEvent>) {
		this.name = name;
		this.signal = signal;
	}
};

const OnKeyDown = new Signal<KeyboardEvent>();
document.addEventListener("keydown", (event) => {
	OnKeyDown.dispatch(event);
});

const OnKeyUp = new Signal<KeyboardEvent>();
document.addEventListener("keyup", (event) => {
	OnKeyUp.dispatch(event);
});

class Shortcuts {
	ShortcutData: ShortcutBinding[];
	Connections = new Array<KeybindConnection>();
	keysDown = new Array<string>();

	constructor() {
		this.ShortcutData = InitalizeBindings();

		OnKeyDown.connect((event) => {
			if (!event || !event.key)
				return;
			const key = event.key.toLowerCase();

			if (this.keysDown.indexOf(key) === -1) {
				this.keysDown.push(key);
			}

			for (const shortcutData of this.ShortcutData) {
				let bindPressed: boolean = true;
				shortcutData.Binds.forEach((bind) => {
					if (!bindPressed) return;
					bind.forEach((bindKey) => {
						const keyPressed = this.keysDown.indexOf(bindKey) !== -1;
						if (!keyPressed) {
							bindPressed = false;
						}
					});
				})
				if (bindPressed) {
					this.GetConnectionByName(shortcutData.name).signal.dispatch(event);
					event.preventDefault();
				}
			};
		});
		OnKeyUp.connect((event) => {
			if (!event || !event.key)
				return;
			const key = event.key.toLowerCase();

			this.keysDown = this.keysDown.filter((value) => {
				return value !== key;
			});
		});
	}
	On(name: string): Signal<KeyboardEvent> {
		let foundConnection: KeybindConnection = this.GetConnectionByName(name);
		return foundConnection.signal;
	}
	private GetConnectionByName(name: string): KeybindConnection {
		let foundConnection: KeybindConnection | undefined = undefined;
		for (let i = 0; i < this.Connections.length; i++) {
			if (this.Connections[i].name === name) {
				foundConnection = this.Connections[i];
			}
		}
		if (foundConnection === undefined) {
			foundConnection = this.CreateConnection(name);
		}

		return foundConnection;
	}
	private CreateConnection(name: string): KeybindConnection {
		const keybindConnection = new KeybindConnection(name, new Signal<KeyboardEvent>());
		this.Connections.push(keybindConnection);

		return keybindConnection;
	}
};

export default Shortcuts;