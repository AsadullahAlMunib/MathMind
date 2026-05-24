
/**
 * Sound effects utility for Math Mind
 */

const SOUND_URLS = {
  correct: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3', // Soft high-pitched melodic chime
  incorrect: 'https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3', // Soft descending melodic "error" tone
  levelUp: 'https://assets.mixkit.co/active_storage/sfx/1433/1433-preview.mp3', // Beautiful digital success chime
  unlock: 'https://assets.mixkit.co/active_storage/sfx/2011/2011-preview.mp3', // Magical revealing shimmer
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // Subtle UI pop
  countdown: 'https://assets.mixkit.co/active_storage/sfx/950/950-preview.mp3' // Retro arcade beep for countdown
};

class SoundManager {
  private enabled: boolean = true;
  private sounds: Record<string, HTMLAudioElement> = {};
  private audioContextUnlocked: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      Object.entries(SOUND_URLS).forEach(([key, url]) => {
        const audio = new Audio(url);
        audio.preload = 'auto';
        this.sounds[key] = audio;
      });

      // Global touch/click interaction unlock routine for iOS/Safari & Chrome
      const unlock = () => {
        if (this.audioContextUnlocked) return;
        
        // Warm up sound resources with silent trigger registered inside user gesture
        Object.values(this.sounds).forEach((audio) => {
          try {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
              playPromise.then(() => {
                audio.pause();
                audio.currentTime = 0;
              }).catch(() => {
                // Silently swallow initial initialization rejections
              });
            }
          } catch (err) {
            // Silently swallow synchronous errors
          }
        });
        
        this.audioContextUnlocked = true;
        
        // Cleanup listeners
        window.removeEventListener('click', unlock);
        window.removeEventListener('touchstart', unlock);
      };

      window.addEventListener('click', unlock, { passive: true });
      window.addEventListener('touchstart', unlock, { passive: true });
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
