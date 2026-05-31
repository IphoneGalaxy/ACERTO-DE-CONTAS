/**
 * Smoke: criar família + vincular 2º membro com código
 * Uso: node docs/smoke/run-family-join-smoke.mjs
 * Env opcional: SMOKE_BASE_URL, SMOKE_HEADED=1, SMOKE_GOOGLE=1 (pausa p/ login manual)
 */
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.SMOKE_BASE_URL || 'https://iphonegalaxy.github.io/ACERTO-DE-CONTAS/';
const OUT = path.join(__dirname, 'join-smoke');
const HEADED = process.env.SMOKE_HEADED === '1';
const USE_GOOGLE = process.env.SMOKE_GOOGLE === '1';

const OWNER_EMAIL = process.env.SMOKE_OWNER_EMAIL || `smoke-owner-${Date.now()}@mail.com`;
const OWNER_PASS = process.env.SMOKE_OWNER_PASS || '12345678';
const MEMBER_EMAIL = process.env.SMOKE_MEMBER_EMAIL || 'thaisalcantara_rj@yahoo.com.br';
const MEMBER_PASS = process.env.SMOKE_MEMBER_PASS || '12345678';

const results = [];
const log = (id, ok, note) => {
  results.push({ id, ok, note });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id} — ${note}`);
};

const shot = async (page, name) => {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true });
};

const loginTab = (page, name) => page.locator('button.flex-1').filter({ hasText: name });
const loginSubmit = (page) => page.locator('button.w-full').filter({ hasText: /Criar conta|Entrar/ });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  await mkdir(OUT, { recursive: true });
  let familyCode = '';

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: !HEADED,
    slowMo: HEADED ? 100 : 0,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
    await wait(2000);
    await shot(page, '01-login');

    const body0 = await page.locator('body').innerText();
    log('01-load', !body0.includes('Firebase não configurado'), 'App carregou');

    // === LOGIN OWNER ===
    if (USE_GOOGLE) {
      log('02-auth-owner', false, 'Modo Google: clique manualmente em Continuar com Google (Alice) nos próximos 90s');
      await page.getByRole('button', { name: /Continuar com Google/i }).click();
      await wait(90000);
    } else {
      await loginTab(page, 'Criar conta').click();
      await page.getByPlaceholder('seu@email.com').fill(OWNER_EMAIL);
      await page.getByPlaceholder('••••••••').fill(OWNER_PASS);
      await loginSubmit(page).click();
      await wait(4000);
    }

    await shot(page, '02-after-owner-auth');
    const hasWelcome = await page.getByRole('button', { name: 'Criar nova família' }).isVisible().catch(() => false);
    log('02-owner-auth', hasWelcome || await page.getByText('Quem está a usar').isVisible().catch(() => false),
      hasWelcome ? 'Owner autenticado — wizard visível' : 'Owner auth — ver screenshot');

    if (await page.getByRole('button', { name: 'Criar nova família' }).isVisible().catch(() => false)) {
      await page.getByRole('button', { name: 'Criar nova família' }).click();
      await wait(500);
      await page.getByPlaceholder('Ex: João').fill('Pedro');
      await page.getByPlaceholder('Ex: Maria').fill('Maria');
      await page.getByRole('button', { name: 'Continuar' }).click();
      await wait(500);

      // 3 cartões (lista começa vazia — adicionar cada um)
      for (let i = 0; i < 3; i++) {
        await page.getByRole('button', { name: '+ Adicionar cartão' }).click();
        await page.getByPlaceholder('Nome do cartão').nth(i).fill(`Cartao ${i + 1}`);
        await page.getByPlaceholder('Final 1234').nth(i).fill(String(1000 + i));
        const ownerSelect = page.locator('select').nth(i);
        if (i === 0) await ownerSelect.selectOption('personA');
        else if (i === 1) await ownerSelect.selectOption('personB');
        else await ownerSelect.selectOption('both');
      }
      await page.getByRole('button', { name: 'Continuar' }).click();
      await wait(500);

      // Código da família
      const codeEl = page.locator('.font-mono').first();
      familyCode = (await codeEl.innerText()).trim();
      await writeFile(path.join(OUT, 'family-code.txt'), familyCode);
      log('03-family-code', !!familyCode, familyCode ? `Código: ${familyCode}` : 'Código não capturado');
      await shot(page, '03-household-code');

      await page.getByRole('button', { name: 'Continuar' }).click();
      await wait(500);

      // Tela seleção → Configurações → copiar código
      await page.getByRole('button', { name: 'Configurações' }).click();
      await wait(500);
      const codeFromSettings = await page.locator('.font-mono').first().innerText().catch(() => '');
      if (codeFromSettings.trim()) familyCode = codeFromSettings.trim();
      await page.getByRole('button', { name: 'Copiar código' }).click();
      await writeFile(path.join(OUT, 'family-code.txt'), familyCode);
      log('03-family-code', !!familyCode, familyCode ? `Código: ${familyCode}` : 'Código não capturado');
      await shot(page, '03-settings-code');

      // Sair da conta (ícone topo direito)
      await page.locator('button[title="Sair da conta"]').click();
      await wait(2000);
      await shot(page, '04-logged-out');
    }

    if (!familyCode) {
      const saved = await import('fs/promises').then((fs) =>
        fs.readFile(path.join(OUT, 'family-code.txt'), 'utf8').catch(() => '')
      );
      familyCode = saved.trim();
    }

    log('05-has-code', !!familyCode, familyCode || 'Sem código para teste de join');

    // === JOIN MEMBER ===
    await page.getByPlaceholder('Cole o código da família').fill(familyCode);
    await wait(300);
    // Membro de teste já pode existir — preferir Entrar e vincular
    await loginTab(page, 'Entrar').click();
    await page.getByPlaceholder('seu@email.com').fill(MEMBER_EMAIL);
    await page.getByPlaceholder('••••••••').fill(MEMBER_PASS);
    await shot(page, '07-member-login-form');

    await page.getByRole('button', { name: /Entrar e vincular/i }).click();
    await wait(5000);

    let bodyMid = await page.locator('body').innerText();
    if (bodyMid.includes('Este e-mail já existe') || bodyMid.includes('já está em uso')) {
      await loginTab(page, 'Entrar').click();
      await page.getByRole('button', { name: /Entrar e vincular/i }).click();
      await wait(5000);
    } else if (bodyMid.includes('Credenciais inválidas') || bodyMid.includes('não encontrado')) {
      await loginTab(page, 'Criar conta').click();
      await page.getByRole('button', { name: /Criar conta e vincular/i }).click();
      await wait(5000);
    }
    await shot(page, '08-after-member-join');

    const bodyAfter = await page.locator('body').innerText();
    const joinErr = bodyAfter.includes('Erro ao vincular') || bodyAfter.includes('2 membros');
    const selectPedro = await page.getByRole('button', { name: 'Pedro' }).isVisible().catch(() => false);
    const dashboard = await page.getByText('Divisão').isVisible().catch(() => false);

    log('06-member-join', !joinErr && (selectPedro || dashboard),
      joinErr ? `Erro na tela: ${bodyAfter.match(/Erro.*|membros.*/)?.[0] || 'ver screenshot'}`
        : selectPedro ? 'Seleção Pedro/Maria — vinculou OK'
        : dashboard ? 'Dashboard membro — OK' : 'Estado incerto — ver screenshot');

    if (selectPedro) {
      await page.getByRole('button', { name: 'Maria' }).click();
      await wait(2000);
      log('07-member-dashboard', await page.getByText('Divisão').isVisible().catch(() => false), 'Dashboard Maria');
      await shot(page, '09-member-dashboard');
    }

  } catch (err) {
    log('ERROR', false, String(err.message || err));
    await shot(page, 'error').catch(() => {});
  } finally {
    await browser.close();
  }

  await writeFile(path.join(OUT, 'results.json'), JSON.stringify(results, null, 2));
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\nResumo: ${results.length - failed} passou, ${failed} falhou`);
  process.exit(failed > 0 ? 1 : 0);
})();
