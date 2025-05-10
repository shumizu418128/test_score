import { useState, useEffect } from 'react';

const TestScoringApp = () => {
  // デフォルトの問題構成
  const defaultQuestionStructure = {
    1: 5, 2: 5, 3: 5, 4: 7, 5: 5, 6: 5, 7: 12, 8: 5, 9: 5, 10: 5, 11: 9, 12: 2, 13: 3, 14: 2
  };

  // 問題グループごとの問題数
  const [questionStructure, setQuestionStructure] = useState(defaultQuestionStructure);

  // 問題グループごとの配点
  const [groupPoints, setGroupPoints] = useState(() => {
    // 初期値として全ての大問に配点1を設定
    const points = {};
    Object.keys(defaultQuestionStructure).forEach(groupNum => {
      points[groupNum] = 1;
    });
    return points;
  });

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
          correctAnswer: 1, // デフォルトの正解
          userAnswer: '',
          score: 0,
          isCorrect: false
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
  const [showSettings, setShowSettings] = useState(false);
  const [editingCorrectAnswers, setEditingCorrectAnswers] = useState(false);
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
          score: isCorrect ? groupPoints[q.number] : 0
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
          score: isCorrect ? groupPoints[q.number] : 0
        };
      }
      return q;
    }));
  };

  // 問題グループの配点が変更されたときの処理
  const handleGroupPointsChange = (groupNumber, value) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);

    // 特定の問題グループの配点を更新
    setGroupPoints({
      ...groupPoints,
      [groupNumber]: numValue
    });

    // 配点が変わったら得点も再計算
    setQuestions(questions.map(q => {
      if (q.number === parseInt(groupNumber)) {
        return {
          ...q,
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
    // 次の大問番号を決定
    const nextGroupNumber = Math.max(...Object.keys(questionStructure).map(Number)) + 1;

    // 問題構成を更新
    const newStructure = {
      ...questionStructure,
      [nextGroupNumber]: 5 // デフォルトで5問
    };

    setQuestionStructure(newStructure);

    // 配点も更新
    setGroupPoints({
      ...groupPoints,
      [nextGroupNumber]: 1 // デフォルト配点1
    });

    // 問題データを再生成
    setQuestions(generateQuestions(newStructure));
  };

  // 大問の削除
  const removeQuestionGroup = (groupNumber) => {
    // 少なくとも1つの大問は残す
    if (Object.keys(questionStructure).length <= 1) {
      return;
    }

    // 問題構成からこの大問を削除
    const newStructure = { ...questionStructure };
    delete newStructure[groupNumber];

    // 配点からも削除
    const newGroupPoints = { ...groupPoints };
    delete newGroupPoints[groupNumber];

    setQuestionStructure(newStructure);
    setGroupPoints(newGroupPoints);

    // 問題データを再生成
    setQuestions(generateQuestions(newStructure));
  };

  // 全体のリセット
  const resetAll = () => {
    setQuestions(questions.map(q => {
      return {
        ...q,
        userAnswer: '',
        score: 0,
        isCorrect: false
      };
    }));
  };

  // デフォルト問題構成に戻す
  const resetToDefault = () => {
    setQuestionStructure(defaultQuestionStructure);

    // 配点もデフォルトに戻す
    const defaultPoints = {};
    Object.keys(defaultQuestionStructure).forEach(groupNum => {
      defaultPoints[groupNum] = 1;
    });
    setGroupPoints(defaultPoints);

    // 問題データを再生成
    setQuestions(generateQuestions(defaultQuestionStructure));
  };

  // 合計得点の計算
  useEffect(() => {
    const calculatedTotal = questions.reduce((sum, q) => sum + q.score, 0);
    setTotalScore(calculatedTotal);

    // 問題グループごとに最大点を計算
    const maxScore = questions.reduce((sum, q) => {
      // 各問題の配点をそのグループの配点から取得
      return sum + groupPoints[q.number];
    }, 0);

    setMaxPossibleScore(maxScore);
  }, [questions, groupPoints]);

  // 問題ごとにグループ化
  const questionGroups = questions.reduce((groups, question) => {
    const { number } = question;
    if (!groups[number]) {
      groups[number] = [];
    }
    groups[number].push(question);
    return groups;
  }, {});

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.entries(questionStructure).map(([groupNumber, count]) => (
          <div key={groupNumber} className="flex items-center justify-between p-2 border rounded">
            <span className="font-semibold">問題 {groupNumber}</span>
            <div className="flex items-center">
              <input
                type="number"
                min="1"
                value={count}
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
            onClick={() => setShowSettings(!showSettings)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {showSettings ? '設定を閉じる' : '配点設定'}
          </button>

          <button
            onClick={() => setShowQuestionManager(!showQuestionManager)}
            className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            {showQuestionManager ? '問題管理を閉じる' : '問題管理'}
          </button>

          <button
            onClick={resetAll}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            回答リセット
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="mb-6 p-4 border border-gray-300 rounded-lg">
          <h2 className="text-lg font-bold mb-2">配点設定</h2>

          <div className="mb-4">
            <h3 className="text-md font-semibold mb-2">問題ごとの配点:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {Object.keys(groupPoints).sort((a, b) => parseInt(a) - parseInt(b)).map(groupNumber => (
                <div key={groupNumber} className="flex items-center">
                  <label className="mr-2">問題{groupNumber}:</label>
                  <input
                    type="number"
                    min="1"
                    value={groupPoints[groupNumber]}
                    onChange={(e) => handleGroupPointsChange(groupNumber, e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 w-16"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <button
              onClick={() => setEditingCorrectAnswers(!editingCorrectAnswers)}
              className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              {editingCorrectAnswers ? '正解編集を終了' : '正解を編集'}
            </button>
          </div>
        </div>
      )}

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
            {Object.keys(questionGroups).sort((a, b) => parseInt(a) - parseInt(b)).map(groupNumber => (
              questionGroups[groupNumber].map((question, index) => (
                <tr
                  key={question.id}
                  className={question.isCorrect ? 'bg-green-100' : (question.userAnswer !== '' ? 'bg-red-100' : '')}
                >
                  {index === 0 && (
                    <td
                      className="border px-2 py-2 text-center"
                      rowSpan={questionGroups[groupNumber].length}
                    >
                      問題 {groupNumber}
                    </td>
                  )}
                  <td className="border px-2 py-2 text-center">{question.subNumber}</td>
                  <td className="border px-2 py-2 text-center">{groupPoints[question.number]}</td>
                  <td className="border px-2 py-2 text-center">
                    {editingCorrectAnswers ? (
                      <input
                        type="number"
                        min="1"
                        max="4"
                        value={question.correctAnswer}
                        onChange={(e) => handleCorrectAnswerChange(question.id, e.target.value)}
                        className="w-10 text-center border rounded"
                      />
                    ) : question.correctAnswer}
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
              ))
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TestScoringApp;
