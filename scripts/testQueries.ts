import 'dotenv/config';
import fetch from 'node-fetch';

const endpoint = process.env.GRAPHQL_ENDPOINT || 'http://127.0.0.1:5000/graphql';
const apiKey = process.env.API_KEY;

async function runQuery(name: string, query: string, token?: string): Promise<void> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query }),
  });

  const body = await response.json();
  console.log(`\n=== ${name} ===`);
  console.log(JSON.stringify(body, null, 2));
}

async function run(): Promise<void> {
  await runQuery(
    'Public projects query',
    `
    query {
      projects(take: 5) {
        id
        name
        eventId
      }
    }
    `,
  );

  if (!apiKey) {
    console.log('\nNo API_KEY set; skipping authenticated query.');
    return;
  }

  await runQuery(
    'Authenticated metadata query',
    `
    query {
      projects(where: { event: "event-test-2025" }, take: 1) {
        id
        name
        metadata {
          key
          value
          visibility
        }
      }
    }
    `,
    apiKey,
  );
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
