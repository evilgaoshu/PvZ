import type {
  PlantConfig,
  ZombieConfig,
  LevelConfig,
  AnimationConfig,
} from '@/types/config';

// 植物动画配置模板
const createPlantAnimations = (key: string): AnimationConfig[] => [
  {
    key: `${key}_idle`,
    frames: { start: 0, end: 7, prefix: `${key}_`, suffix: '.png' },
    frameRate: 8,
    repeat: -1,
  },
  {
    key: `${key}_attack`,
    frames: { start: 8, end: 15, prefix: `${key}_`, suffix: '.png' },
    frameRate: 12,
    repeat: 0,
  },
];

// 僵尸动画配置模板
const createZombieAnimations = (key: string): AnimationConfig[] => [
  {
    key: `${key}_walk`,
    frames: { start: 0, end: 21, prefix: `${key}_walk_`, suffix: '.png' },
    frameRate: 12,
    repeat: -1,
  },
  {
    key: `${key}_eat`,
    frames: { start: 0, end: 10, prefix: `${key}_eat_`, suffix: '.png' },
    frameRate: 12,
    repeat: -1,
  },
  {
    key: `${key}_die`,
    frames: { start: 0, end: 9, prefix: `${key}_die_`, suffix: '.png' },
    frameRate: 10,
    repeat: 0,
  },
];

/**
 * 植物配置数据
 */
