import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { useQuizContext } from '@/context/QuizContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const QuizPage = () => {
  const { setSelectedQuiz, selectedQuiz } = useQuizContext();

  const quizzes = [
    { name: 'Quiz 1', value: 'quiz 1' },
    { name: 'Quiz 2', value: 'quiz 2' },
    { name: 'Quiz 3', value: 'quiz 3' },
    { name: 'Quiz 4', value: 'quiz 4' },
    { name: 'Quiz 5', value: 'quiz 5' },
    { name: 'Quiz 6', value: 'quiz 6' },
    { name: 'Quiz 7', value: 'quiz 7' },
  ];

  const handleSelectQuiz = (quizName) => {
    setSelectedQuiz(quizName);
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 10 }}>
      <Text style={{ textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: 'black' }}>Select a quiz</Text>
      <View style={{ marginTop: 20, paddingHorizontal: 10 }}>
        {quizzes.map((quiz, index) => (
          <TouchableOpacity
            key={index}
            style={{
              padding: 16,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: 'black',
              backgroundColor: selectedQuiz === quiz.value ? '#3768b8' : 'transparent',
              marginBottom: 10,
            }}
            onPress={() => handleSelectQuiz(quiz.value)}
          >
            <Text style={{ color: selectedQuiz === quiz.value ? 'white' : 'black', fontWeight: 'bold' }}>{quiz.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

export default QuizPage;

