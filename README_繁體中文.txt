EM 吊牌設計工作室｜LINE LIFF 直接傳圖測試專案

重要：原始「261010 基準版」沒有修改。本資料夾是獨立測試專案。

專案內容
- index.html：已填入 LIFF ID 2011957462-JynHDezs 的設計器
- netlify/functions/line-image-upload.mjs：接收 PNG/JPEG 預覽圖，暫存到 Netlify Blobs，並提供 HTTPS 圖片網址
- netlify.toml：Netlify Functions 設定
- package.json：Netlify Blobs 依賴

部署注意
單純把 index.html 拖到 Netlify Drop，只會部署靜態網頁，不會建置 Netlify Function。因此必須使用「Netlify 連接 Git repository 自動建置」或「Netlify CLI」部署整個資料夾。不可只上傳 index.html，否則傳圖仍會失敗。

上線前檢查
1. LIFF Endpoint URL 必須是這個 Netlify 網站的 HTTPS 網址根目錄。
2. LINE Login Channel 的 LIFF scope 要包含 chat_message.write（若目前 LIFF 設定不含此權限，請在 LIFF 設定中確認可否調整）。
3. 使用者要從 LINE 聊天室中開啟 LIFF，sendMessages 只會送到當前 LIFF 可用的聊天室情境；不是任意指定客服帳號。
4. Netlify Blobs 會保存上傳的檔案。此測試版沒有自動到期清理；測試請勿上傳敏感資料，並在測試後清除暫存資料或另加清理機制。
5. 這是測試版，公開上傳 API 仍可能被濫用。正式營運前應加上驗證、限流與自動清除機制。

測試步驟
1. 把整個專案放入 Git repository，連接 Netlify，Build command 可留空（Netlify 會依 netlify.toml 打包 functions），Publish directory 設為 .。
2. 部署成功後，打開 https://你的網站/.netlify/functions/line-image-upload ，GET 會回 Bad request 或類似訊息（代表 Function 已回應，不是 404）。
3. 到 LINE Developers > 該 LINE Login Channel > LIFF，確認 Endpoint URL 是 https://你的網站/ 。
4. 在 LINE 客服官方帳號聊天裡放入 LIFF URL，從該聊天室點開。
5. 設計吊牌後按「傳送雷雕 PNG 至 LINE 客服」，確認同一聊天室收到圖片與規格文字。

不要將 LINE Channel Secret 或 Channel Access Token 放入 index.html。
