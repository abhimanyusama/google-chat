import express from 'express';
import http from 'http';
import axios from 'axios';
import { Server } from 'socket.io';  
import { GoogleGenerativeAI } from '@google/generative-ai'; 
import dotenv from 'dotenv';



dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const genAI = new GoogleGenerativeAI( process.env.gemini_api); 
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });


//to serve static file for the frontend
app.use(express.static('public'));



// Handle WebSocket connection and user messages
io.on('connection', (socket) => {
    console.log('A user connected');
  
    socket.on('userMessage', async (message) => {
      console.log('User message:', message);
  
      try {
        // Generate AI response from Gemini model
        const result = await model.generateContent(message);
        const aiResponse = result.response.text(); // Get the text response from the generated content
  
        // Send the AI response back to the frontend
        socket.emit('geminiResponse', aiResponse);
      } catch (error) {
        console.error('Error generating AI response:', error);
        socket.emit('geminiResponse', 'Sorry, something went wrong with the AI.');
      }
    });
  
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });


  // Start the server
const port = process.env.port;
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});