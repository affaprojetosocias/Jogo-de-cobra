/**
 * Implementação simplificada que deixa a interface anterior disponível sem
 * depender de bibliotecas externas. A reprodução é delegada ao SoundSystem.
 */
export class SoundManager {
  playEat() {}
  playDeath() {}
  playAmbience() {}
  setMuted(_muted: boolean) {}
}
