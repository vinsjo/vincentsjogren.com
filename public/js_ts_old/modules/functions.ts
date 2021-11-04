export function roundFloat(num: number, precision = 1): number {
	const m = 10 ** precision;
	return Math.floor(num * m) / m;
}

export function defined(value: any | undefined): boolean {
	if (value === undefined) {
		return false;
	}
	return true;
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

export function pause(delay: number = 0): Promise<void> {
	return new Promise((r) => setTimeout(r, delay));
}

export function sizeTemplate() {
	return {
		w: 0,
		h: 0,
		min: 0,
		max: 0,
		ratio: 0,
		ls: false,
	};
}

export function shuffleArray(arr: Array<any>) {
	if (arr.length <= 1) return arr;
	let output = arr.concat();
	var remaining = output.length,
		tmp: any,
		i: number;
	while (remaining) {
		i = Math.floor(Math.random() * remaining--);
		tmp = output[remaining];
		output[remaining] = output[i];
		output[i] = tmp;
	}
	return output;
}
