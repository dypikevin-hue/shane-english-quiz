import { useCallback } from 'react';

export function useSpeech() {
  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    
    const voices = window.speechSynthesis.getVoices();
    
    // 優先選擇 Google US English
    let selectedVoice = voices.find(v => v.name.includes('Google US English'));
    
    // 次選 en-US
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang === 'en-US');
    }
    
    // 最後選任何英文語音
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith('en'));
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  }, []);

  return { speak };
}
