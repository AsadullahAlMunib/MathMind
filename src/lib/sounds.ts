
/**
 * Sound effects utility for Math Mind
 */

const SOUND_URLS = {
  correct: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3', // Soft high-pitched melodic chime
  incorrect: 'https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3', // Soft descending melodic "error" tone
  levelUp: 'https://assets.mixkit.co/active_storage/sfx/1997/1997-preview.mp3', // Melodic celebratory winning chime
  unlock: 'https://assets.mixkit.co/active_storage/sfx/2011/2011-preview.mp3', // Magical revealing shimmer
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3' // Subtle UI pop
};

class SoundManager {
  private enabled: boolean = true;
  private sounds: Record<string, HTMLAudioElement> = {};

  constructor() {
    if (typeof window !== 'undefined') {
      Object.entries(SOUND_URLS).forEach(([key, url]) => {
        const audio = new Audio(url);
        audio.preload = 'auto';
        this.sounds[key] = audio;
      });
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  play(soundName: keyof typeof SOUND_URLS) {
    if (!this.enabled || !this.sounds[soundName]) return;
    
    const sound = this.sounds[soundName];
    sound.currentTime = 0;
    sound.play().catch(e => console.log('Sound play blocked:', e));
  }
}

export const soundManager = new SoundManager();
