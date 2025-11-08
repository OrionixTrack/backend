import { baseEmailTemplate } from '../base.template';

export const verificationTemplateUk = (verificationLink: string) => ({
  subject: 'Підтвердьте ваш акаунт OrionixTrack',
  text: `Вітаємо,\nБудь ласка, підтвердьте вашу електронну адресу, перейшовши за посиланням: ${verificationLink}\n\nЯкщо ви не створювали акаунт, будь ласка, проігноруйте цей лист.`,
  html: baseEmailTemplate({
    preheader: 'Підтвердьте email для початку роботи з OrionixTrack',
    content: `
      <h2>Ласкаво просимо!</h2>
      <p>Дякуємо, що приєдналися до OrionixTrack. Щоб завершити реєстрацію та почати керувати вашим автопарком, будь ласка, підтвердьте вашу електронну адресу.</p>

      <p style="text-align: center;">
        <a href="${verificationLink}" class="button">Підтвердити Email</a>
      </p>

      <p class="text-muted">Якщо ви не створювали акаунт в OrionixTrack, будь ласка, проігноруйте цей лист і жодних дій не буде виконано.</p>
    `,
  }),
});
