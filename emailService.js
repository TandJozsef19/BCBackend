const nodemailer = require("nodemailer");

const dotenv = require("dotenv");
dotenv.config({ path: "./configure.env" });

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

exports.sendConfirmRegistrationEmail = async function (
  recipientEmail,
  userName,
  pinCode
) {
  const mailOptions = {
    from: process.env.EMAIL,
    to: recipientEmail,
    subject: "Regisztráció Megerősítése",
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; padding: 20px; border-radius: 8px; color: #333;">
        <h2 style="color: #22c55e; text-align: left; font-size: 24px;">Tisztelt, ${userName}!</h2>
        <p style="font-size: 16px;">Regisztrációja sikeresen megtörtént weboldalunkon. A regisztrációs folyamat befejezéséhez és a szolgáltatásainkhoz való teljes hozzáférés érdekében, kérjük, használja az alábbi PIN kódot:</p>
        <p style="text-align: center; margin: 20px 0; font-size: 20px; letter-spacing: 1.5px; padding: 10px; background-color: #22c55e; color: white; border-radius: 5px; font-weight: bold;">${pinCode}</p>
        <p style="font-size: 16px;">A PIN kód beírása után hozzáférést nyer szolgáltatásaink széles köréhez.</p>
        <p style="font-size: 16px;">Kérdéseivel, kérjük, forduljon hozzánk bizalommal.</p>
        <p style="font-size: 16px; margin-top: 30px;">Üdvözlettel,<br><strong>A Konferencia Csapata</strong></p>
      </div>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Hiba történt az e-mail küldésekor: ", error);
    } else {
      console.log("Email sent: ", info.response);
    }
  });
};

exports.sendNewPinEmail = async function (
  recipientEmail,
  userName,
  temporaryPin
) {
  const mailOptions = {
    from: process.env.EMAIL,
    to: recipientEmail,
    subject: "Új PIN Kód igénylés",
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; padding: 20px; border-radius: 8px; color: #333;">
        <h2 style="color: #22c55e; text-align: left; font-size: 24px;">Tisztelt, ${userName}!</h2>
        <p style="font-size: 16px;">Az Ön új ideiglenes PIN kódját az alábbiakban találja, amely a folyamat befejezéséhez szükséges. Kérjük, vegye figyelembe, hogy ez a kód csak <strong>3 percig</strong> érvényes.</p>
        <p style="text-align: center; margin: 20px 0; font-size: 20px; letter-spacing: 1.5px; padding: 10px; background-color: #22c55e; color: white; border-radius: 5px; font-weight: bold;">${temporaryPin}</p>
        <p style="font-size: 16px;">Kérjük, írja be ezt a kódot a megadott helyre a weblapon a következő 3 percen belül. Amennyiben lejárna az érvényessége, új PIN kódot generálhat.</p>
        <p style="font-size: 16px;">Ha bármilyen technikai nehézsége merülne fel, vagy további segítségre lenne szüksége, készséggel állunk rendelkezésére.</p>
        <p style="font-size: 16px; margin-top: 30px;">Üdvözlettel,<br><strong>A Konferencia Csapata</strong></p>
      </div>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Hiba történt az e-mail küldésekor: ", error);
    } else {
      console.log("Email sent: ", info.response);
    }
  });
};

exports.sendForgotPasswordEmail = async function (
  recipientEmail,
  userName,
  temporaryPin
) {
  const mailOptions = {
    from: process.env.EMAIL,
    to: recipientEmail,
    subject: "Jelszó visszaállítási kód",
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; padding: 20px; border-radius: 8px; color: #333;">
        <h2 style="color: #22c55e; text-align: left; font-size: 24px;">Tisztelt, ${userName}!</h2>
        <p style="font-size: 16px;">Az Ön jelszó visszaállítási kódja az alábbi, amely csak 10 percig érvényes:</p>
        <p style="text-align: center; margin: 20px 0; font-size: 20px; letter-spacing: 1.5px; padding: 10px; background-color: #22c55e; color: white; border-radius: 5px; font-weight: bold;">${temporaryPin}</p>
        <p style="font-size: 16px;">Kérjük, írja be ezt a kódot a megadott helyre a weboldalon. Amennyiben lejárna az érvényessége, új PIN kódot igényelhet.</p>
        <p style="font-size: 16px; margin-top: 30px;">Ha bármilyen technikai nehézsége merülne fel, vagy további segítségre lenne szüksége, készséggel állunk rendelkezésére.</p>
        <p style="font-size: 16px;">Üdvözlettel,<br><strong>A Konferencia Csapata</strong></p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Error sending email: ", error);
    return { success: false, message: "Error sending email" };
  }
};

