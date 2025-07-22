import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User } from 'lucide-react';
import { useData } from '../contexts/DataContext';

interface GamaAIChatProps {
  onClose: () => void;
  initialMessage: string;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const GamaAIChat: React.FC<GamaAIChatProps> = ({ onClose, initialMessage }) => {
  const { searchKnowledge } = useData();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: initialMessage,
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Search for knowledge articles
    const articles = searchKnowledge(userMessage);
    
    if (articles.length > 0) {
      const article = articles[0];
      return `Encontrei informações sobre "${article.title}":\n\n${article.content}\n\nEssa informação foi útil? Posso ajudar com algo mais?`;
    }
    
    // Fallback responses for common queries
    if (lowerMessage.includes('ajuda') || lowerMessage.includes('help')) {
      return "Estou aqui para ajudar! Posso auxiliar com problemas técnicos, orientações sobre procedimentos e buscar informações na base de conhecimento. Descreva seu problema ou dúvida.";
    }
    
    if (lowerMessage.includes('como') && lowerMessage.includes('chamado')) {
      return "Para abrir um chamado, você precisa:\n\n1. Descrever detalhadamente o problema\n2. Selecionar o tipo de problema\n3. Indicar o nível de impacto\n4. Aguardar a atribuição para um técnico\n\nPosso ajudar você a formular uma descrição mais clara do problema. Conte-me mais detalhes!";
    }
    
    if (lowerMessage.includes('problema') || lowerMessage.includes('erro')) {
      return "Entendo que você está enfrentando um problema. Para que eu possa ajudar melhor, preciso de mais informações:\n\n• Qual sistema ou equipamento está apresentando problema?\n• Quando o problema começou?\n• Quais mensagens de erro você está vendo?\n• Já tentou alguma solução?\n\nCom essas informações, posso sugerir uma solução ou ajudar a abrir um chamado adequado.";
    }
    
    // Generic response
    return "Desculpe, não encontrei informações específicas sobre sua consulta. Posso ajudar com:\n\n• Problemas de computador e software\n• Questões de rede e conectividade\n• Problemas de impressoras\n• Orientações para abertura de chamados\n\nTente ser mais específico sobre o problema que está enfrentando.";
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const aiResponse = generateAIResponse(inputMessage);
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: aiResponse,
      sender: 'ai',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="glass-card shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-aroma-600 to-aroma-700 p-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-full">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold font-poppins">GAMA AI</h3>
                <p className="text-aroma-100 text-sm">Assistente Inteligente</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-neutral-200 transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-aroma-600 text-white shadow-lg'
                    : 'glass-card text-neutral-800'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.sender === 'ai' && (
                    <Bot className="h-5 w-5 mt-0.5 text-aroma-600" />
                  )}
                  {message.sender === 'user' && (
                    <User className="h-5 w-5 mt-0.5 text-white" />
                  )}
                  <div className="flex-1">
                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-aroma-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="glass-card text-neutral-800 max-w-xs lg:max-w-md px-4 py-3 rounded-2xl">
                <div className="flex items-center space-x-2">
                  <Bot className="h-5 w-5 text-aroma-600" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-neutral-200 p-4">
          <div className="flex space-x-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="input-primary resize-none"
              rows={2}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamaAIChat;