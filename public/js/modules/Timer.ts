export default class Timer {
	data: number[] = [];
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
