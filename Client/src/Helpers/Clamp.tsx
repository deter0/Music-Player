export default function Clamp(x: number, min: number, max: number) {
	if (x < min)
		return min;
	else if (x > max)
		return max;
	else
		return x;
}