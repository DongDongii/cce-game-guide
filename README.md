# CCE Game Guide

Professional gaming guide website with SEO article management system.

## 🎯 Features

- Professional SEO article management system
- Password-protected admin dashboard
- Rich text editor with Markdown support
- Simple writing mode for easy article creation
- Article recommendation and publish/unpublish functionality
- Auto URL slug generation and keyword extraction
- GMYGM link integration for SEO
- Complete SEO optimization
- Responsive design

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Bun (recommended) or npm

### Installation
```bash
# Clone the repository
git clone https://github.com/DongDongii/cce-game-guide.git
cd cce-game-guide

# Install dependencies
bun install

# Start development server
bun run dev
```

Visit `http://localhost:3000` to see the website.

### Admin Access
- Visit `/admin`
- Password: `cce2024admin`
- Click "Create Sample Articles" to add demo content

## 📦 Deployment

### Netlify (Recommended)
1. Connect your GitHub repository to Netlify
2. Build settings:
   - Build command: `bun run build`
   - Publish directory: `out`
3. Deploy automatically on every commit

### Build Commands
```bash
# Production build
bun run build

# Start production server (local testing)
bun run start

# Lint code
bun run lint
```

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Package Manager**: Bun
- **Deployment**: Netlify (static export)

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard
│   ├── article/           # Article detail page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── SEOArticleEditor.tsx
│   ├── StructuredData.tsx
│   └── TopBanner.tsx
└── lib/                   # Utility functions
    ├── seoSystem.ts       # Article management
    ├── sampleArticles.ts  # Demo articles
    └── utils.ts           # Helper functions
```

## 🎮 Usage

### Creating Articles
1. Access admin dashboard at `/admin`
2. Use "Simple Writing Mode" for easy editing
3. Or use "Advanced Mode" for full SEO control
4. Set article as "Recommended" for featured content
5. Toggle "Active" status to publish/unpublish

### Article Features
- Automatic URL slug generation from titles
- Keyword extraction from content
- SEO metadata optimization
- External link management
- Category organization

## 🔗 SEO Features

- Structured data (JSON-LD)
- Meta tags optimization
- Sitemap generation
- Robots.txt
- External link management with proper rel attributes

## 📱 Admin Dashboard

- Article list with search and filtering
- Category management
- SEO statistics overview
- Bulk operations
- Draft and published article management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 👨‍💻 Author

**DongDongii**
GitHub: [@DongDongii](https://github.com/DongDongii)
