# Mzee

成都学长研究中心的静态娱乐页面，使用原生 HTML、CSS 和 JavaScript。

- GitHub 仓库：<https://github.com/wenxwux/mzee>（私有）
- Pages 地址：<https://mzee.pages.dev>
- 自定义域名：<https://mzee.ninedrive.cn>

## 目录

```text
public/
  index.html              # 页面入口
  assets/
    css/styles.css        # 页面样式
    js/main.js            # 页面交互
    js/companion.js       # 呼吸几何：同步旋转、互动舒展与自动恢复
    images/portrait.jpeg  # 头像
wrangler.jsonc            # Cloudflare Pages 输出目录
```

## 本地预览

在项目根目录运行 `python3 -m http.server 8080 --directory public`，然后打开 <http://localhost:8080>。项目没有构建依赖，也无需安装 npm 包。

头像左下方的呼吸几何会随头像旋转呼吸。鼠标在附近移动，或使用点击、触屏点按、Enter / 空格，可逐渐提高松弛度，从十二道放射纹展开为六瓣交织图案。停止互动 1.4 秒后逐渐恢复，完全恢复约需 8 秒。暂停头像时同步暂停呼吸；系统开启“减少动态效果”时停止自动呼吸和旋转，仍可互动改变形态。

## Cloudflare Pages

通过 Cloudflare Pages 的 GitHub 集成部署此仓库：

- 生产分支：`main`
- 框架预设：`None`
- 构建命令：留空
- 构建输出目录：`public`
- 自定义域名：`mzee.ninedrive.cn`

推送到 `main` 后由 Cloudflare 自动发布。只发布 `public/` 内的文件，IDE 配置和文档不会进入站点。

DNS 使用代理开启的 CNAME：`mzee.ninedrive.cn` → `mzee.pages.dev`。域名也必须在 Pages 项目的 Custom domains 中关联；仅添加 DNS 记录不够。

官方说明：[Git 集成](https://developers.cloudflare.com/pages/configuration/git-integration/)、[自定义域名](https://developers.cloudflare.com/pages/configuration/custom-domains/)。

## 回滚

后续发布有问题时，可在 Cloudflare Pages 的 Deployments 中将此前成功的生产部署设为回滚目标，并在 Git 中修复或还原对应变更。
