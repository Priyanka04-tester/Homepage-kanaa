const { test, expect } = require('@playwright/test');

const SAMPLE_SKUS = [
  '5412581531JSM100001',
  '5412581531JSM100005',
  '5312241441JBB100035',
];

const SORT = encodeURIComponent(JSON.stringify({ position: 'ASC' }));

test.describe('PLP products API', () => {
  test('returns products for a known SKU filter', async ({ request, baseURL }) => {
    const filter = encodeURIComponent(JSON.stringify({ sku: { in: SAMPLE_SKUS } }));
    const url = `${baseURL}/api/plp-products/?locale=en-sa&pageSize=12&currentPage=1&sort=${SORT}&filter=${filter}`;

    const res = await request.get(url);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.data.totalCount).toBeGreaterThan(0);
    expect(body.data.data.length).toBeGreaterThan(0);
  });

  test('requires pageSize, currentPage, sort and filter', async ({ request, baseURL }) => {
    const res = await request.get(`${baseURL}/api/plp-products/?locale=en-sa`);
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/pageSize, currentPage, sort, and filter are required/);
  });

  test('rejects gracefully when given a malformed filter', async ({ request, baseURL }) => {
    const url = `${baseURL}/api/plp-products/?locale=en-sa&pageSize=12&currentPage=1&sort=${SORT}&filter=not-json`;
    const res = await request.get(url);
    // A well-behaved API should not 5xx on bad input.
    expect(res.status()).toBeLessThan(500);
  });

  test('pagination params are honored', async ({ request, baseURL }) => {
    const filter = encodeURIComponent(JSON.stringify({ sku: { in: SAMPLE_SKUS } }));
    const url = `${baseURL}/api/plp-products/?locale=en-sa&pageSize=1&currentPage=1&sort=${SORT}&filter=${filter}`;
    const res = await request.get(url);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.data.length).toBeLessThanOrEqual(1);
  });
});
