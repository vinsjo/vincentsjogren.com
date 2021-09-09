export function roundFloat(num, precision = 1) {
    const m = Math.pow(10, precision);
    return Math.floor(num * m) / m;
}
export function defined(value) {
    if (value === undefined) {
        return false;
    }
    return true;
}
export function json_decode(str) {
    var arr;
    try {
        arr = JSON.parse(str);
    }
    catch (e) {
        arr = [];
    }
    return arr;
}
