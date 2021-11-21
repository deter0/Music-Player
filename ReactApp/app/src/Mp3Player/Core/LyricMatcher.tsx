import GetUTC from "../Helpers/GetUTC";

/* WIP
*/export default class LyricMatcher {
	private Lyrics: string[];
	private Line: number = 0;
	private Audio: HTMLAudioElement;
	constructor(Lyrics: string, Audio: HTMLAudioElement) {
		this.Lyrics = Lyrics.split("<br/>");
		this.Audio = Audio;

		this.Init();
	}
	private Init(): void {
		this.Audio.crossOrigin = "anonymous";

		const Context = new AudioContext();
		const Analyzer = Context.createAnalyser();
		const AudioSource = Context.createMediaElementSource(this.Audio);
		AudioSource.connect(Analyzer);
		Analyzer.connect(Context.destination);

		const Canvas: HTMLCanvasElement = document.createElement("canvas");
		Canvas.width = window.innerWidth;
		Canvas.height = 450;
		Canvas.style.marginBottom = "400px";

		const SliderB = document.createElement("input");
		SliderB.type = "range"
		SliderB.min = "0";
		SliderB.max = `0.95`
		SliderB.step = "0.01";
		const SliderE = document.createElement("input");
		SliderE.type = "range"
		SliderE.min = "0";
		SliderE.max = `0.95`
		SliderE.step = "0.01";

		SliderB.value = "0.342987"
		SliderE.value = "0.550987"

		const Display = document.createElement("h1") as HTMLHeadingElement;

		document.getElementById("root")?.appendChild(SliderB);
		document.getElementById("root")?.appendChild(SliderE);
		document.getElementById("root")?.appendChild(Display);
		document.getElementById("root")?.appendChild(Canvas);
		const CanvasContext = Canvas.getContext("2d");

		if (!CanvasContext)
			return;

		let SBS = 0;
		let LastLineChange = GetUTC();
		let SBD = 0;
		let _i = 0;
		let PeakData = {
			At: 0,
			Value: 0
		};
		const Callback = () => {
			const VocalStart = Math.floor(Analyzer.frequencyBinCount * parseFloat(SliderB.value));
			const VocalEnd = Math.floor(Analyzer.frequencyBinCount * parseFloat(SliderE.value));
			// if (myChart)
			// 	return;
			const FrequencyData = new Uint8Array(Analyzer.frequencyBinCount);
			Analyzer.getByteFrequencyData(FrequencyData);

			// CanvasContext.clearRect(0, 0, Canvas.width, Canvas.height);
			CanvasContext.fillStyle =
				`rgb(${(_i / Canvas.width) * 255}, ${255 - (_i / Canvas.width) * 255}, 255)`;
			// console.log(`SBS: ${SBS >= 1 ? SBS : 0}`);
			const Line = this.Lyrics[this.Line];
			if (!Line)
				return;
			const Now = GetUTC();
			let Characters = 0;
			Line.split(" ").forEach((Word, Index) => {
				Characters += Word.length * 1;
			});
			const Syllables = Math.pow(Characters, 1.6);

			if (SBD * (1 + this.Audio.volume) > Syllables) {
				this.Line++;
				if (this.Lyrics[this.Line].trim() === "") {
					this.Line++;
				}
				SBD = 0;
			}

			// for (let i = 0; i <= BarCount; i++) {
			// 	const BarWidth = 2;
			// 	const BarHeight = -(FrequencyData[i] / 2);
			// 	// CanvasContext.fillRect(BarPosition, Canvas.height, BarWidth, BarHeight);
			// }
			let Average = 0;
			for (let i = VocalStart; i <= VocalEnd; i++) {
				Average += FrequencyData[i];
			}
			Average /= VocalEnd - VocalStart;
			if (Average > PeakData.Value) {
				PeakData.Value = Average;
				PeakData.At = this.Audio.currentTime;
			} else if (!(Math.abs(Average - PeakData.Value) > 1.5) || (this.Audio.currentTime - PeakData.At > 0.2)) {
				SBD += Average;
			}
			if (this.Audio.currentTime - PeakData.At > 0.2) {
				PeakData.Value = Average;
				PeakData.At = this.Audio.currentTime;
			}
			Display.innerHTML =
				`
				Frequency: ${Analyzer.frequencyBinCount}<br/>
				Vocal Start: ${VocalStart}<br/>VocalEnd: ${VocalEnd}<br/>
				Average: ${Average}<br/>
				Line: ${this.Lyrics[this.Line]}<br/>
				S: ${Syllables}<br/>
				SBD: ${SBD}<br/>
				`
			CanvasContext.fillRect(_i, Canvas.height, 1, -Average);
			_i++;
			if (_i > Canvas.width) {
				CanvasContext.clearRect(0, 0, Canvas.width, Canvas.height);
				_i = 0;
			}
			requestAnimationFrame(Callback);
		}
		requestAnimationFrame(Callback);
	}
}