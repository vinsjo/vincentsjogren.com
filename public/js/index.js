"use strict";
import {ApiRequest} from "./modules/apirequest.js";
import {BgLoader} from "./modules/bgloader.js";
import {shuffleArray} from "./modules/functions.js";

const baseURL = "http://localhost/vincentsjogren.com";
//const baseURL = "https://vincentsjogren.com";
const apiRequestUrl = baseURL + "/api";
//const apiRequestUrl = "https://vincentsjogren.com/api";
const carousel = document.querySelector(".image-carousel");
const slider = carousel.querySelector(".slider");
const slides = slider.querySelectorAll(".slide");
const slideTransitionLength = 300;
let loader;

const carouselNav = {
	left: document.querySelector(".carousel-navigation.left"),
	right: document.querySelector(".carousel-navigation.right"),
	handleMouseUpLeft() {
		if (!loader) return;
		loader.moveLeft() && showArrow(carouselNav.left);
	},
	handleMouseUpRight() {
		if (!loader) return;
		loader.moveRight() && showArrow(carouselNav.right);
	},
};
function handleKeydown(ev) {
	if (!loader) return;
	ev.key === "ArrowLeft" &&
		loader.moveLeft() &&
		carouselNav.left &&
		showArrow(carouselNav.left);
	ev.key === "ArrowRight" &&
		loader.moveRight() &&
		carouselNav.right &&
		showArrow(carouselNav.right);
}

window.oncontextmenu = (ev) => {
	if (!ev.type.includes("mouse") || ev.button === 0) {
		ev.preventDefault();
		ev.stopPropagation();
		return false;
	}
};

function showArrow(arrowContainer) {
	arrowContainer.classList.add("show");
	setTimeout(() => {
		arrowContainer.classList.remove("show");
	}, slideTransitionLength);
}

window.onresize = () => {
	document.body.width = window.innerWidth;
	document.body.height = window.innerHeight;
	document.body.style.width = window.innerWidth.toString() + "px";
	document.body.style.height = window.innerHeight.toString() + "px";
};

window.onload = async () => {
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
		carouselNav.right.onpointerup = carouselNav.handleMouseUpRight;
		carouselNav.left.onpointerup = carouselNav.handleMouseUpLeft;
	} else {
		slides[2].style.backgroundImage = baseURL + "/public/img/default.jpg";
		slides[2].style.opacity = "1";
	}
};
