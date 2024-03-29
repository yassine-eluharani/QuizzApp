import { ScrollView, Button } from 'react-native'
import React from 'react'
import RenderHtml from 'react-native-render-html';

const Explanation = ({ explanation, setShowExplanation }) => {
  const source = {
    html: explanation,
  };
  console.log("Explanation rendered!", source)
  return (
    <ScrollView className="p-4 gap-4">
      <RenderHtml
        width={300}
        source={source}
      />
      <Button title="Close" onPress={() => setShowExplanation(false)} />
    </ScrollView>
  )
}

export default Explanation
