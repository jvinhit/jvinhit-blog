# jvinhit — Personal Blog

Dark-themed, terminal-style personal blog. Content viết bằng **MDX** trong
chính repo này, deploy static tới **Cloudflare Pages** mỗi lần `git push`.

Stack: **Astro 5** · **TypeScript strict** · **Tailwind CSS 4** · **MDX** ·
**Shiki**.

---

## Kiến trúc

```
                        ┌─────────────────────────┐
                        │     Your Laptop          │
                        │  Viết MDX trong          │
                        │  src/content/posts/*.mdx │
                        └──────────┬───────────────┘
                                   │ git push main
                                   ▼
                        ┌─────────────────────────┐
                        │   GitHub repository      │
                        └──────────┬───────────────┘
                                   │ webhook
                                   ▼
                  ┌────────────────────────────────┐
                  │  Cloudflare Pages (build env)  │
                  │    npm ci && npm run build     │
                  │            ↓                   │
                  │          dist/                 │
                  └──────────┬─────────────────────┘
                             │ upload to edge CDN
                             ▼
                     🌍 jvinhit.dev (global)
```

Mỗi commit vào `main` → Cloudflare Pages tự build → deploy → cache invalidate
toàn cầu. Không cần webhook custom, không cần VPS, không cần Actions.

---

## Bắt đầu local

```bash
# Yêu cầu: Node.js >= 20 (dùng 22 LTS như CI)
nvm use          # hoặc: nvm install 22

npm install
npm run dev      # http://localhost:4321
```

## Scripts

| Command           | Purpose                                       |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Dev server với HMR                            |
| `npm run build`   | Build production sang `dist/`                 |
| `npm run preview` | Serve `dist/` local (test build trước deploy) |
| `npm run check`   | Type-check + kiểm tra content schema          |
| `npm run format`  | Prettier format toàn bộ                       |

---

## Viết bài mới

Tạo file `.mdx` trong `src/content/posts/`. Tên file trở thành slug URL.

```mdx
---
title: 'Tên bài viết'
description: 'Mô tả ngắn hiển thị ở home + OG tag.'
pubDate: 2025-01-15
tags: [react, performance]
draft: false # đặt `true` để ẩn ở production
cover: ./images/cover.png # optional, tương đối với file mdx
---

# Mở đầu

Viết markdown hoặc **MDX** (có thể embed component Astro/React) thoải mái.

\`\`\`ts
const hello = 'world';
\`\`\`
```

Sau khi commit + push, bài sẽ lên production trong vài chục giây.

### Schema được validate ở build time

Xem `src/content.config.ts` — Zod sẽ reject build nếu frontmatter sai format
(missing field, wrong type, invalid date, v.v.). An toàn hơn nhiều so với
chỉnh CMS.

### Draft workflow

- Set `draft: true` trong frontmatter.
- Local (`npm run dev`): vẫn thấy.
- Production (`npm run build`): tự động loại.

---

## Cập nhật trang About / CV

Edit `src/content/about/about.mdx`:

- Frontmatter chứa data có cấu trúc (skills, experience, education...) — được
  render thành các terminal card tự động.
- Body MDX là phần "Additional Notes" ở cuối trang.

Schema ở `src/content.config.ts` (collection `about`).

---

## Đổi branding / site config

Chỉnh `src/lib/site-config.ts`:

- `name`, `handle`, `description`
- `author.email`, `socials`, `nav`
- `url` — **phải đổi trước khi deploy** (ảnh hưởng canonical, OG, sitemap, RSS)

---

## Design system

Toàn bộ design token ở `src/styles/global.css` theo Tailwind 4 syntax
(`@theme { ... }`):

| Token            | Giá trị               | Ý nghĩa                      |
| ---------------- | --------------------- | ---------------------------- |
| `--color-bg`     | `#0a0a0a`             | nền chính                    |
| `--color-fg`     | `#e5e5e5`             | text chính                   |
| `--color-accent` | `#c8ff00`             | lime accent — CTA, link, bar |
| `--color-border` | `#2a2a2a`             | viền card                    |
| `--font-mono`    | `JetBrains Mono, ...` | typography toàn site         |

Đổi ở đây là đổi toàn site. Component KHÔNG hard-code màu hex — luôn dùng
token qua `var(--color-*)` hoặc Tailwind utility class.

---

## Deploy lên Cloudflare Pages

> **Khuyến nghị:** dùng CF Pages direct integration (không qua GH Actions).

### 1. Push repo lên GitHub

```bash
gh repo create jvinhit-blog --public --source=. --push
# hoặc setup remote thủ công rồi git push
```

### 2. Connect với Cloudflare Pages

1. Vào Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages**
   → **Connect to Git**.
2. Chọn repo.
3. Build settings:
   - **Framework preset**: `Astro`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node version**: `22` (thêm ở Environment variables: `NODE_VERSION=22`)
4. Save & Deploy.

Cloudflare sẽ:

