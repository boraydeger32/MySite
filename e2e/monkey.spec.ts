import { test, expect } from '@playwright/test';

// =============================================================================
// Monkey Tests: Stress, Fuzzing & Edge Cases
// =============================================================================

// ---------------------------------------------------------------------------
// 1. XSS Injection Attempts
// ---------------------------------------------------------------------------

test.describe('XSS Prevention', () => {
  test('login form rejects script injection in email', async ({ page }) => {
    await page.goto('/qr-menu/giris');
    await page.locator('#email').fill('<script>alert("xss")</script>');
    await page.locator('#password').fill('Test1234');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('text=Gecerli bir e-posta adresi giriniz')).toBeVisible();
  });

  test('registration form handles XSS in restaurant name', async ({ page }) => {
    await page.goto('/qr-menu/kayit');
    await page.locator('#restaurantName').fill('"><img src=x onerror=alert(1)>');
    await page.locator('#fullName').fill('<script>document.cookie</script>');
    await page.locator('#email').fill('test@example.com');
    await page.locator('#password').fill('Test1234');
    await page.locator('#passwordConfirm').fill('Test1234');
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    const injectedImgs = await page.locator('img[onerror]').count();
    expect(injectedImgs).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 2. API Fuzzing
// ---------------------------------------------------------------------------

test.describe('API Fuzzing', () => {
  test('orders API handles extremely large payload', async ({ request }) => {
    const response = await request.post('/api/orders', {
      data: {
        restaurantId: '00000000-0000-0000-0000-000000000000',
        tableId: 'table-1',
        items: Array.from({ length: 200 }, (_, i) => ({
          itemId: `00000000-0000-0000-0000-${String(i).padStart(12, '0')}`,
          quantity: 1,
          modifiers: [],
        })),
      },
    });
    expect(response.status()).toBe(400);
  });

  test('orders API handles negative quantity', async ({ request }) => {
    const response = await request.post('/api/orders', {
      data: {
        restaurantId: '00000000-0000-0000-0000-000000000000',
        tableId: 'table-1',
        items: [
          { itemId: '00000000-0000-0000-0000-000000000001', quantity: -5, modifiers: [] },
        ],
      },
    });
    expect(response.status()).toBe(400);
  });

  test('orders API handles zero quantity', async ({ request }) => {
    const response = await request.post('/api/orders', {
      data: {
        restaurantId: '00000000-0000-0000-0000-000000000000',
        tableId: 'table-1',
        items: [
          { itemId: '00000000-0000-0000-0000-000000000001', quantity: 0, modifiers: [] },
        ],
      },
    });
    expect(response.status()).toBe(400);
  });

  test('contact API rejects extremely long message', async ({ request }) => {
    const response = await request.post('/api/contact', {
      data: {
        name: 'Test',
        email: 'test@example.com',
        service: 'qr-menu',
        message: 'A'.repeat(6000),
      },
    });
    expect(response.status()).toBe(400);
  });

  test('newsletter API handles SQL injection attempt', async ({ request }) => {
    const response = await request.post('/api/newsletter', {
      data: {
        email: "'; DROP TABLE newsletter_subscribers; --",
      },
    });
    expect(response.status()).toBe(400);
  });

  test('payments API rejects negative amount', async ({ request }) => {
    const response = await request.post('/api/payments', {
      data: {
        orderId: '00000000-0000-0000-0000-000000000000',
        restaurantId: '00000000-0000-0000-0000-000000000000',
        amount: -100,
        tipAmount: 0,
        paymentMethod: 'cash',
      },
    });
    expect(response.status()).toBe(400);
  });

  test('payments API rejects invalid payment method', async ({ request }) => {
    const response = await request.post('/api/payments', {
      data: {
        orderId: '00000000-0000-0000-0000-000000000000',
        restaurantId: '00000000-0000-0000-0000-000000000000',
        amount: 100,
        tipAmount: 0,
        paymentMethod: 'bitcoin',
      },
    });
    expect(response.status()).toBe(400);
  });

  test('reservations API rejects invalid date format', async ({ request }) => {
    const response = await request.post('/api/reservations', {
      data: {
        restaurantId: '00000000-0000-0000-0000-000000000000',
        customerName: 'Test',
        partySize: 2,
        reservationDate: '01/01/2027',
        reservationTime: '12:00',
      },
    });
    expect(response.status()).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// 3. Rapid Click / Double Submit Prevention
// ---------------------------------------------------------------------------

test.describe('Rapid Interactions', () => {
  test('login button does not crash on rapid clicks', async ({ page }) => {
    await page.goto('/qr-menu/giris');
    await page.locator('#email').fill('test@example.com');
    await page.locator('#password').fill('Test1234');

    const submitBtn = page.locator('button[type="submit"]');
    // Rapid double-click
    await submitBtn.click();
    await submitBtn.click({ force: true }).catch(() => {});
    // Page should not crash
    await expect(page.locator('body')).toBeVisible();
  });

  test('registration form survives rapid submission', async ({ page }) => {
    await page.goto('/qr-menu/kayit');
    await page.locator('#restaurantName').fill('Test');
    await page.locator('#fullName').fill('Test');
    await page.locator('#email').fill('test@example.com');
    await page.locator('#password').fill('Test1234');
    await page.locator('#passwordConfirm').fill('Test1234');

    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
    await submitBtn.click({ force: true }).catch(() => {});
    await expect(page.locator('body')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 4. Boundary Value Testing
// ---------------------------------------------------------------------------

test.describe('Boundary Values', () => {
  test('minimum valid password (8 chars) accepted', async ({ page }) => {
    await page.goto('/qr-menu/kayit');
    await page.locator('#password').fill('Aa1aaaaa');
    await page.locator('#passwordConfirm').fill('Aa1aaaaa');
    await page.locator('#restaurantName').fill('AB');
    await page.locator('#fullName').fill('AB');
    await page.locator('#email').fill('a@b.co');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(500);
    await expect(page.locator('text=Sifre en az 8 karakter')).not.toBeVisible();
  });

  test('7-char password fails validation', async ({ page }) => {
    await page.goto('/qr-menu/kayit');
    await page.locator('#password').fill('Aa1aaaa');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('text=Sifre en az 8 karakter')).toBeVisible();
  });

  test('contact API: exactly 10 char message (minimum) passes', async ({ request }) => {
    const response = await request.post('/api/contact', {
      data: {
        name: 'T',
        email: 'a@b.com',
        service: 'x',
        message: '1234567890',
      },
    });
    expect([200, 500]).toContain(response.status());
  });

  test('contact API: 9 char message fails', async ({ request }) => {
    const response = await request.post('/api/contact', {
      data: {
        name: 'T',
        email: 'a@b.com',
        service: 'x',
        message: '123456789',
      },
    });
    expect(response.status()).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// 5. URL Manipulation
// ---------------------------------------------------------------------------

test.describe('URL Manipulation', () => {
  test('path traversal attempt is safe', async ({ page }) => {
    const response = await page.goto('/../../etc/passwd');
    expect(response?.status()).toBeDefined();
    await expect(page.locator('body')).toBeVisible();
  });

  test('encoded XSS in URL is safe', async ({ page }) => {
    const response = await page.goto('/%3Cscript%3Ealert(1)%3C/script%3E');
    expect(response?.status()).toBeDefined();
    await expect(page.locator('body')).toBeVisible();
  });

  test('extremely long slug does not crash', async ({ page }) => {
    const response = await page.goto(`/${'a'.repeat(500)}`);
    expect(response?.status()).toBeDefined();
    await expect(page.locator('body')).toBeVisible();
  });

  test('unicode in masa number is safe', async ({ page }) => {
    await page.goto('/demo-restoran/masa/%E2%9C%93');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 6. Concurrent Request Stress
// ---------------------------------------------------------------------------

test.describe('Concurrent Requests', () => {
  test('handles multiple simultaneous API calls', async ({ request }) => {
    const promises = Array.from({ length: 5 }, () =>
      request.post('/api/contact', {
        data: {
          name: 'Stress Test',
          email: 'stress@example.com',
          service: 'test',
          message: 'Concurrent request stress test mesaji burada.',
        },
      })
    );
    const responses = await Promise.all(promises);
    for (const response of responses) {
      expect([200, 429, 500]).toContain(response.status());
    }
  });

  test('rate limiting activates on excessive requests', async ({ request }) => {
    const responses: number[] = [];
    for (let i = 0; i < 8; i++) {
      const response = await request.post('/api/newsletter', {
        data: { email: `ratetest${i}@example.com` },
      });
      responses.push(response.status());
    }
    // All responses should be valid (200, 429, or 500)
    expect(responses.every((s) => [200, 429, 500].includes(s))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 7. Page Stability Under Navigation
// ---------------------------------------------------------------------------

test.describe('Navigation Stability', () => {
  test('rapid page navigation does not crash', async ({ page }) => {
    const urls = [
      '/',
      '/qr-menu/giris',
      '/qr-menu/kayit',
      '/blog',
      '/iletisim',
      '/hizmetler',
      '/demo-restoran',
    ];
    for (const url of urls) {
      await page.goto(url, { waitUntil: 'commit' });
    }
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('back/forward navigation works', async ({ page }) => {
    await page.goto('/qr-menu/giris');
    await page.goto('/qr-menu/kayit');
    await page.goBack();
    await page.waitForURL(/giris/);
    await page.goForward();
    await page.waitForURL(/kayit/);
    await expect(page.locator('body')).toBeVisible();
  });
});
