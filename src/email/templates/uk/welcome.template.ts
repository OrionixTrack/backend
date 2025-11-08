import { baseEmailTemplate } from '../base.template';

export const welcomeTemplateUk = (companyName: string) => ({
  subject: 'Ласкаво просимо до OrionixTrack!',
  text: `Вітаємо у OrionixTrack! Ваш акаунт для компанії "${companyName}" було успішно зареєстровано та підтверджено. Ви можете увійти та почати керування вашим автопарком.`,
  html: baseEmailTemplate({
    preheader: `Ваш акаунт ${companyName} готовий до використання`,
    content: `
      <h2>Ласкаво просимо до OrionixTrack!</h2>

      <div class="success-box">
        <p style="margin: 0;"><strong>Акаунт підтверджено!</strong> Вашу компанію <strong>${companyName}</strong> успішно зареєстровано та верифіковано.</p>
      </div>

      <hr>

      <h3>Готові розпочати?</h3>
      <p>Увійдіть до панелі керування та ознайомтесь з платформою</p>

      <p class="text-muted" style="margin-top: 32px;">Дякуємо, що обрали OrionixTrack для керування вашим автопарком.</p>
    `,
  }),
});
