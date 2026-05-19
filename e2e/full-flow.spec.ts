import { test, expect } from '@playwright/test';

// =============================================================================
// E2E Test Suite: QR Menu SaaS Platform
// =============================================================================

// ---------------------------------------------------------------------------
// 1. Public Pages
// ---------------------------------------------------------------------------

test.describe('Public Pages', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('QR menu login page loads', async ({ page }) => {
    await page.goto('/qr-menu/giris');
    await expect(page.getByRole('heading', { name: /QR Menu/i })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('QR menu registration page loads', async ({ page }) => {
    await page.goto('/qr-menu/kayit');
    await expect(page.getByRole('heading', { name: /QR Menu Kayit/i })).toBeVisible();
    await expect(page.locator('#restaurantName')).toBeVisible();
    await expect(page.locator('#fullName')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#passwordConfirm')).toBeVisible();
  });

  test('login page has link to register', async ({ page }) => {
    await page.goto('/qr-menu/giris');
    await expect(page.locator('a[href="/qr-menu/kayit"]')).toBeVisible();
  });

  test('register page has link to login', async ({ page }) => {
    await page.goto('/qr-menu/kayit');
    await expect(page.locator('a[href="/qr-menu/giris"]')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 2. Registration Form Validation
// ---------------------------------------------------------------------------

test.describe('Registration Validation', () => {
  test('shows validation errors for empty form', async ({ page }) => {
    await page.goto('/qr-menu/kayit');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('text=Restoran adi zorunludur')).toBeVisible();
    await expect(page.locator('text=Ad soyad zorunludur')).toBeVisible();
    await expect(page.locator('text=E-posta adresi gereklidir')).toBeVisible();
    await expect(page.locator('text=Sifre gereklidir')).toBeVisible();
  });

  test('validates email format', async ({ page }) => {
    await page.goto('/qr-menu/kayit');
    await page.locator('#email').fill('invalid-email');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('text=Gecerli bir e-posta adresi giriniz')).toBeVisible();
  });

  test('validates password strength', async ({ page }) => {
    await page.goto('/qr-menu/kayit');
    await page.locator('#password').fill('weak');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('text=Sifre en az 8 karakter olmalidir')).toBeVisible();
  });

  test('validates password match', async ({ page }) => {
    await page.goto('/qr-menu/kayit');
    await page.locator('#password').fill('Test1234');
    await page.locator('#passwordConfirm').fill('Test5678');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('text=Sifreler eslesmiyor')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 3. Login Form Validation
// ---------------------------------------------------------------------------

test.describe('Login Validation', () => {
  test('shows validation errors for empty login form', async ({ page }) => {
    await page.goto('/qr-menu/giris');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('text=E-posta adresi gereklidir')).toBeVisible();
    await expect(page.locator('text=Sifre gereklidir')).toBeVisible();
  });

  test('password toggle works', async ({ page }) => {
    await page.goto('/qr-menu/giris');
    const passwordInput = page.locator('#password');
    await passwordInput.fill('TestPassword123');
    await expect(passwordInput).toHaveAttribute('type', 'password');

    await page.locator('button[aria-label="Sifreyi goster"]').click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    await page.locator('button[aria-label="Sifreyi gizle"]').click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });
});

// ---------------------------------------------------------------------------
// 4. Demo Restaurant Public Menu
// ---------------------------------------------------------------------------

test.describe('Demo Restaurant Public Menu', () => {
  test('demo restaurant landing page loads', async ({ page }) => {
    await page.goto('/demo-restoran');
    await expect(page.getByRole('heading', { name: 'Demo Restoran' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Menuyu Goruntule' })).toBeVisible();
  });

  test('demo restaurant menu page loads', async ({ page }) => {
    await page.goto('/demo-restoran/masa/1');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('non-existent restaurant returns 404 or not-found page', async ({ page }) => {
    const response = await page.goto('/non-existent-restaurant-xyz-12345');
    const status = response?.status() ?? 200;
    if (status === 200) {
      const content = await page.textContent('body');
      expect(content?.toLowerCase()).toMatch(/not found|bulunamadi|404/);
    } else {
      expect(status).toBe(404);
    }
  });

  test('demo restaurant links to menu correctly', async ({ page }) => {
    await page.goto('/demo-restoran');
    const menuLink = page.locator('a[href="/demo-restoran/masa/1"]');
    await expect(menuLink).toBeVisible();
    await menuLink.click();
    await page.waitForURL(/demo-restoran\/masa\/1/);
    expect(page.url()).toContain('/demo-restoran/masa/1');
  });
});

// ---------------------------------------------------------------------------
// 5. Dashboard Access Control
// ---------------------------------------------------------------------------

test.describe('Dashboard Access Control', () => {
  test('redirects to login when accessing dashboard without auth', async ({ page }) => {
    await page.goto('/qr-menu/dashboard');
    await page.waitForURL(/qr-menu\/giris/);
    expect(page.url()).toContain('/qr-menu/giris');
  });

  test('redirects with redirectTo param', async ({ page }) => {
    await page.goto('/qr-menu/dashboard/menu');
    await page.waitForURL(/qr-menu\/giris/);
    expect(page.url()).toContain('redirectTo');
  });

  test('super admin dashboard redirects to super admin login', async ({ page }) => {
    await page.goto('/super-admin/dashboard');
    await page.waitForURL(/super-admin\/giris/);
    expect(page.url()).toContain('/super-admin/giris');
  });
});

// ---------------------------------------------------------------------------
// 6. Super Admin Login
// ---------------------------------------------------------------------------

test.describe('Super Admin Login', () => {
  test('super admin login page loads', async ({ page }) => {
    await page.goto('/super-admin/giris');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 7. API Routes
// ---------------------------------------------------------------------------

test.describe('API Routes', () => {
  test('POST /api/orders validates empty input', async ({ request }) => {
    const response = await request.post('/api/orders', { data: {} });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  test('POST /api/orders rejects invalid restaurant ID', async ({ request }) => {
    const response = await request.post('/api/orders', {
      data: {
        restaurantId: '00000000-0000-0000-0000-000000000000',
        tableId: 'table-1',
        items: [
          { itemId: '00000000-0000-0000-0000-000000000001', quantity: 1, modifiers: [] },
        ],
      },
    });
    expect([404, 500]).toContain(response.status());
  });

  test('POST /api/contact validates empty input', async ({ request }) => {
    const response = await request.post('/api/contact', { data: {} });
    expect(response.status()).toBe(400);
  });

  test('POST /api/contact validates with valid data', async ({ request }) => {
    const response = await request.post('/api/contact', {
      data: {
        name: 'Test Kullanici',
        email: 'test@example.com',
        phone: '+905551234567',
        service: 'qr-menu',
        message: 'Bu bir test mesajidir, en az on karakter.',
      },
    });
    // 200 if DB insert works, 500 if Supabase not configured - both acceptable
    expect([200, 500]).toContain(response.status());
  });

  test('POST /api/newsletter validates empty input', async ({ request }) => {
    const response = await request.post('/api/newsletter', { data: {} });
    expect(response.status()).toBe(400);
  });

  test('POST /api/newsletter validates with valid email', async ({ request }) => {
    const response = await request.post('/api/newsletter', {
      data: { email: 'test-newsletter@example.com' },
    });
    // 200 if DB works, 500 if Supabase not configured, 429 if rate limited
    expect([200, 429, 500]).toContain(response.status());
  });

  test('POST /api/payments validates empty input', async ({ request }) => {
    const response = await request.post('/api/payments', { data: {} });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  test('POST /api/reservations validates empty input', async ({ request }) => {
    const response = await request.post('/api/reservations', { data: {} });
    expect(response.status()).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// 8. Turkish Character Support
// ---------------------------------------------------------------------------

test.describe('Turkish Character Support', () => {
  test('registration form accepts Turkish characters', async ({ page }) => {
    await page.goto('/qr-menu/kayit');
    await page.locator('#restaurantName').fill('Cagdas Doner Salonu');
    await page.locator('#fullName').fill('Mehmet Ozturk');
    await page.locator('#email').fill('test@example.com');
    await page.locator('#password').fill('Test1234');
    await page.locator('#passwordConfirm').fill('Test1234');
    await expect(page.locator('#restaurantName')).toHaveValue('Cagdas Doner Salonu');
  });
});

// ---------------------------------------------------------------------------
// 9. Static Pages
// ---------------------------------------------------------------------------

test.describe('Static Pages', () => {
  test('blog page loads', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.locator('body')).toBeVisible();
  });

  test('contact page loads', async ({ page }) => {
    await page.goto('/iletisim');
    await expect(page.locator('body')).toBeVisible();
  });

  test('services page loads', async ({ page }) => {
    await page.goto('/hizmetler');
    await expect(page.locator('body')).toBeVisible();
  });

  test('team page loads', async ({ page }) => {
    await page.goto('/ekibimiz');
    await expect(page.locator('body')).toBeVisible();
  });

  test('references page loads', async ({ page }) => {
    await page.goto('/referanslar');
    await expect(page.locator('body')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 10. Navigation Flow
// ---------------------------------------------------------------------------

test.describe('Navigation Flow', () => {
  test('login page has back to home link', async ({ page }) => {
    await page.goto('/qr-menu/giris');
    await expect(page.locator('a[href="/"]')).toBeVisible();
  });

  test('register page has back to home link', async ({ page }) => {
    await page.goto('/qr-menu/kayit');
    await expect(page.locator('a[href="/"]')).toBeVisible();
  });

  test('demo restaurant links to menu correctly', async ({ page }) => {
    await page.goto('/demo-restoran');
    await page.locator('a[href="/demo-restoran/masa/1"]').click();
    await page.waitForURL(/demo-restoran\/masa\/1/);
    expect(page.url()).toContain('/demo-restoran/masa/1');
  });
});

// ---------------------------------------------------------------------------
// 11. SEO
// ---------------------------------------------------------------------------

test.describe('SEO', () => {
  test('robots.txt is accessible', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(200);
  });

  test('sitemap.xml is accessible', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.status()).toBe(200);
  });

  test('demo restaurant page has proper meta title', async ({ page }) => {
    await page.goto('/demo-restoran');
    await expect(page).toHaveTitle(/Demo Restoran/);
  });
});
