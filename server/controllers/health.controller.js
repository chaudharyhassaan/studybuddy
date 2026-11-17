// The health check is public, so it reports only that the API is answering.
// Environment and database state stay in server logs.
function getHealth(req, res) {
  res.status(200).json({
    status: 'ok',
  });
}

module.exports = { getHealth };
