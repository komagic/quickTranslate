# 快速翻译 Chrome 插件

## 项目简介

快速翻译是一个基于 React 的 Chrome 插件，旨在为用户提供便捷的网页翻译功能。该插件支持多种翻译服务，用户可以轻松选择目标语言并进行翻译。

## 功能特性

- **多种翻译服务**：支持 Google Translate、DeepL 和 OpenAI 等翻译服务。
- **用户友好的界面**：使用 Material-UI 设计的现代化界面。
- **实时翻译**：在网页上实时翻译文本，支持选择翻译和整页翻译。
- **设置选项**：用户可以自定义默认语言和翻译服务。

## 安装与使用

1. **克隆项目**：
   ```bash
   git clone https://github.com/yourusername/quick-translate.git
   cd quick-translate
   ```

2. **安装依赖**：
   ```bash
   npm install
   ```

3. **启动开发模式**：
   ```bash
   npm run dev
   ```

4. **加载插件**：
   - 打开 Chrome 浏览器，进入 `chrome://extensions/`。
   - 开启开发者模式。
   - 点击“加载已解压的扩展程序”，选择项目的 `dist` 目录。

## 配置

在使用插件之前，你可以在设置页面中输入你的翻译服务 API 密钥（如 Google Translate、DeepL 和 OpenAI），并选择默认的目标语言和翻译服务。

## 贡献

欢迎任何形式的贡献！如果你有建议或发现了问题，请提交 issue 或者直接提交 pull request。

## 许可证

该项目采用 MIT 许可证，详情请参阅 [LICENSE](LICENSE) 文件。

## 联系方式

如有任何问题，请联系 [你的邮箱](mailto:your-email@example.com)。