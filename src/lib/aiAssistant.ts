/// <reference types="dom-chromium-ai" />

import { timeline } from '../data/timeline';

export type AIAvailabilityStatus =
  | 'readily'
  | 'available'
  | 'after-download'
  | 'downloadable'
  | 'downloading'
  | 'unavailable'
  | 'no'
  | 'unsupported';

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

export interface LanguageModelSessionInstance {
  prompt(input: string, options?: { signal?: AbortSignal }): Promise<string>;
  promptStreaming(
    input: string,
    options?: { signal?: AbortSignal }
  ): AsyncIterable<string> | ReadableStream<string>;
  destroy(): void;
}

export interface LanguageModelFactory {
  availability?(options?: unknown): Promise<string>;
  capabilities?(): Promise<{ available: 'readily' | 'after-download' | 'no' }>;
  create(options?: {
    systemPrompt?: string;
    temperature?: number;
    topK?: number;
    signal?: AbortSignal;
    monitor?: (monitor: EventTarget) => void;
  }): Promise<LanguageModelSessionInstance>;
}

// Factory interfaces for Chrome Prompt API (Gemini Nano)
export type AIApiWindow = {
  ai?: {
    languageModel?: LanguageModelFactory;
    assistant?: LanguageModelFactory;
  };
  LanguageModel?: LanguageModelFactory;
};

/**
 * Accesses the Chrome Built-in AI LanguageModel factory if available
 */
export function getLanguageModelAPI(): LanguageModelFactory | null {
  if (typeof window === 'undefined') return null;

  const anyWin = window as unknown as AIApiWindow;

  return (
    anyWin.ai?.languageModel ||
    anyWin.ai?.assistant ||
    anyWin.LanguageModel ||
    null
  );
}

/**
 * Probes the browser for Language Model (Prompt API / Gemini Nano) support
 */
export async function checkLanguageModelAvailability(): Promise<AIAvailabilityStatus> {
  try {
    const api = getLanguageModelAPI();
    if (!api) {
      return 'unsupported';
    }

    if (typeof api.availability === 'function') {
      const status = (await api.availability()) as AIAvailabilityStatus;
      return status || 'unsupported';
    }

    if (typeof api.capabilities === 'function') {
      const caps = await api.capabilities();
      if (caps?.available) {
        return caps.available;
      }
    }

    return 'unsupported';
  } catch (err) {
    console.debug('Language Model availability check failed:', err);
    return 'unsupported';
  }
}

