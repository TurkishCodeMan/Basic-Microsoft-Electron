const { app, BrowserWindow, ipcMain,Menu } = require("electron");
const path = require("path");
const remoteMain = require("@electron/remote/main");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "index.html"));

  remoteMain.initialize(); // Open the DevTools.
  remoteMain.enable(mainWindow.webContents);

  // Ana süreçten gelen isteği dinle
  ipcMain.on("redirect-to-microsoft-login", (event, email, password) => {
    const encodedEmail = encodeURIComponent(email);
    const encodedPassword = encodeURIComponent(password);
    const redirectUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=4765445b-32c6-49b0-83e6-1d93765276ca&redirect_uri=https%3A%2F%2Fwww.office.com%2Flandingv2&response_type=code%20id_token&scope=openid%20profile%20https%3A%2F%2Fwww.office.com%2Fv2%2FOfficeHome.All&response_mode=form_post&nonce=638438455546569212.YmY3NWJkMTItYWM1OS00ZDI0LWJlMDQtYzJhZTM1MmUwMjA5NDFhYmUyMjEtYTYxYi00MDYxLTk2ZTQtMTdiODA3MzMwMDFi&ui_locales=tr-TR&mkt=tr-TR&prompt=select_account&client-request-id=a5fb62c9-7598-4b0f-90ae-d1983ffd7fc3&state=Dmtw6wRIxz6ob_A_97h-Bd2LmCpevP28etW0B1RUNG_ePup0tnNwaWc_MCd_YOEU86Pd2Exdvw7bL1Et6tL98kRfiKDh2aKzh_2SLFsGqlWnaFnNEe1-G4OxNmRz6NfhguTzjt96CEp8j7G3xwcVXKQ9AJ9P4pVgYq6-ngpZWDLlWhp_QPbN1IL1_5pQqasDIZ6OcGPXQq2Hzvj2w0BACF5XB7FLjtp_6KtLyZhdIU88l3mnfvM9E_0b8gPP9nU5LgnlOrk4mM99Sm_UwXGP7vuSswdiZ3COcqAq4vk7zrzOZ2yd2U6nQgID_3DDafRG0OkULTMf-2r3-ENJ9_Lrxw&x-client-SKU=ID_NET6_0&x-client-ver=6.34.0.0&login_hint=${encodedEmail}&password=${encodedPassword}`;

    // Yeni sekme aç
    const newWindow = new BrowserWindow();
    newWindow.loadURL(redirectUrl);

    // Aynı sekmede yönlendirme olaylarını dinle
    newWindow.webContents.on("did-navigate", (event, url) => {
      // Ana sürece yönlendirme URL'sini gönder
      console.log("Yeni sayfa yüklendi");
      mainWindow.webContents.send("redirect-url", url);
    });

    newWindow.webContents.on(
      "did-attach-dom-event",
      (event, eventName, listener) => {
        // Yeni bir DOM olayı eklendiğinde buraya gelir

        console.log("Click event detected");
        if (eventName === "click") {
          // Click olayı olduğunda buraya gelir
          console.log("Click event detected");
          // listener fonksiyonunu kullanarak olayları dinleyebilirsiniz
          // Örneğin:
          newWindow.webContents.removeListener(
            "did-attach-dom-event",
            listener
          ); // Dinleyiciyi kaldır
        }
      }
    );
  });

  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Ana Süreç, Yordam'dan (Renderer Process) gelen 'button-clicked' olayını dinler
ipcMain.on("button-clicked", () => {
  console.log("Butona tıklandı!");
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
