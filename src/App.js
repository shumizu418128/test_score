import { useEffect, useState } from 'react';
import './App.css';

const TestScoringApp = () => {
  // デフォルトの問題構成（文法）
  const defaultGrammarStructure = {
    1: 5, 2: 5, 3: 5, 4: 7, 5: 5, 6: 5, 7: 12, 8: 5, 9: 5
  };

  // デフォルトの問題構成（読解）
  const defaultReadingStructure = {
    10: 5, 11: 9, 12: 2, 13: 3, 14: 2
  };

  // 聴解の問題構成
  const defaultListeningStructure = {
    1: 6, 2: 5, 3: 5, 4: 11, 5: 4
  };

  // 現在のタブ
  const [activeTab, setActiveTab] = useState('grammar');

  // 問題グループごとの問題数
  const [grammarStructure, setGrammarStructure] = useState(defaultGrammarStructure);
  const [readingStructure, setReadingStructure] = useState(defaultReadingStructure);
  const [listeningStructure, setListeningStructure] = useState(defaultListeningStructure);

  // 問題の並び順を管理する状態
  const [grammarOrder, setGrammarOrder] = useState(Object.keys(defaultGrammarStructure).map(Number));
  const [readingOrder, setReadingOrder] = useState(Object.keys(defaultReadingStructure).map(Number));
  const [listeningOrder, setListeningOrder] = useState(Object.keys(defaultListeningStructure).map(Number));

  // 問題グループの色を管理する状態
  const [grammarColors, setGrammarColors] = useState(() => {
    const colors = {};
    Object.keys(defaultGrammarStructure).forEach((num, index) => {
      colors[num] = getColorByIndex(index);
    });
    return colors;
  });

  const [readingColors, setReadingColors] = useState(() => {
    const colors = {};
    Object.keys(defaultReadingStructure).forEach((num, index) => {
      colors[num] = getColorByIndex(index);
    });
    return colors;
  });

  const [listeningColors, setListeningColors] = useState(() => {
    const colors = {};
    Object.keys(defaultListeningStructure).forEach((num, index) => {
      colors[num] = getColorByIndex(index);
    });
    return colors;
  });

  // インデックスに基づいて色を生成する関数
  function getColorByIndex(index) {
    const hue = (index * 137.5) % 360; // 黄金比を使用して色を分散
    return `hsl(${hue}, 50%, 90%)`; // 彩度を下げ、明度を上げて優しい色に
  }

  // 問題データの生成関数
  const generateQuestions = (structure, section = 'reading') => {
    let questions = [];
    let idCounter = 1;
    let subNumberCounter = 1;

    Object.entries(structure).forEach(([groupNumber, count]) => {
      const groupNum = parseInt(groupNumber);
      for (let i = 0; i < count; i++) {
        // デフォルトの配点を設定
        let defaultPoints = 1;
        if (section === 'listening') {
          if ([1, 3, 5].includes(groupNum)) {
            defaultPoints = 3;
          } else if (groupNum === 2) {
            defaultPoints = 2;
          }
        } else if (section === 'grammar') {
          if ([3, 6].includes(groupNum)) {
            defaultPoints = 2;
          }
        } else if (section === 'reading') {
          if (groupNum === 10) {
            defaultPoints = 2;
          } else if ([11, 12, 13].includes(groupNum)) {
            defaultPoints = 3;
          } else if (groupNum === 14) {
            defaultPoints = 4;
          }
        }

        questions.push({
          id: idCounter++,
          number: groupNum,
          subNumber: subNumberCounter++,
          correctAnswer: 1,
          userAnswer: '',
          score: 0,
          isCorrect: false,
          points: defaultPoints
        });
      }
    });

    return questions;
  };

  // 問題データの初期状態
  const [grammarQuestions, setGrammarQuestions] = useState(() => generateQuestions(defaultGrammarStructure, 'grammar'));
  const [readingQuestions, setReadingQuestions] = useState(() => generateQuestions(defaultReadingStructure, 'reading'));
  const [listeningQuestions, setListeningQuestions] = useState(() => generateQuestions(defaultListeningStructure, 'listening'));

  // 総合得点の状態
  const [totalScore, setTotalScore] = useState(0);
  const [maxPossibleScore, setMaxPossibleScore] = useState(0);
  const [grammarScore, setGrammarScore] = useState(0);
  const [grammarMaxScore, setGrammarMaxScore] = useState(0);
  const [readingScore, setReadingScore] = useState(0);
  const [readingMaxScore, setReadingMaxScore] = useState(0);
  const [listeningScore, setListeningScore] = useState(0);
  const [listeningMaxScore, setListeningMaxScore] = useState(0);
  const [showQuestionManager, setShowQuestionManager] = useState(false);

  // 回答が変更されたときの処理
  const handleAnswerChange = (id, value, section) => {
    const numValue = value === '' ? '' : parseInt(value, 10);
    const updateQuestions = (questions) => questions.map(q => {
      if (q.id === id) {
        const isCorrect = numValue === q.correctAnswer;
        return {
          ...q,
          userAnswer: numValue,
          isCorrect: isCorrect,
          score: isCorrect ? q.points : 0
        };
      }
      return q;
    });

    if (section === 'reading') {
      setReadingQuestions(updateQuestions(readingQuestions));
    } else {
      setListeningQuestions(updateQuestions(listeningQuestions));
    }
  };

  // 正解を編集する処理
  const handleCorrectAnswerChange = (id, value, section) => {
    const numValue = value === '' ? '' : parseInt(value, 10);
    const updateQuestions = (questions) => questions.map(q => {
      if (q.id === id) {
        const isCorrect = q.userAnswer === numValue;
        return {
          ...q,
          correctAnswer: numValue,
          isCorrect: isCorrect,
          score: isCorrect ? q.points : 0
        };
      }
      return q;
    });

    if (section === 'reading') {
      setReadingQuestions(updateQuestions(readingQuestions));
    } else {
      setListeningQuestions(updateQuestions(listeningQuestions));
    }
  };

  // 問題の配点が変更されたときの処理
  const handlePointsChange = (id, value, section) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    const updateQuestions = (questions) => questions.map(q => {
      if (q.id === id) {
        return {
          ...q,
          points: numValue,
          score: q.isCorrect ? numValue : 0
        };
      }
      return q;
    });

    if (section === 'reading') {
      setReadingQuestions(updateQuestions(readingQuestions));
    } else {
      setListeningQuestions(updateQuestions(listeningQuestions));
    }
  };

  // 大問の問題数変更
  const handleQuestionCountChange = (groupNumber, value, section) => {
    const numValue = Math.max(1, value === '' ? 0 : parseInt(value, 10));

    // 更新された問題構成
    const newStructure = {
      ...(section === 'reading' ? readingStructure : section === 'grammar' ? grammarStructure : listeningStructure),
      [groupNumber]: numValue
    };

    if (section === 'reading') {
      setReadingStructure(newStructure);
    } else if (section === 'grammar') {
      setGrammarStructure(newStructure);
    } else {
      setListeningStructure(newStructure);
    }

    // 問題データを再生成
    const newQuestions = generateQuestions(newStructure, section);

    // 既存の回答と正解をできるだけ保持
    const updatedQuestions = newQuestions.map(newQ => {
      const existingQ = (section === 'reading' ? readingQuestions : section === 'grammar' ? grammarQuestions : listeningQuestions).find(q =>
        q.number === newQ.number && q.subNumber === newQ.subNumber
      );

      if (existingQ) {
        return {
          ...newQ,
          correctAnswer: existingQ.correctAnswer,
          userAnswer: existingQ.userAnswer,
          isCorrect: existingQ.isCorrect,
          score: existingQ.score
        };
      }

      return newQ;
    });

    if (section === 'reading') {
      setReadingQuestions(updatedQuestions);
    } else if (section === 'grammar') {
      setGrammarQuestions(updatedQuestions);
    } else {
      setListeningQuestions(updatedQuestions);
    }
  };

  // 大問の追加
  const addQuestionGroup = (section) => {
    const nextGroupNumber = Math.max(...Object.keys(section === 'reading' ? readingStructure : section === 'grammar' ? grammarStructure : listeningStructure).map(Number)) + 1;
    const newStructure = {
      ...(section === 'reading' ? readingStructure : section === 'grammar' ? grammarStructure : listeningStructure),
      [nextGroupNumber]: 5
    };

    if (section === 'reading') {
      setReadingStructure(newStructure);
    } else if (section === 'grammar') {
      setGrammarStructure(newStructure);
    } else {
      setListeningStructure(newStructure);
    }

    if (section === 'reading') {
      setReadingColors({
        ...readingColors,
        [nextGroupNumber]: getColorByIndex(Object.keys(newStructure).length - 1)
      });
    } else if (section === 'grammar') {
      setGrammarColors({
        ...grammarColors,
        [nextGroupNumber]: getColorByIndex(Object.keys(newStructure).length - 1)
      });
    } else {
      setListeningColors({
        ...listeningColors,
        [nextGroupNumber]: getColorByIndex(Object.keys(newStructure).length - 1)
      });
    }

    if (section === 'reading') {
      setReadingOrder([...readingOrder, nextGroupNumber]);
    } else if (section === 'grammar') {
      setGrammarOrder([...grammarOrder, nextGroupNumber]);
    } else {
      setListeningOrder([...listeningOrder, nextGroupNumber]);
    }

    if (section === 'reading') {
      setReadingQuestions(generateQuestions(newStructure, 'reading'));
    } else if (section === 'grammar') {
      setGrammarQuestions(generateQuestions(newStructure, 'grammar'));
    } else {
      setListeningQuestions(generateQuestions(newStructure, 'listening'));
    }
  };

  // 大問の削除
  const removeQuestionGroup = (groupNumber, section) => {
    if (Object.keys(section === 'reading' ? readingStructure : section === 'grammar' ? grammarStructure : listeningStructure).length <= 1) {
      return;
    }

    const newStructure = { ...(section === 'reading' ? readingStructure : section === 'grammar' ? grammarStructure : listeningStructure) };
    delete newStructure[groupNumber];

    const newColors = { ...(section === 'reading' ? readingColors : section === 'grammar' ? grammarColors : listeningColors) };
    delete newColors[groupNumber];

    // questionOrderから削除する大問番号を除外
    const newOrder = (section === 'reading' ? readingOrder : section === 'grammar' ? grammarOrder : listeningOrder).filter(num => num !== groupNumber);

    if (section === 'reading') {
      setReadingStructure(newStructure);
    } else if (section === 'grammar') {
      setGrammarStructure(newStructure);
    } else {
      setListeningStructure(newStructure);
    }

    if (section === 'reading') {
      setReadingColors(newColors);
    } else if (section === 'grammar') {
      setGrammarColors(newColors);
    } else {
      setListeningColors(newColors);
    }

    if (section === 'reading') {
      setReadingOrder(newOrder);
    } else if (section === 'grammar') {
      setGrammarOrder(newOrder);
    } else {
      setListeningOrder(newOrder);
    }

    if (section === 'reading') {
      setReadingQuestions(generateQuestions(newStructure, 'reading'));
    } else if (section === 'grammar') {
      setGrammarQuestions(generateQuestions(newStructure, 'grammar'));
    } else {
      setListeningQuestions(generateQuestions(newStructure, 'listening'));
    }
  };

  // 全体のリセット
  const resetAll = () => {
    setReadingQuestions(readingQuestions.map(q => {
      return {
        ...q,
        userAnswer: '',
        score: 0,
        isCorrect: false,
        points: 1
      };
    }));
    setListeningQuestions(listeningQuestions.map(q => {
      return {
        ...q,
        userAnswer: '',
        score: 0,
        isCorrect: false,
        points: 1
      };
    }));
  };

  // デフォルト問題構成に戻す
  const resetToDefault = (section) => {
    if (section === 'reading') {
      setReadingStructure(defaultReadingStructure);
    } else {
      setListeningStructure(defaultListeningStructure);
    }
    const newColors = {};
    Object.keys(section === 'reading' ? defaultReadingStructure : defaultListeningStructure).forEach((num, index) => {
      newColors[num] = getColorByIndex(index);
    });
    if (section === 'reading') {
      setReadingColors(newColors);
    } else {
      setListeningColors(newColors);
    }
    if (section === 'reading') {
      setReadingQuestions(generateQuestions(defaultReadingStructure, 'reading'));
    } else {
      setListeningQuestions(generateQuestions(defaultListeningStructure, 'listening'));
    }
  };

  // 合計得点の計算
  useEffect(() => {
    const grammarTotal = grammarQuestions.reduce((sum, q) => sum + q.score, 0);
    const readingTotal = readingQuestions.reduce((sum, q) => sum + q.score, 0);
    const listeningTotal = listeningQuestions.reduce((sum, q) => sum + q.score, 0);
    setTotalScore(grammarTotal + readingTotal + listeningTotal);
    setGrammarScore(grammarTotal);
    setReadingScore(readingTotal);
    setListeningScore(listeningTotal);

    const grammarMax = grammarQuestions.reduce((sum, q) => sum + q.points, 0);
    const readingMax = readingQuestions.reduce((sum, q) => sum + q.points, 0);
    const listeningMax = listeningQuestions.reduce((sum, q) => sum + q.points, 0);
    setMaxPossibleScore(grammarMax + readingMax + listeningMax);
    setGrammarMaxScore(grammarMax);
    setReadingMaxScore(readingMax);
    setListeningMaxScore(listeningMax);
  }, [grammarQuestions, readingQuestions, listeningQuestions]);

  // 大問の並び替え
  const moveQuestionGroup = (fromIndex, toIndex, section) => {
    const newOrder = [...(section === 'reading' ? readingOrder : section === 'grammar' ? grammarOrder : listeningOrder)];
    const [movedItem] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedItem);
    if (section === 'reading') {
      setReadingOrder(newOrder);
    } else if (section === 'grammar') {
      setGrammarOrder(newOrder);
    } else {
      setListeningOrder(newOrder);
    }
  };

  // 問題ごとにグループ化
  const grammarGroups = grammarQuestions.reduce((groups, question) => {
    const { number } = question;
    if (!groups[number]) {
      groups[number] = [];
    }
    groups[number].push(question);
    return groups;
  }, {});

  const readingGroups = readingQuestions.reduce((groups, question) => {
    const { number } = question;
    if (!groups[number]) {
      groups[number] = [];
    }
    groups[number].push(question);
    return groups;
  }, {});

  const listeningGroups = listeningQuestions.reduce((groups, question) => {
    const { number } = question;
    if (!groups[number]) {
      groups[number] = [];
    }
    groups[number].push(question);
    return groups;
  }, {});

  // 大問ごとの合計点を計算する関数
  const calculateGroupScore = (groupNumber, section) => {
    const questions = section === 'reading' ? readingQuestions : section === 'grammar' ? grammarQuestions : listeningQuestions;
    return questions
      .filter(q => q.number === groupNumber)
      .reduce((sum, q) => sum + q.score, 0);
  };

  // 大問ごとの最大点を計算する関数
  const calculateGroupMaxScore = (groupNumber, section) => {
    const questions = section === 'reading' ? readingQuestions : section === 'grammar' ? grammarQuestions : listeningQuestions;
    return questions
      .filter(q => q.number === groupNumber)
      .reduce((sum, q) => sum + q.points, 0);
  };

  // 問題表のコンポーネント
  const QuestionTable = ({ groups, order, colors, section }) => {
    // セクションごとの開始番号を設定
    let startNumber = 1;
    if (section === 'reading') {
      startNumber = grammarQuestions.length + 1;
    } else if (section === 'listening') {
      startNumber = grammarQuestions.length + readingQuestions.length + 1;
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-2 py-2">問題</th>
              <th className="border px-2 py-2">番号</th>
              <th className="border px-2 py-2">配点</th>
              <th className="border px-2 py-2">正解</th>
              <th className="border px-2 py-2">回答</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let globalQuestionNumber = startNumber;
              return order.map((groupNumber, index) => (
                groups[groupNumber].map((question, qIndex) => {
                  const currentNumber = section === 'reading' ? globalQuestionNumber++ : (section === 'grammar' ? globalQuestionNumber++ : qIndex + 1);
                  return (
                    <tr
                      key={question.id}
                      className={question.isCorrect ? 'bg-green-100' : (question.userAnswer !== '' ? 'bg-red-100' : '')}
                    >
                      {qIndex === 0 && (
                        <td
                          className="border px-2 py-2 text-center"
                          rowSpan={groups[groupNumber].length}
                          style={{ backgroundColor: colors[groupNumber] }}
                        >
                          問題 {groupNumber}
                          <div className="text-sm mt-1">
                            {calculateGroupScore(groupNumber, section)} / {calculateGroupMaxScore(groupNumber, section)}点
                          </div>
                        </td>
                      )}
                      <td className="border px-2 py-2 text-center">{currentNumber}</td>
                      <td className="border px-2 py-2 text-center">
                        <input
                          type="number"
                          min="1"
                          max="4"
                          value={question.points}
                          onChange={(e) => handlePointsChange(question.id, e.target.value, section)}
                          className="w-16 text-center border rounded"
                        />
                      </td>
                      <td className="border px-2 py-2 text-center">
                        <input
                          type="number"
                          min="1"
                          max="4"
                          value={question.correctAnswer}
                          onChange={(e) => handleCorrectAnswerChange(question.id, e.target.value, section)}
                          className="w-10 text-center border rounded"
                        />
                      </td>
                      <td className="border px-2 py-2 text-center">
                        <input
                          type="number"
                          min="1"
                          max="4"
                          value={question.userAnswer}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value, section)}
                          className="w-10 text-center border rounded"
                        />
                      </td>
                    </tr>
                  );
                })
              ));
            })()}
          </tbody>
        </table>
      </div>
    );
  };

  // 問題管理画面のコンポーネント
  const QuestionManager = () => (
    <div className="mb-6 p-4 border border-gray-300 rounded-lg">
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-bold">{activeTab === 'reading' ? '言語知識・読解' : activeTab === 'grammar' ? '文法' : '聴解'}</h2>
      </div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">大問設定</h2>
        <button
          onClick={() => resetToDefault(activeTab === 'reading' ? 'reading' : activeTab === 'grammar' ? 'grammar' : 'listening')}
          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
        >
          デフォルトに戻す
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {(activeTab === 'reading' ? readingOrder : activeTab === 'grammar' ? grammarOrder : listeningOrder).map((groupNumber, index) => (
          <div
            key={groupNumber}
            className="flex items-center justify-between p-2 border rounded"
            style={{ backgroundColor: activeTab === 'reading' ? readingColors[groupNumber] : activeTab === 'grammar' ? grammarColors[groupNumber] : listeningColors[groupNumber] }}
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => moveQuestionGroup(index, Math.max(0, index - 1), activeTab === 'reading' ? 'reading' : activeTab === 'grammar' ? 'grammar' : 'listening')}
                disabled={index === 0}
                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm disabled:opacity-0"
              >
                ↑
              </button>
              <button
                onClick={() => moveQuestionGroup(index, Math.min((activeTab === 'reading' ? readingOrder : activeTab === 'grammar' ? grammarOrder : listeningOrder).length - 1, index + 1), activeTab === 'reading' ? 'reading' : activeTab === 'grammar' ? 'grammar' : 'listening')}
                disabled={index === (activeTab === 'reading' ? readingOrder : activeTab === 'grammar' ? grammarOrder : listeningOrder).length - 1}
                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm disabled:opacity-0"
              >
                ↓
              </button>
              <span className="font-semibold">問題 {index + 1}</span>
            </div>
            <div className="flex items-center">
              <span className="mr-1">問題数</span>
              <input
                type="number"
                min="1"
                value={activeTab === 'reading' ? readingStructure[groupNumber] : activeTab === 'grammar' ? grammarStructure[groupNumber] : listeningStructure[groupNumber]}
                onChange={(e) => handleQuestionCountChange(groupNumber, e.target.value, activeTab === 'reading' ? 'reading' : activeTab === 'grammar' ? 'grammar' : 'listening')}
                className="border border-gray-300 rounded px-2 py-1 w-16 mr-2"
              />
              <button
                onClick={() => removeQuestionGroup(groupNumber, activeTab === 'reading' ? 'reading' : activeTab === 'grammar' ? 'grammar' : 'listening')}
                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                削除
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => addQuestionGroup(activeTab === 'reading' ? 'reading' : activeTab === 'grammar' ? 'grammar' : 'listening')}
        className="mt-4 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
      >
        問題を追加
      </button>
    </div>
  );

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">テスト採点システム</h1>

      <div className="mb-6 bg-gray-100 p-4 rounded-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="font-bold">総合得点: </span>
            <span className="text-xl">{totalScore} / {maxPossibleScore}</span>
            <span className="text-sm ml-2">({Math.round((totalScore / maxPossibleScore) * 60)} / 60)</span>
          </div>
          <div>
            <span className="font-bold">文法: </span>
            <span className="text-xl">{grammarScore} / {grammarMaxScore}</span>
            <span className="text-sm ml-2">({Math.round((grammarScore / grammarMaxScore) * 60)} / 60)</span>
          </div>
          <div>
            <span className="font-bold">読解: </span>
            <span className="text-xl">{readingScore} / {readingMaxScore}</span>
            <span className="text-sm ml-2">({Math.round((readingScore / readingMaxScore) * 60)} / 60)</span>
          </div>
          <div>
            <span className="font-bold">聴解: </span>
            <span className="text-xl">{listeningScore} / {listeningMaxScore}</span>
            <span className="text-sm ml-2">({Math.round((listeningScore / listeningMaxScore) * 60)} / 60)</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => setShowQuestionManager(!showQuestionManager)}
            className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            {showQuestionManager ? '大問設定を閉じる' : '大問設定'}
          </button>

          <button
            onClick={resetAll}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            回答リセット
          </button>
        </div>
      </div>

      {showQuestionManager && <QuestionManager />}

      <div className="mb-4">
        <div className="flex border-b">
          <button
            className={`px-4 py-2 ${activeTab === 'grammar' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('grammar')}
          >
            文法
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'reading' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('reading')}
          >
            読解
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'listening' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('listening')}
          >
            聴解
          </button>
        </div>
      </div>

      {activeTab === 'grammar' ? (
        <QuestionTable
          questions={grammarQuestions}
          groups={grammarGroups}
          order={grammarOrder}
          colors={grammarColors}
          section="grammar"
        />
      ) : activeTab === 'reading' ? (
        <QuestionTable
          questions={readingQuestions}
          groups={readingGroups}
          order={readingOrder}
          colors={readingColors}
          section="reading"
        />
      ) : (
        <QuestionTable
          questions={listeningQuestions}
          groups={listeningGroups}
          order={listeningOrder}
          colors={listeningColors}
          section="listening"
        />
      )}
    </div>
  );
};

export default TestScoringApp;
