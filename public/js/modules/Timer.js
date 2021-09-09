export default class Timer {
    constructor(maxDataLength = 10) {
        this.data = [];
        this.maxDataLength = maxDataLength;
    }
    start() {
        this.startTime = Date.now();
    }
    stop() {
        const ms = Date.now() - this.startTime;
        this.startTime = 0;
        this.data.push(ms);
        if (this.data.length > this.maxDataLength) {
            this.data.shift();
        }
    }
    avg() {
        if (this.data.length === 0) {
            return 0;
        }
        const avg = Math.round(this.data.reduce((a, b) => a + b) / this.data.length);
        return avg;
    }
}
