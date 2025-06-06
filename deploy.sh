#!/bin/bash

echo "🚀 Starting deployment process..."

# Step 1: Clean previous builds
echo "📁 Cleaning previous builds..."
rm -rf out .next output/output.zip

# Step 2: Install dependencies
echo "📦 Installing dependencies..."
bun install

# Step 3: Run build
echo "🔨 Building project..."
bun run build

# Check if build was successful
if [ ! -d "out" ]; then
    echo "❌ Build failed - out directory not found"
    exit 1
fi

# Step 4: Add deployment optimization files
echo "⚡ Adding optimization files..."
cd out

# Add redirects for SPA routing
echo '/*    /index.html   200' > _redirects

# Add security and caching headers
cat > _headers << 'HEADERS_EOF'
/*
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  X-Content-Type-Options: nosniff
  Cache-Control: public, max-age=31536000

/*.html
  Cache-Control: public, max-age=0, must-revalidate

/robots.txt
  Cache-Control: public, max-age=86400

/sitemap.xml
  Cache-Control: public, max-age=86400
HEADERS_EOF

cd ..

# Step 5: Create deployment package
echo "📦 Creating deployment package..."
mkdir -p output
cd out && zip -r ../output/output.zip .
cd ..

# Step 6: Verify package
echo "✅ Verifying deployment package..."
echo "Package size: $(du -h output/output.zip | cut -f1)"
echo "Files included:"
unzip -l output/output.zip | grep -E "(index.html|robots.txt|sitemap.xml|_redirects|_headers)" | head -10

echo ""
echo "🎉 Deployment package ready!"
echo ""
echo "📋 Next Steps:"
echo "1. Visit https://app.netlify.com/"
echo "2. Click 'Add new site' → 'Deploy manually'"
echo "3. Drag and drop: seo-link-site/output/output.zip"
echo "4. Wait for deployment to complete"
echo ""
echo "📁 Deployment file: output/output.zip"
echo "📄 Configuration: netlify.toml"
