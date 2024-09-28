export interface TalentNode {
  name: string;
  children: (string | TalentNode)[];
  initial?: string;
}

export const talents: TalentNode[] = [
  {
    name: "hololive",
    children: [
      {
        name: "ホロライブ",
        children: [
          {
            name: "公式",
            children: ["ホロライブ", "Blue Journey"],
          },
          {
            name: "0期生",
            initial: "0",
            children: ["ときのそら", "ロボ子さん", "AZKi", "さくらみこ", "星街すいせい"],
          },
          {
            name: "1期生",
            initial: "1",
            children: ["アキロゼ", "赤井はあと", "白上フブキ", "夏色まつり"],
          },
          {
            name: "2期生",
            initial: "2",
            children: ["紫咲シオン", "百鬼あやめ", "癒月ちょこ", "大空スバル"],
          },
          {
            name: "ゲーマーズ",
            initial: "G",
            children: ["白上フブキ", "大神ミオ", "猫又おかゆ", "戌神ころね"],
          },
          {
            name: "3期生",
            initial: "3",
            children: ["兎田ぺこら", "不知火フレア", "白銀ノエル", "宝鐘マリン"],
          },
          {
            name: "4期生",
            initial: "4",
            children: ["天音かなた", "角巻わため", "常闇トワ", "姫森ルーナ"],
          },
          {
            name: "5期生",
            initial: "5",
            children: ["雪花ラミィ", "桃鈴ねね", "獅白ぼたん", "尾丸ポルカ"],
          },
          {
            name: "holoX",
            initial: "X",
            children: ["ラプラス", "鷹嶺ルイ", "博衣こより", "沙花叉クロヱ", "風真いろは"],
          },
        ],
      },
      {
        name: "hololive DEV_IS",
        children: [
          {
            name: "公式",
            children: ["hololive DEV_IS"],
          },
          {
            name: "ReGLOSS",
            children: ["火威青", "音乃瀬奏", "一条莉々華", "儒烏風亭らでん", "轟はじめ"],
          },
        ],
      },
      {
        name: "ホロライブEnglish",
        children: [
          {
            name: "公式",
            children: ["holo EN"],
          },
          {
            name: "Myth",
            children: ["Calli", "Kiara", "Ina", "Gura", "Amelia"],
          },
          {
            name: "Promise",
            children: ["IRyS", "Fauna", "Kronii", "Mumei", "Baelz"],
          },
          {
            name: "Advent",
            children: ["Shiori", "Bijou", "Nerissa", "FUWAMOCO"],
          },
          {
            name: "Justice",
            children: ["Elizabeth", "Gigi", "Cecilia", "Raora"],
          },
        ],
      },
      {
        name: "ホロライブインドネシア",
        children: [
          {
            name: "公式",
            children: ["holo ID"],
          },
          {
            name: "1期生",
            children: ["Risu", "Moona", "Iofi"],
          },
          {
            name: "2期生",
            children: ["Ollie", "Anya", "Reine"],
          },
          {
            name: "3期生",
            children: ["Zeta", "Kaela", "Kobo"],
          },
        ],
      },
    ],
  },
  {
    name: "にじさんじ",
    children: [
      {
        name: "JP",
        children: [
          {
            name: "公式",
            children: [
              "にじさんじ公式",
              "ROF-MAO",
              "ChroNoiR",
              "七次元生徒会！",
              "Nornis",
              "さくゆい",
              "Sepiast-セピアスト-",
              "JuvveL",
            ],
          },
          {
            name: "2018年",
            children: [
              {
                name: "1期生",
                initial: "1",
                children: ["える", "静凛", "渋谷ハジメ", "月ノ美兎", "樋口楓", "モイラ"],
              },
              {
                name: "2期生",
                initial: "2",
                children: [
                  "家長むぎ",
                  "宇志海いちご",
                  "ギルザレンⅢ世",
                  "剣持刀也",
                  "伏見ガク",
                  "文野環",
                  "物述有栖",
                  "森中花咲",
                  "夕陽リリ",
                ],
              },
              {
                name: "ゲーマーズ",
                initial: "G",
                children: [
                  "赤羽葉子",
                  "叶",
                  "笹木咲",
                  "本間ひまわり",
                  "葛葉",
                  "椎名唯華",
                  "魔界ノりりむ",
                ],
              },
              {
                name: "SEEDs1期生",
                initial: "S1",
                children: [
                  "卯月コウ",
                  "シスター・クレア",
                  "鈴木勝",
                  "ドーラ",
                  "轟京子",
                  "花畑チャイカ",
                  "社築",
                  "緑仙",
                  "春崎エアル",
                ],
              },
              {
                name: "SEEDs2期生1",
                initial: "S2",
                children: ["飛鳥ひな", "雨森小夜", "神田笑一", "鷹宮リオン", "舞元啓介"],
              },
              {
                name: "SEEDs2期生2",
                initial: "S2",
                children: ["桜凛月", "ジョー・力一", "でびでび・でびる", "町田ちま", "竜胆尊"],
              },
              {
                name: "SEEDs2期生3",
                initial: "S2",
                children: ["黒井しば", "ベルモンド・バンデラス", "矢車りね", "夢追翔"],
              },
            ],
          },
          {
            name: "2019年",
            children: [
              {
                name: "みれロア",
                children: ["夢月ロア"],
              },
              {
                name: "はるみや&紡",
                children: ["小野町春香", "語部紡", "瀬戸美夜子"],
              },
              {
                name: "さんばか",
                children: ["アンジュ・カトリーナ", "戌亥とこ", "リゼ・ヘルエスタ"],
              },
              {
                name: "紅ズワイガニ",
                children: ["愛園愛美", "三枝明那"],
              },
              {
                name: "まひるる",
                children: ["雪城眞尋"],
              },
              {
                name: "LvEx",
                children: ["エクス・アルビオ", "レヴィ・エリファ"],
              },
              {
                name: "マジョマリティ",
                children: ["ニュイ・ソシエール", "葉山舞鈴"],
              },
              {
                name: "SMC組",
                children: ["加賀美ハヤト", "葉加瀬冬雪", "夜見れな"],
              },
              {
                name: "ぶるーず",
                children: ["アルス・アルマル"],
              },
              {
                name: "ぽさんけ",
                children: ["天宮こころ", "エリー・コニファー", "ラトナ・プティ"],
              },
              {
                name: "チューリップ組",
                children: ["シェリン・バーガンディ", "健屋花那", "早瀬走"],
              },
              {
                name: "織姫星",
                children: ["フミ", "星川サラ", "山神カルタ"],
              },
              {
                name: "赤の組織",
                children: ["えま★おうがすと", "魔使マオ", "ルイス・キャミー"],
              },
              {
                name: "夜王国",
                children: ["グウェル・オス・ガール", "白雪巴", "不破湊"],
              },
              {
                name: "まななつ",
                children: ["来栖夏芽", "奈羅花", "ましろ爻"],
              },
            ],
          },
          {
            name: "2020年",
            children: [
              {
                name: "メイフ",
                children: ["イブラヒム", "フレン・E・ルスタリオ"],
              },
              {
                name: "VΔLZ",
                children: ["VΔLZ", "甲斐田晴", "弦月藤士郎", "長尾景"],
              },
              {
                name: "きらめろ",
                children: ["空星きらめ"],
              },
              {
                name: "世怜音演劇同好会",
                children: ["北小路ヒスイ", "周央サンゴ", "東堂コハク", "西園チグサ"],
              },
            ],
          },
          {
            name: "2021年",
            children: [
              {
                name: "エデン組",
                children: [
                  "オリバー・エバンス",
                  "レイン・パターソン",
                  "レオス・ヴィンセント",
                  "ローレン・イロアス",
                ],
              },
            ],
          },
          {
            name: "2022年",
            children: [
              {
                name: "Ranunculus",
                children: ["天ヶ瀬むゆ", "海妹四葉", "先斗寧"],
              },
              "壱百満天原サロメ",
              {
                name: "VOLTACTION",
                children: [
                  "VOLTACTION",
                  "四季凪アキラ",
                  "セラフ・ダズルガーデン",
                  "風楽奏斗",
                  "渡会雲雀",
                ],
              },
            ],
          },
          {
            name: "2023年",
            children: [
              {
                name: "Idios",
                children: [
                  "五十嵐梨花",
                  "石神のぞみ",
                  "鏑木ろこ",
                  "倉持めると",
                  "小清水透",
                  "獅子堂あかり",
                  "ソフィア・ヴァレンタイン",
                ],
              },
              {
                name: "Oriens",
                children: ["赤城ウェン", "宇佐美リト", "佐伯イッテツ", "緋八マナ"],
              },
              {
                name: "Dytica",
                children: ["伊波ライ", "小柳ロウ", "星導ショウ", "叢雲カゲツ"],
              },
              {
                name: "Krisis",
                children: ["栞葉るり", "立伝都々", "ミラン・ケストレル"],
              },
            ],
          },
          {
            name: "2024年",
            children: [
              {
                name: "3SKM",
                children: ["3SKM", "魁星", "北見遊征", "榊ネス"],
              },
              {
                name: "いずれ菖蒲か杜若",
                children: [
                  "いずれ菖蒲か杜若",
                  "綺沙良",
                  "梢桃音",
                  "司賀りこ",
                  "珠乃井ナナ",
                  "ルンルン",
                ],
              },
              {
                name: "Speciale",
                children: [
                  "Speciale",
                  "雲母たまこ",
                  "早乙女ベリー",
                  "酒寄颯馬",
                  "渚トラウト",
                  "七瀬すず菜",
                ],
              },
            ],
          },
        ],
      },
      {
        name: "EN",
        children: [
          {
            name: "公式",
            children: ["NIJISANJI EN"],
          },
          {
            name: "LazuLight",
            children: ["エリーラ ペンドラ", "フィナーナ 竜宮"],
          },
          {
            name: "OBSYDIA",
            children: ["ペトラ グリン", "ロゼミ ラブロック"],
          },
          {
            name: "Ethyria",
            children: ["エナー・アールウェット", "ミリー・パフェ", "遠藤霊夢"],
          },
          {
            name: "Luxiem",
            children: [
              "アイク・イーヴランド",
              "ルカ・カネシロ",
              "闇ノシュウ",
              "ヴォックス・アクマ",
            ],
          },
          {
            name: "Noctyx",
            children: [
              "アルバーン・ノックス",
              "ファルガー・オーヴィド",
              "サニー・ブリスコー",
              "浮奇・ヴィオレタ",
            ],
          },
          {
            name: "ILUNA",
            children: [
              "アイア アマレ",
              "アスター アルカディア",
              "マリア マリオネット",
              "レン ゾット",
              "スカーレ ヨナグニ",
            ],
          },
          {
            name: "XSOLEIL",
            children: [
              "ドッピオ ドロップサイト",
              "虎姫 コトカ",
              "狂蘭 メロコ",
              "ヴェール ヴァーミリオン",
            ],
          },
          {
            name: "Krisis",
            children: ["ベンタクロウ ブリンガー", "ヴェザリウス バンデージ", "ユウ Q ウィルソン"],
          },
          {
            name: "TTT",
            children: ["クロード クローマーク", "中里 苦無", "ヴィクトリア ブライトシールド"],
          },
          {
            name: "Denauth",
            children: ["クララ チャームウッド", "凉舞 バレンウォート", "トゥイスティー アマノザコ"],
          },
        ],
      },
      {
        name: "KR",
        children: [
          { name: "1期生", children: ["ガオン", "ミン スゥーハ"] },
          { name: "2期生", children: ["ソ ナギ"] },
          { name: "3期生", children: ["明楽レイ", "イ ロハ"] },
          { name: "4期生", children: ["オ ジユ", "ヤン ナリ", "リュ ハリ"] },
          { name: "5期生", children: ["セフィナ", "バン ハダ"] },
          { name: "6期生", children: ["ナ セラ", "ハ ユン"] },
        ],
      },
      {
        name: "ID",
        children: [
          { name: "1期生", children: ["ハナ マキア"] },
          { name: "2期生", children: ["ライ ガリレイ"] },
          { name: "3期生", children: ["ライラ アルストロエメリア"] },
          { name: "4期生", children: ["エトナ クリムソン"] },
          { name: "5期生", children: ["デレム カド", "ナギサ アルシニア"] },
        ],
      },
    ],
  },
];
