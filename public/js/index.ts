import {ApiRequest} from "./modules/apirequest.js";
import {BgLoader} from "./modules/bgloader.js";
import {shuffleArray} from "./modules/functions.js";
const carousel = document.querySelector(".image-carousel"),
	pageWrapper = document.querySelector("#page-wrapper") as HTMLDivElement,
	touchAreaLeft = document.querySelector(
		".touch-area.left"
	) as HTMLDivElement,
	touchAreaRight = document.querySelector(
		".touch-area.right"
	) as HTMLDivElement,
	slideTransitionLength = 300;
const baseURL = "http://localhost/vincentsjogren_photo";
//const baseURL = "https://vincentsjogren.com";
const apiRequestUrl = baseURL + "/api";
const arrowCursors = {
	left: baseURL + "/public/icons/arrow-left-cursor.svg",
	right: baseURL + "/public/icons/arrow-right-cursor.svg",
};
//const apiRequestUrl = "https://vincentsjogren.com/api";

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
	const slider = document.createElement("div");
	slider.className = "slider";
	const slides = [];
	for (let i = 0; i < 5; i++) {
		const slide = document.createElement("div");
		slide.className = "slide";
		slider.appendChild(slide);
		slides.push(slide);
	}
	carousel.appendChild(slider);
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
			'url("' + arrowCursors.left + '") 1 16, pointer';
		touchAreaRight.style.cursor =
			'url("' + arrowCursors.right + '") 17 16, pointer';
	} else {
		slides[2].style.backgroundImage = baseURL + "/public/img/default.jpg";
		slides[2].style.opacity = "1";
	}
};
