# LogicQuest3D - Deployment Guide

## Quick Start

### Local Development
```bash
npm install
npm run dev
```
Visit http://localhost:5173

### Production Build
```bash
npm run build
npm run preview
```

## Deploy to Vercel (Recommended)

### Option 1: Vercel CLI
```bash
npm i -g vercel
vercel login
vercel
```

### Option 2: GitHub Integration
1. Push code to GitHub
2. Go to https://vercel.com/new
3. Import your repository
4. Click "Deploy"
5. Done! Vercel auto-detects the configuration

### Configuration
The `vercel.json` file is pre-configured with:
- Static build output from `dist/`
- Proper routing for SPA
- Automatic builds on push

## Deploy to Render

### Option 1: Dashboard
1. Go to https://render.com
2. Click "New +" → "Static Site"
3. Connect your GitHub repository
4. Settings (auto-detected from `render.yaml`):
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
5. Click "Create Static Site"

### Option 2: Blueprint
The included `render.yaml` automatically configures:
- Build commands
- Publish directory
- Routing rules

## Deploy to Netlify

### Option 1: Drag and Drop
```bash
npm run build
```
Drag the `dist/` folder to https://app.netlify.com/drop

### Option 2: Netlify CLI
```bash
npm i -g netlify-cli
netlify login
netlify deploy --prod
```

Select `dist` as the publish directory.

## Deploy to GitHub Pages

1. Update `vite.config.js` base path:
```javascript
base: '/logicquest3d/'  // Your repo name
```

2. Build and deploy:
```bash
npm run build
npx gh-pages -d dist
```

3. Enable GitHub Pages in repository settings

## Environment Variables

No environment variables needed! The game is fully static.

## Performance Tips

### Optimization Applied
- Code splitting (Three.js, postprocessing, game code)
- Tree shaking
- Minification
- Gzip compression
- Lazy loading of zones

### CDN Benefits
All hosting platforms provide:
- Global CDN distribution
- HTTP/2 support
- Automatic SSL
- Edge caching

### Expected Load Times
- First visit: ~2-3 seconds
- Return visit: ~0.5 seconds (cached)
- Total size: ~690KB (~210KB gzipped)

## Browser Support

### Recommended
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Requirements
- WebGL 2.0 support
- ES6 modules support
- Pointer Lock API

## Troubleshooting

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Blank Screen
- Check browser console for errors
- Ensure WebGL is enabled
- Try a different browser

### Post-Processing Warnings
The game gracefully falls back to standard rendering if post-processing isn't available. This is expected in some environments.

## Monitoring

After deployment, you can monitor:
- Vercel: Built-in analytics and logs
- Render: Logs in dashboard
- Netlify: Analytics and function logs

## Custom Domain

All platforms support custom domains:
1. Purchase domain from registrar
2. Add domain in hosting platform dashboard
3. Update DNS records as instructed
4. SSL automatically provisioned

## Updates

To update the deployed game:
```bash
git add .
git commit -m "Update game"
git push
```

Vercel and Render auto-deploy on push!

## Support

For issues:
1. Check browser console
2. Verify WebGL support: https://get.webgl.org/
3. Test locally with `npm run dev`
4. Review build output for errors

## Production Checklist

- [x] Game builds successfully
- [x] All features work in production build
- [x] No console errors
- [x] Performance is acceptable
- [x] Works on target browsers
- [x] Deployment configuration included
- [x] Documentation complete
- [x] Security scan passed

## Next Steps

1. Deploy to your preferred platform
2. Test the live game
3. Share the URL!
4. Consider adding:
   - Analytics (Google Analytics, Plausible)
   - Error tracking (Sentry)
   - User feedback system
   - Leaderboards/high scores
   - More zones and content

Enjoy your 3D RPG adventure! 🎮✨
