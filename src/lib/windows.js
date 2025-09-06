export type Settings = { wake_time?: string; sleep_time?: string };


const toMin = (hhmm: string) => {
const [h, m] = hhmm.split(':').map(Number);
return h * 60 + m;
};
const fromMin = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const clamp = (v: number) => ((v % (24 * 60)) + 24 * 60) % (24 * 60);


export function windowFor(type: 'breakfast'|'lunch'|'dinner'|'evening', s: Settings) {
const wake = toMin(s.wake_time ?? '07:30');
const sleep = toMin(s.sleep_time ?? '22:30');
if (type === 'breakfast') return [wake + 30, wake + 120].map(clamp).map(fromMin);
if (type === 'lunch') return ['11:30','14:00'] as const;
if (type === 'dinner') return ['18:30','21:00'] as const;
return [fromMin(clamp(sleep - 90)), fromMin(clamp(sleep - 20))] as const;
}


export function isNowWithinWindow(type: 'breakfast'|'lunch'|'dinner'|'evening', s: Settings, now = new Date()) {
const [start, end] = windowFor(type, s);
const cur = now.getHours()*60 + now.getMinutes();
const sMin = toMin(start as string), eMin = toMin(end as string);
return cur >= sMin && cur <= eMin;
}