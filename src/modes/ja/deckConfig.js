// 덱 종류별로 "정답" 텍스트를 어느 필드에서 가져올지 정의

export const ANSWER_GETTERS = {
  words: (item) => item.meaning,
  grammar: (item) => item.title,
  kanji: (item) => item.meaning,
  travel: (item) => item.korean,
};
