import React, { createContext, useState, useContext } from 'react';

const QuizContext = createContext();

export const useQuizContext = () => useContext(QuizContext);

export const QuizProvider = ({ children }) => {
  const [selectedQuiz, setSelectedQuiz] = useState("quiz 1");
  return (
    <QuizContext.Provider value={{ selectedQuiz, setSelectedQuiz }}>
      {children}
    </QuizContext.Provider>
  );
};
