import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/').pop()

export default defineConfig({
  base: process.env.GITHUB_ACTIONS && repositoryName ? `/${repositoryName}/` : '/',
  plugins: [react(), tailwindcss()],
})
