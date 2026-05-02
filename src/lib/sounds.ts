
/**
 * Sound effects utility for Math Mind
 */

const SOUND_URLS = {
  correct: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3', // Soft chime
  incorrect: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3', // Low thump
  levelUp: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', // Trumpet/Victory
  unlock: 'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3', // Magical sparkle
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3' // Subtle click
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
