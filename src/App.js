import { useEffect, useState } from 'react';
import './App.css';

const TestScoringApp = () => {
  // デフォルトの問題構成
  const defaultQuestionStructure = {
    1: 5, 2: 5, 3: 5, 4: 7, 5: 5, 6: 5, 7: 12, 8: 5, 9: 5, 10: 5, 11: 9, 12: 2, 13: 3, 14: 2
  };

  // 問題グループごとの問題数
  const [questionStructure, setQuestionStructure] = useState(defaultQuestionStructure);

  // 問題の並び順を管理する状態
  const [questionOrder, setQuestionOrder] = useState(Object.keys(defaultQuestionStructure).map(Number));

  // 問題グループの色を管理する状態
  const [questionColors, setQuestionColors] = useState(() => {
    const colors = {};
    Object.keys(defaultQuestionStructure).forEach((num, index) => {
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
  const generateQuestions = (structure) => {
    let questions = [];
    let idCounter = 1;
    let subNumberCounter = 1;

    Object.entries(structure).forEach(([groupNumber, count]) => {
      const groupNum = parseInt(groupNumber);
      for (let i = 0; i < count; i++) {
        questions.push({
          id: idCounter++,
          number: groupNum,
          subNumber: subNumberCounter++,
          correctAnswer: 1,
          userAnswer: '',
          score: 0,
          isCorrect: false,
          points: 1
        });
      }
    });

    return questions;
  };

  // 問題データの初期状態
  const [questions, setQuestions] = useState(() => generateQuestions(defaultQuestionStructure));

  // 総合得点の状態
  const [totalScore, setTotalScore] = useState(0);
  const [maxPossibleScore, setMaxPossibleScore] = useState(0);
  const [showQuestionManager, setShowQuestionManager] = useState(false);

  // 回答が変更されたときの処理
  const handleAnswerChange = (id, value) => {
    const numValue = value === '' ? '' : parseInt(value, 10);
    setQuestions(questions.map(q => {
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
    }));
  };

  // 正解を編集する処理
  const handleCorrectAnswerChange = (id, value) => {
    const numValue = value === '' ? '' : parseInt(value, 10);
    setQuestions(questions.map(q => {
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
    }));
  };

  // 問題の配点が変更されたときの処理
  const handlePointsChange = (id, value) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    setQuestions(questions.map(q => {
      if (q.id === id) {
        return {
          ...q,
          points: numValue,
          score: q.isCorrect ? numValue : 0
        };
      }
      return q;
    }));
  };

  // 大問の問題数変更
  const handleQuestionCountChange = (groupNumber, value) => {
    const numValue = Math.max(1, value === '' ? 0 : parseInt(value, 10));

    // 更新された問題構成
    const newStructure = {
      ...questionStructure,
      [groupNumber]: numValue
    };

    setQuestionStructure(newStructure);

    // 問題データを再生成
    const newQuestions = generateQuestions(newStructure);

    // 既存の回答と正解をできるだけ保持
    const updatedQuestions = newQuestions.map(newQ => {
      const existingQ = questions.find(q =>
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

    setQuestions(updatedQuestions);
  };

  // 大問の追加
  const addQuestionGroup = () => {
    const nextGroupNumber = Math.max(...Object.keys(questionStructure).map(Number)) + 1;
    const newStructure = {
      ...questionStructure,
      [nextGroupNumber]: 5
    };

    setQuestionStructure(newStructure);
    setQuestionColors({
      ...questionColors,
      [nextGroupNumber]: getColorByIndex(Object.keys(newStructure).length - 1)
    });
    setQuestionOrder([...questionOrder, nextGroupNumber]);
    setQuestions(generateQuestions(newStructure));
  };

  // 大問の削除
  const removeQuestionGroup = (groupNumber) => {
    if (Object.keys(questionStructure).length <= 1) {
      return;
    }

    const newStructure = { ...questionStructure };
    delete newStructure[groupNumber];

    const newColors = { ...questionColors };
    delete newColors[groupNumber];

    // questionOrderから削除する大問番号を除外
    const newOrder = questionOrder.filter(num => num !== groupNumber);

    setQuestionStructure(newStructure);
    setQuestionColors(newColors);
    setQuestionOrder(newOrder);
    setQuestions(generateQuestions(newStructure));
  };

  // 全体のリセット
  const resetAll = () => {
    setQuestions(questions.map(q => {
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
  const resetToDefault = () => {
    setQuestionStructure(defaultQuestionStructure);
    const newColors = {};
    Object.keys(defaultQuestionStructure).forEach((num, index) => {
      newColors[num] = getColorByIndex(index);
    });
    setQuestionColors(newColors);
    setQuestions(generateQuestions(defaultQuestionStructure));
  };

  // 合計得点の計算
  useEffect(() => {
    const calculatedTotal = questions.reduce((sum, q) => sum + q.score, 0);
    setTotalScore(calculatedTotal);

    // 最大点を計算
    const maxScore = questions.reduce((sum, q) => sum + q.points, 0);
    setMaxPossibleScore(maxScore);
  }, [questions]);

  // 大問の並び替え
  const moveQuestionGroup = (fromIndex, toIndex) => {
    const newOrder = [...questionOrder];
    const [movedItem] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedItem);
    setQuestionOrder(newOrder);
  };

  // 問題ごとにグループ化
  const questionGroups = questions.reduce((groups, question) => {
    const { number } = question;
    if (!groups[number]) {
      groups[number] = [];
    }
    groups[number].push(question);
    return groups;
  }, {});

  // 大問ごとの合計点を計算する関数
  const calculateGroupScore = (groupNumber) => {
    return questions
      .filter(q => q.number === groupNumber)
      .reduce((sum, q) => sum + q.score, 0);
  };

  // 大問ごとの最大点を計算する関数
  const calculateGroupMaxScore = (groupNumber) => {
    return questions
      .filter(q => q.number === groupNumber)
      .reduce((sum, q) => sum + q.points, 0);
  };

  // 問題管理画面のコンポーネント
  const QuestionManager = () => (
    <div className="mb-6 p-4 border border-gray-300 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">問題構成の管理</h2>
        <button
          onClick={resetToDefault}
          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
        >
          デフォルトに戻す
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {questionOrder.map((groupNumber, index) => (
          <div
            key={groupNumber}
            className="flex items-center justify-between p-2 border rounded"
            style={{ backgroundColor: questionColors[groupNumber] }}
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => moveQuestionGroup(index, Math.max(0, index - 1))}
                disabled={index === 0}
                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm disabled:opacity-0"
              >
                ↑
              </button>
              <button
                onClick={() => moveQuestionGroup(index, Math.min(questionOrder.length - 1, index + 1))}
                disabled={index === questionOrder.length - 1}
                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm disabled:opacity-0"
              >
                ↓
              </button>
              <span className="font-semibold">問題 {index + 1}</span>
            </div>
            <div className="flex items-center">
              <input
                type="number"
                min="1"
                value={questionStructure[groupNumber]}
                onChange={(e) => handleQuestionCountChange(groupNumber, e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 w-16 mr-2"
              />
              <button
                onClick={() => removeQuestionGroup(groupNumber)}
                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                削除
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addQuestionGroup}
        className="mt-4 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
      >
        大問を追加
      </button>
    </div>
  );

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">テスト採点システム</h1>

      <div className="mb-6 bg-gray-100 p-4 rounded-lg flex flex-wrap items-center justify-between">
        <div>
          <span className="font-bold">合計得点: </span>
          <span className="text-xl">{totalScore} / {maxPossibleScore}</span>
        </div>

        <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
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
              let globalQuestionNumber = 1;
              return questionOrder.map((groupNumber, index) => (
                questionGroups[groupNumber].map((question, qIndex) => {
                  const currentNumber = globalQuestionNumber++;
                  return (
                    <tr
                      key={question.id}
                      className={question.isCorrect ? 'bg-green-100' : (question.userAnswer !== '' ? 'bg-red-100' : '')}
                    >
                      {qIndex === 0 && (
                        <td
                          className="border px-2 py-2 text-center"
                          rowSpan={questionGroups[groupNumber].length}
                          style={{ backgroundColor: questionColors[groupNumber] }}
                        >
                          問題 {index + 1}
                          <div className="text-sm mt-1">
                            {calculateGroupScore(groupNumber)} / {calculateGroupMaxScore(groupNumber)}点
                          </div>
                        </td>
                      )}
                      <td className="border px-2 py-2 text-center">{currentNumber}</td>
                      <td className="border px-2 py-2 text-center">
                        <input
                          type="number"
                          min="1"
                          value={question.points}
                          onChange={(e) => handlePointsChange(question.id, e.target.value)}
                          className="w-16 text-center border rounded"
                        />
                      </td>
                      <td className="border px-2 py-2 text-center">
                        <input
                          type="number"
                          min="1"
                          max="4"
                          value={question.correctAnswer}
                          onChange={(e) => handleCorrectAnswerChange(question.id, e.target.value)}
                          className="w-10 text-center border rounded"
                        />
                      </td>
                      <td className="border px-2 py-2 text-center">
                        <input
                          type="number"
                          min="1"
                          max="4"
                          value={question.userAnswer}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
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
    </div>
  );
};

export default TestScoringApp;
