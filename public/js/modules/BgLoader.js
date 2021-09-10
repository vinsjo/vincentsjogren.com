var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { roundFloat, defined, pause, sizeTemplate } from "./functions.js";
import Timer from "./Timer.js";
export default class BgLoader {
    constructor(div, images, sizes, imgBaseUrl, imgPrefix) {
        this.minLoadTime = 100;
        this.options = {
            preload: false,
            stretch: 1,
            sizeLimit: 0,
            failLimit: 5,
        };
        this.div = div;
        this.images = images;
        this.sizes = sizes;
        this.baseUrl = imgBaseUrl;
        this.imgPrefix = imgPrefix;
        this.currentIndex = 0;
        this.failedLoading = [];
        this.preloaded = [];
        this.busy = false;
        this.options.sizeLimit = sizes.length;
        this.timer = new Timer();
    }
    updateLoadingOptions() {
        const avg = this.timer.avg();
        let opt = this.options;
        opt.preload = avg > 300 ? false : true;
        1000 < avg
            ? ((opt.sizeLimit = 1), (opt.stretch = 0.8))
            : 800 < avg
                ? ((opt.sizeLimit = 2), (opt.stretch = 0.6))
                : 600 < avg
                    ? ((opt.sizeLimit = 3), (opt.stretch = 0.4))
                    : 300 < avg
                        ? ((opt.sizeLimit = 4), (opt.stretch = 0.2))
                        : ((opt.sizeLimit = 5), (opt.stretch = 0));
        opt.sizeLimit > this.sizes.length &&
            (opt.sizeLimit = this.sizes.length);
        this.options = opt;
    }
    getScreenSize() {
        const s = sizeTemplate();
        s.w = window.screen.width;
        s.h = window.screen.height;
        s.min = Math.min(s.w, s.h);
        s.max = Math.max(s.w, s.h);
        s.ls = s.w >= s.h;
        s.ratio = roundFloat(s.max / s.min, 2);
        return s;
    }
    getImgSize(img, size) {
        const s = sizeTemplate();
        s.max = size.value;
        s.min = Math.floor(size.value / img.ratio);
        s.ls = img.ls;
        s.ratio = img.ratio;
        if (img.ls) {
            s.w = s.max;
            s.h = s.min;
        }
        else {
            s.w = s.min;
            s.h = s.max;
        }
        return s;
    }
    getImgName(imgIndex, sizeIndex) {
        imgIndex < 0 && (imgIndex = this.images.length - 1);
        imgIndex > this.images.length - 1 && (imgIndex = 0);
        const img = this.images[imgIndex];
        const screen = this.getScreenSize();
        let size = defined(this.sizes[sizeIndex])
            ? this.sizes[sizeIndex]
            : undefined;
        let imgSize = defined(size) ? this.getImgSize(img, size) : undefined;
        if (!defined(size) || !defined(imgSize)) {
            for (let i = 0; i < this.options.sizeLimit; i++) {
                size = this.sizes[i];
                if (i < this.options.sizeLimit - 1 && screen.max > size.value) {
                    continue;
                }
                if (!defined(img.ratio) || !defined(img.ls)) {
                    break;
                }
                imgSize = this.getImgSize(img, size);
                if (i < this.options.sizeLimit - 1 &&
                    img.ls !== screen.ls &&
                    imgSize.min < screen.max &&
                    imgSize.min / screen.max < 1 - this.options.stretch) {
                    continue;
                }
                if (i < this.options.sizeLimit &&
                    img.ls === screen.ls &&
                    imgSize.min < screen.min &&
                    imgSize.min / screen.min < 1 - this.options.stretch) {
                    continue;
                }
                break;
            }
        }
        if (!defined(size.key)) {
            size = this.sizes[0];
        }
        return this.imgPrefix + img.name + size.key + "." + img.ext;
    }
    getImgUrl(imgIndex, sizeIndex) {
        const imgName = this.getImgName(imgIndex, sizeIndex);
        if (typeof imgName !== "string" || imgName.length === 0) {
            return;
        }
        return this.baseUrl + "/" + imgName;
    }
    incCurrent(inc) {
        if (this.images.length > 0) {
            let i = inc < 0 ? this.currentIndex - 1 : this.currentIndex + 1;
            i < 0 && (i = this.images.length - 1);
            i > this.images.length - 1 && (i = 0);
            this.currentIndex = i;
        }
    }
    unsetCurrent() {
        return __awaiter(this, void 0, void 0, function* () {
            this.failedLoading.push(this.images.splice(this.currentIndex, 1)[0]);
            if (this.failedLoading.length >= this.options.failLimit) {
                console.error("Failed loading images from API, aborting execution...");
                this.images = [];
            }
        });
    }
    preloadImgUrl(url) {
        return __awaiter(this, void 0, void 0, function* () {
            let self = this;
            return new Promise((resolve, reject) => {
                if (!defined(url) || typeof url !== "string") {
                    resolve(false);
                }
                const urlIndex = self.preloaded.indexOf(url);
                if (urlIndex >= 0) {
                    resolve(true);
                }
                self.timer.start();
                const img = new Image();
                img.onload = () => {
                    let l = self.preloaded.unshift(url);
                    if (l > 25) {
                        self.preloaded.pop();
                    }
                    self.updateLoadingOptions();
                    self.timer.stop();
                    resolve(true);
                };
                img.onerror = () => {
                    img.onerror = null;
                    if (urlIndex >= 0) {
                        self.preloaded.splice(urlIndex, 1);
                    }
                    self.timer.reset();
                    resolve(false);
                };
                img.src = url;
            });
        });
    }
    preload(inc = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            const index = inc < 0 ? this.currentIndex - 1 : this.currentIndex + 1;
            const url = this.getImgUrl(index);
            if (url.length > this.baseUrl.length) {
                yield this.preloadImgUrl(url);
            }
        });
    }
    testLoadingSpeed() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.images.length === 0 || this.sizes.length === 0) {
                return;
            }
            const url = this.getImgUrl(this.currentIndex, 0);
            yield this.preloadImgUrl(url);
        });
    }
    loadBackground(inc = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.images.length <= 0) {
                return;
            }
            Number.isInteger(inc) && inc !== 0 && this.incCurrent(inc);
            const url = this.getImgUrl(this.currentIndex);
            const bg = "url(" + url + ")";
            if (this.div.style.backgroundImage !== bg) {
                this.busy = true;
                this.div.style.opacity = "0";
                const ok = yield this.preloadImgUrl(url);
                const avg = this.timer.avg();
                const pauseTime = avg > this.minLoadTime ? Math.floor(avg / 2) : this.minLoadTime;
                if (ok === true) {
                    this.failedLoading.shift();
                    yield pause(pauseTime);
                    this.div.style.backgroundImage = bg;
                    yield pause(pauseTime);
                    this.div.style.opacity = "1";
                    if (this.options.preload === true) {
                        this.preload(-1);
                        this.preload(1);
                    }
                }
                else {
                    this.unsetCurrent();
                    yield this.loadBackground();
                }
                this.div.style.opacity = "1";
            }
            this.busy = false;
        });
    }
    handleClick(eventTarget) {
        const self = this;
        eventTarget.onclick = (ev) => {
            if (ev.target === eventTarget) {
                self.next();
            }
        };
    }
    handleKeyDown(ev) {
        if (ev.key === "ArrowRight" || ev.key === " ") {
            this.next();
        }
        if (ev.key === "ArrowLeft") {
            this.previous();
        }
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.images.length > 0) {
                yield this.testLoadingSpeed();
                yield this.loadBackground();
            }
        });
    }
    next() {
        if (this.images.length > 0 && !this.busy) {
            this.loadBackground(1);
        }
    }
    previous() {
        if (this.images.length > 0 && !this.busy) {
            this.loadBackground(-1);
        }
    }
}
