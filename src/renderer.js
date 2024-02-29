const { remote } = window.electron;
const { ipcRenderer, ipcMain } = window.electron;

window.addEventListener("DOMContentLoaded", async (event) => {
   searchUsers();
   cardList()
  document
    .getElementById("registration-form")
    .addEventListener("submit", async (event) => {
      event.preventDefault();

      const closeIcon = document.querySelector(".close");

      const formData = new FormData(
        document.getElementById("registration-form")
      );
      const userData = Object.fromEntries(formData.entries());
      console.log(userData);
      try {
        const response = await fetch("http://127.0.0.1:5000/add_user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log("Response from server:", responseData);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        closeIcon.click();
      }

      // Kullanıcı ekledikten sonra tabloyu güncelle
      fetchAndDisplayUsers();
      return false;
    });

  // Flask sunucusundan tüm kullanıcıları almak için fetch işlevi
  async function getUsersFromServer() {
    try {
      const response = await fetch("http://127.0.0.1:5000/get_users");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const users = await response.json();
      return users;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  // Kullanıcıları HTML tablosuna eklemek için işlev
  function displayUsers(users) {
    const userTableBody = document.getElementById("user-table-body");
    // Tabloyu temizle
    userTableBody.innerHTML = "";

    // Her kullanıcı için bir satır oluştur
    users.forEach((user) => {
      // Satırı oluştur
      const row = document.createElement("tr");

     

      // İlk sütun: Boş hücre
      const emptyCell1 = document.createElement("td");
      emptyCell1.rowSpan = 2;
      emptyCell1.classList.add("cirkel");
      emptyCell1.textContent = "icon";
      row.appendChild(emptyCell1);

      // İkinci sütun: Company Name
      const companyNameCell = document.createElement("td");
      const companyNameHeader = document.createElement("h3");
      companyNameHeader.textContent = user.name;
      companyNameCell.appendChild(companyNameHeader);
      row.appendChild(companyNameCell);
      companyNameCell.addEventListener("click", () =>
      redirectToMicrosoftLogin(user.email, user.password)
    );
      // İkinci sütun: Email
      const emailCell = document.createElement("td");
      const emailHeader = document.createElement("h5");
      emailHeader.textContent = user.email;
      emailCell.appendChild(emailHeader);
      row.appendChild(emailCell);
      // İkinci sütun: Email
      const passCell = document.createElement("td");
      const passHeader = document.createElement("h5");
      emailHeader.textContent = user.password;
      emailCell.appendChild(passHeader);
      row.appendChild(passCell);
      // Üçüncü sütun: Boş hücre
      const emptyCell2 = document.createElement("td");
      emptyCell2.rowSpan = 2;
      emptyCell2.classList.add("dot");
      const button = document.createElement("button");
      button.id = "myBtndot";
      button.textContent = "...";
      emptyCell2.appendChild(button);
      row.appendChild(emptyCell2);

      // Tabloya satırları ekle
      userTableBody.appendChild(row);
    });
  }

  function redirectToMicrosoftLogin(email, password) {
    const encodedEmail = encodeURIComponent(email);
    const encodedPassword = encodeURIComponent(password);
    const redirectUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=4765445b-32c6-49b0-83e6-1d93765276ca&redirect_uri=https%3A%2F%2Fwww.office.com%2Flandingv2&response_type=code%20id_token&scope=openid%20profile%20https%3A%2F%2Fwww.office.com%2Fv2%2FOfficeHome.All&response_mode=form_post&nonce=638438455546569212.YmY3NWJkMTItYWM1OS00ZDI0LWJlMDQtYzJhZTM1MmUwMjA5NDFhYmUyMjEtYTYxYi00MDYxLTk2ZTQtMTdiODA3MzMwMDFi&ui_locales=tr-TR&mkt=tr-TR&prompt=select_account&client-request-id=a5fb62c9-7598-4b0f-90ae-d1983ffd7fc3&state=Dmtw6wRIxz6ob_A_97h-Bd2LmCpevP28etW0B1RUNG_ePup0tnNwaWc_MCd_YOEU86Pd2Exdvw7bL1Et6tL98kRfiKDh2aKzh_2SLFsGqlWnaFnNEe1-G4OxNmRz6NfhguTzjt96CEp8j7G3xwcVXKQ9AJ9P4pVgYq6-ngpZWDLlWhp_QPbN1IL1_5pQqasDIZ6OcGPXQq2Hzvj2w0BACF5XB7FLjtp_6KtLyZhdIU88l3mnfvM9E_0b8gPP9nU5LgnlOrk4mM99Sm_UwXGP7vuSswdiZ3COcqAq4vk7zrzOZ2yd2U6nQgID_3DDafRG0OkULTMf-2r3-ENJ9_Lrxw&x-client-SKU=ID_NET6_0&x-client-ver=6.34.0.0&login_hint=${encodedEmail}&password=${encodedPassword}`;

    // Yönlendirme işlemi
    // remote.shell.openExternal(redirectUrl);

    // // Sayfa yüklendiğinde çalışacak işlev

    // Ana sürece bilgileri gönder
    ipcRenderer.send("redirect-to-microsoft-login", email, password);

    // Ana süreçten gelen cevabı dinle
    ipcRenderer.on("redirect-url", (event, redirectUrl) => {
      // window.open(redirectUrl, "_self"); // Aynı sekmede aç
    });
  }

  // Kullanıcıları al ve tabloya ekle
  async function fetchAndDisplayUsers() {
    try {
      const users = await getUsersFromServer();
      console.log(users);
      displayUsers(users);
      return users
    } catch (error) {
      console.error("Error fetching users:", error);
      // Kullanıcıya hata mesajı göstermek için bir iletişim kutusu veya başka bir geri bildirim mekanizması kullanılabilir
      alert("An error occurred while fetching users. Please try again later.");
    }
  }

  function searchUsers() {
    const searchInput = document.querySelector(".search");

    searchInput.addEventListener("input", () => {
      const searchTerm = searchInput.value.toLowerCase();
      const companyNames = document.querySelectorAll("#user-table-body h3");

      companyNames.forEach((companyName) => {
        const companyRow = companyName.closest("tr");
        const companyNameText = companyName.textContent.toLowerCase();

        if (companyNameText.replace(/[0-9]/g, "").includes(searchTerm)) {
          companyRow.style.display = "table-row";
        } else {
          companyRow.style.display = "none";
        }
      });

      if (!searchTerm) {
        
        fetchAndDisplayUsers();
      }
    });
  }

   function cardList(){
    const userCardContainer = document.getElementById("user-card-container");
    const userTable = document.querySelector(".user-table");
    const bRight= document.querySelector(".b-right");
    const bLeft= document.querySelector(".b-left");

    bRight.addEventListener("click", () => {
      userCardContainer.style.display = "none";
      userTable.style.display = "block";
      bRight.style.fontWeight = "bold";
      bLeft.style.fontWeight = "400";

      fetchAndDisplayUsers()
    });
  
    bLeft.addEventListener("click", async () => {
      userCardContainer.style.display = "block";
      userTable.style.display = "none";
      bRight.style.fontWeight = "400";
      bLeft.style.fontWeight = "bold";

      const users=await getUsersFromServer();
      displayUsersCard(users)
    });
  
  }
  function displayUsersCard(users) {
    const userCards = document.getElementById("user-cards");

    userCards.innerHTML = "";

    users.forEach((user) => {
      const card = document.createElement("div");
      card.classList.add("card", "user-card");

      const img = document.createElement("img");
      img.src = "user-avatar.jpg"; // Kullanıcı resmini buraya ekle
      card.appendChild(img);

      const userInfo = document.createElement("div");
      userInfo.classList.add("user-card-info");

      const name = document.createElement("h3");
      name.textContent = user.name;
      userInfo.appendChild(name);

      const email = document.createElement("h5");
      email.textContent = user.email;
      userInfo.appendChild(email);

      card.appendChild(userInfo);
      userCards.appendChild(card);
    });
  }
  fetchAndDisplayUsers();
});
