type ImgInfo = {name: string; ext: string; ls: boolean; ratio: number};
type SizeInfo = {key: string; value: number};
type SizeTemplate = {
	w: number;
	h: number;
	max: number;
	min: number;
	ratio: number;
	ls: boolean;
};
type ApiResult = {
	updated_at: string;
	img_base_url: string;
	img_prefix: string;
	img_sizes: SizeInfo[];
	img_files: ImgInfo[];
};
type ApiError = {time?: string; code: string | number; message: string};
type ApiResponse = {
	result: ApiResult;
	error?: ApiError;
	status: string;
};

///// FUNCTIONS /////

export function roundFloat(num: number, precision = 1): number {
	const m = 10 ** precision;
	return Math.floor(num * m) / m;
}

export function defined(value: any | undefined): boolean {
	if (value !== undefined) {
		return true;
	}
	return false;
}

export function json_decode(str: string): [] {
	var arr: [];
	try {
		arr = JSON.parse(str);
	} catch (e) {
		arr = [];
	}
	return arr;
}

///// CLASSES //////

class ApiFetcher {
	url: string;
	headers: object;
	response: string;
	constructor(url: string, headers?: object) {
		this.url = url;
		if (defined(headers)) {
			this.headers = headers;
		}
	}
	fetchData(timeout = 0) {
		const xhr = new XMLHttpRequest();
		xhr.open("GET", this.url, true);
		if (Object.keys(this.headers).length > 0) {
			for (let key in this.headers) {
				xhr.setRequestHeader(key, this.headers[key]);
			}
		}
		const self = this;
		return new Promise((resolve, reject) => {
			xhr.onloadend = function () {
				resolve(xhr.responseText);
			};
			xhr.onerror = function () {
				reject(
					"An error occured when trying to fetch data from " +
						self.url
				);
			};
			if (timeout > 0) {
				xhr.timeout = timeout;
				xhr.ontimeout = function () {
					reject("API call to " + self.url + "timed out.");
				};
			}
			xhr.send();
		});
	}

	parseResponse(response: string): ApiResult | boolean {
		try {
			const json = JSON.parse(response) as ApiResponse;
			if (
				json.status === "OK" &&
				defined(json.result.img_base_url) &&
				defined(json.result.img_prefix) &&
				defined(json.result.img_sizes) &&
				defined(json.result.img_files) &&
				json.result.img_files.length > 0
			) {
				return json.result;
			}
			return false;
		} catch (e) {
			console.error(e);
			return false;
		}
	}

	async sendRequest(timeout: number = 0): Promise<ApiResult | boolean> {
		const res = await this.fetchData(timeout);
		if (typeof res === "string") {
			return this.parseResponse(res);
		}
		return false;
	}
}

class Timer {
	data: number[];
	startTime: number;
	maxDataLength: number;
	constructor(maxDataLength = 10) {
		this.maxDataLength = maxDataLength;
	}
	start(): void {
		this.startTime = Date.now();
	}
	stop(): void {
		const ms = Date.now() - this.startTime;
		this.startTime = 0;
		this.data.push(ms);
		if (this.data.length > this.maxDataLength) {
			this.data.shift();
		}
	}
	avg(): number {
		if (this.data.length === 0) {
			return 0;
		}
		const avg = Math.round(
			this.data.reduce((a, b) => a + b) / this.data.length
		);
		return avg;
	}
}

class BackgroundLoader {
	div: HTMLDivElement;
	currentIndex: number;
	baseUrl: string;
	imagePrefix: string;
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
		imgBaseUrl: string
	) {
		this.div = div;
		this.images = images;
		this.sizes = sizes;
		this.baseUrl = imgBaseUrl;
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
		return this.imagePrefix + img.name + size.key + "." + img.ext;
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

	setTransition(ms: number = 0, ease: string = "ease") {
		Number.isInteger(ms) && (this.transition.ms = ms);
		typeof ease === "string" &&
			ease.length > 0 &&
			(this.transition.ease = ease);
		const t = `opacity ${this.transition.ms}ms ${this.transition.ease}`;
		this.div.style.transition !== t && (this.div.style.transition = t);
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

export default async function onWindowLoad(
	bgContainer: HTMLDivElement,
	clickEventTarget: HTMLDivElement,
	defaultImgUrl: string,
	apiRequestUrl: string,
	apiHeaders?: object
) {
	const af = new ApiFetcher(apiRequestUrl, apiHeaders);
	const result = await af.sendRequest();
	if (typeof result === "boolean") {
		bgContainer.style.backgroundImage = "url(" + defaultImgUrl + ")";
		bgContainer.style.opacity = "1";
	} else {
		const loader = new BackgroundLoader(
			bgContainer,
			result.img_files,
			result.img_sizes,
			result.img_base_url
		);
		await loader.init();
		clickEventTarget.onclick = function (ev: MouseEvent) {
			if (ev.target === clickEventTarget) {
				loader.next();
			}
		};
		window.onkeydown = function (ev: KeyboardEvent) {
			if (ev.key === "ArrowRight" || ev.key === " ") {
				loader.next();
			}
			if (ev.key === "ArrowLeft") {
				loader.previous();
			}
		};
	}
}