export const plantConfigs: Record<string, PlantConfig> = {
  sunflower: {
    id: 'sunflower',
    name: '向日葵',
    description: '生产额外的阳光',
    cost: 50,
    health: 300,
    cooldown: 7.5,
    produceAmount: 25,
    produceInterval: 24000,
    spriteSheet: 'plants/sunflower',
    animations: [
      {
        key: 'sunflower_idle',
        frames: { start: 0, end: 7, prefix: 'sunflower_', suffix: '.png' },
        frameRate: 8,
        repeat: -1,
      },
      {
        key: 'sunflower_produce',
        frames: { start: 8, end: 15, prefix: 'sunflower_', suffix: '.png' },
        frameRate: 12,
        repeat: 0,
      },
    ],
  },

  peashooter: {
    id: 'peashooter',
    name: '豌豆射手',
    description: '发射豌豆攻击僵尸',
    cost: 100,
    health: 300,
    cooldown: 7.5,
    attackDamage: 20,
    attackInterval: 1500,
    attackRange: 9,
    projectileType: 'pea',
    spriteSheet: 'plants/peashooter',
    animations: createPlantAnimations('peashooter'),
  },

  wallnut: {
    id: 'wallnut',
    name: '坚果墙',
    description: '阻挡僵尸前进的坚固墙壁',
    cost: 50,
    health: 4000,
    cooldown: 30,
    armor: 0,
    spriteSheet: 'plants/wallnut',
    animations: [
      {
        key: 'wallnut_idle',
        frames: { start: 0, end: 10, prefix: 'wallnut_', suffix: '.png' },
        frameRate: 8,
        repeat: -1,
      },
      {
        key: 'wallnut_hurt',
        frames: { start: 11, end: 20, prefix: 'wallnut_', suffix: '.png' },
        frameRate: 8,
        repeat: -1,
      },
      {
        key: 'wallnut_critical',
        frames: { start: 21, end: 30, prefix: 'wallnut_', suffix: '.png' },
        frameRate: 8,
        repeat: -1,
      },
    ],
  },

  cherry_bomb: {
    id: 'cherry_bomb',
    name: '樱桃炸弹',
    description: '爆炸并对范围内僵尸造成巨大伤害',
    cost: 150,
    health: 300,
    cooldown: 50,
    attackDamage: 1800,
    attackRange: 3, // 3x3范围
    specialEffects: ['explosion', 'instant'],
    spriteSheet: 'plants/cherry_bomb',
    animations: [
      {
        key: 'cherry_bomb_idle',
        frames: { start: 0, end: 7, prefix: 'cherry_bomb_', suffix: '.png' },
        frameRate: 8,
        repeat: -1,
      },
      {
        key: 'cherry_bomb_explode',
        frames: { start: 8, end: 15, prefix: 'cherry_bomb_', suffix: '.png' },
        frameRate: 15,
        repeat: 0,
      },
    ],
  },

  snow_pea: {
    id: 'snow_pea',
    name: '寒冰射手',
    description: '发射冰冻豌豆，减缓僵尸速度',
    cost: 175,
    health: 300,
    cooldown: 7.5,
    attackDamage: 20,
    attackInterval: 1500,
    attackRange: 9,
    projectileType: 'snow_pea',
    specialEffects: ['slow'],
    spriteSheet: 'plants/snow_pea',
    animations: createPlantAnimations('snow_pea'),
  },

  repeater: {
    id: 'repeater',
    name: '双发射手',
    description: '每次发射两颗豌豆',
    cost: 200,
    health: 300,
    cooldown: 7.5,
    attackDamage: 20,
    attackInterval: 1500,
    attackRange: 9,
    projectileType: 'pea',
    specialEffects: ['double_shot'],
    spriteSheet: 'plants/repeater',
    animations: createPlantAnimations('repeater'),
  },

  chomper: {
    id: 'chomper',
    name: '食人花',
    description: '能一口吞掉僵尸，但咀嚼时间较长',
    cost: 150,
    health: 300,
    cooldown: 7.5,
    attackDamage: 9999, // 秒杀
    attackInterval: 42000, // 咀嚼时间
    attackRange: 1,
    specialEffects: ['instakill', 'chewing'],
    placement: ['grass', 'lilypad'],
    spriteSheet: 'plants/chomper',
    animations: [
      {
        key: 'chomper_idle',
        frames: { start: 0, end: 7, prefix: 'chomper_', suffix: '.png' },
        frameRate: 8,
        repeat: -1,
      },
      {
        key: 'chomper_attack',
        frames: { start: 8, end: 20, prefix: 'chomper_', suffix: '.png' },
        frameRate: 15,
        repeat: 0,
      },
      {
        key: 'chomper_chewing',
        frames: { start: 21, end: 30, prefix: 'chomper_', suffix: '.png' },
        frameRate: 8,
        repeat: -1,
      },
    ],
  },

  lilypad: {
    id: 'lilypad',
    name: '睡莲',
    description: '让你可以在水上种植陆地植物',
    cost: 25,
    health: 300,
    cooldown: 7.5,
    placement: ['water'],
    specialEffects: ['platform'],
    spriteSheet: 'plants/lilypad',
    animations: [
      {
        key: 'lilypad_idle',
        frames: { start: 0, end: 0, prefix: 'lilypad_', suffix: '.png' },
        frameRate: 1,
        repeat: -1,
      },
    ],
  },

  potato_mine: {
    id: 'potato_mine',
    name: '土豆地雷',
    description: '需要时间准备，踩上的僵尸会被炸成灰',
    cost: 25,
    health: 300,
    cooldown: 30,
    attackDamage: 1800,
    specialEffects: ['explosion', 'armed'],
    spriteSheet: 'plants/potato_mine',
    animations: [
      { key: 'potato_mine_idle', frames: { start: 0, end: 0, prefix: '', suffix: '' }, frameRate: 1, repeat: -1 }
    ]
  },

  jalapeno: {
    id: 'jalapeno',
    name: '火爆辣椒',
    description: '消灭整整一排的僵尸',
    cost: 125,
    health: 300,
    cooldown: 50,
    attackDamage: 1800,
    specialEffects: ['lane_explosion'],
    spriteSheet: 'plants/jalapeno',
    animations: [
      { key: 'jalapeno_idle', frames: { start: 0, end: 0, prefix: '', suffix: '' }, frameRate: 1, repeat: -1 }
    ]
  },

  squash: {
    id: 'squash',
    name: '窝瓜',
    description: '压扁靠近的第一个僵尸',
    cost: 50,
    health: 300,
    cooldown: 30,
    attackDamage: 1800,
    specialEffects: ['crush'],
    spriteSheet: 'plants/squash',
    animations: [
      { key: 'squash_idle', frames: { start: 0, end: 0, prefix: '', suffix: '' }, frameRate: 1, repeat: -1 }
    ]
  }
};

