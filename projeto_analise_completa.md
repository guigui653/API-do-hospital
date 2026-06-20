# 🏥 Análise Profunda da Arquitetura e do Projeto — AppCuidar+

Esta é uma análise técnica do ecossistema **AppCuidar+ (Hospital Cuidar+)**, detalhando sua estrutura de componentes, tecnologias principais, ciclo de vida de dados em tempo real e a recente configuração de rede local implementada.

---

## 🛠️ Arquitetura do Sistema e Componentes

O projeto segue um design modular distribuído composto por 3 aplicações distintas, que se comunicam via APIs HTTP REST e WebSockets.

```text
ProjetoFinal_2 /
├── README.md               # README mestre na raiz do workspace
└── ProjetoFinal_2 / HOSP_10_05_2026 / hospital_app /
    ├── api /               # API Backend (Spring Boot, Java 21, JPA, PostgreSQL)
    ├── Cuidar_Plus_v2 /    # App Mobile do Paciente (React Native, Expo, MVVM)
    └── cuidar-plus-desktop # Painel da Equipe de Saúde (React, Vite, WebSocket)
```

---

## 💻 Módulos em Detalhes

### 1. API Backend (`/api`)
Uma aplicação baseada em **Java 21** e **Spring Boot 4.x**, utilizando persistência relacional e arquitetura de mensagens pub/sub.

* **Banco de Dados (PostgreSQL)**: Mapeamento de tabelas por meio do Spring Data JPA. As entidades incluem:
  * `Paciente`: Dados do paciente internado (CPF, Leito, Nome, Acompanhante).
  * `Usuario`: Profissionais de saúde e credenciais para autenticação.
  * `Chamado`: Registro da solicitação, prioridade, status (*ABERTO*, *EM_ATENDIMENTO*, *CONCLUIDO*), notas de avaliação e descrições técnicas.
  * `Leito`, `Quarto`, `Internacao`, `Triagem`: Dados do domínio hospitalar.
* **Segurança (Spring Security & JWT)**:
  * Controle de autenticação stateless.
  * Senhas hasheadas com BCrypt.
  * Emissão de token JWT via biblioteca Auth0 (`java-jwt`) para requisições autenticadas móveis e desktop.
* **Comunicação em Tempo Real**:
  * Utiliza o **Spring WebSocket** configurando um broker de mensagens simples e suporte ao protocolo **STOMP**.
  * `NotificacaoService`: Helper para o envio pub/sub.
  * Os envios WebSocket ocorrem diretamente na camada Controller após o sucesso transacional na camada Service.

### 2. Aplicativo Móvel (`/Cuidar_Plus_v2`)
Aplicativo para o paciente internado no leito, criado com **React Native (Expo SDK 54)**. Ele foi arquitetado sob o padrão **MVVM** (Model-View-ViewModel):

* **Model**: Representado pelas interfaces TypeScript (`AuthTypes.ts`, interfaces de resposta de chamados).
* **View (Screens)**: Apenas declaram componentes Visuais, gerenciamento de teclado e inputs de dados.
* **ViewModel**: Controla os fluxos assíncronos das telas e variáveis de estado locais.
* **Context (AuthContext)**: Armazena o estado global da sessão e fornece métodos de login/logout/recuperação transparentes. Utiliza o `AsyncStorage` para persistir o token JWT nativamente.
* **Services (`authService.ts`)**: Encapsula as requisições HTTP usando instâncias configuradas do Axios (`apiPublica` e `apiAutenticada` com interceptores de injeção automática de header `Authorization: Bearer <token>`).

### 3. Painel Desktop / Web (`/cuidar-plus-desktop`)
Uma aplicação web ágil criada com **React 19** e **Vite**, servindo de monitor de controle para os profissionais assistenciais.

* **Fila Dinâmica em Tempo Real**:
  * Implementada através do custom hook `useWebSocket` que se conecta ao broker do backend com **StompJS** e **SockJS**.
  * A fila de chamados pendentes se atualiza automaticamente sem requisições periódicas adicionais.
