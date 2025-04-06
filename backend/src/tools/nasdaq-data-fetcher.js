const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * СКРИПТ ДЛЯ ОДНОРАЗОВОЙ ЗАГРУЗКИ ИСТОРИЧЕСКИХ ДАННЫХ АКЦИЙ
 *
 * Запуск: node src/tools/nasdaq-data-fetcher.js
 *
 * После успешного выполнения данные будут сохранены в файл:
 * /broker-exchange/backend/storage/stocks.json
 */

// Список акций для загрузки
const STOCKS = [
  { symbol: 'AAPL', companyName: 'Apple, Inc.' },
  { symbol: 'SBUX', companyName: 'Starbucks, Inc.' },
  { symbol: 'MSFT', companyName: 'Microsoft, Inc.' },
  { symbol: 'CSCO', companyName: 'Cisco Systems, Inc.' },
  { symbol: 'QCOM', companyName: 'QUALCOMM Incorporated' },
  { symbol: 'AMZN', companyName: 'Amazon.com, Inc.' },
  { symbol: 'TSLA', companyName: 'Tesla, Inc.' },
  { symbol: 'AMD', companyName: 'Advanced Micro Devices, Inc.' },
];

// Путь к файлу для сохранения данных
const STORAGE_FILE = path.resolve(__dirname, '../../storage/stocks.json');

// Функция для задержки между запросами API
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Получение исторических данных акции через Yahoo Finance API
 *
 * @param {string} symbol - Тикер акции (например, AAPL)
 * @param {number} years - Количество лет истории для загрузки
 * @returns {Promise<Array>} Массив с историческими данными
 */
async function fetchHistoricalData(symbol, years = 3) {
  try {
    console.log(
      `[${new Date().toLocaleTimeString()}] Загрузка данных для ${symbol}...`,
    );

    // Вычисляем период для запроса - 3 года назад от текущей даты
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - years);

    // Преобразуем даты в Unix timestamp для Yahoo Finance API
    const period1 = Math.floor(startDate.getTime() / 1000);
    const period2 = Math.floor(endDate.getTime() / 1000);

    // Формируем URL для запроса к Yahoo Finance
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${period1}&period2=${period2}&interval=1d`;

    // Выполняем запрос
    const response = await axios.get(url);

    // Проверяем, что ответ содержит необходимые данные
    if (
      !response.data ||
      !response.data.chart ||
      !response.data.chart.result ||
      !response.data.chart.result[0]
    ) {
      throw new Error(`Не получены данные для ${symbol}`);
    }

    // Извлекаем нужные данные из ответа
    const result = response.data.chart.result[0];
    const timestamps = result.timestamp;
    const openPrices = result.indicators.quote[0].open;

    // Формируем массив с историческими данными в нужном формате
    const historicalData = [];

    for (let i = 0; i < timestamps.length; i++) {
      // Пропускаем записи с отсутствующими данными
      if (openPrices[i] === null || openPrices[i] === undefined) continue;

      // Преобразуем timestamp в объект Date
      const date = new Date(timestamps[i] * 1000);

      // Форматируем дату в формате, требуемом приложением (M/D/YYYY)
      const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

      // Добавляем запись в массив исторических данных
      historicalData.push({
        date: formattedDate,
        open: `$${openPrices[i].toFixed(2)}`,
      });
    }

    console.log(
      `[${new Date().toLocaleTimeString()}] Загружено ${historicalData.length} записей для ${symbol}`,
    );
    return historicalData;
  } catch (error) {
    console.error(
      `[${new Date().toLocaleTimeString()}] Ошибка при загрузке данных для ${symbol}:`,
      error.message,
    );
    return [];
  }
}

/**
 * Основная функция для загрузки данных всех акций и сохранения их в JSON-файл
 */
async function fetchAllStocksData() {
  try {
    console.log(`\n=== ЗАГРУЗКА ИСТОРИЧЕСКИХ ДАННЫХ АКЦИЙ ===`);
    console.log(
      `[${new Date().toLocaleTimeString()}] Начало загрузки данных для ${STOCKS.length} акций`,
    );

    // Объект для хранения данных всех акций
    const stocksData = {};

    // Загружаем данные для каждой акции
    for (const stock of STOCKS) {
      // Получаем исторические данные
      const historicalData = await fetchHistoricalData(stock.symbol);

      // Проверяем, что удалось получить данные
      if (historicalData.length === 0) {
        console.warn(
          `[${new Date().toLocaleTimeString()}] Предупреждение: нет данных для ${stock.symbol}, пропускаем...`,
        );
        continue;
      }

      // Определяем текущую цену как последнюю цену из исторических данных
      const currentPrice = historicalData[historicalData.length - 1].open;

      // Формируем данные акции и добавляем в общий объект
      stocksData[stock.symbol] = {
        symbol: stock.symbol,
        companyName: stock.companyName,
        isActive: true,
        historicalData,
        currentPrice,
      };

      // Делаем паузу между запросами, чтобы не перегружать API
      await sleep(1000);
    }

    // Проверяем существование директории
    const dir = path.dirname(STORAGE_FILE);
    if (!fs.existsSync(dir)) {
      console.log(
        `[${new Date().toLocaleTimeString()}] Создание директории ${dir}`,
      );
      fs.mkdirSync(dir, { recursive: true });
    }

    // Сохраняем данные в JSON-файл
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(stocksData, null, 2));
    console.log(
      `[${new Date().toLocaleTimeString()}] Данные акций успешно сохранены в файл: ${STORAGE_FILE}`,
    );
    console.log(`\n=== ЗАГРУЗКА ЗАВЕРШЕНА ===`);
  } catch (error) {
    console.error(
      `[${new Date().toLocaleTimeString()}] Критическая ошибка при загрузке данных:`,
      error,
    );
  }
}

// Запускаем процесс загрузки данных
fetchAllStocksData();
