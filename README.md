# 日本語 ⇄ 한국어 学習/공부 (하나의 앱, 토글로 전환)

`japanese-study-app`(한국인이 일본어를 배우는 앱)과 `korean-study-app`(일본인이 한국어를 배우는 앱)을 **하나의 프로젝트/하나의 배포**로 합친 버전입니다.
헤더 아래 "日本語 / 한국어" 토글 버튼 하나로 학습 방향을 즉시 전환합니다.

## 구조
```
src/
├── App.jsx                 최상위 - 로그인 게이트 + 언어 모드 토글(日本語 ⇄ 한국어)
├── firebase.js              공용 - Auth/Firestore (두 모드가 같은 계정 공유)
├── hooks/useSrsDeck.js       공용 - SRS 진도 관리 훅 (모드 상관없이 재사용)
├── lib/{srs,quiz,sound}.js   공용 - SM-2 알고리즘, 4지선다 로직, 효과음
├── styles/global.css         공용 디자인 시스템 (두 언어 폰트 폴백 모두 포함)
└── modes/
    ├── ja/                  일본어 학습 모드 (UI: 한국어)
    │   ├── JaStudyApp.jsx    덱전환·급수선택·학습·목록 (기존 japanese-study-app의 App.jsx 로직)
    │   ├── deckConfig.js, tts.js (ja-JP 여성 음성)
    │   ├── components/ (QuizCard, Dashboard, LevelPicker, StudySession, WordList, GrammarList, KanjiList, TravelList, BookmarkList)
    │   └── data/ (단어78·문법59·한자59·회화47, N5~N1 전체)
    └── kr/                  한국어 학습 모드 (UI: 일본어)
        ├── KrStudyApp.jsx
        ├── deckConfig.js, tts.js (ko-KR 여성 음성)
        ├── components/ (... HanjaList 등)
        └── data/ (단어100·문법15·회화16 — 단어는 1급~6급 전체, 문법/회화는 1급/2급만. 漢字語 비교 기능은 제외)
```

## 왜 이런 구조인가
- 두 모드는 콘텐츠·UI 언어·필드명이 서로 다르지만(예: 일본어 모드는 `word/reading/meaning`, 한국어 모드는 `word/pronunciation/meaningJp`), **학습 엔진(SRS/퀴즈/효과음/북마크 훅)은 완전히 동일**하므로 그 부분만 공용으로 빼고, 모드별 화면·데이터·TTS는 각자 폴더에 독립적으로 뒀습니다.
- Firestore 컬렉션은 모드별로 접두사를 붙여 분리합니다: `users/{uid}/ja_words`, `users/{uid}/kr_words` 등. 같은 Google 계정으로 로그인하면 두 모드의 학습 기록이 한 계정 아래 함께 저장되고, PC/모바일 어디서든 이어집니다.
- 헤더 타이틀(日本語学習 / 韓国語学習)과 문구는 모드에 따라 자동으로 바뀝니다.

## 1. Firebase 설정 / 2. 로컬 실행 / 3. 배포
`japanese-study-app`, `korean-study-app`과 동일합니다.
```bash
npm install
npm run dev      # 로컬 확인 (http://localhost:5173)
npm run build    # 배포용 빌드
```
`src/firebase.js`의 `firebaseConfig`에 본인 Firebase 프로젝트 값을 넣고, `firestore.rules`를 Firestore 보안 규칙에 적용하세요. (이 프로젝트 하나로 두 모드 다 커버되므로 Firebase 프로젝트는 하나만 있으면 됩니다.)

## 다음 단계
- 한국어 모드 문법/회화 3급~6급 콘텐츠 확충 (단어는 이미 1급~6급 전체 완료)
- 청해 문제, PWA/오프라인 캐싱 등은 두 모드 공용으로 추가 가능
