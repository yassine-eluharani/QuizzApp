import Explanation from '@/components/Explanation';
import QuestionAndAnswers from '@/components/QuestionAndChoices';
import TrackerBar from '@/components/TrackerBar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Button, TouchableOpacity, SafeAreaView } from 'react-native';
import { useQuizContext } from '@/context/QuizContext';

export default function App() {
  const { selectedQuiz } = useQuizContext();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
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
        let filePath;
        switch (selectedQuiz) {
          case 'quiz 1':
            filePath = require('@/assets/quizzes/quiz 1/questions.json');
            break;
          case 'quiz 2':
            filePath = require('@/assets/quizzes/quiz 2/questions.json');
            break;
          // Add cases for other quizzes as needed
          default:
            throw new Error('Unknown quiz');
        }
        const response = await filePath;
        setQuestions(response);
        // setQuestions(shuffleArray(response));
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    fetchQuestions();
  }, [selectedQuiz]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (answer) => {
    if (selectedAnswers.length < currentQuestion.correct_answer_indices.length || selectedAnswers.includes(answer)) {
      setSelectedAnswers(prevAnswers => {
        if (prevAnswers.includes(answer)) {
          return prevAnswers.filter(a => a !== answer); // Deselect if already selected
        } else {
          return [...prevAnswers, answer]; // Add new answer
        }
      });
    }
  };

  const handleConfirm = () => {
    const correctAnswers = currentQuestion.correct_answer_indices;
    if (correctAnswers.includes(selectedAnswers)) {
      setIsAnswerCorrect(true);
    } else {
      setIsAnswerCorrect(false);
    }
    setShowNext(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswers([]);
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
          selectedQuiz={selectedQuiz}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={questions.length}
        />

        <QuestionAndAnswers
          question={currentQuestion.question}
          choices={currentQuestion.choices}
          handleAnswer={handleAnswer}
          selectedAnswers={selectedAnswers}
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
              disabled={selectedAnswers.length === 0}
              onPress={handleNext}
            >
              <Text className="text-white font-extrabold">Next -></Text>
            </TouchableOpacity>
          </View>
          :
          <Button title="Confirm" onPress={handleConfirm} disabled={selectedAnswers.length === 0} />
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

