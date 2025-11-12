import { baseEmailTemplate } from '../base.template';

export const invitationTemplateUk = (
  invitationLink: string,
  companyName: string,
  role: string,
) => {
  const roleUk = role === 'driver' ? 'Водій' : 'Диспетчер';

  return {
    subject: `Запрошення приєднатися до ${companyName} в OrionixTrack`,
    text: `Вітаємо,\n\nВас запросили приєднатися до ${companyName} як ${roleUk} в OrionixTrack. Натисніть посилання нижче, щоб прийняти запрошення та створити обліковий запис:\n\n${invitationLink}\n\nЦе посилання дійсне протягом 24 годин. Якщо ви не очікували цього запрошення, ви можете проігнорувати цей email.`,
    html: baseEmailTemplate({
      preheader: `Приєднайтесь до ${companyName} в OrionixTrack`,
      content: `
      <h2>Вас запрошено!</h2>

      <p>Вас запросили приєднатися до компанії <strong>${companyName}</strong> як <strong>${roleUk}</strong> в OrionixTrack.</p>

      <div class="info-box">
        <p style="margin: 0;"><strong>Що таке OrionixTrack?</strong></p>
        <p style="margin: 8px 0 0 0;">OrionixTrack — це інтегрована операційна платформа для управління транспортними операціями, яка допомагає транспортним компаніям ефективно та надійно керувати своєю щоденною діяльністю.</p>
      </div>

      <p>Натисніть кнопку нижче, щоб прийняти запрошення та налаштувати свій обліковий запис:</p>

      <p style="text-align: center;">
        <a href="${invitationLink}" class="button">Прийняти запрошення</a>
      </p>

      <hr>

      <h3>Що далі?</h3>
      <p>Після прийняття запрошення вам буде запропоновано:</p>
      <ul>
        <li>Вказати ваше ім'я</li>
        <li>Встановити надійний пароль</li>
        <li>Обрати бажану мову</li>
      </ul>
    `,
    }),
  };
};
