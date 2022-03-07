# 影片分享平台 - 後端

### Github
  - [前端](https://github.com/wei02427/Video-Share)

### 此專案是為了練習
    - 網頁影片串流
    - 網頁通知
    - 容器虛擬化
    - 搜尋引擎
    - Typescrpit
    - MVC 架構

### 運用了
    - Node.js + Express.js
    - Docker
    - Socket.io
    - FFmpeg + MP4Box
    - ElasticSearch
    - Compute Engine + App Engine


### 遇到的問題
- 前端  
  - 如何驗證使用者  
    因為過去專案的驗證機制都是使用 JWT 實作，沒有使用 Cookie 的實際經驗，最後採用當每次使用者開啟新頁面時，就像後端發出驗證 cookie 的請求，確保 cookie 是有效的，才可進入需要驗證的頁面。

- 後端  
  - Docker - compose 部署  
    在最後階段部屬 docker 時，原以為可以透過 GCP 的 Cloud run 部屬容器，但後來發現到其只支援單獨的 container，所以做後部屬在 Coumpute Engine 上的虛擬機器。
  - https 連線  
    當虛擬機開好了之後發現明明已將 https traffic 的選項開啟，但仍然連不上線，才發現原來是 SSL 憑證必須手動安裝，作後才成功能以 https 呼叫 api。

