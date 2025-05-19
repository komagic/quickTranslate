const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 使用 esbuild 编译 TypeScript 代码
console.log('Compiling TypeScript files...');
try {
  // 为每个入口文件单独编译
  execSync('npx esbuild src/background/background.ts --outfile=dist/background.js --bundle --platform=browser', { stdio: 'inherit' });
  execSync('npx esbuild src/content/content.ts --outfile=dist/content.js --bundle --platform=browser', { stdio: 'inherit' });
  execSync('npx esbuild src/popup/popup.ts --outfile=dist/popup.js --bundle --platform=browser', { stdio: 'inherit' });
  execSync('npx esbuild src/options/options.ts --outfile=dist/options.js --bundle --platform=browser', { stdio: 'inherit' });
  console.log('TypeScript compilation completed successfully.');
} catch (error) {
  console.error('Error compiling TypeScript:', error);
  process.exit(1);
}

// 确保目标目录存在
const distDir = path.resolve(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 复制 manifest.json
const sourceManifest = path.resolve(__dirname, 'src/manifest.json');
const targetManifest = path.resolve(distDir, 'manifest.json');

fs.copyFileSync(sourceManifest, targetManifest);
console.log('Manifest file copied successfully.');

// 复制 HTML 文件并更新引用
const copyHtmlFile = (source, target) => {
  let content = fs.readFileSync(source, 'utf8');
  
  // 替换 .tsx 和 .ts 引用为 .js，并调整路径
  content = content.replace(/src="(.*?)\/(.*?)\.tsx"/g, 'src="$2.js"');
  content = content.replace(/src="(.*?)\/(.*?)\.ts"/g, 'src="$2.js"');
  
  fs.writeFileSync(target, content);
};

const popupHtml = path.resolve(__dirname, 'src/popup/popup.html');
const targetPopupHtml = path.resolve(distDir, 'popup.html');
copyHtmlFile(popupHtml, targetPopupHtml);

const optionsHtml = path.resolve(__dirname, 'src/options/options.html');
const targetOptionsHtml = path.resolve(distDir, 'options.html');
copyHtmlFile(optionsHtml, targetOptionsHtml);

console.log('HTML files copied and updated.');

// 复制 CSS 文件
const copyCssFiles = () => {
  const sourceCssDir = path.resolve(__dirname, 'src/styles');
  const targetCssDir = path.resolve(distDir, 'styles');
  
  if (fs.existsSync(sourceCssDir)) {
    if (!fs.existsSync(targetCssDir)) {
      fs.mkdirSync(targetCssDir, { recursive: true });
    }
    
    const cssFiles = fs.readdirSync(sourceCssDir).filter(file => file.endsWith('.css'));
    cssFiles.forEach(file => {
      const sourcePath = path.join(sourceCssDir, file);
      const targetPath = path.join(targetCssDir, file);
      fs.copyFileSync(sourcePath, targetPath);
    });
    
    console.log('CSS files copied successfully.');
  }
};

copyCssFiles();

// 复制其他资源文件
const copyAssets = (source, target) => {
  if (fs.existsSync(source)) {
    if (fs.lstatSync(source).isDirectory()) {
      if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
      }
      
      const entries = fs.readdirSync(source);
      entries.forEach(entry => {
        const srcPath = path.join(source, entry);
        const tgtPath = path.join(target, entry);
        copyAssets(srcPath, tgtPath);
      });
    } else {
      fs.copyFileSync(source, target);
    }
  }
};

// 复制图标和其他资源
const assetsDir = path.resolve(__dirname, 'src/assets');
const distAssetsDir = path.resolve(distDir, 'assets');
if (fs.existsSync(assetsDir)) {
  copyAssets(assetsDir, distAssetsDir);
  console.log('Assets copied successfully.');
}

console.log('Build post-processing completed.'); 