- Build mỗi lần push `main`.
- Tạo preview cho mỗi PR.
- Cache asset với immutable fingerprint.
- Serve qua 300+ edge nodes.

### 3. Custom domain

1. CF Pages → **Custom domains** → Add `jvinhit.dev`.
2. Nếu domain đã manage bởi Cloudflare → tự chỉnh DNS.
3. Nếu không → trỏ CNAME về `<project>.pages.dev`.

Sau đó quay lại sửa `SITE.url` trong `src/lib/site-config.ts` → push → done.

### Deploy lên GitHub Pages (đã setup sẵn)

Repo đã có workflow `.github/workflows/deploy-gh-pages.yml` — chỉ cần enable
Pages trong repo settings và push là xong.

**Kiến trúc base path**

Project site của GH Pages serve tại `https://<user>.github.io/<repo>/` nên
mọi internal link cần prepend `/<repo>`. Ta xử lý tự động qua env var:

| Env var     | Local / CF Pages     | GitHub Pages project       |
| ----------- | -------------------- | -------------------------- |
| `SITE_URL`  | _(unset → SITE.url)_ | `https://<user>.github.io` |
| `BASE_PATH` | _(unset → `/`)_      | `/<repo>`                  |

Workflow đã hard-code giá trị cho repo `jvinhit/jvinhit-blog`. **Nếu rename
repo hoặc fork sang tên khác, đổi 2 env var trong
`.github/workflows/deploy-gh-pages.yml` cho khớp.**

**Các bước enable lần đầu**

1. Push code lên `main` (workflow sẽ tự chạy lần đầu nhưng fail vì Pages
   chưa bật — đó là bình thường).
2. Vào GitHub repo → **Settings** → **Pages**.
3. Ở mục **Build and deployment → Source**: chọn **GitHub Actions**.
4. Chạy lại workflow: tab **Actions** → "Deploy to GitHub Pages" → **Run
   workflow** (hoặc push thêm 1 commit bất kỳ lên `main`).
5. Sau khi job xanh, URL production sẽ xuất hiện trong log job **deploy** và
   ở mục **Settings → Pages → Your site is live at ...**.

**Test base path locally**

```bash
SITE_URL=https://jvinhit.github.io BASE_PATH=/jvinhit-blog npm run build
npx serve dist  # hoặc python3 -m http.server -d dist 8000
# Mở http://localhost:3000/jvinhit-blog/ (KHÔNG phải /)
```

**Đổi sang custom domain sau này**

1. Thêm file `public/CNAME` chứa domain (ví dụ `jvinhit.dev`).
2. Trong `.github/workflows/deploy-gh-pages.yml`:
   - Đổi `SITE_URL` → `https://jvinhit.dev`
   - **Xóa dòng `BASE_PATH`** (hoặc set `BASE_PATH: /`).
3. Update `SITE.url` trong `src/lib/site-config.ts` cho đồng bộ.
4. DNS của domain trỏ về IP của GH Pages (xem docs GitHub).

### (Alternative) Cloudflare Pages

Xem section phía trên — recommended cho production vì analytics + faster
rebuild. Config Cloudflare không cần `BASE_PATH` vì luôn serve tại root.

---

## CI

`.github/workflows/ci.yml` chạy trên mọi push + PR:

- `npm run check` — type-check + content schema validation
- `npm run build` — sanity check build không vỡ

CI này **không deploy** — Cloudflare Pages lo phần đó. CI chỉ bảo vệ `main`
khỏi commit vỡ build.

---

## Cấu trúc thư mục

```
src/
  components/
    about/          — SkillBar (CV-only components)
    blog/           — ArticleCard, PostMeta
    layout/         — Header, Footer
    ui/             — Container, TerminalBox (primitives)
  content/
    posts/          — *.mdx bài viết (thêm ở đây)
    about/          — about.mdx (CV page)
  layouts/          — BaseLayout, PostLayout
  lib/
    site-config.ts  — branding, nav, socials
    format.ts       — date + reading time helpers
  pages/            — routes (Astro file-based)
  styles/
    global.css      — design tokens + base
    prose.css       — typography cho MDX render
  content.config.ts — Zod schemas cho collections
public/             — static files (favicon, robots.txt)
```

---

## Roadmap gợi ý (không bắt buộc)

Khi bạn muốn mở rộng, thêm dần:

- [ ] OG image generator (Satori) — auto-tạo OG card cho mỗi post
- [ ] Client-side search (Pagefind) — `npm install -D pagefind`
- [ ] Cloudflare Web Analytics — thêm 1 snippet vào `BaseLayout`
- [ ] Comments (Giscus / Utterances) — map tới GitHub Discussions
- [ ] Dark/light toggle — hiện chỉ dark theme
- [ ] Newsletter — ConvertKit / Buttondown integration
- [ ] i18n — Astro có `astro:i18n` built-in

Thêm khi cần, không thêm khi chưa cần.

---

## License

MIT — nội dung bài viết thuộc tác giả, code boilerplate free to reuse.
