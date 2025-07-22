import React, { useState } from 'react';
import { ArrowLeft, Search, BookOpen, Filter, Tag, Eye, Edit, Plus, Star } from 'lucide-react';
import { User as UserType } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

interface KnowledgeBasePageProps {
  onBack: () => void;
  currentUser: UserType;
}

const KnowledgeBasePage: React.FC<KnowledgeBasePageProps> = ({ onBack, currentUser }) => {
  const { knowledgeArticles } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

  const categories = Array.from(new Set(knowledgeArticles.map(article => article.category)));

  const filteredArticles = knowledgeArticles.filter(article => {
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === '' || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const selectedArticleData = selectedArticle ? 
    knowledgeArticles.find(article => article.id === selectedArticle) : null;

  if (selectedArticleData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-coffee-50 to-coffee-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="flex items-center px-3 py-2 text-gray-600 hover:text-[#38261E] hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Voltar para Lista
                </button>
                <div className="h-6 w-px bg-gray-300"></div>
                <div>
                  <h1 className="text-lg font-semibold text-coffee-950">
                    {selectedArticleData.title}
                  </h1>
                  <p className="text-sm text-gray-600">
                    Categoria: {selectedArticleData.category}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button className="flex items-center px-4 py-2 text-gray-600 hover:text-[#38261E] hover:bg-gray-100 rounded-lg transition-colors duration-200">
                  <Star className="h-4 w-4 mr-2" />
                  Favoritar
                </button>
                {currentUser.role === 'atendente' && (
                  <button className="flex items-center px-4 py-2 bg-[#51913B] text-white rounded-lg hover:bg-[#457A32] transition-colors duration-200">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {selectedArticleData.category}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-[#38261E] mb-4">
                {selectedArticleData.title}
              </h1>
            </div>

            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {selectedArticleData.content}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Palavras-chave:</h3>
              <div className="flex flex-wrap gap-2">
                {selectedArticleData.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-coffee-50 to-coffee-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center px-3 py-2 text-gray-600 hover:text-[#38261E] hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-lg font-semibold text-coffee-950">Base de Conhecimento</h1>
                <p className="text-sm text-gray-600">Biblioteca de soluções e procedimentos</p>
              </div>
            </div>

            {currentUser.role === 'atendente' && (
              <button className="flex items-center px-4 py-2 bg-[#51913B] text-white rounded-lg hover:bg-[#457A32] transition-colors duration-200">
                <Plus className="h-4 w-4 mr-2" />
                Novo Artigo
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#51913B] focus:border-transparent"
                  placeholder="Buscar artigos, soluções ou palavras-chave..."
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#51913B] focus:border-transparent"
                >
                  <option value="">Todas as Categorias</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-coffee-950">
            Artigos Disponíveis
          </h2>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
            <span className="text-sm text-gray-600">Total: </span>
            <span className="font-semibold text-[#51913B]">{filteredArticles.length}</span>
          </div>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum artigo encontrado</h3>
            <p className="text-gray-600">Tente ajustar os filtros ou termos de busca.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200"
                onClick={() => setSelectedArticle(article.id)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {article.category}
                    </span>
                    <Eye className="h-4 w-4 text-gray-400" />
                  </div>
                  
                  <h3 className="font-semibold text-coffee-950 text-lg mb-3 line-clamp-2">
                    {article.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {article.content}
                  </p>
                  
                  <div className="flex flex-wrap gap-1">
                    {article.keywords.slice(0, 3).map((keyword, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700"
                      >
                        {keyword}
                      </span>
                    ))}
                    {article.keywords.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{article.keywords.length - 3} mais
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default KnowledgeBasePage;