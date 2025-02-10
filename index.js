// 基础的 Express 服务器示例
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// 假设构建后的静态文件位于 dist 目录中
app.use(express.static(path.join(__dirname, 'dist')));

// 所有请求都返回 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`服务器正在 http://localhost:${port} 上运行`);
});
