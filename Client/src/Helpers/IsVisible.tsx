const IsVisible = (Element: HTMLElement) => {
	let rect = Element.getBoundingClientRect();
	let viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
	let viewWidth = Math.max(document.documentElement.clientWidth, window.innerWidth);

	return !(rect.bottom < 0 || rect.top - viewHeight >= 0)
		&& !(rect.right < 0 || rect.left - viewWidth >= 0);
}
export default IsVisible;