import ApiRequest from "./modules/apirequest.js";
import BgLoader from "./modules/bgloader.js";
const slider = document.querySelector(".slider") as HTMLDivElement,
	pageWrapper = document.querySelector("#page-wrapper") as HTMLDivElement,
	touchAreaLeft = document.querySelector(
		".touch-area.left"
	) as HTMLDivElement,
	touchAreaRight = document.querySelector(
		".touch-area.right"
	) as HTMLDivElement,
	slides = Array.from(
		document.querySelectorAll(".slide")
	) as HTMLDivElement[],
	apiRequestUrl = "http://localhost/vincentsjogren_slide/api";

window.oncontextmenu = (ev: MouseEvent) => {
	ev.preventDefault();
	ev.stopPropagation();
	return false;
};

window.onload = async () => {
	const apiHeaders = {Accept: "application/json"};
	const apiReq = new ApiRequest(apiRequestUrl, apiHeaders);
	const result = await apiReq.sendRequest();
	if (typeof result === "boolean") {
		slides[2].style.backgroundImage =
			"http://localhost/vincentsjogren_slide/public/img/default.jpg";
		slides[2].style.opacity = "1";
	} else {
		const loader = new BgLoader(
			slider,
			slides,
			result.img_files,
			result.img_sizes,
			result.img_base_url,
			result.img_prefix,
			touchAreaLeft,
			touchAreaRight
		);
		await loader.init();
		window.onkeydown = (ev: KeyboardEvent) => {
			if (ev.key === "ArrowLeft") loader.moveRight();
			if (ev.key === "ArrowRight") loader.moveLeft();
		};
		touchAreaLeft.ontouchstart = touchAreaLeft.onmousedown = () =>
			loader.moveRight();
		touchAreaRight.ontouchstart = touchAreaRight.onmousedown = () =>
			loader.moveLeft();
	}
};
