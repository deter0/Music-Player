export default function GetUTC() {
	const now = new Date();
	return now.getSeconds() + now.getMilliseconds() / 1000;
}