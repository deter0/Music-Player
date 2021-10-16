export default function SecondsToHMS(Seconds: number) {
	let hours: string | number = Math.floor(Seconds / 3600);
	let minutes: string | number = Math.floor((Seconds - (hours * 3600)) / 60);
	let seconds: string | number = Seconds - (hours * 3600) - (minutes * 60);

	let hours_str: string = hours.toString();
	let minutes_str: string = minutes.toString();
	let seconds_str: string = seconds.toString();
	if (hours < 10) { hours_str = "0" + hours; }
	if (minutes < 10) { minutes_str = "0" + minutes; }
	if (seconds < 10) { seconds_str = "0" + seconds; }
	return (hours <= 0 ? '' : (hours_str + ":")) + minutes_str + ' : ' + seconds_str;
}