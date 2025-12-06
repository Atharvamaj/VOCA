import './style.css'

// Type definitions for Web Speech API
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

const win = window as unknown as IWindow;
const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

const app = document.querySelector<HTMLDivElement>('#app')!;

// New HTML Structure
app.innerHTML = `
  <div class="h-screen w-screen flex items-center justify-center bg-gray-900 relative overflow-hidden font-vt323">
    
    <!-- App Title -->
    <h1 id="appTitle" class="absolute top-16 left-1/2 -translate-x-1/2 text-white text-8xl font-bold tracking-widest z-10 transition-opacity duration-500 pointer-events-none opacity-100">VOCA</h1>

    <!-- Overlay for Countdown -->
    <div id="overlay" class="fixed inset-0 bg-black/80 z-[60] hidden flex items-center justify-center">
      <span id="countdown" class="text-white text-9xl font-bold animate-bounce">3</span>
    </div>

    <!-- Large Microphone Button -->
    <button id="recordBtn" class="w-32 h-32 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xl z-50 transition-all duration-500 hover:scale-105 active:scale-95 outline-none focus:ring-4 focus:ring-blue-300">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    </button>

    <!-- Popup / Bottom Sheet -->
    <div id="popup" class="fixed bottom-0 left-0 w-full h-[60vh] bg-gray-800 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.3)] transition-transform duration-500 transform translate-y-full z-40 flex flex-col p-8">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-3xl font-bold text-white tracking-wider">TRANSCRIPTION</h2>
        <span id="status" class="text-xl text-gray-400">READY</span>
      </div>
      
      <div id="output" class="flex-1 w-full p-4 border-2 border-gray-600 rounded-xl bg-gray-700 text-left overflow-y-auto text-gray-200 text-2xl leading-relaxed whitespace-pre-wrap mb-4 font-mono"></div>
      
      <div id="buttonContainer" class="flex gap-4 transition-all duration-500 max-h-0 opacity-0 translate-y-10 overflow-hidden">
        <button id="redoBtn" class="flex-1 bg-gray-600 hover:bg-gray-500 text-white text-xl py-3 rounded-lg transition-colors border-b-4 border-gray-800 active:border-b-0 active:translate-y-1">REDO</button>
        <button id="confirmBtn" class="flex-1 bg-green-600 hover:bg-green-500 text-white text-xl py-3 rounded-lg transition-colors border-b-4 border-green-800 active:border-b-0 active:translate-y-1">CONFIRM</button>
      </div>
    </div>

    <!-- Menu Popup -->
    <div id="menuPopup" class="fixed bottom-0 left-0 w-full h-screen bg-gray-800 z-20 transition-transform duration-500 transform translate-y-full flex flex-col pt-20 px-4 pb-4 border-t-2 border-gray-600 overflow-y-auto">
      <div id="cardsGrid" class="grid grid-cols-2 gap-4 w-full max-w-md mx-auto">
        <!-- Cards will go here -->
      </div>
      <div id="emptyState" class="text-white text-2xl text-center mt-20">No cards yet</div>
    </div>

    <!-- Card Modal -->
    <div id="cardModal" class="fixed inset-0 bg-black/90 z-[90] hidden flex items-center justify-center p-4 perspective-1000">
        <div id="modalCard" class="w-full max-w-sm aspect-[3/4] relative transition-transform duration-700 transform-style-3d cursor-pointer">
            <!-- Front -->
            <div class="absolute inset-0 backface-hidden bg-blue-600 rounded-xl border-4 border-blue-800 flex items-center justify-center shadow-2xl">
                <span class="text-white text-6xl font-bold">#<span id="modalCardId">1</span></span>
            </div>
            <!-- Back -->
            <div class="absolute inset-0 backface-hidden bg-white rounded-xl border-4 border-gray-300 flex flex-col p-6 rotate-y-180 overflow-y-auto">
                <h3 class="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-gray-200 pb-2">TRANSCRIPT</h3>
                <div class="flex-1 overflow-y-auto">
                    <p id="modalCardText" class="text-black text-xl leading-relaxed font-mono whitespace-pre-wrap"></p>
                </div>
            </div>
        </div>
    </div>

    <!-- Menu Button -->
    <button id="menuBtn" class="fixed bottom-0 left-1/2 -translate-x-1/2 w-20 h-10 bg-gray-800 rounded-t-full flex items-end justify-center pb-1 z-30 transition-all duration-500 border-t-2 border-l-2 border-r-2 border-gray-600 hover:bg-gray-700">
      <svg id="menuArrow" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
      </svg>
    </button>

  </div>
`;