exports.sendApplicationConfirmation = async function (email, applicantData) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Konferencia Jelentkezés",
    html: generateEmailContent(applicantData),
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);
  } catch (error) {
    console.error("Hiba történt az e-mail küldésekor: ", error);
  }
};

function generateEmailContent(applicantData) {
  console.log(applicantData);

  // Dátumok formázása
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("hu-HU", options);
  };

  const formatDateWithHours = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("hu-HU", options);
  };

  // Menü választások felsorolása
  const menuSelectionsList = applicantData.menuSelections
    .map((selection) => {
      let mealType = "";
      switch (selection.selection) {
        case "vegan":
          mealType = "Vegán";
          break;
        case "vegetarian":
          mealType = "Vegetáriánus";
          break;
        case "traditional":
          mealType = "Hagyományos";
          break;
        default:
          mealType = selection.selection;
      }
      return `<li>${formatDate(selection.date)}: ${mealType}</li>`;
    })
    .join("");

  const selectedDaysArray = Array.isArray(applicantData.selectedDays)
    ? applicantData.selectedDays
    : [applicantData.selectedDays];

  const selectedHotelRoomDaysArray = Array.isArray(
    applicantData.selectedHotelRoomDays
  )
    ? applicantData.selectedHotelRoomDays
    : [applicantData.selectedHotelRoomDays];

  return `
  <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; padding: 20px; border-radius: 8px; color: #333;">
  <h1 style="color: #22c55e;">Köszönjük a jelentkezését!</h1>
  <p>Tisztelt, ${applicantData.name},</p>
  <p>Köszönjük, hogy jelentkezett a(z) "${applicantData.conferenceTitle}, ${
    applicantData.conferenceSubTitle
  }" konferenciára. Itt vannak a részletek:</p>
  ${
    applicantData.role === "speaker"
      ? `<p>Köszönjük, hogy beküldte előadói jelentkezését!</p>
      <ul>
      <li>Előadás időpontja: ${formatDateWithHours(
        applicantData.presentationTime
      )}</li>
      <li>Előadás témája: ${applicantData.speakerSubject}</li>
      <li>Munkahely: ${applicantData.workplace}</li>
      <li>Pozíció: ${applicantData.workplacePosition}</li>
      ${
        applicantData.specialTechNeeds
          ? `<li>Különleges technikai igények: ${applicantData.specialTechNeeds}</li>`
          : ""
      }
      </ul>`
      : ""
  }
  <ul>
    <li>Helyszín: ${applicantData.location},${applicantData.conferenceCity}, ${
    applicantData.conferenceCountry
  } </li>
    <li>Konferencia időpontja: ${formatDate(
      applicantData.conferenceStartDate
    )} - ${formatDate(applicantData.conferenceEndDate)}</li>
    <li>Konferencia nyelve: ${applicantData.conferenceLanguage}</li>
    <li>Részvétel napjai: ${selectedDaysArray
      .map((day) => `${formatDate(day)}`)
      .join(", ")} </li>
    <li>Szobafoglalás: ${selectedHotelRoomDaysArray
      .map((room) => `${room}`)
      .join(", ")}</li>
    <li>Teljes ár: ${applicantData.totalCost} Ft</li>
    ${applicantData.role === "speaker" ? `<li>Szereped: Előadó</li>` : ""}
    <li>Opcionális programok: ${applicantData.facultativePrograms
      .map((program) => `${program.name}(${program.cost} Ft)`)
      .join(", ")}</li>
        ${
          menuSelectionsList
            ? `<li>Étkezési preferenciák: <ul>${menuSelectionsList}</ul></li>`
            : ""
        }
        <li>Gluténérzékeny: ${
          applicantData.glutenSensitive ? "Igen" : "Nem"
        }</li>
    <li>Lisztérzékeny: ${applicantData.flourSensitive ? "Igen" : "Nem"}</li>
    <li>Mozgássérült: ${applicantData.mobilityIssues ? "Igen" : "Nem"}</li>
    ${
      applicantData.additionalNotes
        ? `<li>További megjegyzések: ${applicantData.additionalNotes}</li>`
        : ""
    }
      </ul>
      <p>Szeretettel várunk a konferencia kezdetekor, ${formatDate(
        applicantData.conferenceStartDate
      )}-én/án!</p>
      <p>Amennyiben bármilyen kérdésed merül fel, kérjük, vedd fel velünk a kapcsolatot.</p>
      <p>Üdvözlettel,<br>${applicantData.conferenceTitle} Szervezőcsapata</p>
    </div>
  `;
}

