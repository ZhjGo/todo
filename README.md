# 番茄时钟 & 待办事项

一个结合了番茄工作法和待办事项列表的 Web 应用，界面简洁、交互流畅。项目已为 Vercel 部署进行优化，并使用 Vercel KV 实现待办事项的云端数据同步。

## ✨ 主要功能

- **番茄时钟**:
  - 可自定义的专注时间和休息时间。
  - 带有进度环和状态显示的计时器。
  - 完成一个番茄钟或休息后有声音提醒。
  - 自动统计完成的番茄数量、总专注时间和周期数。
- **待办事项列表**:
  - 添加、删除、标记完成任务。
  - 按“全部”、“进行中”、“已完成”筛选任务。
  - 任务数据通过 Vercel KV 存储，实现跨设备同步。
- **精美 UI**:
  - 使用 Tailwind CSS 构建，响应式设计，适配桌面和移动设备。
  - 简洁的界面，带有流畅的动画效果。

## 🛠️ 技术栈

- **前端**: HTML, CSS, 原生 JavaScript (ES6+)
- **UI 框架**: Tailwind CSS
- **部署平台**: Vercel
- **数据存储**: Vercel KV (基于 Upstash Redis)

## 🚀 本地开发

本项目依赖 Node.js 环境。

1.  **克隆仓库**
    ```bash
    git clone <your-repository-url>
    cd <repository-name>
    ```

2.  **安装依赖**
    ```bash
    npm install
    ```

3.  **UI 预览 (无数据同步)**
    如果你只想快速预览或调试界面，可以运行以下命令。这会启动一个简单的本地服务器。
    ```bash
    # 首先，构建一次 CSS 文件
    npm run build

    # 然后，启动预览服务器
    npm start
    ```
    在浏览器中打开 `http://localhost:3000`。

4.  **完整功能测试 (需要连接 Vercel)**
    要测试包括数据同步在内的所有功能，你需要使用 Vercel CLI。
    ```bash
    # 安装 Vercel CLI (如果尚未安装)
    npm install -g vercel

    # 登录并关联项目
    vercel login
    vercel link

    # 拉取环境变量 (包含 KV 数据库连接信息)
    vercel env pull .env.development.local

    # 启动开发服务器
    vercel dev
    ```
    `vercel dev` 会启动一个功能完整的本地环境，模拟真实的 Vercel 平台。

## ☁️ 部署到 Vercel

本项目已为 Vercel 部署完全优化。

1.  **推送代码**: 将你的代码推送到一个 GitHub (或 GitLab/Bitbucket) 仓库。

2.  **导入项目**: 在 Vercel 网站上，导入你刚刚创建的 Git 仓库。Vercel 会自动识别 `package.json` 并配置好构建设置。

3.  **关联 KV 数据库**:
    - 在 Vercel 项目的仪表盘中，进入 **Storage** 标签页。
    - 选择 **Upstash (Redis)** 创建一个新的 KV 数据库。
    - 在创建过程中，将其**连接到当前项目**。
    - Vercel 会自动配置好环境变量并重新部署。

完成以上步骤后，你的应用就会部署成功，并拥有一个公开的 URL。后续的 `git push` 将会自动触发更新。