const recordBtn = document.getElementById('recordBtn') as HTMLButtonElement;
const popup = document.getElementById('popup') as HTMLDivElement;
const outputDiv = document.getElementById('output') as HTMLDivElement;
const statusSpan = document.getElementById('status') as HTMLSpanElement;
const overlay = document.getElementById('overlay') as HTMLDivElement;
const countdownSpan = document.getElementById('countdown') as HTMLSpanElement;
const buttonContainer = document.getElementById('buttonContainer') as HTMLDivElement;
const redoBtn = document.getElementById('redoBtn') as HTMLButtonElement;
const confirmBtn = document.getElementById('confirmBtn') as HTMLButtonElement;
const menuBtn = document.getElementById('menuBtn') as HTMLButtonElement;
const menuPopup = document.getElementById('menuPopup') as HTMLDivElement;
const cardsGrid = document.getElementById('cardsGrid') as HTMLDivElement;
const emptyState = document.getElementById('emptyState') as HTMLDivElement;
const cardModal = document.getElementById('cardModal') as HTMLDivElement;
const modalCard = document.getElementById('modalCard') as HTMLDivElement;
const modalCardId = document.getElementById('modalCardId') as HTMLSpanElement;
const modalCardText = document.getElementById('modalCardText') as HTMLParagraphElement;

let recognition: any = null;
let isRecording = false;
let isMenuOpen = false;
let cards: string[] = [];
let isCardFlipped = false;

// --- AI Logic ---

