import { NextResponse } from 'next/server';
import { Octokit } from 'octokit';
import axios from 'axios';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: Request) {
  const { owner, repo } = await request.json();
  const token = process.env.GITHUB_TOKEN;
  
  if (!token || token.includes('REPLACE_ME')) {
    return NextResponse.json({ error: 'GitHub Token missing' }, { status: 401 });
  }

  const octokit = new Octokit({ auth: token });
  
  try {
    // 1. INTELLIGENT MANIFEST DETECTION
    // We check for ALL these files.
    const fileChecks = [
      { path: 'package.json', type: 'node' },
      { path: 'go.mod', type: 'go' },
      { path: 'pom.xml', type: 'maven' },         // NEW: Java Maven
      { path: 'build.gradle', type: 'gradle' },   // NEW: Java Gradle
      { path: 'build.gradle.kts', type: 'gradle' }, // NEW: Kotlin Gradle
      { path: 'requirements.txt', type: 'python-txt' },
      { path: 'pyproject.toml', type: 'python-toml' },
      { path: 'Cargo.toml', type: 'rust' },
      { path: 'composer.json', type: 'php' },
      { path: 'Gemfile', type: 'ruby' }
    ];

    let manifestContent = '';
    let ecosystem = '';

    for (const check of fileChecks) {
      try {
        const { data } = await octokit.rest.repos.getContent({ owner, repo, path: check.path });
        if ('content' in data && !Array.isArray(data)) {
          manifestContent = Buffer.from(data.content, 'base64').toString();
          ecosystem = check.type;
          break; 
        }
      } catch (e) { continue; }
    }

    if (!ecosystem) {
      // Fallback: Check if it's a monorepo by looking in a 'lib' or 'app' folder?
      // For now, return a specific error so the UI knows.
      return NextResponse.json({ error: `No manifest found in root. Monorepo detection not enabled.` }, { status: 404 });
    }

    // 2. PARSERS
    const depsToCheck: { name: string, current: string, type: string }[] = [];

    // --- NODE ---
    if (ecosystem === 'node') {
      try {
        const json = JSON.parse(manifestContent);
        const all = { ...json.dependencies, ...json.devDependencies };
        Object.entries(all).slice(0, 15).forEach(([k, v]) => {
          depsToCheck.push({ name: k, current: (v as string).replace(/[\^~]/g, ''), type: 'npm' });
        });
      } catch(e) {}
    }

    // --- JAVA (MAVEN) ---
    else if (ecosystem === 'maven') {
      // Simple Regex for XML <dependency> blocks
      const regex = /<groupId>([^<]+)<\/groupId>\s*<artifactId>([^<]+)<\/artifactId>\s*<version>([^<]+)<\/version>/g;
      let match;
      while ((match = regex.exec(manifestContent)) !== null) {
        if (depsToCheck.length >= 15) break;
        // Construct name as "group:artifact"
        depsToCheck.push({ name: `${match[1]}:${match[2]}`, current: match[3], type: 'maven' });
      }
    }

    // --- JAVA (GRADLE) ---
    else if (ecosystem === 'gradle') {
      // Looks for: implementation 'group:name:version' OR implementation("group:name:version")
      const regex = /(?:implementation|api|compileOnly)\s*\(?['"]([^:]+):([^:]+):([^'"]+)['"]\)?/g;
      let match;
      while ((match = regex.exec(manifestContent)) !== null) {
        if (depsToCheck.length >= 15) break;
        depsToCheck.push({ name: `${match[1]}:${match[2]}`, current: match[3], type: 'maven' });
      }
    }

    // --- GO (Fixed for Pulumi) ---
    else if (ecosystem === 'go') {
      // More permissible regex: looks for "package v1.2.3" anywhere in the line
      // Ignores 'indirect' comments
      const regex = /^\s*([a-zA-Z0-9.\/-]+)\s+v([0-9.]+)(?:\+incompatible)?/gm;
      let match;
      while ((match = regex.exec(manifestContent)) !== null) {
        if (depsToCheck.length >= 15) break;
        depsToCheck.push({ name: match[1], current: match[2], type: 'go' });
      }
    }

    // --- PYTHON (TOML) ---
    else if (ecosystem === 'python-toml') {
      const regex = /"?([a-zA-Z0-9-_]+)"?\s*=\s*"(?:[\^~=]=?)?([0-9.]+)"/g;
      let match;
      while ((match = regex.exec(manifestContent)) !== null) {
        if (depsToCheck.length >= 15) break;
        depsToCheck.push({ name: match[1], current: match[2], type: 'pypi' });
      }
    }
    
    // --- PYTHON (TXT) ---
    else if (ecosystem === 'python-txt') {
        manifestContent.split('\n').forEach(line => {
        if (line.includes('==')) {
            const [name, version] = line.split('==');
            depsToCheck.push({ name: name.trim(), current: version.trim(), type: 'pypi' });
        }
        });
    }

    // --- RUST ---
    else if (ecosystem === 'rust') {
      const regex = /^([a-zA-Z0-9-_]+)\s*=\s*"(?:[\^~])?([0-9.]+)"/gm;
      let match;
      while ((match = regex.exec(manifestContent)) !== null) {
        if (depsToCheck.length >= 15) break;
        depsToCheck.push({ name: match[1], current: match[2], type: 'crate' });
      }
    }

    // 3. CHECK REGISTRIES
    const results = [];
    for (const dep of depsToCheck) {
      try {
        let latest = '';
        let url = '';

        if (dep.type === 'npm') {
          const res = await axios.get(`https://registry.npmjs.org/${dep.name}/latest`);
          latest = res.data.version;
          url = `https://www.npmjs.com/package/${dep.name}`;
        } 
        else if (dep.type === 'pypi') {
          const res = await axios.get(`https://pypi.org/pypi/${dep.name}/json`);
          latest = res.data.info.version;
          url = `https://pypi.org/project/${dep.name}`;
        }
        else if (dep.type === 'maven') {
          // Check Maven Central
          const [group, artifact] = dep.name.split(':');
          const res = await axios.get(`https://search.maven.org/solrsearch/select?q=g:"${group}"+AND+a:"${artifact}"&rows=1&wt=json`);
          latest = res.data.response.docs[0].latestVersion;
          url = `https://mvnrepository.com/artifact/${group}/${artifact}`;
        }
        else if (dep.type === 'crate') {
            const res = await axios.get(`https://crates.io/api/v1/crates/${dep.name}`, { headers: { 'User-Agent': 'DepTrawl' } });
            latest = res.data.crate.max_version;
            url = `https://crates.io/crates/${dep.name}`;
        }
        // Skip Go remote check for now (requires complex proxy)

        if (latest && dep.current !== latest) {
           const isMajor = dep.current.split('.')[0] !== latest.split('.')[0];
           results.push({
             name: dep.name,
             current: dep.current,
             latest,
             severity: isMajor ? 'Major' : 'Minor',
             link: url
           });
        }
      } catch (e) { continue; }
    }

    await delay(500);
    return NextResponse.json({ results });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}