exports.sendApprovalEmail = async (email, applicantData) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Jelentkezése elfogadva!",
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; padding: 20px; border-radius: 8px; color: #333;">
        <h2 style="color: #22c55e; text-align: left; font-size: 24px;">Tisztelt, ${applicantData.name}!</h2>
        <p style="font-size: 16px;">Örömmel értesítjük, hogy jelentkezését elfogadtuk a(z) "${applicantData.conferenceName}" konferenciára.</p>
        <p style="font-size: 16px;">A részleteket és a következő lépéseket a konferencia kezdetét megelőzően küldjük el. Várjunk Önt a konferencián!</p>
        <p style="font-size: 16px;">Ha bármilyen kérdése vagy kérése van, kérjük, ne habozzon kapcsolatba lépni velünk.</p>
        <p style="font-size: 16px; margin-top: 30px;">Üdvözlettel,<br><strong>A Konferencia Szervezőcsapata</strong></p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Hiba történt az e-mail küldésekor: ", error);
  }
};

exports.sendRejectionEmail = async (email, applicantData) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Jelentkezése elutasítva",
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; padding: 20px; border-radius: 8px; color: #333;">
        <h2 style="color: #22c55e; text-align: left; font-size: 24px;">Tisztelt, ${applicantData.name}!</h2>
        <p style="font-size: 16px;">Sajnálattal értesítjük, hogy a jelentkezését nem tudtuk elfogadni a(z) "${applicantData.conferenceName}" konferenciára.</p>
        <p style="font-size: 16px;">Köszönjük érdeklődését és a konferenciára való jelentkezést. Bízunk benne, hogy a jövőben lesz alkalmunk üdvözölni Önt mint résztvevőt vagy előadót.</p>
        <p style="font-size: 16px;">Ha további információra van szüksége vagy kérdése van a döntésünkkel kapcsolatban, kérjük, ne habozzon kapcsolatba lépni velünk.</p>
        <p style="font-size: 16px; margin-top: 30px;">Üdvözlettel,<br><strong>A Konferencia Szervezőcsapata</strong></p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Hiba történt az e-mail küldésekor: ", error);
  }
};

exports.sendCustomEmail = async function (to, subject, content) {
  const htmlContent = content.replace(/\n/g, "<br>");

  const mailOptions = {
    from: process.env.EMAIL,
    to: to,
    subject: subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent: ", to);
  } catch (error) {
    console.error("Hiba történt az e-mail küldésekor: ", error);
  }
};

exports.sendGroupEmail = async function (recipients, subject, content) {
  const htmlContent = content.replace(/\n/g, "<br>");

  const sendEmailPromises = recipients.map((to) => {
    const mailOptions = {
      from: process.env.EMAIL,
      to: to,
      subject: subject,
      html: htmlContent,
    };

    return transporter
      .sendMail(mailOptions)
      .then((info) => ({
        success: true,
        info: info,
        email: to,
      }))
      .catch((error) => ({
        success: false,
        error: error,
        email: to,
      }));
  });

  const results = await Promise.allSettled(sendEmailPromises);

  const successResults = results.filter((result) => result.value.success);
  const failureResults = results.filter((result) => !result.value.success);

  console.log(`${successResults.length} email sikeresen elküldve.`);
  if (failureResults.length > 0) {
    console.error(`${failureResults.length} email küldése sikertelen.`);
  }
};
