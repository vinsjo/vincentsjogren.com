import ApiRequest from "./modules/apirequest.js";
import BgLoader from "./modules/bgloader.js";
import {shuffleArray} from "./modules/functions.js";
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
	apiRequestUrl = "http://localhost/vincentsjogren.com/api";
// window.oncontextmenu = (ev: MouseEvent) => {
// 	ev.preventDefault();
// 	ev.stopPropagation();
// 	return false;
// };

window.onload = async () => {
	const apiHeaders = {Accept: "application/json"};
	const apiReq = new ApiRequest(apiRequestUrl, apiHeaders);
	const result = await apiReq.sendRequest();
	if (typeof result === "object") {
		const loader = new BgLoader(
			slider,
			slides,
			shuffleArray(result.img_files),
			result.img_sizes,
			result.img_base_url,
			result.img_prefix,
			touchAreaLeft,
			touchAreaRight
		);
		await loader.init();
		window.onkeydown = (ev: KeyboardEvent) => {
			ev.key === "ArrowLeft" && loader.moveLeft();
			ev.key === "ArrowRight" && loader.moveRight();
		};
		window.ontouchend = window.onclick = (ev: MouseEvent | TouchEvent) => {
			if (
				!ev.type.includes("mouse") ||
				(ev instanceof MouseEvent && ev.button === 0)
			) {
				const showArrow = !ev.type.includes("mouse");
				ev.target === touchAreaLeft && loader.moveLeft(showArrow);
				ev.target === touchAreaRight && loader.moveRight(showArrow);
			}
		};
		touchAreaLeft.style.cursor =
			'url("' +
			"http://localhost/vincentsjogren.com/public/icons/arrow-left-cursor.svg" +
			'") 1 16, auto';
		touchAreaRight.style.cursor =
			'url("' +
			"http://localhost/vincentsjogren.com/public/icons/arrow-right-cursor.svg" +
			'") 17 16, auto';
	} else {
		slides[2].style.backgroundImage =
			"http://localhost/vincentsjogren.com/public/img/default.jpg";
		slides[2].style.opacity = "1";
	}
};
