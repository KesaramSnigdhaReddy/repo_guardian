const BASE_URL = "http://localhost:8000";

export async function getDashboard() {
  const res = await fetch(`${BASE_URL}/api/dashboard`);
  return res.json();
}

export async function getUsers() {
  const res = await fetch(`${BASE_URL}/api/users`);
  return res.json();
}

export async function getPRs() {
  const res = await fetch(`${BASE_URL}/api/prs`);
  return res.json();
}

export async function getReport(prId) {
  return `${BASE_URL}/api/report/${prId}`;
}

export const getAgentStatus = () =>
  fetch(`${BASE_URL}/api/agent-status`).then((r) => r.json());

export const getGitReport = (repo) =>
  `${BASE_URL}/api/git-report?repo=${repo}`;