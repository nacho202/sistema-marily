/**
 * Obtiene fecha/hora en zona Argentina (Buenos Aires).
 * Evita desfases cuando el servidor está en otra zona horaria.
 */
const AR_TIMEZONE = 'America/Argentina/Buenos_Aires';

function formatInTimezone(date, timeZone) {
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const map = {};
  for (const p of parts) map[p.type] = p.value;
  return map;
}

function getLocalDateString() {
  const now = new Date();
  const { year, month, day } = formatInTimezone(now, AR_TIMEZONE);
  return `${year}-${month}-${day}`;
}

/**
 * Obtiene la fecha y hora actual en formato YYYY-MM-DD HH:mm:ss en hora Argentina
 */
function getLocalDateTimeString() {
  const now = new Date();
  const { year, month, day, hour, minute, second } = formatInTimezone(now, AR_TIMEZONE);
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

module.exports = {
  getLocalDateString,
  getLocalDateTimeString
};

