# ⚡ QuickPass — Client

React 18 + Vite frontend for the QuickPass secure attendance platform.

## Stack
- **React 18** with Context API for state management
- **Vite** dev server with proxy to backend
- **Tailwind CSS v3** with custom QuickPass design tokens
- **Socket.io-client** for real-time QR refresh and live attendance feed
- **html5-qrcode** for camera-based QR scanning
- **react-hot-toast** for UX feedback toasts
- **react-markdown** for the student notes markdown editor
- **qrcode** for rendering encrypted QR payloads as images (teacher view)

## Dev Setup

```bash
npm install
npm run dev       # http://localhost:5173
```

> Vite proxies `/api` and `/socket.io` requests to `http://localhost:5000`.  
> Start the backend server first.

## Design System

All tokens are defined in [`tailwind.config.js`](./tailwind.config.js):

| Token | Value |
|---|---|
| `primary` | `#0d0f12` |
| `accent` | `#0056d2` |
| `background` | `#dae1ed` |
| `surface` | `#ffffff` |
| `border` | `#c1cbdb` |
| Card shadow | `rgb(0, 86, 210) 0px 0px 0px 1px inset` |
| Font | `Source Sans Pro` |
