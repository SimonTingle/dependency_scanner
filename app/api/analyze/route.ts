import { NextResponse } from 'next/server';
import { Octokit } from 'octokit';
import axios from 'axios';

// A mock delay function to simulate complex analysis for the UI
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: Request) {
  const { owner, repo } = await request.json();

  if (!owner || !repo) {
    return NextResponse.json({ error: 'Missing owner or repo' }, { status: 400 });
  }

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  try {
    // Fetch manifest
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: 'package.json',
    });

    if (!('content' in data) || Array.isArray(data)) throw new Error("File not found");
    const content = Buffer.from(data.content, 'base64').toString();
    const pkgJson = JSON.parse(content);
    const dependencies = { ...pkgJson.dependencies, ...pkgJson.devDependencies };

    const results = [];

    // Limit check to 20 deps to avoid timeouts in this simplified scaffold
    const depsToCheck = Object.entries(dependencies).slice(0, 20);

    for (const [name, versionSpec] of depsToCheck) {
      const current = (versionSpec as string).replace(/[\^~]/g, '');
      
      try {
        const npmRes = await axios.get(`https://registry.npmjs.org/${name}/latest`);
        const latest = npmRes.data.version;

        if (current !== latest) {
          results.push({
            name,
            current,
            latest,
            severity: current.split('.')[0] !== latest.split('.')[0] ? 'Major' : 'Minor',
            link: `https://www.npmjs.com/package/${name}`
          });
        }
      } catch (e) {
        continue;
      }
    }

    // Simulate "Thinking" time for the UI progress bar to feel real
    await delay(1000); 

    return NextResponse.json({ results });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
