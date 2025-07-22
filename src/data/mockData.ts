import { Incident, UserDetail, KnowledgeArticle } from '../contexts/DataContext';

export const mockUserDetails: UserDetail[] = [
  {
    id: '1',
    name: 'João Silva',
    tag: 'JOAO.SILVA',
    email: 'joao.silva@grancoffee.com',
    department: 'Tecnologia da Informação',
    superior: 'Carlos Souza'
  },
  {
    id: '2',
    name: 'Lucas Matias Ferreira',
    tag: 'LUCAS.FERREIRA',
    email: 'lucas.ferreira@grancoffee.com',
    department: 'Suporte Técnico',
    superior: 'Ana Costa'
  },
  {
    id: '3',
    name: 'Maria Oliveira',
    tag: 'MARIA.OLIVEIRA',
    email: 'maria.oliveira@grancoffee.com',
    department: 'Recursos Humanos',
    superior: 'Pedro Santos'
  },
  {
    id: '4',
    name: 'Carlos Souza',
    tag: 'CARLOS.SOUZA',
    email: 'carlos.souza@grancoffee.com',
    department: 'Gerência de TI',
    superior: 'Ana Costa'
  },
  {
    id: '5',
    name: 'Ana Costa',
    tag: 'ANA.COSTA',
    email: 'ana.costa@grancoffee.com',
    department: 'Diretoria Técnica',
    superior: 'N/A'
  },
  {
    id: '6',
    name: 'Pedro Santos',
    tag: 'PEDRO.SANTOS',
    email: 'pedro.santos@grancoffee.com',
    department: 'Operações',
    superior: 'Ana Costa'
  }
];

export const exampleIncidents: Incident[] = [
  {
    id: '1',
    incidentNumber: 'INC001234',
    requestedFor: 'João Silva',
    status: 'Em Andamento',
    priority: 'Alta',
    assignedGroup: 'Suporte Técnico',
    assignedTo: 'Lucas Matias Ferreira',
    description: 'Computador não está ligando após atualização do sistema. Tentei reiniciar várias vezes mas não funciona.',
    workNotes: 'Verificando fonte de alimentação e componentes internos.',
    additionalComments: 'Agendado para verificação presencial.',
    conclusion: '',
    timerDuration: 45,
    lastUpdated: '2024-01-15T10:30:00Z',
    openedBy: 'João Silva',
    type: 'Hardware',
    impact: 'Alto',
    createdAt: '2024-01-15T09:00:00Z'
  },
  {
    id: '2',
    incidentNumber: 'INC001235',
    requestedFor: 'João Silva',
    status: 'Pendente',
    priority: 'Média',
    assignedGroup: 'Suporte Técnico',
    assignedTo: 'Não Atribuído',
    description: 'Impressora da sala não está funcionando. Fica mostrando erro de papel mesmo com papel.',
    workNotes: '',
    additionalComments: '',
    conclusion: '',
    timerDuration: 0,
    lastUpdated: '2024-01-15T14:20:00Z',
    openedBy: 'João Silva',
    type: 'Impressora',
    impact: 'Médio',
    createdAt: '2024-01-15T14:20:00Z'
  },
  {
    id: '3',
    incidentNumber: 'INC001236',
    requestedFor: 'Maria Oliveira',
    status: 'Resolvido',
    priority: 'Baixa',
    assignedGroup: 'Suporte Técnico',
    assignedTo: 'Lucas Matias Ferreira',
    description: 'Não consigo acessar a pasta compartilhada do servidor.',
    workNotes: 'Resetado permissões de acesso.',
    additionalComments: 'Problema resolvido. Acesso liberado.',
    conclusion: 'Permissões de rede reconfiguradas com sucesso.',
    timerDuration: 25,
    lastUpdated: '2024-01-14T16:45:00Z',
    openedBy: 'Maria Oliveira',
    type: 'Acesso',
    impact: 'Baixo',
    createdAt: '2024-01-14T15:30:00Z'
  },
  {
    id: '4',
    incidentNumber: 'INC001237',
    requestedFor: 'Carlos Souza',
    status: 'Pendente',
    priority: 'Crítica',
    assignedGroup: 'Suporte Técnico',
    assignedTo: 'Não Atribuído',
    description: 'Sistema de vendas está completamente fora do ar. Não conseguimos processar nenhuma venda.',
    workNotes: '',
    additionalComments: '',
    conclusion: '',
    timerDuration: 0,
    lastUpdated: '2024-01-15T15:00:00Z',
    openedBy: 'Carlos Souza',
    type: 'Software',
    impact: 'Crítico',
    createdAt: '2024-01-15T15:00:00Z'
  },
  {
    id: '5',
    incidentNumber: 'INC001238',
    requestedFor: 'Ana Costa',
    status: 'Aguardando Solicitante',
    priority: 'Média',
    assignedGroup: 'Suporte Técnico',
    assignedTo: 'Lucas Matias Ferreira',
    description: 'Email não está enviando mensagens. Recebo erro de conexão.',
    workNotes: 'Solicitado teste de conexão com servidor SMTP.',
    additionalComments: 'Aguardando retorno do usuário com detalhes do erro.',
    conclusion: '',
    timerDuration: 15,
    lastUpdated: '2024-01-15T11:20:00Z',
    openedBy: 'Ana Costa',
    type: 'Software',
    impact: 'Médio',
    createdAt: '2024-01-15T10:45:00Z'
  },
  {
    id: '6',
    incidentNumber: 'INC001239',
    requestedFor: 'Pedro Santos',
    status: 'Pendente',
    priority: 'Baixa',
    assignedGroup: 'Suporte Técnico',
    assignedTo: 'Não Atribuído',
    description: 'Computador está muito lento para abrir programas.',
    workNotes: '',
    additionalComments: '',
    conclusion: '',
    timerDuration: 0,
    lastUpdated: '2024-01-15T13:15:00Z',
    openedBy: 'Pedro Santos',
    type: 'Hardware',
    impact: 'Baixo',
    createdAt: '2024-01-15T13:15:00Z'
  }
];

