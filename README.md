# Assetto Corsa File Uploader with Discord Webhook

This project is an Express server for uploading Assetto Corsa cars and tracks with full folder structure support. It includes user authentication and sends detailed Discord webhook notifications whenever cars are uploaded, showing which car and files were added.

---

## Features

- [x] Upload cars preserving folder structure  
- [x] Upload tracks preserving folder structure  
- [x] User login with session authentication  
- [x] Discord webhook notifications on car uploads with file details  

---

## Discord Webhook Integration

Each time car files are uploaded, a Discord webhook message is sent to a configured webhook URL. The message includes:

- Car folder name (extracted from uploaded files)  
- Number of uploaded files  
- List of all uploaded filenames  

This helps track uploads clearly in your Discord channel with a nicely formatted embed message.

---

## Setup and Usage

1. Clone or download this repository.  
2. Create a `.env` file (see `.env.example` below) with your config values.  
3. Install dependencies:

```
npm install express express-session multer dotenv node-fetch@2
```

4. Run the server:

```
node server.js
```

5. Open `http://localhost:PORT` in your browser.  
6. Login with your password.  
7. Upload cars or tracks via the web interface or API.

---

## .env.example

```
PORT=
PASSWORD=
SESSION_SECRET=
DISCORD_WEBHOOK_URL=
```


- `PORT`: Server port (e.g., 3000)  
- `PASSWORD`: Password for login authentication  
- `SESSION_SECRET`: Secret string for session encryption  
- `DISCORD_WEBHOOK_URL`: Full Discord webhook URL to send notifications  

---

## Example Discord Webhook Message

**Car Upload Notification**  
**Car:** `example_car_folder`  
**Files uploaded:** 5  
- badge.png  
- dlc_preview.png  
- dlc_ui_car.json  
- ui_car.json  
- upgrade.png  

---

## Notes

- Ownership of uploaded files is set to user `kmf:kmf` automatically.  
- Folder structure is preserved for both cars and tracks uploads.  
- Webhook notifications are only sent on car uploads.
