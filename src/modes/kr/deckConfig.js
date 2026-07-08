// 덱 종류별로 "정답(일본어 뜻)" 텍스트를 어느 필드에서 가져올지 정의
// 이 앱은 일본인이 한국어를 배우는 앱이므로, 문제는 한국어로 나오고 보기는 일본어 뜻입니다.

export const ANSWER_GETTERS = {
  words: (item) => item.meaningJp,
  grammar: (item) => item.titleJp,
  travel: (item) => item.japanese,
};
