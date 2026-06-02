import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.SMOKE_BASE_URL || 'https://iphonegalaxy.github.io/ACERTO-DE-CONTAS/';
const OUT = path.join(__dirname, 'post-deploy');
const SMOKE_EMAIL = process.env.SMOKE_TEST_EMAIL;
const SMOKE_PASSWORD = process.env.SMOKE_TEST_PASSWORD;
const results = [];

const shot = async (page, name) => {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true });
};

const log = (id, ok, note) => {
  results.push({ id, ok, note });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id} — ${note}`);
};

const dismissSplashIfNeeded = async (page) => {
  const splashCta = page.getByRole('button', { name: 'Já tenho uma conta' });
  if (await splashCta.isVisible().catch(() => false)) {
    await splashCta.click();
    await page.waitForTimeout(400);
  }
};

const loginIfNeeded = async (page) => {
  await dismissSplashIfNeeded(page);
  const loginTab = page.getByRole('button', { name: 'Entrar', exact: true }).first();
  const hasLogin = await loginTab.isVisible().catch(() => false);
  if (!hasLogin) return true;

  if (!SMOKE_EMAIL || !SMOKE_PASSWORD) {
    log('02-auth', false, 'Tela de login exibida; defina SMOKE_TEST_EMAIL e SMOKE_TEST_PASSWORD');
    await shot(page, '01-login-required');
    return false;
  }

  await loginTab.click();
  await page.getByPlaceholder('seu@email.com').fill(SMOKE_EMAIL);
  await page.getByPlaceholder('••••••••').fill(SMOKE_PASSWORD);
  await page.getByRole('button', { name: 'Entrar' }).last().click();
  await page.waitForTimeout(3000);
  await shot(page, '01-login');
  return true;
};

(async () => {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    const bodyText = await page.locator('body').innerText();
    const firebaseErr = bodyText.includes('Firebase não configurado');
    log('01-load', !firebaseErr, firebaseErr ? 'Firebase não configurado no deploy' : 'App carregou sem erro de config');

    const authed = await loginIfNeeded(page);
    if (!authed) return;

    const welcome = page.getByRole('button', { name: 'Criar nova família' });
    const hasWelcome = await welcome.isVisible().catch(() => false);
    log('02-welcome', hasWelcome, hasWelcome ? 'Tela inicial pós-login visível' : 'Tela de boas-vindas não encontrada');
    if (hasWelcome) await shot(page, '02-welcome');

    if (hasWelcome) {
      await welcome.click();
      await page.waitForTimeout(500);
      const namesVisible = await page.getByText('Pessoa 1').isVisible().catch(() => false);
      log('03-names-step', namesVisible, namesVisible ? 'Etapa de nomes aberta' : 'Etapa de nomes não abriu');
      if (namesVisible) await shot(page, '03-names');

      await page.getByPlaceholder('Ex: João').fill('Ana');
      await page.getByPlaceholder('Ex: Maria').fill('Bruno');
      await page.getByRole('button', { name: 'Continuar' }).click();
      await page.waitForTimeout(500);

      const cardsStep = await page.getByText('Adicione quantos cartões quiser').isVisible().catch(() => false);
      log('04-cards-step', cardsStep, cardsStep ? 'Etapa de cartões aberta' : 'Etapa de cartões não abriu');
      if (cardsStep) await shot(page, '04-cards');

      await page.getByRole('button', { name: '+ Adicionar cartão' }).click();
      await page.getByPlaceholder('Nome do cartão').fill('Nubank Ana');
      await page.getByPlaceholder('Final 1234').fill('1234');
      await page.getByRole('button', { name: 'Continuar' }).click();
      await page.waitForTimeout(500);

      const codeStep = await page.getByText('Código da família').isVisible().catch(() => false);
      log('05-household-code', codeStep, codeStep ? 'Código da família exibido' : 'Etapa do código não apareceu');
      if (codeStep) await shot(page, '05-household-code');

      await page.getByRole('button', { name: 'Continuar' }).click();
      await page.waitForTimeout(500);

      const selectAna = page.getByRole('button', { name: 'Ana' });
      const selectBruno = page.getByRole('button', { name: 'Bruno' });
      const hasSelect = await selectAna.isVisible().catch(() => false);
      log('06-user-select', hasSelect, hasSelect ? 'Seleção com nomes customizados' : 'Botões de usuário não encontrados');
      if (hasSelect) await shot(page, '06-user-select');

      await selectAna.click();
      await page.waitForTimeout(2000);

      const dashboard = await page.getByText('Divisão').isVisible().catch(() => false);
      log('07-dashboard-a', dashboard, dashboard ? 'Dashboard Pessoa 1 (Ana) carregou' : 'Dashboard não carregou');
      if (dashboard) await shot(page, '07-dashboard-ana');

      log('08-custom-name-a', (await page.locator('body').innerText()).includes('Ana'), 'Nome Ana aparece no dashboard');

      const ajusteVisible = await page.getByRole('button', { name: 'Ajuste' }).isVisible().catch(() => false);
      log('09-no-ajuste-panel-a', !ajusteVisible, ajusteVisible ? 'Ajuste visível no painel A (não deveria)' : 'Ajuste oculto no painel A (correto)');

      await page.getByRole('button', { name: '+ Novo' }).click();
      await page.waitForTimeout(500);
      const cardOption = await page.getByRole('option', { name: /Nubank Ana \(final 1234\)/ }).isVisible().catch(() => false);
      log('10-custom-card-modal', cardOption, cardOption ? 'Cartão customizado no modal' : 'Cartão customizado não listado');
      if (cardOption) await shot(page, '08-modal-novo');

      await page.getByRole('button', { name: 'Cancelar' }).click();
      await page.locator('header button').last().click();
      await page.waitForTimeout(500);

      await selectBruno.click();
      await page.waitForTimeout(1500);
      const ajusteB = await page.getByRole('button', { name: 'Ajuste' }).isVisible().catch(() => false);
      log('11-ajuste-panel-b', ajusteB, ajusteB ? 'Ajuste visível no painel B (correto)' : 'Ajuste ausente no painel B');
      if (ajusteB) await shot(page, '09-dashboard-bruno-ajuste');
    }
  } catch (err) {
    log('ERROR', false, String(err.message || err));
    await shot(page, 'error-state').catch(() => {});
  } finally {
    await browser.close();
  }

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\nResumo: ${passed} passou, ${failed} falhou, ${results.length} total`);
  process.exit(failed > 0 ? 1 : 0);
})();
