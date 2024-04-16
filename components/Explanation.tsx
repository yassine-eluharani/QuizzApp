import React from 'react';
import { ScrollView, TouchableOpacity, Text } from 'react-native';
import RenderHtml from 'react-native-render-html';

const Explanation = ({ explanation, setShowExplanation }) => {
  const source = {
    html: `<div style="padding: 20px;">${explanation}</div>`,
  };
  return (
    <ScrollView>
      <RenderHtml
        contentWidth={300}
        source={source}
        ignoredDomTags={["button"]}
      />
      <TouchableOpacity
        className="border-2 border-black px-2 py-4 m-2 rounded-xl bg-black justify-center items-center"
        onPress={() => setShowExplanation(false)}
      >
        <Text className="text-lg text-white font-extrabold">Close</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Explanation;

