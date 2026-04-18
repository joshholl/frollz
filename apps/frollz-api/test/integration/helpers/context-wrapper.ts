import { RequestContext } from '../../../src/common/utils/request-context';

export function runWithContext<T>(fn: () => Promise<T>) {
  return RequestContext.run(fn);
}

/** use like 
 * 
 * 
 * it('creates user transactionally', async () => {
  await runWithContext(async () => {
    await service.createUser(...);
  });
});

 */