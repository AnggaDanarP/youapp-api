export const HOROSCOPE: { [key: string]: string } = {
  Aries: 'Aries',
  Taurus: 'Taurus',
  Gemini: 'Gemini',
  Cancer: 'Cancer',
  Leo: 'Leo',
  Virgo: 'Virgo',
  Libra: 'Libra',
  Scorpio: 'Scorpio',
  Sagittarius: 'Sagittarius',
  Capricorn: 'Capricorn',
  Aquarius: 'Aquarius',
  Pisces: 'Pisces',
} as const;

export const HOROSCOPE_START_DATES: { [key: string]: string } = {
  120: HOROSCOPE.Aquarius, // January 20
  219: HOROSCOPE.Pisces, // February 19
  321: HOROSCOPE.Aries, // March 21
  420: HOROSCOPE.Taurus, // April 20
  521: HOROSCOPE.Gemini, // May 21
  621: HOROSCOPE.Cancer, // June 21
  723: HOROSCOPE.Leo, // July 23
  823: HOROSCOPE.Virgo, // August 23
  923: HOROSCOPE.Libra, // September 23
  1023: HOROSCOPE.Scorpio, // October 23
  1122: HOROSCOPE.Sagittarius, // November 22
  1222: HOROSCOPE.Capricorn, // December 22
  1232: HOROSCOPE.Aquarius, // January 1 of the next year
};

type ObjectValues<T> = T[keyof T];

export type Horoscope = ObjectValues<typeof HOROSCOPE>;
