var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ApiRequest } from "./modules/apirequest.js";
import { BgLoader } from "./modules/bgloader.js";
import { shuffleArray } from "./modules/functions.js";
const baseURL = "http://localhost/vincentsjogren_photo";
//const baseURL = "https://vincentsjogren.com";
const apiRequestUrl = baseURL + "/api";
//const apiRequestUrl = "https://vincentsjogren.com/api";
let loader;
const carousel = document.querySelector(".image-carousel");
const carouselNav = {
    left: null,
    right: null,
    handleMouseUpLeft(ev) {
        if (loader) {
            loader.moveLeft() &&
                ev.type.includes("touch") &&
                carouselNav.left &&
                showArrow(carouselNav.left);
        }
    },
    handleMouseUpRight(ev) {
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
function handleKeydown(ev) {
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
window.onload = () => __awaiter(void 0, void 0, void 0, function* () {
    carouselNav.left = document.querySelector(".carousel-navigation.left");
    carouselNav.right = document.querySelector(".carousel-navigation.right");
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
    const apiHeaders = { Accept: "application/json" }, apiReq = new ApiRequest(apiRequestUrl, apiHeaders), result = yield apiReq.sendRequest();
    if (typeof result === "object") {
        loader = new BgLoader(slider, slides, shuffleArray(result.img_files), result.img_sizes, result.img_base_url, result.img_prefix);
        loader.setDefaultSliderTransition(slideTransitionLength, "ease-in-out");
        yield loader.init();
        window.onkeydown = handleKeydown;
        carouselNav.right.ontouchend = carouselNav.handleMouseUpRight;
        carouselNav.right.onmouseup = carouselNav.handleMouseUpRight;
        carouselNav.left.ontouchend = carouselNav.handleMouseUpLeft;
        carouselNav.left.onmouseup = carouselNav.handleMouseUpLeft;
        carouselNav.left.style.cursor =
            'url("' + arrowCursors.left + '") 1 16, pointer';
        carouselNav.right.style.cursor =
            'url("' + arrowCursors.right + '") 17 16, pointer';
    }
    else {
        slides[2].style.backgroundImage = baseURL + "/public/img/default.jpg";
        slides[2].style.opacity = "1";
    }
});
