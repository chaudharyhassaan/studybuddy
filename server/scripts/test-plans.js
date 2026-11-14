const BASE_URL = process.env.API_URL || 'http://localhost:5000';
const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const password = 'StudyBuddy123!';
const userA = {
  name: 'Plan Test A',
  email: `plan-test-a-${stamp}@example.com`,
  password,
};
const userB = {
  name: 'Plan Test B',
  email: `plan-test-b-${stamp}@example.com`,
  password,
};

let failures = 0;

function report(name, passed, detail) {
  console.log(`${passed ? 'PASS' : 'FAIL'}  ${name}${detail ? ` (${detail})` : ''}`);
  if (!passed) {
    failures += 1;
  }
}

function dateOffset(days) {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

async function call(path, options = {}) {
  const headers = {};

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  return { status: response.status, data };
}

async function main() {
  console.log(`Testing plans against ${BASE_URL}`);
  console.log(`Test accounts: ${userA.email} and ${userB.email}`);
  console.log('');

  const registerA = await call('/api/auth/register', { method: 'POST', body: userA });
  report('register user A returns 201', registerA.status === 201, `status ${registerA.status}`);
  const tokenA = registerA.data?.token;

  const registerB = await call('/api/auth/register', { method: 'POST', body: userB });
  report('register user B returns 201', registerB.status === 201, `status ${registerB.status}`);
  const tokenB = registerB.data?.token;

  if (!tokenA || !tokenB) {
    console.log('Cannot continue without both tokens.');
    process.exit(1);
  }

  const anonymousCreate = await call('/api/plans', {
    method: 'POST',
    body: { subject: 'Biology', examDate: dateOffset(10), hoursPerDay: 2, topics: ['Cells'] },
  });
  report('create without a token returns 401', anonymousCreate.status === 401, `status ${anonymousCreate.status}`);

  const payload = {
    subject: 'Biology',
    examDate: dateOffset(10),
    hoursPerDay: 2,
    topics: ['Cell structure', 'Photosynthesis', 'Genetics', 'Ecosystems'],
  };

  console.log('');
  console.log('Generating a plan with Gemini. This can take up to a minute.');
  console.log('');

  const create = await call('/api/plans', { method: 'POST', body: payload, token: tokenA });
  report('create plan returns 201', create.status === 201, `status ${create.status}`);

  if (create.status !== 201) {
    console.log('Response:', JSON.stringify(create.data));
    console.log(`${failures} check(s) failed.`);
    process.exit(1);
  }

  const plan = create.data?.plan;
  const createdTasks = Array.isArray(create.data?.tasks) ? create.data.tasks : [];
  report('create returns a plan id', typeof plan?.id === 'string' && plan.id.length > 0);
  report('create returns tasks', createdTasks.length > 0, `${createdTasks.length} tasks`);
  report(
    'task dates stay inside the plan window',
    createdTasks.every((task) => task.date >= dateOffset(0) && task.date <= payload.examDate)
  );
  report(
    'task topics come from the plan',
    createdTasks.every((task) => payload.topics.includes(task.topic))
  );
  report(
    'tasks are in date order',
    createdTasks.every((task, index) => index === 0 || createdTasks[index - 1].date <= task.date)
  );
  report('tasks start incomplete', createdTasks.every((task) => task.completed === false));

  const list = await call('/api/plans', { token: tokenA });
  report('list plans returns 200', list.status === 200, `status ${list.status}`);
  report('list includes the new plan', (list.data?.plans || []).some((item) => item.id === plan.id));

  const detail = await call(`/api/plans/${plan.id}`, { token: tokenA });
  report('get own plan returns 200', detail.status === 200, `status ${detail.status}`);
  report(
    'get own plan returns the same task count',
    (detail.data?.tasks || []).length === createdTasks.length,
    `${(detail.data?.tasks || []).length} tasks`
  );

  const otherUserDetail = await call(`/api/plans/${plan.id}`, { token: tokenB });
  report('other user gets 404', otherUserDetail.status === 404, `status ${otherUserDetail.status}`);

  const otherUserDelete = await call(`/api/plans/${plan.id}`, { method: 'DELETE', token: tokenB });
  report('other user cannot delete', otherUserDelete.status === 404, `status ${otherUserDelete.status}`);

  const pastDate = await call('/api/plans', {
    method: 'POST',
    token: tokenA,
    body: { ...payload, examDate: dateOffset(-1) },
  });
  report('past exam date returns 400', pastDate.status === 400, `status ${pastDate.status}`);

  const tooManyTopics = await call('/api/plans', {
    method: 'POST',
    token: tokenA,
    body: {
      ...payload,
      topics: Array.from({ length: 21 }, (_, index) => `Topic ${index + 1}`),
    },
  });
  report('21 topics returns 400', tooManyTopics.status === 400, `status ${tooManyTopics.status}`);

  const tooFewHours = await call('/api/plans', {
    method: 'POST',
    token: tokenA,
    body: { ...payload, hoursPerDay: 0.25 },
  });
  report('0.25 hours returns 400', tooFewHours.status === 400, `status ${tooFewHours.status}`);

  const remove = await call(`/api/plans/${plan.id}`, { method: 'DELETE', token: tokenA });
  report('owner delete returns 204', remove.status === 204, `status ${remove.status}`);

  const afterDelete = await call(`/api/plans/${plan.id}`, { token: tokenA });
  report('deleted plan returns 404', afterDelete.status === 404, `status ${afterDelete.status}`);

  const listAfterDelete = await call('/api/plans', { token: tokenA });
  report(
    'deleted plan leaves the list',
    !(listAfterDelete.data?.plans || []).some((item) => item.id === plan.id)
  );

  console.log('');

  if (failures > 0) {
    console.log(`${failures} check(s) failed.`);
    process.exit(1);
  }

  console.log('All plan checks passed.');
}

main().catch((error) => {
  console.error('Test script failed:', error.message);
  process.exit(1);
});
