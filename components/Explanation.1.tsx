import { ScrollView, Button, useWindowDimensions } from 'react-native';
import React from 'react';

export const Explanation = ({ explanation, setShowExplanation }) => {
  const { width } = useWindowDimensions();
  const source = {
    html: `${explanation}`
  };
  return (
    <ScrollView className="p-4 gap-4">
      {/* <RenderHtml */}
      {/*   contentWidth={width} */}
      {/*   source={source} */}
      {/* /> */}
      <Text>{explanation}</Text>
      <Button title="Close" onPress={() => setShowExplanation(false)} />
    </ScrollView>
  );
};

