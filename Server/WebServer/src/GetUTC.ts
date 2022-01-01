var Start = new Date(2020, 1);
export default function GetUTC() {
	let Now = new Date(); // Your date
	let Elapsed = (Now.getTime() - Start.getTime()) / 1000;
	return Elapsed;
}