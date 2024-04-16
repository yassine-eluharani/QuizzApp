import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';

const QuestionAndAnswers = ({
  question,
  choices,
  handleAnswer,
  selectedAnswers,
  isAnswerCorrect,
  correctChoices,
}) => {
  const cleanedQuestion = question.trim().replace(/\s+/g, ' ').replace(/\n+/g, '');
  const cleanedChoices = choices.map(choice => choice.trim().replace(/\s+/g, ' ').replace(/\n+/g, ''));

  const getChoiceStyle = (index) => {
    if (selectedAnswers.includes(index)) {
      if (isAnswerCorrect === null) {
        return styles.selectedChoice;
      } else if (isAnswerCorrect === true || correctChoices.includes(index)) {
        return styles.correctChoice;
      } else {
        return styles.falseChoice;
      }
    } else {
      return styles.choice;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.question}>{cleanedQuestion}</Text>
        <View className="w-full gap-3 justify-center">
          {cleanedChoices.map((choice, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.choiceContainer, getChoiceStyle(index)]}
              onPress={() => handleAnswer(index)} // Pass index instead of choice
              disabled={isAnswerCorrect !== null}
            >
              <Text>{choice}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  question: {
    fontSize: 18,
    marginBottom: 20,
  },
  choiceContainer: {
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  choice: {
    borderColor: '#ccc',
  },
  selectedChoice: {
    borderColor: 'black',
  },
  correctChoice: {
    borderColor: 'green',
  },
  falseChoice: {
    borderColor: 'red',
  },
});

export default QuestionAndAnswers;

