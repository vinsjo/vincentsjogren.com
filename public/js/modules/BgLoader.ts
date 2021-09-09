import {roundFloat, defined} from "./functions.js";
import type {ImgInfo, SizeInfo, SizeTemplate} from "./types";
import Timer from "./Timer.js";

export default class BgLoader {
	div: HTMLDivElement;
	currentIndex: number;
	baseUrl: string;
	imgPrefix: string;
	images: ImgInfo[];
	sizes: SizeInfo[];
	failedLoading: ImgInfo[];
	preloaded: string[];
	busy: boolean;
	timer: Timer;
	options = {
		preload: false,
		stretch: 1,
		sizeLimit: 0,
		failLimit: 10,
	};
	transition = {
		ms: 200,
		ease: "ease",
	};
	constructor(
		div: HTMLDivElement,
		images: ImgInfo[],
		sizes: SizeInfo[],
		imgBaseUrl: string,
		imgPrefix: string
	) {
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
		let speed =
			avg >= 1200
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

	getImgSize(img: ImgInfo, size: SizeInfo): SizeTemplate {
		const s = this.getSizeTemplate();
		s.max = size.value;
		s.min = Math.floor(size.value / img.ratio);
		s.ls = img.ls;
		s.ratio = img.ratio;
		if (img.ls) {
			s.w = s.max;
			s.h = s.min;
		} else {
			s.w = s.min;
			s.h = s.max;
		}
		return s;
	}

	getImgName(imgIndex: number, sizeIndex?: number): string {
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
				if (
					i < this.options.sizeLimit - 1 &&
					img.ls !== screen.ls &&
					imgSize.min < screen.max &&
					imgSize.min / screen.max < 1 - this.options.stretch
				) {
					continue;
				}
				if (
					i < this.options.sizeLimit &&
					img.ls === screen.ls &&
					imgSize.min < screen.min &&
					imgSize.min / screen.min < 1 - this.options.stretch
				) {
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

	getImgUrl(imgIndex: number, sizeIndex?: number): string {
		const imgName = this.getImgName(imgIndex, sizeIndex);
		if (typeof imgName !== "string" || imgName.length === 0) {
			return;
		}
		return this.baseUrl + "/" + imgName;
	}

	incCurrent(inc: -1 | 0 | 1) {
		if (this.images.length > 0) {
			let i = inc < 0 ? this.currentIndex - 1 : this.currentIndex + 1;
			i < 0 && (i = this.images.length - 1);
			i > this.images.length - 1 && (i = 0);
			this.currentIndex = i;
		}
	}

	async unsetCurrent() {
		this.failedLoading.push(this.images.splice(this.currentIndex, 1)[0]);
		if (this.failedLoading.length >= this.options.failLimit) {
			console.error(
				"ERROR: Failed loading images, aborting execution..."
			);
			this.images = [];
		}
	}

	async pause(delay: number) {
		return await new Promise((r) => setTimeout(r, delay));
	}

	async loadImgUrl(url: string) {
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
	}

	async preload(inc = 0) {
		const index = inc < 0 ? this.currentIndex - 1 : this.currentIndex + 1;
		const url = this.getImgUrl(index);
		if (url.length > this.baseUrl.length) {
			return await this.loadImgUrl(url);
		}
	}

	async testLoadingSpeed() {
		if (this.images.length === 0 || this.sizes.length === 0) {
			return;
		}
		const url = this.getImgUrl(this.currentIndex, 0);
		await this.loadImgUrl(url);
	}

	async loadBackground(inc: -1 | 0 | 1 = 0) {
		if (this.images.length <= 0) {
			return;
		}
		Number.isInteger(inc) && inc !== 0 && this.incCurrent(inc);
		const url = this.getImgUrl(this.currentIndex);
		const bg = "url(" + url + ")";
		if (this.div.style.backgroundImage !== bg) {
			this.busy = true;
			let self = this;
			const ok = await this.loadImgUrl(url);
			if (ok === true) {
				this.failedLoading.shift();
				self.div.style.opacity = "0";
				await self.pause(self.transition.ms);
				self.div.style.backgroundImage = bg;
				await self.pause(self.transition.ms);
				self.div.style.opacity = "1";
				if (this.options.preload === true) {
					this.preload(-1);
					this.preload(1);
				}
			} else {
				this.unsetCurrent();
				await this.pause(this.transition.ms);
				await this.loadBackground();
			}
		}
		this.busy = false;
	}

	setTransition(ms?: number, ease?: string) {
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

	handleClick(eventTarget: HTMLElement) {
		const self = this;
		eventTarget.onclick = (ev: MouseEvent) => {
			if (ev.target === eventTarget) {
				self.next();
			}
		};
	}

	handleKeyDown(ev: KeyboardEvent) {
		if (ev.key === "ArrowRight" || ev.key === " ") {
			this.next();
		}
		if (ev.key === "ArrowLeft") {
			this.previous();
		}
	}

	async init() {
		if (this.images.length > 0) {
			await this.testLoadingSpeed();
			await this.loadBackground();
		}
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
