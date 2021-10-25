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
const carousel = document.querySelector(".image-carousel"), pageWrapper = document.querySelector("#page-wrapper"), touchAreaLeft = document.querySelector(".touch-area.left"), touchAreaRight = document.querySelector(".touch-area.right"), slideTransitionLength = 300;
const baseURL = "http://localhost/vincentsjogren_photo";
//const baseURL = "https://vincentsjogren.com";
const apiRequestUrl = baseURL + "/api";
const arrowCursors = {
    left: baseURL + "/public/icons/arrow-left-cursor.svg",
    right: baseURL + "/public/icons/arrow-right-cursor.svg",
};
//const apiRequestUrl = "https://vincentsjogren.com/api";
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
        const loader = new BgLoader(slider, slides, shuffleArray(result.img_files), result.img_sizes, result.img_base_url, result.img_prefix);
        loader.setDefaultSliderTransition(slideTransitionLength, "ease-in-out");
        yield loader.init();
        window.onkeydown = (ev) => {
            ev.key === "ArrowLeft" &&
                loader.moveLeft() &&
                showArrow(touchAreaLeft);
            ev.key === "ArrowRight" &&
                loader.moveRight() &&
                showArrow(touchAreaRight);
        };
        touchAreaRight.ontouchend = touchAreaRight.onmouseup = (ev) => {
            loader.moveRight() &&
                ev.type.includes("touch") &&
                showArrow(touchAreaRight);
        };
        touchAreaLeft.ontouchend = touchAreaLeft.onmouseup = (ev) => {
            loader.moveLeft() &&
                ev.type.includes("touch") &&
                showArrow(touchAreaLeft);
        };
        touchAreaLeft.style.cursor =
            'url("' + arrowCursors.left + '") 1 16, pointer';
        touchAreaRight.style.cursor =
            'url("' + arrowCursors.right + '") 17 16, pointer';
    }
    else {
        slides[2].style.backgroundImage = baseURL + "/public/img/default.jpg";
        slides[2].style.opacity = "1";
    }
});
