export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function tomorrowIso() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

export function parseDateOnly(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatToday() {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDate(value, { weekday = false, year = false } = {}) {
  const date = parseDateOnly(value);

  if (!date) {
    return 'Date not set';
  }

  return date.toLocaleDateString('en-GB', {
    ...(weekday ? { weekday: 'short' } : {}),
    day: 'numeric',
    month: 'short',
    ...(year ? { year: 'numeric' } : {}),
    timeZone: 'UTC',
  });
}

export function daysUntil(value) {
  const target = parseDateOnly(value);
  const start = parseDateOnly(todayIso());

  if (!target || !start) {
    return null;
  }

  return Math.round((target.getTime() - start.getTime()) / 86400000);
}

export function countdownLabel(value) {
  const days = daysUntil(value);

  if (days === null) {
    return 'Exam date not set';
  }

  if (days < 0) {
    return 'Exam date has passed';
  }

  if (days === 0) {
    return 'Exam today';
  }

  if (days === 1) {
    return 'Exam tomorrow';
  }

  return `Exam in ${days} days`;
}

export function examLine(value) {
  const date = formatDate(value, { year: true });
  const days = daysUntil(value);

  if (days === null) {
    return 'Exam date not set';
  }

  if (days < 0) {
    return `Exam was on ${date}`;
  }

  if (days === 0) {
    return `Exam today, ${date}`;
  }

  if (days === 1) {
    return `Exam tomorrow, ${date}`;
  }

  return `Exam in ${days} days, ${date}`;
}

export function plural(count, singular, pluralForm = `${singular}s`) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

export function progressFor(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;

  return {
    total,
    completed,
    percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export function groupTasksByDate(tasks) {
  const groups = new Map();

  for (const task of tasks) {
    const list = groups.get(task.date) || [];
    list.push(task);
    groups.set(task.date, list);
  }

  return Array.from(groups.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, items]) => ({ date, tasks: items }));
}

export function chartDataFor(tasks) {
  return groupTasksByDate(tasks).map(({ date, tasks: items }) => {
    const progress = progressFor(items);

    return {
      date,
      label: formatDate(date),
      completed: progress.completed,
      total: progress.total,
      percentage: progress.percentage,
    };
  });
}

export function currentWeekTasks(tasks) {
  const today = parseDateOnly(todayIso());
  const monday = new Date(today);
  monday.setUTCDate(today.getUTCDate() - ((today.getUTCDay() + 6) % 7));

  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  const start = monday.toISOString().slice(0, 10);
  const end = sunday.toISOString().slice(0, 10);

  return tasks.filter((task) => task.date >= start && task.date <= end);
}

export function isToday(value) {
  return value === todayIso();
}
