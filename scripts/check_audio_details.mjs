import ffprobeStatic from 'ffprobe-static';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execFileAsync = promisify(execFile);

async function checkAudioDetails() {
  const audioPath = path.resolve('input/Tu red también debería hacerlo.mp3');
  const { stdout } = await execFileAsync(ffprobeStatic.path, [
    '-v', 'error',
    '-show_streams',
    '-show_format',
    '-of', 'json',
    audioPath
  ]);
  const data = JSON.parse(stdout);
  console.log('Format:', data.format);
  console.log('Streams:', data.streams);
}

checkAudioDetails();
