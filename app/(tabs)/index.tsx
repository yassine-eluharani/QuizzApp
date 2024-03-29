import Explanation from '@/components/Explanation';
import QuestionAndAnswers from '@/components/QuestionAndChoices';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Button, TouchableOpacity } from 'react-native';

export default function App() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
  const [showNext, setShowNext] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await require('@/assets/quizzes/quiz 1/questions.json');
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
    const correctAnswer = currentQuestion.correct_answer;
    if (selectedAnswer === correctAnswer) {
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
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }
  if (showExplanation) {
    return (
      <Explanation
        explanation={currentQuestion.explanation}
        setShowExplanation={setShowExplanation}
      />
    )
  }
  return (
    <View style={styles.container}>
      <QuestionAndAnswers
        question={currentQuestion.question}
        choices={currentQuestion.choices}
        handleAnswer={handleAnswer}
        selectedAnswer={selectedAnswer}
        isAnswerCorrect={isAnswerCorrect}
      />

      {showNext ?
        <>
          <TouchableOpacity onPress={handleNext} disabled={selectedAnswer === null} >
            <Text>Next</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowExplanation(true)}>
            <Text>Explanation</Text>
          </TouchableOpacity>
        </>
        :
        <Button title="Confirm" onPress={handleConfirm} disabled={selectedAnswer === null} />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

