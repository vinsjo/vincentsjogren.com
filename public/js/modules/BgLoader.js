var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { roundFloat, defined } from "./functions.js";
import Timer from "./Timer.js";
export default class BgLoader {
    constructor(div, images, sizes, imgBaseUrl, imgPrefix) {
        this.options = {
            preload: false,
            stretch: 1,
            sizeLimit: 0,
            failLimit: 10,
        };
        this.transition = {
            ms: 200,
            ease: "ease",
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
        let speed = avg >= 1200
            ? 1
            : avg >= 1000
                ? 2
                : avg >= 600
                    ? 3
                    : avg >= 300
                        ? 4
                        : 5;
        let opt = this.options;
        opt.sizeLimit = speed > this.sizes.length ? this.sizes.length : speed;
        switch (speed) {
            case 0:
                opt.preload = false;
                opt.stretch = 1;
                break;
            case 1:
                opt.preload = false;
                opt.stretch = 0.75;
                break;
            case 2:
                opt.preload = false;
                opt.stretch = 0.5;
                break;
            case 3:
                opt.preload = true;
                opt.stretch = 0.25;
                break;
            case 4:
                opt.preload = true;
                opt.stretch = 0;
                break;
        }
        this.options = opt;
    }
    getSizeTemplate() {
        const s = {
            w: undefined,
            h: undefined,
            min: undefined,
            max: undefined,
            ratio: undefined,
            ls: undefined,
        };
        return s;
    }
    getScreenSize() {
        const s = this.getSizeTemplate();
        s.w = window.screen.width;
        s.h = window.screen.height;
        s.min = Math.min(s.w, s.h);
        s.max = Math.max(s.w, s.h);
        s.ls = s.w >= s.h;
        s.ratio = roundFloat(s.max / s.min, 2);
        return s;
    }
    getImgSize(img, size) {
        const s = this.getSizeTemplate();
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
                console.error("ERROR: Failed loading images, aborting execution...");
                this.images = [];
            }
        });
    }
    pause(delay) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Promise((r) => setTimeout(r, delay));
        });
    }
    loadImgUrl(url) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!defined(url) || typeof url !== "string") {
                return false;
            }
            const urlIndex = this.preloaded.indexOf(url);
            if (urlIndex >= 0) {
                return true;
            }
            this.timer.start();
            let self = this;
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    let l = self.preloaded.unshift(url);
                    if (l > 25) {
                        self.preloaded.pop();
                    }
                    self.timer.stop();
                    self.updateLoadingOptions();
                    resolve(true);
                };
                img.onerror = () => {
                    img.onerror = null;
                    if (urlIndex >= 0) {
                        self.preloaded.splice(urlIndex, 1);
                    }
                    reject("Failed loading " + url);
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
                return yield this.loadImgUrl(url);
            }
        });
    }
    testLoadingSpeed() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.images.length === 0 || this.sizes.length === 0) {
                return;
            }
            const url = this.getImgUrl(this.currentIndex, 0);
            yield this.loadImgUrl(url);
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
                let self = this;
                const ok = yield this.loadImgUrl(url);
                if (ok === true) {
                    this.failedLoading.shift();
                    self.div.style.opacity = "0";
                    yield self.pause(self.transition.ms);
                    self.div.style.backgroundImage = bg;
                    yield self.pause(self.transition.ms);
                    self.div.style.opacity = "1";
                    if (this.options.preload === true) {
                        this.preload(-1);
                        this.preload(1);
                    }
                }
                else {
                    this.unsetCurrent();
                    yield this.pause(this.transition.ms);
                    yield this.loadBackground();
                }
            }
            this.busy = false;
        });
    }
    setTransition(ms, ease) {
        if (defined(ms)) {
            Number.isInteger(ms) && (this.transition.ms = ms);
        }
        if (defined(ease)) {
            typeof ease === "string" &&
                ease.length > 0 &&
                (this.transition.ease = ease);
        }
        const t = `opacity ${this.transition.ms}ms ${this.transition.ease}`;
        this.div.style.transition = t;
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
