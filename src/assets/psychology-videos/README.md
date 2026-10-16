# 心理视频库素材目录规范与说明 (Psychology Videos)

本目录为「安心健康」心理视频库专用的视频素材源文件存放位置。为了便于前端播放器以最佳性能原生流式读取，文件同时映射于 `public/videos/psychology/`。

---

## 一、当前精选视频列表与就绪状态

| 视频 ID | 主题分类 | 视频标题 | 对应文件名 | 当前状态 | 授权 / 来源 |
| :--- | :--- | :--- | :--- | :---: | :--- |
| `relax-1` | 放松与舒缓 | 《把一天放慢 - 呼吸与身心减速》 | `breathe_calm.mp4` / `.webm` | **✅ 已就绪 (可播放)** | CC0 / FFmpeg 本地程序化合成 |
| `relax-2` | 放松与舒缓 | 《林间深呼吸 - 自然光影与深呼吸》 | `ambient_forest.mp4` | **✅ 已就绪 (可播放)** | CC0 / FFmpeg 本地程序化合成 |
| `emotion-1` | 情绪与自我接纳 | 《认识一下心情 - 情绪来了可以坐下》 | `emotion_acceptance.mp4` | **⏳ 待补充 (内容准备中)** | 待补充合法素材 |
| `emotion-2` | 情绪与自我接纳 | 《与内心的严苛对话 - 把批评家变引路人》 | `inner_dialogue.mp4` | **⏳ 待补充 (内容准备中)** | 待补充合法素材 |
| `sleep-1` | 睡眠与休息 | 《睡前把灯调暗 - 给夜晚留一点软》 | `sleep_dim_light.mp4` | **⏳ 待补充 (内容准备中)** | 待补充合法素材 |
| `sleep-2` | 睡眠与休息 | 《肩颈松一口气 - 身体扫描与微动作》 | `body_scan.mp4` | **⏳ 待补充 (内容准备中)** | 待补充合法素材 |

---

## 二、手动补充视频的操作步骤

当你准备好真实视频后：
1. 将视频重命名为上表中的目标文件名（例如 `emotion_acceptance.mp4`）；
2. 放入 `public/videos/psychology/` 目录；
3. 打开 `src/data/content.ts`，找到对应条目将 `isReady: false` 改为 `isReady: true`；
4. 刷新网页，卡片即可自动点亮并支持全屏、音量、进度条完整播放。

---

## 三、推荐规格与无版权素材来源

- **推荐编码与格式**：MP4 (H.264 / AAC) 或 WebM (VP9)，分辨率 1920×1080 或 1280×720，25~30 fps。
- **推荐合法免费 CC0 视频渠道**：
  - [Pexels Nature / Meditation Videos](https://www.pexels.com/videos/) (CC0 免版税商用许可)
  - [Pixabay Relaxation Footage](https://pixabay.com/videos/) (Pixabay 免版税许可)
  - [Wikimedia Commons Public Domain Videos](https://commons.wikimedia.org/)
