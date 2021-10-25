import {ApiRequest} from "./modules/apirequest.js";
import {BgLoader} from "./modules/bgloader.js";
import {shuffleArray} from "./modules/functions.js";

const baseURL = "http://localhost/vincentsjogren_photo";
//const baseURL = "https://vincentsjogren.com";
const apiRequestUrl = baseURL + "/api";
//const apiRequestUrl = "https://vincentsjogren.com/api";
let loader: BgLoader;
const carousel = document.querySelector(".image-carousel");
const carouselNav = {
	left: null,
	right: null,
	handleMouseUpLeft(ev: TouchEvent | MouseEvent) {
		if (loader) {
			loader.moveLeft() &&
				ev.type.includes("touch") &&
				carouselNav.left &&
				showArrow(carouselNav.left);
		}
	},
	handleMouseUpRight(ev: TouchEvent | MouseEvent) {
		if (loader) {
			loader.moveRight() &&
				ev.type.includes("touch") &&
				carouselNav.right &&
				showArrow(carouselNav.right);
		}
	},
};

const arrowCursors = {
	left: baseURL + "/public/icons/arrow-left-cursor.svg",
	right: baseURL + "/public/icons/arrow-right-cursor.svg",
};

const slideTransitionLength = 300;

function handleKeydown(ev: KeyboardEvent) {
	if (loader) {
		ev.key === "ArrowLeft" &&
			loader.moveLeft() &&
			carouselNav.left &&
			showArrow(carouselNav.left);
		ev.key === "ArrowRight" &&
			loader.moveRight() &&
			carouselNav.right &&
			showArrow(carouselNav.right);
	}
}

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
	carouselNav.left = document.querySelector(
		".carousel-navigation.left"
	) as HTMLDivElement;
	carouselNav.right = document.querySelector(
		".carousel-navigation.right"
	) as HTMLDivElement;
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
		loader = new BgLoader(
			slider,
			slides,
			shuffleArray(result.img_files),
			result.img_sizes,
			result.img_base_url,
			result.img_prefix
		);
		loader.setDefaultSliderTransition(slideTransitionLength, "ease-in-out");
		await loader.init();

		window.onkeydown = handleKeydown;

		carouselNav.right.ontouchend = carouselNav.handleMouseUpRight;
		carouselNav.right.onmouseup = carouselNav.handleMouseUpRight;

		carouselNav.left.ontouchend = carouselNav.handleMouseUpLeft;
		carouselNav.left.onmouseup = carouselNav.handleMouseUpLeft;

		carouselNav.left.style.cursor =
			'url("' + arrowCursors.left + '") 1 16, pointer';
		carouselNav.right.style.cursor =
			'url("' + arrowCursors.right + '") 17 16, pointer';
	} else {
		slides[2].style.backgroundImage = baseURL + "/public/img/default.jpg";
		slides[2].style.opacity = "1";
	}
};