// 1. Object Recognition & Prompt Refinement (using Gemini as "GPT-5")
async function refinePromptWithGemini(inputText: string): Promise<string | null> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        console.error('No Gemini API Key found');
        return inputText; // Fallback to raw text if no key
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are an AI assistant for a card game. 
                        User input: "${inputText}"
                        
                        Task:
                        1. Analyze if the input describes a tangible object, creature, or visualizable concept.
                        2. If it is abstract, nonsense, or not visualizable, return exactly: "FALSE"
                        3. If it IS visualizable, convert it into a specific image generation prompt:
                           "Generate a detailed illustration of [Subject]."
                        
                        Return ONLY the prompt string or the word "FALSE". Do not add markdown or explanations.`
                    }]
                }]
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || 'Gemini API Error');

        const result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        
        if (result === 'FALSE') return null;
        return result || inputText;

    } catch (error) {
        console.error('Prompt refinement failed:', error);
        return inputText; // Fallback
    }
}

// 2. Image Generation (OpenAI DALL-E 3)
async function generateImageOpenAI(prompt: string): Promise<string> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
        console.error('No OpenAI API Key found');
        return ''; 
    }

    try {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "dall-e-3",
                prompt: `I NEED to test how the tool works with extremely simple prompts. DO NOT modify my prompt. Do not add detail. ${prompt}`,
                n: 1,
                size: "1024x1024",
                quality: "hd",
                style: "natural"
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || 'Failed to generate image');

        return data.data[0].url;
    } catch (error) {
        console.error('OpenAI generation failed:', error);
        return '';
    }
}
// ---------------------------------

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    console.log('Recognition started');
    isRecording = true;
    
    // Reset Popup styles if restarting
    popup.classList.add('h-[60vh]', 'rounded-t-3xl');
    popup.classList.remove('h-full', 'rounded-none');

    // Show Record Button
    recordBtn.classList.remove('opacity-0', 'pointer-events-none');

    // Visual updates for recording state (Red Pulse)
    recordBtn.classList.remove('bg-blue-600', 'hover:scale-105');
    recordBtn.classList.add('bg-red-500', 'animate-pulse', 'scale-110');
    
    // Hide buttons when starting new recording
    buttonContainer.classList.remove('max-h-24');
    buttonContainer.classList.add('max-h-0', 'opacity-0', 'translate-y-10');
    
    statusSpan.textContent = 'LISTENING...';
    statusSpan.classList.add('text-red-500');
    
    if (!outputDiv.textContent) {
        outputDiv.textContent = '';
    }
  };

  recognition.onend = () => {
    console.log('Recognition ended');
    isRecording = false;
    
    // Visual updates for stopped state
    recordBtn.classList.remove('bg-red-500', 'animate-pulse', 'scale-110');
    recordBtn.classList.add('bg-blue-600', 'hover:scale-105');
    
    // Hide Record Button
    recordBtn.classList.add('opacity-0', 'pointer-events-none');

    // Expand Popup to Full Screen
    popup.classList.remove('h-[60vh]', 'rounded-t-3xl');
    popup.classList.add('h-full', 'rounded-none');

    // Show buttons
    buttonContainer.classList.remove('max-h-0', 'opacity-0', 'translate-y-10');
    buttonContainer.classList.add('max-h-24');
    
    statusSpan.textContent = 'STOPPED';
    statusSpan.classList.remove('text-red-500');
  };

  recognition.onresult = (event: any) => {
    const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
        
    outputDiv.textContent = transcript;
    outputDiv.scrollTop = outputDiv.scrollHeight;
  };

  recognition.onerror = (event: any) => {
    console.error('Speech recognition error', event.error);
    statusSpan.textContent = `ERROR: ${event.error}`;
    if (event.error === 'not-allowed') {
        statusSpan.textContent = 'MIC DENIED';
    }
  };

} else {
  outputDiv.textContent = 'Speech Recognition API not supported in this browser.';
  recordBtn.disabled = true;
  recordBtn.classList.add('opacity-50', 'cursor-not-allowed');
}

recordBtn.addEventListener('click', () => {
  if (!recognition) return;

  if (isRecording) {
    recognition.stop();
  } else {
    // Start Sequence
    
    // 1. Open Popup & Move Button
    popup.classList.remove('translate-y-full');
    recordBtn.classList.add('-translate-y-[35vh]');

    // 2. Show Overlay
    overlay.classList.remove('hidden');
    
    // 3. Countdown
    let count = 3;
    countdownSpan.textContent = count.toString();
    
    const timer = setInterval(() => {
        count--;
        if (count > 0) {
            countdownSpan.textContent = count.toString();
        } else {
            clearInterval(timer);
            overlay.classList.add('hidden');
            recognition.start();
        }
    }, 1000);
  }
});

redoBtn.addEventListener('click', () => {
    console.log('Redo clicked');
    // Reset UI to initial state
    outputDiv.textContent = '';
    
    // Hide buttons
    buttonContainer.classList.remove('max-h-24');
    buttonContainer.classList.add('max-h-0', 'opacity-0', 'translate-y-10');

    // Shrink Popup and Hide it
    popup.classList.add('h-[60vh]', 'rounded-t-3xl', 'translate-y-full');
    popup.classList.remove('h-full', 'rounded-none');

    // Show and Reset Record Button position
    recordBtn.classList.remove('opacity-0', 'pointer-events-none', '-translate-y-[35vh]');
    
    // Reset status
    statusSpan.textContent = 'READY';
});

confirmBtn.addEventListener('click', async () => {
    console.log('Confirm clicked');
    const text = outputDiv.textContent || '';
    if (!text.trim()) return;

    // UI Feedback: Show generating state
    confirmBtn.textContent = 'GENERATING...';
    confirmBtn.disabled = true;
    confirmBtn.classList.add('opacity-75', 'cursor-wait');

    // Generate Image
    let imageUrl = '';
    try {
        // 1. Refine Prompt / Check Object
        const refinedPrompt = await refinePromptWithGemini(text);
        
        if (refinedPrompt) {
            console.log('Generating with prompt:', refinedPrompt);
            // 2. Generate Image
            imageUrl = await generateImageOpenAI(refinedPrompt);
        } else {
            console.log('Object detection returned FALSE. Skipping image generation.');
        }
    } catch (e) {
        console.error(e);
    }

    // Add to cards array
    cards.push(text);
    const cardIndex = cards.length;

    // Create Card Element
    const cardEl = document.createElement('div');
    cardEl.className = 'aspect-[3/4] bg-blue-600 rounded-lg border-4 border-blue-800 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform shadow-lg overflow-hidden relative';
    
    if (imageUrl) {
        cardEl.innerHTML = `<img src="${imageUrl}" alt="${text}" class="w-full h-full object-cover pixelated" />`;
    } else {
        // Fallback if generation fails
        cardEl.innerHTML = `<span class="text-white text-4xl font-bold">#${cardIndex}</span>`;
    }
    
    // Add click event to open modal
    cardEl.addEventListener('click', () => {
        console.log('Opening card', cardIndex, 'with text:', text);
        modalCardId.textContent = cardIndex.toString();
        modalCardText.textContent = text;
        
        // Update Modal Front Image
        const modalFront = document.querySelector('#modalCard > div:first-child') as HTMLDivElement;
        if (imageUrl) {
            modalFront.innerHTML = `<img src="${imageUrl}" alt="${text}" class="w-full h-full object-cover rounded-xl pixelated" />`;
            modalFront.classList.remove('bg-blue-600', 'border-blue-800');
            modalFront.classList.add('bg-black', 'border-gray-800');
        } else {
             modalFront.innerHTML = `<span class="text-white text-6xl font-bold">#${cardIndex}</span>`;
             modalFront.classList.add('bg-blue-600', 'border-blue-800');
             modalFront.classList.remove('bg-black', 'border-gray-800');
        }

        isCardFlipped = false;
        modalCard.classList.remove('rotate-y-180');
        cardModal.classList.remove('hidden');
    });

    // Append to grid
    cardsGrid.appendChild(cardEl);
    emptyState.classList.add('hidden');

    // Reset UI (Same as Redo)
    outputDiv.textContent = '';
    buttonContainer.classList.remove('max-h-24');
    buttonContainer.classList.add('max-h-0', 'opacity-0', 'translate-y-10');
    popup.classList.add('h-[60vh]', 'rounded-t-3xl', 'translate-y-full');
    popup.classList.remove('h-full', 'rounded-none');
    recordBtn.classList.remove('opacity-0', 'pointer-events-none', '-translate-y-[35vh]');
    statusSpan.textContent = 'READY';

    // Reset Button State
    confirmBtn.textContent = 'CONFIRM';
    confirmBtn.disabled = false;
    confirmBtn.classList.remove('opacity-75', 'cursor-wait');
});

// Modal Click Events
modalCard.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent closing when clicking the card itself
    isCardFlipped = !isCardFlipped;
    if (isCardFlipped) {
        modalCard.classList.add('rotate-y-180');
    } else {
        modalCard.classList.remove('rotate-y-180');
    }
});

cardModal.addEventListener('click', () => {
    cardModal.classList.add('hidden');
});

menuBtn.addEventListener('click', () => {
    isMenuOpen = !isMenuOpen;
    const appTitle = document.getElementById('appTitle');
    
    if (isMenuOpen) {
        menuPopup.classList.remove('translate-y-full');
        menuBtn.classList.add('-translate-y-[calc(100vh_-_2.5rem)]', 'rotate-180');
        recordBtn.classList.add('-translate-y-[75vh]');
        appTitle?.classList.add('opacity-0');
    } else {
        menuPopup.classList.add('translate-y-full');
        menuBtn.classList.remove('-translate-y-[calc(100vh_-_2.5rem)]', 'rotate-180');
        recordBtn.classList.remove('-translate-y-[75vh]');
        appTitle?.classList.remove('opacity-0');
    }
});