// 为已有植物批量添加默认放置规则
Object.values(plantConfigs).forEach((p) => {
  if (!p.placement) p.placement = ['grass', 'lilypad'];
});

/**
 * 僵尸配置数据
 */
export const zombieConfigs: Record<string, ZombieConfig> = {
  normal: {
    id: 'normal',
    name: '普通僵尸',
    description: '最常见的僵尸',
    health: 200,
    speed: 20, // 像素/秒
    damage: 100,
    attackInterval: 1000,
    spriteSheet: 'zombies/normal',
    animations: createZombieAnimations('normal'),
  },

  conehead: {
    id: 'conehead',
    name: '路障僵尸',
    description: '头戴路障，生命值更高',
    health: 200,
    speed: 20,
    damage: 100,
    attackInterval: 1000,
    armor: 370,
    armorType: 'cone',
    spriteSheet: 'zombies/conehead',
    animations: createZombieAnimations('conehead'),
  },

  buckethead: {
    id: 'buckethead',
    name: '铁桶僵尸',
    description: '头戴铁桶，非常坚固',
    health: 200,
    speed: 20,
    damage: 100,
    attackInterval: 1000,
    armor: 1100,
    armorType: 'bucket',
    spriteSheet: 'zombies/buckethead',
    animations: createZombieAnimations('buckethead'),
  },

  pole_vaulting: {
    id: 'pole_vaulting',
    name: '撑杆跳僵尸',
    description: '撑杆跳过第一个植物',
    health: 340,
    speed: 40, // 移动更快
    damage: 100,
    attackInterval: 1000,
    abilities: ['pole_vault'],
    spriteSheet: 'zombies/pole_vaulting',
    animations: [
      ...createZombieAnimations('pole_vaulting'),
      {
        key: 'pole_vaulting_vault',
        frames: {
          start: 0,
          end: 15,
          prefix: 'pole_vaulting_vault_',
          suffix: '.png',
        },
        frameRate: 20,
        repeat: 0,
      },
    ],
  },

  newspaper: {
    id: 'newspaper',
    name: '读报僵尸',
    description: '报纸被打掉后狂暴',
    health: 200,
    speed: 20,
    damage: 100,
    attackInterval: 1000,
    armor: 150,
    abilities: ['newspaper_rage'],
    spriteSheet: 'zombies/newspaper',
    animations: [
      ...createZombieAnimations('newspaper'),
      {
        key: 'newspaper_rage',
        frames: {
          start: 0,
          end: 10,
          prefix: 'newspaper_rage_',
          suffix: '.png',
        },
        frameRate: 15,
        repeat: 0,
      },
    ],
  },

  screendoor: {
    id: 'screendoor',
    name: '铁栅门僵尸',
    description: '铁栅门可阻挡穿刺攻击',
    health: 200,
    speed: 20,
    damage: 100,
    attackInterval: 1000,
    armor: 1670,
    armorType: 'screenDoor',
    abilities: ['shield_block'],
    spriteSheet: 'zombies/screendoor',
    animations: createZombieAnimations('screendoor'),
  },
};

/**
 * 关卡配置数据
 */
