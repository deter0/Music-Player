export default function Lerp(x: number, y: number, a: number) {
	return (1 - a) * x + y * a;
}