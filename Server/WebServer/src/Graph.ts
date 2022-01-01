// ?(deter): Bored as hell

export default class Graph {
	Buffer: number[];
	BufferSize: number;
	LargestValue: number;
	LowestValue: number;
	RangeL?: number;
	RangeH?: number;
	Label: string;
	constructor(Label: string, BufferSize: number, RangeL?: number, RangeH?: number) {
		this.Buffer = [];
		this.BufferSize = BufferSize;
		this.Label = Label;
		this.RangeL = RangeL;
		this.RangeH = RangeH;
		this.LargestValue = -Infinity;
		this.LowestValue = Infinity;
	}
	PushData(Data: number) {
		this.LargestValue = -Infinity;
		this.LowestValue = Infinity;
		for (let i = 1; i < this.BufferSize; i++) {
			if (!this.RangeH) {
				if (this.Buffer[i] < this.LowestValue) {
					this.LowestValue = this.Buffer[i];
				} else if (this.Buffer[i] > this.LargestValue) {
					this.LargestValue = this.Buffer[i];
				}
			}
			this.Buffer[i - 1] = this.Buffer[i];
		}
		this.Buffer[this.BufferSize - 1] = Data;
		if (!this.RangeH) {
			if (Data < this.LowestValue) {
				this.LowestValue = Data;
			} else if (Data > this.LargestValue) {
				this.LargestValue = Data;
			}
		}
	}
	Print() {
		let String = "";
		const Height = process.stdout.rows - 2;
		// process.stdout.write('\u001b[{n}J');
		console.log("\n".repeat(Height * 2));
		if (this.LargestValue === this.LowestValue) {
			this.LargestValue += 10;
			this.LowestValue -= 10;
		}
		for (let y = 0; y < Height; y++) {
			let XString = "";
			for (let x = 0; x < this.BufferSize; x++) {
				let Value = Math.floor((this.Buffer[x] - (this.RangeL || this.LargestValue || 0)) / ((this.RangeH || this.LowestValue || 1) - (this.RangeL || this.LargestValue || 0)) * Height) - 1;
				// let NextValue = 0;
				// if (this.Buffer[x + 1]) {
				// 	NextValue = Math.round((this.Buffer[x + 1] - (this.RangeL || this.LargestValue || 0)) / ((this.RangeH || this.LowestValue || 1) - (this.RangeL || this.LargestValue || 0)) * Height);
				// }
				if (y === Value || y > Value || Value === 1 || Value === 0 || Value === NaN) {//(y > Value && y < NextValue) || (y > NextValue && y < Value)) {
					XString += `\u001b[31m$\u001b[0m`;
				} else {
					XString += "\u001b[234m.\u001b[0m";
				}
			}
			let LastValue = (this.Buffer[this.BufferSize - 1] - (this.RangeL || this.LargestValue || 0)) / ((this.RangeH || this.LowestValue || 1) - (this.RangeL || this.LargestValue || 0)) * Height;
			if (y === Math.round(LastValue)) {
				String += "|" + XString + `| ${this.Label}: ${this.Buffer[this.BufferSize - 1]}\n`;
			} else if (y === 0) {
				String += "|" + XString + `| ${this.RangeH || this.LargestValue}\n`;
			} else if (y === Height - 1) {
				String += `|` + XString + `| ${this.RangeL || this.LowestValue}\n`;
			} else {
				String += "|" + XString + "|\n";
			}
		}
		process.stdout.write(String + "\n");
		// process
	}
}