import { Howl } from 'howler';

export class AudioLoader {
  private static cache = new Map<string, Howl>();

  static async loadAudio(url: string): Promise<Howl> {
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    try {
      // First try to fetch the content of the URL to check if it's a redirect
      const response = await fetch(url);
      const content = await response.text();
      
      // Check if the content is actually a URL
      const actualUrl = content.trim().match(/^https?:\/\/.+/i) ? content.trim() : url;

      return new Promise((resolve, reject) => {
        const sound = new Howl({
          src: [actualUrl],
          format: ['wav'],
          preload: true,
          onload: () => {
            this.cache.set(url, sound);
            resolve(sound);
          },
          onloaderror: (_, error) => {
            reject(new Error(`Failed to load audio: ${error}`));
          }
        });
      });
    } catch (error) {
      throw new Error(`Failed to load audio: ${error}`);
    }
  }

  static unloadAudio(url: string) {
    const sound = this.cache.get(url);
    if (sound) {
      sound.unload();
      this.cache.delete(url);
    }
  }

  static clearCache() {
    this.cache.forEach(sound => sound.unload());
    this.cache.clear();
  }
}