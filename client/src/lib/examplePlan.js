function isoFromToday(offset) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

export const examplePlan = {
  subject: 'Biology',
  examDate: isoFromToday(12),
  tasks: [
    {
      id: 'example-membrane-notes',
      date: isoFromToday(-2),
      topic: 'Cell structure',
      description: 'Read the cell membrane notes and label the diagram.',
      completed: true,
    },
    {
      id: 'example-transport',
      date: isoFromToday(-1),
      topic: 'Cell structure',
      description: 'Answer the practice questions on transport.',
      completed: true,
    },
    {
      id: 'example-diagram-check',
      date: isoFromToday(0),
      topic: 'Cell structure',
      description: 'Check the diagram labels against the textbook.',
      completed: true,
    },
    {
      id: 'example-enzymes',
      date: isoFromToday(0),
      topic: 'Enzymes',
      description: 'Review the factors that affect enzyme activity.',
      completed: false,
    },
    {
      id: 'example-enzymes-paper',
      date: isoFromToday(0),
      topic: 'Enzymes',
      description: 'Complete the past paper questions on enzymes.',
      completed: false,
    },
    {
      id: 'example-respiration',
      date: isoFromToday(1),
      topic: 'Respiration',
      description: 'Summarise aerobic respiration in six points.',
      completed: false,
    },
  ],
};

export const exampleQuiz = {
  topic: 'Cell structure',
  questions: [
    {
      question: 'Which part of the cell controls what enters and leaves?',
      options: ['Cell membrane', 'Nucleus', 'Ribosome', 'Golgi apparatus'],
      answerIndex: 0,
      explanation:
        'The cell membrane is selectively permeable, so it regulates movement into and out of the cell.',
    },
  ],
};

export const exampleFlashcards = {
  topic: 'Cell structure',
  cards: [
    {
      front: 'Mitochondrion',
      back: 'Produces most of the cell ATP through cellular respiration.',
    },
    {
      front: 'Ribosome',
      back: 'Builds proteins from amino acids.',
    },
  ],
};