export const knowledgeBaseArticles: KnowledgeArticle[] = [
  {
    id: '1',
    title: 'Como resolver problemas de computador que não liga',
    content: 'Passos para diagnosticar e resolver problemas de computador que não liga:\n\n1. Verifique se o cabo de energia está conectado corretamente\n2. Teste a tomada com outro equipamento\n3. Verifique se o botão de energia está funcionando\n4. Remova e reinstale a bateria (notebooks)\n5. Teste com outro cabo de energia\n6. Se o problema persistir, entre em contato com o suporte técnico.',
    keywords: ['computador não liga', 'pc não liga', 'notebook não liga', 'não inicializa', 'não liga'],
    category: 'Hardware'
  },
  {
    id: '2',
    title: 'Soluções para problemas de conexão de rede',
    content: 'Passos para resolver problemas de conexão de rede:\n\n1. Verifique se o cabo de rede está conectado\n2. Reinicie o roteador e o modem\n3. Execute o diagnóstico de rede do Windows\n4. Verifique as configurações de IP\n5. Atualize os drivers de rede\n6. Entre em contato com o suporte se o problema persistir.',
    keywords: ['sem rede', 'sem internet', 'conexão', 'rede', 'wifi', 'cabo de rede'],
    category: 'Rede'
  },
  {
    id: '3',
    title: 'Como limpar cache e cookies do navegador',
    content: 'Passos para limpar cache e cookies:\n\n1. Abra o navegador\n2. Pressione Ctrl+Shift+Delete\n3. Selecione o período de tempo\n4. Marque "Cookies" e "Cache"\n5. Clique em "Limpar dados"\n6. Reinicie o navegador',
    keywords: ['limpar cache', 'cookies', 'navegador lento', 'cache', 'limpar dados'],
    category: 'Software'
  },
  {
    id: '4',
    title: 'Resolver problemas de impressora',
    content: 'Soluções para problemas comuns de impressora:\n\n1. Verifique se há papel e tinta/toner\n2. Verifique se a impressora está ligada\n3. Reinicie a impressora\n4. Verifique a conexão USB ou rede\n5. Atualize os drivers da impressora\n6. Execute o diagnóstico de impressora do Windows',
    keywords: ['impressora não funciona', 'impressora', 'não imprime', 'erro de papel', 'driver impressora'],
    category: 'Impressora'
  },
  {
    id: '5',
    title: 'Como resolver software travando',
    content: 'Passos para resolver problemas de software travando:\n\n1. Force o fechamento do programa (Ctrl+Alt+Delete)\n2. Reinicie o computador\n3. Verifique se há atualizações disponíveis\n4. Execute o programa como administrador\n5. Desinstale e reinstale o programa\n6. Verifique se há conflitos com outros programas',
    keywords: ['software travando', 'programa trava', 'aplicativo não responde', 'erro no software'],
    category: 'Software'
  },
  {
    id: '6',
    title: 'Resolver problemas de acesso negado',
    content: 'Soluções para problemas de acesso negado:\n\n1. Verifique suas credenciais de login\n2. Execute o programa como administrador\n3. Verifique as permissões de arquivo/pasta\n4. Reinicie o computador\n5. Entre em contato com o administrador do sistema\n6. Verifique se sua conta não foi bloqueada',
    keywords: ['acesso negado', 'permissão', 'não consegue acessar', 'login', 'senha'],
    category: 'Acesso'
  },
  {
    id: '7',
    title: 'Como resolver lentidão no sistema',
    content: 'Passos para resolver lentidão no sistema:\n\n1. Reinicie o computador\n2. Verifique o uso da CPU e memória\n3. Desative programas desnecessários na inicialização\n4. Execute limpeza de disco\n5. Verifique por vírus e malware\n6. Atualize drivers e sistema operacional',
    keywords: ['lentidão no sistema', 'computador lento', 'sistema lento', 'performance'],
    category: 'Performance'
  },
  {
    id: '8',
    title: 'Resolver problemas de email',
    content: 'Soluções para problemas de email:\n\n1. Verifique sua conexão com a internet\n2. Confirme as configurações do servidor\n3. Verifique se a senha está correta\n4. Teste com outro cliente de email\n5. Verifique se o servidor não está em manutenção\n6. Entre em contato com o suporte de TI',
    keywords: ['email não envia', 'email', 'não recebe email', 'servidor smtp', 'correio eletrônico'],
    category: 'Email'
  }
];