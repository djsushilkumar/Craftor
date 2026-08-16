# Example: Automated Snapshot Rollback Verification Test

```typescript
import { test, expect } from '@playwright/test';

test('verify transactional snapshot rollback restores exact pre-mutation state', async ({ request }) => {
  // 1. Fetch baseline content
  const initialRes = await request.get('http://localhost:8080/wp-json/craftor/v1/posts/42');
  const initialData = await initialRes.json();

  // 2. Perform intentional destructive mutation
  const mutateRes = await request.post('http://localhost:8080/wp-json/craftor/v1/posts/42', {
    data: { title: 'DESTRUCTIVE_TITLE_OVERWRITE' }
  });
  const mutateJson = await mutateRes.json();
  const snapshotId = mutateJson.snapshot_id;
  expect(snapshotId).toBeTruthy();

  // 3. Trigger Rollback
  const rollbackRes = await request.post(`http://localhost:8080/wp-json/craftor/v1/snapshots/${snapshotId}/restore`);
  expect(rollbackRes.status()).toBe(200);

  // 4. Assert exact original state restored
  const restoredRes = await request.get('http://localhost:8080/wp-json/craftor/v1/posts/42');
  const restoredData = await restoredRes.json();
  expect(restoredData.title).toBe(initialData.title);
});
```
