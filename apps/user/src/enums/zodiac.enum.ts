export const ZODIAC: { [key: string]: string } = {
  Rabbit: 'Rabbit',
  Tiger: 'Tiger',
  Ox: 'Ox',
  Rat: 'Rat',
  Pig: 'Pig',
  Dog: 'Dog',
  Rooster: 'Rooster',
  Monkey: 'Monkey',
  Goat: 'Goat',
  Horse: 'Horse',
  Snake: 'Snake',
  Dragon: 'Dragon',
};

export const zodiacList: string[] = [
  ZODIAC.Boar,
  ZODIAC.Rat,
  ZODIAC.Ox,
  ZODIAC.Tiger,
  ZODIAC.Rabbit,
  ZODIAC.Dragon,
  ZODIAC.Snake,
  ZODIAC.Horse,
  ZODIAC.Goat,
  ZODIAC.Monkey,
  ZODIAC.Rooster,
  ZODIAC.Dog,
];

type ObjectValues<T> = T[keyof T];

export type Zodiac = ObjectValues<typeof ZODIAC>;
