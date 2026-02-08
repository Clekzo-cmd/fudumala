// Script to update HTML files with component placeholders
const fs = require('fs');
const path = require('path');

// Navigation component placeholder
const navigationPlaceholder = `    <!-- Navigation Component -->
    <div id="navigation-component">
      <!-- Navigation will be loaded here -->
    </div>`;

// Footer component placeholder
const footerPlaceholder = `    <!-- Footer Component -->
    <div id="footer-component">
      <!-- Footer will be loaded here -->
    </div>`;

// Component loader script
const componentLoaderScript = `
  <!-- Component Loader -->
  <script src="js/component-loader.js"></script>`;

function updateHtmlFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove existing navigation (from navbar6_component to </div>)
    const navRegex = /<div[^>]*class="[^"]*navbar6_component[^"]*"[^>]*>[\s\S]*?<\/div>\s*<\/div>/g;
    content = content.replace(navRegex, navigationPlaceholder);
    
    // Remove existing footer (from footer class to </footer>)
    const footerRegex = /<footer[^>]*class="[^"]*footer-minimal[^"]*"[^>]*>[\s\S]*?<\/footer>/g;
    content = content.replace(footerRegex, footerPlaceholder);
    
    // Add component loader script before closing body tag if not already present
    if (!content.includes('component-loader.js')) {
      content = content.replace('</body>', `${componentLoaderScript}
</body>`);
    }
    
    // Remove duplicate navigation styles (keep only in components)
    const navStylesRegex = /\/\* Sticky Navigation Styles \*\/[\s\S]*?(?=\/\*|<\/style>)/g;
    content = content.replace(navStylesRegex, '');
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
}

// Get all HTML files in the directory
const htmlFiles = [
  'index.html',
  'about-us.html', 
  'news.html',
  'sponsor-a-jersey.html',
  'get-involved.html',
  'contact-us.html',
  'faq.html',
  '2023-impact-stories.html',
  '2024-impact-stories.html', 
  '2025-impact-stories.html',
  'how-it-works.html',
  'privacy-policy.html',
  'terms-of-service.html',
  'cookie-policy.html',
  'thank-you.html',
  'sorry-to-see-you-go.html'
];

console.log('Updating HTML files with component placeholders...');
htmlFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    updateHtmlFile(filePath);
  } else {
    console.log(`File not found: ${file}`);
  }
});

console.log('Component update complete!');