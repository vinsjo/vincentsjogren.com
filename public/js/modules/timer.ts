export class Timer {
	data: number[] = [];
	startTime: number;
	maxDataLength: number;
	constructor(maxDataLength = 10) {
		this.maxDataLength = maxDataLength;
	}
	start(): void {
		this.startTime = Date.now();
	}
	reset(): void {
		this.startTime = 0;
	}
	stop(): void {
		if (this.startTime <= 0) {
			return;
		}
		const ms = Date.now() - this.startTime;
		this.reset();
		this.data.push(ms);
		if (this.data.length > this.maxDataLength) {
			this.data.shift();
		}
	}
	avg(): number {
		return this.data.length > 0
			? Math.round(this.data.reduce((a, b) => a + b) / this.data.length)
			: 0;
	}
}
