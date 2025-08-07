app.post("/api/chatbot", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a friendly and expert career mentor AI assistant named Caryo. You help users with resumes, LinkedIn, interview prep, job search tips, and how to use the Caryo platform." },
        { role: "user", content: message },
      ],
    });

    res.json({ reply: response.data.choices[0].message.content });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "AI mentor failed to respond." });
  }
});
