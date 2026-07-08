import { useMemo, useState } from 'react';
import { useSrsDeck } from '../../hooks/useSrsDeck';
import vocabMaster from './data/vocab-sample.json';
import grammarMaster from './data/grammar-sample.json';
import travelMaster from './data/travel-sample.json';
import Dashboard from './components/Dashboard';
import StudySession from './components/StudySession';
import LevelPicker from './components/LevelPicker';
import WordList from './components/WordList';
import GrammarList from './components/GrammarList';
import TravelList from './components/TravelList';
import BookmarkList from './components/BookmarkList';

const DECK_LABELS = { words: '単語', grammar: '文法', travel: '会話' };
const LIST_COMPONENTS = { words: WordList, grammar: GrammarList, travel: TravelList };

export default function KrStudyApp({ user }) {
  const [deckType, setDeckType] = useState('words'); // words | grammar | travel | review
  const [selectedLevel, setSelectedLevel] = useState(null); // 1급~6급
  const [tab, setTab] = useState('dashboard'); // dashboard | study | list

  const wordDeck = useSrsDeck(user, 'kr_words', vocabMaster);
  const grammarDeck = useSrsDeck(user, 'kr_grammar', grammarMaster);
  const travelDeck = useSrsDeck(user, 'kr_travel', travelMaster);
  const decks = { words: wordDeck, grammar: grammarDeck, travel: travelDeck };

  const anyLoading = wordDeck.loading || grammarDeck.loading || travelDeck.loading;

  const bookmarkedItems = useMemo(
    () => [
      ...wordDeck.bookmarkedItems,
      ...grammarDeck.bookmarkedItems,
      ...travelDeck.bookmarkedItems,
    ],
    [wordDeck.bookmarkedItems, grammarDeck.bookmarkedItems, travelDeck.bookmarkedItems]
  );

  const isReview = deckType === 'review';
  const activeDeck = isReview ? null : decks[deckType];

  const unscopedItems = isReview ? bookmarkedItems : activeDeck.items;
  const needsLevelPick = !selectedLevel && unscopedItems.length > 0;

  const scopedItems = useMemo(() => {
    if (!selectedLevel) return unscopedItems;
    return unscopedItems.filter((i) => i.level === selectedLevel);
  }, [unscopedItems, selectedLevel]);

  const scopedDueItems = useMemo(() => {
    if (isReview) return scopedItems;
    return scopedItems.filter((i) => i.due);
  }, [isReview, scopedItems]);

  const scopedStats = useMemo(
    () => ({
      total: scopedItems.length,
      due: scopedDueItems.length,
      mastered: scopedItems.filter((i) => i.status === 'mastered').length,
    }),
    [scopedItems, scopedDueItems]
  );

  const levelCounts = useMemo(() => {
    const counts = {};
    unscopedItems.forEach((i) => {
      counts[i.level] = (counts[i.level] || 0) + 1;
    });
    return counts;
  }, [unscopedItems]);

  function switchDeck(next) {
    setDeckType(next);
    setSelectedLevel(null);
    setTab('dashboard');
  }

  function handleSubmitReview(itemId, quality, sourceDeck) {
    decks[sourceDeck]?.submitReview(itemId, quality);
  }

  function handleToggleBookmark(item, nextValue) {
    decks[item.sourceDeck]?.toggleBookmark(item.id, nextValue);
  }

  const ListComponent = isReview ? BookmarkList : LIST_COMPONENTS[deckType];

  return (
    <>
      <div className="deck-switch">
        {Object.entries(DECK_LABELS).map(([key, label]) => (
          <button key={key} className={deckType === key ? 'active' : ''} onClick={() => switchDeck(key)}>
            {label}
          </button>
        ))}
      </div>

      <button className={`review-bar ${isReview ? 'active' : ''}`} onClick={() => switchDeck('review')}>
        ★ 復習ノート{bookmarkedItems.length > 0 ? ` (${bookmarkedItems.length})` : ''}
      </button>

      {anyLoading ? (
        <div className="empty-state">学習データを読み込み中...</div>
      ) : needsLevelPick ? (
        <LevelPicker
          levelCounts={levelCounts}
          onSelect={(lv) => {
            setSelectedLevel(lv);
            setTab('dashboard');
          }}
        />
      ) : (
        <>
          {selectedLevel && (
            <button className="change-level-link" onClick={() => setSelectedLevel(null)}>
              ← 級を選び直す ({selectedLevel})
            </button>
          )}

          {tab === 'dashboard' && (
            <Dashboard
              stats={scopedStats}
              onStartStudy={() => setTab('study')}
              emptyMessage={
                isReview ? (
                  <>
                    復習ノートが空です。
                    <br />
                    学習中に「☆ 復習に追加」ボタンを押してみましょう。
                  </>
                ) : undefined
              }
            />
          )}
          {tab === 'study' && (
            <StudySession
              dueItems={scopedDueItems}
              pool={scopedItems}
              submitReview={handleSubmitReview}
              onToggleBookmark={handleToggleBookmark}
              onFinish={() => setTab('dashboard')}
            />
          )}
          {tab === 'list' && (
            <ListComponent items={scopedItems} onRemove={(item) => handleToggleBookmark(item, false)} />
          )}

          <nav className="tab-bar">
            <button className={tab === 'dashboard' ? 'active' : ''} onClick={() => setTab('dashboard')}>
              ホーム
            </button>
            <button className={tab === 'study' ? 'active' : ''} onClick={() => setTab('study')}>
              学習
            </button>
            <button className={tab === 'list' ? 'active' : ''} onClick={() => setTab('list')}>
              リスト
            </button>
          </nav>
        </>
      )}
    </>
  );
}
