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
    js/geometry.mjs       # 连续几何曲线
    js/knot-contours.mjs  # 六瓣结的归一化轮廓数据
    images/portrait.jpeg  # 头像
wrangler.jsonc            # Cloudflare Pages 输出目录
```

## 本地预览

在项目根目录运行 `python3 -m http.server 8080 --directory public`，然后打开 <http://localhost:8080>。项目没有构建依赖，也无需安装 npm 包。

头像左下方的呼吸几何在没有互动时也会自然呼吸：约每 6 秒一个周期，沿 Claude 放射形到 ChatGPT 六瓣结的同一变形路径，在 0%–25% 进度之间缓慢往返，不单独缩放图案；完全收拢时中心闭合，与头像旋转同步；浏览器无法提供头像动画时钟时使用独立时钟。鼠标在附近移动，或使用点击、触屏点按、Enter / 空格，可逐渐提高松弛度，从长短、宽窄及间距均不对称的十二道放射纹展开为六瓣交织图案。停止互动 0.4 秒后逐渐恢复，完全恢复约需 3 秒。暂停头像时同步暂停呼吸；系统开启“减少动态效果”时停止自动呼吸和旋转，仍可互动改变形态。

几何元素不显示标题、百分比、提示语或进度条。初始 SVG 直接内嵌，即使交互脚本尚未加载，也能显示图案。

六瓣结轮廓参考 [OpenAI 官方公开矢量素材](https://cdn.openai.com/brand/OpenAI-Logos-2025.zip) 中的 Blossom，归一化后用于此娱乐页面的形态变换；本项目与 OpenAI 无隶属关系。图形采用单一外轮廓和 SVG 遮罩，避免独立花瓣叠盖造成的断裂观感。

本地检查：`node --test tests/*.test.mjs`。推送前还需在本地浏览器检查初始、中间、完全舒展和自动恢复状态，以及桌面和手机布局；通过后再推送 `main` 触发线上部署。

HTML 和模块引用的 CSS/JS 均带统一版本参数（当前 `20260923-8`）；修改这些文件时同步递增所有引用的版本。`public/_headers` 要求浏览器重新验证资源，避免旧缓存与新 HTML 混用。发布前需验证从上一版缓存升级的场景。

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
