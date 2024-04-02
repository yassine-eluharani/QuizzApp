import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ProgressBar from 'react-native-progress/Bar';

const TrackerBar = ({ currentQuestionIndex, totalQuestions }) => {
  const progress = (currentQuestionIndex + 1) / totalQuestions;

  return (
    <View style={styles.tracker}>
      <Text style={styles.trackerText}>
        Question {currentQuestionIndex + 1} of {totalQuestions}
      </Text>
      <ProgressBar
        progress={progress}
        width={null}
        color="#4CAF50"
        unfilledColor="#f0f0f0"
        borderWidth={0}
        borderRadius={0}
        height={10}
        style={{ marginTop: 5 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  tracker: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  trackerText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 5,
  },
});

export default TrackerBar;
