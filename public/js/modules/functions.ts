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
