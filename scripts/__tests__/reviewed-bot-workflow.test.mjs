import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

const workflow = readFileSync(new URL('../../.github/workflows/sonar-reviewed-bot.yml', import.meta.url), 'utf8');
const block = workflow.split('        run: |\n')[1].split('\n      - uses:')[0];
const script = block.replace(/^          /gm, '');
const sha = 'a'.repeat(40);
const approval = { id: 1, state: 'APPROVED', commit_id: sha, author_association: 'NONE', user: { login: 'maintainer', type: 'User' } };

const mock = `#!/usr/bin/env node
const fixture = JSON.parse(process.env.REVIEW_FIXTURE);
const route = process.argv.find(value => value.startsWith('repos/'));
if (route.endsWith('/reviews')) {
  if (fixture.apiError) process.exit(1);
  console.log(JSON.stringify([fixture.reviews]));
} else if (route.includes('/actions/workflows/')) {
  console.log('12345');
} else {
  console.log(JSON.stringify({state:'open', user:{login:'dependabot[bot]'}, head:{sha:process.env.HEAD_SHA, ref:'dependabot/actions', repo:{full_name:process.env.REPO}}, base:{ref:'main'}}));
}
`;

const cases = [
  ['caller approval with hidden membership', [approval], true],
  ['another reviewer cannot authorize this caller', [{ ...approval, user: { login: 'another-maintainer', type: 'User' }, author_association: 'OWNER' }], false],
  ['comment-only review preserves approval', [approval, { ...approval, id: 2, state: 'COMMENTED' }], true],
  ['requested changes revoke approval', [approval, { ...approval, id: 2, state: 'CHANGES_REQUESTED' }], false],
  ['dismissed approval is rejected', [{ ...approval, state: 'DISMISSED' }], false],
  ['stale revision is rejected', [{ ...approval, commit_id: 'b'.repeat(40) }], false],
  ['missing approval is rejected', [], false],
  ['review API failure is rejected', [approval], false, true],
];

for (const [name, reviews, allowed, apiError = false] of cases) {
  test(name, () => {
    const directory = mkdtempSync(join(tmpdir(), 'reviewed-bot-'));
    try {
      writeFileSync(join(directory, 'gh'), mock, { mode: 0o700 });
      const result = spawnSync('bash', ['-c', script], {
        encoding: 'utf8',
        env: {
          ...process.env,
          PATH: `${directory}:${process.env.PATH}`,
          REVIEW_FIXTURE: JSON.stringify({ reviews, apiError }),
          REPO: 'kadupulhq/website', PR_NUMBER: '70', HEAD_SHA: sha,
          REVIEWER: 'maintainer', RUNNER_TEMP: directory,
          GITHUB_OUTPUT: join(directory, 'outputs'),
        },
      });
      assert.equal(result.error, undefined);
      assert.equal(typeof result.status, 'number');
      assert.equal(result.status === 0, allowed, result.stderr);
      if (allowed) assert.match(readFileSync(join(directory, 'outputs'), 'utf8'), /run_id=12345/);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
}
