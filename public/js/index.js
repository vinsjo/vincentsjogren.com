var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import ApiRequest from "./modules/ApiRequest.js";
import BgLoader from "./modules/BgLoader.js";
const bgContainer = document.getElementById("bg-container");
const pageWrapper = document.getElementById("page-wrapper");
const apiRequestUrl = "http://localhost/vincentsjogren_api/shuffle";
window.onload = () => __awaiter(void 0, void 0, void 0, function* () {
    const apiHeaders = { Accept: "application/json" };
    const apiReq = new ApiRequest(apiRequestUrl, apiHeaders);
    const result = yield apiReq.sendRequest();
    if (typeof result === "boolean") {
        bgContainer.style.opacity = "1";
    }
    else {
        const loader = new BgLoader(bgContainer, result.img_files, result.img_sizes, result.img_base_url, result.img_prefix);
        yield loader.init();
        loader.handleClick(pageWrapper);
        window.onkeydown = (ev) => {
            loader.handleKeyDown(ev);
        };
    }
});
