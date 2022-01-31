
/**
 * Subtracts a specified number of hours from the input date
 */
export function subtractHours(date: Date, offsetHours: number) {
    date.setHours(date.getHours() - offsetHours);
    return date;
}

/**
 * Gets the absolute time from a relative time. e.g. "10" from "10h"
 * @param relativeDate A string in the form "1d" or "10h"
 */
export function getAbsoluteTimeFromRelativeTime(relativeDate: string): Date {
    let d = new Date();

    // Get the offset (and convert to number)
    const offset = +getRelativeValue(relativeDate);
    switch (getRelativeScale(relativeDate)) {
        case "s":
            d.setSeconds(d.getSeconds() - offset);
            break;
        case "m":
            d.setMinutes(d.getMinutes() - offset);
            break;
        case "h":
            d.setHours(d.getHours() - offset);
            break;
        case "d":
            d.setHours(d.getHours() - offset * 24);
            break;
        case "w":
            d.setHours(d.getHours() - offset * 24 * 7);
            break;
    }
    return d;
}

/**
 * Gets the value from a relative date string. e.g. "10" from "10h"
 * @param relativeDate A string in the form "1d" or "10h"
 */
export function getRelativeValue(relativeDate: string): string {
    return relativeDate.substring(0, relativeDate.length-1);
}

/**
 * Gets the scale from a relative date string. e.g. "h" from "10h"
 */
export function getRelativeScale(relativeDate: string): string {
    return relativeDate.substring(relativeDate.length-1, relativeDate.length);
}