export function isLanguageModelUsable(status: AIAvailabilityStatus): boolean {
  return (
    status === 'readily' ||
    status === 'available' ||
    status === 'after-download' ||
    status === 'downloadable' ||
    status === 'downloading'
  );
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
 * Builds a grounded prompt envelope for on-device Gemini Nano with dynamic tone based on temperature
 */
export function buildGroundedPrompt(
  query: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[] = [],
  temperature: number = DEFAULT_AI_TEMPERATURE
): string {
  const facts = compileTimelineFacts();

  let historySection = '';
  if (conversationHistory.length > 0) {
    const recent = conversationHistory.slice(-3);
    historySection = `RECENT CHAT HISTORY:\n${recent
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n')}\n\n`;
  }

  if (temperature <= 0.2) {
    return `You are Vitor Ferreira's official portfolio AI assistant. Answer the user's question accurately, concisely, and factually using ONLY the verified facts below. Do NOT make up or assume any external information. If the answer is not in the facts, state that it is not in Vitor's verified timeline.

${facts}

${historySection}USER QUESTION: ${query}

CONCISE FACTUAL ANSWER:`;
  }

  if (temperature <= 0.6) {
    return `You are Vitor Ferreira's portfolio AI assistant. Provide an engaging, insightful, and well-rounded answer using the timeline facts below as context.

${facts}

${historySection}USER QUESTION: ${query}

DETAILED & ENGAGING ANSWER:`;
  }

  return `You are Vitor Ferreira's AI assistant in creative & speculative experimentation mode. Use the facts below as background inspiration, but feel free to extrapolate, be imaginative, hypothesize, make assumptions, and speculate boldly about what Vitor could build, his tech leadership style, and futuristic engineering directions!

${facts}

${historySection}USER QUESTION: ${query}

CREATIVE & SPECULATIVE ANSWER (FEEL FREE TO MAKE ASSUMPTIONS AND HYPOTHESIZE):`;
}

/**
 * Executes a question prompt against Chrome's on-device Gemini Nano model
 */
export async function askTimelineAssistant({
  prompt,
  conversationHistory = [],
  temperature = DEFAULT_AI_TEMPERATURE,
  topK,
  onChunk,
  onDownloadProgress,
  signal,
}: PromptExecutionOptions): Promise<string> {
  const api = getLanguageModelAPI();
  if (!api) {
    throw new Error('Chrome Prompt API (Gemini Nano) is not supported or enabled on this browser.');
  }

  // topK=1 forces greedy decoding where temperature has no effect.
  // We dynamically scale topK when temperature rises to unlock token diversity.
  const computedTopK =
    topK !== undefined
      ? topK
      : temperature <= 0.1
      ? DEFAULT_AI_TOP_K
      : Math.min(40, Math.max(4, Math.round(temperature * 40)));

  const systemInstruction = getSystemPromptForTemperature(temperature);

  const createOptions = {
    systemPrompt: systemInstruction,
    temperature,
    topK: computedTopK,
    signal,
    monitor: (monitor: EventTarget) => {
      monitor.addEventListener('downloadprogress', (e: Event) => {
        const progEvent = e as ProgressEvent;
        if (progEvent.total && progEvent.total > 0) {
          const pct = Math.min(100, Math.round((progEvent.loaded / progEvent.total) * 100));
          onDownloadProgress?.(pct);
        } else if (progEvent.loaded > 0) {
          const pct =
            progEvent.loaded <= 1
              ? Math.round(progEvent.loaded * 100)
              : Math.round(progEvent.loaded);
          onDownloadProgress?.(Math.min(99, Math.max(1, pct)));
        }
      });
    },
  };

  const session = await api.create(createOptions);

  try {
    if (signal?.aborted) {
      throw new Error('Prompt execution aborted.');
    }

    const fullPrompt = buildGroundedPrompt(prompt, conversationHistory, temperature);

    // Attempt streaming execution
    if (typeof session.promptStreaming === 'function') {
      try {
        const streamResult = session.promptStreaming(fullPrompt, { signal });
        let accumulated = '';

        // Check for AsyncIterable
        if (
          streamResult &&
          typeof (streamResult as AsyncIterable<string>)[Symbol.asyncIterator] === 'function'
        ) {
          for await (const chunk of streamResult as AsyncIterable<string>) {
            if (signal?.aborted) break;
            accumulated += chunk;
            onChunk?.(accumulated, chunk);
          }
          return accumulated;
        }

        // Check for ReadableStream
        if (
          streamResult &&
          typeof (streamResult as ReadableStream<string>).getReader === 'function'
        ) {
          const reader = (streamResult as ReadableStream<string>).getReader();
          try {
            while (true) {
              if (signal?.aborted) break;
              const { done, value } = await reader.read();
              if (done) break;
              if (value) {
                accumulated += value;
                onChunk?.(accumulated, value);
              }
            }
          } finally {
            reader.releaseLock();
          }
          return accumulated;
        }
      } catch (streamErr) {
        console.warn('Streaming failed, falling back to direct prompt():', streamErr);
      }
    }

    // Fallback to non-streaming prompt()
    const result = await session.prompt(fullPrompt, { signal });
    onChunk?.(result, result);
    return result;
  } finally {
    try {
      session.destroy();
    } catch {
      // Ignore destroy error
    }
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
    // Alternate or append speculative hypothesis
    const layer = speculativeLayers[Math.floor(Math.random() * speculativeLayers.length)];
    return `${baseAnswer}${layer}`;
  }

  if (temperature > 0.2) {
    return `${baseAnswer}\n\n🔍 **Architectural Perspective (T=${temperature.toFixed(2)}):**\nAcross 10+ years, Vitor has consistently prioritized scalable mono-repo design patterns (Nx), strict reactive state streams (NgRx/RxJS/Akita), and cross-platform component design systems.`;
  }

  return baseAnswer;
}
