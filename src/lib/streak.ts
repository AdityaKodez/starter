const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DEFAULT_TIME_ZONE = "UTC";

type StreakInput = {
    lastActiveDate: Date | null;
    currentStreak: number;
    currentDate: Date;
    timeZone: string;
};

export const resolveTimeZone = (timeZone: string | null | undefined): string => {
    const trimmed = timeZone?.trim();
    if (!trimmed) return DEFAULT_TIME_ZONE;
    try {
        new Intl.DateTimeFormat("en-US", { timeZone: trimmed });
        return trimmed;
    } catch {
        return DEFAULT_TIME_ZONE;
    }
};

const getDateParts = (date: Date, timeZone: string) => {
    const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
    const parts = formatter.formatToParts(date);
    const year = Number(parts.find((part) => part.type === "year")?.value);
    const month = Number(parts.find((part) => part.type === "month")?.value);
    const day = Number(parts.find((part) => part.type === "day")?.value);
    return { year, month, day };
};

const diffInDays = (from: Date, to: Date, timeZone: string) => {
    const fromParts = getDateParts(from, timeZone);
    const toParts = getDateParts(to, timeZone);
    const fromUtc = Date.UTC(fromParts.year, fromParts.month - 1, fromParts.day);
    const toUtc = Date.UTC(toParts.year, toParts.month - 1, toParts.day);
    return Math.floor((toUtc - fromUtc) / MS_PER_DAY);
};

export const calculateNextStreakOnActivity = ({
    lastActiveDate,
    currentStreak,
    currentDate,
    timeZone,
}: StreakInput): number => {
    if (!lastActiveDate) return 1;
    const dayDiff = diffInDays(lastActiveDate, currentDate, timeZone);
    if (dayDiff <= 0) return currentStreak;
    if (dayDiff === 1) return currentStreak + 1;
    return 1;
};

export const calculateDisplayStreak = ({
    lastActiveDate,
    currentStreak,
    currentDate,
    timeZone,
}: StreakInput): number => {
    if (!lastActiveDate) return 0;
    const dayDiff = diffInDays(lastActiveDate, currentDate, timeZone);
    return dayDiff <= 1 ? currentStreak : 0;
};


export function getStreakEmoji(streak: number): string {
    if (streak >= 30) {
        return "🔥"; // Fire emoji for 30+ day streaks
    } else if (streak >= 7) {
        return "💪"; // Flexed biceps emoji for 7+ day streaks
    } else if (streak >= 3) {
        return "😊"; // Smiling face emoji for 3+ day streaks
    } else {
        return "🙂"; // Slightly smiling face emoji for 0-2 day streaks
    }
}
