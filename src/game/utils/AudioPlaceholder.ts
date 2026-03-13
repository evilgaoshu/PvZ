/**
 * 音频资源占位生成器
 * 用于生成空的音频文件占位符，便于开发测试
 * 实际项目中应该替换为真实的音频资源
 */

/**
 * 生成空音频 Blob URL（用于开发占位）
 */
export function generateSilentAudio(
  duration: number = 1,
  type: 'mp3' | 'wav' = 'mp3'
): string {
  // 创建一个最小的有效音频数据（静音）
  // 实际项目中应该使用真实音频文件
  const sampleRate = 44100;
  const numFrames = duration * sampleRate;
  const buffer = new ArrayBuffer(44 + numFrames * 2);
  const view = new DataView(buffer);

  // WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + numFrames * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, numFrames * 2, true);

  // Silent data
  for (let i = 0; i < numFrames; i++) {
    view.setInt16(44 + i * 2, 0, true);
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * 创建音频资源目录结构
 */
export function createAudioPlaceholderFiles(): void {
  console.log('📁 音频资源目录结构:');
  console.log('public/');
  console.log('  assets/');
  console.log('    audio/');
  console.log('      sfx/');
  console.log('        plant.mp3         - 种植音效');
  console.log('        shoot.mp3         - 射击音效');
  console.log('        hit.mp3           - 击中音效');
  console.log('        explosion.mp3     - 爆炸音效');
  console.log('        sun_collect.mp3   - 阳光收集');
  console.log('        zombie_groan.mp3  - 僵尸呻吟');
  console.log('        chomp.mp3         - 咬击音效');
  console.log('        button_click.mp3  - 按钮点击');
  console.log('        win.mp3           - 胜利音效');
  console.log('        lose.mp3          - 失败音效');
  console.log('      bgm/');
  console.log('        menu.mp3          - 菜单音乐');
  console.log('        game_day.mp3      - 白天战斗音乐');
  console.log('        game_night.mp3    - 夜晚战斗音乐');
  console.log('        victory.mp3       - 胜利音乐');
  console.log('        defeat.mp3        - 失败音乐');
}