export const levelConfigs: Record<string, LevelConfig> = {
  '1-1': {
    id: '1-1',
    name: '草坪日昼',
    world: 1,
    level: 1,
    description: '欢迎来到你的草坪！',
    availablePlants: ['sunflower', 'peashooter'],
    zombieTypes: ['normal'],
    initialSun: 150,
    background: 'day-grass',
    waves: [
      {
        waveNumber: 1,
        isFlagWave: false,
        zombies: [{ type: 'normal', count: 1, delay: 0 }],
        timeBeforeWave: 30000,
      },
      {
        waveNumber: 2,
        isFlagWave: false,
        zombies: [{ type: 'normal', count: 2, delay: 5000 }],
        timeBeforeWave: 25000,
      },
      {
        waveNumber: 3,
        isFlagWave: true,
        zombies: [
          { type: 'normal', count: 3, delay: 3000 },
          { type: 'normal', count: 2, delay: 8000 },
        ],
        timeBeforeWave: 25000,
      },
    ],
  },

  '1-2': {
    id: '1-2',
    name: '草坪日昼 2',
    world: 1,
    level: 2,
    description: '更多僵尸正在接近！',
    availablePlants: ['sunflower', 'peashooter', 'wallnut'],
    zombieTypes: ['normal', 'conehead'],
    initialSun: 150,
    background: 'day-grass',
    waves: [
      {
        waveNumber: 1,
        isFlagWave: false,
        zombies: [{ type: 'normal', count: 2, delay: 3000 }],
        timeBeforeWave: 30000,
      },
      {
        waveNumber: 2,
        isFlagWave: false,
        zombies: [
          { type: 'normal', count: 3, delay: 3000 },
          { type: 'conehead', count: 1, delay: 8000 },
        ],
        timeBeforeWave: 25000,
      },
      {
        waveNumber: 3,
        isFlagWave: false,
        zombies: [
          { type: 'normal', count: 4, delay: 2000 },
          { type: 'conehead', count: 1, delay: 6000 },
        ],
        timeBeforeWave: 25000,
      },
      {
        waveNumber: 4,
        isFlagWave: true,
        zombies: [
          { type: 'normal', count: 5, delay: 2000 },
          { type: 'conehead', count: 2, delay: 5000 },
          { type: 'normal', count: 3, delay: 10000 },
        ],
        timeBeforeWave: 25000,
      },
    ],
  },

  '1-3': {
    id: '1-3',
    name: '草坪日昼 3',
    world: 1,
    level: 3,
    description: '铁桶僵尸来了！',
    availablePlants: ['sunflower', 'peashooter', 'wallnut', 'cherry_bomb'],
    zombieTypes: ['normal', 'conehead', 'buckethead'],
    initialSun: 200,
    background: 'day-grass',
    waves: [
      {
        waveNumber: 1,
        isFlagWave: false,
        zombies: [
          { type: 'normal', count: 3, delay: 2000 },
          { type: 'conehead', count: 1, delay: 8000 },
        ],
        timeBeforeWave: 30000,
      },
      {
        waveNumber: 2,
        isFlagWave: false,
        zombies: [
          { type: 'normal', count: 4, delay: 2000 },
          { type: 'buckethead', count: 1, delay: 10000 },
        ],
        timeBeforeWave: 25000,
      },
      {
        waveNumber: 3,
        isFlagWave: false,
        zombies: [
          { type: 'normal', count: 5, delay: 1500 },
          { type: 'conehead', count: 2, delay: 6000 },
          { type: 'buckethead', count: 1, delay: 12000 },
        ],
        timeBeforeWave: 25000,
      },
      {
        waveNumber: 4,
        isFlagWave: true,
        zombies: [
          { type: 'normal', count: 6, delay: 1500 },
          { type: 'conehead', count: 3, delay: 4000 },
          { type: 'buckethead', count: 2, delay: 8000 },
        ],
        timeBeforeWave: 25000,
      },
    ],
  },

  '1-4': {
    id: '1-4',
    name: '泳池大作战',
    world: 1,
    level: 4,
    description: '小心中间的水域！',
    availablePlants: ['lilypad', 'sunflower', 'peashooter', 'wallnut'],
    zombieTypes: ['normal', 'conehead', 'buckethead'],
    initialSun: 200,
    background: 'pool',
    waves: [
      {
        waveNumber: 1,
        isFlagWave: false,
        zombies: [
          { type: 'normal', count: 3, delay: 2000, row: 2 },
          { type: 'normal', count: 2, delay: 5000, row: 3 },
        ],
        timeBeforeWave: 30000,
      },
      {
        waveNumber: 2,
        isFlagWave: true,
        zombies: [
          { type: 'normal', count: 5, delay: 1000 },
          { type: 'conehead', count: 2, delay: 3000 },
        ],
        timeBeforeWave: 25000,
      },
    ],
  },
};
