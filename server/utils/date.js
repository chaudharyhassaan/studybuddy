function startOfUtcDay(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function toDateOnly(date) {
  return date.toISOString().slice(0, 10);
}

function parseDateOnly(value) {
  return new Date(`${value}T00:00:00.000Z`);
}

function isRealCalendarDate(value) {
  const date = parseDateOnly(value);
  return !Number.isNaN(date.getTime()) && toDateOnly(date) === value;
}

module.exports = { startOfUtcDay, toDateOnly, parseDateOnly, isRealCalendarDate };
