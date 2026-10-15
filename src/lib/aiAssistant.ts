/// <reference types="dom-chromium-ai" />

import { timeline } from '../data/timeline';

export type AIAvailabilityStatus = Availability;

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  temperature?: number;
  isStreaming?: boolean;
}

export const DEFAULT_AI_TEMPERATURE = 0.1;
export const DEFAULT_AI_TOP_K = 1;

export interface PromptExecutionOptions {
  prompt: string;
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
  temperature?: number;
  topK?: number;
  onChunk?: (fullAccumulatedText: string, delta: string) => void;
  onDownloadProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

export const LM_EXPECTED_INPUTS: LanguageModelExpected[] = [{ type: 'text', languages: ['en'] }];
export const LM_EXPECTED_OUTPUTS: LanguageModelExpected[] = [{ type: 'text', languages: ['en'] }];

export const LM_CORE_OPTIONS: LanguageModelCreateCoreOptions = {
  expectedInputs: LM_EXPECTED_INPUTS,
  expectedOutputs: LM_EXPECTED_OUTPUTS,
};

/**
 * Accesses the Chrome Built-in AI LanguageModel factory if available
 */
export function getLanguageModelAPI(): typeof LanguageModel | null {
  if (typeof LanguageModel !== 'undefined') {
    return LanguageModel;
  }
  const anyGlobal =
    typeof window !== 'undefined'
      ? (window as unknown as { LanguageModel?: typeof LanguageModel })
      : typeof self !== 'undefined'
      ? (self as unknown as { LanguageModel?: typeof LanguageModel })
      : null;

  return anyGlobal?.LanguageModel || null;
}

/**
 * Probes the browser for Language Model (Prompt API / Gemini Nano) support
 */
export async function checkLanguageModelAvailability(): Promise<AIAvailabilityStatus> {
  try {
    const api = getLanguageModelAPI();
    if (!api) {
      return 'unavailable';
    }

    if (typeof api.availability === 'function') {
      const status = await api.availability(LM_CORE_OPTIONS);
      return status || 'unavailable';
    }

    return 'unavailable';
  } catch (err) {
    console.debug('Language Model availability check failed:', err);
    return 'unavailable';
  }
}

export function isLanguageModelUsable(status?: AIAvailabilityStatus | null): boolean {
  return status === 'available' || status === 'downloadable' || status === 'downloading';
}

/**
 * Compiles the timeline data into a high-density, structured factual context for Gemini Nano
 */
export function compileTimelineFacts(): string {
  const waypoints = timeline.map((item) => {
    const lines = [
      `* [${item.date}] ${item.title}${item.role ? ` — Role: ${item.role}` : ''}${
        item.company ? ` at ${item.company}` : ''
      }`,
      item.type ? `  Type: ${item.type} | Status: ${item.status || 'Active'}` : '',
      item.description ? `  Summary: ${item.description}` : '',
      item.technologies && item.technologies.length > 0
        ? `  Technologies: ${item.technologies.join(', ')}`
        : '',
      item.bullets && item.bullets.length > 0
        ? `  Highlights: ${item.bullets.join('; ')}`
        : '',
    ];
    return lines.filter(Boolean).join('\n');
  });

  return `
CANDIDATE: Vitor Ferreira
TITLE: Senior Software Engineer & Staff Frontend Engineer
LOCATION: Amsterdam, Netherlands
WEBSITE: https://www.vitorspace.com
GITHUB: https://github.com/vitorstick
LINKEDIN: https://www.linkedin.com/in/vitorsferreira/

VERIFIED CAREER TIMELINE & FACTS:
${waypoints.join('\n\n')}
`;
}

// Module-level precompiled factual context to avoid runtime recalculation
export const TIMELINE_FACTS: string = compileTimelineFacts();

/**
 * Returns dynamic system instructions tailored to the chosen temperature level
 */
export function getSystemPromptForTemperature(temperature: number): string {
  if (temperature <= 0.2) {
    return `You are Vitor Ferreira's official portfolio AI assistant. You answer questions strictly and factually based on his verified software engineering career timeline (SemmieWealth, Dialog, BiGenius, PagerDuty, Rydoo, Hovione, BNP Paribas, ANF, WeCreateYou). Keep answers concise, direct, and factual. Do not speculate or make assumptions.`;
  }
  if (temperature <= 0.6) {
    return `You are Vitor Ferreira's portfolio AI assistant. You answer questions informatively, conversationally, and thoughtfully based on his engineering career. Provide rich context, explain architectural decisions, and highlight technical synergy across his roles.`;
  }
  return `You are Vitor Ferreira's AI assistant running in High-Creativity & Speculation Mode (Temperature: ${temperature.toFixed(
    2
  )}). You are explicitly encouraged to be imaginative, extrapolate, make creative assumptions, and hypothesize! While Vitor's timeline is your foundational context, feel free to imagine what he might engineer next, explore creative software analogies, hypothesize about his engineering philosophy, and dream up bold, fun speculative scenarios—even if they go beyond the verified facts.`;
}

/**
 * Maps numeric temperature to Chrome Prompt API's web samplingMode enum
 */
export function temperatureToSamplingMode(temperature: number): LanguageModelSamplingMode {
  if (temperature <= 0.1) return 'most-predictable';
  if (temperature <= 0.3) return 'predictable';
  if (temperature <= 0.6) return 'balanced';
  if (temperature <= 0.85) return 'creative';
  return 'most-creative';
}

/**
 * Builds a grounded prompt envelope for fallback simulation or non-reusable contexts
 */
export function buildGroundedPrompt(
  query: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[] = [],
  temperature: number = DEFAULT_AI_TEMPERATURE
): string {
  let historySection = '';
  if (conversationHistory.length > 0) {
    const recent = conversationHistory.slice(-3);
    historySection = `RECENT CHAT HISTORY:\n${recent
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n')}\n\n`;
  }

  if (temperature <= 0.2) {
    return `Answer the user's question accurately, concisely, and factually using ONLY the verified timeline facts. Do NOT make up or assume any external information.\n\n${historySection}USER QUESTION: ${query}\n\nCONCISE FACTUAL ANSWER:`;
  }

  if (temperature <= 0.6) {
    return `Provide an engaging, insightful, and well-rounded answer using the timeline facts as context.\n\n${historySection}USER QUESTION: ${query}\n\nDETAILED & ENGAGING ANSWER:`;
  }

  return `Feel free to extrapolate, be imaginative, hypothesize, make assumptions, and speculate boldly about what Vitor could build and his futuristic engineering directions!\n\n${historySection}USER QUESTION: ${query}\n\nCREATIVE & SPECULATIVE ANSWER:`;
}

// ---------------------------------------------------------------------------
// Base Session Caching & Session Reuse via clone()
// ---------------------------------------------------------------------------

let cachedBaseSessionPromise: Promise<LanguageModel> | null = null;
let cachedBaseKey = '';

export async function getBaseSession(
  temperature: number = DEFAULT_AI_TEMPERATURE,
  onDownloadProgress?: (percent: number) => void,
  signal?: AbortSignal
): Promise<LanguageModel> {
  const samplingMode = temperatureToSamplingMode(temperature);
  const systemInstruction = getSystemPromptForTemperature(temperature);
  const cacheKey = `${samplingMode}|${systemInstruction}`;

  if (cachedBaseSessionPromise && cachedBaseKey === cacheKey) {
    return cachedBaseSessionPromise;
  }

  if (cachedBaseSessionPromise) {
    void cachedBaseSessionPromise.then((s) => s.destroy()).catch(() => {});
    cachedBaseSessionPromise = null;
  }

  const api = getLanguageModelAPI();
  if (!api) {
    throw new Error('Chrome Prompt API (Gemini Nano) is not supported or enabled on this browser.');
  }

  cachedBaseKey = cacheKey;

  const createOptions: LanguageModelCreateOptions = {
    expectedInputs: LM_EXPECTED_INPUTS,
    expectedOutputs: LM_EXPECTED_OUTPUTS,
    samplingMode,
    signal,
    initialPrompts: [
      {
        role: 'system',
        content: `${systemInstruction}\n\n${TIMELINE_FACTS}`,
      },
    ],
    monitor: (monitor: CreateMonitor) => {
      monitor.addEventListener('downloadprogress', (e: ProgressEvent) => {
        const pct =
          e.loaded <= 1
            ? Math.round(e.loaded * 100)
            : e.total && e.total > 0
            ? Math.min(100, Math.round((e.loaded / e.total) * 100))
            : Math.round(e.loaded);
        onDownloadProgress?.(Math.min(100, Math.max(1, pct)));
      });
    },
  };

  cachedBaseSessionPromise = api.create(createOptions);
  cachedBaseSessionPromise.catch(() => {
    cachedBaseSessionPromise = null;
    cachedBaseKey = '';
  });

  return cachedBaseSessionPromise;
}

export async function prewarmAssistant(temperature: number = DEFAULT_AI_TEMPERATURE): Promise<void> {
  try {
    const status = await checkLanguageModelAvailability();
    if (status === 'available') {
      void getBaseSession(temperature).catch(() => {});
    }
  } catch {
    // Ignore pre-warming errors
  }
}

let activeChatSession: LanguageModel | null = null;
let activeChatTemperature: number = DEFAULT_AI_TEMPERATURE;

export async function getActiveChatSession(
  temperature: number = DEFAULT_AI_TEMPERATURE,
  onDownloadProgress?: (percent: number) => void,
  signal?: AbortSignal
): Promise<LanguageModel> {
  if (activeChatSession && activeChatTemperature === temperature) {
    return activeChatSession;
  }

  resetChatSession();

  const base = await getBaseSession(temperature, onDownloadProgress, signal);
  activeChatSession = await base.clone({ signal });
  activeChatTemperature = temperature;

  activeChatSession.addEventListener('contextoverflow', () => {
    console.warn('LanguageModel context window exceeded. Initial conversation turns were trimmed.');
  });

  return activeChatSession;
}

export function resetChatSession(): void {
  if (activeChatSession) {
    try {
      activeChatSession.destroy();
    } catch {
      // Ignore destroy error
    }
    activeChatSession = null;
  }
}

export function destroyAllSessions(): void {
  resetChatSession();
  if (cachedBaseSessionPromise) {
    void cachedBaseSessionPromise.then((s) => s.destroy()).catch(() => {});
    cachedBaseSessionPromise = null;
    cachedBaseKey = '';
  }
}

async function consumeStream(
  stream: ReadableStream<string>,
  onChunk?: (fullAccumulatedText: string, latestDelta: string) => void,
  signal?: AbortSignal
): Promise<string> {
  let accumulated = '';
  for await (const chunk of stream) {
    if (signal?.aborted) {
      throw signal.reason || new DOMException('Prompt execution aborted.', 'AbortError');
    }
    accumulated += chunk;
    onChunk?.(accumulated, chunk);
  }
  return accumulated;
}

/**
 * Executes a question prompt against Chrome's on-device Gemini Nano model
 */
export async function askTimelineAssistant({
  prompt,
  conversationHistory = [],
  temperature = DEFAULT_AI_TEMPERATURE,
  onChunk,
  onDownloadProgress,
  signal,
}: PromptExecutionOptions): Promise<string> {
  const session = await getActiveChatSession(temperature, onDownloadProgress, signal);

  if (signal?.aborted) {
    throw signal.reason || new DOMException('Prompt execution aborted.', 'AbortError');
  }

  // If conversation history is provided from before session clone, ground query with recent context
  const fullPrompt =
    conversationHistory.length > 0
      ? buildGroundedPrompt(prompt, conversationHistory, temperature)
      : prompt;

  let streamResult: ReadableStream<string>;
  try {
    streamResult = session.promptStreaming(fullPrompt, { signal });
  } catch (err) {
    if (signal?.aborted) {
      throw signal.reason || new DOMException('Prompt execution aborted.', 'AbortError');
    }
    console.warn('promptStreaming threw error, falling back to prompt():', err);
    const result = await session.prompt(fullPrompt, { signal });
    onChunk?.(result, result);
    return result;
  }

  try {
    return await consumeStream(streamResult, onChunk, signal);
  } catch (streamErr) {
    if (signal?.aborted || (streamErr instanceof DOMException && streamErr.name === 'AbortError')) {
      throw streamErr;
    }
    console.warn('Streaming failed, falling back to direct prompt():', streamErr);
    const result = await session.prompt(fullPrompt, { signal });
    onChunk?.(result, result);
    return result;
  }
}

/**
 * Generates an intelligent simulation fallback answer when Chrome Local AI is not available,
 * dynamically adjusting detail, creativity, and speculative assumptions based on temperature.
 */
export function generateSimulatedAnswer(
  query: string,
  temperature: number = DEFAULT_AI_TEMPERATURE
): string {
  const q = query.toLowerCase();
  let baseAnswer: string;

  if (q.includes('current') || q.includes('now') || q.includes('semmie')) {
    baseAnswer = `**Current Role (Oct 2025 – Present):**
Vitor is currently a **Senior Frontend Developer at SemmieWealth** in Amsterdam, Netherlands.

**Key Contributions:**
- Developing and enhancing the IEX Golden Bull-winning **Semmie App** (iOS, Android, and web) using **Ionic & Angular**.
- Architecting features within a modular **Nx monorepo** with **NgRx** state management.
- Integrating cloud services on **Azure & AWS**, unit testing with **Jest**, and leveraging **AI-assisted workflows (GitHub Copilot)**.`;
  } else if (q.includes('mobile') || q.includes('ios') || q.includes('android') || q.includes('ionic')) {
    baseAnswer = `**Mobile Development Experience:**
Vitor has extensive experience engineering cross-platform mobile apps for both consumer fintech and enterprise banking:
- **SemmieWealth (2025–Present):** Developing the award-winning hybrid **Semmie App** for iOS & Android with **Ionic, Angular, and NgRx**.
- **BNP Paribas (2018–2019):** Built internal financial mobile apps for the bank using **Ionic & Angular 2+**, establishing mobile design systems.`;
  } else if (q.includes('lead') || q.includes('architecture') || q.includes('mentor') || q.includes('staff')) {
    baseAnswer = `**Engineering Leadership & Architecture:**
- **Dialog (Staff Frontend Engineer, 2024):** Led frontend architecture, shaped technical strategy with Angular/RxJS/Akita/Nx, conducted rigorous code reviews, and mentored engineers.
- **Hovione (Full Stack Lead, 2019):** Led Industry 4.0 greenfield systems from scratch, defining API contracts with Express.js & Angular, Docker containerization, and Cypress CI/CD.
- **PagerDuty & Rydoo:** Spearheaded company-wide migrations to **TypeScript** and **Nx Monorepos**, building unified design systems used across multiple squads.`;
  } else if (q.includes('pagerduty') || q.includes('status page')) {
    baseAnswer = `**PagerDuty (2022 – 2023):**
Vitor worked as a **Senior Frontend Developer** building the **"Status Page"** product suite.

**Key Highlights:**
- Developed two primary **React** applications: one for administrative management and one for public status viewing.
- Contributed to shared design systems and core internal component libraries.
- Championed company-wide initiatives transitioning codebases to **TypeScript**.`;
  } else if (q.includes('rydoo')) {
    baseAnswer = `**Rydoo (2020 – 2022):**
Vitor was a **Senior Frontend Developer** building a global SaaS expense management platform.
- Developed core modules using **Angular, NgRx**, and **Jest**.
- Drove the company migration to a monorepo approach with **Nx** and implemented a corporate Design System.`;
  } else if (q.includes('dialog')) {
    baseAnswer = `**Dialog (2024 – 2025):**
Vitor served as **Staff Frontend Engineer** in Amsterdam.
- Led frontend development using **Angular, RxJS, Akita, Nx**, and **Sass**.
- Mentored engineering team members, drove core architectural decisions, and managed version migration strategies.`;
  } else if (q.includes('bigenius')) {
    baseAnswer = `**BiGenius (2023 – 2024):**
Senior Frontend Developer in Berlin building smart data automation applications using **Angular, NgRx, Material Design, Ag-Grid, Cypress**, and **Jest**.`;
  } else if (q.includes('hovione')) {
    baseAnswer = `**Hovione (2019 – 2020):**
Full Stack Software Developer in Lisbon.
- Led Industry 4.0 greenfield projects with **Angular, Express.js, Docker**, and **Jenkins CI/CD**.
- Implemented end-to-end testing with **Cypress & Chai**.`;
  } else if (q.includes('bnp') || q.includes('paribas') || q.includes('bank')) {
    baseAnswer = `**BNP Paribas (2018 – 2019):**
Frontend & Mobile Developer in Lisbon.
- Developed mobile banking apps using **Ionic and Angular 2+**.
- Created departmental design systems and proof-of-concepts for enterprise migration.`;
  } else if (q.includes('tech') || q.includes('stack') || q.includes('skills')) {
    baseAnswer = `**Core Technical Stack & Specializations:**
- **Languages:** TypeScript, JavaScript (ESNext), HTML5, CSS3/SCSS.
- **Frameworks & Ecosystem:** Angular (RxJS, NgRx, Akita), React, Ionic (iOS/Android/Web), Express.js.
- **Architecture & Tooling:** Nx Monorepo, Micro-frontends, Design Systems, Vite, Webpack, Docker.
- **Testing & Quality:** Jest, Cypress, Chai, TDD, CI/CD with GitHub Actions & Jenkins.
- **Cloud & AI:** AWS, Azure, Chrome Built-in AI (Prompt & Summarizer APIs), GitHub Copilot.`;
  } else if (q.includes('relocation') || q.includes('cities') || q.includes('amsterdam') || q.includes('berlin') || q.includes('where') || q.includes('portugal') || q.includes('geographic')) {
    baseAnswer = `**Geographic Journey & Relocations:**
1. **Mealhada, Portugal (1982):** Origin point.
2. **Coimbra, Portugal (2000):** Academic foundation in Computer Science & Engineering.
3. **Porto, Portugal (2013):** Commenced professional engineering career (WeCreateYou).
4. **Lisboa, Portugal (2016):** Enterprise, fintech, and digital media (Global Media Group, ANF, BNP Paribas, Hovione, Rydoo, PagerDuty).
5. **Berlin, Germany (2023):** International tech scale-ups (BiGenius).
6. **Amsterdam, Netherlands (2024 – Present):** Current headquarters and fintech engineering base (Dialog, SemmieWealth).`;
  } else if (
    q.includes('contact') ||
    q.includes('linkedin') ||
    q.includes('github') ||
    q.includes('website') ||
    q.includes('profile') ||
    q.includes('social') ||
    q.includes('link') ||
    q.includes('reach') ||
    q.includes('email')
  ) {
    baseAnswer = `**Official Links & Profiles:**
- **Website:** [vitorspace.com](https://www.vitorspace.com)
- **LinkedIn:** [linkedin.com/in/vitorsferreira](https://www.linkedin.com/in/vitorsferreira/)
- **GitHub:** [github.com/vitorstick](https://github.com/vitorstick)`;
  } else {
    baseAnswer = `Vitor Ferreira is a **Senior Software Engineer & Staff Frontend Engineer** based in Amsterdam with over 10+ years of experience across leading European tech companies (SemmieWealth, Dialog, BiGenius, PagerDuty, Rydoo, Hovione, BNP Paribas).

**Connect & Profiles:**
- **Website:** [vitorspace.com](https://www.vitorspace.com)
- **LinkedIn:** [linkedin.com/in/vitorsferreira](https://www.linkedin.com/in/vitorsferreira/)
- **GitHub:** [github.com/vitorstick](https://github.com/vitorstick)

**Key Focus Areas:**
- **Frameworks:** Angular, React, Ionic (Mobile iOS/Android/Web).
- **Architecture:** Nx Monorepo, State Management (NgRx, Akita, Redux), Design Systems.
- **Languages:** TypeScript, JavaScript, CSS3/SCSS.`;
  }

  // At higher temperatures, append creative speculative commentary and assumptions!
  if (temperature > 0.6) {
    const speculativeLayers = [
      `\n\n💡 **Speculative Hypothesis & Creative Extrapolations (T=${temperature.toFixed(2)}):**\nGiven Vitor's track record spanning high-scale fintech (SemmieWealth), incident response (PagerDuty), and on-device Web AI (Chrome Gemini Nano & Prompt API), it is plausible he is exploring hybrid edge-computing architectures, next-gen WebAssembly state machines, or real-time local intelligence pipelines. Even if he hasn't publicly confirmed it yet, his engineering trajectory strongly points towards mastering on-device neural agents that run offline without server roundtrips!`,
      `\n\n🚀 **Creative Engineering Vision (T=${temperature.toFixed(2)}):**\nAssuming Vitor continues blending reactive state architectures with on-device generative models, one could imagine him pioneering micro-frontend architectures with zero-latency local intelligence and self-healing UI systems. His background in both enterprise banking and high-agility startups suggests he values deterministic type safety just as much as cutting-edge exploratory UX.`,
    ];
    const layer = speculativeLayers[Math.floor(Math.random() * speculativeLayers.length)];
    return `${baseAnswer}${layer}`;
  }

  if (temperature > 0.2) {
    return `${baseAnswer}\n\n🔍 **Architectural Perspective (T=${temperature.toFixed(2)}):**\nAcross 10+ years, Vitor has consistently prioritized scalable mono-repo design patterns (Nx), strict reactive state streams (NgRx/RxJS/Akita), and cross-platform component design systems.`;
  }

  return baseAnswer;
}
