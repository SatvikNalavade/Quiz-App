// Require necessary packages
const express = require('express');
const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config()

// Set up Express app
const app = express();
const port = process.env.PORT || 3000;

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Add CORS headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Parse JSON request body
app.use(express.json());

app.post('/generate', async (req, res) => {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  const topic = req.body.topic || '';
  if (topic.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid topic",
      }
    });
    return;
  }

  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generatePrompt(topic),
      max_tokens: 300,
      temperature: 0.4,
    });
    res.status(200).json({ result: completion.data.choices[0].text });
console.log(topic)
console.log(completion.data.choices[0].text)
  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

function generatePrompt(topic) {
  const capitalizedTopic =
    topic[0].toUpperCase() + topic.slice(1).toLowerCase();
  return `Create a 5 question quiz on a Topic with specified Difficulty.

Topic: Sports
Difficulty:Easy
Quiz:

1. In which sport does a shuttlecock fly back and forth over a net?
A) Volleyball
B) Badminton
C) Tennis
D) Basketball
Answer: B) Badminton

2. What is the maximum number of players allowed on a basketball court at the same time?
A) 5
B) 6
C) 7
D) 8
Answer: A) 5

3. Which of the following is not a type of stroke used in swimming?
A) Butterfly
B) Backstroke
C) Forehand
D) Breaststroke
Answer: C) Forehand

4. In which sport would you use a shuttlecock?
A) Tennis
B) Badminton
C) Baseball
D) Soccer
Answer: B) Badminton

5. How many players are there in a standard soccer team?
A) 11
B) 12
C) 10
D) 9
Answer: A) 11

Topic: ${capitalizedTopic}
Difficulty:Extremely Hard
Quiz:

`;
}
