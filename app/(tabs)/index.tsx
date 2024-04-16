import Explanation from '@/components/Explanation';
import QuestionAndAnswers from '@/components/QuestionAndChoices';
import TrackerBar from '@/components/TrackerBar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Button, TouchableOpacity, SafeAreaView } from 'react-native';

export default function App() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
  const [showNext, setShowNext] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await require('@/assets/quizzes/quiz 2/questions.json');
        // setQuestions(shuffleArray(response));
        setQuestions(response);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    fetchQuestions();
  }, []);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleConfirm = () => {
    const correctAnswers = currentQuestion.correct_answer_indices;
    if (correctAnswers.includes(selectedAnswer)) {
      setIsAnswerCorrect(true);
    } else {
      setIsAnswerCorrect(false);
    }
    setShowNext(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswerCorrect(null);
      setShowNext(false);
    } else {
      console.log("Quiz completed!")
    }
  };

  if (questions.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View style={styles.container}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }
  if (showExplanation) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Explanation
          explanation={currentQuestion.explanation_html}
          setShowExplanation={setShowExplanation}
        />
      </SafeAreaView>
    )
  }
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View style={styles.container}>
        <TrackerBar
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={questions.length}
        />

        <QuestionAndAnswers
          question={currentQuestion.question}
          choices={currentQuestion.choices}
          handleAnswer={handleAnswer}
          selectedAnswer={selectedAnswer}
          isAnswerCorrect={isAnswerCorrect}
          correctChoices={currentQuestion.correct_answer_indices}
        />

        {showNext ?
          <View className="flex-row justify-between items-center w-full">
            <TouchableOpacity
              className="border-2 border-black px-2 py-4 m-2 rounded-xl bg-green-600 justify-center items-center"
              onPress={() => setShowExplanation(true)}
            >
              <Text className="text-white font-extrabold">Explanation</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="border-2 border-black px-2 py-4 m-2 rounded-xl bg-blue-800 justify-center items-center"
              disabled={selectedAnswer === null}
              onPress={handleNext}
            >
              <Text className="text-white font-extrabold">Next -></Text>
            </TouchableOpacity>
          </View>
          :
          <Button title="Confirm" onPress={handleConfirm} disabled={selectedAnswer === null} />
        }
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  }
});

