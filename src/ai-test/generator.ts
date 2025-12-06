const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
const promptInput = document.getElementById('prompt') as HTMLInputElement;
const generateBtn = document.getElementById('generateBtn') as HTMLButtonElement;
const resultDiv = document.getElementById('result') as HTMLDivElement;

// Load API Key from .env if available
const envApiKey = import.meta.env.VITE_OPENAI_API_KEY;
if (envApiKey) {
    apiKeyInput.value = envApiKey;
}

generateBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    const prompt = promptInput.value.trim();

    if (!apiKey) {
        alert('Please enter an OpenAI API Key');
        return;
    }
    if (!prompt) {
        alert('Please enter a prompt');
        return;
    }

    // UI Loading State
    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating...';
    resultDiv.innerHTML = '<div class="loading">Generating image... (this may take a few seconds)</div>';

    try {
        const imageUrl = await generateImageOpenAI(apiKey, prompt);
        
        // Display Image
        resultDiv.innerHTML = `<img src="${imageUrl}" alt="${prompt}" />`;
    } catch (error: any) {
        console.error(error);
        resultDiv.innerHTML = `<div style="color: red;">Error: ${error.message}</div>`;
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate Image';
    }
});

async function generateImageOpenAI(apiKey: string, prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "dall-e-2",
            prompt: prompt,
            n: 1,
            size: "256x256"
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to generate image');
    }

    return data.data[0].url;
}
