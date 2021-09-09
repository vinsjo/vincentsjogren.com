import {defined} from "./functions.js";
import type {ApiResponse, ApiResult} from "./types";

export default class ApiRequest {
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
				!defined(json.result) ||
				!defined(json.status) ||
				json.status !== "OK" ||
				typeof json.result !== "object"
			) {
				throw (
					"json.status: " +
					json.status +
					", typeof json.result = " +
					typeof json.result
				);
			}
			const result = json.result as ApiResult;
			let required = {
				updated_at: "string",
				img_base_url: "string",
				img_prefix: "string",
				img_sizes: "object",
				img_files: "object",
			};
			for (const [prop, type] of Object.entries(required)) {
				if (!defined(result[prop]) || typeof result[prop] !== type) {
					throw "invalid " + prop + " value = " + result[prop];
				}
			}
			if (
				!Array.isArray(result.img_sizes) ||
				!Array.isArray(result.img_files) ||
				result.img_sizes.length == 0 ||
				result.img_files.length == 0
			) {
				throw "invalid or empty img_sizes or img_files";
			}
			if (result.img_sizes.length == 0 || result.img_files.length == 0) {
				throw (
					"img_sizes.length = " +
					result.img_sizes.length +
					", img_files.length = " +
					result.img_files.length
				);
			}
			for (let i = 0; i < result.img_sizes.length; i++) {
				let size = result.img_sizes[i];
				if (
					typeof size !== "object" ||
					!defined(size.key) ||
					!defined(size.value) ||
					typeof size.key !== "string" ||
					typeof size.value !== "number"
				) {
					throw "invalid img_sizes[" + i + "] = " + size;
				}
			}
			for (let i = 0; i < result.img_files.length; i++) {
				let img = result.img_files[i];
				if (
					typeof img !== "object" ||
					!defined(img.name) ||
					!defined(img.ext) ||
					!defined(img.ratio) ||
					!defined(img.ls) ||
					typeof img.name !== "string" ||
					typeof img.ext !== "string" ||
					typeof img.ls !== "boolean" ||
					typeof img.ratio !== "number"
				) {
					throw "invalid img_files[" + i + "] = " + img;
				}
			}
			return result;
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