* **Gráficos de Desempenho (Dashboard)**:
  * Utiliza a biblioteca **Recharts** para ler os chamados e gerar métricas cruciais como: tempo de resposta da equipe por chamado, satisfação geral do paciente por ala e chamados por categoria de serviço.

---

## 📡 Fluxo de Comunicação e Tempo Real

A comunicação bidirecional do sistema é o coração da experiência hospitalar:

1. **Abertura do Chamado (Mobile → Backend → Desktop)**:
   * O aplicativo mobile do leito faz um `POST /api/chamados` com o token JWT.
   * A API valida, salva o chamado como `ABERTO` e envia um sinal WebSocket no canal `/topic/painel`.
   * O painel desktop, que está escutando `/topic/painel`, recebe o objeto e renderiza instantaneamente o card do chamado na fila de pendentes.

2. **Atendimento do Chamado (Desktop → Backend → Mobile)**:
   * O enfermeiro clica em "Atender". O painel faz um `PUT /api/chamados/{id}/confirmar`.
   * A API altera o status para `EM_ATENDIMENTO` e dispara um sinal WebSocket no canal privado do paciente: `/topic/paciente/{idPaciente}`.
   * O app mobile do leito escuta esse canal. Ao receber a confirmação, muda a interface de "Aguardando" para "Equipe a caminho!".

3. **Conclusão e Avaliação (Desktop → Backend → Mobile)**:
   * O enfermeiro finaliza o chamado pelo painel via `PUT /api/chamados/{id}/finalizar` descrevendo a resolução.
   * A API altera o status do chamado para `CONCLUIDO` e notifica o painel (que remove o card da lista de pendentes) e o paciente (que abre o modal de avaliação por estrelas de 1 a 5).

---

## 🔗 Detalhes da Recente Configuração de IP

Dispositivos móveis físicos ou emuladores (fora do emulador padrão de desenvolvimento local em certas configurações) precisam consumir a API através do endereço IP local da máquina servidora que roda o Spring Boot.

* **IP Local Definido**: `10.65.183.50`
* **Porta**: `8080`
* **Arquivos Configurados no App Mobile**:
  * No **[app.json](file:///c:/Users/widso/Downloads/ProjetoFinal_2/ProjetoFinal_2/HOSP_10_05_2026/hospital_app/Cuidar_Plus_v2/app.json#L31)**: A propriedade `extra.apiUrl` foi definida para `http://10.65.183.50:8080`.
  * No **[authService.ts](file:///c:/Users/widso/Downloads/ProjetoFinal_2/ProjetoFinal_2/HOSP_10_05_2026/hospital_app/Cuidar_Plus_v2/src/services/authService.ts#L24)**: A constante `API_BASE_URL` que o Axios consome foi alterada para `http://10.65.183.50:8080`.
* **Outros Módulos**: O projeto desktop (`cuidar-plus-desktop`) e as páginas web estáticas do Spring Boot mantêm conexões com `localhost:8080` ou utilizam a variável de ambiente `.env` (`VITE_API_URL`) para ambientes produtivos ou de teste web.

---

## 🏃 Como Rodar o Ecossistema

### Passo 1: Backend API (Spring Boot)
1. Certifique-se de que o **PostgreSQL** esteja rodando e tenha criado um banco chamado `cuidar_plus` (ou conforme configurado no [application.properties](file:///c:/Users/widso/Downloads/ProjetoFinal_2/ProjetoFinal_2/HOSP_10_05_2026/hospital_app/api/src/main/resources/application.properties)).
2. Execute a aplicação a partir do diretório `/api`:
   ```bash
   ./mvnw spring-boot:run
   ```

### Passo 2: Painel Desktop/Web (React/Vite)
1. Navegue até `/cuidar-plus-desktop`.
2. Instale as dependências e rode o Vite:
   ```bash
   npm install
   npm run dev
   ```
3. Acesse `http://localhost:5173`.

### Passo 3: Aplicativo Mobile (Expo)
1. Navegue até `/Cuidar_Plus_v2`.
2. Instale as dependências e inicie o Expo:
   ```bash
   npm install
   npm run start
   ```
3. Escaneie o QR Code usando o **Expo Go** em um dispositivo móvel conectado à mesma rede Wi-Fi da sua máquina (`10.65.183.50`).
