const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Путь к резервному скрипту для получения данных
const dataFetchScript = path.join(__dirname, 'fetch-historical-data.js.bak');
// Путь к цели - восстановление файла
const targetScript = path.join(__dirname, 'fetch-historical-data.js');

console.log('Restoring stock data...');

// Копируем .bak файл в основной файл
fs.copyFile(dataFetchScript, targetScript, (err) => {
  if (err) {
    console.error('Error copying the script file:', err);
    process.exit(1);
  }

  console.log('Script file created successfully.');

  // Запускаем скрипт для генерации исторических данных
  exec(`node ${targetScript}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing the script: ${error}`);
      return;
    }

    console.log(`Script output:`);
    console.log(stdout);

    if (stderr) {
      console.error(`Script errors:`);
      console.error(stderr);
    }

    console.log('Stock data has been restored successfully!');

    // Удаляем временный файл
    fs.unlink(targetScript, (unlinkErr) => {
      if (unlinkErr) {
        console.warn(`Warning: Could not remove temporary file: ${unlinkErr}`);
      }
    });
  });
});
