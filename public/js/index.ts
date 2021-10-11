import {ApiRequest} from "./modules/apirequest.js";
import {BgLoader} from "./modules/bgloader.js";
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
	apiRequestUrl = "http://localhost/vincentsjogren.com/api",
	slideTransitionLength = 300;

window.oncontextmenu = (ev: MouseEvent) => {
	if (!ev.type.includes("mouse") || ev.button === 0) {
		ev.preventDefault();
		ev.stopPropagation();
		return false;
	}
};

function showArrow(arrowContainer: HTMLDivElement) {
	arrowContainer.classList.add("show");
	setTimeout(() => {
		arrowContainer.classList.remove("show");
	}, slideTransitionLength);
}

window.onload = async () => {
	const apiHeaders = {Accept: "application/json"},
		apiReq = new ApiRequest(apiRequestUrl, apiHeaders),
		result = await apiReq.sendRequest();
	if (typeof result === "object") {
		const loader = new BgLoader(
			slider,
			slides,
			shuffleArray(result.img_files),
			result.img_sizes,
			result.img_base_url,
			result.img_prefix
		);
		loader.setDefaultSliderTransition(slideTransitionLength, "ease-in-out");
		await loader.init();
		window.onkeydown = (ev: KeyboardEvent) => {
			ev.key === "ArrowLeft" &&
				loader.moveLeft() &&
				showArrow(touchAreaLeft);
			ev.key === "ArrowRight" &&
				loader.moveRight() &&
				showArrow(touchAreaRight);
		};
		touchAreaRight.ontouchend = touchAreaRight.onmouseup = (
			ev: MouseEvent | TouchEvent
		) => {
			loader.moveRight() &&
				ev.type.includes("touch") &&
				showArrow(touchAreaRight);
		};
		touchAreaLeft.ontouchend = touchAreaLeft.onmouseup = (
			ev: MouseEvent | TouchEvent
		) => {
			loader.moveLeft() &&
				ev.type.includes("touch") &&
				showArrow(touchAreaLeft);
		};
		touchAreaLeft.style.cursor =
			'url("' +
			"http://localhost/vincentsjogren.com/public/icons/arrow-left-cursor.svg" +
			'") 1 16, pointer';
		touchAreaRight.style.cursor =
			'url("' +
			"http://localhost/vincentsjogren.com/public/icons/arrow-right-cursor.svg" +
			'") 17 16, pointer';
	} else {
		slides[2].style.backgroundImage =
			"http://localhost/vincentsjogren.com/public/img/default.jpg";
		slides[2].style.opacity = "1";
	}
};
