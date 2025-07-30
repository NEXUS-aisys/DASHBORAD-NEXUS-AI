import {
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js';
import {
  Mic,
  MicOff,
    Send,
    Settings
} from 'lucide-react';
import Papa from 'papaparse'; // For CSV parsing
import { useEffect, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { callChatAPIWithProviders } from '../services/aiService';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// API Configuration - Multiple provider support
const API_ENDPOINT = 'https://inference.samaira.ai/openai/chat/completions';
const API_KEYS = {
  samaira: 'YOUR_SAMAIRA_API_KEY',
  google: 'YOUR_GOOGLE_API_KEY',
};

// Helper function to fetch stock data (placeholder for real API)
const fetchStockData = async (ticker) => {
  // Replace with a real API call to a financial data provider
  return {
    dates: ['2025-07-01', '2025-07-02', '2025-07-03', '2025-07-04'],
    prices: [100, 102, 101, 105],
  };
};

// Chart Component with proper configuration
const StockChart = ({ stockData }) => {
  const data = {
    labels: stockData.dates,
    datasets: [
      {
        label: 'Stock Price',
        data: stockData.prices,
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        fill: false,
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Stock Price Chart',
      },
    },
    scales: {
      x: {
        type: 'category',
        display: true,
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        type: 'linear',
        display: true,
        title: {
          display: true,
          text: 'Price',
        },
      },
    },
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
};

// Enhanced AI Chat Interface with advanced features
const AIChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [stockData, setStockData] = useState({
    dates: ['2025-07-01', '2025-07-02', '2025-07-03', '2025-07-04'],
    prices: [100, 102, 101, 105],
  });
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load initial stock data
  useEffect(() => {
    const loadStockData = async () => {
      try {
        const data = await fetchStockData('AAPL');
        setStockData(data);
      } catch (error) {
        console.error('Failed to load stock data:', error);
      }
    };
    loadStockData();
  }, []);

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await callChatAPIWithProviders([userMessage], 'gpt-4', 'samaira');
      const aiResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: response,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (apiError) {
      setError('Failed to get AI response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const content = reader.result;
      const parsedData = Papa.parse(content, { header: true });
      // Process the parsed data (e.g., analyze user portfolio)
      console.log(parsedData.data);
    };

    reader.readAsText(file);
  };

  // Start recording
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = async () => {
      const audioBlob = new Blob(chunks, { type: 'audio/wav' });
      // Here you would typically send the audio to a speech-to-text service
      const transcribedText = "Voice input detected - please type your message for now."; // Placeholder
      setInputMessage(transcribedText);
    };

    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  return (
    <div className="p-6 h-screen flex flex-col bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-heading text-[var(--text-primary)]">AI Trading Assistant</h1>
        <button onClick={() => console.log('Settings clicked')} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          <Settings className="w-6 h-6" />
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-[var(--error)] text-white rounded-lg mb-4">{error}</div>
      )}

      {/* Chat Container */}
      <div className="flex-1 professional-card flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : ''}`}>
              <div className={`p-4 rounded-lg ${message.type === 'user' ? 'bg-[var(--accent-primary)] text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'}`}>
                <p>{message.content}</p>
                <p className="text-xs text-[var(--text-muted)]">{message.timestamp}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-[var(--border-primary)]">
          <div className="flex space-x-3">
            <button onClick={isRecording ? stopRecording : startRecording} className={`p-2 rounded ${isRecording ? 'bg-[var(--error)] text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <input type="file" onChange={handleFileUpload} className="hidden" id="file-upload" />
            <label htmlFor="file-upload" className="p-2 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer rounded">Upload File</label>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 border border-[var(--border-primary)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)]"
            />
            <button onClick={handleSendMessage} disabled={isLoading} className="p-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-[var(--accent-secondary)] disabled:opacity-50">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stock Chart - Example Usage */}
      <div className="mt-6">
        <h2 className="text-subheading text-[var(--text-primary)] mb-4">Stock Chart</h2>
        <div className="professional-card">
          <StockChart stockData={stockData} />
        </div>
      </div>
    </div>
  );
};

export default AIChat;
