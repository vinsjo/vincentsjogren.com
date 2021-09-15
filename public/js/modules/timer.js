export default class Timer {
    constructor(maxDataLength = 10) {
        this.data = [];
        this.maxDataLength = maxDataLength;
    }
    start() {
        this.startTime = Date.now();
    }
    reset() {
        this.startTime = 0;
    }
    stop() {
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
    avg() {
        return this.data.length > 0
            ? Math.round(this.data.reduce((a, b) => a + b) / this.data.length)
            : 0;
    }
}
