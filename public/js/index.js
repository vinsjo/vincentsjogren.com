var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import ApiRequest from "./modules/apirequest.js";
import BgLoader from "./modules/bgloader.js";
import { shuffleArray } from "./modules/functions.js";
const slider = document.querySelector(".slider"), pageWrapper = document.querySelector("#page-wrapper"), touchAreaLeft = document.querySelector(".touch-area.left"), touchAreaRight = document.querySelector(".touch-area.right"), slides = Array.from(document.querySelectorAll(".slide")), apiRequestUrl = "http://localhost/vincentsjogren.com/api";
window.oncontextmenu = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    return false;
};
window.onload = () => __awaiter(void 0, void 0, void 0, function* () {
    const apiHeaders = { Accept: "application/json" };
    const apiReq = new ApiRequest(apiRequestUrl, apiHeaders);
    const result = yield apiReq.sendRequest();
    if (typeof result === "boolean") {
        slides[2].style.backgroundImage =
            "http://localhost/vincentsjogren.com/public/img/default.jpg";
        slides[2].style.opacity = "1";
    }
    else {
        const loader = new BgLoader(slider, slides, shuffleArray(result.img_files), result.img_sizes, result.img_base_url, result.img_prefix, touchAreaLeft, touchAreaRight);
        yield loader.init();
        window.onkeydown = (ev) => {
            if (ev.key === "ArrowLeft")
                loader.moveRight();
            if (ev.key === "ArrowRight")
                loader.moveLeft();
        };
        touchAreaLeft.ontouchstart = touchAreaLeft.onmousedown = () => loader.moveRight();
        touchAreaRight.ontouchstart = touchAreaRight.onmousedown = () => loader.moveLeft();
    }
});
