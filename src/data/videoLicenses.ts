/**
 * 心理视频素材来源与授权许可台账 (Video License & Provenance Ledger)
 *
 * 规范要求：
 * 1. 严格排查素材合法版权，不使用网络未授权抓取视频；
 * 2. 对已由代码/FFmpeg 程序化生成的原创素材明确标注算法生成；
 * 3. 对待补充的视频，记录文件名命名规范、建议公有领域/CC0 来源渠道及替换说明。
 */

export interface VideoLicenseRecord {
  videoId: string
  title: string
  expectedFileName: string
  storageDirectory: string
  status: 'available' | 'pending_manual_upload'
  licenseType: string
  authorOrSource: string
  sourceUrl?: string
  confirmDate: string
  description: string
  recommendedSpecs: string
}

export const VIDEO_LICENSE_RECORDS: VideoLicenseRecord[] = [
  {
    videoId: 'relax-1',
    title: '把一天放慢 - 呼吸与身心减速',
    expectedFileName: 'breathe_calm.mp4',
    storageDirectory: 'public/videos/psychology/',
    status: 'available',
    licenseType: 'CC0 1.0 Universal / Project Procedural Original',
    authorOrSource: 'AI Studio 本地程序化合成 (FFmpeg filtergraph 自研渲染)',
    confirmDate: '2026-10-16',
    description: '采用深绿林意渐变背景、平滑呼吸舒缓节奏与 4-7-8 呼吸引导动画程序化生成，无第三方版权限制。',
    recommendedSpecs: '1280x720 或 1920x1080, MP4 (H.264) / WebM (VP9), 25fps, 建议 15~30 秒无缝循环',
  },
  {
    videoId: 'relax-2',
    title: '林间深呼吸 - 自然光影与深呼吸',
    expectedFileName: 'ambient_forest.mp4',
    storageDirectory: 'public/videos/psychology/',
    status: 'available',
    licenseType: 'CC0 1.0 Universal / Project Procedural Original',
    authorOrSource: 'AI Studio 本地程序化合成 (FFmpeg filtergraph 自研渲染)',
    confirmDate: '2026-10-16',
    description: '采用温暖自然绿色光影、舒缓律动微帧合成，支持全浏览器原生播放。',
    recommendedSpecs: '1280x720 或 1920x1080, MP4 (H.264) / WebM (VP9), 建议静音或舒缓自然白噪音',
  },
  {
    videoId: 'emotion-1',
    title: '认识一下心情 - 情绪来了可以坐下',
    expectedFileName: 'emotion_acceptance.mp4',
    storageDirectory: 'public/videos/psychology/',
    status: 'pending_manual_upload',
    licenseType: '待用户上传合法授权素材 (建议 CC0 / Pexels / Pixabay License)',
    authorOrSource: '待补充 (暂未放入真实文件，卡片展示「内容准备中」)',
    confirmDate: '未确认',
    description: '建议内容：温和的日落光影、微风吹拂的草地或平静水面倒影等情绪接纳向空镜。',
    recommendedSpecs: 'MP4 格式, 文件名保持 emotion_acceptance.mp4，分辨率 1080p，文件大小建议 5~25MB',
  },
  {
    videoId: 'emotion-2',
    title: '与内心的严苛对话 - 把批评家变成温柔引路人',
    expectedFileName: 'inner_dialogue.mp4',
    storageDirectory: 'public/videos/psychology/',
    status: 'pending_manual_upload',
    licenseType: '待用户上传合法授权素材 (建议 CC-BY 或自制原创旁白)',
    authorOrSource: '待补充 (暂未放入真实文件，卡片展示「内容准备中」)',
    confirmDate: '未确认',
    description: '建议内容：温暖壁炉火光、柔和手绘插画或植物抽芽生长的舒缓动画视频。',
    recommendedSpecs: 'MP4 格式, 文件名保持 inner_dialogue.mp4，时长 3~5 分钟',
  },
  {
    videoId: 'sleep-1',
    title: '睡前把灯调暗 - 给夜晚留一点软',
    expectedFileName: 'sleep_dim_light.mp4',
    storageDirectory: 'public/videos/psychology/',
    status: 'pending_manual_upload',
    licenseType: '待用户上传合法授权素材 (建议 CC0 晚间静谧星空/烛光素材)',
    authorOrSource: '待补充 (暂未放入真实文件，卡片展示「内容准备中」)',
    confirmDate: '未确认',
    description: '建议内容：昏暗暖光灯影、窗外夜空月色或深色渐变波纹，用于睡前视觉降噪。',
    recommendedSpecs: 'MP4 格式, 文件名保持 sleep_dim_light.mp4，色彩低饱和低亮度',
  },
  {
    videoId: 'sleep-2',
    title: '肩颈松一口气 - 身体扫描与微动作放松',
    expectedFileName: 'body_scan.mp4',
    storageDirectory: 'public/videos/psychology/',
    status: 'pending_manual_upload',
    licenseType: '待用户上传合法授权素材 (建议专业动作跟练录像)',
    authorOrSource: '待补充 (暂未放入真实文件，卡片展示「内容准备中」)',
    confirmDate: '未确认',
    description: '建议内容：温和颈椎拉伸跟练示范视频或肌肉放松指引动画。',
    recommendedSpecs: 'MP4 格式, 文件名保持 body_scan.mp4，音频清晰带呼吸引导',
  },
]
