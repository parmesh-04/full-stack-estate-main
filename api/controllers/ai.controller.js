import { genAI } from "../lib/gemini.js";
import prisma from "../lib/prisma.js";

export const generateDescription = async (req, res) => {
  try {
    const { fields } = req.body; // Expects an object with property details
    if (!fields) return res.status(400).json({ message: "Fields are required" });

    const prompt = `Write a very compelling, attractive, and professional real estate property description for a property with the following details: 
    ${JSON.stringify(fields)}
    Keep it engaging and highlight the main features. Maximum 2 paragraphs. Do not use asterisks or make it sound like a robot.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.status(200).json({ description: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate description" });
  }
};

export const chatBot = async (req, res) => {
  try {
    const { message, history } = req.body;
    
    if (!message) return res.status(400).json({ message: "Message is required" });

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const chat = model.startChat({
      history: history || [],
    });

    const result = await chat.sendMessage(`You are a helpful real estate assistant for the 'full-stack-estate' app. User message: ${message}`);
    const text = result.response.text();

    res.status(200).json({ reply: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to process chat" });
  }
};

export const searchRAG = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ message: "Query is required" });

        const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-2-preview" });
        const result = await embeddingModel.embedContent(query);
        const queryEmbedding = result.embedding.values;

        const posts = await prisma.post.findMany();

        const dotProduct = (a, b) => a.reduce((sum, val, i) => sum + val * b[i], 0);
        const magnitude = (v) => Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
        
        const scoredPosts = posts.map(post => {
            if (!post.embedding || post.embedding.length === 0) return { ...post, score: 0 };
            const sim = dotProduct(queryEmbedding, post.embedding) / (magnitude(queryEmbedding) * magnitude(post.embedding));
            return { ...post, score: sim };
        }).sort((a, b) => b.score - a.score).slice(0, 5); // top 5 closest properties

         res.status(200).json(scoredPosts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Search failed" });
    }
};
