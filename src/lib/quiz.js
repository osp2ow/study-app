// 4지선다 보기를 만드는 유틸

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 정답 1개 + 오답(다른 항목에서 추출) (count-1)개를 섞어서 반환
 * @param {object} correctItem - 현재 문제 항목
 * @param {Array} pool - 오답 후보를 뽑을 항목 목록 (보통 같은 급수/장면)
 * @param {(item: object) => string} getAnswer - 항목에서 정답 텍스트를 추출하는 함수
 */
export function buildOptions(correctItem, pool, getAnswer, count = 4) {
  const correctText = getAnswer(correctItem);
  const distractorTexts = [
    ...new Set(
      pool
        .filter((i) => i.id !== correctItem.id)
        .map(getAnswer)
        .filter((t) => t && t !== correctText)
    ),
  ];
  const picked = shuffle(distractorTexts).slice(0, count - 1);
  return shuffle([correctText, ...picked]);
}
