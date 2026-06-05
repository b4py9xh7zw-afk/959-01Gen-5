import 'reflect-metadata'
import { AppDataSource } from './data-source.js'
import { User } from './entities/User.js'
import { SamplePack } from './entities/SamplePack.js'
import { SamplePackCategory } from './types.js'
import bcrypt from 'bcryptjs'

const seedData = async () => {
  await AppDataSource.initialize()
  console.log('数据库已连接')

  const userRepo = AppDataSource.getRepository(User)
  const packRepo = AppDataSource.getRepository(SamplePack)

  const existingUsers = await userRepo.count()
  if (existingUsers === 0) {
    const adminPassword = await bcrypt.hash('admin123', 10)
    const userPassword = await bcrypt.hash('user123', 10)

    const admin = userRepo.create({
      email: 'admin@samplestore.com',
      name: '系统管理员',
      passwordHash: adminPassword,
      isAdmin: true
    })

    const user = userRepo.create({
      email: 'producer@example.com',
      name: '音乐制作人',
      passwordHash: userPassword,
      isAdmin: false
    })

    await userRepo.save([admin, user])
    console.log('测试用户已创建')
    console.log('管理员: admin@samplestore.com / admin123')
    console.log('普通用户: producer@example.com / user123')
  }

  const existingPacks = await packRepo.count()
  if (existingPacks === 0) {
    const samplePacks = [
      {
        name: 'Trap King Drum Kit Vol.1',
        description: '顶级Trap鼓组采样包，包含200+精心录制的鼓点音色，从808底鼓到清脆的军鼓，适合现代Trap、Hip-Hop制作。',
        category: SamplePackCategory.DRUMS,
        basePrice: 99,
        producerName: 'King Beats',
        sampleCount: 220,
        totalDuration: '45分钟',
        version: '1.2.0',
        tags: ['Trap', 'Hip-Hop', '808', 'Drum Kit'],
        coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20trap%20drum%20machine%20with%20neon%20lights%20dark%20background&image_size=square_hd'
      },
      {
        name: 'Lo-Fi Hip-Hop Drum Essentials',
        description: '复古Lo-Fi鼓组，融合90年代Boom Bap风格，包含温暖的底鼓、质感军鼓和经典的碎拍循环。',
        category: SamplePackCategory.DRUMS,
        basePrice: 79,
        producerName: 'Vinyl Dreams',
        sampleCount: 180,
        totalDuration: '38分钟',
        version: '1.0.1',
        tags: ['Lo-Fi', 'Boom Bap', 'Hip-Hop', 'Vintage'],
        coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20drum%20machine%20with%20vinyl%20records%20warm%20lighting&image_size=square_hd'
      },
      {
        name: 'Soulful Vocal Adlibs',
        description: '专业录音室品质的人声采样包，包含各类即兴演唱、和声、转音和独特的人声效果，适用于各种音乐风格。',
        category: SamplePackCategory.VOCALS,
        basePrice: 129,
        producerName: 'Soul Sisters Studio',
        sampleCount: 150,
        totalDuration: '60分钟',
        version: '2.1.0',
        tags: ['Vocal', 'Soul', 'R&B', 'Adlibs'],
        coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20recording%20studio%20microphone%20with%20warm%20lighting&image_size=square_hd'
      },
      {
        name: 'Electronic Vocal Chop Pack',
        description: '电子音乐人声切片包，包含经过创意处理的人声切片、音高变换效果和Glitch人声，适合EDM、Future Bass制作。',
        category: SamplePackCategory.VOCALS,
        basePrice: 89,
        producerName: 'Neon Audio',
        sampleCount: 200,
        totalDuration: '52分钟',
        version: '1.5.0',
        tags: ['EDM', 'Vocal Chop', 'Future Bass', 'Electronic'],
        coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=colorful%20sound%20waves%20with%20neon%20glow%20abstract%20music&image_size=square_hd'
      },
      {
        name: 'Cinematic Ambient Textures',
        description: '电影级环境音纹理采样包，包含深沉的氛围音、渐变Pad和独特的声景设计，为你的作品增添电影质感。',
        category: SamplePackCategory.AMBIENT,
        basePrice: 149,
        producerName: 'Cinematic Sound Lab',
        sampleCount: 120,
        totalDuration: '90分钟',
        version: '2.0.0',
        tags: ['Cinematic', 'Ambient', 'Pad', 'Soundscape'],
        coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ethereal%20atmospheric%20landscape%20with%20soft%20light%20rays&image_size=square_hd'
      },
      {
        name: 'Urban Field Recordings',
        description: '都市田野录音采样包，收录来自世界各地城市的环境声音，包括地铁、街头、咖啡馆等真实场景录音。',
        category: SamplePackCategory.AMBIENT,
        basePrice: 69,
        producerName: 'Field Sounds Collective',
        sampleCount: 80,
        totalDuration: '120分钟',
        version: '1.1.0',
        tags: ['Field Recording', 'Urban', 'Ambient', 'Real World'],
        coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=city%20street%20at%20night%20with%20bokeh%20lights%20urban%20atmosphere&image_size=square_hd'
      }
    ]

    for (const packData of samplePacks) {
      const pack = packRepo.create(packData)
      await packRepo.save(pack)
    }
    console.log('采样包数据已创建')
  }

  console.log('种子数据初始化完成')
  await AppDataSource.destroy()
}

seedData().catch(console.error)
