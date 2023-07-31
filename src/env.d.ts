/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string
    readonly VITE_RZP_KEY_ID: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
